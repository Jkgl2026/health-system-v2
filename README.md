# 健康自检后台系统 - 快速开始指南

## 🚀 3分钟快速启动

### 前提条件

- Node.js 24+
- PostgreSQL 14+
- pnpm

### 步骤1：安装依赖

```bash
pnpm install
```

### 步骤2：配置数据库

```bash
# 创建数据库
createdb health_check_db

# 恢复结构
psql health_check_db < health_check_db_schema.sql

# 恢复数据（包含1管理员+14测试用户）
psql health_check_db < health_check_db_data.sql
```

### 步骤3：配置数据库连接

编辑 `src/lib/db.ts`，修改数据库密码：

```typescript
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'health_check_db',
  user: 'postgres',
  password: 'your_password',  // 修改为你的PostgreSQL密码
});
```

### 步骤4：启动项目

```bash
pnpm run dev
```

### 步骤5：访问系统

- 地址：http://localhost:5000
- 账号：admin
- 密码：123456

---

## 📚 完整文档

| 文档 | 说明 |
|------|------|
| [交付物使用指南](./健康自检后台系统-交付物使用指南.md) | 交付物总览和使用说明 |
| [完整开发文档](./健康自检后台系统-完整开发文档.md) | 开发文档，包含功能说明和代码结构 |
| [最终验收清单](./健康自检后台系统-最终验收清单.md) | 验收清单，逐项检查标准 |
| [部署操作手册](./健康自检后台系统-部署操作手册.md) | 部署操作手册，部署全流程 |
| [完整交付清单](./健康自检后台系统-完整交付清单.md) | 交付清单，所有交付物列表 |

---

## 🎯 核心功能

1. **用户管理**：查看、添加、编辑、删除用户
2. **用户详情**：超详细展示所有健康数据和分析
3. **多用户对比**：支持1-3人全字段对比
4. **健康分析**：自动生成专业、详细的健康分析报告
5. **数据导出**：支持Excel导出
6. **权限控制**：完善的登录验证和权限管理

---

## 🔧 Coze对接

### 新增用户

```bash
curl -X POST http://localhost:5000/api/user/add \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "phone": "13800138000",
    "age": 30,
    "gender": "男",
    "height": 175,
    "weight": 70,
    "job": "软件工程师",
    "complete": 100,
    "health_status": "良好",
    "health_score": 80,
    "score_life": 75,
    "score_sleep": 85,
    "score_stress": 78,
    "score_body": 82,
    "score_risk": 80,
    "done_self_check": true,
    "done_require": true,
    "answer_content": "{\"问题1\":\"答案1\",\"问题2\":\"答案2\"}",
    "analysis": "健康分析内容..."
  }'
```

### 更新用户

```bash
curl -X POST http://localhost:5000/api/user/update \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "health_score": 85,
    "analysis": "更新后的健康分析..."
  }'
```

---

## 📊 测试数据

系统已预置15条测试数据：

- **管理员**：1个（admin/123456）
- **测试用户**：14个（包含不同健康状态）

| 健康状态 | 数量 |
|----------|------|
| 优秀 | 5 |
| 良好 | 3 |
| 一般 | 4 |
| 异常 | 2 |

---

## ❓ 常见问题

### Q1：数据库连接失败

检查PostgreSQL服务是否运行：
```bash
sudo systemctl status postgresql
```

### Q2：端口被占用

查看占用端口的进程：
```bash
lsof -i :5000
```

### Q3：依赖安装失败

尝试使用npm：
```bash
npm install
```

---

## 🎉 开始使用

1. 启动项目：`pnpm run dev`
2. 访问：http://localhost:5000
3. 登录：admin / 123456
4. 开始使用！

---

**项目状态**：100%完成  
**可部署**：✅ 是  
**文档完整**：✅ 是  

祝使用愉快！🚀
