import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userStr = localStorage.getItem('currentUser');
  
  if (!userStr) {
    return <Navigate to="/" replace />;
  }

  const currentUser = JSON.parse(userStr);

  if (allowedRoles && !allowedRoles.includes(currentUser.Role_id)) {
    // If they try to access a page they don't have permission for,
    // redirect them to their home dashboard.
    if (currentUser.Role_id === 'R01') return <Navigate to="/admin" replace />;
    if (currentUser.Role_id === 'R02') return <Navigate to="/cashier/orders" replace />;
    if (currentUser.Role_id === 'R03') return <Navigate to="/kitchen" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
