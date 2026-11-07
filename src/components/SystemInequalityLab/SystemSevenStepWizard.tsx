import React, { useState, useMemo, useEffect } from 'react';
import { Point2D, StepNumber, SystemAnalysisResult, SystemInequality } from '../../types/math';
import { formatBoundaryLine, formatInequality, getOperatorSymbol } from '../../math/mathEngine';
import { parseCoordinateInput, formatFractionOrDecimal } from '../../math/systemMathEngine';
import { SystemGraphCanvas } from '../../graph/SystemGraphCanvas';
import { OptiMascot } from '../../mascot/OptiMascot';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Copy,
  Layers,
  Check,
  Compass,
  Sliders,
  Volume2,
  VolumeX,
  Target,
  Calculator,
  Eye,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SystemSevenStepWizardProps {
  system: SystemInequality[];
  analysis: SystemAnalysisResult;
  onSystemChange: (newSystem: SystemInequality[]) => void;
  onSelectPreset: (presetId: string) => void;
  onSwitchToSandbox: () => void;
}

const SYSTEM_STEP_TITLES = [
  { num: 1, title: 'Nhận diện hệ bất phương trình & Đường biên', desc: 'Phân biệt BPT ràng buộc và phương trình đường biên', short: '1. Nhận diện' },
  { num: 2, title: 'Biểu diễn từng miền nghiệm riêng lẻ', desc: 'Quan sát các nửa mặt phẳng độc lập trên Oxy', short: '2. Miền riêng' },
  { num: 3, title: 'Dự đoán miền nghiệm chung', desc: 'Phỏng đoán đặc điểm: bị chặn, không bị chặn, rỗng hay suy biến', short: '3. Dự đoán' },
  { num: 4, title: 'Tìm tọa độ giao điểm các đường bờ', desc: 'Học sinh tự tính tọa độ giao điểm của các cặp bờ', short: '4. Tính giao điểm' },
  { num: 5, title: 'Kiểm tra & Lọc các giao điểm', desc: 'Học sinh tự lọc điểm hợp lệ hoặc bị loại', short: '5. Lọc đỉnh' },
  { num: 6, title: 'Xác định các đỉnh & Phân loại miền', desc: 'Nhận diện đa giác bị chặn, miền mở hoặc suy biến', short: '6. Các đỉnh' },
  { num: 7, title: 'Tổng kết & Kết luận chuẩn SGK', desc: 'Bản kết luận sư phạm Toán 10 và luyện tập', short: '7. Kết luận' }
];

export const SystemSevenStepWizard: React.FC<SystemSevenStepWizardProps> = ({
  system,
  analysis,
  onSystemChange,
  onSelectPreset,
  onSwitchToSandbox
}) => {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<StepNumber>>(new Set());

  // Step 3: Prediction state (4 cases per Prompt 06A)
  const [predictedType, setPredictedType] = useState<'bounded' | 'unbounded' | 'empty' | 'degenerate' | null>(null);
  const [step3Feedback, setStep3Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Step 4: Student Coordinate Calculation state
  // Records student inputs, hints, solved state for each intersection
  const [studentInterCalcs, setStudentInterCalcs] = useState<
    Record<
      string,
      {
        inputX: string;
        inputY: string;
        isSolved: boolean;
        showHint: boolean;
        showSolution: boolean;
        feedback?: { isCorrect: boolean; message: string };
      }
    >
  >({});
  const [activeInterId, setActiveInterId] = useState<string | null>(null);

  // Step 5: Student Filtering state
  // Records student's choice: 'feasible' vs 'infeasible' for each intersection
  const [studentFilters, setStudentFilters] = useState<
    Record<
      string,
      {
        choice: 'feasible' | 'infeasible' | null;
        isVerified: boolean;
        isCorrect?: boolean;
        showDetails: boolean;
      }
    >
  >({});

  // Test point M state
  const [pointM, setPointM] = useState<Point2D>({ x: 1, y: 1 });
  const [highlightVertex, setHighlightVertex] = useState<Point2D | null>(null);

  // Layer toggles
  const [activeConstraintLayer, setActiveConstraintLayer] = useState<number | 'all'>('all');

  // Opti Mascot controls & hints
  const [optiHintTier, setOptiHintTier] = useState<1 | 2 | 3>(1);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Initialize or reset step 4 and step 5 states when intersections change
  useEffect(() => {
    if (analysis.intersections.length > 0) {
      if (!activeInterId || !analysis.intersections.some(i => i.id === activeInterId)) {
        setActiveInterId(analysis.intersections[0].id);
      }
    }
  }, [analysis.intersections, activeInterId]);

  // Navigation handlers
  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(s => (s + 1) as StepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(s => (s - 1) as StepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // STEP 1 VERIFY
  const handleVerifyStep1 = () => {
    setCompletedSteps(prev => new Set(prev).add(1));
    setCurrentStep(2);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  };

  // STEP 2 VERIFY
  const handleVerifyStep2 = () => {
    setCompletedSteps(prev => new Set(prev).add(2));
    setCurrentStep(3);
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
  };

  // STEP 3 VERIFY PREDICTION (4 cases)
  const handleVerifyStep3 = () => {
    if (!predictedType) {
      setStep3Feedback({ isCorrect: false, message: 'Vui lòng chọn một dự đoán trước khi kiểm chứng!' });
      return;
    }

    const actual = analysis.regionType;
    let isCorrect = false;

    if (predictedType === 'bounded' && actual === 'bounded_polygon') isCorrect = true;
    else if (predictedType === 'unbounded' && actual === 'unbounded') isCorrect = true;
    else if (predictedType === 'empty' && actual === 'empty') isCorrect = true;
    else if (predictedType === 'degenerate' && (actual === 'degenerate_point' || actual === 'degenerate_segment')) isCorrect = true;

    if (isCorrect) {
      setStep3Feedback({
        isCorrect: true,
        message: `Dự đoán chính xác! ${analysis.description}`
      });
      setCompletedSteps(prev => new Set(prev).add(3));
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
    } else {
      setStep3Feedback({
        isCorrect: false,
        message: `Chưa chính xác! Dựa vào các đường biên và hướng nửa mặt phẳng, miền nghiệm thực tế là: ${analysis.description}`
      });
    }
  };

  // STEP 4: Check student coordinate calculation for active intersection
  const handleCheckCoordinate = (interId: string) => {
    const inter = analysis.intersections.find(i => i.id === interId);
    if (!inter) return;

    const currentCalc = studentInterCalcs[interId] || {
      inputX: '',
      inputY: '',
      isSolved: false,
      showHint: false,
      showSolution: false
    };

    const parsedX = parseCoordinateInput(currentCalc.inputX);
    const parsedY = parseCoordinateInput(currentCalc.inputY);

    if (parsedX === null || parsedY === null) {
      setStudentInterCalcs(prev => ({
        ...prev,
        [interId]: {
          ...currentCalc,
          feedback: {
            isCorrect: false,
            message: 'Vui lòng nhập đầy đủ giá trị số hoặc phân số hợp lệ cho x và y (ví dụ: 2, 2.5 hoặc 5/2)!'
          }
        }
      }));
      return;
    }

    const eps = 1e-4;
    const isXCorrect = Math.abs(parsedX - inter.point.x) < eps;
    const isYCorrect = Math.abs(parsedY - inter.point.y) < eps;

    if (isXCorrect && isYCorrect) {
      setStudentInterCalcs(prev => ({
        ...prev,
        [interId]: {
          ...currentCalc,
          isSolved: true,
          feedback: {
            isCorrect: true,
            message: `Hoàn toàn chính xác! Giao điểm của ${inter.lineLabels[0]} và ${inter.lineLabels[1]} là (${inter.point.x}; ${inter.point.y}).`
          }
        }
      }));
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
    } else {
      setStudentInterCalcs(prev => ({
        ...prev,
        [interId]: {
          ...currentCalc,
          feedback: {
            isCorrect: false,
            message: `Chưa chính xác! ${!isXCorrect ? 'Tọa độ x chưa đúng. ' : ''}${!isYCorrect ? 'Tọa độ y chưa đúng. ' : ''}Hãy thử lại hoặc bấm "Xem gợi ý".`
          }
        }
      }));
    }
  };

  // STEP 4: Reveal solution for a specific intersection
  const handleRevealSolution = (interId: string) => {
    const inter = analysis.intersections.find(i => i.id === interId);
    if (!inter) return;

    setStudentInterCalcs(prev => ({
      ...prev,
      [interId]: {
        ...(prev[interId] || { inputX: '', inputY: '', isSolved: false, showHint: false, showSolution: false }),
        inputX: String(inter.point.x),
        inputY: String(inter.point.y),
        isSolved: true,
        showSolution: true,
        feedback: {
          isCorrect: true,
          message: `Đã hiện lời giải chuẩn: (${inter.point.x}; ${inter.point.y}).`
        }
      }
    }));
  };

  // STEP 4: Auto-fill all coordinates (quick mode / teacher)
  const handleAutoFillAllStep4 = () => {
    const next: Record<string, any> = {};
    for (const inter of analysis.intersections) {
      next[inter.id] = {
        inputX: String(inter.point.x),
        inputY: String(inter.point.y),
        isSolved: true,
        showHint: false,
        showSolution: true,
        feedback: {
          isCorrect: true,
          message: `Tọa độ: (${inter.point.x}; ${inter.point.y})`
        }
      };
    }
    setStudentInterCalcs(next);
  };

  const solvedIntersectionsCount = analysis.intersections.filter(
    i => studentInterCalcs[i.id]?.isSolved
  ).length;

  const handleVerifyStep4 = () => {
    setCompletedSteps(prev => new Set(prev).add(4));
    setCurrentStep(5);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  // STEP 5: Student Filter choice for an intersection
  const handleSelectFilterChoice = (interId: string, choice: 'feasible' | 'infeasible') => {
    const inter = analysis.intersections.find(i => i.id === interId);
    if (!inter) return;

    const isCorrect = (choice === 'feasible' && inter.isFeasible) || (choice === 'infeasible' && !inter.isFeasible);

    setStudentFilters(prev => ({
      ...prev,
      [interId]: {
        choice,
        isVerified: true,
        isCorrect,
        showDetails: true
      }
    }));

    if (isCorrect) {
      confetti({ particleCount: 20, spread: 40, origin: { y: 0.6 } });
    }
  };

  // STEP 5: Auto verify all filters
  const handleAutoVerifyAllStep5 = () => {
    const next: Record<string, any> = {};
    for (const inter of analysis.intersections) {
      next[inter.id] = {
        choice: inter.isFeasible ? 'feasible' : 'infeasible',
        isVerified: true,
        isCorrect: true,
        showDetails: false
      };
    }
    setStudentFilters(next);
  };

  const verifiedFiltersCount = analysis.intersections.filter(
    i => studentFilters[i.id]?.isVerified
  ).length;

  const handleVerifyStep5 = () => {
    setCompletedSteps(prev => new Set(prev).add(5));
    setCurrentStep(6);
    confetti({ particleCount: 45, spread: 65, origin: { y: 0.7 } });
  };

  // STEP 6: Verify Vertices
  const handleVerifyStep6 = () => {
    setCompletedSteps(prev => new Set(prev).add(6));
    setCurrentStep(7);
    confetti({ particleCount: 55, spread: 70, origin: { y: 0.7 } });
  };

  // STEP 7: Copy SGK Conclusion
  const handleCopyConclusion = () => {
    const formalText = `KẾT LUẬN MIỀN NGHIỆM CỦA HỆ BẤT PHƯƠNG TRÌNH:
Hệ gồm ${system.length} bất phương trình:
${system.map((s, idx) => `Ràng buộc (${idx + 1}): ${formatInequality(s)} [Đường bờ ${s.label || `(d${idx + 1})`}: ${formatBoundaryLine(s.a, s.b, s.c)}]`).join('\n')}

${analysis.sgkSummary}
Các đỉnh của miền nghiệm: ${
      analysis.feasibleVertices.length > 0
        ? analysis.feasibleVertices.map((p, i) => `Đỉnh ${i + 1}(${p.x}; ${p.y})`).join(', ')
        : 'Không có đỉnh hữu hạn'
    }
Đặc điểm: ${analysis.description}`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(formalText);
      setCopyToast('Đã sao chép kết luận chuẩn SGK Toán 10 vào bộ nhớ tạm!');
      setTimeout(() => setCopyToast(null), 3000);
    }
  };

  // Opti voice
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (speechEnabled) {
      window.speechSynthesis.cancel();
      setSpeechEnabled(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(analysis.sgkSummary);
    utterance.lang = 'vi-VN';
    utterance.onend = () => setSpeechEnabled(false);
    setSpeechEnabled(true);
    window.speechSynthesis.speak(utterance);
  };

  // Opti Guidance Content for current step
  const optiGuidance = useMemo(() => {
    switch (currentStep) {
      case 1:
        return {
          text: 'Chào bạn! Hãy phân biệt rõ giữa Bất phương trình ràng buộc (mang dấu ≤, <, ≥, >) và Phương trình đường biên bờ (dấu bằng =). Đường bờ là nét liền hay nét đứt sẽ quyết định miền nghiệm có lấy bờ hay không.',
          hints: {
            tier1: 'Kiểm tra hệ số a và b của các bất phương trình có đồng thời bằng 0 không?',
            tier2: 'Mỗi bất phương trình có dạng ax + by ≤ c, đường thẳng bờ tương ứng là ax + by = c.',
            tier3: 'Dấu ≤, ≥ vẽ bằng nét liền (kể cả bờ); dấu <, > vẽ bằng nét đứt (không kể bờ).'
          }
        };
      case 2:
        return {
          text: 'Mỗi bất phương trình xác định một nửa mặt phẳng riêng biệt. Hãy bấm vào các nút bên dưới để quan sát từng miền riêng rẽ trên hệ trục tọa độ Oxy nhé!',
          hints: {
            tier1: 'Tại sao cần quan sát từng miền riêng lẻ trước?',
            tier2: 'Mỗi đường thẳng bờ chia mặt phẳng Oxy thành hai nửa mặt phẳng đối xứng.',
            tier3: 'Miền nghiệm của hệ sẽ là phần giao nhau (chồng lấn) của tất cả các nửa mặt phẳng này.'
          }
        };
      case 3:
        return {
          text: 'Dựa vào vị trí các đường biên và hướng nửa mặt phẳng, bạn hãy dự đoán xem miền giao chung có đặc điểm gì: là Đa giác bị chặn, Miền mở không bị chặn, Miền rỗng ∅ hay Miền suy biến?',
          hints: {
            tier1: 'Quan sát phần màu chồng lấn trên hệ trục Oxy.',
            tier2: 'Nếu các đường bờ bao kín một vùng hữu hạn, đó là miền đa giác bị chặn (tam giác, tứ giác...).',
            tier3: 'Nếu các nửa mặt phẳng hướng ra vô tận mà không bị chặn hết các phía, đó là miền không bị chặn.'
          }
        };
      case 4:
        return {
          text: 'Bây giờ là lúc tự tay tính toán! Hãy chọn từng cặp đường thẳng bờ, giải hệ phương trình 2 ẩn để tìm tọa độ giao điểm (x; y). Bạn có thể bấm "Xem gợi ý" nếu cần trợ giúp.',
          hints: {
            tier1: 'Làm thế nào để tìm giao điểm của hai đường thẳng bờ (di) và (dj)?',
            tier2: 'Giải hệ 2 phương trình: a1*x + b1*y = c1 và a2*x + b2*y = c2 bằng phương pháp thế hoặc cộng đại số.',
            tier3: 'Công thức Cramer: D = a1*b2 - a2*b1; Dx = c1*b2 - c2*b1; Dy = a1*c2 - a2*c1. Nếu D ≠ 0 thì x = Dx/D, y = Dy/D.'
          }
        };
      case 5:
        return {
          text: 'Không phải giao điểm nào cũng là đỉnh của miền nghiệm! Bạn hãy kiểm tra tọa độ từng điểm: nếu điểm thỏa mãn toàn bộ các BPT thì bấm "Đỉnh hợp lệ", nếu vi phạm bấm "Bị loại" nhé!',
          hints: {
            tier1: 'Tại sao có những giao điểm lại bị loại khỏi miền nghiệm?',
            tier2: 'Giao điểm của 2 đường bờ chỉ là đỉnh nếu nó không vi phạm bất kỳ bất phương trình nào khác trong hệ.',
            tier3: 'Thay tọa độ (x; y) vào từng BPT. Nếu có dù chỉ 1 BPT không thỏa mãn, điểm đó lập tức bị loại!'
          }
        };
      case 6:
        return {
          text: 'Tuyệt vời! Hệ thống đã tự động liên kết các đỉnh hợp lệ theo thứ tự ngược chiều kim đồng hồ quanh trọng tâm để tạo thành chu vi đa giác nghiệm.',
          hints: {
            tier1: 'Các đỉnh hợp lệ được gọi tên như thế nào?',
            tier2: 'Gốc tọa độ O(0;0) nếu là đỉnh sẽ được đặt tên O, các đỉnh khác lần lượt là A, B, C, D...',
            tier3: 'Miền nghiệm của hệ bất phương trình bậc nhất hai ẩn luôn là một miền lồi.'
          }
        };
      case 7:
        return {
          text: 'Chúc mừng bạn đã hoàn thành xuất sắc 7 bước! Hãy đọc kỹ bản kết luận chuẩn mực SGK Toán 10 và bấm "Sao chép kết luận" để lưu lại bài học nhé.',
          hints: {
            tier1: 'Cần ghi nhớ gì trong bản kết luận SGK?',
            tier2: 'Kết luận phải nêu rõ miền nghiệm là hình gì (tam giác, tứ giác...), tọa độ các đỉnh và tính chất lấy bờ hay không lấy bờ.',
            tier3: 'Bạn có thể chuyển sang chế độ "Tự do" để thử nghiệm các hệ bất phương trình khác bất kỳ!'
          }
        };
      default:
        return {
          text: 'Hãy tiếp tục khám phá phòng thí nghiệm Toán học cùng Opti!',
          hints: { tier1: '', tier2: '', tier3: '' }
        };
    }
  }, [currentStep]);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* 1. COMPACT PROGRESS BAR / STEPPER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
            <h2 className="font-extrabold text-xs sm:text-sm md:text-base text-slate-900 truncate">
              Quy Trình 7 Bước Giải Hệ Bất Phương Trình Chuẩn SGK Toán 10
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 hidden sm:inline shrink-0">
              Bước {currentStep}/7
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
            {Math.round((currentStep / 7) * 100)}%
          </span>
        </div>

        {/* 7-Segment Stepper Buttons */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {SYSTEM_STEP_TITLES.map(st => {
            const isCurr = currentStep === st.num;
            const isComp = completedSteps.has(st.num as StepNumber);
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num as StepNumber)}
                className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border text-center transition cursor-pointer ${
                  isCurr
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : isComp
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-[11px] font-extrabold">{isComp && !isCurr ? '✓' : st.num}</span>
                <span className="text-[10px] truncate hidden md:inline font-medium">{st.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. COMPACT OPTI ASSISTANT BANNER */}
      <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 rounded-2xl border border-blue-200 p-3 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <OptiMascot expression="happy" actionState="nod" size={36} />
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-600 text-white block w-fit mb-0.5">
                Opti Hướng Dẫn Bước {currentStep}
              </span>
              <p className="text-xs text-slate-800 font-medium line-clamp-2">
                {optiGuidance.text}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleSpeak}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 cursor-pointer shadow-xs min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Đọc kết luận SGK"
            >
              {speechEnabled ? <VolumeX className="w-3.5 h-3.5 text-blue-600 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 3-Tier Hints Selector */}
        <div className="pt-2 border-t border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-blue-900 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Gợi ý Opti:
            </span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-blue-200">
              <button
                type="button"
                onClick={() => setOptiHintTier(1)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                  optiHintTier === 1 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cấp 1: Định hướng
              </button>
              <button
                type="button"
                onClick={() => setOptiHintTier(2)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                  optiHintTier === 2 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cấp 2: Phương pháp
              </button>
              <button
                type="button"
                onClick={() => setOptiHintTier(3)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                  optiHintTier === 3 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cấp 3: Chi tiết
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-700 italic bg-white/70 px-2 py-0.5 rounded-md border border-blue-100 max-w-full">
            {optiHintTier === 1 && optiGuidance.hints.tier1}
            {optiHintTier === 2 && optiGuidance.hints.tier2}
            {optiHintTier === 3 && optiGuidance.hints.tier3}
          </div>
        </div>
      </div>

      {/* 3. MULTI-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Active Step Controller (xl: 5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-3.5 order-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-blue-600">Bước {currentStep} của 7</span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{SYSTEM_STEP_TITLES[currentStep - 1].title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{SYSTEM_STEP_TITLES[currentStep - 1].desc}</p>
              </div>
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center font-mono text-sm border border-blue-100">
                0{currentStep}
              </span>
            </div>

            {/* STEP 1: NHẬN DIỆN VÀ PHÂN BIỆT BPT VS ĐƯỜNG BIÊN */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hệ hiện tại gồm <strong>{system.length} bất phương trình</strong>. Quan sát sự phân biệt rõ ràng giữa{' '}
                  <span className="font-bold text-blue-700">Bất phương trình ràng buộc</span> và{' '}
                  <span className="font-bold text-slate-800">Phương trình đường biên bờ</span>:
                </p>

                <div className="flex flex-col gap-2">
                  {system.map((ineq, idx) => {
                    const isSolid = ineq.op === '<=' || ineq.op === '>=';
                    const lineEq = formatBoundaryLine(ineq.a, ineq.b, ineq.c);
                    return (
                      <div
                        key={ineq.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5 text-xs hover:border-blue-300 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: ineq.color }} />
                            <span className="font-mono font-bold text-slate-800">Ràng buộc ({idx + 1}):</span>
                            <span className="font-mono font-extrabold text-blue-900 text-sm">{formatInequality(ineq)}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSolid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isSolid ? 'Lấy cả bờ' : 'Không lấy bờ'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pl-5 border-t border-slate-200/60 pt-1">
                          <span>
                            Đường biên bờ <strong>{ineq.label || `(d${idx + 1})`}</strong>: <span className="font-mono font-bold text-slate-700">{lineEq}</span>
                          </span>
                          <span className="font-medium italic">
                            ({isSolid ? 'Vẽ nét liền —' : 'Vẽ nét đứt - - -'})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950">
                  <span className="font-bold block mb-1">Quy tắc sư phạm SGK Toán 10:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-blue-900">
                    <li>Dấu <strong>≤ hoặc ≥</strong>: Điểm nằm trên đường bờ thuộc miền nghiệm (vẽ nét liền).</li>
                    <li>Dấu <strong>&lt; hoặc &gt;</strong>: Điểm nằm trên đường bờ bị LOẠI khỏi miền nghiệm (vẽ nét đứt).</li>
                  </ul>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleVerifyStep1}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer min-h-[44px]"
                  >
                    <span>Kiểm tra & Sang Bước 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: BIỂU DIỄN TỪNG MIỀN RIÊNG LẺ */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bấm vào từng thẻ bên dưới để quan sát nửa mặt phẳng miền nghiệm của từng bất phương trình riêng rẽ trước khi lấy phần giao:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveConstraintLayer('all')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                      activeConstraintLayer === 'all'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-extrabold">Tất cả các miền</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Hiển thị toàn bộ các lớp nửa mặt phẳng</div>
                  </button>

                  {system.map((ineq, idx) => (
                    <button
                      key={ineq.id}
                      type="button"
                      onClick={() => setActiveConstraintLayer(idx)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                        activeConstraintLayer === idx
                          ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-300 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ineq.color }} />
                        <span>BPT ({idx + 1}): {formatInequality(ineq)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Bờ {ineq.label || `(d${idx + 1})`}: {formatBoundaryLine(ineq.a, ineq.b, ineq.c)}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyStep2}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer min-h-[44px]"
                  >
                    <span>Sang Bước 3 (Dự đoán)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DỰ ĐOÁN MIỀN GIAO (4 CASES) */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dựa vào các đường biên và hướng nửa mặt phẳng trên hệ trục, hãy <strong>dự đoán đặc điểm miền nghiệm chung</strong> của hệ:
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setPredictedType('bounded')}
                    className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                      predictedType === 'bounded'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-emerald-900">A. Miền đa giác bị chặn (tam giác, tứ giác, ngũ giác)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Các nửa mặt phẳng giao nhau tạo thành một hình đa giác đóng kín có chu vi hữu hạn.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPredictedType('unbounded')}
                    className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                      predictedType === 'unbounded'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-300 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-amber-900">B. Miền mở không bị chặn (kéo dài vô tận)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Miền nghiệm mở rộng vô hạn về ít nhất một phía của mặt phẳng Oxy.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPredictedType('empty')}
                    className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                      predictedType === 'empty'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-300 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-rose-900">C. Miền nghiệm rỗng (tập ∅, hệ vô nghiệm)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Các nửa mặt phẳng không có bất kỳ điểm chung nào (mâu thuẫn nhau).</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPredictedType('degenerate')}
                    className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                      predictedType === 'degenerate'
                        ? 'border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-300 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-purple-900">D. Miền nghiệm suy biến (thành 1 điểm hoặc đoạn thẳng)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Các bất phương trình ép miền nghiệm thành đường thẳng, đoạn thẳng hoặc điểm đơn lẻ.</div>
                  </button>
                </div>

                {step3Feedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      step3Feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {step3Feedback.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    <span>{step3Feedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handlePrevStep} className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyStep3}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                    >
                      Kiểm chứng dự đoán
                    </button>
                    {completedSteps.has(3) && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                      >
                        <span>Sang Bước 4</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: TỰ TÍNH TỌA ĐỘ GIAO ĐIỂM (STUDENT INTERACTIVE CALCULATION) */}
            {currentStep === 4 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Học sinh tự giải hệ phương trình từng cặp bờ để tìm tọa độ giao điểm:
                  </p>
                  <button
                    type="button"
                    onClick={handleAutoFillAllStep4}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Tự động điền tất cả
                  </button>
                </div>

                {/* Progress badge */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-bold">
                  <span>Tiến độ tính tọa độ giao điểm:</span>
                  <span className="font-mono">
                    {solvedIntersectionsCount}/{analysis.intersections.length} giao điểm
                  </span>
                </div>

                {/* Pairwise Intersections Interactive List */}
                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                  {analysis.intersections.map((inter, idx) => {
                    const calc = studentInterCalcs[inter.id] || {
                      inputX: '',
                      inputY: '',
                      isSolved: false,
                      showHint: false,
                      showSolution: false
                    };
                    const isSelected = activeInterId === inter.id;

                    return (
                      <div
                        key={inter.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-white shadow-xs ring-1 ring-blue-300'
                            : calc.isSolved
                            ? 'border-emerald-200 bg-emerald-50/40'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        {/* Title of Pair */}
                        <div
                          onClick={() => {
                            setActiveInterId(inter.id);
                            setHighlightVertex(inter.point);
                          }}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                                calc.isSolved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {calc.isSolved ? '✓' : idx + 1}
                            </span>
                            <span className="font-bold text-xs text-slate-800">
                              {inter.lineLabels[0]} ∩ {inter.lineLabels[1]}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {calc.isSolved ? (
                              <span className="font-mono font-bold text-emerald-800 text-xs bg-emerald-100 px-2 py-0.5 rounded">
                                ({inter.point.x}; {inter.point.y})
                              </span>
                            ) : (
                              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                (? ; ?)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Line Equations */}
                        <div className="text-[11px] text-slate-500 font-mono mt-1 pl-7">
                          {inter.lineEquations ? `${inter.lineEquations[0]}  và  ${inter.lineEquations[1]}` : ''}
                        </div>

                        {/* Interactive Calculation form when selected or unsolved */}
                        {isSelected && !calc.isSolved && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-2.5 pl-7">
                            <div className="text-[11px] text-slate-700 font-medium">
                              Nhập tọa độ giao điểm (hỗ trợ số thập phân hoặc phân số như 5/2):
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <label className="font-mono font-bold text-xs text-slate-600">x =</label>
                                <input
                                  type="text"
                                  value={calc.inputX}
                                  placeholder="Ví dụ: 2"
                                  onChange={e =>
                                    setStudentInterCalcs(prev => ({
                                      ...prev,
                                      [inter.id]: { ...(prev[inter.id] || calc), inputX: e.target.value }
                                    }))
                                  }
                                  className="w-20 px-2 py-1 text-center font-bold text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div className="flex items-center gap-1.5">
                                <label className="font-mono font-bold text-xs text-slate-600">y =</label>
                                <input
                                  type="text"
                                  value={calc.inputY}
                                  placeholder="Ví dụ: 4"
                                  onChange={e =>
                                    setStudentInterCalcs(prev => ({
                                      ...prev,
                                      [inter.id]: { ...(prev[inter.id] || calc), inputY: e.target.value }
                                    }))
                                  }
                                  className="w-20 px-2 py-1 text-center font-bold text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleCheckCoordinate(inter.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
                              >
                                Kiểm tra
                              </button>
                            </div>

                            {calc.feedback && (
                              <div
                                className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                                  calc.feedback.isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                                }`}
                              >
                                {calc.feedback.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                                <span>{calc.feedback.message}</span>
                              </div>
                            )}

                            {/* Hint and Solution toggles */}
                            <div className="flex items-center gap-2 pt-1 text-[11px]">
                              <button
                                type="button"
                                onClick={() =>
                                  setStudentInterCalcs(prev => ({
                                    ...prev,
                                    [inter.id]: { ...(prev[inter.id] || calc), showHint: !calc.showHint }
                                  }))
                                }
                                className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <HelpCircle className="w-3 h-3" />
                                <span>{calc.showHint ? 'Ẩn gợi ý' : 'Xem gợi ý cách giải'}</span>
                              </button>

                              <span>•</span>

                              <button
                                type="button"
                                onClick={() => handleRevealSolution(inter.id)}
                                className="text-amber-700 hover:underline font-semibold cursor-pointer"
                              >
                                Hiện lời giải chi tiết
                              </button>
                            </div>

                            {calc.showHint && (
                              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                                <strong>Gợi ý:</strong> Thiết lập hệ 2 phương trình bờ và dùng phương pháp thế hoặc công thức Cramer.
                                Ví dụ: rút x theo y từ phương trình thứ nhất rồi thế vào phương trình thứ hai.
                              </div>
                            )}

                            {calc.showSolution && inter.cramerSteps && (
                              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[10px] whitespace-pre-wrap">
                                {inter.cramerSteps.explanation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handlePrevStep} className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyStep4}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                  >
                    <span>Sang Bước 5 (Lọc các đỉnh)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: TỰ LỌC CÁC GIAO ĐIỂM (STUDENT FILTERING & SUBSTITUTION) */}
            {currentStep === 5 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Học sinh tự xác định mỗi giao điểm là <strong>Đỉnh hợp lệ</strong> hay <strong>Bị loại</strong>:
                  </p>
                  <button
                    type="button"
                    onClick={handleAutoVerifyAllStep5}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Kiểm chứng tất cả
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-bold">
                  <span>Tiến độ lọc giao điểm:</span>
                  <span className="font-mono">
                    {verifiedFiltersCount}/{analysis.intersections.length} điểm đã kiểm tra
                  </span>
                </div>

                {/* Filter List */}
                <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {analysis.intersections.map(inter => {
                    const filter = studentFilters[inter.id] || {
                      choice: null,
                      isVerified: false,
                      showDetails: false
                    };

                    return (
                      <div
                        key={inter.id}
                        className={`p-3 rounded-xl border transition-all ${
                          !filter.isVerified
                            ? 'border-slate-200 bg-slate-50/80'
                            : filter.isCorrect
                            ? inter.isFeasible
                              ? 'border-emerald-300 bg-emerald-50/70'
                              : 'border-rose-300 bg-rose-50/70'
                            : 'border-amber-300 bg-amber-50/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {inter.lineLabels[0]} ∩ {inter.lineLabels[1]}:
                            </span>
                            <span className="font-mono font-extrabold text-blue-900 text-xs">
                              ({inter.point.x}; {inter.point.y})
                            </span>
                          </div>

                          {filter.isVerified && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                inter.isFeasible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {inter.isFeasible ? '✓ Đỉnh hợp lệ' : '✗ Bị loại'}
                            </span>
                          )}
                        </div>

                        {/* Interactive Selection Buttons (Only colorized after verification) */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectFilterChoice(inter.id, 'feasible')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                              filter.choice === 'feasible'
                                ? filter.isVerified
                                  ? inter.isFeasible
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-rose-600 text-white border-rose-600'
                                  : 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Thỏa mãn hệ (Đỉnh)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectFilterChoice(inter.id, 'infeasible')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                              filter.choice === 'infeasible'
                                ? filter.isVerified
                                  ? !inter.isFeasible
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-rose-600 text-white border-rose-600'
                                  : 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Bị loại (Vi phạm)</span>
                          </button>
                        </div>

                        {/* Detailed Substitution Table upon verification */}
                        {filter.isVerified && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] space-y-1">
                            <span className="font-semibold text-slate-700 block">
                              Kết quả thay ({inter.point.x}; {inter.point.y}) vào các BPT:
                            </span>

                            <div className="flex flex-col gap-1">
                              {system.map((ineq, cIdx) => {
                                const lhs = Math.round((ineq.a * inter.point.x + ineq.b * inter.point.y) * 100) / 100;
                                const isSatisfied = !inter.violatedConstraints.includes(cIdx);

                                return (
                                  <div
                                    key={ineq.id}
                                    className={`flex items-center justify-between px-2 py-0.5 rounded text-[10px] font-mono ${
                                      isSatisfied ? 'bg-white/80 text-emerald-900' : 'bg-rose-100/80 text-rose-900 font-bold'
                                    }`}
                                  >
                                    <span>
                                      BPT ({cIdx + 1}): {ineq.a}×({inter.point.x}) + {ineq.b}×({inter.point.y}) = {lhs} {ineq.op} {ineq.c}
                                    </span>
                                    <span>{isSatisfied ? '✓ Đúng' : '✗ Sai (Vi phạm)'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handlePrevStep} className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyStep5}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                  >
                    <span>Sang Bước 6 (Xác định các đỉnh)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: XÁC ĐỊNH ĐỈNH & PHÂN LOẠI MIỀN */}
            {currentStep === 6 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tổng hợp các đỉnh hợp lệ và phân loại chính xác hình dạng miền nghiệm:
                </p>

                {/* Case 1: Bounded Polygon */}
                {analysis.regionType === 'bounded_polygon' && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Miền đa giác bị chặn ({analysis.orderedPolygon.length} đỉnh)</span>
                    </div>
                    <p className="leading-relaxed">{analysis.description}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {analysis.orderedPolygon.map((p, idx) => (
                        <span
                          key={idx}
                          onMouseEnter={() => setHighlightVertex(p)}
                          onMouseLeave={() => setHighlightVertex(null)}
                          className="px-2 py-1 rounded-lg bg-white border border-emerald-300 font-mono font-bold text-emerald-900 cursor-pointer shadow-xs hover:bg-emerald-100"
                        >
                          Đỉnh {idx + 1}: ({p.x}; {p.y})
                        </span>
                      ))}
                    </div>
                    {analysis.area && (
                      <div className="text-[11px] font-semibold text-emerald-800 pt-1">
                        Diện tích đa giác miền nghiệm S ≈ {analysis.area} (đơn vị diện tích).
                      </div>
                    )}
                  </div>
                )}

                {/* Case 2: Unbounded */}
                {analysis.regionType === 'unbounded' && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <Compass className="w-4 h-4 text-amber-600" />
                      <span>Miền nghiệm mở không bị chặn</span>
                    </div>
                    <p className="leading-relaxed">{analysis.description}</p>
                    {analysis.feasibleVertices.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="font-semibold text-amber-900">Các điểm mốc bờ:</span>
                        {analysis.feasibleVertices.map((p, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-white font-mono text-amber-900 border border-amber-300">
                            ({p.x}; {p.y})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Case 3: Empty */}
                {analysis.regionType === 'empty' && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-rose-900">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Miền nghiệm rỗng (Tập ∅ — Hệ vô nghiệm)</span>
                    </div>
                    <p className="leading-relaxed">{analysis.description}</p>
                    <div className="text-[11px] text-rose-800">
                      Không có bất kỳ điểm nào trên mặt phẳng tọa độ đồng thời thỏa mãn tất cả các bất phương trình.
                    </div>
                  </div>
                )}

                {/* Case 4: Degenerate */}
                {(analysis.regionType === 'degenerate_point' || analysis.regionType === 'degenerate_segment') && (
                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-purple-900">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span>Miền nghiệm suy biến</span>
                    </div>
                    <p className="leading-relaxed">{analysis.description}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handlePrevStep} className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyStep6}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                  >
                    <span>Sang Bước 7 (Tổng kết)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7: TỔNG KẾT & KẾT LUẬN SGK TOÁN 10 */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Bản Kết Luận Sư Phạm Chuẩn SGK Toán 10</span>
                  </div>
                  <p className="leading-relaxed font-medium text-slate-800">{analysis.sgkSummary}</p>

                  <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200 space-y-1 font-mono text-[11px]">
                    <div className="font-bold text-slate-700">Tọa độ các đỉnh của miền nghiệm:</div>
                    <div className="text-emerald-900">
                      {analysis.feasibleVertices.length > 0
                        ? analysis.feasibleVertices.map((p, i) => `Đỉnh ${i + 1}(${p.x}; ${p.y})`).join(', ')
                        : 'Không có đỉnh hữu hạn (miền mở hoặc rỗng)'}
                    </div>
                  </div>

                  <div className="text-[11px] text-emerald-800 italic">
                    Phần tô màu giao nhau nổi bật trên đồ thị Oxy chính là tập nghiệm của toàn bộ hệ bất phương trình.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyConclusion}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-xs text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition min-h-[44px] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sao chép kết luận</span>
                  </button>

                  <button
                    type="button"
                    onClick={onSwitchToSandbox}
                    className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 font-semibold text-xs text-blue-800 flex items-center justify-center gap-1.5 transition min-h-[44px] cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-blue-600" />
                    <span>Thực hành tự do</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setCompletedSteps(new Set());
                      setStudentInterCalcs({});
                      setStudentFilters({});
                      setPredictedType(null);
                      setStep3Feedback(null);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 min-h-[44px] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm lại từ Bước 1</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Xem lại Bước 6</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: System Graph Canvas (xl: 4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-3 order-2">
          <SystemGraphCanvas
            system={system}
            analysis={analysis}
            pointM={pointM}
            onPointMChange={setPointM}
            showPointM={true}
            showCommonFeasibleRegion={currentStep >= 3}
            showIndividualFills={currentStep <= 3 || activeConstraintLayer !== 'all'}
            showBoundaryLines={true}
            showIntersections={currentStep >= 4}
            showFeasibleVerticesOnly={currentStep >= 6}
            highlightVertex={highlightVertex}
          />
        </div>

        {/* RIGHT COLUMN: Benchmark Presets & Live Pedagogical Mascot (xl: 3 cols) */}
        <div className="hidden xl:flex xl:col-span-3 flex-col gap-3.5 order-3">
          <div className="bg-gradient-to-b from-blue-50/80 to-white rounded-2xl border border-blue-200 p-4 shadow-xs flex flex-col items-center text-center">
            <OptiMascot expression="happy" actionState="nod" size={64} />
            <div className="mt-2 font-bold text-sm text-blue-900">Trợ Lý Toán Opti</div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {analysis.description}
            </p>
          </div>

          {/* Quick SGK Presets */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              Thử nghiệm 5 ca mẫu SGK:
            </span>
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'preset-1', name: 'Bài 1: Tứ giác SGK', tag: 'Đa giác bị chặn' },
                { id: 'preset-2', name: 'Bài 2: Miền rỗng (∅)', tag: 'Vô nghiệm' },
                { id: 'preset-3', name: 'Bài 3: Miền mở', tag: 'Không bị chặn' },
                { id: 'preset-4', name: 'Bài 4: Biên mở đứt', tag: 'Dấu <, >' },
                { id: 'preset-5', name: 'Bài 5: Suy biến đoạn', tag: 'Đoạn thẳng' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPreset(p.id)}
                  className="p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition text-xs font-bold text-slate-800 cursor-pointer flex items-center justify-between"
                >
                  <span>{p.name}</span>
                  <span className="text-[10px] font-normal text-slate-500 font-mono">{p.tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
