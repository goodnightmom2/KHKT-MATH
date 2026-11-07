import React, { useState, useMemo } from 'react';
import { LearningMode, Point2D, RealWorldScenario } from '../../types/math';
import { REAL_WORLD_SCENARIOS, solveLinearProgramming } from '../../math/optimizationMathEngine';
import { formatCoord } from '../../math/systemMathEngine';
import { OptimizationGraphCanvas } from '../../graph/OptimizationGraphCanvas';
import { OptimizationSevenStepWizard } from './OptimizationSevenStepWizard';
import { OptimizationTeacherControls } from './OptimizationTeacherControls';
import { OptimizationSandboxPanel } from './OptimizationSandboxPanel';
import { VertexObjectiveTable } from './VertexObjectiveTable';
import { OptiMascot } from '../../mascot/OptiMascot';
import {
  Compass,
  GraduationCap,
  Presentation,
  SlidersHorizontal,
  Settings,
  Calculator,
  Eye
} from 'lucide-react';

interface OptimizationLabProps {
  initialLearningMode?: LearningMode;
  onBackToHome: () => void;
}

export const OptimizationLab: React.FC<OptimizationLabProps> = ({
  initialLearningMode = 'guided',
  onBackToHome
}) => {
  const [learningMode, setLearningMode] = useState<LearningMode>(initialLearningMode);

  // Active scenario (Default: Bài 1 - Sản xuất A và B kinh điển SGK)
  const [scenario, setScenario] = useState<RealWorldScenario>(REAL_WORLD_SCENARIOS[0]);

  // Visual toggles
  const [showLevelCurve, setShowLevelCurve] = useState(true);
  const [showIntegerPoints, setShowIntegerPoints] = useState(true);
  const [showOptimalPoint, setShowOptimalPoint] = useState(true);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [highlightVertex, setHighlightVertex] = useState<Point2D | null>(null);

  // Solve linear programming problem dynamically
  const result = useMemo(() => {
    return solveLinearProgramming(scenario);
  }, [scenario]);

  // Level curve k value state
  const [kValue, setKValue] = useState<number>(() => {
    return result.optimalValue !== null ? Math.round(result.optimalValue * 0.65) : 60;
  });

  // Mobile Tab view switcher (for screens < lg)
  const [mobileTab, setMobileTab] = useState<'graph' | 'controls' | 'table' | 'all'>('graph');

  const handleSelectScenario = (id: string) => {
    const found = REAL_WORLD_SCENARIOS.find(s => s.id === id);
    if (found) {
      setScenario(found);
      const res = solveLinearProgramming(found);
      if (res.optimalValue !== null) {
        setKValue(Math.round(res.optimalValue * 0.65));
      }
      setHighlightVertex(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header & Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs sticky top-12 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBackToHome}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 min-h-[36px] cursor-pointer shrink-0"
            >
              ← Trang chủ
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse shrink-0" />
                <h1 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 leading-none truncate">
                  Phòng Thí Nghiệm Tối Ưu Hóa Tuyến Tính
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 shrink-0">
                  Module 4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block truncate">
                Mô hình hóa thực tế & Tìm phương án tối ưu bằng đường mức
              </p>
            </div>
          </div>

          {/* Scenario Selector & Learning Mode Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Scenario Quick Dropdown */}
            <select
              value={REAL_WORLD_SCENARIOS.some(s => s.id === scenario.id) ? scenario.id : 'scenario-1'}
              onChange={e => handleSelectScenario(e.target.value)}
              className="text-xs font-bold bg-slate-100 border border-slate-300 text-slate-800 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-purple-500 cursor-pointer min-h-[36px]"
            >
              {REAL_WORLD_SCENARIOS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.title.split(':')[0]}: {s.title.split(':')[1]?.trim() || s.title}
                </option>
              ))}
            </select>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setLearningMode('guided')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[34px] cursor-pointer ${
                  learningMode === 'guided'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>7 bước SGK</span>
              </button>

              <button
                type="button"
                onClick={() => setLearningMode('practice')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[34px] cursor-pointer ${
                  learningMode === 'practice'
                    ? 'bg-white text-purple-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-purple-600" />
                <span>Tự do</span>
              </button>

              <button
                type="button"
                onClick={() => setLearningMode('teacher')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[34px] cursor-pointer ${
                  learningMode === 'teacher'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Giáo viên</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="max-w-7xl mx-auto p-2.5 sm:p-4 md:p-6 w-full flex-1 flex flex-col gap-3 sm:gap-5">
        {/* MODE 1: 7-STEP GUIDED WORKFLOW */}
        {learningMode === 'guided' && (
          <OptimizationSevenStepWizard
            scenario={scenario}
            result={result}
            onSelectScenario={handleSelectScenario}
            onSwitchToSandbox={() => setLearningMode('practice')}
          />
        )}

        {/* MODE 2 & 3: FREE SANDBOX & TEACHER MODE */}
        {(learningMode === 'practice' || learningMode === 'teacher') && (
          <div className="flex flex-col gap-4">
            {/* Teacher Controls Bar */}
            {learningMode === 'teacher' && (
              <OptimizationTeacherControls
                scenario={scenario}
                result={result}
                isPresentationMode={isPresentationMode}
                onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
                showLevelCurve={showLevelCurve}
                onToggleLevelCurve={() => setShowLevelCurve(!showLevelCurve)}
                showIntegerPoints={showIntegerPoints}
                onToggleIntegerPoints={() => setShowIntegerPoints(!showIntegerPoints)}
                showOptimalPoint={showOptimalPoint}
                onToggleOptimalPoint={() => setShowOptimalPoint(!showOptimalPoint)}
              />
            )}

            {/* MOBILE NAVIGATION TABS (Visible only on < lg) */}
            {!isPresentationMode && (
              <div className="lg:hidden flex flex-col gap-2">
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setMobileTab('graph')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer min-h-[40px] shrink-0 ${
                      mobileTab === 'graph'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Đồ thị & Đường mức</span>
                    <span className="font-mono text-[10px] bg-white/20 px-1 py-0.2 rounded">
                      k={formatCoord(kValue)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileTab('controls')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer min-h-[40px] shrink-0 ${
                      mobileTab === 'controls'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Bảng điều khiển</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileTab('table')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer min-h-[40px] shrink-0 ${
                      mobileTab === 'table'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Bảng giá trị đỉnh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileTab('all')}
                    className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer min-h-[40px] shrink-0 ${
                      mobileTab === 'all'
                        ? 'bg-purple-100 text-purple-900 font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Xem tất cả (cuộn trang)"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* MOBILE VIEWPORT RENDERING (< lg) */}
            <div className="lg:hidden flex flex-col gap-3.5">
              {/* 1. Mobile Graph View */}
              {(mobileTab === 'graph' || mobileTab === 'all' || isPresentationMode) && (
                <div className="flex flex-col gap-3">
                  <div className="bg-white rounded-2xl border border-slate-200 p-2.5 sm:p-4 shadow-xs flex flex-col gap-2">
                    <OptimizationGraphCanvas
                      scenario={scenario}
                      result={result}
                      kValue={kValue}
                      onKValueChange={setKValue}
                      showLevelCurve={showLevelCurve}
                      showIntegerPoints={showIntegerPoints && scenario.integerRequired}
                      showOptimalPoint={showOptimalPoint}
                      revealOptimalAnswers={true}
                      highlightVertex={highlightVertex}
                      onHighlightVertex={setHighlightVertex}
                      isPresentationMode={isPresentationMode}
                    />
                  </div>

                  {/* Sticky Mobile Fast Switcher Bar */}
                  {mobileTab === 'graph' && !isPresentationMode && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMobileTab('controls')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-800 transition min-h-[44px] cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Mở Bảng Điều Khiển Bài Toán</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMobileTab('table')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold shadow-xs hover:bg-purple-100 transition min-h-[44px] cursor-pointer"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Bảng Đỉnh & Nghiệm Nguyên</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Mobile Controls View */}
              {(mobileTab === 'controls' || mobileTab === 'all') && !isPresentationMode && (
                <div className="flex flex-col gap-3.5">
                  <OptimizationSandboxPanel
                    scenario={scenario}
                    onScenarioChange={setScenario}
                    onSelectScenario={handleSelectScenario}
                  />

                  {/* Opti Dialogue Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center gap-3">
                    <OptiMascot expression="happy" actionState="nod" size={40} />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-purple-900 block mb-0.5">Opti gợi ý:</span>
                      Chỉnh sửa hệ số hoặc ràng buộc ở trên, sau đó bấm nút bên dưới để quay lại quan sát đồ thị nhé!
                    </div>
                  </div>

                  {/* Sticky Mobile Jump to Graph Button */}
                  {mobileTab === 'controls' && (
                    <button
                      type="button"
                      onClick={() => setMobileTab('graph')}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition min-h-[44px] cursor-pointer sticky bottom-3 z-20"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Xem Đồ Thị & Quét Đường Mức Ngay (k = {formatCoord(kValue)})</span>
                    </button>
                  )}
                </div>
              )}

              {/* 3. Mobile Table View */}
              {(mobileTab === 'table' || mobileTab === 'all') && !isPresentationMode && (
                <div className="flex flex-col gap-3.5">
                  <VertexObjectiveTable
                    scenario={scenario}
                    result={result}
                    onHighlightVertex={setHighlightVertex}
                    defaultRevealed={learningMode === 'teacher'}
                    onSelectKValue={k => {
                      setKValue(k);
                      setMobileTab('graph');
                    }}
                  />

                  {/* Jump back to graph */}
                  {mobileTab === 'table' && (
                    <button
                      type="button"
                      onClick={() => setMobileTab('graph')}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition min-h-[44px] cursor-pointer sticky bottom-3 z-20"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Xem Trên Đồ Thị Với k = {formatCoord(kValue)}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* DESKTOP SIDE-BY-SIDE GRID (lg: and up) */}
            <div className={`hidden lg:grid gap-4 items-start ${isPresentationMode ? 'grid-cols-1' : 'grid-cols-12'}`}>
              {/* Left Column: Sandbox Editor Panel (lg: 4 cols) */}
              {!isPresentationMode && (
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <OptimizationSandboxPanel
                    scenario={scenario}
                    onScenarioChange={setScenario}
                    onSelectScenario={handleSelectScenario}
                  />

                  {/* Quick Opti Dialogue Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
                    <OptiMascot expression="happy" actionState="nod" size={46} />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-purple-900 block mb-0.5">Opti gợi ý:</span>
                      Kéo thanh trượt k hoặc bấm "Phát" trên đồ thị để quan sát đường mức tịnh tiến song song qua 4 đỉnh nhé!
                    </div>
                  </div>
                </div>
              )}

              {/* Right Column: Optimization Graph Canvas & Vertex Table (lg: 8 cols) */}
              <div className={isPresentationMode ? 'w-full' : 'lg:col-span-8 flex flex-col gap-4'}>
                <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col gap-2">
                  <OptimizationGraphCanvas
                    scenario={scenario}
                    result={result}
                    kValue={kValue}
                    onKValueChange={setKValue}
                    showLevelCurve={showLevelCurve}
                    showIntegerPoints={showIntegerPoints && scenario.integerRequired}
                    showOptimalPoint={showOptimalPoint}
                    revealOptimalAnswers={true}
                    highlightVertex={highlightVertex}
                    onHighlightVertex={setHighlightVertex}
                    isPresentationMode={isPresentationMode}
                  />
                </div>

                {/* Bottom: Vertex Objective Table */}
                <VertexObjectiveTable
                  scenario={scenario}
                  result={result}
                  onHighlightVertex={setHighlightVertex}
                  defaultRevealed={learningMode === 'teacher'}
                  onSelectKValue={setKValue}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
