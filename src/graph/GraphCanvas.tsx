import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Inequality, Point2D, ShadingMode } from '../types/math';
import { getHalfPlanePolygon, getLineSegmentInBox, formatBoundaryLine, checkPointInequality } from '../math/mathEngine';
import { ZoomIn, ZoomOut, RotateCcw, MousePointer, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface GraphCanvasProps {
  inequality: Inequality;
  pointM?: Point2D;
  onPointChange?: (point: Point2D) => void;
  shadingMode?: ShadingMode;
  showGrid?: boolean;
  snapToGrid?: boolean;
  className?: string;

  // 7-Step Wizard Extensions:
  showBoundaryLine?: boolean;
  boundaryStyleOverride?: 'solid' | 'dashed';
  showShading?: boolean;

  showPointM?: boolean;
  pointA?: Point2D;
  pointB?: Point2D;
  showPointsAB?: boolean;
  showPointsABStatic?: boolean;
  activePointTarget?: 'A' | 'B' | 'M' | null;
  onPointAChange?: (point: Point2D) => void;
  onPointBChange?: (point: Point2D) => void;

  enableHalfPlaneClick?: boolean;
  selectedHalfPlaneSide?: 'with_test' | 'without_test' | null;
  onSelectHalfPlane?: (side: 'with_test' | 'without_test', coord: Point2D) => void;
  isSideVerifiedCorrect?: boolean | null;

  isPresentationMode?: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  inequality,
  pointM = { x: 1, y: 2 },
  onPointChange,
  shadingMode = 'solution',
  showGrid = true,
  snapToGrid = false,
  className = '',

  showBoundaryLine = true,
  boundaryStyleOverride,
  showShading = true,

  showPointM = true,
  pointA,
  pointB,
  showPointsAB = false,
  showPointsABStatic = false,
  activePointTarget = null,
  onPointAChange,
  onPointBChange,

  enableHalfPlaneClick = false,
  selectedHalfPlaneSide = null,
  onSelectHalfPlane,
  isSideVerifiedCorrect = null,

  isPresentationMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // View bounds in math coordinates
  const [viewCenter, setViewCenter] = useState<Point2D>({ x: 1, y: 1.5 });
  const [scale, setScale] = useState<number>(36); // pixels per unit
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 480
  });

  const [isDraggingM, setIsDraggingM] = useState(false);
  const [isDraggingA, setIsDraggingA] = useState(false);
  const [isDraggingB, setIsDraggingB] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panCenterStart, setPanCenterStart] = useState<Point2D>({ x: 0, y: 0 });
  const [hoverCoord, setHoverCoord] = useState<Point2D | null>(null);

  const pointerMovedRef = useRef<number>(0);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const isMobile = window.innerWidth < 640;
        const targetHeight = isPresentationMode
          ? Math.max(460, Math.min(rect.width * 0.75, 620))
          : isMobile
          ? Math.max(280, Math.min(rect.width * 0.72, 340))
          : Math.max(380, Math.min(rect.width * 0.65, 520));

        setDimensions({
          width: rect.width,
          height: targetHeight
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isPresentationMode]);

  // Coordinate transforms
  const mathToSvg = useCallback(
    (pt: Point2D): { x: number; y: number } => {
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;
      return {
        x: cx + (pt.x - viewCenter.x) * scale,
        y: cy - (pt.y - viewCenter.y) * scale
      };
    },
    [dimensions, viewCenter, scale]
  );

  const svgToMath = useCallback(
    (svgX: number, svgY: number): Point2D => {
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;
      const rawX = (svgX - cx) / scale + viewCenter.x;
      const rawY = (cy - svgY) / scale + viewCenter.y;

      if (snapToGrid) {
        return {
          x: Math.round(rawX * 2) / 2,
          y: Math.round(rawY * 2) / 2
        };
      }
      return {
        x: Math.round(rawX * 10) / 10,
        y: Math.round(rawY * 10) / 10
      };
    },
    [dimensions, viewCenter, scale, snapToGrid]
  );

  // Math bounds visible
  const minX = viewCenter.x - dimensions.width / (2 * scale);
  const maxX = viewCenter.x + dimensions.width / (2 * scale);
  const minY = viewCenter.y - dimensions.height / (2 * scale);
  const maxY = viewCenter.y + dimensions.height / (2 * scale);
  const mathBounds = { minX, maxX, minY, maxY };

  // Boundary line segment
  const lineSegment = getLineSegmentInBox(inequality.a, inequality.b, inequality.c, mathBounds);

  // Polygon for official solution half-plane
  const halfPlanePts = getHalfPlanePolygon(inequality, mathBounds, shadingMode === 'exclusion');
  const polygonPointsAttr = halfPlanePts
    .map(p => {
      const s = mathToSvg(p);
      return `${s.x},${s.y}`;
    })
    .join(' ');

  // Preview Polygon for user selected half-plane in Step 6
  const previewPolyPts = useMemo(() => {
    if (!selectedHalfPlaneSide) return [];
    const testRef = pointM || { x: 0, y: 0 };
    const testDiff = inequality.a * testRef.x + inequality.b * testRef.y - inequality.c;
    const testSideIsLeq = testDiff <= 0;
    const wantLeq = selectedHalfPlaneSide === 'with_test' ? testSideIsLeq : !testSideIsLeq;
    return getHalfPlanePolygon({ ...inequality, op: wantLeq ? '<=' : '>=' }, mathBounds, false);
  }, [selectedHalfPlaneSide, inequality, mathBounds, pointM]);

  const previewPolygonAttr = previewPolyPts
    .map(p => {
      const s = mathToSvg(p);
      return `${s.x},${s.y}`;
    })
    .join(' ');

  // Status of point M
  const mStatus = checkPointInequality(inequality, pointM);
  const mSvg = mathToSvg(pointM);

  // Status of points A and B
  const aSvg = pointA ? mathToSvg(pointA) : null;
  const bSvg = pointB ? mathToSvg(pointB) : null;

  // Mouse / Touch handlers for dragging M, A, B or panning
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    pointerMovedRef.current = 0;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check Point A (generous 32px hit radius for mobile touch)
    if (showPointsAB && aSvg && Math.hypot(mouseX - aSvg.x, mouseY - aSvg.y) <= 32) {
      setIsDraggingA(true);
      try {
        svg.setPointerCapture(e.pointerId);
      } catch {}
      return;
    }

    // Check Point B (generous 32px hit radius for mobile touch)
    if (showPointsAB && bSvg && Math.hypot(mouseX - bSvg.x, mouseY - bSvg.y) <= 32) {
      setIsDraggingB(true);
      try {
        svg.setPointerCapture(e.pointerId);
      } catch {}
      return;
    }

    // Check Point M (generous 32px hit radius for mobile touch)
    const distToM = Math.hypot(mouseX - mSvg.x, mouseY - mSvg.y);
    if (showPointM && distToM <= 32) {
      setIsDraggingM(true);
      try {
        svg.setPointerCapture(e.pointerId);
      } catch {}
      return;
    }

    // Start canvas pan
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    setPanCenterStart({ ...viewCenter });
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const currentMath = svgToMath(mouseX, mouseY);
    setHoverCoord(currentMath);

    if (isDraggingA) {
      pointerMovedRef.current += 1;
      onPointAChange?.(currentMath);
    } else if (isDraggingB) {
      pointerMovedRef.current += 1;
      onPointBChange?.(currentMath);
    } else if (isDraggingM) {
      pointerMovedRef.current += 1;
      onPointChange?.(currentMath);
    } else if (isPanning) {
      const dx = (e.clientX - panStart.x) / scale;
      const dy = (e.clientY - panStart.y) / scale;
      pointerMovedRef.current += Math.hypot(e.clientX - panStart.x, e.clientY - panStart.y);
      setViewCenter({
        x: panCenterStart.x - dx,
        y: panCenterStart.y + dy
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (isDraggingM) setIsDraggingM(false);
    if (isDraggingA) setIsDraggingA(false);
    if (isDraggingB) setIsDraggingB(false);
    if (isPanning) setIsPanning(false);

    try {
      if (svg && svg.hasPointerCapture(e.pointerId)) {
        svg.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  // Zoom controls
  const handleZoomIn = () => setScale(s => Math.min(80, s * 1.25));
  const handleZoomOut = () => setScale(s => Math.max(16, s / 1.25));
  const handleResetView = () => {
    setViewCenter({ x: 1, y: 1.5 });
    setScale(36);
  };

  // Click handler
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (pointerMovedRef.current > 5) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const targetMath = svgToMath(mouseX, mouseY);

    // Step 6: Half-plane selection mode
    if (enableHalfPlaneClick) {
      const clickVal = inequality.a * targetMath.x + inequality.b * targetMath.y - inequality.c;
      const testRef = pointM || { x: 0, y: 0 };
      const testVal = inequality.a * testRef.x + inequality.b * testRef.y - inequality.c;

      // Check which side: does click have same sign as test point?
      const isWithTest = Math.sign(clickVal) === Math.sign(testVal) || Math.abs(clickVal) < 1e-5;
      const side = isWithTest ? 'with_test' : 'without_test';
      onSelectHalfPlane?.(side, targetMath);
      return;
    }

    // Direct click placement for Point A or B in Step 3
    if (showPointsAB) {
      if (activePointTarget === 'A' && onPointAChange) {
        onPointAChange(targetMath);
        return;
      }
      if (activePointTarget === 'B' && onPointBChange) {
        onPointBChange(targetMath);
        return;
      }
    }

    // Default mode: Move test point M
    if (onPointChange) {
      onPointChange(targetMath);
    }
  };

  // Grid steps
  const gridStep = scale > 45 ? 1 : scale > 25 ? 1 : 2;
  const startGridX = Math.floor(minX / gridStep) * gridStep;
  const endGridX = Math.ceil(maxX / gridStep) * gridStep;
  const startGridY = Math.floor(minY / gridStep) * gridStep;
  const endGridY = Math.ceil(maxY / gridStep) * gridStep;

  const gridLinesX: number[] = [];
  for (let x = startGridX; x <= endGridX; x += gridStep) gridLinesX.push(x);

  const gridLinesY: number[] = [];
  for (let y = startGridY; y <= endGridY; y += gridStep) gridLinesY.push(y);

  // Origin in SVG
  const originSvg = mathToSvg({ x: 0, y: 0 });

  // Axis intercepts for reference
  const xIntercept = inequality.a !== 0 ? inequality.c / inequality.a : null;
  const yIntercept = inequality.b !== 0 ? inequality.c / inequality.b : null;

  const effectiveLineStyle =
    boundaryStyleOverride || (inequality.op === '<=' || inequality.op === '>=' ? 'solid' : 'dashed');

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm flex flex-col ${className}`}
    >
      {/* Top Bar with Status and Quick Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/80 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            Hệ trục Oxy
          </span>
          <span className="text-slate-400">|</span>
          <span className="font-mono text-slate-500">
            {enableHalfPlaneClick ? (
              <span className="text-amber-600 font-semibold animate-pulse">
                Chạm vào nửa mặt phẳng để chọn miền nghiệm
              </span>
            ) : showShading ? (
              shadingMode === 'solution' ? (
                <span className="text-blue-600 font-semibold">Tô sáng: Miền nghiệm</span>
              ) : (
                <span className="text-slate-600 font-semibold">Gạch chéo: Miền loại bỏ (SGK)</span>
              )
            ) : (
              <span className="text-purple-600 font-semibold">Chưa tô màu (Quy trình 7 bước)</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {hoverCoord && (
            <span className="font-mono text-[11px] text-slate-500 px-2 py-0.5 rounded bg-white border border-slate-200 mr-1 hidden sm:inline-block">
              x: {hoverCoord.x}, y: {hoverCoord.y}
            </span>
          )}
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 transition"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 transition"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 transition"
            title="Đặt lại khung nhìn"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Coordinate Graph Area */}
      <div className="relative w-full flex-1 touch-none cursor-crosshair">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full block select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleCanvasClick}
        >
          <defs>
            {/* Exclusion pattern */}
            <pattern
              id="hatch-pattern"
              width="12"
              height="12"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="12" stroke="#94A3B8" strokeWidth="1.8" strokeOpacity="0.45" />
            </pattern>

            {/* Solution grid pattern */}
            <pattern
              id="solution-hatch"
              width="14"
              height="14"
              patternTransform="rotate(-45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="14" stroke="#3B82F6" strokeWidth="1.2" strokeOpacity="0.25" />
            </pattern>

            {/* Step 6 user candidate preview pattern */}
            <pattern
              id="candidate-pattern"
              width="10"
              height="10"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="10" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.4" />
            </pattern>

            {/* Arrow marker for Ox, Oy */}
            <marker
              id="axis-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
            </marker>
          </defs>

          {/* Background */}
          <rect width={dimensions.width} height={dimensions.height} fill="#FFFFFF" />

          {/* Grid lines */}
          {showGrid && (
            <g className="grid-lines" stroke="#E2E8F0" strokeWidth="1">
              {gridLinesX.map(x => {
                const s = mathToSvg({ x, y: 0 });
                return (
                  <line
                    key={`gx-${x}`}
                    x1={s.x}
                    y1={0}
                    x2={s.x}
                    y2={dimensions.height}
                    stroke={x === 0 ? '#64748B' : '#E2E8F0'}
                    strokeWidth={x === 0 ? 1.5 : 1}
                  />
                );
              })}
              {gridLinesY.map(y => {
                const s = mathToSvg({ x: 0, y });
                return (
                  <line
                    key={`gy-${y}`}
                    x1={0}
                    y1={s.y}
                    x2={dimensions.width}
                    y2={s.y}
                    stroke={y === 0 ? '#64748B' : '#E2E8F0'}
                    strokeWidth={y === 0 ? 1.5 : 1}
                  />
                );
              })}
            </g>
          )}

          {/* Step 6: User Tapped Half-plane Preview */}
          {enableHalfPlaneClick && previewPolyPts.length > 2 && (
            <g className="candidate-half-plane">
              <polygon
                points={previewPolygonAttr}
                fill={isSideVerifiedCorrect === false ? '#EF4444' : '#F59E0B'}
                fillOpacity="0.18"
                stroke="none"
              />
              <polygon
                points={previewPolygonAttr}
                fill="url(#candidate-pattern)"
                stroke="none"
              />
            </g>
          )}

          {/* Official Shaded Half-plane (Shown when showShading is true) */}
          {showShading && halfPlanePts.length > 2 && (
            <g className="half-plane-shading">
              {shadingMode === 'solution' ? (
                <>
                  <polygon
                    points={polygonPointsAttr}
                    fill="#3B82F6"
                    fillOpacity="0.18"
                    stroke="none"
                  />
                  <polygon
                    points={polygonPointsAttr}
                    fill="url(#solution-hatch)"
                    stroke="none"
                  />
                </>
              ) : (
                /* SGK Mode: Gạch bỏ phần không thỏa mãn */
                <>
                  <polygon
                    points={polygonPointsAttr}
                    fill="#64748B"
                    fillOpacity="0.08"
                    stroke="none"
                  />
                  <polygon
                    points={polygonPointsAttr}
                    fill="url(#hatch-pattern)"
                    stroke="none"
                  />
                </>
              )}
            </g>
          )}

          {/* Ox and Oy Axes */}
          <g className="axes" stroke="#334155" strokeWidth="1.75">
            <line
              x1={0}
              y1={originSvg.y}
              x2={dimensions.width - 6}
              y2={originSvg.y}
              markerEnd="url(#axis-arrow)"
            />
            <line
              x1={originSvg.x}
              y1={dimensions.height}
              x2={originSvg.x}
              y2={8}
              markerEnd="url(#axis-arrow)"
            />
          </g>

          {/* Ticks and Labels */}
          <g className="ticks select-none font-mono text-[11px]" fill="#64748B">
            <text
              x={dimensions.width - 16}
              y={originSvg.y - 8}
              fill="#0F172A"
              fontWeight="bold"
              fontSize="13"
            >
              x
            </text>
            <text
              x={originSvg.x + 8}
              y={16}
              fill="#0F172A"
              fontWeight="bold"
              fontSize="13"
            >
              y
            </text>
            <text
              x={originSvg.x - 14}
              y={originSvg.y + 16}
              fill="#334155"
              fontWeight="bold"
              fontSize="12"
            >
              O
            </text>

            {gridLinesX.map(x => {
              if (x === 0) return null;
              const s = mathToSvg({ x, y: 0 });
              if (s.x < 20 || s.x > dimensions.width - 25) return null;
              return (
                <g key={`tx-${x}`}>
                  <line x1={s.x} y1={originSvg.y - 3} x2={s.x} y2={originSvg.y + 3} stroke="#475569" strokeWidth="1.2" />
                  <text x={s.x} y={originSvg.y + 16} textAnchor="middle">
                    {x}
                  </text>
                </g>
              );
            })}

            {gridLinesY.map(y => {
              if (y === 0) return null;
              const s = mathToSvg({ x: 0, y });
              if (s.y < 25 || s.y > dimensions.height - 20) return null;
              return (
                <g key={`ty-${y}`}>
                  <line x1={originSvg.x - 3} y1={s.y} x2={originSvg.x + 3} y2={s.y} stroke="#475569" strokeWidth="1.2" />
                  <text x={originSvg.x - 8} y={s.y + 4} textAnchor="end">
                    {y}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Boundary Line (d): ax + by = c */}
          {showBoundaryLine && lineSegment && (
            <g className="boundary-line">
              {(() => {
                const p1 = mathToSvg(lineSegment[0]);
                const p2 = mathToSvg(lineSegment[1]);
                const isSolid = effectiveLineStyle === 'solid';

                return (
                  <>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#2563EB"
                      strokeWidth="6"
                      strokeOpacity="0.15"
                    />
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#2563EB"
                      strokeWidth="2.8"
                      strokeDasharray={isSolid ? undefined : '7 5'}
                    />
                  </>
                );
              })()}
            </g>
          )}

          {/* Intercept Points if visible and not in custom points AB mode */}
          {!showPointsAB && showBoundaryLine && xIntercept !== null && (
            (() => {
              const ptSvg = mathToSvg({ x: xIntercept, y: 0 });
              if (ptSvg.x >= 0 && ptSvg.x <= dimensions.width && ptSvg.y >= 0 && ptSvg.y <= dimensions.height) {
                return (
                  <g className="intercept-x">
                    <circle cx={ptSvg.x} cy={ptSvg.y} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                    <text
                      x={ptSvg.x}
                      y={ptSvg.y - 8}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#1E40AF"
                      textAnchor="middle"
                      className="select-none font-mono"
                    >
                      ({Math.round(xIntercept * 10) / 10}; 0)
                    </text>
                  </g>
                );
              }
              return null;
            })()
          )}

          {!showPointsAB && showBoundaryLine && yIntercept !== null && (
            (() => {
              const ptSvg = mathToSvg({ x: 0, y: yIntercept });
              if (ptSvg.x >= 0 && ptSvg.x <= dimensions.width && ptSvg.y >= 0 && ptSvg.y <= dimensions.height) {
                return (
                  <g className="intercept-y">
                    <circle cx={ptSvg.x} cy={ptSvg.y} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                    <text
                      x={ptSvg.x + 8}
                      y={ptSvg.y + 3}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#1E40AF"
                      className="select-none font-mono"
                    >
                      (0; {Math.round(yIntercept * 10) / 10})
                    </text>
                  </g>
                );
              }
              return null;
            })()
          )}

          {/* Step 3: Interactive Points A and B on the boundary line */}
          {showPointsAB && aSvg && pointA && (
            <g
              className="point-a cursor-grab active:cursor-grabbing"
              transform={`translate(${aSvg.x}, ${aSvg.y})`}
            >
              <circle r="14" fill="#8B5CF6" fillOpacity="0.25" className="animate-pulse" />
              <circle r="7" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2.5" />
              <g transform="translate(10, -18)">
                <rect x="0" y="0" width="76" height="22" rx="5" fill="#5B21B6" fillOpacity="0.9" />
                <text x="38" y="15" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFFFFF" className="font-mono">
                  A({pointA.x}; {pointA.y})
                </text>
              </g>
            </g>
          )}

          {showPointsAB && bSvg && pointB && (
            <g
              className="point-b cursor-grab active:cursor-grabbing"
              transform={`translate(${bSvg.x}, ${bSvg.y})`}
            >
              <circle r="14" fill="#4F46E5" fillOpacity="0.25" className="animate-pulse" />
              <circle r="7" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2.5" />
              <g transform="translate(10, -18)">
                <rect x="0" y="0" width="76" height="22" rx="5" fill="#312E81" fillOpacity="0.9" />
                <text x="38" y="15" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFFFFF" className="font-mono">
                  B({pointB.x}; {pointB.y})
                </text>
              </g>
            </g>
          )}

          {/* Static A and B indicators when boundary line is drawn */}
          {showPointsABStatic && !showPointsAB && aSvg && bSvg && pointA && pointB && (
            <g className="points-ab-static select-none pointer-events-none">
              {/* Point A static */}
              <circle cx={aSvg.x} cy={aSvg.y} r="5" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2" />
              <text
                x={aSvg.x + 8}
                y={aSvg.y - 6}
                fontSize="10"
                fontWeight="bold"
                fill="#6D28D9"
                className="font-mono"
              >
                A({pointA.x}; {pointA.y})
              </text>

              {/* Point B static */}
              <circle cx={bSvg.x} cy={bSvg.y} r="5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <text
                x={bSvg.x + 8}
                y={bSvg.y - 6}
                fontSize="10"
                fontWeight="bold"
                fill="#3730A3"
                className="font-mono"
              >
                B({pointB.x}; {pointB.y})
              </text>
            </g>
          )}

          {/* Point M(x, y) - Test point */}
          {showPointM && (() => {
            const isMOnLine = Math.abs(inequality.a * pointM.x + inequality.b * pointM.y - inequality.c) < 1e-4;
            const markerColor = isMOnLine ? '#F59E0B' : mStatus.satisfies ? '#10B981' : '#EF4444';
            const badgeBg = isMOnLine ? '#B45309' : '#0F172A';

            return (
              <g
                className="point-m cursor-grab active:cursor-grabbing"
                transform={`translate(${mSvg.x}, ${mSvg.y})`}
              >
                <circle
                  r="18"
                  fill={markerColor}
                  fillOpacity="0.2"
                  className="animate-ping"
                  style={{ animationDuration: '2.5s' }}
                />
                <circle
                  r="12"
                  fill={markerColor}
                  fillOpacity="0.3"
                />
                <circle
                  r="7"
                  fill={markerColor}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
                <g transform="translate(12, -18)">
                  <rect
                    x="0"
                    y="0"
                    width={isMOnLine ? 116 : 84}
                    height="24"
                    rx="6"
                    fill={badgeBg}
                    fillOpacity="0.92"
                  />
                  <text
                    x={isMOnLine ? 58 : 42}
                    y="16"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#FFFFFF"
                    className="font-mono select-none"
                  >
                    {isMOnLine ? `M(${pointM.x}; ${pointM.y}) Trên bờ!` : `M(${pointM.x}; ${pointM.y})`}
                  </text>
                </g>
              </g>
            );
          })()}
        </svg>

        {/* Floating guidance overlay */}
        <div className="absolute bottom-2 left-2 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-200 text-[11px] text-slate-600 shadow-sm">
          <MousePointer className="w-3.5 h-3.5 text-blue-500" />
          <span>
            {enableHalfPlaneClick
              ? 'Bấm lên nửa mặt phẳng bạn dự đoán là miền nghiệm'
              : showPointsAB
              ? 'Kéo hoặc chỉnh tọa độ 2 điểm A và B trên đường biên'
              : 'Kéo điểm M hoặc bấm lên đồ thị để kiểm tra nghiệm'}
          </span>
        </div>

        {/* Boundary Line equation tag */}
        {showBoundaryLine && (
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Đường thẳng bờ (d): <strong>{formatBoundaryLine(inequality.a, inequality.b, inequality.c)}</strong></span>
            <span className="text-[10px] text-blue-600 font-normal">
              ({effectiveLineStyle === 'solid' ? 'Nét liền – Lấy bờ' : 'Nét đứt – Không lấy bờ'})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
