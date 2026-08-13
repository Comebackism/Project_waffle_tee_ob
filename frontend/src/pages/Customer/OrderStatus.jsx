import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaClock, FaFireAlt, FaCheckCircle, FaTimesCircle, FaReceipt } from 'react-icons/fa';
import ReceiptSlip from '../../components/ReceiptSlip/ReceiptSlip';
import './OrderStatus.css';

const API_BASE = 'http://localhost:5000';

const resolveImage = (pic) => {
  if (!pic) return 'https://via.placeholder.com/60';
  if (pic.startsWith('http')) return pic;
  return `${API_BASE}${pic}`;
};

const STATUS_MAP = {
  'S01': { label: 'รอชำระเงิน', icon: <FaClock />, color: '#f59e0b', step: 1 },
  'S02': { label: 'รอดำเนินการ', icon: <FaClock />, color: '#3b82f6', step: 2 },
  'S03': { label: 'กำลังปรุง', icon: <FaFireAlt />, color: '#f97316', step: 3 },
  'S04': { label: 'พร้อมรับ', icon: <FaCheckCircle />, color: '#22c55e', step: 4 },
  'S05': { label: 'เสร็จสิ้น', icon: <FaCheckCircle />, color: '#6b7280', step: 5 },
  'S06': { label: 'ยกเลิก', icon: <FaTimesCircle />, color: '#ef4444', step: 0 },
};

export default function OrderStatus({ orderId, queueNumber, onBack }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrder = () => {
    if (!orderId) return;
    fetch(`http://localhost:5000/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching order:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrder();
    // Poll every 5 seconds for status updates
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const calculateItemTotal = (item) => {
    const basePrice = Number(item.menu_price) || 0;
    const toppingsPrice = (item.toppings || []).reduce((sum, t) => sum + (Number(t.topping_price) * (t.quantity || 1)), 0);
    return (basePrice + toppingsPrice) * (item.quantity || 1);
  };

  const handleCancelOrder = () => {
    fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status_id: 'S06' })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to cancel order');
      setShowCancelModal(false);
      fetchOrder();
    })
    .catch(err => {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการยกเลิกออเดอร์');
      setShowCancelModal(false);
    });
  };

  if (loading) {
    return (
      <div className="order-status-page">
        <div className="os-loading">กำลังโหลดข้อมูลออเดอร์...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-status-page">
        <div className="os-loading">ไม่พบข้อมูลออเดอร์</div>
        <button className="os-back-home-btn" onClick={onBack}>กลับหน้าหลัก</button>
      </div>
    );
  }

  const currentStatus = STATUS_MAP[order.Status_id] || STATUS_MAP['S01'];
  const steps = [
    { id: 'S01', label: 'รอชำระเงิน' },
    { id: 'S02', label: 'รอดำเนินการ' },
    { id: 'S03', label: 'กำลังปรุง' },
    { id: 'S04', label: 'พร้อมรับ' },
  ];

  return (
    <div className="order-status-page">
      <div className="os-wrapper">

        {/* Header */}
        <header className="os-header">
          <button className="os-back-btn" onClick={onBack} aria-label="กลับ">
            <FaArrowLeft />
          </button>
          <h1 className="os-title">สถานะคำสั่งซื้อ</h1>
        </header>

        {/* Queue Number Card */}
        <div className="os-queue-card">
          <span className="os-queue-label">หมายเลขคิว</span>
          <span className="os-queue-number">{order.queue_number || queueNumber}</span>
          <span className="os-order-id">{order.order_id}</span>
        </div>

        {/* Status Progress */}
        <div className="os-progress-section">
          <h2 className="os-section-title">ความคืบหน้า</h2>
          <div className="os-steps">
            {steps.map((step, index) => {
              const stepStatus = STATUS_MAP[step.id];
              const isActive = currentStatus.step >= stepStatus.step;
              const isCurrent = order.Status_id === step.id;
              return (
                <div key={step.id} className="os-step-row">
                  <div className={`os-step-dot ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                    {isActive ? '✓' : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`os-step-line ${isActive ? 'active' : ''}`}></div>
                  )}
                  <span className={`os-step-label ${isCurrent ? 'current' : ''}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status Big Badge */}
        <div className="os-current-status" style={{ backgroundColor: currentStatus.color + '20', borderColor: currentStatus.color }}>
          <span className="os-status-icon" style={{ color: currentStatus.color }}>{currentStatus.icon}</span>
          <span className="os-status-text" style={{ color: currentStatus.color }}>{currentStatus.label}</span>
        </div>

        {/* Queue Ahead Card */}
        {order.Status_id !== 'S04' && order.Status_id !== 'S05' && (
          <div className="os-queue-ahead-card">
            <div className="os-queue-ahead-info">
              <span className="os-queue-ahead-title">ตำแหน่งคิว</span>
              <span className="os-queue-ahead-subtitle">คิวก่อนหน้าคุณ</span>
            </div>
            <div className="os-queue-ahead-number">
              {order.queue_ahead || 0}
            </div>
          </div>
        )}

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="os-items-section">
            <h2 className="os-section-title">รายการสั่งซื้อ</h2>
            {order.items.map((item, idx) => (
              <div key={idx} className="os-item-card">
                <img
                  src={resolveImage(item.menu_picture)}
                  alt={item.menu_name}
                  className="os-item-img"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/60'; }}
                />
                <div className="os-item-info">
                  <span className="os-item-name">{item.menu_name}</span>
                  <span className="os-item-qty">x{item.quantity}</span>
                  {item.toppings && item.toppings.length > 0 && (
                    <div className="os-item-toppings">
                      {item.toppings.map((t, i) => (
                        <span key={i} className="os-topping-tag">+ {t.topping_name} {t.quantity > 1 ? `x${t.quantity}` : ''}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="os-item-price">฿{calculateItemTotal(item)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        {order.note && (
          <div className="os-note-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <span style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>หมายเหตุ:</span>
            <span style={{ fontSize: '14px', color: '#ef4444' }}>{order.note}</span>
          </div>
        )}

        {/* Total */}
        <div className="os-total-card">
          <span>ยอดรวม</span>
          <span className="os-total-price">฿{Number(order.total_amount).toFixed(2)}</span>
        </div>

        {/* Receipt / Slip Button - Only show if NOT waiting for payment and NOT cancelled */}
        {order.Status_id !== 'S01' && order.Status_id !== 'S06' && (
          <button className="os-receipt-btn" onClick={() => setShowReceipt(true)}>
            <FaReceipt /> ดูใบเสร็จรับเงิน / สลิป
          </button>
        )}

        {/* Back to home */}
        <button className="os-back-home-btn" onClick={onBack}>
          กลับหน้าหลัก
        </button>

        {/* Cancel Button - Only show if S01 */}
        {order.Status_id === 'S01' && (
          <button 
            className="os-cancel-btn" 
            onClick={() => setShowCancelModal(true)}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '12px'
            }}
          >
            <FaTimesCircle style={{ marginRight: '8px' }} />
            ยกเลิกออเดอร์
          </button>
        )}

        {/* Receipt Modal */}
        {showReceipt && (
          <ReceiptSlip 
            order={order} 
            onClose={() => setShowReceipt(false)} 
            hidePrintButton={true}
          />
        )}

        {/* Cancel Order Confirm Modal */}
        {showCancelModal && (
          <div className="os-modal-overlay" onClick={() => setShowCancelModal(false)}>
            <div className="os-modal" onClick={e => e.stopPropagation()}>
              <div className="os-modal-header danger">
                <h2>
                  <FaTimesCircle /> ยืนยันการยกเลิกออเดอร์
                </h2>
              </div>
              <div className="os-modal-body">
                <p>คุณแน่ใจหรือไม่ว่าต้องการ <strong>ยกเลิกออเดอร์นี้</strong>?</p>
                <p style={{ color: '#ef4444', fontSize: '13px' }}>* การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              </div>
              <div className="os-modal-footer">
                <button className="os-btn-cancel" onClick={() => setShowCancelModal(false)}>ไม่, กลับไปหน้าเดิม</button>
                <button className="os-btn-danger" onClick={handleCancelOrder}>ใช่, ยกเลิกออเดอร์</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
