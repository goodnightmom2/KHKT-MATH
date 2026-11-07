import React from 'react';
import { BookOpen, Compass, Layers, Target, Award, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { OptiMascot } from '../mascot/OptiMascot';

interface ModuleCardsProps {
  onSelectModule: (modId: string) => void;
}

export interface ModuleData {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
  status: 'active' | 'preview' | 'in_development';
  optiPose: 'reading' | 'pointing' | 'idle' | 'running' | 'waving';
  optiExpr: 'happy' | 'wink' | 'thinking' | 'surprised' | 'cheering';
}

export const MODULES_CONFIG: ModuleData[] = [
  {
    id: 'knowledge',
    number: 1,
    title: 'Khám Phá Kiến Thức',
    subtitle: 'Nền tảng định nghĩa & Lý thuyết cốt lõi',
    description: 'Tìm hiểu bất phương trình bậc nhất hai ẩn, quy ước nửa mặt phẳng bờ (d), cách kiểm tra nghiệm bằng phương pháp đại số.',
    color: '#3882F6',
    bgColor: 'bg-blue-50/50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    badgeLabel: 'Lý thuyết & Ví dụ',
    status: 'preview',
    optiPose: 'reading',
    optiExpr: 'thinking'
  },
  {
    id: 'lab',
    number: 2,
    title: 'Phòng Thí Nghiệm Miền Nghiệm',
    subtitle: 'Quy trình tương tác 7 bước chuẩn SGK Toán 10',
    description: 'Thực hành quy trình 7 bước chuẩn mực: Nhận diện hệ số → Vẽ đường biên nét liền/đứt → Định vị 2 điểm A,B → Nối bờ → Điểm thử M → Xác định miền nghiệm → Kết luận sư phạm.',
    color: '#10B981',
    bgColor: 'bg-emerald-50/50',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-600 text-white',
    badgeText: 'text-white',
    badgeLabel: '7 BƯỚC HOÀN TOÀN',
    status: 'active',
    optiPose: 'pointing',
    optiExpr: 'happy'
  },
  {
    id: 'system',
    number: 3,
    title: 'Phòng Thí Nghiệm Hệ BPT',
    subtitle: 'Xác định miền giao & Các đỉnh của miền nghiệm',
    description: 'Thực hành hệ từ 2 đến 5 bất phương trình: Biểu diễn từng nửa mặt phẳng, tìm giao điểm các đường bờ, xác định các đỉnh đa giác, nhận diện miền rỗng/không bị chặn/suy biến.',
    color: '#F59E0B',
    bgColor: 'bg-amber-50/50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-600 text-white',
    badgeText: 'text-white',
    badgeLabel: '7 BƯỚC HOÀN THIỆN',
    status: 'active',
    optiPose: 'pointing',
    optiExpr: 'happy'
  },
  {
    id: 'optimization',
    number: 4,
    title: 'Mô Hình Hóa & Tối Ưu',
    subtitle: 'Quy hoạch tuyến tính thực tế',
    description: 'Chuyển bài toán sản xuất, dinh dưỡng, chi phí thành hệ bất phương trình. Tìm giá trị lớn nhất, nhỏ nhất của hàm mục tiêu F(x;y).',
    color: '#8B5CF6',
    bgColor: 'bg-purple-50/50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-700',
    badgeBg: 'bg-purple-600 text-white',
    badgeText: 'text-white',
    badgeLabel: '7 BƯỚC HOÀN TOÀN',
    status: 'active',
    optiPose: 'running',
    optiExpr: 'cheering'
  },
  {
    id: 'quiz',
    number: 5,
    title: 'Luyện Tập & Đánh Giá',
    subtitle: '40 bài tập tương tác, Phân tích lỗi E01–E10 & Cá nhân hóa',
    description: 'Ngân hàng 40 bài tập chuẩn hóa 4 mức độ, chấm theo bước với đồ thị tương tác, chẩn đoán 10 mã lỗi E01–E10, lộ trình cá nhân và Dashboard Giáo viên (IndexedDB/CSV).',
    color: '#4F46E5',
    bgColor: 'bg-indigo-50/50',
    borderColor: 'border-indigo-300',
    textColor: 'text-indigo-700',
    badgeBg: 'bg-indigo-600 text-white',
    badgeText: 'text-white',
    badgeLabel: '5 KHU VỰC HOÀN THIỆN',
    status: 'active',
    optiPose: 'pointing',
    optiExpr: 'wink'
  }
];

export const ModuleCards: React.FC<ModuleCardsProps> = ({ onSelectModule }) => {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Lộ trình 5 Module Toán 10
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hệ thống phòng học tương tác OPTIMATH
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
              Từ lý thuyết cơ bản, phòng thí nghiệm trực quan, đến mô hình tối ưu thực tiễn và đánh giá cá nhân hóa.
            </p>
          </div>

          <div className="text-[11px] sm:text-xs text-slate-600 font-medium flex items-center gap-1.5 self-start md:self-auto bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Trọn bộ 5 Module hoạt động hoàn toàn</span>
          </div>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {MODULES_CONFIG.map(mod => {
            const isActive = mod.status === 'active';
            const isPreview = mod.status === 'preview';

            return (
              <div
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`group relative rounded-2xl sm:rounded-3xl border ${mod.borderColor} ${mod.bgColor} p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-white`}
              >
                {/* Top Badge & Number */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isPreview
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {mod.badgeLabel}
                    </span>

                    <span className="w-8 h-8 rounded-full bg-slate-100 font-extrabold text-slate-400 flex items-center justify-center text-sm font-mono">
                      0{mod.number}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mb-3">
                    {mod.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {mod.description}
                  </p>
                </div>

                {/* Footer with Opti sticker avatar and Action Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <OptiMascot expression={mod.optiExpr} pose={mod.optiPose} size={42} animate={false} />
                    <span className="text-[11px] font-semibold text-slate-500">
                      {isActive ? 'Thao tác ngay' : isPreview ? 'Xem lý thuyết' : 'Sắp ra mắt'}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white group-hover:bg-emerald-700 shadow-sm'
                        : isPreview
                        ? 'bg-blue-600 text-white group-hover:bg-blue-700'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    <span>{isActive ? 'Vào phòng lab' : isPreview ? 'Xem trước' : 'Chi tiết'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
