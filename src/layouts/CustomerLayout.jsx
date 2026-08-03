import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Gift,
  Car,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import { customerApi } from '../features/customer/services/customerApi';
import logoImg from '../assets/logo.png';

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [customer, setCustomer] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, notifsData] = await Promise.all([
          customerApi.getCustomerProfile(),
          customerApi.getNotifications()
        ]);
        setCustomer({
          ...profileData,
          fullName: profileData.fullName,
          loyaltyPoints: profileData.loyaltyPoints,
          tierName: profileData.tierName,
          tier: { tierName: profileData.tierName }
        });
        setNotifications(notifsData);
      } catch (err) {
        console.error("Failed to fetch layout data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const fetchFreshProfile = async () => {
      try {
        const profileData = await customerApi.getCustomerProfile();
        setCustomer({
          ...profileData,
          fullName: profileData.fullName,
          loyaltyPoints: profileData.loyaltyPoints,
          tierName: profileData.tierName,
          tier: { tierName: profileData.tierName }
        });
      } catch (err) {
        console.error("Failed to fetch fresh profile in layout:", err);
      }
    };

    // Listen to local storage changes for cross-tab sync if needed
    const handleStorage = (e) => {
      if (e.key === 'autowash_cust_notifications') {
        const saved = localStorage.getItem('autowash_cust_notifications');
        if (saved) setNotifications(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('profileUpdated', fetchFreshProfile);
    window.addEventListener('focus', fetchFreshProfile);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('profileUpdated', fetchFreshProfile);
      window.removeEventListener('focus', fetchFreshProfile);
    };
  }, [location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await customerApi.markAllNotificationsRead();
      const updated = notifications.map(n => ({ ...n, read: true, isRead: true }));
      setNotifications(updated);
      localStorage.setItem('autowash_cust_notifications', JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

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

  // Cấu hình màu sắc & phong cách thẻ Profile thu nhỏ trên Sidebar theo từng hạng VIP
  const getTierTheme = (tier) => {
    const t = String(tier || '').toUpperCase();
    if (t.includes('PLATINUM')) {
      return {
        boxBg: 'bg-gradient-to-r from-slate-950 via-purple-950 to-zinc-950 text-purple-100 border-purple-500/40 shadow-md shadow-purple-950/30',
        avatarBg: 'bg-purple-900/80 text-purple-200 border border-purple-400/40 font-bold',
        nameColor: 'text-white',
        badgeClass: 'bg-gradient-to-r from-purple-300 via-purple-400 to-indigo-300 text-purple-950 font-black border border-purple-200 shadow-sm'
      };
    }
    if (t.includes('GOLD')) {
      return {
        boxBg: 'bg-gradient-to-r from-[#3D2702] via-[#66460B] to-[#4A3205] text-amber-100 border-amber-400/40 shadow-md shadow-amber-950/20',
        avatarBg: 'bg-gradient-to-r from-[#FFF0B3] via-[#E2B755] to-[#B38728] text-slate-950 font-black border border-[#FFF8D6]',
        nameColor: 'text-amber-100',
        badgeClass: 'bg-gradient-to-r from-[#FFF0B3] via-[#E2B755] to-[#B38728] text-slate-950 font-black border border-[#FFF8D6] shadow-sm'
      };
    }
    if (t.includes('SILVER')) {
      return {
        boxBg: 'bg-gradient-to-r from-slate-100 via-zinc-150 to-slate-200 border-slate-300 text-slate-900 shadow-sm',
        avatarBg: 'bg-slate-300 text-slate-900 border border-slate-400/40 font-bold',
        nameColor: 'text-slate-900',
        badgeClass: 'bg-gradient-to-r from-slate-200 via-slate-300 to-zinc-400 text-slate-950 font-black border border-white shadow-sm'
      };
    }
    // MEMBER
    return {
      boxBg: 'bg-gradient-to-r from-blue-50 via-indigo-50/80 to-blue-50 border-blue-200 text-blue-950 shadow-sm',
      avatarBg: 'bg-blue-600 text-white font-bold',
      nameColor: 'text-slate-900',
      badgeClass: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-extrabold border border-blue-300/40 shadow-sm'
    };
  };

  const menuItems = [
    { to: '/customer/dashboard', label: 'Trang chủ', icon: LayoutDashboard },
    { to: '/customer/book', label: 'Đặt lịch dọn xe', icon: Calendar },
    { to: '/customer/rewards', label: 'Ưu đãi & Đổi quà', icon: Gift },
    { to: '/customer/garage', label: 'Ga-ra xe máy', icon: Car },
    { to: '/customer/feedback', label: 'Gửi Phản hồi', icon: MessageSquare },
    { to: '/customer/account', label: 'Tài khoản & Cá nhân', icon: User },
  ];

  const currentTierTheme = getTierTheme(customer?.tierName);

  const unreadCount = notifications.filter(n => n.isRead === false || n.read === false).length;

  // Lấy tiêu đề trang hiện tại để hiển thị trên Header
  const getPageTitle = () => {
    const activeItem = menuItems.find(item => location.pathname.startsWith(item.to));
    return activeItem ? activeItem.label : '';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

      {/* ========================================================================================= */}
      {/* 💻 GIAO DIỆN DESKTOP: LEFT SIDEBAR (Hiển thị từ màn hình lg trở lên) */}
      {/* ========================================================================================= */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-white border-r border-slate-200 shrink-0 h-full">
        {/* Logo trạm */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <img src={logoImg} alt="NovaWash Logo" className="w-9 h-9 rounded-xl object-contain shadow-md shadow-blue-200" />
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">NovaWash</h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Cổng Khách Hàng</span>
          </div>
        </div>

        {/* Khối Profile người dùng thu nhỏ */}
        <div className={`p-4 mx-4 my-4 border rounded-2xl flex items-center gap-3 relative overflow-hidden transition-all ${currentTierTheme.boxBg}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-sm shrink-0 ${currentTierTheme.avatarBg}`}>
            {isLoading || !customer ? 'N/A' : (customer.fullName ? customer.fullName.substring(0, 2).toUpperCase() : 'N/A')}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4 className={`font-bold text-sm truncate ${currentTierTheme.nameColor}`}>
              {isLoading || !customer ? 'N/A' : (customer.fullName || 'N/A')}
            </h4>
            <span className={`inline-block text-[9px] px-2.5 py-0.5 rounded-full border mt-1 tracking-wider ${currentTierTheme.badgeClass}`}>
              {isLoading || !customer ? 'N/A' : (customer.tierName || 'N/A')}
            </span>
          </div>
        </div>

        {/* Danh sách các link điều hướng chính */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {menuItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-600 rounded-r-full" />
                  )}
                  <Icon size={18} className="shrink-0" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Chân Sidebar (Đăng xuất) */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold w-full transition-colors"
          >
            <LogOut size={18} />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================================= */}
      {/* 🖥️ VÙNG HIỂN THỊ NỘI DUNG CHÍNH (MAIN WRAPPER) */}
      {/* ========================================================================================= */}
      <div className="flex flex-col flex-1 min-w-0 h-full relative">
        {/* Header trên cùng (Desktop hiển thị tiêu đề và thông báo bell) */}
        <header className="bg-white border-b border-slate-200 h-16 shrink-0 px-6 flex items-center justify-between sticky top-0 z-40">
          <h2 className="font-bold text-slate-800 text-lg">{getPageTitle()}</h2>
          <div className="flex items-center gap-4 relative">
            {/* Điểm thưởng hiển thị nhanh trên Header máy tính */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700">
              <Gift size={14} className="text-blue-500 animate-pulse" />
              <span className="text-base font-black text-white font-mono">
                {(customer?.loyaltyPoints ?? 0).toLocaleString('vi-VN')}{' '}
                <span className="text-xs font-bold text-slate-400">Pts</span>
              </span>
            </div>

            {/* Chuông thông báo */}
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* PANEL THÔNG BÁO THẢ XUỐNG (NOTIFICATION DROPDOWN) */}
            {isNotifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-[100] p-4 animate-fade-in text-left">
                <div className="flex justify-between items-center border-b pb-2 mb-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Thông báo của bạn</h4>
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-blue-600 font-bold hover:underline"
                  >
                    Đọc tất cả
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-slate-400 text-xs text-center py-4">Không có thông báo gì mới.</div>
                  ) : (
                    notifications.map(notif => {
                      const isUnread = notif.isRead === false || notif.read === false;
                      return (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition-all ${!isUnread ? 'bg-white border-slate-100 text-slate-500' : 'bg-blue-50/20 border-blue-100 text-slate-800 font-medium'
                            }`}
                        >
                          {notif.title && <p className="font-bold mb-0.5">{notif.title}</p>}
                          <p>{notif.content || notif.text}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block font-semibold">
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleString('vi-VN') : notif.time}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Khung nội dung thay đổi động (Scrollable View) */}
        <main className="flex-grow overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </main>

        {/* ========================================================================================= */}
        {/* 📱 GIAO DIỆN MOBILE: BOTTOM NAVIGATION BAR (Hiển thị dưới màn hình lg) */}
        {/* ========================================================================================= */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-50 shadow-lg">
          <NavLink to="/customer/dashboard" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            <LayoutDashboard size={20} />
            <span>Trang chủ</span>
          </NavLink>
          <NavLink to="/customer/book" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            <Calendar size={20} />
            <span>Đặt lịch</span>
          </NavLink>
          <NavLink to="/customer/rewards" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            <Gift size={20} />
            <span>Ưu đãi</span>
          </NavLink>
          <NavLink to="/customer/feedback" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            <MessageSquare size={20} />
            <span>Phản hồi</span>
          </NavLink>
          <NavLink to="/customer/account" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            <User size={20} />
            <span>Tài khoản</span>
          </NavLink>
        </nav>
      </div>

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
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer"
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
    </div>
  );
}
