import React, { useState, useRef } from 'react';
import { ShieldCheck, Eye, KeyRound, User as UserIcon, CheckCircle2, AlertCircle, Camera, Upload, ArrowRight, Sparkles, Lock, Mail, Briefcase } from 'lucide-react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../mock/initialData';
import { BaLangLogo } from './BaLangLogo';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('Trịnh Minh Đức');
  const [regUsername, setRegUsername] = useState('tmduc');
  const [regEmail, setRegEmail] = useState('tmduc.balangth@gmail.com');
  const [regTitle, setRegTitle] = useState('Giám Đốc Điều Hành / Trịnh Minh Đức');
  const [regRole, setRegRole] = useState<UserRole>('admin');
  const [regPassword, setRegPassword] = useState('123456');
  const [regConfirmPassword, setRegConfirmPassword] = useState('123456');
  const [regAvatar, setRegAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom registered users
  const getRegisteredUsers = (): User[] => {
    const saved = localStorage.getItem('3d_workreport_registered_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS;
  };

  const saveRegisteredUsers = (users: User[]) => {
    localStorage.setItem('3d_workreport_registered_users', JSON.stringify(users));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setRegAvatar(base64);
        setSuccessMsg('Đã tải ảnh đại diện thành công!');
        setTimeout(() => setSuccessMsg(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = loginUsername.trim().toLowerCase();
    if (!trimmed) {
      setErrorMsg('Vui lòng nhập tên đăng nhập hoặc email.');
      return;
    }

    const allUsers = getRegisteredUsers();
    const foundUser = allUsers.find(
      (u) => u.username.toLowerCase() === trimmed || u.email.toLowerCase() === trimmed
    );

    if (foundUser) {
      setSuccessMsg(`Đăng nhập thành công! Chào mừng ${foundUser.name}`);
      setTimeout(() => {
        onLogin(foundUser);
      }, 400);
    } else {
      // Auto login as dynamic user
      const dynamicUser: User = {
        id: `user_${Date.now()}`,
        username: trimmed,
        name: trimmed === 'admin' ? 'Trịnh Minh Đức' : trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
        role: trimmed.includes('admin') ? 'admin' : 'viewer',
        avatar: regAvatar,
        email: `${trimmed}@balang.com.vn`,
        title: trimmed.includes('admin') ? 'Quản Trị Viên' : 'Người Xem Báo Cáo',
      };
      const updatedList = [...allUsers, dynamicUser];
      saveRegisteredUsers(updatedList);
      setSuccessMsg(`Đăng nhập thành công! Chào mừng ${dynamicUser.name}`);
      setTimeout(() => {
        onLogin(dynamicUser);
      }, 500);
    }
  };

  const handleQuickLogin = (user: User) => {
    setSuccessMsg(`Đang đăng nhập với vai trò: ${user.name}`);
    setTimeout(() => {
      onLogin(user);
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Vui lòng nhập email hợp lệ.');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMsg('Mật khẩu tối thiểu 4 ký tự.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    const allUsers = getRegisteredUsers();
    const existing = allUsers.find(
      (u) => u.username.toLowerCase() === regUsername.trim().toLowerCase()
    );

    if (existing) {
      setErrorMsg('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác hoặc chuyển sang Đăng nhập.');
      return;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username: regUsername.trim().toLowerCase(),
      name: regName.trim(),
      role: regRole,
      avatar: regAvatar,
      email: regEmail.trim(),
      title: regTitle.trim() || (regRole === 'admin' ? 'Quản Trị Viên' : 'Người Xem Báo Cáo'),
    };

    const updatedList = [newUser, ...allUsers];
    saveRegisteredUsers(updatedList);

    setSuccessMsg('Tạo tài khoản thành công! Đang chuyển vào hệ thống...');
    setTimeout(() => {
      onLogin(newUser);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-20">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800 shadow-[0_0_80px_rgba(6,182,212,0.25)] p-6 sm:p-8 overflow-hidden transition-all relative">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center justify-center p-2.5 px-4 rounded-2xl bg-white/95 border border-slate-700/80 shadow-[0_0_30px_rgba(255,255,255,0.2)] mb-3 transform hover:scale-105 transition-transform">
            <BaLangLogo size="md" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-white uppercase font-display">
            BÁO CÁO CÔNG VIỆC
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Hệ thống quản trị, bảng tính tổng hợp & đo lường hiệu suất 3D
          </p>
        </div>

        {/* Tab Buttons (Đăng Nhập / Tạo Tài Khoản) */}
        <div className="flex p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            id="auth-tab-login"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Đăng Nhập</span>
          </button>
          <button
            type="button"
            id="auth-tab-register"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tạo Tài Khoản Mới</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGIN VIEW */}
        {activeTab === 'login' && (
          <div className="space-y-5">
            {/* Quick 1-Click Login Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Chọn nhanh tài khoản mẫu:
                </span>
                <span className="text-[11px] text-cyan-400 font-semibold">1-Click vào hệ thống</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Admin Card */}
                <button
                  type="button"
                  id="quick-login-admin-btn"
                  onClick={() => handleQuickLogin(INITIAL_USERS[0])}
                  className="p-3 rounded-2xl bg-slate-800/60 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/10 text-left transition-all group flex items-center gap-3"
                >
                  <img
                    src={INITIAL_USERS[0].avatar}
                    alt="Admin Avatar"
                    className="w-10 h-10 rounded-xl object-cover border border-cyan-400 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                        {INITIAL_USERS[0].name}
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-cyan-300 font-semibold uppercase">Admin (Toàn quyền)</p>
                  </div>
                </button>

                {/* Viewer Card */}
                <button
                  type="button"
                  id="quick-login-viewer-btn"
                  onClick={() => handleQuickLogin(INITIAL_USERS[1])}
                  className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-indigo-400 hover:bg-indigo-500/10 text-left transition-all group flex items-center gap-3"
                >
                  <img
                    src={INITIAL_USERS[1].avatar}
                    alt="Viewer Avatar"
                    className="w-10 h-10 rounded-xl object-cover border border-indigo-400 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                        {INITIAL_USERS[1].name}
                      </span>
                      <Eye className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-indigo-300 font-semibold uppercase">Viewer (Xem báo cáo)</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Hoặc nhập thông tin
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tên đăng nhập hoặc Email:
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-username-input"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="admin hoặc tmduc.balangth@gmail.com"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mật khẩu:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password-input"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Không bắt buộc cho tài khoản mẫu..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="submit-login-btn"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all"
              >
                <span>Đăng Nhập Vào Hệ Thống</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* REGISTER VIEW */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Avatar Upload Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={regAvatar}
                  alt="Preview Avatar"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400 shadow-md"
                />
                <button
                  type="button"
                  id="reg-avatar-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md transition-transform hover:scale-110"
                  title="Tải ảnh chân dung từ máy"
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
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">Ảnh Đại Diện</p>
                <p className="text-[11px] text-slate-400 mb-2">Tải ảnh chân dung (.jpg, .png) của bạn</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>Chọn ảnh từ máy tính</span>
                </button>
              </div>
            </div>

            {/* Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Họ và tên: *
                </label>
                <input
                  id="reg-name-input"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Trịnh Minh Đức"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên đăng nhập: *
                </label>
                <input
                  id="reg-username-input"
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="tmduc hoặc duc_balang"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            {/* Email & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email: *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-email-input"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="tmduc.balangth@gmail.com"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chức danh / Vị trí:
                </label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-title-input"
                    type="text"
                    value={regTitle}
                    onChange={(e) => setRegTitle(e.target.value)}
                    placeholder="Giám Đốc Điều Hành / Trưởng Phòng"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Chọn vai trò & quyền hạn:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="reg-role-admin-btn"
                  onClick={() => setRegRole('admin')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    regRole === 'admin'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Quản Trị Viên (Admin)</p>
                    <p className="text-[10px] text-slate-400">Toàn quyền sửa, xóa, duyệt</p>
                  </div>
                </button>

                <button
                  type="button"
                  id="reg-role-viewer-btn"
                  onClick={() => setRegRole('viewer')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    regRole === 'viewer'
                      ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Người Xem (Viewer)</p>
                    <p className="text-[10px] text-slate-400">Xem và xuất báo cáo</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mật khẩu: *
                </label>
                <input
                  id="reg-password-input"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 4 ký tự"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Xác nhận mật khẩu: *
                </label>
                <input
                  id="reg-confirm-password-input"
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="submit-register-btn"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tạo Tài Khoản & Vào Báo Cáo</span>
            </button>
          </form>
        )}

        {/* Security Note Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hệ thống bảo mật cục bộ & sẵn sàng đồng bộ Google Sheets</span>
        </div>
      </div>
    </div>
  );
};
