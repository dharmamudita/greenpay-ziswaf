const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'greenpay_ziswaf',
  password: '23312067',
  port: 5432,
});

async function rollback() {
  try {
    const res = await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
    console.log(`Berhasil menghapus ${res.rowCount} data dummy.`);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
rollback();
