import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  Link2,
  Globe,
  Calendar,
  Trash2,
  ArrowRight,
  ExternalLink,
  Layers,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TaskItem, TaskCategory, TaskPriority, TaskStatus, normalizeCategory } from '../types';

interface SheetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate: string;
  onImportTasks: (newTasks: TaskItem[]) => void;
}

// User default sheet link from conversation
const DEFAULT_USER_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1JPukE8hzHZgz7_n282BRY_SGEKLEBdwo4WwmHFd4kbM/edit?gid=0#gid=0';

// Robust CSV row splitter that respects quoted strings
function parseCsvRows(text: string): string[][] {
  const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    const cells: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuote && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (c === ',' && !inQuote) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    cells.push(cur.trim());
    return cells;
  });
}

// Parse dates like 1/8/2026, 04/09/2026, 2026-09-04
function parseVnDate(val: any): string | null {
  if (!val) return null;
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = m[2].padStart(2, '0');
    const year = m[3];
    return `${year}-${month}-${day}`;
  }
  return null;
}

export const SheetImportModal: React.FC<SheetImportModalProps> = ({
  isOpen,
  onClose,
  targetDate,
  onImportTasks,
}) => {
  const [tab, setTab] = useState<'sheet_link' | 'paste' | 'upload'>('sheet_link');
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_USER_SHEET_URL);
  const [pastedText, setPastedText] = useState('');
  const [parsedTasks, setParsedTasks] = useState<TaskItem[]>([]);
  const [importScope, setImportScope] = useState<'all_dates' | 'target_date'>('all_dates');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset notifications on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setStatusMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto-detect if pasted text is actually a Google Sheet URL
  const isPastedSheetUrl =
    pastedText.trim().includes('docs.google.com/spreadsheets') ||
    pastedText.trim().startsWith('http');

  // Convert raw CSV rows into normalized TaskItem objects with date forward-filling
  const processCsvData = (csvText: string, defaultDate: string): TaskItem[] => {
    const rows = parseCsvRows(csvText);
    if (rows.length <= 1) return [];

    const headers = rows[0].map((h) => h.toLowerCase());
    const dateIdx = headers.findIndex((h) => h.includes('ngày') || h.includes('date'));
    const titleIdx = headers.findIndex(
      (h) => h.includes('công việc') || h.includes('tên') || h.includes('đầu việc') || h.includes('task')
    );
    const descIdx = headers.findIndex((h) => h.includes('mô tả') || h.includes('chi tiết') || h.includes('desc'));
    const catIdx = headers.findIndex(
      (h) => h.includes('danh mục') || h.includes('phòng ban') || h.includes('loại') || h.includes('category')
    );
    const qtyIdx = headers.findIndex((h) => h.includes('số lượng') || h.includes('sl') || h.includes('quantity'));
    const hoursIdx = headers.findIndex((h) => h.includes('giờ') || h.includes('thời gian') || h.includes('hour') || h.includes('time'));
    const kpiIdx = headers.findIndex((h) => h.includes('kpi') || h.includes('đo lường') || h.includes('chỉ số'));
    const statusIdx = headers.findIndex((h) => h.includes('trạng thái') || h.includes('status') || h.includes('tiến độ'));

    let lastKnownDate = defaultDate;
    const tasks: TaskItem[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      // Extract or forward-fill date
      const cellDateRaw = dateIdx !== -1 ? row[dateIdx] : null;
      const parsedDate = parseVnDate(cellDateRaw);
      if (parsedDate) {
        lastKnownDate = parsedDate;
      }

      // Title
      const title = (titleIdx !== -1 ? row[titleIdx] : row[1] || row[0] || '').replace(/^["']|["']$/g, '').trim();
      if (!title) continue;

      const desc = descIdx !== -1 ? (row[descIdx] || '').replace(/^["']|["']$/g, '').trim() : '';
      const rawCat = catIdx !== -1 ? row[catIdx] || 'Marketing' : 'Marketing';
      const qty = qtyIdx !== -1 ? Math.max(1, parseFloat(row[qtyIdx]) || 1) : 1;

      // Hours: if present in sheet, use it; otherwise estimate reasonably (1.0h - 3.5h)
      let hours = 2.0;
      if (hoursIdx !== -1 && !isNaN(parseFloat(row[hoursIdx]))) {
        hours = parseFloat(row[hoursIdx]);
      } else {
        hours = Math.min(4.0, Math.max(1.0, qty * 1.5));
      }

      const statusRaw = (statusIdx !== -1 ? row[statusIdx] : 'completed').toLowerCase();
      let status: TaskStatus = 'completed';
      if (statusRaw.includes('đang') || statusRaw.includes('progress')) status = 'in_progress';
      else if (statusRaw.includes('chờ') || statusRaw.includes('pending')) status = 'pending';
      else if (statusRaw.includes('nghẽn') || statusRaw.includes('block')) status = 'blocked';

      const kpiRaw = kpiIdx !== -1 && row[kpiIdx] ? row[kpiIdx] : `Hoàn thành ${qty} ${title}`;
      const outcome = desc ? `${desc} - Đã hoàn thành theo tiến độ` : 'Đã hoàn thành đạt chuẩn chất lượng';

      tasks.push({
        id: `task_sheet_${Date.now()}_${i}`,
        title,
        description: desc,
        category: normalizeCategory(rawCat),
        status,
        priority: 'medium',
        date: lastKnownDate,
        quantity: qty,
        timeSpentHours: hours,
        completionPercent: status === 'completed' ? 100 : status === 'in_progress' ? 60 : 0,
        kpiMetric: kpiRaw,
        outcome,
        assignedTo: 'Trịnh Minh Đức',
        tags: ['Google Sheet'],
      });
    }

    return tasks;
  };

  // 1. Handle Direct Fetch from Google Sheets URL
  const handleFetchGoogleSheet = async (useAi: boolean = false) => {
    const urlToFetch = tab === 'paste' && isPastedSheetUrl ? pastedText.trim() : sheetUrl.trim();
    if (!urlToFetch) {
      setErrorMsg('Vui lòng nhập đường link Google Sheets.');
      return;
    }

    setErrorMsg('');
    setStatusMsg('');
    if (useAi) {
      setIsAiProcessing(true);
    } else {
      setIsLoading(true);
    }

    try {
      if (useAi) {
        // Call Gemini AI parser with URL
        const res = await fetch('/api/ai/parse-tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: urlToFetch,
            rawText: urlToFetch,
            targetDate,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Lỗi khi gọi AI Gemini bóc tách.');
        }

        const data = await res.json();
        if (data.tasks && data.tasks.length > 0) {
          const formatted: TaskItem[] = data.tasks.map((t: any, idx: number) => ({
            id: t.id || `task_ai_${Date.now()}_${idx}`,
            title: t.title || 'Công việc',
            description: t.description || '',
            category: normalizeCategory(t.category),
            status: t.status || 'completed',
            priority: t.priority || 'medium',
            date: t.date || targetDate,
            quantity: Number(t.quantity) || 1,
            timeSpentHours: Number(t.timeSpentHours) || 2,
            completionPercent: t.completionPercent ?? 100,
            kpiMetric: t.kpiMetric || 'Hoàn thành 100%',
            outcome: t.outcome || 'Đã hoàn thành tốt',
            assignedTo: 'Trịnh Minh Đức',
            tags: ['AI Gemini', 'Google Sheet'],
          }));

          setParsedTasks(formatted);
          setStatusMsg(
            `✨ AI Gemini đã bóc tách & tổng hợp thành công ${formatted.length} công việc từ link Google Sheets!`
          );
        } else {
          setErrorMsg('Không tìm thấy dòng công việc nào trong dữ liệu bảng tính.');
        }
      } else {
        // Fast direct fetch & tabular parse
        const res = await fetch('/api/google-sheet/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlToFetch }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Không thể tải Google Sheet.');
        }

        const data = await res.json();
        if (!data.csvText) {
          throw new Error('Không nhận được nội dung bảng tính.');
        }

        const tasks = processCsvData(data.csvText, targetDate);
        if (tasks.length === 0) {
          setErrorMsg('Bảng tính trống hoặc không đúng định dạng cột công việc.');
        } else {
          setParsedTasks(tasks);
          setStatusMsg(
            `✓ Đã tải & tổng hợp thành công ${tasks.length} công việc từ Google Sheets!`
          );
        }
      }
    } catch (err: any) {
      console.error('Fetch Google Sheet error:', err);
      setErrorMsg(err.message || 'Lỗi kết nối tới Google Sheets. Hãy kiểm tra quyền xem công khai của link.');
    } finally {
      setIsLoading(false);
      setIsAiProcessing(false);
    }
  };

  // 2. Handle Process Pasted Text (copy-pasted tabular rows)
  const handleProcessPastedText = () => {
    setErrorMsg('');
    setStatusMsg('');
    if (!pastedText.trim()) {
      setErrorMsg('Vui lòng dán dữ liệu bảng tính hoặc danh sách công việc.');
      return;
    }

    if (isPastedSheetUrl) {
      // If user pasted a sheet link into the textarea, trigger Google Sheet fetch!
      handleFetchGoogleSheet(false);
      return;
    }

    const lines = pastedText.split('\n').filter((l) => l.trim().length > 0);
    const tasks: TaskItem[] = [];

    lines.forEach((line, idx) => {
      if (line.includes('\t')) {
        // Tab-separated from Google Sheets copy-paste
        const parts = line.split('\t').map((p) => p.trim());
        const title = parts[1] || parts[0] || `Công việc ${idx + 1}`;
        const qty = parseFloat(parts[4]) || 1;
        const hours = parseFloat(parts[2]) || Math.min(4, Math.max(1, qty * 1.5));
        const cat = normalizeCategory(parts[3] || 'Marketing');
        tasks.push({
          id: `task_paste_${Date.now()}_${idx}`,
          title,
          description: parts[2] || '',
          category: cat,
          status: 'completed',
          priority: 'medium',
          date: targetDate,
          quantity: qty,
          timeSpentHours: isNaN(hours) ? 2 : hours,
          completionPercent: 100,
          kpiMetric: `Hoàn thành ${qty} mục tiêu`,
          outcome: 'Đã hoàn thành tốt',
          assignedTo: 'Trịnh Minh Đức',
          tags: ['Pasted'],
        });
      } else {
        const cleaned = line.replace(/^[-*•\d.)\s]+/, '').trim();
        if (cleaned) {
          tasks.push({
            id: `task_paste_${Date.now()}_${idx}`,
            title: cleaned,
            description: '',
            category: 'Marketing',
            status: 'completed',
            priority: 'medium',
            date: targetDate,
            quantity: 1,
            timeSpentHours: 2,
            completionPercent: 100,
            kpiMetric: 'Hoàn thành 100%',
            outcome: 'Đã hoàn thành theo kế hoạch',
            assignedTo: 'Trịnh Minh Đức',
            tags: ['Pasted'],
          });
        }
      }
    });

    setParsedTasks(tasks);
    setStatusMsg(`Đã bóc tách thành công ${tasks.length} công việc từ văn bản dán.`);
  };

  // 3. Handle File Upload (.xlsx, .xls, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setStatusMsg('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const csvText = XLSX.utils.sheet_to_csv(ws);
        const tasks = processCsvData(csvText, targetDate);

        if (tasks.length === 0) {
          setErrorMsg('File bảng tính trống hoặc không tìm thấy dữ liệu hợp lệ.');
        } else {
          setParsedTasks(tasks);
          setStatusMsg(`Đã trích xuất thành công ${tasks.length} công việc từ ${file.name}`);
        }
      } catch (err: any) {
        console.error('Lỗi đọc file Excel:', err);
        setErrorMsg('Không thể đọc file bảng tính. Hãy kiểm tra định dạng .xlsx, .xls hoặc .csv');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Delete a single row from preview
  const handleRemoveTask = (taskId: string) => {
    setParsedTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Filter tasks based on selected scope
  const filteredTasks =
    importScope === 'target_date'
      ? parsedTasks.filter((t) => t.date === targetDate)
      : parsedTasks;

  // Group dates for summary badges
  const dateCounts = parsedTasks.reduce((acc, t) => {
    acc[t.date] = (acc[t.date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueDates = Object.keys(dateCounts).sort();

  // Confirm and push to reports
  const handleConfirmImport = () => {
    if (filteredTasks.length === 0) {
      setErrorMsg('Chưa có công việc nào phù hợp để nhập.');
      return;
    }

    onImportTasks(filteredTasks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-[0_0_60px_rgba(6,182,212,0.3)] p-6 md:p-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-inner">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-display flex items-center gap-2">
                Tổng Hợp Báo Cáo Từ Google Sheets & Excel
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Ngày đang chọn xem:</span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30">
                  {targetDate}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Chuẩn hóa 8h/ngày (Thứ 2 - Thứ 7)</span>
              </p>
            </div>
          </div>
          <button
            id="close-sheet-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 shrink-0 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
          <button
            id="tab-sheet-link"
            onClick={() => setTab('sheet_link')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'sheet_link'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-500/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Link2 className="w-4 h-4 text-cyan-400" />
            <span>Ném Link Google Sheets</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium">
              Khuyên dùng
            </span>
          </button>

          <button
            id="tab-paste-sheet"
            onClick={() => setTab('paste')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'paste'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-500/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Dán Bảng Tính (Copy/Paste)</span>
          </button>

          <button
            id="tab-upload-file"
            onClick={() => setTab('upload')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'upload'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-500/50 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Tải File (.xlsx / .csv)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="my-4 overflow-y-auto flex-1 pr-1 space-y-4">
          {/* TAB 1: Google Sheets URL */}
          {tab === 'sheet_link' && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Dán đường link Google Sheets của bạn:</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSheetUrl(DEFAULT_USER_SHEET_URL)}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Sử dụng link bảng tính mẫu</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="relative">
                <input
                  id="google-sheet-url-input"
                  type="text"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1.../edit?gid=0#gid=0"
                  className="w-full pl-3.5 pr-10 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono tracking-tight shadow-inner"
                />
                {sheetUrl && (
                  <button
                    type="button"
                    onClick={() => setSheetUrl('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-400 flex items-start gap-1.5 leading-relaxed bg-cyan-950/20 p-2.5 rounded-xl border border-cyan-900/30">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Hệ thống tự động đọc các cột: <strong>Ngày thực hiện</strong>, <strong>Tên công việc</strong>,{' '}
                  <strong>Số lượng</strong>, <strong>Danh mục</strong>, <strong>Mô tả</strong> và tự động kế thừa ngày cho các dòng liên tiếp.
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  id="btn-fetch-sheet"
                  onClick={() => handleFetchGoogleSheet(false)}
                  disabled={isLoading || isAiProcessing || !sheetUrl.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span>{isLoading ? 'Đang tải bảng tính...' : 'Tải & Bóc Tách Ngay'}</span>
                </button>

                <button
                  type="button"
                  id="btn-ai-fetch-sheet"
                  onClick={() => handleFetchGoogleSheet(true)}
                  disabled={isLoading || isAiProcessing || !sheetUrl.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(168,85,247,0.35)] disabled:opacity-50 transition-all"
                >
                  {isAiProcessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  )}
                  <span>{isAiProcessing ? 'AI Đang Bóc Tách & Tính KPI...' : 'AI Gemini Tổng Hợp Chuyên Sâu'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Copy-Paste Textarea */}
          {tab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Dán liên kết Google Sheets hoặc các dòng sao chép từ bảng tính:
                </label>
                {isPastedSheetUrl && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 animate-pulse">
                    🔗 Phát hiện link Google Sheets
                  </span>
                )}
              </div>

              <textarea
                id="sheet-paste-textarea"
                rows={4}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Ví dụ: Ném đường link https://docs.google.com/spreadsheets/d/... vào đây&#10;Hoặc bôi đen các ô từ Google Sheet rồi dán vào đây..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  id="process-paste-btn"
                  onClick={handleProcessPastedText}
                  disabled={isLoading || isAiProcessing}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 flex items-center gap-2"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                  <span>{isPastedSheetUrl ? 'Tải Từ Link Google Sheets' : 'Xử Lý Bảng Tính Đã Dán'}</span>
                </button>

                <button
                  type="button"
                  id="ai-parse-btn"
                  onClick={() => handleFetchGoogleSheet(true)}
                  disabled={isAiProcessing || !pastedText.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
                >
                  {isAiProcessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  )}
                  <span>AI Gemini Chuẩn Hóa Thông Minh</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: File Upload */}
          {tab === 'upload' && (
            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 text-center transition-colors bg-slate-950/40 relative">
              <input
                id="sheet-file-input"
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-3 animate-bounce" />
              <p className="text-sm font-semibold text-white">
                Kéo thả file Excel hoặc click để chọn tệp (.xlsx, .xls, .csv)
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tự động bóc tách Ngày, Tên việc, Danh mục, Số lượng và phân chia thời gian làm việc.
              </p>
              {fileName && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{fileName}</span>
                </div>
              )}
            </div>
          )}

          {/* Status & Error Messages */}
          {statusMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
              <Check className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Section & Scope Selection */}
          {parsedTasks.length > 0 && (
            <div className="space-y-3 pt-2">
              {/* Date Scope Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Phạm vi nhập vào báo cáo:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {uniqueDates.map((d) => (
                      <span
                        key={d}
                        className={`text-[11px] px-2 py-0.5 rounded-lg font-mono font-semibold border ${
                          d === targetDate
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {d}: {dateCounts[d]} việc
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                  <button
                    type="button"
                    id="scope-all-dates"
                    onClick={() => setImportScope('all_dates')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      importScope === 'all_dates'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Tất cả ngày ({parsedTasks.length})</span>
                  </button>

                  <button
                    type="button"
                    id="scope-target-date"
                    onClick={() => setImportScope('target_date')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      importScope === 'target_date'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Chỉ {targetDate} ({dateCounts[targetDate] || 0})</span>
                  </button>
                </div>
              </div>

              {/* Table Preview */}
              <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/70 max-h-56">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700 sticky top-0 backdrop-blur-sm z-10">
                    <tr>
                      <th className="p-2.5 pl-3">Ngày</th>
                      <th className="p-2.5">Công Việc</th>
                      <th className="p-2.5">Danh Mục</th>
                      <th className="p-2.5 text-center">SL</th>
                      <th className="p-2.5 text-center">Giờ</th>
                      <th className="p-2.5">Chỉ Số KPI & Kết Quả</th>
                      <th className="p-2.5 pr-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredTasks.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-2.5 pl-3 font-mono text-[11px] text-cyan-300 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="p-2.5 text-white font-semibold max-w-[200px] truncate">
                          {row.title}
                          {row.description && (
                            <span className="block text-[10px] text-slate-400 font-normal truncate">
                              {row.description}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                            {row.category}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-bold text-amber-300">{row.quantity || 1}</td>
                        <td className="p-2.5 text-center text-cyan-400 font-semibold">{row.timeSpentHours}h</td>
                        <td className="p-2.5 text-slate-300 max-w-[160px] truncate text-[11px]">
                          {row.kpiMetric}
                        </td>
                        <td className="p-2.5 pr-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveTask(row.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded-md hover:bg-rose-500/10 transition-colors"
                            title="Xóa đầu việc này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredTasks.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                  Không có công việc nào thuộc ngày <span className="text-cyan-300 font-bold">{targetDate}</span>. Hãy
                  chuyển sang chọn "Tất cả ngày" để nhập toàn bộ {parsedTasks.length} công việc.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800 shrink-0">
          <div className="text-xs text-slate-400">
            {filteredTasks.length > 0 ? (
              <span>
                Đã chọn <strong className="text-cyan-300">{filteredTasks.length}</strong> công việc
                {importScope === 'all_dates' && uniqueDates.length > 1
                  ? ` (trên ${uniqueDates.length} ngày khác nhau)`
                  : ''}
              </span>
            ) : (
              <span>Chưa có dữ liệu sẵn sàng</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="cancel-sheet-import"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              id="confirm-sheet-import"
              onClick={handleConfirmImport}
              disabled={filteredTasks.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Xác Nhận Đẩy Vào Báo Cáo ({filteredTasks.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
