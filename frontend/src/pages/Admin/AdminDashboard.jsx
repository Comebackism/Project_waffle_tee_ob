import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaSyncAlt, FaTrash, FaTimes, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import BackofficeLayout from '../../layouts/BackofficeLayout';
import './AdminDashboard.css';

const API_BASE = 'http://localhost:5000';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
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

  const [adminAlert, setAdminAlert] = useState({ show: false, message: '', type: 'error' });

  const showAlert = (message, type = 'error') => {
    setAdminAlert({ show: true, message, type });
  };

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
    
    // Validate firstname and lastname to only accept Thai and English letters (and spaces)
    if (name === 'firstname' || name === 'lastname') {
      const regex = /^[a-zA-Zก-ฮะ-์\s]*$/;
      if (!regex.test(value)) {
        return; // Reject invalid characters
      }
    }

    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newEmployee.phone && newEmployee.phone.length !== 10) {
      showAlert("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก", "error");
      return;
    }
    try {
      let res;
      if (editingEmployee) {
        // Edit mode
        res = await fetch(`${API_BASE}/api/users/${editingEmployee}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEmployee)
        });
      } else {
        // Add mode
        res = await fetch(`${API_BASE}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEmployee)
        });
      }

      if (!res.ok) {
        const data = await res.json();
        showAlert(data.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
        return;
      }

      setShowAddForm(false);
      setEditingEmployee(null);
      setNewEmployee({ firstname: '', lastname: '', username: '', password: '', phone: '', email: '', Role_id: 'R02' });
      fetchEmployees();
    } catch (err) {
      console.error('Error saving employee:', err);
      showAlert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
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

  const handleDeleteClick = (emp) => {
    setEmployeeToDelete(emp);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!employeeToDelete) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${employeeToDelete.user_id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchEmployees();
      } else {
        const data = await res.json();
        showAlert(data.message || 'เกิดข้อผิดพลาดในการลบพนักงาน', 'error');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
    } finally {
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
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

  const [showClearOrdersModal, setShowClearOrdersModal] = useState(false);

  const clearDailyOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/clear`, { method: 'DELETE' });
      const data = await res.json();
      showAlert(data.message || 'ล้างออเดอร์รายวันสำเร็จ', 'success');
    } catch (err) {
      console.error('Error clearing orders:', err);
      showAlert('เกิดข้อผิดพลาดในการล้างออเดอร์', 'error');
    } finally {
      setShowClearOrdersModal(false);
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
            <button className="admin-btn danger" onClick={() => setShowClearOrdersModal(true)}>
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
                      <button className="emp-action-btn delete" onClick={() => handleDeleteClick(emp)} style={{ marginLeft: '8px', backgroundColor: '#fee2e2', color: '#ef4444' }}>ลบ</button>
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
                    <label>นามสกุล (ตัวเลือก)</label>
                    <input type="text" name="lastname" value={newEmployee.lastname} onChange={handleInputChange} />
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

        {/* Delete Employee Confirm Modal */}
        {showDeleteModal && employeeToDelete && (
          <div className="admin-modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="admin-modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header danger">
                <h2 style={{ color: '#ef4444', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaTrash /> ยืนยันการลบ
                </h2>
              </div>
              <div className="admin-modal-body" style={{ padding: '20px 0', color: '#4b5563', fontSize: '15px' }}>
                <p>คุณแน่ใจหรือไม่ว่าต้องการลบพนักงาน <strong>{employeeToDelete.firstname} {employeeToDelete.lastname}</strong> ออกจากระบบ?</p>
              </div>
              <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button className="admin-btn outline" onClick={() => setShowDeleteModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#4b5563', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                <button className="admin-btn primary" onClick={executeDelete} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>ลบพนักงาน</button>
              </div>
            </div>
          </div>
        )}

        {/* Clear Daily Orders Confirm Modal */}
        {showClearOrdersModal && (
          <div className="admin-modal-overlay" onClick={() => setShowClearOrdersModal(false)}>
            <div className="admin-modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header danger">
                <h2 style={{ color: '#ef4444', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaTrash /> ยืนยันการล้างออเดอร์รายวัน
                </h2>
              </div>
              <div className="admin-modal-body" style={{ padding: '20px 0', color: '#4b5563', fontSize: '15px' }}>
                <p>คุณแน่ใจหรือไม่ว่าต้องการ <strong>ล้างข้อมูลออเดอร์ทั้งหมด</strong> เพื่อเริ่มวันใหม่?</p>
                <p style={{ marginTop: '8px', color: '#ef4444', fontSize: '13px' }}>* คิวและรหัสออเดอร์จะถูกรีเซ็ต การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              </div>
              <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button className="admin-btn outline" onClick={() => setShowClearOrdersModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#4b5563', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                <button className="admin-btn danger" onClick={clearDailyOrders} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>ยืนยันการล้างออเดอร์</button>
              </div>
            </div>
          </div>
        )}

        {/* Generic Alert Modal */}
        {adminAlert.show && (
          <div className="admin-modal-overlay" onClick={() => setAdminAlert({ ...adminAlert, show: false })}>
            <div className="admin-modal" style={{ maxWidth: '350px', textAlign: 'center', padding: '32px 24px' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '56px', color: adminAlert.type === 'error' ? '#ef4444' : '#22c55e', margin: '0 auto 16px auto', display: 'flex', justifyContent: 'center' }}>
                {adminAlert.type === 'error' ? <FaExclamationCircle /> : <FaCheckCircle />}
              </div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1f2937' }}>
                {adminAlert.type === 'error' ? 'แจ้งเตือน' : 'สำเร็จ'}
              </h2>
              <p style={{ color: '#4b5563', fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>
                {adminAlert.message}
              </p>
              <button 
                className="admin-btn primary" 
                style={{ width: '100%', padding: '12px', background: adminAlert.type === 'error' ? '#ef4444' : '#22c55e', border: 'none', borderRadius: '12px' }}
                onClick={() => setAdminAlert({ ...adminAlert, show: false })}
              >
                ตกลง
              </button>
            </div>
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
