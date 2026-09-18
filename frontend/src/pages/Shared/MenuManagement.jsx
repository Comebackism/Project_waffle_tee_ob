import React, { useState, useEffect } from 'react';
import BackofficeLayout from '../../layouts/BackofficeLayout';
import { FaPlus, FaMinus, FaEdit, FaTrash, FaCheckCircle, FaExclamationTriangle, FaCamera, FaImage, FaTimes, FaToggleOn, FaToggleOff, FaEye, FaInfoCircle, FaFire, FaShoppingCart } from 'react-icons/fa';
import './MenuManagement.css';
import { apiFetch, API_BASE, resolveImage } from '../../utils/api';


export default function MenuManagement({ role }) {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'topping'
  const [menus, setMenus] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  
  // State for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    Calories: '',
    description: '',
    Picture: '',
    imagePreview: null
  });
  const [editId, setEditId] = useState(null);

  // Alert
  const [imAlert, setImAlert] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, toppingRes] = await Promise.all([
        apiFetch('/api/menus/admin/all'),
        apiFetch('/api/toppings/admin/all')
      ]);
      const menuData = await menuRes.json();
      const toppingData = await toppingRes.json();
      setMenus(menuData);
      setToppings(toppingData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setImAlert({ show: true, message, type });
    setTimeout(() => setImAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleImageFileChange = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', Calories: '', description: '', Picture: '', imagePreview: null });
    setEditId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setFormData({
      name: item.name,
      price: item.price,
      Calories: item.Calories || '',
      description: item.description || '',
      Picture: '',
      imagePreview: resolveImage(item.Picture)
    });
    setEditId(activeTab === 'menu' ? item.menu_id : item.topping_id);
    setShowEditModal(true);
  };

  const openDetailModal = (item) => {
    setDetailItem(item);
    setShowDetailModal(true);
  };

  const openPreviewModal = (item) => {
    setPreviewItem(item);
    setShowPreviewModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const endpoint = activeTab === 'menu' ? '/api/menus' : '/api/toppings';
    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to add');
      showAlert(`เพิ่ม${activeTab === 'menu' ? 'เมนู' : 'ท็อปปิ้ง'}ใหม่เรียบร้อยแล้ว`);
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert(`เกิดข้อผิดพลาดในการเพิ่ม${activeTab === 'menu' ? 'เมนู' : 'ท็อปปิ้ง'}`, 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const endpoint = activeTab === 'menu' ? `/api/menus/${editId}` : `/api/toppings/${editId}`;
    try {
      const payload = { ...formData };
      if (!payload.Picture) delete payload.Picture; // Don't send empty Picture if unchanged

      const res = await apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update');
      showAlert(`แก้ไขข้อมูลสำเร็จ`);
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล', 'error');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    const endpoint = activeTab === 'menu' ? `/api/menus/${id}/toggle` : `/api/toppings/${id}/toggle`;
    try {
      const res = await apiFetch(endpoint, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to toggle');
      
      // Update local state directly for responsive UI
      if (activeTab === 'menu') {
        setMenus(menus.map(m => m.menu_id === id ? { ...m, is_active: !m.is_active } : m));
      } else {
        setToppings(toppings.map(t => t.topping_id === id ? { ...t, is_active: !t.is_active } : t));
      }
      
      showAlert(`${currentStatus ? 'ปิด' : 'เปิด'}การแสดงผลสำเร็จ`);
    } catch (err) {
      console.error(err);
      showAlert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ', 'error');
    }
  };

  const openDeleteModal = (item) => {
    setDeleteItem(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const id = activeTab === 'menu' ? deleteItem.menu_id : deleteItem.topping_id;
    const endpoint = activeTab === 'menu' ? `/api/menus/${id}` : `/api/toppings/${id}`;
    try {
      const res = await apiFetch(endpoint, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      showAlert('ลบรายการสำเร็จ');
      setShowDeleteModal(false);
      setDeleteItem(null);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('เกิดข้อผิดพลาดในการลบรายการ', 'error');
    }
  };

  const renderCard = (item) => {
    const id = activeTab === 'menu' ? item.menu_id : item.topping_id;
    
    const imageUrl = resolveImage(item.Picture);
    
    return (
      <div key={id} className={`mm-card ${!item.is_active ? 'inactive' : ''}`}>
        <div className="mm-card-image-wrapper">
          {imageUrl ? (
            <img src={imageUrl} alt={item.name} className="mm-card-img" />
          ) : (
            <div className="mm-no-image"><FaImage /></div>
          )}
          <span className={`mm-status-badge ${item.is_active ? 'active' : 'inactive'}`}>
            {item.is_active ? 'เปิดขาย' : 'ปิดการขาย'}
          </span>
        </div>
        <div className="mm-card-body">
          <h3 className="mm-card-title">{item.name}</h3>
          <p className="mm-card-price">{item.price} บาท</p>
          
          <div className="mm-card-actions">
            {/* ใหม่: ปุ่ม View มุมมองลูกค้า */}
            <button className="mm-btn-icon view" onClick={() => openPreviewModal(item)} title="ดูมุมมองลูกค้า">
              <FaEye />
            </button>
            {/* ใหม่: ปุ่ม Detail รายละเอียด */}
            <button className="mm-btn-icon detail" onClick={() => openDetailModal(item)} title="รายละเอียด">
              <FaInfoCircle />
            </button>
            <button 
              className="mm-btn-icon edit" 
              onClick={() => openEditModal(item)}
              title="แก้ไข"
            >
              <FaEdit />
            </button>
            <button 
              className={`mm-btn-toggle ${item.is_active ? 'active' : ''}`}
              onClick={() => toggleActive(id, item.is_active)}
              title={item.is_active ? 'ปิดการแสดงผล' : 'เปิดการแสดงผล'}
            >
              {item.is_active ? <FaToggleOn /> : <FaToggleOff />}
            </button>
            <button 
              className="mm-btn-icon delete" 
              onClick={() => openDeleteModal(item)}
              title="ลบ"
              style={{ color: '#ef4444' }}
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const itemsToRender = activeTab === 'menu' ? menus : toppings;

  return (
    <BackofficeLayout role={role}>
      <div className="mm-page">
        <header className="mm-header">
          <div className="mm-header-left">
            <h1 className="mm-title">จัดการเมนูและท็อปปิ้ง</h1>
          </div>
          <div className="mm-header-right">
            <button className="mm-btn-primary" onClick={openAddModal}>
              <FaPlus /> เพิ่ม{activeTab === 'menu' ? 'เมนู' : 'ท็อปปิ้ง'}ใหม่
            </button>
          </div>
        </header>

        <div className="mm-tabs">
          <button 
            className={`mm-tab ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            เมนูหลัก ({menus.length})
          </button>
          <button 
            className={`mm-tab ${activeTab === 'topping' ? 'active' : ''}`}
            onClick={() => setActiveTab('topping')}
          >
            ท็อปปิ้ง ({toppings.length})
          </button>
        </div>

        {loading ? (
          <div className="mm-loading">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="mm-grid">
            {itemsToRender.map(renderCard)}
            {itemsToRender.length === 0 && (
              <div className="mm-empty">ไม่พบข้อมูล</div>
            )}
          </div>
        )}

        {/* ========== ADD MODAL ========== */}
        {showAddModal && (
          <div className="mm-modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="mm-modal" onClick={e => e.stopPropagation()}>
              <div className="mm-modal-header">
                <h2>เพิ่ม{activeTab === 'menu' ? 'เมนู' : 'ท็อปปิ้ง'}ใหม่</h2>
                <button className="mm-modal-close" onClick={() => setShowAddModal(false)}><FaTimes /></button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="mm-modal-body">
                  <div className="mm-form-group">
                    <label>รูปภาพ (จำเป็น)</label>
                    <div className="mm-image-upload-box">
                      {formData.imagePreview ? (
                        <div className="mm-image-preview-card">
                          <img src={formData.imagePreview} alt="Preview" className="mm-image-preview-img" />
                          <button 
                            type="button" 
                            className="mm-btn-remove-preview" 
                            onClick={() => setFormData({...formData, Picture: '', imagePreview: null})}
                          >
                            <FaTimes /> ลบรูปภาพ
                          </button>
                        </div>
                      ) : (
                        <label className="mm-image-dropzone">
                          <div className="mm-dropzone-icon-circle">
                            <FaCamera />
                          </div>
                          <div className="mm-dropzone-texts">
                            <span className="mm-dropzone-title">คลิกเพื่ออัปโหลดรูปภาพ</span>
                            <span className="mm-dropzone-badge">รองรับไฟล์ PNG, JPG, JPEG</span>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{display: 'none'}}
                            onChange={e => {
                              const file = e.target.files[0];
                              if (file) {
                                handleImageFileChange(file, (base64) => {
                                  setFormData({...formData, Picture: base64, imagePreview: base64});
                                });
                              }
                            }}
                            required
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="mm-form-group">
                    <label>ชื่อ{activeTab === 'menu' ? 'เมนู' : 'ท็อปปิ้ง'}</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mm-form-row">
                    <div className="mm-form-group">
                      <label>ราคา (บาท)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mm-form-group">
                      <label>แคลอรี่ (kcal)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={formData.Calories}
                        onChange={e => setFormData({...formData, Calories: e.target.value})}
                      />
                    </div>
                  </div>
                  {activeTab === 'menu' && (
                    <div className="mm-form-group">
                      <label>คำอธิบาย</label>
                      <textarea 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        rows="3"
                      />
                    </div>
                  )}
                </div>
                <div className="mm-modal-footer">
                  <button type="button" className="mm-btn-cancel" onClick={() => setShowAddModal(false)}>ยกเลิก</button>
                  <button type="submit" className="mm-btn-confirm">บันทึก</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========== DELETE CONFIRM MODAL ========== */}
        {showDeleteModal && deleteItem && (
          <div className="mm-modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="mm-modal mm-modal-sm" onClick={e => e.stopPropagation()} style={{maxWidth: '400px'}}>
              <div className="mm-modal-header" style={{borderBottomColor: '#fecaca', background: '#fef2f2'}}>
                <h2 style={{color: '#dc2626'}}>ยืนยันการลบ</h2>
                <button className="mm-modal-close" onClick={() => setShowDeleteModal(false)} style={{color: '#dc2626'}}><FaTimes /></button>
              </div>
              <div className="mm-modal-body">
                <p>คุณแน่ใจหรือไม่ว่าต้องการลบ <strong>{deleteItem.name}</strong> ?</p>
                <p style={{fontSize: '13px', color: '#6b7280', marginTop: '8px'}}>การกระทำนี้ไม่สามารถกู้คืนได้</p>
              </div>
              <div className="mm-modal-footer">
                <button className="mm-btn-cancel" onClick={() => setShowDeleteModal(false)}>ยกเลิก</button>
                <button className="mm-btn-confirm" onClick={handleDelete} style={{background: '#dc2626', borderColor: '#dc2626', color: 'white'}}>ลบรายการ</button>
              </div>
            </div>
          </div>
        )}

        {/* ========== EDIT MODAL ========== */}
        {showEditModal && (
          <div className="mm-modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="mm-modal" onClick={e => e.stopPropagation()}>
              <div className="mm-modal-header">
                <h2>แก้ไข{activeTab === 'menu' ? 'เมนู' : 'ท็อปปิ้ง'}</h2>
                <button className="mm-modal-close" onClick={() => setShowEditModal(false)}><FaTimes /></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="mm-modal-body">
                  <div className="mm-form-group">
                    <label>รูปภาพ</label>
                    <div className="mm-image-upload-box">
                      {formData.imagePreview ? (
                        <div className="mm-image-preview-card">
                          <img src={formData.imagePreview} alt="Preview" className="mm-image-preview-img" />
                          <label className="mm-btn-change-image">
                            <FaCamera /> เปลี่ยนรูปภาพ
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{display: 'none'}}
                              onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleImageFileChange(file, (base64) => {
                                    setFormData({...formData, Picture: base64, imagePreview: base64});
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="mm-image-dropzone">
                          <div className="mm-dropzone-icon-circle">
                            <FaCamera />
                          </div>
                          <div className="mm-dropzone-texts">
                            <span className="mm-dropzone-title">คลิกเพื่ออัปโหลดรูปภาพ</span>
                            <span className="mm-dropzone-badge">รองรับไฟล์ PNG, JPG, JPEG</span>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{display: 'none'}}
                            onChange={e => {
                              const file = e.target.files[0];
                              if (file) {
                                handleImageFileChange(file, (base64) => {
                                  setFormData({...formData, Picture: base64, imagePreview: base64});
                                });
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="mm-form-group">
                    <label>ชื่อ{activeTab === 'menu' ? 'เมนู' : 'ท็อปปิ้ง'}</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mm-form-row">
                    <div className="mm-form-group">
                      <label>ราคา (บาท)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mm-form-group">
                      <label>แคลอรี่ (kcal)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={formData.Calories}
                        onChange={e => setFormData({...formData, Calories: e.target.value})}
                      />
                    </div>
                  </div>
                  {activeTab === 'menu' && (
                    <div className="mm-form-group">
                      <label>คำอธิบาย</label>
                      <textarea 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        rows="3"
                      />
                    </div>
                  )}
                </div>
                <div className="mm-modal-footer">
                  <button type="button" className="mm-btn-cancel" onClick={() => setShowEditModal(false)}>ยกเลิก</button>
                  <button type="submit" className="mm-btn-confirm">บันทึกการแก้ไข</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========== CUSTOMER PREVIEW MODAL ========== */}
        {showPreviewModal && previewItem && (
          <div className="mm-modal-overlay" onClick={() => setShowPreviewModal(false)}>
            <div className="mm-modal mm-preview-modal" onClick={e => e.stopPropagation()}>
              <div className="mm-modal-header" style={{ background: '#fff8f0', borderBottomColor: '#fed7aa' }}>
                <h2 style={{ color: '#c2410c' }}><FaEye style={{ marginRight: '8px', fontSize: '16px' }} />มุมมองลูกค้า</h2>
                <button className="mm-modal-close" onClick={() => setShowPreviewModal(false)}><FaTimes /></button>
              </div>
              <div className="mm-preview-body">
                <div className="mm-preview-image-container">
                  <img src={resolveImage(previewItem.Picture)} alt={previewItem.name} className="mm-preview-image"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }} />
                </div>
                <div className="mm-preview-info-card">
                  <div className="mm-preview-title-row">
                    <h2 className="mm-preview-title">{previewItem.name}</h2>
                    <span className="mm-preview-price">{previewItem.price} บาท</span>
                  </div>
                  <p className="mm-preview-description">
                    {previewItem.description ? previewItem.description.replace(/🔥/g, '').trim() : 'ไม่มีคำอธิบาย'}
                    {previewItem.Calories ? (
                      <span className="mm-preview-calories"><FaFire /> {previewItem.Calories} kcal</span>
                    ) : ''}
                  </p>
                </div>
                <div className="mm-preview-action-bar">
                  <div className="mm-preview-qty">
                    <span className="mm-preview-qty-btn"><FaMinus style={{ fontSize: '10px' }} /></span>
                    <span className="mm-preview-qty-val">1</span>
                    <span className="mm-preview-qty-btn"><FaPlus style={{ fontSize: '10px' }} /></span>
                  </div>
                  <div className="mm-preview-cart-btn">
                    <FaShoppingCart style={{ marginRight: '6px' }} /> เพิ่มลงตะกร้า • {previewItem.price} บาท
                  </div>
                </div>
              </div>
              <div className="mm-modal-footer" style={{ background: '#fffbeb' }}>
                <span style={{ fontSize: '12px', color: '#92400e', flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaExclamationTriangle style={{ flexShrink: 0 }} /> นี่คือตัวอย่างที่ลูกค้าจะเห็น (ไม่สามารถสั่งซื้อได้จากหน้านี้)
                </span>
                <button className="mm-btn-cancel" onClick={() => setShowPreviewModal(false)}>ปิด</button>
              </div>
            </div>
          </div>
        )}

        {/* ========== DETAIL MODAL ========== */}
        {showDetailModal && detailItem && (
          <div className="mm-modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="mm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <div className="mm-modal-header">
                <h2>รายละเอียด{activeTab === 'menu' ? 'เมนู' : 'ท็อปปิ้ง'}</h2>
                <button className="mm-modal-close" onClick={() => setShowDetailModal(false)}><FaTimes /></button>
              </div>
              <div className="mm-modal-body" style={{ padding: 0 }}>
                <div className="mm-detail-image-wrapper">
                  {resolveImage(detailItem.Picture) ? (
                    <img src={resolveImage(detailItem.Picture)} alt={detailItem.name} className="mm-detail-image" />
                  ) : (
                    <div className="mm-no-image" style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}><FaImage /></div>
                  )}
                  <span className={`mm-status-badge ${detailItem.is_active ? 'active' : 'inactive'}`}>
                    {detailItem.is_active ? 'เปิดขาย' : 'ปิดการขาย'}
                  </span>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>{detailItem.name}</h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '22px', fontWeight: 700, color: '#4f46e5' }}>{detailItem.price} บาท</p>
                  <div className="mm-detail-info-grid">
                    <div className="mm-detail-info-item">
                      <span className="mm-detail-info-label">รหัส</span>
                      <span className="mm-detail-info-value">{activeTab === 'menu' ? detailItem.menu_id : detailItem.topping_id}</span>
                    </div>
                    {detailItem.Calories && (
                      <div className="mm-detail-info-item">
                        <span className="mm-detail-info-label">แคลอรี่</span>
                        <span className="mm-detail-info-value">{detailItem.Calories} kcal</span>
                      </div>
                    )}
                    <div className="mm-detail-info-item">
                      <span className="mm-detail-info-label">สถานะ</span>
                      <span className={`mm-detail-status-chip ${detailItem.is_active ? 'active' : 'inactive'}`}>
                        {detailItem.is_active ? 'เปิดขาย' : 'ปิดการขาย'}
                      </span>
                    </div>
                  </div>
                  {detailItem.description && (
                    <div style={{ marginTop: '16px' }}>
                      <span className="mm-detail-info-label">คำอธิบาย</span>
                      <p style={{ margin: '6px 0 0 0', color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>{detailItem.description}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mm-modal-footer">
                <button className="mm-btn-cancel" onClick={() => setShowDetailModal(false)}>ปิด</button>
                <button className="mm-btn-confirm" onClick={() => { setShowDetailModal(false); openEditModal(detailItem); }}>แก้ไข</button>
              </div>
            </div>
          </div>
        )}

        {/* Generic Alert Modal */}
        {imAlert.show && (
          <div className="mm-modal-overlay" onClick={() => setImAlert({ ...imAlert, show: false })}>
            <div className="mm-modal" style={{ maxWidth: '350px', textAlign: 'center', padding: '32px 24px' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '56px', color: imAlert.type === 'error' ? '#ef4444' : '#22c55e', margin: '0 auto 16px auto', display: 'flex', justifyContent: 'center' }}>
                {imAlert.type === 'error' ? <FaExclamationTriangle /> : <FaCheckCircle />}
              </div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1f2937' }}>
                {imAlert.type === 'error' ? 'แจ้งเตือน' : 'สำเร็จ'}
              </h2>
              <p style={{ color: '#4b5563', fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>
                {imAlert.message}
              </p>
              <button 
                className="mm-btn-confirm" 
                style={{ width: '100%', background: imAlert.type === 'error' ? '#ef4444' : '#22c55e', border: 'none', borderRadius: '8px' }}
                onClick={() => setImAlert({ ...imAlert, show: false })}
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
