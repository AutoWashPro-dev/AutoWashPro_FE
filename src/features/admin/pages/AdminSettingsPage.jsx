import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  Coins, 
  Save, 
  ToggleLeft, 
  ToggleRight, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  History, 
  Info, 
  UserX, 
  Edit, 
  X, 
  RefreshCw,
  Database,
  Users,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle
} from 'lucide-react';
import { loyaltyApi } from '../services/loyaltyApi';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSandboxExpanded, setIsSandboxExpanded] = useState(false);
  
  // State for Loyalty Settings
  const [loyaltySettings, setLoyaltySettings] = useState({
    basePoints: 1,
    basePointRate: 10000,
    roundDown: true,
    pointValidityMonths: 12,
    inactivityDowngradeMonths: 6,
    inactivityLockoutMonths: 12
  });

  // State for Tiers
  const [tiers, setTiers] = useState([
    { key: 'Member', name: 'Member', minSpend: 0, pointMultiplier: 1.0, bookingWindow: 7, isActive: true },
    { key: 'Silver', name: 'Silver', minSpend: 1000000, pointMultiplier: 1.2, bookingWindow: 7, isActive: true },
    { key: 'Gold', name: 'Gold', minSpend: 5000000, pointMultiplier: 1.5, bookingWindow: 14, isActive: true },
    { key: 'Platinum', name: 'Platinum', minSpend: 10000000, pointMultiplier: 2.0, bookingWindow: 14, isActive: true }
  ]);

  // State for Sandbox
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [sandboxMonths, setSandboxMonths] = useState(13);

  // Modal editing rule
  const [editingTier, setEditingTier] = useState(null);
  const [editTierForm, setEditTierForm] = useState({
    minSpend: '',
    pointMultiplier: '',
    bookingWindow: ''
  });

  // Load all configurations & customers from backend
  const loadAllSettings = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch loyalty config and tiers
      const settingsData = await loyaltyApi.getLoyaltySettings();
      if (settingsData && settingsData.config) {
        setLoyaltySettings({
          basePoints: settingsData.config.basePoints || 1,
          basePointRate: settingsData.config.basePointRate || 10000,
          roundDown: settingsData.config.roundDown !== undefined ? settingsData.config.roundDown : true,
          pointValidityMonths: settingsData.config.pointValidityMonths || 12,
          inactivityDowngradeMonths: settingsData.config.inactivityDowngradeMonths || 6,
          inactivityLockoutMonths: settingsData.config.inactivityLockoutMonths || 12
        });
      }
      if (settingsData && settingsData.tiers) {
        setTiers(settingsData.tiers);
      }

      // 2. Fetch customers for simulation dropdown
      const customerList = await loyaltyApi.getCustomers('All', '', 0, 100);
      setCustomers(customerList);
      if (customerList.length > 0) {
        setSelectedCustomerId(customerList[0].customerId || customerList[0].id);
      }
    } catch (err) {
      console.error('Failed to load loyalty settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllSettings();
  }, []);

  // Save configurations handler
  const handleSaveConfigs = async () => {
    setIsLoading(true);
    try {
      await loyaltyApi.updateLoyaltyConfig(loyaltySettings);
      alert('Đã lưu cấu hình Loyalty Engine Strategy và cập nhật giá trị toàn hệ thống thành công!');
      await loadAllSettings();
    } catch (err) {
      console.error('Failed to save config:', err);
      alert('Lỗi khi lưu cấu hình: ' + err.message);
    } finally {
      setIsLoading(false);
    }
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
    setIsLoading(true);
    try {
      const tierId = editingTier.tierId || editingTier.id;
      await loyaltyApi.updateTierConfig(tierId, {
        ...editingTier,
        minSpend: Number(editTierForm.minSpend),
        pointMultiplier: Number(editTierForm.pointMultiplier),
        bookingWindow: Number(editTierForm.bookingWindow)
      });
      setEditingTier(null);
      alert(`Đã cập nhật quy định cho hạng ${editingTier.key} thành công!`);
      await loadAllSettings();
    } catch (err) {
      console.error('Failed to update tier:', err);
      alert('Lỗi cập nhật hạng thành viên: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Rerun Jobs (manual scheduler scan)
  const handleRerunJobs = async () => {
    setIsLoading(true);
    try {
      const res = await loyaltyApi.runSimulationJobs();
      alert(res || 'Đã chạy quét rà soát toàn bộ hệ thống Loyalty thành công!');
      await loadAllSettings();
    } catch (err) {
      console.error('Failed to rerun jobs:', err);
      alert('Lỗi chạy quét hệ thống: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulation: Set Inactivity
  const handleSimulateInactivity = async () => {
    if (!selectedCustomerId) {
      alert('Vui lòng chọn khách hàng.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await loyaltyApi.simulateSetInactivity(selectedCustomerId, sandboxMonths);
      alert(res || `Giả lập vắng mặt ${sandboxMonths} tháng thành công cho khách hàng!`);
      await loadAllSettings();
    } catch (err) {
      console.error(err);
      alert('Lỗi giả lập vắng mặt: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulation: Set Points Expired
  const handleSimulatePointsExpired = async () => {
    if (!selectedCustomerId) {
      alert('Vui lòng chọn khách hàng.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await loyaltyApi.simulateSetPointsExpired(selectedCustomerId, sandboxMonths);
      alert(res || `Giả lập tích điểm quá hạn ${sandboxMonths} tháng thành công cho khách hàng!`);
      await loadAllSettings();
    } catch (err) {
      console.error(err);
      alert('Lỗi giả lập điểm quá hạn: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f7fafd] text-slate-800 p-5 space-y-5 overflow-hidden relative font-outfit">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center z-[100] rounded-2xl">
          <div className="bg-white p-4.5 rounded-2xl shadow-xl flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-[#0047AB] animate-spin" />
            <span className="text-xs font-bold text-slate-600">Đang đồng bộ cơ sở dữ liệu...</span>
          </div>
        </div>
      )}

      {/* Page Header (Fixed at the top) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 pb-3 border-b border-slate-200/50">
        <div>
          <h2 className="text-xl font-black text-slate-850 tracking-tight flex items-center gap-2">
            <Settings className="w-5.5 h-5.5 text-[#0047AB]" />
            Loyalty Engine Strategy
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Cấu hình tham số tích lũy & tiêu dùng điểm thưởng, xếp hạng thành viên và đóng tài khoản hết hạn.</p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleRerunJobs}
            className="px-4 py-2 text-xs font-black bg-slate-950 hover:bg-slate-900 text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            Chạy Rà Soát Hệ Thống
          </button>
          
          <button
            onClick={handleSaveConfigs}
            className="px-4.5 py-2 text-xs font-black bg-[#0047AB] hover:bg-[#003a8c] text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0047AB]/10 active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            Lưu Cấu Hình
          </button>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1 pb-10">

        {/* Section 1: Membership Tier Matrix */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4.5 h-4.5 text-[#0047AB]" />
            Bảng mốc phân hạng thành viên (Membership Tier Matrix)
          </h4>
          <span className="text-[10px] text-slate-400 font-bold italic">
            * Chỉ số hạng VIP được đồng bộ trực tiếp với database
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Tên Hạng</th>
                <th className="py-3 px-3">Chi tiêu tích lũy tối thiểu</th>
                <th className="py-3 px-3">Hệ số nhân điểm thưởng</th>
                <th className="py-3 px-3">Thời gian đặt lịch trước</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center rounded-r-xl">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-655 font-semibold">
              {tiers.map(t => (
                <tr key={t.key} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-black text-slate-800">{t.name}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-750">{(t.minSpend || 0).toLocaleString('vi-VN')} đ</td>
                  <td className="py-3.5 px-3 font-black text-indigo-700">{(t.pointMultiplier || 1.0)}x hệ số</td>
                  <td className="py-3.5 px-3 text-slate-550">Đặt trước {(t.bookingWindow || 7)} ngày</td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2 py-0.5 text-[8px] font-black rounded-full border ${
                      t.isActive 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}>
                      {t.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleOpenEditTier(t)}
                      className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-650 rounded-lg text-slate-500 cursor-pointer inline-flex items-center justify-center transition-all"
                      title="Chỉnh sửa cấu hình hạng"
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

      {/* Grid: Accumulation Rules & Retention */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Point Accumulation */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#0047AB]">
              <Coins className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Quy tắc tích lũy điểm
              </h4>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Tỷ lệ quy đổi doanh thu chi tiêu sang điểm thưởng Loyalty</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-semibold text-slate-600">
            {/* Unified Formula Card */}
            <div className="bg-slate-50 border border-slate-200/50 p-4.5 rounded-xl space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Công thức quy đổi</span>
              
              <div className="flex items-center gap-3">
                {/* Points Output (Static 1 Pts) */}
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/50 px-3.5 py-2 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-white font-black text-[10px]">1</div>
                  <span className="text-amber-800 font-black text-xs">Điểm</span>
                </div>

                <span className="text-slate-400 font-black text-sm">=</span>

                {/* Spend Input */}
                <div className="flex-1 flex items-center bg-white border border-slate-200 focus-within:border-[#0047AB] rounded-xl px-3.5 py-1.5 transition-all shadow-sm">
                  <input
                    type="number"
                    required
                    step="1000"
                    value={loyaltySettings.basePointRate}
                    onChange={e => setLoyaltySettings({...loyaltySettings, basePointRate: Number(e.target.value)})}
                    className="w-full text-slate-850 font-black text-sm outline-none text-right pr-2"
                  />
                  <span className="text-slate-450 border-l border-slate-150 pl-2 font-extrabold text-[11px]">VNĐ</span>
                </div>
              </div>
              
              <p className="text-[10px] text-slate-450 leading-relaxed font-medium">
                Khách hàng chi tiêu mỗi <strong className="text-slate-700">{(loyaltySettings.basePointRate || 10000).toLocaleString('vi-VN')} đ</strong> sẽ được tích lũy <strong className="text-slate-700">{loyaltySettings.basePoints} điểm</strong>.
              </p>
            </div>

            {/* Round down setting */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/50 rounded-xl">
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-800 block text-[11px]">Làm tròn điểm xuống (Round Down)</span>
                <span className="text-[9px] text-slate-400 font-medium block">Hệ thống bỏ số lẻ thập phân, giữ lại điểm chẵn khi tích lũy.</span>
              </div>
              <button
                type="button"
                onClick={() => setLoyaltySettings({...loyaltySettings, roundDown: !loyaltySettings.roundDown})}
                className="focus:outline-none cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                {loyaltySettings.roundDown ? (
                  <ToggleRight className="w-9 h-9 text-[#0047AB]" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Lifecycle & Retention */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#0047AB]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Thời hạn hoạt động & Quét tự động
              </h4>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Quy tắc thu hồi điểm quá hạn và xử lý tài khoản vắng mặt</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs font-semibold text-slate-655">
            {/* Config Item 1: Point Validity */}
            <div className="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-200/30 rounded-xl gap-4">
              <div className="space-y-0.5 max-w-[70%]">
                <span className="font-extrabold text-slate-800 block text-[11px]">Hạn dùng điểm tích lũy</span>
                <span className="text-[9px] text-slate-455 font-medium block">Số tháng tối đa điểm thưởng có hiệu lực kể từ khi tích lũy.</span>
              </div>
              <div className="flex items-center bg-white border border-slate-200 focus-within:border-[#0047AB] rounded-xl px-2.5 py-1.5 w-28 shadow-sm">
                <input
                  type="number"
                  required
                  min="1"
                  value={loyaltySettings.pointValidityMonths}
                  onChange={e => setLoyaltySettings({...loyaltySettings, pointValidityMonths: Number(e.target.value)})}
                  className="w-full text-slate-800 font-black text-center outline-none text-xs"
                />
                <span className="text-slate-400 font-bold text-[10px] pl-1.5 border-l border-slate-150">Tháng</span>
              </div>
            </div>

            {/* Config Item 2: Downgrade months */}
            <div className="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-200/30 rounded-xl gap-4">
              <div className="space-y-0.5 max-w-[70%]">
                <span className="font-extrabold text-slate-800 block text-[11px]">Thời gian rà soát vắng mặt</span>
                <span className="text-[9px] text-slate-455 font-medium block">Số tháng vắng mặt tối đa trước khi thành viên bị hạ 1 cấp VIP.</span>
              </div>
              <div className="flex items-center bg-white border border-slate-200 focus-within:border-[#0047AB] rounded-xl px-2.5 py-1.5 w-28 shadow-sm">
                <input
                  type="number"
                  required
                  min="1"
                  value={loyaltySettings.inactivityDowngradeMonths}
                  onChange={e => setLoyaltySettings({...loyaltySettings, inactivityDowngradeMonths: Number(e.target.value)})}
                  className="w-full text-slate-800 font-black text-center outline-none text-xs"
                />
                <span className="text-slate-400 font-bold text-[10px] pl-1.5 border-l border-slate-150">Tháng</span>
              </div>
            </div>

            {/* Config Item 3: Lockout months */}
            <div className="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-200/30 rounded-xl gap-4">
              <div className="space-y-0.5 max-w-[70%]">
                <span className="font-extrabold text-slate-800 block text-[11px]">Thời gian vắng mặt khóa tài khoản</span>
                <span className="text-[9px] text-slate-455 font-medium block">Số tháng vắng mặt tối đa trước khi tài khoản bị tạm khóa.</span>
              </div>
              <div className="flex items-center bg-white border border-slate-200 focus-within:border-[#0047AB] rounded-xl px-2.5 py-1.5 w-28 shadow-sm">
                <input
                  type="number"
                  required
                  min="1"
                  value={loyaltySettings.inactivityLockoutMonths}
                  onChange={e => setLoyaltySettings({...loyaltySettings, inactivityLockoutMonths: Number(e.target.value)})}
                  className="w-full text-slate-800 font-black text-center outline-none text-xs"
                />
                <span className="text-slate-400 font-bold text-[10px] pl-1.5 border-l border-slate-150">Tháng</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Section 3: Collapsible Developer / Simulation Sandbox */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
        {/* Toggle Button */}
        <button
          onClick={() => setIsSandboxExpanded(!isSandboxExpanded)}
          className="w-full flex items-center justify-between font-black text-xs uppercase tracking-wider text-slate-350 bg-[#0f172a]/60 p-5 border-b border-slate-800/80 focus:outline-none cursor-pointer hover:bg-[#0f172a]/80 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
            Cổng Giả Lập & Thử Nghiệm Nghiệp Vụ (Developer Sandbox)
          </span>
          <span className="px-2 py-1 bg-slate-800 border border-slate-700/65 text-[9px] rounded-lg text-slate-400 font-bold">
            {isSandboxExpanded ? 'Thu gọn ▲' : 'Mở rộng ▼'}
          </span>
        </button>

        {isSandboxExpanded && (
          <div className="p-6 space-y-6 text-xs font-bold text-slate-300">
            {/* Top inputs: Select Customer & Months */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 tracking-wider block">1. Chọn khách hàng kiểm thử</label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none font-bold shadow-inner"
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map(c => (
                    <option key={c.customerId || c.id} value={c.customerId || c.id} className="bg-[#0b0f19]">
                      [{c.id}] {c.name} ({c.phone}) - {c.points} Pts - {c.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 tracking-wider block">2. Nhập số tháng giả lập (Months)</label>
                <div className="flex bg-[#090d16] border border-slate-800 focus-within:border-indigo-500 rounded-xl px-4 py-2 shadow-inner">
                  <input
                    type="number"
                    min="1"
                    value={sandboxMonths}
                    onChange={e => setSandboxMonths(Number(e.target.value))}
                    className="w-full bg-transparent text-white outline-none font-black text-sm"
                  />
                  <span className="text-slate-550 font-bold self-center pl-2 border-l border-slate-800">Tháng</span>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Action Card 1: Inactivity */}
              <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-violet-400 font-black uppercase text-[10px]">
                    <TrendingDown className="w-4 h-4 text-violet-400" />
                    Kịch bản vắng mặt (Inactivity)
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Đặt ngày dọn xe cuối cùng của khách hàng và thời gian tạo tài khoản lùi về quá khứ {sandboxMonths} tháng để test hạ hạng VIP hoặc tự động khóa ví.
                  </p>
                </div>
                <button
                  onClick={handleSimulateInactivity}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-700 text-white font-black py-2.5 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-violet-950/20 active:scale-[0.98]"
                >
                  Kích hoạt Giả Lập Vắng Mặt
                </button>
              </div>

              {/* Action Card 2: Expired Points */}
              <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-amber-500 font-black uppercase text-[10px]">
                    <UserX className="w-4 h-4 text-amber-550" />
                    Kịch bản hết hạn điểm (Point Expiry)
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Cộng thêm 100 điểm ảo và tạo một lịch sử giao dịch tương ứng lùi về quá khứ {sandboxMonths} tháng trước để test cơ chế tự động thu hồi điểm.
                  </p>
                </div>
                <button
                  onClick={handleSimulatePointsExpired}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black py-2.5 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/20 active:scale-[0.98]"
                >
                  Kích hoạt Giả Lập Điểm Quá Hạn
                </button>
              </div>
            </div>
            
            {/* Instruction Footer */}
            <div className="flex items-start gap-2.5 bg-slate-900/90 border border-slate-800/50 p-4 rounded-xl text-slate-400 font-medium leading-relaxed">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Sau khi kích hoạt giả lập thành công, dữ liệu thô đã được thay đổi trong database. Để cập nhật trạng thái mới nhất trên giao diện hiển thị, bạn cần bấm nút 
                <strong className="text-white"> "Chạy Rà Soát Hệ Thống" </strong> ở đầu trang để kích hoạt nóng các Scheduled Cron Jobs trên Backend.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* MODAL: EDIT TIER PROPERTIES */}
      {editingTier && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-extrabold text-slate-800 text-sm">Chỉnh sửa hạng: {editingTier.key}</h3>
              <button onClick={() => setEditingTier(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveTierEdit} className="space-y-4 text-xs font-semibold text-slate-655">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Chi tiêu tích lũy tối thiểu (Min Spend VND)</label>
                <input
                  type="number"
                  required
                  disabled={editingTier.key === 'Member'}
                  value={editTierForm.minSpend}
                  onChange={e => setEditTierForm({...editTierForm, minSpend: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-55 border border-slate-200 rounded-xl text-slate-800 font-black disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#0047AB] outline-none"
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
                  className="w-full px-3 py-2 bg-slate-55 border border-slate-200 rounded-xl text-slate-800 font-black focus:border-[#0047AB] outline-none text-indigo-750"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Cửa sổ đặt lịch trước (Booking Window - Ngày)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="30"
                  value={editTierForm.bookingWindow}
                  onChange={e => setEditTierForm({...editTierForm, bookingWindow: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-55 border border-slate-200 rounded-xl text-slate-800 font-bold focus:border-[#0047AB] outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setEditingTier(null)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl cursor-pointer">Hủy</button>
                <button type="submit" className="px-4.5 py-2 bg-[#0047AB] text-white rounded-xl cursor-pointer shadow-md shadow-[#0047AB]/10">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
