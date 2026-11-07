import React, { useState } from 'react';
import { IntersectionPoint, Point2D, SystemAnalysisResult } from '../../types/math';
import { formatPointCoord } from '../../math/systemMathEngine';
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, Eye, Target, Compass } from 'lucide-react';

interface SystemIntersectionTableProps {
  analysis: SystemAnalysisResult;
  onHighlightVertex?: (pt: Point2D | null) => void;
}

export const SystemIntersectionTable: React.FC<SystemIntersectionTableProps> = ({
  analysis,
  onHighlightVertex
}) => {
  const [activeTab, setActiveTab] = useState<'vertices' | 'all_intersections'>('vertices');

  const { intersections, orderedPolygon, regionType, sgkSummary } = analysis;
  const feasibleIntersections = intersections.filter(i => i.isFeasible);
  const infeasibleIntersections = intersections.filter(i => !i.isFeasible);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('vertices')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'vertices'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đỉnh Miền Nghiệm ({feasibleIntersections.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all_intersections')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all_intersections'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Tất Cả Giao Điểm ({intersections.length})</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-500 font-semibold hidden sm:inline">
          {regionType === 'bounded_polygon' ? 'Đa giác bị chặn' : regionType === 'unbounded' ? 'Không bị chặn' : 'Miền rỗng'}
        </span>
      </div>

      {/* Content for Tab: FEASIBLE VERTICES */}
      {activeTab === 'vertices' && (
        <div className="space-y-3">
          {feasibleIntersections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px]">
                    <th className="py-2 px-2.5 font-bold">Đỉnh</th>
                    <th className="py-2 px-2.5 font-bold">Tọa độ (x; y)</th>
                    <th className="py-2 px-2.5 font-bold">Giao của 2 bờ</th>
                    <th className="py-2 px-2.5 font-bold text-center">Kiểm tra hệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feasibleIntersections.map((v, idx) => (
                    <tr
                      key={v.id}
                      onMouseEnter={() => onHighlightVertex?.(v.point)}
                      onMouseLeave={() => onHighlightVertex?.(null)}
                      className="hover:bg-emerald-50/50 transition cursor-pointer"
                    >
                      <td className="py-2.5 px-2.5 font-extrabold text-emerald-800">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-100 text-emerald-900 font-mono text-xs mr-1">
                          {v.vertexLabel || `${idx + 1}`}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 font-mono font-bold text-slate-900">
                        {formatPointCoord(v.point)}
                      </td>
                      <td className="py-2.5 px-2.5 text-slate-600">
                        {v.lineLabels[0]} ∩ {v.lineLabels[1]}
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Thỏa mãn 100%</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Không có đỉnh hữu hạn thỏa mãn hệ:</span>
                <span>
                  {regionType === 'empty'
                    ? 'Hệ bất phương trình có miền nghiệm rỗng (vô nghiệm). Các nửa mặt phẳng không có giao điểm chung nào.'
                    : 'Miền nghiệm của hệ không bị chặn hoặc các đường bờ song song không cắt nhau tạo thành đỉnh đóng.'}
                </span>
              </div>
            </div>
          )}

          {/* SGK Conclusion Summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-800 block mb-1">Tóm tắt hình học chuẩn Toán 10:</span>
            <p className="text-slate-600 leading-relaxed">{sgkSummary}</p>
          </div>
        </div>
      )}

      {/* Content for Tab: ALL INTERSECTIONS */}
      {activeTab === 'all_intersections' && (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-500">
            Một giao điểm của hai đường bờ chỉ trở thành <strong>đỉnh của miền nghiệm</strong> khi nó đồng thời thỏa mãn tất cả các bất phương trình còn lại trong hệ:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px]">
                  <th className="py-2 px-2.5 font-bold">Cặp bờ</th>
                  <th className="py-2 px-2.5 font-bold">Tọa độ</th>
                  <th className="py-2 px-2.5 font-bold text-center">Trạng thái</th>
                  <th className="py-2 px-2.5 font-bold">Lý do sư phạm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {intersections.map(inter => (
                  <tr
                    key={inter.id}
                    onMouseEnter={() => onHighlightVertex?.(inter.point)}
                    onMouseLeave={() => onHighlightVertex?.(null)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="py-2.5 px-2.5 font-bold text-slate-700">
                      {inter.lineLabels[0]} ∩ {inter.lineLabels[1]}
                    </td>
                    <td className="py-2.5 px-2.5 font-mono font-bold text-slate-900">
                      {formatPointCoord(inter.point)}
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      {inter.isFeasible ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đỉnh hợp lệ</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold text-[10px]">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Bị loại</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-600 text-[11px]">
                      {inter.isFeasible ? (
                        <div className="flex flex-col">
                          <span className="text-emerald-700 font-semibold">Thỏa mãn 100% tất cả các BPT trong hệ</span>
                          {inter.cramerSteps && (
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                              D={inter.cramerSteps.D}, Dx={inter.cramerSteps.Dx}, Dy={inter.cramerSteps.Dy}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-rose-700 font-medium">
                            Vi phạm ràng buộc:{' '}
                            {inter.violatedConstraints.map(c => {
                              const ineq = analysis.inequalities[c];
                              if (!ineq) return `(d${c + 1})`;
                              const lhs = Math.round((ineq.a * inter.point.x + ineq.b * inter.point.y) * 100) / 100;
                              return `${ineq.label || `(d${c + 1})`} [${lhs} ${ineq.op} ${ineq.c} là Sai]`;
                            }).join('; ')}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
