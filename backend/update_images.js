const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function updateImages() {
  try {
    // Update menu images to use local files served by Express static
    await pool.query(`UPDATE "Menu" SET "Picture" = '/images/waffle_original.png' WHERE menu_id = 'M01'`);
    await pool.query(`UPDATE "Menu" SET "Picture" = '/images/waffle_chocolate.png' WHERE menu_id = 'M02'`);
    await pool.query(`UPDATE "Menu" SET "Picture" = '/images/waffle_matcha.png' WHERE menu_id = 'M03'`);

    console.log('Menu images updated successfully!');

    // Verify
    const result = await pool.query('SELECT menu_id, name, price, "Picture" FROM "Menu"');
    console.log('Current menu data:');
    result.rows.forEach(r => console.log(`  ${r.menu_id}: ${r.name} - ฿${r.price} - ${r.Picture}`));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

updateImages();
