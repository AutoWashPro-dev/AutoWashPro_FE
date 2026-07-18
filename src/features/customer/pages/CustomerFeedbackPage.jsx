import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Send, ShieldAlert, Award } from 'lucide-react';
import { customerApi } from '../services/customerApi';

export default function CustomerFeedbackPage() {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [completedBookings, setCompletedBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchCompletedBookings = async () => {
    try {
      const data = await customerApi.getMyBookings('COMPLETED');
      const completed = data.map(b => ({
        bookingId: b.bookingId,
        bookingCode: b.bookingCode,
        date: b.bookingDate || b.date || 'N/A',
        licensePlate: b.licensePlate || (b.vehicle ? b.vehicle.licensePlate : 'N/A')
      }));
      setCompletedBookings(completed);
      if (completed.length > 0) {
        setSelectedBookingId(completed[0].bookingId);
      }
    } catch (err) {
      console.error("Failed to fetch completed bookings:", err);
    }
  };

  const loadFeedbacks = async () => {
    try {
      const data = await customerApi.getMyFeedbacks();
      const mapped = data.map(f => {
        let responseMsg = '';
        if (f.status === 'RESOLVED') {
          responseMsg = `Quản lý đã giải quyết khiếu nại. Ghi chú: "${f.resolutionNotes || ''}"`;
          if (f.compensationVoucherCode) {
            responseMsg += ` (Đã tặng voucher đền bù: ${f.compensationVoucherCode})`;
          }
        } else if (f.status === 'IGNORED') {
          responseMsg = 'Đánh giá đã được xem xét và bỏ qua.';
        } else {
          responseMsg = f.ratingStars < 3 
            ? 'Hệ thống AI Sentiment phát hiện đánh giá tiêu cực và đã tự động gửi cảnh báo khẩn cấp đến Ban Quản Lý.'
            : 'Cảm ơn phản hồi của bạn. Hệ thống AI Sentiment đã ghi nhận đánh giá tích cực của bạn.';
        }
        return {
          id: f.id,
          bookingId: f.bookingId,
          date: f.createdAt ? new Date(f.createdAt).toLocaleString('vi-VN') : 'Mới đây',
          rating: f.ratingStars || f.rating || 5,
          comment: f.comment,
          response: responseMsg
        };
      });
      setFeedbacks(mapped);
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    }
  };

  useEffect(() => {
    fetchCompletedBookings();
    loadFeedbacks();

    const handleStorage = (e) => {
      if (e.key === 'autowash_feedbacks') {
        loadFeedbacks();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    if (!comment.trim()) {
      setErrorMessage("Vui lòng nhập nội dung nhận xét của bạn.");
      return;
    }
    if (!selectedBookingId) {
      setErrorMessage("Vui lòng chọn một đơn hàng đã hoàn thành để phản hồi.");
      return;
    }

    try {
      const feedbackData = {
        bookingId: Number(selectedBookingId),
        rating: rating,
        comment: comment
      };

      await customerApi.createFeedback(feedbackData);
      setSuccessMessage("Gửi ý kiến phản hồi thành công! Cảm ơn bạn đã đóng góp ý kiến.");
      setComment('');
      setRating(5);
      await loadFeedbacks();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setErrorMessage(err.response?.data?.message || 'Không thể gửi phản hồi. Vui lòng thử lại!');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      
      {/* CỘT TRÁI: FORM GỬI PHẢN HỒI (RỘNG 2/3) */}
      <div className="lg:col-span-2 space-y-6 text-left">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm border-b pb-3 mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" /> Gửi phản hồi & Đánh giá dịch vụ
          </h3>

          {/* Success Message Banner */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl flex items-center gap-2 font-bold text-xs animate-fade-in">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              {successMessage}
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2 font-bold text-xs animate-fade-in">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-5">
            
            {/* Chọn lịch hẹn để đánh giá */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Chọn lịch hẹn đã dọn rửa</label>
              <select 
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 bg-white font-medium"
              >
                {completedBookings.length === 0 && (
                  <option value="">Không có lịch hẹn đã dọn rửa</option>
                )}
                {completedBookings.map(b => (
                  <option key={b.bookingId} value={b.bookingId}>
                    {b.date} - {b.licensePlate}
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
              <div key={f.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 animate-fade-in">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Đơn: {f.bookingId}</span>
                  <span className="text-slate-400 font-semibold">{f.date}</span>
                </div>
                
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: f.rating }).map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" className="text-amber-400" />
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
            {feedbacks.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">Chưa có phản hồi nào được gửi.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
