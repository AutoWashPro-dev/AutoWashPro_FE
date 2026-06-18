import { Bell, Award, Activity, Calendar, Car, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <div className="flex-1 bg-[#f7fafd] p-8">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-8">

        {/* Welcome Header */}
        <div className="flex items-end justify-between w-full">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#181c1e] text-[40px] font-bold tracking-[-0.8px] leading-[56px]">
              Xin chào, Beo
            </h1>
            <p className="text-[#434654] text-lg leading-[28px]">
              Chào mừng bạn quay lại hệ thống. Chúc một ngày tốt lành!
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <button className="bg-white border border-gray-200 p-3 rounded-full relative hover:bg-gray-50 transition">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 border-2 border-white rounded-full"></span>
            </button>
            <div className="bg-white border border-gray-200 flex gap-3 items-center px-4 py-2.5 rounded-full">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-700 font-bold">
                A
              </div>
              <span className="text-[#181c1e] font-medium text-sm">Beo</span>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">

          {/* Loyalty Points Widget (Span 4) */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden shadow-[0px_4px_20px_0px_rgba(31,41,55,0.08)]">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#003d9b]/5 rounded-full blur-[20px]"></div>
            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col gap-1">
                <span className="text-[#434654] text-sm font-medium tracking-[0.7px] uppercase">
                  Hạng thành viên
                </span>
                <span className="text-[#003d9b] text-2xl font-bold">
                  Thành viên Vàng
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#a33500]/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#a33500]" />
              </div>
            </div>

            <div className="flex flex-col gap-2 z-10 pt-6">
              <div className="flex items-end gap-2">
                <span className="text-[#181c1e] text-[40px] font-bold leading-[40px]">2,450</span>
                <span className="text-[#434654] text-base pb-1">điểm</span>
              </div>
              <div className="w-full bg-[#ebeef1] h-2 rounded-full overflow-hidden">
                <div className="bg-[#003d9b] h-full w-[70%] rounded-full"></div>
              </div>
              <div className="text-right text-[#434654] text-xs">
                Còn 550 điểm để lên hạng Platinum
              </div>
            </div>
          </div>

          {/* Queue Tracking Widget (Span 8) */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between min-h-[220px] shadow-[0px_4px_10px_rgba(31,41,55,0.08)]">
            <div className="flex justify-between items-center pb-4 border-b border-[rgba(195,198,214,0.2)]">
              <div className="flex gap-2 items-center">
                <Activity className="w-6 h-6 text-[#181c1e]" />
                <h3 className="text-[#181c1e] text-2xl font-semibold">Theo dõi dịch vụ hiện tại</h3>
              </div>
              <div className="bg-[#eef1f4] px-3 py-1 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 bg-[#003d9b] rounded-full"></span>
                <span className="text-[#003d9b] text-sm font-medium">Đang xử lý</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center pt-4">
              <div className="flex-1 flex flex-col gap-6 w-full">
                <div className="flex justify-between items-center">
                  <div className="text-[#434654] text-sm font-medium">
                    Xe: <span className="text-[#181c1e] font-mono font-bold ml-1">51A-123.45</span>
                  </div>
                  <div className="text-[#434654] text-sm font-medium">
                    Dịch vụ: <span className="text-[#181c1e] font-bold ml-1">Rửa xe chi tiết</span>
                  </div>
                </div>

                {/* Stepper */}
                <div className="relative flex justify-between h-14">
                  <div className="absolute top-4 left-0 right-0 h-1 bg-[#ebeef1] -z-10 rounded-full"></div>
                  <div className="absolute top-4 left-0 right-1/2 h-1 bg-[#003d9b] -z-10 rounded-full"></div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#003d9b] flex items-center justify-center text-white ring-4 ring-white shadow-[0px_0px_0px_4px_white]">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-[#181c1e] text-xs">Tiếp nhận</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#003d9b] flex items-center justify-center ring-4 ring-white shadow-[0px_0px_0px_4px_white]">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-[#181c1e] text-xs">Đang rửa</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#ebeef1] flex items-center justify-center ring-4 ring-white shadow-[0px_0px_0px_4px_white]">
                    </div>
                    <span className="text-[#434654] text-xs">Làm khô</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#ebeef1] flex items-center justify-center ring-4 ring-white shadow-[0px_0px_0px_4px_white]">
                    </div>
                    <span className="text-[#434654] text-xs">Hoàn thành</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#f1f4f7] border border-[rgba(195,198,214,0.2)] rounded-lg p-4 flex flex-col items-center gap-1 min-w-[120px] shrink-0">
                <span className="text-[#434654] text-xs uppercase tracking-[0.3px] text-center">Thời gian dự kiến</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[#003d9b] text-[32px] font-bold leading-none">15</span>
                  <span className="text-[#434654] text-lg font-normal">p</span>
                </div>
                <span className="text-[#434654] text-xs text-center">Sắp xong</span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Span 6) */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
            <h3 className="text-[#181c1e] text-2xl font-semibold">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <button className="bg-white border border-[#e5e7eb] rounded-xl flex flex-col items-center justify-center gap-3 p-6 hover:shadow-md transition group min-h-[140px]">
                <div className="w-14 h-14 rounded-full bg-[#0052cc] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-[#181c1e] font-semibold text-sm">Đặt lịch mới</span>
              </button>
              <button className="bg-white border border-[#e5e7eb] rounded-xl flex flex-col items-center justify-center gap-3 p-6 hover:shadow-md transition group min-h-[140px]">
                <div className="w-14 h-14 rounded-full bg-[#d6e0f3] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Car className="w-6 h-6 text-[#181c1e]" />
                </div>
                <span className="text-[#181c1e] font-semibold text-sm">Quản lý xe</span>
              </button>
            </div>
          </div>

          {/* Recent Activity (Span 6) */}
          <div className="col-span-12 lg:col-span-6 bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_4px_10px_rgba(31,41,55,0.08)] flex flex-col">
            <div className="p-6 pb-6 border-b border-[rgba(195,198,214,0.2)] flex justify-between items-center">
              <h3 className="text-[#181c1e] text-[20px] font-semibold">Lịch sử gần đây</h3>
              <Link to="/history" className="text-[#003d9b] text-sm font-medium hover:underline">Xem tất cả</Link>
            </div>
            <div className="overflow-y-auto max-h-[300px]">
              {[
                { plate: '51A-123.45', date: '10/05/2024', service: 'Rửa xe cao cấp + Phủ Nano', status: 'Hoàn thành' },
                { plate: '29C-987.65', date: '02/05/2024', service: 'Bảo dưỡng định kỳ', status: 'Hoàn thành' },
                { plate: '51A-123.45', date: '20/04/2024', service: 'Rửa xe tiêu chuẩn', status: 'Hoàn thành' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 border-b border-[rgba(195,198,214,0.1)] flex items-center gap-4 hover:bg-gray-50 transition">
                  <div className="w-12 h-12 rounded-lg bg-[#ebeef1] flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="text-[#181c1e] text-sm font-bold truncate">{item.plate}</span>
                      <span className="text-[#434654] text-xs">{item.date}</span>
                    </div>
                    <span className="text-[#434654] text-sm truncate">{item.service}</span>
                  </div>
                  <div className="bg-[#d1fae5] text-[#065f46] text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Notification Widget */}
        <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-[0px_4px_10px_rgba(31,41,55,0.08)] flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#181c1e]" />
            <h3 className="text-[#181c1e] text-[20px] font-semibold">Thông báo mới</h3>
          </div>

          <div className="bg-[rgba(0,61,155,0.05)] border border-[rgba(0,61,155,0.1)] rounded-lg p-4 flex gap-4">
            <div className="w-2 h-2 rounded-full bg-[#003d9b] mt-2 shrink-0"></div>
            <div className="flex flex-col gap-2">
              <p className="text-[#181c1e] text-sm font-semibold">Khuyến mãi đặc biệt tuần lễ vàng!</p>
              <p className="text-[#434654] text-sm leading-[20px]">Giảm ngay 20% cho các dịch vụ rửa xe cao cấp từ 15/06 đến 22/06. Nhanh tay đặt lịch ngay hôm nay.</p>
              <span className="text-[#848a9c] text-xs mt-1">2 giờ trước</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}