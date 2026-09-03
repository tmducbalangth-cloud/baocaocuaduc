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
