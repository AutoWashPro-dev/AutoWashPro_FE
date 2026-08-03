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
    cardGradient: 'bg-gradient-to-br from-[#66460B] via-[#9E7314] via-[#D4AF37] to-[#2A1A02] text-white border-amber-400/60 shadow-2xl shadow-amber-950/40',
    headerBg: 'from-[#3A2403] via-[#8C6219] to-[#D4AF37]',
    badgeBg: 'bg-gradient-to-r from-[#FFF0B3] via-[#E2B755] to-[#B38728] text-slate-950 font-black border border-[#FFF8D6] shadow-md',
    highlightBorder: 'border-amber-400',
    accentColor: 'text-amber-700',
    bgLight: 'bg-amber-50/90 border-amber-200',
    buttonBg: 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-md',
    iconBox: 'bg-amber-100 text-amber-800'
  },
  PLATINUM: {
    name: 'HẠNG BẠCH KIM (PLATINUM VIP)',
    voucherAccess: 'Đặc quyền Voucher Platinum tối thượng + Mọi Voucher toàn hệ thống',
    cardGradient: 'bg-gradient-to-br from-slate-950 via-purple-950 to-zinc-950 text-purple-100 border-purple-500/50 shadow-2xl shadow-purple-950/50',
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

  // Helper dynamic hover shadow & scale based on Tier
  const getTierHoverStyle = (tierKey) => {
    switch (tierKey) {
      case 'PLATINUM':
        return 'hover:scale-[1.035] hover:shadow-[0_25px_50px_rgba(168,85,247,0.5)] hover:border-purple-400/80';
      case 'GOLD':
        return 'hover:scale-[1.03] hover:shadow-[0_20px_45px_rgba(212,175,55,0.45)] hover:border-amber-300';
      case 'SILVER':
        return 'hover:scale-[1.02] hover:shadow-[0_15px_35px_rgba(148,163,184,0.35)] hover:border-slate-300';
      default:
        return 'hover:scale-[1.015] hover:shadow-[0_10px_25px_rgba(59,130,246,0.25)] hover:border-blue-400';
    }
  };

  return (
    <>
      {/* THẺ LOYALTY CARD KHÁCH HÀNG (CÓ THỂ CLICK) */}
      <div
        onClick={() => setIsModalOpen(true)}
        className={`rounded-2xl p-6 border shadow-lg relative overflow-hidden transition-all duration-500 transform cursor-pointer group ${theme.cardGradient} ${getTierHoverStyle(currentTierKey)}`}
      >
        {/* Shimmer Light Reflection Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60 pointer-events-none z-0 group-hover:opacity-90 transition-opacity duration-500"></div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none z-0 group-hover:scale-125 transition-transform duration-700"></div>

        {/* LEVEL 1. MEMBER: Soft Sapphire Water Wave Aura on Hover */}
        {currentTierKey === 'MEMBER' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40 group-hover:opacity-70 transition-opacity">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-400/25 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-indigo-400/20 rounded-full blur-xl"></div>
          </div>
        )}

        {/* LEVEL 2. SILVER: Metallic Chrome Sheen Sweep on Hover */}
        {currentTierKey === 'SILVER' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-70">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          </div>
        )}

        {/* LEVEL 3. GOLD: Royal 24K Gold Ray Swell & Golden Sparkles */}
        {currentTierKey === 'GOLD' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-90">
            {/* Golden Ray Aura expanding on hover */}
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-amber-400/25 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-yellow-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
            {/* Golden dust sparkles */}
            <div className="absolute top-4 left-1/3 w-1.5 h-1.5 bg-[#FFF0B3] rounded-full shadow-[0_0_8px_#FFE58F] animate-pulse"></div>
            <div className="absolute bottom-6 left-12 w-1 h-1 bg-[#FCE482] rounded-full shadow-[0_0_6px_#FFE58F]" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-1/2 right-12 w-1.5 h-1.5 bg-amber-200 rounded-full shadow-[0_0_8px_#F5D061] animate-pulse" style={{ animationDuration: '2s' }}></div>
            <svg className="absolute inset-0 w-full h-full opacity-40 group-hover:opacity-75 transition-opacity mix-blend-color-dodge" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15%" cy="20%" r="1.2" fill="#FFE58F" />
              <circle cx="40%" cy="15%" r="1.5" fill="#FFF0B3" />
              <circle cx="65%" cy="35%" r="1" fill="#FFE58F" />
              <circle cx="85%" cy="25%" r="1.4" fill="#FFF0B3" />
              <circle cx="25%" cy="75%" r="1" fill="#FFE58F" />
              <circle cx="55%" cy="80%" r="1.3" fill="#FFF0B3" />
            </svg>
          </div>
        )}

        {/* LEVEL 4. PLATINUM (ULTIMATE): Cosmic Purple Nebula Burst & Star Constellations */}
        {currentTierKey === 'PLATINUM' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-90">
            {/* Pulsing Purple Cosmic Nebula expanding on hover */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl group-hover:scale-135 group-hover:bg-purple-600/45 transition-all duration-700"></div>
            <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-indigo-600/25 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
            {/* Multi-layered 3D Twinkling Star Constellations */}
            <div className="absolute top-3 left-8 w-1 h-1 bg-white rounded-full shadow-[0_0_6px_#fff] animate-pulse"></div>
            <div className="absolute top-10 left-1/4 w-1.5 h-1.5 bg-white/95 rounded-full shadow-[0_0_8px_#fff]"></div>
            <div className="absolute top-6 right-1/3 w-1 h-1 bg-purple-200/90 rounded-full"></div>
            <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-white/90 rounded-full shadow-[0_0_6px_#fff] animate-pulse" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-1/2 left-10 w-0.5 h-0.5 bg-white/80 rounded-full"></div>
            <div className="absolute bottom-12 right-10 w-1 h-1 bg-white/90 rounded-full shadow-[0_0_6px_#fff]"></div>
            <div className="absolute top-4 right-8 w-1.5 h-1.5 bg-white/95 rounded-full shadow-[0_0_8px_#fff] animate-pulse" style={{ animationDuration: '2s' }}></div>
            <div className="absolute bottom-4 left-1/3 w-1 h-1 bg-white/80 rounded-full"></div>
            <div className="absolute top-12 right-1/4 w-0.5 h-0.5 bg-white/80 rounded-full"></div>
            <div className="absolute bottom-10 right-1/3 w-1.5 h-1.5 bg-amber-200/90 rounded-full shadow-[0_0_6px_#fde68a]"></div>
            <svg className="absolute inset-0 w-full h-full opacity-50 group-hover:opacity-90 transition-opacity mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15%" cy="25%" r="1" fill="#ffffff" />
              <circle cx="35%" cy="15%" r="1.5" fill="#ffffff" />
              <circle cx="55%" cy="30%" r="0.8" fill="#ffffff" />
              <circle cx="75%" cy="18%" r="1.2" fill="#ffffff" />
              <circle cx="88%" cy="40%" r="1.5" fill="#ffffff" />
              <circle cx="22%" cy="65%" r="1" fill="#ffffff" />
              <circle cx="48%" cy="75%" r="1.3" fill="#ffffff" />
              <circle cx="68%" cy="60%" r="0.8" fill="#ffffff" />
              <circle cx="82%" cy="80%" r="1.1" fill="#ffffff" />
              <circle cx="92%" cy="20%" r="0.7" fill="#ffffff" />
              <circle cx="10%" cy="85%" r="1.4" fill="#ffffff" />
            </svg>
          </div>
        )}

        {/* Top hint badge */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="text-left">
            <span className={`text-[10px] uppercase tracking-widest font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
              currentTierKey === 'PLATINUM' ? 'text-purple-200' :
              currentTierKey === 'GOLD' ? 'text-[#FFF0B3]' :
              currentTierKey === 'SILVER' ? 'text-slate-200' :
              'text-blue-100'
            }`}>Thẻ Thành Viên VIP</span>
            <h3 className="text-xl font-extrabold font-mono tracking-wider mt-0.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{customer?.fullName?.toUpperCase() || 'KHÁCH HÀNG'}</h3>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1 transition-all duration-300 ${
              currentTierKey === 'GOLD' 
                ? 'bg-gradient-to-r from-[#FFF0B3] via-[#E2B755] to-[#B38728] text-slate-950 border border-[#FFF8D6] group-hover:scale-110 group-hover:shadow-[0_0_15px_#fde68a]' 
                : currentTierKey === 'PLATINUM'
                ? 'bg-gradient-to-r from-purple-300 via-purple-400 to-indigo-300 text-purple-950 border border-purple-200 group-hover:scale-110 group-hover:shadow-[0_0_20px_#e9d5ff]'
                : currentTierKey === 'SILVER'
                ? 'bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 text-slate-950 border border-white group-hover:scale-105 group-hover:shadow-[0_0_10px_#e2e8f0]'
                : 'bg-white/20 backdrop-blur-md border border-white/20 text-white group-hover:scale-105'
            }`}>
              <Crown className={`w-3.5 h-3.5 transition-transform duration-300 ${
                currentTierKey === 'GOLD' ? 'text-slate-950 group-hover:rotate-12' :
                currentTierKey === 'PLATINUM' ? 'text-purple-950 group-hover:-rotate-12' :
                currentTierKey === 'SILVER' ? 'text-slate-900 group-hover:rotate-6' :
                'text-amber-300'
              }`} />
              {currentTierKey}
            </span>
            <span className="text-[10px] bg-black/40 hover:bg-black/60 px-2 py-0.5 rounded-full text-white font-semibold transition flex items-center gap-1 group-hover:scale-105 border border-white/20 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} /> Xem quyền lợi
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end pt-2 text-left relative z-10">
          <div>
            <span className={`text-xs font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
              currentTierKey === 'PLATINUM' ? 'text-purple-200' :
              currentTierKey === 'GOLD' ? 'text-[#FFF0B3]' :
              currentTierKey === 'SILVER' ? 'text-slate-200' :
              'text-blue-100'
            }`}>Điểm Tích Lũy</span>
            <p className="text-3xl font-black tracking-tight mt-0.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{customer?.loyaltyPoints?.toLocaleString('vi-VN') || 0} <span className="text-sm font-bold opacity-85">Pts</span></p>
          </div>
          <div className="text-right">
            <span className={`text-[10px] uppercase tracking-wider font-extrabold block drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
              currentTierKey === 'PLATINUM' ? 'text-purple-200' :
              currentTierKey === 'GOLD' ? 'text-[#FFF0B3]' :
              currentTierKey === 'SILVER' ? 'text-slate-200' :
              'text-blue-100'
            }`}>Chi tiêu tích lũy</span>
            <span className="text-sm font-extrabold font-mono text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
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
