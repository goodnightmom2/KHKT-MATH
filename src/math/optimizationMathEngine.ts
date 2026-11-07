import {
  FeasibleRegionType,
  ObjectiveFunction,
  OptimizationGoal,
  OptimizationResult,
  Point2D,
  RealWorldScenario,
  SystemInequality,
  VertexEvaluation
} from '../types/math';
import {
  analyzeSystemFeasibleRegion,
  assignPolygonVertexLabels,
  checkPointAgainstInequality,
  clipBoxWithSystem,
  formatCoord,
  formatPointCoord,
  formatValueWithApprox
} from './systemMathEngine';
import { formatBoundaryLine, formatInequality, formatLinearLHS } from './mathEngine';

/**
 * 5 Comprehensive Real-World Benchmark Scenarios for Grade 10 Math
 */
export const REAL_WORLD_SCENARIOS: RealWorldScenario[] = [
  {
    id: 'scenario-1',
    title: 'Bài Toán 1: Sản Xuất Hai Loại Sản Phẩm (Mẫu SGK Chuẩn)',
    subtitle: 'Tối đa hóa lợi nhuận với nguồn lực máy móc & lao động',
    category: 'Sản xuất công nghiệp',
    description:
      'Một cơ sở sản xuất hai loại sản phẩm A và B từ hai nguồn lực máy móc và giờ công lao động.',
    storyText:
      'Một xưởng mộc sản xuất hai loại ghế gỗ: loại A và loại B. Để sản xuất 1 ghế loại A cần 2 giờ máy và 1 giờ nhân công, mang lại lợi nhuận 30 nghìn đồng. Để sản xuất 1 ghế loại B cần 1 giờ máy và 2 giờ nhân công, mang lại lợi nhuận 40 nghìn đồng. Trong một ca sản xuất, xưởng có tối đa 8 giờ máy và 8 giờ công lao động. Hãy lập phương án sản xuất để thu được lợi nhuận cao nhất.',
    tableData: {
      headers: ['Nguồn lực / Chỉ tiêu', 'Sản phẩm A (ghế)', 'Sản phẩm B (ghế)', 'Giới hạn tối đa'],
      rows: [
        ['Thời gian máy (giờ)', '2 giờ', '1 giờ', '≤ 8 giờ'],
        ['Thời gian lao động (giờ)', '1 giờ', '2 giờ', '≤ 8 giờ'],
        ['Lợi nhuận (nghìn đồng)', '30 nghìn', '40 nghìn', 'Tối đa hóa (MAX)']
      ]
    },
    variables: {
      x: {
        symbol: 'x',
        name: 'Sản phẩm A',
        meaning: 'Số lượng sản phẩm ghế loại A xưởng sản xuất trong ca',
        unit: 'sản phẩm',
        isInteger: true
      },
      y: {
        symbol: 'y',
        name: 'Sản phẩm B',
        meaning: 'Số lượng sản phẩm ghế loại B xưởng sản xuất trong ca',
        unit: 'sản phẩm',
        isInteger: true
      }
    },
    system: [
      { id: 'sc1-1', a: 2, b: 1, op: '<=', c: 8, color: '#2563EB', label: '(d1)', showLine: true, showFill: true },
      { id: 'sc1-2', a: 1, b: 2, op: '<=', c: 8, color: '#7C3AED', label: '(d2)', showLine: true, showFill: true },
      { id: 'sc1-3', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: '(d3)', showLine: true, showFill: true },
      { id: 'sc1-4', a: 0, b: 1, op: '>=', c: 0, color: '#D97706', label: '(d4)', showLine: true, showFill: true }
    ],
    objective: {
      cx: 30,
      cy: 40,
      label: 'P(x; y) = 30x + 40y',
      name: 'Lợi nhuận',
      unit: 'nghìn đồng',
      goal: 'max'
    },
    integerRequired: true,
    practicalQuestion: 'Xưởng cần sản xuất bao nhiêu ghế loại A và bao nhiêu ghế loại B để đạt lợi nhuận tối đa?',
    expectedConclusion:
      'Trong mô hình liên tục: P_max = 560/3 ≈ 186.67 nghìn đồng tại (8/3; 8/3). Vì số sản phẩm phải là số nguyên không âm, phương án sản xuất tối ưu là sản xuất 2 ghế loại A và 3 ghế loại B, đạt lợi nhuận tối đa 180 nghìn đồng.'
  },
  {
    id: 'scenario-2',
    title: 'Bài Toán 2: Phân Bổ Thời Gian Ôn Thi & Điểm Số',
    subtitle: 'Cân bằng thời gian học tập hai môn Toán và Tiếng Anh',
    category: 'Giáo dục & Kế hoạch',
    description:
      'Một học sinh lớp 10 lên kế hoạch phân bổ thời gian ôn tập trong tuần để đạt tổng điểm tích lũy cao nhất.',
    storyText:
      'Bạn Nam có tối đa 20 giờ mỗi tuần để tự học Toán và Tiếng Anh. Nam dự định dành ít nhất 6 giờ học Toán và ít nhất 4 giờ học Tiếng Anh. Để việc học cân đối, thời gian học Toán không được vượt quá 2 lần thời gian học Tiếng Anh. Mỗi giờ học Toán mang lại 5 điểm tiến bộ, mỗi giờ học Tiếng Anh mang lại 6 điểm tiến bộ. Nam nên phân bổ thời gian thế nào để tổng điểm tiến bộ lớn nhất?',
    tableData: {
      headers: ['Yêu cầu / Ràng buộc', 'Thời gian Toán (x)', 'Thời gian Tiếng Anh (y)', 'Ràng buộc thực tế'],
      rows: [
        ['Tổng thời gian tối đa', '1 giờ', '1 giờ', 'x + y ≤ 20 giờ'],
        ['Thời gian tối thiểu Toán', '1 giờ', '0 giờ', 'x ≥ 6 giờ'],
        ['Thời gian tối thiểu Anh', '0 giờ', '1 giờ', 'y ≥ 4 giờ'],
        ['Tính cân đối môn học', '1 giờ', '-2 giờ', 'x ≤ 2y (x - 2y ≤ 0)'],
        ['Điểm số quy đổi', '5 điểm/giờ', '6 điểm/giờ', 'Tối đa hóa S(x; y)']
      ]
    },
    variables: {
      x: {
        symbol: 'x',
        name: 'Giờ học Toán',
        meaning: 'Số giờ tự học môn Toán trong tuần',
        unit: 'giờ',
        isInteger: false
      },
      y: {
        symbol: 'y',
        name: 'Giờ học Tiếng Anh',
        meaning: 'Số giờ tự học môn Tiếng Anh trong tuần',
        unit: 'giờ',
        isInteger: false
      }
    },
    system: [
      { id: 'sc2-1', a: 1, b: 1, op: '<=', c: 20, color: '#2563EB', label: '(d1)', showLine: true, showFill: true },
      { id: 'sc2-2', a: 1, b: 0, op: '>=', c: 6, color: '#059669', label: '(d2)', showLine: true, showFill: true },
      { id: 'sc2-3', a: 0, b: 1, op: '>=', c: 4, color: '#D97706', label: '(d3)', showLine: true, showFill: true },
      { id: 'sc2-4', a: 1, b: -2, op: '<=', c: 0, color: '#7C3AED', label: '(d4)', showLine: true, showFill: true }
    ],
    objective: {
      cx: 5,
      cy: 6,
      label: 'S(x; y) = 5x + 6y',
      name: 'Điểm tiến bộ',
      unit: 'điểm',
      goal: 'max'
    },
    integerRequired: false,
    practicalQuestion: 'Nam cần dành bao nhiêu giờ học Toán và Tiếng Anh để đạt tổng điểm tiến bộ lớn nhất?',
    expectedConclusion:
      'Nam nên dành 6 giờ học Toán và 14 giờ học Tiếng Anh trong tuần để đạt điểm tiến bộ tối đa là 114 điểm.'
  },
  {
    id: 'scenario-3',
    title: 'Bài Toán 3: Phối Trộn Khẩu Phần Dinh Dưỡng (Tối Thiểu Hóa MIN)',
    subtitle: 'Đảm bảo protein và vitamin cho đàn vật nuôi với chi phí thấp nhất',
    category: 'Nông nghiệp & Chăn nuôi',
    description:
      'Phối trộn hai loại thức ăn công nghiệp để đáp ứng đủ nhu cầu dinh dưỡng tối thiểu với tổng chi phí nhỏ nhất.',
    storyText:
      'Một trang trại cần phối trộn thức ăn loại I và loại II cho đàn bò. Mỗi kg thức ăn loại I chứa 2 đơn vị protein và 1 đơn vị vitamin, giá 12 nghìn đồng. Mỗi kg thức ăn loại II chứa 1 đơn vị protein và 3 đơn vị vitamin, giá 15 nghìn đồng. Mỗi ngày, khẩu phần ăn phải chứa ít nhất 10 đơn vị protein và 12 đơn vị vitamin. Hãy xác định khối lượng từng loại để chi phí thấp nhất.',
    tableData: {
      headers: ['Chỉ tiêu dinh dưỡng', 'Thức ăn Loại I (x)', 'Thức ăn Loại II (y)', 'Nhu cầu tối thiểu'],
      rows: [
        ['Protein (đơn vị/kg)', '2 đơn vị', '1 đơn vị', '≥ 10 đơn vị'],
        ['Vitamin (đơn vị/kg)', '1 đơn vị', '3 đơn vị', '≥ 12 đơn vị'],
        ['Giá thành (nghìn đồng/kg)', '12 nghìn', '15 nghìn', 'Tối thiểu hóa (MIN)']
      ]
    },
    variables: {
      x: {
        symbol: 'x',
        name: 'Thức ăn loại I',
        meaning: 'Khối lượng thức ăn loại I cần dùng',
        unit: 'kg',
        isInteger: false
      },
      y: {
        symbol: 'y',
        name: 'Thức ăn loại II',
        meaning: 'Khối lượng thức ăn loại II cần dùng',
        unit: 'kg',
        isInteger: false
      }
    },
    system: [
      { id: 'sc3-1', a: 2, b: 1, op: '>=', c: 10, color: '#2563EB', label: '(d1)', showLine: true, showFill: true },
      { id: 'sc3-2', a: 1, b: 3, op: '>=', c: 12, color: '#7C3AED', label: '(d2)', showLine: true, showFill: true },
      { id: 'sc3-3', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: '(d3)', showLine: true, showFill: true },
      { id: 'sc3-4', a: 0, b: 1, op: '>=', c: 0, color: '#D97706', label: '(d4)', showLine: true, showFill: true }
    ],
    objective: {
      cx: 12,
      cy: 15,
      label: 'C(x; y) = 12x + 15y',
      name: 'Chi phí mua thức ăn',
      unit: 'nghìn đồng',
      goal: 'min'
    },
    integerRequired: false,
    practicalQuestion: 'Cần phối trộn bao nhiêu kg mỗi loại thức ăn để chi phí là nhỏ nhất?',
    expectedConclusion:
      'Trang trại cần phối trộn 3.6 kg thức ăn loại I (hoặc 18/5 kg) và 2.8 kg thức ăn loại II (hoặc 14/5 kg) để đạt chi phí nhỏ nhất là 85.2 nghìn đồng.'
  },
  {
    id: 'scenario-4',
    title: 'Bài Toán 4: Tối Ưu Chi Phí Thuê Xe Vận Tải Hàng Hóa',
    subtitle: 'Vận chuyển hàng và hành khách với số xe nguyên chiếc',
    category: 'Vận tải & Logistics',
    description:
      'Một công ty cần thuê hai loại xe tải để chở 100 tấn hàng và 120 nhân viên với chi phí rẻ nhất.',
    storyText:
      'Cần chuyển 100 tấn hàng và 120 người tới công trường. Có hai loại xe: Xe A (có tối đa 6 chiếc, giá thuê 4 triệu đồng/chuyến, chở được 20 tấn hàng và 15 người). Xe B (có tối đa 8 chiếc, giá thuê 3 triệu đồng/chuyến, chở được 10 tấn hàng và 20 người). Cần thuê bao nhiêu xe mỗi loại để chi phí thuê là nhỏ nhất?',
    tableData: {
      headers: ['Nhu cầu vận chuyển', 'Xe loại A (x chiếc)', 'Xe loại B (y chiếc)', 'Tổng nhu cầu'],
      rows: [
        ['Khối lượng hàng hóa', '20 tấn', '10 tấn', '≥ 100 tấn'],
        ['Số lượng người', '15 người', '20 người', '≥ 120 người'],
        ['Số xe sẵn có', 'x ≤ 6 chiếc', 'y ≤ 8 chiếc', 'Số xe nguyên không âm'],
        ['Giá thuê mỗi xe', '4 triệu', '3 triệu', 'Tối thiểu hóa chi phí (MIN)']
      ]
    },
    variables: {
      x: {
        symbol: 'x',
        name: 'Xe loại A',
        meaning: 'Số lượng xe loại A cần thuê',
        unit: 'xe',
        isInteger: true
      },
      y: {
        symbol: 'y',
        name: 'Xe loại B',
        meaning: 'Số lượng xe loại B cần thuê',
        unit: 'xe',
        isInteger: true
      }
    },
    system: [
      { id: 'sc4-1', a: 2, b: 1, op: '>=', c: 10, color: '#2563EB', label: '(d1)', showLine: true, showFill: true },
      { id: 'sc4-2', a: 3, b: 4, op: '>=', c: 24, color: '#7C3AED', label: '(d2)', showLine: true, showFill: true },
      { id: 'sc4-3', a: 1, b: 0, op: '<=', c: 6, color: '#059669', label: '(d3)', showLine: true, showFill: true },
      { id: 'sc4-4', a: 0, b: 1, op: '<=', c: 8, color: '#D97706', label: '(d4)', showLine: true, showFill: true },
      { id: 'sc4-5', a: 1, b: 0, op: '>=', c: 0, color: '#64748B', label: '(d5)', showLine: true, showFill: true }
    ],
    objective: {
      cx: 4,
      cy: 3,
      label: 'T(x; y) = 4x + 3y',
      name: 'Chi phí thuê xe',
      unit: 'triệu đồng',
      goal: 'min'
    },
    integerRequired: true,
    practicalQuestion: 'Công ty nên thuê bao nhiêu xe loại A và loại B để chi phí thuê là thấp nhất?',
    expectedConclusion:
      'Trong mô hình liên tục: T_min = 118/5 (23,6) triệu đồng tại (16/5; 18/5) = (3,2; 3,6). Vì số xe phải nguyên không âm, khảo sát các điểm nguyên khả thi (x, y) ∈ ℕ² ta có phương án tối ưu là thuê 3 xe loại A và 4 xe loại B, đạt chi phí thấp nhất là 24 triệu đồng.'
  },
  {
    id: 'scenario-5',
    title: 'Bài Toán 5: Trồng Cây Nông Trại (Vô Số Phương Án Tối Ưu)',
    subtitle: 'Trường hợp đường mức song song với cạnh của miền phương án',
    category: 'Nông nghiệp & Quy hoạch',
    description:
      'Phân bổ diện tích đất trồng đậu và ngô khi hàm lợi nhuận trùng tỉ lệ với ràng buộc ngày công lao động.',
    storyText:
      'Một gia đình có 10 héc-ta đất để trồng đậu và ngô. Trồng 1 ha đậu cần 20 công lao động, đem lại lợi nhuận 20 triệu đồng. Trồng 1 ha ngô cần 30 công lao động, đem lại lợi nhuận 30 triệu đồng. Gia đình chỉ có thể thu xếp tối đa 240 công lao động trong vụ mùa. Hãy tìm diện tích trồng mỗi loại cây để thu lợi nhuận cao nhất.',
    tableData: {
      headers: ['Nguồn lực / Tiêu chí', 'Trồng Đậu (x ha)', 'Trồng Ngô (y ha)', 'Khả năng đáp ứng'],
      rows: [
        ['Diện tích đất', '1 ha', '1 ha', '≤ 10 ha'],
        ['Công lao động', '20 công', '30 công', '≤ 240 công (2x + 3y ≤ 24)'],
        ['Lợi nhuận', '20 triệu', '30 triệu', 'L = 20x + 30y → MAX']
      ]
    },
    variables: {
      x: {
        symbol: 'x',
        name: 'Đậu',
        meaning: 'Diện tích trồng đậu',
        unit: 'héc-ta',
        isInteger: false
      },
      y: {
        symbol: 'y',
        name: 'Ngô',
        meaning: 'Diện tích trồng ngô',
        unit: 'héc-ta',
        isInteger: false
      }
    },
    system: [
      { id: 'sc5-1', a: 1, b: 1, op: '<=', c: 10, color: '#2563EB', label: '(d1)', showLine: true, showFill: true },
      { id: 'sc5-2', a: 2, b: 3, op: '<=', c: 24, color: '#7C3AED', label: '(d2)', showLine: true, showFill: true },
      { id: 'sc5-3', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: '(d3)', showLine: true, showFill: true },
      { id: 'sc5-4', a: 0, b: 1, op: '>=', c: 0, color: '#D97706', label: '(d4)', showLine: true, showFill: true }
    ],
    objective: {
      cx: 20,
      cy: 30,
      label: 'L(x; y) = 20x + 30y',
      name: 'Lợi nhuận vụ mùa',
      unit: 'triệu đồng',
      goal: 'max'
    },
    integerRequired: false,
    practicalQuestion: 'Nông trại nên phân bổ diện tích trồng đậu và ngô như thế nào để lợi nhuận cao nhất?',
    expectedConclusion:
      'Hàm mục tiêu L = 20x + 30y có vectơ pháp tuyến cùng phương với đường bờ 2x + 3y = 24. Do đó, bài toán có VÔ SỐ PHƯƠNG ÁN TỐI ƯU nằm trên toàn bộ đoạn thẳng nối từ đỉnh B(6; 4) đến đỉnh C(0; 8). Tất cả các phương án này đều đạt lợi nhuận cực đại bằng 240 triệu đồng!'
  }
];

/**
 * Evaluate objective function value at point (x; y).
 * CRITICAL: Preserve full IEEE-754 double precision for rational coordinates (like 8/3 -> 560/3);
 * snap ONLY if within 1e-9 of an exact integer.
 */
export function evaluateObjective(obj: ObjectiveFunction, pt: Point2D): number {
  const raw = obj.cx * pt.x + obj.cy * pt.y + (obj.constant || 0);
  const r = Math.round(raw);
  return Math.abs(raw - r) < 1e-9 ? r : raw;
}

/**
 * Format mathematical substitution string for a vertex
 */
export function formatObjectiveSubstitution(obj: ObjectiveFunction, pt: Point2D): string {
  const termX = `${obj.cx} × (${formatCoord(pt.x)})`;
  const termY = `${obj.cy} × (${formatCoord(pt.y)})`;
  const val = evaluateObjective(obj, pt);
  return `${termX} + ${termY} = ${formatValueWithApprox(val)} (${obj.unit})`;
}

/**
 * Check whether a point satisfies all inequalities in a system
 */
function isPointFeasible(pt: Point2D, system: SystemInequality[]): boolean {
  return system.every(ineq => checkPointAgainstInequality(ineq, pt, 1e-7).satisfies);
}

/**
 * Solve Linear Programming Problem (Continuous & Integer Models)
 */
export function solveLinearProgramming(scenario: RealWorldScenario): OptimizationResult {
  const { system, objective } = scenario;
  const analysis = analyzeSystemFeasibleRegion(system);
  const { orderedPolygon, regionType, feasibleVertices } = analysis;

  // Assign unified SGK vertex labels ('O' for origin, 'A', 'B', 'C', ... in CCW order)
  const labeledPolygon = assignPolygonVertexLabels(orderedPolygon);

  const vertexEvaluations: VertexEvaluation[] = labeledPolygon.map(({ point: v, label }) => {
    const value = evaluateObjective(objective, v);
    const substitutionText = formatObjectiveSubstitution(objective, v);
    const isStrictlyExcluded = !isPointFeasible(v, system);

    return {
      vertex: v,
      label,
      value,
      substitutionText,
      isOptimal: false,
      isStrictlyExcluded
    };
  });

  let optimalValue: number | null = null;
  const optimalPoints: Point2D[] = [];
  let isUnboundedObjective = false;
  let isStrictUnattained = false;
  let hasMultipleOptima = false;
  const isMax = objective.goal === 'max';

  if (regionType === 'empty') {
    optimalValue = null;
  } else if (regionType === 'unbounded' || regionType === 'degenerate_line') {
    // Analytically test whether the objective function is unbounded in the optimization direction
    // by comparing the extremum over [-R1, R1]^2 vs [-R2, R2]^2
    const R1 = 500;
    const R2 = 5000;
    const poly1 = clipBoxWithSystem({ minX: -R1, maxX: R1, minY: -R1, maxY: R1 }, system);
    const poly2 = clipBoxWithSystem({ minX: -R2, maxX: R2, minY: -R2, maxY: R2 }, system);

    if (poly1.length > 0 && poly2.length > 0) {
      const vals1 = poly1.map(p => evaluateObjective(objective, p));
      const vals2 = poly2.map(p => evaluateObjective(objective, p));
      const best1 = isMax ? Math.max(...vals1) : Math.min(...vals1);
      const best2 = isMax ? Math.max(...vals2) : Math.min(...vals2);

      if (isMax ? best2 > best1 + 1e-2 : best2 < best1 - 1e-2) {
        isUnboundedObjective = true;
      }
    }
  }

  // Find optimal vertex if objective is bounded and vertices exist
  if (vertexEvaluations.length > 0 && !isUnboundedObjective && regionType !== 'empty') {
    // Best value across the closure (all corner vertices)
    let closureBestVal = vertexEvaluations[0].value;
    for (const ve of vertexEvaluations) {
      if (isMax ? ve.value > closureBestVal : ve.value < closureBestVal) {
        closureBestVal = ve.value;
      }
    }

    // Check which vertices achieve closureBestVal
    const closureOptVerts = vertexEvaluations.filter(
      ve => Math.abs(ve.value - closureBestVal) < 1e-6
    );
    const feasibleOptVerts = closureOptVerts.filter(ve => !ve.isStrictlyExcluded);

    if (feasibleOptVerts.length === 0) {
      // Extremum occurs ONLY at strictly excluded boundary vertex/vertices (< or >)
      isStrictUnattained = true;
      optimalValue = null;
    } else {
      optimalValue = feasibleOptVerts[0].value;
      for (const ve of feasibleOptVerts) {
        ve.isOptimal = true;
        optimalPoints.push(ve.vertex);
      }
      if (feasibleOptVerts.length >= 2) {
        hasMultipleOptima = true;
      }
    }
  }

  // Search for integer lattice points (x, y) ∈ ℤ² within feasible region
  const integerPoints: { point: Point2D; value: number }[] = [];
  let integerOptimalPoint: Point2D | null = null;
  let integerOptimalValue: number | null = null;

  if (regionType !== 'empty' && !isUnboundedObjective) {
    let minX = 0;
    let maxX = 30;
    let minY = 0;
    let maxY = 30;

    if (orderedPolygon.length > 0 && regionType === 'bounded_polygon') {
      minX = Math.floor(Math.min(...orderedPolygon.map(p => p.x)) - 1e-7);
      maxX = Math.ceil(Math.max(...orderedPolygon.map(p => p.x)) + 1e-7);
      minY = Math.floor(Math.min(...orderedPolygon.map(p => p.y)) - 1e-7);
      maxY = Math.ceil(Math.max(...orderedPolygon.map(p => p.y)) + 1e-7);
    } else if (orderedPolygon.length > 0) {
      minX = Math.min(0, Math.floor(Math.min(...orderedPolygon.map(p => p.x))));
      minY = Math.min(0, Math.floor(Math.min(...orderedPolygon.map(p => p.y))));
      maxX = Math.max(25, Math.ceil(Math.max(...orderedPolygon.map(p => p.x)) + 5));
      maxY = Math.max(25, Math.ceil(Math.max(...orderedPolygon.map(p => p.y)) + 5));
    }

    minX = Math.max(-50, minX);
    minY = Math.max(-50, minY);
    maxX = Math.min(60, maxX);
    maxY = Math.min(60, maxY);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const pt = { x, y };
        if (isPointFeasible(pt, system)) {
          const val = evaluateObjective(objective, pt);
          integerPoints.push({ point: pt, value: val });
        }
      }
    }

    if (integerPoints.length > 0) {
      let bestIntVal = integerPoints[0].value;
      let bestIntPt = integerPoints[0].point;

      for (const ip of integerPoints) {
        if (isMax ? ip.value > bestIntVal + 1e-7 : ip.value < bestIntVal - 1e-7) {
          bestIntVal = ip.value;
          bestIntPt = ip.point;
        }
      }

      integerOptimalPoint = bestIntPt;
      integerOptimalValue = bestIntVal;
    }
  }

  // Generate SGK Summary & Practical Answer
  let summarySGK = '';
  let practicalAnswer = '';

  if (regionType === 'empty') {
    summarySGK =
      'Hệ bất phương trình ràng buộc có miền phương án khả thi là tập rỗng (∅). Bài toán không có phương án tối ưu.';
    practicalAnswer = 'Không thể thực hiện do các yêu cầu và nguồn lực mâu thuẫn nhau.';
  } else if (isUnboundedObjective) {
    summarySGK = `Miền phương án khả thi không bị chặn và hàm mục tiêu ${objective.label} ${
      isMax ? 'tăng vô hạn (+∞)' : 'giảm vô hạn (-∞)'
    }. Bài toán không có giá trị ${isMax ? 'lớn nhất' : 'nhỏ nhất'} hữu hạn.`;
    practicalAnswer =
      'Hàm mục tiêu không bị chặn trên miền phương án hiện tại (thiếu ràng buộc giới hạn nguồn lực).';
  } else if (isStrictUnattained) {
    const closureBest = vertexEvaluations.reduce((acc, cur) =>
      isMax ? (cur.value > acc.value ? cur : acc) : cur.value < acc.value ? cur : acc
    );
    summarySGK = `Cận ${isMax ? 'trên đúng (sup)' : 'dưới đúng (inf)'} của ${
      objective.label
    } là ${formatValueWithApprox(closureBest.value)} ${objective.unit} tại giao điểm đường biên ${
      closureBest.label
    }${formatPointCoord(
      closureBest.vertex
    )}, nhưng điểm này bị loại do dấu bất phương trình nghiêm ngặt (< hoặc >). Do đó hàm mục tiêu không đạt giá trị ${
      isMax ? 'lớn nhất' : 'nhỏ nhất'
    } trên miền liên tục.`;
    practicalAnswer =
      scenario.integerRequired && integerOptimalPoint && integerOptimalValue !== null
        ? `• Mô hình liên tục: Không đạt cực trị vì điểm biên ${formatPointCoord(
            closureBest.vertex
          )} bị loại bởi dấu nghiêm ngặt.\n• Mô hình nguyên (x, y ∈ ℕ): Phương án nguyên tối ưu là (${
            integerOptimalPoint.x
          }; ${integerOptimalPoint.y}) với giá trị đạt ${formatValueWithApprox(integerOptimalValue)} ${
            objective.unit
          }.`
        : `Hàm mục tiêu tiệm cận mức ${formatValueWithApprox(closureBest.value)} ${
            objective.unit
          } khi tiến sát biên ${formatPointCoord(closureBest.vertex)} nhưng không đạt dấu bằng.`;
  } else if (hasMultipleOptima && optimalPoints.length >= 2 && optimalValue !== null) {
    const optLabels = vertexEvaluations
      .filter(ve => ve.isOptimal)
      .map(ve => `${ve.label}${formatPointCoord(ve.vertex)}`)
      .join(' và ');
    summarySGK = `Đường mức hàm mục tiêu song song với cạnh nối các đỉnh ${optLabels}. Bài toán có VÔ SỐ PHƯƠNG ÁN TỐI ƯU trên đoạn thẳng nối hai đỉnh này với giá trị tối ưu = ${formatValueWithApprox(
      optimalValue
    )} ${objective.unit}.`;
    practicalAnswer = `Có vô số phương án phân bổ trên đoạn biên nối ${optLabels} đạt cùng hiệu quả tối ưu ${formatValueWithApprox(
      optimalValue
    )} ${objective.unit}.`;
  } else if (optimalPoints.length > 0 && optimalValue !== null) {
    const pt = optimalPoints[0];
    const optVe = vertexEvaluations.find(ve => ve.isOptimal);
    const ptLabel = optVe ? `${optVe.label}${formatPointCoord(pt)}` : formatPointCoord(pt);
    const valStr = formatValueWithApprox(optimalValue);

    summarySGK = `Hàm mục tiêu ${objective.label} đạt giá trị ${
      isMax ? 'lớn nhất (GTLN)' : 'nhỏ nhất (GTNN)'
    } bằng ${valStr} ${objective.unit} tại đỉnh ${ptLabel}.`;

    if (scenario.integerRequired && integerOptimalPoint && integerOptimalValue !== null) {
      const intValStr = formatValueWithApprox(integerOptimalValue);
      practicalAnswer = `• Mô hình liên tục: Đạt ${
        isMax ? 'GTLN' : 'GTNN'
      } bằng ${valStr} ${objective.unit} tại đỉnh ${ptLabel}.\n• Mô hình nguyên thực tế (x, y ∈ ℕ): Vì số lượng (${
        scenario.variables.x.unit
      }) phải là số nguyên không âm, phương án tối ưu nguyên là (${integerOptimalPoint.x}; ${
        integerOptimalPoint.y
      }) — tức ${integerOptimalPoint.x} ${scenario.variables.x.unit} ${
        scenario.variables.x.name
      } và ${integerOptimalPoint.y} ${scenario.variables.y.unit} ${
        scenario.variables.y.name
      }, đạt ${objective.name.toLowerCase()} ${
        isMax ? 'tối đa' : 'tối thiểu'
      } bằng ${intValStr} ${objective.unit}.`;
    } else {
      practicalAnswer = `Cần chọn phương án ${formatPointCoord(pt)} — tức ${formatCoord(pt.x)} ${
        scenario.variables.x.unit
      } ${scenario.variables.x.name} và ${formatCoord(pt.y)} ${scenario.variables.y.unit} ${
        scenario.variables.y.name
      } để đạt ${objective.name.toLowerCase()} tối ưu là ${valStr} ${objective.unit}.`;
    }
  }

  return {
    scenario,
    regionType,
    vertices: feasibleVertices,
    orderedPolygon,
    vertexEvaluations,
    optimalValue,
    optimalPoints,
    isUnboundedObjective,
    isStrictUnattained,
    integerPoints,
    integerOptimalPoint,
    integerOptimalValue,
    hasMultipleOptima,
    summarySGK,
    practicalAnswer
  };
}
