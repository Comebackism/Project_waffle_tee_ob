import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Table_Session" (
          session_id VARCHAR(50) PRIMARY KEY,
          table_no VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          is_active BOOLEAN DEFAULT TRUE
      );
    `);
    console.log('Table_Session created successfully.');
    
    // Check if column exists
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Order' and column_name='session_id';
    `);
    if (res.rowCount === 0) {
      await pool.query(`ALTER TABLE "Order" ADD COLUMN session_id VARCHAR(50);`);
      console.log('Added session_id to Order table.');
    } else {
      console.log('session_id column already exists in Order table.');
    }
  } catch (error) {
    console.error('Error executing query:', error);
  } finally {
    await pool.end();
  }
}

run();
