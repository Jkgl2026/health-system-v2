# 健康自检应用 - 管理后台使用指南

## 功能概述

本应用现已集成数据库功能和管理后台，管理员可以查看和管理所有用户的健康自检数据。

## 管理后台功能

### 1. 用户数据管理
- 查看所有用户列表
- 查看用户详细数据（症状自检、健康要素分析、方案选择、要求完成情况）
- 统计数据展示（总用户数、完成自检数、完成分析数、已选择方案数）

### 2. 数据存储
所有用户数据自动保存到 PostgreSQL 数据库：
- 用户基本信息（姓名、手机号、邮箱、年龄、性别）
- 症状自检结果（300项身体语言自检）
- 健康要素分析（气血、循环、毒素、血脂、寒凉、免疫、情绪）
- 用户选择（调理方案）
- 四个要求完成情况

## 管理员设置

### 初始化管理员账号

首次使用时，需要创建一个管理员账号。使用以下 API：

```bash
curl -X POST http://localhost:5000/api/init-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "name": "系统管理员"
  }'
```

**注意**：此 API 仅用于首次设置，请妥善保管管理员账号和密码。

### 默认管理员账号

为了方便测试，已创建以下默认管理员账号：
- 用户名：`admin`
- 密码：`admin123`

**重要提示**：生产环境中请修改默认密码或删除此账号，使用更强的密码！

## 访问管理后台

### 1. 登录页面
访问：`http://localhost:5000/admin/login`

输入管理员用户名和密码登录。

### 2. 管理后台主页
登录成功后自动跳转到：`http://localhost:5000/admin/dashboard`

## API 端点说明

### 用户相关
- `POST /api/user` - 创建用户
- `GET /api/user?userId=xxx` - 获取用户信息
- `GET /api/user?phone=xxx` - 通过手机号获取用户

### 症状自检
- `POST /api/symptom-check` - 保存症状自检结果
- `GET /api/symptom-check?userId=xxx` - 获取用户的自检记录

### 健康要素分析
- `POST /api/health-analysis` - 保存健康要素分析
- `GET /api/health-analysis?userId=xxx` - 获取用户的分析记录

### 用户选择
- `POST /api/user-choice` - 保存用户选择
- `GET /api/user-choice?userId=xxx` - 获取用户的选择记录

### 四个要求
- `POST /api/requirements` - 保存或更新要求完成情况
- `GET /api/requirements?userId=xxx` - 获取用户的要求完成情况

### 管理员相关
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/users` - 获取所有用户列表（分页）
- `GET /api/admin/users/{userId}` - 获取指定用户的完整数据

## 数据库表结构

### users
用户基本信息表
- id (主键)
- name
- phone
- email
- age
- gender
- created_at
- updated_at

### symptom_checks
症状自检结果表
- id (主键)
- user_id (外键)
- checked_symptoms (JSON数组)
- total_score
- element_scores (JSON对象)
- checked_at

### health_analysis
健康要素分析表
- id (主键)
- user_id (外键)
- qi_and_blood (气血)
- circulation (循环)
- toxins (毒素)
- blood_lipids (血脂)
- coldness (寒凉)
- immunity (免疫)
- emotions (情绪)
- overall_health (整体健康评分)
- analyzed_at

### user_choices
用户选择表
- id (主键)
- user_id (外键)
- plan_type (方案类型)
- plan_description (方案描述)
- selected_at

### requirements
四个要求完成情况表
- id (主键)
- user_id (外键)
- requirement1_completed
- requirement2_completed
- requirement3_completed
- requirement4_completed
- requirement2_answers (JSON对象)
- completed_at
- updated_at

### admins
管理员表
- id (主键)
- username (唯一)
- password (实际生产环境应加密)
- name
- is_active
- created_at
- updated_at

## 用户数据流

1. 用户开始健康自检 → 自动生成用户ID
2. 填写身体语言简表 → 保存到 `symptom_checks` 表
3. 完成健康要素分析 → 保存到 `health_analysis` 表
4. 选择调理方案 → 保存到 `user_choices` 表
5. 完成四个要求 → 保存到 `requirements` 表

## 技术栈

- 数据库：PostgreSQL
- ORM：Drizzle ORM
- 后端：Next.js API Routes
- 前端：React 19 + shadcn/ui

## 安全注意事项

1. **密码安全**：当前示例中的管理员密码是明文存储的，生产环境必须使用 bcrypt 等加密方式
2. **访问控制**：管理后台目前使用 localStorage 存储登录状态，建议使用 JWT 或 session
3. **数据验证**：所有 API 都进行了数据验证，确保数据完整性
4. **SQL 注入**：使用 Drizzle ORM 有效防止 SQL 注入

## 故障排查

### 无法登录管理后台
- 检查管理员账号是否正确
- 确认密码输入无误
- 查看浏览器控制台是否有错误信息

### 用户数据未保存
- 检查数据库连接是否正常
- 查看浏览器控制台的网络请求
- 检查 API 响应是否有错误

### 管理后台页面加载慢
- 首次加载数据可能需要一些时间
- 检查网络连接
- 查看服务器日志

## 未来改进建议

1. 添加用户搜索和筛选功能
2. 支持导出用户数据为 Excel/CSV
3. 添加数据可视化图表
4. 实现更完善的权限管理
5. 添加操作日志记录
6. 支持批量操作用户数据
