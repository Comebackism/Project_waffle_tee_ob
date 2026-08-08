const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function addMenu() {
  try {
    const menuRes = await pool.query(`
      INSERT INTO "Menu" (menu_id, name, price, is_active, "Picture", "Calories", description, is_favorite)
      VALUES ('M04', 'วาฟเฟิลสตรอว์เบอร์รีครีมสด', 69.00, true, '/images/strawberry_waffle.png', 450, 'วาฟเฟิลฮ่องกงกรอบนอกนุ่มใน สอดไส้ครีมสดและสตรอว์เบอร์รีฉ่ำๆ', false)
      ON CONFLICT (menu_id) DO NOTHING
      RETURNING *;
    `);

    console.log('Successfully added new menu!');
  } catch (err) {
    console.error('Error adding menu:', err);
  } finally {
    pool.end();
  }
}

addMenu();
