const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/green-points/balance — Get current balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT green_points FROM users WHERE id = $1', [req.user.id]);
    res.json({ green_points: result.rows[0]?.green_points || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil saldo.' });
  }
});

// GET /api/green-points/history — Get point history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM green_point_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil riwayat poin.' });
  }
});

// GET /api/green-points/leaderboard — Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, display_name, photo_url, green_points, total_waste, trees_planted 
       FROM users WHERE role = 'user' AND is_active = true 
       ORDER BY green_points DESC LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil leaderboard.' });
  }
});

// GET /api/green-points/rewards — Get available rewards
router.get('/rewards', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rewards WHERE is_active = true AND stock > 0 ORDER BY points_cost ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data reward.' });
  }
});

// POST /api/green-points/redeem — Redeem reward
router.post('/redeem', authenticateToken, async (req, res) => {
  try {
    const { reward_id } = req.body;
    const reward = await pool.query('SELECT * FROM rewards WHERE id = $1 AND is_active = true', [reward_id]);
    if (reward.rows.length === 0) return res.status(404).json({ error: 'Reward tidak ditemukan.' });

    const r = reward.rows[0];
    const user = await pool.query('SELECT green_points FROM users WHERE id = $1', [req.user.id]);
    if (user.rows[0].green_points < r.points_cost) {
      return res.status(400).json({ error: 'Green Point tidak cukup.' });
    }
    if (r.stock <= 0) return res.status(400).json({ error: 'Stok reward habis.' });

    // Deduct points
    await pool.query('UPDATE users SET green_points = green_points - $1 WHERE id = $2', [r.points_cost, req.user.id]);
    await pool.query('UPDATE rewards SET stock = stock - 1 WHERE id = $1', [reward_id]);

    const result = await pool.query(
      `INSERT INTO reward_redemptions (user_id, reward_id, points_spent, status) VALUES ($1, $2, $3, 'approved') RETURNING *`,
      [req.user.id, reward_id, r.points_cost]
    );

    await pool.query(
      `INSERT INTO green_point_history (user_id, points, type, source, description) VALUES ($1, $2, 'spend', 'reward', $3)`,
      [req.user.id, -r.points_cost, `Tukar reward: ${r.name}`]
    );

    res.json({ message: 'Reward berhasil ditukar!', redemption: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menukar reward.' });
  }
});

module.exports = router;
