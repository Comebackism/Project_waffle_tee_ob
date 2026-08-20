const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('เชื่อมต่อ Database ล้มเหลว:', err.message);
  } else {
    console.log('เชื่อมต่อ PostgreSQL สำเร็จเมื่อเวลา:', res.rows[0].now);
  }
});

module.exports = pool;