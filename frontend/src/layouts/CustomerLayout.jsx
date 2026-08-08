import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import './CustomerLayout.css';
import BottomNavbar from '../components/BottomNavbar/BottomNavbar';

// รับค่า prop page, showBottomNav, currentScreen และ onNavigate เพิ่มเติม
export default function CustomerLayout({ 
  page, 
  showBottomNav = true, 
  currentScreen = 'home', 
  onNavigate,
  onViewOrder,
  cartCount = 0
}) {
  return (
    <div className="customer-layout-wrapper">
      <Navbar cartCount={cartCount} onCartClick={() => onNavigate && onNavigate('cart')} onOrderClick={onViewOrder} />
      <main className="customer-layout-main">
        {page} {/* แสดงผลหน้าจอที่ถูกส่งมาจาก App.jsx */}
      </main>
      
      {/* ส่ง activeTab และฟังก์ชันสลับหน้าไปที่ BottomNavbar */}
      {showBottomNav && (
        <BottomNavbar 
          activeTab={currentScreen === 'home' ? 'menu' : currentScreen} 
          onSelectTab={onNavigate}
        />
      )}
    </div>
  );
}