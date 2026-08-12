import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaSyncAlt, FaTrash } from 'react-icons/fa';
import BackofficeLayout from '../../layouts/BackofficeLayout';
import './AdminDashboard.css';

const API_BASE = 'http://localhost:5000';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    firstname: '',
    lastname: '',
    username: '',
    password: '',
    phone: '',
    email: '',
    Role_id: 'R02' // Default cashier
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users`);
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newEmployee.phone && newEmployee.phone.length !== 10) {
      alert("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      return;
    }
    try {
      if (editingEmployee) {
        // Edit mode
        await fetch(`${API_BASE}/api/users/${editingEmployee}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEmployee)
        });
      } else {
        // Add mode
        await fetch(`${API_BASE}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEmployee)
        });
      }
      setShowAddForm(false);
      setEditingEmployee(null);
      setNewEmployee({ firstname: '', lastname: '', username: '', password: '', phone: '', email: '', Role_id: 'R02' });
      fetchEmployees();
    } catch (err) {
      console.error('Error saving employee:', err);
    }
  };

  const handleEditClick = (emp) => {
    setEditingEmployee(emp.user_id);
    setNewEmployee({
      firstname: emp.firstname,
      lastname: emp.lastname,
      username: emp.username,
      password: '', // Leave blank unless they want to change
      phone: emp.phone || '',
      email: emp.email || '',
      Role_id: emp.Role_id
    });
    setShowAddForm(true);
  };

  const handleDeleteClick = async (id, name) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบพนักงาน: ${name}?`)) {
      try {
        const res = await fetch(`${API_BASE}/api/users/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchEmployees();
        } else {
          const data = await res.json();
          alert(data.message || 'เกิดข้อผิดพลาดในการลบพนักงาน');
        }
      } catch (err) {
        console.error('Error deleting employee:', err);
      }
    }
  };

  const getRoleBadgeColor = (roleId) => {
    switch(roleId) {
      case 'R01': return '#8b5cf6'; // Admin - Purple
      case 'R02': return '#3b82f6'; // Cashier - Blue
      case 'R03': return '#f97316'; // Kitchen - Orange
      default: return '#6b7280';
    }
  };

  const clearDailyOrders = async () => {
    if (window.confirm('⚠️ คำเตือน: คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลออเดอร์ทั้งหมดเพื่อเริ่มวันใหม่? (คิวและรหัสออเดอร์จะถูกรีเซ็ต)')) {
      try {
        const res = await fetch(`${API_BASE}/api/orders/clear`, { method: 'DELETE' });
        const data = await res.json();
        alert(data.message);
      } catch (err) {
        console.error('Error clearing orders:', err);
        alert('เกิดข้อผิดพลาดในการล้างออเดอร์');
      }
    }
  };

  return (
    <BackofficeLayout role="admin">
      <div className="admin-page">
        <header className="admin-header">
          <div>
            <h1 className="admin-title">จัดการพนักงาน</h1>
            <p className="admin-subtitle">รายชื่อพนักงานและสิทธิ์การเข้าใช้งาน</p>
          </div>
          <div className="admin-header-actions">
            <button className="admin-btn" onClick={clearDailyOrders} style={{ background: '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
              <FaTrash /> ล้างออเดอร์รายวัน
            </button>
            <button className="admin-btn outline" onClick={fetchEmployees}>
              <FaSyncAlt />
            </button>
            <button className="admin-btn primary" onClick={() => {
              setEditingEmployee(null);
              setNewEmployee({ firstname: '', lastname: '', username: '', password: '', phone: '', email: '', Role_id: 'R02' });
              setShowAddForm(true);
            }}>
              <FaUserPlus /> เพิ่มพนักงาน
            </button>
          </div>
        </header>

        {loading ? (
          <div className="admin-loading">กำลังโหลด...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>Username</th>
                  <th>ตำแหน่ง</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.user_id}>
                    <td><span className="emp-id">{emp.user_id}</span></td>
                    <td>
                      <div className="emp-name-cell">
                        <div className="emp-avatar">{emp.firstname.substring(0,1)}</div>
                        <span className="emp-name">{emp.firstname} {emp.lastname}</span>
                      </div>
                    </td>
                    <td>{emp.username}</td>
                    <td>
                      <span className="emp-role-badge" style={{ backgroundColor: getRoleBadgeColor(emp.Role_id) }}>
                        {emp.rolename}
                      </span>
                    </td>
                    <td>
                      <button className="emp-action-btn edit" onClick={() => handleEditClick(emp)}>แก้ไข</button>
                      <button className="emp-action-btn delete" onClick={() => handleDeleteClick(emp.user_id, emp.firstname)} style={{ marginLeft: '8px', backgroundColor: '#fee2e2', color: '#ef4444' }}>ลบ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Employee Modal */}
        {showAddForm && (
          <div className="admin-modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>{editingEmployee ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}</h2>
              </div>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group-row">
                  <div className="form-group">
                    <label>ชื่อ</label>
                    <input type="text" name="firstname" required value={newEmployee.firstname} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>นามสกุล</label>
                    <input type="text" name="lastname" required value={newEmployee.lastname} onChange={handleInputChange} />
                  </div>
                </div>
                
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Username (สำหรับเข้าสู่ระบบ)</label>
                    <input type="text" name="username" required value={newEmployee.username} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Password {editingEmployee && <span style={{fontSize:'12px', color:'#9ca3af'}}>(ปล่อยว่างไว้หากไม่ต้องการเปลี่ยน)</span>}</label>
                    <input type="password" name="password" required={!editingEmployee} value={newEmployee.password} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>เบอร์โทรศัพท์</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={newEmployee.phone} 
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                        handleInputChange({ target: { name: 'phone', value: onlyNums } });
                      }} 
                      maxLength="10"
                      placeholder="08xxxxxxxx" 
                    />
                  </div>
                  <div className="form-group">
                    <label>อีเมล</label>
                    <input type="email" name="email" value={newEmployee.email} onChange={handleInputChange} placeholder="example@email.com" />
                  </div>
                </div>

                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <select name="Role_id" value={newEmployee.Role_id} onChange={handleInputChange}>
                    <option value="R01">ผู้ดูแลระบบ (Admin)</option>
                    <option value="R02">แคชเชียร์ (Cashier)</option>
                    <option value="R03">พนักงานครัว (Kitchen)</option>
                  </select>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn outline" onClick={() => setShowAddForm(false)}>ยกเลิก</button>
                  <button type="submit" className="admin-btn primary">บันทึก</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
