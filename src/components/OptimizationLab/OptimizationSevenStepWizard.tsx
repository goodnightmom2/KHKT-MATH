import React, { useState, useMemo, useEffect } from 'react';
import { OptimizationResult, Point2D, RealWorldScenario, StepNumber } from '../../types/math';
import { formatBoundaryLine, formatInequality } from '../../math/mathEngine';
import { formatCoord, formatPointCoord, formatValueWithApprox } from '../../math/systemMathEngine';
import { OptimizationGraphCanvas } from '../../graph/OptimizationGraphCanvas';
import { VertexObjectiveTable } from './VertexObjectiveTable';
import { OptiMascot } from '../../mascot/OptiMascot';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Copy,
  Layers,
  Compass,
  Volume2,
  VolumeX,
  Target,
  Award,
  BookOpen,
  Calculator,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OptimizationSevenStepWizardProps {
  scenario: RealWorldScenario;
  result: OptimizationResult;
  onSelectScenario: (scenarioId: string) => void;
  onSwitchToSandbox: () => void;
}

const OPTI_STEP_TITLES = [
  { num: 1, title: 'Đọc & Hiểu tình huống thực tế', desc: 'Phân tích bảng số liệu & mục tiêu bài toán', short: '1. Tình huống' },
  { num: 2, title: 'Chọn hai biến x, y & Đơn vị', desc: 'Xác định ý nghĩa và điều kiện biến số', short: '2. Chọn biến' },
  { num: 3, title: 'Lập hệ bất phương trình ràng buộc', desc: 'Chuyển đổi các giới hạn tài nguyên thành hệ BPT', short: '3. Lập hệ BPT' },
  { num: 4, title: 'Biểu diễn miền phương án khả thi', desc: 'Dựng các nửa mặt phẳng và miền đa giác lồi', short: '4. Miền khả thi' },
  { num: 5, title: 'Xác định các đỉnh & Điểm nguyên', desc: 'Tìm tọa độ các đỉnh và các phương án ứng viên', short: '5. Các đỉnh' },
  { num: 6, title: 'Tối ưu hóa hàm mục tiêu', desc: 'Quét đường mức và tính giá trị tại các đỉnh', short: '6. Tối ưu hóa' },
  { num: 7, title: 'Kết luận bằng ngôn ngữ thực tế', desc: 'Trả lời câu hỏi thực tiễn và bài học tối ưu', short: '7. Kết luận' }
];

export const OptimizationSevenStepWizard: React.FC<OptimizationSevenStepWizardProps> = ({
  scenario,
  result,
  onSelectScenario,
  onSwitchToSandbox
}) => {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<StepNumber>>(new Set());

  // Interactive Level curve k value
  const [kValue, setKValue] = useState<number>(() => {
    return result.optimalValue !== null ? Math.round(result.optimalValue * 0.65) : 50;
  });

  // Step 1: Comprehension state
  const [step1GoalChoice, setStep1GoalChoice] = useState<'max' | 'min' | null>(null);
  const [step1Feedback, setStep1Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Step 2: Variable condition choice
  const [step2IntegerChoice, setStep2IntegerChoice] = useState<boolean | null>(null);
  const [step2Feedback, setStep2Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Step 5: Selected vertex candidate
  const [highlightVertex, setHighlightVertex] = useState<Point2D | null>(null);

  // Step 6: Student predicted optimal vertex
  const [predictedOptVertex, setPredictedOptVertex] = useState<string | null>(null);
  const [step6Feedback, setStep6Feedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [tableAllVerified, setTableAllVerified] = useState<boolean>(false);

  // Opti Voice & Hints
  const [optiHintTier, setOptiHintTier] = useState<1 | 2 | 3>(1);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Mobile viewport view mode for screens < xl ('step' | 'graph' | 'table' | 'all')
  const [mobileStepView, setMobileStepView] = useState<'step' | 'graph' | 'table' | 'all'>('step');

  const { objective, system, variables } = scenario;
  const { vertexEvaluations, optimalPoints, optimalValue, integerOptimalPoint, integerOptimalValue } = result;

  // Reset wizard states when scenario changes
  useEffect(() => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setStep1GoalChoice(null);
    setStep1Feedback(null);
    setStep2IntegerChoice(null);
    setStep2Feedback(null);
    setHighlightVertex(null);
    setPredictedOptVertex(null);
    setStep6Feedback(null);
    setTableAllVerified(false);
    setKValue(result.optimalValue !== null ? Math.round(result.optimalValue * 0.65) : 50);
  }, [scenario.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigation handlers
  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(s => (s + 1) as StepNumber);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(s => (s - 1) as StepNumber);
    }
  };

  // STEP 1: Verify reading comprehension
  const handleVerifyStep1 = () => {
    if (!step1GoalChoice) {
      setStep1Feedback({ isCorrect: false, message: 'Vui lòng chọn mục tiêu của bài toán (MAX hay MIN)!' });
      return;
    }
    const isCorrect = step1GoalChoice === objective.goal;
    if (isCorrect) {
      setStep1Feedback({
        isCorrect: true,
        message: `Chính xác! Bài toán yêu cầu ${objective.goal === 'max' ? 'tối đa hóa (MAX)' : 'tối thiểu hóa (MIN)'} ${objective.name.toLowerCase()} ${objective.label}.`
      });
      setCompletedSteps(prev => new Set(prev).add(1));
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } else {
      setStep1Feedback({
        isCorrect: false,
        message: `Chưa đúng! Bài toán yêu cầu ${objective.name} phải đạt ${objective.goal === 'max' ? 'lớn nhất (MAX)' : 'nhỏ nhất (MIN)'}. Hãy thử lại!`
      });
    }
  };

  // STEP 2: Verify variable condition
  const handleVerifyStep2 = () => {
    if (step2IntegerChoice === null) {
      setStep2Feedback({ isCorrect: false, message: 'Vui lòng chọn xem bài toán có yêu cầu số nguyên hay không!' });
      return;
    }
    const isCorrect = step2IntegerChoice === scenario.integerRequired;
    if (isCorrect) {
      setStep2Feedback({
        isCorrect: true,
        message: scenario.integerRequired
          ? 'Chính xác! Do sản phẩm/xe là vật thể nguyên chiếc nên điều kiện biến thực tế là x, y ∈ ℕ (số tự nhiên).'
          : 'Chính xác! Do khối lượng/thời gian/diện tích có thể chia nhỏ nên biến số nhận giá trị thực x, y ≥ 0.'
      });
      setCompletedSteps(prev => new Set(prev).add(2));
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
    } else {
      setStep2Feedback({
        isCorrect: false,
        message: scenario.integerRequired
          ? 'Chưa chính xác! Sản phẩm hay phương tiện giao thông không thể sản xuất hay thuê lẻ chiếc, nên x, y phải là số nguyên!'
          : 'Chưa chính xác! Thời gian học hoặc khối lượng thức ăn có thể lẻ (ví dụ 3.6 kg hoặc 1.5 giờ), nên không bắt buộc phải là số nguyên.'
      });
    }
  };

  // STEP 3: Verify constraints
  const handleVerifyStep3 = () => {
    setCompletedSteps(prev => new Set(prev).add(3));
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  // STEP 4: Verify Feasible Region
  const handleVerifyStep4 = () => {
    setCompletedSteps(prev => new Set(prev).add(4));
    setCurrentStep(5);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  // STEP 5: Verify Candidates
  const handleVerifyStep5 = () => {
    setCompletedSteps(prev => new Set(prev).add(5));
    setCurrentStep(6);
    confetti({ particleCount: 45, spread: 65, origin: { y: 0.7 } });
  };

  // STEP 6: Verify student predicted optimal vertex
  const handleVerifyStep6 = () => {
    if (!predictedOptVertex) {
      setStep6Feedback({ isCorrect: false, message: 'Vui lòng chọn một đỉnh ứng viên mà bạn dự đoán là tối ưu!' });
      return;
    }

    const optVertexLabels = vertexEvaluations.filter(ve => ve.isOptimal).map(ve => ve.label);
    const isCorrect = optVertexLabels.includes(predictedOptVertex);
    const selectedVe = vertexEvaluations.find(ve => ve.label === predictedOptVertex);

    if (isCorrect && selectedVe) {
      const valFormatted = optimalValue !== null ? formatValueWithApprox(optimalValue) : '';
      setStep6Feedback({
        isCorrect: true,
        message: `Dự đoán chính xác tuyệt đối! Đỉnh ${selectedVe.label}${formatPointCoord(
          selectedVe.vertex
        )} là nơi đường mức tiếp xúc cuối cùng và đạt giá trị tối ưu liên tục = ${valFormatted} ${objective.unit}.${
          scenario.integerRequired && integerOptimalPoint && integerOptimalValue !== null
            ? ` Lưu ý: Với điều kiện nguyên (x, y ∈ ℕ), phương án nguyên tối ưu là (${integerOptimalPoint.x}; ${integerOptimalPoint.y}) với giá trị = ${formatValueWithApprox(integerOptimalValue)} ${objective.unit}.`
            : ''
        }`
      });
      if (optimalValue !== null) {
        setKValue(optimalValue);
      }
      setCompletedSteps(prev => new Set(prev).add(6));
      confetti({ particleCount: 50, spread: 65, origin: { y: 0.7 } });
    } else {
      setStep6Feedback({
        isCorrect: false,
        message: `Chưa chính xác! Tại đỉnh ${predictedOptVertex}${
          selectedVe ? formatPointCoord(selectedVe.vertex) : ''
        }, hàm mục tiêu chưa đạt cực trị. Hãy tự tính giá trị tại tất cả các đỉnh trong bảng bên dưới hoặc kéo thanh trượt đường mức k!`
      });
    }
  };

  // STEP 7: Copy Practical Answer
  const handleCopyConclusion = () => {
    const text = `KẾT LUẬN BÀI TOÁN TỐI ƯU HÓA TUYẾN TÍNH THỰC TẾ:
Tình huống: ${scenario.title}
Hàm mục tiêu: ${objective.label} (${objective.goal.toUpperCase()})

KẾT QUẢ TÍNH TOÁN:
${result.summarySGK}

PHƯƠNG ÁN THỰC TIỄN:
${result.practicalAnswer}`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopyToast('Đã sao chép lời giải thực tiễn vào bộ nhớ tạm!');
      setTimeout(() => setCopyToast(null), 3000);
    }
  };

  // Opti Voice synthesis
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (speechEnabled) {
      window.speechSynthesis.cancel();
      setSpeechEnabled(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result.practicalAnswer);
    utterance.lang = 'vi-VN';
    utterance.onend = () => setSpeechEnabled(false);
    setSpeechEnabled(true);
    window.speechSynthesis.speak(utterance);
  };

  const canRevealOptimal = currentStep >= 7 || completedSteps.has(6) || tableAllVerified;

  // Opti Socrates Guidance per step
  const optiGuidance = useMemo(() => {
    const verticesText = vertexEvaluations
      .map(ve => `${ve.label}${formatPointCoord(ve.vertex)}`)
      .join(', ');

    switch (currentStep) {
      case 1:
        return {
          text: 'Chào bạn! Trong thực tế, việc quan trọng nhất là đọc kỹ đề và phân định rõ: Ta muốn TỐI ĐA HÓA (lợi nhuận, điểm số) hay TỐI THIỂU HÓA (chi phí, thời gian)? Có những nguồn lực nào bị giới hạn?',
          hints: {
            tier1: 'Đọc kỹ câu hỏi cuối cùng của bài toán thực tế.',
            tier2: 'Tìm các cụm từ: "lớn nhất", "cao nhất" (MAX) hoặc "nhỏ nhất", "thấp nhất" (MIN).',
            tier3: `Trong bài toán này, mục tiêu là ${objective.name} với hàm mục tiêu ${objective.label} → ${objective.goal.toUpperCase()}.`
          }
        };
      case 2:
        return {
          text: 'Hãy đặt hai biến x và y đại diện cho hai đại lượng cần tìm quyết định. Hãy suy nghĩ: biến số này có thể nhận giá trị phân số/thập phân hay bắt buộc phải là số nguyên?',
          hints: {
            tier1: 'Đại lượng nào ta có quyền tự quyết định số lượng?',
            tier2: 'Nếu là sản phẩm, con người, xe cộ thì không thể chia lẻ (phải là số nguyên không âm x, y ∈ ℕ).',
            tier3: `Đặt x là ${variables.x.name} (${variables.x.unit}) và y là ${variables.y.name} (${variables.y.unit}).`
          }
        };
      case 3:
        return {
          text: 'Mỗi nguồn lực giới hạn (giờ máy, giờ công, diện tích...) sẽ tạo thành một bất phương trình bậc nhất hai ẩn. Hãy cùng đối chiếu số liệu nhé!',
          hints: {
            tier1: 'Mỗi hàng trong bảng số liệu tương ứng với một bất phương trình.',
            tier2: 'Cụm từ "tối đa không quá C" nghĩa là ≤ C; cụm từ "ít nhất phải đạt C" nghĩa là ≥ C.',
            tier3: 'Đừng quên hai điều kiện tự nhiên x ≥ 0 và y ≥ 0 để biến số có ý nghĩa thực tế!'
          }
        };
      case 4:
        return {
          text: 'Miền phương án khả thi là giao của tất cả các nửa mặt phẳng trên hệ trục tọa độ Oxy. Hãy quan sát miền đa giác nghiệm được tô màu tím!',
          hints: {
            tier1: 'Miền phương án khả thi là tập hợp tất cả các cặp (x; y) thỏa mãn đồng thời toàn bộ các ràng buộc.',
            tier2: 'Nếu miền khả thi là một đa giác lồi bị chặn, bài toán chắc chắn có phương án tối ưu!',
            tier3: 'Các điểm nằm ngoài miền tô màu tím đều là phương án bất khả thi (vi phạm nguồn lực).'
          }
        };
      case 5:
        return {
          text: 'Theo định lý quy hoạch tuyến tính, cực trị của hàm mục tiêu trên miền đa giác lồi đạt tại các đỉnh! Hãy kiểm tra đầy đủ tất cả các đỉnh giao điểm.',
          hints: {
            tier1: 'Các đỉnh là giao điểm của các cặp đường thẳng biên bờ thỏa mãn toàn bộ hệ.',
            tier2: 'Lưu ý: Giao điểm của hai đường bờ nghiêng (d1) và (d2) có thể có tọa độ phân số (như 8/3; 8/3) — tuyệt đối không bỏ sót đỉnh này!',
            tier3: `Các đỉnh của miền khả thi là: ${verticesText}.`
          }
        };
      case 6:
        return {
          text: 'Hãy kéo thanh trượt đường mức k hoặc tự tính giá trị tại từng đỉnh ở bảng dưới để dự đoán chính xác đỉnh tối ưu!',
          hints: {
            tier1: 'Đường mức P = ax + by = k là tập hợp các điểm có cùng giá trị hàm mục tiêu k.',
            tier2: 'Khi tịnh tiến đường mức theo hướng tăng dần k, điểm cuối cùng mà đường mức còn chạm miền khả thi chính là điểm MAX!',
            tier3: 'Thay tọa độ từng đỉnh vào hàm mục tiêu ở bảng tính bên dưới để kiểm chứng giá trị chính xác.'
          }
        };
      case 7:
        return {
          text: 'Xuất sắc! Bây giờ hãy chuyển ngôn ngữ Toán học thành câu trả lời thực tế để tư vấn cho người quản lý cơ sở nhé!',
          hints: {
            tier1: 'Không trả lời chung chung "nghiệm là (x; y)", hãy nói rõ số lượng cụ thể kèm đơn vị.',
            tier2: 'Nếu bài toán yêu cầu nguyên, hãy phân biệt rõ nghiệm liên tục (VD: 8/3; 8/3) và phương án sản xuất nguyên (VD: 2; 3).',
            tier3: 'Bấm nút "Sao chép kết luận" để lưu lại toàn bộ lời giải chuẩn sư phạm nhé!'
          }
        };
      default:
        return {
          text: 'Khám phá bài toán tối ưu thực tế cùng Opti!',
          hints: { tier1: '', tier2: '', tier3: '' }
        };
    }
  }, [currentStep, objective, variables, vertexEvaluations]);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* 1. COMPACT STEPPER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse shrink-0" />
            <h2 className="font-extrabold text-xs sm:text-sm md:text-base text-slate-900 truncate">
              Quy Trình 7 Bước Mô Hình Hóa & Tối Ưu Hóa Tuyến Tính
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 hidden sm:inline shrink-0">
              Bước {currentStep}/7
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 shrink-0">
            {Math.round((currentStep / 7) * 100)}%
          </span>
        </div>

        {/* 7 Step Buttons */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {OPTI_STEP_TITLES.map(st => {
            const isCurr = currentStep === st.num;
            const isComp = completedSteps.has(st.num as StepNumber);
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num as StepNumber)}
                className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border text-center transition cursor-pointer ${
                  isCurr
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
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

      {/* 2. OPTI SOCRATES GUIDANCE BANNER */}
      <div className="bg-gradient-to-r from-purple-50/90 to-indigo-50/90 rounded-2xl border border-purple-200 p-3 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <OptiMascot expression="thinking" actionState="nod" size={36} />
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-600 text-white block w-fit mb-0.5">
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
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-purple-600 cursor-pointer shadow-xs min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Đọc kết luận thực tiễn"
            >
              {speechEnabled ? <VolumeX className="w-3.5 h-3.5 text-purple-600 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 3-Tier Hints Selector */}
        <div className="pt-2 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-purple-900 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Gợi ý Socrates:
            </span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-purple-200">
              <button
                type="button"
                onClick={() => setOptiHintTier(1)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                  optiHintTier === 1 ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cấp 1: Định hướng
              </button>
              <button
                type="button"
                onClick={() => setOptiHintTier(2)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                  optiHintTier === 2 ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cấp 2: Phương pháp
              </button>
              <button
                type="button"
                onClick={() => setOptiHintTier(3)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                  optiHintTier === 3 ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cấp 3: Chi tiết
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-700 italic bg-white/70 px-2 py-0.5 rounded-md border border-purple-100 max-w-full">
            {optiHintTier === 1 && optiGuidance.hints.tier1}
            {optiHintTier === 2 && optiGuidance.hints.tier2}
            {optiHintTier === 3 && optiGuidance.hints.tier3}
          </div>
        </div>
      </div>

      {/* MOBILE VIEWPORT SWITCHER BAR (Visible only on < xl) */}
      <div className="xl:hidden flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setMobileStepView('step')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer min-h-[38px] shrink-0 ${
            mobileStepView === 'step'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>1. Nhiệm vụ Bước {currentStep}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileStepView('graph')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer min-h-[38px] shrink-0 ${
            mobileStepView === 'graph'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>2. Đồ thị & k={formatCoord(kValue)}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileStepView('table')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer min-h-[38px] shrink-0 ${
            mobileStepView === 'table'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>3. Bảng tính đỉnh</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileStepView('all')}
          className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer min-h-[38px] shrink-0 ${
            mobileStepView === 'all'
              ? 'bg-purple-100 text-purple-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Hiển thị tất cả"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. MULTI-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Active Step Controller (xl: 5 cols) */}
        <div
          className={`xl:col-span-5 flex flex-col gap-3.5 order-1 ${
            mobileStepView === 'step' || mobileStepView === 'all' ? 'flex' : 'hidden xl:flex'
          }`}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-purple-600">Bước {currentStep} của 7</span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{OPTI_STEP_TITLES[currentStep - 1].title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{OPTI_STEP_TITLES[currentStep - 1].desc}</p>
              </div>
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 font-extrabold flex items-center justify-center font-mono text-sm border border-purple-100">
                0{currentStep}
              </span>
            </div>

            {/* STEP 1: ĐỌC VÀ HIỂU TÌNH HUỐNG THỰC TẾ */}
            {currentStep === 1 && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-slate-900 text-sm">{scenario.title}</div>
                  <p className="leading-relaxed">{scenario.storyText}</p>
                </div>

                {/* Table Data if available */}
                {scenario.tableData && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-lg">
                      <thead>
                        <tr className="bg-purple-50/70 text-purple-900 text-[11px] font-bold border-b border-slate-200">
                          {scenario.tableData.headers.map((h, i) => (
                            <th key={i} className="p-2 border-r border-slate-200 last:border-r-0">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11px]">
                        {scenario.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2 border-r border-slate-200 last:border-r-0 font-medium">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Question: What is the optimization goal? */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    Nhiệm vụ 1: Mục tiêu của người ra quyết định trong bài toán này là gì?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStep1GoalChoice('max')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                        step1GoalChoice === 'max'
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Tối đa hóa (MAX)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep1GoalChoice('min')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                        step1GoalChoice === 'min'
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Tối thiểu hóa (MIN)
                    </button>
                  </div>
                </div>

                {step1Feedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      step1Feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {step1Feedback.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    <span>{step1Feedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-500 italic">
                    Trả lời đúng để sang Bước 2
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyStep1}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                    >
                      Kiểm chứng mục tiêu
                    </button>
                    {completedSteps.has(1) && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                      >
                        <span>Sang Bước 2</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CHỌN HAI BIẾN X, Y & ĐIỀU KIỆN */}
            {currentStep === 2 && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thiết lập hai biến quyết định cho bài toán:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs">
                    <span className="font-mono font-bold text-purple-900 text-sm">Biến x:</span>
                    <div className="font-bold text-slate-800 mt-1">{variables.x.name}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{variables.x.meaning}</div>
                    <div className="text-[10px] text-purple-700 font-semibold mt-1">Đơn vị: {variables.x.unit}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs">
                    <span className="font-mono font-bold text-purple-900 text-sm">Biến y:</span>
                    <div className="font-bold text-slate-800 mt-1">{variables.y.name}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{variables.y.meaning}</div>
                    <div className="text-[10px] text-purple-700 font-semibold mt-1">Đơn vị: {variables.y.unit}</div>
                  </div>
                </div>

                {/* Question: Integer constraint */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    Nhiệm vụ 2: Biến số x và y trong bài toán thực tế này có bắt buộc phải là số nguyên (x, y ∈ ℕ) hay không?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStep2IntegerChoice(true)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                        step2IntegerChoice === true
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Bắt buộc là số nguyên (x, y ∈ ℕ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep2IntegerChoice(false)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                        step2IntegerChoice === false
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Nhận giá trị thực bất kỳ (x, y ≥ 0)
                    </button>
                  </div>
                </div>

                {step2Feedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      step2Feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {step2Feedback.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    <span>{step2Feedback.message}</span>
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
                      onClick={handleVerifyStep2}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                    >
                      Kiểm chứng điều kiện
                    </button>
                    {completedSteps.has(2) && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                      >
                        <span>Sang Bước 3</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: LẬP HỆ BẤT PHƯƠNG TRÌNH RÀNG BUỘC */}
            {currentStep === 3 && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chuyển hóa các nguồn lực thành <strong>hệ bất phương trình ràng buộc</strong> và phân biệt với <strong>phương trình đường biên</strong>:
                </p>

                <div className="flex flex-col gap-2">
                  {system.map((ineq, idx) => (
                    <div
                      key={ineq.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ineq.color }} />
                        <span className="font-mono font-bold text-slate-800">Ràng buộc ({idx + 1}):</span>
                        <span className="font-mono font-extrabold text-purple-900">{formatInequality(ineq)}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Đường biên {ineq.label ? ineq.label.split(':')[0].trim() : `(d${idx + 1})`}: {formatBoundaryLine(ineq.a, ineq.b, ineq.c)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs">
                  <span className="font-bold text-purple-900 block mb-1">Hàm mục tiêu cần tối ưu:</span>
                  <div className="font-mono font-extrabold text-sm text-purple-950">
                    {objective.label} → {objective.goal.toUpperCase()}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    ({objective.name}, đơn vị: {objective.unit})
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handlePrevStep} className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleVerifyStep3();
                      handleNextStep();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                  >
                    <span>Kiểm tra & Sang Bước 4</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: BIỂU DIỄN MIỀN PHƯƠNG ÁN KHẢ THI */}
            {currentStep === 4 && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Miền phương án khả thi là phần giao chung của tất cả các nửa mặt phẳng, được tô màu tím trên hệ trục Oxy:
                </p>

                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-1.5">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>Đặc điểm hình học của miền phương án:</span>
                  </div>
                  <p className="leading-relaxed">
                    {result.regionType === 'bounded_polygon'
                      ? `Miền khả thi là một miền đa giác lồi bị chặn (${
                          vertexEvaluations.length === 3
                            ? 'tam giác'
                            : vertexEvaluations.length === 4
                            ? 'tứ giác'
                            : `${vertexEvaluations.length} đỉnh`
                        } ${vertexEvaluations.map(ve => ve.label).join('')}), giới hạn bởi ${
                          vertexEvaluations.length
                        } đỉnh cực biên.`
                      : result.regionType === 'unbounded'
                      ? `Miền phương án khả thi là một miền mở không bị chặn có ${vertexEvaluations.length} đỉnh hữu hạn.`
                      : 'Miền khả thi rỗng hoặc suy biến.'}
                  </p>
                </div>

                <div className="xl:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileStepView('graph')}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Mở xem Đồ thị Miền Khả Thi</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handlePrevStep} className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyStep4}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                  >
                    <span>Sang Bước 5 (Xác định các đỉnh)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: XÁC ĐỊNH CÁC ĐỈNH & PHƯƠNG ÁN ỨNG VIÊN */}
            {currentStep === 5 && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tọa độ đầy đủ <strong>{vertexEvaluations.length} đỉnh cực biên</strong> của miền phương án khả thi (tìm bằng giao điểm từng cặp đường biên thỏa mãn hệ):
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {vertexEvaluations.map(ve => (
                    <button
                      key={ve.label}
                      type="button"
                      onMouseEnter={() => setHighlightVertex(ve.vertex)}
                      onMouseLeave={() => setHighlightVertex(null)}
                      onClick={() => {
                        setHighlightVertex(ve.vertex);
                        setKValue(ve.value);
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-300 hover:border-purple-500 hover:bg-purple-50 font-mono font-bold text-xs text-purple-950 transition cursor-pointer shadow-2xs text-left flex items-center justify-between"
                    >
                      <span>
                        Đỉnh {ve.label}
                        {formatPointCoord(ve.vertex)}
                      </span>
                      <span className="text-[10px] font-sans font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                        Soi đỉnh
                      </span>
                    </button>
                  ))}
                </div>

                {scenario.integerRequired && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs leading-relaxed">
                    <strong>Mô hình nguyên (x, y ∈ ℕ):</strong> Ngoài các đỉnh liên tục (có thể mang tọa độ phân số như{' '}
                    <code className="font-mono font-bold">(8/3; 8/3)</code>), trên đồ thị còn hiển thị{' '}
                    <strong>{result.integerPoints.length} điểm nguyên khả thi</strong> nằm trong miền đa giác.
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handlePrevStep} className="flex items-center gap-1 text-xs font-semibold text-slate-600 min-h-[44px] cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyStep5}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                  >
                    <span>Sang Bước 6 (Tối ưu hóa)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: TỐI ƯU HÓA HÀM MỤC TIÊU (LEVEL CURVE & PREDICTION) */}
            {currentStep === 6 && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tự tính giá trị hàm mục tiêu tại các đỉnh trong <strong>Bảng tính bên dưới</strong> hoặc kéo <strong>thanh trượt đường mức k</strong> trên đồ thị, sau đó dự đoán đỉnh đạt cực trị liên tục:
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Nhiệm vụ 6: Trên miền liên tục, hàm mục tiêu {objective.label} đạt {objective.goal.toUpperCase()} tại đỉnh nào?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {vertexEvaluations.map(ve => (
                      <button
                        key={ve.label}
                        type="button"
                        onClick={() => {
                          setPredictedOptVertex(ve.label);
                          setHighlightVertex(ve.vertex);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer text-center ${
                          predictedOptVertex === ve.label
                            ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-300'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {ve.label}
                        {formatPointCoord(ve.vertex)}
                      </button>
                    ))}
                  </div>
                </div>

                {step6Feedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      step6Feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {step6Feedback.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    <span className="leading-relaxed">{step6Feedback.message}</span>
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
                      onClick={handleVerifyStep6}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                    >
                      Kiểm chứng đỉnh tối ưu
                    </button>
                    {completedSteps.has(6) && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px] cursor-pointer"
                      >
                        <span>Sang Bước 7 (Kết luận)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: KẾT LUẬN THỰC TIỄN & BÀI HỌC TỐI ƯU */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-50/90 border border-purple-200 text-purple-950 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-purple-900">
                    <Award className="w-5 h-5 text-purple-600 shrink-0" />
                    <span>Bản Kết Luận Thực Tiễn Chuẩn SGK Toán 10</span>
                  </div>

                  <p className="leading-relaxed font-medium whitespace-pre-wrap text-slate-800">
                    {result.practicalAnswer}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white/80 border border-purple-200 font-mono text-[11px] text-purple-900 space-y-1">
                    <div>
                      • Cực trị mô hình liên tục: {objective.label} ={' '}
                      <strong>
                        {optimalValue !== null ? formatValueWithApprox(optimalValue) : 'Không đạt'} {objective.unit}
                      </strong>{' '}
                      tại{' '}
                      <strong>
                        {vertexEvaluations
                          .filter(ve => ve.isOptimal)
                          .map(ve => `${ve.label}${formatPointCoord(ve.vertex)}`)
                          .join(', ') || optimalPoints.map(p => formatPointCoord(p)).join(', ')}
                      </strong>
                      .
                    </div>
                    {scenario.integerRequired && integerOptimalPoint && integerOptimalValue !== null && (
                      <div className="text-rose-800">
                        • Phương án nguyên tối ưu (x, y ∈ ℕ):{' '}
                        <strong>
                          ({integerOptimalPoint.x}; {integerOptimalPoint.y})
                        </strong>{' '}
                        đạt{' '}
                        <strong>
                          {formatValueWithApprox(integerOptimalValue)} {objective.unit}
                        </strong>
                        .
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyConclusion}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-xs text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition min-h-[44px] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-purple-600" />
                    <span>Sao chép kết luận</span>
                  </button>

                  <button
                    type="button"
                    onClick={onSwitchToSandbox}
                    className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 font-semibold text-xs text-purple-800 flex items-center justify-center gap-1.5 transition min-h-[44px] cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-purple-600" />
                    <span>Khám phá tự do</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setCompletedSteps(new Set());
                      setStep1GoalChoice(null);
                      setStep1Feedback(null);
                      setStep2IntegerChoice(null);
                      setStep2Feedback(null);
                      setPredictedOptVertex(null);
                      setStep6Feedback(null);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-purple-600 min-h-[44px] cursor-pointer"
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

        {/* CENTER COLUMN: Interactive Optimization Graph Canvas (xl: 4 cols) */}
        <div
          className={`xl:col-span-4 flex flex-col gap-3 order-2 ${
            mobileStepView === 'graph' || mobileStepView === 'all' ? 'flex' : 'hidden xl:flex'
          }`}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
            <OptimizationGraphCanvas
              scenario={scenario}
              result={result}
              kValue={kValue}
              onKValueChange={setKValue}
              showLevelCurve={currentStep >= 4}
              showIntegerPoints={scenario.integerRequired && currentStep >= 5}
              showOptimalPoint={canRevealOptimal}
              revealOptimalAnswers={canRevealOptimal}
              highlightVertex={highlightVertex}
              onHighlightVertex={setHighlightVertex}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Real-World Scenarios Bank & Mascot (xl: 3 cols) */}
        <div className="hidden xl:flex xl:col-span-3 flex-col gap-3.5 order-3">
          {/* Scenario Selector Bank */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              Ngân hàng 5 tình huống thực tế:
            </span>
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'scenario-1', name: 'Bài 1: Sản xuất A & B', tag: 'SGK chuẩn' },
                { id: 'scenario-2', name: 'Bài 2: Ôn thi Toán - Anh', tag: 'Phân bổ giờ' },
                { id: 'scenario-3', name: 'Bài 3: Phối trộn thức ăn', tag: 'Chi phí MIN' },
                { id: 'scenario-4', name: 'Bài 4: Thuê xe vận tải', tag: 'Vận chuyển' },
                { id: 'scenario-5', name: 'Bài 5: Nông trại trồng cây', tag: 'Vô số nghiệm' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectScenario(s.id)}
                  className={`p-2 rounded-xl border text-left transition text-xs font-bold cursor-pointer flex items-center justify-between ${
                    scenario.id === s.id
                      ? 'border-purple-500 bg-purple-50 text-purple-900 ring-1 ring-purple-300'
                      : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 text-slate-800'
                  }`}
                >
                  <span>{s.name}</span>
                  <span className="text-[10px] font-normal text-slate-500 font-mono">{s.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Mascot Advice */}
          <div className="bg-gradient-to-b from-purple-50/80 to-white rounded-2xl border border-purple-200 p-4 shadow-xs flex flex-col items-center text-center">
            <OptiMascot expression="happy" actionState="nod" size={60} />
            <div className="mt-2 font-bold text-sm text-purple-900">Trợ Lý Tối Ưu Opti</div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Hãy tự tính giá trị tại 4 đỉnh O, A, B, C ở bảng dưới hoặc kéo đường mức k để tìm đúng điểm tiếp xúc cuối cùng!
            </p>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: VERTEX OBJECTIVE CALCULATION TABLE */}
      <div
        className={`mt-1 w-full ${
          mobileStepView === 'table' || mobileStepView === 'all' ? 'block' : 'hidden xl:block'
        }`}
      >
        <VertexObjectiveTable
          scenario={scenario}
          result={result}
          onHighlightVertex={setHighlightVertex}
          onSelectKValue={setKValue}
          defaultRevealed={currentStep >= 7}
          onAllVerifiedChange={setTableAllVerified}
        />
      </div>
    </div>
  );
};
