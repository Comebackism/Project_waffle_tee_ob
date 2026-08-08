const db = require('../config/db');

// Get all waffle menus
exports.getAllMenus = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Menu" WHERE is_active = true ORDER BY menu_id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get menu details and all available toppings
exports.getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get Menu
    const menuQuery = await db.query('SELECT * FROM "Menu" WHERE menu_id = $1', [id]);
    if (menuQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    const menu = menuQuery.rows[0];

    // 2. Get Toppings
    const toppingsResult = await db.query(
      'SELECT * FROM "Topping" WHERE is_active = true ORDER BY topping_id ASC'
    );

    // 3. Attach toppings
    menu.toppings = toppingsResult.rows;

    // 4. Return to frontend
    res.json(menu);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
