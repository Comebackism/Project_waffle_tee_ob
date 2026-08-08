const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function fixCalories() {
  try {
    console.log('Dropping redundant lowercase calories column...');
    await pool.query('ALTER TABLE "Menu" DROP COLUMN IF EXISTS "calories"');
    await pool.query('ALTER TABLE "Topping" DROP COLUMN IF EXISTS "calories"');
    console.log('Fixed successfully.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

fixCalories();
