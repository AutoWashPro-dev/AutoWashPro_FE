import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Award,
  Gift,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import VIPCard from '../components/VIPCard';
import TierProgressBar from '../components/TierProgressBar';
import { customerApi } from '../services/customerApi';

export default function CustomerDashboardPage() {
  const navigate = useNavigate();

  // Mẫu danh sách các hạng VIP lấy từ Database Config để tính tiến trình thăng hạng
  const tiers = [
    { tierId: 1, tierName: 'MEMBER', minSpend: 0 },
    { tierId: 2, tierName: 'SILVER', minSpend: 1000000 },
    { tierId: 3, tierName: 'GOLD', minSpend: 5000000 },
    { tierId: 4, tierName: 'PLATINUM', minSpend: 10000000 },
  ];

  const [customer, setCustomer] = useState(null);
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [visitCount, setVisitCount] = useState(0);
  const [vouchersCount, setVouchersCount] = useState(0);
  const [recommendedServices, setRecommendedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);

  // Custom Alerts and Confirms states
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'warning',
    title: 'Thông báo',
    message: ''
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: 'Xác nhận',
    message: '',
    onConfirm: null
  });

  const showAlert = (message, type = 'warning', title = 'Thông báo') => {
    setAlertModal({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const showConfirm = (message, onConfirm, title = 'Xác nhận') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
      }
    });
  };

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAlertModal(prev => ({ ...prev, isOpen: false }));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profile, bookings, vouchers, servicesData] = await Promise.all([
        customerApi.getCustomerProfile(),
        customerApi.getMyBookings(),
        customerApi.getMyVouchers(null, 'ISSUED'),
        customerApi.getActiveServices()
      ]);

      // Add minimal defaults if profile is missing some fields
      const customerData = {
        ...profile,
        fullName: profile.fullName || 'Nguyễn Minh Anh',
        loyaltyPoints: profile.loyaltyPoints || 0,
        tierName: profile.tierName || 'MEMBER',
        tierSpending: profile.tierSpending || 0,
        lifetimeSpend: profile.lifetimeSpend || 0,
        tier: { tierId: 1, tierName: profile.tierName || 'MEMBER' }
      };
      setCustomer(customerData);

      // Calculate visits and find upcoming booking
      if (Array.isArray(bookings)) {
        const completedBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'COMPLETED');
        setVisitCount(completedBookings.length);

        // Find first Pending/Confirmed booking for upcoming
        const pending = bookings.find(b => ['Pending', 'PENDING', 'Confirmed', 'CONFIRMED'].includes(b.status));
        if (pending) {
          setUpcomingBooking({
            bookingId: pending.bookingId || pending.id,
            bookingCode: pending.bookingCode || `NV-${pending.bookingId || pending.id}`,
            licensePlate: pending.vehicle?.plate || pending.vehicle?.licensePlate || pending.licensePlate || 'Chưa có',
            model: pending.vehicle?.model || pending.model || 'Xe máy',
            packageName: pending.service?.name || pending.serviceName || pending.packageName || 'Rửa xe',
            slotDate: pending.bookingDate || pending.slotDate || pending.date || 'Sắp tới',
            slotTime: pending.slotTime || pending.time || '',
            status: pending.status?.toUpperCase()
          });
        } else {
          setUpcomingBooking(null);
        }
      } else {
        // Flatten localStorage fallback for mock demo compatibility if no real array
        const dates = Object.keys(bookings).sort();
        let count = 0;
        let foundPending = null;

        for (const dateKey of dates) {
          const dayList = bookings[dateKey] || [];
          count += dayList.filter(b => b.status?.toLowerCase() === 'completed').length;

          if (!foundPending) {
            const p = dayList.find(b => b.status?.toLowerCase() === 'pending' || b.status?.toLowerCase() === 'confirmed');
            if (p) {
              foundPending = {
                bookingId: p.id,
                bookingCode: p.bookingCode || `NV-${p.id}`,
                licensePlate: p.vehicle?.plate || p.licensePlate || 'Chưa có',
                model: p.vehicle?.model || p.model || 'Xe máy',
                packageName: p.service?.name || p.packageName || 'Rửa xe',
                slotDate: dateKey,
                slotTime: p.slotTime,
                status: p.status?.toUpperCase()
              };
            }
          }
        }
        setVisitCount(count);
        setUpcomingBooking(foundPending);
      }

      if (Array.isArray(vouchers)) {
        setVouchersCount(vouchers.length);
      }

      if (Array.isArray(servicesData) && servicesData.length > 0) {
        const mainPackages = servicesData.filter(s => s.serviceType === 'PACKAGE');
        const sortedServices = [...mainPackages].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        setRecommendedServices(sortedServices.slice(0, 3).map(s => ({
          id: s.serviceId || s.id,
          title: s.serviceName || s.name,
          price: s.price || 0,
          description: s.description || 'Dịch vụ chăm sóc xe chuyên nghiệp.',
          tag: s.tagLabel || s.tag || 'PHỔ BIẾN'
        })));
      } else {
        setRecommendedServices([
          { id: 1, title: "Rửa xe bọt tuyết Siêu Sạch (Basic)", price: 50000, description: "Rửa sườn, xịt gầm, làm sạch bánh xe và thổi khô gas-đầy đủ.", tag: "PHỔ BIẾN" },
          { id: 2, title: "Phủ bóng Wax bóng bảo vệ sơn (Premium)", price: 90000, description: "Rửa xe cao cấp kết hợp phủ sáp siêu bóng bảo vệ dàn nhựa xe ga.", tag: "ƯU ĐÃI VIP" },
          { id: 3, title: "Dọn rửa Chi tiết Côn tay / PKL (Deluxe)", price: 150000, description: "Tẩy ố lazang, vệ sinh sên đĩa xích, dưỡng bóng dàn áo xe phân khối lớn.", tag: "CHUYÊN SÂU" }
        ]);
      }

    } catch (err) {
      console.error("Lỗi đọc dữ liệu dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    window.addEventListener('profileUpdated', fetchDashboardData);
    window.addEventListener('focus', fetchDashboardData);
    return () => {
      window.removeEventListener('profileUpdated', fetchDashboardData);
      window.removeEventListener('focus', fetchDashboardData);
    };
  }, []);

  const handleCancelBooking = (bookingId) => {
    showConfirm(
      `Bạn có chắc chắn muốn hủy lịch hẹn dọn rửa xe mã #${bookingId} không?`,
      async () => {
        setIsCanceling(true);
        try {
          await customerApi.cancelBooking(bookingId);
          showAlert("Hủy lịch hẹn thành công!", "success", "Thành công");
          await fetchDashboardData();
        } catch (error) {
          console.error("Lỗi hủy đặt lịch:", error);
          const errMsg = error.response?.data?.message || error.message || '';
          if (errMsg.includes("vượt quá số lần hủy") || errMsg.includes("Tối đa 3 lần") || errMsg.includes("3 lần/ngày")) {
            showAlert("Bạn đã hủy tối đa 3 đơn trong ngày hôm nay.", "error", "Giới hạn hủy đơn");
          } else {
            showAlert("Không thể hủy lịch hẹn: " + (errMsg || "Có lỗi xảy ra"), "error", "Lỗi");
          }
        } finally {
          setIsCanceling(false);
        }
      },
      "Xác nhận hủy lịch hẹn"
    );
  };

  return (
    <div className="space-y-8 pb-10 relative">

      {/* KHU VỰC CHÀO MỪNG KHÁCH HÀNG */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Chào bạn, {isLoading || !customer ? 'N/A' : (customer.fullName || 'N/A')}!</h1>
          <p className="text-sm text-slate-500 mt-1">Hôm nay xế cưng của bạn đã sẵn sàng để dọn rửa chưa?</p>
        </div>
        <button
          onClick={() => navigate('/customer/book')}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 hover:shadow-lg transition-all cursor-pointer"
        >
          <Calendar size={16} /> Đặt lịch rửa xe ngay
        </button>
      </div>

      {/* BỐ CỤC CHÍNH DÀN ĐỀU (GRID 3 CỘT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* CỘT TRÁI (RỘNG 1/3) - THÔNG TIN THẺ VIP & TIẾN TRÌNH */}
        <div className="space-y-6">
          {/* Thẻ VIP */}
          {isLoading || !customer ? (
            <div className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
          ) : (
            <VIPCard customer={customer} />
          )}

          {/* Thanh Tiến trình thăng hạng */}
          {isLoading || !customer ? (
            <div className="h-24 bg-slate-100 rounded-2xl animate-pulse mt-4"></div>
          ) : (
            <TierProgressBar customer={customer} tiers={tiers} />
          )}

          {/* Khối thống kê nhỏ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng số lượt rửa xe tại trạm</span>
            <p className="text-2xl font-black text-slate-800 mt-2">{isLoading ? 'N/A' : (visitCount ?? 'N/A')} <span className="text-xs font-normal text-slate-500">lần dọn xe</span></p>
          </div>
        </div>

        {/* CỘT PHẢI (RỘNG 2/3) - LỊCH HẸN VÀ THÔNG TIN DỊCH VỤ */}
        <div className="lg:col-span-2 space-y-6 text-left">

          {/* KHỐI LỊCH HẸN SẮP TỚI */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} className="text-blue-500" /> Lịch hẹn dọn xe sắp tới
              </h3>
              {upcomingBooking || visitCount > 0 ? (
                <button
                  onClick={() => navigate('/customer/book', { state: { tab: 'history' } })}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Lịch sử đặt lịch</span> <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/customer/book')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Đặt lịch ngay</span> <ChevronRight size={14} />
                </button>
              )}
            </div>

            {upcomingBooking ? (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      {upcomingBooking.status}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      Mã: {upcomingBooking.bookingCode}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{upcomingBooking.packageName}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    🏍️ {upcomingBooking.model} ({upcomingBooking.licensePlate})
                  </p>
                  <p className="text-xs text-slate-650 flex flex-wrap items-center gap-3 pt-1">
                    <span className="flex items-center gap-1 font-medium"><Calendar size={12} /> {upcomingBooking.slotDate}</span>
                    <span className="flex items-center gap-1 font-medium"><Clock size={12} /> {upcomingBooking.slotTime} (GMT+7)</span>
                    <span className="flex items-center gap-1 font-medium"><MapPin size={12} /> NovaWash</span>
                  </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto shrink-0 flex-col items-end">
                  <button
                    onClick={() => handleCancelBooking(upcomingBooking.bookingId)}
                    disabled={isCanceling}
                    className="w-full md:w-auto px-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    {isCanceling && <Loader2 size={12} className="animate-spin" />}
                    Hủy lịch hẹn
                  </button>
                  <span className="text-[10px] text-slate-400 font-medium text-right">
                    * Hủy trước giờ hẹn (Tối đa 3 lần/ngày)
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <Calendar size={20} />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-slate-700 text-xs">Bạn chưa có lịch hẹn dọn rửa nào sắp tới.</p>
                  <p className="text-[11px] text-slate-400 font-medium">Hãy đặt lịch dọn rửa xe ngay để chăm sóc xế cưng của bạn tại NovaWash!</p>
                </div>
                <button
                  onClick={() => navigate('/customer/book')}
                  className="mt-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/15 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar size={14} />
                  <span>Đặt lịch ngay</span>
                </button>
              </div>
            )}
          </div>

          {/* VÍ VOUCHER THU NHỎ */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 border border-amber-250 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
                <Gift size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800 text-sm">Ví Voucher Đang Có</h4>
                <p className="text-xs text-slate-500 mt-0.5">Bạn đang sở hữu <strong className="text-slate-700 font-extrabold">{isLoading ? 'N/A' : (vouchersCount ?? 'N/A')} Voucher</strong> khả dụng</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/customer/rewards')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Mở Ví Ưu Đãi
            </button>
          </div>

        </div>
      </div>

      {/* GỢI Ý DỊCH VỤ XE MÁY DƯỚI CÙNG */}
      <div className="space-y-4 text-left">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" /> Dịch vụ khuyên dùng cho bạn
          </h3>
          <button
            onClick={() => navigate('/customer/book')}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
          >
            Tất cả dịch vụ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedServices.map(service => (
            <div key={service.id} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {service.tag}
                  </span>
                  <span className="font-mono font-extrabold text-blue-600 text-base">
                    {Number(service.price || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">{service.title}</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{service.description}</p>
              </div>
              <button
                onClick={() => navigate('/customer/book', { state: { autoSelectServiceId: service.id || service.serviceId } })}
                className="mt-5 w-full py-2 bg-slate-50 hover:bg-blue-600 hover:text-white border border-slate-150 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Đặt dịch vụ này
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom UI Modal Alert / Notification Dialog */}
      {alertModal.isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setAlertModal(prev => ({ ...prev, isOpen: false })); }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            {alertModal.type === 'success' && (
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                <CheckCircle className="w-6 h-6" />
              </div>
            )}
            {alertModal.type === 'error' && (
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-4 animate-bounce">
                <AlertCircle className="w-6 h-6" />
              </div>
            )}
            {alertModal.type === 'warning' && (
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 animate-bounce">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}

            <h3 className="text-base font-extrabold text-slate-800 mb-1.5">{alertModal.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-5 px-1">{alertModal.message}</p>
            <button
              onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal Dialog */}
      {confirmModal.isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmModal(prev => ({ ...prev, isOpen: false })); }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-800 mb-1.5">{confirmModal.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-5 px-1">{confirmModal.message}</p>
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer animate-pulse"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

