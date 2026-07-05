import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Gift, 
  MessageSquare, 
  Search, 
  Coins, 
  CreditCard, 
  CheckCircle, 
  X, 
  User, 
  Bike, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Star, 
  Heart, 
  Frown, 
  Check, 
  Send,
  Calendar,
  Layers,
  Sparkles,
  Award,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Edit,
  Trash2
} from 'lucide-react';

export default function AdminCustomersLoyaltyPage() {
  // 1. Navigation Active Tab
  const [activeTab, setActiveTab] = useState('crm'); // 'crm', 'campaigns', 'feedback'

  // Tier Levels weights for cumulative filters (Platinum > Gold > Silver > Member)
  const tierLevels = {
    'Member': 0,
    'Silver': 1,
    'Gold': 2,
    'Platinum': 3,
    'VIP': 3 // Map VIP to Platinum if any legacy reference exists
  };

  // 2. STATES WITH LOCALSTORAGE FOR E2E SYNCHRONIZATION
  const [customers, setCustomers] = useState([]);
  const [customerBookings, setCustomerBookings] = useState({});
  const [customerPointsLog, setCustomerPointsLog] = useState({});
  const [customerVouchers, setCustomerVouchers] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

const seedDatabase = () => {
  if (!localStorage.getItem('autowash_loyalty_settings')) {
    localStorage.setItem('autowash_loyalty_settings', JSON.stringify({
      basePoints: 1,
      baseSpend: 10000,
      roundDown: true,
      pointCashValuePts: 100,
      pointCashValueVnd: 100000,
      maxRedemptionPercent: 80,
      pointValidityMonths: 12,
      downgradeInactivityMonths: 6
    }));
  }
  if (!localStorage.getItem('autowash_tiers')) {
    localStorage.setItem('autowash_tiers', JSON.stringify([
      { key: 'Member', name: 'Member', minSpend: 0, pointMultiplier: 1.0, bookingWindow: 7, isActive: true },
      { key: 'Silver', name: 'Silver', minSpend: 1000000, pointMultiplier: 1.2, bookingWindow: 7, isActive: true },
      { key: 'Gold', name: 'Gold', minSpend: 5000000, pointMultiplier: 1.5, bookingWindow: 14, isActive: true },
      { key: 'Platinum', name: 'Platinum', minSpend: 10000000, pointMultiplier: 2.0, bookingWindow: 14, isActive: true }
    ]));
  }
  if (!localStorage.getItem('autowash_customers') || JSON.parse(localStorage.getItem('autowash_customers')).length === 0) {
    localStorage.setItem('autowash_customers', JSON.stringify([
      { id: 'C-01', name: 'Nguyễn Minh Anh', phone: '0912***456', tier: 'Platinum', points: 1240, totalSpend: 15400000, visits: 24, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100', lastVisitDays: 5, status: 'Active' },
      { id: 'C-02', name: 'Lê Hoàng Long', phone: '0903***888', tier: 'Silver', points: 320, totalSpend: 3800000, visits: 8, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100', lastVisitDays: 14, status: 'Active' },
      { id: 'C-03', name: 'Hoàng Linh', phone: '0977***444', tier: 'Gold', points: 750, totalSpend: 8200000, visits: 14, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', lastVisitDays: 8, status: 'Active' },
      { id: 'C-04', name: 'Trần Đức Bo', phone: '0988***123', tier: 'Member', points: 80, totalSpend: 950000, visits: 2, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', lastVisitDays: 45, status: 'Active' },
      { id: 'C-05', name: 'Phạm Văn Nam', phone: '0944***555', tier: 'Member', points: 10, totalSpend: 320000, visits: 1, avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100', lastVisitDays: 75, status: 'Active' }
    ]));
  }
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
  if (!localStorage.getItem('autowash_bookings')) {
    const initialBookings = {
      '2026-06-30': [
        { id: 'AW-9801', slotTime: '08:30', custId: 'C-04', vehicle: { type: 'Xe máy', model: 'Yamaha Grande', plate: '29-D1 555.55' }, service: { name: 'Basic Wash', price: 70000 }, status: 'Completed', createdTime: '30/06, 07:15 AM via Mobile App', paymentMethod: 'VNPay', pointsRedeemed: 0, discount: 0, finalAmount: 70000, completedTime: '08:52 AM', estimatedDuration: 20, source: 'APP', paymentStatus: 'PAID' },
        { id: 'AW-9802', slotTime: '10:00', custId: 'C-01', vehicle: { type: 'Xe máy', model: 'Honda Lead', plate: '30-H2 333.33' }, service: { name: 'Premium Wash + Wax', price: 150000 }, status: 'Completed', createdTime: '30/06, 08:30 AM via Mobile App', paymentMethod: 'Cash', pointsRedeemed: 50, discount: 50000, finalAmount: 100000, completedTime: '10:32 AM', estimatedDuration: 30, source: 'APP', paymentStatus: 'PAID' }
      ],
      '2026-07-01': [
        { id: 'AW-9821', slotTime: '14:30', custId: 'C-01', vehicle: { type: 'Xe máy', model: 'Honda SH 150i', plate: '29-G1 888.88' }, service: { name: 'Premium Wash + Wax', price: 150000 }, status: 'Pending', createdTime: 'Hôm nay, 09:15 AM via Mobile App', paymentMethod: null, pointsRedeemed: 0, discount: 0, finalAmount: 150000, estimatedDuration: 25, source: 'APP', paymentStatus: 'UNPAID' },
        { id: 'AW-9819', slotTime: '14:00', custId: 'C-04', vehicle: { type: 'Xe máy', model: 'Honda Vision', plate: '59-S2 123.45' }, service: { name: 'Basic Wash', price: 70000 }, status: 'Pending', createdTime: 'Hôm nay, 11:30 AM via Mobile App', paymentMethod: null, pointsRedeemed: 0, discount: 0, finalAmount: 70000, note: 'Khách đến muộn 15 phút', estimatedDuration: 15, source: 'APP', paymentStatus: 'UNPAID' },
        { id: 'AW-9815', slotTime: '13:45', custId: 'C-02', vehicle: { type: 'Xe máy', model: 'Vespa GTS', plate: '30-K3 999.01' }, service: { name: 'Full Detail', price: 450000 }, status: 'Paid', createdTime: 'Hôm nay, 08:45 AM via Mobile App', paymentMethod: 'Cash', pointsRedeemed: 200, discount: 200000, finalAmount: 250000, estimatedDuration: 40, source: 'APP', paymentStatus: 'PAID' },
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
};

  const loadAllStorage = () => {
    seedDatabase();
    const custs = JSON.parse(localStorage.getItem('autowash_customers') || '[]');
    const books = JSON.parse(localStorage.getItem('autowash_bookings') || '{}');
    const logs = JSON.parse(localStorage.getItem('autowash_points_log') || '{}');
    const vchs = JSON.parse(localStorage.getItem('autowash_vouchers') || '{}');
    
    // Convert date-grouped bookings to customer-grouped list
    const formattedBookings = {};
    custs.forEach(c => {
      formattedBookings[c.id] = [];
    });
    
    Object.keys(books).forEach(date => {
      books[date].forEach(b => {
        if (formattedBookings[b.custId]) {
          formattedBookings[b.custId].push({
            id: b.id,
            date: date,
            service: b.service.name,
            amount: b.finalAmount,
            status: b.status
          });
        }
      });
    });

    // Campaigns list (Initialize if empty)
    if (!localStorage.getItem('autowash_campaigns')) {
      const defaultCampaigns = [
        { code: 'SUMMER24', name: 'Voucher Mùa Hè Rực Rỡ', discountType: 'cash', value: 50000, costPoints: 0, minTier: 'Gold', minRecencyDays: 0, startDate: '2026-06-01', endDate: '2026-07-31', budgetStatus: '90% Đã dùng (112M / 125M)', isActive: true },
        { code: 'WELCOME50', name: 'Quà chào mừng thành viên mới', discountType: 'percent', value: 10, costPoints: 0, minTier: 'Member', minRecencyDays: 0, startDate: '2026-01-01', endDate: '2026-12-31', budgetStatus: '45% Đã dùng', isActive: true },
        { code: 'PLATINUMPRO', name: 'Tri ân khách hàng Kim Cương', discountType: 'cash', value: 100000, costPoints: 0, minTier: 'Platinum', minRecencyDays: 0, startDate: '2026-06-15', endDate: '2026-07-15', budgetStatus: '60% Đã dùng', isActive: true },
        { code: 'RETENTION', name: 'Kích hoạt khách cũ quay lại', discountType: 'cash', value: 30000, costPoints: 0, minTier: 'Member', minRecencyDays: 60, startDate: '2026-07-01', endDate: '2026-07-31', budgetStatus: '10% Đã dùng', isActive: true },
        { code: 'VOUCHER_FREE', name: 'Voucher Rửa Xe Miễn Phí (Đồng Giá)', discountType: 'free_wash', value: 0, costPoints: 1000, minTier: 'Member', minRecencyDays: 0, startDate: '2026-01-01', endDate: '2026-12-31', budgetStatus: 'Vận hành tốt', isActive: true },
        { code: 'VOUCHER_50K', name: 'Voucher Giảm Giá 50k', discountType: 'cash', value: 50000, costPoints: 450, minTier: 'Member', minRecencyDays: 0, startDate: '2026-01-01', endDate: '2026-12-31', budgetStatus: 'Vận hành tốt', isActive: true },
        { code: 'VOUCHER_DETAIL', name: 'Voucher Giảm 50% Gói Full Detail', discountType: 'percent', value: 50, costPoints: 800, minTier: 'Silver', minRecencyDays: 0, startDate: '2026-01-01', endDate: '2026-12-31', budgetStatus: 'Vận hành tốt', isActive: true }
      ];
      localStorage.setItem('autowash_campaigns', JSON.stringify(defaultCampaigns));
    }
    const camps = JSON.parse(localStorage.getItem('autowash_campaigns'));

    setCustomers(custs);
    setCustomerBookings(formattedBookings);
    setCustomerPointsLog(logs);
    setCustomerVouchers(vchs);
    setCampaigns(camps);

    // Nạp danh sách feedbacks từ localStorage hoặc khởi tạo mặc định (E2E)
    const defaultFeedbacks = [
      { id: 'F-01', date: 'Hôm nay, 10:15', customer: { name: 'Trần Đức Bo', phone: '0988***123', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', id: 'C-04' }, rating: 2, comment: 'Thời gian dọn rửa hơi lâu, xe máy Vision của tôi lúc nhận lại còn vài chỗ chưa lau khô hẳn.', sentiment: 'Negative', status: 'New', bookingId: 'AW-9819', internalNotes: '' },
      { id: 'F-02', date: 'Hôm nay, 08:30', customer: { name: 'Nguyễn Minh Anh', phone: '0912***456', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100', id: 'C-01' }, rating: 5, comment: 'Dịch vụ rửa Premium rất tốt, xe phủ bóng ceramic đi mưa trơn tru, nhân viên rất nhiệt tình!', sentiment: 'Positive', status: 'Reviewed', bookingId: 'AW-9821', internalNotes: '' },
      { id: 'F-03', date: 'Hôm qua, 16:45', customer: { name: 'Lê Hoàng Long', phone: '0903***888', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100', id: 'C-02' }, rating: 4, comment: 'Rửa sạch sẽ tỉ mỉ, gầm xe sạch đất cát đỏ. Có phòng chờ điều hòa mát mẻ uống nước. Sẽ quay lại.', sentiment: 'Positive', status: 'Resolved', bookingId: 'AW-9815', internalNotes: 'Đã phản hồi cảm ơn khách hàng.' },
      { id: 'F-04', date: 'Hôm qua, 11:20', customer: { name: 'Phạm Văn Nam', phone: '0944***555', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100', id: 'C-05' }, rating: 1, comment: 'Yên xe Exciter bị xước một đường nhỏ sau khi dắt từ khoang 1 ra. Đề nghị chủ cửa hàng làm rõ thái độ làm việc!', sentiment: 'Negative', status: 'New', bookingId: 'AW-9840', internalNotes: '' }
    ];
    let fbs = [];
    const savedFbs = localStorage.getItem('autowash_feedbacks');
    if (savedFbs) {
      fbs = JSON.parse(savedFbs);
    } else {
      localStorage.setItem('autowash_feedbacks', JSON.stringify(defaultFeedbacks));
      fbs = defaultFeedbacks;
    }
    setFeedbacks(fbs);
  };

  useEffect(() => {
    loadAllStorage();
    window.addEventListener('storage', loadAllStorage);
    return () => window.removeEventListener('storage', loadAllStorage);
  }, []);

  // 3. INTERACTIVE STATES
  // Search CRM
  const [crmSearch, setCrmSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState('bookings');

  // Unified campaign config form
  const [campaignForm, setCampaignForm] = useState({
    code: '',
    name: '',
    discountType: 'cash', // 'cash', 'percent', 'free_wash'
    value: '',
    costPoints: '0', // 0: Free Gift, >0: Point Exchange Shop
    minTier: 'Member', // 'Member', 'Silver', 'Gold', 'Platinum'
    minRecencyDays: '0', // 0, 30, 60
    startDate: '2026-07-01',
    endDate: '2026-08-01'
  });

  // Feedback Resolution Modal
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [issueCompensation, setIssueCompensation] = useState(false);

  // 4. BUSINESS LOGIC HANDLERS

  // Calculate Audience Preview count (Cumulative Level Match Platinum >= Gold >= Silver >= Member)
  const getAudiencePreviewCount = () => {
    return customers.filter(c => {
      const customerLevel = tierLevels[c.tier] ?? 0;
      const targetLevel = tierLevels[campaignForm.minTier] ?? 0;
      
      // Rule: "Từ hạng được chọn trở lên"
      const matchRank = customerLevel >= targetLevel;
      const matchRecency = c.lastVisitDays >= Number(campaignForm.minRecencyDays);
      return matchRank && matchRecency;
    }).length;
  };

  // Action: Launch campaign / voucher rule
  const handleLaunchCampaign = (e) => {
    e.preventDefault();
    if (!campaignForm.code.trim() || !campaignForm.name.trim()) {
      alert('Vui lòng nhập đầy đủ Mã và Tên voucher!');
      return;
    }

    if (campaignForm.discountType !== 'free_wash' && !campaignForm.value) {
      alert('Vui lòng nhập giá trị giảm giá!');
      return;
    }

    let discountLabel = '';
    if (campaignForm.discountType === 'cash') {
      discountLabel = `${Number(campaignForm.value).toLocaleString('vi-VN')} đ`;
    } else if (campaignForm.discountType === 'percent') {
      discountLabel = `${campaignForm.value}%`;
    } else {
      discountLabel = 'Rửa miễn phí (100%)';
    }

    const newCampaign = {
      code: campaignForm.code.toUpperCase(),
      name: campaignForm.name,
      discountType: campaignForm.discountType,
      value: campaignForm.discountType === 'free_wash' ? 0 : Number(campaignForm.value),
      costPoints: Number(campaignForm.costPoints),
      minTier: campaignForm.minTier,
      minRecencyDays: Number(campaignForm.minRecencyDays),
      startDate: campaignForm.startDate,
      endDate: campaignForm.endDate,
      budgetStatus: Number(campaignForm.costPoints) > 0 ? 'Đang hoạt động quy đổi' : 'Hoạt động phát tặng',
      isActive: true
    };

    const updatedCamps = [newCampaign, ...campaigns];
    setCampaigns(updatedCamps);
    localStorage.setItem('autowash_campaigns', JSON.stringify(updatedCamps));

    // If costPoints == 0, distribute to wallet of eligible customers (Rank matches minTier and above)
    const pointsRequired = Number(campaignForm.costPoints);
    if (pointsRequired === 0) {
      const targetList = customers.filter(c => {
        const customerLevel = tierLevels[c.tier] ?? 0;
        const targetLevel = tierLevels[campaignForm.minTier] ?? 0;
        const matchRank = customerLevel >= targetLevel;
        const matchRecency = c.lastVisitDays >= Number(campaignForm.minRecencyDays);
        return matchRank && matchRecency;
      });

      const updatedVouchers = { ...customerVouchers };
      targetList.forEach(c => {
        const wallet = updatedVouchers[c.id] || [];
        updatedVouchers[c.id] = [
          { code: campaignForm.code.toUpperCase(), name: campaignForm.name, value: discountLabel, status: 'ISSUED' },
          ...wallet
        ];
      });

      setCustomerVouchers(updatedVouchers);
      localStorage.setItem('autowash_vouchers', JSON.stringify(updatedVouchers));

      alert(`Đã phát hành chiến dịch Voucher tiếp thị ${campaignForm.code}!\nVoucher miễn phí đã bay trực tiếp vào Ví Voucher của ${targetList.length} khách hàng có hạng ${campaignForm.minTier} trở lên.`);
    } else {
      alert(`Đã khởi tạo quy định đổi điểm cho Voucher ${campaignForm.code}!\nVoucher trị giá ${discountLabel} (cần ${pointsRequired} Pts) đã được cấu hình và xuất hiện tại Shop quy đổi cho thành viên từ hạng ${campaignForm.minTier} trở lên.`);
    }

    // Reset Form
    setCampaignForm({
      code: '',
      name: '',
      discountType: 'cash',
      value: '',
      costPoints: '0',
      minTier: 'Member',
      minRecencyDays: '0',
      startDate: '2026-07-01',
      endDate: '2026-08-01'
    });

    window.dispatchEvent(new Event('storage'));
  };

  // Toggle active campaign
  const handleToggleCampaign = (code) => {
    const updated = campaigns.map(c => {
      if (c.code === code) {
        const nextState = !c.isActive;
        alert(`Đã ${nextState ? 'Kích hoạt' : 'Tạm dừng'} chiến dịch ${code}`);
        return { ...c, isActive: nextState };
      }
      return c;
    });
    setCampaigns(updated);
    localStorage.setItem('autowash_campaigns', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  // Delete a campaign
  const handleDeleteCampaign = (code) => {
    if (confirm(`Bạn có chắc chắn muốn xóa chiến dịch/luật đổi voucher ${code} không?`)) {
      const updated = campaigns.filter(c => c.code !== code);
      setCampaigns(updated);
      localStorage.setItem('autowash_campaigns', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      alert(`Đã xóa hoàn toàn chiến dịch ${code}.`);
    }
  };

  // Action: Redeem points for a voucher at the counter (Dynamic query check)
  const handleRedeemVoucher = (camp) => {
    const activeCustomer = customers.find(c => c.id === selectedCustomerId);
    if (!activeCustomer) return;

    if (activeCustomer.points < camp.costPoints) {
      alert(`Khách hàng ${activeCustomer.name} không đủ điểm ví! Cần ${camp.costPoints} Pts để đổi nhưng hiện có ${activeCustomer.points} Pts.`);
      return;
    }

    const discountLabel = camp.discountType === 'free_wash' ? 'Rửa xe miễn phí' :
                          camp.discountType === 'percent' ? `${camp.value}%` : `${camp.value.toLocaleString('vi-VN')} đ`;

    // 1. Deduct points from customer
    const updatedCusts = customers.map(c => {
      if (c.id === activeCustomer.id) {
        return { ...c, points: c.points - camp.costPoints };
      }
      return c;
    });
    setCustomers(updatedCusts);
    localStorage.setItem('autowash_customers', JSON.stringify(updatedCusts));

    // 2. Add voucher to wallet
    const updatedVouchers = { ...customerVouchers };
    const wallet = updatedVouchers[activeCustomer.id] || [];
    updatedVouchers[activeCustomer.id] = [
      { code: camp.code, name: camp.name, value: discountLabel, status: 'ISSUED' },
      ...wallet
    ];
    setCustomerVouchers(updatedVouchers);
    localStorage.setItem('autowash_vouchers', JSON.stringify(updatedVouchers));

    // 3. Log point transaction
    const updatedLogs = { ...customerPointsLog };
    const log = updatedLogs[activeCustomer.id] || [];
    updatedLogs[activeCustomer.id] = [
      { date: 'Vừa xong', type: 'REDEEM', amount: camp.costPoints, reason: `Đổi điểm lấy ${camp.name} tại quầy` },
      ...log
    ];
    setCustomerPointsLog(updatedLogs);
    localStorage.setItem('autowash_points_log', JSON.stringify(updatedLogs));

    window.dispatchEvent(new Event('storage'));
    alert(`Quy đổi thành công! Đã đổi -${camp.costPoints} Pts của khách ${activeCustomer.name} lấy voucher ${camp.name}.`);
  };

  // Action: Open Feedback Resolution Form
  const handleOpenFeedbackModal = (fb) => {
    setSelectedFeedbackId(fb.id);
    setInternalNote(fb.internalNotes || '');
    setIssueCompensation(false);
    setFeedbackModalOpen(true);
  };

  // Action: Resolve Customer Complaint
  const handleResolveFeedback = (e) => {
    e.preventDefault();
    if (!internalNote.trim()) {
      alert('Vui lòng viết ghi chú xử lý khiếu nại!');
      return;
    }

    const currentFeedback = feedbacks.find(f => f.id === selectedFeedbackId);
    if (!currentFeedback) return;

    // 1. Mark review as Resolved and save internal notes to localStorage (Đường E2E)
    const updatedFeedbacks = feedbacks.map(f => {
      if (f.id === selectedFeedbackId) {
        return { ...f, status: 'Resolved', internalNotes: internalNote };
      }
      return f;
    });
    setFeedbacks(updatedFeedbacks);
    localStorage.setItem('autowash_feedbacks', JSON.stringify(updatedFeedbacks));

    // 2. If Compensation Voucher is checked, push a voucher into customer's wallet (E2E compensation flow!)
    if (issueCompensation) {
      const custId = currentFeedback.customer.id;
      const updatedVouchers = { ...customerVouchers };
      const wallet = updatedVouchers[custId] || [];
      updatedVouchers[custId] = [
        { code: 'COMPENSATE50', name: 'Voucher Đền Bù Chăm Sóc Khách Hàng', value: '50.000 đ', status: 'ISSUED' },
        ...wallet
      ];
      setCustomerVouchers(updatedVouchers);
      localStorage.setItem('autowash_vouchers', JSON.stringify(updatedVouchers));
      
      window.dispatchEvent(new Event('storage'));
      alert(`Đã xử lý khiếu nại thành công!\nĐã gửi tặng Voucher đền bù (COMPENSATE50 trị giá 50k) trực tiếp vào ví voucher của khách hàng ${currentFeedback.customer.name} để tạ lỗi.`);
    } else {
      alert('Đã cập nhật trạng thái xử lý khiếu nại thành công.');
    }

    setFeedbackModalOpen(false);
  };

  // Filter CRM Customers
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(crmSearch.toLowerCase()) ||
    c.phone.includes(crmSearch)
  );

  // Get current active profile customer
  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || null;

  // Filter out Point-Redeemable campaigns active for the activeCustomer
  const redeemableVouchersForCustomer = campaigns.filter(camp => {
    if (!camp.isActive || camp.costPoints <= 0) return false;
    if (!activeCustomer) return false;

    const customerLevel = tierLevels[activeCustomer.tier] ?? 0;
    const targetLevel = tierLevels[camp.minTier] ?? 0;

    // Rule: Customer tier must be >= the minTier configured in the rule
    return customerLevel >= targetLevel;
  });

  return (
    <div className="flex flex-col h-full bg-[#f7fafd] text-slate-800 p-5 space-y-5 overflow-hidden">
      
      {/* 1. Header & Main Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight font-outfit">Customers & Loyalty Strategy</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Hồ sơ khách hàng, phát hành voucher tiếp thị và giải quyết ý kiến đánh giá từ AI.</p>
        </div>

        {/* Tab switchers */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-1 flex gap-1 text-xs text-slate-500 shadow-sm self-start md:self-auto z-10">
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-4.5 py-2 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'crm'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:text-slate-800 hover:bg-slate-55'
            }`}
          >
            <Users className="w-4 h-4" />
            Khách hàng & Ví Voucher
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4.5 py-2 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'campaigns'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:text-slate-800 hover:bg-slate-55'
            }`}
          >
            <Gift className="w-4 h-4" />
            Chiến dịch Khuyến mãi
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4.5 py-2 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:text-slate-800 hover:bg-slate-55'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Ý kiến phản hồi ({feedbacks.filter(f=>f.status==='New').length} mới)
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TAB CONTENT: CUSTOMER CRM                             */}
      {/* ======================================================== */}
      {activeTab === 'crm' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          {/* Search Header */}
          <div className="flex justify-between items-center shrink-0">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm khách hàng, số điện thoại..."
                value={crmSearch}
                onChange={e => setCrmSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 placeholder:text-slate-455 focus:outline-none focus:ring-2 focus:ring-indigo-650/10 focus:border-indigo-650 shadow-sm"
              />
            </div>
            <div className="text-[10px] text-slate-400 font-bold bg-white px-3 py-1.5 border border-slate-200/50 rounded-xl">
              Tổng số thành viên: {customers.length} khách hàng
            </div>
          </div>

          {/* CRM Table */}
          <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider z-10">
                  <tr>
                    <th className="py-3 px-5">Mã thành viên</th>
                    <th className="py-3 px-4">Tên khách hàng</th>
                    <th className="py-3 px-4">Hạng thành viên</th>
                    <th className="py-3 px-4 text-right">Ví điểm Loyalty</th>
                    <th className="py-3 px-4 text-right">Tổng chi tiêu lũy kế</th>
                    <th className="py-3 px-4 text-center">Số lượt dọn rửa</th>
                    <th className="py-3 px-4 text-center">Vắng mặt (Ngày)</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-5 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-black text-slate-800">{c.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-850">
                        <div className="flex items-center gap-2">
                          <img src={c.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200" />
                          <span>{c.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 font-bold rounded-lg text-[10px] ${
                          c.tier === 'Platinum' || c.tier === 'VIP' ? 'bg-[#57f287] text-slate-800' :
                          c.tier === 'Gold' ? 'bg-amber-100 text-amber-800 border border-amber-200/50' :
                          c.tier === 'Silver' ? 'bg-slate-100 text-slate-700 border border-slate-200/50' : 'bg-slate-50 text-slate-500'
                        }`}>
                          {c.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-amber-600">
                        {c.points.toLocaleString()} Pts
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-800">
                        {c.totalSpend.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-indigo-650">{c.visits} lần</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-semibold ${c.lastVisitDays >= 60 ? 'text-rose-600 font-extrabold' : 'text-slate-500'}`}>
                          {c.lastVisitDays} ngày trước
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'Suspended' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {c.status === 'Suspended' ? 'Tạm khóa (Hết hạn)' : 'Đang hoạt động'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => { setSelectedCustomerId(c.id); setProfileModalOpen(true); }}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg shadow-sm cursor-pointer"
                        >
                          Xem hồ sơ & Ví
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAB CONTENT: MARKETING CAMPAIGNS & POINT SHOP         */}
      {/* ======================================================== */}
      {activeTab === 'campaigns' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-5 overflow-y-auto no-scrollbar">
          
          {/* 3.1. Campaign KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 shrink-0">
            <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Ngân sách đầu tư</span>
                <h4 className="text-lg font-black text-slate-850 mt-1">125,400,000 đ</h4>
              </div>
              <div className="w-8.5 h-8.5 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Coins className="w-4.5 h-4.5 text-indigo-600" />
              </div>
            </div>
            <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Chiến dịch kích hoạt</span>
                <h4 className="text-lg font-black text-indigo-700 mt-1">{campaigns.filter(c=>c.isActive).length} chiến dịch</h4>
              </div>
              <div className="w-8.5 h-8.5 bg-slate-50 rounded-xl flex items-center justify-center">
                <Gift className="w-4.5 h-4.5 text-slate-500" />
              </div>
            </div>
            <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Voucher đã dùng / phát</span>
                <h4 className="text-lg font-black text-emerald-700 mt-1">1,240 / 1,890 mã</h4>
              </div>
              <div className="w-8.5 h-8.5 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
              </div>
            </div>
            <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tỷ lệ ROI tiếp thị</span>
                <h4 className="text-lg font-black text-amber-700 mt-1">3.2x hiệu quả</h4>
              </div>
              <div className="w-8.5 h-8.5 bg-amber-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5 text-amber-600" />
              </div>
            </div>
          </div>

          {/* 3.2. Split Grid: Launch Campaign Form (Left) & Ledger (Right) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
            
            {/* Unified Campaign & Point-redeem rule creator */}
            <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-indigo-650" />
                Thiết lập Voucher & Quy đổi điểm
              </h3>
              
              <form onSubmit={handleLaunchCampaign} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Mã Voucher phát hành *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: DONGGIA30, FREEWASH..."
                    value={campaignForm.code}
                    onChange={e => setCampaignForm({...campaignForm, code: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-700 font-bold uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Tên voucher / Tên hiển dịch chiến dịch *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mô tả voucher (ví dụ: Voucher 50k tri ân...)"
                    value={campaignForm.name}
                    onChange={e => setCampaignForm({...campaignForm, name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Kiểu chiết khấu</label>
                    <select
                      value={campaignForm.discountType}
                      onChange={e => setCampaignForm({...campaignForm, discountType: e.target.value, value: ''})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-650/10 focus:border-indigo-650 text-slate-700 font-semibold"
                    >
                      <option value="cash">Trừ tiền mặt (đ)</option>
                      <option value="percent">Trừ % đơn hàng</option>
                      <option value="free_wash">Rửa miễn phí (Giảm 100%)</option>
                    </select>
                  </div>
                  {campaignForm.discountType !== 'free_wash' && (
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Giá trị giảm *</label>
                      <input
                        type="number"
                        required
                        placeholder={campaignForm.discountType === 'cash' ? 'Ví dụ: 30000' : 'Ví dụ: 10'}
                        value={campaignForm.value}
                        onChange={e => setCampaignForm({...campaignForm, value: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-650/10 focus:border-indigo-650 text-slate-700 font-bold"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Ngày bắt đầu hiệu lực</label>
                    <input
                      type="date"
                      required
                      value={campaignForm.startDate}
                      onChange={e => setCampaignForm({...campaignForm, startDate: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Ngày kết thúc hiệu lực</label>
                    <input
                      type="date"
                      required
                      value={campaignForm.endDate}
                      onChange={e => setCampaignForm({...campaignForm, endDate: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="bg-amber-50/30 border border-amber-200/50 p-3 rounded-xl space-y-1">
                  <label className="font-black text-amber-800 block uppercase text-[10px]">Cài đặt Quy đổi điểm ví</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Nhập 0 nếu phát miễn phí"
                    value={campaignForm.costPoints}
                    onChange={e => setCampaignForm({...campaignForm, costPoints: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-amber-200/60 rounded-lg text-slate-700 text-xs font-black text-center focus:ring-amber-500 focus:border-amber-500"
                  />
                  <span className="text-[9px] text-slate-450 block">Nhập `0` để **phát miễn phí trực tiếp**. Nhập `&gt; 0` (ví dụ `500`) nếu muốn khách **đổi điểm** để lấy.</span>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bộ lọc & Điều kiện nhận (Targeting Rules)</h4>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Hạng thành viên tối thiểu *</label>
                    <select
                      value={campaignForm.minTier}
                      onChange={e => setCampaignForm({...campaignForm, minTier: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Member">Tất cả các hạng (Từ Member trở lên)</option>
                      <option value="Silver">Từ hạng Silver trở lên</option>
                      <option value="Gold">Từ hạng Gold trở lên</option>
                      <option value="Platinum">Từ hạng Platinum trở lên</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Số ngày vắng mặt tối thiểu</label>
                    <select
                      value={campaignForm.minRecencyDays}
                      onChange={e => setCampaignForm({...campaignForm, minRecencyDays: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="0">Không lọc số ngày vắng mặt</option>
                      <option value="30">Vắng mặt &gt; 30 ngày</option>
                      <option value="60">Vắng mặt &gt; 60 ngày (Nguy cơ rời bỏ)</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Audience Preview Counter */}
                <div className="bg-indigo-50/40 border border-indigo-100/60 p-3.5 rounded-xl space-y-1.5">
                  <div className="text-[10px] text-indigo-700 font-extrabold uppercase flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Dự kiến tệp đối tượng nhận</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-indigo-700">{getAudiencePreviewCount()}</span>
                    <span className="text-[10px] text-indigo-600 font-bold">khách hàng thỏa mãn điều kiện.</span>
                  </div>
                  <p className="text-[9px] text-slate-400">
                    {Number(campaignForm.costPoints) > 0 
                      ? "Voucher sẽ hiển thị ở Quầy đổi điểm cho nhóm khách hàng đủ điều kiện." 
                      : "Voucher phát tặng miễn phí sẽ tự động chuyển thẳng vào ví của nhóm khách hàng này."}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0047AB] hover:bg-[#003a8c] text-white text-xs font-black py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-[0.99]"
                >
                  <Send className="w-4 h-4" />
                  Kích hoạt & Phát hành chiến dịch
                </button>
              </form>

            </div>

            {/* Campaign Ledger (CRUD interface) */}
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col xl:col-span-2 text-xs space-y-4 pb-4">
              <div className="p-4.5 border-b border-slate-100 font-black text-slate-700 uppercase tracking-wider text-[10px]">
                Sổ cái quản lý Voucher & Chiến dịch Quy đổi điểm ví
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Mã Voucher</th>
                      <th className="py-2.5 px-3">Tên voucher</th>
                      <th className="py-2.5 px-3">Trị giá</th>
                      <th className="py-2.5 px-3">Yêu cầu điểm</th>
                      <th className="py-2.5 px-3">Hạng tối thiểu</th>
                      <th className="py-2.5 px-3">Thời gian hiệu lực</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái</th>
                      <th className="py-2.5 px-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-semibold">
                    {campaigns.map((camp, idx) => {
                      const discountValueStr = camp.discountType === 'free_wash' ? 'Rửa xe miễn phí' :
                                               camp.discountType === 'percent' ? `${camp.value}%` : `${camp.value.toLocaleString('vi-VN')} đ`;
                      
                      return (
                        <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${!camp.isActive ? 'opacity-60 bg-slate-50/20' : ''}`}>
                          <td className="py-3 px-4 font-black text-slate-800 tracking-wider font-mono">{camp.code}</td>
                          <td className="py-3 px-3 font-bold text-slate-755">{camp.name}</td>
                          <td className="py-3 px-3 font-black text-indigo-700">{discountValueStr}</td>
                          <td className="py-3 px-3 font-black text-amber-600">
                            {camp.costPoints > 0 ? `${camp.costPoints} Pts` : 'Miễn phí'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold">
                              {camp.minTier}+
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[10px] text-slate-500 font-medium">
                            {camp.startDate} ~ {camp.endDate}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleToggleCampaign(camp.code)}
                              className="focus:outline-none inline-block hover:scale-[1.05]"
                            >
                              {camp.isActive ? (
                                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[8px] font-black rounded-full">Kích hoạt</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-400 text-[8px] font-black rounded-full">Tạm dừng</span>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteCampaign(camp.code)}
                              className="p-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded transition-all cursor-pointer inline-block"
                              title="Xóa chiến dịch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* ======================================================== */}
      {/* 4. TAB CONTENT: FEEDBACK & REVIEWS                       */}
      {/* ======================================================== */}
      {activeTab === 'feedback' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          
          {/* Feedback statistics */}
          <div className="flex items-center justify-between shrink-0">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Nhật ký đánh giá dịch vụ khách hàng</h3>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-rose-600 flex items-center gap-0.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100/50">
                <Frown className="w-4 h-4 text-rose-500" />
                {feedbacks.filter(f=>f.sentiment==='Negative').length} Tiêu cực
              </span>
              <span className="text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/50">
                <Heart className="w-4 h-4 text-emerald-500" />
                {feedbacks.filter(f=>f.sentiment==='Positive').length} Tích cực
              </span>
            </div>
          </div>

          {/* Feedback ledger table */}
          <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider z-10">
                  <tr>
                    <th className="py-3 px-5">Thời gian gửi</th>
                    <th className="py-3 px-4">Khách hàng</th>
                    <th className="py-3 px-4">Mức sao đánh giá</th>
                    <th className="py-3 px-4">Bình luận phản hồi của khách</th>
                    <th className="py-3 px-4 text-center">Nhãn cảm xúc AI</th>
                    <th className="py-3 px-4 text-center">Trạng thái giải quyết</th>
                    <th className="py-3 px-5 text-center">Xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {feedbacks.map(f => {
                    let sentimentBadge = '';
                    if (f.sentiment === 'Positive') {
                      sentimentBadge = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                    } else if (f.sentiment === 'Negative') {
                      sentimentBadge = 'bg-rose-50 text-rose-600 border-rose-100';
                    } else {
                      sentimentBadge = 'bg-slate-100 text-slate-500 border-slate-200';
                    }

                    let statusBadge = '';
                    if (f.status === 'Resolved') {
                      statusBadge = 'bg-emerald-100 text-emerald-700 border-transparent';
                    } else if (f.status === 'Reviewed') {
                      statusBadge = 'bg-blue-100 text-blue-700 border-transparent';
                    } else {
                      statusBadge = 'bg-amber-100 text-amber-700 border-transparent';
                    }

                    return (
                      <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-500">{f.date}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-855">
                          <div className="flex items-center gap-2">
                            <img src={f.customer.avatar} alt="Avatar" className="w-6.5 h-6.5 rounded-full object-cover ring-1 ring-slate-200" />
                            <div className="flex flex-col">
                              <span>{f.customer.name}</span>
                              <span className="text-[8px] text-slate-400 font-semibold">{f.customer.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < f.rating ? 'fill-amber-450 text-amber-450' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-655 leading-relaxed font-semibold max-w-sm truncate" title={f.comment}>{f.comment}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 font-bold border rounded-lg text-[9px] ${sentimentBadge}`}>
                            {f.sentiment === 'Positive' ? 'AI Tích cực' : 'AI Tiêu cực'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 font-black rounded-lg text-[9px] ${statusBadge}`}>
                            {f.status === 'New' ? 'Mới nhận' :
                             f.status === 'Reviewed' ? 'Đã xem' : 'Đã giải quyết'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => handleOpenFeedbackModal(f)}
                            className={`px-3 py-1.5 text-[10px] font-black rounded-lg shadow-sm cursor-pointer transition-all ${
                              f.status === 'Resolved'
                                ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-650/10'
                            }`}
                          >
                            {f.status === 'Resolved' ? 'Xem xử lý' : 'Xử lý khiếu nại'}
                          </button>
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

      {/* ======================================================== */}
      {/* 5. DIALOG / MODAL: CUSTOMER PROFILE CRM DETAIL           */}
      {/* ======================================================== */}
      {profileModalOpen && activeCustomer && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-150">
              <div className="flex items-center gap-3.5">
                <img src={activeCustomer.avatar} alt="Customer" className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-50" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-800">{activeCustomer.name}</h3>
                    <span className="px-2.5 py-0.5 bg-[#57f287] text-slate-800 text-[10px] font-black rounded-lg">
                      Hạng {activeCustomer.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">SĐT: {activeCustomer.phone} • ID: {activeCustomer.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setProfileModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-55 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Navigation tabs */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-1 flex gap-1 text-xs text-slate-500 shadow-inner shrink-0">
              {[
                { key: 'bookings', label: 'Lịch sử dọn rửa' },
                { key: 'points', label: 'Nhật ký tích/đổi điểm' },
                { key: 'vouchers', label: 'Ví Voucher sở hữu & Đổi Voucher' }
              ].map(sub => (
                <button
                  key={sub.key}
                  onClick={() => setProfileActiveTab(sub.key)}
                  className={`flex-1 py-2 rounded-lg text-center font-bold transition-all cursor-pointer ${
                    profileActiveTab === sub.key
                      ? 'bg-white text-slate-905 shadow-sm border border-slate-250/20'
                      : 'hover:text-slate-800'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Profile Tab Contents */}
            <div className="max-h-[380px] overflow-y-auto no-scrollbar text-xs">
              
              {/* Bookings */}
              {profileActiveTab === 'bookings' && (
                <div className="space-y-2">
                  {!customerBookings[activeCustomer.id] || customerBookings[activeCustomer.id].length === 0 ? (
                    <p className="text-slate-400 text-center py-10 font-bold">Khách hàng chưa có lịch đặt dọn nào.</p>
                  ) : (
                    <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="py-2.5 px-4">Mã đơn</th>
                            <th className="py-2.5 px-3">Ngày rửa</th>
                            <th className="py-2.5 px-3">Gói dịch vụ chính</th>
                            <th className="py-2.5 px-3 text-right">Tổng thanh toán</th>
                            <th className="py-2.5 px-4 text-center">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold">
                          {customerBookings[activeCustomer.id].map((b, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 px-4 font-black text-slate-800">{b.id}</td>
                              <td className="py-2.5 px-3">{b.date}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-755">{b.service}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-855">{b.amount.toLocaleString('vi-VN')} đ</td>
                              <td className="py-2.5 px-4 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                                  b.status === 'Completed' ? 'bg-emerald-55 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Points log */}
              {profileActiveTab === 'points' && (
                <div className="space-y-2">
                  {!customerPointsLog[activeCustomer.id] || customerPointsLog[activeCustomer.id].length === 0 ? (
                    <p className="text-slate-400 text-center py-10 font-bold">Chưa phát sinh giao dịch điểm thưởng.</p>
                  ) : (
                    <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="py-2.5 px-4">Thời gian</th>
                            <th className="py-2.5 px-3">Loại giao dịch</th>
                            <th className="py-2.5 px-3 text-right">Số điểm</th>
                            <th className="py-2.5 px-4">Chi tiết nội dung</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-655 font-semibold">
                          {customerPointsLog[activeCustomer.id].map((log, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 px-4 text-slate-500">{log.date}</td>
                              <td className="py-2.5 px-3">
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black ${
                                  log.type === 'EARN' ? 'bg-emerald-55 text-emerald-600' : 
                                  log.type === 'REDEEM' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                  {log.type === 'EARN' ? 'Tích lũy' : log.type === 'REDEEM' ? 'Chi dùng' : 'Hủy điểm'}
                                </span>
                              </td>
                              <td className={`py-2.5 px-3 text-right font-black ${log.type==='EARN'?'text-emerald-650':'text-rose-500'}`}>
                                {log.type === 'EARN' ? `+${log.amount}` : `-${log.amount}`} Pts
                              </td>
                              <td className="py-2.5 px-4 text-slate-505">{log.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Vouchers & Redeeming */}
              {profileActiveTab === 'vouchers' && (
                <div className="space-y-5">
                  
                  {/* Redeem Shop */}
                  <div className="bg-amber-50/30 border border-amber-200/50 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-800 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                        <Award className="w-4 h-4 text-amber-500 animate-spin" />
                        Quầy Đổi điểm lấy Voucher nhanh (Theo Hạng {activeCustomer.tier}+)
                      </span>
                      <span className="text-[10px] text-amber-605 font-bold bg-white px-2 py-0.5 rounded-lg border border-amber-200/60 shadow-sm">
                        Điểm ví hiện có: {activeCustomer.points} Pts
                      </span>
                    </div>

                    {redeemableVouchersForCustomer.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-bold text-center py-2">Hiện tại không có voucher đổi điểm nào phù hợp với hạng của khách hàng.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {redeemableVouchersForCustomer.map(camp => {
                          const canRedeem = activeCustomer.points >= camp.costPoints;
                          const discountValueStr = camp.discountType === 'free_wash' ? 'Rửa xe miễn phí' :
                                                   camp.discountType === 'percent' ? `${camp.value}%` : `${camp.value.toLocaleString('vi-VN')} đ`;

                          return (
                            <div 
                              key={camp.code}
                              className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 bg-white shadow-sm ${
                                canRedeem ? 'border-amber-200' : 'border-slate-100 opacity-60'
                              }`}
                            >
                              <div>
                                <div className="font-mono font-black text-slate-800 text-[10px] tracking-wider">{camp.code}</div>
                                <p className="text-[9px] text-slate-400 font-bold leading-tight mt-0.5">{camp.name}</p>
                                <div className="text-xs font-black text-indigo-755 mt-1">{discountValueStr}</div>
                              </div>
                              
                              <button
                                onClick={() => handleRedeemVoucher(camp)}
                                disabled={!canRedeem}
                                className={`w-full py-1.5 rounded-lg text-[9px] font-black transition-all text-center cursor-pointer ${
                                  canRedeem 
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/10 active:scale-[0.98]' 
                                    : 'bg-slate-105 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                Đổi (-{camp.costPoints} Pts)
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Owned Vouchers list */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ví Voucher đang sở hữu</h4>
                    {!customerVouchers[activeCustomer.id] || customerVouchers[activeCustomer.id].length === 0 ? (
                      <p className="text-slate-400 text-center py-10 font-bold">Khách hàng không sở hữu voucher nào.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {customerVouchers[activeCustomer.id].map((vch, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm relative overflow-hidden">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-r border-slate-200/60" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-l border-slate-200/60" />
                            
                            <div className="pl-2 space-y-1">
                              <div className="font-black text-slate-800 flex items-center gap-1.5">
                                {vch.code}
                                <span className="text-[10px] text-indigo-700 font-extrabold">{vch.value}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold">{vch.name}</p>
                            </div>
                            
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black mr-2 ${
                              vch.status === 'ISSUED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                              vch.status === 'USED' ? 'bg-slate-200 text-slate-550' : 'bg-rose-50 text-rose-500'
                            }`}>
                              {vch.status === 'ISSUED' ? 'Có thể dùng' :
                               vch.status === 'USED' ? 'Đã dùng' : 'Hết hạn'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>

            <div className="border-t border-slate-100 pt-4 text-right">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm text-xs cursor-pointer"
              >
                Đóng hồ sơ khách
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. DIALOG / MODAL: COMPLAINT FEEDBACK RESOLUTION */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-extrabold text-slate-850 flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
                Giải quyết ý kiến Phản hồi
              </h3>
              <button 
                onClick={() => setFeedbackModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-750 rounded-lg"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {(() => {
              const fb = feedbacks.find(f => f.id === selectedFeedbackId);
              if (!fb) return null;
              return (
                <div className="space-y-4 text-xs">
                  
                  <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-150">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-755">Người đánh giá: {fb.customer.name}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-amber-450 text-amber-450' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="italic text-slate-500 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                      "{fb.comment}"
                    </p>
                  </div>

                  {fb.status === 'Resolved' ? (
                    <div className="space-y-3 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                      <div className="text-emerald-700 font-extrabold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Đã xử lý khiếu nại thành công!
                      </div>
                      <div className="space-y-1 font-semibold text-slate-600">
                        <span className="text-[10px] text-slate-455 font-bold block uppercase">Biện pháp xử lý:</span>
                        <p className="bg-white p-2.5 rounded-lg border border-slate-100">{fb.internalNotes}</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleResolveFeedback} className="space-y-4">
                      
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Nội dung ghi chú biện pháp xử lý *</label>
                        <textarea
                          required
                          placeholder="Ví dụ: Đã liên hệ xin lỗi và giải thích lỗi do nhân viên sấy xe chưa sạch, khách đã thông cảm..."
                          value={internalNote}
                          onChange={e => setInternalNote(e.target.value)}
                          rows="3"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 text-slate-700 resize-none"
                        />
                      </div>

                      {fb.sentiment === 'Negative' && (
                        <div className="bg-rose-50/30 border border-rose-100/60 p-3.5 rounded-xl flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id="compensate"
                            checked={issueCompensation}
                            onChange={e => setIssueCompensation(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                          />
                          <div className="space-y-0.5 cursor-pointer" onClick={() => setIssueCompensation(!issueCompensation)}>
                            <label htmlFor="compensate" className="font-black text-rose-700 block cursor-pointer">
                              Gửi tặng Voucher Đền Bù tạ lỗi
                            </label>
                            <p className="text-[10px] text-slate-400">
                              Hệ thống sẽ tự động phát hành **Voucher Đền Bù Chăm Sóc Khách Hàng (COMPENSATE50 trị giá 50.000 đ)** vào ví của khách hàng này để tạ lỗi.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2.5 pt-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setFeedbackModalOpen(false)}
                          className="px-4 py-2.5 bg-slate-100 text-slate-655 font-bold rounded-xl"
                        >
                          Bỏ qua
                        </button>
                        <button
                          type="submit"
                          className="px-4.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md active:scale-[0.98]"
                        >
                          Xác nhận xử lý khiếu nại
                        </button>
                      </div>

                    </form>
                  )}

                </div>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
}
