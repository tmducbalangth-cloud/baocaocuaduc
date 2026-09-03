import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ThreeCanvasBackground } from './components/ThreeCanvasBackground';
import { DailyReportView } from './components/DailyReportView';
import { WeeklyReportView } from './components/WeeklyReportView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { QuarterlyReportView } from './components/QuarterlyReportView';
import { YearlyReportView } from './components/YearlyReportView';
import { MasterSheetView } from './components/MasterSheetView';
import { AuthScreen } from './components/AuthScreen';
import { LoginModal } from './components/LoginModal';
import { TaskModal } from './components/TaskModal';
import { SheetImportModal } from './components/SheetImportModal';
import { ExportModal } from './components/ExportModal';
import { TaskItem, DailyReport, User, ViewTab, normalizeCategory, ViewerFeedback } from './types';
import { INITIAL_USERS, INITIAL_TASKS, INITIAL_DAILY_REPORTS, INITIAL_FEEDBACK, formatDateStr, DEFAULT_ADMIN_AVATAR, getStoredAdminAvatar } from './mock/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateStr(new Date()));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('3d_workreport_current_user');
    const permanentAvatar = getStoredAdminAvatar();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          if (parsed.name?.includes('Nguyễn Thành Nam') || parsed.name?.includes('Trần Minh Đức')) {
            parsed.name = 'Trịnh Minh Đức';
          }
          if (parsed.avatar?.includes('photo-1507003211169') || !parsed.avatar) {
            parsed.avatar = permanentAvatar;
          }
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return null; // Show Auth Screen by default unless user has logged in
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('3d_workreport_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('3d_workreport_current_user');
    }
  }, [currentUser]);

  // Synchronize admin avatar permanently with backend and local storage
  useEffect(() => {
    const permAvatar = getStoredAdminAvatar();
    const activeAvatar = currentUser?.avatar && !currentUser.avatar.includes('photo-1507003211169') ? currentUser.avatar : permAvatar;

    if (activeAvatar && activeAvatar.startsWith('data:image')) {
      try {
        localStorage.setItem('3d_workreport_permanent_admin_avatar', activeAvatar);
        fetch('/api/user/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: activeAvatar }),
        }).catch(console.warn);
      } catch (e) {
        console.error(e);
      }
    } else {
      fetch('/api/user/avatar')
        .then((res) => res.json())
        .then((data) => {
          if (data.avatar && data.avatar.startsWith('data:image')) {
            localStorage.setItem('3d_workreport_permanent_admin_avatar', data.avatar);
            if (currentUser && (!currentUser.avatar || currentUser.avatar.includes('photo-1507003211169'))) {
              setCurrentUser((prev) => (prev ? { ...prev, avatar: data.avatar } : null));
            }
          }
        })
        .catch(console.warn);
    }
  }, [currentUser]);

  // Tasks & Reports State
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('3d_workreport_tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((t: TaskItem) => ({
            ...t,
            category: normalizeCategory(t.category),
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TASKS;
  });

  const [dailyReports, setDailyReports] = useState<DailyReport[]>(() => {
    const saved = localStorage.getItem('3d_workreport_daily_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((r: DailyReport) => ({
            ...r,
            tasks: (r.tasks || []).map((t: TaskItem) => ({
              ...t,
              category: normalizeCategory(t.category),
            })),
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_DAILY_REPORTS;
  });

  // Viewer Feedbacks State
  const [feedbacks, setFeedbacks] = useState<ViewerFeedback[]>(() => {
    const saved = localStorage.getItem('3d_workreport_feedbacks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_FEEDBACK;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('3d_workreport_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('3d_workreport_daily_reports', JSON.stringify(dailyReports));
  }, [dailyReports]);

  useEffect(() => {
    localStorage.setItem('3d_workreport_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  // Load and synchronize shared data from server
  useEffect(() => {
    fetch('/api/shared/data')
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
          setTasks(
            data.tasks.map((t: TaskItem) => ({
              ...t,
              category: normalizeCategory(t.category),
            }))
          );
        } else {
          // If server is empty, seed initial data to server so all visitors can see!
          fetch('/api/shared/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tasks, dailyReports }),
          }).catch(console.warn);
        }

        if (data.dailyReports && Array.isArray(data.dailyReports) && data.dailyReports.length > 0) {
          setDailyReports(data.dailyReports);
        }

        if (data.feedbacks && Array.isArray(data.feedbacks) && data.feedbacks.length > 0) {
          setFeedbacks(data.feedbacks);
        }
      })
      .catch(console.warn);
  }, []);

  // Helper to sync tasks and reports to server
  const syncServerData = (updatedTasks: TaskItem[], updatedReports: DailyReport[]) => {
    fetch('/api/shared/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: updatedTasks, dailyReports: updatedReports }),
    }).catch(console.warn);
  };

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Current Day Tasks and Report
  const currentDayTasks = tasks.filter((t) => t.date === selectedDate);
  const currentDayReport = dailyReports.find((r) => r.date === selectedDate) || null;

  // Task Operations
  const handleSaveTask = (task: TaskItem) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      const nextTasks = exists ? prev.map((t) => (t.id === task.id ? task : t)) : [task, ...prev];
      syncServerData(nextTasks, dailyReports);
      return nextTasks;
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => {
      const nextTasks = prev.filter((t) => t.id !== taskId);
      syncServerData(nextTasks, dailyReports);
      return nextTasks;
    });
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) => {
      const nextTasks = prev.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === 'completed' || t.completionPercent >= 100;
          return {
            ...t,
            status: isDone ? 'in_progress' : 'completed',
            completionPercent: isDone ? 50 : 100,
          };
        }
        return t;
      });
      syncServerData(nextTasks, dailyReports);
      return nextTasks;
    });
  };

  const handleImportTasks = (newTasks: TaskItem[]) => {
    setTasks((prev) => {
      const nextTasks = [...newTasks, ...prev];
      syncServerData(nextTasks, dailyReports);
      return nextTasks;
    });
  };

  const handleSaveDailyReport = (newReport: DailyReport) => {
    setDailyReports((prev) => {
      const filtered = prev.filter((r) => r.date !== newReport.date);
      const nextReports = [newReport, ...filtered];
      syncServerData(tasks, nextReports);
      return nextReports;
    });
  };

  // Feedback Operations
  const handleAddFeedback = async (newFb: Omit<ViewerFeedback, 'id' | 'createdAt'>) => {
    const feedbackItem: ViewerFeedback = {
      ...newFb,
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
    };

    setFeedbacks((prev) => [feedbackItem, ...prev]);

    try {
      const res = await fetch('/api/shared/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackItem }),
      });
      const data = await res.json();
      if (data.feedbacks && Array.isArray(data.feedbacks)) {
        setFeedbacks(data.feedbacks);
      }
    } catch (e) {
      console.warn('Could not post feedback to server:', e);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    try {
      const res = await fetch(`/api/shared/feedback/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.feedbacks && Array.isArray(data.feedbacks)) {
        setFeedbacks(data.feedbacks);
      }
    } catch (e) {
      console.warn('Could not delete feedback from server:', e);
    }
  };

  const handleOpenTaskModalForEdit = (task?: TaskItem) => {
    setTaskToEdit(task || null);
    setIsTaskModalOpen(true);
  };

  const handleSelectDailyReportFromWeekly = (date: string) => {
    setSelectedDate(date);
    setActiveTab('daily');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoginOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 3D WebGL Three.js Ambient Particle & Crystal Scene */}
      <ThreeCanvasBackground />

      {/* When logged out: Show Dedicated Auth Portal (Login & Register) */}
      {!currentUser ? (
        <AuthScreen onLogin={setCurrentUser} />
      ) : (
        /* Main Foreground Content when Logged In */
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Sticky Header */}
          <Navbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenExport={() => setIsExportModalOpen(true)}
            onLogout={handleLogout}
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
                feedbacks={feedbacks}
                onAddFeedback={handleAddFeedback}
                onDeleteFeedback={handleDeleteFeedback}
                onOpenLoginModal={() => setIsLoginOpen(true)}
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
                feedbacks={feedbacks}
                onAddFeedback={handleAddFeedback}
                onDeleteFeedback={handleDeleteFeedback}
                onOpenLoginModal={() => setIsLoginOpen(true)}
              />
            )}

            {activeTab === 'monthly' && (
              <MonthlyReportView
                selectedDate={selectedDate}
                allTasks={tasks}
                dailyReports={dailyReports}
                currentUser={currentUser}
                feedbacks={feedbacks}
                onAddFeedback={handleAddFeedback}
                onDeleteFeedback={handleDeleteFeedback}
                onOpenLoginModal={() => setIsLoginOpen(true)}
              />
            )}

            {activeTab === 'quarterly' && (
              <QuarterlyReportView
                selectedDate={selectedDate}
                allTasks={tasks}
                dailyReports={dailyReports}
                currentUser={currentUser}
                feedbacks={feedbacks}
                onAddFeedback={handleAddFeedback}
                onDeleteFeedback={handleDeleteFeedback}
                onOpenLoginModal={() => setIsLoginOpen(true)}
              />
            )}

            {activeTab === 'yearly' && (
              <YearlyReportView
                allTasks={tasks}
                dailyReports={dailyReports}
                currentUser={currentUser}
                feedbacks={feedbacks}
                onAddFeedback={handleAddFeedback}
                onDeleteFeedback={handleDeleteFeedback}
                onOpenLoginModal={() => setIsLoginOpen(true)}
              />
            )}

            {activeTab === 'sheet' && (
              <MasterSheetView
                allTasks={tasks}
                dailyReports={dailyReports}
                currentUser={currentUser}
                onUpdateTasks={setTasks}
                onUpdateDailyReports={setDailyReports}
              />
            )}
          </main>

          {/* 3D Cyber Footer */}
          <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl py-6 px-4 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400 font-medium">Báo Cáo Công Việc • Ba Làng TH</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span>Đang đăng nhập: <strong className="text-cyan-300">{currentUser.name} ({currentUser.role.toUpperCase()})</strong></span>
                <span>•</span>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="hover:text-cyan-400 transition-colors underline"
                >
                  Đổi hồ sơ / vai trò
                </button>
                <span>•</span>
                <button
                  onClick={handleLogout}
                  className="text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentUser={currentUser}
        onLogin={setCurrentUser}
        onLogout={handleLogout}
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
    </div>
  );
}

