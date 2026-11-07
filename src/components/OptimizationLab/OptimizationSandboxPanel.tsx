import React from 'react';
import { ComparisonOperator, ObjectiveFunction, RealWorldScenario, SystemInequality } from '../../types/math';
import { formatBoundaryLine, formatInequality } from '../../math/mathEngine';
import { Plus, Trash2, Eye, EyeOff, RotateCcw, Target, Sparkles, Sliders } from 'lucide-react';

interface OptimizationSandboxPanelProps {
  scenario: RealWorldScenario;
  onScenarioChange: (newScenario: RealWorldScenario) => void;
  onSelectScenario: (scenarioId: string) => void;
}

const PRESET_COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626'];

export const OptimizationSandboxPanel: React.FC<OptimizationSandboxPanelProps> = ({
  scenario,
  onScenarioChange,
  onSelectScenario
}) => {
  const { objective, system } = scenario;

  // Update objective function
  const handleUpdateObjective = (patch: Partial<ObjectiveFunction>) => {
    const updatedObj = { ...objective, ...patch };
    // update label string
    updatedObj.label = `${updatedObj.name ? updatedObj.name.charAt(0) : 'P'}(x; y) = ${updatedObj.cx}x + ${updatedObj.cy}y`;
    onScenarioChange({
      ...scenario,
      objective: updatedObj
    });
  };

  // Update a constraint
  const handleUpdateConstraint = (idx: number, patch: Partial<SystemInequality>) => {
    const updatedSystem = system.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    onScenarioChange({
      ...scenario,
      system: updatedSystem
    });
  };

  // Add constraint
  const handleAddConstraint = () => {
    if (system.length >= 6) return;
    const nextIdx = system.length;
    const color = PRESET_COLORS[nextIdx % PRESET_COLORS.length];
    const newIneq: SystemInequality = {
      id: `ineq-${Date.now()}`,
      a: 1,
      b: 1,
      op: '<=',
      c: 10,
      color,
      label: `(d${nextIdx + 1})`,
      showLine: true,
      showFill: true
    };
    onScenarioChange({
      ...scenario,
      system: [...system, newIneq]
    });
  };

  // Remove constraint (keep at least 2)
  const handleRemoveConstraint = (idx: number) => {
    if (system.length <= 2) return;
    const updatedSystem = system
      .filter((_, i) => i !== idx)
      .map((item, i) => ({ ...item, label: `(d${i + 1})` }));
    onScenarioChange({
      ...scenario,
      system: updatedSystem
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col gap-4">
      {/* 1. Objective Function Editor */}
      <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-extrabold text-xs text-purple-900">
            <Target className="w-4 h-4 text-purple-700" />
            <span>Hàm Mục Tiêu F(x; y)</span>
          </div>

          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-purple-200 text-xs">
            <button
              type="button"
              onClick={() => handleUpdateObjective({ goal: 'max' })}
              className={`px-2.5 py-0.5 rounded font-bold text-[10px] cursor-pointer transition ${
                objective.goal === 'max'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MAX (Lớn nhất)
            </button>
            <button
              type="button"
              onClick={() => handleUpdateObjective({ goal: 'min' })}
              className={`px-2.5 py-0.5 rounded font-bold text-[10px] cursor-pointer transition ${
                objective.goal === 'min'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MIN (Nhỏ nhất)
            </button>
          </div>
        </div>

        {/* cx and cy inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-purple-900 mb-0.5">Hệ số x (cx)</label>
            <input
              type="number"
              value={objective.cx}
              onChange={e => handleUpdateObjective({ cx: parseFloat(e.target.value) || 0 })}
              className="w-full text-center font-bold text-xs bg-white border border-purple-300 rounded-lg py-1.5 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-purple-900 mb-0.5">Hệ số y (cy)</label>
            <input
              type="number"
              value={objective.cy}
              onChange={e => handleUpdateObjective({ cy: parseFloat(e.target.value) || 0 })}
              className="w-full text-center font-bold text-xs bg-white border border-purple-300 rounded-lg py-1.5 focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="text-[11px] font-mono text-purple-950 font-bold text-center">
          {objective.name}: <span className="text-purple-800">{objective.label} → {objective.goal.toUpperCase()}</span> ({objective.unit})
        </div>

        {/* Continuous vs Integer Domain Toggle */}
        <div className="pt-2 border-t border-purple-200/70 flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] font-bold text-purple-900">Miền xác định biến (x, y):</span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-purple-200">
            <button
              type="button"
              onClick={() => onScenarioChange({ ...scenario, integerRequired: false })}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                !scenario.integerRequired
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Liên tục (ℝ)
            </button>
            <button
              type="button"
              onClick={() => onScenarioChange({ ...scenario, integerRequired: true })}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                scenario.integerRequired
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nguyên (ℕ)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Constraints List Editor */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-extrabold text-xs text-slate-800">
            Hệ Ràng Buộc ({system.length}/6 BPT)
          </span>

          <button
            type="button"
            onClick={handleAddConstraint}
            disabled={system.length >= 6}
            className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm BPT</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
          {system.map((ineq, idx) => (
            <div
              key={ineq.id}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ineq.color }} />
                  <span className="font-mono text-xs font-bold text-slate-700">BPT ({idx + 1}):</span>
                  <span className="font-mono text-xs font-extrabold text-purple-900">{formatInequality(ineq)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateConstraint(idx, { showLine: ineq.showLine === false ? true : false })}
                    className={`p-1 rounded-md border text-xs cursor-pointer ${
                      ineq.showLine !== false ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-slate-100 text-slate-400'
                    }`}
                    title={ineq.showLine !== false ? 'Hiện bờ' : 'Ẩn bờ'}
                  >
                    {ineq.showLine !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>

                  <button
                    type="button"
                    disabled={system.length <= 2}
                    onClick={() => handleRemoveConstraint(idx)}
                    className="p-1 rounded-md border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 disabled:opacity-20 cursor-pointer"
                    title="Xóa BPT"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Ineq inputs */}
              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 mb-0.5 text-center">a</label>
                  <input
                    type="number"
                    value={ineq.a}
                    onChange={e => handleUpdateConstraint(idx, { a: parseFloat(e.target.value) || 0 })}
                    className="w-full text-center font-bold text-xs bg-white border border-slate-300 rounded py-1"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 mb-0.5 text-center">b</label>
                  <input
                    type="number"
                    value={ineq.b}
                    onChange={e => handleUpdateConstraint(idx, { b: parseFloat(e.target.value) || 0 })}
                    className="w-full text-center font-bold text-xs bg-white border border-slate-300 rounded py-1"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 mb-0.5 text-center">Dấu</label>
                  <select
                    value={ineq.op}
                    onChange={e => handleUpdateConstraint(idx, { op: e.target.value as ComparisonOperator })}
                    className="w-full text-center font-bold text-xs bg-white border border-slate-300 rounded py-1"
                  >
                    <option value="<=">≤</option>
                    <option value="<">&lt;</option>
                    <option value=">=">≥</option>
                    <option value=">">&gt;</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 mb-0.5 text-center">c</label>
                  <input
                    type="number"
                    value={ineq.c}
                    onChange={e => handleUpdateConstraint(idx, { c: parseFloat(e.target.value) || 0 })}
                    className="w-full text-center font-bold text-xs bg-white border border-slate-300 rounded py-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Regression & Special Cases Quick Presets */}
      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
        <span className="font-extrabold text-[11px] text-slate-700 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Bộ Kiểm Thử Chuẩn & Trường Hợp Đặc Biệt:</span>
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onSelectScenario('scenario-1')}
            className="p-2 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-left text-[11px] font-semibold text-slate-800 transition cursor-pointer"
          >
            <div className="font-bold text-purple-900">1. Mẫu Sản Xuất A&B</div>
            <div className="text-[10px] text-slate-500 font-mono">B(8/3; 8/3) → 560/3</div>
          </button>

          <button
            type="button"
            onClick={() => onSelectScenario('scenario-3')}
            className="p-2 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-left text-[11px] font-semibold text-slate-800 transition cursor-pointer"
          >
            <div className="font-bold text-purple-900">2. Cực Tiểu MIN</div>
            <div className="text-[10px] text-slate-500 font-mono">(18/5; 14/5) → 85,2</div>
          </button>

          <button
            type="button"
            onClick={() => onSelectScenario('scenario-5')}
            className="p-2 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-left text-[11px] font-semibold text-slate-800 transition cursor-pointer"
          >
            <div className="font-bold text-purple-900">3. Vô Số Nghiệm Tối Ưu</div>
            <div className="text-[10px] text-slate-500 font-mono">Đoạn nối B(6;4)-C(0;8)</div>
          </button>

          <button
            type="button"
            onClick={() =>
              onScenarioChange({
                ...scenario,
                id: 'special-unbounded',
                title: 'TH Đặc Biệt: Miền Không Bị Chặn (+∞)',
                integerRequired: false,
                system: [
                  { id: 'u1', a: 2, b: 1, op: '>=', c: 10, color: '#2563EB', label: '(d1)', showLine: true, showFill: true },
                  { id: 'u2', a: 1, b: 3, op: '>=', c: 12, color: '#7C3AED', label: '(d2)', showLine: true, showFill: true },
                  { id: 'u3', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: '(d3)', showLine: true, showFill: true },
                  { id: 'u4', a: 0, b: 1, op: '>=', c: 0, color: '#D97706', label: '(d4)', showLine: true, showFill: true }
                ],
                objective: { cx: 30, cy: 40, label: 'P(x; y) = 30x + 40y', name: 'Hàm mục tiêu', unit: 'đơn vị', goal: 'max' }
              })
            }
            className="p-2 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-left text-[11px] font-semibold text-slate-800 transition cursor-pointer"
          >
            <div className="font-bold text-amber-800">4. Không Bị Chặn (+∞)</div>
            <div className="text-[10px] text-slate-500 font-mono">Không đạt GTLN</div>
          </button>

          <button
            type="button"
            onClick={() =>
              onScenarioChange({
                ...scenario,
                id: 'special-empty',
                title: 'TH Đặc Biệt: Miền Khả Thi Rỗng (∅)',
                integerRequired: false,
                system: [
                  { id: 'e1', a: 1, b: 1, op: '<=', c: 4, color: '#2563EB', label: '(d1)', showLine: true, showFill: true },
                  { id: 'e2', a: 1, b: 1, op: '>=', c: 6, color: '#DC2626', label: '(d2)', showLine: true, showFill: true },
                  { id: 'e3', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: '(d3)', showLine: true, showFill: true },
                  { id: 'e4', a: 0, b: 1, op: '>=', c: 0, color: '#D97706', label: '(d4)', showLine: true, showFill: true }
                ],
                objective: { cx: 30, cy: 40, label: 'P(x; y) = 30x + 40y', name: 'Lợi nhuận', unit: 'nghìn đồng', goal: 'max' }
              })
            }
            className="p-2 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-left text-[11px] font-semibold text-slate-800 transition cursor-pointer"
          >
            <div className="font-bold text-rose-800">5. Miền Rỗng (∅)</div>
            <div className="text-[10px] text-slate-500 font-mono">x+y ≤ 4 &amp; x+y ≥ 6</div>
          </button>

          <button
            type="button"
            onClick={() =>
              onScenarioChange({
                ...scenario,
                id: 'special-strict',
                title: 'TH Đặc Biệt: Biên Mở Nghiêm Ngặt (<)',
                integerRequired: true,
                system: [
                  { id: 'st1', a: 2, b: 1, op: '<', c: 8, color: '#DC2626', label: '(d1)', showLine: true, showFill: true },
                  { id: 'st2', a: 1, b: 2, op: '<', c: 8, color: '#7C3AED', label: '(d2)', showLine: true, showFill: true },
                  { id: 'st3', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: '(d3)', showLine: true, showFill: true },
                  { id: 'st4', a: 0, b: 1, op: '>=', c: 0, color: '#D97706', label: '(d4)', showLine: true, showFill: true }
                ],
                objective: { cx: 30, cy: 40, label: 'P(x; y) = 30x + 40y', name: 'Lợi nhuận', unit: 'nghìn đồng', goal: 'max' }
              })
            }
            className="p-2 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-left text-[11px] font-semibold text-slate-800 transition cursor-pointer"
          >
            <div className="font-bold text-rose-800">6. Dấu Nghiêm Ngặt (&lt;)</div>
            <div className="text-[10px] text-slate-500 font-mono">B(8/3; 8/3) bị loại</div>
          </button>
        </div>
      </div>
    </div>
  );
};
