const express = require('express');
const { generateSession, validateSession, getActiveSessions, endSession } = require('../controllers/qrController');

const router = express.Router();

// Route: POST /api/qr/generate
router.post('/generate', generateSession);

// Route: GET /api/qr/validate/:session_id
router.get('/validate/:session_id', validateSession);

// Route: GET /api/qr/sessions
router.get('/sessions', getActiveSessions);

// Route: PUT /api/qr/end/:session_id
router.put('/end/:session_id', endSession);

module.exports = router;
