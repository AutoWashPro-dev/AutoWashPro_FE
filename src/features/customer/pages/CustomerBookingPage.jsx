import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  Plus, 
  CheckCircle,
  FileText,
  AlertCircle,
  HelpCircle,
  History,
  Trash2,
  X
} from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import { customerApi } from '../services/customerApi';
import axios from 'axios';

export default function CustomerBookingPage() {
  const navigate = useNavigate();
  const [bookingTab, setBookingTab] = useState('new'); // 'new' hoặc 'history'

  // Mẫu dữ liệu xe máy của khách hàng
  const [vehicles, setVehicles] = useState([]);

  // Gói dịch vụ cốt lõi (Core Packages) và giá cơ bản (Base Price)
  const [corePackages, setCorePackages] = useState([
    { id: 1, name: "Gói Rửa Basic", basePrice: 50000, duration: "15 phút", description: "Rửa vỏ ngoài, rửa xích, xịt gầm nhẹ, thổi khô và lau sạch gương kính." },
    { id: 2, name: "Gói Rửa Premium", basePrice: 90000, duration: "30 phút", description: "Rửa Basic kết hợp tẩy ố dàn nhựa, dưỡng đen lốp và phủ sáp bóng nhẹ bảo vệ dàn áo." },
    { id: 3, name: "Gói Rửa Deluxe", basePrice: 150000, duration: "45 phút", description: "Vệ sinh chuyên sâu xích đĩa, phủ ceramic bóng kính cao cấp, dọn khoang máy bụi đất lâu ngày." }
  ]);

  // Tiện ích cộng thêm (Add-ons)
  const [addonServices, setAddonServices] = useState([
    { id: 10, name: "Hút bụi & Dọn cốp xe", price: 30000, description: "Hút sạch bụi cát và lau hóa chất bảo vệ nhựa lòng cốp xe." },
    { id: 11, name: "Dưỡng lốp bóng loáng", price: 20000, description: "Xịt dung dịch làm đen và dưỡng cao su lốp chống nứt nẻ." },
    { id: 12, name: "Vệ sinh sên (xích) chuyên dụng", price: 40000, description: "Tẩy nhớt bám sên cũ bằng chai xịt Motul và tra mỡ dưỡng sên mới." }
  ]);

  // Khung giờ gốc mẫu để so khớp
  const defaultTimeSlots = [
    { time: "08:00", available: true },
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    { time: "11:00", available: true },
    { time: "12:00", available: true },
    { time: "13:00", available: true },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true }
  ];

  // Các State quản lý lựa chọn của Khách hàng
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState(null);

  const [timeSlots, setTimeSlots] = useState([]);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleLicensePlate, setVehicleLicensePlate] = useState('');
  const [vehicleIsDefault, setVehicleIsDefault] = useState(false);

  // Khởi tạo DB autowash_slots mẫu nếu chưa có
  const initializeSlotsDb = () => {
    if (!localStorage.getItem('autowash_slots')) {
      const initialSlots = [
        { id: 'SL-01', time: '08:00 - 09:00', maxCapacity: 8, isActive: true },
        { id: 'SL-02', time: '09:00 - 10:00', maxCapacity: 8, isActive: true },
        { id: 'SL-03', time: '10:00 - 11:00', maxCapacity: 8, isActive: true },
        { id: 'SL-04', time: '11:00 - 12:00', maxCapacity: 8, isActive: true },
        { id: 'SL-05', time: '12:00 - 13:00', maxCapacity: 6, isActive: true },
        { id: 'SL-06', time: '13:00 - 14:00', maxCapacity: 8, isActive: true },
        { id: 'SL-07', time: '14:00 - 15:00', maxCapacity: 8, isActive: true },
        { id: 'SL-08', time: '15:00 - 16:00', maxCapacity: 8, isActive: true },
        { id: 'SL-09', time: '16:00 - 17:00', maxCapacity: 8, isActive: true }
      ];
      localStorage.setItem('autowash_slots', JSON.stringify(initialSlots));
    }
  };

  const [bookingWindowDays, setBookingWindowDays] = useState(7);
  const [customerProfile, setCustomerProfile] = useState(null);

  const loadUserProfile = async () => {
    try {
      const data = await customerApi.getProfile();
      setCustomerProfile(data);
      if (data && data.bookingWindowDays) {
        setBookingWindowDays(data.bookingWindowDays);
      }
      if (data && data.vehicles && data.vehicles.length > 0) {
        setVehicles(data.vehicles);
        const defaultVeh = data.vehicles.find(v => v.isDefault) || data.vehicles[0];
        setSelectedVehicle(defaultVeh);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const loadCustomerVouchers = async () => {
    try {
      const data = await customerApi.getMyVouchers('ISSUED');
      setMyVouchers(data || []);
    } catch (err) {
      console.error('Failed to load user vouchers:', err);
    }
  };

  const loadServices = async () => {
    try {
      const data = await customerApi.getActiveServices();
      if (data && data.length > 0) {
        const pkgs = data.filter(s => s.serviceType === 'PACKAGE').map(s => ({
          id: s.serviceId,
          name: s.serviceName,
          basePrice: Number(s.price),
          duration: `${s.durationMinutes} minutes`,
          description: s.description
        }));
        const addons = data.filter(s => s.serviceType === 'ADDON').map(s => ({
          id: s.serviceId,
          name: s.serviceName,
          price: Number(s.price),
          description: s.description
        }));
        if (pkgs.length > 0) setCorePackages(pkgs);
        if (addons.length > 0) setAddonServices(addons);
      }
    } catch (err) {
      console.error('Failed to load services from backend:', err);
    }
  };

  useEffect(() => {
    loadUserProfile();
    loadCustomerVouchers();
    loadServices();
  }, []);

  // Tính toán động trạng thái các khung giờ từ API Backend
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }
    const fetchSlots = async () => {
      try {
        const slots = await customerApi.getAvailableSlots(selectedDate);
        const mapped = slots.map(s => {
          const timeFormatted = s.startTime ? s.startTime.substring(0, 5) : "";
          return {
            slotId: s.slotId,
            time: timeFormatted,
            available: s.isAvailable,
            bookedCount: s.bookedCount ?? 0,
            maxCapacity: s.maxCapacity ?? 0,
            availableCapacity: s.availableCapacity ?? 0,
            reason: s.disabledReason === "FULL" ? "ĐẦY" : s.disabledReason === "PAST" ? "ĐÃ QUA" : s.disabledReason ? "T.DỪNG" : ""
          };
        });
        setTimeSlots(mapped);
      } catch (err) {
        console.error('Failed to load slots from API:', err);
        setTimeSlots([]);
      }
    };
    fetchSlots();
  }, [selectedDate, bookingTab]);

  // Hệ số ngày giới hạn được đặt trước theo hạng VIP
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDateStr = new Date(Date.now() + bookingWindowDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Load danh sách lịch sử đơn của khách từ Backend API
  const loadUserHistory = async () => {
    try {
      const data = await customerApi.getMyBookings();
      if (data && data.length > 0) {
        const list = data.map(b => {
          const serviceName = b.items && b.items.length > 0 
            ? b.items[0].serviceNameSnapshot + (b.items.length > 1 ? ` (+${b.items.length - 1} dịch vụ kèm)` : '')
            : 'Rửa xe máy';
          const timeFormatted = b.startTime ? b.startTime.substring(0, 5) : "08:00";
          return {
            id: b.bookingId,
            bookingCode: b.bookingCode,
            date: String(b.bookingDate),
            time: timeFormatted,
            packageName: serviceName,
            licensePlate: b.licensePlate,
            model: b.model || 'Xe máy',
            finalAmount: Number(b.finalAmount),
            status: b.status === 'PENDING' ? 'Pending' : b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'COMPLETED' ? 'Completed' : b.status === 'CANCELLED' ? 'Canceled' : b.status
          };
        });
        // Sắp xếp giảm dần theo ngày và giờ đặt
        const sorted = list.sort((a, b) => (b.date + ' ' + b.time).localeCompare(a.date + ' ' + a.time));
        setUserHistory(sorted);
      } else {
        setUserHistory([]);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
      setUserHistory([]);
    }
  };

  useEffect(() => {
    loadUserHistory();
  }, [bookingTab]);
  
  // Hủy lịch hẹn đặt trước trực tiếp từ bảng lịch sử
  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(`Bạn có chắc chắn muốn hủy lịch hẹn mã #${bookingId} không?`);
    if (!confirmCancel) return;

    try {
      await customerApi.cancelBooking(bookingId);
      alert("Hủy lịch hẹn thành công!");
      await loadUserHistory();
    } catch (error) {
      console.error("Lỗi hủy đặt lịch:", error);
      alert("Không thể hủy lịch hẹn: " + (error.response?.data?.message || error.message));
    }
  };

  // Tính toán giá gói dịch vụ (Đồng giá xe máy toàn hệ thống)
  const calculatePackagePrice = (basePrice) => {
    return basePrice;
  };

  // Xử lý bật/tắt tiện ích cộng thêm
  const handleToggleAddon = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  // Tính tổng tiền tạm tính
  const calculateTotalAmount = () => {
    let total = 0;
    if (selectedPackage) {
      total += calculatePackagePrice(selectedPackage.basePrice);
    }
    selectedAddons.forEach(addonId => {
      const addon = addonServices.find(a => a.id === addonId);
      if (addon) total += addon.price;
    });
    return total;
  };

  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;
    const total = calculateTotalAmount();
    
    if (selectedVoucher.discountType === 'FIXED_AMOUNT') {
      const val = Number(selectedVoucher.value);
      return val > total ? total : val;
    } else if (selectedVoucher.discountType === 'PERCENTAGE') {
      const pct = Number(selectedVoucher.value);
      return Math.round((total * pct) / 100);
    } else if (selectedVoucher.discountType === 'FREE_SERVICE') {
      return total;
    }
    return 0;
  };

  const resetVehicleForm = () => {
    setVehicleModel('');
    setVehicleLicensePlate('');
    setVehicleIsDefault(false);
    setEditingVehicle(null);
  };

  const closeVehicleModal = () => {
    setIsVehicleModalOpen(false);
    resetVehicleForm();
  };

  const openAddVehicleModal = () => {
    setIsVehicleModalOpen(true);
    resetVehicleForm();
  };

  const openEditVehicleModal = (vehicle) => {
    setIsVehicleModalOpen(true);
    setEditingVehicle(vehicle);
    setVehicleModel(vehicle.model || '');
    setVehicleLicensePlate(vehicle.licensePlate || '');
    setVehicleIsDefault(Boolean(vehicle.isDefault));
  };

  const handleVehicleLicensePlateChange = (e) => {
    setVehicleLicensePlate(e.target.value.toUpperCase());
  };

  const saveVehicleToBackend = async (payload) => {
    console.log('[CustomerBookingPage] save vehicle payload:', payload);

    if (payload.id && payload.id !== 'temp') {
      return payload;
    }

    try {
      const created = await customerApi.addVehicle(payload);
      return created;
    } catch (error) {
      console.warn('customerApi.addVehicle failed, using local fallback:', error);
      return payload;
    }
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();

    const trimmedModel = vehicleModel.trim();
    const trimmedPlate = vehicleLicensePlate.trim().toUpperCase();

    if (!trimmedModel) {
      alert('Vui lòng nhập tên/dòng xe máy.');
      return;
    }

    if (!trimmedPlate) {
      alert('Vui lòng nhập biển số xe.');
      return;
    }

    const payload = {
      id: editingVehicle?.id || `temp-${Date.now()}`,
      model: trimmedModel,
      licensePlate: trimmedPlate,
      isDefault: vehicleIsDefault,
      vehicleType: editingVehicle?.vehicleType || 'MOTORCYCLE'
    };

    try {
      const savedVehicle = await saveVehicleToBackend(payload);
      const normalizedVehicle = {
        ...savedVehicle,
        model: trimmedModel,
        licensePlate: trimmedPlate,
        isDefault: vehicleIsDefault,
        vehicleType: savedVehicle.vehicleType || payload.vehicleType
      };

      setVehicles(prev => {
        const next = prev.map(vehicle => ({
          ...vehicle,
          isDefault: vehicleIsDefault && editingVehicle?.id === vehicle.id ? true : false
        }));

        if (editingVehicle) {
          return next.map(vehicle => (vehicle.id === editingVehicle.id ? normalizedVehicle : vehicle));
        }

        return [...next, normalizedVehicle];
      });

      setSelectedVehicle(normalizedVehicle);
      closeVehicleModal();
      alert(editingVehicle ? 'Cập nhật xe thành công!' : 'Đăng ký xe mới thành công!');
      console.log('[CustomerBookingPage] vehicle saved:', normalizedVehicle);
    } catch (err) {
      console.error('Failed to save vehicle:', err);
      alert('Lỗi khi lưu xe: ' + (err.response?.data?.message || err.message));
    }
  };

  // Gửi đơn đặt lịch lên hệ thống
  const handleConfirmBooking = async () => {
    if (!selectedVehicle) {
      alert("Vui lòng chọn 1 chiếc xe máy để dọn rửa.");
      return;
    }
    if (!selectedPackage) {
      alert("Vui lòng chọn 1 gói dịch vụ dọn rửa chính.");
      return;
    }
    if (!selectedDate || !selectedTime) {
      alert("Vui lòng chọn ngày và giờ hẹn mong muốn.");
      return;
    }

    const trimmedLicensePlate = String(selectedVehicle.licensePlate || '').trim().toUpperCase();
    const trimmedModel = String(selectedVehicle.model || '').trim();

    if (!trimmedLicensePlate) {
      alert('Vui lòng chọn xe có biển số hợp lệ.');
      return;
    }
    if (!trimmedModel) {
      alert('Vui lòng chọn xe có model hợp lệ.');
      return;
    }

    const selectedPackageId = Number(selectedPackage?.id || selectedPackage?.serviceId || 0);
    if (!selectedPackageId) {
      alert('Không tìm thấy gói dịch vụ. Vui lòng chọn lại.');
      return;
    }
    const selectedSlot = timeSlots.find(s => s.slotId === selectedTimeSlotId || s.time === selectedTime);
if (selectedSlot && (selectedSlot.bookedCount >= selectedSlot.maxCapacity || selectedSlot.availableCapacity <= 0)) {
      alert("Khung giờ này hiện đã đầy công suất dọn rửa! Rất tiếc vì sự bất tiện này, mong quý khách vui lòng chọn một khung giờ khác.");
      return;
    }
    setIsSubmitting(true);

    const bookingData = {
      licensePlate: trimmedLicensePlate,
      model: trimmedModel,
      bookingDate: selectedDate,
      timeSlotId: Number(selectedTimeSlotId || 1),
      packageId: selectedPackageId,
      addonIds: selectedAddons || [],
      notes: selectedVoucher ? `Áp dụng voucher ${selectedVoucher.voucherCode}` : 'Đặt qua Mobile App',
      voucherCode: selectedVoucher?.voucherCode || ''
    };

    try {
      const token = localStorage.getItem('autowash_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post('/api/v1/customer/bookings', bookingData, { headers });
      const createdBooking = response.data;

      alert(`Đặt lịch thành công! Mã đơn của bạn là: ${createdBooking.bookingCode || createdBooking.id}. Hãy đến trạm đúng giờ hẹn.`);

      // Sync local history fallback
      setUserHistory(prev => [
        {
          id: createdBooking.bookingId || createdBooking.id,
          bookingCode: createdBooking.bookingCode || createdBooking.id,
          date: selectedDate,
          time: selectedTime,
          packageName: selectedPackage.name,
          licensePlate: trimmedLicensePlate,
          model: trimmedModel,
          finalAmount: createdBooking.finalAmount || (calculateTotalAmount() - calculateDiscount()),
          status: 'Pending'
        },
        ...prev
      ]);

      // Reset selection state
      setSelectedVoucher(null);
      setSelectedTime("");
      setSelectedTimeSlotId(null);

      setBookingTab('history');
      await loadUserHistory();
      await loadCustomerVouchers();
    } catch (err) {
      console.error('Failed to create booking:', err);
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Không thể lưu đặt lịch. Vui lòng thử lại.';
      alert('Đã xảy ra lỗi khi tạo đơn đặt lịch: ' + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format tiền tệ VNĐ
  const formatVnd = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      
      {/* THANH TAB CHỌN PHÂN HỆ ĐẶT LỊCH / LỊCH SỬ ĐƠN */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-2xl">
        <button
          onClick={() => setBookingTab('new')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
            bookingTab === 'new'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <CalendarIcon size={16} /> Đặt lịch rửa xe mới
        </button>
        <button
          onClick={() => setBookingTab('history')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${
            bookingTab === 'history'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <History size={16} /> Lịch sử đặt lịch ({userHistory.length})
        </button>
      </div>

      {bookingTab === 'new' ? (
        /* ========================================================================================= */
        /* TAB 1: GIAO DIỆN ĐẶT LỊCH MỚI (NEW BOOKING) */
        /* ========================================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* SECTION 1: CHỌN XE MÁY */}
            <section className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                  Chọn phương tiện dọn rửa
                </h3>
                <button 
                  onClick={openAddVehicleModal}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold"
                >
                  <Plus size={14} /> Đăng ký xe mới
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map(veh => (
                  <VehicleCard 
                    key={veh.vehicleId || veh.id}
                    vehicle={veh}
                    isDefault={selectedVehicle?.vehicleId === veh.vehicleId}
                    isSelectable={true}
                    onSelect={(v) => setSelectedVehicle(v)}
                    onEdit={() => openEditVehicleModal(veh)}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </section>

            {/* SECTION 2: CHỌN GÓI RỬA CHÍNH */}
            <section className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                Chọn gói dịch vụ chính
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {corePackages.map(pkg => {
                  const currentPrice = calculatePackagePrice(pkg.basePrice);
                  const isSelected = selectedPackage?.id === pkg.id;

                  return (
                    <div 
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`border rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between h-56 text-left relative ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/10 shadow-md ring-1 ring-blue-500' 
                          : 'border-slate-200 hover:border-blue-300 hover:shadow'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-blue-600">
                          <CheckCircle size={18} fill="currentColor" className="text-blue-600 fill-blue-100" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{pkg.name}</h4>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">
                          ⏰ {pkg.duration}
                        </span>
                        <p className="text-xs text-slate-500 mt-3 leading-relaxed line-clamp-3">{pkg.description}</p>
                      </div>
                      
                      <div className="mt-4">
                        <span className="font-mono text-base font-black text-blue-600">
                          {formatVnd(currentPrice)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 3: CHỌN TIỆN ÍCH CỘNG THÊM */}
            <section className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
                Tiện ích cộng thêm (Add-ons)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addonServices.map(addon => {
                  const isChecked = selectedAddons.includes(addon.id);

                  return (
                    <div 
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon.id)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all flex justify-between items-center ${
                        isChecked 
                          ? 'border-blue-500 bg-blue-50/15' 
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300 pointer-events-none"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">{addon.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{addon.description}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-700 shrink-0">
                        +{formatVnd(addon.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 4: CHỌN NGÀY & KHUNG GIỜ HẸN HẠN ĐỊNH THEO TIER */}
            <section className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">4</span>
                Chọn Ngày & Giờ rửa xe
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ngày hẹn dọn xe</label>
                  <input 
                    type="date"
                    min={todayStr}
                    max={maxDateStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-2 leading-relaxed">
                    * Hạng **PLATINUM MEMBER** của bạn được ưu tiên đặt trước tối đa **{bookingWindowDays} ngày** (Mức trần cao nhất hệ thống).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Khung giờ hoạt động</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(slot => (
                      <button
                          key={slot.time}
                          disabled={slot.bookedCount >= slot.maxCapacity || slot.availableCapacity <= 0}
                          onClick={() => { setSelectedTime(slot.time); setSelectedTimeSlotId(slot.slotId); }}
                          className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all flex flex-col items-center
                        justify-center min-h-[50px] ${
                            selectedTime === slot.time
                              ? 'bg-blue-600 text-white border-blue-600'
                              : (slot.bookedCount >= slot.maxCapacity || slot.availableCapacity <= 0)
                                ? 'bg-slate-100 text-slate-300 border-slate-150 cursor-not-allowed'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-500 hover:text-blue-600'
                          }`}
                        >
                          <span>{slot.time}</span>
                          {(slot.bookedCount >= slot.maxCapacity || slot.availableCapacity <= 0) && (
                                <span className="text-[8px] font-extrabold uppercase mt-0.5 text-red-500">
                                  ĐẦY
                                </span>
                              )}
                        </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm sticky top-20">
              <h3 className="font-bold text-slate-800 text-base border-b pb-4 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" /> Tóm tắt lịch hẹn dọn xe
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 font-medium">Xe dọn rửa:</span>
                  <span className="text-slate-800 font-bold text-right">
                    {selectedVehicle ? `${selectedVehicle.model} (${selectedVehicle.licensePlate})` : 'Chưa chọn'}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-slate-400 font-medium">Gói dọn rửa:</span>
                  <span className="text-slate-800 font-bold text-right">
                    {selectedPackage ? selectedPackage.name : 'Chưa chọn'}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-slate-400 font-medium">Tiện ích kèm:</span>
                  <span className="text-slate-800 font-bold text-right">
                    {selectedAddons.length > 0 
                      ? selectedAddons.map(id => addonServices.find(a => a.id === id)?.name).join(', ') 
                      : 'Không chọn'}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-slate-400 font-medium">Lịch hẹn dọn:</span>
                  <span className="text-slate-800 font-bold text-right">
                    {selectedDate && selectedTime ? `${selectedTime} ngày ${selectedDate}` : 'Chưa chọn'}
                  </span>
                </div>

                {/* Chọn Voucher từ Ví cá nhân */}
                <div className="border-t my-4 pt-4 space-y-2">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Ưu đãi của bạn:</span>
                  {myVouchers.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">Ví của bạn hiện chưa có voucher khả dụng.</p>
                  ) : (
                    <select
                      value={selectedVoucher ? selectedVoucher.voucherCode : ''}
                      onChange={(e) => {
                        const code = e.target.value;
                        const v = myVouchers.find(x => x.voucherCode === code);
                        setSelectedVoucher(v || null);
                      }}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 outline-none font-medium text-slate-700 bg-white"
                    >
                      <option value="">-- Áp dụng Voucher giảm giá --</option>
                      {myVouchers.map(v => {
                        const discountDesc = v.discountType === 'FREE_SERVICE' 
                          ? 'Miễn phí rửa xe' 
                          : v.discountType === 'PERCENTAGE' 
                            ? `Giảm ${v.value}%` 
                            : `Giảm ${Number(v.value).toLocaleString('vi-VN')} đ`;
                        return (
                          <option key={v.voucherCode} value={v.voucherCode}>
                            [{v.voucherCode}] {v.title || 'Voucher'} ({discountDesc})
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>

                <div className="border-t my-4"></div>

                <div className="space-y-2 pb-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Cộng tạm tính:</span>
                    <span className="font-mono text-slate-800 font-bold">
                      {formatVnd(calculateTotalAmount())}
                    </span>
                  </div>

                  {selectedVoucher && (
                    <div className="flex justify-between items-center text-xs text-emerald-600 font-bold">
                      <span>Voucher giảm giá ({selectedVoucher.voucherCode}):</span>
                      <span className="font-mono">
                        -{formatVnd(calculateDiscount())}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-dashed">
                    <span className="text-slate-800 font-black text-sm">Tổng hóa đơn tạm tính:</span>
                    <span className="font-mono text-lg font-black text-blue-600">
                      {formatVnd(Math.max(0, calculateTotalAmount() - calculateDiscount()))}
                    </span>
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:bg-blue-400"
                >
                  {isSubmitting ? 'Đang tạo đơn hẹn...' : 'Xác nhận Đặt lịch ngay'}
                </button>

                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-4 text-[10px] text-slate-500 leading-relaxed">
                  <AlertCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    Không cần thanh toán trước! Bạn chỉ cần đến trạm đúng giờ hẹn để check-in và thực hiện rửa xe, tích điểm VIP.
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* ========================================================================================= */
        /* TAB 2: LỊCH SỬ ĐẶT LỊCH DỌN XE CỦA KHÁCH HÀNG */
        /* ========================================================================================= */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm border-b pb-3 mb-4">Nhật ký lịch trình đặt hẹn rửa xe máy</h3>
          
          {userHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-655 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3 px-2">Mã Đơn hẹn</th>
                    <th className="py-3 px-2">Thời gian hẹn</th>
                    <th className="py-3 px-2">Phương tiện</th>
                    <th className="py-3 px-2">Dịch vụ dọn rửa</th>
                    <th className="py-3 px-2 text-right">Tổng tiền</th>
                    <th className="py-3 px-2 text-center">Trạng thái</th>
                    <th className="py-3 px-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {userHistory.map(b => (
                    <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-2 font-mono font-bold text-blue-600">{b.bookingCode}</td>
                      <td className="py-4 px-2 font-mono">
                        {b.date} <span className="text-slate-400 font-sans">vào</span> {b.time}
                      </td>
                      <td className="py-4 px-2 font-medium">{b.model} ({b.licensePlate})</td>
                      <td className="py-4 px-2">{b.packageName}</td>
                      <td className="py-4 px-2 text-right font-mono font-bold text-slate-800">{formatVnd(b.finalAmount)}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          b.status?.toLowerCase() === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-250'
                            : b.status?.toLowerCase() === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-250'
                              : 'bg-red-50 text-red-700 border border-red-250'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        {b.status?.toLowerCase() === 'pending' ? (
                          <button 
                            onClick={() => handleCancelBooking(b.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-all flex items-center gap-1 text-[10px] font-bold ml-auto"
                          >
                            <Trash2 size={12} /> Hủy lịch hẹn
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Chưa ghi nhận lịch hẹn nào trong lịch sử.
            </div>
          )}
        </div>
      )}

      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingVehicle ? 'Cập nhật thông tin xe máy' : 'Đăng ký xe máy mới'}
              </h3>
              <button
                onClick={closeVehicleModal}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Tên/Dòng xe máy
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Ví dụ: Honda SH 150i, Yamaha Exciter..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Biển số xe
                </label>
                <input
                  type="text"
                  value={vehicleLicensePlate}
                  onChange={handleVehicleLicensePlateChange}
                  placeholder="Ví dụ: 29-H1 888.88 hoặc 59-S3 123.45"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 font-mono text-sm tracking-wide outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="vehicleIsDefault"
                  checked={vehicleIsDefault}
                  onChange={(e) => setVehicleIsDefault(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="vehicleIsDefault" className="cursor-pointer text-xs font-semibold text-slate-600">
                  Đặt chiếc xe này làm mặc định để rửa
                </label>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-[10px] leading-relaxed text-slate-500">
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-blue-500" />
                <span>
                  * Dịch vụ dọn rửa xe được đồng giá cho mọi dòng xe số, xe ga và PKL. Biển số xe sẽ được ghi nhận vào phiếu check-in đối soát.
                </span>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={closeVehicleModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                >
                  {editingVehicle ? 'Lưu thay đổi' : 'Đăng ký ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
