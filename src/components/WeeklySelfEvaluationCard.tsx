import React, { useState, useEffect, useMemo } from 'react';
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
  Link as LinkIcon,
  ExternalLink,
  Video,
  Play,
  MessageSquare,
  Share2,
  Smile,
  Scissors,
  Film,
  Target,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Shield,
  Layers,
  CheckSquare,
  Printer,
  Download,
  Send,
  User as UserIcon,
} from 'lucide-react';
import { TiltCard } from './TiltCard';
import { TaskItem, WeeklySelfReview, ChannelMetrics, User, AnalyzedClip, ChannelStrategicReview } from '../types';
import {
  ScannedChannelRecord,
  BENCHMARK_BALANG_TUYENHOA,
  BENCHMARK_FAN_BALANG,
  parseNumericValue,
  getHookTips,
  getSampleHooks,
  getRecommendedTopics,
  getAvoidTopics,
  getFacialTips,
  getBodyVoiceTips,
  getEditingTips,
  getAudioVisualTips,
  getClipScore,
  getClipDate,
  getClipUrl,
  getClipHookScore,
  getClipStrengths,
  getClipWeaknesses,
  getClipHookSuggestion,
  getClipTopic,
  getClipRelevance,
  getClipActing,
  getClipFacial,
  getClipVoice,
  getClipExpressionSuggestion,
  getClipPacing,
  getClipColor,
  getClipSound,
  getClipEditSuggestion,
  getClipOverallVerdict,
  normalizeClips,
  normalizeStrategy,
  synthesizeBothChannels,
} from '../utils/channelEvaluationUtils';

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

export interface SingleChannelMetricsData {
  views: string;
  followers: string;
  reach: string;
  engagement: string;
  conversionOrOrders?: string;
  likes?: string;
  note?: string;
}

export const DEFAULT_CHANNEL_METRICS_MAP: Record<string, SingleChannelMetricsData> = {
  'TikTok Ba Làng Tuyến Hòa': {
    views: '38,500',
    followers: '+280',
    reach: '28,000',
    engagement: '3,450',
    likes: '2,860',
    conversionOrOrders: '4 video phục vụ phiên Live, hoàn thiện đề xuất OBS',
    note: 'Kênh thương hiệu chính & OCOP 4 sao (Chỉ tính phát sinh trong 7 ngày)',
  },
  'Fan Ba Làng TH': {
    views: '19,800',
    followers: '+140',
    reach: '14,500',
    engagement: '1,680',
    likes: '1,380',
    conversionOrOrders: 'Đạt chỉ tiêu đề ra',
    note: 'Kênh cộng đồng, ẩm thực đời thường & mẹo nấu ăn (Chỉ tính phát sinh trong 7 ngày)',
  },
  'ALL': {
    views: '58,300',
    followers: '+420',
    reach: '42,500',
    engagement: '5,130',
    likes: '4,240',
    conversionOrOrders: 'Hoàn thành và vượt chỉ tiêu toàn hệ thống 2 kênh trong tuần',
    note: 'Tổng hợp tăng trưởng thuần trong 7 ngày toàn bộ hệ thống 2 kênh',
  },
};

// Mẫu dữ liệu mặc định thông minh cho các tuần của Tháng 8 năm 2026 (Chỉ tính phát sinh thuần trong 7 ngày)
const DEFAULT_AUGUST_REVIEWS: Record<number, Partial<WeeklySelfReview>> = {
  32: {
    channelMetrics: {
      views: '37,000',
      followers: '+285',
      reach: '27,500',
      engagement: '3,350',
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
      views: '47,000',
      followers: '+350',
      reach: '35,500',
      engagement: '4,250',
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
      views: '58,300',
      followers: '+420',
      reach: '42,500',
      engagement: '5,130',
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
      views: '66,500',
      followers: '+510',
      reach: '49,800',
      engagement: '6,080',
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
  36: {
    channelMetrics: {
      views: '58,300',
      followers: '+420',
      reach: '42,500',
      engagement: '5,130',
      conversionOrOrders: 'Đạt chỉ tiêu đề ra, hoàn thành kịch bản sự kiện',
      activeChannels: ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH'],
      note: 'Tuần trọng tâm chuyển giao đầu tháng 9, duy trì nhịp quay dựng và phối hợp Livestream',
    },
    userBulletPoints: `• Hoàn thành bám sát các đầu việc kịch bản, quay và dựng trong tuần cho cả 2 kênh TikTok.
• Tương tác kênh duy trì ổn định, áp dụng kỹ thuật Hook thị giác và nhịp cắt dồn dập giúp cải thiện tỷ lệ giữ chân người xem.
• Phối hợp chặt chẽ cùng phòng Livestream chuẩn bị kịch bản và hỗ trợ các buổi phát sóng bán hàng.
• Tự nhận xét: Tinh thần làm việc trách nhiệm cao, năng suất ổn định, hoàn thành tốt nhiệm vụ được giao.`,
    selfScore: 90,
    selfRating: 'Xuất sắc (A)',
  },
};

// Helper tạo bản nhận xét & đề xuất thuần cho Người Xem (HOÀN TOÀN KHÔNG CÓ PHẦN PHÂN TÍCH KÊNH)
export const generateViewerSelfReviewDoc = ({
  weekNum,
  startDate,
  endDate,
  rating = 'Xuất sắc (A)',
  score = 90,
  userName = 'Trịnh Minh Đức',
  channels = ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH'],
}: {
  weekNum: number;
  startDate: string;
  endDate: string;
  rating?: string;
  score?: number;
  userName?: string;
  channels?: string[];
}): string => {
  return `BÁO CÁO TỰ ĐÁNH GIÁ CÔNG VIỆC & ĐỀ XUẤT TRONG TUẦN ${weekNum} (${startDate} - ${endDate})
Người thực hiện: ${userName} | Kênh phụ trách: ${channels.join(' & ')}
Xếp loại tự chấm: ${rating} (${score}/100)

I. TỔNG QUAN TỰ ĐÁNH GIÁ BẢN THÂN TRONG TUẦN:
Trong tuần ${weekNum}, bản thân tôi đã tập trung cao độ triển khai toàn diện các hạng mục công việc được giao, bám sát mục tiêu nội dung và kế hoạch vận hành. Tinh thần làm việc chủ động, trách nhiệm cao, bám sát các đầu việc từ lên ý tưởng, viết kịch bản đến quay và dựng hoàn thiện các video clip. Đồng thời, tôi luôn chủ động phối hợp cùng các bộ phận Livestream, Thiết kế và Bán hàng để đồng bộ thông điệp thương hiệu Ba Làng TH.

II. NHỮNG ĐIỂM SÁNG & KẾT QUẢ NỖ LỰC ĐẠT ĐƯỢC CỦA BẢN THÂN:
+ Nỗ lực hoàn thành 100% khối lượng kịch bản và tiến độ sản xuất, biên tập các video clip định kỳ theo kế hoạch tuần, đảm bảo chất lượng hình ảnh và thông điệp thương hiệu.
+ Tích cực đổi mới tư duy sáng tạo: Áp dụng các kỹ thuật Hook thị giác và nhịp cắt dồn dập giúp cải thiện tỷ lệ giữ chân khán giả và tăng thời lượng xem trung bình.
+ Phối hợp chặt chẽ cùng phòng Livestream chuẩn bị sẵn sàng kịch bản mini-game, kịch bản sự kiện và tối ưu luồng chuyển đổi khách hàng.
+ Luôn giữ vững tinh thần làm việc kỷ luật, chủ động báo cáo tiến độ và linh hoạt xử lý các tình huống phát sinh trong khâu sản xuất ngoài hiện trường.

III. NHỮNG HẠN CHẾ, TỒN ĐỌNG CỦA BẢN THÂN CẦN KHẮC PHỤC:
- Khâu phối hợp phản hồi và duyệt kịch bản giữa các bộ phận đôi khi còn bị chậm, dẫn tới việc một số buổi quay ngoại cảnh bị dồn vào nửa cuối tuần. Bản thân cần chủ động gửi kịch bản sớm hơn từ đầu tuần.
- Cần nâng cao hơn nữa kỹ năng điều phối thiết bị thu âm và ánh sáng thực tế khi ghi hình ngoài trời bãi cá, tránh phụ thuộc vào xử lý hậu kỳ.

IV. ĐỀ XUẤT & CAM KẾT HÀNH ĐỘNG TUẦN TIẾP THEO CỦA BẢN THÂN:
1. Đề xuất của bản thân:
• Đề xuất quy trình duyệt kịch bản nhanh: Thiết lập khung giờ chốt duyệt kịch bản cố định vào sáng Thứ Ba hàng tuần để các khâu quay dựng chủ động lịch trình.
• Đề xuất trang bị thêm thiết bị: Bổ sung 01 bộ lọc gió micro chuyên dụng (deadcat) và 01 đèn led phụ trợ mini phục vụ các buổi ghi hình phỏng vấn đường phố và làng nghề.
• Đề xuất cơ chế phối hợp cùng phòng Live: Thống nhất danh mục sản phẩm trọng tâm trước 48 giờ để kịp thời sản xuất 2-3 clip ngắn mồi traffic trước mỗi phiên Live.
2. Cam kết hành động tuần tới:
-> Tiếp tục bám sát và phát huy các tuyến video ngắn kết hợp kêu gọi hành động (CTA) đẩy traffic vào phiên Livestream bán hàng.
-> Lên kịch bản chi tiết theo phong cách diễn xuất mới của sếp và đội ngũ.
-> Phối hợp vận hành hạ tầng phòng Live và chuẩn bị kịch bản chương trình khuyến mãi.`;
};

// Hàm trích xuất văn bản dành riêng cho Người xem: Tự động loại bỏ Mục Phân tích kênh
export const getViewerSelfReviewDoc = (
  rawDoc: string | undefined,
  fallbackProps: {
    weekNumber: number;
    startDate: string;
    endDate: string;
    selfRating: string;
    selfScore: number;
    channels?: string[];
  }
): string => {
  if (rawDoc && rawDoc.trim().length > 60) {
    const channelSectionRegex = /II\.\s*(BÁO CÁO|PHÂN TÍCH|ĐO LƯỜNG)[\s\S]*?(?=(III\.|NHỮNG ĐIỂM SÁNG))/i;
    if (channelSectionRegex.test(rawDoc)) {
      let cleaned = rawDoc.replace(channelSectionRegex, '');
      cleaned = cleaned.replace(/III\.\s*NHỮNG ĐIỂM SÁNG/gi, 'II. NHỮNG ĐIỂM SÁNG & KẾT QUẢ NỖ LỰC ĐẠT ĐƯỢC CỦA BẢN THÂN:');
      cleaned = cleaned.replace(/IV\.\s*KHUYẾT ĐIỂM/gi, 'III. NHỮNG HẠN CHẾ, TỒN ĐỌNG CỦA BẢN THÂN CẦN KHẮC PHỤC:');
      cleaned = cleaned.replace(/V\.\s*CAM KẾT HÀNH ĐỘNG/gi, 'IV. ĐỀ XUẤT & CAM KẾT HÀNH ĐỘNG TUẦN TIẾP THEO CỦA BẢN THÂN:');
      cleaned = cleaned.replace(/BÁO CÁO TỰ ĐÁNH GIÁ CÔNG VIỆC TRONG TUẦN/g, 'BÁO CÁO TỰ ĐÁNH GIÁ CÔNG VIỆC & ĐỀ XUẤT TRONG TUẦN');
      return cleaned.trim();
    }
    return rawDoc.trim();
  }
  return generateViewerSelfReviewDoc({
    weekNum: fallbackProps.weekNumber,
    startDate: fallbackProps.startDate,
    endDate: fallbackProps.endDate,
    rating: fallbackProps.selfRating,
    score: fallbackProps.selfScore,
    channels: fallbackProps.channels,
  });
};

// Khởi tạo bản đánh giá mặc định đầy đủ cho mọi tuần, đảm bảo không bao giờ bị trắng màn hình
export const getInitialReviewData = (
  weekNum: number,
  startDate: string,
  endDate: string,
  defaultInfo: any
) => {
  const c1 = BENCHMARK_BALANG_TUYENHOA;
  const c2 = BENCHMARK_FAN_BALANG;
  const mergedMetrics: ChannelMetrics = {
    views: defaultInfo.channelMetrics?.views || '58,300',
    followers: defaultInfo.channelMetrics?.followers || '+420',
    reach: defaultInfo.channelMetrics?.reach || '42,500',
    engagement: defaultInfo.channelMetrics?.engagement || '5,130',
    conversionOrOrders: defaultInfo.channelMetrics?.conversionOrOrders || 'Đạt chỉ tiêu đề ra',
    activeChannels: defaultInfo.channelMetrics?.activeChannels || ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH'],
    note: defaultInfo.channelMetrics?.note || 'Tổng hợp phát sinh tuần cả 2 kênh',
  };

  const docCombined = generateSynthesizedChannelsReportDoc(
    c1,
    c2,
    mergedMetrics,
    defaultInfo.selfRating || 'Xuất sắc (A)',
    defaultInfo.selfScore || 90,
    weekNum,
    startDate,
    endDate
  );

  return {
    overallSummary: `Báo cáo tổng kết tuần ${weekNum}: Bản thân tôi phụ trách đồng thời 2 kênh TikTok trọng điểm (Ba Làng Tuyến Hòa & Fan Ba Làng TH). Toàn bộ khối lượng kịch bản, quay dựng đều được hoàn thành xuất sắc, đảm bảo chất lượng hình ảnh và thông điệp thương hiệu.`,
    channelAnalysis: `Tổng hợp 2 kênh đạt ${mergedMetrics.views} views, ${mergedMetrics.followers} follow mới và ${mergedMetrics.engagement} tương tác. Kênh Ba Làng Tuyến Hòa duy trì sức hút từ ẩm thực truyền thống, trong khi Fan Ba Làng TH tăng trưởng mạnh từ nội dung phỏng vấn đường phố và uy tín thương hiệu.`,
    keyStrengths: [
      `Vận hành nhịp nhàng song song cả 2 kênh TikTok đạt khối lượng kịch bản và tiến độ sản xuất 100%.`,
      `Đột phá sản xuất kịch bản và hoàn thiện dựng video giữ chân người xem tốt.`,
      `Chủ động ứng dụng các chiến lược Hook 3 giây đầu và nhịp cắt dồn dập.`,
    ],
    bottlenecksAndLearnings: [
      `Cần tối ưu thời gian phản hồi giữa các khâu duyệt kịch bản để tránh dồn lịch quay.`,
      `Tiếp tục nâng cấp âm thanh và thiết bị lọc gió khi quay ngoài trời bãi cá.`,
    ],
    nextWeekActionPlan: [
      `Đề xuất quy trình chốt duyệt kịch bản cố định sáng Thứ Ba hàng tuần.`,
      `Trang bị thêm micro lọc gió chuyên dụng và đèn mini phục vụ quay ngoại cảnh.`,
      `Phối hợp chặt chẽ cùng phòng Livestream chuẩn bị kịch bản mini-game và flash sale.`,
    ],
    formattedDocument: docCombined,
  };
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
        if (parsed.channelMetrics) {
          const m = parsed.channelMetrics;
          const fNum = parseInt(String(m.followers || '').replace(/[^\d]/g, ''), 10) || 0;
          if (fNum > 800) {
            // Dữ liệu cũ bị sai lệch (lũy kế >800 thay vì số phát sinh tuần), tự động lấy số tuần chuẩn
            return defaultData.channelMetrics as ChannelMetrics;
          }
          return m;
        }
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

  // TikTok Channel & Clip Analysis State
  const getChannelDefaultUrl = (channelName: string) => {
    if (channelName.toLowerCase().includes('tuyến hòa')) return 'https://www.tiktok.com/@balangtuyenhoa';
    if (channelName.toLowerCase().includes('fan')) return 'https://www.tiktok.com/@fanbalangth';
    if (channelName.toLowerCase().includes('huyền')) return 'https://www.tiktok.com/@sephuyenbalangth';
    return 'https://www.tiktok.com/@balangtuyenhoa';
  };

  const [selectedChannel, setSelectedChannel] = useState<string>(() => {
    return 'TikTok Ba Làng Tuyến Hòa';
  });

  const [channelLinkInput, setChannelLinkInput] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.channelMetrics?.channelLinks?.[0]?.channelUrl) {
          return parsed.channelMetrics.channelLinks[0].channelUrl;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return 'https://www.tiktok.com/@balangtuyenhoa';
  });

  // Role Access Control: Admin only for channel analysis and raw clip scanning
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'tmduc.balangth@gmail.com' || currentUser?.username === 'admin';

  // Persistent registry of scanned channels for multi-channel aggregation
  const [channelScans, setChannelScans] = useState<Record<string, ScannedChannelRecord>>(() => {
    try {
      const saved = localStorage.getItem(`weekly_channel_scans_${weekKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const fNum = parseInt(String(parsed['TikTok Ba Làng Tuyến Hòa']?.totalFollowersGained || '').replace(/[^\d]/g, ''), 10) || 0;
        if (fNum > 800) {
          // Reset về benchmark tuần chuẩn
          return {
            'TikTok Ba Làng Tuyến Hòa': BENCHMARK_BALANG_TUYENHOA,
            'Fan Ba Làng TH': BENCHMARK_FAN_BALANG,
          };
        }
        return parsed;
      }
    } catch (e) {}
    return {
      'TikTok Ba Làng Tuyến Hòa': BENCHMARK_BALANG_TUYENHOA,
      'Fan Ba Làng TH': BENCHMARK_FAN_BALANG,
    };
  });

  // Independent metrics for each channel + consolidated total
  const [activeMetricsChannel, setActiveMetricsChannel] = useState<string>('TikTok Ba Làng Tuyến Hòa');
  const [channelMetricsMap, setChannelMetricsMap] = useState<Record<string, SingleChannelMetricsData>>(() => {
    try {
      const saved = localStorage.getItem(`weekly_channel_metrics_map_${weekKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const fNum = parseInt(String(parsed['TikTok Ba Làng Tuyến Hòa']?.followers || '').replace(/[^\d]/g, ''), 10) || 0;
        if (fNum > 800) {
          // Dữ liệu cũ bị sai lệch (lũy kế >800 thay vì phát sinh tuần), dùng DEFAULT_CHANNEL_METRICS_MAP chuẩn
          return DEFAULT_CHANNEL_METRICS_MAP;
        }
        return parsed;
      }
    } catch (e) {}
    return DEFAULT_CHANNEL_METRICS_MAP;
  });

  const [isAggregatedView, setIsAggregatedView] = useState<boolean>(false);
  const [synthesizeNotice, setSynthesizeNotice] = useState<string | null>(null);

  const [clipUrlsInput, setClipUrlsInput] = useState<string>('');
  const [isAnalyzingClips, setIsAnalyzingClips] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);
  const [analysisSubTab, setAnalysisSubTab] = useState<'strategy' | 'clips'>('strategy');
  const [expandedClipId, setExpandedClipId] = useState<string | null>(null);
  const [appliedStrategyNotice, setAppliedStrategyNotice] = useState(false);
  const [copiedHookIdx, setCopiedHookIdx] = useState<number | null>(null);

  const [analyzedClips, setAnalyzedClips] = useState<AnalyzedClip[]>(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.analyzedClips?.length) return normalizeClips(parsed.analyzedClips, 'TikTok Ba Làng Tuyến Hòa');
        if (parsed.channelMetrics?.analyzedClips?.length) return normalizeClips(parsed.channelMetrics.analyzedClips, 'TikTok Ba Làng Tuyến Hòa');
      }
    } catch (e) {}
    return [];
  });

  const [channelStrategicReview, setChannelStrategicReview] = useState<ChannelStrategicReview | null>(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.channelStrategicReview) {
          return normalizeStrategy(
            parsed.channelStrategicReview,
            'TikTok Ba Làng Tuyến Hòa',
            parsed.channelMetrics?.views || '215,000',
            '18,900',
            parsed.channelMetrics?.followers || '+3,600',
            parsed.channelMetrics?.engagement || '22,400'
          );
        }
        if (parsed.channelMetrics?.channelStrategicReview) {
          return normalizeStrategy(
            parsed.channelMetrics.channelStrategicReview,
            'TikTok Ba Làng Tuyến Hòa',
            parsed.channelMetrics?.views || '215,000',
            '18,900',
            parsed.channelMetrics?.followers || '+3,600',
            parsed.channelMetrics?.engagement || '22,400'
          );
        }
      }
    } catch (e) {}
    return null;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'document' | 'breakdown' | 'tiktok'>('document');
  const [isEditingDoc, setIsEditingDoc] = useState(false);

  // States for Publishing to Viewers
  const [isPublishedForViewers, setIsPublishedForViewers] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return !!parsed.isPublishedForViewers;
      }
    } catch (e) {}
    return false;
  });
  const [publishedAt, setPublishedAt] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.publishedAt || null;
      }
    } catch (e) {}
    return null;
  });
  const [isViewerModalOpen, setIsViewerModalOpen] = useState<boolean>(false);
  const [publishSuccessNotice, setPublishSuccessNotice] = useState<string | null>(null);

  // Safety fallback for viewers: redirect away from tiktok tab if not admin
  useEffect(() => {
    if (!isAdmin && activeTab === 'tiktok') {
      setActiveTab('document');
    }
  }, [isAdmin, activeTab]);

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
    const currentDefault = DEFAULT_AUGUST_REVIEWS[weekNumber] || {
      channelMetrics: {
        views: '58,300',
        followers: '+420',
        reach: '42,500',
        engagement: '5,130',
        conversionOrOrders: 'Đạt chỉ tiêu đề ra',
        activeChannels: ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH'],
        note: '',
      },
      userBulletPoints: `• Hoàn thành bám sát các đầu việc kịch bản, quay và dựng trong tuần cho cả 2 kênh TikTok.
• Tương tác kênh duy trì ổn định và có sự cải thiện về chất lượng giữ chân người xem.
• Phối hợp hỗ trợ các bộ phận liên quan chuẩn bị lịch phát sóng và livestream.`,
      selfScore: 90,
      selfRating: 'Xuất sắc (A)',
    };
    return getInitialReviewData(weekNumber, startDate, endDate, currentDefault);
  });

  const [editableDoc, setEditableDoc] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formattedDocument) return parsed.formattedDocument;
      }
    } catch (e) {}
    const currentDefault = DEFAULT_AUGUST_REVIEWS[weekNumber] || {
      channelMetrics: {
        views: '58,300',
        followers: '+420',
        reach: '42,500',
        engagement: '5,130',
        conversionOrOrders: 'Đạt chỉ tiêu đề ra',
        activeChannels: ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH'],
        note: '',
      },
      userBulletPoints: `• Hoàn thành bám sát các đầu việc kịch bản, quay và dựng trong tuần cho cả 2 kênh TikTok.
• Tương tác kênh duy trì ổn định và có sự cải thiện về chất lượng giữ chân người xem.
• Phối hợp hỗ trợ các bộ phận liên quan chuẩn bị lịch phát sóng và livestream.`,
      selfScore: 90,
      selfRating: 'Xuất sắc (A)',
    };
    const init = getInitialReviewData(weekNumber, startDate, endDate, currentDefault);
    return init.formattedDocument || '';
  });

  // Bản Nhận Xét & Đề Xuất Tuần Của Bản Thân dành riêng cho Người xem (loại bỏ hoàn toàn phần phân tích kênh)
  const currentViewerDoc = useMemo(() => {
    return getViewerSelfReviewDoc(editableDoc || aiReviewData?.formattedDocument, {
      weekNumber,
      startDate,
      endDate,
      selfRating,
      selfScore,
      channels: metrics.activeChannels,
    });
  }, [editableDoc, aiReviewData, weekNumber, startDate, endDate, selfRating, selfScore, metrics.activeChannels]);

  // Reload when week changes
  useEffect(() => {
    try {
      const savedMap = localStorage.getItem(`weekly_channel_metrics_map_${weekKey}`);
      if (savedMap) {
        setChannelMetricsMap(JSON.parse(savedMap));
      } else {
        setChannelMetricsMap(DEFAULT_CHANNEL_METRICS_MAP);
      }
    } catch (e) {}

    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.channelMetrics) setMetrics(parsed.channelMetrics);
        if (parsed.userBulletPoints) setUserBulletPoints(parsed.userBulletPoints);
        if (parsed.selfScore) setSelfScore(parsed.selfScore);
        if (parsed.selfRating) setSelfRating(parsed.selfRating);
        if (parsed.analyzedClips) setAnalyzedClips(parsed.analyzedClips);
        else if (parsed.channelMetrics?.analyzedClips) setAnalyzedClips(parsed.channelMetrics.analyzedClips);
        if (parsed.channelStrategicReview) setChannelStrategicReview(parsed.channelStrategicReview);
        else if (parsed.channelMetrics?.channelStrategicReview) setChannelStrategicReview(parsed.channelMetrics.channelStrategicReview);
        if (parsed.channelMetrics?.channelLinks?.[0]?.channelUrl) setChannelLinkInput(parsed.channelMetrics.channelLinks[0].channelUrl);
        if (parsed.isPublishedForViewers !== undefined) setIsPublishedForViewers(!!parsed.isPublishedForViewers);
        if (parsed.publishedAt) setPublishedAt(parsed.publishedAt);

        if (parsed.formattedDocument || parsed.aiGeneratedReview) {
          const rev = {
            ...parsed.aiGeneratedReview,
            formattedDocument: parsed.formattedDocument,
          };
          setAiReviewData(rev);
          setEditableDoc(parsed.formattedDocument || '');
        } else {
          const currentDefault = DEFAULT_AUGUST_REVIEWS[weekNumber] || {
            channelMetrics: {
              views: '58,300',
              followers: '+420',
              reach: '42,500',
              engagement: '5,130',
              conversionOrOrders: 'Đạt chỉ tiêu đề ra',
              activeChannels: ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH'],
              note: '',
            },
            userBulletPoints: `• Hoàn thành bám sát các đầu việc kịch bản, quay và dựng trong tuần cho cả 2 kênh TikTok.
• Tương tác kênh duy trì ổn định và có sự cải thiện về chất lượng giữ chân người xem.
• Phối hợp hỗ trợ các bộ phận liên quan chuẩn bị lịch phát sóng và livestream.`,
            selfScore: 90,
            selfRating: 'Xuất sắc (A)',
          };
          const initRev = getInitialReviewData(weekNumber, startDate, endDate, currentDefault);
          setAiReviewData(initRev);
          setEditableDoc(initRev.formattedDocument || '');
        }
        return;
      }
    } catch (e) {
      console.error(e);
    }

    // Default template for this week
    const currentDefault = DEFAULT_AUGUST_REVIEWS[weekNumber] || {
      channelMetrics: {
        views: '58,300',
        followers: '+420',
        reach: '42,500',
        engagement: '5,130',
        conversionOrOrders: 'Đạt chỉ tiêu đề ra',
        activeChannels: ['TikTok Ba Làng Tuyến Hòa', 'Fan Ba Làng TH'],
        note: '',
      },
      userBulletPoints: `• Hoàn thành bám sát các đầu việc kịch bản, quay và dựng trong tuần cho cả 2 kênh TikTok.
• Tương tác kênh duy trì ổn định và có sự cải thiện về chất lượng giữ chân người xem.
• Phối hợp hỗ trợ các bộ phận liên quan chuẩn bị lịch phát sóng và livestream.`,
      selfScore: 90,
      selfRating: 'Xuất sắc (A)',
    };

    setMetrics(currentDefault.channelMetrics as ChannelMetrics);
    setUserBulletPoints(currentDefault.userBulletPoints || '');
    setSelfScore(currentDefault.selfScore || 90);
    setSelfRating(currentDefault.selfRating || 'Xuất sắc (A)');
    const initRev = getInitialReviewData(weekNumber, startDate, endDate, currentDefault);
    setAiReviewData(initRev);
    setEditableDoc(initRev.formattedDocument || '');
    setAnalyzedClips([]);
    setChannelStrategicReview(null);
    setIsPublishedForViewers(false);
    setPublishedAt(null);
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
            if (serverReview.analyzedClips) setAnalyzedClips(serverReview.analyzedClips);
            else if (serverReview.channelMetrics?.analyzedClips) setAnalyzedClips(serverReview.channelMetrics.analyzedClips);
            if (serverReview.channelStrategicReview) setChannelStrategicReview(serverReview.channelStrategicReview);
            else if (serverReview.channelMetrics?.channelStrategicReview) setChannelStrategicReview(serverReview.channelMetrics.channelStrategicReview);
            if (serverReview.channelMetrics?.channelLinks?.[0]?.channelUrl) setChannelLinkInput(serverReview.channelMetrics.channelLinks[0].channelUrl);
            if (serverReview.isPublishedForViewers !== undefined) setIsPublishedForViewers(!!serverReview.isPublishedForViewers);
            if (serverReview.publishedAt) setPublishedAt(serverReview.publishedAt);

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

  // Helper to switch metrics tab for specific channel
  const handleSwitchChannelMetricsTab = (targetCh: string) => {
    setActiveMetricsChannel(targetCh);
    const channelData = channelMetricsMap[targetCh] || DEFAULT_CHANNEL_METRICS_MAP[targetCh] || DEFAULT_CHANNEL_METRICS_MAP['TikTok Ba Làng Tuyến Hòa'];

    // Sync current metrics state for backward compatibility
    setMetrics((prev) => ({
      ...prev,
      views: channelData.views,
      followers: channelData.followers,
      reach: channelData.reach,
      engagement: channelData.engagement,
      conversionOrOrders: channelData.conversionOrOrders || prev.conversionOrOrders,
    }));

    if (targetCh !== 'ALL') {
      setSelectedChannel(targetCh);
      setChannelLinkInput(getChannelDefaultUrl(targetCh));
      if (channelScans[targetCh]) {
        setAnalyzedClips(channelScans[targetCh].clips || []);
        if (channelScans[targetCh].strategicReview) {
          setChannelStrategicReview(channelScans[targetCh].strategicReview);
        }
      }
    }
  };

  // Helper to update field in current active channel metric
  const handleUpdateCurrentChannelMetric = (field: keyof SingleChannelMetricsData, value: string) => {
    setChannelMetricsMap((prev) => {
      const currentCh = prev[activeMetricsChannel] || DEFAULT_CHANNEL_METRICS_MAP[activeMetricsChannel] || {
        views: '',
        followers: '',
        reach: '',
        engagement: '',
      };
      const updatedChannel = {
        ...currentCh,
        [field]: value,
      };
      const updatedMap = {
        ...prev,
        [activeMetricsChannel]: updatedChannel,
      };
      try {
        localStorage.setItem(`weekly_channel_metrics_map_${weekKey}`, JSON.stringify(updatedMap));
      } catch (e) {}
      return updatedMap;
    });

    // Also update current metrics
    setMetrics((prev) => ({
      ...prev,
      [field === 'likes' ? 'engagement' : field]: value,
    }));
  };

  // Helper to automatically sum up metrics from both channels
  const handleAutoCalculateTotalMetrics = () => {
    const c1 = channelMetricsMap['TikTok Ba Làng Tuyến Hòa'] || DEFAULT_CHANNEL_METRICS_MAP['TikTok Ba Làng Tuyến Hòa'];
    const c2 = channelMetricsMap['Fan Ba Làng TH'] || DEFAULT_CHANNEL_METRICS_MAP['Fan Ba Làng TH'];

    const parseNum = (val?: string) => {
      if (!val) return 0;
      const clean = val.replace(/[^\d]/g, '');
      return parseInt(clean, 10) || 0;
    };

    const totalViewsNum = parseNum(c1.views) + parseNum(c2.views);
    const totalFollowersNum = parseNum(c1.followers) + parseNum(c2.followers);
    const totalReachNum = parseNum(c1.reach) + parseNum(c2.reach);
    const totalEngagementNum = parseNum(c1.engagement) + parseNum(c2.engagement);
    const totalLikesNum = parseNum(c1.likes) + parseNum(c2.likes);

    const updatedAll: SingleChannelMetricsData = {
      views: totalViewsNum.toLocaleString(),
      followers: `+${totalFollowersNum.toLocaleString()}`,
      reach: totalReachNum.toLocaleString(),
      engagement: totalEngagementNum.toLocaleString(),
      likes: totalLikesNum.toLocaleString(),
      conversionOrOrders: 'Hoàn thành và vượt chỉ tiêu cả 2 kênh TikTok Ba Làng TH',
      note: 'Tổng hợp hợp nhất tự động từ Kênh Tuyến Hòa và Fan Ba Làng',
    };

    const updatedMap = {
      ...channelMetricsMap,
      ALL: updatedAll,
    };

    setChannelMetricsMap(updatedMap);
    try {
      localStorage.setItem(`weekly_channel_metrics_map_${weekKey}`, JSON.stringify(updatedMap));
    } catch (e) {}

    if (activeMetricsChannel === 'ALL') {
      setMetrics((prev) => ({
        ...prev,
        views: updatedAll.views,
        followers: updatedAll.followers,
        reach: updatedAll.reach,
        engagement: updatedAll.engagement,
        conversionOrOrders: updatedAll.conversionOrOrders,
      }));
    }
  };

  // Khôi phục bộ thông số chuẩn 1 tuần cho cả 2 kênh và tổng hợp ALL
  const handleResetToWeeklyStandardMetrics = () => {
    setChannelMetricsMap(DEFAULT_CHANNEL_METRICS_MAP);
    try {
      localStorage.setItem(`weekly_channel_metrics_map_${weekKey}`, JSON.stringify(DEFAULT_CHANNEL_METRICS_MAP));
    } catch (e) {}

    const standardScans = {
      'TikTok Ba Làng Tuyến Hòa': BENCHMARK_BALANG_TUYENHOA,
      'Fan Ba Làng TH': BENCHMARK_FAN_BALANG,
    };
    setChannelScans(standardScans);
    try {
      localStorage.setItem(`weekly_channel_scans_${weekKey}`, JSON.stringify(standardScans));
    } catch (e) {}

    const cur = DEFAULT_CHANNEL_METRICS_MAP[activeMetricsChannel] || DEFAULT_CHANNEL_METRICS_MAP['TikTok Ba Làng Tuyến Hòa'];
    setMetrics((prev) => ({
      ...prev,
      views: cur.views,
      followers: cur.followers,
      reach: cur.reach,
      engagement: cur.engagement,
      conversionOrOrders: cur.conversionOrOrders,
    }));

    if (activeMetricsChannel !== 'ALL') {
      const scan = standardScans[activeMetricsChannel as keyof typeof standardScans];
      if (scan) {
        setAnalyzedClips(scan.clips);
        setChannelStrategicReview(scan.strategicReview);
      }
    }

    setSynthesizeNotice('✓ Đã khôi phục số liệu tăng trưởng chuẩn trong 1 tuần (Tuyến Hòa: +280 follow, 38.5k view | Fan Ba Làng: +140 follow, 19.8k view | Tổng: +420 follow)!');
    setTimeout(() => setSynthesizeNotice(null), 5000);
  };

  // Select Preset Channel
  const handleSelectChannelPreset = (ch: string) => {
    setSelectedChannel(ch);
    setActiveMetricsChannel(ch); // Cực kỳ quan trọng: đồng bộ tab thông số bên dưới!
    const url = getChannelDefaultUrl(ch);
    setChannelLinkInput(url);

    const channelData = channelMetricsMap[ch] || DEFAULT_CHANNEL_METRICS_MAP[ch] || DEFAULT_CHANNEL_METRICS_MAP['TikTok Ba Làng Tuyến Hòa'];

    setMetrics((prev) => ({
      ...prev,
      views: channelData.views,
      followers: channelData.followers,
      reach: channelData.reach,
      engagement: channelData.engagement,
      conversionOrOrders: channelData.conversionOrOrders || prev.conversionOrOrders,
      activeChannels: prev.activeChannels.includes(ch) ? prev.activeChannels : [...prev.activeChannels, ch],
    }));

    if (channelScans[ch]) {
      setAnalyzedClips(channelScans[ch].clips || []);
      if (channelScans[ch].strategicReview) {
        setChannelStrategicReview(channelScans[ch].strategicReview);
      }
    }
  };

  // Analyze TikTok Channel & Clips with AI
  const handleAnalyzeChannelClips = async () => {
    setIsAnalyzingClips(true);
    setAnalysisSuccess(false);
    try {
      const res = await fetch('/api/ai/analyze-channel-clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelUrl: channelLinkInput,
          channelName: selectedChannel,
          clipUrlsText: clipUrlsInput,
          weekNumber,
          year,
          startDate,
          endDate,
          weekTasks,
        }),
      });

      if (!res.ok) {
        throw new Error('Lỗi từ server khi phân tích kênh');
      }

      const data = await res.json();
      const rawClips = data.analyzedClips || [];
      const rawStrategy = data.strategicReview || null;

      const newClips: AnalyzedClip[] = normalizeClips(rawClips, selectedChannel);
      const newStrategy: ChannelStrategicReview = normalizeStrategy(
        rawStrategy,
        selectedChannel,
        data.totalViews || metrics.views,
        data.totalLikes || '18,900',
        data.totalFollowersGained || metrics.followers,
        data.totalEngagement || metrics.engagement
      );

      setAnalyzedClips(newClips);
      setChannelStrategicReview(newStrategy);

      // Save to channel registry
      const scanRecord: ScannedChannelRecord = {
        channelName: selectedChannel,
        channelUrl: channelLinkInput,
        totalViews: data.totalViews || metrics.views,
        totalLikes: data.totalLikes || '18,900',
        totalFollowersGained: data.totalFollowersGained || metrics.followers,
        totalEngagement: data.totalEngagement || metrics.engagement,
        totalComments: data.totalComments,
        totalShares: data.totalShares,
        clips: newClips,
        strategicReview: newStrategy,
        scannedAt: new Date().toISOString(),
      };

      const updatedScans = {
        ...channelScans,
        [selectedChannel]: scanRecord,
      };
      setChannelScans(updatedScans);
      try {
        localStorage.setItem(`weekly_channel_scans_${weekKey}`, JSON.stringify(updatedScans));
      } catch (e) {}

      // Auto update channel growth metrics
      const calculatedReach = metrics.reach && metrics.reach !== 'Chưa cập nhật'
        ? metrics.reach
        : `${Math.round(parseInt((data.totalViews || '100000').replace(/,/g, '')) * 0.75).toLocaleString()} tài khoản`;

      const updatedChannelData: SingleChannelMetricsData = {
        views: data.totalViews || metrics.views,
        followers: data.totalFollowersGained || metrics.followers,
        reach: calculatedReach,
        engagement: data.totalEngagement || metrics.engagement,
        likes: data.totalLikes || '18,900',
        conversionOrOrders: channelMetricsMap[selectedChannel]?.conversionOrOrders || 'Đạt chỉ tiêu đề ra',
      };

      setChannelMetricsMap((prev) => {
        const nextMap = {
          ...prev,
          [selectedChannel]: updatedChannelData,
        };
        try {
          localStorage.setItem(`weekly_channel_metrics_map_${weekKey}`, JSON.stringify(nextMap));
        } catch (e) {}
        return nextMap;
      });

      const updatedMetrics: ChannelMetrics = {
        ...metrics,
        views: data.totalViews || metrics.views,
        followers: data.totalFollowersGained || metrics.followers,
        engagement: data.totalEngagement || metrics.engagement,
        reach: calculatedReach,
        analyzedClips: newClips,
        channelStrategicReview: newStrategy,
      };

      setMetrics(updatedMetrics);
      setActiveTab('tiktok');
      setAnalysisSubTab('strategy');
      setAnalysisSuccess(true);
      setTimeout(() => setAnalysisSuccess(false), 5000);

      // Auto-save to persistence
      saveReviewToStorage(aiReviewData, editableDoc, updatedMetrics, newClips, newStrategy);
    } catch (err) {
      console.error('Error analyzing TikTok channel clips:', err);
    } finally {
      setIsAnalyzingClips(false);
    }
  };

  // Helper tạo văn bản nhận xét hoàn chỉnh cho riêng 1 kênh
  const generateSingleChannelReportDoc = (
    channelName: string,
    scanData: any,
    metricsData: ChannelMetrics,
    rating: string,
    score: number,
    weekNum: number,
    start: string,
    end: string
  ): string => {
    const isFanChannel = channelName.includes('Fan');
    const views = scanData.totalViews || metricsData.views || (isFanChannel ? '19,800' : '38,500');
    const likes = scanData.totalLikes || (isFanChannel ? '1,380' : '2,860');
    const followers = scanData.totalFollowersGained || metricsData.followers || (isFanChannel ? '+140' : '+280');
    const engagement = scanData.totalEngagement || metricsData.engagement || (isFanChannel ? '1,680' : '3,450');
    const url = scanData.channelUrl || channelLinkInput || (isFanChannel ? 'https://www.tiktok.com/@fanbalangth' : 'https://www.tiktok.com/@balangtuyenhoa');

    const hookTip = getHookTips(scanData.strategicReview)[0] || 'Tối ưu 1.5s đầu hình ảnh nước mắm sóng sánh hoặc biểu cảm bất ngờ';
    const topicTip = getRecommendedTopics(scanData.strategicReview)[0] || 'Đẩy mạnh chuỗi series Bếp Mẹ Nấu & Giải đáp minh bạch thắc mắc khách hàng';
    const facialTip = getFacialTips(scanData.strategicReview)[0] || 'Nhìn thẳng tâm ống kính camera 1:1, nụ cười mở đầu tự tin và rạng rỡ';
    const editTip = getEditingTips(scanData.strategicReview)[0] || 'Nhịp cắt dồn dập dưới 1.5s/shot, zoom luân phiên 10-15%, âm thanh ASMR rót mắm';

    const clipsList = scanData.clips && scanData.clips.length > 0
      ? scanData.clips.slice(0, 4).map((c: any, i: number) =>
          `  ${i + 1}. [Clip] ${c.title || 'Video Content Tuần'}\n     ↳ Views: ${c.views} | Tim: ${c.likes || c.likesCount || '---'} | Đánh giá: ${c.overallVerdict || 'Giữ chân người xem tốt'}`
        ).join('\n')
      : '  • Các video content định kỳ phát hành đúng tiến độ tuần, duy trì nhịp tương tác ổn định.';

    return `BÁO CÁO TỰ ĐÁNH GIÁ CÔNG VIỆC TRONG TUẦN ${weekNum} (${start} - ${end})
Người thực hiện: Trịnh Minh Đức | Kênh phụ trách: ${channelName}
Xếp loại tự chấm: ${rating} (${score}/100)

I. TỔNG QUAN TỰ ĐÁNH GIÁ:
Trong tuần ${weekNum}, bản thân tôi đã tập trung cao độ triển khai toàn diện các hạng mục công việc được giao, bám sát mục tiêu nội dung và vận hành kênh ${channelName}. Tinh thần làm việc chủ động, trách nhiệm cao, bám sát các đầu việc từ lên ý tưởng, viết kịch bản đến quay và dựng hoàn thiện các video clip.

II. BÁO CÁO & ĐO LƯỜNG CHỈ SỐ KÊNH (TĂNG TRƯỞNG TRONG TUẦN): ${channelName.toUpperCase()}
- Kênh phụ trách: ${channelName}
- Link kênh: ${url}
- Tổng lượt xem phát sinh trong tuần (Views): ${views}
- Tổng lượt Tim (Likes): ${likes}
- Lượt Follow mới tăng trong tuần: ${followers}
- Lượt tương tác (Engagement): ${engagement}
- Độ phủ & Chuyển đổi: Tăng trưởng đều đặn, tỷ lệ giữ chân người xem cải thiện rõ nét nhờ áp dụng các hook mở màn mới.

* BÓC TÁCH CHIẾN LƯỢC KÊNH ${channelName.toUpperCase()}:
• Chiến lược Hook 3 giây đầu: ${hookTip}
• Tuyến nội dung trọng tâm: ${topicTip}
• Biểu cảm & Diễn xuất: ${facialTip}
• Kỹ thuật Edit & Dựng video: ${editTip}

* CÁC CLIP TIÊU BIỂU PHÁT HÀNH TRONG TUẦN:
${clipsList}

III. NHỮNG ĐIỂM SÁNG & ĐỘT PHÁ ĐẠT ĐƯỢC:
+ Hoàn thành xuất sắc tiến độ sản xuất nội dung, đảm bảo lịch đăng tải định kỳ trên kênh ${channelName}.
+ Đạt chỉ số tương tác tích cực với ${views} lượt xem và ${followers} follow mới trong tuần.
+ Áp dụng thành công các hook hình ảnh và kỹ thuật dựng dồn dập giúp giữ chân người xem lâu hơn.

IV. KHUYẾT ĐIỂM CẦN KHẮC PHỤC:
- Cần rút ngắn thời gian phản hồi duyệt kịch bản giữa các khâu để chủ động lịch quay ngoại cảnh.
- Tiếp tục tối ưu 2 giây đầu video để kéo giảm tỷ lệ lướt qua dưới 25%.

V. CAM KẾT HÀNH ĐỘNG TUẦN TIẾP THEO:
-> Tiếp tục tối ưu kịch bản theo tuyến nội dung giữ chân cao nhất trên ${channelName}.
-> Đẩy mạnh video ngắn kết hợp kêu gọi hành động (CTA) hướng tới các phiên Livestream bán hàng.
-> Chủ động nâng cấp chất lượng âm thanh thu âm ngoài trời và ánh sáng bối cảnh.`;
  };

  // Helper tạo văn bản nhận xét tổng hợp CẢ 2 KÊNH TIKTOK
  const generateSynthesizedChannelsReportDoc = (
    c1Scan: any,
    c2Scan: any,
    metricsData: ChannelMetrics,
    rating: string,
    score: number,
    weekNum: number,
    start: string,
    end: string
  ): string => {
    const c1Name = c1Scan.channelName || 'TikTok Ba Làng Tuyến Hòa';
    const c2Name = c2Scan.channelName || 'Fan Ba Làng TH';

    const parseNum = (val?: string) => {
      if (!val) return 0;
      return parseInt(String(val).replace(/[^\d]/g, ''), 10) || 0;
    };

    const c1Likes = c1Scan.totalLikes || '2,860';
    const c2Likes = c2Scan.totalLikes || '1,380';
    const totalLikesCalculated = (parseNum(c1Likes) + parseNum(c2Likes)).toLocaleString();

    const totalViews = metricsData.views || '58,300';
    const totalFollowers = metricsData.followers || '+420';
    const totalEngagement = metricsData.engagement || '5,130';

    const c1Views = c1Scan.totalViews || '38,500';
    const c2Views = c2Scan.totalViews || '19,800';

    return `BÁO CÁO TỰ ĐÁNH GIÁ CÔNG VIỆC TRONG TUẦN ${weekNum} (${start} - ${end})
Người thực hiện: Trịnh Minh Đức | Kênh phụ trách: ${c1Name} & ${c2Name}
Xếp loại tự chấm: ${rating} (${score}/100)

I. TỔNG QUAN TỰ ĐÁNH GIÁ:
Trong tuần ${weekNum}, bản thân tôi đã vận hành song song và phát triển nội dung cho cả 2 kênh TikTok trọng điểm của Ba Làng TH (${c1Name} và ${c2Name}). Toàn bộ khối lượng kịch bản, lịch quay và dựng hậu kỳ đều được hoàn thành đúng hạn với tinh thần trách nhiệm và cam kết chất lượng cao nhất.

II. BÁO CÁO & PHÂN TÍCH TỔNG HỢP TĂNG TRƯỞNG TRONG TUẦN CẢ 2 KÊNH TIKTOK:
1. TỔNG SỐ LIỆU TĂNG TRƯỞNG HỢP NHẤT TRONG TUẦN (7 NGÀY):
- Tổng lượt xem (Views): ${totalViews}
- Tổng lượt Tim (Likes): ${totalLikesCalculated} tim
- Tổng Follow mới tăng trong tuần: ${totalFollowers}
- Tổng tương tác: ${totalEngagement}

2. CHI TIẾT TĂNG TRƯỞNG TỪNG KÊNH TRONG TUẦN:
• KÊNH 1: ${c1Name.toUpperCase()}
  - Lượt xem: ${c1Views} | Lượt Tim: ${c1Likes} | Link: ${c1Scan.channelUrl || 'https://www.tiktok.com/@balangtuyenhoa'}
  - Trọng tâm nội dung: Ẩm thực gia đình "Bếp Mẹ Nấu", câu chuyện làng nghề mắm cá cơm truyền thống.
  - Hook 3s: Visual Hook miếng thịt luộc bốc khói dầm mắm tỏi ớt đỏ au đạt tỷ lệ giữ chân người xem tốt nhất tuần.
  - Kỹ thuật Edit: Nhịp cắt nhanh dưới 1.5s/shot, đẩy âm lượng ASMR rót mắm lên 120%.

• KÊNH 2: ${c2Name.toUpperCase()}
  - Lượt xem: ${c2Views} | Lượt Tim: ${c2Likes} | Link: ${c2Scan.channelUrl || 'https://www.tiktok.com/@fanbalangth'}
  - Trọng tâm nội dung: Phỏng vấn đường phố (Street Interview) và quy trình đóng gói kiện hàng uy tín.
  - Hook 3s: Đặt câu hỏi phỏng vấn giật tò mò ngay từ giây đầu tiên, reaction tươi tắn thân thiện.
  - Kỹ thuật Edit: Highlight từ khóa địa danh Ba Làng màu vàng nổi bật, lọc gió âm thanh ngoài trời.

III. NHỮNG ĐIỂM SÁNG & ĐỘT PHÁ ĐẠT ĐƯỢC:
+ Đảm bảo đồng thời năng suất và chất lượng cho cả 2 kênh, đạt mốc ấn tượng ${totalViews} lượt xem toàn tuần.
+ Phân hóa rõ nét phong cách nội dung giữa 2 kênh: một kênh đậm chất ẩm thực gia đình, một kênh chứng thực xã hội (Social Proof).
+ Tối ưu tỷ lệ chuyển đổi, kích thích hàng trăm bình luận hỏi mua và đặt hàng mắm Ba Làng.

IV. KHUYẾT ĐIỂM CẦN KHẮC PHỤC:
- Cần tối ưu thời gian phối hợp duyệt kịch bản giữa các bộ phận để không bị dồn lịch quay cuối tuần.
- Bổ sung mic lọc gió chuyên dụng (deadcat) khi quay phỏng vấn ngoài bờ biển Tĩnh Gia.

V. CAM KẾT HÀNH ĐỘNG TUẦN TIẾP THEO:
-> Tiếp tục phát huy các tuyến video ngắn kết hợp kêu gọi hành động (CTA) đẩy traffic vào phiên Livestream bán hàng.
-> Lên kịch bản chi tiết theo phong cách diễn xuất mới của sếp và đội ngũ.
-> Phối hợp vận hành hạ tầng phòng Live và chuẩn bị kịch bản chương trình khuyến mãi.`;
  };

  // 1. Đưa Kênh Đang Chọn Vào Bảng Đánh Giá & Chỗ Nhận Xét Báo Cáo
  const handleApplySingleChannelToEvaluation = () => {
    const channelMetricData = channelMetricsMap[selectedChannel] || DEFAULT_CHANNEL_METRICS_MAP[selectedChannel] || DEFAULT_CHANNEL_METRICS_MAP['TikTok Ba Làng Tuyến Hòa'];
    const currentScan = channelScans[selectedChannel] || {
      channelName: selectedChannel,
      channelUrl: channelLinkInput,
      totalViews: channelMetricData.views,
      totalLikes: channelMetricData.likes || (selectedChannel.includes('Fan') ? '1,380' : '2,860'),
      totalFollowersGained: channelMetricData.followers,
      totalEngagement: channelMetricData.engagement,
      clips: analyzedClips,
      strategicReview: channelStrategicReview || (selectedChannel.includes('Fan') ? BENCHMARK_FAN_BALANG.strategicReview : BENCHMARK_BALANG_TUYENHOA.strategicReview),
      scannedAt: new Date().toISOString(),
    };

    const updatedMetrics: ChannelMetrics = {
      ...metrics,
      views: channelMetricData.views || currentScan.totalViews,
      followers: channelMetricData.followers || currentScan.totalFollowersGained,
      reach: channelMetricData.reach || metrics.reach,
      engagement: channelMetricData.engagement || currentScan.totalEngagement,
      conversionOrOrders: channelMetricData.conversionOrOrders || metrics.conversionOrOrders,
      activeChannels: metrics.activeChannels.includes(selectedChannel) ? metrics.activeChannels : [...metrics.activeChannels, selectedChannel],
      analyzedClips: currentScan.clips,
      channelStrategicReview: currentScan.strategicReview,
    };

    setMetrics(updatedMetrics);
    setAnalyzedClips(currentScan.clips);
    setChannelStrategicReview(currentScan.strategicReview);

    const hookTip = getHookTips(currentScan.strategicReview)[0] || 'Tối ưu 1.5s đầu giọt mắm hổ phách';
    const topicTip = getRecommendedTopics(currentScan.strategicReview)[0] || 'Đẩy mạnh chuỗi series Bếp Mẹ Nấu';
    const facialTip = getFacialTips(currentScan.strategicReview)[0] || 'Nhìn thẳng tâm camera 1:1, nụ cười rạng rỡ';
    const editTip = getEditingTips(currentScan.strategicReview)[0] || 'Nhịp cắt dồn dập dưới 1.5s/shot, zoom luân phiên';

    const singleChannelBullet = `• ĐÁNH GIÁ KÊNH & CLIP (${selectedChannel}):
  - Chỉ số: ${updatedMetrics.views} views | ${channelMetricData.likes || currentScan.totalLikes || (selectedChannel.includes('Fan') ? '1,380' : '2,860')} tim | ${updatedMetrics.followers} follow | ${updatedMetrics.engagement} tương tác.
  - Hook 3s: ${hookTip}
  - Chủ đề: ${topicTip}
  - Biểu cảm: ${facialTip}
  - Kỹ thuật Edit: ${editTip}`;

    setUserBulletPoints((prev) => (prev ? `${prev}\n\n${singleChannelBullet}` : singleChannelBullet));

    // Sinh bản báo cáo nhận xét chi tiết đưa thẳng sang Văn bản nhận xét
    const docWithChannel = generateSingleChannelReportDoc(
      selectedChannel,
      {
        ...currentScan,
        totalViews: updatedMetrics.views,
        totalLikes: channelMetricData.likes || currentScan.totalLikes || (selectedChannel.includes('Fan') ? '1,380' : '2,860'),
        totalFollowersGained: updatedMetrics.followers,
        totalEngagement: updatedMetrics.engagement,
      },
      updatedMetrics,
      selfRating,
      selfScore,
      weekNumber,
      startDate,
      endDate
    );

    const updatedAiReview = {
      overallSummary: aiReviewData?.overallSummary || `Trong tuần ${weekNumber}, bản thân tôi đã tập trung cao độ vận hành và phát triển nội dung cho kênh ${selectedChannel}. Mọi đầu việc từ kịch bản, quay dựng đến đo lường số liệu đều được thực hiện nghiêm túc, bám sát định hướng.`,
      channelAnalysis: `Kênh ${selectedChannel} ghi nhận sự tăng trưởng ổn định trong tuần với ${currentScan.totalViews} lượt xem, ${currentScan.totalLikes || (selectedChannel.includes('Fan') ? '1,380' : '2,860')} lượt tim và ${currentScan.totalFollowersGained} follow mới. Các clip áp dụng hook thị giác và nhịp cắt dồn dập đã cải thiện rõ rệt thời lượng xem trung bình.`,
      keyStrengths: aiReviewData?.keyStrengths || [
        `Hoàn thành đúng tiến độ toàn bộ video clip cho kênh ${selectedChannel}.`,
        `Đạt ${currentScan.totalViews} lượt xem và ${currentScan.totalLikes || (selectedChannel.includes('Fan') ? '1,380' : '2,860')} lượt tim ủng hộ trong tuần.`,
        `Áp dụng hiệu quả các kỹ thuật Hook 3s và nhịp dựng mới tối ưu giữ chân người xem.`
      ],
      bottlenecksAndLearnings: aiReviewData?.bottlenecksAndLearnings || [
        `Cần đẩy nhanh hơn nữa khâu duyệt kịch bản để chủ động lịch quay.`,
        `Tiếp tục cải tiến 2 giây đầu để giảm tỷ lệ lướt qua dưới 25%.`
      ],
      nextWeekActionPlan: aiReviewData?.nextWeekActionPlan || [
        `Tiếp tục sản xuất các kịch bản theo tuyến nội dung viral cho kênh ${selectedChannel}.`,
        `Tối ưu Call-to-action (CTA) cuối video kéo traffic vào các phiên Livestream.`,
        `Nâng cấp góc máy và ánh sáng bối cảnh quay thực tế tại làng nghề.`
      ],
      formattedDocument: docWithChannel,
    };

    setAiReviewData(updatedAiReview);
    setEditableDoc(docWithChannel);

    // Chuyển sang tab Văn bản hoàn chỉnh để xem ngay
    setActiveTab('document');

    setSynthesizeNotice(`✓ Đã đưa báo cáo kênh "${selectedChannel}" sang bên chỗ Nhận Xét Báo Cáo!`);
    setTimeout(() => setSynthesizeNotice(null), 5000);

    saveReviewToStorage(updatedAiReview, docWithChannel, updatedMetrics, currentScan.clips, currentScan.strategicReview);
  };

  // 2. TỔNG HỢP BÁO CÁO CẢ 2 KÊNH VÀO ĐÁNH GIÁ & CHỖ NHẬN XÉT BÁO CÁO
  const handleSynthesizeBothChannels = () => {
    const c1Data = channelMetricsMap['TikTok Ba Làng Tuyến Hòa'] || DEFAULT_CHANNEL_METRICS_MAP['TikTok Ba Làng Tuyến Hòa'];
    const c2Data = channelMetricsMap['Fan Ba Làng TH'] || DEFAULT_CHANNEL_METRICS_MAP['Fan Ba Làng TH'];
    const allData = channelMetricsMap['ALL'] || DEFAULT_CHANNEL_METRICS_MAP['ALL'];

    const c1Base = channelScans['TikTok Ba Làng Tuyến Hòa'] || BENCHMARK_BALANG_TUYENHOA;
    const c2Base = channelScans['Fan Ba Làng TH'] || BENCHMARK_FAN_BALANG;

    const c1 = {
      ...c1Base,
      totalViews: c1Data.views || c1Base.totalViews,
      totalLikes: c1Data.likes || c1Base.totalLikes,
      totalFollowersGained: c1Data.followers || c1Base.totalFollowersGained,
      totalEngagement: c1Data.engagement || c1Base.totalEngagement,
    };

    const c2 = {
      ...c2Base,
      totalViews: c2Data.views || c2Base.totalViews,
      totalLikes: c2Data.likes || c2Base.totalLikes,
      totalFollowersGained: c2Data.followers || c2Base.totalFollowersGained,
      totalEngagement: c2Data.engagement || c2Base.totalEngagement,
    };

    const synthesized = synthesizeBothChannels(c1, c2, weekNumber, startDate, endDate);

    const mergedMetrics: ChannelMetrics = {
      ...synthesized.updatedMetrics,
      views: allData.views || synthesized.updatedMetrics.views,
      followers: allData.followers || synthesized.updatedMetrics.followers,
      reach: allData.reach || synthesized.updatedMetrics.reach,
      engagement: allData.engagement || synthesized.updatedMetrics.engagement,
      conversionOrOrders: allData.conversionOrOrders || 'Hoàn thành chỉ tiêu cả 2 kênh',
    };

    setMetrics(mergedMetrics);
    setAnalyzedClips(synthesized.combinedClips);
    setChannelStrategicReview(synthesized.combinedStrategy);
    setUserBulletPoints(synthesized.synthesizedBullets);
    setIsAggregatedView(true);

    const docCombined = generateSynthesizedChannelsReportDoc(
      c1,
      c2,
      mergedMetrics,
      selfRating,
      selfScore,
      weekNumber,
      startDate,
      endDate
    );

    const combinedAiReview = {
      overallSummary: aiReviewData?.overallSummary || `Báo cáo tổng kết tuần ${weekNumber}: Bản thân tôi phụ trách đồng thời 2 kênh TikTok trọng điểm (Ba Làng Tuyến Hòa & Fan Ba Làng TH). Toàn bộ khối lượng kịch bản, quay dựng đều được hoàn thành xuất sắc, đảm bảo chất lượng hình ảnh và thông điệp thương hiệu.`,
      channelAnalysis: `Tổng hợp 2 kênh đạt ${synthesized.updatedMetrics.views} views, ${synthesized.updatedMetrics.followers} follow mới và ${synthesized.updatedMetrics.engagement} tương tác. Kênh Ba Làng Tuyến Hòa duy trì sức hút từ ẩm thực truyền thống, trong khi Fan Ba Làng TH tăng trưởng mạnh từ nội dung phỏng vấn đường phố và uy tín thương hiệu.`,
      keyStrengths: [
        `Vận hành nhịp nhàng song song cả 2 kênh TikTok đạt tổng ${synthesized.updatedMetrics.views} lượt xem.`,
        `Đột phá sản xuất kịch bản và hoàn thiện dựng video giữ chân người xem tốt.`,
        `Chủ động ứng dụng các chiến lược Hook 3 giây đầu và nhịp cắt dồn dập.`
      ],
      bottlenecksAndLearnings: [
        `Cần tối ưu thời gian phản hồi giữa các khâu duyệt kịch bản để tránh dồn lịch quay.`,
        `Tiếp tục nâng cấp âm thanh và thiết bị lọc gió khi quay ngoài trời bãi cá.`
      ],
      nextWeekActionPlan: [
        `Đẩy mạnh tuyến kịch bản Bếp Mẹ Nấu trên kênh Ba Làng Tuyến Hòa.`,
        `Phát triển thêm series Social Proof và hậu trường đóng hàng trên kênh Fan Ba Làng TH.`,
        `Phối hợp chặt chẽ cùng phòng Livestream chuẩn bị kịch bản mini-game và flash sale.`
      ],
      formattedDocument: docCombined,
    };

    setAiReviewData(combinedAiReview);
    setEditableDoc(docCombined);

    // Chuyển sang tab Văn bản hoàn chỉnh để xem ngay
    setActiveTab('document');

    setSynthesizeNotice(`🎉 Đã tổng hợp thành công báo cáo cả 2 kênh sang bên chỗ Nhận Xét Báo Cáo!`);
    setTimeout(() => setSynthesizeNotice(null), 5000);

    saveReviewToStorage(
      combinedAiReview,
      docCombined,
      synthesized.updatedMetrics,
      synthesized.combinedClips,
      synthesized.combinedStrategy
    );
  };

  // Apply Strategy into User Bullet Points
  const handleApplyStrategyToBullets = () => {
    if (!channelStrategicReview && analyzedClips.length === 0) return;
    const bulletToAdd = `• Đánh giá Kênh & Clip (${selectedChannel}):
  - Hook 3s: Cần đưa visual hook (giọt mắm sóng sánh/thịt luộc) lên 1.5s đầu; rút gọn câu thoại mở đầu dưới 2.5s.
  - Chủ đề: Tiếp tục tuyến "Bếp Mẹ Nấu" và "Giải đáp độ mặn tự nhiên", tránh bài nói thuần kỹ thuật.
  - Biểu cảm: Cười tươi hơn ở 2s đầu, nhìn thẳng tâm camera tạo kết nối 1:1, giọng nhấn mạnh từ khóa đậm đà.
  - Kỹ thuật Edit: Cắt tỉa dead air dồn dập dưới 1.5s/shot, zoom luân phiên 10-15%, tăng độ ấm màu mắm hổ phách.`;

    setUserBulletPoints((prev) => (prev ? `${prev}\n${bulletToAdd}` : bulletToAdd));
    setAppliedStrategyNotice(true);
    setTimeout(() => setAppliedStrategyNotice(false), 3000);
  };

  const handleCopySingleHook = (hookText: string, idx: number) => {
    navigator.clipboard.writeText(hookText);
    setCopiedHookIdx(idx);
    setTimeout(() => setCopiedHookIdx(null), 2000);
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
          channelMetrics: {
            ...metrics,
            analyzedClips,
            channelStrategicReview,
          },
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
  const saveReviewToStorage = async (
    aiRev: any,
    docText?: string,
    currentMetrics?: ChannelMetrics,
    clips?: AnalyzedClip[],
    strat?: ChannelStrategicReview | null,
    isPublished?: boolean,
    publishedTimestamp?: string,
    docAuthor?: string
  ) => {
    const activeClips = clips !== undefined ? clips : analyzedClips;
    const activeStrat = strat !== undefined ? strat : channelStrategicReview;
    const useMetrics = currentMetrics || metrics;
    const isPub = isPublished !== undefined ? isPublished : isPublishedForViewers;
    const pubAt = publishedTimestamp !== undefined ? publishedTimestamp : publishedAt;

    const payload: WeeklySelfReview = {
      id: `self_review_${weekKey}`,
      weekKey,
      weekNumber,
      year,
      startDate,
      endDate,
      userBulletPoints,
      channelMetrics: {
        ...useMetrics,
        channelLinks: [
          {
            channelName: selectedChannel,
            channelUrl: channelLinkInput,
            clipUrlsText: clipUrlsInput,
            lastScannedAt: new Date().toISOString(),
          },
        ],
        analyzedClips: activeClips,
        channelStrategicReview: activeStrat || undefined,
      },
      selfScore,
      selfRating,
      aiGeneratedReview: aiRev,
      formattedDocument: docText || editableDoc || aiRev?.formattedDocument,
      channelStrategicReview: activeStrat || undefined,
      analyzedClips: activeClips,
      isPublishedForViewers: isPub,
      publishedAt: pubAt || undefined,
      publishedBy: docAuthor || currentUser?.name || 'Trịnh Minh Đức (Quản trị viên)',
      viewerDocument: docText || editableDoc || aiRev?.formattedDocument,
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

  // 3. XUẤT BÁO CÁO CHO NGƯỜI XEM (Viewer Mode)
  const handlePublishReportForViewers = async () => {
    let docContent = editableDoc || aiReviewData?.formattedDocument;
    
    // Nếu chưa có văn bản thì tự động sinh từ dữ liệu hiện tại
    if (!docContent || docContent.trim().length === 0) {
      docContent = generateSingleChannelReportDoc(
        selectedChannel,
        channelScans[selectedChannel] || {
          channelName: selectedChannel,
          channelUrl: channelLinkInput,
          totalViews: metrics.views,
          totalLikes: '18,900',
          totalFollowersGained: metrics.followers,
          totalEngagement: metrics.engagement,
          clips: analyzedClips,
          strategicReview: channelStrategicReview || BENCHMARK_BALANG_TUYENHOA.strategicReview,
          scannedAt: new Date().toISOString(),
        },
        metrics,
        selfRating,
        selfScore,
        weekNumber,
        startDate,
        endDate
      );
      setEditableDoc(docContent);
    }

    const now = new Date().toISOString();
    setIsPublishedForViewers(true);
    setPublishedAt(now);

    const reviewObj = aiReviewData ? {
      ...aiReviewData,
      formattedDocument: docContent,
    } : {
      overallSummary: `Báo cáo tự đánh giá tuần ${weekNumber} của Trịnh Minh Đức.`,
      channelAnalysis: `Tổng lượt xem: ${metrics.views}, Follow mới: ${metrics.followers}, Tương tác: ${metrics.engagement}.`,
      keyStrengths: [`Hoàn thành tiến độ các kênh phụ trách: ${metrics.activeChannels.join(', ')}`],
      bottlenecksAndLearnings: [`Tiếp tục nâng cao chất lượng nội dung và giữ chân người xem.`],
      nextWeekActionPlan: [`Tập trung các tuyến kịch bản trọng tâm tuần tới.`],
      formattedDocument: docContent,
    };
    setAiReviewData(reviewObj);

    await saveReviewToStorage(
      reviewObj,
      docContent,
      metrics,
      analyzedClips,
      channelStrategicReview,
      true,
      now,
      currentUser?.name || 'Trịnh Minh Đức (Quản trị viên)'
    );

    setPublishSuccessNotice(`🎉 Đã xuất bản báo cáo Tuần ${weekNumber} thành công sang bản cho Người xem!`);
    setTimeout(() => setPublishSuccessNotice(null), 5000);
    setIsViewerModalOpen(true);
  };

  // 4. HỦY XUẤT BẢN CHO NGƯỜI XEM (Chuyển về bản nội bộ Admin)
  const handleUnpublishReport = async () => {
    setIsPublishedForViewers(false);
    setPublishedAt(null);
    await saveReviewToStorage(
      aiReviewData,
      editableDoc,
      metrics,
      analyzedClips,
      channelStrategicReview,
      false,
      undefined
    );
    setPublishSuccessNotice(`Đã chuyển báo cáo về trạng thái dự thảo riêng của Quản trị viên.`);
    setTimeout(() => setPublishSuccessNotice(null), 3000);
  };

  // 5. TẢI FILE BÁO CÁO DẠNG VĂN BẢN (.txt)
  const handleDownloadTxtReport = () => {
    const content = (!isAdmin ? currentViewerDoc : (editableDoc || aiReviewData?.formattedDocument)) || '';
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ban_Nhan_Xet_De_Xuat_Tuan_${weekNumber}_TrinhMinhDuc.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 6. IN BÁO CÁO / XUẤT PDF
  const handlePrintReport = () => {
    window.print();
  };

  const handleCopyDocument = () => {
    const textToCopy = (!isAdmin ? currentViewerDoc : (editableDoc || aiReviewData?.formattedDocument)) || '';
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
        {/* Left Column (5 Cols): Inputs (Admin) OR Profile & Proposals (Viewer) */}
        <div className="lg:col-span-5 space-y-5">
          {!isAdmin ? (
            /* ================= VIEWER MODE: PROFILE & KEY PROPOSALS (HOÀN TOÀN KHÔNG CÓ PHÂN TÍCH KÊNH) ================= */
            <div className="space-y-4">
              {/* Personnel Profile Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900 border border-purple-500/30 shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 flex-shrink-0 shadow-lg shadow-purple-500/20">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-purple-300" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Trịnh Minh Đức</h4>
                    <p className="text-xs text-slate-400">Chuyên viên Kịch bản & Sáng tạo Kênh</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        {selfRating}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        {selfScore}/100 Điểm
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Kỳ đánh giá:</span>
                    <strong className="text-slate-200">Tuần {weekNumber} ({startDate} - {endDate})</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Kênh phụ trách:</span>
                    <strong className="text-cyan-300">{metrics.activeChannels.join(' & ')}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Chế độ báo cáo:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Nhận xét & đề xuất tuần của bản thân
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Bullet Points */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ý Chính Tự Vạch Ra & Đánh Giá Nỗ Lực</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {userBulletPoints || '• Bám sát các mục tiêu kịch bản và tiến độ sản xuất tuần.\n• Chủ động phối hợp cùng phòng Livestream và bán hàng.'}
                </div>
              </div>

              {/* Key Proposals Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>3 Đề Xuất Trọng Tâm Của Bản Thân</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">1.</span>
                    <span><strong>Quy trình duyệt:</strong> Cố định khung chốt kịch bản vào sáng Thứ Ba hàng tuần để các khâu quay dựng chủ động.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">2.</span>
                    <span><strong>Trang bị thiết bị:</strong> Bổ sung 01 bộ lọc gió micro chuyên dụng (deadcat) và 01 đèn mini cho cảnh quay ngoài trời.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">3.</span>
                    <span><strong>Phối hợp Livestream:</strong> Thống nhất danh mục sản phẩm trước 48h để sản xuất 2-3 clip ngắn mồi traffic trước phiên Live.</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions for Viewer */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsViewerModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98]"
                >
                  <Eye className="w-4 h-4" />
                  <span>Mở Toàn Màn Hình Bản Nhận Xét & Đề Xuất</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyDocument}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{copied ? 'Đã Chép!' : 'Sao Chép'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTxtReport}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tải File .txt</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ================= ADMIN MODE: FULL CONTROLS & EDITORS ================= */
            <>
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

          {/* Ném Link Kênh TikTok & Quét Clip Bằng AI (Admin Only) */}
          {isAdmin ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/40 space-y-3 relative overflow-hidden shadow-lg shadow-purple-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Ném Link Kênh TikTok & Quét Clip Tuần</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Shield className="w-2.5 h-2.5" />
                        Admin Only
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Ném link kênh để AI vào xem, bóc tách chuẩn Follow, Tim, Views & chiến lược
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick 2 TikTok Channels Selector with Scan Status */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectChannelPreset('TikTok Ba Làng Tuyến Hòa')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 text-[11px] ${
                    selectedChannel === 'TikTok Ba Làng Tuyến Hòa'
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Ba Làng Tuyến Hòa</span>
                  {channelScans['TikTok Ba Làng Tuyến Hòa'] && (
                    <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-500/30 text-emerald-200 font-bold">
                      ✓ Đã quét
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectChannelPreset('Fan Ba Làng TH')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 text-[11px] ${
                    selectedChannel === 'Fan Ba Làng TH'
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Fan Ba Làng TH</span>
                  {channelScans['Fan Ba Làng TH'] && (
                    <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-500/30 text-emerald-200 font-bold">
                      ✓ Đã quét
                    </span>
                  )}
                </button>
              </div>

              {/* Channel Link Input Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1 font-medium">
                    <LinkIcon className="w-3 h-3 text-pink-400" />
                    Link Kênh TikTok:
                  </span>
                  {channelLinkInput && (
                    <a
                      href={channelLinkInput}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                    >
                      <span>Mở kênh</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://www.tiktok.com/@balangtuyenhoa"
                    value={channelLinkInput}
                    onChange={(e) => setChannelLinkInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 pr-8 font-mono text-[11px]"
                  />
                  {channelLinkInput && (
                    <button
                      type="button"
                      onClick={() => setChannelLinkInput('')}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                      title="Xóa link"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Optional Clip Links input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1 font-medium">
                    <Film className="w-3 h-3 text-cyan-400" />
                    Link clip đã đăng trong tuần (Tùy chọn):
                  </span>
                  <span className="text-[10px] text-slate-500">Mỗi link 1 dòng</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Dán link các video clip đã đăng trong tuần (hoặc để trống để AI tự quét toàn bộ clip tuần qua)..."
                  value={clipUrlsInput}
                  onChange={(e) => setClipUrlsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none font-mono text-[11px]"
                />
              </div>

              {/* CTA Trigger Button */}
              <div className="pt-1">
                <button
                  type="button"
                  disabled={isAnalyzingClips || !channelLinkInput.trim()}
                  onClick={handleAnalyzeChannelClips}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
                >
                  {isAnalyzingClips ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-pink-200" />
                      <span>AI Đang Quét Kênh & Đánh Giá Từng Clip...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-pink-300 group-hover:rotate-12 transition-transform" />
                      <span>⚡ Quét Kênh & Bóc Tách Chi Tiết Từng Clip</span>
                    </>
                  )}
                </button>
              </div>

              {/* ACTION BUTTONS: Apply to Evaluation Table (Single or Aggregate 2 Channels) */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">
                  🎯 Đưa Kết Quả Sang Bảng Đánh Giá:
                </span>
                
                <div className="grid grid-cols-1 gap-2">
                  {/* Option A: Single Channel */}
                  <button
                    type="button"
                    onClick={handleApplySingleChannelToEvaluation}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-between transition-all"
                    title={`Đưa riêng số liệu và chiến lược của kênh ${selectedChannel} sang bảng đánh giá`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Đưa riêng kênh: <strong>{selectedChannel}</strong></span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Chỉ kênh này</span>
                  </button>

                  {/* Option B: AGGREGATE BOTH CHANNELS (User Request) */}
                  <button
                    type="button"
                    onClick={handleSynthesizeBothChannels}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-700 hover:from-purple-600 hover:via-indigo-600 hover:to-pink-600 border border-purple-400/50 text-white text-xs font-black shadow-lg shadow-purple-700/30 flex items-center justify-between transition-all group"
                    title="Tổng hợp gộp dữ liệu Views, Tim, Followers và chiến lược của CẢ 2 KÊNH TikTok vào bản đánh giá"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                      <span>📊 TỔNG HỢP BÁO CÁO CẢ 2 KÊNH TIKTOK</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-white/20 text-white font-bold uppercase tracking-wider">
                      Khuyên dùng
                    </span>
                  </button>
                </div>
              </div>

              {/* Status Notice / Alerts */}
              {publishSuccessNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-xs text-emerald-200 flex items-start gap-2 shadow-inner">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{publishSuccessNotice}</div>
                </div>
              )}

              {synthesizeNotice && (
                <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/50 text-xs text-purple-200 flex items-start gap-2 shadow-inner">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{synthesizeNotice}</div>
                </div>
              )}

              {analysisSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Đã phân tích {analyzedClips.length} clip & cập nhật chỉ số!
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tiktok')}
                    className="underline font-bold hover:text-emerald-200 ml-2"
                  >
                    Xem chi tiết
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* VIEWER MODE: Channel Analysis Hidden with Clear Status */
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-300">
                <Shield className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white">
                  Báo Cáo Đánh Giá Kênh TikTok (Chế Độ Người Xem)
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Mục ném link và bóc tách chuyên sâu từng clip chỉ mở cho Quản trị viên (Admin). Bạn đang xem kết quả báo cáo tăng trưởng và đánh giá tổng hợp chính thức được tổng hợp từ cả 2 kênh TikTok.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-200 flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Kênh 1: TikTok Ba Làng Tuyến Hòa</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-200 flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Kênh 2: Fan Ba Làng TH</span>
                </span>
              </div>
            </div>
          )}

          {/* 4 Core Channel Metrics Inputs - Multi-channel tabs */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3.5">
            {/* Header with channel indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-700/60">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  Thông Số Tăng Trưởng Kênh
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {activeMetricsChannel === 'ALL'
                    ? '📊 Hợp Nhất 2 Kênh'
                    : activeMetricsChannel === 'Fan Ba Làng TH'
                    ? 'Kênh Fan Ba Làng'
                    : 'Kênh Tuyến Hòa'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Phân tách độc lập theo từng kênh
              </span>
            </div>

            {/* Channel Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => handleSwitchChannelMetricsTab('TikTok Ba Làng Tuyến Hòa')}
                className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 text-[11px] ${
                  activeMetricsChannel === 'TikTok Ba Làng Tuyến Hòa'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Ba Làng Tuyến Hòa</span>
                <span className="px-1 py-0.2 rounded text-[9px] bg-black/30 text-white font-mono">
                  {channelMetricsMap['TikTok Ba Làng Tuyến Hòa']?.views || '38.5k'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchChannelMetricsTab('Fan Ba Làng TH')}
                className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 text-[11px] ${
                  activeMetricsChannel === 'Fan Ba Làng TH'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Fan Ba Làng TH</span>
                <span className="px-1 py-0.2 rounded text-[9px] bg-black/30 text-white font-mono">
                  {channelMetricsMap['Fan Ba Làng TH']?.views || '19.8k'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchChannelMetricsTab('ALL')}
                className={`py-1.5 px-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 text-[11px] ${
                  activeMetricsChannel === 'ALL'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📊 Tổng 2 Kênh</span>
                <span className="px-1 py-0.2 rounded text-[9px] bg-black/30 text-white font-mono">
                  {channelMetricsMap['ALL']?.views || '58.3k'}
                </span>
              </button>
            </div>

            {/* Active Channel Details Bar & Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px]">
              <div className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  Đang xem: <strong className="text-white">{activeMetricsChannel === 'ALL' ? 'Tổng Hợp Cả 2 Kênh (7 Ngày)' : `${activeMetricsChannel} (Phát sinh tuần)`}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetToWeeklyStandardMetrics}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-cyan-300 font-medium flex items-center gap-1 transition-all"
                  title="Khôi phục thông số tăng trưởng chuẩn trong 1 tuần (Tuyến Hòa: +280 follow, Fan Ba Làng: +140 follow)"
                >
                  <RotateCcw className="w-2.5 h-2.5 text-cyan-400" />
                  <span>🔄 Số Chuẩn Tuần</span>
                </button>
                <button
                  type="button"
                  onClick={handleAutoCalculateTotalMetrics}
                  className="px-2 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold flex items-center gap-1 transition-all"
                  title="Tự động cộng dồn số liệu tuần từ Kênh Tuyến Hòa và Fan Ba Làng"
                >
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  <span>⚡ Tính Tổng 2 Kênh</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Views */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Lượt xem trong tuần (Views)
                </span>
                <input
                  type="text"
                  value={channelMetricsMap[activeMetricsChannel]?.views ?? metrics.views}
                  onChange={(e) => handleUpdateCurrentChannelMetric('views', e.target.value)}
                  placeholder={activeMetricsChannel === 'Fan Ba Làng TH' ? 'Vd: 19,800' : (activeMetricsChannel === 'ALL' ? 'Vd: 58,300' : 'Vd: 38,500')}
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Followers with quick chips */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  Follow tăng trong tuần (Followers)
                </span>
                <input
                  type="text"
                  value={channelMetricsMap[activeMetricsChannel]?.followers ?? metrics.followers}
                  onChange={(e) => handleUpdateCurrentChannelMetric('followers', e.target.value)}
                  placeholder={activeMetricsChannel === 'Fan Ba Làng TH' ? 'Vd: +140' : (activeMetricsChannel === 'ALL' ? 'Vd: +420' : 'Vd: +280')}
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-purple-300 focus:outline-none focus:border-purple-500 transition-colors"
                />
                {/* Quick Select Chips */}
                <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                  <span className="text-[9px] text-slate-400">Chọn nhanh:</span>
                  {(activeMetricsChannel === 'Fan Ba Làng TH'
                    ? ['+100', '+120', '+140', '+160', '+180']
                    : activeMetricsChannel === 'ALL'
                    ? ['+300', '+370', '+420', '+480', '+530']
                    : ['+200', '+250', '+280', '+320', '+350']
                  ).map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleUpdateCurrentChannelMetric('followers', chip)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${
                        (channelMetricsMap[activeMetricsChannel]?.followers || '').includes(chip.replace('+', ''))
                          ? 'bg-purple-600/40 border-purple-400 text-white font-bold'
                          : 'bg-slate-900 border-slate-700/60 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reach */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  Độ phủ trong tuần (Reach)
                </span>
                <input
                  type="text"
                  value={channelMetricsMap[activeMetricsChannel]?.reach ?? metrics.reach}
                  onChange={(e) => handleUpdateCurrentChannelMetric('reach', e.target.value)}
                  placeholder={activeMetricsChannel === 'Fan Ba Làng TH' ? 'Vd: 14,500' : (activeMetricsChannel === 'ALL' ? 'Vd: 42,500' : 'Vd: 28,000')}
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Engagement */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Lượt tương tác tuần (Engagement)
                </span>
                <input
                  type="text"
                  value={channelMetricsMap[activeMetricsChannel]?.engagement ?? metrics.engagement}
                  onChange={(e) => handleUpdateCurrentChannelMetric('engagement', e.target.value)}
                  placeholder={activeMetricsChannel === 'Fan Ba Làng TH' ? 'Vd: 1,680' : (activeMetricsChannel === 'ALL' ? 'Vd: 5,130' : 'Vd: 3,450')}
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-rose-300 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            {/* Additional note / conversion */}
            <div className="pt-1">
              <span className="text-[11px] font-medium text-slate-300 block mb-1">
                Ghi chú thêm về chiến dịch / Chuyển đổi ({activeMetricsChannel === 'ALL' ? 'Toàn bộ 2 kênh' : activeMetricsChannel})
              </span>
              <input
                type="text"
                value={channelMetricsMap[activeMetricsChannel]?.conversionOrOrders ?? (metrics.conversionOrOrders || '')}
                onChange={(e) => handleUpdateCurrentChannelMetric('conversionOrOrders', e.target.value)}
                placeholder={
                  activeMetricsChannel === 'Fan Ba Làng TH'
                    ? 'Vd: Đạt chỉ tiêu đề ra, video mẹo nấu ăn giữ chân tốt'
                    : 'Vd: 4 video phục vụ phiên Live, hoàn thiện đề xuất OBS...'
                }
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Quick comparison between the 2 channels */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[10px] space-y-1.5">
              <div className="text-slate-400 font-semibold flex items-center justify-between">
                <span>Đối sánh tăng trưởng 2 kênh TikTok trong 1 tuần (7 ngày):</span>
                <span className="text-cyan-400">Click ô để chuyển kênh</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <div
                  onClick={() => handleSwitchChannelMetricsTab('TikTok Ba Làng Tuyến Hòa')}
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    activeMetricsChannel === 'TikTok Ba Làng Tuyến Hòa'
                      ? 'bg-pink-950/40 border-pink-500/50 text-pink-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold truncate text-[10px] text-slate-200">1. Ba Làng Tuyến Hòa</div>
                  <div className="font-mono text-[10px] text-cyan-300 mt-0.5">
                    {channelMetricsMap['TikTok Ba Làng Tuyến Hòa']?.views || '38,500'} view
                  </div>
                  <div className="font-mono text-[10px] text-emerald-300 font-bold">
                    {channelMetricsMap['TikTok Ba Làng Tuyến Hòa']?.followers || '+280'} follow/tuần
                  </div>
                </div>
                <div
                  onClick={() => handleSwitchChannelMetricsTab('Fan Ba Làng TH')}
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    activeMetricsChannel === 'Fan Ba Làng TH'
                      ? 'bg-purple-950/40 border-purple-500/50 text-purple-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold truncate text-[10px] text-slate-200">2. Fan Ba Làng TH</div>
                  <div className="font-mono text-[10px] text-purple-300 mt-0.5">
                    {channelMetricsMap['Fan Ba Làng TH']?.views || '19,800'} view
                  </div>
                  <div className="font-mono text-[10px] text-emerald-300 font-bold">
                    {channelMetricsMap['Fan Ba Làng TH']?.followers || '+140'} follow/tuần
                  </div>
                </div>
                <div
                  onClick={() => handleSwitchChannelMetricsTab('ALL')}
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    activeMetricsChannel === 'ALL'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold truncate text-[10px] text-emerald-300">📊 Tổng 2 Kênh</div>
                  <div className="font-mono text-[10px] text-cyan-300 mt-0.5">
                    {channelMetricsMap['ALL']?.views || '58,300'} view
                  </div>
                  <div className="font-mono text-[10px] text-emerald-300 font-bold">
                    {channelMetricsMap['ALL']?.followers || '+420'} follow/tuần
                  </div>
                </div>
              </div>
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
        </>
      )}
    </div>

        {/* Right Column (7 Cols): AI Generated Review Display & Document */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/80 flex-1 flex flex-col">
            {/* Review Card Header with Tabs & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-bold text-white font-display">
                  Bản Nhận Xét & Đề Xuất Tuần Của Bản Thân
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
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('tiktok')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        activeTab === 'tiktok'
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow'
                          : 'text-pink-300/80 hover:text-pink-200'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 text-pink-400" />
                      <span>🎯 Phân Tích Kênh & Clip (Admin)</span>
                      {analyzedClips.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-pink-500/30 text-pink-200 font-bold">
                          {analyzedClips.length}
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {/* Edit Toggle (Admin Only) */}
                {isAdmin && activeTab === 'document' && (
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

                {/* View / Preview Viewer Version Button */}
                <button
                  type="button"
                  onClick={() => setIsViewerModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                  title="Mở giao diện bản báo cáo trang trọng dành cho Người xem & Ban giám đốc"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Bản Người Xem</span>
                </button>

                {/* Publish to Viewers Button (Admin Only) */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handlePublishReportForViewers}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-all active:scale-95 border border-emerald-400/40"
                    title="Xuất bản chính thức báo cáo tuần này sang bản cho Người xem & Ban Giám Đốc"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isPublishedForViewers ? 'Cập Nhật Bản Người Xem' : '🚀 Xuất Báo Cáo Cho Người Xem'}</span>
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
              {activeTab === 'tiktok' ? (
                <div className="space-y-4 max-h-[540px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Top Stats Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-950/30 via-slate-900 to-purple-950/30 border border-pink-500/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Tổng Hợp Kênh: {selectedChannel}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {channelLinkInput}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Button 1: Đưa Báo Cáo Kênh Này Sang Nhận Xét */}
                        <button
                          type="button"
                          onClick={handleApplySingleChannelToEvaluation}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 border border-pink-400/50 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-md shadow-pink-600/20 transition-all active:scale-95"
                          title="Đưa toàn bộ số liệu và phân tích kênh này sang bên chỗ Nhận Xét Báo Cáo"
                        >
                          <FileText className="w-3.5 h-3.5 text-pink-200" />
                          <span>📋 Đưa Báo Cáo Kênh Sang Nhận Xét</span>
                        </button>

                        {/* Button 2: Đưa vào ý chính */}
                        <button
                          type="button"
                          onClick={handleApplyStrategyToBullets}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-[11px] font-bold text-purple-200 flex items-center gap-1.5 transition-all"
                          title="Tự động thêm chiến lược Hook, Biểu cảm, Edit vào ý chính báo cáo"
                        >
                          {appliedStrategyNotice ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Đã chèn vào ý chính!</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>📥 Đưa vào Ý chính</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 4 Core Metrics Chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>Views Trong Tuần ({selectedChannel.includes('Fan') ? 'Fan Ba Làng' : 'Tuyến Hòa'})</span>
                        </div>
                        <div className="text-sm font-black text-cyan-300 font-mono mt-0.5">
                          {channelMetricsMap[selectedChannel]?.views || channelScans[selectedChannel]?.totalViews || metrics.views}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-pink-400" />
                          <span>Tim Tuần (Likes)</span>
                        </div>
                        <div className="text-sm font-black text-pink-300 font-mono mt-0.5">
                          {channelMetricsMap[selectedChannel]?.likes || channelScans[selectedChannel]?.totalLikes || channelStrategicReview?.quickMetricsSummary?.totalLikes || (selectedChannel.includes('Fan') ? '1,380' : '2,860')}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-400" />
                          <span>Follow Tăng Trong Tuần</span>
                        </div>
                        <div className="text-sm font-black text-emerald-300 font-mono mt-0.5">
                          {channelMetricsMap[selectedChannel]?.followers || channelScans[selectedChannel]?.totalFollowersGained || metrics.followers}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-purple-400" />
                          <span>Tương Tác Tuần</span>
                        </div>
                        <div className="text-sm font-black text-purple-300 font-mono mt-0.5">
                          {channelMetricsMap[selectedChannel]?.engagement || channelScans[selectedChannel]?.totalEngagement || metrics.engagement}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-tab Navigation */}
                  <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setAnalysisSubTab('strategy')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        analysisSubTab === 'strategy'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>🧭 Đánh Giá Chiến Lược Tuần Mới (4 Trụ Cột)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalysisSubTab('clips')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        analysisSubTab === 'clips'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>🎞️ Bóc Tách Chi Tiết Từng Clip ({analyzedClips.length})</span>
                    </button>
                  </div>

                  {/* If no data yet */}
                  {!channelStrategicReview && analyzedClips.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
                      <Video className="w-10 h-10 text-pink-400 mx-auto mb-2 opacity-80" />
                      <h5 className="text-xs font-bold text-white mb-1">
                        Chưa có dữ liệu bóc tách clip tuần này
                      </h5>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto mb-3">
                        Ném link kênh TikTok ở khung bên trái và bấm "Quét Kênh & Bóc Tách Chi Tiết Từng Clip" để AI phân tích chi tiết.
                      </p>
                      <button
                        type="button"
                        onClick={handleAnalyzeChannelClips}
                        className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-600/20"
                      >
                        ⚡ Quét Kênh Ngay
                      </button>
                    </div>
                  ) : analysisSubTab === 'strategy' && channelStrategicReview ? (
                    /* STRATEGY SUBTAB: 4 PILLARS */
                    <div className="space-y-3.5">
                      {/* Pillar 1: Hook Strategy */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-black">
                              1
                            </span>
                            <h5 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5" />
                              <span>Chiến Lược Hook 3 Giây Đầu</span>
                            </h5>
                          </div>
                          <span className="text-[10px] text-amber-400/80 font-mono">
                            {channelStrategicReview.hookStrategy?.swipeRateAssessment || 'Tỷ lệ lướt qua: 32% (Cần kéo xuống < 25%)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {channelStrategicReview.hookStrategy?.assessment || 'Cần đặt câu hỏi gây tò mò và visual cận cảnh giọt mắm sóng sánh trong 1.5s đầu tiên.'}
                        </p>
                        <div className="space-y-1 text-xs text-slate-300 pt-1 border-t border-amber-500/20">
                          <span className="font-bold text-amber-200 text-[11px] block">
                            💡 Hành động thay đổi cho tuần mới:
                          </span>
                          {getHookTips(channelStrategicReview).map((adv, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                              <span className="text-amber-400 mt-0.5">•</span>
                              <span>{adv}</span>
                            </div>
                          ))}
                        </div>

                        {/* Sample Hooks */}
                        {getSampleHooks(channelStrategicReview).length > 0 && (
                          <div className="pt-2 border-t border-amber-500/20 space-y-1.5">
                            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              3 Câu Hook Mẫu Ba Làng TH Áp Dụng Ngay:
                            </span>
                            <div className="space-y-1.5">
                              {getSampleHooks(channelStrategicReview).map((h, hIdx) => (
                                <div
                                  key={hIdx}
                                  className="p-2 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between gap-2 text-xs font-medium text-slate-100"
                                >
                                  <span className="text-[11px] italic text-amber-200/90 font-serif">
                                    "{h}"
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopySingleHook(h, hIdx)}
                                    className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
                                  >
                                    {copiedHookIdx === hIdx ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span>Đã chép</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Sao chép</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pillar 2: Topic Strategy */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-900 border border-cyan-500/30 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-cyan-400/20 text-cyan-300 flex items-center justify-center text-xs font-black">
                            2
                          </span>
                          <h5 className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Định Hướng Chủ Đề Tuần Mới</span>
                          </h5>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {channelStrategicReview.topicStrategy?.assessment || 'Tập trung các chủ đề đời thường, ẩm thực gia đình gắn liền với sản phẩm truyền thống.'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
                            <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Tuyến nội dung nên đẩy mạnh:
                            </span>
                            {getRecommendedTopics(channelStrategicReview).map((r, rIdx) => (
                              <div key={rIdx} className="text-[11px] text-slate-300 flex items-start gap-1">
                                <span className="text-emerald-400">+</span>
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-1">
                            <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Tuyến nội dung cần né:
                            </span>
                            {getAvoidTopics(channelStrategicReview).map((a, aIdx) => (
                              <div key={aIdx} className="text-[11px] text-slate-300 flex items-start gap-1">
                                <span className="text-rose-400">-</span>
                                <span>{a}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Pillar 3: Expression Strategy */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-slate-900 to-slate-900 border border-purple-500/30 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-purple-400/20 text-purple-300 flex items-center justify-center text-xs font-black">
                            3
                          </span>
                          <h5 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Smile className="w-3.5 h-3.5" />
                            <span>Cải Thiện Biểu Cảm & Diễn Xuất</span>
                          </h5>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {channelStrategicReview.expressionStrategy?.assessment || 'Cần ánh mắt tương tác thẳng vào ống kính và biểu cảm tự nhiên, ấm áp.'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-1">
                            <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                              <Smile className="w-3 h-3 text-pink-400" />
                              Khuôn mặt & Ánh mắt:
                            </span>
                            {getFacialTips(channelStrategicReview).map((f, fIdx) => (
                              <div key={fIdx} className="text-[11px] text-slate-300 flex items-start gap-1">
                                <span className="text-purple-400">•</span>
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-1">
                            <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-cyan-400" />
                              Giọng nói & Ngôn ngữ cơ thể:
                            </span>
                            {getBodyVoiceTips(channelStrategicReview).map((v, vIdx) => (
                              <div key={vIdx} className="text-[11px] text-slate-300 flex items-start gap-1">
                                <span className="text-cyan-400">•</span>
                                <span>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Pillar 4: Editing Strategy */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-xs font-black">
                            4
                          </span>
                          <h5 className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5" />
                            <span>Tối Ưu Kỹ Thuật Edit & Dựng</span>
                          </h5>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {channelStrategicReview.editingStrategy?.assessment || 'Cắt gọt nhịp cảnh nhanh dưới 1.5s và đẩy mạnh hiệu ứng âm thanh giọt mắm.'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                            <span className="font-bold text-emerald-300 block">⚡ Pacing & Nhịp cắt:</span>
                            <span className="text-slate-300">
                              {channelStrategicReview.editingStrategy?.pacingAdvice || 'Cắt tỉa dead air dồn dập dưới 1.5s/shot, không để khoảng lặng thoại.'}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                            <span className="font-bold text-cyan-300 block">🔍 Zoom & Chuyển cảnh:</span>
                            <span className="text-slate-300">
                              {channelStrategicReview.editingStrategy?.zoomAndTransitions || 'Zoom punch-in 10-15% luân phiên ở các câu chốt đắt giá.'}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                            <span className="font-bold text-amber-300 block">🎨 Màu sắc mắm Ba Làng:</span>
                            <span className="text-slate-300">
                              {channelStrategicReview.editingStrategy?.brollAndColorGrading || 'Tăng saturation sắc đỏ hổ phách và tương phản b-roll rót mắm.'}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                            <span className="font-bold text-pink-300 block">🎵 ASMR & Âm thanh SFX:</span>
                            <span className="text-slate-300">
                              {channelStrategicReview.editingStrategy?.audioAndMusic || 'Đẩy foley tiếng rưới mắm, tiếng sôi xèo xèo của chảo thịt kho.'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* CLIPS SUBTAB: DETAILED CLIP-BY-CLIP */
                    <div className="space-y-3">
                      {analyzedClips.map((clip, cIdx) => {
                        const isExpanded = expandedClipId === clip.id || analyzedClips.length <= 3;
                        const clipScore = getClipScore(clip);
                        const clipDate = getClipDate(clip);
                        const clipUrl = getClipUrl(clip);
                        const hookScore = getClipHookScore(clip);

                        return (
                          <div
                            key={clip.id || cIdx}
                            className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                    Clip #{cIdx + 1}
                                  </span>
                                  {clip.channelName && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                      {clip.channelName}
                                    </span>
                                  )}
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    {clipDate}
                                  </span>
                                  {clipScore && (
                                    <span className="text-[11px] font-bold text-amber-300">
                                      ★ {clipScore}/100 ({clip.grade || 'A'})
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-xs font-bold text-white leading-snug">
                                  {clip.title}
                                </h5>
                                <div className="text-[11px] italic text-slate-400 line-clamp-1">
                                  Hook mở đầu: "{clip.hookSnippet || 'Hook mở đầu video'}"
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {clipUrl && (
                                  <a
                                    href={clipUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                    title="Xem video trên TikTok"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedClipId(expandedClipId === clip.id ? null : clip.id)
                                  }
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                  title={isExpanded ? 'Thu gọn' : 'Xem chi tiết đánh giá'}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Row 4 Metrics of this clip */}
                            <div className="grid grid-cols-4 gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px]">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Views</span>
                                <span className="font-bold text-cyan-300 font-mono">{clip.views || '0'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Tim</span>
                                <span className="font-bold text-pink-300 font-mono">{clip.likes || '0'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Bình luận</span>
                                <span className="font-bold text-emerald-300 font-mono">{clip.comments || '0'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Chia sẻ</span>
                                <span className="font-bold text-purple-300 font-mono">{clip.shares || '0'}</span>
                              </div>
                            </div>

                            {/* Detailed Breakdown Accordion Content */}
                            {isExpanded && (
                              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                                {/* Hook Evaluation */}
                                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                                    <span className="flex items-center gap-1">
                                      <Target className="w-3 h-3" />
                                      Đánh giá Hook ({hookScore}/10)
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-200">
                                    <span className="text-emerald-400 font-semibold">+ Điểm mạnh: </span>
                                    {getClipStrengths(clip)}
                                  </div>
                                  <div className="text-[11px] text-slate-200">
                                    <span className="text-amber-400 font-semibold">- Điểm yếu: </span>
                                    {getClipWeaknesses(clip)}
                                  </div>
                                  {getClipHookSuggestion(clip) && (
                                    <div className="p-2 rounded-lg bg-slate-950/70 border border-amber-500/30 text-[11px] text-amber-200 flex items-center justify-between gap-2 mt-1">
                                      <span>
                                        <strong>Gợi ý sửa Hook:</strong> "{getClipHookSuggestion(clip)}"
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopySingleHook(getClipHookSuggestion(clip), cIdx)}
                                        className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] hover:bg-amber-500/30 flex-shrink-0"
                                      >
                                        Chép
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Expression & Editing Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                  {/* Expression */}
                                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-1">
                                    <span className="font-bold text-purple-300 flex items-center gap-1">
                                      <Smile className="w-3 h-3 text-pink-400" />
                                      Biểu cảm & Diễn xuất
                                    </span>
                                    <p className="text-slate-300 text-[11px] leading-relaxed">
                                      {getClipActing(clip)}
                                    </p>
                                    <div className="text-purple-200 text-[10px] italic">
                                      👉 {getClipExpressionSuggestion(clip)}
                                    </div>
                                  </div>

                                  {/* Editing */}
                                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                                    <span className="font-bold text-emerald-300 flex items-center gap-1">
                                      <Scissors className="w-3 h-3" />
                                      Kỹ thuật Edit & Dựng
                                    </span>
                                    <p className="text-slate-300 text-[11px] leading-relaxed">
                                      {getClipPacing(clip)}
                                    </p>
                                    <div className="text-emerald-200 text-[10px] italic">
                                      👉 {getClipEditSuggestion(clip)}
                                    </div>
                                  </div>
                                </div>

                                {/* Verdict */}
                                <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300">
                                  <strong className="text-white">Tổng kết: </strong>
                                  {getClipOverallVerdict(clip)}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : !aiReviewData && !editableDoc ? (
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
                  {/* Status Banner for Viewers */}
                  {isPublishedForViewers ? (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <div>
                          <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Bản Báo Cáo Chính Thức Đã Xuất Bản Cho Người Xem</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Công bố: {publishedAt ? new Date(publishedAt).toLocaleString('vi-VN') : 'Đang cập nhật'} • Người lập: Trịnh Minh Đức
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsViewerModalOpen(true)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Mở Bản Người Xem</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadTxtReport}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Tải văn bản về máy (.txt)"
                        >
                          <Download className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Tải .txt</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Bản dự thảo nội bộ của Quản trị viên (Chưa xuất bản chính thức cho Người xem)</span>
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={handlePublishReportForViewers}
                          className="text-cyan-400 hover:text-cyan-300 font-bold underline ml-2"
                        >
                          Xuất bản ngay
                        </button>
                      )}
                    </div>
                  )}

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
                      {!isAdmin ? currentViewerDoc : (editableDoc || aiReviewData?.formattedDocument)}
                    </div>
                  )}
                </div>
              ) : !isAdmin ? (
                /* Breakdown 4 View Blocks for Viewer (HOÀN TOÀN KHÔNG CÓ PHẦN PHÂN TÍCH KÊNH) */
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Block 1: Overall */}
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-1.5 uppercase tracking-wider">
                      <FileText className="w-4 h-4" />
                      <span>I. Tổng Quan Tự Đánh Giá Bản Thân</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {aiReviewData?.overallSummary || `Trong tuần ${weekNumber}, bản thân tôi đã tập trung cao độ triển khai toàn diện các hạng mục công việc được giao, bám sát mục tiêu nội dung và kế hoạch vận hành. Tinh thần làm việc chủ động, trách nhiệm cao, bám sát các đầu việc từ lên ý tưởng, viết kịch bản đến quay và dựng hoàn thiện các video clip.`}
                    </p>
                  </div>

                  {/* Block 2: Strengths */}
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>II. Điểm Sáng & Kết Quả Đạt Được Của Bản Thân</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-200">
                      {(aiReviewData?.keyStrengths && aiReviewData.keyStrengths.length > 0
                        ? aiReviewData.keyStrengths
                        : [
                            `Hoàn thành 100% tiến độ sản xuất và biên tập kịch bản video clip định kỳ theo kế hoạch tuần.`,
                            `Đổi mới tư duy sáng tạo, ứng dụng kỹ thuật Hook thị giác và nhịp cắt dồn dập giúp cải thiện tỷ lệ giữ chân người xem.`,
                            `Phối hợp chặt chẽ cùng phòng Livestream chuẩn bị kịch bản mini-game, sự kiện bán hàng.`,
                          ]
                      ).map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 mt-0.5">✦</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Block 3 & 4: Bottlenecks & Next Action Plan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1.5 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        <span>III. Hạn Chế Cần Khắc Phục Của Bản Thân</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-200">
                        {(aiReviewData?.bottlenecksAndLearnings && aiReviewData.bottlenecksAndLearnings.length > 0
                          ? aiReviewData.bottlenecksAndLearnings
                          : [
                              `Khâu duyệt kịch bản giữa các khâu đôi khi còn chậm, cần chủ động gửi sớm hơn từ đầu tuần.`,
                              `Nâng cao kỹ năng điều phối thiết bị thu âm và ánh sáng khi quay thực tế bãi cá ngoài trời.`,
                            ]
                        ).map((b, idx) => (
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
                        <span>IV. Đề Xuất & Cam Kết Tuần Tới</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-200">
                        {(aiReviewData?.nextWeekActionPlan && aiReviewData.nextWeekActionPlan.length > 0
                          ? aiReviewData.nextWeekActionPlan
                          : [
                              `Đề xuất quy trình duyệt kịch bản cố định vào sáng Thứ Ba hàng tuần.`,
                              `Bổ sung 01 bộ lọc gió micro chuyên dụng và 01 đèn mini hỗ trợ quay ngoại cảnh.`,
                              `Phối hợp cùng phòng Livestream thống nhất danh mục sản phẩm trước 48h để làm clip mồi traffic.`,
                            ]
                        ).map((plan, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-indigo-400 mt-0.5">➔</span>
                            <span>{plan}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                /* Breakdown 5 View Blocks for Admin */
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

              <div className="flex flex-wrap items-center gap-2">
                {!isAdmin ? (
                  /* Viewer bottom actions */
                  <>
                    <button
                      type="button"
                      onClick={() => setIsViewerModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all active:scale-95"
                      title="Mở toàn màn hình bản nhận xét & đề xuất tuần"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Mở Toàn Màn Hình</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadTxtReport}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Tải văn bản về máy (.txt)"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Tải .txt</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyDocument}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Đã Sao Chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao Chép Để Nộp Báo Cáo</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  /* Admin bottom actions */
                  <>
                    {isPublishedForViewers && (
                      <button
                        type="button"
                        onClick={handlePublishReportForViewers}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all active:scale-95 border border-emerald-400/40"
                        title="Xuất bản chính thức báo cáo tuần này cho Người xem & Ban Giám Đốc"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Cập Nhật Bản Người Xem</span>
                      </button>
                    )}

                    {!isPublishedForViewers && (
                      <button
                        type="button"
                        onClick={handlePublishReportForViewers}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all active:scale-95 border border-emerald-400/40"
                        title="Xuất bản chính thức báo cáo tuần này cho Người xem & Ban Giám Đốc"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>🚀 Xuất Cho Người Xem</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsViewerModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Mở giao diện bản báo cáo trang trọng dành cho Người xem"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Xem Bản Người Xem</span>
                    </button>

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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: BẢN BÁO CÁO DÀNH CHO NGƯỜI XEM (Official Viewer Report Version)     */}
      {/* ========================================================================= */}
      {isViewerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    BA LÀNG TH • BÁO CÁO CÔNG VIỆC CHÍNH THỨC
                  </span>
                  {isPublishedForViewers ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Đã Xuất Bản Cho Người Xem
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Bản Xem Trước Dự Thảo (Chưa xuất bản)
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-white font-display">
                  Bản Nhận Xét & Đề Xuất Tuần Của Bản Thân
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>Tuần {weekNumber} ({startDate} - {endDate})</span>
                  <span>•</span>
                  <span>Người thực hiện: <strong className="text-slate-200">Trịnh Minh Đức</strong></span>
                  <span>•</span>
                  <span>Kênh: <strong className="text-cyan-400">TikTok Ba Làng Tuyến Hòa & Fan Ba Làng TH</strong></span>
                  <span>•</span>
                  <span>Tự chấm: <strong className="text-amber-300 font-bold">{selfRating} ({selfScore}/100)</strong></span>
                  {publishedAt && (
                    <>
                      <span>•</span>
                      <span>Ngày công bố: <strong className="text-emerald-300">{new Date(publishedAt).toLocaleString('vi-VN')}</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsViewerModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Quick Metrics Bar: Only shown for admin, completely hidden for viewers */}
              {isAdmin && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/30">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                      <Eye className="w-3 h-3 text-cyan-400" />
                      Lượt xem (Views)
                    </span>
                    <span className="text-base font-black text-cyan-300 font-mono mt-0.5 block">
                      {metrics.views || 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/30">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                      <Users className="w-3 h-3 text-purple-400" />
                      Follow mới
                    </span>
                    <span className="text-base font-black text-purple-300 font-mono mt-0.5 block">
                      {metrics.followers || 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/30">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      Độ phủ (Reach)
                    </span>
                    <span className="text-base font-black text-emerald-300 font-mono mt-0.5 block">
                      {metrics.reach || 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/30">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                      <Heart className="w-3 h-3 text-pink-400" />
                      Lượt tương tác
                    </span>
                    <span className="text-base font-black text-amber-300 font-mono mt-0.5 block">
                      {metrics.engagement || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
              )}

              {/* Formatted Report Document: Pure personal review and proposals for viewer */}
              <div className="p-5 sm:p-6 bg-slate-950 rounded-xl border border-slate-800 font-sans text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-line select-text max-h-[500px] overflow-y-auto custom-scrollbar shadow-inner">
                {!isAdmin ? currentViewerDoc : (editableDoc || aiReviewData?.formattedDocument || 'Chưa có nội dung văn bản báo cáo.')}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isAdmin && isPublishedForViewers && (
                  <button
                    type="button"
                    onClick={handleUnpublishReport}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                    title="Chuyển về trạng thái nháp nội bộ"
                  >
                    Hủy Xuất Bản
                  </button>
                )}
                {isAdmin && !isPublishedForViewers && (
                  <button
                    type="button"
                    onClick={handlePublishReportForViewers}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>🚀 Xuất Bản Ngay</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Copy */}
                <button
                  type="button"
                  onClick={handleCopyDocument}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sao chép toàn bộ</span>
                    </>
                  )}
                </button>

                {/* Download .txt */}
                <button
                  type="button"
                  onClick={handleDownloadTxtReport}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Tải văn bản báo cáo dạng file .txt"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tải File .txt</span>
                </button>

                {/* Print / PDF */}
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="In báo cáo hoặc lưu thành file PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-purple-400" />
                  <span>In / PDF</span>
                </button>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setIsViewerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TiltCard>
  );
};
