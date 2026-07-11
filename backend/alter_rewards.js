const pool = require('./config/database');

async function alterRewards() {
  try {
    console.log('Altering rewards table...');
    await pool.query(`
      ALTER TABLE rewards 
      ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS distrik_name VARCHAR(255);
    `);
    console.log('Successfully added columns to rewards table.');
  } catch (error) {
    console.error('Error altering rewards table:', error);
  } finally {
    process.exit(0);
  }
}

alterRewards();
