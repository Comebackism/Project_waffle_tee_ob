const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, userController.getUsers);       // Protected
router.post('/', auth, userController.addUser);       // Protected (admin creates users)
router.post('/login', userController.login);          // Public
router.put('/:id', auth, userController.updateUser);  // Protected
router.delete('/:id', auth, userController.deleteUser); // Protected

module.exports = router;
