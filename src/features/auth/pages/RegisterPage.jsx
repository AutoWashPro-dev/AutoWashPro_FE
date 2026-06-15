import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import { Gauge, FileText } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#f7fafd] to-white">
      <div className="bg-white border border-[#e0e3e6] flex flex-col lg:flex-row w-full max-w-[1024px] rounded-2xl shadow-[0px_4px_20px_0px_rgba(31,41,55,0.08)] overflow-hidden">
        
        {/* Left Side: Branding/Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#f1f4f7] relative flex-col justify-between p-12 overflow-hidden">
          {/* Abstract Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0052cc]/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-4">
            <h1 className="text-[#003d9b] text-3xl font-semibold tracking-tight">AutoWash Pro</h1>
            <p className="text-[#434654] text-lg max-w-sm">
              Nền tảng quản lý dịch vụ chăm sóc xe chuyên nghiệp, giúp bạn tối ưu hóa hoạt động và nâng cao trải nghiệm khách hàng.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-6 mt-12 mb-24">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0052cc] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Gauge className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[#181c1e] text-sm font-medium">Tối ưu hiệu suất</h3>
                <p className="text-[#434654] text-xs mt-1">Quản lý lịch trình thông minh</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#d6e0f3] flex items-center justify-center text-[#0052cc] shrink-0 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[#181c1e] text-sm font-medium">Báo cáo chi tiết</h3>
                <p className="text-[#434654] text-xs mt-1">Theo dõi doanh thu theo thời gian thực</p>
              </div>
            </div>
          </div>
          
          {/* Decorative Shape */}
          <div className="absolute bottom-0 right-0 w-4/5 h-[45%] bg-gradient-to-tl from-[#003d9b]/10 to-transparent rounded-tl-[100px] pointer-events-none" />
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white relative z-10">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#181c1e] mb-2">Tạo tài khoản</h2>
            <p className="text-[#434654]">Vui lòng điền thông tin để bắt đầu sử dụng.</p>
          </div>

          <RegisterForm />

          <div className="mt-8 text-center text-[#434654]">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-[#003d9b] font-medium hover:underline">
              Đăng nhập
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}