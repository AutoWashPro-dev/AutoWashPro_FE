import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, CheckCircle, PlusCircle, AlertTriangle } from 'lucide-react';

export default function AdminHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const isBookingsPage = location.pathname.includes('/bookings');

  // Nạp dữ liệu thông báo admin từ localStorage khi chuyển trang hoặc khi tab khác cập nhật (E2E)
  useEffect(() => {
    const defaultNotifs = [
      { id: 1, type: "CHECKIN", title: "Khách check-in thành công", desc: "Xe 29A-999.99 vừa check-in lúc 15:15.", time: "10 phút trước", read: false },
      { id: 2, type: "BOOKING", title: "Lịch đặt mới từ App", desc: "Khách Nguyễn Văn A vừa đặt lịch lúc 15:30.", time: "20 phút trước", read: false },
      { id: 3, type: "FEEDBACK", title: "Phản hồi tiêu cực", desc: "Khách hàng phản hồi 1 sao lúc 15:10.", time: "Hôm qua", read: true }
    ];

    const loadNotifications = () => {
      const saved = localStorage.getItem('autowash_admin_notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        localStorage.setItem('autowash_admin_notifications', JSON.stringify(defaultNotifs));
        setNotifications(defaultNotifs);
      }
    };

    loadNotifications();

    // Đăng ký sự kiện storage để đồng bộ tức thì giữa 2 tab trình duyệt (Admin & Customer)
    const handleStorage = (e) => {
      if (e.key === 'autowash_admin_notifications') {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [location.pathname]);

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('autowash_admin_notifications', JSON.stringify(updated));
    setShowNotifications(false);
  };

  const hasUnread = notifications.some(n => !n.read);

  // Chọn icon dựa theo loại thông báo
  const getIcon = (type) => {
    switch (type) {
      case 'CHECKIN':
      case 'COMPLETED':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
          </div>
        );
      case 'BOOKING':
      case 'NEW':
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
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
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
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 text-left ${
                      !notif.read ? 'bg-blue-50/10 font-medium' : ''
                    }`}
                  >
                    {getIcon(notif.type)}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.desc}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block font-semibold">{notif.time}</span>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">Không có thông báo mới</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar dropdown */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-full pr-3.5 cursor-pointer shadow-sm transition-colors">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" 
            alt="Avatar" 
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-xs font-bold text-slate-700">Admin User</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
