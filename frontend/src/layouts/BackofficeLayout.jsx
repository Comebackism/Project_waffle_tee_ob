import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaConciergeBell, FaBoxes, FaChartBar, FaUserShield, FaUsers, FaBars, FaList, FaSignOutAlt, FaQrcode } from 'react-icons/fa';
import './BackofficeLayout.css';
import { apiFetch, API_BASE } from '../utils/api';

export default function BackofficeLayout({ children, role = 'cashier' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [machineId, setMachineId] = useState('01');

  useEffect(() => {
    // Get machine ID from localStorage
    const savedMachine = localStorage.getItem('posMachineId');
    if (savedMachine) {
      setMachineId(String(savedMachine).padStart(2, '0'));
    }

    // Fetch all users to populate the switch user menu
    apiFetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Expected users array, got:', data);
          setUsers([]);
        }
        
        // Check if there is a saved user in localStorage
        const savedUserStr = localStorage.getItem('currentUser');
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          // verify it still exists
          const exists = data.find(u => u.user_id === savedUser.user_id);
          if (exists) setCurrentUser(exists);
          else {
            // User no longer exists, redirect to login
            localStorage.removeItem('currentUser');
            localStorage.removeItem('posMachineId');
            navigate('/login');
          }
        } else {
          // No saved user, redirect to login
          navigate('/login');
        }
      });
  }, [role, navigate]);


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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ username: pendingUser.username, password: passwordInput })
      });
      
      if (!res.ok) {
        setPasswordError('รหัสผ่านไม่ถูกต้อง');
        return;
      }
      
      const data = await res.json();
      setCurrentUser(data.user);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setPendingUser(null);
      
      // Redirect based on role
      if (data.user.Role_id === 'R01') navigate('/admin');
      else if (data.user.Role_id === 'R02') navigate('/cashier/orders');
      else if (data.user.Role_id === 'R03') navigate('/kitchen');
    } catch (err) {
      setPasswordError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('posMachineId');
    localStorage.removeItem('authToken');
    navigate('/login');
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
        { path: '/cashier/tables', label: 'จัดการโต๊ะ (QR)', icon: <FaQrcode /> },
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
      { path: '/cashier/tables', label: 'จัดการโต๊ะ (QR)', icon: <FaQrcode /> },
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
          <span className="bo-machine-id">เครื่องที่ #{machineId}</span>
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

        <div className="bo-user-profile" style={{ position: 'relative' }}>
          <div className="bo-user-profile-inner" onClick={() => setShowUserMenu(!showUserMenu)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', width: '100%' }}>
            <div className="bo-avatar">
              {currentUser ? (currentUser.firstname || 'U').substring(0, 1) : 'U'}
            </div>
            <div className="bo-user-info">
              <span className="bo-user-name">
                {currentUser ? `${currentUser.firstname || ''} ${currentUser.lastname || ''}` : 'กำลังโหลด...'}
              </span>
              <span className="bo-user-role">
                {currentUser ? (currentUser.rolename || '...') : '...'}
              </span>
            </div>
            <span style={{ 
              marginLeft: 'auto', 
              fontSize: '10px', 
              color: '#9ca3af', 
              transition: 'transform 0.3s ease', 
              transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' 
            }}>▼</span>
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

        {/* Logout Button */}
        <button className="bo-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>ออกจากระบบ</span>
        </button>
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
