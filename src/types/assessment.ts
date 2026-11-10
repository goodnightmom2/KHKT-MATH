import {
  Inequality,
  Point2D,
  SystemInequality,
  ObjectiveFunction,
  RealWorldScenario,
  BoundaryStyle
} from './math';

export type AssessmentTopicId = 'A' | 'B' | 'C' | 'D';

export type CognitiveLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

export type QuestionCategoryId =
  | 'TPL_A1' // Dạng 1 (Chủ đề A): Kiểm tra điểm M(x0; y0) thuộc miền nghiệm BPT
  | 'TPL_A2' // Dạng 2 (Chủ đề A): Nhận diện đường thẳng bờ (d) & Kiểu nét vẽ (Liền/Đứt)
  | 'TPL_B1' // Dạng 3 (Chủ đề B): Biểu diễn miền nghiệm BPT trên mặt phẳng Oxy
  | 'TPL_B2' // Dạng 4 (Chủ đề B): Bài toán thực tế lập BPT bậc nhất hai ẩn
  | 'TPL_C1' // Dạng 5 (Chủ đề C): Tìm giao điểm hai đường bờ & Kiểm tra đỉnh Hệ BPT
  | 'TPL_C2' // Dạng 6 (Chủ đề C): Phân loại miền nghiệm Hệ BPT & Đa giác nghiệm
  | 'TPL_D1' // Dạng 7 (Chủ đề D): Tối ưu hóa Lợi nhuận LỚN NHẤT (MAX)
  | 'TPL_D2'; // Dạng 8 (Chủ đề D): Tối ưu hóa Chi phí NHỎ NHẤT (MIN)

export type ExerciseInteractionType =
  | 'multiple_choice'          // 1. Chọn đáp án đúng
  | 'enter_coordinate'         // 2. Nhập tọa độ điểm
  | 'select_feasible_point'    // 3. Chọn điểm thuộc miền nghiệm
  | 'drag_point_to_region'     // 4. Kéo điểm vào miền nghiệm
  | 'select_half_plane'        // 5. Chọn nửa mặt phẳng đúng
  | 'draw_boundary_line'       // 6. Vẽ đường biên
  | 'identify_feasible_region' // 7. Xác định miền giao
  | 'find_intersection'        // 8. Tìm giao điểm
  | 'enter_objective_value'    // 9. Nhập giá trị hàm mục tiêu
  | 'find_optimal_solution';   // 10. Xác định phương án tối ưu

export type ErrorCodeId =
  | 'E01' // Thay tọa độ sai
  | 'E02' // Nhầm dấu bất phương trình
  | 'E03' // Chọn sai điểm trên đường biên
  | 'E04' // Chọn điểm thử nằm trên đường biên
  | 'E05' // Chọn sai nửa mặt phẳng
  | 'E06' // Tính sai giao điểm
  | 'E07' // Chọn điểm không thỏa toàn bộ hệ
  | 'E08' // Lập sai ràng buộc thực tế
  | 'E09' // Xác định sai hàm mục tiêu
  | 'E10'; // Kết luận tối ưu sai

export interface ErrorCodeDefinition {
  code: ErrorCodeId;
  title: string;
  topic: AssessmentTopicId;
  description: string;
  commonCauses: string[];
  socraticQuestion: string;
  remediationAdvice: string;
  remedialExerciseIds: string[];
}

export interface ExerciseStepPrompt {
  stepIndex: number;
  title: string;
  instruction: string;
  inputType:
    | 'choice'
    | 'coordinate'
    | 'number'
    | 'canvas_drag_point'
    | 'canvas_half_plane'
    | 'canvas_boundary'
    | 'multi_point_select';
  choices?: {
    id: string;
    label: string;
    value: string;
    errorCodeIfChosen?: ErrorCodeId;
    feedbackIfChosen?: string;
  }[];
  expectedValue?: string | number;
  expectedPoint?: Point2D;
  expectedBoundaryStyle?: BoundaryStyle;
  expectedHalfPlaneSide?: 'with_test' | 'without_test';
  targetLineIndices?: [number, number];
  tolerance?: number;
}

export interface ExerciseRubric {
  maxPoints: number;
  criteria: {
    stepIndex: number;
    description: string;
    points: number;
  }[];
}

export interface AssessmentExercise {
  id: string; // e.g., 'A01' .. 'D10'
  topic: AssessmentTopicId;
  level: CognitiveLevel;
  interactionType: ExerciseInteractionType;
  title: string;
  learningObjective: string; // Yêu cầu cần đạt
  questionText: string;
  contextStory?: string;
  sourceDocumentId?: string;
  sourceDocumentTitle?: string;
  templateId?: QuestionCategoryId;

  // Dữ liệu Toán học phục vụ Math Engine & Graph Engine
  mathData: {
    inequality?: Inequality;
    system?: SystemInequality[];
    objective?: ObjectiveFunction;
    scenario?: RealWorldScenario;
    candidatePoints?: { label: string; point: Point2D }[];
    testPoint?: Point2D;
    intersectionLinePair?: [number, number]; // indices in system
    evaluationVertex?: { label: string; point: Point2D };
  };

  // Các bước thực hiện & chấm theo bước
  steps: ExerciseStepPrompt[];

  // Đáp án chuẩn tổng hợp để hiển thị và đối chiếu
  canonicalAnswerSummary: string;
  solutionExplanation: string;

  // Hệ thống 3 cấp gợi ý Socratic của Opti
  hints: {
    tier1: string; // Câu hỏi định hướng Socratic
    tier2: string; // Gợi ý phương pháp Toán học
    tier3: string; // Hướng dẫn tính toán cụ thể
  };

  commonErrorCodes: ErrorCodeId[];
  rubric: ExerciseRubric;
}

export interface StepAttemptRecord {
  stepIndex: number;
  studentAnswerRaw: string;
  isCorrect: boolean;
  attemptsCount: number;
  hintsUsed: number;
  errorCodesTriggered: ErrorCodeId[];
  timestamp: number;
}

export interface ExerciseAttemptRecord {
  id: string;
  exerciseId: string;
  topic: AssessmentTopicId;
  level: CognitiveLevel;
  interactionType: ExerciseInteractionType;
  startedAt: number;
  completedAt: number;
  durationSeconds: number;
  isCompleted: boolean;
  isFirstTryCorrect: boolean;
  totalAttempts: number;
  maxHintTierUsed: 0 | 1 | 2 | 3;
  scoreEarned: number;
  maxScore: number;
  errorCodes: ErrorCodeId[];
  stepRecords: StepAttemptRecord[];
}

export interface TeacherAssignment {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  dueDate?: string;
  targetLevels: CognitiveLevel[];
  targetTopics: AssessmentTopicId[];
  exerciseIds: string[];
}

export interface StudentBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt: number | null;
  progressText: string;
}

export interface PersonalizedRecommendation {
  exercise: AssessmentExercise;
  reasonType: 'error_remediation' | 'topic_mastery' | 'level_progression' | 'review';
  reasonTitle: string;
  reasonExplanation: string;
  relatedErrorCode?: ErrorCodeId;
  priority: number;
}

export interface LibraryDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: number;
  topic: AssessmentTopicId | 'ALL';
  description: string;
  rawContent: string;
  extractedExercises: AssessmentExercise[];
  questionTypeCounts: Partial<Record<QuestionCategoryId, number>>;
}

export interface ExamTypeSlotConfig {
  templateId: QuestionCategoryId;
  enabled: boolean;
  count: number;
  preferredLevel: 'ALL' | CognitiveLevel;
}

