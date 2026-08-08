import React from 'react';
import { FaUtensils, FaShoppingCart, FaRegClock } from 'react-icons/fa';
import './BottomNavbar.css';

export default function BottomNavbar({ activeTab = 'home', onSelectTab }) {
  return (
    <nav className="bottom-navbar">
      {/* ปุ่มเมนู */}
      <button
        className={`bottom-nav-item ${activeTab === 'home' || activeTab === 'menu' ? 'active' : ''}`}
        onClick={() => onSelectTab && onSelectTab('home')}
      >
        <FaUtensils className="bottom-nav-icon" />
        <span className="bottom-nav-label">เมนู</span>
      </button>

      {/* ปุ่มตะกร้า 🛒 */}
      <button
        className={`bottom-nav-item ${activeTab === 'cart' ? 'active' : ''}`}
        onClick={() => onSelectTab && onSelectTab('cart')}
      >
        <FaShoppingCart className="bottom-nav-icon" />
        <span className="bottom-nav-label">ตะกร้า</span>
      </button>

      {/* ปุ่มออเดอร์ */}
      <button
        className={`bottom-nav-item ${activeTab === 'myOrders' ? 'active' : ''}`}
        onClick={() => onSelectTab && onSelectTab('myOrders')}
      >
        <FaRegClock className="bottom-nav-icon" />
        <span className="bottom-nav-label">ออเดอร์ฉัน</span>
      </button>
    </nav>
  );
}