import React, { useState } from 'react';
import {
  MessageSquare,
  Star,
  Send,
  Trash2,
  CheckCircle2,
  Sparkles,
  Shield,
  Eye,
  Filter,
  User as UserIcon,
  LogIn
} from 'lucide-react';
import { User, ViewerFeedback } from '../types';
import { TiltCard } from './TiltCard';

interface ViewerEvaluationSectionProps {
  scope: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  targetId: string;
  scopeTitle: string;
  currentUser: User | null;
  feedbacks: ViewerFeedback[];
  onAddFeedback: (feedback: Omit<ViewerFeedback, 'id' | 'createdAt'>) => Promise<void> | void;
  onDeleteFeedback: (id: string) => Promise<void> | void;
  onOpenLoginModal?: () => void;
}

const QUICK_TAGS = [
  'Tiến độ xuất sắc',
  'Đạt chuẩn KPI',
  'Sáng tạo & Đột phá',
  'Đúng kế hoạch',
  'Cần tối ưu thời gian',
  'Cần phối hợp thêm',
];

export const ViewerEvaluationSection: React.FC<ViewerEvaluationSectionProps> = ({
  scope,
  targetId,
  scopeTitle,
  currentUser,
  feedbacks,
  onAddFeedback,
  onDeleteFeedback,
  onOpenLoginModal,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('Tiến độ xuất sắc');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [filterMode, setFilterMode] = useState<'current' | 'all'>('current');

  // Filter feedbacks
  const currentFeedbacks = feedbacks.filter(
    (f) => f.scope === scope && (f.targetId === targetId || f.targetId === `${scope}_all`)
  );
  const displayedFeedbacks = filterMode === 'current' ? currentFeedbacks : feedbacks;

  // Calculate average rating
  const avgRating =
    displayedFeedbacks.length > 0
      ? (
          displayedFeedbacks.reduce((sum, f) => sum + (f.rating || 5), 0) /
          displayedFeedbacks.length
        ).toFixed(1)
      : '5.0';

  const fiveStarCount = displayedFeedbacks.filter((f) => f.rating === 5).length;
  const satisfactionRate =
    displayedFeedbacks.length > 0
      ? Math.round((fiveStarCount / displayedFeedbacks.length) * 100)
      : 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const authorName = currentUser?.name || 'Người Xem Báo Cáo';
      const authorRole = currentUser?.role || 'viewer';
      const authorAvatar =
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
      const authorTitle = currentUser?.title || 'Người Xem Báo Cáo';

      await onAddFeedback({
        scope,
        targetId,
        userName: authorName,
        userRole: authorRole,
        userAvatar: authorAvatar,
        userTitle: authorTitle,
        rating,
        tag: selectedTag,
        comment: comment.trim(),
      });

      setComment('');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 5:
        return 'Xuất sắc (5 sao)';
      case 4:
        return 'Rất tốt (4 sao)';
      case 3:
        return 'Khá tốt (3 sao)';
      case 2:
        return 'Cần cải thiện (2 sao)';
      case 1:
        return 'Chưa đạt (1 sao)';
      default:
        return `${r} sao`;
    }
  };

  return (
    <div id={`evaluation-section-${scope}`} className="mt-8 pt-8 border-t border-slate-800/80">
      <TiltCard
        id={`evaluation-card-${scope}`}
        glowColor="cyan"
        className="p-5 sm:p-7 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-800/80 rounded-2xl shadow-xl"
      >
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/10">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  Đánh Giá & Nhận Xét Của Người Xem
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {scopeTitle}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Khu vực dành cho các thành viên và người xem gửi nhận xét, đánh giá kết quả & tiến độ công việc.
              </p>
            </div>
          </div>

          {/* Statistics summary */}
          <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 self-start md:self-auto">
            <div className="text-center pr-3 border-r border-slate-800">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-base font-display">
                <span>{avgRating}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[10px] text-slate-400">Điểm đánh giá</span>
            </div>
            <div className="text-center px-2 border-r border-slate-800">
              <span className="text-base font-black text-emerald-400 font-display">
                {satisfactionRate}%
              </span>
              <span className="text-[10px] text-slate-400 block">Hài lòng</span>
            </div>
            <div className="text-center pl-1">
              <span className="text-base font-black text-cyan-400 font-display">
                {displayedFeedbacks.length}
              </span>
              <span className="text-[10px] text-slate-400 block">Lượt nhận xét</span>
            </div>
          </div>
        </div>

        {/* Feedback Input Form */}
        <div className="my-6 p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {currentUser ? (
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                {/* User Info */}
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-xl object-cover border border-cyan-400/40"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{currentUser.name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                          currentUser.role === 'admin'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {currentUser.role === 'admin' ? (
                          <>
                            <Shield className="w-2.5 h-2.5" /> Quản Trị Viên
                          </>
                        ) : (
                          <>
                            <Eye className="w-2.5 h-2.5" /> Người Xem (Viewer)
                          </>
                        )}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{currentUser.title || 'Người Xem Báo Cáo'}</span>
                  </div>
                </div>

                {/* Rating Selector */}
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  <span className="text-xs text-slate-300 font-medium mr-1">Chấm điểm:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = (hoverRating !== null ? hoverRating : rating) >= starVal;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setRating(starVal)}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 text-slate-600 hover:scale-110 transition-transform"
                          title={getRatingLabel(starVal)}
                        >
                          <Star
                            className={`w-4 h-4 transition-colors ${
                              isFilled
                                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                : 'text-slate-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[11px] font-semibold text-amber-400 ml-1">
                    {getRatingLabel(hoverRating !== null ? hoverRating : rating)}
                  </span>
                </div>
              </div>

              {/* Quick Tags Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  Chọn tiêu chí đánh giá nhanh:
                </label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedTag === tag
                          ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-sm'
                          : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <textarea
                  id={`feedback-comment-${scope}`}
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Viết nhận xét hoặc đánh giá của bạn cho ${scopeTitle}...`}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  * Nhận xét sẽ được hiển thị công khai tới Quản Trị Viên (anh Đức) và mọi người xem.
                </span>

                <button
                  type="submit"
                  id={`submit-feedback-btn-${scope}`}
                  disabled={isSubmitting || !comment.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Đang gửi...' : 'Gửi Nhận Xét'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="py-5 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <UserIcon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                Bạn muốn để lại nhận xét & đánh giá?
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                Vui lòng đăng nhập hoặc tạo tài khoản Người Xem để gửi ý kiến đóng góp cho báo cáo này.
              </p>
              {onOpenLoginModal && (
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs inline-flex items-center gap-2 hover:bg-cyan-500/30 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập / Đăng Ký Người Xem</span>
                </button>
              )}
            </div>
          )}

          {/* Success toast notification */}
          {showSuccessToast && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Đã gửi nhận xét thành công! Quản Trị Viên đã nhận được đánh giá của bạn.</span>
            </div>
          )}
        </div>

        {/* Filter Tabs for feedback list */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-300">Danh sách ý kiến đóng góp:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setFilterMode('current')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'current'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kỳ này ({currentFeedbacks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({feedbacks.length})
            </button>
          </div>
        </div>

        {/* Feedback List */}
        {displayedFeedbacks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">
              Chưa có nhận xét nào cho mục này. Hãy là người đầu tiên để lại đánh giá!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedFeedbacks.map((fb) => {
              const dateStr = fb.createdAt
                ? new Date(fb.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Vừa xong';

              return (
                <div
                  key={fb.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <img
                      src={
                        fb.userAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={fb.userName}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0 mt-0.5"
                    />

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{fb.userName}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            fb.userRole === 'admin'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {fb.userRole === 'admin' ? 'Quản Trị Viên' : 'Người Xem'}
                        </span>
                        {fb.userTitle && (
                          <span className="text-[10px] text-slate-400">({fb.userTitle})</span>
                        )}
                        <span className="text-[10px] text-slate-500 ml-auto sm:ml-0">{dateStr}</span>
                      </div>

                      {/* Stars & Tag */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= (fb.rating || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        {fb.tag && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                            {fb.tag}
                          </span>
                        )}
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-slate-200 leading-relaxed break-words pt-1">
                        {fb.comment}
                      </p>
                    </div>
                  </div>

                  {/* Admin moderation delete button */}
                  {currentUser?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Bạn có chắc muốn xóa nhận xét này?')) {
                          onDeleteFeedback(fb.id);
                        }
                      }}
                      className="opacity-60 hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all self-end sm:self-start"
                      title="Xóa nhận xét này (Quyền Quản Trị)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </TiltCard>
    </div>
  );
};
