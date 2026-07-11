const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'greenpay_ziswaf',
  user: 'postgres',
  password: '23312067'
});

async function alterDb() {
  try {
    await pool.query("ALTER TABLE reward_redemptions ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(20) UNIQUE;");
    console.log('Successfully added voucher_code');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
alterDb();
