const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function addCalories() {
  try {
    console.log('Adding calories columns...');
    await pool.query('ALTER TABLE "Menu" ADD COLUMN IF NOT EXISTS calories INT DEFAULT 0');
    await pool.query('ALTER TABLE "Topping" ADD COLUMN IF NOT EXISTS calories INT DEFAULT 0');

    // Update some default calorie values
    await pool.query(`UPDATE "Menu" SET calories = 250 WHERE menu_id = 'M01'`); // Original
    await pool.query(`UPDATE "Menu" SET calories = 320 WHERE menu_id = 'M02'`); // Choco
    await pool.query(`UPDATE "Menu" SET calories = 280 WHERE menu_id = 'M03'`); // Matcha

    await pool.query(`UPDATE "Topping" SET calories = 50 WHERE name LIKE '%ช็อกโกแลต%'`);
    await pool.query(`UPDATE "Topping" SET calories = 90 WHERE name LIKE '%กล้วย%'`);
    await pool.query(`UPDATE "Topping" SET calories = 60 WHERE name LIKE '%อัลมอนด์%'`);
    await pool.query(`UPDATE "Topping" SET calories = 30 WHERE name LIKE '%ลูกเกด%'`);
    await pool.query(`UPDATE "Topping" SET calories = 40 WHERE name LIKE '%เยลลี่%'`);
    await pool.query(`UPDATE "Topping" SET calories = 120 WHERE name LIKE '%โอรีโอ้%'`);

    console.log('Calories added successfully.');
  } catch (err) {
    console.error('Error adding calories:', err);
  } finally {
    pool.end();
  }
}

addCalories();
