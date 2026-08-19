const express = require('express');
const { generateSession, validateSession, getActiveSessions, endSession } = require('../controllers/qrController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Route: POST /api/qr/generate (Protected - cashier only)
router.post('/generate', auth, generateSession);

// Route: GET /api/qr/validate/:session_id (Public - customer scans QR)
router.get('/validate/:session_id', validateSession);

// Route: GET /api/qr/sessions (Protected)
router.get('/sessions', auth, getActiveSessions);

// Route: PUT /api/qr/end/:session_id (Protected)
router.put('/end/:session_id', auth, endSession);

module.exports = router;
