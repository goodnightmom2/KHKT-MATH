import React, { useState, useMemo } from 'react';
import {
  AssessmentExercise,
  AssessmentTopicId,
  CognitiveLevel,
  ExerciseAttemptRecord,
  ExerciseInteractionType
} from '../../types/assessment';
import {
  ASSESSMENT_EXERCISE_BANK,
  INTERACTION_TYPE_LABELS,
  LEVEL_METADATA,
  TOPIC_METADATA
} from '../../data/assessmentBank';
import { CheckCircle2, Search, Play, AlertCircle, Filter } from 'lucide-react';

interface ExerciseBankViewProps {
  attempts: ExerciseAttemptRecord[];
  activeExerciseId: string;
  allExercises?: AssessmentExercise[];
  onSelectExercise: (exercise: AssessmentExercise) => void;
}

export const ExerciseBankView: React.FC<ExerciseBankViewProps> = ({
  attempts,
  activeExerciseId,
  allExercises = ASSESSMENT_EXERCISE_BANK,
  onSelectExercise
}) => {
  const [selectedTopic, setSelectedTopic] = useState<'ALL' | AssessmentTopicId>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | CognitiveLevel>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | ExerciseInteractionType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'completed' | 'unattempted' | 'has_error'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const statusByExercise = useMemo(() => {
    const map = new Map<
      string,
      { completed: boolean; bestScore: number; maxScore: number; hadErrors: boolean; tries: number }
    >();
    for (const att of attempts) {
      const prev = map.get(att.exerciseId);
      map.set(att.exerciseId, {
        completed: (prev?.completed ?? false) || att.isCompleted,
        bestScore: Math.max(prev?.bestScore ?? 0, att.scoreEarned),
        maxScore: att.maxScore,
        hadErrors: (prev?.hadErrors ?? false) || att.errorCodes.length > 0,
        tries: (prev?.tries ?? 0) + 1
      });
    }
    return map;
  }, [attempts]);

  const filteredExercises = useMemo(() => {
    return allExercises.filter(ex => {
      if (selectedTopic !== 'ALL' && ex.topic !== selectedTopic) return false;
      if (selectedLevel !== 'ALL' && ex.level !== selectedLevel) return false;
      if (selectedType !== 'ALL' && ex.interactionType !== selectedType) return false;

      const st = statusByExercise.get(ex.id);
      if (statusFilter === 'completed' && !st?.completed) return false;
      if (statusFilter === 'unattempted' && st?.completed) return false;
      if (statusFilter === 'has_error' && !st?.hadErrors) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          ex.id.toLowerCase().includes(q) ||
          ex.title.toLowerCase().includes(q) ||
          ex.questionText.toLowerCase().includes(q) ||
          ex.learningObjective.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [selectedTopic, selectedLevel, selectedType, statusFilter, searchQuery, statusByExercise]);

  return (
    <div className="space-y-5">
      {/* Filter Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Ngân hàng 40 Bài tập Chuẩn Hóa Toán 10
            </h2>
            <p className="text-xs text-slate-500">
              Tất cả 40 bài tập đều được kiểm chứng bằng Math Engine, phân tầng theo 4 chủ đề và 4 mức độ nhận thức
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm mã bài (VD: C07, D08)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Topic Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setSelectedTopic('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              selectedTopic === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả chủ đề (40)
          </button>
          {(['A', 'B', 'C', 'D'] as AssessmentTopicId[]).map(tId => (
            <button
              key={tId}
              type="button"
              onClick={() => setSelectedTopic(tId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                selectedTopic === tId
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {TOPIC_METADATA[tId].shortName} (10)
            </button>
          ))}
        </div>

        {/* Secondary Filters: Level, Interaction Type, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Mức độ nhận thức:
            </label>
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value as 'ALL' | CognitiveLevel)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="ALL">Tất cả 4 mức độ</option>
              <option value="nhan_biet">Mức 1: Nhận biết</option>
              <option value="thong_hieu">Mức 2: Thông hiểu</option>
              <option value="van_dung">Mức 3: Vận dụng</option>
              <option value="van_dung_cao">Mức 4: Vận dụng cao</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Kiểu bài tập tương tác:
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value as 'ALL' | ExerciseInteractionType)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="ALL">Tất cả 10 kiểu tương tác</option>
              {(Object.keys(INTERACTION_TYPE_LABELS) as ExerciseInteractionType[]).map(k => (
                <option key={k} value={k}>
                  {INTERACTION_TYPE_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Trạng thái luyện tập:
            </label>
            <select
              value={statusFilter}
              onChange={e =>
                setStatusFilter(
                  e.target.value as 'ALL' | 'completed' | 'unattempted' | 'has_error'
                )
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="ALL">Tất cả trạng thái ({ASSESSMENT_EXERCISE_BANK.length})</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="unattempted">Chưa thực hiện</option>
              <option value="has_error">Từng gặp lỗi cần ôn lại</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExercises.map(ex => {
          const st = statusByExercise.get(ex.id);
          const isCurrent = ex.id === activeExerciseId;

          return (
            <div
              key={ex.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col justify-between gap-4 transition ${
                isCurrent
                  ? 'border-indigo-600 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                {/* Unboxed metadata row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{ex.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{TOPIC_METADATA[ex.topic].shortName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-indigo-700">
                      {LEVEL_METADATA[ex.level].label}
                    </span>
                  </div>

                  {st?.completed ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold font-mono tabular-nums">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Đã giải ({st.bestScore}/{st.maxScore}đ)
                      </span>
                    </span>
                  ) : st?.hadErrors ? (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Đang luyện</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">Chưa làm</span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{ex.title}</h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {ex.questionText}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span>Kiểu: {INTERACTION_TYPE_LABELS[ex.interactionType]}</span>
                  <span aria-hidden="true">·</span>
                  <span>Số bước: {ex.steps.length} bước</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">
                    Mã lỗi kiểm tra: {ex.commonErrorCodes.join(', ')}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 truncate max-w-[65%]">
                  YCCĐ: {ex.learningObjective}
                </span>

                <button
                  type="button"
                  onClick={() => onSelectExercise(ex)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{st?.completed ? 'Làm lại' : 'Luyện tập'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
