import { ComparisonOperator, Point2D, SystemInequality, IntersectionPoint, FeasibleRegionType, SystemAnalysisResult } from '../types/math';
import { formatBoundaryLine, formatInequality, formatLinearLHS, getOperatorSymbol } from './mathEngine';

/**
 * Standardize an inequality and validate coefficients
 */
export function validateSystemInequality(ineq: SystemInequality): { isValid: boolean; error?: string } {
  if (Math.abs(ineq.a) < 1e-9 && Math.abs(ineq.b) < 1e-9) {
    return { isValid: false, error: 'Hệ số a và b không được đồng thời bằng 0 theo định nghĩa SGK!' };
  }
  return { isValid: true };
}

/**
 * Check a point against a single inequality with strict inequality handling
 */
export function checkPointAgainstInequality(
  ineq: SystemInequality,
  pt: Point2D,
  eps = 1e-7
): {
  lhs: number;
  diff: number;
  satisfies: boolean;
  onBoundary: boolean;
  strictlyExcluded: boolean;
} {
  const lhs = ineq.a * pt.x + ineq.b * pt.y;
  const diff = lhs - ineq.c;
  const onBoundary = Math.abs(diff) <= eps;

  let satisfies = false;
  let strictlyExcluded = false;

  switch (ineq.op) {
    case '<=':
      satisfies = diff <= eps;
      break;
    case '<':
      satisfies = diff < -eps;
      if (onBoundary) strictlyExcluded = true;
      break;
    case '>=':
      satisfies = diff >= -eps;
      break;
    case '>':
      satisfies = diff > eps;
      if (onBoundary) strictlyExcluded = true;
      break;
  }

  return { lhs, diff, satisfies, onBoundary, strictlyExcluded };
}

/**
 * Check a point against all inequalities in the system
 */
export function checkPointAgainstSystem(
  system: SystemInequality[],
  pt: Point2D
): {
  satisfiesSystem: boolean;
  perConstraint: { ineqId: string; label: string; lhs: number; satisfies: boolean; strictlyExcluded: boolean }[];
  failedIndices: number[];
} {
  const perConstraint = system.map(ineq => {
    const res = checkPointAgainstInequality(ineq, pt);
    return {
      ineqId: ineq.id,
      label: ineq.label,
      lhs: Math.round(res.lhs * 10000) / 10000,
      satisfies: res.satisfies,
      strictlyExcluded: res.strictlyExcluded
    };
  });

  const failedIndices: number[] = [];
  perConstraint.forEach((res, idx) => {
    if (!res.satisfies) failedIndices.push(idx);
  });

  return {
    satisfiesSystem: failedIndices.length === 0,
    perConstraint,
    failedIndices
  };
}

/**
 * Greatest common divisor for integer reduction
 */
function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/**
 * Convert a floating-point number to an exact reduced fraction num/den if possible
 */
export function toRational(val: number, maxDenom = 120): { num: number; den: number } | null {
  if (!isFinite(val)) return null;
  const r = Math.round(val);
  if (Math.abs(val - r) < 1e-7) {
    return { num: r, den: 1 };
  }
  for (let d = 2; d <= maxDenom; d++) {
    const num = Math.round(val * d);
    if (Math.abs(val - num / d) < 1e-6) {
      const g = gcd(num, d);
      return { num: num / g, den: d / g };
    }
  }
  return null;
}

/**
 * Parse string coordinate input: supports integers, decimals, and fractions (e.g. "2", "-1.5", "5/2", "-7/4", "560/3")
 */
export function parseCoordinateInput(str: string): number | null {
  if (!str) return null;
  const s = str.trim().replace(',', '.');
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const denom = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(denom) && Math.abs(denom) > 1e-9) {
        return num / denom;
      }
    }
    return null;
  }
  const val = parseFloat(s);
  return isNaN(val) ? null : val;
}

/**
 * Format a coordinate or objective value compactly:
 * - Integer -> "4", "0", "120"
 * - Exact fraction with non-terminating decimal (like 8/3, 560/3) or small denominator -> "8/3", "560/3"
 * - Clean terminating decimal (like 1.5, 3.6) -> "3.6" or "18/5"
 */
export function formatCoord(val: number, preferFraction = true): string {
  const r = Math.round(val);
  if (Math.abs(val - r) < 1e-6) return `${r}`;

  const rat = toRational(val, 60);
  if (rat && rat.den > 1) {
    // Always display exact fraction when denominator has prime factors other than 2, 5 (e.g. /3, /6, /7, /9, /12)
    // or when preferFraction is true and denominator <= 12
    const isRepeating = 100 % rat.den !== 0;
    if (isRepeating || (preferFraction && rat.den <= 12)) {
      return `${rat.num}/${rat.den}`;
    }
  }

  return `${Math.round(val * 100) / 100}`;
}

/**
 * Format coordinate as integer, simplified fraction with decimal approximation, or 2-decimal number
 */
export function formatFractionOrDecimal(val: number): string {
  const r = Math.round(val);
  if (Math.abs(val - r) < 1e-6) return `${r}`;

  const rat = toRational(val, 60);
  if (rat && rat.den > 1 && rat.den <= 24) {
    const approx = Math.round(val * 100) / 100;
    const isRepeating = 100 % rat.den !== 0;
    return isRepeating ? `${rat.num}/${rat.den} (≈ ${approx})` : `${rat.num}/${rat.den} (${approx})`;
  }
  return `${Math.round(val * 100) / 100}`;
}

/**
 * Format objective value with exact fraction and 4-decimal approximation if fractional (e.g., "560/3 ≈ 186,6667")
 */
export function formatValueWithApprox(val: number): string {
  const r = Math.round(val);
  if (Math.abs(val - r) < 1e-6) return `${r}`;

  const rat = toRational(val, 60);
  if (rat && rat.den > 1 && rat.den <= 24) {
    const isRepeating = 100 % rat.den !== 0;
    if (isRepeating) {
      const approx4 = (Math.round(val * 10000) / 10000).toString().replace('.', ',');
      return `${rat.num}/${rat.den} ≈ ${approx4}`;
    }
    const approx2 = (Math.round(val * 100) / 100).toString().replace('.', ',');
    return `${rat.num}/${rat.den} (${approx2})`;
  }
  return `${(Math.round(val * 10000) / 10000).toString().replace('.', ',')}`;
}

/**
 * Format 2D point as "(x; y)" using exact rational representation (e.g. "(8/3; 8/3)", "(4; 0)")
 */
export function formatPointCoord(pt: Point2D): string {
  return `(${formatCoord(pt.x)}; ${formatCoord(pt.y)})`;
}

/**
 * Intersection of two lines:
 * a1*x + b1*y = c1
 * a2*x + b2*y = c2
 * CRITICAL: Never round coordinates to 3 decimal places before constraint verification!
 * Keep full IEEE-754 double precision (only snapping to exact integers within 1e-9).
 */
export function findLineIntersection(
  l1: { a: number; b: number; c: number },
  l2: { a: number; b: number; c: number }
): {
  type: 'single' | 'parallel' | 'identical';
  point?: Point2D;
  D?: number;
  Dx?: number;
  Dy?: number;
} {
  const D = l1.a * l2.b - l2.a * l1.b;
  const Dx = l1.c * l2.b - l2.c * l1.b;
  const Dy = l1.a * l2.c - l2.a * l1.c;

  const eps = 1e-9;
  if (Math.abs(D) < eps) {
    if (Math.abs(Dx) < eps && Math.abs(Dy) < eps) {
      return { type: 'identical', D: 0, Dx: 0, Dy: 0 };
    }
    return { type: 'parallel', D: 0, Dx, Dy };
  }

  const rawX = Dx / D;
  const rawY = Dy / D;

  // Snap ONLY if within 1e-9 of an exact integer; preserve exact rational float otherwise
  const snapExactInteger = (val: number) => {
    const r = Math.round(val);
    return Math.abs(val - r) < 1e-9 ? r : val;
  };

  return {
    type: 'single',
    point: { x: snapExactInteger(rawX), y: snapExactInteger(rawY) },
    D: snapExactInteger(D),
    Dx: snapExactInteger(Dx),
    Dy: snapExactInteger(Dy)
  };
}

/**
 * Find all pairwise line intersections in the system and test their feasibility
 */
export function computeSystemIntersections(system: SystemInequality[]): IntersectionPoint[] {
  const intersections: IntersectionPoint[] = [];
  const n = system.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const ineq1 = system[i];
      const ineq2 = system[j];

      const res = findLineIntersection(ineq1, ineq2);
      if (res.type === 'single' && res.point) {
        const pt = res.point;

        // Check if pt satisfies all constraints in system
        const violated: number[] = [];
        let hasStrictBoundaryExclusion = false;
        let hasExteriorViolation = false;

        for (let k = 0; k < n; k++) {
          if (k === i || k === j) {
            // Algebraically pt lies directly on boundary k
            if (system[k].op === '<' || system[k].op === '>') {
              violated.push(k);
              hasStrictBoundaryExclusion = true;
            }
          } else {
            const check = checkPointAgainstInequality(system[k], pt, 1e-7);
            if (!check.satisfies) {
              violated.push(k);
              if (check.strictlyExcluded) {
                hasStrictBoundaryExclusion = true;
              } else {
                hasExteriorViolation = true;
              }
            }
          }
        }

        const isFeasible = violated.length === 0;
        // A point is strictly excluded ONLY if it belongs to the closure of the feasible region
        // (no exterior violations) and is excluded solely due to lying on a strict (< or >) boundary line
        const isStrictlyExcluded = !hasExteriorViolation && hasStrictBoundaryExclusion;

        const label1 = ineq1.label ? ineq1.label.split(':')[0].trim() : `(d${i + 1})`;
        const label2 = ineq2.label ? ineq2.label.split(':')[0].trim() : `(d${j + 1})`;

        const eq1Str = `${label1}: ${formatBoundaryLine(ineq1.a, ineq1.b, ineq1.c)}`;
        const eq2Str = `${label2}: ${formatBoundaryLine(ineq2.a, ineq2.b, ineq2.c)}`;

        const D = res.D ?? 1;
        const Dx = res.Dx ?? 0;
        const Dy = res.Dy ?? 0;

        const explanation =
          `Giải hệ phương trình đường biên:\n` +
          `  { ${formatBoundaryLine(ineq1.a, ineq1.b, ineq1.c)}\n` +
          `  { ${formatBoundaryLine(ineq2.a, ineq2.b, ineq2.c)}\n` +
          `• Định thức D = (${ineq1.a})×(${ineq2.b}) - (${ineq2.a})×(${ineq1.b}) = ${formatCoord(D)}\n` +
          `• Định thức Dx = (${ineq1.c})×(${ineq2.b}) - (${ineq2.c})×(${ineq1.b}) = ${formatCoord(Dx)}\n` +
          `• Định thức Dy = (${ineq1.a})×(${ineq2.c}) - (${ineq2.a})×(${ineq1.c}) = ${formatCoord(Dy)}\n` +
          `⇒ Nghiệm: x = Dx/D = ${formatFractionOrDecimal(pt.x)}; y = Dy/D = ${formatFractionOrDecimal(pt.y)}.`;

        intersections.push({
          id: `inter-${i}-${j}`,
          point: pt,
          lineIndices: [i, j],
          lineLabels: [label1, label2],
          lineEquations: [eq1Str, eq2Str],
          cramerSteps: {
            D,
            Dx,
            Dy,
            explanation
          },
          isFeasible,
          isStrictlyExcluded,
          violatedConstraints: violated
        });
      }
    }
  }

  return intersections;
}

/**
 * Sutherland-Hodgman Polygon Clipping algorithm against half-plane
 */
export function clipPolygonAgainstHalfPlane(polygon: Point2D[], ineq: SystemInequality): Point2D[] {
  if (polygon.length === 0) return [];

  const isInside = (pt: Point2D): boolean => {
    const val = ineq.a * pt.x + ineq.b * pt.y;
    switch (ineq.op) {
      case '<=':
      case '<':
        return val <= ineq.c + 1e-7;
      case '>=':
      case '>':
        return val >= ineq.c - 1e-7;
    }
  };

  const lineDist = (pt: Point2D) => ineq.a * pt.x + ineq.b * pt.y - ineq.c;

  const output: Point2D[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const prev = polygon[(i + polygon.length - 1) % polygon.length];

    const currentIn = isInside(current);
    const prevIn = isInside(prev);

    if (currentIn) {
      if (!prevIn) {
        const d1 = lineDist(prev);
        const d2 = lineDist(current);
        const denom = d1 - d2;
        const t = Math.abs(denom) > 1e-12 ? d1 / denom : 0;
        output.push({
          x: prev.x + t * (current.x - prev.x),
          y: prev.y + t * (current.y - prev.y)
        });
      }
      output.push(current);
    } else if (prevIn) {
      const d1 = lineDist(prev);
      const d2 = lineDist(current);
      const denom = d1 - d2;
      const t = Math.abs(denom) > 1e-12 ? d1 / denom : 0;
      output.push({
        x: prev.x + t * (current.x - prev.x),
        y: prev.y + t * (current.y - prev.y)
      });
    }
  }

  // Remove duplicates
  const cleaned: Point2D[] = [];
  for (const pt of output) {
    if (!cleaned.some(p => Math.hypot(p.x - pt.x, p.y - pt.y) < 1e-6)) {
      cleaned.push(pt);
    }
  }
  return cleaned;
}

/**
 * Clip a rectangular box [minX, maxX] x [minY, maxY] against all active half-planes in system
 */
export function clipBoxWithSystem(
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  system: SystemInequality[]
): Point2D[] {
  let poly: Point2D[] = [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.maxY },
    { x: bounds.minX, y: bounds.maxY }
  ];

  for (const ineq of system) {
    poly = clipPolygonAgainstHalfPlane(poly, ineq);
    if (poly.length === 0) break;
  }

  return poly;
}

/**
 * Computes polygon area using Shoelace formula
 */
export function computePolygonArea(pts: Point2D[]): number {
  if (pts.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Sorts points counter-clockwise around their centroid, rotating so that O(0;0)
 * (if present) or the bottom-leftmost vertex is placed at index 0.
 */
export function sortPointsCounterClockwise(points: Point2D[]): Point2D[] {
  if (points.length <= 2) return [...points];

  // Compute centroid
  let cx = 0;
  let cy = 0;
  for (const p of points) {
    cx += p.x;
    cy += p.y;
  }
  cx /= points.length;
  cy /= points.length;

  const sorted = [...points].sort((a, b) => {
    const angleA = Math.atan2(a.y - cy, a.x - cx);
    const angleB = Math.atan2(b.y - cy, b.x - cx);
    return angleA - angleB;
  });

  // Rotate so O(0,0) is first if present; otherwise bottom-leftmost vertex is first
  let startIdx = sorted.findIndex(p => Math.hypot(p.x, p.y) < 1e-6);
  if (startIdx === -1) {
    startIdx = 0;
    for (let i = 1; i < sorted.length; i++) {
      if (
        sorted[i].y < sorted[startIdx].y - 1e-6 ||
        (Math.abs(sorted[i].y - sorted[startIdx].y) <= 1e-6 && sorted[i].x < sorted[startIdx].x)
      ) {
        startIdx = i;
      }
    }
  }

  if (startIdx > 0) {
    return [...sorted.slice(startIdx), ...sorted.slice(0, startIdx)];
  }
  return sorted;
}

/**
 * Unified SGK vertex labeling:
 * - Origin (0; 0) is always labeled 'O'
 * - Non-origin vertices are labeled sequentially 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'
 */
export function assignPolygonVertexLabels(
  orderedVertices: Point2D[]
): { point: Point2D; label: string }[] {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  let letterIdx = 0;
  return orderedVertices.map(point => {
    if (Math.hypot(point.x, point.y) < 1e-6) {
      return { point, label: 'O' };
    }
    const label = letters[letterIdx % letters.length];
    letterIdx++;
    return { point, label };
  });
}

/**
 * Check if system is empty, bounded, unbounded, or degenerate.
 * Uses analytical half-plane intersection with a large mathematical bounding box R = 2000
 * independent of the screen viewport.
 */
export function analyzeSystemFeasibleRegion(system: SystemInequality[]): SystemAnalysisResult {
  const intersections = computeSystemIntersections(system);

  // Filter feasible vertices (unique) and closure vertices (feasible or strictly excluded on boundary)
  const rawFeasibleVerts: Point2D[] = [];
  const closureVerts: Point2D[] = [];

  for (const inter of intersections) {
    if (inter.isFeasible) {
      if (!rawFeasibleVerts.some(v => Math.hypot(v.x - inter.point.x, v.y - inter.point.y) < 1e-6)) {
        rawFeasibleVerts.push(inter.point);
      }
    }
    if (inter.isFeasible || inter.isStrictlyExcluded) {
      if (!closureVerts.some(v => Math.hypot(v.x - inter.point.x, v.y - inter.point.y) < 1e-6)) {
        closureVerts.push(inter.point);
      }
    }
  }

  // Test feasibility and boundedness on a large analytical domain R = 2000
  const R = 2000;
  const largePoly = clipBoxWithSystem({ minX: -R, maxX: R, minY: -R, maxY: R }, system);
  const areaInLargeBox = computePolygonArea(largePoly);

  // Check if any vertices of largePoly lie on the artificial boundary [-R, R]
  const eps = 1e-2;
  const touchesArtificialBoundary = largePoly.some(
    p => Math.abs(p.x - R) < eps || Math.abs(p.x + R) < eps || Math.abs(p.y - R) < eps || Math.abs(p.y + R) < eps
  );

  let regionType: FeasibleRegionType = 'empty';
  let description = '';
  let sgkSummary = '';
  let orderedPolygon: Point2D[] = [];

  const hasStrictBoundaries = system.some(ineq => ineq.op === '<' || ineq.op === '>');

  // Check for degenerate or empty cases:
  if (largePoly.length === 0 || areaInLargeBox < 1e-5) {
    if (rawFeasibleVerts.length >= 2) {
      regionType = 'degenerate_segment';
      orderedPolygon = sortPointsCounterClockwise(rawFeasibleVerts);
      const ptsText = orderedPolygon.map(p => formatPointCoord(p)).join(', ');
      description = `Miền nghiệm suy biến thành đoạn thẳng nối giữa các điểm: ${ptsText}.`;
      sgkSummary = `Hệ có miền nghiệm suy biến là đoạn thẳng nối giữa ${orderedPolygon.map(p => formatPointCoord(p)).join(' và ')}.`;
    } else if (rawFeasibleVerts.length === 1) {
      regionType = 'degenerate_point';
      orderedPolygon = rawFeasibleVerts;
      const ptText = formatPointCoord(rawFeasibleVerts[0]);
      description = `Miền nghiệm suy biến thành duy nhất một điểm: ${ptText}.`;
      sgkSummary = `Hệ có duy nhất một nghiệm là tọa độ điểm ${ptText}.`;
    } else if (largePoly.length >= 2 && touchesArtificialBoundary) {
      // Test midpoint of clipped line in largePoly against strict system
      const midPt = {
        x: (largePoly[0].x + largePoly[1].x) / 2,
        y: (largePoly[0].y + largePoly[1].y) / 2
      };
      if (checkPointAgainstSystem(system, midPt).satisfiesSystem) {
        regionType = 'degenerate_line';
        orderedPolygon = rawFeasibleVerts;
        description = 'Miền nghiệm suy biến thành một đường thẳng hoặc nửa đường thẳng (tia).';
        sgkSummary = 'Hệ có miền nghiệm suy biến thành đường thẳng/tia trên mặt phẳng tọa độ.';
      } else {
        regionType = 'empty';
        orderedPolygon = [];
        description = 'Miền nghiệm của hệ là tập rỗng (∅). Không tồn tại điểm nào trong mặt phẳng Oxy đồng thời thỏa mãn tất cả các bất phương trình trong hệ.';
        sgkSummary = 'Kết luận: Hệ bất phương trình vô nghiệm (Miền nghiệm rỗng ∅).';
      }
    } else {
      regionType = 'empty';
      orderedPolygon = [];
      description = 'Miền nghiệm của hệ là tập rỗng (∅). Không tồn tại điểm nào trong mặt phẳng Oxy đồng thời thỏa mãn tất cả các bất phương trình trong hệ.';
      sgkSummary = 'Kết luận: Hệ bất phương trình vô nghiệm (Miền nghiệm rỗng ∅).';
    }
  } else if (touchesArtificialBoundary) {
    // Unbounded region (không bị chặn)
    regionType = 'unbounded';
    const cornerSource = closureVerts.length > 0 ? closureVerts : rawFeasibleVerts;
    orderedPolygon = sortPointsCounterClockwise(cornerSource);
    const labeled = assignPolygonVertexLabels(orderedPolygon);
    const labeledText = labeled.map(item => `${item.label}${formatPointCoord(item.point)}`).join(', ');
    description = `Miền nghiệm là một miền đa giác mở không bị chặn (kéo dài vô tận về một phía của mặt phẳng tọa độ).`;
    sgkSummary = `Kết luận: Miền nghiệm của hệ là miền không bị chặn có các đỉnh biên: ${
      labeled.length > 0 ? labeledText : 'trải dài trên mặt phẳng'
    }.`;
  } else {
    // Bounded polygon (miền đa giác bị chặn)
    regionType = 'bounded_polygon';
    const cornerSource = closureVerts.length >= 3 ? closureVerts : rawFeasibleVerts;
    orderedPolygon = sortPointsCounterClockwise(cornerSource);
    const labeled = assignPolygonVertexLabels(orderedPolygon);
    const labeledVertices = labeled.map(item => `${item.label}${formatPointCoord(item.point)}`);

    const polyName =
      orderedPolygon.length === 3
        ? 'tam giác'
        : orderedPolygon.length === 4
        ? 'tứ giác'
        : orderedPolygon.length === 5
        ? 'ngũ giác'
        : `đa giác ${orderedPolygon.length} cạnh`;

    description = `Miền nghiệm của hệ là miền ${polyName} bị chặn gồm các đỉnh: ${labeledVertices.join(', ')}.`;
    sgkSummary = `Kết luận SGK: Miền nghiệm của hệ là miền ${polyName} ${labeled.map(i => i.label).join('')} gồm các đỉnh ${labeledVertices.join(', ')} ${
      hasStrictBoundaries ? '(không kể các đoạn bờ có dấu nghiêm ngặt)' : '(kể cả các cạnh của đa giác)'
    }.`;
  }

  // Assign consistent vertex labels to intersection points matching orderedPolygon
  const labeledPolyMap = assignPolygonVertexLabels(orderedPolygon);
  const labeledIntersections = intersections.map(inter => {
    if (inter.isFeasible || inter.isStrictlyExcluded) {
      const found = labeledPolyMap.find(
        item => Math.hypot(item.point.x - inter.point.x, item.point.y - inter.point.y) < 1e-6
      );
      if (found) {
        return { ...inter, vertexLabel: found.label };
      }
    }
    return inter;
  });

  return {
    inequalities: system,
    intersections: labeledIntersections,
    feasibleVertices: rawFeasibleVerts,
    orderedPolygon,
    regionType,
    description,
    sgkSummary,
    hasStrictBoundaries,
    area: areaInLargeBox < 1e6 ? Math.round(computePolygonArea(orderedPolygon) * 100) / 100 : undefined
  };
}

/**
 * Standard SGK Benchmark Presets for Module 3
 */
export const SYSTEM_BENCHMARK_PRESETS: {
  id: string;
  name: string;
  tag: string;
  description: string;
  system: SystemInequality[];
  expectedConclusion: string;
}[] = [
  {
    id: 'preset-1',
    name: 'Bài 1: Tứ giác SGK Chuẩn',
    tag: 'Đa giác bị chặn (Tứ giác)',
    description: 'Hệ 4 ràng buộc chuẩn SGK: x ≥ 0, y ≥ 0, x + y ≤ 6, 2x + y ≤ 8.',
    system: [
      { id: 'p1-1', a: 1, b: 0, op: '>=', c: 0, color: '#2563EB', label: '(d1)', showLine: true, showFill: true },
      { id: 'p1-2', a: 0, b: 1, op: '>=', c: 0, color: '#059669', label: '(d2)', showLine: true, showFill: true },
      { id: 'p1-3', a: 1, b: 1, op: '<=', c: 6, color: '#D97706', label: '(d3)', showLine: true, showFill: true },
      { id: 'p1-4', a: 2, b: 1, op: '<=', c: 8, color: '#7C3AED', label: '(d4)', showLine: true, showFill: true }
    ],
    expectedConclusion: 'Miền nghiệm là miền tứ giác có 4 đỉnh: O(0;0), A(4;0), B(2;4), C(0;6).'
  },
  {
    id: 'preset-2',
    name: 'Bài 2: Miền Nghiệm Rỗng',
    tag: 'Hệ vô nghiệm (∅)',
    description: 'Hai đường thẳng song song có hướng nửa mặt phẳng ngược nhau: x ≥ 2 và x ≤ 1.',
    system: [
      { id: 'p2-1', a: 1, b: 0, op: '>=', c: 2, color: '#2563EB', label: '(d1)', showLine: true, showFill: true },
      { id: 'p2-2', a: 1, b: 0, op: '<=', c: 1, color: '#DC2626', label: '(d2)', showLine: true, showFill: true }
    ],
    expectedConclusion: 'Miền nghiệm của hệ là tập rỗng (∅) do hai nửa mặt phẳng không có điểm chung.'
  },
  {
    id: 'preset-3',
    name: 'Bài 3: Miền Không Bị Chặn',
    tag: 'Góc phần tư I mở',
    description: 'Hai ràng buộc không âm x ≥ 0 và y ≥ 0 xác định toàn bộ góc phần tư I không bị chặn.',
    system: [
      { id: 'p3-1', a: 1, b: 0, op: '>=', c: 0, color: '#2563EB', label: '(d1)', showLine: true, showFill: true },
      { id: 'p3-2', a: 0, b: 1, op: '>=', c: 0, color: '#059669', label: '(d2)', showLine: true, showFill: true }
    ],
    expectedConclusion: 'Miền nghiệm là góc phần tư thứ nhất của hệ tọa độ, là một miền không bị chặn.'
  },
  {
    id: 'preset-4',
    name: 'Bài 4: Biên Mở và Nét Đứt',
    tag: 'Phân biệt biên mở / đóng',
    description: 'Kiểm tra đường biên nét đứt với dấu nghiêm ngặt: x + y < 4, x ≥ 0, y ≥ 0.',
    system: [
      { id: 'p4-1', a: 1, b: 1, op: '<', c: 4, color: '#DC2626', label: '(d1)', showLine: true, showFill: true },
      { id: 'p4-2', a: 1, b: 0, op: '>=', c: 0, color: '#2563EB', label: '(d2)', showLine: true, showFill: true },
      { id: 'p4-3', a: 0, b: 1, op: '>=', c: 0, color: '#059669', label: '(d3)', showLine: true, showFill: true }
    ],
    expectedConclusion: 'Miền nghiệm là miền tam giác OAB không kể cạnh huyền AB (nét đứt) do mang dấu nghiêm ngặt "<".'
  },
  {
    id: 'preset-5',
    name: 'Bài 5: Miền Suy Biến (Đoạn Thẳng)',
    tag: 'Suy biến thành đoạn thẳng',
    description: 'Hệ ràng buộc ép x = 0: x ≥ 0, x ≤ 0, y ≥ 0, y ≤ 2.',
    system: [
      { id: 'p5-1', a: 1, b: 0, op: '>=', c: 0, color: '#2563EB', label: '(d1)', showLine: true, showFill: true },
      { id: 'p5-2', a: 1, b: 0, op: '<=', c: 0, color: '#7C3AED', label: '(d2)', showLine: true, showFill: true },
      { id: 'p5-3', a: 0, b: 1, op: '>=', c: 0, color: '#059669', label: '(d3)', showLine: true, showFill: true },
      { id: 'p5-4', a: 0, b: 1, op: '<=', c: 2, color: '#D97706', label: '(d4)', showLine: true, showFill: true }
    ],
    expectedConclusion: 'Miền nghiệm suy biến thành đoạn thẳng trên trục tung từ (0;0) đến (0;2).'
  }
];
