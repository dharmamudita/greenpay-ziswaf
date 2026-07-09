const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/impact/passport — Get user's Impact Passport data
router.get('/passport', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // User stats
    const user = await pool.query(
      'SELECT display_name, photo_url, green_points, total_donation, total_waste, trees_planted, co2_reduced, created_at FROM users WHERE id = $1',
      [userId]
    );

    // Waste breakdown
    const wasteBreakdown = await pool.query(
      `SELECT waste_type, SUM(weight_kg) as total_kg, COUNT(*) as count 
       FROM waste_deposits WHERE user_id = $1 AND status = 'verified' GROUP BY waste_type`,
      [userId]
    );

    // Donation breakdown
    const donationBreakdown = await pool.query(
      `SELECT zp.category, SUM(d.amount) as total FROM donations d 
       JOIN ziswaf_programs zp ON d.program_id = zp.id 
       WHERE d.user_id = $1 AND d.status = 'success' GROUP BY zp.category`,
      [userId]
    );

    // Recent activities
    const recentActivities = await pool.query(
      'SELECT * FROM green_point_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    // Badges calculation
    const badges = [];
    const u = user.rows[0];
    if (u.total_waste > 0) badges.push({ name: 'Green Starter', icon: '🌱', desc: 'Pertama kali setor sampah' });
    if (u.total_waste >= 100) badges.push({ name: 'Eco Warrior', icon: '⚔️', desc: 'Setor 100kg sampah' });
    if (u.total_donation >= 1000000) badges.push({ name: 'ZISWAF Hero', icon: '💎', desc: 'Donasi > Rp 1 juta' });
    if (u.trees_planted >= 10) badges.push({ name: 'Tree Planter', icon: '🌳', desc: 'Tanam 10 pohon' });
    if (u.co2_reduced >= 1000) badges.push({ name: 'Carbon Neutral', icon: '🌍', desc: 'Kurangi 1 ton CO₂' });
    if (u.green_points >= 5000) badges.push({ name: 'Green Legend', icon: '👑', desc: 'Kumpulkan 5000 GP' });

    res.json({
      user: u,
      wasteBreakdown: wasteBreakdown.rows,
      donationBreakdown: donationBreakdown.rows,
      recentActivities: recentActivities.rows,
      badges,
    });
  } catch (error) {
    console.error('Impact passport error:', error);
    res.status(500).json({ error: 'Gagal mengambil data Impact Passport.' });
  }
});

// GET /api/impact/dashboard — Get global dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
        (SELECT COALESCE(SUM(total_waste), 0) FROM users) as total_waste_kg,
        (SELECT COALESCE(SUM(total_donation), 0) FROM users) as total_donation,
        (SELECT COALESCE(SUM(trees_planted), 0) FROM users) as total_trees,
        (SELECT COALESCE(SUM(co2_reduced), 0) FROM users) as total_co2_reduced,
        (SELECT COUNT(DISTINCT umkm_name) FROM products WHERE is_active = true) as total_umkm
    `);

    // Monthly trend
    const monthlyTrend = await pool.query(`
      SELECT DATE_TRUNC('month', created_at) as month, 
             SUM(weight_kg) as waste_kg, COUNT(*) as deposit_count
      FROM waste_deposits WHERE status = 'verified' 
      GROUP BY DATE_TRUNC('month', created_at) ORDER BY month DESC LIMIT 6
    `);

    res.json({ stats: stats.rows[0], monthlyTrend: monthlyTrend.rows });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data dashboard.' });
  }
});

// GET /api/impact/leaderboard — Get Top Users by Green Points
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, display_name, photo_url, green_points, co2_reduced FROM users WHERE role = $1 ORDER BY green_points DESC LIMIT 10',
      ['user']
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data leaderboard.' });
  }
});

module.exports = router;
