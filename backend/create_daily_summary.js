const db = require('./config/db');

async function createDailySummary() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS "Daily_Summary" (
        "summary_id" SERIAL PRIMARY KEY,
        "summary_date" DATE NOT NULL UNIQUE,
        "total_orders" INT NOT NULL DEFAULT 0,
        "total_sales" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ ตาราง Daily_Summary สร้างเรียบร้อยแล้ว');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createDailySummary();
