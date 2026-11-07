import React, { useState } from 'react';
import { OptimizationResult, RealWorldScenario } from '../../types/math';
import { Presentation, Maximize2, Minimize2, Eye, EyeOff, Sparkles, HelpCircle, Target } from 'lucide-react';

interface OptimizationTeacherControlsProps {
  scenario: RealWorldScenario;
  result: OptimizationResult;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
  showLevelCurve: boolean;
  onToggleLevelCurve: () => void;
  showIntegerPoints: boolean;
  onToggleIntegerPoints: () => void;
  showOptimalPoint: boolean;
  onToggleOptimalPoint: () => void;
}

export const OptimizationTeacherControls: React.FC<OptimizationTeacherControlsProps> = ({
  scenario,
  result,
  isPresentationMode,
  onTogglePresentationMode,
  showLevelCurve,
  onToggleLevelCurve,
  showIntegerPoints,
  onToggleIntegerPoints,
  showOptimalPoint,
  onToggleOptimalPoint
}) => {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState(false);

  const socratesQuestions = [
    {
      q: 'Hỏi học sinh: Tại sao giá trị lớn nhất hoặc nhỏ nhất của hàm mục tiêu F(x;y) luôn đạt tại một trong các đỉnh của miền đa giác lồi?',
      a: 'Vì đường mức ax + by = k là một đường thẳng. Khi tịnh tiến song song qua miền đa giác lồi, điểm tiếp xúc đầu tiên và cuối cùng của đường thẳng với miền đa giác luôn rơi vào các đỉnh (hoặc cả một cạnh biên) của đa giác.'
    },
    {
      q: 'Hỏi học sinh: Khi nào bài toán quy hoạch tuyến tính có vô số phương án tối ưu?',
      a: 'Khi vectơ pháp tuyến của đường mức hàm mục tiêu cùng phương với vectơ pháp tuyến của một cạnh biên của miền khả thi (tức là đường mức song song với cạnh đó và tiếp xúc dọc theo toàn bộ đoạn thẳng).'
    },
    {
      q: 'Hỏi học sinh: Điểm khác biệt mấu chốt giữa nghiệm liên tục và phương án sản xuất thực tế nguyên là gì?',
      a: 'Nghiệm liên tục có thể là số thập phân hoặc phân số lẻ (như 8/3 ≈ 2.67 chiếc ghế), còn thực tế chỉ có thể sản xuất số lượng nguyên chiếc. Ta phải khảo sát các điểm nguyên (x, y) ∈ ℕ² bên trong miền khả thi.'
    }
  ];

  return (
    <div className="bg-purple-50/80 rounded-2xl border border-purple-200 p-4 shadow-xs flex flex-col gap-3">
      {/* Teacher Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Presentation className="w-4 h-4 text-purple-700" />
          <h4 className="font-extrabold text-sm text-purple-900">
            Bảng Điều Khiển Trình Chiếu Dành Cho Giáo Viên
          </h4>
        </div>

        <button
          type="button"
          onClick={onTogglePresentationMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-300 bg-white hover:bg-purple-100 text-purple-900 text-xs font-bold transition cursor-pointer min-h-[36px]"
        >
          {isPresentationMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span>{isPresentationMode ? 'Thu nhỏ đồ thị' : 'Phóng to trình chiếu'}</span>
        </button>
      </div>

      {/* Toggles for Visual Demonstrations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onToggleLevelCurve}
          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
            showLevelCurve
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white border-purple-200 text-purple-800'
          }`}
        >
          <span>Đường mức F = k</span>
          {showLevelCurve ? <Eye className="w-3.5 h-3.5 text-white" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={onToggleIntegerPoints}
          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
            showIntegerPoints
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white border-purple-200 text-purple-800'
          }`}
        >
          <span>Điểm nguyên (x, y ∈ ℕ)</span>
          {showIntegerPoints ? <Eye className="w-3.5 h-3.5 text-white" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={onToggleOptimalPoint}
          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
            showOptimalPoint
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white border-purple-200 text-purple-800'
          }`}
        >
          <span>Đỉnh tối ưu cực trị</span>
          {showOptimalPoint ? <Eye className="w-3.5 h-3.5 text-white" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>

      {/* Socrates Pedagogical Questions */}
      <div className="mt-1 pt-2 border-t border-purple-200/60">
        <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5 mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-purple-700" />
          Câu hỏi gợi mở Socrates đặt cho học sinh trên lớp:
        </span>

        <div className="flex flex-col gap-1.5">
          {socratesQuestions.map((qItem, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-white border border-purple-200 text-xs">
              <div
                onClick={() => {
                  setActiveQuestion(activeQuestion === idx ? null : idx);
                  setRevealedAnswer(false);
                }}
                className="font-bold text-purple-900 cursor-pointer flex items-center justify-between"
              >
                <span>{qItem.q}</span>
                <span className="text-[10px] text-purple-600 font-mono underline ml-2 shrink-0">
                  {activeQuestion === idx ? 'Thu gọn' : 'Xem đáp án'}
                </span>
              </div>

              {activeQuestion === idx && (
                <div className="mt-2 pt-2 border-t border-purple-100 text-[11px] text-slate-700 leading-relaxed">
                  <div className="font-semibold text-purple-950 mb-0.5">Gợi ý câu trả lời sư phạm:</div>
                  <p>{qItem.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
