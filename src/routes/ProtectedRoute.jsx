import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserPermissions, hasPermission, getFirstAllowedAdminRoute } from '../utils/rbac';

export const ProtectedRoute = ({ children, requiredPermission }) => {
  const token = sessionStorage.getItem('autowash_token') || sessionStorage.getItem('token') || localStorage.getItem('autowash_token') || localStorage.getItem('token');
  const user = sessionStorage.getItem('autowash_user') || localStorage.getItem('autowash_user');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    const fallback = getFirstAllowedAdminRoute();
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
