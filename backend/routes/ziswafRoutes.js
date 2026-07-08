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

module.exports = router;
