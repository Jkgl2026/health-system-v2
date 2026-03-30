-- 健康档案表
CREATE TABLE IF NOT EXISTS health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_data JSONB NOT NULL,
  latest_scores JSONB,
  health_goals JSONB,
  risk_assessment JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- 健康指标表（血压、血糖、血脂等）
CREATE TABLE IF NOT EXISTS health_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  indicator_type VARCHAR(50) NOT NULL,
  indicator_name VARCHAR(100) NOT NULL,
  indicator_value DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50),
  measurement_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 健康目标表
CREATE TABLE IF NOT EXISTS health_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(100) NOT NULL,
  goal_description TEXT NOT NULL,
  target_value DECIMAL(10, 2),
  current_value DECIMAL(10, 2),
  target_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 健康趋势表
CREATE TABLE IF NOT EXISTS health_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trend_type VARCHAR(100) NOT NULL,
  trend_data JSONB NOT NULL,
  analysis_result TEXT,
  trend_direction VARCHAR(50),
  confidence INTEGER,
  recorded_at DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 风险因子表
CREATE TABLE IF NOT EXISTS risk_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  risk_type VARCHAR(100) NOT NULL,
  risk_name VARCHAR(200) NOT NULL,
  risk_level VARCHAR(50) NOT NULL,
  likelihood VARCHAR(50),
  impact VARCHAR(50),
  risk_score INTEGER,
  detected_from VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 为健康档案表创建索引
CREATE INDEX IF NOT EXISTS idx_health_profiles_user ON health_profiles(user_id);

-- 为健康指标表创建索引
CREATE INDEX IF NOT EXISTS idx_health_indicators_user ON health_indicators(user_id);
CREATE INDEX IF NOT EXISTS idx_health_indicators_type ON health_indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_health_indicators_date ON health_indicators(measurement_date);

-- 为健康目标表创建索引
CREATE INDEX IF NOT EXISTS idx_health_goals_user ON health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_health_goals_status ON health_goals(status);

-- 为健康趋势表创建索引
CREATE INDEX IF NOT EXISTS idx_health_trends_user ON health_trends(user_id);
CREATE INDEX IF NOT EXISTS idx_health_trends_type ON health_trends(trend_type);

-- 为风险因子表创建索引
CREATE INDEX IF NOT EXISTS idx_risk_factors_user ON risk_factors(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_factors_type ON risk_factors(risk_type);
CREATE INDEX IF NOT EXISTS idx_risk_factors_status ON risk_factors(status);
