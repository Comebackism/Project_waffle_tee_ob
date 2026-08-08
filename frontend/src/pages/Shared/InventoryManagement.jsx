import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaExclamationTriangle, FaTimes, FaTrash, FaEdit, FaSyncAlt } from 'react-icons/fa';
import BackofficeLayout from '../../layouts/BackofficeLayout';
import './InventoryManagement.css';

const API_BASE = 'http://localhost:5000';

const CATEGORIES = ['ทั้งหมด', 'วัตถุดิบหลัก', 'ท็อปปิ้ง', 'บรรจุภัณฑ์'];

export default function InventoryManagement({ role }) {
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
    category: 'วัตถุดิบหลัก'
  });

  // Delete confirm
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  // Edit product modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState({ ProductID: '', ProductName: '', unit: '', category: '' });

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
      setNewProduct({ ProductName: '', quantity: '', unit: 'กิโลกรัม', category: 'วัตถุดิบหลัก' });
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
      category: item.category
    });
    setShowEditModal(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/inventory/product/${editProduct.ProductID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ProductName: editProduct.ProductName, unit: editProduct.unit })
      });
      setShowEditModal(false);
      fetchInventory();
    } catch (err) {
      console.error('Error updating product:', err);
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
                <FaExclamationTriangle /> ต้องการความสนใจ
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

                  {/* Progress Bar */}
                  <div className="im-progress-bar">
                    <div 
                      className="im-progress-fill" 
                      style={{
                        width: `${Math.min(100, (item.quantity / (item.status === 'Normal' ? item.quantity * 2 : 10)) * 100)}%`,
                        backgroundColor: item.statusColor
                      }}
                    ></div>
                  </div>

                  {/* Action Buttons */}
                  <div className="im-card-actions">
                    {item.status === 'Out of Stock' ? (
                      <button 
                        className="im-action-btn danger"
                        onClick={() => openRestockModal(item, 'set')}
                      >
                        สั่งซื้อด่วน
                      </button>
                    ) : (
                      <>
                        <button 
                          className="im-action-btn outline"
                          onClick={() => openRestockModal(item, 'add')}
                        >
                          เติมสต็อก
                        </button>
                        <button 
                          className="im-action-btn edit-btn"
                          onClick={() => openEditModal(item)}
                          title="แก้ไขข้อมูลสินค้า"
                        >
                          <FaEdit />
                        </button>
                      </>
                    )}
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
                <div className="im-delete-warning">
                  <FaExclamationTriangle className="im-delete-icon" />
                  <p>คุณต้องการลบสินค้า <strong>"{deleteItem.ProductName}"</strong> ออกจากระบบใช่หรือไม่?</p>
                  <p className="im-delete-sub">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </div>
              </div>
              <div className="im-modal-footer">
                <button className="im-btn-cancel" onClick={() => setShowDeleteModal(false)}>ยกเลิก</button>
                <button className="im-btn-delete" onClick={handleDelete}>ลบสินค้า</button>
              </div>
            </div>
          </div>
        )}

        {/* ========== EDIT PRODUCT MODAL ========== */}
        {showEditModal && (
          <div className="im-modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="im-modal" onClick={e => e.stopPropagation()}>
              <div className="im-modal-header">
                <h2>แก้ไขข้อมูลสินค้า</h2>
                <button className="im-modal-close" onClick={() => setShowEditModal(false)}><FaTimes /></button>
              </div>
              <form onSubmit={handleEditProduct}>
                <div className="im-modal-body">
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
                </div>
                <div className="im-modal-footer">
                  <button type="button" className="im-btn-cancel" onClick={() => setShowEditModal(false)}>ยกเลิก</button>
                  <button type="submit" className="im-btn-confirm">บันทึกการแก้ไข</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
