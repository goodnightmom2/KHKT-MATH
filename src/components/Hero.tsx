import React from 'react';
import { OptiMascot } from '../mascot/OptiMascot';
import { ArrowRight, Presentation, Sparkles, CheckCircle2, Compass, Layers } from 'lucide-react';

interface HeroProps {
  onStartExplore: () => void;
  onOpenTeacherGuide: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartExplore,
  onOpenTeacherGuide
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-6 pb-8 sm:pt-10 sm:pb-12 border-b border-slate-200/60">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-blue-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Text & CTA (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-[11px] sm:text-xs font-bold mb-2.5 sm:mb-4 shadow-xs">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
              <span>Toán THPT Mới – Lớp 10</span>
            </div>

            {/* Slogan Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.2] mb-2 sm:mb-4">
              Khám phá miền nghiệm – <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                Chinh phục tối ưu
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-slate-600 leading-relaxed mb-4 sm:mb-6 max-w-2xl font-normal">
              Chào mừng bạn đến với <strong>OPTIMATH LAB</strong>. Nền tảng học Toán bằng thao tác trực tiếp: quan sát đồ thị hai chiều, kéo thả điểm thử, kiểm chứng và làm chủ bất phương trình bậc nhất hai ẩn cùng trợ lý <strong>Opti</strong>.
            </p>

            {/* Feature Checkpoints */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5 sm:mb-7 w-full max-w-xl text-[11px] sm:text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5 bg-white/80 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Trực quan 2D Oxy</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Kiểm tra nghiệm tức thì</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 border border-slate-200 px-2.5 py-1.5 rounded-xl col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Giải thích 4 bước SGK</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onStartExplore}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-base shadow-md shadow-blue-500/25 hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
              >
                <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Bắt đầu khám phá (Lab Mẫu)</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenTeacherGuide}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-purple-200 text-purple-800 font-bold text-xs sm:text-base shadow-xs hover:border-purple-300 transition-all cursor-pointer"
              >
                <Presentation className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <span>Chế độ giáo viên</span>
              </button>
            </div>
          </div>

          {/* Right Mascot Hero Card (5 cols) - Scaled cleanly on mobile */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xs sm:max-w-md bg-white rounded-3xl p-4 sm:p-7 border border-blue-100 shadow-lg shadow-blue-500/10 flex flex-col items-center text-center">
              {/* Badge */}
              <div className="absolute -top-3 px-3 py-0.5 sm:px-4 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600 text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-xs">
                Linh vật AI Shiba – Opti
              </div>

              {/* Opti Shiba Mascot Character */}
              <div className="my-1 sm:my-2 py-1 flex items-center justify-center">
                <OptiMascot
                  expression="happy"
                  pose="waving"
                  size={175}
                  className="!w-[145px] !h-[145px] sm:!w-[205px] sm:!h-[205px]"
                />
              </div>

              {/* Speech bubble */}
              <div className="w-full bg-blue-50/90 border border-blue-200 rounded-2xl p-3 sm:p-4 text-left relative mt-1 sm:mt-2">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-50 border-t border-l border-blue-200 transform rotate-45" />
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                  "Gâu! Mình là <strong className="text-amber-600">Shiba Opti</strong>! Cùng mình khám phá miền nghiệm của <span className="font-mono text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-200 text-xs">2x + y ≤ 6</span> ngay nhé!"
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
                  <span className="font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Sẵn sàng hỗ trợ
                  </span>
                  <span className="italic text-[10px] sm:text-[11px]">Học toán thông minh ♡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
