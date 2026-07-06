import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  Coins, 
  Gift, 
  Save, 
  ToggleLeft, 
  ToggleRight, 
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  History,
  Info,
  UserX,
  UserCheck,
  Edit,
  X
} from 'lucide-react';
import { loyaltyApi } from '../services/loyaltyApi';

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
};

export default function AdminSettingsPage() {
  
  // 1. Loyalty Settings and Tier configurations from localStorage
  const [loyaltySettings, setLoyaltySettings] = useState({
    basePoints: 1,
    baseSpend: 10000,
    roundDown: true,
    pointCashValuePts: 100,
    pointCashValueVnd: 100000,
    maxRedemptionPercent: 80,
    pointValidityMonths: 12,
    downgradeInactivityMonths: 6
  });

  const [tiers, setTiers] = useState([
    { key: 'Member', name: 'Member', minSpend: 0, pointMultiplier: 1.0, bookingWindow: 7, isActive: true },
    { key: 'Silver', name: 'Silver', minSpend: 1000000, pointMultiplier: 1.2, bookingWindow: 7, isActive: true },
    { key: 'Gold', name: 'Gold', minSpend: 5000000, pointMultiplier: 1.5, bookingWindow: 14, isActive: true },
    { key: 'Platinum', name: 'Platinum', minSpend: 10000000, pointMultiplier: 2.0, bookingWindow: 14, isActive: true }
  ]);

  // Load configuration from storage and backend API
  useEffect(() => {
    seedDatabase();
    const settings = localStorage.getItem('autowash_loyalty_settings');
    if (settings) {
      setLoyaltySettings(JSON.parse(settings));
    }
    const loadTiers = async () => {
      try {
        const data = await loyaltyApi.getAllTiers();
        setTiers(data);
        localStorage.setItem('autowash_tiers', JSON.stringify(data));
      } catch (err) {
        const tierMatrix = localStorage.getItem('autowash_tiers');
        if (tierMatrix) setTiers(JSON.parse(tierMatrix));
      }
    };
    loadTiers();
  }, []);

  // Modal editing rule
  const [editingTier, setEditingTier] = useState(null);
  const [editTierForm, setEditTierForm] = useState({
    minSpend: '',
    pointMultiplier: '',
    bookingWindow: ''
  });

  // Review job report modal
  const [reviewReport, setReviewReport] = useState(null);

  // Save configurations handler
  const handleSaveConfigs = () => {
    localStorage.setItem('autowash_loyalty_settings', JSON.stringify(loyaltySettings));
    localStorage.setItem('autowash_tiers', JSON.stringify(tiers));
    
    // Broadcast storage change to other components
    window.dispatchEvent(new Event('storage'));
    
    alert('Đã lưu cấu hình Loyalty Engine Strategy và cập nhật giá trị toàn hệ thống thành công!');
  };

  // Toggle active tier
  const handleToggleTier = (key) => {
    const updated = tiers.map(t => {
      if (t.key === key) {
        if (key === 'Member') {
          alert('Hạng Member tối thiểu bắt buộc phải kích hoạt.');
          return t;
        }
        return { ...t, isActive: !t.isActive };
      }
      return t;
    });
    setTiers(updated);
  };

  // Open edit tier modal
  const handleOpenEditTier = (t) => {
    setEditingTier(t);
    setEditTierForm({
      minSpend: t.minSpend,
      pointMultiplier: t.pointMultiplier,
      bookingWindow: t.bookingWindow
    });
  };

  // Save tier edit
  const handleSaveTierEdit = async (e) => {
    e.preventDefault();
    await loyaltyApi.updateTierConfig(editingTier.id || editingTier.key, editTierForm);
    const updated = tiers.map(t => {
      if (t.key === editingTier.key) {
        return {
          ...t,
          minSpend: Number(editTierForm.minSpend),
          pointMultiplier: Number(editTierForm.pointMultiplier),
          bookingWindow: Number(editTierForm.bookingWindow)
        };
      }
      return t;
    });
    setTiers(updated);
    setEditingTier(null);
    alert(`Đã cập nhật quy định cho hạng ${editingTier.key} thành công! Nhớ bấm "Save Configurations" để lưu toàn cục.`);
  };

  // Run automated Review Job manually (Scan inactivity, downgrades, and account expirations E2E)
  const handleRunReviewJob = () => {
    const customers = JSON.parse(localStorage.getItem('autowash_customers') || '[]');
    const pointsLog = JSON.parse(localStorage.getItem('autowash_points_log') || '{}');
    
    let upgradedList = [];
    let downgradedList = [];
    let suspendedList = [];
    let pointsExpiredSum = 0;

    const inactivityThresholdDays = loyaltySettings.downgradeInactivityMonths * 30; // e.g. 6 months = 180 days
    const accountExpiryDays = 365; // 12 months = 365 days of inactivity means account suspend

    const updatedCustomers = customers.map(c => {
      let currentSpend = c.totalSpend;
      let currentPoints = c.points;
      let currentTier = c.tier;
      let currentStatus = c.status || 'Active';

      // 1. Check account suspension (12 months inactivity closure)
      if (c.lastVisitDays >= accountExpiryDays && currentStatus !== 'Suspended') {
        currentStatus = 'Suspended';
        suspendedList.push(`${c.name} (${c.phone}) - Vắng mặt ${c.lastVisitDays} ngày`);
      }

      // 2. Check tier downgrades if inactive for >= 6 months
      else if (c.lastVisitDays >= inactivityThresholdDays && currentStatus === 'Active') {
        // Find lower tier
        let nextTier = 'Member';
        if (c.tier === 'Platinum') nextTier = 'Gold';
        if (c.tier === 'Gold') nextTier = 'Silver';
        if (c.tier === 'Silver') nextTier = 'Member';

        if (nextTier !== c.tier) {
          // Reset total spending to the minSpend bottom of the new tier (Spring Boot business rule)
          const targetTierConfig = tiers.find(t => t.key === nextTier) || { minSpend: 0 };
          currentSpend = targetTierConfig.minSpend;
          currentTier = nextTier;
          downgradedList.push(`${c.name}: ${c.tier} ➔ ${nextTier} (Vắng mặt ${c.lastVisitDays} ngày)`);
          
          // Expire points due to inactivity (Spring Boot rule: subtract 50% points on downgrade)
          const expiredPoints = Math.floor(c.points * 0.5);
          if (expiredPoints > 0) {
            currentPoints = c.points - expiredPoints;
            pointsExpiredSum += expiredPoints;
            
            // Log log transaction
            const log = pointsLog[c.id] || [];
            pointsLog[c.id] = [
              { date: 'Rà soát ngầm', type: 'EXPIRY', amount: expiredPoints, reason: `Thu hồi điểm do hạ hạng thành viên (vắng mặt lâu)` },
              ...log
            ];
          }
        }
      }

      // 3. Double check if they deserve upgrade (In case their totalSpend fits higher tier)
      else if (currentStatus === 'Active') {
        let nextTier = c.tier;
        const sortedTiers = [...tiers].filter(t=>t.isActive).sort((a,b) => b.minSpend - a.minSpend);
        for (let t of sortedTiers) {
          if (currentSpend >= t.minSpend) {
            nextTier = t.key;
            break;
          }
        }
        if (nextTier !== c.tier) {
          currentTier = nextTier;
          upgradedList.push(`${c.name}: ${c.tier} ➔ ${nextTier}`);
        }
      }

      return {
        ...c,
        tier: currentTier,
        totalSpend: currentSpend,
        points: currentPoints,
        status: currentStatus
      };
    });

    // Write back to database
    localStorage.setItem('autowash_customers', JSON.stringify(updatedCustomers));
    localStorage.setItem('autowash_points_log', JSON.stringify(pointsLog));
    
    // Dispatch storage update
    window.dispatchEvent(new Event('storage'));

    // Set report preview modal state
    setReviewReport({
      upgraded: upgradedList,
      downgraded: downgradedList,
      suspended: suspendedList,
      pointsExpired: pointsExpiredSum
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#f7fafd] text-slate-800 p-5 space-y-5 overflow-y-auto no-scrollbar">
      
      {/* Page Header title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 pb-3 border-b border-slate-200/50">
        <div>
          <h2 className="text-xl font-black text-slate-850 tracking-tight font-outfit">Loyalty Engine Strategy</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Cấu hình tham số tích lũy & tiêu dùng điểm thưởng, xếp hạng thành viên và đóng tài khoản hết hạn.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => alert('Lịch sử phiên bản cấu hình hệ thống: Không có lịch sử sao lưu.')}
            className="px-4 py-2 text-xs font-black bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <History className="w-4 h-4" />
            Config History
          </button>
          <button
            onClick={handleSaveConfigs}
            className="px-4.5 py-2 text-xs font-black bg-[#0047AB] hover:bg-[#003a8c] text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0047AB]/10"
          >
            <Save className="w-4 h-4" />
            Save Configurations
          </button>
        </div>
      </div>

      {/* 1. Monthly Review Insights (Read-Only) */}
      <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-indigo-650" />
              Báo cáo rà soát định kỳ (Monthly Review Insights)
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Quét ngầm tài khoản để tự động nâng/hạ hạng hoặc khóa tài khoản ngưng hoạt động lâu ngày.</p>
          </div>
          
          <button
            onClick={handleRunReviewJob}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Rerun Job Manually (Chạy rà soát tự động)
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-50/40 border border-emerald-100/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider block">Thăng hạng VIP mới</span>
              <h5 className="text-xl font-black text-emerald-700 mt-1">124 khách hàng</h5>
            </div>
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          <div className="bg-amber-50/40 border border-amber-100/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider block">Hạ hạng do vắng mặt &gt; 6 tháng</span>
              <h5 className="text-xl font-black text-amber-700 mt-1">42 khách hàng</h5>
            </div>
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
          </div>

          <div className="bg-rose-50/40 border border-rose-100/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-rose-700 uppercase tracking-wider block">Điểm ví quá hạn thu hồi</span>
              <h5 className="text-xl font-black text-rose-700 mt-1">12,500 Pts</h5>
            </div>
            <div className="w-9 h-9 bg-rose-100 rounded-xl flex items-center justify-center">
              <UserX className="w-5 h-5 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Membership Tier Matrix */}
      <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4.5 h-4.5 text-indigo-650" />
            Membership Tier Matrix (Bảng mốc phân hạng thành viên)
          </h4>
          <button
            onClick={() => alert('Hệ thống khóa cố định 4 hạng chuẩn: Member, Silver, Gold, Platinum.')}
            className="text-[10px] text-indigo-600 hover:underline font-bold"
          >
            + Add Tier
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Tên Hạng (Tier Name)</th>
                <th className="py-2.5 px-3">Chi tiêu tích lũy tối thiểu (Min Spend VND)</th>
                <th className="py-2.5 px-3">Hệ số điểm thưởng (Point Multiplier)</th>
                <th className="py-2.5 px-3">Cửa sổ đặt lịch trước (Booking Window)</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-655 font-semibold">
              {tiers.map(t => (
                <tr key={t.key} className={!t.isActive ? 'opacity-50 bg-slate-50/10' : ''}>
                  <td className="py-3 px-4 font-black text-slate-800">{t.name}</td>
                  <td className="py-3 px-3 font-bold text-slate-750">{t.minSpend.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3 px-3 font-black text-indigo-700">{t.pointMultiplier}x hệ số</td>
                  <td className="py-3 px-3">{t.bookingWindow} ngày trước</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleToggleTier(t.key)}
                      className="focus:outline-none inline-block hover:scale-[1.05]"
                    >
                      {t.isActive ? (
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[8px] font-black rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-400 text-[8px] font-black rounded-full">Disabled</span>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleOpenEditTier(t)}
                      className="p-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded text-slate-600 cursor-pointer inline-block"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Loyalty Rules Config Box (Point Accumulation, Redemption, Lifecycle) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Point Accumulation */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-4 h-4 text-indigo-500 animate-spin" />
              Point Accumulation (Cấu hình Tích lũy)
            </h4>
          </div>

          <div className="space-y-3.5 text-xs font-semibold text-slate-600">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Tỷ lệ quy đổi điểm thưởng (Base Point Rate)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  required
                  value={loyaltySettings.basePoints}
                  onChange={e => setLoyaltySettings({...loyaltySettings, basePoints: Number(e.target.value)})}
                  className="w-16 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-750 font-black"
                />
                <span className="text-slate-450">Điểm (Point) cho mỗi</span>
                <input
                  type="number"
                  required
                  step="1000"
                  value={loyaltySettings.baseSpend}
                  onChange={e => setLoyaltySettings({...loyaltySettings, baseSpend: Number(e.target.value)})}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-750 font-bold"
                />
                <span className="text-slate-800">VNĐ</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-800 block text-[11px]">Làm tròn điểm xuống (Round Down)</span>
                <span className="text-[8px] text-slate-400 font-medium block">Ví dụ: 19.000đ chỉ tích 1 điểm thay vì 2 điểm.</span>
              </div>
              <button
                type="button"
                onClick={() => setLoyaltySettings({...loyaltySettings, roundDown: !loyaltySettings.roundDown})}
                className="focus:outline-none"
              >
                {loyaltySettings.roundDown ? (
                  <ToggleRight className="w-8 h-8 text-indigo-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-350" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Redemption Rules (Tiêu dùng điểm & Chốt chặn chống lỗ) */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Gift className="w-4 h-4 text-indigo-500" />
              Redemption Rules (Chốt chặn chống lỗ)
            </h4>
          </div>

          <div className="space-y-3.5 text-xs font-semibold text-slate-650">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Quy đổi giá trị tiền mặt (Point Cash Value)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  required
                  value={loyaltySettings.pointCashValuePts}
                  onChange={e => setLoyaltySettings({...loyaltySettings, pointCashValuePts: Number(e.target.value)})}
                  className="w-16 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-750 font-black"
                />
                <span className="text-slate-450">Pts =</span>
                <input
                  type="number"
                  required
                  value={loyaltySettings.pointCashValueVnd}
                  onChange={e => setLoyaltySettings({...loyaltySettings, pointCashValueVnd: Number(e.target.value)})}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-750 font-bold"
                />
                <span className="text-slate-800">VNĐ</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Hạn mức giảm tối đa trên bill (% Max per Order) *</label>
              <input
                type="number"
                required
                min="10"
                max="90"
                value={loyaltySettings.maxRedemptionPercent}
                onChange={e => setLoyaltySettings({...loyaltySettings, maxRedemptionPercent: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-indigo-700 font-black text-sm"
              />
              <span className="text-[9px] text-slate-450 block">Ví dụ: 80% nghĩa là hóa đơn 100k khách chỉ được trừ tối đa 80k tiền điểm ví, bắt buộc trả 20k tiền mặt để trạm bù đắp chi phí.</span>
            </div>
          </div>
        </div>

        {/* Lifecycle & Retention */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-4 h-4 text-indigo-500" />
              Lifecycle & Retention (Thời hạn hoạt động)
            </h4>
          </div>

          <div className="space-y-3.5 text-xs font-semibold text-slate-655">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase block">Thời hạn sử dụng điểm tích lũy (Point Validity Months)</label>
              <input
                type="number"
                required
                value={loyaltySettings.pointValidityMonths}
                onChange={e => setLoyaltySettings({...loyaltySettings, pointValidityMonths: Number(e.target.value)})}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-750 font-bold"
              />
              <span className="text-[9px] text-slate-450 block">Sau thời hạn này, điểm cũ chưa dùng sẽ tự động bị thu hồi.</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase block">Chính sách xử lý tài khoản vắng mặt (Downgrade Policy)</label>
              <select
                value={loyaltySettings.downgradeInactivityMonths}
                onChange={e => setLoyaltySettings({...loyaltySettings, downgradeInactivityMonths: Number(e.target.value)})}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold"
              >
                <option value={3}>Downgrade based on Inactivity (3 Months)</option>
                <option value={6}>Downgrade based on Inactivity (6 Months)</option>
                <option value={12}>Downgrade based on Inactivity (12 Months)</option>
              </select>
              <span className="text-[9px] text-slate-450 block">Quá thời hạn này mà khách không ghé rửa, thứ hạng thành viên sẽ bị lùi xuống 1 cấp và đặt lại total_spending.</span>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL: EDIT TIER PROPERTIES */}
      {editingTier && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-extrabold text-slate-800 text-sm">Chỉnh sửa hạng: {editingTier.key}</h3>
              <button onClick={() => setEditingTier(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveTierEdit} className="space-y-4 text-xs font-semibold text-slate-650">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Chi tiêu tích lũy tối thiểu (Min Spend VND)</label>
                <input
                  type="number"
                  required
                  disabled={editingTier.key === 'Member'}
                  value={editTierForm.minSpend}
                  onChange={e => setEditTierForm({...editTierForm, minSpend: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Hệ số nhân điểm tích lũy (Point Multiplier)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  value={editTierForm.pointMultiplier}
                  onChange={e => setEditTierForm({...editTierForm, pointMultiplier: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-black text-indigo-700"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Cửa sổ đặt lịch (Booking Window - Ngày)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="30"
                  value={editTierForm.bookingWindow}
                  onChange={e => setEditTierForm({...editTierForm, bookingWindow: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setEditingTier(null)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl">Hủy</button>
                <button type="submit" className="px-4.5 py-2 bg-[#0047AB] text-white rounded-xl">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTOMATED REVIEW JOB REPORT PREVIEW MODAL */}
      {reviewReport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-extrabold text-slate-850 flex items-center gap-1.5 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Kết quả rà soát & Quét ngầm tự động
              </h3>
              <button onClick={() => setReviewReport(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Point Expiry summary */}
              <div className="bg-amber-50/50 border border-amber-200/50 p-3.5 rounded-xl flex items-center justify-between">
                <span className="font-bold text-amber-900">Tổng điểm thưởng quá hạn đã bị thu hồi:</span>
                <span className="font-black text-amber-700 text-sm">-{reviewReport.pointsExpired} Pts</span>
              </div>

              {/* Upgraded list */}
              <div className="space-y-1.5">
                <span className="font-black text-emerald-700 uppercase block text-[10px]">Tài khoản được thăng hạng ({reviewReport.upgraded.length})</span>
                {reviewReport.upgraded.length === 0 ? (
                  <p className="text-slate-400 italic">Không có khách hàng nào được thăng hạng trong đợt quét này.</p>
                ) : (
                  <ul className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1 font-bold text-slate-700">
                    {reviewReport.upgraded.map((up, idx) => <li key={idx} className="flex items-center gap-1.5 text-[11px]"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {up}</li>)}
                  </ul>
                )}
              </div>

              {/* Downgraded list */}
              <div className="space-y-1.5">
                <span className="font-black text-amber-700 uppercase block text-[10px]">Tài khoản bị hạ hạng do vắng mặt &gt; 6 tháng ({reviewReport.downgraded.length})</span>
                {reviewReport.downgraded.length === 0 ? (
                  <p className="text-slate-400 italic">Không có khách hàng nào bị hạ hạng trong đợt quét này.</p>
                ) : (
                  <ul className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1 font-bold text-slate-700">
                    {reviewReport.downgraded.map((down, idx) => <li key={idx} className="flex items-center gap-1.5 text-[11px]"><TrendingDown className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {down}</li>)}
                  </ul>
                )}
              </div>

              {/* Suspended list */}
              <div className="space-y-1.5">
                <span className="font-black text-rose-700 uppercase block text-[10px]">Tài khoản bị tạm khóa/hết hạn hoạt động &gt; 12 tháng ({reviewReport.suspended.length})</span>
                {reviewReport.suspended.length === 0 ? (
                  <p className="text-slate-400 italic">Không có khách hàng nào bị tạm khóa trong đợt quét này.</p>
                ) : (
                  <ul className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1 font-bold text-slate-700">
                    {reviewReport.suspended.map((susp, idx) => <li key={idx} className="flex items-center gap-1.5 text-[11px]"><UserX className="w-3.5 h-3.5 text-rose-600 shrink-0" /> {susp}</li>)}
                  </ul>
                )}
              </div>

            </div>

            <div className="border-t border-slate-100 pt-3 text-right">
              <button onClick={() => setReviewReport(null)} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer">Xác nhận đóng</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
