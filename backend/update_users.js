const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function updateUsers() {
  try {
    await pool.query(`
      UPDATE "User" SET firstname = 'สมชาย', lastname = 'เจ้าของร้าน' WHERE user_id = 'U01';
      UPDATE "User" SET firstname = 'มาริสา', lastname = 'ยอดขยัน' WHERE user_id = 'U02';
      UPDATE "User" SET firstname = 'ยอดชาย', lastname = 'ใจดี' WHERE user_id = 'U03';
    `);
    console.log('Successfully updated realistic user names!');
  } catch (err) {
    console.error('Error updating users:', err);
  } finally {
    pool.end();
  }
}

updateUsers();
