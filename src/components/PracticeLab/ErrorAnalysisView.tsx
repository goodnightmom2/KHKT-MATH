import React, { useState } from 'react';
import {
  AssessmentExercise,
  ErrorCodeId,
  ExerciseAttemptRecord
} from '../../types/assessment';
import {
  ASSESSMENT_EXERCISE_BANK,
  ERROR_CODE_CATALOG,
  TOPIC_METADATA
} from '../../data/assessmentBank';
import { computeStudentAnalytics } from '../../math/assessmentEngine';
import { OptiMascot } from '../../mascot/OptiMascot';
import { AlertTriangle, CheckCircle2, HelpCircle, Play, BookOpen } from 'lucide-react';

interface ErrorAnalysisViewProps {
  attempts: ExerciseAttemptRecord[];
  initialFocusedErrorCode?: ErrorCodeId | null;
  onSelectExercise: (exercise: AssessmentExercise) => void;
}

export const ErrorAnalysisView: React.FC<ErrorAnalysisViewProps> = ({
  attempts,
  initialFocusedErrorCode,
  onSelectExercise
}) => {
  const analytics = computeStudentAnalytics(attempts);
  const [selectedCode, setSelectedCode] = useState<ErrorCodeId>(
    initialFocusedErrorCode || analytics.errorFrequency[0]?.code || 'E01'
  );

  const activeErrorDef = ERROR_CODE_CATALOG[selectedCode];
  const activeCount =
    analytics.errorFrequency.find(e => e.code === selectedCode)?.count || 0;

  const remedialExercises = activeErrorDef.remedialExerciseIds
    .map(id => ASSESSMENT_EXERCISE_BANK.find(e => e.id === id))
    .filter((e): e is AssessmentExercise => !!e);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Hệ thống Chẩn đoán & Phân tích 10 Mã Lỗi Điển Hình (E01 – E10)
          </h2>
          <p className="text-xs text-slate-600">
            Mỗi mã lỗi đều đi kèm phân tích nguyên nhân gốc rễ, câu hỏi gợi mở Socratic của Opti và bài tập khắc phục trực tiếp
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-700 shrink-0">
          <span>
            Tổng lượt lỗi ghi nhận:{' '}
            <strong className="text-amber-700">
              {analytics.errorFrequency.reduce((s, e) => s + e.count, 0)}
            </strong>
          </span>
        </div>
      </div>

      {/* Main Split Grid: Left 10 Error Codes List + Right Deep Diagnostic Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left List of E01 - E10 (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 space-y-2">
          <div className="px-2 py-1 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Danh mục mã lỗi (E01 – E10)</span>
            <span>Số lần gặp</span>
          </div>

          {(Object.keys(ERROR_CODE_CATALOG) as ErrorCodeId[]).map(code => {
            const def = ERROR_CODE_CATALOG[code];
            const count =
              analytics.errorFrequency.find(e => e.code === code)?.count || 0;
            const isSelected = selectedCode === code;

            return (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedCode(code)}
                className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-indigo-700">{code}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold truncate">{def.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {TOPIC_METADATA[def.topic].shortName}
                  </p>
                </div>

                <span
                  className={`font-mono text-xs font-bold tabular-nums shrink-0 ${
                    count > 0 ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {count > 0 ? `${count} lần` : '0 lỗi'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Detailed Error Anatomy & Remedial Exercises (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="font-mono font-bold text-indigo-700">
                  Mã lỗi {activeErrorDef.code}
                </span>
                <span aria-hidden="true">·</span>
                <span>{TOPIC_METADATA[activeErrorDef.topic].name}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {activeErrorDef.code}: {activeErrorDef.title}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {activeCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-amber-800 font-mono tabular-nums">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Em đã gặp lỗi này {activeCount} lần</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Chưa mắc lỗi này</span>
                </span>
              )}
            </div>
          </div>

          {/* 1. Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">
              1. Bản chất Toán học của lỗi
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {activeErrorDef.description}
            </p>
          </div>

          {/* 2. Common Causes */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900">
              2. Nguyên nhân thường gặp ở học sinh lớp 10
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-5">
              {activeErrorDef.commonCauses.map((cause, i) => (
                <li key={i} className="leading-relaxed">
                  {cause}
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Socratic Question from Opti */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <OptiMascot expression="thinking" size={40} animate={false} />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Câu hỏi gợi mở Socratic từ Opti:</span>
              </span>
              <p className="text-slate-800 font-medium leading-relaxed">
                “{activeErrorDef.socraticQuestion}”
              </p>
              <p className="text-slate-600 pt-1">
                <strong>Quy tắc khắc phục:</strong> {activeErrorDef.remediationAdvice}
              </p>
            </div>
          </div>

          {/* 4. Linked Remedial Exercises */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Bài tập khắc phục trực tiếp lỗi {activeErrorDef.code}</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Chọn 1 bài để rèn luyện ngay
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {remedialExercises.map(ex => {
                const isDone = analytics.completedExerciseIds.includes(ex.id);
                return (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between gap-2.5 bg-white hover:border-indigo-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-mono font-bold text-slate-900">{ex.id}</span>
                        {isDone && (
                          <span className="text-emerald-700 font-semibold">Đã hoàn thành</span>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 mt-1">
                        {ex.title}
                      </h5>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectExercise(ex)}
                      className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Luyện bài khắc phục {ex.id}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
