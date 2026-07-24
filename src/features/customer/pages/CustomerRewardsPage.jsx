import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Award, Wallet, ArrowRight, CheckCircle2, AlertCircle, Crown, Sparkles, Clock, Lock, Coins, QrCode, Tag } from 'lucide-react';
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
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState('');
  const [selectedVoucherTitle, setSelectedVoucherTitle] = useState('');

  // 1. Danh sách quà tặng đổi điểm (Rewards Shop)
  const [rewardItems, setRewardItems] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'FREE', // 'FREE' | 'POINTS'
    rewardData: null
  });

  const [rewardAlert, setRewardAlert] = useState({
    isOpen: false,
    type: 'success', // 'success' | 'warning' | 'error'
    title: '',
    message: ''
  });

  // 2. Danh sách Ví Voucher cá nhân (My Voucher Wallet)
  const [myVouchers, setMyVouchers] = useState([]);

  // 3. Danh sách Lịch sử biến động điểm
  const [pointHistory, setPointHistory] = useState([]);

  const loadProfileData = async () => {
    try {
      const data = await customerApi.getProfile();
      const cId = data.customerId || 1;
      setProfile({
        fullName: data.fullName || 'Nguyễn Minh Anh',
        loyaltyPoints: data.loyaltyPoints || 0,
        tierName: data.tierDisplayName || data.tierName || 'PLATINUM MEMBER',
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

  const handleRedeemGift = (item) => {
    if (item.isGrayscale) {
      setRewardAlert({
        isOpen: true,
        type: 'warning',
        title: "Chưa đủ điều kiện nhận quà",
        message: `Cần thêm ${item.pointsCost - profile.loyaltyPoints} điểm Loyalty hoặc đạt hạng cao hơn để mở khóa quà tặng này.`
      });
      return;
    }

    if (profile.loyaltyPoints < item.pointsCost) {
      setRewardAlert({
        isOpen: true,
        type: 'warning',
        title: "Chưa đủ điều kiện nhận quà",
        message: `Số điểm tích lũy của bạn không đủ để đổi quà này! Cần thêm ${item.pointsCost - profile.loyaltyPoints} điểm Loyalty.`
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: item.pointsCost === 0 ? 'FREE' : 'POINTS',
      rewardData: item
    });
  };

  const executeRedeem = async () => {
    const item = confirmModal.rewardData;
    if (!item) return;
    
    setConfirmModal(prev => ({ ...prev, isOpen: false }));

    try {
      const cId = profile.customerId || 1;
      if (item.pointsCost === 0) {
        await customerApi.claimFreeVoucher(item.id, cId);
      } else {
        await customerApi.exchangePoints(item.id, cId);
      }
      
      setRewardAlert({
        isOpen: true,
        type: 'success',
        title: "Nhận quà thành công!",
        message: `Ưu đãi [${item.title}] đã được lưu vào 'Ví của tôi'. Bạn có thể sử dụng ngay khi đặt lịch dọn xe!`
      });
      
      await loadProfileData();
    } catch (err) {
      console.error('Failed to redeem gift:', err);
      setRewardAlert({
        isOpen: true,
        type: 'error',
        title: "Đổi quà thất bại",
        message: err.response?.data?.message || err.message || "Đã xảy ra lỗi khi quy đổi."
      });
    }
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
    <div className="space-y-8 pb-16 text-slate-800 font-sans">
      
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
            <p className="text-xs text-slate-400 font-medium">Hội viên chương trình chăm sóc xe AutoWash Pro</p>
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

      {/* CHUYỂN ĐỔI TAB: REWARDS SHOP VS MY VOUCHER WALLET VS POINTS HISTORY */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-lg overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 font-black text-xs rounded-xl transition-all uppercase cursor-pointer whitespace-nowrap ${
            activeTab === 'shop'
              ? 'bg-white text-indigo-700 shadow-md shadow-indigo-500/5'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gift size={15} /> Cửa hàng đổi điểm (Shop Pts)
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 font-black text-xs rounded-xl transition-all uppercase cursor-pointer whitespace-nowrap ${
            activeTab === 'wallet'
              ? 'bg-white text-indigo-700 shadow-md shadow-indigo-500/5'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet size={15} /> Ví của tôi ({myVouchers.filter(v => !v.isExpired).length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 font-black text-xs rounded-xl transition-all uppercase cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-white text-indigo-700 shadow-md shadow-indigo-500/5'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock size={15} /> Lịch sử điểm ({pointHistory.length})
        </button>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="space-y-8">
        
        {activeTab === 'shop' && (
          /* ========================================================================================= */
          /* TAB 1: SHOP PTS (CỬA HÀNG ĐỔI ĐIỂM THƯỞNG) */
          /* ========================================================================================= */
          <div className="space-y-10">
            
            {/* 1. MỤC MỚI NHẬN / TRI ÂN MIỄN PHÍ */}
            {sortedFreeItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
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
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
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
          /* ========================================================================================= */
          /* TAB 2: VÍ VOUCHER CỦA TÔI */
          /* ========================================================================================= */
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-600" /> Mã giảm giá đang sở hữu
              </h3>
              <p className="text-xs text-slate-400 font-semibold">Bấm "Sử dụng" để đi tới trang đặt lịch dọn xe và áp dụng voucher.</p>
            </div>

            {myVouchers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myVouchers.map(voucher => (
                  <WalletTicketCard key={voucher.id} voucher={voucher} onUse={() => handleUseVoucher(voucher)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-sm bg-white border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center gap-3">
                <div className="bg-slate-50 p-4 rounded-full border border-slate-100">
                  <Wallet className="w-10 h-10 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-600">Ví voucher của bạn đang trống</p>
                  <p className="text-xs text-slate-400">Hãy tích lũy điểm và đổi lấy những ưu đãi rửa xe hấp dẫn nhé!</p>
                </div>
                <button 
                  onClick={() => setActiveTab('shop')}
                  className="mt-2.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow"
                >
                  Đến cửa hàng đổi điểm
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          /* ========================================================================================= */
          /* TAB 3: LỊCH SỬ BIẾN ĐỘNG ĐIỂM (SAO KÊ) */
          /* ========================================================================================= */
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> Sao kê lịch sử giao dịch điểm
              </h3>
              <p className="text-xs text-slate-400 font-semibold">Tra cứu mọi biến động cộng/trừ điểm tích lũy của tài khoản.</p>
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
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isPlus ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
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

      {/* CONFIRM REDEEM/CLAIM MODAL */}
      {confirmModal.isOpen && confirmModal.rewardData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 flex flex-col items-center text-center space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {confirmModal.type === 'FREE' ? (
              <>
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/10">
                  <Gift className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black tracking-tight font-outfit">Xác nhận nhận quà tặng</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Bạn có muốn nhận quà tặng miễn phí <strong className="text-slate-800 font-bold">[{confirmModal.rewardData.title}]</strong> trực tiếp vào ví của mình không?
                  </p>
                </div>
                <div className="flex gap-3 w-full pt-2">
                  <button
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-655 font-bold rounded-xl text-xs transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={executeRedeem}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Xác nhận Nhận Quà
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <Coins className="w-8 h-8" />
                </div>
                <div className="space-y-2 w-full">
                  <h3 className="text-base font-black tracking-tight font-outfit">Xác nhận đổi ưu đãi</h3>
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs space-y-2 text-left w-full">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-500">Ưu đãi</span>
                      <span className="font-black text-slate-800">{confirmModal.rewardData.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-500">Chi phí</span>
                      <span className="font-black text-rose-600 font-mono">-{confirmModal.rewardData.pointsCost} Pts</span>
                    </div>
                    <div className="h-px bg-slate-200 my-1" />
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-500">Điểm hiện tại</span>
                      <span className="text-slate-800 font-mono">{profile.loyaltyPoints} Pts</span>
                    </div>
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-500">Còn lại sau đổi</span>
                      <span className="text-indigo-700 font-mono">{profile.loyaltyPoints - confirmModal.rewardData.pointsCost} Pts</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 w-full pt-2">
                  <button
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-655 font-bold rounded-xl text-xs transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={executeRedeem}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Đổi ngay
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ACTION ALERT DIALOG */}
      {rewardAlert.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 flex flex-col items-center text-center space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            {rewardAlert.type === 'warning' && (
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            )}
            {rewardAlert.type === 'error' && (
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            )}
            {rewardAlert.type === 'success' && (
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}

            <div className="space-y-1">
              <h3 className="text-base font-black tracking-tight font-outfit">{rewardAlert.title}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {rewardAlert.message}
              </p>
            </div>

            <button
              onClick={() => {
                setRewardAlert(prev => ({ ...prev, isOpen: false }));
                if (rewardAlert.type === 'success') {
                  setActiveTab('wallet');
                }
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 font-bold text-xs transition-colors cursor-pointer"
            >
              Xác nhận
            </button>
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
        className={`flex h-full min-h-[175px] rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 relative items-stretch ${
          item.isGrayscale ? 'opacity-85 saturate-[95%] grayscale-[12%]' : ''
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
                  Trần giảm: {Number(item.maxDiscountAmount).toLocaleString('vi-VN')}đ
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
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all active:scale-[0.98] cursor-pointer ${
                item.isGrayscale 
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
        className={`flex h-full min-h-[175px] rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 relative items-stretch ${
          voucher.isExpired ? 'opacity-60 bg-slate-50' : ''
        }`}
      >
        {/* Cánh trái: Hiển thị Mệnh giá */}
        <div className={`w-28 self-stretch flex flex-col justify-center items-center text-white p-3 relative shrink-0 ${
          voucher.isExpired 
            ? 'bg-slate-400' 
            : 'bg-gradient-to-b from-indigo-600 via-blue-600 to-indigo-700 shadow-md shadow-indigo-500/10'
        }`}>
          {/* Semicircles Cutouts */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-slate-50 rounded-bl-full pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-slate-50 rounded-tl-full pointer-events-none"></div>
          
          <div className="bg-white/15 p-2 rounded-full border border-white/20 mb-1.5">
            <QrCode className="w-5 h-5 text-white" />
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
                  Trần giảm: {Number(voucher.maxDiscountAmount).toLocaleString('vi-VN')}đ
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
              className={`px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black tracking-wider uppercase shadow transition-all active:scale-[0.98] ${
                voucher.isExpired ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'cursor-pointer'
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
