import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ObjectiveFunction, OptimizationResult, Point2D, RealWorldScenario, SystemInequality } from '../types/math';
import { getLineSegmentInBox } from '../math/mathEngine';
import {
  clipBoxWithSystem,
  formatCoord,
  formatPointCoord,
  formatValueWithApprox
} from '../math/systemMathEngine';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  Sparkles,
  Target,
  Layers,
  Eye,
  EyeOff,
  Minus,
  Plus
} from 'lucide-react';

interface OptimizationGraphCanvasProps {
  scenario: RealWorldScenario;
  result: OptimizationResult;
  kValue: number;
  onKValueChange: (k: number) => void;
  showLevelCurve?: boolean;
  showIntegerPoints?: boolean;
  showOptimalPoint?: boolean;
  revealOptimalAnswers?: boolean;
  highlightVertex?: Point2D | null;
  onHighlightVertex?: (pt: Point2D | null) => void;
  className?: string;
  isPresentationMode?: boolean;
}

export const OptimizationGraphCanvas: React.FC<OptimizationGraphCanvasProps> = ({
  scenario,
  result,
  kValue,
  onKValueChange,
  showLevelCurve = true,
  showIntegerPoints = false,
  showOptimalPoint = true,
  revealOptimalAnswers = true,
  highlightVertex = null,
  onHighlightVertex,
  className = '',
  isPresentationMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // View state: center and scale
  const [viewCenter, setViewCenter] = useState<Point2D>({ x: 3, y: 3 });
  const [scale, setScale] = useState<number>(36);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 480
  });

  // Pan & Dragging state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panCenterStart, setPanCenterStart] = useState<Point2D>({ x: 0, y: 0 });
  const pointerMovedRef = useRef<number>(0);

  // Animation state for sliding the level curve k
  const [isPlaying, setIsPlaying] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  const { objective, system } = scenario;
  const { orderedPolygon, optimalPoints, optimalValue, integerPoints, integerOptimalPoint } = result;

  // Compute ideal camera viewCenter and scale for current scenario
  const idealCamera = useMemo(() => {
    const pts: Point2D[] = [...orderedPolygon];
    // Include axis intercepts of non-axis constraints for context
    for (const ineq of system) {
      if (Math.abs(ineq.a) > 1e-6 && Math.abs(ineq.b) > 1e-6) {
        const xInt = ineq.c / ineq.a;
        const yInt = ineq.c / ineq.b;
        if (Math.abs(xInt) <= 50) pts.push({ x: xInt, y: 0 });
        if (Math.abs(yInt) <= 50) pts.push({ x: 0, y: yInt });
      }
    }

    if (pts.length === 0) {
      return { center: { x: 3, y: 3 }, scale: 36 };
    }

    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const minX = Math.min(0, ...xs);
    const maxX = Math.max(4, ...xs);
    const minY = Math.min(0, ...ys);
    const maxY = Math.max(4, ...ys);

    const spanX = Math.max(4, maxX - minX);
    const spanY = Math.max(4, maxY - minY);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const w = dimensions.width || 600;
    const h = dimensions.height || 400;
    const scaleX = (w * 0.68) / spanX;
    const scaleY = (h * 0.68) / spanY;
    const computedScale = Math.max(14, Math.min(72, Math.min(scaleX, scaleY)));

    return {
      center: {
        x: Math.round(centerX * 10) / 10,
        y: Math.round(centerY * 10) / 10
      },
      scale: Math.round(computedScale)
    };
  }, [orderedPolygon, system, dimensions.width, dimensions.height]);

  // Auto-fit camera when scenario changes
  useEffect(() => {
    setViewCenter(idealCamera.center);
    setScale(idealCamera.scale);
  }, [scenario.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute reasonable min and max k values for slider based on vertices
  const kRange = useMemo(() => {
    if (result.vertexEvaluations.length === 0) {
      return { min: 0, max: 200, step: 1 };
    }
    const vals = result.vertexEvaluations.map(ve => ve.value);
    const minVal = Math.floor(Math.min(...vals, 0));
    const maxVal = Math.ceil(Math.max(...vals, 20));
    const span = Math.max(20, maxVal - minVal);
    const minK = Math.max(0, Math.floor(minVal - span * 0.15));
    const maxK = Math.ceil(maxVal + span * 0.25);
    const step = span > 200 ? 2 : span > 50 ? 1 : 0.5;

    return { min: minK, max: maxK, step };
  }, [result.vertexEvaluations]);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const isMobile = window.innerWidth < 640;
        const targetHeight = isPresentationMode
          ? Math.max(450, Math.min(rect.width * 0.78, 600))
          : isMobile
          ? Math.max(250, Math.min(rect.width * 0.68, 310))
          : Math.max(380, Math.min(rect.width * 0.62, 500));

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

  // Math bounds
  const halfW = dimensions.width / (2 * scale);
  const halfH = dimensions.height / (2 * scale);
  const bounds = useMemo(() => {
    return {
      minX: viewCenter.x - halfW - 2,
      maxX: viewCenter.x + halfW + 2,
      minY: viewCenter.y - halfH - 2,
      maxY: viewCenter.y + halfH + 2
    };
  }, [viewCenter, halfW, halfH]);

  const kValueRef = useRef(kValue);
  useEffect(() => {
    kValueRef.current = kValue;
  }, [kValue]);

  // Animation Loop for level curve k
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const speed = (kRange.max - kRange.min) / 6000; // Complete full sweep in 6 seconds

    const step = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      let nextK = kValueRef.current + speed * dt;
      if (nextK >= kRange.max) {
        nextK = kRange.min;
      }
      onKValueChange(Math.round(nextK * 10) / 10);

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, kRange, onKValueChange]);

  // Pointer event handlers for panning
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    pointerMovedRef.current = 0;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    setPanCenterStart({ ...viewCenter });
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isPanning) return;
    const dx = (e.clientX - panStart.x) / scale;
    const dy = (e.clientY - panStart.y) / scale;
    pointerMovedRef.current += Math.hypot(e.clientX - panStart.x, e.clientY - panStart.y);
    setViewCenter({
      x: panCenterStart.x - dx,
      y: panCenterStart.y + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isPanning) setIsPanning(false);
    try {
      if (svgRef.current && svgRef.current.hasPointerCapture(e.pointerId)) {
        svgRef.current.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  // Zoom controls
  const handleZoomIn = () => setScale(s => Math.min(95, s * 1.25));
  const handleZoomOut = () => setScale(s => Math.max(12, s / 1.25));
  const handleResetView = () => {
    setViewCenter(idealCamera.center);
    setScale(idealCamera.scale);
  };

  // Grid steps
  const gridStep = scale > 45 ? 1 : scale > 22 ? 2 : 5;
  const startGridX = Math.floor(bounds.minX / gridStep) * gridStep;
  const endGridX = Math.ceil(bounds.maxX / gridStep) * gridStep;
  const startGridY = Math.floor(bounds.minY / gridStep) * gridStep;
  const endGridY = Math.ceil(bounds.maxY / gridStep) * gridStep;

  const gridLinesX: number[] = [];
  for (let x = startGridX; x <= endGridX; x += gridStep) gridLinesX.push(x);
  const gridLinesY: number[] = [];
  for (let y = startGridY; y <= endGridY; y += gridStep) gridLinesY.push(y);

  const originSvg = mathToSvg({ x: 0, y: 0 });

  // Feasible polygon SVG path (supports both bounded polygons and unbounded regions clipped to view)
  const feasibleFillPoints = useMemo(() => {
    if (result.regionType === 'empty') return '';
    if (result.regionType === 'bounded_polygon' && orderedPolygon.length >= 3) {
      return orderedPolygon
        .map(p => {
          const s = mathToSvg(p);
          return `${s.x},${s.y}`;
        })
        .join(' ');
    }
    if (result.regionType === 'unbounded') {
      const clipped = clipBoxWithSystem(bounds, system);
      if (clipped.length >= 3) {
        return clipped
          .map(p => {
            const s = mathToSvg(p);
            return `${s.x},${s.y}`;
          })
          .join(' ');
      }
    }
    return '';
  }, [result.regionType, orderedPolygon, bounds, system, mathToSvg]);

  // Bounded polygon outline
  const boundedOutlinePoints = useMemo(() => {
    if (result.regionType !== 'bounded_polygon' || orderedPolygon.length < 3) return '';
    return orderedPolygon
      .map(p => {
        const s = mathToSvg(p);
        return `${s.x},${s.y}`;
      })
      .join(' ');
  }, [result.regionType, orderedPolygon, mathToSvg]);

  // Level curve line segment in current box: cx*x + cy*y = kValue
  const levelCurveSegment = useMemo(() => {
    if (!showLevelCurve || (Math.abs(objective.cx) < 1e-9 && Math.abs(objective.cy) < 1e-9)) {
      return null;
    }
    const seg = getLineSegmentInBox(objective.cx, objective.cy, kValue, bounds);
    if (!seg) return null;
    const p1 = mathToSvg(seg[0]);
    const p2 = mathToSvg(seg[1]);
    return { p1, p2 };
  }, [showLevelCurve, objective, kValue, bounds, mathToSvg]);

  // Check relationship between current level curve and feasible region
  const levelCurveStatus = useMemo(() => {
    if (result.regionType === 'empty' || result.vertexEvaluations.length === 0) return 'outside';

    // Clip current view or test against large box to see if cx*x + cy*y = k intersects feasible region
    const vals = result.vertexEvaluations.map(ve => ve.value);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);

    const eps = 0.25;
    if (result.regionType === 'bounded_polygon') {
      if (Math.abs(kValue - maxVal) < eps || Math.abs(kValue - minVal) < eps) {
        return 'touches';
      }
      if (kValue > minVal && kValue < maxVal) {
        return 'crosses';
      }
      return 'outside';
    }

    // For unbounded region: check if kValue touches optimalValue or crosses
    if (result.optimalValue !== null && Math.abs(kValue - result.optimalValue) < eps) {
      return 'touches';
    }
    if (objective.goal === 'min' && result.optimalValue !== null && kValue > result.optimalValue) {
      return 'crosses';
    }
    if (objective.goal === 'max' && result.optimalValue !== null && kValue < result.optimalValue) {
      return 'crosses';
    }
    if (result.isUnboundedObjective) {
      if (objective.goal === 'max' && kValue >= minVal) return 'crosses';
      if (objective.goal === 'min' && kValue <= maxVal) return 'crosses';
    }
    return 'outside';
  }, [kValue, result, objective.goal]);

  const touchedVertex = useMemo(() => {
    if (result.vertexEvaluations.length === 0) return null;
    const eps = 0.35;
    return result.vertexEvaluations.find(ve => Math.abs(ve.value - kValue) < eps) || null;
  }, [kValue, result.vertexEvaluations]);

  const isTouchingOptimal = useMemo(() => {
    if (result.optimalValue === null) return false;
    return Math.abs(kValue - result.optimalValue) < 0.35;
  }, [kValue, result.optimalValue]);

  const canRevealOptimal = showOptimalPoint && revealOptimalAnswers;

  // Polygon centroid for smart outward vertex label placement
  const polygonCentroid = useMemo(() => {
    if (orderedPolygon.length === 0) return { x: 2, y: 2 };
    const sum = orderedPolygon.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / orderedPolygon.length, y: sum.y / orderedPolygon.length };
  }, [orderedPolygon]);

  return (
    <div className={`relative flex flex-col w-full select-none ${className}`}>
      {/* Top Floating Controls Bar */}
      <div className="flex items-center justify-between pb-1.5 px-0.5 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-extrabold text-slate-800 flex items-center gap-1.5 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse shrink-0" />
            <span className="truncate">Miền Phương Án & Đường Mức {objective.label}</span>
          </span>

          {isTouchingOptimal && canRevealOptimal && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 shrink-0">
              Tiếp xúc đỉnh tối ưu (k = {formatCoord(kValue)})
            </span>
          )}
          {touchedVertex && (!isTouchingOptimal || !canRevealOptimal) && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 shrink-0">
              Đi qua đỉnh {touchedVertex.label} (k = {formatCoord(kValue)})
            </span>
          )}
          {!touchedVertex && levelCurveStatus === 'crosses' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 hidden sm:inline">
              Cắt miền khả thi
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Phóng to"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Đặt lại khung nhìn chuẩn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        className="w-full relative rounded-2xl overflow-hidden border border-slate-300 bg-white shadow-xs touch-none cursor-crosshair"
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block"
        >
          <defs>
            {/* Pattern Hatch for Feasible Polygon */}
            <pattern
              id="opti-feasible-hatch"
              width="14"
              height="14"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="14" stroke="#8B5CF6" strokeWidth="2.5" strokeOpacity="0.35" />
            </pattern>

            {/* Arrow marker for axes */}
            <marker
              id="axis-arrow-opt"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#334155" />
            </marker>
          </defs>

          {/* 1. Grid Lines */}
          <g className="grid-lines-layer" opacity={0.65}>
            {gridLinesX.map(x => {
              const p1 = mathToSvg({ x, y: bounds.minY });
              const p2 = mathToSvg({ x, y: bounds.maxY });
              const isAxis = x === 0;
              return (
                <line
                  key={`gx-${x}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isAxis ? '#64748B' : '#E2E8F0'}
                  strokeWidth={isAxis ? 1.5 : 0.8}
                />
              );
            })}
            {gridLinesY.map(y => {
              const p1 = mathToSvg({ x: bounds.minX, y });
              const p2 = mathToSvg({ x: bounds.maxX, y });
              const isAxis = y === 0;
              return (
                <line
                  key={`gy-${y}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isAxis ? '#64748B' : '#E2E8F0'}
                  strokeWidth={isAxis ? 1.5 : 0.8}
                />
              );
            })}
          </g>

          {/* 2. Feasible Region Fill */}
          {feasibleFillPoints && (
            <g className="feasible-region-layer">
              <polygon
                points={feasibleFillPoints}
                fill="#8B5CF6"
                fillOpacity={0.16}
              />
              <polygon
                points={feasibleFillPoints}
                fill="url(#opti-feasible-hatch)"
              />
              {boundedOutlinePoints && (
                <polygon
                  points={boundedOutlinePoints}
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeDasharray={result.isStrictUnattained ? '6 4' : undefined}
                />
              )}
            </g>
          )}

          {/* Degenerate segment highlight if applicable */}
          {result.regionType === 'degenerate_segment' && orderedPolygon.length >= 2 && (
            <line
              x1={mathToSvg(orderedPolygon[0]).x}
              y1={mathToSvg(orderedPolygon[0]).y}
              x2={mathToSvg(orderedPolygon[orderedPolygon.length - 1]).x}
              y2={mathToSvg(orderedPolygon[orderedPolygon.length - 1]).y}
              stroke="#7C3AED"
              strokeWidth={5}
              strokeLinecap="round"
            />
          )}

          {/* 3. Coordinate Axes Ox, Oy */}
          <g className="axes-layer">
            {/* Ox Axis */}
            <line
              x1={0}
              y1={originSvg.y}
              x2={dimensions.width - 6}
              y2={originSvg.y}
              stroke="#1E293B"
              strokeWidth={2}
              markerEnd="url(#axis-arrow-opt)"
            />
            {/* Oy Axis */}
            <line
              x1={originSvg.x}
              y1={dimensions.height}
              x2={originSvg.x}
              y2={8}
              stroke="#1E293B"
              strokeWidth={2}
              markerEnd="url(#axis-arrow-opt)"
            />

            {/* Origin Label O */}
            <text
              x={originSvg.x - 14}
              y={originSvg.y + 15}
              fontSize={12}
              fontWeight="bold"
              fill="#1E293B"
              fontFamily="sans-serif"
            >
              O
            </text>

            {/* Axis Name Labels */}
            <text
              x={dimensions.width - 16}
              y={originSvg.y - 8}
              fontSize={13}
              fontWeight="bold"
              fill="#1E293B"
              fontFamily="serif"
            >
              x
            </text>
            <text
              x={originSvg.x + 8}
              y={18}
              fontSize={13}
              fontWeight="bold"
              fill="#1E293B"
              fontFamily="serif"
            >
              y
            </text>

            {/* Grid Tick Numbers */}
            {gridLinesX.map(x => {
              if (x === 0) return null;
              const pt = mathToSvg({ x, y: 0 });
              return (
                <text
                  key={`tx-${x}`}
                  x={pt.x}
                  y={originSvg.y + 14}
                  fontSize={10}
                  fontWeight="600"
                  textAnchor="middle"
                  fill="#64748B"
                  fontFamily="sans-serif"
                >
                  {x}
                </text>
              );
            })}
            {gridLinesY.map(y => {
              if (y === 0) return null;
              const pt = mathToSvg({ x: 0, y });
              return (
                <text
                  key={`ty-${y}`}
                  x={originSvg.x - 8}
                  y={pt.y + 4}
                  fontSize={10}
                  fontWeight="600"
                  textAnchor="end"
                  fill="#64748B"
                  fontFamily="sans-serif"
                >
                  {y}
                </text>
              );
            })}
          </g>

          {/* 4. Constraint Boundary Lines */}
          <g className="boundary-lines-layer">
            {system.map((ineq, idx) => {
              if (ineq.showLine === false) return null;
              const seg = getLineSegmentInBox(ineq.a, ineq.b, ineq.c, bounds);
              if (!seg) return null;
              const p1 = mathToSvg(seg[0]);
              const p2 = mathToSvg(seg[1]);
              const isDashed = ineq.op === '<' || ineq.op === '>';
              const lineColor = ineq.color || '#2563EB';
              const shortLabel = ineq.label ? ineq.label.split(':')[0].trim() : `(d${idx + 1})`;

              // Position label at 22% along the segment inside the canvas
              const lx = p1.x + (p2.x - p1.x) * 0.22;
              const ly = p1.y + (p2.y - p1.y) * 0.22;

              return (
                <g key={ineq.id}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={lineColor}
                    strokeWidth={2}
                    strokeDasharray={isDashed ? '6 4' : undefined}
                    opacity={0.88}
                  />
                  {/* Non-axis line badge */}
                  {!(Math.abs(ineq.c) < 1e-6 && (Math.abs(ineq.a) < 1e-6 || Math.abs(ineq.b) < 1e-6)) && (
                    <g transform={`translate(${Math.max(24, Math.min(dimensions.width - 36, lx))}, ${Math.max(20, Math.min(dimensions.height - 20, ly))})`}>
                      <rect
                        x={-16}
                        y={-9}
                        width={32}
                        height={16}
                        rx={4}
                        fill="#FFFFFF"
                        fillOpacity={0.9}
                        stroke={lineColor}
                        strokeWidth={1}
                      />
                      <text
                        x={0}
                        y={2.5}
                        fontSize={9.5}
                        fontWeight="bold"
                        fill={lineColor}
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {shortLabel}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* 5. Objective Level Curve (Đường Mức P = k) */}
          {levelCurveSegment && (
            <g className="level-curve-layer">
              {/* Prominent Glow Effect */}
              <line
                x1={levelCurveSegment.p1.x}
                y1={levelCurveSegment.p1.y}
                x2={levelCurveSegment.p2.x}
                y2={levelCurveSegment.p2.y}
                stroke="#D946EF"
                strokeWidth={7}
                strokeOpacity={0.28}
                strokeLinecap="round"
              />
              {/* Main Line */}
              <line
                x1={levelCurveSegment.p1.x}
                y1={levelCurveSegment.p1.y}
                x2={levelCurveSegment.p2.x}
                y2={levelCurveSegment.p2.y}
                stroke="#C026D3"
                strokeWidth={2.8}
                strokeDasharray="7 4"
                strokeLinecap="round"
              />

              {/* Floating Label for Level Curve */}
              {(() => {
                const badgeText = `Đường mức: k = ${formatCoord(kValue)}`;
                const badgeW = Math.max(125, badgeText.length * 6.5 + 14);
                const tx = Math.max(12, Math.min(dimensions.width - badgeW - 8, (levelCurveSegment.p1.x + levelCurveSegment.p2.x) / 2 - badgeW / 2));
                const ty = Math.max(24, Math.min(dimensions.height - 44, (levelCurveSegment.p1.y + levelCurveSegment.p2.y) / 2 - 14));
                return (
                  <g transform={`translate(${tx}, ${ty})`}>
                    <rect
                      x={0}
                      y={-14}
                      width={badgeW}
                      height={22}
                      rx={6}
                      fill="#4A044E"
                      fillOpacity={0.9}
                    />
                    <text x={8} y={1} fontSize={11} fontWeight="bold" fill="#FDF4FF" fontFamily="sans-serif">
                      {badgeText}
                    </text>
                  </g>
                );
              })()}
            </g>
          )}

          {/* 6. Integer Lattice Points (when enabled) */}
          {showIntegerPoints && (
            <g className="integer-points-layer">
              {integerPoints.map((ip, idx) => {
                const s = mathToSvg(ip.point);
                const isOptimalInt =
                  canRevealOptimal &&
                  integerOptimalPoint &&
                  integerOptimalPoint.x === ip.point.x &&
                  integerOptimalPoint.y === ip.point.y;

                return (
                  <g key={`int-${idx}`}>
                    {isOptimalInt && (
                      <circle
                        cx={s.x}
                        cy={s.y}
                        r={10}
                        fill="#E11D48"
                        fillOpacity={0.22}
                      />
                    )}
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r={isOptimalInt ? 5.5 : 3.4}
                      fill={isOptimalInt ? '#E11D48' : '#334155'}
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                    >
                      <title>{`Điểm nguyên (${ip.point.x}; ${ip.point.y}) -> F = ${formatValueWithApprox(ip.value)}`}</title>
                    </circle>
                  </g>
                );
              })}
            </g>
          )}

          {/* 7. Vertices of the Feasible Polygon (Using unified SGK labels & exact rational coordinates) */}
          <g className="vertices-layer">
            {result.vertexEvaluations.map((ve, idx) => {
              const v = ve.vertex;
              const s = mathToSvg(v);
              const isHighlight =
                highlightVertex &&
                Math.abs(highlightVertex.x - v.x) < 1e-4 &&
                Math.abs(highlightVertex.y - v.y) < 1e-4;
              const isOpt = canRevealOptimal && ve.isOptimal;
              const isExcluded = ve.isStrictlyExcluded;
              const fullLabel = `${ve.label}${formatPointCoord(v)}`;
              const boxWidth = Math.max(48, fullLabel.length * 6.6 + 10);

              // Compute smart outward label offset relative to polygon centroid
              const dirX = v.x - polygonCentroid.x;
              const dirY = v.y - polygonCentroid.y;
              const offsetX = dirX < -0.2 ? -boxWidth - 6 : 9;
              const offsetY = dirY < -0.2 ? 16 : -10;

              return (
                <g
                  key={`v-${ve.label}-${idx}`}
                  transform={`translate(${s.x}, ${s.y})`}
                  className="cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    onHighlightVertex?.(v);
                  }}
                >
                  {/* Outer pulse circle for optimal vertex */}
                  {isOpt && (
                    <circle
                      r={14}
                      fill="#7C3AED"
                      fillOpacity={0.25}
                      className="animate-ping"
                    />
                  )}

                  {/* Highlight ring */}
                  {isHighlight && (
                    <circle
                      r={11}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth={3}
                      strokeDasharray="3 2"
                    />
                  )}

                  {/* Main Point Marker (Hollow if strictly excluded by < or >) */}
                  <circle
                    r={isOpt ? 7.5 : 5.8}
                    fill={isExcluded ? '#FFFFFF' : isOpt ? '#7C3AED' : '#1E293B'}
                    stroke={isExcluded ? '#EF4444' : '#FFFFFF'}
                    strokeWidth={2.2}
                    strokeDasharray={isExcluded ? '2 1' : undefined}
                  />

                  {/* Label tag */}
                  <g transform={`translate(${offsetX}, ${offsetY})`}>
                    <rect
                      x={-2}
                      y={-12}
                      width={boxWidth}
                      height={19}
                      rx={5}
                      fill="#FFFFFF"
                      fillOpacity={0.94}
                      stroke={isExcluded ? '#EF4444' : isOpt ? '#7C3AED' : '#CBD5E1'}
                      strokeWidth={isOpt ? 1.5 : 1}
                    />
                    <text
                      x={3}
                      y={1.5}
                      fontSize={11}
                      fontWeight="bold"
                      fill={isExcluded ? '#DC2626' : isOpt ? '#6D28D9' : '#0F172A'}
                      fontFamily="monospace"
                    >
                      {fullLabel}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Empty region overlay notice */}
        {result.regionType === 'empty' && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto bg-rose-50/95 border border-rose-300 text-rose-900 rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm flex items-center gap-2">
            <span>⚠️ Miền phương án khả thi RỖNG (∅) — Các ràng buộc mâu thuẫn nhau!</span>
          </div>
        )}

        {/* Bottom Floating Legend on Canvas */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:right-auto bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl px-3 py-2 text-xs shadow-xs flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-200 border border-purple-400" />
            <span className="font-semibold text-slate-700">Miền khả thi</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-fuchsia-600" />
            <span className="font-semibold text-slate-700">Đường mức F = k</span>
          </div>

          {canRevealOptimal && optimalPoints.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-300" />
              <span className="font-bold text-purple-900 font-mono">
                Đỉnh tối ưu:{' '}
                {result.vertexEvaluations
                  .filter(ve => ve.isOptimal)
                  .map(ve => `${ve.label}${formatPointCoord(ve.vertex)}`)
                  .join(', ')}
              </span>
            </div>
          )}

          {showIntegerPoints && canRevealOptimal && integerOptimalPoint && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-rose-200" />
              <span className="font-bold text-rose-800 font-mono">
                Nguyên tối ưu: ({integerOptimalPoint.x}; {integerOptimalPoint.y})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Level Curve Controller & Mobile-Optimized Slider */}
      <div className="mt-2.5 sm:mt-3 bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col gap-2.5">
        {/* Header & Action Controls */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Sliders className="w-4 h-4 text-purple-600 shrink-0" />
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xs font-extrabold text-slate-900">
                Đường Mức F = k:
              </span>
              <span className="font-mono text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                k = {formatValueWithApprox(kValue)} {objective.unit}
              </span>
            </div>
          </div>

          {/* Animation & Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-xs min-h-[36px] ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Dừng' : 'Phát'}</span>
            </button>

            {canRevealOptimal && optimalValue !== null && (
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  onKValueChange(optimalValue);
                  if (optimalPoints.length > 0) {
                    onHighlightVertex?.(optimalPoints[0]);
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition cursor-pointer min-h-[36px]"
                title="Chuyển ngay k đến giá trị tối ưu"
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>k tối ưu ({formatCoord(optimalValue)})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onKValueChange(kRange.min);
              }}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Đặt lại k về giá trị nhỏ nhất"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Range Slider with Tactile Step Nudge Buttons & Magnetic Vertex Snapping */}
        <div className="flex items-center gap-2 w-full">
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              const nextK = Math.max(kRange.min, Math.round((kValue - kRange.step) * 100) / 100);
              onKValueChange(nextK);
            }}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0 shadow-xs"
            title="Giảm k"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-[11px] font-bold text-slate-500 w-10 text-center shrink-0">
            {kRange.min}
          </span>

          <div className="relative flex-1 flex items-center py-2">
            <input
              type="range"
              min={kRange.min}
              max={kRange.max}
              step={kRange.step}
              value={kValue}
              onChange={e => {
                setIsPlaying(false);
                const rawVal = parseFloat(e.target.value) || 0;
                // Magnetic snap to exact rational vertex value if within 0.65 * step
                const nearVertex = result.vertexEvaluations.find(
                  ve => Math.abs(ve.value - rawVal) <= kRange.step * 0.65
                );
                onKValueChange(nearVertex ? nearVertex.value : rawVal);
              }}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 touch-none"
            />
          </div>

          <span className="font-mono text-[11px] font-bold text-slate-500 w-10 text-center shrink-0">
            {kRange.max}
          </span>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              const nextK = Math.min(kRange.max, Math.round((kValue + kRange.step) * 100) / 100);
              onKValueChange(nextK);
            }}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0 shadow-xs"
            title="Tăng k"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Vertex Target Jump Pills (Crucial for mobile touch precision & exact rational k!) */}
        {result.vertexEvaluations.length > 0 && (
          <div className="pt-1.5 border-t border-slate-100 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-purple-600" />
                <span>Đưa đường mức đi qua đỉnh:</span>
              </span>
              <span className="text-[10px] text-slate-600 italic">
                Chạm đỉnh để kiểm tra đường mức tại đó
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-wrap sm:flex-nowrap">
              {result.vertexEvaluations.map(ve => {
                const isOpt = canRevealOptimal && ve.isOptimal;
                const isCurrent = Math.abs(kValue - ve.value) < 0.35;

                return (
                  <button
                    key={ve.label}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      onKValueChange(ve.value);
                      onHighlightVertex?.(ve.vertex);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer shrink-0 border flex items-center gap-1 shadow-2xs ${
                      isCurrent
                        ? isOpt
                          ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-300'
                          : 'bg-indigo-600 text-white border-indigo-600 ring-1 ring-indigo-300'
                        : isOpt
                        ? 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>
                      {ve.label}
                      {formatPointCoord(ve.vertex)}
                    </span>
                    {canRevealOptimal && <span>: k = {formatCoord(ve.value)}</span>}
                    {isOpt && <span>⭐</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Notification Banner & Current Line Equation */}
        <div
          className={`p-2 sm:p-2.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${
            isTouchingOptimal && canRevealOptimal
              ? 'bg-purple-50 border-purple-300 text-purple-950 font-bold'
              : touchedVertex
              ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold'
              : levelCurveStatus === 'crosses'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
              : 'bg-slate-50 border-slate-200 text-slate-700 font-medium'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {isTouchingOptimal && canRevealOptimal ? (
              <Sparkles className="w-4 h-4 text-purple-700 shrink-0" />
            ) : (
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  levelCurveStatus === 'crosses' || touchedVertex ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            )}
            <span className="leading-snug">
              {isTouchingOptimal && canRevealOptimal
                ? `Đường mức tiếp xúc đỉnh tối ưu ${result.vertexEvaluations
                    .filter(ve => ve.isOptimal)
                    .map(ve => `${ve.label}${formatPointCoord(ve.vertex)}`)
                    .join(', ')}! Đạt cực trị F = ${
                    optimalValue !== null ? formatValueWithApprox(optimalValue) : ''
                  } ${objective.unit}.`
                : touchedVertex
                ? `Đường mức đi qua đỉnh ${touchedVertex.label}${formatPointCoord(
                    touchedVertex.vertex
                  )} với k = ${formatValueWithApprox(touchedVertex.value)} ${objective.unit}.`
                : levelCurveStatus === 'crosses'
                ? `Đường mức cắt miền phương án khả thi — Còn các điểm khả thi khác trên miền đa giác.`
                : `Đường mức nằm ngoài miền khả thi — Không có phương án nào thỏa mãn F = ${formatCoord(
                    kValue
                  )}.`}
            </span>
          </div>

          <div className="font-mono text-[11px] shrink-0 text-slate-600 sm:text-right">
            Đường mức: <strong className="text-purple-900">{objective.cx}x + {objective.cy}y = {formatCoord(kValue)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
