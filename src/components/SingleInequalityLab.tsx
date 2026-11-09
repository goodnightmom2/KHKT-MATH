import React, { useState, useMemo, useEffect } from 'react';
import { Inequality, LearningMode, OptiExpression, Point2D, ShadingMode } from '../types/math';
import {
  evaluatePointWithSteps,
  formatBoundaryLine,
  formatExplicitSubstitution,
  formatInequality,
  formatNumberClean,
  getOperatorSymbol,
} from '../math/mathEngine';
import { OptiActionState } from '../mascot/OptiMascot';
import { GraphCanvas } from '../graph/GraphCanvas';
import { ControlPanel } from './ControlPanel';
import { ExplanationPanel } from './ExplanationPanel';
import { OptiDialogue } from '../mascot/OptiDialogue';
import { SevenStepWizard } from './SevenStepWizard/SevenStepWizard';
import { Sparkles, GraduationCap, Compass, Presentation, Sliders, Eye, Lock } from 'lucide-react';

interface SingleInequalityLabProps {
  initialLearningMode?: LearningMode;
  isTeacherUnlocked?: boolean;
  onRequestTeacherAuth?: (onUnlocked: () => void) => void;
  onBackToHome: () => void;
}

export const SingleInequalityLab: React.FC<SingleInequalityLabProps> = ({
  initialLearningMode = 'guided',
  isTeacherUnlocked = false,
  onRequestTeacherAuth,
  onBackToHome
}) => {
  // Inequality state: Default is 2x + y <= 6 as mandated by prompt
  const [inequality, setInequality] = useState<Inequality>({
    id: 'lab-default',
    a: 2,
    b: 1,
    op: '<=',
    c: 6
  });

  // Test point M state: Default is (1, 2)
  const [pointM, setPointM] = useState<Point2D>({ x: 1, y: 2 });

  // Shading mode: 'solution' or 'exclusion' (SGK)
  const [shadingMode, setShadingMode] = useState<ShadingMode>('solution');

  // Learning mode: 'practice' | 'guided' | 'teacher'
  const [learningMode, setLearningMode] = useState<LearningMode>(
    initialLearningMode === 'teacher' && !isTeacherUnlocked ? 'guided' : initialLearningMode
  );

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

  // Mobile view tab in Free Practice mode: 'all' | 'graph' | 'controls'
  const [mobileFreeTab, setMobileFreeTab] = useState<'all' | 'graph' | 'controls'>('all');

  // Opti assistant visibility
  const [optiVisible, setOptiVisible] = useState(true);

  // Guided tutorial current step index (for 'guided' mode)
  const [guidedStep, setGuidedStep] = useState<number>(0);

  // Math evaluation
  const evalResult = useMemo(() => {
    return evaluatePointWithSteps(inequality, pointM);
  }, [inequality, pointM]);

  // Dynamic Opti message calculation
  const optiState = useMemo(() => {
    const isOrigin = pointM.x === 0 && pointM.y === 0;
    const isThroughOrigin = Math.abs(inequality.c) < 1e-6;
    const opSym = getOperatorSymbol(inequality.op);
    const strMx = formatNumberClean(pointM.x);
    const strMy = formatNumberClean(pointM.y);

    if (learningMode === 'guided') {
      const testPointName = isThroughOrigin ? 'P(1; 0)' : 'O(0; 0)';
      const testX = isThroughOrigin ? 1 : 0;
      const testY = isThroughOrigin ? 0 : 0;
      const testSub = formatExplicitSubstitution(inequality.a, inequality.b, testX, testY);
      const testVal = testSub.totalLhs;
      const testSatisfies =
        inequality.op === '<=' ? testVal <= inequality.c :
        inequality.op === '<' ? testVal < inequality.c :
        inequality.op === '>=' ? testVal >= inequality.c : testVal > inequality.c;

      const guidedSteps = [
        {
          text: `Chào bạn! Mình là Opti. Ta cùng học cách biểu diễn miền nghiệm của ${formatInequality(inequality)}. Bước 1: Quan sát đường thẳng bờ d: ${formatBoundaryLine(inequality.a, inequality.b, inequality.c)}. Nó chia mặt phẳng thành 2 nửa! Dấu "${opSym}" quy định vẽ nét ${inequality.op === '<=' || inequality.op === '>=' ? 'liền (lấy bờ)' : 'đứt (không lấy bờ)'}.`,
          expression: 'happy' as OptiExpression,
          theme: 'blue' as const,
          badge: 'Bước 1: Vẽ bờ',
          actionState: 'idle' as const
        },
        {
          text: isThroughOrigin
            ? 'Bước 2: Đường thẳng bờ đi qua gốc O(0; 0), nên ta KHÔNG ĐƯỢC CHỌN O làm điểm thử! Hãy chọn điểm thử thay thế như P(1; 0) không thuộc đường bờ.'
            : 'Bước 2: Ta lấy một điểm thử không nằm trên bờ. Thường gốc tọa độ O(0; 0) là điểm thử chuẩn và dễ tính nhất nếu đường thẳng không đi qua O!',
          expression: 'thinking' as OptiExpression,
          theme: isThroughOrigin ? ('orange' as const) : ('green' as const),
          badge: isThroughOrigin ? 'Bước 2: Chọn điểm P(1; 0)' : 'Bước 2: Chọn điểm O(0; 0)',
          actionState: 'think' as const
        },
        {
          text: `Bước 3: Thay ${testPointName} vào vế trái: ${testSub.exprWithMul} = ${formatNumberClean(testVal)} ${opSym} ${inequality.c}. Mệnh đề này là ${testSatisfies ? 'ĐÚNG' : 'SAI'}!`,
          expression: 'cheering' as OptiExpression,
          theme: 'purple' as const,
          badge: 'Bước 3: Tính toán & so sánh',
          actionState: (testSatisfies ? 'nod' : 'think') as OptiActionState
        },
        {
          text: `Bước 4: Kết luận: Miền nghiệm là nửa mặt phẳng ${testSatisfies ? `chứa điểm ${testPointName}` : `không chứa điểm ${testPointName}`}. Hãy kéo điểm M bất kỳ để kiểm chứng dự đoán của bạn!`,
          expression: 'wink' as OptiExpression,
          theme: 'green' as const,
          badge: 'Bước 4: Kết luận miền nghiệm',
          actionState: 'nod' as const
        }
      ];
      return guidedSteps[guidedStep] || guidedSteps[0];
    }

    if (learningMode === 'teacher') {
      return {
        text: `[AI Trợ Giảng GV]: Đường thẳng bờ d: ${formatBoundaryLine(inequality.a, inequality.b, inequality.c)} (${inequality.op === '<=' || inequality.op === '>=' ? 'Nét liền' : 'Nét đứt'}). Điểm M(${strMx}; ${strMy}) hiện có Vế trái = ${formatNumberClean(evalResult.lhsValue)} ${opSym} ${inequality.c} → Kết quả: ${evalResult.satisfies ? 'ĐÚNG (Thuộc miền nghiệm)' : 'SAI (Không thuộc miền nghiệm)'}.`,
        expression: 'thinking' as OptiExpression,
        theme: 'purple' as const,
        badge: 'Gợi ý sư phạm & Đáp án GV',
        actionState: 'think' as const
      };
    }

    // Special Case E: c = 0 and student selected O(0;0)
    if (isThroughOrigin && isOrigin) {
      return {
        text: `Chú ý đặc biệt: Gốc tọa độ O(0; 0) nằm ngay trên đường thẳng bờ ${formatBoundaryLine(inequality.a, inequality.b, inequality.c)}! Theo SGK Toán 10, ta KHÔNG ĐƯỢC chọn điểm nằm trên bờ làm điểm thử để phân biệt hai nửa mặt phẳng. Hãy bấm chọn điểm P(1; 0) hoặc Q(0; 1) nhé!`,
        expression: 'thinking' as OptiExpression,
        theme: 'orange' as const,
        badge: 'Cảnh báo: O(0;0) nằm trên bờ',
        actionState: 'think' as const
      };
    }

    // Special Case B: point is on boundary but strict inequality (< or >)
    if (evalResult.relation === 'on_boundary' && !evalResult.satisfies) {
      return {
        text: `Chú ý quan trọng: Điểm M(${strMx}; ${strMy}) nằm ngay trên đường thẳng bờ ${formatBoundaryLine(inequality.a, inequality.b, inequality.c)}. Vì bất phương trình mang dấu so sánh nghiêm ngặt "${opSym}" (vẽ bằng nét đứt), nên đường biên KHÔNG thuộc miền nghiệm!`,
        expression: 'thinking' as OptiExpression,
        theme: 'orange' as const,
        badge: 'Điểm trên biên nét đứt',
        actionState: 'think' as const
      };
    }

    // Point on boundary with inclusive inequality (<= or >=)
    if (evalResult.relation === 'on_boundary' && evalResult.satisfies) {
      return {
        text: `Chính xác! Điểm M(${strMx}; ${strMy}) nằm trên đường biên ${formatBoundaryLine(inequality.a, inequality.b, inequality.c)}. Do bất phương trình có dấu "${opSym}" (vẽ bằng nét liền), đường biên này thuộc miền nghiệm!`,
        expression: 'wink' as OptiExpression,
        theme: 'blue' as const,
        badge: 'Điểm trên đường biên nét liền',
        actionState: 'celebrate' as const
      };
    }

    // Point O(0,0) when c != 0 and satisfies
    if (isOrigin && !isThroughOrigin && evalResult.satisfies) {
      return {
        text: 'Rất thông minh! Điểm gốc O(0; 0) là "điểm thử vàng" trong SGK Toán 10 vì thay vào là tính được ngay mà không lo nhầm số!',
        expression: 'cheering' as OptiExpression,
        theme: 'green' as const,
        badge: 'Điểm thử kinh điển O(0;0)',
        actionState: 'celebrate' as const
      };
    }

    const pointSub = formatExplicitSubstitution(inequality.a, inequality.b, pointM.x, pointM.y);

    // General Point Satisfies
    if (evalResult.satisfies) {
      return {
        text: `Hướng dẫn kiểm chứng: Thay M(${strMx}; ${strMy}) vào vế trái ta được ${pointSub.exprWithMul} = ${formatNumberClean(evalResult.lhsValue)} ${opSym} ${inequality.c} (Mệnh đề ĐÚNG). Vậy nửa mặt phẳng chứa M thuộc miền nghiệm!`,
        expression: 'happy' as OptiExpression,
        theme: 'green' as const,
        badge: 'Hướng dẫn kiểm tra M(x;y)',
        actionState: 'nod' as const
      };
    } else {
      return {
        text: `Hướng dẫn phân tích: Thay M(${strMx}; ${strMy}) vào vế trái ta được ${pointSub.exprWithMul} = ${formatNumberClean(evalResult.lhsValue)}, không thỏa mãn dấu "${opSym} ${inequality.c}" (Mệnh đề SAI). Nhờ đó ta suy ra nửa mặt phẳng chứa M không phải miền nghiệm!`,
        expression: 'sad' as OptiExpression,
        theme: 'orange' as const,
        badge: 'Phân tích điểm thử M(x;y)',
        actionState: 'think' as const
      };
    }
  }, [pointM, inequality, evalResult, learningMode, guidedStep]);

  const handleResetToDefault = () => {
    setInequality({ id: 'lab-default', a: 2, b: 1, op: '<=', c: 6 });
    setPointM({ x: 1, y: 2 });
    setShadingMode('solution');
    setGuidedStep(0);
  };

  const quickHints = [
    'Thử gốc O(0;0)',
    'Thử điểm (2; 2) trên bờ',
    'Chuyển sang dấu nghiêm ngặt <',
    'Thử đổi sang dạng SGK'
  ];

  const handleSelectHint = (hint: string) => {
    if (hint.includes('O(0;0)')) {
      setPointM({ x: 0, y: 0 });
    } else if (hint.includes('(2; 2)')) {
      setPointM({ x: 2, y: 2 });
    } else if (hint.includes('nghiêm ngặt')) {
      setInequality(prev => ({ ...prev, op: '<' }));
    } else if (hint.includes('SGK')) {
      setShadingMode(prev => (prev === 'solution' ? 'exclusion' : 'solution'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Breadcrumb & Mode Selector Header */}
      <div className="bg-white border-b border-slate-200 px-2.5 sm:px-4 py-2 sm:py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 min-h-[36px] cursor-pointer"
            >
              ← <span className="hidden xs:inline">Trang chủ</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <h1 className="text-xs sm:text-base font-bold text-slate-900 leading-none">
                  Module 2: Một BPT
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                Bất phương trình bậc nhất hai ẩn & Khám phá nửa mặt phẳng
              </p>
            </div>
          </div>

          {/* Learning Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setLearningMode('guided')}
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
              onClick={() => setLearningMode('practice')}
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
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                learningMode === 'teacher'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={isTeacherUnlocked ? 'Chế độ Giáo viên (Đã mở khóa)' : 'Nhập mật khẩu để vào Chế độ Giáo viên'}
            >
              {isTeacherUnlocked ? (
                <Presentation className="w-3.5 h-3.5 text-purple-600" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span className="hidden sm:inline">Giáo viên</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: 7-Step Interactive Wizard OR Sandbox Mode */}
      <div className="max-w-7xl mx-auto p-2.5 sm:p-4 md:p-6 w-full flex-1 flex flex-col gap-3 sm:gap-5">
        {learningMode === 'guided' || learningMode === 'teacher' ? (
          <SevenStepWizard
            initialInequality={inequality}
            learningMode={learningMode}
            onLearningModeChange={handleModeChange}
            onSwitchToSandbox={() => handleModeChange('practice')}
          />
        ) : (
          <>
            {/* Switch to Wizard Prompt Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-2.5 sm:p-3.5 flex items-center justify-between gap-2 text-xs shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 block sm:inline truncate">
                    Đang ở chế độ Tự do ({formatInequality(inequality)})
                  </span>
                  <span className="text-slate-600 ml-1 hidden sm:inline">
                    — Kéo điểm M và chỉnh sửa hệ số bất kỳ hoặc chuyển sang 7 bước SGK.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLearningMode('guided')}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>7 bước SGK</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Quick View Switcher in Free Practice Mode */}
            <div className="lg:hidden grid grid-cols-3 gap-1 bg-slate-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMobileFreeTab('all')}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition ${
                  mobileFreeTab === 'all'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Xem tất cả
              </button>
              <button
                type="button"
                onClick={() => setMobileFreeTab('graph')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                  mobileFreeTab === 'graph'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Đồ thị & Giải</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileFreeTab('controls')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                  mobileFreeTab === 'controls'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Đổi hệ số</span>
              </button>
            </div>

            {/* Opti Mascot Assistant Banner */}
            <OptiDialogue
              message={optiState.text}
              expression={optiState.expression}
              actionState={optiState.actionState}
              colorTheme={optiState.theme}
              badge={optiState.badge}
              isVisible={optiVisible}
              onToggleVisibility={() => setOptiVisible(!optiVisible)}
              quickHints={quickHints}
              onSelectHint={handleSelectHint}
            />

            {/* Core Layout: On Mobile, Graph + Explanation comes FIRST so students see the graph immediately */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
              {/* Left Column on Desktop / Second on Mobile: Control Panel (4 cols) */}
              <div
                className={`lg:col-span-4 xl:col-span-4 flex flex-col gap-4 order-2 lg:order-1 ${
                  mobileFreeTab === 'graph' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <ControlPanel
                  inequality={inequality}
                  onInequalityChange={setInequality}
                  pointM={pointM}
                  onPointChange={setPointM}
                  shadingMode={shadingMode}
                  onShadingModeChange={setShadingMode}
                  onReset={handleResetToDefault}
                />
              </div>

              {/* Center Column on Desktop / First on Mobile: Interactive Graph Canvas (8 cols) */}
              <div
                className={`lg:col-span-8 xl:col-span-8 flex flex-col gap-4 sm:gap-5 order-1 lg:order-2 ${
                  mobileFreeTab === 'controls' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <GraphCanvas
                  inequality={inequality}
                  pointM={pointM}
                  onPointChange={setPointM}
                  shadingMode={shadingMode}
                />

                {/* Explanation & Steps Panel */}
                <ExplanationPanel
                  result={evalResult}
                  inequality={inequality}
                  pointM={pointM}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
