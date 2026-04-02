import { NextRequest, NextResponse } from 'next/server';
import { getDb, LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// 九大体质定义
const CONSTITUTION_TYPES = {
  PINGHE: '平和质',
  QIXU: '气虚质',
  YANGXU: '阳虚质',
  YINXU: '阴虚质',
  TANSHI: '痰湿质',
  SHIRE: '湿热质',
  XUEYU: '血瘀质',
  QIYU: '气郁质',
  TEBING: '特禀质'
};

// 体质知识库
const CONSTITUTION_KNOWLEDGE_BASE = {
  [CONSTITUTION_TYPES.PINGHE]: {
    description: '阴阳气血调和，体态适中，面色红润，精力充沛',
    characteristics: [
      '体型匀称健壮',
      '面色红润光泽',
      '头发稠密有光泽',
      '精力充沛，不易疲劳',
      '耐受寒热，适应力强',
      '睡眠良好，饮食正常',
      '舌象淡红，苔薄白'
    ],
    causes: [
      '先天禀赋良好',
      '后天调养得当',
      '饮食起居有规律',
      '情志调畅',
      '适度运动'
    ],
    symptoms: [],
    diseases: [],
    psychology: [
      '性格开朗随和',
      '情绪稳定',
      '适应能力强'
    ],
    adaptation: [
      '对自然环境适应能力强',
      '耐受寒热变化',
      '不易生病'
    ],
    dietary: {
      beneficial: ['五谷杂粮', '新鲜蔬菜', '时令水果', '豆类制品', '适量肉类'],
      harmful: ['暴饮暴食', '偏食挑食', '过冷过热']
    },
    exercise: {
      recommended: ['慢跑', '游泳', '太极', '瑜伽', '球类运动'],
      intensity: '中等强度，有氧运动为主',
      frequency: '每周3-5次，每次30-60分钟'
    },
    lifestyle: {
      sleep: ['规律作息，早睡早起', '保证7-8小时睡眠', '避免熬夜'],
      environment: ['保持室内空气流通', '适宜温度湿度', '避免污染环境'],
      habits: ['保持良好卫生习惯', '适度劳作', '劳逸结合']
    },
    emotional: {
      characteristics: ['情绪稳定', '心态平和', '积极乐观'],
      management: ['保持乐观心态', '适度社交', '培养兴趣爱好']
    },
    seasonal: {
      spring: '顺应春季生发之气，宜舒展情志，适当增加户外活动',
      summer: '夏季宜清心养神，注意防暑降温，饮食清淡',
      autumn: '秋季宜润燥养肺，多饮水，防止秋燥',
      winter: '冬季宜保暖养肾，早睡晚起，注意防寒保暖'
    },
    tcm: {
      herbs: ['以保养为主，无需特殊药物'],
      acupoints: ['足三里', '三阴交', '关元', '气海'],
      therapy: ['四季养生', '按需调理']
    },
    prevention: {
      diseases: [],
      warnings: ['注意保持良好的生活习惯', '避免过度劳累'],
      checkups: ['年度健康体检']
    }
  },
  [CONSTITUTION_TYPES.QIXU]: {
    description: '元气不足，以疲乏、气短、自汗等气虚表现为主要特征',
    characteristics: [
      '肌肉松软，容易疲劳',
      '面色苍白或萎黄',
      '说话声音低弱',
      '活动后气喘吁吁',
      '容易出汗，稍动即汗',
      '容易感冒',
      '舌淡红，边有齿痕'
    ],
    causes: [
      '先天禀赋不足',
      '后天失养，如营养不良',
      '过度劳累',
      '久病耗气',
      '年老体衰'
    ],
    symptoms: [
      '容易疲劳，精神不振',
      '气短懒言',
      '自汗，动则益甚',
      '易感冒，反复发作',
      '消化功能差'
    ],
    diseases: [
      '易患感冒',
      '内脏下垂（胃下垂、子宫下垂等）',
      '慢性疲劳综合征',
      '低血压'
    ],
    psychology: [
      '性格内向，不喜冒险',
      '情绪不稳定，易抑郁',
      '容易焦虑'
    ],
    adaptation: [
      '不耐受寒邪、风邪',
      '易受外邪侵袭',
      '适应力较弱'
    ],
    dietary: {
      beneficial: ['山药', '莲子', '大枣', '桂圆', '鸡肉', '牛肉', '糯米', '小米'],
      harmful: ['空心菜', '生萝卜', '槟榔', '薄荷', '茶叶']
    },
    exercise: {
      recommended: ['散步', '太极拳', '八段锦', '瑜伽', '气功'],
      intensity: '低强度，循序渐进',
      frequency: '每天1-2次，每次15-30分钟'
    },
    lifestyle: {
      sleep: ['保证充足睡眠', '避免熬夜', '午休有助于恢复体力'],
      environment: ['保持室内温暖', '避免潮湿寒冷', '注意保暖'],
      habits: ['劳逸结合', '避免过度劳累', '规律作息']
    },
    emotional: {
      characteristics: ['容易焦虑', '缺乏自信', '情绪低落'],
      management: ['保持积极心态', '适度社交', '培养兴趣爱好', '避免过度思虑']
    },
    seasonal: {
      spring: '春季宜升阳益气，多晒太阳，适当运动',
      summer: '夏季宜清补，注意防暑，避免过度消耗体力',
      autumn: '秋季宜润肺益气，预防感冒，适当增加营养',
      winter: '冬季宜保暖养气，早睡晚起，减少户外活动'
    },
    tcm: {
      herbs: ['人参', '黄芪', '白术', '茯苓', '甘草', '山药'],
      acupoints: ['足三里', '关元', '气海', '百会', '膻中'],
      therapy: ['艾灸气海、关元', '推拿按摩', '拔罐祛寒']
    },
    prevention: {
      diseases: ['反复感冒', '内脏下垂', '慢性疲劳综合征'],
      warnings: ['注意预防感冒', '避免过度劳累', '出现内脏下垂症状及时就医'],
      checkups: ['定期体检', '关注消化系统功能', '监测血压']
    }
  },
  [CONSTITUTION_TYPES.YANGXU]: {
    description: '阳气不足，以畏寒怕冷、手足不温等虚寒表现为主要特征',
    characteristics: [
      '肌肉松软，容易疲劳',
      '平素畏冷，手脚冰凉',
      '喜热饮食，精神不振',
      '面色柔白或淡白',
      '容易出汗，动则益甚',
      '大便溏薄',
      '舌淡胖嫩，苔白润'
    ],
    causes: [
      '先天禀赋不足',
      '后天失养，如过食生冷',
      '久居寒湿之地',
      '过度劳累',
      '年老阳衰',
      '久病损伤阳气'
    ],
    symptoms: [
      '畏寒怕冷，手足不温',
      '喜热饮食',
      '精神不振',
      '容易疲劳',
      '大便溏薄',
      '小便清长'
    ],
    diseases: [
      '易患感冒',
      '水肿',
      '腹泻',
      '阳痿',
      '宫寒不孕'
    ],
    psychology: [
      '性格多沉静、内向',
      '情绪容易低落',
      '缺乏活力'
    ],
    adaptation: [
      '不耐受寒邪',
      '耐夏不耐冬',
      '易感受寒湿'
    ],
    dietary: {
      beneficial: ['羊肉', '牛肉', '鸡肉', '鹿肉', '韭菜', '生姜', '辣椒', '胡椒'],
      harmful: ['鸭肉', '兔肉', '西瓜', '苦瓜', '绿豆', '黄瓜']
    },
    exercise: {
      recommended: ['慢跑', '快走', '游泳', '八段锦', '太极拳'],
      intensity: '中等强度，以身体微热为佳',
      frequency: '每周3-4次，每次30-45分钟'
    },
    lifestyle: {
      sleep: ['保持充足睡眠', '注意保暖', '避免熬夜'],
      environment: ['保持室内温暖', '避免潮湿', '注意防寒'],
      habits: ['注意保暖', '避免受凉', '温水洗浴']
    },
    emotional: {
      characteristics: ['性格内向', '情绪低落', '缺乏自信'],
      management: ['保持积极心态', '增加社交活动', '培养兴趣爱好', '避免过度思虑']
    },
    seasonal: {
      spring: '春季宜温阳益气，多晒太阳，适当运动',
      summer: '夏季宜防暑降温，但避免过度贪凉',
      autumn: '秋季宜保暖养阳，注意防寒保暖',
      winter: '冬季宜温补阳气，早睡晚起，注意保暖'
    },
    tcm: {
      herbs: ['附子', '肉桂', '干姜', '杜仲', '淫羊藿', '补骨脂'],
      acupoints: ['关元', '气海', '足三里', '命门', '肾俞'],
      therapy: ['艾灸关元、气海', '拔罐祛寒', '推拿按摩']
    },
    prevention: {
      diseases: ['阳痿', '宫寒', '水肿', '慢性腹泻'],
      warnings: ['注意保暖', '避免受凉', '出现严重畏寒症状及时就医'],
      checkups: ['定期体检', '关注生殖系统健康', '监测体温']
    }
  },
  [CONSTITUTION_TYPES.YINXU]: {
    description: '阴液亏少，以口燥咽干、手足心热等虚热表现为主要特征',
    characteristics: [
      '体形多瘦长',
      '手足心热，易出汗',
      '面色潮红，有烘热感',
      '口燥咽干',
      '便秘尿黄',
      '眼睛干涩',
      '舌红少津，少苔或无苔'
    ],
    causes: [
      '先天禀赋不足',
      '后天失养，如过食辛辣燥热',
      '情志内伤，耗伤阴液',
      '久病耗阴',
      '房事过度'
    ],
    symptoms: [
      '手足心热，潮热盗汗',
      '口燥咽干',
      '便秘尿黄',
      '心烦易怒',
      '失眠多梦'
    ],
    diseases: [
      '易患便秘',
      '干燥综合征',
      '甲亢',
      '更年期综合征'
    ],
    psychology: [
      '性格急躁易怒',
      '容易心烦失眠',
      '情绪不稳定'
    ],
    adaptation: [
      '不耐热邪',
      '耐冬不耐夏',
      '不耐受燥邪'
    ],
    dietary: {
      beneficial: ['鸭肉', '猪肉', '甲鱼', '豆腐', '梨', '银耳', '百合', '绿豆'],
      harmful: ['羊肉', '狗肉', '韭菜', '辣椒', '胡椒', '生姜']
    },
    exercise: {
      recommended: ['游泳', '太极拳', '瑜伽', '散步', '气功'],
      intensity: '低中等强度，避免过度运动',
      frequency: '每周3-4次，每次20-40分钟'
    },
    lifestyle: {
      sleep: ['保证充足睡眠', '避免熬夜', '睡前放松'],
      environment: ['保持室内凉爽湿润', '避免干燥炎热', '注意通风'],
      habits: ['避免熬夜', '保持心情舒畅', '戒烟限酒']
    },
    emotional: {
      characteristics: ['性格急躁', '容易心烦', '情绪波动大'],
      management: ['保持心态平和', '学会放松', '培养耐心', '避免过度激动']
    },
    seasonal: {
      spring: '春季宜养阴润燥，多食滋润食物，避免情绪激动',
      summer: '夏季宜清凉养阴，注意防暑降温，保持心情平静',
      autumn: '秋季宜润肺养阴，多食润燥食物，预防秋燥',
      winter: '冬季宜滋阴潜阳，早睡晚起，避免过度劳累'
    },
    tcm: {
      herbs: ['沙参', '麦冬', '百合', '玉竹', '石斛', '枸杞子'],
      acupoints: ['三阴交', '太溪', '复溜', '阴陵泉', '血海'],
      therapy: ['滋阴降火', '推拿按摩', '针灸调理']
    },
    prevention: {
      diseases: ['便秘', '干燥综合征', '甲亢', '更年期综合征'],
      warnings: ['注意补充水分', '避免熬夜', '出现严重口干、便秘症状及时就医'],
      checkups: ['定期体检', '关注内分泌系统', '监测甲状腺功能']
    }
  },
  [CONSTITUTION_TYPES.TANSHI]: {
    description: '水液内停，痰湿凝聚，以体形肥胖、腹部肥满、口黏苔腻等痰湿表现为主要特征',
    characteristics: [
      '体形肥胖，腹部肥满松软',
      '面部皮肤油脂较多',
      '多汗且黏',
      '胸闷，痰多',
      '口黏腻或甜',
      '喜食肥甘甜黏',
      '苔腻，脉滑'
    ],
    causes: [
      '先天禀赋不足',
      '后天饮食不节',
      '缺乏运动',
      '情志内伤',
      '久居潮湿环境'
    ],
    symptoms: [
      '体型肥胖',
      '胸闷痰多',
      '身体沉重',
      '容易困倦',
      '口黏腻'
    ],
    diseases: [
      '易患高血压',
      '糖尿病',
      '高脂血症',
      '肥胖症'
    ],
    psychology: [
      '性格偏温和、稳重',
      '善于忍耐',
      '反应较慢'
    ],
    adaptation: [
      '对梅雨季节及湿重环境适应能力差',
      '易受湿邪侵袭'
    ],
    dietary: {
      beneficial: ['薏米', '冬瓜', '赤小豆', '荷叶', '山楂', '萝卜', '海带', '紫菜'],
      harmful: ['甜食', '油腻食物', '糯米', '石榴', '大枣']
    },
    exercise: {
      recommended: ['快走', '慢跑', '游泳', '健身操', '羽毛球'],
      intensity: '中等强度，必须坚持',
      frequency: '每周4-6次，每次40-60分钟'
    },
    lifestyle: {
      sleep: ['保持规律作息', '避免熬夜', '适当午休'],
      environment: ['保持室内干燥通风', '避免潮湿环境', '注意防潮'],
      habits: ['坚持运动', '控制饮食', '保持卫生']
    },
    emotional: {
      characteristics: ['性格温和', '反应较慢', '情绪稳定'],
      management: ['保持积极心态', '增加社交活动', '培养兴趣爱好', '避免过度思虑']
    },
    seasonal: {
      spring: '春季宜祛湿健脾，多食祛湿食物，适当运动',
      summer: '夏季宜清热祛湿，注意防暑降温，保持环境干燥',
      autumn: '秋季宜燥湿健脾，多食健脾食物，避免秋燥',
      winter: '冬季宜温阳祛湿，注意保暖，适当运动'
    },
    tcm: {
      herbs: ['陈皮', '半夏', '茯苓', '苍术', '厚朴', '泽泻'],
      acupoints: ['足三里', '丰隆', '中脘', '阴陵泉', '三阴交'],
      therapy: ['祛湿化痰', '拔罐祛湿', '推拿按摩']
    },
    prevention: {
      diseases: ['高血压', '糖尿病', '高脂血症', '肥胖症'],
      warnings: ['注意控制体重', '坚持运动', '出现胸闷、痰多症状及时就医'],
      checkups: ['定期体检', '监测血压血糖血脂', '关注体重变化']
    }
  },
  [CONSTITUTION_TYPES.SHIRE]: {
    description: '湿热内蕴，以面垢油光、口苦、苔黄腻等湿热表现为主要特征',
    characteristics: [
      '形体中等或偏胖',
      '容易面垢油光',
      '易生痤疮',
      '口苦口臭',
      '身重困倦',
      '大便黏滞不畅',
      '小便短黄',
      '男性易阴囊潮湿，女性带下增多',
      '舌质偏红，苔黄腻'
    ],
    causes: [
      '先天禀赋不足',
      '后天饮食不节',
      '嗜食辛辣肥甘',
      '长期饮酒',
      '情志内伤',
      '久居湿热环境'
    ],
    symptoms: [
      '面垢油光',
      '口苦口臭',
      '身体困重',
      '小便短黄',
      '易生痤疮'
    ],
    diseases: [
      '易患痤疮',
      '黄疸',
      '泌尿系统感染',
      '前列腺炎'
    ],
    psychology: [
      '容易心烦急躁',
      '情绪不稳定',
      '易怒'
    ],
    adaptation: [
      '对湿环境或气温偏高，尤其夏末秋初',
      '湿热交蒸气候较难适应'
    ],
    dietary: {
      beneficial: ['绿豆', '冬瓜', '苦瓜', '黄瓜', '芹菜', '莲藕', '薏米', '赤小豆'],
      harmful: ['辛辣', '油腻', '温热食物', '羊肉', '辣椒', '胡椒']
    },
    exercise: {
      recommended: ['跑步', '游泳', '健身操', '球类运动', '登山'],
      intensity: '中高强度，大量出汗',
      frequency: '每周4-6次，每次40-60分钟'
    },
    lifestyle: {
      sleep: ['保持规律作息', '避免熬夜', '保证充足睡眠'],
      environment: ['保持室内干燥通风', '避免湿热环境', '注意个人卫生'],
      habits: ['保持清洁', '多饮水', '避免久坐']
    },
    emotional: {
      characteristics: ['容易心烦', '情绪急躁', '易怒'],
      management: ['保持心态平和', '学会放松', '培养兴趣爱好', '避免过度激动']
    },
    seasonal: {
      spring: '春季宜清热祛湿，多食清热食物，保持心情舒畅',
      summer: '夏季宜清利湿热，注意防暑降温，多饮水',
      autumn: '秋季宜清热燥湿，预防秋燥，保持心情平和',
      winter: '冬季宜温阳祛湿，注意保暖，适当运动'
    },
    tcm: {
      herbs: ['黄连', '黄芩', '黄柏', '栀子', '茵陈', '车前草'],
      acupoints: ['足三里', '丰隆', '阴陵泉', '三阴交', '太冲'],
      therapy: ['清热祛湿', '拔罐祛湿', '推拿按摩']
    },
    prevention: {
      diseases: ['痤疮', '黄疸', '泌尿系统感染', '前列腺炎'],
      warnings: ['注意个人卫生', '避免久坐', '出现严重口苦、发热症状及时就医'],
      checkups: ['定期体检', '监测肝肾功能', '关注泌尿系统健康']
    }
  },
  [CONSTITUTION_TYPES.XUEYU]: {
    description: '血行不畅，以肤色晦黯、舌质紫黯等血瘀表现为主要特征',
    characteristics: [
      '肤色晦黯，色素沉着',
      '容易出现瘀斑',
      '口唇黯淡',
      '舌黯或有瘀点',
      '舌下络脉紫黯或增粗',
      '眼眶黯黑',
      '鼻部黯滞'
    ],
    causes: [
      '先天禀赋不足',
      '后天情志内伤',
      '久病入络',
      '外伤',
      '寒邪凝滞'
    ],
    symptoms: [
      '肤色晦黯',
      '易有瘀斑',
      '口唇黯淡',
      '舌质紫黯',
      '女性痛经、闭经'
    ],
    diseases: [
      '易患肿瘤',
      '冠心病',
      '中风',
      '痛经、闭经'
    ],
    psychology: [
      '性格内郁',
      '心情不快易烦',
      '急躁健忘'
    ],
    adaptation: [
      '不耐受寒邪',
      '易感受寒邪',
      '对寒冷环境适应能力差'
    ],
    dietary: {
      beneficial: ['山楂', '桃仁', '红花', '当归', '川芎', '玫瑰花', '黑木耳'],
      harmful: ['寒凉食物', '冰镇饮料', '肥甘厚味']
    },
    exercise: {
      recommended: ['跑步', '游泳', '健身操', '球类运动', '舞蹈'],
      intensity: '中等强度，促进血液循环',
      frequency: '每周4-5次，每次30-50分钟'
    },
    lifestyle: {
      sleep: ['保持规律作息', '避免熬夜', '保证充足睡眠'],
      environment: ['保持室内温暖', '避免寒冷环境', '注意保暖'],
      habits: ['注意保暖', '避免久坐', '适当运动']
    },
    emotional: {
      characteristics: ['性格内郁', '容易烦躁', '情绪不稳'],
      management: ['保持心情舒畅', '学会放松', '培养兴趣爱好', '避免过度思虑']
    },
    seasonal: {
      spring: '春季宜活血化瘀，多食活血食物，保持心情舒畅',
      summer: '夏季宜清凉活血，注意防暑降温，保持心情平和',
      autumn: '秋季宜养血活血，预防秋燥，注意保暖',
      winter: '冬季宜温阳活血，早睡晚起，注意保暖'
    },
    tcm: {
      herbs: ['丹参', '桃仁', '红花', '当归', '川芎', '赤芍'],
      acupoints: ['三阴交', '血海', '太冲', '合谷', '膈俞'],
      therapy: ['活血化瘀', '拔罐祛瘀', '推拿按摩', '针灸调理']
    },
    prevention: {
      diseases: ['冠心病', '中风', '肿瘤', '痛经、闭经'],
      warnings: ['注意保暖', '避免久坐', '出现严重瘀斑、疼痛症状及时就医'],
      checkups: ['定期体检', '监测心血管健康', '关注血液循环']
    }
  },
  [CONSTITUTION_TYPES.QIYU]: {
    description: '气机郁滞，以神情抑郁、忧虑脆弱等气郁表现为主要特征',
    characteristics: [
      '性格内向不稳定',
      '忧郁脆弱',
      '敏感多疑',
      '神情抑郁',
      '多愁善感',
      '胸闷不舒',
      '舌淡红，苔薄白'
    ],
    causes: [
      '先天禀赋不足',
      '后天情志内伤',
      '精神刺激',
      '所欲不遂',
      '久病郁结'
    ],
    symptoms: [
      '神情抑郁',
      '多愁善感',
      '胸闷不舒',
      '胁肋胀痛',
      '善太息'
    ],
    diseases: [
      '易患抑郁症',
      '失眠',
      '梅核气',
      '乳腺增生'
    ],
    psychology: [
      '性格内向不稳定',
      '忧郁脆弱',
      '敏感多疑'
    ],
    adaptation: [
      '对精神刺激适应能力较差',
      '不喜欢阴雨天气'
    ],
    dietary: {
      beneficial: ['佛手', '橙子', '柑皮', '荞麦', '韭菜', '大蒜', '萝卜'],
      harmful: ['寒凉食物', '肥甘厚味', '辛辣刺激']
    },
    exercise: {
      recommended: ['跑步', '游泳', '健身操', '球类运动', '舞蹈'],
      intensity: '中等强度，心情愉悦的运动',
      frequency: '每周4-5次，每次30-50分钟'
    },
    lifestyle: {
      sleep: ['保持规律作息', '避免熬夜', '保证充足睡眠'],
      environment: ['保持室内明亮', '避免阴暗环境', '多晒太阳'],
      habits: ['多社交', '培养兴趣爱好', '保持心情舒畅']
    },
    emotional: {
      characteristics: ['性格内向', '情绪低落', '敏感多疑'],
      management: ['保持积极心态', '增加社交活动', '培养兴趣爱好', '学会释放压力']
    },
    seasonal: {
      spring: '春季宜疏肝解郁，多食疏肝食物，保持心情舒畅',
      summer: '夏季宜清心解郁，注意防暑降温，保持心情平和',
      autumn: '秋季宜养肝解郁，预防秋燥，保持心情舒畅',
      winter: '冬季宜温阳解郁，早睡晚起，注意保暖'
    },
    tcm: {
      herbs: ['柴胡', '香附', '郁金', '陈皮', '枳壳', '佛手'],
      acupoints: ['太冲', '内关', '膻中', '期门', '三阴交'],
      therapy: ['疏肝解郁', '推拿按摩', '针灸调理']
    },
    prevention: {
      diseases: ['抑郁症', '失眠', '梅核气', '乳腺增生'],
      warnings: ['注意心理健康', '及时疏导情绪', '出现严重抑郁症状及时就医'],
      checkups: ['定期体检', '监测心理健康', '关注情绪变化']
    }
  },
  [CONSTITUTION_TYPES.TEBING]: {
    description: '先天失常，以生理缺陷、过敏反应等为主要特征',
    characteristics: [
      '先天失常',
      '以过敏反应为主',
      '容易过敏',
      '哮喘',
      '风疹',
      '咽痒',
      '鼻塞',
      '喷嚏'
    ],
    causes: [
      '先天禀赋不足',
      '遗传因素',
      '环境因素',
      '免疫异常'
    ],
    symptoms: [
      '容易过敏',
      '哮喘',
      '风疹',
      '咽痒',
      '鼻塞',
      '喷嚏'
    ],
    diseases: [
      '易患过敏性鼻炎',
      '过敏性哮喘',
      '湿疹',
      '荨麻疹'
    ],
    psychology: [
      '缺乏自信',
      '敏感多疑',
      '情绪不稳定'
    ],
    adaptation: [
      '适应能力较差',
      '对过敏原敏感',
      '季节变化影响明显'
    ],
    dietary: {
      beneficial: ['蜂蜜', '红枣', '灵芝', '胡萝卜', '南瓜', '丝瓜'],
      harmful: ['辛辣', '海鲜', '发物', '花粉过敏者避免花粉食物']
    },
    exercise: {
      recommended: ['慢跑', '游泳', '太极', '瑜伽', '散步'],
      intensity: '中等强度，循序渐进',
      frequency: '每周3-5次，每次20-40分钟'
    },
    lifestyle: {
      sleep: ['保持规律作息', '避免熬夜', '保证充足睡眠'],
      environment: ['保持室内清洁', '避免过敏原', '注意空气质量'],
      habits: ['避免接触过敏原', '保持清洁', '增强免疫力']
    },
    emotional: {
      characteristics: ['缺乏自信', '敏感多疑', '情绪不稳定'],
      management: ['保持积极心态', '增加自信', '培养兴趣爱好', '学会应对过敏']
    },
    seasonal: {
      spring: '春季宜防过敏，远离过敏原，增强免疫力',
      summer: '夏季宜清凉解暑，注意防暑降温，保持环境清洁',
      autumn: '秋季宜防过敏，预防秋燥，增强免疫力',
      winter: '冬季宜保暖防寒，早睡晚起，注意保暖'
    },
    tcm: {
      herbs: ['黄芪', '防风', '白术', '灵芝', '五味子', '淫羊藿'],
      acupoints: ['足三里', '肺俞', '脾俞', '肾俞', '关元'],
      therapy: ['扶正固本', '推拿按摩', '艾灸调理']
    },
    prevention: {
      diseases: ['过敏性鼻炎', '过敏性哮喘', '湿疹', '荨麻疹'],
      warnings: ['避免接触过敏原', '增强免疫力', '出现严重过敏症状及时就医'],
      checkups: ['定期体检', '监测过敏指标', '关注免疫系统']
    }
  }
};

// GET /api/constitution-analysis - 获取体质分析数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      // 如果没有userId，尝试从localStorage获取（仅用于演示）
      return NextResponse.json({
        success: false,
        error: '请提供用户ID'
      }, { status: 400 });
    }

    const db = await getDb();

    // 获取最新的体质分析
    const latestAnalysis = await db.execute(sql`
      SELECT * FROM constitution_analyses
      WHERE user_id = ${userId}
      ORDER BY analysis_date DESC
      LIMIT 1
    `);

    // 获取历史记录
    const historyResult = await db.execute(sql`
      SELECT * FROM constitution_analyses
      WHERE user_id = ${userId}
      ORDER BY analysis_date DESC
      LIMIT 10
    `);

    const analysis = latestAnalysis.rows?.[0];
    const history = historyResult.rows || [];

    return NextResponse.json({
      success: true,
      analysis: analysis ? {
        primaryConstitution: analysis.primary_constitution,
        secondaryConstitutions: analysis.secondary_constituents,
        confidence: analysis.confidence,
        analysisDate: analysis.analysis_date,
        scores: analysis.scores,
        features: analysis.features,
        riskFactors: analysis.risk_factors,
        improvementPotential: analysis.improvement_potential
      } : null,
      history: history.map((h: any) => ({
        primaryConstitution: h.primary_constitution,
        secondaryConstitutions: h.secondary_constituents,
        confidence: h.confidence,
        analysisDate: h.analysis_date,
        scores: h.scores,
        features: h.features,
        riskFactors: h.risk_factors,
        improvementPotential: h.improvement_potential
      })),
      details: CONSTITUTION_KNOWLEDGE_BASE
    });
  } catch (error) {
    console.error('[ConstitutionAnalysis] 获取失败:', error);
    return NextResponse.json(
      { error: '获取体质分析失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/constitution-analysis - 创建体质分析
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请提供用户ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 获取用户的各项检测数据
    const faceRecords = await db.execute(sql`
      SELECT constitution FROM face_diagnosis_records
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const tongueRecords = await db.execute(sql`
      SELECT constitution FROM tongue_diagnosis_records
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const postureRecords = await db.execute(sql`
      SELECT tcm_analysis FROM posture_assessments
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // 获取健康问卷数据
    const questionnaireData = await db.execute(sql`
      SELECT * FROM health_questionnaires
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `);

    // 获取体质问卷数据
    const constitutionQuestionnaireData = await db.execute(sql`
      SELECT * FROM constitution_questionnaires
      WHERE user_id = ${userId}
      ORDER BY questionnaire_date DESC
      LIMIT 1
    `);

    // 执行体质分析
    const analysisResult = await performConstitutionAnalysis({
      face: faceRecords.rows || [],
      tongue: tongueRecords.rows || [],
      posture: postureRecords.rows || [],
      questionnaire: questionnaireData.rows?.[0] || null,
      constitutionQuestionnaire: constitutionQuestionnaireData.rows?.[0] || null
    });

    // 保存分析结果
    const analysisId = crypto.randomUUID();
    await db.execute(sql`
      INSERT INTO constitution_analyses (
        id, user_id, primary_constitution, secondary_constituents,
        confidence, scores, features, risk_factors, improvement_potential,
        data_sources, analysis_date
      ) VALUES (
        ${analysisId}, ${userId}, ${analysisResult.primaryConstitution},
        ${JSON.stringify(analysisResult.secondaryConstitutions)},
        ${analysisResult.confidence}, ${JSON.stringify(analysisResult.scores)},
        ${JSON.stringify(analysisResult.features)},
        ${sql.raw(analysisResult.riskFactors.length > 0 ? `ARRAY[${analysisResult.riskFactors.map((r: string) => `'${r}'`).join(',')}]` : 'ARRAY[]::TEXT[]')},
        ${analysisResult.improvementPotential},
        ${JSON.stringify(analysisResult.dataSources)},
        NOW()
      )
    `);

    // 获取历史记录
    const historyResult = await db.execute(sql`
      SELECT * FROM constitution_analyses
      WHERE user_id = ${userId}
      ORDER BY analysis_date DESC
      LIMIT 10
    `);

    const history = historyResult.rows || [];

    return NextResponse.json({
      success: true,
      analysis: {
        primaryConstitution: analysisResult.primaryConstitution,
        secondaryConstitutions: analysisResult.secondaryConstitutions,
        confidence: analysisResult.confidence,
        analysisDate: new Date().toISOString(),
        scores: analysisResult.scores,
        features: analysisResult.features,
        riskFactors: analysisResult.riskFactors,
        improvementPotential: analysisResult.improvementPotential
      },
      history: history.map((h: any) => ({
        primaryConstitution: h.primary_constitution,
        secondaryConstitutions: h.secondary_constituents,
        confidence: h.confidence,
        analysisDate: h.analysis_date,
        scores: h.scores,
        features: h.features,
        riskFactors: h.risk_factors,
        improvementPotential: h.improvement_potential
      })),
      details: CONSTITUTION_KNOWLEDGE_BASE
    });
  } catch (error) {
    console.error('[ConstitutionAnalysis] 分析失败:', error);
    return NextResponse.json(
      { error: '体质分析失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 体质分析算法
async function performConstitutionAnalysis(data: any): Promise<any> {
  const scores: Record<string, number> = {};
  const constitutionMap: Record<string, number> = {};

  // 初始化评分
  Object.values(CONSTITUTION_TYPES).forEach(type => {
    scores[type] = 0;
  });

  // 收集面诊体质数据
  if (data.face && data.face.length > 0) {
    data.face.forEach((record: any) => {
      const constitution = record.constitution;
      if (constitution && constitution.type) {
        scores[constitution.type] += 30; // 面诊权重30%
        constitutionMap[constitution.type] = (constitutionMap[constitution.type] || 0) + 1;
      }
    });
  }

  // 收集舌诊体质数据
  if (data.tongue && data.tongue.length > 0) {
    data.tongue.forEach((record: any) => {
      const constitution = record.constitution;
      if (constitution && constitution.primary) {
        scores[constitution.primary] += 30; // 舌诊权重30%
        if (constitution.secondary) {
          scores[constitution.secondary] += 15; // 次要体质权重15%
        }
      }
    });
  }

  // 收集体态体质数据
  if (data.posture && data.posture.length > 0) {
    data.posture.forEach((record: any) => {
      const tcmAnalysis = record.tcm_analysis;
      if (tcmAnalysis) {
        // 尝试从 tcm_analysis 中提取体质信息
        if (typeof tcmAnalysis === 'string') {
          // 如果是字符串，尝试解析 JSON
          try {
            const parsed = JSON.parse(tcmAnalysis);
            if (parsed.constitution) {
              scores[parsed.constitution] += 20;
            } else if (parsed.body_type) {
              scores[parsed.body_type] += 20;
            }
          } catch (e) {
            // 解析失败，忽略
          }
        } else if (typeof tcmAnalysis === 'object') {
          // 如果是对象，直接读取
          if (tcmAnalysis.constitution) {
            scores[tcmAnalysis.constitution] += 20;
          } else if (tcmAnalysis.body_type) {
            scores[tcmAnalysis.body_type] += 20;
          }
        }
      }
    });
  }

  // 基于健康问卷进行补充评分
  if (data.questionnaire) {
    const q = data.questionnaire;

    // 气虚质特征
    if (q.symptoms && q.symptoms.some((s: string) => s.includes('乏力') || s.includes('疲劳'))) {
      scores[CONSTITUTION_TYPES.QIXU] += 20;
    }

    // 阳虚质特征
    if (q.symptoms && q.symptoms.some((s: string) => s.includes('怕冷') || s.includes('手脚冰凉'))) {
      scores[CONSTITUTION_TYPES.YANGXU] += 20;
    }

    // 阴虚质特征
    if (q.symptoms && q.symptoms.some((s: string) => s.includes('盗汗') || s.includes('口干'))) {
      scores[CONSTITUTION_TYPES.YINXU] += 20;
    }

    // 痰湿质特征
    if (q.hasHypertension || q.hasHyperlipidemia) {
      scores[CONSTITUTION_TYPES.TANSHI] += 15;
    }

    // 湿热质特征
    if (q.symptoms && q.symptoms.some((s: string) => s.includes('油腻') || s.includes('口苦'))) {
      scores[CONSTITUTION_TYPES.SHIRE] += 15;
    }
  }

  // 基于体质问卷进行评分（权重最高）
  if (data.constitutionQuestionnaire) {
    const cq = data.constitutionQuestionnaire;
    const cqScores = cq.scores || {};

    // 体质问卷的得分已经是转化分（0-100），直接使用
    // 但由于这是最准确的数据，给予更高的权重
    Object.entries(cqScores).forEach(([type, score]) => {
      if (CONSTITUTION_TYPES[type as keyof typeof CONSTITUTION_TYPES]) {
        const constitutionName = CONSTITUTION_TYPES[type as keyof typeof CONSTITUTION_TYPES];
        // 体质问卷权重50%（比其他检测方式更高）
        scores[constitutionName] += (score as number) * 0.5;
      }
    });
  }

  // 归一化评分到0-100
  const maxScore = Math.max(...Object.values(scores), 1);
  Object.keys(scores).forEach(key => {
    scores[key] = Math.round((scores[key] / maxScore) * 100);
  });

  // 如果没有数据，默认给平和质一个基础分
  if (maxScore === 0) {
    scores[CONSTITUTION_TYPES.PINGHE] = 50;
  }

  // 重新计算最大值和归一化
  const newMaxScore = Math.max(...Object.values(scores), 1);
  Object.keys(scores).forEach(key => {
    scores[key] = Math.round((scores[key] / newMaxScore) * 100);
  });

  // 确定主体质
  const sortedConstitutions = Object.entries(scores)
    .sort(([, a], [, b]) => b - a) as [string, number][];

  const primaryConstitution = sortedConstitutions[0][0];
  const secondaryConstitutions = sortedConstitutions
    .slice(1, 4)
    .filter(([, score]) => score > 30)
    .map(([type]) => type);

  // 计算置信度
  const confidence = Math.min(
    Math.round(sortedConstitutions[0][1] + (secondaryConstitutions.length > 0 ? 10 : 0)),
    100
  );

  // 计算改善潜力（基于分数，分数越低潜力越大）
  const improvementPotential = Math.max(0, 100 - sortedConstitutions[0][1]);

  // 生成特征分析
  const features: Record<string, string[]> = {};
  features['体质表现'] = CONSTITUTION_KNOWLEDGE_BASE[primaryConstitution].characteristics.slice(0, 3);
  features['典型症状'] = CONSTITUTION_KNOWLEDGE_BASE[primaryConstitution].symptoms.slice(0, 3);

  // 风险因子
  const riskFactors = CONSTITUTION_KNOWLEDGE_BASE[primaryConstitution].diseases;

  // 数据来源
  const dataSources: Record<string, boolean> = {
    面诊: data.face && data.face.length > 0,
    舌诊: data.tongue && data.tongue.length > 0,
    体态: data.posture && data.posture.length > 0,
    健康问卷: !!data.questionnaire,
    体质问卷: !!data.constitutionQuestionnaire
  };

  return {
    primaryConstitution,
    secondaryConstitutions,
    confidence,
    scores,
    features,
    riskFactors,
    improvementPotential,
    dataSources
  };
}
