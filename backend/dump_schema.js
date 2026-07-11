const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'greenpay_ziswaf',
  user: 'postgres',
  password: 'postgres'
});

pool.query(`
  SELECT table_name, column_name, data_type 
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
  ORDER BY table_name, ordinal_position;
`, (err, res) => {
  if (err) throw err;
  console.log(JSON.stringify(res.rows, null, 2));
  pool.end();
});
