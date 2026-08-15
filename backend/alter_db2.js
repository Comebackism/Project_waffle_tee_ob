const db = require('./config/db');

async function updateDatabase() {
  try {
    console.log('Adding order_type to Order table...');
    await db.query(`
      ALTER TABLE "Order" 
      ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'takeaway';
    `);
    console.log('Database updated successfully!');
  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    process.exit();
  }
}

updateDatabase();
