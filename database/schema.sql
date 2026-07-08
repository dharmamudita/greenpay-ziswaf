-- =============================================
-- GreenPay ZISWAF — PostgreSQL Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================
-- USERS TABLE
-- ==================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'distrik', 'admin')),
    photo_url TEXT DEFAULT '',
    phone VARCHAR(20),
    address TEXT,
    green_points INTEGER DEFAULT 0,
    total_donation BIGINT DEFAULT 0,
    total_waste DECIMAL(10,2) DEFAULT 0,
    trees_planted INTEGER DEFAULT 0,
    co2_reduced DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================
-- ZISWAF PROGRAMS
-- ==================
CREATE TABLE ziswaf_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL CHECK (category IN ('zakat', 'infak', 'sedekah', 'wakaf')),
    target_amount BIGINT NOT NULL,
    collected_amount BIGINT DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================
-- DONATIONS
-- ==================
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES ziswaf_programs(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'transfer',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================
-- WASTE LOCATIONS (Bank Sampah)
-- ==================
CREATE TABLE waste_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    operating_hours VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    managed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================
-- WASTE DEPOSITS
-- ==================
CREATE TABLE waste_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES waste_locations(id),
    waste_type VARCHAR(50) NOT NULL CHECK (waste_type IN ('plastik', 'kertas', 'logam', 'kaca', 'elektronik', 'organik')),
    weight_kg DECIMAL(10,2) NOT NULL,
    points_earned INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES users(id),
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================
-- PRODUCTS (Marketplace UMKM)
-- ==================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    umkm_name VARCHAR(255),
    stock INTEGER DEFAULT 0,
    points_bonus INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================
-- GREEN POINT HISTORY
-- ==================
CREATE TABLE green_point_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend')),
    source VARCHAR(50) NOT NULL,
    description TEXT,
    reference_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================
-- REWARDS
-- ==================
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    points_cost INTEGER NOT NULL,
    category VARCHAR(50),
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================
-- REWARD REDEMPTIONS
-- ==================
CREATE TABLE reward_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards(id),
    points_spent INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================
-- ORDERS (Marketplace)
-- ==================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    total_price BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================
-- INDEXES
-- ==================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_donations_user ON donations(user_id);
CREATE INDEX idx_donations_program ON donations(program_id);
CREATE INDEX idx_waste_deposits_user ON waste_deposits(user_id);
CREATE INDEX idx_waste_deposits_status ON waste_deposits(status);
CREATE INDEX idx_green_point_history_user ON green_point_history(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user ON orders(user_id);

-- ==================
-- SEED DATA: Default Admin
-- ==================
INSERT INTO users (email, password, display_name, role) VALUES
('admin@greenpay.id', '$2b$10$dummyhashforseeddata', 'Admin GreenPay', 'admin');

-- SEED DATA: ZISWAF Programs
INSERT INTO ziswaf_programs (title, description, category, target_amount, collected_amount) VALUES
('Zakat Mal', 'Tunaikan zakat harta Anda untuk membersihkan dan mensucikan.', 'zakat', 50000000, 35000000),
('Zakat Fitrah', 'Zakat wajib di bulan Ramadhan untuk menyucikan puasa.', 'zakat', 20000000, 18000000),
('Infak Pendidikan', 'Bantu anak-anak kurang mampu mendapat pendidikan layak.', 'infak', 30000000, 22000000),
('Infak Kesehatan', 'Bantuan biaya pengobatan untuk yang membutuhkan.', 'infak', 25000000, 15000000),
('Sedekah Pangan', 'Distribusikan makanan untuk yang kelaparan.', 'sedekah', 15000000, 12000000),
('Sedekah Jariyah', 'Sedekah yang pahalanya terus mengalir.', 'sedekah', 40000000, 28000000),
('Wakaf Produktif', 'Wakaf untuk pengembangan aset produktif.', 'wakaf', 100000000, 65000000),
('Wakaf Lingkungan', 'Wakaf untuk penanaman pohon dan konservasi.', 'wakaf', 50000000, 38000000);

-- SEED DATA: Waste Locations
INSERT INTO waste_locations (name, address, latitude, longitude, operating_hours, status) VALUES
('Bank Sampah Hijau Lestari', 'Jl. Merdeka No. 45, Jakarta Selatan', -6.2615, 106.8106, '08:00 - 16:00', 'active'),
('Bank Sampah Berkah', 'Jl. Sudirman No. 22, Jakarta Pusat', -6.2088, 106.8456, '09:00 - 17:00', 'active'),
('Bank Sampah Sejahtera', 'Jl. Gatot Subroto No. 10, Bandung', -6.9175, 107.6191, '08:00 - 15:00', 'active');

-- SEED DATA: Products
INSERT INTO products (name, description, price, category, umkm_name, stock, points_bonus, rating, sold_count) VALUES
('Tas Belanja Daur Ulang', 'Tas belanja ramah lingkungan dari bahan daur ulang', 45000, 'Aksesoris', 'EcoStore Bandung', 50, 15, 4.8, 234),
('Tumbler Bambu 500ml', 'Tumbler eco-friendly berbahan bambu alami', 85000, 'Peralatan', 'Green Living Jakarta', 30, 25, 4.9, 189),
('Sabun Natural Organik', 'Sabun alami tanpa bahan kimia berbahaya', 25000, 'Perawatan', 'Nature Pure Yogya', 100, 10, 4.7, 567),
('Sedotan Stainless Set', 'Set sedotan stainless steel reusable', 35000, 'Peralatan', 'EcoStore Bandung', 80, 12, 4.6, 445),
('Beeswax Food Wrap', 'Pembungkus makanan pengganti plastik wrap', 55000, 'Dapur', 'Green Living Jakarta', 40, 18, 4.8, 123),
('Pot Tanaman Daur Ulang', 'Pot tanaman dari material daur ulang', 30000, 'Dekorasi', 'Nature Pure Yogya', 60, 8, 4.5, 321);

-- SEED DATA: Rewards
INSERT INTO rewards (name, description, points_cost, category, stock) VALUES
('Voucher Belanja Rp 50.000', 'Voucher belanja untuk marketplace', 500, 'Voucher', 15),
('Tumbler Eco Premium', 'Tumbler premium ramah lingkungan', 800, 'Produk', 8),
('Bibit Pohon Mangga', 'Bibit pohon mangga siap tanam', 200, 'Lingkungan', 50),
('Kaos GreenPay Limited', 'Kaos edisi terbatas GreenPay ZISWAF', 1000, 'Merchandise', 5),
('Tas Daur Ulang Premium', 'Tas premium dari bahan daur ulang', 600, 'Produk', 12),
('Donasi Pohon 5 Batang', 'Donasikan 5 bibit pohon atas nama Anda', 300, 'Lingkungan', 100),
('Voucher Grab Rp 25.000', 'Voucher Grab senilai Rp 25.000', 250, 'Voucher', 20),
('Sabun Natural Set', 'Set sabun natural organic premium', 400, 'Produk', 25);
