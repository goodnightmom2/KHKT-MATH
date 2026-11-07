import React from 'react';
import { X, Construction, Compass, ArrowRight, Sparkles } from 'lucide-react';
import { OptiMascot } from '../mascot/OptiMascot';
import { ModuleData } from './ModuleCards';

interface UnderDevModalProps {
  module: ModuleData | null;
  isOpen: boolean;
  onClose: () => void;
  onGoToLab: () => void;
}

export const UnderDevModal: React.FC<UnderDevModalProps> = ({
  module,
  isOpen,
  onClose,
  onGoToLab
}) => {
  if (!isOpen || !module) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Construction className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Module 0{module.number} – Đang phát triển
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{module.title}</h3>
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
        <div className="p-6 flex flex-col items-center text-center">
          <OptiMascot expression="thinking" pose="pointing" size={130} />

          <h4 className="mt-4 font-bold text-slate-900 text-base">
            Opti đang cùng đội ngũ chuẩn bị cho Giai đoạn 2!
          </h4>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
            Theo lộ trình phát triển được duyệt, hiện tại hệ thống tập trung hoàn thiện tối đa <strong>Phòng Thí Nghiệm Miền Nghiệm Mẫu (Giai đoạn 1)</strong> với bất phương trình <code className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-mono font-bold">2x + y ≤ 6</code> và bộ điều khiển đại số tương tác.
          </p>

          <div className="mt-5 w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
            <h5 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Nội dung chuẩn bị cho module này:
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed">{module.description}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200 transition"
          >
            Đóng
          </button>

          <button
            onClick={() => {
              onClose();
              onGoToLab();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
          >
            <Compass className="w-4 h-4" />
            <span>Trải nghiệm Phòng thí nghiệm (Module 2)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
