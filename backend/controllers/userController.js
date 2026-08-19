const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.user_id, u.firstname, u.lastname, u.username, u.phone, u.email, u."Role_id", r."RoleName" as rolename
      FROM "User" u
      LEFT JOIN "Role" r ON u."Role_id" = r."Role_id"
      ORDER BY u.user_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add new user
exports.addUser = async (req, res) => {
  try {
    const { firstname, lastname, username, password, Role_id, phone, email } = req.body;
    
    // Check if username exists
    const checkUsername = await db.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    if (checkUsername.rows.length > 0) {
      return res.status(400).json({ message: 'Username นี้มีในระบบแล้ว กรุณาใช้ชื่ออื่น' });
    }
    
    // Auto generate user_id (e.g. U04)
    const lastUserRes = await db.query('SELECT user_id FROM "User" ORDER BY user_id DESC LIMIT 1');
    let nextId = 'U01';
    if (lastUserRes.rows.length > 0) {
      const lastId = lastUserRes.rows[0].user_id;
      const num = parseInt(lastId.substring(1)) + 1;
      nextId = 'U' + num.toString().padStart(2, '0');
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO "User" (user_id, firstname, lastname, username, password, "Role_id", phone, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [nextId, firstname, lastname, username, hashedPassword, Role_id, phone || null, email || null]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, username, password, Role_id, phone, email } = req.body;
    
    // Check if user exists
    const userRes = await db.query('SELECT * FROM "User" WHERE user_id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new username conflicts with another user
    const checkUsername = await db.query('SELECT user_id FROM "User" WHERE username = $1 AND user_id != $2', [username, id]);
    if (checkUsername.rows.length > 0) {
      return res.status(400).json({ message: 'Username นี้มีในระบบแล้ว กรุณาใช้ชื่ออื่น' });
    }

    // Update query
    let updateQuery = 'UPDATE "User" SET firstname = $1, lastname = $2, username = $3, "Role_id" = $4, phone = $5, email = $6';
    let params = [firstname, lastname, username, Role_id, phone || null, email || null];
    
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = $7 WHERE user_id = $8 RETURNING *';
      params.push(hashedPassword, id);
    } else {
      updateQuery += ' WHERE user_id = $7 RETURNING *';
      params.push(id);
    }

    const result = await db.query(updateQuery, params);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM "User" WHERE user_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบพนักงานที่ต้องการลบ' });
    }
    
    res.json({ message: 'ลบพนักงานสำเร็จ', deletedUser: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'กรุณากรอก username และ password' });
    }

    const result = await db.query(`
      SELECT u.user_id, u.firstname, u.lastname, u.username, u.password, u.phone, u.email, u."Role_id", r."RoleName" as rolename
      FROM "User" u
      LEFT JOIN "Role" r ON u."Role_id" = r."Role_id"
      WHERE u.username = $1
    `, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'ไม่พบชื่อผู้ใช้นี้ในระบบ' });
    }

    const user = result.rows[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
    }

    // Generate JWT token (expires in 12 hours)
    const token = jwt.sign(
      { user_id: user.user_id, Role_id: user.Role_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'เข้าสู่ระบบสำเร็จ', user: userWithoutPassword, token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
