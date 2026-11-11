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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider block">Module 1</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">Khám Phá Kiến Thức Nền Tảng</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0 -mr-1 mt-0.5"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 text-sm text-slate-700">
          {/* Welcome with Opti */}
          <div className="flex items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <div className="shrink-0">
              <OptiMascot expression="happy" pose="reading" size={56} animate={false} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-blue-900 text-xs sm:text-sm">Chào bạn! Opti sẽ tóm tắt kiến thức trọng tâm</h4>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed">
                Các khái niệm cốt lõi của Bài 1 - Chương II sách giáo khoa Toán 10 (Chân trời sáng tạo / Cánh diều / Kết nối tri thức).
              </p>
            </div>
          </div>

          {/* Definition 1 */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
              1. Dạng tổng quát của Bất phương trình bậc nhất hai ẩn
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              Bất phương trình bậc nhất hai ẩn <span className="font-semibold text-slate-800">x, y</span> là bất phương trình có một trong <span className="font-bold text-blue-700">4 dạng chuẩn</span> sau:
            </p>

            {/* 4 Standard Forms in 2x2 Grid for Mobile & Desktop */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 my-1.5">
              <div className="p-2.5 sm:p-3 rounded-xl bg-blue-50/90 border border-blue-200/90 shadow-2xs text-center flex flex-col justify-center">
                <div className="font-mono font-bold text-blue-900 text-sm sm:text-base tracking-wide">
                  ax + by ≤ c
                </div>
                <div className="text-[10px] sm:text-[11px] text-blue-700 font-semibold mt-1">
                  Có lấy bờ • Nét liền (—)
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-blue-50/90 border border-blue-200/90 shadow-2xs text-center flex flex-col justify-center">
                <div className="font-mono font-bold text-blue-900 text-sm sm:text-base tracking-wide">
                  ax + by ≥ c
                </div>
                <div className="text-[10px] sm:text-[11px] text-blue-700 font-semibold mt-1">
                  Có lấy bờ • Nét liền (—)
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-50/90 border border-indigo-200/90 shadow-2xs text-center flex flex-col justify-center">
                <div className="font-mono font-bold text-indigo-900 text-sm sm:text-base tracking-wide">
                  ax + by &lt; c
                </div>
                <div className="text-[10px] sm:text-[11px] text-indigo-700 font-semibold mt-1">
                  Không lấy bờ • Nét đứt (- -)
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-50/90 border border-indigo-200/90 shadow-2xs text-center flex flex-col justify-center">
                <div className="font-mono font-bold text-indigo-900 text-sm sm:text-base tracking-wide">
                  ax + by &gt; c
                </div>
                <div className="text-[10px] sm:text-[11px] text-indigo-700 font-semibold mt-1">
                  Không lấy bờ • Nét đứt (- -)
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] sm:text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Quy ước SGK:</strong> <span className="font-mono">a, b, c</span> là các hệ số thực đã cho; <span className="font-mono">a</span> và <span className="font-mono">b</span> <strong>không đồng thời bằng 0</strong> (<span className="font-mono text-blue-700 font-semibold">a² + b² ≠ 0</span>); <span className="font-mono">x</span> và <span className="font-mono">y</span> là hai ẩn số.
            </div>
          </div>

          {/* Definition 2: Solution */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
              2. Nghiệm và Miền nghiệm hình học
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <div>
                  <strong>Nghiệm của BPT:</strong> Mỗi cặp số <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-xs font-bold text-blue-700">(x₀; y₀)</code> sao cho khi thay vào ta được một mệnh đề đúng thì <code className="font-mono font-semibold">(x₀; y₀)</code> được gọi là <strong>một nghiệm</strong>.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <div>
                  <strong>Miền nghiệm trên Oxy:</strong> Tập hợp tất cả các điểm <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-xs font-bold text-blue-700">M(x₀; y₀)</code> là nghiệm được gọi là <strong>miền nghiệm</strong> (tạo thành một nửa mặt phẳng có bờ).
                </div>
              </div>
            </div>
          </div>

          {/* Step by step rule */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 space-y-3">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Quy trình 4 bước biểu diễn miền nghiệm trên Oxy (SGK):</span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs text-slate-700">
              <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Bước 1
                  </span>
                  <strong className="text-slate-900 font-semibold">Vẽ đường thẳng bờ (d): ax + by = c</strong>
                </div>
                <p className="text-slate-600 pl-1 leading-relaxed text-[11px] sm:text-xs">
                  Xác định 2 điểm thuộc đường thẳng. Vẽ <em>nét liền</em> nếu có dấu <code className="font-mono font-bold">≤, ≥</code>; vẽ <em>nét đứt</em> nếu là <code className="font-mono font-bold">&lt;, &gt;</code>.
                </p>
              </div>

              <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Bước 2
                  </span>
                  <strong className="text-slate-900 font-semibold">Chọn điểm thử M(x₀; y₀) ∉ (d)</strong>
                </div>
                <p className="text-slate-600 pl-1 leading-relaxed text-[11px] sm:text-xs">
                  Ưu tiên chọn gốc tọa độ <code className="font-mono font-bold text-blue-700">O(0; 0)</code> nếu <code className="font-mono">c ≠ 0</code> để tính nhẩm nhanh và dễ dàng nhất!
                </p>
              </div>

              <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Bước 3
                  </span>
                  <strong className="text-slate-900 font-semibold">Tính giá trị ax₀ + by₀ và so sánh với c</strong>
                </div>
                <p className="text-slate-600 pl-1 leading-relaxed text-[11px] sm:text-xs">
                  Kiểm tra xem bất đẳng thức thu được là <strong>ĐÚNG</strong> hay <strong>SAI</strong>.
                </p>
              </div>

              <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Bước 4
                  </span>
                  <strong className="text-slate-900 font-semibold">Kết luận nửa mặt phẳng nghiệm</strong>
                </div>
                <p className="text-slate-600 pl-1 leading-relaxed text-[11px] sm:text-xs">
                  • Nếu <strong>Đúng</strong>: Nửa mặt phẳng chứa điểm M là miền nghiệm.<br />
                  • Nếu <strong>Sai</strong>: Gạch bỏ nửa mặt phẳng chứa M; nửa mặt phẳng còn lại (không chứa M) là miền nghiệm.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200 transition text-center order-2 sm:order-1"
          >
            Đóng lại
          </button>

          <button
            onClick={() => {
              onClose();
              onGoToLab();
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md transition order-1 sm:order-2"
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Thực hành ngay trên Phòng Lab</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
