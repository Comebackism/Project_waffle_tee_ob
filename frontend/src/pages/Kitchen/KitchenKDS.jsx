import React, { useState, useEffect } from 'react';
import { FaFire, FaCheck, FaSyncAlt, FaClock, FaCircle, FaCheckCircle } from 'react-icons/fa';
import BackofficeLayout from '../../layouts/BackofficeLayout';
import './KitchenKDS.css';

export default function KitchenKDS() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders/today');
      const data = await res.json();
      
      const kitchenOrders = data.filter(o => ['S02', 'S03', 'S04'].includes(o.Status_id));
      
      const detailed = await Promise.all(
        kitchenOrders.map(async (order) => {
          try {
            const detailRes = await fetch(`http://localhost:5000/api/orders/${order.order_id}`);
            return await detailRes.json();
          } catch {
            return order;
          }
        })
      );
      setOrders(detailed);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId, newStatusId) => {
    try {
      await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: newStatusId })
      });
      fetchOrders();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const getOrdersByStatus = (statusId) => orders.filter(o => o.Status_id === statusId);

  const renderColumn = (title, count, statusId, badgeIcon, badgeColor) => {
    const columnOrders = getOrdersByStatus(statusId);
    return (
      <div className="kds-column">
        <div className="kds-column-header">
          <div className="kds-col-title-group">
            <h3>{title}</h3>
            <span className="kds-col-count">{count}</span>
          </div>
          <span className="kds-col-icon" style={{color: badgeColor}}>{badgeIcon}</span>
        </div>
        
        <div className="kds-column-body">
          {columnOrders.map(order => (
            <div key={order.order_id} className="kds-task-card">
              <div className="kds-task-header">
                <span className="kds-task-id">{order.queue_number}</span>
                {statusId === 'S04' && <FaCheck className="kds-task-done-icon" />}
              </div>
              
              <div className="kds-task-items">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="kds-task-item">
                    <span className="kds-t-qty">{item.quantity}x</span>
                    <div className="kds-t-details">
                      <span className="kds-t-name">{item.menu_name}</span>
                      {item.toppings && item.toppings.length > 0 && (
                        <div className="kds-t-toppings">
                          {item.toppings.map((t, i) => (
                            <div key={i}>เพิ่ม {t.topping_name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {order.note && (
                <div className="kds-task-note">
                  หมายเหตุ : {order.note}
                </div>
              )}

              {/* Action Button */}
              {statusId === 'S02' && (
                <button className="kds-task-btn outline" onClick={() => updateStatus(order.order_id, 'S03')}>
                  <FaFire /> เริ่มปรุง
                </button>
              )}
              {statusId === 'S03' && (
                <button className="kds-task-btn filled" onClick={() => updateStatus(order.order_id, 'S04')}>
                  <FaCheck /> พร้อมเสิร์ฟ
                </button>
              )}
              {statusId === 'S04' && (
                <button className="kds-task-btn outline-muted" onClick={() => updateStatus(order.order_id, 'S05')}>
                  เคลียร์ออเดอร์
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Determine layout role from logged-in user
  const currentUserStr = localStorage.getItem('currentUser');
  const layoutRole = currentUserStr ? (JSON.parse(currentUserStr).Role_id === 'R01' ? 'admin' : 'kitchen') : 'kitchen';

  return (
    <BackofficeLayout role={layoutRole}>
      <div className="kds-new-page">
        <header className="kds-new-header">
          <div>
            <h1 className="kds-new-title">หน้าจอห้องครัว</h1>
            <p className="kds-new-subtitle">คิวออเดอร์</p>
          </div>
          <button className="kds-refresh-icon-btn" onClick={fetchOrders} title="รีเฟรช">
            <FaSyncAlt />
          </button>
        </header>

        {loading ? (
          <div className="kds-loading">กำลังโหลด...</div>
        ) : (
          <div className="kds-kanban-board">
            {renderColumn('รอดำเนินการ', getOrdersByStatus('S02').length, 'S02', <FaClock />, '#9ca3af')}
            {renderColumn('กำลังปรุง', getOrdersByStatus('S03').length, 'S03', <FaCircle />, '#dc2626')}
            {renderColumn('พร้อมเสิร์ฟ', getOrdersByStatus('S04').length, 'S04', <FaCheckCircle />, '#10b981')}
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
