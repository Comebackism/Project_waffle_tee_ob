const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.post('/', orderController.createOrder);             // Public: ลูกค้าสั่งอาหาร
router.get('/', auth, orderController.getOrders);           // Protected
router.get('/today', auth, orderController.getOrdersToday); // Protected
router.delete('/clear', auth, orderController.clearAllOrders); // Protected
router.get('/:id', orderController.getOrderById);           // Public: ลูกค้าดูสถานะ
router.put('/:id/status', orderController.updateOrderStatus); // Public: ลูกค้ากดยกเลิกได้ / พนักงานกดเปลี่ยนสถานะ

module.exports = router;
