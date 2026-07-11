const pool = require('./config/database');

async function alterTable() {
  try {
    console.log('Connecting to database...');
    // Drop all data from reward_redemptions since we are making a schema change and previous data might be incomplete
    await pool.query('DELETE FROM reward_redemptions');
    
    console.log('Adding voucher_code column to reward_redemptions...');
    await pool.query('ALTER TABLE reward_redemptions ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(15) UNIQUE;');
    
    console.log('Successfully updated schema!');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    process.exit(0);
  }
}

alterTable();
