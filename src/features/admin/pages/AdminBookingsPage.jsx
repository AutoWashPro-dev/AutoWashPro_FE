import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  User, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Bike, 
  Coins, 
  Gift, 
  Play, 
  FileText, 
  Ban, 
  Check, 
  Sparkles,
  ArrowLeft,
  QrCode,
  Layers,
  Activity,
  MapPin,
  ChevronRight,
  ChevronLeft,
  History,
  ClipboardList
} from 'lucide-react';
import { bookingAdminApi } from '../services/bookingAdminApi';

export default function AdminBookingsPage() {
  // 1. Initialize localStorage databases if not exists to enable E2E integration
  useEffect(() => {
    // Loyalty Settings
    if (!localStorage.getItem('autowash_loyalty_settings')) {
      localStorage.setItem('autowash_loyalty_settings', JSON.stringify({
        basePoints: 1,
        baseSpend: 10000, // 10k VND = 1 Point
        roundDown: true,
        pointCashValuePts: 100,
        pointCashValueVnd: 100000, // 100 Pts = 100,000 VND (1 Pt = 1,000 VND)
        maxRedemptionPercent: 80, // max 80% per order
        pointValidityMonths: 12,
        downgradeInactivityMonths: 6
      }));
    }

    // Membership Tier Matrix
    if (!localStorage.getItem('autowash_tiers')) {
      localStorage.setItem('autowash_tiers', JSON.stringify([
        { key: 'Member', name: 'Member', minSpend: 0, pointMultiplier: 1.0, bookingWindow: 7, isActive: true },
        { key: 'Silver', name: 'Silver', minSpend: 1000000, pointMultiplier: 1.2, bookingWindow: 7, isActive: true },
        { key: 'Gold', name: 'Gold', minSpend: 5000000, pointMultiplier: 1.5, bookingWindow: 14, isActive: true },
        { key: 'Platinum', name: 'Platinum', minSpend: 10000000, pointMultiplier: 2.0, bookingWindow: 14, isActive: true }
      ]));
    }

    // Customers CRM Database
    if (!localStorage.getItem('autowash_customers')) {
      localStorage.setItem('autowash_customers', JSON.stringify([
        { id: 'C-01', name: 'Nguyễn Minh Anh', phone: '0912***456', tier: 'VIP', points: 1240, totalSpend: 15400000, visits: 24, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100', lastVisitDays: 5, status: 'Active' },
        { id: 'C-02', name: 'Lê Hoàng Long', phone: '0903***888', tier: 'Silver', points: 320, totalSpend: 3800000, visits: 8, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100', lastVisitDays: 14, status: 'Active' },
        { id: 'C-03', name: 'Hoàng Linh', phone: '0977***444', tier: 'Gold', points: 750, totalSpend: 8200000, visits: 14, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', lastVisitDays: 8, status: 'Active' },
        { id: 'C-04', name: 'Trần Đức Bo', phone: '0988***123', tier: 'Member', points: 80, totalSpend: 950000, visits: 2, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', lastVisitDays: 45, status: 'Active' },
        { id: 'C-05', name: 'Phạm Văn Nam', phone: '0944***555', tier: 'Member', points: 10, totalSpend: 320000, visits: 1, avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100', lastVisitDays: 75, status: 'Active' }
      ]));
    }

    // Points Log Database
    if (!localStorage.getItem('autowash_points_log')) {
      localStorage.setItem('autowash_points_log', JSON.stringify({
        'C-01': [
          { date: '30/06, 09:15', type: 'EARN', amount: 125, reason: 'Tích điểm đơn AW-9812' },
          { date: '15/06, 14:02', type: 'REDEEM', amount: 200, reason: 'Quy đổi giảm trừ đơn AW-9720' },
          { date: '01/06, 11:30', type: 'EARN', amount: 225, reason: 'Tích điểm đơn AW-9643' }
        ],
        'C-02': [
          { date: '10/06, 15:00', type: 'EARN', amount: 35, reason: 'Tích điểm đơn AW-9650' }
        ],
        'C-03': [
          { date: '29/06, 17:30', type: 'EARN', amount: 100, reason: 'Tích điểm đơn AW-9805' }
        ],
        'C-04': [],
        'C-05': []
      }));
    }

    // Vouchers Database
    if (!localStorage.getItem('autowash_vouchers')) {
      localStorage.setItem('autowash_vouchers', JSON.stringify({
        'C-01': [
          { code: 'SUMMER24', name: 'Voucher Mùa Hè Rực Rỡ', value: '50.000 đ', status: 'ISSUED' },
          { code: 'VIPPRO', name: 'Tri ân khách hàng Kim Cương', value: '100.000 đ', status: 'USED' }
        ],
        'C-02': [
          { code: 'WELCOME50', name: 'Chào mừng thành viên', value: '10%', status: 'ISSUED' }
        ],
        'C-03': [
          { code: 'SUMMER24', name: 'Voucher Mùa Hè Rực Rỡ', value: '50.000 đ', status: 'ISSUED' }
        ],
        'C-04': [
          { code: 'WELCOME50', name: 'Chào mừng thành viên', value: '10%', status: 'ISSUED' }
        ],
        'C-05': [
          { code: 'WELCOME50', name: 'Chào mừng thành viên', value: '10%', status: 'EXPIRED' }
        ]
      }));
    }

    // Bookings Database
    if (!localStorage.getItem('autowash_bookings')) {
      const initialBookings = {
        '2026-06-30': [
          { id: 'AW-9801', slotTime: '08:30', custId: 'C-04', vehicle: { type: 'Xe máy', model: 'Yamaha Grande', plate: '29-D1 555.55' }, service: { name: 'Basic Wash', price: 70000 }, status: 'Completed', createdTime: '30/06, 07:15 AM via Mobile App', paymentMethod: 'VNPay', pointsRedeemed: 0, discount: 0, finalAmount: 70000, completedTime: '08:52 AM', estimatedDuration: 20, source: 'APP', paymentStatus: 'PAID' },
          { id: 'AW-9802', slotTime: '10:00', custId: 'C-01', vehicle: { type: 'Xe máy', model: 'Honda Lead', plate: '30-H2 333.33' }, service: { name: 'Premium Wash + Wax', price: 150000 }, status: 'Completed', createdTime: '30/06, 08:30 AM via Mobile App', paymentMethod: 'Cash', pointsRedeemed: 50, discount: 50000, finalAmount: 100000, completedTime: '10:32 AM', estimatedDuration: 30, source: 'APP', paymentStatus: 'PAID' }
        ],
        '2026-07-01': [
          { id: 'AW-9821', slotTime: '14:30', custId: 'C-01', vehicle: { type: 'Xe máy', model: 'Honda SH 150i', plate: '29-G1 888.88' }, service: { name: 'Premium Wash + Wax', price: 150000 }, status: 'Pending', createdTime: 'Hôm nay, 09:15 AM via Mobile App', paymentMethod: null, pointsRedeemed: 0, discount: 0, finalAmount: 150000, estimatedDuration: 25, source: 'APP', paymentStatus: 'UNPAID' },
          { id: 'AW-9819', slotTime: '14:00', custId: 'C-04', vehicle: { type: 'Xe máy', model: 'Honda Vision', plate: '59-S2 123.45' }, service: { name: 'Basic Wash', price: 70000 }, status: 'Pending', createdTime: 'Hôm nay, 11:30 AM via Mobile App', paymentMethod: null, pointsRedeemed: 0, discount: 0, finalAmount: 70000, note: 'Khách đến muộn 15 phút', estimatedDuration: 15, source: 'APP', paymentStatus: 'UNPAID' },
          { id: 'AW-9815', slotTime: '13:45', custId: 'C-02', vehicle: { type: 'Xe máy', model: 'Vespa GTS', plate: '30-K3 999.01' }, service: { name: 'Full Detail', price: 450000 }, status: 'Completed', createdTime: 'Hôm nay, 08:45 AM via Mobile App', paymentMethod: 'Cash', pointsRedeemed: 200, discount: 200000, finalAmount: 250000, completedTime: '14:30 PM', estimatedDuration: 40, source: 'APP', paymentStatus: 'PAID' },
          { id: 'AW-9812', slotTime: '13:15', custId: 'C-03', vehicle: { type: 'Xe máy', model: 'Vespa Primavera', plate: '29-F1 112.23' }, service: { name: 'Engine Clean', price: 200000 }, status: 'Completed', createdTime: 'Hôm nay, 07:10 AM via Mobile App', paymentMethod: 'VNPay', pointsRedeemed: 0, discount: 0, finalAmount: 200000, completedTime: '14:02 PM', estimatedDuration: 30, source: 'APP', paymentStatus: 'PAID' }
        ],
        '2026-07-02': [
          { id: 'AW-9830', slotTime: '09:00', custId: 'C-03', vehicle: { type: 'Xe máy', model: 'Honda Winner X', plate: '29-S1 222.11' }, service: { name: 'Premium Wash + Wax', price: 150000 }, status: 'Pending', createdTime: 'Hôm nay, 14:20 PM via Mobile App', paymentMethod: null, pointsRedeemed: 0, discount: 0, finalAmount: 150000, estimatedDuration: 25, source: 'APP', paymentStatus: 'UNPAID' }
        ],
        '2026-07-03': [
          { id: 'AW-9840', slotTime: '15:30', custId: 'C-02', vehicle: { type: 'Xe máy', model: 'Suzuki Raider', plate: '59-S3 888.88' }, service: { name: 'Full Detail', price: 450000 }, status: 'Pending', createdTime: 'Hôm nay, 16:10 PM via Mobile App', paymentMethod: null, pointsRedeemed: 0, discount: 0, finalAmount: 450000, estimatedDuration: 40, source: 'APP', paymentStatus: 'UNPAID' }
        ]
      };
      localStorage.setItem('autowash_bookings', JSON.stringify(initialBookings));
    }
  }, []);
  // Hàm lấy ngày hôm nay theo giờ địa phương, tránh lỗi lệch múi giờ
  const getLocalDateString = (date = new Date()) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

  // 2. Load data from localStorage

  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());;
  const [bookingsDb, setBookingsDb] = useState({});
  const [customersDb, setCustomersDb] = useState([]);
  const [loyaltySettings, setLoyaltySettings] = useState({});
  const [tierMatrix, setTierMatrix] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [activeMainTab, setActiveMainTab] = useState('queue'); // 'queue' vs 'history'
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [queueSubFilter, setQueueSubFilter] = useState('ALL_QUEUE'); // 'ALL_QUEUE', 'Pending', 'Paid'
  const [historySubFilter, setHistorySubFilter] = useState('ALL_HISTORY'); // 'ALL_HISTORY', 'Completed', 'Canceled'
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('');
  const [qrCodeModalBooking, setQrCodeModalBooking] = useState(null);
  const [momoQrUrl, setMomoQrUrl] = useState(null);
  const [momoActiveBookingId, setMomoActiveBookingId] = useState(null);
    const loadDataFromStorage = () => {
    const bookings = JSON.parse(localStorage.getItem('autowash_bookings') || '{}');
    const customers = JSON.parse(localStorage.getItem('autowash_customers') || '[]');
    const settings = JSON.parse(localStorage.getItem('autowash_loyalty_settings') || '{}');
    const tiers = JSON.parse(localStorage.getItem('autowash_tiers') || '[]');

    setBookingsDb(bookings);
    setCustomersDb(customers);
    setLoyaltySettings(settings);
    setTierMatrix(tiers);
  };

  // useEffect(() => {
  //   loadDataFromStorage();
  //   const fetchApiBookings = async () => {
  //     try {
  //       let apiList;
  //       if (searchQuery.trim() !== '') {
  //         apiList = await bookingAdminApi.searchBookings(searchQuery, selectedDate);
  //       } else {
  //         apiList = await bookingAdminApi.getBookings(selectedDate);
  //       }
  //       if (apiList) {
  //         setBookingsDb(prev => ({
  //           ...prev,
  //           [selectedDate]: apiList
  //         }));
  //       }
  //     } catch (err) {
  //       console.error('Failed to fetch bookings from API:', err);
  //     }
  //   };
  //   fetchApiBookings();

  //   // Listen for custom storage events to synchronize screens
  //   window.addEventListener('storage', loadDataFromStorage);
  //   return () => window.removeEventListener('storage', loadDataFromStorage);
  // }, [selectedDate, searchQuery]);
  useEffect(() => {
  // 1. Mỗi khi đổi ngày hoặc search, tải lại bản chuẩn từ localStorage trước
  const bookings = JSON.parse(localStorage.getItem('autowash_bookings') || '{}');
  const customers = JSON.parse(localStorage.getItem('autowash_customers') || '[]');
  const settings = JSON.parse(localStorage.getItem('autowash_loyalty_settings') || '{}');
  const tiers = JSON.parse(localStorage.getItem('autowash_tiers') || '[]');

  // Đặt lại data đồng bộ ban đầu
  setCustomersDb(customers);
  setLoyaltySettings(settings);
  setTierMatrix(tiers);

  // Tạo một biến flag để hủy các request API cũ nếu người dùng bấm đổi ngày liên tục
  let isCurrentRequest = true;

  const fetchApiBookings = async () => {
    try {
      let apiList = null;
      if (searchQuery.trim() !== '') {
        apiList = await bookingAdminApi.searchBookings(searchQuery, selectedDate);
      } else {
        apiList = await bookingAdminApi.getBookings(selectedDate);
      }

      // Chỉ cập nhật nếu đây là request cuối cùng (tránh lỗi bấm nhanh bị đơ/loạn)
      if (isCurrentRequest && apiList) {
        // Dùng Map để lọc sạch mọi phần tử trùng ID trong mảng trả về từ API
        const uniqueApiList = Array.from(new Map(apiList.map(item => [item.id, item])).values());
        
        setBookingsDb({
          ...bookings,          // Dữ liệu gốc từ localStorage
          [selectedDate]: uniqueApiList // Ghi đè chính xác dữ liệu sạch của ngày này
        });
      }
    } catch (err) {
      console.error('Failed to fetch bookings from API:', err);
      if (isCurrentRequest) {
        setBookingsDb(bookings); // Fallback về localStorage nếu lỗi mạng/API
      }
    }
  };

  fetchApiBookings();

  // Cleanup function: Khi selectedDate đổi tiếp, request phía trên sẽ bị bỏ qua
  return () => {
    isCurrentRequest = false;
  };
}, [selectedDate, searchQuery]);

  // Dates available in day selector
  const availableDates = [
    { value: '2026-06-30', label: 'Thứ 3, 30/06', desc: 'Hôm qua' },
    { value: '2026-07-01', label: 'Thứ 4, 01/07', desc: 'Hôm nay' },
    { value: '2026-07-02', label: 'Thứ 5, 02/07', desc: 'Ngày mai' },
    { value: '2026-07-03', label: 'Thứ 6, 03/07', desc: 'Sắp tới' }
  ];

  // Capacity Load Heatmap data for different dates
  const heatmapDb = {
    '2026-06-30': [
      { time: '08:00', pct: 60 }, { time: '09:00', pct: 85 }, { time: '10:00', pct: 98 }, { time: '11:00', pct: 50 },
      { time: '12:00', pct: 20 }, { time: '13:00', pct: 30 }, { time: '14:00', pct: 65 }, { time: '15:00', pct: 75 },
      { time: '16:00', pct: 90 }, { time: '17:00', pct: 40 }, { time: '18:00', pct: 10 }, { time: '19:00', pct: 0 }
    ],
    '2026-07-01': [
      { time: '08:00', pct: 20 }, { time: '09:00', pct: 35 }, { time: '10:00', pct: 60 }, { time: '11:00', pct: 75 },
      { time: '12:00', pct: 90 }, { time: '13:00', pct: 65 }, { time: '14:00', pct: 85 }, { time: '15:00', pct: 98 },
      { time: '16:00', pct: 92 }, { time: '17:00', pct: 78 }, { time: '18:00', pct: 30 }, { time: '19:00', pct: 10 }
    ],
    '2026-07-02': [
      { time: '08:00', pct: 10 }, { time: '09:00', pct: 50 }, { time: '10:00', pct: 40 }, { time: '11:00', pct: 60 },
      { time: '12:00', pct: 75 }, { time: '13:00', pct: 20 }, { time: '14:00', pct: 30 }, { time: '15:00', pct: 45 },
      { time: '16:00', pct: 50 }, { time: '17:00', pct: 35 }, { time: '18:00', pct: 20 }, { time: '19:00', pct: 0 }
    ],
    '2026-07-03': [
      { time: '08:00', pct: 0 }, { time: '09:00', pct: 10 }, { time: '10:00', pct: 20 }, { time: '11:00', pct: 30 },
      { time: '12:00', pct: 40 }, { time: '13:00', pct: 15 }, { time: '14:00', pct: 20 }, { time: '15:00', pct: 60 },
      { time: '16:00', pct: 40 }, { time: '17:00', pct: 20 }, { time: '18:00', pct: 10 }, { time: '19:00', pct: 0 }
    ]
  };

  // 3. UI Active States

  // Slot locks state for Daily Availability Monitor
  const [slotLocks, setSlotLocks] = useState(() => {
    const saved = localStorage.getItem('autowash_slot_locks');
    return saved ? JSON.parse(saved) : {
      '2026-07-01_SL-02': 1 // Default mock lock for SL-02 (09:00 - 10:00) on 2026-07-01 to match screenshots
    };
  });

  // Sync occupancy locks with backend on date changes
  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        const monitorList = await bookingAdminApi.getOccupancyMonitor(selectedDate);
        if (monitorList) {
          const newLocks = { ...slotLocks };
          monitorList.forEach(m => {
            const lockKey = `${selectedDate}_${m.slotId}`;
            newLocks[lockKey] = m.lockedCount;
          });
          setSlotLocks(newLocks);
        }
      } catch (err) {
        console.warn('Failed to fetch occupancy monitor from API:', err.message);
      }
    };
    fetchOccupancy();
  }, [selectedDate]);

  const adjustLock = async (slotId, delta) => {
    try {
      const response = await bookingAdminApi.adjustLock(slotId, selectedDate, delta);
      const lockKey = `${selectedDate}_${slotId}`;
      setSlotLocks(prev => ({
        ...prev,
        [lockKey]: response.lockedCount
      }));
    } catch (err) {
      console.warn('API adjustLock error, falling back to localStorage:', err.message);
      const lockKey = `${selectedDate}_${slotId}`;
      const current = slotLocks[lockKey] || 0;
      const newLocks = {
        ...slotLocks,
        [lockKey]: Math.max(0, current + delta)
      };
      setSlotLocks(newLocks);
      localStorage.setItem('autowash_slot_locks', JSON.stringify(newLocks));
    }
  };

  const isRestoreAllowed = (booking) => {
    if (!booking) return false;
    const statusLower = (booking.status || '').toLowerCase();
    if (statusLower !== 'canceled' && statusLower !== 'cancelled_no_show') return false;
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (booking.bookingDate !== todayStr) return false;
    
    if (!booking.endTime) return false;
    
    const [endHour, endMin] = booking.endTime.split(':').map(Number);
    const end = new Date();
    end.setHours(endHour, endMin, 0, 0);
    
    return new Date() <= end;
  };

  const handleCheckinLate = async (bookingId) => {
    try {
      await bookingAdminApi.checkinLate(bookingId);
      alert("Khôi phục và Check-in trễ thành công!");
      // Reload bookings list
      setSelectedDate(selectedDate);
      setViewMode('list');
    } catch (err) {
      alert("Lỗi check-in trễ: " + (err.response?.data?.message || err.message));
    }
  };

  const handlePrevDate = () => {
  if (!selectedDate) return;
  const currentDate = new Date(selectedDate);
  currentDate.setDate(currentDate.getDate() - 1); // Trừ đi 1 ngày
  
  // Format lại thành định dạng YYYY-MM-DD để set state
  const yyyy = currentDate.getFullYear();
  const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
  const dd = String(currentDate.getDate()).padStart(2, '0');
  
  setSelectedDate(`${yyyy}-${mm}-${dd}`);
  setSelectedTimeFilter('');
};

  const handleNextDate = () => {
  if (!selectedDate) return;
  const currentDate = new Date(selectedDate);
  currentDate.setDate(currentDate.getDate() + 1); // Cộng thêm 1 ngày
  
  // Format lại thành định dạng YYYY-MM-DD để set state
  const yyyy = currentDate.getFullYear();
  const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
  const dd = String(currentDate.getDate()).padStart(2, '0');
  
  setSelectedDate(`${yyyy}-${mm}-${dd}`);
  setSelectedTimeFilter('');
};

  const getSelectedDateLabel = () => {
  if (!selectedDate) return '';

  const targetDate = new Date(selectedDate);
  // Reset giờ về 00:00:00 để so sánh ngày chính xác không bị lệch múi giờ
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Tính khoảng cách ngày
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // Xác định nhãn mô tả (Desc)
  let desc = '';
  if (diffDays === 0) {
    desc = 'Today';
  } else if (diffDays === -1) {
    desc = 'Yesterday';
  } else if (diffDays === 1) {
    desc = 'Tomorrow';
  } else {
    // Nếu là ngày khác, lấy tên Thứ viết tắt tiếng Anh (e.g., Mon, Tue,...)
    desc = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
  }

  // Lấy tên Tháng viết tắt (e.g., Jan, Feb, Jul,...) và Ngày

  return `${desc}`;
};

  const getSlotsData = () => {
    const rawSlots = localStorage.getItem('autowash_slots');
    if (rawSlots) {
      try {
        return JSON.parse(rawSlots);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'SL-01', time: '08:00 - 09:00', maxCapacity: 8, isActive: true },
      { id: 'SL-02', time: '09:00 - 10:00', maxCapacity: 8, isActive: true },
      { id: 'SL-03', time: '10:00 - 11:00', maxCapacity: 8, isActive: true },
      { id: 'SL-04', time: '11:00 - 12:00', maxCapacity: 8, isActive: false },
      { id: 'SL-05', time: '12:00 - 13:00', maxCapacity: 8, isActive: true },
      { id: 'SL-06', time: '13:00 - 14:00', maxCapacity: 8, isActive: true },
      { id: 'SL-07', time: '14:00 - 15:00', maxCapacity: 8, isActive: true },
      { id: 'SL-08', time: '15:00 - 16:00', maxCapacity: 8, isActive: true },
      { id: 'SL-09', time: '16:00 - 17:00', maxCapacity: 8, isActive: true },
      { id: 'SL-10', time: '17:00 - 18:00', maxCapacity: 8, isActive: true },
      { id: 'SL-11', time: '18:00 - 19:00', maxCapacity: 8, isActive: true }
    ];
  };

  const getBookedCount = (slotTimeStr) => {
    const startHour = slotTimeStr.split(':')[0].trim();
    return bookingsForDate.filter(b => {
      if (!b.slotTime) return false;
      const bHour = b.slotTime.split(':')[0].padStart(2, '0');
      return bHour === startHour.padStart(2, '0') && b.status !== 'Canceled';
    }).length;
  };

  const renderProgressBar = (booked, locked, capacity) => {
    if (capacity === 0) {
      return <div className="w-full h-2 bg-slate-100 rounded-full" />;
    }
    const bookedPct = Math.min(100, (booked / capacity) * 100);
    const lockedPct = Math.min(100 - bookedPct, (locked / capacity) * 100);
    
    const bookedColorClass = booked + locked >= capacity ? 'bg-emerald-500' : 'bg-sky-600';
    
    return (
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
        <div 
          style={{ width: `${bookedPct}%` }} 
          className={`h-full ${bookedColorClass} transition-all duration-300`} 
        />
        <div 
          style={{ width: `${lockedPct}%` }} 
          className="h-full bg-amber-500 transition-all duration-300" 
        />
      </div>
    );
  };

  // Extract bookings for today and map customer details from customersDb
  // Lấy danh sách toàn bộ các lịch dọn từ tất cả các ngày (Tìm kiếm chéo ngày E2E)
  // 1. Tạo bản đồ danh sách booking sạch, loại bỏ hoàn toàn trùng lặp ID toàn cục
const getAllBookings = () => {
  const allMap = new Map();

  Object.keys(bookingsDb).forEach((dateKey) => {
    const list = bookingsDb[dateKey] || [];
    list.forEach((b) => {
      if (!b) return;

      const normalizedBooking = {
        ...b,
        id: b.id || b.bookingCode || `API-${dateKey}-${Math.random().toString(36).slice(2, 8)}`,
        bookingDate: b.bookingDate || dateKey,
        slotTime: b.slotTime || (() => {
          const startTime = b.startTime || {};
          const hour = String(startTime.hour ?? '').padStart(2, '0');
          const minute = String(startTime.minute ?? '').padStart(2, '0');
          return hour && minute ? `${hour}:${minute}` : '';
        })(),
        customer: {
          ...(b.customer || {}),
          name: b.customer?.name || b.customerName || 'Khách hàng vãng lai',
          phone: b.customer?.phone || b.customerPhone || '',
          tier: b.customer?.tier || 'Member',
          points: b.customer?.points || 0,
          avatar: b.customer?.avatar || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100'
        },
        vehicle: {
          ...(b.vehicle || {}),
          model: b.vehicle?.model || b.model || 'N/A',
          plate: b.vehicle?.plate || b.licensePlate || 'N/A'
        },
        service: {
          ...(b.service || {}),
          name: b.service?.name || b.items?.[0]?.serviceNameSnapshot || 'N/A'
        },
        finalAmount: Number(b.finalAmount ?? b.service?.price ?? 0),
        source: b.source || 'API',
        status: (() => {
          const normalizedStatus = String(b.status || '').toUpperCase();
          if (normalizedStatus === 'PENDING') return 'Pending';
          if (normalizedStatus === 'COMPLETED') return 'Completed';
          if (normalizedStatus === 'CANCELED' || normalizedStatus === 'CANCELLED') return 'Canceled';
          return b.status || 'Pending';
        })(),
        custId: b.custId || b.customerId || b.customer?.id || b.id || `API-${dateKey}`
      };

      if (normalizedBooking.id) {
        allMap.set(normalizedBooking.id, normalizedBooking);
      }
    });
  });

  return Array.from(allMap.values());
};

const allBookingsMapped = getAllBookings().map((b) => {
  const customerMatch = customersDb.find((c) => c.id === b.custId) || customersDb.find((c) => c.name === b.customer?.name);
  const customer = customerMatch || {
    name: b.customer?.name || 'Khách hàng vãng lai',
    phone: b.customer?.phone || '',
    tier: 'Member',
    points: 0,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100'
  };

  const displayPhone = customer.phone || b.customer?.phone || '';

  return {
    ...b,
    customer: {
      ...customer,
      ...b.customer,
      name: b.customer?.name || customer.name,
      phone: b.customer?.phone || customer.phone,
      displayPhone,
      avatar: customer.avatar || b.customer?.avatar || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100'
    }

// Nguồn dữ liệu hiển thị (Đồng bộ theo ngày đang được chọn)
const activeBookingsSource = bookingsForDate;
  const heatmapForDate = heatmapDb[selectedDate] || [];
  const selectedBooking = allBookingsMapped.find(b => b.id === selectedBookingId) || null;

  // States inside checkout detail view
  const [selectedVoucherCode, setSelectedVoucherCode] = useState('');
  const [customerVouchers, setCustomerVouchers] = useState([]);
  const [tempPaymentMethod, setTempPaymentMethod] = useState('Cash');
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [successModalData, setSuccessModalData] = useState(null);

  // Load dynamic rates from Settings
  const baseSpendToEarnPoint = loyaltySettings.baseSpend || 10000;
  const basePointsToEarn = loyaltySettings.basePoints || 1;
  const pointsToCashMultiplier = loyaltySettings.pointCashValuePts && loyaltySettings.pointCashValueVnd
    ? (loyaltySettings.pointCashValueVnd / loyaltySettings.pointCashValuePts)
    : 1000;

  // Load active customer vouchers on selection
  useEffect(() => {
    if (selectedBooking && selectedBooking.customer) {
      const vchs = JSON.parse(localStorage.getItem('autowash_vouchers') || '{}');
      const wallet = vchs[selectedBooking.customer.id] || [];
      setCustomerVouchers(wallet.filter(v => v.status === 'ISSUED'));
      setSelectedVoucherCode('');
    } else {
      setCustomerVouchers([]);
      setSelectedVoucherCode('');
    }
  }, [selectedBookingId]);

  // Helper to parse voucher discount
  const parseVoucherDiscount = (valueStr, totalAmount) => {
    if (!valueStr) return 0;
    if (typeof valueStr === 'number') {
      return valueStr > totalAmount ? totalAmount : valueStr;
    }
    const cleanVal = valueStr.toString().replace(/\s/g, '').replace(/\./g, '');
    if (cleanVal.includes('%')) {
      const pct = parseFloat(cleanVal.replace('%', ''));
      if (isNaN(pct)) return 0;
      return Math.round((totalAmount * pct) / 100);
    } else {
      const amt = parseFloat(cleanVal.replace(/[đđVNDvnd,]/g, ''));
      if (isNaN(amt)) return 0;
      return amt > totalAmount ? totalAmount : amt;
    }
  };

  const getLoyaltyProgressData = (newTier, newTotalSpend, tiers = tierMatrix) => {
    const sortedTiers = [...(tiers || [])].sort((a, b) => a.minSpend - b.minSpend);
    const tierByKey = Object.fromEntries((sortedTiers || []).map((tier) => [tier.key, tier]));

    const nextTargetByTier = {
      Member: tierByKey.Silver || { key: 'Silver', name: 'Silver', minSpend: 1000000 },
      Silver: tierByKey.Gold || { key: 'Gold', name: 'Gold', minSpend: 5000000 },
      Gold: tierByKey.Platinum || { key: 'Platinum', name: 'Platinum', minSpend: 10000000 }
    };

    if (newTier === 'Platinum') {
      return {
        isMax: true,
        percent: 100,
        remaining: 0,
        targetName: 'Platinum',
        description: 'Maximum Rank Achieved'
      };
    }

    const targetTier = nextTargetByTier[newTier];
    if (!targetTier) {
      return {
        isMax: false,
        percent: 0,
        remaining: 0,
        targetName: 'Silver',
        description: 'Need 0 more VND to reach Silver'
      };
    }

    const targetSpend = Math.max(targetTier.minSpend || 0, 0);
    const remaining = Math.max(0, targetSpend - newTotalSpend);
    const percent = Math.min(100, Math.max(0, Math.round((newTotalSpend / (targetSpend || 1)) * 100)));

    return {
      isMax: false,
      percent,
      remaining,
      targetName: targetTier.name || targetTier.key,
      description: `Need ${remaining.toLocaleString('vi-VN')} more VND to reach ${targetTier.name || targetTier.key}`
    };
  };

  const selectedVoucher = customerVouchers.find(v => v.code === selectedVoucherCode) || null;
  const discountAmount = selectedVoucher ? parseVoucherDiscount(selectedVoucher.value, selectedBooking?.service?.price || 0) : 0;
  const finalAmount = Math.max(0, (selectedBooking?.service?.price || 0) - discountAmount);

  // View transition helpers
  const handleOpenDetail = (booking) => {
    setSelectedBookingId(booking.id);
    setTempPaymentMethod(booking.paymentMethod || 'Cash');
    setCancelReasonText('');
    setIsCanceling(false);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
  };

  // Helper: Save booking to localStorage database
  const saveBookingToDb = (updatedBooking) => {
    const allBookings = { ...bookingsDb };
    const dateKey = updatedBooking.bookingDate || selectedDate;
    if (allBookings[dateKey]) {
      allBookings[dateKey] = allBookings[dateKey].map(b => {
        if (b.id === updatedBooking.id) {
          // Strip the transient mapped customer object to prevent database redundancy
          const { customer, bookingDate, ...rest } = updatedBooking;
          return rest;
        }
        return b;
      });
      localStorage.setItem('autowash_bookings', JSON.stringify(allBookings));
      setBookingsDb(allBookings);
    }
  };

  // Action: Confirm Payment & Complete Wash (Combined Check-in & Point Accumulation)
  const handleConfirmPayment = async () => {
    if (!selectedBooking) return;

    const bookingId = selectedBooking.bookingId || selectedBooking.id;

    try {
      await bookingAdminApi.checkoutBooking(bookingId, {
        bookingId,
        paymentMethod: tempPaymentMethod === 'VNPay' ? 'BANK_TRANSFER' : tempPaymentMethod.toUpperCase(),
        voucherCode: selectedVoucherCode || null,
        notes: selectedBooking.notes
      });

      alert(`Thanh toán & hoàn tất đơn dọn xe thành công!`);
    } catch (err) {
      console.warn('API checkout error, falling back to localStorage:', err.message);
    }

    // Load tier multipliers dynamically
    const customerTier = selectedBooking.customer.tier;
    const currentTierConfig = tierMatrix.find((t) => t.key === customerTier) || { pointMultiplier: 1.0 };
    const tierMultiplier = currentTierConfig.pointMultiplier || 1.0;

    // Spring Boot Logic: Points Earned = floor(final_amount / baseSpend) x basePoints x Tier Multiplier
    const pointsEarned = Math.floor(finalAmount / baseSpendToEarnPoint) * basePointsToEarn * tierMultiplier;

    // Update customer in database (visits + 1, spend + finalAmount, points + earned)
    let alertUpgradeMessage = '';
    let updatedCustomerSnapshot = null;

    const updatedCustomers = customersDb.map((c) => {
      if (c.id === selectedBooking.customer.id) {
        const newVisits = c.visits + 1;
        const newSpend = c.totalSpend + finalAmount;
        const newPoints = c.points + pointsEarned;

        // Evaluate upgrade: Scan tier matrix from Platinum -> Gold -> Silver -> Member
        let nextTier = c.tier;
        const sortedTiers = [...tierMatrix].sort((a, b) => b.minSpend - a.minSpend);
        for (let t of sortedTiers) {
          if (newSpend >= t.minSpend) {
            nextTier = t.key;
            break;
          }
        }

        if (nextTier !== c.tier) {
          alertUpgradeMessage = `\n\n🎉 CHÚC MỪNG: Khách hàng ${c.name} đã được thăng hạng từ ${c.tier} lên ${nextTier} thành công do đạt mốc chi tiêu ${newSpend.toLocaleString('vi-VN')} đ!`;
        }

        updatedCustomerSnapshot = {
          ...c,
          visits: newVisits,
          totalSpend: newSpend,
          points: newPoints,
          tier: nextTier
        };

        return updatedCustomerSnapshot;
      }
      return c;
    });

    // Update voucher status to USED if a voucher was applied
    if (selectedVoucherCode) {
      const allVouchers = JSON.parse(localStorage.getItem('autowash_vouchers') || '{}');
      const customerWallet = allVouchers[selectedBooking.customer.id] || [];
      const updatedWallet = customerWallet.map((v) => {
        if (v.code === selectedVoucherCode && v.status === 'ISSUED') {
          return { ...v, status: 'USED' };
        }
        return v;
      });
      allVouchers[selectedBooking.customer.id] = updatedWallet;
      localStorage.setItem('autowash_vouchers', JSON.stringify(allVouchers));
    }

    localStorage.setItem('autowash_customers', JSON.stringify(updatedCustomers));
    setCustomersDb(updatedCustomers);

    // Insert Log logs (EARN)
    const pointsLog = JSON.parse(localStorage.getItem('autowash_points_log') || '{}');
    const log = pointsLog[selectedBooking.customer.id] || [];
    let updatedLog = [...log];

    if (pointsEarned > 0) {
      updatedLog = [
        { date: 'Vừa xong', type: 'EARN', amount: pointsEarned, reason: `Tích điểm đơn dọn xe ${selectedBooking.id}` },
        ...updatedLog
      ];
    }
    pointsLog[selectedBooking.customer.id] = updatedLog;
    localStorage.setItem('autowash_points_log', JSON.stringify(pointsLog));

    const updatedBooking = {
      ...selectedBooking,
      status: 'Completed',
      paymentMethod: tempPaymentMethod,
      pointsRedeemed: 0,
      voucherApplied: selectedVoucherCode || null,
      discount: discountAmount,
      finalAmount,
      paymentStatus: 'PAID',
      completedTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    saveBookingToDb(updatedBooking);

    const customerAfterCheckout = updatedCustomerSnapshot || {
      ...selectedBooking.customer,
      totalSpend: selectedBooking.customer.totalSpend + finalAmount,
      tier: selectedBooking.customer.tier
    };

    setSuccessModalData({
      finalAmount,
      pointsEarned,
      totalPoints: customerAfterCheckout.points,
      customer: customerAfterCheckout,
      alertUpgradeMessage,
      loyaltyProgress: getLoyaltyProgressData(customerAfterCheckout.tier, customerAfterCheckout.totalSpend, tierMatrix)
    });
    setShowSuccessModal(true);
    setSelectedDate(selectedDate);
    setViewMode('list');
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessModalData(null);
    setViewMode('list');
  };

  // Action: Cancel
  const handleCancelBooking = (e) => {
    e.preventDefault();
    if (!cancelReasonText.trim()) {
      alert('Vui lòng nhập lý do hủy lịch!');
      return;
    }

    const updatedBooking = {
      ...selectedBooking,
      status: 'Canceled',
      cancelReason: cancelReasonText,
      paymentStatus: 'UNPAID'
    };

    saveBookingToDb(updatedBooking);
    alert(`Đã hủy lịch đặt đơn ${selectedBooking.id} thành công.`);
    setIsCanceling(false);
    setCancelReasonText('');
    setViewMode('list');
  };

  // Filter Bookings logic (E2E Toàn Cục hỗ trợ tìm kiếm chéo ngày)
  const filteredBookings = activeBookingsSource.filter(b => {
    const matchesSearch = 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer.phone.includes(searchQuery) ||
      (b.customer.displayPhone && b.customer.displayPhone.includes(searchQuery)) ||
      b.vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTime = !selectedTimeFilter || b.slotTime.startsWith(selectedTimeFilter.split(':')[0]);

    if (!matchesSearch || !matchesTime) return false;

    if (activeMainTab === 'queue') {
      if (b.status !== 'Pending') return false;
    } else {
      if (b.status !== 'Completed' && b.status !== 'Canceled') return false;
      if (historySubFilter === 'Completed' && b.status !== 'Completed') return false;
      if (historySubFilter === 'Canceled' && b.status !== 'Canceled') return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#f7fafd] text-slate-800 p-5 overflow-hidden">
      
      {/* ========================================================= */}
      {/* 1. VIEW MODE: LIST                                        */}
      {/* ========================================================= */}
      {viewMode === 'list' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-slate-800 tracking-tight font-outfit">Today's Bookings</h2>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] rounded-lg font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Khách tự đặt lịch qua App. Quầy không tạo đơn thủ công và không có luồng khoang rửa.</span>
              </div>
            </div>
            
            {/* Date selector */}
            {/* <div className="flex items-center gap-2.5 bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 shadow-sm">
              <span className="text-xs font-black text-slate-500">Chọn ngày dọn xe:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={e => {
                  setSelectedDate(e.target.value);
                  setSelectedTimeFilter('');
                }}
                className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
              />
            </div> */}
          </div>

          {/* Main Content Layout Grid */}
          <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-hidden">
            
            {/* Left: Bookings List Card */}
            <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col min-h-0 overflow-hidden">
            
            {/* Header / Tabs */}
            <div className="p-3 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between shrink-0 bg-slate-50/30">
              <div className="flex gap-2">
                <button
                  onClick={() => { setActiveMainTab('queue'); setSelectedTimeFilter(''); }}
                  className={`px-4.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                    activeMainTab === 'queue'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-55'
                  }`}
                >
                  <ClipboardList className="w-4.5 h-4.5" />
                  Hàng chờ Vận hành ({bookingsForDate.filter(b => b.status === 'Pending').length})
                </button>
                <button
                  onClick={() => { setActiveMainTab('history'); setSelectedTimeFilter(''); }}
                  className={`px-4.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                    activeMainTab === 'history'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-55'
                  }`}
                >
                  <History className="w-4.5 h-4.5" />
                  Lịch sử Giao dịch ({bookingsForDate.filter(b => b.status === 'Completed' || b.status === 'Canceled').length})
                </button>
              </div>

              {/* Sub filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
                {activeMainTab === 'queue' ? (
                  <div className="text-[10px] font-bold text-slate-400 px-2.5">
                    Hàng chờ thanh toán tại quầy
                  </div>
                ) : (
                  <div className="bg-[#f7fafd] border border-slate-200/80 rounded-xl p-1 flex gap-1 text-[11px] text-slate-500 w-full sm:w-auto">
                    {[
                      { key: 'ALL_HISTORY', label: 'Tất cả lịch sử' },
                      { key: 'Completed', label: 'Đã hoàn thành' },
                      { key: 'Canceled', label: 'Đã hủy đơn' }
                    ].map(sub => (
                      <button
                        key={sub.key}
                        onClick={() => setHistorySubFilter(sub.key)}
                        className={`px-3 py-1 rounded-lg text-center font-bold transition-all cursor-pointer ${
                          historySubFilter === sub.key 
                            ? 'bg-white text-slate-950 shadow-sm border border-slate-200/40' 
                            : 'hover:text-slate-800'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm biển số, khách hàng..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 placeholder:text-slate-450 focus:outline-none focus:ring-2 focus:ring-indigo-650/10 focus:border-indigo-650 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                  <ClipboardList className="w-10 h-10 text-slate-300" />
                  <p className="text-xs font-bold">Không tìm thấy lịch đặt nào trong danh sách này</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider z-10">
                    <tr>
                      <th className="py-3 px-5">Mã đơn / QR</th>
                      <th className="py-3 px-3">Giờ hẹn</th>
                      <th className="py-3 px-3">Khách hàng & SĐT</th>
                      <th className="py-3 px-3">Xe máy & Biển số</th>
                      <th className="py-3 px-3">Gói dịch vụ</th>
                      <th className="py-3 px-3 text-right">Tổng tiền</th>
                      <th className="py-3 px-4 text-center">Nguồn</th>
                      <th className="py-3 px-5 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredBookings.map(b => {
                      let statusBadge = '';
                      if (b.status === 'Completed') {
                        statusBadge = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                      } else if (b.status === 'Paid') {
                        statusBadge = 'bg-blue-50 text-blue-600 border-blue-100';
                      } else if (b.status === 'Pending') {
                        statusBadge = 'bg-amber-50 text-amber-600 border-amber-100';
                      } else {
                        statusBadge = 'bg-slate-100 text-slate-500 border-slate-200';
                      }

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-5 font-black text-slate-800">
                            <div className="flex items-center gap-1.5">
                              <span>{b.id}</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setQrCodeModalBooking(b); }}
                                className="p-1 hover:bg-slate-100 rounded text-indigo-650"
                                title="Xem mã QR quét check-in"
                              >
                                <QrCode className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex flex-col">
                              <span className="flex items-center gap-1 font-bold text-slate-650">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {b.slotTime}
                                {b.note && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-bold rounded">Trễ</span>}
                              </span>
                              <span className="text-[9px] text-slate-400 font-extrabold mt-0.5">{b.bookingDate}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <img src={b.customer.avatar} alt="Avatar" className="w-6.5 h-6.5 rounded-full object-cover ring-1 ring-slate-200" />
                              <div className="flex flex-col">
                                <span className="font-extrabold text-slate-700 flex items-center gap-1">
                                  {b.customer.name}
                                  <span className="px-1.5 py-0.2 bg-[#57f287] text-slate-800 text-[7px] font-black rounded">{b.customer.tier}</span>
                                </span>
                                <span className="text-[9px] text-slate-400 font-semibold">{b.customer.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <Bike className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-bold text-slate-750">{b.vehicle.model}</span>
                              <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[9px] font-black rounded-lg">{b.vehicle.plate}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{b.service.name}</span>
                              <span className="text-[9px] text-slate-400 font-semibold">Thời lượng: {b.estimatedDuration} phút</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right font-black text-slate-800">
                            {b.finalAmount.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] font-black rounded">{b.source}</span>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`inline-block px-2.5 py-1 rounded-full border text-[9px] font-bold ${statusBadge}`}>
                                {b.status === 'Pending' ? 'Chờ Check-in' :
                                 b.status === 'Paid' ? 'Đang rửa' :
                                 b.status === 'Completed' ? 'Đã xong' : 'Đã hủy'}
                              </span>
                              <button 
                                onClick={() => handleOpenDetail(b)}
                                className="px-3 py-1 bg-[#0047AB] hover:bg-[#003a8c] text-white text-[10px] font-extrabold rounded-lg shadow-sm flex items-center gap-0.5 cursor-pointer"
                              >
                                Xem chi tiết
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right: Daily Availability Monitor */}
          <div className="w-full lg:w-[420px] shrink-0 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col min-h-0 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                <span className="font-outfit tracking-tight">Chọn ngày giám sát</span>
              </div>
              
              {/* Date Navigator */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevDate}
                  className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-650 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{getSelectedDateLabel()}
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => {
                        setSelectedDate(e.target.value);
                        setSelectedTimeFilter('');
                      }}
                      className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
                    />
                  </span>
                </div>
                <button 
                  onClick={handleNextDate}
                  className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-650 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slots Table */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider z-10">
                  <tr>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Booked / Locked</th>
                    <th className="py-3 px-4">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {getSlotsData().map(slot => {
                    const booked = getBookedCount(slot.time);
                    const lockKey = `${selectedDate}_${slot.id}`;
                    const locked = slotLocks[lockKey] || 0;
                    const capacity = slot.isActive ? slot.maxCapacity : 0;
                    const remaining = Math.max(0, capacity - booked - locked);

                    return (
                      <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-650">
                          {slot.time}
                        </td>
                        <td className="py-3.5 px-4">
                          {slot.isActive ? (
                            <span className="font-semibold text-slate-700">{slot.maxCapacity}</span>
                          ) : (
                            <div className="flex items-center gap-1 text-rose-500 font-bold text-[10px]" title="Slot này đã bị tắt hoặc giảm công suất">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>0 (was {slot.maxCapacity})</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between group/lock">
                              <span className="font-bold">
                                <span className={booked > 0 ? (booked + locked >= capacity ? 'text-emerald-600' : 'text-sky-600') : 'text-slate-400'}>
                                  {booked}
                                </span>
                                <span className="text-slate-400 mx-1">/</span>
                                <span className={locked > 0 ? 'text-amber-500 font-bold' : 'text-slate-400'}>
                                  {locked}
                                </span>
                              </span>
                              
                              {slot.isActive && ['ADMIN', 'MANAGER', 'ROLE_ADMIN', 'ROLE_MANAGER'].includes((localStorage.getItem('role') || 'ADMIN').toUpperCase()) && (
                                <div className="opacity-0 group-hover/lock:opacity-100 flex items-center gap-1 transition-opacity">
                                  <button 
                                    onClick={() => adjustLock(slot.id, -1)}
                                    className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-655 cursor-pointer"
                                    title="Giảm slot khóa"
                                    disabled={locked <= 0}
                                  >
                                    -
                                  </button>
                                  <button 
                                    onClick={() => adjustLock(slot.id, 1)}
                                    className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-655 cursor-pointer"
                                    title="Tăng slot khóa"
                                    disabled={booked + locked >= capacity}
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                            {renderProgressBar(booked, locked, capacity)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {capacity === 0 ? (
                            <span className="text-slate-400 font-semibold">0</span>
                          ) : remaining === 0 ? (
                            <span className="text-slate-400 font-semibold">0</span>
                          ) : remaining <= 2 ? (
                            <span className="text-amber-500 font-black text-[13px]">{remaining}</span>
                          ) : (
                            <span className="text-slate-700 font-semibold">{remaining}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    )}

      {/* ========================================================= */}
      {/* 2. VIEW MODE: DETAIL                                      */}
      {/* ========================================================= */}
      {viewMode === 'detail' && selectedBooking && (
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Nguồn: {selectedBooking.source}</span>
              <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl">Mã đơn: {selectedBooking.id}</span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left column */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Customer card */}
                <div className="border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-4.5 h-4.5 text-indigo-500" />
                    Thông tin Khách hàng
                  </h3>
                  <div className="flex items-start gap-4">
                    <img src={selectedBooking.customer.avatar} alt="Customer" className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-50" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-800">{selectedBooking.customer.name}</span>
                        <span className="px-2.5 py-0.5 bg-[#57f287] text-slate-800 text-[10px] font-black rounded-lg">Hạng {selectedBooking.customer.tier}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">Số điện thoại: {selectedBooking.customer.phone}</p>
                      
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-600 mt-2.5">
                        <span className="text-amber-605 flex items-center gap-0.5 bg-amber-50 border border-amber-100/65 px-2.5 py-1 rounded-lg">
                          <Coins className="w-4 h-4 text-amber-500" /> Ví hiện tại: {selectedBooking.customer.points} Pts
                        </span>
                        <span className="text-indigo-650">Trị giá quy đổi: {(selectedBooking.customer.points * pointsToCashMultiplier).toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle card */}
                <div className="border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Bike className="w-4.5 h-4.5 text-indigo-500" />
                    Thông tin Phương tiện
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Hãng & Dòng xe</div>
                      <div className="font-extrabold text-slate-800 mt-1">{selectedBooking.vehicle.model}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl flex flex-col justify-between">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Biển số kiểm soát</div>
                      <div className="font-mono font-black text-indigo-700 text-sm mt-1">{selectedBooking.vehicle.plate}</div>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-4.5 h-4.5 text-indigo-500" />
                      Chi tiết Gói dịch vụ
                    </h3>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">
                      Dự kiến dọn: {selectedBooking.estimatedDuration} phút
                    </span>
                  </div>
                  
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-extrabold text-slate-800 text-sm">{selectedBooking.service.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">Thời gian đặt: {selectedBooking.createdTime}</div>
                      </div>
                      <span className="font-black text-slate-800 text-sm">{selectedBooking.service.price.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right column */}
              <div className="space-y-6">
                
                {/* Checkout / Payment box */}
                <div className="border border-slate-200/60 p-5 rounded-2xl shadow-md space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-4.5 h-4.5 text-indigo-500" />
                    Thanh toán & Trạng thái dịch vụ
                  </h3>

                  {/* Flow 1: Pending (Checkout) */}
                  {selectedBooking.status === 'Pending' && (
                    <div className="space-y-4 text-xs">
                      
                      {/* Áp dụng Voucher giảm giá tại quầy */}
                      <div className="bg-indigo-50/40 border border-indigo-100/60 p-3.5 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                          <span className="flex items-center gap-0.5 text-indigo-650 font-black"><Gift className="w-3.5 h-3.5 text-indigo-500" /> Khuyến mại & Ưu đãi tại quầy</span>
                          <span className="text-slate-400 font-bold">Điểm ví: {selectedBooking.customer.points} Pts</span>
                        </div>

                        {customerVouchers.length === 0 ? (
                          <div className="text-[10px] text-slate-400 italic bg-white border border-slate-150 p-2.5 rounded-lg">
                            Ví của khách hàng hiện chưa sở hữu Voucher khả dụng. Khách hàng cần đổi điểm Loyalty lấy voucher trước.
                          </div>
                        ) : (
                          <select
                            value={selectedVoucherCode}
                            onChange={(e) => setSelectedVoucherCode(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 outline-none font-bold text-slate-700 bg-white"
                          >
                            <option value="">-- Chọn Voucher áp dụng --</option>
                            {customerVouchers.map(v => {
                              return (
                                <option key={v.code} value={v.code}>
                                  [{v.code}] {v.name} ({v.value})
                                </option>
                              );
                            })}
                          </select>
                        )}
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Hình thức thanh toán</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setTempPaymentMethod('Cash')}
                            className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                              tempPaymentMethod === 'Cash' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            Tiền mặt
                          </button>
                        </div>
                      </div>

                      {/* Bill Summary */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between font-bold text-slate-600">
                          <span>Đơn giá gói chính:</span>
                          <span>{selectedBooking.service.price.toLocaleString('vi-VN')} đ</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between font-bold text-emerald-600">
                            <span>Voucher giảm giá ({selectedVoucherCode}):</span>
                            <span>-{discountAmount.toLocaleString('vi-VN')} đ</span>
                          </div>
                        )}
                        <div className="h-px bg-slate-250 my-2" />
                        <div className="flex justify-between font-black text-sm text-slate-800">
                          <span>Thành tiền thực thu:</span>
                          <span className="text-indigo-700">
                            {finalAmount.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleConfirmPayment}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                      >
                        <CheckCircle className="w-4.5 h-4.5" />
                        Xác nhận Thanh toán & Hoàn tất
                      </button>
                    </div>
                  )}

                  {/* Flow 3: Completed */}
                  {selectedBooking.status === 'Completed' && (
                    <div className="space-y-3.5 text-xs text-slate-655">
                      <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 p-4 rounded-xl space-y-1 text-center font-bold">
                        <div className="flex items-center justify-center gap-1.5 font-extrabold text-sm">
                          <Check className="w-4 h-4 text-white bg-emerald-650 rounded-full p-0.5" />
                          <span>Dịch vụ hoàn thành thành công</span>
                        </div>
                        <p className="text-[9px] text-emerald-600 font-medium">Lúc: {selectedBooking.completedTime}</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 font-bold">
                        <div className="flex justify-between">
                          <span>Thành tiền:</span>
                          <span>{selectedBooking.finalAmount.toLocaleString('vi-VN')} đ ({selectedBooking.paymentMethod === 'Cash' ? 'Tiền mặt' : 'VNPay QR'})</span>
                        </div>
                        <div className="flex justify-between text-emerald-600">
                          <span>Loyalty tích lũy:</span>
                          <span>+{Math.floor(selectedBooking.finalAmount / baseSpendToEarnPoint) * basePointsToEarn * (tierMatrix.find(t=>t.key===selectedBooking.customer.tier)?.pointMultiplier || 1.0)} Pts</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Flow 4: Canceled / No-Show */}
                  {((selectedBooking.status || '').toLowerCase() === 'canceled' || (selectedBooking.status || '').toLowerCase() === 'cancelled_no_show') && (
                    <div className="space-y-3 text-xs text-slate-600">
                      <div className="bg-rose-50 text-rose-700 border border-rose-100 p-4 rounded-xl text-center font-bold">
                        <span className="font-extrabold text-sm flex items-center justify-center gap-1"><Ban className="w-4 h-4" /> Lịch dọn đã hủy bỏ</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Lý do hủy đơn</div>
                        <p className="italic mt-1 leading-relaxed">{selectedBooking.cancelReason || 'Quá hạn thời gian slot (No-Show)'}</p>
                      </div>

                      {/* Restore and Check-in late button */}
                      {isRestoreAllowed(selectedBooking) && (
                        <button
                          onClick={() => handleCheckinLate(selectedBooking.id || selectedBooking.bookingId)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer font-outfit"
                        >
                          <Play className="w-4 h-4" />
                          Khôi phục & Check-in Trễ
                        </button>
                      )}
                    </div>
                  )}

                </div>

                {/* Timeline */}
                <div className="border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Trục thời gian đơn đặt</h4>
                  <div className="relative border-l border-slate-200 ml-2 pl-4.5 space-y-4 text-xs font-semibold text-slate-500">
                    <div className="relative">
                      <span className="absolute -left-7.5 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                      <div>
                        <h5 className="font-extrabold text-slate-800">Đặt lịch thành công (Mobile App)</h5>
                        <p className="text-[9px] text-slate-450 mt-0.5">{selectedBooking.createdTime}</p>
                      </div>
                    </div>

                    {selectedBooking.status === 'Completed' && (
                      <div className="relative">
                        <span className="absolute -left-7.5 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </span>
                        <div>
                          <h5 className="font-extrabold text-slate-800">Thanh toán thành công & Hoàn tất</h5>
                          <p className="text-[9px] text-slate-450 mt-0.5">Xong lúc {selectedBooking.completedTime} (Khung giờ: {selectedBooking.slotTime})</p>
                        </div>
                      </div>
                    )}

                    {selectedBooking.status === 'Canceled' && (
                      <div className="relative">
                        <span className="absolute -left-7.5 top-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-rose-50 flex items-center justify-center">
                          <Ban className="w-2.5 h-2.5 text-white" />
                        </span>
                        <div>
                          <h5 className="font-extrabold text-rose-600">Đã hủy đơn</h5>
                          <p className="text-[9px] text-slate-400 mt-0.5">Giải phóng khung giờ đặt lịch</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancel trigger */}
                {selectedBooking.status === 'Pending' && (
                  <div className="border border-rose-150 p-4 rounded-2xl bg-rose-50/10 space-y-3">
                    <div className="text-xs text-rose-700 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
                      <span>Hành động hủy lịch đặt</span>
                    </div>
                    
                    {!isCanceling ? (
                      <button
                        onClick={() => setIsCanceling(true)}
                        className="w-full bg-white hover:bg-rose-50 border border-rose-200 text-rose-750 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer text-center"
                      >
                        Yêu cầu Hủy lịch đặt
                      </button>
                    ) : (
                      <form onSubmit={handleCancelBooking} className="space-y-2 text-xs">
                        <label className="text-[10px] font-black text-rose-700 uppercase">Lý do hủy đơn *</label>
                        <input
                          type="text"
                          required
                          placeholder="Nhập lý do hủy..."
                          value={cancelReasonText}
                          onChange={e => setCancelReasonText(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                        <div className="flex gap-2 justify-end pt-1">
                          <button type="button" onClick={() => { setIsCanceling(false); setCancelReasonText(''); }} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded">Hủy</button>
                          <button type="submit" className="px-2.5 py-1 bg-rose-650 text-white text-[10px] font-bold rounded hover:bg-rose-700">Xác nhận Hủy</button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {qrCodeModalBooking && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <h3 className="font-extrabold text-slate-800">Quét mã check-in</h3>
            <p className="text-xs text-slate-400">Dùng thiết bị quét mã QR của khách để check-in.</p>
            <div className="w-48 h-48 bg-slate-105 border border-slate-200 rounded-xl mx-auto flex items-center justify-center relative overflow-hidden">
              <QrCode className="w-36 h-36 text-slate-800" />
              <div className="absolute inset-0 border-2 border-indigo-650/30 animate-pulse rounded-xl" />
            </div>
            <div className="text-xs font-mono font-black text-indigo-700 bg-indigo-50 py-1.5 px-3 rounded-lg inline-block">
              {qrCodeModalBooking.id} • {qrCodeModalBooking.vehicle.plate}
            </div>
            <button onClick={() => setQrCodeModalBooking(null)} className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer">Đóng</button>
          </div>
        </div>
      )}

      {/* MOMO QR MODAL */}
      {momoQrUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-100 shadow-2xl flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center">
              <QrCode className="w-8 h-8 text-pink-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight font-outfit">Thanh toán qua MoMo</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">Yêu cầu khách hàng quét mã QR dưới đây</p>
            </div>
            
            <div className="border-4 border-pink-50 p-2.5 rounded-2xl bg-white shadow-inner animate-fade-in">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(momoQrUrl)}`} 
                alt="MoMo QR Code" 
                className="w-48 h-48 rounded-lg"
              />
            </div>

            <div className="w-full space-y-2.5">
              <button 
                onClick={async () => {
                  try {
                    await bookingAdminApi.updateStatus(momoActiveBookingId, 'Completed');
                    alert("Đã xác nhận thanh toán thành công!");
                  } catch (err) {
                    alert("Không thể cập nhật trạng thái: " + err.message);
                  }
                  setMomoQrUrl(null);
                  setMomoActiveBookingId(null);
                  setSelectedDate(selectedDate);
                  setViewMode('list');
                }}
                className="w-full py-2.5 bg-pink-650 hover:bg-pink-700 active:scale-[0.98] text-white font-black text-xs rounded-xl shadow-lg shadow-pink-500/20 transition-all font-outfit"
              >
                Xác nhận Đã Thanh toán
              </button>
              <button 
                onClick={() => {
                  setMomoQrUrl(null);
                  setMomoActiveBookingId(null);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-500 font-bold text-xs rounded-xl transition-all"
              >
                Hủy giao dịch
              </button>
            </div>
          </div>
        </div>
      )}


  {/* SUCCESS PAYMENT MODAL */}
  {showSuccessModal && successModalData && (
<div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
    <div className="p-8 flex flex-col items-center text-center space-y-5">
      <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-black text-slate-800 tracking-tight font-outfit">Thanh toán thành công</h3>
        <p className="text-xs text-slate-400 font-semibold">Đơn {selectedBooking?.id} đã được hoàn tất</p>
      </div>
    </div>

    <div className="px-6 pb-2 space-y-0">
      <div className="divide-y divide-slate-100">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center"><CreditCard className="w-4 h-4 text-indigo-600" /></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Thành tiền thực thu</span>
          </div>
          <span className="text-sm font-black text-slate-800 font-mono">{successModalData.finalAmount.toLocaleString('vi-VN')} {' '}₫</span>
        </div>
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center"><Coins className="w-4 h-4 text-amber-600" /></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Điểm tích lũy đơn này</span>
          </div>
          <span className="text-sm font-black text-emerald-600">+{successModalData.pointsEarned} {' '}Pts</span>
        </div>
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center"><Gift className="w-4 h-4 text-purple-600" /></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tổng điểm ví hiện tại</span>
          </div>
          <span className="text-sm font-black text-slate-800">{successModalData.totalPoints?.toLocaleString('vi-VN')} {' '}Pts</span>
        </div>
      </div>
      {successModalData.alertUpgradeMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-bold text-amber-700 leading-relaxed">
          {successModalData.alertUpgradeMessage}
        </div>
      )}

      {successModalData.loyaltyProgress && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Loyalty Progress Bar</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {successModalData.loyaltyProgress.isMax ? 'Maximum Rank Achieved' : successModalData.loyaltyProgress.description}
              </p>
            </div>
            {successModalData.loyaltyProgress.isMax ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-700">Maximum Rank Achieved</span>
            ) : (
              <span className="text-sm font-black text-slate-700">{successModalData.loyaltyProgress.percent}%</span>
            )}
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-500 to-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${successModalData.loyaltyProgress.percent}%` }}
            />
          </div>
        </div>
      )}
    </div>

    <div className="p-6 pt-2">
      <button
        onClick={handleCloseSuccessModal}
        className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-sm font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-slate-900/20 cursor-pointer font-outfit tracking-tight"
      >
        Hoàn thành
      </button>
    </div>
  </div>
</div>
      )}
    </div>
  );
}
