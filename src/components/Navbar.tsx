import React from 'react';
import { Calendar, BarChart3, TrendingUp, Award, ShieldCheck, Eye, LogIn, Sparkles, Printer, Globe } from 'lucide-react';
import { User, ViewTab } from '../types';

interface NavbarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenExport: () => void;
  onOpenDeployGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onOpenLogin,
  onOpenExport,
  onOpenDeployGuide,
}) => {
  const tabs = [
    { id: 'daily' as ViewTab, label: 'Báo Cáo Ngày', icon: Calendar, tag: 'Chi tiết & Sheet' },
    { id: 'weekly' as ViewTab, label: 'Báo Cáo Tuần', icon: BarChart3, tag: 'Tổng hợp & Đo lường' },
    { id: 'monthly' as ViewTab, label: 'Báo Cáo Tháng', icon: TrendingUp, tag: 'Xu hướng & OKR' },
    { id: 'yearly' as ViewTab, label: 'Báo Cáo Năm', icon: Award, tag: 'Tổng kết & Xếp hạng' },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Logo with 3D Holographic Cube Effect */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] transform hover:rotate-6 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-display">
                  3D WorkReport <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Pro</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-md">
                  3D Living
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Hệ thống báo cáo & đo lường hiệu suất công việc không gian 3D
              </p>
            </div>
          </div>

          {/* Mobile Actions Trigger */}
          <div className="md:hidden flex items-center gap-2">
            {onOpenDeployGuide && (
              <button
                id="mobile-deploy-btn"
                onClick={onOpenDeployGuide}
                title="Hướng dẫn triển khai ngoài"
                className="p-1.5 rounded-lg text-cyan-300 bg-cyan-500/10 border border-cyan-500/30"
              >
                <Globe className="w-4 h-4" />
              </button>
            )}
            <button
              id="mobile-login-btn"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
            >
              {currentUser?.role === 'admin' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{currentUser ? currentUser.role.toUpperCase() : 'Đăng nhập'}</span>
            </button>
          </div>
        </div>

        {/* 3D Navigation Pills */}
        <nav className="flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner w-full md:w-auto overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping absolute right-2 top-2" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Deploy Guide, Export & Role Switcher */}
        <div className="hidden md:flex items-center gap-2.5">
          {onOpenDeployGuide && (
            <button
              id="nav-deploy-guide-btn"
              onClick={onOpenDeployGuide}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-sm"
              title="Xem hướng dẫn tải mã nguồn và chạy ứng dụng ở máy cá nhân hoặc Cloud"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Chạy Ngoài</span>
            </button>
          )}

          <button
            id="nav-export-btn"
            onClick={onOpenExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Xuất Báo Cáo</span>
          </button>

          {/* User Account Role Card / Switcher */}
          <button
            id="nav-auth-card"
            onClick={onOpenLogin}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all text-left group shadow-sm"
          >
            {currentUser ? (
              <>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded border ${
                        currentUser.role === 'admin'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {currentUser.role === 'admin' ? 'Admin' : 'Viewer'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate max-w-[110px]">
                    {currentUser.role === 'admin' ? 'Toàn quyền sửa & AI' : 'Chỉ xem báo cáo'}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 px-2 py-1">
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span>Đăng nhập</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
