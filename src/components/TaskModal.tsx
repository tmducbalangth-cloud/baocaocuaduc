import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Tag, Clock, Target, CheckCircle2 } from 'lucide-react';
import { TaskItem, TaskCategory, TaskPriority, TaskStatus } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskItem) => void;
  onDelete?: (taskId: string) => void;
  taskToEdit?: TaskItem | null;
  selectedDate: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  taskToEdit,
  selectedDate,
}) => {
  const [title, setTitle] = useState('');
  const [taskDate, setTaskDate] = useState(selectedDate);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Phát triển');
  const [status, setStatus] = useState<TaskStatus>('completed');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [timeSpentHours, setTimeSpentHours] = useState(2);
  const [completionPercent, setCompletionPercent] = useState(100);
  const [kpiMetric, setKpiMetric] = useState('');
  const [outcome, setOutcome] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setTaskDate(taskToEdit.date || selectedDate);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category as TaskCategory);
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setTimeSpentHours(taskToEdit.timeSpentHours);
      setCompletionPercent(taskToEdit.completionPercent);
      setKpiMetric(taskToEdit.kpiMetric || '');
      setOutcome(taskToEdit.outcome || '');
      setTagsInput(taskToEdit.tags?.join(', ') || '');
    } else {
      setTitle('');
      setTaskDate(selectedDate);
      setDescription('');
      setCategory('Phát triển');
      setStatus('completed');
      setPriority('medium');
      setTimeSpentHours(2);
      setCompletionPercent(100);
      setKpiMetric('');
      setOutcome('');
      setTagsInput('');
    }
  }, [taskToEdit, isOpen, selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const task: TaskItem = {
      id: taskToEdit ? taskToEdit.id : `task_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      priority,
      date: taskDate || selectedDate,
      timeSpentHours: Number(timeSpentHours) || 1,
      completionPercent: Number(completionPercent) || 0,
      kpiMetric: kpiMetric.trim() || 'Hoàn thành 100% mục tiêu',
      outcome: outcome.trim() || (status === 'completed' ? 'Đã hoàn thành' : 'Đang xử lý'),
      tags: tags.length > 0 ? tags : [category],
    };

    onSave(task);
    onClose();
  };

  const categories: TaskCategory[] = [
    'Phát triển',
    'Thiết kế',
    'Kinh doanh',
    'Marketing',
    'Quản trị',
    'Hỗ trợ',
    'Nghiên cứu',
    'Khác',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(6,182,212,0.25)] p-6 md:p-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight font-display">
                {taskToEdit ? 'Chỉnh Sửa Công Việc' : 'Thêm Công Việc Mới'}
              </h2>
              <span className="text-xs text-slate-400">
                Ngày thực hiện: <span className="text-cyan-300 font-semibold">{selectedDate}</span>
              </span>
            </div>
          </div>
          <button
            id="close-task-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 my-4 pr-1 space-y-4">
          {/* Title and Date in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tên công việc / Đầu việc *
              </label>
              <input
                id="task-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Xây dựng Canvas 3D Three.js và Shader..."
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ngày thực hiện *
              </label>
              <input
                id="task-date-input"
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono font-semibold"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mô tả chi tiết công việc
            </label>
            <textarea
              id="task-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả phạm vi thực hiện, phương pháp, các bước thực hiện..."
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Danh mục / Phòng ban
              </label>
              <select
                id="task-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Độ ưu tiên
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="high">🔴 Cao (High)</option>
                <option value="medium">🟡 Trung bình (Medium)</option>
                <option value="low">🟢 Thấp (Low)</option>
              </select>
            </div>
          </div>

          {/* Time & Completion % */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Thời gian thực hiện (Giờ)</span>
              </label>
              <input
                id="task-hours-input"
                type="number"
                step="0.5"
                min="0.25"
                max="24"
                value={timeSpentHours}
                onChange={(e) => setTimeSpentHours(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Tiến độ hoàn thành:</span>
                <span className="text-cyan-400 font-bold">{completionPercent}%</span>
              </label>
              <input
                id="task-progress-range"
                type="range"
                min="0"
                max="100"
                step="5"
                value={completionPercent}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setCompletionPercent(val);
                  if (val === 100) setStatus('completed');
                  else if (val > 0) setStatus('in_progress');
                  else setStatus('pending');
                }}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer mt-2"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Trạng thái công việc
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'completed' as TaskStatus, label: 'Đã hoàn thành', color: 'border-emerald-500 text-emerald-300 bg-emerald-500/10' },
                { id: 'in_progress' as TaskStatus, label: 'Đang làm', color: 'border-cyan-500 text-cyan-300 bg-cyan-500/10' },
                { id: 'pending' as TaskStatus, label: 'Chờ xử lý', color: 'border-amber-500 text-amber-300 bg-amber-500/10' },
                { id: 'blocked' as TaskStatus, label: 'Bị nghẽn/Chặn', color: 'border-rose-500 text-rose-300 bg-rose-500/10' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  id={`status-btn-${s.id}`}
                  onClick={() => {
                    setStatus(s.id);
                    if (s.id === 'completed') setCompletionPercent(100);
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    status === s.id
                      ? `${s.color} shadow-[0_0_10px_rgba(6,182,212,0.2)]`
                      : 'border-slate-800 text-slate-400 bg-slate-950/40 hover:bg-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI & Outcome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                <span>Chỉ số đo lường KPI cụ thể</span>
              </label>
              <input
                id="task-kpi-input"
                type="text"
                value={kpiMetric}
                onChange={(e) => setKpiMetric(e.target.value)}
                placeholder="VD: 5/5 màn hình, Doanh thu 12tr..."
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kết quả thực tế đạt được
              </label>
              <input
                id="task-outcome-input"
                type="text"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="VD: Đã bàn giao đúng hạn, chất lượng cao..."
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Thẻ tag (Phân cách bằng dấu phẩy)</span>
            </label>
            <input
              id="task-tags-input"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="UI/UX, Frontend, Sprint 4..."
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {taskToEdit && onDelete ? (
              <button
                type="button"
                id="delete-task-btn"
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa công việc này?')) {
                    onDelete(taskToEdit.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                id="cancel-task-btn"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                id="save-task-btn"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Công Việc</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
