import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { TaskItem, TaskCategory, TaskPriority, TaskStatus } from '../types';

interface SheetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate: string;
  onImportTasks: (newTasks: TaskItem[]) => void;
}

export const SheetImportModal: React.FC<SheetImportModalProps> = ({
  isOpen,
  onClose,
  targetDate,
  onImportTasks,
}) => {
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [parsedRows, setParsedRows] = useState<Partial<TaskItem>[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle Excel/CSV file upload using XLSX library
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
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length <= 1) {
          setErrorMsg('File bảng tính trống hoặc không có dữ liệu.');
          return;
        }

        // Auto map header row
        const headers: string[] = (data[0] || []).map((h: any) => String(h || '').toLowerCase());
        const titleIdx = headers.findIndex((h) => h.includes('công việc') || h.includes('tên') || h.includes('task') || h.includes('nội dung'));
        const timeIdx = headers.findIndex((h) => h.includes('giờ') || h.includes('thời gian') || h.includes('hour') || h.includes('time'));
        const statusIdx = headers.findIndex((h) => h.includes('trạng thái') || h.includes('status') || h.includes('tiến độ'));
        const kpiIdx = headers.findIndex((h) => h.includes('kpi') || h.includes('đo lường') || h.includes('chỉ số') || h.includes('mục tiêu'));
        const categoryIdx = headers.findIndex((h) => h.includes('danh mục') || h.includes('phòng ban') || h.includes('category') || h.includes('loại'));
        const outcomeIdx = headers.findIndex((h) => h.includes('kết quả') || h.includes('outcome') || h.includes('ghi chú'));

        const tasks: Partial<TaskItem>[] = [];

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          const titleVal = titleIdx !== -1 ? row[titleIdx] : row[0];
          if (!titleVal || String(titleVal).trim().length === 0) continue;

          const hoursVal = timeIdx !== -1 ? parseFloat(String(row[timeIdx])) : 2;
          const statusRaw = statusIdx !== -1 ? String(row[statusIdx]).toLowerCase() : 'hoàn thành';
          const kpiVal = kpiIdx !== -1 ? String(row[kpiIdx]) : 'Hoàn thành theo tiến độ';
          const catVal = categoryIdx !== -1 ? String(row[categoryIdx]) : 'Phát triển';
          const outcomeVal = outcomeIdx !== -1 ? String(row[outcomeIdx]) : 'Đã thực hiện xong';

          let status: TaskStatus = 'completed';
          if (statusRaw.includes('đang') || statusRaw.includes('progress')) status = 'in_progress';
          else if (statusRaw.includes('chờ') || statusRaw.includes('pending')) status = 'pending';
          else if (statusRaw.includes('nghẽn') || statusRaw.includes('block')) status = 'blocked';

          tasks.push({
            id: `task_sheet_${Date.now()}_${i}`,
            title: String(titleVal).trim(),
            category: (catVal as TaskCategory) || 'Phát triển',
            status,
            priority: 'medium' as TaskPriority,
            date: targetDate,
            timeSpentHours: isNaN(hoursVal) ? 2 : hoursVal,
            completionPercent: status === 'completed' ? 100 : status === 'in_progress' ? 60 : 0,
            kpiMetric: kpiVal,
            outcome: outcomeVal,
          });
        }

        setParsedRows(tasks);
        setStatusMsg(`Đã trích xuất thành công ${tasks.length} công việc từ ${file.name}`);
      } catch (err: any) {
        console.error('Lỗi đọc file Excel:', err);
        setErrorMsg('Không thể đọc file bảng tính. Hãy kiểm tra định dạng .xlsx, .xls hoặc .csv');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle Pasted Text from Google Sheet or unstructured notes
  const handleProcessPastedText = () => {
    setErrorMsg('');
    setStatusMsg('');
    if (!pastedText.trim()) {
      setErrorMsg('Vui lòng dán dữ liệu bảng tính hoặc danh sách công việc.');
      return;
    }

    const lines = pastedText.split('\n').filter((l) => l.trim().length > 0);
    const tasks: Partial<TaskItem>[] = [];

    lines.forEach((line, idx) => {
      // Check if tab-separated (from Google Sheets copy-paste)
      if (line.includes('\t')) {
        const parts = line.split('\t').map((p) => p.trim());
        const title = parts[0] || `Công việc ${idx + 1}`;
        const hours = parseFloat(parts[1]) || 2;
        const category = (parts[2] as TaskCategory) || 'Phát triển';
        const kpi = parts[3] || 'Hoàn thành chỉ tiêu';
        tasks.push({
          id: `task_paste_${Date.now()}_${idx}`,
          title,
          category,
          status: 'completed',
          priority: 'medium',
          date: targetDate,
          timeSpentHours: isNaN(hours) ? 2 : hours,
          completionPercent: 100,
          kpiMetric: kpi,
          outcome: 'Hoàn thành tốt',
        });
      } else {
        // Simple plain text line
        const cleaned = line.replace(/^[-*•\d.)\s]+/, '').trim();
        if (cleaned) {
          tasks.push({
            id: `task_paste_${Date.now()}_${idx}`,
            title: cleaned,
            category: 'Phát triển',
            status: 'completed',
            priority: 'medium',
            date: targetDate,
            timeSpentHours: 2,
            completionPercent: 100,
            kpiMetric: 'Hoàn thành 100%',
            outcome: 'Đã hoàn thành theo kế hoạch',
          });
        }
      }
    });

    setParsedRows(tasks);
    setStatusMsg(`Đã bóc tách thành công ${tasks.length} công việc từ bảng tính đã dán.`);
  };

  // AI Smart Parser for complex sheet data
  const handleAiSmartParse = async () => {
    const rawContent = pastedText || fileName;
    if (!rawContent) {
      setErrorMsg('Vui lòng dán nội dung hoặc tải file trước khi dùng AI bóc tách.');
      return;
    }

    setIsAiProcessing(true);
    setErrorMsg('');
    setStatusMsg('');

    try {
      const response = await fetch('/api/ai/parse-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: pastedText || JSON.stringify(parsedRows),
          targetDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể xử lý dữ liệu với AI');
      }

      const data = await response.json();
      if (data.tasks && data.tasks.length > 0) {
        setParsedRows(data.tasks);
        setStatusMsg(`AI Gemini đã tự động chuẩn hóa & bóc tách ${data.tasks.length} công việc kèm chỉ số KPI.`);
      } else {
        setErrorMsg('AI không tìm thấy đầu việc phù hợp.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Lỗi AI bóc tách dữ liệu. Sử dụng bộ phân tích mặc định.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) {
      setErrorMsg('Chưa có công việc nào được chọn để nhập.');
      return;
    }

    const fullTasks: TaskItem[] = parsedRows.map((item, idx) => ({
      id: item.id || `task_imported_${Date.now()}_${idx}`,
      title: item.title || 'Công việc chưa đặt tên',
      description: item.description || '',
      category: item.category || 'Phát triển',
      status: item.status || 'completed',
      priority: item.priority || 'medium',
      date: targetDate,
      timeSpentHours: item.timeSpentHours || 1.5,
      completionPercent: item.completionPercent ?? 100,
      kpiMetric: item.kpiMetric || 'Hoàn thành 100%',
      outcome: item.outcome || 'Đã hoàn thành',
      assignedTo: item.assignedTo || 'Người dùng',
      tags: item.tags || ['Imported'],
    }));

    onImportTasks(fullTasks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(6,182,212,0.25)] p-6 md:p-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-display">
                Đẩy File Sheet / Excel Lên Báo Cáo
              </h2>
              <p className="text-xs text-slate-400">
                Nhập công việc tự động cho ngày: <span className="text-cyan-300 font-semibold">{targetDate}</span>
              </p>
            </div>
          </div>
          <button
            id="close-sheet-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 shrink-0">
          <button
            id="tab-upload-file"
            onClick={() => setTab('upload')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'upload'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            📂 Tải File (.xlsx, .xls, .csv)
          </button>
          <button
            id="tab-paste-sheet"
            onClick={() => setTab('paste')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'paste'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            📋 Dán Bảng Tính Google Sheets
          </button>
        </div>

        {/* Tab Contents */}
        <div className="my-4 overflow-y-auto flex-1 pr-1 space-y-4">
          {tab === 'upload' ? (
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
                Kéo thả file Excel hoặc click để chọn tệp
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Hỗ trợ định dạng .xlsx, .xls, .csv (Hệ thống tự động map cột Tên việc, Giờ, KPI, v.v.)
              </p>
              {fileName && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{fileName}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Dán các dòng từ Google Sheets / Excel hoặc danh sách công việc:
              </label>
              <textarea
                id="sheet-paste-textarea"
                rows={4}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Ví dụ: Dán nguyên các hàng từ Google Sheets hoặc gõ:&#10;- Hoàn thiện giao diện 3D (3h, KPI: 100%)&#10;- Kiểm thử API phân quyền (2h, KPI: Đạt chuẩn)"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  id="process-paste-btn"
                  onClick={handleProcessPastedText}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700"
                >
                  Xử lý Bảng tính
                </button>
                <button
                  type="button"
                  id="ai-parse-btn"
                  onClick={handleAiSmartParse}
                  disabled={isAiProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
                >
                  {isAiProcessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  )}
                  <span>AI Gemini Bóc Tách Thông Minh</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {statusMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Xem trước ({parsedRows.length} công việc sẽ nhập):
                </span>
                <span className="text-[11px] text-cyan-400">
                  Đã tự động tính toán KPI & Giờ
                </span>
              </div>
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60 max-h-48">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="p-2.5">Công Việc</th>
                      <th className="p-2.5">Danh Mục</th>
                      <th className="p-2.5">Thời Gian</th>
                      <th className="p-2.5">Chỉ Số Đo Lường KPI</th>
                      <th className="p-2.5">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {parsedRows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-white max-w-[200px] truncate">{row.title}</td>
                        <td className="p-2.5">{row.category}</td>
                        <td className="p-2.5 text-cyan-300">{row.timeSpentHours}h</td>
                        <td className="p-2.5 text-slate-300 max-w-[150px] truncate">{row.kpiMetric}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {row.status === 'completed' ? 'Hoàn thành' : 'Đang làm'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
          <button
            type="button"
            id="cancel-sheet-import"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            id="confirm-sheet-import"
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Xác Nhận Đẩy Vào Báo Cáo ({parsedRows.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
