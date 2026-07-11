const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/ziswaf/programs — Get all programs
router.get('/programs', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM ziswaf_programs WHERE is_active = true';
    const params = [];
    if (category) {
      query += ' AND category = $1';
      params.push(category);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data program.' });
  }
});

// POST /api/ziswaf/programs — Create new program (Admin only)
router.post('/programs', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { title, description, category, target_amount, image_url } = req.body;
    
    if (!title || !category || !target_amount) {
      return res.status(400).json({ error: 'Judul, kategori, dan target donasi wajib diisi.' });
    }

    const result = await pool.query(
      `INSERT INTO ziswaf_programs (title, description, category, target_amount, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, category, target_amount, image_url, req.user.id]
    );

    res.status(201).json({ message: 'Program berhasil dibuat', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating ziswaf program:', error);
    res.status(500).json({ error: 'Gagal membuat program ZISWAF.' });
  }
});

// GET /api/ziswaf/stats — Get global stats
router.get('/stats', async (req, res) => {
  try {
    const statsQuery = await pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(weight_kg), 0) FROM waste_deposits WHERE status = 'verified') as total_waste,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE status = 'success') as total_fund,
        (SELECT COUNT(*) FROM products) as total_products
    `);
    res.json(statsQuery.rows[0]);
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ error: 'Gagal mengambil statistik global.' });
  }
});

// POST /api/ziswaf/donate — Create donation
router.post('/donate', authenticateToken, async (req, res) => {
  try {
    const { program_id, amount, payment_method, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO donations (user_id, program_id, amount, payment_method, status, notes) 
       VALUES ($1, $2, $3, $4, 'success', $5) RETURNING *`,
      [req.user.id, program_id, amount, payment_method || 'transfer', notes]
    );

    // Update program collected amount
    await pool.query(
      'UPDATE ziswaf_programs SET collected_amount = collected_amount + $1 WHERE id = $2',
      [amount, program_id]
    );

    // Update user total donation
    await pool.query(
      'UPDATE users SET total_donation = total_donation + $1 WHERE id = $2',
      [amount, req.user.id]
    );

    // Add green points (5 GP per Rp 10.000)
    const pointsEarned = Math.floor(amount / 10000) * 5;
    if (pointsEarned > 0) {
      await pool.query('UPDATE users SET green_points = green_points + $1 WHERE id = $2', [pointsEarned, req.user.id]);
      await pool.query(
        `INSERT INTO green_point_history (user_id, points, type, source, description) 
         VALUES ($1, $2, 'earn', 'donation', $3)`,
        [req.user.id, pointsEarned, `Donasi ZISWAF senilai Rp ${amount.toLocaleString()}`]
      );
    }

    // Emit Socket.io events for Real-Time UI updates
    if (req.io) {
      req.io.emit('GLOBAL_IMPACT_UPDATED'); // to update global dashboard
      req.io.to(`user_${req.user.id}`).emit('USER_PROFILE_UPDATED'); // to update specific user UI
    }

    // Create Notification
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, 'transaction')`,
      [req.user.id, 'Donasi ZISWAF Berhasil', `Alhamdulillah, donasi Rp ${amount.toLocaleString('id-ID')} telah diterima.`]
    );

    res.status(201).json({ message: 'Donasi berhasil!', donation: result.rows[0], pointsEarned });
  } catch (error) {
    console.error('Donate error:', error);
    res.status(500).json({ error: 'Gagal melakukan donasi.' });
  }
});

// GET /api/ziswaf/history — Get user donation history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, zp.title as program_title, zp.category FROM donations d 
       JOIN ziswaf_programs zp ON d.program_id = zp.id 
       WHERE d.user_id = $1 ORDER BY d.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil riwayat donasi.' });
  }
});

// GET /api/ziswaf/public-history — Get public donation history for transparency
router.get('/public-history', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.id, d.amount, d.created_at, zp.title as program_title,
      CASE 
        WHEN u.display_name IS NOT NULL THEN CONCAT(SUBSTRING(u.display_name, 1, 3), '***')
        ELSE 'Hamba Allah'
      END as masked_name
      FROM donations d
      JOIN ziswaf_programs zp ON d.program_id = zp.id
      JOIN users u ON d.user_id = u.id
      WHERE d.status = 'success'
      ORDER BY d.created_at DESC
      LIMIT 15
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching public history:', error);
    res.status(500).json({ error: 'Gagal mengambil riwayat publik.' });
  }
});

// GET /api/ziswaf/public-distributions — Get public distribution history for transparency
router.get('/public-distributions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT zd.*, zp.title as program_title, u.display_name as admin_name
      FROM ziswaf_distributions zd
      JOIN ziswaf_programs zp ON zd.program_id = zp.id
      JOIN users u ON zd.created_by = u.id
      ORDER BY zd.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching distributions:', error);
    res.status(500).json({ error: 'Gagal mengambil data penyaluran.' });
  }
});

// POST /api/ziswaf/distributions — Create new distribution (Admin only)
router.post('/distributions', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { program_id, amount, description, image_url } = req.body;
    
    if (!program_id || !amount || !description) {
      return res.status(400).json({ error: 'Program, nominal, dan deskripsi wajib diisi.' });
    }

    const result = await pool.query(
      `INSERT INTO ziswaf_distributions (program_id, amount, description, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [program_id, amount, description, image_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&q=80', req.user.id]
    );

    // Note: If you want to deduct from collected_amount, you can do it here. 
    // But usually, collected_amount is total ever collected, so we leave it as is.
    
    res.status(201).json({ message: 'Bukti penyaluran berhasil disimpan', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating distribution:', error);
    res.status(500).json({ error: 'Gagal menyimpan bukti penyaluran.' });
  }
});

module.exports = router;
