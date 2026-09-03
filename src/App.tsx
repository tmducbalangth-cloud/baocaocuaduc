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
import { TaskItem, DailyReport, User, ViewTab, normalizeCategory, ViewerFeedback, TaskStatus } from './types';
import { INITIAL_USERS, INITIAL_TASKS, INITIAL_DAILY_REPORTS, INITIAL_FEEDBACK, formatDateStr, DEFAULT_ADMIN_AVATAR, getStoredAdminAvatar } from './mock/initialData';
import { subscribeToCloudData, saveCloudData } from './services/firestoreService';
import { computeDailyReportForTasks } from './services/reportSyncService';

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

  // Synchronize with Google Firebase Firestore in Real Time (Indestructible across Vercel deployments)
  useEffect(() => {
    const unsubscribe = subscribeToCloudData(
      (cloudData) => {
        if (cloudData.tasks && Array.isArray(cloudData.tasks) && cloudData.tasks.length > 0) {
          setTasks(cloudData.tasks);
        } else {
          // If Firestore is empty, seed it with current initial tasks and reports!
          saveCloudData(tasks, dailyReports, feedbacks).catch(console.warn);
        }

        if (cloudData.dailyReports && Array.isArray(cloudData.dailyReports) && cloudData.dailyReports.length > 0) {
          setDailyReports(cloudData.dailyReports);
        }

        if (cloudData.feedbacks && Array.isArray(cloudData.feedbacks) && cloudData.feedbacks.length > 0) {
          setFeedbacks(cloudData.feedbacks);
        }
      },
      (err) => {
        console.warn('Firebase sync warning:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  const showSyncSuccessToast = (msg: string = '✓ Đã tự động cập nhật toàn bộ báo cáo & đồng bộ người xem!') => {
    setSyncToastMessage(msg);
    setTimeout(() => {
      setSyncToastMessage(null);
    }, 3500);
  };

  // Helper to sync to both Google Firebase Cloud Firestore and server API
  const persistAllData = (
    nextTasks: TaskItem[],
    nextReports: DailyReport[],
    nextFeedbacks: ViewerFeedback[]
  ) => {
    // 1. Google Firebase Cloud Firestore (Real-time and persistent across deployments)
    saveCloudData(nextTasks, nextReports, nextFeedbacks).catch(console.warn);
    // 2. Server API sync (fallback)
    syncServerData(nextTasks, nextReports);
    // 3. Local storage instant update
    try {
      localStorage.setItem('3d_workreport_tasks', JSON.stringify(nextTasks));
      localStorage.setItem('3d_workreport_daily_reports', JSON.stringify(nextReports));
      localStorage.setItem('3d_workreport_feedbacks', JSON.stringify(nextFeedbacks));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

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

  // Current Day Tasks and Report (guaranteed sync between tasks and daily reports)
  const currentDayTasks = tasks.filter((t) => t.date === selectedDate);
  const currentDayReport =
    dailyReports.find((r) => r.date === selectedDate) ||
    (currentDayTasks.length > 0
      ? computeDailyReportForTasks(selectedDate, tasks, dailyReports, currentUser?.name || 'Trịnh Minh Đức')[0]
      : null);

  // Task Operations - Automatically updates DailyReport metrics, highlights & syncs to Cloud
  const handleSaveTask = (task: TaskItem) => {
    const exists = tasks.some((t) => t.id === task.id);
    const nextTasks = exists ? tasks.map((t) => (t.id === task.id ? task : t)) : [task, ...tasks];
    const nextReports = computeDailyReportForTasks(
      task.date,
      nextTasks,
      dailyReports,
      currentUser?.name || 'Trịnh Minh Đức'
    );
    setTasks(nextTasks);
    setDailyReports(nextReports);
    persistAllData(nextTasks, nextReports, feedbacks);
    showSyncSuccessToast(exists ? '✓ Đã cập nhật công việc & tự động tính toán lại báo cáo!' : '✓ Đã thêm công việc mới & tự động tính toán lại báo cáo!');
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    const targetDate = taskToDelete?.date || selectedDate;
    const nextTasks = tasks.filter((t) => t.id !== taskId);
    const nextReports = computeDailyReportForTasks(
      targetDate,
      nextTasks,
      dailyReports,
      currentUser?.name || 'Trịnh Minh Đức'
    );
    setTasks(nextTasks);
    setDailyReports(nextReports);
    persistAllData(nextTasks, nextReports, feedbacks);
    showSyncSuccessToast('✓ Đã xóa công việc & tự động cập nhật báo cáo ngày!');
  };

  const handleToggleTaskStatus = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    const targetDate = targetTask?.date || selectedDate;
    const nextTasks = tasks.map((t) => {
      if (t.id === taskId) {
        const isDone = t.status === 'completed' || (t.completionPercent || 0) >= 100;
        return {
          ...t,
          status: (isDone ? 'in_progress' : 'completed') as TaskStatus,
          completionPercent: isDone ? 50 : 100,
        };
      }
      return t;
    });
    const nextReports = computeDailyReportForTasks(
      targetDate,
      nextTasks,
      dailyReports,
      currentUser?.name || 'Trịnh Minh Đức'
    );
    setTasks(nextTasks);
    setDailyReports(nextReports);
    persistAllData(nextTasks, nextReports, feedbacks);
    showSyncSuccessToast('✓ Đã đổi trạng thái & tự động đồng bộ tiến độ người xem!');
  };

  const handleImportTasks = (newTasks: TaskItem[]) => {
    const nextTasks = [...newTasks, ...tasks];
    let updatedReports = [...dailyReports];
    const affectedDates = Array.from(new Set(newTasks.map((t) => t.date)));
    for (const d of affectedDates) {
      updatedReports = computeDailyReportForTasks(
        d,
        nextTasks,
        updatedReports,
        currentUser?.name || 'Trịnh Minh Đức'
      );
    }
    setTasks(nextTasks);
    setDailyReports(updatedReports);
    persistAllData(nextTasks, updatedReports, feedbacks);
    showSyncSuccessToast(`✓ Đã nhập ${newTasks.length} công việc từ Sheet & cập nhật toàn bộ báo cáo!`);
  };

  const handleSaveDailyReport = (newReport: DailyReport) => {
    setDailyReports((prev) => {
      const filtered = prev.filter((r) => r.date !== newReport.date);
      const nextReports = [newReport, ...filtered];
      persistAllData(tasks, nextReports, feedbacks);
      return nextReports;
    });
    showSyncSuccessToast('✓ Đã lưu và đồng bộ báo cáo ngày lên Cloud vĩnh viễn!');
  };

  // Feedback Operations
  const handleAddFeedback = async (newFb: Omit<ViewerFeedback, 'id' | 'createdAt'>) => {
    const feedbackItem: ViewerFeedback = {
      ...newFb,
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
    };

    const nextFeedbacks = [feedbackItem, ...feedbacks];
    setFeedbacks(nextFeedbacks);
    persistAllData(tasks, dailyReports, nextFeedbacks);

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
    const nextFeedbacks = feedbacks.filter((f) => f.id !== id);
    setFeedbacks(nextFeedbacks);
    persistAllData(tasks, dailyReports, nextFeedbacks);

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
        tasks={tasks}
        dailyReports={dailyReports}
        feedbacks={feedbacks}
        onRestoreData={(restoredTasks, restoredReports, restoredFeedbacks) => {
          setTasks(restoredTasks);
          setDailyReports(restoredReports);
          setFeedbacks(restoredFeedbacks);
          persistAllData(restoredTasks, restoredReports, restoredFeedbacks);
        }}
        onSyncCloud={async () => {
          return await saveCloudData(tasks, dailyReports, feedbacks);
        }}
      />
      {/* Floating Auto-Sync Notification */}
      {syncToastMessage && (
        <div
          id="global-sync-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900/95 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-[0_10px_35px_rgba(16,185,129,0.35)] backdrop-blur-xl transition-all duration-300 transform translate-y-0"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>{syncToastMessage}</span>
        </div>
      )}
    </div>
  );
}

