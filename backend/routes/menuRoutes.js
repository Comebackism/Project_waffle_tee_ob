const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET /api/menus
router.get('/', menuController.getAllMenus);

// GET /api/menus/:id
router.get('/:id', menuController.getMenuById);

// ADMIN routes
router.get('/admin/all', menuController.getAllMenusAdmin);
router.post('/', menuController.addMenu);
router.put('/:id', menuController.updateMenu);
router.patch('/:id/toggle', menuController.toggleMenu);
router.delete('/:id', menuController.deleteMenu);

module.exports = router;
