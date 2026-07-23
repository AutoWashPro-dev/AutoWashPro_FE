import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Crown, 
  Check, 
  ChevronRight, 
  Calendar, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef(null);
  const heroVideoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const toggleHeroVideo = () => {
    if (heroVideoRef.current) {
      if (heroVideoRef.current.paused) {
        heroVideoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        heroVideoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const scrollToSection = (e, targetId) => {
    if (e) e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // Before/After Slider drag logic
  const handleMove = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const brands = [
    'Honda',
    'Yamaha',
    'Kawasaki',
    'Ducati',
    'BMW Motorrad',
    'Harley-Davidson',
    'Vespa',
    'Suzuki',
    'Triumph'
  ];

  const benefits = {
    member: [
      'Tích 1 điểm / 10.000đ chi tiêu (x1)',
      'Đặt lịch trước tối đa 7 ngày',
      'Nhận ngay voucher rửa xe máy bằng điểm tích lũy'
    ],
    silver: [
      'Tích 1.2 điểm / 10.000đ chi tiêu (x1.2)',
      'Đặt lịch trước tối đa 10 ngày',
      'Nhận ngay voucher rửa xe máy bằng điểm tích lũy',
      'Nhận voucher độc quyền của hạng Silver'
    ],
    gold: [
      'Tích 1.5 điểm / 10.000đ chi tiêu (x1.5)',
      'Đặt lịch trước tối đa 12 ngày',
      'Nhận ngay voucher rửa xe máy bằng điểm tích lũy',
      'Nhận voucher độc quyền của hạng Gold',
      'Hỗ trợ ưu tiên 24/7'
    ],
    platinum: [
      'Tích 2 điểm / 10.000đ chi tiêu (x2)',
      'Đặt lịch trước tối đa 14 ngày',
      'Nhận ngay voucher rửa xe máy bằng điểm tích lũy',
      'Nhận voucher độc quyền của hạng Platinum',
      'Hỗ trợ ưu tiên 24/7'
    ]
  };

  return (
    <div className="h-screen bg-[#f7fafd] overflow-y-auto font-sans text-slate-800">
      
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#f7fafd]/90 backdrop-blur-md border-b border-indigo-50/50 px-4 lg:px-8 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="#" onClick={(e) => scrollToSection(e, 'hero')} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-900 to-indigo-950 bg-clip-text text-transparent tracking-wider">
              Novawash
            </span>
          </a>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#booking-steps" onClick={(e) => scrollToSection(e, 'booking-steps')} className="hover:text-blue-600 transition-colors duration-200">Đặt lịch</a>
            <a href="#membership" onClick={(e) => scrollToSection(e, 'membership')} className="hover:text-blue-600 transition-colors duration-200">Hạng thành viên</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="hover:text-blue-600 transition-colors duration-200">Liên hệ</a>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="text-sm font-bold text-slate-700 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-slate-100/50 transition-all duration-200"
            >
              Đăng nhập
            </button>
            <button 
              onClick={() => navigate('/register')} 
              className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-full shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all duration-200"
            >
              Đăng ký
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#f7fafd]/95 backdrop-blur-md border-b border-indigo-50/50 py-6 px-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
            <a 
              href="#booking-steps" 
              onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, 'booking-steps'); }}
              className="text-base font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Đặt lịch
            </a>
            <a 
              href="#membership" 
              onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, 'membership'); }}
              className="text-base font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Hạng thành viên
            </a>
            <a 
              href="#contact" 
              onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, 'contact'); }}
              className="text-base font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Liên hệ
            </a>
            <hr className="border-slate-200 my-2" />
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} 
                className="w-full text-center py-2.5 font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Đăng nhập
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/register'); }} 
                className="w-full text-center py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-md transition-colors"
              >
                Đăng ký
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6 max-w-xl mx-auto lg:mx-0">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] leading-[1.15] font-black text-slate-900 tracking-tight">
              Xe máy sạch từng góc nhỏ <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Chỉ mất vài phút.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
              Dịch vụ rửa xe máy chuyên nghiệp tiêu chuẩn cao cấp. Đặt lịch nhanh, nhận xe đúng giờ, bảo đảm chất lượng.
            </p>
            <button 
              onClick={(e) => scrollToSection(e, 'booking-steps')}
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300"
            >
              Đặt lịch ngay
            </button>
          </div>

          {/* Right Media Column */}
          <div className="lg:col-span-6 flex justify-center relative w-full">
            {/* Background decorative glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20 blur-3xl rounded-full"></div>
            <div className="relative w-full max-w-lg aspect-[16/10] rounded-[24px] overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/80 bg-slate-900 group">
              <video 
                ref={heroVideoRef}
                autoPlay 
                loop 
                muted 
                playsInline
                poster="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1000&q=80"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out cursor-pointer"
                onClick={toggleHeroVideo}
              >
                <source src="https://assets.mixkit.co/videos/preview/mixkit-man-polishing-a-car-42289-large.mp4" type="video/mp4" />
                <source src="https://cdn.coverr.co/videos/coverr-car-wash-in-action-5259/1080p.mp4" type="video/mp4" />
              </video>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none"></div>

              {/* Play / Pause Toggle Badge */}
              <button 
                onClick={toggleHeroVideo}
                className="absolute bottom-6 right-6 w-12 h-12 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 z-10"
                title={isVideoPlaying ? "Tạm dừng video" : "Phát video"}
              >
                {isVideoPlaying ? (
                  <Pause className="w-5 h-5 text-blue-600" />
                ) : (
                  <Play className="w-5 h-5 text-blue-600 ml-0.5 fill-blue-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Trust Ticker (Smooth Right-to-Left Marquee) */}
      <section className="border-y border-indigo-50/50 py-8 bg-white/40 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center mb-6">
          <p className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
            Trusted by owners of
          </p>
        </div>

        {/* Infinite Moving Marquee Container */}
        <div className="relative w-full overflow-hidden flex select-none">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f7fafd] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f7fafd] to-transparent z-10 pointer-events-none"></div>

          <div className="flex shrink-0 items-center justify-around gap-16 min-w-full animate-marquee opacity-30">
            {brands.concat(brands).concat(brands).map((brand, i) => (
              <span 
                key={i} 
                className="text-xl sm:text-2xl font-bold italic tracking-wider text-slate-500 hover:text-blue-600 transition-colors duration-200 cursor-default whitespace-nowrap"
              >
                {brand}
              </span>
            ))}
          </div>
          <div className="flex shrink-0 items-center justify-around gap-16 min-w-full animate-marquee opacity-30" aria-hidden="true">
            {brands.concat(brands).concat(brands).map((brand, i) => (
              <span 
                key={`dup-${i}`} 
                className="text-xl sm:text-2xl font-bold italic tracking-wider text-slate-500 hover:text-blue-600 transition-colors duration-200 cursor-default whitespace-nowrap"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About WAVE Section ("Câu chuyện WAVE") */}
      <section className="py-20 lg:py-32 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          
          {/* Images Grid (Left Column) */}
          <div className="lg:col-span-6 relative flex justify-center w-full">
            {/* Primary Large Image */}
            <div className="relative w-[85%] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white bg-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1000&q=80" 
                alt="Washing luxury car in detail bay"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80";
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/10"></div>
            </div>

            {/* Overlapping Secondary Image */}
            <div className="absolute bottom-[-40px] right-[5%] w-[45%] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#f7fafd] hidden sm:block bg-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80" 
                alt="Professional detailer staff"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80";
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Badge */}
            <div className="absolute top-8 left-[5%] bg-white/95 backdrop-blur-md py-3 px-5 rounded-2xl shadow-xl flex items-center gap-3 border border-indigo-50/50 hover:scale-105 transition-transform duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black">
                98%
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Khách hàng</p>
                <p className="text-sm text-slate-800 font-extrabold leading-tight">Hài lòng tuyệt đối</p>
              </div>
            </div>
          </div>

          {/* Text and Stats (Right Column) */}
          <div className="lg:col-span-6 flex flex-col space-y-8 text-left max-w-xl mx-auto lg:mx-0">
            <div className="space-y-3">
              <p className="text-xs font-black tracking-widest text-blue-600 uppercase">Về chúng tôi</p>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black leading-tight text-slate-900">
                Câu chuyện <span className="text-blue-600">Novawash</span>
              </h2>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">
                Rửa xe máy chuyên nghiệp – tiêu chuẩn quốc tế
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Novawash là nền tảng đặt lịch rửa xe máy thông minh, kết hợp công nghệ hiện đại và đội ngũ kỹ thuật viên được đào tạo bài bản. Chúng tôi cam kết mang lại dịch vụ chăm sóc xe chất lượng cao nhất với chi phí hợp lý nhất.
              </p>
            </div>

            {/* Checklist */}
            <ul className="grid sm:grid-cols-2 gap-3 text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Máy rửa xe máy chuyên nghiệp nhập khẩu</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Hóa chất sinh học, an toàn sơn xe máy</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Đội ngũ kỹ thuật viên được chứng nhận</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Cam kết hài lòng 100% hoặc hoàn tiền</span>
              </li>
            </ul>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-200/60">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-blue-600">5,000+</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Lượt rửa xe máy</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-blue-600">98%</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Hài lòng</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-blue-600">3 năm</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Kinh nghiệm</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-blue-600">24/7</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Hỗ trợ</p>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={(e) => scrollToSection(e, 'booking-steps')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg active:scale-95 transition-all duration-300"
              >
                Xem dịch vụ
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Special Membership Promo Banner */}
      <section className="px-4 lg:px-8 max-w-7xl mx-auto mb-24">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50/50 border border-blue-100/50 p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-900/5">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-400 opacity-10 blur-3xl rounded-full -mr-20 -mt-20"></div>
          <div className="flex flex-col space-y-4 max-w-xl text-left relative z-10">
            <p className="text-xs font-black tracking-widest text-blue-600 uppercase">Chương trình thành viên đặc biệt</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Tích điểm mỗi lần rửa, lên hạng ngay!
            </h3>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
              Hạng càng cao, mức giảm giờ vàng và cửa sổ đặt lịch càng lớn. Cứ 10 lượt rửa hợp lệ nhận thêm một voucher rửa miễn phí.
            </p>
          </div>
          <button 
            onClick={(e) => scrollToSection(e, 'membership')}
            className="shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg shadow-blue-500/20 active:scale-95 transition-all duration-300 relative z-10"
          >
            Khám phá ngay
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </section>

      {/* Interactive Before/After Comparison Slider */}
      <section className="py-20 lg:py-32 bg-white/60 backdrop-blur-sm border-y border-indigo-50/50 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Slider Container (Left) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full flex justify-between text-xs font-black tracking-widest text-slate-400 uppercase mb-4 px-2">
              <span>Trước khi rửa</span>
              <span>Sau khi rửa</span>
            </div>

            <div 
              ref={sliderRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl select-none cursor-ew-resize border border-white"
            >
              {/* After image (Always visible in background) */}
              <img 
                src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80" 
                alt="Clean motorcycle detail after wash"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute right-4 top-4 bg-blue-600/90 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full backdrop-blur-sm">
                Sau
              </div>

              {/* Before image (Clipped dynamic container) */}
              <div 
                className="absolute inset-0 overflow-hidden pointer-events-none" 
                style={{ width: `${sliderPosition}%` }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80" 
                  alt="Dirty motorcycle detail before wash"
                  className="absolute inset-0 w-[512px] h-[384px] max-w-none object-cover pointer-events-none"
                  style={{ width: sliderRef.current?.getBoundingClientRect().width }}
                />
                <div className="absolute left-4 top-4 bg-slate-900/90 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Trước
                </div>
              </div>

              {/* Slider Line & Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center touch-none"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
              >
                <div className="w-10 h-10 bg-white hover:scale-110 active:scale-95 shadow-xl rounded-full border-2 border-blue-600 flex items-center justify-center transition-transform duration-150">
                  <svg className="w-5 h-5 text-blue-600 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-4 4 4 4m8-8l4 4-4 4" />
                  </svg>
                </div>
              </div>
            </div>
            
            <p className="text-xs font-bold text-slate-400 mt-4 flex items-center gap-1">
              <span>&larr;</span> Kéo để so sánh <span>&rarr;</span>
            </p>
          </div>

          {/* Details Content (Right) */}
          <div className="lg:col-span-6 flex flex-col space-y-8 text-left max-w-xl mx-auto lg:mx-0">
            <div className="space-y-3">
              <p className="text-xs font-black tracking-widest text-blue-600 uppercase">Vệ sinh & Chăm sóc</p>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight text-slate-900">
                Chăm sóc & <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Đánh bóng chi tiết</span>
              </h2>
            </div>
            
            <p className="text-slate-500 text-sm leading-relaxed">
              Novawash áp dụng quy trình vệ sinh xe máy chuyên sâu với hóa chất sinh học cao cấp, thiết bị làm sạch áp lực chuyên dụng và kỹ thuật viên được đào tạo bài bản. Bụi bẩn bám dính lâu ngày trên động cơ và sên xích sẽ được xử lý triệt để.
            </p>

            <ul className="space-y-3 text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Làm sạch & bảo dưỡng yên xe chuyên sâu</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Vệ sinh sên xích & làm sạch bùn đất khe hốc</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Đánh bóng kim loại & phục hồi nhựa nhám</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Bảo vệ bề mặt sơn chống trầy xước & tia UV</span>
              </li>
            </ul>

            <div className="pt-2">
              <button 
                onClick={() => navigate('/register')}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-8 py-4 rounded-xl shadow-lg shadow-blue-500/10 active:scale-95 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4" />
                ĐẶT LỊCH NGAY
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers Section */}
      <section id="membership" className="py-20 lg:py-32 px-4 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-black tracking-widest text-blue-600 uppercase bg-blue-50 px-3.5 py-1.5 rounded-full">
            Chương trình thành viên
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Hạng thành viên & đặc quyền
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Tích điểm qua mỗi lần rửa để tự động lên hạng. Hạng càng cao, ưu đãi giờ vàng và cửa sổ đặt lịch càng lớn.
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch">
          
          {/* Member Card */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between hover:shadow-2xl transition-all duration-300 text-left">
            <div>
              {/* Top Half Gradient Header */}
              <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-800 text-white p-6 space-y-4 border-b border-indigo-400">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Star className="w-5 h-5 fill-white/20 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-black">Member</h4>
                  <p className="text-xs font-medium text-indigo-100/90 mt-1">Áp dụng ngay khi đăng ký</p>
                </div>
              </div>

              {/* Bottom Half Content */}
              <div className="p-6">
                <ul className="space-y-4 text-xs font-semibold text-slate-600">
                  {benefits.member.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button 
                onClick={() => navigate('/register')}
                className="w-full py-3 px-4 text-xs font-extrabold rounded-xl border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition-colors duration-200"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>

          {/* Silver Card */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between hover:shadow-2xl transition-all duration-300 text-left">
            <div>
              {/* Top Half Gradient Header */}
              <div className="bg-gradient-to-br from-slate-300 via-slate-400 to-zinc-500 text-slate-900 p-6 space-y-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-slate-900/10 flex items-center justify-center border border-slate-900/20">
                  <Star className="w-5 h-5 fill-slate-900/20 text-slate-900" />
                </div>
                <div>
                  <h4 className="text-2xl font-black">Silver</h4>
                  <p className="text-xs font-semibold text-slate-800/90 mt-1">Tổng chi tiêu thanh toán từ 1.000.000đ</p>
                </div>
              </div>

              {/* Bottom Half Content */}
              <div className="p-6">
                <ul className="space-y-4 text-xs font-semibold text-slate-600">
                  {benefits.silver.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button 
                onClick={() => navigate('/register')}
                className="w-full py-3 px-4 text-xs font-extrabold rounded-xl border border-slate-200 hover:border-slate-600 hover:text-slate-700 transition-colors duration-200"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>

          {/* Gold Card */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between hover:shadow-2xl transition-all duration-300 text-left">
            <div>
              {/* Top Half Gradient Header */}
              <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-800 text-white p-6 space-y-4 border-b border-amber-400">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Star className="w-5 h-5 fill-white/20 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-black">Gold</h4>
                  <p className="text-xs font-medium text-amber-100/90 mt-1">Tổng chi tiêu thanh toán từ 5.000.000đ</p>
                </div>
              </div>

              {/* Bottom Half Content */}
              <div className="p-6">
                <ul className="space-y-4 text-xs font-semibold text-slate-600">
                  {benefits.gold.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button 
                onClick={() => navigate('/register')}
                className="w-full py-3 px-4 text-xs font-extrabold rounded-xl border border-slate-200 hover:border-amber-600 hover:text-amber-600 transition-colors duration-200"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>

          {/* Platinum Card (Highlighted) */}
          <div className="relative bg-white border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between hover:shadow-2xl transition-all duration-300 text-left">
            <div className="absolute top-3 right-4 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              HẠNG CAO NHẤT
            </div>
            <div>
              {/* Top Half Gradient Header */}
              <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-950 text-slate-100 p-6 space-y-4 border-b border-zinc-700">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Crown className="w-5 h-5 fill-white/20 text-slate-100" />
                </div>
                <div>
                  <h4 className="text-2xl font-black">Platinum</h4>
                  <p className="text-xs font-medium text-slate-300 mt-1">Tổng chi tiêu thanh toán từ 10.000.000đ</p>
                </div>
              </div>

              {/* Bottom Half Content */}
              <div className="p-6">
                <ul className="space-y-4 text-xs font-semibold text-slate-600">
                  {benefits.platinum.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button 
                onClick={() => navigate('/register')}
                className="w-full py-3.5 px-4 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-colors duration-200"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* Onboarding Steps ("Chỉ 3 bước để bắt đầu") */}
      <section id="booking-steps" className="py-20 lg:py-32 bg-white/40 border-t border-indigo-50/50 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4 max-w-xl mx-auto">
            <span className="text-xs font-black tracking-widest text-blue-600 uppercase bg-blue-50 px-3.5 py-1.5 rounded-full">
              Bắt đầu dễ dàng
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Chỉ 3 bước để bắt đầu
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
            {/* Visual connector lines between steps */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-100 -z-10"></div>
            
            {/* Step 1 */}
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <UserPlus className="w-8 h-8" />
                </div>
                <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-slate-900 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#f7fafd]">
                  01
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-800">Tạo tài khoản</h4>
              <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                Đăng ký miễn phí chỉ trong 1 phút. Thêm thông tin xe và bắt đầu hành trình thành viên của bạn.
              </p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Calendar className="w-8 h-8" />
                </div>
                <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-slate-900 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#f7fafd]">
                  02
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-800">Đặt lịch rửa xe máy</h4>
              <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                Chọn ngày, giờ và gói dịch vụ phù hợp. Hạng thành viên cao hơn cho phép đặt lịch sớm hơn.
              </p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Star className="w-8 h-8" />
                </div>
                <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-slate-900 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#f7fafd]">
                  03
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-800">Tích điểm & nâng hạng</h4>
              <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                Mỗi lần rửa xe máy tích lũy điểm. Điểm tích lũy tối đa và tự động nâng hạng thành viên.
              </p>
            </div>

          </div>

          <div className="pt-6">
            <button 
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg shadow-blue-500/10 hover:shadow-xl active:scale-95 transition-all duration-300"
            >
              Đăng ký ngay
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-400 py-16 px-4 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-left">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-xl font-black text-white tracking-wider">Novawash</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Hệ thống đặt lịch rửa xe máy thông minh và chăm sóc xe toàn diện theo tiêu chuẩn quốc tế hàng đầu Việt Nam.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h5 className="text-white font-bold text-sm tracking-wider uppercase">Dịch vụ</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="#booking-steps" onClick={(e) => scrollToSection(e, 'booking-steps')} className="hover:text-blue-500 transition-colors">Rửa xe máy chuyên sâu</a></li>
              <li><a href="#booking-steps" onClick={(e) => scrollToSection(e, 'booking-steps')} className="hover:text-blue-500 transition-colors">Bảo dưỡng yên xe</a></li>
              <li><a href="#booking-steps" onClick={(e) => scrollToSection(e, 'booking-steps')} className="hover:text-blue-500 transition-colors">Đánh bóng & Phục hồi nhựa</a></li>
              <li><a href="#booking-steps" onClick={(e) => scrollToSection(e, 'booking-steps')} className="hover:text-blue-500 transition-colors">Chăm sóc động cơ</a></li>
            </ul>
          </div>

          {/* About Links */}
          <div className="space-y-4">
            <h5 className="text-white font-bold text-sm tracking-wider uppercase">Liên kết</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="#membership" onClick={(e) => scrollToSection(e, 'membership')} className="hover:text-blue-500 transition-colors">Hạng thành viên</a></li>
              <li><a href="#booking-steps" onClick={(e) => scrollToSection(e, 'booking-steps')} className="hover:text-blue-500 transition-colors">Đặt lịch ngay</a></li>
              <li><a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="hover:text-blue-500 transition-colors">Hỗ trợ khách hàng</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 text-xs font-semibold">
            <h5 className="text-white font-bold text-sm tracking-wider uppercase text-left">Liên hệ</h5>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Hotline: 123-456-7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Ctndx001@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span>123 Đường ABC, Quận 9 gì đó dưới Landmark</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-12 pt-6 text-center text-[10px] font-bold text-slate-600">
          <p>© {new Date().getFullYear()} Novawash. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
