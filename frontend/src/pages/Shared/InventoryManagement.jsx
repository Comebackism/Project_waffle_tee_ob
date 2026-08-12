import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaSearch, 
  FaExclamationTriangle, 
  FaTimes, 
  FaTrash, 
  FaEdit, 
  FaSyncAlt, 
  FaDolly, 
  FaHistory, 
  FaCamera, 
  FaUpload, 
  FaImage 
} from 'react-icons/fa';
import BackofficeLayout from '../../layouts/BackofficeLayout';
import './InventoryManagement.css';

const API_BASE = 'http://localhost:5000';

const CATEGORIES = ['ทั้งหมด', 'วัตถุดิบหลัก', 'ท็อปปิ้ง', 'บรรจุภัณฑ์'];

export default function InventoryManagement() {

  // Determine layout role from logged-in user
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const role = currentUser ? (currentUser.Role_id === 'R01' ? 'admin' : 'cashier') : 'cashier';
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');

  // Restock modal
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockItem, setRestockItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [restockMode, setRestockMode] = useState('add'); // 'add' or 'set'

  // Add product modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    ProductName: '',
    quantity: '',
    unit: 'กิโลกรัม',
    category: 'วัตถุดิบหลัก',
    Picture: ''
  });
  const [addImagePreview, setAddImagePreview] = useState(null);

  // Delete confirm modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  // Edit product modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState({ 
    ProductID: '', 
    ProductName: '', 
    unit: '', 
    category: '', 
    Picture: '', 
    imagePreview: '' 
  });

  // Withdraw (เบิกวัตถุดิบ) modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawItem, setWithdrawItem] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDate, setWithdrawDate] = useState(new Date().toISOString().slice(0, 10));

  // Invoice History modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/inventory`);
      const data = await res.json();
      setInventory(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // === Image handling helpers ===
  const handleImageFileChange = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // === Restock ===
  const openRestockModal = (item, mode = 'add') => {
    setRestockItem(item);
    setRestockAmount('');
    setRestockMode(mode);
    setShowRestockModal(true);
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    const amount = Number(restockAmount);
    if (!amount || amount <= 0) return;

    try {
      if (restockMode === 'add') {
        await fetch(`${API_BASE}/api/inventory/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ProductID: restockItem.ProductID, quantity: amount })
        });
      } else {
        await fetch(`${API_BASE}/api/inventory/set`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ProductID: restockItem.ProductID, quantity: amount })
        });
      }
      setShowRestockModal(false);
      fetchInventory();
    } catch (err) {
      console.error('Error restocking:', err);
    }
  };

  // === Add Product ===
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.ProductName.trim()) return;

    try {
      await fetch(`${API_BASE}/api/inventory/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      setShowAddModal(false);
      setNewProduct({ ProductName: '', quantity: '', unit: 'กิโลกรัม', category: 'วัตถุดิบหลัก', Picture: '' });
      setAddImagePreview(null);
      fetchInventory();
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  // === Delete Product ===
  const openDeleteModal = (item) => {
    setDeleteItem(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API_BASE}/api/inventory/product/${deleteItem.ProductID}`, {
        method: 'DELETE'
      });
      setShowDeleteModal(false);
      fetchInventory();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // === Edit Product ===
  const openEditModal = (item) => {
    setEditProduct({
      ProductID: item.ProductID,
      ProductName: item.ProductName,
      unit: item.unit,
      category: item.category || 'วัตถุดิบหลัก',
      Picture: '',
      imagePreview: item.image || ''
    });
    setShowEditModal(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/inventory/product/${editProduct.ProductID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ProductName: editProduct.ProductName,
          unit: editProduct.unit,
          category: editProduct.category,
          Picture: editProduct.Picture || undefined
        })
      });
      setShowEditModal(false);
      fetchInventory();
    } catch (err) {
      console.error('Error editing product:', err);
    }
  };

  // === Withdraw Stock (เบิกวัตถุดิบ) ===
  const openWithdrawModal = (item = null) => {
    const target = item || inventory[0] || null;
    setWithdrawItem(target);
    setWithdrawAmount('');
    setWithdrawDate(new Date().toISOString().slice(0, 10));
    setShowWithdrawModal(true);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawItem) return;
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      alert('กรุณาระบุปริมาณน้ำหนักที่ต้องการเบิก');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/inventory/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ProductID: withdrawItem.ProductID,
          Weight: amount,
          InvDate: withdrawDate,
          user_id: currentUser ? currentUser.user_id : null
        })
      });

      if (!res.ok) throw new Error('Failed to withdraw stock');

      const data = await res.json();
      alert(`✅ ${data.message} (เลขที่: ${data.invoice?.InvoiceNo})`);
      setShowWithdrawModal(false);
      fetchInventory();
    } catch (err) {
      console.error('Error withdrawing stock:', err);
      alert('เกิดข้อผิดพลาดในการเบิกวัตถุดิบ');
    }
  };

  // === Invoice History ===
  const openInvoiceModal = async () => {
    setShowInvoiceModal(true);
    setLoadingInvoices(true);
    try {
      const res = await fetch(`${API_BASE}/api/inventory/invoices`);
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Derived state
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(i => i.status === 'Low Stock').length;
  const outOfStockItems = inventory.filter(i => i.status === 'Out of Stock').length;

  const filteredInventory = inventory.filter(item => {
    const matchesFilter = filter === 'ทั้งหมด' || item.category === filter;
    const matchesSearch = item.ProductName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <BackofficeLayout role={role}>
      <div className="im-page">
        <header className="im-header">
          <div className="im-header-left">
            <h1 className="im-title">จัดการสต็อกสินค้า</h1>
          </div>
          <div className="im-header-right">
            <div className="im-search-box">
              <FaSearch className="im-search-icon" />
              <input 
                type="text" 
                placeholder="ค้นหาสินค้า..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="im-btn-outline" onClick={fetchInventory} title="รีเฟรช">
              <FaSyncAlt />
            </button>
            <button className="im-btn-withdraw-header" onClick={() => openWithdrawModal()} title="เบิกวัตถุดิบ">
              <FaDolly /> เบิกวัตถุดิบ
            </button>
            <button className="im-btn-invoice-header" onClick={openInvoiceModal} title="ดูประวัติการเบิก (Invoice)">
              <FaHistory /> ประวัติการเบิก
            </button>
            <button className="im-btn-primary" onClick={() => setShowAddModal(true)}>
              <FaPlus /> เพิ่มสินค้าใหม่
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="im-summary-grid">
          <div className="im-summary-card" onClick={() => setFilter('ทั้งหมด')} style={{cursor:'pointer'}}>
            <div className="im-sc-label">ทั้งหมด</div>
            <div className="im-sc-value">{totalItems}</div>
          </div>
          <div className="im-summary-card" style={{cursor:'pointer'}} onClick={() => {
            setFilter('ทั้งหมด');
            setSearchQuery('');
          }}>
            <div className="im-sc-label">ใกล้หมด</div>
            <div className="im-sc-value" style={{color: '#f59e0b'}}>{lowStockItems}</div>
            {lowStockItems > 0 && (
              <div className="im-sc-alert" style={{color: '#f59e0b'}}>
                <FaExclamationTriangle /> ระวัง
              </div>
            )}
          </div>
          <div className="im-summary-card alert" style={{cursor:'pointer'}} onClick={() => {
            setFilter('ทั้งหมด');
            setSearchQuery('');
          }}>
            <div className="im-sc-label">ต้องสั่งด่วน</div>
            <div className="im-sc-value">{outOfStockItems}</div>
            {outOfStockItems > 0 && (
              <div className="im-sc-alert">
                สินค้าหมดแล้ว
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="im-filters">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`im-filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Inventory Grid */}
        {loading ? (
          <div className="im-loading">กำลังโหลด...</div>
        ) : filteredInventory.length === 0 ? (
          <div className="im-loading">ไม่พบสินค้าที่ค้นหา</div>
        ) : (
          <div className="im-grid">
            {filteredInventory.map(item => (
              <div key={item.ProductID} className={`im-card ${item.status === 'Out of Stock' ? 'out-of-stock' : ''}`}>
                <div className="im-card-image-wrapper">
                  <img src={item.image} alt={item.ProductName} className="im-card-img" />
                  <span className="im-category-badge">{item.category}</span>
                  
                  {/* Quick Change Picture Button on Image */}
                  <button 
                    className="im-card-camera-btn"
                    onClick={() => openEditModal(item)}
                    title="เปลี่ยนรูปภาพสินค้า"
                  >
                    <FaCamera />
                  </button>

                  {/* Delete button on top-left */}
                  <button className="im-card-delete-btn" onClick={() => openDeleteModal(item)} title="ลบสินค้า">
                    <FaTrash />
                  </button>
                </div>
                <div className="im-card-body">
                  <div className="im-card-header">
                    <h3 className="im-card-title">{item.ProductName}</h3>
                    <span 
                      className="im-status-badge"
                      style={{
                        backgroundColor: item.statusColor + '20',
                        color: item.statusColor
                      }}
                    >
                      {item.status === 'Normal' && <span className="im-status-dot" style={{backgroundColor: item.statusColor}}></span>}
                      {item.status}
                    </span>
                  </div>
                  
                  <div className="im-card-stock">
                    <span className="im-stock-label">จำนวนคงเหลือ</span>
                    <div className="im-stock-value">
                      <span className="im-sv-number">{Number(item.quantity).toFixed(item.unit === 'g' || item.unit === 'กรัม' || item.unit === 'kg' || item.unit === 'กิโลกรัม' ? 1 : 0)}</span>
                      <span className="im-sv-unit">{item.unit}</span>
                    </div>
                  </div>



                  {/* Action Buttons (Icons) */}
                  <div className="im-card-actions">
                    <button 
                      className={`im-action-icon-btn restock-btn ${item.status === 'Out of Stock' ? 'danger-pulse' : ''}`}
                      onClick={() => openRestockModal(item, item.status === 'Out of Stock' ? 'set' : 'add')}
                      title="เติมสต็อกสินค้า"
                    >
                      <FaPlus />
                    </button>
                    <button 
                      className="im-action-icon-btn withdraw-btn"
                      onClick={() => openWithdrawModal(item)}
                      title="เบิกวัตถุดิบ"
                    >
                      <FaDolly />
                    </button>
                    <button 
                      className="im-action-icon-btn edit-btn"
                      onClick={() => openEditModal(item)}
                      title="แก้ไขข้อมูลสินค้า"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== RESTOCK MODAL ========== */}
        {showRestockModal && restockItem && (
          <div className="im-modal-overlay" onClick={() => setShowRestockModal(false)}>
            <div className="im-modal" onClick={e => e.stopPropagation()}>
              <div className="im-modal-header">
                <h2>{restockMode === 'add' ? 'เติมสต็อก' : 'ตั้งค่าจำนวนสต็อก'}</h2>
                <button className="im-modal-close" onClick={() => setShowRestockModal(false)}><FaTimes /></button>
              </div>
              <form onSubmit={handleRestock}>
                <div className="im-modal-body">
                  <div className="im-modal-product-info">
                    <img src={restockItem.image} alt={restockItem.ProductName} />
                    <div>
                      <h3>{restockItem.ProductName}</h3>
                      <p>คงเหลือปัจจุบัน: <strong>{Number(restockItem.quantity).toFixed(1)} {restockItem.unit}</strong></p>
                    </div>
                  </div>

                  {/* Mode Toggle */}
                  <div className="im-restock-mode-toggle">
                    <button 
                      type="button"
                      className={`im-mode-btn ${restockMode === 'add' ? 'active' : ''}`}
                      onClick={() => setRestockMode('add')}
                    >
                      เพิ่มจำนวน
                    </button>
                    <button 
                      type="button"
                      className={`im-mode-btn ${restockMode === 'set' ? 'active' : ''}`}
                      onClick={() => setRestockMode('set')}
                    >
                      ตั้งค่าจำนวนใหม่
                    </button>
                  </div>

                  <div className="im-form-group">
                    <label>{restockMode === 'add' ? 'จำนวนที่ต้องการเพิ่ม' : 'จำนวนใหม่ที่ต้องการตั้ง'} ({restockItem.unit})</label>
                    <input 
                      type="number" 
                      onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                      step="0.1"
                      min="0"
                      autoFocus
                      value={restockAmount}
                      onChange={e => setRestockAmount(e.target.value)}
                      placeholder={`กรอกจำนวน (${restockItem.unit})`}
                      required
                    />
                    {restockMode === 'add' && restockAmount && (
                      <p className="im-form-hint">
                        หลังเติม: <strong>{(Number(restockItem.quantity) + Number(restockAmount)).toFixed(1)} {restockItem.unit}</strong>
                      </p>
                    )}
                  </div>
                </div>
                <div className="im-modal-footer">
                  <button type="button" className="im-btn-cancel" onClick={() => setShowRestockModal(false)}>ยกเลิก</button>
                  <button type="submit" className="im-btn-confirm">
                    {restockMode === 'add' ? 'เติมสต็อก' : 'บันทึก'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========== ADD PRODUCT MODAL ========== */}
        {showAddModal && (
          <div className="im-modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="im-modal" onClick={e => e.stopPropagation()}>
              <div className="im-modal-header">
                <h2>เพิ่มสินค้าใหม่</h2>
                <button className="im-modal-close" onClick={() => setShowAddModal(false)}><FaTimes /></button>
              </div>
              <form onSubmit={handleAddProduct}>
                <div className="im-modal-body">
                  
                  {/* Image Upload for New Product */}
                  <div className="im-form-group">
                    <label>รูปภาพสินค้า</label>
                    <div className="im-image-upload-box">
                      {addImagePreview ? (
                        <div className="im-image-preview-card">
                          <img src={addImagePreview} alt="Preview" className="im-image-preview-img" />
                          <div className="im-image-preview-info">
                            <span className="im-image-preview-tag">เลือกรูปภาพแล้ว</span>
                            <button 
                              type="button" 
                              className="im-btn-remove-preview" 
                              onClick={() => {
                                setAddImagePreview(null);
                                setNewProduct({...newProduct, Picture: ''});
                              }}
                            >
                              <FaTimes /> ลบรูปภาพ
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="im-image-dropzone">
                          <div className="im-dropzone-icon-circle">
                            <FaUpload />
                          </div>
                          <div className="im-dropzone-texts">
                            <span className="im-dropzone-title">คลิกเพื่ออัปโหลดรูปภาพสินค้า</span>
                            <span className="im-dropzone-badge">รองรับไฟล์ PNG, JPG, JPEG</span>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{display: 'none'}}
                            onChange={e => {
                              const file = e.target.files[0];
                              if (file) {
                                handleImageFileChange(file, (base64) => {
                                  setAddImagePreview(base64);
                                  setNewProduct({...newProduct, Picture: base64});
                                });
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="im-form-group">
                    <label>ชื่อสินค้า</label>
                    <input 
                      type="text" 
                      autoFocus
                      value={newProduct.ProductName}
                      onChange={e => setNewProduct({...newProduct, ProductName: e.target.value})}
                      placeholder="เช่น แป้งวาฟเฟิล, ช็อกโกแลตชิพ"
                      required
                    />
                  </div>
                  <div className="im-form-row">
                    <div className="im-form-group">
                      <label>จำนวนเริ่มต้น</label>
                      <input 
                        type="number" 
                        onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                        step="0.1"
                        min="0"
                        value={newProduct.quantity}
                        onChange={e => setNewProduct({...newProduct, quantity: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div className="im-form-group">
                      <label>หน่วย</label>
                      <select 
                        value={newProduct.unit}
                        onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                      >
                        <option value="กิโลกรัม">กิโลกรัม</option>
                        <option value="กรัม">กรัม</option>
                        <option value="ชิ้น">ชิ้น</option>
                        <option value="ฟอง">ฟอง</option>
                        <option value="แพ็ค">แพ็ค</option>
                        <option value="ถุง">ถุง</option>
                        <option value="กล่อง">กล่อง</option>
                        <option value="ขวด">ขวด</option>
                      </select>
                    </div>
                  </div>
                  <div className="im-form-group">
                    <label>หมวดหมู่</label>
                    <select 
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    >
                      <option value="วัตถุดิบหลัก">วัตถุดิบหลัก</option>
                      <option value="ท็อปปิ้ง">ท็อปปิ้ง</option>
                      <option value="บรรจุภัณฑ์">บรรจุภัณฑ์</option>
                    </select>
                  </div>
                </div>
                <div className="im-modal-footer">
                  <button type="button" className="im-btn-cancel" onClick={() => setShowAddModal(false)}>ยกเลิก</button>
                  <button type="submit" className="im-btn-confirm">เพิ่มสินค้า</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========== DELETE CONFIRM MODAL ========== */}
        {showDeleteModal && deleteItem && (
          <div className="im-modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="im-modal im-modal-sm" onClick={e => e.stopPropagation()}>
              <div className="im-modal-header danger">
                <h2>ยืนยันการลบ</h2>
                <button className="im-modal-close" onClick={() => setShowDeleteModal(false)}><FaTimes /></button>
              </div>
              <div className="im-modal-body">
                <p>คุณแน่ใจหรือไม่ว่าต้องการลบ <strong>{deleteItem.ProductName}</strong> ออกจากคลังสต็อก?</p>
              </div>
              <div className="im-modal-footer">
                <button className="im-btn-cancel" onClick={() => setShowDeleteModal(false)}>ยกเลิก</button>
                <button className="im-btn-delete" onClick={handleDelete}>ลบสินค้า</button>
              </div>
            </div>
          </div>
        )}

        {/* ========== EDIT PRODUCT (AND CHANGE PICTURE) MODAL ========== */}
        {showEditModal && (
          <div className="im-modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="im-modal" onClick={e => e.stopPropagation()}>
              <div className="im-modal-header">
                <h2>แก้ไขข้อมูลสินค้าและรูปภาพ</h2>
                <button className="im-modal-close" onClick={() => setShowEditModal(false)}><FaTimes /></button>
              </div>
              <form onSubmit={handleEditProduct}>
                <div className="im-modal-body">
                  
                  {/* Change Image in Edit Modal */}
                  <div className="im-form-group">
                    <label>รูปภาพสินค้า</label>
                    <div className="im-edit-image-card">
                      <div className="im-edit-image-frame">
                        {editProduct.imagePreview ? (
                          <img src={editProduct.imagePreview} alt={editProduct.ProductName} className="im-edit-img-preview" />
                        ) : (
                          <div className="im-edit-img-placeholder">
                            <FaImage />
                          </div>
                        )}
                      </div>
                      <div className="im-edit-image-actions">
                        <label className="im-btn-change-image-modern">
                          <FaCamera /> เลือกรูปภาพใหม่
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{display: 'none'}}
                            onChange={e => {
                              const file = e.target.files[0];
                              if (file) {
                                handleImageFileChange(file, (base64) => {
                                  setEditProduct({
                                    ...editProduct,
                                    Picture: base64,
                                    imagePreview: base64
                                  });
                                });
                              }
                            }}
                          />
                        </label>
                        <span className="im-edit-image-hint">รองรับไฟล์ PNG, JPG, JPEG</span>
                      </div>
                    </div>
                  </div>

                  <div className="im-form-group">
                    <label>รหัสสินค้า</label>
                    <input type="text" value={editProduct.ProductID} disabled style={{background:'#f3f4f6', color:'#9ca3af'}} />
                  </div>
                  <div className="im-form-group">
                    <label>ชื่อสินค้า</label>
                    <input 
                      type="text" 
                      autoFocus
                      value={editProduct.ProductName}
                      onChange={e => setEditProduct({...editProduct, ProductName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="im-form-row">
                    <div className="im-form-group">
                      <label>หน่วย</label>
                      <select 
                        value={editProduct.unit}
                        onChange={e => setEditProduct({...editProduct, unit: e.target.value})}
                      >
                        <option value="กิโลกรัม">กิโลกรัม</option>
                        <option value="กรัม">กรัม</option>
                        <option value="ชิ้น">ชิ้น</option>
                        <option value="ฟอง">ฟอง</option>
                        <option value="แพ็ค">แพ็ค</option>
                        <option value="ถุง">ถุง</option>
                        <option value="กล่อง">กล่อง</option>
                        <option value="ขวด">ขวด</option>
                      </select>
                    </div>
                    <div className="im-form-group">
                      <label>หมวดหมู่</label>
                      <select 
                        value={editProduct.category}
                        onChange={e => setEditProduct({...editProduct, category: e.target.value})}
                      >
                        <option value="วัตถุดิบหลัก">วัตถุดิบหลัก</option>
                        <option value="ท็อปปิ้ง">ท็อปปิ้ง</option>
                        <option value="บรรจุภัณฑ์">บรรจุภัณฑ์</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="im-modal-footer">
                  <button type="button" className="im-btn-cancel" onClick={() => setShowEditModal(false)}>ยกเลิก</button>
                  <button type="submit" className="im-btn-confirm">บันทึกการแก้ไข</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========== WITHDRAW (เบิกวัตถุดิบ) MODAL ========== */}
        {showWithdrawModal && withdrawItem && (
          <div className="im-modal-overlay" onClick={() => setShowWithdrawModal(false)}>
            <div className="im-modal" onClick={e => e.stopPropagation()}>
              <div className="im-modal-header">
                <h2>เบิกวัตถุดิบ (บันทึก Invoice)</h2>
                <button className="im-modal-close" onClick={() => setShowWithdrawModal(false)}><FaTimes /></button>
              </div>
              <form onSubmit={handleWithdraw}>
                <div className="im-modal-body">
                  
                  {/* Select Product */}
                  <div className="im-form-group">
                    <label>เลือกวัตถุดิบที่ต้องการเบิก</label>
                    <select
                      value={withdrawItem.ProductID}
                      onChange={e => {
                        const sel = inventory.find(i => i.ProductID === e.target.value);
                        if (sel) setWithdrawItem(sel);
                      }}
                      className="im-select"
                    >
                      {inventory.map(item => (
                        <option key={item.ProductID} value={item.ProductID}>
                          [{item.ProductID}] {item.ProductName} (คงเหลือ: {Number(item.quantity).toFixed(1)} {item.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="im-modal-product-info">
                    <img src={withdrawItem.image} alt={withdrawItem.ProductName} />
                    <div>
                      <h3>{withdrawItem.ProductName}</h3>
                      <p>รหัสวัตถุดิบ: <strong>{withdrawItem.ProductID}</strong></p>
                      <p>คงเหลือในคลัง: <strong style={{color: Number(withdrawItem.quantity) <= 0 ? '#ef4444' : '#166534'}}>{Number(withdrawItem.quantity).toFixed(1)} {withdrawItem.unit}</strong></p>
                    </div>
                  </div>

                  {/* Weight to Withdraw */}
                  <div className="im-form-group">
                    <label>ปริมาณน้ำหนักที่ต้องการเบิก (Weight in {withdrawItem.unit})</label>
                    <input 
                      type="number" 
                      onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                      step="0.01"
                      min="0.01"
                      max={withdrawItem.quantity > 0 ? withdrawItem.quantity : undefined}
                      autoFocus
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      placeholder={`ระบุปริมาณที่เบิก (${withdrawItem.unit})`}
                      required
                    />
                    {withdrawAmount && (
                      <p className="im-form-hint">
                        คงเหลือหลังเบิก: <strong style={{color: (Number(withdrawItem.quantity) - Number(withdrawAmount)) < 0 ? '#ef4444' : '#111827'}}>
                          {Math.max(0, Number(withdrawItem.quantity) - Number(withdrawAmount)).toFixed(1)} {withdrawItem.unit}
                        </strong>
                        {Number(withdrawAmount) > Number(withdrawItem.quantity) && (
                          <span style={{color: '#ef4444', display: 'block', marginTop: '4px'}}>
                            ⚠️ ปริมาณที่เบิกมากกว่าจำนวนคงเหลือในคลัง
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* InvDate */}
                  <div className="im-form-group">
                    <label>วันที่บันทึกความเคลื่อนไหว (InvDate)</label>
                    <input 
                      type="date"
                      value={withdrawDate}
                      onChange={e => setWithdrawDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 10)}
                      max={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
                      required
                    />
                  </div>

                </div>
                <div className="im-modal-footer">
                  <button type="button" className="im-btn-cancel" onClick={() => setShowWithdrawModal(false)}>ยกเลิก</button>
                  <button type="submit" className="im-btn-confirm" style={{backgroundColor: '#e11d48'}}>
                    ยืนยันการเบิกวัตถุดิบ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========== INVOICE HISTORY (ประวัติการเบิก) MODAL ========== */}
        {showInvoiceModal && (
          <div className="im-modal-overlay" onClick={() => setShowInvoiceModal(false)}>
            <div className="im-modal im-modal-wide" onClick={e => e.stopPropagation()}>
              <div className="im-modal-header">
                <h2>ประวัติการเบิกและรับวัตถุดิบ (ตาราง Invoice)</h2>
                <button className="im-modal-close" onClick={() => setShowInvoiceModal(false)}><FaTimes /></button>
              </div>
              <div className="im-modal-body">
                {loadingInvoices ? (
                  <div className="im-loading">กำลังโหลดข้อมูล...</div>
                ) : invoices.length === 0 ? (
                  <div className="im-loading">ยังไม่มีประวัติการเบิกวัตถุดิบ</div>
                ) : (
                  <div className="im-invoice-table-wrapper">
                    <table className="im-invoice-table">
                      <thead>
                        <tr>
                          <th>เลขที่ใบสำคัญ (InvoiceNo)</th>
                          <th>วันที่ (InvDate)</th>
                          <th>รหัสวัตถุดิบ (ProductId)</th>
                          <th>ชื่อวัตถุดิบ (ProductName)</th>
                          <th style={{textAlign: 'right'}}>ปริมาณน้ำหนัก (Weight)</th>
                          <th style={{textAlign: 'center'}}>ผู้ทำรายการ (By)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv, idx) => (
                          <tr key={inv.InvoiceNo || idx}>
                            <td className="im-inv-no">{inv.InvoiceNo}</td>
                            <td>{new Date(inv.InvDate).toLocaleDateString('th-TH')}</td>
                            <td><span className="im-inv-badge">{inv.ProductId}</span></td>
                            <td className="im-inv-name">{inv.ProductName || '-'}</td>
                            <td style={{textAlign: 'right', fontWeight: 'bold', color: '#dc2626'}}>
                              -{Number(inv.Weight).toFixed(2)} {inv.unit || 'หน่วย'}
                            </td>
                            <td style={{textAlign: 'center'}}>
                              {inv.firstname ? `${inv.firstname} ${inv.lastname || ''}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="im-modal-footer">
                <button className="im-btn-cancel" onClick={() => setShowInvoiceModal(false)}>ปิด</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
