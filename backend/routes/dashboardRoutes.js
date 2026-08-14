const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/stats
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/dashboard/sales-by-date?date=YYYY-MM-DD
router.get('/sales-by-date', dashboardController.getSalesByDate);

module.exports = router;
