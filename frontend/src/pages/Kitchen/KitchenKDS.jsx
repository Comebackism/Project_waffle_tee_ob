import React, { useState, useEffect, useRef } from 'react';
import { FaFire, FaCheck, FaSyncAlt, FaClock, FaCircle, FaCheckCircle, FaRegSquare, FaCheckSquare, FaPlus, FaMinus, FaUtensils, FaShoppingBag } from 'react-icons/fa';
import BackofficeLayout from '../../layouts/BackofficeLayout';
import './KitchenKDS.css';
import { apiFetch, API_BASE } from '../../utils/api';

export default function KitchenKDS() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedCounts, setCompletedCounts] = useState({});

  const ordersRef = useRef([]);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const res = await apiFetch('/api/orders/today');
      const data = await res.json();
      
      const kitchenOrders = data.filter(o => ['S02', 'S03', 'S04'].includes(o.Status_id));
      
      const detailed = await Promise.all(
        kitchenOrders.map(async (order) => {
          const existing = ordersRef.current.find(o => o.order_id === order.order_id);
          if (existing && existing.items) {
            return { ...existing, ...order }; // Keep items, update status from DB
          }
          try {
            const detailRes = await apiFetch(`/api/orders/${order.order_id}`);
            return await detailRes.json();
          } catch {
            return order;
          }
        })
      );
      setOrders(detailed);
      
      // Auto-check items for orders that are already in S04 status
      setCompletedCounts(prev => {
        const nextCounts = { ...prev };
        detailed.forEach(order => {
          if (order.Status_id === 'S04' && order.items) {
            order.items.forEach((item, idx) => {
              const key = `${order.order_id}-${idx}`;
              if (nextCounts[key] === undefined) {
                nextCounts[key] = item.quantity;
              }
            });
          }
        });
        return nextCounts;
      });

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
    // 1. Optimistic UI update (prevents bouncing)
    setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, Status_id: newStatusId } : o));

    try {
      if (newStatusId === 'S04') {
        const orderToUpdate = ordersRef.current.find(o => o.order_id === orderId);
        if (orderToUpdate && orderToUpdate.items) {
          setCompletedCounts(prev => {
            const nextCounts = { ...prev };
            orderToUpdate.items.forEach((item, idx) => {
              nextCounts[`${orderId}-${idx}`] = item.quantity;
            });
            return nextCounts;
          });
        }
      }

      const storedUser = localStorage.getItem('currentUser');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const userId = currentUser ? currentUser.user_id : null;

      await apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status_id: newStatusId, user_id: userId })
      });
      // The background interval will sync this up later, no need to force await fetchOrders() here.
    } catch (err) {
      console.error('Error:', err);
      fetchOrders(); // Revert on error
    }
  };

  const toggleCheck = (orderId, idx, max) => {
    const key = `${orderId}-${idx}`;
    setCompletedCounts(prev => ({
      ...prev,
      [key]: prev[key] === max ? 0 : max
    }));
  };

  const setExactCount = (e, orderId, idx, count) => {
    e.stopPropagation();
    const key = `${orderId}-${idx}`;
    setCompletedCounts(prev => ({
      ...prev,
      [key]: prev[key] === count ? count - 1 : count
    }));
  };



  // เมื่อเช็คครบทุกชิ้นในขั้นตอน "กำลังปรุง" (S03) ให้ย้ายออเดอร์ไป "พร้อมเสิร์ฟ" (S04) อัตโนมัติ
  useEffect(() => {
    orders.forEach((order) => {
      if (order.Status_id !== 'S03' || !order.items || order.items.length === 0) return;
      const allDone = order.items.every(
        (item, idx) => (completedCounts[`${order.order_id}-${idx}`] || 0) >= item.quantity
      );
      if (allDone) updateStatus(order.order_id, 'S04');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCounts, orders]);

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
                {order.order_type === 'takeaway' ? (
                  <span style={{ background: '#f97316', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    <FaShoppingBag /> กลับบ้าน {order.table_no && !order.table_no.startsWith('หน้าร้าน') ? `(โต๊ะ ${order.table_no})` : ''}
                  </span>
                ) : (
                  <span style={{ background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    <FaUtensils /> ทานที่ร้าน {order.table_no ? `(โต๊ะ ${order.table_no})` : ''}
                  </span>
                )}
                {statusId === 'S04' && <FaCheck className="kds-task-done-icon" />}
              </div>
              
              <div className="kds-task-items">
                {order.items && order.items.map((item, idx) => {
                  const key = `${order.order_id}-${idx}`;
                  const doneCount = completedCounts[key] || 0;
                  const isDone = doneCount === item.quantity;
                  // แสดงเช็คลิสเฉพาะขั้นตอน "กำลังปรุง" (S03) และ "พร้อมเสิร์ฟ" (S04) เท่านั้น
                  const showChecklist = statusId === 'S03' || statusId === 'S04';

                  return (
                    <div 
                      key={idx} 
                      className={`kds-task-item-container ${isDone && showChecklist ? 'done' : ''}`}
                      style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: showChecklist ? 'pointer' : 'default', opacity: isDone && showChecklist ? 0.5 : 1, transition: 'all 0.2s', padding: '8px 0', borderBottom: '1px dashed #e5e7eb' }}
                      onClick={() => showChecklist && toggleCheck(order.order_id, idx, item.quantity)}
                    >
                      <div className="kds-task-item-main" style={{ display: 'flex', alignItems: 'center' }}>
                        {showChecklist && (
                          <div className="kds-t-checkbox" style={{ color: isDone ? '#10b981' : '#d1d5db', fontSize: '18px', marginRight: '8px' }}>
                            {isDone ? <FaCheckSquare /> : <FaRegSquare />}
                          </div>
                        )}
                        <div className="kds-t-details" style={{ flex: 1, textDecoration: isDone && showChecklist ? 'line-through' : 'none' }}>
                          <span className="kds-t-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="kds-t-qty">{item.quantity}x</span> 
                            {item.menu_name}
                          </span>
                          {item.toppings && item.toppings.length > 0 && (
                            <div className="kds-t-toppings">
                              {item.toppings.map((t, i) => (
                                <div key={i}>เพิ่ม {t.topping_name} {t.quantity > 1 ? `x${t.quantity}` : ''}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {showChecklist && item.quantity > 1 && (
                        <div 
                          className="kds-t-dots-grid" 
                          style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginLeft: '26px' }}
                          onClick={e => e.stopPropagation()}
                        >
                          {Array.from({ length: item.quantity }).map((_, i) => {
                            const isBoxDone = i < doneCount;
                            return (
                              <div 
                                key={i}
                                onClick={(e) => setExactCount(e, order.order_id, idx, i + 1)}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '6px',
                                  border: `2px solid ${isBoxDone ? '#10b981' : '#e5e7eb'}`,
                                  background: isBoxDone ? '#10b981' : '#f9fafb',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s'
                                }}
                              >
                                {isBoxDone && <FaCheck size={12} />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {order.note && (
                <div className="kds-task-note">
                  หมายเหตุ : {order.note}
                </div>
              )}

              {/* ความคืบหน้า (แสดงเฉพาะกำลังปรุง) */}
              {statusId === 'S03' && order.items && order.items.length > 0 && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>ทำแล้ว {order.items.reduce((s, it, idx) => s + Math.min(completedCounts[`${order.order_id}-${idx}`] || 0, it.quantity), 0)} / {order.items.reduce((s, it) => s + it.quantity, 0)} ชิ้น</span>
                  <span style={{ color: '#f97316', fontWeight: 600 }}>กำลังทยอยเสิร์ฟ</span>
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
