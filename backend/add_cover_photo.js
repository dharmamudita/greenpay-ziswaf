require('dotenv').config();
const pool = require('./config/database');

async function addCoverPhotoColumn() {
  try {
    console.log('Adding cover_photo_url column to users table...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_photo_url TEXT DEFAULT \'\';');
    console.log('Successfully added cover_photo_url column!');
  } catch (err) {
    console.error('Error adding cover_photo_url column:', err);
  } finally {
    pool.end();
  }
}

addCoverPhotoColumn();
