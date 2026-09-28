-- ============================================
-- LangBridge - اسکیمای پایگاه داده Supabase
-- برای اجرا در SQL Editor پنل Supabase
-- ============================================

-- جدول کاربران
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK (grade IN (7, 8, 9)),
  avatar TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- جدول نتایج آزمون
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  grade INTEGER NOT NULL,
  week INTEGER NOT NULL,
  score INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  review JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول فلش‌کارت‌ها
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  example_translation TEXT,
  grade INTEGER NOT NULL,
  topic TEXT,
  difficulty INTEGER DEFAULT 1,
  learned BOOLEAN DEFAULT FALSE,
  review_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول لاگ مطالعه
CREATE TABLE IF NOT EXISTS study_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  minutes INTEGER NOT NULL,
  UNIQUE(user_id, date)
);

-- جدول امتیازات
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  grade INTEGER NOT NULL,
  week INTEGER NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ایندکس‌ها
CREATE INDEX idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX idx_flashcards_user ON flashcards(user_id);
CREATE INDEX idx_study_log_user ON study_log(user_id);
CREATE INDEX idx_scores_user ON scores(user_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- سیاست‌های امنیتی
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "quiz_results_select_own" ON quiz_results FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "quiz_results_insert_own" ON quiz_results FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "flashcards_select_own" ON flashcards FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "flashcards_insert_own" ON flashcards FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "flashcards_update_own" ON flashcards FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "flashcards_delete_own" ON flashcards FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "study_log_select_own" ON study_log FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "study_log_insert_own" ON study_log FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "scores_select_all" ON scores FOR SELECT USING (true);
CREATE POLICY "scores_insert_own" ON scores FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
