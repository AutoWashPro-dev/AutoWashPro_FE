import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="bg-[#f7fafd] py-24 px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-gray-200 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 items-center">
        <div className="flex flex-col gap-8">
          <h1 className="text-5xl lg:text-6xl font-bold text-[#181c1e] tracking-tight leading-tight">
            Đặt lịch rửa xe <br />
            <span className="text-[#003d9b]">mọi lúc, mọi nơi</span>
          </h1>
          
          <p className="text-[#434654] text-lg max-w-lg">
            Nền tảng quản lý và đặt lịch chăm sóc xe chuyên nghiệp.
            Tiết kiệm thời gian chờ đợi, theo dõi tiến độ theo thời gian thực và nhận hàng ngàn ưu đãi.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/register" className="bg-[#003d9b] text-white font-medium px-8 py-3 rounded-lg shadow-[0_4px_10px_rgba(31,41,55,0.08)] hover:bg-[#002f7a] transition">
              Bắt đầu ngay
            </Link>
            <button className="bg-white text-[#181c1e] border border-[#737685] font-medium px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Xem hướng dẫn
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#c3c6d6] mt-4">
            <div>
              <div className="text-[#003d9b] text-2xl font-semibold">50+</div>
              <div className="text-[#434654] text-sm">Chi nhánh</div>
            </div>
            <div>
              <div className="text-[#003d9b] text-2xl font-semibold">10k+</div>
              <div className="text-[#434654] text-sm">Khách hàng</div>
            </div>
            <div>
              <div className="text-[#003d9b] text-2xl font-semibold">4.9/5</div>
              <div className="text-[#434654] text-sm">Đánh giá</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-tr from-blue-100 to-indigo-50 h-[500px] rounded-2xl shadow-xl relative overflow-hidden flex items-center justify-center">
           {/* Placeholder for Hero Visual */}
           <div className="text-[#003d9b] text-xl font-bold opacity-30">AutoWash Pro App View</div>
           
           {/* Floating glass element */}
           <div className="absolute bottom-6 left-6 w-[320px] backdrop-blur-md bg-white/90 border border-[#c3c6d6] p-4 rounded-xl shadow-lg flex items-center gap-4">
              <div className="bg-[#d6e0f3] w-12 h-12 rounded-full flex items-center justify-center text-[#003d9b]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <div className="text-[#181c1e] font-medium text-sm">Xe 30A-123.45 đã xong!</div>
                <div className="text-[#434654] text-xs">Sẵn sàng bàn giao</div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
