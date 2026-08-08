const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function alterDb() {
  try {
    await pool.query('ALTER TABLE "Menu" ADD COLUMN description TEXT;');
    await pool.query('ALTER TABLE "Menu" ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;');
    
    // Update data
    await pool.query(`UPDATE "Menu" SET description = 'กรอบนอกนุ่มใน หอมหวาน', is_favorite = TRUE WHERE menu_id = 'M01'`);
    await pool.query(`UPDATE "Menu" SET description = 'เข้มข้นถึงรสช็อกโกแลต', is_favorite = TRUE WHERE menu_id = 'M02'`);
    await pool.query(`UPDATE "Menu" SET description = 'หอมกลิ่นมัทฉะแท้', is_favorite = FALSE WHERE menu_id = 'M03'`);
    
    console.log('Database altered successfully!');
  } catch (err) {
    console.error('Error altering SQL:', err);
  } finally {
    pool.end();
  }
}

alterDb();
