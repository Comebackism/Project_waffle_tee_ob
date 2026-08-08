const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function fixDb() {
  try {
    // Drop foreign keys first to alter columns easily
    await pool.query('ALTER TABLE "Order_Item_Topping" DROP CONSTRAINT "Order_Item_Topping_order_item_id_fkey"');
    await pool.query('ALTER TABLE "Order_Item" DROP CONSTRAINT "Order_Item_order_id_fkey"');

    // Alter column types
    await pool.query('ALTER TABLE "Order" ALTER COLUMN order_id TYPE VARCHAR(20)');
    await pool.query('ALTER TABLE "Order_Item" ALTER COLUMN order_id TYPE VARCHAR(20)');
    await pool.query('ALTER TABLE "Order_Item" ALTER COLUMN order_item_id TYPE VARCHAR(30)');
    await pool.query('ALTER TABLE "Order_Item_Topping" ALTER COLUMN order_item_id TYPE VARCHAR(30)');

    // Re-add foreign keys
    await pool.query('ALTER TABLE "Order_Item" ADD CONSTRAINT "Order_Item_order_id_fkey" FOREIGN KEY (order_id) REFERENCES "Order"(order_id) ON DELETE CASCADE');
    await pool.query('ALTER TABLE "Order_Item_Topping" ADD CONSTRAINT "Order_Item_Topping_order_item_id_fkey" FOREIGN KEY (order_item_id) REFERENCES "Order_Item"(order_item_id) ON DELETE CASCADE');

    // Update images
    await pool.query(`UPDATE "Menu" SET "Picture" = 'https://images.unsplash.com/photo-1562376552-0d160a2f9cbc?auto=format&fit=crop&w=400&q=80' WHERE menu_id = 'M01'`);
    await pool.query(`UPDATE "Menu" SET "Picture" = 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80' WHERE menu_id = 'M02'`);
    await pool.query(`UPDATE "Menu" SET "Picture" = 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&w=400&q=80' WHERE menu_id = 'M03'`);

    console.log('Database fixed successfully!');
  } catch (err) {
    console.error('Error fixing DB:', err);
  } finally {
    pool.end();
  }
}

fixDb();
