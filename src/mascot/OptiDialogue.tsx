import React, { useState } from 'react';
import { OptiMascot, OptiActionState } from './OptiMascot';
import { OptiExpression, OptiPose } from '../types/math';
import { Sparkles, HelpCircle, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

interface OptiDialogueProps {
  message: string;
  expression?: OptiExpression;
  pose?: OptiPose;
  actionState?: OptiActionState;
  colorTheme?: 'blue' | 'green' | 'orange' | 'purple';
  badge?: string;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  quickHints?: string[];
  onSelectHint?: (hint: string) => void;
  className?: string;
}

export const OptiDialogue: React.FC<OptiDialogueProps> = ({
  message,
  expression = 'happy',
  pose = 'idle',
  actionState,
  colorTheme = 'blue',
  badge = 'Trợ lý học tập',
  isVisible = true,
  onToggleVisibility,
  quickHints,
  onSelectHint,
  className = ''
}) => {
  const [speechEnabled, setSpeechEnabled] = useState(false);

  // Inferred action state if not explicitly passed:
  // Green / Happy / Cheering -> 'nod' (Gật đầu khen ngợi)
  // Orange / Sad / Thinking -> 'think' (Suy tư, nghiêng đầu giải thích)
  const effectiveActionState: OptiActionState =
    actionState ||
    (expression === 'cheering' || colorTheme === 'green'
      ? 'nod'
      : expression === 'sad' || expression === 'thinking' || colorTheme === 'orange'
      ? 'think'
      : 'idle');

  const themeStyles = {
    blue: {
      border: 'border-blue-200',
      bg: 'bg-gradient-to-br from-blue-50/90 to-sky-50/90',
      badgeBg: 'bg-blue-600 text-white',
      textColor: 'text-slate-800',
      glow: 'shadow-blue-100',
      tag: 'bg-blue-100 text-blue-700'
    },
    green: {
      border: 'border-emerald-200',
      bg: 'bg-gradient-to-br from-emerald-50/90 to-teal-50/90',
      badgeBg: 'bg-emerald-600 text-white',
      textColor: 'text-slate-800',
      glow: 'shadow-emerald-100',
      tag: 'bg-emerald-100 text-emerald-800'
    },
    orange: {
      border: 'border-amber-200',
      bg: 'bg-gradient-to-br from-amber-50/90 to-orange-50/90',
      badgeBg: 'bg-amber-600 text-white',
      textColor: 'text-slate-800',
      glow: 'shadow-amber-100',
      tag: 'bg-amber-100 text-amber-800'
    },
    purple: {
      border: 'border-purple-200',
      bg: 'bg-gradient-to-br from-purple-50/90 to-violet-50/90',
      badgeBg: 'bg-purple-600 text-white',
      textColor: 'text-slate-800',
      glow: 'shadow-purple-100',
      tag: 'bg-purple-100 text-purple-800'
    }
  }[colorTheme];

  if (!isVisible) {
    return (
      <div className={`flex items-center justify-end ${className}`}>
        <button
          onClick={onToggleVisibility}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors shadow-sm"
          title="Hiện trợ lý Opti"
        >
          <OptiMascot expression="happy" size={24} animate={false} />
          <span>Hiện Opti</span>
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (speechEnabled) {
        window.speechSynthesis.cancel();
        setSpeechEnabled(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'vi-VN';
        utterance.rate = 1.0;
        utterance.onend = () => setSpeechEnabled(false);
        utterance.onerror = () => setSpeechEnabled(false);
        window.speechSynthesis.speak(utterance);
        setSpeechEnabled(true);
      }
    }
  };

  return (
    <div
      className={`relative flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl border ${themeStyles.border} ${themeStyles.bg} shadow-md ${themeStyles.glow} backdrop-blur-sm transition-all duration-300 ${className}`}
    >
      {/* Opti mascot avatar / full */}
      <div className="shrink-0 flex flex-col items-center">
        <OptiMascot expression={expression} pose={pose} size={88} actionState={effectiveActionState} />
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-blue-700">Opti</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>
      </div>

      {/* Speech bubble */}
      <div className="flex-1 w-full min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase rounded-md ${themeStyles.badgeBg}`}
            >
              {badge}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Đồng hành cùng bạn
            </span>
          </div>

          <div className="flex items-center gap-1">
            {'speechSynthesis' in window && (
              <button
                type="button"
                onClick={handleSpeak}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
                title={speechEnabled ? 'Dừng đọc' : 'Đọc lời thoại'}
              >
                {speechEnabled ? (
                  <VolumeX className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {onToggleVisibility && (
              <button
                type="button"
                onClick={onToggleVisibility}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
                title="Thu gọn Opti"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Message Content */}
        <p className={`text-sm sm:text-base font-medium leading-relaxed ${themeStyles.textColor}`}>
          {message}
        </p>

        {/* Quick hint buttons if provided */}
        {quickHints && quickHints.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-blue-500" />
              Gợi ý nhanh:
            </span>
            {quickHints.map((hint, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectHint?.(hint)}
                className={`text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 transition-all font-medium`}
              >
                {hint}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
