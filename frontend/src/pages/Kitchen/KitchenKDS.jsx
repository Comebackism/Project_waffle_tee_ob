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

  // ปรับจำนวนชิ้นที่ทำเสร็จ (+1 ติ๊ก / -1 ยกเลิก) ให้ชิ้นนั้นย้ายไป "พร้อมเสิร์ฟ" ทีละชิ้น
  const adjustCount = (e, orderId, idx, delta, max) => {
    if (e) e.stopPropagation();
    const key = `${orderId}-${idx}`;
    setCompletedCounts(prev => {
      const cur = prev[key] || 0;
      let next = cur + delta;
      if (next < 0) next = 0;
      if (next > max) next = max;
      return { ...prev, [key]: next };
    });
  };



  const getOrdersByStatus = (statusId) => orders.filter(o => o.Status_id === statusId);

  // คำนวณจำนวนที่ทำเสร็จแล้วของออเดอร์
  const orderDoneTotal = (order) => {
    if (!order.items) return 0;
    return order.items.reduce((s, it, idx) => s + Math.min(completedCounts[`${order.order_id}-${idx}`] || 0, it.quantity), 0);
  };
  const orderTotalQty = (order) => {
    if (!order.items) return 0;
    return order.items.reduce((s, it) => s + it.quantity, 0);
  };

  // การ์ดแสดงรายการ (ใช้ร่วมกันทั้ง S03 และ S04)
  const renderSplitCard = (order, mode) => {
    const isServing = mode === 'serving'; // พร้อมเสิร์ฟ column (อ่านอย่างเดียว)
    const isPending = mode === 'pending'; // รอดำเนินการ (ยังไม่เริ่มปรุง)
    const items = order.items || [];
    const hasAnyDone = items.some((it, idx) => (completedCounts[`${order.order_id}-${idx}`] || 0) > 0);
    const renderNotes = mode === 'cooking' || mode === 'pending';

    return (
      <div key={order.order_id} className="kds-task-card"
        style={isServing ? { borderLeft: '4px solid #10b981' } : {}}
      >
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
          {isServing && <FaCheck className="kds-task-done-icon" />}
        </div>

        <div className="kds-task-items">
          {items.map((item, idx) => {
            const doneCount = completedCounts[`${order.order_id}-${idx}`] || 0;
            const pending = item.quantity - doneCount;
            const key = `${order.order_id}-${idx}`;

            if (isServing && doneCount === 0) return null; // ในคอลัมน์พร้อมเสิร์ฟแสดงเฉพาะที่ทำเสร็จแล้ว
            if (!isServing && !isPending && pending === 0) return null; // ในคอลัมน์กำลังปรุงแสดงเฉพาะที่ยังไม่เสร็จ
            if (isPending && pending === 0) return null; // รอดำเนินการ: ซ่อนรายการที่ทำเสร็จแล้ว (ไม่ควรเกิด)

            const showPending = !isServing && pending > 0;
            const showDone = doneCount > 0;

            return (
              <div key={idx} className={`kds-task-item-container`}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', borderRadius: '8px', borderLeft: isServing ? '3px solid #10b981' : '3px solid transparent', background: isServing ? '#f0fdf4' : 'transparent', borderBottom: '1px dashed #e5e7eb', cursor: 'default' }}>
                <div className="kds-task-item-main" style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="kds-t-details" style={{ flex: 1, textDecoration: isServing ? 'line-through' : 'none' }}>
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
                    {isServing ? (
                      <span className="kds-t-status done">พร้อมเสิร์ฟ ({doneCount} ชิ้น)</span>
                    ) : doneCount > 0 ? (
                      <span className="kds-t-status cooking">กำลังปรุง {doneCount}/{item.quantity} | พร้อมเสิร์ฟ {doneCount}</span>
                    ) : (
                      <span className="kds-t-status">รอปรุง</span>
                    )}
                  </div>
                </div>

                {/* ช่องติ๊กเฉพาะคอลัมน์กำลังปรุง (S03) */}
                {!isServing && !isPending && item.quantity > 1 && (
                  <div className="kds-t-unit-rows"
                    style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '26px' }}
                    onClick={e => e.stopPropagation()}
                  >
                    {showPending && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', minWidth: '78px' }}>กำลังปรุง {pending}</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {Array.from({ length: pending }).map((_, i) => (
                            <div key={`todo-${i}`} title="ติ๊กว่าเสร็จ (ย้ายไปพร้อมเสิร์ฟ)"
                              onClick={(e) => adjustCount(e, order.order_id, idx, 1, item.quantity)}
                              style={{ width: '24px', height: '24px', borderRadius: '6px', border: '2px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', transition: 'all 0.15s' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {showDone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', minWidth: '78px' }}>พร้อมเสิร์ฟ {doneCount}</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {Array.from({ length: doneCount }).map((_, i) => (
                            <div key={`done-${i}`} title="คลิกเพื่อยกเลิก"
                              onClick={(e) => adjustCount(e, order.order_id, idx, -1, item.quantity)}
                              style={{ width: '24px', height: '24px', borderRadius: '6px', border: '2px solid #10b981', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                              <FaCheck size={12} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {renderNotes && order.note && (
          <div className="kds-task-note">หมายเหตุ : {order.note}</div>
        )}

        {mode === 'cooking' && (
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ทำแล้ว {orderDoneTotal(order)} / {orderTotalQty(order)} ชิ้น</span>
            {hasAnyDone && <span style={{ color: '#16a34a', fontWeight: 600 }}>ทยอยเสิร์ฟแล้ว {orderDoneTotal(order)} ชิ้น</span>}
          </div>
        )}

        {/* Action Button */}
        {mode === 'pending' && (
          <button className="kds-task-btn outline" onClick={() => updateStatus(order.order_id, 'S03')}>
            <FaFire /> เริ่มปรุง
          </button>
        )}
        {mode === 'cooking' && (
          <button className="kds-task-btn filled" onClick={() => updateStatus(order.order_id, 'S04')}>
            <FaCheck /> พร้อมเสิร์ฟ
          </button>
        )}
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
            {/* S02: รอดำเนินการ */}
            <div className="kds-column">
              <div className="kds-column-header">
                <div className="kds-col-title-group">
                  <h3>รอดำเนินการ</h3>
                  <span className="kds-col-count">{getOrdersByStatus('S02').length}</span>
                </div>
                <span className="kds-col-icon" style={{color: '#9ca3af'}}><FaClock /></span>
              </div>
              <div className="kds-column-body">
                {getOrdersByStatus('S02').map(order => renderSplitCard(order, 'pending'))}
              </div>
            </div>

            {/* S03: กำลังปรุง (แสดงเฉพาะของที่ยังไม่เสร็จ + ช่องติ๊ก) */}
            <div className="kds-column">
              <div className="kds-column-header">
                <div className="kds-col-title-group">
                  <h3>กำลังปรุง</h3>
                  <span className="kds-col-count">{getOrdersByStatus('S03').length}</span>
                </div>
                <span className="kds-col-icon" style={{color: '#dc2626'}}><FaCircle /></span>
              </div>
              <div className="kds-column-body">
                {getOrdersByStatus('S03').map(order => renderSplitCard(order, 'cooking'))}
              </div>
            </div>

            {/* S04: พร้อมเสิร์ฟ (S04 จริง + ออเดอร์ S03 ที่ทยอยเสิร์ฟบางส่วน) */}
            {(() => {
              const s04Orders = getOrdersByStatus('S04');
              const s03Partial = getOrdersByStatus('S03').filter(o => orderDoneTotal(o) > 0);
              const totalS04 = s04Orders.length + s03Partial.length;
              return (
                <div className="kds-column">
                  <div className="kds-column-header">
                    <div className="kds-col-title-group">
                      <h3>พร้อมเสิร์ฟ</h3>
                      <span className="kds-col-count">{totalS04}</span>
                    </div>
                    <span className="kds-col-icon" style={{color: '#10b981'}}><FaCheckCircle /></span>
                  </div>
                  <div className="kds-column-body">
                    {s04Orders.map(order => (
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
                          <FaCheck className="kds-task-done-icon" />
                        </div>
                        <div className="kds-task-items">
                          {order.items && order.items.map((item, idx) => (
                            <div key={idx} style={{ padding: '8px', borderBottom: '1px dashed #e5e7eb', background: '#f0fdf4', borderLeft: '3px solid #10b981', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 'bold' }}>{item.quantity}x</span> {item.menu_name}
                              </div>
                              {item.toppings && item.toppings.length > 0 && (
                                <div className="kds-t-toppings">
                                  {item.toppings.map((t, i) => (
                                    <div key={i}>เพิ่ม {t.topping_name} {t.quantity > 1 ? `x${t.quantity}` : ''}</div>
                                  ))}
                                </div>
                              )}
                              <span className="kds-t-status done">เสร็จแล้ว</span>
                            </div>
                          ))}
                        </div>
                        {order.note && <div className="kds-task-note">หมายเหตุ : {order.note}</div>}
                        <button className="kds-task-btn outline-muted" onClick={() => updateStatus(order.order_id, 'S05')}>
                          เคลียร์ออเดอร์
                        </button>
                      </div>
                    ))}
                    {s03Partial.map(order => renderSplitCard(order, 'serving'))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
