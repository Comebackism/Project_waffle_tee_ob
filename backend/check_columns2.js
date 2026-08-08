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
  pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Product'"),
  pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Menu'")
]).then(([prodRes, menuRes]) => {
  console.log('Product Columns:', prodRes.rows);
  console.log('Menu Columns:', menuRes.rows);
  pool.end();
}).catch(console.error);
