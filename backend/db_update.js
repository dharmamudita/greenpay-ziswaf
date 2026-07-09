const pool = require('./config/database');

async function updateDB() {
  try {
    console.log('Altering table...');
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;`);
    console.log('Success!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

updateDB();
