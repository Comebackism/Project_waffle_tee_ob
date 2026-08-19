const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const auth = require('../middleware/authMiddleware');

// ADMIN routes (require auth)
router.get('/admin/all', auth, menuController.getAllToppingsAdmin);
router.post('/', auth, menuController.addTopping);
router.put('/:id', auth, menuController.updateTopping);
router.patch('/:id/toggle', auth, menuController.toggleTopping);
router.delete('/:id', auth, menuController.deleteTopping);

module.exports = router;
