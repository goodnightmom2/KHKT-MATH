import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BoundaryStyle,
  ComparisonOperator,
  Inequality,
  LearningMode,
  OptiExpression,
  Point2D,
  ShadingMode,
  StepNumber,
  StepHintInfo
} from '../../types/math';
import {
  evaluatePointWithSteps,
  formatBoundaryLine,
  formatExplicitSubstitution,
  formatInequality,
  formatLinearLHS,
  formatNumberClean,
  getBoundaryStyle,
  getOperatorSymbol,
  getSamplePointsOnLine,
  isClosedRegion,
  isPointOnLine
} from '../../math/mathEngine';
import { GraphCanvas } from '../../graph/GraphCanvas';
import { OptiActionState, OptiMascot } from '../../mascot/OptiMascot';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Maximize2,
  Minimize2,
  Check,
  Copy,
  Compass,
  Volume2,
  VolumeX,
  Target,
  Sliders,
  Calculator,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SevenStepWizardProps {
  initialInequality?: Inequality;
  learningMode: LearningMode;
  onLearningModeChange: (mode: LearningMode) => void;
  onSwitchToSandbox: () => void;
}

const STEP_TITLES: { num: StepNumber; title: string; desc: string; short: string }[] = [
  { num: 1, title: 'Nhận diện hệ số', desc: 'Dạng chuẩn ax + by (op) c', short: '1. Hệ số' },
  { num: 2, title: 'Đường biên & Kiểu nét', desc: 'Phương trình bờ (d) & Nét vẽ', short: '2. Kiểu bờ' },
  { num: 3, title: 'Tìm hai điểm A, B', desc: 'Chọn 2 điểm A, B & Vẽ bờ (d)', short: '3. Điểm A, B' },
  { num: 4, title: 'Chọn điểm thử M', desc: 'Chọn M(xM; yM) không thuộc bờ', short: '4. Điểm thử M' },
  { num: 5, title: 'Thay điểm M & Tính toán', desc: 'Thay số vế trái & So sánh với c', short: '5. Tính toán' },
  { num: 6, title: 'Kết luận & Biểu diễn', desc: 'Chọn nửa mặt phẳng nghiệm & Tô miền', short: '6. Miền nghiệm' },
  { num: 7, title: 'Tổng kết & Luyện tập', desc: 'Kết luận chuẩn SGK & 5 ca kiểm thử', short: '7. Tổng kết' }
];

export const TEST_PRESETS: { name: string; tag: string; ineq: Inequality; testHint: string }[] = [
  {
    name: 'Ca A: 2x + y ≤ 6',
    tag: 'SGK Chuẩn (lấy bờ)',
    ineq: { id: 'test-a', a: 2, b: 1, op: '<=', c: 6 },
    testHint: 'Thử M(2;1) thuộc miền nghiệm; M(3;2) không thuộc.'
  },
  {
    name: 'Ca B: x + y < 4',
    tag: 'Nét đứt (thử M(2;2))',
    ineq: { id: 'test-b', a: 1, b: 1, op: '<', c: 4 },
    testHint: 'Đường biên nét đứt. Thử M(2;2): 4 < 4 là sai (không thuộc miền nghiệm).'
  },
  {
    name: 'Ca C: x ≤ 3',
    tag: 'Đường thẳng đứng',
    ineq: { id: 'test-c', a: 1, b: 0, op: '<=', c: 3 },
    testHint: 'Đường biên x = 3 thẳng đứng. Miền nghiệm nằm bên trái bờ.'
  },
  {
    name: 'Ca D: y ≥ -2',
    tag: 'Đường nằm ngang',
    ineq: { id: 'test-d', a: 0, b: 1, op: '>=', c: -2 },
    testHint: 'Đường biên y = -2 nằm ngang. Miền nghiệm nằm phía trên bờ.'
  },
  {
    name: 'Ca E: x + y > 0',
    tag: 'Đi qua gốc O(0;0)',
    ineq: { id: 'test-e', a: 1, b: 1, op: '>', c: 0 },
    testHint: 'O(0;0) nằm trên bờ! Phải dùng điểm thử khác như P(1;0) hoặc Q(0;1).'
  }
];

export const SevenStepWizard: React.FC<SevenStepWizardProps> = ({
  initialInequality = { id: 'default', a: 2, b: 1, op: '<=', c: 6 },
  learningMode,
  onSwitchToSandbox
}) => {
  // Wizard Step
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<StepNumber>>(new Set());

  // Step 1: Inequality Coefficients
  const [ineq, setIneq] = useState<Inequality>(initialInequality);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2: Line style (solid vs dashed)
  const [userLineStyle, setUserLineStyle] = useState<BoundaryStyle | null>(null);
  const [step2Feedback, setStep2Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Step 3: Two points A and B on boundary line + draw line action
  const [pointA, setPointA] = useState<Point2D>({ x: 0, y: 0 });
  const [pointB, setPointB] = useState<Point2D>({ x: 3, y: 0 });
  const [activeTargetPoint, setActiveTargetPoint] = useState<'A' | 'B'>('A');
  const [lineDrawn, setLineDrawn] = useState(false);
  const [step3Feedback, setStep3Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Step 4: Test Point M (independent of A and B, not on boundary line)
  const [testPoint, setTestPoint] = useState<Point2D>({ x: 0, y: 0 });
  const [step4Feedback, setStep4Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Step 5: Substitution and Arithmetic Calculation
  const [userLhsInput, setUserLhsInput] = useState<string>('');
  const [userTruthChoice, setUserTruthChoice] = useState<boolean | null>(null);
  const [step5Feedback, setStep5Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);

  // Step 6: Half-plane selection and Solution Region
  const [selectedSide, setSelectedSide] = useState<'with_test' | 'without_test' | null>(null);
  const [isSideVerifiedCorrect, setIsSideVerifiedCorrect] = useState<boolean | null>(null);
  const [step6Feedback, setStep6Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Shading mode (Solution highlight vs SGK exclusion)
  const [shadingMode, setShadingMode] = useState<ShadingMode>('solution');

  // Opti Mascot UI Controls (Mobile & Desktop)
  const [optiVisible, setOptiVisible] = useState(true);
  const [optiExpanded, setOptiExpanded] = useState(false);
  const [activeHintTier, setActiveHintTier] = useState<1 | 2 | 3 | null>(null);
  const [speechEnabled, setSpeechEnabled] = useState(false);

  // Toast message for copy to clipboard
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Mobile Step Dropdown toggle
  const [showMobileStepList, setShowMobileStepList] = useState(false);

  // Teacher mode controls
  const [teacherRevealAnswers, setTeacherRevealAnswers] = useState(false);
  const [isPresentationExpanded, setIsPresentationExpanded] = useState(false);

  // Re-sync points and reset downstream states when inequality changes
  useEffect(() => {
    const [sampleA, sampleB] = getSamplePointsOnLine(ineq.a, ineq.b, ineq.c);
    setPointA(sampleA);
    setPointB(sampleB);

    // Initial test point: O(0,0) if not on line, else (1,0) or (0,1)
    if (Math.abs(ineq.c) < 1e-6) {
      setTestPoint({ x: 1, y: 0 });
    } else {
      setTestPoint({ x: 0, y: 0 });
    }

    setLineDrawn(false);
    setUserLineStyle(null);
    setUserLhsInput('');
    setUserTruthChoice(null);
    setSelectedSide(null);
    setIsSideVerifiedCorrect(null);
    setShowCalculationDetails(false);

    setStep1Error(null);
    setStep2Feedback(null);
    setStep3Feedback(null);
    setStep4Feedback(null);
    setStep5Feedback(null);
    setStep6Feedback(null);
  }, [ineq]);

  // Mathematical evaluations
  const isClosed = isClosedRegion(ineq.op);
  const expectedLineStyle: BoundaryStyle = getBoundaryStyle(ineq.op);
  const isThroughOrigin = Math.abs(ineq.c) < 1e-6;

  // Check if testPoint lies on boundary line
  const isTestPointOnLine = useMemo(() => {
    return isPointOnLine(ineq.a, ineq.b, ineq.c, testPoint, 1e-4);
  }, [ineq, testPoint]);

  // Substitution evaluation for test point M
  const testSub = useMemo(() => {
    return formatExplicitSubstitution(ineq.a, ineq.b, testPoint.x, testPoint.y);
  }, [ineq, testPoint]);

  const testEval = useMemo(() => {
    return evaluatePointWithSteps(ineq, testPoint);
  }, [ineq, testPoint]);

  // 3-Tier Pedagogical Hints tailored for each of the 7 steps (Socratic for Student, Full Key for Teacher)
  const isTeacher = learningMode === 'teacher';
  const stepHints = useMemo<StepHintInfo>(() => {
    const strAx = formatNumberClean(pointA.x);
    const strAy = formatNumberClean(pointA.y);
    const strBx = formatNumberClean(pointB.x);
    const strBy = formatNumberClean(pointB.y);
    const strMx = formatNumberClean(testPoint.x);
    const strMy = formatNumberClean(testPoint.y);
    const strLhs = formatNumberClean(testSub.totalLhs);

    switch (currentStep) {
      case 1:
        return {
          tier1: 'Bước 1 (Định hướng): Quan sát bất phương trình xem có đúng 2 ẩn x, y bậc nhất không?',
          tier2: 'Bước 1 (Phương pháp): Đối chiếu với dạng chuẩn ax + by ≤ c (hoặc <, ≥, >). Điều kiện bắt buộc là a và b không đồng thời bằng 0 (a² + b² ≠ 0).',
          tier3: `Hướng dẫn chi tiết: Hệ số của x là a = ${ineq.a}, hệ số của y là b = ${ineq.b}, vế phải là c = ${ineq.c}. Vì a và b không cùng bằng 0 nên đây là BPT bậc nhất hai ẩn hợp lệ. Hãy bấm "Kiểm tra & Tiếp tục"!`
        };
      case 2:
        return {
          tier1: 'Bước 2 (Định hướng): Nhìn kỹ dấu bất đẳng thức trong đề bài: có dấu gạch ngang "=" ở dưới hay không?',
          tier2: 'Bước 2 (Phương pháp): Quy tắc SGK Toán 10: Dấu ≤ hoặc ≥ (có dấu "=") → lấy cả đường bờ (vẽ NÉT LIỀN). Dấu < hoặc > (không có dấu "=") → không lấy bờ (vẽ NÉT ĐỨT).',
          tier3: isTeacher
            ? `[Đáp án GV - Bước 2]: Dấu "${getOperatorSymbol(ineq.op)}" → Đường bờ (d): ${formatBoundaryLine(ineq.a, ineq.b, ineq.c)} vẽ bằng NÉT ${expectedLineStyle === 'solid' ? 'LIỀN (Miền đóng)' : 'ĐỨT (Miền mở)'}.`
            : `Hướng dẫn làm Bước 2: Em hãy đối chiếu dấu "${getOperatorSymbol(ineq.op)}" của đề bài với quy tắc ở Gợi ý 2, chọn ô "Nét liền" hoặc "Nét đứt" rồi bấm nút "Kiểm chứng" nhé!`
        };
      case 3:
        return {
          tier1: 'Bước 3 (Định hướng): Để vẽ đường thẳng bờ (d), ta cần xác định tọa độ của 2 điểm phân biệt A và B nằm trên (d).',
          tier2: 'Bước 3 (Phương pháp): Cách dễ nhất: Lần lượt cho y = 0 để tính x = c/a (giao với trục Ox) và cho x = 0 để tính y = c/b (giao với trục Oy). Nếu c = 0 thì chọn A(0; 0) và B(b; -a).',
          tier3: isTeacher
            ? `[Đáp án GV - Bước 3]: Hai điểm chuẩn trên (d): A(${strAx}; ${strAy}) và B(${strBx}; ${strBy}). Thay vào ${formatBoundaryLine(ineq.a, ineq.b, ineq.c)} đều thỏa mãn.`
            : `Hướng dẫn làm Bước 3: Thay tọa độ điểm A và B vào phương trình ${formatBoundaryLine(ineq.a, ineq.b, ineq.c)}. Em có thể tự nhập tọa độ hoặc bấm "Gợi ý 2 điểm cắt trục" rồi ấn "Kiểm tra & Vẽ bờ (d)".`
        };
      case 4:
        return {
          tier1: 'Bước 4 (Định hướng): Điểm thử M dùng để đại diện cho một nửa mặt phẳng. Vậy M có được nằm trên ranh giới (đường bờ d) không?',
          tier2: isThroughOrigin
            ? 'Bước 4 (Phương pháp): Đường bờ (d) đi qua gốc O(0; 0) vì c = 0! Do đó tuyệt đối KHÔNG chọn O(0; 0), hãy chọn P(1; 0) hoặc Q(0; 1).'
            : 'Bước 4 (Phương pháp): Khi đường bờ không đi qua gốc tọa độ (c ≠ 0), ta luôn ưu tiên chọn M là gốc tọa độ O(0; 0) để thay số nhanh nhất.',
          tier3: `Hướng dẫn làm Bước 4: Điểm đang chọn là M(${strMx}; ${strMy}). ${isTestPointOnLine ? 'CẢNH BÁO: Thay M vào phương trình bờ thấy nằm ngay trên bờ! Em hãy chọn điểm khác ngoài bờ nhé.' : 'Điểm M này không nằm trên đường bờ (d), hoàn toàn hợp lệ! Hãy bấm "Xác nhận điểm M".'}`
        };
      case 5:
        return {
          tier1: 'Bước 5 (Định hướng): Thay x = xM và y = yM vào biểu thức vế trái ax + by, thực hiện nhân trước cộng sau.',
          tier2: `Bước 5 (Phương pháp): Tính biểu thức ${testSub.exprWithMul}. Sau khi ra kết quả, hãy đặt cạnh dấu "${getOperatorSymbol(ineq.op)} ${ineq.c}" xem bất đẳng thức đó Đúng hay Sai.`,
          tier3: isTeacher
            ? `[Đáp án GV - Bước 5]: Vế trái = ${testSub.intermediateExpr} = ${strLhs}. So sánh: ${strLhs} ${getOperatorSymbol(ineq.op)} ${ineq.c} là MỆNH ĐỀ ${testEval.satisfies ? 'ĐÚNG' : 'SAI'}.`
            : `Hướng dẫn làm Bước 5: Ta tính tích thứ nhất (${ineq.a} × ${strMx}) cộng tích thứ hai (${ineq.b} × ${strMy}). Nhập kết quả vào ô số 1, chọn ĐÚNG hoặc SAI ở mục 2 rồi bấm "Kiểm chứng phép tính"!`
        };
      case 6:
        return {
          tier1: 'Bước 6 (Định hướng): Dựa vào kết quả mệnh đề ở Bước 5 để quyết định lấy nửa mặt phẳng nào.',
          tier2: 'Bước 6 (Phương pháp): Quy tắc SGK: Nếu thay điểm thử M được mệnh đề ĐÚNG → Miền nghiệm là nửa mặt phẳng CHỨA M. Nếu được mệnh đề SAI → Miền nghiệm là nửa mặt phẳng KHÔNG CHỨA M.',
          tier3: isTeacher
            ? `[Đáp án GV - Bước 6]: Vì mệnh đề tại M(${strMx}; ${strMy}) là ${testEval.satisfies ? 'ĐÚNG' : 'SAI'}, miền nghiệm là nửa mặt phẳng ${testEval.satisfies ? 'CHỨA điểm M' : 'KHÔNG CHỨA điểm M'}.`
            : `Hướng dẫn làm Bước 6: Ở Bước 5 em đã xác định mệnh đề tại M(${strMx}; ${strMy}) là ${testEval.satisfies ? 'ĐÚNG' : 'SAI'}. Áp dụng quy tắc ở Gợi ý 2 để chọn nửa mặt phẳng tương ứng và bấm "Kiểm chứng kết luận"!`
        };
      case 7:
        return {
          tier1: 'Bước 7 (Tổng kết): Bạn đã hoàn thành toàn bộ các bước! AI Opti đã tổng hợp bảng chấm Đúng/Sai chi tiết bên dưới.',
          tier2: 'Cấu trúc kết luận chuẩn SGK gồm 3 ý: (1) Nửa mặt phẳng bờ d, (2) Kể cả bờ hay không kể bờ, (3) Chứa hay không chứa điểm thử M.',
          tier3: `Kết luận chuẩn SGK: Bất phương trình ${formatInequality(ineq)} có miền nghiệm là nửa mặt phẳng ${isClosed ? 'đóng (kể cả bờ d)' : 'mở (không kể bờ d)'} ${testEval.satisfies ? `chứa điểm M(${strMx}; ${strMy})` : `không chứa điểm M(${strMx}; ${strMy})`}.`
        };
    }
  }, [currentStep, ineq, isTeacher, expectedLineStyle, pointA, pointB, isThroughOrigin, testPoint, isTestPointOnLine, testSub, testEval, isClosed]);

  // Dynamic reaction of Opti mascot
  const optiMessage = useMemo<{
    text: string;
    expression: OptiExpression;
    actionState: OptiActionState;
  }>(() => {
    const strMx = formatNumberClean(testPoint.x);
    const strMy = formatNumberClean(testPoint.y);
    const strAx = formatNumberClean(pointA.x);
    const strAy = formatNumberClean(pointA.y);
    const strBx = formatNumberClean(pointB.x);
    const strBy = formatNumberClean(pointB.y);
    const strLhs = formatNumberClean(testSub.totalLhs);

    if (activeHintTier === 1) {
      return {
        text: `[Gợi ý Cấp 1 - Định hướng]: ${stepHints.tier1}`,
        expression: 'thinking',
        actionState: 'think'
      };
    }
    if (activeHintTier === 2) {
      return {
        text: `[Gợi ý Cấp 2 - Phương pháp]: ${stepHints.tier2}`,
        expression: 'thinking',
        actionState: 'think'
      };
    }
    if (activeHintTier === 3) {
      return {
        text: `[Gợi ý Cấp 3 - Chi tiết]: ${stepHints.tier3}`,
        expression: 'happy',
        actionState: 'nod'
      };
    }

    if (isTeacher) {
      return {
        text: `[AI Trợ Giảng GV - Bước ${currentStep}/7]: Đáp án chuẩn: Bờ (d): ${formatBoundaryLine(ineq.a, ineq.b, ineq.c)} (${expectedLineStyle === 'solid' ? 'Nét liền' : 'Nét đứt'}), qua A(${strAx}; ${strAy}), B(${strBx}; ${strBy}). Điểm thử M(${strMx}; ${strMy}) có VT = ${strLhs} ${getOperatorSymbol(ineq.op)} ${ineq.c} (${testEval.satisfies ? 'ĐÚNG → Lấy nửa MP chứa M' : 'SAI → Lấy nửa MP không chứa M'}).`,
        expression: 'happy',
        actionState: 'nod'
      };
    }

    switch (currentStep) {
      case 1:
        return {
          text: 'Hướng dẫn Bước 1: Em hãy đối chiếu phương trình với dạng chuẩn ax + by ≤ c, xác định các hệ số a, b, c và bấm "Kiểm tra & Tiếp tục" nhé!',
          expression: 'happy',
          actionState: 'nod'
        };
      case 2:
        return {
          text: step2Feedback
            ? step2Feedback.message
            : `Hướng dẫn Bước 2: Đường biên (d): ${formatBoundaryLine(ineq.a, ineq.b, ineq.c)}. Hãy quan sát dấu "${getOperatorSymbol(ineq.op)}" xem có dấu "=" hay không để chọn Nét liền hoặc Nét đứt.`,
          expression: step2Feedback?.isCorrect ? 'happy' : step2Feedback ? 'surprised' : 'thinking',
          actionState: step2Feedback?.isCorrect ? 'celebrate' : step2Feedback ? 'think' : 'idle'
        };
      case 3:
        return {
          text: step3Feedback
            ? step3Feedback.message
            : 'Hướng dẫn Bước 3: Tìm 2 điểm phân biệt A, B thuộc đường thẳng (d) bằng cách lần lượt cho y = 0 tìm x và cho x = 0 tìm y, sau đó nhấn "Kiểm tra & Vẽ bờ (d)".',
          expression: step3Feedback?.isCorrect ? 'happy' : 'thinking',
          actionState: step3Feedback?.isCorrect ? 'celebrate' : step3Feedback ? 'think' : 'idle'
        };
      case 4:
        return {
          text: step4Feedback
            ? step4Feedback.message
            : isTestPointOnLine
            ? 'Cảnh báo phương pháp: Điểm M đang nằm ngay trên đường biên (d)! Em hãy chọn một điểm nằm ngoài đường bờ (d) để làm điểm thử.'
            : isThroughOrigin
            ? 'Hướng dẫn Bước 4: Vì đường thẳng đi qua gốc O(0; 0) nên ta không được chọn O! Hãy chọn điểm thử P(1; 0) hoặc Q(0; 1) nhé.'
            : 'Hướng dẫn Bước 4: Chọn một điểm thử M không nằm trên bờ (d). Gợi ý: Gốc tọa độ O(0; 0) giúp tính nhẩm nhanh nhất!',
          expression: isTestPointOnLine ? 'surprised' : 'happy',
          actionState: isTestPointOnLine ? 'think' : 'idle'
        };
      case 5:
        return {
          text: step5Feedback
            ? step5Feedback.message
            : `Hướng dẫn Bước 5: Thay tọa độ M(${strMx}; ${strMy}) vào vế trái: ${testSub.exprWithMul}. Em hãy tự tính giá trị vế trái rồi so sánh với ${ineq.c}!`,
          expression: step5Feedback?.isCorrect ? 'happy' : 'thinking',
          actionState: step5Feedback?.isCorrect ? 'celebrate' : step5Feedback ? 'think' : 'idle'
        };
      case 6:
        return {
          text: step6Feedback
            ? step6Feedback.message
            : `Hướng dẫn Bước 6: Dựa vào kết quả Bước 5 (mệnh đề ${testEval.satisfies ? 'ĐÚNG' : 'SAI'}), em hãy áp dụng quy tắc SGK để chọn nửa mặt phẳng nghiệm trên đồ thị!`,
          expression: step6Feedback?.isCorrect ? 'happy' : 'thinking',
          actionState: step6Feedback?.isCorrect ? 'celebrate' : 'think'
        };
      case 7:
        return {
          text: 'Chúc mừng em đã hoàn thành cả 7 bước! AI Opti đã kiểm tra và tổng hợp bảng đánh giá Đúng/Sai từng bước ở bên dưới.',
          expression: 'happy',
          actionState: 'celebrate'
        };
    }
  }, [activeHintTier, stepHints, currentStep, ineq, isTeacher, expectedLineStyle, pointA, pointB, step2Feedback, step3Feedback, step4Feedback, isTestPointOnLine, isThroughOrigin, testPoint, testSub, step5Feedback, step6Feedback, testEval]);

  // Speech helper
  const handleSpeak = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    if (speechEnabled) {
      window.speechSynthesis.cancel();
      setSpeechEnabled(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(optiMessage.text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeechEnabled(false);
    utterance.onerror = () => setSpeechEnabled(false);
    setSpeechEnabled(true);
    window.speechSynthesis.speak(utterance);
  }, [optiMessage.text, speechEnabled]);

  // Step 1: Verification
  const handleVerifyStep1 = () => {
    if (ineq.a === 0 && ineq.b === 0) {
      setStep1Error('Hệ số a và b không được đồng thời bằng 0 theo định nghĩa SGK!');
      return;
    }
    setStep1Error(null);
    setCompletedSteps(prev => new Set(prev).add(1));
    setCurrentStep(2);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  };

  // Step 2: Verification
  const handleVerifyStep2 = () => {
    if (!userLineStyle) {
      setStep2Feedback({
        isCorrect: false,
        message: 'Vui lòng chọn nét liền hoặc nét đứt trước khi kiểm chứng!'
      });
      return;
    }

    const isMatch = userLineStyle === expectedLineStyle;
    if (isMatch) {
      setStep2Feedback({
        isCorrect: true,
        message: `Chính xác! Bất phương trình mang dấu "${getOperatorSymbol(ineq.op)}", nên miền nghiệm ${
          isClosed ? 'lấy cả bờ (d) (vẽ nét liền, miền đóng)' : 'không lấy bờ (d) (vẽ nét đứt, miền mở)'
        }.`
      });
      setCompletedSteps(prev => new Set(prev).add(2));
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } else {
      setStep2Feedback({
        isCorrect: false,
        message: `Chưa chính xác! Dấu "${getOperatorSymbol(ineq.op)}" ${
          isClosed
            ? 'có dấu "=" nên lấy cả đường biên (phải vẽ nét liền).'
            : 'là dấu nghiêm ngặt không có dấu "=" nên không lấy bờ (phải vẽ nét đứt).'
        }`
      });
    }
  };

  // Step 3: Verification (Find 2 points A and B, then draw boundary line)
  const handleUseSamplePoints = () => {
    const [sampleA, sampleB] = getSamplePointsOnLine(ineq.a, ineq.b, ineq.c);
    setPointA(sampleA);
    setPointB(sampleB);
    setStep3Feedback(null);
  };

  const handleVerifyStep3 = () => {
    const isDistinct = Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y) > 0.01;
    if (!isDistinct) {
      setStep3Feedback({
        isCorrect: false,
        message: 'Điểm A và điểm B đang bị trùng nhau! Một đường thẳng chỉ được xác định khi có hai điểm phân biệt.'
      });
      return;
    }

    const isAOnLine = isPointOnLine(ineq.a, ineq.b, ineq.c, pointA, 1e-3);
    const isBOnLine = isPointOnLine(ineq.a, ineq.b, ineq.c, pointB, 1e-3);

    if (!isAOnLine && !isBOnLine) {
      setStep3Feedback({
        isCorrect: false,
        message: `Cả hai điểm A(${pointA.x}; ${pointA.y}) và B(${pointB.x}; ${pointB.y}) đều không thuộc đường thẳng (d)! Thay vào ax + by phải bằng ${ineq.c}.`
      });
      return;
    }

    if (!isAOnLine) {
      setStep3Feedback({
        isCorrect: false,
        message: `Điểm A(${pointA.x}; ${pointA.y}) không thuộc đường thẳng (d): ${formatBoundaryLine(ineq.a, ineq.b, ineq.c)}!`
      });
      return;
    }

    if (!isBOnLine) {
      setStep3Feedback({
        isCorrect: false,
        message: `Điểm B(${pointB.x}; ${pointB.y}) không thuộc đường thẳng (d): ${formatBoundaryLine(ineq.a, ineq.b, ineq.c)}!`
      });
      return;
    }

    // Both valid! Draw line
    setLineDrawn(true);
    setStep3Feedback({
      isCorrect: true,
      message: `Chính xác! Hai điểm A(${pointA.x}; ${pointA.y}) và B(${pointB.x}; ${pointB.y}) đều thuộc (d). Đường thẳng bờ (d) đã được vẽ trên hệ trục tọa độ!`
    });
    setCompletedSteps(prev => new Set(prev).add(3));
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
  };

  // Step 4: Verification (Choose test point M not on boundary line)
  const handleVerifyStep4 = () => {
    if (isTestPointOnLine) {
      setStep4Feedback({
        isCorrect: false,
        message: `Điểm M(${testPoint.x}; ${testPoint.y}) nằm ngay trên đường thẳng bờ (d)! Theo SGK Toán 10, không được dùng điểm trên bờ làm điểm thử phân biệt 2 nửa mặt phẳng. Hãy chọn điểm khác (ví dụ: P(1; 0) hoặc Q(0; 1))!`
      });
      return;
    }

    setStep4Feedback({
      isCorrect: true,
      message: `Rất tốt! Điểm M(${testPoint.x}; ${testPoint.y}) không thuộc bờ (d). Đây là điểm thử hợp lệ để phân biệt hai nửa mặt phẳng!`
    });
    setCompletedSteps(prev => new Set(prev).add(4));
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
  };

  // Step 5: Verification (Calculate LHS and Truth value)
  const handleVerifyStep5 = () => {
    if (userTruthChoice === null) {
      setStep5Feedback({
        isCorrect: false,
        message: 'Vui lòng chọn kết luận mệnh đề: ĐÚNG (Thỏa mãn) hay SAI (Không thỏa mãn)!'
      });
      return;
    }

    // Optional user calculation check if input is provided
    const userLhsNum = parseFloat(userLhsInput);
    const hasEnteredLhs = !isNaN(userLhsNum);
    const isLhsMatch = hasEnteredLhs ? Math.abs(userLhsNum - testSub.totalLhs) < 1e-3 : true;

    if (hasEnteredLhs && !isLhsMatch) {
      setStep5Feedback({
        isCorrect: false,
        message: `Giá trị vế trái bạn tính (${userLhsNum}) chưa chính xác! Phép tính đúng: ${testSub.exprWithMul} = ${testSub.totalLhs}.`
      });
      return;
    }

    const isTruthMatch = userTruthChoice === testEval.satisfies;
    if (isTruthMatch) {
      setStep5Feedback({
        isCorrect: true,
        message: `Chính xác 100%! Vế trái = ${testSub.totalLhs}. So sánh với c = ${ineq.c}: Mệnh đề ${testSub.totalLhs} ${getOperatorSymbol(ineq.op)} ${ineq.c} là ${testEval.satisfies ? 'ĐÚNG' : 'SAI'}. Do đó điểm M ${testEval.satisfies ? 'THUỘC' : 'KHÔNG THUỘC'} miền nghiệm!`
      });
      setCompletedSteps(prev => new Set(prev).add(5));
      confetti({ particleCount: 50, spread: 65, origin: { y: 0.7 } });
    } else {
      setStep5Feedback({
        isCorrect: false,
        message: `Chưa đúng! ${testSub.totalLhs} ${getOperatorSymbol(ineq.op)} ${ineq.c} là mệnh đề ${testEval.satisfies ? 'ĐÚNG' : 'SAI'}. Hãy xem lại phép so sánh nhé!`
      });
    }
  };

  // Step 6: Half-plane Selection and Verification
  const handleSelectHalfPlaneSide = (side: 'with_test' | 'without_test') => {
    setSelectedSide(side);
  };

  const handleVerifyStep6 = () => {
    if (!selectedSide) {
      setStep6Feedback({
        isCorrect: false,
        message: 'Vui lòng chọn nửa mặt phẳng dự đoán (chứa M hoặc không chứa M) trước khi kiểm chứng!'
      });
      return;
    }

    const expectedSide: 'with_test' | 'without_test' = testEval.satisfies ? 'with_test' : 'without_test';
    const isCorrect = selectedSide === expectedSide;
    setIsSideVerifiedCorrect(isCorrect);

    if (isCorrect) {
      setStep6Feedback({
        isCorrect: true,
        message: `Chính xác! Vì tại điểm thử M mệnh đề là ${testEval.satisfies ? 'ĐÚNG' : 'SAI'}, nên miền nghiệm là nửa mặt phẳng ${testEval.satisfies ? 'CHỨA điểm thử M' : 'KHÔNG CHỨA điểm thử M'}! Miền nghiệm đã được biểu diễn trên đồ thị.`
      });
      setCompletedSteps(prev => new Set(prev).add(6));
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.65 } });
    } else {
      setStep6Feedback({
        isCorrect: false,
        message: `Chưa chính xác! Vì tại điểm thử M kết quả là ${testEval.satisfies ? 'ĐÚNG' : 'SAI'}, miền nghiệm phải là nửa mặt phẳng ${testEval.satisfies ? 'CHỨA điểm M' : 'KHÔNG CHỨA điểm M'}. Hãy chọn lại nhé!`
      });
    }
  };

  // Navigation handlers
  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(s => (s + 1) as StepNumber);
      setActiveHintTier(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(s => (s - 1) as StepNumber);
      setActiveHintTier(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectPreset = (targetIneq: Inequality) => {
    setIneq(targetIneq);
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setActiveHintTier(null);
  };

  // Teacher 1-click Auto-Fill & Verify All 7 Steps
  const handleTeacherAutoSolveAll = () => {
    const [sampleA, sampleB] = getSamplePointsOnLine(ineq.a, ineq.b, ineq.c);
    setPointA(sampleA);
    setPointB(sampleB);
    setUserLineStyle(expectedLineStyle);
    setLineDrawn(true);
    setUserLhsInput(String(testSub.totalLhs));
    setUserTruthChoice(testEval.satisfies);
    const expSide: 'with_test' | 'without_test' = testEval.satisfies ? 'with_test' : 'without_test';
    setSelectedSide(expSide);
    setIsSideVerifiedCorrect(true);
    setTeacherRevealAnswers(true);
    setCompletedSteps(new Set([1, 2, 3, 4, 5, 6, 7]));
    setStep2Feedback({
      isCorrect: true,
      message: `[Đáp án chuẩn]: Dấu "${getOperatorSymbol(ineq.op)}" → Đường bờ (d) vẽ nét ${expectedLineStyle === 'solid' ? 'liền' : 'đứt'}.`
    });
    setStep3Feedback({
      isCorrect: true,
      message: `[Đáp án chuẩn]: Hai điểm A(${formatNumberClean(sampleA.x)}; ${formatNumberClean(sampleA.y)}) và B(${formatNumberClean(sampleB.x)}; ${formatNumberClean(sampleB.y)}) thuộc bờ (d).`
    });
    setStep4Feedback({
      isCorrect: true,
      message: `[Đáp án chuẩn]: Điểm thử M(${formatNumberClean(testPoint.x)}; ${formatNumberClean(testPoint.y)}) hợp lệ.`
    });
    setStep5Feedback({
      isCorrect: true,
      message: `[Đáp án chuẩn]: Vế trái = ${formatNumberClean(testSub.totalLhs)} ${getOperatorSymbol(ineq.op)} ${ineq.c} là ${testEval.satisfies ? 'ĐÚNG' : 'SAI'}.`
    });
    setStep6Feedback({
      isCorrect: true,
      message: `[Đáp án chuẩn]: Miền nghiệm là nửa mặt phẳng ${testEval.satisfies ? 'CHỨA' : 'KHÔNG CHỨA'} điểm M.`
    });
  };

  const handleCopyConclusion = () => {
    const formalText = `KẾT LUẬN MIỀN NGHIỆM CỦA BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN: ${formatInequality(ineq)}
1. Vẽ đường thẳng bờ (d): ${formatBoundaryLine(ineq.a, ineq.b, ineq.c)} đi qua hai điểm A(${pointA.x}; ${pointA.y}) và B(${pointB.x}; ${pointB.y}).
2. Kiểu đường biên: Nét ${expectedLineStyle === 'solid' ? 'liền (kể cả bờ, miền nghiệm đóng)' : 'đứt (không kể bờ, miền nghiệm mở)'}.
3. Điểm thử kiểm tra: M(${testPoint.x}; ${testPoint.y}) không thuộc đường thẳng bờ (d).
4. Thay số và tính toán: ${testSub.exprWithMul} = ${testSub.totalLhs} ${getOperatorSymbol(ineq.op)} ${ineq.c} (${testEval.satisfies ? 'Mệnh đề ĐÚNG' : 'Mệnh đề SAI'}).
5. Kết luận chuẩn SGK: Miền nghiệm của bất phương trình đã cho là nửa mặt phẳng bờ (d) ${expectedLineStyle === 'solid' ? '(kể cả bờ d)' : '(không kể bờ d)'} ${testEval.satisfies ? `chứa điểm M(${testPoint.x}; ${testPoint.y})` : `không chứa điểm M(${testPoint.x}; ${testPoint.y})`}.`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(formalText);
      setCopyToast('Đã sao chép kết luận chuẩn SGK Toán 10 vào bộ nhớ tạm!');
      setTimeout(() => setCopyToast(null), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* 1. PROGRESS BAR / STEP NAVIGATION (Responsive & Slim) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
        {/* Mobile / Tablet Compact Progress Header */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
              <button
                type="button"
                onClick={() => setShowMobileStepList(!showMobileStepList)}
                className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 text-left cursor-pointer"
              >
                <span>Bước {currentStep}/7: {STEP_TITLES[currentStep - 1].title}</span>
                {showMobileStepList ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {learningMode === 'teacher' && (
                <button
                  type="button"
                  onClick={() => setTeacherRevealAnswers(!teacherRevealAnswers)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold ${
                    teacherRevealAnswers ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {teacherRevealAnswers ? 'Ẩn đáp án' : 'Đáp án'}
                </button>
              )}
              <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {Math.round((currentStep / 7) * 100)}%
              </span>
            </div>
          </div>

          {/* Slim 7-Segment Progress Track */}
          <div className="grid grid-cols-7 gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
            {STEP_TITLES.map(st => {
              const isCurr = currentStep === st.num;
              const isComp = completedSteps.has(st.num);
              return (
                <div
                  key={st.num}
                  className={`h-full rounded-full transition-colors ${
                    isCurr ? 'bg-blue-600' : isComp ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              );
            })}
          </div>

          {/* Mobile Quick SGK Test Presets Bar */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0">
              Bài mẫu:
            </span>
            {TEST_PRESETS.map((tp, idx) => {
              const isActive =
                ineq.a === tp.ineq.a &&
                ineq.b === tp.ineq.b &&
                ineq.op === tp.ineq.op &&
                ineq.c === tp.ineq.c;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(tp.ineq)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap shrink-0 transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 active:bg-blue-50'
                  }`}
                >
                  {tp.name}
                </button>
              );
            })}
          </div>

          {/* Expandable Mobile Step Drawer */}
          {showMobileStepList && (
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {STEP_TITLES.map(st => {
                const isCurr = currentStep === st.num;
                const isComp = completedSteps.has(st.num);
                const canClick = isComp || isCurr || learningMode === 'teacher';
                return (
                  <button
                    key={st.num}
                    type="button"
                    disabled={!canClick}
                    onClick={() => {
                      setCurrentStep(st.num);
                      setShowMobileStepList(false);
                    }}
                    className={`text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                      isCurr
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : isComp
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : canClick
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-slate-50 border-slate-100 text-slate-400 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                      {isComp && !isCurr ? '✓' : st.num}
                    </span>
                    <span className="truncate">{st.short}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Full Timeline Stepper */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="font-extrabold text-base text-slate-900">
                Quy Trình 7 Bước Biểu Diễn Miền Nghiệm Chuẩn Toán 10
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Bước {currentStep}/7: {STEP_TITLES[currentStep - 1].title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {learningMode === 'teacher' && (
                <button
                  type="button"
                  onClick={() => setTeacherRevealAnswers(!teacherRevealAnswers)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    teacherRevealAnswers
                      ? 'bg-purple-100 border-purple-300 text-purple-800'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Giáo viên xem nhanh đáp án mẫu của từng bước"
                >
                  {teacherRevealAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{teacherRevealAnswers ? 'Ẩn đáp án mẫu' : 'Hiện đáp án mẫu'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsPresentationExpanded(!isPresentationExpanded)}
                className="text-xs p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                title={isPresentationExpanded ? 'Thu nhỏ giao diện' : 'Phóng to đồ thị trình chiếu'}
              >
                {isPresentationExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {STEP_TITLES.map(st => {
              const isCurrent = currentStep === st.num;
              const isCompleted = completedSteps.has(st.num);
              const canJump = isCompleted || isCurrent || learningMode === 'teacher';

              return (
                <button
                  key={st.num}
                  type="button"
                  disabled={!canJump}
                  onClick={() => setCurrentStep(st.num)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all border cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : canJump
                      ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCurrent
                        ? 'bg-white text-blue-700'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted && !isCurrent ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.num}
                  </div>
                  <div className="min-w-0 pr-0.5">
                    <div className="text-[11px] font-bold leading-tight truncate">{st.short}</div>
                    <div className={`text-[9px] leading-tight truncate ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                      {st.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. COMPACT OPTI ASSISTANT BANNER (Mobile-Friendly & Expandable) */}
      {optiVisible && (
        <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 rounded-2xl border border-blue-200 p-3 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 flex items-center justify-center">
                <OptiMascot expression={optiMessage.expression} actionState={optiMessage.actionState} size={38} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded text-white ${
                      isTeacher ? 'bg-purple-600' : 'bg-blue-600'
                    }`}
                  >
                    {isTeacher ? 'Opti AI • Trợ Giảng Giáo Viên' : 'Opti AI • Hướng Dẫn Học Sinh'}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                    Bước {currentStep}: {STEP_TITLES[currentStep - 1].title}
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium leading-snug line-clamp-2">
                  {optiMessage.text}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleSpeak}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 shadow-xs cursor-pointer"
                title={speechEnabled ? 'Dừng đọc' : 'Đọc lời thoại'}
              >
                {speechEnabled ? <VolumeX className="w-3.5 h-3.5 text-blue-600 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setOptiExpanded(!optiExpanded)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition shadow-xs cursor-pointer ${
                  optiExpanded
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Gợi ý 3 cấp</span>
                <span className="sm:hidden">Gợi ý</span>
                {optiExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={() => setOptiVisible(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-xs cursor-pointer"
                title="Thu nhỏ trợ lý"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Expandable 3-Tier Hint Drawer */}
          {optiExpanded && (
            <div className="mt-3 pt-3 border-t border-blue-200/70 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                <span className="text-slate-600 font-semibold text-[11px]">Chọn mức gợi ý:</span>
                <button
                  type="button"
                  onClick={() => setActiveHintTier(activeHintTier === 1 ? null : 1)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                    activeHintTier === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  1. Định hướng
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHintTier(activeHintTier === 2 ? null : 2)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                    activeHintTier === 2 ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  2. Phương pháp
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHintTier(activeHintTier === 3 ? null : 3)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                    activeHintTier === 3 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  3. Chi tiết
                </button>
              </div>

              {activeHintTier && (
                <div className="p-2.5 rounded-xl bg-white border border-blue-200 text-xs text-slate-700 leading-relaxed shadow-xs">
                  <span className="font-bold text-blue-900 block mb-0.5">
                    {activeHintTier === 1 ? '🎯 Gợi ý Định hướng:' : activeHintTier === 2 ? '📘 Phương pháp giải:' : '💡 Hướng dẫn chi tiết:'}
                  </span>
                  {activeHintTier === 1 ? stepHints.tier1 : activeHintTier === 2 ? stepHints.tier2 : stepHints.tier3}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TEACHER ANSWER KEY & QUICK VERIFICATION PANEL */}
      {isTeacher && (
        <div className="bg-gradient-to-r from-purple-50 via-amber-50/70 to-indigo-50 rounded-2xl border border-purple-200 p-3.5 shadow-xs flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-700 text-white text-[10px] font-extrabold uppercase tracking-wider">
                Bảng Đáp Án & Kiểm Tra Giáo Viên
              </span>
              <span className="text-xs font-bold text-purple-950">
                Đề bài: <span className="font-mono text-blue-700">{formatInequality(ineq)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTeacherAutoSolveAll}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tự động điền & Kiểm tra đúng 7 bước</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-white border border-purple-100">
              <span className="font-bold text-purple-900 block">B1–B2: Đường bờ & Nét vẽ</span>
              <span className="text-slate-700 font-mono">
                (d): {formatBoundaryLine(ineq.a, ineq.b, ineq.c)} • {expectedLineStyle === 'solid' ? 'Nét liền (Đóng)' : 'Nét đứt (Mở)'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-purple-100">
              <span className="font-bold text-purple-900 block">B3: Hai điểm chuẩn trên bờ</span>
              <span className="text-slate-700 font-mono">
                A({formatNumberClean(pointA.x)}; {formatNumberClean(pointA.y)}), B({formatNumberClean(pointB.x)}; {formatNumberClean(pointB.y)})
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-purple-100">
              <span className="font-bold text-purple-900 block">B4–B5: Thay điểm thử M</span>
              <span className="text-slate-700 font-mono">
                M({formatNumberClean(testPoint.x)}; {formatNumberClean(testPoint.y)}) → VT = {formatNumberClean(testSub.totalLhs)} {getOperatorSymbol(ineq.op)} {ineq.c} ({testEval.satisfies ? 'ĐÚNG' : 'SAI'})
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-purple-100">
              <span className="font-bold text-purple-900 block">B6–B7: Kết luận miền nghiệm</span>
              <span className="text-emerald-700 font-bold">
                Nửa MP bờ (d) {isClosed ? '(lấy bờ)' : '(bỏ bờ)'} {testEval.satisfies ? 'CHỨA M' : 'KHÔNG CHỨA M'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MULTI-COLUMN WORKSPACE
          Desktop: 3 Columns (Left: Action Controls, Center: Graph, Right: Opti & Math Analysis)
          Mobile: Stacked (Step Action -> Graph -> Bottom Nav)
      */}
      <div className={`grid gap-4 items-start ${isPresentationExpanded ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-12'}`}>
        {/* LEFT COLUMN: Active Step Controller (xl: 4.5 cols) */}
        <div className={isPresentationExpanded ? 'w-full' : 'xl:col-span-4 flex flex-col gap-3.5 order-1'}>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col gap-4">
            {/* Step Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                  Bước {currentStep} của 7
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {STEP_TITLES[currentStep - 1].title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{STEP_TITLES[currentStep - 1].desc}</p>
              </div>

              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center font-mono text-sm border border-blue-100">
                0{currentStep}
              </span>
            </div>

            {/* STEP 1: NHẬN DIỆN */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bất phương trình bậc nhất hai ẩn có dạng chuẩn <code className="font-bold text-blue-700">ax + by (op) c</code>. Kiểm tra các hệ số và đảm bảo a, b không đồng thời bằng 0:
                </p>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-mono text-center font-extrabold text-blue-700 text-lg mb-3">
                    {formatInequality(ineq)}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1 text-center">Hệ số a</label>
                      <input
                        type="number"
                        value={ineq.a}
                        onChange={e => setIneq({ ...ineq, a: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center font-bold text-sm bg-white border border-slate-300 rounded-lg py-1.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1 text-center">Hệ số b</label>
                      <input
                        type="number"
                        value={ineq.b}
                        onChange={e => setIneq({ ...ineq, b: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center font-bold text-sm bg-white border border-slate-300 rounded-lg py-1.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1 text-center">Dấu</label>
                      <select
                        value={ineq.op}
                        onChange={e => setIneq({ ...ineq, op: e.target.value as ComparisonOperator })}
                        className="w-full text-center font-bold text-sm bg-white border border-slate-300 rounded-lg py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="<=">≤</option>
                        <option value="<">&lt;</option>
                        <option value=">=">≥</option>
                        <option value=">">&gt;</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1 text-center">Số c</label>
                      <input
                        type="number"
                        value={ineq.c}
                        onChange={e => setIneq({ ...ineq, c: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center font-bold text-sm bg-white border border-slate-300 rounded-lg py-1.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {step1Error && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{step1Error}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    Phân loại: <strong>{isClosed ? 'Miền đóng (kể cả bờ)' : 'Miền mở (không kể bờ)'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleVerifyStep1}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer min-h-[44px]"
                  >
                    <span>Kiểm tra & Tiếp tục</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ĐƯỜNG BIÊN & KIỂU NÉT */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-medium text-slate-700 mb-1">Phương trình đường thẳng bờ tương ứng:</div>
                  <div className="font-mono text-base font-bold text-blue-700">
                    (d): {formatBoundaryLine(ineq.a, ineq.b, ineq.c)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Theo bạn, đường biên (d) phải được biểu diễn bằng nét gì?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUserLineStyle('solid')}
                      className={`p-3 rounded-xl border text-left text-xs transition min-h-[44px] cursor-pointer ${
                        userLineStyle === 'solid'
                          ? 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="w-4 h-0.5 bg-blue-600 inline-block" />
                        <span>Nét liền</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Lấy bờ (Dấu ≤ hoặc ≥) – Miền đóng
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserLineStyle('dashed')}
                      className={`p-3 rounded-xl border text-left text-xs transition min-h-[44px] cursor-pointer ${
                        userLineStyle === 'dashed'
                          ? 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="w-4 h-0.5 border-t-2 border-dashed border-blue-600 inline-block" />
                        <span>Nét đứt</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Không lấy bờ (Dấu &lt; hoặc &gt;) – Miền mở
                      </div>
                    </button>
                  </div>
                </div>

                {step2Feedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      step2Feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {step2Feedback.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{step2Feedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyStep2}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                    >
                      Kiểm chứng
                    </button>
                    {completedSteps.has(2) && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                      >
                        <span>Sang Bước 3</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: TÌM HAI ĐIỂM A, B VÀ VẼ ĐƯỜNG BỜ */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Để vẽ đường thẳng (d): <strong className="font-mono">{formatBoundaryLine(ineq.a, ineq.b, ineq.c)}</strong>, hãy tìm hai điểm phân biệt A và B thuộc đường thẳng này:
                </p>

                {/* Target Point Selector for Touch/Click on Graph */}
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <span className="text-[11px] text-slate-500 font-semibold pl-1">Chạm đồ thị để đặt:</span>
                  <button
                    type="button"
                    onClick={() => setActiveTargetPoint('A')}
                    className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                      activeTargetPoint === 'A' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-purple-700 border border-purple-200'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Điểm A({pointA.x}; {pointA.y})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTargetPoint('B')}
                    className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                      activeTargetPoint === 'B' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Điểm B({pointB.x}; {pointB.y})</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Point A */}
                  <div className={`p-3 rounded-xl border transition ${activeTargetPoint === 'A' ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200' : 'bg-purple-50/50 border-purple-200'}`}>
                    <span className="text-xs font-bold text-purple-900 block mb-1.5">Điểm A(xA; yA)</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold">xA</label>
                        <input
                          type="number"
                          value={pointA.x}
                          onChange={e => setPointA({ ...pointA, x: parseFloat(e.target.value) || 0 })}
                          step="0.5"
                          className="w-full text-center text-xs font-bold bg-white border border-purple-300 rounded py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold">yA</label>
                        <input
                          type="number"
                          value={pointA.y}
                          onChange={e => setPointA({ ...pointA, y: parseFloat(e.target.value) || 0 })}
                          step="0.5"
                          className="w-full text-center text-xs font-bold bg-white border border-purple-300 rounded py-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Point B */}
                  <div className={`p-3 rounded-xl border transition ${activeTargetPoint === 'B' ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200' : 'bg-indigo-50/50 border-indigo-200'}`}>
                    <span className="text-xs font-bold text-indigo-900 block mb-1.5">Điểm B(xB; yB)</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold">xB</label>
                        <input
                          type="number"
                          value={pointB.x}
                          onChange={e => setPointB({ ...pointB, x: parseFloat(e.target.value) || 0 })}
                          step="0.5"
                          className="w-full text-center text-xs font-bold bg-white border border-indigo-300 rounded py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold">yB</label>
                        <input
                          type="number"
                          value={pointB.y}
                          onChange={e => setPointB({ ...pointB, y: parseFloat(e.target.value) || 0 })}
                          step="0.5"
                          className="w-full text-center text-xs font-bold bg-white border border-indigo-300 rounded py-1.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleUseSamplePoints}
                    className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 flex items-center gap-1 min-h-[36px] cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Lấy 2 điểm mẫu trên trục</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyStep3}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs min-h-[40px] cursor-pointer"
                  >
                    {lineDrawn ? 'Cập nhật & Vẽ bờ (d)' : 'Kiểm tra & Vẽ bờ (d)'}
                  </button>
                </div>

                {step3Feedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      step3Feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {step3Feedback.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{step3Feedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
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
            )}

            {/* STEP 4: CHỌN ĐIỂM THỬ M */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chọn một điểm thử <code className="font-bold text-slate-800">M(xM; yM)</code> <strong>không thuộc đường thẳng bờ (d)</strong> để phân biệt hai nửa mặt phẳng:
                </p>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">Tọa độ điểm thử M:</span>
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                      isTestPointOnLine ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      M({testPoint.x}; {testPoint.y})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Hoành độ xM</label>
                      <input
                        type="number"
                        value={testPoint.x}
                        onChange={e => setTestPoint({ ...testPoint, x: parseFloat(e.target.value) || 0 })}
                        step="0.5"
                        className="w-full text-center font-bold text-xs bg-white border border-slate-300 rounded py-2 min-h-[40px]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Tung độ yM</label>
                      <input
                        type="number"
                        value={testPoint.y}
                        onChange={e => setTestPoint({ ...testPoint, y: parseFloat(e.target.value) || 0 })}
                        step="0.5"
                        className="w-full text-center font-bold text-xs bg-white border border-slate-300 rounded py-2 min-h-[40px]"
                      />
                    </div>
                  </div>

                  {/* Preset test point buttons */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <button
                      type="button"
                      disabled={isThroughOrigin}
                      onClick={() => setTestPoint({ x: 0, y: 0 })}
                      className={`px-2.5 py-1.5 rounded-lg font-mono transition min-h-[36px] cursor-pointer ${
                        isThroughOrigin
                          ? 'bg-slate-100 text-slate-400 line-through cursor-not-allowed border border-slate-200'
                          : 'bg-white border border-slate-200 hover:bg-blue-50 text-slate-700'
                      }`}
                    >
                      O(0; 0) {isThroughOrigin && '(Trên bờ d)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestPoint({ x: 1, y: 0 })}
                      className="px-2.5 py-1.5 rounded-lg font-mono bg-white border border-slate-200 hover:bg-blue-50 text-slate-700 min-h-[36px] cursor-pointer"
                    >
                      P(1; 0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestPoint({ x: 0, y: 1 })}
                      className="px-2.5 py-1.5 rounded-lg font-mono bg-white border border-slate-200 hover:bg-blue-50 text-slate-700 min-h-[36px] cursor-pointer"
                    >
                      Q(0; 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestPoint({ x: 2, y: 1 })}
                      className="px-2.5 py-1.5 rounded-lg font-mono bg-white border border-slate-200 hover:bg-blue-50 text-slate-700 min-h-[36px] cursor-pointer"
                    >
                      M(2; 1)
                    </button>
                  </div>
                </div>

                {/* Point on Boundary Warning */}
                {isTestPointOnLine && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Điểm M({testPoint.x}; {testPoint.y}) nằm ngay trên đường thẳng bờ (d)! Theo SGK Toán 10, không được dùng điểm trên bờ làm điểm thử phân biệt 2 nửa mặt phẳng. Hãy chọn điểm khác!
                    </span>
                  </div>
                )}

                {step4Feedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      step4Feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {step4Feedback.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{step4Feedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isTestPointOnLine}
                      onClick={handleVerifyStep4}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                    >
                      Xác nhận điểm M
                    </button>
                    {completedSteps.has(4) && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                      >
                        <span>Sang Bước 5</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: THAY ĐIỂM M VÀ TÍNH TOÁN */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thay tọa độ <code className="font-bold text-blue-800">M({testPoint.x}; {testPoint.y})</code> vào vế trái <strong className="font-mono">{formatLinearLHS(ineq.a, ineq.b)}</strong>:
                </p>

                {/* Explicit substitution expression */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                  <div className="font-bold text-blue-900 mb-1 flex items-center justify-between">
                    <span>Biểu thức thay số đầy đủ toán tử:</span>
                    {(isTeacher || completedSteps.has(5)) && (
                      <button
                        type="button"
                        onClick={() => setShowCalculationDetails(!showCalculationDetails)}
                        className="text-blue-700 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>{showCalculationDetails ? 'Thu gọn' : 'Xem từng bước tính'}</span>
                      </button>
                    )}
                  </div>
                  <div className="font-mono bg-white p-2.5 rounded-lg border border-blue-200 text-blue-950 font-bold overflow-x-auto text-xs">
                    {testSub.exprWithMul}
                  </div>

                  {showCalculationDetails && (isTeacher || completedSteps.has(5)) && (
                    <div className="mt-2 p-2 rounded bg-white/80 border border-blue-100 text-[11px] text-slate-700 space-y-1">
                      <div>• Bước nhân: {testSub.intermediateExpr}</div>
                      <div>• Bước cộng tổng vế trái: <strong>{formatNumberClean(testSub.totalLhs)}</strong></div>
                      <div>• So sánh với c = {ineq.c}: {formatNumberClean(testSub.totalLhs)} {getOperatorSymbol(ineq.op)} {ineq.c} ({testEval.satisfies ? 'ĐÚNG' : 'SAI'})</div>
                    </div>
                  )}
                </div>

                {/* Interactive Math Calculation: User computes LHS */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <label className="font-bold text-slate-800 block">
                    1. Giá trị vế trái khi thay M({testPoint.x}; {testPoint.y}) bằng bao nhiêu?
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Nhập kết quả tính vế trái..."
                      value={userLhsInput}
                      onChange={e => setUserLhsInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = parseFloat(userLhsInput);
                        if (!isNaN(val) && Math.abs(val - testSub.totalLhs) < 1e-3) {
                          setStep5Feedback({ isCorrect: true, message: `Chính xác! Vế trái có giá trị là ${testSub.totalLhs}.` });
                        } else {
                          setStep5Feedback({ isCorrect: false, message: `Chưa chính xác! ${testSub.exprWithMul} = ${testSub.totalLhs}.` });
                        }
                      }}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Kiểm tra số
                    </button>
                  </div>
                </div>

                {/* Interactive Truth Value Choice */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    2. So sánh với {ineq.c}: Mệnh đề {testSub.totalLhs} {getOperatorSymbol(ineq.op)} {ineq.c} là ĐÚNG hay SAI?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUserTruthChoice(true)}
                      className={`p-3 rounded-xl border text-center text-xs transition min-h-[44px] cursor-pointer ${
                        userTruthChoice === true
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-emerald-700">Mệnh đề ĐÚNG</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">M({testPoint.x}; {testPoint.y}) thuộc miền nghiệm</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserTruthChoice(false)}
                      className={`p-3 rounded-xl border text-center text-xs transition min-h-[44px] cursor-pointer ${
                        userTruthChoice === false
                          ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-300 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-rose-700">Mệnh đề SAI</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">M({testPoint.x}; {testPoint.y}) không thuộc miền nghiệm</div>
                    </button>
                  </div>
                </div>

                {step5Feedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      step5Feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {step5Feedback.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{step5Feedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyStep5}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                    >
                      Kiểm chứng phép tính
                    </button>
                    {completedSteps.has(5) && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                      >
                        <span>Sang Bước 6</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: KẾT LUẬN & BIỂU DIỄN MIỀN NGHIỆM */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vì tại điểm thử M({testPoint.x}; {testPoint.y}) mệnh đề là <strong className={testEval.satisfies ? 'text-emerald-700' : 'text-rose-700'}>{testEval.satisfies ? 'ĐÚNG' : 'SAI'}</strong>, hãy chọn nửa mặt phẳng là miền nghiệm:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectHalfPlaneSide('with_test')}
                    className={`p-3 rounded-xl border text-left text-xs transition min-h-[48px] cursor-pointer ${
                      selectedSide === 'with_test'
                        ? 'border-blue-500 bg-blue-50/90 text-blue-900 ring-2 ring-blue-300 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold mb-1">Nửa mặt phẳng I</div>
                    <div className="text-[11px] text-slate-500">
                      Chứa điểm thử M({testPoint.x}; {testPoint.y})
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectHalfPlaneSide('without_test')}
                    className={`p-3 rounded-xl border text-left text-xs transition min-h-[48px] cursor-pointer ${
                      selectedSide === 'without_test'
                        ? 'border-blue-500 bg-blue-50/90 text-blue-900 ring-2 ring-blue-300 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold mb-1">Nửa mặt phẳng II</div>
                    <div className="text-[11px] text-slate-500">
                      Không chứa điểm thử M
                    </div>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <span>Dự đoán của bạn: </span>
                  <strong className="text-blue-700">
                    {selectedSide === 'with_test'
                      ? 'Nửa mặt phẳng CHỨA điểm M'
                      : selectedSide === 'without_test'
                      ? 'Nửa mặt phẳng KHÔNG CHỨA điểm M'
                      : '(Chưa chọn)'}
                  </strong>
                </div>

                {step6Feedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      step6Feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {step6Feedback.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{step6Feedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyStep6}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                    >
                      Kiểm chứng kết luận
                    </button>
                    {completedSteps.has(6) && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                      >
                        <span>Sang Bước 7</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: TỔNG KẾT & LUYỆN TẬP */}
            {currentStep === 7 && (
              <div className="space-y-4">
                {/* AI Opti Post-Completion Comprehensive Audit Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/70 to-emerald-50 border border-blue-200 shadow-xs text-xs space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-extrabold text-sm text-blue-950">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>AI Opti Chấm Bài & Kiểm Tra Đúng/Sai Toàn Bộ Các Bước</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[11px]">
                      Đạt {completedSteps.size >= 6 ? '6/6' : `${completedSteps.size}/6`} bước thực hành
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/90 border border-emerald-200">
                      <span className="font-semibold text-slate-700">Bước 1 (Hệ số BPT):</span>
                      <span className="font-mono font-bold text-emerald-700">✓ ĐÚNG (a={ineq.a}, b={ineq.b}, c={ineq.c})</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/90 border border-emerald-200">
                      <span className="font-semibold text-slate-700">Bước 2 (Kiểu đường bờ d):</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ✓ ĐÚNG ({expectedLineStyle === 'solid' ? 'Nét liền - Lấy bờ' : 'Nét đứt - Bỏ bờ'})
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/90 border border-emerald-200">
                      <span className="font-semibold text-slate-700">Bước 3 (2 điểm thuộc d):</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ✓ ĐÚNG (A({formatNumberClean(pointA.x)};{formatNumberClean(pointA.y)}), B({formatNumberClean(pointB.x)};{formatNumberClean(pointB.y)}))
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/90 border border-emerald-200">
                      <span className="font-semibold text-slate-700">Bước 4 (Điểm thử M ngoài bờ):</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ✓ ĐÚNG (M({formatNumberClean(testPoint.x)};{formatNumberClean(testPoint.y)}) ∉ d)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/90 border border-emerald-200">
                      <span className="font-semibold text-slate-700">Bước 5 (Thay số & So sánh):</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ✓ ĐÚNG (VT = {formatNumberClean(testSub.totalLhs)} {getOperatorSymbol(ineq.op)} {ineq.c} là {testEval.satisfies ? 'ĐÚNG' : 'SAI'})
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/90 border border-emerald-200">
                      <span className="font-semibold text-slate-700">Bước 6 (Chọn miền nghiệm):</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ✓ ĐÚNG (Nửa MP {testEval.satisfies ? 'chứa M' : 'không chứa M'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs">
                  <div className="flex items-center gap-2 font-bold text-sm mb-2 text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Kết luận miền nghiệm chuẩn SGK Toán 10</span>
                  </div>
                  <p className="leading-relaxed mb-2">
                    Miền nghiệm của bất phương trình <strong className="font-mono">{formatInequality(ineq)}</strong> là nửa mặt phẳng bờ (d):{' '}
                    <strong className="font-mono">{formatBoundaryLine(ineq.a, ineq.b, ineq.c)}</strong>{' '}
                    {isClosed ? '(kể cả bờ d – miền nghiệm đóng)' : '(không kể bờ d – miền nghiệm mở)'}{' '}
                    {testEval.satisfies ? `chứa điểm thử M(${formatNumberClean(testPoint.x)}; ${formatNumberClean(testPoint.y)})` : `không chứa điểm thử M(${formatNumberClean(testPoint.x)}; ${formatNumberClean(testPoint.y)})`}.
                  </p>
                  <div className="text-[11px] text-emerald-800 italic">
                    Phần {shadingMode === 'solution' ? 'được tô sáng màu xanh' : 'trắng không bị gạch bỏ'} trên hệ trục tọa độ Oxy chính là tập hợp tất cả các nghiệm.
                  </div>
                </div>

                {/* Actions */}
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

                {/* 5 Mandated Test Case Presets for Instant Verification */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 block mb-2">
                    Thử nghiệm nhanh các bài toán kiểm thử mẫu:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {TEST_PRESETS.map((tp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(tp.ineq)}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-left text-xs transition cursor-pointer"
                      >
                        <div className="font-bold text-slate-900">{tp.name}</div>
                        <div className="text-[10px] text-blue-600">{tp.tag}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset({ id: 'reset', a: 2, b: 1, op: '<=', c: 6 })}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 min-h-[44px] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm bài toán mới</span>
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

        {/* CENTER COLUMN: Large Interactive Graph Canvas (xl: 5 cols, placed immediately after step controls on mobile) */}
        <div className={isPresentationExpanded ? 'w-full' : 'xl:col-span-5 flex flex-col gap-3 order-2'}>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Hệ Trục Tọa Độ Oxy
              </span>

              {/* Shading mode switch */}
              <div className="flex items-center gap-1 text-[11px] font-semibold bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setShadingMode('solution')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${shadingMode === 'solution' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
                >
                  Tô nghiệm
                </button>
                <button
                  type="button"
                  onClick={() => setShadingMode('exclusion')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${shadingMode === 'exclusion' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
                >
                  Gạch bỏ SGK
                </button>
              </div>
            </div>

            <GraphCanvas
              inequality={ineq}
              pointM={testPoint}
              onPointChange={setTestPoint}
              shadingMode={shadingMode}
              // Boundary Line visibility rule:
              // Step 3 shows line once student verifies points A & B.
              // Step 4+ always shows line.
              showBoundaryLine={(currentStep === 3 && lineDrawn) || currentStep >= 4 || teacherRevealAnswers}
              boundaryStyleOverride={userLineStyle || undefined}
              // Shading visibility rule:
              // Only shown in Step 7 OR after Step 6 verified correct OR teacher mode!
              showShading={currentStep === 7 || (currentStep === 6 && isSideVerifiedCorrect === true) || teacherRevealAnswers}
              // Points A and B in Step 3 are interactive; in Step 4+ they remain as static markers on the line
              pointA={pointA}
              pointB={pointB}
              showPointsAB={currentStep === 3}
              showPointsABStatic={currentStep >= 4}
              activePointTarget={currentStep === 3 ? activeTargetPoint : null}
              onPointAChange={setPointA}
              onPointBChange={setPointB}
              // Test Point M is visible from Step 4 onward
              showPointM={currentStep >= 4}
              // Half-plane selection interaction in Step 6
              enableHalfPlaneClick={currentStep === 6}
              selectedHalfPlaneSide={selectedSide}
              onSelectHalfPlane={handleSelectHalfPlaneSide}
              isSideVerifiedCorrect={isSideVerifiedCorrect}
              isPresentationMode={isPresentationExpanded}
            />

            {/* Subtitle / status below graph */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                {currentStep === 3
                  ? 'Kéo hoặc nhập tọa độ 2 điểm A và B để dựng đường bờ (d)'
                  : currentStep === 4
                  ? 'Kéo điểm M trên đồ thị hoặc chọn nút gợi ý (không chọn điểm trên bờ)'
                  : currentStep === 6
                  ? 'Bấm trực tiếp lên nửa mặt phẳng trên đồ thị để chọn'
                  : 'Kéo điểm M để kiểm tra tính thỏa mãn tại vị trí bất kỳ'}
              </span>
              <span className="font-mono text-slate-700 font-bold hidden sm:inline">
                {currentStep >= 4 && `M(${testPoint.x}; ${testPoint.y})`}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Desktop Opti & Live Math Analysis (xl: 3 cols, hidden on mobile) */}
        {!isPresentationExpanded && (
          <div className="hidden xl:flex xl:col-span-3 flex-col gap-3.5 order-3">
            {/* Desktop Opti Character Card */}
            <div className="bg-gradient-to-b from-blue-50/80 to-white rounded-2xl border border-blue-200 p-4 shadow-xs flex flex-col items-center text-center">
              <OptiMascot expression={optiMessage.expression} actionState={optiMessage.actionState} size={72} />
              <div className="mt-2 font-bold text-sm text-blue-900">Trợ Lý Toán Opti</div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {optiMessage.text}
              </p>

              <div className="w-full mt-3 pt-3 border-t border-blue-100 flex flex-col gap-1.5 text-left">
                <span className="text-[11px] font-bold text-slate-700">Gợi ý sư phạm:</span>
                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200 text-[11px] text-blue-950 leading-relaxed">
                  {stepHints.tier2}
                </div>
              </div>
            </div>

            {/* Quick Test Case Presets on Desktop */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Kiểm thử 5 ca mẫu SGK
              </span>
              <div className="flex flex-col gap-1.5">
                {TEST_PRESETS.map((tp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(tp.ineq)}
                    className="p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition cursor-pointer"
                  >
                    <div className="font-bold text-xs text-slate-900">{tp.name}</div>
                    <div className="text-[10px] text-blue-600">{tp.tag}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
