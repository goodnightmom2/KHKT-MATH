import React, { useState } from 'react';
import { SystemAnalysisResult, SystemInequality } from '../../types/math';
import {
  Presentation,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Layers
} from 'lucide-react';

interface SystemTeacherControlsProps {
  system: SystemInequality[];
  analysis: SystemAnalysisResult;
  showCommonRegion: boolean;
  onToggleCommonRegion: () => void;
  showIntersections: boolean;
  onToggleIntersections: () => void;
  showVerticesOnly: boolean;
  onToggleVerticesOnly: () => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
}

export const SystemTeacherControls: React.FC<SystemTeacherControlsProps> = ({
  system,
  analysis,
  showCommonRegion,
  onToggleCommonRegion,
  showIntersections,
  onToggleIntersections,
  showVerticesOnly,
  onToggleVerticesOnly,
  isPresentationMode,
  onTogglePresentationMode
}) => {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState(false);

  const questions = [
    {
      q: 'Hỏi học sinh: Hệ bất phương trình này có miền nghiệm rỗng hay không?',
      a: analysis.regionType === 'empty' ? 'Đúng, miền nghiệm là tập rỗng (∅).' : 'Không, hệ có nghiệm.'
    },
    {
      q: 'Hỏi học sinh: Điểm O(0; 0) có phải là một nghiệm của hệ không?',
      a: 'Kiểm tra tọa độ (0;0) vào từng bất phương trình.'
    },
    {
      q: 'Hỏi học sinh: Miền nghiệm của hệ là miền bị chặn hay không bị chặn?',
      a: analysis.regionType === 'bounded_polygon' ? 'Miền bị chặn (đa giác đóng).' : 'Miền không bị chặn (kéo dài vô tận).'
    }
  ];

  return (
    <div className="bg-purple-50/70 rounded-2xl border border-purple-200 p-4 shadow-xs flex flex-col gap-3">
      {/* Teacher Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Presentation className="w-4 h-4 text-purple-700" />
          <h4 className="font-extrabold text-sm text-purple-900">
            Thanh Điều Khiển Dành Cho Giáo Viên Giảng Dạy
          </h4>
        </div>

        <button
          type="button"
          onClick={onTogglePresentationMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-300 bg-white hover:bg-purple-100 text-purple-900 text-xs font-bold transition cursor-pointer"
        >
          {isPresentationMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span>{isPresentationMode ? 'Thu nhỏ đồ thị' : 'Phóng to trình chiếu'}</span>
        </button>
      </div>

      {/* Layer Visibility Toggles for Classroom Demonstration */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onToggleCommonRegion}
          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
            showCommonRegion
              ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
              : 'bg-white border-purple-200 text-purple-800'
          }`}
        >
          <span>1. Miền giao chung</span>
          {showCommonRegion ? <Eye className="w-3.5 h-3.5 text-emerald-700" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={onToggleIntersections}
          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
            showIntersections
              ? 'bg-blue-100 border-blue-300 text-blue-900'
              : 'bg-white border-purple-200 text-purple-800'
          }`}
        >
          <span>2. Tất cả giao điểm bờ</span>
          {showIntersections ? <Eye className="w-3.5 h-3.5 text-blue-700" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={onToggleVerticesOnly}
          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
            showVerticesOnly
              ? 'bg-purple-200 border-purple-400 text-purple-950'
              : 'bg-white border-purple-200 text-purple-800'
          }`}
        >
          <span>3. Chỉ hiện đỉnh đa giác</span>
          {showVerticesOnly ? <Eye className="w-3.5 h-3.5 text-purple-700" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>

      {/* Classroom Interaction / Prediction Question Generator */}
      <div className="p-3 rounded-xl bg-white border border-purple-200 text-xs flex flex-col gap-2">
        <span className="font-bold text-purple-900 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
          Câu hỏi tương tác nhanh trên lớp học:
        </span>

        <div className="flex flex-wrap gap-1.5">
          {questions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveQuestion(idx);
                setRevealedAnswer(false);
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                activeQuestion === idx ? 'bg-purple-600 text-white border-purple-600' : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
              }`}
            >
              Câu hỏi {idx + 1}
            </button>
          ))}
        </div>

        {activeQuestion !== null && (
          <div className="mt-1 p-2.5 rounded-lg bg-purple-50/60 border border-purple-100 space-y-1.5">
            <div className="font-bold text-purple-900">{questions[activeQuestion].q}</div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setRevealedAnswer(!revealedAnswer)}
                className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
              >
                {revealedAnswer ? 'Ẩn đáp án' : 'Hiện đáp án mẫu cho giáo viên'}
              </button>
              {revealedAnswer && (
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {questions[activeQuestion].a}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
