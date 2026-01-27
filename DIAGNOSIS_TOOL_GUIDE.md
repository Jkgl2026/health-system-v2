# 诊断工具访问说明

## 前端诊断页面

### 1. 七问数据诊断工具（完整版）
- **页面URL**: `http://localhost:5000/diagnose-seven-questions`
- **功能**: 
  - 支持按姓名或用户ID查询
  - 显示用户信息
  - 显示所有 requirements 记录
  - 显示 sevenQuestionsAnswers 的存在性、类型和完整内容
  - 提供详细的诊断报告

### 2. 按姓名查询七问数据（快速版）
- **页面URL**: `http://localhost:5000/debug-seven-questions-by-name`
- **功能**:
  - 仅支持按姓名查询
  - 快速查看用户的七问数据

### 3. 按用户ID查询七问数据
- **页面URL**: `http://localhost:5000/debug-seven-questions`
- **功能**:
  - 仅支持按用户ID查询
  - 快速查看用户的七问数据

## API 接口

### 1. 诊断接口
- **URL**: `http://localhost:5000/api/diagnose-seven-questions`
- **方法**: GET
- **参数**:
  - `name` (可选): 用户姓名
  - `userId` (可选): 用户ID
- **示例**:
  ```bash
  # 按姓名查询
  curl "http://localhost:5000/api/diagnose-seven-questions?name=李四"
  
  # 按用户ID查询
  curl "http://localhost:5000/api/diagnose-seven-questions?userId=550e8400-e29b-..."
  ```

### 2. 查询接口
- **URL**: `http://localhost:5000/api/query-seven-questions`
- **方法**: GET
- **参数**:
  - `name` (必填): 用户姓名
- **示例**:
  ```bash
  curl "http://localhost:5000/api/query-seven-questions?name=李四"
  ```

## 使用步骤

### 方法1：使用前端页面（推荐）

1. 确保开发服务器正在运行（端口5000）
2. 在浏览器中访问：`http://localhost:5000/diagnose-seven-questions`
3. 输入用户姓名（如"李四"）或用户ID
4. 点击"开始诊断"按钮
5. 查看诊断结果

### 方法2：使用 API 接口

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 执行以下代码：
   ```javascript
   fetch('http://localhost:5000/api/diagnose-seven-questions?name=李四')
     .then(res => res.json())
     .then(data => console.log(data))
   ```
4. 查看返回的数据

### 方法3：使用 curl 命令

```bash
curl "http://localhost:5000/api/diagnose-seven-questions?name=李四"
```

## 常见问题

### 1. 页面打不开（404 Not Found）
**原因**：开发服务器未启动或端口错误

**解决方法**：
```bash
# 检查开发服务器是否运行
curl -I http://localhost:5000

# 如果没有运行，启动开发服务器
cd /workspace/projects
coze dev
```

### 2. API 请求失败
**原因**：数据库连接问题或参数错误

**解决方法**：
1. 检查浏览器控制台是否有错误信息
2. 确认用户姓名或用户ID是否正确
3. 查看服务器日志

### 3. 查询结果为空
**原因**：数据库中没有该用户或没有七问数据

**解决方法**：
1. 确认用户姓名是否正确
2. 检查数据库中是否有该用户的记录
3. 检查是否有 requirements 记录

## 调试技巧

### 1. 查看浏览器控制台
- 按 F12 打开开发者工具
- 切换到 Console 标签
- 查看是否有错误信息

### 2. 查看网络请求
- 按 F12 打开开发者工具
- 切换到 Network 标签
- 重新加载页面或点击"开始诊断"
- 查看请求和响应的详细信息

### 3. 查看服务器日志
```bash
# 查看开发服务器日志
cd /workspace/projects
tail -f /app/work/logs/bypass/app.log
```

## 示例输出

### 成功返回示例
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-...",
    "name": "李四",
    "phone": "13800138000",
    "email": "test@example.com",
    "age": 39,
    "gender": "男",
    "createdAt": "2026-01-27T09:45:00.000Z"
  },
  "requirements": [
    {
      "id": "12345",
      "userId": "550e8400-e29b-...",
      "requirement1Completed": true,
      "requirement2Completed": true,
      "requirement3Completed": true,
      "requirement4Completed": true,
      "sevenQuestionsAnswers": {
        "1": {
          "answer": "回答内容",
          "date": "2026-01-27T09:45:00.000Z"
        },
        ...
      },
      "sevenQuestionsAnswersType": "object",
      "sevenQuestionsAnswersKeys": ["1", "2", "3", "4", "5", "6", "7"],
      "completedAt": "2026-01-27T09:45:00.000Z",
      "updatedAt": "2026-01-27T09:45:00.000Z"
    }
  ]
}
```

### 无数据示例
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-...",
    "name": "李四",
    ...
  },
  "requirements": []
}
```
