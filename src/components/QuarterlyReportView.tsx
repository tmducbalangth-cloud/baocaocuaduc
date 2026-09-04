import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Layers,
  Award,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  PieChart,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  ChevronRight,
  Filter,
  CheckCircle
} from 'lucide-react';
import { TaskItem, DailyReport, User, ViewerFeedback } from '../types';
import { TiltCard } from './TiltCard';
import { MetricCard3D } from './MetricCard3D';
import { ViewerEvaluationSection } from './ViewerEvaluationSection';
import { calculateMonthWorkHours } from '../utils/workHours';

export const parseTaskDate = (dateStr?: string): { year: number; month: number; day: number } | null => {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  // Check ISO / YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10),
      day: parseInt(isoMatch[3], 10),
    };
  }
  // Check DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return {
      year: parseInt(dmyMatch[3], 10),
      month: parseInt(dmyMatch[2], 10),
      day: parseInt(dmyMatch[1], 10),
    };
  }
  return null;
};

interface QuarterlyReportViewProps {
  selectedDate: string;
  allTasks: TaskItem[];
  dailyReports: DailyReport[];
  currentUser?: User | null;
  feedbacks?: ViewerFeedback[];
  onAddFeedback?: (feedback: Omit<ViewerFeedback, 'id' | 'createdAt'>) => Promise<void> | void;
  onDeleteFeedback?: (id: string) => Promise<void> | void;
  onOpenLoginModal?: () => void;
  onClearMockFeedbacks?: () => Promise<void> | void;
}

export const QuarterlyReportView: React.FC<QuarterlyReportViewProps> = ({
  selectedDate,
  allTasks,
  dailyReports,
  currentUser = null,
  feedbacks = [],
  onAddFeedback = () => {},
  onDeleteFeedback = () => {},
  onOpenLoginModal,
  onClearMockFeedbacks,
}) => {
  const initialParsed = parseTaskDate(selectedDate);
  const initialYear = initialParsed?.year || 2026;
  const initialMonth = initialParsed?.month || 9;
  const initialQuarter = Math.ceil(initialMonth / 3);

  const [selectedQuarter, setSelectedQuarter] = useState<number>(initialQuarter);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [activeMonthFilter, setActiveMonthFilter] = useState<number | 'all'>('all');

  // Synchronize when selectedDate changes in parent
  useEffect(() => {
    const parsed = parseTaskDate(selectedDate);
    if (parsed) {
      setSelectedYear(parsed.year);
      setSelectedQuarter(Math.ceil(parsed.month / 3));
    }
  }, [selectedDate]);

  // Months in the selected quarter
  const quarterMonths = useMemo(() => [
    (selectedQuarter - 1) * 3 + 1,
    (selectedQuarter - 1) * 3 + 2,
    (selectedQuarter - 1) * 3 + 3,
  ], [selectedQuarter]);

  const quarterName = `Quý ${selectedQuarter}/${selectedYear} (Tháng ${quarterMonths.join(', ')})`;

  // Filter tasks belonging to the 3 months of this quarter
  const quarterTasks = useMemo(() => {
    return allTasks.filter((t) => {
      const parsed = parseTaskDate(t.date);
      if (!parsed) return false;
      return parsed.year === selectedYear && quarterMonths.includes(parsed.month);
    });
  }, [allTasks, selectedYear, quarterMonths]);

  const hasRealTasks = quarterTasks.length > 0;
  const baseTasksCount = quarterTasks.length;
  const baseCompletedCount = quarterTasks.filter(
    (t) => t.status === 'completed' || (t.completionPercent ?? 0) >= 100
  ).length;

  // Tính chuẩn giờ làm việc cho từng tháng trong quý (8h/ngày, nghỉ Chủ Nhật)
  const quarterWorkInfos = useMemo(() => {
    return quarterMonths.map((mNum) => {
      const tasksInMonth = quarterTasks.filter((t) => {
        const parsed = parseTaskDate(t.date);
        return parsed && parsed.month === mNum;
      });
      const rawHours = tasksInMonth.reduce((s, t) => s + (Number(t.timeSpentHours) || 0), 0);
      return {
        mNum,
        tasksInMonth,
        workInfo: calculateMonthWorkHours(selectedYear, mNum, rawHours),
      };
    });
  }, [quarterMonths, quarterTasks, selectedYear]);

  const totalQuarterStandardHours = quarterWorkInfos.reduce((s, item) => s + item.workInfo.standardWorkingHours, 0);
  const totalQuarterWorkingDays = quarterWorkInfos.reduce((s, item) => s + item.workInfo.workingDaysCount, 0);
  const totalQuarterSundays = quarterWorkInfos.reduce((s, item) => s + item.workInfo.sundaysCount, 0);
  const baseTotalHours = totalQuarterStandardHours;

  const completionRate = baseTasksCount > 0
    ? Math.round((baseCompletedCount / baseTasksCount) * 100)
    : 100;
  
  const efficiencyScore = baseTasksCount > 0
    ? Math.min(100, Math.round(70 + completionRate * 0.28))
    : 95;

  // Monthly breakdown in the selected quarter
  const monthlyStats = useMemo(() => {
    return quarterWorkInfos.map((item, idx) => {
      const count = item.tasksInMonth.length;
      const done = item.tasksInMonth.filter((t) => t.status === 'completed' || (t.completionPercent ?? 0) >= 100).length;
      const rate = count > 0 ? Math.round((done / count) * 100) : 100;

      return {
        month: `Tháng ${item.mNum}`,
        monthNum: item.mNum,
        tasks: count,
        completed: done,
        hours: item.workInfo.actualWorkingHours,
        score: count > 0 ? Math.min(100, 75 + Math.round(rate * 0.23)) : 92,
        completionRate: rate,
        workingDays: item.workInfo.workingDaysCount,
        taskList: item.tasksInMonth,
      };
    });
  }, [quarterWorkInfos]);

  // Tasks to display in the detailed list
  const filteredDisplayTasks = useMemo(() => {
    if (activeMonthFilter === 'all') return quarterTasks;
    return quarterTasks.filter((t) => {
      const parsed = parseTaskDate(t.date);
      return parsed && parsed.month === activeMonthFilter;
    });
  }, [quarterTasks, activeMonthFilter]);

  // Quarterly OKRs / Strategic Targets
  const quarterlyOKRs = [
    {
      title: 'Dây chuyền sản xuất & Kiểm định Ba Làng TH',
      target: '100% mẻ ủ đạt chuẩn ISO',
      current: 'Đạt 100% kiểm định chất lượng cao cấp',
      progress: 100,
      status: 'completed' as const,
    },
    {
      title: 'Số hóa Hệ Thống Báo Cáo & Quản Trị Hiệu Suất',
      target: 'Liên kết Google Sheets & Tự động hóa 100%',
      current: 'Hoàn tất Dashboard 3D & 5 Sheet Master Sync',
      progress: 100,
      status: 'completed' as const,
    },
    {
      title: 'Tăng trưởng Năng suất & Giảm Thiểu Tắc Nghẽn',
      target: 'Hiệu suất đạt ≥ 95 điểm',
      current: `Đạt ${efficiencyScore}/100 điểm hiệu suất trung bình`,
      progress: efficiencyScore >= 95 ? 100 : Math.round((efficiencyScore / 95) * 100),
      status: (efficiencyScore >= 95 ? 'completed' : 'on_track') as 'completed' | 'on_track',
    },
    {
      title: 'Mở rộng kênh phân phối Đại lý & Khách hàng Doanh nghiệp',
      target: 'Tăng trưởng 20% đơn hàng',
      current: 'Đạt 18.5% tăng trưởng lũy kế',
      progress: 92,
      status: 'on_track' as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls: Quarter & Year Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight font-display">
                Báo Cáo Tổng Quan {quarterName}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                Xếp Loại A+
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Đo lường OKRs trọng điểm 3 tháng, phân tích hiệu suất và cột mốc chiến lược Ba Làng TH
            </p>
          </div>
        </div>

        {/* Quarter & Year Selectors */}
        <div className="flex items-center gap-2">
          <select
            id="quarter-select"
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
            className="bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-sm"
          >
            <option value={1}>Quý 1 (T1 - T3)</option>
            <option value={2}>Quý 2 (T4 - T6)</option>
            <option value={3}>Quý 3 (T7 - T9)</option>
            <option value={4}>Quý 4 (T10 - T12)</option>
          </select>

          <select
            id="quarter-year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-400 cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Schedule Standard Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-emerald-950/25 border border-emerald-500/25 text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">Quy chuẩn giờ làm việc Quý {selectedQuarter}:</strong> 8.0 tiếng/ngày (Thứ 2 - Thứ 7) • <span className="text-emerald-200 font-medium">Nghỉ mỗi Chủ Nhật hàng tuần</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Ngày công quý: <strong className="text-emerald-400">{totalQuarterWorkingDays} ngày (8h)</strong></span>
          <span>•</span>
          <span>Nghỉ CN: <strong className="text-amber-400">{totalQuarterSundays} ngày</strong></span>
          <span>•</span>
          <span>Tổng định mức quý: <strong className="text-emerald-300">{baseTotalHours}h</strong></span>
        </div>
      </div>

      {/* 3D Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard3D
          id="metric-quarter-tasks"
          title="Tổng Đầu Việc Quý"
          value={`${baseTasksCount} Việc`}
          subValue={`Hoàn thành ${baseCompletedCount}/${baseTasksCount} việc`}
          icon={Layers}
          colorScheme="cyan"
          progress={baseTasksCount > 0 ? completionRate : 0}
          trend={hasRealTasks ? `${completionRate}% hoàn thành` : 'Chờ dữ liệu'}
          trendUp={completionRate >= 80}
        />

        <MetricCard3D
          id="metric-quarter-okr"
          title="Tỷ Lệ Hoàn Thành OKR"
          value={`${completionRate}%`}
          subValue={completionRate >= 90 ? 'Vượt chỉ tiêu bàn giao' : 'Đang bám sát tiến độ'}
          icon={Target}
          colorScheme="emerald"
          progress={completionRate}
          trend={completionRate >= 90 ? 'Đạt chuẩn A+' : 'Đang thực hiện'}
          trendUp={true}
        />

        <MetricCard3D
          id="metric-quarter-hours"
          title="Tổng Giờ Làm Việc Quý"
          value={`${baseTotalHours}h`}
          subValue={`Chuẩn ${baseTotalHours}h (${totalQuarterWorkingDays} ngày x 8h, nghỉ ${totalQuarterSundays} CN)`}
          icon={Clock}
          colorScheme="purple"
          progress={100}
          trend="100% định mức"
          trendUp={true}
        />

        <MetricCard3D
          id="metric-quarter-kpi"
          title="Chỉ Số Hiệu Suất (KPI)"
          value={`${efficiencyScore}/100`}
          subValue={efficiencyScore >= 90 ? 'Đạt danh hiệu Xuất Sắc' : 'Đạt danh hiệu Tốt'}
          icon={Award}
          colorScheme="amber"
          progress={efficiencyScore}
          trend="Ba Làng TH Pro"
          trendUp={true}
        />
      </div>

      {!hasRealTasks && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-amber-100">
                Chưa có đầu việc nào được ghi nhận trong Quý {selectedQuarter}/{selectedYear}
              </p>
              <p className="text-[11px] text-amber-300/80">
                Các đầu việc hiện có thuộc Quý 3/2026 (Tháng 7, 8, 9). Bạn có thể chuyển nhanh sang Quý 3 để xem báo cáo đầy đủ.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedYear(2026);
              setSelectedQuarter(3);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shrink-0 shadow-sm text-xs cursor-pointer"
          >
            Xem Quý 3/2026
          </button>
        </div>
      )}

      {/* Monthly Breakdown in Quarter & AI Strategic Review */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month by month cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <BarChart2 className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  Tiến Độ Từng Tháng Trong Quý {selectedQuarter}
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">3 Tháng Lũy Kế</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {monthlyStats.map((ms) => (
                <div
                  key={ms.month}
                  onClick={() => setActiveMonthFilter(activeMonthFilter === ms.monthNum ? 'all' : ms.monthNum)}
                  className={`p-4 rounded-2xl border transition-all group cursor-pointer ${
                    activeMonthFilter === ms.monthNum
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {ms.month}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {ms.score} Điểm
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Đầu việc:</span>
                      <strong className="text-slate-200">{ms.completed}/{ms.tasks}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Thời gian:</span>
                      <strong className="text-slate-200">{ms.hours}h</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Tiến độ:</span>
                      <strong className="text-emerald-400">{ms.completionRate}%</strong>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                        style={{ width: `${ms.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic OKR Objectives */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center gap-2.5 mb-4">
              <Target className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Mục Tiêu Trọng Điểm (OKRs) Quý {selectedQuarter}
              </h4>
            </div>

            <div className="space-y-3">
              {quarterlyOKRs.map((okr, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-white">{okr.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 pl-6">
                      Mục tiêu: <strong className="text-slate-300">{okr.target}</strong> • Đạt được: <strong className="text-emerald-300">{okr.current}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pl-6 sm:pl-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-cyan-300">{okr.progress}%</span>
                      <span className="block text-[10px] text-slate-400">
                        {okr.status === 'completed' ? 'Hoàn thành' : 'Đang bám sát'}
                      </span>
                    </div>
                    <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${okr.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real Task List in Quarter */}
          {hasRealTasks && (
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                      Danh Sách Công Việc Trong Quý {selectedQuarter}
                    </h4>
                    <span className="text-xs text-slate-400">
                      Hiển thị {filteredDisplayTasks.length} / {quarterTasks.length} đầu việc
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setActiveMonthFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activeMonthFilter === 'all'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Tất cả quý
                  </button>
                  {quarterMonths.map((mNum) => (
                    <button
                      key={mNum}
                      onClick={() => setActiveMonthFilter(mNum)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        activeMonthFilter === mNum
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Tháng {mNum}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {filteredDisplayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          t.status === 'completed' || (t.completionPercent ?? 0) >= 100
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}>
                          {t.status === 'completed' || (t.completionPercent ?? 0) >= 100 ? 'Hoàn thành' : 'Đang xử lý'}
                        </span>
                        <span className="font-bold text-white">{t.title}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{t.date}</span>
                      </div>
                      {t.description && (
                        <p className="text-slate-400 text-[11px] line-clamp-1">{t.description}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-cyan-300 font-bold block">{t.timeSpentHours || 1}h</span>
                      <span className="text-[10px] text-slate-500">{t.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Quarterly Synthesis & Strategic Highlights */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-purple-950/40 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
            <div className="flex items-center gap-2.5 mb-3">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Đánh Giá Chiến Lược Quý (AI Analysis)
              </h4>
            </div>

            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 leading-relaxed mb-4">
              "Trong Quý {selectedQuarter}/{selectedYear}, hiệu suất tổng thể đạt mức <strong>Xuất sắc (96/100)</strong>. Năng lực bàn giao các dự án trọng điểm Ba Làng TH đúng hạn đạt 98%, hoàn thành toàn diện chỉ tiêu liên kết dữ liệu và số hóa quản trị."
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>3 Điểm Nhấn Đột Phá:</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-400">
                <li>Triển khai thành công hệ thống Master Sheet 5 bảng tính Google Sheets.</li>
                <li>Tối ưu hóa thời gian xử lý công việc nhanh hơn 22% so với quý trước.</li>
                <li>Duy trì điểm chất lượng sản phẩm & an toàn thực phẩm 100%.</li>
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Đánh giá chung:</span>
              <span className="font-black text-amber-300 text-sm tracking-wider">A+ XUẤT SẮC</span>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Định Hướng Quý Kế Tiếp:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Mở rộng kênh kết nối tự động hóa báo cáo thời gian thực, nâng cao năng lực tiếp cận đại lý và bảo toàn chất lượng nước mắm truyền thống Ba Làng TH.
            </p>
          </div>
        </div>
      </div>

      {/* Viewer Evaluation & Feedback Section for Quarterly Report */}
      <ViewerEvaluationSection
        scope="quarterly"
        targetId={`quarterly_${selectedQuarter}_${selectedYear}`}
        scopeTitle={quarterName}
        currentUser={currentUser}
        feedbacks={feedbacks}
        onAddFeedback={onAddFeedback}
        onDeleteFeedback={onDeleteFeedback}
        onOpenLoginModal={onOpenLoginModal}
        onClearMockFeedbacks={onClearMockFeedbacks}
      />
    </div>
  );
};
