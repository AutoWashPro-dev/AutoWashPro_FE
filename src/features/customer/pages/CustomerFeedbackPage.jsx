import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Star, Send, ShieldAlert, Award, Loader2, CheckCircle, AlertCircle, Calendar, Car, CheckCircle2, Sparkles, ThumbsUp, AlertTriangle } from 'lucide-react';
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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
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

      if (completed.length > 0 && !initialSelectedId) {
        initialSelectedId = completed[0].bookingId;
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

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFeedbackSuccessModalOpen(false);
        setIsConfirmModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenConfirmModal = (e) => {
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

    const targetBooking = completedBookings.find(b => String(b.bookingId) === String(selectedBookingId));
    if (!targetBooking) {
      setErrorMessage("Không tìm thấy thông tin lịch hẹn dọn rửa.");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmitFeedback = async () => {
    const targetBooking = completedBookings.find(b => String(b.bookingId) === String(selectedBookingId));
    if (!targetBooking) return;

    setIsSubmitting(true);
    setIsConfirmModalOpen(false);

    // Retrieve customer ID from local storage
    let customerId = null;
    const userRaw = localStorage.getItem('autowash_user');
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        customerId = user.customerId || user.id;
      } catch (err) { }
    }

    const feedbackPayload = {
      bookingCode: targetBooking.bookingCode,
      serviceName: targetBooking.serviceName,
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
            <form onSubmit={handleOpenConfirmModal} className="space-y-5">

              {/* Chọn đơn dọn rửa xe để đánh giá */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Đơn dọn rửa xe cần đánh giá ({completedBookings.length})
                  </label>
                  <span className="text-[10px] font-medium text-slate-400">
                    Nhấp vào thẻ để chọn đơn
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  {completedBookings.map(b => {
                    const isSelected = String(b.bookingId) === String(selectedBookingId);
                    return (
                      <div
                        key={b.bookingId}
                        onClick={() => setSelectedBookingId(b.bookingId)}
                        className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${isSelected
                          ? 'border-2 border-blue-600 bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-white shadow-md ring-2 ring-blue-500/20 scale-[1.01]'
                          : 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-sm'
                          }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 text-blue-600">
                            <CheckCircle2 className="w-5 h-5 fill-blue-600 text-white" />
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 mb-2 pr-6 flex-wrap">
                          <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-md ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                            {b.bookingCode}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Đã hoàn thành
                          </span>
                        </div>

                        <h4 className="font-extrabold text-xs text-slate-900 mb-2 line-clamp-1">
                          {b.serviceName}
                        </h4>

                        <div className="space-y-1 text-[11px] text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>Xe: <strong className="text-slate-800 font-bold">{b.licensePlate}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>Ngày rửa: <span className="text-slate-700">{b.date}</span></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {!isBookingSelected ? (
                /* Scenario B: Unreviewed bookings exist, BUT no booking is selected yet (Default state) */
                <div className="py-6 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl animate-fade-in">
                  <p className="text-xs font-semibold text-slate-500">
                    Vui lòng nhấp chọn một thẻ đơn rửa xe ở trên để thực hiện đánh giá.
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
                  Bạn chưa gửi phản hồi nào cho dịch vụ tại NovaWash.
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
                      <span className="font-extrabold text-blue-600 block mb-1">NovaWash trả lời:</span>
                      {f.response}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL DIALOG (SMART CONDITIONAL DESIGN FOR HIGH VS LOW STARS) */}
      {isConfirmModalOpen && selectedBooking && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in text-left"
          onClick={(e) => { if (e.target === e.currentTarget) setIsConfirmModalOpen(false); }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200">

            {/* Conditional Header based on Rating */}
            {rating >= 4 ? (
              /* High Stars (4 - 5 stars): Praise & Satisfaction */
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-md shadow-emerald-500/10 animate-bounce">
                  <Sparkles className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Xác Nhận Gửi Đánh Giá Hài Lòng ✨
                </h3>
                <p className="text-xs text-slate-500 font-medium px-2 leading-relaxed">
                  Cảm ơn bạn đã hài lòng và đánh giá cao dịch vụ dọn rửa tại <strong className="text-blue-600 font-extrabold">NovaWash</strong>!
                </p>
              </div>
            ) : (
              /* Low Stars (1 - 3 stars): Apology & Emergency AI Escalation */
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-50 to-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-md shadow-rose-500/10 animate-pulse">
                  <AlertTriangle className="w-7 h-7 text-rose-600" />
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Xác Nhận Gửi Phản Hồi Khiếu Nại ⚠️
                </h3>
                <p className="text-xs text-rose-600 font-semibold px-2 leading-relaxed">
                  NovaWash chân thành xin lỗi vì trải nghiệm chưa đạt kỳ vọng của bạn tại trạm!
                </p>
              </div>
            )}

            {/* Order & Rating Summary Card */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                <span className="text-[10px] font-black font-mono bg-blue-600 text-white px-2 py-0.5 rounded-md">
                  {selectedBooking.bookingCode}
                </span>
                <span className="text-[11px] font-extrabold text-slate-800">
                  {selectedBooking.serviceName}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Số sao đánh giá:</span>
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= rating ? "currentColor" : "none"}
                        className="text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="font-extrabold text-xs text-slate-800 ml-1">
                    ({rating}/5 sao)
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-700 font-medium bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed italic">
                "{comment}"
              </div>

              {/* Special alert box for low stars */}
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition cursor-pointer"
              >
                Chỉnh sửa lại
              </button>

              <button
                type="button"
                onClick={handleConfirmSubmitFeedback}
                disabled={isSubmitting}
                className={`py-2.5 px-4 text-white rounded-xl text-xs font-extrabold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 ${rating >= 4
                  ? 'bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
                  : 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 shadow-rose-500/20'
                  }`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{rating >= 4 ? 'Xác Nhận Gửi ✨' : 'Gửi Khiếu Nại ⚠️'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                Cảm ơn bạn đã gửi phản hồi và đóng góp ý kiến để NovaWash không ngừng nâng cao chất lượng dịch vụ dọn rửa xe.
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

