import React from 'react';
import { ComparisonOperator, SystemInequality } from '../../types/math';
import { formatBoundaryLine, formatInequality, formatLinearLHS, getOperatorSymbol } from '../../math/mathEngine';
import { SYSTEM_BENCHMARK_PRESETS } from '../../math/systemMathEngine';
import { Plus, Trash2, Eye, EyeOff, RotateCcw, Sparkles, Sliders } from 'lucide-react';

interface SystemInputPanelProps {
  system: SystemInequality[];
  onSystemChange: (newSystem: SystemInequality[]) => void;
  onSelectPreset: (presetId: string) => void;
}

const PRESET_COLORS = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626'];

export const SystemInputPanel: React.FC<SystemInputPanelProps> = ({
  system,
  onSystemChange,
  onSelectPreset
}) => {
  const handleUpdate = (idx: number, patch: Partial<SystemInequality>) => {
    const updated = system.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    onSystemChange(updated);
  };

  const handleAdd = () => {
    if (system.length >= 5) return;
    const nextIdx = system.length;
    const color = PRESET_COLORS[nextIdx % PRESET_COLORS.length];
    const newIneq: SystemInequality = {
      id: `ineq-${Date.now()}`,
      a: 1,
      b: 1,
      op: '<=',
      c: 4,
      color,
      label: `(d${nextIdx + 1})`,
      showLine: true,
      showFill: true
    };
    onSystemChange([...system, newIneq]);
  };

  const handleRemove = (idx: number) => {
    if (system.length <= 2) return; // Keep at least 2 constraints
    const updated = system.filter((_, i) => i !== idx).map((item, i) => ({
      ...item,
      label: `(d${i + 1})`
    }));
    onSystemChange(updated);
  };

  const handleResetToDefault = () => {
    onSelectPreset('preset-1');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <span>Danh Sách Ràng Buộc Hệ</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-bold">
              {system.length}/5 BPT
            </span>
          </h3>
          <p className="text-[11px] text-slate-500">
            Hệ số a, b, dấu so sánh và hằng số c của từng bất phương trình
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={system.length >= 5}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer min-h-[38px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm BPT</span>
        </button>
      </div>

      {/* Constraints Table / List */}
      <div className="flex flex-col gap-2.5">
        {system.map((ineq, idx) => (
          <div
            key={ineq.id}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all flex flex-col gap-2"
          >
            {/* Top row: Label, formula badge, and visibility toggles */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: ineq.color }}
                    title="Màu đại diện của đường biên"
                  />
                  <span className="font-mono text-xs font-bold text-slate-700 shrink-0">
                    BPT ({idx + 1}):
                  </span>
                  <span className="font-mono text-xs font-extrabold text-blue-900 truncate">
                    {formatInequality(ineq)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 ml-5">
                  Đường bờ {ineq.label || `(d${idx + 1})`}: {formatBoundaryLine(ineq.a, ineq.b, ineq.c)} ({ineq.op === '<=' || ineq.op === '>=' ? 'nét liền' : 'nét đứt'})
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Toggle Boundary Line */}
                <button
                  type="button"
                  onClick={() => handleUpdate(idx, { showLine: ineq.showLine === false ? true : false })}
                  className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                    ineq.showLine !== false
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                  title={ineq.showLine !== false ? 'Đang hiện đường biên bờ' : 'Đang ẩn đường biên bờ'}
                >
                  {ineq.showLine !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {/* Remove button (minimum 2 constraints) */}
                <button
                  type="button"
                  disabled={system.length <= 2}
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition cursor-pointer"
                  title="Xóa bất phương trình này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inputs: a, b, op, c */}
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 text-center">a (với x)</label>
                <input
                  type="number"
                  value={ineq.a}
                  onChange={e => handleUpdate(idx, { a: parseFloat(e.target.value) || 0 })}
                  className="w-full text-center font-bold text-xs bg-white border border-slate-300 rounded-lg py-1.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 text-center">b (với y)</label>
                <input
                  type="number"
                  value={ineq.b}
                  onChange={e => handleUpdate(idx, { b: parseFloat(e.target.value) || 0 })}
                  className="w-full text-center font-bold text-xs bg-white border border-slate-300 rounded-lg py-1.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 text-center">Dấu so sánh</label>
                <select
                  value={ineq.op}
                  onChange={e => handleUpdate(idx, { op: e.target.value as ComparisonOperator })}
                  className="w-full text-center font-bold text-xs bg-white border border-slate-300 rounded-lg py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="<=">≤</option>
                  <option value="<">&lt;</option>
                  <option value=">=">≥</option>
                  <option value=">">&gt;</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 text-center">Hằng số c</label>
                <input
                  type="number"
                  value={ineq.c}
                  onChange={e => handleUpdate(idx, { c: parseFloat(e.target.value) || 0 })}
                  className="w-full text-center font-bold text-xs bg-white border border-slate-300 rounded-lg py-1.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Benchmark Presets Quick Selector */}
      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          5 Bài Toán Mẫu Kinh Điển SGK Toán 10:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {SYSTEM_BENCHMARK_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition cursor-pointer"
            >
              <div className="font-bold text-xs text-slate-900">{preset.name}</div>
              <div className="text-[10px] text-blue-700">{preset.tag}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
