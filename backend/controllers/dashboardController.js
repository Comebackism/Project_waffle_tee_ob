const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Today's Sales
    const todaySalesRes = await db.query(`
      SELECT SUM(total_amount) as total
      FROM "Order"
      WHERE DATE(created_at) = CURRENT_DATE AND "Status_id" = 'S05' AND is_archived = false
    `);
    const todaySales = parseFloat(todaySalesRes.rows[0].total || 0);

    // 2. Today's Orders (live from Order table)
    const totalOrdersRes = await db.query(`
      SELECT COUNT(*) as count
      FROM "Order"
      WHERE DATE(created_at) = CURRENT_DATE AND is_archived = false
    `);
    const totalOrders = parseInt(totalOrdersRes.rows[0].count || 0);

    // 3. All-time Sales (live orders + archived daily summaries)
    const allTimeSalesRes = await db.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM "Order"
      WHERE "Status_id" = 'S05' AND is_archived = false
    `);
    const archivedSalesRes = await db.query(`
      SELECT COALESCE(SUM(total_sales), 0) as total,
             COALESCE(SUM(total_orders), 0) as orders
      FROM "Daily_Summary"
    `);
    const totalSales = parseFloat(allTimeSalesRes.rows[0].total || 0) + parseFloat(archivedSalesRes.rows[0].total || 0);
    const archivedOrders = parseInt(archivedSalesRes.rows[0].orders || 0);

    // 4. Sales Trend (Weekly or Monthly)
    const range = req.query.range || 'week';
    const intervalStr = range === 'month' ? '29 days' : '6 days';
    
    const weeklySalesRes = await db.query(`
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${intervalStr}',
          CURRENT_DATE,
          '1 day'::interval
        )::date AS date
      )
      SELECT 
        TO_CHAR(d.date, 'Day') as day_name,
        d.date,
        COALESCE(SUM(o.total_amount), 0) + COALESCE(ds.total_sales, 0) as sales
      FROM dates d
      LEFT JOIN "Order" o ON DATE(o.created_at) = d.date AND o."Status_id" = 'S05' AND o.is_archived = false
      LEFT JOIN "Daily_Summary" ds ON ds.summary_date = d.date
      GROUP BY d.date, ds.total_sales
      ORDER BY d.date ASC
    `);

    // Format for recharts
    const thaiDays = {
      'Monday   ': 'จ.', 'Tuesday  ': 'อ.', 'Wednesday': 'พ.', 'Thursday ': 'พฤ.', 'Friday   ': 'ศ.', 'Saturday ': 'ส.', 'Sunday   ': 'อา.'
    };
    const weeklySales = weeklySalesRes.rows.map(r => {
      const d = new Date(r.date);
      const shortDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}`;
      const fullDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      const dayName = thaiDays[r.day_name] || r.day_name.trim().substring(0,2);
      return {
        name: `${dayName} ${shortDate}`,
        fullDate: fullDate,
        sales: parseFloat(r.sales)
      };
    });

    // 5. Best Selling Products (Current Month: live orders + archived daily summary)
    const bestSellingRes = await db.query(`
      WITH monthly_sales AS (
        -- Live orders from today
        SELECT 
          oi.menu_id, 
          SUM(oi.quantity) as sold
        FROM "Order_Item" oi
        JOIN "Order" o ON oi.order_id = o.order_id
        WHERE o."Status_id" = 'S05' AND o.is_archived = false
          AND EXTRACT(MONTH FROM o.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM o.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY oi.menu_id

        UNION ALL

        -- Archived sales for this month
        SELECT 
          dms.menu_id, 
          SUM(dms.quantity_sold) as sold
        FROM "Daily_Menu_Summary" dms
        WHERE EXTRACT(MONTH FROM dms.summary_date) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM dms.summary_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY dms.menu_id
      )
      SELECT 
        m.name,
        m."Picture" as image,
        SUM(ms.sold) as sold
      FROM monthly_sales ms
      JOIN "Menu" m ON ms.menu_id = m.menu_id
      GROUP BY m.menu_id, m.name, m."Picture"
      ORDER BY sold DESC
      LIMIT 3
    `);
    const bestSelling = bestSellingRes.rows;

    // 6. Stock Alerts (Real data from Stock table)
    const stockAlertsRes = await db.query(`
      SELECT s.stock_id, s."ProductID", p."ProductName", s.quantity, s.unit
      FROM "Stock" s
      JOIN "Product" p ON s."ProductID" = p."ProductID"
      WHERE s.quantity < 5
      ORDER BY s.quantity ASC
    `);
    const stockAlerts = stockAlertsRes.rows.map(row => ({
      id: row.stock_id,
      productId: row.ProductID,
      name: row.ProductName,
      status: row.quantity <= 0 
        ? `หมดแล้ว` 
        : `ใกล้หมด (เหลือ ${Number(row.quantity).toFixed(row.unit === 'กิโลกรัม' || row.unit === 'กรัม' ? 1 : 0)}${row.unit})`,
      quantity: row.quantity,
      unit: row.unit
    }));

    res.json({
      todaySales,
      todayOrders: totalOrders,
      totalOrders: totalOrders + archivedOrders,
      totalSales,
      weeklySales,
      bestSelling,
      stockAlerts
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get sales for a specific date range
exports.getSalesByDate = async (req, res) => {
  try {
    const { startDate, endDate, date } = req.query; // Support both old 'date' and new 'startDate', 'endDate'
    
    const start = startDate || date;
    const end = endDate || date;

    if (!start || !end) {
      return res.status(400).json({ message: 'startDate and endDate (or date) query parameters are required (YYYY-MM-DD)' });
    }

    let sales = 0;
    let orders = 0;

    // For past dates: check Daily_Summary
    const archiveRes = await db.query(`
      SELECT 
        COALESCE(SUM(total_sales), 0) as total_sales,
        COALESCE(SUM(total_orders), 0) as total_orders
      FROM "Daily_Summary"
      WHERE summary_date >= $1 AND summary_date <= $2
    `, [start, end]);

    if (archiveRes.rows.length > 0) {
      sales += parseFloat(archiveRes.rows[0].total_sales || 0);
      orders += parseInt(archiveRes.rows[0].total_orders || 0);
    }

    // Also check for any non-archived orders in that range
    const liveRes = await db.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_sales,
        COUNT(*) as total_orders
      FROM "Order"
      WHERE DATE(created_at) >= $1 AND DATE(created_at) <= $2 AND "Status_id" = 'S05' AND is_archived = false
    `, [start, end]);
    sales += parseFloat(liveRes.rows[0].total_sales || 0);
    orders += parseInt(liveRes.rows[0].total_orders || 0);

    res.json({ startDate: start, endDate: end, sales, orders });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
