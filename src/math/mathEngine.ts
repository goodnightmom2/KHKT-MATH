import { ComparisonOperator, EvaluationResult, EvaluationStep, Inequality, Point2D, PointRelation } from '../types/math';

/**
 * Format linear expression ax + by cleanly
 */
export function formatLinearLHS(a: number, b: number): string {
  let result = '';

  // Term a*x
  if (a !== 0) {
    if (a === 1) result += 'x';
    else if (a === -1) result += '-x';
    else result += `${a}x`;
  }

  // Term b*y
  if (b !== 0) {
    if (result.length > 0) {
      if (b === 1) result += ' + y';
      else if (b === -1) result += ' - y';
      else if (b > 0) result += ` + ${b}y`;
      else result += ` - ${Math.abs(b)}y`;
    } else {
      if (b === 1) result += 'y';
      else if (b === -1) result += '-y';
      else result += `${b}y`;
    }
  }

  if (result === '') result = '0';
  return result;
}

/**
 * Convert comparison operator to Vietnamese text & symbol
 */
export function getOperatorSymbol(op: ComparisonOperator): string {
  switch (op) {
    case '<=': return '≤';
    case '>=': return '≥';
    case '<': return '<';
    case '>': return '>';
  }
}

/**
 * Format full inequality string: e.g. 2x + y ≤ 6
 */
export function formatInequality(ineq: Inequality): string {
  const lhs = formatLinearLHS(ineq.a, ineq.b);
  const sym = getOperatorSymbol(ineq.op);
  return `${lhs} ${sym} ${ineq.c}`;
}

/**
 * Format boundary line equation: e.g. 2x + y = 6
 */
export function formatBoundaryLine(a: number, b: number, c: number): string {
  const lhs = formatLinearLHS(a, b);
  return `${lhs} = ${c}`;
}

/**
 * Evaluate whether (x, y) satisfies ax + by (op) c
 */
export function checkPointInequality(
  ineq: Inequality,
  point: Point2D,
  eps = 1e-7
): { lhsValue: number; satisfies: boolean; relation: PointRelation } {
  const lhsValue = ineq.a * point.x + ineq.b * point.y;
  const diff = lhsValue - ineq.c;
  const onBoundary = Math.abs(diff) < eps;

  let satisfies = false;
  switch (ineq.op) {
    case '<=':
      satisfies = diff <= eps;
      break;
    case '<':
      satisfies = diff < -eps;
      break;
    case '>=':
      satisfies = diff >= -eps;
      break;
    case '>':
      satisfies = diff > eps;
      break;
  }

  let relation: PointRelation;
  if (onBoundary) {
    relation = 'on_boundary';
  } else if (satisfies) {
    relation = 'in_interior';
  } else {
    relation = 'outside';
  }

  return { lhsValue, satisfies, relation };
}

/**
 * Format a number cleanly as integer, exact fraction (for repeating decimals like 8/3), or 2-decimal number
 */
export function formatNumberClean(val: number): string {
  if (!Number.isFinite(val)) return '0';
  if (Math.abs(val) < 1e-9) return '0';
  if (Math.abs(val - Math.round(val)) < 1e-6) {
    return `${Math.round(val)}`;
  }
  // Check terminating 1 or 2 decimal places (denominators 2, 4, 5, 10, 20, 25, 50, 100)
  const rounded2 = Math.round(val * 100) / 100;
  if (Math.abs(val - rounded2) < 1e-6) {
    return `${rounded2}`;
  }
  // Check small denominators (3, 6, 7, 8, 9, 11, 12) for exact fraction display e.g. 8/3
  const sign = val < 0 ? '-' : '';
  const absVal = Math.abs(val);
  for (let den = 2; den <= 12; den++) {
    const num = Math.round(absVal * den);
    if (Math.abs(absVal - num / den) < 1e-5) {
      return `${sign}${num}/${den}`;
    }
  }
  return `${rounded2}`;
}

/**
 * Parse user input supporting both decimals ("2.5", "2,5") and fractions ("8/3", "-4/3")
 */
export function parseMathInput(raw: string): number {
  const cleaned = raw.trim().replace(',', '.');
  if (!cleaned) return NaN;
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length === 2) {
      const num = Number(parts[0].trim());
      const den = Number(parts[1].trim());
      if (Number.isFinite(num) && Number.isFinite(den) && Math.abs(den) > 1e-9) {
        return num / den;
      }
    }
  }
  return Number(cleaned);
}

/**
 * Format full substitution expression with explicit operators:
 * e.g., 2 × 1 + 1 × 2 = 4
 */
export function formatExplicitSubstitution(
  a: number,
  b: number,
  x: number,
  y: number
): { exprWithMul: string; intermediateExpr: string; totalLhs: number } {
  const strX = formatNumberClean(x);
  const strY = formatNumberClean(y);

  const formatNumStr = (val: number, s: string) => (val < 0 || s.includes('/') ? `(${s})` : s);

  const valA = a * x;
  const valB = b * y;
  const totalLhs = Math.round((valA + valB) * 1000) / 1000;
  const strValA = formatNumberClean(valA);
  const strValB = formatNumberClean( Math.abs(valB) );

  let exprWithMul = '';
  let intermediateExpr = '';

  if (a !== 0 && b !== 0) {
    const partA = `${a} × ${formatNumStr(x, strX)}`;
    if (b > 0) {
      exprWithMul = `${partA} + ${b} × ${formatNumStr(y, strY)}`;
    } else {
      exprWithMul = `${partA} - ${Math.abs(b)} × ${formatNumStr(y, strY)}`;
    }

    if (valB >= 0) {
      intermediateExpr = `${strValA} + ${formatNumberClean(valB)}`;
    } else {
      intermediateExpr = `${strValA} - ${strValB}`;
    }
  } else if (a !== 0) {
    exprWithMul = `${a} × ${formatNumStr(x, strX)}`;
    intermediateExpr = `${strValA}`;
  } else if (b !== 0) {
    if (b > 0) {
      exprWithMul = `${b} × ${formatNumStr(y, strY)}`;
    } else {
      exprWithMul = `-${Math.abs(b)} × ${formatNumStr(y, strY)}`;
    }
    intermediateExpr = `${formatNumberClean(valB)}`;
  } else {
    exprWithMul = '0';
    intermediateExpr = '0';
  }

  return { exprWithMul, intermediateExpr, totalLhs };
}

/**
 * Check if a point lies on the line ax + by = c (with numerical tolerance)
 */
export function isPointOnLine(a: number, b: number, c: number, point: Point2D, eps = 1e-3): boolean {
  return Math.abs(a * point.x + b * point.y - c) < eps;
}

/**
 * Determine if an inequality defines a closed half-plane (takes boundary) or open half-plane
 */
export function isClosedRegion(op: ComparisonOperator): boolean {
  return op === '<=' || op === '>=';
}

/**
 * Get boundary style based on comparison operator
 */
export function getBoundaryStyle(op: ComparisonOperator): 'solid' | 'dashed' {
  return isClosedRegion(op) ? 'solid' : 'dashed';
}

/**
 * Generate 2 canonical points on line ax + by = c for Step 3
 */
export function getSamplePointsOnLine(a: number, b: number, c: number): [Point2D, Point2D] {
  // Case 1: Vertical line x = c/a
  if (Math.abs(b) < 1e-6) {
    const x = c / a;
    return [{ x, y: 0 }, { x, y: 2 }];
  }

  // Case 2: Horizontal line y = c/b
  if (Math.abs(a) < 1e-6) {
    const y = c / b;
    return [{ x: 0, y }, { x: 2, y }];
  }

  // Case 3: Line passes through origin (c = 0)
  if (Math.abs(c) < 1e-6) {
    return [{ x: 0, y: 0 }, { x: b, y: -a }];
  }

  // Case 4: General line (exact intercepts with Ox and Oy so isPointOnLine is always exact)
  const pA: Point2D = { x: c / a, y: 0 };
  const pB: Point2D = { x: 0, y: c / b };

  if (Math.abs(pA.x - pB.x) < 1e-6 && Math.abs(pA.y - pB.y) < 1e-6) {
    return [{ x: 0, y: 0 }, { x: 1, y: (c - a) / b }];
  }

  return [pA, pB];
}

/**
 * Generate comprehensive educational step-by-step substitution & explanation
 */
export function evaluatePointWithSteps(ineq: Inequality, point: Point2D): EvaluationResult {
  const { satisfies, relation } = checkPointInequality(ineq, point);
  const { exprWithMul, intermediateExpr, totalLhs } = formatExplicitSubstitution(
    ineq.a,
    ineq.b,
    point.x,
    point.y
  );

  const roundedX = formatNumberClean(point.x);
  const roundedY = formatNumberClean(point.y);
  const strTotalLhs = formatNumberClean(totalLhs);
  const opSymbol = getOperatorSymbol(ineq.op);
  const isClosed = isClosedRegion(ineq.op);

  const steps: EvaluationStep[] = [
    {
      stepNumber: 1,
      title: 'Thay tọa độ điểm M',
      expression: `f(${roundedX}; ${roundedY}) = ${exprWithMul}`,
      result: `x = ${roundedX}, y = ${roundedY}`,
      explanation: `Thay hoành độ x = ${roundedX} và tung độ y = ${roundedY} vào vế trái của bất phương trình: ${formatLinearLHS(ineq.a, ineq.b)}.`
    },
    {
      stepNumber: 2,
      title: 'Tính giá trị vế trái',
      expression: `${exprWithMul} = ${intermediateExpr !== `${strTotalLhs}` ? `${intermediateExpr} = ` : ''}${strTotalLhs}`,
      result: `Vế trái = ${strTotalLhs}`,
      explanation: `Thực hiện phép nhân và cộng đại số: giá trị của vế trái tại điểm M là ${strTotalLhs}.`
    },
    {
      stepNumber: 3,
      title: 'So sánh với vế phải',
      expression: `${strTotalLhs} ${opSymbol} ${ineq.c}`,
      result: satisfies ? 'Mệnh đề ĐÚNG' : 'Mệnh đề SAI',
      explanation: `So sánh giá trị vế trái (${strTotalLhs}) với vế phải (${ineq.c}) qua dấu "${opSymbol}". Kết quả phép so sánh là ${satisfies ? 'chính xác (ĐÚNG)' : 'không thỏa mãn (SAI)'}.`
    },
    {
      stepNumber: 4,
      title: 'Kết luận miền nghiệm',
      expression: `M(${roundedX}; ${roundedY}) ${satisfies ? '∈' : '∉'} Miền nghiệm (${isClosed ? 'Miền đóng' : 'Miền mở'})`,
      result: satisfies
        ? (relation === 'on_boundary' ? 'Nằm trên đường biên (thỏa mãn)' : 'Thuộc miền nghiệm')
        : (relation === 'on_boundary' ? 'Nằm trên đường biên nét đứt (không lấy bờ)' : 'Không thuộc miền nghiệm'),
      explanation: satisfies
        ? (relation === 'on_boundary'
            ? `Điểm M nằm ngay trên đường thẳng biên ${formatBoundaryLine(ineq.a, ineq.b, ineq.c)}. Do bất phương trình có dấu "${opSymbol}" (miền nghiệm đóng), đường biên thuộc miền nghiệm.`
            : `Do mệnh đề đúng, điểm M(${roundedX}; ${roundedY}) là một nghiệm của bất phương trình ${formatInequality(ineq)}. Nửa mặt phẳng chứa M là miền nghiệm.`)
        : (relation === 'on_boundary'
            ? `Điểm M(${roundedX}; ${roundedY}) nằm ngay trên đường thẳng biên ${formatBoundaryLine(ineq.a, ineq.b, ineq.c)}. Do bất phương trình mang dấu so sánh nghiêm ngặt "${opSymbol}" (miền nghiệm mở, biểu diễn bằng nét đứt), đường biên không thuộc miền nghiệm.`
            : `Do mệnh đề sai, điểm M(${roundedX}; ${roundedY}) không phải là nghiệm của bất phương trình ${formatInequality(ineq)}. Miền nghiệm nằm ở nửa mặt phẳng phía bên kia bờ.`)
    }
  ];

  const algebraicSummary = `${exprWithMul} = ${strTotalLhs} ${opSymbol} ${ineq.c} (${satisfies ? 'Thỏa mãn' : 'Không thỏa mãn'})`;

  return {
    inequality: ineq,
    point,
    lhsValue: totalLhs,
    satisfies,
    relation,
    steps,
    algebraicSummary
  };
}

/**
 * Computes boundary line segment clipped within [minX, maxX, minY, maxY]
 */
export function getLineSegmentInBox(
  a: number,
  b: number,
  c: number,
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
): [Point2D, Point2D] | null {
  const { minX, maxX, minY, maxY } = bounds;
  const pts: Point2D[] = [];
  const eps = 1e-6;

  // Intersect with x = minX => a*minX + b*y = c => b*y = c - a*minX
  if (Math.abs(b) > eps) {
    const y1 = (c - a * minX) / b;
    if (y1 >= minY - eps && y1 <= maxY + eps) pts.push({ x: minX, y: y1 });
    const y2 = (c - a * maxX) / b;
    if (y2 >= minY - eps && y2 <= maxY + eps) pts.push({ x: maxX, y: y2 });
  }

  // Intersect with y = minY => a*x + b*minY = c => a*x = c - b*minY
  if (Math.abs(a) > eps) {
    const x1 = (c - b * minY) / a;
    if (x1 >= minX - eps && x1 <= maxX + eps) pts.push({ x: x1, y: minY });
    const x2 = (c - b * maxY) / a;
    if (x2 >= minX - eps && x2 <= maxX + eps) pts.push({ x: x2, y: maxY });
  }

  // Remove duplicate points
  const uniquePts: Point2D[] = [];
  for (const pt of pts) {
    if (!uniquePts.some(p => Math.hypot(p.x - pt.x, p.y - pt.y) < 1e-4)) {
      uniquePts.push(pt);
    }
  }

  if (uniquePts.length >= 2) {
    let maxDist = -1;
    let bestPair: [Point2D, Point2D] = [uniquePts[0], uniquePts[1]];
    for (let i = 0; i < uniquePts.length; i++) {
      for (let j = i + 1; j < uniquePts.length; j++) {
        const d = Math.hypot(uniquePts[i].x - uniquePts[j].x, uniquePts[i].y - uniquePts[j].y);
        if (d > maxDist) {
          maxDist = d;
          bestPair = [uniquePts[i], uniquePts[j]];
        }
      }
    }
    return bestPair;
  }
  return null;
}

/**
 * Sutherland-Hodgman polygon clipping against half-plane defined by ax + by <= c (or >= c)
 */
export function getHalfPlanePolygon(
  ineq: Inequality,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  invert = false
): Point2D[] {
  const { minX, maxX, minY, maxY } = bounds;
  // Bounding box polygon (counter-clockwise)
  let polygon: Point2D[] = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY }
  ];

  // Clip against the half-plane
  // Condition for (x, y) to be inside the half-plane
  const isInside = (pt: Point2D): boolean => {
    const val = ineq.a * pt.x + ineq.b * pt.y;
    let satisfies = false;
    switch (ineq.op) {
      case '<=':
      case '<':
        satisfies = val <= ineq.c + 1e-6;
        break;
      case '>=':
      case '>':
        satisfies = val >= ineq.c - 1e-6;
        break;
    }
    return invert ? !satisfies : satisfies;
  };

  // Line equation: a*x + b*y - c = 0
  const lineDist = (pt: Point2D) => ineq.a * pt.x + ineq.b * pt.y - ineq.c;

  const output: Point2D[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const prev = polygon[(i + polygon.length - 1) % polygon.length];

    const currentIn = isInside(current);
    const prevIn = isInside(prev);

    if (currentIn) {
      if (!prevIn) {
        // compute intersection
        const d1 = lineDist(prev);
        const d2 = lineDist(current);
        const t = d1 / (d1 - d2);
        output.push({
          x: prev.x + t * (current.x - prev.x),
          y: prev.y + t * (current.y - prev.y)
        });
      }
      output.push(current);
    } else if (prevIn) {
      const d1 = lineDist(prev);
      const d2 = lineDist(current);
      const t = d1 / (d1 - d2);
      output.push({
        x: prev.x + t * (current.x - prev.x),
        y: prev.y + t * (current.y - prev.y)
      });
    }
  }

  return output;
}
