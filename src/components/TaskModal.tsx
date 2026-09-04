import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Tag, Clock, Target, CheckCircle2, Layers, Lock } from 'lucide-react';
import { TaskItem, TaskCategory, TaskPriority, TaskStatus, TASK_CATEGORIES, normalizeCategory } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskItem) => void;
  onDelete?: (taskId: string) => void;
  taskToEdit?: TaskItem | null;
  selectedDate: string;
  isAdmin?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  taskToEdit,
  selectedDate,
  isAdmin = true,
}) => {
  const [title, setTitle] = useState('');
  const [taskDate, setTaskDate] = useState(selectedDate);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Marketing');
  const [status, setStatus] = useState<TaskStatus>('completed');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [quantityInput, setQuantityInput] = useState<string>('1');
  const [timeSpentInput, setTimeSpentInput] = useState<string>('2');
  const [completionPercent, setCompletionPercent] = useState(100);
  const [kpiMetric, setKpiMetric] = useState('');
  const [outcome, setOutcome] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setTaskDate(taskToEdit.date || selectedDate);
      setDescription(taskToEdit.description || '');
      setCategory(normalizeCategory(taskToEdit.category));
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setQuantityInput(
        taskToEdit.quantity !== undefined && taskToEdit.quantity !== null
          ? String(taskToEdit.quantity)
          : '1'
      );
      setTimeSpentInput(
        taskToEdit.timeSpentHours !== undefined && taskToEdit.timeSpentHours !== null
          ? String(taskToEdit.timeSpentHours)
          : '2'
      );
      setCompletionPercent(taskToEdit.completionPercent);
      setKpiMetric(taskToEdit.kpiMetric || '');
      setOutcome(taskToEdit.outcome || '');
      setTagsInput(taskToEdit.tags?.join(', ') || '');
    } else {
      setTitle('');
      setTaskDate(selectedDate);
      setDescription('');
      setCategory('Marketing');
      setStatus('completed');
      setPriority('medium');
      setQuantityInput('1');
      setTimeSpentInput('2');
      setCompletionPercent(100);
      setKpiMetric('');
      setOutcome('');
      setTagsInput('');
    }
  }, [taskToEdit, isOpen, selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Parse quantity input: freely entered, minimum 1 (e.g. 1, 2, 5, 10...)
    const sanitizedQty = quantityInput.toString().trim().replace(',', '.');
    const parsedQty = parseFloat(sanitizedQty);
    const finalQuantity = !isNaN(parsedQty) && parsedQty >= 1 ? parsedQty : 1;

    // Parse user input: accept any positive number, support comma as decimal point (e.g., 2,5 or 2.5)
    const sanitizedTime = timeSpentInput.toString().trim().replace(',', '.');
    const parsedTime = parseFloat(sanitizedTime);
    const finalHours = !isNaN(parsedTime) && parsedTime >= 0 ? parsedTime : 0;

    const task: TaskItem = {
      id: taskToEdit ? taskToEdit.id : `task_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      priority,
      date: taskDate || selectedDate,
      quantity: finalQuantity,
      timeSpentHours: finalHours,
      completionPercent: Number(completionPercent) || 0,
      kpiMetric: kpiMetric.trim() || 'Hoàn thành 100% mục tiêu',
      outcome: outcome.trim() || (status === 'completed' ? 'Đã hoàn thành' : 'Đang xử lý'),
      tags: tags.length > 0 ? tags : [category],
    };

    onSave(task);
    onClose();
  };

  const categories = TASK_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(6,182,212,0.25)] p-6 md:p-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isAdmin
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {isAdmin ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight font-display">
                  {isAdmin
                    ? taskToEdit
                      ? 'Chỉnh Sửa Công Việc'
                      : 'Thêm Công Việc Mới'
                    : 'Chi Tiết Công Việc'}
                </h2>
                {!isAdmin && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Chỉ xem (Đã khóa)
                  </span>
                )}
              </div>
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
          <fieldset disabled={!isAdmin} className="space-y-4 border-0 p-0 m-0 min-w-0">
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

          {/* Quantity & Time Spent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Số lượng công việc</span>
                </span>
                <span className="text-[10px] text-slate-400">Tối thiểu: 1</span>
              </label>
              <div className="relative">
                <input
                  id="task-quantity-input"
                  type="text"
                  inputMode="decimal"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  placeholder="VD: 1, 2, 5, 10..."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono font-semibold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">
                  Việc / Mục
                </span>
              </div>
              {/* Quick suggestions */}
              <div className="flex items-center gap-1.5 mt-1.5">
                {['1', '2', '3', '5', '10'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuantityInput(val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      quantityInput === val
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Spent */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Thời gian thực hiện (Giờ)</span>
                </span>
                <span className="text-[10px] text-slate-400">Nhập số giờ bất kỳ</span>
              </label>
              <div className="relative">
                <input
                  id="task-hours-input"
                  type="text"
                  inputMode="decimal"
                  value={timeSpentInput}
                  onChange={(e) => setTimeSpentInput(e.target.value)}
                  placeholder="VD: 0.5, 1.5, 2, 4, 8..."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono font-semibold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">
                  Giờ
                </span>
              </div>
              {/* Quick suggestions */}
              <div className="flex items-center gap-1.5 mt-1.5">
                {['0.5', '1', '1.5', '2', '4', '8'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTimeSpentInput(val)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      timeSpentInput === val
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {val}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Completion Progress Slider */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Tiến độ hoàn thành:</span>
              <span className="text-cyan-400 font-bold text-sm">{completionPercent}%</span>
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
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
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
          </fieldset>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {!isAdmin ? (
              <>
                <div className="flex items-center gap-1.5 text-xs text-amber-300/90 font-medium">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Chế độ Người xem: Đã khóa quyền thêm/sửa/xóa đầu việc này</span>
                </div>
                <button
                  type="button"
                  id="close-readonly-task-btn"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
                >
                  Đóng
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
