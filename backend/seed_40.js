const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'greenpay_ziswaf',
  password: '23312067',
  port: 5432,
});

async function seed() {
  try {
    console.log('Menambahkan 40 Data Dummy...');
    for(let i = 1; i <= 40; i++) {
      // 1. Insert User
      const userRes = await pool.query(
        "INSERT INTO users (email, password, display_name, role) VALUES ($1, '$2b$10$dummy', $2, 'user') RETURNING id",
        [`user_${Math.random().toString(36).substring(7)}@test.com`, `Pahlawan Bumi ${i}`]
      );
      const userId = userRes.rows[0].id;

      // 2. Insert Waste Deposit (using Distrik ID 1 which is default in schema or Admin)
      const weight = Math.floor(Math.random() * 50) + 1;
      await pool.query(
        "INSERT INTO waste_deposits (user_id, location_id, waste_type, weight_kg, status, points_earned) VALUES ($1, (SELECT id FROM waste_locations LIMIT 1), 'plastik', $2, 'verified', $3)",
        [userId, weight, weight * 10]
      );

      // 3. Insert Donation (using Program ID 1 which is in schema)
      const amount = Math.floor(Math.random() * 500000) + 10000;
      await pool.query(
        "INSERT INTO donations (user_id, program_id, amount, status) VALUES ($1, (SELECT id FROM ziswaf_programs LIMIT 1), $2, 'success')",
        [userId, amount]
      );
      
      // Update User stats
      await pool.query(
        "UPDATE users SET total_waste = total_waste + $1, total_donation = total_donation + $2 WHERE id = $3",
        [weight, amount, userId]
      );
    }
    console.log('40 Data berhasil ditambahkan!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
seed();
