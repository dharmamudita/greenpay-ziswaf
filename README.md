# GreenPay ZISWAF 🌿

Platform mobile digital yang menggabungkan **Green Economy** dan **ZISWAF** (Zakat, Infak, Sedekah, Wakaf) dengan fitur inovatif **Impact Passport**.

## 🏗️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Mobile App** | React Native + Expo Router |
| **Backend API** | Express.js + Node.js |
| **Database** | PostgreSQL (pgAdmin 4) |
| **Auth** | JWT + bcrypt |
| **Image Upload** | Cloudinary |

## 📁 Struktur Proyek

```
greenpay-ziswaf/
├── mobile/      # React Native (Expo) App
├── backend/     # Express.js REST API
└── database/    # PostgreSQL Schema
```

## 🚀 Cara Menjalankan

### 1. Database (PostgreSQL)
```bash
# Buat database di pgAdmin 4
CREATE DATABASE greenpay_ziswaf;

# Import schema
psql -U postgres -d greenpay_ziswaf -f database/schema.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env  # Isi konfigurasi
npm start             # Jalan di port 5000
```

### 3. Mobile App
```bash
cd mobile
npm install
npx expo start        # Scan QR di Expo Go app
```

## 👥 Tipe Akun

1. **Pengguna** — Setor sampah, donasi ZISWAF, belanja UMKM, kumpulkan Green Point
2. **Distrik Lingkungan** — Kelola bank sampah, verifikasi setoran, sediakan reward
3. **Admin** — Kelola seluruh platform, laporan, moderasi

## ✨ Fitur Utama

- 💰 Program ZISWAF (Zakat, Infak, Sedekah, Wakaf)
- ♻️ Bank Sampah dengan peta interaktif
- 🛒 Marketplace UMKM Hijau
- 🌿 Green Point & Leaderboard
- 📊 Dashboard Dampak Real-time
- 🎁 Reward & Penukaran Point
- 🛂 Impact Passport Digital
- 🤖 AI Chatbot Lingkungan & ZISWAF

## 📄 Lisensi

MIT License — GreenPay ZISWAF Team
