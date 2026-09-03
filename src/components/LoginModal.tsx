import React, { useState, useRef, useEffect } from 'react';
import { X, ShieldCheck, Eye, KeyRound, User as UserIcon, CheckCircle2, AlertCircle, Camera, Upload, Check } from 'lucide-react';
import { User } from '../types';
import { INITIAL_USERS, DEFAULT_ADMIN_AVATAR, getStoredAdminAvatar } from '../mock/initialData';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const getInitialAvatar = () => {
    const permanent = getStoredAdminAvatar();
    if (permanent && !permanent.includes('photo-1507003211169')) return permanent;
    if (currentUser?.avatar && !currentUser.avatar.includes('photo-1507003211169')) return currentUser.avatar;
    return DEFAULT_ADMIN_AVATAR;
  };

  const [customAvatar, setCustomAvatar] = useState(getInitialAvatar);
  const [customName, setCustomName] = useState(currentUser?.name || 'Trịnh Minh Đức');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync avatar to permanent client storage & backend
  const saveAndPersistAvatar = (avatarData: string) => {
    try {
      localStorage.setItem('3d_workreport_permanent_admin_avatar', avatarData);
      fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarData }),
      }).catch((err) => console.warn('Sync avatar to server error:', err));
    } catch (e) {
      console.error('Error persisting avatar:', e);
    }
  };

  // Sync on mount if current user already has custom avatar
  useEffect(() => {
    if (currentUser?.avatar && !currentUser.avatar.includes('photo-1507003211169')) {
      setCustomAvatar(currentUser.avatar);
      if (currentUser.avatar.startsWith('data:image')) {
        saveAndPersistAvatar(currentUser.avatar);
      }
    } else {
      const perm = getStoredAdminAvatar();
      setCustomAvatar(perm);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomAvatar(base64);
        saveAndPersistAvatar(base64);

        if (currentUser) {
          const updated = { ...currentUser, avatar: base64, name: customName || 'Trịnh Minh Đức' };
          onLogin(updated);
        }
        setSuccessMsg('✓ Đã cập nhật & cố định ảnh đại diện Admin thành công!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    saveAndPersistAvatar(customAvatar);
    if (currentUser) {
      const updated = {
        ...currentUser,
        name: customName.trim() || 'Trịnh Minh Đức',
        avatar: customAvatar,
      };
      onLogin(updated);
      setSuccessMsg('✓ Đã lưu thông tin và cố định ảnh đại diện Admin thành công!');
      setTimeout(() => onClose(), 600);
    } else {
      setSuccessMsg('✓ Đã lưu và cố định ảnh đại diện cho tài khoản Admin!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedUser = username.trim().toLowerCase();
    const foundUser = INITIAL_USERS.find((u) => u.username.toLowerCase() === trimmedUser);
    const permanentAvatar = getStoredAdminAvatar() || customAvatar || DEFAULT_ADMIN_AVATAR;

    if (foundUser) {
      const userToSave = {
        ...foundUser,
        name: customName || foundUser.name,
        avatar: permanentAvatar,
      };
      onLogin(userToSave);
      setSuccessMsg(`Đăng nhập thành công với vai trò ${foundUser.role.toUpperCase()}`);
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      const isAdminUser = trimmedUser === 'admin';
      const customUser: User = {
        id: `user_${Date.now()}`,
        username: trimmedUser,
        name: customName || (trimmedUser.charAt(0).toUpperCase() + trimmedUser.slice(1)),
        role: isAdminUser ? 'admin' : 'viewer',
        avatar: isAdminUser ? permanentAvatar : DEFAULT_ADMIN_AVATAR,
        email: `${trimmedUser}@balang.com.vn`,
        title: isAdminUser ? 'Quản Trị Viên' : 'Người Xem Báo Cáo',
      };
      onLogin(customUser);
      setSuccessMsg(`Đăng nhập thành công với vai trò ${customUser.role.toUpperCase()}`);
      setTimeout(() => {
        onClose();
      }, 600);
    }
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
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_ADMIN_AVATAR;
              }}
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-400">
                  Tên hiển thị & Chủ sở hữu báo cáo:
                </label>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Cố định Admin
                </span>
              </div>
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
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
              >
                Lưu tên & ảnh
              </button>
            </div>
          </div>
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
                placeholder="Nhập tên đăng nhập..."
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
