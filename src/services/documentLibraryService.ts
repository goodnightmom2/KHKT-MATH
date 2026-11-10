import {
  AssessmentExercise,
  AssessmentTopicId,
  CognitiveLevel,
  ExamTypeSlotConfig,
  LibraryDocument,
  QuestionCategoryId
} from '../types/assessment';
import { ComparisonOperator } from '../types/math';
import {
  formatBoundaryLine,
  formatExplicitSubstitution,
  formatInequality,
  formatNumberClean,
  getBoundaryStyle,
  getOperatorSymbol,
  isClosedRegion
} from '../math/mathEngine';

export interface QuestionCategoryMeta {
  id: QuestionCategoryId;
  topic: AssessmentTopicId;
  shortTitle: string;
  title: string;
  description: string;
  defaultLevel: CognitiveLevel;
  badgeColor: string;
}

export const QUESTION_CATEGORY_CATALOG: QuestionCategoryMeta[] = [
  {
    id: 'TPL_A1',
    topic: 'A',
    shortTitle: 'Dạng 1 (Chủ đề A): Kiểm tra điểm thuộc miền nghiệm',
    title: 'Dạng 1 (Chủ đề A): Kiểm tra điểm M(x₀; y₀) thuộc miền nghiệm BPT',
    description:
      'Cho bất phương trình ax + by (dấu) c và điểm M(x₀; y₀). Yêu cầu học sinh thay tọa độ điểm M vào vế trái, tính giá trị và kết luận M có thuộc miền nghiệm hay không.',
    defaultLevel: 'nhan_biet',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200'
  },
  {
    id: 'TPL_A2',
    topic: 'A',
    shortTitle: 'Dạng 2 (Chủ đề A): Nhận diện đường bờ & Nét vẽ',
    title: 'Dạng 2 (Chủ đề A): Nhận diện đường thẳng bờ (d) & Kiểu nét vẽ (Liền/Đứt)',
    description:
      'Cho bất phương trình bậc nhất hai ẩn. Yêu cầu xác định hệ số a, b, c, phương trình đường bờ (d) và phân biệt miền đóng (nét liền) hay miền mở (nét đứt).',
    defaultLevel: 'thong_hieu',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-200'
  },
  {
    id: 'TPL_B1',
    topic: 'B',
    shortTitle: 'Dạng 3 (Chủ đề B): Biểu diễn miền nghiệm trên Oxy',
    title: 'Dạng 3 (Chủ đề B): Biểu diễn miền nghiệm BPT trên mặt phẳng Oxy',
    description:
      'Thực hiện quy trình vẽ đường bờ qua 2 điểm cắt trục tọa độ, thử điểm M ngoài bờ và chọn đúng nửa mặt phẳng nghiệm trên hệ trục Oxy.',
    defaultLevel: 'thong_hieu',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200'
  },
  {
    id: 'TPL_B2',
    topic: 'B',
    shortTitle: 'Dạng 4 (Chủ đề B): Bài toán thực tế lập BPT đơn',
    title: 'Dạng 4 (Chủ đề B): Bài toán thực tế lập BPT bậc nhất hai ẩn',
    description:
      'Mô hình hóa tình huống mua sắm / sản xuất có giới hạn ngân sách thành bất phương trình ax + by ≤ c và kiểm tra phương án thực tế.',
    defaultLevel: 'van_dung',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-200'
  },
  {
    id: 'TPL_C1',
    topic: 'C',
    shortTitle: 'Dạng 5 (Chủ đề C): Tìm giao điểm & Đỉnh Hệ BPT',
    title: 'Dạng 5 (Chủ đề C): Tìm giao điểm hai đường bờ & Kiểm tra đỉnh Hệ BPT',
    description:
      'Giải hệ phương trình 2 đường thẳng bờ để tìm tọa độ giao điểm (x; y), sau đó thay vào các bất phương trình còn lại để kết luận đỉnh hợp lệ hay bị loại.',
    defaultLevel: 'van_dung',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200'
  },
  {
    id: 'TPL_C2',
    topic: 'C',
    shortTitle: 'Dạng 6 (Chủ đề C): Đa giác miền nghiệm & Diện tích',
    title: 'Dạng 6 (Chủ đề C): Phân loại miền nghiệm Hệ BPT & Tính diện tích đa giác',
    description:
      'Xác định các đỉnh cực biên của miền đa giác nghiệm (tam giác, tứ giác) và kiểm tra tính chất hình học của miền nghiệm trên mặt phẳng tọa độ.',
    defaultLevel: 'van_dung_cao',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-200'
  },
  {
    id: 'TPL_D1',
    topic: 'D',
    shortTitle: 'Dạng 7 (Chủ đề D): Tối ưu Lợi nhuận LỚN NHẤT (MAX)',
    title: 'Dạng 7 (Chủ đề D): Bài toán thực tế Tối ưu hóa Lợi nhuận LỚN NHẤT (MAX)',
    description:
      'Cho miền phương án khả thi của hệ ràng buộc tài nguyên và hàm mục tiêu lợi nhuận F(x; y) = px + qy. Tính giá trị tại các đỉnh và tìm phương án đạt MAX.',
    defaultLevel: 'van_dung',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200'
  },
  {
    id: 'TPL_D2',
    topic: 'D',
    shortTitle: 'Dạng 8 (Chủ đề D): Tối ưu Chi phí NHỎ NHẤT (MIN)',
    title: 'Dạng 8 (Chủ đề D): Bài toán thực tế Tối ưu hóa Chi phí NHỎ NHẤT (MIN)',
    description:
      'Bài toán khẩu phần dinh dưỡng hoặc thuê xe vận chuyển: Tìm phương án tại các đỉnh cực biên để tổng chi phí F(x; y) đạt giá trị NHỎ NHẤT (MIN).',
    defaultLevel: 'van_dung_cao',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-200'
  }
];

export interface ExerciseGenerationSpec {
  id: string;
  templateId: QuestionCategoryId;
  level: CognitiveLevel;
  a: number;
  b: number;
  op: ComparisonOperator;
  c: number;
  mx: number;
  my: number;
  p?: number;
  q?: number;
  customTitle?: string;
  customContextStory?: string;
  sourceDocumentId?: string;
  sourceDocumentTitle?: string;
}

/**
 * Builds a complete, step-by-step interactive AssessmentExercise from parameters and template category.
 */
export function buildExerciseFromSpec(spec: ExerciseGenerationSpec): AssessmentExercise {
  const {
    id,
    templateId,
    level,
    op,
    c,
    mx,
    my,
    p = 40,
    q = 30,
    customTitle,
    customContextStory,
    sourceDocumentId,
    sourceDocumentTitle
  } = spec;

  const safeA = spec.a === 0 && spec.b === 0 ? 2 : spec.a;
  const safeB = spec.b;
  const ineq = {
    id: `ineq-${id}`,
    a: safeA,
    b: safeB,
    op,
    c
  };
  const pointM = { x: mx, y: my };
  const sub = formatExplicitSubstitution(safeA, safeB, mx, my);
  const opSym = getOperatorSymbol(op);
  const isClosed = isClosedRegion(op);
  const lineStyle = getBoundaryStyle(op);
  const satisfies =
    op === '<='
      ? sub.totalLhs <= c
      : op === '<'
      ? sub.totalLhs < c
      : op === '>='
      ? sub.totalLhs >= c
      : sub.totalLhs > c;

  const catMeta =
    QUESTION_CATEGORY_CATALOG.find(cat => cat.id === templateId) ||
    QUESTION_CATEGORY_CATALOG[0];

  if (templateId === 'TPL_A2') {
    return {
      id,
      topic: 'A',
      level,
      templateId: 'TPL_A2',
      sourceDocumentId,
      sourceDocumentTitle,
      interactionType: 'multiple_choice',
      title:
        customTitle ||
        `Nhận diện đường bờ & nét vẽ của ${formatInequality(ineq)}`,
      learningObjective: catMeta.description,
      contextStory: customContextStory,
      questionText: customContextStory
        ? `${customContextStory}\nXét bất phương trình bậc nhất hai ẩn: ${formatInequality(ineq)}.\nHãy xác định hằng số vế phải c và kiểu nét vẽ của đường thẳng bờ (d): ${formatBoundaryLine(safeA, safeB, c)}.`
        : `Cho bất phương trình bậc nhất hai ẩn: ${formatInequality(ineq)}.\nHãy xác định giá trị vế phải c và kiểu nét vẽ của đường thẳng bờ (d): ${formatBoundaryLine(safeA, safeB, c)}.`,
      mathData: { inequality: ineq, testPoint: pointM },
      steps: [
        {
          stepIndex: 1,
          title: 'Bước 1: Xác định hằng số vế phải c',
          instruction: `Trong phương trình đường bờ (d): ${formatBoundaryLine(safeA, safeB, c)}, hằng số vế phải c bằng bao nhiêu?`,
          inputType: 'number',
          expectedValue: c,
          tolerance: 0.01
        },
        {
          stepIndex: 2,
          title: 'Bước 2: Chọn kiểu đường biên (d)',
          instruction: `Dựa vào dấu "${opSym}", đường thẳng bờ (d) được biểu diễn bằng nét liền hay nét đứt?`,
          inputType: 'choice',
          expectedValue: lineStyle,
          choices: [
            {
              id: 'c1',
              label: 'Nét liền (Miền nghiệm đóng, lấy cả bờ d)',
              value: 'solid'
            },
            {
              id: 'c2',
              label: 'Nét đứt (Miền nghiệm mở, không lấy bờ d)',
              value: 'dashed'
            }
          ]
        }
      ],
      canonicalAnswerSummary: `Đường bờ (d): ${formatBoundaryLine(safeA, safeB, c)}, c = ${c}, vẽ bằng ${lineStyle === 'solid' ? 'Nét liền (lấy bờ)' : 'Nét đứt (bỏ bờ)'}.`,
      solutionExplanation: `Do bất phương trình mang dấu "${opSym}" (${isClosed ? 'có dấu bằng' : 'dấu nghiêm ngặt'}) nên đường bờ (d): ${formatBoundaryLine(safeA, safeB, c)} được vẽ bằng ${lineStyle === 'solid' ? 'nét liền' : 'nét đứt'}.`,
      hints: {
        tier1: `Quan sát dấu "${opSym}" trong bất phương trình ${formatInequality(ineq)}.`,
        tier2: 'Dấu ≤, ≥ có dấu "=" nên vẽ nét liền; dấu <, > vẽ nét đứt.',
        tier3: `Hằng số vế phải c = ${c}. Hãy chọn kiểu đường biên tương ứng với dấu "${opSym}".`
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

  if (templateId === 'TPL_B1' || templateId === 'TPL_B2') {
    const expectedSide: 'with_test' | 'without_test' = satisfies
      ? 'with_test'
      : 'without_test';
    const isRealWorld = templateId === 'TPL_B2';
    return {
      id,
      topic: 'B',
      level,
      templateId,
      sourceDocumentId,
      sourceDocumentTitle,
      interactionType: 'select_half_plane',
      title:
        customTitle ||
        (isRealWorld
          ? `Bài toán thực tế miền nghiệm ${formatInequality(ineq)}`
          : `Biểu diễn miền nghiệm của ${formatInequality(ineq)}`),
      learningObjective: catMeta.description,
      contextStory: customContextStory,
      questionText: customContextStory
        ? `${customContextStory}\nBất phương trình ràng buộc là: ${formatInequality(ineq)}.\nSử dụng điểm thử M(${mx}; ${my}), hãy tính giá trị vế trái và chọn nửa mặt phẳng biểu diễn miền nghiệm.`
        : isRealWorld
        ? `Một kế hoạch phân bổ hai nguồn lực x, y phải thỏa mãn ràng buộc: ${formatInequality(ineq)}.\nSử dụng điểm thử M(${mx}; ${my}), hãy tính giá trị vế trái và chọn nửa mặt phẳng biểu diễn miền nghiệm.`
        : `Biểu diễn miền nghiệm của bất phương trình: ${formatInequality(ineq)} trên mặt phẳng Oxy.\nCho điểm thử M(${mx}; ${my}), hãy tính giá trị vế trái và xác định nửa mặt phẳng nghiệm.`,
      mathData: { inequality: ineq, testPoint: pointM },
      steps: [
        {
          stepIndex: 1,
          title: `Bước 1: Thay tọa độ điểm thử M(${mx}; ${my}) vào vế trái`,
          instruction: `Tính giá trị biểu thức ${sub.exprWithMul}:`,
          inputType: 'number',
          expectedValue: sub.totalLhs,
          tolerance: 0.01
        },
        {
          stepIndex: 2,
          title: 'Bước 2: Chọn nửa mặt phẳng miền nghiệm',
          instruction: `So sánh kết quả vừa tính với ${c} qua dấu "${opSym}" và chọn nửa mặt phẳng đúng:`,
          inputType: 'canvas_half_plane',
          expectedHalfPlaneSide: expectedSide
        }
      ],
      canonicalAnswerSummary: `Tại M(${mx}; ${my}), VT = ${formatNumberClean(sub.totalLhs)} ${opSym} ${c} (${satisfies ? 'Đúng' : 'Sai'}). Miền nghiệm là nửa mặt phẳng bờ (d) ${satisfies ? 'CHỨA' : 'KHÔNG chứa'} điểm M(${mx}; ${my}).`,
      solutionExplanation: `Thay x = ${mx}, y = ${my} vào vế trái ta có ${sub.exprWithMul} = ${formatNumberClean(sub.totalLhs)}. Vì ${formatNumberClean(sub.totalLhs)} ${opSym} ${c} là mệnh đề ${satisfies ? 'ĐÚNG' : 'SAI'}, miền nghiệm là nửa mặt phẳng bờ (d): ${formatBoundaryLine(safeA, safeB, c)} ${satisfies ? 'chứa M' : 'không chứa M'}.`,
      hints: {
        tier1: `Thay x = ${mx} và y = ${my} vào vế trái của ${formatInequality(ineq)}.`,
        tier2:
          'Nếu mệnh đề sau khi thay số là ĐÚNG thì chọn nửa mặt phẳng chứa M; nếu SAI thì chọn nửa mặt phẳng không chứa M.',
        tier3: `Tính ${sub.exprWithMul} rồi đối chiếu với vế phải c = ${c}.`
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

  if (templateId === 'TPL_C1' || templateId === 'TPL_C2') {
    const cleanA = safeA === safeB ? safeA + 1 : safeA;
    const c1 = cleanA * mx + safeB * my;
    const c2 = mx + my;
    const sys = [
      {
        id: 's1',
        a: cleanA,
        b: safeB,
        op: '<=' as ComparisonOperator,
        c: c1,
        label: '(d1)',
        color: '#2563eb'
      },
      {
        id: 's2',
        a: 1,
        b: 1,
        op: '<=' as ComparisonOperator,
        c: c2,
        label: '(d2)',
        color: '#16a34a'
      },
      {
        id: 's3',
        a: 1,
        b: 0,
        op: '>=' as ComparisonOperator,
        c: 0,
        label: '(d3)',
        color: '#d97706'
      },
      {
        id: 's4',
        a: 0,
        b: 1,
        op: '>=' as ComparisonOperator,
        c: 0,
        label: '(d4)',
        color: '#9333ea'
      }
    ];
    const isC2 = templateId === 'TPL_C2';
    return {
      id,
      topic: 'C',
      level,
      templateId,
      sourceDocumentId,
      sourceDocumentTitle,
      interactionType: 'find_intersection',
      title:
        customTitle ||
        (isC2
          ? `Đỉnh cực biên đa giác miền nghiệm Hệ BPT (${formatBoundaryLine(cleanA, safeB, c1)} & x + y = ${c2})`
          : `Tìm giao điểm & Đỉnh Hệ BPT (${formatBoundaryLine(cleanA, safeB, c1)} & x + y = ${c2})`),
      learningObjective: catMeta.description,
      contextStory: customContextStory,
      questionText: customContextStory
        ? `${customContextStory}\nHệ bất phương trình mô tả miền nghiệm:\n(1) ${formatInequality(sys[0])}\n(2) ${formatInequality(sys[1])}\n(3) x ≥ 0, y ≥ 0.\nHãy tìm tọa độ giao điểm A = (d1) ∩ (d2) và kiểm tra tính hợp lệ của đỉnh A.`
        : `Cho hệ bất phương trình:\n(1) ${formatInequality(sys[0])}\n(2) ${formatInequality(sys[1])}\n(3) x ≥ 0, y ≥ 0.\nHãy tìm tọa độ giao điểm A của hai đường thẳng bờ (d1): ${formatBoundaryLine(cleanA, safeB, c1)} và (d2): x + y = ${c2}, sau đó kiểm tra xem A có thuộc miền đa giác nghiệm của hệ không.`,
      mathData: {
        system: sys,
        intersectionLinePair: [0, 1]
      },
      steps: [
        {
          stepIndex: 1,
          title: 'Bước 1: Tìm tọa độ giao điểm A = (d1) ∩ (d2)',
          instruction: `Giải hệ phương trình ${formatBoundaryLine(cleanA, safeB, c1)} và x + y = ${c2} để tìm (x; y):`,
          inputType: 'coordinate',
          expectedPoint: { x: mx, y: my },
          tolerance: 0.05
        },
        {
          stepIndex: 2,
          title: 'Bước 2: Kiểm tra điều kiện đỉnh của miền nghiệm',
          instruction: `Với giao điểm A(${mx}; ${my}) vừa tìm được, đối chiếu với điều kiện x ≥ 0, y ≥ 0 xem A có phải là đỉnh hợp lệ của miền nghiệm không:`,
          inputType: 'choice',
          expectedValue: mx >= 0 && my >= 0 ? 'feasible' : 'infeasible',
          choices: [
            {
              id: 'f1',
              label: 'Thỏa mãn toàn bộ hệ (Là đỉnh hợp lệ của miền nghiệm)',
              value: 'feasible'
            },
            {
              id: 'f2',
              label: 'Vi phạm điều kiện không âm (Bị loại)',
              value: 'infeasible'
            }
          ]
        }
      ],
      canonicalAnswerSummary: `Giao điểm A(${mx}; ${my}) — ${mx >= 0 && my >= 0 ? 'Là đỉnh hợp lệ của miền nghiệm' : 'Bị loại do vi phạm x ≥ 0, y ≥ 0'}.`,
      solutionExplanation: `Giải hệ phương trình hai đường bờ (d1) và (d2) ta được nghiệm duy nhất A(${mx}; ${my}). Kiểm tra với các ràng buộc x ≥ 0, y ≥ 0 ta kết luận A ${mx >= 0 && my >= 0 ? 'thuộc miền nghiệm' : 'bị loại'}.`,
      hints: {
        tier1: `Từ phương trình (d2): x + y = ${c2}, hãy rút y = ${c2} - x rồi thế vào phương trình (d1).`,
        tier2:
          'Sau khi tìm được (x; y), hãy kiểm tra xem cả x và y có đều lớn hơn hoặc bằng 0 hay không.',
        tier3: `Thay vào hệ phương trình để tìm hoành độ x = ${mx} và tung độ y = ${my} của điểm A.`
      },
      commonErrorCodes: ['E06', 'E07'],
      rubric: {
        maxPoints: 10,
        criteria: [
          { stepIndex: 1, description: 'Tìm đúng tọa độ giao điểm A', points: 6 },
          {
            stepIndex: 2,
            description: 'Kết luận đúng tính hợp lệ của đỉnh A',
            points: 4
          }
        ]
      }
    };
  }

  if (templateId === 'TPL_D1' || templateId === 'TPL_D2') {
    const isMin = templateId === 'TPL_D2';
    const vx = Math.max(1, Math.abs(mx));
    const vy = Math.max(1, Math.abs(my));
    const fVal = p * vx + q * vy;
    const sys = [
      {
        id: 'd1',
        a: 1,
        b: 1,
        op: (isMin ? '>=' : '<=') as ComparisonOperator,
        c: vx + vy,
        label: '(d1)',
        color: '#2563eb'
      },
      {
        id: 'd2',
        a: 1,
        b: 0,
        op: '>=' as ComparisonOperator,
        c: 0,
        label: '(d2)',
        color: '#16a34a'
      },
      {
        id: 'd3',
        a: 0,
        b: 1,
        op: '>=' as ComparisonOperator,
        c: 0,
        label: '(d3)',
        color: '#d97706'
      }
    ];
    return {
      id,
      topic: 'D',
      level,
      templateId,
      sourceDocumentId,
      sourceDocumentTitle,
      interactionType: 'enter_objective_value',
      title:
        customTitle ||
        `Bài toán tối ưu ${isMin ? 'Chi phí MIN' : 'Lợi nhuận MAX'}: F(x; y) = ${p}x + ${q}y`,
      learningObjective: catMeta.description,
      contextStory: customContextStory,
      questionText: customContextStory
        ? `${customContextStory}\nXét phương án (x; y) tại đỉnh cực biên A(${vx}; ${vy}) của miền khả thi với hàm mục tiêu ${isMin ? 'chi phí' : 'lợi nhuận'} F(x; y) = ${p}x + ${q}y (nghìn đồng).\nHãy tính giá trị của F tại đỉnh A(${vx}; ${vy}) và xác định nguyên tắc đạt cực trị.`
        : `Một cơ sở kinh doanh xét phương án (x; y) tại đỉnh cực biên A(${vx}; ${vy}) của miền khả thi.\nCho hàm mục tiêu ${isMin ? 'chi phí' : 'lợi nhuận'} F(x; y) = ${p}x + ${q}y (nghìn đồng).\nHãy tính giá trị của hàm mục tiêu F tại đỉnh A(${vx}; ${vy}) và xác định mục tiêu tối ưu của bài toán.`,
      mathData: {
        system: sys,
        objective: {
          a: p,
          b: q,
          goal: isMin ? 'min' : 'max',
          name: isMin ? 'Chi phí' : 'Lợi nhuận',
          unit: 'nghìn đồng',
          label: `F(x; y) = ${p}x + ${q}y`
        },
        evaluationVertex: { label: 'A', point: { x: vx, y: vy } }
      },
      steps: [
        {
          stepIndex: 1,
          title: `Bước 1: Tính giá trị hàm mục tiêu F tại đỉnh A(${vx}; ${vy})`,
          instruction: `Thay x = ${vx}, y = ${vy} vào F(x; y) = ${p}x + ${q}y:`,
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
            {
              id: 'v1',
              label: 'Đạt tại một trong các đỉnh của đa giác miền nghiệm',
              value: 'vertices'
            },
            {
              id: 'v2',
              label: 'Chỉ đạt tại gốc tọa độ O(0; 0)',
              value: 'origin_only'
            }
          ]
        }
      ],
      canonicalAnswerSummary: `Tại đỉnh A(${vx}; ${vy}), F(${vx}; ${vy}) = ${p}×${vx} + ${q}×${vy} = ${fVal} (nghìn đồng). Cực trị đạt tại đỉnh của đa giác miền nghiệm.`,
      solutionExplanation: `Thay tọa độ đỉnh A(${vx}; ${vy}) vào hàm mục tiêu F(x; y) = ${p}x + ${q}y ta được ${p}×${vx} + ${q}×${vy} = ${fVal}.`,
      hints: {
        tier1: `Thay hoành độ x = ${vx} và tung độ y = ${vy} vào biểu thức ${p}x + ${q}y.`,
        tier2: 'Thực hiện phép nhân trước rồi cộng hai tích lại với nhau.',
        tier3: `Tính ${p} × ${vx} + ${q} × ${vy}.`
      },
      commonErrorCodes: ['E09', 'E10'],
      rubric: {
        maxPoints: 10,
        criteria: [
          {
            stepIndex: 1,
            description: 'Tính đúng giá trị hàm mục tiêu F tại đỉnh A',
            points: 6
          },
          {
            stepIndex: 2,
            description: 'Nắm vững nguyên lý cực trị tại đỉnh đa giác',
            points: 4
          }
        ]
      }
    };
  }

  // Default: TPL_A1
  return {
    id,
    topic: 'A',
    level,
    templateId: 'TPL_A1',
    sourceDocumentId,
    sourceDocumentTitle,
    interactionType: 'multiple_choice',
    title:
      customTitle ||
      `Kiểm tra điểm M(${mx}; ${my}) với BPT ${formatInequality(ineq)}`,
    learningObjective: catMeta.description,
    contextStory: customContextStory,
    questionText: customContextStory
      ? `${customContextStory}\nCho bất phương trình bậc nhất hai ẩn: ${formatInequality(ineq)} và điểm M(${mx}; ${my}).\nHãy thay tọa độ điểm M vào vế trái của bất phương trình để tính giá trị và kết luận điểm M có thuộc miền nghiệm hay không.`
      : `Cho bất phương trình bậc nhất hai ẩn: ${formatInequality(ineq)} và điểm M(${mx}; ${my}).\nHãy thay tọa độ điểm M vào vế trái của bất phương trình để tính giá trị và kết luận điểm M có thuộc miền nghiệm hay không.`,
    mathData: { inequality: ineq, testPoint: pointM },
    steps: [
      {
        stepIndex: 1,
        title: `Bước 1: Tính giá trị vế trái tại M(${mx}; ${my})`,
        instruction: `Thay x = ${mx}, y = ${my} vào biểu thức ${sub.exprWithMul}. Kết quả bằng bao nhiêu?`,
        inputType: 'number',
        expectedValue: sub.totalLhs,
        tolerance: 0.01
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Kết luận điểm M có thuộc miền nghiệm không',
        instruction: `So sánh kết quả vế trái với ${c} qua dấu "${opSym}" và chọn kết luận đúng:`,
        inputType: 'choice',
        expectedValue: satisfies ? 'belongs' : 'not_belongs',
        choices: [
          {
            id: 'b1',
            label: `M(${mx}; ${my}) THUỘC miền nghiệm (vì mệnh đề so sánh ĐÚNG)`,
            value: 'belongs'
          },
          {
            id: 'b2',
            label: `M(${mx}; ${my}) KHÔNG thuộc miền nghiệm (vì mệnh đề so sánh SAI)`,
            value: 'not_belongs'
          }
        ]
      }
    ],
    canonicalAnswerSummary: `Vế trái = ${sub.exprWithMul} = ${formatNumberClean(sub.totalLhs)}. So sánh: ${formatNumberClean(sub.totalLhs)} ${opSym} ${c} là ${satisfies ? 'ĐÚNG → M thuộc miền nghiệm' : 'SAI → M không thuộc miền nghiệm'}.`,
    solutionExplanation: `Thay x = ${mx}, y = ${my} vào vế trái ta được ${sub.exprWithMul} = ${formatNumberClean(sub.totalLhs)}. Đối chiếu với dấu "${opSym} ${c}", mệnh đề ${satisfies ? 'thỏa mãn nên M là nghiệm' : 'không thỏa mãn nên M không thuộc miền nghiệm'}.`,
    hints: {
      tier1: `Thay x = ${mx} và y = ${my} vào vế trái của bất phương trình ${formatInequality(ineq)}.`,
      tier2: `Thực hiện phép tính: ${sub.exprWithMul}, sau đó so sánh kết quả với vế phải c = ${c}.`,
      tier3: `Nếu phép so sánh với dấu "${opSym}" là ĐÚNG thì M thuộc miền nghiệm, ngược lại là KHÔNG thuộc.`
    },
    commonErrorCodes: ['E01', 'E02'],
    rubric: {
      maxPoints: 10,
      criteria: [
        {
          stepIndex: 1,
          description: 'Tính đúng giá trị vế trái khi thay tọa độ M',
          points: 5
        },
        {
          stepIndex: 2,
          description: 'Kết luận đúng tính thuộc miền nghiệm',
          points: 5
        }
      ]
    }
  };
}

function computeTypeCounts(
  exercises: AssessmentExercise[]
): Partial<Record<QuestionCategoryId, number>> {
  const counts: Partial<Record<QuestionCategoryId, number>> = {};
  for (const ex of exercises) {
    const tpl = ex.templateId || inferTemplateIdFromExercise(ex);
    counts[tpl] = (counts[tpl] || 0) + 1;
  }
  return counts;
}

export function inferTemplateIdFromExercise(
  ex: AssessmentExercise
): QuestionCategoryId {
  if (ex.templateId) return ex.templateId;
  if (ex.topic === 'A') {
    return ex.interactionType === 'draw_boundary_line' ||
      ex.title.toLowerCase().includes('đường bờ') ||
      ex.title.toLowerCase().includes('đường biên')
      ? 'TPL_A2'
      : 'TPL_A1';
  }
  if (ex.topic === 'B') {
    return ex.contextStory || ex.title.toLowerCase().includes('thực tế')
      ? 'TPL_B2'
      : 'TPL_B1';
  }
  if (ex.topic === 'C') {
    return ex.level === 'van_dung_cao' ||
      ex.title.toLowerCase().includes('đa giác') ||
      ex.title.toLowerCase().includes('diện tích')
      ? 'TPL_C2'
      : 'TPL_C1';
  }
  const isMin =
    ex.mathData?.objective?.goal === 'min' ||
    ex.title.toLowerCase().includes('chi phí') ||
    ex.title.toLowerCase().includes('nhỏ nhất') ||
    ex.title.toLowerCase().includes('min');
  return isMin ? 'TPL_D2' : 'TPL_D1';
}

/**
 * Seed documents pre-loaded into the Teacher Document Library so teachers have a rich repository immediately.
 */
export function buildDefaultLibraryDocuments(): LibraryDocument[] {
  const doc1Id = 'DOC_SGK_CHUONG2_AB';
  const doc1Title =
    'Tài liệu 1: Chuyên đề BPT bậc nhất hai ẩn & Biểu diễn miền nghiệm (SGK Toán 10)';
  const doc1Exercises: AssessmentExercise[] = [
    buildExerciseFromSpec({
      id: 'LIB_D1_01',
      templateId: 'TPL_A1',
      level: 'nhan_biet',
      a: 2,
      b: 1,
      op: '<=',
      c: 8,
      mx: 2,
      my: 3,
      customTitle: '[Kho TL1] Kiểm tra điểm M(2; 3) thuộc miền nghiệm 2x + y ≤ 8',
      sourceDocumentId: doc1Id,
      sourceDocumentTitle: doc1Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D1_02',
      templateId: 'TPL_A1',
      level: 'thong_hieu',
      a: 3,
      b: -2,
      op: '>',
      c: 5,
      mx: 3,
      my: 1,
      customTitle: '[Kho TL1] Kiểm tra nghiệm M(3; 1) của BPT nghiêm ngặt 3x - 2y > 5',
      sourceDocumentId: doc1Id,
      sourceDocumentTitle: doc1Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D1_03',
      templateId: 'TPL_A2',
      level: 'nhan_biet',
      a: 1,
      b: 3,
      op: '>=',
      c: 9,
      mx: 0,
      my: 0,
      customTitle: '[Kho TL1] Nhận diện đường bờ và kiểu nét vẽ của x + 3y ≥ 9',
      sourceDocumentId: doc1Id,
      sourceDocumentTitle: doc1Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D1_04',
      templateId: 'TPL_A2',
      level: 'thong_hieu',
      a: 4,
      b: -1,
      op: '<',
      c: 12,
      mx: 1,
      my: 2,
      customTitle: '[Kho TL1] Phân biệt miền mở và nét đứt của BPT 4x - y < 12',
      sourceDocumentId: doc1Id,
      sourceDocumentTitle: doc1Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D1_05',
      templateId: 'TPL_B1',
      level: 'thong_hieu',
      a: 2,
      b: 3,
      op: '<=',
      c: 12,
      mx: 0,
      my: 0,
      customTitle: '[Kho TL1] Biểu diễn miền nghiệm 2x + 3y ≤ 12 qua gốc O(0; 0)',
      sourceDocumentId: doc1Id,
      sourceDocumentTitle: doc1Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D1_06',
      templateId: 'TPL_B1',
      level: 'van_dung',
      a: 3,
      b: -2,
      op: '>=',
      c: 6,
      mx: 1,
      my: 2,
      customTitle: '[Kho TL1] Xác định nửa mặt phẳng nghiệm 3x - 2y ≥ 6 với điểm thử M(1; 2)',
      sourceDocumentId: doc1Id,
      sourceDocumentTitle: doc1Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D1_07',
      templateId: 'TPL_B2',
      level: 'van_dung',
      a: 20,
      b: 15,
      op: '<=',
      c: 120,
      mx: 3,
      my: 2,
      customTitle: '[Kho TL1] Bài toán mua vở và bút trong ngân sách 120 nghìn đồng',
      customContextStory:
        'Một học sinh mua x quyển vở (20 nghìn/quyển) và y cây bút (15 nghìn/cây) với tổng số tiền không vượt quá 120 nghìn đồng.',
      sourceDocumentId: doc1Id,
      sourceDocumentTitle: doc1Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D1_08',
      templateId: 'TPL_B2',
      level: 'van_dung_cao',
      a: 5,
      b: 4,
      op: '<=',
      c: 40,
      mx: 4,
      my: 5,
      customTitle: '[Kho TL1] Bài toán phân bổ giờ máy sản xuất thực tế 5x + 4y ≤ 40',
      customContextStory:
        'Một phân xưởng sử dụng máy CNC tối đa 40 giờ mỗi tuần để gia công hai chi tiết máy loại I (5 giờ/chi tiết) và loại II (4 giờ/chi tiết).',
      sourceDocumentId: doc1Id,
      sourceDocumentTitle: doc1Title
    })
  ];

  const doc2Id = 'DOC_CHUYENDE_HE_BPT_C';
  const doc2Title =
    'Tài liệu 2: Tuyển tập Hệ bất phương trình bậc nhất hai ẩn & Đa giác nghiệm';
  const doc2Exercises: AssessmentExercise[] = [
    buildExerciseFromSpec({
      id: 'LIB_D2_01',
      templateId: 'TPL_C1',
      level: 'thong_hieu',
      a: 2,
      b: 1,
      op: '<=',
      c: 10,
      mx: 3,
      my: 2,
      customTitle: '[Kho TL2] Tìm giao điểm A = (d1) ∩ (d2) của hệ 2x + y ≤ 8 và x + y ≤ 5',
      sourceDocumentId: doc2Id,
      sourceDocumentTitle: doc2Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D2_02',
      templateId: 'TPL_C1',
      level: 'van_dung',
      a: 3,
      b: 1,
      op: '<=',
      c: 14,
      mx: 4,
      my: 2,
      customTitle: '[Kho TL2] Xác định đỉnh cực biên A(4; 2) của hệ ràng buộc sản xuất',
      sourceDocumentId: doc2Id,
      sourceDocumentTitle: doc2Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D2_03',
      templateId: 'TPL_C1',
      level: 'van_dung',
      a: 2,
      b: 3,
      op: '<=',
      c: 13,
      mx: 2,
      my: 3,
      customTitle: '[Kho TL2] Giải hệ đường bờ tìm đỉnh A(2; 3) thuộc góc phần tư thứ nhất',
      sourceDocumentId: doc2Id,
      sourceDocumentTitle: doc2Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D2_04',
      templateId: 'TPL_C2',
      level: 'van_dung',
      a: 3,
      b: 2,
      op: '<=',
      c: 16,
      mx: 4,
      my: 2,
      customTitle: '[Kho TL2] Khảo sát đỉnh đa giác miền nghiệm tứ giác lồi tại A(4; 2)',
      sourceDocumentId: doc2Id,
      sourceDocumentTitle: doc2Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D2_05',
      templateId: 'TPL_C2',
      level: 'van_dung_cao',
      a: 4,
      b: 1,
      op: '<=',
      c: 15,
      mx: 3,
      my: 3,
      customTitle: '[Kho TL2] Phân loại đỉnh hợp lệ của miền đa giác nghiệm tại A(3; 3)',
      sourceDocumentId: doc2Id,
      sourceDocumentTitle: doc2Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D2_06',
      templateId: 'TPL_C2',
      level: 'van_dung_cao',
      a: 5,
      b: 2,
      op: '<=',
      c: 24,
      mx: 4,
      my: 2,
      customTitle: '[Kho TL2] Xác định đỉnh cực biên của miền nghiệm hệ 4 bất phương trình',
      sourceDocumentId: doc2Id,
      sourceDocumentTitle: doc2Title
    })
  ];

  const doc3Id = 'DOC_THUCTE_TOI_UU_D';
  const doc3Title =
    'Tài liệu 3: Kho Bài Toán Thực Tế Quy Hoạch Tuyến Tính Lợi Nhuận MAX & Chi Phí MIN';
  const doc3Exercises: AssessmentExercise[] = [
    buildExerciseFromSpec({
      id: 'LIB_D3_01',
      templateId: 'TPL_D1',
      level: 'van_dung',
      a: 2,
      b: 3,
      op: '<=',
      c: 12,
      mx: 3,
      my: 2,
      p: 50,
      q: 40,
      customTitle: '[Kho TL3] Tối ưu hóa lợi nhuận xưởng mộc bàn ghế F = 50x + 40y (MAX)',
      customContextStory:
        'Một xưởng mộc sản xuất x chiếc bàn (lãi 50 nghìn) và y chiếc ghế (lãi 40 nghìn). Đỉnh phương án tối ưu được xác định tại A(3; 2).',
      sourceDocumentId: doc3Id,
      sourceDocumentTitle: doc3Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D3_02',
      templateId: 'TPL_D1',
      level: 'van_dung',
      a: 3,
      b: 2,
      op: '<=',
      c: 18,
      mx: 4,
      my: 3,
      p: 60,
      q: 45,
      customTitle: '[Kho TL3] Tối ưu hóa doanh thu trồng cây nông nghiệp F = 60x + 45y (MAX)',
      customContextStory:
        'Một hộ nông dân trồng x ha ngô và y ha đậu trên diện tích đất canh tác với phương án đỉnh cực biên A(4; 3).',
      sourceDocumentId: doc3Id,
      sourceDocumentTitle: doc3Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D3_03',
      templateId: 'TPL_D1',
      level: 'van_dung_cao',
      a: 4,
      b: 3,
      op: '<=',
      c: 24,
      mx: 3,
      my: 4,
      p: 80,
      q: 65,
      customTitle: '[Kho TL3] Bài toán dây chuyền đóng gói thực phẩm lợi nhuận MAX F = 80x + 65y',
      customContextStory:
        'Nhà máy chế biến hai dòng sản phẩm xuất khẩu với phương án đỉnh khả thi A(3; 4) trên miền đa giác tài nguyên.',
      sourceDocumentId: doc3Id,
      sourceDocumentTitle: doc3Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D3_04',
      templateId: 'TPL_D2',
      level: 'van_dung',
      a: 1,
      b: 1,
      op: '>=',
      c: 5,
      mx: 2,
      my: 3,
      p: 30,
      q: 25,
      customTitle: '[Kho TL3] Bài toán khẩu phần dinh dưỡng chi phí NHỎ NHẤT F = 30x + 25y (MIN)',
      customContextStory:
        'Chuyên gia dinh dưỡng kết hợp x lạng thịt bò (30 nghìn/lạng) và y lạng cá hồi (25 nghìn/lạng) tại đỉnh cực biên A(2; 3) để đảm bảo đủ protein và vitamin tối thiểu.',
      sourceDocumentId: doc3Id,
      sourceDocumentTitle: doc3Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D3_05',
      templateId: 'TPL_D2',
      level: 'van_dung_cao',
      a: 2,
      b: 1,
      op: '>=',
      c: 8,
      mx: 3,
      my: 2,
      p: 45,
      q: 35,
      customTitle: '[Kho TL3] Bài toán thuê xe tải vận chuyển hàng hóa chi phí MIN F = 45x + 35y',
      customContextStory:
        'Doanh nghiệp logistics cần thuê x xe tải lớn (45 trăm nghìn/chuyến) và y xe tải nhỏ (35 trăm nghìn/chuyến) tại phương án đỉnh A(3; 2) sao cho tổng chi phí thuê xe là nhỏ nhất.',
      sourceDocumentId: doc3Id,
      sourceDocumentTitle: doc3Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D3_06',
      templateId: 'TPL_D2',
      level: 'van_dung_cao',
      a: 3,
      b: 2,
      op: '>=',
      c: 12,
      mx: 2,
      my: 4,
      p: 55,
      q: 40,
      customTitle: '[Kho TL3] Bài toán pha chế dung dịch hóa chất chi phí tối thiểu F = 55x + 40y',
      customContextStory:
        'Phòng thí nghiệm cần pha chế hai loại hợp chất với phương án đỉnh cực biên A(2; 4) nhằm tiết kiệm chi phí nguyên liệu nhất.',
      sourceDocumentId: doc3Id,
      sourceDocumentTitle: doc3Title
    })
  ];

  const doc4Id = 'DOC_DE_CUONG_HK1_TONGHOP';
  const doc4Title =
    'Tài liệu 4: Đề cương Ôn tập Kiểm tra 15 phút & Giữa kỳ 1 (Đủ 8 Dạng Toán 10)';
  const doc4Exercises: AssessmentExercise[] = [
    buildExerciseFromSpec({
      id: 'LIB_D4_01',
      templateId: 'TPL_A1',
      level: 'nhan_biet',
      a: 1,
      b: 2,
      op: '<=',
      c: 6,
      mx: 1,
      my: 2,
      customTitle: '[Đề cương HK1] Câu 1 (Dạng 1): Kiểm tra điểm M(1; 2) với x + 2y ≤ 6',
      sourceDocumentId: doc4Id,
      sourceDocumentTitle: doc4Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D4_02',
      templateId: 'TPL_A2',
      level: 'thong_hieu',
      a: 3,
      b: 2,
      op: '<',
      c: 6,
      mx: 0,
      my: 0,
      customTitle: '[Đề cương HK1] Câu 2 (Dạng 2): Đường thẳng bờ và nét vẽ của 3x + 2y < 6',
      sourceDocumentId: doc4Id,
      sourceDocumentTitle: doc4Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D4_03',
      templateId: 'TPL_B1',
      level: 'thong_hieu',
      a: 1,
      b: -1,
      op: '<=',
      c: 3,
      mx: 0,
      my: 0,
      customTitle: '[Đề cương HK1] Câu 3 (Dạng 3): Biểu diễn nửa mặt phẳng nghiệm x - y ≤ 3',
      sourceDocumentId: doc4Id,
      sourceDocumentTitle: doc4Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D4_04',
      templateId: 'TPL_B2',
      level: 'van_dung',
      a: 10,
      b: 25,
      op: '<=',
      c: 100,
      mx: 2,
      my: 2,
      customTitle: '[Đề cương HK1] Câu 4 (Dạng 4): Bài toán thực tế giới hạn chi tiêu 10x + 25y ≤ 100',
      sourceDocumentId: doc4Id,
      sourceDocumentTitle: doc4Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D4_05',
      templateId: 'TPL_C1',
      level: 'van_dung',
      a: 2,
      b: 1,
      op: '<=',
      c: 7,
      mx: 2,
      my: 3,
      customTitle: '[Đề cương HK1] Câu 5 (Dạng 5): Tìm giao điểm hai đường bờ tại đỉnh A(2; 3)',
      sourceDocumentId: doc4Id,
      sourceDocumentTitle: doc4Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D4_06',
      templateId: 'TPL_C2',
      level: 'van_dung_cao',
      a: 3,
      b: 1,
      op: '<=',
      c: 9,
      mx: 2,
      my: 3,
      customTitle: '[Đề cương HK1] Câu 6 (Dạng 6): Xét đỉnh cực biên của miền đa giác nghiệm',
      sourceDocumentId: doc4Id,
      sourceDocumentTitle: doc4Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D4_07',
      templateId: 'TPL_D1',
      level: 'van_dung',
      a: 2,
      b: 1,
      op: '<=',
      c: 8,
      mx: 2,
      my: 4,
      p: 70,
      q: 50,
      customTitle: '[Đề cương HK1] Câu 7 (Dạng 7): Cực đại hóa lợi nhuận F(x; y) = 70x + 50y',
      sourceDocumentId: doc4Id,
      sourceDocumentTitle: doc4Title
    }),
    buildExerciseFromSpec({
      id: 'LIB_D4_08',
      templateId: 'TPL_D2',
      level: 'van_dung_cao',
      a: 1,
      b: 2,
      op: '>=',
      c: 6,
      mx: 2,
      my: 2,
      p: 40,
      q: 60,
      customTitle: '[Đề cương HK1] Câu 8 (Dạng 8): Cực tiểu hóa chi phí F(x; y) = 40x + 60y',
      sourceDocumentId: doc4Id,
      sourceDocumentTitle: doc4Title
    })
  ];

  const now = Date.now();
  return [
    {
      id: doc1Id,
      title: doc1Title,
      fileName: 'chuyen_de_1_bpt_va_mien_nghiem_toan10.txt',
      fileType: 'txt',
      fileSize: 4820,
      uploadedAt: now - 86400000 * 3,
      topic: 'A',
      description:
        'Tài liệu chuẩn hóa gồm 8 câu hỏi thuộc Dạng 1, Dạng 2 (Chủ đề A) và Dạng 3, Dạng 4 (Chủ đề B) từ mức Nhận biết đến Vận dụng cao.',
      rawContent: doc1Exercises.map((e, i) => `Câu ${i + 1} [${e.templateId} - ${e.level}]: ${e.title}\n${e.questionText}`).join('\n\n---\n\n'),
      extractedExercises: doc1Exercises,
      questionTypeCounts: computeTypeCounts(doc1Exercises)
    },
    {
      id: doc2Id,
      title: doc2Title,
      fileName: 'chuyen_de_2_he_bpt_da_giac_nghiem.txt',
      fileType: 'txt',
      fileSize: 3950,
      uploadedAt: now - 86400000 * 2,
      topic: 'C',
      description:
        'Tài liệu chuyên sâu Chủ đề C gồm 6 câu hỏi về tìm giao điểm hai đường thẳng bờ (Dạng 5) và khảo sát đỉnh đa giác miền nghiệm (Dạng 6).',
      rawContent: doc2Exercises.map((e, i) => `Câu ${i + 1} [${e.templateId} - ${e.level}]: ${e.title}\n${e.questionText}`).join('\n\n---\n\n'),
      extractedExercises: doc2Exercises,
      questionTypeCounts: computeTypeCounts(doc2Exercises)
    },
    {
      id: doc3Id,
      title: doc3Title,
      fileName: 'chuyen_de_3_bai_toan_thuc_te_max_min.txt',
      fileType: 'txt',
      fileSize: 5240,
      uploadedAt: now - 86400000,
      topic: 'D',
      description:
        'Ngân hàng bài toán thực tế Quy hoạch tuyến tính: 3 bài toán tối ưu Lợi nhuận LỚN NHẤT (Dạng 7) và 3 bài toán tối ưu Chi phí NHỎ NHẤT (Dạng 8).',
      rawContent: doc3Exercises.map((e, i) => `Câu ${i + 1} [${e.templateId} - ${e.level}]: ${e.title}\n${e.questionText}`).join('\n\n---\n\n'),
      extractedExercises: doc3Exercises,
      questionTypeCounts: computeTypeCounts(doc3Exercises)
    },
    {
      id: doc4Id,
      title: doc4Title,
      fileName: 'de_cuong_on_tap_hk1_toan10_8_dang.txt',
      fileType: 'txt',
      fileSize: 6120,
      uploadedAt: now - 3600000 * 6,
      topic: 'ALL',
      description:
        'Đề cương tổng hợp bao phủ đầy đủ cả 8 dạng câu hỏi (Dạng 1 → Dạng 8) dùng để trộn đề kiểm tra 15 phút và 45 phút.',
      rawContent: doc4Exercises.map((e, i) => `Câu ${i + 1} [${e.templateId} - ${e.level}]: ${e.title}\n${e.questionText}`).join('\n\n---\n\n'),
      extractedExercises: doc4Exercises,
      questionTypeCounts: computeTypeCounts(doc4Exercises)
    }
  ];
}

/**
 * Parses uploaded document text (.txt, .md, .csv, .json) into structured AssessmentExercise items
 * classified by QuestionCategoryId (TPL_A1..TPL_D2) and CognitiveLevel.
 */
export function parseDocumentContentToExercises(
  rawContent: string,
  fileName: string,
  docId: string,
  docTitle: string,
  defaultTopic: AssessmentTopicId | 'ALL' = 'ALL'
): AssessmentExercise[] {
  const cleanText = rawContent.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];

  // 1. Try JSON parsing if .json or starts with { / [
  if (
    fileName.toLowerCase().endsWith('.json') ||
    cleanText.startsWith('[') ||
    cleanText.startsWith('{')
  ) {
    try {
      const parsed = JSON.parse(cleanText);
      const arr = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.exercises)
        ? parsed.exercises
        : Array.isArray(parsed.questions)
        ? parsed.questions
        : [];
      const extracted: AssessmentExercise[] = [];

      arr.forEach((item: any, idx: number) => {
        if (item && Array.isArray(item.steps) && item.mathData) {
          const tpl = item.templateId || inferTemplateIdFromExercise(item);
          extracted.push({
            ...item,
            id: item.id || `DOC_${docId.slice(-4)}_${idx + 1}`,
            templateId: tpl,
            sourceDocumentId: docId,
            sourceDocumentTitle: docTitle
          });
        } else if (item && typeof item === 'object') {
          const tpl: QuestionCategoryId =
            item.templateId && /^TPL_[ABCD][12]$/.test(item.templateId)
              ? item.templateId
              : 'TPL_A1';
          const lv: CognitiveLevel =
            item.level &&
            ['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'].includes(item.level)
              ? item.level
              : 'thong_hieu';
          extracted.push(
            buildExerciseFromSpec({
              id: item.id || `DOC_${docId.slice(-4)}_${idx + 1}`,
              templateId: tpl,
              level: lv,
              a: Number(item.a) || 2,
              b: Number(item.b) || 3,
              op: (['<=', '<', '>=', '>'].includes(item.op) ? item.op : '<=') as ComparisonOperator,
              c: Number(item.c) || 12,
              mx: Number(item.mx ?? 2),
              my: Number(item.my ?? 1),
              p: Number(item.p) || 40,
              q: Number(item.q) || 30,
              customTitle: item.title,
              customContextStory: item.contextStory || item.questionText,
              sourceDocumentId: docId,
              sourceDocumentTitle: docTitle
            })
          );
        }
      });

      if (extracted.length > 0) return extracted;
    } catch {
      // Fall through to text parser
    }
  }

  // 2. Try CSV parsing if .csv
  if (fileName.toLowerCase().endsWith('.csv')) {
    const lines = cleanText.split(/\r?\n/).filter(l => l.trim().length > 0);
    const extracted: AssessmentExercise[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(s => s.replace(/^"|"$/g, '').trim());
      if (cols.length < 4) continue;
      const tplRaw = cols[0].toUpperCase();
      const tpl: QuestionCategoryId = /^TPL_[ABCD][12]$/.test(tplRaw)
        ? (tplRaw as QuestionCategoryId)
        : 'TPL_A1';
      const lvRaw = cols[1].toLowerCase();
      const lv: CognitiveLevel = (
        ['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'].includes(lvRaw)
          ? lvRaw
          : 'thong_hieu'
      ) as CognitiveLevel;
      const a = parseFloat(cols[2]) || 2;
      const b = parseFloat(cols[3]) || 1;
      const op = (['<=', '<', '>=', '>'].includes(cols[4]) ? cols[4] : '<=') as ComparisonOperator;
      const c = parseFloat(cols[5]) || 8;
      const mx = parseFloat(cols[6]) || 1;
      const my = parseFloat(cols[7]) || 2;
      const p = parseFloat(cols[8]) || 50;
      const q = parseFloat(cols[9]) || 30;
      const customTitle = cols[10] || undefined;
      const customContextStory = cols[11] || undefined;

      extracted.push(
        buildExerciseFromSpec({
          id: `DOC_${docId.slice(-4)}_${i}`,
          templateId: tpl,
          level: lv,
          a,
          b,
          op,
          c,
          mx,
          my,
          p,
          q,
          customTitle,
          customContextStory,
          sourceDocumentId: docId,
          sourceDocumentTitle: docTitle
        })
      );
    }
    if (extracted.length > 0) return extracted;
  }

  // 3. Free-form Text / Markdown / Word-copied text parser
  // Split by "Câu 1", "Bài 1", "---", or double newlines
  const rawBlocks = cleanText
    .split(/(?:\r?\n\s*---\s*\r?\n)|(?=(?:^|\r?\n)\s*(?:Câu|Bài|Question|Dạng)\s+\d+[:.)])/i)
    .map(b => b.trim())
    .filter(b => b.length > 10);

  const blocks =
    rawBlocks.length > 0
      ? rawBlocks
      : cleanText
          .split(/\r?\n\s*\r?\n/)
          .map(b => b.trim())
          .filter(b => b.length > 10);

  const extracted: AssessmentExercise[] = [];

  blocks.forEach((block, idx) => {
    const lower = block.toLowerCase();

    // Detect explicit template tag e.g. [TPL_A1] or Dạng 1..8
    let tpl: QuestionCategoryId | null = null;
    const explicitTplMatch = block.match(/TPL_[ABCD][12]/i);
    if (explicitTplMatch) {
      tpl = explicitTplMatch[0].toUpperCase() as QuestionCategoryId;
    } else if (/dạng\s*8|chi\s*phí\s*nhỏ\s*nhất|tối\s*thiểu|min\b/i.test(lower)) {
      tpl = 'TPL_D2';
    } else if (/dạng\s*7|lợi\s*nhuận\s*lớn\s*nhất|tối\s*đa|hàm\s*mục\s*tiêu|f\s*\(\s*x\s*[;,]\s*y\s*\)|max\b/i.test(lower)) {
      tpl = 'TPL_D1';
    } else if (/dạng\s*6|đa\s*giác\s*nghiệm|diện\s*tích\s*miền|tứ\s*giác|tam\s*giác/i.test(lower)) {
      tpl = 'TPL_C2';
    } else if (/dạng\s*5|giao\s*điểm|hệ\s*bất\s*phương\s*trình|hệ\s*bpt|\(d1\)/i.test(lower)) {
      tpl = 'TPL_C1';
    } else if (/dạng\s*4|mua\s*sắm|ngân\s*sách|sản\s*xuất|phân\s*bổ/i.test(lower)) {
      tpl = 'TPL_B2';
    } else if (/dạng\s*3|biểu\s*diễn\s*miền\s*nghiệm|nửa\s*mặt\s*phẳng/i.test(lower)) {
      tpl = 'TPL_B1';
    } else if (/dạng\s*2|đường\s*bờ|nét\s*liền|nét\s*đứt|đường\s*biên/i.test(lower)) {
      tpl = 'TPL_A2';
    } else if (/dạng\s*1|kiểm\s*tra\s*điểm|thuộc\s*miền\s*nghiệm/i.test(lower)) {
      tpl = 'TPL_A1';
    } else {
      // Fallback by defaultTopic or cycle through categories
      if (defaultTopic === 'A') tpl = idx % 2 === 0 ? 'TPL_A1' : 'TPL_A2';
      else if (defaultTopic === 'B') tpl = idx % 2 === 0 ? 'TPL_B1' : 'TPL_B2';
      else if (defaultTopic === 'C') tpl = idx % 2 === 0 ? 'TPL_C1' : 'TPL_C2';
      else if (defaultTopic === 'D') tpl = idx % 2 === 0 ? 'TPL_D1' : 'TPL_D2';
      else {
        const cycle: QuestionCategoryId[] = [
          'TPL_A1',
          'TPL_A2',
          'TPL_B1',
          'TPL_B2',
          'TPL_C1',
          'TPL_C2',
          'TPL_D1',
          'TPL_D2'
        ];
        tpl = cycle[idx % cycle.length];
      }
    }

    // Detect cognitive level
    let level: CognitiveLevel = 'thong_hieu';
    if (/vận\s*dụng\s*cao|van_dung_cao|mức\s*4/i.test(lower)) {
      level = 'van_dung_cao';
    } else if (/vận\s*dụng|van_dung|mức\s*3/i.test(lower)) {
      level = 'van_dung';
    } else if (/thông\s*hiểu|thong_hieu|mức\s*2/i.test(lower)) {
      level = 'thong_hieu';
    } else if (/nhận\s*biết|nhan_biet|mức\s*1/i.test(lower)) {
      level = 'nhan_biet';
    } else {
      const catMeta = QUESTION_CATEGORY_CATALOG.find(c => c.id === tpl);
      if (catMeta) level = catMeta.defaultLevel;
    }

    // Extract inequality pattern like: 2x + 3y <= 12 or x - 2y ≥ 6
    let a = 2 + (idx % 3);
    let b = 1 + ((idx + 1) % 3);
    let op: ComparisonOperator = '<=';
    let c = 10 + idx * 2;

    const ineqRegex = /([+-]?\s*\d*)\s*x\s*([+-]\s*\d*)\s*y\s*(<=|>=|<|>|≤|≥)\s*([+-]?\d+)/i;
    const ineqMatch = block.match(ineqRegex);
    if (ineqMatch) {
      const rawA = ineqMatch[1].replace(/\s+/g, '');
      const rawB = ineqMatch[2].replace(/\s+/g, '');
      a = rawA === '' || rawA === '+' ? 1 : rawA === '-' ? -1 : parseFloat(rawA) || 2;
      b = rawB === '' || rawB === '+' ? 1 : rawB === '-' ? -1 : parseFloat(rawB) || 1;
      const rawOp = ineqMatch[3];
      op =
        rawOp === '≤' || rawOp === '<='
          ? '<='
          : rawOp === '≥' || rawOp === '>='
          ? '>='
          : rawOp === '<'
          ? '<'
          : '>';
      c = parseFloat(ineqMatch[4]) || 10;
    }

    // Extract point M(x; y) or A(x; y)
    let mx = 2;
    let my = 1;
    const ptRegex = /[MA]\s*\(\s*([+-]?\d+)\s*[;,]\s*([+-]?\d+)\s*\)/i;
    const ptMatch = block.match(ptRegex);
    if (ptMatch) {
      mx = parseFloat(ptMatch[1]) || 0;
      my = parseFloat(ptMatch[2]) || 0;
    }

    // Extract objective function F(x; y) = px + qy
    let p = 50;
    let q = 30;
    const objRegex = /F\s*(?:\(\s*x\s*[;,]\s*y\s*\))?\s*=\s*(\d+)\s*x\s*\+\s*(\d+)\s*y/i;
    const objMatch = block.match(objRegex);
    if (objMatch) {
      p = parseFloat(objMatch[1]) || 50;
      q = parseFloat(objMatch[2]) || 30;
    }

    const firstLine = block.split(/\r?\n/)[0].replace(/^(?:Câu|Bài)\s*\d+[:.)]?\s*/i, '').trim();
    const shortTitle =
      firstLine.length > 8 && firstLine.length < 95
        ? `[${docTitle.slice(0, 18)}] ${firstLine}`
        : undefined;

    extracted.push(
      buildExerciseFromSpec({
        id: `DOC_${docId.slice(-4)}_${idx + 1}`,
        templateId: tpl,
        level,
        a,
        b,
        op,
        c,
        mx,
        my,
        p,
        q,
        customTitle: shortTitle,
        customContextStory: block.length < 320 ? block : undefined,
        sourceDocumentId: docId,
        sourceDocumentTitle: docTitle
      })
    );
  });

  // Ensure at least 1 exercise is extracted if text wasn't empty
  if (extracted.length === 0) {
    extracted.push(
      buildExerciseFromSpec({
        id: `DOC_${docId.slice(-4)}_1`,
        templateId: 'TPL_A1',
        level: 'thong_hieu',
        a: 2,
        b: 3,
        op: '<=',
        c: 12,
        mx: 2,
        my: 1,
        customTitle: `[${docTitle}] Bài tập trích xuất từ tài liệu`,
        customContextStory: cleanText.slice(0, 220),
        sourceDocumentId: docId,
        sourceDocumentTitle: docTitle
      })
    );
  }

  return extracted;
}

/**
 * Creates a rich parameter-mutated variant of an existing exercise from a document
 * so teachers can generate unlimited fresh questions of the exact same type & document context!
 */
export function createVariedExerciseFromSource(
  baseEx: AssessmentExercise,
  variantIndex: number
): AssessmentExercise {
  const tpl = baseEx.templateId || inferTemplateIdFromExercise(baseEx);
  const ineq = baseEx.mathData.inequality || baseEx.mathData.system?.[0];
  const baseA = ineq?.a ?? 2;
  const baseB = ineq?.b ?? 3;
  const baseOp = ineq?.op ?? '<=';
  const basePt =
    baseEx.mathData.testPoint ||
    baseEx.mathData.evaluationVertex?.point || { x: 2, y: 1 };

  const deltaA = (variantIndex % 3) + 1;
  const deltaB = ((variantIndex + 1) % 2) + 1;
  const newA = baseA >= 0 ? baseA + deltaA : baseA - deltaA;
  const newB = baseB >= 0 ? baseB + deltaB : baseB - deltaB;
  const newMx = Math.max(1, Math.abs(basePt.x) + (variantIndex % 2));
  const newMy = Math.max(1, Math.abs(basePt.y) + ((variantIndex + 1) % 2));
  const newC = Math.abs(newA * newMx + newB * newMy) + (variantIndex % 2 === 0 ? 2 : -1);

  const baseP = baseEx.mathData.objective?.a ?? 45;
  const baseQ = baseEx.mathData.objective?.b ?? 35;
  const newP = baseP + variantIndex * 10;
  const newQ = baseQ + variantIndex * 5;

  const newId = `${baseEx.id}_V${variantIndex}_${Date.now().toString().slice(-3)}`;

  return buildExerciseFromSpec({
    id: newId,
    templateId: tpl,
    level: baseEx.level,
    a: newA,
    b: newB,
    op: baseOp,
    c: Math.max(4, newC),
    mx: newMx,
    my: newMy,
    p: newP,
    q: newQ,
    customTitle: `${baseEx.title.replace(/\s*\(Biến thể.*?\)$/, '')} (Biến thể đề #${variantIndex})`,
    customContextStory: baseEx.contextStory,
    sourceDocumentId: baseEx.sourceDocumentId,
    sourceDocumentTitle: baseEx.sourceDocumentTitle
  });
}

/**
 * Generates a rich exam from the selected documents in the Teacher Document Library
 * based on the teacher's selected question types (ExamTypeSlotConfig[]).
 */
export function generateExamFromLibrary(params: {
  documents: LibraryDocument[];
  selectedDocumentIds: string[];
  slotConfigs: ExamTypeSlotConfig[];
  allowParameterVariation: boolean;
}): AssessmentExercise[] {
  const {
    documents,
    selectedDocumentIds,
    slotConfigs,
    allowParameterVariation
  } = params;

  const activeDocs =
    selectedDocumentIds.length > 0
      ? documents.filter(d => selectedDocumentIds.includes(d.id))
      : documents;

  const poolExercises: AssessmentExercise[] = activeDocs.flatMap(doc =>
    doc.extractedExercises.map(ex => ({
      ...ex,
      templateId: ex.templateId || inferTemplateIdFromExercise(ex),
      sourceDocumentId: ex.sourceDocumentId || doc.id,
      sourceDocumentTitle: ex.sourceDocumentTitle || doc.title
    }))
  );

  const selectedResults: AssessmentExercise[] = [];
  const usedIds = new Set<string>();

  for (const slot of slotConfigs) {
    if (!slot.enabled || slot.count <= 0) continue;

    // 1. Find candidates in the Document Library matching this exact Question Category (templateId)
    const exactTypeCandidates = poolExercises.filter(
      ex => (ex.templateId || inferTemplateIdFromExercise(ex)) === slot.templateId
    );

    // Prioritize matching preferredLevel if specified
    const levelMatched =
      slot.preferredLevel === 'ALL'
        ? exactTypeCandidates
        : [
            ...exactTypeCandidates.filter(ex => ex.level === slot.preferredLevel),
            ...exactTypeCandidates.filter(ex => ex.level !== slot.preferredLevel)
          ];

    // Shuffle candidates for variety
    const shuffled = [...levelMatched].sort(() => Math.random() - 0.5);

    let pickedForSlot = 0;

    for (const candidate of shuffled) {
      if (pickedForSlot >= slot.count) break;
      if (usedIds.has(candidate.id)) continue;

      if (allowParameterVariation && Math.random() < 0.35) {
        const varied = createVariedExerciseFromSource(candidate, pickedForSlot + 1);
        usedIds.add(varied.id);
        selectedResults.push(varied);
      } else {
        usedIds.add(candidate.id);
        selectedResults.push(candidate);
      }
      pickedForSlot++;
    }

    // If the teacher requested more questions of this type than exist verbatim in the selected documents,
    // generate rich variants derived from the document's questions (or template spec) so the exam always fulfills the exact count!
    while (pickedForSlot < slot.count) {
      const variantIdx = pickedForSlot + 1;
      if (shuffled.length > 0) {
        const baseCandidate = shuffled[pickedForSlot % shuffled.length];
        const varied = createVariedExerciseFromSource(baseCandidate, variantIdx);
        usedIds.add(varied.id);
        selectedResults.push(varied);
      } else {
        // Fallback synthesis tagged with the first selected document
        const fallbackDoc = activeDocs[0];
        const catMeta =
          QUESTION_CATEGORY_CATALOG.find(c => c.id === slot.templateId) ||
          QUESTION_CATEGORY_CATALOG[0];
        const lv =
          slot.preferredLevel === 'ALL' ? catMeta.defaultLevel : slot.preferredLevel;
        const synth = buildExerciseFromSpec({
          id: `LIB_GEN_${slot.templateId}_${Date.now().toString().slice(-3)}_${variantIdx}`,
          templateId: slot.templateId,
          level: lv,
          a: 2 + (variantIdx % 3),
          b: 1 + (variantIdx % 2),
          op: variantIdx % 2 === 0 ? '<=' : '>=',
          c: 10 + variantIdx * 2,
          mx: 2,
          my: 1 + (variantIdx % 2),
          p: 40 + variantIdx * 10,
          q: 30 + variantIdx * 5,
          sourceDocumentId: fallbackDoc?.id || 'DOC_LIBRARY',
          sourceDocumentTitle: fallbackDoc?.title || 'Kho Thư Viện Tài Liệu'
        });
        usedIds.add(synth.id);
        selectedResults.push(synth);
      }
      pickedForSlot++;
    }
  }

  return selectedResults;
}

/**
 * Downloads a sample document file (.txt or .json) so the teacher has a ready-made template to upload.
 */
export function downloadSampleDocumentTemplate(format: 'txt' | 'json'): void {
  if (format === 'json') {
    const sampleJson = {
      documentTitle: 'Tài liệu mẫu Giáo viên: Chuyên đề BPT & Tối ưu Toán 10',
      questions: [
        {
          templateId: 'TPL_A1',
          level: 'nhan_biet',
          title: 'Kiểm tra điểm M(3; 1) thuộc miền nghiệm 2x + 3y ≤ 12',
          a: 2,
          b: 3,
          op: '<=',
          c: 12,
          mx: 3,
          my: 1
        },
        {
          templateId: 'TPL_B1',
          level: 'thong_hieu',
          title: 'Biểu diễn miền nghiệm BPT 3x - y ≤ 6 trên mặt phẳng Oxy',
          a: 3,
          b: -1,
          op: '<=',
          c: 6,
          mx: 0,
          my: 0
        },
        {
          templateId: 'TPL_C1',
          level: 'van_dung',
          title: 'Tìm giao điểm hai đường bờ và kiểm tra đỉnh A(3; 2)',
          a: 2,
          b: 1,
          op: '<=',
          c: 8,
          mx: 3,
          my: 2
        },
        {
          templateId: 'TPL_D1',
          level: 'van_dung_cao',
          title: 'Bài toán thực tế tối ưu lợi nhuận xưởng sản xuất F(x; y) = 65x + 45y',
          contextStory:
            'Một xưởng sản xuất hai loại sản phẩm x, y. Tại đỉnh cực biên A(4; 3), hãy tính lợi nhuận lớn nhất.',
          a: 1,
          b: 1,
          op: '<=',
          c: 7,
          mx: 4,
          my: 3,
          p: 65,
          q: 45
        }
      ]
    };
    const blob = new Blob([JSON.stringify(sampleJson, null, 2)], {
      type: 'application/json;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mau_tai_lieu_kho_de_toan10.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  const sampleTxt = `TÀI LIỆU MẪU GIÁO VIÊN: NGÂN HÀNG CÂU HỎI CHƯƠNG II - TOÁN 10
(Giáo viên có thể soạn câu hỏi theo từng đoạn cách nhau bởi dấu --- hoặc chữ Câu 1, Câu 2...)

Câu 1 [TPL_A1 - Nhận biết]: Kiểm tra điểm thuộc miền nghiệm BPT
Cho bất phương trình 3x + 2y <= 14 và điểm M(2; 3). Hãy thay tọa độ M vào vế trái và kết luận.

---

Câu 2 [TPL_A2 - Thông hiểu]: Nhận diện đường thẳng bờ và kiểu nét vẽ
Cho bất phương trình 2x - 5y < 10. Hãy xác định hằng số c và kiểu đường bờ (nét liền hay nét đứt).

---

Câu 3 [TPL_B1 - Thông hiểu]: Biểu diễn miền nghiệm trên mặt phẳng Oxy
Biểu diễn miền nghiệm của bất phương trình 2x + y <= 8 với điểm thử M(1; 1).

---

Câu 4 [TPL_B2 - Vận dụng]: Bài toán mua sắm thực tế lập BPT
Một nhóm học sinh mua x phần bánh và y phần nước với ràng buộc ngân sách 15x + 10y <= 90. Kiểm tra tại M(3; 2).

---

Câu 5 [TPL_C1 - Vận dụng]: Tìm giao điểm hai đường bờ của Hệ BPT
Cho hệ bất phương trình có hai đường bờ cắt nhau tại A(3; 2) với 2x + y <= 8. Tìm giao điểm và kiểm tra điều kiện không âm.

---

Câu 6 [TPL_D1 - Vận dụng]: Bài toán tối ưu lợi nhuận LỚN NHẤT (MAX)
Một xưởng cơ khí xét phương án tại đỉnh A(4; 2) với hàm mục tiêu lợi nhuận F(x; y) = 60x + 40y (nghìn đồng).

---

Câu 7 [TPL_D2 - Vận dụng cao]: Bài toán tối ưu chi phí NHỎ NHẤT (MIN)
Bài toán khẩu phần dinh dưỡng xét tại đỉnh cực biên A(2; 3) với hàm chi phí F(x; y) = 35x + 25y (nghìn đồng).
`;

  const blob = new Blob(['\uFEFF' + sampleTxt], {
    type: 'text/plain;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mau_tai_lieu_kho_de_toan10.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// BACKEND API + LOCAL STORAGE / INDEXEDDB PERSISTENCE LAYER
// ============================================================================

const LS_LIBRARY_DOCS_KEY = 'optimath_v5_library_documents';
const LS_CLOUD_DB_CONFIG_KEY = 'optimath_v5_cloud_db_config';

export interface CloudDatabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function buildSupabaseHeaders(
  apiKey: string,
  extra?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: apiKey,
    ...extra
  };
  if (apiKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return headers;
}

export function getCloudDbConfig(): CloudDatabaseConfig {
  const envUrl =
    (import.meta.env?.VITE_SUPABASE_URL as string) ||
    'https://aysxfxzwvxazoanjltne.supabase.co';
  const envKey =
    (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) ||
    'sb_publishable_yohYyzFOqQWnMIPd0i2A0Q_tc9apO_Z';
  try {
    const raw = localStorage.getItem(LS_CLOUD_DB_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        supabaseUrl: (parsed.supabaseUrl || envUrl).trim().replace(/\/+$/, ''),
        supabaseAnonKey: (parsed.supabaseAnonKey || envKey).trim()
      };
    }
  } catch {
    // Ignore
  }
  return {
    supabaseUrl: envUrl.trim().replace(/\/+$/, ''),
    supabaseAnonKey: envKey.trim()
  };
}

export function saveCloudDbConfig(config: CloudDatabaseConfig): void {
  try {
    localStorage.setItem(
      LS_CLOUD_DB_CONFIG_KEY,
      JSON.stringify({
        supabaseUrl: config.supabaseUrl.trim().replace(/\/+$/, ''),
        supabaseAnonKey: config.supabaseAnonKey.trim()
      })
    );
  } catch {
    // Ignore
  }
}

function loadLocalDocumentsFallback(): LibraryDocument[] {
  try {
    const raw = localStorage.getItem(LS_LIBRARY_DOCS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }
  const seeded = buildDefaultLibraryDocuments();
  try {
    localStorage.setItem(LS_LIBRARY_DOCS_KEY, JSON.stringify(seeded));
  } catch {
    // Ignore
  }
  return seeded;
}

function saveLocalDocumentsFallback(docs: LibraryDocument[]): void {
  try {
    localStorage.setItem(LS_LIBRARY_DOCS_KEY, JSON.stringify(docs));
  } catch {
    // Ignore quota errors
  }
}

export interface BackendHealthStatus {
  online: boolean;
  mode: 'supabase_cloud' | 'backend_api' | 'local_hybrid';
  documentsCount: number;
  storageLocation: string;
}

export async function checkBackendHealth(): Promise<BackendHealthStatus> {
  const cloud = getCloudDbConfig();
  if (cloud.supabaseUrl && cloud.supabaseAnonKey) {
    try {
      const res = await fetch(
        `${cloud.supabaseUrl}/rest/v1/optimath_documents?select=id`,
        {
          method: 'GET',
          headers: buildSupabaseHeaders(cloud.supabaseAnonKey)
        }
      );
      if (res.ok) {
        const rows = await res.json();
        return {
          online: true,
          mode: 'supabase_cloud',
          documentsCount: Array.isArray(rows) ? rows.length : 0,
          storageLocation: `Supabase Cloud PostgreSQL (${new URL(cloud.supabaseUrl).host})`
        };
      }
    } catch {
      // Fallback
    }
  }

  try {
    const res = await fetch('/api/health', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        mode: 'backend_api',
        documentsCount: data.documentsCount ?? 0,
        storageLocation: data.storagePath || 'server/data/db.json'
      };
    }
  } catch {
    // Offline or static host
  }
  const localDocs = loadLocalDocumentsFallback();
  return {
    online: false,
    mode: 'local_hybrid',
    documentsCount: localDocs.length,
    storageLocation: 'IndexedDB / LocalStorage (Đồng bộ trình duyệt)'
  };
}

export async function fetchLibraryDocuments(): Promise<LibraryDocument[]> {
  const cloud = getCloudDbConfig();
  if (cloud.supabaseUrl && cloud.supabaseAnonKey) {
    try {
      const res = await fetch(
        `${cloud.supabaseUrl}/rest/v1/optimath_documents?select=*&order=uploaded_at.desc`,
        {
          method: 'GET',
          headers: buildSupabaseHeaders(cloud.supabaseAnonKey)
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const docs: LibraryDocument[] = rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            fileName: r.file_name,
            fileType: r.file_type || 'txt',
            fileSize: r.file_size || 0,
            uploadedAt: Number(r.uploaded_at) || Date.now(),
            topic: r.topic || 'ALL',
            description: r.description || '',
            rawContent: r.raw_content || '',
            extractedExercises: Array.isArray(r.extracted_exercises)
              ? r.extracted_exercises
              : [],
            questionTypeCounts: r.question_type_counts || {}
          }));
          saveLocalDocumentsFallback(docs);
          return docs;
        } else if (Array.isArray(rows) && rows.length === 0) {
          // Auto-seed default curriculum documents into Supabase on first connection
          const seeded = buildDefaultLibraryDocuments();
          fetch(`${cloud.supabaseUrl}/rest/v1/optimath_documents`, {
            method: 'POST',
            headers: buildSupabaseHeaders(cloud.supabaseAnonKey, {
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates'
            }),
            body: JSON.stringify(
              seeded.map(d => ({
                id: d.id,
                title: d.title,
                file_name: d.fileName,
                file_type: d.fileType,
                file_size: d.fileSize,
                uploaded_at: d.uploadedAt,
                topic: d.topic,
                description: d.description,
                raw_content: d.rawContent,
                extracted_exercises: d.extractedExercises,
                question_type_counts: d.questionTypeCounts
              }))
            )
          }).catch(() => {});
          saveLocalDocumentsFallback(seeded);
          return seeded;
        }
      }
    } catch {
      // Fallback to local/backend
    }
  }

  try {
    const res = await fetch('/api/documents', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.documents) && data.documents.length > 0) {
        saveLocalDocumentsFallback(data.documents);
        return data.documents;
      }
    }
  } catch {
    // Fallback to local
  }
  return loadLocalDocumentsFallback();
}

export async function uploadDocumentToLibrary(params: {
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  topic: AssessmentTopicId | 'ALL';
  description: string;
  rawContent: string;
}): Promise<{
  document: LibraryDocument;
  allDocuments: LibraryDocument[];
  savedToBackend: boolean;
}> {
  const docId = `DOC_${Date.now()}`;
  const cleanTitle = params.title.trim() || params.fileName.replace(/\.[^.]+$/, '');
  const extracted = parseDocumentContentToExercises(
    params.rawContent,
    params.fileName,
    docId,
    cleanTitle,
    params.topic
  );

  const newDoc: LibraryDocument = {
    id: docId,
    title: cleanTitle,
    fileName: params.fileName,
    fileType: params.fileType,
    fileSize: params.fileSize || params.rawContent.length,
    uploadedAt: Date.now(),
    topic: params.topic,
    description:
      params.description.trim() ||
      `Tài liệu giáo viên tải lên (${extracted.length} câu hỏi được bóc tách tự động).`,
    rawContent: params.rawContent,
    extractedExercises: extracted,
    questionTypeCounts: computeTypeCounts(extracted)
  };

  let savedToBackend = false;

  // 1. Try Supabase Cloud PostgreSQL if configured
  const cloud = getCloudDbConfig();
  if (cloud.supabaseUrl && cloud.supabaseAnonKey) {
    try {
      const sbRes = await fetch(`${cloud.supabaseUrl}/rest/v1/optimath_documents`, {
        method: 'POST',
        headers: buildSupabaseHeaders(cloud.supabaseAnonKey, {
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        }),
        body: JSON.stringify({
          id: newDoc.id,
          title: newDoc.title,
          file_name: newDoc.fileName,
          file_type: newDoc.fileType,
          file_size: newDoc.fileSize,
          uploaded_at: newDoc.uploadedAt,
          topic: newDoc.topic,
          description: newDoc.description,
          raw_content: newDoc.rawContent,
          extracted_exercises: newDoc.extractedExercises,
          question_type_counts: newDoc.questionTypeCounts
        })
      });
      if (sbRes.ok) {
        savedToBackend = true;
      }
    } catch {
      // Continue
    }
  }

  // 2. Try Node.js Backend API (/api/documents)
  try {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document: newDoc })
    });
    if (res.ok) {
      const data = await res.json();
      savedToBackend = true;
      if (Array.isArray(data.documents)) {
        saveLocalDocumentsFallback(data.documents);
        return {
          document: newDoc,
          allDocuments: data.documents,
          savedToBackend: true
        };
      }
    }
  } catch {
    // Fallback to local storage
  }

  const current = loadLocalDocumentsFallback();
  const updated = [newDoc, ...current.filter(d => d.id !== newDoc.id)];
  saveLocalDocumentsFallback(updated);

  return {
    document: newDoc,
    allDocuments: updated,
    savedToBackend
  };
}

export async function deleteDocumentFromLibrary(docId: string): Promise<LibraryDocument[]> {
  const cloud = getCloudDbConfig();
  if (cloud.supabaseUrl && cloud.supabaseAnonKey) {
    try {
      await fetch(
        `${cloud.supabaseUrl}/rest/v1/optimath_documents?id=eq.${encodeURIComponent(docId)}`,
        {
          method: 'DELETE',
          headers: buildSupabaseHeaders(cloud.supabaseAnonKey)
        }
      );
    } catch {
      // Ignore
    }
  }

  try {
    const res = await fetch(`/api/documents/${encodeURIComponent(docId)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.documents)) {
        saveLocalDocumentsFallback(data.documents);
        return data.documents;
      }
    }
  } catch {
    // Fallback to local
  }
  const current = loadLocalDocumentsFallback();
  const updated = current.filter(d => d.id !== docId);
  saveLocalDocumentsFallback(updated);
  return updated;
}
