const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Helper to save base64 image
const saveBase64Image = (base64Str, prefix = 'img') => {
  if (!base64Str || !base64Str.startsWith('data:image')) {
    return base64Str; // Already a filename or URL
  }
  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const extension = type.split('/')[1] || 'jpg';
    const filename = `${prefix}_${Date.now()}.${extension}`;
    const filepath = path.join(__dirname, '../public/images', filename);
    
    if (!fs.existsSync(path.dirname(filepath))) {
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
    }
    fs.writeFileSync(filepath, buffer);
    return filename;
  }
  return base64Str;
};

// Get all waffle menus (Customer — active only)
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
      'SELECT * FROM "Topping" ORDER BY topping_id ASC'
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

// ADMIN: Get all menus (including inactive)
exports.getAllMenusAdmin = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Menu" ORDER BY menu_id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ADMIN: Add new menu
exports.addMenu = async (req, res) => {
  try {
    const { name, price, Picture, Calories, description } = req.body;
    
    // Auto generate menu_id
    const lastRes = await db.query('SELECT menu_id FROM "Menu" ORDER BY menu_id DESC LIMIT 1');
    let nextId = 'M01';
    if (lastRes.rows.length > 0) {
      const lastId = lastRes.rows[0].menu_id;
      const num = parseInt(lastId.substring(1)) + 1;
      nextId = 'M' + num.toString().padStart(2, '0');
    }

    const finalPicture = saveBase64Image(Picture, `menu_${nextId}`);

    await db.query(
      'INSERT INTO "Menu" (menu_id, name, price, "Picture", "Calories", description, is_active) VALUES ($1, $2, $3, $4, $5, $6, true)',
      [nextId, name, price, finalPicture || null, Calories || null, description || null]
    );

    res.json({ message: 'Menu added successfully', menu_id: nextId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ADMIN: Update menu
exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, Picture, Calories, description } = req.body;
    
    let finalPicture = null;
    if (Picture) {
      finalPicture = saveBase64Image(Picture, `menu_${id}`);
    }

    if (finalPicture) {
      await db.query(
        'UPDATE "Menu" SET name = $1, price = $2, "Picture" = $3, "Calories" = $4, description = $5 WHERE menu_id = $6',
        [name, price, finalPicture, Calories || null, description || null, id]
      );
    } else {
      await db.query(
        'UPDATE "Menu" SET name = $1, price = $2, "Calories" = $3, description = $4 WHERE menu_id = $5',
        [name, price, Calories || null, description || null, id]
      );
    }

    res.json({ message: 'Menu updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ADMIN: Toggle menu active status
exports.toggleMenu = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      'UPDATE "Menu" SET is_active = NOT is_active WHERE menu_id = $1',
      [id]
    );
    res.json({ message: 'Menu status toggled successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ADMIN: Delete menu
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM "Menu" WHERE menu_id = $1', [id]);
    res.json({ message: 'Menu deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ADMIN: Get all toppings (including inactive)
exports.getAllToppingsAdmin = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Topping" ORDER BY topping_id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ADMIN: Add new topping
exports.addTopping = async (req, res) => {
  try {
    const { name, price, Picture, Calories } = req.body;
    
    const lastRes = await db.query('SELECT topping_id FROM "Topping" ORDER BY topping_id DESC LIMIT 1');
    let nextId = 'T01';
    if (lastRes.rows.length > 0) {
      const lastId = lastRes.rows[0].topping_id;
      const num = parseInt(lastId.substring(1)) + 1;
      nextId = 'T' + num.toString().padStart(2, '0');
    }

    const finalPicture = saveBase64Image(Picture, `topping_${nextId}`);

    await db.query(
      'INSERT INTO "Topping" (topping_id, name, price, "Picture", "Calories", is_active) VALUES ($1, $2, $3, $4, $5, true)',
      [nextId, name, price, finalPicture || null, Calories || null]
    );

    res.json({ message: 'Topping added successfully', topping_id: nextId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ADMIN: Update topping
exports.updateTopping = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, Picture, Calories } = req.body;
    
    let finalPicture = null;
    if (Picture) {
      finalPicture = saveBase64Image(Picture, `topping_${id}`);
    }

    if (finalPicture) {
      await db.query(
        'UPDATE "Topping" SET name = $1, price = $2, "Picture" = $3, "Calories" = $4 WHERE topping_id = $5',
        [name, price, finalPicture, Calories || null, id]
      );
    } else {
      await db.query(
        'UPDATE "Topping" SET name = $1, price = $2, "Calories" = $3 WHERE topping_id = $4',
        [name, price, Calories || null, id]
      );
    }

    res.json({ message: 'Topping updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ADMIN: Toggle topping active status
exports.toggleTopping = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      'UPDATE "Topping" SET is_active = NOT is_active WHERE topping_id = $1',
      [id]
    );
    res.json({ message: 'Topping status toggled successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ADMIN: Delete topping
exports.deleteTopping = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM "Topping" WHERE topping_id = $1', [id]);
    res.json({ message: 'Topping deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
