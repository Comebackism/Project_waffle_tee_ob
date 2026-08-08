const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

Promise.all([
  pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User'"),
  pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Role'")
]).then(([userRes, roleRes]) => {
  console.log('User Columns:', userRes.rows);
  console.log('Role Columns:', roleRes.rows);
  pool.end();
}).catch(console.error);
