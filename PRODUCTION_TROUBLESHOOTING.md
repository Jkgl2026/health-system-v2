# 生产环境问题排查指南

## 新功能：智能错误提示

个人信息页面现在包含详细的错误捕获和显示功能：

### 错误提示功能
- ✅ 显示详细的错误信息和建议
- ✅ 一键复制完整错误报告
- ✅ 可展开查看技术细节
- ✅ 提供快速解决步骤

### 使用方法
当保存失败时，页面会自动显示：
1. **错误摘要** - 主要错误信息和解决建议
2. **详细信息** - 点击"查看详细信息"展开
3. **复制按钮** - 点击"复制错误信息"一键复制
4. **快速步骤** - 常见问题的解决步骤

详见：[ERROR_REPORT_GUIDE.md](./ERROR_REPORT_GUIDE.md)

---

## 问题描述
在生产环境（x4mrwzmnw9.coze.site）输入个人信息后，提示"保存失败，请重试"。

## 修复内容

### 1. 增强错误处理和日志记录
已在以下文件中添加详细的日志记录：

- `src/app/personal-info/page.tsx` - 前端页面，添加详细的控制台日志和错误提示
- `src/app/api/user/route.ts` - API 路由，添加详细的请求和响应日志
- `src/storage/database/healthDataManager.ts` - 数据库管理器，添加详细的操作日志

### 2. 新增健康检查 API
- `src/app/api/health/route.ts` - 检查数据库连接状态和表是否存在

## 生产环境调试步骤

### 步骤 1：检查数据库连接
在生产环境访问以下 URL 检查数据库状态：
```
https://x4mrwzmnw9.coze.site/api/health
```

**预期响应：**
```json
{
  "success": true,
  "database": {
    "connected": true,
    "currentTime": "2026-01-23 15:45:03.172089+08",
    "tables": ["admins", "health_analysis", "requirements", "symptom_checks", "user_choices", "users"],
    "userCount": 0
  }
}
```

**如果响应失败：**
- `connected: false` - 数据库连接问题，请联系 Coze 平台检查数据库配置
- `tables` 数组不完整或为空 - 数据库表未创建，需要执行步骤 2

### 步骤 2：初始化数据库表结构
如果健康检查返回 `tables` 数组不完整或为空，需要初始化数据库表。

**方法 1：通过 API 初始化（推荐）**
```bash
curl -X POST https://x4mrwzmnw9.coze.site/api/init-db
```

**方法 2：如果方法 1 失败，通过 Coze CLI 初始化**
在本地项目根目录执行：
```bash
coze-coding-ai db upgrade
```

### 步骤 3：初始化管理员账号
数据库初始化后，需要创建管理员账号：
```bash
curl -X POST https://x4mrwzmnw9.coze.site/api/init-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "name": "管理员"
  }'
```

### 步骤 4：测试用户创建
测试个人信息保存功能：
```bash
curl -X POST https://x4mrwzmnw9.coze.site/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "gender": "男",
    "age": 30,
    "weight": 70,
    "height": 175,
    "bmi": 22.9
  }'
```

**预期响应：**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "测试用户",
    ...
  }
}
```

## 常见问题排查

### 问题 1：数据库连接超时
**症状：** API 返回 500 错误，日志显示 `ETIMEDOUT`

**解决方案：**
1. 检查生产环境数据库配置是否正确
2. 联系 Coze 平台技术支持，检查数据库服务状态

### 问题 2：表不存在
**症状：** 保存失败，错误信息包含 `relation "users" does not exist`

**解决方案：**
执行步骤 2 初始化数据库表结构

### 问题 3：外键约束错误
**症状：** 保存症状自检、健康分析等数据时失败，错误信息包含 `violates foreign key constraint`

**解决方案：**
1. 确保用户已成功创建
2. 检查用户 ID 是否正确

### 问题 4：网络请求失败
**症状：** 前端显示"保存失败"，但后端没有日志

**解决方案：**
1. 检查浏览器控制台的网络请求
2. 确认 API URL 是否正确
3. 检查 CORS 配置

### 问题 5：API 返回非 JSON 响应
**症状：** 保存失败，错误信息显示 "Unexpected token'I', "Internal S".is not valid JSON"

**原因分析：**
- 服务器返回了 500 错误，但响应体是 HTML 页面而不是 JSON
- 这通常发生在服务器配置错误或中间件（如反向代理）修改了响应格式

**解决方案：**
1. **查看详细错误信息**：页面现在会自动捕获并显示详细的错误信息
   - 点击"查看详细信息"展开完整的错误内容
   - 查看响应状态码和实际返回的内容

2. **快速诊断**：
   ```bash
   # 检查 API 健康状态
   curl -I https://x4mrwzmnw9.coze.site/api/health
   ```

3. **根据错误状态码处理**：
   - **500 错误且响应为 HTML**：检查服务器配置，确保 API 路由正确注册
   - **502/503/504 错误**：服务暂时不可用，等待一段时间后重试
   - **404 错误**：API 路由未正确部署，需要重新构建和部署

4. **使用浏览器开发者工具**：
   - 打开开发者工具（F12）
   - 切换到 "Network" 标签
   - 重新提交表单
   - 查看失败的请求详情，包括：
     - Response Headers（响应头）
     - Response（响应体）
     - Status Code（状态码）

**修复记录（2026-01-23）：**
- ✅ 已修复前端错误处理，现在能够正确处理非 JSON 响应
- ✅ 已增强错误提示，显示详细的错误信息和建议
- ✅ 已添加响应类型检查，避免 JSON 解析错误
- ✅ 已更新错误建议系统，提供针对性的解决方案

## 日志查看

### 本地开发环境
```bash
# 查看应用日志
tail -n 50 /app/work/logs/bypass/app.log

# 查看开发日志
tail -n 50 /app/work/logs/bypass/dev.log
```

### 生产环境
生产环境日志需要通过 Coze 平台提供的日志查看工具查看。

## 开发者工具

### 浏览器开发者工具
1. 打开浏览器开发者工具（F12）
2. 切换到 "Console" 标签页
3. 查看详细的日志输出和错误信息

### 测试 API
使用 curl 或 Postman 测试 API 接口：
```bash
# 测试健康检查
curl https://x4mrwzmnw9.coze.site/api/health

# 测试用户创建
curl -X POST https://x4mrwzmnw9.coze.site/api/user \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","gender":"男","age":30,"weight":70,"height":175}'

# 测试用户查询
curl "https://x4mrwzmnw9.coze.site/api/user?userId=用户ID"
```

## 部署后检查清单

- [ ] 数据库连接正常（访问 `/api/health`）
- [ ] 所有表已创建（`tables` 数组包含 6 个表）
- [ ] 管理员账号已创建
- [ ] 用户创建功能正常（测试 `/api/user` POST）
- [ ] 个人信息页面可以正常访问（`/personal-info`）
- [ ] 个人信息保存功能正常（填写表单并提交）

## 联系支持

如果以上步骤无法解决问题，请联系 Coze 平台技术支持，并提供：
1. 问题详情
2. 错误日志
3. 健康检查结果
4. 浏览器控制台截图
