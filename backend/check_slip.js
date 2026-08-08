const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});
pool.query('SELECT order_id, queue_number, slip_picture FROM "Order" WHERE pay_method = \'promptpay\' ORDER BY created_at DESC LIMIT 5')
  .then(res => { console.log(res.rows); pool.end(); })
  .catch(console.error);
