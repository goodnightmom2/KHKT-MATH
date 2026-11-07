import React from 'react';
import { X, BookOpen, Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import { OptiMascot } from '../mascot/OptiMascot';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToLab: () => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  onGoToLab
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Module 1</span>
              <h3 className="text-lg font-bold text-slate-900">Khám Phá Kiến Thức Nền Tảng</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-sm text-slate-700">
          {/* Welcome with Opti */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <OptiMascot expression="happy" pose="reading" size={64} animate={false} />
            <div>
              <h4 className="font-bold text-blue-900">Chào bạn! Opti sẽ tóm tắt kiến thức trọng tâm</h4>
              <p className="text-xs text-slate-600 mt-1">
                Đây là các khái niệm căn bản của Bài 1 - Chương II sách giáo khoa Toán 10 (Chân trời sáng tạo / Cánh diều / Kết nối tri thức).
              </p>
            </div>
          </div>

          {/* Definition 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              1. Bất phương trình bậc nhất hai ẩn là gì?
            </h4>
            <p className="leading-relaxed">
              Bất phương trình bậc nhất hai ẩn x, y là bất phương trình có một trong các dạng tổng quát:
            </p>
            <div className="p-3 rounded-xl bg-slate-100 font-mono text-center font-bold text-blue-800 text-base">
              ax + by &le; c &nbsp;|&nbsp; ax + by &lt; c &nbsp;|&nbsp; ax + by &ge; c &nbsp;|&nbsp; ax + by &gt; c
            </div>
            <p className="text-xs text-slate-500 italic">
              Trong đó: a, b, c là các số thực đã cho; a và b <strong>không đồng thời bằng 0</strong>; x và y là hai ẩn số.
            </p>
          </div>

          {/* Definition 2: Solution */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              2. Nghiệm và Miền nghiệm
            </h4>
            <p className="leading-relaxed">
              - Mỗi cặp số <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">(x₀; y₀)</code> sao cho mệnh đề <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">ax₀ + by₀ &le; c</code> là mệnh đề đúng được gọi là <strong>một nghiệm</strong>.
            </p>
            <p className="leading-relaxed">
              - Tập hợp tất cả các điểm <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">M(x₀; y₀)</code> là nghiệm được gọi là <strong>miền nghiệm</strong> của bất phương trình.
            </p>
          </div>

          {/* Step by step rule */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
            <h4 className="font-bold text-emerald-950 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Quy tắc 4 bước xác định miền nghiệm trên mặt phẳng tọa độ:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 font-medium pl-1">
              <li>
                <strong>Vẽ đường thẳng bờ (d):</strong> ax + by = c (Vẽ nét liền nếu có dấu =, vẽ nét đứt nếu là &lt; hoặc &gt;).
              </li>
              <li>
                <strong>Lấy một điểm thử M(x₀; y₀):</strong> Điểm này không thuộc đường thẳng (d). Gốc tọa độ O(0; 0) thường là lựa chọn tối ưu nhất nếu c &ne; 0!
              </li>
              <li>
                <strong>Tính giá trị:</strong> Thay x₀, y₀ vào đa thức ax + by rồi so sánh với c.
              </li>
              <li>
                <strong>Kết luận nửa mặt phẳng:</strong> Nếu mệnh đề đúng thì nửa mặt phẳng chứa điểm M là miền nghiệm. Nếu mệnh đề sai thì nửa mặt phẳng không chứa điểm M là miền nghiệm.
              </li>
            </ol>
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
              onGoToLab();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
          >
            <Compass className="w-4 h-4" />
            <span>Thực hành ngay trên Phòng Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
