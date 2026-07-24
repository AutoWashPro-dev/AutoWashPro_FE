import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, CheckCircle, PlusCircle, AlertTriangle } from 'lucide-react';
import { notificationApi } from '../services/notificationApi';
import UserProfileDropdown from '../../../components/UserProfileDropdown';

export default function AdminHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const isBookingsPage = location.pathname.includes('/bookings');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('autowash_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user || parsed);
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('autowash_token');
    localStorage.removeItem('autowash_user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_roles');
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  // Nạp dữ liệu thông báo từ API thực (chuyển tiếp sang localStorage fallback nếu offline)
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await notificationApi.getStaffNotifications(20);
        setAdminNotifications(data);
        localStorage.setItem('autowash_admin_notifications', JSON.stringify(data));
      } catch (err) {
        console.error('Failed to load admin notifications:', err);
      }
    };

    loadNotifications();

    // Đăng ký sự kiện storage và làm mới tự động mỗi 10 giây để nhận thông báo thời gian thực / E2E
    const interval = setInterval(loadNotifications, 10000);
    const handleStorage = (e) => {
      if (e.key === 'autowash_admin_notifications') {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [location.pathname]);

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead();
    const updated = adminNotifications.map(n => ({ ...n, read: true, isRead: true }));
    setAdminNotifications(updated);
    localStorage.setItem('autowash_admin_notifications', JSON.stringify(updated));
    setShowNotifications(false);
  };

  const unreadAdminCount = adminNotifications.filter(notif => !notif.isRead).length;

  // Chọn icon dựa theo loại thông báo
  const getIcon = (type) => {
    switch (type) {
      case 'CHECKIN':
      case 'COMPLETED':
      case 'BOOKING_CONFIRMED':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
          </div>
        );
      case 'BOOKING':
      case 'NEW':
      case 'NEW_BOOKING':
      case 'SYSTEM_ALERT':
        return (
          <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
            <PlusCircle className="w-4.5 h-4.5 text-cyan-600" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
          </div>
        );
    }
  };

  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between gap-4 z-40 relative shadow-sm">
      {/* Search Input */}
      {!isBookingsPage ? (
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#848a9c]" />
            <input
              type="text"
              placeholder="Tìm biển số, khách hàng..."
              className="w-full pl-10 pr-4 py-2 bg-[#f7fafd] border border-slate-200/80 rounded-lg text-sm text-[#181c1e] placeholder:text-[#848a9c] focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] shadow-sm transition-all"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-all relative shadow-sm"
          >
            <Bell className="w-5 h-5" />
            {unreadAdminCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                {unreadAdminCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 rounded-2xl border border-slate-200 bg-white shadow-xl p-4 z-50 text-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <Bell className="w-4 h-4 text-cyan-600" />
                  Thông báo vận hành
                </h3>
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs text-cyan-600 hover:underline font-semibold"
                >
                  Đọc tất cả
                </button>
              </div>
              
              <div className="mt-3 space-y-3 max-h-80 overflow-y-auto no-scrollbar">
                {adminNotifications.map(notif => (
                  <div 
                    key={notif.notificationId || notif.id} 
                    className={`flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 text-left ${
                      !notif.isRead ? 'bg-blue-50/10 font-medium' : ''
                    }`}
                  >
                    {getIcon(notif.type)}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.content || notif.desc}</p>
                      <span className="text-[9px] text-slate-404 mt-1 block font-semibold">{notif.createdAtFormatted || notif.time}</span>
                    </div>
                  </div>
                ))}
                {adminNotifications.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">Không có thông báo mới</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar dropdown */}
        <UserProfileDropdown user={user} onLogout={handleLogout} />
      </div>
    </header>
  );
}
