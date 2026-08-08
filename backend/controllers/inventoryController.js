const db = require('../config/db');

// Get all inventory
exports.getInventory = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.stock_id, s."ProductID", p."ProductName", s.quantity, s.unit, s.last_update 
      FROM "Stock" s 
      JOIN "Product" p ON s."ProductID" = p."ProductID"
      ORDER BY s."ProductID" ASC
    `);

    // Mock data for categories and images
    const MOCK_DATA = {
      'P01': { category: 'วัตถุดิบหลัก', image: 'https://placehold.co/300x200?text=Flour' },
      'P02': { category: 'วัตถุดิบหลัก', image: 'https://placehold.co/300x200?text=Eggs' },
      'P03': { category: 'ท็อปปิ้ง', image: 'https://placehold.co/300x200?text=Choco' },
      'P04': { category: 'ท็อปปิ้ง', image: 'https://placehold.co/300x200?text=Almond' },
      'P05': { category: 'ท็อปปิ้ง', image: 'https://placehold.co/300x200?text=Raisin' },
      'P06': { category: 'บรรจุภัณฑ์', image: 'https://placehold.co/300x200?text=Box' },
      'P07': { category: 'บรรจุภัณฑ์', image: 'https://placehold.co/300x200?text=Paper' },
    };

    const formattedResults = result.rows.map(item => {
      const mock = MOCK_DATA[item.ProductID] || { category: 'อื่นๆ', image: 'https://placehold.co/300x200?text=Item' };
      
      let status = 'Normal';
      let statusColor = '#22c55e';
      
      if (item.quantity <= 0) {
        status = 'Out of Stock';
        statusColor = '#ef4444';
      } else if (item.quantity < 5) {
        status = 'Low Stock';
        statusColor = '#f59e0b';
      }

      return {
        ...item,
        category: mock.category,
        image: mock.image,
        status,
        statusColor
      };
    });

    res.json(formattedResults);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add stock (restock)
exports.addStock = async (req, res) => {
  try {
    const { ProductID, quantity } = req.body;
    
    await db.query(`
      UPDATE "Stock" 
      SET quantity = quantity + $1, last_update = CURRENT_TIMESTAMP 
      WHERE "ProductID" = $2
    `, [quantity, ProductID]);

    res.json({ message: 'Stock updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Set stock (set exact amount)
exports.setStock = async (req, res) => {
  try {
    const { ProductID, quantity } = req.body;
    
    await db.query(`
      UPDATE "Stock" 
      SET quantity = $1, last_update = CURRENT_TIMESTAMP 
      WHERE "ProductID" = $2
    `, [quantity, ProductID]);

    res.json({ message: 'Stock set successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add new product + stock
exports.addProduct = async (req, res) => {
  try {
    const { ProductName, quantity, unit, category } = req.body;

    // Auto generate ProductID
    const lastRes = await db.query('SELECT "ProductID" FROM "Product" ORDER BY "ProductID" DESC LIMIT 1');
    let nextId = 'P01';
    if (lastRes.rows.length > 0) {
      const lastId = lastRes.rows[0].ProductID;
      const num = parseInt(lastId.substring(1)) + 1;
      nextId = 'P' + num.toString().padStart(2, '0');
    }

    // Insert into Product table
    await db.query(
      'INSERT INTO "Product" ("ProductID", "ProductName") VALUES ($1, $2)',
      [nextId, ProductName]
    );

    // Auto generate stock_id
    const lastStockRes = await db.query('SELECT stock_id FROM "Stock" ORDER BY stock_id DESC LIMIT 1');
    let nextStockId = 'ST01';
    if (lastStockRes.rows.length > 0) {
      const lastStockId = lastStockRes.rows[0].stock_id;
      const num = parseInt(lastStockId.substring(2)) + 1;
      nextStockId = 'ST' + num.toString().padStart(2, '0');
    }

    // Insert into Stock table
    await db.query(
      'INSERT INTO "Stock" (stock_id, "ProductID", quantity, unit, last_update) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
      [nextStockId, nextId, quantity || 0, unit || 'ชิ้น']
    );

    res.json({ message: 'Product added successfully', ProductID: nextId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete product + stock
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete stock first (FK dependency)
    await db.query('DELETE FROM "Stock" WHERE "ProductID" = $1', [id]);
    // Delete product
    await db.query('DELETE FROM "Product" WHERE "ProductID" = $1', [id]);

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update product name + stock unit
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { ProductName, unit } = req.body;

    // Update product name
    await db.query(
      'UPDATE "Product" SET "ProductName" = $1 WHERE "ProductID" = $2',
      [ProductName, id]
    );

    // Update stock unit
    if (unit) {
      await db.query(
        'UPDATE "Stock" SET unit = $1, last_update = CURRENT_TIMESTAMP WHERE "ProductID" = $2',
        [unit, id]
      );
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
