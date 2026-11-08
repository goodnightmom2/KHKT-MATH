import React, { useState, useEffect, useMemo } from 'react';
import {
  AssessmentExercise,
  ErrorCodeId,
  ExerciseAttemptRecord,
  StepAttemptRecord
} from '../../types/assessment';
import { Point2D } from '../../types/math';
import {
  ERROR_CODE_CATALOG,
  INTERACTION_TYPE_LABELS,
  LEVEL_METADATA,
  TOPIC_METADATA,
  ASSESSMENT_EXERCISE_BANK
} from '../../data/assessmentBank';
import { verifyExerciseStep, StepVerificationResult } from '../../math/assessmentEngine';
import { analyzeSystemFeasibleRegion, formatPointCoord } from '../../math/systemMathEngine';
import { solveLinearProgramming, REAL_WORLD_SCENARIOS } from '../../math/optimizationMathEngine';
import { GraphCanvas } from '../../graph/GraphCanvas';
import { SystemGraphCanvas } from '../../graph/SystemGraphCanvas';
import { OptimizationGraphCanvas } from '../../graph/OptimizationGraphCanvas';
import { OptiMascot } from '../../mascot/OptiMascot';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface InteractiveExercisePlayerProps {
  exercise: AssessmentExercise;
  onCompleteExercise: (record: ExerciseAttemptRecord) => void;
  onSelectExercise: (ex: AssessmentExercise) => void;
  onOpenErrorAnalysis: (code: ErrorCodeId) => void;
}

export const InteractiveExercisePlayer: React.FC<InteractiveExercisePlayerProps> = ({
  exercise,
  onCompleteExercise,
  onSelectExercise,
  onOpenErrorAnalysis
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepRecords, setStepRecords] = useState<StepAttemptRecord[]>([]);
  const [stepAttemptsCount, setStepAttemptsCount] = useState<Record<number, number>>({});
  const [unlockedHintTier, setUnlockedHintTier] = useState<0 | 1 | 2 | 3>(0);
  const [accumulatedErrors, setAccumulatedErrors] = useState<ErrorCodeId[]>([]);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isExerciseFinished, setIsExerciseFinished] = useState<boolean>(false);

  // Step Input States
  const [choiceValue, setChoiceValue] = useState<string>('');
  const [numberText, setNumberText] = useState<string>('');
  const [coordXText, setCoordXText] = useState<string>('');
  const [coordYText, setCoordYText] = useState<string>('');

  // Interactive Canvas States
  const [canvasPointM, setCanvasPointM] = useState<Point2D>(
    exercise.mathData.testPoint || { x: 1, y: 1 }
  );
  const [canvasPointA, setCanvasPointA] = useState<Point2D>({ x: 0, y: 1 });
  const [canvasPointB, setCanvasPointB] = useState<Point2D>({ x: 1, y: 0 });
  const [activeABTarget, setActiveABTarget] = useState<'A' | 'B'>('A');
  const [canvasHalfPlaneSide, setCanvasHalfPlaneSide] = useState<
    'with_test' | 'without_test' | null
  >(null);
  const [optKValue, setOptKValue] = useState<number>(120);

  // Verification Feedback State
  const [lastFeedback, setLastFeedback] = useState<StepVerificationResult | null>(null);

  // Reset state whenever exercise changes
  useEffect(() => {
    setCurrentStepIdx(0);
    setCompletedSteps(new Set());
    setStepRecords([]);
    setStepAttemptsCount({});
    setUnlockedHintTier(0);
    setAccumulatedErrors([]);
    setStartedAt(Date.now());
    setElapsedSeconds(0);
    setIsExerciseFinished(false);
    setChoiceValue('');
    setNumberText('');
    setCoordXText('');
    setCoordYText('');
    setCanvasPointM(exercise.mathData.testPoint || { x: 1, y: 1 });
    setCanvasPointA({ x: 0, y: 1 });
    setCanvasPointB({ x: 1, y: 0 });
    setCanvasHalfPlaneSide(null);
    setLastFeedback(null);
  }, [exercise.id]);

  // Live timer while exercise is in progress
  useEffect(() => {
    if (isExerciseFinished) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, isExerciseFinished]);

  const activeStep = exercise.steps[currentStepIdx] || exercise.steps[0];

  // Clear step-specific inputs when advancing step
  const goToStep = (nextIdx: number) => {
    setCurrentStepIdx(nextIdx);
    setChoiceValue('');
    setNumberText('');
    setCoordXText('');
    setCoordYText('');
    setLastFeedback(null);
  };

  // Precompute system analysis or LP result for Topic C & D graphs
  const systemAnalysis = useMemo(() => {
    if (exercise.mathData.system) {
      return analyzeSystemFeasibleRegion(exercise.mathData.system);
    }
    if (exercise.mathData.scenario) {
      return analyzeSystemFeasibleRegion(exercise.mathData.scenario.system);
    }
    return null;
  }, [exercise]);

  const lpScenario = useMemo(() => {
    if (exercise.mathData.scenario) return exercise.mathData.scenario;
    if (exercise.mathData.system && exercise.mathData.objective) {
      return {
        ...REAL_WORLD_SCENARIOS[0],
        id: `custom_${exercise.id}`,
        title: exercise.title,
        system: exercise.mathData.system,
        objective: exercise.mathData.objective,
        integerRequired: false
      };
    }
    return null;
  }, [exercise]);

  const lpResult = useMemo(() => {
    if (!lpScenario) return null;
    return solveLinearProgramming(lpScenario);
  }, [lpScenario]);

  const handleVerifyCurrentStep = () => {
    const stepNo = activeStep.stepIndex;
    const prevTries = stepAttemptsCount[stepNo] || 0;
    const nextTries = prevTries + 1;
    setStepAttemptsCount(prev => ({ ...prev, [stepNo]: nextTries }));

    const result = verifyExerciseStep(exercise, activeStep, {
      choiceValue,
      numberText,
      coordXText,
      coordYText,
      canvasPointM,
      canvasPointA,
      canvasPointB,
      canvasHalfPlaneSide
    });

    setLastFeedback(result);

    const newErrors = result.detectedErrorCodes.filter(
      c => !accumulatedErrors.includes(c)
    );
    const updatedAccumulatedErrors = [...accumulatedErrors, ...newErrors];
    if (newErrors.length > 0) {
      setAccumulatedErrors(updatedAccumulatedErrors);
    }

    const answerRaw =
      activeStep.inputType === 'choice'
        ? choiceValue
        : activeStep.inputType === 'number'
        ? numberText
        : activeStep.inputType === 'coordinate'
        ? `(${coordXText}; ${coordYText})`
        : activeStep.inputType === 'canvas_drag_point'
        ? formatPointCoord(canvasPointM)
        : activeStep.inputType === 'canvas_boundary'
        ? `A${formatPointCoord(canvasPointA)}, B${formatPointCoord(canvasPointB)}`
        : String(canvasHalfPlaneSide);

    const stepRecord: StepAttemptRecord = {
      stepIndex: stepNo,
      studentAnswerRaw: answerRaw,
      isCorrect: result.isCorrect,
      attemptsCount: nextTries,
      hintsUsed: unlockedHintTier,
      errorCodesTriggered: result.detectedErrorCodes,
      timestamp: Date.now()
    };

    const nextStepRecords = [
      ...stepRecords.filter(r => r.stepIndex !== stepNo),
      stepRecord
    ];
    setStepRecords(nextStepRecords);

    if (result.isCorrect) {
      const nextCompleted = new Set(completedSteps);
      nextCompleted.add(stepNo);
      setCompletedSteps(nextCompleted);

      // Check if all steps of the exercise are now completed
      if (nextCompleted.size >= exercise.steps.length && !isExerciseFinished) {
        setIsExerciseFinished(true);
        const totalTries = Object.values({
          ...stepAttemptsCount,
          [stepNo]: nextTries
        }).reduce((s, v) => s + v, 0);
        const isFirstTry = totalTries === exercise.steps.length && unlockedHintTier <= 1;

        // Calculate rubric score
        const maxScore = exercise.rubric.maxPoints;
        const penalty = Math.min(
          maxScore * 0.4,
          (totalTries - exercise.steps.length) * 1 + (unlockedHintTier === 3 ? 2 : 0)
        );
        const scoreEarned = Math.max(Math.round(maxScore - penalty), Math.ceil(maxScore * 0.6));

        const finalRecord: ExerciseAttemptRecord = {
          id: `att_${exercise.id}_${Date.now()}`,
          exerciseId: exercise.id,
          topic: exercise.topic,
          level: exercise.level,
          interactionType: exercise.interactionType,
          startedAt,
          completedAt: Date.now(),
          durationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
          isCompleted: true,
          isFirstTryCorrect: isFirstTry,
          totalAttempts: totalTries,
          maxHintTierUsed: unlockedHintTier,
          scoreEarned,
          maxScore,
          errorCodes: updatedAccumulatedErrors,
          stepRecords: nextStepRecords
        };

        onCompleteExercise(finalRecord);
      }
    }
  };

  // Find previous / next exercise in bank
  const currentBankIndex = ASSESSMENT_EXERCISE_BANK.findIndex(e => e.id === exercise.id);
  const prevExercise = currentBankIndex > 0 ? ASSESSMENT_EXERCISE_BANK[currentBankIndex - 1] : null;
  const nextExercise =
    currentBankIndex < ASSESSMENT_EXERCISE_BANK.length - 1
      ? ASSESSMENT_EXERCISE_BANK[currentBankIndex + 1]
      : null;

  // Suggest remedial exercise if errors occurred
  const suggestedRemedialExercise = useMemo(() => {
    if (accumulatedErrors.length === 0) return null;
    const firstErr = ERROR_CODE_CATALOG[accumulatedErrors[0]];
    const remId = firstErr.remedialExerciseIds.find(id => id !== exercise.id);
    return remId ? ASSESSMENT_EXERCISE_BANK.find(e => e.id === remId) || null : null;
  }, [accumulatedErrors, exercise.id]);

  return (
    <div className="space-y-5">
      {/* Top Exercise Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-mono font-bold text-slate-900">Mã bài: {exercise.id}</span>
            <span aria-hidden="true">·</span>
            <span>{TOPIC_METADATA[exercise.topic].shortName}</span>
            <span aria-hidden="true">·</span>
            <span className="text-indigo-700 font-semibold">
              {LEVEL_METADATA[exercise.level].label}
            </span>
            <span aria-hidden="true">·</span>
            <span>{INTERACTION_TYPE_LABELS[exercise.interactionType]}</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900">{exercise.title}</h2>

          <p className="text-xs text-slate-600">
            <strong className="text-slate-800">Yêu cầu cần đạt:</strong> {exercise.learningObjective}
          </p>
        </div>

        {/* Timer, Rubric & Prev/Next Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono tabular-nums text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{elapsedSeconds}s</span>
            <span aria-hidden="true">·</span>
            <span>Điểm tối đa: {exercise.rubric.maxPoints}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!prevExercise}
              onClick={() => prevExercise && onSelectExercise(prevExercise)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Bài trước</span>
            </button>
            <button
              type="button"
              disabled={!nextExercise}
              onClick={() => nextExercise && onSelectExercise(nextExercise)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>Bài tiếp</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-First Problem Statement & Step Progress Card (Shown at top on phones < 1024px) */}
      <div className="lg:hidden bg-white rounded-2xl border border-indigo-200/80 p-3.5 sm:p-4 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-indigo-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            Đề bài Toán học
          </span>
          <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-bold font-mono tabular-nums">
            Bước {currentStepIdx + 1}/{exercise.steps.length}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
          {exercise.questionText}
        </p>

        {/* Step Progress Tabs on Mobile */}
        <div className="pt-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {exercise.steps.map((st, idx) => {
            const isDone = completedSteps.has(st.stepIndex);
            const isCurrent = idx === currentStepIdx;
            const crit = exercise.rubric.criteria.find(c => c.stepIndex === st.stepIndex);
            return (
              <button
                key={st.stepIndex}
                type="button"
                onClick={() => goToStep(idx)}
                className={`flex-1 min-w-[84px] py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between gap-1 cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span className="whitespace-nowrap">Bước {st.stepIndex}</span>
                <span className="font-mono text-[10px] opacity-90">
                  {isDone ? '✓' : `${crit?.points || 5}đ`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Zone Split Layout: Left Interactive Graph + Right Step-by-Step Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* LEFT COLUMN (7 cols): Interactive Graph Engine Stage */}
        <div
          className={`lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-3 sm:p-5 space-y-3 sm:space-y-4 ${
            activeStep.inputType === 'canvas_boundary' ||
            activeStep.inputType === 'canvas_drag_point' ||
            activeStep.inputType === 'canvas_half_plane'
              ? 'order-1 lg:order-1'
              : 'order-2 lg:order-1'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Mặt phẳng tọa độ & Mô phỏng Toán học
              </h3>
              <p className="text-xs text-slate-500">
                Tương tác trực tiếp với đồ thị để quan sát đường biên, điểm thử và miền nghiệm
              </p>
            </div>

            {activeStep.inputType === 'canvas_boundary' && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveABTarget('A')}
                  className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                    activeABTarget === 'A'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Đang kéo A{formatPointCoord(canvasPointA)}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveABTarget('B')}
                  className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                    activeABTarget === 'B'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Đang kéo B{formatPointCoord(canvasPointB)}
                </button>
              </div>
            )}
          </div>

          {/* Graph Engine Dispatch based on Exercise MathData */}
          {exercise.mathData.inequality && (
            <GraphCanvas
              inequality={exercise.mathData.inequality}
              pointM={canvasPointM}
              onPointChange={setCanvasPointM}
              showPointM={
                activeStep.inputType === 'canvas_drag_point' ||
                activeStep.inputType === 'canvas_half_plane' ||
                !!exercise.mathData.testPoint
              }
              showBoundaryLine={activeStep.inputType !== 'canvas_boundary' || completedSteps.has(1)}
              showShading={
                isExerciseFinished ||
                (activeStep.inputType !== 'canvas_half_plane' &&
                  activeStep.inputType !== 'canvas_drag_point' &&
                  activeStep.inputType !== 'canvas_boundary')
              }
              pointA={canvasPointA}
              pointB={canvasPointB}
              showPointsAB={activeStep.inputType === 'canvas_boundary'}
              activePointTarget={
                activeStep.inputType === 'canvas_boundary'
                  ? activeABTarget
                  : activeStep.inputType === 'canvas_drag_point'
                  ? 'M'
                  : null
              }
              onPointAChange={setCanvasPointA}
              onPointBChange={setCanvasPointB}
              enableHalfPlaneClick={activeStep.inputType === 'canvas_half_plane'}
              selectedHalfPlaneSide={canvasHalfPlaneSide}
              onSelectHalfPlane={side => setCanvasHalfPlaneSide(side)}
              isSideVerifiedCorrect={
                activeStep.inputType === 'canvas_half_plane' && completedSteps.has(activeStep.stepIndex)
                  ? true
                  : null
              }
              snapToGrid={true}
            />
          )}

          {!exercise.mathData.inequality && systemAnalysis && !lpResult && (
            <SystemGraphCanvas
              system={exercise.mathData.system || []}
              analysis={systemAnalysis}
              pointM={canvasPointM}
              onPointMChange={setCanvasPointM}
              showPointM={activeStep.inputType === 'canvas_drag_point'}
              showCommonFeasibleRegion={true}
              showBoundaryLines={true}
              showIntersections={isExerciseFinished || activeStep.inputType !== 'coordinate'}
            />
          )}

          {lpScenario && lpResult && (
            <OptimizationGraphCanvas
              scenario={lpScenario}
              result={lpResult}
              kValue={optKValue}
              onKValueChange={setOptKValue}
              showOptimalPoint={isExerciseFinished}
            />
          )}

          {/* Candidate points quick reference bar if provided */}
          {exercise.mathData.candidatePoints && exercise.mathData.candidatePoints.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Các điểm xét trong đề:</span>
              {exercise.mathData.candidatePoints.map(cp => (
                <button
                  key={cp.label}
                  type="button"
                  onClick={() => setCanvasPointM(cp.point)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-mono text-xs transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  {cp.label}
                  {formatPointCoord(cp.point)}
                </button>
              ))}
              <span className="text-[11px] text-slate-400">
                (Nhấp vào điểm để đặt thử lên đồ thị)
              </span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (5 cols): Question, Step-by-Step Grader & Socratic Opti */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            activeStep.inputType === 'canvas_boundary' ||
            activeStep.inputType === 'canvas_drag_point' ||
            activeStep.inputType === 'canvas_half_plane'
              ? 'order-2 lg:order-2'
              : 'order-1 lg:order-2'
          }`}
        >
          {/* Problem Statement Card (Desktop >= 1024px) */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700">Đề bài Toán học</span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                Bước {currentStepIdx + 1}/{exercise.steps.length}
              </span>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
              {exercise.questionText}
            </p>

            {/* Step Progress Tabs */}
            <div className="pt-2 flex items-center gap-1.5">
              {exercise.steps.map((st, idx) => {
                const isDone = completedSteps.has(st.stepIndex);
                const isCurrent = idx === currentStepIdx;
                const crit = exercise.rubric.criteria.find(c => c.stepIndex === st.stepIndex);
                return (
                  <button
                    key={st.stepIndex}
                    type="button"
                    onClick={() => goToStep(idx)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="whitespace-nowrap">Bước {st.stepIndex}</span>
                    <span className="font-mono text-[11px] opacity-90">
                      {isDone ? '✓' : `${crit?.points || 5}đ`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Interaction Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{activeStep.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {activeStep.instruction}
              </p>
            </div>

            {/* Step Input Control by inputType */}
            {activeStep.inputType === 'choice' && activeStep.choices && (
              <div className="space-y-2">
                {activeStep.choices.map(ch => {
                  const selected = choiceValue === ch.value;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setChoiceValue(ch.value)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition cursor-pointer flex items-start gap-2.5 ${
                        selected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          selected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="leading-relaxed">{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {activeStep.inputType === 'number' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Nhập giá trị số hoặc phân số (ví dụ: 7, 4.5, 560/3):
                </label>
                <input
                  type="text"
                  value={numberText}
                  onChange={e => setNumberText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyCurrentStep()}
                  placeholder="Nhập kết quả..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-indigo-600"
                />
              </div>
            )}

            {activeStep.inputType === 'coordinate' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hoành độ x (VD: 4 hoặc 8/3)
                  </label>
                  <input
                    type="text"
                    value={coordXText}
                    onChange={e => setCoordXText(e.target.value)}
                    placeholder="x = ..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tung độ y (VD: 2 hoặc 8/3)
                  </label>
                  <input
                    type="text"
                    value={coordYText}
                    onChange={e => setCoordYText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyCurrentStep()}
                    placeholder="y = ..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            )}

            {activeStep.inputType === 'canvas_drag_point' && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">
                    Tọa độ điểm M hiện tại trên đồ thị:
                  </span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">
                    M{formatPointCoord(canvasPointM)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/70">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-600">x =</span>
                    <input
                      type="number"
                      step="0.5"
                      value={canvasPointM.x}
                      onChange={e =>
                        setCanvasPointM(prev => ({
                          ...prev,
                          x: parseFloat(e.target.value) || 0
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-600">y =</span>
                    <input
                      type="number"
                      step="0.5"
                      value={canvasPointM.y}
                      onChange={e =>
                        setCanvasPointM(prev => ({
                          ...prev,
                          y: parseFloat(e.target.value) || 0
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep.inputType === 'canvas_boundary' && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 space-y-1.5">
                    <span className="text-blue-700 font-bold block">
                      Điểm A{formatPointCoord(canvasPointA)}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[11px] text-slate-500">x:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={canvasPointA.x}
                        onChange={e =>
                          setCanvasPointA(prev => ({
                            ...prev,
                            x: parseFloat(e.target.value) || 0
                          }))
                        }
                        className="w-full px-1.5 py-1 rounded border border-slate-300 font-mono text-xs font-bold"
                      />
                      <span className="font-mono text-[11px] text-slate-500">y:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={canvasPointA.y}
                        onChange={e =>
                          setCanvasPointA(prev => ({
                            ...prev,
                            y: parseFloat(e.target.value) || 0
                          }))
                        }
                        className="w-full px-1.5 py-1 rounded border border-slate-300 font-mono text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 space-y-1.5">
                    <span className="text-indigo-700 font-bold block">
                      Điểm B{formatPointCoord(canvasPointB)}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[11px] text-slate-500">x:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={canvasPointB.x}
                        onChange={e =>
                          setCanvasPointB(prev => ({
                            ...prev,
                            x: parseFloat(e.target.value) || 0
                          }))
                        }
                        className="w-full px-1.5 py-1 rounded border border-slate-300 font-mono text-xs font-bold"
                      />
                      <span className="font-mono text-[11px] text-slate-500">y:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={canvasPointB.y}
                        onChange={e =>
                          setCanvasPointB(prev => ({
                            ...prev,
                            y: parseFloat(e.target.value) || 0
                          }))
                        }
                        className="w-full px-1.5 py-1 rounded border border-slate-300 font-mono text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep.inputType === 'canvas_half_plane' && (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCanvasHalfPlaneSide('with_test')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    canvasHalfPlaneSide === 'with_test'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Nửa mặt phẳng CHỨA điểm thử
                </button>
                <button
                  type="button"
                  onClick={() => setCanvasHalfPlaneSide('without_test')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    canvasHalfPlaneSide === 'without_test'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Nửa mặt phẳng KHÔNG chứa điểm thử
                </button>
              </div>
            )}

            {/* Action Buttons: Verify Step + Next Step */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleVerifyCurrentStep}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kiểm chứng Bước {activeStep.stepIndex}</span>
              </button>

              {completedSteps.has(activeStep.stepIndex) &&
                currentStepIdx < exercise.steps.length - 1 && (
                  <button
                    type="button"
                    onClick={() => goToStep(currentStepIdx + 1)}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <span>Sang Bước {activeStep.stepIndex + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
            </div>

            {/* Step Verification Feedback Banner */}
            {lastFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  lastFeedback.isCorrect
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/90 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    {lastFeedback.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>{lastFeedback.feedbackTitle}</span>
                  </div>

                  {!lastFeedback.isCorrect &&
                    lastFeedback.detectedErrorCodes.map(code => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => onOpenErrorAnalysis(code)}
                        className="px-2 py-0.5 rounded bg-amber-200/70 hover:bg-amber-300 text-amber-950 font-mono font-bold text-[11px] cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Chi tiết lỗi {code}
                      </button>
                    ))}
                </div>
                <p className="leading-relaxed">{lastFeedback.socraticMessage}</p>
              </div>
            )}
          </div>

          {/* Socratic Opti Assistant Card (3 Hint Tiers + Post-Exercise Insight) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <OptiMascot
                  expression={
                    isExerciseFinished
                      ? 'cheering'
                      : lastFeedback && !lastFeedback.isCorrect
                      ? 'thinking'
                      : 'happy'
                  }
                  size={38}
                  animate={false}
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Trợ lý Socratic Opti
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Gợi mở từng bước · Không tiết lộ đáp án sẵn
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setUnlockedHintTier(prev => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 3))
                }
                disabled={unlockedHintTier >= 3}
                className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-45 text-indigo-800 text-xs font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>
                  {unlockedHintTier === 0
                    ? 'Mở gợi ý cấp 1'
                    : unlockedHintTier === 1
                    ? 'Mở gợi ý cấp 2'
                    : unlockedHintTier === 2
                    ? 'Mở gợi ý cấp 3'
                    : 'Đã mở đủ 3 gợi ý'}
                </span>
              </button>
            </div>

            {/* 3 Progressive Hint Tiers */}
            {unlockedHintTier >= 1 && (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-indigo-800 block mb-0.5">
                    Gợi ý cấp 1 (Câu hỏi định hướng Socratic):
                  </span>
                  <p className="text-slate-700 leading-relaxed">{exercise.hints.tier1}</p>
                </div>

                {unlockedHintTier >= 2 && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-blue-800 block mb-0.5">
                      Gợi ý cấp 2 (Phương pháp Toán học):
                    </span>
                    <p className="text-slate-700 leading-relaxed">{exercise.hints.tier2}</p>
                  </div>
                )}

                {unlockedHintTier >= 3 && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-emerald-800 block mb-0.5">
                      Gợi ý cấp 3 (Hướng dẫn tính toán cụ thể):
                    </span>
                    <p className="text-slate-700 leading-relaxed">{exercise.hints.tier3}</p>
                  </div>
                )}
              </div>
            )}

            {/* Complete Solution & Next Challenge Card (Only shown AFTER all steps are verified) */}
            {isExerciseFinished && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Bản chất Toán học & Lời giải chuẩn SGK</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-800">
                    Hoàn thành 100%
                  </span>
                </div>

                <p className="text-slate-800 font-semibold">
                  Đáp án chuẩn: {exercise.canonicalAnswerSummary}
                </p>
                <p className="text-slate-700 leading-relaxed">
                  {exercise.solutionExplanation}
                </p>

                <div className="pt-2 border-t border-emerald-200/70 flex flex-wrap items-center justify-between gap-2">
                  {suggestedRemedialExercise ? (
                    <button
                      type="button"
                      onClick={() => onSelectExercise(suggestedRemedialExercise)}
                      className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Luyện bài khắc phục lỗi ({suggestedRemedialExercise.id})</span>
                    </button>
                  ) : (
                    <span className="text-emerald-800 font-medium">
                      Em đã nắm vững dạng bài này! Hãy thử thách bài tiếp theo.
                    </span>
                  )}

                  {nextExercise && (
                    <button
                      type="button"
                      onClick={() => onSelectExercise(nextExercise)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <span>Thử thách tiếp theo ({nextExercise.id})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
