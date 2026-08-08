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
  pool.query("SELECT * FROM \"User\""),
  pool.query("SELECT * FROM \"Role\"")
]).then(([userRes, roleRes]) => {
  console.log('Users:', userRes.rows);
  console.log('Roles:', roleRes.rows);
  pool.end();
}).catch(console.error);
