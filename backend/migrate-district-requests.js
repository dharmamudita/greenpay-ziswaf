require('dotenv').config();
const pool = require('./config/database');

async function migrate() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS district_requests (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id),
          name VARCHAR(255) NOT NULL,
          address TEXT NOT NULL,
          phone VARCHAR(20) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_district_requests_user ON district_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_district_requests_status ON district_requests(status);
    `;
    
    await pool.query(createTableQuery);
    console.log('Successfully created district_requests table');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    pool.end();
  }
}

migrate();
