const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/marketplace/products — Get products
router.get('/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products WHERE is_active = true';
    const params = [];
    let paramIdx = 1;

    if (category) {
      query += ` AND category = $${paramIdx++}`;
      params.push(category);
    }
    if (search) {
      query += ` AND (name ILIKE $${paramIdx++} OR umkm_name ILIKE $${paramIdx++})`;
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY sold_count DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data produk.' });
  }
});

// POST /api/marketplace/order — Create order
router.post('/order', authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const product = await pool.query('SELECT * FROM products WHERE id = $1 AND is_active = true', [product_id]);
    if (product.rows.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan.' });

    const p = product.rows[0];
    if (p.stock < quantity) return res.status(400).json({ error: 'Stok tidak cukup.' });

    const totalPrice = p.price * quantity;
    const result = await pool.query(
      `INSERT INTO orders (user_id, product_id, quantity, total_price, status) VALUES ($1, $2, $3, $4, 'paid') RETURNING *`,
      [req.user.id, product_id, quantity, totalPrice]
    );

    // Update stock & sold count
    await pool.query('UPDATE products SET stock = stock - $1, sold_count = sold_count + $1 WHERE id = $2', [quantity, product_id]);

    // Award green points
    if (p.points_bonus > 0) {
      await pool.query('UPDATE users SET green_points = green_points + $1 WHERE id = $2', [p.points_bonus, req.user.id]);
      await pool.query(
        `INSERT INTO green_point_history (user_id, points, type, source, description) VALUES ($1, $2, 'earn', 'marketplace', $3)`,
        [req.user.id, p.points_bonus, `Beli ${p.name}`]
      );
    }

    // Create Notification
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, 'transaction')`,
      [req.user.id, 'Pembelian Sukses', `Pesanan produk eco-friendly '${p.name}' berhasil dibuat.`]
    );

    res.status(201).json({ message: 'Pesanan berhasil!', order: result.rows[0], pointsEarned: p.points_bonus });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat pesanan.' });
  }
});

module.exports = router;
