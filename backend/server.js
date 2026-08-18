const express = require('express');
const cors = require('cors');
const path = require('path'); //  1.ดึงโมดูล path ของ Node.js มาใช้
require('dotenv').config();

const menuRoutes = require('./routes/menuRoutes');
const toppingRoutes = require('./routes/toppingRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const qrRoutes = require('./routes/qrRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//  2. เพิ่มบรรทัดนี้: เปิดให้เบราว์เซอร์วิ่งเข้ามาดึงไฟล์รูปจากโฟลเดอร์ public/images ได้
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use('/api/menus', menuRoutes);
app.use('/api/toppings', toppingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qr', qrRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});