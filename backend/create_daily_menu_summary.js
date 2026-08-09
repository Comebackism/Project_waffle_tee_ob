const db = require('./config/db');

async function createDailyMenuSummary() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS "Daily_Menu_Summary" (
        "summary_date" DATE NOT NULL,
        "menu_id" VARCHAR(20) NOT NULL REFERENCES "Menu"("menu_id") ON DELETE CASCADE,
        "quantity_sold" INT NOT NULL DEFAULT 0,
        PRIMARY KEY ("summary_date", "menu_id")
      );
    `);
    console.log('✅ ตาราง Daily_Menu_Summary สร้างเรียบร้อยแล้ว');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createDailyMenuSummary();
