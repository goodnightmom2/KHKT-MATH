import React from 'react';
import { X, Presentation, Compass, CheckCircle2, Lightbulb, Users, Target, ArrowRight } from 'lucide-react';
import { OptiMascot } from '../mascot/OptiMascot';

interface TeacherGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTeacherLab: () => void;
}

export const TeacherGuideModal: React.FC<TeacherGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenTeacherLab
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Chế độ Dành Cho Thầy Cô
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Hướng Dẫn Sư Phạm & Trình Chiếu Lớp Học
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm text-slate-700">
          {/* Mascot Note */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
            <OptiMascot expression="thinking" pose="pointing" size={72} animate={false} />
            <div>
              <h4 className="font-bold text-purple-950">Triết lý dạy học tương tác OPTIMATH</h4>
              <p className="text-xs text-purple-900 mt-1 leading-relaxed">
                "Quan sát → Dự đoán → Thao tác → Kiểm chứng → Giải thích → Vận dụng". Thay vì vẽ tĩnh lên bảng đen, thầy cô cho học sinh tự dự đoán điểm thử rồi kéo thả trực tiếp để thấy kết quả tức thì.
              </p>
            </div>
          </div>

          {/* Objectives */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              Mục tiêu dạy học (Chương trình GDPT 2018 - Toán 10)
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Nhận biết được bất phương trình bậc nhất hai ẩn và nghiệm của nó.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Biểu diễn được miền nghiệm của bất phương trình bậc nhất hai ẩn trên mặt phẳng tọa độ Oxy.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Phân biệt chính xác giữa miền nghiệm có lấy bờ (dấu &le;, &ge;) và không lấy bờ (dấu &lt;, &gt;).</span>
              </div>
            </div>
          </div>

          {/* Suggested Prompts for Teachers */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Gợi ý câu hỏi dẫn dắt tương tác trên lớp:
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="bg-white p-2.5 rounded-lg border border-slate-200">
                <strong>Câu hỏi 1:</strong> "Nếu thầy/cô đổi dấu từ <code className="text-blue-600 font-bold">&le;</code> sang <code className="text-blue-600 font-bold">&lt;</code>, đường biên (d) sẽ thay đổi như thế nào trên đồ thị?"
              </li>
              <li className="bg-white p-2.5 rounded-lg border border-slate-200">
                <strong>Câu hỏi 2:</strong> "Khi điểm M(x; y) di chuyển từ trái sang phải qua đường thẳng 2x + y = 6, giá trị của biểu thức 2x + y biến thiên ra sao?"
              </li>
              <li className="bg-white p-2.5 rounded-lg border border-slate-200">
                <strong>Câu hỏi 3:</strong> "Tại sao điểm O(0; 0) thường được chọn làm điểm thử đầu tiên? Trong trường hợp nào thì không được chọn O(0; 0)?"
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200 transition"
          >
            Đóng lại
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenTeacherLab();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
          >
            <Presentation className="w-4 h-4" />
            <span>Kích hoạt giao diện Trình chiếu Giáo viên</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
