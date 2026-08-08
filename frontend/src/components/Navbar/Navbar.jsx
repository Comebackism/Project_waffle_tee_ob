import React, { useState, useEffect, useRef } from 'react';
import { FaRegBell, FaShoppingCart, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const API_BASE = 'http://localhost:5000';

const STATUS_MAP = {
  'S01': { label: 'รอชำระเงิน', color: '#f59e0b' },
  'S02': { label: 'รอดำเนินการ', color: '#3b82f6' },
  'S03': { label: 'กำลังปรุง', color: '#f97316' },
  'S04': { label: 'พร้อมรับ', color: '#22c55e' },
  'S05': { label: 'เสร็จสิ้น', color: '#6b7280' },
};

export default function Navbar({ cartCount = 0, onCartClick, onOrderClick }) {
  const [activeOrders, setActiveOrders] = useState([]);
  const [showNoti, setShowNoti] = useState(false);
  const notiRef = useRef(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const savedStr = localStorage.getItem('myOrders');
      if (!savedStr) return;
      
      const orderIds = JSON.parse(savedStr);
      if (orderIds.length === 0) return;

      try {
        const promises = orderIds.map(id => fetch(`${API_BASE}/api/orders/${id}`).then(res => res.ok ? res.json() : null));
        const results = await Promise.all(promises);
        
        // Show active orders (not S05)
        const active = results.filter(r => r !== null && r.Status_id !== 'S05').sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        setActiveOrders(active);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setShowNoti(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <h1 className="navbar-title">ตี๋อบ วาฟเฟิล HongKong</h1>
      <div className="navbar-actions">
        
        <div className="navbar-noti-container" ref={notiRef}>
          <button className="navbar-icon" onClick={() => setShowNoti(!showNoti)}>
            <FaRegBell />
            {activeOrders.length > 0 && <span className="navbar-cart-badge">{activeOrders.length}</span>}
          </button>
          
          {showNoti && (
            <div className="navbar-noti-dropdown">
              <div className="noti-header">
                <h3>การแจ้งเตือนสถานะ</h3>
                <FaTimes onClick={() => setShowNoti(false)} style={{cursor:'pointer', color:'#9ca3af'}} />
              </div>
              <div className="noti-body">
                {activeOrders.length === 0 ? (
                  <div className="noti-empty">ไม่มีออเดอร์ที่กำลังดำเนินการ</div>
                ) : (
                  activeOrders.map(order => (
                    <div 
                      key={order.order_id} 
                      className="noti-item"
                      onClick={() => {
                        setShowNoti(false);
                        if (onOrderClick) onOrderClick(order.order_id);
                      }}
                    >
                      <div className="noti-item-title">
                        คิวที่ {order.queue_number} <span className="noti-item-id">({order.order_id})</span>
                      </div>
                      <div className="noti-item-status" style={{color: STATUS_MAP[order.Status_id]?.color}}>
                        สถานะ: {STATUS_MAP[order.Status_id]?.label}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button className="navbar-icon cart-icon-btn" onClick={onCartClick}>
          <FaShoppingCart />
          {cartCount > 0 && <span className="navbar-cart-badge">{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}