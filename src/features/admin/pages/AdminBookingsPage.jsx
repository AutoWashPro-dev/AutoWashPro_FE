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
  Layers,
  Activity,
  MapPin,
  ChevronRight,
  ChevronLeft,
  History,
  ClipboardList,
  Plus
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { bookingAdminApi } from '../services/bookingAdminApi';
import { loyaltyApi } from '../services/loyaltyApi';
import { hasPermission } from '../../../utils/rbac';

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
        { id: 'C-01', name: 'Nguyễn Minh Anh', phone: '0912***456', tier: 'Platinum', points: 1240, totalSpend: 15400000, visits: 24, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100', lastVisitDays: 5, status: 'Active' },
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

  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [bookingsDb, setBookingsDb] = useState({});
  const [customersDb, setCustomersDb] = useState([]);
  const [loyaltySettings, setLoyaltySettings] = useState({});
  const [tierMatrix, setTierMatrix] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [activeMainTab, setActiveMainTab] = useState('queue'); // 'queue' vs 'history'
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [customerDetail, setCustomerDetail] = useState(null);
  const { bookingId: urlBookingId, id: urlId } = useParams();
  const [isOpenDetail, setIsOpenDetail] = useState(true);

  useEffect(() => {
    const activeId = urlBookingId || urlId;
    if (activeId) {
      setSelectedBookingId(Number(activeId) || activeId);
      setViewMode('detail');
    }
  }, [urlBookingId, urlId]);

  useEffect(() => {
    const activeId = urlBookingId || urlId || selectedBookingId;
    if (!activeId) {
      setBookingDetail(null);
      setCustomerDetail(null);
      return;
    }
    const fetchDetail = async () => {
      setLoadingDetail(true);
      let detail = null;
      try {
        detail = await bookingAdminApi.getBookingById(activeId);
      } catch (error) {
        console.error("API Fetching Error inside AdminBookingsPage:", error.response?.data || error.message);
        const saved = localStorage.getItem('autowash_bookings');
        if (saved) {
          const bookingsMap = JSON.parse(saved);
          const all = Object.values(bookingsMap).flat();
          const found = all.find(b => String(b.id || b.bookingId || b.bookingCode || '') === String(activeId));
          if (found) {
            detail = found;
          }
        }
      }

      if (detail) {
        const cust = detail.customer || {};
        const normalized = {
          ...detail,
          id: detail.bookingId || detail.id || detail.bookingCode,
          customer: {
            avatar: cust.avatarUrl || cust.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (cust.phoneNumber || detail.customerPhone || 'guest'),
            avatarUrl: cust.avatarUrl || cust.avatar,
            fullName: cust.fullName || detail.customerName || 'Khách hàng',
            name: cust.fullName || detail.customerName || 'Khách hàng',
            membershipTier: cust.membershipTier || detail.customerTier || 'Member',
            tier: cust.membershipTier || detail.customerTier || 'Member',
            phoneNumber: cust.phoneNumber || detail.customerPhone || '090***000',
            phone: cust.phoneNumber || detail.customerPhone || '090***000',
            loyaltyPoints: cust.loyaltyPoints !== undefined ? cust.loyaltyPoints : (detail.customerPoints || 0),
            points: cust.loyaltyPoints !== undefined ? cust.loyaltyPoints : (detail.customerPoints || 0),
            pointsValue: (cust.loyaltyPoints !== undefined ? cust.loyaltyPoints : (detail.customerPoints || 0)) * 1000
          }
        };
        setBookingDetail(normalized);

        const custId = detail.customerId || cust.customerId || cust.id;
        if (custId) {
          try {
            const custDetail = await loyaltyApi.getCustomerById(custId);
            if (custDetail) {
              setCustomerDetail(custDetail);
            }
          } catch (error) {
            console.error("API Fetching Error inside AdminBookingsPage:", error.response?.data || error.message);
            setCustomerDetail(null);
          }
        }
      } else {
        setBookingDetail(null);
        setCustomerDetail(null);
      }
      setLoadingDetail(false);
    };
    fetchDetail();
  }, [selectedBookingId, urlBookingId, urlId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [queueSubFilter, setQueueSubFilter] = useState('ALL_QUEUE'); // 'ALL_QUEUE', 'Pending', 'Paid'
  const [historySubFilter, setHistorySubFilter] = useState('ALL_HISTORY'); // 'ALL_HISTORY', 'Completed', 'Canceled'
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('');
  const [adminAlert, setAdminAlert] = useState({
    isOpen: false,
    type: 'info', // 'success' | 'warning' | 'error' | 'info'
    title: '',
    message: '',
    details: null
  });
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
        console.log(`🚀 [API] Danh sách đơn ngày ${selectedDate}:`, apiList);

        // Chỉ cập nhật nếu đây là request cuối cùng (tránh lỗi bấm nhanh bị đơ/loạn)
        if (isCurrentRequest && Array.isArray(apiList)) {
          // Dùng Map để lọc sạch mọi phần tử trùng ID trong mảng trả về từ API.
          // Backend trả về flat array với bookingCode thay vì id.
          const uniqueApiList = Array.from(
            new Map(apiList.map(item => [item.bookingCode || item.id || String(item.bookingId || ''), item])).values()
          );

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
  }, [selectedDate, searchQuery, refreshTrigger]);

  // Helper to resolve Tailwind badge classes for customer tiers
  const getTierBadgeStyle = (tier) => {
    const t = String(tier || '').toUpperCase();
    if (t.includes('PLATINUM') || t === 'VIP') {
      return 'bg-purple-100 text-purple-800 border-purple-200/50';
    }
    if (t.includes('GOLD')) {
      return 'bg-amber-100 text-amber-800 border-amber-200/50';
    }
    if (t.includes('SILVER')) {
      return 'bg-blue-100 text-blue-800 border-blue-200/50';
    }
    return 'bg-slate-100 text-slate-600 border-slate-200/50'; // MEMBER
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const list = await loyaltyApi.getCustomers();
        if (list && Array.isArray(list)) {
          setCustomersDb(list);
        }
      } catch (err) {
        console.warn('Failed to fetch customers in Bookings page:', err);
      }
    };
    fetchCustomers();
  }, [selectedDate, refreshTrigger]);

  useEffect(() => {
    const fetchSlotPerformance = async () => {
      try {
        const data = await bookingAdminApi.getSlotPerformance({
          timeRange: 'CUSTOM',
          fromDate: selectedDate,
          toDate: selectedDate
        });
        if (data) {
          setSlotPerformanceData(data);
        }
      } catch (err) {
        console.warn("Failed to fetch slot performance:", err.message);
        // Fallback: Populate mock slotPerformanceData matching slots configuration
        const slots = getSlotsData();
        const fallbackList = slots.map(s => {
          const bookedCount = getBookedCount(s.time);
          const occupancyRate = s.maxCapacity > 0 ? (bookedCount / s.maxCapacity) : 0;
          return {
            timeSlot: s.time,
            configuredMaxCapacity: s.maxCapacity,
            actualBooked: bookedCount,
            occupancyRate: occupancyRate,
            isHighRisk: occupancyRate > 0.8 || bookedCount >= s.maxCapacity,
            noShowRate: occupancyRate > 0.8 ? 0.25 : 0.0,
            remaining: Math.max(0, s.maxCapacity - bookedCount)
          };
        });
        setSlotPerformanceData(fallbackList);
      }
    };
    fetchSlotPerformance();
  }, [selectedDate, refreshTrigger]);

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
  const [occupancyData, setOccupancyData] = useState([]);

  // Sync occupancy locks with backend on date changes
  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        const monitorList = await bookingAdminApi.getOccupancyMonitor(selectedDate);
        if (monitorList && Array.isArray(monitorList)) {
          setOccupancyData(monitorList);
          const newLocks = { ...slotLocks };
          monitorList.forEach(m => {
            const lockKey = `${selectedDate}_${m.slotId}`;
            const isFull = (m.bookedCount || 0) >= (m.maxCapacity || 0);
            const isLocked = m.isLocked || isFull;
            newLocks[lockKey] = isLocked;

            // Nếu slot đã đầy xe mà ở Backend chưa có bản ghi lock, tự động POST lock để đồng bộ khóa slot
            if (isFull && !m.isLocked && m.slotId) {
              bookingAdminApi.adjustLock(m.slotId, selectedDate, true).catch(() => {});
            }
          });
          setSlotLocks(newLocks);
        }
      } catch (err) {
        console.warn('Failed to fetch occupancy monitor from API:', err.message);
      }
    };
    fetchOccupancy();
  }, [selectedDate, refreshTrigger]);

  const toggleLock = async (slotId, currentLocked) => {
    try {
      const nextLocked = !currentLocked;
      const response = await bookingAdminApi.adjustLock(slotId, selectedDate, nextLocked);
      const lockKey = `${selectedDate}_${slotId}`;
      setSlotLocks(prev => ({
        ...prev,
        [lockKey]: response.isLocked
      }));
    } catch (err) {
      console.warn('API adjustLock error, falling back to localStorage:', err.message);
      const lockKey = `${selectedDate}_${slotId}`;
      const nextLocked = !currentLocked;
      const newLocks = {
        ...slotLocks,
        [lockKey]: nextLocked
      };
      setSlotLocks(newLocks);
      localStorage.setItem('autowash_slot_locks', JSON.stringify(newLocks));
    }
  };

  // ── Late-arrival detection: any customer arriving after their slot window = immediate NO_SHOW ──
  const isLateArrival = (booking) => {
    if (!booking || !booking.slotTime) return false;
    const startTimeStr = booking.slotTime.split(' - ')[0];
    const [slotHour, slotMin] = startTimeStr.split(':').map(Number);
    if (isNaN(slotHour) || isNaN(slotMin)) return false;

    const slotStart = new Date();
    slotStart.setHours(slotHour, slotMin, 0, 0);
    const diffMinutes = (new Date() - slotStart) / 60000;
    return diffMinutes > 0; // Any positive diff = late
  };

  // ── Check if a booking is a NO_SHOW candidate eligible for staff override ("Cứu Đơn") ──
  const isNoShowOverrideCandidate = (booking) => {
    if (!booking) return false;
    const statusUpper = (booking.status || '').toUpperCase();
    // Only cancelled-no-show or no_show bookings for today qualify
    if (statusUpper !== 'CANCELLED_NO_SHOW' && statusUpper !== 'NO_SHOW' && statusUpper !== 'CANCELED') return false;

    const todayStr = getLocalDateString();
    if (booking.bookingDate !== todayStr) return false;

    // Ràng buộc mốc thời gian cứu đơn (Cho phép cứu đơn linh hoạt cho các đơn trong ngày)
    if (booking.slotTime) {
      const startTimeStr = booking.slotTime.split(' - ')[0];
      const [slotHour, slotMin] = startTimeStr.split(':').map(Number);
      if (!isNaN(slotHour) && !isNaN(slotMin)) {
        const slotStart = new Date();
        slotStart.setHours(slotHour, slotMin, 0, 0);
        const diffMinutes = (new Date() - slotStart) / 60000;
        if (diffMinutes > 15) {
          return false; // Quá 15p -> Hủy hoàn toàn
        }
      }
    }

    return true;
  };

  // ── Helper to check if a booking is in the valid 10-min before to 5-min after checkin window ──
  const getCheckinWindowInfo = (booking) => {
    // 💡 Bật chế độ Demo: Cho phép thanh toán & check-in mọi lúc mà không bị khóa nút
    return { isValid: true, isTooEarly: false, isPastGrace: false };

    /*
    if (!booking || !booking.slotTime) return { isValid: true, isTooEarly: false, isPastGrace: false };

    const todayStr = getLocalDateString();
    if (booking.bookingDate !== todayStr) {
      const isPast = booking.bookingDate < todayStr;
      return { 
        isValid: false, 
        isTooEarly: !isPast, 
        isPastGrace: isPast, 
        message: isPast 
          ? `⚠️ Đơn đặt lịch thuộc ngày quá khứ (${booking.bookingDate}). Không thể thanh toán!` 
          : `⏳ Đơn đặt lịch được hẹn cho ngày ${booking.bookingDate}. Chưa đến ngày check-in & thanh toán!` 
      };
    }

    const startTimeStr = booking.slotTime.split(' - ')[0];
    const [slotHour, slotMin] = startTimeStr.split(':').map(Number);
    if (isNaN(slotHour) || isNaN(slotMin)) return { isValid: true, isTooEarly: false, isPastGrace: false };

    const slotStart = new Date();
    slotStart.setHours(slotHour, slotMin, 0, 0);
    const diffMinutes = (new Date() - slotStart) / 60000;

    if (diffMinutes < -10) {
      return { isValid: false, isTooEarly: true, isPastGrace: false, message: `⏳ Chưa đến giờ check-in (Chỉ cho phép check-in từ 10 phút trước giờ slot ${startTimeStr})` };
    }
    if (diffMinutes > 30) {
      return { isValid: false, isTooEarly: false, isPastGrace: true, message: `⚠️ Quá 5 phút kể từ giờ slot (${startTimeStr}) — Không thể thanh toán thường. Hãy sử dụng luồng Cứu Đơn.` };
    }
    return { isValid: true, isTooEarly: false, isPastGrace: false };
    */
  };

  // ── Downstream slot availability lookup ──
  const checkDownstreamSlotAvailability = (booking) => {
    if (!booking || !booking.slotTime) return { hasCapacity: false, checkedSlots: [] };

    const slots = getSlotsData();
    const startTimeStr = booking.slotTime.split(' - ')[0];
    const [bookingHour] = startTimeStr.split(':').map(Number);
    if (isNaN(bookingHour)) return { hasCapacity: false, checkedSlots: [] };

    // Find all consecutive slots immediately AFTER the booking's current slot
    const subsequentSlots = slots
      .filter(s => {
        if (!s.isActive) return false;
        const slotStartHour = parseInt(s.time.split(':')[0], 10);
        return slotStartHour > bookingHour;
      })
      .sort((a, b) => parseInt(a.time.split(':')[0], 10) - parseInt(b.time.split(':')[0], 10));

    // Check consecutive slots only (stop at the first gap)
    const checkedSlots = [];
    let expectedHour = bookingHour + 1;
    for (const slot of subsequentSlots) {
      const slotStartHour = parseInt(slot.time.split(':')[0], 10);
      if (slotStartHour !== expectedHour) break; // Gap detected, stop

      const lockKey = `${selectedDate}_${slot.id}`;
      const lockedCount = slotLocks[lockKey] || 0;
      const bookedCount = getBookedCount(slot.time);
      const effectiveBooked = bookedCount + lockedCount;
      const availableCapacity = slot.maxCapacity - effectiveBooked;

      checkedSlots.push({
        ...slot,
        bookedCount: effectiveBooked,
        availableCapacity,
        isFull: availableCapacity <= 0
      });

      expectedHour++;
    }

    // Override is allowed if at least one subsequent consecutive slot has remaining capacity
    const hasCapacity = checkedSlots.some(s => s.availableCapacity > 0);
    return { hasCapacity, checkedSlots };
  };

  // ── Staff Override: "Cứu Đơn" – check-in late with downstream availability guard ──
  const handleCheckinLateOverride = async (bookingId) => {
    const booking = allBookingsMapped.find(b => (b.bookingCode || b.id || String(b.bookingId || '')) === bookingId) || selectedBooking;
    if (!booking) return;

    // Step 1: Verify downstream slot availability
    const { hasCapacity, checkedSlots } = checkDownstreamSlotAvailability(booking);

    if (!hasCapacity) {
      // All subsequent slots are full → block the override
      const slotSummary = checkedSlots.map(s => `${s.time}: ${s.bookedCount}/${s.maxCapacity}`).join(', ');
      setAdminAlert({
        isOpen: true,
        type: 'warning',
        title: 'Không thể Cứu Đơn (Quá công suất)',
        message: 'Khách hàng đi trễ và các khung giờ tiếp theo đã đầy công suất! Không thể thực hiện check-in.',
        details: slotSummary || 'Không có khung giờ nào khả dụng'
      });
      return;
    }

    // Step 2: Downstream capacity available → proceed with override
    try {
      await bookingAdminApi.checkinLate(bookingId);

      setBookingsDb(prev => {
        const updated = { ...prev };
        const dateKey = selectedDate;
        if (updated[dateKey]) {
          updated[dateKey] = updated[dateKey].map(b => {
            const currentId = b.bookingCode || b.id || String(b.bookingId || '');
            if (currentId === bookingId) {
              return { ...b, status: 'Pending', paymentStatus: 'UNPAID' };
            }
            return b;
          });
        }
        return updated;
      });

      const availableSlot = checkedSlots.find(s => s.availableCapacity > 0);
      setAdminAlert({
        isOpen: true,
        type: 'success',
        title: 'Cứu Đơn Thành Công!',
        message: `Đã khôi phục trạng thái đơn về PENDING. Khung giờ khả dụng tiếp theo: ${availableSlot?.time || 'N/A'} (còn ${availableSlot?.availableCapacity || 0} chỗ). Hãy tiến hành thanh toán cho khách tại quầy.`
      });
      setViewMode('list');
    } catch (err) {
      setAdminAlert({
        isOpen: true,
        type: 'error',
        title: 'Lỗi Xử Lý Cứu Đơn',
        message: err.response?.data?.message || err.message || 'Đã xảy ra lỗi không xác định.'
      });
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

    // Kiểm tra xem bookingsDb[selectedDate] có phải là mảng phẳng từ API trả về không
    const currentList = bookingsDb[selectedDate] || [];

    // Nếu hệ thống đang lưu dạng Object ngày cũ (Mock), ta gộp lại, ngược lại xử lý mảng phẳng từ API
    const sourceData = Array.isArray(currentList) ? currentList : Object.values(bookingsDb).flat();

    sourceData.forEach((b) => {
      if (!b) return;

      // Lấy bookingCode xịn từ API (như 'NV-1002'), nếu không có thì fallback về id/bookingId
      const stringId = b.bookingCode || b.id || String(b.bookingId || '');
      if (!stringId) return;

      // Xử lý chuyển đổi startTime từ API (có thể là String "09:30:00", Array [9,30], hoặc Object {hour: 9, minute: 30})
      let formattedSlotTime = b.slotTime || '';
      if (b.startTime) {
        if (typeof b.startTime === 'string') {
          const parts = b.startTime.split(':');
          if (parts.length >= 2) {
            formattedSlotTime = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
          } else {
            formattedSlotTime = b.startTime;
          }
        } else if (Array.isArray(b.startTime) && b.startTime.length >= 2) {
          const hour = String(b.startTime[0]).padStart(2, '0');
          const minute = String(b.startTime[1]).padStart(2, '0');
          formattedSlotTime = `${hour}:${minute}`;
        } else if (typeof b.startTime === 'object') {
          const hour = String(b.startTime.hour ?? '').padStart(2, '0');
          const minute = String(b.startTime.minute ?? '').padStart(2, '0');
          if (hour && minute) formattedSlotTime = `${hour}:${minute}`;
        }
      }

      // Calculate total duration and service names from items
      let serviceName = 'Dịch vụ dọn xe';
      let totalDuration = b.estimatedDuration || 20;
      if (b.items && b.items.length > 0) {
        const itemNames = b.items.map(i => i.serviceNameSnapshot || i.serviceName || i.name).filter(Boolean);
        if (itemNames.length > 0) {
          serviceName = itemNames.join(' + ');
        }
        const itemMinutesSum = b.items.reduce((acc, i) => acc + (i.durationMinutes || i.duration || 15), 0);
        if (itemMinutesSum > 0) {
          totalDuration = itemMinutesSum;
        }
      } else if (b.service?.name) {
        serviceName = b.service.name;
      }

      const custObj = b.customer || {};
      const custName = b.customerName || custObj.fullName || custObj.name || 'Khách hàng vãng lai';
      const custPhone = b.customerPhone || custObj.phoneNumber || custObj.phone || '';

      // Build a quick lookup map inside getAllBookings
      const customerMap = {};
      customersDb.forEach(c => {
        if (c.customerId) customerMap[String(c.customerId)] = c;
        if (c.id) customerMap[String(c.id).toUpperCase()] = c;
      });

      const lookupId = b.customerId || b.custId || custObj.customerId || custObj.id || '';
      const matchedCustomer = customerMap[String(lookupId).toUpperCase()] || customerMap[String(lookupId)] || {};

      const rawTier = b.customerTier ||
        b.customer?.tierDisplayName ||
        b.customer?.tierName ||
        (typeof custObj.tier === 'object' ? custObj.tier?.tierName : custObj.tier) ||
        matchedCustomer.tierDisplayName ||
        matchedCustomer.tierName ||
        matchedCustomer.tier ||
        'Member';
      const custTier = String(rawTier).toUpperCase();
      const custAvatar = custObj.avatarUrl || custObj.avatar || matchedCustomer.avatar || (`https://api.dicebear.com/7.x/avataaars/svg?seed=${custPhone || 'guest'}`);
      const amount = Number(b.finalAmount ?? b.totalEstimatedAmount ?? (b.service?.price || 0));

      const normalizedBooking = {
        ...b,
        id: stringId,
        bookingDate: b.bookingDate || selectedDate, // Ép ngày booking trùng với ngày đang chọn của POS
        slotTime: formattedSlotTime || '08:00',
        customer: {
          name: custName,
          phone: custPhone,
          tier: custTier,
          points: custObj.loyaltyPoints !== undefined ? custObj.loyaltyPoints : (b.customerPoints || matchedCustomer.points || 0),
          avatar: custAvatar
        },
        vehicle: {
          type: 'Xe máy',
          model: b.model || b.vehicle?.model || 'N/A',
          plate: b.licensePlate || b.vehicle?.plate || 'N/A'
        },
        service: {
          name: serviceName,
          price: amount
        },
        estimatedDuration: totalDuration,
        finalAmount: amount,
        source: b.source || 'APP',
        status: (() => {
          const s = String(b.status || '').toUpperCase();
          if (s === 'PENDING') return 'Pending';
          if (s === 'CONFIRMED') return 'Confirmed';
          if (s === 'IN_PROGRESS') return 'In_progress';
          if (s === 'COMPLETED') return 'Completed';
          if (s === 'CANCELED' || s === 'CANCELLED' || s.startsWith('CANCEL')) return 'Canceled';
          return b.status || 'Pending';
        })(),
        custId: b.customerId || custObj.customerId || ''
      };

      allMap.set(stringId, normalizedBooking);
    });

    return Array.from(allMap.values());
  };

  // Giữ nguyên đoạn này để đồng bộ map với CRM Local của bạn
  const allBookingsMapped = getAllBookings().map(b => {
    const customer = customersDb.find(c =>
      (c.id && String(c.id).toUpperCase() === String(b.custId || b.customerId || '').toUpperCase()) ||
      (c.customerId && String(c.customerId) === String(b.custId || b.customerId || ''))
    ) || {
      name: b.customer.name,
      phone: b.customer.phone,
      tier: b.customer.tier,
      points: b.customer.points,
      avatar: b.customer.avatar
    };

    return {
      ...b,
      customer: {
        ...customer,
        name: b.customer.name,
        phone: b.customer.phone,
        tier: b.customer.tier || customer.tierName || customer.tier || 'Member',
        points: b.customer.points !== undefined ? b.customer.points : (customer.points || 0),
        avatar: b.customer.avatar || customer.avatar,
        displayPhone: b.customer.phone || customer.phone || ''
      }
    };
  });


  const bookingsForDate = allBookingsMapped.filter(b => b.bookingDate === selectedDate);
  const activeBookingsSource = bookingsForDate;
  const selectedBooking = allBookingsMapped.find(b => b.id === selectedBookingId) || null;

  // States inside checkout detail view
  const [selectedVoucherCode, setSelectedVoucherCode] = useState('');
  const [customerVouchers, setCustomerVouchers] = useState([]);
  const [tempPaymentMethod, setTempPaymentMethod] = useState('Cash');
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotPerformanceData, setSlotPerformanceData] = useState([]);

  // Walk-In Booking Creation States
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInCustomerId, setWalkInCustomerId] = useState('C-01');
  const [walkInDate, setWalkInDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [walkInSlotId, setWalkInSlotId] = useState(1);
  const [walkInSlotTime, setWalkInSlotTime] = useState('07:30');
  const [walkInService, setWalkInService] = useState('Basic Wash');
  const [walkInPrice, setWalkInPrice] = useState(70000);
  const [walkInVehiclePlate, setWalkInVehiclePlate] = useState('29-D1 555.55');
  const [walkInVehicleModel, setWalkInVehicleModel] = useState('Yamaha Grande');
  const [walkInErrorModal, setWalkInErrorModal] = useState({ isOpen: false, message: '' });
  const [dbTimeSlots, setDbTimeSlots] = useState([]);

  useEffect(() => {
    const loadSlots = async () => {
      try {
        const slots = await serviceCatalogApi.getAllSlots();
        if (slots && Array.isArray(slots) && slots.length > 0) {
          const sorted = [...slots].sort((a, b) => {
            const orderA = a.displayOrder ?? 0;
            const orderB = b.displayOrder ?? 0;
            if (orderA !== orderB) return orderA - orderB;
            const timeA = a.startTime || a.time || '';
            const timeB = b.startTime || b.time || '';
            return timeA.localeCompare(timeB);
          });
          setDbTimeSlots(sorted);
          const firstSlot = sorted[0];
          const firstId = Number(firstSlot.timeSlotId || firstSlot.slotId || 1);
          setWalkInSlotId(firstId);
          setWalkInSlotTime(firstSlot.time || `${firstSlot.startTime} - ${firstSlot.endTime}`);
        }
      } catch (e) {
        console.warn('Failed to load slots for WalkIn modal:', e);
      }
    };
    loadSlots();
  }, [selectedDate, refreshTrigger]);

  // Update Walk-In Date dynamically if selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setWalkInDate(selectedDate);
    }
  }, [selectedDate]);

  const handleCreateWalkIn = async (e) => {
    e.preventDefault();

    // Check locally in localStorage
    const savedBookings = JSON.parse(localStorage.getItem('autowash_bookings') || '{}');
    const dayBookings = savedBookings[walkInDate] || [];

    // Check overlapping slot
    const overlapping = dayBookings.find(b =>
      b.custId === walkInCustomerId &&
      ['Pending', 'Confirmed', 'Paid', 'In_progress', 'Completed', 'Checked_in'].some(st => st.toLowerCase() === (b.status || '').toLowerCase()) &&
      b.slotTime === walkInSlotTime
    );

    if (overlapping) {
      setWalkInErrorModal({
        isOpen: true,
        message: "Khách hàng đã có đơn hàng (Trạng thái: Đã thanh toán/Xác nhận) trong khung giờ này. Không thể tạo thêm đơn trùng!"
      });
      return;
    }

    try {
      const payload = {
        customerId: walkInCustomerId,
        bookingDate: walkInDate,
        timeSlotId: walkInSlotId,
        serviceName: walkInService,
        price: walkInPrice,
        licensePlate: walkInVehiclePlate,
        model: walkInVehicleModel
      };

      await bookingAdminApi.createWalkInBooking(payload);

      const newId = `AW-${Date.now().toString().slice(-4)}`;
      const newBookingObj = {
        id: newId,
        slotTime: walkInSlotTime,
        custId: walkInCustomerId,
        vehicle: { type: 'Xe máy', model: walkInVehicleModel, plate: walkInVehiclePlate },
        service: { name: walkInService, price: walkInPrice },
        status: 'Pending',
        createdTime: 'Hôm nay, vừa xong via POS Admin Walk-in',
        paymentMethod: null,
        pointsRedeemed: 0,
        discount: 0,
        finalAmount: walkInPrice,
        estimatedDuration: 30,
        source: 'POS',
        paymentStatus: 'UNPAID',
        bookingDate: walkInDate
      };

      const nextBookings = { ...savedBookings };
      if (!nextBookings[walkInDate]) {
        nextBookings[walkInDate] = [];
      }
      nextBookings[walkInDate].push(newBookingObj);
      localStorage.setItem('autowash_bookings', JSON.stringify(nextBookings));

      setRefreshTrigger(prev => prev + 1);
      setShowWalkInModal(false);

      alert('Tạo đơn đặt Walk-in thành công!');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi khi tạo đơn đặt lịch.');
    }
  };

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

  const getLoyaltyProgressData = (newTier, newTotalSpend, customerName) => {
    try {
      const updatedTotalSpending = Number(newTotalSpend) || 0;
      const safeName = customerName || 'Quý khách';

      let targetLimit = 1000000;
      let nextTierLabel = 'SILVER';

      if (updatedTotalSpending >= 10000000) {
        targetLimit = updatedTotalSpending;
        nextTierLabel = 'PLATINUM';
      } else if (updatedTotalSpending >= 5000000) {
        targetLimit = 10000000;
        nextTierLabel = 'PLATINUM';
      } else if (updatedTotalSpending >= 1000000) {
        targetLimit = 5000000;
        nextTierLabel = 'GOLD';
      }

      const isMax = updatedTotalSpending >= 10000000;
      const amountNeededNextTier = Math.max(0, targetLimit - updatedTotalSpending);
      const progressPercent = targetLimit > 0 ? Math.min(100, Math.floor((updatedTotalSpending / targetLimit) * 100)) : 100;

      if (isMax) {
        return {
          isMax: true,
          percent: 100,
          remaining: 0,
          amountNeededNextTier: 0,
          nextTierLabel: 'PLATINUM',
          targetName: 'Platinum',
          description: `Quý khách ${safeName} đã đạt hạng cao nhất — Platinum`
        };
      }

      return {
        isMax: false,
        percent: progressPercent,
        remaining: amountNeededNextTier,
        amountNeededNextTier,
        nextTierLabel,
        targetName: nextTierLabel,
        description: `Quý khách ${safeName} cần thanh toán thêm ${amountNeededNextTier.toLocaleString('vi-VN')} VND để thăng hạng ${nextTierLabel}`
      };
    } catch {
      return {
        isMax: false,
        percent: 0,
        remaining: 0,
        amountNeededNextTier: 0,
        nextTierLabel: 'SILVER',
        targetName: 'Silver',
        description: 'Đang tính toán...'
      };
    }
  };

  const selectedVoucher = customerVouchers.find(v => v.code === selectedVoucherCode) || null;
  const discountAmount = selectedVoucher ? parseVoucherDiscount(selectedVoucher.value, selectedBooking?.finalAmount || selectedBooking?.service?.price || 0) : 0;
  const finalAmount = Math.max(0, (selectedBooking?.finalAmount || selectedBooking?.service?.price || 0) - discountAmount);

  // View transition helpers
  const handleOpenDetail = (booking) => {
    setSelectedBookingId(booking.id);
    setTempPaymentMethod(booking.paymentMethod || 'Cash');
    setCancelReasonText('');
    setIsCanceling(false);
    setViewMode('detail');
    setIsOpenDetail(false);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setIsOpenDetail(true);
  };

  // Helper: Save booking to localStorage database
  const saveBookingToDb = (updatedBooking) => {
    const allBookings = { ...bookingsDb };
    const dateKey = updatedBooking.bookingDate || selectedDate;
    if (allBookings[dateKey]) {
      allBookings[dateKey] = allBookings[dateKey].map(b => {
        const bId = String(b.bookingCode || b.id || b.bookingId || '');
        const uId = String(updatedBooking.bookingCode || updatedBooking.id || updatedBooking.bookingId || '');
        if (bId === uId) {
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
    setIsSubmitting(true);

    const bookingId = selectedBooking.bookingId || selectedBooking.id;
    const statusUpper = (selectedBooking.status || '').toUpperCase();

    // ── NO_SHOW Late-Arrival Guard ("Cứu Đơn" at payment step) ──
    // If customer arrived late and booking was flagged as NO_SHOW, enforce downstream check
    if (isLateArrival(selectedBooking) || statusUpper === 'NO_SHOW' || statusUpper === 'CANCELLED_NO_SHOW') {
      const { hasCapacity, checkedSlots } = checkDownstreamSlotAvailability(selectedBooking);

      if (!hasCapacity) {
        // Block: subsequent slots are fully booked
        const slotSummary = checkedSlots.map(s => `${s.time}: ${s.bookedCount}/${s.maxCapacity}`).join(', ');
        setAdminAlert({
          isOpen: true,
          type: 'warning',
          title: 'Không thể Cứu Đơn (Quá công suất)',
          message: 'Khách hàng đi trễ và các khung giờ tiếp theo đã đầy công suất! Không thể thực hiện check-in.',
          details: slotSummary || 'Không có khung giờ nào khả dụng'
        });
        setIsSubmitting(false);
        setShowConfirmModal(false);
        return; // ← Hard stop: do NOT proceed with payment
      }

      // Capacity available → log the override and continue with payment
      console.log(
        `🛡️ [Cứu Đơn Override] Staff authorized late check-in for ${bookingId}. ` +
        `Available downstream slots: ${checkedSlots.filter(s => s.availableCapacity > 0).map(s => s.time).join(', ')}`
      );
    }

    let latestEarnedPoints = 0;
    try {
      // 1. Call Checkout API
      await bookingAdminApi.checkoutBooking(bookingId, {
        bookingId,
        paymentMethod: tempPaymentMethod === 'VNPay' ? 'BANK_TRANSFER' : tempPaymentMethod.toUpperCase(),
        voucherCode: selectedVoucherCode || null,
        notes: selectedBooking.notes
      });

      // 2. Call Points History API to retrieve latest points based on createdAt
      const custId = selectedBooking.customerId || selectedBooking.customer?.id || selectedBooking.customer?.customerId;
      if (custId) {
        const pointsHistory = await loyaltyApi.getCustomerPointHistory(custId);
        if (pointsHistory && pointsHistory.length > 0) {
          // Find the latest earned transaction
          const latestTx = pointsHistory[0]; // usually sorted DESC
          latestEarnedPoints = latestTx.points || 0;
        }
      }
    } catch (err) {
      console.warn('API checkout or points history error, falling back to local calculation:', err.message);
    }

    // Fallback/Calculation logic
    const customerTier = selectedBooking.customer.tier;
    const currentTierConfig = tierMatrix.find((t) => t.key === customerTier) || { pointMultiplier: 1.0 };
    const tierMultiplier = currentTierConfig.pointMultiplier || 1.0;
    const pointsEarned = latestEarnedPoints || Math.floor(finalAmount / baseSpendToEarnPoint) * basePointsToEarn * tierMultiplier;

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

    // Compute loyalty metrics using hardcoded thresholds to prevent NaN
    const updatedTotalSpending = Number(customerAfterCheckout.totalSpend) || 0;
    const updatedLoyaltyPoints = Number(customerAfterCheckout.points) || 0;
    const customerRecord = {
      fullName: customerAfterCheckout.name || selectedBooking.customer.name || 'Quý khách',
      totalSpending: updatedTotalSpending,
      loyaltyPoints: updatedLoyaltyPoints,
      tier: customerAfterCheckout.tier || 'Member'
    };

    const loyaltyProgress = getLoyaltyProgressData(customerRecord.tier, updatedTotalSpending, customerRecord.fullName);

    setSuccessModalData({
      finalAmount,
      pointsEarned,
      totalPoints: updatedLoyaltyPoints,
      customer: customerAfterCheckout,
      customerRecord,
      updatedLoyaltyPoints,
      updatedTotalSpending,
      alertUpgradeMessage,
      loyaltyProgress
    });

    // Smooth transition: close confirm modal and open success modal
    setShowConfirmModal(false);
    setIsSubmitting(false);
    setShowSuccessModal(true);
    setRefreshTrigger(prev => prev + 1); // Trigger an explicit re-fetch of the bookings list
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
      setAdminAlert({
        isOpen: true,
        type: 'warning',
        title: 'Thiếu Thông Tin Hủy Lịch',
        message: 'Vui lòng nhập lý do hủy lịch đặt trước khi xác nhận.'
      });
      return;
    }

    const updatedBooking = {
      ...selectedBooking,
      status: 'Canceled',
      cancelReason: cancelReasonText,
      paymentStatus: 'UNPAID'
    };

    saveBookingToDb(updatedBooking);
    setAdminAlert({
      isOpen: true,
      type: 'success',
      title: 'Hủy Lịch Đặt Thành Công',
      message: `Đã hủy đơn ${selectedBooking.id} và giải phóng khung giờ đặt lịch.`
    });
    setIsCanceling(false);
    setCancelReasonText('');
    setViewMode('list');
  };

  // Filter Bookings logic (E2E Toàn Cục hỗ trợ tìm kiếm chéo ngày)
  const filteredBookings = activeBookingsSource.filter(b => {
    // Bổ sung kiểm tra an toàn (Optional Chaining ?. và || '') để không bao giờ bị crash
    const bookingIdStr = String(b.id || b.bookingCode || '').toLowerCase();
    const customerNameStr = String(b.customer?.name || b.customerName || '').toLowerCase();
    const customerPhoneStr = String(b.customer?.phone || b.customerPhone || '');
    const displayPhoneStr = String(b.customer?.displayPhone || '').toLowerCase();
    const vehiclePlateStr = String(b.vehicle?.plate || b.licensePlate || '').toLowerCase();

    const matchesSearch =
      bookingIdStr.includes(searchQuery.toLowerCase()) ||
      customerNameStr.includes(searchQuery.toLowerCase()) ||
      customerPhoneStr.includes(searchQuery) ||
      displayPhoneStr.includes(searchQuery.toLowerCase()) ||
      vehiclePlateStr.includes(searchQuery.toLowerCase());

    const matchesTime = !selectedTimeFilter || (b.slotTime && b.slotTime.startsWith(selectedTimeFilter.split(':')[0]));

    if (!matchesSearch || !matchesTime) return false;

    // Giữ nguyên phần logic lọc theo tab phía dưới của bạn
    const statusUpper = String(b.status || '').toUpperCase();
    if (activeMainTab === 'queue') {
      if (statusUpper !== 'PENDING' && statusUpper !== 'CONFIRMED' && statusUpper !== 'IN_PROGRESS') return false;
    } else {
      if (statusUpper !== 'COMPLETED' && statusUpper !== 'CANCELED' && statusUpper !== 'CANCELLED_NO_SHOW') return false;
      if (historySubFilter === 'Completed' && statusUpper !== 'COMPLETED') return false;
      if (historySubFilter === 'Canceled' && statusUpper !== 'CANCELED' && statusUpper !== 'CANCELLED_NO_SHOW') return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#f7fafd] text-slate-800 p-6 overflow-hidden">

      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#0047AB] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0047AB]/20 text-white">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Quản Lý Đặt Lịch & Hàng Chờ (Bookings & Queue)
              <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-[#0047AB] text-[10px] font-black rounded-full uppercase tracking-wider">
                Real-time Queue
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Theo dõi hàng chờ check-in, xử lý thanh toán hoàn tất đơn và rà soát lịch sử đặt hẹn.
            </p>
          </div>
        </div>

        {/* Date Selector */}
        {isOpenDetail && (<div className="flex items-center gap-2 self-end sm:self-auto">

          <button
            onClick={handlePrevDate}
            className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600 transition-colors cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-[#0047AB]" />
            <span className="min-w-[90px] text-slate-600 text-[11px]">{getSelectedDateLabel()}</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value);
                setSelectedTimeFilter('');
              }}
              className="w-[130px] bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={handleNextDate}
            className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600 transition-colors cursor-pointer shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>)}
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pt-4 pr-1 space-y-6 no-scrollbar">
        {viewMode === 'list' && (
          <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-hidden">

            {/* Left: Bookings List Card */}
            <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col min-h-0 overflow-hidden">

              {/* Header / Tabs */}
              <div className="p-3 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between shrink-0 bg-slate-50/30">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setActiveMainTab('queue'); setSelectedTimeFilter(''); }}
                    className={`px-4.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${activeMainTab === 'queue'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-55'
                      }`}
                  >
                    <ClipboardList className="w-4.5 h-4.5" />
                    Hàng chờ Vận hành ({bookingsForDate.filter(b => b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'In_progress').length})
                  </button>
                  <button
                    onClick={() => { setActiveMainTab('history'); setSelectedTimeFilter(''); }}
                    className={`px-4.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${activeMainTab === 'history'
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
                          className={`px-3 py-1 rounded-lg text-center font-bold transition-all cursor-pointer ${historySubFilter === sub.key
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
              <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar">
                {filteredBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                    <ClipboardList className="w-10 h-10 text-slate-300" />
                    <p className="text-xs font-bold">Không tìm thấy lịch đặt nào trong danh sách này</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider z-10">
                      <tr>
                        <th className="py-3 px-3">Mã đơn</th>
                        <th className="py-3 px-2">Giờ hẹn</th>
                        <th className="py-3 px-2">Khách hàng & SĐT</th>
                        <th className="py-3 px-2">Xe máy & Biển số</th>
                        <th className="py-3 px-2">Gói dịch vụ</th>
                        <th className="py-3 px-2 text-right">Tổng tiền</th>
                        <th className="py-3 px-1.5 text-center">Nguồn</th>
                        <th className="py-3 px-2 text-center">Trạng thái</th>
                        <th className="py-3 px-3 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredBookings.map(b => {
                        let statusBadge = '';
                        let statusText = '';
                        const sUpper = String(b.status || '').toUpperCase();

                        if (sUpper === 'COMPLETED') {
                          statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          statusText = 'Đã hoàn thành';
                        } else if (sUpper === 'IN_PROGRESS') {
                          statusBadge = 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse';
                          statusText = 'Đang rửa xe';
                        } else if (sUpper === 'CONFIRMED') {
                          statusBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                          statusText = 'Đã xác nhận';
                        } else if (sUpper === 'PENDING') {
                          statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                          statusText = 'Chờ Check-in';
                        } else {
                          statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                          statusText = sUpper.includes('NO_SHOW') ? 'Vắng mặt' : 'Đã hủy';
                        }

                        return (
                          <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-3 font-black text-slate-800">
                              <div className="flex items-center gap-1">
                                <span>{b.id}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex flex-col">
                                <span className="flex items-center gap-1 font-bold text-slate-700">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {b.slotTime}
                                  {b.note && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-bold rounded">Trễ</span>}
                                </span>
                                <span className="text-[9px] text-slate-400 font-extrabold mt-0.5">{b.bookingDate}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-1.5">
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                                    {b.customer?.name || b.customerName || 'Khách hàng vãng lai'}
                                    <span className={`px-1.5 py-0.5 text-[8.5px] font-black rounded uppercase border ${getTierBadgeStyle(b.customer?.tier)}`}>
                                      {b.customer?.tier || 'MEMBER'}
                                    </span>
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-semibold">
                                    {b.customer?.phone || b.customerPhone || 'Không có SĐT'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-1">
                                <Bike className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-bold text-slate-750">{b.vehicle.model}</span>
                                <span className="px-1.5 py-0.5 bg-slate-900 text-white font-mono text-[8.5px] font-black rounded-md">{b.vehicle.plate}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 max-w-[170px]">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 truncate" title={b.service.name}>{b.service.name}</span>
                                <span className="text-[9px] text-slate-400 font-semibold">Thời lượng: {b.estimatedDuration} phút</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right font-black text-slate-800 whitespace-nowrap">
                              {b.finalAmount.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="py-3 px-1.5 text-center">
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] font-black rounded">{b.source}</span>
                            </td>
                            <td className="py-3 px-2 text-center whitespace-nowrap">
                              <span className={`inline-block px-2 py-0.5 rounded-full border text-[9px] font-extrabold ${statusBadge}`}>
                                {statusText}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => handleOpenDetail(b)}
                                className="px-2.5 py-1 bg-[#0047AB] hover:bg-[#003a8c] text-white text-[10px] font-extrabold rounded-lg shadow-sm inline-flex items-center gap-0.5 cursor-pointer transition-colors whitespace-nowrap"
                              >
                                Xem chi tiết
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right: Daily Availability Monitor (Read-Only Operational Capacity Monitor) */}
            <div className="w-full lg:w-[380px] shrink-0 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col min-h-0 overflow-hidden font-sans">
              {/* Header */}
              <div className="p-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-slate-850 font-extrabold text-xs">
                  <div className="w-7.5 h-7.5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100/85">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-outfit tracking-tight text-slate-800 text-xs block">Giám sát công suất</span>
                    <span className="text-[9px] text-slate-400 font-semibold block">Trạng thái đặt lịch theo khung giờ</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200/70 rounded-full text-[9px] font-black">
                  {selectedDate}
                </span>
              </div>

              {/* Slots Table */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider z-10">
                    <tr>
                      <th className="py-2 px-2.5">Khung giờ</th>
                      <th className="py-2 px-1 text-center">Tối đa</th>
                      <th className="py-2 px-2">Tiến độ & Trạng thái</th>
                      <th className="py-2 px-2.5 text-right">Trống</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
                    {slotPerformanceData.map((item, idx) => {
                      const timeSlot = item.timeSlot || '08:00 - 09:00';
                      const configuredMaxCapacity = item.configuredMaxCapacity ?? 8;
                      const actualBooked = item.actualBooked ?? 0;
                      const occupancyRate = item.occupancyRate ?? 0;
                      const isHighRisk = item.isHighRisk ?? false;
                      const noShowRate = item.noShowRate ?? 0;
                      const remaining = configuredMaxCapacity - actualBooked;
                      const occupancyPct = occupancyRate > 1.0 ? occupancyRate : occupancyRate * 100;
                      const occupancyPctStr = occupancyPct.toFixed(0) + '%';
                      const noShowPct = noShowRate > 1.0 ? noShowRate : noShowRate * 100;
                      const noShowPctStr = noShowPct.toFixed(0) + '% Hủy/Trễ';
                      const isLockedSlot = item.isLocked || (slotLocks[`${selectedDate}_${item.slotId}`]) || (actualBooked >= configuredMaxCapacity) || remaining <= 0;

                      // Format start time string (e.g. "08:00") to full range (e.g. "08:00 - 09:00")
                      let formattedTime = timeSlot;
                      if (timeSlot && !timeSlot.includes('-')) {
                        const parts = timeSlot.split(':');
                        if (parts.length >= 2) {
                          const startHour = parseInt(parts[0], 10);
                          const startMin = parts[1];
                          const endHour = startHour + 1;
                          const formattedStart = `${String(startHour).padStart(2, '0')}:${startMin}`;
                          const formattedEnd = `${String(endHour).padStart(2, '0')}:${startMin}`;
                          formattedTime = `${formattedStart} - ${formattedEnd}`;
                        }
                      }

                      return (
                        <tr key={idx} className={`hover:bg-slate-50/70 transition-colors ${isLockedSlot ? 'bg-rose-50/20' : (isHighRisk ? 'bg-amber-50/20' : '')}`}>
                          <td className="py-2 px-2.5 font-outfit font-black text-slate-800 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-[10px]">{formattedTime}</span>
                            </div>
                          </td>
                          <td className="py-2 px-1 text-center">
                            <span className="font-extrabold text-slate-700 text-[10px]">{configuredMaxCapacity}</span>
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                {isLockedSlot ? (
                                  <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 rounded text-[8px] font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-0.5">
                                    🔒 ĐÃ ĐẦY / KHÓA ({actualBooked}/{configuredMaxCapacity})
                                  </span>
                                ) : isHighRisk ? (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[8px] font-black uppercase tracking-wider">
                                      RỦI RO CAO
                                    </span>
                                    <span className="text-[8px] font-bold text-amber-600 whitespace-nowrap">{noShowPctStr}</span>
                                  </div>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[8px] font-black uppercase tracking-wider whitespace-nowrap">
                                    ĐANG NHẬN ({actualBooked}/{configuredMaxCapacity})
                                  </span>
                                )}
                                <span className={`text-[9px] font-bold ${isLockedSlot ? 'text-rose-600' : (isHighRisk ? 'text-amber-600' : 'text-slate-500')}`}>
                                  {occupancyPctStr}
                                </span>
                              </div>

                              {/* Progress bar representing actualBooked vs configuredMaxCapacity */}
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                                <div
                                  style={{ width: `${Math.min(100, occupancyPct)}%` }}
                                  className={`h-full ${isHighRisk ? 'bg-rose-500' : 'bg-sky-600'} transition-all duration-300`}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2.5 text-right whitespace-nowrap">
                            {remaining <= 0 ? (
                              <span className="text-slate-400 font-bold text-[10px]">0</span>
                            ) : (
                              <span className="text-indigo-650 font-black text-[10px]">{remaining}</span>
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
                    {loadingDetail ? (
                      <div className="animate-pulse flex items-start gap-4 w-full">
                        <div className="w-14 h-14 bg-slate-200 rounded-full shrink-0"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ) : (() => {
                      const displayCustomer = bookingDetail?.customer || selectedBooking?.customer;
                      // Fallbacks for 500 error protection
                      const fullName = customerDetail?.fullName || bookingDetail?.customerName || displayCustomer?.fullName || displayCustomer?.name || 'Khách lẻ';
                      const phoneNumber = customerDetail?.phoneNumber || bookingDetail?.customerPhone || displayCustomer?.phoneNumber || displayCustomer?.phone || '';
                      const tierName = customerDetail?.tierName || bookingDetail?.customerTier || displayCustomer?.tier || 'N/A';
                      const points = customerDetail?.loyaltyPoints !== undefined ? customerDetail.loyaltyPoints : (displayCustomer?.points ?? 0);
                      const pointsVal = customerDetail?.loyaltyPoints !== undefined ? customerDetail.loyaltyPoints * 1000 : 0;

                      return (
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-base text-slate-800">
                                {fullName}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg border uppercase ${getTierBadgeStyle(customerDetail?.tierName || tierName)}`}
                              >
                                {customerDetail?.tierName || tierName}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-semibold">
                              Số điện thoại: {phoneNumber}
                            </p>

                            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 mt-2.5">
                            </div>
                          </div>
                        </div>
                      );
                    })()}
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

                    {/* Flow 1: Pending, Confirmed, In_progress (Checkout) */}
                    {(selectedBooking.status === 'Pending' || selectedBooking.status === 'Confirmed' || selectedBooking.status === 'In_progress') && (
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
                              className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${tempPaymentMethod === 'Cash' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                            >
                              Tiền mặt
                            </button>
                          </div>
                        </div>

                        {/* Bill Summary */}
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                          <div className="flex justify-between font-bold text-slate-600">
                            <span>Đơn giá dịch vụ gốc:</span>
                            <span>{((selectedBooking.finalAmount || selectedBooking.service?.price || 0) + (selectedBooking.discount || 0)).toLocaleString('vi-VN')} đ</span>
                          </div>
                          {selectedBooking.discount > 0 && (
                            <div className="flex justify-between font-bold text-indigo-600">
                              <span>Đã giảm giá (App - {selectedBooking.voucherApplied || 'Voucher'}):</span>
                              <span>-{selectedBooking.discount.toLocaleString('vi-VN')} đ</span>
                            </div>
                          )}
                          {discountAmount > 0 && (
                            <div className="flex justify-between font-bold text-emerald-600">
                              <span>Voucher tại quầy ({selectedVoucherCode}):</span>
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

                        {/* Check-in window validation (10 mins before to 5 mins after) */}
                        {(() => {
                          const windowInfo = getCheckinWindowInfo(selectedBooking);
                          return (
                            <div className="space-y-3">
                              {!windowInfo.isValid && (
                                <div className={`p-3.5 rounded-xl text-center text-xs font-bold ${windowInfo.isTooEarly ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-rose-50 border border-rose-200 text-rose-700'
                                  }`}>
                                  {windowInfo.message}
                                </div>
                              )}

                              {hasPermission('CHECKOUT_BOOKING') ? (
                                <button
                                  disabled={!windowInfo.isValid}
                                  onClick={() => {
                                    setShowConfirmModal(true);
                                    setShowSuccessModal(false);
                                  }}
                                  className={`w-full text-white text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${windowInfo.isValid
                                    ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer font-outfit'
                                    : 'bg-slate-300 border border-slate-350 text-slate-500 cursor-not-allowed opacity-60'
                                    }`}
                                >
                                  <CheckCircle className="w-4.5 h-4.5" />
                                  Xác nhận Thanh toán & Hoàn tất
                                </button>
                              ) : (
                                <div className="p-3 bg-slate-100 border border-slate-200 text-slate-500 text-center text-xs font-bold rounded-xl">
                                  🔒 Bạn không có quyền thanh toán (CHECKOUT_BOOKING)
                                </div>
                              )}
                            </div>
                          );
                        })()}
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
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 font-bold">
                          <div className="flex justify-between">
                            <span>Thành tiền:</span>
                            <span>{selectedBooking.finalAmount.toLocaleString('vi-VN')} đ ({selectedBooking.paymentMethod === 'Cash' ? 'Tiền mặt' : 'VNPay QR'})</span>
                          </div>
                          <div className="flex justify-between text-emerald-600">
                            <span>Loyalty tích lũy:</span>
                            <span>+{Math.floor(selectedBooking.finalAmount / baseSpendToEarnPoint) * basePointsToEarn * (tierMatrix.find(t => t.key === selectedBooking.customer.tier)?.pointMultiplier || 1.0)} Pts</span>
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

                        {/* Staff Override: "Cứu Đơn" – check-in late with downstream availability guard */}
                        {isNoShowOverrideCandidate(selectedBooking) && hasPermission('CHECKIN_LATE') ? (
                          <button
                            onClick={() => handleCheckinLateOverride(selectedBooking.id || selectedBooking.bookingId)}
                            className="w-full bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white text-xs font-black py-2.5
                        px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer font-outfit"
                          >
                            <Play className="w-4 h-4" />
                            Cứu Đơn – Kiểm tra & Check-in trễ (Trong vòng 15p)
                          </button>
                        ) : (
                          ((selectedBooking.status || '').toUpperCase() === 'CANCELLED_NO_SHOW' || (selectedBooking.status || '').toUpperCase() === 'NO_SHOW') && (
                            <div className="bg-slate-100 border border-slate-200 text-slate-500 p-3 rounded-xl text-center text-[11px] font-bold">
                              🔒 Đã quá 15 phút kể từ giờ bắt đầu — Khóa Cứu Đơn (Bắt buộc khách đặt ca mới)
                            </div>
                          )
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
                        <div className="relative animate-fade-in">
                          <span className="absolute -left-7.5 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </span>
                          <div>
                            <h5 className="font-extrabold text-slate-800">Thanh toán thành công & Hoàn tất</h5>
                            {customerDetail?.lastCompletedBookingAt ? (
                              <p className="text-sm text-gray-600 mt-1">
                                Hoàn thành lúc: {new Date(customerDetail.lastCompletedBookingAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date(customerDetail.lastCompletedBookingAt).toLocaleDateString('vi-VN')}
                              </p>
                            ) : (
                              <p className="text-[9px] text-slate-450 mt-0.5">Xong lúc {selectedBooking.completedTime} (Khung giờ: {selectedBooking.slotTime})</p>
                            )}
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
                  {(selectedBooking.status === 'Pending' || selectedBooking.status === 'Confirmed') && hasPermission('UPDATE_BOOKING_STATUS') && (
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

        {/* PAYMENT CONFIRMATION MODAL */}
        {showConfirmModal && (
          <div
            className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              if (!isSubmitting) {
                setShowConfirmModal(false);
              }
            }}
          >
            <div
              className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 space-y-6 relative border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-650 mb-1">
                  <CreditCard className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base font-black text-slate-800 tracking-tight font-outfit">Xác nhận Thanh toán?</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold px-2">
                  Đơn hàng <strong>{selectedBooking?.id}</strong> trị giá <span className="text-indigo-700 font-bold">{finalAmount.toLocaleString('vi-VN')} đ</span> sẽ được đánh dấu hoàn tất.
                </p>
              </div>

              <div className="w-full flex gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-655 text-xs font-bold rounded-xl transition active:scale-[0.98] cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async (e) => {
                    e.preventDefault();
                    await handleConfirmPayment();
                  }}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Xác nhận'
                  )}
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
                  <p className="text-xs text-slate-400 font-semibold">Đơn <strong>{selectedBooking?.id}</strong> đã được hoàn tất</p>
                </div>
              </div>

              <div className="px-6 pb-2 space-y-0">
                <div className="divide-y divide-slate-100">
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center"><CreditCard className="w-4 h-4 text-indigo-600" /></div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Thành tiền thực thu</span>
                    </div>
                    <span className="text-sm font-black text-slate-800 font-mono">{(successModalData.finalAmount || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center"><Coins className="w-4 h-4 text-amber-600" /></div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Điểm tích lũy đơn này</span>
                    </div>
                    <span className="text-sm font-black text-emerald-600">+{successModalData.pointsEarned || 0} Pts</span>
                  </div>
                  <div className="flex items-center justify-between py-4">
                  </div>
                </div>
                {successModalData.alertUpgradeMessage && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-bold text-amber-700 leading-relaxed">
                    {successModalData.alertUpgradeMessage}
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

        {/* WALK-IN CREATION MODAL */}
        {showWalkInModal && (
          <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-base font-black text-slate-800 font-outfit">Tạo đơn đặt Walk-in (POS)</h3>
                <button onClick={() => setShowWalkInModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <AlertTriangle className="w-5 h-5 rotate-180" />
                </button>
              </div>

              <form onSubmit={handleCreateWalkIn} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Khách hàng</label>
                  <select
                    value={walkInCustomerId}
                    onChange={e => setWalkInCustomerId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    {JSON.parse(localStorage.getItem('autowash_customers') || '[]').map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Ngày đặt</label>
                    <input
                      type="date"
                      value={walkInDate}
                      onChange={e => setWalkInDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Khung giờ</label>
                    <select
                      value={walkInSlotId}
                      onChange={e => {
                        const selectedId = Number(e.target.value);
                        setWalkInSlotId(selectedId);
                        const matched = dbTimeSlots.find(s => Number(s.timeSlotId || s.slotId) === selectedId);
                        if (matched) {
                          setWalkInSlotTime(matched.time || `${matched.startTime} - ${matched.endTime}`);
                        }
                      }}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                    >
                      {dbTimeSlots.length > 0 ? (
                        dbTimeSlots.map(slot => {
                          const sid = Number(slot.timeSlotId || slot.slotId);
                          const label = slot.time || `${slot.startTime} - ${slot.endTime}`;
                          return (
                            <option key={sid} value={sid}>
                              {label} ({slot.maxCapacity} xe/tiếng)
                            </option>
                          );
                        })
                      ) : (
                        <>
                          <option value={1}>07:30 - 08:30</option>
                          <option value={2}>08:30 - 09:30</option>
                          <option value={3}>09:30 - 10:30</option>
                          <option value={4}>10:30 - 11:30</option>
                          <option value={5}>13:00 - 14:00</option>
                          <option value={6}>14:00 - 15:00</option>
                          <option value={7}>15:00 - 16:00</option>
                          <option value={8}>16:00 - 17:00</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Biển số xe</label>
                    <input
                      type="text"
                      value={walkInVehiclePlate}
                      onChange={e => setWalkInVehiclePlate(e.target.value.toUpperCase())}
                      placeholder="29-D1 555.55"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Dòng xe</label>
                    <input
                      type="text"
                      value={walkInVehicleModel}
                      onChange={e => setWalkInVehicleModel(e.target.value)}
                      placeholder="Yamaha Grande"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Dịch vụ</label>
                  <select
                    value={walkInService}
                    onChange={e => {
                      const priceMap = { 'Basic Wash': 70000, 'Premium Wash + Wax': 150000, 'Engine Clean': 200000, 'Full Detail': 450000 };
                      setWalkInService(e.target.value);
                      setWalkInPrice(priceMap[e.target.value] || 70000);
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Basic Wash">Basic Wash (70.000 đ)</option>
                    <option value="Premium Wash + Wax">Premium Wash + Wax (150.000 đ)</option>
                    <option value="Engine Clean">Engine Clean (200.000 đ)</option>
                    <option value="Full Detail">Full Detail (450.000 đ)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4 justify-end border-t">
                  <button
                    type="button"
                    onClick={() => setShowWalkInModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Xác nhận tạo đơn
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* WALK-IN ERROR CONFLICT MODAL */}
        {walkInErrorModal.isOpen && (
          <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800 font-outfit">Lỗi Trùng Lịch Đặt</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{walkInErrorModal.message}</p>
              </div>
              <button
                onClick={() => setWalkInErrorModal({ isOpen: false, message: '' })}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all cursor-pointer font-outfit"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {adminAlert.isOpen && (
          <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100 p-6 flex flex-col items-center text-center space-y-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${adminAlert.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                adminAlert.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                  adminAlert.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                }`}>
                {adminAlert.type === 'success' && <CheckCircle className="w-7 h-7" />}
                {adminAlert.type === 'warning' && <AlertTriangle className="w-7 h-7" />}
                {adminAlert.type === 'error' && <XCircle className="w-7 h-7" />}
                {adminAlert.type === 'info' && <FileText className="w-7 h-7" />}
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800 font-outfit">{adminAlert.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{adminAlert.message}</p>
                {adminAlert.details && (
                  <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] font-mono text-slate-600 text-left">
                    {adminAlert.details}
                  </div>
                )}
              </div>

              <button
                onClick={() => setAdminAlert(prev => ({ ...prev, isOpen: false }))}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all font-outfit cursor-pointer"
              >
                Đã hiểu / Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
