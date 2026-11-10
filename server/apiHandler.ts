import fs from 'fs';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import {
  AssessmentExercise,
  ExerciseAttemptRecord,
  LibraryDocument,
  TeacherAssignment
} from '../src/types/assessment';
import { buildDefaultLibraryDocuments } from '../src/services/documentLibraryService';

export interface BackendDatabaseSchema {
  version: string;
  updatedAt: string;
  documents: LibraryDocument[];
  exercises: AssessmentExercise[];
  assignments: TeacherAssignment[];
  attempts: ExerciseAttemptRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const UPLOADS_DIR = path.resolve(process.cwd(), 'server', 'uploads');
const DB_FILE_PATH = path.join(DATA_DIR, 'db.json');

function ensureDirectories(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function readDatabase(): BackendDatabaseSchema {
  ensureDirectories();
  if (!fs.existsSync(DB_FILE_PATH)) {
    const seededDocs = buildDefaultLibraryDocuments();
    const seededExercises = seededDocs.flatMap(d => d.extractedExercises);
    const initialDb: BackendDatabaseSchema = {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      documents: seededDocs,
      exercises: seededExercises,
      assignments: [],
      attempts: []
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as BackendDatabaseSchema;
    if (!Array.isArray(parsed.documents) || parsed.documents.length === 0) {
      parsed.documents = buildDefaultLibraryDocuments();
    }
    if (!Array.isArray(parsed.exercises)) {
      parsed.exercises = parsed.documents.flatMap(d => d.extractedExercises || []);
    }
    if (!Array.isArray(parsed.assignments)) {
      parsed.assignments = [];
    }
    if (!Array.isArray(parsed.attempts)) {
      parsed.attempts = [];
    }
    return parsed;
  } catch {
    const seededDocs = buildDefaultLibraryDocuments();
    return {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      documents: seededDocs,
      exercises: seededDocs.flatMap(d => d.extractedExercises),
      assignments: [],
      attempts: []
    };
  }
}

export function writeDatabase(db: BackendDatabaseSchema): void {
  ensureDirectories();
  db.updatedAt = new Date().toISOString();
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function readJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 15 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(payload));
}

/**
 * Node HTTP request handler for /api/* routes.
 * Returns true if the request was handled, or false if it's not an /api/ route.
 */
export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const rawUrl = req.url || '';
  // Strip any Vite base prefix (e.g. /KHKT-MATH/api/... -> /api/...)
  const apiIndex = rawUrl.indexOf('/api/');
  if (apiIndex === -1 && !rawUrl.endsWith('/api')) {
    return false;
  }

  const normalizedUrl = rawUrl.slice(apiIndex).split('?')[0];
  const method = (req.method || 'GET').toUpperCase();

  if (method === 'OPTIONS') {
    sendJson(res, 200, { ok: true });
    return true;
  }

  try {
    // 1. GET /api/health
    if (normalizedUrl === '/api/health' && method === 'GET') {
      const db = readDatabase();
      sendJson(res, 200, {
        ok: true,
        status: 'online',
        storagePath: 'server/data/db.json',
        uploadsDir: 'server/uploads/',
        documentsCount: db.documents.length,
        exercisesCount: db.exercises.length,
        assignmentsCount: db.assignments.length,
        attemptsCount: db.attempts.length,
        updatedAt: db.updatedAt
      });
      return true;
    }

    // 2. GET /api/documents
    if (normalizedUrl === '/api/documents' && method === 'GET') {
      const db = readDatabase();
      sendJson(res, 200, {
        ok: true,
        documents: db.documents
      });
      return true;
    }

    // 3. POST /api/documents (Upload & Store document + Save raw file to server/uploads/)
    if (normalizedUrl === '/api/documents' && method === 'POST') {
      const body = await readJsonBody(req);
      const doc = body.document as LibraryDocument | undefined;
      if (!doc || !doc.id) {
        sendJson(res, 400, { ok: false, error: 'Invalid document payload' });
        return true;
      }

      ensureDirectories();
      const safeFileName = `${doc.id}_${(doc.fileName || 'document.txt').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const uploadFilePath = path.join(UPLOADS_DIR, safeFileName);
      fs.writeFileSync(uploadFilePath, doc.rawContent || '', 'utf-8');

      const db = readDatabase();
      db.documents = [doc, ...db.documents.filter(d => d.id !== doc.id)];

      if (Array.isArray(doc.extractedExercises) && doc.extractedExercises.length > 0) {
        const incomingIds = new Set(doc.extractedExercises.map(e => e.id));
        db.exercises = [
          ...doc.extractedExercises,
          ...db.exercises.filter(e => !incomingIds.has(e.id))
        ];
      }

      writeDatabase(db);
      sendJson(res, 201, {
        ok: true,
        savedFile: `server/uploads/${safeFileName}`,
        document: doc,
        documents: db.documents
      });
      return true;
    }

    // 4. DELETE /api/documents/:id
    if (normalizedUrl.startsWith('/api/documents/') && method === 'DELETE') {
      const docId = decodeURIComponent(normalizedUrl.replace('/api/documents/', ''));
      const db = readDatabase();
      db.documents = db.documents.filter(d => d.id !== docId);
      db.exercises = db.exercises.filter(e => e.sourceDocumentId !== docId);
      writeDatabase(db);
      sendJson(res, 200, {
        ok: true,
        documents: db.documents
      });
      return true;
    }

    // 5. GET /api/exercises
    if (normalizedUrl === '/api/exercises' && method === 'GET') {
      const db = readDatabase();
      sendJson(res, 200, {
        ok: true,
        exercises: db.exercises
      });
      return true;
    }

    // 6. POST /api/exercises
    if (normalizedUrl === '/api/exercises' && method === 'POST') {
      const body = await readJsonBody(req);
      const incoming: AssessmentExercise[] = Array.isArray(body.exercises)
        ? body.exercises
        : body.exercise
        ? [body.exercise]
        : [];
      const db = readDatabase();
      const incomingIds = new Set(incoming.map(e => e.id));
      db.exercises = [...incoming, ...db.exercises.filter(e => !incomingIds.has(e.id))];
      writeDatabase(db);
      sendJson(res, 201, {
        ok: true,
        exercises: db.exercises
      });
      return true;
    }

    // 7. DELETE /api/exercises/:id
    if (normalizedUrl.startsWith('/api/exercises/') && method === 'DELETE') {
      const exId = decodeURIComponent(normalizedUrl.replace('/api/exercises/', ''));
      const db = readDatabase();
      db.exercises = db.exercises.filter(e => e.id !== exId);
      writeDatabase(db);
      sendJson(res, 200, {
        ok: true,
        exercises: db.exercises
      });
      return true;
    }

    // 8. GET /api/assignments
    if (normalizedUrl === '/api/assignments' && method === 'GET') {
      const db = readDatabase();
      sendJson(res, 200, {
        ok: true,
        assignments: db.assignments
      });
      return true;
    }

    // 9. POST /api/assignments
    if (normalizedUrl === '/api/assignments' && method === 'POST') {
      const body = await readJsonBody(req);
      const assign = body.assignment as TeacherAssignment | undefined;
      if (!assign || !assign.id) {
        sendJson(res, 400, { ok: false, error: 'Invalid assignment' });
        return true;
      }
      const db = readDatabase();
      db.assignments = [assign, ...db.assignments.filter(a => a.id !== assign.id)];
      writeDatabase(db);
      sendJson(res, 201, {
        ok: true,
        assignments: db.assignments
      });
      return true;
    }

    // 10. DELETE /api/assignments/:id
    if (normalizedUrl.startsWith('/api/assignments/') && method === 'DELETE') {
      const assignId = decodeURIComponent(normalizedUrl.replace('/api/assignments/', ''));
      const db = readDatabase();
      db.assignments = db.assignments.filter(a => a.id !== assignId);
      writeDatabase(db);
      sendJson(res, 200, {
        ok: true,
        assignments: db.assignments
      });
      return true;
    }

    // 11. GET /api/attempts
    if (normalizedUrl === '/api/attempts' && method === 'GET') {
      const db = readDatabase();
      sendJson(res, 200, {
        ok: true,
        attempts: db.attempts
      });
      return true;
    }

    // 12. POST /api/attempts
    if (normalizedUrl === '/api/attempts' && method === 'POST') {
      const body = await readJsonBody(req);
      const attempt = body.attempt as ExerciseAttemptRecord | undefined;
      if (!attempt || !attempt.id) {
        sendJson(res, 400, { ok: false, error: 'Invalid attempt' });
        return true;
      }
      const db = readDatabase();
      db.attempts = [attempt, ...db.attempts.filter(a => a.id !== attempt.id)];
      writeDatabase(db);
      sendJson(res, 201, {
        ok: true,
        attempts: db.attempts
      });
      return true;
    }

    sendJson(res, 404, { ok: false, error: `Endpoint not found: ${method} ${normalizedUrl}` });
    return true;
  } catch (err: any) {
    sendJson(res, 500, {
      ok: false,
      error: err?.message || 'Internal backend server error'
    });
    return true;
  }
}
