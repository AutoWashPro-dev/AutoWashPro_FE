import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import NavBrandLogo from '../../../components/NavBrandLogo';
import { 
  Droplets, 
  LayoutDashboard, 
  Calendar, 
  Wrench, 
  UsersRound, 
  Settings, 
  ShieldCheck,
  Plus, 
  LifeBuoy, 
  LogOut 
} from 'lucide-react';

const menuItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/bookings', label: 'Bookings & Slots', icon: Calendar },
  { to: '/admin/services-slots', label: 'Services & Slots', icon: Wrench },
  { to: '/admin/customers-loyalty', label: 'Customers & Promotion', icon: UsersRound },
  { to: '/admin/roles', label: 'Roles & RBAC', icon: ShieldCheck },

  { to: '/admin/settings', label: 'System Settings', icon: Settings },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  const [logoutModalPhase, setLogoutModalPhase] = useState(null); // null = closed, 'confirm' = step 1, 'success' = step 2

  const handleLogout = () => {
    setLogoutModalPhase('confirm');
  };

  const confirmLogout = () => {
    setLogoutModalPhase('success');
    setTimeout(() => {
      localStorage.removeItem('autowash_token');
      localStorage.removeItem('autowash_user');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_roles');
      localStorage.removeItem('accessToken');
      setLogoutModalPhase(null);
      navigate('/login', { replace: true });
    }, 1500);
  };

  const handleQuickBooking = () => {
    alert('Mở nhanh màn hình Đặt lịch (Bookings) để nhận xe...');
    navigate('/admin/bookings');
  };

  const getRoles = () => {
    try {
      const userRolesRaw = localStorage.getItem('user_roles');
      if (userRolesRaw) {
        const parsed = JSON.parse(userRolesRaw);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'string') return [parsed];
      }
    } catch (e) {}

    try {
      const autowashUserRaw = localStorage.getItem('autowash_user');
      if (autowashUserRaw) {
        const user = JSON.parse(autowashUserRaw);
        const roles = user.roles || user.user?.roles || user.user_roles;
        if (Array.isArray(roles)) return roles;
        if (typeof roles === 'string') return [roles];
      }
    } catch (e) {}

    return [];
  };

  const roles = getRoles();
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isManager = roles.includes('ROLE_MANAGER');
  
  const filteredMenuItems = [];
  if (isAdmin) {
    filteredMenuItems.push(
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/bookings', label: 'Bookings & Slots', icon: Calendar },
      { to: '/admin/services-slots', label: 'Services & Slots', icon: Wrench },
      { to: '/admin/customers-loyalty', label: 'Customers & Promotion', icon: UsersRound },
      { to: '/admin/roles', label: 'Roles & RBAC', icon: ShieldCheck },
      { to: '/admin/settings', label: 'System Settings', icon: Settings }
    );
  } else if (isManager) {
    filteredMenuItems.push(
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/bookings', label: 'Bookings & Slots', icon: Calendar },
      { to: '/admin/services-slots', label: 'Services & Slots', icon: Wrench },
      { to: '/admin/customers-loyalty', label: 'Customers', icon: UsersRound }
    );
  } else {
    // CASHIER or Fallback immediately to the strictest CASHIER configuration
    filteredMenuItems.push(
      { to: '/admin/bookings', label: 'Bookings & Slots', icon: Calendar }
    );
  }
  return (
    <>
      <aside className="w-[260px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full z-20 shadow-sm">
        {/* Logo Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2.5">
          <NavBrandLogo subtitle="Enterprise Admin" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          {filteredMenuItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#57f287] text-slate-800 shadow-sm shadow-[#57f287]/20 border border-[#44db72]'
                    : 'text-[#434654] border-transparent hover:bg-slate-55 hover:text-[#181c1e]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#181c1e] rounded-r-full" />
                  )}
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-slate-800' : 'text-slate-400'}`} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Action Footer */}
        <div className="px-4 py-5 border-t border-slate-100 flex flex-col gap-3">
          <button 
            onClick={() => alert('Mở cổng trợ giúp kỹ thuật...')}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#434654] hover:text-[#181c1e] transition-colors"
          >
            <LifeBuoy className="w-4 h-4 text-slate-400" />
            Trợ giúp
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Single Logout Modal */}
      {logoutModalPhase !== null && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center">
            {logoutModalPhase === 'confirm' ? (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-800 text-base">Xác nhận đăng xuất</h3>
                <p className="text-xs text-slate-500 font-semibold">Bạn có chắc chắn muốn đăng xuất không?</p>
                <div className="flex gap-3 justify-center pt-2">
                  <button 
                    onClick={() => setLogoutModalPhase(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={confirmLogout}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 text-green-700 p-6 rounded-xl flex flex-col items-center justify-center gap-3 font-bold text-sm">
                <span className="text-xl">✓</span>
                <span>Đăng xuất thành công</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
