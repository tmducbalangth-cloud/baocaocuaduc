import React, { useState } from 'react';
import { X, Copy, Check, Printer, Download, FileText, Sparkles } from 'lucide-react';
import { DailyReport, WeeklyReport, ViewTab } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ViewTab;
  currentDailyReport?: DailyReport | null;
  currentWeeklyReport?: WeeklyReport | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  currentDailyReport,
  currentWeeklyReport,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = (): string => {
    if (activeTab === 'daily' && currentDailyReport) {
      const r = currentDailyReport;
      return `# BÁO CÁO CÔNG VIỆC NGÀY ${r.date}
**Đánh giá:** ${r.evaluationGrade} (${r.productivityScore}/100 Điểm) | **Trạng thái:** ${r.status.toUpperCase()}
**Người lập:** ${r.author}

## 1. TỔNG QUAN KẾT QUẢ
${r.summary}

## 2. CHI TIẾT CÁC CÔNG VIỆC THỰC HIỆN (${r.tasks.length} đầu việc)
${r.tasks
  .map(
    (t, i) =>
      `${i + 1}. **[${t.status === 'completed' ? 'x' : ' '}] ${t.title}**
   - Danh mục: ${t.category} | Số lượng: ${t.quantity || 1} | Thời gian: ${t.timeSpentHours}h | Tiến độ: ${t.completionPercent}%
   - KPI đo lường: ${t.kpiMetric || 'Đạt yêu cầu'}
   - Kết quả: ${t.outcome || 'Đã hoàn thành'}`
  )
  .join('\n')}

## 3. ĐIỂM NỔI BẬT & ĐIỂM NGHẼN
- **Thế mạnh/Nổi bật:** ${r.highlights.join('; ') || 'Không có'}
- **Tồn đọng/Cần tối ưu:** ${r.bottlenecks.join('; ') || 'Không có'}

${
  r.aiAnalysis
    ? `## 4. PHÂN TÍCH ĐO LƯỜNG TỪ AI CHUYÊN GIA
- **Tải lượng:** ${r.aiAnalysis.workloadScore}/10 | **Rủi ro quá tải:** ${r.aiAnalysis.burnoutRisk}
- **Khuyến nghị:** ${r.aiAnalysis.recommendations.join('; ')}`
    : ''
}
`;
    } else if (activeTab === 'weekly' && currentWeeklyReport) {
      const w = currentWeeklyReport;
      return `# BÁO CÁO TỔNG HỢP TUẦN ${w.weekNumber} (${w.startDate} - ${w.endDate})
**Xếp loại:** ${w.rating || 'Xuất sắc (A+)'} | **Điểm TB:** ${w.avgProductivityScore}/100
**Tổng số việc:** ${w.completedTasks}/${w.totalTasks} | **Tổng giờ làm:** ${w.totalHours}h

## 1. TỔNG KẾT ĐIỀU HÀNH
${w.aiExecutiveSummary || 'Đã hoàn thành tốt các mục tiêu tuần.'}

## 2. CHỈ SỐ ĐO LƯỜNG TUẦN
- Tỷ lệ bàn giao (Delivery Rate): ${w.measurementMetrics?.deliveryRate || '95%'}
- Chỉ số hiệu quả (Efficiency Index): ${w.measurementMetrics?.efficiencyIndex || `${w.avgProductivityScore}/100`}
- Tỷ lệ tập trung (Focus Ratio): ${w.measurementMetrics?.focusRatio || '88%'}
- Tối ưu hóa thời gian: ${w.measurementMetrics?.timeOptimization || '+15%'}

## 3. THÀNH TỰU NỔI BẬT
${w.keyAchievements.map((a) => `- ${a}`).join('\n')}

## 4. MỤC TIÊU TUẦN TIẾP THEO
${w.nextWeekGoals.map((g) => `- ${g}`).join('\n')}
`;
    }
    return `# BÁO CÁO CÔNG VIỆC 3D WORKREPORT PRO
Thời gian xuất: ${new Date().toLocaleString('vi-VN')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const markdownText = generateMarkdown();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(6,182,212,0.25)] p-6 md:p-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-display">
                Xuất Báo Cáo & Chia Sẻ
              </h2>
              <p className="text-xs text-slate-400">
                Định dạng chuẩn doanh nghiệp, sao chép nhanh hoặc in ấn PDF
              </p>
            </div>
          </div>
          <button
            id="close-export-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Markdown Box */}
        <div className="my-4 flex-1 overflow-y-auto bg-slate-950/90 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
          {markdownText}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Đã tích hợp đầy đủ chỉ số đo lường & đánh giá AI</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="export-print-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>In / Lưu PDF</span>
            </button>

            <button
              id="export-copy-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Đã Sao Chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao Chép Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
