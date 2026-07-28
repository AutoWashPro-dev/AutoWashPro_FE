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
  HelpCircle,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { loyaltyApi } from '../services/loyaltyApi';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSandboxExpanded, setIsSandboxExpanded] = useState(false);
  
  useEffect(() => {
    const getRoles = () => {
      try {
        const userRolesRaw = localStorage.getItem('user_roles');
        if (userRolesRaw) {
          const parsed = JSON.parse(userRolesRaw);
          if (Array.isArray(parsed)) return parsed;
          if (typeof parsed === 'string') return [parsed];
        }
      } catch (e) {}
      try {
        const autowashUserRaw = localStorage.getItem('autowash_user');
        if (autowashUserRaw) {
          const user = JSON.parse(autowashUserRaw);
          const roles = user.roles || user.user?.roles || user.user_roles;
          if (Array.isArray(roles)) return roles;
          if (typeof roles === 'string') return [roles];
        }
      } catch (e) {}
      return [];
    };
    const roles = getRoles();
    const isAdmin = roles.includes('ROLE_ADMIN');
    if (!isAdmin) {
      window.location.href = '/admin/bookings';
    }
  }, []);

  // Toast / alert feedback matching AdminRolesRBACPage
  const [feedback, setFeedback] = useState(null);

  const showNotification = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

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

  const [confirmDialog, setConfirmDialog] = useState(null);
  const [notificationModal, setNotificationModal] = useState(null);

  // Load all configurations & customers from backend
  const loadAllSettings = async () => {
    setIsLoading(true);
    try {
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

      const customerList = await loyaltyApi.getCustomers('All', '', 0, 100);
      setCustomers(customerList);
      if (customerList.length > 0) {
        setSelectedCustomerId(customerList[0].customerId || customerList[0].id);
      }
    } catch (err) {
      console.error('Failed to load loyalty settings:', err);
      showNotification('Lỗi khi tải cấu hình hệ thống: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllSettings();
  }, []);

  // Save configurations handler
  const handleSaveConfigs = () => {
    setConfirmDialog({
      title: 'Xác nhận lưu cấu hình hệ thống',
      confirmLabel: 'Xác nhận lưu',
      cancelLabel: 'Hủy bỏ',
      summary: [
        { label: 'Điểm cơ bản', value: `${loyaltySettings.basePoints} điểm / ${Number(loyaltySettings.basePointRate).toLocaleString('vi-VN')} đ` },
        { label: 'Hiệu lực điểm', value: `${loyaltySettings.pointValidityMonths} tháng` },
        { label: 'Vắng mặt hạ hạng', value: `${loyaltySettings.inactivityDowngradeMonths} tháng` },
        { label: 'Vắng mặt khóa TK', value: `${loyaltySettings.inactivityLockoutMonths} tháng` }
      ],
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await loyaltyApi.updateLoyaltyConfig(loyaltySettings);
          showNotification('Đã lưu cấu hình Loyalty Engine Strategy thành công! 🚀');
          await loadAllSettings();
        } catch (err) {
          console.error('Failed to save config:', err);
          showNotification('Lỗi khi lưu cấu hình: ' + err.message, 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
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
  const handleSaveTierEdit = (e) => {
    e.preventDefault();
    setConfirmDialog({
      title: `Xác nhận cập nhật hạng ${editingTier.key}`,
      confirmLabel: 'Xác nhận lưu',
      cancelLabel: 'Hủy bỏ',
      summary: [
        { label: 'Hạng thành viên', value: editingTier.key },
        { label: 'Chi tiêu tối thiểu', value: `${Number(editTierForm.minSpend).toLocaleString('vi-VN')} đ` },
        { label: 'Hệ số nhân điểm', value: `x${editTierForm.pointMultiplier}` },
        { label: 'Cửa sổ đặt lịch', value: `${editTierForm.bookingWindow} ngày` }
      ],
      onConfirm: async () => {
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
          showNotification(`Đã cập nhật quy định cho hạng ${editingTier.key} thành công!`);
          await loadAllSettings();
        } catch (err) {
          console.error('Failed to update tier:', err);
          showNotification('Lỗi cập nhật hạng thành viên: ' + err.message, 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // Rerun Jobs (manual scheduler scan)
  const handleRerunJobs = () => {
    setConfirmDialog({
      title: 'Xác nhận quét rà soát hệ thống',
      confirmLabel: 'Xác nhận chạy',
      cancelLabel: 'Hủy bỏ',
      summary: [
        { label: 'Hành động', value: 'Chạy quét rà soát toàn bộ hệ thống Loyalty' },
        { label: 'Mục đích', value: 'Cập nhật hạng, xử lý điểm hết hạn, và phát hiện tài khoản không hoạt động' }
      ],
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const res = await loyaltyApi.runSimulationJobs();
          showNotification(res || 'Đã chạy quét rà soát toàn bộ hệ thống Loyalty thành công!');
          await loadAllSettings();
        } catch (err) {
          console.error('Failed to rerun jobs:', err);
          showNotification('Lỗi chạy quét hệ thống: ' + err.message, 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // Simulation: Set Inactivity
  const handleSimulateInactivity = () => {
    if (!selectedCustomerId) {
      showNotification('Vui lòng chọn khách hàng.', 'error');
      return;
    }
    const cust = customers.find(c => (c.customerId || c.id) === selectedCustomerId);
    setConfirmDialog({
      title: 'Xác nhận giả lập vắng mặt',
      confirmLabel: 'Xác nhận giả lập',
      cancelLabel: 'Hủy bỏ',
      summary: [
        { label: 'Khách hàng', value: cust?.name || selectedCustomerId },
        { label: 'Số tháng vắng mặt', value: `${sandboxMonths} tháng` }
      ],
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const res = await loyaltyApi.simulateSetInactivity(selectedCustomerId, sandboxMonths);
          showNotification(res || `Giả lập vắng mặt ${sandboxMonths} tháng thành công!`);
          await loadAllSettings();
        } catch (err) {
          console.error(err);
          showNotification('Lỗi giả lập vắng mặt: ' + err.message, 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // Simulation: Set Points Expired
  const handleSimulatePointsExpired = () => {
    if (!selectedCustomerId) {
      showNotification('Vui lòng chọn khách hàng.', 'error');
      return;
    }
    const cust = customers.find(c => (c.customerId || c.id) === selectedCustomerId);
    setConfirmDialog({
      title: 'Xác nhận giả lập điểm quá hạn',
      confirmLabel: 'Xác nhận giả lập',
      cancelLabel: 'Hủy bỏ',
      summary: [
        { label: 'Khách hàng', value: cust?.name || selectedCustomerId },
        { label: 'Số tháng quá hạn', value: `${sandboxMonths} tháng` }
      ],
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const res = await loyaltyApi.simulateSetPointsExpired(selectedCustomerId, sandboxMonths);
          showNotification(res || `Giả lập tích điểm quá hạn ${sandboxMonths} tháng thành công!`);
          await loadAllSettings();
        } catch (err) {
          console.error(err);
          showNotification('Lỗi giả lập điểm quá hạn: ' + err.message, 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#f7fafd] text-slate-800 p-6 overflow-hidden">
      
      {/* Toast Notification Bar */}
      {feedback && (
        <div className={`fixed top-5 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border animate-slide-left transition-all ${
          feedback.type === 'error' 
            ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30' 
            : 'bg-slate-900 text-white border-slate-700 shadow-slate-900/30'
        }`}>
          {feedback.type === 'error' ? <AlertTriangle className="w-5 h-5 text-rose-300" /> : <CheckCircle className="w-5 h-5 text-[#57f287]" />}
          <span className="text-xs font-extrabold tracking-wide">{feedback.message}</span>
        </div>
      )}

      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#0047AB] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0047AB]/20 text-white">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Cấu Hình Hệ Thống (Loyalty Engine Strategy)
              <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-[#0047AB] text-[10px] font-black rounded-full uppercase tracking-wider">
                System Core
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Cấu hình tham số tích lũy & tiêu dùng điểm thưởng, xếp hạng thành viên và đóng tài khoản hết hạn.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={loadAllSettings}
            disabled={isLoading}
            title="Làm mới dữ liệu cấu hình"
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#0047AB]' : ''}`} />
          </button>

          <button
            onClick={handleRerunJobs}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            Chạy Rà Soát Hệ Thống
          </button>
          
          <button
            onClick={handleSaveConfigs}
            className="px-4.5 py-2.5 bg-[#0047AB] hover:bg-[#003a8c] text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-[#0047AB]/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu Cấu Hình
          </button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pt-4 pr-1 space-y-6 no-scrollbar">

        {/* Section 1: Membership Tier Matrix */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200/60 flex items-center justify-between text-xs text-slate-600 font-semibold flex-wrap gap-2">
            <span className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-wider text-xs">
              <Award className="w-4 h-4 text-[#0047AB]" />
              Bảng mốc phân hạng thành viên (Membership Tier Matrix)
            </span>
            <span className="text-[10px] text-slate-400 font-bold italic">
              * Chỉ số hạng VIP được đồng bộ trực tiếp với database
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-black sticky top-0 z-10">
                  <th className="py-3.5 px-6 border-b border-slate-800">Tên Hạng</th>
                  <th className="py-3.5 px-4 border-b border-slate-800">Chi tiêu tích lũy tối thiểu</th>
                  <th className="py-3.5 px-4 border-b border-slate-800">Hệ số nhân điểm thưởng</th>
                  <th className="py-3.5 px-4 border-b border-slate-800">Thời gian đặt lịch trước</th>
                  <th className="py-3.5 px-4 text-center border-b border-slate-800">Trạng thái</th>
                  <th className="py-3.5 px-6 text-center border-b border-slate-800">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {tiers.map(t => (
                  <tr key={t.key} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <span className={`inline-block px-2.5 py-0.5 font-black rounded-lg border text-[10px] uppercase ${
                        String(t.name || t.key).toUpperCase().includes('PLATINUM') ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        String(t.name || t.key).toUpperCase().includes('GOLD') ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        String(t.name || t.key).toUpperCase().includes('SILVER') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {t.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{(t.minSpend || 0).toLocaleString('vi-VN')} đ</td>
                    <td className="py-3.5 px-4 font-black text-indigo-700">{(t.pointMultiplier || 1.0)}x hệ số</td>
                    <td className="py-3.5 px-4 text-slate-600">Đặt trước {(t.bookingWindow || 7)} ngày</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full border ${
                        t.isActive 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}>
                        {t.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => handleOpenEditTier(t)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                        title="Chỉnh sửa cấu hình hạng"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-500" />
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grid: Accumulation Rules & Retention */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Point Accumulation */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-[#0047AB]">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Quy tắc tích lũy điểm
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Tỷ lệ quy đổi doanh thu chi tiêu sang điểm thưởng Loyalty</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="bg-slate-50 border border-slate-200/70 p-4.5 rounded-2xl space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Công thức quy đổi</span>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/50 px-3.5 py-2 rounded-xl">
                    <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-white font-black text-[10px]">1</div>
                    <span className="text-amber-800 font-black text-xs">Điểm</span>
                  </div>

                  <span className="text-slate-400 font-black text-sm">=</span>

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

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-slate-800 block text-[11px]">Làm tròn điểm xuống (Round Down)</span>
                  <span className="text-[9px] text-slate-400 font-medium block">Hệ thống bỏ số lẻ thập phân, giữ lại điểm chẵn khi tích lũy.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLoyaltySettings({...loyaltySettings, roundDown: !loyaltySettings.roundDown})}
                  className="focus:outline-none cursor-pointer hover:scale-105 transition-all"
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
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-[#0047AB]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Thời hạn hoạt động & Quét tự động
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Quy tắc thu hồi điểm quá hạn và xử lý tài khoản vắng mặt</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-slate-655">
              <div className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl gap-4">
                <div className="space-y-0.5 max-w-[70%]">
                  <span className="font-extrabold text-slate-800 block text-[11px]">Hạn dùng điểm tích lũy</span>
                  <span className="text-[9px] text-slate-400 font-medium block">Số tháng tối đa điểm thưởng có hiệu lực kể từ khi tích lũy.</span>
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

              <div className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl gap-4">
                <div className="space-y-0.5 max-w-[70%]">
                  <span className="font-extrabold text-slate-800 block text-[11px]">Thời gian rà soát vắng mặt</span>
                  <span className="text-[9px] text-slate-400 font-medium block">Số tháng vắng mặt tối đa trước khi thành viên bị hạ 1 cấp VIP.</span>
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

              <div className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl gap-4">
                <div className="space-y-0.5 max-w-[70%]">
                  <span className="font-extrabold text-slate-800 block text-[11px]">Thời gian vắng mặt khóa tài khoản</span>
                  <span className="text-[9px] text-slate-400 font-medium block">Số tháng vắng mặt tối đa trước khi tài khoản bị tạm khóa.</span>
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
          <button
            onClick={() => setIsSandboxExpanded(!isSandboxExpanded)}
            className="w-full flex items-center justify-between font-black text-xs uppercase tracking-wider text-slate-200 bg-slate-950 p-5 border-b border-slate-800 focus:outline-none cursor-pointer hover:bg-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-indigo-400" />
              Cổng Giả Lập & Thử Nghiệm Nghiệp Vụ (Developer Sandbox)
            </span>
            <span className="px-2 py-1 bg-slate-800 border border-slate-700 text-[9px] rounded-lg text-slate-400 font-bold">
              {isSandboxExpanded ? 'Thu gọn ▲' : 'Mở rộng ▼'}
            </span>
          </button>

          {isSandboxExpanded && (
            <div className="p-6 space-y-6 text-xs font-bold text-slate-300">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-xl flex flex-col justify-between space-y-4">
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
                    className="w-full bg-[#0047AB] hover:bg-[#003a8c] text-white font-black py-2.5 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#0047AB]/20"
                  >
                    Kích hoạt Giả Lập Vắng Mặt
                  </button>
                </div>

                <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-amber-400 font-black uppercase text-[10px]">
                      <UserX className="w-4 h-4 text-amber-400" />
                      Kịch bản hết hạn điểm (Point Expiry)
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      Cộng thêm 100 điểm ảo và tạo một lịch sử giao dịch tương ứng lùi về quá khứ {sandboxMonths} tháng trước để test cơ chế tự động thu hồi điểm.
                    </p>
                  </div>
                  <button
                    onClick={handleSimulatePointsExpired}
                    className="w-full bg-[#0047AB] hover:bg-[#003a8c] text-white font-black py-2.5 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#0047AB]/20"
                  >
                    Kích hoạt Giả Lập Điểm Quá Hạn
                  </button>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 bg-slate-950 border border-slate-800 p-4 rounded-xl text-slate-400 font-medium leading-relaxed">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Chỉnh sửa hạng: {editingTier.key}</h3>
              <button onClick={() => setEditingTier(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTierEdit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Chi tiêu tích lũy tối thiểu (Min Spend VND)</label>
                <input
                  type="number"
                  required
                  disabled={editingTier.key === 'Member'}
                  value={editTierForm.minSpend}
                  onChange={e => setEditTierForm({...editTierForm, minSpend: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-black disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#0047AB] focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Hệ số nhân điểm tích lũy (Point Multiplier)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  value={editTierForm.pointMultiplier}
                  onChange={e => setEditTierForm({...editTierForm, pointMultiplier: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-black focus:border-[#0047AB] focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Cửa sổ đặt lịch trước (Booking Window - Ngày)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="30"
                  value={editTierForm.bookingWindow}
                  onChange={e => setEditTierForm({...editTierForm, bookingWindow: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-black focus:border-[#0047AB] focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setEditingTier(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black transition-all cursor-pointer">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-[#0047AB] hover:bg-[#003a8c] text-white rounded-xl text-xs font-black shadow-md cursor-pointer">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC CONFIRMATION MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm">{confirmDialog.title}</h3>
              <button 
                type="button" 
                onClick={() => {
                  if (confirmDialog.onCancel) confirmDialog.onCancel();
                  setConfirmDialog(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 text-xs text-slate-600 font-semibold max-h-[40vh] overflow-y-auto pr-1">
              {confirmDialog.summary.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1.5 border-b border-slate-50 gap-2">
                  <span className="text-slate-400 font-extrabold uppercase text-[9px] shrink-0">{item.label}</span>
                  <span className="text-slate-900 font-black text-right break-words">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (confirmDialog.onCancel) confirmDialog.onCancel();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl text-xs transition-colors cursor-pointer"
              >
                {confirmDialog.cancelLabel || 'Hủy'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  setConfirmDialog(prev => ({ ...prev, isSubmitting: true }));
                  try {
                    await confirmDialog.onConfirm();
                  } finally {
                    setConfirmDialog(null);
                  }
                }}
                disabled={confirmDialog.isSubmitting}
                className="px-5 py-2 bg-[#0047AB] hover:bg-[#003a8c] text-white font-black rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {confirmDialog.isSubmitting ? 'Đang xử lý...' : (confirmDialog.confirmLabel || 'Xác nhận')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
