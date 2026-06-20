import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  BarChart,
  Settings,
  HelpCircle,
  LogOut,
  CalendarPlus,
  Car,
  Diamond,
  Percent,
  Gift,
  Check,
  X,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../../components/common/Logo';

export default function LoyaltyPage() {
  return (
    <div className="flex-1 bg-[#f7fafd] p-8 min-h-screen">
      {/* Main Content */}
      <div className="flex flex-col gap-[24px] items-start max-w-[1440px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col items-start pb-[16px] w-full">
          <div className="flex items-end w-full">
            <div className="flex flex-col gap-[4px] items-start w-full">
              <h1 className="font-semibold text-[#181c1e] text-[32px] tracking-[-0.32px] leading-[40px]">
                Thành viên & Thân thiết
              </h1>
              <p className="font-normal text-[#555f6f] text-[16px] leading-[24px]">
                Quản lý hạng thẻ và điểm thưởng của bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Top Section: Card & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px] w-full">
          {/* Platinum Card */}
          <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-[12px] flex flex-col justify-between p-[24px] relative overflow-hidden shadow-md h-[224px]">
            <div className="absolute bg-white blur-[20px] opacity-5 -right-[40px] rounded-full size-[160px] -top-[40px]" />
            <div className="absolute bg-white blur-[20px] -bottom-[40px] -left-[40px] opacity-5 rounded-full size-[160px]" />
            
            <div className="flex items-start justify-between relative z-10 w-full">
              <div className="flex flex-col gap-[6.5px]">
                <p className="font-normal text-[#d1d5db] text-[12px] tracking-[1.2px] uppercase leading-[16px]">
                  AUTOWASH PRO
                </p>
                <h3 className="font-semibold text-white text-[24px] leading-[32px]">
                  Platinum
                </h3>
              </div>
              <Diamond className="text-white opacity-80" size={28} />
            </div>
            
            <div className="flex flex-col gap-[4px] relative z-10 w-full">
              <p className="font-normal text-[#d1d5db] text-[12px] leading-[16px]">Điểm hiện tại</p>
              <p className="font-bold text-white text-[48px] tracking-[-0.96px] leading-[48px]">2,450</p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          <div className="bg-white border border-[#e5e7eb] rounded-[12px] flex flex-col justify-center p-[25px] lg:col-span-2 shadow-sm w-full min-h-[224px]">
            <div className="flex flex-col pb-[16px] w-full">
              <div className="flex items-end justify-between w-full flex-wrap gap-4">
                <div className="flex flex-col gap-[4px] flex-1 min-w-[200px]">
                  <h3 className="font-semibold text-[#181c1e] text-[24px] leading-[32px]">Tiến trình duy trì hạng</h3>
                  <p className="font-normal text-[#555f6f] text-[16px] leading-[24px]">
                    Bạn cần 550 điểm nữa để duy trì hạng Platinum năm sau.
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-[#003d9b] text-[24px] leading-[32px]">2,450 </span>
                  <span className="font-normal text-[#555f6f] text-[16px] leading-[24px]">/ 3,000 pt</span>
                </div>
              </div>
            </div>
            <div className="pb-[8px] w-full pt-4">
              <div className="bg-[#e5e8eb] h-[16px] rounded-full overflow-hidden w-full relative">
                <div className="absolute bg-[#003d9b] h-[16px] left-0 rounded-full top-0" style={{ width: '81.6%' }} />
              </div>
            </div>
            <div className="flex items-start justify-between w-full pt-[8px]">
              <p className="font-normal text-[#555f6f] text-[12px] leading-[16px]">Ngày xét hạng: 31/12/2024</p>
              <p className="font-normal text-[#555f6f] text-[12px] leading-[16px]">550 pt còn lại</p>
            </div>
          </div>
        </div>

        {/* Middle Section: Benefits & Vouchers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px] w-full">
          {/* Vouchers (Kho ưu đãi) */}
          <div className="bg-white border border-[#e5e7eb] rounded-[12px] flex flex-col gap-[24px] p-[25px] shadow-sm w-full lg:col-span-1">
            <div className="flex items-center justify-between w-full">
              <h3 className="font-semibold text-[#181c1e] text-[24px] leading-[32px]">Kho ưu đãi</h3>
              <a href="#" className="font-medium text-[#003d9b] text-[14px] leading-[20px] hover:underline">Xem tất cả</a>
            </div>
            
            <div className="flex flex-col gap-[16px] w-full">
              <div className="bg-[#f7fafd] border border-[#c3c6d6] rounded-[8px] flex gap-[16px] items-center p-[17px] w-full transition-transform hover:scale-[1.02] cursor-pointer">
                <div className="bg-[#0052cc] rounded-full size-[48px] flex items-center justify-center shrink-0 shadow-sm">
                  <Percent className="text-white" size={20} />
                </div>
                <div className="flex flex-col w-full">
                  <h4 className="font-bold text-[#181c1e] text-[14px] leading-[20px]">Giảm 20% gói Detail</h4>
                  <p className="font-normal text-[#555f6f] text-[12px] leading-[16px]">HSD: 30/11/2024</p>
                </div>
              </div>
              
              <div className="bg-[#f7fafd] border border-[#c3c6d6] rounded-[8px] flex gap-[16px] items-center p-[17px] w-full transition-transform hover:scale-[1.02] cursor-pointer">
                <div className="bg-[#a33500] rounded-full size-[48px] flex items-center justify-center shrink-0 shadow-sm">
                  <Gift className="text-white" size={20} />
                </div>
                <div className="flex flex-col w-full">
                  <h4 className="font-bold text-[#181c1e] text-[14px] leading-[20px]">Miễn phí hút bụi</h4>
                  <p className="font-normal text-[#555f6f] text-[12px] leading-[16px]">HSD: 15/12/2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Table */}
          <div className="bg-white border border-[#e5e7eb] rounded-[12px] flex flex-col p-[25px] shadow-sm w-full lg:col-span-2 overflow-x-auto">
            <div className="pb-[24px] w-full">
              <h3 className="font-semibold text-[#181c1e] text-[24px] leading-[32px]">Lợi ích hội viên</h3>
            </div>
            
            <div className="min-w-[600px] w-full border border-[#e5e8eb] rounded-[8px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#e5e8eb]">
                    <th className="py-[12px] px-[16px] font-medium text-[#555f6f] text-[14px] w-[30%]">Quyền lợi</th>
                    <th className="py-[12px] px-[16px] font-medium text-[#555f6f] text-[14px] text-center w-[15%]">Member</th>
                    <th className="py-[12px] px-[16px] font-medium text-[#555f6f] text-[14px] text-center w-[15%]">Silver</th>
                    <th className="py-[12px] px-[16px] font-medium text-[#555f6f] text-[14px] text-center w-[15%]">Gold</th>
                    <th className="py-[12px] px-[16px] font-bold text-[#003d9b] text-[14px] text-center bg-[#dae2ff] w-[25%] rounded-tl-lg rounded-tr-lg border-b-2 border-[#0052cc]">Platinum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#e5e8eb]">
                    <td className="py-[16px] px-[16px] font-medium text-[#181c1e] text-[16px]">Tích lũy điểm</td>
                    <td className="py-[16px] px-[16px] font-normal text-[#181c1e] text-[16px] text-center">1x</td>
                    <td className="py-[16px] px-[16px] font-normal text-[#181c1e] text-[16px] text-center">1.2x</td>
                    <td className="py-[16px] px-[16px] font-normal text-[#181c1e] text-[16px] text-center">1.5x</td>
                    <td className="py-[16px] px-[16px] font-bold text-[#181c1e] text-[16px] text-center bg-[#dae2ff]/50">2x</td>
                  </tr>
                  <tr className="border-b border-[#e5e8eb]">
                    <td className="py-[16px] px-[16px] font-medium text-[#181c1e] text-[16px]">Giảm giá dịch vụ</td>
                    <td className="py-[16px] px-[16px] font-normal text-[#181c1e] text-[16px] text-center">-</td>
                    <td className="py-[16px] px-[16px] font-normal text-[#181c1e] text-[16px] text-center">5%</td>
                    <td className="py-[16px] px-[16px] font-normal text-[#181c1e] text-[16px] text-center">10%</td>
                    <td className="py-[16px] px-[16px] font-bold text-[#181c1e] text-[16px] text-center bg-[#dae2ff]/50">15%</td>
                  </tr>
                  <tr className="border-b border-[#e5e8eb]">
                    <td className="py-[16px] px-[16px] font-medium text-[#181c1e] text-[16px]">Ưu tiên đặt lịch</td>
                    <td className="py-[16px] px-[16px] text-center text-gray-400 flex justify-center"><X size={20} /></td>
                    <td className="py-[16px] px-[16px] text-center text-gray-400"><div className="flex justify-center"><X size={20} /></div></td>
                    <td className="py-[16px] px-[16px] text-center text-[#0052cc]"><div className="flex justify-center"><Check size={20} /></div></td>
                    <td className="py-[16px] px-[16px] text-center text-[#0052cc] bg-[#dae2ff]/50"><div className="flex justify-center"><Check size={20} /></div></td>
                  </tr>
                  <tr>
                    <td className="py-[16px] px-[16px] font-medium text-[#181c1e] text-[16px]">Phòng chờ VIP</td>
                    <td className="py-[16px] px-[16px] text-center text-gray-400"><div className="flex justify-center"><X size={20} /></div></td>
                    <td className="py-[16px] px-[16px] text-center text-gray-400"><div className="flex justify-center"><X size={20} /></div></td>
                    <td className="py-[16px] px-[16px] text-center text-gray-400"><div className="flex justify-center"><X size={20} /></div></td>
                    <td className="py-[16px] px-[16px] text-center text-[#0052cc] bg-[#dae2ff]/50"><div className="flex justify-center"><Check size={20} /></div></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Section: Transaction History */}
        <div className="bg-white border border-[#e5e7eb] rounded-[12px] flex flex-col gap-[24px] p-[25px] shadow-sm w-full">
          <div className="flex items-center justify-between w-full">
            <h3 className="font-semibold text-[#181c1e] text-[24px] leading-[32px]">Lịch sử điểm</h3>
            <button className="flex gap-[6px] items-center text-[#003d9b] hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors">
              <Download size={16} />
              <span className="font-medium text-[14px] leading-[20px]">Tải PDF</span>
            </button>
          </div>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-[#e5e8eb]">
                  <th className="py-[12px] px-[16px] font-medium text-[#555f6f] text-[14px]">Ngày</th>
                  <th className="py-[12px] px-[16px] font-medium text-[#555f6f] text-[14px]">Nội dung</th>
                  <th className="py-[12px] px-[16px] font-medium text-[#555f6f] text-[14px] text-right">Số điểm</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#e5e8eb] hover:bg-gray-50 transition-colors">
                  <td className="py-[16px] px-[16px] font-normal text-[#555f6f] text-[16px]">24/10/2024</td>
                  <td className="py-[16px] px-[16px] font-medium text-[#181c1e] text-[16px]">Rửa xe chi tiết (Detailing)</td>
                  <td className="py-[16px] px-[16px] font-bold text-[#16a34a] text-[16px] text-right">+150 pt</td>
                </tr>
                <tr className="border-b border-[#e5e8eb] hover:bg-gray-50 transition-colors">
                  <td className="py-[16px] px-[16px] font-normal text-[#555f6f] text-[16px]">15/10/2024</td>
                  <td className="py-[16px] px-[16px] font-medium text-[#181c1e] text-[16px]">Đổi Voucher Hút Bụi</td>
                  <td className="py-[16px] px-[16px] font-bold text-[#dc2626] text-[16px] text-right">-50 pt</td>
                </tr>
                <tr className="border-b border-[#e5e8eb] hover:bg-gray-50 transition-colors">
                  <td className="py-[16px] px-[16px] font-normal text-[#555f6f] text-[16px]">02/10/2024</td>
                  <td className="py-[16px] px-[16px] font-medium text-[#181c1e] text-[16px]">Phủ Ceramic tiêu chuẩn</td>
                  <td className="py-[16px] px-[16px] font-bold text-[#16a34a] text-[16px] text-right">+450 pt</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-[16px] px-[16px] font-normal text-[#555f6f] text-[16px]">28/09/2024</td>
                  <td className="py-[16px] px-[16px] font-medium text-[#181c1e] text-[16px]">Rửa xe VIP</td>
                  <td className="py-[16px] px-[16px] font-bold text-[#16a34a] text-[16px] text-right">+80 pt</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
