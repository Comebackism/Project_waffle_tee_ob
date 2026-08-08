import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaClock, FaMoneyBillWave, FaQrcode, FaSyncAlt } from 'react-icons/fa';
import BackofficeLayout from '../../layouts/BackofficeLayout';
import './CashierOrders.css';

const STATUS_LABELS = {
  'S01': { label: 'รอชำระเงิน', color: '#f59e0b' },
  'S02': { label: 'รอดำเนินการ', color: '#3b82f6' },
  'S03': { label: 'กำลังปรุง', color: '#f97316' },
  'S04': { label: 'พร้อมรับ', color: '#22c55e' },
  'S05': { label: 'เสร็จสิ้น', color: '#6b7280' },
};

const API_BASE = 'http://localhost:5000';

export default function CashierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('S01'); // Filter by status
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = () => {
    fetch(`${API_BASE}/api/orders/today`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
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
      await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: newStatusId })
      });
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const viewOrderDetail = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`);
      const data = await res.json();
      setSelectedOrder(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const filteredOrders = orders.filter(o => o.Status_id === activeTab);

  const tabs = [
    { id: 'S01', label: 'รอชำระเงิน', count: orders.filter(o => o.Status_id === 'S01').length },
    { id: 'S02', label: 'รอดำเนินการ', count: orders.filter(o => o.Status_id === 'S02').length },
    { id: 'S03', label: 'กำลังปรุง', count: orders.filter(o => o.Status_id === 'S03').length },
    { id: 'S04', label: 'พร้อมรับ', count: orders.filter(o => o.Status_id === 'S04').length },
    { id: 'S05', label: 'เสร็จสิ้น', count: orders.filter(o => o.Status_id === 'S05').length },
  ];

  return (
    <BackofficeLayout role="cashier">
      <div className="co-page">
        <header className="co-header">
          <div>
            <h1 className="co-title">จัดการออเดอร์</h1>
            <p className="co-subtitle">ระบบรับชำระเงินและจัดการสถานะ</p>
          </div>
          <button className="co-refresh-btn" onClick={fetchOrders}>
            <FaSyncAlt /> รีเฟรช
          </button>
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
                  <span
                    className="co-status-badge"
                    style={{ backgroundColor: STATUS_LABELS[order.Status_id]?.color }}
                  >
                    {order.statusname}
                  </span>
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
                    ฿{Number(order.total_amount).toFixed(2)}
                  </div>
                </div>

                <div className="co-card-actions">
                  <button className="co-action-btn view" onClick={() => viewOrderDetail(order.order_id)}>
                    <FaEye /> ดูรายละเอียด
                  </button>

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
                <p><strong>ยอดรวม:</strong> ฿{Number(selectedOrder.total_amount).toFixed(2)}</p>
                
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
                
                <div style={{marginTop: '20px'}}>
                  {selectedOrder.Status_id === 'S01' && (
                    <button className="co-action-btn approve full" onClick={() => updateStatus(selectedOrder.order_id, 'S02')}>
                      ยืนยันชำระเงิน
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
