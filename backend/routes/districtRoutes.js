const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// POST /api/distrik/register — Submit request to become a district
router.post('/register', authenticateToken, async (req, res) => {
  const { name, address, phone } = req.body;
  
  if (!name || !address || !phone) {
    return res.status(400).json({ error: 'Nama, alamat, dan nomor HP wajib diisi' });
  }

  try {
    // Check if there is already a pending request
    const existing = await pool.query(
      "SELECT id FROM district_requests WHERE user_id = $1 AND status = 'pending'",
      [req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Anda sudah memiliki pengajuan yang sedang diproses.' });
    }

    // Check if user is already a district
    const user = await pool.query("SELECT role FROM users WHERE id = $1", [req.user.id]);
    if (user.rows[0].role === 'distrik') {
      return res.status(400).json({ error: 'Anda sudah terdaftar sebagai Distrik.' });
    }

    const result = await pool.query(
      `INSERT INTO district_requests (user_id, name, address, phone, status) 
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [req.user.id, name, address, phone]
    );

    res.status(201).json({ message: 'Pengajuan berhasil dikirim', data: result.rows[0] });
  } catch (error) {
    console.error('Error submitting district request:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// GET /api/distrik/status — Get current user's district request status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM district_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.json({ status: 'unregistered' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting district status:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// GET /api/distrik/admin/requests — Admin only: view pending requests
router.get('/admin/requests', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dr.*, u.display_name, u.email 
      FROM district_requests dr
      JOIN users u ON dr.user_id = u.id
      WHERE dr.status = 'pending'
      ORDER BY dr.created_at ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching district requests:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// GET /api/distrik/admin/requests/history — Admin only: view processed requests (history)
router.get('/admin/requests/history', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dr.*, u.display_name, u.email 
      FROM district_requests dr
      JOIN users u ON dr.user_id = u.id
      WHERE dr.status != 'pending'
      ORDER BY dr.updated_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching district request history:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// PUT /api/distrik/admin/requests/:id — Admin only: approve/reject request
router.put('/admin/requests/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update request status
    const reqResult = await client.query(
      "UPDATE district_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    if (reqResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
    }

    const requestData = reqResult.rows[0];

    // 2. If approved, create waste_location and update user role
    if (status === 'approved') {
      // Create waste location
      await client.query(
        `INSERT INTO waste_locations (name, address, phone, managed_by, status)
         VALUES ($1, $2, $3, $4, 'active')`,
        [requestData.name, requestData.address, requestData.phone, requestData.user_id]
      );

      // Update user role to distrik if they are just a 'user'
      await client.query(
        "UPDATE users SET role = 'distrik' WHERE id = $1 AND role = 'user'",
        [requestData.user_id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: `Pengajuan berhasil di-${status}` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating district request:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  } finally {
    client.release();
  }
});

// ==========================================
// DISTRIK DASHBOARD & HISTORY
// ==========================================

// GET /api/distrik/dashboard - Get real-time stats for district
router.get('/dashboard', authenticateToken, requireRole('distrik'), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Get total verified waste for capacity
    const capRes = await pool.query(`
      SELECT COALESCE(SUM(wd.weight_kg), 0) as capacity_used 
      FROM waste_deposits wd 
      JOIN waste_locations wl ON wd.location_id = wl.id 
      WHERE wl.managed_by = $1 AND wd.status = 'verified'
    `, [userId]);
    const capacityUsed = parseFloat(capRes.rows[0].capacity_used);

    // 2. Get pending count
    const penRes = await pool.query(`
      SELECT COUNT(*) as pending_count 
      FROM waste_deposits wd 
      JOIN waste_locations wl ON wd.location_id = wl.id 
      WHERE wl.managed_by = $1 AND wd.status = 'pending'
    `, [userId]);
    const pendingCount = parseInt(penRes.rows[0].pending_count);

    // 3. Get recent pending (limit 3)
    const recRes = await pool.query(`
      SELECT wd.*, u.display_name as user_name 
      FROM waste_deposits wd 
      JOIN waste_locations wl ON wd.location_id = wl.id 
      JOIN users u ON wd.user_id = u.id
      WHERE wl.managed_by = $1 AND wd.status = 'pending'
      ORDER BY wd.created_at ASC
      LIMIT 3
    `, [userId]);
    const recentPending = recRes.rows;

    // Hardcode capacityMax for now (e.g. 5000 kg)
    res.json({
      capacityUsed,
      capacityMax: 5000,
      pendingCount,
      recentPending
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// GET /api/distrik/history - Get all deposit history for district
router.get('/history', authenticateToken, requireRole('distrik'), async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`
      SELECT wd.*, u.display_name as user_name, u.photo_url as user_photo
      FROM waste_deposits wd 
      JOIN waste_locations wl ON wd.location_id = wl.id 
      JOIN users u ON wd.user_id = u.id
      WHERE wl.managed_by = $1
      ORDER BY wd.created_at DESC
    `, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// ==========================================
// DISTRICT PANEL NEW FEATURES
// ==========================================

// GET /api/distrik/profile - Get current district profile
router.get('/profile', authenticateToken, requireRole('distrik'), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM waste_locations WHERE managed_by = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profil distrik tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching district profile:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// PUT /api/distrik/profile - Update district profile and map coordinates
router.put('/profile', authenticateToken, requireRole('distrik'), async (req, res) => {
  const { name, address, phone, operating_hours, latitude, longitude } = req.body;
  try {
    const result = await pool.query(
      `UPDATE waste_locations 
       SET name = $1, address = $2, phone = $3, operating_hours = $4, latitude = $5, longitude = $6, updated_at = CURRENT_TIMESTAMP
       WHERE managed_by = $7 RETURNING *`,
      [name, address, phone, operating_hours, latitude, longitude, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profil distrik tidak ditemukan' });
    res.json({ message: 'Profil distrik berhasil diperbarui', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating district profile:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// GET /api/distrik/rewards - Get list of reward redemptions
router.get('/rewards', authenticateToken, requireRole('distrik'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT rr.id, rr.points_spent, rr.status, rr.created_at, rr.voucher_code,
             u.display_name as user_name, u.email as user_email,
             r.name as reward_name, r.image_url as reward_image
      FROM reward_redemptions rr
      JOIN users u ON rr.user_id = u.id
      JOIN rewards r ON rr.reward_id = r.id
      ORDER BY rr.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reward redemptions:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// POST /api/distrik/rewards/verify - Verify and complete a voucher code
router.post('/rewards/verify', authenticateToken, requireRole('distrik'), async (req, res) => {
  const { voucher_code } = req.body;
  if (!voucher_code) return res.status(400).json({ error: 'Kode voucher wajib diisi' });

  try {
    const existing = await pool.query("SELECT id, status FROM reward_redemptions WHERE voucher_code = $1", [voucher_code]);
    
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Kode voucher tidak valid' });
    if (existing.rows[0].status === 'completed') return res.status(400).json({ error: 'Voucher ini sudah ditukarkan sebelumnya' });

    const result = await pool.query(
      "UPDATE reward_redemptions SET status = 'completed' WHERE voucher_code = $1 RETURNING *",
      [voucher_code]
    );

    res.json({ message: 'Voucher berhasil diverifikasi dan ditukarkan!', data: result.rows[0] });
  } catch (error) {
    console.error('Error verifying voucher:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// GET /api/distrik/history - Get deposit history for this district
router.get('/history', authenticateToken, requireRole('distrik'), async (req, res) => {
  try {
    const loc = await pool.query("SELECT id FROM waste_locations WHERE managed_by = $1", [req.user.id]);
    if (loc.rows.length === 0) return res.status(404).json({ error: 'Profil distrik tidak ditemukan' });

    const location_id = loc.rows[0].id;
    const result = await pool.query(`
      SELECT wd.*, u.display_name as user_name, u.photo_url as user_photo
      FROM waste_deposits wd
      JOIN users u ON wd.user_id = u.id
      WHERE wd.location_id = $1
      ORDER BY wd.created_at DESC
    `, [location_id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching deposit history:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// ==========================================
// TOKO / REWARDS MANAGEMENT
// ==========================================

// GET /api/distrik/toko/rewards - Get all rewards managed by this district
router.get('/toko/rewards', authenticateToken, requireRole('distrik'), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM rewards WHERE created_by = $1 AND is_active = true ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching district rewards:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// POST /api/distrik/toko/rewards - Create a new reward
router.post('/toko/rewards', authenticateToken, requireRole('distrik'), async (req, res) => {
  const { name, points_cost, stock, category, image_url } = req.body;
  
  if (!name || !points_cost || !category) {
    return res.status(400).json({ error: 'Nama, poin, dan kategori wajib diisi' });
  }

  let finalImageUrl = image_url || '';

  // Handle base64 image upload
  if (image_url && image_url.startsWith('data:image/')) {
    try {
      const matches = image_url.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        
        const fileName = `reward_${Date.now()}_${Math.floor(Math.random()*1000)}.${ext}`;
        const filePath = path.join(uploadDir, fileName);
        
        fs.writeFileSync(filePath, buffer);
        finalImageUrl = `http://localhost:5000/uploads/${fileName}`;
      }
    } catch (err) {
      console.error('Error saving base64 image:', err);
    }
  }

  try {
    const loc = await pool.query("SELECT name FROM waste_locations WHERE managed_by = $1", [req.user.id]);
    const distrik_name = loc.rows.length > 0 ? loc.rows[0].name : req.user.display_name;

    const result = await pool.query(
      `INSERT INTO rewards (name, points_cost, stock, category, image_url, distrik_name, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, points_cost, stock || 0, category, finalImageUrl, distrik_name, req.user.id]
    );

    res.status(201).json({ message: 'Reward berhasil ditambahkan', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal saat menambah reward' });
  }
});

// DELETE /api/distrik/toko/rewards/:id - Delete a reward
router.delete('/toko/rewards/:id', authenticateToken, requireRole('distrik'), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE rewards SET is_active = false WHERE id = $1 AND created_by = $2 RETURNING id",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reward tidak ditemukan atau bukan milik Anda' });
    }

    res.json({ message: 'Reward berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting reward:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// POST /api/distrik/rewards/verify - Verify and claim a voucher
router.post('/rewards/verify', authenticateToken, requireRole('distrik'), async (req, res) => {
  const { voucher_code } = req.body;
  if (!voucher_code) return res.status(400).json({ error: 'Kode voucher diperlukan.' });

  try {
    // 1. Find the redemption record
    const redemption = await pool.query(
      `SELECT rr.*, r.name as reward_name, r.created_by as reward_owner 
       FROM reward_redemptions rr 
       JOIN rewards r ON rr.reward_id = r.id 
       WHERE rr.voucher_code = $1`,
      [voucher_code.toUpperCase()]
    );

    if (redemption.rows.length === 0) {
      return res.status(404).json({ error: 'Kode voucher tidak valid.' });
    }

    const record = redemption.rows[0];

    // 2. Optional: Ensure the reward belongs to this distrik (so distrik A can't claim distrik B's vouchers)
    if (record.reward_owner !== req.user.id) {
      return res.status(403).json({ error: 'Voucher ini untuk hadiah dari Distrik lain.' });
    }

    // 3. Check status
    if (record.status === 'completed') {
      return res.status(400).json({ error: 'Voucher ini sudah pernah digunakan!' });
    }
    if (record.status !== 'pending') {
      return res.status(400).json({ error: `Voucher tidak dapat digunakan. Status: ${record.status}` });
    }

    // 4. Update status to completed
    await pool.query(
      'UPDATE reward_redemptions SET status = $1 WHERE id = $2',
      ['completed', record.id]
    );

    // 5. Notify the user
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, 'system')`,
      [record.user_id, 'Hadiah Berhasil Diklaim', `Voucher untuk hadiah '${record.reward_name}' telah berhasil diklaim di Distrik.`]
    );

    res.json({ message: 'Voucher berhasil diklaim', reward_name: record.reward_name });
  } catch (error) {
    console.error('Error verifying voucher:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

// GET /api/distrik/rewards/history - Get redemption history for a specific distrik
router.get('/rewards/history', authenticateToken, requireRole('distrik'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rr.*, r.name as reward_name, u.display_name as user_name, u.photo_url as user_photo 
       FROM reward_redemptions rr 
       JOIN rewards r ON rr.reward_id = r.id 
       JOIN users u ON rr.user_id = u.id 
       WHERE r.created_by = $1 AND rr.status = 'completed'
       ORDER BY rr.updated_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching redemption history:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

module.exports = router;
