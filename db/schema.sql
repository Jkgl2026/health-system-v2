-- 用户数据表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 健康评估结果表
CREATE TABLE IF NOT EXISTS health_assessments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  level TEXT NOT NULL,
  body_language_score INTEGER,
  health_elements_score INTEGER,
  system_story_score INTEGER,
  choices_score INTEGER,
  requirements_score INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 系统战役故事答案
CREATE TABLE IF NOT EXISTS system_story_answers (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  answers TEXT NOT NULL,  -- JSON 格式存储
  created_at TEXT NOT NULL,
  FOREIGN KEY (assessment_id) REFERENCES health_assessments(id) ON DELETE CASCADE
);

-- 健康要素答案
CREATE TABLE IF NOT EXISTS health_elements_answers (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  answers TEXT NOT NULL,  -- JSON 格式存储
  created_at TEXT NOT NULL,
  FOREIGN KEY (assessment_id) REFERENCES health_assessments(id) ON DELETE CASCADE
);

-- 选择题答案
CREATE TABLE IF NOT EXISTS choices_answers (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  answers TEXT NOT NULL,  -- JSON 格式存储
  created_at TEXT NOT NULL,
  FOREIGN KEY (assessment_id) REFERENCES health_assessments(id) ON DELETE CASCADE
);

-- 要求数据
CREATE TABLE IF NOT EXISTS requirements_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  data TEXT NOT NULL,  -- JSON 格式存储
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_health_assessments_user_id ON health_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_health_assessments_created_at ON health_assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_requirements_data_user_id ON requirements_data(user_id);
