import {
  AssessmentExercise,
  AssessmentTopicId,
  CognitiveLevel,
  ErrorCodeDefinition,
  ErrorCodeId,
  ExerciseInteractionType
} from '../types/assessment';
import { REAL_WORLD_SCENARIOS } from '../math/optimizationMathEngine';

export const TOPIC_METADATA: Record<
  AssessmentTopicId,
  { id: AssessmentTopicId; name: string; shortName: string; description: string; color: string }
> = {
  A: {
    id: 'A',
    name: 'Chủ đề A: Bất phương trình bậc nhất hai ẩn',
    shortName: 'A. BPT bậc nhất hai ẩn',
    description: 'Nhận diện dạng tổng quát ax + by ≤ c, kiểm tra cặp số (x₀; y₀) là nghiệm bằng phép thay tọa độ đại số.',
    color: '#2563EB'
  },
  B: {
    id: 'B',
    name: 'Chủ đề B: Biểu diễn miền nghiệm trên mặt phẳng tọa độ',
    shortName: 'B. Biểu diễn miền nghiệm',
    description: 'Xác định đường biên nét liền/đứt, chọn điểm thử không nằm trên bờ và tô/gạch miền nghiệm chuẩn SGK.',
    color: '#059669'
  },
  C: {
    id: 'C',
    name: 'Chủ đề C: Hệ bất phương trình bậc nhất hai ẩn',
    shortName: 'C. Hệ BPT hai ẩn',
    description: 'Tìm miền giao của các nửa mặt phẳng, giải hệ tìm giao điểm hai đường bờ và lọc đỉnh cực biên khả thi.',
    color: '#D97706'
  },
  D: {
    id: 'D',
    name: 'Chủ đề D: Mô hình hóa và tối ưu hóa tuyến tính',
    shortName: 'D. Mô hình hóa & Tối ưu',
    description: 'Chuyển bài toán thực tiễn thành hệ ràng buộc, lập hàm mục tiêu F(x; y) và tìm phương án tối ưu liên tục/nguyên.',
    color: '#7C3AED'
  }
};

export const LEVEL_METADATA: Record<
  CognitiveLevel,
  { id: CognitiveLevel; label: string; badgeText: string; order: number }
> = {
  nhan_biet: {
    id: 'nhan_biet',
    label: 'Nhận biết',
    badgeText: 'Mức 1 · Nhận biết',
    order: 1
  },
  thong_hieu: {
    id: 'thong_hieu',
    label: 'Thông hiểu',
    badgeText: 'Mức 2 · Thông hiểu',
    order: 2
  },
  van_dung: {
    id: 'van_dung',
    label: 'Vận dụng',
    badgeText: 'Mức 3 · Vận dụng',
    order: 3
  },
  van_dung_cao: {
    id: 'van_dung_cao',
    label: 'Vận dụng cao',
    badgeText: 'Mức 4 · Vận dụng cao',
    order: 4
  }
};

export const INTERACTION_TYPE_LABELS: Record<ExerciseInteractionType, string> = {
  multiple_choice: '1. Chọn đáp án đúng',
  enter_coordinate: '2. Nhập tọa độ điểm',
  select_feasible_point: '3. Chọn điểm thuộc miền nghiệm',
  drag_point_to_region: '4. Kéo điểm vào miền nghiệm',
  select_half_plane: '5. Chọn nửa mặt phẳng đúng',
  draw_boundary_line: '6. Vẽ đường biên',
  identify_feasible_region: '7. Xác định miền giao',
  find_intersection: '8. Tìm giao điểm',
  enter_objective_value: '9. Nhập giá trị hàm mục tiêu',
  find_optimal_solution: '10. Xác định phương án tối ưu'
};

export const ERROR_CODE_CATALOG: Record<ErrorCodeId, ErrorCodeDefinition> = {
  E01: {
    code: 'E01',
    title: 'Thay tọa độ sai',
    topic: 'A',
    description: 'Nhầm lẫn thứ tự hoành độ x₀ với tung độ y₀ hoặc tính nhẩm sai biểu thức đại số a·x₀ + b·y₀.',
    commonCauses: [
      'Thay ngược giá trị y₀ vào biến x và x₀ vào biến y.',
      'Bỏ sót dấu âm khi nhân hệ số a hoặc b với tọa độ âm.',
      'Cộng trừ nhẩm sai giá trị vế trái trước khi so sánh với c.'
    ],
    socraticQuestion: 'Em hãy kiểm tra lại: trong cặp số (x₀; y₀), số nào đi với hệ số của x, số nào đi với hệ số của y? Dấu của tích a·x₀ và b·y₀ đã chính xác chưa?',
    remediationAdvice: 'Viết rõ biểu thức thay số có dấu ngoặc đơn: a·(x₀) + b·(y₀) rồi tính từng tích riêng biệt.',
    remedialExerciseIds: ['A02', 'A03', 'A05', 'A08']
  },
  E02: {
    code: 'E02',
    title: 'Nhầm dấu bất phương trình',
    topic: 'A',
    description: 'Không phân biệt dấu bất phương trình nghiêm ngặt (<, >) với dấu có tính cả biên (≤, ≥), hoặc đổi chiều sai khi chia cho số âm.',
    commonCauses: [
      'Cho rằng điểm nằm trên đường biên ax + by = c luôn là nghiệm của ax + by < c.',
      'Chọn nét vẽ liền cho dấu < hoặc >, hoặc chọn nét đứt cho dấu ≤ hoặc ≥.',
      'Chia hai vế cho hệ số âm nhưng quên đổi chiều bất phương trình.'
    ],
    socraticQuestion: 'Dấu của bất phương trình có dấu bằng (=) hay không? Nếu vế trái bằng đúng vế phải thì mệnh đề nghiêm ngặt (< hoặc >) đúng hay sai?',
    remediationAdvice: 'Quy ước chuẩn SGK: Có dấu bằng (≤, ≥) ↔ tính cả bờ (nét liền); Không có dấu bằng (<, >) ↔ bỏ bờ (nét đứt).',
    remedialExerciseIds: ['A04', 'A06', 'B02', 'B05']
  },
  E03: {
    code: 'E03',
    title: 'Chọn sai điểm trên đường biên',
    topic: 'B',
    description: 'Xác định sai giao điểm của đường thẳng ax + by = c với hai trục tọa độ Ox, Oy khi vẽ đường biên.',
    commonCauses: [
      'Khi cho x = 0 lại viết điểm là (c/b; 0) thay vì (0; c/b).',
      'Chia nhầm c/a với a/c khi tìm giao điểm với trục hoành Ox.',
      'Xác định sai đường thẳng song song trục tọa độ (như x = c/a hoặc y = c/b).'
    ],
    socraticQuestion: 'Một điểm nằm trên trục tung Oy thì hoành độ x bằng bao nhiêu? Khi thay điểm em vừa chọn vào phương trình ax + by = c, hai vế có bằng nhau không?',
    remediationAdvice: 'Luôn kiểm tra lại 2 điểm A, B bằng cách thế tọa độ vào phương trình đường biên ax + by = c trước khi nối.',
    remedialExerciseIds: ['B01', 'B03', 'B06', 'B09']
  },
  E04: {
    code: 'E04',
    title: 'Chọn điểm thử nằm trên đường biên',
    topic: 'B',
    description: 'Chọn điểm thử M(x₀; y₀) có a·x₀ + b·y₀ = c (ví dụ chọn O(0;0) khi đường thẳng đi qua gốc tọa độ).',
    commonCauses: [
      'Thói quen luôn lấy O(0;0) làm điểm thử mà không để ý hệ số tự do c = 0.',
      'Chưa kiểm tra xem a·x₀ + b·y₀ có khác c hay không.'
    ],
    socraticQuestion: 'Nếu điểm thử nằm ngay trên đường phân chia hai nửa mặt phẳng, ta có thể biết nó đại diện cho nửa mặt phẳng bên nào không?',
    remediationAdvice: 'Khi c = 0 (đường bờ đi qua gốc tọa độ O), tuyệt đối không chọn O(0;0); hãy chọn (1; 0) hoặc (0; 1).',
    remedialExerciseIds: ['B04', 'B07', 'B10']
  },
  E05: {
    code: 'E05',
    title: 'Chọn sai nửa mặt phẳng',
    topic: 'B',
    description: 'Xác định ngược nửa mặt phẳng nghiệm sau khi thử điểm M, hoặc nhầm giữa chế độ tô miền nghiệm và gạch bỏ miền sai.',
    commonCauses: [
      'Điểm thử M thỏa mãn BPT nhưng lại chọn nửa mặt phẳng không chứa M.',
      'Điểm thử M không thỏa mãn BPT nhưng vẫn lấy nửa mặt phẳng chứa M.',
      'Dựa vào cảm tính "dấu ≤ luôn nằm bên dưới" mà không xét dấu của hệ số b.'
    ],
    socraticQuestion: 'Khi thay tọa độ điểm thử M vào bất phương trình, mệnh đề nhận được là ĐÚNG hay SAI? Từ đó miền nghiệm phải chứa M hay không chứa M?',
    remediationAdvice: 'Nguyên tắc vàng: M thỏa mãn → lấy nửa chứa M; M không thỏa mãn → lấy nửa KHÔNG chứa M.',
    remedialExerciseIds: ['B05', 'B06', 'B08', 'B10']
  },
  E06: {
    code: 'E06',
    title: 'Tính sai giao điểm hai đường bờ',
    topic: 'C',
    description: 'Giải sai hệ phương trình bậc nhất hai ẩn khi tìm tọa độ giao điểm của hai đường biên.',
    commonCauses: [
      'Trừ hai phương trình hoặc tính định thức D, Dx, Dy bị nhầm dấu.',
      'Làm tròn số thập phân quá sớm thay vì giữ phân số tối giản (như 8/3).'
    ],
    socraticQuestion: 'Em hãy thế tọa độ giao điểm vừa tìm được vào cả hai phương trình đường bờ: cả hai đẳng thức có đồng thời xảy ra không?',
    remediationAdvice: 'Sau khi giải hệ tìm (x; y), luôn thế ngược lại vào cả 2 phương trình đường biên để tự kiểm tra.',
    remedialExerciseIds: ['C03', 'C05', 'C07', 'C09']
  },
  E07: {
    code: 'E07',
    title: 'Chọn điểm không thỏa toàn bộ hệ',
    topic: 'C',
    description: 'Kết luận một điểm hoặc một giao điểm là đỉnh miền nghiệm khi mới kiểm tra 1–2 bất phương trình mà bỏ quên các ràng buộc còn lại.',
    commonCauses: [
      'Thấy điểm thỏa mãn bất phương trình đầu tiên đã vội kết luận thuộc miền nghiệm của hệ.',
      'Quên kiểm tra điều kiện không âm x ≥ 0, y ≥ 0 hoặc ràng buộc thứ 3 trong hệ.'
    ],
    socraticQuestion: 'Một điểm muốn thuộc giao của các miền nghiệm thì cần thỏa mãn một vài bất phương trình hay TẤT CẢ các bất phương trình trong hệ?',
    remediationAdvice: 'Kiểm tra tuần tự điểm đó với từng bất phương trình trong hệ; chỉ cần vi phạm 1 ràng buộc là phải loại ngay.',
    remedialExerciseIds: ['C01', 'C02', 'C04', 'C06', 'C08']
  },
  E08: {
    code: 'E08',
    title: 'Lập sai ràng buộc thực tế',
    topic: 'D',
    description: 'Dịch sai cụm từ thực tế ("tối đa", "không quá", "ít nhất", "tối thiểu") thành dấu bất phương trình hoặc ghép nhầm định mức đơn vị.',
    commonCauses: [
      'Nhầm "không vượt quá / tối đa M" (≤ M) thành (≥ M) hoặc ngược lại "tối thiểu / ít nhất N" (≥ N) thành (≤ N).',
      'Ghép hệ số nguyên liệu của sản phẩm A với định mức thời gian lao động của sản phẩm B.',
      'Quên điều kiện thực tế x ≥ 0, y ≥ 0.'
    ],
    socraticQuestion: 'Cụm từ "tối đa 8 giờ máy" nghĩa là tổng số giờ máy sử dụng phải nhỏ hơn hoặc bằng 8 hay lớn hơn hoặc bằng 8?',
    remediationAdvice: 'Kiểm tra đơn vị của cả hai vế: vế trái và vế phải của một bất phương trình phải có cùng đơn vị (cùng là giờ máy, cùng là kg, hoặc cùng là đồng).',
    remedialExerciseIds: ['D01', 'D02', 'D05', 'D06']
  },
  E09: {
    code: 'E09',
    title: 'Xác định sai hàm mục tiêu',
    topic: 'D',
    description: 'Lập sai biểu thức hàm mục tiêu F(x; y) = cx·x + cy·y hoặc nhầm mục tiêu cực đại (MAX) với cực tiểu (MIN).',
    commonCauses: [
      'Dùng hệ số ràng buộc nguồn lực để viết thành hàm lợi nhuận/chi phí.',
      'Đổi chỗ hệ số lợi nhuận đơn vị của hai biến x và y.'
    ],
    socraticQuestion: 'Mỗi đơn vị x và mỗi đơn vị y đóng góp bao nhiêu vào đại lượng cần tối ưu (lợi nhuận hoặc chi phí)? Bài toán yêu cầu tìm GTLN hay GTNN?',
    remediationAdvice: 'Xác định rõ câu hỏi cuối của bài toán: "Lợi nhuận cao nhất" → MAX; "Chi phí thấp nhất" → MIN.',
    remedialExerciseIds: ['D03', 'D04', 'D07']
  },
  E10: {
    code: 'E10',
    title: 'Kết luận tối ưu sai',
    topic: 'D',
    description: 'Bỏ sót đỉnh cực biên (như đỉnh phân số (8/3; 8/3)), hoặc tự ý làm tròn nghiệm liên tục sang số nguyên mà không kiểm tra ràng buộc.',
    commonCauses: [
      'Chỉ tính giá trị hàm mục tiêu tại các đỉnh trên trục tọa độ mà quên đỉnh giao nhau ở góc phần tư thứ nhất.',
      'Làm tròn (8/3; 8/3) thành (3; 3) trong bài toán sản phẩm nguyên dẫn đến vi phạm ràng buộc 2x + y ≤ 8.',
      'Chọn giá trị lớn nhất khi bài toán yêu cầu tìm chi phí nhỏ nhất (MIN).'
    ],
    socraticQuestion: 'Em đã tính giá trị hàm mục tiêu tại TẤT CẢ các đỉnh của đa giác miền khả thi chưa? Nếu bài toán yêu cầu x, y nguyên, điểm nguyên em chọn có thỏa mãn hệ ràng buộc không?',
    remediationAdvice: 'Lập bảng tính F(x; y) tại đầy đủ mọi đỉnh cực biên. Với bài toán nguyên, phải kiểm tra điểm nguyên trong miền khả thi thay vì làm tròn cơ học.',
    remedialExerciseIds: ['D04', 'D07', 'D08', 'D09', 'D10']
  }
};

// ============================================================================
// NGÂN HÀNG 40 BÀI TẬP MẪU ĐÃ KIỂM CHỨNG TOÁN HỌC (A01-A10, B01-B10, C01-C10, D01-D10)
// ============================================================================

export const ASSESSMENT_EXERCISE_BANK: AssessmentExercise[] = [
  // ==========================================================================
  // CHỦ ĐỀ A: BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN (10 BÀI: A01 -> A10)
  // ==========================================================================
  {
    id: 'A01',
    topic: 'A',
    level: 'nhan_biet',
    interactionType: 'multiple_choice',
    title: 'Nhận diện bất phương trình bậc nhất hai ẩn',
    learningObjective: 'Nhận biết đúng dạng tổng quát của bất phương trình bậc nhất hai ẩn x, y với a² + b² > 0.',
    questionText: 'Trong các bất phương trình dưới đây, bất phương trình nào là bất phương trình bậc nhất hai ẩn x và y?',
    mathData: {
      inequality: { id: 'a01', a: 2, b: -3, op: '<=', c: 6 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Kiểm tra bậc của các ẩn x, y',
        instruction: 'Chọn bất phương trình chỉ chứa các hạng tử bậc nhất của x và y (không chứa x², y², xy).',
        inputType: 'choice',
        choices: [
          {
            id: 'c1',
            label: '2x - 3y ≤ 6',
            value: '2x - 3y <= 6'
          },
          {
            id: 'c2',
            label: 'x² + 2y > 5',
            value: 'x^2 + 2y > 5',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: 'Hạng tử x² có bậc 2 nên đây không phải bất phương trình bậc nhất hai ẩn.'
          },
          {
            id: 'c3',
            label: '3xy - y ≥ 1',
            value: '3xy - y >= 1',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: 'Tích x·y có bậc 2 đối với hai ẩn nên không phải bậc nhất.'
          },
          {
            id: 'c4',
            label: '0x + 0y < 4',
            value: '0x + 0y < 4',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Hai hệ số a và b không được đồng thời bằng 0 (a² + b² > 0).'
          }
        ],
        expectedValue: '2x - 3y <= 6'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Xác định hệ số a, b, c',
        instruction: 'Với bất phương trình 2x - 3y ≤ 6 (dạng ax + by ≤ c), bộ ba hệ số (a; b; c) là:',
        inputType: 'choice',
        choices: [
          { id: 's1', label: 'a = 2; b = -3; c = 6', value: '2;-3;6' },
          {
            id: 's2',
            label: 'a = 2; b = 3; c = 6',
            value: '2;3;6',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: 'Em chú ý dấu trừ trước 3y: hệ số b phải là -3.'
          },
          {
            id: 's3',
            label: 'a = -3; b = 2; c = 6',
            value: '-3;2;6',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: 'Hệ số a đi với ẩn x (a = 2), hệ số b đi với ẩn y (b = -3).'
          }
        ],
        expectedValue: '2;-3;6'
      }
    ],
    canonicalAnswerSummary: '2x - 3y ≤ 6 với a = 2, b = -3, c = 6.',
    solutionExplanation: 'Bất phương trình bậc nhất hai ẩn có dạng ax + by ≤ c (hoặc <, ≥, >) trong đó a, b không đồng thời bằng 0. Ở đây 2x - 3y ≤ 6 có a = 2, b = -3, c = 6.',
    hints: {
      tier1: 'Em hãy quan sát số mũ của x và y trong từng phương án. Bậc nhất nghĩa là số mũ cao nhất bằng bao nhiêu?',
      tier2: 'Loại bỏ các phương án có x², y², xy hoặc có cả hai hệ số a = b = 0.',
      tier3: '2x - 3y ≤ 6 có dạng ax + by ≤ c với a = 2, b = -3, c = 6.'
    },
    commonErrorCodes: ['E01', 'E02'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Nhận diện đúng dạng BPT bậc nhất hai ẩn', points: 5 },
        { stepIndex: 2, description: 'Xác định đúng dấu của hệ số a, b, c', points: 5 }
      ]
    }
  },
  {
    id: 'A02',
    topic: 'A',
    level: 'nhan_biet',
    interactionType: 'select_feasible_point',
    title: 'Kiểm tra cặp số thuộc miền nghiệm bằng phép thế',
    learningObjective: 'Kiểm tra được một cặp số (x₀; y₀) có phải là nghiệm của bất phương trình bậc nhất hai ẩn hay không.',
    questionText: 'Cho bất phương trình 3x + 2y ≤ 8. Điểm nào trong các điểm sau là một nghiệm của bất phương trình?',
    mathData: {
      inequality: { id: 'a02', a: 3, b: 2, op: '<=', c: 8 },
      candidatePoints: [
        { label: 'M', point: { x: 1, y: 2 } },
        { label: 'N', point: { x: 2, y: 2 } },
        { label: 'P', point: { x: 3, y: 0 } },
        { label: 'Q', point: { x: 0, y: 5 } }
      ]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Tính giá trị vế trái tại M(1; 2)',
        instruction: 'Thay x = 1, y = 2 vào vế trái T = 3x + 2y. Nhập giá trị của T:',
        inputType: 'number',
        expectedValue: 7,
        tolerance: 0.01
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Chọn điểm là nghiệm của 3x + 2y ≤ 8',
        instruction: 'Dựa vào kết quả so sánh với 8, chọn điểm thuộc miền nghiệm:',
        inputType: 'choice',
        choices: [
          { id: 'p1', label: 'M(1; 2) vì 3(1) + 2(2) = 7 ≤ 8', value: 'M' },
          {
            id: 'p2',
            label: 'N(2; 2) vì 3(2) + 2(2) = 10',
            value: 'N',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: 'Tại N(2; 2), vế trái bằng 10 > 8 nên không thỏa mãn ≤ 8.'
          },
          {
            id: 'p3',
            label: 'P(3; 0) vì 3(3) + 2(0) = 9',
            value: 'P',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: 'Tại P(3; 0), vế trái bằng 9 > 8 nên không thỏa mãn.'
          },
          {
            id: 'p4',
            label: 'Q(0; 5) vì 3(0) + 2(5) = 10',
            value: 'Q',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: 'Tại Q(0; 5), vế trái bằng 10 > 8 nên không thỏa mãn.'
          }
        ],
        expectedValue: 'M'
      }
    ],
    canonicalAnswerSummary: 'Điểm M(1; 2) là nghiệm vì 3(1) + 2(2) = 7 ≤ 8 (Đúng).',
    solutionExplanation: 'Thay tọa độ từng điểm vào vế trái 3x + 2y: tại M(1; 2) ta có 3·1 + 2·2 = 7 ≤ 8 (thỏa mãn). Các điểm N(2;2) → 10, P(3;0) → 9, Q(0;5) → 10 đều lớn hơn 8.',
    hints: {
      tier1: 'Muốn biết (x₀; y₀) có là nghiệm hay không, ta thay x = x₀ và y = y₀ vào vế trái rồi so sánh với 8.',
      tier2: 'Tại M(1; 2), hãy tính 3·1 + 2·2 xem bằng bao nhiêu.',
      tier3: '3·1 + 2·2 = 7. Vì 7 ≤ 8 là mệnh đề đúng nên M(1; 2) là nghiệm.'
    },
    commonErrorCodes: ['E01'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Thay tọa độ tính đúng vế trái T = 7', points: 5 },
        { stepIndex: 2, description: 'Kết luận đúng điểm M(1; 2) thuộc miền nghiệm', points: 5 }
      ]
    }
  },
  {
    id: 'A03',
    topic: 'A',
    level: 'nhan_biet',
    interactionType: 'enter_coordinate',
    title: 'Tìm điểm thuộc đường biên trên trục tọa độ',
    learningObjective: 'Tìm được tọa độ giao điểm của đường biên ax + by = c với trục hoành và trục tung.',
    questionText: 'Cho bất phương trình x + 2y ≥ 4 có đường biên (d): x + 2y = 4. Hãy tìm tọa độ giao điểm A của đường thẳng (d) với trục tung Oy (cho x = 0).',
    mathData: {
      inequality: { id: 'a03', a: 1, b: 2, op: '>=', c: 4 },
      testPoint: { x: 0, y: 2 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Nhập tọa độ giao điểm A(0; y) trên trục Oy',
        instruction: 'Khi x = 0, từ phương trình x + 2y = 4 hãy tìm tọa độ điểm A(x; y):',
        inputType: 'coordinate',
        expectedPoint: { x: 0, y: 2 },
        tolerance: 0.01
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Kiểm tra điểm A(0; 2) với bất phương trình x + 2y ≥ 4',
        instruction: 'Điểm A(0; 2) nằm trên đường biên có thuộc miền nghiệm của x + 2y ≥ 4 không?',
        inputType: 'choice',
        choices: [
          { id: 'y1', label: 'Có thuộc miền nghiệm vì dấu ≥ bao gồm cả đường biên', value: 'yes' },
          {
            id: 'y2',
            label: 'Không thuộc miền nghiệm vì nằm trên đường biên',
            value: 'no',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Chú ý: Bất phương trình có dấu ≥ (lớn hơn hoặc bằng) nên mọi điểm trên đường biên đều là nghiệm.'
          }
        ],
        expectedValue: 'yes'
      }
    ],
    canonicalAnswerSummary: 'A(0; 2) thuộc trục tung Oy và thuộc miền nghiệm của x + 2y ≥ 4.',
    solutionExplanation: 'Thay x = 0 vào x + 2y = 4 được 2y = 4 ⇔ y = 2, suy ra A(0; 2). Vì BPT có dấu ≥ nên miền nghiệm tính cả đường biên (d).',
    hints: {
      tier1: 'Điểm nằm trên trục tung Oy luôn có hoành độ x bằng bao nhiêu?',
      tier2: 'Thay x = 0 vào phương trình 0 + 2y = 4 để giải tìm y.',
      tier3: '2y = 4 ⇒ y = 2, vậy điểm cần nhập là (0; 2). Vì dấu là ≥ nên điểm trên biên vẫn là nghiệm.'
    },
    commonErrorCodes: ['E01', 'E02', 'E03'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Nhập đúng tọa độ A(0; 2)', points: 6 },
        { stepIndex: 2, description: 'Xác định đúng vai trò điểm trên biên với dấu ≥', points: 4 }
      ]
    }
  },
  {
    id: 'A04',
    topic: 'A',
    level: 'thong_hieu',
    interactionType: 'select_feasible_point',
    title: 'Phân biệt nghiệm trên đường biên với dấu nghiêm ngặt',
    learningObjective: 'Hiểu rõ sự khác biệt giữa dấu nghiêm ngặt (<, >) và dấu không nghiêm ngặt (≤, ≥) đối với điểm nằm trên đường biên.',
    questionText: 'Xét bất phương trình nghiêm ngặt 2x - y > 3. Điểm nào dưới đây là nghiệm của bất phương trình?',
    mathData: {
      inequality: { id: 'a04', a: 2, b: -1, op: '>', c: 3 },
      candidatePoints: [
        { label: 'A', point: { x: 2, y: 1 } },
        { label: 'B', point: { x: 3, y: 1 } },
        { label: 'C', point: { x: 1, y: 1 } },
        { label: 'O', point: { x: 0, y: 0 } }
      ]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Kiểm tra điểm A(2; 1) nằm trên đường biên',
        instruction: 'Tại A(2; 1), giá trị 2x - y = 2(2) - 1 = 3. Vậy A(2; 1) có là nghiệm của 2x - y > 3 không?',
        inputType: 'choice',
        choices: [
          { id: 'a1', label: 'Không, vì 3 > 3 là mệnh đề sai (dấu > không lấy đường biên)', value: 'no' },
          {
            id: 'a2',
            label: 'Có, vì 2(2) - 1 = 3 bằng vế phải',
            value: 'yes',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Cẩn thận! Bất phương trình là 2x - y > 3 (nghiêm ngặt), nên giá trị bằng 3 không thỏa mãn.'
          }
        ],
        expectedValue: 'no'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Chọn điểm thực sự thỏa mãn 2x - y > 3',
        instruction: 'Trong 4 điểm A(2;1), B(3;1), C(1;1), O(0;0), điểm nào thỏa mãn 2x - y > 3?',
        inputType: 'choice',
        choices: [
          { id: 'b1', label: 'B(3; 1) vì 2(3) - 1 = 5 > 3', value: 'B' },
          {
            id: 'b2',
            label: 'A(2; 1) vì 2(2) - 1 = 3',
            value: 'A',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Điểm A(2; 1) nằm trên đường biên nét đứt nên bị loại.'
          },
          {
            id: 'b3',
            label: 'C(1; 1) vì 2(1) - 1 = 1',
            value: 'C',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: 'Tại C(1; 1), vế trái bằng 1 < 3 nên không thỏa mãn.'
          }
        ],
        expectedValue: 'B'
      }
    ],
    canonicalAnswerSummary: 'Chỉ có B(3; 1) là nghiệm vì 2(3) - 1 = 5 > 3. Điểm A(2; 1) nằm trên biên nét đứt nên bị loại.',
    solutionExplanation: 'Với BPT nghiêm ngặt 2x - y > 3: tại A(2; 1) có 2(2) - 1 = 3 (không lớn hơn 3 → loại); tại B(3; 1) có 2(3) - 1 = 5 > 3 (nhận).',
    hints: {
      tier1: 'Dấu > có chấp nhận trường hợp hai vế bằng nhau không?',
      tier2: 'Thay lần lượt tọa độ A(2; 1) và B(3; 1) vào 2x - y để so sánh với 3.',
      tier3: 'Tại A(2; 1): 2(2)-1 = 3 (loại). Tại B(3; 1): 2(3)-1 = 5 > 3 (thỏa mãn).'
    },
    commonErrorCodes: ['E02', 'E01'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Loại đúng điểm A(2; 1) nằm trên biên nghiêm ngặt', points: 5 },
        { stepIndex: 2, description: 'Chọn đúng điểm B(3; 1)', points: 5 }
      ]
    }
  },
  {
    id: 'A05',
    topic: 'A',
    level: 'thong_hieu',
    interactionType: 'enter_coordinate',
    title: 'Thay tọa độ có số âm vào bất phương trình',
    learningObjective: 'Thực hiện chính xác phép thay tọa độ âm (x₀; y₀) vào biểu thức đại số có hệ số âm.',
    questionText: 'Cho bất phương trình -2x + 3y ≤ 5 và điểm M(-1; 2). Hãy tính giá trị vế trái tại M(-1; 2) và kết luận.',
    mathData: {
      inequality: { id: 'a05', a: -2, b: 3, op: '<=', c: 5 },
      testPoint: { x: -1, y: 2 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Tính giá trị vế trái tại M(-1; 2)',
        instruction: 'Thay x = -1, y = 2 vào T = -2x + 3y. Nhập kết quả của T:',
        inputType: 'number',
        expectedValue: 8,
        tolerance: 0.01
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Kết luận về điểm M(-1; 2)',
        instruction: 'So sánh T với 5, điểm M(-1; 2) có thuộc miền nghiệm của -2x + 3y ≤ 5 không?',
        inputType: 'choice',
        choices: [
          { id: 'm1', label: 'Không thuộc miền nghiệm vì 8 ≤ 5 là mệnh đề sai', value: 'no' },
          {
            id: 'm2',
            label: 'Thuộc miền nghiệm vì -2 + 6 = 4 ≤ 5',
            value: 'yes',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: 'Em đã nhân sai dấu: (-2)·(-1) = +2 chứ không phải -2!'
          }
        ],
        expectedValue: 'no'
      }
    ],
    canonicalAnswerSummary: 'T = (-2)(-1) + 3(2) = 2 + 6 = 8 > 5 nên M(-1; 2) không thuộc miền nghiệm.',
    solutionExplanation: 'Thay x = -1, y = 2 vào -2x + 3y ta được (-2)·(-1) + 3·2 = 2 + 6 = 8. Vì 8 > 5 nên M(-1; 2) không là nghiệm.',
    hints: {
      tier1: 'Chú ý quy tắc nhân hai số âm: (-2) nhân với (-1) bằng +2 hay -2?',
      tier2: 'Tính (-2)·(-1) = 2, sau đó cộng với 3·2 = 6.',
      tier3: 'T = 2 + 6 = 8. Vì 8 > 5 nên mệnh đề 8 ≤ 5 là sai.'
    },
    commonErrorCodes: ['E01'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Tính đúng T = (-2)(-1) + 3(2) = 8', points: 6 },
        { stepIndex: 2, description: 'Kết luận đúng M(-1; 2) không thuộc miền nghiệm', points: 4 }
      ]
    }
  },
  {
    id: 'A06',
    topic: 'A',
    level: 'thong_hieu',
    interactionType: 'multiple_choice',
    title: 'Biến đổi tương đương bất phương trình về dạng chuẩn',
    learningObjective: 'Thu gọn và chuyển vế đúng quy tắc dấu để đưa bất phương trình về dạng chuẩn ax + by ≤ c.',
    questionText: 'Đưa bất phương trình 3(x - 1) - 2(y + 2) < x - 1 về dạng chuẩn ax + by < c (tối giản hệ số). Kết quả đúng là:',
    mathData: {
      inequality: { id: 'a06', a: 1, b: -1, op: '<', c: 3 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Khai triển và chuyển các hạng tử chứa x, y sang vế trái',
        instruction: 'Sau khi khai triển 3x - 3 - 2y - 4 < x - 1 và chuyển vế, ta thu được:',
        inputType: 'choice',
        choices: [
          { id: 'k1', label: '2x - 2y < 6', value: '2x - 2y < 6' },
          {
            id: 'k2',
            label: '2x - 2y < 0',
            value: '2x - 2y < 0',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: 'Kiểm tra lại dấu khi nhân -2(y + 2) = -2y - 4 (vế trái có -3 - 4 = -7, chuyển sang phải là +7 - 1 = 6).'
          },
          {
            id: 'k3',
            label: '4x - 2y < 6',
            value: '4x - 2y < 6',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: 'Khi chuyển +x từ vế phải sang vế trái phải đổi dấu thành 3x - x = 2x.'
          }
        ],
        expectedValue: '2x - 2y < 6'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Chia cả hai vế cho -2',
        instruction: 'Nếu chia cả hai vế của 2x - 2y < 6 cho (-2), bất phương trình tương đương với:',
        inputType: 'choice',
        choices: [
          { id: 'd1', label: '-x + y > -3 (đổi chiều bất phương trình)', value: '-x + y > -3' },
          {
            id: 'd2',
            label: '-x + y < -3 (giữ nguyên chiều)',
            value: '-x + y < -3',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Khi chia hai vế bất phương trình cho số âm (-2), bắt buộc phải ĐỔI CHIỀU từ < sang >!'
          }
        ],
        expectedValue: '-x + y > -3'
      }
    ],
    canonicalAnswerSummary: '2x - 2y < 6 ⇔ x - y < 3 (hoặc -x + y > -3 khi chia cho -2).',
    solutionExplanation: '3(x - 1) - 2(y + 2) < x - 1 ⇔ 3x - 3 - 2y - 4 < x - 1 ⇔ 2x - 2y < 6 ⇔ x - y < 3. Nếu chia cho -2 thì phải đổi chiều thành -x + y > -3.',
    hints: {
      tier1: 'Khi nhân -2 với (y + 2), dấu của hạng tử tự do là +4 hay -4?',
      tier2: '3x - x = 2x; vế phải là -1 + 3 + 4 = 6. Vậy 2x - 2y < 6.',
      tier3: 'Chia hai vế cho số âm (-2) phải đổi chiều < thành >: -x + y > -3.'
    },
    commonErrorCodes: ['E01', 'E02'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Rút gọn đúng 2x - 2y < 6', points: 5 },
        { stepIndex: 2, description: 'Đổi chiều đúng khi chia hai vế cho số âm', points: 5 }
      ]
    }
  },
  {
    id: 'A07',
    topic: 'A',
    level: 'van_dung',
    interactionType: 'drag_point_to_region',
    title: 'Kéo điểm M vào miền nghiệm của bất phương trình',
    learningObjective: 'Tương tác trên mặt phẳng tọa độ để tìm một điểm nghiệm thỏa mãn bất phương trình cho trước.',
    questionText: 'Trên mặt phẳng tọa độ, hãy kéo điểm thử M(x; y) vào bên trong miền nghiệm của bất phương trình 2x + y ≤ 4 (sao cho M không nằm trên đường biên).',
    mathData: {
      inequality: { id: 'a07', a: 2, b: 1, op: '<=', c: 4 },
      testPoint: { x: 3, y: 2 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Kéo điểm M trên đồ thị về phía thỏa mãn 2x + y < 4',
        instruction: 'Kéo điểm M trên đồ thị sang vùng có 2x + y < 4 (ví dụ gần gốc tọa độ O(0;0)) rồi bấm Kiểm chứng:',
        inputType: 'canvas_drag_point'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Xác nhận tính chất của nửa mặt phẳng chứa gốc O(0; 0)',
        instruction: 'Tại gốc tọa độ O(0; 0), vế trái 2(0) + 0 = 0 ≤ 4. Vậy miền nghiệm là:',
        inputType: 'choice',
        choices: [
          { id: 'o1', label: 'Nửa mặt phẳng bờ (d): 2x + y = 4 chứa gốc tọa độ O(0; 0) (kể cả bờ)', value: 'contains_O' },
          {
            id: 'o2',
            label: 'Nửa mặt phẳng bờ (d): 2x + y = 4 không chứa gốc tọa độ O(0; 0)',
            value: 'not_O',
            errorCodeIfChosen: 'E05',
            feedbackIfChosen: 'Vì O(0; 0) thỏa mãn 0 ≤ 4 nên miền nghiệm phải là nửa mặt phẳng CHỨA O(0; 0).'
          }
        ],
        expectedValue: 'contains_O'
      }
    ],
    canonicalAnswerSummary: 'Mọi điểm M(x; y) thỏa mãn 2x + y < 4 (nằm cùng phía O(0;0) so với bờ 2x + y = 4).',
    solutionExplanation: 'Đường biên 2x + y = 4 đi qua (0; 4) và (2; 0). Thay O(0; 0) được 0 ≤ 4 (đúng), nên miền nghiệm là nửa mặt phẳng chứa O(0; 0) kể cả đường biên.',
    hints: {
      tier1: 'Em hãy quan sát giá trị 2x + y khi kéo điểm M về gần gốc tọa độ (0; 0).',
      tier2: 'Tại (0; 0), 2(0) + 0 = 0 < 4. Hãy đặt điểm M ở vị trí có 2x + y < 4.',
      tier3: 'Kéo M tới tọa độ chẳng hạn (0; 0) hoặc (1; 1) (vì 2·1 + 1 = 3 < 4).'
    },
    commonErrorCodes: ['E04', 'E05'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Đặt điểm M đúng trong miền nghiệm thực sự (2x + y < 4)', points: 6 },
        { stepIndex: 2, description: 'Kết luận đúng nửa mặt phẳng chứa gốc tọa độ O', points: 4 }
      ]
    }
  },
  {
    id: 'A08',
    topic: 'A',
    level: 'van_dung',
    interactionType: 'enter_coordinate',
    title: 'Lập bất phương trình từ bài toán mua sắm thực tế',
    learningObjective: 'Mô hình hóa tình huống thực tế đơn giản thành một bất phương trình bậc nhất hai ẩn và kiểm tra phương án.',
    questionText: 'Bạn An có 60 nghìn đồng để mua bút bi (giá 5 nghìn đồng/chiếc, gọi số lượng là x) và vở viết (giá 10 nghìn đồng/quyển, gọi số lượng là y). Biết tổng số tiền không vượt quá 60 nghìn đồng.',
    mathData: {
      inequality: { id: 'a08', a: 5, b: 10, op: '<=', c: 60 },
      testPoint: { x: 4, y: 3 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Chọn bất phương trình biểu diễn số tiền mua hàng',
        instruction: 'Bất phương trình biểu thị điều kiện tổng số tiền không vượt quá 60 (nghìn đồng) là:',
        inputType: 'choice',
        choices: [
          { id: 's1', label: '5x + 10y ≤ 60 (hay x + 2y ≤ 12)', value: '5x + 10y <= 60' },
          {
            id: 's2',
            label: '5x + 10y ≥ 60',
            value: '5x + 10y >= 60',
            errorCodeIfChosen: 'E08',
            feedbackIfChosen: '"Không vượt quá 60" nghĩa là nhỏ hơn hoặc bằng (≤ 60), không phải ≥ 60.'
          },
          {
            id: 's3',
            label: '10x + 5y ≤ 60',
            value: '10x + 5y <= 60',
            errorCodeIfChosen: 'E08',
            feedbackIfChosen: 'Em ghép nhầm đơn giá: x là số bút (5 nghìn), y là số vở (10 nghìn).'
          }
        ],
        expectedValue: '5x + 10y <= 60'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Tính số tiền khi mua x = 4 chiếc bút và y = 3 quyển vở',
        instruction: 'Nhập tổng số tiền (nghìn đồng) khi An mua 4 bút và 3 vở:',
        inputType: 'number',
        expectedValue: 50,
        tolerance: 0.01
      }
    ],
    canonicalAnswerSummary: '5x + 10y ≤ 60; với x = 4, y = 3 thì 5(4) + 10(3) = 50 ≤ 60 (mua được, còn dư 10 nghìn).',
    solutionExplanation: 'Số tiền mua x bút là 5x, mua y vở là 10y. Vì có tối đa 60 nghìn nên 5x + 10y ≤ 60. Tại (4; 3): 5·4 + 10·3 = 50 ≤ 60.',
    hints: {
      tier1: 'Cụm từ "không vượt quá 60 nghìn đồng" tương ứng với dấu ≤ hay ≥?',
      tier2: 'Tổng tiền = (giá 1 bút)·x + (giá 1 vở)·y = 5x + 10y.',
      tier3: 'Với x = 4, y = 3: 5(4) + 10(3) = 20 + 30 = 50 (nghìn đồng).'
    },
    commonErrorCodes: ['E08', 'E01'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Lập đúng bất phương trình 5x + 10y ≤ 60', points: 5 },
        { stepIndex: 2, description: 'Tính đúng chi phí 50 nghìn đồng tại (4; 3)', points: 5 }
      ]
    }
  },
  {
    id: 'A09',
    topic: 'A',
    level: 'van_dung_cao',
    interactionType: 'multiple_choice',
    title: 'Tìm điều kiện tham số m để điểm thuộc miền nghiệm',
    learningObjective: 'Vận dụng điều kiện điểm M(x₀; y₀) thuộc miền nghiệm để giải bất phương trình tìm tham số m.',
    questionText: 'Tìm giá trị nguyên lớn nhất của tham số m để điểm M(2; -1) thuộc miền nghiệm của bất phương trình (m + 1)x - 2my ≤ 5.',
    mathData: {
      inequality: { id: 'a09', a: 2, b: -2, op: '<=', c: 5 },
      testPoint: { x: 2, y: -1 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Thế tọa độ M(2; -1) vào bất phương trình theo m',
        instruction: 'Khi thay x = 2 và y = -1 vào (m + 1)x - 2my ≤ 5, ta thu gọn được bất phương trình nào theo m?',
        inputType: 'choice',
        choices: [
          { id: 'm1', label: '4m + 2 ≤ 5', value: '4m + 2 <= 5' },
          {
            id: 'm2',
            label: '2 ≤ 5 (triệt tiêu m)',
            value: '2 <= 5',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: 'Chú ý dấu của -2m·y khi y = -1: (-2m)·(-1) = +2m, nên 2m + 2m = 4m chứ không triệt tiêu!'
          },
          {
            id: 'm3',
            label: '4m - 2 ≤ 5',
            value: '4m - 2 <= 5',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: '(m + 1)·2 = 2m + 2 (dấu +2 chứ không phải -2).'
          }
        ],
        expectedValue: '4m + 2 <= 5'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Tìm giá trị nguyên lớn nhất của m',
        instruction: 'Từ 4m + 2 ≤ 5 ⇔ m ≤ 3/4 (0.75), giá trị nguyên lớn nhất của m là bao nhiêu?',
        inputType: 'number',
        expectedValue: 0,
        tolerance: 0.001
      }
    ],
    canonicalAnswerSummary: '4m + 2 ≤ 5 ⇔ m ≤ 3/4 ⇒ Giá trị nguyên lớn nhất của m là m = 0.',
    solutionExplanation: 'Thay x = 2, y = -1 vào BPT: (m + 1)·2 - 2m·(-1) ≤ 5 ⇔ 2m + 2 + 2m ≤ 5 ⇔ 4m ≤ 3 ⇔ m ≤ 3/4 = 0.75. Vì m ∈ ℤ nên m_max = 0.',
    hints: {
      tier1: 'Thay x = 2 và y = -1 vào biểu thức (m + 1)x - 2my, đặc biệt chú ý tích (-2m)·(-1).',
      tier2: 'Ta có 2(m + 1) + 2m ≤ 5 ⇔ 4m + 2 ≤ 5 ⇔ m ≤ 3/4.',
      tier3: 'Số nguyên lớn nhất nhỏ hơn hoặc bằng 3/4 (0.75) là số 0.'
    },
    commonErrorCodes: ['E01', 'E02'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Rút gọn đúng bất phương trình 4m + 2 ≤ 5', points: 5 },
        { stepIndex: 2, description: 'Tìm đúng giá trị nguyên lớn nhất m = 0', points: 5 }
      ]
    }
  },
  {
    id: 'A10',
    topic: 'A',
    level: 'van_dung_cao',
    interactionType: 'enter_coordinate',
    title: 'Đếm số nghiệm nguyên dương của bất phương trình',
    learningObjective: 'Kết hợp điều kiện nguyên dương (x, y ∈ ℕ*) với bất phương trình bậc nhất hai ẩn để liệt kê chính xác tập nghiệm.',
    questionText: 'Có bao nhiêu cặp số nguyên dương (x; y) (tức x ≥ 1, y ≥ 1 và x, y ∈ ℤ) thỏa mãn bất phương trình 2x + 3y ≤ 10?',
    mathData: {
      inequality: { id: 'a10', a: 2, b: 3, op: '<=', c: 10 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Xét các giá trị nguyên dương có thể của y',
        instruction: 'Vì x ≥ 1 nên 3y ≤ 10 - 2x ≤ 8 ⇒ y chỉ có thể nhận các giá trị nguyên dương nào?',
        inputType: 'choice',
        choices: [
          { id: 'y1', label: 'y ∈ {1; 2}', value: '1;2' },
          {
            id: 'y2',
            label: 'y ∈ {0; 1; 2; 3}',
            value: '0;1;2;3',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Đề bài yêu cầu nguyên dương (x ≥ 1, y ≥ 1) nên không lấy y = 0; nếu y = 3 thì 2x + 9 ≤ 10 ⇒ x ≤ 0.5 (vô nghiệm nguyên dương).'
          }
        ],
        expectedValue: '1;2'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Nhập tổng số cặp nguyên dương (x; y) thỏa mãn',
        instruction: 'Đếm số giá trị x nguyên dương ứng với y = 1 và y = 2, sau đó nhập tổng số cặp nghiệm:',
        inputType: 'number',
        expectedValue: 5,
        tolerance: 0.001
      }
    ],
    canonicalAnswerSummary: 'Có 5 cặp nguyên dương: (1;1), (2;1), (3;1) (ứng với y = 1) và (1;2), (2;2) (ứng với y = 2).',
    solutionExplanation: 'Với y = 1: 2x ≤ 7 ⇒ x ∈ {1, 2, 3} (3 cặp). Với y = 2: 2x ≤ 4 ⇒ x ∈ {1, 2} (2 cặp). Với y ≥ 3: 2x ≤ 1 (không có x nguyên dương). Tổng cộng có 3 + 2 = 5 cặp.',
    hints: {
      tier1: 'Vì hệ số của y là 3 lớn hơn hệ số của x, em hãy thử lần lượt y = 1, y = 2, y = 3.',
      tier2: 'Khi y = 1: 2x + 3 ≤ 10 ⇔ 2x ≤ 7 ⇒ x ∈ {1; 2; 3}. Khi y = 2: 2x + 6 ≤ 10 ⇔ 2x ≤ 4 ⇒ x ∈ {1; 2}.',
      tier3: 'Tổng số cặp (x; y) nguyên dương là 3 + 2 = 5 cặp.'
    },
    commonErrorCodes: ['E01', 'E02'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Chặn đúng miền giá trị nguyên dương y ∈ {1; 2}', points: 5 },
        { stepIndex: 2, description: 'Đếm chính xác 5 cặp nghiệm nguyên dương', points: 5 }
      ]
    }
  },

  // ==========================================================================
  // CHỦ ĐỀ B: BIỂU DIỄN MIỀN NGHIỆM TRÊN MẶT PHẲNG TỌA ĐỘ (10 BÀI: B01 -> B10)
  // ==========================================================================
  {
    id: 'B01',
    topic: 'B',
    level: 'nhan_biet',
    interactionType: 'multiple_choice',
    title: 'Xác định phương trình đường biên và kiểu nét vẽ',
    learningObjective: 'Xác định đúng phương trình đường thẳng biên (d) và quy ước vẽ nét liền hay nét đứt.',
    questionText: 'Khi biểu diễn miền nghiệm của bất phương trình 2x - 5y < 10 trên mặt phẳng tọa độ Oxy, đường biên (d) có phương trình và kiểu nét vẽ như thế nào?',
    mathData: {
      inequality: { id: 'b01', a: 2, b: -5, op: '<', c: 10 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Chọn phương trình của đường biên (d)',
        instruction: 'Phương trình đường thẳng biên (d) ứng với bất phương trình 2x - 5y < 10 là:',
        inputType: 'choice',
        choices: [
          { id: 'e1', label: '2x - 5y = 10', value: '2x - 5y = 10' },
          {
            id: 'e2',
            label: '2x - 5y < 10',
            value: '2x - 5y < 10',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Phương trình đường thẳng biên phải dùng dấu bằng (=), không phải dấu bất phương trình (<).'
          }
        ],
        expectedValue: '2x - 5y = 10'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Chọn kiểu nét vẽ của đường biên (d)',
        instruction: 'Vì bất phương trình có dấu nghiêm ngặt (<), đường biên (d) được biểu diễn bằng:',
        inputType: 'choice',
        choices: [
          { id: 'st1', label: 'Nét đứt (không tính các điểm trên đường biên)', value: 'dashed' },
          {
            id: 'st2',
            label: 'Nét liền (tính cả các điểm trên đường biên)',
            value: 'solid',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Dấu < không có dấu bằng nên miền nghiệm không chứa bờ → phải vẽ nét đứt.'
          }
        ],
        expectedValue: 'dashed'
      }
    ],
    canonicalAnswerSummary: 'Đường biên (d): 2x - 5y = 10 vẽ bằng nét đứt (bỏ bờ).',
    solutionExplanation: 'Đường biên của ax + by < c là đường thẳng ax + by = c. Do dấu < là bất phương trình nghiêm ngặt nên bờ (d) không thuộc miền nghiệm và được vẽ bằng nét đứt.',
    hints: {
      tier1: 'Phương trình đường thẳng luôn dùng dấu gì giữa hai vế?',
      tier2: 'Dấu < có lấy các điểm làm cho 2x - 5y = 10 không?',
      tier3: 'Đường biên là 2x - 5y = 10 và vẽ bằng nét đứt.'
    },
    commonErrorCodes: ['E02'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Phân biệt đúng phương trình đường biên 2x - 5y = 10', points: 5 },
        { stepIndex: 2, description: 'Chọn đúng nét đứt cho dấu nghiêm ngặt <', points: 5 }
      ]
    }
  },
  {
    id: 'B02',
    topic: 'B',
    level: 'nhan_biet',
    interactionType: 'enter_coordinate',
    title: 'Tìm hai giao điểm với trục tọa độ để vẽ đường biên',
    learningObjective: 'Tìm chính xác tọa độ giao điểm A(0; y₀) và B(x₀; 0) của đường biên với hai trục tọa độ.',
    questionText: 'Để vẽ đường biên (d): 2x + y = 4 của bất phương trình 2x + y ≤ 4, ta tìm giao điểm A với trục Oy (x = 0) và giao điểm B với trục Ox (y = 0).',
    mathData: {
      inequality: { id: 'b02', a: 2, b: 1, op: '<=', c: 4 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Nhập tọa độ giao điểm A với trục tung Oy (cho x = 0)',
        instruction: 'Cho x = 0 trong phương trình 2x + y = 4, nhập tọa độ điểm A(x; y):',
        inputType: 'coordinate',
        expectedPoint: { x: 0, y: 4 },
        tolerance: 0.01
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Nhập tọa độ giao điểm B với trục hoành Ox (cho y = 0)',
        instruction: 'Cho y = 0 trong phương trình 2x + y = 4, nhập tọa độ điểm B(x; y):',
        inputType: 'coordinate',
        expectedPoint: { x: 2, y: 0 },
        tolerance: 0.01
      }
    ],
    canonicalAnswerSummary: 'A(0; 4) trên Oy và B(2; 0) trên Ox.',
    solutionExplanation: 'Với x = 0 ⇒ y = 4 ⇒ A(0; 4). Với y = 0 ⇒ 2x = 4 ⇒ x = 2 ⇒ B(2; 0). Nối A(0; 4) và B(2; 0) ta được đường biên (d).',
    hints: {
      tier1: 'Giao với Oy thì hoành độ x = 0; giao với Ox thì tung độ y = 0.',
      tier2: 'Thay x = 0 vào 2x + y = 4 được y = 4. Thay y = 0 vào 2x + y = 4 được 2x = 4.',
      tier3: 'Điểm A là (0; 4) và điểm B là (2; 0).'
    },
    commonErrorCodes: ['E03', 'E01'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Xác định đúng A(0; 4)', points: 5 },
        { stepIndex: 2, description: 'Xác định đúng B(2; 0)', points: 5 }
      ]
    }
  },
  {
    id: 'B03',
    topic: 'B',
    level: 'thong_hieu',
    interactionType: 'draw_boundary_line',
    title: 'Thực hành dựng đường biên trên mặt phẳng tọa độ',
    learningObjective: 'Đặt đúng 2 điểm A, B thuộc đường biên trên đồ thị tương tác và chọn đúng kiểu nét vẽ.',
    questionText: 'Cho bất phương trình x + y ≥ 3. Hãy kéo hai điểm A và B trên đồ thị sao cho cả hai điểm đều nằm trên đường biên (d): x + y = 3, và chọn kiểu nét vẽ phù hợp.',
    mathData: {
      inequality: { id: 'b03', a: 1, b: 1, op: '>=', c: 3 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Đặt 2 điểm phân biệt A, B lên đường thẳng x + y = 3',
        instruction: 'Kéo điểm A (ví dụ tới (0; 3)) và điểm B (ví dụ tới (3; 0)) trên mặt phẳng tọa độ sao cho x + y = 3:',
        inputType: 'canvas_boundary',
        expectedBoundaryStyle: 'solid'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Chọn kiểu nét vẽ cho đường biên của x + y ≥ 3',
        instruction: 'Đường biên x + y = 3 của bất phương trình x + y ≥ 3 được vẽ bằng nét gì?',
        inputType: 'choice',
        choices: [
          { id: 'bs1', label: 'Nét liền (vì dấu ≥ có lấy biên)', value: 'solid' },
          {
            id: 'bs2',
            label: 'Nét đứt (bỏ biên)',
            value: 'dashed',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Bất phương trình có dấu ≥ nên đường biên thuộc miền nghiệm → vẽ nét liền.'
          }
        ],
        expectedValue: 'solid'
      }
    ],
    canonicalAnswerSummary: 'Hai điểm A(0; 3), B(3; 0) thuộc đường biên x + y = 3, vẽ bằng nét liền.',
    solutionExplanation: 'Mọi cặp điểm phân biệt A(x₁; y₁), B(x₂; y₂) thỏa mãn x + y = 3 (chẳng hạn A(0; 3) và B(3; 0)) xác định duy nhất đường thẳng biên (d), vẽ nét liền do dấu ≥.',
    hints: {
      tier1: 'Hai điểm dễ tìm nhất trên đường thẳng x + y = 3 là giao điểm với hai trục tọa độ nào?',
      tier2: 'Cho x = 0 ⇒ y = 3 được A(0; 3); cho y = 0 ⇒ x = 3 được B(3; 0).',
      tier3: 'Kéo A tới (0; 3), B tới (3; 0) trên đồ thị và chọn Nét liền.'
    },
    commonErrorCodes: ['E03', 'E02'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Đặt đúng 2 điểm A, B phân biệt thỏa mãn x + y = 3', points: 6 },
        { stepIndex: 2, description: 'Chọn đúng nét liền', points: 4 }
      ]
    }
  },
  {
    id: 'B04',
    topic: 'B',
    level: 'thong_hieu',
    interactionType: 'multiple_choice',
    title: 'Quy tắc chọn điểm thử khi đường biên đi qua gốc tọa độ',
    learningObjective: 'Nhận biết trường hợp đường biên đi qua gốc tọa độ O(0;0) (c = 0) để chọn điểm thử hợp lệ ngoài đường biên.',
    questionText: 'Khi biểu diễn miền nghiệm của bất phương trình 2x - y ≥ 0, vì sao ta KHÔNG ĐƯỢC chọn gốc tọa độ O(0; 0) làm điểm thử?',
    mathData: {
      inequality: { id: 'b04', a: 2, b: -1, op: '>=', c: 0 },
      testPoint: { x: 1, y: 0 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Giải thích lý do không chọn O(0; 0) làm điểm thử',
        instruction: 'Chọn giải thích Toán học chính xác nhất:',
        inputType: 'choice',
        choices: [
          {
            id: 'r1',
            label: 'Vì O(0; 0) nằm ngay trên đường biên 2x - y = 0 nên không xác định được phía của nửa mặt phẳng',
            value: 'on_boundary'
          },
          {
            id: 'r2',
            label: 'Vì gốc tọa độ O(0; 0) không bao giờ là nghiệm của bất phương trình',
            value: 'never_solution',
            errorCodeIfChosen: 'E04',
            feedbackIfChosen: 'O(0; 0) vẫn là nghiệm của 2x - y ≥ 0, nhưng vì nằm trên ranh giới 2x - y = 0 nên nó không đại diện riêng cho nửa mặt phẳng nào.'
          }
        ],
        expectedValue: 'on_boundary'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Chọn điểm thử hợp lệ và xác định miền nghiệm',
        instruction: 'Nếu chọn điểm thử M(1; 0), thay vào 2x - y ≥ 0 ta được 2(1) - 0 = 2 ≥ 0 (Đúng). Vậy miền nghiệm là:',
        inputType: 'choice',
        choices: [
          { id: 'h1', label: 'Nửa mặt phẳng bờ (d): 2x - y = 0 chứa điểm M(1; 0) (kể cả bờ)', value: 'with_M' },
          {
            id: 'h2',
            label: 'Nửa mặt phẳng bờ (d): 2x - y = 0 chứa điểm N(1; 2)',
            value: 'with_N',
            errorCodeIfChosen: 'E04',
            feedbackIfChosen: 'Điểm N(1; 2) có 2(1) - 2 = 0 cũng nằm ngay trên đường biên (d)!'
          }
        ],
        expectedValue: 'with_M'
      }
    ],
    canonicalAnswerSummary: 'O(0;0) nằm trên bờ 2x - y = 0 nên phải chọn điểm thử ngoài bờ như M(1; 0); miền nghiệm là nửa mặt phẳng chứa M(1; 0).',
    solutionExplanation: 'Khi c = 0, đường thẳng ax + by = 0 luôn đi qua O(0; 0). Điểm thử bắt buộc phải không thuộc bờ (d), ví dụ M(1; 0) có 2(1) - 0 = 2 ≠ 0.',
    hints: {
      tier1: 'Thay (0; 0) vào phương trình đường biên 2x - y = 0 em nhận được đẳng thức gì?',
      tier2: 'Vì 2(0) - 0 = 0 nên O(0; 0) nằm trên đường phân giới (d). Điểm thử phải nằm ngoài (d).',
      tier3: 'Chọn M(1; 0) nằm ngoài (d); vì 2(1) - 0 = 2 ≥ 0 nên miền nghiệm chứa M(1; 0).'
    },
    commonErrorCodes: ['E04', 'E05'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Giải thích đúng lý do không lấy điểm thử trên đường biên', points: 5 },
        { stepIndex: 2, description: 'Xác định đúng nửa mặt phẳng qua điểm thử M(1; 0)', points: 5 }
      ]
    }
  },
  {
    id: 'B05',
    topic: 'B',
    level: 'thong_hieu',
    interactionType: 'select_half_plane',
    title: 'Chọn nửa mặt phẳng miền nghiệm trực tiếp trên đồ thị',
    learningObjective: 'Thao tác chọn đúng nửa mặt phẳng nghiệm trên đồ thị tương tác dựa vào điểm thử O(0; 0).',
    questionText: 'Cho bất phương trình x + 2y ≤ 4 và điểm thử tại gốc tọa độ O(0; 0). Hãy kiểm tra điểm thử O(0; 0) và nhấp chọn nửa mặt phẳng miền nghiệm đúng trên đồ thị.',
    mathData: {
      inequality: { id: 'b05', a: 1, b: 2, op: '<=', c: 4 },
      testPoint: { x: 0, y: 0 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Kiểm tra điểm thử O(0; 0)',
        instruction: 'Thay O(0; 0) vào x + 2y ≤ 4 ta được mệnh đề 0 ≤ 4. Mệnh đề này đúng hay sai?',
        inputType: 'choice',
        choices: [
          { id: 't1', label: 'Đúng (O(0; 0) thuộc miền nghiệm)', value: 'true' },
          {
            id: 't2',
            label: 'Sai (O(0; 0) không thuộc miền nghiệm)',
            value: 'false',
            errorCodeIfChosen: 'E01',
            feedbackIfChosen: '0 nhỏ hơn hoặc bằng 4 là mệnh đề ĐÚNG.'
          }
        ],
        expectedValue: 'true'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Nhấp chuột vào nửa mặt phẳng nghiệm trên đồ thị',
        instruction: 'Nhấp trực tiếp vào nửa mặt phẳng chứa miền nghiệm trên đồ thị (hoặc chọn phương án bên dưới):',
        inputType: 'canvas_half_plane',
        expectedHalfPlaneSide: 'with_test'
      }
    ],
    canonicalAnswerSummary: 'Nửa mặt phẳng bờ (d): x + 2y = 4 chứa gốc tọa độ O(0; 0) (kể cả bờ).',
    solutionExplanation: 'Đường biên x + 2y = 4 đi qua (0; 2) và (4; 0). Tại O(0; 0) có 0 + 2(0) = 0 ≤ 4 (đúng) nên miền nghiệm là nửa mặt phẳng chứa O(0; 0).',
    hints: {
      tier1: 'Tại O(0; 0), vế trái bằng 0. So với 4 thì 0 ≤ 4 đúng hay sai?',
      tier2: 'Vì O(0; 0) thỏa mãn bất phương trình nên nửa mặt phẳng chứa O(0; 0) chính là miền nghiệm.',
      tier3: 'Nhấp chuột vào phía nửa mặt phẳng có chứa điểm O(0; 0) trên đồ thị.'
    },
    commonErrorCodes: ['E05', 'E01'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Kiểm định đúng điểm thử O(0; 0)', points: 4 },
        { stepIndex: 2, description: 'Chọn đúng nửa mặt phẳng chứa điểm thử trên đồ thị', points: 6 }
      ]
    }
  },
  {
    id: 'B06',
    topic: 'B',
    level: 'van_dung',
    interactionType: 'select_half_plane',
    title: 'Chọn nửa mặt phẳng khi điểm thử KHÔNG thỏa mãn',
    learningObjective: 'Xác định đúng nửa mặt phẳng nghiệm trong trường hợp điểm thử O(0; 0) cho mệnh đề sai.',
    questionText: 'Biểu diễn miền nghiệm của bất phương trình 3x + 2y > 6 với điểm thử O(0; 0). Hãy thực hiện kiểm tra và chọn nửa mặt phẳng đúng trên đồ thị.',
    mathData: {
      inequality: { id: 'b06', a: 3, b: 2, op: '>', c: 6 },
      testPoint: { x: 0, y: 0 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Đánh giá điểm thử O(0; 0) với 3x + 2y > 6',
        instruction: 'Khi thay O(0; 0) vào 3x + 2y > 6, ta được 0 > 6 (Sai). Suy ra miền nghiệm là:',
        inputType: 'choice',
        choices: [
          { id: 'w1', label: 'Nửa mặt phẳng bờ (d) KHÔNG chứa O(0; 0), không kể đường biên (d)', value: 'without_O_dashed' },
          {
            id: 'w2',
            label: 'Nửa mặt phẳng bờ (d) chứa O(0; 0), không kể đường biên (d)',
            value: 'with_O_dashed',
            errorCodeIfChosen: 'E05',
            feedbackIfChosen: 'Vì O(0; 0) làm bất phương trình SAI (0 > 6 là sai) nên phải lấy nửa mặt phẳng KHÔNG chứa O(0; 0).'
          },
          {
            id: 'w3',
            label: 'Nửa mặt phẳng bờ (d) KHÔNG chứa O(0; 0), kể cả đường biên (d)',
            value: 'without_O_solid',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Bất phương trình có dấu nghiêm ngặt (>) nên không lấy đường biên (d).'
          }
        ],
        expectedValue: 'without_O_dashed'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Nhấp chọn nửa mặt phẳng nghiệm trên đồ thị',
        instruction: 'Nhấp chuột vào nửa mặt phẳng KHÔNG chứa O(0; 0) trên đồ thị để xác nhận miền nghiệm:',
        inputType: 'canvas_half_plane',
        expectedHalfPlaneSide: 'without_test'
      }
    ],
    canonicalAnswerSummary: 'Nửa mặt phẳng bờ (d): 3x + 2y = 6 không chứa O(0; 0), bỏ đường biên (nét đứt).',
    solutionExplanation: 'Thay O(0; 0) vào 3x + 2y > 6 được 0 > 6 (vô lý). Do đó miền nghiệm là nửa mặt phẳng bờ 3x + 2y = 6 không chứa O(0; 0), không kể đường biên.',
    hints: {
      tier1: 'Mệnh đề 0 > 6 là đúng hay sai? Nếu O(0; 0) sai thì miền nghiệm nằm cùng phía hay khác phía với O?',
      tier2: 'O(0; 0) không thỏa mãn nên miền nghiệm là nửa mặt phẳng đối diện (không chứa O), vẽ bờ nét đứt.',
      tier3: 'Nhấp chọn vùng nửa mặt phẳng phía bên phải/trên của đường thẳng 3x + 2y = 6 (không chứa O).'
    },
    commonErrorCodes: ['E05', 'E02'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Suy luận đúng nửa mặt phẳng không chứa O và bỏ bờ', points: 5 },
        { stepIndex: 2, description: 'Nhấp đúng nửa mặt phẳng trên đồ thị', points: 5 }
      ]
    }
  },
  {
    id: 'B07',
    topic: 'B',
    level: 'van_dung',
    interactionType: 'drag_point_to_region',
    title: 'Đặt điểm nghiệm cho bất phương trình có hệ số y âm',
    learningObjective: 'Tránh bẫy cảm tính "dấu ≥ luôn nằm phía trên" khi hệ số b của y là số âm.',
    questionText: 'Cho bất phương trình x - 2y ≥ 2. Nhiều học sinh nhìn thấy dấu ≥ liền đoán miền nghiệm nằm "phía trên" đường biên. Hãy kéo điểm M vào đúng miền nghiệm thực sự của x - 2y ≥ 2.',
    mathData: {
      inequality: { id: 'b07', a: 1, b: -2, op: '>=', c: 2 },
      testPoint: { x: 0, y: 2 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Kéo điểm M vào miền nghiệm của x - 2y ≥ 2',
        instruction: 'Kéo điểm M trên đồ thị tới một vị trí thỏa mãn x - 2y > 2 (ví dụ (4; 0) hoặc (3; -1)):',
        inputType: 'canvas_drag_point'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Giải thích vì sao miền nghiệm nằm phía dưới đường thẳng x - 2y = 2',
        instruction: 'Nếu rút y theo x từ bất phương trình x - 2y ≥ 2, ta được:',
        inputType: 'choice',
        choices: [
          { id: 'y1', label: 'y ≤ (x - 2)/2 (vì chia cho -2 nên đổi chiều thành ≤, nằm phía dưới bờ)', value: 'y <= (x-2)/2' },
          {
            id: 'y2',
            label: 'y ≥ (x - 2)/2',
            value: 'y >= (x-2)/2',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Từ -2y ≥ 2 - x, khi chia hai vế cho (-2) phải đổi chiều thành y ≤ (x - 2)/2!'
          }
        ],
        expectedValue: 'y <= (x-2)/2'
      }
    ],
    canonicalAnswerSummary: 'x - 2y ≥ 2 ⇔ y ≤ (x - 2)/2; miền nghiệm là nửa mặt phẳng không chứa O(0;0) (nằm phía dưới bờ).',
    solutionExplanation: 'Do hệ số b = -2 < 0 nên x - 2y ≥ 2 ⇔ 2y ≤ x - 2 ⇔ y ≤ 0.5x - 1. Thử O(0;0): 0 ≥ 2 (sai), nên miền nghiệm nằm ở nửa mặt phẳng không chứa O(0;0).',
    hints: {
      tier1: 'Thay O(0; 0) vào x - 2y ≥ 2 ta được 0 ≥ 2 (Đúng hay Sai)?',
      tier2: 'Vì O(0; 0) sai nên miền nghiệm nằm ở nửa mặt phẳng KHÔNG chứa O(0; 0) (ví dụ chứa điểm (4; 0)).',
      tier3: 'Kéo điểm M tới (4; 0) (vì 4 - 2·0 = 4 ≥ 2) và chọn y ≤ (x - 2)/2.'
    },
    commonErrorCodes: ['E05', 'E02'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Kéo điểm M vào đúng nửa mặt phẳng thỏa mãn x - 2y > 2', points: 6 },
        { stepIndex: 2, description: 'Giải thích đúng sự đổi chiều khi hệ số b < 0', points: 4 }
      ]
    }
  },
  {
    id: 'B08',
    topic: 'B',
    level: 'van_dung',
    interactionType: 'multiple_choice',
    title: 'Đọc đồ thị ngược: Lập bất phương trình từ hình vẽ miền nghiệm',
    learningObjective: 'Từ đường biên đi qua 2 điểm trên trục tọa độ và miền được tô màu, xác định đúng bất phương trình.',
    questionText: 'Quan sát đồ thị: Đường biên (d) vẽ bằng NÉT LIỀN đi qua A(0; 3) và B(2; 0). Phần miền nghiệm là nửa mặt phẳng CHỨA gốc tọa độ O(0; 0). Bất phương trình nào ứng với miền nghiệm đó?',
    mathData: {
      inequality: { id: 'b08', a: 3, b: 2, op: '<=', c: 6 },
      testPoint: { x: 0, y: 0 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Lập phương trình đường thẳng đi qua A(0; 3) và B(2; 0)',
        instruction: 'Theo phương trình đoạn chắn x/2 + y/3 = 1, quy đồng mẫu số ta được phương trình đường biên (d) là:',
        inputType: 'choice',
        choices: [
          { id: 'l1', label: '3x + 2y = 6', value: '3x + 2y = 6' },
          {
            id: 'l2',
            label: '2x + 3y = 6',
            value: '2x + 3y = 6',
            errorCodeIfChosen: 'E03',
            feedbackIfChosen: 'Thử lại A(0; 3) vào 2x + 3y = 6: 2(0) + 3(3) = 9 ≠ 6! Em đã ghép ngược hoành độ và tung độ.'
          }
        ],
        expectedValue: '3x + 2y = 6'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Xác định dấu của bất phương trình',
        instruction: 'Vì đường biên vẽ nét liền và miền nghiệm chứa O(0; 0), bất phương trình cần tìm là:',
        inputType: 'choice',
        choices: [
          { id: 'op1', label: '3x + 2y ≤ 6', value: '3x + 2y <= 6' },
          {
            id: 'op2',
            label: '3x + 2y < 6',
            value: '3x + 2y < 6',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Đường biên vẽ nét liền nghĩa là có lấy bờ → phải dùng dấu ≤.'
          },
          {
            id: 'op3',
            label: '3x + 2y ≥ 6',
            value: '3x + 2y >= 6',
            errorCodeIfChosen: 'E05',
            feedbackIfChosen: 'Tại O(0; 0), vế trái bằng 0. Để chứa O(0; 0) thì 0 phải nhỏ hơn hoặc bằng 6 (≤ 6).'
          }
        ],
        expectedValue: '3x + 2y <= 6'
      }
    ],
    canonicalAnswerSummary: '3x + 2y ≤ 6.',
    solutionExplanation: 'Đường thẳng qua A(0; 3) và B(2; 0) có phương trình x/2 + y/3 = 1 ⇔ 3x + 2y = 6. Vì miền nghiệm chứa O(0; 0) (3·0 + 2·0 = 0 < 6) và lấy cả bờ nét liền nên BPT là 3x + 2y ≤ 6.',
    hints: {
      tier1: 'Thay tọa độ A(0; 3) và B(2; 0) vào phương trình nào thì cả hai điểm đều thỏa mãn?',
      tier2: '3(0) + 2(3) = 6 và 3(2) + 2(0) = 6 ⇒ đường biên là 3x + 2y = 6.',
      tier3: 'Nét liền và chứa O(0; 0) (0 ≤ 6) nên bất phương trình là 3x + 2y ≤ 6.'
    },
    commonErrorCodes: ['E03', 'E02', 'E05'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Lập đúng phương trình đường biên 3x + 2y = 6', points: 5 },
        { stepIndex: 2, description: 'Xác định đúng dấu ≤ từ nét liền và điểm thử O(0; 0)', points: 5 }
      ]
    }
  },
  {
    id: 'B09',
    topic: 'B',
    level: 'van_dung_cao',
    interactionType: 'enter_coordinate',
    title: 'Tính diện tích tam giác tạo bởi miền nghiệm và hai trục tọa độ',
    learningObjective: 'Kết hợp biểu diễn hình học của bất phương trình với giao hai trục tọa độ để tính diện tích hình phẳng.',
    questionText: 'Gọi (S) là phần miền nghiệm của bất phương trình 2x + 3y ≤ 12 nằm trong góc phần tư thứ nhất (x ≥ 0, y ≥ 0). Tính diện tích của tam giác tạo bởi miền (S).',
    mathData: {
      inequality: { id: 'b09', a: 2, b: 3, op: '<=', c: 12 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Xác định hai giao điểm A(0; yA) và B(xB; 0) của đường biên 2x + 3y = 12',
        instruction: 'Nhập tọa độ giao điểm B(x; 0) của đường thẳng 2x + 3y = 12 với trục hoành Ox:',
        inputType: 'coordinate',
        expectedPoint: { x: 6, y: 0 },
        tolerance: 0.01
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Tính diện tích tam giác vuông OAB',
        instruction: 'Với A(0; 4) trên Oy (OA = 4) và B(6; 0) trên Ox (OB = 6), diện tích tam giác OAB bằng bao nhiêu?',
        inputType: 'number',
        expectedValue: 12,
        tolerance: 0.01
      }
    ],
    canonicalAnswerSummary: 'OA = 4, OB = 6 ⇒ S_OAB = 1/2 · OA · OB = 1/2 · 4 · 6 = 12 (đơn vị diện tích).',
    solutionExplanation: 'Đường thẳng 2x + 3y = 12 cắt Oy tại A(0; 4) và cắt Ox tại B(6; 0). Trong góc phần tư thứ nhất (x ≥ 0, y ≥ 0), miền nghiệm là tam giác vuông OAB có diện tích S = 1/2 · 4 · 6 = 12.',
    hints: {
      tier1: 'Đường thẳng 2x + 3y = 12 cắt trục Ox (y = 0) và trục Oy (x = 0) tại những điểm nào?',
      tier2: 'Khi y = 0 ⇒ 2x = 12 ⇒ B(6; 0). Khi x = 0 ⇒ 3y = 12 ⇒ A(0; 4).',
      tier3: 'Tam giác OAB vuông tại O nên S = (OA · OB) / 2 = (4 · 6) / 2 = 12.'
    },
    commonErrorCodes: ['E03', 'E01'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Tìm đúng giao điểm B(6; 0)', points: 5 },
        { stepIndex: 2, description: 'Tính đúng diện tích tam giác OAB = 12', points: 5 }
      ]
    }
  },
  {
    id: 'B10',
    topic: 'B',
    level: 'van_dung_cao',
    interactionType: 'select_half_plane',
    title: 'Phân biệt quy ước Tô miền nghiệm và Gạch bỏ miền sai (SGK Việt Nam)',
    learningObjective: 'Nắm vững cách đọc đề bài khi SGK yêu cầu "gạch bỏ phần không thuộc miền nghiệm".',
    questionText: 'Trong SGK Toán 10 Việt Nam, để biểu diễn miền nghiệm của x - y < 0 (đường biên x - y = 0 đi qua gốc O), nếu dùng quy ước GẠCH BỎ phần không phải nghiệm thì phần KHÔNG BỊ GẠCH chứa điểm nào?',
    mathData: {
      inequality: { id: 'b10', a: 1, b: -1, op: '<', c: 0 },
      testPoint: { x: 0, y: 2 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Chọn điểm thử ngoài đường biên x - y = 0',
        instruction: 'Vì đường biên đi qua O(0; 0), ta chọn điểm thử M(0; 2). Tại M(0; 2), bất phương trình x - y < 0 trở thành 0 - 2 < 0 (Đúng). Vậy phần KHÔNG BỊ GẠCH là:',
        inputType: 'choice',
        choices: [
          { id: 'g1', label: 'Nửa mặt phẳng bờ (d) chứa M(0; 2), không kể đường biên (d)', value: 'contains_M' },
          {
            id: 'g2',
            label: 'Nửa mặt phẳng bờ (d) chứa N(2; 0)',
            value: 'contains_N',
            errorCodeIfChosen: 'E05',
            feedbackIfChosen: 'Tại N(2; 0), x - y = 2 > 0 nên nửa chứa N(2; 0) là phần BỊ GẠCH BỎ!'
          }
        ],
        expectedValue: 'contains_M'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Nhấp chọn nửa mặt phẳng nghiệm (chứa M(0; 2)) trên đồ thị',
        instruction: 'Nhấp chuột vào nửa mặt phẳng thỏa mãn x < y (chứa M(0; 2)) trên đồ thị:',
        inputType: 'canvas_half_plane',
        expectedHalfPlaneSide: 'with_test'
      }
    ],
    canonicalAnswerSummary: 'Phần không bị gạch là nửa mặt phẳng bờ x - y = 0 chứa điểm M(0; 2), không kể bờ (nét đứt).',
    solutionExplanation: 'Đường biên x - y = 0 đi qua O(0; 0). Thử M(0; 2): 0 - 2 = -2 < 0 (đúng). Vậy nửa mặt phẳng chứa M(0; 2) là miền nghiệm (phần giữ lại không bị gạch), nửa chứa (2; 0) bị gạch bỏ.',
    hints: {
      tier1: 'Quy ước gạch bỏ trong SGK: Phần giữ lại (không bị gạch) là miền nghiệm hay miền sai?',
      tier2: 'Phần không bị gạch chính là miền nghiệm. Tại M(0; 2) có 0 - 2 = -2 < 0 (đúng).',
      tier3: 'Chọn nửa mặt phẳng chứa M(0; 2) trên đồ thị.'
    },
    commonErrorCodes: ['E04', 'E05'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Hiểu đúng quy ước phần không bị gạch là miền nghiệm chứa M(0; 2)', points: 5 },
        { stepIndex: 2, description: 'Chọn đúng nửa mặt phẳng trên đồ thị', points: 5 }
      ]
    }
  },

  // ==========================================================================
  // CHỦ ĐỀ C: HỆ BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN (10 BÀI: C01 -> C10)
  // ==========================================================================
  {
    id: 'C01',
    topic: 'C',
    level: 'nhan_biet',
    interactionType: 'select_feasible_point',
    title: 'Kiểm tra một điểm thuộc miền nghiệm của hệ bất phương trình',
    learningObjective: 'Kiểm tra tất cả các bất phương trình trong hệ để kết luận một điểm có thuộc miền nghiệm của hệ hay không.',
    questionText: 'Cho hệ bất phương trình: (d₁): x + y ≤ 5; (d₂): 2x - y ≥ 1; (d₃): y ≥ 0. Điểm nào trong các điểm dưới đây thuộc miền nghiệm của hệ?',
    mathData: {
      system: [
        { id: 'c01_1', a: 1, b: 1, op: '<=', c: 5, color: '#2563EB', label: '(d1)' },
        { id: 'c01_2', a: 2, b: -1, op: '>=', c: 1, color: '#D97706', label: '(d2)' },
        { id: 'c01_3', a: 0, b: 1, op: '>=', c: 0, color: '#059669', label: '(d3)' }
      ],
      candidatePoints: [
        { label: 'M', point: { x: 2, y: 1 } },
        { label: 'N', point: { x: 1, y: 3 } },
        { label: 'P', point: { x: 4, y: 2 } },
        { label: 'Q', point: { x: 2, y: -1 } }
      ]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Phát hiện bất phương trình bị vi phạm tại N(1; 3)',
        instruction: 'Điểm N(1; 3) thỏa mãn (d₁): 1 + 3 = 4 ≤ 5 và (d₃): 3 ≥ 0, nhưng vì sao N(1; 3) bị loại?',
        inputType: 'choice',
        choices: [
          { id: 'v1', label: 'Vì N(1; 3) vi phạm (d₂): 2(1) - 3 = -1 < 1', value: 'violates_d2' },
          {
            id: 'v2',
            label: 'N(1; 3) vẫn thuộc miền nghiệm vì đã thỏa mãn 2/3 bất phương trình',
            value: 'valid',
            errorCodeIfChosen: 'E07',
            feedbackIfChosen: 'Sai lầm phổ biến! Một điểm muốn thuộc miền nghiệm của hệ phải thỏa mãn 100% TẤT CẢ các bất phương trình trong hệ.'
          }
        ],
        expectedValue: 'violates_d2'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Chọn điểm thỏa mãn đồng thời cả 3 bất phương trình',
        instruction: 'Trong 4 điểm M(2; 1), N(1; 3), P(4; 2), Q(2; -1), điểm nào thỏa mãn toàn bộ hệ?',
        inputType: 'choice',
        choices: [
          { id: 'pt1', label: 'M(2; 1) vì 2+1=3≤5, 2(2)-1=3≥1 và 1≥0', value: 'M' },
          {
            id: 'pt2',
            label: 'P(4; 2)',
            value: 'P',
            errorCodeIfChosen: 'E07',
            feedbackIfChosen: 'Điểm P(4; 2) vi phạm (d₁) vì 4 + 2 = 6 > 5.'
          },
          {
            id: 'pt3',
            label: 'Q(2; -1)',
            value: 'Q',
            errorCodeIfChosen: 'E07',
            feedbackIfChosen: 'Điểm Q(2; -1) vi phạm (d₃): y ≥ 0 vì y = -1 < 0.'
          }
        ],
        expectedValue: 'M'
      }
    ],
    canonicalAnswerSummary: 'Điểm M(2; 1) thỏa mãn cả 3 bất phương trình trong hệ.',
    solutionExplanation: 'Thử M(2; 1): (d₁) 2 + 1 = 3 ≤ 5 (Đ); (d₂) 2(2) - 1 = 3 ≥ 1 (Đ); (d₃) 1 ≥ 0 (Đ). Các điểm N, P, Q đều vi phạm ít nhất 1 ràng buộc.',
    hints: {
      tier1: 'Muốn thuộc giao của 3 nửa mặt phẳng, điểm đó có được phép vi phạm bất phương trình nào không?',
      tier2: 'Kiểm tra M(2; 1) với từng bất phương trình: x + y ≤ 5, 2x - y ≥ 1 và y ≥ 0.',
      tier3: 'Tại M(2; 1): 2+1=3 ≤ 5; 4-1=3 ≥ 1; 1 ≥ 0 → M(2; 1) thỏa mãn toàn bộ hệ.'
    },
    commonErrorCodes: ['E07', 'E01'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Chỉ ra đúng ràng buộc (d₂) bị vi phạm tại N(1; 3)', points: 5 },
        { stepIndex: 2, description: 'Chọn đúng điểm M(2; 1) thỏa mãn toàn bộ hệ', points: 5 }
      ]
    }
  },
  {
    id: 'C02',
    topic: 'C',
    level: 'nhan_biet',
    interactionType: 'identify_feasible_region',
    title: 'Nhận diện hệ điều kiện góc phần tư thứ nhất',
    learningObjective: 'Nhận biết ý nghĩa hình học của hai ràng buộc không âm x ≥ 0, y ≥ 0 kết hợp với x + y ≤ 4.',
    questionText: 'Miền nghiệm của hệ bất phương trình { x ≥ 0; y ≥ 0; x + y ≤ 4 } trên mặt phẳng tọa độ Oxy là hình gì?',
    mathData: {
      system: [
        { id: 'c02_1', a: 1, b: 1, op: '<=', c: 4, color: '#2563EB', label: '(d1)' },
        { id: 'c02_2', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: '(Ox_y)' },
        { id: 'c02_3', a: 0, b: 1, op: '>=', c: 0, color: '#D97706', label: '(Oy_x)' }
      ]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Xác định số đỉnh của miền nghiệm trên đồ thị',
        instruction: 'Quan sát miền giao màu xanh trên đồ thị của hệ {x ≥ 0; y ≥ 0; x + y ≤ 4}, miền nghiệm là hình gì?',
        inputType: 'choice',
        choices: [
          { id: 'sh1', label: 'Miền tam giác vuông OAB với 3 đỉnh O(0;0), A(4;0), B(0;4)', value: 'triangle' },
          {
            id: 'sh2',
            label: 'Miền không bị chặn mở rộng ra vô cực',
            value: 'unbounded',
            errorCodeIfChosen: 'E07',
            feedbackIfChosen: 'Ba đường thẳng x = 0, y = 0 và x + y = 4 khép kín tạo thành một tam giác hữu hạn (bị chặn).'
          }
        ],
        expectedValue: 'triangle'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Kiểm tra điểm M(1; 2) trong miền tam giác',
        instruction: 'Điểm M(1; 2) nằm trong tam giác OAB có tổng x + y bằng bao nhiêu?',
        inputType: 'number',
        expectedValue: 3,
        tolerance: 0.01
      }
    ],
    canonicalAnswerSummary: 'Miền tam giác vuông OAB có 3 đỉnh O(0; 0), A(4; 0), B(0; 4).',
    solutionExplanation: 'Điều kiện x ≥ 0, y ≥ 0 giới hạn điểm thuộc góc phần tư thứ nhất. Kết hợp với x + y ≤ 4 tạo thành miền tam giác OAB với O(0;0), A(4;0), B(0;4).',
    hints: {
      tier1: 'Hai bất phương trình x ≥ 0 và y ≥ 0 giới hạn điểm nằm ở góc phần tư nào?',
      tier2: 'Đường thẳng x + y = 4 cắt hai trục dương Ox, Oy tại (4; 0) và (0; 4).',
      tier3: 'Miền giao là tam giác vuông OAB với 3 đỉnh O(0;0), A(4;0), B(0;4).'
    },
    commonErrorCodes: ['E07'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Nhận diện đúng miền đa giác tam giác OAB', points: 6 },
        { stepIndex: 2, description: 'Tính đúng giá trị tại điểm trong miền', points: 4 }
      ]
    }
  },
  {
    id: 'C03',
    topic: 'C',
    level: 'thong_hieu',
    interactionType: 'find_intersection',
    title: 'Tìm tọa độ giao điểm của hai đường biên trong hệ',
    learningObjective: 'Giải hệ phương trình hai đường biên để tìm chính xác tọa độ giao điểm.',
    questionText: 'Cho hệ bất phương trình có hai đường biên (d₁): x + y = 6 và (d₂): x - y = 2 (với x ≥ 0, y ≥ 0). Hãy tìm tọa độ giao điểm I của (d₁) và (d₂).',
    mathData: {
      system: [
        { id: 'c03_1', a: 1, b: 1, op: '<=', c: 6, color: '#2563EB', label: '(d1)' },
        { id: 'c03_2', a: 1, b: -1, op: '<=', c: 2, color: '#D97706', label: '(d2)' },
        { id: 'c03_3', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: 'x >= 0' },
        { id: 'c03_4', a: 0, b: 1, op: '>=', c: 0, color: '#7C3AED', label: 'y >= 0' }
      ],
      intersectionLinePair: [0, 1]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Giải hệ phương trình { x + y = 6 ; x - y = 2 }',
        instruction: 'Nhập tọa độ giao điểm I(x; y) của hai đường biên (d₁) và (d₂):',
        inputType: 'coordinate',
        expectedPoint: { x: 4, y: 2 },
        tolerance: 0.01
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Kiểm chứng I(4; 2) có phải là đỉnh của miền nghiệm không',
        instruction: 'Điểm I(4; 2) có thỏa mãn hai ràng buộc còn lại x ≥ 0 và y ≥ 0 không?',
        inputType: 'choice',
        choices: [
          { id: 'ok1', label: 'Có, vì 4 ≥ 0 và 2 ≥ 0 nên I(4; 2) là một đỉnh hợp lệ của miền nghiệm', value: 'yes' },
          {
            id: 'ok2',
            label: 'Không, I(4; 2) bị loại',
            value: 'no',
            errorCodeIfChosen: 'E07',
            feedbackIfChosen: 'I(4; 2) có hoành độ 4 ≥ 0 và tung độ 2 ≥ 0 nên thỏa mãn toàn bộ 4 bất phương trình trong hệ.'
          }
        ],
        expectedValue: 'yes'
      }
    ],
    canonicalAnswerSummary: 'Giao điểm I(4; 2) là đỉnh hợp lệ của miền nghiệm.',
    solutionExplanation: 'Cộng từng vế hai phương trình (x + y) + (x - y) = 6 + 2 ⇒ 2x = 8 ⇒ x = 4, suy ra y = 6 - 4 = 2. Vì 4 ≥ 0, 2 ≥ 0 nên I(4; 2) là đỉnh miền nghiệm.',
    hints: {
      tier1: 'Nếu cộng vế theo vế hai phương trình x + y = 6 và x - y = 2 thì ẩn y sẽ như thế nào?',
      tier2: '(x + y) + (x - y) = 2x = 8 ⇒ x = 4. Thay x = 4 vào x + y = 6 để tìm y.',
      tier3: 'Ta tìm được I(4; 2). Cả x = 4 và y = 2 đều dương nên I(4; 2) là đỉnh hợp lệ.'
    },
    commonErrorCodes: ['E06', 'E07'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Giải đúng giao điểm I(4; 2)', points: 6 },
        { stepIndex: 2, description: 'Xác nhận I(4; 2) thỏa mãn toàn bộ hệ', points: 4 }
      ]
    }
  },
  {
    id: 'C04',
    topic: 'C',
    level: 'thong_hieu',
    interactionType: 'find_intersection',
    title: 'Loại giao điểm vi phạm ràng buộc thứ ba (Bẫy giao điểm ảo)',
    learningObjective: 'Phân biệt giữa "giao điểm của hai đường bờ" và "đỉnh cực biên hợp lệ của miền nghiệm".',
    questionText: 'Xét hệ bất phương trình: (d₁): x + y ≤ 4; (d₂): y ≤ 3; (d₃): x ≥ 0; (d₄): y ≥ 0. Gọi K là giao điểm của trục tung (x = 0) và đường thẳng (d₁): x + y = 4. Hãy kiểm tra xem K(0; 4) có phải là đỉnh của miền nghiệm không.',
    mathData: {
      system: [
        { id: 'c04_1', a: 1, b: 1, op: '<=', c: 4, color: '#2563EB', label: '(d1): x+y<=4' },
        { id: 'c04_2', a: 0, b: 1, op: '<=', c: 3, color: '#DC2626', label: '(d2): y<=3' },
        { id: 'c04_3', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: '(d3): x>=0' },
        { id: 'c04_4', a: 0, b: 1, op: '>=', c: 0, color: '#D97706', label: '(d4): y>=0' }
      ],
      intersectionLinePair: [0, 1]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Kiểm tra giao điểm K(0; 4) với ràng buộc (d₂): y ≤ 3',
        instruction: 'Điểm K(0; 4) là giao của x = 0 và x + y = 4. Điểm K(0; 4) có thuộc miền nghiệm của hệ không?',
        inputType: 'choice',
        choices: [
          { id: 'k1', label: 'Bị loại, vì tại K(0; 4) ta có y = 4 > 3 (vi phạm bất phương trình y ≤ 3)', value: 'rejected' },
          {
            id: 'k2',
            label: 'Hợp lệ, vì K(0; 4) nằm trên đường biên x + y = 4 và x = 0',
            value: 'valid',
            errorCodeIfChosen: 'E07',
            feedbackIfChosen: 'Tuy K(0; 4) là giao của 2 đường biên nhưng nó vi phạm ràng buộc (d₂): y ≤ 3 (vì 4 > 3) nên bị cắt bỏ!'
          }
        ],
        expectedValue: 'rejected'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Tìm đỉnh hợp lệ thay thế khi (d₁): x + y = 4 cắt (d₂): y = 3',
        instruction: 'Nhập tọa độ giao điểm hợp lệ của hai đường thẳng x + y = 4 và y = 3:',
        inputType: 'coordinate',
        expectedPoint: { x: 1, y: 3 },
        tolerance: 0.01
      }
    ],
    canonicalAnswerSummary: 'Giao điểm K(0; 4) bị loại do vi phạm y ≤ 3; các đỉnh thực sự là (0;0), (4;0), (1;3), (0;3).',
    solutionExplanation: 'Đường thẳng y = 3 cắt bỏ phần góc nhọn phía trên tại K(0; 4), tạo ra 2 đỉnh mới là (0; 3) và (1; 3). Miền nghiệm là hình thang vuông có 4 đỉnh (0;0), (4;0), (1;3), (0;3).',
    hints: {
      tier1: 'Tại điểm K(0; 4), tung độ y bằng 4 có thỏa mãn điều kiện y ≤ 3 không?',
      tier2: 'Vì 4 > 3 nên K(0; 4) bị loại. Thay y = 3 vào phương trình x + y = 4 để tìm đỉnh giao mới.',
      tier3: 'x + 3 = 4 ⇒ x = 1. Vậy giao điểm hợp lệ là (1; 3).'
    },
    commonErrorCodes: ['E07', 'E06'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Phát hiện đúng K(0; 4) vi phạm ràng buộc y ≤ 3', points: 5 },
        { stepIndex: 2, description: 'Tìm đúng đỉnh giao điểm hợp lệ (1; 3)', points: 5 }
      ]
    }
  },
  {
    id: 'C05',
    topic: 'C',
    level: 'thong_hieu',
    interactionType: 'drag_point_to_region',
    title: 'Kéo điểm M vào miền giao của hệ 3 bất phương trình',
    learningObjective: 'Tương tác trực quan trên đồ thị hệ BPT để đặt điểm thử M nằm trong miền giao chung.',
    questionText: 'Cho hệ bất phương trình: { x + y ≤ 5; x - y ≤ 1; x ≥ 1; y ≥ 1 }. Hãy kéo điểm M trên đồ thị vào bên trong miền nghiệm chung của hệ.',
    mathData: {
      system: [
        { id: 'c05_1', a: 1, b: 1, op: '<=', c: 5, color: '#2563EB', label: '(d1): x+y<=5' },
        { id: 'c05_2', a: 1, b: -1, op: '<=', c: 1, color: '#D97706', label: '(d2): x-y<=1' },
        { id: 'c05_3', a: 1, b: 0, op: '>=', c: 1, color: '#059669', label: '(d3): x>=1' },
        { id: 'c05_4', a: 0, b: 1, op: '>=', c: 1, color: '#7C3AED', label: '(d4): y>=1' }
      ],
      testPoint: { x: 4, y: 1 }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Kéo điểm M trên đồ thị vào vùng đa giác miền nghiệm chung',
        instruction: 'Kéo điểm M vào miền đa giác màu xanh thỏa mãn cả 4 bất phương trình (ví dụ (2; 2)):',
        inputType: 'canvas_drag_point'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Tìm giao điểm cao nhất của (d₁): x + y = 5 và (d₃): x = 1',
        instruction: 'Nhập tọa độ giao điểm của đường thẳng x = 1 và x + y = 5:',
        inputType: 'coordinate',
        expectedPoint: { x: 1, y: 4 },
        tolerance: 0.01
      }
    ],
    canonicalAnswerSummary: 'Điểm trong miền giao (ví dụ M(2; 2)) và đỉnh cao nhất (1; 4).',
    solutionExplanation: 'Các đỉnh của miền nghiệm là A(1; 1), B(2; 1), C(3; 2), D(1; 4). Điểm M(2; 2) nằm hoàn toàn bên trong tứ giác ABCD.',
    hints: {
      tier1: 'Quan sát vùng được tô màu xanh đậm trên đồ thị hệ bất phương trình.',
      tier2: 'Thử điểm (2; 2): 2+2=4≤5; 2-2=0≤1; 2≥1; 2≥1 (thỏa mãn cả 4 ràng buộc).',
      tier3: 'Kéo M tới (2; 2) và nhập giao điểm của x = 1 với x + y = 5 là (1; 4).'
    },
    commonErrorCodes: ['E07', 'E06'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Kéo điểm M vào đúng miền giao chung trên đồ thị', points: 5 },
        { stepIndex: 2, description: 'Tính đúng đỉnh (1; 4)', points: 5 }
      ]
    }
  },
  {
    id: 'C06',
    topic: 'C',
    level: 'van_dung',
    interactionType: 'identify_feasible_region',
    title: 'Phân loại miền nghiệm: Đa giác bị chặn, Không bị chặn hay Miền rỗng',
    learningObjective: 'Phân biệt chính xác hệ có miền nghiệm rỗng (mâu thuẫn) và hệ có miền nghiệm không bị chặn.',
    questionText: 'Xét hệ bất phương trình: { x + y ≤ 2; x + y ≥ 5; x ≥ 0; y ≥ 0 }. Hãy phân tích đặc điểm hình học của miền nghiệm hệ này.',
    mathData: {
      system: [
        { id: 'c06_1', a: 1, b: 1, op: '<=', c: 2, color: '#2563EB', label: '(d1): x+y<=2' },
        { id: 'c06_2', a: 1, b: 1, op: '>=', c: 5, color: '#DC2626', label: '(d2): x+y>=5' },
        { id: 'c06_3', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: 'x>=0' },
        { id: 'c06_4', a: 0, b: 1, op: '>=', c: 0, color: '#D97706', label: 'y>=0' }
      ]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Nhận xét quan hệ giữa hai đường biên x + y = 2 và x + y = 5',
        instruction: 'Hai đường thẳng (d₁): x + y = 2 và (d₂): x + y = 5 có vị trí tương đối nào?',
        inputType: 'choice',
        choices: [
          { id: 'p1', label: 'Song song với nhau và hai nửa mặt phẳng x + y ≤ 2, x + y ≥ 5 ngược hướng hoàn toàn', value: 'parallel_disjoint' },
          {
            id: 'p2',
            label: 'Cắt nhau tại một điểm trong góc phần tư thứ nhất',
            value: 'intersect',
            errorCodeIfChosen: 'E06',
            feedbackIfChosen: 'Hai đường thẳng có cùng hệ số a = 1, b = 1 nên định thức D = 1·1 - 1·1 = 0 (song song, không cắt nhau).'
          }
        ],
        expectedValue: 'parallel_disjoint'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Kết luận loại miền nghiệm của hệ',
        instruction: 'Vì không có số thực nào vừa ≤ 2 lại vừa ≥ 5, miền nghiệm của hệ thuộc loại nào?',
        inputType: 'choice',
        choices: [
          { id: 'r1', label: 'Miền nghiệm rỗng (Hệ vô nghiệm, S = ∅)', value: 'empty' },
          {
            id: 'r2',
            label: 'Miền nghiệm là dải hình phẳng nằm giữa hai đường thẳng song song',
            value: 'strip',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Dải nằm giữa chỉ xảy ra khi 2 ≤ x + y ≤ 5. Còn ở đây là x + y ≤ 2 VÀ x + y ≥ 5 nên giao của chúng bằng rỗng!'
          }
        ],
        expectedValue: 'empty'
      }
    ],
    canonicalAnswerSummary: 'Miền nghiệm rỗng (S = ∅) do hai ràng buộc x + y ≤ 2 và x + y ≥ 5 mâu thuẫn.',
    solutionExplanation: 'Hai nửa mặt phẳng x + y ≤ 2 và x + y ≥ 5 có bờ song song và hướng về hai phía rời nhau nên không có điểm chung nào. Hệ vô nghiệm.',
    hints: {
      tier1: 'Có tồn tại cặp (x; y) nào mà tổng x + y vừa nhỏ hơn hoặc bằng 2, vừa lớn hơn hoặc bằng 5 không?',
      tier2: 'Hai đường thẳng x + y = 2 và x + y = 5 song song và hai nửa mặt phẳng quay lưng vào nhau.',
      tier3: 'Giao của các nửa mặt phẳng bằng rỗng: Miền nghiệm rỗng (vô nghiệm).'
    },
    commonErrorCodes: ['E02', 'E07'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Nhận diện hai đường biên song song và hai nửa mặt phẳng rời nhau', points: 5 },
        { stepIndex: 2, description: 'Kết luận đúng miền nghiệm rỗng', points: 5 }
      ]
    }
  },
  {
    id: 'C07',
    topic: 'C',
    level: 'van_dung',
    interactionType: 'find_intersection',
    title: 'Xác định đỉnh tọa độ hữu tỉ (phân số) của miền tứ giác',
    learningObjective: 'Giải chính xác giao điểm có tọa độ phân số (8/3; 8/3) mà không làm tròn sai lệch.',
    questionText: 'Cho hệ bất phương trình chuẩn: { 2x + y ≤ 8; x + 2y ≤ 8; x ≥ 0; y ≥ 0 }. Hãy tìm đầy đủ tọa độ giao điểm B của hai đường biên (d₁): 2x + y = 8 và (d₂): x + 2y = 8.',
    mathData: {
      system: [
        { id: 'c07_1', a: 2, b: 1, op: '<=', c: 8, color: '#2563EB', label: '(d1): 2x+y<=8' },
        { id: 'c07_2', a: 1, b: 2, op: '<=', c: 8, color: '#D97706', label: '(d2): x+2y<=8' },
        { id: 'c07_3', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: 'x>=0' },
        { id: 'c07_4', a: 0, b: 1, op: '>=', c: 0, color: '#7C3AED', label: 'y>=0' }
      ],
      intersectionLinePair: [0, 1]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Nhập tọa độ chính xác của giao điểm B (hỗ trợ nhập phân số như 8/3)',
        instruction: 'Giải hệ { 2x + y = 8 ; x + 2y = 8 } và nhập tọa độ đỉnh B(x; y) (gợi ý: nhập 8/3 cho cả x và y):',
        inputType: 'coordinate',
        expectedPoint: { x: 8 / 3, y: 8 / 3 },
        tolerance: 0.02
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Xác định tổng số đỉnh cực biên của miền nghiệm',
        instruction: 'Tính cả gốc O(0;0), A(4;0), B(8/3; 8/3) và C(0;4), miền nghiệm của hệ là đa giác có mấy đỉnh?',
        inputType: 'number',
        expectedValue: 4,
        tolerance: 0.001
      }
    ],
    canonicalAnswerSummary: 'Miền nghiệm là tứ giác lồi 4 đỉnh: O(0; 0), A(4; 0), B(8/3; 8/3), C(0; 4).',
    solutionExplanation: 'Cộng 2 phương trình: 3(x + y) = 16 ⇒ x + y = 16/3. Do tính đối xứng x = y = 8/3. Tại B(8/3; 8/3), x ≥ 0 và y ≥ 0 đều thỏa mãn nên miền nghiệm là tứ giác 4 đỉnh O, A, B, C.',
    hints: {
      tier1: 'Cộng hai phương trình 2x + y = 8 và x + 2y = 8 ta được 3x + 3y = 16. Vì hệ đối xứng nên x và y quan hệ thế nào?',
      tier2: 'Từ 2x + y = 8 ⇒ y = 8 - 2x. Thế vào x + 2(8 - 2x) = 8 ⇔ -3x = -8 ⇔ x = 8/3.',
      tier3: 'Nhập x = 8/3, y = 8/3. Đa giác miền nghiệm là tứ giác có 4 đỉnh.'
    },
    commonErrorCodes: ['E06', 'E07'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Tìm đúng tọa độ hữu tỉ B(8/3; 8/3)', points: 6 },
        { stepIndex: 2, description: 'Xác định đủ 4 đỉnh của miền tứ giác', points: 4 }
      ]
    }
  },
  {
    id: 'C08',
    topic: 'C',
    level: 'van_dung',
    interactionType: 'identify_feasible_region',
    title: 'Nhận diện miền nghiệm không bị chặn (Unbounded Region)',
    learningObjective: 'Nhận biết hệ bất phương trình có miền nghiệm mở rộng vô hạn (không bị chặn) nhưng vẫn có các đỉnh biên hữu hạn.',
    questionText: 'Cho hệ bất phương trình: { x + y ≥ 4; 2x + y ≥ 6; x ≥ 0; y ≥ 0 }. Hãy xác định tính chất của miền nghiệm và các đỉnh biên của nó.',
    mathData: {
      system: [
        { id: 'c08_1', a: 1, b: 1, op: '>=', c: 4, color: '#2563EB', label: '(d1): x+y>=4' },
        { id: 'c08_2', a: 2, b: 1, op: '>=', c: 6, color: '#D97706', label: '(d2): 2x+y>=6' },
        { id: 'c08_3', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: 'x>=0' },
        { id: 'c08_4', a: 0, b: 1, op: '>=', c: 0, color: '#7C3AED', label: 'y>=0' }
      ]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Phân loại miền nghiệm của hệ',
        instruction: 'Khi x → +∞ và y → +∞, mọi điểm đều thỏa mãn hệ. Vậy miền nghiệm của hệ thuộc loại nào?',
        inputType: 'choice',
        choices: [
          { id: 'u1', label: 'Miền nghiệm không bị chặn (mở rộng ra vô cực ở góc phần tư thứ nhất)', value: 'unbounded' },
          {
            id: 'u2',
            label: 'Miền đa giác khép kín (bị chặn) vì trên màn hình thấy hình tứ giác',
            value: 'bounded',
            errorCodeIfChosen: 'E07',
            feedbackIfChosen: 'Không được suy ra tính bị chặn chỉ từ khung nhìn màn hình! Phía trên/phải không có đường biên nào chặn lại.'
          }
        ],
        expectedValue: 'unbounded'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Xác định các đỉnh cực biên hữu hạn của miền không bị chặn này',
        instruction: 'Ba đỉnh cực biên của miền nghiệm trên là:',
        inputType: 'choice',
        choices: [
          { id: 'v1', label: 'A(4; 0), B(2; 2), C(0; 6)', value: 'A(4;0),B(2;2),C(0;6)' },
          {
            id: 'v2',
            label: 'A(3; 0), B(2; 2), C(0; 4)',
            value: 'A(3;0),B(2;2),C(0;4)',
            errorCodeIfChosen: 'E07',
            feedbackIfChosen: 'Điểm (3; 0) vi phạm x + y ≥ 4 (3 < 4), còn điểm (0; 4) vi phạm 2x + y ≥ 6 (4 < 6)!'
          }
        ],
        expectedValue: 'A(4;0),B(2;2),C(0;6)'
      }
    ],
    canonicalAnswerSummary: 'Miền nghiệm không bị chặn với 3 đỉnh cực biên hữu hạn: A(4; 0), B(2; 2), C(0; 6).',
    solutionExplanation: 'Giao của x+y=4 và 2x+y=6 là B(2; 2). Trên Ox (y=0), x ≥ max(4, 3) = 4 ⇒ đỉnh A(4; 0). Trên Oy (x=0), y ≥ max(4, 6) = 6 ⇒ đỉnh C(0; 6). Miền mở rộng ra +∞ nên không bị chặn.',
    hints: {
      tier1: 'Trên trục Ox (y = 0), điểm (3; 0) có thỏa mãn bất phương trình x + y ≥ 4 không?',
      tier2: 'Điểm (3; 0) có 3 + 0 = 3 < 4 nên bị loại; đỉnh trên Ox phải là (4; 0). Tương tự trên Oy phải là (0; 6).',
      tier3: 'Giao của x + y = 4 và 2x + y = 6 là B(2; 2). Ba đỉnh biên là A(4; 0), B(2; 2), C(0; 6).'
    },
    commonErrorCodes: ['E07', 'E06'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Nhận biết đúng miền nghiệm không bị chặn (không phụ thuộc khung nhìn)', points: 5 },
        { stepIndex: 2, description: 'Lọc đúng 3 đỉnh cực biên A(4;0), B(2;2), C(0;6)', points: 5 }
      ]
    }
  },
  {
    id: 'C09',
    topic: 'C',
    level: 'van_dung_cao',
    interactionType: 'enter_coordinate',
    title: 'Tính diện tích miền đa giác nghiệm của hệ bất phương trình',
    learningObjective: 'Tìm đầy đủ các đỉnh của miền đa giác bị chặn và tính diện tích đa giác đó.',
    questionText: 'Cho hệ bất phương trình: { x + y ≤ 5; x ≥ 1; y ≥ 1 }. Miền nghiệm của hệ là một tam giác vuông. Hãy tìm tọa độ các đỉnh và tính diện tích của miền nghiệm.',
    mathData: {
      system: [
        { id: 'c09_1', a: 1, b: 1, op: '<=', c: 5, color: '#2563EB', label: 'x+y<=5' },
        { id: 'c09_2', a: 1, b: 0, op: '>=', c: 1, color: '#059669', label: 'x>=1' },
        { id: 'c09_3', a: 0, b: 1, op: '>=', c: 1, color: '#D97706', label: 'y>=1' }
      ]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Tìm đỉnh góc vuông A (giao của x = 1 và y = 1) và đỉnh B (giao của y = 1 với x + y = 5)',
        instruction: 'Nhập tọa độ đỉnh B (giao của đường thẳng y = 1 và x + y = 5):',
        inputType: 'coordinate',
        expectedPoint: { x: 4, y: 1 },
        tolerance: 0.01
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Tính diện tích tam giác ABC với A(1; 1), B(4; 1), C(1; 4)',
        instruction: 'Tam giác ABC vuông cân tại A(1; 1) có AB = 3, AC = 3. Nhập diện tích của tam giác ABC (chấp nhận 4.5 hoặc 9/2):',
        inputType: 'number',
        expectedValue: 4.5,
        tolerance: 0.01
      }
    ],
    canonicalAnswerSummary: '3 đỉnh A(1; 1), B(4; 1), C(1; 4); diện tích S = 1/2 · 3 · 3 = 9/2 = 4.5.',
    solutionExplanation: 'Ba đường biên cắt nhau tại A(1; 1), B(4; 1), C(1; 4). Đoạn AB = 4 - 1 = 3, đoạn AC = 4 - 1 = 3, AB ⊥ AC nên S = 1/2 · 3 · 3 = 4.5.',
    hints: {
      tier1: 'Thay y = 1 vào x + y = 5 ta tìm được x bằng bao nhiêu?',
      tier2: 'x = 4 ⇒ B(4; 1). Tương tự thay x = 1 vào x + y = 5 được C(1; 4).',
      tier3: 'Độ dài hai cạnh góc vuông là AB = 4 - 1 = 3 và AC = 4 - 1 = 3. Diện tích S = 3·3/2 = 4.5.'
    },
    commonErrorCodes: ['E06', 'E01'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Tìm đúng đỉnh B(4; 1)', points: 5 },
        { stepIndex: 2, description: 'Tính đúng diện tích S = 4.5 (9/2)', points: 5 }
      ]
    }
  },
  {
    id: 'C10',
    topic: 'C',
    level: 'van_dung_cao',
    interactionType: 'identify_feasible_region',
    title: 'Phân tích trường hợp miền nghiệm suy biến và biên nghiêm ngặt',
    learningObjective: 'Nhận diện miền nghiệm suy biến thành đoạn thẳng hoặc giao điểm nằm trên biên nét đứt bị loại.',
    questionText: 'Xét hai hệ bất phương trình đặc biệt:\n• Hệ (I): { x + y ≤ 3; x + y ≥ 3; x ≥ 0; y ≥ 0 }\n• Hệ (II): { x + y < 4; x ≥ 0; y ≥ 0 }.\nHãy xác định khẳng định đúng cho từng hệ.',
    mathData: {
      system: [
        { id: 'c10_1', a: 1, b: 1, op: '<=', c: 3, color: '#2563EB', label: 'x+y<=3' },
        { id: 'c10_2', a: 1, b: 1, op: '>=', c: 3, color: '#DC2626', label: 'x+y>=3' },
        { id: 'c10_3', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: 'x>=0' },
        { id: 'c10_4', a: 0, b: 1, op: '>=', c: 0, color: '#D97706', label: 'y>=0' }
      ]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Xác định miền nghiệm của Hệ (I)',
        instruction: 'Khi x + y ≤ 3 đồng thời x + y ≥ 3 với x, y ≥ 0, miền nghiệm của Hệ (I) là:',
        inputType: 'choice',
        choices: [
          { id: 'dg1', label: 'Miền nghiệm suy biến thành đoạn thẳng nối hai điểm (3; 0) và (0; 3)', value: 'segment' },
          {
            id: 'dg2',
            label: 'Miền nghiệm rỗng',
            value: 'empty',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Vì cả hai bất phương trình đều có dấu bằng (≤ 3 và ≥ 3) nên giao của chúng là đường thẳng x + y = 3; kết hợp x, y ≥ 0 tạo thành đoạn thẳng nối (3;0) và (0;3).'
          }
        ],
        expectedValue: 'segment'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Xét giao điểm (4; 0) và (0; 4) trong Hệ (II) có dấu nghiêm ngặt x + y < 4',
        instruction: 'Trong Hệ (II): { x + y < 4; x ≥ 0; y ≥ 0 }, hai giao điểm (4; 0) và (0; 4) có thuộc miền nghiệm không?',
        inputType: 'choice',
        choices: [
          { id: 'st1', label: 'Không thuộc miền nghiệm vì nằm trên đường biên nét đứt x + y = 4', value: 'excluded' },
          {
            id: 'st2',
            label: 'Thuộc miền nghiệm vì nằm trên trục tọa độ x ≥ 0, y ≥ 0',
            value: 'included',
            errorCodeIfChosen: 'E02',
            feedbackIfChosen: 'Tại (4; 0) và (0; 4), tổng x + y = 4 không thỏa mãn bất phương trình nghiêm ngặt x + y < 4 nên bị loại.'
          }
        ],
        expectedValue: 'excluded'
      }
    ],
    canonicalAnswerSummary: 'Hệ (I) suy biến thành đoạn thẳng [(3;0), (0;3)]; Hệ (II) loại các giao điểm (4;0), (0;4) nằm trên biên nghiêm ngặt.',
    solutionExplanation: 'Ở Hệ (I), x + y ≤ 3 và x + y ≥ 3 tương đương x + y = 3; với x, y ≥ 0 miền nghiệm suy biến thành đoạn thẳng nối (3;0) và (0;3). Ở Hệ (II), biên x + y = 4 là nét đứt nên mọi điểm trên đoạn nối (4;0) và (0;4) đều không thuộc miền nghiệm.',
    hints: {
      tier1: 'Một số vừa ≤ 3 vừa ≥ 3 thì số đó phải bằng bao nhiêu?',
      tier2: 'x + y = 3 với x ≥ 0, y ≥ 0 chính là đoạn thẳng nối (3; 0) và (0; 3).',
      tier3: 'Với x + y < 4, tại (4; 0) ta có 4 < 4 (sai) nên giao điểm nằm trên biên nghiêm ngặt bị loại.'
    },
    commonErrorCodes: ['E02', 'E07'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Nhận diện đúng miền nghiệm suy biến thành đoạn thẳng', points: 5 },
        { stepIndex: 2, description: 'Loại đúng giao điểm nằm trên đường biên nghiêm ngặt', points: 5 }
      ]
    }
  },

  // ==========================================================================
  // CHỦ ĐỀ D: MÔ HÌNH HÓA VÀ TỐI ƯU HÓA TUYẾN TÍNH (10 BÀI: D01 -> D10)
  // ==========================================================================
  {
    id: 'D01',
    topic: 'D',
    level: 'nhan_biet',
    interactionType: 'multiple_choice',
    title: 'Chọn biến và xác định điều kiện thực tế của biến',
    learningObjective: 'Xác định đúng ý nghĩa, đơn vị và điều kiện không âm/nguyên của hai biến quyết định x, y.',
    questionText: 'Một xưởng mộc sản xuất bàn (x chiếc) và ghế (y chiếc) để bán. Để mô hình hóa bài toán tìm số lượng bàn và ghế cần sản xuất, điều kiện miền xác định tự nhiên của x và y là gì?',
    mathData: {
      scenario: REAL_WORLD_SCENARIOS[0]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Xác định điều kiện dấu của số lượng sản phẩm x, y',
        instruction: 'Số lượng sản phẩm sản xuất không thể là số âm, do đó hệ ràng buộc luôn phải có:',
        inputType: 'choice',
        choices: [
          { id: 'v1', label: 'x ≥ 0 và y ≥ 0', value: 'x>=0,y>=0' },
          {
            id: 'v2',
            label: 'x < 0 và y < 0',
            value: 'x<0,y<0',
            errorCodeIfChosen: 'E08',
            feedbackIfChosen: 'Số lượng sản phẩm trong thực tế không bao giờ nhận giá trị âm.'
          }
        ],
        expectedValue: 'x>=0,y>=0'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Phân biệt biến liên tục và biến nguyên',
        instruction: 'Vì bàn và ghế là các sản phẩm hoàn chỉnh không thể chia lẻ (như 2,67 chiếc ghế), khi kết luận phương án sản xuất thực tế ta cần thêm điều kiện gì?',
        inputType: 'choice',
        choices: [
          { id: 'int1', label: 'x ∈ ℕ, y ∈ ℕ (x, y là các số nguyên không âm)', value: 'integer' },
          {
            id: 'int2',
            label: 'Chấp nhận mọi số thập phân bất kỳ và tự làm tròn lên',
            value: 'round_up',
            errorCodeIfChosen: 'E10',
            feedbackIfChosen: 'Không được tự ý làm tròn lên vì có thể làm vượt quá giới hạn nguyên liệu/giờ máy!'
          }
        ],
        expectedValue: 'integer'
      }
    ],
    canonicalAnswerSummary: 'x ≥ 0, y ≥ 0 và x, y ∈ ℕ (khi sản phẩm không thể chia nhỏ).',
    solutionExplanation: 'Khi mô hình hóa bài toán sản xuất sản phẩm rời rạc (chiếc, cái, chuyến xe), ngoài điều kiện x ≥ 0, y ≥ 0 ta cần lưu ý điều kiện nguyên x, y ∈ ℕ.',
    hints: {
      tier1: 'Số lượng bàn ghế có thể âm hay lẻ thập phân được không?',
      tier2: 'Luôn có điều kiện không âm x ≥ 0, y ≥ 0.',
      tier3: 'Với sản phẩm rời rạc như chiếc bàn, chiếc ghế, cần xét x, y ∈ ℕ.'
    },
    commonErrorCodes: ['E08', 'E10'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Xác định đúng điều kiện không âm x ≥ 0, y ≥ 0', points: 5 },
        { stepIndex: 2, description: 'Nhận thức đúng điều kiện nguyên của sản phẩm rời rạc', points: 5 }
      ]
    }
  },
  {
    id: 'D02',
    topic: 'D',
    level: 'nhan_biet',
    interactionType: 'multiple_choice',
    title: 'Lập bất phương trình ràng buộc nguồn lực sản xuất',
    learningObjective: 'Chuyển dữ kiện định mức giờ máy và giờ công thành hệ bất phương trình tuyến tính chính xác.',
    questionText: 'Một cơ sở sản xuất hai loại sản phẩm A (x đơn vị) và B (y đơn vị). Mỗi đơn vị A cần 2 giờ máy, mỗi đơn vị B cần 1 giờ máy. Tổng số giờ máy sử dụng tối đa là 8 giờ. Bất phương trình ràng buộc giờ máy là:',
    mathData: {
      scenario: REAL_WORLD_SCENARIOS[0]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Biểu diễn tổng số giờ máy cần dùng theo x và y',
        instruction: 'Sản xuất x đơn vị A (2 giờ/đv) và y đơn vị B (1 giờ/đv) tốn tổng cộng bao nhiêu giờ máy?',
        inputType: 'choice',
        choices: [
          { id: 'm1', label: '2x + y (giờ máy)', value: '2x + y' },
          {
            id: 'm2',
            label: 'x + 2y (giờ máy)',
            value: 'x + 2y',
            errorCodeIfChosen: 'E08',
            feedbackIfChosen: 'Em ghép nhầm hệ số: sản phẩm A (biến x) cần 2 giờ máy chứ không phải 1 giờ máy.'
          }
        ],
        expectedValue: '2x + y'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Chọn dấu bất phương trình ứng với "tối đa 8 giờ máy"',
        instruction: 'Ràng buộc giờ máy đầy đủ là:',
        inputType: 'choice',
        choices: [
          { id: 'c1', label: '2x + y ≤ 8', value: '2x + y <= 8' },
          {
            id: 'c2',
            label: '2x + y ≥ 8',
            value: '2x + y >= 8',
            errorCodeIfChosen: 'E08',
            feedbackIfChosen: '"Tối đa 8 giờ" nghĩa là không vượt quá 8 giờ → phải dùng dấu ≤ 8.'
          }
        ],
        expectedValue: '2x + y <= 8'
      }
    ],
    canonicalAnswerSummary: '2x + y ≤ 8.',
    solutionExplanation: 'Mỗi đơn vị A cần 2 giờ máy nên x đơn vị A cần 2x giờ. Mỗi đơn vị B cần 1 giờ máy nên y đơn vị B cần y giờ. Tổng số giờ máy không quá 8 nên 2x + y ≤ 8.',
    hints: {
      tier1: 'x đơn vị sản phẩm A (mỗi đơn vị 2 giờ máy) cần bao nhiêu giờ máy?',
      tier2: 'Tổng giờ máy là 2x + 1y = 2x + y.',
      tier3: 'Do giới hạn tối đa 8 giờ máy nên 2x + y ≤ 8.'
    },
    commonErrorCodes: ['E08'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Lập đúng biểu thức tổng giờ máy 2x + y', points: 5 },
        { stepIndex: 2, description: 'Chọn đúng dấu ≤ 8 cho ràng buộc tối đa', points: 5 }
      ]
    }
  },
  {
    id: 'D03',
    topic: 'D',
    level: 'thong_hieu',
    interactionType: 'multiple_choice',
    title: 'Xác định hàm mục tiêu Lợi nhuận và Chi phí',
    learningObjective: 'Thiết lập đúng biểu thức hàm mục tiêu F(x; y) = ax + by và hướng tối ưu (MAX hoặc MIN).',
    questionText: 'Trong bài toán sản xuất sản phẩm A (x) và B (y), biết mỗi đơn vị A lãi 30 nghìn đồng, mỗi đơn vị B lãi 40 nghìn đồng. Cơ sở muốn thu được tổng lợi nhuận cao nhất. Hàm mục tiêu của bài toán là:',
    mathData: {
      scenario: REAL_WORLD_SCENARIOS[0],
      objective: REAL_WORLD_SCENARIOS[0].objective
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Chọn biểu thức hàm mục tiêu P(x; y) và hướng tối ưu',
        instruction: 'Chọn mô hình hàm mục tiêu đúng:',
        inputType: 'choice',
        choices: [
          { id: 'o1', label: 'P(x; y) = 30x + 40y → MAX (Tìm giá trị lớn nhất)', value: '30x+40y_max' },
          {
            id: 'o2',
            label: 'P(x; y) = 40x + 30y → MAX',
            value: '40x+30y_max',
            errorCodeIfChosen: 'E09',
            feedbackIfChosen: 'Em đã đổi ngược hệ số lợi nhuận của A (30 nghìn) và B (40 nghìn).'
          },
          {
            id: 'o3',
            label: 'P(x; y) = 30x + 40y → MIN',
            value: '30x+40y_min',
            errorCodeIfChosen: 'E09',
            feedbackIfChosen: 'Mục tiêu là lợi nhuận CAO NHẤT nên phải tìm MAX chứ không phải MIN.'
          }
        ],
        expectedValue: '30x+40y_max'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Tính lợi nhuận tại phương án A(4; 0)',
        instruction: 'Nếu chỉ sản xuất 4 đơn vị A và 0 đơn vị B, lợi nhuận P(4; 0) bằng bao nhiêu (nghìn đồng)?',
        inputType: 'number',
        expectedValue: 120,
        tolerance: 0.01
      }
    ],
    canonicalAnswerSummary: 'P(x; y) = 30x + 40y → MAX; tại A(4; 0) thì P = 120 nghìn đồng.',
    solutionExplanation: 'Lợi nhuận từ x sản phẩm A là 30x, từ y sản phẩm B là 40y. Tổng lợi nhuận P(x; y) = 30x + 40y → MAX. Tại (4; 0), P = 30·4 + 40·0 = 120.',
    hints: {
      tier1: 'Mỗi đơn vị A lãi 30 nghìn, vậy x đơn vị A lãi bao nhiêu?',
      tier2: 'Tổng lãi P = 30x + 40y, cần tối đa hóa (→ MAX).',
      tier3: 'Tại A(4; 0): P(4; 0) = 30(4) + 40(0) = 120.'
    },
    commonErrorCodes: ['E09', 'E01'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Xác định đúng hàm mục tiêu P = 30x + 40y → MAX', points: 5 },
        { stepIndex: 2, description: 'Tính đúng P(4; 0) = 120', points: 5 }
      ]
    }
  },
  {
    id: 'D04',
    topic: 'D',
    level: 'thong_hieu',
    interactionType: 'enter_objective_value',
    title: 'Tính giá trị hàm mục tiêu tại các đỉnh của miền khả thi',
    learningObjective: 'Tính chính xác giá trị hàm mục tiêu tại các đỉnh cực biên (bao gồm cả đỉnh có tọa độ phân số).',
    questionText: 'Cho bài toán quy hoạch tuyến tính liên tục với miền khả thi có 4 đỉnh: O(0; 0), A(4; 0), B(8/3; 8/3), C(0; 4) và hàm mục tiêu P(x; y) = 30x + 40y. Hãy tính giá trị P tại đỉnh C(0; 4) và đỉnh B(8/3; 8/3).',
    mathData: {
      scenario: REAL_WORLD_SCENARIOS[0],
      evaluationVertex: { label: 'B', point: { x: 8 / 3, y: 8 / 3 } }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Tính P tại đỉnh C(0; 4)',
        instruction: 'Nhập giá trị P(0; 4) = 30(0) + 40(4):',
        inputType: 'number',
        expectedValue: 160,
        tolerance: 0.01
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Tính P tại đỉnh B(8/3; 8/3) (chấp nhận phân số 560/3 hoặc số thập phân 186.67)',
        instruction: 'Thay x = 8/3, y = 8/3 vào P = 30x + 40y. Nhập giá trị P(8/3; 8/3) (gợi ý: nhập 560/3):',
        inputType: 'number',
        expectedValue: 560 / 3,
        tolerance: 0.1
      }
    ],
    canonicalAnswerSummary: 'P(0; 4) = 160; P(8/3; 8/3) = 560/3 ≈ 186.67.',
    solutionExplanation: 'Tại C(0; 4): P = 30·0 + 40·4 = 160. Tại B(8/3; 8/3): P = 30·(8/3) + 40·(8/3) = 70·(8/3) = 560/3 ≈ 186.67 > 160.',
    hints: {
      tier1: 'Tại B(8/3; 8/3), em hãy đặt nhân tử chung (8/3) ra ngoài: (30 + 40)·(8/3).',
      tier2: '70 · (8/3) = 560/3 (xấp xỉ 186.67).',
      tier3: 'Bước 1 nhập 160; Bước 2 nhập 560/3 (hoặc 186.67).'
    },
    commonErrorCodes: ['E01', 'E10'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Tính đúng P(0; 4) = 160', points: 4 },
        { stepIndex: 2, description: 'Tính đúng P(8/3; 8/3) = 560/3 ≈ 186.67', points: 6 }
      ]
    }
  },
  {
    id: 'D05',
    topic: 'D',
    level: 'van_dung',
    interactionType: 'find_optimal_solution',
    title: 'Tìm cực trị liên tục của bài toán sản xuất chuẩn',
    learningObjective: 'So sánh giá trị hàm mục tiêu tại tất cả 4 đỉnh để xác định đúng phương án tối ưu liên tục.',
    questionText: 'Xét bài toán tối ưu liên tục (x, y ∈ ℝ≥0 — ví dụ x, y là số tấn hoặc số mét vải có thể chia lẻ):\nHệ ràng buộc: { 2x + y ≤ 8; x + 2y ≤ 8; x ≥ 0; y ≥ 0 }, hàm mục tiêu P(x; y) = 30x + 40y → MAX.\nHãy xác định đỉnh đạt lợi nhuận tối đa và giá trị P_max.',
    mathData: {
      scenario: REAL_WORLD_SCENARIOS[0]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Chọn đỉnh đạt giá trị lớn nhất của P(x; y) trên miền tứ giác OABC',
        instruction: 'Với P(O) = 0, P(A) = 120, P(B) = 560/3 ≈ 186.67, P(C) = 160, đỉnh tối ưu liên tục là:',
        inputType: 'choice',
        choices: [
          { id: 'optB', label: 'Đỉnh B(8/3; 8/3) với P_max = 560/3 ≈ 186.67 nghìn đồng', value: 'B' },
          {
            id: 'optC',
            label: 'Đỉnh C(0; 4) với P_max = 160 nghìn đồng',
            value: 'C',
            errorCodeIfChosen: 'E10',
            feedbackIfChosen: 'Sai lầm nghiêm trọng! Nếu chỉ xét 3 đỉnh trên trục tọa độ mà bỏ sót đỉnh giao B(8/3; 8/3) thì sẽ kết luận nhầm P_max = 160 tại (0; 4).'
          },
          {
            id: 'optA',
            label: 'Đỉnh A(4; 0) với P_max = 120 nghìn đồng',
            value: 'A',
            errorCodeIfChosen: 'E10',
            feedbackIfChosen: '120 nhỏ hơn 160 và 560/3 nên A(4; 0) không phải đỉnh tối ưu.'
          }
        ],
        expectedValue: 'B'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Nhập tọa độ đỉnh tối ưu liên tục B(x; y)',
        instruction: 'Nhập tọa độ chính xác của đỉnh tối ưu B (nhập 8/3 cho x và 8/3 cho y):',
        inputType: 'coordinate',
        expectedPoint: { x: 8 / 3, y: 8 / 3 },
        tolerance: 0.02
      }
    ],
    canonicalAnswerSummary: 'Trong mô hình liên tục, P_max = 560/3 ≈ 186.67 tại đỉnh B(8/3; 8/3).',
    solutionExplanation: 'Miền khả thi là tứ giác OABC có 4 đỉnh: O(0;0) → P=0; A(4;0) → P=120; B(8/3; 8/3) → P=560/3 ≈ 186.67; C(0;4) → P=160. Vậy GTLN đạt tại B(8/3; 8/3).',
    hints: {
      tier1: 'Trong 4 giá trị 0, 120, 560/3 (≈ 186.67) và 160, số nào lớn nhất?',
      tier2: '560/3 ≈ 186.67 > 160 nên đỉnh tối ưu liên tục là B(8/3; 8/3) chứ không phải C(0; 4).',
      tier3: 'Chọn đỉnh B(8/3; 8/3) và nhập tọa độ x = 8/3, y = 8/3.'
    },
    commonErrorCodes: ['E10', 'E06'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Chọn đúng đỉnh B(8/3; 8/3) đạt P_max = 560/3', points: 5 },
        { stepIndex: 2, description: 'Nhập đúng tọa độ hữu tỉ (8/3; 8/3)', points: 5 }
      ]
    }
  },
  {
    id: 'D06',
    topic: 'D',
    level: 'van_dung',
    interactionType: 'find_optimal_solution',
    title: 'Bài toán tối ưu chi phí dinh dưỡng (Tìm GTNN - MIN)',
    learningObjective: 'Giải bài toán quy hoạch tuyến tính tìm giá trị nhỏ nhất (MIN) của hàm chi phí trên miền khả thi.',
    questionText: 'Một khẩu phần ăn cần phối trộn x (đơn vị thực phẩm X, giá 40 nghìn/đv) và y (đơn vị thực phẩm Y, giá 30 nghìn/đv) thỏa mãn hệ ràng buộc dinh dưỡng:\n{ 2x + y ≥ 6; x + 2y ≥ 6; x + y ≤ 5; x ≥ 0; y ≥ 0 }.\nHãy tìm phương án (x; y) để tổng chi phí F(x; y) = 40x + 30y đạt GIÁ TRỊ NHỎ NHẤT (MIN).',
    mathData: {
      scenario: REAL_WORLD_SCENARIOS[2]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Tính chi phí tại đỉnh giao của 2x + y = 6 và x + 2y = 6',
        instruction: 'Giao điểm của 2x + y = 6 và x + 2y = 6 là đỉnh (2; 2). Tại (2; 2), chi phí F(2; 2) = 40(2) + 30(2) bằng bao nhiêu (nghìn đồng)?',
        inputType: 'number',
        expectedValue: 140,
        tolerance: 0.01
      },
      {
        stepIndex: 2,
        title: 'Bước 2: So sánh các đỉnh và chọn phương án có chi phí NHỎ NHẤT',
        instruction: 'Biết các đỉnh của miền khả thi là D₁(2; 2) → F = 140; D₂(4; 1) → F = 190; D₃(1; 4) → F = 160. Phương án tối ưu chi phí thấp nhất là:',
        inputType: 'choice',
        choices: [
          { id: 'min1', label: 'Phương án (2; 2) với chi phí nhỏ nhất F_min = 140 nghìn đồng', value: '(2;2)' },
          {
            id: 'min2',
            label: 'Phương án (4; 1) với F = 190 nghìn đồng',
            value: '(4;1)',
            errorCodeIfChosen: 'E10',
            feedbackIfChosen: 'Bài toán yêu cầu tìm CHI PHÍ THẤP NHẤT (MIN), còn 190 là chi phí lớn nhất!'
          }
        ],
        expectedValue: '(2;2)'
      }
    ],
    canonicalAnswerSummary: 'Chi phí nhỏ nhất F_min = 140 nghìn đồng tại (2; 2).',
    solutionExplanation: 'Miền khả thi là tam giác có 3 đỉnh: (2; 2) → F = 140; (4; 1) → F = 190; (1; 4) → F = 160. Vì mục tiêu là MIN nên phương án tối ưu là (2; 2) với F_min = 140 nghìn đồng.',
    hints: {
      tier1: 'Tại điểm (2; 2), hãy tính 40·2 + 30·2.',
      tier2: '40·2 + 30·2 = 80 + 60 = 140. So sánh 140, 190 và 160.',
      tier3: 'Vì bài toán tìm chi phí nhỏ nhất (MIN) nên chọn (2; 2) với F_min = 140.'
    },
    commonErrorCodes: ['E10', 'E09'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Tính đúng F(2; 2) = 140', points: 5 },
        { stepIndex: 2, description: 'Chọn đúng cực tiểu F_min = 140 tại (2; 2)', points: 5 }
      ]
    }
  },
  {
    id: 'D07',
    topic: 'D',
    level: 'van_dung',
    interactionType: 'enter_objective_value',
    title: 'Bài toán phân bổ thời gian ôn tập (Tối đa hóa điểm số)',
    learningObjective: 'Giải bài toán phân bổ nguồn lực thời gian để đạt tổng điểm ôn tập cao nhất.',
    questionText: 'Một học sinh dành x giờ tự học Toán và y giờ tự học Tiếng Anh trong tuần thỏa mãn: { x + y ≤ 10; x ≥ 3; y ≥ 2; x - 2y ≤ 2 }.\nCác đỉnh của miền khả thi là A(3; 2), B(6; 2), C(14/3; 8/3), D(3; 7).\nVới hàm hiệu quả S(x; y) = 4x + 3y → MAX, hãy tìm giá trị lớn nhất S_max.',
    mathData: {
      scenario: REAL_WORLD_SCENARIOS[1]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Tính S(x; y) = 4x + 3y tại đỉnh D(3; 7)',
        instruction: 'Tại đỉnh D(3; 7), giá trị S(3; 7) = 4(3) + 3(7) bằng bao nhiêu?',
        inputType: 'number',
        expectedValue: 33,
        tolerance: 0.01
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Tính S(x; y) tại đỉnh E(8; 2) nếu thay ràng buộc x - 2y ≤ 2 bằng y ≥ 2, x + y ≤ 10',
        instruction: 'Trong hệ trên, các đỉnh có giá trị: S(3; 2) = 18; S(6; 2) = 30; S(3; 7) = 33; còn tại giao của x + y = 10 và x - 2y = 2 là đỉnh (22/3; 8/3) có S = 4(22/3) + 3(8/3) = 112/3 ≈ 37.33. Hãy nhập giá trị 112/3:',
        inputType: 'number',
        expectedValue: 112 / 3,
        tolerance: 0.1
      }
    ],
    canonicalAnswerSummary: 'Tại D(3; 7) có S = 33; tại đỉnh giao (22/3; 8/3) có S_max = 112/3 ≈ 37.33.',
    solutionExplanation: 'Giao của x + y = 10 và x - 2y = 2 là 3y = 8 ⇒ y = 8/3, x = 22/3. Tại (22/3; 8/3): S = 4(22/3) + 3(8/3) = 112/3 ≈ 37.33 > 33.',
    hints: {
      tier1: 'Tại D(3; 7), tính 4·3 + 3·7.',
      tier2: '4·3 + 3·7 = 12 + 21 = 33.',
      tier3: 'Tại đỉnh (22/3; 8/3), S = 88/3 + 24/3 = 112/3 (nhập 112/3).'
    },
    commonErrorCodes: ['E10', 'E06'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Tính đúng S(3; 7) = 33', points: 5 },
        { stepIndex: 2, description: 'Tính đúng S(22/3; 8/3) = 112/3', points: 5 }
      ]
    }
  },
  {
    id: 'D08',
    topic: 'D',
    level: 'van_dung_cao',
    interactionType: 'find_optimal_solution',
    title: 'Phân biệt nghiệm tối ưu Liên tục và phương án tối ưu Nguyên',
    learningObjective: 'Hiểu sâu sắc vì sao không được làm tròn cơ học nghiệm liên tục (8/3; 8/3) và cách tìm phương án nguyên tối ưu (2; 3).',
    questionText: 'Quay lại bài toán sản xuất chuẩn:\nHệ ràng buộc: { 2x + y ≤ 8; x + 2y ≤ 8; x ≥ 0; y ≥ 0 }, hàm lợi nhuận P = 30x + 40y → MAX.\nNghiệm tối ưu liên tục là B(8/3; 8/3) ≈ (2.67; 2.67) với P = 560/3 ≈ 186.67.\nNếu sản phẩm A, B là các máy móc nguyên chiếc (x, y ∈ ℕ), phương án sản xuất nguyên tối ưu là gì?',
    mathData: {
      scenario: REAL_WORLD_SCENARIOS[0]
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Kiểm tra vì sao làm tròn (2.67; 2.67) thành (3; 3) hoặc (2; 2) đều sai hoặc chưa tối ưu',
        instruction: 'Chọn nhận xét đúng khi xét các điểm nguyên lân cận đỉnh B(8/3; 8/3):',
        inputType: 'choice',
        choices: [
          {
            id: 'i1',
            label: 'Điểm (3; 3) vi phạm cả 2 ràng buộc (2·3+3 = 9 > 8); điểm (2; 2) hợp lệ (P = 140) nhưng chưa phải lớn nhất; điểm (2; 3) hợp lệ và cho P = 180 lớn nhất',
            value: 'correct_analysis'
          },
          {
            id: 'i2',
            label: 'Làm tròn (2.67; 2.67) thành (3; 3) được P_max = 210',
            value: 'round_3_3',
            errorCodeIfChosen: 'E10',
            feedbackIfChosen: 'Tại (3; 3), số giờ máy cần là 2(3) + 3 = 9 > 8 (vượt quá nguồn lực cho phép) nên (3; 3) nằm NGOÀI miền khả thi!'
          },
          {
            id: 'i3',
            label: 'Làm tròn xuống (2; 2) được P_max = 140 là phương án nguyên tốt nhất',
            value: 'round_2_2',
            errorCodeIfChosen: 'E10',
            feedbackIfChosen: 'Tại (2; 2) mới dùng 6 giờ máy và 6 giờ công, vẫn còn dư nguồn lực. Thử (2; 3) hoặc (0; 4) đều cho lợi nhuận cao hơn!'
          }
        ],
        expectedValue: 'correct_analysis'
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Nhập tọa độ phương án sản xuất nguyên tối ưu (x; y)',
        instruction: 'Trong tất cả các điểm nguyên thuộc miền khả thi (như (0;4) → P=160, (3;2) → P=170, (2;3) → P=180), hãy nhập tọa độ điểm nguyên đạt lợi nhuận tối đa P_max = 180:',
        inputType: 'coordinate',
        expectedPoint: { x: 2, y: 3 },
        tolerance: 0.01
      }
    ],
    canonicalAnswerSummary: 'Phương án nguyên tối ưu là (2; 3) (2 sản phẩm A, 3 sản phẩm B) với lợi nhuận tối đa P_max = 180 nghìn đồng.',
    solutionExplanation: 'Kiểm tra điểm nguyên (2; 3): 2(2) + 3 = 7 ≤ 8 (thỏa mãn); 2 + 2(3) = 8 ≤ 8 (thỏa mãn). Lợi nhuận P(2; 3) = 30(2) + 40(3) = 180 nghìn đồng (lớn hơn P(3; 2) = 170 và P(0; 4) = 160).',
    hints: {
      tier1: 'Thay (2; 3) vào hai ràng buộc 2x + y ≤ 8 và x + 2y ≤ 8 xem có thỏa mãn không?',
      tier2: 'Tại (2; 3): 2(2)+3 = 7 ≤ 8 và 2+2(3) = 8 ≤ 8 (hợp lệ). Lợi nhuận P(2; 3) = 30·2 + 40·3 = 180.',
      tier3: 'Chọn phân tích đúng ở Bước 1 và nhập tọa độ (2; 3) ở Bước 2.'
    },
    commonErrorCodes: ['E10', 'E07'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Giải thích đúng vì sao không được làm tròn cơ học nghiệm liên tục', points: 5 },
        { stepIndex: 2, description: 'Xác định đúng nghiệm nguyên tối ưu (2; 3) với P_max = 180', points: 5 }
      ]
    }
  },
  {
    id: 'D09',
    topic: 'D',
    level: 'van_dung_cao',
    interactionType: 'find_optimal_solution',
    title: 'Nhận diện bài toán có Vô số phương án tối ưu trên cạnh biên',
    learningObjective: 'Phát hiện trường hợp đường mức hàm mục tiêu song song với một cạnh biên tối ưu dẫn đến hai đỉnh liên tiếp có cùng giá trị cực trị.',
    questionText: 'Cho hệ ràng buộc: { 2x + y ≤ 8; x + 2y ≤ 8; x ≥ 0; y ≥ 0 } nhưng hàm mục tiêu đổi thành P(x; y) = 20x + 40y → MAX.\nHãy tính P tại B(8/3; 8/3) và C(0; 4) rồi rút ra kết luận.',
    mathData: {
      system: REAL_WORLD_SCENARIOS[0].system,
      objective: {
        cx: 20,
        cy: 40,
        label: 'P(x; y) = 20x + 40y',
        name: 'Lợi nhuận',
        unit: 'nghìn đồng',
        goal: 'max'
      }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Tính giá trị P = 20x + 40y tại cả hai đỉnh B(8/3; 8/3) và C(0; 4)',
        instruction: 'Tại C(0; 4) có P = 20(0) + 40(4) = 160. Tại B(8/3; 8/3) có P = 20(8/3) + 40(8/3) = 60·(8/3) bằng bao nhiêu?',
        inputType: 'number',
        expectedValue: 160,
        tolerance: 0.01
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Kết luận về tập hợp các phương án tối ưu liên tục',
        instruction: 'Vì đường mức 20x + 40y = 160 trùng phương với đường biên x + 2y = 8 nên cả hai đỉnh B(8/3; 8/3) và C(0; 4) đều đạt P_max = 160. Kết luận đúng là:',
        inputType: 'choice',
        choices: [
          {
            id: 'alt1',
            label: 'Mọi điểm (x; y) nằm trên đoạn thẳng biên nối B(8/3; 8/3) và C(0; 4) đều là nghiệm tối ưu đạt P_max = 160',
            value: 'segment_BC'
          },
          {
            id: 'alt2',
            label: 'Bài toán không có nghiệm tối ưu vì không biết chọn B hay C',
            value: 'no_opt',
            errorCodeIfChosen: 'E10',
            feedbackIfChosen: 'Khi hai đỉnh kề nhau cùng đạt GTLN, bài toán vẫn có GTLN bằng 160 và đạt tại vô số điểm trên đoạn thẳng nối hai đỉnh đó!'
          }
        ],
        expectedValue: 'segment_BC'
      }
    ],
    canonicalAnswerSummary: 'P_max = 160 đạt được tại mọi điểm thuộc đoạn thẳng nối hai đỉnh B(8/3; 8/3) và C(0; 4).',
    solutionExplanation: 'Do véc-tơ pháp tuyến của hàm mục tiêu (20; 40) cùng hướng với véc-tơ pháp tuyến của ràng buộc x + 2y ≤ 8 (tỉ lệ 20/1 = 40/2 = 20), đường mức P = 160 tiếp xúc với toàn bộ cạnh BC.',
    hints: {
      tier1: 'Tính 20·(8/3) + 40·(8/3) = (20 + 40)·(8/3) xem bằng bao nhiêu?',
      tier2: '60 · (8/3) = 160, bằng đúng giá trị P(0; 4) = 160.',
      tier3: 'Khi hai đỉnh kề nhau B và C cùng đạt P_max = 160, mọi điểm trên đoạn thẳng BC đều đạt P_max = 160.'
    },
    commonErrorCodes: ['E10', 'E09'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Tính đúng P(B) = P(C) = 160', points: 5 },
        { stepIndex: 2, description: 'Kết luận đúng tập nghiệm tối ưu là cả đoạn thẳng biên BC', points: 5 }
      ]
    }
  },
  {
    id: 'D10',
    topic: 'D',
    level: 'van_dung_cao',
    interactionType: 'find_optimal_solution',
    title: 'Sự tồn tại cực trị trên miền khả thi KHÔNG BỊ CHẶN',
    learningObjective: 'Phân biệt trường hợp miền không bị chặn vẫn đạt GTNN hữu hạn và trường hợp không tồn tại GTLN hữu hạn.',
    questionText: 'Cho miền khả thi không bị chặn xác định bởi hệ: { x + y ≥ 4; x ≥ 0; y ≥ 0 } và hàm mục tiêu F(x; y) = 2x + 3y.\nHãy khảo sát giá trị nhỏ nhất (F_min) và giá trị lớn nhất (F_max) của F(x; y) trên miền này.',
    mathData: {
      system: [
        { id: 'd10_1', a: 1, b: 1, op: '>=', c: 4, color: '#2563EB', label: 'x+y>=4' },
        { id: 'd10_2', a: 1, b: 0, op: '>=', c: 0, color: '#059669', label: 'x>=0' },
        { id: 'd10_3', a: 0, b: 1, op: '>=', c: 0, color: '#D97706', label: 'y>=0' }
      ],
      objective: {
        cx: 2,
        cy: 3,
        label: 'F(x; y) = 2x + 3y',
        name: 'Hàm mục tiêu',
        unit: 'đơn vị',
        goal: 'min'
      }
    },
    steps: [
      {
        stepIndex: 1,
        title: 'Bước 1: Tìm giá trị nhỏ nhất F_min của F(x; y) = 2x + 3y',
        instruction: 'Miền khả thi có hai đỉnh biên A(4; 0) (F = 8) và B(0; 4) (F = 12). Vì x ≥ 0, y ≥ 0 và x + y ≥ 4 nên 2x + 3y ≥ 2(x + y) ≥ 8. Vậy F_min bằng bao nhiêu?',
        inputType: 'number',
        expectedValue: 8,
        tolerance: 0.01
      },
      {
        stepIndex: 2,
        title: 'Bước 2: Kết luận về bài toán tìm Giá trị lớn nhất (F_max)',
        instruction: 'Khi cho x → +∞ và y → +∞ trong miền khả thi, giá trị F(x; y) = 2x + 3y thay đổi như thế nào?',
        inputType: 'choice',
        choices: [
          {
            id: 'ub1',
            label: 'F(x; y) tiến tới +∞ nên bài toán KHÔNG TỒN TẠI giá trị lớn nhất hữu hạn',
            value: 'no_max'
          },
          {
            id: 'ub2',
            label: 'F_max = 12 tại đỉnh B(0; 4)',
            value: 'max_12',
            errorCodeIfChosen: 'E10',
            feedbackIfChosen: 'Sai lầm! Đỉnh B(0; 4) có F = 12, nhưng điểm (10; 10) cũng thuộc miền khả thi và có F = 50 > 12. Vì miền không bị chặn phía trên nên không có F_max hữu hạn.'
          }
        ],
        expectedValue: 'no_max'
      }
    ],
    canonicalAnswerSummary: 'Đạt GTNN hữu hạn F_min = 8 tại A(4; 0), nhưng KHÔNG tồn tại GTLN hữu hạn (F → +∞ khi x, y → +∞).',
    solutionExplanation: 'Trên miền không bị chặn {x + y ≥ 4; x, y ≥ 0}, F = 2x + 3y = 2(x + y) + y ≥ 2·4 + 0 = 8 (đạt F_min = 8 tại A(4; 0)). Ngược lại, khi x → +∞ thì F → +∞ nên không tồn tại F_max.',
    hints: {
      tier1: 'Tại hai đỉnh A(4; 0) và B(0; 4), giá trị F = 2x + 3y lần lượt là 8 và 12. Có điểm nào trong miền cho F < 8 không?',
      tier2: 'Vì 2x + 3y ≥ 2x + 2y = 2(x + y) ≥ 8 nên F_min = 8 tại A(4; 0).',
      tier3: 'Nếu lấy (100; 100) thuộc miền khả thi thì F = 500. Khi x, y → +∞ thì F → +∞ nên không có F_max hữu hạn.'
    },
    commonErrorCodes: ['E10', 'E07'],
    rubric: {
      maxPoints: 10,
      criteria: [
        { stepIndex: 1, description: 'Tìm đúng GTNN hữu hạn F_min = 8 tại A(4; 0)', points: 5 },
        { stepIndex: 2, description: 'Kết luận đúng không tồn tại GTLN hữu hạn trên miền không bị chặn', points: 5 }
      ]
    }
  }
];
