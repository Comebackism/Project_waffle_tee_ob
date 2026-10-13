const { Pool, types } = require('pg');
require('dotenv').config();

// คอลัมน์ชนิด "timestamp without time zone" (OID 1114) ทั้งระบบถูกเก็บเป็นเวลา UTC
// (สอดคล้องกับค่า default CURRENT_TIMESTAMP ของ PostgreSQL และการที่ session timezone = UTC)
// ค่าเริ่มต้นของ pg จะตีความเป็นเวลาท้องถิ่นของโปรเซส ทำให้เวลาคลาดเคลื่อน ต้องบังคับเป็น UTC
types.setTypeParser(1114, (v) => (v === null ? null : new Date(v.replace(' ', 'T') + 'Z')));

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