import React, { useRef } from 'react';
import { FaPrint, FaTimes, FaCheckCircle } from 'react-icons/fa';
import './ReceiptSlip.css';

export default function ReceiptSlip({ order, onClose, autoShow = false }) {
  const receiptRef = useRef(null);

  if (!order) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate items subtotal and VAT
  const items = order.items || [];
  let calculatedSubtotal = 0;

  items.forEach(item => {
    const base = Number(item.menu_price || 0) * (item.quantity || 1);
    const tops = (item.toppings || []).reduce((sum, t) => sum + (Number(t.topping_price || t.price || 0) * (item.quantity || 1)), 0);
    calculatedSubtotal += (base + tops);
  });

  const grandTotal = Number(order.total_amount || calculatedSubtotal);
  const paymentMethodText = order.pay_method === 'cash' ? 'เงินสด (Cash)' : 'โอนเงิน (PromptPay)';
  const staffName = order.firstname ? `${order.firstname} ${order.lastname || ''}` : (order.user_id ? `แคชเชียร์ #${order.user_id}` : 'แคชเชียร์ #01');

  return (
    <div className="receipt-modal-overlay" onClick={onClose}>
      <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Actions Bar */}
        <div className="receipt-actions-bar no-print">
          <div className="receipt-status-notice">
            <FaCheckCircle style={{ color: '#22c55e', marginRight: '6px' }} />
            <span>ชำระเงินเรียบร้อยแล้ว</span>
          </div>
          <div className="receipt-btn-group">
            <button className="receipt-print-btn" onClick={handlePrint}>
              <FaPrint /> พิมพ์สลิป
            </button>
            {onClose && (
              <button className="receipt-close-btn" onClick={onClose}>
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Printable Thermal Receipt */}
        <div className="receipt-thermal-paper" ref={receiptRef}>
          
          {/* Header */}
          <div className="receipt-shop-header">
            <h2 className="receipt-shop-name">ตี๋อบ วาฟเฟิล ฮ่องกง</h2>
            <p className="receipt-shop-branch">สาขาหาดใหญ่ (Hatyai Branch)</p>
          </div>

          {/* Queue Box */}
          <div className="receipt-queue-box">
            <span className="receipt-queue-label">คิวที่:</span>
            <span className="receipt-queue-number">{order.queue_number || '#E001'}</span>
          </div>

          {/* Order Meta Info */}
          <div className="receipt-meta-info">
            <div className="receipt-meta-row">
              <span className="receipt-meta-key">ออเดอร์:</span>
              <span className="receipt-meta-val">{order.order_id}</span>
            </div>
            <div className="receipt-meta-row">
              <span className="receipt-meta-key">วันที่สร้าง:</span>
              <span className="receipt-meta-val">{formatDate(order.created_at)}</span>
            </div>
            <div className="receipt-meta-row">
              <span className="receipt-meta-key">วันที่ชำระ:</span>
              <span className="receipt-meta-val">{formatDate(order.pay_time || order.created_at)}</span>
            </div>
            <div className="receipt-meta-row">
              <span className="receipt-meta-key">พนักงาน:</span>
              <span className="receipt-meta-val">{staffName}</span>
            </div>
          </div>

          <div className="receipt-dashed-line"></div>

          {/* Items List */}
          <div className="receipt-items-list">
            {items.map((item, idx) => {
              return (
                <div key={idx} className="receipt-item-block">
                  <div className="receipt-item-main">
                    <span className="receipt-item-name">
                      {item.quantity}x {item.menu_name}
                    </span>
                    <span className="receipt-item-price">
                      ฿{Number(item.menu_price || 0)}
                    </span>
                  </div>

                  {/* Toppings */}
                  {item.toppings && item.toppings.map((top, tIdx) => (
                    <div key={tIdx} className="receipt-topping-row">
                      <span className="receipt-topping-name">+ {top.topping_name || top.name}</span>
                      <span className="receipt-topping-price">+ {Number(top.topping_price || top.price || 0)}</span>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Note */}
            {order.note && (
              <div className="receipt-note-row">
                หมายเหตุ: "{order.note}"
              </div>
            )}
          </div>

          <div className="receipt-dashed-line"></div>

          {/* Pricing breakdown */}
          <div className="receipt-pricing-section">
            <div className="receipt-price-row">
              <span>จำนวนรวมทั้งหมด</span>
              <span>{items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)} ชิ้น</span>
            </div>

            <div className="receipt-solid-line"></div>

            <div className="receipt-total-row">
              <span className="receipt-total-label">ยอดสุทธิ</span>
              <span className="receipt-total-val">฿{grandTotal.toFixed(2)}</span>
            </div>

            <div className="receipt-pay-method-row">
              <span className="receipt-pay-label">ช่องทางการชำระ:</span>
              <span className="receipt-pay-val">{paymentMethodText}</span>
            </div>
          </div>

          <div className="receipt-dashed-line"></div>

          {/* Footer */}
          <div className="receipt-footer-text">
            ขอบคุณที่ใช้บริการ
          </div>

        </div>
      </div>
    </div>
  );
}
