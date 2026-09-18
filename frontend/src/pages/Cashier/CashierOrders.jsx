import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaClock, FaMoneyBillWave, FaQrcode, FaSyncAlt, FaReceipt, FaTrash, FaUtensils, FaShoppingBag, FaBan, FaExclamationTriangle } from 'react-icons/fa';
import BackofficeLayout from '../../layouts/BackofficeLayout';
import ReceiptSlip from '../../components/ReceiptSlip/ReceiptSlip';
import './CashierOrders.css';
import { apiFetch, API_BASE } from '../../utils/api';

const STATUS_LABELS = {
  'S01': { label: 'รอชำระเงิน', color: '#f59e0b' },
  'S02': { label: 'รอดำเนินการ', color: '#3b82f6' },
  'S03': { label: 'กำลังปรุง', color: '#f97316' },
  'S04': { label: 'พร้อมรับ', color: '#22c55e' },
  'S05': { label: 'เสร็จสิ้น', color: '#6b7280' },
  'S06': { label: 'ยกเลิก', color: '#ef4444' },
};

export default function CashierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('S01'); // Filter by status
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);

  const fetchOrders = () => {
    apiFetch('/api/orders/today')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Network response was not ok.');
      })
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId, newStatusId) => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const userId = currentUser ? currentUser.user_id : null;

      await apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status_id: newStatusId, user_id: userId })
      });
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const viewOrderDetail = async (orderId) => {
    try {
      const res = await apiFetch(`/api/orders/${orderId}`);
      const data = await res.json();
      setSelectedOrder(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const openReceipt = async (orderId) => {
    try {
      const res = await apiFetch(`/api/orders/${orderId}`);
      const data = await res.json();
      setReceiptOrder(data);
    } catch (err) {
      console.error('Error opening receipt:', err);
    }
  };

  const filteredOrders = orders.filter(o => o.Status_id === activeTab);

  const tabs = [
    { id: 'S01', label: 'รอชำระเงิน', count: orders.filter(o => o.Status_id === 'S01').length },
    { id: 'S02', label: 'รอดำเนินการ', count: orders.filter(o => o.Status_id === 'S02').length },
    { id: 'S03', label: 'กำลังปรุง', count: orders.filter(o => o.Status_id === 'S03').length },
    { id: 'S04', label: 'พร้อมรับ', count: orders.filter(o => o.Status_id === 'S04').length },
    { id: 'S05', label: 'เสร็จสิ้น', count: orders.filter(o => o.Status_id === 'S05').length },
    { id: 'S06', label: 'ยกเลิก', count: orders.filter(o => o.Status_id === 'S06').length },
  ];


  // Determine layout role from logged-in user
  const currentUserStr = localStorage.getItem('currentUser');
  const layoutRole = currentUserStr ? (JSON.parse(currentUserStr).Role_id === 'R01' ? 'admin' : 'cashier') : 'cashier';

  return (
    <BackofficeLayout role={layoutRole}>
      <div className="co-page">
        <header className="co-header">
          <div>
            <h1 className="co-title">จัดการออเดอร์</h1>
            <p className="co-subtitle">ระบบรับชำระเงินและจัดการสถานะ</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>

            <button className="co-refresh-btn" onClick={fetchOrders}>
              <FaSyncAlt /> รีเฟรช
            </button>
          </div>
        </header>

        {/* Custom Tabs inside layout */}
        <div className="co-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`co-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? { borderBottomColor: STATUS_LABELS[tab.id].color, color: STATUS_LABELS[tab.id].color } : {}}
            >
              {tab.label}
              {tab.count > 0 && <span className="co-tab-badge" style={{ backgroundColor: STATUS_LABELS[tab.id].color }}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="co-loading">กำลังโหลด...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="co-empty">ไม่มีคำสั่งซื้อในหมวดนี้</div>
        ) : (
          <div className="co-orders-grid">
            {filteredOrders.map(order => (
              <div key={order.order_id} className="co-order-card">
                <div className="co-card-header">
                  <div>
                    <span className="co-queue">{order.queue_number}</span>
                    <span className="co-oid">{order.order_id}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    {order.order_type === 'takeaway' ? (
                      <span className="co-status-badge" style={{ backgroundColor: '#f97316', display: 'flex', alignItems: 'center', gap: '4px' }}><FaShoppingBag /> กลับบ้าน</span>
                    ) : (
                      <span className="co-status-badge" style={{ backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}><FaUtensils /> ทานที่ร้าน {order.table_no ? `(โต๊ะ ${order.table_no})` : ''}</span>
                    )}
                    <span
                      className="co-status-badge"
                      style={{ backgroundColor: STATUS_LABELS[order.Status_id]?.color }}
                    >
                      {order.statusname}
                    </span>
                  </div>
                </div>

                <div className="co-card-body">
                  <div className="co-card-row">
                    {order.pay_method === 'promptpay' ? <FaQrcode /> : <FaMoneyBillWave />}
                    <span>{order.pay_method === 'promptpay' ? 'พร้อมเพย์' : 'เงินสด'}</span>
                  </div>
                  <div className="co-card-row">
                    <FaClock />
                    <span>{new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="co-card-total">
                    {Number(order.total_amount).toFixed(2)} บาท
                  </div>
                  {order.note && (
                    <div className="co-card-note" style={{ marginTop: '8px', fontSize: '13px', color: '#ef4444', background: '#fee2e2', padding: '6px 10px', borderRadius: '6px' }}>
                      หมายเหตุ: {order.note}
                    </div>
                  )}
                </div>

                <div className="co-card-actions">
                  <button className="co-action-btn view" onClick={() => viewOrderDetail(order.order_id)}>
                    <FaEye /> ดู
                  </button>
                  {order.Status_id !== 'S06' && (
                    <button className="co-action-btn receipt-action-btn" onClick={() => openReceipt(order.order_id)} title="พิมพ์สลิป/ใบเสร็จ">
                      <FaReceipt /> สลิป
                    </button>
                  )}

                  {order.Status_id === 'S01' && (
                    <button className="co-action-btn approve" onClick={() => updateStatus(order.order_id, 'S02')}>
                      <FaCheck /> ยืนยันชำระเงิน
                    </button>
                  )}
                  {order.Status_id === 'S02' && (
                    <button className="co-action-btn cooking" onClick={() => updateStatus(order.order_id, 'S03')}>
                      <FaCheck /> ส่งไปครัว
                    </button>
                  )}
                  {order.Status_id === 'S04' && (
                    <button className="co-action-btn complete" onClick={() => updateStatus(order.order_id, 'S05')}>
                      <FaCheck /> ลูกค้ารับแล้ว
                    </button>
                  )}
                  {/* ปุ่มยกเลิกออเดอร์ — แสดงเฉพาะสถานะ รอชำระเงิน (S01) และ รอดำเนินการ (S02) */}
                  {(order.Status_id === 'S01' || order.Status_id === 'S02') && (
                    <button className="co-action-btn cancel-order" onClick={() => { setCancelOrderTarget(order); setShowCancelModal(true); }}>
                      <FaBan /> ยกเลิก
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedOrder && (
          <div className="co-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="co-modal" onClick={(e) => e.stopPropagation()}>
              <div className="co-modal-header">
                <h2>ออเดอร์ {selectedOrder.queue_number}</h2>
                <button className="co-modal-close" onClick={() => setSelectedOrder(null)}>
                  <FaTimes />
                </button>
              </div>
              <div className="co-modal-body">
                <div style={{ marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: '#374151' }}>
                        <span>{item.quantity}x {item.menu_name}</span>
                        <span>{(Number(item.menu_price || 0) * item.quantity).toFixed(2)} บาท</span>
                      </div>
                      {item.toppings && item.toppings.length > 0 && (
                        <div style={{ paddingLeft: '20px', fontSize: '13px', color: '#6b7280' }}>
                          {item.toppings.map((t, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>+ {t.topping_name} {t.quantity > 1 ? `x${t.quantity}` : ''}</span>
                              {Number(t.topping_price || 0) > 0 && <span>+ {(Number(t.topping_price || 0) * (t.quantity || 1)).toFixed(2)} บาท</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '15px' }}>
                  <strong>ยอดรวมทั้งสิ้น:</strong>
                  <strong style={{ color: '#e11d48' }}>{Number(selectedOrder.total_amount).toFixed(2)} บาท</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#4b5563' }}>
                  <strong>วิธีชำระเงิน:</strong>
                  <span>{selectedOrder.pay_method === 'promptpay' ? 'โอนเงิน / พร้อมเพย์' : 'เงินสด'}</span>
                </div>
                
                {selectedOrder.note && (
                  <p style={{ color: '#ef4444', background: '#fee2e2', padding: '8px 12px', borderRadius: '8px', marginTop: '8px' }}>
                    <strong>หมายเหตุ:</strong> {selectedOrder.note}
                  </p>
                )}
                
                {selectedOrder.pay_method === 'promptpay' && selectedOrder.slip_picture && (
                  <div style={{marginTop: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', textAlign: 'center'}}>
                    <p style={{margin: '0 0 12px 0', fontWeight: 'bold', color: '#4b5563', fontSize: '16px'}}>สลิปการโอนเงิน</p>
                    <img 
                      src={selectedOrder.slip_picture === 'uploaded_slip.jpg' ? 'https://placehold.co/400x600/e2e8f0/475569.png?text=Mock+Slip' : (selectedOrder.slip_picture.startsWith('http') ? selectedOrder.slip_picture : `${API_BASE}/images/${selectedOrder.slip_picture}`)} 
                      alt="Slip" 
                      style={{width: '100%', maxWidth: '500px', maxHeight: '600px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x600/e2e8f0/475569.png?text=Image+Not+Found';
                      }}
                    />
                  </div>
                )}
                
                <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
                  {selectedOrder.Status_id !== 'S06' && (
                    <button className="co-action-btn receipt-action-btn full" onClick={() => openReceipt(selectedOrder.order_id)}>
                      <FaReceipt /> พิมพ์ใบเสร็จ / สลิป
                    </button>
                  )}
                  {selectedOrder.Status_id === 'S01' && (
                    <button className="co-action-btn approve full" onClick={() => updateStatus(selectedOrder.order_id, 'S02')}>
                      ยืนยันชำระเงิน
                    </button>
                  )}
                  {/* ปุ่มยกเลิกออเดอร์ใน Detail Modal */}
                  {(selectedOrder.Status_id === 'S01' || selectedOrder.Status_id === 'S02') && (
                    <button className="co-action-btn cancel-order full" onClick={() => { setCancelOrderTarget(selectedOrder); setShowCancelModal(true); setSelectedOrder(null); }}>
                      <FaBan /> ยกเลิกออเดอร์
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Slip Modal */}
        {receiptOrder && (
          <ReceiptSlip order={receiptOrder} onClose={() => setReceiptOrder(null)} />
        )}


        {/* Cancel Order Confirm Modal */}
        {showCancelModal && cancelOrderTarget && (
          <div className="co-modal-overlay" onClick={() => { setShowCancelModal(false); setCancelOrderTarget(null); }}>
            <div className="co-modal co-modal-sm" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
              <div className="co-modal-header" style={{ borderBottom: '2px solid #fecaca', background: '#fef2f2' }}>
                <h2 style={{ color: '#dc2626', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                  <FaBan /> ยืนยันการยกเลิกออเดอร์
                </h2>
                <button className="co-modal-close" onClick={() => { setShowCancelModal(false); setCancelOrderTarget(null); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#dc2626' }}><FaTimes /></button>
              </div>
              <div style={{ padding: '20px 24px' }}>
                <p style={{ color: '#4b5563', fontSize: '15px', margin: '0 0 12px 0' }}>
                  คุณต้องการยกเลิกออเดอร์นี้หรือไม่?
                </p>
                <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '18px', color: '#1f2937' }}>{cancelOrderTarget.queue_number}</span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{cancelOrderTarget.order_id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                      {cancelOrderTarget.pay_method === 'promptpay' ? 'พร้อมเพย์' : 'เงินสด'}
                    </span>
                    <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '16px' }}>{Number(cancelOrderTarget.total_amount).toFixed(2)} บาท</span>
                  </div>
                </div>
                <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaExclamationTriangle style={{ flexShrink: 0 }} /> การยกเลิกออเดอร์จะไม่สามารถกู้คืนได้
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid #f3f4f6', background: '#f9fafb' }}>
                <button onClick={() => { setShowCancelModal(false); setCancelOrderTarget(null); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#4b5563', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>ไม่ใช่</button>
                <button onClick={() => { updateStatus(cancelOrderTarget.order_id, 'S06'); setShowCancelModal(false); setCancelOrderTarget(null); }} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaBan /> ยืนยันยกเลิก</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
