const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runSQL() {
  try {
    const sqlPath = path.join(__dirname, 'POS.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing POS.sql...');
    await pool.query(sql);
    console.log('Database initialized successfully!');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    pool.end();
  }
}

runSQL();
