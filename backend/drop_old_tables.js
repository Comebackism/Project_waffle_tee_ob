const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function dropOldTables() {
  try {
    console.log('Dropping old tables...');
    await pool.query('DROP TABLE IF EXISTS "product_toppings" CASCADE');
    await pool.query('DROP TABLE IF EXISTS "toppings" CASCADE');
    await pool.query('DROP TABLE IF EXISTS "products" CASCADE');
    await pool.query('DROP TABLE IF EXISTS "categories" CASCADE');
    console.log('Old tables removed successfully.');
  } catch (err) {
    console.error('Error dropping tables:', err);
  } finally {
    pool.end();
  }
}

dropOldTables();
