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

    const productsResult = await pool.query(query, params);
    
    // Also fetch rewards
    let rewardsQuery = 'SELECT *, points_cost as price, 0 as points_bonus, distrik_name as umkm_name, 5.0 as rating, 0 as sold_count, \'reward\' as item_type FROM rewards WHERE is_active = true';
    const rewardsParams = [];
    let rParamIdx = 1;

    if (category) {
      rewardsQuery += ` AND category = $${rParamIdx++}`;
      rewardsParams.push(category);
    }
    if (search) {
      rewardsQuery += ` AND (name ILIKE $${rParamIdx++} OR distrik_name ILIKE $${rParamIdx++})`;
      rewardsParams.push(`%${search}%`, `%${search}%`);
    }
    rewardsQuery += ' ORDER BY created_at DESC';

    const rewardsResult = await pool.query(rewardsQuery, rewardsParams);

    const allItems = [
      ...productsResult.rows.map(p => ({...p, item_type: 'product'})),
      ...rewardsResult.rows
    ];

    res.json(allItems);
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

// Helper function to generate 6-char voucher code
function generateVoucherCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /api/marketplace/redeem — Redeem Reward
router.post('/redeem', authenticateToken, async (req, res) => {
  try {
    const { reward_id } = req.body;
    const reward = await pool.query('SELECT * FROM rewards WHERE id = $1 AND is_active = true', [reward_id]);
    if (reward.rows.length === 0) return res.status(404).json({ error: 'Reward tidak ditemukan.' });

    const r = reward.rows[0];
    if (r.stock < 1) return res.status(400).json({ error: 'Stok reward habis.' });

    // Check user points
    const user = await pool.query('SELECT green_points FROM users WHERE id = $1', [req.user.id]);
    if (user.rows[0].green_points < r.points_cost) {
      return res.status(400).json({ error: 'Green Points Anda tidak mencukupi.' });
    }

    // Deduct points
    await pool.query('UPDATE users SET green_points = green_points - $1 WHERE id = $2', [r.points_cost, req.user.id]);
    await pool.query(
      `INSERT INTO green_point_history (user_id, points, type, source, description) VALUES ($1, $2, 'spend', 'marketplace', $3)`,
      [req.user.id, r.points_cost, `Tukar ${r.name}`]
    );

    // Update stock
    await pool.query('UPDATE rewards SET stock = stock - 1 WHERE id = $1', [reward_id]);

    // Create Reward Redemption Record with Voucher Code
    const voucherCode = generateVoucherCode();
    await pool.query(
      `INSERT INTO reward_redemptions (user_id, reward_id, points_spent, status, voucher_code) VALUES ($1, $2, $3, 'pending', $4)`,
      [req.user.id, reward_id, r.points_cost, voucherCode]
    );

    // Create Notification
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, 'transaction')`,
      [req.user.id, 'Tukar Reward Sukses', `Berhasil menukarkan ${r.points_cost} GP dengan '${r.name}'. Kode Voucher: ${voucherCode}`]
    );

    res.status(201).json({ message: 'Tukar poin berhasil!', reward: r, voucher_code: voucherCode });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menukar reward.' });
  }
});

module.exports = router;
