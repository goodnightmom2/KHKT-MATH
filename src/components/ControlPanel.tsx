import React from 'react';
import { ComparisonOperator, Inequality, Point2D, ShadingMode } from '../types/math';
import { formatInequality, formatBoundaryLine } from '../math/mathEngine';
import { RotateCcw, Sparkles, Layers, Sliders, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ControlPanelProps {
  inequality: Inequality;
  onInequalityChange: (ineq: Inequality) => void;
  pointM: Point2D;
  onPointChange: (pt: Point2D) => void;
  shadingMode: ShadingMode;
  onShadingModeChange: (mode: ShadingMode) => void;
  onReset: () => void;
}

const PRESET_INEQUALITIES: {
  label: string;
  tag: string;
  ineq: Inequality;
  suggestedPoints?: { label: string; pt: Point2D }[];
}[] = [
  {
    label: 'Ca A: 2x + y ≤ 6',
    tag: 'Chuẩn SGK',
    ineq: { id: 'preset-a', a: 2, b: 1, op: '<=', c: 6 },
    suggestedPoints: [
      { label: 'M(2; 1)', pt: { x: 2, y: 1 } },
      { label: 'M(3; 2)', pt: { x: 3, y: 2 } }
    ]
  },
  {
    label: 'Ca B: x + y < 4',
    tag: 'Nét đứt, thử M(2;2)',
    ineq: { id: 'preset-b', a: 1, b: 1, op: '<', c: 4 },
    suggestedPoints: [
      { label: 'M(2; 2) [Trên bờ]', pt: { x: 2, y: 2 } },
      { label: 'M(1; 1) [Nghiệm]', pt: { x: 1, y: 1 } }
    ]
  },
  {
    label: 'Ca C: x ≤ 3',
    tag: 'Đường thẳng đứng',
    ineq: { id: 'preset-c', a: 1, b: 0, op: '<=', c: 3 },
    suggestedPoints: [
      { label: 'M(1; 2) [Bên trái]', pt: { x: 1, y: 2 } },
      { label: 'M(4; 0) [Bên phải]', pt: { x: 4, y: 0 } }
    ]
  },
  {
    label: 'Ca D: y ≥ -2',
    tag: 'Đường nằm ngang',
    ineq: { id: 'preset-d', a: 0, b: 1, op: '>=', c: -2 },
    suggestedPoints: [
      { label: 'M(0; 1) [Phía trên]', pt: { x: 0, y: 1 } },
      { label: 'M(0; -3) [Phía dưới]', pt: { x: 0, y: -3 } }
    ]
  },
  {
    label: 'Ca E: x + y > 0',
    tag: 'Đi qua O(0;0)',
    ineq: { id: 'preset-e', a: 1, b: 1, op: '>', c: 0 },
    suggestedPoints: [
      { label: 'O(0; 0) [Trên bờ]', pt: { x: 0, y: 0 } },
      { label: 'A(1; 0) [Điểm thử chuẩn]', pt: { x: 1, y: 0 } },
      { label: 'B(-1; 0) [Điểm thử ngoài]', pt: { x: -1, y: 0 } }
    ]
  }
];

const BASE_TEST_POINTS: { label: string; pt: Point2D; desc: string }[] = [
  { label: 'O(0; 0)', pt: { x: 0, y: 0 }, desc: 'Gốc tọa độ' },
  { label: 'P(1; 0)', pt: { x: 1, y: 0 }, desc: 'Điểm trên trục Ox' },
  { label: 'Q(0; 1)', pt: { x: 0, y: 1 }, desc: 'Điểm trên trục Oy' },
  { label: 'A(2; 1)', pt: { x: 2, y: 1 }, desc: 'Điểm thử A' },
  { label: 'B(2; 2)', pt: { x: 2, y: 2 }, desc: 'Điểm thử B' },
  { label: 'C(3; 2)', pt: { x: 3, y: 2 }, desc: 'Điểm thử C' },
  { label: 'D(-1; 2)', pt: { x: -1, y: 2 }, desc: 'Tọa độ âm' }
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  inequality,
  onInequalityChange,
  pointM,
  onPointChange,
  shadingMode,
  onShadingModeChange,
  onReset
}) => {
  const isBothZero = inequality.a === 0 && inequality.b === 0;

  const handleCoefficientChange = (field: 'a' | 'b' | 'c', valStr: string) => {
    const val = Number(valStr);
    if (isNaN(val)) return;

    if (field === 'a' && val === 0 && inequality.b === 0) {
      // Prevent both 0
      return;
    }
    if (field === 'b' && val === 0 && inequality.a === 0) {
      // Prevent both 0
      return;
    }

    onInequalityChange({
      ...inequality,
      [field]: val
    });
  };

  const handleOperatorChange = (op: ComparisonOperator) => {
    onInequalityChange({
      ...inequality,
      op
    });
  };

  return (
    <div className="flex flex-col gap-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-slate-800">
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Thiết lập Bất phương trình</h3>
            <p className="text-xs text-slate-500">Dạng tổng quát: ax + by ≤ c</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors"
          title="Đặt lại về bất phương trình mẫu 2x + y ≤ 6"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* Preset selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Bài toán mẫu có sẵn:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {PRESET_INEQUALITIES.map((preset, idx) => {
            const isSelected =
              inequality.a === preset.ineq.a &&
              inequality.b === preset.ineq.b &&
              inequality.op === preset.ineq.op &&
              inequality.c === preset.ineq.c;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onInequalityChange(preset.ineq);
                  if (preset.suggestedPoints && preset.suggestedPoints.length > 0) {
                    onPointChange(preset.suggestedPoints[0].pt);
                  }
                }}
                className={`text-left text-xs font-medium px-3 py-2 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 text-blue-800 shadow-xs ring-1 ring-blue-400'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="font-semibold text-slate-900">{preset.label}</div>
                <div className="text-[10px] text-blue-600 mt-0.5">{preset.tag}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inequality Coefficients Form */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Hệ số & Dấu bất phương trình
          </span>
          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded">
            {formatInequality(inequality)}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 items-center">
          {/* Coefficient a */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 text-center">
              Hệ số a (gắn với x)
            </label>
            <input
              type="number"
              value={inequality.a}
              onChange={e => handleCoefficientChange('a', e.target.value)}
              step="1"
              className="w-full text-center font-bold text-base bg-white border border-slate-300 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Coefficient b */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 text-center">
              Hệ số b (gắn với y)
            </label>
            <input
              type="number"
              value={inequality.b}
              onChange={e => handleCoefficientChange('b', e.target.value)}
              step="1"
              className="w-full text-center font-bold text-base bg-white border border-slate-300 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Comparison Operator */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 text-center">
              Dấu so sánh
            </label>
            <select
              value={inequality.op}
              onChange={e => handleOperatorChange(e.target.value as ComparisonOperator)}
              className="w-full text-center font-bold text-base bg-white border border-slate-300 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="<=">≤</option>
              <option value="<">&lt;</option>
              <option value=">=">≥</option>
              <option value=">">&gt;</option>
            </select>
          </div>

          {/* Constant c */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 text-center">
              Hệ số tự do c
            </label>
            <input
              type="number"
              value={inequality.c}
              onChange={e => handleCoefficientChange('c', e.target.value)}
              step="1"
              className="w-full text-center font-bold text-base bg-white border border-slate-300 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {isBothZero && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Quy tắc: a và b không được đồng thời bằng 0!</span>
          </div>
        )}

        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Đường thẳng biên (d): <strong>{formatBoundaryLine(inequality.a, inequality.b, inequality.c)}</strong></span>
          <span className="text-blue-600 font-medium">
            {inequality.op === '<=' || inequality.op === '>=' ? 'Lấy bờ (nét liền)' : 'Không lấy bờ (nét đứt)'}
          </span>
        </div>
      </div>

      {/* Point M Coordinates Section */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tọa độ điểm thử M(x; y)
            </span>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            M({pointM.x}; {pointM.y})
          </span>
        </div>

        {/* X and Y coordinate controls */}
        <div className="space-y-3">
          {/* X Control */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1 font-medium">
              <span className="text-slate-600">Hoành độ x:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {pointM.x}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-6"
                max="6"
                step="0.5"
                value={pointM.x}
                onChange={e => onPointChange({ ...pointM, x: parseFloat(e.target.value) })}
                className="flex-1 accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <input
                type="number"
                value={pointM.x}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) onPointChange({ ...pointM, x: val });
                }}
                step="0.5"
                className="w-16 text-center font-mono text-xs bg-white border border-slate-300 rounded px-1.5 py-1 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Y Control */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1 font-medium">
              <span className="text-slate-600">Tung độ y:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {pointM.y}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-6"
                max="6"
                step="0.5"
                value={pointM.y}
                onChange={e => onPointChange({ ...pointM, y: parseFloat(e.target.value) })}
                className="flex-1 accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <input
                type="number"
                value={pointM.y}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) onPointChange({ ...pointM, y: val });
                }}
                step="0.5"
                className="w-16 text-center font-mono text-xs bg-white border border-slate-300 rounded px-1.5 py-1 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Test Points */}
        <div className="mt-3 pt-3 border-t border-slate-200/70">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-semibold text-slate-500">
              Điểm kiểm tra nhanh:
            </label>
            {Math.abs(inequality.c) < 1e-6 && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Đường bờ đi qua O(0;0)
              </span>
            )}
          </div>

          {Math.abs(inequality.c) < 1e-6 && (
            <div className="mb-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Quy tắc SGK:</strong> Đường thẳng bờ đi qua gốc O(0; 0), <strong>không thể lấy O làm điểm thử</strong>. Hãy chọn điểm thử như <strong>P(1; 0)</strong> hoặc <strong>Q(0; 1)</strong>!
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {BASE_TEST_POINTS.map((tp, idx) => {
              const isCurrent = pointM.x === tp.pt.x && pointM.y === tp.pt.y;
              const isOriginOnLine = Math.abs(inequality.c) < 1e-6 && tp.pt.x === 0 && tp.pt.y === 0;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onPointChange(tp.pt)}
                  title={isOriginOnLine ? 'O nằm trên bờ, không phân biệt được 2 nửa mặt phẳng' : tp.desc}
                  className={`text-xs px-2.5 py-1 rounded-lg font-mono font-medium transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isOriginOnLine
                      ? 'bg-amber-50 border border-amber-300 text-amber-800 line-through'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {tp.label}
                  {isOriginOnLine && ' (Trên bờ)'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shading mode selector (SGK Việt Nam vs Modern Lab) */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          Quy ước biểu diễn miền nghiệm:
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onShadingModeChange('solution')}
            className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
              shadingMode === 'solution'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tô sáng miền nghiệm
          </button>
          <button
            type="button"
            onClick={() => onShadingModeChange('exclusion')}
            className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
              shadingMode === 'exclusion'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Gạch bỏ phần loại (SGK)
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">
          {shadingMode === 'solution'
            ? 'Vùng xanh lam sáng là tập hợp các điểm thỏa mãn bất phương trình.'
            : 'Chuẩn SGK Toán 10 Việt Nam: gạch chéo phần không thỏa mãn, nửa mặt phẳng trắng là miền nghiệm.'}
        </p>
      </div>
    </div>
  );
};
