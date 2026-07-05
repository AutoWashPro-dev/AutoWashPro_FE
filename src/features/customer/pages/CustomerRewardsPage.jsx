import React, { useState } from 'react';
import { Gift, Award, Wallet, ArrowRight, CheckCircle2 } from 'lucide-react';
import VoucherTicket from '../components/VoucherTicket';
import QRModal from '../components/QRModal';

export default function CustomerRewardsPage() {
  // State quản lý số dư điểm của khách hàng (Bắt đầu với 1240 Pts)
  const [loyaltyPoints, setLoyaltyPoints] = useState(1240);
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' hoặc 'wallet'
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState('');
  const [selectedVoucherTitle, setSelectedVoucherTitle] = useState('');

  // 1. Danh sách quà tặng đổi điểm (Rewards Shop)
  const [rewardItems, setRewardItems] = useState([
    { id: 1, title: "Voucher giảm 100.000đ hóa đơn", pointsCost: 250, description: "Áp dụng giảm trực tiếp cho mọi hóa đơn đặt lịch rửa xe hoặc dịch vụ phụ trợ." },
    { id: 2, title: "Miễn phí dọn rửa chi tiết (Deluxe)", pointsCost: 400, description: "Đổi 1 lượt sử dụng gói Deluxe trị giá 150.000đ hoàn toàn miễn phí." },
    { id: 3, title: "Dưỡng đen lốp cao cấp miễn phí", pointsCost: 50, description: "Tặng gói xịt dưỡng cao su bảo vệ và làm đen bóng lốp xe máy." },
    { id: 4, title: "3 Tháng rửa xe không giới hạn", pointsCost: 2500, description: "Đặc quyền tối thượng dành cho khách hàng Platinum: Rửa xe miễn phí trong 90 ngày." }
  ]);

  // 2. Danh sách Ví Voucher cá nhân (My Voucher Wallet)
  const [myVouchers, setMyVouchers] = useState([
    { id: 101, title: "Voucher giảm giá 20.000đ gầm xe", description: "Áp dụng giảm giá cho đơn rửa xe bất kỳ.", expiryDate: "15/07/2026", code: "VOU-20K-8819", isExpired: false },
    { id: 102, title: "Quà tặng Gold Member: Miễn phí dưỡng sên", description: "Voucher độc quyền hạng Gold tri ân khách hàng thân thiết.", expiryDate: "10/07/2026", code: "VOU-SEN-9922", isExpired: false },
    { id: 103, title: "Voucher giảm giá 50.000đ rửa máy", description: "Voucher đền bù do trạm quá tải ngày cuối tuần.", expiryDate: "20/06/2026", code: "VOU-50K-EXPIRED", isExpired: true }
  ]);

  // Xử lý đổi quà bằng điểm thưởng
  const handleRedeemGift = (item) => {
    if (loyaltyPoints < item.pointsCost) return;

    const confirmRedeem = window.confirm(`Bạn có chắc chắn muốn dùng ${item.pointsCost} Pts để đổi lấy "${item.title}" không?`);
    if (!confirmRedeem) return;

    // Trừ điểm ví
    setLoyaltyPoints(prev => prev - item.pointsCost);

    // Sinh mã ngẫu nhiên cho Voucher mới
    const randomCode = `VOU-REDEEM-${Math.floor(1000 + Math.random() * 9000)}`;

    // Tạo Voucher mới đưa vào ví của khách
    const newVoucher = {
      id: Date.now(),
      title: item.title,
      description: item.description,
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'), // Hạn 14 ngày
      code: randomCode,
      isExpired: false
    };

    setMyVouchers([newVoucher, ...myVouchers]);
    alert(`Đổi quà thành công! Đơn hàng ưu đãi "${item.title}" đã được gửi vào ví của bạn.`);
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
              Hạng Thẻ Vàng (GOLD MEMBER)
            </span>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mt-3">Chào Sarah Jenkins</h2>
            <p className="text-xs text-blue-100/80">Bạn đang tham gia chương trình khách hàng thân thiết cùng AutoWash Pro.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-xs text-blue-100 font-semibold uppercase block">Điểm tích lũy hiện có</span>
              <span className="text-3xl font-black tracking-tight">{loyaltyPoints} <span className="text-sm font-normal">Pts</span></span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-blue-200 font-bold block uppercase">Quy đổi tương đương</span>
              <span className="text-base font-bold font-mono">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(loyaltyPoints * 1000)}</span>
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
                const canRedeem = loyaltyPoints >= item.pointsCost;

                return (
                  <div 
                    key={item.id}
                    className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                        <span className="font-mono text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl shrink-0">
                          {item.pointsCost} Pts
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        Giá trị: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.pointsCost * 1000)}
                      </span>
                      <button
                        disabled={!canRedeem}
                        onClick={() => handleRedeemGift(item)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          canRedeem
                            ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                        }`}
                      >
                        {canRedeem ? 'Đổi quà ngay' : 'Không đủ Pts'}
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
