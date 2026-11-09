import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, X, AlertCircle, GraduationCap } from 'lucide-react';
import { verifyTeacherPassword } from '../utils/teacherAuth';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetDescription?: string;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetDescription = 'Chế độ Giáo viên & Trợ giảng AI Đáp Án',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg(null);
      setShowPassword(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu xác thực Giáo viên.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    const isValid = await verifyTeacherPassword(password);
    setIsVerifying(false);

    if (isValid) {
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setErrorMsg('Mật khẩu không chính xác! Vui lòng kiểm tra lại mật khẩu Giáo viên.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-amber-200 overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner shrink-0">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
                Bảo mật SHA-256 một chiều
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold leading-tight">
                Xác Thực Chế Độ Giáo Viên
              </h3>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
            <GraduationCap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              Bạn đang yêu cầu mở khóa <strong>{targetDescription}</strong>. Chế độ này mở toàn quyền xem <strong>Đáp án chuẩn từng bước</strong>, <strong>AI kiểm tra nhanh Đúng/Sai</strong> và <strong>Hệ thống Giao đề & Ra đề theo mức độ</strong>.
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
              Mật khẩu Giáo viên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Nhập mật khẩu bảo mật..."
                autoComplete="off"
                className={`w-full pl-10 pr-11 py-3 rounded-xl border-2 font-mono text-base transition-all outline-none ${
                  errorMsg
                    ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                tabIndex={-1}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Giữ chế độ Học sinh
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {isVerifying ? 'Đang giải mã...' : 'Mở khóa Chế độ Giáo viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
