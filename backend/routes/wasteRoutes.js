const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/waste/locations — Get waste bank locations
router.get('/locations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM waste_locations WHERE status = $1 ORDER BY name', ['active']);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil lokasi bank sampah.' });
  }
});

// POST /api/waste/deposit — Submit waste deposit
router.post('/deposit', authenticateToken, async (req, res) => {
  try {
    const { location_id, waste_type, weight_kg, photo_url, notes } = req.body;

    // Calculate points (varies by type)
    const pointsMap = { plastik: 10, kertas: 8, logam: 15, kaca: 5, elektronik: 25, organik: 3 };
    const pointsPerKg = pointsMap[waste_type] || 5;
    const pointsEarned = Math.floor(weight_kg * pointsPerKg);

    const result = await pool.query(
      `INSERT INTO waste_deposits (user_id, location_id, waste_type, weight_kg, points_earned, photo_url, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, location_id, waste_type, weight_kg, pointsEarned, photo_url, notes]
    );

    res.status(201).json({ message: 'Setoran berhasil diajukan!', deposit: result.rows[0], pointsEarned });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Gagal mengajukan setoran.' });
  }
});

// PUT /api/waste/verify/:id — Distrik: Verify deposit
router.put('/verify/:id', authenticateToken, requireRole('distrik', 'admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    const deposit = await pool.query('SELECT * FROM waste_deposits WHERE id = $1', [req.params.id]);
    if (deposit.rows.length === 0) return res.status(404).json({ error: 'Setoran tidak ditemukan.' });

    const d = deposit.rows[0];
    await pool.query(
      'UPDATE waste_deposits SET status = $1, verified_by = $2 WHERE id = $3',
      [status, req.user.id, req.params.id]
    );

    if (status === 'verified') {
      // Award points and update stats
      await pool.query('UPDATE users SET green_points = green_points + $1, total_waste = total_waste + $2, co2_reduced = co2_reduced + $3 WHERE id = $4',
        [d.points_earned, d.weight_kg, d.weight_kg * 2.5, d.user_id]);
      await pool.query(
        `INSERT INTO green_point_history (user_id, points, type, source, description) VALUES ($1, $2, 'earn', 'waste_deposit', $3)`,
        [d.user_id, d.points_earned, `Setor ${d.waste_type} ${d.weight_kg}kg`]
      );

      // Emit Socket.io events for Real-Time UI updates
      if (req.io) {
        req.io.emit('GLOBAL_IMPACT_UPDATED');
        req.io.to(`user_${d.user_id}`).emit('USER_PROFILE_UPDATED');
      }
    }

    res.json({ message: `Setoran ${status === 'verified' ? 'diverifikasi' : 'ditolak'}.` });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memverifikasi setoran.' });
  }
});

// GET /api/waste/deposits — Get user deposits
router.get('/deposits', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT wd.*, wl.name as location_name FROM waste_deposits wd 
       JOIN waste_locations wl ON wd.location_id = wl.id 
       WHERE wd.user_id = $1 ORDER BY wd.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil riwayat setoran.' });
  }
});

// GET /api/waste/pending — Distrik: Get pending deposits
router.get('/pending', authenticateToken, requireRole('distrik', 'admin'), async (req, res) => {
  try {
    let query = `
      SELECT wd.*, u.display_name as user_name, wl.name as location_name 
      FROM waste_deposits wd JOIN users u ON wd.user_id = u.id 
      JOIN waste_locations wl ON wd.location_id = wl.id 
      WHERE wd.status = 'pending'
    `;
    const params = [];

    if (req.user.role === 'distrik') {
      query += ` AND wl.managed_by = $1`;
      params.push(req.user.id);
    }
    
    query += ` ORDER BY wd.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data verifikasi.' });
  }
});

module.exports = router;
