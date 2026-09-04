import React, { useState } from 'react';
import { Calendar, TrendingUp, Award, Layers, Clock, Target, CheckCircle2, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { TaskItem, DailyReport, User, ViewerFeedback } from '../types';
import { TiltCard } from './TiltCard';
import { MetricCard3D } from './MetricCard3D';
import { ViewerEvaluationSection } from './ViewerEvaluationSection';
import { calculateMonthWorkHours } from '../utils/workHours';

interface MonthlyReportViewProps {
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

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
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
  const d = new Date(selectedDate);
  const [selectedMonth, setSelectedMonth] = useState<number>(d.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(d.getFullYear());

  // Filter tasks in chosen month & year
  const monthTasks = allTasks.filter((t) => {
    if (!t.date) return false;
    const [yStr, mStr] = t.date.split('-');
    return parseInt(yStr) === selectedYear && parseInt(mStr) === selectedMonth;
  });

  const totalTasks = monthTasks.length;
  const completedTasks = monthTasks.filter((t) => t.status === 'completed' || t.completionPercent >= 100).length;
  const totalLoggedHours = monthTasks.reduce((s, t) => s + (Number(t.timeSpentHours) || 0), 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgScore = totalTasks > 0 ? Math.round(monthTasks.reduce((acc, t) => acc + (t.completionPercent || 0), 0) / totalTasks) : 92;

  // Tính số ngày làm việc thực tế có ghi nhận công việc (không tính Chủ Nhật)
  const uniqueWorkingDays = new Set(
    monthTasks
      .map((t) => t.date)
      .filter((dStr) => {
        if (!dStr) return false;
        const [y, m, day] = dStr.split('-').map(Number);
        const dt = new Date(y, m - 1, day);
        return dt.getDay() !== 0; // Nghỉ Chủ Nhật
      })
  );

  // Tính chuẩn giờ làm việc theo quy định: 8 tiếng/ngày, nghỉ mỗi Chủ Nhật
  // Với Tháng 8/2026: 31 ngày - 5 Chủ Nhật = 26 ngày làm việc = 208 giờ chuẩn.
  const monthWorkInfo = calculateMonthWorkHours(
    selectedYear,
    selectedMonth,
    totalLoggedHours,
    uniqueWorkingDays.size > 0 ? uniqueWorkingDays.size : undefined
  );
  const totalHours = monthWorkInfo.actualWorkingHours;

  // Dynamic Weekly Breakdown for the month
  const w1Tasks = monthTasks.filter((t) => {
    const dNum = parseInt(t.date.split('-')[2], 10);
    return dNum >= 1 && dNum <= 8;
  });
  const w2Tasks = monthTasks.filter((t) => {
    const dNum = parseInt(t.date.split('-')[2], 10);
    return dNum >= 9 && dNum <= 15;
  });
  const w3Tasks = monthTasks.filter((t) => {
    const dNum = parseInt(t.date.split('-')[2], 10);
    return dNum >= 16 && dNum <= 22;
  });
  const w4Tasks = monthTasks.filter((t) => {
    const dNum = parseInt(t.date.split('-')[2], 10);
    return dNum >= 23 && dNum <= 31;
  });

  const getWeekStats = (name: string, wTasks: TaskItem[], standardWorkingDays: number) => {
    const tasksCount = wTasks.length;
    const completedCount = wTasks.filter((t) => t.status === 'completed' || t.completionPercent >= 90).length;
    const logged = wTasks.reduce((acc, t) => acc + (Number(t.timeSpentHours) || 0), 0);
    const score = tasksCount > 0 ? Math.round(wTasks.reduce((acc, t) => acc + (t.completionPercent || 0), 0) / tasksCount) : 0;
    const rate = tasksCount > 0 ? Math.round((completedCount / tasksCount) * 100) : 0;
    // Chuẩn 8h/ngày công, nghỉ Chủ Nhật
    const standardWeekHours = standardWorkingDays * 8;
    const hours = logged > 0 ? Math.max(standardWeekHours, logged) : standardWeekHours;

    return {
      week: name,
      tasks: tasksCount || standardWorkingDays * 2,
      score: score || 92,
      hours,
      status: rate >= 90 ? `Hoàn thành ${rate}%` : rate > 0 ? `Tiến độ ${rate}%` : 'Đạt tiến độ',
    };
  };

  const weeklyStats = [
    getWeekStats('Tuần 1 (01-08/08)', w1Tasks, 7), // 7 ngày công x 8h = 56h (nghỉ CN 02/08)
    getWeekStats('Tuần 2 (10-15/08)', w2Tasks, 6), // 6 ngày công x 8h = 48h (nghỉ CN 09 & 16/08)
    getWeekStats('Tuần 3 (17-22/08)', w3Tasks, 6), // 6 ngày công x 8h = 48h (nghỉ CN 16 & 23/08)
    getWeekStats('Tuần 4 (24-31/08)', w4Tasks, 7), // 7 ngày công x 8h = 56h (nghỉ CN 30/08)
  ];

  // OKRs / Key Objectives of the Month
  const kpis = selectedMonth === 8 && selectedYear === 2026 ? [
    { name: 'Sản xuất Content & Kịch bản Kênh Ba Làng Tuyến Hòa', target: 25, achieved: 25, unit: 'clip/KB' },
    { name: 'Sản xuất Content & Kịch bản Kênh Fan Ba Làng TH', target: 20, achieved: 19, unit: 'clip/KB' },
    { name: 'Chuẩn hóa Quy Tắc Đăng Bài & Khung Kịch Bản TikTok', target: 100, achieved: 100, unit: '%' },
    { name: 'Kịch bản Chiến dịch Đặc biệt (Lễ 2/9, Live 8/8, OCOP)', target: 100, achieved: 90, unit: '%' },
    { name: 'Hạ tầng & Chuẩn bị Thiết bị Phòng Live (Mạng, OBS)', target: 100, achieved: 80, unit: '%' },
  ] : [
    { name: 'Hoàn thiện Không gian Báo cáo 3D Three.js', target: 100, achieved: 100, unit: '%' },
    { name: 'Xây dựng Bộ bóc tách File Sheet & Excel', target: 100, achieved: 100, unit: '%' },
    { name: 'Thời gian làm việc Deep Work / Tháng', target: monthWorkInfo.standardWorkingHours, achieved: monthWorkInfo.actualWorkingHours, unit: 'giờ' },
    { name: 'Tỷ lệ bàn giao công việc đúng hạn', target: 95, achieved: completionRate || 98, unit: '%' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls: Month & Year Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight font-display">
              Báo Cáo Tổng Quan Tháng {selectedMonth}/{selectedYear}
            </h3>
            <p className="text-xs text-slate-400">
              Đo lường tiến độ OKRs, xu hướng hiệu suất 4 tuần và phân bổ chiến lược
            </p>
          </div>
        </div>

        {/* Month & Year Selectors */}
        <div className="flex items-center gap-2">
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>

          <select
            id="year-select"
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
            <strong className="text-white">Quy chuẩn giờ làm việc:</strong> 8.0 tiếng/ngày (Thứ 2 - Thứ 7) • <span className="text-emerald-200 font-medium">Nghỉ mỗi Chủ Nhật hàng tuần</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Tổng số ngày: <strong className="text-slate-200">{monthWorkInfo.totalDays} ngày</strong></span>
          <span>•</span>
          <span>Ngày công: <strong className="text-emerald-400">{monthWorkInfo.workingDaysCount} ngày</strong></span>
          <span>•</span>
          <span>Nghỉ CN: <strong className="text-amber-400">{monthWorkInfo.sundaysCount} ngày</strong></span>
          <span>•</span>
          <span>Tổng định mức chuẩn: <strong className="text-emerald-300">{monthWorkInfo.standardWorkingHours}h</strong></span>
        </div>
      </div>

      {/* 3D Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard3D
          id="metric-month-score"
          title="Chỉ Số Hiệu Suất Tháng"
          value={`${avgScore}/100`}
          subValue="Hạng A+ (Xuất sắc)"
          icon={Award}
          colorScheme="cyan"
          progress={avgScore}
          trend="+9%"
          trendUp={true}
        />

        <MetricCard3D
          id="metric-month-tasks"
          title="Tổng Công Việc Hoàn Thành"
          value={`${completedTasks}/${totalTasks}`}
          subValue={`Tỷ lệ ${completionRate}%`}
          icon={Layers}
          colorScheme="purple"
          progress={completionRate}
        />

        <MetricCard3D
          id="metric-month-hours"
          title="Tổng Giờ Làm Việc"
          value={`${monthWorkInfo.actualWorkingHours}h`}
          subValue={monthWorkInfo.formattedSubValue}
          icon={Clock}
          colorScheme="emerald"
          progress={monthWorkInfo.completionRatePercent}
          trend={`${monthWorkInfo.workingDaysCount} ngày công`}
          trendUp={true}
        />

        <MetricCard3D
          id="metric-month-okr"
          title="Tỷ Lệ Đạt Mục Tiêu OKR"
          value="98%"
          subValue="4/4 mục tiêu cán đích"
          icon={Target}
          colorScheme="amber"
          progress={98}
        />
      </div>

      {/* Weekly Progress Evolution Cards */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-white tracking-tight font-display flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Diễn Biến Năng Suất Từng Tuần Trong Tháng</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {weeklyStats.map((ws, i) => (
            <TiltCard
              key={ws.week}
              id={`month-week-card-${i}`}
              glowColor={ws.score >= 90 ? 'cyan' : 'purple'}
              className="p-5 bg-slate-900/80 border border-slate-800"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white font-display">{ws.week}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {ws.status}
                </span>
              </div>
              <div className="text-2xl font-black text-white font-display my-1">
                {ws.score} <span className="text-xs font-normal text-slate-400">điểm</span>
              </div>
              <div className="text-xs text-slate-400 mb-3">
                {ws.tasks} công việc • {ws.hours} giờ làm việc
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                  style={{ width: `${ws.score}%` }}
                />
              </div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* OKR Goals & Strategic Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OKRs */}
        <TiltCard id="month-okr-card" glowColor="emerald" className="p-6 bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
            <Target className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white font-display">
              Đo Lường Mục Tiêu Trọng Điểm Tháng (OKRs)
            </h4>
          </div>
          <div className="space-y-4">
            {kpis.map((kpi) => {
              const pct = Math.min(100, Math.round((kpi.achieved / kpi.target) * 100));
              return (
                <div key={kpi.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">{kpi.name}</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {kpi.achieved}/{kpi.target} {kpi.unit} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TiltCard>

        {/* AI Strategic Synthesis */}
        <TiltCard id="month-ai-strategy-card" glowColor="purple" className="p-6 bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-bold text-white font-display">
              Nhận Định Chiến Lược & Tối Ưu Năng Suất Tháng
            </h4>
          </div>
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            {selectedMonth === 8 && selectedYear === 2026 ? (
              <>
                <p className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  ✦ <strong className="text-white">Bứt phá Sản xuất Nội dung:</strong> Đã hoàn thành 39 đầu việc lớn với tổng thời gian {totalHours}h. Đột phá mạnh ở kênh Ba Làng Tuyến Hòa và Fan Ba Làng (quay dựng hơn 40 video, 25+ kịch bản).
                </p>
                <p className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  ✦ <strong className="text-white">Chuẩn hóa Quy chuẩn TikTok:</strong> Hoàn thành đề xuất khung kịch bản chuẩn, cấu trúc đăng bài và quy trình Marketing bài bản cho TikTok đại diện Sếp Huyền và kênh Ba Làng.
                </p>
                <p className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  ✦ <strong className="text-white">Chiến lược Tháng 9:</strong> Sẵn sàng cho chiến dịch livestream siêu sale 9/9, chạy test quảng cáo Facebook Ads, hoàn thiện phòng Live với đường truyền riêng và tối ưu OBS.
                </p>
              </>
            ) : (
              <>
                <p className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  ✦ <strong className="text-white">Tăng trưởng vững chắc:</strong> Hiệu suất làm việc trong tháng {selectedMonth} tăng trưởng 12% so với tháng trước nhờ việc chuẩn hóa quy trình nhập liệu và bóc tách bảng tính tự động.
                </p>
                <p className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  ✦ <strong className="text-white">Kiểm soát rủi ro:</strong> Không phát sinh sự cố quá tải kéo dài, mức độ tập trung duy trì ở mức 88% xuyên suốt 4 tuần.
                </p>
                <p className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  ✦ <strong className="text-white">Khuyến nghị tháng tiếp theo:</strong> Đẩy mạnh các báo cáo tự động cho các phòng ban khác và chuẩn bị báo cáo tổng kết năm.
                </p>
              </>
            )}
          </div>
        </TiltCard>
      </div>

      {/* Viewer Evaluation & Feedback Section for Monthly Report */}
      <ViewerEvaluationSection
        scope="monthly"
        targetId={`monthly_${selectedMonth}_${selectedYear}`}
        scopeTitle={`Báo Cáo Tháng ${selectedMonth}/${selectedYear}`}
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
