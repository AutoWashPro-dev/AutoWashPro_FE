import React, { useState, useEffect } from 'react';
import { Gift, Award, Wallet, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import VoucherTicket from '../components/VoucherTicket';
import QRModal from '../components/QRModal';
import { customerApi } from '../services/customerApi';

export default function CustomerRewardsPage() {
  const [profile, setProfile] = useState({
    fullName: 'Sarah Jenkins',
    loyaltyPoints: 1240,
    tierName: 'GOLD MEMBER'
  });
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' hoặc 'wallet'
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState('');
  const [selectedVoucherTitle, setSelectedVoucherTitle] = useState('');

  // 1. Danh sách quà tặng đổi điểm (Rewards Shop)
  const [rewardItems, setRewardItems] = useState([]);

  // 2. Danh sách Ví Voucher cá nhân (My Voucher Wallet)
  const [myVouchers, setMyVouchers] = useState([]);

  const loadProfileData = async () => {
    try {
      const data = await customerApi.getProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadShopData = async () => {
    try {
      const data = await customerApi.getRewardShop();
      setRewardItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadWalletData = async () => {
    try {
      const data = await customerApi.getMyVouchers('ISSUED');
      const mapped = data.map(v => ({
        id: v.id,
        title: v.title || 'Mã giảm giá',
        description: v.description || 'Ưu đãi dành cho bạn',
        expiryDate: v.expiryDate ? new Date(v.expiryDate).toLocaleDateString('vi-VN') : 'Hạn dùng 30 ngày',
        code: v.voucherCode,
        isExpired: v.isExpired
      }));
      setMyVouchers(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProfileData();
    loadShopData();
    loadWalletData();
  }, [activeTab]);

  // Xử lý đổi quà bằng điểm thưởng (Thực tế thông qua Backend)
  const handleRedeemGift = async (item) => {
    if (item.isGrayscale) {
      alert(`Bạn chưa đủ điều kiện đổi quà này: ${item.unlockTooltip}`);
      return;
    }

    if (profile.loyaltyPoints < item.pointsCost) {
      alert("Số điểm tích lũy của bạn không đủ để đổi quà này!");
      return;
    }

    const confirmRedeem = window.confirm(`Bạn có chắc chắn muốn dùng ${item.pointsCost} Pts để đổi lấy "${item.title}" không?`);
    if (!confirmRedeem) return;

    try {
      if (item.pointsCost === 0) {
        await customerApi.claimFreeVoucher(item.id);
      } else {
        await customerApi.exchangePoints(item.id);
      }
      alert(`Đổi quà thành công! Đơn hàng ưu đãi "${item.title}" đã được gửi vào ví của bạn.`);
      
      // Tải lại thông tin sau khi đổi thành công
      await loadProfileData();
      await loadShopData();
      await loadWalletData();
    } catch (err) {
      console.error('Failed to redeem gift:', err);
      alert('Đổi quà thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  // Sử dụng voucher mở mã QR
  const handleUseVoucher = (voucher) => {
    setSelectedVoucherCode(voucher.code);
    setSelectedVoucherTitle(voucher.title);
    setIsQrOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* KHỐI HEADER TRÊN CÙNG: ĐIỂM VÀ TIẾN TRÌNH THĂNG HẠNG */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 text-white rounded-3xl p-6 lg:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-blue-200 font-extrabold bg-white/10 px-3 py-1 rounded-full border border-white/5">
              Hạng: {profile.tierName || 'MEMBER'}
            </span>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mt-3">Chào {profile.fullName || 'Khách hàng'}</h2>
            <p className="text-xs text-blue-100/80">Bạn đang tham gia chương trình khách hàng thân thiết cùng AutoWash Pro.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-xs text-blue-100 font-semibold uppercase block">Điểm tích lũy hiện có</span>
              <span className="text-3xl font-black tracking-tight">{profile.loyaltyPoints || 0} <span className="text-sm font-normal">Pts</span></span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-blue-200 font-bold block uppercase">Quy đổi tương đương</span>
              <span className="text-base font-bold font-mono">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((profile.loyaltyPoints || 0) * 1000)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHUYỂN ĐỔI TAB: REWARDS SHOP VS MY VOUCHER WALLET */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'shop'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Gift size={16} /> Cửa hàng đổi điểm (Shop Pts)
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'wallet'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Wallet size={16} /> Ví Voucher của tôi ({myVouchers.filter(v => !v.isExpired).length})
        </button>
      </div>

      {/* HIỂN THỊ NỘI DUNG THEO TAB */}
      <div>
        {activeTab === 'shop' ? (
          /* ========================================================================================= */
          /* TAB 1: CỬA HÀNG ĐỔI ĐIỂM (REWARDS SHOP) */
          /* ========================================================================================= */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Award size={16} className="text-blue-600" /> Đổi điểm tích lũy lấy mã giảm giá
              </h3>
              <span className="text-xs text-slate-400 font-medium">Tỷ lệ quy đổi: 1 Pts = 1.000 đ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rewardItems.map(item => {
                const canRedeem = !item.isGrayscale && profile.loyaltyPoints >= item.pointsCost;

                return (
                  <div 
                    key={item.id}
                    className={`bg-white border border-slate-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                      item.isGrayscale ? 'opacity-70 bg-slate-50/20' : ''
                    }`}
                  >
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                        <span className="font-mono text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl shrink-0">
                          {item.pointsCost} Pts
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                      
                      {item.isGrayscale && (
                        <div className="bg-amber-50 text-amber-700 text-[10px] p-2.5 rounded-xl border border-amber-100/60 flex items-start gap-1.5 mt-2 font-semibold">
                          <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                          <span>{item.unlockTooltip}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        {item.pointsCost > 0 
                          ? `Giá trị quy đổi: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.pointsCost * 1000)}`
                          : "Voucher miễn phí (0 Pts)"}
                      </span>
                      <button
                        disabled={!canRedeem}
                        onClick={() => handleRedeemGift(item)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          canRedeem
                            ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md cursor-pointer'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                        }`}
                      >
                        {item.isGrayscale ? 'Chưa mở khóa' : canRedeem ? 'Đổi quà ngay' : 'Không đủ Pts'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ========================================================================================= */
          /* TAB 2: VÍ VOUCHER CỦA TÔI (MY VOUCHER WALLET) */
          /* ========================================================================================= */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Wallet size={16} className="text-blue-600" /> Mã giảm giá đang sở hữu
              </h3>
              <p className="text-xs text-slate-500">Bấm **Sử dụng** để lấy mã QR quét thanh toán tại quầy.</p>
            </div>

            {myVouchers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myVouchers.map(voucher => (
                  <VoucherTicket
                    key={voucher.id}
                    voucher={voucher}
                    actionLabel={voucher.isExpired ? "Hết hạn" : "Sử dụng"}
                    isExpired={voucher.isExpired}
                    onAction={() => handleUseVoucher(voucher)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm bg-white border border-dashed rounded-2xl">
                Bạn chưa đổi mã giảm giá nào. Hãy tích lũy điểm và đổi quà nhé!
              </div>
            )}
          </div>
        )}
      </div>

      {/* POPUP MODAL PHÓNG TO MÃ QR VOUCHER ĐỂ DÙNG TẠI CỬA HÀNG */}
      <QRModal 
        isOpen={isQrOpen} 
        onClose={() => setIsQrOpen(false)} 
        title={selectedVoucherTitle}
        qrValue={selectedVoucherCode}
        description="Đưa mã QR voucher này cho thu ngân lúc thanh toán tại quầy để được áp dụng giảm giá trực tiếp."
      />

    </div>
  );
}
