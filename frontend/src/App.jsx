import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import { apiFetch, API_BASE } from './utils/api';
import CustomerLayout from './layouts/CustomerLayout';
import Home from './pages/Customer/Home';
import ProductDetail from './pages/Customer/ProductDetail';
import Cart from './pages/Customer/Cart';
import Checkout from './pages/Customer/Checkout';
import OrderStatus from './pages/Customer/OrderStatus';
import CashierDashboard from './pages/Cashier/CashierDashboard';  // Now Admin-only dashboard
import CashierOrders from './pages/Cashier/CashierOrders';
import KitchenKDS from './pages/Kitchen/KitchenKDS';
import AdminDashboard from './pages/Admin/AdminDashboard';
import TableManager from './pages/Cashier/TableManager';
import InventoryManagement from './pages/Shared/InventoryManagement';
import MenuManagement from './pages/Shared/MenuManagement';
import ProtectedRoute from './components/ProtectedRoute';
import MyOrders from './pages/Customer/MyOrders';
import Login from './pages/Login/Login';
import ErrorBoundary from './components/ErrorBoundary';

// Customer App (with internal navigation)
function CustomerApp() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session');

  const [sessionValid, setSessionValid] = useState(null); // null = checking, true = valid, false = invalid
  const [sessionError, setSessionError] = useState('');
  const [tableNo, setTableNo] = useState('');

  useEffect(() => {
    // Only check session if we are strictly using the QR system.
    // If you want to force all customers to use QR, check it.
    if (!sessionId) {
      setSessionValid(false);
      setSessionError('ไม่พบรหัสโต๊ะ กรุณาสแกน QR Code ใหม่อีกครั้ง');
      return;
    }

    fetch(`${API_BASE}/api/qr/validate/${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setSessionValid(true);
          setTableNo(data.table_no);
        } else {
          setSessionValid(false);
          setSessionError(data.message || 'QR Code หมดอายุหรือไม่ถูกต้อง');
        }
      })
      .catch(err => {
        setSessionValid(false);
        setSessionError('ไม่สามารถตรวจสอบ QR Code ได้');
      });
  }, [sessionId]);

  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartNote, setCartNote] = useState('');
  const [needCutlery, setNeedCutlery] = useState(false);

  // State for order tracking after checkout
  const [lastOrderId, setLastOrderId] = useState(null);
  const [lastQueueNumber, setLastQueueNumber] = useState(null);

  // State for editing cart item
  const [editingCartItem, setEditingCartItem] = useState(null);

  // State for error modal
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setCurrentScreen('detail');
  };

  const handleAddToCart = (newItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => {
        if (item.productId !== newItem.productId) return false;
        
        // เช็คว่าหน้า/ไส้ (Topping) เหมือนกัน 100% หรือไม่ (เช็คทั้งชนิดและจำนวน)
        const currentToppings = item.toppings 
          ? item.toppings.map(t => `${t.topping_id || t.id}-${t.quantity}`).sort().join(',') 
          : '';
        const newToppings = newItem.toppings 
          ? newItem.toppings.map(t => `${t.topping_id || t.id}-${t.quantity}`).sort().join(',') 
          : '';
          
        return currentToppings === newToppings;
      });

      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        // สร้าง object ใหม่แทนการแก้ค่าเดิม (ป้องกันบั๊กบวกซ้ำ 2 รอบจาก React Strict Mode)
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + newItem.quantity
        };
        return updatedCart;
      }
      return [...prevCart, newItem];
    });

    // กลับไปหน้าหลักเพื่อให้เลือกซื้อเพิ่มเติมได้
    setCurrentScreen('home');
  };

  // Handler for editing a cart item
  const handleEditCartItem = (item) => {
    setEditingCartItem(item);
    setSelectedProductId(item.productId);
    setCurrentScreen('detail');
  };

  // Handler for updating an edited cart item
  const handleUpdateCartItem = (updatedItem) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartId === updatedItem.cartId ? updatedItem : item
      )
    );
    setEditingCartItem(null);
    setCurrentScreen('cart');
  };

  const renderPage = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onSelectProduct={handleSelectProduct} />;
      case 'detail':
        return (
          <ProductDetail
            productId={selectedProductId}
            onBack={() => {
              setEditingCartItem(null);
              setCurrentScreen(editingCartItem ? 'cart' : 'home');
            }}
            onAddToCart={handleAddToCart}
            editingItem={editingCartItem}
            onUpdateCartItem={handleUpdateCartItem}
          />
        );
      case 'cart':
        return (
          <Cart
            cartItems={cart}
            setCartItems={setCart}
            cartNote={cartNote}
            setCartNote={setCartNote}
            needCutlery={needCutlery}
            setNeedCutlery={setNeedCutlery}
            tableNo={tableNo}
            onBack={() => setCurrentScreen('home')}
            onGoToCheckout={() => setCurrentScreen('checkout')}
            onEditItem={handleEditCartItem}
          />
        );
      case 'checkout':
        return (
          <Checkout
            tableNo={tableNo}
            cartItems={cart}
            cartNote={needCutlery ? (cartNote ? `[รับช้อน/ส้อมพลาสติก] ${cartNote}` : '[รับช้อน/ส้อมพลาสติก]') : cartNote}
            onBack={() => setCurrentScreen('cart')}
            onCancelOrder={() => {
              setCart([]);
              setCartNote('');
              setNeedCutlery(false);
              setCurrentScreen('home');
            }}
            onConfirmOrder={async (orderData) => {
              try {
                const payload = {
                  pay_method: orderData.paymentMethod,
                  total_amount: orderData.grandTotal,
                  total_calories: orderData.totalCalories,
                  slip_picture: orderData.slipBase64 || null,
                  note: (needCutlery ? (cartNote ? `[รับช้อน/ส้อมพลาสติก] ${cartNote}` : '[รับช้อน/ส้อมพลาสติก]') : cartNote) || '',
                  session_id: sessionId,
                  order_type: orderData.orderType,
                  items: orderData.cartItems.map(item => ({
                    menu_id: item.productId,
                    quantity: item.quantity,
                    toppings: item.toppings.map(t => ({ topping_id: t.topping_id || t.id, quantity: t.quantity || 1 }))
                  }))
                };

                const res = await fetch(`${API_BASE}/api/orders`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                
                if (!res.ok) {
                  const errData = await res.json().catch(() => ({}));
                  throw new Error(errData.message || 'Order failed');
                }
                
                const result = await res.json();
                
                // Save to myOrders in localStorage
                const savedOrdersStr = localStorage.getItem('myOrders');
                let savedOrders = [];
                if (savedOrdersStr) savedOrders = JSON.parse(savedOrdersStr);
                if (!savedOrders.includes(result.order_id)) {
                  savedOrders.push(result.order_id);
                  localStorage.setItem('myOrders', JSON.stringify(savedOrders));
                }

                setLastOrderId(result.order_id);
                setLastQueueNumber(result.queue_number);
                setCart([]);
                setCartNote('');
                setCurrentScreen('orderStatus');
              } catch (err) {
                console.error(err);
                if (err.message.includes('QR Code นี้หมดอายุ') || err.message.includes('เซสชัน QR Code ไม่ถูกต้อง')) {
                  alert(err.message);
                  window.location.reload();
                } else {
                  setErrorModal({ isOpen: true, message: err.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ' });
                }
              }
            }}
          />
        );
      case 'orderStatus':
        return (
          <OrderStatus
            orderId={lastOrderId}
            queueNumber={lastQueueNumber}
            onBack={() => setCurrentScreen('home')}
          />
        );
      case 'myOrders':
        return <MyOrders onBack={() => setCurrentScreen('home')} onViewOrder={(id) => {
          setLastOrderId(id);
          setLastQueueNumber(null); // It will fetch dynamically
          setCurrentScreen('orderStatus');
        }} />;
      default:
        return <Home onSelectProduct={handleSelectProduct} />;
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (sessionValid === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa' }}>
        <h2>กำลังตรวจสอบ QR Code...</h2>
      </div>
    );
  }

  if (sessionValid === false) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa', padding: '20px', textAlign: 'center' }}>
        <FaTimesCircle style={{ fontSize: '64px', color: '#ef4444', marginBottom: '16px' }} />
        <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>ไม่สามารถสั่งอาหารได้</h2>
        <p style={{ color: '#4b5563', fontSize: '16px' }}>{sessionError}</p>
      </div>
    );
  }

  return (
    <CustomerLayout
      showBottomNav={currentScreen !== 'detail' && currentScreen !== 'checkout' && currentScreen !== 'orderStatus'}
      currentScreen={currentScreen}
      onNavigate={(screen) => setCurrentScreen(screen)}
      onViewOrder={(id) => {
        setLastOrderId(id);
        setLastQueueNumber(null);
        setCurrentScreen('orderStatus');
      }}
      cartCount={cartCount}
      page={renderPage()}
    >
      {errorModal.isOpen && (
        <div className="mm-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="mm-modal" style={{ background: 'white', maxWidth: '400px', width: '90%', textAlign: 'center', padding: '32px 24px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#ef4444', fontSize: '64px', marginBottom: '16px' }}>
              <FaTimesCircle />
            </div>
            <h2 style={{ margin: '0 0 12px 0', color: '#1f2937', fontSize: '24px' }}>ตรวจสอบไม่ผ่าน</h2>
            <p style={{ color: '#4b5563', marginBottom: '24px', lineHeight: '1.5', fontSize: '16px' }}>
              {errorModal.message}
            </p>
            <button 
              onClick={() => setErrorModal({ isOpen: false, message: '' })}
              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%', transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
              onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}

export default function App() {

  return (
    <ErrorBoundary>
      <Routes>
      <Route path="/" element={<CustomerApp />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes — Admin (R01) can access everything */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['R01']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['R01']}>
          <CashierDashboard />
        </ProtectedRoute>
      } />

      {/* Cashier Routes — Cashier (R02) can access orders & inventory only */}
      <Route path="/cashier/orders" element={
        <ProtectedRoute allowedRoles={['R01', 'R02']}>
          <CashierOrders />
        </ProtectedRoute>
      } />
      <Route path="/cashier/tables" element={
        <ProtectedRoute allowedRoles={['R01', 'R02']}>
          <TableManager />
        </ProtectedRoute>
      } />

      {/* Kitchen Routes */}
      <Route path="/kitchen" element={
        <ProtectedRoute allowedRoles={['R01', 'R03']}>
          <KitchenKDS />
        </ProtectedRoute>
      } />

      {/* Shared Routes */}
      <Route path="/inventory" element={
        <ProtectedRoute allowedRoles={['R01', 'R02']}>
          <InventoryManagement />
        </ProtectedRoute>
      } />
      <Route path="/menu-management" element={
        <ProtectedRoute allowedRoles={['R01', 'R02', 'R03']}>
          <MenuManagement />
        </ProtectedRoute>
      } />
    </Routes>
    </ErrorBoundary>
  );
}