const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:23312067@localhost:5432/greenpay_ziswaf' });

async function test() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Update request status
    const reqResult = await client.query(
      "UPDATE district_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      ['approved', '64de3961-8fde-4b0f-b043-4162bf616cf4']
    );
    console.log("Req Result:", reqResult.rows[0]);
    
    const requestData = reqResult.rows[0];

    // 2. Create waste location
    await client.query(
      `INSERT INTO waste_locations (name, address, phone, managed_by, status)
       VALUES ($1, $2, $3, $4, 'active')`,
      [requestData.name, requestData.address, requestData.phone, requestData.user_id]
    );
    console.log("Location inserted");

    // 3. Update user role
    await client.query(
      "UPDATE users SET role = 'distrik' WHERE id = $1 AND role = 'user'",
      [requestData.user_id]
    );
    console.log("User updated");

    await client.query('ROLLBACK');
  } catch(e) {
    console.error('ERROR:', e.message);
  } finally {
    client.release();
    pool.end();
  }
}
test();
