const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

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

module.exports = router;
