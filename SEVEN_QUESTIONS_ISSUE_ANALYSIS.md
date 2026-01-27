# 七问数据显示问题分析与解决方案

## 问题描述

用户反馈：
1. 填写了七个问题的答案，点"完成分析"显示"已保存"
2. 在后台查看李四的七个问题，还是显示"未填写"
3. 问题列表显示"已回答"
4. 点"上一步"答案是显示出来了

## 问题分析

### 前端显示逻辑

在 `/analysis` 页面（`src/app/analysis/page.tsx`）：

```javascript
// 保存七问答案到 requirements 表
const sevenQuestionsData: Record<string, any> = {};
answers.forEach(a => {
  // 使用字符串作为key，确保与读取时的一致性
  sevenQuestionsData[a.questionId.toString()] = {
    answer: a.answer,
    date: new Date().toISOString(),
  };
});

await saveRequirements({
  userId,
  sevenQuestionsAnswers: sevenQuestionsData,
});
```

保存的数据格式：
```javascript
{
  "1": {
    "answer": "用户回答内容",
    "date": "2026-01-27T09:45:00.000Z"
  },
  "2": { ... }
}
```

### 问题根源

**问题1：前端判断"已回答"是基于内存状态**

- 用户填写七问时，答案保存在组件的 `answers` state 中
- "问题列表显示已回答"是基于 `answers.find(a => a.questionId === question.id)` 的结果
- 这是内存中的数据，不代表数据库中已保存

**问题2：API 调用可能失败，但错误处理不完善**

- 如果 `/api/requirements` 调用失败，会进入 `catch` 块
- 用户会看到错误提示，但如果用户忽略错误或页面刷新，数据就丢失了
- 后台显示"未填写"是因为数据库中没有 `sevenQuestionsAnswers` 数据

**问题3：后台读取逻辑是正确的**

后台页面（`src/app/admin/dashboard/page.tsx`）的读取逻辑是正确的：

```javascript
// 方式2：使用字符串ID作为key
else if (answers[q.id.toString()]) {
  answerData = answers[q.id.toString()];
}

// 提取答案
if (typeof answerData === 'object' && answerData !== null) {
  answer = answerData.answer || answerData.content || answerData.text;
  date = answerData.date || answerData.timestamp || answerData.createdAt;
}
```

如果数据库中没有数据，就会显示"未填写"。

## 解决方案

### 方案1：使用诊断工具排查问题（推荐）

我已经创建了以下调试工具：

1. **诊断API**：`/api/diagnose-seven-questions?name=李四` 或 `/api/diagnose-seven-questions?userId=xxx`
2. **诊断页面**：`/diagnose-seven-questions`

使用方法：
1. 打开 `http://localhost:5000/diagnose-seven-questions`
2. 输入用户姓名（如"李四"）或用户ID
3. 点击"开始诊断"
4. 查看数据库中是否有 `sevenQuestionsAnswers` 数据

### 方案2：检查API调用是否成功

在 `/analysis` 页面的 `handleNext` 函数中，已经添加了错误处理：

```javascript
try {
  await saveRequirements({
    userId,
    sevenQuestionsAnswers: sevenQuestionsData,
  });

  // 保存成功后清除错误状态，然后跳转
  setSaveError(null);
  setIsSaving(false);
  router.push('/story');
} catch (error) {
  console.error('保存健康要素分析失败:', error);
  setSaveError(error);
  setIsSaving(false);
  // ⚠️ 保存失败时不跳转，让用户看到错误并决定下一步
}
```

如果保存失败，会显示错误提示。用户应该查看错误信息。

### 方案3：手动测试保存功能

创建一个测试脚本来验证保存功能：

```bash
# 创建测试用户
curl -X POST http://localhost:5000/api/test-user-with-questions
```

这会创建一个测试用户，并填充七问数据，然后可以在后台查看是否正确显示。

### 方案4：检查数据库连接

如果API调用失败，可能是数据库连接问题。检查：
1. 数据库服务是否正常运行
2. 数据库连接配置是否正确
3. 是否有足够的权限写入数据

## 预防措施

为了防止此类问题再次发生，建议：

1. **添加保存成功的确认提示**
   - 在保存成功后显示明确的成功消息
   - 显示保存的数据概要

2. **添加本地存储备份**
   - 在提交到API之前，先保存到localStorage
   - 如果API调用失败，提示用户重试或保留本地数据

3. **改进错误处理**
   - 显示详细的错误信息
   - 提供重试按钮
   - 保留已填写的数据，避免丢失

4. **添加数据验证**
   - 在提交前验证数据是否完整
   - 确保所有7个问题都有答案

## 下一步

1. 使用诊断工具查看数据库中的实际数据
2. 如果没有数据，检查是否有API调用失败的日志
3. 重新填写七问，注意观察是否有错误提示
4. 如果仍然有问题，提供以下信息：
   - 浏览器控制台的错误日志
   - 网络请求的响应内容
   - 数据库中的实际数据结构

## 相关文件

- 前端提交页面：`src/app/analysis/page.tsx`
- API接口：`src/app/api/requirements/route.ts`
- 后台显示页面：`src/app/admin/dashboard/page.tsx`
- 数据管理器：`src/storage/database/healthDataManager.ts`
- 数据库Schema：`src/storage/database/shared/schema.ts`
