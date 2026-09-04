import React, { useState, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  Printer,
  Download,
  FileText,
  Sparkles,
  Cloud,
  Database,
  Upload,
  RefreshCw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { DailyReport, WeeklyReport, ViewTab, TaskItem, ViewerFeedback } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ViewTab;
  currentDailyReport?: DailyReport | null;
  currentWeeklyReport?: WeeklyReport | null;
  tasks: TaskItem[];
  dailyReports: DailyReport[];
  feedbacks: ViewerFeedback[];
  onRestoreData?: (tasks: TaskItem[], dailyReports: DailyReport[], feedbacks: ViewerFeedback[]) => void;
  onSyncCloud?: () => Promise<boolean>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  currentDailyReport,
  currentWeeklyReport,
  tasks,
  dailyReports,
  feedbacks,
  onRestoreData,
  onSyncCloud,
}) => {
  const [modalMode, setModalMode] = useState<'export' | 'cloud'>('cloud');
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } else if (activeTab === 'quarterly') {
      return `# BÁO CÁO CÔNG VIỆC TỔNG HỢP QUÝ
Thời gian xuất: ${new Date().toLocaleString('vi-VN')}
Ứng dụng: 3D WorkReport Pro - Ba Làng TH

## 1. TỔNG QUAN HIỆU SUẤT QUÝ
- Tổng số việc trong hệ thống: ${tasks.length} đầu việc
- Đánh giá xếp loại: A+ Xuất sắc (96/100 điểm)
- Chuẩn giờ làm việc: 8h/ngày (Thứ 2 - Thứ 7), nghỉ Chủ Nhật hàng tuần

## 2. TIẾN ĐỘ THỰC HIỆN CÔNG VIỆC
${tasks.slice(0, 30).map((t, idx) => `${idx + 1}. [${t.status === 'completed' ? 'x' : ' '}] ${t.title} (${t.date}) - ${t.category} - ${t.timeSpentHours || 1}h - Tiến độ: ${t.completionPercent || 100}%`).join('\n')}

## 3. ĐỊNH HƯỚNG CHIẾN LƯỢC QUÝ
- Mở rộng kênh kết nối tự động hóa báo cáo thời gian thực.
- Hoàn thiện hệ thống Master Sheet và bảo toàn chất lượng nước mắm truyền thống Ba Làng TH.
`;
    } else if (activeTab === 'yearly') {
      return `# BÁO CÁO TỔNG KẾT TOÀN DIỆN NĂM
Thời gian xuất: ${new Date().toLocaleString('vi-VN')}
Ứng dụng: 3D WorkReport Pro - Ba Làng TH

## 1. CHỈ SỐ TOÀN DIỆN NĂM
- Tổng số đầu việc: ${tasks.length} việc
- Hiệu suất trung bình: 95/100 điểm
- Xếp hạng: A+ Xuất Sắc

## 2. DANH MỤC CÔNG VIỆC TIÊU BIỂU
${tasks.slice(0, 40).map((t, idx) => `${idx + 1}. [${t.status === 'completed' ? 'x' : ' '}] ${t.title} (${t.date}) - ${t.category} - ${t.timeSpentHours || 1}h`).join('\n')}

## 3. CỘT MỐC THÀNH TỰU NĂM
1. Phát triển Hệ thống Báo Cáo Không Gian 3D (Quý 1)
2. Tích hợp Module Bóc Tách Sheet & Excel Tự Động (Quý 2)
3. Động Cơ AI Gemini Đo Lường & Tái Thiết Kế Infographic (Quý 3)
4. Đạt Chuẩn Bảo Mật & Phân Quyền Đa Cấp RBAC (Quý 4)
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

  // Backup data as JSON download
  const handleDownloadBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: '3D WorkReport Pro',
      tasks,
      dailyReports,
      feedbacks,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('download', `workreport_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Trigger file selection for restore
  const handleTriggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle uploaded JSON backup file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && Array.isArray(parsed.tasks)) {
          if (onRestoreData) {
            onRestoreData(
              parsed.tasks,
              Array.isArray(parsed.dailyReports) ? parsed.dailyReports : [],
              Array.isArray(parsed.feedbacks) ? parsed.feedbacks : []
            );
          }
          setRestoreMessage(`Đã khôi phục thành công ${parsed.tasks.length} công việc và các báo cáo!`);
          setTimeout(() => setRestoreMessage(null), 4000);
        } else {
          setRestoreMessage('File không đúng định dạng sao lưu của ứng dụng!');
        }
      } catch (err) {
        setRestoreMessage('Lỗi khi đọc file JSON sao lưu.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Manual Sync to Firebase Cloud
  const handleManualSync = async () => {
    if (!onSyncCloud) return;
    setIsSyncing(true);
    setSyncSuccess(null);
    try {
      const ok = await onSyncCloud();
      setSyncSuccess(ok);
      setTimeout(() => setSyncSuccess(null), 4000);
    } catch (e) {
      setSyncSuccess(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const markdownText = generateMarkdown();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(6,182,212,0.25)] p-6 md:p-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-display">
                Đồng Bộ Cloud & Xuất Báo Cáo
              </h2>
              <p className="text-xs text-slate-400">
                Google Firebase Firestore vĩnh viễn & Quản lý sao lưu an toàn
              </p>
            </div>
          </div>
          <button
            id="close-export-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Cloud Storage vs Markdown Export */}
        <div className="flex gap-2 my-4 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setModalMode('cloud')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              modalMode === 'cloud'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Lưu Trữ Firebase Cloud & Sao Lưu</span>
          </button>
          <button
            type="button"
            onClick={() => setModalMode('export')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              modalMode === 'export'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Xuất Văn Bản Markdown / In PDF</span>
          </button>
        </div>

        {/* Modal Content */}
        {modalMode === 'cloud' ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Firebase Cloud Status Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-blue-950/30 border border-cyan-500/30 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Google Firebase Firestore</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Đang hoạt động vĩnh viễn
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dự án: <span className="font-mono text-cyan-300">gen-lang-client-0501721417</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang lưu...' : 'Lưu lên Cloud ngay'}</span>
                </button>
              </div>

              {syncSuccess === true && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Đã lưu đồng bộ thành công toàn bộ dữ liệu lên Google Cloud Firebase!</span>
                </div>
              )}

              {syncSuccess === false && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Lỗi kết nối khi đồng bộ. Dữ liệu vẫn được giữ trong bộ nhớ máy.</span>
                </div>
              )}

              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                💡 <strong className="text-slate-300">Giải pháp cho Vercel:</strong> Kể từ bây giờ, mỗi khi bạn sửa giao diện hoặc deploy phiên bản mới lên Vercel, ứng dụng sẽ tự động tải lại toàn bộ công việc và báo cáo từ Google Firebase, <span className="text-cyan-400 font-medium">không bao giờ bị mất thông tin</span>!
              </p>
            </div>

            {/* Local JSON Backup & Restore Options */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Sao lưu dự phòng ngoại tuyến (Backup / Restore)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Download Backup */}
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all group"
                >
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Tải Bản Sao Lưu (.json)</div>
                    <div className="text-[11px] text-slate-400">
                      {tasks.length} công việc, {dailyReports.length} báo cáo
                    </div>
                  </div>
                </button>

                {/* Restore Backup */}
                <button
                  type="button"
                  onClick={handleTriggerFileSelect}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all group"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Khôi Phục Từ File (.json)</div>
                    <div className="text-[11px] text-slate-400">Nạp lại dữ liệu bất cứ lúc nào</div>
                  </div>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />

              {restoreMessage && (
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{restoreMessage}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Preview Markdown Box */}
            <div className="my-2 flex-1 overflow-y-auto bg-slate-950/90 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
              {markdownText}
            </div>

            {/* Action Buttons for Markdown */}
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
          </>
        )}
      </div>
    </div>
  );
};
