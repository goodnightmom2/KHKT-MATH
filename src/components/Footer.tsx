import React from 'react';
import { OptiMascot } from '../mascot/OptiMascot';
import { Heart, Smartphone, Monitor, ShieldCheck, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-800">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/20">
              <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
                <path
                  d="M 12 28 L 20 12 L 28 28 Z"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="20" cy="20" r="3" fill="#FBBF24" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">OPTIMATH LAB</span>
                <span className="text-[10px] font-bold bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700/50">
                  Giai đoạn 1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Phòng thí nghiệm Toán học trực quan THPT Việt Nam
              </p>
            </div>
          </div>

          {/* Slogan from reference sheet */}
          <div className="text-center md:text-right">
            <p className="text-xs sm:text-sm font-semibold text-slate-200">
              Học toán thông minh &nbsp;•&nbsp; Phát triển toàn diện &nbsp;•&nbsp; Kiến tạo tương lai
            </p>
            <div className="mt-2 flex items-center justify-center md:justify-end gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                Desktop
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                Mobile & Tablet
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Chuẩn PWA
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} OPTIMATH LAB. Đồng hành cùng học sinh và giáo viên Toán THPT.
          </p>
          <div className="flex items-center gap-1.5">
            <span>Thiết kế tương tác sư phạm cùng</span>
            <span className="text-blue-400 font-semibold">Opti</span>
            <OptiMascot expression="happy" size={24} animate={false} />
          </div>
        </div>
      </div>
    </footer>
  );
};
