import React from 'react';
import { OptiMascot } from '../mascot/OptiMascot';
import { Presentation, Compass, BookOpen, Layers, Target, Award, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentModule: string;
  onSelectModule: (modId: string) => void;
  onOpenTeacherGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onSelectModule,
  onOpenTeacherGuide
}) => {
  const isLab =
    currentModule === 'lab' ||
    currentModule === 'system' ||
    currentModule === 'optimization' ||
    currentModule === 'quiz';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/95">
      <div
        className={`max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-3 transition-all ${
          isLab ? 'h-12 sm:h-15' : 'h-16'
        }`}
      >
        {/* Logo */}
        <button
          onClick={() => onSelectModule('home')}
          className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer"
        >
          <div
            className={`rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform ${
              isLab ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-10 h-10'
            }`}
          >
            <svg viewBox="0 0 40 40" className={isLab ? 'w-5 h-5' : 'w-6 h-6'} fill="none">
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
            <div className="flex items-center gap-1">
              <span className={`font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors ${
                isLab ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
              }`}>
                OPTIMATH
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-700 tracking-wider uppercase">
                LAB
              </span>
            </div>
            {!isLab && (
              <p className="text-[10px] text-slate-500 hidden sm:block font-medium">
                Phòng thí nghiệm Toán học trực quan
              </p>
            )}
          </div>
        </button>

        {/* Navigation Quick Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onSelectModule('home')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentModule === 'home'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Trang chủ
          </button>
          <button
            onClick={() => onSelectModule('lab')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentModule === 'lab'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Module 2: Một BPT</span>
          </button>
          <button
            onClick={() => onSelectModule('system')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentModule === 'system'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Module 3: Hệ BPT</span>
          </button>
          <button
            onClick={() => onSelectModule('optimization')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              currentModule === 'optimization'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Module 4: Tối Ưu</span>
          </button>
          <button
            onClick={() => onSelectModule('quiz')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              currentModule === 'quiz'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Module 5: Luyện Tập</span>
          </button>
          <button
            onClick={() => onSelectModule('knowledge')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              currentModule === 'knowledge'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Lý thuyết
          </button>
        </nav>

        {/* Right CTA: Teacher Mode & Opti Indicator */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTeacherGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-all shadow-xs"
          >
            <Presentation className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Chế độ giáo viên</span>
            <span className="sm:hidden">Giáo viên</span>
          </button>

          <div
            onClick={() => onSelectModule('lab')}
            className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-slate-100 hover:bg-blue-50 border border-slate-200 cursor-pointer transition-colors"
            title="Gặp gỡ Opti"
          >
            <span className="text-[11px] font-bold text-slate-700 hidden lg:inline">Opti</span>
            <OptiMascot expression="happy" size={28} animate={false} />
          </div>
        </div>
      </div>
    </header>
  );
};
