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
  History,
  ClipboardList
} from 'lucide-react';

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

  // 2. Load data from localStorage
  const [selectedDate, setSelectedDate] = useState('2026-07-01');
  const [bookingsDb, setBookingsDb] = useState({});
  const [customersDb, setCustomersDb] = useState([]);
  const [loyaltySettings, setLoyaltySettings] = useState({});
  const [tierMatrix, setTierMatrix] = useState([]);

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

  useEffect(() => {
    loadDataFromStorage();
    // Listen for custom storage events to synchronize screens
    window.addEventListener('storage', loadDataFromStorage);
    return () => window.removeEventListener('storage', loadDataFromStorage);
  }, [selectedDate]);

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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [activeMainTab, setActiveMainTab] = useState('queue'); // 'queue' vs 'history'
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sub-filters
  const [queueSubFilter, setQueueSubFilter] = useState('ALL_QUEUE'); // 'ALL_QUEUE', 'Pending', 'Paid'
  const [historySubFilter, setHistorySubFilter] = useState('ALL_HISTORY'); // 'ALL_HISTORY', 'Completed', 'Canceled'
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('');
  const [qrCodeModalBooking, setQrCodeModalBooking] = useState(null);

  // States inside checkout detail view
  const [tempPointsToRedeem, setTempPointsToRedeem] = useState(0);
  const [tempPaymentMethod, setTempPaymentMethod] = useState('Cash');
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);

  // Load dynamic rates from Settings
  const baseSpendToEarnPoint = loyaltySettings.baseSpend || 10000;
  const basePointsToEarn = loyaltySettings.basePoints || 1;
  const pointCashValuePts = loyaltySettings.pointCashValuePts || 100;
  const pointCashValueVnd = loyaltySettings.pointCashValueVnd || 100000;
  const maxRedemptionPercent = loyaltySettings.maxRedemptionPercent || 80;

  const pointsToCashMultiplier = pointCashValueVnd / pointCashValuePts; // default: 1000đ / 1 pt

  // Extract bookings for today and map customer details from customersDb
  // Lấy danh sách toàn bộ các lịch dọn từ tất cả các ngày (Tìm kiếm chéo ngày E2E)
  const getAllBookings = () => {
    const all = [];
    Object.keys(bookingsDb).forEach(dateKey => {
      const list = bookingsDb[dateKey] || [];
      list.forEach(b => {
        all.push({ ...b, bookingDate: dateKey });
      });
    });
    return all;
  };

  const allBookingsMapped = getAllBookings().map(b => {
    const customer = customersDb.find(c => c.id === b.custId) || {
      name: 'Khách hàng vãng lai',
      phone: b.custId === 'C-01' ? '0912345678' : 'Không có',
      tier: 'Member',
      points: 0,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100'
    };
    const displayPhone = b.custId === 'C-01' ? '0912345678' : (customer.phone || '');
    return { 
      ...b, 
      bookingDate: b.bookingDate || selectedDate, 
      customer: { ...customer, displayPhone } 
    };
  });

  // Nếu gõ tìm kiếm, tìm trên toàn cục, ngược lại chỉ hiện theo ngày đang chọn
  const activeBookingsSource = searchQuery.trim() !== '' 
    ? allBookingsMapped 
    : allBookingsMapped.filter(b => b.bookingDate === selectedDate);

  const bookingsForDate = allBookingsMapped.filter(b => b.bookingDate === selectedDate);

  const heatmapForDate = heatmapDb[selectedDate] || [];
  const selectedBooking = allBookingsMapped.find(b => b.id === selectedBookingId) || null;

  // View transition helpers
  const handleOpenDetail = (booking) => {
    setSelectedBookingId(booking.id);
    setTempPointsToRedeem(booking.pointsRedeemed || 0);
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

  // Enforce Max Redemption rule to prevent business loss:
  // Points discount cannot exceed maxRedemptionPercent% of total price
  const getMaxPointsAllowedToRedeem = (totalPrice, customerPoints) => {
    const maxDiscountAllowed = (maxRedemptionPercent / 100) * totalPrice;
    const maxPointsAllowedByLimit = Math.floor(maxDiscountAllowed / pointsToCashMultiplier);
    return Math.min(customerPoints, maxPointsAllowedByLimit);
  };

  // Action: Confirm Payment & Complete Wash (Combined Check-in & Point Accumulation)
  const handleConfirmPayment = () => {
    if (!selectedBooking) return;

    // Validate points redemption bounds
    const maxAllowedPts = getMaxPointsAllowedToRedeem(selectedBooking.service.price, selectedBooking.customer.points);
    if (tempPointsToRedeem > maxAllowedPts) {
      alert(`Lỗi chốt chặn tài chính!\nSố điểm quy đổi vượt quá giới hạn tối đa (${maxRedemptionPercent}% giá trị gói dịch vụ).\nChỉ được quy đổi tối đa: ${maxAllowedPts} Pts.`);
      setTempPointsToRedeem(maxAllowedPts);
      return;
    }

    const discountAmount = tempPointsToRedeem * pointsToCashMultiplier;
    const finalAmount = Math.max(0, selectedBooking.service.price - discountAmount);

    // Load Tier multipliers dynamically
    const customerTier = selectedBooking.customer.tier;
    const currentTierConfig = tierMatrix.find(t => t.key === customerTier) || { pointMultiplier: 1.0 };
    const tierMultiplier = currentTierConfig.pointMultiplier || 1.0;

    // Spring Boot Logic: Points Earned = floor(final_amount / baseSpend) x basePoints x Tier Multiplier
    const pointsEarned = Math.floor(finalAmount / baseSpendToEarnPoint) * basePointsToEarn * tierMultiplier;

    // Update customer in database (visits + 1, spend + finalAmount, points - redeemed + earned)
    let alertUpgradeMessage = '';
    const updatedCustomers = customersDb.map(c => {
      if (c.id === selectedBooking.customer.id) {
        const newVisits = c.visits + 1;
        const newSpend = c.totalSpend + finalAmount;
        const newPoints = c.points - tempPointsToRedeem + pointsEarned;
        
        // Evaluate upgrade: Scan tier matrix from Platinum -> Gold -> Silver -> Member
        let nextTier = c.tier;
        const sortedTiers = [...tierMatrix].sort((a, b) => b.minSpend - a.minSpend); // highest spend threshold first
        for (let t of sortedTiers) {
          if (newSpend >= t.minSpend) {
            nextTier = t.key;
            break;
          }
        }

        if (nextTier !== c.tier) {
          alertUpgradeMessage = `\n\n🎉 CHÚC MỪNG: Khách hàng ${c.name} đã được thăng hạng từ ${c.tier} lên ${nextTier} thành công do đạt mốc chi tiêu ${newSpend.toLocaleString('vi-VN')} đ!`;
        }

        return {
          ...c,
          visits: newVisits,
          totalSpend: newSpend,
          points: newPoints,
          tier: nextTier
        };
      }
      return c;
    });

    localStorage.setItem('autowash_customers', JSON.stringify(updatedCustomers));
    setCustomersDb(updatedCustomers);

    // Insert Log logs (REDEEM & EARN)
    const pointsLog = JSON.parse(localStorage.getItem('autowash_points_log') || '{}');
    const log = pointsLog[selectedBooking.customer.id] || [];
    let updatedLog = [...log];

    if (tempPointsToRedeem > 0) {
      updatedLog = [
        { date: 'Vừa xong', type: 'REDEEM', amount: tempPointsToRedeem, reason: `Thanh toán giảm giá đơn ${selectedBooking.id}` },
        ...updatedLog
      ];
    }
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
      pointsRedeemed: tempPointsToRedeem,
      discount: discountAmount,
      finalAmount: finalAmount,
      paymentStatus: 'PAID',
      completedTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    saveBookingToDb(updatedBooking);
    alert(`Đã thanh toán & hoàn tất đơn dọn xe thành công!\nSố tiền thực thu: ${finalAmount.toLocaleString('vi-VN')} đ\nTích lũy điểm ví: +${pointsEarned} Pts cho khách hàng ${selectedBooking.customer.name}.${alertUpgradeMessage}`);
    
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
            <div className="flex items-center gap-2.5 bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 shadow-sm">
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
            </div>
          </div>

          {/* Bookings List Card */}
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
                      
                      {/* Loyalty redemption slider / points exchange options */}
                      {selectedBooking.customer.points > 0 && (
                        <div className="bg-indigo-50/40 border border-indigo-100/60 p-3.5 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                            <span className="flex items-center gap-0.5 text-indigo-650 font-black"><Gift className="w-3.5 h-3.5 text-indigo-500" /> Quy đổi điểm ví</span>
                            <span className="text-rose-600 font-black">Chốt chặn max: {maxRedemptionPercent}% bill</span>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            {[0, 50, 100, 200, 500].map(pt => {
                              const maxAllowedPts = getMaxPointsAllowedToRedeem(selectedBooking.service.price, selectedBooking.customer.points);
                              const isOverLimit = pt > maxAllowedPts;
                              
                              if (pt > selectedBooking.customer.points) return null;

                              return (
                                <button
                                  key={pt}
                                  type="button"
                                  disabled={isOverLimit}
                                  onClick={() => setTempPointsToRedeem(pt)}
                                  className={`w-full py-1.5 px-3 rounded-lg border text-[11px] font-extrabold text-left transition-all flex justify-between items-center ${
                                    isOverLimit ? 'bg-slate-50 text-slate-350 border-slate-100 cursor-not-allowed' :
                                    tempPointsToRedeem === pt 
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                      : 'bg-white hover:bg-slate-50 text-slate-650'
                                  }`}
                                >
                                  <span>{pt === 0 ? 'Không tiêu điểm thưởng' : `Đổi ${pt} điểm`}</span>
                                  <span>{pt === 0 ? '' : isOverLimit ? 'Vượt quá hạn mức 80%' : `-${(pt * pointsToCashMultiplier).toLocaleString('vi-VN')} đ`}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

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
                          <button
                            onClick={() => setTempPaymentMethod('VNPay')}
                            className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                              tempPaymentMethod === 'VNPay' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            VNPay QR
                          </button>
                        </div>
                      </div>

                      {/* Bill Summary */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between font-bold text-slate-600">
                          <span>Đơn giá gói chính:</span>
                          <span>{selectedBooking.service.price.toLocaleString('vi-VN')} đ</span>
                        </div>
                        {tempPointsToRedeem > 0 && (
                          <div className="flex justify-between font-bold text-emerald-600">
                            <span>Chiết khấu tiêu điểm:</span>
                            <span>-{(tempPointsToRedeem * pointsToCashMultiplier).toLocaleString('vi-VN')} đ</span>
                          </div>
                        )}
                        <div className="h-px bg-slate-250 my-2" />
                        <div className="flex justify-between font-black text-sm text-slate-800">
                          <span>Thành tiền thực thu:</span>
                          <span className="text-indigo-700">
                            {Math.max(0, selectedBooking.service.price - (tempPointsToRedeem * pointsToCashMultiplier)).toLocaleString('vi-VN')} đ
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

                  {/* Flow 4: Canceled */}
                  {selectedBooking.status === 'Canceled' && (
                    <div className="space-y-3 text-xs text-slate-600">
                      <div className="bg-rose-50 text-rose-700 border border-rose-100 p-4 rounded-xl text-center font-bold">
                        <span className="font-extrabold text-sm flex items-center justify-center gap-1"><Ban className="w-4 h-4" /> Lịch dọn đã hủy bỏ</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Lý do hủy đơn</div>
                        <p className="italic mt-1 leading-relaxed">{selectedBooking.cancelReason || 'Không rõ lý do'}</p>
                      </div>
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

    </div>
  );
}
