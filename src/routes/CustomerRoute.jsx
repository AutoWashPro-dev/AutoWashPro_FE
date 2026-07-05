// Placeholder CustomerRoute.jsx matching Quoc3 architecture
import React from 'react';
import { Navigate } from 'react-router-dom';

const CustomerRoute = ({ children }) => {
  const role = localStorage.getItem('role') || 'CUSTOMER';
  return role === 'CUSTOMER' ? children : <Navigate to="/login" replace />;
};

export default CustomerRoute;
