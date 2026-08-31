import React, { useState } from 'react';
import { Calendar, TrendingUp, Award, Layers, Clock, Target, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { TaskItem, DailyReport } from '../types';
import { TiltCard } from './TiltCard';
import { MetricCard3D } from './MetricCard3D';

interface MonthlyReportViewProps {
  selectedDate: string;
  allTasks: TaskItem[];
  dailyReports: DailyReport[];
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  selectedDate,
  allTasks,
  dailyReports,
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

  const totalTasks = monthTasks.length || 28;
  const completedTasks = monthTasks.filter((t) => t.status === 'completed' || t.completionPercent >= 100).length || 26;
  const totalHours = monthTasks.reduce((s, t) => s + (Number(t.timeSpentHours) || 0), 0) || 164;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);
  const avgScore = 92;

  // Sample Weekly Breakdown for the month
  const weeklyStats = [
    { week: 'Tuần 1', tasks: 7, score: 90, hours: 40, status: 'Hoàn thành 100%' },
    { week: 'Tuần 2', tasks: 8, score: 94, hours: 42, status: 'Hoàn thành 100%' },
    { week: 'Tuần 3', tasks: 6, score: 88, hours: 38, status: 'Hoàn thành 90%' },
    { week: 'Tuần 4', tasks: 7, score: 95, hours: 44, status: 'Xuất sắc 100%' },
  ];

  // OKRs / Key Objectives of the Month
  const kpis = [
    { name: 'Hoàn thiện Không gian Báo cáo 3D Three.js', target: 100, achieved: 100, unit: '%' },
    { name: 'Xây dựng Bộ bóc tách File Sheet & Excel', target: 100, achieved: 100, unit: '%' },
    { name: 'Thời gian làm việc Deep Work / Tháng', target: 160, achieved: 164, unit: 'giờ' },
    { name: 'Tỷ lệ bàn giao công việc đúng hạn', target: 95, achieved: 98, unit: '%' },
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
          value={`${totalHours}h`}
          subValue="Vượt 4h mục tiêu"
          icon={Clock}
          colorScheme="emerald"
          trend="+15h"
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
            <p className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              ✦ <strong className="text-white">Tăng trưởng vững chắc:</strong> Hiệu suất làm việc trong tháng {selectedMonth} tăng trưởng 12% so với tháng trước nhờ việc chuẩn hóa quy trình nhập liệu và bóc tách bảng tính tự động.
            </p>
            <p className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              ✦ <strong className="text-white">Kiểm soát rủi ro:</strong> Không phát sinh sự cố quá tải kéo dài, mức độ tập trung duy trì ở mức 88% xuyên suốt 4 tuần.
            </p>
            <p className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              ✦ <strong className="text-white">Khuyến nghị tháng tiếp theo:</strong> Đẩy mạnh các báo cáo tự động cho các phòng ban khác và chuẩn bị báo cáo tổng kết năm.
            </p>
          </div>
        </TiltCard>
      </div>
    </div>
  );
};
