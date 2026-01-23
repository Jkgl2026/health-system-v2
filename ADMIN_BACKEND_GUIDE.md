# 管理后台使用指南

## 概述

健康自检应用的管理后台，用于查看和管理用户数据、自检结果、健康分析等信息。

## 功能特性

### 1. 用户列表
- 显示所有注册用户
- 支持按姓名或手机号搜索
- 显示用户基本信息、健康评分、完成状态等

### 2. 用户详情
- **个人信息**：姓名、年龄、性别、BMI、职业、地址等
- **健康要素分析**：以柱状图形式展示气血、循环、毒素、血脂、寒凉、免疫、情绪得分
- **症状自检结果**：显示300症状自检的总分和各要素得分
- **方案选择**：显示用户选择的调理方案类型和描述
- **四个要求完成情况**：
  - 要求1：完成状态
  - 要求2：完成状态及回答内容
  - 要求3：完成状态
  - 要求4：完成状态
- **持续跟进落实健康的七问**：显示用户对7个问题的回答（如果有数据）

### 3. 数据导出
- 支持导出所有用户数据为CSV格式
- 包含完整用户信息和健康数据

### 4. 管理员账号管理
- 支持创建管理员账号
- 密码使用bcrypt加密存储

## 访问管理后台

### 本地开发
```
http://localhost:5000/admin
```

### 登录信息
默认管理员账号：
- 用户名：`admin`
- 密码：`admin123`

## API接口

### 管理后台API
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/users` - 获取用户列表（支持分页和搜索）
- `GET /api/admin/users/:id` - 获取用户详情
- `GET /api/admin/export` - 导出用户数据

### 数据诊断API
- `GET /api/diagnose-db` - 诊断数据库状态
- `GET /api/check-user-seven-questions?userId=xxx` - 检查用户的七问数据

### 数据迁移API
- `POST /api/migrate-db` - 安全地添加缺失的数据库列（不删除数据）

### 测试API
- `POST /api/add-test-seven-questions` - 创建带七问数据的测试用户

## 数据库表结构

### users（用户表）
```sql
- id: 用户ID
- name: 姓名
- phone: 手机号
- age: 年龄
- gender: 性别
- weight: 体重
- height: 身高
- blood_pressure: 血压
- occupation: 职业
- address: 地址
- bmi: 身体质量指数
- created_at: 创建时间
- updated_at: 更新时间
```

### symptom_checks（症状自检表）
```sql
- id: 自检记录ID
- user_id: 用户ID
- checked_symptoms: 选中的症状（JSONB）
- total_score: 总分
- element_scores: 各要素得分（JSONB）
- checked_at: 检查时间
```

### health_analysis（健康要素分析表）
```sql
- id: 分析记录ID
- user_id: 用户ID
- qi_and_blood: 气血得分
- circulation: 循环得分
- toxins: 毒素得分
- blood_lipids: 血脂得分
- coldness: 寒凉得分
- immunity: 免疫得分
- emotions: 情绪得分
- overall_health: 整体健康评分
- analyzed_at: 分析时间
```

### user_choices（用户选择表）
```sql
- id: 选择记录ID
- user_id: 用户ID
- plan_type: 方案类型
- plan_description: 方案描述
- selected_at: 选择时间
```

### requirements（四个要求表）
```sql
- id: 记录ID
- user_id: 用户ID
- requirement1_completed: 要求1完成状态
- requirement2_completed: 要求2完成状态
- requirement3_completed: 要求3完成状态
- requirement4_completed: 要求4完成状态
- requirement2_answers: 要求2的回答（JSONB）
- seven_questions_answers: 七问答案（JSONB）
- completed_at: 完成时间
- updated_at: 更新时间
```

### admins（管理员表）
```sql
- id: 管理员ID
- username: 用户名
- password: 密码（加密）
- name: 姓名
- is_active: 是否激活
- created_at: 创建时间
- updated_at: 更新时间
```

## 常见问题

### Q: 管理后台无法显示七问数据？
A: 请检查数据库requirements表是否有`seven_questions_answers`列。如果没有，使用迁移API：
```bash
curl -X POST http://localhost:5000/api/migrate-db
```

### Q: 如何创建带七问数据的测试用户？
A: 使用测试API：
```bash
curl -X POST http://localhost:5000/api/add-test-seven-questions
```

### Q: 如何诊断数据库状态？
A: 使用诊断API：
```bash
curl http://localhost:5000/api/diagnose-db
```

### Q: 数据导出功能在哪里？
A: 在管理后台的"数据导出"页面，点击"导出数据"按钮即可下载CSV文件。

### Q: 如何添加新的管理员账号？
A: 可以通过数据库直接插入，或使用admin的init/reset功能。

## 安全注意事项

1. **密码安全**：所有密码都使用bcrypt加密存储
2. **访问控制**：管理后台需要登录验证
3. **数据隔离**：用户数据通过user_id关联，确保数据安全
4. **CSRF防护**：API端点需要适当的验证

## 开发提示

### 修改管理后台界面
文件位置：`src/app/admin/dashboard/page.tsx`

### 修改API逻辑
文件位置：`src/app/api/admin/...`

### 修改数据库schema
请参考 `DATABASE_MIGRATION_GUIDE.md`，使用迁移而不是重新初始化！

### 添加新的数据展示
1. 在schema.ts中定义新字段
2. 使用迁移API添加数据库列
3. 在healthDataManager中添加相应方法
4. 在管理后台添加展示逻辑

## 性能优化

- 使用数据库索引优化查询性能
- 分页加载用户列表，避免一次性加载大量数据
- 使用懒加载和虚拟滚动优化长列表渲染
- 缓存常用数据减少数据库查询

---

**如有问题，请参考DATABASE_MIGRATION_GUIDE.md或查看代码注释。**
