import React, { useState, useRef } from 'react';
import { ShieldCheck, Eye, KeyRound, User as UserIcon, CheckCircle2, AlertCircle, Camera, Upload, ArrowRight, Sparkles, Lock, Mail, Briefcase, UserCheck } from 'lucide-react';
import { User, UserRole } from '../types';
import { INITIAL_USERS, DEFAULT_ADMIN_AVATAR, getStoredAdminAvatar } from '../mock/initialData';
import { BaLangLogo } from './BaLangLogo';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state (Chỉ tạo tài khoản Người Xem / Viewer - Để trống để người dùng tự nhập)
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom registered users
  const getRegisteredUsers = (): User[] => {
    const permanentAvatar = getStoredAdminAvatar();
    const saved = localStorage.getItem('3d_workreport_registered_users');
    if (saved) {
      try {
        const list: User[] = JSON.parse(saved);
        return list.map((u) => {
          if (u.username === 'admin' || u.role === 'admin' || u.avatar?.includes('photo-1507003211169')) {
            return { ...u, avatar: permanentAvatar };
          }
          return u;
        });
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS.map((u) => ({
      ...u,
      avatar: permanentAvatar,
    }));
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
        setSuccessMsg('Đã tải ảnh đại diện người xem thành công!');
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

    const permanentAvatar = getStoredAdminAvatar();
    const allUsers = getRegisteredUsers();
    let foundUser = allUsers.find(
      (u) => u.username.toLowerCase() === trimmed || u.email.toLowerCase() === trimmed
    );

    if (foundUser) {
      if (foundUser.role === 'admin' || trimmed === 'admin') {
        foundUser = { ...foundUser, avatar: permanentAvatar };
      }
      setSuccessMsg(`Đăng nhập thành công! Chào mừng ${foundUser.name}`);
      setTimeout(() => {
        onLogin(foundUser);
      }, 400);
    } else {
      // Auto login as dynamic user - chỉ duy nhất 'admin' mới là Quản Trị Viên
      const isAdminAccount = trimmed === 'admin';
      const dynamicUser: User = {
        id: `user_${Date.now()}`,
        username: trimmed,
        name: isAdminAccount ? 'Trịnh Minh Đức' : trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
        role: isAdminAccount ? 'admin' : 'viewer',
        avatar: isAdminAccount ? permanentAvatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        email: `${trimmed}@balang.com.vn`,
        title: isAdminAccount ? 'Quản Trị Viên' : 'Người Xem Báo Cáo',
      };
      const updatedList = [...allUsers, dynamicUser];
      saveRegisteredUsers(updatedList);
      setSuccessMsg(`Đăng nhập thành công! Chào mừng ${dynamicUser.name}`);
      setTimeout(() => {
        onLogin(dynamicUser);
      }, 500);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên.');
      return;
    }
    const trimmedUsername = regUsername.trim().toLowerCase();
    if (!trimmedUsername) {
      setErrorMsg('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (trimmedUsername === 'admin') {
      setErrorMsg('Tên đăng nhập "admin" là tài khoản Quản Trị Viên cố định của hệ thống. Vui lòng chọn tên đăng nhập khác cho Người Xem.');
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
      (u) => u.username.toLowerCase() === trimmedUsername
    );

    if (existing) {
      setErrorMsg('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác hoặc chuyển sang Đăng nhập.');
      return;
    }

    // Luôn cố định vai trò Người Xem (Viewer) cho tài khoản mới
    const finalAvatar = regAvatar.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
    const newUser: User = {
      id: `user_viewer_${Date.now()}`,
      username: trimmedUsername,
      name: regName.trim(),
      role: 'viewer',
      avatar: finalAvatar,
      email: regEmail.trim(),
      title: regTitle.trim() || 'Người Xem Báo Cáo',
    };

    const updatedList = [newUser, ...allUsers];
    saveRegisteredUsers(updatedList);

    setSuccessMsg('Tạo tài khoản Người Xem thành công! Đang chuyển vào hệ thống...');
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
                    placeholder="Nhập tên đăng nhập hoặc email..."
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
                    placeholder="Nhập mật khẩu..."
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
                {regAvatar ? (
                  <img
                    src={regAvatar}
                    alt="Preview Avatar"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-400 shadow-md">
                    <UserIcon className="w-7 h-7 text-slate-400" />
                  </div>
                )}
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
                <p className="text-[11px] text-slate-400 mb-2">Tải ảnh chân dung (.jpg, .png) hoặc để trống</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>{regAvatar ? 'Đổi ảnh khác' : 'Chọn ảnh từ máy tính'}</span>
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
                  placeholder="Nhập họ và tên..."
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
                  placeholder="Nhập tên đăng nhập..."
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
                    placeholder="Nhập địa chỉ email..."
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
                    placeholder="Nhập chức danh / vị trí công tác..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Phân quyền tài khoản - Cố định Người Xem (Viewer) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Phân quyền tài khoản đăng ký:
                </label>
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-indigo-400" /> Chỉ tạo tài khoản Người Xem
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/50 via-slate-900/60 to-slate-950/70 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white">Người Xem Báo Cáo (Viewer)</p>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        Cố định
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Được cấp quyền xem toàn bộ báo cáo công việc, tra cứu tiến độ và xuất dữ liệu PDF / Excel.
                    </p>
                  </div>
                </div>
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 italic">
                * Lưu ý: Quyền Quản Trị Viên (Admin) được bảo mật độc quyền cho ban điều hành (Trịnh Minh Đức), không mở đăng ký tự do.
              </p>
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
                  placeholder="Nhập mật khẩu..."
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
                  placeholder="Nhập lại mật khẩu..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="submit-register-btn"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-600 to-emerald-600 hover:from-indigo-400 hover:to-emerald-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 transition-all mt-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Tạo Tài Khoản Người Xem & Vào Báo Cáo</span>
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
