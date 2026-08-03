// Utility helper for tier-specific button styles, colors, badges and star ratings across Customer Portal

export const getTierTheme = (tierName) => {
  const t = String(tierName || '').toUpperCase();

  if (t.includes('PLATINUM')) {
    return {
      tierKey: 'PLATINUM',
      // Primary Action Button (Cosmic Galaxy Purple Gradient)
      btnPrimary: 'bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 hover:from-purple-800 hover:to-indigo-800 text-white font-bold shadow-lg shadow-purple-900/40 border border-purple-400/40 transition-all transform hover:scale-[1.02] active:scale-95',
      // Secondary / Outline Action Button
      btnSecondary: 'bg-purple-950/20 hover:bg-purple-900/40 text-purple-200 border border-purple-400/40 font-bold transition-all',
      // Outline Button (for Service cards)
      btnOutline: 'border-2 border-purple-500/60 hover:bg-purple-600 hover:text-white text-purple-300 font-bold transition-all shadow-sm',
      // Text Accent Color
      textAccent: 'text-purple-400',
      // Star Rating Active Color
      starColor: 'text-purple-400 fill-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]',
      // Modal Header Gradient
      modalHeader: 'bg-gradient-to-r from-slate-950 via-purple-950 to-zinc-950 text-white border-b border-purple-500/30'
    };
  }

  if (t.includes('GOLD')) {
    return {
      tierKey: 'GOLD',
      // Primary Action Button (Royal 24K Metallic Gold Gradient)
      btnPrimary: 'bg-gradient-to-r from-[#D4AF37] via-[#C59328] to-[#8C6219] hover:from-[#E2B755] hover:to-[#A37314] text-slate-950 font-black shadow-lg shadow-amber-950/30 border border-[#FFF8D6]/70 transition-all transform hover:scale-[1.02] active:scale-95',
      // Secondary / Outline Action Button
      btnSecondary: 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 border border-amber-400/60 font-bold transition-all',
      // Outline Button (for Service cards)
      btnOutline: 'border-2 border-amber-500/60 hover:bg-gradient-to-r hover:from-amber-500 hover:to-yellow-600 hover:text-slate-950 text-amber-700 font-bold transition-all shadow-sm',
      // Text Accent Color
      textAccent: 'text-amber-600',
      // Star Rating Active Color
      starColor: 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.85)]',
      // Modal Header Gradient
      modalHeader: 'bg-gradient-to-r from-[#2A1A02] via-[#78530E] to-[#D4AF37] text-white border-b border-amber-400/30'
    };
  }

  if (t.includes('SILVER')) {
    return {
      tierKey: 'SILVER',
      // Primary Action Button (Platinum Silver Chrome Gradient)
      btnPrimary: 'bg-gradient-to-r from-slate-700 via-zinc-800 to-slate-900 hover:from-slate-800 hover:to-zinc-900 text-white font-bold shadow-md border border-slate-300/40 transition-all transform hover:scale-[1.02] active:scale-95',
      // Secondary / Outline Action Button
      btnSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold transition-all',
      // Outline Button (for Service cards)
      btnOutline: 'border-2 border-slate-400 hover:bg-slate-800 hover:text-white text-slate-700 font-bold transition-all shadow-sm',
      // Text Accent Color
      textAccent: 'text-slate-700',
      // Star Rating Active Color
      starColor: 'text-slate-400 fill-slate-400 drop-shadow-[0_0_6px_rgba(148,163,184,0.7)]',
      // Modal Header Gradient
      modalHeader: 'bg-gradient-to-r from-[#1E293B] via-[#475569] to-[#0F172A] text-white border-b border-slate-300/30'
    };
  }

  // MEMBER (Default Blue Sapphire)
  return {
    tierKey: 'MEMBER',
    btnPrimary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-95',
    btnSecondary: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold transition-all',
    btnOutline: 'border-2 border-blue-500 hover:bg-blue-600 hover:text-white text-blue-600 font-bold transition-all shadow-sm',
    textAccent: 'text-blue-600',
    starColor: 'text-amber-400 fill-amber-400 drop-shadow-sm',
    modalHeader: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b border-blue-400/30'
  };
};
