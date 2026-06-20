import React from 'react';
import { Crown, CalendarDays, ChevronRight } from 'lucide-react';

export default function ProfileSummaryCard() {
  return (
    <div className="lg:col-span-4 flex flex-col gap-[24px] w-full">
      {/* Account Summary Card */}
      <div className="bg-white border border-border-main flex flex-col gap-[24px] overflow-hidden p-[25px] rounded-[12px] shadow-sm w-full relative">
        <div className="flex gap-[16px] items-center w-full z-10">
          <div className="bg-primary-light border-4 border-white flex items-center justify-center p-[4px] rounded-full shadow-sm size-[64px]">
            <Crown className="text-primary" size={28} />
          </div>
          <div className="flex flex-col gap-[4px]">
            <p className="font-medium text-text-muted text-[14px] tracking-[0.7px] uppercase leading-[20px]">HẠNG THÀNH VIÊN</p>
            <p className="font-bold text-primary-dark text-[24px] leading-[32px]">Platinum</p>
          </div>
        </div>

        <div className="border-border-main border-t flex pt-[25px] w-full z-10">
          <div className="flex-1 flex flex-col gap-[4px]">
            <p className="font-normal text-text-muted text-[12px] leading-[16px]">Điểm tích lũy</p>
            <p className="font-semibold text-text-main text-[18px] leading-[28px]">2.450</p>
          </div>
          <div className="flex-1 flex flex-col gap-[4px]">
            <p className="font-normal text-text-muted text-[12px] leading-[16px]">Đơn hàng</p>
            <p className="font-semibold text-text-main text-[18px] leading-[28px]">12</p>
          </div>
        </div>

        <div className="border-border-main border-t flex justify-center pt-[17px] w-full z-10">
          <div className="flex gap-[4px] items-center text-text-muted">
            <CalendarDays size={14} />
            <p className="font-normal text-[12px] leading-[16px]">Tham gia từ 01/2024</p>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute bg-primary blur-[20px] opacity-10 -right-[48px] rounded-full size-[128px] -top-[48px]" />
      </div>

      {/* Ad/Banner Card */}
      <div className="bg-white border border-border-main flex flex-col overflow-hidden p-[25px] rounded-[12px] w-full relative">
        <div className="absolute inset-0 bg-blue-50 opacity-50 pointer-events-none" />

        <div className="flex flex-col gap-[8px] pb-[1px] w-full z-10">
          <p className="font-bold text-primary-dark text-[14px] leading-[20px]">Ưu đãi Platinum</p>
          <div className="font-semibold text-text-main text-[16px] leading-[24px]">
            <p>Giảm 20% cho gói phủ Ceramic</p>
            <p>toàn diện.</p>
          </div>
          <a href="#" className="flex gap-[4px] items-center pt-[10.5px] text-primary-dark hover:underline">
            <span className="font-medium text-[14px] leading-[20px]">Xem chi tiết</span>
            <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
