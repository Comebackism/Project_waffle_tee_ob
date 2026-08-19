import React, { useState } from 'react';
import { FaArrowLeft, FaMoneyBillWave, FaQrcode, FaUpload, FaCheckCircle, FaExclamationCircle, FaUtensils, FaShoppingBag } from 'react-icons/fa';
import './Checkout.css';

export default function Checkout({ tableNo, cartItems = [], cartNote = '', onBack, onConfirmOrder, onCancelOrder }) {
    // State เลือกวิธีชำระเงิน ('promptpay' หรือ 'cash')
    const [paymentMethod, setPaymentMethod] = useState('promptpay');
    
    // State เลือกประเภทออเดอร์
    const isTakeawayOnly = tableNo && tableNo.startsWith('หน้าร้าน');
    const [orderType, setOrderType] = useState(isTakeawayOnly ? 'takeaway' : 'dine_in');

    // State สำหรับอัปโหลดสลิป
    const [slipFile, setSlipFile] = useState(null);
    const [slipPreview, setSlipPreview] = useState(null);
    const [slipBase64, setSlipBase64] = useState(null);
    const [showAlertModal, setShowAlertModal] = useState(false);

    // คำนวณราคารวมสินค้า
    const calculateItemTotal = (item) => {
        const toppingsTotal = item.toppings
            ? item.toppings.reduce((sum, top) => sum + (Number(top.price || 0) * (top.quantity || 1)), 0)
            : 0;
        return (Number(item.basePrice || 0) + toppingsTotal) * item.quantity;
    };

    const subtotal = cartItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const vat = 0; // ไม่คิด VAT
    const grandTotal = subtotal;

    // คำนวณแคลอรีรวม
    const calculateItemCalories = (item) => {
        const toppingsCal = item.toppings
            ? item.toppings.reduce((sum, top) => sum + (Number(top.Calories || top.calories || 0) * (top.quantity || 1)), 0)
            : 0;
        return (Number(item.baseCalories || 0) + toppingsCal) * item.quantity;
    };
    const totalCalories = cartItems.reduce((sum, item) => sum + calculateItemCalories(item), 0);

    // จัดการการอัปโหลดรูปสลิป
    const handleSlipChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSlipFile(file);
            setSlipPreview(URL.createObjectURL(file));
            const reader = new FileReader();
            reader.onloadend = () => {
                setSlipBase64(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // กดยืนยันการชำระเงิน
    const handleConfirm = () => {
        if (paymentMethod === 'promptpay' && !slipFile) {
            setShowAlertModal(true);
            return;
        }

        if (onConfirmOrder) {
            onConfirmOrder({
                paymentMethod,
                subtotal,
                vat,
                grandTotal,
                slipFile,
                slipBase64,
                cartItems,
                totalCalories,
                orderType
            });
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-wrapper">

                {/* Header ย้อนกลับ */}
                <header className="checkout-header">
                    <button className="checkout-back-btn" onClick={onBack} aria-label="กลับ">
                        <FaArrowLeft />
                    </button>
                    <h1 className="checkout-title">สรุปรายการสั่งซื้อ</h1>
                </header>

                {/* รายการสินค้าสั่งซื้อ */}
                <div className="checkout-items-section">
                    {cartItems.map((item, index) => {
                        const baseTotal = Number(item.basePrice || 0) * item.quantity;
                        const toppingsTotal = item.toppings
                            ? item.toppings.reduce((sum, top) => sum + (Number(top.price || 0) * (top.quantity || 1)), 0)
                            : 0;

                        return (
                            <div key={item.cartId || index} className="checkout-item-card">
                                <div className="checkout-item-header">
                                    <div className="checkout-item-title-group">
                                        <span className="checkout-item-name">{item.name}</span>
                                        <span className="checkout-item-qty">x{item.quantity}</span>
                                    </div>
                                    <div className="checkout-item-price-group">
                                        <span className="checkout-price-main">
                                            ฿{baseTotal} <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal', marginLeft: '4px' }}>{Number(item.baseCalories || 0) * item.quantity} kcal</span>
                                        </span>
                                        {toppingsTotal > 0 && (
                                            <span className="checkout-price-sub">+ {toppingsTotal * item.quantity} บาท</span>
                                        )}
                                    </div>
                                </div>

                                {/* แสดงท็อปปิ้ง */}
                                {item.toppings && item.toppings.length > 0 && (
                                    <div className="checkout-item-toppings">
                                        {item.toppings.map((top, idx) => (
                                            <div key={idx} className="checkout-topping-line">
                                                • {top.name} {top.quantity > 1 ? `x${top.quantity}` : ''} {Number(top.price) > 0 ? `+ ${Number(top.price) * (top.quantity || 1)} บาท` : ''} <span style={{ color: '#9ca3af', fontSize: '12px', marginLeft: '4px' }}>({(top.Calories || top.calories || 0) * (top.quantity || 1)} kcal)</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* แสดงหมายเหตุ (ถ้ามี) */}
                {cartNote && (
                    <div className="checkout-note-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginTop: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <span style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>หมายเหตุ:</span>
                        <span style={{ fontSize: '14px', color: '#ef4444' }}>{cartNote}</span>
                    </div>
                )}

                {/* ตัวเลือกทานที่ร้าน / กลับบ้าน (ซ่อนถ้าเป็นคิวหน้าร้าน) */}
                {!isTakeawayOnly && (
                    <div className="checkout-order-type-section" style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginTop: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#374151' }}>รูปแบบการรับประทาน</h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <label 
                                style={{ 
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', 
                                    border: `2px solid ${orderType === 'dine_in' ? '#ef4444' : '#e5e7eb'}`, 
                                    borderRadius: '8px', 
                                    background: orderType === 'dine_in' ? '#fef2f2' : '#fff', 
                                    cursor: 'pointer', 
                                    transition: 'all 0.2s', 
                                    fontWeight: orderType === 'dine_in' ? 'bold' : 'normal', 
                                    color: orderType === 'dine_in' ? '#ef4444' : '#4b5563' 
                                }}
                            >
                                <input 
                                    type="radio" 
                                    name="orderType" 
                                    value="dine_in" 
                                    checked={orderType === 'dine_in'} 
                                    onChange={() => setOrderType('dine_in')} 
                                    style={{ display: 'none' }} 
                                />
                                <FaUtensils style={{ marginRight: '8px' }} /> ทานที่ร้าน
                            </label>
                            <label 
                                style={{ 
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', 
                                    border: `2px solid ${orderType === 'takeaway' ? '#ef4444' : '#e5e7eb'}`, 
                                    borderRadius: '8px', 
                                    background: orderType === 'takeaway' ? '#fef2f2' : '#fff', 
                                    cursor: 'pointer', 
                                    transition: 'all 0.2s', 
                                    fontWeight: orderType === 'takeaway' ? 'bold' : 'normal', 
                                    color: orderType === 'takeaway' ? '#ef4444' : '#4b5563' 
                                }}
                            >
                                <input 
                                    type="radio" 
                                    name="orderType" 
                                    value="takeaway" 
                                    checked={orderType === 'takeaway'} 
                                    onChange={() => setOrderType('takeaway')} 
                                    style={{ display: 'none' }} 
                                />
                                <FaShoppingBag style={{ marginRight: '8px' }} /> กลับบ้าน
                            </label>
                        </div>
                    </div>
                )}

                {/* การ์ดสรุปราคารวม & ภาษี */}
                <div className="checkout-summary-card">
                    <div className="summary-line">
                        <span>ยอดรวม</span>
                        <span className="summary-val">฿{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="summary-line" style={{ color: '#6b7280', marginTop: '4px' }}>
                        <span>ปริมาณแคลอรีรวม</span>
                        <span className="summary-val">{totalCalories} kcal</span>
                    </div>

                    <hr className="summary-hr" />

                    <div className="summary-line total-line">
                        <span className="summary-total-label">ยอดสุทธิ</span>
                        <span className="summary-total-price">฿{grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* ตัวเลือกวิธีการชำระเงิน */}
                <div className="payment-method-section">
                    <h2 className="section-title">วิธีการชำระเงิน</h2>
                    <div className="payment-options-grid">

                        {/* ชำระเงินสด */}
                        <div
                            className={`payment-option-card ${paymentMethod === 'cash' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('cash')}
                        >
                            <FaMoneyBillWave className="payment-icon" />
                            <span>เงินสด</span>
                        </div>

                        {/* ชำระด้วยพร้อมเพย์ */}
                        <div
                            className={`payment-option-card ${paymentMethod === 'promptpay' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('promptpay')}
                        >
                            <FaQrcode className="payment-icon" />
                            <span>โอนเงินผ่านธนาคาร /<br />พร้อมเพย์</span>
                        </div>
                    </div>
                </div>

                {/* กล่องแสดง QR Code พร้อมเพย์ */}
                {paymentMethod === 'promptpay' && (
                    <div className="qr-container-card">
                        <h3 className="qr-title">สแกนเพื่อชำระเงิน</h3>

                        {/* กรอบรูป QR Code สีเทาเข้ม */}
                        <div className="qr-image-wrapper">
                            <div className="qr-image-inner">
                                <img
                                    src={`https://promptpay.io/0828072613/${grandTotal}.png`}
                                    alt="PromptPay QR Code"
                                    className="qr-code-img"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            </div>
                        </div>

                        {/* รายละเอียดบัญชี */}
                        <div className="account-info">
                            <p className="account-name">ชื่อบัญชี: นาย วรวัฒน์ บุญเรือง</p>
                            <p className="account-pp">พร้อมเพย์ (เบอร์โทรศัพท์): 082-807-2613</p>
                        </div>

                        {/* ปุ่มอัปโหลดสลิป */}
                        <label className="upload-slip-label">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleSlipChange}
                                style={{ display: 'none' }}
                            />
                            <div className={`upload-slip-btn ${slipFile ? 'uploaded' : ''}`}>
                                {slipFile ? <FaCheckCircle /> : <FaUpload />}
                                <span>{slipFile ? 'เปลี่ยนสลิปการโอน' : 'อัปโหลดสลิปการโอน'}</span>
                            </div>
                        </label>

                        {/* พรีวิวสลิปเมื่อเลือกไฟล์ */}
                        {slipPreview && (
                            <div className="slip-preview-container">
                                <img src={slipPreview} alt="Slip Preview" className="slip-preview-img" />
                            </div>
                        )}

                        <p className="upload-note">กรุณาอัปโหลดสลิปเพื่อยืนยันคำสั่งซื้อของคุณ</p>
                    </div>
                )}

                {/* ปุ่มยืนยัน / ยกเลิก */}
                <div className="checkout-action-buttons">
                    <button className="confirm-order-btn" onClick={handleConfirm}>
                        ยืนยันการชำระเงิน
                    </button>

                    <button className="cancel-order-btn" onClick={onCancelOrder || onBack}>
                        ยกเลิกออเดอร์
                    </button>
                </div>

                {/* ข้อความท้ายหน้า */}
                <footer className="checkout-footer-brand">
                    ตี๋อบ วาฟเฟิล HongKong
                </footer>
            </div>

            {/* Alert Modal */}
            {showAlertModal && (
                <div className="os-modal-overlay" onClick={() => setShowAlertModal(false)}>
                    <div className="os-modal" onClick={e => e.stopPropagation()}>
                        <div className="os-modal-header danger">
                            <h2>
                                <FaExclamationCircle /> แจ้งเตือน
                            </h2>
                        </div>
                        <div className="os-modal-body">
                            <p>กรุณาอัปโหลดสลิปการโอนเงินเพื่อยืนยันคำสั่งซื้อ</p>
                        </div>
                        <div className="os-modal-footer">
                            <button 
                                className="os-btn-danger" 
                                onClick={() => setShowAlertModal(false)}
                            >
                                ตกลง
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}