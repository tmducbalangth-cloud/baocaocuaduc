import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ThreeCanvasBackground } from './components/ThreeCanvasBackground';
import { DailyReportView } from './components/DailyReportView';
import { WeeklyReportView } from './components/WeeklyReportView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { YearlyReportView } from './components/YearlyReportView';
import { LoginModal } from './components/LoginModal';
import { TaskModal } from './components/TaskModal';
import { SheetImportModal } from './components/SheetImportModal';
import { ExportModal } from './components/ExportModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { TaskItem, DailyReport, User, ViewTab } from './types';
import { INITIAL_USERS, INITIAL_TASKS, INITIAL_DAILY_REPORTS, formatDateStr } from './mock/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateStr(new Date()));
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // Default Admin

  // Tasks & Reports State
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('3d_workreport_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_TASKS;
  });

  const [dailyReports, setDailyReports] = useState<DailyReport[]>(() => {
    const saved = localStorage.getItem('3d_workreport_daily_reports');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_DAILY_REPORTS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('3d_workreport_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('3d_workreport_daily_reports', JSON.stringify(dailyReports));
  }, [dailyReports]);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);

  // Current Day Tasks and Report
  const currentDayTasks = tasks.filter((t) => t.date === selectedDate);
  const currentDayReport = dailyReports.find((r) => r.date === selectedDate) || null;

  // Task Operations
  const handleSaveTask = (task: TaskItem) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      if (exists) {
        return prev.map((t) => (t.id === task.id ? task : t));
      }
      return [task, ...prev];
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === 'completed' || t.completionPercent >= 100;
          return {
            ...t,
            status: isDone ? 'in_progress' : 'completed',
            completionPercent: isDone ? 50 : 100,
          };
        }
        return t;
      })
    );
  };

  const handleImportTasks = (newTasks: TaskItem[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
  };

  const handleSaveDailyReport = (newReport: DailyReport) => {
    setDailyReports((prev) => {
      const filtered = prev.filter((r) => r.date !== newReport.date);
      return [newReport, ...filtered];
    });
  };

  const handleOpenTaskModalForEdit = (task?: TaskItem) => {
    setTaskToEdit(task || null);
    setIsTaskModalOpen(true);
  };

  const handleSelectDailyReportFromWeekly = (date: string) => {
    setSelectedDate(date);
    setActiveTab('daily');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 3D WebGL Three.js Ambient Particle & Crystal Scene */}
      <ThreeCanvasBackground />

      {/* Main Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sticky Header */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenExport={() => setIsExportModalOpen(true)}
          onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 md:py-8">
          {activeTab === 'daily' && (
            <DailyReportView
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              report={currentDayReport}
              tasks={currentDayTasks}
              currentUser={currentUser}
              onOpenTaskModal={handleOpenTaskModalForEdit}
              onOpenSheetModal={() => setIsSheetModalOpen(true)}
              onSaveReport={handleSaveDailyReport}
              onToggleTaskStatus={handleToggleTaskStatus}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'weekly' && (
            <WeeklyReportView
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              dailyReports={dailyReports}
              allTasks={tasks}
              currentUser={currentUser}
              onSelectDailyReport={handleSelectDailyReportFromWeekly}
            />
          )}

          {activeTab === 'monthly' && (
            <MonthlyReportView
              selectedDate={selectedDate}
              allTasks={tasks}
              dailyReports={dailyReports}
            />
          )}

          {activeTab === 'yearly' && (
            <YearlyReportView
              allTasks={tasks}
              dailyReports={dailyReports}
            />
          )}
        </main>

        {/* 3D Cyber Footer */}
        <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl py-6 px-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 font-medium">3D WorkReport Pro v2.5 • AI Measurement Engine Active</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Đăng nhập: <strong className="text-cyan-300">{currentUser?.name} ({currentUser?.role.toUpperCase()})</strong></span>
              <span>•</span>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="hover:text-cyan-400 transition-colors underline"
              >
                Chuyển vai trò
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentUser={currentUser}
        onLogin={setCurrentUser}
        onLogout={() => setCurrentUser(null)}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        taskToEdit={taskToEdit}
        selectedDate={selectedDate}
      />

      <SheetImportModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        targetDate={selectedDate}
        onImportTasks={handleImportTasks}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeTab={activeTab}
        currentDailyReport={currentDayReport}
        currentWeeklyReport={null}
      />

      <DeploymentGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />
    </div>
  );
}
