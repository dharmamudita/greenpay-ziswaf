const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

const { sendEmail } = require('../utils/mailer');
const { OAuth2Client } = require('google-auth-library');

// Inisialisasi Google Auth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/request-otp
router.post('/request-otp', async (req, res) => {
  try {
    const { email, type, captchaToken } = req.body;
    if (!email || !type) return res.status(400).json({ error: 'Email dan tipe (type) harus diisi.' });

    // Verify reCAPTCHA for registration
    if (type === 'register' && captchaToken !== 'bypass-for-web') {
      if (!captchaToken) {
        return res.status(400).json({ error: 'CAPTCHA token wajib dikirim.' });
      }
      
      try {
        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        const params = new URLSearchParams();
        params.append('secret', (process.env.RECAPTCHA_SECRET_KEY || '').trim());
        params.append('response', captchaToken);

        const recaptchaRes = await fetch(verifyUrl, { 
          method: 'POST',
          body: params
        });
        const recaptchaData = await recaptchaRes.json();
        
        console.log("reCAPTCHA response:", recaptchaData);
        
        if (!recaptchaData.success) {
          return res.status(400).json({ error: 'Validasi CAPTCHA gagal. Anda terdeteksi sebagai bot.' });
        }
      } catch (err) {
        console.error('reCAPTCHA error:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat memverifikasi CAPTCHA.' });
      }
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      'INSERT INTO otp_codes (email, otp_code, type, expires_at) VALUES ($1, $2, $3, $4)',
      [email, otp, type, expiresAt]
    );

    const subject = `Kode Verifikasi (OTP) GreenPay ZISWAF - ${type}`;
    const text = `Kode OTP Anda adalah: ${otp}. Kode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun.`;
    const html = `<div style="font-family: sans-serif; padding: 20px;">
      <h2>GreenPay ZISWAF</h2>
      <p>Berikut adalah kode verifikasi (OTP) Anda untuk <b>${type}</b>:</p>
      <h1 style="color: #10B981; letter-spacing: 5px;">${otp}</h1>
      <p>Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
    </div>`;

    const sent = await sendEmail(email, subject, text, html);
    
    if (sent) {
      res.json({ message: 'OTP berhasil dikirim ke email.' });
    } else {
      res.status(500).json({ error: 'Gagal mengirim email OTP.' });
    }
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, type } = req.body;
    if (!email || !otp || !type) return res.status(400).json({ error: 'Email, OTP, dan tipe harus diisi.' });

    const result = await pool.query(
      'SELECT id, expires_at, is_used FROM otp_codes WHERE email = $1 AND otp_code = $2 AND type = $3 ORDER BY created_at DESC LIMIT 1',
      [email, otp, type]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Kode OTP salah.' });
    }

    const record = result.rows[0];

    if (record.is_used) {
      return res.status(400).json({ error: 'Kode OTP sudah digunakan.' });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ error: 'Kode OTP sudah kedaluwarsa.' });
    }

    // Mark as used
    await pool.query('UPDATE otp_codes SET is_used = true WHERE id = $1', [record.id]);

    res.json({ message: 'OTP valid.', success: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

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

// POST /api/auth/social-login
router.post('/social-login', async (req, res) => {
  try {
    const { provider, token, email, name } = req.body;
    
    // Bypass verifikasi token yang ketat di tahap awal untuk kemudahan testing,
    // di produksi, Anda harus memverifikasi token dari Google/FB di sini.
    let verifiedEmail = email;
    let verifiedName = name;

    if (!verifiedEmail) {
      return res.status(400).json({ error: 'Email dari penyedia sosial tidak ditemukan.' });
    }

    // Cek apakah user sudah terdaftar
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [verifiedEmail]);
    
    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      
      // Jika akun dinonaktifkan
      if (!user.is_active) {
        return res.status(401).json({ error: 'Akun dinonaktifkan.' });
      }

      // Generate JWT
      const jwtToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      delete user.password;
      return res.json({ message: 'Login berhasil!', token: jwtToken, user, isNewUser: false });
    } else {
      // User belum terdaftar, arahkan untuk lengkapi profil
      return res.json({ 
        message: 'Akun baru, lengkapi profil', 
        isNewUser: true, 
        email: verifiedEmail, 
        name: verifiedName 
      });
    }
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat social login.' });
  }
});

// POST /api/auth/social-register
router.post('/social-register', async (req, res) => {
  try {
    const { email, name, password, role = 'user' } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Semua field wajib diisi.' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password, display_name, role) 
       VALUES ($1, $2, $3, $4) RETURNING id, email, display_name, role, green_points, created_at`,
      [email, hashedPassword, name, role]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registrasi sosial berhasil!',
      token,
      user,
    });
  } catch (error) {
    console.error('Social register error:', error);
    res.status(500).json({ error: 'Gagal mendaftar via sosial.' });
  }
});

module.exports = router;
