import React from 'react';
import { Car, Package, CalendarClock } from 'lucide-react';

export default function BookingSummary() {
  return (
    <div className="flex flex-col h-full items-start w-[360px] shrink-0">
      <div className="bg-white border border-solid border-[#c3c6d6] shadow-[0px_4px_10px_rgba(31,41,55,0.08)] rounded-[16px] p-[25px] flex flex-col gap-[16px] w-full">
        {/* Header */}
        <div className="border-b border-solid border-[#c3c6d6] w-full pb-[17px]">
          <h3 className="font-['Inter'] font-semibold text-[#181c1e] text-[24px] leading-[32px] m-0">
            Tóm tắt đặt lịch
          </h3>
        </div>

        {/* Summary Details */}
        <div className="flex flex-col gap-[16px] w-full">
          {/* Car */}
          <div className="flex gap-[12px] items-start w-full">
            <div className="pt-[2px] shrink-0">
              <Car size={18} className="text-[#434654]" />
            </div>
            <div className="flex flex-col w-full">
              <span className="font-['Inter'] font-normal text-[#434654] text-[12px] leading-[16px]">
                Phương tiện
              </span>
              <div className="flex items-center gap-[4px] mt-[2px]">
                <span className="font-['Inter'] font-medium text-[#181c1e] text-[14px] leading-[20px]">
                  VinFast VF8
                </span>
                <span className="font-['Liberation_Mono'] text-[#181c1e] text-[14px] leading-[20px]">
                  (30A-123.45)
                </span>
              </div>
            </div>
          </div>

          {/* Package */}
          <div className="flex gap-[12px] items-start w-full">
            <div className="pt-[2px] shrink-0">
              <Package size={18} className="text-[#434654]" />
            </div>
            <div className="flex flex-col w-full">
              <span className="font-['Inter'] font-normal text-[#434654] text-[12px] leading-[16px]">
                Gói dịch vụ
              </span>
              <span className="font-['Inter'] font-medium text-[#181c1e] text-[14px] leading-[20px] mt-[2px]">
                Chăm sóc toàn diện
              </span>
            </div>
          </div>

          {/* Time */}
          <div className="flex gap-[12px] items-start w-full">
            <div className="pt-[2px] shrink-0">
              <CalendarClock size={18} className="text-[#434654]" />
            </div>
            <div className="flex flex-col w-full">
              <span className="font-['Inter'] font-normal text-[#434654] text-[12px] leading-[16px]">
                Thời gian dự kiến
              </span>
              <span className="font-['Inter'] font-medium text-[#181c1e] text-[14px] leading-[20px] mt-[2px]">
                09:00 - Thứ 3, 17/10/2023
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Box */}
        <div className="bg-[#ebeef1] rounded-[12px] w-full px-[16px] pt-[24px] pb-[16px] flex flex-col gap-[8px]">
          <div className="flex items-center justify-between w-full">
            <span className="font-['Inter'] font-normal text-[#434654] text-[16px] leading-[24px]">
              Tạm tính
            </span>
            <span className="font-['Inter'] font-medium text-[#181c1e] text-[14px] leading-[20px]">
              450.000đ
            </span>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="font-['Inter'] font-normal text-[#434654] text-[16px] leading-[24px]">
              Khuyến mãi
            </span>
            <span className="font-['Inter'] font-medium text-[#a33500] text-[14px] leading-[20px]">
              -0đ
            </span>
          </div>
          <div className="h-px w-full border-t border-solid border-[#c3c6d6] my-[4px]" />
          <div className="flex items-center justify-between w-full">
            <span className="font-['Inter'] font-semibold text-[#181c1e] text-[24px] leading-[32px]">
              Tổng cộng
            </span>
            <span className="font-['Inter'] font-bold text-[#003d9b] text-[24px] leading-[32px]">
              450.000đ
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-[12px] pt-[8px] w-full">
          <button className="bg-[#003d9b] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-[12px] px-[16px] py-[12px] w-full hover:bg-[#00317a] transition-colors">
            <span className="font-['Inter'] font-bold text-white text-[14px] leading-[20px]">
              Xác nhận đặt lịch
            </span>
          </button>
          <button className="bg-white border border-solid border-[#c3c6d6] rounded-[12px] px-[17px] py-[13px] w-full hover:bg-gray-50 transition-colors">
            <span className="font-['Inter'] font-medium text-[#181c1e] text-[14px] leading-[20px]">
              Hủy
            </span>
          </button>
        </div>

        {/* Terms */}
        <div className="w-full text-center mt-[8px]">
          <p className="font-['Inter'] font-normal text-[#434654] text-[12px] leading-[16px] m-0">
            Bằng việc xác nhận, bạn đồng ý với{' '}
            <a href="#" className="text-[#003d9b] underline hover:text-[#00317a]">
              Điều khoản dịch vụ
            </a>
            {' '}của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}
