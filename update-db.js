require('dotenv').config({ path: './backend/.env' });
const pool = require('./backend/config/database');
const fs = require('fs');

async function updateLocations() {
  try {
    const sql = fs.readFileSync('./database/update-locations.sql', 'utf8');
    await pool.query(sql);
    console.log('Locations successfully updated to Bandar Lampung!');
  } catch (err) {
    console.error('Error updating locations:', err);
  } finally {
    pool.end();
  }
}

updateLocations();
