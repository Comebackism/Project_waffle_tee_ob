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
    const res = await pool.query('SELECT * FROM "Status" WHERE status_id = $1', ['S06']);
    if (res.rows.length === 0) {
      await pool.query('INSERT INTO "Status" (status_id, statusname) VALUES ($1, $2)', ['S06', 'ยกเลิก']);
      console.log('Successfully inserted S06 (ยกเลิก)');
    } else {
      console.log('S06 already exists.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
