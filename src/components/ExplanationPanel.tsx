import React from 'react';
import { EvaluationResult, Inequality, Point2D } from '../types/math';
import { formatBoundaryLine, formatInequality } from '../math/mathEngine';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, BookOpen, Sparkles, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExplanationPanelProps {
  result: EvaluationResult;
  inequality: Inequality;
  pointM: Point2D;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  result,
  inequality,
  pointM
}) => {
  const { satisfies, relation, steps, lhsValue } = result;

  const handleCelebrate = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-slate-800">
      {/* Result Status Banner */}
      <div
        className={`p-4 rounded-xl border transition-all duration-300 flex items-start justify-between gap-3 ${
          satisfies
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-emerald-50'
            : 'bg-rose-50/90 border-rose-200 text-rose-950 shadow-rose-50'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold shadow-xs ${
              satisfies ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            {satisfies ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base">
                {satisfies
                  ? relation === 'on_boundary'
                    ? 'Điểm M nằm trên đường biên (Thỏa mãn)'
                    : 'Điểm M thuộc miền nghiệm'
                  : relation === 'on_boundary'
                  ? 'Điểm M nằm trên đường biên nét đứt (Không thỏa mãn vì dấu nghiêm ngặt)'
                  : 'Điểm M KHÔNG thuộc miền nghiệm'}
              </h4>
              {satisfies && (
                <button
                  type="button"
                  onClick={handleCelebrate}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-200 text-emerald-800 hover:bg-emerald-300 transition cursor-pointer flex items-center gap-1"
                  title="Ăn mừng kết quả đúng!"
                >
                  <Sparkles className="w-3 h-3" />
                  Tuyệt vời!
                </button>
              )}
            </div>
            <p className="text-xs mt-0.5 text-slate-600">
              Tại M({pointM.x}; {pointM.y}), biểu thức có giá trị{' '}
              <strong className="font-mono text-slate-900">{lhsValue}</strong> so với vế phải{' '}
              <strong className="font-mono text-slate-900">{inequality.c}</strong>.
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
            satisfies
              ? 'bg-white border-emerald-300 text-emerald-700'
              : 'bg-white border-rose-300 text-rose-700'
          }`}
        >
          {satisfies ? 'ĐÚNG' : 'SAI'}
        </span>
      </div>

      {/* Step by step substitution */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Các bước giải thích chi tiết
          </h4>
          <span className="text-xs text-slate-500">Chuẩn tư duy Toán 10</span>
        </div>

        <div className="space-y-2.5">
          {steps.map(step => (
            <div
              key={step.stepNumber}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold">
                    {step.stepNumber}
                  </span>
                  {step.title}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {step.result}
                </span>
              </div>

              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200/60 font-mono text-xs text-blue-900 mb-1.5 overflow-x-auto">
                {step.expression}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{step.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Geometric insight & Half-plane rules */}
      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
        <h5 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-blue-600" />
          Quy tắc xác định miền nghiệm hình học:
        </h5>
        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
          <li>
            Đường thẳng bờ (d): <strong>{formatBoundaryLine(inequality.a, inequality.b, inequality.c)}</strong> chia mặt phẳng tọa độ thành hai nửa mặt phẳng đối xứng nhau qua bờ.
          </li>
          <li>
            Mọi điểm thuộc cùng một nửa mặt phẳng sẽ cho cùng dấu khi thay vào đa thức ax + by - c.
          </li>
          <li>
            Vì M({pointM.x}; {pointM.y}) {satisfies ? 'thỏa mãn' : 'không thỏa mãn'}, nên nửa mặt phẳng {satisfies ? 'chứa điểm M' : 'không chứa điểm M'} chính là miền nghiệm!
          </li>
        </ul>
      </div>
    </div>
  );
};
