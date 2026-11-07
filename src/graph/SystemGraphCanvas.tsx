import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Point2D, ShadingMode, SystemInequality, IntersectionPoint, SystemAnalysisResult } from '../types/math';
import { getLineSegmentInBox, formatBoundaryLine } from '../math/mathEngine';
import { formatPointCoord } from '../math/systemMathEngine';
import { ZoomIn, ZoomOut, RotateCcw, Layers, MousePointer, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

interface SystemGraphCanvasProps {
  system: SystemInequality[];
  analysis: SystemAnalysisResult;
  pointM?: Point2D;
  onPointMChange?: (pt: Point2D) => void;
  showPointM?: boolean;

  // Layer Controls
  showCommonFeasibleRegion?: boolean;
  showIndividualFills?: boolean;
  showBoundaryLines?: boolean;
  showIntersections?: boolean;
  showFeasibleVerticesOnly?: boolean;
  dimNonFeasibleRegion?: boolean;
  shadingMode?: ShadingMode;

  // View & Presentation
  isPresentationMode?: boolean;
  className?: string;

  // Interactive Prediction
  highlightVertex?: Point2D | null;
  onSelectIntersection?: (inter: IntersectionPoint) => void;
}

export const SystemGraphCanvas: React.FC<SystemGraphCanvasProps> = ({
  system,
  analysis,
  pointM = { x: 1, y: 1 },
  onPointMChange,
  showPointM = true,

  showCommonFeasibleRegion = true,
  showIndividualFills = true,
  showBoundaryLines = true,
  showIntersections = true,
  showFeasibleVerticesOnly = false,
  dimNonFeasibleRegion = false,
  shadingMode = 'solution',

  isPresentationMode = false,
  className = '',

  highlightVertex = null,
  onSelectIntersection
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Math coordinate window center and scale
  const [viewCenter, setViewCenter] = useState<Point2D>({ x: 2, y: 2 });
  const [scale, setScale] = useState<number>(34); // pixels per math unit
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 480
  });

  const [isDraggingM, setIsDraggingM] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panCenterStart, setPanCenterStart] = useState<Point2D>({ x: 0, y: 0 });
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
          ? Math.max(480, Math.min(rect.width * 0.78, 650))
          : isMobile
          ? Math.max(300, Math.min(rect.width * 0.75, 360))
          : Math.max(400, Math.min(rect.width * 0.65, 540));

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
      return {
        x: Math.round(rawX * 10) / 10,
        y: Math.round(rawY * 10) / 10
      };
    },
    [dimensions, viewCenter, scale]
  );

  // Visible math bounds
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

  // Point M math status in system
  const pointMStatus = useMemo(() => {
    let satisfiesAll = true;
    const details = system.map(ineq => {
      const lhs = ineq.a * pointM.x + ineq.b * pointM.y;
      const diff = lhs - ineq.c;
      let sat = false;
      switch (ineq.op) {
        case '<=': sat = diff <= 1e-5; break;
        case '<': sat = diff < -1e-5; break;
        case '>=': sat = diff >= -1e-5; break;
        case '>': sat = diff > 1e-5; break;
      }
      if (!sat) satisfiesAll = false;
      return { ineqId: ineq.id, satisfies: sat };
    });
    return { satisfiesAll, details };
  }, [system, pointM]);

  // Compute common feasible polygon within viewport
  const commonPolygonSvg = useMemo(() => {
    if (!showCommonFeasibleRegion || analysis.regionType === 'empty') return '';

    // Clip box against all active inequalities in system
    let poly: Point2D[] = [
      { x: bounds.minX, y: bounds.minY },
      { x: bounds.maxX, y: bounds.minY },
      { x: bounds.maxX, y: bounds.maxY },
      { x: bounds.minX, y: bounds.maxY }
    ];

    for (const ineq of system) {
      if (poly.length === 0) break;
      const isInside = (pt: Point2D): boolean => {
        const val = ineq.a * pt.x + ineq.b * pt.y;
        switch (ineq.op) {
          case '<=':
          case '<': return val <= ineq.c + 1e-5;
          case '>=':
          case '>': return val >= ineq.c - 1e-5;
        }
      };
      const lineDist = (pt: Point2D) => ineq.a * pt.x + ineq.b * pt.y - ineq.c;

      const output: Point2D[] = [];
      for (let i = 0; i < poly.length; i++) {
        const current = poly[i];
        const prev = poly[(i + poly.length - 1) % poly.length];
        const currentIn = isInside(current);
        const prevIn = isInside(prev);

        if (currentIn) {
          if (!prevIn) {
            const d1 = lineDist(prev);
            const d2 = lineDist(current);
            const t = d1 / (d1 - d2);
            output.push({ x: prev.x + t * (current.x - prev.x), y: prev.y + t * (current.y - prev.y) });
          }
          output.push(current);
        } else if (prevIn) {
          const d1 = lineDist(prev);
          const d2 = lineDist(current);
          const t = d1 / (d1 - d2);
          output.push({ x: prev.x + t * (current.x - prev.x), y: prev.y + t * (current.y - prev.y) });
        }
      }
      poly = output;
    }

    if (poly.length < 3) return '';
    return poly.map(p => {
      const s = mathToSvg(p);
      return `${s.x},${s.y}`;
    }).join(' ');
  }, [showCommonFeasibleRegion, analysis.regionType, bounds, system, mathToSvg]);

  // Compute individual half-plane SVG polygons
  const individualPolygons = useMemo(() => {
    if (!showIndividualFills) return [];

    return system.map((ineq, idx) => {
      if (ineq.showFill === false) return null;

      let poly: Point2D[] = [
        { x: bounds.minX, y: bounds.minY },
        { x: bounds.maxX, y: bounds.minY },
        { x: bounds.maxX, y: bounds.maxY },
        { x: bounds.minX, y: bounds.maxY }
      ];

      const isInside = (pt: Point2D): boolean => {
        const val = ineq.a * pt.x + ineq.b * pt.y;
        switch (ineq.op) {
          case '<=':
          case '<': return val <= ineq.c + 1e-5;
          case '>=':
          case '>': return val >= ineq.c - 1e-5;
        }
      };
      const lineDist = (pt: Point2D) => ineq.a * pt.x + ineq.b * pt.y - ineq.c;

      const output: Point2D[] = [];
      for (let i = 0; i < poly.length; i++) {
        const current = poly[i];
        const prev = poly[(i + poly.length - 1) % poly.length];
        const currentIn = isInside(current);
        const prevIn = isInside(prev);

        if (currentIn) {
          if (!prevIn) {
            const d1 = lineDist(prev);
            const d2 = lineDist(current);
            const t = d1 / (d1 - d2);
            output.push({ x: prev.x + t * (current.x - prev.x), y: prev.y + t * (current.y - prev.y) });
          }
          output.push(current);
        } else if (prevIn) {
          const d1 = lineDist(prev);
          const d2 = lineDist(current);
          const t = d1 / (d1 - d2);
          output.push({ x: prev.x + t * (current.x - prev.x), y: prev.y + t * (current.y - prev.y) });
        }
      }

      if (output.length < 3) return null;
      const ptsStr = output.map(p => {
        const s = mathToSvg(p);
        return `${s.x},${s.y}`;
      }).join(' ');

      return {
        id: ineq.id,
        color: ineq.color,
        pointsStr: ptsStr
      };
    }).filter(Boolean);
  }, [showIndividualFills, system, bounds, mathToSvg]);

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    pointerMovedRef.current = 0;

    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (showPointM) {
      const mSvg = mathToSvg(pointM);
      const distToM = Math.hypot(mouseX - mSvg.x, mouseY - mSvg.y);
      if (distToM <= 32) {
        setIsDraggingM(true);
        try { svg.setPointerCapture(e.pointerId); } catch {}
        return;
      }
    }

    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    setPanCenterStart({ ...viewCenter });
    try { svg.setPointerCapture(e.pointerId); } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDraggingM && onPointMChange) {
      pointerMovedRef.current += 1;
      const targetMath = svgToMath(mouseX, mouseY);
      onPointMChange(targetMath);
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
    if (isPanning) setIsPanning(false);
    try {
      if (svg && svg.hasPointerCapture(e.pointerId)) {
        svg.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (pointerMovedRef.current > 5) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const targetMath = svgToMath(mouseX, mouseY);

    if (showPointM && onPointMChange) {
      onPointMChange(targetMath);
    }
  };

  // Zoom controls
  const handleZoomIn = () => setScale(s => Math.min(80, s * 1.25));
  const handleZoomOut = () => setScale(s => Math.max(16, s / 1.25));
  const handleResetView = () => {
    setViewCenter({ x: 2, y: 2 });
    setScale(34);
  };

  // Grid steps
  const gridStep = scale > 45 ? 1 : scale > 25 ? 1 : 2;
  const startGridX = Math.floor(bounds.minX / gridStep) * gridStep;
  const endGridX = Math.ceil(bounds.maxX / gridStep) * gridStep;
  const startGridY = Math.floor(bounds.minY / gridStep) * gridStep;
  const endGridY = Math.ceil(bounds.maxY / gridStep) * gridStep;

  const gridLinesX: number[] = [];
  for (let x = startGridX; x <= endGridX; x += gridStep) gridLinesX.push(x);
  const gridLinesY: number[] = [];
  for (let y = startGridY; y <= endGridY; y += gridStep) gridLinesY.push(y);

  const originSvg = mathToSvg({ x: 0, y: 0 });
  const mSvg = mathToSvg(pointM);

  return (
    <div className={`relative flex flex-col w-full select-none ${className}`}>
      {/* Top Floating Controls Bar */}
      <div className="flex items-center justify-between pb-1.5 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Hệ Trục Tọa Độ Oxy ({system.length} Ràng Buộc)
          </span>
          {analysis.regionType === 'empty' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              Miền rỗng (∅)
            </span>
          )}
          {analysis.regionType === 'unbounded' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              Không bị chặn
            </span>
          )}
          {analysis.regionType === 'bounded_polygon' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Đa giác bị chặn ({analysis.orderedPolygon.length} đỉnh)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs cursor-pointer"
            title="Đặt lại khung nhìn"
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
          onClick={handleCanvasClick}
          className="w-full h-full block"
        >
          <defs>
            {/* Pattern Hatch for Common Solution Region */}
            <pattern id="common-hatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#059669" strokeWidth="2" strokeOpacity="0.5" />
            </pattern>
            {/* Pattern for non-solution dim */}
            <pattern id="dim-hatch" width="8" height="8" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#94A3B8" strokeWidth="1" strokeOpacity="0.25" />
            </pattern>
            {/* Arrow marker */}
            <marker id="axis-arrow-sys" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#334155" />
            </marker>
          </defs>

          {/* Coordinate Grid */}
          <g className="grid-lines" stroke="#F1F5F9" strokeWidth="1">
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

          {/* Individual Constraint Fills */}
          {showIndividualFills && individualPolygons.map((poly, idx) => {
            if (!poly) return null;
            return (
              <polygon
                key={`indiv-${poly.id}-${idx}`}
                points={poly.pointsStr}
                fill={poly.color}
                fillOpacity="0.08"
                stroke="none"
              />
            );
          })}

          {/* Common Feasible Intersection Region (Miền nghiệm chung) */}
          {showCommonFeasibleRegion && commonPolygonSvg && (
            <g className="common-feasible-region">
              {/* Solid Vibrant Emerald Base */}
              <polygon
                points={commonPolygonSvg}
                fill="#10B981"
                fillOpacity="0.28"
                stroke="#047857"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Pattern Hatching Accent */}
              <polygon
                points={commonPolygonSvg}
                fill="url(#common-hatch)"
                stroke="none"
              />
            </g>
          )}

          {/* Ox and Oy Axes */}
          <g className="axes" stroke="#334155" strokeWidth="1.75">
            <line x1={0} y1={originSvg.y} x2={dimensions.width - 6} y2={originSvg.y} markerEnd="url(#axis-arrow-sys)" />
            <line x1={originSvg.x} y1={dimensions.height} x2={originSvg.x} y2={8} markerEnd="url(#axis-arrow-sys)" />
          </g>

          {/* Ticks & Labels */}
          <g className="ticks select-none font-mono text-[11px]" fill="#64748B">
            <text x={dimensions.width - 16} y={originSvg.y - 8} fill="#0F172A" fontWeight="bold" fontSize="13">x</text>
            <text x={originSvg.x + 8} y={16} fill="#0F172A" fontWeight="bold" fontSize="13">y</text>
            <text x={originSvg.x - 14} y={originSvg.y + 16} fill="#334155" fontWeight="bold" fontSize="12">O</text>

            {gridLinesX.map(x => {
              if (x === 0) return null;
              const s = mathToSvg({ x, y: 0 });
              if (s.x < 20 || s.x > dimensions.width - 25) return null;
              return (
                <g key={`tx-${x}`}>
                  <line x1={s.x} y1={originSvg.y - 3} x2={s.x} y2={originSvg.y + 3} stroke="#475569" strokeWidth="1.2" />
                  <text x={s.x} y={originSvg.y + 16} textAnchor="middle">{x}</text>
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
                  <text x={originSvg.x - 8} y={s.y + 4} textAnchor="end">{y}</text>
                </g>
              );
            })}
          </g>

          {/* Boundary Lines for each inequality in system */}
          {showBoundaryLines && system.map((ineq, idx) => {
            if (ineq.showLine === false) return null;
            const seg = getLineSegmentInBox(ineq.a, ineq.b, ineq.c, bounds);
            if (!seg) return null;

            const p1 = mathToSvg(seg[0]);
            const p2 = mathToSvg(seg[1]);
            const isStrict = ineq.op === '<' || ineq.op === '>';

            return (
              <g key={`line-${ineq.id}-${idx}`} className="boundary-line">
                {/* Glow/halo */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={ineq.color}
                  strokeWidth="5"
                  strokeOpacity="0.16"
                />
                {/* Main line */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={ineq.color}
                  strokeWidth="2.5"
                  strokeDasharray={isStrict ? '7 5' : undefined}
                />
              </g>
            );
          })}

          {/* Intersections & Feasible Vertices */}
          {showIntersections && analysis.intersections.map((inter, idx) => {
            if (showFeasibleVerticesOnly && !inter.isFeasible) return null;

            const ptSvg = mathToSvg(inter.point);
            if (ptSvg.x < -20 || ptSvg.x > dimensions.width + 20 || ptSvg.y < -20 || ptSvg.y > dimensions.height + 20) {
              return null;
            }

            const isFeasible = inter.isFeasible;
            const isHighlight = highlightVertex && Math.hypot(highlightVertex.x - inter.point.x, highlightVertex.y - inter.point.y) < 1e-4;

            return (
              <g
                key={`inter-${inter.id}-${idx}`}
                className="intersection-marker cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  onSelectIntersection?.(inter);
                }}
              >
                {isFeasible ? (
                  <>
                    {/* Feasible Vertex Glow & Outer Ring */}
                    <circle cx={ptSvg.x} cy={ptSvg.y} r={isHighlight ? 16 : 12} fill="#10B981" fillOpacity="0.25" className="animate-pulse" />
                    <circle cx={ptSvg.x} cy={ptSvg.y} r="6.5" fill="#059669" stroke="#FFFFFF" strokeWidth="2.5" />
                    {/* Vertex Label Badge */}
                    <g transform={`translate(${ptSvg.x + 8}, ${ptSvg.y - 18})`}>
                      <rect x="0" y="0" width="76" height="20" rx="5" fill="#064E3B" fillOpacity="0.9" />
                      <text x="38" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFFFFF" className="font-mono">
                        {inter.vertexLabel || 'Đỉnh'}{formatPointCoord(inter.point)}
                      </text>
                    </g>
                  </>
                ) : (
                  <>
                    {/* Infeasible Intersection (cross) */}
                    <circle cx={ptSvg.x} cy={ptSvg.y} r="4.5" fill="#EF4444" fillOpacity="0.75" stroke="#FFFFFF" strokeWidth="1.5" />
                    <text x={ptSvg.x + 6} y={ptSvg.y - 6} fontSize="9" fontWeight="bold" fill="#991B1B" className="font-mono">
                      {formatPointCoord(inter.point)}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Test Point M(x, y) */}
          {showPointM && (
            <g
              className="point-m cursor-grab active:cursor-grabbing"
              transform={`translate(${mSvg.x}, ${mSvg.y})`}
            >
              <circle
                r="18"
                fill={pointMStatus.satisfiesAll ? '#10B981' : '#EF4444'}
                fillOpacity="0.22"
                className="animate-ping"
                style={{ animationDuration: '2.5s' }}
              />
              <circle
                r="12"
                fill={pointMStatus.satisfiesAll ? '#10B981' : '#EF4444'}
                fillOpacity="0.35"
              />
              <circle
                r="7"
                fill={pointMStatus.satisfiesAll ? '#10B981' : '#EF4444'}
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
              <g transform="translate(12, -18)">
                <rect
                  x="0"
                  y="0"
                  width={pointMStatus.satisfiesAll ? 130 : 136}
                  height="24"
                  rx="6"
                  fill={pointMStatus.satisfiesAll ? '#065F46' : '#991B1B'}
                  fillOpacity="0.94"
                />
                <text
                  x={pointMStatus.satisfiesAll ? 65 : 68}
                  y="16"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#FFFFFF"
                  className="font-mono select-none"
                >
                  M({pointM.x}; {pointM.y}) {pointMStatus.satisfiesAll ? 'Thỏa hệ ✓' : 'Không thỏa ✗'}
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Legend bar inside graph */}
        <div className="absolute bottom-2 left-2 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-200 text-[11px] text-slate-700 shadow-xs">
          <MousePointer className="w-3.5 h-3.5 text-blue-600" />
          <span>Kéo điểm M hoặc bấm lên hệ trục để kiểm tra nghiệm của hệ</span>
        </div>
      </div>
    </div>
  );
};
