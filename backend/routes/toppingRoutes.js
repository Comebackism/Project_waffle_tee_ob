const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// ADMIN routes
router.get('/admin/all', menuController.getAllToppingsAdmin);
router.post('/', menuController.addTopping);
router.put('/:id', menuController.updateTopping);
router.patch('/:id/toggle', menuController.toggleTopping);
router.delete('/:id', menuController.deleteTopping);

module.exports = router;
