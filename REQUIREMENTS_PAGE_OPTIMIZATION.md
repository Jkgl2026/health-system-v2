# Requirements 页面优化文档

## 修改时间
2026-01-24

## 用户需求

### 问题1：用户看完"总览"直接跳过要求1-4
- **症状**：用户在总览页面点击"继续下一步"，没有查看要求1、要求2、要求3、要求4
- **后果**：数据收集不完整，用户没有完成必要的信息填写

### 问题2：要求1和2需要合并
- **症状**：要求1（不良生活习惯表）和要求2（300症状表）都涉及数据填写，容易被跳过
- **需求**：将要求1和要求2合并为一个独立页面，确保数据收集完整

### 问题3：需要底部重复导航
- **需求**：在页面底部再显示一遍导航（总览、要求1-2、要求3、要求4）
- **目的**：提醒用户还有其他要求需要完成

## 解决方案

### 1. 新的页面结构
将原来的 Tab 系统改为**强制流程**：

```
总览 → 要求1+2（合并） → 要求3 → 要求4 → 继续下一步
```

#### 步骤定义
- **总览** (overview): 四个要求的概览说明
- **要求1+2** (req1-2): 不良生活习惯表 + 300症状自检表（合并页面）
- **要求3** (req3): 相信调理
- **要求4** (req4): 学习知识

### 2. 强制访问机制

#### 进度追踪
```typescript
// 记录用户已访问过的页面
const [visitedSteps, setVisitedSteps] = useState<Set<Step>>(new Set(['overview']));

// 访问规则
- 总览：默认已访问
- 要求1+2：看完总览后可访问
- 要求3：看完要求1+2后可访问
- 要求4：看完要求3后可访问
```

#### 锁定机制
- 未访问的步骤显示锁图标 🔒
- 已访问的步骤显示对勾 ✓
- 当前步骤高亮显示

### 3. 底部导航优化

#### 顶部导航
- 显示完整的进度状态
- 锁定未访问的步骤
- 高亮当前步骤

#### 底部导航（新增）
- 固定在页面底部
- 与顶部导航相同的结构
- 提醒用户还有其他步骤
- 显示"继续下一步"按钮

#### 继续按钮控制
```typescript
// 只有访问完所有步骤才能继续
const canContinue = visitedSteps.has('req1-2') && 
                   visitedSteps.has('req3') && 
                   visitedSteps.has('req4');

// 按钮状态
if (!canContinue) {
  禁用按钮，显示提示："请完成所有四个要求后才能继续"
}
```

## 技术实现

### 1. 步骤类型定义
```typescript
type Step = 'overview' | 'req1-2' | 'req3' | 'req4';
```

### 2. 状态管理
```typescript
const [activeStep, setActiveStep] = useState<Step>('overview');
const [visitedSteps, setVisitedSteps] = useState<Set<Step>>(new Set(['overview']));
const [selectedHabits, setSelectedHabits] = useState<Set<number>>(new Set());
const [selectedSymptoms300, setSelectedSymptoms300] = useState<Set<number>>(new Set());
```

### 3. 步骤切换逻辑
```typescript
const handleStepChange = (step: Step) => {
  // 标记当前步骤为已访问
  setVisitedSteps(prev => new Set([...prev, step]));
  
  // 检查访问权限
  if (step === 'req1-2') {
    // 总览后可访问
  }
  if (step === 'req3') {
    // 要求1+2后可访问
  }
  if (step === 'req4') {
    // 要求3后可访问
  }
  
  setActiveStep(step);
};
```

### 4. 可访问性检查
```typescript
const isStepAccessible = (step: Step, index: number) => {
  if (step === 'overview') return true;
  if (step === 'req1-2') return visitedSteps.has('overview');
  if (step === 'req3') return visitedSteps.has('req1-2');
  if (step === 'req4') return visitedSteps.has('req3');
  return false;
};
```

## 用户体验改进

### 1. 视觉反馈
- **锁定状态**：灰色 + 锁图标
- **已访问**：绿色对勾
- **当前步骤**：渐变背景 + 高亮
- **未访问**：灰色提示

### 2. 提示信息
- 总览页面：提示"请务必按顺序阅读完成所有四个要求！"
- 要求1+2页面：提示"下一步：请查看要求3"
- 底部导航：显示"请完成所有四个要求后才能继续"

### 3. 进度显示
- 顶部显示：X/4 完成
- 实时更新进度状态

## 预期效果

### 数据完整性
- ✅ 用户必须访问所有四个要求
- ✅ 要求1和2必须在同一页面完成
- ✅ 防止用户跳过任何步骤

### 用户体验
- ✅ 清晰的流程指引
- ✅ 底部导航随时可见
- ✅ 进度状态明确
- ✅ 强制完成，避免数据缺失

## 测试清单

- [x] 页面正常加载
- [x] 总览页面显示正确
- [x] 要求1+2页面合并显示
- [x] 要求3页面显示正确
- [x] 要求4页面显示正确
- [x] 底部导航固定显示
- [x] 锁定机制正常工作
- [x] 进度追踪正常
- [x] 继续按钮控制正确
- [ ] 完整流程测试（需要手动测试）

## 文件变更

### 修改的文件
- `src/app/requirements/page.tsx` - 完全重写

### 新增功能
1. 强制流程系统
2. 步骤锁定机制
3. 进度追踪系统
4. 底部导航（固定）
5. 继续按钮控制

## 后续优化建议

### 短期
1. 添加进度百分比显示
2. 添加步骤完成动画
3. 优化移动端显示

### 长期
1. 保存用户进度（localStorage）
2. 支持从断点继续
3. 添加步骤时间统计
