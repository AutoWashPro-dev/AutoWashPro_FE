import React from 'react';

export default function TierProgressBar({ customer, tiers = [] }) {
  const currentTier = customer.tier;
  const tierSpending = customer.tierSpending || 0;

  // Tìm hạng tiếp theo trong danh sách các hạng
  const getNextTier = () => {
    if (!currentTier || !tiers.length) return null;
    
    // Sắp xếp các hạng tăng dần theo số tiền yêu cầu tối thiểu
    const sortedTiers = [...tiers].sort((a, b) => a.minSpend - b.minSpend);
    const currentIndex = sortedTiers.findIndex(t => t.tierId === currentTier.tierId);
    
    if (currentIndex !== -1 && currentIndex < sortedTiers.length - 1) {
      return sortedTiers[currentIndex + 1];
    }
    return null; // Đã đạt hạng cao nhất (Platinum)
  };

  const nextTier = getNextTier();
  
  // Tính toán phần trăm tiến trình
  const calculatePercentage = () => {
    if (!nextTier) return 100;
    const currentMin = currentTier.minSpend || 0;
    const nextMin = nextTier.minSpend || 0;
    
    if (nextMin === currentMin) return 100;
    
    const percentage = ((tierSpending - currentMin) / (nextMin - currentMin)) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const percentage = calculatePercentage();
  const remainingSpend = nextTier ? Math.max(nextTier.minSpend - tierSpending, 0) : 0;

  // Format tiền tệ Việt Nam
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tiến trình xét hạng VIP</span>
        {nextTier && (
          <span className="text-xs text-slate-500 font-medium">
            Hạng tiếp theo: <span className="font-bold text-blue-600">{nextTier.tierName}</span>
          </span>
        )}
      </div>

      {/* Thanh Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-3.5 relative overflow-hidden mb-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3.5 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Chú thích thông tin chi tiết */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-500 font-medium">Tích lũy: {formatCurrency(tierSpending)}</span>
        {nextTier ? (
          <span className="text-slate-600 font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
            Cần thêm {formatCurrency(remainingSpend)}
          </span>
        ) : (
          <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
            🏆 Đã đạt hạng Platinum cao nhất
          </span>
        )}
      </div>
    </div>
  );
}
