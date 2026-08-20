const db = require('../config/db');
const crypto = require('crypto');

// Generate a new QR session for a table
exports.generateSession = async (req, res) => {
  try {
    const { table_no, duration_hours = 2 } = req.body;
    
    if (!table_no) {
      return res.status(400).json({ message: 'Table number is required' });
    }

    // Generate a unique session ID
    const session_id = crypto.randomUUID();
    
    // Set expiration time
    const expires_at = new Date(Date.now() + Number(duration_hours) * 60 * 60 * 1000);

    // Deactivate any existing active sessions for this table (except for takeaway which can have multiple concurrent sessions)
    if (!table_no.startsWith('หน้าร้าน')) {
      await db.query(
        `UPDATE "Table_Session" SET is_active = FALSE WHERE table_no = $1 AND is_active = TRUE`,
        [table_no]
      );
    }

    // Create new session
    const result = await db.query(
      `INSERT INTO "Table_Session" (session_id, table_no, expires_at, is_active) 
       VALUES ($1, $2, $3, TRUE) RETURNING *`,
      [session_id, table_no, expires_at]
    );

    res.status(201).json({
      message: 'QR Session created successfully',
      session: result.rows[0],
      url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?session=${session_id}`
    });
  } catch (err) {
    console.error('Error generating QR session:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Validate a QR session
exports.validateSession = async (req, res) => {
  try {
    const { session_id } = req.params;

    if (!session_id) {
      return res.status(400).json({ message: 'Session ID is required', valid: false });
    }

    const result = await db.query(
      `SELECT * FROM "Table_Session" WHERE session_id = $1`,
      [session_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found', valid: false });
    }

    const session = result.rows[0];
    const now = new Date();

    // Check if manually deactivated
    if (!session.is_active) {
      return res.status(403).json({ message: 'Session is no longer active', valid: false, reason: 'inactive' });
    }

    // Check if expired
    if (now > new Date(session.expires_at)) {
      // Auto-deactivate
      await db.query(`UPDATE "Table_Session" SET is_active = FALSE WHERE session_id = $1`, [session_id]);
      return res.status(403).json({ message: 'QR Code has expired', valid: false, reason: 'expired' });
    }

    res.status(200).json({ 
      message: 'Session is valid', 
      valid: true, 
      table_no: session.table_no,
      expires_at: session.expires_at
    });
  } catch (err) {
    console.error('Error validating QR session:', err.message);
    res.status(500).json({ message: 'Server error', valid: false });
  }
};

// Get all active sessions (for cashier dashboard)
exports.getActiveSessions = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM "Table_Session" WHERE is_active = TRUE ORDER BY created_at DESC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching active sessions:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// End a session early
exports.endSession = async (req, res) => {
  try {
    const { session_id } = req.params;
    await db.query(
      `UPDATE "Table_Session" SET is_active = FALSE WHERE session_id = $1`,
      [session_id]
    );
    res.status(200).json({ message: 'Session ended successfully' });
  } catch (err) {
    console.error('Error ending session:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
