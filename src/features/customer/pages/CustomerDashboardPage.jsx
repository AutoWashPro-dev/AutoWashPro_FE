import React, { useState } from 'react';
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
  Gift
} from 'lucide-react';
import VIPCard from '../components/VIPCard';
import TierProgressBar from '../components/TierProgressBar';
import QRModal from '../components/QRModal';
import { customerApi } from '../services/customerApi';

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const [isQrOpen, setIsQrOpen] = useState(false);

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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from backend API
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profile, bookings, vouchers] = await Promise.all([
          customerApi.getProfile(),
          customerApi.getMyBookings(),
          customerApi.getMyVouchers('ISSUED')
        ]);
        
        // Add minimal defaults if profile is missing some fields
        const customerData = {
          ...profile,
          tierSpending: profile.tierSpending || 0,
          lifetimeSpend: profile.lifetimeSpend || 0,
          loyaltyPoints: profile.loyaltyPoints || 0,
          tier: profile.tier || { tierId: 1, tierName: profile.tierName || 'MEMBER' }
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
              bookingCode: pending.id || pending.bookingCode,
              licensePlate: pending.vehicle?.plate || pending.vehicle?.licensePlate || 'Chưa có',
              model: pending.vehicle?.model || 'Xe máy',
              packageName: pending.service?.name || pending.serviceName || 'Rửa xe',
              slotDate: pending.slotDate || pending.date || 'Sắp tới',
              slotTime: pending.slotTime || pending.time || '',
              status: pending.status?.toUpperCase()
            });
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
                  bookingCode: p.id,
                  licensePlate: p.vehicle?.plate || 'Chưa có',
                  model: p.vehicle?.model || 'Xe máy',
                  packageName: p.service?.name || 'Rửa xe',
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

      } catch (err) {
        console.error("Lỗi đọc dữ liệu dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Gợi ý dịch vụ dọn xe máy thực tế tại Việt Nam
  const recommendedServices = [
    {
      id: 1,
      title: "Rửa xe bọt tuyết Siêu Sạch (Basic)",
      price: 50000,
      description: "Rửa sườn, xịt gầm, làm sạch bánh xe và thổi khô gas-đầy đủ.",
      tag: "PHỔ BIẾN"
    },
    {
      id: 2,
      title: "Phủ bóng Wax bóng bảo vệ sơn (Premium)",
      price: 90000,
      description: "Rửa xe cao cấp kết hợp phủ sáp siêu bóng bảo vệ dàn nhựa xe ga.",
      tag: "ƯU ĐÃI VIP"
    },
    {
      id: 3,
      title: "Dọn rửa Chi tiết Côn tay / PKL (Deluxe)",
      price: 150000,
      description: "Tẩy ố lazang, vệ sinh sên đĩa xích, dưỡng bóng dàn áo xe phân khối lớn.",
      tag: "CHUYÊN SÂU"
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      
      {/* KHU VỰC CHÀO MỪNG KHÁCH HÀNG */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Chào bạn, {isLoading || !customer ? 'N/A' : (customer.fullName || 'N/A')}!</h1>
          <p className="text-sm text-slate-500 mt-1">Hôm nay xế cưng của bạn đã sẵn sàng để dọn rửa chưa?</p>
        </div>
        <button 
          onClick={() => navigate('/customer/book')}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 hover:shadow-lg transition-all"
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
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tổng số lượt rửa xe tại trạm</span>
            <p className="text-2xl font-black text-slate-800 mt-2">{isLoading ? 'N/A' : (visitCount ?? 'N/A')} <span className="text-xs font-normal text-slate-500">lần dọn xe</span></p>
          </div>
        </div>

        {/* CỘT PHẢI (RỘNG 2/3) - LỊCH HẸN VÀ THÔNG TIN DỊCH VỤ */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* KHỐI LỊCH HẸN SẮP TỚI */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} className="text-blue-500" /> Lịch hẹn dọn xe sắp tới
              </h3>
              <button 
                onClick={() => navigate('/customer/book', { state: { openHistoryModal: true } })} 
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center"
              >
                Lịch sử <ChevronRight size={14} />
              </button>
            </div>

            {upcomingBooking ? (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      {upcomingBooking.bookingCode}
                    </span>
                    <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                      {upcomingBooking.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{upcomingBooking.packageName}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    🏍️ {upcomingBooking.model} ({upcomingBooking.licensePlate})
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {upcomingBooking.slotDate}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {upcomingBooking.slotTime} (GMT+7)</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> Trạm Trung Tâm</span>
                  </p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => setIsQrOpen(true)}
                    className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    Xem mã QR
                  </button>
                  <button 
                    onClick={() => alert("Yêu cầu hủy lịch đã gửi. Vui lòng chờ đối soát.")}
                    className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold"
                  >
                    Hủy lịch
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                Bạn chưa có lịch hẹn nào sắp tới.
              </div>
            )}
          </div>

          {/* VÍ VOUCHER THU NHỎ */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                <Gift size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Ví Voucher Đang Có</h4>
                <p className="text-xs text-slate-500 mt-0.5">Bạn đang sở hữu <strong>{isLoading ? 'N/A' : (vouchersCount ?? 'N/A')} Voucher</strong> khả dụng</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/customer/rewards')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            >
              Mở Ví Ưu Đãi
            </button>
          </div>

        </div>
      </div>

      {/* DỰNG LƯỚI GỢI Ý DỊCH VỤ XE MÁY DƯỚI CÙNG (DÀN NGANG) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" /> Dịch vụ khuyên dùng cho bạn
          </h3>
          <button 
            onClick={() => navigate('/customer/book')}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold"
          >
            Tất cả dịch vụ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedServices.map(service => (
            <div key={service.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {service.tag}
                  </span>
                  <span className="font-mono font-extrabold text-blue-600 text-base">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">{service.title}</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{service.description}</p>
              </div>
              <button 
                onClick={() => navigate('/customer/book', { state: { autoSelectServiceId: service.id || service.serviceId } })}
                className="mt-5 w-full py-2 bg-slate-50 hover:bg-blue-600 hover:text-white border border-slate-150 text-slate-600 rounded-lg text-xs font-bold transition-all"
              >
                Đặt dịch vụ này
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* POPUP MODAL PHÓNG TO QR CODE CHECK-IN */}
      <QRModal 
        isOpen={isQrOpen} 
        onClose={() => setIsQrOpen(false)} 
        title="Mã QR Check-in của bạn"
        qrValue="CUS-SARAH-GOLD-98"
        description="Đưa mã QR này cho thu ngân tại quầy quét để nhận diện hạng VIP và thực hiện dọn xe."
      />

    </div>
  );
}
