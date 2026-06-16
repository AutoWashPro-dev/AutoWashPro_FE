export default function ContactSection() {
  return (
    <section id="contact" className="bg-white py-24 relative w-full border-t border-[#c3c6d6]">
      <div className="max-w-7xl mx-auto px-8 flex flex-col gap-12">
        <div className="flex flex-col items-center text-center gap-4">
          <h2 className="text-[#181c1e] text-3xl md:text-4xl font-semibold tracking-tight">Sẵn sàng chăm sóc xế yêu?</h2>
          <p className="text-[#434654] text-lg max-w-2xl">
            Liên hệ với chúng tôi ngay hôm nay để nhận được sự tư vấn tốt nhất hoặc tải ứng dụng để đặt lịch tự động.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#f7fafd] rounded-2xl p-8 md:p-12 border border-[#c3c6d6]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#003d9b]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <h4 className="text-[#181c1e] font-semibold text-lg">Hotline 24/7</h4>
                <p className="text-[#434654]">1900 1234 - Miễn phí tư vấn</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#003d9b]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h4 className="text-[#181c1e] font-semibold text-lg">Email hỗ trợ</h4>
                <p className="text-[#434654]">support@autowashpro.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#003d9b]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <h4 className="text-[#181c1e] font-semibold text-lg">Địa chỉ trụ sở</h4>
                <p className="text-[#434654]">Tầng 15, Tòa nhà Pro, Hồ Chí Minh</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c3c6d6]">
            <h3 className="text-[#181c1e] text-xl font-semibold mb-4">Gửi tin nhắn</h3>
            <form className="flex flex-col gap-4">
              <input type="text" placeholder="Họ và tên" className="w-full border border-[#c3c6d6] rounded-lg px-4 py-3 focus:outline-none focus:border-[#003d9b] bg-white text-[#181c1e]" />
              <input type="text" placeholder="Số điện thoại" className="w-full border border-[#c3c6d6] rounded-lg px-4 py-3 focus:outline-none focus:border-[#003d9b] bg-white text-[#181c1e]" />
              <textarea placeholder="Bạn cần tư vấn thêm gì không?" rows="3" className="w-full border border-[#c3c6d6] rounded-lg px-4 py-3 focus:outline-none focus:border-[#003d9b] bg-white text-[#181c1e] resize-none"></textarea>
              <button className="bg-[#003d9b] text-white font-medium py-3 rounded-lg hover:bg-[#002f7a] transition shadow-sm w-full">
                Gửi yêu cầu
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
