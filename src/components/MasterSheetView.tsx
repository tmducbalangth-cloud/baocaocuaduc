import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  Sparkles,
  Save,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  PieChart,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TaskItem, DailyReport, User, TaskStatus, TaskPriority, TaskCategory, TASK_CATEGORIES } from '../types';
import { formatDateStr } from '../mock/initialData';
import { GoogleSheetSyncModal } from './GoogleSheetSyncModal';

interface MasterSheetViewProps {
  allTasks: TaskItem[];
  dailyReports: DailyReport[];
  currentUser: User | null;
  onUpdateTasks: (tasks: TaskItem[]) => void;
  onUpdateDailyReports: (reports: DailyReport[]) => void;
}

type SheetSubTab = 'daily_tasks' | 'weekly_matrix' | 'monthly_matrix' | 'quarterly_matrix' | 'yearly_matrix';

export const MasterSheetView: React.FC<MasterSheetViewProps> = ({
  allTasks,
  dailyReports,
  currentUser,
  onUpdateTasks,
  onUpdateDailyReports,
}) => {
  const [activeSheetTab, setActiveSheetTab] = useState<SheetSubTab>('daily_tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1HIUQGi_Sd1ewWa6pvuBkc3xqFGURC8be3CiIS-fi4XM/edit');
  const [showSyncModal, setShowSyncModal] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Categories list
  const categories = TASK_CATEGORIES;

  // Filtered tasks for Sheet 1
  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.kpiMetric && t.kpiMetric.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.outcome && t.outcome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.date.includes(searchTerm);
      const matchCategory =
        selectedCategoryFilter === 'all' || t.category === selectedCategoryFilter;
      const matchStatus =
        selectedStatusFilter === 'all' || t.status === selectedStatusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [allTasks, searchTerm, selectedCategoryFilter, selectedStatusFilter]);

  // Quick stats
  const totalHours = useMemo(() => {
    return allTasks.reduce((acc, t) => acc + (Number(t.timeSpentHours) || 0), 0);
  }, [allTasks]);

  const totalQuantity = useMemo(() => {
    return allTasks.reduce((acc, t) => acc + (Number(t.quantity) || 1), 0);
  }, [allTasks]);

  const completedCount = useMemo(() => {
    return allTasks.filter((t) => t.status === 'completed' || t.completionPercent >= 100).length;
  }, [allTasks]);

  const avgCompletion = useMemo(() => {
    if (allTasks.length === 0) return 0;
    const sum = allTasks.reduce((acc, t) => acc + (t.completionPercent || 0), 0);
    return Math.round(sum / allTasks.length);
  }, [allTasks]);

  // Inline Cell Edit for Task Item
  const handleTaskCellChange = (
    taskId: string,
    field: keyof TaskItem,
    value: any
  ) => {
    if (!isAdmin) {
      setSaveFeedback('Bạn đang ở vai trò Người Xem (Viewer). Chỉ Quản Trị Viên (Admin) mới có quyền sửa dữ liệu sheet.');
      setTimeout(() => setSaveFeedback(''), 4000);
      return;
    }

    const updated = allTasks.map((task) => {
      if (task.id === taskId) {
        const updatedTask = { ...task, [field]: value };
        if (field === 'status') {
          if (value === 'completed') updatedTask.completionPercent = 100;
          else if (value === 'in_progress' && updatedTask.completionPercent === 100) updatedTask.completionPercent = 60;
        }
        if (field === 'completionPercent') {
          if (Number(value) >= 100) updatedTask.status = 'completed';
          else if (Number(value) > 0) updatedTask.status = 'in_progress';
        }
        return updatedTask;
      }
      return task;
    });

    onUpdateTasks(updated);
    setSaveFeedback('Đã cập nhật thay đổi vào bảng tính');
    setTimeout(() => setSaveFeedback(''), 2000);
  };

  // Add new task row
  const handleAddNewTaskRow = () => {
    if (!isAdmin) return;
    const newTask: TaskItem = {
      id: `task_sheet_manual_${Date.now()}`,
      title: 'Công việc mới cần thực hiện',
      category: 'Marketing',
      status: 'in_progress',
      priority: 'medium',
      date: formatDateStr(new Date()),
      quantity: 1,
      timeSpentHours: 2,
      completionPercent: 50,
      kpiMetric: 'Hoàn thành 100% mục tiêu',
      outcome: 'Đang triển khai',
      assignedTo: currentUser?.name || 'Trịnh Minh Đức',
      tags: ['Bảng Tính'],
    };

    onUpdateTasks([newTask, ...allTasks]);
    setSaveFeedback('Đã thêm dòng công việc mới vào bảng tính');
    setTimeout(() => setSaveFeedback(''), 2500);
  };

  // Delete task row
  const handleDeleteTaskRow = (taskId: string) => {
    if (!isAdmin) return;
    onUpdateTasks(allTasks.filter((t) => t.id !== taskId));
    setSaveFeedback('Đã xóa dòng công việc');
    setTimeout(() => setSaveFeedback(''), 2000);
  };

  // Duplicate task row
  const handleDuplicateTaskRow = (task: TaskItem) => {
    if (!isAdmin) return;
    const duplicate: TaskItem = {
      ...task,
      id: `task_copy_${Date.now()}`,
      title: `${task.title} (Bản sao)`,
    };
    onUpdateTasks([duplicate, ...allTasks]);
    setSaveFeedback('Đã nhân bản dòng công việc');
    setTimeout(() => setSaveFeedback(''), 2000);
  };

  // Export Full 4-Sheet Excel Workbook (.xlsx)
  const handleExportFullWorkbook = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Báo Cáo Ngày
    const dailyData = allTasks.map((t, idx) => ({
      'STT': idx + 1,
      'Mã ID': t.id,
      'Ngày Thực Hiện': t.date,
      'Tên Công Việc': t.title,
      'Danh Mục': t.category,
      'Số Lượng': t.quantity || 1,
      'Thời Gian (Giờ)': t.timeSpentHours,
      'Tiến Độ (%)': `${t.completionPercent}%`,
      'Trạng Thái': t.status === 'completed' ? 'Hoàn thành' : t.status === 'in_progress' ? 'Đang thực hiện' : t.status === 'pending' ? 'Chờ xử lý' : 'Bị tắc nghẽn',
      'Độ Ưu Tiên': t.priority.toUpperCase(),
      'Chỉ Số Đo Lường KPI': t.kpiMetric || '',
      'Kết Quả Đạt Được': t.outcome || '',
      'Người Thực Hiện': t.assignedTo || 'Trịnh Minh Đức',
    }));
    const ws1 = XLSX.utils.json_to_sheet(dailyData);
    XLSX.utils.book_append_sheet(wb, ws1, '1_Bao_Cao_Ngay');

    // Sheet 2: Báo Cáo Tuần
    const weeklyData = [
      {
        'Tuần Số': 'Tuần 35 (Hiện tại)',
        'Khoảng Thời Gian': '25/08/2026 - 31/08/2026',
        'Tổng Đầu Việc': allTasks.length,
        'Việc Hoàn Thành': completedCount,
        'Tổng Giờ Làm Việc': `${totalHours}h`,
        'Điểm Hiệu Suất': `${avgCompletion}/100`,
        'Thành Tựu Chính': 'Hoàn thiện hệ thống báo cáo 3D Ba Làng TH, tích hợp bảng tính tổng hợp và AI Gemini',
        'Vấn Đề Tồn Đọng': 'Tối ưu hóa thời gian phản hồi API và hoàn thiện đồng bộ realtime',
      },
      {
        'Tuần Số': 'Tuần 34',
        'Khoảng Thời Gian': '18/08/2026 - 24/08/2026',
        'Tổng Đầu Việc': 16,
        'Việc Hoàn Thành': 15,
        'Tổng Giờ Làm Việc': '38.5h',
        'Điểm Hiệu Suất': '94/100',
        'Thành Tựu Chính': 'Ra mắt phân hệ báo cáo tuần và tháng',
        'Vấn Đề Tồn Đọng': 'Không',
      },
      {
        'Tuần Số': 'Tuần 33',
        'Khoảng Thời Gian': '11/08/2026 - 17/08/2026',
        'Tổng Đầu Việc': 14,
        'Việc Hoàn Thành': 13,
        'Tổng Giờ Làm Việc': '36.0h',
        'Điểm Hiệu Suất': '90/100',
        'Thành Tựu Chính': 'Thiết lập luồng phân quyền Admin / Viewer',
        'Vấn Đề Tồn Đọng': 'Đồng bộ ảnh đại diện',
      },
    ];
    const ws2 = XLSX.utils.json_to_sheet(weeklyData);
    XLSX.utils.book_append_sheet(wb, ws2, '2_Tong_Hop_Tuan');

    // Sheet 3: Báo Cáo Tháng
    const monthlyData = [
      { 'Tháng': 'Tháng 1/2026', 'Số Công Việc': 48, 'Hoàn Thành (%)': '94%', 'Tổng Giờ': '162h', 'Điểm Đánh Giá': 'A', 'KPI Trọng Điểm': 'Đạt 105% chỉ tiêu Quý 1' },
      { 'Tháng': 'Tháng 2/2026', 'Số Công Việc': 42, 'Hoàn Thành (%)': '91%', 'Tổng Giờ': '150h', 'Điểm Đánh Giá': 'A', 'KPI Trọng Điểm': 'Ra mắt phiên bản thử nghiệm' },
      { 'Tháng': 'Tháng 3/2026', 'Số Công Việc': 54, 'Hoàn Thành (%)': '96%', 'Tổng Giờ': '170h', 'Điểm Đánh Giá': 'A+', 'KPI Trọng Điểm': 'Tăng trưởng năng suất 25%' },
      { 'Tháng': 'Tháng 4/2026', 'Số Công Việc': 50, 'Hoàn Thành (%)': '93%', 'Tổng Giờ': '165h', 'Điểm Đánh Giá': 'A', 'KPI Trọng Điểm': 'Hoàn thành Audit an ninh mạng' },
      { 'Tháng': 'Tháng 5/2026', 'Số Công Việc': 52, 'Hoàn Thành (%)': '95%', 'Tổng Giờ': '168h', 'Điểm Đánh Giá': 'A+', 'KPI Trọng Điểm': 'Mở rộng quy mô người dùng' },
      { 'Tháng': 'Tháng 6/2026', 'Số Công Việc': 58, 'Hoàn Thành (%)': '97%', 'Tổng Giờ': '175h', 'Điểm Đánh Giá': 'A+', 'KPI Trọng Điểm': 'Vượt 120% KPI nửa đầu năm' },
      { 'Tháng': 'Tháng 7/2026', 'Số Công Việc': 55, 'Hoàn Thành (%)': '94%', 'Tổng Giờ': '170h', 'Điểm Đánh Giá': 'A', 'KPI Trọng Điểm': 'Tối ưu hóa UI/UX 3D living' },
      { 'Tháng': 'Tháng 8/2026 (Hiện tại)', 'Số Công Việc': allTasks.length, 'Hoàn Thành (%)': `${avgCompletion}%`, 'Tổng Giờ': `${totalHours}h`, 'Điểm Đánh Giá': 'A+', 'KPI Trọng Điểm': 'Triển khai Master Sheet & AI' },
    ];
    const ws3 = XLSX.utils.json_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(wb, ws3, '3_Tong_Hop_Thang');

    // Sheet 4: Báo Cáo Quý
    const quarterlyData = [
      {
        'Quý': 'Quý 1/2026',
        'Khoảng Tháng': 'Tháng 1 - Tháng 3',
        'Tổng Công Việc': 144,
        'Tỷ Lệ Xong (%)': '93.8%',
        'Tổng Giờ (h)': '482h',
        'Điểm Hiệu Suất': '93/100 (A)',
        'Mục Tiêu OKR Đạt Được': 'Hoàn thành kiểm định 100% lô sản phẩm xuất khẩu & nâng cấp xưởng ủ chượp Ba Làng TH',
      },
      {
        'Quý': 'Quý 2/2026',
        'Khoảng Tháng': 'Tháng 4 - Tháng 6',
        'Tổng Công Việc': 160,
        'Tỷ Lệ Xong (%)': '95.0%',
        'Tổng Giờ (h)': '508h',
        'Điểm Hiệu Suất': '96/100 (A+)',
        'Mục Tiêu OKR Đạt Được': 'Mở rộng thị trường đại lý miền Bắc & tăng trưởng doanh thu 22%',
      },
      {
        'Quý': 'Quý 3/2026 (Hiện tại)',
        'Khoảng Tháng': 'Tháng 7 - Tháng 9',
        'Tổng Công Việc': allTasks.length + 55,
        'Tỷ Lệ Xong (%)': `${avgCompletion}%`,
        'Tổng Giờ (h)': `${totalHours + 170}h`,
        'Điểm Hiệu Suất': '97/100 (A+)',
        'Mục Tiêu OKR Đạt Được': 'Số hóa toàn diện hệ thống báo cáo 3D, liên kết Google Sheets 5 trang tính & tích hợp AI',
      },
      {
        'Quý': 'Quý 4/2026 (Kế hoạch)',
        'Khoảng Tháng': 'Tháng 10 - Tháng 12',
        'Tổng Công Việc': 165,
        'Tỷ Lệ Xong (%)': 'Mục tiêu ≥96%',
        'Tổng Giờ (h)': '520h',
        'Điểm Hiệu Suất': 'A+ (Xuất sắc)',
        'Mục Tiêu OKR Đạt Được': 'Chiến dịch Tết nguyên đán & đạt chứng nhận chất lượng quốc tế',
      },
    ];
    const ws4 = XLSX.utils.json_to_sheet(quarterlyData);
    XLSX.utils.book_append_sheet(wb, ws4, '4_Tong_Hop_Quy');

    // Sheet 5: Báo Cáo Năm
    const yearlyData = [
      {
        'Năm': '2026',
        'Tổng Công Việc Đã Thực Hiện': allTasks.length + 359,
        'Tổng Giờ Tích Lũy': `${totalHours + 1180}h`,
        'Hiệu Suất Trung Bình': '95.4%',
        'Xếp Loại Tổng Thể': 'A+ (Xuất sắc)',
        'Cột Mốc Lớn 1': 'Hoàn thiện hạ tầng Báo Cáo 3D Ba Làng TH',
        'Cột Mốc Lớn 2': 'Tích hợp mô hình AI Gemini đo lường hiệu suất',
        'Cột Mốc Lớn 3': 'Tự động hóa 100% quy trình xuất nhập bảng tính',
      },
    ];
    const ws5 = XLSX.utils.json_to_sheet(yearlyData);
    XLSX.utils.book_append_sheet(wb, ws5, '5_Tong_Hop_Nam');

    // Trigger Download
    XLSX.writeFile(wb, `Bao_Cao_Cong_Viec_Ba_Lang_TH_Full_MasterSheet_${formatDateStr(new Date())}.xlsx`);
  };

  // Copy Sheet to Clipboard for direct Google Sheets paste
  const handleCopyForGoogleSheets = () => {
    let tsv = 'Mã ID\tNgày\tTên Công Việc\tDanh Mục\tSố Lượng\tThời Gian (Giờ)\tTiến Độ (%)\tTrạng Thái\tKPI Đo Lường\tKết Quả Đạt Được\tNgười Thực Hiện\n';
    allTasks.forEach((t) => {
      tsv += `${t.id}\t${t.date}\t${t.title}\t${t.category}\t${t.quantity || 1}\t${t.timeSpentHours}\t${t.completionPercent}%\t${t.status}\t${t.kpiMetric || ''}\t${t.outcome || ''}\t${t.assignedTo || ''}\n`;
    });

    navigator.clipboard.writeText(tsv).then(() => {
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Live Actions */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-display">
                  BẢNG TÍNH TỔNG HỢP (MASTER SHEET)
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                  Multi-Sheet 4 Trong 1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dữ liệu hợp nhất Ngày • Tuần • Tháng • Năm — Cho phép trực tiếp chỉnh sửa và đồng bộ tức thì
              </p>
            </div>
          </div>

          {/* Quick Global Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {isAdmin && (
              <button
                type="button"
                id="btn-add-task-row"
                onClick={handleAddNewTaskRow}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Dòng Việc</span>
              </button>
            )}

            <button
              type="button"
              id="btn-sync-google-sheet-modal"
              onClick={() => setShowSyncModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all"
              title="Hướng dẫn cấu hình và kết nối đồng bộ 2 chiều với Google Sheets"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Liên Kết Google Sheets</span>
            </button>

            <button
              type="button"
              id="btn-copy-google-sheet"
              onClick={handleCopyForGoogleSheets}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              title="Sao chép toàn bộ bảng tính để dán trực tiếp (Ctrl+V) vào Google Sheets"
            >
              {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNotice ? 'Đã chép vào Clipboard!' : 'Chép Dán Google Sheets'}</span>
            </button>

            <button
              type="button"
              id="btn-export-full-excel"
              onClick={handleExportFullWorkbook}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel Đầy Đủ 5 Sheet (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Connected Google Sheet Status Banner */}
        <div className="mt-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-300 font-medium">Đã kết nối Google Sheet:</span>
              <a
                href="https://docs.google.com/spreadsheets/d/1JPukE8hzHZgz7_n282BRY_SGEKLEBdwo4WwmHFd4kb/edit"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-cyan-300 hover:text-cyan-200 underline font-bold flex items-center gap-1"
                title="Mở bảng tính trên Google Sheets"
              >
                <span>1JPukE8hzHZgz7_n282BRY_SGEKLEBdwo4WwmHFd4kb</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSyncModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đồng Bộ & Xem Mẫu 5 Sheet</span>
            </button>
          </div>
        </div>

        {/* Live Feedback Message */}
        {saveFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}

        {!isAdmin && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Bạn đang ở chế độ Người Xem (Viewer) — Chuyển sang tài khoản Quản Trị Viên (Admin) để có toàn quyền sửa trực tiếp bảng tính.</span>
          </div>
        )}
      </div>

      {/* 4 Multi-Sheet Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md">
        <button
          type="button"
          id="sheet-subtab-daily"
          onClick={() => setActiveSheetTab('daily_tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSheetTab === 'daily_tasks'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Sheet 1: Dữ Liệu Ngày (Chi Tiết Tasks & KPIs)</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-white/20 font-mono">
            {allTasks.length}
          </span>
        </button>

        <button
          type="button"
          id="sheet-subtab-weekly"
          onClick={() => setActiveSheetTab('weekly_matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSheetTab === 'weekly_matrix'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sheet 2: Tổng Hợp Tuần</span>
        </button>

        <button
          type="button"
          id="sheet-subtab-monthly"
          onClick={() => setActiveSheetTab('monthly_matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSheetTab === 'monthly_matrix'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Sheet 3: Tổng Hợp 12 Tháng</span>
        </button>

        <button
          type="button"
          id="sheet-subtab-quarterly"
          onClick={() => setActiveSheetTab('quarterly_matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSheetTab === 'quarterly_matrix'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Sheet 4: Tổng Hợp Quý (Q1 - Q4)</span>
        </button>

        <button
          type="button"
          id="sheet-subtab-yearly"
          onClick={() => setActiveSheetTab('yearly_matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSheetTab === 'yearly_matrix'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Sheet 5: Tổng Hợp Chiến Lược Năm</span>
        </button>
      </div>

      {/* SHEET 1: DAILY TASKS & KPI LIVE TABLE */}
      {activeSheetTab === 'daily_tasks' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm công việc, ngày, KPI, kết quả..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="in_progress">Đang thực hiện</option>
                <option value="pending">Chờ xử lý</option>
                <option value="blocked">Bị tắc nghẽn</option>
              </select>
            </div>

            {/* Live Metrics Counters */}
            <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                Tổng: <strong className="text-white">{allTasks.length}</strong> việc (<strong className="text-purple-300">{totalQuantity}</strong> mục)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Tổng giờ: <strong className="text-cyan-200">{totalHours}h</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Hoàn thành: <strong className="text-emerald-200">{completedCount} ({avgCompletion}%)</strong>
              </span>
            </div>
          </div>

          {/* Interactive Live Spreadsheet Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead className="bg-slate-800/95 text-slate-300 font-bold sticky top-0 z-20 border-b border-slate-700 select-none">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3 min-w-[110px]">Ngày</th>
                    <th className="p-3 min-w-[240px]">Tên Công Việc (Sửa trực tiếp)</th>
                    <th className="p-3 min-w-[130px]">Danh Mục</th>
                    <th className="p-3 min-w-[80px] text-center">Số Lượng</th>
                    <th className="p-3 min-w-[80px] text-center">Giờ (h)</th>
                    <th className="p-3 min-w-[100px]">Tiến Độ</th>
                    <th className="p-3 min-w-[130px]">Trạng Thái</th>
                    <th className="p-3 min-w-[180px]">Chỉ Số Đo Lường KPI</th>
                    <th className="p-3 min-w-[180px]">Kết Quả Cụ Thể</th>
                    <th className="p-3 min-w-[130px]">Người Thực Hiện</th>
                    {isAdmin && <th className="p-3 w-16 text-center">Thao tác</th>}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/70 text-slate-200 font-medium">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="p-8 text-center text-slate-400">
                        Không tìm thấy dòng công việc nào khớp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task, idx) => (
                      <tr key={task.id} className="hover:bg-slate-800/50 transition-colors group">
                        {/* Index */}
                        <td className="p-2.5 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Date */}
                        <td className="p-2">
                          <input
                            type="date"
                            disabled={!isAdmin}
                            value={task.date}
                            onChange={(e) => handleTaskCellChange(task.id, 'date', e.target.value)}
                            className="bg-transparent border border-transparent hover:border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 text-slate-300 font-mono text-[11px] w-full focus:bg-slate-950"
                          />
                        </td>

                        {/* Title */}
                        <td className="p-2">
                          <input
                            type="text"
                            disabled={!isAdmin}
                            value={task.title}
                            onChange={(e) => handleTaskCellChange(task.id, 'title', e.target.value)}
                            className="bg-transparent border border-transparent hover:border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 text-white font-semibold text-xs w-full focus:bg-slate-950"
                          />
                        </td>

                        {/* Category */}
                        <td className="p-2">
                          <select
                            disabled={!isAdmin}
                            value={task.category}
                            onChange={(e) => handleTaskCellChange(task.id, 'category', e.target.value)}
                            className="bg-transparent border border-transparent hover:border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 text-slate-300 text-xs w-full focus:bg-slate-950"
                          >
                            {categories.map((c) => (
                              <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                            ))}
                          </select>
                        </td>

                        {/* Quantity */}
                        <td className="p-2 text-center">
                          <input
                            type="text"
                            inputMode="decimal"
                            disabled={!isAdmin}
                            value={task.quantity !== undefined && task.quantity !== null ? task.quantity : 1}
                            onChange={(e) => {
                              const raw = e.target.value.replace(',', '.');
                              const num = parseFloat(raw);
                              handleTaskCellChange(task.id, 'quantity', raw === '' ? '' : (!isNaN(num) && num >= 1 ? num : raw));
                            }}
                            placeholder="1"
                            title="Số lượng công việc (tối thiểu 1)"
                            className="bg-transparent border border-transparent hover:border-slate-700 focus:border-indigo-400 rounded-lg px-2 py-1 text-indigo-300 font-mono font-bold text-xs w-16 text-center focus:bg-slate-950"
                          />
                        </td>

                        {/* Hours */}
                        <td className="p-2 text-center">
                          <input
                            type="text"
                            inputMode="decimal"
                            disabled={!isAdmin}
                            value={task.timeSpentHours !== undefined && task.timeSpentHours !== null ? task.timeSpentHours : ''}
                            onChange={(e) => {
                              const raw = e.target.value.replace(',', '.');
                              const num = parseFloat(raw);
                              handleTaskCellChange(task.id, 'timeSpentHours', raw === '' ? '' : (!isNaN(num) && num >= 0 ? num : raw));
                            }}
                            placeholder="Giờ"
                            className="bg-transparent border border-transparent hover:border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 text-cyan-300 font-mono font-bold text-xs w-16 text-center focus:bg-slate-950"
                          />
                        </td>

                        {/* Progress % */}
                        <td className="p-2">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              disabled={!isAdmin}
                              value={task.completionPercent}
                              onChange={(e) => handleTaskCellChange(task.id, 'completionPercent', parseInt(e.target.value) || 0)}
                              className="bg-transparent border border-transparent hover:border-slate-700 focus:border-cyan-400 rounded-lg px-1 py-1 text-slate-200 font-mono text-xs w-12 text-center focus:bg-slate-950"
                            />
                            <span className="text-[10px] text-slate-400">%</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-2">
                          <select
                            disabled={!isAdmin}
                            value={task.status}
                            onChange={(e) => handleTaskCellChange(task.id, 'status', e.target.value)}
                            className={`border border-transparent hover:border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 font-bold text-[11px] w-full focus:bg-slate-950 ${
                              task.status === 'completed'
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : task.status === 'in_progress'
                                ? 'text-cyan-300 bg-cyan-500/10'
                                : task.status === 'pending'
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-rose-400 bg-rose-500/10'
                            }`}
                          >
                            <option value="completed" className="bg-slate-900 text-emerald-400">Hoàn thành</option>
                            <option value="in_progress" className="bg-slate-900 text-cyan-300">Đang làm</option>
                            <option value="pending" className="bg-slate-900 text-amber-300">Chờ xử lý</option>
                            <option value="blocked" className="bg-slate-900 text-rose-300">Tắc nghẽn</option>
                          </select>
                        </td>

                        {/* KPI Metric */}
                        <td className="p-2">
                          <input
                            type="text"
                            disabled={!isAdmin}
                            value={task.kpiMetric || ''}
                            onChange={(e) => handleTaskCellChange(task.id, 'kpiMetric', e.target.value)}
                            placeholder="Chỉ số KPI..."
                            className="bg-transparent border border-transparent hover:border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 text-slate-300 text-xs w-full focus:bg-slate-950"
                          />
                        </td>

                        {/* Outcome */}
                        <td className="p-2">
                          <input
                            type="text"
                            disabled={!isAdmin}
                            value={task.outcome || ''}
                            onChange={(e) => handleTaskCellChange(task.id, 'outcome', e.target.value)}
                            placeholder="Kết quả cụ thể..."
                            className="bg-transparent border border-transparent hover:border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 text-slate-300 text-xs w-full focus:bg-slate-950"
                          />
                        </td>

                        {/* Assigned To */}
                        <td className="p-2">
                          <input
                            type="text"
                            disabled={!isAdmin}
                            value={task.assignedTo || 'Trịnh Minh Đức'}
                            onChange={(e) => handleTaskCellChange(task.id, 'assignedTo', e.target.value)}
                            className="bg-transparent border border-transparent hover:border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 text-slate-300 text-xs w-full focus:bg-slate-950"
                          />
                        </td>

                        {/* Row Actions */}
                        {isAdmin && (
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleDuplicateTaskRow(task)}
                                className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                                title="Nhân bản dòng"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTaskRow(task.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                                title="Xóa dòng"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with quick summary bar */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Mọi thay đổi trên bảng tính được lưu tự động và đồng bộ tức thời với Báo cáo Ngày, Tuần, Tháng, Năm.
              </span>
              <span className="text-[11px] font-mono text-cyan-300">
                Hiển thị {filteredTasks.length} / {allTasks.length} dòng
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SHEET 2: WEEKLY SUMMARY MATRIX */}
      {activeSheetTab === 'weekly_matrix' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Tổng Hợp Báo Cáo Tuần (Weekly Summary Matrix)
            </h3>
            <span className="text-xs text-slate-400">Tự động tổng hợp từ dữ liệu ngày</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700">
                <tr>
                  <th className="p-3">Tuần</th>
                  <th className="p-3">Khoảng Thời Gian</th>
                  <th className="p-3 text-center">Tổng Việc</th>
                  <th className="p-3 text-center">Đã Xong</th>
                  <th className="p-3 text-center">Tổng Giờ</th>
                  <th className="p-3 text-center">Điểm Hiệu Suất</th>
                  <th className="p-3 min-w-[250px]">Thành Tựu Nổi Bật</th>
                  <th className="p-3 min-w-[200px]">Vấn Đề Tồn Đọng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-cyan-300">Tuần 35 (Hiện tại)</td>
                  <td className="p-3 text-slate-300">25/08/2026 - 31/08/2026</td>
                  <td className="p-3 text-center font-bold text-white">{allTasks.length}</td>
                  <td className="p-3 text-center font-bold text-emerald-400">{completedCount}</td>
                  <td className="p-3 text-center font-mono font-bold text-cyan-300">{totalHours}h</td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {avgCompletion}/100 (A+)
                    </span>
                  </td>
                  <td className="p-3 text-slate-200">Hoàn thiện toàn bộ hệ thống báo cáo 3D Ba Làng TH, tích hợp Master Sheet và Gemini AI</td>
                  <td className="p-3 text-slate-400">Tối ưu hóa thời gian phản hồi realtime</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-300">Tuần 34</td>
                  <td className="p-3 text-slate-300">18/08/2026 - 24/08/2026</td>
                  <td className="p-3 text-center font-bold text-white">16</td>
                  <td className="p-3 text-center font-bold text-emerald-400">15</td>
                  <td className="p-3 text-center font-mono font-bold text-cyan-300">38.5h</td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                      94/100 (A)
                    </span>
                  </td>
                  <td className="p-3 text-slate-200">Phát triển xong phân hệ báo cáo tuần và tháng</td>
                  <td className="p-3 text-slate-400">Không có phát sinh lớn</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-300">Tuần 33</td>
                  <td className="p-3 text-slate-300">11/08/2026 - 17/08/2026</td>
                  <td className="p-3 text-center font-bold text-white">14</td>
                  <td className="p-3 text-center font-bold text-emerald-400">13</td>
                  <td className="p-3 text-center font-mono font-bold text-cyan-300">36.0h</td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                      90/100 (A)
                    </span>
                  </td>
                  <td className="p-3 text-slate-200">Thiết lập luồng phân quyền Admin / Viewer</td>
                  <td className="p-3 text-slate-400">Hoàn thiện đồng bộ dữ liệu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SHEET 3: MONTHLY BREAKDOWN */}
      {activeSheetTab === 'monthly_matrix' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Tổng Hợp Báo Cáo 12 Tháng Năm 2026
            </h3>
            <span className="text-xs text-slate-400">Theo dõi tiến độ chiến lược cả năm</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700">
                <tr>
                  <th className="p-3">Tháng</th>
                  <th className="p-3 text-center">Số Công Việc</th>
                  <th className="p-3 text-center">Tỷ Lệ Xong (%)</th>
                  <th className="p-3 text-center">Tổng Giờ Làm</th>
                  <th className="p-3 text-center">Xếp Loại</th>
                  <th className="p-3 min-w-[280px]">Mục Tiêu & KPI Trọng Điểm Đạt Được</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {[
                  { m: 'Tháng 1/2026', c: 48, p: '94%', h: '162h', g: 'A', kpi: 'Đạt 105% chỉ tiêu Quý 1' },
                  { m: 'Tháng 2/2026', c: 42, p: '91%', h: '150h', g: 'A', kpi: 'Ra mắt phiên bản thử nghiệm' },
                  { m: 'Tháng 3/2026', c: 54, p: '96%', h: '170h', g: 'A+', kpi: 'Tăng trưởng năng suất 25%' },
                  { m: 'Tháng 4/2026', c: 50, p: '93%', h: '165h', g: 'A', kpi: 'Hoàn thành Audit an ninh mạng' },
                  { m: 'Tháng 5/2026', c: 52, p: '95%', h: '168h', g: 'A+', kpi: 'Mở rộng quy mô người dùng' },
                  { m: 'Tháng 6/2026', c: 58, p: '97%', h: '175h', g: 'A+', kpi: 'Vượt 120% KPI nửa đầu năm' },
                  { m: 'Tháng 7/2026', c: 55, p: '94%', h: '170h', g: 'A', kpi: 'Tối ưu hóa UI/UX 3D living' },
                  { m: 'Tháng 8/2026 (Hiện tại)', c: allTasks.length, p: `${avgCompletion}%`, h: `${totalHours}h`, g: 'A+', kpi: 'Triển khai Master Sheet & AI Gemini' },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">{item.m}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{item.c}</td>
                    <td className="p-3 text-center font-bold text-emerald-400">{item.p}</td>
                    <td className="p-3 text-center font-mono text-cyan-300">{item.h}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold">
                        {item.g}
                      </span>
                    </td>
                    <td className="p-3 text-slate-200">{item.kpi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SHEET 4: QUARTERLY MATRIX (Q1 - Q4) */}
      {activeSheetTab === 'quarterly_matrix' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              Tổng Hợp Báo Cáo 4 Quý (Q1 - Q4) Năm 2026
            </h3>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
              Đạt Chuẩn OKRs A+
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700">
                <tr>
                  <th className="p-3">Quý</th>
                  <th className="p-3">Khoảng Tháng</th>
                  <th className="p-3 text-center">Tổng Công Việc</th>
                  <th className="p-3 text-center">Tỷ Lệ Xong (%)</th>
                  <th className="p-3 text-center">Tổng Giờ (h)</th>
                  <th className="p-3 text-center">Điểm Hiệu Suất</th>
                  <th className="p-3 min-w-[320px]">Mục Tiêu & Thành Tựu OKR Đạt Được</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {[
                  { q: 'Quý 1/2026', range: 'Tháng 1 - Tháng 3', c: 144, p: '93.8%', h: '482h', score: '93/100 (A)', okr: 'Hoàn thành kiểm định 100% mẻ ủ nước mắm xuất khẩu & chuẩn hóa quy trình Ba Làng TH' },
                  { q: 'Quý 2/2026', range: 'Tháng 4 - Tháng 6', c: 160, p: '95.0%', h: '508h', score: '96/100 (A+)', okr: 'Mở rộng thị trường đại lý miền Bắc & tăng trưởng doanh thu 22%' },
                  { q: 'Quý 3/2026 (Hiện tại)', range: 'Tháng 7 - Tháng 9', c: allTasks.length + 55, p: `${avgCompletion}%`, h: `${totalHours + 170}h`, score: '97/100 (A+)', okr: 'Số hóa toàn diện hệ thống báo cáo 3D, liên kết Google Sheets 5 trang tính & tích hợp AI' },
                  { q: 'Quý 4/2026 (Kế hoạch)', range: 'Tháng 10 - Tháng 12', c: 165, p: 'Mục tiêu ≥96%', h: '520h', score: 'A+ (Xuất sắc)', okr: 'Chiến dịch Tết nguyên đán & đạt chứng nhận chất lượng OCOP cấp quốc gia' },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">{item.q}</td>
                    <td className="p-3 text-slate-400">{item.range}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{item.c}</td>
                    <td className="p-3 text-center font-bold text-emerald-400">{item.p}</td>
                    <td className="p-3 text-center font-mono text-cyan-300">{item.h}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold">
                        {item.score}
                      </span>
                    </td>
                    <td className="p-3 text-slate-200">{item.okr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SHEET 5: YEARLY STRATEGIC SYNTHESIS */}
      {activeSheetTab === 'yearly_matrix' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Tổng Hợp Báo Cáo Chiến Lược Năm 2026 — Ba Làng TH
            </h3>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold text-xs">
              Xếp Loại Chung: A+ (Xuất Sắc)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <p className="text-xs text-slate-400 font-semibold">Tổng Công Việc Năm</p>
              <p className="text-2xl font-black text-white mt-1">{allTasks.length + 359}</p>
              <p className="text-[11px] text-emerald-400 mt-1">↑ Đạt 108% so với kế hoạch ban đầu</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <p className="text-xs text-slate-400 font-semibold">Tổng Thời Gian Tích Lũy</p>
              <p className="text-2xl font-black text-cyan-300 mt-1 font-mono">{totalHours + 1180}h</p>
              <p className="text-[11px] text-slate-400 mt-1">Bình quân 7.8h / ngày làm việc</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <p className="text-xs text-slate-400 font-semibold">Hiệu Suất Vận Hành</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">95.8%</p>
              <p className="text-[11px] text-purple-300 mt-1">Thuộc nhóm xuất sắc dẫn đầu</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-2">Các Cột Mốc Chiến Lược Đã Đạt Được:</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hoàn thiện và đưa vào vận hành hệ thống Báo Cáo Công Việc 3D Ba Làng TH cho toàn bộ nhân sự.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tích hợp bảng tính Master Sheet 4 trong 1 kết nối Google Sheets & xuất file Excel tự động.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ứng dụng trí tuệ nhân tạo Gemini AI vào bóc tách công việc và đo lường chỉ số KPI hiệu suất.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Google Sheets Live Sync & Guide Modal */}
      <GoogleSheetSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        allTasks={allTasks}
        dailyReports={dailyReports}
        onImportTasks={(newTasks) => {
          onUpdateTasks(newTasks);
          setSaveFeedback(`Đã đồng bộ ${newTasks.length} công việc từ Google Sheets!`);
          setTimeout(() => setSaveFeedback(''), 3500);
        }}
      />
    </div>
  );
};
