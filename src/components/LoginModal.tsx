import React, { useState, useRef } from 'react';
import { X, ShieldCheck, Eye, KeyRound, User as UserIcon, CheckCircle2, AlertCircle, Camera, Upload } from 'lucide-react';
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
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [customAvatar, setCustomAvatar] = useState(currentUser?.avatar || INITIAL_USERS[0].avatar);
  const [customName, setCustomName] = useState(currentUser?.name || 'Trịnh Minh Đức');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomAvatar(base64);
        if (currentUser) {
          const updated = { ...currentUser, avatar: base64, name: customName || 'Trịnh Minh Đức' };
          onLogin(updated);
          setSuccessMsg('Đã cập nhật ảnh đại diện thành công!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    if (currentUser) {
      const updated = {
        ...currentUser,
        name: customName.trim() || 'Trịnh Minh Đức',
        avatar: customAvatar,
      };
      onLogin(updated);
      setSuccessMsg('Đã lưu thông tin tài khoản thành công!');
      setTimeout(() => onClose(), 600);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedUser = username.trim().toLowerCase();
    const foundUser = INITIAL_USERS.find((u) => u.username.toLowerCase() === trimmedUser);

    if (foundUser) {
      const userToSave = {
        ...foundUser,
        name: customName || foundUser.name,
        avatar: customAvatar || foundUser.avatar,
      };
      onLogin(userToSave);
      setSuccessMsg(`Đăng nhập thành công với vai trò ${foundUser.role.toUpperCase()}`);
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      const customUser: User = {
        id: `user_${Date.now()}`,
        username: trimmedUser,
        name: customName || (trimmedUser.charAt(0).toUpperCase() + trimmedUser.slice(1)),
        role: trimmedUser.includes('admin') ? 'admin' : 'viewer',
        avatar: customAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
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
    const userToSet = {
      ...user,
      name: customName || user.name,
      avatar: customAvatar || user.avatar,
    };
    onLogin(userToSet);
    setSuccessMsg(`Đã chuyển sang vai trò: ${userToSet.name}`);
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
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-white tracking-tight font-display">
            Tài Khoản & Quyền Hệ Thống
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý hồ sơ cá nhân và chuyển đổi vai trò Admin / Viewer
          </p>
        </div>

        {/* Profile Card & Avatar Uploader */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 mb-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group shrink-0">
            <img
              src={customAvatar}
              alt={customName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
            />
            <button
              type="button"
              id="upload-avatar-trigger-btn"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md transition-transform hover:scale-110"
              title="Tải ảnh chân dung từ máy tính"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex-1 w-full space-y-2 text-center sm:text-left">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Tên hiển thị & Chủ sở hữu báo cáo:
              </label>
              <input
                id="custom-user-name-input"
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Trịnh Minh Đức"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                id="btn-upload-avatar-file"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>Tải ảnh từ máy (.jpg/.png)</span>
              </button>
              <button
                type="button"
                id="btn-save-profile-custom"
                onClick={handleUpdateProfile}
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                Lưu tên & ảnh
              </button>
            </div>
          </div>
        </div>

        {/* Quick Demo Switcher Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Admin Card */}
          <button
            type="button"
            id="quick-admin-login"
            onClick={() => handleQuickSelect(INITIAL_USERS[0], '')}
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
            <p className="text-xs font-semibold text-white">Tài khoản: admin</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Toàn quyền thêm, sửa, đẩy Sheet, bấm AI tổng kê đo lường
            </p>
          </button>

          {/* Viewer Card */}
          <button
            type="button"
            id="quick-viewer-login"
            onClick={() => handleQuickSelect(INITIAL_USERS[1], '')}
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
            <p className="text-xs font-semibold text-white">Tài khoản: viewer</p>
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
                placeholder="Không bắt buộc cho tài khoản mẫu..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
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
