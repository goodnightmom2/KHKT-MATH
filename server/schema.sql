-- ============================================================================
-- KỊCH BẢN TẠO CƠ SỞ DỮ LIỆU (CSDL) CHO OPTIMATH LAB TRÊN SUPABASE (POSTGRESQL)
-- Hướng dẫn: Copy toàn bộ nội dung file này -> Dán vào mục "SQL Editor" trên
-- trang quản trị Supabase (https://supabase.com) -> Bấm "Run".
-- ============================================================================

-- 1. Bảng lưu trữ Kho Thư Viện Tài Liệu của Giáo viên
CREATE TABLE IF NOT EXISTS public.optimath_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT DEFAULT 'txt',
  file_size INTEGER DEFAULT 0,
  uploaded_at BIGINT NOT NULL,
  topic TEXT DEFAULT 'ALL',
  description TEXT DEFAULT '',
  raw_content TEXT NOT NULL,
  extracted_exercises JSONB DEFAULT '[]'::jsonb,
  question_type_counts JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng lưu trữ Ngân hàng Câu hỏi / Bài tập (Bóc tách từ tài liệu & GV tự tạo)
CREATE TABLE IF NOT EXISTS public.optimath_exercises (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  level TEXT NOT NULL,
  template_id TEXT,
  source_document_id TEXT,
  source_document_title TEXT,
  title TEXT NOT NULL,
  question_text TEXT NOT NULL,
  exercise_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng lưu trữ Đề thi / Phiếu bài tập Giáo viên giao cho Học sinh
CREATE TABLE IF NOT EXISTS public.optimath_assignments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at BIGINT NOT NULL,
  due_date TEXT,
  target_levels JSONB DEFAULT '[]'::jsonb,
  target_topics JSONB DEFAULT '[]'::jsonb,
  exercise_ids JSONB DEFAULT '[]'::jsonb
);

-- 4. Bảng lưu trữ Lịch sử làm bài & Kết quả chấm Đúng/Sai của Học sinh
CREATE TABLE IF NOT EXISTS public.optimath_attempts (
  id TEXT PRIMARY KEY,
  exercise_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  level TEXT NOT NULL,
  score_earned NUMERIC DEFAULT 0,
  max_score NUMERIC DEFAULT 10,
  is_completed BOOLEAN DEFAULT TRUE,
  completed_at BIGINT NOT NULL,
  attempt_data JSONB NOT NULL
);

-- Mở quyền truy cập API công khai (Row Level Security) cho ứng dụng Web
ALTER TABLE public.optimath_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimath_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimath_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimath_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to optimath_documents"
  ON public.optimath_documents FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to optimath_exercises"
  ON public.optimath_exercises FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to optimath_assignments"
  ON public.optimath_assignments FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to optimath_attempts"
  ON public.optimath_attempts FOR ALL USING (true) WITH CHECK (true);
