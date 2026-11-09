import React, { useState, useEffect, useMemo } from 'react';
import {
  AssessmentExercise,
  ErrorCodeId,
  ExerciseAttemptRecord,
  TeacherAssignment
} from '../../types/assessment';
import { LearningMode } from '../../types/math';
import { ASSESSMENT_EXERCISE_BANK } from '../../data/assessmentBank';
import {
  loadAllAttempts,
  loadAllAssignments,
  saveAttemptRecord,
  saveTeacherAssignment,
  deleteTeacherAssignment,
  clearAllAttempts,
  loadCustomExercises,
  saveCustomExercise,
  deleteCustomExercise
} from '../../services/assessmentStorage';
import { InteractiveExercisePlayer } from './InteractiveExercisePlayer';
import { ExerciseBankView } from './ExerciseBankView';
import { ErrorAnalysisView } from './ErrorAnalysisView';
import { PersonalizedPathView } from './PersonalizedPathView';
import { TeacherDashboardView } from './TeacherDashboardView';
import {
  ArrowLeft,
  BookOpen,
  Play,
  AlertTriangle,
  Compass,
  Presentation,
  Lock,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';

export type Module5Tab =
  | 'interactive'
  | 'bank'
  | 'error_analysis'
  | 'personalized'
  | 'teacher';

interface PracticeLabProps {
  initialLearningMode?: LearningMode;
  isTeacherUnlocked?: boolean;
  onRequestTeacherAuth?: (onUnlocked: () => void) => void;
  onBackToHome: () => void;
}

export const PracticeLab: React.FC<PracticeLabProps> = ({
  initialLearningMode = 'guided',
  isTeacherUnlocked = false,
  onRequestTeacherAuth,
  onBackToHome
}) => {
  const [learningMode, setLearningMode] = useState<LearningMode>(
    initialLearningMode === 'teacher' && isTeacherUnlocked ? 'teacher' : 'guided'
  );
  const [activeTab, setActiveTab] = useState<Module5Tab>(
    initialLearningMode === 'teacher' && isTeacherUnlocked ? 'teacher' : 'interactive'
  );
  const [customExercises, setCustomExercises] = useState<AssessmentExercise[]>(() =>
    loadCustomExercises()
  );

  const allExercises = useMemo(
    () => [...customExercises, ...ASSESSMENT_EXERCISE_BANK],
    [customExercises]
  );

  const [activeExercise, setActiveExercise] = useState<AssessmentExercise>(
    ASSESSMENT_EXERCISE_BANK[0]
  );
  const [focusedErrorCode, setFocusedErrorCode] = useState<ErrorCodeId | null>(null);
  const [attempts, setAttempts] = useState<ExerciseAttemptRecord[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadAllAttempts(), loadAllAssignments()]).then(
      ([loadedAttempts, loadedAssignments]) => {
        if (!mounted) return;
        setAttempts(loadedAttempts);
        setAssignments(loadedAssignments);
        setIsLoading(false);
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  // Automatically lock Teacher tab / Teacher mode if teacher locks from Header
  useEffect(() => {
    if (!isTeacherUnlocked) {
      if (learningMode === 'teacher') setLearningMode('guided');
      if (activeTab === 'teacher') setActiveTab('interactive');
    }
  }, [isTeacherUnlocked, learningMode, activeTab]);

  const handleSwitchMode = (mode: LearningMode) => {
    if (mode === 'teacher' && !isTeacherUnlocked) {
      if (onRequestTeacherAuth) {
        onRequestTeacherAuth(() => {
          setLearningMode('teacher');
        });
      }
      return;
    }
    setLearningMode(mode);
  };

  const handleSelectTab = (tab: Module5Tab) => {
    if (tab === 'teacher' && !isTeacherUnlocked) {
      if (onRequestTeacherAuth) {
        onRequestTeacherAuth(() => {
          setLearningMode('teacher');
          setActiveTab('teacher');
        });
      }
      return;
    }
    if (tab === 'teacher') {
      setLearningMode('teacher');
    }
    setActiveTab(tab);
  };

  const handleCompleteExercise = async (record: ExerciseAttemptRecord) => {
    const updated = await saveAttemptRecord(record);
    setAttempts(updated);
  };

  const handleSelectExercise = (ex: AssessmentExercise) => {
    setActiveExercise(ex);
    setActiveTab('interactive');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenErrorAnalysis = (code: ErrorCodeId) => {
    setFocusedErrorCode(code);
    setActiveTab('error_analysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAssignment = async (assign: TeacherAssignment) => {
    const updated = await saveTeacherAssignment(assign);
    setAssignments(updated);
  };

  const handleDeleteAssignment = async (id: string) => {
    const updated = await deleteTeacherAssignment(id);
    setAssignments(updated);
  };

  const handleCreateCustomExercise = (ex: AssessmentExercise) => {
    const updated = saveCustomExercise(ex);
    setCustomExercises(updated);
  };

  const handleDeleteCustomExercise = (id: string) => {
    const updated = deleteCustomExercise(id);
    setCustomExercises(updated);
  };

  const handleClearAttempts = async () => {
    await clearAllAttempts();
    setAttempts([]);
  };

  const handleImportData = (
    importedAttempts: ExerciseAttemptRecord[],
    importedAssignments: TeacherAssignment[]
  ) => {
    setAttempts(importedAttempts);
    setAssignments(importedAssignments);
  };

  const completedIdsSet = useMemo(
    () => new Set(attempts.filter(a => a.isCompleted).map(a => a.exerciseId)),
    [attempts]
  );

  const completedUniqueCount = completedIdsSet.size;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Module 5 Workspace Sub-Header & 5-Area Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBackToHome}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer shrink-0"
                title="Quay lại Trang chủ"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="font-bold text-indigo-700">Module 05</span>
                  <span aria-hidden="true">·</span>
                  <span>Luyện tập, Đánh giá theo bước & Giao đề</span>
                </div>
                <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Trung tâm Luyện tập & Đánh giá Năng lực Toán 10
                </h1>
              </div>
            </div>

            {/* Right: Student / Teacher Role Switcher & Progress */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('guided')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    learningMode !== 'teacher'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Chế độ Học sinh</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('teacher')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    learningMode === 'teacher'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={isTeacherUnlocked ? 'Chế độ Giáo viên (Đã mở khóa)' : 'Nhập mật khẩu để vào Chế độ Giáo viên'}
                >
                  {isTeacherUnlocked ? (
                    <Presentation className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>Chế độ Giáo viên</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <span>
                  Hoàn thành:{' '}
                  <strong className="text-indigo-700">
                    {completedUniqueCount}/{allExercises.length}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* 5 Area Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => handleSelectTab('interactive')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'interactive'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>1. Làm bài & Kiểm tra ({activeExercise.id})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('bank')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'bank'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>2. Ngân hàng Bài tập ({allExercises.length} bài)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('error_analysis')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'error_analysis'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>3. Phân tích Lỗi (E01 – E10)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('personalized')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'personalized'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>4. Phiếu bài giao & Lộ trình HS</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('teacher')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'teacher'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              {isTeacherUnlocked ? (
                <Presentation className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>5. Ra đề & Giao đề Giáo viên</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* Active Teacher Assignment Quick Strip in Interactive Tab */}
        {!isLoading && activeTab === 'interactive' && assignments.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 via-white to-blue-50 rounded-2xl border border-indigo-200 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-extrabold text-indigo-950">
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] uppercase">
                  Đề Giáo viên giao
                </span>
                <span className="truncate">{assignments[0].title}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                {assignments[0].description}
              </p>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {assignments[0].exerciseIds.map(exId => {
                const ex = allExercises.find(e => e.id === exId);
                if (!ex) return null;
                const isDone = completedIdsSet.has(exId);
                const isCurrent = activeExercise.id === exId;
                return (
                  <button
                    key={exId}
                    type="button"
                    onClick={() => handleSelectExercise(ex)}
                    className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition cursor-pointer flex items-center gap-1 shrink-0 border ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <span>{exId}</span>
                    {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
            Đang tải dữ liệu học tập cục bộ từ IndexedDB...
          </div>
        ) : activeTab === 'interactive' ? (
          <InteractiveExercisePlayer
            exercise={activeExercise}
            isTeacherMode={isTeacherUnlocked && learningMode === 'teacher'}
            allExercises={allExercises}
            onCompleteExercise={handleCompleteExercise}
            onSelectExercise={handleSelectExercise}
            onOpenErrorAnalysis={handleOpenErrorAnalysis}
          />
        ) : activeTab === 'bank' ? (
          <ExerciseBankView
            attempts={attempts}
            activeExerciseId={activeExercise.id}
            allExercises={allExercises}
            onSelectExercise={handleSelectExercise}
          />
        ) : activeTab === 'error_analysis' ? (
          <ErrorAnalysisView
            attempts={attempts}
            initialFocusedErrorCode={focusedErrorCode}
            onSelectExercise={handleSelectExercise}
          />
        ) : activeTab === 'personalized' ? (
          <PersonalizedPathView
            attempts={attempts}
            assignments={assignments}
            allExercises={allExercises}
            onSelectExercise={handleSelectExercise}
            onOpenErrorAnalysis={handleOpenErrorAnalysis}
          />
        ) : (
          <TeacherDashboardView
            attempts={attempts}
            assignments={assignments}
            customExercises={customExercises}
            onSaveAssignment={handleSaveAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onCreateCustomExercise={handleCreateCustomExercise}
            onDeleteCustomExercise={handleDeleteCustomExercise}
            onImportData={handleImportData}
            onClearAttempts={handleClearAttempts}
            onSelectExercise={handleSelectExercise}
          />
        )}
      </div>
    </div>
  );
};
