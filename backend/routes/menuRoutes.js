const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const auth = require('../middleware/authMiddleware');

// GET /api/menus
router.get('/', menuController.getAllMenus);

// GET /api/menus/:id
router.get('/:id', menuController.getMenuById);

// ADMIN routes (require auth)
router.get('/admin/all', auth, menuController.getAllMenusAdmin);
router.post('/', auth, menuController.addMenu);
router.put('/:id', auth, menuController.updateMenu);
router.patch('/:id/toggle', auth, menuController.toggleMenu);
router.delete('/:id', auth, menuController.deleteMenu);

module.exports = router;
