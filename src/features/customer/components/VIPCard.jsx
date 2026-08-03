import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, X, CheckCircle2, ShieldCheck, Zap, Calendar, Gift, Award } from 'lucide-react';

const TIER_BENEFITS = [
  {
    tierKey: 'MEMBER',
    name: 'Thành Viên (Member)',
    minSpendText: '0đ',
    badgeBg: 'bg-blue-100 text-blue-700 border-blue-200',
    multiplier: 'x1.0',
    advanceDays: '7 ngày',
    voucherAccess: 'Kho Voucher cơ bản toàn hệ thống',
    perks: [
      'Tích lũy x1.0 điểm thưởng cho mọi đơn dọn rửa xe',
      'Được quyền đặt lịch trước tối đa 7 ngày',
      'Tham gia chương trình đổi quà bằng điểm tích lũy'
    ]
  },
  {
    tierKey: 'SILVER',
    name: 'Hạng Bạc (Silver)',
    minSpendText: '1.000.000đ',
    badgeBg: 'bg-slate-200 text-slate-800 border-slate-300',
    multiplier: 'x1.1',
    advanceDays: '14 ngày',
    voucherAccess: 'Sở hữu Voucher độc quyền Silver + Dùng tất cả Voucher từ Hạng Bạc trở xuống',
    perks: [
      'Tăng 10% điểm thưởng tích lũy (Hệ số x1.1)',
      'Ưu tiên đặt lịch trước tối đa 14 ngày',
      'Sở hữu & sử dụng tất cả Voucher dành riêng cho Hạng Bạc trở xuống',
      'Nhận Voucher quà tặng chúc mừng sinh nhật VIP'
    ]
  },
  {
    tierKey: 'GOLD',
    name: 'Hạng Vàng (Gold)',
    minSpendText: '5.000.000đ',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    multiplier: 'x1.2',
    advanceDays: '30 ngày (Khung giờ Vàng)',
    voucherAccess: 'Sở hữu Voucher độc quyền Gold + Dùng tất cả Voucher từ Hạng Vàng trở xuống',
    perks: [
      'Tăng 20% điểm thưởng tích lũy (Hệ số x1.2)',
      'Ưu tiên đặt lịch trước đến 30 ngày (Giữ trước khung giờ Vàng cao điểm)',
      'Sở hữu & áp dụng toàn bộ Voucher dành riêng cho Hạng Vàng trở xuống',
      'Hàng chờ ưu tiên tiếp nhận xe nhanh tại trạm NovaWash'
    ]
  },
  {
    tierKey: 'PLATINUM',
    name: 'Hạng Bạch Kim (Platinum)',
    minSpendText: '10.000.000đ',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    multiplier: 'x1.5',
    advanceDays: '60 ngày (Tối đa)',
    voucherAccess: 'Đặc quyền Voucher Platinum tối thượng + Mọi Voucher toàn hệ thống',
    perks: [
      'Tích điểm siêu tốc x1.5 cho mọi dịch vụ dọn rửa',
      'Đặt lịch ưu tiên tuyệt đối lên tới 60 ngày',
      'Sở hữu toàn bộ Voucher đặc quyền Platinum và Voucher hệ thống',
      'Chăm sóc VIP 1-1 & Miễn phí dịch vụ dưỡng bóng lốp/sên đi kèm'
    ]
  }
];

export default function VIPCard({ customer }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentTierName = customer?.tier?.tierName || customer?.tierName || 'MEMBER';
  const currentTierKey = currentTierName.toUpperCase();

  const getTierStyles = (tierName) => {
    switch (tierName?.toUpperCase()) {
      case 'PLATINUM':
        return 'bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-950 text-slate-100 border-zinc-700';
      case 'GOLD':
        return 'bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-800 text-white border-amber-400';
      case 'SILVER':
        return 'bg-gradient-to-br from-slate-300 via-slate-400 to-zinc-500 text-slate-900 border-slate-200';
      default: // MEMBER
        return 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-800 text-white border-indigo-400';
    }
  };

  return (
    <>
      {/* THẺ LOYALTY CARD KHÁCH HÀNG (CÓ THỂ CLICK) */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`rounded-2xl p-6 border shadow-lg relative overflow-hidden transition-all duration-300 transform hover:scale-[1.015] hover:shadow-2xl cursor-pointer group ${getTierStyles(currentTierName)}`}
      >
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

        {/* Top hint badge */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-widest opacity-75 font-semibold">Thẻ Thành Viên VIP</span>
            <h3 className="text-xl font-extrabold font-mono tracking-wider mt-0.5">{customer?.fullName?.toUpperCase() || 'KHÁCH HÀNG'}</h3>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider border border-white/20 shadow-sm flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              {currentTierKey}
            </span>
            <span className="text-[10px] bg-black/20 hover:bg-black/30 px-2 py-0.5 rounded-full text-white/90 font-medium transition flex items-center gap-1 group-hover:scale-105">
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} /> Xem đặc quyền
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end pt-2 text-left">
          <div>
            <span className="text-xs opacity-75 font-medium">Điểm Tích Lũy</span>
            <p className="text-3xl font-black tracking-tight mt-0.5">{customer?.loyaltyPoints?.toLocaleString('vi-VN') || 0} <span className="text-sm font-bold opacity-80">Pts</span></p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider opacity-75 font-semibold block">Chi tiêu tích lũy</span>
            <span className="text-sm font-extrabold font-mono text-amber-200">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer?.lifetimeSpend || customer?.tierSpending || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* MODAL POPUP: CHI TIẾT HỒ SƠ & TẤT CẢ ĐẶC QUYỀN HẠNG VIP */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in text-left"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20 shrink-0">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                      Đặc Quyền Thành Viên VIP
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                        {currentTierKey}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5 font-medium">
                      Hồ sơ thành viên & Quyền lợi độc quyền của {customer?.fullName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Tóm tắt hồ sơ khách hàng */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Họ và Tên</span>
                  <span className="text-sm font-black text-slate-800">{customer?.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Điểm tích lũy</span>
                  <span className="text-sm font-black text-amber-600 font-mono">{customer?.loyaltyPoints?.toLocaleString('vi-VN')} Pts</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tổng chi tiêu</span>
                  <span className="text-sm font-black text-indigo-600 font-mono">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer?.lifetimeSpend || customer?.tierSpending || 0)}
                  </span>
                </div>
              </div>

              {/* Danh sách Quyền lợi từng Hạng Thành Viên */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" /> Bảng Đặc Quyền Hạng Thành Viên NovaWash
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">Bảng so sánh chi tiết</span>
                </div>

                <div className="space-y-4">
                  {TIER_BENEFITS.map((tier) => {
                    const isCurrent = tier.tierKey === currentTierKey;
                    return (
                      <div
                        key={tier.tierKey}
                        className={`rounded-2xl p-5 border transition-all relative text-left ${
                          isCurrent
                            ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-50/60 via-white to-sky-50/30 shadow-md ring-2 ring-amber-400/20'
                            : 'border-slate-200/80 bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        {/* Current Tier Badge */}
                        {isCurrent && (
                          <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Hạng hiện tại của bạn
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${tier.badgeBg}`}>
                              {tier.name}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              (Từ {tier.minSpendText})
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-bold flex-wrap">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-emerald-600" /> Hệ số điểm: <strong className="font-mono text-emerald-800">{tier.multiplier}</strong>
                            </span>
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Đặt trước: <strong className="font-mono text-blue-800">{tier.advanceDays}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Privileges & Voucher Rules */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-start gap-2 text-slate-700 font-medium">
                            <Gift className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <span><strong>Quyền sử dụng Voucher:</strong> {tier.voucherAccess}</span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            {tier.perks.map((perk, pIdx) => (
                              <div key={pIdx} className="flex items-start gap-2 text-slate-600 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{perk}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Bảo mật thông tin riêng tư khách hàng
              </span>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
