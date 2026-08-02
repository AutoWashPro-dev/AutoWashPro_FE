import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gift,
  Award,
  Wallet,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Crown,
  Sparkles,
  Clock,
  Lock,
  Coins,
  Tag,
  Loader2,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { customerApi } from '../services/customerApi';

export default function CustomerRewardsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    fullName: 'Nguyễn Minh Anh',
    loyaltyPoints: 1240,
    tierName: 'PLATINUM MEMBER',
    customerId: 1
  });
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' hoặc 'wallet'
  const [selectedVoucherCode, setSelectedVoucherCode] = useState('');
  const [selectedVoucherTitle, setSelectedVoucherTitle] = useState('');

  // 1. Danh sách quà tặng đổi điểm (Rewards Shop)
  const [rewardItems, setRewardItems] = useState([]);

  // 2. Danh sách Ví Voucher cá nhân (My Voucher Wallet)
  const [myVouchers, setMyVouchers] = useState([]);

  // 3. Danh sách Lịch sử biến động điểm
  const [pointHistory, setPointHistory] = useState([]);

  // Loading states for exchange
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Custom Alerts and Confirms states
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'warning', // 'success' | 'error' | 'warning'
    title: 'Thông báo',
    message: ''
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: 'Xác nhận đổi quà',
    message: '',
    rewardItem: null,
    onConfirm: null
  });

  const showAlert = (message, type = 'warning', title = 'Thông báo') => {
    setAlertModal({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const showConfirm = (message, rewardItem, onConfirm, title = 'Xác nhận đổi quà') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      rewardItem,
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
      }
    });
  };

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAlertModal(prev => ({ ...prev, isOpen: false }));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadProfileData = async () => {
    try {
      const data = await customerApi.getCustomerProfile();
      const cId = data.customerId || 1;
      setProfile({
        fullName: data.fullName || 'Nguyễn Minh Anh',
        loyaltyPoints: data.loyaltyPoints || 0,
        tierName: data.tierName || 'MEMBER',
        customerId: cId
      });
      loadShopData(cId);
      loadWalletData(cId);
      loadPointHistory();
    } catch (err) {
      console.error('Failed to load profile data:', err);
      // Fallback
      loadShopData(1);
      loadWalletData(1);
      loadPointHistory();
    }
  };

  const loadPointHistory = async () => {
    try {
      const data = await customerApi.getMyPointHistory();
      setPointHistory(data);
    } catch (err) {
      console.error('Failed to load point history:', err);
    }
  };

  const loadShopData = async (cId) => {
    try {
      const data = await customerApi.getRewardShop(cId);
      const normalized = data.map(item => ({
        ...item,
        isGrayscale: item.isGrayscale !== undefined ? item.isGrayscale : item.grayscale,
        isUnlocked: item.isUnlocked !== undefined ? item.isUnlocked : item.unlocked
      }));
      setRewardItems(normalized);
    } catch (err) {
      console.error('Failed to load reward shop:', err);
    }
  };

  const loadWalletData = async (cId) => {
    try {
      const data = await customerApi.getMyVouchers(cId, 'ISSUED');
      const mapped = data.map(v => ({
        id: v.id || v.voucherId,
        title: v.title || 'Mã giảm giá',
        description: v.description || 'Ưu đãi dành cho bạn',
        expiryDate: v.expiryDate ? new Date(v.expiryDate).toLocaleDateString('vi-VN') : 'Hạn dùng 30 ngày',
        code: v.voucherCode,
        isExpired: v.isExpired,
        discountType: v.discountType,
        value: v.value,
        applicableServiceCode: v.applicableServiceCode,
        applicableDays: v.applicableDays,
        maxDiscountAmount: v.maxDiscountAmount,
        minOrderValue: v.minOrderValue
      }));
      setMyVouchers(mapped);
    } catch (err) {
      console.error('Failed to load voucher wallet:', err);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [activeTab]);

  // Xử lý đổi quà bằng điểm thưởng
  const handleRedeemGift = (item) => {
    if (item.isGrayscale) {
      showAlert(`Bạn chưa đủ điều kiện đổi quà này: ${item.unlockTooltip}`, 'warning', 'Chưa đủ điều kiện');
      return;
    }

    if (profile.loyaltyPoints < item.pointsCost) {
      showAlert("Số điểm tích lũy của bạn không đủ để đổi quà này!", 'error', 'Không đủ điểm');
      return;
    }

    const confirmText = item.pointsCost === 0
      ? `Bạn muốn nhận quà tặng miễn phí "${item.title}" trực tiếp vào ví chứ?`
      : `Bạn có chắc chắn muốn dùng ${item.pointsCost} Pts để đổi lấy "${item.title}" không?`;

    showConfirm(
      confirmText,
      item,
      async () => {
        setIsRedeeming(true);
        try {
          const cId = profile.customerId || 1;
          if (item.pointsCost === 0) {
            await customerApi.claimFreeVoucher(item.id, cId);
          } else {
            await customerApi.exchangePoints(item.id, cId);
          }
          showAlert(`Đổi quà thành công! Đơn hàng ưu đãi "${item.title}" đã được gửi vào ví của bạn.`, 'success', 'Thành công');

          // Tải lại thông tin sau khi đổi thành công
          await loadProfileData();
          window.dispatchEvent(new Event('profileUpdated'));
        } catch (err) {
          console.error('Failed to redeem gift:', err);
          showAlert('Đổi quà thất bại: ' + (err.response?.data?.message || err.message), 'error', 'Lỗi');
        } finally {
          setIsRedeeming(false);
        }
      },
      item.pointsCost === 0 ? "Xác nhận nhận ưu đãi" : "Xác nhận đổi quà"
    );
  };

  // Sử dụng voucher - đi tới trang đặt lịch dọn xe
  const handleUseVoucher = (voucher) => {
    navigate('/customer/book');
  };

  // Helper format ngày áp dụng từ MON,TUE... sang T2,T3...
  const formatDaysText = (daysStr) => {
    if (!daysStr) return 'Mọi ngày';
    const dayMap = {
      'MON': 'T2', 'TUE': 'T3', 'WED': 'T4', 'THU': 'T5', 'FRI': 'T6', 'SAT': 'T7', 'SUN': 'CN'
    };
    return daysStr.split(',')
      .map(d => dayMap[d.trim()] || d.trim())
      .join(', ');
  };

  // Helper format loại chiết khấu
  const renderDiscountValue = (type, val) => {
    if (type === 'FREE_SERVICE' || type === 'free_wash') return 'MIỄN PHÍ';
    if (type === 'PERCENTAGE' || type === 'percent') return `-${val}%`;
    const num = Number(val);
    if (!isNaN(num) && num >= 1000 && num % 1000 === 0) {
      return `-${num / 1000}k`;
    }
    return `-${num.toLocaleString('vi-VN')} đ`;
  };

  // Lọc và sắp xếp: Đủ điều kiện (isGrayscale === false) lên trước, chưa đủ điều kiện (isGrayscale === true) xuống dưới
  const sortedFreeItems = rewardItems
    .filter(i => i.pointsCost === 0)
    .sort((a, b) => (a.isGrayscale === b.isGrayscale ? 0 : a.isGrayscale ? 1 : -1));

  const sortedExchangeItems = rewardItems
    .filter(i => i.pointsCost > 0)
    .sort((a, b) => (a.isGrayscale === b.isGrayscale ? 0 : a.isGrayscale ? 1 : -1));

  return (
    <div className="space-y-8 pb-16 text-slate-800 font-sans relative">

      {/* KHỐI HEADER TRÊN CÙNG: PHIÊN BẢN SLIM & SANG TRỌNG */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 shadow-lg border border-white/10 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Cánh trái: Greeting & Hạng thành viên */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-gradient-to-tr from-amber-400 to-yellow-300 p-2.5 rounded-xl shadow-md shrink-0">
            <Crown className="w-5 h-5 text-slate-900" />
          </div>
          <div className="text-left">
            <h2 className="text-base font-black tracking-tight flex items-center flex-wrap gap-2 text-white">
              Chào {profile.fullName || 'Khách hàng'},
              <span className="text-[10px] uppercase tracking-widest text-amber-300 font-extrabold bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                {profile.tierName || 'MEMBER'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">Hội viên chương trình chăm sóc xe NovaWash</p>
          </div>
        </div>

        {/* Cánh phải: Điểm tích lũy Slim */}
        <div className="flex items-center gap-6 relative z-10 shrink-0 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl backdrop-blur-md self-start md:self-auto">
          <div className="flex items-center gap-2.5 text-left">
            <Coins className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Điểm tích lũy</span>
              <span className="text-base font-black text-white font-mono">
                {profile.loyaltyPoints.toLocaleString('vi-VN')} <span className="text-xs font-bold text-slate-400">Pts</span>
              </span>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="text-left">
            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Giá trị quy đổi</span>
            <span className="text-sm font-bold text-amber-300 font-mono">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profile.loyaltyPoints * 1000)}
            </span>
          </div>
        </div>
      </div>

      {/* CHUYỂN ĐỔI TAB */}
      <div className="flex bg-slate-100/90 p-1.5 rounded-2xl w-full max-w-2xl border border-slate-200/60 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3.5 font-extrabold text-xs rounded-xl transition-all uppercase cursor-pointer whitespace-nowrap ${activeTab === 'shop'
            ? 'bg-white text-indigo-700 shadow-md shadow-indigo-500/5'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          <Gift size={16} className="shrink-0 text-indigo-600" />
          <span>Cửa hàng đổi điểm (Shop Pts)</span>
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3.5 font-extrabold text-xs rounded-xl transition-all uppercase cursor-pointer whitespace-nowrap ${activeTab === 'wallet'
            ? 'bg-white text-indigo-700 shadow-md shadow-indigo-500/5'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          <Wallet size={16} className="shrink-0 text-indigo-600" />
          <span>Ví của tôi ({myVouchers.filter(v => !v.isExpired).length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3.5 font-extrabold text-xs rounded-xl transition-all uppercase cursor-pointer whitespace-nowrap ${activeTab === 'history'
            ? 'bg-white text-indigo-700 shadow-md shadow-indigo-500/5'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          <Clock size={16} className="shrink-0 text-indigo-600" />
          <span>Lịch sử điểm ({pointHistory.length})</span>
        </button>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="space-y-8">

        {activeTab === 'shop' && (
          <div className="space-y-10">

            {/* 1. MỤC MỚI NHẬN / TRI ÂN MIỄN PHÍ */}
            {sortedFreeItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 text-left">
                    <Sparkles className="w-4 h-4 text-rose-500 animate-bounce" /> Quà tặng tri ân miễn phí cho bạn
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sortedFreeItems.map(item => (
                    <RewardTicketCard key={item.id} item={item} canRedeem={!item.isGrayscale} onRedeem={() => handleRedeemGift(item)} themeColor="rose" />
                  ))}
                </div>
              </div>
            )}

            {/* 2. MỤC ĐỔI ĐIỂM NHẬN ƯU ĐÃI */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 text-left">
                  <Coins className="w-4 h-4 text-indigo-600" /> Quầy đổi điểm nhận ưu đãi
                </h3>
              </div>

              {sortedExchangeItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sortedExchangeItems.map(item => (
                    <RewardTicketCard key={item.id} item={item} canRedeem={!item.isGrayscale} onRedeem={() => handleRedeemGift(item)} themeColor="indigo" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Không có mã giảm giá nào cần đổi điểm ở hạng hiện tại của bạn.
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-slate-100 gap-2">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 text-left">
                <Wallet className="w-4 h-4 text-indigo-600" /> Mã giảm giá đang sở hữu
              </h3>
              <p className="text-xs text-slate-400 font-semibold text-left">Bấm "Sử dụng" để đi tới trang đặt lịch dọn xe và áp dụng voucher.</p>
            </div>

            {myVouchers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myVouchers.map(voucher => (
                  <WalletTicketCard key={voucher.id} voucher={voucher} onUse={() => handleUseVoucher(voucher)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-sm bg-white border border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center gap-3">
                <div className="bg-slate-50 p-4 rounded-full border border-slate-105">
                  <Wallet className="w-10 h-10 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-600">Ví voucher của bạn đang trống</p>
                  <p className="text-xs text-slate-400">Hãy tích lũy điểm và đổi lấy những ưu đãi rửa xe hấp dẫn nhé!</p>
                </div>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="mt-2.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow cursor-pointer"
                >
                  Đến cửa hàng đổi điểm
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-slate-100 gap-2">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 text-left">
                <Clock className="w-4 h-4 text-indigo-600" /> Sao kê lịch sử giao dịch điểm
              </h3>
              <p className="text-xs text-slate-400 font-semibold text-left">Tra cứu mọi biến động cộng/trừ điểm tích lũy của tài khoản.</p>
            </div>

            {pointHistory.length > 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {pointHistory.map((tx, idx) => {
                    const isPlus = tx.points > 0;

                    // Format type name and colors
                    let typeText = 'Cộng điểm';
                    let typeColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
                    let descText = 'Tích lũy từ đơn dọn rửa xe';

                    if (tx.activityType === 'REDEEMED') {
                      typeText = 'Tiêu điểm';
                      typeColor = 'text-blue-600 bg-blue-50 border-blue-100';
                      descText = 'Đổi mã giảm giá / Voucher ưu đãi';
                    } else if (tx.activityType === 'EXPIRY') {
                      typeText = 'Thu hồi';
                      typeColor = 'text-rose-600 bg-rose-50 border-rose-100';
                      descText = 'Điểm tích lũy hết hạn sử dụng (12 tháng)';
                    } else if (tx.activityType === 'PENALTY') {
                      typeText = 'Phạt điểm';
                      typeColor = 'text-amber-700 bg-amber-50 border-amber-100';
                      descText = 'Trừ điểm vi phạm (Huỷ hẹn muộn / No-show)';
                    }

                    return (
                      <div key={tx.pointTransactionId || idx} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-4 text-left">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isPlus ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                            {isPlus ? <Coins className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                                {tx.bookingCode ? `Đơn hàng #${tx.bookingCode}` : typeText}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${typeColor}`}>
                                {tx.activityType}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                              {tx.bookingCode ? `${descText} #${tx.bookingCode}` : descText}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium block mt-1">
                              {new Date(tx.createdAt).toLocaleDateString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-sm sm:text-base font-black font-mono ${isPlus ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {isPlus ? `+${tx.points}` : tx.points}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block">Pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-sm bg-white border border-slate-200 rounded-[24px] flex flex-col items-center justify-center gap-3">
                <Clock className="w-10 h-10 text-slate-300" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-600">Chưa phát sinh giao dịch điểm</p>
                  <p className="text-xs text-slate-400">Lịch sử tích lũy và tiêu điểm của bạn sẽ xuất hiện tại đây.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom UI Modal Alert / Notification Dialog */}
      {alertModal.isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setAlertModal(prev => ({ ...prev, isOpen: false })); }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            {alertModal.type === 'success' && (
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                <CheckCircle2 className="w-6 h-6" />
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

      {/* Custom Confirm Modal Dialog for Redemption */}
      {confirmModal.isOpen && confirmModal.rewardItem && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !isRedeeming) setConfirmModal(prev => ({ ...prev, isOpen: false })); }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-800 mb-3 text-center">{confirmModal.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-5 text-center px-2">{confirmModal.message}</p>

            <div className="w-full bg-slate-50 rounded-xl p-4 mb-5 text-xs text-left space-y-2.5 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Tên quà tặng:</span>
                <span className="text-slate-800 font-bold">{confirmModal.rewardItem.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Chiết khấu:</span>
                <span className="text-indigo-600 font-extrabold">
                  {renderDiscountValue(confirmModal.rewardItem.discountType, confirmModal.rewardItem.value)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Điểm khấu trừ:</span>
                <span className="text-amber-600 font-bold font-mono">
                  {confirmModal.rewardItem.pointsCost === 0 ? 'Miễn phí' : `${confirmModal.rewardItem.pointsCost} Pts`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Hạn sử dụng:</span>
                <span className="text-slate-650 font-bold">30 ngày kể từ lúc nhận</span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                type="button"
                disabled={isRedeeming}
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 transition cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isRedeeming}
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isRedeeming && <Loader2 size={12} className="animate-spin" />}
                {confirmModal.rewardItem.pointsCost === 0 ? 'Xác nhận nhận' : 'Xác nhận đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  /* ========================================================================================= */
  /* INTERNAL COMPONENT: TẤM VÉ VOUCHER ĐỔI QUÀ (REWARD TICKET CARD) */
  /* ========================================================================================= */
  function RewardTicketCard({ item, canRedeem, onRedeem, themeColor }) {
    const isFree = item.pointsCost === 0;

    // Theme color mappings
    const colors = {
      rose: {
        gradient: 'from-rose-500 to-pink-600 shadow-rose-500/10',
        badge: 'bg-rose-50 text-rose-600 border border-rose-100',
        button: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 shadow-md',
        cutout: 'border-rose-100'
      },
      indigo: {
        gradient: 'from-indigo-500 to-blue-600 shadow-indigo-500/10',
        badge: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
        button: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 shadow-md',
        cutout: 'border-indigo-100'
      },
      slate: {
        gradient: 'from-slate-400 to-slate-500 shadow-slate-500/5',
        badge: 'bg-slate-100 text-slate-500 border border-slate-200',
        button: 'bg-slate-100 text-slate-550 border border-slate-200 hover:bg-slate-200 hover:text-slate-700 cursor-pointer shadow-none',
        cutout: 'border-slate-200'
      }
    }[themeColor] || {
      gradient: 'from-indigo-500 to-blue-600 shadow-indigo-500/10',
      badge: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 shadow-md',
      cutout: 'border-indigo-100'
    };

    return (
      <div
        className={`flex h-full min-h-[175px] rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 relative items-stretch ${item.isGrayscale ? 'opacity-85 saturate-[95%] grayscale-[12%]' : ''
          }`}
      >
        {/* Cánh trái: Hiển thị Mệnh giá ưu đãi thanh thoát */}
        <div className={`w-28 self-stretch flex flex-col justify-center items-center text-white p-3 relative shrink-0 bg-gradient-to-b ${colors.gradient}`}>
          {/* Semicircles Decorative cutouts */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-slate-50 rounded-bl-full pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-slate-50 rounded-tl-full pointer-events-none"></div>

          <div className="bg-white/15 p-2 rounded-full border border-white/20 mb-1.5">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] uppercase font-extrabold text-white/80 tracking-widest">ƯU ĐÃI</span>
          {(() => {
            const valStr = renderDiscountValue(item.discountType, item.value);
            const isFreeText = valStr === 'MIỄN PHÍ';
            return (
              <span className={`${isFreeText ? 'text-xs font-black tracking-tight' : 'text-base font-black'} text-center leading-tight mt-0.5 w-full font-sans whitespace-nowrap`}>
                {valStr}
              </span>
            );
          })()}
        </div>

        {/* Cánh phải: Nội dung chi tiết thoáng đãng */}
        <div className="flex-1 p-4 flex flex-col justify-between relative bg-white">
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-1">{item.title}</h4>
              <span className={`font-mono text-[11px] font-black px-2 py-0.5 rounded-md shrink-0 ${colors.badge}`}>
                {isFree ? 'FREE' : `${item.pointsCost} Pts`}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">{item.description}</p>

            {/* RÀNG BUỘC CHI TIẾT (Nếu có) */}
            <div className="flex flex-wrap gap-1 pt-1">
              {item.applicableServiceCode && (
                <span className="text-[9px] font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                  Gói: {item.applicableServiceCode}
                </span>
              )}
              {item.applicableDays && (
                <span className="text-[9px] font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                  Thứ áp dụng: {formatDaysText(item.applicableDays)}
                </span>
              )}
              {Number(item.maxDiscountAmount) > 0 && (
                <span className="text-[9px] font-bold bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.5 rounded-md">
                  Tối đa: {Number(item.maxDiscountAmount).toLocaleString('vi-VN')}đ
                </span>
              )}
              {Number(item.minOrderValue) > 0 && (
                <span className="text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-md">
                  Đơn tối thiểu: {Number(item.minOrderValue).toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {/* Lock Tooltip nếu bị khóa */}
            {item.isGrayscale && (
              <div className="bg-amber-50/80 text-amber-800 text-[10px] p-2 rounded-lg border border-amber-200/60 flex items-center gap-1.5 mt-1.5 font-semibold">
                <AlertCircle size={13} className="shrink-0 text-amber-600" />
                <span className="line-clamp-1">{item.unlockTooltip}</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-150/80 flex justify-between items-center">
            <span className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
              <Clock size={11} className="text-slate-400" /> Hết hạn: {item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : '30 ngày'}
            </span>

            <button
              onClick={onRedeem}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all active:scale-[0.98] cursor-pointer ${item.isGrayscale
                ? 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 shadow-none'
                : colors.button
                }`}
            >
              {item.isGrayscale ? 'Chưa mở khóa' : isFree ? 'Nhận ngay' : 'Đổi điểm'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================================= */
  /* INTERNAL COMPONENT: TẤM VÉ VOUCHER TRONG VÍ (WALLET TICKET CARD) */
  /* ========================================================================================= */
  function WalletTicketCard({ voucher, onUse }) {
    return (
      <div
        className={`flex h-full min-h-[175px] rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 relative items-stretch ${voucher.isExpired ? 'opacity-60 bg-slate-50' : ''
          }`}
      >
        {/* Cánh trái: Hiển thị Mệnh giá */}
        <div className={`w-28 self-stretch flex flex-col justify-center items-center text-white p-3 relative shrink-0 ${voucher.isExpired
          ? 'bg-slate-400'
          : 'bg-gradient-to-b from-indigo-600 via-blue-600 to-indigo-700 shadow-md shadow-indigo-500/10'
          }`}>
          {/* Semicircles Cutouts */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-slate-50 rounded-bl-full pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-slate-50 rounded-tl-full pointer-events-none"></div>

          <div className="bg-white/15 p-2 rounded-full border border-white/20 mb-1.5">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] uppercase font-extrabold text-white/80 tracking-widest">SỞ HỮU</span>
          {(() => {
            const valStr = renderDiscountValue(voucher.discountType, voucher.value);
            const isFreeText = valStr === 'MIỄN PHÍ';
            return (
              <span className={`${isFreeText ? 'text-xs font-black tracking-tight' : 'text-base font-black'} text-center leading-tight mt-0.5 w-full font-sans whitespace-nowrap`}>
                {valStr}
              </span>
            );
          })()}
        </div>

        {/* Cánh phải: Thông tin */}
        <div className="flex-1 p-4 flex flex-col justify-between relative bg-white">
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-1">{voucher.title}</h4>
              <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Khả dụng
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">{voucher.description}</p>

            {/* RÀNG BUỘC SỬ DỤNG */}
            <div className="flex flex-wrap gap-1 pt-1">
              {voucher.applicableServiceCode && (
                <span className="text-[9px] font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                  Gói: {voucher.applicableServiceCode}
                </span>
              )}
              {voucher.applicableDays && (
                <span className="text-[9px] font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                  Thứ áp dụng: {formatDaysText(voucher.applicableDays)}
                </span>
              )}
              {Number(voucher.maxDiscountAmount) > 0 && (
                <span className="text-[9px] font-bold bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.5 rounded-md">
                  Tối đa: {Number(voucher.maxDiscountAmount).toLocaleString('vi-VN')}đ
                </span>
              )}
              {Number(voucher.minOrderValue) > 0 && (
                <span className="text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-md">
                  Đơn tối thiểu: {Number(voucher.minOrderValue).toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-150/80 flex justify-between items-center">
            <span className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
              <Clock size={11} className="text-slate-400" /> Hết hạn: {voucher.expiryDate || 'N/A'}
            </span>

            <button
              disabled={voucher.isExpired}
              onClick={onUse}
              className={`px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black tracking-wider uppercase shadow transition-all active:scale-[0.98] ${voucher.isExpired ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'cursor-pointer'
                }`}
            >
              Sử dụng
            </button>
          </div>
        </div>
      </div>
    );
  }
}

