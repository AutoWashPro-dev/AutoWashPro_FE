import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Send, ShieldAlert, Award } from 'lucide-react';

export default function CustomerFeedbackPage() {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  // Danh sách lịch sử các đơn đã hoàn thành để chọn phản hồi
  const completedBookings = [
    { id: 'AW-9894', date: '01/07/2026', serviceName: 'Gói Rửa Basic + Dưỡng lốp' },
    { id: 'AW-9815', date: '28/06/2026', serviceName: 'Gói Rửa Deluxe chuyên sâu' },
    { id: 'AW-9862', date: 'Hôm nay', serviceName: 'Gói Rửa Premium + Dưỡng lốp bóng loáng' }
  ];
  const [selectedBookingId, setSelectedBookingId] = useState(completedBookings[0].id);

  const [feedbacks, setFeedbacks] = useState([]);

  // Load danh sách feedbacks động của Nguyễn Minh Anh (C-01) từ localStorage
  const loadFeedbacks = () => {
    try {
      const db = JSON.parse(localStorage.getItem('autowash_feedbacks') || '[]');
      const mine = db.filter(f => f.customer?.id === 'C-01');
      return mine.map(f => ({
        id: f.id,
        bookingId: f.bookingId,
        date: f.date,
        rating: f.rating,
        comment: f.comment,
        response: f.status === 'Resolved' 
          ? `Quản lý đã giải quyết khiếu nại. Ghi chú xử lý: "${f.internalNotes || ''}"`
          : (f.rating < 3 
              ? 'Hệ thống AI Sentiment phát hiện đánh giá tiêu cực và đã tự động gửi cảnh báo khẩn cấp (ALERT) đến Admin để xử lý đền bù.'
              : 'Cảm ơn phản hồi của bạn. Hệ thống AI Sentiment đã ghi nhận đánh giá tích cực của bạn.')
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  useEffect(() => {
    setFeedbacks(loadFeedbacks());

    // Đồng bộ nếu Admin phản hồi trạng thái Resolved ở tab bên kia
    const handleStorage = (e) => {
      if (e.key === 'autowash_feedbacks') {
        setFeedbacks(loadFeedbacks());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("Vui lòng nhập nội dung nhận xét của bạn.");
      return;
    }

    const isNegative = rating < 3;
    
    // Tạo đối tượng feedback chuẩn cơm mẹ nấu để lưu vào database dùng chung
    const newFeedbackDb = {
      id: 'F-' + Date.now(),
      date: 'Hôm nay, ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      customer: {
        id: 'C-01',
        name: 'Nguyễn Minh Anh',
        phone: '0912***456',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
      },
      rating: rating,
      comment: comment,
      sentiment: isNegative ? 'Negative' : (rating === 3 ? 'Neutral' : 'Positive'),
      status: isNegative ? 'New' : 'Reviewed',
      bookingId: selectedBookingId,
      internalNotes: ''
    };

    // Đồng bộ vào localStorage['autowash_feedbacks']
    try {
      const savedFbs = JSON.parse(localStorage.getItem('autowash_feedbacks') || '[]');
      const nextFbs = [newFeedbackDb, ...savedFbs];
      localStorage.setItem('autowash_feedbacks', JSON.stringify(nextFbs));
    } catch (e) {
      console.error(e);
    }

    // Đồng bộ thông báo khẩn cấp cho Admin (Luồng E2E-5)
    try {
      const adminNotifs = JSON.parse(localStorage.getItem('autowash_admin_notifications') || '[]');
      const newAdminNotif = {
        id: Date.now(),
        type: isNegative ? "ALERT" : "CHECKIN",
        title: isNegative ? "Cảnh báo: Phản hồi tiêu cực" : "Nhận xét mới của khách hàng",
        desc: `Khách hàng Nguyễn Minh Anh vừa đánh giá ${rating} sao cho đơn ${selectedBookingId}: "${comment}"`,
        time: "Vừa xong",
        read: false
      };
      localStorage.setItem('autowash_admin_notifications', JSON.stringify([newAdminNotif, ...adminNotifs]));
    } catch (err) {
      console.error("Lỗi đồng bộ thông báo phản hồi tiêu cực:", err);
    }

    // Phát sự kiện storage để đồng bộ tức thì cho các tab khác
    window.dispatchEvent(new Event('storage'));

    setFeedbacks(loadFeedbacks());
    setComment('');
    alert("Gửi phản hồi thành công! Cảm ơn bạn đã đóng góp ý kiến.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      
      {/* CỘT TRÁI: FORM GỬI PHẢN HỒI (RỘNG 2/3) */}
      <div className="lg:col-span-2 space-y-6 text-left">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm border-b pb-3 mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" /> Gửi phản hồi & Đánh giá dịch vụ
          </h3>

          <form onSubmit={handleSubmitFeedback} className="space-y-5">
            
            {/* Chọn lịch hẹn để đánh giá */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Chọn lịch hẹn đã dọn rửa</label>
              <select 
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 bg-white font-medium"
              >
                {completedBookings.map(b => (
                  <option key={b.id} value={b.id}>
                    Mã đơn {b.id} - Ngày {b.date} ({b.serviceName})
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn sao */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Đánh giá độ hài lòng</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star 
                      size={28} 
                      fill={star <= rating ? "currentColor" : "none"} 
                      className="text-amber-400"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Nội dung nhận xét */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Nội dung nhận xét</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm dọn rửa thực tế của bạn tại trạm (rửa sạch gầm, kỹ xích, thái độ nhân viên...)"
                rows="5"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                required
              ></textarea>
            </div>

            {/* Chú thích AI Sentiment */}
            <div className="flex items-start gap-2 bg-blue-50/50 border border-blue-100 p-3 rounded-xl text-[10px] text-slate-500 leading-relaxed">
              <ShieldAlert size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <span>
                * Ý kiến đóng góp của bạn được phân tích tự động bằng AI Sentiment để chấm điểm chất lượng trạm rửa xe. Admin có quyền gửi tặng voucher đền bù nếu dịch vụ phát sinh lỗi không mong muốn.
              </span>
            </div>

            {/* Nút gửi */}
            <button 
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Send size={12} /> Gửi ý kiến phản hồi
            </button>

          </form>
        </div>
      </div>

      {/* CỘT PHẢI: LỊCH SỬ PHẢN HỒI & PHẢN HỒI TỪ ADMIN (RỘNG 1/3) */}
      <div className="space-y-6 text-left">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm border-b pb-3 mb-4 flex items-center gap-2">
            <Award size={18} className="text-blue-600" /> Phản hồi đã gửi & Trả lời từ trạm
          </h3>

          <div className="space-y-4">
            {feedbacks.map(f => (
              <div key={f.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Đơn: {f.bookingId}</span>
                  <span className="text-slate-400 font-semibold">{f.date}</span>
                </div>
                
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: f.rating }).map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"{f.comment}"</p>
                
                {f.response && (
                  <div className="bg-white border border-slate-150 p-2.5 rounded-lg text-[10px] leading-relaxed text-slate-500">
                    <span className="font-extrabold text-blue-600 block mb-1">AutoWash Pro trả lời:</span>
                    {f.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
