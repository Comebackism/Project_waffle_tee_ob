const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getInventory);
router.post('/add', inventoryController.addStock);
router.post('/set', inventoryController.setStock);
router.post('/product', inventoryController.addProduct);
router.delete('/product/:id', inventoryController.deleteProduct);
router.put('/product/:id', inventoryController.updateProduct);

module.exports = router;
