export default function ServiceSection() {
  return (
    <section id="services" className="bg-white py-24 relative w-full">
      <div className="max-w-7xl mx-auto px-8 flex flex-col gap-16">
        <div className="flex flex-col items-center text-center gap-4">
          <h2 className="text-[#181c1e] text-3xl md:text-4xl font-semibold tracking-tight">Trải nghiệm dịch vụ đỉnh cao</h2>
          <p className="text-[#434654] text-lg max-w-2xl">
            Hệ thống của chúng tôi được thiết kế để mang lại sự tiện lợi tối đa và chất lượng vượt trội cho chiếc xe của bạn.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          
          {/* Feature 1 - Large Span */}
          <div className="bg-[#f1f4f7] border border-[#c3c6d6] rounded-xl p-8 flex flex-col justify-between col-span-1 md:col-span-2 relative overflow-hidden transition-all hover:shadow-lg">
            <div className="flex flex-col gap-4 relative z-10">
              <div className="w-12 h-12 bg-[#0052cc] rounded-lg flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <div>
                <h3 className="text-[#181c1e] text-2xl font-semibold mb-2">Đặt lịch trực tuyến</h3>
                <p className="text-[#434654] text-base max-w-md">
                  Chọn khung giờ, chi nhánh và dịch vụ mong muốn chỉ với vài thao tác. Hệ thống tự động phân bổ nguồn lực để đảm bảo bạn không phải chờ đợi.
                </p>
              </div>
            </div>
            <div className="flex gap-2 relative z-10 mt-4">
              <span className="bg-[#e0e3e6] text-[#181c1e] text-xs px-3 py-1 rounded-full">Nhanh chóng</span>
              <span className="bg-[#e0e3e6] text-[#181c1e] text-xs px-3 py-1 rounded-full">Tiện lợi</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#f1f4f7] border border-[#c3c6d6] rounded-xl p-8 flex flex-col transition-all hover:shadow-lg">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 bg-[#a33500] rounded-lg flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <h3 className="text-[#181c1e] text-xl font-semibold mb-2">Theo dõi thời gian thực</h3>
                <p className="text-[#434654] text-base">
                  Cập nhật từng bước quá trình chăm sóc xe qua ứng dụng.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#f1f4f7] border border-[#c3c6d6] rounded-xl p-8 flex flex-col transition-all hover:shadow-lg">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 bg-[#d6e0f3] rounded-lg flex items-center justify-center text-[#003d9b]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              </div>
              <div>
                <h3 className="text-[#181c1e] text-xl font-semibold mb-2">Thanh toán nhanh</h3>
                <p className="text-[#434654] text-base">
                  Hỗ trợ đa dạng phương thức: thẻ tín dụng, ví điện tử, chuyển khoản.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 4 - Large Span */}
          <div className="bg-[#f1f4f7] border border-[#c3c6d6] rounded-xl p-8 flex flex-col col-span-1 md:col-span-2 relative overflow-hidden transition-all hover:shadow-lg">
            <div className="absolute w-48 h-48 bg-[#e0e3e6] rounded-full opacity-50 -bottom-10 -right-10"></div>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="w-12 h-12 bg-[#ffdad6] rounded-lg flex items-center justify-center text-[#a33500]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <h3 className="text-[#181c1e] text-2xl font-semibold mb-2">Phần thưởng thân thiết</h3>
                <p className="text-[#434654] text-base max-w-lg">
                  Tích điểm sau mỗi lần sử dụng dịch vụ. Đổi điểm lấy voucher giảm giá, dịch vụ miễn phí hoặc quà tặng độc quyền từ hệ thống.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
