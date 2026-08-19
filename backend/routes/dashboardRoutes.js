const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware');

// GET /api/dashboard/stats
router.get('/stats', auth, dashboardController.getDashboardStats);

// GET /api/dashboard/sales-by-date?date=YYYY-MM-DD
router.get('/sales-by-date', auth, dashboardController.getSalesByDate);

module.exports = router;
