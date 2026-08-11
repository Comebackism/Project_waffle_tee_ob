import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import InventoryManagement from './pages/Shared/InventoryManagement';
import ProtectedRoute from './components/ProtectedRoute';
import MyOrders from './pages/Customer/MyOrders';

// Customer App (with internal navigation)
function CustomerApp() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartNote, setCartNote] = useState('');

  // State for order tracking after checkout
  const [lastOrderId, setLastOrderId] = useState(null);
  const [lastQueueNumber, setLastQueueNumber] = useState(null);

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setCurrentScreen('detail');
  };

  const handleAddToCart = (newItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => {
        if (item.productId !== newItem.productId) return false;
        const currentToppings = item.toppings ? item.toppings.map(t => t.topping_id || t.id).sort().join(',') : '';
        const newToppings = newItem.toppings ? newItem.toppings.map(t => t.topping_id || t.id).sort().join(',') : '';
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

  const renderPage = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onSelectProduct={handleSelectProduct} />;
      case 'detail':
        return (
          <ProductDetail
            productId={selectedProductId}
            onBack={() => setCurrentScreen('home')}
            onAddToCart={handleAddToCart}
          />
        );
      case 'cart':
        return (
          <Cart
            cartItems={cart}
            setCartItems={setCart}
            cartNote={cartNote}
            setCartNote={setCartNote}
            onBack={() => setCurrentScreen('home')}
            onGoToCheckout={() => setCurrentScreen('checkout')}
          />
        );
      case 'checkout':
        return (
          <Checkout
            cartItems={cart}
            cartNote={cartNote}
            onBack={() => setCurrentScreen('cart')}
            onCancelOrder={() => {
              setCart([]);
              setCartNote('');
              setCurrentScreen('home');
            }}
            onConfirmOrder={async (orderData) => {
              try {
                const payload = {
                  pay_method: orderData.paymentMethod,
                  total_amount: orderData.grandTotal,
                  total_calories: orderData.totalCalories,
                  slip_picture: orderData.slipBase64 || null,
                  note: cartNote || '',
                  items: orderData.cartItems.map(item => ({
                    menu_id: item.productId,
                    quantity: item.quantity,
                    toppings: item.toppings.map(t => ({ topping_id: t.topping_id || t.id, quantity: t.quantity || 1 }))
                  }))
                };

                const res = await fetch('http://localhost:5000/api/orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                
                if (!res.ok) throw new Error('Order failed');
                
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
                alert('เกิดข้อผิดพลาดในการสั่งซื้อ');
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
    />
  );
}

export default function App() {
  const userRole = localStorage.getItem('userRole'); // Assume role is stored here

  return (
    <Routes>
      <Route path="/" element={<CustomerApp />} />

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
    </Routes>
  );
}