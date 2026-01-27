# 课程智能匹配系统说明

## 概述

本系统已成功将课程.docx中的所有课程（72门）导入到数据库中，并实现了智能匹配功能。课程默认设置为隐藏状态（不在用户端显示），但会根据用户的症状、健康要素、选择等信息进行精准匹配。

## 课程分类

系统包含以下课程模块：

1. **因果系列**（5门）
   - 疾病为什么会反复
   - 如何用两个字解读疾病
   - 如何用因果解决疾病
   - 找到病因就能去根
   - 不懂因果，错上加错

2. **寒湿系列**（4门）
   - 预防流感的五个要素
   - 温度解百病
   - 气血平衡，让你的生活变得更美好
   - 会坐月子能去病

3. **排毒系列**（5门）
   - 如何解读排毒反应
   - 你知道身体有哪八个救命的排毒口吗
   - 排毒的四大好处
   - 让家人远离大病的秘密
   - 你欠身体的账还的越早，风险越小

4. **微循环系列**（2门）
   - 大病查出来为什么到晚期（上）
   - 大病查出来为什么到晚期（下）

5. **免疫力系列**（4门）
   - 这个世界上没有治百病的药，但是有调百病的方法
   - 我们的免疫力，为什么比十年前下降了
   - 孩子对不起，我们知道的太晚了
   - 父母体质好，孩子生病少

6. **恢复健康七要素**（2门）
   - 恢复健康的速度，由你自己的七个要素决定
   - 为什么坚持一辈子容易，坚持几个月却很难

7. **生活习惯**（7门）
   - 错误的睡眠会让你提前衰老
   - 改变坏习惯容易半途而废，是因为误读身体的两个信号
   - 不是疾病年轻化，而是不良生活习惯年轻化
   - 要想活得好，运动不能少
   - 对生活习惯的放纵，就是对健康的放弃
   - 坏习惯不改掉，可改换掉
   - 熬夜是坏习惯之首

8. **饮食习惯**（6门）
   - 吃的越好，死的越早
   - 身体垃圾越多，越喜欢垃圾食品
   - 你误解了营养
   - 三种剩饭不能吃
   - 餐桌上的六个常识
   - 别把好吃的当营养

9. **身心灵健康**（8门）
   - 如何快速放下痛苦
   - 让身心灵健康，只需要一杆秤
   - 幸福也是一种能力，需要训练
   - 是谁在折磨你，就是自己的性格
   - 自私是对家人最大的伤害
   - 让心灵健康弥补身体的残缺
   - 亲情可救人，冷漠可杀人
   - 我们的身体需要一个家，...叫做善良

10. **健康观念**（17门）
    - 人不是死于疾病，而是死于无知
    - 一个害了四代人的矛盾理论，却无人解读
    - 为什么治疗疑难杂症的全是中医
    - 人民健康，还医于民
    - 如果你重视身体语言，将会有无数次机会救自己
    - 如果读懂中西医的区别，小心留下终身遗憾
    - 为什么健康离不开中医
    - 只图一时之快，都让健康与你无缘
    - 解读中西文化的差异，别走入温度的误区
    - 你读过人体使用说明书吗
    - 你能听懂身体喊救命的语言吗
    - 自检就是自救
    - 六问良性，让你清醒
    - 指标正常，不等于健康
    - 我帮你算算你的健康值多少钱
    - 亚健康是个筐，找不到病因往里装
    - 把好健康一道关，观念能救一代人
    - 身体与信用卡一样，一旦透支就叫过劳死
    - 决定健康的三个要素
    - 健康观念拯救家族
    - 一场病，救了全家人的命
    - 比流感更可怕的误区
    - 方向转换，奇迹出现
    - 让每个家庭都有一个懂健康的孩子

11. **心脑血管疾病**（3门）
    - 一个成语拯救2.5亿个家庭
    - 如何让你家人远离心脑血管疾病（2门）

12. **糖尿病**（2门）
    - 解读糖尿病的七个误区，你有可能救人一命
    - 不是疾病年轻化了，而是坏习惯年轻化

## 智能匹配逻辑

系统根据以下因素进行课程匹配：

### 1. 症状匹配（权重最高）
- 根据用户选中的症状ID匹配相关课程
- 每个匹配的症状加3分

### 2. 健康要素匹配（权重高）
- 根据健康分析结果（气血、循环、毒素、血脂、寒凉、免疫、情绪）
- 匹配相关健康要素的课程
- 根据要素得分计算权重（最多加10分）

### 3. 不良生活习惯匹配（权重中等）
- 根据生活习惯类型匹配课程
- 饮食习惯（ID 1-69）、睡眠习惯（ID 70-79）等
- 匹配到相关习惯加5分

### 4. 方案类型匹配
- 选择"系统调理"时，所有课程额外加2分

### 5. 课程优先级
- 根据课程预设的优先级调整分数

### 相关性等级
- **高相关（high）**：匹配分数 ≥ 15分
- **中等相关（medium）**：匹配分数 ≥ 8分
- **低相关（low）**：匹配分数 < 8分

## API接口

### 1. 课程匹配API
**POST** `/api/courses/match`

请求体：
```json
{
  "selectedSymptoms": [72, 48, 49, 55, 75],
  "healthAnalysis": {
    "qiAndBlood": 8,
    "circulation": 5,
    "toxins": 4,
    "bloodLipids": 6,
    "coldness": 4,
    "immunity": 3,
    "emotions": 5
  },
  "selectedChoice": "choice3",
  "badHabitsChecklist": [1, 8, 12, 13, 27, 58]
}
```

响应：
```json
{
  "success": true,
  "courses": [
    {
      "id": "86",
      "title": "一个成语拯救2.5亿个家庭",
      "content": "通过\"治标治本\"这个成语，理解心脑血管疾病的预防和调理。",
      "duration": "10分钟",
      "module": "心脑血管疾病",
      "courseNumber": 6,
      "season": "第1季",
      "relevance": "high",
      "matchScore": 37,
      "matchReasons": [
        "匹配到 5 个相关症状",
        "匹配健康要素，得分 15",
        "系统调理需要学习课程"
      ]
    }
  ]
}
```

### 2. 推荐课程API
**GET** `/api/courses/recommend?symptoms=72,48,49,55,75`

响应：
```json
{
  "success": true,
  "courses": [...],
  "total": 3
}
```

### 3. 管理后台API
**GET** `/api/admin/courses`

获取所有课程（包括隐藏的课程）。

**POST** `/api/admin/courses`

添加新课程。

### 4. 测试API
**GET** `/api/test-course-matching`

测试课程匹配功能，返回测试用例结果。

## 使用示例

### 前端集成

```typescript
// 调用课程匹配API
const response = await fetch('/api/courses/match', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    selectedSymptoms: [72, 48, 49, 55, 75],
    healthAnalysis: {
      circulation: 5,
      bloodLipids: 6,
      coldness: 4,
    },
    selectedChoice: 'choice3',
  }),
});

const data = await response.json();
console.log('匹配课程:', data.courses);
```

### 根据症状获取推荐

```typescript
// 根据症状ID获取推荐课程
const response = await fetch('/api/courses/recommend?symptoms=72,48,49,55,75');
const data = await response.json();
console.log('推荐课程:', data.courses);
```

## 课程数据结构

```typescript
interface Course {
  id: string;                    // 课程ID
  title: string;                 // 课程标题
  content: string;               // 课程内容
  duration: string;              // 课程时长
  module: string;                // 课程模块
  relatedElements: string[];     // 相关健康要素
  relatedSymptoms: number[];     // 相关症状ID
  relatedDiseases: string[];     // 相关疾病
  priority: number;              // 优先级
  isHidden: boolean;             // 是否隐藏
  courseNumber: number;          // 课程编号
  season: string;                // 季度
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}
```

## 注意事项

1. **课程隐藏状态**：所有课程默认设置为隐藏（isHidden = true），不会在用户端直接显示。

2. **智能匹配**：课程会根据用户的症状、健康要素、选择等信息进行智能匹配，确保推荐的相关性和准确性。

3. **避免乱匹配**：系统通过多维度匹配算法（症状、健康要素、生活习惯、方案类型等），确保课程推荐精准，避免乱匹配。

4. **匹配权重**：症状匹配权重最高，健康要素匹配权重次之，生活习惯匹配权重中等。

5. **相关性分级**：根据匹配分数将课程分为高、中、低三个相关性等级，便于用户了解课程的相关程度。

## 扩展说明

### 添加新课程

可以通过管理后台API添加新课程：

```typescript
const response = await fetch('/api/admin/courses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: '新课程标题',
    content: '课程内容',
    duration: '10分钟',
    module: '健康观念',
    relatedElements: ['气血', '循环'],
    relatedSymptoms: [1, 2, 3],
    relatedDiseases: ['气血不足'],
    priority: 5,
    isHidden: true,
    courseNumber: 100,
    season: '第5季',
  }),
});
```

### 自定义匹配逻辑

可以在 `src/lib/courseMatcher.ts` 中修改 `calculateCourseMatch` 方法来自定义匹配逻辑。

## 总结

本课程智能匹配系统已成功：
1. ✅ 导入72门课程到数据库
2. ✅ 设置课程隐藏状态（不在用户端显示）
3. ✅ 实现多维度智能匹配（症状、健康要素、生活习惯、方案类型）
4. ✅ 避免乱匹配，确保精准推荐
5. ✅ 提供完整的API接口和管理功能
