import React, { useState, useMemo, useRef } from 'react';
import {
  AssessmentExercise,
  AssessmentTopicId,
  CognitiveLevel,
  ErrorCodeId,
  ExerciseAttemptRecord,
  TeacherAssignment
} from '../../types/assessment';
import {
  ASSESSMENT_EXERCISE_BANK,
  ERROR_CODE_CATALOG,
  LEVEL_METADATA,
  TOPIC_METADATA
} from '../../data/assessmentBank';
import { computeStudentAnalytics } from '../../math/assessmentEngine';
import {
  exportAttemptsToCSV,
  exportAssessmentDataJSON,
  importAssessmentDataFromFile
} from '../../services/assessmentStorage';
import {
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
  Database,
  Play,
  RotateCcw
} from 'lucide-react';

interface TeacherDashboardViewProps {
  attempts: ExerciseAttemptRecord[];
  assignments: TeacherAssignment[];
  onSaveAssignment: (assignment: TeacherAssignment) => void;
  onDeleteAssignment: (id: string) => void;
  onImportData: (attempts: ExerciseAttemptRecord[], assignments: TeacherAssignment[]) => void;
  onClearAttempts: () => void;
  onSelectExercise: (exercise: AssessmentExercise) => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  attempts,
  assignments,
  onSaveAssignment,
  onDeleteAssignment,
  onImportData,
  onClearAttempts,
  onSelectExercise
}) => {
  const analytics = useMemo(() => computeStudentAnalytics(attempts), [attempts]);

  // Assignment Builder State
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [builderTopic, setBuilderTopic] = useState<'ALL' | AssessmentTopicId>('ALL');
  const [builderLevel, setBuilderLevel] = useState<'ALL' | CognitiveLevel>('ALL');
  const [selectedExIds, setSelectedExIds] = useState<string[]>(['A01', 'B02', 'C07', 'D05']);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredPool = useMemo(() => {
    return ASSESSMENT_EXERCISE_BANK.filter(ex => {
      if (builderTopic !== 'ALL' && ex.topic !== builderTopic) return false;
      if (builderLevel !== 'ALL' && ex.level !== builderLevel) return false;
      return true;
    });
  }, [builderTopic, builderLevel]);

  const toggleExerciseSelection = (id: string) => {
    setSelectedExIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedExIds.length === 0) {
      setStatusBanner('Vui lòng nhập tên bộ bài tập và chọn ít nhất 1 bài tập.');
      return;
    }

    const chosenExercises = ASSESSMENT_EXERCISE_BANK.filter(ex =>
      selectedExIds.includes(ex.id)
    );
    const topics = Array.from(
      new Set(chosenExercises.map(ex => ex.topic))
    ) as AssessmentTopicId[];
    const levels = Array.from(
      new Set(chosenExercises.map(ex => ex.level))
    ) as CognitiveLevel[];

    const newAssignment: TeacherAssignment = {
      id: `assign_${Date.now()}`,
      title: title.trim(),
      description:
        description.trim() ||
        `Bộ đề gồm ${selectedExIds.length} bài tập chuẩn hóa Toán 10.`,
      createdAt: Date.now(),
      targetTopics: topics,
      targetLevels: levels,
      exerciseIds: selectedExIds
    };

    onSaveAssignment(newAssignment);
    setTitle('');
    setDescription('');
    setStatusBanner(`Đã lưu bộ bài tập "${newAssignment.title}" vào IndexedDB cục bộ.`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await importAssessmentDataFromFile(file);
      onImportData(res.attempts, res.assignments);
      setStatusBanner(`Đã nhập thành công ${res.importedCount} bản ghi từ tệp ${file.name}.`);
    } catch {
      setStatusBanner('Tệp nhập vào không đúng định dạng JSON/CSV của OPTIMATH LAB.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const maxErrorCount = Math.max(
    1,
    ...analytics.errorFrequency.map(item => item.count)
  );

  return (
    <div className="space-y-6">
      {/* Top Local Storage Notice & Export/Import Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-indigo-700 font-bold">
            <Database className="w-4 h-4" />
            <span>Chế độ Lưu trữ Cục bộ (IndexedDB · Trình duyệt hiện tại)</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Dashboard Giáo viên & Quản lý Đánh giá
          </h2>
          <p className="text-xs text-slate-600">
            Dữ liệu luyện tập và phiếu giao bài được lưu trực tiếp bằng IndexedDB trên thiết bị này. Giáo viên có thể xuất báo cáo CSV (Excel) hoặc sao lưu/nhập tệp JSON giữa các máy tính.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => exportAttemptsToCSV(attempts)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất CSV ({attempts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => exportAssessmentDataJSON(attempts, assignments)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Xuất JSON</span>
          </button>

          <label className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Nhập JSON/CSV</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {attempts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onClearAttempts();
                setStatusBanner('Đã đặt lại lịch sử làm bài cục bộ trên trình duyệt.');
              }}
              className="px-3 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại tiến độ</span>
            </button>
          )}
        </div>
      </div>

      {statusBanner && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs flex items-center justify-between">
          <span className="font-medium">{statusBanner}</span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-indigo-700 font-bold hover:underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Split: Left Assignment Creator + Right Error & Topic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Create & Assign Exercise Sets (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              1. Tạo Bộ Bài Tập & Giao Nhiệm Vụ
            </h3>
            <p className="text-xs text-slate-500">
              Chọn chủ đề, mức độ nhận thức và tích chọn các câu hỏi từ ngân hàng 40 bài tập chuẩn hóa
            </p>
          </div>

          <form onSubmit={handleCreateAssignment} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên phiếu bài tập / nhiệm vụ:
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="VD: Kiểm tra 15 phút - Hệ BPT & Tối ưu tuyến tính"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hướng dẫn / Ghi chú cho học sinh:
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="VD: Hoàn thành không dùng gợi ý cấp 3, chú ý kiểm tra tọa độ phân số..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Lọc theo chủ đề:
                </label>
                <select
                  value={builderTopic}
                  onChange={e =>
                    setBuilderTopic(e.target.value as 'ALL' | AssessmentTopicId)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="ALL">Tất cả 4 chủ đề</option>
                  <option value="A">Chủ đề A: Một BPT</option>
                  <option value="B">Chủ đề B: Miền nghiệm</option>
                  <option value="C">Chủ đề C: Hệ BPT</option>
                  <option value="D">Chủ đề D: Tối ưu tuyến tính</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Lọc theo mức độ:
                </label>
                <select
                  value={builderLevel}
                  onChange={e =>
                    setBuilderLevel(e.target.value as 'ALL' | CognitiveLevel)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="ALL">Tất cả 4 mức độ</option>
                  <option value="nhan_biet">Nhận biết</option>
                  <option value="thong_hieu">Thông hiểu</option>
                  <option value="van_dung">Vận dụng</option>
                  <option value="van_dung_cao">Vận dụng cao</option>
                </select>
              </div>
            </div>

            {/* Exercise Selection Checklist */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Chọn bài tập ({selectedExIds.length} bài đã chọn):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedExIds(filteredPool.map(e => e.id))
                    }
                    className="text-[11px] text-indigo-700 font-semibold hover:underline cursor-pointer"
                  >
                    Chọn tất cả đang lọc
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedExIds([])}
                    className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {filteredPool.map(ex => {
                  const checked = selectedExIds.includes(ex.id);
                  return (
                    <label
                      key={ex.id}
                      className="px-3 py-2 flex items-center justify-between gap-2 text-xs hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExerciseSelection(ex.id)}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        <span className="font-mono font-bold text-slate-900">
                          {ex.id}
                        </span>
                        <span className="truncate text-slate-700">{ex.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0">
                        {LEVEL_METADATA[ex.level].label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Giao bộ bài tập này ({selectedExIds.length} câu)</span>
            </button>
          </form>

          {/* Existing Teacher Assignments */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800">
              Danh sách bộ đề đã giao ({assignments.length}):
            </h4>
            {assignments.map(a => (
              <div
                key={a.id}
                className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">
                    {a.title}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {a.exerciseIds.length} bài: {a.exerciseIds.join(', ')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteAssignment(a.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                  title="Xóa phiếu bài tập"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Error Statistics & Topic Performance Charts (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Chart 1: Error Statistics by Error Code E01-E10 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                2. Biểu đồ Thống kê Mã Lỗi Học tập (E01 – E10)
              </h3>
              <p className="text-xs text-slate-500">
                Tần suất các lỗi sai được Math Engine phát hiện trong quá trình chấm theo bước
              </p>
            </div>

            <div className="space-y-2.5">
              {(Object.keys(ERROR_CODE_CATALOG) as ErrorCodeId[]).map(code => {
                const def = ERROR_CODE_CATALOG[code];
                const count =
                  analytics.errorFrequency.find(e => e.code === code)?.count || 0;
                const widthPct =
                  count > 0 ? Math.max(8, Math.round((count / maxErrorCount) * 100)) : 2;

                return (
                  <div key={code} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-800 font-medium truncate">
                        <strong className="font-mono text-indigo-700">{code}</strong> · {def.title}
                      </span>
                      <span className="font-mono font-bold tabular-nums text-slate-700 shrink-0">
                        {count} lượt
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          count > 0 ? 'bg-amber-500' : 'bg-slate-200'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Statistics by Topic A, B, C, D */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              3. Thống kê Năng lực & Lỗi theo 4 Chủ đề
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-2 font-bold">Chủ đề</th>
                    <th className="py-2 px-2 font-bold text-right">Hoàn thành</th>
                    <th className="py-2 px-2 font-bold text-right">Đúng lần đầu</th>
                    <th className="py-2 pl-2 font-bold text-right">Tổng lỗi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  {(['A', 'B', 'C', 'D'] as AssessmentTopicId[]).map(tId => {
                    const st = analytics.topicStats[tId];
                    return (
                      <tr key={tId}>
                        <td className="py-2.5 pr-2 font-sans font-bold text-slate-800">
                          {st.shortName}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-700">
                          {st.completedCount}/{st.totalCount}
                        </td>
                        <td className="py-2.5 px-2 text-right text-emerald-700 font-bold">
                          {st.accuracyPercent}%
                        </td>
                        <td className="py-2.5 pl-2 text-right text-amber-700 font-bold">
                          {st.errorCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Detailed Results per Exercise */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              4. Bảng Kết Quả Chi Tiết Theo Bài Tập (40 bài chuẩn hóa)
            </h3>
            <p className="text-xs text-slate-500">
              Theo dõi điểm số, thời gian hoàn thành, cấp gợi ý sử dụng và mã lỗi phát sinh của từng bài
            </p>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-2.5 px-3 font-bold">Mã bài</th>
                <th className="py-2.5 px-3 font-bold">Tên bài tập</th>
                <th className="py-2.5 px-3 font-bold">Mức độ</th>
                <th className="py-2.5 px-3 font-bold text-right">Trạng thái</th>
                <th className="py-2.5 px-3 font-bold text-right">Điểm cao nhất</th>
                <th className="py-2.5 px-3 font-bold text-right">Số lần thử</th>
                <th className="py-2.5 px-3 font-bold">Mã lỗi ghi nhận</th>
                <th className="py-2.5 px-3 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ASSESSMENT_EXERCISE_BANK.map(ex => {
                const exAttempts = attempts.filter(a => a.exerciseId === ex.id);
                const latest = exAttempts[0];
                const bestScore = exAttempts.reduce(
                  (m, a) => Math.max(m, a.scoreEarned),
                  0
                );
                const allErrors = Array.from(
                  new Set(exAttempts.flatMap(a => a.errorCodes))
                );

                return (
                  <tr key={ex.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {ex.id}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {ex.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {LEVEL_METADATA[ex.level].label}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold">
                      {latest?.isCompleted ? (
                        <span className="text-emerald-700 inline-flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Hoàn thành</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Chưa làm</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-800">
                      {latest ? `${bestScore}/${ex.rubric.maxPoints}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {latest ? `${latest.totalAttempts} lần` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-800">
                      {allErrors.length > 0 ? allErrors.join(', ') : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectExercise(ex)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 font-semibold text-slate-700 cursor-pointer inline-flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Mở bài</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
