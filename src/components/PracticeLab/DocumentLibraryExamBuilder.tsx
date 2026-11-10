import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AssessmentExercise,
  AssessmentTopicId,
  CognitiveLevel,
  ExamTypeSlotConfig,
  LibraryDocument,
  QuestionCategoryId,
  TeacherAssignment
} from '../../types/assessment';
import { LEVEL_METADATA, TOPIC_METADATA } from '../../data/assessmentBank';
import {
  BackendHealthStatus,
  QUESTION_CATEGORY_CATALOG,
  checkBackendHealth,
  createVariedExerciseFromSource,
  deleteDocumentFromLibrary,
  downloadSampleDocumentTemplate,
  fetchLibraryDocuments,
  generateExamFromLibrary,
  getCloudDbConfig,
  inferTemplateIdFromExercise,
  parseDocumentContentToExercises,
  saveCloudDbConfig,
  uploadDocumentToLibrary
} from '../../services/documentLibraryService';
import {
  FolderOpen,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Layers,
  Server,
  HardDrive,
  CheckSquare,
  Plus,
  Play,
  Sliders,
  BookOpen
} from 'lucide-react';

interface DocumentLibraryExamBuilderProps {
  onPublishExercisesToBank: (exercises: AssessmentExercise[]) => void;
  onCreateAssignmentFromLibrary: (
    assignment: TeacherAssignment,
    exercises: AssessmentExercise[]
  ) => void;
  onSelectExercise: (exercise: AssessmentExercise) => void;
  onNotify: (message: string) => void;
}

const DEFAULT_SLOT_CONFIGS: ExamTypeSlotConfig[] = [
  { templateId: 'TPL_A1', enabled: true, count: 1, preferredLevel: 'nhan_biet' },
  { templateId: 'TPL_A2', enabled: false, count: 1, preferredLevel: 'thong_hieu' },
  { templateId: 'TPL_B1', enabled: true, count: 1, preferredLevel: 'thong_hieu' },
  { templateId: 'TPL_B2', enabled: false, count: 1, preferredLevel: 'van_dung' },
  { templateId: 'TPL_C1', enabled: true, count: 1, preferredLevel: 'van_dung' },
  { templateId: 'TPL_C2', enabled: false, count: 1, preferredLevel: 'van_dung_cao' },
  { templateId: 'TPL_D1', enabled: true, count: 1, preferredLevel: 'van_dung' },
  { templateId: 'TPL_D2', enabled: false, count: 1, preferredLevel: 'van_dung_cao' }
];

export const DocumentLibraryExamBuilder: React.FC<DocumentLibraryExamBuilderProps> = ({
  onPublishExercisesToBank,
  onCreateAssignmentFromLibrary,
  onSelectExercise,
  onNotify
}) => {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [backendStatus, setBackendStatus] = useState<BackendHealthStatus>({
    online: false,
    mode: 'local_hybrid',
    documentsCount: 0,
    storageLocation: 'Đang kiểm tra kết nối Backend...'
  });
  const [activeSubTab, setActiveSubTab] = useState<'exam_builder' | 'upload_library'>('exam_builder');
  const [showCloudDbPanel, setShowCloudDbPanel] = useState<boolean>(false);
  const [sbUrlInput, setSbUrlInput] = useState<string>(() => getCloudDbConfig().supabaseUrl);
  const [sbKeyInput, setSbKeyInput] = useState<string>(() => getCloudDbConfig().supabaseAnonKey);

  // Upload Document State
  const [docTitle, setDocTitle] = useState<string>('');
  const [docTopic, setDocTopic] = useState<AssessmentTopicId | 'ALL'>('ALL');
  const [docDescription, setDocDescription] = useState<string>('');
  const [docRawContent, setDocRawContent] = useState<string>('');
  const [selectedFileMeta, setSelectedFileMeta] = useState<{
    name: string;
    type: string;
    size: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  // Exam Builder from Library State
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [slotConfigs, setSlotConfigs] = useState<ExamTypeSlotConfig[]>(DEFAULT_SLOT_CONFIGS);
  const [allowVariation, setAllowVariation] = useState<boolean>(true);
  const [generatedExamExercises, setGeneratedExamExercises] = useState<AssessmentExercise[]>([]);
  const [examTitle, setExamTitle] = useState<string>(
    'Đề Kiểm Tra Tổ Hợp Từ Kho Tài Liệu (Đủ Dạng Toán 10)'
  );
  const [examDescription, setExamDescription] = useState<string>(
    'Đề được trích xuất tự động theo ma trận các loại câu hỏi từ Kho Thư Viện Tài Liệu Giáo Viên.'
  );

  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchLibraryDocuments(), checkBackendHealth()]).then(([docs, health]) => {
      if (!mounted) return;
      setDocuments(docs);
      setSelectedDocIds(docs.map(d => d.id));
      setBackendStatus({
        ...health,
        documentsCount: docs.length
      });
      // Sync all library exercises into bank so student mode can play any of them
      const allLibExercises = docs.flatMap(d => d.extractedExercises);
      if (allLibExercises.length > 0) {
        onPublishExercisesToBank(allLibExercises);
      }
      // Generate an initial preview exam from library
      const initialExam = generateExamFromLibrary({
        documents: docs,
        selectedDocumentIds: docs.map(d => d.id),
        slotConfigs: DEFAULT_SLOT_CONFIGS,
        allowParameterVariation: false
      });
      setGeneratedExamExercises(initialExam);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Preview of questions that will be extracted from current upload text
  const liveUploadPreviewExercises = useMemo(() => {
    if (!docRawContent.trim()) return [];
    return parseDocumentContentToExercises(
      docRawContent,
      selectedFileMeta?.name || 'tai_lieu_moi.txt',
      'PREVIEW',
      docTitle || 'Tài liệu mới',
      docTopic
    );
  }, [docRawContent, selectedFileMeta, docTitle, docTopic]);

  // Available counts per question type across currently selected documents
  const availableCountByType = useMemo(() => {
    const activeDocs =
      selectedDocIds.length > 0
        ? documents.filter(d => selectedDocIds.includes(d.id))
        : documents;
    const map: Record<QuestionCategoryId, number> = {
      TPL_A1: 0,
      TPL_A2: 0,
      TPL_B1: 0,
      TPL_B2: 0,
      TPL_C1: 0,
      TPL_C2: 0,
      TPL_D1: 0,
      TPL_D2: 0
    };
    for (const doc of activeDocs) {
      for (const ex of doc.extractedExercises) {
        const tpl = ex.templateId || inferTemplateIdFromExercise(ex);
        map[tpl] = (map[tpl] || 0) + 1;
      }
    }
    return map;
  }, [documents, selectedDocIds]);

  const totalLibraryQuestions = useMemo(
    () => documents.reduce((sum, d) => sum + d.extractedExercises.length, 0),
    [documents]
  );

  const totalRequestedQuestions = useMemo(
    () =>
      slotConfigs
        .filter(s => s.enabled)
        .reduce((sum, s) => sum + Math.max(1, s.count), 0),
    [slotConfigs]
  );

  const handleFileUploadSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
      setSelectedFileMeta({
        name: file.name,
        type: ext,
        size: file.size
      });
      if (!docTitle.trim()) {
        setDocTitle(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
      }
      setDocRawContent(text);
    } catch {
      onNotify('Không thể đọc nội dung tệp. Vui lòng chọn tệp văn bản (.txt, .md, .json, .csv).');
    } finally {
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  };

  const handleSaveUploadedDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docRawContent.trim()) {
      onNotify('Vui lòng tải tệp tài liệu lên hoặc dán nội dung câu hỏi vào ô nội dung.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadDocumentToLibrary({
        title: docTitle || selectedFileMeta?.name || `Tài liệu Toán 10 (${new Date().toLocaleDateString('vi-VN')})`,
        fileName: selectedFileMeta?.name || `tai_lieu_${Date.now()}.txt`,
        fileType: selectedFileMeta?.type || 'txt',
        fileSize: selectedFileMeta?.size || docRawContent.length,
        topic: docTopic,
        description: docDescription,
        rawContent: docRawContent
      });

      setDocuments(res.allDocuments);
      setSelectedDocIds(prev =>
        prev.includes(res.document.id) ? prev : [res.document.id, ...prev]
      );
      onPublishExercisesToBank(res.document.extractedExercises);

      setDocTitle('');
      setDocDescription('');
      setDocRawContent('');
      setSelectedFileMeta(null);
      setExpandedDocId(res.document.id);

      onNotify(
        `Đã lưu tài liệu "${res.document.title}" vào Kho Thư Viện (${res.savedToBackend ? 'Backend Server + Local' : 'Local Storage'}) và bóc tách thành công ${res.document.extractedExercises.length} câu hỏi!`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string, title: string) => {
    const updated = await deleteDocumentFromLibrary(docId);
    setDocuments(updated);
    setSelectedDocIds(prev => prev.filter(id => id !== docId));
    onNotify(`Đã xóa tài liệu "${title}" khỏi Kho Thư Viện.`);
  };

  const handleDownloadRawDocument = (doc: LibraryDocument) => {
    const blob = new Blob(['\uFEFF' + doc.rawContent], {
      type: 'text/plain;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName || `${doc.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocIds(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const updateSlotConfig = (
    templateId: QuestionCategoryId,
    patch: Partial<ExamTypeSlotConfig>
  ) => {
    setSlotConfigs(prev =>
      prev.map(slot =>
        slot.templateId === templateId ? { ...slot, ...patch } : slot
      )
    );
  };

  const applyPresetMatrix = (preset: '15m' | '45m' | 'practical') => {
    if (preset === '15m') {
      setSlotConfigs([
        { templateId: 'TPL_A1', enabled: true, count: 1, preferredLevel: 'nhan_biet' },
        { templateId: 'TPL_A2', enabled: false, count: 1, preferredLevel: 'thong_hieu' },
        { templateId: 'TPL_B1', enabled: true, count: 1, preferredLevel: 'thong_hieu' },
        { templateId: 'TPL_B2', enabled: false, count: 1, preferredLevel: 'van_dung' },
        { templateId: 'TPL_C1', enabled: true, count: 1, preferredLevel: 'van_dung' },
        { templateId: 'TPL_C2', enabled: false, count: 1, preferredLevel: 'van_dung_cao' },
        { templateId: 'TPL_D1', enabled: true, count: 1, preferredLevel: 'van_dung' },
        { templateId: 'TPL_D2', enabled: false, count: 1, preferredLevel: 'van_dung_cao' }
      ]);
      setExamTitle('Đề Kiểm Tra 15 Phút (Trích xuất từ Kho Tài Liệu)');
    } else if (preset === '45m') {
      setSlotConfigs(
        QUESTION_CATEGORY_CATALOG.map(cat => ({
          templateId: cat.id,
          enabled: true,
          count: 1,
          preferredLevel: cat.defaultLevel
        }))
      );
      setExamTitle('Đề Kiểm Tra Định Kỳ 45 Phút (Đủ 8 Dạng Câu Hỏi Từ Kho)');
    } else {
      setSlotConfigs([
        { templateId: 'TPL_A1', enabled: false, count: 1, preferredLevel: 'nhan_biet' },
        { templateId: 'TPL_A2', enabled: false, count: 1, preferredLevel: 'thong_hieu' },
        { templateId: 'TPL_B1', enabled: false, count: 1, preferredLevel: 'thong_hieu' },
        { templateId: 'TPL_B2', enabled: true, count: 1, preferredLevel: 'van_dung' },
        { templateId: 'TPL_C1', enabled: true, count: 1, preferredLevel: 'van_dung' },
        { templateId: 'TPL_C2', enabled: false, count: 1, preferredLevel: 'van_dung_cao' },
        { templateId: 'TPL_D1', enabled: true, count: 1, preferredLevel: 'van_dung' },
        { templateId: 'TPL_D2', enabled: true, count: 1, preferredLevel: 'van_dung_cao' }
      ]);
      setExamTitle('Đề Chuyên Đề Toán Thực Tế & Quy Hoạch Tuyến Tính (MAX/MIN)');
    }
  };

  const handleGenerateExamNow = () => {
    const enabledCount = slotConfigs.filter(s => s.enabled).length;
    if (enabledCount === 0) {
      onNotify('Vui lòng tích chọn ít nhất 1 loại câu hỏi để rút đề từ Kho Tài Liệu.');
      return;
    }

    const result = generateExamFromLibrary({
      documents,
      selectedDocumentIds: selectedDocIds,
      slotConfigs,
      allowParameterVariation: allowVariation
    });

    setGeneratedExamExercises(result);
    onPublishExercisesToBank(result);
    onNotify(
      `Đã rút trích và trộn thành công bộ đề gồm ${result.length} câu hỏi đúng theo các dạng đã chọn từ Kho Tài Liệu!`
    );
  };

  const handleSwapSingleExercise = (indexToSwap: number) => {
    const currentEx = generatedExamExercises[indexToSwap];
    if (!currentEx) return;
    const tpl = currentEx.templateId || inferTemplateIdFromExercise(currentEx);

    const activeDocs =
      selectedDocIds.length > 0
        ? documents.filter(d => selectedDocIds.includes(d.id))
        : documents;

    const sameTypePool = activeDocs
      .flatMap(d => d.extractedExercises)
      .filter(
        ex =>
          (ex.templateId || inferTemplateIdFromExercise(ex)) === tpl &&
          ex.id !== currentEx.id
      );

    let replacement: AssessmentExercise;
    if (sameTypePool.length > 0 && (!allowVariation || Math.random() < 0.6)) {
      const pick = sameTypePool[Math.floor(Math.random() * sameTypePool.length)];
      replacement = allowVariation
        ? createVariedExerciseFromSource(pick, Math.floor(Math.random() * 5) + 1)
        : pick;
    } else {
      replacement = createVariedExerciseFromSource(
        currentEx,
        Math.floor(Math.random() * 7) + 1
      );
    }

    onPublishExercisesToBank([replacement]);
    setGeneratedExamExercises(prev =>
      prev.map((item, idx) => (idx === indexToSwap ? replacement : item))
    );
  };

  const handlePublishGeneratedExamAssignment = () => {
    if (generatedExamExercises.length === 0) {
      onNotify('Chưa có câu hỏi nào trong đề. Hãy bấm "Rút Câu Hỏi Từ Kho & Tạo Đề" trước.');
      return;
    }

    onPublishExercisesToBank(generatedExamExercises);

    const topics = Array.from(
      new Set(generatedExamExercises.map(e => e.topic))
    ) as AssessmentTopicId[];
    const levels = Array.from(
      new Set(generatedExamExercises.map(e => e.level))
    ) as CognitiveLevel[];

    const newAssignment: TeacherAssignment = {
      id: `assign_lib_${Date.now()}`,
      title:
        examTitle.trim() ||
        `Đề Từ Kho Tài Liệu (${generatedExamExercises.length} câu)`,
      description:
        examDescription.trim() ||
        `Bộ đề gồm ${generatedExamExercises.length} câu hỏi trích xuất theo dạng từ Kho Thư Viện Tài Liệu Giáo Viên.`,
      createdAt: Date.now(),
      targetTopics: topics,
      targetLevels: levels,
      exerciseIds: generatedExamExercises.map(e => e.id)
    };

    onCreateAssignmentFromLibrary(newAssignment, generatedExamExercises);
    onNotify(
      `Đã lưu và giao bộ đề "${newAssignment.title}" (${generatedExamExercises.length} câu hỏi từ Kho Tài Liệu) cho chế độ Học sinh!`
    );
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50/70 via-white to-indigo-50/70 rounded-2xl border-2 border-emerald-300 p-4 sm:p-6 shadow-xs space-y-5">
      {/* Header & Backend Connection Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-emerald-200/80 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wider">
              <Server className="w-3 h-3" />
              Backend Kho Thư Viện Tài Liệu & Tạo Đề Theo Ma Trận Dạng Toán
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                backendStatus.online
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              <HardDrive className="w-3 h-3" />
              <span>
                {backendStatus.online
                  ? `CSDL Online (${backendStatus.storageLocation})`
                  : `Lưu trữ Đồng bộ Hybrid (${backendStatus.storageLocation})`}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setShowCloudDbPanel(prev => !prev)}
              className="px-2.5 py-0.5 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold text-[11px] border border-indigo-300 cursor-pointer transition"
            >
              {showCloudDbPanel ? 'Đóng cài đặt CSDL' : '⚙️ Kết nối CSDL Đám mây (Supabase)'}
            </button>
          </div>

          <h3 className="text-base sm:text-xl font-extrabold text-slate-900">
            Kho Thư Viện Tài Liệu Giáo Viên & Trình Tạo Đề Phong Phú Theo Loại Câu Hỏi
          </h3>
          <p className="text-xs text-slate-600">
            Tải tài liệu của bạn lên kho lưu trữ (hỗ trợ <code className="font-mono bg-slate-100 px-1 rounded">.txt, .md, .json, .csv</code>), hệ thống tự động bóc tách & phân loại câu hỏi theo 8 dạng chuẩn Toán 10. Khi tạo đề, chỉ cần tích chọn các loại câu hỏi để rút câu đúng dạng từ kho tài liệu!
          </p>
        </div>

        {/* Sub-navigation Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('exam_builder')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'exam_builder'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>1. Tạo Đề Từ Kho Theo Loại Câu Hỏi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('upload_library')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'upload_library'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>
              2. Tải Tài Liệu Lên & Quản Lý Kho ({documents.length} tài liệu · {totalLibraryQuestions} câu)
            </span>
          </button>
        </div>
      </div>

      {showCloudDbPanel && (
        <div className="bg-indigo-950 text-white rounded-2xl p-4 space-y-3 text-xs border border-indigo-700 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-extrabold text-sm text-indigo-200">
                Kết Nối Cơ Sở Dữ Liệu Đám Mây (Supabase PostgreSQL Miễn Phí)
              </h4>
              <p className="text-[11px] text-indigo-300 mt-0.5">
                Khi chạy trên máy hoặc Render/Railway, phần mềm tự động lưu vào <code className="text-emerald-300">server/data/db.json</code>. Nếu deploy lên GitHub Pages / Vercel, bạn có thể dán URL & Anon Key của Supabase (sau khi chạy file <code className="text-amber-300">server/schema.sql</code>) để lưu trữ CSDL đám mây vĩnh viễn!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
            <div className="md:col-span-5">
              <label className="block text-[11px] font-bold text-indigo-200 mb-1">
                Supabase Project URL (VD: https://xyz.supabase.co):
              </label>
              <input
                type="text"
                value={sbUrlInput}
                onChange={e => setSbUrlInput(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 rounded-xl bg-indigo-900/90 border border-indigo-600 text-white text-xs font-mono focus:outline-none"
              />
            </div>
            <div className="md:col-span-5">
              <label className="block text-[11px] font-bold text-indigo-200 mb-1">
                Supabase Anon Public Key:
              </label>
              <input
                type="password"
                value={sbKeyInput}
                onChange={e => setSbKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 rounded-xl bg-indigo-900/90 border border-indigo-600 text-white text-xs font-mono focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 flex gap-1.5">
              <button
                type="button"
                onClick={async () => {
                  saveCloudDbConfig({
                    supabaseUrl: sbUrlInput,
                    supabaseAnonKey: sbKeyInput
                  });
                  const [health, docs] = await Promise.all([
                    checkBackendHealth(),
                    fetchLibraryDocuments()
                  ]);
                  setBackendStatus({ ...health, documentsCount: docs.length });
                  setDocuments(docs);
                  onNotify(
                    health.mode === 'supabase_cloud'
                      ? `Đã kết nối thành công tới CSDL Đám mây Supabase (${health.storageLocation})!`
                      : 'Đã lưu cấu hình CSDL. Hệ thống đang hoạt động ở chế độ Backend / Hybrid.'
                  );
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs cursor-pointer transition"
              >
                Lưu & Kết nối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 1: CREATE EXAM BY SELECTING QUESTION TYPES FROM LIBRARY       */}
      {/* ===================================================================== */}
      {activeSubTab === 'exam_builder' ? (
        <div className="space-y-5">
          {/* Step 1: Select Source Documents in Library */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                  1
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Chọn Tài Liệu Nguồn Trong Kho Thư Viện ({selectedDocIds.length}/{documents.length} tài liệu đang chọn)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Chọn tài liệu bạn vừa tải lên hoặc chọn tất cả tài liệu trong kho để lấy câu hỏi phong phú
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDocIds(documents.map(d => d.id))}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold cursor-pointer"
                >
                  Chọn tất cả ({documents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('upload_library')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>+ Tải thêm tài liệu mới lên kho</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {documents.map(doc => {
                const isSelected = selectedDocIds.includes(doc.id);
                return (
                  <label
                    key={doc.id}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition text-xs ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-400 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleDocSelection(doc.id)}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 truncate">{doc.title}</div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="font-mono text-emerald-800 font-bold">
                          {doc.extractedExercises.length} câu hỏi
                        </span>
                        <span>•</span>
                        <span className="truncate">{doc.fileName}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Question Types & Quantities Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                  2
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Chọn Các Loại Câu Hỏi & Số Lượng Câu Cần Lấy Từ Kho Tài Liệu
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tích chọn các dạng câu hỏi bạn muốn có trong đề, chọn mức độ nhận thức và số lượng câu cho từng dạng
                  </p>
                </div>
              </div>

              {/* Preset Matrices */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500 font-semibold mr-1">Mẫu ma trận nhanh:</span>
                <button
                  type="button"
                  onClick={() => applyPresetMatrix('15m')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
                >
                  Đề 15 phút (4 câu)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetMatrix('45m')}
                  className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 font-bold text-indigo-800 cursor-pointer"
                >
                  Đề 45 phút (Đủ 8 dạng)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetMatrix('practical')}
                  className="px-2.5 py-1 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 font-bold text-purple-800 cursor-pointer"
                >
                  Đề Toán Thực Tế & Tối Ưu
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {QUESTION_CATEGORY_CATALOG.map(cat => {
                const slot =
                  slotConfigs.find(s => s.templateId === cat.id) || {
                    templateId: cat.id,
                    enabled: false,
                    count: 1,
                    preferredLevel: 'ALL'
                  };
                const availableInDocs = availableCountByType[cat.id] || 0;

                return (
                  <div
                    key={cat.id}
                    className={`p-3.5 rounded-xl border transition flex flex-col justify-between gap-2.5 ${
                      slot.enabled
                        ? 'bg-emerald-50/40 border-emerald-400 shadow-2xs'
                        : 'bg-slate-50/40 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <label className="flex items-start gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={slot.enabled}
                          onChange={e =>
                            updateSlotConfig(cat.id, { enabled: e.target.checked })
                          }
                          className="mt-0.5 rounded border-slate-300 text-emerald-600"
                        />
                        <div>
                          <div className="text-xs font-extrabold text-slate-900">
                            {cat.shortTitle}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                            {cat.description}
                          </p>
                        </div>
                      </label>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${cat.badgeColor}`}
                      >
                        Kho có: {availableInDocs} câu gốc
                      </span>
                    </div>

                    {slot.enabled && (
                      <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-700">
                            Số câu lấy:
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={6}
                            value={slot.count}
                            onChange={e =>
                              updateSlotConfig(cat.id, {
                                count: Math.max(1, Math.min(6, parseInt(e.target.value, 10) || 1))
                              })
                            }
                            className="w-14 px-2 py-1 rounded-lg border border-emerald-300 bg-white font-mono font-bold text-center text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-700">
                            Mức độ:
                          </span>
                          <select
                            value={slot.preferredLevel}
                            onChange={e =>
                              updateSlotConfig(cat.id, {
                                preferredLevel: e.target.value as 'ALL' | CognitiveLevel
                              })
                            }
                            className="px-2 py-1 rounded-lg border border-emerald-300 bg-white font-semibold text-xs text-slate-800"
                          >
                            <option value="ALL">Mọi mức độ trong kho</option>
                            <option value="nhan_biet">Ưu tiên Nhận biết</option>
                            <option value="thong_hieu">Ưu tiên Thông hiểu</option>
                            <option value="van_dung">Ưu tiên Vận dụng</option>
                            <option value="van_dung_cao">Ưu tiên Vận dụng cao</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Smart Parameter Mutation Toggle & Generate Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs text-slate-800 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowVariation}
                  onChange={e => setAllowVariation(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600"
                />
                <span>
                  Kết hợp biến thiên bộ số thông minh từ câu gốc trong tài liệu (Tạo đề phong phú, không trùng lặp khi trộn nhiều mã đề)
                </span>
              </label>

              <button
                type="button"
                onClick={handleGenerateExamNow}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  Lấy Câu Hỏi Đúng Dạng Từ Kho & Trộn Đề ({totalRequestedQuestions} câu)
                </span>
              </button>
            </div>
          </div>

          {/* Step 3: Preview Generated Exam & Publish to Student Mode */}
          {generatedExamExercises.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-indigo-200 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Đề Đã Trích Xuất Từ Kho Tài Liệu ({generatedExamExercises.length} câu hỏi)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Bạn có thể bấm &ldquo;Đổi câu khác cùng dạng&rdquo; ở bất kỳ câu nào hoặc bấm &ldquo;Giao Bộ Đề Này Cho Học Sinh&rdquo;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateExamNow}
                  className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Trộn lại mã đề mới từ kho</span>
                </button>
              </div>

              {/* List of Extracted Exam Questions */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {generatedExamExercises.map((ex, idx) => {
                  const tpl = ex.templateId || inferTemplateIdFromExercise(ex);
                  const catMeta =
                    QUESTION_CATEGORY_CATALOG.find(c => c.id === tpl) ||
                    QUESTION_CATEGORY_CATALOG[0];

                  return (
                    <div
                      key={`${ex.id}_${idx}`}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-extrabold text-[11px]">
                            Câu {idx + 1}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded border text-[10px] font-bold ${catMeta.badgeColor}`}
                          >
                            {catMeta.shortTitle}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">
                            {LEVEL_METADATA[ex.level].label}
                          </span>
                          {ex.sourceDocumentTitle && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-semibold truncate max-w-[260px]">
                              Nguồn: {ex.sourceDocumentTitle}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSwapSingleExercise(idx)}
                            className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-[11px] cursor-pointer flex items-center gap-1"
                            title="Lấy câu hỏi khác cùng dạng từ Kho Tài Liệu"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Đổi câu khác cùng dạng</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectExercise(ex)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] cursor-pointer flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>Làm thử</span>
                          </button>
                        </div>
                      </div>

                      <div className="font-bold text-slate-900">{ex.title}</div>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                        {ex.questionText}
                      </p>

                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px]">
                        <strong>Đáp án chuẩn ({ex.steps.length} bước chấm):</strong>{' '}
                        {ex.canonicalAnswerSummary}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save & Assign Exam Form */}
              <div className="pt-3 border-t border-indigo-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-5">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tên Đề Thi / Phiếu Bài Tập Giao Học Sinh:
                  </label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={e => setExamTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ghi chú hướng dẫn cho Học sinh:
                  </label>
                  <input
                    type="text"
                    value={examDescription}
                    onChange={e => setExamDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={handlePublishGeneratedExamAssignment}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Giao Đề Này Cho Học Sinh ({generatedExamExercises.length} câu)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ===================================================================== */
        /* SUB-TAB 2: UPLOAD DOCUMENTS & MANAGE DOCUMENT REPOSITORY              */
        /* ===================================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Upload Document Form (6 cols) */}
          <form
            onSubmit={handleSaveUploadedDocument}
            className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Tải Tài Liệu Mới Lên Kho Lưu Trữ Backend
                </h4>
                <p className="text-[11px] text-slate-500">
                  Hỗ trợ tải tệp <code className="font-mono">.txt, .md, .json, .csv</code> hoặc dán trực tiếp nội dung câu hỏi từ Word/PDF
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => downloadSampleDocumentTemplate('txt')}
                  className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-[11px] cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Tải Mẫu .TXT</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadSampleDocumentTemplate('json')}
                  className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Tải Mẫu .JSON</span>
                </button>
              </div>
            </div>

            {/* File Picker Dropzone */}
            <label className="block border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 rounded-2xl p-4 text-center cursor-pointer transition">
              <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
              <div className="text-xs font-extrabold text-indigo-950">
                {selectedFileMeta
                  ? `Đã chọn tệp: ${selectedFileMeta.name} (${Math.round(selectedFileMeta.size / 1024 || 1)} KB)`
                  : 'Bấm để chọn tệp tài liệu từ máy tính (.txt, .md, .json, .csv)'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Hệ thống sẽ lưu trữ tài liệu vào Kho Backend và tự động bóc tách các câu hỏi theo 8 dạng chuẩn
              </div>
              <input
                ref={uploadInputRef}
                type="file"
                accept=".txt,.md,.json,.csv"
                onChange={handleFileUploadSelect}
                className="hidden"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tên tài liệu lưu trong Kho:
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="VD: Đề cương BPT & Quy hoạch tuyến tính Tổ Toán..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Chủ đề mặc định:
                </label>
                <select
                  value={docTopic}
                  onChange={e =>
                    setDocTopic(e.target.value as AssessmentTopicId | 'ALL')
                  }
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
                >
                  <option value="ALL">Tự động phân loại (A–D)</option>
                  <option value="A">Chủ đề A: Một BPT</option>
                  <option value="B">Chủ đề B: Miền nghiệm</option>
                  <option value="C">Chủ đề C: Hệ BPT</option>
                  <option value="D">Chủ đề D: Tối ưu MAX/MIN</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Mô tả / Ghi chú nguồn tài liệu:
              </label>
              <input
                type="text"
                value={docDescription}
                onChange={e => setDocDescription(e.target.value)}
                placeholder="VD: Tài liệu ôn tập kiểm tra giữa kỳ 1 khối 10..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <label className="font-bold text-slate-700">
                  Nội dung tài liệu (Có thể chỉnh sửa hoặc dán trực tiếp các câu hỏi vào đây):
                </label>
                {liveUploadPreviewExercises.length > 0 && (
                  <span className="text-emerald-700 font-extrabold">
                    Phát hiện {liveUploadPreviewExercises.length} câu hỏi hợp lệ!
                  </span>
                )}
              </div>
              <textarea
                rows={6}
                value={docRawContent}
                onChange={e => setDocRawContent(e.target.value)}
                placeholder={`Ví dụ cách nhập hoặc nội dung tệp tải lên:\nCâu 1 [TPL_A1 - Nhận biết]: Cho bất phương trình 2x + 3y <= 12 và điểm M(2; 1). Kiểm tra M có thuộc miền nghiệm không.\n---\nCâu 2 [TPL_D1 - Vận dụng]: Tìm lợi nhuận lớn nhất F(x; y) = 50x + 40y tại đỉnh A(3; 2).`}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>
                {isUploading
                  ? 'Đang lưu lên Kho Backend...'
                  : `Lưu Vào Kho Thư Viện & Bóc Tách Câu Hỏi (${liveUploadPreviewExercises.length} câu)`}
              </span>
            </button>
          </form>

          {/* Right: Stored Documents Repository List (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Kho Thư Viện Tài Liệu Đã Lưu Trữ ({documents.length} tài liệu)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Tổng cộng {totalLibraryQuestions} câu hỏi đã được phân loại sẵn sàng để tạo đề
                </p>
              </div>
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {documents.map(doc => {
                const isExpanded = expandedDocId === doc.id;
                const typeEntries = Object.entries(doc.questionTypeCounts || {});

                return (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-slate-200 p-3.5 space-y-2.5 bg-slate-50/60 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-extrabold text-slate-900 truncate">
                            {doc.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {doc.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDownloadRawDocument(doc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                          title="Tải xuống tệp tài liệu gốc"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id, doc.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Xóa tài liệu khỏi kho"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Question Type Badges in this Document */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold text-[10px]">
                        Tổng: {doc.extractedExercises.length} câu hỏi
                      </span>
                      {typeEntries.map(([tplId, cnt]) => {
                        const meta = QUESTION_CATEGORY_CATALOG.find(c => c.id === tplId);
                        return (
                          <span
                            key={tplId}
                            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold"
                          >
                            {meta ? meta.shortTitle.split(':')[0] : tplId}: {cnt} câu
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 text-[11px]">
                      <span className="text-slate-400 font-mono truncate max-w-[200px]">
                        {doc.fileName} • {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                      </span>

                      <button
                        type="button"
                        onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                        className="text-indigo-700 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Ẩn danh sách câu hỏi</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Xem {doc.extractedExercises.length} câu hỏi trong tài liệu</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="pt-2 space-y-2 border-t border-indigo-100">
                        {doc.extractedExercises.map((ex, i) => {
                          const tpl = ex.templateId || inferTemplateIdFromExercise(ex);
                          return (
                            <div
                              key={ex.id}
                              className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-900">
                                  Câu {i + 1} [{tpl} • {LEVEL_METADATA[ex.level].label}]: {ex.title}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onSelectExercise(ex)}
                                  className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] hover:bg-indigo-100 cursor-pointer shrink-0"
                                >
                                  Mở bài
                                </button>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2">
                                {ex.questionText}
                              </p>
                              <div className="text-[10px] text-emerald-800 font-semibold">
                                Đáp án: {ex.canonicalAnswerSummary}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
