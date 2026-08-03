import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, X, CheckCircle2, ShieldCheck, Zap, Calendar, Gift, Award } from 'lucide-react';
import { loyaltyApi } from '../../admin/services/loyaltyApi';

const TIER_THEMES = {
  MEMBER: {
    name: 'HẠNG THÀNH VIÊN (MEMBER)',
    voucherAccess: 'Kho Voucher cơ bản toàn hệ thống NovaWash',
    cardGradient: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-800 text-white border-indigo-400',
    headerBg: 'bg-gradient-to-r from-blue-700 via-indigo-900 to-blue-900 text-white',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    highlightBorder: 'border-blue-400',
    accentColor: 'text-blue-600',
    bgLight: 'bg-blue-50/70 border-blue-200/80',
    buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    iconBox: 'bg-blue-100 text-blue-700'
  },
  SILVER: {
    name: 'HẠNG BẠC (SILVER)',
    voucherAccess: 'Voucher độc quyền Hạng Bạc + Tất cả Voucher từ Hạng Bạc trở xuống',
    cardGradient: 'bg-gradient-to-br from-slate-400 via-zinc-500 to-slate-700 text-white border-slate-300',
    headerBg: 'bg-gradient-to-r from-slate-800 via-zinc-900 to-slate-900 text-white',
    badgeBg: 'bg-slate-200 text-slate-900 border-slate-300',
    highlightBorder: 'border-slate-400',
    accentColor: 'text-slate-700',
    bgLight: 'bg-slate-100/90 border-slate-200',
    buttonBg: 'bg-slate-800 hover:bg-slate-900 text-white',
    iconBox: 'bg-slate-200 text-slate-800'
  },
  GOLD: {
    name: 'HẠNG VÀNG (GOLD VIP)',
    voucherAccess: 'Voucher độc quyền Hạng Vàng + Tất cả Voucher từ Hạng Vàng trở xuống',
    cardGradient: 'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#FFE58F] via-[#C8963E] via-45% to-[#3D2702] text-amber-50 border-[#FCE482]/60 shadow-2xl shadow-amber-950/40',
    headerBg: 'from-[#3D2702] via-[#8C6219] to-[#E2B755]',
    badgeBg: 'bg-gradient-to-r from-[#FFF0B3] via-[#E2B755] to-[#B38728] text-slate-950 font-black border border-[#FFF8D6] shadow-md',
    highlightBorder: 'border-amber-400',
    accentColor: 'text-amber-700',
    bgLight: 'bg-amber-50/90 border-amber-200',
    buttonBg: 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-md',
    iconBox: 'bg-amber-100 text-amber-800'
  },
  PLATINUM: {
    name: 'HẠNG BẠCH KIM (PLATINUM)',
    voucherAccess: 'Đặc quyền Voucher Platinum tối thượng + Mọi Voucher toàn hệ thống',
    cardGradient: 'bg-gradient-to-br from-slate-900 via-purple-950 to-zinc-950 text-purple-100 border-purple-500/50',
    headerBg: 'from-purple-950 via-slate-900 to-zinc-950',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    highlightBorder: 'border-purple-500',
    accentColor: 'text-purple-600',
    bgLight: 'bg-purple-50/70 border-purple-200',
    buttonBg: 'bg-purple-700 hover:bg-purple-800 text-white',
    iconBox: 'bg-purple-100 text-purple-900'
  }
};

export default function VIPCard({ customer }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tierConfigs, setTierConfigs] = useState({});

  useEffect(() => {
    const loadTierConfigs = async () => {
      try {
        const tiers = await loyaltyApi.getAllTiers();
        if (Array.isArray(tiers) && tiers.length > 0) {
          const map = {};
          tiers.forEach(t => {
            const key = (t.key || t.name || t.tierName || '').toUpperCase();
            map[key] = {
              minSpend: t.minSpendVnd !== undefined ? t.minSpendVnd : (t.minSpend || 0),
              multiplier: t.tierMultiplier !== undefined ? t.tierMultiplier : (t.pointMultiplier || 1.0),
              bookingWindowDays: t.bookingWindowDays || t.bookingWindow || 7
            };
          });
          setTierConfigs(map);
        }
      } catch (e) {}
    };

    loadTierConfigs();
    window.addEventListener('autowash_tiers_updated', loadTierConfigs);
    return () => window.removeEventListener('autowash_tiers_updated', loadTierConfigs);
  }, []);

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
  const theme = TIER_THEMES[currentTierKey] || TIER_THEMES.MEMBER;

  // Resolve dynamic values from Admin settings API / tierConfigs state / customer object
  const currentTierConfig = tierConfigs[currentTierKey] || {};
  const multiplier = customer?.tier?.tierMultiplier ?? customer?.tierMultiplier ?? currentTierConfig.multiplier ?? (currentTierKey === 'PLATINUM' ? 2.0 : currentTierKey === 'GOLD' ? 1.5 : currentTierKey === 'SILVER' ? 1.2 : 1.0);
  const bookingWindowDays = customer?.bookingWindowDays ?? customer?.tier?.bookingWindowDays ?? currentTierConfig.bookingWindowDays ?? (currentTierKey === 'PLATINUM' ? 14 : currentTierKey === 'GOLD' ? 12 : currentTierKey === 'SILVER' ? 10 : 7);
  const minSpend = customer?.tier?.minSpend ?? customer?.tier?.minSpendVnd ?? currentTierConfig.minSpend ?? (currentTierKey === 'PLATINUM' ? 10000000 : currentTierKey === 'GOLD' ? 5000000 : currentTierKey === 'SILVER' ? 1000000 : 0);

  const minSpendText = Number(minSpend).toLocaleString('vi-VN') + 'đ';
  const advanceDaysText = `Đặt trước ${bookingWindowDays} ngày`;

  const perks = [
    `Hệ số nhân điểm thưởng: ${multiplier}x hệ số (Tích ${multiplier} điểm / 10.000 VNĐ)`,
    `Thời gian đặt lịch trước: Ưu tiên đặt trước tối đa ${bookingWindowDays} ngày`,
    `Sở hữu & áp dụng Voucher ưu đãi độc quyền dành riêng cho Hạng ${currentTierKey}`,
    `Đặc quyền dịch vụ & hỗ trợ chăm sóc VIP tại trạm dọn xe`
  ];

  return (
    <>
      {/* THẺ LOYALTY CARD KHÁCH HÀNG (CÓ THỂ CLICK) */}
      <div
        onClick={() => setIsModalOpen(true)}
        className={`rounded-2xl p-6 border shadow-lg relative overflow-hidden transition-all duration-300 transform hover:scale-[1.015] hover:shadow-2xl cursor-pointer group ${theme.cardGradient}`}
      >
        {/* Shimmer Light Reflection Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-80 pointer-events-none"></div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        {/* Top hint badge */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-widest opacity-80 font-bold">Thẻ Thành Viên VIP</span>
            <h3 className="text-xl font-extrabold font-mono tracking-wider mt-0.5 drop-shadow-sm">{customer?.fullName?.toUpperCase() || 'KHÁCH HÀNG'}</h3>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1 ${currentTierKey === 'GOLD' ? 'bg-gradient-to-r from-[#FFF0B3] via-[#E2B755] to-[#B38728] text-slate-950 border border-[#FFF8D6]' : 'bg-white/20 backdrop-blur-md border border-white/20 text-white'}`}>
              <Crown className={`w-3.5 h-3.5 ${currentTierKey === 'GOLD' ? 'text-slate-900' : 'text-amber-300'}`} />
              {currentTierKey}
            </span>
            <span className="text-[10px] bg-black/25 hover:bg-black/40 px-2 py-0.5 rounded-full text-white/95 font-medium transition flex items-center gap-1 group-hover:scale-105 border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} /> Xem quyền lợi
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end pt-2 text-left relative z-10">
          <div>
            <span className="text-xs opacity-80 font-medium">Điểm Tích Lũy</span>
            <p className="text-3xl font-black tracking-tight mt-0.5 drop-shadow-sm">{customer?.loyaltyPoints?.toLocaleString('vi-VN') || 0} <span className="text-sm font-bold opacity-80">Pts</span></p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider opacity-80 font-semibold block">Chi tiêu tích lũy</span>
            <span className="text-sm font-extrabold font-mono text-amber-100 drop-shadow-sm">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer?.lifetimeSpend || customer?.tierSpending || customer?.totalSpending || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* MODAL POPUP: CHỈ HIỂN THỊ ĐẶC QUYỀN VÀ TONE MÀU CỦA HẠNG ĐÓ */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in text-left"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Header Modal theo Tone Màu của Hạng */}
            <div className={`bg-gradient-to-r ${theme.headerBg} p-6 text-white relative overflow-hidden shrink-0`}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg shrink-0`}>
                    <Crown className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black tracking-tight text-white">
                        {theme.name}
                      </h3>
                    </div>
                    <p className="text-xs text-white/80 mt-0.5 font-medium">
                      Đặc quyền dành cho <strong className="text-white font-bold">{customer?.fullName}</strong>
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

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">

              {/* Tóm tắt hồ sơ khách hàng */}
              <div className={`${theme.bgLight} rounded-2xl p-4.5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left border`}>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Họ và Tên</span>
                  <span className="text-sm font-black text-slate-800">{customer?.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Điểm tích lũy</span>
                  <span className={`text-sm font-black font-mono ${theme.accentColor}`}>{customer?.loyaltyPoints?.toLocaleString('vi-VN')} Pts</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tổng chi tiêu</span>
                  <span className="text-sm font-black text-slate-800 font-mono">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer?.lifetimeSpend || customer?.tierSpending || customer?.totalSpending || 0)}
                  </span>
                </div>
              </div>

              {/* Thông số Ma Trận Hạng VIP (Khớp với Cấu Hình Hệ Thống) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-left">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Hệ số nhân điểm
                  </span>
                  <p className={`text-xl font-black font-mono ${theme.accentColor}`}>
                    {multiplier}x
                  </p>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Tích {multiplier} điểm / 10.000 VNĐ</span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-left">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> Đặt lịch trước
                  </span>
                  <p className="text-xl font-black text-slate-800 font-sans">
                    {advanceDaysText}
                  </p>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Mốc min: {minSpendText}</span>
                </div>
              </div>

              {/* Chi tiết Quyền Lợi & Quy Tắc Voucher */}
              <div className="space-y-3 pt-1">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Award className={`w-4 h-4 ${theme.accentColor}`} /> Đặc Quyền & Quyền Lợi Chi Tiết:
                </h4>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs text-left">
                  <div className="flex items-start gap-2 text-slate-800 font-semibold">
                    <Gift className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Quyền hạn Voucher:</strong> {theme.voucherAccess}</span>
                  </div>

                  <div className="border-t border-slate-200/60 pt-2 space-y-2">
                    {perks.map((perk, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-700 font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              </span>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${theme.buttonBg}`}
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
