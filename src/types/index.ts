export type UserRole = 'admin' | 'viewer';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
  title: string;
}

export type TaskStatus = 'completed' | 'in_progress' | 'pending' | 'blocked';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'Marketing' | 'Hỗ trợ' | 'CV ngoài';

export const TASK_CATEGORIES: TaskCategory[] = [
  'Marketing',
  'Hỗ trợ',
  'CV ngoài',
];

export function normalizeCategory(cat?: string): TaskCategory {
  if (!cat) return 'Marketing';
  const c = cat.trim().toLowerCase();
  if (c.includes('hỗ trợ') || c.includes('support')) return 'Hỗ trợ';
  if (
    c.includes('cv ngoài') ||
    c.includes('ngoài') ||
    c.includes('khác') ||
    c.includes('quản trị') ||
    c.includes('nghiên cứu')
  ) {
    return 'CV ngoài';
  }
  return 'Marketing';
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory | string;
  status: TaskStatus;
  priority: TaskPriority;
  date: string; // YYYY-MM-DD
  quantity?: number; // Số lượng công việc (tùy ý, tối thiểu 1)
  timeSpentHours: number;
  completionPercent: number; // 0 - 100
  kpiMetric?: string; // e.g., "5/5 API endpoints", "Doanh thu 15tr", "Xử lý 10 tickets"
  outcome?: string; // Kết quả đạt được cụ thể
  assignedTo?: string;
  tags?: string[];
}

export interface AIAnalysisDaily {
  strengths: string[];
  improvements: string[];
  workloadScore: number; // 1-10
  burnoutRisk: 'Thấp' | 'Trung bình' | 'Cao';
  recommendations: string[];
  infographicSummary: string;
}

export interface DailyReport {
  id: string;
  date: string; // YYYY-MM-DD
  tasks: TaskItem[];
  summary: string;
  productivityScore: number; // 0 - 100
  evaluationGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  highlights: string[];
  bottlenecks: string[];
  aiAnalysis?: AIAnalysisDaily;
  author: string;
  status: 'draft' | 'submitted' | 'approved';
  userNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyMeasurementMetrics {
  deliveryRate: string;
  efficiencyIndex: string;
  focusRatio: string;
  timeOptimization: string;
}

export interface WeeklyReport {
  id: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  dailyReportIds: string[];
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  avgProductivityScore: number;
  productivityTrend: {
    day: string;
    date: string;
    score: number;
    completedCount: number;
    totalCount: number;
    hours: number;
  }[];
  categoryBreakdown: {
    category: string;
    count: number;
    hours: number;
    percentage: number;
  }[];
  keyAchievements: string[];
  unresolvedIssues: string[];
  nextWeekGoals: string[];
  aiExecutiveSummary?: string;
  rating?: string;
  measurementMetrics?: WeeklyMeasurementMetrics;
}

export interface MonthlyReport {
  id: string;
  month: number; // 1 - 12
  year: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalHours: number;
  avgScore: number;
  weeklyStats: {
    week: string;
    weekNumber: number;
    tasks: number;
    score: number;
    hours: number;
  }[];
  kpiAchievements: {
    name: string;
    target: number;
    achieved: number;
    unit: string;
    percent: number;
  }[];
  aiStrategicReview?: string;
  keyHighlights: string[];
}

export interface QuarterlyReport {
  id: string;
  quarter: number; // 1 - 4
  year: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalHours: number;
  avgScore: number;
  overallGrade: string;
  monthlyStats: {
    month: string;
    monthNum: number;
    tasks: number;
    completed: number;
    hours: number;
    score: number;
  }[];
  quarterlyOKRs: {
    title: string;
    target: string;
    current: string;
    progress: number;
    status: 'on_track' | 'at_risk' | 'completed';
  }[];
  strategicHighlights: string[];
  operationalRisks: string[];
  aiQuarterlySynthesis?: string;
}

export interface YearlyReport {
  id: string;
  year: number;
  totalTasks: number;
  completedTasks: number;
  totalHoursWorked: number;
  avgEfficiency: number;
  monthlyBreakdown: {
    month: string;
    monthNum: number;
    tasks: number;
    hours: number;
    efficiency: number;
  }[];
  milestones: {
    title: string;
    date: string;
    impact: string;
    tag: string;
  }[];
  overallGrade: string;
  aiAnnualSynthesis?: string;
}

export type ViewTab = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'sheet';

export interface ViewerFeedback {
  id: string;
  scope: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'task';
  targetId: string; // e.g. 'daily_2026-09-02' or 'weekly_36_2026' or 'monthly_9_2026' or 'yearly_2026'
  userName: string;
  userRole: UserRole;
  userAvatar: string;
  userEmail?: string;
  userTitle?: string;
  rating: number; // 1 - 5 stars
  tag?: string; // Quick tag e.g. "Tiến độ xuất sắc"
  comment: string;
  createdAt: string; // ISO string
}

export interface ChannelLinkConfig {
  channelName: string;
  channelUrl: string;
  clipUrlsText?: string;
  lastScannedAt?: string;
}

export interface AnalyzedClip {
  id: string;
  title: string;
  url?: string;
  postDate?: string;
  views: string | number;
  likes: string | number; // Tim
  comments: string | number;
  shares: string | number;
  channelName?: string;
  score: number; // 0 - 100
  hookEvaluation: {
    score: number; // 1 - 10
    strengths: string;
    weaknesses: string;
    suggestion: string;
  };
  topicEvaluation: {
    topic: string;
    relevance: string;
    suggestion: string;
  };
  expressionEvaluation: {
    acting: string;
    facialExpression: string; // Biểu cảm
    voicePacing: string; // Giọng điệu
    suggestion: string;
  };
  editEvaluation: {
    videoPacing: string; // Nhịp cắt
    visualsAndColor: string; // Màu sắc & góc máy
    soundAndSFX: string; // Âm thanh & hiệu ứng
    suggestion: string;
  };
  overallVerdict: string;
}

export interface ChannelStrategicReview {
  summary: string;
  channelName: string;
  totalViews: string;
  totalLikes: string;
  totalFollowersGained: string;
  totalEngagement: string;
  hookStrategy: {
    assessment: string;
    actionableTips: string[];
    sampleHooks: string[];
  };
  topicStrategy: {
    assessment: string;
    recommendedTopics: string[];
    topicsToAvoid: string[];
  };
  expressionStrategy: {
    assessment: string;
    facialTips: string[];
    bodyAndVoiceTips: string[];
  };
  editingStrategy: {
    assessment: string;
    editingTips: string[];
    audioAndVisualTips: string[];
  };
}

export interface ChannelMetrics {
  views: string; // e.g. "215,000"
  followers: string; // e.g. "+3,600"
  reach: string; // e.g. "145,000"
  engagement: string; // e.g. "18,800"
  conversionOrOrders?: string; // e.g. "45 đơn hàng"
  activeChannels: string[]; // e.g. ["TikTok Ba Làng Tuyến Hòa", "Fan Ba Làng TH"]
  channelLinks?: ChannelLinkConfig[];
  analyzedClips?: AnalyzedClip[];
  channelStrategicReview?: ChannelStrategicReview;
  note?: string;
}

export interface WeeklySelfReview {
  id: string;
  weekKey: string; // e.g. "weekly_34_2026"
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  userBulletPoints: string; // Các ý chính người dùng tự vạch ra
  channelMetrics: ChannelMetrics;
  selfRating: string; // e.g. "Xuất sắc (A+)"
  selfScore: number; // 0 - 100
  aiGeneratedReview?: {
    overallSummary: string;
    channelAnalysis: string;
    keyStrengths: string[];
    bottlenecksAndLearnings: string[];
    nextWeekActionPlan: string[];
  };
  formattedDocument?: string; // Bài nhận xét đầy đủ có thể chỉnh sửa trực tiếp và sao chép
  channelStrategicReview?: ChannelStrategicReview;
  analyzedClips?: AnalyzedClip[];
  isPublishedForViewers?: boolean;
  publishedAt?: string;
  publishedBy?: string;
  viewerDocument?: string;
  updatedAt: string;
}

