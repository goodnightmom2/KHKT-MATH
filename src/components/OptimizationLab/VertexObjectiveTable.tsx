import React, { useState, useEffect } from 'react';
import { OptimizationResult, Point2D, RealWorldScenario, VertexEvaluation } from '../../types/math';
import {
  checkPointAgainstSystem,
  formatCoord,
  formatPointCoord,
  formatValueWithApprox,
  parseCoordinateInput
} from '../../math/systemMathEngine';
import { formatInequality } from '../../math/mathEngine';
import {
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  Calculator,
  HelpCircle,
  Target,
  Eye,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

interface VertexObjectiveTableProps {
  scenario: RealWorldScenario;
  result: OptimizationResult;
  onHighlightVertex?: (pt: Point2D | null) => void;
  onSelectKValue?: (k: number) => void;
  defaultRevealed?: boolean;
  onAllVerifiedChange?: (allVerified: boolean) => void;
}

export const VertexObjectiveTable: React.FC<VertexObjectiveTableProps> = ({
  scenario,
  result,
  onHighlightVertex,
  onSelectKValue,
  defaultRevealed = false,
  onAllVerifiedChange
}) => {
  const { objective, system } = scenario;
  const {
    vertexEvaluations,
    optimalValue,
    optimalPoints,
    integerPoints,
    integerOptimalPoint,
    integerOptimalValue
  } = result;

  // Student calculation inputs per vertex label
  const [studentInputs, setStudentInputs] = useState<Record<string, string>>({});
  const [verifiedVertices, setVerifiedVertices] = useState<
    Record<string, { isCorrect: boolean; message: string }>
  >({});
  const [showSolution, setShowSolution] = useState<boolean>(defaultRevealed);
  const [activeModelTab, setActiveModelTab] = useState<'continuous' | 'integer'>('continuous');

  // Reset student verification state when scenario or system/objective changes
  const systemKey = JSON.stringify(
    system.map(s => `${s.a},${s.b},${s.op},${s.c}`)
  ) + `|${objective.cx},${objective.cy},${objective.goal}`;

  useEffect(() => {
    setStudentInputs({});
    setVerifiedVertices({});
    setShowSolution(defaultRevealed);
    setActiveModelTab('continuous');
  }, [scenario.id, systemKey, defaultRevealed]);

  // Determine whether all vertices have been verified by the student or revealed
  const allVerticesVerified =
    showSolution ||
    (vertexEvaluations.length > 0 &&
      vertexEvaluations.every(ve => verifiedVertices[ve.label]?.isCorrect));

  useEffect(() => {
    onAllVerifiedChange?.(allVerticesVerified);
  }, [allVerticesVerified, onAllVerifiedChange]);

  const verifySingleVertex = (ve: VertexEvaluation, rawInput: string) => {
    const parsed = parseCoordinateInput(rawInput);
    const coordStr = formatPointCoord(ve.vertex);
    const valStr = formatValueWithApprox(ve.value);

    if (parsed === null) {
      return {
        isCorrect: false,
        message: 'Vui lòng nhập số, số thập phân hoặc phân số hợp lệ (VD: 120, 560/3, 186.67)!'
      };
    }

    // Allow exact fraction match or 2-decimal rounded approximation
    const eps = 0.02;
    const isCorrect = Math.abs(parsed - ve.value) <= eps;

    return {
      isCorrect,
      message: isCorrect
        ? `Chính xác! Tại ${ve.label}${coordStr}, giá trị hàm mục tiêu là ${valStr} ${objective.unit}.`
        : `Chưa đúng! Hãy tính lại: ${objective.cx} × (${formatCoord(ve.vertex.x)}) + ${objective.cy} × (${formatCoord(ve.vertex.y)}).`
    };
  };

  const handleCheckVertex = (ve: VertexEvaluation) => {
    const inputStr = studentInputs[ve.label] || '';
    const checkResult = verifySingleVertex(ve, inputStr);
    setVerifiedVertices(prev => ({
      ...prev,
      [ve.label]: checkResult
    }));
  };

  const handleVerifyAllEntered = () => {
    const nextVerified: Record<string, { isCorrect: boolean; message: string }> = {
      ...verifiedVertices
    };
    for (const ve of vertexEvaluations) {
      const inputStr = studentInputs[ve.label] || '';
      nextVerified[ve.label] = verifySingleVertex(ve, inputStr);
    }
    setVerifiedVertices(nextVerified);
  };

  const handleRevealSolution = () => {
    const inputs: Record<string, string> = {};
    const verified: Record<string, { isCorrect: boolean; message: string }> = {};

    for (const ve of vertexEvaluations) {
      inputs[ve.label] = formatCoord(ve.value);
      verified[ve.label] = {
        isCorrect: true,
        message: `Đúng: ${formatValueWithApprox(ve.value)} ${objective.unit}`
      };
    }

    setStudentInputs(inputs);
    setVerifiedVertices(verified);
    setShowSolution(true);
  };

  const handleResetTable = () => {
    setStudentInputs({});
    setVerifiedVertices({});
    setShowSolution(false);
  };

  // Top sorted integer candidates for pedagogical comparison
  const sortedIntegerCandidates = [...integerPoints]
    .sort((a, b) => (objective.goal === 'max' ? b.value - a.value : a.value - b.value))
    .slice(0, 8);

  // Check what happens if the student naively rounds the continuous optimal point
  const naiveRoundedCheck = (() => {
    if (optimalPoints.length === 0) return null;
    const opt = optimalPoints[0];
    const isAlreadyInt =
      Math.abs(opt.x - Math.round(opt.x)) < 1e-6 && Math.abs(opt.y - Math.round(opt.y)) < 1e-6;
    if (isAlreadyInt) return null;

    const rx = Math.round(opt.x);
    const ry = Math.round(opt.y);
    const roundedPt = { x: rx, y: ry };
    const sysCheck = checkPointAgainstSystem(system, roundedPt);
    const violatedIneqs = sysCheck.failedIndices.map(idx => formatInequality(system[idx]));

    return {
      continuousPt: opt,
      roundedPt,
      satisfies: sysCheck.satisfiesSystem,
      violatedIneqs
    };
  })();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col gap-4">
      {/* Header & Model Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-purple-600" />
            <span>Bảng Tính Giá Trị Hàm Mục Tiêu Tại Các Đỉnh</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            Hàm mục tiêu: <strong className="text-purple-900">{objective.label}</strong> (
            {objective.goal === 'max' ? 'Tìm GTLN - MAX' : 'Tìm GTNN - MIN'})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {scenario.integerRequired && (
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveModelTab('continuous')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeModelTab === 'continuous'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Mô hình liên tục (ℝ)
              </button>
              <button
                type="button"
                onClick={() => setActiveModelTab('integer')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeModelTab === 'integer'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>2. Mô hình nguyên (x, y ∈ ℕ)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTINUOUS MODEL TAB */}
      {activeModelTab === 'continuous' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-slate-600">
            <span>
              Nhập giá trị hàm mục tiêu tại từng đỉnh (hỗ trợ phân số như{' '}
              <code className="font-mono font-bold text-purple-800 bg-purple-50 px-1 rounded">
                560/3
              </code>{' '}
              hoặc số thập phân) rồi bấm <strong>Kiểm chứng</strong>:
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleVerifyAllEntered}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition cursor-pointer shadow-2xs"
              >
                Kiểm chứng tất cả
              </button>
              <button
                type="button"
                onClick={handleRevealSolution}
                className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>Hiện lời giải</span>
              </button>
              {(Object.keys(verifiedVertices).length > 0 || showSolution) && (
                <button
                  type="button"
                  onClick={handleResetTable}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer"
                  title="Làm lại bảng tính"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {vertexEvaluations.length === 0 ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-semibold">
              Hệ bất phương trình không có đỉnh khả thi (Miền nghiệm rỗng ∅).
            </div>
          ) : (
            <>
              {/* Mobile Card View for Students on Phones (< 768px) */}
              <div className="md:hidden flex flex-col gap-2.5">
                {vertexEvaluations.map(ve => {
                  const check = verifiedVertices[ve.label];
                  const isRowVerified = check?.isCorrect || showSolution;
                  const showOptimalHighlight = allVerticesVerified && ve.isOptimal;
                  const unverifiedPrompt = `${objective.cx} × (${formatCoord(
                    ve.vertex.x
                  )}) + ${objective.cy} × (${formatCoord(ve.vertex.y)}) = ?`;

                  return (
                    <div
                      key={ve.label}
                      onClick={() => onHighlightVertex?.(ve.vertex)}
                      className={`p-3 rounded-xl border transition ${
                        showOptimalHighlight
                          ? 'border-purple-400 bg-purple-50/80 ring-1 ring-purple-300'
                          : isRowVerified
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-slate-200 bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono text-xs font-bold ${
                              showOptimalHighlight
                                ? 'bg-purple-600 text-white'
                                : ve.isStrictlyExcluded
                                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                : 'bg-white border border-slate-200 text-slate-800'
                            }`}
                          >
                            {ve.label}
                          </span>
                          <span className="font-mono font-extrabold text-xs text-slate-900">
                            {formatPointCoord(ve.vertex)}
                          </span>
                          {ve.isStrictlyExcluded && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                              Biên mở (Loại)
                            </span>
                          )}
                        </div>

                        {showOptimalHighlight ? (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onSelectKValue?.(ve.value);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600 text-white font-extrabold text-[10px] shadow-2xs"
                          >
                            <Award className="w-3 h-3" />
                            <span>{objective.goal === 'max' ? 'GTLN (Tối ưu)' : 'GTNN (Tối ưu)'}</span>
                          </button>
                        ) : isRowVerified ? (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onSelectKValue?.(ve.value);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>F = {formatValueWithApprox(ve.value)}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Chưa tính</span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 mb-2">
                        {isRowVerified ? (
                          <span className="text-slate-900 font-semibold">{ve.substitutionText}</span>
                        ) : (
                          <span className="text-slate-600">Thay số: {unverifiedPrompt}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={studentInputs[ve.label] || ''}
                          placeholder="Nhập giá trị F (VD: 560/3)"
                          onChange={e =>
                            setStudentInputs(prev => ({
                              ...prev,
                              [ve.label]: e.target.value
                            }))
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleCheckVertex(ve);
                          }}
                          className={`flex-1 min-h-[38px] px-2.5 py-1.5 font-mono font-bold text-xs border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                            check
                              ? check.isCorrect
                                ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900'
                                : 'border-rose-400 bg-rose-50/50 text-rose-900'
                              : 'border-slate-300 bg-white text-slate-900'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleCheckVertex(ve)}
                          className="px-3.5 py-2 min-h-[38px] bg-purple-600 active:bg-purple-700 text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer"
                        >
                          Kiểm chứng
                        </button>
                      </div>

                      {check && !check.isCorrect && (
                        <div className="mt-1.5 text-[11px] text-rose-600 font-medium">
                          {check.message}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop / Tablet Table View (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px]">
                    <th className="py-2.5 px-3 font-bold">Đỉnh</th>
                    <th className="py-2.5 px-3 font-bold">Tọa độ (x; y)</th>
                    <th className="py-2.5 px-3 font-bold">Phép thay số vào {objective.label.split('=')[0].trim()}</th>
                    <th className="py-2.5 px-3 font-bold text-center">Nhập giá trị & Kiểm chứng</th>
                    <th className="py-2.5 px-3 font-bold text-center">Kết quả / Cực trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vertexEvaluations.map(ve => {
                    const check = verifiedVertices[ve.label];
                    const isRowVerified = check?.isCorrect || showSolution;
                    const showOptimalHighlight = allVerticesVerified && ve.isOptimal;

                    // Hidden substitution prompt before verification
                    const unverifiedPrompt = `${objective.cx} × (${formatCoord(
                      ve.vertex.x
                    )}) + ${objective.cy} × (${formatCoord(ve.vertex.y)}) = ?`;

                    return (
                      <tr
                        key={ve.label}
                        onMouseEnter={() => onHighlightVertex?.(ve.vertex)}
                        onMouseLeave={() => onHighlightVertex?.(null)}
                        className={`hover:bg-slate-50/80 transition ${
                          showOptimalHighlight ? 'bg-purple-50/70 font-bold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono text-xs font-bold ${
                              showOptimalHighlight
                                ? 'bg-purple-600 text-white'
                                : ve.isStrictlyExcluded
                                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ve.label}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {formatPointCoord(ve.vertex)}
                          {ve.isStrictlyExcluded && (
                            <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                              Biên mở (Loại)
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 font-mono text-slate-700 text-[11px]">
                          {isRowVerified ? (
                            <span className="text-slate-900 font-semibold">{ve.substitutionText}</span>
                          ) : (
                            <span className="text-slate-500">{unverifiedPrompt}</span>
                          )}
                        </td>

                        {/* Student Input / Check */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center justify-center gap-1.5">
                              <input
                                type="text"
                                value={studentInputs[ve.label] || ''}
                                placeholder="VD: 560/3"
                                onChange={e =>
                                  setStudentInputs(prev => ({
                                    ...prev,
                                    [ve.label]: e.target.value
                                  }))
                                }
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleCheckVertex(ve);
                                }}
                                className={`w-24 px-2 py-1 text-center font-mono font-bold text-xs border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                  check
                                    ? check.isCorrect
                                      ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900'
                                      : 'border-rose-400 bg-rose-50/50 text-rose-900'
                                    : 'border-slate-300 bg-white text-slate-900'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => handleCheckVertex(ve)}
                                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded-lg transition cursor-pointer shrink-0"
                              >
                                Kiểm chứng
                              </button>
                            </div>
                            {check && !check.isCorrect && (
                              <span className="text-[10px] text-rose-600 font-medium">
                                {check.message}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status / Conclusion */}
                        <td className="py-2.5 px-3 text-center">
                          {showOptimalHighlight ? (
                            <button
                              type="button"
                              onClick={() => onSelectKValue?.(ve.value)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600 text-white font-extrabold text-[10px] hover:bg-purple-700 transition cursor-pointer shadow-2xs"
                              title="Bấm để đưa đường mức k đi qua đỉnh tối ưu này"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>
                                {objective.goal === 'max' ? 'GTLN (Tối ưu)' : 'GTNN (Tối ưu)'}
                              </span>
                            </button>
                          ) : isRowVerified ? (
                            <button
                              type="button"
                              onClick={() => onSelectKValue?.(ve.value)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[10px] hover:bg-emerald-100 transition cursor-pointer"
                              title="Bấm để xem đường mức tại đỉnh này"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{formatValueWithApprox(ve.value)}</span>
                            </button>
                          ) : check && !check.isCorrect ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-[10px]">
                              <XCircle className="w-3 h-3 text-rose-500" />
                              <span>Thử lại</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Chưa kiểm chứng
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* INTEGER MODEL TAB (x, y ∈ ℕ) */}
      {activeModelTab === 'integer' && (
        <div className="space-y-3.5">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Phân Biệt Nghiệm Liên Tục (ℝ) Và Phương Án Sản Xuất Nguyên (ℕ):</span>
            </div>
            <p className="leading-relaxed">
              Trong mô hình liên tục, đỉnh tối ưu là{' '}
              <strong className="font-mono">
                {result.vertexEvaluations
                  .filter(ve => ve.isOptimal)
                  .map(ve => `${ve.label}${formatPointCoord(ve.vertex)}`)
                  .join(', ') || 'không có'}
              </strong>{' '}
              với giá trị{' '}
              <strong className="font-mono">
                {optimalValue !== null ? formatValueWithApprox(optimalValue) : 'N/A'} {objective.unit}
              </strong>
              . Tuy nhiên, số lượng {scenario.variables.x.name.toLowerCase()} và{' '}
              {scenario.variables.y.name.toLowerCase()} ({scenario.variables.x.unit}) bắt buộc phải là{' '}
              <strong>số nguyên không âm (x, y ∈ ℕ)</strong>.
            </p>
            {naiveRoundedCheck && (
              <div className="p-2.5 rounded-lg bg-white/90 border border-amber-300 text-[11px] font-mono text-rose-900 mt-1">
                <strong>⚠️ Cảnh báo sai lầm khi làm tròn tự động:</strong> Nếu tự ý làm tròn nghiệm liên tục{' '}
                {formatPointCoord(naiveRoundedCheck.continuousPt)} thành ({naiveRoundedCheck.roundedPt.x};{' '}
                {naiveRoundedCheck.roundedPt.y}), điểm này{' '}
                {naiveRoundedCheck.satisfies
                  ? 'tuy thuộc miền khả thi nhưng cần đối chiếu giá trị với các điểm nguyên lân cận.'
                  : `VI PHẠM ràng buộc (${naiveRoundedCheck.violatedIneqs.join(', ')}) nên KHÔNG KHẢ THI!`}
              </div>
            )}
          </div>

          {integerOptimalPoint && integerOptimalValue !== null && (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 flex flex-col gap-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-extrabold text-sm text-purple-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  Phương Án Nguyên Tối Ưu (x, y ∈ ℕ):
                </span>
                <span className="font-mono font-extrabold text-sm px-2.5 py-0.5 rounded-lg bg-purple-600 text-white">
                  ({integerOptimalPoint.x}; {integerOptimalPoint.y}) → {formatValueWithApprox(integerOptimalValue)} {objective.unit}
                </span>
              </div>

              <div className="text-[11px] font-mono pl-2.5 border-l-2 border-purple-400">
                P({integerOptimalPoint.x}; {integerOptimalPoint.y}) = {objective.cx} × {integerOptimalPoint.x} +{' '}
                {objective.cy} × {integerOptimalPoint.y} ={' '}
                <strong className="text-purple-950 font-bold">
                  {formatValueWithApprox(integerOptimalValue)} {objective.unit}
                </strong>
              </div>

              {/* Candidate integer lattice points table */}
              {sortedIntegerCandidates.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    Bảng khảo sát các điểm nguyên khả thi tốt nhất trong miền đa giác ({integerPoints.length} điểm nguyên khả thi):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sortedIntegerCandidates.map((cand, idx) => {
                      const isBest =
                        Math.abs(cand.value - integerOptimalValue) < 1e-6;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onSelectKValue?.(cand.value)}
                          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border transition cursor-pointer ${
                            isBest
                              ? 'bg-purple-600 text-white border-purple-600 font-extrabold shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                          }`}
                        >
                          ({cand.point.x}; {cand.point.y}): {formatCoord(cand.value)}{' '}
                          {isBest ? '★ Tối ưu nguyên' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-700 leading-relaxed pt-1">
                ⇒ <strong>Kết luận thực tế:</strong> Cần chọn phương án sản xuất/vận hành{' '}
                <strong>
                  {integerOptimalPoint.x} {scenario.variables.x.unit} {scenario.variables.x.name}
                </strong>{' '}
                và{' '}
                <strong>
                  {integerOptimalPoint.y} {scenario.variables.y.unit} {scenario.variables.y.name}
                </strong>{' '}
                để đạt {objective.name.toLowerCase()}{' '}
                {objective.goal === 'max' ? 'tối đa' : 'tối thiểu'} thực tế là{' '}
                <strong>
                  {formatValueWithApprox(integerOptimalValue)} {objective.unit}
                </strong>
                .
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary Box (Revealed after all vertices verified or in Integer tab) */}
      {(allVerticesVerified || activeModelTab === 'integer') ? (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Kết luận Toán học & Thực tiễn:</span>
          </span>
          <p className="text-slate-700 leading-relaxed font-mono">{result.summarySGK}</p>
          {scenario.integerRequired && (
            <p className="text-purple-900 font-semibold leading-relaxed whitespace-pre-line pt-1 border-t border-slate-200/80">
              {result.practicalAnswer}
            </p>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-600 flex items-center justify-between gap-2">
          <span>
            💡 <strong>Chế độ Sư phạm:</strong> Hãy tự nhập và bấm <strong>Kiểm chứng</strong> giá trị tại các đỉnh ở bảng trên để mở khóa kết luận đỉnh tối ưu!
          </span>
          <button
            type="button"
            onClick={handleRevealSolution}
            className="text-[11px] font-bold text-purple-700 hover:underline shrink-0 cursor-pointer"
          >
            Mở khóa ngay
          </button>
        </div>
      )}
    </div>
  );
};
