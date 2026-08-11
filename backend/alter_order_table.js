const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function run() {
  try {
    // Check if column exists first
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Order' AND column_name='is_archived'
    `);
    
    if (res.rows.length === 0) {
      await pool.query('ALTER TABLE "Order" ADD COLUMN is_archived BOOLEAN DEFAULT false');
      console.log('Successfully added is_archived column.');
    } else {
      console.log('Column is_archived already exists.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
