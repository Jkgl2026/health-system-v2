-- 医学知识库表
CREATE TABLE IF NOT EXISTS medical_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  source VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 疾病特征库表
CREATE TABLE IF NOT EXISTS disease_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_name VARCHAR(200) NOT NULL,
  feature_type VARCHAR(100) NOT NULL,
  feature_name VARCHAR(200) NOT NULL,
  feature_description TEXT,
  clinical_significance TEXT,
  severity_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 诊断规则引擎表
CREATE TABLE IF NOT EXISTS diagnosis_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(300) NOT NULL,
  category VARCHAR(100) NOT NULL,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  priority INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 中医体质库表
CREATE TABLE IF NOT EXISTS tcm_constitutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  constitution_type VARCHAR(100) NOT NULL UNIQUE,
  constitution_name VARCHAR(200) NOT NULL,
  characteristics TEXT NOT NULL,
  manifestations TEXT NOT NULL,
  dietary_recomendations TEXT,
  lifestyle_recomendations TEXT,
  herbal_recommendations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 为医学知识库表创建索引
CREATE INDEX IF NOT EXISTS idx_medical_knowledge_category ON medical_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_medical_knowledge_subcategory ON medical_knowledge(subcategory);

-- 为疾病特征库表创建索引
CREATE INDEX IF NOT EXISTS idx_disease_features_disease ON disease_features(disease_name);
CREATE INDEX IF NOT EXISTS idx_disease_features_type ON disease_features(feature_type);

-- 为诊断规则表创建索引
CREATE INDEX IF NOT EXISTS idx_diagnosis_rules_category ON diagnosis_rules(category);
CREATE INDEX IF NOT EXISTS idx_diagnosis_rules_active ON diagnosis_rules(active);

-- 插入中医体质数据
INSERT INTO tcm_constitutions (constitution_type, constitution_name, characteristics, manifestations, dietary_recomendations, lifestyle_recommendations) VALUES
('pinghe', '平和质', '阴阳气血调和，体态适中，面色红润，精力充沛', '面色润泽，毛发稠密有光泽，目光有神，鼻色明润，嗅觉通利，味觉正常，唇色红润，精力充沛，不易疲劳，耐受寒热，睡眠良好，胃纳佳，二便正常', '饮食有节制，不过饥过饱，不偏食，保持食物多样化，适当摄入蔬菜水果', '作息规律，劳逸结合，坚持锻炼，保持心情舒畅'),
('qixu', '气虚质', '元气不足，体态偏虚胖或瘦弱，面色偏白或微黄', '平素语音低弱，气短懒言，容易疲乏，精神不振，易出汗，舌淡红，舌边有齿痕，脉弱', '多食用益气健脾食物，如山药、莲子、大枣、小米、粳米、鸡肉、牛肉等', '避免过度劳累，保证充足睡眠，适度运动，避免剧烈运动，保持心情愉快'),
('yangxu', '阳虚质', '阳气不足，畏寒怕冷，手足不温', '平素畏冷，手足不温，喜热饮食，精神不振，睡眠偏多，面色㿠白，目胞晦暗，口唇色淡，毛发易落，易出汗，大便溏薄，小便清长', '多食用温补阳气食物，如羊肉、狗肉、韭菜、辣椒、胡椒、生姜、葱等', '注意保暖，避免受寒，适当晒太阳，可进行温水浴，避免过度劳累'),
('yinxu', '阴虚质', '阴液亏少，口燥咽干，手足心热', '手足心热，口燥咽干，鼻微干，喜冷饮，大便干燥，舌红少津，脉细数', '多食用滋阴润燥食物，如梨、百合、银耳、蜂蜜、绿豆、冬瓜、芝麻、鸭肉、猪肉等', '避免熬夜，保证充足睡眠，避免剧烈运动，避免辛辣燥热食物，保持心情平和'),
('tanshi', '痰湿质', '水液内停，体形肥胖，腹部肥满松软', '面部皮肤油脂较多，多汗且黏，胸闷，痰多，口黏腻或甜，喜食肥甘甜黏，苔腻，脉滑', '多食用健脾利湿、化痰祛湿食物，如薏米、赤小豆、冬瓜、荷叶、山楂、陈皮、白萝卜等', '适当运动，控制饮食，避免肥甘厚味，居住环境宜干燥'),
('shire', '湿热质', '湿热内蕴，面垢油光，易生痤疮', '面垢油光，易生痤疮，口苦口干，身重困倦，大便黏滞不畅或燥结，小便短黄，男性易阴囊潮湿，女性易带下增多，舌质偏红，苔黄腻，脉滑数', '多食用清热利湿食物，如绿豆、苦瓜、黄瓜、芹菜、西瓜、莲藕、梨等', '居住环境宜干燥通风，避免长时间处于潮湿环境，避免辛辣油腻食物，适当运动'),
('xueyu', '血瘀质', '血行不畅，肤色晦暗，舌质紫黯', '肤色晦暗，色素沉着，容易出现瘀斑，口唇黯淡，舌黯或有瘀点，舌下络脉紫黯或增粗，脉涩', '多食用活血化瘀食物，如黑豆、黄豆、山楂、香菇、茄子、油菜、木瓜等', '适当运动，促进血液循环，避免久坐不动，保持心情舒畅'),
('qiyu', '气郁质', '气机郁滞，神情抑郁，多愁善感', '神情抑郁，情感脆弱，烦闷不乐，舌淡红，苔薄白，脉弦', '多食用疏肝解郁食物，如萝卜、柑橘、玫瑰花、茉莉花、薄荷、荞麦、刀豆等', '保持心情舒畅，多参加集体活动，适当运动，避免精神刺激'),
('tebing', '特禀质', '先天失常，以生理缺陷、过敏反应等为主要特征', '过敏体质者常见哮喘、风疹、咽痒、鼻塞、喷嚏等；遗传性疾病有垂直遗传、先天性、家族性特征；胎传性疾病为母体影响胎儿个体生长发育及相关疾病特征', '避免食用过敏食物，如已知过敏原应避免接触；多食用营养丰富、清淡易消化食物', '避免接触过敏原，适当运动，增强体质，保持心情舒畅');

-- 插入医学知识
INSERT INTO medical_knowledge (category, subcategory, title, content, source) VALUES
('中医诊断', '面诊', '中医面诊学基础', '中医面诊是通过观察面部色泽、形态、纹理等变化来判断人体健康状况的诊断方法。面部分为不同区域，对应不同脏腑：额头-心，鼻头-脾，右脸颊-肺，左脸颊-肝，下巴-肾。面色红润有光泽为健康，面色苍白为气血不足，面色发红为热证，面色发黄为脾虚湿盛，面色发青为寒证或血瘀。', '中医诊断学'),
('中医诊断', '舌诊', '中医舌诊学基础', '中医舌诊是通过观察舌质、舌苔的变化来判断人体健康状况。舌质反映脏腑虚实，舌苔反映病邪性质和胃气强弱。正常舌质淡红润泽，舌苔薄白。舌质淡白为气血不足，舌质红为热证，舌质紫黯为血瘀。舌苔黄为热，舌苔白为寒，舌苔厚为邪盛，舌苔剥落为胃阴不足。', '中医诊断学'),
('西医诊断', '心血管', '高血压诊断标准', '高血压是指动脉血压持续升高为主要表现的慢性疾病。诊断标准：收缩压≥140mmHg和/或舒张压≥90mmHg。分级：轻度（140-159/90-99），中度（160-179/100-109），重度（≥180/110）。危险因素：年龄、肥胖、吸烟、饮酒、高盐饮食、缺乏运动、遗传等。', '中国高血压防治指南2023'),
('西医诊断', '内分泌', '糖尿病诊断标准', '糖尿病是一组以高血糖为特征的代谢性疾病。诊断标准：空腹血糖≥7.0mmol/L，或餐后2小时血糖≥11.1mmol/L，或HbA1c≥6.5%。类型：1型糖尿病（胰岛素依赖），2型糖尿病（非胰岛素依赖），妊娠期糖尿病。并发症：心血管疾病、肾病、视网膜病变、神经病变等。', '中国2型糖尿病防治指南2023'),
('康复医学', '体态', '体态评估标准', '正常体态应保持身体中线对齐，头部、肩部、臀部、膝盖、脚踝在一条垂直线上。常见不良体态：圆肩（胸大肌紧张，背阔肌无力）、驼背（脊柱后凸）、骨盆前倾（髋屈肌紧张，臀肌无力）、骨盆后倾（髋屈肌无力，臀肌紧张）、X型腿、O型腿等。评估方法：观察前后侧面体态，测量关节角度，分析肌肉力量和柔韧性。', '康复医学基础'),
('声音医学', '声学', '声音声学基础', '正常成年男性基频85-180Hz，女性165-255Hz。音调范围正常为1-2个八度。语速正常为120-160词/分钟。共鸣峰男性约500Hz，女性约800Hz。声强正常对话约60-70dB。呼吸频率12-20次/分钟。声音异常：气息音（声门闭合不全）、沙哑（声带粗糙）、紧绷（声带过度紧张）、双重音（声带振动不对称）。', '语音声学基础');
