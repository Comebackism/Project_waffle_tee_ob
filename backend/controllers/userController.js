const db = require('../config/db');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.user_id, u.firstname, u.lastname, u.username, u.password, u.phone, u.email, u."Role_id", r."RoleName" as rolename
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
    
    // Auto generate user_id (e.g. U04)
    const lastUserRes = await db.query('SELECT user_id FROM "User" ORDER BY user_id DESC LIMIT 1');
    let nextId = 'U01';
    if (lastUserRes.rows.length > 0) {
      const lastId = lastUserRes.rows[0].user_id;
      const num = parseInt(lastId.substring(1)) + 1;
      nextId = 'U' + num.toString().padStart(2, '0');
    }

    const result = await db.query(
      'INSERT INTO "User" (user_id, firstname, lastname, username, password, "Role_id", phone, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [nextId, firstname, lastname, username, password, Role_id, phone || null, email || null]
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

    // Update query
    let updateQuery = 'UPDATE "User" SET firstname = $1, lastname = $2, username = $3, "Role_id" = $4, phone = $5, email = $6';
    let params = [firstname, lastname, username, Role_id, phone || null, email || null];
    
    if (password && password.trim() !== '') {
      updateQuery += ', password = $7 WHERE user_id = $8 RETURNING *';
      params.push(password, id);
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
