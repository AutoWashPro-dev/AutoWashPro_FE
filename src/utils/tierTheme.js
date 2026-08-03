// High-contrast, maximum-readability tier theme helper for Customer Portal

export const getTierTheme = (tierName) => {
  const t = String(tierName || '').toUpperCase();

  if (t.includes('PLATINUM')) {
    return {
      tierKey: 'PLATINUM',
      // Primary Action Button (Rich Vibrant Purple Gradient with Crisp White Bold Text)
      btnPrimary: 'bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 hover:from-purple-800 hover:to-indigo-950 text-white font-bold shadow-md shadow-purple-950/30 border border-purple-400/40 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
      // Secondary Button (Dark purple text on light purple background)
      btnSecondary: 'bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300 font-extrabold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed',
      // Outline Button for Cards
      btnOutline: 'bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed',
      // Text Accent for links & icons on white backgrounds
      textAccent: 'text-purple-800 font-extrabold',
      // Tag Badge for service cards
      tagBadge: 'bg-purple-100 text-purple-950 border border-purple-300 font-black',
      // Star Rating Active Color
      starColor: 'text-purple-600 fill-purple-600 drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]',
      // Modal Header Gradient
      modalHeader: 'bg-gradient-to-r from-slate-950 via-purple-950 to-zinc-950 text-white border-b border-purple-500/40'
    };
  }

  if (t.includes('GOLD')) {
    return {
      tierKey: 'GOLD',
      // Primary Action Button (Royal 24K Gold Gradient with Sharp Dark Slate Text)
      btnPrimary: 'bg-gradient-to-r from-[#D4AF37] via-[#E2B755] to-[#B38728] hover:from-[#E2B755] hover:to-[#9E7314] text-slate-950 font-black shadow-md shadow-amber-950/30 border border-[#FFF8D6] transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
      // Secondary Button (Warm amber background with crisp dark brown text)
      btnSecondary: 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-extrabold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed',
      // Outline Button for Cards
      btnOutline: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed',
      // Text Accent for links & icons on white backgrounds
      textAccent: 'text-amber-800 font-extrabold',
      // Tag Badge for service cards
      tagBadge: 'bg-amber-100 text-amber-950 border border-amber-300 font-black',
      // Star Rating Active Color
      starColor: 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.85)]',
      // Modal Header Gradient
      modalHeader: 'bg-gradient-to-r from-[#2A1A02] via-[#78530E] to-[#D4AF37] text-white border-b border-amber-400/40'
    };
  }

  if (t.includes('SILVER')) {
    return {
      tierKey: 'SILVER',
      btnPrimary: 'bg-gradient-to-r from-slate-800 via-slate-900 to-zinc-900 hover:from-slate-900 hover:to-black text-white font-bold shadow-md border border-slate-400/40 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
      btnSecondary: 'bg-slate-200 hover:bg-slate-300 text-slate-950 border border-slate-400 font-extrabold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed',
      btnOutline: 'bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed',
      textAccent: 'text-slate-800 font-extrabold',
      tagBadge: 'bg-slate-200 text-slate-900 border border-slate-300 font-black',
      starColor: 'text-slate-600 fill-slate-600 drop-shadow-[0_0_6px_rgba(100,116,139,0.7)]',
      modalHeader: 'bg-gradient-to-r from-[#1E293B] via-[#475569] to-[#0F172A] text-white border-b border-slate-300/40'
    };
  }

  // MEMBER (Default Blue Sapphire)
  return {
    tierKey: 'MEMBER',
    btnPrimary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
    btnSecondary: 'bg-blue-100 hover:bg-blue-200 text-blue-950 border border-blue-300 font-extrabold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed',
    btnOutline: 'bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed',
    textAccent: 'text-blue-700 font-extrabold',
    tagBadge: 'bg-blue-100 text-blue-900 border border-blue-200 font-black',
    starColor: 'text-amber-400 fill-amber-400 drop-shadow-sm',
    modalHeader: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b border-blue-400/40'
  };
};
