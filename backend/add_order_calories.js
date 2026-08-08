const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

pool.query('ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS total_calories INT DEFAULT 0').then(() => {
  console.log('Added total_calories');
  pool.end();
}).catch(err => {
  console.error(err);
  pool.end();
});
