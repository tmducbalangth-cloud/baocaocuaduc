import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Copy,
  Check,
  RotateCcw,
  TrendingUp,
  Eye,
  Users,
  Radio,
  Heart,
  Edit3,
  Save,
  CheckCircle2,
  FileText,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  Plus,
  X,
  Award,
  Zap,
  Loader2,
} from 'lucide-react';
import { TiltCard } from './TiltCard';
import { TaskItem, WeeklySelfReview, ChannelMetrics, User } from '../types';

interface WeeklySelfEvaluationCardProps {
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  weekTasks: TaskItem[];
  currentUser: User | null;
}

const POPULAR_CHANNELS = [
  'TikTok Ba Làng Tuyến Hòa',
  'Fan Ba Làng TH',
  'TikTok Sếp Huyền',
  'Facebook Fanpage',
  'Phiên Livestream',
  'Kênh OCOP 4 Sao',
];

// Mẫu dữ liệu mặc định thông minh cho các tuần của Tháng 8 năm 2026
const DEFAULT_AUGUST_REVIEWS: Record<number, Partial<WeeklySelfReview>> = {
  32: {
    channelMetrics: {
      views: '128,500',
      followers: '+1,850',
      reach: '86,400',
      engagement: '9,600',
      conversionOrOrders: '4 video phục vụ phiên Live 8/8',
      activeChannels: ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH'],
      note: 'Tuần mở đầu tháng 8 tập trung quy chuẩn sản xuất và chuẩn bị chiến dịch',
    },
    userBulletPoints: `• Quay hoàn tất 12 video content định kỳ (4 clip Ba Làng Tuyến Hòa, 8 clip Fan Ba Làng).
• Soạn thảo hoàn thành 8 kịch bản kênh Fan Ba Làng TH.
• Lên kế hoạch content và chuẩn bị chiến dịch quảng cáo Facebook tuần tới.
• Sản xuất và dựng hoàn thiện 4 video phục vụ phiên livestream ngày 8/8.
• Tồn đọng: Tốc độ duyệt kịch bản giữa các khâu cần nhịp nhàng hơn.`,
    selfScore: 92,
    selfRating: 'Xuất sắc (A)',
  },
  33: {
    channelMetrics: {
      views: '172,000',
      followers: '+2,450',
      reach: '112,000',
      engagement: '14,300',
      conversionOrOrders: 'Ban hành Đề xuất Quy tắc TikTok chuẩn',
      activeChannels: ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH', 'TikTok Sếp Huyền'],
      note: 'Đột phá tuyến nội dung nỗi đau khách hàng và kênh TT Sếp Huyền',
    },
    userBulletPoints: `• Đột phá sản xuất 10 kịch bản (kênh TT sếp Huyền, Seri nỗi đau KH).
• Quay 12 clip content Ba Làng Tuyến Hòa và Fan Ba Làng.
• Dựng hoàn thiện 9 video clip mới và tái dựng 2 clip cũ tối ưu giữ chân người xem.
• Ban hành bộ tài liệu Đề Xuất Quy Tắc TikTok và đánh giá kênh TikTok cũ.
• Kế hoạch tuần tới: Tập trung kịch bản kênh TT Đại diện Sếp Huyền và Fan Ba Làng.`,
    selfScore: 96,
    selfRating: 'Xuất sắc (A+)',
  },
  34: {
    channelMetrics: {
      views: '215,000',
      followers: '+3,600',
      reach: '148,000',
      engagement: '18,900',
      conversionOrOrders: 'Đề xuất cáp quang & OBS phòng live được phê duyệt',
      activeChannels: ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH'],
      note: 'Khối lượng sản xuất cao nhất tháng: 19 clip quay, 16 clip dựng',
    },
    userBulletPoints: `• Sản xuất khối lượng lớn: 19 clip quay (8 Ba Làng Tuyến Hòa, 11 Fan Ba Làng).
• Dựng và hoàn thiện 16 video clip cho 2 kênh chính.
• Họp giao ban đầu tuần, thống nhất kế hoạch xây kênh theo tuyến nỗi đau khách hàng.
• Lập đề xuất lắp đặt đường truyền cáp quang riêng và khảo sát thiết bị OBS cho phòng Live.
• Tự nhận xét: Hiệu suất cao, chỉ số view và follow tăng trưởng đột biến, tinh thần làm việc bền bỉ.`,
    selfScore: 95,
    selfRating: 'Xuất sắc (A+)',
  },
  35: {
    channelMetrics: {
      views: '285,000',
      followers: '+4,800',
      reach: '198,000',
      engagement: '25,400',
      conversionOrOrders: 'Chuẩn bị 2 kịch bản chào mừng 2/9 & dàn ý Live 9/9',
      activeChannels: ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH', 'Phiên Livestream'],
      note: 'Tăng tốc kịch bản chiến dịch lễ Quốc khánh 2/9 và Mega Live 9/9',
    },
    userBulletPoints: `• Kỷ lục hoàn thành 13 kịch bản kênh Ba Làng Tuyến Hòa và 2 kịch bản chào mừng 2/9.
• Sản xuất và dựng 14 video phục vụ chiến dịch lễ và tuần bán hàng cao điểm.
• Xây dựng dàn ý chi tiết phiên Livestream 9/9 và kết hợp tối ưu chi phí Ads.
• Tự nhận xét: Vượt chỉ tiêu kịch bản tuần, chuẩn bị kỹ lưỡng cho chuỗi sự kiện tháng 9.`,
    selfScore: 98,
    selfRating: 'Xuất sắc (A+)',
  },
};

export const WeeklySelfEvaluationCard: React.FC<WeeklySelfEvaluationCardProps> = ({
  weekNumber,
  year,
  startDate,
  endDate,
  weekTasks,
  currentUser,
}) => {
  const weekKey = `weekly_${weekNumber}_${year}`;
  const localKey = `weekly_self_review_${weekKey}`;

  // Default fallback data for this week
  const defaultData = DEFAULT_AUGUST_REVIEWS[weekNumber] || {
    channelMetrics: {
      views: '150,000',
      followers: '+2,000',
      reach: '100,000',
      engagement: '12,000',
      conversionOrOrders: 'Đạt chỉ tiêu đề ra',
      activeChannels: ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH'],
      note: '',
    },
    userBulletPoints: `• Hoàn thành bám sát các đầu việc kịch bản, quay và dựng trong tuần.
• Tương tác kênh duy trì ổn định và có sự cải thiện về chất lượng giữ chân người xem.
• Phối hợp hỗ trợ các bộ phận liên quan chuẩn bị lịch phát sóng và livestream.`,
    selfScore: 90,
    selfRating: 'Xuất sắc (A)',
  };

  const [metrics, setMetrics] = useState<ChannelMetrics>(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.channelMetrics) return parsed.channelMetrics;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultData.channelMetrics as ChannelMetrics;
  });

  const [userBulletPoints, setUserBulletPoints] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.userBulletPoints) return parsed.userBulletPoints;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultData.userBulletPoints || '';
  });

  const [selfScore, setSelfScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selfScore) return parsed.selfScore;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultData.selfScore || 95;
  });

  const [selfRating, setSelfRating] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selfRating) return parsed.selfRating;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultData.selfRating || 'Xuất sắc (A+)';
  });

  const [customNewChannel, setCustomNewChannel] = useState('');
  const [isAddingChannel, setIsAddingChannel] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'document' | 'breakdown'>('document');
  const [isEditingDoc, setIsEditingDoc] = useState(false);

  const [aiReviewData, setAiReviewData] = useState<{
    overallSummary?: string;
    channelAnalysis?: string;
    keyStrengths?: string[];
    bottlenecksAndLearnings?: string[];
    nextWeekActionPlan?: string[];
    formattedDocument?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formattedDocument || parsed.aiGeneratedReview) {
          return {
            ...parsed.aiGeneratedReview,
            formattedDocument: parsed.formattedDocument,
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [editableDoc, setEditableDoc] = useState<string>('');

  // Reload when week changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.channelMetrics) setMetrics(parsed.channelMetrics);
        if (parsed.userBulletPoints) setUserBulletPoints(parsed.userBulletPoints);
        if (parsed.selfScore) setSelfScore(parsed.selfScore);
        if (parsed.selfRating) setSelfRating(parsed.selfRating);
        if (parsed.formattedDocument || parsed.aiGeneratedReview) {
          const rev = {
            ...parsed.aiGeneratedReview,
            formattedDocument: parsed.formattedDocument,
          };
          setAiReviewData(rev);
          setEditableDoc(parsed.formattedDocument || '');
        } else {
          setAiReviewData(null);
          setEditableDoc('');
        }
        return;
      }
    } catch (e) {
      console.error(e);
    }

    // Default template for this week
    const currentDefault = DEFAULT_AUGUST_REVIEWS[weekNumber] || {
      channelMetrics: {
        views: '150,000',
        followers: '+2,000',
        reach: '100,000',
        engagement: '12,000',
        conversionOrOrders: 'Đạt chỉ tiêu đề ra',
        activeChannels: ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH'],
        note: '',
      },
      userBulletPoints: `• Hoàn thành bám sát các đầu việc kịch bản, quay và dựng trong tuần.
• Tương tác kênh duy trì ổn định và có sự cải thiện về chất lượng giữ chân người xem.
• Phối hợp hỗ trợ các bộ phận liên quan chuẩn bị lịch phát sóng và livestream.`,
      selfScore: 90,
      selfRating: 'Xuất sắc (A)',
    };

    setMetrics(currentDefault.channelMetrics as ChannelMetrics);
    setUserBulletPoints(currentDefault.userBulletPoints || '');
    setSelfScore(currentDefault.selfScore || 95);
    setSelfRating(currentDefault.selfRating || 'Xuất sắc (A+)');
    setAiReviewData(null);
    setEditableDoc('');
  }, [weekKey, weekNumber]);

  // Sync to server on load if exists
  useEffect(() => {
    const fetchServerReview = async () => {
      try {
        const res = await fetch('/api/shared/self-reviews');
        if (res.ok) {
          const data = await res.json();
          if (data.selfReviews && data.selfReviews[weekKey]) {
            const serverReview = data.selfReviews[weekKey];
            if (serverReview.channelMetrics) setMetrics(serverReview.channelMetrics);
            if (serverReview.userBulletPoints) setUserBulletPoints(serverReview.userBulletPoints);
            if (serverReview.selfScore) setSelfScore(serverReview.selfScore);
            if (serverReview.selfRating) setSelfRating(serverReview.selfRating);
            if (serverReview.formattedDocument || serverReview.aiGeneratedReview) {
              const rev = {
                ...serverReview.aiGeneratedReview,
                formattedDocument: serverReview.formattedDocument,
              };
              setAiReviewData(rev);
              setEditableDoc(serverReview.formattedDocument || '');
            }
          }
        }
      } catch (err) {
        // quiet fallback
      }
    };
    fetchServerReview();
  }, [weekKey]);

  // Handle Score Change
  const handleScoreChange = (score: number) => {
    setSelfScore(score);
    if (score >= 95) setSelfRating('Xuất sắc (A+)');
    else if (score >= 88) setSelfRating('Xuất sắc (A)');
    else if (score >= 80) setSelfRating('Tốt (B+)');
    else if (score >= 70) setSelfRating('Khá (B)');
    else setSelfRating('Cần Cố Gắng (C)');
  };

  // Toggle Channel Selection
  const toggleChannel = (channel: string) => {
    setMetrics((prev) => {
      const exists = prev.activeChannels.includes(channel);
      const activeChannels = exists
        ? prev.activeChannels.filter((c) => c !== channel)
        : [...prev.activeChannels, channel];
      return { ...prev, activeChannels };
    });
  };

  const handleAddCustomChannel = () => {
    if (!customNewChannel.trim()) return;
    const name = customNewChannel.trim();
    if (!metrics.activeChannels.includes(name)) {
      setMetrics((prev) => ({
        ...prev,
        activeChannels: [...prev.activeChannels, name],
      }));
    }
    setCustomNewChannel('');
    setIsAddingChannel(false);
  };

  // Auto populate key points from week tasks
  const handleAutoFillTasks = () => {
    const completedTasks = weekTasks.filter(
      (t) => t.status === 'completed' || (t.completionPercent || 0) >= 100
    );
    const topCompleted = completedTasks.slice(0, 5);
    const bullets = topCompleted.map((t) => `• Hoàn thành: ${t.title} (${t.timeSpentHours}h)`).join('\n');
    const fullText = `• Khối lượng công việc tuần ${weekNumber}: Đã hoàn thành ${completedTasks.length}/${weekTasks.length} nhiệm vụ.
${bullets}
• Chỉ số kênh ghi nhận tăng trưởng tốt, tương tác cao ở các video kịch bản mới.
• Cần khắc phục: Đẩy nhanh hơn nữa khâu duyệt kịch bản để tránh dồn ứ vào cuối tuần.
• Kế hoạch tuần tới: Tập trung kịch bản trọng điểm và tối ưu chuyển đổi qua Livestream.`;

    setUserBulletPoints(fullText);
  };

  // Generate with AI
  const handleGenerateAIReview = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/self-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber,
          year,
          startDate,
          endDate,
          userBulletPoints,
          channelMetrics: metrics,
          weekTasks,
          selfScore,
          selfRating,
        }),
      });

      if (!response.ok) {
        throw new Error('Lỗi từ server khi gọi AI');
      }

      const data = await response.json();
      const reviewObj = {
        overallSummary: data.overallSummary,
        channelAnalysis: data.channelAnalysis,
        keyStrengths: data.keyStrengths,
        bottlenecksAndLearnings: data.bottlenecksAndLearnings,
        nextWeekActionPlan: data.nextWeekActionPlan,
        formattedDocument: data.formattedDocument,
      };

      setAiReviewData(reviewObj);
      setEditableDoc(data.formattedDocument || '');

      // Save locally
      saveReviewToStorage(reviewObj, data.formattedDocument);
    } catch (err: any) {
      console.error('Error generating self-review:', err);
      // Fallback generation
      const fallbackDoc = `BÁO CÁO TỰ ĐÁNH GIÁ CÔNG VIỆC TRONG TUẦN ${weekNumber} (${startDate} - ${endDate})
Người thực hiện: Trịnh Minh Đức | Kênh phụ trách: ${metrics.activeChannels.join(', ')}
Xếp loại tự chấm: ${selfRating} (${selfScore}/100)

I. TỔNG QUAN TỰ ĐÁNH GIÁ:
Trong tuần ${weekNumber}, bản thân tôi đã chủ động triển khai toàn diện các hạng mục công việc được giao, bám sát mục tiêu nội dung và vận hành kênh. Tinh thần làm việc tập trung, trách nhiệm và luôn tìm tòi phương án cải tiến chất lượng kịch bản, quay dựng.

II. ĐO LƯỜNG & PHÂN TÍCH CHỈ SỐ KÊNH:
- Lượt xem (Views): ${metrics.views}
- Lượt Follow mới: ${metrics.followers}
- Độ phủ (Reach): ${metrics.reach}
- Lượt tương tác: ${metrics.engagement}
- Chuyển đổi / Ghi chú: ${metrics.conversionOrOrders || 'Ổn định'}
Nhận xét số liệu: Các chỉ số tăng trưởng phản ánh đúng công sức đầu tư vào kịch bản nội dung chất lượng cao, hình ảnh sắc nét và thông điệp giải quyết trúng tâm lý người xem.

III. NHỮNG ĐIỂM SÁNG & ĐỘT PHÁ ĐẠT ĐƯỢC:
+ Hoàn thành xuất sắc tiến độ quay, dựng và biên tập nội dung định kỳ cho các kênh.
+ Đạt chỉ số tương tác vượt trội (${metrics.views} view, ${metrics.followers} follow mới).
+ Đề xuất cải tiến quy trình phối hợp và thiết bị kỹ thuật phục vụ sản xuất.

IV. KHUYẾT ĐIỂM CẦN KHẮC PHỤC:
- Cần rút ngắn thêm thời gian chờ duyệt kịch bản giữa các khâu.
- Tiếp tục tối ưu 3 giây đầu video để nâng cao tỷ lệ xem hết clip (completion rate).

V. CAM KẾT HÀNH ĐỘNG TUẦN TỚI:
-> Bám sát lịch sản xuất kịch bản các tuyến nội dung chiến lược.
-> Tối ưu định dạng video ngắn kết hợp kêu gọi hành động (CTA) rõ ràng.
-> Chuẩn bị kỹ lưỡng kịch bản và phối hợp phòng live đạt chỉ tiêu doanh số.`;

      const fallbackRev = {
        overallSummary: `Trong tuần ${weekNumber}, bản thân tôi đã chủ động triển khai toàn diện các hạng mục công việc được giao, bám sát mục tiêu nội dung và vận hành kênh. Tinh thần làm việc tập trung, trách nhiệm và luôn tìm tòi phương án cải tiến chất lượng kịch bản, quay dựng.`,
        channelAnalysis: `Các chỉ số tăng trưởng (${metrics.views} views, ${metrics.followers} followers) phản ánh đúng công sức đầu tư vào kịch bản nội dung chất lượng cao, hình ảnh sắc nét và thông điệp giải quyết trúng tâm lý người xem.`,
        keyStrengths: [
          `Hoàn thành xuất sắc tiến độ quay, dựng và biên tập nội dung định kỳ cho các kênh ${metrics.activeChannels.join(', ')}.`,
          `Đạt chỉ số tương tác vượt trội (${metrics.views} view, ${metrics.followers} follow mới).`,
          `Chủ động đề xuất các giải pháp kỹ thuật và tối ưu giữ chân khán giả.`,
        ],
        bottlenecksAndLearnings: [
          `Cần rút ngắn thời gian chờ duyệt kịch bản giữa các khâu.`,
          `Tiếp tục tối ưu 3 giây đầu video để nâng cao tỷ lệ xem hết clip.`,
        ],
        nextWeekActionPlan: [
          `Bám sát lịch sản xuất kịch bản các tuyến nội dung chiến lược.`,
          `Tối ưu định dạng video ngắn kết hợp kêu gọi hành động (CTA) rõ ràng.`,
          `Chuẩn bị kỹ lưỡng kịch bản và phối hợp phòng live đạt chỉ tiêu.`,
        ],
        formattedDocument: fallbackDoc,
      };

      setAiReviewData(fallbackRev);
      setEditableDoc(fallbackDoc);
      saveReviewToStorage(fallbackRev, fallbackDoc);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to persist review locally & to backend
  const saveReviewToStorage = async (aiRev: any, docText?: string) => {
    const payload: WeeklySelfReview = {
      id: `self_review_${weekKey}`,
      weekKey,
      weekNumber,
      year,
      startDate,
      endDate,
      userBulletPoints,
      channelMetrics: metrics,
      selfScore,
      selfRating,
      aiGeneratedReview: aiRev,
      formattedDocument: docText || editableDoc || aiRev?.formattedDocument,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(localKey, JSON.stringify(payload));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

      // Push to backend
      await fetch('/api/shared/self-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekKey, review: payload }),
      });
    } catch (e) {
      console.error('Error saving review to storage:', e);
    }
  };

  const handleCopyDocument = () => {
    const textToCopy = editableDoc || aiReviewData?.formattedDocument || '';
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <TiltCard
      id="weekly-self-evaluation-section"
      glowColor="purple"
      className="p-6 md:p-8 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-purple-500/30 shadow-2xl relative overflow-hidden my-8 rounded-3xl"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10 flex-shrink-0 mt-0.5">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-xl font-black text-white tracking-tight font-display flex items-center gap-2">
                Tự Đánh Giá Bản Thân Trong Tuần
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                ✨ Trợ Lý AI Chấp Bút
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Tuần {weekNumber} ({startDate} - {endDate})
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Vạch ra các ý chính đã làm, nhập thông số tăng trưởng kênh (View, Follow, Độ phủ, Tương tác) để AI tự động soạn thảo bản nhận xét cá nhân chuyên nghiệp, chuẩn mực gửi Sếp.
            </p>
          </div>
        </div>

        {/* Self Score & Grade Badge */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-2xl">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Điểm Tự Chấm
            </div>
            <div className="text-sm font-black text-amber-300 flex items-center gap-1.5 font-display">
              <span>{selfScore}/100</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {selfRating}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs vs Output */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column (5 Cols): Inputs (Channels, Metrics, Bullets, Score) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Channel Selector Chips */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Kênh Phụ Trách Trong Tuần</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddingChannel(!isAddingChannel)}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Thêm kênh
              </button>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {POPULAR_CHANNELS.map((ch) => {
                const isSelected = metrics.activeChannels.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChannel(ch)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                      isSelected
                        ? 'bg-purple-500/25 border-purple-500/60 text-purple-200 shadow-sm shadow-purple-500/20 border'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200 border'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                    <span>{ch}</span>
                  </button>
                );
              })}
            </div>

            {/* Add Custom Channel Input */}
            {isAddingChannel && (
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-700/50">
                <input
                  type="text"
                  placeholder="Tên kênh mới (vd: Kênh Shopee Video, YouTube Short...)"
                  value={customNewChannel}
                  onChange={(e) => setCustomNewChannel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomChannel()}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomChannel}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingChannel(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 4 Core Channel Metrics Inputs */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Thông Số Tăng Trưởng Kênh Tuần Này</span>
              </label>
              <span className="text-[10px] text-slate-400">View • Follow • Độ phủ</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Views */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Lượt xem (Views)
                </span>
                <input
                  type="text"
                  value={metrics.views}
                  onChange={(e) => setMetrics({ ...metrics, views: e.target.value })}
                  placeholder="Vd: 215,000 lượt"
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Followers */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  Follow mới (Followers)
                </span>
                <input
                  type="text"
                  value={metrics.followers}
                  onChange={(e) => setMetrics({ ...metrics, followers: e.target.value })}
                  placeholder="Vd: +3,600 follow"
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-purple-300 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Reach */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  Độ phủ / Tiếp cận (Reach)
                </span>
                <input
                  type="text"
                  value={metrics.reach}
                  onChange={(e) => setMetrics({ ...metrics, reach: e.target.value })}
                  placeholder="Vd: 148,000 tài khoản"
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Engagement */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Lượt tương tác (Engagement)
                </span>
                <input
                  type="text"
                  value={metrics.engagement}
                  onChange={(e) => setMetrics({ ...metrics, engagement: e.target.value })}
                  placeholder="Vd: 18,900 tim/cmt/share"
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-rose-300 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            {/* Additional note / conversion */}
            <div className="pt-1">
              <span className="text-[11px] font-medium text-slate-300 block mb-1">
                Ghi chú thêm về chiến dịch / Chuyển đổi (Tùy chọn)
              </span>
              <input
                type="text"
                value={metrics.conversionOrOrders || ''}
                onChange={(e) => setMetrics({ ...metrics, conversionOrOrders: e.target.value })}
                placeholder="Vd: 4 video phục vụ phiên Live, 42 đơn hàng, hoàn thiện đề xuất OBS..."
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* User Bullet Points Area */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Ý Chính Tự Vạch Ra Trong Tuần</span>
              </label>
              <button
                type="button"
                onClick={handleAutoFillTasks}
                className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                title="Tự động lấy danh sách công việc đã làm trong tuần này điền vào"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Điền nhanh từ việc tuần này
              </button>
            </div>

            <textarea
              rows={5}
              value={userBulletPoints}
              onChange={(e) => setUserBulletPoints(e.target.value)}
              placeholder="Ghi ra các ý chính bạn tự đánh giá:&#10;• Khối lượng kịch bản, quay dựng đã hoàn thành&#10;• Điểm làm tốt và phản hồi của người xem trên kênh&#10;• Khó khăn, vướng mắc phát sinh&#10;• Kế hoạch và định hướng tuần tới..."
              className="w-full p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all leading-relaxed font-sans"
            />
            <p className="text-[11px] text-slate-500 italic">
              💡 Mẹo: Bạn chỉ cần gõ vài gạch đầu dòng ngắn gọn, AI sẽ tự động phân tích sâu và trau chuốt văn phong thành bản nhận xét chuẩn mực.
            </p>
          </div>

          {/* Self-Rating Slider / Input */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-200 block">Tự Chấm Điểm Bản Thân</span>
              <span className="text-[11px] text-slate-400 block">Thang điểm 100 theo nỗ lực & hiệu quả</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={60}
                max={100}
                value={selfScore}
                onChange={(e) => handleScoreChange(Number(e.target.value))}
                className="w-24 md:w-32 accent-purple-500 cursor-pointer"
              />
              <span className="font-mono font-black text-sm text-purple-300 w-12 text-right">
                {selfScore}đ
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleGenerateAIReview}
              disabled={isGenerating}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>AI Đang Phân Tích & Chấp Bút Nhận Xét...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>✨ AI Viết Nhận Xét Chuyên Nghiệp</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): AI Generated Review Display & Document */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/80 flex-1 flex flex-col">
            {/* Review Card Header with Tabs & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-bold text-white font-display">
                  Bản Nhận Xét Tuần Của AI Chấp Bút
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch Tabs */}
                <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => setActiveTab('document')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'document'
                        ? 'bg-purple-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Văn bản hoàn chỉnh
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('breakdown')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'breakdown'
                        ? 'bg-purple-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bóc tách 4 mục
                  </button>
                </div>

                {/* Edit Toggle */}
                {activeTab === 'document' && (
                  <button
                    type="button"
                    onClick={() => setIsEditingDoc(!isEditingDoc)}
                    className={`p-1.5 rounded-lg text-xs border transition-colors ${
                      isEditingDoc
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                    title={isEditingDoc ? 'Hoàn tất chỉnh sửa' : 'Chỉnh sửa văn bản trực tiếp'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopyDocument}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  title="Sao chép toàn bộ bản nhận xét"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Review Content */}
            <div className="py-4 flex-1">
              {!aiReviewData && !editableDoc ? (
                <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-700/60 rounded-2xl bg-slate-900/30">
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Chưa có bản nhận xét tuần này
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
                    Vạch ra các ý chính ở khung bên trái hoặc kiểm tra lại thông số View, Follow, sau đó bấm nút <strong className="text-purple-300">"✨ AI Viết Nhận Xét Chuyên Nghiệp"</strong> để hệ thống tự động soạn thảo.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateAIReview}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Tạo Nhận Xét Ngay
                  </button>
                </div>
              ) : activeTab === 'document' ? (
                <div className="space-y-3">
                  {isEditingDoc ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold px-1">
                        <span>Chế độ chỉnh sửa trực tiếp:</span>
                        <span>Nhớ bấm "Lưu bản đánh giá" sau khi sửa</span>
                      </div>
                      <textarea
                        rows={16}
                        value={editableDoc}
                        onChange={(e) => setEditableDoc(e.target.value)}
                        className="w-full p-4 bg-slate-900 border border-amber-500/40 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono leading-relaxed resize-y"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans space-y-3 whitespace-pre-line max-h-[500px] overflow-y-auto pr-2 custom-scrollbar select-text">
                      {editableDoc || aiReviewData?.formattedDocument}
                    </div>
                  )}
                </div>
              ) : (
                /* Breakdown 4 View Blocks */
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Block 1: Overall */}
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-1.5 uppercase tracking-wider">
                      <FileText className="w-4 h-4" />
                      <span>I. Tổng Quan Đánh Giá Bản Thân</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {aiReviewData?.overallSummary}
                    </p>
                  </div>

                  {/* Block 2: Channel Performance */}
                  <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-1.5 uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4" />
                      <span>II. Phân Tích Tăng Trưởng & Chỉ Số Kênh</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {aiReviewData?.channelAnalysis}
                    </p>
                  </div>

                  {/* Block 3: Strengths */}
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>III. Điểm Sáng & Đột Phá Đạt Được</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-200">
                      {aiReviewData?.keyStrengths?.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 mt-0.5">✦</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Block 4: Next Goals & Bottlenecks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1.5 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        <span>IV. Tồn Đọng & Khắc Phục</span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-200">
                        {aiReviewData?.bottlenecksAndLearnings?.map((b, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 mt-0.5">▲</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 mb-1.5 uppercase tracking-wider">
                        <ArrowRight className="w-4 h-4" />
                        <span>V. Kế Hoạch Tuần Tới</span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-200">
                        {aiReviewData?.nextWeekActionPlan?.map((plan, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-indigo-400 mt-0.5">➔</span>
                            <span>{plan}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Đánh giá cá nhân: <strong className="text-white">{selfRating} ({selfScore}/100)</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span>Kênh: <strong className="text-cyan-400">{metrics.activeChannels.join(', ')}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => saveReviewToStorage(aiReviewData, editableDoc)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Đã lưu lên Cloud</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-slate-400" />
                      <span>Lưu Bản Đánh Giá</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyDocument}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao Chép Để Nộp Báo Cáo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TiltCard>
  );
};
