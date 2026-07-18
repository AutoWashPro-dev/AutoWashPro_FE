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
          customerApi.getProfile(),
          customerApi.getNotifications()
        ]);
        setCustomer(profileData);
        setNotifications(notifsData);
      } catch (err) {
        console.error("Failed to fetch layout data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Listen to local storage changes for cross-tab sync if needed
    const handleStorage = (e) => {
      if (e.key === 'autowash_cust_notifications') {
        const saved = localStorage.getItem('autowash_cust_notifications');
        if (saved) setNotifications(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await customerApi.markAllNotificationsRead();
      const updated = notifications.map(n => ({...n, read: true, isRead: true}));
      setNotifications(updated);
      localStorage.setItem('autowash_cust_notifications', JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Cấu hình màu sắc thẻ nhỏ theo hạng VIP trên sidebar
  const getBadgeClass = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM MEMBER': return 'bg-zinc-900 text-zinc-100 border-zinc-700';
      case 'GOLD MEMBER': return 'bg-amber-500 text-white border-amber-400';
      case 'SILVER MEMBER': return 'bg-slate-300 text-slate-800 border-slate-200';
      default: return 'bg-indigo-600 text-white border-indigo-400';
    }
  };

  const menuItems = [
    { to: '/customer/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { to: '/customer/book', label: 'Đặt lịch dọn xe', icon: Calendar },
    { to: '/customer/rewards', label: 'Ưu đãi & Đổi quà', icon: Gift },
    { to: '/customer/garage', label: 'Ga-ra xe máy', icon: Car },
    { to: '/customer/feedback', label: 'Gửi Phản hồi', icon: MessageSquare },
    { to: '/customer/account', label: 'Tài khoản & Cá nhân', icon: User },
  ];

  // Lấy tiêu đề trang hiện tại để hiển thị trên Header
  const getPageTitle = () => {
    const activeItem = menuItems.find(item => location.pathname.startsWith(item.to));
    return activeItem ? activeItem.label : '';
  };

  const unreadCount = notifications.filter(n => n.isRead === false || n.read === false).length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* ========================================================================================= */}
      {/* 💻 GIAO DIỆN DESKTOP: LEFT SIDEBAR (Hiển thị từ màn hình lg trở lên) */}
      {/* ========================================================================================= */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-white border-r border-slate-200 shrink-0 h-full">
        {/* Logo trạm */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-200">
            A
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">AutoWash Pro</h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Cổng Khách Hàng</span>
          </div>
        </div>

        {/* Khối Profile người dùng thu nhỏ */}
        <div className="p-4 mx-4 my-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shadow-sm">
            {isLoading || !customer ? 'N/A' : (customer.fullName ? customer.fullName.substring(0, 2).toUpperCase() : 'N/A')}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-800 text-sm truncate">
              {isLoading || !customer ? 'N/A' : (customer.fullName || 'N/A')}
            </h4>
            <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border mt-1 tracking-wider ${getBadgeClass(customer?.tierName)}`}>
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
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative ${
                  isActive
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
            <div className="hidden lg:flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-blue-100">
              <Gift size={14} />
              <span>{isLoading || !customer ? 'N/A' : (customer.loyaltyPoints ?? 'N/A')} Pts</span>
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
                        className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition-all ${
                          !isUnread ? 'bg-white border-slate-100 text-slate-500' : 'bg-blue-50/20 border-blue-100 text-slate-800 font-medium'
                        }`}
                      >
                        {notif.title && <p className="font-bold mb-0.5">{notif.title}</p>}
                        <p>{notif.content || notif.text}</p>
                        <span className="text-[9px] text-slate-400 mt-1 block font-semibold">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleString('vi-VN') : notif.time}
                        </span>
                      </div>
                    )})
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
          <NavLink to="/customer/dashboard" className={({isActive}) => `flex flex-col items-center gap-1 text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            <LayoutDashboard size={20} />
            <span>Trang chủ</span>
          </NavLink>
          <NavLink to="/customer/book" className={({isActive}) => `flex flex-col items-center gap-1 text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            <Calendar size={20} />
            <span>Đặt lịch</span>
          </NavLink>
          <NavLink to="/customer/rewards" className={({isActive}) => `flex flex-col items-center gap-1 text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            <Gift size={20} />
            <span>Ưu đãi</span>
          </NavLink>
          <NavLink to="/customer/feedback" className={({isActive}) => `flex flex-col items-center gap-1 text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            <MessageSquare size={20} />
            <span>Phản hồi</span>
          </NavLink>
          <NavLink to="/customer/account" className={({isActive}) => `flex flex-col items-center gap-1 text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            <User size={20} />
            <span>Tài khoản</span>
          </NavLink>
        </nav>
      </div>

    </div>
  );
}
