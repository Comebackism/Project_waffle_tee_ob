import React, { useState } from 'react';
import { FaArrowLeft, FaTrashAlt, FaPlus, FaMinus, FaArrowRight } from 'react-icons/fa';
import './Cart.css';

export default function Cart({ cartItems = [], setCartItems, cartNote = '', setCartNote, onBack, onGoToCheckout }) {
    // เพิ่มจำนวนสินค้า
    const increaseQuantity = (cartId) => {
        setCartItems(cartItems.map(item =>
            item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item
        ));
    };

    // ลดจำนวนสินค้า
    const decreaseQuantity = (cartId) => {
        setCartItems(cartItems.map(item =>
            item.cartId === cartId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
        ));
    };

    // ลบสินค้าออกจากตะกร้า
    const removeItem = (cartId) => {
        setCartItems(cartItems.filter(item => item.cartId !== cartId));
    };

    // คำนวณราคาต่อ 1 ชิ้น (ราคาเมนูหลัก + ราคาท็อปปิ้งที่เลือก)
    const getItemUnitPrice = (item) => {
        const toppingsTotal = item.toppings
            ? item.toppings.reduce((sum, top) => sum + (Number(top.price || 0) * (top.quantity || 1)), 0)
            : 0;
        return Number(item.basePrice || 0) + toppingsTotal;
    };

    // คำนวณแคลอรีต่อ 1 ชิ้น (เมนูหลัก + ท็อปปิ้ง)
    const getItemUnitCalories = (item) => {
        const toppingsCal = item.toppings
            ? item.toppings.reduce((sum, top) => sum + (Number(top.Calories || top.calories || 0) * (top.quantity || 1)), 0)
            : 0;
        return Number(item.baseCalories || 0) + toppingsCal;
    };

    // คำนวณยอดรวมราคาทั้งหมด และ จำนวนชิ้นรวมทั้งหมด
    const totalAmount = cartItems.reduce((sum, item) => sum + (getItemUnitPrice(item) * item.quantity), 0);
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalCalories = cartItems.reduce((sum, item) => sum + (getItemUnitCalories(item) * item.quantity), 0);

    return (
        <div className="cart-page">
            <div className="cart-wrapper">

                {/* Header ย้อนกลับ */}
                <header className="cart-header">
                    <button className="cart-back-btn" onClick={onBack} aria-label="กลับ">
                        <FaArrowLeft />
                    </button>
                    <h1 className="cart-title">ตะกร้าสินค้า</h1>
                </header>

                {/* เนื้อหาหลัก */}
                <div className="cart-content">
                    {cartItems.length === 0 ? (
                        <div className="cart-empty">
                            <p>ไม่มีสินค้าในตะกร้า</p>
                            <button className="cart-empty-back-btn" onClick={onBack}>
                                ← กลับไปเลือกสินค้า
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* รายการสินค้าในตะกร้า */}
                            <div className="cart-items-list">
                                {cartItems.map((item) => (
                                    <div key={item.cartId} className="cart-item-card">
                                        {/* รูปภาพสินค้า */}
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="cart-item-img"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                                        />

                                        {/* รายละเอียดสินค้า */}
                                        <div className="cart-item-info">
                                            <div className="cart-item-top">
                                                <h3 className="cart-item-name">{item.name}</h3>
                                                <button
                                                    className="cart-delete-btn"
                                                    onClick={() => removeItem(item.cartId)}
                                                    title="ลบรายการนี้"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>

                                            {/* รายการท็อปปิ้ง */}
                                            {item.toppings && item.toppings.length > 0 && (
                                                <div className="cart-item-toppings">
                                                    {item.toppings.map((top, idx) => (
                                                        <span key={idx} className="topping-tag">
                                                            • {top.name} {top.quantity > 1 ? `x${top.quantity}` : ''} +{Number(top.price) * (top.quantity || 1)} บาท
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* ราคา และ ปุ่มเพิ่ม/ลด จำนวน */}
                                            <div className="cart-item-bottom">
                                                <span className="cart-item-price">
                                                    ฿{getItemUnitPrice(item) * item.quantity} <span style={{fontSize: '13px', color: '#6b7280', fontWeight: 'normal', marginLeft: '6px'}}>{getItemUnitCalories(item) * item.quantity} kcal</span>
                                                </span>

                                                <div className="cart-qty-control">
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => decreaseQuantity(item.cartId)}
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <span className="qty-num">{item.quantity}</span>
                                                    <button
                                                        className="qty-btn plus"
                                                        onClick={() => increaseQuantity(item.cartId)}
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* หมายเหตุถึงร้านค้า */}
                            <div className="cart-note-section">
                                <label className="cart-note-label">หมายเหตุถึงร้านค้า (ถ้ามี)</label>
                                <textarea
                                    className="cart-note-input"
                                    rows="2"
                                    placeholder="เช่น ขอช้อนส้อม, แยกน้ำหวาน"
                                    value={cartNote}
                                    onChange={(e) => setCartNote(e.target.value)}
                                />
                            </div>

                            {/* การ์ดสรุปราคาสินค้า */}
                            <div className="cart-summary-card">
                                <div className="summary-row">
                                    <span>ยอดรวมสินค้า ({totalQuantity} ชิ้น)</span>
                                    <span>฿{totalAmount}</span>
                                </div>
                                <div className="summary-row" style={{ color: '#6b7280', marginTop: '8px' }}>
                                    <span>ปริมาณแคลอรีรวม</span>
                                    <span>{totalCalories} kcal</span>
                                </div>

                                <hr className="summary-divider" />

                                <div className="summary-total-row">
                                    <span className="summary-total-label">ยอดสุทธิ</span>
                                    <span className="summary-total-price">฿{totalAmount}</span>
                                </div>

                                <button className="cart-checkout-btn" onClick={onGoToCheckout}>
                                    <span>ไปที่หน้าชำระเงิน</span>
                                    <FaArrowRight />
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}