import React, { useState, useMemo, useEffect } from 'react';
import { LearningMode, Point2D, SystemInequality } from '../../types/math';
import { analyzeSystemFeasibleRegion, SYSTEM_BENCHMARK_PRESETS } from '../../math/systemMathEngine';
import { SystemGraphCanvas } from '../../graph/SystemGraphCanvas';
import { SystemInputPanel } from './SystemInputPanel';
import { SystemIntersectionTable } from './SystemIntersectionTable';
import { SystemPointMInspector } from './SystemPointMInspector';
import { SystemSevenStepWizard } from './SystemSevenStepWizard';
import { SystemTeacherControls } from './SystemTeacherControls';
import { OptiMascot } from '../../mascot/OptiMascot';
import {
  Compass,
  GraduationCap,
  Presentation,
  Layers,
  Sparkles,
  RotateCcw,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sliders,
  Lock
} from 'lucide-react';

interface SystemInequalityLabProps {
  initialLearningMode?: LearningMode;
  isTeacherUnlocked?: boolean;
  onRequestTeacherAuth?: (onUnlocked: () => void) => void;
  onBackToHome: () => void;
}

export const SystemInequalityLab: React.FC<SystemInequalityLabProps> = ({
  initialLearningMode = 'guided',
  isTeacherUnlocked = false,
  onRequestTeacherAuth,
  onBackToHome
}) => {
  const [learningMode, setLearningMode] = useState<LearningMode>(
    initialLearningMode === 'teacher' && !isTeacherUnlocked ? 'guided' : initialLearningMode
  );
  const [teacherSubView, setTeacherSubView] = useState<'wizard' | 'sandbox'>('wizard');

  useEffect(() => {
    if (!isTeacherUnlocked && learningMode === 'teacher') {
      setLearningMode('guided');
    }
  }, [isTeacherUnlocked, learningMode]);

  const handleModeChange = (mode: LearningMode) => {
    if (mode === 'teacher' && !isTeacherUnlocked) {
      if (onRequestTeacherAuth) {
        onRequestTeacherAuth(() => setLearningMode('teacher'));
      }
      return;
    }
    setLearningMode(mode);
  };

  // Active System of Inequalities (Default: Bài 1 - Tứ giác SGK chuẩn)
  const [system, setSystem] = useState<SystemInequality[]>(SYSTEM_BENCHMARK_PRESETS[0].system);

  // Test point M
  const [pointM, setPointM] = useState<Point2D>({ x: 2, y: 3 });
  const [highlightVertex, setHighlightVertex] = useState<Point2D | null>(null);

  // Layer Toggles
  const [showCommonRegion, setShowCommonRegion] = useState(true);
  const [showIndividualFills, setShowIndividualFills] = useState(true);
  const [showBoundaryLines, setShowBoundaryLines] = useState(true);
  const [showIntersections, setShowIntersections] = useState(true);
  const [showVerticesOnly, setShowVerticesOnly] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Mathematical analysis of the current system
  const analysis = useMemo(() => {
    return analyzeSystemFeasibleRegion(system);
  }, [system]);

  // Load a preset
  const handleSelectPreset = (presetId: string) => {
    const found = SYSTEM_BENCHMARK_PRESETS.find(p => p.id === presetId);
    if (found) {
      setSystem(found.system);
      // Auto reposition point M near center
      if (presetId === 'preset-1') setPointM({ x: 2, y: 3 });
      else if (presetId === 'preset-2') setPointM({ x: 1.5, y: 0 });
      else if (presetId === 'preset-3') setPointM({ x: 3, y: 3 });
      else if (presetId === 'preset-4') setPointM({ x: 1, y: 1 });
      else if (presetId === 'preset-5') setPointM({ x: 0, y: 1 });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header & Mode Switcher */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs sticky top-12 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToHome}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 min-h-[36px] cursor-pointer"
            >
              ← Trang chủ
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-none">
                  Phòng Thí Nghiệm Hệ Bất Phương Trình
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                  Module 3
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                Giao của các nửa mặt phẳng & Xác định các đỉnh miền nghiệm
              </p>
            </div>
          </div>

          {/* Learning Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleModeChange('guided')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                learningMode === 'guided'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>7 bước SGK</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('practice')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                learningMode === 'practice'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Tự do</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('teacher')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[36px] cursor-pointer ${
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
              <span className="hidden sm:inline">Giáo viên</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-2.5 sm:p-4 md:p-6 w-full flex-1 flex flex-col gap-3 sm:gap-5">
        {learningMode === 'teacher' && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Chế độ Giáo viên (Module 3): Xem lời giải 7 bước & Bảng kiểm tra giao điểm</span>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-purple-200 text-xs">
              <button
                type="button"
                onClick={() => setTeacherSubView('wizard')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  teacherSubView === 'wizard' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chấm & Giải 7 Bước
              </button>
              <button
                type="button"
                onClick={() => setTeacherSubView('sandbox')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  teacherSubView === 'sandbox' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bàn Trình Chiếu Đồ Thị
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: GUIDED 7-STEP LAB (Or Teacher Wizard View) */}
        {(learningMode === 'guided' || (learningMode === 'teacher' && teacherSubView === 'wizard')) && (
          <SystemSevenStepWizard
            system={system}
            analysis={analysis}
            learningMode={learningMode}
            onSystemChange={setSystem}
            onSelectPreset={handleSelectPreset}
            onSwitchToSandbox={() => handleModeChange('practice')}
          />
        )}

        {/* MODE 1 & 3: FREE SANDBOX & TEACHER SANDBOX MODE */}
        {(learningMode === 'practice' || (learningMode === 'teacher' && teacherSubView === 'sandbox')) && (
          <div className="flex flex-col gap-4">
            {/* Teacher Mode Control Banner */}
            {learningMode === 'teacher' && (
              <SystemTeacherControls
                system={system}
                analysis={analysis}
                showCommonRegion={showCommonRegion}
                onToggleCommonRegion={() => setShowCommonRegion(!showCommonRegion)}
                showIntersections={showIntersections}
                onToggleIntersections={() => setShowIntersections(!showIntersections)}
                showVerticesOnly={showVerticesOnly}
                onToggleVerticesOnly={() => setShowVerticesOnly(!showVerticesOnly)}
                isPresentationMode={isPresentationMode}
                onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
              />
            )}

            {/* Multi-Column Sandbox Grid */}
            <div className={`grid gap-4 items-start ${isPresentationMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
              {/* Left Column: Constraints Input Panel (lg: 4 cols) */}
              {!isPresentationMode && (
                <div className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-1">
                  <SystemInputPanel
                    system={system}
                    onSystemChange={setSystem}
                    onSelectPreset={handleSelectPreset}
                  />

                  {/* Quick Opti Dialogue Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
                    <OptiMascot expression="thinking" actionState="nod" size={46} />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-blue-900 block mb-0.5">Opti khuyên bạn:</span>
                      Hãy thử kéo điểm thử M trên đồ thị để kiểm tra sự thay đổi tính thỏa mãn đối với từng ràng buộc trong hệ!
                    </div>
                  </div>
                </div>
              )}

              {/* Center Column: System Graph Canvas (lg: 4.5 cols if right column present, or 8 cols) */}
              <div className={isPresentationMode ? 'w-full' : 'lg:col-span-8 flex flex-col gap-4 order-1 lg:order-2'}>
                <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col gap-2">
                  <SystemGraphCanvas
                    system={system}
                    analysis={analysis}
                    pointM={pointM}
                    onPointMChange={setPointM}
                    showPointM={true}
                    showCommonFeasibleRegion={showCommonRegion}
                    showIndividualFills={showIndividualFills}
                    showBoundaryLines={showBoundaryLines}
                    showIntersections={showIntersections}
                    showFeasibleVerticesOnly={showVerticesOnly}
                    isPresentationMode={isPresentationMode}
                    highlightVertex={highlightVertex}
                  />
                </div>

                {/* Bottom Row inside Sandbox: Point M Inspector & Intersections Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SystemPointMInspector
                    system={system}
                    pointM={pointM}
                    onPointMChange={setPointM}
                  />

                  <SystemIntersectionTable
                    analysis={analysis}
                    onHighlightVertex={setHighlightVertex}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
