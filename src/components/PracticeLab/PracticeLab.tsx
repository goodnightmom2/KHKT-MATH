import React, { useState, useEffect } from 'react';
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
  clearAllAttempts
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
  Presentation
} from 'lucide-react';

export type Module5Tab =
  | 'interactive'
  | 'bank'
  | 'error_analysis'
  | 'personalized'
  | 'teacher';

interface PracticeLabProps {
  initialLearningMode?: LearningMode;
  onBackToHome: () => void;
}

export const PracticeLab: React.FC<PracticeLabProps> = ({
  initialLearningMode = 'guided',
  onBackToHome
}) => {
  const [activeTab, setActiveTab] = useState<Module5Tab>(
    initialLearningMode === 'teacher' ? 'teacher' : 'interactive'
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

  const completedUniqueCount = new Set(
    attempts.filter(a => a.isCompleted).map(a => a.exerciseId)
  ).size;

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
                  <span>Luyện tập, Đánh giá theo bước & Cá nhân hóa</span>
                </div>
                <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Trung tâm Luyện tập & Đánh giá Năng lực Toán 10
                </h1>
              </div>
            </div>

            {/* Quick Progress Summary */}
            <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-600 self-start md:self-auto">
              <span>
                Đã hoàn thành:{' '}
                <strong className="text-indigo-700">
                  {completedUniqueCount}/{ASSESSMENT_EXERCISE_BANK.length}
                </strong>{' '}
                bài
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Lượt chấm: <strong>{attempts.length}</strong>
              </span>
            </div>
          </div>

          {/* 5 Area Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('interactive')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'interactive'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>1. Luyện tập Tương tác ({activeExercise.id})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'bank'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>2. Ngân hàng Bài tập (40 bài)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('error_analysis')}
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
              onClick={() => setActiveTab('personalized')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'personalized'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>4. Lộ trình Cá nhân & Học sinh</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('teacher')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>5. Dashboard Giáo viên</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
            Đang tải dữ liệu học tập cục bộ từ IndexedDB...
          </div>
        ) : activeTab === 'interactive' ? (
          <InteractiveExercisePlayer
            exercise={activeExercise}
            onCompleteExercise={handleCompleteExercise}
            onSelectExercise={handleSelectExercise}
            onOpenErrorAnalysis={handleOpenErrorAnalysis}
          />
        ) : activeTab === 'bank' ? (
          <ExerciseBankView
            attempts={attempts}
            activeExerciseId={activeExercise.id}
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
            onSelectExercise={handleSelectExercise}
            onOpenErrorAnalysis={handleOpenErrorAnalysis}
          />
        ) : (
          <TeacherDashboardView
            attempts={attempts}
            assignments={assignments}
            onSaveAssignment={handleSaveAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onImportData={handleImportData}
            onClearAttempts={handleClearAttempts}
            onSelectExercise={handleSelectExercise}
          />
        )}
      </div>
    </div>
  );
};
