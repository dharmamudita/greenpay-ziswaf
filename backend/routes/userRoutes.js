const express = require('express');
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me — Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, passport_id, email, display_name, role, photo_url, cover_photo_url, phone, address, green_points, total_donation, total_waste, trees_planted, co2_reduced, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data profil.' });
  }
});

// PUT /api/users/me — Update profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { display_name, phone, address, photo_url, email, cover_photo_url } = req.body;
    
    // Check if new email already exists (if email is provided and different from current)
    if (email && email !== req.user.email) {
      const checkEmail = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (checkEmail.rows.length > 0) {
        return res.status(400).json({ error: 'Email sudah digunakan oleh akun lain.' });
      }
    }

    const result = await pool.query(
      `UPDATE users SET 
        display_name = COALESCE($1, display_name), 
        phone = COALESCE($2, phone), 
        address = COALESCE($3, address), 
        photo_url = COALESCE($4, photo_url), 
        email = COALESCE($5, email),
        cover_photo_url = COALESCE($6, cover_photo_url),
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 RETURNING id, passport_id, email, display_name, role, photo_url, cover_photo_url, phone, address, green_points`,
      [display_name, phone, address, photo_url, email, cover_photo_url, req.user.id]
    );
    res.json({ message: 'Profil berhasil diperbarui.', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui profil.' });
  }
});

// PUT /api/users/me/password — Change password
router.put('/me/password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User tidak ditemukan.' });

    const validPassword = await bcrypt.compare(oldPassword, userResult.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Password lama salah.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({ message: 'Password berhasil diubah.' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengubah password.' });
  }
});

// GET /api/users — Admin: Get all users
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, display_name, role, green_points, total_donation, total_waste, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data pengguna.' });
  }
});

// PUT /api/users/:id/role — Admin: Update user role
router.put('/:id/role', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    await pool.query('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [role, req.params.id]);
    res.json({ message: 'Role berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengubah role.' });
  }
});

module.exports = router;
