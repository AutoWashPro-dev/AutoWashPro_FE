export default function PricingSection() {
  return (
    <section id="pricing" className="bg-[#f7fafd] py-24 relative w-full">
      <div className="max-w-7xl mx-auto px-8 flex flex-col gap-16">
        <div className="flex flex-col items-center text-center gap-4">
          <h2 className="text-[#181c1e] text-3xl md:text-4xl font-semibold tracking-tight">Gói dịch vụ đa dạng</h2>
          <p className="text-[#434654] text-lg max-w-2xl">
            Lựa chọn gói chăm sóc phù hợp với nhu cầu và tình trạng xe của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Basic Package */}
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-8 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1">
            <div>
              <h3 className="text-[#181c1e] text-2xl font-semibold mb-6">Rửa tiêu chuẩn</h3>
              <div className="flex items-baseline mb-8">
                <span className="text-[#003d9b] text-5xl font-bold">150k</span>
                <span className="text-[#434654] text-lg ml-2">/lần</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#003d9b]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span className="text-[#181c1e]">Rửa bọt tuyết ngoài xe</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#003d9b]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span className="text-[#181c1e]">Hút bụi cabin cơ bản</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#003d9b]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span className="text-[#181c1e]">Lau kính trong ngoài</span>
                </li>
              </ul>
            </div>
            <button className="w-full border border-[#737685] text-[#181c1e] font-medium py-3 rounded-lg hover:bg-gray-50 transition">
              Chọn gói này
            </button>
          </div>

          {/* Pro Package (Highlighted) */}
          <div className="bg-[#0052cc] rounded-xl p-8 flex flex-col justify-between shadow-xl transition-all hover:-translate-y-1 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-[#0052cc] font-bold text-xs uppercase px-4 py-1 rounded-full shadow-sm">
              Phổ biến nhất
            </div>
            <div>
              <h3 className="text-white text-2xl font-semibold mb-6">Chăm sóc toàn diện</h3>
              <div className="flex items-baseline mb-8">
                <span className="text-white text-5xl font-bold">350k</span>
                <span className="text-blue-200 text-lg ml-2">/lần</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span className="text-white">Mọi dịch vụ Gói tiêu chuẩn</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span className="text-white">Dọn nội thất chi tiết</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span className="text-white">Khử mùi Ozone</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span className="text-white">Dưỡng nhựa, lốp xe</span>
                </li>
              </ul>
            </div>
            <button className="w-full bg-white text-[#0052cc] font-medium py-3 rounded-lg hover:bg-gray-100 transition shadow-sm">
              Chọn gói này
            </button>
          </div>

          {/* Premium Package */}
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-8 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1">
            <div>
              <h3 className="text-[#181c1e] text-2xl font-semibold mb-6">Detailing Cao Cấp</h3>
              <div className="flex items-baseline mb-8">
                <span className="text-[#003d9b] text-5xl font-bold">850k</span>
                <span className="text-[#434654] text-lg ml-2">/lần</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#003d9b]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span className="text-[#181c1e]">Mọi dịch vụ Gói toàn diện</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#003d9b]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span className="text-[#181c1e]">Tẩy ố kính, nhựa đường</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#003d9b]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span className="text-[#181c1e]">Bảo dưỡng khoang máy</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#003d9b]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span className="text-[#181c1e]">Phủ Ceramic tiêu chuẩn</span>
                </li>
              </ul>
            </div>
            <button className="w-full border border-[#737685] text-[#181c1e] font-medium py-3 rounded-lg hover:bg-gray-50 transition">
              Chọn gói này
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
