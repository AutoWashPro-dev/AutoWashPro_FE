import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Wrench,
  Package,
  Plus,
  CheckCircle,
  FileText,
  AlertCircle,
  HelpCircle,
  History,
  Trash2,
  X,
  Car,
  Info,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Check
} from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import { customerApi } from '../services/customerApi';
import axios from 'axios';
import { formatLicensePlate, validateLicensePlate } from '../../../utils/validationUtils';
import { getTierTheme } from '../../../utils/tierTheme';

export default function CustomerBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingTab, setBookingTab] = useState(location.state?.tab || 'new'); // 'new' hoặc 'history'
  const [customer, setCustomer] = useState(null);
  const tierTheme = getTierTheme(customer?.tierName);

  useEffect(() => {
    customerApi.getProfile().then(data => setCustomer(data)).catch(() => { });
  }, []);

  useEffect(() => {
    if (location.state?.tab) {
      setBookingTab(location.state.tab);
    }
    if (location.state?.filter) {
      setHistoryStatusFilter(location.state.filter);
    }
  }, [location.state]);

  // Mẫu dữ liệu xe máy của khách hàng
  const [vehicles, setVehicles] = useState([]);

  // Gói dịch vụ cốt lõi (Core Packages) và giá cơ bản (Base Price)
  const [corePackages, setCorePackages] = useState([
    { id: 1, name: "Gói Rửa Xe Tiêu Chuẩn", basePrice: 30000, duration: "15 phút", description: "Quy trình rửa sạch nhanh toàn thân xe, thổi khô kiệt nước và lau bóng chuẩn tiệm" },
    { id: 2, name: "Gói Chăm Sóc Cao Cấp", basePrice: 60000, duration: "25 phút", description: "Rửa bọt tuyết kết hợp tẩy rửa dầu nhờn gầm máy, quét dưỡng đen lốp và tra mỡ xích" },
    { id: 3, name: "Gói Chăm Sóc Siêu Cấp & Bảo Dưỡng VIP", basePrice: 110000, duration: "40 phút", description: "Gói bảo dưỡng toàn diện từ chi tiết khoang máy đến dọn xích nhông đĩa, phục hồi nhựa nhám dàn áo và phủ bóng lốp" }
  ]);

  // Dịch vụ đơn lẻ (Single Services)
  const [singleServices, setSingleServices] = useState([
    { id: 10, serviceCode: 'SRV-FOAM-STD', name: "Rửa bọt tuyết tiêu chuẩn", price: 15000, description: "Làm sạch bụi bẩn toàn thân xe bằng bọt tuyết trung tính PH7 chuyên dụng" },
    { id: 11, serviceCode: 'SRV-DRY-AIR', name: "Xịt khô vòi khí nén", price: 10000, description: "Thổi sạch nước đọng lốc máy, công tắc và các khe kẽ bằng khí nén áp lực cao" },
    { id: 12, serviceCode: 'SRV-WIPE-SHINE', name: "Lau khô & lau bóng dàn áo", price: 10000, description: "Lau khô kiệt nước và lau bóng dàn áo bằng khăn microfiber mịn chống trầy sơn" },
    { id: 13, serviceCode: 'SRV-DEGREASE-ENG', name: "Tẩy nhờn lốc máy & gầm xe", price: 20000, description: "Tẩy sạch mảng bám dầu nhớt bẩn lâu ngày dưới gầm và lốc máy xe" },
    { id: 14, serviceCode: 'SRV-WASH-DETAIL', name: "Rửa chi tiết khoang máy & phuộc", price: 35000, description: "Vệ sinh cẩn thận từng ngóc ngách, con ốc, gắp sau và ti phuộc xe máy" }
  ]);

  // Tiện ích cộng thêm (Add-ons)
  const [addonServices, setAddonServices] = useState([
    { id: 20, serviceCode: 'ADD-TYRE-DRESS', name: "Quét mỡ dưỡng bóng đen lốp xe", price: 15000, description: "Bảo vệ cao su lốp chống nứt nẻ, tạo độ bóng đen tự nhiên như xe mới xuất xưởng" },
    { id: 21, serviceCode: 'ADD-CHAIN-CLEAN', name: "Tẩy rửa nhông sên dĩa (xích)", price: 25000, description: "Tẩy sạch cặn mỡ đen, rỉ sét bám trên xích sên bằng chai xịt dung dịch chuyên dụng" },
    { id: 22, serviceCode: 'ADD-CHAIN-LUBE', name: "Tra mỡ bôi trơn xích Motul VIP", price: 15000, description: "Tra dung dịch bôi trơn kết dính cao giúp xích êm ái, giảm ma sát và chống văng mỡ" },
    { id: 23, serviceCode: 'ADD-PLASTIC-RESTORE', name: "Phục hồi nhựa nhám dàn áo", price: 20000, description: "Dưỡng phục hồi các chi tiết nhựa nhám bị ố trắng, bạc màu do nắng mưa" },
    { id: 24, serviceCode: 'ADD-HELMET-SAN', name: "Vệ sinh sấy khử khuẩn mũ bảo hiểm", price: 15000, description: "Diệt khuẩn nấm mốc lót mũ bằng bọt nano và sấy khô bằng tia UV khử mùi" },
    { id: 25, serviceCode: 'ADD-WAX-PROTECT', name: "Phủ sáp bóng Gloss Shield bảo vệ sơn", price: 30000, description: "Tạo lớp phủ bóng kháng nước nhẹ, chống bám bụi và bảo vệ lớp sơn bóng/sơn mờ" }
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
  const [historyStatusFilter, setHistoryStatusFilter] = useState(location.state?.filter || 'ALL'); // 'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isVoucherDropdownOpen, setIsVoucherDropdownOpen] = useState(false);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState(null);
  const [slotRefreshTrigger, setSlotRefreshTrigger] = useState(0);
  const [deleteTargetVehicle, setDeleteTargetVehicle] = useState(null);
  const [isDayLocked, setIsDayLocked] = useState(false);
  const [closureReason, setClosureReason] = useState('');

  const isSlotInPast = (slotDateStr, slotTimeStr) => {
    if (!slotDateStr || !slotTimeStr) return false;
    const now = new Date();
    const [hours, minutes] = slotTimeStr.split(':').map(Number);
    const slotDateTime = new Date(slotDateStr);
    slotDateTime.setHours(hours, minutes, 0, 0);
    return slotDateTime < now;
  };

  const [timeSlots, setTimeSlots] = useState([]);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleLicensePlate, setVehicleLicensePlate] = useState('');
  const [vehicleIsDefault, setVehicleIsDefault] = useState(false);
  const [vehicleLicensePlateError, setVehicleLicensePlateError] = useState('');

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
  const [detailPackageModal, setDetailPackageModal] = useState(null);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'warning', // 'success' | 'error' | 'warning' | 'info'
    title: 'Thông báo',
    message: ''
  });

  const showAlert = (message, type = 'warning', title = 'Thông báo') => {
    setAlertModal({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: 'Xác nhận',
    message: '',
    onConfirm: null
  });

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

  const [isDefaultVehiclePromptOpen, setIsDefaultVehiclePromptOpen] = useState(false);
  const [pendingDefaultVehicle, setPendingDefaultVehicle] = useState(null);
  const [dontAskDefaultPrompt, setDontAskDefaultPrompt] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState('');
  const [bookingErrorMessage, setBookingErrorMessage] = useState('');

  // States for adding vehicle confirmation modal
  const [isVehicleConfirmModalOpen, setIsVehicleConfirmModalOpen] = useState(false);
  const [vehiclePayloadToConfirm, setVehiclePayloadToConfirm] = useState(null);
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);

  // Handle ESC key press to close active modals
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsVehicleModalOpen(false);
        setIsDefaultVehiclePromptOpen(false);
        setIsConfirmModalOpen(false);
        setIsSuccessModalOpen(false);
        setIsErrorModalOpen(false);
        setIsVehicleConfirmModalOpen(false);
        setAlertModal(prev => ({ ...prev, isOpen: false }));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedVehicleRef = React.useRef(selectedVehicle);
  React.useEffect(() => {
    selectedVehicleRef.current = selectedVehicle;
  }, [selectedVehicle]);

  const loadUserProfile = async () => {
    try {
      const [profileData, vehiclesData] = await Promise.all([
        customerApi.getCustomerProfile(),
        customerApi.getMyVehicles()
      ]);
      setCustomerProfile(profileData);
      if (profileData && profileData.bookingWindowDays) {
        setBookingWindowDays(profileData.bookingWindowDays);
      }
      if (Array.isArray(vehiclesData)) {
        const mappedVehicles = vehiclesData.map(v => ({
          ...v,
          vehicleId: v.vehicleId || v.id,
          model: v.model || 'Xe máy',
          licensePlate: v.licensePlate || v.plate || 'Chưa có biển số',
          vehicleType: v.vehicleType || v.type || 'N/A',
          isDefault: v.isDefault ?? false
        }));
        setVehicles(mappedVehicles);

        if (location.state?.selectedVehicle) {
          const targetVehId = location.state.selectedVehicle.vehicleId || location.state.selectedVehicle.id;
          const matchedVeh = mappedVehicles.find(v => (v.vehicleId || v.id) === targetVehId);
          if (matchedVeh) {
            setSelectedVehicle(matchedVeh);
          } else if (mappedVehicles.length > 0) {
            setSelectedVehicle(mappedVehicles[0]);
          }
        } else if (selectedVehicleRef.current) {
          const currentSel = selectedVehicleRef.current;
          const matched = mappedVehicles.find(v => (v.vehicleId || v.id) === (currentSel.vehicleId || currentSel.id));
          if (!matched) {
            const defaultVeh = mappedVehicles.find(v => v.isDefault) || mappedVehicles[0] || null;
            setSelectedVehicle(defaultVeh);
          } else {
            setSelectedVehicle(matched);
          }
        } else if (mappedVehicles.length > 0) {
          const defaultVeh = mappedVehicles.find(v => v.isDefault) || mappedVehicles[0];
          setSelectedVehicle(defaultVeh);
        }
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  React.useEffect(() => {
    window.addEventListener('vehicleListUpdated', loadUserProfile);
    window.addEventListener('autowash_tiers_updated', loadUserProfile);
    window.addEventListener('storage', loadUserProfile);
    return () => {
      window.removeEventListener('vehicleListUpdated', loadUserProfile);
      window.removeEventListener('autowash_tiers_updated', loadUserProfile);
      window.removeEventListener('storage', loadUserProfile);
    };
  }, []);

  const loadCustomerVouchers = async () => {
    try {
      const data = await customerApi.getMyVouchers(null, 'ISSUED');
      setAvailableVouchers(data || []);
    } catch (err) {
      console.error('Failed to load user vouchers:', err);
    }
  };

  const loadServices = async () => {
    try {
      const data = await customerApi.getActiveServices();
      if (data && data.length > 0) {
        const activeItems = data.filter(s => s.isActive !== false);

        const pkgs = activeItems.filter(s => s.serviceType === 'PACKAGE' || s.type === 'combo').map(s => ({
          id: s.serviceId || s.id,
          serviceCode: s.serviceCode || s.code || s.name,
          name: s.serviceName || s.name,
          basePrice: Number(s.price || 0),
          duration: `${s.durationMinutes || 15} phút`,
          description: s.description || s.desc,
          includedServices: s.includedServices || []
        })).sort((a, b) => a.basePrice - b.basePrice);

        const singles = activeItems.filter(s => s.serviceType === 'SINGLE_SERVICE' || s.type === 'single').map(s => ({
          id: s.serviceId || s.id,
          serviceCode: s.serviceCode,
          name: s.serviceName || s.name,
          price: Number(s.price || 0),
          description: s.description || s.desc,
          serviceType: 'SINGLE_SERVICE'
        })).sort((a, b) => a.price - b.price);

        const addons = activeItems.filter(s => s.serviceType === 'ADDON' || s.type === 'addons').map(s => ({
          id: s.serviceId || s.id,
          serviceCode: s.serviceCode,
          name: s.serviceName || s.name,
          price: Number(s.price || 0),
          description: s.description || s.desc,
          serviceType: 'ADDON'
        })).sort((a, b) => a.price - b.price);

        if (pkgs.length > 0) setCorePackages(pkgs);
        setSingleServices(singles);
        setAddonServices(addons);
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

  // Xử lý luồng đặt dịch vụ tự động chọn (từ trang Dashboard)
  useEffect(() => {
    const autoSelectServiceId = location.state?.autoSelectServiceId;
    if (autoSelectServiceId && corePackages.length > 0) {
      const pkgToSelect = corePackages.find(p => p.id === autoSelectServiceId);
      if (pkgToSelect) {
        setSelectedPackage(pkgToSelect);
        // Trì hoãn một chút để đảm bảo DOM đã render trạng thái selected
        setTimeout(() => {
          const el = document.getElementById(`package-${pkgToSelect.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      }
    }
  }, [location.state, corePackages]);

  // Xử lý tự động mở tab Lịch sử (theo yêu cầu openHistoryModal từ Dashboard)
  useEffect(() => {
    if (location.state?.openHistoryModal) {
      setBookingTab('history');
    }
  }, [location.state]);

  // Tính toán động trạng thái các khung giờ từ API Backend
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      setIsDayLocked(false);
      setClosureReason('');
      return;
    }
    const fetchSlots = async () => {
      try {
        const [slots, bookings] = await Promise.all([
          customerApi.getAvailableSlots(selectedDate),
          customerApi.getMyBookings()
        ]);

        // Detect garage closure from API response (isDayLocked + closureReason on each slot)
        const dayLocked = Array.isArray(slots) && slots.length > 0 && slots[0].isDayLocked === true;
        const dayClosureReason = dayLocked ? (slots[0].closureReason || 'Xưởng tạm đóng cửa') : '';
        setIsDayLocked(dayLocked);
        setClosureReason(dayClosureReason);

        // If day is locked, clear any previously selected time
        if (dayLocked) {
          setSelectedTime('');
          setSelectedTimeSlotId(null);
        }

        const activeBookings = (bookings || []).filter(b =>
          ['PENDING', 'CONFIRMED', 'PAID', 'IN_PROGRESS', 'CHECKED_IN', 'COMPLETED'].includes(b.status)
        );
        const mapped = slots.map(s => {
          const timeFormatted = s.startTime ? s.startTime.substring(0, 5) : "";
          const isPast = s.disabledReason === "PAST_TIME" || (s.startTime ? isSlotInPast(selectedDate, s.startTime) : false);
          const isOverlap = activeBookings.some(b =>
            String(b.bookingDate) === selectedDate &&
            (b.startTime?.substring(0, 5) === s.startTime?.substring(0, 5))
          );
          const isFull = (s.bookedCount >= s.maxCapacity && s.maxCapacity > 0) || (s.availableCapacity <= 0) || (s.isAvailable === false) || s.disabledReason === "FULL";
          const isSlotAvailable = dayLocked ? false : (!isPast && !isOverlap && !isFull);

          return {
            slotId: s.slotId,
            time: timeFormatted,
            available: isSlotAvailable,
            bookedCount: s.bookedCount ?? 0,
            maxCapacity: s.maxCapacity ?? 0,
            availableCapacity: dayLocked ? 0 : (s.availableCapacity ?? 0),
            isPast: isPast,
            isOverlap: isOverlap,
            isFull: isFull,
            isDayLocked: dayLocked,
            startTime: s.startTime,
            displayOrder: s.displayOrder ?? 0,
            reason: dayLocked ? 'ĐÓNG CỬA' : (isPast ? "ĐÃ QUA" : (isFull ? "ĐẦY" : s.disabledReason ? "T.DỪNG" : ""))
          };
        });

        // Explicit Ascending Sorting by displayOrder then startTime
        const sortedMapped = [...mapped].sort((a, b) => {
          const orderA = a.displayOrder ?? 0;
          const orderB = b.displayOrder ?? 0;
          if (orderA !== orderB) return orderA - orderB;
          const timeA = a.startTime || a.time || '';
          const timeB = b.startTime || b.time || '';
          return timeA.localeCompare(timeB);
        });

        setTimeSlots(sortedMapped);

        // Tự động bỏ chọn slot nếu slot hiện tại đã bị đầy/khóa/vô hiệu hóa
        setSelectedTime(prevTime => {
          if (!prevTime) return '';
          const foundSlot = sortedMapped.find(st => st.time === prevTime);
          if (!foundSlot || !foundSlot.available) {
            setSelectedTimeSlotId(null);
            return '';
          }
          return prevTime;
        });
      } catch (err) {
        console.error('Failed to load slots from API:', err);
        setTimeSlots([]);
        setIsDayLocked(false);
        setClosureReason('');
      }
    };
    fetchSlots();
  }, [selectedDate, bookingTab, slotRefreshTrigger]);

  // Tự động reset lựa chọn khung giờ nếu nó đã trôi qua (quá giờ)
  useEffect(() => {
    if (selectedTime || selectedTimeSlotId) {
      const match = timeSlots.find(s => s.slotId === selectedTimeSlotId || s.time === selectedTime);
      if (match && match.isPast) {
        setSelectedTime("");
        setSelectedTimeSlotId(null);
      }
    }
  }, [timeSlots, selectedDate, selectedTime, selectedTimeSlotId]);

  // Window Focus listener để refresh thời gian thực
  useEffect(() => {
    const handleFocus = () => {
      setSlotRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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
          const rawStatusStr = String(b.status || '').toUpperCase();
          const createdAtVal = b.createdAt || b.created_at || (b.bookingDate + 'T' + (b.startTime || '00:00:00'));
          return {
            id: b.bookingId,
            bookingCode: b.bookingCode,
            date: String(b.bookingDate),
            time: timeFormatted,
            packageName: serviceName,
            licensePlate: b.licensePlate,
            model: b.model || 'Xe máy',
            finalAmount: Number(b.finalAmount),
            status: b.status === 'PENDING' ? 'Pending' : b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'COMPLETED' ? 'Completed' : (b.status === 'CANCELLED' || b.status === 'CANCELED') ? 'Canceled' : b.status,
            rawStatus: rawStatusStr,
            createdAt: createdAtVal
          };
        });

        // Sắp xếp giảm dần theo thời gian tạo đơn (Chrono-Sorting: created_at DESC)
        const sorted = list.sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
            return timeB - timeA;
          }
          return (b.date + ' ' + b.time).localeCompare(a.date + ' ' + a.time);
        });
        setUserHistory(sorted);
      } else {
        setUserHistory([]);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
      setUserHistory([]);
    }
  };

  // Filter history bookings according to active status tab
  const filteredUserHistory = userHistory.filter((b) => {
    if (historyStatusFilter === 'ALL') return true;
    const raw = String(b.rawStatus || b.status || '').toUpperCase();
    if (historyStatusFilter === 'PENDING') {
      return raw === 'PENDING' || raw === 'CONFIRMED' || raw === 'WAITING_CONFIRMATION' || raw === 'IN_PROGRESS' || raw === 'CHECKED_IN';
    }
    if (historyStatusFilter === 'COMPLETED') {
      return raw === 'COMPLETED' || raw === 'FINISHED' || raw === 'PAID';
    }
    if (historyStatusFilter === 'CANCELLED') {
      return raw === 'CANCELLED' || raw === 'CANCELED' || raw === 'REJECTED' || raw.includes('CANCEL') || raw.includes('NO_SHOW');
    }
    return true;
  });

  useEffect(() => {
    loadUserHistory();
  }, [bookingTab]);

  // Hủy lịch hẹn đặt trước trực tiếp từ bảng lịch sử
  const handleCancelBooking = async (bookingId) => {
    showConfirm(
      `Bạn có chắc chắn muốn hủy lịch hẹn mã #${bookingId} không?`,
      async () => {
        try {
          await customerApi.cancelBooking(bookingId);
          showAlert("Hủy lịch hẹn thành công!", "success", "Thành công");
          await loadUserHistory();
          await loadUserProfile();
        } catch (error) {
          console.error("Lỗi hủy đặt lịch:", error);
          const errMsg = error.response?.data?.message || error.message || '';
          showAlert("Không thể hủy lịch hẹn: " + (errMsg || "Có lỗi xảy ra"), "error", "Lỗi");
        }
      },
      "Xác nhận hủy"
    );
  };

  // Tính toán giá gói dịch vụ (Đồng giá xe máy toàn hệ thống)
  const calculatePackagePrice = (basePrice) => {
    return basePrice;
  };

  // Lấy danh sách ID các dịch vụ đã bao gồm trong gói chính đang chọn
  const getIncludedAddonIds = (pkg) => {
    if (!pkg || !pkg.includedServices || pkg.includedServices.length === 0) return [];
    return pkg.includedServices.map(srv => srv.serviceId || srv.id).filter(Boolean);
  };

  // Xử lý bật/tắt tiện ích cộng thêm
  const handleToggleAddon = (addonId) => {
    // Không cho phép toggle add-on đã bao gồm trong gói chính
    const includedIds = getIncludedAddonIds(selectedPackage);
    if (includedIds.includes(addonId)) return;

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

  // Tính toán số tiền được giảm của 1 voucher đối với tổng tiền đơn hàng
  const computeVoucherDiscount = (voucher, totalAmount) => {
    if (!voucher) return 0;
    let discount = 0;
    const discType = voucher.discountType;

    if (discType === 'FIXED_AMOUNT' || discType === 'cash') {
      discount = Number(voucher.value) || 0;
    } else if (discType === 'PERCENTAGE' || discType === 'percent') {
      const pct = Number(voucher.value) || 0;
      discount = Math.round((totalAmount * pct) / 100);
    } else if (discType === 'FREE_SERVICE' || discType === 'free_wash') {
      discount = totalAmount;
    }

    if (voucher.maxDiscountAmount != null && Number(voucher.maxDiscountAmount) > 0) {
      const maxDisc = Number(voucher.maxDiscountAmount);
      if (discount > maxDisc) {
        discount = maxDisc;
      }
    }

    return discount > totalAmount ? totalAmount : discount;
  };

  // Kiểm tra tính khả dụng của 1 voucher đối với gói/đơn hàng đang chọn
  const checkVoucherApplicability = (voucher, currentPkg, totalAmount, dateStr) => {
    if (!voucher) return { isApplicable: false, reason: 'Voucher không tồn tại' };

    // 1. Kiểm tra khóa gói rửa (applicableServiceCode)
    if (voucher.applicableServiceCode && String(voucher.applicableServiceCode).trim() !== '') {
      const lockCode = String(voucher.applicableServiceCode).trim().toUpperCase();
      const pkgCode = currentPkg ? String(currentPkg.serviceCode || currentPkg.code || currentPkg.name || '').trim().toUpperCase() : '';
      const pkgId = currentPkg ? String(currentPkg.id) : '';

      const matchesCode = pkgCode.includes(lockCode) || lockCode.includes(pkgCode) || lockCode === pkgId;
      if (!currentPkg || !matchesCode) {
        return {
          isApplicable: false,
          reason: `Dành riêng cho gói "${voucher.applicableServiceCode}"`
        };
      }
    }

    // 2. Kiểm tra khóa thứ trong tuần (applicableDays)
    if (voucher.applicableDays && String(voucher.applicableDays).trim() !== '' && dateStr) {
      const daysStr = String(voucher.applicableDays).toUpperCase();
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const dayCode = dayNames[dateObj.getDay()];
        if (!daysStr.includes(dayCode)) {
          const dayMap = {
            'MON': 'Thứ Hai', 'TUE': 'Thứ Ba', 'WED': 'Thứ Tư', 'THU': 'Thứ Năm', 'FRI': 'Thứ Sáu', 'SAT': 'Thứ Bảy', 'SUN': 'Chủ Nhật',
            'T2': 'Thứ Hai', 'T3': 'Thứ Ba', 'T4': 'Thứ Tư', 'T5': 'Thứ Năm', 'T6': 'Thứ Sáu', 'T7': 'Thứ Bảy', 'CN': 'Chủ Nhật'
          };
          const formattedDays = String(voucher.applicableDays)
            .split(/[,;\s]+/)
            .map(d => dayMap[d.trim().toUpperCase()] || d.trim())
            .join(', ');
          return {
            isApplicable: false,
            reason: `Chỉ áp dụng cho các ngày: ${formattedDays}`
          };
        }
      }
    }

    // 3. Kiểm tra đơn hàng tối thiểu (minOrderValue)
    if (voucher.minOrderValue != null && Number(voucher.minOrderValue) > 0) {
      const isPointsExchange = Number(voucher.costPoints) > 0 || voucher.source === 'EXCHANGE';
      if (!isPointsExchange && totalAmount < Number(voucher.minOrderValue)) {
        return {
          isApplicable: false,
          reason: `Đơn tối thiểu ${Number(voucher.minOrderValue).toLocaleString('vi-VN')} đ`
        };
      }
    }

    return { isApplicable: true, reason: '' };
  };

  // Trả về danh sách voucher phân loại & sắp xếp theo mức giảm từ cao đến thấp
  const getEvaluatedVouchers = (overridePkg = null) => {
    if (!availableVouchers || availableVouchers.length === 0) {
      return { applicableVouchers: [], inapplicableVouchers: [], bestVoucher: null };
    }

    const pkgToUse = overridePkg !== null ? overridePkg : selectedPackage;
    let totalAmount = 0;
    if (pkgToUse) {
      totalAmount += calculatePackagePrice(pkgToUse.basePrice);
    }
    selectedAddons.forEach(addonId => {
      const addon = addonServices.find(a => a.id === addonId);
      if (addon) totalAmount += addon.price;
    });

    const evaluated = availableVouchers.map(v => {
      const { isApplicable, reason } = checkVoucherApplicability(v, pkgToUse, totalAmount, selectedDate);
      const computedDiscount = computeVoucherDiscount(v, totalAmount);
      return {
        ...v,
        isApplicable,
        inapplicableReason: reason,
        computedDiscount
      };
    });

    // Voucher khả dụng sắp xếp giảm từ CAO → THẤP
    const applicableVouchers = evaluated
      .filter(v => v.isApplicable)
      .sort((a, b) => b.computedDiscount - a.computedDiscount);

    // Voucher không khả dụng hạ xuống ĐÁY, vẫn sắp xếp giảm từ CAO → THẤP
    const inapplicableVouchers = evaluated
      .filter(v => !v.isApplicable)
      .sort((a, b) => b.computedDiscount - a.computedDiscount);

    const bestVoucher = applicableVouchers.length > 0 ? applicableVouchers[0] : null;

    return { applicableVouchers, inapplicableVouchers, bestVoucher };
  };

  // Handler khi click chọn gói rửa
  const handleSelectPackage = (pkg) => {
    if (selectedPackage && (selectedPackage.id === pkg.id || selectedPackage.serviceId === pkg.serviceId)) {
      setSelectedPackage(null);
      return;
    }
    setSelectedPackage(pkg);

    // Tự động bỏ chọn các add-on đã bao gồm trong gói chính mới
    const includedIds = getIncludedAddonIds(pkg);
    if (includedIds.length > 0) {
      setSelectedAddons(prev => prev.filter(id => !includedIds.includes(id)));
    }

    // Tự động tìm voucher khả dụng giảm nhiều nhất cho gói mới chọn
    const { applicableVouchers, bestVoucher } = getEvaluatedVouchers(pkg);

    if (bestVoucher) {
      setSelectedVoucher(bestVoucher);
    } else {
      setSelectedVoucher(null);
    }
  };

  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;
    const total = calculateTotalAmount();
    const { isApplicable } = checkVoucherApplicability(selectedVoucher, selectedPackage, total, selectedDate);
    if (!isApplicable) return 0;
    return computeVoucherDiscount(selectedVoucher, total);
  };

  const handleVehicleLicensePlateChange = (e) => {
    const formatted = formatLicensePlate(e.target.value);
    setVehicleLicensePlate(formatted);
    if (formatted && !validateLicensePlate(formatted)) {
      setVehicleLicensePlateError('Biển số xe không đúng định dạng (VD: 59-A1 123.45 hoặc 29H-666.66)');
    } else {
      setVehicleLicensePlateError('');
    }
  };

  const resetVehicleForm = () => {
    setVehicleModel('');
    setVehicleLicensePlate('');
    setVehicleIsDefault(false);
    setEditingVehicle(null);
    setVehicleLicensePlateError('');
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
    setVehicleLicensePlateError('');
  };

  const handleDeleteVehicle = (veh) => {
    if (veh.isDefault && vehicles.length > 1) {
      showAlert('Bạn không thể xóa xe mặc định. Vui lòng đặt xe khác làm mặc định trước.', 'error', 'Không thể xóa');
      return;
    }
    setDeleteTargetVehicle(veh);
  };

  const executeDeleteVehicle = async () => {
    if (!deleteTargetVehicle) return;
    const vehicleId = deleteTargetVehicle.vehicleId || deleteTargetVehicle.id;
    try {
      await customerApi.deleteVehicle(vehicleId);
      setVehicles(prev => prev.filter(v => (v.vehicleId || v.id) !== vehicleId));
      if (selectedVehicle && (selectedVehicle.vehicleId === vehicleId || selectedVehicle.id === vehicleId)) {
        setSelectedVehicle(null);
      }
      showAlert('Đã xóa phương tiện thành công!', 'success', 'Xóa thành công');
      window.dispatchEvent(new Event('vehicleListUpdated'));
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Không thể xóa phương tiện đang có lịch hẹn hoạt động.';
      showAlert(errMsg, 'error', 'Lỗi xóa phương tiện');
    } finally {
      setDeleteTargetVehicle(null);
    }
  };

  const handleSaveVehicle = (e) => {
    if (e) e.preventDefault();

    const trimmedModel = vehicleModel.trim();
    const trimmedPlate = vehicleLicensePlate.trim().toUpperCase();

    if (!trimmedModel) {
      showAlert('Vui lòng nhập tên/dòng xe máy.', 'warning');
      return;
    }

    if (!trimmedPlate) {
      showAlert('Vui lòng nhập biển số xe.', 'warning');
      return;
    }

    if (!validateLicensePlate(trimmedPlate)) {
      setVehicleLicensePlateError('Biển số xe không đúng định dạng (VD: 59-A1 123.45 hoặc 29-A1 1234)');
      return;
    }

    const isFirstVehicle = vehicles.length === 0;

    const payload = {
      model: trimmedModel,
      licensePlate: trimmedPlate,
      isDefault: isFirstVehicle ? true : vehicleIsDefault
    };

    setVehiclePayloadToConfirm(payload);
    setIsVehicleConfirmModalOpen(true);
  };

  const handleConfirmSaveVehicle = async () => {
    if (!vehiclePayloadToConfirm) return;
    setIsSubmittingVehicle(true);

    const isFirstVehicle = vehicles.length === 0;
    try {
      let savedVehicle;
      if (editingVehicle) {
        // (Mock) Handle Edit / Update flow
        savedVehicle = {
          ...vehiclePayloadToConfirm,
          id: editingVehicle.id || editingVehicle.vehicleId,
          vehicleType: editingVehicle.vehicleType || 'MOTORCYCLE'
        };
      } else {
        // Direct API Creation flow
        savedVehicle = await customerApi.addVehicle(vehiclePayloadToConfirm);
        const newVehId = savedVehicle.vehicleId || savedVehicle.id;
        if (newVehId && (isFirstVehicle || vehiclePayloadToConfirm.isDefault)) {
          try {
            await customerApi.setDefaultVehicle(newVehId);
          } catch (e) {
            console.warn('Auto set default vehicle call error:', e);
          }
        }
      }

      const isDefaultSaved = Boolean(isFirstVehicle || vehiclePayloadToConfirm.isDefault || savedVehicle.isDefault);

      const normalizedVehicle = {
        ...savedVehicle,
        vehicleId: savedVehicle.vehicleId || savedVehicle.id,
        model: vehiclePayloadToConfirm.model,
        licensePlate: vehiclePayloadToConfirm.licensePlate,
        isDefault: isDefaultSaved,
        vehicleType: savedVehicle.vehicleType || 'MOTORCYCLE'
      };

      setVehicles(prev => {
        const next = prev.map(vehicle => ({
          ...vehicle,
          isDefault: isDefaultSaved ? false : vehicle.isDefault
        }));

        if (editingVehicle) {
          return next.map(vehicle => (vehicle.id === editingVehicle.id ? normalizedVehicle : (isDefaultSaved ? { ...vehicle, isDefault: false } : vehicle)));
        }

        return [...next, normalizedVehicle];
      });

      setSelectedVehicle(normalizedVehicle);
      closeVehicleModal();
      setIsVehicleConfirmModalOpen(false);
      showAlert(editingVehicle ? 'Cập nhật xe thành công!' : 'Đăng ký xe mới thành công!', 'success', 'Thành công');
      console.log('[CustomerBookingPage] vehicle saved:', normalizedVehicle);

      // Đồng bộ danh sách xe với các trang khác (GaragePage) và reload từ API
      window.dispatchEvent(new Event('vehicleListUpdated'));
    } catch (err) {
      console.error('Failed to save vehicle:', err);
      showAlert('Lỗi khi lưu xe: ' + (err.response?.data?.message || err.message), 'error', 'Lỗi');
    } finally {
      setIsSubmittingVehicle(false);
      setVehiclePayloadToConfirm(null);
    }
  };

  const handleSetDefaultVehicle = (veh) => {
    const skipPrompt = localStorage.getItem('autowash_skip_default_prompt') === 'true';
    if (skipPrompt) {
      executeSetDefaultVehicle(veh);
      return;
    }
    setPendingDefaultVehicle(veh);
    setDontAskDefaultPrompt(false);
    setIsDefaultVehiclePromptOpen(true);
  };

  const handleConfirmChangeDefaultVehicle = async (shouldSetDefault) => {
    if (shouldSetDefault && pendingDefaultVehicle) {
      await executeSetDefaultVehicle(pendingDefaultVehicle);
    }

    if (dontAskDefaultPrompt) {
      localStorage.setItem('autowash_skip_default_prompt', 'true');
    }

    setIsDefaultVehiclePromptOpen(false);
    setPendingDefaultVehicle(null);
  };

  const executeSetDefaultVehicle = async (veh) => {
    try {
      const vehicleId = veh.vehicleId || veh.id;
      await customerApi.setDefaultVehicle(vehicleId);

      // Optimistic UI Update
      setVehicles(prev => prev.map(v => ({
        ...v,
        isDefault: (v.vehicleId || v.id) === vehicleId
      })));

      showAlert(`Chiếc xe ${veh.model || 'Xe máy'} - ${veh.licensePlate || ''} đã được chọn làm phương tiện mặc định.`, 'success', 'Đã đặt xe mặc định');
      window.dispatchEvent(new Event('vehicleListUpdated'));
    } catch (err) {
      console.error('Failed to set default vehicle:', err);
      showAlert("Không thể thiết lập xe mặc định. Vui lòng kiểm tra kết nối mạng và thử lại.", 'error', 'Cập nhật thất bại');
    }
  };

  const handleSelectVehicle = (v) => {
    setSelectedVehicle(v);
  };

  const handleOpenConfirmModal = (e) => {
    if (e) e.preventDefault();
    if (isDayLocked) {
      showAlert(`Xưởng tạm đóng cửa trong ngày ${selectedDate}. Lý do: ${closureReason || 'Bảo trì / Nghỉ lễ'}. Vui lòng chọn ngày khác!`, 'warning', 'Ngày đóng cửa');
      return;
    }
    if (!selectedVehicle) {
      showAlert("Vui lòng chọn 1 chiếc xe máy để dọn rửa.", 'warning');
      return;
    }
    if (!selectedPackage && (!selectedAddons || selectedAddons.length === 0)) {
      showAlert("Vui lòng chọn ít nhất 1 Gói Combo hoặc 1 Dịch vụ lẻ để dọn rửa.", 'warning');
      return;
    }
    if (!selectedDate || !selectedTime) {
      showAlert("Vui lòng chọn ngày và giờ hẹn mong muốn.", 'warning');
      return;
    }

    const trimmedLicensePlate = String(selectedVehicle.licensePlate || '').trim().toUpperCase();
    const trimmedModel = String(selectedVehicle.model || '').trim();

    if (!trimmedLicensePlate) {
      showAlert('Vui lòng chọn xe có biển số hợp lệ.', 'warning');
      return;
    }
    if (!trimmedModel) {
      showAlert('Vui lòng chọn xe có model hợp lệ.', 'warning');
      return;
    }

    const selectedPackageId = selectedPackage ? Number(selectedPackage?.id || selectedPackage?.serviceId || 0) : null;
    const selectedSlot = timeSlots.find(s => s.slotId === selectedTimeSlotId || s.time === selectedTime);
    if (selectedSlot && (selectedSlot.bookedCount >= selectedSlot.maxCapacity || selectedSlot.availableCapacity <= 0)) {
      showAlert("Khung giờ này hiện đã đầy công suất dọn rửa! Rất tiếc vì sự bất tiện này, mong quý khách vui lòng chọn một khung giờ khác.", 'warning');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Gửi đơn đặt lịch lên hệ thống
  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setIsConfirmModalOpen(false);

    const trimmedLicensePlate = String(selectedVehicle.licensePlate || '').trim().toUpperCase();
    const trimmedModel = String(selectedVehicle.model || '').trim();
    const selectedPackageId = selectedPackage ? Number(selectedPackage?.id || selectedPackage?.serviceId || 0) : null;

    const bookingData = {
      licensePlate: trimmedLicensePlate,
      model: trimmedModel,
      bookingDate: selectedDate,
      timeSlotId: Number(selectedTimeSlotId || 1),
      packageId: selectedPackageId,
      addonIds: selectedAddons || [],
      notes: selectedVoucher ? `Áp dụng voucher ${selectedVoucher.voucherCode}` : 'Đặt qua Web Client',
      voucherCode: selectedVoucher?.voucherCode || ''
    };

    try {
      const token = localStorage.getItem('autowash_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post('/api/v1/customer/bookings', bookingData, { headers });
      const createdBooking = response.data;

      const newBookingId = createdBooking.bookingCode || createdBooking.id;
      setCreatedBookingId(String(newBookingId));

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

      setIsSuccessModalOpen(true);
      await loadUserHistory();
      await loadCustomerVouchers();
    } catch (err) {
      console.error('Failed to create booking:', err);
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Không thể lưu đặt lịch. Vui lòng thử lại.';
      setBookingErrorMessage(message);
      setIsErrorModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format tiền tệ VNĐ
  const formatVnd = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const subtotalAmount = calculateTotalAmount();
  const discountAmount = calculateDiscount();
  const finalTotalAmount = Math.max(0, subtotalAmount - discountAmount);

  return (
    <div className="space-y-6 pb-12 text-left">

      {/* THANH TAB CHỌN PHÂN HỆ ĐẶT LỊCH / LỊCH SỬ ĐƠN */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-2xl">
        <button
          onClick={() => setBookingTab('new')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${bookingTab === 'new'
            ? 'bg-blue-50 text-blue-600'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
        >
          <CalendarIcon size={16} /> Đặt lịch rửa xe mới
        </button>
        <button
          onClick={() => setBookingTab('history')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all ${bookingTab === 'history'
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
                {vehicles.length > 0 && (
                  <button
                    onClick={openAddVehicleModal}
                    className={`flex items-center gap-1 text-xs font-bold transition-all hover:underline ${tierTheme.textAccent}`}
                  >
                    <Plus size={14} /> Đăng ký xe mới
                  </button>
                )}
              </div>

              {vehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map(veh => (
                    <VehicleCard
                      key={veh.vehicleId || veh.id}
                      vehicle={veh}
                      isSelected={selectedVehicle?.vehicleId === veh.vehicleId}
                      isDefault={veh.isDefault}
                      isSelectable={true}
                      onSelect={handleSelectVehicle}
                      onEdit={() => openEditVehicleModal(veh)}
                      onDelete={() => handleDeleteVehicle(veh)}
                      onSetDefault={handleSetDefaultVehicle}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-300">
                    <Car size={24} className="text-blue-500" />
                  </div>
                  <p>Ga-ra của bạn đang trống trơn. Hãy đăng ký chiếc xe đầu tiên của mình nhé!</p>
                  <button
                    onClick={openAddVehicleModal}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-all"
                  >
                    Đăng ký xe ngay
                  </button>
                </div>
              )}
            </section>

            {/* SECTION 2: CHỌN GÓI RỬA CHÍNH */}
            <section className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Chọn gói dịch vụ chính (Gói Combo Tiết Kiệm)</span>
                </h3>
                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100/80 w-fit">
                  ✨ Chọn 1 gói chính hoặc bỏ qua để chọn rửa lẻ ở dưới
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {corePackages.length === 0 ? (
                  <div className="col-span-1 md:col-span-3 text-center py-6 text-slate-500 text-sm border rounded-2xl bg-slate-50">
                    Không có dịch vụ chính nào khả dụng. Vui lòng thử lại sau.
                  </div>
                ) : corePackages.map((pkg, idx) => {
                  const currentPrice = calculatePackagePrice(pkg.basePrice);
                  const isSelected = selectedPackage?.id === pkg.id;

                  // Thống kê các nhãn nổi bật cho từng gói
                  const isPopular = idx === 1 || (pkg.name && pkg.name.includes('Cao cấp'));
                  const isVip = idx === 2 || (pkg.name && pkg.name.includes('VIP'));

                  const exclusiveVoucher = availableVouchers.find(v => {
                    if (!v.applicableServiceCode) return false;
                    const lockCode = String(v.applicableServiceCode).toUpperCase();
                    const pCode = String(pkg.serviceCode || pkg.code || pkg.name || '').toUpperCase();
                    return pCode.includes(lockCode) || lockCode.includes(pCode) || lockCode === String(pkg.id);
                  });

                  return (
                    <div
                      key={pkg.id}
                      id={`package-${pkg.id}`}
                      onClick={() => handleSelectPackage(pkg)}
                      className={`border rounded-3xl p-5.5 cursor-pointer transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group ${
                        isSelected
                          ? 'border-blue-500 bg-gradient-to-b from-blue-50/60 via-white to-blue-50/20 shadow-xl ring-2 ring-blue-500/25 scale-[1.02]'
                          : isPopular
                          ? 'border-indigo-200/90 hover:border-indigo-400 bg-gradient-to-b from-indigo-50/20 via-white to-white hover:shadow-xl shadow-md'
                          : 'border-slate-200/90 hover:border-blue-300 hover:shadow-xl bg-white'
                        }`}
                    >
                      {/* Top Accent Line */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500'
                          : isPopular
                          ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                          : isVip
                          ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
                          : 'bg-slate-200 group-hover:bg-blue-400'
                      }`} />

                      {/* Header Badge Pill */}
                      {isPopular && (
                        <div className="absolute top-3.5 right-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10 animate-pulse">
                          🔥 Phổ biến nhất
                        </div>
                      )}
                      {isVip && !isPopular && (
                        <div className="absolute top-3.5 right-3.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
                          👑 VIP Toàn diện
                        </div>
                      )}
                      {exclusiveVoucher && !isPopular && !isVip && (
                        <div className="absolute top-3.5 right-3.5 bg-emerald-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
                          <Sparkles size={10} /> Ưu đãi giảm giá
                        </div>
                      )}

                      <div>
                        {/* Title & Duration */}
                        <div className="pr-12 pt-1">
                          <h4 className="font-black text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                            {pkg.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] font-black text-slate-600 bg-slate-100/80 px-2.5 py-0.5 rounded-xl border border-slate-200/60 inline-flex items-center gap-1">
                              ⏱️ {pkg.duration}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-black text-blue-700 bg-blue-100/90 px-2.5 py-0.5 rounded-xl flex items-center gap-1">
                                <CheckCircle size={12} className="text-blue-600" /> Đã chọn
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-500 mt-3 leading-relaxed line-clamp-2 font-medium">
                          {pkg.description || 'Quy trình dọn rửa xe máy chuyên nghiệp tiêu chuẩn.'}
                        </p>

                        {/* Included Services Bullet Highlights */}
                        {pkg.includedServices && pkg.includedServices.length > 0 && (
                          <div className="mt-3.5 pt-3 border-t border-slate-100/80 space-y-1.5">
                            {pkg.includedServices.slice(0, 3).map((sub, sIdx) => (
                              <div key={sIdx} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-semibold truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span className="truncate">{sub.serviceName || sub.name}</span>
                              </div>
                            ))}
                            {pkg.includedServices.length > 3 && (
                              <span className="text-[10px] font-bold text-slate-400 block pt-0.5 pl-3">
                                +{pkg.includedServices.length - 3} công đoạn chi tiết khác...
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions & Price */}
                      <div className="pt-4 mt-4 flex flex-col gap-2.5 border-t border-slate-100">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Giá trọn gói</span>
                            <span className="font-mono text-xl font-black text-blue-600 tracking-tight">
                              {formatVnd(currentPrice)}
                            </span>
                          </div>
                          {exclusiveVoucher && (
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xl border border-emerald-200/80">
                              🎁 Có Voucher giảm
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailPackageModal(pkg);
                            }}
                            className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-extrabold text-[11px] rounded-xl border border-slate-200/80 flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <Info size={13} className="text-slate-500 shrink-0" />
                            <span>Quy trình</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPackage(pkg);
                            }}
                            className={`py-2 px-2.5 font-extrabold text-[11px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/70'
                            }`}
                          >
                            {isSelected ? '✓ Đã Chọn' : 'Chọn Gói'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 3: CHỌN DỊCH VỤ ĐƠN LẺ */}
            <section className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>Dịch vụ rửa lẻ độc lập (Single Services)</span>
                </h3>
                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100/80 w-fit">
                  🧼 Tùy chọn đặt lẻ không cần mua Gói Combo
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {singleServices.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 text-center py-4 text-slate-500 text-xs border rounded-xl bg-slate-50">
                    Không có dịch vụ đơn lẻ nào khả dụng.
                  </div>
                ) : (() => {
                  const includedIds = getIncludedAddonIds(selectedPackage);
                  const sortedSingles = [...singleServices].sort((a, b) => {
                    const aIncluded = includedIds.includes(a.id) ? 1 : 0;
                    const bIncluded = includedIds.includes(b.id) ? 1 : 0;
                    if (aIncluded !== bIncluded) return aIncluded - bIncluded;
                    return (a.price || 0) - (b.price || 0);
                  });
                  return sortedSingles.map(srv => {
                    const isIncludedInPackage = includedIds.includes(srv.id);
                    const isChecked = selectedAddons.includes(srv.id);

                    return (
                      <div
                        key={srv.id}
                        onClick={() => !isIncludedInPackage && handleToggleAddon(srv.id)}
                        className={`border rounded-2xl p-4 transition-all flex justify-between items-center ${isIncludedInPackage
                          ? 'border-emerald-300 bg-emerald-50/40 cursor-default opacity-80'
                          : isChecked
                            ? 'border-blue-500 bg-blue-50/20 shadow-sm cursor-pointer ring-2 ring-blue-500/15'
                            : 'border-slate-200/90 hover:border-blue-300 hover:bg-slate-50/50 cursor-pointer'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {isIncludedInPackage ? (
                            <div className="w-4.5 h-4.5 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            </div>
                          ) : (
                            <div className={`w-4.5 h-4.5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          )}
                          <div>
                            <h4 className={`font-extrabold text-xs ${isIncludedInPackage ? 'text-emerald-800' : 'text-slate-850'}`}>{srv.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-normal">{srv.description}</p>
                          </div>
                        </div>
                        {isIncludedInPackage ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl shrink-0 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Đã gồm trong combo
                          </span>
                        ) : (
                          <span className="font-mono text-xs font-black text-slate-800 shrink-0 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                            +{formatVnd(srv.price)}
                          </span>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </section>

            {/* SECTION 4: CHỌN TIỆN ÍCH CỘNG THÊM / ADD-ON */}
            <section className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">4</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Dịch vụ đi kèm / Add-on</span>
                </h3>
                <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80 w-fit">
                  ✨ Tiện ích dưỡng, phủ bóng & khử khuẩn cao cấp
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addonServices.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 text-center py-4 text-slate-500 text-xs border rounded-xl bg-slate-50">
                    Không có dịch vụ đi kèm nào khả dụng.
                  </div>
                ) : (() => {
                  const includedIds = getIncludedAddonIds(selectedPackage);
                  const sortedAddons = [...addonServices].sort((a, b) => {
                    const aIncluded = includedIds.includes(a.id) ? 1 : 0;
                    const bIncluded = includedIds.includes(b.id) ? 1 : 0;
                    if (aIncluded !== bIncluded) return aIncluded - bIncluded;
                    return (a.price || 0) - (b.price || 0);
                  });
                  return sortedAddons.map(addon => {
                    const isIncludedInPackage = includedIds.includes(addon.id);
                    const isChecked = selectedAddons.includes(addon.id);

                    return (
                      <div
                        key={addon.id}
                        onClick={() => !isIncludedInPackage && handleToggleAddon(addon.id)}
                        className={`border rounded-2xl p-4 transition-all flex justify-between items-center ${isIncludedInPackage
                          ? 'border-emerald-300 bg-emerald-50/40 cursor-default opacity-80'
                          : isChecked
                            ? 'border-amber-500 bg-amber-50/20 shadow-sm cursor-pointer ring-2 ring-amber-500/15'
                            : 'border-slate-200/90 hover:border-amber-300 hover:bg-slate-50/50 cursor-pointer'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {isIncludedInPackage ? (
                            <div className="w-4.5 h-4.5 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            </div>
                          ) : (
                            <div className={`w-4.5 h-4.5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${isChecked ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 bg-white'}`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          )}
                          <div>
                            <h4 className={`font-extrabold text-xs ${isIncludedInPackage ? 'text-emerald-800' : 'text-slate-850'}`}>{addon.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-normal">{addon.description}</p>
                          </div>
                        </div>
                        {isIncludedInPackage ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl shrink-0 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Đã gồm trong combo
                          </span>
                        ) : (
                          <span className="font-mono text-xs font-black text-slate-800 shrink-0 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                            +{formatVnd(addon.price)}
                          </span>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </section>

            {/* SECTION 5: CHỌN NGÀY & KHUNG GIỜ HẸN HẠN ĐỊNH THEO TIER */}
            <section className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">5</span>
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
                    * Hạng <strong className="uppercase text-slate-700">{customerProfile?.tierName || 'MEMBER'}</strong> của bạn được ưu tiên đặt trước tối đa <strong>{bookingWindowDays} ngày</strong>.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Khung giờ hoạt động</label>

                  {/* Garage Closure / Day Locked Banner */}
                  {isDayLocked && (
                    <div className="mb-3 rounded-xl border border-amber-300/60 bg-amber-50/80 px-4 py-3">
                      <p className="text-sm font-bold text-amber-800 mb-0.5">Ngày này hiện đang tạm đóng cửa</p>
                      <p className="text-sm text-amber-800 mb-0.5">Lý do:</p>
                      <p className="text-xs text-700 leading-relaxed">{closureReason || 'Xưởng nghỉ — vui lòng chọn ngày khác.'}</p>
                    </div>
                  )}

                  <div className={`grid grid-cols-3 gap-2 ${isDayLocked ? 'opacity-40 pointer-events-none' : ''}`}>
                    {timeSlots.map(slot => {
                      const isPast = slot.isPast === true;
                      const isFull = (slot.bookedCount >= slot.maxCapacity) || (slot.availableCapacity <= 0) || (slot.available === false);
                      const isOverlap = slot.isOverlap === true;
                      const isDisabled = isDayLocked || isPast || isFull || isOverlap;

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDisabled) return;
                            setSelectedTime(slot.time);
                            setSelectedTimeSlotId(slot.slotId);
                          }}
                          className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all flex flex-col items-center justify-center min-h-[50px] ${isDayLocked
                            ? 'opacity-60 bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : isPast
                              ? 'opacity-40 bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                              : isOverlap
                                ? 'opacity-60 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                : isFull
                                  ? 'opacity-70 bg-rose-50 border-rose-200 text-rose-600 cursor-not-allowed'
                                  : selectedTime === slot.time
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-500 hover:text-blue-600'
                            }`}
                        >
                          <span>{slot.time}</span>
                          {isDayLocked ? (
                            <span className="text-[8px] font-extrabold uppercase mt-0.5 text-amber-600">
                              🔒 Đóng cửa
                            </span>
                          ) : isPast ? (
                            <span className="text-[8px] font-extrabold uppercase mt-0.5 text-gray-400">
                              Đã qua
                            </span>
                          ) : isOverlap ? (
                            <span className="text-[8px] font-extrabold uppercase mt-0.5 text-slate-500">
                              🔒 Đã đặt
                            </span>
                          ) : isFull ? (
                            <span className="text-[8px] font-black uppercase mt-0.5 text-rose-600">
                              🔒 ĐÃ ĐẦY / KHÓA
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

          </div>

          <div className="self-start sticky top-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
              {/* Sleek Header Banner */}
              <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <FileText size={16} className="text-blue-400" /> Tóm tắt lịch hẹn dọn xe
                </h3>
                <span className="text-[10px] font-extrabold bg-blue-500/20 border border-blue-400/30 text-blue-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Hóa đơn tạm tính
                </span>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Information List */}
                <div className="space-y-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 font-medium">Xe dọn rửa:</span>
                    <span className="text-slate-800 font-bold text-right">
                      {selectedVehicle ? `${selectedVehicle.model} (${selectedVehicle.licensePlate})` : <span className="text-slate-400 font-normal">Chưa chọn</span>}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 font-medium">Gói dọn rửa:</span>
                    <span className="text-slate-800 font-bold text-right">
                      {selectedPackage ? selectedPackage.name : <span className="text-slate-400 font-normal">Chưa chọn</span>}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 font-medium">Tiện ích cộng thêm:</span>
                    <span className="text-slate-800 font-bold text-right max-w-[170px] truncate">
                      {selectedAddons.length > 0
                        ? selectedAddons.map(id => [...singleServices, ...addonServices].find(a => a.id === id)?.name).filter(Boolean).join(', ')
                        : <span className="text-slate-400 font-normal">Không chọn</span>}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 font-medium">Lịch hẹn:</span>
                    <span className="text-slate-800 font-bold text-right text-blue-600">
                      {selectedDate && selectedTime ? `${selectedTime} • ${selectedDate}` : <span className="text-slate-400 font-normal">Chưa chọn</span>}
                    </span>
                  </div>
                </div>

                {/* Chọn Voucher từ Ví cá nhân & Gợi ý tối ưu */}
                {(() => {
                  const { applicableVouchers, inapplicableVouchers, bestVoucher } = getEvaluatedVouchers();
                  return (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                          Ưu đãi & Voucher áp dụng:
                        </span>
                      </div>

                      {availableVouchers && availableVouchers.length > 0 ? (
                        <div className="space-y-2 relative">
                          {/* Custom Selector Input Box */}
                          {isVoucherDropdownOpen && (
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setIsVoucherDropdownOpen(false)}
                            />
                          )}

                          {/* Voucher Select Button / Display Box */}
                          <button
                            type="button"
                            onClick={() => setIsVoucherDropdownOpen(!isVoucherDropdownOpen)}
                            className="w-full border border-slate-200 hover:border-rose-300 rounded-xl p-2.5 text-xs text-left font-bold text-slate-700 bg-white shadow-xs flex items-center justify-between transition-all cursor-pointer relative z-30 overflow-hidden"
                          >
                            <div className="truncate flex items-center gap-2 min-w-0">
                              {selectedVoucher ? (
                                (() => {
                                  const isBest = bestVoucher?.voucherCode === selectedVoucher.voucherCode;
                                  const title = selectedVoucher.title || selectedVoucher.name || selectedVoucher.voucherCode;
                                  let valTag = '-50k';
                                  if (selectedVoucher.discountType === 'FREE_SERVICE' || selectedVoucher.discountType === 'free_wash') {
                                    valTag = 'FREE';
                                  } else if (selectedVoucher.discountType === 'PERCENTAGE' || selectedVoucher.discountType === 'percent') {
                                    valTag = `-${Number(selectedVoucher.value) || 0}%`;
                                  } else {
                                    const vVal = Number(selectedVoucher.value) || 0;
                                    valTag = `-${vVal >= 1000 ? `${vVal / 1000}k` : vVal}`;
                                  }

                                  return (
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span className="bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-[9.5px] px-2 py-0.5 rounded-md shrink-0 shadow-xs">
                                        {valTag}
                                      </span>
                                      {isBest && (
                                        <span className="font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded text-[9px] shrink-0 font-sans tracking-tight">
                                          [Tốt nhất]
                                        </span>
                                      )}
                                      <span className="truncate font-bold text-slate-800">{title}</span>
                                    </div>
                                  );
                                })()
                              ) : (
                                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                  <Sparkles size={13} className="text-rose-500" />
                                  <span>-- Chọn mã voucher ưu đãi --</span>
                                </span>
                              )}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isVoucherDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Popover Custom Dropdown Panel */}
                          {isVoucherDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1">

                              <button
                                type="button"
                                onClick={() => { setSelectedVoucher(null); setIsVoucherDropdownOpen(false); }}
                                className="w-full px-3 py-2 text-left font-bold text-slate-500 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer"
                              >
                                <span>-- Không sử dụng Voucher --</span>
                                {!selectedVoucher && <Check size={14} className="text-slate-500" />}
                              </button>

                              {/* 🟢 VOUCHER KHẢ DỤNG */}
                              {applicableVouchers.length > 0 && (
                                <div className="space-y-1 pt-1">
                                  <div className="px-2.5 py-1 text-[10px] font-extrabold text-rose-700 bg-rose-50 rounded-lg uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-rose-500" />
                                    <span>Voucher khả dụng ({applicableVouchers.length})</span>
                                  </div>

                                  {applicableVouchers.map((v, idx) => {
                                    const isBest = idx === 0;
                                    const isSelected = selectedVoucher?.voucherCode === v.voucherCode;
                                    const title = v.title || v.name || v.voucherCode;

                                    let discountVal = '-50k';
                                    let discountDetail = '';
                                    if (v.discountType === 'FREE_SERVICE' || v.discountType === 'free_wash') {
                                      discountVal = 'FREE';
                                      discountDetail = 'Miễn phí rửa xe';
                                    } else if (v.discountType === 'PERCENTAGE' || v.discountType === 'percent') {
                                      const pct = Number(v.value) || 0;
                                      discountVal = `-${pct}%`;
                                      const maxCap = (v.maxDiscountAmount != null && Number(v.maxDiscountAmount) > 0)
                                        ? ` (tối đa ${Number(v.maxDiscountAmount).toLocaleString('vi-VN')} đ)`
                                        : '';
                                      discountDetail = `Giảm ${pct}%${maxCap}`;
                                    } else {
                                      const val = Number(v.value) || 0;
                                      discountVal = `-${val >= 1000 ? `${val / 1000}k` : val}`;
                                      const maxCap = (v.maxDiscountAmount != null && Number(v.maxDiscountAmount) > 0)
                                        ? ` (tối đa ${Number(v.maxDiscountAmount).toLocaleString('vi-VN')} đ)`
                                        : '';
                                      discountDetail = `Giảm ${val.toLocaleString('vi-VN')} đ${maxCap}`;
                                    }

                                    return (
                                      <button
                                        key={v.voucherCode}
                                        type="button"
                                        onClick={() => { setSelectedVoucher(v); setIsVoucherDropdownOpen(false); }}
                                        className={`w-full rounded-xl overflow-hidden border text-left transition-all flex items-stretch cursor-pointer group ${
                                          isSelected ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md bg-rose-50/20' : 'border-slate-200 hover:border-rose-300 bg-white hover:shadow-sm'
                                        }`}
                                      >
                                        {/* Left Ticket Stub */}
                                        <div className="w-16 bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 text-white flex flex-col items-center justify-center p-1.5 shrink-0 relative">
                                          <span className="text-[8px] uppercase font-extrabold text-white/80 tracking-tighter">ƯU ĐÃI</span>
                                          <span className="text-[11px] font-black font-sans leading-tight mt-0.5 whitespace-nowrap">
                                            {discountVal}
                                          </span>
                                        </div>

                                        {/* Right Ticket Body */}
                                        <div className="flex-1 p-2 flex items-center justify-between min-w-0 bg-white">
                                          <div className="min-w-0 pr-1.5">
                                            <div className="flex items-center gap-1 truncate">
                                              {isBest && (
                                                <span className="font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-1 py-0.2 rounded text-[8.5px] shrink-0 font-sans tracking-tight">
                                                  [Tốt nhất]
                                                </span>
                                              )}
                                              <span className="font-black text-slate-800 text-[11px] truncate">{title}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{discountDetail}</p>
                                          </div>
                                          {isSelected && <Check size={14} className="text-rose-600 shrink-0" />}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* 🔴 VOUCHER KHÔNG KHẢ DỤNG */}
                              {inapplicableVouchers.length > 0 && (
                                <div className="space-y-1 pt-1">
                                  <div className="px-2.5 py-1 text-[10px] font-extrabold text-slate-500 bg-slate-100 rounded-lg uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                    <span>Voucher không khả dụng ({inapplicableVouchers.length})</span>
                                  </div>

                                  {inapplicableVouchers.map(v => {
                                    const title = v.title || v.name || v.voucherCode;
                                    let discountVal = '-50k';
                                    if (v.discountType === 'FREE_SERVICE' || v.discountType === 'free_wash') {
                                      discountVal = 'FREE';
                                    } else if (v.discountType === 'PERCENTAGE' || v.discountType === 'percent') {
                                      discountVal = `-${Number(v.value) || 0}%`;
                                    } else {
                                      const val = Number(v.value) || 0;
                                      discountVal = `-${val >= 1000 ? `${val / 1000}k` : val}`;
                                    }
                                    const reason = v.inapplicableReason ? ` (${v.inapplicableReason})` : '';

                                    return (
                                      <div
                                        key={v.voucherCode}
                                        className="w-full rounded-xl overflow-hidden border border-slate-200 text-left flex items-stretch opacity-60 bg-slate-50 cursor-not-allowed"
                                      >
                                        <div className="w-16 bg-slate-400 text-white flex flex-col items-center justify-center p-1.5 shrink-0">
                                          <span className="text-[8px] uppercase font-extrabold text-white/80 tracking-tighter">K.KHẢ DỤNG</span>
                                          <span className="text-[11px] font-black font-sans leading-tight mt-0.5 whitespace-nowrap">
                                            {discountVal}
                                          </span>
                                        </div>
                                        <div className="flex-1 p-2 min-w-0">
                                          <span className="font-bold text-slate-700 text-[11px] truncate block">{title}</span>
                                          <span className="text-[9.5px] text-rose-600 font-semibold truncate block mt-0.5">{reason}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Chi tiết mã giảm đang áp dụng */}
                          {selectedVoucher && (
                            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-[11px] text-emerald-800 font-medium flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                                <span>Mã <strong className="font-mono uppercase">{selectedVoucher.voucherCode}</strong> giảm:</span>
                              </div>
                              <span className="font-black font-mono text-xs text-emerald-700">-{formatVnd(calculateDiscount())}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">Ví của bạn hiện chưa có voucher khả dụng.</p>
                      )}
                    </div>
                  );
                })()}

                {/* Calculation Summary Box */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Cộng tạm tính:</span>
                    <span className="font-mono text-slate-800 font-bold">
                      {`${subtotalAmount.toLocaleString('vi-VN')} đ`}
                    </span>
                  </div>

                  {selectedVoucher && (
                    <div className="flex justify-between items-center text-xs text-emerald-600 font-bold">
                      <span>Giảm giá ưu đãi:</span>
                      <span className="font-mono">
                        {`-${discountAmount.toLocaleString('vi-VN')} đ`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-900 font-black text-xs uppercase tracking-tight">Tổng tiền cần trả:</span>
                    <span className="font-mono text-base font-black text-blue-600">
                      {`${finalTotalAmount.toLocaleString('vi-VN')} đ`}
                    </span>
                  </div>
                </div>

                <button
                  disabled={isSubmitting}
                  onClick={handleOpenConfirmModal}
                  className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${tierTheme.btnPrimary}`}
                >
                  {isSubmitting ? 'Đang tạo đơn hẹn...' : 'Xác nhận Đặt lịch ngay'}
                </button>

                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-500 leading-relaxed">
                  <AlertCircle size={13} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    Không cần thanh toán trước! Bạn chỉ cần đến trạm đúng giờ hẹn để rửa xe và tích điểm VIP.<br />
                    <strong className="text-slate-700">* Có thể hủy đơn miễn phí trước giờ hẹn.</strong>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-4 gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Nhật ký lịch trình đặt hẹn rửa xe máy</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Khách hàng có thể hủy đơn bất kỳ lúc nào trước giờ hẹn (Tối đa 3 lần/ngày).
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'PENDING', label: 'Chờ xác nhận' },
                { id: 'COMPLETED', label: 'Đã hoàn thành' },
                { id: 'CANCELLED', label: 'Đã hủy' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHistoryStatusFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${historyStatusFilter === tab.id
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredUserHistory.length > 0 ? (
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
                  {filteredUserHistory.map(b => (
                    <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-2 font-mono font-bold text-blue-600">{b.bookingCode}</td>
                      <td className="py-4 px-2 font-mono">
                        {b.date} <span className="text-slate-400 font-sans">vào</span> {b.time}
                      </td>
                      <td className="py-4 px-2 font-medium">{b.model} ({b.licensePlate})</td>
                      <td className="py-4 px-2">{b.packageName}</td>
                      <td className="py-4 px-2 text-right font-mono font-bold text-slate-800">{formatVnd(b.finalAmount)}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${b.status?.toLowerCase() === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-250'
                          : b.status?.toLowerCase() === 'pending' || b.status?.toLowerCase() === 'confirmed'
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-250'
                            : 'bg-red-50 text-red-700 border border-red-250'
                          }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        {(['PENDING', 'CONFIRMED'].includes(b.rawStatus) || ['pending', 'confirmed'].includes(b.status?.toLowerCase())) ? (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-all flex items-center gap-1 text-[10px] font-bold ml-auto cursor-pointer"
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
            <div className="text-center py-12 text-slate-400 font-medium text-xs">
              Không có lịch đặt nào ở trạng thái này.
            </div>
          )}
        </div>
      )}

      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className={`px-6 py-4 flex items-center justify-between border-b ${tierTheme.modalHeader}`}>
              <h3 className="text-base font-bold text-white">
                {editingVehicle ? 'Cập nhật thông tin xe máy' : 'Đăng ký xe máy mới'}
              </h3>
              <button
                onClick={closeVehicleModal}
                className="rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="p-6 space-y-4">
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
                  onBlur={handleVehicleLicensePlateChange}
                  placeholder="Ví dụ: 29-H1 888.88 hoặc 59-S3 123.45"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 font-mono text-sm tracking-wide outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
                {vehicleLicensePlateError && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{vehicleLicensePlateError}</p>
                )}
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
                  * Dịch vụ dọn rửa xe được đồng giá cho mọi dòng xe số, xe ga và PKL. Biển số xe sẽ được ghi nhận vào phiếu check-in.
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
                  disabled={!vehicleModel.trim() || !vehicleLicensePlate.trim() || !!vehicleLicensePlateError}
                  className={`rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                    (!vehicleModel.trim() || !vehicleLicensePlate.trim() || !!vehicleLicensePlateError)
                      ? 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed shadow-none'
                      : tierTheme.btnPrimary
                  }`}
                >
                  {editingVehicle ? 'Lưu thay đổi' : 'Đăng ký ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add New Vehicle Confirmation Modal */}
      {isVehicleConfirmModalOpen && vehiclePayloadToConfirm && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsVehicleConfirmModalOpen(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 animate-pulse">
              <Car className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-800 mb-3 text-center">Xác nhận đăng ký phương tiện</h3>

            <div className="w-full bg-slate-50 rounded-xl p-4 mb-5 text-xs text-left space-y-2.5 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Tên/Dòng xe máy:</span>
                <span className="text-slate-850 font-bold">{vehiclePayloadToConfirm.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Biển số xe:</span>
                <span className="text-slate-850 font-mono font-bold">{vehiclePayloadToConfirm.licensePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Loại phương tiện:</span>
                <span className="text-slate-850 font-bold">Xe máy</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2.5 mt-1">
                <span className="text-slate-400 font-medium">Lựa chọn mặc định:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${vehiclePayloadToConfirm.isDefault ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                  {vehiclePayloadToConfirm.isDefault ? 'Đặt làm mặc định' : 'Không đặt mặc định'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsVehicleConfirmModalOpen(false)}
                className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 transition cursor-pointer"
              >
                Kiểm tra lại
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveVehicle}
                disabled={isSubmittingVehicle}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingVehicle && <Loader2 size={12} className="animate-spin" />}
                Xác nhận thêm xe
              </button>
            </div>
          </div>
        </div>
      )}

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
            {alertModal.type === 'info' && (
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 animate-bounce">
                <Info className="w-6 h-6" />
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
      {/* CONFIRM DELETE MODAL */}
      {deleteTargetVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4 text-center">
            <h3 className="font-extrabold text-slate-800 text-lg">Xác nhận xóa phương tiện</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Bạn có chắc chắn muốn xóa phương tiện <strong className="text-slate-850 font-black">{deleteTargetVehicle.model} ({deleteTargetVehicle.licensePlate})</strong> khỏi danh sách garage của bạn? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetVehicle(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={executeDeleteVehicle}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-colors"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. DEFAULT VEHICLE CHANGE CONFIRMATION MODAL */}
      {isDefaultVehiclePromptOpen && pendingDefaultVehicle && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleConfirmChangeDefaultVehicle(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-250">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Car className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-800 font-sans">Đặt làm xe mặc định?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium px-2">
                Bạn có muốn đặt chiếc <strong className="text-slate-700">{pendingDefaultVehicle.model} ({pendingDefaultVehicle.licensePlate})</strong> làm xe mặc định cho các dịch vụ tiếp theo không?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1.5 cursor-pointer">
              <input
                type="checkbox"
                id="dontAskAgain"
                checked={dontAskDefaultPrompt}
                onChange={(e) => setDontAskDefaultPrompt(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="dontAskAgain" className="text-xs font-semibold text-slate-600 cursor-pointer">
                Không hỏi lại tôi nữa
              </label>
            </div>

            <div className="flex w-full gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmChangeDefaultVehicle(false)}
                className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Chỉ lần này thôi
              </button>
              <button
                type="button"
                onClick={() => handleConfirmChangeDefaultVehicle(true)}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Đặt mặc định
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BOOKING CONFIRMATION DETAILS MODAL */}
      {isConfirmModalOpen && selectedVehicle && selectedPackage && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsConfirmModalOpen(false); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-250">
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Xác nhận thông tin đặt lịch</h3>
                <p className="text-[11px] text-slate-400 font-medium">Vui lòng rà soát kỹ thông tin trước khi hoàn tất</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-start py-1.5 border-b border-dashed border-slate-100">
                <span className="text-slate-400 font-medium shrink-0">Phương tiện:</span>
                <span className="text-slate-800 font-bold text-right font-mono">
                  {selectedVehicle.model} ({selectedVehicle.licensePlate})
                </span>
              </div>

              <div className="flex justify-between items-start py-1.5 border-b border-dashed border-slate-100">
                <span className="text-slate-400 font-medium shrink-0">Dịch vụ chính:</span>
                <span className="text-slate-800 font-bold text-right">
                  {selectedPackage.name}
                </span>
              </div>

              {selectedAddons.length > 0 && (
                <div className="flex justify-between items-start py-1.5 border-b border-dashed border-slate-100">
                  <span className="text-slate-400 font-medium shrink-0">Dịch vụ kèm:</span>
                  <span className="text-slate-800 font-bold text-right">
                    {selectedAddons.map(id => addonServices.find(a => a.id === id)?.name).join(', ')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-start py-1.5 border-b border-dashed border-slate-100">
                <span className="text-slate-400 font-medium shrink-0">Thời gian hẹn:</span>
                <span className="text-slate-800 font-bold text-right">
                  {selectedTime} ngày {selectedDate}
                </span>
              </div>

              <div className="flex justify-between items-start py-1.5 border-b border-dashed border-slate-100">
                <span className="text-slate-400 font-medium shrink-0">Địa điểm / Chi nhánh:</span>
                <span className="text-slate-800 font-bold text-right">
                  NovaWash - Trạm Dịch Vụ Thông Minh
                </span>
              </div>

              {selectedVoucher && (
                <div className="flex justify-between items-start py-1.5 border-b border-dashed border-slate-100 text-emerald-600 font-semibold">
                  <span className="shrink-0">Mã giảm giá áp dụng:</span>
                  <span>{selectedVoucher.voucherCode}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-slate-800 font-black text-sm">Tổng thanh toán tạm tính:</span>
                <span className="font-mono text-base font-black text-blue-600">
                  {`${finalTotalAmount.toLocaleString('vi-VN')} đ`}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                <span>Xác nhận đặt lịch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. STATUS NOTIFICATION MODALS (SUCCESS / ERROR) */}
      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setIsSuccessModalOpen(false); setBookingTab('history'); } }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-250">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-800">Đặt lịch thành công!</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium px-2">
                Lịch hẹn của bạn đã được ghi nhận. Mã đơn hẹn: <strong className="text-blue-600 font-bold font-mono">#{createdBookingId}</strong>. Hệ thống sẽ gửi tin nhắn xác nhận cho bạn.
              </p>
            </div>

            <div className="flex w-full gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsSuccessModalOpen(false); setBookingTab('history'); }}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Xem lịch hẹn của tôi
              </button>
            </div>
          </div>
        </div>
      )}

      {isErrorModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsErrorModalOpen(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-250">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-800">Đặt lịch thất bại</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium px-2">
                {bookingErrorMessage || 'Khung giờ này hiện đã đầy công suất hoặc hệ thống gặp sự cố. Vui lòng chọn khung giờ khác.'}
              </p>
            </div>

            <div className="flex w-full gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsErrorModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )}

      {detailPackageModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl space-y-0 border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-5 sm:p-6 relative overflow-hidden shrink-0">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute right-12 top-2 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block">Quy trình chi tiết Gói Combo</span>
                    <h3 className="font-black text-white text-lg sm:text-xl leading-tight mt-0.5">
                      {detailPackageModal.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] font-extrabold text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10 inline-flex items-center gap-1">
                        ⏱️ Tổng thời lượng: {detailPackageModal.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailPackageModal(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 no-scrollbar text-left">
              {/* Overview Box */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/70 rounded-2xl p-4 text-xs text-slate-600 font-medium leading-relaxed shadow-xs">
                <strong className="text-slate-900 font-extrabold block mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Mô tả quy trình tổng quan:</span>
                </strong>
                {detailPackageModal.description || 'Quy trình dọn rửa chăm sóc xe máy tiêu chuẩn chuyên nghiệp.'}
              </div>

              {/* Detailed Steps Timeline */}
              <div>
                <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 mb-3 pt-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Các công đoạn thực hiện chi tiết trong gói:</span>
                </h4>

                <div className="space-y-3 relative pl-2">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-[21px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-300 via-indigo-200 to-slate-200 -z-0" />

                  {detailPackageModal.includedServices && detailPackageModal.includedServices.length > 0 ? (
                    detailPackageModal.includedServices.map((srv, idx) => (
                      <div key={srv.serviceId || idx} className="relative z-10 flex items-start gap-3 p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-300 transition-all">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-extrabold text-slate-900 text-xs truncate">
                              {srv.serviceName || srv.name}
                            </h5>
                            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 shrink-0">
                              ⏱️ {srv.durationMinutes || 5} phút
                            </span>
                          </div>
                          {srv.description && (
                            <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
                              {srv.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    (detailPackageModal.description || 'Rửa bọt tuyết chuyên dụng, xịt khô, lau bóng')
                      .split(/[,.]/)
                      .map(s => s.trim())
                      .filter(Boolean)
                      .map((stepText, idx) => (
                        <div key={idx} className="relative z-10 flex items-start gap-3 p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-300 transition-all">
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                            {String(idx + 1).padStart(2, '0')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-extrabold text-slate-900 text-xs">
                              {stepText.charAt(0).toUpperCase() + stepText.slice(1)}
                            </h5>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                              Công đoạn dọn rửa chuẩn quy trình dịch vụ cao cấp.
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Sticky Footer */}
            <div className="p-4 sm:p-5 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between gap-4 text-left shrink-0">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Giá trọn gói dịch vụ</span>
                <span className="font-mono text-xl font-black text-blue-600 tracking-tight">
                  {formatVnd(calculatePackagePrice(detailPackageModal.basePrice))}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleSelectPackage(detailPackageModal);
                  setDetailPackageModal(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <CheckCircle size={15} />
                <span>Chọn Gói Này Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

