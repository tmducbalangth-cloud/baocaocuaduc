import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  Clock,
  Target,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Edit3,
  Trash2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyReport, TaskItem, User, TASK_CATEGORIES, ViewerFeedback } from '../types';
import { TiltCard } from './TiltCard';
import { MetricCard3D } from './MetricCard3D';
import { ViewerEvaluationSection } from './ViewerEvaluationSection';
import { calculateDayWorkHours } from '../utils/workHours';
import { DatePickerPopover } from './DatePickerPopover';

interface DailyReportViewProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  report: DailyReport | null;
  tasks: TaskItem[];
  currentUser: User | null;
  onOpenTaskModal: (task?: TaskItem) => void;
  onOpenSheetModal: () => void;
  onSaveReport: (report: DailyReport) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  feedbacks?: ViewerFeedback[];
  onAddFeedback?: (feedback: Omit<ViewerFeedback, 'id' | 'createdAt'>) => Promise<void> | void;
  onDeleteFeedback?: (id: string) => Promise<void> | void;
  onOpenLoginModal?: () => void;
  onClearMockFeedbacks?: () => Promise<void> | void;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({
  selectedDate,
  onDateChange,
  report,
  tasks,
  currentUser,
  onOpenTaskModal,
  onOpenSheetModal,
  onSaveReport,
  onToggleTaskStatus,
  onDeleteTask,
  feedbacks = [],
  onAddFeedback = () => {},
  onDeleteFeedback = () => {},
  onOpenLoginModal,
  onClearMockFeedbacks,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAiRedesigning, setIsAiRedesigning] = useState(false);
  const [customUserNotes, setCustomUserNotes] = useState('');
  const [showAiConfig, setShowAiConfig] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Quick Date Navigation
  const changeDateByDays = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onDateChange(`${year}-${month}-${day}`);
  };

  const setToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onDateChange(`${year}-${month}-${day}`);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.kpiMetric && task.kpiMetric.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate Metrics
  const totalTasks = tasks.length;
  const totalQuantity = tasks.reduce((sum, t) => sum + (Number(t.quantity) || 1), 0);
  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.completionPercent >= 100).length;
  const totalHours = tasks.reduce((sum, t) => sum + (Number(t.timeSpentHours) || 0), 0);
  const avgCompletion = totalTasks > 0
    ? Math.round(tasks.reduce((sum, t) => sum + (Number(t.completionPercent) || 0), 0) / totalTasks)
    : 0;

  // Tính chuẩn giờ làm việc theo ngày (8h/ngày, nghỉ Chủ Nhật)
  const dayWork = calculateDayWorkHours(selectedDate, totalHours > 0 ? totalHours : undefined);

  const currentScore = report?.productivityScore ?? Math.min(100, Math.round((completedTasks / (totalTasks || 1)) * 60 + avgCompletion * 0.4));
  const currentGrade = report?.evaluationGrade ?? (currentScore >= 90 ? 'A+' : currentScore >= 80 ? 'A' : currentScore >= 70 ? 'B+' : 'B');

  // Trigger AI Redesign & Measurement Engine
  const handleAiRedesign = async () => {
    if (tasks.length === 0) {
      alert('Vui lòng thêm hoặc đẩy file Sheet chứa công việc trước khi Tổng kê!');
      return;
    }

    setIsAiRedesigning(true);
    try {
      const res = await fetch('/api/ai/analyze-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          tasks,
          userNotes: customUserNotes,
        }),
      });

      if (!res.ok) {
        throw new Error('Lỗi từ AI server');
      }

      const data = await res.json();

      const newReport: DailyReport = {
        id: report?.id || `report_${selectedDate}`,
        date: selectedDate,
        tasks,
        summary: data.summary,
        productivityScore: data.productivityScore || 90,
        evaluationGrade: data.evaluationGrade || 'A+',
        highlights: data.highlights || [],
        bottlenecks: data.bottlenecks || [],
        aiAnalysis: data.aiAnalysis,
        author: currentUser?.name || 'Trịnh Minh Đức',
        status: 'approved',
        userNotes: customUserNotes,
        createdAt: report?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSaveReport(newReport);

      // Trigger Confetti Celebration for great performance!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981'],
      });
    } catch (err: any) {
      console.error('Lỗi tổng kê AI:', err);
      // Fallback local report generation
      const fallbackReport: DailyReport = {
        id: report?.id || `report_${selectedDate}`,
        date: selectedDate,
        tasks,
        summary: `Báo cáo Ngày ${selectedDate}: Đã thực hiện ${totalTasks} công việc (${totalHours}h). Hoàn thành dứt điểm ${completedTasks}/${totalTasks} đầu việc đạt tỷ lệ ${avgCompletion}%.`,
        productivityScore: Math.max(60, Math.min(100, Math.round((completedTasks / (totalTasks || 1)) * 60 + avgCompletion * 0.4))),
        evaluationGrade: avgCompletion >= 90 ? 'A+' : avgCompletion >= 75 ? 'A' : 'B',
        highlights: tasks.filter((t) => t.completionPercent >= 90).map((t) => `Hoàn thành: ${t.title}`),
        bottlenecks: tasks.filter((t) => t.status === 'blocked').map((t) => `Cần tháo gỡ: ${t.title}`),
        aiAnalysis: {
          strengths: ['Tiến độ công việc bám sát kế hoạch.', 'Thời gian làm việc tập trung.'],
          improvements: ['Nên giải quyết dứt điểm các đầu việc tồn đọng.'],
          workloadScore: Math.min(10, Math.round(totalHours * 1.1)),
          burnoutRisk: totalHours > 9 ? 'Cao' : 'Thấp',
          recommendations: ['Tối ưu hóa thời gian xử lý thủ công.'],
          infographicSummary: `Hiệu suất tổng thể đạt mức xuất sắc ${avgCompletion}%.`,
        },
        author: currentUser?.name || 'Trịnh Minh Đức',
        status: 'approved',
        createdAt: report?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSaveReport(fallbackReport);
    } finally {
      setIsAiRedesigning(false);
    }
  };

  const categories = Array.from(new Set([...TASK_CATEGORIES, ...tasks.map((t) => t.category)])).filter(Boolean);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls: Date Navigator & Action Buttons */}
      <div className="relative z-30 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
        {/* Date Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <DatePickerPopover
            id="daily-date-picker"
            value={selectedDate}
            onChange={onDateChange}
            label="Ngày xem:"
          />

          <div className="flex items-center gap-1">
            <button
              id="prev-day-btn"
              onClick={() => changeDateByDays(-1)}
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              title="Ngày trước"
            >
              ◀
            </button>
            <button
              id="today-btn"
              onClick={setToday}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-cyan-300 transition-colors"
            >
              Hôm Nay
            </button>
            <button
              id="next-day-btn"
              onClick={() => changeDateByDays(1)}
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              title="Ngày sau"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin ? (
            <>
              <button
                id="daily-upload-sheet-btn"
                onClick={onOpenSheetModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm group"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Đẩy File Sheet / Excel</span>
              </button>

              <button
                id="daily-add-task-btn"
                onClick={() => onOpenTaskModal()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition-all shadow-sm group"
              >
                <Plus className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform" />
                <span>Thêm Công Việc</span>
              </button>

              <button
                id="daily-ai-redesign-btn"
                onClick={handleAiRedesign}
                disabled={isAiRedesigning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-extrabold shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                {isAiRedesigning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                )}
                <span>✨ Tổng Kê & Tái Thiết Kế AI</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Chế độ Người Xem: Đã khóa chỉnh sửa — Tự động cập nhật trực tiếp theo Quản Trị Viên</span>
            </div>
          )}
        </div>
      </div>

      {/* Work Schedule Standard Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-emerald-950/25 border border-emerald-500/25 text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">{dayWork.dayName}:</strong> {dayWork.isSunday ? (
              <span className="text-amber-400 font-medium">Chủ Nhật — Ngày nghỉ tuần theo quy định</span>
            ) : (
              <span>Chuẩn <strong className="text-white">8.0 tiếng/ngày</strong> (Thứ 2 - Thứ 7, nghỉ Chủ Nhật)</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Trạng thái: <strong className={dayWork.isSunday ? "text-amber-400" : "text-emerald-400"}>{dayWork.statusText}</strong></span>
          <span>•</span>
          <span>Định mức chuẩn: <strong className="text-emerald-300">{dayWork.standardHours}h</strong></span>
          <span>•</span>
          <span>Ghi nhận thực tế: <strong className="text-cyan-300">{dayWork.actualHours}h</strong></span>
        </div>
      </div>

      {/* 3D Primary Metric Cards (4 Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard3D
          id="metric-daily-score"
          title="Điểm Năng Suất Ngày"
          value={`${currentScore}/100`}
          subValue={`Hạng ${currentGrade}`}
          icon={Award}
          colorScheme="cyan"
          progress={currentScore}
          trend="+8%"
          trendUp={true}
        />

        <MetricCard3D
          id="metric-daily-tasks"
          title="Tổng Số Công Việc"
          value={`${completedTasks}/${totalTasks}`}
          subValue={`${totalQuantity} số lượng mục`}
          icon={Layers}
          colorScheme="purple"
          progress={totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}
        />

        <MetricCard3D
          id="metric-daily-hours"
          title="Tổng Giờ Làm Việc"
          value={`${dayWork.actualHours}h`}
          subValue={dayWork.formattedSubValue}
          icon={Clock}
          colorScheme="emerald"
          progress={dayWork.isSunday ? (dayWork.actualHours > 0 ? 100 : 0) : 100}
          trend={dayWork.statusText}
          trendUp={true}
        />

        <MetricCard3D
          id="metric-daily-kpi"
          title="Tỷ Lệ Hoàn Thành"
          value={`${avgCompletion}%`}
          subValue="Tiến độ trung bình"
          icon={Target}
          colorScheme="amber"
          progress={avgCompletion}
        />
      </div>

      {/* 3D Infographic Showcase & AI Redesigned Report Card */}
      {report && (
        <TiltCard
          id="daily-ai-infographic-card"
          glowColor="cyan"
          maxTilt={6}
          className="p-6 md:p-8 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.18)]"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight font-display">
                    Bản Báo Cáo Thiết Kế Lại & Đo Lường AI
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                    3D Infographic
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Tự động tổng hợp số liệu, phân tích năng suất và chỉ số KPI ngày {selectedDate}
                </p>
              </div>
            </div>

            {/* Evaluation Grade Pill */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 block">Xếp Loại Hiệu Suất</span>
                <span className="text-xs text-cyan-300 font-bold">{currentScore}/100 Điểm</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center font-black text-xl text-white font-display">
                {report.evaluationGrade}
              </div>
            </div>
          </div>

          {/* AI Redesigned Summary Box */}
          <div className="my-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-2">
              <Zap className="w-4 h-4" />
              <span>Tóm Tắt Tổng Quan Báo Cáo:</span>
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {report.summary}
            </p>
          </div>

          {/* Concrete Measurements Grid (Strengths, Bottlenecks, Workload, Recommendations) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Strengths / Highlights */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Điểm Nổi Bật</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(report.highlights.length > 0 ? report.highlights : report.aiAnalysis?.strengths || ['Tiến độ hoàn thành cao.']).map((h, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">✦</span>
                    <span className="leading-snug">{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottlenecks */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Điểm Nghẽn / Tồn Đọng</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(report.bottlenecks.length > 0 ? report.bottlenecks : ['Không có rào cản lớn nào phát sinh.']).map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 mt-0.5">⚠</span>
                    <span className="leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Workload & Burnout Measurement */}
            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                <Flame className="w-4 h-4" />
                <span>Đo Lường Tải Lượng</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Mức độ tải:</span>
                  <span className="font-bold text-purple-300">{report.aiAnalysis?.workloadScore || 8}/10</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: `${(report.aiAnalysis?.workloadScore || 8) * 10}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-slate-300 pt-1">
                  <span>Rủi ro kiệt sức:</span>
                  <span className={`font-bold ${report.aiAnalysis?.burnoutRisk === 'Cao' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {report.aiAnalysis?.burnoutRisk || 'Thấp'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>Khuyến Nghị Tối Ưu</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(report.aiAnalysis?.recommendations || [
                  'Duy trì tốc độ làm việc hiện tại.',
                  'Tăng cường đo lường định lượng.',
                ]).map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-cyan-400 mt-0.5">➔</span>
                    <span className="leading-snug">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TiltCard>
      )}

      {/* Task List Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight font-display flex items-center gap-2">
              <span>Danh Sách Công Việc Trong Ngày</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                {filteredTasks.length} / {tasks.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Điền từng công việc hoặc đẩy file sheet lên để hệ thống tổng kê và đo lường
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="task-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm công việc, KPI..."
                className="bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-40 sm:w-48"
              />
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                id="task-category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              id="task-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="in_progress">Đang làm</option>
              <option value="pending">Chờ xử lý</option>
              <option value="blocked">Bị nghẽn</option>
            </select>
          </div>
        </div>

        {/* 3D Task Items Grid */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white font-display">
              Chưa có công việc nào trong ngày {selectedDate}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
              Bạn có thể thêm từng công việc thủ công hoặc tải file Sheet/Excel lên để hệ thống tự động bóc tách và đo lường.
            </p>
            {isAdmin && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onOpenSheetModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-emerald-300 flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Đẩy File Sheet</span>
                </button>
                <button
                  onClick={() => onOpenTaskModal()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Công Việc Mới</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed' || task.completionPercent >= 100;
              const isBlocked = task.status === 'blocked';

              return (
                <TiltCard
                  key={task.id}
                  id={`task-card-${task.id}`}
                  maxTilt={8}
                  glowColor={isCompleted ? 'emerald' : isBlocked ? 'amber' : 'cyan'}
                  className={`p-5 transition-all group ${
                    isCompleted ? 'border-emerald-500/30' : 'border-slate-800'
                  }`}
                >
                  {/* Top Bar: Category, Priority, and Status Check */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {task.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                          task.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {task.priority === 'high' ? 'Ưu tiên cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>
                      {task.quantity !== undefined && task.quantity > 0 && (
                        <span className="text-[11px] text-purple-300 font-semibold flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                          <Layers className="w-3 h-3 text-purple-400" />
                          <span>SL: {task.quantity}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{task.timeSpentHours}h</span>
                      </span>
                    </div>

                    {isAdmin ? (
                      <div className="flex items-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          id={`quick-edit-${task.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTaskModal(task);
                          }}
                          title="Chỉnh sửa chi tiết đầu mục này"
                          className="p-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all flex items-center gap-1 text-[11px] font-medium"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Sửa</span>
                        </button>

                        {/* Quick Complete Toggle */}
                        <button
                          id={`toggle-task-${task.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleTaskStatus(task.id);
                          }}
                          title="Chuyển trạng thái hoàn thành"
                          className={`p-1.5 rounded-xl border transition-all ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-cyan-400 hover:text-cyan-300'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Read-Only Status Indicator for Viewers (Locked) */
                      <div className="flex items-center gap-1.5" title="Chế độ người xem: Khóa chỉnh sửa">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 select-none ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : isBlocked
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Đã xong</span>
                            </>
                          ) : isBlocked ? (
                            <>
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              <span>Bị nghẽn</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-cyan-400" />
                              <span>Đang làm</span>
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & Description (Clickable to Edit only for Admin) */}
                  <div
                    onClick={() => {
                      if (isAdmin) {
                        onOpenTaskModal(task);
                      }
                    }}
                    className={isAdmin ? 'cursor-pointer group/title hover:opacity-90 transition-opacity' : 'cursor-default select-text'}
                    title={isAdmin ? 'Bấm để mở form chỉnh sửa công việc này' : undefined}
                  >
                    <h4 className={`text-sm font-bold tracking-tight mb-1 font-display flex items-center justify-between gap-2 ${isCompleted ? 'text-slate-200 line-through opacity-80' : 'text-white group-hover/title:text-cyan-300'}`}>
                      <span>{task.title}</span>
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* KPI Measurement & Outcome Details */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3 space-y-1.5 text-xs">
                    {task.kpiMetric && (
                      <div className="flex items-start gap-1.5">
                        <Target className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-slate-400">KPI Đo lường: </span>
                          <span className="text-purple-300 font-semibold">{task.kpiMetric}</span>
                        </div>
                      </div>
                    )}
                    {task.outcome && (
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-slate-400">Kết quả: </span>
                          <span className="text-slate-200 font-medium">{task.outcome}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-medium">Tiến độ công việc</span>
                      <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-cyan-400'}`}>
                        {task.completionPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        }`}
                        style={{ width: `${task.completionPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Admin Actions: Edit / Delete */}
                  {isAdmin && (
                    <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-800/80 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`edit-task-${task.id}`}
                        onClick={() => onOpenTaskModal(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 text-xs flex items-center gap-1 font-semibold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        id={`delete-task-${task.id}`}
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa '${task.title}'?`)) {
                            onDeleteTask(task.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs flex items-center gap-1 font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  )}
                </TiltCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Viewer Evaluation & Feedback Section */}
      <ViewerEvaluationSection
        scope="daily"
        targetId={`daily_${selectedDate}`}
        scopeTitle={`Báo Cáo Ngày ${selectedDate}`}
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
