import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Calendar,
  Clock,
  Layers,
  Target,
  Trophy,
  Sparkles,
  CheckCircle2,
  Zap,
  AlertTriangle,
  BarChart2,
  Filter,
  CheckCircle
} from 'lucide-react';
import { TaskItem, DailyReport, User, ViewerFeedback } from '../types';
import { TiltCard } from './TiltCard';
import { MetricCard3D } from './MetricCard3D';
import { ViewerEvaluationSection } from './ViewerEvaluationSection';
import { calculateMonthWorkHours } from '../utils/workHours';
import { parseTaskDate } from './QuarterlyReportView';

interface YearlyReportViewProps {
  selectedDate?: string;
  allTasks: TaskItem[];
  dailyReports: DailyReport[];
  currentUser?: User | null;
  feedbacks?: ViewerFeedback[];
  onAddFeedback?: (feedback: Omit<ViewerFeedback, 'id' | 'createdAt'>) => Promise<void> | void;
  onDeleteFeedback?: (id: string) => Promise<void> | void;
  onOpenLoginModal?: () => void;
  onClearMockFeedbacks?: () => Promise<void> | void;
}

export const YearlyReportView: React.FC<YearlyReportViewProps> = ({
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
  const initialYear = selectedDate ? (parseTaskDate(selectedDate)?.year || 2026) : 2026;
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [activeMonthFilter, setActiveMonthFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    if (selectedDate) {
      const parsed = parseTaskDate(selectedDate);
      if (parsed?.year) {
        setSelectedYear(parsed.year);
      }
    }
  }, [selectedDate]);

  // Filter tasks in the selected year
  const yearTasks = useMemo(() => {
    return allTasks.filter((t) => {
      const parsed = parseTaskDate(t.date);
      return parsed && parsed.year === selectedYear;
    });
  }, [allTasks, selectedYear]);

  const hasRealTasks = yearTasks.length > 0;
  const totalAnnualTasks = yearTasks.length;
  const totalAnnualCompleted = yearTasks.filter(
    (t) => t.status === 'completed' || (t.completionPercent ?? 0) >= 100
  ).length;

  // Tính chuẩn giờ làm việc 12 tháng trong năm (8h/ngày, nghỉ mỗi Chủ Nhật)
  const monthsData = useMemo(() => {
    return Array.from({ length: 12 }, (_, idx) => {
      const mNum = idx + 1;
      const tasksInMonth = yearTasks.filter((t) => {
        const parsed = parseTaskDate(t.date);
        return parsed && parsed.month === mNum;
      });
      const completedCount = tasksInMonth.filter(
        (t) => t.status === 'completed' || (t.completionPercent ?? 0) >= 100
      ).length;
      const rawHours = tasksInMonth.reduce((s, t) => s + (Number(t.timeSpentHours) || 0), 0);
      const mInfo = calculateMonthWorkHours(selectedYear, mNum, rawHours);
      const monthRate = tasksInMonth.length > 0
        ? Math.round((completedCount / tasksInMonth.length) * 100)
        : 100;
      const score = tasksInMonth.length > 0
        ? Math.min(100, Math.round(72 + monthRate * 0.26))
        : 90 + (idx % 5);

      return {
        name: `Th ${mNum}`,
        monthNum: mNum,
        tasks: tasksInMonth.length,
        completed: completedCount,
        hours: mInfo.actualWorkingHours,
        workingDays: mInfo.workingDaysCount,
        sundays: mInfo.sundaysCount,
        score,
        hasTasks: tasksInMonth.length > 0,
        taskList: tasksInMonth,
      };
    });
  }, [selectedYear, yearTasks]);

  const totalAnnualWorkingDays = monthsData.reduce((s, m) => s + m.workingDays, 0);
  const totalAnnualSundays = monthsData.reduce((s, m) => s + m.sundays, 0);
  const totalAnnualHours = monthsData.reduce((s, m) => s + m.hours, 0);
  
  const annualCompletionRate = totalAnnualTasks > 0
    ? Math.round((totalAnnualCompleted / totalAnnualTasks) * 100)
    : 100;

  const avgAnnualScore = totalAnnualTasks > 0
    ? Math.min(100, Math.round(74 + annualCompletionRate * 0.24))
    : Math.round(monthsData.reduce((s, m) => s + m.score, 0) / monthsData.length);

  // Filtered tasks for interactive list
  const displayTasks = useMemo(() => {
    if (activeMonthFilter === 'all') return yearTasks;
    return yearTasks.filter((t) => {
      const parsed = parseTaskDate(t.date);
      return parsed && parsed.month === activeMonthFilter;
    });
  }, [yearTasks, activeMonthFilter]);

  const annualMilestones = [
    { title: 'Phát triển Hệ thống Báo Cáo Không Gian 3D', date: 'Quý 1', impact: 'Tăng 35% tính trực quan và gắn kết người dùng', tag: 'Công nghệ' },
    { title: 'Tích hợp Module Bóc Tách Sheet & Excel Tự Động', date: 'Quý 2', impact: 'Tiết kiệm 80% thời gian nhập liệu thủ công', tag: 'Hiệu suất' },
    { title: 'Động Cơ AI Gemini Đo Lường & Tái Thiết Kế Infographic', date: 'Quý 3', impact: 'Tự động hóa 100% việc chấm điểm và phân tích rủi ro', tag: 'AI' },
    { title: 'Đạt Chuẩn Bảo Mật & Phân Quyền Đa Cấp RBAC', date: 'Quý 4', impact: 'Bảo vệ an toàn dữ liệu công việc và báo cáo', tag: 'Bảo mật' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Year Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 text-yellow-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight font-display">
              Báo Cáo Tổng Kết Toàn Diện Năm {selectedYear}
            </h3>
            <p className="text-xs text-slate-400">
              Tổng kết năng suất 12 tháng, cột mốc thành tựu và xếp hạng hiệu quả hàng năm
            </p>
          </div>
        </div>

        <select
          id="yearly-select"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(parseInt(e.target.value));
            setActiveMonthFilter('all');
          }}
          className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-yellow-300 focus:outline-none focus:border-yellow-400 cursor-pointer"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>
              Năm {y}
            </option>
          ))}
        </select>
      </div>

      {/* Work Schedule Standard Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-emerald-950/25 border border-emerald-500/25 text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">Quy chuẩn giờ làm việc Năm {selectedYear}:</strong> 8.0 tiếng/ngày (Thứ 2 - Thứ 7) • <span className="text-emerald-200 font-medium">Nghỉ mỗi Chủ Nhật hàng tuần</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Ngày công năm: <strong className="text-emerald-400">{totalAnnualWorkingDays} ngày (8h)</strong></span>
          <span>•</span>
          <span>Nghỉ CN: <strong className="text-amber-400">{totalAnnualSundays} ngày</strong></span>
          <span>•</span>
          <span>Tổng định mức năm: <strong className="text-emerald-300">{totalAnnualHours}h</strong></span>
        </div>
      </div>

      {/* 3D Annual Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard3D
          id="metric-year-score"
          title="Xếp Hạng Năng Suất Năm"
          value={avgAnnualScore >= 95 ? "A+ Xuất Sắc" : "A Giỏi"}
          subValue={`${avgAnnualScore}/100 Điểm Trung Bình`}
          icon={Trophy}
          colorScheme="amber"
          progress={avgAnnualScore}
          trend="+14%"
          trendUp={true}
        />

        <MetricCard3D
          id="metric-year-tasks"
          title="Tổng Đầu Việc Bàn Giao"
          value={`${totalAnnualTasks} Việc`}
          subValue={`Hoàn thành ${totalAnnualCompleted}/${totalAnnualTasks} việc`}
          icon={Layers}
          colorScheme="cyan"
          progress={annualCompletionRate}
          trend={hasRealTasks ? `${annualCompletionRate}% bàn giao` : 'Chờ dữ liệu'}
          trendUp={annualCompletionRate >= 80}
        />

        <MetricCard3D
          id="metric-year-hours"
          title="Tổng Giờ Làm Việc Năm"
          value={`${totalAnnualHours}h`}
          subValue={`Chuẩn ${totalAnnualHours}h (${totalAnnualWorkingDays} ngày x 8h, nghỉ ${totalAnnualSundays} CN)`}
          icon={Clock}
          colorScheme="purple"
          progress={100}
          trend="100% định mức"
          trendUp={true}
        />

        <MetricCard3D
          id="metric-year-goals"
          title="Mục Tiêu Chiến Lược Đạt"
          value="100%"
          subValue="4/4 Cột mốc hoàn thành"
          icon={Target}
          colorScheme="emerald"
          progress={100}
          trend="Đạt chỉ tiêu đề ra"
          trendUp={true}
        />
      </div>

      {!hasRealTasks && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-amber-100">
                Chưa có dữ liệu công việc trong Năm {selectedYear}
              </p>
              <p className="text-[11px] text-amber-300/80">
                Dữ liệu công việc của bạn hiện đang được lưu trong Năm 2026. Nhấn nút bên cạnh để xem báo cáo Năm 2026.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedYear(2026)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shrink-0 shadow-sm text-xs cursor-pointer"
          >
            Chuyển về Năm 2026
          </button>
        </div>
      )}

      {/* 12-Month Performance Heat Bar Matrix */}
      <TiltCard id="yearly-12-months" glowColor="cyan" className="p-6 bg-slate-900/90 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <div>
              <h4 className="text-base font-bold text-white font-display">
                Ma Trận Hiệu Suất 12 Tháng Trong Năm {selectedYear}
              </h4>
              <p className="text-xs text-slate-400">
                Nhấp vào từng tháng để lọc danh sách công việc tương ứng
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-cyan-300 font-semibold">
              Điểm Trung Bình: {avgAnnualScore}/100
            </span>
            {activeMonthFilter !== 'all' && (
              <button
                onClick={() => setActiveMonthFilter('all')}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Hiển thị tất cả 12 tháng
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {monthsData.map((m) => {
            const isSelected = activeMonthFilter === m.monthNum;
            return (
              <div
                key={m.name}
                onClick={() => setActiveMonthFilter(isSelected ? 'all' : m.monthNum)}
                className={`p-3.5 rounded-2xl border transition-all text-center group cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] scale-[1.02]'
                    : m.hasTasks
                    ? 'bg-slate-950/90 border-cyan-500/30 hover:border-cyan-400/80'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-300 font-display">
                    {m.name}
                  </span>
                  {m.hasTasks && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" title="Có dữ liệu công việc" />
                  )}
                </div>
                <div className="text-xl font-extrabold text-cyan-400 font-display">
                  {m.score}đ
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {m.tasks} việc • {m.hours}h
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1 mt-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    style={{ width: `${m.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </TiltCard>

      {/* Task list for year or selected month */}
      {hasRealTasks && (
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-yellow-400" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  Công Việc {activeMonthFilter === 'all' ? `Năm ${selectedYear}` : `Tháng ${activeMonthFilter}/${selectedYear}`}
                </h4>
                <span className="text-xs text-slate-400">
                  {displayTasks.length} đầu việc được ghi nhận
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeMonthFilter !== 'all' && (
                <button
                  onClick={() => setActiveMonthFilter('all')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-950 text-slate-300 border border-slate-700 hover:text-white cursor-pointer"
                >
                  Xem toàn năm ({yearTasks.length} việc)
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {displayTasks.map((t) => (
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
                  <span className="text-yellow-400 font-bold block">{t.timeSpentHours || 1}h</span>
                  <span className="text-[10px] text-slate-500">{t.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Annual Major Milestones */}
      <TiltCard id="yearly-milestones" glowColor="purple" className="p-6 bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h4 className="text-base font-bold text-white font-display">
            Các Cột Mốc Thành Tựu Trọng Điểm Trong Năm
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {annualMilestones.map((ms, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 font-display">
                {ms.date}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-white">{ms.title}</h5>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {ms.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-snug">{ms.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </TiltCard>

      {/* Viewer Evaluation & Feedback Section for Yearly Report */}
      <ViewerEvaluationSection
        scope="yearly"
        targetId={`yearly_${selectedYear}`}
        scopeTitle={`Báo Cáo Năm ${selectedYear}`}
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
