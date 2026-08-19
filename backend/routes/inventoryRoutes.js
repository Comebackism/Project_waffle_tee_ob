const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, inventoryController.getInventory);
router.post('/add', auth, inventoryController.addStock);
router.post('/set', auth, inventoryController.setStock);
router.post('/withdraw', auth, inventoryController.withdrawStock);
router.get('/invoices', auth, inventoryController.getInvoices);
router.post('/product', auth, inventoryController.addProduct);
router.delete('/product/:id', auth, inventoryController.deleteProduct);
router.put('/product/:id', auth, inventoryController.updateProduct);

module.exports = router;
