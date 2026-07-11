const pool = require('./config/database');

async function alterTable() {
  try {
    await pool.query(`ALTER TABLE notifications ADD COLUMN type VARCHAR(50) DEFAULT 'system'`);
    console.log('Successfully added type column to notifications table.');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    pool.end();
  }
}

alterTable();
