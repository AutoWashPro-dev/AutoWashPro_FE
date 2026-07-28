import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Star, Send, ShieldAlert, Award, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { customerApi } from '../services/customerApi';

export default function CustomerFeedbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [completedBookings, setCompletedBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Loading states
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeedbackSuccessModalOpen, setIsFeedbackSuccessModalOpen] = useState(false);

  // Clear existing error/success alerts and reset form when changing selection
  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    // Reset form state when switching booking selection
    setRating(5);
    setComment('');
  }, [selectedBookingId]);

  const fetchCompletedBookings = async () => {
    setIsBookingsLoading(true);
    try {
      // 1. Fetch completed & paid bookings from API
      const bookingsData = await customerApi.getMyBookings({ status: 'COMPLETED', paymentStatus: 'PAID' });
      
      // Strict client-side safety filtering to guarantee only successfully paid completed orders are returned
      const eligible = bookingsData.filter(
        booking => booking.status === 'COMPLETED' && (booking.paymentStatus === 'PAID' || booking.isPaid === true)
      );
      
      // 2. Fetch existing feedbacks to perform unreviewed filtering
      const feedbacksData = await customerApi.getMyFeedbacks();
      
      // Build a comprehensive set of already reviewed booking identifiers.
      // Include both bookingCode (string, e.g. "NV-1002") and numeric bookingId/id
      // to guarantee no already-reviewed booking slips through.
      const reviewedCodes = new Set();
      feedbacksData.forEach(f => {
        if (f.bookingCode) reviewedCodes.add(String(f.bookingCode).trim());
        if (f.bookingId) reviewedCodes.add(String(f.bookingId).trim());
        if (f.id) reviewedCodes.add(String(f.id).trim());
      });

      // 3. Filter Rule: keep ONLY bookings not yet reviewed.
      // Check BOTH bookingCode (string key) AND numeric id against the reviewed set.
      const unreviewed = eligible.filter(b => {
        const codeReviewed = b.bookingCode && reviewedCodes.has(String(b.bookingCode).trim());
        const idReviewed = b.id && reviewedCodes.has(String(b.id).trim());
        const bookingIdReviewed = b.bookingId && reviewedCodes.has(String(b.bookingId).trim());
        return !codeReviewed && !idReviewed && !bookingIdReviewed;
      });

      const completed = unreviewed.map(b => ({
        bookingId: b.bookingId || b.id,
        bookingCode: b.bookingCode,
        date: b.bookingDate || b.date || 'N/A',
        licensePlate: b.licensePlate || (b.vehicle ? b.vehicle.licensePlate : 'N/A'),
        serviceName: b.packageName || b.serviceName || 'Rửa xe máy cao cấp'
      }));
      
      // Auto-extract from URL or state
      const params = new URLSearchParams(location.search);
      const queryBookingCode = params.get('bookingCode') || location.state?.bookingCode;
      const queryServiceName = params.get('serviceName') || location.state?.serviceName;
      const queryBookingId = params.get('bookingId') || location.state?.bookingId;
      
      let initialSelectedId = '';
      
      if (queryBookingCode) {
        // Only select from URL if it hasn't been reviewed yet
        const isAlreadyReviewed = reviewedCodes.has(String(queryBookingCode).trim());
        if (!isAlreadyReviewed) {
          const exists = completed.find(b => b.bookingCode === queryBookingCode);
          if (!exists) {
            const virtualEntry = {
              bookingId: queryBookingId || Date.now(),
              bookingCode: queryBookingCode,
              date: 'Từ liên kết',
              licensePlate: 'Xe của bạn',
              serviceName: queryServiceName || 'Rửa xe máy cao cấp'
            };
            completed.unshift(virtualEntry);
            initialSelectedId = virtualEntry.bookingId;
          } else {
            initialSelectedId = exists.bookingId;
          }
        }
      }
      
      setCompletedBookings(completed);
      setSelectedBookingId(initialSelectedId);
    } catch (err) {
      console.error("Failed to fetch completed bookings:", err);
    } finally {
      setIsBookingsLoading(false);
    }
  };

  const loadFeedbacks = async () => {
    setIsHistoryLoading(true);
    try {
      const data = await customerApi.getMyFeedbacks();
      const mapped = data.map(f => {
        let responseMsg = '';
        if (f.status === 'RESOLVED') {
          responseMsg = `Quản lý đã giải quyết khiếu nại. Ghi chú: "${f.resolutionNotes || ''}"`;
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
          bookingCode: f.bookingCode || f.bookingId || `NV-${f.id}`,
          serviceName: f.serviceName || 'Dịch vụ dọn rửa xe',
          date: f.createdAt ? new Date(f.createdAt).toLocaleString('vi-VN') : 'Mới đây',
          rating: f.ratingStars || f.rating || 5,
          comment: f.comment,
          status: f.status,
          resolutionNotes: f.resolutionNotes,
          compensationVoucherCode: f.compensationVoucherCode,
          response: responseMsg
        };
      });
      setFeedbacks(mapped);
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    } finally {
      setIsHistoryLoading(false);
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
  }, [location]);

  // Handle ESC key press to close success modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFeedbackSuccessModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    if (!selectedBookingId) {
      setErrorMessage("Vui lòng chọn một đơn hàng đã hoàn thành để phản hồi.");
      return;
    }
    if (rating <= 0) {
      setErrorMessage("Vui lòng chọn số sao đánh giá.");
      return;
    }
    if (!comment.trim()) {
      setErrorMessage("Vui lòng nhập nội dung nhận xét của bạn.");
      return;
    }

    const selectedBooking = completedBookings.find(b => String(b.bookingId) === String(selectedBookingId));
    if (!selectedBooking) {
      setErrorMessage("Không tìm thấy thông tin lịch hẹn dọn rửa.");
      return;
    }

    setIsSubmitting(true);

    // Retrieve customer ID from local storage
    let customerId = null;
    const userRaw = localStorage.getItem('autowash_user');
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        customerId = user.customerId || user.id;
      } catch (err) {}
    }

    const feedbackPayload = {
      bookingCode: selectedBooking.bookingCode,
      serviceName: selectedBooking.serviceName,
      ratingStars: rating,
      comment: comment.trim()
    };

    try {
      await customerApi.createFeedback(customerId, feedbackPayload);
      setIsFeedbackSuccessModalOpen(true);
      setComment('');
      setRating(5);
      setSelectedBookingId('');
      // Refresh both feedbacks and eligible booking list on success
      await Promise.all([loadFeedbacks(), fetchCompletedBookings()]);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Không thể gửi phản hồi. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBooking = completedBookings.find(b => String(b.bookingId) === String(selectedBookingId));
  const hasUnreviewedBookings = completedBookings.length > 0;
  const isBookingSelected = !!selectedBookingId;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 relative">
      
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

          {isBookingsLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
            </div>
          ) : !hasUnreviewedBookings ? (
            /* Scenario A: No unreviewed bookings available (Empty pending state) */
            <div className="text-center py-12 px-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-500 flex flex-col items-center justify-center gap-4 animate-fade-in">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                <CheckCircle size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700">Hiện bạn không có đơn đặt lịch nào cần đánh giá</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Hãy đặt lịch thêm dịch vụ dọn rửa xe để trải nghiệm chất lượng dịch vụ tốt nhất nhé!
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/customer/book')}
                className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-200 hover:shadow-lg cursor-pointer"
              >
                Đặt lịch ngay
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-5">
              
              {/* Chọn lịch hẹn để đánh giá */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Chọn lịch hẹn đã dọn rửa</label>
                <select 
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 bg-white font-medium animate-fade-in"
                >
                  <option value="">-- Chọn lịch hẹn đã dọn rửa --</option>
                  {completedBookings.map(b => (
                    <option key={b.bookingId} value={b.bookingId}>
                      [{b.bookingCode}] {b.date} - {b.licensePlate} ({b.serviceName})
                    </option>
                  ))}
                </select>
              </div>

              {!isBookingSelected ? (
                /* Scenario B: Unreviewed bookings exist, BUT no booking is selected yet (Default state) */
                <div className="py-8 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl animate-fade-in">
                  <p className="text-xs font-semibold text-slate-500">
                    Vui lòng chọn một đơn đặt lịch từ danh sách trên để bắt đầu đánh giá.
                  </p>
                </div>
              ) : (
                /* Scenario C: User selects a valid unreviewed booking from dropdown */
                <div className="space-y-5 animate-fade-in">
                  {/* Chọn sao */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Đánh giá độ hài lòng</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
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
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none bg-white"
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
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 hover:shadow-lg transition-all flex items-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Đang gửi phản hồi...</span>
                      </>
                    ) : (
                      <>
                        <Send size={12} />
                        <span>Gửi ý kiến phản hồi</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </form>
          )}
        </div>
      </div>

      {/* CỘT PHẢI: LỊCH SỬ PHẢN HỒI & PHẢN HỒI TỪ ADMIN (RỘNG 1/3) */}
      <div className="space-y-6 text-left">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm border-b pb-3 mb-4 flex items-center gap-2">
            <Award size={18} className="text-blue-600" /> Phản hồi đã gửi & Trả lời từ trạm
          </h3>

          <div className="space-y-4">
            {isHistoryLoading ? (
              // Skeletons
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <div key={star} className="w-3 h-3 bg-slate-200 rounded-full"></div>
                      ))}
                    </div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            ) : feedbacks.length === 0 ? (
              // Empty History State
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <MessageSquare size={18} className="text-slate-350" />
                </div>
                <p className="text-xs font-semibold text-slate-500">Hiện lịch sử phản hồi đang trống.</p>
                <p className="text-[10px] text-slate-400 max-w-[200px] text-center leading-relaxed font-normal">
                  Bạn chưa gửi phản hồi nào cho dịch vụ tại AutoWash Pro.
                </p>
              </div>
            ) : (
              // Render List
              feedbacks.map(f => (
                <div key={f.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                      {f.bookingCode}
                    </span>
                    <span className="text-slate-400 font-semibold">{f.date}</span>
                  </div>
                  
                  <div className="text-[11px] text-slate-700 font-bold font-sans">
                    {f.serviceName}
                  </div>

                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill={i < f.rating ? "currentColor" : "none"} className="text-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-650 leading-relaxed font-medium italic">"{f.comment}"</p>
                  
                  {f.status === 'RESOLVED' && (
                    <div className="border border-emerald-100 bg-emerald-50/50 p-2.5 rounded-lg text-[10px] leading-relaxed text-emerald-800 space-y-1">
                      <span className="font-extrabold flex items-center gap-1 text-[10px] text-emerald-700">
                        <CheckCircle size={10} /> Đã giải quyết khiếu nại
                      </span>
                      <p className="font-medium text-emerald-600">Ghi chú: "{f.resolutionNotes || 'Đã được xử lý thỏa đáng'}"</p>
                      {f.compensationVoucherCode && (
                        <div className="pt-1">
                          <span className="inline-block px-2 py-0.5 font-black bg-emerald-600 text-white rounded font-mono uppercase text-[9px] tracking-wide animate-pulse">
                            Voucher đền bù: {f.compensationVoucherCode}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {f.status !== 'RESOLVED' && f.response && (
                    <div className="bg-white border border-slate-150 p-2.5 rounded-lg text-[10px] leading-relaxed text-slate-500">
                      <span className="font-extrabold text-blue-600 block mb-1">AutoWash Pro trả lời:</span>
                      {f.response}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL DIALOG */}
      {isFeedbackSuccessModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsFeedbackSuccessModalOpen(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-250">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-800">Gửi đánh giá thành công!</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium px-2">
                Cảm ơn bạn đã gửi phản hồi và đóng góp ý kiến để AutoWash Pro không ngừng nâng cao chất lượng dịch vụ dọn rửa xe.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFeedbackSuccessModalOpen(false)}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
