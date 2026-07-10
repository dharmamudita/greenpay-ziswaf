const pool = require('./config/database');

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp_code VARCHAR(10) NOT NULL,
          type VARCHAR(50) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          is_used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Successfully created otp_codes table!');
    process.exit(0);
  } catch (error) {
    console.error('Error migrating OTP table:', error);
    process.exit(1);
  }
}

migrate();
