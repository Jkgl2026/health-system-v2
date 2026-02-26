// utils/health-data.js - 健康数据常量

/**
 * 身体语言简表100项
 */
const BODY_SYMPTOMS = [
  { id: 1, name: '记忆力下降', category: '神经系统', description: '经常忘记近期的事情，需要反复提醒' },
  { id: 2, name: '思维断电', category: '神经系统', description: '说话或思考时突然空白，想不起来要说什么' },
  { id: 3, name: '反应迟钝', category: '神经系统', description: '理解能力和反应速度变慢' },
  { id: 4, name: '嗜睡', category: '神经系统', description: '白天精神不振，总是想睡觉' },
  { id: 5, name: '多梦', category: '神经系统', description: '睡眠中梦境不断，醒来后感觉疲惫' },
  { id: 6, name: '头晕', category: '神经系统', description: '头部感觉昏沉或眩晕' },
  { id: 7, name: '头疼', category: '神经系统', description: '经常出现头痛症状' },
  { id: 8, name: '头麻', category: '神经系统', description: '头部有麻木的感觉' },
  { id: 9, name: '晕车', category: '神经系统', description: '乘车时容易出现恶心、头晕等不适' },
  { id: 10, name: '失眠', category: '神经系统', description: '入睡困难或睡眠质量差，易醒' },
  { id: 11, name: '头面油腻', category: '皮肤', description: '面部和头部容易出油' },
  { id: 12, name: '脱发', category: '皮肤', description: '头发掉落增多，头发变稀' },
  { id: 13, name: '头发稀少', category: '皮肤', description: '头发稀疏，发量明显减少' },
  { id: 14, name: '易打哈欠', category: '神经系统', description: '经常不自觉地打哈欠，精神不济' },
  { id: 15, name: '常叹气', category: '神经系统', description: '不自觉地长叹气，感觉气不够用' },
  { id: 16, name: '眼干涩', category: '五官', description: '眼睛干涩不适，需要频繁眨眼' },
  { id: 17, name: '眼痒', category: '五官', description: '眼睛发痒，想揉眼睛' },
  { id: 18, name: '眼痛', category: '五官', description: '眼睛有疼痛感或酸痛感' },
  { id: 19, name: '视力模糊', category: '五官', description: '看东西不清晰，视力下降' },
  { id: 20, name: '黑痣变大变多', category: '皮肤', description: '身上的黑痣数量增多或变大' },
  { id: 21, name: '眼怕光流泪', category: '五官', description: '眼睛怕光，遇光容易流泪' },
  { id: 22, name: '麦粒肿', category: '五官', description: '眼睑边缘出现红肿硬结' },
  { id: 23, name: '听力下降', category: '五官', description: '听力不如以前，需要大声说话才能听见' },
  { id: 24, name: '耳痒', category: '五官', description: '耳朵内部或外部发痒' },
  { id: 25, name: '耳鸣', category: '五官', description: '耳朵里有嗡嗡声或其他异常声音' },
  { id: 26, name: '耳痛', category: '五官', description: '耳朵内部或外部有疼痛感' },
  { id: 27, name: '耳屎多', category: '五官', description: '耳屎分泌过多' },
  { id: 28, name: '耳内潮湿', category: '五官', description: '耳朵内部感觉潮湿不适' },
  { id: 29, name: '打鼾', category: '呼吸系统', description: '睡觉时打呼噜，声音较大' },
  { id: 30, name: '鼻塞', category: '五官', description: '鼻孔堵塞，呼吸不畅' },
  { id: 31, name: '爱打喷嚏', category: '呼吸系统', description: '经常不自觉地打喷嚏' },
  { id: 32, name: '常流鼻涕', category: '呼吸系统', description: '鼻腔经常有鼻涕流出' },
  { id: 33, name: '鼻炎', category: '呼吸系统', description: '患有鼻炎，鼻塞、流涕等症状反复' },
  { id: 34, name: '感冒时间长', category: '免疫系统', description: '感冒后恢复慢，持续时间长' },
  { id: 35, name: '嗓子干', category: '呼吸系统', description: '咽喉部位干燥不适' },
  { id: 36, name: '喉咙痒', category: '呼吸系统', description: '喉咙发痒，想咳嗽' },
  { id: 37, name: '喉咙痛', category: '呼吸系统', description: '喉咙有疼痛感，吞咽时加重' },
  { id: 38, name: '咳嗽', category: '呼吸系统', description: '经常咳嗽，干咳或有痰' },
  { id: 39, name: '痰多', category: '呼吸系统', description: '咳嗽时有大量痰液' },
  { id: 40, name: '呼吸困难', category: '呼吸系统', description: '呼吸感觉费力，气不够用' },
  { id: 41, name: '口苦', category: '消化系统', description: '口腔内有苦味' },
  { id: 42, name: '口干', category: '消化系统', description: '口腔干燥，口渴明显' },
  { id: 43, name: '口臭', category: '消化系统', description: '口腔异味，口气不清新' },
  { id: 44, name: '口溃疡', category: '消化系统', description: '口腔内出现溃疡性病变' },
  { id: 45, name: '舌溃疡', category: '消化系统', description: '舌头上出现溃疡' },
  { id: 46, name: '嘴唇麻', category: '消化系统', description: '嘴唇有麻木感' },
  { id: 47, name: '舌硬', category: '消化系统', description: '舌头僵硬，活动不便' },
  { id: 48, name: '胸闷气短', category: '循环系统', description: '胸部感觉憋闷，呼吸急促' },
  { id: 49, name: '心慌心悸', category: '循环系统', description: '心跳加快或不规律，感觉心慌' },
  { id: 50, name: '心绞痛', category: '循环系统', description: '胸部突然出现疼痛，压迫感' },
  { id: 51, name: '指甲凹陷', category: '皮肤', description: '指甲表面出现凹陷或改变' },
  { id: 52, name: '半月痕少', category: '皮肤', description: '指甲根部的半月痕很少或没有' },
  { id: 53, name: '手脚脱皮', category: '皮肤', description: '手掌或脚掌皮肤脱皮' },
  { id: 54, name: '手脚出汗', category: '皮肤', description: '手掌或脚掌容易出汗' },
  { id: 55, name: '手脚凉', category: '循环系统', description: '手脚冰凉，尤其冬季更明显' },
  { id: 56, name: '手脚热', category: '循环系统', description: '手脚发热，感觉烫手' },
  { id: 57, name: '手足麻木', category: '循环系统', description: '手或脚有麻木感' },
  { id: 58, name: '四肢乏力', category: '神经系统', description: '手脚无力，提不起东西' },
  { id: 59, name: '静脉曲张', category: '循环系统', description: '腿部静脉血管突出，呈蚯蚓状' },
  { id: 60, name: '关节痛', category: '循环系统', description: '关节部位出现疼痛' },
  { id: 61, name: '肩酸痛', category: '循环系统', description: '肩膀酸痛不适' },
  { id: 62, name: '颈椎痛', category: '循环系统', description: '颈部疼痛，活动受限' },
  { id: 63, name: '腰酸痛', category: '循环系统', description: '腰部酸痛，长时间站立或坐立加重' },
  { id: 64, name: '尿浑浊', category: '泌尿系统', description: '尿液颜色浑浊不清' },
  { id: 65, name: '尿多沫', category: '泌尿系统', description: '尿液表面有很多泡沫' },
  { id: 66, name: '尿有怪味', category: '泌尿系统', description: '尿液有异常气味' },
  { id: 67, name: '夜尿多', category: '泌尿系统', description: '夜间需要多次起夜排尿' },
  { id: 68, name: '便秘', category: '消化系统', description: '排便困难，大便干燥，次数减少' },
  { id: 69, name: '大便不成形', category: '消化系统', description: '大便稀软，不成形' },
  { id: 70, name: '便溏不净', category: '消化系统', description: '大便粘腻，排不干净' },
  { id: 71, name: '高血脂', category: '循环系统', description: '血液中血脂含量偏高' },
  { id: 72, name: '高血压', category: '循环系统', description: '血压偏高，超过正常范围' },
  { id: 73, name: '高血糖', category: '循环系统', description: '血糖偏高，或已被诊断为糖尿病' },
  { id: 74, name: '低血糖', category: '循环系统', description: '血糖偏低，易出现头晕、出汗' },
  { id: 75, name: '低血压', category: '循环系统', description: '血压偏低，易出现头晕乏力' },
  { id: 76, name: '经期头痛', category: '妇科', description: '月经期间出现头痛' },
  { id: 77, name: '月经量少', category: '妇科', description: '月经量明显减少' },
  { id: 78, name: '经期时长', category: '妇科', description: '月经持续时间过长或过短' },
  { id: 79, name: '经期推后', category: '妇科', description: '月经周期推迟，超过正常范围' },
  { id: 80, name: '月经有血块', category: '妇科', description: '经血中伴有血块' },
  { id: 81, name: '乳腺增生', category: '妇科', description: '乳房有增生性结节或肿块' },
  { id: 82, name: '经期腰痛', category: '妇科', description: '月经期间腰部疼痛不适' },
  { id: 83, name: '经期提前', category: '妇科', description: '月经周期提前，少于正常范围' },
  { id: 84, name: '月经量多', category: '妇科', description: '月经量明显增多' },
  { id: 85, name: '不爱说话', category: '情绪', description: '不愿意主动交流，变得沉默寡言' },
  { id: 86, name: '恶心', category: '消化系统', description: '胃部不适，有想呕吐的感觉' },
  { id: 87, name: '胃胀', category: '消化系统', description: '胃部感觉胀满不适' },
  { id: 88, name: '胃酸', category: '消化系统', description: '胃酸过多，反酸烧心' },
  { id: 89, name: '胃痛', category: '消化系统', description: '胃部有疼痛感' },
  { id: 90, name: '消化不良', category: '消化系统', description: '进食后消化慢，胃胀不适' },
  { id: 91, name: '肥胖', category: '代谢', description: '体重超出正常范围，体型偏胖' },
  { id: 92, name: '皮肤痒', category: '皮肤', description: '皮肤经常瘙痒，想抓挠' },
  { id: 93, name: '湿疹', category: '皮肤', description: '皮肤出现湿疹，红肿瘙痒' },
  { id: 94, name: '各种过敏', category: '免疫系统', description: '对某些食物、药物或环境过敏' },
  { id: 95, name: '痤疮', category: '皮肤', description: '面部或身体出现痤疮（痘痘）' },
  { id: 96, name: '脂肪瘤', category: '代谢', description: '皮下出现脂肪瘤肿块' },
  { id: 97, name: '身体异味', category: '代谢', description: '身体有异常气味，如体味重' },
  { id: 98, name: '淋巴肿大', category: '免疫系统', description: '颈部或身体其他部位淋巴结肿大' },
  { id: 99, name: '眼屎多', category: '五官', description: '晨起时眼部分泌物增多' },
  { id: 100, name: '形体消瘦', category: '代谢', description: '体重明显低于正常范围，体型偏瘦' },
];

/**
 * 按分类分组的身体语言简表
 */
const BODY_SYMPTOMS_BY_CATEGORY = {};
BODY_SYMPTOMS.forEach(item => {
  if (!BODY_SYMPTOMS_BY_CATEGORY[item.category]) {
    BODY_SYMPTOMS_BY_CATEGORY[item.category] = [];
  }
  BODY_SYMPTOMS_BY_CATEGORY[item.category].push(item);
});

/**
 * 不良生活习惯分类
 */
const BAD_HABITS_CATEGORIES = ['饮食', '睡觉', '寒湿', '情绪', '运动', '毒素', '生活'];

/**
 * 不良生活习惯 - 饮食类
 */
const BAD_HABITS_DIET = [
  { id: 1, habit: '经常不吃早餐', impact: '脾胃受损，气血生化不足' },
  { id: 2, habit: '8点后吃晚饭', impact: '加重脾胃负担，影响消化' },
  { id: 3, habit: '吃夜宵', impact: '加重脾胃负担，影响消化' },
  { id: 4, habit: '吃饭过饱', impact: '脾胃功能紊乱' },
  { id: 5, habit: '吃饭过急', impact: '脾胃功能紊乱' },
  { id: 6, habit: '吃饭过快', impact: '脾胃功能紊乱' },
  { id: 7, habit: '吃饭过少', impact: '脾胃功能紊乱' },
  { id: 8, habit: '常在外面吃饭', impact: '饮食不卫生' },
  { id: 9, habit: '常点外卖', impact: '油脂过多' },
  { id: 10, habit: '常吃剩饭剩菜', impact: '亚硝酸盐摄入过多' },
  { id: 11, habit: '常吃动物内脏', impact: '胆固醇摄入过多' },
  { id: 12, habit: '常吃肉食', impact: '血脂升高' },
  { id: 13, habit: '吃菜喜油多', impact: '血液粘稠' },
  { id: 14, habit: '吃东西偏辣', impact: '刺激肠胃' },
  { id: 15, habit: '吃东西偏咸(口味重)', impact: '增加肾脏负担' },
  { id: 16, habit: '很少吃蔬菜', impact: '维生素、纤维素摄入不足' },
  { id: 17, habit: '素食者', impact: '维生素、纤维素摄入不足' },
  { id: 18, habit: '喜欢吃烫食', impact: '损伤食道和胃黏膜' },
  { id: 19, habit: '喝烫水', impact: '损伤食道和胃黏膜' },
  { id: 20, habit: '喜精米', impact: '营养单一，缺乏微量元素' },
  { id: 21, habit: '喜精面', impact: '营养单一，缺乏微量元素' },
  { id: 22, habit: '喜主食', impact: '营养单一，缺乏微量元素' },
  { id: 23, habit: '很少吃五谷杂粮', impact: '膳食纤维和B族维生素不足' },
  { id: 24, habit: '偏食', impact: '营养不均衡' },
  { id: 25, habit: '挑食', impact: '营养不均衡' },
  { id: 26, habit: '嗜吃某种食物', impact: '营养不均衡' },
  { id: 27, habit: '常喝酒', impact: '损伤肝脏，增加心血管疾病风险' },
  { id: 28, habit: '酗酒', impact: '损伤肝脏，增加心血管疾病风险' },
  { id: 29, habit: '喝冰啤酒', impact: '损伤肝脏，增加心血管疾病风险' },
  { id: 30, habit: '喜饭后吃水果', impact: '影响消化，血糖波动' },
  { id: 31, habit: '吃过量水果', impact: '影响消化，血糖波动' },
  { id: 32, habit: '爱吃反季节蔬菜', impact: '可能含有催熟剂和农药' },
  { id: 33, habit: '爱吃反季节水果', impact: '可能含有催熟剂和农药' },
  { id: 34, habit: '喜欢吃螃蟹', impact: '寒凉伤胃，影响消化' },
  { id: 35, habit: '喜欢吃柿子', impact: '寒凉伤胃，影响消化' },
  { id: 36, habit: '不吃坚果', impact: '优质脂肪摄入不足' },
  { id: 37, habit: '吃坚果过多', impact: '优质脂肪摄入过多' },
  { id: 38, habit: '常吃方便面类', impact: '高糖高盐，营养不足' },
  { id: 39, habit: '常吃甜食', impact: '高糖高盐，营养不足' },
  { id: 40, habit: '常吃油炸食品', impact: '致癌物质' },
  { id: 41, habit: '常吃腌制食品', impact: '盐分过高' },
  { id: 42, habit: '常吃果脯蜜饯', impact: '添加剂和糖分过高' },
  { id: 43, habit: '常吃罐头', impact: '添加剂和糖分过高' },
  { id: 44, habit: '喜吃冰镇水果', impact: '寒凉伤脾胃' },
  { id: 45, habit: '喜吃烧烤', impact: '致癌物质和添加剂' },
  { id: 46, habit: '喜吃零食', impact: '致癌物质和添加剂' },
  { id: 47, habit: '喜吃鸡头', impact: '致癌物质和添加剂' },
  { id: 48, habit: '烧烤+冰啤酒', impact: '寒热交替，损伤脾胃' },
  { id: 49, habit: '火锅+冰啤酒', impact: '寒热交替，损伤脾胃' },
  { id: 50, habit: '烧烤+饮料', impact: '寒热交替，损伤脾胃' },
  { id: 51, habit: '不喝水', impact: '代谢废物堆积，损伤脾胃' },
  { id: 52, habit: '很少喝水', impact: '代谢废物堆积，损伤脾胃' },
  { id: 53, habit: '常喝凉水', impact: '代谢废物堆积，损伤脾胃' },
  { id: 54, habit: '喜吃雪糕', impact: '代谢废物堆积，损伤脾胃' },
  { id: 55, habit: '喜吃冰冻甜品', impact: '代谢废物堆积，损伤脾胃' },
  { id: 56, habit: '常喝饮料', impact: '代谢废物堆积，损伤脾胃' },
  { id: 57, habit: '吃饭不分筷', impact: '增加肠胃负担' },
  { id: 58, habit: '吃饭快', impact: '增加肠胃负担' },
  { id: 59, habit: '喜喝浓茶', impact: '刺激神经，影响睡眠' },
  { id: 60, habit: '喜喝咖啡', impact: '刺激神经，影响睡眠' },
  { id: 61, habit: '饮食不规律', impact: '脾胃功能紊乱' },
  { id: 62, habit: '常吃中药', impact: '药物副作用，损伤肝肾' },
  { id: 63, habit: '常吃西药', impact: '药物副作用，损伤肝肾' },
  { id: 64, habit: '吃过减肥药', impact: '内分泌紊乱，损伤肝肾' },
  { id: 65, habit: '吃过激素药', impact: '内分泌紊乱，损伤肝肾' },
  { id: 66, habit: '常吃海鲜', impact: '可能导致过敏和痛风' },
  { id: 67, habit: '有无过敏史', impact: '需要特别关注健康状况' },
  { id: 68, habit: '既往病史', impact: '需要特别关注健康状况' },
  { id: 69, habit: '服用药物', impact: '需要特别关注健康状况' },
];

const BAD_HABITS_SLEEP = [
  { id: 70, habit: '晚11点后睡，早9点后起', impact: '违反生物钟，损伤气血' },
  { id: 71, habit: '经常上夜班(到天亮)', impact: '内分泌紊乱，免疫力下降' },
  { id: 72, habit: '睡眠不足7-8小时', impact: '身体修复时间不够' },
  { id: 73, habit: '睡软床', impact: '脊柱变形，影响气血运行' },
  { id: 74, habit: '枕高枕', impact: '脊柱变形，影响气血运行' },
  { id: 75, habit: '开空调睡觉', impact: '寒气入侵，影响睡眠' },
  { id: 76, habit: '开窗睡觉', impact: '寒气入侵，影响睡眠' },
  { id: 77, habit: '饭后立刻睡觉', impact: '影响消化，导致肥胖' },
  { id: 78, habit: '睡觉把脚放被子外', impact: '脚部受寒，影响循环' },
  { id: 79, habit: '经常过早(早5点前)起', impact: '休息不足，损伤气血' },
  { id: 80, habit: '蒙头睡觉', impact: '缺氧，影响大脑供血' },
];

const BAD_HABITS_COLD = [
  { id: 81, habit: '开窗户睡觉', impact: '寒气入侵' },
  { id: 82, habit: '开空调睡觉', impact: '寒气入侵' },
  { id: 83, habit: '很少晒太阳', impact: '阳气不足，免疫力下降' },
  { id: 84, habit: '长期在空调房工作', impact: '寒湿内侵' },
  { id: 85, habit: '在地下室或冷库等潮湿地方工作', impact: '寒湿严重' },
  { id: 86, habit: '早上洗头洗澡', impact: '寒气入体' },
  { id: 87, habit: '晚上11点后洗头洗澡', impact: '阳气外泄，寒气入侵' },
  { id: 88, habit: '冷水洗头洗澡', impact: '损伤阳气' },
  { id: 89, habit: '天天洗澡', impact: '损伤阳气' },
  { id: 90, habit: '洗头后不及时吹干', impact: '寒湿内侵' },
  { id: 91, habit: '运动后立即洗澡', impact: '气血运行紊乱' },
  { id: 92, habit: '冷水洗脚不擦干', impact: '脚部受寒' },
  { id: 93, habit: '喜欢光脚在地上走', impact: '寒湿从脚入' },
  { id: 94, habit: '冬天冷水洗菜', impact: '寒气入侵' },
  { id: 95, habit: '冬天冷水洗碗', impact: '寒气入侵' },
  { id: 96, habit: '冬天冷水洗衣物', impact: '寒气入侵' },
  { id: 97, habit: '下河(有严重受寒经历)', impact: '寒湿严重' },
  { id: 98, habit: '喜欢露肩', impact: '寒气入侵' },
  { id: 99, habit: '喜欢露腰', impact: '寒气入侵' },
  { id: 100, habit: '喜欢露脚踝', impact: '寒气入侵' },
  { id: 101, habit: '四季穿凉鞋', impact: '寒气入侵' },
  { id: 102, habit: '冬天穿少穿薄', impact: '寒气入侵' },
  { id: 103, habit: '女性经期碰凉', impact: '宫寒，影响妇科健康' },
  { id: 104, habit: '骑电动车没有保护', impact: '风寒入侵' },
  { id: 105, habit: '出汗时喝凉水', impact: '损伤脾胃' },
  { id: 106, habit: '生气时喝凉水', impact: '损伤脾胃' },
  { id: 107, habit: '经常喝冷水', impact: '寒气入侵' },
  { id: 108, habit: '吃冰镇食物', impact: '寒气入侵' },
];

const BAD_HABITS_EMOTION = [
  { id: 109, habit: '生活有重大变故(情感)', impact: '情志内伤，影响健康' },
  { id: 110, habit: '经常生气', impact: '肝气郁结，气血上逆' },
  { id: 111, habit: '爱发脾气', impact: '肝气郁结，气血上逆' },
  { id: 112, habit: '压力大', impact: '免疫下降，内分泌紊乱' },
  { id: 113, habit: '精神紧张', impact: '免疫下降，内分泌紊乱' },
  { id: 114, habit: '愤怒', impact: '情志内伤' },
  { id: 115, habit: '憎恨', impact: '情志内伤' },
  { id: 116, habit: '内疚', impact: '情志内伤' },
  { id: 117, habit: '心事重', impact: '情志内伤' },
  { id: 118, habit: '思念', impact: '损伤脾胃，影响睡眠' },
  { id: 119, habit: '思虑', impact: '损伤脾胃，影响睡眠' },
  { id: 120, habit: '担惊受怕', impact: '损伤脾胃，影响睡眠' },
  { id: 121, habit: '遇事爱抱怨', impact: '情绪失衡' },
  { id: 122, habit: '找外因', impact: '情绪失衡' },
  { id: 123, habit: '善嫉妒', impact: '情绪失衡' },
  { id: 124, habit: '父母离异', impact: '情志内伤' },
  { id: 125, habit: '悲愤', impact: '情志内伤' },
  { id: 126, habit: '有被遗弃感', impact: '情志内伤' },
  { id: 127, habit: '丧偶', impact: '重大创伤' },
  { id: 128, habit: '丧子(女)', impact: '重大创伤' },
  { id: 129, habit: '丧父(母)', impact: '重大创伤' },
  { id: 130, habit: '没有信念', impact: '精神空虚' },
  { id: 131, habit: '不情愿忍让', impact: '气机郁结' },
  { id: 132, habit: '自己生闷气', impact: '气机郁结' },
  { id: 133, habit: '欲望得不到满足', impact: '情绪低落' },
  { id: 134, habit: '失望', impact: '情绪低落' },
  { id: 135, habit: '莫名暴躁', impact: '情志紊乱' },
  { id: 136, habit: '发脾气', impact: '情志紊乱' },
  { id: 137, habit: '抑郁', impact: '情志紊乱' },
  { id: 138, habit: '自卑', impact: '心理压力大' },
  { id: 139, habit: '软弱', impact: '心理压力大' },
  { id: 140, habit: '缺乏安全感', impact: '心理压力大' },
  { id: 141, habit: '无助', impact: '心理压力大' },
  { id: 142, habit: '生气', impact: '肝气上逆' },
  { id: 143, habit: '气愤', impact: '肝气上逆' },
  { id: 144, habit: '发怒', impact: '肝气上逆' },
  { id: 145, habit: '恼怒', impact: '肝气上逆' },
  { id: 146, habit: '盛怒', impact: '肝气上逆' },
  { id: 147, habit: '伤心', impact: '情志内伤' },
  { id: 148, habit: '难受', impact: '情志内伤' },
  { id: 149, habit: '痛苦', impact: '情志内伤' },
  { id: 150, habit: '悲痛', impact: '情志内伤' },
  { id: 151, habit: '哀痛', impact: '情志内伤' },
  { id: 152, habit: '忧虑', impact: '情志内伤' },
  { id: 153, habit: '忧愁', impact: '情志内伤' },
  { id: 154, habit: '哀愁', impact: '情志内伤' },
  { id: 155, habit: '忧郁', impact: '情志内伤' },
  { id: 156, habit: '抑郁', impact: '情志内伤' },
  { id: 157, habit: '害怕', impact: '肾气受损' },
  { id: 158, habit: '惊慌', impact: '肾气受损' },
  { id: 159, habit: '恐惧', impact: '肾气受损' },
  { id: 160, habit: '恐慌', impact: '肾气受损' },
  { id: 161, habit: '惊恐', impact: '肾气受损' },
  { id: 162, habit: '从小被打骂', impact: '情志内伤' },
  { id: 163, habit: '从小被冷落', impact: '情志内伤' },
  { id: 164, habit: '从小被嫌弃', impact: '情志内伤' },
  { id: 165, habit: '从小受刺激', impact: '情志内伤' },
  { id: 166, habit: '懒惰不上进', impact: '气血不足' },
  { id: 167, habit: '胆小怕事', impact: '心理压力大' },
  { id: 168, habit: '长时间欲而不得', impact: '心理压力大' },
  { id: 169, habit: '心浮躁', impact: '精神不安' },
  { id: 170, habit: '抱怨命运不济', impact: '负面情绪' },
  { id: 171, habit: '霉事缠身', impact: '负面情绪' },
  { id: 172, habit: '无爱好', impact: '精神空虚' },
  { id: 173, habit: '无主见', impact: '精神空虚' },
  { id: 174, habit: '生活没动力', impact: '气血不足' },
  { id: 175, habit: '生活没活力', impact: '气血不足' },
  { id: 176, habit: '空虚无助', impact: '情志内伤' },
  { id: 177, habit: '性子急', impact: '肝气上逆' },
  { id: 178, habit: '爱骂人', impact: '肝气上逆' },
  { id: 179, habit: '喜欢追剧', impact: '刺激神经，影响睡眠' },
  { id: 180, habit: '看恐怖片', impact: '刺激神经，影响睡眠' },
  { id: 181, habit: '爱攀比', impact: '情绪失衡' },
  { id: 182, habit: '气人有', impact: '情绪失衡' },
  { id: 183, habit: '笑人无', impact: '情绪失衡' },
  { id: 184, habit: '过度兴奋', impact: '耗伤气血' },
  { id: 185, habit: '激动', impact: '耗伤气血' },
  { id: 186, habit: '亢奋', impact: '耗伤气血' },
  { id: 187, habit: '总把错误归给自己', impact: '自责内疚' },
  { id: 188, habit: '逃避现实', impact: '情志内伤' },
  { id: 189, habit: '不喜欢与人交流', impact: '情志内伤' },
];

const BAD_HABITS_SPORT = [
  { id: 190, habit: '早5点前运动', impact: '不符合时辰养生' },
  { id: 191, habit: '晚7点后运动', impact: '不符合时辰养生' },
  { id: 192, habit: '不运动', impact: '气血运行不畅' },
  { id: 193, habit: '少运动', impact: '气血运行不畅' },
  { id: 194, habit: '超运动', impact: '过度消耗气血' },
  { id: 195, habit: '久站', impact: '气血运行不畅' },
  { id: 196, habit: '久坐', impact: '气血运行不畅' },
  { id: 197, habit: '久伏案工作', impact: '气血运行不畅' },
  { id: 198, habit: '每天超过一万步', impact: '过度消耗气血' },
  { id: 199, habit: '长时间游泳', impact: '寒气入侵，过度消耗' },
  { id: 200, habit: '冬泳', impact: '寒气入侵，过度消耗' },
  { id: 201, habit: '体力劳动过多', impact: '过度消耗气血' },
];

const BAD_HABITS_TOXIN = [
  { id: 202, habit: '爱咬手指甲', impact: '细菌病毒摄入' },
  { id: 203, habit: '咬笔杆', impact: '细菌病毒摄入' },
  { id: 204, habit: '咬筷子', impact: '细菌病毒摄入' },
  { id: 205, habit: '住房附近20公里内有化工厂', impact: '环境毒素' },
  { id: 206, habit: '住房附近20公里内有药厂', impact: '环境毒素' },
  { id: 207, habit: '住房附近20公里内有化肥厂', impact: '环境毒素' },
  { id: 208, habit: '住房附近20公里内有造纸厂', impact: '环境毒素' },
  { id: 209, habit: '住房附近20公里内有印染厂', impact: '环境毒素' },
  { id: 210, habit: '住房附近20公里内有橡胶厂', impact: '环境毒素' },
  { id: 211, habit: '住房附近20公里内有石灰厂', impact: '环境毒素' },
  { id: 212, habit: '经常接触建筑材料', impact: '甲醛等有害物质' },
  { id: 213, habit: '房屋过度装修', impact: '甲醛等有害物质' },
  { id: 214, habit: '常烫发', impact: '化学物质毒素' },
  { id: 215, habit: '染发', impact: '化学物质毒素' },
  { id: 216, habit: '涂化妆品', impact: '化学物质毒素' },
  { id: 217, habit: '涂祛斑霜', impact: '化学物质毒素' },
  { id: 218, habit: '涂指甲油', impact: '化学物质毒素' },
  { id: 219, habit: '长期吸入炒菜油烟', impact: '肺部毒素' },
  { id: 220, habit: '长期受汽车尾气困扰', impact: '肺部毒素' },
  { id: 221, habit: '长期受灰尘困扰', impact: '肺部毒素' },
  { id: 222, habit: '长期受粉尘困扰', impact: '肺部毒素' },
  { id: 223, habit: '小孩子用铅笔剃牙', impact: '化学物质接触' },
  { id: 224, habit: '小孩子常戴深色口罩', impact: '化学物质接触' },
  { id: 225, habit: '爱用84消毒液', impact: '化学物质毒素' },
  { id: 226, habit: '爱用脱色剂', impact: '化学物质毒素' },
  { id: 227, habit: '爱用强力除油剂', impact: '化学物质毒素' },
  { id: 228, habit: '爱用水果清洗剂', impact: '化学物质毒素' },
  { id: 229, habit: '不戴正规防毒面具喷洒农药', impact: '农药毒素' },
  { id: 230, habit: '不穿正规防护服喷洒农药', impact: '农药毒素' },
  { id: 231, habit: '叼着包装袋喝奶', impact: '塑料微粒摄入' },
  { id: 232, habit: '叼着包装袋喝饮料', impact: '塑料微粒摄入' },
];

const BAD_HABITS_LIFE = [
  { id: 233, habit: '抽烟每天超过10根', impact: '肺部毒素，心血管疾病' },
  { id: 234, habit: '长期吸二手烟', impact: '肺部毒素，心血管疾病' },
  { id: 235, habit: '低头玩手机', impact: '颈椎问题，视力下降' },
  { id: 236, habit: '用电脑过多', impact: '颈椎问题，视力下降' },
  { id: 237, habit: '经常过度疲劳', impact: '气血消耗' },
  { id: 238, habit: '经常憋尿', impact: '毒素堆积' },
  { id: 239, habit: '不按时排便', impact: '毒素堆积' },
  { id: 240, habit: '手淫', impact: '肾精亏损' },
  { id: 241, habit: '意淫', impact: '肾精亏损' },
  { id: 242, habit: '看色情视频或资料', impact: '肾精亏损' },
  { id: 243, habit: '性生活频繁', impact: '肾精亏损或性功能问题' },
  { id: 244, habit: '性欲低', impact: '肾精亏损或性功能问题' },
  { id: 245, habit: '住变电站附近', impact: '电磁辐射' },
  { id: 246, habit: '用过抗生素消炎药', impact: '肠道菌群紊乱' },
  { id: 247, habit: '常翘二郎腿', impact: '脊柱变形，气血运行不畅' },
  { id: 248, habit: '爱躺着看电视', impact: '气血运行不畅' },
  { id: 249, habit: '爱躺着玩手机', impact: '气血运行不畅' },
  { id: 250, habit: '手机在床边充电', impact: '电磁辐射' },
  { id: 251, habit: '手机放头附近睡觉', impact: '电磁辐射' },
  { id: 252, habit: '长期减肥', impact: '营养不良' },
];

// 合并所有不良生活习惯
const BAD_HABITS_CHECKLIST = {
  '饮食': BAD_HABITS_DIET,
  '睡觉': BAD_HABITS_SLEEP,
  '寒湿': BAD_HABITS_COLD,
  '情绪': BAD_HABITS_EMOTION,
  '运动': BAD_HABITS_SPORT,
  '毒素': BAD_HABITS_TOXIN,
  '生活': BAD_HABITS_LIFE,
};

/**
 * 健康要素
 */
const HEALTH_ELEMENTS = [
  {
    id: 'qixue',
    name: '气血',
    description: '营养的输送能力',
    color: '#3b82f6',
    icon: '🩸',
    story: '战备物资的故事',
    principle: '血液把营养带进来，再把垃圾带出去。如果气血不足，细胞、组织和器官的功能就会受到影响。'
  },
  {
    id: 'xunhuan',
    name: '循环',
    description: '微循环系统的通畅程度',
    color: '#10b981',
    icon: '🔄',
    story: '公路堵车的故事',
    principle: '微循环是血液和组织细胞之间进行物质交换的场所，如果微循环堵塞，营养进不去，垃圾出不来。'
  },
  {
    id: 'dusu',
    name: '毒素',
    description: '体内垃圾毒素的积累',
    color: '#f59e0b',
    icon: '☣️',
    story: '蓄水池的故事',
    principle: '体内垃圾毒素的积累会从轻微症状到严重疾病逐步发展，影响整体健康。'
  },
  {
    id: 'xuezhi',
    name: '血脂',
    description: '血液中的油脂含量',
    color: '#ef4444',
    icon: '🧈',
    story: '泥沙堵塞管道的故事',
    principle: '血液中的油脂过多会粘附在血管壁上，使血管变窄、变硬，影响血液循环。'
  },
  {
    id: 'hanliang',
    name: '寒凉',
    description: '体内的寒湿气程度',
    color: '#06b6d4',
    icon: '❄️',
    story: '道路结冰的故事',
    principle: '寒湿气过重会影响气血运行和毒素排出，导致身体功能下降。'
  },
  {
    id: 'mianyi',
    name: '免疫',
    description: '身体的自我防护能力',
    color: '#8b5cf6',
    icon: '🛡️',
    story: '城墙守卫的故事',
    principle: '免疫力是身体的防护系统，负责识别和清除入侵的外来物质和异常细胞。'
  },
  {
    id: 'qingxu',
    name: '情绪',
    description: '情绪对健康的影响',
    color: '#ec4899',
    icon: '💭',
    story: '情绪的故事',
    principle: '情绪对健康有着深远的影响，长期的负面情绪会损伤脏腑功能，导致各种疾病。'
  }
];

/**
 * 计算健康评分
 */
function calculateHealthScore(bodySymptoms, badHabits, symptoms300) {
  // 基础分100分
  let score = 100;
  
  // 身体语言简表扣分 (每项扣0.5分)
  const bodyDeduction = bodySymptoms.length * 0.5;
  
  // 不良生活习惯扣分 (每项扣0.3分)
  const habitsDeduction = badHabits.length * 0.3;
  
  // 300症状表扣分 (每项扣0.2分)
  const symptoms300Deduction = symptoms300.length * 0.2;
  
  // 总扣分
  const totalDeduction = bodyDeduction + habitsDeduction + symptoms300Deduction;
  
  // 最终分数
  score = Math.max(0, 100 - totalDeduction);
  
  return {
    score: Math.round(score * 10) / 10,
    bodyDeduction: bodyDeduction,
    habitsDeduction: habitsDeduction,
    symptoms300Deduction: symptoms300Deduction,
    totalDeduction: totalDeduction
  };
}

/**
 * 根据ID获取症状名称
 */
function getSymptomNameById(id) {
  const symptom = BODY_SYMPTOMS.find(s => s.id === id);
  return symptom ? symptom.name : '';
}

/**
 * 根据ID获取不良习惯名称
 */
function getHabitNameById(id) {
  for (const category of Object.keys(BAD_HABITS_CHECKLIST)) {
    const habit = BAD_HABITS_CHECKLIST[category].find(h => h.id === id);
    if (habit) return habit.habit;
  }
  return '';
}

module.exports = {
  BODY_SYMPTOMS,
  BODY_SYMPTOMS_BY_CATEGORY,
  BAD_HABITS_CATEGORIES,
  BAD_HABITS_CHECKLIST,
  BAD_HABITS_DIET,
  BAD_HABITS_SLEEP,
  BAD_HABITS_COLD,
  BAD_HABITS_EMOTION,
  BAD_HABITS_SPORT,
  BAD_HABITS_TOXIN,
  BAD_HABITS_LIFE,
  HEALTH_ELEMENTS,
  calculateHealthScore,
  getSymptomNameById,
  getHabitNameById
};
