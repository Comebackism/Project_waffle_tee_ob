import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaCheckCircle, FaReceipt } from 'react-icons/fa';
import './CashWaiting.css';

import { API_BASE } from '../../utils/api';

export default function CashWaiting({ orderId, grandTotal, onConfirmed, onBack }) {
  const [status, setStatus] = useState('waiting'); // 'waiting' | 'confirmed'
  const [queueNumber, setQueueNumber] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const checkStatus = () => {
      fetch(`${API_BASE}/api/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
          // S01 = รอชำระเงิน, S02+ = แคชเชียร์ยืนยันแล้ว
          if (data.Status_id && data.Status_id !== 'S01') {
            setStatus('confirmed');
            setQueueNumber(data.queue_number);
          }
        })
        .catch(err => console.error('Error checking order status:', err));
    };

    // เช็คทันที 1 ครั้ง
    checkStatus();

    // Poll ทุก 3 วินาที
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  // หน้ารอแคชเชียร์ยืนยัน
  if (status === 'waiting') {
    return (
      <div className="cw-page">
        <div className="cw-card">
          <div className="cw-icon-waiting">
            <FaMoneyBillWave />
          </div>

          <h1 className="cw-title">กรุณาชำระเงินที่เคาน์เตอร์</h1>
          <p className="cw-subtitle">
            แจ้งเลขออเดอร์ให้พนักงานและชำระเงินสดที่หน้าเคาน์เตอร์<br />
            ระบบจะอัปเดตอัตโนมัติเมื่อพนักงานยืนยันรับชำระแล้ว
          </p>

          {/* ยอดที่ต้องจ่าย */}
          <div className="cw-amount-card">
            <p className="cw-amount-label">ยอดที่ต้องชำระ</p>
            <p className="cw-amount-value">{Number(grandTotal).toFixed(2)} บาท</p>
            <p className="cw-order-id">เลขออเดอร์: {orderId}</p>
          </div>

          {/* Loading dots */}
          <div className="cw-dots">
            <div className="cw-dot"></div>
            <div className="cw-dot"></div>
            <div className="cw-dot"></div>
          </div>

          <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 20px' }}>
            กำลังรอพนักงานยืนยันการชำระเงิน...
          </p>

          <button className="cw-btn-secondary" onClick={onBack}>
            กลับไปหน้าเมนู
          </button>

          <p className="cw-footer">ตี๋อบ วาฟเฟิล HongKong</p>
        </div>
      </div>
    );
  }

  // หน้ายืนยันสำเร็จ — แสดงเลขคิว
  return (
    <div className="cw-page">
      <div className="cw-card">
        <div className="cw-icon-confirmed">
          <FaCheckCircle />
        </div>

        <h1 className="cw-title">ชำระเงินเรียบร้อย</h1>
        <p className="cw-subtitle">
          พนักงานยืนยันรับชำระเงินสดแล้ว<br />
          ออเดอร์ของคุณกำลังดำเนินการ
        </p>

        {/* เลขคิว */}
        <div className="cw-queue-card">
          <p className="cw-queue-label">เลขคิวของคุณ</p>
          <p className="cw-queue-number">{queueNumber || '-'}</p>
        </div>

        <button className="cw-btn-primary" onClick={() => onConfirmed && onConfirmed(orderId, queueNumber)}>
          <FaReceipt style={{ marginRight: '8px' }} />
          ดูสถานะออเดอร์
        </button>

        <button className="cw-btn-secondary" onClick={onBack}>
          กลับไปหน้าเมนู
        </button>

        <p className="cw-footer">ตี๋อบ วาฟเฟิล HongKong</p>
      </div>
    </div>
  );
}
