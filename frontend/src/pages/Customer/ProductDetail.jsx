import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaArrowLeft, FaShoppingCart, FaPlus, FaMinus, FaCheck, FaFire, FaExclamationCircle } from 'react-icons/fa';
import './ProductDetail.css';

const API_BASE = 'http://localhost:5000';

const resolveImage = (pic) => {
  if (!pic) return 'https://via.placeholder.com/300';
  if (pic.startsWith('http')) return pic;
  if (pic.startsWith('/images/')) return `${API_BASE}${pic}`;
  return `${API_BASE}/images/${pic}`;
};

// 1. รับ prop onAddToCart เข้ามาจาก App.jsx 👈
export default function ProductDetail({ productId = 2, onBack, onAddToCart, editingItem, onUpdateCartItem }) {
  // State สำหรับเก็บข้อมูลสินค้าจาก Database
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // State สำหรับนับจำนวนสินค้า และเก็บท็อปปิ้งที่เลือก
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState({});

  // Fly-to-cart animation
  const [flyItems, setFlyItems] = useState([]);
  const cartTargetRef = useRef(null);

  // Topping Limit Modal State
  const [showToppingLimitModal, setShowToppingLimitModal] = useState(false);

  // ดึงข้อมูลรายละเอียดสินค้า + ท็อปปิ้งจาก API ตาม productId
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/menus/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching product detail:', err);
        setLoading(false);
      });
  }, [productId]);

  // Pre-fill data when editing an existing cart item
  useEffect(() => {
    if (editingItem && product) {
      setQuantity(editingItem.quantity || 1);
      // Rebuild selectedToppings from editingItem.toppings
      const toppingMap = {};
      if (editingItem.toppings && editingItem.toppings.length > 0) {
        editingItem.toppings.forEach(t => {
          const id = t.topping_id || t.id;
          if (id) {
            toppingMap[id] = t.quantity || 1;
          }
        });
      }
      setSelectedToppings(toppingMap);
    }
  }, [editingItem, product]);

  // ฟังก์ชันเพิ่ม/ลดจำนวนท็อปปิ้ง + animation
  const updateToppingQuantity = (id, change, event) => {
    event.stopPropagation();
    const currentQty = selectedToppings[id] || 0;
    const newQty = currentQty + change;
    
    // ตั้งลิมิตท็อปปิ้งแต่ละชนิดไม่เกิน 3
    if (newQty > 3) {
      setShowToppingLimitModal(true);
      return;
    }
    
    if (change > 0 && event) {
      triggerFlyAnimation(event);
    }
    
    if (newQty <= 0) {
      const newToppings = { ...selectedToppings };
      delete newToppings[id];
      setSelectedToppings(newToppings);
    } else {
      setSelectedToppings({ ...selectedToppings, [id]: newQty });
    }
  };

  const triggerFlyAnimation = useCallback((event) => {
    // Get the source element position
    const sourceEl = event.currentTarget;
    const sourceRect = sourceEl.getBoundingClientRect();

    // Target: the cart button in the action bar
    const cartEl = cartTargetRef.current;
    if (!cartEl) return;
    const cartRect = cartEl.getBoundingClientRect();

    const flyId = Date.now() + Math.random();
    const newFly = {
      id: flyId,
      startX: sourceRect.left + sourceRect.width / 2,
      startY: sourceRect.top + sourceRect.height / 2,
      endX: cartRect.left + cartRect.width / 2,
      endY: cartRect.top + cartRect.height / 2,
    };

    setFlyItems(prev => [...prev, newFly]);

    // Remove after animation ends
    setTimeout(() => {
      setFlyItems(prev => prev.filter(f => f.id !== flyId));
    }, 700);
  }, []);

  // 2. ฟังก์ชันเมื่อกดปุ่มเพิ่มลงตะกร้า 👈
  const handleAddToCartClick = () => {
    if (!product) return;

    // ดึงวัตถุท็อปปิ้งฉบับเต็ม (มี id, name, price, quantity) ที่ผู้ใช้เลือก
    const toppingList = product.toppings || [];
    const chosenToppings = toppingList
      .filter((t) => selectedToppings[t.topping_id])
      .map((t) => ({ ...t, quantity: selectedToppings[t.topping_id] }));

    // ตรวจสอบ URL รูปภาพ
    const imageUrl = resolveImage(product.Picture);

    // รวบรวมข้อมูลสินค้าส่งไปที่ App.jsx
    const itemToAdd = {
      cartId: Date.now(), // สร้าง unique id สำหรับรายการในตะกร้า
      productId: product.menu_id,
      name: product.name,
      image: imageUrl,
      basePrice: Number(product.price) || 0,
      baseCalories: Number(product.Calories) || 0,
      toppings: chosenToppings,
      quantity: quantity
    };

    if (onAddToCart) {
      onAddToCart(itemToAdd);
    }
  };

  // 2b. ฟังก์ชันเมื่อกดปุ่มอัปเดตในตะกร้า (โหมดแก้ไข) 👈
  const handleUpdateCartClick = () => {
    if (!product || !editingItem) return;

    const toppingList = product.toppings || [];
    const chosenToppings = toppingList
      .filter((t) => selectedToppings[t.topping_id])
      .map((t) => ({ ...t, quantity: selectedToppings[t.topping_id] }));

    const imageUrl = resolveImage(product.Picture);

    const updatedItem = {
      ...editingItem,
      productId: product.menu_id,
      name: product.name,
      image: imageUrl,
      basePrice: Number(product.price) || 0,
      baseCalories: Number(product.Calories) || 0,
      toppings: chosenToppings,
      quantity: quantity
    };

    if (onUpdateCartItem) {
      onUpdateCartItem(updatedItem);
    }
  };

  // แสดงหน้ากำลังโหลดข้อมูล
  if (loading) {
    return (
      <div className="product-detail-container" style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
        <h2>กำลังโหลดข้อมูลเมนู...</h2>
      </div>
    );
  }

  // กรณีหาข้อมูลไม่เจอ
  if (!product) {
    return (
      <div className="product-detail-container" style={{ textAlign: 'center', padding: '60px' }}>
        <h2>ไม่พบข้อมูลเมนูนี้</h2>
        <button className="back-button" onClick={onBack} style={{ marginTop: '20px' }}>
          <FaArrowLeft /> กลับ
        </button>
      </div>
    );
  }

  // คำนวณราคารวม (แปลงราคา Decimal จาก DB เป็น Number ให้ปลอดภัย)
  const basePrice = Number(product.price) || 0;
  const toppingList = product.toppings || [];

  const toppingPriceTotal = Object.entries(selectedToppings).reduce((total, [id, qty]) => {
    const item = toppingList.find((t) => t.topping_id === id);
    return total + (item ? Number(item.price) * qty : 0);
  }, 0);

  const totalPrice = (basePrice + toppingPriceTotal) * quantity;

  return (
    <div className="product-detail-container">
      {/* Header ย้อนกลับ */}
      <header className="product-detail-header">
        <button className="back-button" aria-label="กลับ" onClick={onBack}>
          <FaArrowLeft />
        </button>
        <h1 className="header-title">รายละเอียดเมนู</h1>
        <div className="header-placeholder"></div>
      </header>

      {/* Grid หลัก (2 คอลัมน์บน Desktop, 1 คอลัมน์บน Mobile) */}
      <div className="product-detail-grid">

        {/* ฝั่งซ้าย: รูปภาพสินค้าดึงมาจาก DB/Backend */}
        <div className="product-image-container">
          <img
            src={resolveImage(product.Picture)}
            alt={product.name}
            className="product-image"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }}
          />
        </div>

        {/* ฝั่งขวา: รายละเอียด & ท็อปปิ้ง */}
        <div className="product-info-section">

          {/* การ์ดรายละเอียดหลัก */}
          <div className="product-main-card">
            <div className="product-title-price">
              <h2 className="product-title">{product.name}</h2>
              <span className="product-price">฿{basePrice}</span>
            </div>
            <p className="product-description">
              {product.description ? product.description.replace(/🔥/g, '').trim() : ''}
              {product.Calories ? (
                <span style={{ display: 'inline-flex', gap: '4px', marginLeft: '6px', color: '#ff6b00', fontWeight: '500' }}>
                  <FaFire style={{ margin: 'auto 0px' }} /> ({product.Calories} kcal)
                </span>
              ) : ''}
            </p>
          </div>

          {/* การ์ดตัวเลือกท็อปปิ้ง (แสดงต่อเมื่อมีรายการท็อปปิ้งใน DB) */}
          {toppingList.length > 0 && (
            <div className="topping-card">
              <div className="topping-header">
                <h3 className="topping-title">เลือกท็อปปิ้ง</h3>
                <span className="topping-badge">เลือกได้หลายอย่าง</span>
              </div>

              <div className="topping-grid">
                {toppingList.map((item) => {
                  const qty = selectedToppings[item.topping_id] || 0;
                  const isSelected = qty > 0;
                  return (
                    <div
                      key={item.topping_id}
                      className={`topping-item ${isSelected ? 'selected' : ''} ${!item.is_active ? 'inactive' : ''}`}
                      onClick={(e) => item.is_active ? updateToppingQuantity(item.topping_id, 1, e) : null}
                      style={!item.is_active ? { opacity: 0.6, cursor: 'not-allowed', filter: 'grayscale(1)' } : {}}
                    >
                      <div className="topping-info">
                        <span className="topping-name">{item.name}</span>
                        <span className="topping-details" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ whiteSpace: 'nowrap' }}>+ {Number(item.price)} บาท</span>
                          <span style={{color: '#e5e7eb'}}>|</span>
                          <span style={{color: '#f97316', whiteSpace: 'nowrap'}}>🔥 + {Number(item.Calories).toFixed(2)} kcal</span>
                          {!item.is_active && (
                            <>
                              <span style={{color: '#e5e7eb'}}>|</span>
                              <span style={{ fontSize: '11px', color: '#ef4444', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '8px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>หมดชั่วคราว</span>
                            </>
                          )}
                        </span>
                      </div>
                      <div className="topping-qty-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!item.is_active ? (
                          <div style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 'bold' }}>หมด</div>
                        ) : isSelected ? (
                          <>
                            <button 
                              className="topping-qty-btn" 
                              onClick={(e) => { e.stopPropagation(); updateToppingQuantity(item.topping_id, -1, e); }}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#e5e7eb', color: '#4b5563', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <FaMinus style={{ fontSize: '12px' }} />
                            </button>
                            <span style={{ fontWeight: 'bold', fontSize: '15px', width: '20px', textAlign: 'center', color: '#333' }}>{qty}</span>
                            <button 
                              className="topping-qty-btn" 
                              onClick={(e) => { e.stopPropagation(); updateToppingQuantity(item.topping_id, 1, e); }}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--primary-red, #B30021)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(179,0,33,0.3)' }}
                            >
                              <FaPlus style={{ fontSize: '12px' }} />
                            </button>
                          </>
                        ) : (
                          <div style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1.5px solid #d1d5db', background: '#fff' }}></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* แถบปุ่มกดลอยด้านล่าง */}
      <div className="action-bar-container">
        {/* ปุ่มเพิ่ม-ลด จำนวน */}
        <div className="quantity-control">
          <button
            className="quantity-btn"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <FaMinus />
          </button>
          <span className="quantity-value">{quantity}</span>
          <button
            className="quantity-btn"
            onClick={() => setQuantity(quantity + 1)}
          >
            <FaPlus />
          </button>
        </div>

        {/* ปุ่มกดเพิ่มลงตะกร้า หรือ อัปเดต (ใส่ onClick แล้ว 👈) */}
        <button className="add-to-cart-btn" onClick={editingItem ? handleUpdateCartClick : handleAddToCartClick} ref={cartTargetRef}>
          <FaShoppingCart />
          <span>{editingItem ? `อัปเดตตะกร้า • ฿${totalPrice}` : `เพิ่มลงตะกร้า • ฿${totalPrice}`}</span>
        </button>
      </div>

      {/* Fly-to-cart animation items */}
      {flyItems.map(fly => (
        <div
          key={fly.id}
          className="fly-to-cart-item"
          style={{
            '--fly-start-x': `${fly.startX}px`,
            '--fly-start-y': `${fly.startY}px`,
            '--fly-end-x': `${fly.endX}px`,
            '--fly-end-y': `${fly.endY}px`,
          }}
        >
          🔥
        </div>
      ))}

      {/* Topping Limit Modal */}
      {showToppingLimitModal && (
        <div className="pd-modal-overlay" onClick={() => setShowToppingLimitModal(false)}>
          <div className="pd-modal" onClick={e => e.stopPropagation()}>
            <div className="pd-modal-icon">
              <FaExclamationCircle />
            </div>
            <h2>เพิ่มท็อปปิ้งได้สูงสุด 3 หน่วย</h2>
            <p>ขออภัยครับ สามารถเพิ่มท็อปปิ้งแต่ละชนิดได้สูงสุด 3 หน่วยเท่านั้นครับ</p>
            <button className="pd-btn-ok" onClick={() => setShowToppingLimitModal(false)}>
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}