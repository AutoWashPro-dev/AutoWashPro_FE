import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserPermissions, hasPermission as checkHasPermission } from '../utils/rbac';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loadUser = () => {
    try {
      const userStr = sessionStorage.getItem('autowash_user') || localStorage.getItem('autowash_user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        const permissions = getUserPermissions();
        setUser({ ...parsed, permissions });
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    const handleStorage = () => loadUser();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const hasPermission = (permissionCode) => {
    return checkHasPermission(permissionCode);
  };

  return (
    <AuthContext.Provider value={{ user, permissions: user?.permissions || [], hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    const permissions = getUserPermissions();
    return {
      user: null,
      permissions,
      hasPermission: (code) => checkHasPermission(code)
    };
  }
  return context;
};

export default AuthContext;
