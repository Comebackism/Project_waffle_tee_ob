const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

pool.query('SELECT * FROM "Menu" LIMIT 1').then(res => {
  console.log('Menu:', res.rows[0]);
  return pool.query('SELECT * FROM "Topping" LIMIT 1');
}).then(res => {
  console.log('Topping:', res.rows[0]);
  pool.end();
}).catch(err => {
  console.error(err);
  pool.end();
});
