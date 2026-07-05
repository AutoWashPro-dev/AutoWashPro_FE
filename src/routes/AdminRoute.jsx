// Placeholder AdminRoute.jsx matching Quoc3 architecture
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  // Mock role check (Admin portal)
  const role = localStorage.getItem('role') || 'ADMIN'; 
  return role === 'ADMIN' ? children : <Navigate to="/login" replace />;
};

export default AdminRoute;
