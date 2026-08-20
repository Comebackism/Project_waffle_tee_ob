const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to save base64 image
const saveBase64Image = async (base64Str, prefix = 'product') => {
  if (!base64Str || !base64Str.startsWith('data:image')) {
    return base64Str; // Already a filename or URL
  }
  
  try {
    const result = await cloudinary.uploader.upload(base64Str, {
      folder: 'pos_images',
      public_id: `${prefix}_${Date.now()}`
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

// Get all inventory
exports.getInventory = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.stock_id, s."ProductID", p."ProductName", p."Picture", p."category", s.quantity, s.unit, s.last_update 
      FROM "Stock" s 
      JOIN "Product" p ON s."ProductID" = p."ProductID"
      ORDER BY s."ProductID" ASC
    `);

    const formattedResults = result.rows.map(item => {
      let image = item.Picture;
      if (!image) {
        image = `https://placehold.co/300x200?text=${encodeURIComponent(item.ProductName)}`;
      } else if (!image.startsWith('http')) {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        image = `${backendUrl.replace(/\/$/, '')}/images/${image}`;
      }

      let status = 'Normal';
      let statusColor = '#22c55e';
      
      if (Number(item.quantity) <= 0) {
        status = 'Out of Stock';
        statusColor = '#ef4444';
      } else if (Number(item.quantity) < 5) {
        status = 'Low Stock';
        statusColor = '#f59e0b';
      }

      return {
        ...item,
        category: item.category || 'วัตถุดิบหลัก',
        image: image,
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

// Add new product + stock + image
exports.addProduct = async (req, res) => {
  try {
    const { ProductName, quantity, unit, category, Picture } = req.body;

    // Auto generate ProductID
    const lastRes = await db.query('SELECT "ProductID" FROM "Product" ORDER BY "ProductID" DESC LIMIT 1');
    let nextId = 'P01';
    if (lastRes.rows.length > 0) {
      const lastId = lastRes.rows[0].ProductID;
      const num = parseInt(lastId.substring(1)) + 1;
      nextId = 'P' + num.toString().padStart(2, '0');
    }

    // Save image if base64 provided
    const finalPicture = await saveBase64Image(Picture, `product_${nextId}`);

    // Insert into Product table
    await db.query(
      'INSERT INTO "Product" ("ProductID", "ProductName", "Picture", "category") VALUES ($1, $2, $3, $4)',
      [nextId, ProductName, finalPicture || null, category || 'วัตถุดิบหลัก']
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
    // 23503 is the PostgreSQL error code for foreign_key_violation
    if (err.code === '23503') {
      return res.status(400).json({ message: 'ไม่สามารถลบวัตถุดิบนี้ได้ เนื่องจากมีประวัติการเบิกหรือถูกใช้งานในระบบแล้ว' });
    }
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update product name + stock unit + category + picture
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { ProductName, unit, category, Picture } = req.body;

    let finalPicture = null;
    if (Picture) {
      finalPicture = await saveBase64Image(Picture, `product_${id}`);
    }

    // Update product name, category, and picture
    if (finalPicture) {
      await db.query(
        'UPDATE "Product" SET "ProductName" = $1, "category" = $2, "Picture" = $3 WHERE "ProductID" = $4',
        [ProductName, category || 'วัตถุดิบหลัก', finalPicture, id]
      );
    } else {
      await db.query(
        'UPDATE "Product" SET "ProductName" = $1, "category" = $2 WHERE "ProductID" = $3',
        [ProductName, category || 'วัตถุดิบหลัก', id]
      );
    }

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

// Withdraw stock (เบิกวัตถุดิบ) and save to Invoice table
exports.withdrawStock = async (req, res) => {
  try {
    const { ProductID, Weight, InvDate, user_id } = req.body;

    if (!ProductID || !Weight || Number(Weight) <= 0) {
      return res.status(400).json({ message: 'กรุณาระบุวัตถุดิบและจำนวนที่ต้องการเบิก' });
    }

    const weightNum = parseFloat(Weight);

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Auto-generate InvoiceNo (e.g. INV-YYYYMMDD-001)
    const lastInvRes = await db.query(
      'SELECT "InvoiceNo" FROM "Invoice" WHERE "InvoiceNo" LIKE $1 ORDER BY "InvoiceNo" DESC LIMIT 1',
      [`INV-${dateStr}-%`]
    );
    let invCount = 1;
    if (lastInvRes.rows.length > 0) {
      const lastInv = lastInvRes.rows[0].InvoiceNo;
      const parts = lastInv.split('-');
      if (parts.length >= 3) {
        invCount = parseInt(parts[2], 10) + 1;
      }
    }
    const InvoiceNo = `INV-${dateStr}-${String(invCount).padStart(3, '0')}`.slice(0, 20);

    // Start transaction
    await db.query('BEGIN');

    // 1. Insert into Invoice table
    const invoiceDate = InvDate || today.toISOString().slice(0, 10);
    await db.query(
      `INSERT INTO "Invoice" ("InvoiceNo", "InvDate", "ProductId", "Weight", withdrawn_by) 
       VALUES ($1, $2, $3, $4, $5)`,
      [InvoiceNo, invoiceDate, ProductID, weightNum, user_id || null]
    );

    // 2. Deduct from Stock table
    await db.query(
      `UPDATE "Stock" 
       SET quantity = GREATEST(0, quantity - $1), last_update = CURRENT_TIMESTAMP 
       WHERE "ProductID" = $2`,
      [weightNum, ProductID]
    );

    await db.query('COMMIT');

    res.status(201).json({
      message: 'เบิกวัตถุดิบสำเร็จและบันทึกใบสำคัญเรียบร้อยแล้ว',
      invoice: {
        InvoiceNo,
        InvDate: invoiceDate,
        ProductId: ProductID,
        Weight: weightNum
      }
    });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error withdrawing stock:', err.message);
    res.status(500).send('Server Error');
  }
};

// Get all invoices (ประวัติการเบิกวัตถุดิบ)
exports.getInvoices = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT i."InvoiceNo", i."InvDate", i."ProductId", p."ProductName", i."Weight", s.unit, u.firstname, u.lastname
      FROM "Invoice" i
      LEFT JOIN "Product" p ON i."ProductId" = p."ProductID"
      LEFT JOIN "Stock" s ON i."ProductId" = s."ProductID"
      LEFT JOIN "User" u ON i.withdrawn_by = u.user_id
      ORDER BY i."InvDate" DESC, i."InvoiceNo" DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting invoices:', err.message);
    res.status(500).send('Server Error');
  }
};
