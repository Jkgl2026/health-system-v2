# 用户数据保存失败问题分析

## 问题描述
用户填写完整信息后，管理后台显示自检状态、分析状态、选择方案、要求完成度都为0。

## 根本原因

### 1. 保存失败被静默忽略
在以下文件中，保存数据失败时只是记录到控制台，但继续让用户跳转到下一页：

- `src/app/check/page.tsx` (第132行)
- `src/app/analysis/page.tsx` (第108行)
- `src/app/choices/page.tsx` (第98行)

```typescript
} catch (error) {
  console.error('保存症状自检数据失败:', error);
  // 即使保存失败也继续，不阻塞用户体验
} finally {
  setIsSaving(false);
  window.location.href = '/analysis';
}
```

### 2. userId 不一致问题
日志显示保存 requirements 时使用的 userId (d99deac8-b33e-454f-8fa1-1bb0fe5a9734) 在数据库中不存在，而李子的真实 userId 是 fa3e6867-1648-414e-bc85-a3a16e5de0c9。

可能的原因：
- 用户在不同浏览器标签页切换
- localStorage 中的 userId 被意外修改
- 多次填写个人信息导致 localStorage 混乱

### 3. 外键约束错误
```
insert or update on table "requirements" violates foreign key constraint
Key (user_id)=(d99deac8-b33e-454f-8fa1-1bb0fe5a9734) is not present in table "users"
```

## 解决方案

### 1. 移除静默失败逻辑
修改所有保存失败的处理逻辑，显示错误提示给用户，而不是静默跳转。

### 2. 添加 userId 验证
在保存数据前，先验证 userId 对应的用户是否存在，如果不存在则创建。

### 3. 统一 userId 管理
确保整个流程中使用同一个 userId，避免 localStorage 混乱。

### 4. 添加错误提示组件
创建统一的错误提示组件，让用户能看到详细的错误信息。

## 修复的文件

1. `src/app/check/page.tsx` - 移除静默失败，添加错误提示
2. `src/app/analysis/page.tsx` - 移除静默失败，添加错误提示
3. `src/app/choices/page.tsx` - 移除静默失败，添加错误提示
4. `src/components/ui/error-alert.tsx` - 新增错误提示组件

## 测试建议

1. 清空 localStorage：`localStorage.clear()`
2. 重新填写完整流程
3. 检查是否有错误提示
4. 验证管理后台数据是否正确显示
