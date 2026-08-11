import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaBoxOpen, FaChevronRight, FaReceipt, FaTimesCircle } from 'react-icons/fa';
import ReceiptSlip from '../../components/ReceiptSlip/ReceiptSlip';
import './MyOrders.css';

const STATUS_MAP = {
  'S01': { label: 'รอชำระเงิน', color: '#f59e0b' },
  'S02': { label: 'รอดำเนินการ', color: '#3b82f6' },
  'S03': { label: 'กำลังปรุง', color: '#f97316' },
  'S04': { label: 'พร้อมรับ', color: '#22c55e' },
  'S05': { label: 'เสร็จสิ้น', color: '#6b7280' },
  'S06': { label: 'ยกเลิก', color: '#ef4444' },
};

const API_BASE = 'http://localhost:5000';

export default function MyOrders({ onBack, onViewOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receiptOrder, setReceiptOrder] = useState(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      const savedStr = localStorage.getItem('myOrders');
      if (!savedStr) {
        setLoading(false);
        return;
      }
      
      const orderIds = JSON.parse(savedStr);
      if (orderIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const promises = orderIds.map(id => fetch(`${API_BASE}/api/orders/${id}`).then(res => res.ok ? res.json() : null));
        const results = await Promise.all(promises);
        
        // Filter out nulls and sort by latest
        const validOrders = results.filter(r => r !== null).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        setOrders(validOrders);
      } catch (err) {
        console.error('Error fetching my orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const handleCancelOrder = (e, orderId) => {
    e.stopPropagation();
    if (window.confirm('คุณต้องการยกเลิกออเดอร์นี้ใช่หรือไม่?')) {
      fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: 'S06' })
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to cancel order');
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, Status_id: 'S06' } : o));
      })
      .catch(err => {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการยกเลิกออเดอร์');
      });
    }
  };



  return (
    <div className="my-orders-page">
      <header className="mo-header">
        <button className="mo-back-btn" onClick={onBack}>
          <FaArrowLeft />
        </button>
        <h2>ออเดอร์ของฉัน</h2>
        <div style={{ width: 40 }}></div>
      </header>

      <div className="mo-content">
        {loading ? (
          <div className="mo-loading">กำลังโหลด...</div>
        ) : orders.length === 0 ? (
          <div className="mo-empty">
            <FaBoxOpen className="mo-empty-icon" />
            <p>ยังไม่มีประวัติการสั่งซื้อ</p>
          </div>
        ) : (
          <div className="mo-list">
            {orders.map(order => (
              <div key={order.order_id} className="mo-card" onClick={() => onViewOrder(order.order_id)}>
                <div className="mo-card-header">
                  <div>
                    <span className="mo-queue">คิว {order.queue_number}</span>
                    <span className="mo-date">{new Date(order.created_at).toLocaleString('th-TH')}</span>
                  </div>
                  <span className="mo-status" style={{ backgroundColor: STATUS_MAP[order.Status_id]?.color }}>
                    {STATUS_MAP[order.Status_id]?.label}
                  </span>
                </div>
                
                <div className="mo-card-body">
                  <div className="mo-items-preview">
                    {order.items && order.items.map((item, idx) => (
                      <span key={idx}>
                        {item.quantity}x {item.menu_name}
                        {idx < order.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                  <div className="mo-total">฿{Number(order.total_amount).toFixed(2)}</div>
                </div>

                <div className="mo-card-footer">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {order.Status_id !== 'S01' && order.Status_id !== 'S06' ? (
                      <span onClick={(e) => { e.stopPropagation(); setReceiptOrder(order); }} style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#1f2937', fontWeight: 600}}>
                        <FaReceipt /> ใบเสร็จ/สลิป
                      </span>
                    ) : order.Status_id === 'S01' ? (
                      <span onClick={(e) => handleCancelOrder(e, order.order_id)} style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontWeight: 600}}>
                        <FaTimesCircle /> ยกเลิก
                      </span>
                    ) : (
                      <span></span>
                    )}
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                    <span>ดูสถานะ</span>
                    <FaChevronRight />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Slip Modal */}
      {receiptOrder && (
        <ReceiptSlip order={receiptOrder} onClose={() => setReceiptOrder(null)} hidePrintButton={true} />
      )}
    </div>
  );
}
