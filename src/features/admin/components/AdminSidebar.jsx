import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  
  let currentRoles = [];
  try {
    const storedRoles = localStorage.getItem('user_roles');
    if (storedRoles) {
      currentRoles = JSON.parse(storedRoles);
    }
  } catch (error) {
    console.error('Error parsing user_roles from localStorage:', error);
  }
  
  if (!Array.isArray(currentRoles)) {
    currentRoles = [];
  }

  const isAdmin = currentRoles.includes('ROLE_ADMIN');

  const filteredMenuItems = menuItems.filter(item => {
    if (isAdmin) return true;
    // Allow standard staff access only to Dashboard and Bookings & Slots
    return ['/admin/dashboard', '/admin/bookings'].includes(item.to);
  });

  const handleLogout = () => {
    alert('Đăng xuất hệ thống thành công.');
    navigate('/login', { replace: true });
  };

  const handleQuickBooking = () => {
    alert('Mở nhanh màn hình Đặt lịch (Bookings) để nhận xe...');
    navigate('/admin/bookings');
  };
  
  return (
    <aside className="w-[260px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full z-20 shadow-sm">
      {/* Logo Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-9 h-9 bg-[#0047AB] rounded-lg flex items-center justify-center shadow-md shadow-[#0047AB]/20">
          <Droplets className="text-white w-5.5 h-5.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[#181c1e] font-bold text-sm tracking-wide leading-tight">NovaWash</span>
          <span className="text-[#848a9c] text-[10px] font-bold tracking-wider uppercase mt-0.5">Enterprise Admin</span>
        </div>
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
                  : 'text-[#434654] border-transparent hover:bg-slate-50 hover:text-[#181c1e]'
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
  );
}
