import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Shield } from 'lucide-react';

export default function UserProfileDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setIsOpen(false);
    if (onLogout) onLogout();
  };

  const getRoles = () => {
    try {
      const userRolesRaw = localStorage.getItem('user_roles') || localStorage.getItem('role');
      if (userRolesRaw) {
        const parsed = JSON.parse(userRolesRaw);
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
      }
    } catch (e) {}
    return [];
  };

  const roles = getRoles();
  const showAdminSwitch = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MANAGER') || roles.includes('ROLE_STAFF');

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-full pr-3.5 cursor-pointer shadow-sm transition-all"
      >
        <img 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" 
          alt="Avatar" 
          className="w-7 h-7 rounded-full object-cover"
        />
        <span className="text-xs font-bold text-slate-700">{user?.fullName || 'User'}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#848a9c]" />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] py-1 text-slate-800 animate-in fade-in duration-200">
          {showAdminSwitch && (
            <button 
              onClick={() => { setIsOpen(false); navigate('/admin'); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors text-left border-b border-slate-100"
            >
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Trang Quản Trị</span>
            </button>
          )}
          <button 
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
}
