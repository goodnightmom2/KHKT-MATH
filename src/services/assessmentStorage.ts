import {
  ExerciseAttemptRecord,
  TeacherAssignment,
  AssessmentExercise,
  AssessmentTopicId,
  CognitiveLevel,
  ErrorCodeId
} from '../types/assessment';
import { ASSESSMENT_EXERCISE_BANK } from '../data/assessmentBank';
import { buildSupabaseHeaders, getCloudDbConfig } from './documentLibraryService';

const DB_NAME = 'optimath_assessment_db';
const DB_VERSION = 1;
const STORE_ATTEMPTS = 'attempts';
const STORE_ASSIGNMENTS = 'assignments';

const LS_ATTEMPTS_KEY = 'optimath_v5_attempts_backup';
const LS_ASSIGNMENTS_KEY = 'optimath_v5_assignments_backup';
const LS_CUSTOM_EXERCISES_KEY = 'optimath_v5_custom_exercises';

export function loadCustomExercises(): AssessmentExercise[] {
  try {
    const raw = localStorage.getItem(LS_CUSTOM_EXERCISES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function fetchCustomExercisesFromBackend(): Promise<AssessmentExercise[]> {
  const cloud = getCloudDbConfig();
  if (cloud.supabaseUrl && cloud.supabaseAnonKey) {
    try {
      const sbRes = await fetch(
        `${cloud.supabaseUrl}/rest/v1/optimath_exercises?select=*`,
        {
          method: 'GET',
          headers: buildSupabaseHeaders(cloud.supabaseAnonKey)
        }
      );
      if (sbRes.ok) {
        const rows = await sbRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const sbExercises = rows
            .map((r: any) => r.exercise_data as AssessmentExercise)
            .filter(Boolean);
          const local = loadCustomExercises();
          const mergedMap = new Map<string, AssessmentExercise>();
          for (const ex of [...sbExercises, ...local]) {
            if (ex && ex.id) mergedMap.set(ex.id, ex);
          }
          const merged = Array.from(mergedMap.values());
          localStorage.setItem(LS_CUSTOM_EXERCISES_KEY, JSON.stringify(merged));
          return merged;
        }
      }
    } catch {
      // Fallback
    }
  }

  try {
    const res = await fetch('/api/exercises', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.exercises)) {
        const local = loadCustomExercises();
        const mergedMap = new Map<string, AssessmentExercise>();
        for (const ex of [...data.exercises, ...local]) {
          mergedMap.set(ex.id, ex);
        }
        const merged = Array.from(mergedMap.values());
        localStorage.setItem(LS_CUSTOM_EXERCISES_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch {
    // Offline fallback
  }
  return loadCustomExercises();
}

export function saveCustomExercise(exercise: AssessmentExercise): AssessmentExercise[] {
  const existing = loadCustomExercises();
  const updated = [exercise, ...existing.filter(e => e.id !== exercise.id)];
  try {
    localStorage.setItem(LS_CUSTOM_EXERCISES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }

  const cloud = getCloudDbConfig();
  if (cloud.supabaseUrl && cloud.supabaseAnonKey) {
    fetch(`${cloud.supabaseUrl}/rest/v1/optimath_exercises`, {
      method: 'POST',
      headers: buildSupabaseHeaders(cloud.supabaseAnonKey, {
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      }),
      body: JSON.stringify({
        id: exercise.id,
        topic: exercise.topic,
        level: exercise.level,
        template_id: exercise.templateId || null,
        source_document_id: exercise.sourceDocumentId || null,
        source_document_title: exercise.sourceDocumentTitle || null,
        title: exercise.title,
        question_text: exercise.questionText,
        exercise_data: exercise
      })
    }).catch(() => {});
  }

  fetch('/api/exercises', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exercises: [exercise] })
  }).catch(() => {});
  return updated;
}

export function saveCustomExercisesBatch(exercises: AssessmentExercise[]): AssessmentExercise[] {
  const existing = loadCustomExercises();
  const incomingIds = new Set(exercises.map(e => e.id));
  const updated = [...exercises, ...existing.filter(e => !incomingIds.has(e.id))];
  try {
    localStorage.setItem(LS_CUSTOM_EXERCISES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }

  const cloud = getCloudDbConfig();
  if (cloud.supabaseUrl && cloud.supabaseAnonKey && exercises.length > 0) {
    fetch(`${cloud.supabaseUrl}/rest/v1/optimath_exercises`, {
      method: 'POST',
      headers: buildSupabaseHeaders(cloud.supabaseAnonKey, {
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      }),
      body: JSON.stringify(
        exercises.map(ex => ({
          id: ex.id,
          topic: ex.topic,
          level: ex.level,
          template_id: ex.templateId || null,
          source_document_id: ex.sourceDocumentId || null,
          source_document_title: ex.sourceDocumentTitle || null,
          title: ex.title,
          question_text: ex.questionText,
          exercise_data: ex
        }))
      )
    }).catch(() => {});
  }

  fetch('/api/exercises', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exercises })
  }).catch(() => {});
  return updated;
}

export function deleteCustomExercise(exerciseId: string): AssessmentExercise[] {
  const existing = loadCustomExercises();
  const updated = existing.filter(e => e.id !== exerciseId);
  try {
    localStorage.setItem(LS_CUSTOM_EXERCISES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  const cloud = getCloudDbConfig();
  if (cloud.supabaseUrl && cloud.supabaseAnonKey) {
    fetch(
      `${cloud.supabaseUrl}/rest/v1/optimath_exercises?id=eq.${encodeURIComponent(exerciseId)}`,
      {
        method: 'DELETE',
        headers: buildSupabaseHeaders(cloud.supabaseAnonKey)
      }
    ).catch(() => {});
  }

  fetch(`/api/exercises/${encodeURIComponent(exerciseId)}`, {
    method: 'DELETE'
  }).catch(() => {});
  return updated;
}

const DEFAULT_ASSIGNMENTS: TeacherAssignment[] = [
  {
    id: 'assign_default_1',
    title: 'Phiếu luyện tập số 1: Đường biên & Miền nghiệm một BPT',
    description: 'Ôn tập nhận diện bất phương trình bậc nhất hai ẩn, vẽ đường biên nét liền/đứt và chọn nửa mặt phẳng nghiệm.',
    createdAt: Date.now() - 86400000 * 2,
    dueDate: '2026-10-25',
    targetLevels: ['nhan_biet', 'thong_hieu', 'van_dung'],
    targetTopics: ['A', 'B'],
    exerciseIds: ['A01', 'A02', 'A04', 'B01', 'B02', 'B05', 'B06']
  },
  {
    id: 'assign_default_2',
    title: 'Phiếu luyện tập số 2: Hệ BPT & Quy hoạch tuyến tính thực tế',
    description: 'Luyện tập tìm đỉnh cực biên của hệ BPT (bao gồm tọa độ phân số 8/3) và phân biệt nghiệm liên tục với nghiệm nguyên.',
    createdAt: Date.now() - 86400000,
    dueDate: '2026-10-30',
    targetLevels: ['thong_hieu', 'van_dung', 'van_dung_cao'],
    targetTopics: ['C', 'D'],
    exerciseIds: ['C01', 'C03', 'C04', 'C07', 'D03', 'D04', 'D05', 'D08']
  }
];

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_ATTEMPTS)) {
        db.createObjectStore(STORE_ATTEMPTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ASSIGNMENTS)) {
        db.createObjectStore(STORE_ASSIGNMENTS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadAllAttempts(): Promise<ExerciseAttemptRecord[]> {
  try {
    const db = await openDatabase();
    return await new Promise<ExerciseAttemptRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_ATTEMPTS, 'readonly');
      const store = tx.objectStore(STORE_ATTEMPTS);
      const req = store.getAll();
      req.onsuccess = () => {
        const res = (req.result || []) as ExerciseAttemptRecord[];
        if (res.length > 0) {
          resolve(res.sort((a, b) => b.completedAt - a.completedAt));
        } else {
          // Check localStorage backup
          const raw = localStorage.getItem(LS_ATTEMPTS_KEY);
          resolve(raw ? JSON.parse(raw) : []);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      const raw = localStorage.getItem(LS_ATTEMPTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export async function saveAttemptRecord(record: ExerciseAttemptRecord): Promise<ExerciseAttemptRecord[]> {
  const existing = await loadAllAttempts();
  const updated = [record, ...existing.filter(r => r.id !== record.id)];
  try {
    localStorage.setItem(LS_ATTEMPTS_KEY, JSON.stringify(updated));
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ATTEMPTS, 'readwrite');
      tx.objectStore(STORE_ATTEMPTS).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback already saved in localStorage
  }
  fetch('/api/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attempt: record })
  }).catch(() => {});
  return updated;
}

export async function clearAllAttempts(): Promise<void> {
  try {
    localStorage.removeItem(LS_ATTEMPTS_KEY);
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ATTEMPTS, 'readwrite');
      tx.objectStore(STORE_ATTEMPTS).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
}

export async function loadAllAssignments(): Promise<TeacherAssignment[]> {
  try {
    const db = await openDatabase();
    const list = await new Promise<TeacherAssignment[]>((resolve, reject) => {
      const tx = db.transaction(STORE_ASSIGNMENTS, 'readonly');
      const req = tx.objectStore(STORE_ASSIGNMENTS).getAll();
      req.onsuccess = () => resolve((req.result || []) as TeacherAssignment[]);
      req.onerror = () => reject(req.error);
    });
    if (list.length > 0) {
      return list.sort((a, b) => b.createdAt - a.createdAt);
    }
    const raw = localStorage.getItem(LS_ASSIGNMENTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // Seed default teacher assignments on first load
    for (const assign of DEFAULT_ASSIGNMENTS) {
      await saveTeacherAssignment(assign);
    }
    return DEFAULT_ASSIGNMENTS;
  } catch {
    try {
      const raw = localStorage.getItem(LS_ASSIGNMENTS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_ASSIGNMENTS;
    } catch {
      return DEFAULT_ASSIGNMENTS;
    }
  }
}

export async function saveTeacherAssignment(assignment: TeacherAssignment): Promise<TeacherAssignment[]> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ASSIGNMENTS, 'readwrite');
      tx.objectStore(STORE_ASSIGNMENTS).put(assignment);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback
  }
  const current = await loadAllAssignments();
  const merged = [assignment, ...current.filter(a => a.id !== assignment.id)];
  try {
    localStorage.setItem(LS_ASSIGNMENTS_KEY, JSON.stringify(merged));
  } catch {
    // Ignore
  }
  fetch('/api/assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignment })
  }).catch(() => {});
  return merged;
}

export async function deleteTeacherAssignment(assignmentId: string): Promise<TeacherAssignment[]> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ASSIGNMENTS, 'readwrite');
      tx.objectStore(STORE_ASSIGNMENTS).delete(assignmentId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
  const current = await loadAllAssignments();
  const filtered = current.filter(a => a.id !== assignmentId);
  try {
    localStorage.setItem(LS_ASSIGNMENTS_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore
  }
  fetch(`/api/assignments/${encodeURIComponent(assignmentId)}`, {
    method: 'DELETE'
  }).catch(() => {});
  return filtered;
}

/**
 * Exports all attempt records to a UTF-8 CSV file (Excel friendly).
 */
export function exportAttemptsToCSV(attempts: ExerciseAttemptRecord[]): void {
  const headers = [
    'Mã lượt làm',
    'Mã bài tập',
    'Chủ đề',
    'Mức độ',
    'Kiểu tương tác',
    'Thời gian hoàn thành (giây)',
    'Điểm đạt',
    'Điểm tối đa',
    'Đúng ngay lần đầu',
    'Tổng số lần thử',
    'Cấp gợi ý cao nhất',
    'Mã lỗi phát sinh',
    'Thời điểm hoàn thành'
  ];

  const escapeCsv = (val: string | number | boolean) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = attempts.map(a => [
    a.id,
    a.exerciseId,
    a.topic,
    a.level,
    a.interactionType,
    a.durationSeconds,
    a.scoreEarned,
    a.maxScore,
    a.isFirstTryCorrect ? 'Có' : 'Không',
    a.totalAttempts,
    a.maxHintTierUsed,
    a.errorCodes.join('; ') || 'Không có lỗi',
    new Date(a.completedAt).toLocaleString('vi-VN')
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `optimath_module5_ket_qua_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports complete local state (attempts + teacher assignments) to JSON.
 */
export function exportAssessmentDataJSON(
  attempts: ExerciseAttemptRecord[],
  assignments: TeacherAssignment[]
): void {
  const payload = {
    app: 'OPTIMATH_LAB_MODULE_5',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    attempts,
    assignments
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `optimath_module5_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Imports assessment data from a JSON or CSV file into IndexedDB.
 */
export async function importAssessmentDataFromFile(file: File): Promise<{
  attempts: ExerciseAttemptRecord[];
  assignments: TeacherAssignment[];
  importedCount: number;
}> {
  const text = await file.text();

  if (file.name.endsWith('.json')) {
    const parsed = JSON.parse(text);
    const incomingAttempts: ExerciseAttemptRecord[] = Array.isArray(parsed.attempts)
      ? parsed.attempts
      : [];
    const incomingAssignments: TeacherAssignment[] = Array.isArray(parsed.assignments)
      ? parsed.assignments
      : [];

    for (const att of incomingAttempts) {
      await saveAttemptRecord(att);
    }
    for (const assign of incomingAssignments) {
      await saveTeacherAssignment(assign);
    }

    const attempts = await loadAllAttempts();
    const assignments = await loadAllAssignments();
    return {
      attempts,
      assignments,
      importedCount: incomingAttempts.length + incomingAssignments.length
    };
  }

  // Parse CSV lines if CSV file provided
  const cleanText = text.replace(/^\uFEFF/, '');
  const lines = cleanText.split(/\r?\n/).filter(l => l.trim().length > 0);
  let importedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 8) continue;
    const exId = cols[1]?.replace(/"/g, '').trim();
    const ex = ASSESSMENT_EXERCISE_BANK.find(e => e.id === exId);
    if (!ex) continue;

    const errStr = cols[11]?.replace(/"/g, '').trim() || '';
    const errCodes = errStr
      .split(';')
      .map(s => s.trim())
      .filter(s => /^E(0[1-9]|10)$/.test(s)) as ErrorCodeId[];

    const record: ExerciseAttemptRecord = {
      id: cols[0]?.replace(/"/g, '').trim() || `imp_${Date.now()}_${i}`,
      exerciseId: ex.id,
      topic: ex.topic as AssessmentTopicId,
      level: ex.level as CognitiveLevel,
      interactionType: ex.interactionType,
      startedAt: Date.now() - 60000,
      completedAt: Date.now(),
      durationSeconds: Number(cols[5]) || 45,
      isCompleted: true,
      isFirstTryCorrect: cols[8]?.includes('Có') ?? true,
      totalAttempts: Number(cols[9]) || 1,
      maxHintTierUsed: (Number(cols[10]) || 0) as 0 | 1 | 2 | 3,
      scoreEarned: Number(cols[6]) || 10,
      maxScore: Number(cols[7]) || 10,
      errorCodes: errCodes,
      stepRecords: []
    };

    await saveAttemptRecord(record);
    importedCount++;
  }

  const attempts = await loadAllAttempts();
  const assignments = await loadAllAssignments();
  return { attempts, assignments, importedCount };
}
