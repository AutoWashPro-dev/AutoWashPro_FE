// Placeholder StaffRoute.jsx matching Quoc3 architecture
import React from 'react';
import { Navigate } from 'react-router-dom';

const StaffRoute = ({ children }) => {
  const role = localStorage.getItem('role') || 'STAFF';
  return role === 'STAFF' ? children : <Navigate to="/login" replace />;
};

export default StaffRoute;
