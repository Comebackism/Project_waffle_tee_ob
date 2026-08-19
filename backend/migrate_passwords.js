require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT });

async function run() {
  const result = await pool.query('SELECT user_id, password FROM "User"');
  console.log('Found ' + result.rows.length + ' users');
  for (const user of result.rows) {
    if (user.password && user.password.startsWith('$')) { console.log('SKIP ' + user.user_id); continue; }
    const hashed = await bcrypt.hash(user.password, 10);
    await pool.query('UPDATE "User" SET password = $1 WHERE user_id = $2', [hashed, user.user_id]);
    console.log('HASHED ' + user.user_id);
  }
  console.log('Done!');
  await pool.end();
}

run().catch(console.error);