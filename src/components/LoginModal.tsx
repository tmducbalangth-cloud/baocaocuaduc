import React, { useState } from 'react';
import { X, ShieldCheck, Eye, KeyRound, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { INITIAL_USERS } from '../mock/initialData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedUser = username.trim().toLowerCase();
    const foundUser = INITIAL_USERS.find((u) => u.username.toLowerCase() === trimmedUser);

    if (foundUser) {
      // For demo convenience, allow corresponding passwords or any password >= 4 chars
      if (password.length < 4) {
        setErrorMsg('Mật khẩu tối thiểu 4 ký tự.');
        return;
      }
      onLogin(foundUser);
      setSuccessMsg(`Đăng nhập thành công với vai trò ${foundUser.role.toUpperCase()}`);
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      // Allow custom user login as viewer by default
      const customUser: User = {
        id: `user_${Date.now()}`,
        username: trimmedUser,
        name: trimmedUser.charAt(0).toUpperCase() + trimmedUser.slice(1),
        role: trimmedUser.includes('admin') ? 'admin' : 'viewer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        email: `${trimmedUser}@example.com`,
        title: trimmedUser.includes('admin') ? 'Quản Trị Viên' : 'Người Xem Báo Cáo',
      };
      onLogin(customUser);
      setSuccessMsg(`Đăng nhập thành công với vai trò ${customUser.role.toUpperCase()}`);
      setTimeout(() => {
        onClose();
      }, 600);
    }
  };

  const handleQuickSelect = (user: User, defaultPass: string) => {
    setUsername(user.username);
    setPassword(defaultPass);
    onLogin(user);
    setSuccessMsg(`Đã chuyển sang vai trò: ${user.name}`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/95 border border-slate-800 shadow-[0_0_50px_rgba(6,182,212,0.25)] p-6 md:p-8 overflow-hidden">
        {/* Glow Decor */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="close-login-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-display">
            Đăng Nhập Hệ Thống 3D
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Chọn tài khoản Admin (Quản trị) hoặc Viewer (Người xem)
          </p>
        </div>

        {/* Quick Demo Switcher Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Admin Card */}
          <button
            type="button"
            id="quick-admin-login"
            onClick={() => handleQuickSelect(INITIAL_USERS[0], 'admin123')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              currentUser?.role === 'admin'
                ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-slate-800/50 border-slate-700/80 hover:border-cyan-500/40 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>ADMIN (QUẢN TRỊ)</span>
              </div>
              {currentUser?.role === 'admin' && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              )}
            </div>
            <p className="text-xs font-semibold text-white">admin / admin123</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Toàn quyền thêm, sửa, đẩy Sheet, bấm AI tổng kê đo lường
            </p>
          </button>

          {/* Viewer Card */}
          <button
            type="button"
            id="quick-viewer-login"
            onClick={() => handleQuickSelect(INITIAL_USERS[1], 'viewer123')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              currentUser?.role === 'viewer'
                ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                : 'bg-slate-800/50 border-slate-700/80 hover:border-amber-500/40 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                <Eye className="w-4 h-4" />
                <span>NGƯỜI XEM (VIEWER)</span>
              </div>
              {currentUser?.role === 'viewer' && (
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <p className="text-xs font-semibold text-white">viewer / viewer123</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Chỉ xem báo cáo 3D, tùy chỉnh ngày tháng, xuất báo cáo
            </p>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            hoặc đăng nhập thủ công
          </span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tài khoản (Tên đăng nhập)
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập 'admin' hoặc 'viewer'..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            {currentUser && (
              <button
                type="button"
                id="logout-btn"
                onClick={() => {
                  onLogout();
                  setSuccessMsg('Đã đăng xuất.');
                  setTimeout(() => onClose(), 500);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors"
              >
                Đăng Xuất
              </button>
            )}
            <button
              type="submit"
              id="submit-login-btn"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
            >
              Xác Nhận Đăng Nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
