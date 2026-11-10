import React, { useState, useMemo, useRef } from 'react';
import {
  AssessmentExercise,
  AssessmentTopicId,
  CognitiveLevel,
  ErrorCodeId,
  ExerciseAttemptRecord,
  TeacherAssignment
} from '../../types/assessment';
import { ComparisonOperator } from '../../types/math';
import {
  ASSESSMENT_EXERCISE_BANK,
  ERROR_CODE_CATALOG,
  LEVEL_METADATA,
  TOPIC_METADATA
} from '../../data/assessmentBank';
import { computeStudentAnalytics } from '../../math/assessmentEngine';
import {
  formatBoundaryLine,
  formatExplicitSubstitution,
  formatInequality,
  formatNumberClean,
  getBoundaryStyle,
  getOperatorSymbol,
  isClosedRegion
} from '../../math/mathEngine';
import {
  exportAttemptsToCSV,
  exportAssessmentDataJSON,
  importAssessmentDataFromFile
} from '../../services/assessmentStorage';
import { DocumentLibraryExamBuilder } from './DocumentLibraryExamBuilder';
import {
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
  Database,
  Play,
  RotateCcw,
  Sparkles,
  Wand2,
  Eye,
  EyeOff,
  CheckSquare
} from 'lucide-react';

interface ProblemTemplateDescriptor {
  id: string;
  topic: AssessmentTopicId;
  title: string;
  description: string;
  defaultLevel: CognitiveLevel;
}

const PROBLEM_TEMPLATES: ProblemTemplateDescriptor[] = [
  {
    id: 'TPL_A1',
    topic: 'A',
    title: 'Dạng 1 (Chủ đề A): Kiểm tra điểm M(x₀; y₀) thuộc miền nghiệm BPT',
    description: 'Cho bất phương trình ax + by (dấu) c và điểm M(x₀; y₀). Yêu cầu học sinh thay tọa độ điểm M vào vế trái, tính giá trị và kết luận M có thuộc miền nghiệm hay không.',
    defaultLevel: 'nhan_biet'
  },
  {
    id: 'TPL_A2',
    topic: 'A',
    title: 'Dạng 2 (Chủ đề A): Nhận diện đường thẳng bờ (d) & Kiểu nét vẽ (Liền/Đứt)',
    description: 'Cho bất phương trình bậc nhất hai ẩn. Yêu cầu xác định hệ số a, b, c, phương trình đường bờ (d) và phân biệt miền đóng (nét liền) hay miền mở (nét đứt).',
    defaultLevel: 'thong_hieu'
  },
  {
    id: 'TPL_B1',
    topic: 'B',
    title: 'Dạng 3 (Chủ đề B): Biểu diễn miền nghiệm BPT trên mặt phẳng Oxy',
    description: 'Thực hiện quy trình vẽ đường bờ qua 2 điểm cắt trục tọa độ, thử điểm M ngoài bờ và chọn đúng nửa mặt phẳng nghiệm trên hệ trục Oxy.',
    defaultLevel: 'thong_hieu'
  },
  {
    id: 'TPL_B2',
    topic: 'B',
    title: 'Dạng 4 (Chủ đề B): Bài toán thực tế lập BPT bậc nhất hai ẩn',
    description: 'Mô hình hóa tình huống mua sắm / sản xuất có giới hạn ngân sách thành bất phương trình ax + by ≤ c và kiểm tra phương án thực tế.',
    defaultLevel: 'van_dung'
  },
  {
    id: 'TPL_C1',
    topic: 'C',
    title: 'Dạng 5 (Chủ đề C): Tìm giao điểm hai đường bờ & Kiểm tra đỉnh Hệ BPT',
    description: 'Giải hệ phương trình 2 đường thẳng bờ để tìm tọa độ giao điểm (x; y), sau đó thay vào các bất phương trình còn lại để kết luận đỉnh hợp lệ hay bị loại.',
    defaultLevel: 'van_dung'
  },
  {
    id: 'TPL_C2',
    topic: 'C',
    title: 'Dạng 6 (Chủ đề C): Phân loại miền nghiệm Hệ BPT & Tính diện tích đa giác',
    description: 'Xác định các đỉnh cực biên của miền đa giác nghiệm (tam giác, tứ giác) và tính diện tích miền nghiệm trên mặt phẳng tọa độ.',
    defaultLevel: 'van_dung_cao'
  },
  {
    id: 'TPL_D1',
    topic: 'D',
    title: 'Dạng 7 (Chủ đề D): Bài toán thực tế Tối ưu hóa Lợi nhuận LỚN NHẤT (MAX)',
    description: 'Cho miền phương án khả thi của hệ ràng buộc tài nguyên và hàm mục tiêu lợi nhuận F(x; y) = px + qy. Tính giá trị tại các đỉnh và tìm phương án đạt MAX.',
    defaultLevel: 'van_dung'
  },
  {
    id: 'TPL_D2',
    topic: 'D',
    title: 'Dạng 8 (Chủ đề D): Bài toán thực tế Tối ưu hóa Chi phí NHỎ NHẤT (MIN)',
    description: 'Bài toán khẩu phần dinh dưỡng hoặc thuê xe vận chuyển: Tìm phương án tại các đỉnh cực biên để tổng chi phí F(x; y) đạt giá trị NHỎ NHẤT (MIN).',
    defaultLevel: 'van_dung_cao'
  }
];

interface TeacherDashboardViewProps {
  attempts: ExerciseAttemptRecord[];
  assignments: TeacherAssignment[];
  customExercises?: AssessmentExercise[];
  onSaveAssignment: (assignment: TeacherAssignment) => void;
  onDeleteAssignment: (id: string) => void;
  onCreateCustomExercise?: (exercise: AssessmentExercise) => void;
  onCreateCustomExercisesBatch?: (exercises: AssessmentExercise[]) => void;
  onDeleteCustomExercise?: (id: string) => void;
  onImportData: (attempts: ExerciseAttemptRecord[], assignments: TeacherAssignment[]) => void;
  onClearAttempts: () => void;
  onSelectExercise: (exercise: AssessmentExercise) => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  attempts,
  assignments,
  customExercises = [],
  onSaveAssignment,
  onDeleteAssignment,
  onCreateCustomExercise,
  onCreateCustomExercisesBatch,
  onDeleteCustomExercise,
  onImportData,
  onClearAttempts,
  onSelectExercise
}) => {
  const allExercises = useMemo(
    () => [...customExercises, ...ASSESSMENT_EXERCISE_BANK],
    [customExercises]
  );

  const analytics = useMemo(() => computeStudentAnalytics(attempts), [attempts]);

  // Assignment Builder State
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [builderTopic, setBuilderTopic] = useState<'ALL' | AssessmentTopicId>('ALL');
  const [builderLevel, setBuilderLevel] = useState<'ALL' | CognitiveLevel>('ALL');
  const [selectedExIds, setSelectedExIds] = useState<string[]>(['A01', 'B02', 'C07', 'D05']);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Problem Generator ("Ra đề theo dạng mô tả & mức độ") State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('TPL_A1');
  const [genLevel, setGenLevel] = useState<CognitiveLevel>('nhan_biet');
  const [genA, setGenA] = useState<number>(2);
  const [genB, setGenB] = useState<number>(3);
  const [genOp, setGenOp] = useState<ComparisonOperator>('<=');
  const [genC, setGenC] = useState<number>(12);
  const [genMx, setGenMx] = useState<number>(2);
  const [genMy, setGenMy] = useState<number>(1);
  const [genP, setGenP] = useState<number>(40);
  const [genQ, setGenQ] = useState<number>(30);

  // Answer Key Inspector state in bottom table
  const [inspectedExId, setInspectedExId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeTemplate = useMemo(
    () => PROBLEM_TEMPLATES.find(t => t.id === selectedTemplateId) || PROBLEM_TEMPLATES[0],
    [selectedTemplateId]
  );

  // Randomize parameters according to selected template and cognitive level
  const handleRandomizeParams = (levelOverride?: CognitiveLevel, tplIdOverride?: string) => {
    const lv = levelOverride || genLevel;
    const tpl = tplIdOverride || selectedTemplateId;
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    if (lv === 'nhan_biet') {
      const a = pick([1, 2, 3]);
      const b = pick([1, 2, 4]);
      const c = a * b * pick([2, 3]);
      setGenA(a);
      setGenB(b);
      setGenOp(pick(['<=', '>=']));
      setGenC(c);
      setGenMx(0);
      setGenMy(0);
      setGenP(pick([20, 30, 50]));
      setGenQ(pick([10, 20, 40]));
    } else if (lv === 'thong_hieu') {
      const a = pick([2, 3, -2]);
      const b = pick([-1, 2, 3]);
      const c = pick([6, 8, 12]);
      setGenA(a);
      setGenB(b);
      setGenOp(pick(['<', '>', '<=']));
      setGenC(c);
      setGenMx(pick([1, 2, -1]));
      setGenMy(pick([1, 2, 3]));
      setGenP(pick([35, 45, 60]));
      setGenQ(pick([25, 30, 50]));
    } else if (lv === 'van_dung') {
      const a = pick([3, 4, 5]);
      const b = pick([2, 3, -4]);
      const c = pick([10, 12, 15, 20]);
      setGenA(a);
      setGenB(b);
      setGenOp(tpl === 'TPL_D2' ? '>=' : '<=');
      setGenC(c);
      setGenMx(pick([2, 3, 4]));
      setGenMy(pick([2, 3, 1]));
      setGenP(pick([40, 50, 70]));
      setGenQ(pick([30, 45, 60]));
    } else {
      // van_dung_cao
      const a = pick([3, 5, -3]);
      const b = pick([2, 4, -2]);
      const c = pick([7, 8, 11, 14]);
      setGenA(a);
      setGenB(b);
      setGenOp(pick(['<', '>', '<=', '>=']));
      setGenC(c);
      setGenMx(pick([2, 3, -2]));
      setGenMy(pick([3, -1, 4]));
      setGenP(pick([55, 75, 90]));
      setGenQ(pick([35, 65, 80]));
    }
  };

  // Build live preview of generated exercise
  const previewGeneratedExercise = useMemo<AssessmentExercise>(() => {
    const safeA = genA === 0 && genB === 0 ? 2 : genA;
    const ineq = {
      id: 'gen-ineq-1',
      a: safeA,
      b: genB,
      op: genOp,
      c: genC
    };
    const pointM = { x: genMx, y: genMy };
    const sub = formatExplicitSubstitution(safeA, genB, genMx, genMy);
    const opSym = getOperatorSymbol(genOp);
    const isClosed = isClosedRegion(genOp);
    const lineStyle = getBoundaryStyle(genOp);
    const satisfies =
      genOp === '<='
        ? sub.totalLhs <= genC
        : genOp === '<'
        ? sub.totalLhs < genC
        : genOp === '>='
        ? sub.totalLhs >= genC
        : sub.totalLhs > genC;

    const customId = `GV_${activeTemplate.topic}_${Date.now().toString().slice(-4)}`;

    if (activeTemplate.id === 'TPL_A2') {
      return {
        id: customId,
        topic: 'A',
        level: genLevel,
        interactionType: 'multiple_choice',
        title: `[Đề GV] Nhận diện đường bờ & nét vẽ của ${formatInequality(ineq)}`,
        learningObjective: activeTemplate.description,
        questionText: `Cho bất phương trình bậc nhất hai ẩn: ${formatInequality(ineq)}.\nHãy xác định giá trị vế phải c và kiểu nét vẽ của đường thẳng bờ (d): ${formatBoundaryLine(safeA, genB, genC)}.`,
        mathData: { inequality: ineq, testPoint: pointM },
        steps: [
          {
            stepIndex: 1,
            title: 'Bước 1: Xác định hằng số vế phải c',
            instruction: `Trong phương trình đường bờ (d): ${formatBoundaryLine(safeA, genB, genC)}, hằng số vế phải c bằng bao nhiêu?`,
            inputType: 'number',
            expectedValue: genC,
            tolerance: 0.01
          },
          {
            stepIndex: 2,
            title: 'Bước 2: Chọn kiểu đường biên (d)',
            instruction: `Dựa vào dấu "${opSym}", đường thẳng bờ (d) được biểu diễn bằng nét liền hay nét đứt?`,
            inputType: 'choice',
            expectedValue: lineStyle,
            choices: [
              { id: 'c1', label: 'Nét liền (Miền nghiệm đóng, lấy cả bờ d)', value: 'solid' },
              { id: 'c2', label: 'Nét đứt (Miền nghiệm mở, không lấy bờ d)', value: 'dashed' }
            ]
          }
        ],
        canonicalAnswerSummary: `Đường bờ (d): ${formatBoundaryLine(safeA, genB, genC)}, c = ${genC}, vẽ bằng ${lineStyle === 'solid' ? 'Nét liền (lấy bờ)' : 'Nét đứt (bỏ bờ)'}.`,
        solutionExplanation: `Do bất phương trình mang dấu "${opSym}" (${isClosed ? 'có dấu bằng' : 'dấu nghiêm ngặt'}) nên đường bờ (d): ${formatBoundaryLine(safeA, genB, genC)} được vẽ bằng ${lineStyle === 'solid' ? 'nét liền' : 'nét đứt'}.`,
        hints: {
          tier1: `Quan sát dấu "${opSym}" trong bất phương trình ${formatInequality(ineq)}.`,
          tier2: 'Dấu ≤, ≥ có dấu "=" nên vẽ nét liền; dấu <, > vẽ nét đứt.',
          tier3: `Hằng số vế phải c = ${genC}. Hãy chọn kiểu đường biên tương ứng với dấu "${opSym}".`
        },
        commonErrorCodes: ['E02'],
        rubric: {
          maxPoints: 10,
          criteria: [
            { stepIndex: 1, description: 'Xác định đúng hằng số c', points: 5 },
            { stepIndex: 2, description: 'Chọn đúng kiểu đường bờ', points: 5 }
          ]
        }
      };
    }

    if (activeTemplate.id === 'TPL_B1' || activeTemplate.id === 'TPL_B2') {
      const expectedSide: 'with_test' | 'without_test' = satisfies ? 'with_test' : 'without_test';
      return {
        id: customId,
        topic: 'B',
        level: genLevel,
        interactionType: 'select_half_plane',
        title:
          activeTemplate.id === 'TPL_B2'
            ? `[Đề GV] Bài toán thực tế miền nghiệm ${formatInequality(ineq)}`
            : `[Đề GV] Biểu diễn miền nghiệm của ${formatInequality(ineq)}`,
        learningObjective: activeTemplate.description,
        questionText:
          activeTemplate.id === 'TPL_B2'
            ? `Một kế hoạch phân bổ hai nguồn lực x, y phải thỏa mãn ràng buộc: ${formatInequality(ineq)}.\nSử dụng điểm thử M(${genMx}; ${genMy}), hãy tính giá trị vế trái và chọn nửa mặt phẳng biểu diễn miền nghiệm.`
            : `Biểu diễn miền nghiệm của bất phương trình: ${formatInequality(ineq)} trên mặt phẳng Oxy.\nCho điểm thử M(${genMx}; ${genMy}), hãy tính giá trị vế trái và xác định nửa mặt phẳng nghiệm.`,
        mathData: { inequality: ineq, testPoint: pointM },
        steps: [
          {
            stepIndex: 1,
            title: `Bước 1: Thay tọa độ điểm thử M(${genMx}; ${genMy}) vào vế trái`,
            instruction: `Tính giá trị biểu thức ${sub.exprWithMul}:`,
            inputType: 'number',
            expectedValue: sub.totalLhs,
            tolerance: 0.01
          },
          {
            stepIndex: 2,
            title: 'Bước 2: Chọn nửa mặt phẳng miền nghiệm',
            instruction: `So sánh kết quả vừa tính với ${genC} qua dấu "${opSym}" và chọn nửa mặt phẳng đúng:`,
            inputType: 'canvas_half_plane',
            expectedHalfPlaneSide: expectedSide
          }
        ],
        canonicalAnswerSummary: `Tại M(${genMx}; ${genMy}), VT = ${formatNumberClean(sub.totalLhs)} ${opSym} ${genC} (${satisfies ? 'Đúng' : 'Sai'}). Miền nghiệm là nửa mặt phẳng bờ (d) ${satisfies ? 'CHỨA' : 'KHÔNG chứa'} điểm M(${genMx}; ${genMy}).`,
        solutionExplanation: `Thay x = ${genMx}, y = ${genMy} vào vế trái ta có ${sub.exprWithMul} = ${formatNumberClean(sub.totalLhs)}. Vì ${formatNumberClean(sub.totalLhs)} ${opSym} ${genC} là mệnh đề ${satisfies ? 'ĐÚNG' : 'SAI'}, miền nghiệm là nửa mặt phẳng bờ (d): ${formatBoundaryLine(safeA, genB, genC)} ${satisfies ? 'chứa M' : 'không chứa M'}.`,
        hints: {
          tier1: `Thay x = ${genMx} và y = ${genMy} vào vế trái của ${formatInequality(ineq)}.`,
          tier2: 'Nếu mệnh đề sau khi thay số là ĐÚNG thì chọn nửa mặt phẳng chứa M; nếu SAI thì chọn nửa mặt phẳng không chứa M.',
          tier3: `Tính ${sub.exprWithMul} rồi đối chiếu với vế phải c = ${genC}.`
        },
        commonErrorCodes: ['E01', 'E05'],
        rubric: {
          maxPoints: 10,
          criteria: [
            { stepIndex: 1, description: 'Tính đúng giá trị vế trái tại M', points: 5 },
            { stepIndex: 2, description: 'Chọn đúng nửa mặt phẳng nghiệm', points: 5 }
          ]
        }
      };
    }

    if (activeTemplate.id === 'TPL_C1' || activeTemplate.id === 'TPL_C2') {
      // System with clean intersection (genMx, genMy)
      const c1 = safeA * genMx + genB * genMy;
      const c2 = genMx + genMy;
      const sys = [
        { id: 's1', a: safeA, b: genB, op: '<=' as ComparisonOperator, c: c1, label: '(d1)', color: '#2563eb' },
        { id: 's2', a: 1, b: 1, op: '<=' as ComparisonOperator, c: c2, label: '(d2)', color: '#16a34a' },
        { id: 's3', a: 1, b: 0, op: '>=' as ComparisonOperator, c: 0, label: '(d3)', color: '#d97706' },
        { id: 's4', a: 0, b: 1, op: '>=' as ComparisonOperator, c: 0, label: '(d4)', color: '#9333ea' }
      ];
      return {
        id: customId,
        topic: 'C',
        level: genLevel,
        interactionType: 'find_intersection',
        title: `[Đề GV] Tìm giao điểm & Đỉnh miền nghiệm Hệ BPT (${formatBoundaryLine(safeA, genB, c1)} và x + y = ${c2})`,
        learningObjective: activeTemplate.description,
        questionText: `Cho hệ bất phương trình:\n(1) ${formatInequality(sys[0])}\n(2) ${formatInequality(sys[1])}\n(3) x ≥ 0, y ≥ 0.\nHãy tìm tọa độ giao điểm A của hai đường thẳng bờ (d1): ${formatBoundaryLine(safeA, genB, c1)} và (d2): x + y = ${c2}, sau đó kiểm tra xem A có thuộc miền nghiệm của hệ không.`,
        mathData: {
          system: sys,
          intersectionLinePair: [0, 1]
        },
        steps: [
          {
            stepIndex: 1,
            title: 'Bước 1: Tìm tọa độ giao điểm A = (d1) ∩ (d2)',
            instruction: `Giải hệ phương trình ${formatBoundaryLine(safeA, genB, c1)} và x + y = ${c2} để tìm (x; y):`,
            inputType: 'coordinate',
            expectedPoint: { x: genMx, y: genMy },
            tolerance: 0.05
          },
          {
            stepIndex: 2,
            title: 'Bước 2: Kiểm tra điều kiện đỉnh của miền nghiệm',
            instruction: `Với giao điểm A(${genMx}; ${genMy}) vừa tìm được, đối chiếu với điều kiện x ≥ 0, y ≥ 0 xem A có phải là đỉnh hợp lệ của miền nghiệm không:`,
            inputType: 'choice',
            expectedValue: genMx >= 0 && genMy >= 0 ? 'feasible' : 'infeasible',
            choices: [
              { id: 'f1', label: 'Thỏa mãn toàn bộ hệ (Là đỉnh hợp lệ của miền nghiệm)', value: 'feasible' },
              { id: 'f2', label: 'Vi phạm điều kiện không âm (Bị loại)', value: 'infeasible' }
            ]
          }
        ],
        canonicalAnswerSummary: `Giao điểm A(${genMx}; ${genMy}) — ${genMx >= 0 && genMy >= 0 ? 'Là đỉnh hợp lệ của miền nghiệm' : 'Bị loại do vi phạm x ≥ 0, y ≥ 0'}.`,
        solutionExplanation: `Giải hệ phương trình hai đường bờ (d1) và (d2) ta được nghiệm duy nhất A(${genMx}; ${genMy}). Kiểm tra với các ràng buộc x ≥ 0, y ≥ 0 ta kết luận A ${genMx >= 0 && genMy >= 0 ? 'thuộc miền nghiệm' : 'bị loại'}.`,
        hints: {
          tier1: `Từ phương trình (d2): x + y = ${c2}, hãy rút y = ${c2} - x rồi thế vào phương trình (d1).`,
          tier2: 'Sau khi tìm được (x; y), hãy kiểm tra xem cả x và y có đều lớn hơn hoặc bằng 0 hay không.',
          tier3: `Thay vào hệ phương trình để tìm hoành độ x và tung độ y của điểm A.`
        },
        commonErrorCodes: ['E06', 'E07'],
        rubric: {
          maxPoints: 10,
          criteria: [
            { stepIndex: 1, description: 'Tìm đúng tọa độ giao điểm A', points: 6 },
            { stepIndex: 2, description: 'Kết luận đúng tính hợp lệ của đỉnh A', points: 4 }
          ]
        }
      };
    }

    if (activeTemplate.id === 'TPL_D1' || activeTemplate.id === 'TPL_D2') {
      const isMin = activeTemplate.id === 'TPL_D2';
      const vx = Math.max(1, Math.abs(genMx));
      const vy = Math.max(1, Math.abs(genMy));
      const fVal = genP * vx + genQ * vy;
      const sys = [
        { id: 'd1', a: 1, b: 1, op: (isMin ? '>=' : '<=') as ComparisonOperator, c: vx + vy, label: '(d1)', color: '#2563eb' },
        { id: 'd2', a: 1, b: 0, op: '>=' as ComparisonOperator, c: 0, label: '(d2)', color: '#16a34a' },
        { id: 'd3', a: 0, b: 1, op: '>=' as ComparisonOperator, c: 0, label: '(d3)', color: '#d97706' }
      ];
      return {
        id: customId,
        topic: 'D',
        level: genLevel,
        interactionType: 'enter_objective_value',
        title: `[Đề GV] Bài toán tối ưu ${isMin ? 'Chi phí MIN' : 'Lợi nhuận MAX'}: F(x; y) = ${genP}x + ${genQ}y`,
        learningObjective: activeTemplate.description,
        questionText: `Một cơ sở kinh doanh xét phương án (x; y) tại đỉnh cực biên A(${vx}; ${vy}) của miền khả thi.\nCho hàm mục tiêu ${isMin ? 'chi phí' : 'lợi nhuận'} F(x; y) = ${genP}x + ${genQ}y (nghìn đồng).\nHãy tính giá trị của hàm mục tiêu F tại đỉnh A(${vx}; ${vy}) và xác định mục tiêu tối ưu của bài toán.`,
        mathData: {
          system: sys,
          objective: {
            a: genP,
            b: genQ,
            goal: isMin ? 'min' : 'max',
            name: isMin ? 'Chi phí' : 'Lợi nhuận',
            unit: 'nghìn đồng',
            label: `F(x; y) = ${genP}x + ${genQ}y`
          },
          evaluationVertex: { label: 'A', point: { x: vx, y: vy } }
        },
        steps: [
          {
            stepIndex: 1,
            title: `Bước 1: Tính giá trị hàm mục tiêu F tại đỉnh A(${vx}; ${vy})`,
            instruction: `Thay x = ${vx}, y = ${vy} vào F(x; y) = ${genP}x + ${genQ}y:`,
            inputType: 'number',
            expectedValue: fVal,
            tolerance: 0.01
          },
          {
            stepIndex: 2,
            title: 'Bước 2: Xác định nguyên tắc đạt cực trị trên miền đa giác',
            instruction: `Theo định lý quy hoạch tuyến tính SGK Toán 10, hàm mục tiêu F(x; y) đạt giá trị ${isMin ? 'NHỎ NHẤT (MIN)' : 'LỚN NHẤT (MAX)'} ở đâu trên miền đa giác lồi?`,
            inputType: 'choice',
            expectedValue: 'vertices',
            choices: [
              { id: 'v1', label: 'Đạt tại một trong các đỉnh của đa giác miền nghiệm', value: 'vertices' },
              { id: 'v2', label: 'Chỉ đạt tại gốc tọa độ O(0; 0)', value: 'origin_only' }
            ]
          }
        ],
        canonicalAnswerSummary: `Tại đỉnh A(${vx}; ${vy}), F(${vx}; ${vy}) = ${genP}×${vx} + ${genQ}×${vy} = ${fVal} (nghìn đồng). Cực trị đạt tại đỉnh của đa giác miền nghiệm.`,
        solutionExplanation: `Thay tọa độ đỉnh A(${vx}; ${vy}) vào hàm mục tiêu F(x; y) = ${genP}x + ${genQ}y ta được ${genP}×${vx} + ${genQ}×${vy} = ${fVal}.`,
        hints: {
          tier1: `Thay hoành độ x = ${vx} và tung độ y = ${vy} vào biểu thức ${genP}x + ${genQ}y.`,
          tier2: 'Thực hiện phép nhân trước rồi cộng hai tích lại với nhau.',
          tier3: `Tính ${genP} × ${vx} + ${genQ} × ${vy}.`
        },
        commonErrorCodes: ['E09', 'E10'],
        rubric: {
          maxPoints: 10,
          criteria: [
            { stepIndex: 1, description: 'Tính đúng giá trị hàm mục tiêu F tại đỉnh A', points: 6 },
            { stepIndex: 2, description: 'Nắm vững nguyên lý cực trị tại đỉnh đa giác', points: 4 }
          ]
        }
      };
    }

    // Default: TPL_A1 (Check point M in inequality)
    return {
      id: customId,
      topic: 'A',
      level: genLevel,
      interactionType: 'multiple_choice',
      title: `[Đề GV] Kiểm tra điểm M(${genMx}; ${genMy}) với BPT ${formatInequality(ineq)}`,
      learningObjective: activeTemplate.description,
      questionText: `Cho bất phương trình bậc nhất hai ẩn: ${formatInequality(ineq)} và điểm M(${genMx}; ${genMy}).\nHãy thay tọa độ điểm M vào vế trái của bất phương trình để tính giá trị và kết luận điểm M có thuộc miền nghiệm hay không.`,
      mathData: { inequality: ineq, testPoint: pointM },
      steps: [
        {
          stepIndex: 1,
          title: `Bước 1: Tính giá trị vế trái tại M(${genMx}; ${genMy})`,
          instruction: `Thay x = ${genMx}, y = ${genMy} vào biểu thức ${sub.exprWithMul}. Kết quả bằng bao nhiêu?`,
          inputType: 'number',
          expectedValue: sub.totalLhs,
          tolerance: 0.01
        },
        {
          stepIndex: 2,
          title: 'Bước 2: Kết luận điểm M có thuộc miền nghiệm không',
          instruction: `So sánh kết quả vế trái với ${genC} qua dấu "${opSym}" và chọn kết luận đúng:`,
          inputType: 'choice',
          expectedValue: satisfies ? 'belongs' : 'not_belongs',
          choices: [
            {
              id: 'b1',
              label: `M(${genMx}; ${genMy}) THUỘC miền nghiệm (vì mệnh đề so sánh ĐÚNG)`,
              value: 'belongs'
            },
            {
              id: 'b2',
              label: `M(${genMx}; ${genMy}) KHÔNG thuộc miền nghiệm (vì mệnh đề so sánh SAI)`,
              value: 'not_belongs'
            }
          ]
        }
      ],
      canonicalAnswerSummary: `Vế trái = ${sub.exprWithMul} = ${formatNumberClean(sub.totalLhs)}. So sánh: ${formatNumberClean(sub.totalLhs)} ${opSym} ${genC} là ${satisfies ? 'ĐÚNG → M thuộc miền nghiệm' : 'SAI → M không thuộc miền nghiệm'}.`,
      solutionExplanation: `Thay x = ${genMx}, y = ${genMy} vào vế trái ta được ${sub.exprWithMul} = ${formatNumberClean(sub.totalLhs)}. Đối chiếu với dấu "${opSym} ${genC}", mệnh đề ${satisfies ? 'thỏa mãn nên M là nghiệm' : 'không thỏa mãn nên M không thuộc miền nghiệm'}.`,
      hints: {
        tier1: `Thay x = ${genMx} và y = ${genMy} vào vế trái của bất phương trình ${formatInequality(ineq)}.`,
        tier2: `Thực hiện phép tính: ${sub.exprWithMul}, sau đó so sánh kết quả với vế phải c = ${genC}.`,
        tier3: `Nếu phép so sánh với dấu "${opSym}" là ĐÚNG thì M thuộc miền nghiệm, ngược lại là KHÔNG thuộc.`
      },
      commonErrorCodes: ['E01', 'E02'],
      rubric: {
        maxPoints: 10,
        criteria: [
          { stepIndex: 1, description: 'Tính đúng giá trị vế trái khi thay tọa độ M', points: 5 },
          { stepIndex: 2, description: 'Kết luận đúng tính thuộc miền nghiệm', points: 5 }
        ]
      }
    };
  }, [activeTemplate, genLevel, genA, genB, genOp, genC, genMx, genMy, genP, genQ]);

  const handleSaveGeneratedExercise = (alsoAssignImmediately: boolean) => {
    const newEx = previewGeneratedExercise;
    if (onCreateCustomExercise) {
      onCreateCustomExercise(newEx);
    }
    setSelectedExIds(prev => (prev.includes(newEx.id) ? prev : [newEx.id, ...prev]));

    if (alsoAssignImmediately) {
      const quickAssignment: TeacherAssignment = {
        id: `assign_${Date.now()}`,
        title: `Đề Giáo viên giao: ${newEx.title.replace('[Đề GV] ', '')}`,
        description: `${activeTemplate.title} — Mức độ: ${LEVEL_METADATA[genLevel].label}`,
        createdAt: Date.now(),
        targetTopics: [newEx.topic],
        targetLevels: [newEx.level],
        exerciseIds: [newEx.id]
      };
      onSaveAssignment(quickAssignment);
      setStatusBanner(
        `Đã tạo bài tập mới (${newEx.id}) và giao trực tiếp thành phiếu "${quickAssignment.title}" cho Học sinh!`
      );
    } else {
      setStatusBanner(
        `Đã thêm bài tập mới (${newEx.id}: ${newEx.title}) vào Ngân hàng đề và tích chọn sẵn trong Phiếu giao bài!`
      );
    }
  };

  const filteredPool = useMemo(() => {
    return allExercises.filter(ex => {
      if (builderTopic !== 'ALL' && ex.topic !== builderTopic) return false;
      if (builderLevel !== 'ALL' && ex.level !== builderLevel) return false;
      return true;
    });
  }, [allExercises, builderTopic, builderLevel]);

  const toggleExerciseSelection = (id: string) => {
    setSelectedExIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedExIds.length === 0) {
      setStatusBanner('Vui lòng nhập tên bộ bài tập và chọn ít nhất 1 bài tập.');
      return;
    }

    const chosenExercises = allExercises.filter(ex =>
      selectedExIds.includes(ex.id)
    );
    const topics = Array.from(
      new Set(chosenExercises.map(ex => ex.topic))
    ) as AssessmentTopicId[];
    const levels = Array.from(
      new Set(chosenExercises.map(ex => ex.level))
    ) as CognitiveLevel[];

    const newAssignment: TeacherAssignment = {
      id: `assign_${Date.now()}`,
      title: title.trim(),
      description:
        description.trim() ||
        `Bộ đề gồm ${selectedExIds.length} bài tập chuẩn hóa Toán 10.`,
      createdAt: Date.now(),
      targetTopics: topics,
      targetLevels: levels,
      exerciseIds: selectedExIds
    };

    onSaveAssignment(newAssignment);
    setTitle('');
    setDescription('');
    setStatusBanner(`Đã giao bộ bài tập "${newAssignment.title}" (${selectedExIds.length} bài) cho chế độ Học sinh!`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await importAssessmentDataFromFile(file);
      onImportData(res.attempts, res.assignments);
      setStatusBanner(`Đã nhập thành công ${res.importedCount} bản ghi từ tệp ${file.name}.`);
    } catch {
      setStatusBanner('Tệp nhập vào không đúng định dạng JSON/CSV của OPTIMATH LAB.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const maxErrorCount = Math.max(
    1,
    ...analytics.errorFrequency.map(item => item.count)
  );

  return (
    <div className="space-y-6">
      {/* Top Local Storage Notice & Export/Import Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-indigo-700 font-bold">
            <Database className="w-4 h-4" />
            <span>Trung Tâm Quản Lý Giáo Viên (Ra Đề · Giao Đề · Kiểm Tra Đáp Án & Chấm Đúng/Sai)</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Dashboard Giáo viên & Hệ thống Ra đề theo Dạng mô tả / Mức độ
          </h2>
          <p className="text-xs text-slate-600">
            Giáo viên có thể tự động ra đề mới theo 8 dạng bài mô tả với 4 mức độ nhận thức, giao bộ đề cho học sinh, và xem nhanh đáp án chuẩn + kết quả chấm Đúng/Sai từng bài.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => exportAttemptsToCSV(attempts)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất CSV ({attempts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => exportAssessmentDataJSON(attempts, assignments)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Xuất JSON</span>
          </button>

          <label className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Nhập JSON/CSV</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {attempts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onClearAttempts();
                setStatusBanner('Đã đặt lại lịch sử làm bài cục bộ trên trình duyệt.');
              }}
              className="px-3 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại tiến độ</span>
            </button>
          )}
        </div>
      </div>

      {statusBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-emerald-800 font-bold hover:underline cursor-pointer ml-3 shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* SECTION 0: BACKEND DOCUMENT LIBRARY & QUESTION-TYPE MATRIX EXAM BUILDER */}
      <DocumentLibraryExamBuilder
        onPublishExercisesToBank={exercises => {
          if (onCreateCustomExercisesBatch) {
            onCreateCustomExercisesBatch(exercises);
          } else if (onCreateCustomExercise) {
            exercises.forEach(ex => onCreateCustomExercise(ex));
          }
        }}
        onCreateAssignmentFromLibrary={(newAssignment, exercises) => {
          if (onCreateCustomExercisesBatch) {
            onCreateCustomExercisesBatch(exercises);
          } else if (onCreateCustomExercise) {
            exercises.forEach(ex => onCreateCustomExercise(ex));
          }
          onSaveAssignment(newAssignment);
        }}
        onSelectExercise={onSelectExercise}
        onNotify={msg => setStatusBanner(msg)}
      />

      {/* SECTION A: CUSTOM PROBLEM GENERATOR BY DESCRIPTION & COGNITIVE LEVEL */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 rounded-2xl border-2 border-indigo-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider mb-1">
              <Wand2 className="w-3 h-3" />
              Công cụ Ra Đề Thông Minh Theo Dạng Mô Tả & Mức Độ
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              1. Ra Đề Mới Cho Học Sinh Theo Dạng Bài Mô Tả & Mức Độ Khác Nhau
            </h3>
            <p className="text-xs text-slate-600">
              Chọn dạng toán mô tả và mức độ nhận thức, tùy chỉnh thông số (hoặc bấm sinh số tự động) để tạo đề kèm đáp án chấm tự động từng bước.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleRandomizeParams()}
            className="px-3.5 py-2 rounded-xl bg-white border-2 border-indigo-300 hover:bg-indigo-50 text-indigo-800 font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Sinh bộ số ngẫu nhiên theo mức độ</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Select Template + Level + Parameters (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                Bước 1: Chọn dạng bài tập theo mô tả sư phạm (8 dạng chuẩn Toán 10):
              </label>
              <select
                value={selectedTemplateId}
                onChange={e => {
                  const nextId = e.target.value;
                  setSelectedTemplateId(nextId);
                  const tpl = PROBLEM_TEMPLATES.find(t => t.id === nextId);
                  if (tpl) {
                    setGenLevel(tpl.defaultLevel);
                    handleRandomizeParams(tpl.defaultLevel, nextId);
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-indigo-200 bg-white text-xs sm:text-sm font-bold text-slate-900 focus:border-indigo-600 outline-none cursor-pointer"
              >
                {PROBLEM_TEMPLATES.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title}
                  </option>
                ))}
              </select>
              <div className="mt-1.5 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 leading-relaxed">
                <strong>Mô tả dạng toán:</strong> {activeTemplate.description}
              </div>
            </div>

            {/* Step 2: Select Level */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                Bước 2: Chọn mức độ nhận thức của đề bài:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'] as CognitiveLevel[]).map(lv => {
                  const active = genLevel === lv;
                  return (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => {
                        setGenLevel(lv);
                        handleRandomizeParams(lv, selectedTemplateId);
                      }}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-300'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {LEVEL_METADATA[lv].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Customize Math Parameters */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800">
                Bước 3: Tùy chỉnh tham số Toán học của đề (hoặc giữ bộ số tự động):
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">Hệ số a</label>
                  <input
                    type="number"
                    value={genA}
                    onChange={e => setGenA(parseFloat(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">Hệ số b</label>
                  <input
                    type="number"
                    value={genB}
                    onChange={e => setGenB(parseFloat(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">Dấu BPT</label>
                  <select
                    value={genOp}
                    onChange={e => setGenOp(e.target.value as ComparisonOperator)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-center bg-white"
                  >
                    <option value="<=">≤</option>
                    <option value="<">&lt;</option>
                    <option value=">=">≥</option>
                    <option value=">">&gt;</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">Vế phải c</label>
                  <input
                    type="number"
                    value={genC}
                    onChange={e => setGenC(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                    Hoành độ điểm M / A (x₀)
                  </label>
                  <input
                    type="number"
                    value={genMx}
                    onChange={e => setGenMx(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                    Tung độ điểm M / A (y₀)
                  </label>
                  <input
                    type="number"
                    value={genMy}
                    onChange={e => setGenMy(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-center"
                  />
                </div>
                {(activeTemplate.id === 'TPL_D1' || activeTemplate.id === 'TPL_D2') && (
                  <>
                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                        Hệ số mục tiêu p (x)
                      </label>
                      <input
                        type="number"
                        value={genP}
                        onChange={e => setGenP(parseFloat(e.target.value) || 10)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                        Hệ số mục tiêu q (y)
                      </label>
                      <input
                        type="number"
                        value={genQ}
                        onChange={e => setGenQ(parseFloat(e.target.value) || 10)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-center"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Preview of Generated Problem + Answer Key + Action Buttons (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border-2 border-indigo-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-extrabold text-[10px] uppercase">
                Xem trước Đề & Đáp Án Chuẩn
              </span>
              <span className="text-[11px] font-bold text-purple-700">
                Chủ đề {previewGeneratedExercise.topic} • {LEVEL_METADATA[genLevel].label}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-extrabold text-slate-900">{previewGeneratedExercise.title}</div>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                {previewGeneratedExercise.questionText}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1">
              <div className="font-extrabold text-emerald-900">Đáp án chuẩn (Dành cho Giáo viên):</div>
              <p className="text-emerald-950 font-medium leading-relaxed">
                {previewGeneratedExercise.canonicalAnswerSummary}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSaveGeneratedExercise(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm vào Ngân hàng đề</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveGeneratedExercise(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ra đề & Giao ngay cho HS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Left Assignment Creator + Right Error & Topic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Create & Assign Exercise Sets (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              2. Tạo Phiếu Giao Đề Từ Ngân Hàng ({allExercises.length} bài tập)
            </h3>
            <p className="text-xs text-slate-500">
              Lọc theo chủ đề, mức độ nhận thức và tích chọn các bài tập (bao gồm cả đề Giáo viên vừa tạo) để giao cho Học sinh
            </p>
          </div>

          <form onSubmit={handleCreateAssignment} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên phiếu bài tập / nhiệm vụ giao cho học sinh:
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="VD: Kiểm tra 15 phút - Hệ BPT & Tối ưu tuyến tính"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mô tả dạng bài / Yêu cầu cho học sinh:
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="VD: Hoàn thành tất cả các bước để AI Opti chấm điểm Đúng/Sai..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Lọc theo chủ đề:
                </label>
                <select
                  value={builderTopic}
                  onChange={e =>
                    setBuilderTopic(e.target.value as 'ALL' | AssessmentTopicId)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="ALL">Tất cả 4 chủ đề</option>
                  <option value="A">Chủ đề A: Một BPT</option>
                  <option value="B">Chủ đề B: Miền nghiệm</option>
                  <option value="C">Chủ đề C: Hệ BPT</option>
                  <option value="D">Chủ đề D: Tối ưu tuyến tính</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Lọc theo mức độ:
                </label>
                <select
                  value={builderLevel}
                  onChange={e =>
                    setBuilderLevel(e.target.value as 'ALL' | CognitiveLevel)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="ALL">Tất cả 4 mức độ</option>
                  <option value="nhan_biet">Nhận biết</option>
                  <option value="thong_hieu">Thông hiểu</option>
                  <option value="van_dung">Vận dụng</option>
                  <option value="van_dung_cao">Vận dụng cao</option>
                </select>
              </div>
            </div>

            {/* Exercise Selection Checklist */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Chọn bài tập ({selectedExIds.length} bài đã chọn):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedExIds(filteredPool.map(e => e.id))
                    }
                    className="text-[11px] text-indigo-700 font-semibold hover:underline cursor-pointer"
                  >
                    Chọn tất cả đang lọc ({filteredPool.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedExIds([])}
                    className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {filteredPool.map(ex => {
                  const checked = selectedExIds.includes(ex.id);
                  const isCustom = ex.id.startsWith('GV_');
                  return (
                    <label
                      key={ex.id}
                      className={`px-3 py-2 flex items-center justify-between gap-2 text-xs hover:bg-slate-50 cursor-pointer ${
                        isCustom ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExerciseSelection(ex.id)}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        <span className="font-mono font-bold text-slate-900">
                          {ex.id}
                        </span>
                        <span className="truncate text-slate-700">{ex.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-slate-500">
                          {LEVEL_METADATA[ex.level].label}
                        </span>
                        {isCustom && onDeleteCustomExercise && (
                          <button
                            type="button"
                            onClick={ev => {
                              ev.preventDefault();
                              onDeleteCustomExercise(ex.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Xóa đề tự tạo này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Giao bộ bài tập này cho Học sinh ({selectedExIds.length} câu)</span>
            </button>
          </form>

          {/* Existing Teacher Assignments */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800">
              Danh sách bộ đề đã giao cho Học sinh ({assignments.length}):
            </h4>
            {assignments.map(a => (
              <div
                key={a.id}
                className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs bg-slate-50/60"
              >
                <div className="min-w-0 space-y-0.5">
                  <span className="font-bold text-slate-900 block truncate">
                    {a.title}
                  </span>
                  <p className="text-[11px] text-slate-600 truncate">{a.description}</p>
                  <span className="text-[11px] text-indigo-700 font-mono font-bold block">
                    {a.exerciseIds.length} bài: {a.exerciseIds.join(', ')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteAssignment(a.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                  title="Xóa phiếu bài tập"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Error Statistics & Topic Performance Charts (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Chart 1: Error Statistics by Error Code E01-E10 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                3. Biểu đồ Thống kê Mã Lỗi Học tập (E01 – E10)
              </h3>
              <p className="text-xs text-slate-500">
                Tần suất các lỗi sai được Math Engine phát hiện trong quá trình chấm theo bước
              </p>
            </div>

            <div className="space-y-2.5">
              {(Object.keys(ERROR_CODE_CATALOG) as ErrorCodeId[]).map(code => {
                const def = ERROR_CODE_CATALOG[code];
                const count =
                  analytics.errorFrequency.find(e => e.code === code)?.count || 0;
                const widthPct =
                  count > 0 ? Math.max(8, Math.round((count / maxErrorCount) * 100)) : 2;

                return (
                  <div key={code} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-800 font-medium truncate">
                        <strong className="font-mono text-indigo-700">{code}</strong> · {def.title}
                      </span>
                      <span className="font-mono font-bold tabular-nums text-slate-700 shrink-0">
                        {count} lượt
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          count > 0 ? 'bg-amber-500' : 'bg-slate-200'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Statistics by Topic A, B, C, D */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              4. Thống kê Năng lực & Lỗi theo 4 Chủ đề
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-2 font-bold">Chủ đề</th>
                    <th className="py-2 px-2 font-bold text-right">Hoàn thành</th>
                    <th className="py-2 px-2 font-bold text-right">Đúng lần đầu</th>
                    <th className="py-2 pl-2 font-bold text-right">Tổng lỗi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  {(['A', 'B', 'C', 'D'] as AssessmentTopicId[]).map(tId => {
                    const st = analytics.topicStats[tId];
                    return (
                      <tr key={tId}>
                        <td className="py-2.5 pr-2 font-sans font-bold text-slate-800">
                          {st.shortName}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-700">
                          {st.completedCount}/{st.totalCount}
                        </td>
                        <td className="py-2.5 px-2 text-right text-emerald-700 font-bold">
                          {st.accuracyPercent}%
                        </td>
                        <td className="py-2.5 pl-2 text-right text-amber-700 font-bold">
                          {st.errorCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Detailed Results & Teacher Answer Key Inspector per Exercise */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              5. Bảng Kiểm Tra Đúng/Sai & Đáp Án Chi Tiết Từng Bài Tập ({allExercises.length} bài)
            </h3>
            <p className="text-xs text-slate-500">
              Giáo viên bấm "Đáp án & Chấm" ở bất kỳ bài nào để xem ngay Đáp án chuẩn từng bước và chi tiết lịch sử trả lời Đúng/Sai của học sinh
            </p>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 z-10">
              <tr>
                <th className="py-2.5 px-3 font-bold">Mã bài</th>
                <th className="py-2.5 px-3 font-bold">Tên bài tập & Chủ đề</th>
                <th className="py-2.5 px-3 font-bold">Mức độ</th>
                <th className="py-2.5 px-3 font-bold text-right">Kết quả HS</th>
                <th className="py-2.5 px-3 font-bold text-right">Điểm đạt</th>
                <th className="py-2.5 px-3 font-bold">Mã lỗi</th>
                <th className="py-2.5 px-3 font-bold text-right">Kiểm tra & Đáp án GV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allExercises.map(ex => {
                const exAttempts = attempts.filter(a => a.exerciseId === ex.id);
                const latest = exAttempts[0];
                const bestScore = exAttempts.reduce(
                  (m, a) => Math.max(m, a.scoreEarned),
                  0
                );
                const allErrors = Array.from(
                  new Set(exAttempts.flatMap(a => a.errorCodes))
                );
                const isInspected = inspectedExId === ex.id;

                return (
                  <React.Fragment key={ex.id}>
                    <tr className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {ex.id}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        <div>{ex.title}</div>
                        <div className="text-[10px] text-slate-500">
                          {TOPIC_METADATA[ex.topic].shortTitle}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {LEVEL_METADATA[ex.level].label}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold">
                        {latest?.isCompleted ? (
                          <span className="text-emerald-700 inline-flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ĐÚNG ({latest.totalAttempts} lần thử)</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Chưa làm</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-800">
                        {latest ? `${bestScore}/${ex.rubric.maxPoints}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-amber-800">
                        {allErrors.length > 0 ? allErrors.join(', ') : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectedExId(isInspected ? null : ex.id)}
                            className={`px-2.5 py-1 rounded-lg border font-bold cursor-pointer inline-flex items-center gap-1 transition ${
                              isInspected
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800'
                            }`}
                          >
                            {isInspected ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>Đáp án & Chấm</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectExercise(ex)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 font-semibold text-slate-700 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>Mở bài</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isInspected && (
                      <tr className="bg-purple-50/60">
                        <td colSpan={7} className="p-4">
                          <div className="bg-white rounded-xl border border-purple-200 p-3.5 space-y-2.5 text-xs shadow-2xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-2">
                              <span className="font-extrabold text-purple-950">
                                Đề bài & Đáp án chuẩn Giáo viên — Bài {ex.id}: {ex.title}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-emerald-700">
                                Điểm tối đa: {ex.rubric.maxPoints}đ ({ex.steps.length} bước chấm)
                              </span>
                            </div>
                            <p className="text-slate-700 whitespace-pre-line">{ex.questionText}</p>
                            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                              <div>
                                <strong>• Đáp án chuẩn:</strong> {ex.canonicalAnswerSummary}
                              </div>
                              <div className="mt-1 text-slate-700">
                                <strong>• Giải thích chi tiết:</strong> {ex.solutionExplanation}
                              </div>
                            </div>

                            {latest && latest.stepRecords.length > 0 && (
                              <div className="space-y-1 pt-1">
                                <div className="font-bold text-slate-800">
                                  Chi tiết bài làm gần nhất của Học sinh:
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {latest.stepRecords.map(sr => (
                                    <div
                                      key={sr.stepIndex}
                                      className={`p-2 rounded-lg border flex items-center justify-between ${
                                        sr.isCorrect
                                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                                          : 'bg-rose-50/60 border-rose-200 text-rose-900'
                                      }`}
                                    >
                                      <span>
                                        Bước {sr.stepIndex}: <strong className="font-mono">{sr.studentAnswerRaw}</strong>
                                      </span>
                                      <span className="font-bold">
                                        {sr.isCorrect ? '✓ ĐÚNG' : '✗ SAI'} ({sr.attemptsCount} lần thử)
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
