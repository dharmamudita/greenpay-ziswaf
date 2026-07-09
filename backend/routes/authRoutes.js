const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

let transporter;
(async () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  } else {
    // Ethereal Email for testing without real credentials
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('Ethereal Email ready for testing. Check server logs for Preview URLs.');
  }
})();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, display_name, role = 'user', phone, address } = req.body;

    // Check if email exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, password, display_name, role, phone, address) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, display_name, role, green_points, created_at`,
      [email, hashedPassword, display_name, role, phone || null, address || null]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registrasi berhasil!',
      token,
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Gagal mendaftar. Silakan coba lagi.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const user = result.rows[0];

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete user.password;

    res.json({ message: 'Login berhasil!', token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Gagal login. Silakan coba lagi.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await pool.query('SELECT id, display_name FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.json({ message: 'Jika email terdaftar, kode reset telah dikirim.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60000); // 15 mins

    await pool.query('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3', [otp, expiry, email]);

    const mailOptions = {
      from: '"GreenPay ZISWAF" <noreply@greenpay.com>',
      to: email,
      subject: 'Kode Reset Password',
      html: `<p>Halo ${user.rows[0].display_name},</p><p>Kode OTP reset password Anda: <b>${otp}</b></p><p>Berlaku 15 menit.</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP:', otp);
    if (!process.env.SMTP_USER) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    res.json({ message: 'Jika email terdaftar, kode reset telah dikirim.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Gagal mengirim email reset password.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await pool.query('SELECT id, reset_token, reset_token_expiry FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(400).json({ error: 'Data tidak valid.' });

    const data = user.rows[0];
    if (data.reset_token !== otp) return res.status(400).json({ error: 'Kode OTP salah.' });
    if (new Date() > new Date(data.reset_token_expiry)) return res.status(400).json({ error: 'Kode OTP kadaluarsa.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE email = $2', [hashedPassword, email]);

    res.json({ message: 'Password berhasil diubah. Silakan login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Gagal mereset password.' });
  }
});

module.exports = router;
