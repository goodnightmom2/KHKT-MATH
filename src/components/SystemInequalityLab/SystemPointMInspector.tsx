import React from 'react';
import { Point2D, SystemInequality } from '../../types/math';
import { formatInequality, getOperatorSymbol } from '../../math/mathEngine';
import { checkPointAgainstInequality } from '../../math/systemMathEngine';
import { CheckCircle2, XCircle, AlertCircle, Crosshair, Target } from 'lucide-react';

interface SystemPointMInspectorProps {
  system: SystemInequality[];
  pointM: Point2D;
  onPointMChange: (pt: Point2D) => void;
}

export const SystemPointMInspector: React.FC<SystemPointMInspectorProps> = ({
  system,
  pointM,
  onPointMChange
}) => {
  // Test point M against each constraint
  const results = system.map((ineq, idx) => {
    const res = checkPointAgainstInequality(ineq, pointM);
    return {
      index: idx,
      ineq,
      lhs: Math.round(res.lhs * 100) / 100,
      diff: res.diff,
      satisfies: res.satisfies,
      onBoundary: res.onBoundary,
      strictlyExcluded: res.strictlyExcluded
    };
  });

  const satisfiesSystem = results.every(r => r.satisfies);
  const failedConstraints = results.filter(r => !r.satisfies);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-blue-600" />
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            Kiểm Tra Nghiệm Của Hệ Với Điểm Thử M
          </h3>
        </div>

        <span
          className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
            satisfiesSystem
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-rose-100 text-rose-800 border border-rose-200'
          }`}
        >
          {satisfiesSystem ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          <span>{satisfiesSystem ? 'M thuộc miền nghiệm' : 'M không thuộc miền nghiệm'}</span>
        </span>
      </div>

      {/* Point M Coordinates Input */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Tọa độ điểm thử M:</span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <label className="text-[11px] text-slate-500 font-semibold">x =</label>
              <input
                type="number"
                value={pointM.x}
                onChange={e => onPointMChange({ ...pointM, x: parseFloat(e.target.value) || 0 })}
                step="0.5"
                className="w-16 text-center font-bold text-xs bg-white border border-slate-300 rounded-lg py-1 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-[11px] text-slate-500 font-semibold">y =</label>
              <input
                type="number"
                value={pointM.y}
                onChange={e => onPointMChange({ ...pointM, y: parseFloat(e.target.value) || 0 })}
                step="0.5"
                className="w-16 text-center font-bold text-xs bg-white border border-slate-300 rounded-lg py-1 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quick presets for point M */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[10px] text-slate-400 font-semibold">Điểm mẫu:</span>
          <button
            type="button"
            onClick={() => onPointMChange({ x: 0, y: 0 })}
            className="px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 font-mono text-[11px] cursor-pointer"
          >
            O(0;0)
          </button>
          <button
            type="button"
            onClick={() => onPointMChange({ x: 1, y: 1 })}
            className="px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 font-mono text-[11px] cursor-pointer"
          >
            (1;1)
          </button>
          <button
            type="button"
            onClick={() => onPointMChange({ x: 2, y: 3 })}
            className="px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 font-mono text-[11px] cursor-pointer"
          >
            (2;3)
          </button>
        </div>
      </div>

      {/* Constraints Test Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px]">
              <th className="py-2 px-2.5 font-bold">Ràng buộc</th>
              <th className="py-2 px-2.5 font-bold">Bất phương trình</th>
              <th className="py-2 px-2.5 font-bold">Thay M({pointM.x}; {pointM.y})</th>
              <th className="py-2 px-2.5 font-bold text-center">Kết luận</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map(r => (
              <tr key={r.ineq.id} className="hover:bg-slate-50/50 transition">
                <td className="py-2 px-2.5 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.ineq.color }} />
                  <span>{r.ineq.label || `(d${r.index + 1})`}</span>
                </td>
                <td className="py-2 px-2.5 font-mono font-medium text-slate-700">
                  {formatInequality(r.ineq)}
                </td>
                <td className="py-2 px-2.5 font-mono text-slate-800">
                  {r.lhs} {getOperatorSymbol(r.ineq.op)} {r.ineq.c}
                </td>
                <td className="py-2 px-2.5 text-center">
                  {r.satisfies ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Đúng</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold text-[10px]">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>Sai</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Explanatory Conclusion Box */}
      <div
        className={`p-3 rounded-xl border text-xs leading-relaxed ${
          satisfiesSystem
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : 'bg-rose-50/80 border-rose-200 text-rose-900'
        }`}
      >
        <span className="font-bold block mb-0.5">
          {satisfiesSystem ? '✓ Điểm M là một nghiệm của hệ:' : '✗ Điểm M không phải là nghiệm của hệ:'}
        </span>
        <span>
          {satisfiesSystem
            ? `Điểm M(${pointM.x}; ${pointM.y}) đồng thời thỏa mãn tất cả ${system.length} bất phương trình. Do đó M nằm trong miền nghiệm chung của hệ.`
            : `Điểm M(${pointM.x}; ${pointM.y}) đã vi phạm ${failedConstraints.length} ràng buộc: ${failedConstraints
                .map(f => `${f.ineq.label || `(d${f.index + 1})`} [${f.lhs} không thỏa ${getOperatorSymbol(f.ineq.op)} ${f.ineq.c}]`)
                .join(', ')}. Để là nghiệm của hệ, điểm M bắt buộc phải thỏa mãn đồng thời toàn bộ các bất phương trình!`}
        </span>
      </div>
    </div>
  );
};
