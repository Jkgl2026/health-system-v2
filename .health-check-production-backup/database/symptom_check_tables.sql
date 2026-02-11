-- 自检数据表
CREATE TABLE IF NOT EXISTS symptom_check (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  check_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  selected_symptoms JSONB NOT NULL, -- 选中的症状ID列表
  target_symptoms JSONB NOT NULL, -- 目标改善症状ID列表
  total_score INTEGER NOT NULL DEFAULT 0, -- 总分（症状数量）

  -- 各维度得分
  qi_blood_score INTEGER DEFAULT 0, -- 气血得分
  circulation_score INTEGER DEFAULT 0, -- 循环得分
  toxins_score INTEGER DEFAULT 0, -- 毒素得分
  blood_lipids_score INTEGER DEFAULT 0, -- 血脂得分
  coldness_score INTEGER DEFAULT 0, -- 寒凉得分
  immunity_score INTEGER DEFAULT 0, -- 免疫得分
  emotions_score INTEGER DEFAULT 0, -- 情绪得分

  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 健康分析表
CREATE TABLE IF NOT EXISTS health_analysis (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  check_id INTEGER NOT NULL REFERENCES symptom_check(id) ON DELETE CASCADE,
  analysis_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 综合评分
  qi_blood INTEGER, -- 气血（0-100）
  circulation INTEGER, -- 循环（0-100）
  toxins INTEGER, -- 毒素（0-100）
  blood_lipids INTEGER, -- 血脂（0-100）
  coldness INTEGER, -- 寒凉（0-100）
  immunity INTEGER, -- 免疫（0-100）
  emotions INTEGER, -- 情绪（0-100）
  overall_health INTEGER, -- 综合健康分数（0-100）

  -- 健康状态
  health_status VARCHAR(20) NOT NULL, -- 优秀/良好/一般/异常

  -- 详细分析报告
  analysis_report TEXT, -- 完整的健康分析文本

  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_symptom_check_user_id ON symptom_check(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_check_date ON symptom_check(check_date);
CREATE INDEX IF NOT EXISTS idx_health_analysis_user_id ON health_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_health_analysis_check_id ON health_analysis(check_id);

-- 创建触发器自动更新 update_time
CREATE OR REPLACE FUNCTION update_update_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.update_time = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_symptom_check_update_time
BEFORE UPDATE ON symptom_check
FOR EACH ROW
EXECUTE FUNCTION update_update_time();

CREATE TRIGGER trigger_update_health_analysis_update_time
BEFORE UPDATE ON health_analysis
FOR EACH ROW
EXECUTE FUNCTION update_update_time();

-- 注释
COMMENT ON TABLE symptom_check IS '自检数据表';
COMMENT ON TABLE health_analysis IS '健康分析表';
COMMENT ON COLUMN symptom_check.selected_symptoms IS '选中的症状ID列表，JSON格式';
COMMENT ON COLUMN symptom_check.target_symptoms IS '目标改善症状ID列表，JSON格式';
COMMENT ON COLUMN health_analysis.analysis_report IS '系统生成的完整健康分析文本';
