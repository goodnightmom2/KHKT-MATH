import React, { useMemo } from 'react';
import {
  AssessmentExercise,
  AssessmentTopicId,
  ErrorCodeId,
  ExerciseAttemptRecord,
  TeacherAssignment
} from '../../types/assessment';
import {
  ASSESSMENT_EXERCISE_BANK,
  ERROR_CODE_CATALOG,
  LEVEL_METADATA,
  TOPIC_METADATA
} from '../../data/assessmentBank';
import {
  computeStudentAnalytics,
  generatePersonalizedRecommendations
} from '../../math/assessmentEngine';
import { OptiMascot } from '../../mascot/OptiMascot';
import {
  Award,
  CheckCircle2,
  Compass,
  Play,
  Target,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Clock
} from 'lucide-react';

interface PersonalizedPathViewProps {
  attempts: ExerciseAttemptRecord[];
  assignments: TeacherAssignment[];
  allExercises?: AssessmentExercise[];
  onSelectExercise: (exercise: AssessmentExercise) => void;
  onOpenErrorAnalysis: (code: ErrorCodeId) => void;
}

export const PersonalizedPathView: React.FC<PersonalizedPathViewProps> = ({
  attempts,
  assignments,
  allExercises = ASSESSMENT_EXERCISE_BANK,
  onSelectExercise,
  onOpenErrorAnalysis
}) => {
  const analytics = useMemo(() => computeStudentAnalytics(attempts), [attempts]);
  const recommendations = useMemo(
    () => generatePersonalizedRecommendations(attempts, 6),
    [attempts]
  );

  const personalErrors = analytics.errorFrequency.filter(e => e.count > 0);

  return (
    <div className="space-y-6">
      {/* Row 1: Student Overview KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500 block">
            Số bài tập đã hoàn thành
          </span>
          <div className="mt-2 flex items-baseline gap-2 font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {analytics.totalCompletedCount}
            </span>
            <span className="text-xs text-slate-500">
              / {analytics.totalBankCount} bài chuẩn hóa
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Tổng số lượt thực hành: {analytics.totalAttemptsCount} lượt
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500 block">
            Tỷ lệ giải đúng ngay lần đầu
          </span>
          <div className="mt-2 flex items-baseline gap-2 font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              {analytics.firstTryAccuracyPercent}%
            </span>
            <span className="text-xs text-slate-500">độc lập</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Điểm đánh giá trung bình: {analytics.averageScorePercent}%
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500 block">
            Mã lỗi cần lưu ý khắc phục
          </span>
          <div className="mt-2 flex items-baseline gap-2 font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-700">
              {personalErrors.length}
            </span>
            <span className="text-xs text-slate-500">/ 10 nhóm lỗi</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            {personalErrors.length > 0
              ? `Hay gặp nhất: ${personalErrors[0].code} (${ERROR_CODE_CATALOG[personalErrors[0].code].title})`
              : 'Chưa phát sinh lỗi lặp lại'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500 block">
            Huy hiệu năng lực đã đạt
          </span>
          <div className="mt-2 flex items-baseline gap-2 font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700">
              {analytics.badges.filter(b => b.unlockedAt !== null).length}
            </span>
            <span className="text-xs text-slate-500">
              / {analytics.badges.length} huy hiệu
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Ghi nhận nỗ lực cá nhân · Không xếp hạng áp lực
          </p>
        </div>
      </div>

      {/* Row 2: Personalized Learning Path (Explainable Rule Engine) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <OptiMascot expression="happy" size={42} animate={false} />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Lộ trình Luyện tập Cá nhân hóa (Đề xuất từ Opti)
              </h2>
              <p className="text-xs text-slate-500">
                Hệ thống tự động suy diễn bài tập tiếp theo dựa trên độ thành thạo 4 chủ đề, mã lỗi lặp lại và mức độ sử dụng gợi ý
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map(rec => (
            <div
              key={rec.exercise.id}
              className="rounded-xl border border-slate-200 p-4 flex flex-col justify-between gap-3 hover:border-indigo-300 transition bg-white"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono font-bold text-indigo-700">
                    Bài {rec.exercise.id} · {LEVEL_METADATA[rec.exercise.level].label}
                  </span>
                  <span>{TOPIC_METADATA[rec.exercise.topic].shortName}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  {rec.exercise.title}
                </h3>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                  <span className="font-bold text-slate-800 block">
                    {rec.reasonTitle}
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {rec.reasonExplanation}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {rec.relatedErrorCode ? (
                  <button
                    type="button"
                    onClick={() =>
                      rec.relatedErrorCode && onOpenErrorAnalysis(rec.relatedErrorCode)
                    }
                    className="text-[11px] font-mono font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    Xem lỗi {rec.relatedErrorCode}
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    {rec.exercise.steps.length} bước tương tác
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onSelectExercise(rec.exercise)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Bắt đầu ngay</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Topic Mastery Progress + Frequent Errors & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Progress by Topic A, B, C, D + Teacher Assigned Sets (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Tiến bộ theo 4 Chủ đề Toán 10
            </h3>

            <div className="space-y-4">
              {(['A', 'B', 'C', 'D'] as AssessmentTopicId[]).map(tId => {
                const st = analytics.topicStats[tId];
                return (
                  <div key={tId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{st.name}</span>
                      <div className="flex items-center gap-2 font-mono tabular-nums text-slate-600">
                        <span>
                          Đã làm: <strong>{st.completedCount}</strong>/{st.totalCount}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Thành thạo: <strong className="text-indigo-700">{st.masteryPercent}%</strong>
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{ width: `${Math.max(4, st.masteryPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Homework Sets */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Phiếu bài tập Giáo viên giao
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {assignments.length} phiếu
              </span>
            </div>

            <div className="space-y-3">
              {assignments.map(assign => {
                const doneCount = assign.exerciseIds.filter(id =>
                  analytics.completedExerciseIds.includes(id)
                ).length;

                return (
                  <div
                    key={assign.id}
                    className="p-4 rounded-xl border border-slate-200 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {assign.title}
                      </h4>
                      <span className="text-xs font-mono font-bold text-indigo-700 tabular-nums">
                        Hoàn thành: {doneCount}/{assign.exerciseIds.length} bài
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{assign.description}</p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {assign.exerciseIds.map(exId => {
                        const ex = allExercises.find(e => e.id === exId);
                        if (!ex) return null;
                        const isDone = analytics.completedExerciseIds.includes(exId);
                        return (
                          <button
                            key={exId}
                            type="button"
                            onClick={() => onSelectExercise(ex)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700'
                            }`}
                          >
                            {exId} {isDone ? '✓' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Learning Badges & Recent Attempts (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Badges Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Huy hiệu Học tập Cá nhân
              </h3>
              <p className="text-xs text-slate-500">
                Đánh dấu các cột mốc tự chinh phục kiến thức Toán 10 của riêng em
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analytics.badges.map(badge => {
                const unlocked = badge.unlockedAt !== null;
                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-xl border space-y-1.5 ${
                      unlocked
                        ? 'border-indigo-200 bg-indigo-50/40'
                        : 'border-slate-200 bg-slate-50/60 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          unlocked ? 'text-indigo-900' : 'text-slate-700'
                        }`}
                      >
                        {badge.title}
                      </span>
                      <Award
                        className={`w-4 h-4 shrink-0 ${
                          unlocked ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {badge.description}
                    </p>
                    <span className="block text-[10px] font-mono font-bold text-slate-500 pt-1">
                      {unlocked ? 'Đã mở khóa ✓' : `Tiến độ: ${badge.progressText}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Attempt Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Lịch sử Luyện tập Gần đây
            </h3>

            {attempts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">
                Em chưa có lượt làm bài nào được lưu. Hãy chọn một bài tập từ lộ trình đề xuất để bắt đầu!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {attempts.slice(0, 8).map(att => {
                  const ex = ASSESSMENT_EXERCISE_BANK.find(
                    e => e.id === att.exerciseId
                  );
                  return (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">
                            {att.exerciseId}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate text-slate-700 font-medium">
                            {ex?.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                          <span>
                            Điểm: {att.scoreEarned}/{att.maxScore}
                          </span>
                          <span aria-hidden="true"> · </span>
                          <span>{att.durationSeconds}s</span>
                          {att.errorCodes.length > 0 && (
                            <>
                              <span aria-hidden="true"> · </span>
                              <span className="text-amber-700 font-bold">
                                Lỗi: {att.errorCodes.join(', ')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {ex && (
                        <button
                          type="button"
                          onClick={() => onSelectExercise(ex)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shrink-0"
                        >
                          Xem
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
