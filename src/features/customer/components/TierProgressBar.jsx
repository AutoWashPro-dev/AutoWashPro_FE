import React from 'react';

export default function TierProgressBar({ customer }) {
  const totalSpending = Number(customer?.totalSpending) || 0;

  let targetLimit = 0;
  let nextTierLabel = "";
  let currentLimit = 0;

  if (totalSpending < 1000000) {
    targetLimit = 1000000;
    nextTierLabel = "SILVER";
    currentLimit = 0;
  } else if (totalSpending < 5000000) {
    targetLimit = 5000000;
    nextTierLabel = "GOLD";
    currentLimit = 1000000;
  } else if (totalSpending < 10000000) {
    targetLimit = 10000000;
    nextTierLabel = "PLATINUM";
    currentLimit = 5000000;
  } else {
    targetLimit = totalSpending;
    nextTierLabel = "MAX";
    currentLimit = 10000000;
  }

  const isMax = nextTierLabel === "MAX";
  const amountNeeded = Math.max(0, targetLimit - totalSpending);
  
  let percentage = 100;
  if (!isMax) {
    percentage = ((totalSpending - currentLimit) / (targetLimit - currentLimit)) * 100;
    percentage = Math.min(Math.max(percentage || 0, 0), 100);
  }

  // Format tiền tệ Việt Nam
  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tiến trình xét hạng VIP</span>
        {!isMax && (
          <span className="text-xs text-slate-500 font-medium">
            Hạng tiếp theo: <span className="font-bold text-blue-600">{nextTierLabel}</span>
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
        <span className="text-slate-500 font-medium">Tích lũy: {formatCurrency(totalSpending)}</span>
        {!isMax ? (
          <span className="text-slate-600 font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
            Cần thêm {formatCurrency(amountNeeded)}
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
