export type ComparisonOperator = '<=' | '<' | '>=' | '>';

export interface Inequality {
  id: string;
  a: number;
  b: number;
  op: ComparisonOperator;
  c: number;
  color?: string;
  label?: string;
}

export interface Point2D {
  x: number;
  y: number;
}

export type PointRelation = 'in_interior' | 'on_boundary' | 'outside';

export interface EvaluationStep {
  stepNumber: number;
  title: string;
  expression: string;
  result: string;
  explanation: string;
}

export interface EvaluationResult {
  inequality: Inequality;
  point: Point2D;
  lhsValue: number;
  satisfies: boolean;
  relation: PointRelation;
  steps: EvaluationStep[];
  algebraicSummary: string;
}

export type LearningMode = 'guided' | 'practice' | 'teacher';

export type ShadingMode = 'solution' | 'exclusion'; // Tô miền nghiệm (xanh) HOẶC gạch bỏ miền không phải nghiệm (SGK Việt Nam)

export type OptiExpression = 'happy' | 'wink' | 'surprised' | 'thinking' | 'cheering' | 'sad';

export type OptiPose = 'idle' | 'pointing' | 'reading' | 'running' | 'waving';

export interface OptiMessage {
  text: string;
  expression: OptiExpression;
  pose?: OptiPose;
  badge?: string;
  colorTheme?: 'blue' | 'green' | 'orange' | 'purple';
}

export type BoundaryStyle = 'solid' | 'dashed';

export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'has_error';

export type OptiHintTier = 1 | 2 | 3; // 1: Định hướng, 2: Phương pháp, 3: Chi tiết

export interface StepHintInfo {
  tier1: string; // Câu hỏi định hướng
  tier2: string; // Gợi ý phương pháp
  tier3: string; // Hướng dẫn cụ thể
}

export interface SevenStepState {
  currentStep: StepNumber;
  completedSteps: Set<StepNumber>;

  // Step 1: Nhận diện
  inequality: Inequality;
  step1Verified: boolean;

  // Step 2: Đường biên & Nét vẽ
  step2Equation: string;
  step2Style: BoundaryStyle | null;
  step2Verified: boolean;

  // Step 3: Tìm hai điểm
  pointA: Point2D;
  pointB: Point2D;
  step3Verified: boolean;

  // Step 4: Vẽ đường thẳng
  pointAPlaced: boolean;
  pointBPlaced: boolean;
  lineDrawn: boolean;
  step4Verified: boolean;

  // Step 5: Chọn điểm thử
  testPoint: Point2D;
  step5Verified: boolean;

  // Step 6: Chọn miền nghiệm
  // Selected side: 'with_test' (nửa chứa điểm thử) hoặc 'without_test' (nửa không chứa)
  selectedSide: 'with_test' | 'without_test' | null;
  selectedCoord: Point2D | null;
  step6Verified: boolean;
  isSideCorrect: boolean | null;

  // Step 7: Kết luận
  step7Complete: boolean;
}

// Module 3: System of Linear Inequalities Types
export interface SystemInequality {
  id: string;
  a: number;
  b: number;
  op: ComparisonOperator;
  c: number;
  color: string;
  label: string;
  showLine?: boolean;
  showFill?: boolean;
}

export interface IntersectionPoint {
  id: string;
  point: Point2D;
  lineIndices: [number, number];
  lineLabels: [string, string];
  lineEquations?: [string, string];
  cramerSteps?: {
    D: number;
    Dx: number;
    Dy: number;
    explanation: string;
  };
  isFeasible: boolean;
  isStrictlyExcluded: boolean;
  violatedConstraints: number[];
  vertexLabel?: string;
}

export type FeasibleRegionType =
  | 'bounded_polygon'
  | 'unbounded'
  | 'empty'
  | 'degenerate_segment'
  | 'degenerate_point'
  | 'degenerate_line';

export interface SystemAnalysisResult {
  inequalities: SystemInequality[];
  intersections: IntersectionPoint[];
  feasibleVertices: Point2D[];
  orderedPolygon: Point2D[];
  regionType: FeasibleRegionType;
  description: string;
  sgkSummary: string;
  hasStrictBoundaries: boolean;
  area?: number;
}

// Module 4: Linear Programming & Real-World Modeling Types
export type OptimizationGoal = 'max' | 'min';

export interface ObjectiveFunction {
  cx: number;
  cy: number;
  constant?: number;
  label: string; // e.g. "P(x; y) = 30x + 40y" or "F(x; y)"
  name: string;  // e.g. "Lợi nhuận", "Chi phí", "Điểm số"
  unit: string;  // e.g. "nghìn đồng", "triệu đồng", "điểm"
  goal: OptimizationGoal;
}

export interface VariableDefinition {
  symbol: 'x' | 'y';
  name: string;    // e.g. "Sản phẩm A"
  meaning: string; // e.g. "Số lượng sản phẩm A cơ sở cần sản xuất"
  unit: string;    // e.g. "sản phẩm", "tấn", "giờ", "héc-ta"
  isInteger: boolean;
}

export interface RealWorldScenario {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  storyText: string;
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
  };
  variables: {
    x: VariableDefinition;
    y: VariableDefinition;
  };
  system: SystemInequality[];
  objective: ObjectiveFunction;
  integerRequired: boolean;
  practicalQuestion: string;
  expectedConclusion: string;
}

export interface VertexEvaluation {
  vertex: Point2D;
  label: string;
  value: number;
  substitutionText: string;
  isOptimal: boolean;
  isStrictlyExcluded: boolean;
}

export interface OptimizationResult {
  scenario: RealWorldScenario;
  regionType: FeasibleRegionType;
  vertices: Point2D[];
  orderedPolygon: Point2D[];
  vertexEvaluations: VertexEvaluation[];
  optimalValue: number | null;
  optimalPoints: Point2D[];
  isUnboundedObjective: boolean;
  isStrictUnattained?: boolean;
  integerPoints: { point: Point2D; value: number }[];
  integerOptimalPoint: Point2D | null;
  integerOptimalValue: number | null;
  hasMultipleOptima: boolean;
  summarySGK: string;
  practicalAnswer: string;
}
