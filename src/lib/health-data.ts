// 身体语言简表100项（原始版，保留在原位置）
export const BODY_SYMPTOMS = [
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

// 健康要素分类（详细完整版）
export const HEALTH_ELEMENTS = {
  气血: {
    id: 'qixue',
    name: '气血',
    description: '营养的输送能力',
    symptoms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 14, 16, 17, 18, 19, 23, 24, 25, 26, 34, 41, 35, 43, 44, 45, 48, 50, 51, 52, 53, 54, 55, 56, 74, 75, 85, 68, 90, 87, 91, 92, 94, 93],
    story: '战备物资的故事',
    principle: '血液把营养带进来，再把垃圾带出去。如果气血不足，细胞、组织和器官的功能就会受到影响。',
    fullStory: `在战场上，如果粮食弹药和兵源供应不足，军队就无法正常作战。同样，如果我们的气血不足，身体就没有足够的营养来维持正常的新陈代谢和细胞功能。

气血不足的表现：
1. 记忆力下降、思维断电、反应迟钝 - 大脑供血不足
2. 头晕、头疼、嗜睡 - 脑部供血不足
3. 眼干涩、眼痒、视力模糊 - 眼部供血不足
4. 手脚凉、指甲凹陷 - 末梢循环供血不足
5. 月经量少、经期推后 - 子宫供血不足

为什么会出现气血不足？
1. 饮食不规律，营养摄入不足
2. 脾胃虚弱，消化吸收能力差
3. 熬夜伤神，过度消耗气血
4. 情绪波动大，肝气郁结影响气血运行

如何改善气血不足？
1. 规律作息，保证充足睡眠
2. 均衡饮食，增加优质蛋白摄入
3. 适当运动，促进气血运行
4. 保持良好情绪，避免气血消耗`,
  },
  循环: {
    id: 'xunhuan',
    name: '循环',
    description: '微循环系统的通畅程度',
    symptoms: [46, 47, 48, 49, 55, 56, 57, 59, 60, 61, 62, 63, 71, 72, 73, 75, 76, 77, 78, 79, 80],
    story: '公路堵车的故事',
    principle: '微循环是血液和组织细胞之间进行物质交换的场所，如果微循环堵塞，营养进不去，垃圾出不来。',
    fullStory: `想象一下，如果城市的主干道堵车了，会发生什么？紧急物资送不进去，垃圾运不出来，整个城市都会陷入混乱。

我们的身体也是一样，如果微循环堵塞，就会出现以下问题：
1. 胸闷气短、心慌心悸 - 心脏循环不畅
2. 手足麻木、静脉曲张 - 四肢循环不畅
3. 关节痛、肩酸痛、颈椎痛 - 局部循环不畅
4. 高血压、高血脂 - 血管循环阻力增大
5. 月经有血块、经期腰痛 - 盆腔循环不畅

微循环堵塞的原因：
1. 长期久坐，缺乏运动
2. 饮食油腻，血液粘稠
3. 情绪紧张，血管收缩
4. 寒湿入侵，血管痉挛

如何改善微循环？
1. 坚持运动，促进血液循环
2. 温水泡脚，改善末梢循环
3. 按摩推拿，疏通经络
4. 合理饮食，降低血液粘稠度`,
  },
  毒素: {
    id: 'dusu',
    name: '毒素',
    description: '体内垃圾毒素的积累',
    symptoms: [41, 42, 43, 44, 45, 46, 47, 68, 69, 70, 97],
    story: '蓄水池的故事',
    principle: '体内垃圾毒素的积累会从轻微症状到严重疾病逐步发展，影响整体健康。',
    fullStory: `蓄水池如果只进不出，会是什么结果？水位会越来越高，水质会越来越差，最终溢出来污染周围环境。

我们体内的毒素也是一样的道理：

体内毒素的来源：
1. 代谢废物：细胞新陈代谢产生的废物
2. 饮食毒素：食品添加剂、农药残留
3. 环境毒素：空气污染、水污染
4. 情绪毒素：压力、焦虑产生的有害物质

毒素积累的表现：
1. 口苦、口臭、口溃疡 - 肠道毒素上逆
2. 便秘、大便不成形 - 肠道排毒不畅
3. 皮肤痒、湿疹 - 皮肤排毒受阻
4. 身体异味 - 体内毒素严重积累
5. 舌硬、嘴唇麻 - 神经系统毒素影响

毒素积累的危害：
1. 轻度：疲劳、失眠、皮肤问题
2. 中度：慢性炎症、免疫力下降
3. 重度：脏器损伤、重大疾病

如何排毒？
1. 喝够水，促进肾脏排毒
2. 多吃纤维，促进肠道排毒
3. 运动出汗，促进皮肤排毒
4. 保证睡眠，促进肝脏排毒`,
  },
  血脂: {
    id: 'xuezhi',
    name: '血脂',
    description: '血液中的油脂含量',
    symptoms: [11, 71, 72, 73, 91, 96],
    story: '泥沙堵塞管道的故事',
    principle: '血液中的油脂过多会粘附在血管壁上，使血管变窄、变硬，影响血液循环。',
    fullStory: `如果有泥沙不断进入管道，管道壁上会慢慢沉积泥沙，管道会越来越窄，水流越来越小，最终可能完全堵塞。

血液中的油脂也是一样的：

高血脂的表现：
1. 头面油腻 - 皮脂分泌旺盛
2. 肥胖、脂肪瘤 - 脂肪堆积过多
3. 高血压、高血糖、高血脂 - 代谢综合征
4. 形体消瘦（也可能是脂质代谢异常）

高血脂的危害：
1. 动脉硬化：血管壁脂质沉积，血管变硬
2. 血栓形成：斑块脱落形成血栓，堵塞血管
3. 心脑血管疾病：冠心病、脑卒中
4. 胰岛素抵抗：导致糖尿病

高血脂的原因：
1. 饮食不当：高脂、高糖、高热量饮食
2. 缺乏运动：脂肪消耗减少
3. 代谢异常：甲状腺、肝肾功能异常
4. 遗传因素：家族性高血脂

如何降低血脂？
1. 低脂饮食，减少饱和脂肪摄入
2. 增加运动，促进脂肪消耗
3. 控制体重，减少内脏脂肪
4. 补充优质蛋白，促进脂质代谢`,
  },
  寒凉: {
    id: 'hanliang',
    name: '寒凉',
    description: '体内的寒湿气程度',
    symptoms: [55, 59, 60, 61, 62, 63, 54, 58],
    story: '道路结冰的故事',
    principle: '寒湿气过重会影响气血运行和毒素排出，导致身体功能下降。',
    fullStory: `道路结冰会发生什么？车辆打滑、刹车失灵、交通瘫痪。寒冷会让一切运行速度变慢，甚至停滞。

体内的寒湿气也是一样的：

寒湿的表现：
1. 手脚凉 - 末梢循环受寒
2. 手脚出汗 - 湿气重
3. 关节痛、肩酸痛、颈椎痛 - 寒湿阻滞经络
4. 腰酸痛 - 肾阳不足，寒湿内侵
5. 四肢乏力 - 寒湿困脾

寒湿的来源：
1. 环境寒湿：淋雨、涉水、受风
2. 饮食寒凉：冷饮、冰镇食物、生冷水果
3. 空调寒气：长期待在空调房
4. 体质虚寒：阳虚体质，自身体内寒气重

寒湿的危害：
1. 气血凝滞：寒气收缩血管，影响气血运行
2. 经络阻塞：湿气阻滞经络，导致疼痛
3. 脾胃受损：寒湿困脾，影响消化
4. 免疫力下降：体内环境改变，易感染

如何祛寒湿？
1. 温热饮食：姜茶、红枣、桂圆
2. 泡脚热敷：温水泡脚，艾灸热敷
3. 运动出汗：促进寒湿排出
4. 避寒保暖：少吹空调，注意保暖`,
  },
  免疫: {
    id: 'mianyi',
    name: '免疫',
    description: '身体的自我防护能力',
    symptoms: [34, 92, 93, 94, 98],
    story: '城墙守卫的故事',
    principle: '免疫力是身体的防护系统，负责识别和清除入侵的外来物质和异常细胞。',
    fullStory: `城墙和守卫是保护城市的最后一道防线。如果城墙倒塌，守卫疲惫，敌人就可以轻易入侵。

免疫系统也是我们的身体防线：

免疫力低下的表现：
1. 感冒时间长 - 病毒抵抗力弱
2. 各种过敏 - 免疫系统过度敏感
3. 皮肤痒、湿疹 - 免疫功能紊乱
4. 淋巴肿大 - 免疫系统活跃
5. 容易疲劳 - 免疫消耗过大

免疫力低下的原因：
1. 压力过大：慢性压力消耗免疫资源
2. 睡眠不足：免疫系统修复时间不够
3. 营养不良：缺乏维生素、矿物质
4. 缺乏运动：免疫功能下降
5. 负面情绪：情绪影响免疫细胞活性

免疫力与疾病：
1. 免疫低下：易感染、易过敏、易疲劳
2. 免疫紊乱：自身免疫疾病、过敏性疾病
3. 免疫逃逸：癌细胞逃避免疫监视

如何提升免疫力？
1. 充足睡眠：保证7-8小时睡眠
2. 均衡营养：补充蛋白质、维生素
3. 适量运动：每周3-5次中等强度运动
4. 良好情绪：保持乐观积极心态
5. 减压放松：学会释放压力`,
  },
  情绪: {
    id: 'qingxu',
    name: '情绪',
    description: '心理状态和情绪管理',
    symptoms: [85, 48, 49, 86],
    story: '心灵花园的故事',
    principle: '情绪会影响神经系统和内分泌系统，进而影响整体健康状况。',
    fullStory: `心灵就像一个花园，如果种满鲜花，花园就美丽；如果长满杂草，花园就会荒芜。

情绪也是一样的：

负面情绪的表现：
1. 不爱说话 - 情绪低落
2. 胸闷气短 - 气机郁结
3. 心慌心悸 - 心神不宁
4. 恶心 - 情绪性胃肠道反应

情绪对健康的影响：
1. 神经系统：影响睡眠、记忆、反应速度
2. 内分泌系统：影响激素分泌，导致月经失调
3. 消化系统：胃胀、胃痛、消化不良
4. 心血管系统：血压升高、心律失常
5. 免疫系统：免疫力下降

常见负面情绪：
1. 焦虑：担忧未来，心神不宁
2. 抑郁：情绪低落，兴趣丧失
3. 愤怒：肝气郁结，气血上逆
4. 恐惧：肾气受损，免疫力下降

情绪管理方法：
1. 觉察情绪：识别自己的情绪状态
2. 表达情绪：找人倾诉，写日记
3. 转换思维：从积极角度看问题
4. 释放情绪：运动、音乐、冥想
5. 寻求支持：家人、朋友、专业人士`,
  },
};

// 持续跟进落实健康的七问
export const SEVEN_QUESTIONS = [
  {
    id: 1,
    question: '多长时间犯一次？',
    description: '了解症状的发生频率，判断问题的持续性和规律性',
  },
  {
    id: 2,
    question: '一次要多久？',
    description: '了解症状的持续时间，判断症状的严重程度',
  },
  {
    id: 3,
    question: '具体表现是什么？',
    description: '详细描述症状的具体表现，帮助准确识别问题',
  },
  {
    id: 4,
    question: '用了哪些方法干预？',
    description: '了解已经尝试过的解决方法，评估效果并避免重复无效的方法',
  },
  {
    id: 5,
    question: '这个症状从什么时候开始的？当时发生了什么事？（你是做什么工作的？是否与症状相关？）一般什么情况下会加重或复发？什么情况下会减轻？',
    description: '追溯症状的起源和诱因，找出问题根源和规律',
  },
  {
    id: 6,
    question: '什么情况下会减轻？',
    description: '了解缓解因素，找到有效的应对方法',
  },
  {
    id: 7,
    question: '最近一次出现是什么时候，发生了什么？',
    description: '了解最近一次发作的情况，判断问题的当前状态',
  },
];

// 三个选择（根据文档完整内容）
export const THREE_CHOICES = {
  choice1: {
    title: '第1个选择：不花钱的方法',
    description: '因为找不到病因治不好病，而真正的病因都在生活里。您填一张全面的《身体语言自检表》和《健康要素对应的不良生活习惯表》，我们一起找到导致健康问题出现的原因，然后把坏习惯改掉，再养成一些好习惯，身体会慢慢恢复，只是时间会长一点。',
    details: [
      '其实，得个病也不容易，比如要得一个高血压、糖尿病，要十几年甚至几十年才能形成的。',
      '所以要去掉一个病也是需要时间的，需要您的坚持和意志力。',
      '这就像回家有5公里，可以走路回去。走路呢，要么冷要么热，还很辛苦，但是只要坚持，最后也肯定能到家。',
    ],
    requirements: ['如果真的选了这个方法：要求填表，要求跟着一起学习。'],
  },
  choice2: {
    title: '第2个选择：带产品来免费服务',
    description: '我相信每个人身边都有做健康行业的，或者是中医，也许您买过类似的产品，只是服务不到位，没有用出效果。如果产品还在，也没过期，质量还可以，您没必要跟我买，您就用原来的产品，我来免费给您服务。',
    details: [
      '每个人挣钱都不容易，不要浪费，您的身体恢复这才是我的目的。',
      '您获得了健康，我也获得了经验。',
      '这就像回家有5公里，可以坐车。打车呢，舒服、安全、速度快，就是得花点钱。',
    ],
    requirements: ['如果选择这个方法，填表和学习必须有，要用心服务，等产品用完，一定会跟我买。'],
  },
  choice3: {
    title: '第3个选择：使用我的产品和服务',
    description: '我这也有相关的产品和服务，不过您要找我调的话，您得答应我四个要求，如果您做不到，我也不能调。',
    details: [
      '这就像回家有5公里，搭配产品就相当于坐豪车，跑得快还舒服，能加快恢复的速度。',
      '以后有任何需要，您都可以来找我，就算我的能力不足以解决您所有的问题，但是我的背后还有一个强大的平台。',
      '您就把我当成您的健康顾问就行！',
    ],
    requirements: ['必须完成四个要求，否则无法调理。'],
  },
};

// 四个要求（根据文档完整内容）
export const FOUR_REQUIREMENTS = {
  requirement1: {
    title: '找病因',
    description: '找病因是必须要做的，因为找不到病因真的治不好病，真正的病因都在生活里。',
    details: '您填一下《健康要素对应的不良生活习惯表》，找到导致问题出现的原因，然后把坏习惯改掉，再养成一些好习惯，有利于身体的恢复。',
    warning: '如果习惯不改，医生治不好您的病，我也没有办法给您调好。',
  },
  requirement2: {
    title: '建立身体恢复档案',
    description: '您要填一张全面的《身体语言自检表》，建立身体恢复档案。',
    details: '连续三个月，每月填一次，掌握身体的健康走向。',
    benefit: '通过对比三次填表的结果，了解身体的恢复情况和调理效果。',
  },
  requirement3: {
    title: '跟着学习健康观念',
    description: '调理期间您要跟着学习健康观念课。',
    details: '每堂课只有十来分钟，不会耽误太多时间。',
    benefits: [
      '学习是为了让您了解原理，做好配合，能让您更快的恢复。',
      '同时也能避免误解。',
      '因为只有您了解真正健康的观念，慢慢才能有健康的正确行为，最终才能获得健康。',
    ],
  },
  requirement4: {
    title: '学会健康自我管理',
    description: '我只能服务您三个月。',
    details: '在您调理期间您必须学会健康自我管理，还要学会照顾全家人的健康。',
    reason: '因为我的顾客多，没时间每个人都一直服务，但是我做健康行业的目的就这一个——让每个家庭都有一个懂健康的人。',
    benefit: '您没必要什么事都来找我。',
  },
};

// 身体恢复健康的八要素
export const EIGHT_HEALTH_ELEMENTS = {
  element1: {
    title: '气血充足',
    description: '保证身体有足够的营养和能量',
    methods: ['规律作息，保证睡眠', '均衡饮食，营养全面', '适当运动，促进气血生成', '避免过度劳累', '保持良好情绪'],
  },
  element2: {
    title: '循环通畅',
    description: '保证微循环系统的通畅，让营养进得来，毒素出得去',
    methods: ['坚持运动，促进血液循环', '温水泡脚，改善末梢循环', '按摩推拿，疏通经络', '合理饮食，降低血液粘稠度', '避免久坐，定时活动'],
  },
  element3: {
    title: '毒素排出',
    description: '及时清理体内代谢废物和外界毒素',
    methods: ['喝够水，促进肾脏排毒', '多吃纤维，促进肠道排毒', '运动出汗，促进皮肤排毒', '保证睡眠，促进肝脏排毒', '定期排毒，避免毒素积累'],
  },
  element4: {
    title: '血脂平衡',
    description: '维持血液中正常的脂肪含量，避免血管堵塞',
    methods: ['低脂饮食，减少饱和脂肪', '增加运动，促进脂肪消耗', '控制体重，减少内脏脂肪', '补充优质蛋白，促进代谢', '定期体检，监测血脂'],
  },
  element5: {
    title: '寒湿祛除',
    description: '祛除体内的寒湿气，保证气血正常运行',
    methods: ['温热饮食，姜茶红枣', '泡脚热敷，温通经络', '运动出汗，排寒祛湿', '避寒保暖，少吹空调', '艾灸理疗，温阳散寒'],
  },
  element6: {
    title: '免疫强大',
    description: '增强身体的自我防护能力，抵抗疾病',
    methods: ['充足睡眠，修复免疫系统', '均衡营养，补充维生素矿物质', '适量运动，激活免疫细胞', '良好情绪，保持积极心态', '减压放松，避免免疫消耗'],
  },
  element7: {
    title: '情绪平衡',
    description: '保持良好的心理状态，避免情绪对身体造成伤害',
    methods: ['觉察情绪，识别心理状态', '表达情绪，找人倾诉', '转换思维，积极看待问题', '释放情绪，运动音乐冥想', '寻求支持，专业心理咨询'],
  },
  element8: {
    title: '习惯养成',
    description: '养成健康的生活习惯，长期维持健康',
    methods: ['规律作息，早睡早起', '均衡饮食，少油少盐', '坚持运动，每周3-5次', '定期体检，预防疾病', '学习健康知识，提升健康意识'],
  },
};

// 客户必修的21个堂课
export const TWENTY_ONE_COURSES = [
  {
    id: 1,
    title: '第1课：为什么得病不容易',
    duration: '10分钟',
    content: '得病需要十几年甚至几十年的时间累积，所以去病也需要时间，不要急于求成。',
  },
  {
    id: 2,
    title: '第2课：医院和健康行业的区别',
    duration: '10分钟',
    content: '医院负责抢救生命，健康行业负责预防和康复，两者互补。',
  },
  {
    id: 3,
    title: '第3课：什么是病因',
    duration: '10分钟',
    content: '真正的病因都在生活里，只有找到病因才能从根本上解决问题。',
  },
  {
    id: 4,
    title: '第4课：健康七要素',
    duration: '15分钟',
    content: '详细讲解影响健康的七个核心要素：气血、循环、毒素、血脂、寒凉、免疫、情绪。',
  },
  {
    id: 5,
    title: '第5课：系统战役故事',
    duration: '10分钟',
    content: '通过军事战役的比喻，理解健康系统的运作原理。',
  },
  {
    id: 6,
    title: '第6课：大扫除的故事',
    duration: '10分钟',
    content: '理解排毒过程中的好转反应，不要轻易放弃。',
  },
  {
    id: 7,
    title: '第7课：身体语言简表的意义',
    duration: '10分钟',
    content: '学会读懂身体的信号，早期发现健康问题。',
  },
  {
    id: 8,
    title: '第8课：七问法',
    duration: '10分钟',
    content: '通过七个问题深入了解症状，找出根本原因。',
  },
  {
    id: 9,
    title: '第9课：气血的重要性',
    duration: '10分钟',
    content: '气血是健康的根本，如何补充和养护气血。',
  },
  {
    id: 10,
    title: '第10课：循环系统的奥秘',
    duration: '10分钟',
    content: '微循环如何影响健康，如何改善循环。',
  },
  {
    id: 11,
    title: '第11课：毒素的来源与排毒',
    duration: '10分钟',
    content: '体内毒素的来源，如何有效排毒。',
  },
  {
    id: 12,
    title: '第12课：血脂与心血管健康',
    duration: '10分钟',
    content: '高血脂的危害，如何预防和改善。',
  },
  {
    id: 13,
    title: '第13课：寒湿对健康的影响',
    duration: '10分钟',
    content: '寒湿的来源，如何祛除寒湿。',
  },
  {
    id: 14,
    title: '第14课：免疫力的建立',
    duration: '10分钟',
    content: '免疫力低下的原因，如何提升免疫力。',
  },
  {
    id: 15,
    title: '第15课：情绪与健康的关系',
    duration: '10分钟',
    content: '负面情绪对身体的伤害，如何管理情绪。',
  },
  {
    id: 16,
    title: '第16课：健康生活习惯的养成',
    duration: '10分钟',
    content: '如何养成健康的饮食、作息、运动习惯。',
  },
  {
    id: 17,
    title: '第17课：如何配合调理',
    duration: '10分钟',
    content: '调理期间如何配合，提高调理效果。',
  },
  {
    id: 18,
    title: '第18课：好转反应的理解',
    duration: '10分钟',
    content: '什么是好转反应，如何正确应对。',
  },
  {
    id: 19,
    title: '第19课：健康自我管理',
    duration: '10分钟',
    content: '学会管理自己和家人的健康。',
  },
  {
    id: 20,
    title: '第20课：家庭健康管理',
    duration: '10分钟',
    content: '如何成为家庭的健康守护者。',
  },
  {
    id: 21,
    title: '第21课：健康观念总结',
    duration: '10分钟',
    content: '总结健康的核心观念，长期维持健康。',
  },
];

// 不良生活习惯自检表（完整版 - 根据文档）
export const BAD_HABITS_CHECKLIST = {
  饮食: [
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
  ],
  睡觉: [
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
  ],
  寒湿: [
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
  ],
  情绪: [
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
  ],
  运动: [
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
  ],
  毒素: [
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
  ],
  生活: [
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
  ],
};

// 发心感召内容
export const HEART_INSPIRATION = {
  title: '为什么做健康行业',
  content: `我曾经看到太多人因为不懂得健康，把辛苦挣来的钱都送给了医院，最后人财两空。也看到太多人因为缺乏健康知识，小病拖成大病，后悔莫及。

我深知健康对于一个家庭的重要性。一个人生病，全家受累。不仅身体痛苦，经济负担也重。如果每个家庭都有一个懂健康的人，很多悲剧是可以避免的。

做健康行业的初衷，不是为了赚多少钱，而是希望：
1. 帮助更多的人少生病、不生病
2. 让每个家庭都有一个懂健康的人
3. 把健康的观念传递给更多的人
4. 让更多人明白预防大于治疗的重要性

我知道这条路不容易，但我相信只要坚持下去，一定能够帮助更多的人。每一个被帮助的人，又可以帮助更多的人，这样就能形成一个健康的循环。

健康不是一个人的事，而是一个家庭、一个社会的事。让我们一起努力，把健康带给每个家庭！`,
};

// 关键问题
export const KEY_QUESTION = {
  question: '我想问你一个问题，在我给你做这个资检表之前，你知不知道你有这么多的症状？如果病因没有找到，也没有去掉的话，症状会不会越来越多，会不会越来越重？',
  answer: `很多人在填写身体语言简表之前，都没有意识到自己有这么多症状。这些症状都是身体给我们的信号，提醒我们身体出了问题。

如果病因没有找到，也没有去掉，症状确实会越来越多，越来越重。就像房子漏水，如果不去修补漏洞，只是不断地拖地，水还是会漏进来，而且可能会越来越大，最终导致房子倒塌。

同样的道理，如果我们只是缓解症状，而不解决根本原因，身体的问题就会越来越严重。小病拖成大病，大病拖成重病。

这就是为什么我们强调"找病因"的重要性。只有找到病因，从根源上解决问题，才能真正恢复健康，避免疾病反复发作。`,
};

// 恢复速度八要素
export const RECOVERY_SPEED_FACTORS = {
  title: '恢复的速度由八个要素决定',
  intro: '客户买完产品，要主动沟通这个内容："你马上就开始正式调理了，有一个事情我必须跟你交代一下，因为这件事情决定了你的恢复速度。你有没有发现，为什么同样的调理，有的人恢复快，有的人恢复慢?那快慢是由哪些要素决定的呢?我们来一起看一个图："',
  factors: [
    {
      id: 1,
      question: '年龄大的和年龄小的哪一个人恢复的速度快?',
      answer: '年龄小的人恢复速度更快。因为年龄小的人身体机能、新陈代谢、细胞再生能力都更强。',
      principle: '年龄越小，身体自我修复能力越强，恢复速度越快。',
    },
    {
      id: 2,
      question: '一个人得病二十年另一个人得病2年，哪个人容易恢复?',
      answer: '得病2年的人更容易恢复。因为病程短，身体的损伤还没有积累到很严重的程度。',
      principle: '病程越短，身体的损伤越小，恢复越容易。',
    },
    {
      id: 3,
      question: '我们都知道是药三分毒，药都有副作用，那长期吃药对身体的伤害大不大?那你说是吃药时间长的好调，还是吃药时间短的好调?',
      answer: '吃药时间短的好调。长期吃药会损伤肝肾功能，影响身体的自我修复能力。',
      principle: '药物副作用会损伤身体，吃药时间越长，对身体伤害越大，恢复越困难。',
    },
    {
      id: 4,
      question: '关于生活习惯我给你讲一个故事：你花钱请我给你盖房子，我正在努力的帮你砌墙，可是你自己却在拆墙，请问我要多久能给你把墙砌好?那你让我帮你调理身体，可是导致你得病的生活习惯你一个都不改，就相当于我砌墙你拆墙，什么时候能调好?所以改变坏习惯的速度也决定了恢复的速度。',
      answer: '如果坏习惯不改，永远调不好。改变坏习惯的速度越快，恢复速度越快。',
      principle: '不改坏习惯相当于一边调理一边伤害，必须改掉坏习惯才能真正恢复。',
    },
    {
      id: 5,
      question: '手术伤不伤元气?要是把脏器切了，会不会更伤元气?还有激素对人体的伤害大不大?那做过这些和没做过的哪个更容易恢复?',
      answer: '没做过的人更容易恢复。手术、切除脏器、激素治疗都会严重损伤身体元气。',
      principle: '手术、脏器切除、激素治疗会损伤身体元气，增加恢复难度。',
    },
    {
      id: 6,
      question: '免疫力强不强、体质好不好、气血足不足能不能影响恢复的速度?',
      answer: '免疫力强、体质好、气血足的人恢复速度更快。这些是身体自我修复的基础。',
      principle: '免疫力、体质、气血是身体自我修复的基础条件，越好恢复越快。',
    },
    {
      id: 7,
      question: '按时按量使用产品和三天打鱼两天晒网，哪个恢复快?',
      answer: '按时按量使用产品的人恢复更快。调理需要连续性，断断续续会严重影响效果。',
      principle: '调理需要持续性和规律性，按时按量使用才能保证最佳效果。',
    },
    {
      id: 8,
      question: '一个人经常闹情绪，经常生气上火，会不会影响恢复的速度?',
      answer: '经常闹情绪、生气上火的人恢复更慢。情绪会影响身体的内分泌和免疫系统。',
      principle: '情绪会影响内分泌和免疫系统，负面情绪会延缓恢复速度。',
    },
  ],
  conclusion: '所以，想要恢复得快需要我们之间做好配合才行!',
};

// 身体语言自检表结构
export const BODY_LANGUAGE_CHECK_FORM = {
  title: '身体语言自检表',
  subtitle: '一张表格就是一个生命，请您认真对待!',
  fields: {
    profession: {
      label: '您的职业',
      placeholder: '请填写您的职业',
      note: '职业可能影响生活习惯和健康风险',
    },
    currentHealth: {
      label: '目前身体状况(顾客自述)',
      placeholder: '请描述您目前的身体状况',
      note: '简要描述您目前的整体健康状况',
    },
    mainSymptoms: {
      label: '您目前最想解决的症状',
      placeholder: '请列出您最想解决的症状，可多选',
      note: '选择3-5个最困扰您的症状',
    },
    remarks: {
      label: '备注',
      placeholder: '其他需要补充说明的情况',
      note: '可以补充其他相关信息',
    },
  },
  disclaimer: '*注：本表只作为参考，如果您有任何身体不适，请尽快咨询医生。紧急情况，请遵医嘱。',
  formula: '疾病=坏习惯+时间  健康=好习惯+时间  养成一个好习惯可以抵消一些坏习惯',
};

// 系统战役故事（包含图片位置标记）
export const SYSTEM_CAMPAIGN_STORY = {
  title: '系统战役故事',
  content: [
    {
      section: '战场保障',
      text: '想要保证军队与敌人的战斗能正常进行，有两个保障必须完成：一个是有足够的粮食弹药和兵源，另一个要保障战场及时打扫，也就是尸体要得到及时的清理。',
    },
    {
      section: '身体保障',
      text: '我们的身体想要维持正常的新陈代谢和生命活动，也要有两个保障：一个是营养能进得来，第二个是毒素垃圾能出得去。',
    },
    {
      section: '后勤基地',
      text: '影响战斗进行的因素：\n1. 粮食弹药和兵员数量不够，会不会影响战斗？\n2. 运输车不够，运力不足，会不会影响？\n3. 运输的道路不通，会不会影响？\n4. 如果运输车上装满了垃圾，没有足够的空间运输粮食弹药和兵源会不会影响？\n5. 如果天气太冷，道路结冰会不会影响运输？\n6. 战场上尸体不能够及时运出，腐烂发臭会不会影响战斗？\n7. 战士们心情不好会不会影响战斗？',
    },
    {
      section: '身体对应',
      text: '其实这跟我们的身体是一样的：\n1. 粮食弹药和兵源相当于我们的营养。\n2. 运输车的运力相当于我们气血的输送能力。\n3. 运输的道路相当于我们的循环系统。\n4. 运输车上的垃圾相当于我们血液里的油脂。\n5. 天气太冷，相当于身体里的寒湿气比较重。\n6. 战场上的尸体相当于我们体内新陈代谢产生的垃圾毒素。\n7. 战士们的心情相当于我们自己的情绪。\n8. 整体的战斗力相当于我们身体的免疫力。',
    },
    {
      section: '结论',
      text: '其中任何一个要素出现了问题，都会对我们的免疫力和健康造成影响。只有所有要素都处于良好状态，身体才能保持健康。',
    },
  ],
};

// 大扫除故事
export const CLEANING_STORY = {
  title: '大扫除的故事',
  content: `快过年的时候做过大扫除吗？

彻底大扫除要把垃圾从死角清理出去一共分两步：

第一步是把犄角旮旯里的垃圾：比如空调、油烟机里的垃圾清理出来，暂时先放在房间里。

第二步是再把房间里的垃圾都清理到外面。

如果在第一步清理的时候，你来检查，房间看起来会不会更脏、更乱、空气更加难闻？

那这个时候你应不应该阻止我？

为什么？

其实呢，因为你非常清楚，只要说再坚持一会儿这个房间就彻底干净了。

我们的身体健康也是一样，我们的细胞脏器里的毒素往外排，其实也是分两步的。第一步呢就是我们要把这个细胞和脏器里的毒素，首先清理出来，它会一开始放在哪里呢？是进入到我们的血液当中，这是第一步。第二步呢就是血液里的垃圾，在慢慢的清理到我们的身体外面。

如果说在细胞脏器的毒素清理到血液里的时候，你说人会不会更难受呢？会的。因为血液里突然多了这么多的垃圾毒素，那人肯定是难受。那假如说去医院检查指标会不会升高？会。

那你说这个时候你能制止我吗？你说你别别弄了，这个太难受了，这个身体都都出现变化了，这个这个赶紧停吧，能不能？不能。因为你现在清楚了。因为通过刚才大扫除的故事，你明白，只有说我们在坚持一段时间，让这些垃圾毒素彻底清出去，我们的身体才能够好转。`,
};

export type Symptom = typeof BODY_SYMPTOMS[0];
export type HealthElementKey = keyof typeof HEALTH_ELEMENTS;
export type HealthElement = typeof HEALTH_ELEMENTS[HealthElementKey];

// 身体语言自检表300项（完整版 - 根据文档21）
export const BODY_SYMPTOMS_300 = [
  // 头部相关
  { id: 301, name: '头疼', category: '头部', description: '经常头痛不适' },
  { id: 302, name: '头晕', category: '头部', description: '经常头晕不适' },
  { id: 303, name: '头麻', category: '头部', description: '头部麻木' },
  { id: 304, name: '脑鸣', category: '头部', description: '有脑鸣声' },
  { id: 305, name: '嗜睡', category: '头部', description: '白天精神不振，总是想睡觉' },
  { id: 306, name: '易醒', category: '头部', description: '夜间易醒' },
  { id: 307, name: '失眠', category: '头部', description: '入睡困难' },
  { id: 308, name: '多梦', category: '头部', description: '睡眠多梦' },
  { id: 309, name: '偏头痛', category: '头部', description: '一侧头痛' },
  { id: 310, name: '健忘', category: '头部', description: '记忆力下降' },
  { id: 311, name: '懒语', category: '头部', description: '说话减少' },
  { id: 312, name: '结巴', category: '头部', description: '言语不畅' },
  { id: 313, name: '晕车', category: '头部', description: '乘车时头晕恶心' },
  { id: 314, name: '晕机', category: '头部', description: '乘机时头晕恶心' },
  { id: 315, name: '头部怕冷', category: '头部', description: '头部怕冷，遇凉不适' },
  { id: 316, name: '思维断电', category: '头部', description: '思考时突然空白' },
  { id: 317, name: '反应迟钝', category: '头部', description: '反应速度变慢' },
  { id: 318, name: '易打哈欠', category: '头部', description: '经常不自觉打哈欠' },
  { id: 319, name: '头发稀少', category: '头部', description: '头发稀疏' },
  { id: 320, name: '头发干', category: '头部', description: '头发干燥' },
  { id: 321, name: '脱发', category: '头部', description: '头发易脱落' },
  { id: 322, name: '白发', category: '头部', description: '白发早生' },
  { id: 323, name: '斑秃', category: '头部', description: '局部脱发' },
  { id: 324, name: '头油腻', category: '头部', description: '头部油脂分泌旺盛' },
  { id: 325, name: '面油腻', category: '头部', description: '面部油脂分泌旺盛' },
  { id: 326, name: '面颊泛红', category: '头部', description: '面部泛红' },
  { id: 327, name: '面黄', category: '头部', description: '面色偏黄' },
  { id: 328, name: '面白', category: '头部', description: '面色偏白' },
  { id: 329, name: '面黑', category: '头部', description: '面色偏黑' },
  { id: 330, name: '痤疮', category: '头部', description: '面部痤疮' },
  { id: 331, name: '痘', category: '头部', description: '面部痘痘' },
  { id: 332, name: '斑', category: '头部', description: '面部色斑' },
  { id: 333, name: '唇白', category: '头部', description: '唇色偏白' },
  { id: 334, name: '唇青', category: '头部', description: '唇色偏青紫' },
  { id: 335, name: '唇麻', category: '头部', description: '嘴唇麻木' },
  { id: 336, name: '眼痒', category: '头部', description: '眼睛发痒' },
  { id: 337, name: '眼胀', category: '头部', description: '眼部肿胀' },
  { id: 338, name: '眼凸', category: '头部', description: '眼部凸出' },
  { id: 339, name: '眼痛', category: '头部', description: '眼部疼痛' },
  { id: 340, name: '眼怕光', category: '头部', description: '眼睛怕光' },
  { id: 341, name: '眼流泪', category: '头部', description: '眼睛易流泪' },
  { id: 342, name: '眼干涩', category: '头部', description: '眼干涩' },
  { id: 343, name: '眼飞影', category: '头部', description: '眼有飞蚊症' },
  { id: 344, name: '眼屎多', category: '头部', description: '眼部分泌物多' },
  { id: 345, name: '麦粒肿', category: '头部', description: '长麦粒肿' },
  { id: 346, name: '眼圈黑', category: '头部', description: '眼圈发黑' },
  { id: 347, name: '脂肪粒', category: '头部', description: '眼部有脂肪粒' },
  { id: 348, name: '眼仁黄', category: '头部', description: '眼白发黄' },
  { id: 349, name: '眉骨痛', category: '头部', description: '眉骨疼痛' },
  { id: 350, name: '眼圈浮肿', category: '头部', description: '眼圈浮肿' },
  { id: 351, name: '斜视', category: '头部', description: '斜视' },
  { id: 352, name: '视力模糊', category: '头部', description: '视力下降模糊' },
  { id: 353, name: '无泪', category: '头部', description: '眼泪分泌少' },
  { id: 354, name: '夜盲症', category: '头部', description: '暗处视力差' },
  { id: 355, name: '眼疲劳', category: '头部', description: '眼部容易疲劳' },
  // 五官相关
  { id: 356, name: '花眼', category: '五官', description: '老花眼' },
  { id: 357, name: '过敏', category: '五官', description: '容易过敏' },
  { id: 358, name: '白内障', category: '五官', description: '白内障' },
  { id: 359, name: '近视', category: '五官', description: '近视' },
  { id: 360, name: '远视', category: '五官', description: '远视' },
  { id: 361, name: '眉毛脱', category: '五官', description: '眉毛脱落' },
  { id: 362, name: '睫毛脱', category: '五官', description: '睫毛脱落' },
  { id: 363, name: '耳内潮湿', category: '五官', description: '耳内潮湿' },
  { id: 364, name: '耳内脓', category: '五官', description: '耳内有脓液' },
  { id: 365, name: '耳屎多', category: '五官', description: '耳部分泌物多' },
  { id: 366, name: '耳痛', category: '五官', description: '耳朵疼痛' },
  { id: 367, name: '耳痒', category: '五官', description: '耳朵发痒' },
  { id: 368, name: '耳鸣', category: '五官', description: '耳鸣' },
  { id: 369, name: '耳聋', category: '五官', description: '听力下降' },
  { id: 370, name: '听力下降', category: '五官', description: '听力不如从前' },
  { id: 371, name: '低热37-38度', category: '五官', description: '长期低热' },
  { id: 372, name: '不感冒', category: '五官', description: '很少感冒' },
  { id: 373, name: '易感冒', category: '五官', description: '经常感冒' },
  { id: 374, name: '鼻炎', category: '五官', description: '鼻炎' },
  { id: 375, name: '鼻塞', category: '五官', description: '鼻塞' },
  { id: 376, name: '鼻流涕', category: '五官', description: '鼻流涕' },
  { id: 377, name: '鼻流血', category: '五官', description: '流鼻血' },
  { id: 378, name: '打喷嚏', category: '五官', description: '易打喷嚏' },
  { id: 379, name: '打鼾', category: '五官', description: '睡觉打鼾' },
  { id: 345, name: '过敏性鼻炎', category: '五官', description: '过敏性鼻炎' },
  { id: 346, name: '酒糟鼻', category: '五官', description: '酒渣鼻' },
  { id: 347, name: '嗅觉不灵', category: '五官', description: '嗅觉不灵敏' },
  { id: 380, name: '口苦', category: '五官', description: '口苦' },
  { id: 381, name: '口干', category: '五官', description: '口干' },
  { id: 382, name: '口臭', category: '五官', description: '口臭' },
  { id: 383, name: '口腥', category: '五官', description: '口腥' },
  { id: 384, name: '口咸', category: '五官', description: '口咸' },
  { id: 385, name: '口甜', category: '五官', description: '口甜' },
  { id: 386, name: '口酸', category: '五官', description: '口酸' },
  { id: 387, name: '口气重', category: '五官', description: '口气重' },
  { id: 388, name: '口辣', category: '五官', description: '口辣' },
  { id: 389, name: '口腔溃疡', category: '五官', description: '口腔溃疡' },
  { id: 390, name: '舌溃疡', category: '五官', description: '舌头溃疡' },
  { id: 391, name: '舌苔厚', category: '五官', description: '舌苔厚' },
  { id: 392, name: '舌苔黄', category: '五官', description: '舌苔黄' },
  { id: 393, name: '舌苔腻', category: '五官', description: '舌苔腻' },
  { id: 394, name: '地图舌', category: '五官', description: '舌苔地图状' },
  { id: 395, name: '舌白点', category: '五官', description: '舌苔有白点' },
  { id: 396, name: '舌质紫暗', category: '五官', description: '舌质紫暗' },
  { id: 397, name: '舌硬', category: '五官', description: '舌头僵硬' },
  { id: 398, name: '舌颤', category: '五官', description: '舌头颤抖' },
  { id: 399, name: '口歪斜', category: '五官', description: '口歪斜' },
  { id: 400, name: '舌歪斜', category: '五官', description: '舌歪斜' },
  { id: 401, name: '唇裂', category: '五官', description: '唇裂' },
  { id: 402, name: '咽干', category: '五官', description: '咽喉干燥' },
  { id: 403, name: '喉咙痒', category: '五官', description: '喉咙发痒' },
  { id: 404, name: '喉咙痛', category: '五官', description: '喉咙疼痛' },
  // 咽喉相关
  { id: 405, name: '嗓子异物感', category: '咽喉', description: '咽部有异物感' },
  { id: 406, name: '声音嘶哑', category: '咽喉', description: '声音沙哑' },
  { id: 407, name: '牙齿松动', category: '咽喉', description: '牙齿松动' },
  { id: 408, name: '牙痛', category: '咽喉', description: '牙痛' },
  { id: 409, name: '虫牙', category: '咽喉', description: '蛀牙' },
  { id: 410, name: '磨牙', category: '咽喉', description: '磨牙' },
  { id: 411, name: '牙龈出血', category: '咽喉', description: '牙龈出血' },
  { id: 412, name: '牙龈肿', category: '咽喉', description: '牙龈肿痛' },
  { id: 413, name: '咳嗽', category: '咽喉', description: '咳嗽' },
  { id: 414, name: '哮喘', category: '咽喉', description: '哮喘' },
  { id: 415, name: '痰多', category: '咽喉', description: '痰多' },
  { id: 416, name: '痰黄', category: '咽喉', description: '痰色黄' },
  { id: 417, name: '痰凉', category: '咽喉', description: '痰色凉' },
  { id: 418, name: '痰白', category: '咽喉', description: '痰色白' },
  { id: 419, name: '痰黑', category: '咽喉', description: '痰色黑' },
  { id: 420, name: '痰血', category: '咽喉', description: '痰有血丝' },
  { id: 421, name: '支气管炎', category: '咽喉', description: '支气管炎' },
  // 循环系统
  { id: 422, name: '低血压', category: '循环系统', description: '血压偏低' },
  { id: 423, name: '高血压', category: '循环系统', description: '血压偏高' },
  { id: 424, name: '低血糖', category: '循环系统', description: '血糖偏低' },
  { id: 425, name: '高血糖', category: '循环系统', description: '血糖偏高' },
  { id: 426, name: '高血脂', category: '循环系统', description: '血脂偏高' },
  { id: 427, name: '贫血', category: '循环系统', description: '贫血' },
  { id: 428, name: '心绞痛', category: '循环系统', description: '心绞痛' },
  { id: 429, name: '心跳快', category: '循环系统', description: '心率快' },
  { id: 430, name: '心跳慢', category: '循环系统', description: '心率慢' },
  { id: 431, name: '心慌', category: '循环系统', description: '心慌' },
  { id: 432, name: '心律失常', category: '循环系统', description: '心律不齐' },
  { id: 433, name: '胸闷', category: '循环系统', description: '胸闷' },
  { id: 434, name: '胸痛', category: '循环系统', description: '胸痛' },
  { id: 435, name: '右肝区闷痛', category: '循环系统', description: '右肋下闷痛' },
  { id: 436, name: '心烦狂躁', category: '循环系统', description: '心烦易躁' },
  { id: 437, name: '性情急', category: '循环系统', description: '性情急躁' },
  { id: 438, name: '易怒', category: '循环系统', description: '易怒' },
  { id: 439, name: '叹气', category: '循环系统', description: '常叹气' },
  { id: 440, name: '气短', category: '循环系统', description: '气短' },
  { id: 441, name: '喘', category: '循环系统', description: '气喘' },
  { id: 442, name: '抑郁症', category: '循环系统', description: '抑郁症' },
  { id: 443, name: '无激情', category: '循环系统', description: '缺乏激情' },
  { id: 444, name: '冒冷汗', category: '循环系统', description: '冒冷汗' },
  { id: 445, name: '后背凉', category: '循环系统', description: '后背发凉' },
  { id: 446, name: '恶心', category: '循环系统', description: '恶心' },
  { id: 447, name: '打嗝', category: '循环系统', description: '打嗝' },
  { id: 448, name: '嗳气', category: '循环系统', description: '嗳气' },
  // 消化系统
  { id: 449, name: '消化不良', category: '消化系统', description: '消化不良' },
  { id: 450, name: '食欲差', category: '消化系统', description: '食欲差' },
  { id: 451, name: '易饱', category: '消化系统', description: '易饱胀' },
  { id: 452, name: '偏食', category: '消化系统', description: '偏食' },
  { id: 453, name: '厌食', category: '消化系统', description: '厌食' },
  { id: 454, name: '食欲过旺', category: '消化系统', description: '食欲异常旺盛' },
  { id: 455, name: '胃痛', category: '消化系统', description: '胃痛' },
  { id: 456, name: '胃酸', category: '消化系统', description: '反酸' },
  { id: 457, name: '胃胀', category: '消化系统', description: '胃胀' },
  { id: 458, name: '胃凉', category: '消化系统', description: '胃发凉' },
  { id: 459, name: '腹胀', category: '消化系统', description: '腹胀' },
  { id: 460, name: '屁多', category: '消化系统', description: '屁多' },
  { id: 461, name: '屁臭', category: '消化系统', description: '屁臭' },
  { id: 462, name: '大便不成形', category: '消化系统', description: '大便稀软不成形' },
  { id: 463, name: '便溏不净', category: '消化系统', description: '大便粘腻' },
  { id: 464, name: '便秘', category: '消化系统', description: '便秘' },
  // 四肢关节
  { id: 465, name: '肥胖', category: '四肢关节', description: '肥胖' },
  { id: 466, name: '将军肚', category: '四肢关节', description: '有将军肚' },
  { id: 467, name: '身体异味', category: '四肢关节', description: '身体有异味' },
  { id: 468, name: '容易扭伤', category: '四肢关节', description: '容易扭伤' },
  { id: 469, name: '四肢乏力', category: '四肢关节', description: '四肢无力' },
  { id: 470, name: '平衡差', category: '四肢关节', description: '平衡能力差' },
  { id: 471, name: '易摔跤', category: '四肢关节', description: '易摔跤' },
  { id: 472, name: '手麻', category: '四肢关节', description: '手麻木' },
  { id: 473, name: '足麻', category: '四肢关节', description: '脚麻木' },
  { id: 474, name: '手发青', category: '四肢关节', description: '手发青' },
  { id: 475, name: '足发青', category: '四肢关节', description: '脚发青' },
  { id: 476, name: '脚臭', category: '四肢关节', description: '脚臭' },
  { id: 477, name: '脚气', category: '四肢关节', description: '有脚气' },
  { id: 478, name: '皮肤易青', category: '四肢关节', description: '皮肤易出现青紫' },
  { id: 479, name: '皮肤红点', category: '四肢关节', description: '皮肤易出现红点' },
  { id: 480, name: '手脱皮', category: '四肢关节', description: '手掌脱皮' },
  { id: 481, name: '足脱皮', category: '四肢关节', description: '脚底脱皮' },
  { id: 482, name: '手冻疮', category: '四肢关节', description: '手易生冻疮' },
  { id: 483, name: '足冻疮', category: '四肢关节', description: '脚易生冻疮' },
  { id: 484, name: '手热', category: '四肢关节', description: '手发热' },
  { id: 485, name: '足热', category: '四肢关节', description: '脚发热' },
  { id: 486, name: '手凉', category: '四肢关节', description: '手发凉' },
  { id: 487, name: '足凉', category: '四肢关节', description: '脚发凉' },
  { id: 488, name: '手胀', category: '四肢关节', description: '手肿胀' },
  { id: 489, name: '足胀', category: '四肢关节', description: '脚肿胀' },
  { id: 490, name: '手出汗', category: '四肢关节', description: '手易出汗' },
  { id: 491, name: '足出汗', category: '四肢关节', description: '脚易出汗' },
  { id: 492, name: '皮肤痒', category: '四肢关节', description: '皮肤痒' },
  { id: 493, name: '后背痘', category: '四肢关节', description: '后背长痘' },
  { id: 494, name: '手抽搐', category: '四肢关节', description: '手抽搐' },
  { id: 495, name: '足抽搐', category: '四肢关节', description: '脚抽搐' },
  { id: 496, name: '手抖', category: '四肢关节', description: '手颤抖' },
  { id: 497, name: '足抖', category: '四肢关节', description: '脚颤抖' },
  { id: 498, name: '皮肤干燥', category: '四肢关节', description: '皮肤干燥' },
  { id: 499, name: '皮炎', category: '四肢关节', description: '有皮炎' },
  { id: 500, name: '牛羊藓', category: '四肢关节', description: '牛皮癣' },
  { id: 501, name: '白癜风', category: '四肢关节', description: '白癜风' },
  { id: 502, name: '黑痣变大', category: '四肢关节', description: '黑痣变大' },
  { id: 503, name: '黑痣增多', category: '四肢关节', description: '黑痣增多' },
  { id: 504, name: '各种过敏', category: '四肢关节', description: '各种过敏' },
  { id: 505, name: '湿疹', category: '四肢关节', description: '湿疹' },
  { id: 506, name: '淋巴肿大', category: '四肢关节', description: '淋巴结肿大' },
  { id: 507, name: '形体消瘦', category: '四肢关节', description: '体型消瘦' },
  { id: 508, name: '个头矮', category: '四肢关节', description: '身材矮小' },
  { id: 509, name: '发育慢', category: '四肢关节', description: '发育缓慢' },
  { id: 510, name: '体重突增10%', category: '四肢关节', description: '体重突然增加10%' },
  { id: 511, name: '体重突减10%', category: '四肢关节', description: '体重突然减少10%' },
  // 指甲相关
  { id: 512, name: '指甲易断', category: '指甲', description: '指甲容易断裂' },
  { id: 513, name: '手指倒刺', category: '指甲', description: '手指容易长倒刺' },
  { id: 514, name: '指甲凹', category: '指甲', description: '指甲凹陷' },
  { id: 515, name: '指甲竖纹', category: '指甲', description: '指甲有竖纹' },
  { id: 516, name: '半月痕无', category: '指甲', description: '指甲没有半月痕' },
  { id: 517, name: '半月痕少', category: '指甲', description: '指甲半月痕很少' },
  // 肿瘤相关
  { id: 518, name: '血管瘤', category: '肿瘤', description: '血管瘤' },
  { id: 519, name: '脂肪瘤', category: '肿瘤', description: '脂肪瘤' },
  { id: 520, name: '纤维瘤', category: '肿瘤', description: '纤维瘤' },
  { id: 521, name: '粉瘤', category: '肿瘤', description: '粉瘤' },
  { id: 522, name: '甲状腺结节', category: '肿瘤', description: '甲状腺结节' },
  { id: 523, name: '胆结石', category: '肿瘤', description: '胆结石' },
  { id: 524, name: '肾结石', category: '肿瘤', description: '肾结石' },
  { id: 525, name: '扁平疣', category: '肿瘤', description: '扁平疣' },
  { id: 526, name: '寻常疣', category: '肿瘤', description: '寻常疣' },
  { id: 527, name: '皮赘', category: '肿瘤', description: '皮赘' },
  { id: 528, name: '鸡眼', category: '肿瘤', description: '鸡眼' },
  { id: 529, name: '小腿浮肿', category: '肿瘤', description: '小腿浮肿' },
  { id: 530, name: '自汗', category: '肿瘤', description: '自汗' },
  { id: 531, name: '多汗', category: '肿瘤', description: '多汗' },
  { id: 532, name: '盗汗', category: '肿瘤', description: '盗汗' },
  // 泌尿生殖
  { id: 533, name: '性欲低', category: '泌尿生殖', description: '性欲低下' },
  { id: 534, name: '起夜', category: '泌尿生殖', description: '夜尿多' },
  { id: 535, name: '尿频', category: '泌尿生殖', description: '尿频' },
  { id: 536, name: '尿急', category: '泌尿生殖', description: '尿急' },
  { id: 537, name: '尿不净', category: '泌尿生殖', description: '尿不净' },
  { id: 538, name: '尿床', category: '泌尿生殖', description: '尿床' },
  { id: 539, name: '尿痛', category: '泌尿生殖', description: '尿痛' },
  { id: 540, name: '尿血', category: '泌尿生殖', description: '尿血' },
  { id: 541, name: '尿分叉', category: '泌尿生殖', description: '尿分叉' },
  { id: 542, name: '尿等待', category: '泌尿生殖', description: '尿等待' },
  { id: 543, name: '尿道口灼烧', category: '泌尿生殖', description: '尿道口灼烧' },
  { id: 544, name: '尿道口发炎', category: '泌尿生殖', description: '尿道口发炎' },
  { id: 545, name: '浓尿', category: '泌尿生殖', description: '尿液浓稠' },
  { id: 546, name: '怪味尿', category: '泌尿生殖', description: '尿液有怪味' },
  { id: 547, name: '尿浑浊', category: '泌尿生殖', description: '尿液浑浊' },
  { id: 548, name: '尿多沫', category: '泌尿生殖', description: '尿液有泡沫' },
  { id: 549, name: '脚后跟疼', category: '泌尿生殖', description: '脚后跟疼痛' },
  // 妇科相关
  { id: 550, name: '乳头凹陷', category: '妇科', description: '乳头凹陷' },
  { id: 551, name: '乳头流脓', category: '妇科', description: '乳头流脓' },
  { id: 552, name: '乳房肿块', category: '妇科', description: '乳房有肿块' },
  { id: 553, name: '乳房增生', category: '妇科', description: '乳房增生' },
  { id: 554, name: '不孕不育', category: '妇科', description: '不孕不育' },
  { id: 555, name: '流产', category: '妇科', description: '流产史' },
  { id: 556, name: '死胎', category: '妇科', description: '死胎史' },
  { id: 557, name: '月经少', category: '妇科', description: '月经量少' },
  { id: 558, name: '月经有块', category: '妇科', description: '经血有血块' },
  { id: 559, name: '经期头痛', category: '妇科', description: '经期头痛' },
  { id: 560, name: '月经量少', category: '妇科', description: '月经量少' },
  { id: 561, name: '经期时长', category: '妇科', description: '经期持续时间异常' },
  { id: 562, name: '经期推后', category: '妇科', description: '经期推迟' },
  { id: 563, name: '月经有血块', category: '妇科', description: '经血有血块' },
  { id: 564, name: '乳腺增生', category: '妇科', description: '乳腺增生' },
  { id: 565, name: '经期腰痛', category: '妇科', description: '经期腰痛' },
  { id: 566, name: '经期提前', category: '妇科', description: '经期提前' },
  { id: 567, name: '月经量多', category: '妇科', description: '月经量多' },
  // 颈肩腰腿
  { id: 568, name: '肩酸', category: '颈肩腰腿', description: '肩部酸痛' },
  { id: 569, name: '肩麻', category: '颈肩腰腿', description: '肩部麻木' },
  { id: 570, name: '肩痛', category: '颈肩腰腿', description: '肩部疼痛' },
  { id: 571, name: '易落枕', category: '颈肩腰腿', description: '易落枕' },
  { id: 572, name: '脖子硬', category: '颈肩腰腿', description: '脖子僵硬' },
  { id: 573, name: '颈部水牛背', category: '颈肩腰腿', description: '颈部脂肪堆积' },
  { id: 574, name: '颈疼痛', category: '颈肩腰腿', description: '颈部疼痛' },
  { id: 575, name: '颈凉', category: '颈肩腰腿', description: '颈部发凉' },
  { id: 576, name: '腰酸痛', category: '颈肩腰腿', description: '腰酸痛' },
  { id: 577, name: '腰凉', category: '颈肩腰腿', description: '腰部发凉' },
  { id: 578, name: '游走性疼痛', category: '颈肩腰腿', description: '游走性疼痛' },
  { id: 579, name: '脊椎僵硬', category: '颈肩腰腿', description: '脊椎僵硬' },
  { id: 580, name: '脊椎疼痛', category: '颈肩腰腿', description: '脊椎疼痛' },
  { id: 581, name: '关节痛', category: '颈肩腰腿', description: '关节疼痛' },
  { id: 582, name: '关节肿', category: '颈肩腰腿', description: '关节肿胀' },
  { id: 583, name: '静脉曲张', category: '颈肩腰腿', description: '静脉曲张' },
  // 肛肠相关
  { id: 584, name: '肛门瘙痒', category: '肛肠', description: '肛门瘙痒' },
  { id: 585, name: '便血', category: '肛肠', description: '便血' },
  { id: 586, name: '痔疮', category: '肛肠', description: '痔疮' },
  { id: 587, name: '脱肛', category: '肛肠', description: '脱肛' },
  { id: 588, name: '肛裂', category: '肛肠', description: '肛裂' },
  { id: 589, name: '肛瘘', category: '肛肠', description: '肛瘘' },
  // 男性相关
  { id: 590, name: '睾丸肿块', category: '男性', description: '睾丸肿块' },
  { id: 591, name: '疝气', category: '男性', description: '疝气' },
  // 其他症状
  { id: 592, name: '其他症状', category: '其他', description: '其他症状' },
  { id: 593, name: '手术史', category: '其他', description: '手术史' },
  { id: 594, name: '其他疾病', category: '其他', description: '其他疾病' },
  { id: 595, name: '症状合计', category: '其他', description: '症状统计' },
];
