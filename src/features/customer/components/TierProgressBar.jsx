import React, { useState, useEffect } from 'react';
import { customerApi } from '../services/customerApi';

export default function TierProgressBar() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        setLoading(true);
        const data = await customerApi.getCustomerProfile();
        setProfileData(data);
      } catch (error) {
        console.error("Failed to fetch customer profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerInfo();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-3.5 bg-slate-200 rounded-full w-full mb-3"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  const tierSpending = profileData?.tierSpending !== undefined && profileData?.tierSpending !== null 
    ? profileData.tierSpending 
    : (profileData?.totalSpending || 0);
  const tierName = profileData?.tierName || 'MEMBER';
  const progressPercentage = profileData?.progressPercentage || 0;
  const spendNeededForNextTier = profileData?.spendNeededForNextTier || 0;
  const nextTierName = profileData?.nextTierName || 'SILVER';

  const isPlatinum = String(tierName).toUpperCase().includes('PLATINUM');

  // Format currency
  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Tiến trình xét hạng VIP ({tierName})
        </span>
        {!isPlatinum && nextTierName && (
          <span className="text-xs text-slate-500 font-medium">
            Hạng tiếp theo: <span className="font-bold text-blue-600">{nextTierName}</span>
          </span>
        )}
      </div>

      {/* Thanh Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-3.5 relative overflow-hidden mb-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3.5 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Chú thích thông tin chi tiết */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-500 font-medium">Tích lũy: {formatCurrency(tierSpending)}</span>
        {!isPlatinum ? (
          <span className="text-slate-600 font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
            Chi tiêu thêm {formatCurrency(spendNeededForNextTier)} để thăng hạng {nextTierName}
          </span>
        ) : (
          <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
            🏆 Bạn đã đạt hạng hội viên cao nhất (PLATINUM)!
          </span>
        )}
      </div>
    </div>
  );
}
