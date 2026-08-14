import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaConciergeBell, FaBoxes, FaChartBar, FaUserShield, FaUsers, FaBars, FaList } from 'react-icons/fa';
import './BackofficeLayout.css';

export default function BackofficeLayout({ children, role = 'cashier' }) {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Fetch all users to populate the switch user menu
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        
        // Check if there is a saved user in localStorage
        const savedUserStr = localStorage.getItem('currentUser');
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          // verify it still exists
          const exists = data.find(u => u.user_id === savedUser.user_id);
          if (exists) setCurrentUser(exists);
          else setCurrentUser(data[0]);
        } else if (data.length > 0) {
          // Default to first user based on role prop if possible
          let defaultUser = data.find(u => 
            (role === 'admin' && u.Role_id === 'R01') ||
            (role === 'cashier' && u.Role_id === 'R02') ||
            (role === 'kitchen' && u.Role_id === 'R03')
          );
          if (!defaultUser) defaultUser = data[0];
          setCurrentUser(defaultUser);
          localStorage.setItem('currentUser', JSON.stringify(defaultUser));
        }
      });
  }, [role]);

  const navigate = useNavigate();

  const initiateSwitchUser = (user) => {
    if (user.user_id === currentUser?.user_id) {
      setShowUserMenu(false);
      return;
    }
    setPendingUser(user);
    setPasswordInput('');
    setPasswordError('');
    setShowUserMenu(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === pendingUser.password) {
      setCurrentUser(pendingUser);
      localStorage.setItem('currentUser', JSON.stringify(pendingUser));
      setPendingUser(null);
      
      // Redirect based on role
      if (pendingUser.Role_id === 'R01') navigate('/admin');
      else if (pendingUser.Role_id === 'R02') navigate('/cashier/orders');
      else if (pendingUser.Role_id === 'R03') navigate('/kitchen');
    } else {
      setPasswordError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const getNavItems = () => {
    let currentRole = role;
    if (currentUser) {
      if (currentUser.Role_id === 'R01') currentRole = 'admin';
      else if (currentUser.Role_id === 'R02') currentRole = 'cashier';
      else if (currentUser.Role_id === 'R03') currentRole = 'kitchen';
    }

    if (currentRole === 'admin') {
      return [
        { path: '/admin', label: 'จัดการพนักงาน', icon: <FaUsers /> },
        { path: '/admin/dashboard', label: 'แดชบอร์ด', icon: <FaChartBar /> },
        { path: '/cashier/orders', label: 'ออเดอร์', icon: <FaConciergeBell /> },
        { path: '/kitchen', label: 'ห้องครัว', icon: <FaConciergeBell /> },
        { path: '/inventory', label: 'คลังสินค้า', icon: <FaBoxes /> },
        { path: '/menu-management', label: 'จัดการเมนูหน้าร้าน', icon: <FaList /> },
      ];
    }
    if (currentRole === 'kitchen') {
      return [
        { path: '/kitchen', label: 'ห้องครัว', icon: <FaConciergeBell /> },
        { path: '/menu-management', label: 'จัดการเมนูหน้าร้าน', icon: <FaList /> },
      ];
    }
    // Default to cashier — no dashboard, orders & inventory only
    return [
      { path: '/cashier/orders', label: 'ออเดอร์', icon: <FaConciergeBell /> },
      { path: '/inventory', label: 'คลังสินค้า', icon: <FaBoxes /> },
      { path: '/menu-management', label: 'จัดการเมนูหน้าร้าน', icon: <FaList /> },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="backoffice-layout">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="bo-mobile-header">
        <button className="bo-hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
          <FaBars />
        </button>
        <h2 className="bo-mobile-title">ตี๋อบ วาฟเฟิล</h2>
      </div>

      {/* Sidebar Overlay (Mobile Only) */}
      {isSidebarOpen && (
        <div className="bo-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`bo-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="bo-brand">
          <h1 className="bo-brand-title">
            ตี๋อบ<br />วาฟเฟิล<br />HongKong
          </h1>
          <span className="bo-machine-id">เครื่องที่ #01</span>
        </div>

        <nav className="bo-nav">
          {navItems.map((item, idx) => (
            <NavLink 
              key={idx} 
              to={item.path} 
              className={({ isActive }) => 
                `bo-nav-item ${isActive && item.path !== '#' && location.pathname === item.path ? 'active' : ''}`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="bo-nav-icon">{item.icon}</span>
              <span className="bo-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile / Switcher */}
        <div className="bo-user-profile" style={{ position: 'relative' }}>
          <div className="bo-user-profile-inner" onClick={() => setShowUserMenu(!showUserMenu)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', width: '100%' }}>
            <div className="bo-avatar">
              {currentUser ? currentUser.firstname.substring(0, 1) : 'U'}
            </div>
            <div className="bo-user-info">
              <span className="bo-user-name">
                {currentUser ? `${currentUser.firstname} ${currentUser.lastname}` : 'กำลังโหลด...'}
              </span>
              <span className="bo-user-role">
                {currentUser ? currentUser.rolename : '...'}
              </span>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#9ca3af' }}>▼</span>
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="bo-user-menu">
              <div className="bo-user-menu-title">สลับผู้ใช้งาน</div>
              {users.map(u => (
                <div 
                  key={u.user_id} 
                  className={`bo-user-menu-item ${currentUser?.user_id === u.user_id ? 'active' : ''}`}
                  onClick={() => initiateSwitchUser(u)}
                >
                  <div className="bo-umi-name">{u.firstname} {u.lastname}</div>
                  <div className="bo-umi-role">{u.rolename}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="bo-main-content">
        {children}
      </main>
      {/* Password Prompt Modal */}
      {pendingUser && (
        <div className="admin-modal-overlay" onClick={() => setPendingUser(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{maxWidth: '400px'}}>
            <div className="admin-modal-header" style={{borderBottom: 'none'}}>
              <h2>ยืนยันตัวตน</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="admin-form" style={{paddingTop: '0'}}>
              <p style={{marginBottom: '16px', color: '#4b5563'}}>
                กรุณาใส่รหัสผ่านของ <strong>{pendingUser.firstname} {pendingUser.lastname}</strong> เพื่อสลับการใช้งาน
              </p>
              <div className="form-group">
                <input 
                  type="password" 
                  autoFocus
                  placeholder="รหัสผ่าน" 
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  style={{borderColor: passwordError ? '#ef4444' : ''}}
                />
                {passwordError && <span style={{color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block'}}>{passwordError}</span>}
              </div>
              <div className="admin-modal-footer" style={{marginTop: '24px'}}>
                <button type="button" className="admin-btn outline" onClick={() => setPendingUser(null)}>ยกเลิก</button>
                <button type="submit" className="admin-btn primary">ยืนยัน</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
