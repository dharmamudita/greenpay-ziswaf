const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Apply auth and admin check to all admin routes
router.use(authenticateToken);
router.use(requireRole('admin'));

// 1. GET /api/admin/stats (Realtime Dashboard Stats)
router.get('/stats', async (req, res) => {
  try {
    const pendingDepositsQuery = pool.query("SELECT COUNT(*) FROM waste_deposits WHERE status = 'pending'");
    const productsCountQuery = pool.query("SELECT COUNT(*) FROM products");
    const successfulDonationsQuery = pool.query("SELECT COUNT(*) FROM donations WHERE status = 'success'");

    const [depositsResult, productsResult, donationsResult] = await Promise.all([
      pendingDepositsQuery,
      productsCountQuery,
      successfulDonationsQuery
    ]);

    res.json({
      pendingDeposits: parseInt(depositsResult.rows[0].count),
      productsCount: parseInt(productsResult.rows[0].count),
      successfulDonations: parseInt(donationsResult.rows[0].count)
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. GET /api/admin/users (Get all users for management)
router.get('/users', async (req, res) => {
  try {
    const query = `
      SELECT id, email, display_name, role, photo_url, created_at, is_active
      FROM users
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. PUT /api/admin/users/:id/role (Change user role)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'distrik', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid.' });
    }

    const query = `
      UPDATE users
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, display_name, role
    `;
    const result = await pool.query(query, [role, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    res.json({ message: 'Role berhasil diperbarui', user: result.rows[0] });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
