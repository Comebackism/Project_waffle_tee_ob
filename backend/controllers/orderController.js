const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { items, pay_method, total_amount, slip_picture, note, total_calories } = req.body;
    
    // items = [{ menu_id, quantity, toppings: [{topping_id, quantity}] }]

    // Start transaction
    await db.query('BEGIN');

    // 1. Generate order_id
    const orderCountResult = await db.query('SELECT COUNT(*) FROM "Order"');
    const orderCount = parseInt(orderCountResult.rows[0].count) + 1;
    const order_id = `ORD-${String(orderCount).padStart(5, '0')}`;

    // 2. Generate queue_number
    const queueCountResult = await db.query('SELECT COUNT(*) FROM "Order" WHERE DATE(created_at) = CURRENT_DATE');
    const queueCount = parseInt(queueCountResult.rows[0].count) + 1;
    const queue_number = `#E${String(queueCount).padStart(3, '0')}`;

    // Handle base64 slip_picture
    let final_slip_picture = slip_picture;
    if (slip_picture && slip_picture.startsWith('data:image')) {
      const matches = slip_picture.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const type = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const extension = type.split('/')[1] || 'jpg';
        const filename = `${order_id}_slip.${extension}`;
        const filepath = path.join(__dirname, '../public/images', filename);
        
        // Ensure public/images directory exists
        if (!fs.existsSync(path.dirname(filepath))) {
            fs.mkdirSync(path.dirname(filepath), { recursive: true });
        }
        
        fs.writeFileSync(filepath, buffer);
        final_slip_picture = filename;
      }
    }

    // 3. Insert Order (Status: S01 = รอชำระเงิน, or set pay_time if paid)
    const isPaid = pay_method === 'promptpay' && final_slip_picture;
    const orderResult = await db.query(
      `INSERT INTO "Order" (order_id, queue_number, "Status_id", pay_method, total_amount, slip_picture, note, total_calories, pay_time) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [order_id, queue_number, 'S01', pay_method, total_amount, final_slip_picture, note, total_calories || 0, isPaid ? new Date() : null]
    );

    // 4. Insert Order Items
    let item_counter = 1;
    for (const item of items) {
      const order_item_id = `${order_id}-I${item_counter}`;
      await db.query(
        `INSERT INTO "Order_Item" (order_item_id, order_id, menu_id, quantity) VALUES ($1, $2, $3, $4)`,
        [order_item_id, order_id, item.menu_id, item.quantity]
      );

      // 5. Insert Toppings for the item
      if (item.toppings && item.toppings.length > 0) {
        for (const t of item.toppings) {
          await db.query(
            `INSERT INTO "Order_Item_Topping" (order_item_id, topping_id, quantity) VALUES ($1, $2, $3)`,
            [order_item_id, t.topping_id, t.quantity]
          );
        }
      }
      item_counter++;
    }

    await db.query('COMMIT');
    res.status(201).json({ message: 'Order created', order_id, queue_number });

  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get orders by status (with items details)
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.*, s.statusname 
      FROM "Order" o 
      JOIN "Status" s ON o."Status_id" = s.status_id
    `;
    let params = [];

    if (status) {
      query += ' WHERE o."Status_id" = $1';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get single order with full details (items + toppings)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get order
    const orderResult = await db.query(`
      SELECT o.*, s.statusname, u.firstname, u.lastname, u.username, r."RoleName"
      FROM "Order" o 
      JOIN "Status" s ON o."Status_id" = s.status_id
      LEFT JOIN "User" u ON o.user_id = u.user_id
      LEFT JOIN "Role" r ON u."Role_id" = r."Role_id"
      WHERE o.order_id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // 2. Get order items with menu info
    const itemsResult = await db.query(`
      SELECT oi.*, m.name as menu_name, m.price as menu_price, m."Picture" as menu_picture
      FROM "Order_Item" oi
      JOIN "Menu" m ON oi.menu_id = m.menu_id
      WHERE oi.order_id = $1
      ORDER BY oi.order_item_id ASC
    `, [id]);

    // 3. Get toppings for each item
    for (let item of itemsResult.rows) {
      const toppingsResult = await db.query(`
        SELECT oit.*, t.name as topping_name, t.price as topping_price
        FROM "Order_Item_Topping" oit
        JOIN "Topping" t ON oit.topping_id = t.topping_id
        WHERE oit.order_item_id = $1
      `, [item.order_item_id]);
      item.toppings = toppingsResult.rows;
    }

    // 4. Calculate queue ahead (orders today, created before this one, not finished)
    const queueAheadResult = await db.query(`
      SELECT COUNT(*) 
      FROM "Order" 
      WHERE DATE(created_at) = CURRENT_DATE 
      AND created_at < $1 
      AND "Status_id" IN ('S01', 'S02', 'S03')
    `, [order.created_at]);

    order.queue_ahead = parseInt(queueAheadResult.rows[0].count);
    order.items = itemsResult.rows;
    res.json(order);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all orders for today (for dashboards)
exports.getOrdersToday = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.*, s.statusname, u.firstname, u.lastname, u.username
      FROM "Order" o
      JOIN "Status" s ON o."Status_id" = s.status_id
      LEFT JOIN "User" u ON o.user_id = u.user_id
      WHERE DATE(o.created_at) = CURRENT_DATE
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_id, user_id } = req.body;

    // If changing to paid / confirmed (S02 or later), ensure pay_time is updated
    if (status_id === 'S02' || status_id === 'S03' || status_id === 'S04' || status_id === 'S05') {
      if (user_id) {
        await db.query(
          `UPDATE "Order" 
           SET "Status_id" = $1, 
               user_id = COALESCE(user_id, $2),
               pay_time = COALESCE(pay_time, CURRENT_TIMESTAMP) 
           WHERE order_id = $3`,
          [status_id, user_id, id]
        );
      } else {
        await db.query(
          `UPDATE "Order" 
           SET "Status_id" = $1, 
               pay_time = COALESCE(pay_time, CURRENT_TIMESTAMP) 
           WHERE order_id = $2`,
          [status_id, id]
        );
      }
    } else {
      await db.query('UPDATE "Order" SET "Status_id" = $1 WHERE order_id = $2', [status_id, id]);
    }
    
    // Return updated order with status name
    const result = await db.query(`
      SELECT o.*, s.statusname 
      FROM "Order" o 
      JOIN "Status" s ON o."Status_id" = s.status_id
      WHERE o.order_id = $1
    `, [id]);

    res.json({ message: 'Order status updated', order: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Clear all orders (Reset System for the day)
exports.clearAllOrders = async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE "Order" CASCADE');
    res.json({ message: 'ล้างข้อมูลออเดอร์ทั้งหมดเรียบร้อยแล้ว (รีเซ็ตคิวและรหัส)' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
