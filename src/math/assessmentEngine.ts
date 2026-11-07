import {
  AssessmentExercise,
  AssessmentTopicId,
  CognitiveLevel,
  ErrorCodeId,
  ExerciseAttemptRecord,
  ExerciseStepPrompt,
  PersonalizedRecommendation,
  StudentBadge
} from '../types/assessment';
import { Point2D } from '../types/math';
import { checkPointInequality } from './mathEngine';
import {
  checkPointAgainstSystem,
  formatCoord,
  formatPointCoord,
  parseCoordinateInput
} from './systemMathEngine';
import {
  ASSESSMENT_EXERCISE_BANK,
  ERROR_CODE_CATALOG,
  LEVEL_METADATA,
  TOPIC_METADATA
} from '../data/assessmentBank';

export interface StepVerificationResult {
  isCorrect: boolean;
  detectedErrorCodes: ErrorCodeId[];
  feedbackTitle: string;
  socraticMessage: string;
  detailedExplanation?: string;
}

/**
 * Evaluates a single step of an exercise using the shared Math Engine
 * and identifies specific error codes (E01..E10) when incorrect.
 */
export function verifyExerciseStep(
  exercise: AssessmentExercise,
  step: ExerciseStepPrompt,
  inputPayload: {
    choiceValue?: string;
    numberText?: string;
    coordXText?: string;
    coordYText?: string;
    canvasPointM?: Point2D;
    canvasPointA?: Point2D;
    canvasPointB?: Point2D;
    canvasHalfPlaneSide?: 'with_test' | 'without_test' | null;
  }
): StepVerificationResult {
  const tol = step.tolerance ?? 0.02;

  // 1. Multiple Choice Step
  if (step.inputType === 'choice') {
    const chosenVal = inputPayload.choiceValue;
    if (!chosenVal) {
      return {
        isCorrect: false,
        detectedErrorCodes: [],
        feedbackTitle: 'Chưa chọn phương án',
        socraticMessage: 'Em hãy chọn một phương án trả lời trước khi bấm Kiểm chứng nhé!'
      };
    }

    const isRight = chosenVal === String(step.expectedValue);
    if (isRight) {
      return {
        isCorrect: true,
        detectedErrorCodes: [],
        feedbackTitle: 'Chính xác!',
        socraticMessage: 'Tuyệt vời! Lập luận của em hoàn toàn khớp với bản chất Toán học của bước này.'
      };
    }

    const chosenOption = step.choices?.find(c => c.value === chosenVal);
    const errCode: ErrorCodeId =
      chosenOption?.errorCodeIfChosen || exercise.commonErrorCodes[0] || 'E01';
    const errDef = ERROR_CODE_CATALOG[errCode];

    return {
      isCorrect: false,
      detectedErrorCodes: [errCode],
      feedbackTitle: `Phát hiện lỗi ${errCode}: ${errDef.title}`,
      socraticMessage:
        chosenOption?.feedbackIfChosen || errDef.socraticQuestion
    };
  }

  // 2. Numeric Input Step (supports fractions like 560/3 or decimals)
  if (step.inputType === 'number') {
    const parsed = parseCoordinateInput(inputPayload.numberText || '');
    if (parsed === null) {
      return {
        isCorrect: false,
        detectedErrorCodes: [],
        feedbackTitle: 'Chưa nhập giá trị hợp lệ',
        socraticMessage: 'Em hãy nhập một số hoặc phân số (ví dụ: 7, 4.5, hoặc 560/3) vào ô trống.'
      };
    }

    const expected = Number(step.expectedValue ?? 0);
    const diff = Math.abs(parsed - expected);
    if (diff <= tol) {
      return {
        isCorrect: true,
        detectedErrorCodes: [],
        feedbackTitle: 'Tính toán chính xác!',
        socraticMessage: `Chính xác! Giá trị bằng ${formatCoord(expected)}.`
      };
    }

    // Diagnose specific error code
    let errCode: ErrorCodeId = exercise.commonErrorCodes[0] || 'E01';
    if (exercise.topic === 'D') {
      // Check if student entered 160 instead of 560/3
      if (Math.abs(expected - 560 / 3) < 0.1 && Math.abs(parsed - 160) < 0.5) {
        errCode = 'E10';
      } else if (Math.abs(parsed + expected) < tol) {
        errCode = 'E01';
      }
    }
    const errDef = ERROR_CODE_CATALOG[errCode];
    return {
      isCorrect: false,
      detectedErrorCodes: [errCode],
      feedbackTitle: `Chưa chính xác (${errCode}: ${errDef.title})`,
      socraticMessage: `Giá trị ${formatCoord(parsed)} chưa đúng. ${errDef.socraticQuestion}`
    };
  }

  // 3. Coordinate (x; y) Input Step
  if (step.inputType === 'coordinate' && step.expectedPoint) {
    const px = parseCoordinateInput(inputPayload.coordXText || '');
    const py = parseCoordinateInput(inputPayload.coordYText || '');
    if (px === null || py === null) {
      return {
        isCorrect: false,
        detectedErrorCodes: [],
        feedbackTitle: 'Chưa nhập đủ tọa độ (x; y)',
        socraticMessage: 'Em hãy nhập đầy đủ hoành độ x và tung độ y (có thể nhập phân số như 8/3).'
      };
    }

    const exp = step.expectedPoint;
    const dx = Math.abs(px - exp.x);
    const dy = Math.abs(py - exp.y);
    if (dx <= tol && dy <= tol) {
      return {
        isCorrect: true,
        detectedErrorCodes: [],
        feedbackTitle: 'Tọa độ chính xác!',
        socraticMessage: `Đúng rồi! Tọa độ điểm là ${formatPointCoord(exp)}.`
      };
    }

    // Check if student swapped x and y
    const swapped = Math.abs(px - exp.y) <= tol && Math.abs(py - exp.x) <= tol && Math.abs(exp.x - exp.y) > tol;
    // Check if student rounded 8/3 to 3;3 in integer problem
    const roundedInfeasible =
      exercise.id === 'D08' && Math.abs(px - 3) < 0.1 && Math.abs(py - 3) < 0.1;

    let errCode: ErrorCodeId = exercise.commonErrorCodes[0] || 'E06';
    let customMsg = ERROR_CODE_CATALOG[errCode].socraticQuestion;

    if (swapped) {
      errCode = exercise.topic === 'B' ? 'E03' : 'E01';
      customMsg = `Em vừa nhập (${formatCoord(px)}; ${formatCoord(py)}) — hình như em đã đảo ngược hoành độ x và tung độ y! Hãy kiểm tra lại thứ tự (x; y).`;
    } else if (roundedInfeasible) {
      errCode = 'E10';
      customMsg = 'Điểm (3; 3) làm 2x + y = 9 > 8 (vượt quá giờ máy)! Em hãy kiểm tra điểm nguyên (2; 3) xem có thỏa mãn hệ không.';
    } else if (exercise.topic === 'B') {
      errCode = 'E03';
    } else if (exercise.topic === 'C') {
      errCode = 'E06';
    }

    return {
      isCorrect: false,
      detectedErrorCodes: [errCode],
      feedbackTitle: `Tọa độ chưa đúng (${errCode}: ${ERROR_CODE_CATALOG[errCode].title})`,
      socraticMessage: customMsg
    };
  }

  // 4. Canvas Drag Point to Feasible Region
  if (step.inputType === 'canvas_drag_point') {
    const pt = inputPayload.canvasPointM || { x: 0, y: 0 };
    if (exercise.mathData.inequality) {
      const ineq = exercise.mathData.inequality;
      const evalRes = checkPointInequality(ineq, pt);
      if (evalRes.relation === 'on_boundary') {
        return {
          isCorrect: false,
          detectedErrorCodes: ['E04'],
          feedbackTitle: 'Điểm M đang nằm ngay trên đường biên (E04)',
          socraticMessage: ERROR_CODE_CATALOG.E04.socraticQuestion
        };
      }
      if (evalRes.satisfies) {
        return {
          isCorrect: true,
          detectedErrorCodes: [],
          feedbackTitle: 'Điểm M đã nằm trong miền nghiệm!',
          socraticMessage: `Chính xác! Tại M${formatPointCoord(pt)}, vế trái bằng ${formatCoord(evalRes.lhsValue)} hoàn toàn thỏa mãn bất phương trình.`
        };
      }
      return {
        isCorrect: false,
        detectedErrorCodes: ['E05'],
        feedbackTitle: 'Điểm M nằm ngoài miền nghiệm (E05)',
        socraticMessage: `Tại M${formatPointCoord(pt)}, giá trị vế trái là ${formatCoord(evalRes.lhsValue)} chưa thỏa mãn ${ineq.op} ${ineq.c}. Em hãy kéo M sang nửa mặt phẳng đối diện!`
      };
    }

    if (exercise.mathData.system) {
      const check = checkPointAgainstSystem(exercise.mathData.system, pt);
      if (check.satisfiesSystem) {
        return {
          isCorrect: true,
          detectedErrorCodes: [],
          feedbackTitle: 'Điểm M thỏa mãn toàn bộ hệ BPT!',
          socraticMessage: `Tuyệt vời! Điểm M${formatPointCoord(pt)} thỏa mãn đồng thời tất cả ${exercise.mathData.system.length} bất phương trình trong hệ.`
        };
      }
      const violatedLabels = check.failedIndices
        .map((idx: number) => exercise.mathData.system?.[idx]?.label || `BPT (${idx + 1})`)
        .join(', ');
      return {
        isCorrect: false,
        detectedErrorCodes: ['E07'],
        feedbackTitle: 'Điểm M chưa thỏa mãn toàn bộ hệ (E07)',
        socraticMessage: `Tại vị trí M${formatPointCoord(pt)}, điểm đang vi phạm ràng buộc: ${violatedLabels}. Em hãy kéo M vào vùng đa giác giao chung!`
      };
    }
  }

  // 5. Canvas Boundary Line Placement (points A and B)
  if (step.inputType === 'canvas_boundary' && exercise.mathData.inequality) {
    const ineq = exercise.mathData.inequality;
    const pA = inputPayload.canvasPointA || { x: 0, y: 0 };
    const pB = inputPayload.canvasPointB || { x: 1, y: 1 };
    const distAB = Math.hypot(pA.x - pB.x, pA.y - pB.y);
    if (distAB < 0.25) {
      return {
        isCorrect: false,
        detectedErrorCodes: ['E03'],
        feedbackTitle: 'Hai điểm A và B trùng nhau (E03)',
        socraticMessage: 'Để xác định duy nhất một đường thẳng biên, hai điểm A và B phải phân biệt nhau!'
      };
    }
    const valA = ineq.a * pA.x + ineq.b * pA.y;
    const valB = ineq.a * pB.x + ineq.b * pB.y;
    const okA = Math.abs(valA - ineq.c) <= 0.15;
    const okB = Math.abs(valB - ineq.c) <= 0.15;

    if (okA && okB) {
      return {
        isCorrect: true,
        detectedErrorCodes: [],
        feedbackTitle: 'Đặt 2 điểm A, B trên đường biên chính xác!',
        socraticMessage: `Cả hai điểm A${formatPointCoord(pA)} và B${formatPointCoord(pB)} đều thuộc đường thẳng ${ineq.a}x + ${ineq.b}y = ${ineq.c}.`
      };
    }

    return {
      isCorrect: false,
      detectedErrorCodes: ['E03'],
      feedbackTitle: 'Điểm chưa nằm trên đường biên (E03)',
      socraticMessage: `${!okA ? `Điểm A${formatPointCoord(pA)} có x + y = ${formatCoord(valA)} ≠ ${ineq.c}. ` : ''}${!okB ? `Điểm B${formatPointCoord(pB)} có x + y = ${formatCoord(valB)} ≠ ${ineq.c}. ` : ''}${ERROR_CODE_CATALOG.E03.socraticQuestion}`
    };
  }

  // 6. Canvas Half-Plane Selection
  if (step.inputType === 'canvas_half_plane') {
    const side = inputPayload.canvasHalfPlaneSide;
    if (!side) {
      return {
        isCorrect: false,
        detectedErrorCodes: [],
        feedbackTitle: 'Chưa chọn nửa mặt phẳng',
        socraticMessage: 'Em hãy nhấp chuột trực tiếp vào một trong hai nửa mặt phẳng trên đồ thị (hoặc chọn nút bên dưới).'
      };
    }
    if (side === step.expectedHalfPlaneSide) {
      return {
        isCorrect: true,
        detectedErrorCodes: [],
        feedbackTitle: 'Chọn nửa mặt phẳng chính xác!',
        socraticMessage: 'Chính xác! Em đã xác định đúng nửa mặt phẳng biểu diễn miền nghiệm.'
      };
    }
    return {
      isCorrect: false,
      detectedErrorCodes: ['E05'],
      feedbackTitle: 'Chọn ngược nửa mặt phẳng (E05)',
      socraticMessage: ERROR_CODE_CATALOG.E05.socraticQuestion
    };
  }

  return {
    isCorrect: false,
    detectedErrorCodes: ['E01'],
    feedbackTitle: 'Chưa chính xác',
    socraticMessage: 'Em hãy kiểm tra lại kết quả của bước này.'
  };
}

/**
 * Computes topic mastery stats, frequent error codes, and earned badges from attempt records.
 */
export interface StudentAnalyticsSummary {
  completedExerciseIds: string[];
  totalCompletedCount: number;
  totalBankCount: number;
  totalAttemptsCount: number;
  firstTryAccuracyPercent: number;
  averageScorePercent: number;
  topicStats: Record<
    AssessmentTopicId,
    {
      topicId: AssessmentTopicId;
      name: string;
      shortName: string;
      completedCount: number;
      totalCount: number;
      masteryPercent: number;
      accuracyPercent: number;
      errorCount: number;
    }
  >;
  errorFrequency: {
    code: ErrorCodeId;
    count: number;
    lastOccurredAt: number;
  }[];
  badges: StudentBadge[];
}

export function computeStudentAnalytics(
  attempts: ExerciseAttemptRecord[]
): StudentAnalyticsSummary {
  const completedSet = new Set<string>();
  const bestScoreByExercise = new Map<string, number>();
  const firstTryByExercise = new Map<string, boolean>();
  const errorMap = new Map<ErrorCodeId, { count: number; lastOccurredAt: number }>();

  const sortedAttempts = [...attempts].sort((a, b) => a.completedAt - b.completedAt);

  for (const att of sortedAttempts) {
    if (att.isCompleted) {
      completedSet.add(att.exerciseId);
      const prevScore = bestScoreByExercise.get(att.exerciseId) ?? 0;
      const pct = att.maxScore > 0 ? (att.scoreEarned / att.maxScore) * 100 : 100;
      if (pct > prevScore) {
        bestScoreByExercise.set(att.exerciseId, pct);
      }
      if (!firstTryByExercise.has(att.exerciseId)) {
        firstTryByExercise.set(att.exerciseId, att.isFirstTryCorrect);
      }
    }
    for (const err of att.errorCodes) {
      const cur = errorMap.get(err) || { count: 0, lastOccurredAt: 0 };
      errorMap.set(err, {
        count: cur.count + 1,
        lastOccurredAt: Math.max(cur.lastOccurredAt, att.completedAt)
      });
    }
  }

  const completedIds = Array.from(completedSet);
  const firstTryCount = Array.from(firstTryByExercise.values()).filter(Boolean).length;
  const firstTryAccuracyPercent =
    firstTryByExercise.size > 0
      ? Math.round((firstTryCount / firstTryByExercise.size) * 100)
      : 0;

  const scores = Array.from(bestScoreByExercise.values());
  const averageScorePercent =
    scores.length > 0
      ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
      : 0;

  const topicStats = {} as StudentAnalyticsSummary['topicStats'];
  (['A', 'B', 'C', 'D'] as AssessmentTopicId[]).forEach(tId => {
    const exercisesInTopic = ASSESSMENT_EXERCISE_BANK.filter(e => e.topic === tId);
    const doneInTopic = exercisesInTopic.filter(e => completedSet.has(e.id));
    const topicAttempts = attempts.filter(a => a.topic === tId);
    const topicFirstTry = doneInTopic.filter(e => firstTryByExercise.get(e.id)).length;
    const topicErrors = topicAttempts.reduce((sum, a) => sum + a.errorCodes.length, 0);

    const completionRatio =
      exercisesInTopic.length > 0 ? doneInTopic.length / exercisesInTopic.length : 0;
    const accuracyRatio =
      doneInTopic.length > 0 ? topicFirstTry / doneInTopic.length : 0;
    const masteryPercent = Math.round((completionRatio * 0.65 + accuracyRatio * 0.35) * 100);

    topicStats[tId] = {
      topicId: tId,
      name: TOPIC_METADATA[tId].name,
      shortName: TOPIC_METADATA[tId].shortName,
      completedCount: doneInTopic.length,
      totalCount: exercisesInTopic.length,
      masteryPercent,
      accuracyPercent: doneInTopic.length > 0 ? Math.round(accuracyRatio * 100) : 0,
      errorCount: topicErrors
    };
  });

  const errorFrequency = (Object.keys(ERROR_CODE_CATALOG) as ErrorCodeId[])
    .map(code => ({
      code,
      count: errorMap.get(code)?.count ?? 0,
      lastOccurredAt: errorMap.get(code)?.lastOccurredAt ?? 0
    }))
    .sort((a, b) => b.count - a.count);

  // Compute learning badges (self-progress based, no public competitive pressure)
  const badges: StudentBadge[] = [
    {
      id: 'badge_first_step',
      title: 'Khởi Đầu Chuẩn Xác',
      description: 'Hoàn thành bài luyện tập tương tác đầu tiên trong Module 5.',
      iconName: 'Compass',
      unlockedAt: completedIds.length >= 1 ? sortedAttempts[0]?.completedAt || Date.now() : null,
      progressText: `${Math.min(completedIds.length, 1)}/1 bài tập`
    },
    {
      id: 'badge_boundary_master',
      title: 'Kiến Trúc Sư Đường Biên',
      description: 'Hoàn thành ít nhất 5 bài tập Chủ đề A & B về đường biên và miền nghiệm.',
      iconName: 'Layers',
      unlockedAt:
        topicStats.A.completedCount + topicStats.B.completedCount >= 5 ? Date.now() : null,
      progressText: `${Math.min(topicStats.A.completedCount + topicStats.B.completedCount, 5)}/5 bài Chủ đề A-B`
    },
    {
      id: 'badge_vertex_hunter',
      title: 'Chuyên Gia Đỉnh Đa Giác',
      description: 'Hoàn thành ít nhất 5 bài tập Chủ đề C về Hệ bất phương trình và giao điểm.',
      iconName: 'Target',
      unlockedAt: topicStats.C.completedCount >= 5 ? Date.now() : null,
      progressText: `${Math.min(topicStats.C.completedCount, 5)}/5 bài Chủ đề C`
    },
    {
      id: 'badge_optimizer',
      title: 'Nhà Quy Hoạch Tuyến Tính',
      description: 'Hoàn thành ít nhất 5 bài tập Chủ đề D về Mô hình hóa và Tối ưu thực tế.',
      iconName: 'Award',
      unlockedAt: topicStats.D.completedCount >= 5 ? Date.now() : null,
      progressText: `${Math.min(topicStats.D.completedCount, 5)}/5 bài Chủ đề D`
    },
    {
      id: 'badge_independent_thinker',
      title: 'Tư Duy Độc Lập',
      description: 'Giải đúng 5 bài tập ngay từ lần thử đầu tiên mà không cần mở gợi ý cấp 3.',
      iconName: 'Sparkles',
      unlockedAt: firstTryCount >= 5 ? Date.now() : null,
      progressText: `${Math.min(firstTryCount, 5)}/5 bài đúng ngay lần đầu`
    },
    {
      id: 'badge_grand_master',
      title: 'Bậc Thầy OPTIMATH 10',
      description: 'Hoàn thành từ 20 bài tập trở lên trên cả 4 chủ đề Toán 10.',
      iconName: 'Trophy',
      unlockedAt: completedIds.length >= 20 ? Date.now() : null,
      progressText: `${Math.min(completedIds.length, 20)}/20 bài toàn diện`
    }
  ];

  return {
    completedExerciseIds: completedIds,
    totalCompletedCount: completedIds.length,
    totalBankCount: ASSESSMENT_EXERCISE_BANK.length,
    totalAttemptsCount: attempts.length,
    firstTryAccuracyPercent,
    averageScorePercent,
    topicStats,
    errorFrequency,
    badges
  };
}

/**
 * Deterministic, explainable rule-based recommendation engine (Section VIII).
 */
export function generatePersonalizedRecommendations(
  attempts: ExerciseAttemptRecord[],
  maxItems = 6
): PersonalizedRecommendation[] {
  const summary = computeStudentAnalytics(attempts);
  const completedSet = new Set(summary.completedExerciseIds);
  const recommendations: PersonalizedRecommendation[] = [];
  const addedExerciseIds = new Set<string>();

  // Rule 1: Error Remediation — prioritize top frequent error codes
  const activeErrors = summary.errorFrequency.filter(e => e.count > 0);
  for (const errItem of activeErrors) {
    const errDef = ERROR_CODE_CATALOG[errItem.code];
    for (const exId of errDef.remedialExerciseIds) {
      if (addedExerciseIds.has(exId)) continue;
      const ex = ASSESSMENT_EXERCISE_BANK.find(e => e.id === exId);
      if (!ex) continue;
      // Prefer uncompleted remedial exercises first, or completed ones that had errors
      if (!completedSet.has(exId) || recommendations.length < 2) {
        recommendations.push({
          exercise: ex,
          reasonType: 'error_remediation',
          reasonTitle: `Khắc phục lỗi ${errItem.code}: ${errDef.title}`,
          reasonExplanation: `Hệ thống ghi nhận em gặp lỗi ${errItem.code} (${errItem.count} lần). Bài tập này giúp rèn luyện trực tiếp kỹ năng: ${ex.learningObjective}`,
          relatedErrorCode: errItem.code,
          priority: 100 + errItem.count * 10
        });
        addedExerciseIds.add(exId);
        break;
      }
    }
  }

  // Rule 2: Topic Mastery — find topics with lowest completion/mastery
  const topicsByWeakness = (['A', 'B', 'C', 'D'] as AssessmentTopicId[]).sort(
    (t1, t2) => summary.topicStats[t1].masteryPercent - summary.topicStats[t2].masteryPercent
  );

  for (const topicId of topicsByWeakness) {
    const stat = summary.topicStats[topicId];
    // Find the lowest cognitive level not yet completed in this topic
    const uncompletedInTopic = ASSESSMENT_EXERCISE_BANK.filter(
      e => e.topic === topicId && !completedSet.has(e.id) && !addedExerciseIds.has(e.id)
    ).sort((a, b) => LEVEL_METADATA[a.level].order - LEVEL_METADATA[b.level].order);

    if (uncompletedInTopic.length > 0) {
      const nextEx = uncompletedInTopic[0];
      const levelLabel = LEVEL_METADATA[nextEx.level].label;
      recommendations.push({
        exercise: nextEx,
        reasonType: stat.completedCount === 0 ? 'topic_mastery' : 'level_progression',
        reasonTitle:
          stat.completedCount === 0
            ? `Bắt đầu ${TOPIC_METADATA[topicId].shortName}`
            : `Nâng cấp mức ${levelLabel} · ${TOPIC_METADATA[topicId].shortName}`,
        reasonExplanation:
          stat.completedCount === 0
            ? `Em chưa làm bài nào ở ${TOPIC_METADATA[topicId].shortName}. Hãy khởi động từ mức ${levelLabel} để xây dựng nền tảng vững chắc.`
            : `Độ thành thạo hiện tại của ${TOPIC_METADATA[topicId].shortName} là ${stat.masteryPercent}% (${stat.completedCount}/${stat.totalCount} bài). Bài tập mức ${levelLabel} này là bước tiến phù hợp tiếp theo.`,
        priority: 80 - stat.masteryPercent * 0.5
      });
      addedExerciseIds.add(nextEx.id);
    }
  }

  // Rule 3: Review exercises where student needed Tier 2/3 hints or >2 attempts
  const struggledAttempts = attempts.filter(
    a => a.maxHintTierUsed >= 2 || a.totalAttempts >= 3
  );
  for (const att of struggledAttempts) {
    if (addedExerciseIds.has(att.exerciseId)) continue;
    const ex = ASSESSMENT_EXERCISE_BANK.find(e => e.id === att.exerciseId);
    if (!ex) continue;
    recommendations.push({
      exercise: ex,
      reasonType: 'review',
      reasonTitle: `Ôn tập củng cố độc lập (${ex.id})`,
      reasonExplanation: `Ở lần làm trước, em đã dùng gợi ý cấp ${att.maxHintTierUsed} hoặc thử ${att.totalAttempts} lần. Hãy thử giải lại bài này mà không dùng gợi ý nhé!`,
      priority: 65
    });
    addedExerciseIds.add(ex.id);
  }

  // Fill remaining slots with next uncompleted exercises in canonical order
  for (const ex of ASSESSMENT_EXERCISE_BANK) {
    if (recommendations.length >= maxItems) break;
    if (!completedSet.has(ex.id) && !addedExerciseIds.has(ex.id)) {
      recommendations.push({
        exercise: ex,
        reasonType: 'level_progression',
        reasonTitle: `Lộ trình chuẩn SGK (${LEVEL_METADATA[ex.level].label})`,
        reasonExplanation: `Mục tiêu cần đạt: ${ex.learningObjective}`,
        priority: 40
      });
      addedExerciseIds.add(ex.id);
    }
  }

  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxItems);
}
