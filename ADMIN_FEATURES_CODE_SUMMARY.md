# 后台管理系统功能代码清单

这是扣子之前后台所有功能的代码清单：

## 1. 系统维护页面 (maintenance/page.tsx)
**功能**：数据库优化、备份、归档

**主要操作**：
- `vacuum`: 清理死元组，回收空间
- `analyze`: 更新统计信息，优化查询计划
- `reindex`: 重建索引，提高查询性能
- `full`: 完整维护（清理+分析+重建）
- `backup`: 执行备份，创建数据备份
- `archive`: 归档日志，归档审计日志
- `cleanup`: 清理旧备份，删除30天前的备份
- `all`: 执行全部，执行所有优化操作

**API调用**：
- `GET /api/admin/maintenance` - 获取维护状态
- `POST /api/admin/maintenance` - 执行维护操作

**代码结构**：
```typescript
// 使用 useState 管理状态
const [status, setStatus] = useState<MaintenanceStatus | null>(null);
const [isRunning, setIsRunning] = useState(false);

// 获取维护状态
const fetchStatus = async () => {
  const response = await fetch('/api/admin/maintenance');
  const data = await response.json();
  setStatus(data);
};

// 执行维护操作
const handleMaintenance = async (action: MaintenanceAction) => {
  const response = await fetch('/api/admin/maintenance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });
  // 处理结果...
};
```

---

## 2. 七问管理页面 (seven-questions-manager/page.tsx)
**功能**：查看和管理用户的健康七问数据

**主要功能**：
- 查询单个用户的七问数据
- 补录/编辑七问答案
- 批量检查缺少七问数据的用户
- 保存七问答案到数据库

**API调用**：
- `GET /api/requirements?userId={userId}` - 获取用户requirements数据
- `POST /api/admin/find-users-missing-seven-questions` - 批量检查缺少七问的用户
- `saveRequirements()` - 保存七问答案（通过api-client）

**代码结构**：
```typescript
interface UserData {
  user: any;
  requirements: any;
  sevenQuestionsData: Record<string, any> | null;
}

// 加载用户数据
const handleLoad = async () => {
  const userResponse = await getUser(userId);
  const response = await fetch(`/api/requirements?userId=${userId}`);
  const reqData = await response.json();
  // 提取七问答案
  let sevenQuestionsData = null;
  if (requirement?.sevenQuestionsAnswers) {
    sevenQuestionsData = requirement.sevenQuestionsAnswers;
  }
  // 初始化答案编辑状态
  const initialAnswers: Record<number, string> = {};
  // ...
};

// 保存七问答案
const handleSave = async () => {
  const sevenQuestionsAnswers: Record<string, any> = {};
  SEVEN_QUESTIONS.forEach((q) => {
    const answerText = answers[q.id] || '';
    sevenQuestionsAnswers[q.id.toString()] = {
      answer: answerText,
      date: new Date().toISOString(),
    };
  });
  const response = await saveRequirements({ userId, sevenQuestionsAnswers });
};

// 批量检查缺少七问的用户
const handleBatchCheck = async () => {
  const response = await fetch('/api/admin/find-users-missing-seven-questions');
  const data = await response.json();
  setMissingUsers(data.users);
};
```

---

## 3. 健康对比页面 (compare/page.tsx)
**代码行数**：2718行

**功能**：对比用户不同时期的健康数据变化

**主要功能**：
- 查询用户历史健康数据
- 对比症状检查记录
- 对比健康要素分析
- 对比用户选择记录
- BMI 和血压变化趋势
- 健康评分变化分析
- 健康要素详细对比（气血、循环、毒素、血脂、寒凉、免疫力、情绪）
- 不良习惯和症状变化对比
- 生成详细的健康变化报告

**API调用**：
- `GET /api/user/history?userId={userId}&phoneGroupId={phoneGroupId}` - 获取用户历史数据
- `GET /api/admin/users/{userId}` - 获取用户详细信息

**核心函数**：
```typescript
// 提取七问答案
const extractSevenQuestionAnswer = (
  sevenQuestionsAnswers: Record<string, any> | null,
  questionId: number
): string => {
  if (!sevenQuestionsAnswers) return '';
  const answer = sevenQuestionsAnswers[questionId.toString()];
  return answer?.answer || '';
};

// 分析BMI变化
const analyzeBMIChange = (
  oldBMI: number,
  newBMI: number
): BMIAnalysis => {
  const diff = newBMI - oldBMI;
  const direction = diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'stable';
  const status = getBMIStatus(newBMI);
  return { diff, direction, status, suggestion: getBMISuggestion(status) };
};

// 分析健康要素变化
const analyzeHealthElementChange = (
  oldElement: number,
  newElement: number
): HealthElementAnalysis => {
  const diff = newElement - oldElement;
  const direction = diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'stable';
  const impact = getHealthElementImpact(oldElement, newElement);
  return { oldElement, newElement, diff, direction, impact };
};

// 分析数组差异（症状、习惯等）
const analyzeArrayDifference = (
  oldArray: string[],
  newArray: string[]
): ArrayDifference => {
  const added = newArray.filter(item => !oldArray.includes(item));
  const removed = oldArray.filter(item => !newArray.includes(item));
  const unchanged = oldArray.filter(item => newArray.includes(item));
  return { added, removed, unchanged };
};
```

**UI组件结构**：
```typescript
// 健康变化对比卡片
<HealthComparisonCard
  title="健康要素变化"
  changes={healthElementChanges}
/>

// 症状变化对比
<SymptomComparisonCard
  title="症状变化"
  oldSymptoms={oldSymptoms}
  newSymptoms={newSymptoms}
/>

// BMI变化趋势
<BMITrendCard
  oldBMI={oldBMI}
  newBMI={newBMI}
  change={bmiChange}
/>
```

---

## 4. Dashboard页面 (dashboard/page.tsx)
**功能**：系统概览和用户管理

**主要功能**：
- 显示系统统计数据
- 用户列表展示
- 功能导航

**代码结构**：
```typescript
const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="总用户数" value={userCount} />
          <StatCard title="今日新增" value={newUsers} />
          <StatCard title="活跃用户" value={activeUsers} />
          <StatCard title="系统状态" value="正常" />
        </div>

        {/* 功能导航 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FunctionCard
            title="系统维护"
            description="数据库优化和备份"
            href="/admin/maintenance"
            icon={<Settings />}
          />
          <FunctionCard
            title="七问管理"
            description="管理用户健康七问数据"
            href="/admin/seven-questions-manager"
            icon={<ClipboardList />}
          />
          <FunctionCard
            title="健康对比"
            description="对比用户历史健康数据"
            href="/admin/compare"
            icon={<BarChart2 />}
          />
        </div>
      </div>
    </div>
  );
};
```

---

## 5. 诊断面板 (compare/diagnostics.tsx)
**功能**：系统诊断和调试

**主要功能**：
- 测试API连接
- 检查数据库状态
- 检查健康数据
- 查看用户历史数据

**API调用**：
- `GET /` - 测试主页
- `GET /api/health` - 测试健康API
- `GET /api/user/history?phone=13800138000` - 测试历史数据API

**代码结构**：
```typescript
const DiagnosticsPanel = () => {
  const [results, setResults] = useState<Diagnostics>({});

  const testAPI = async (apiPath: string) => {
    try {
      const response = await fetch(apiPath);
      const data = await response.json();
      setResults(prev => ({
        ...prev,
        [apiPath]: { success: true, data }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [apiPath]: { success: false, error: error.message }
      }));
    }
  };

  return (
    <div>
      <Button onClick={() => testAPI('/')}>测试主页</Button>
      <Button onClick={() => testAPI('/api/health')}>测试健康API</Button>
      <Button onClick={() => testAPI('/api/user/history?phone=13800138000')}>
        测试历史数据API
      </Button>
      {/* 显示测试结果 */}
    </div>
  );
};
```

---

## 所有依赖的API路由

### 1. `/api/admin/maintenance`
- **方法**：GET, POST
- **功能**：
  - GET: 获取维护状态（数据库大小、表大小、备份统计）
  - POST: 执行维护操作（vacuum, analyze, reindex, backup等）

### 2. `/api/requirements`
- **方法**：GET
- **查询参数**：`userId`
- **功能**：获取用户的requirements数据（包含七问答案）

### 3. `/api/admin/find-users-missing-seven-questions`
- **方法**：POST
- **功能**：批量查找缺少七问数据的用户

### 4. `/api/user/history`
- **方法**：GET
- **查询参数**：`userId`, `phoneGroupId`
- **功能**：获取用户历史健康数据

### 5. `/api/admin/users/{userId}`
- **方法**：GET
- **功能**：获取用户详细信息

### 6. `/api/health`
- **方法**：GET
- **功能**：健康检查API

---

## 数据结构

### MaintenanceStatus
```typescript
interface MaintenanceStatus {
  databaseSize: {
    total: number;
    totalPretty: string;
  };
  tableSizes: Array<{
    tableName: string;
    totalSize: number;
    totalSizePretty: string;
  }>;
  backupStats: {
    totalBackups: number;
    fullBackups: number;
    incrementalBackups: number;
    totalSize: number;
    oldestBackup: string;
    newestBackup: string;
  };
  archiveStats: {
    currentLogs: number;
    archivedLogs: number;
    oldestLog: string;
    oldestArchivedLog: string;
  };
}
```

### UserData
```typescript
interface UserData {
  user: any;
  requirements: any;
  sevenQuestionsData: Record<string, any> | null;
}
```

### HealthComparison
```typescript
interface HealthComparison {
  userData: UserData;
  historyData: Array<any>;
  bmiChange: {
    diff: number;
    direction: 'increase' | 'decrease' | 'stable';
    status: string;
    suggestion: string;
  };
  healthElementChanges: Record<string, any>;
  symptomChanges: {
    added: string[];
    removed: string[];
    unchanged: string[];
  };
  habitChanges: {
    added: string[];
    removed: string[];
    unchanged: string[];
  };
}
```

---

## 依赖的后端数据库表

1. **users** - 用户信息表
   - id, name, email, phone, created_at, updated_at

2. **symptom_checks** - 症状检查记录表
   - id, user_id, symptoms, date, created_at

3. **health_analyses** - 健康分析记录表
   - id, user_id, health_elements, score, date, created_at

4. **user_choices** - 用户选择记录表
   - id, user_id, choices, date, created_at

5. **requirements** - 用户要求和七问答案表
   - id, user_id, seven_questions_answers, created_at, updated_at

6. **backups** - 数据库备份表
   - id, type, size, created_at

7. **audit_logs** - 审计日志表
   - id, action, user_id, details, created_at

---

## 核心功能模块详解

### 1. 数据库优化模块 (maintenance)
**功能描述**：
- 清理死元组（VACUUM）
- 重建索引（REINDEX）
- 更新统计信息（ANALYZE）
- 数据备份和归档

**实现方式**：
```typescript
// API路由处理
export async function GET() {
  const status = {
    databaseSize: await getDatabaseSize(),
    tableSizes: await getTableSizes(),
    backupStats: await getBackupStats(),
    archiveStats: await getArchiveStats(),
  };
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  const { action } = await request.json();

  switch (action) {
    case 'vacuum':
      await executeSQL('VACUUM;');
      break;
    case 'analyze':
      await executeSQL('ANALYZE;');
      break;
    case 'reindex':
      await executeSQL('REINDEX DATABASE health_app;');
      break;
    case 'full':
      await executeSQL('VACUUM FULL;');
      break;
    case 'backup':
      await createBackup();
      break;
    case 'archive':
      await archiveLogs();
      break;
    case 'cleanup':
      await cleanupOldBackups();
      break;
    case 'all':
      await executeSQL('VACUUM;');
      await executeSQL('ANALYZE;');
      await executeSQL('REINDEX DATABASE health_app;');
      await createBackup();
      await archiveLogs();
      break;
  }

  return NextResponse.json({ success: true });
}
```

### 2. 七问管理模块 (seven-questions-manager)
**功能描述**：
- 查询用户七问数据
- 补录七问答案
- 批量检查缺失数据

**实现方式**：
```typescript
// 查询单个用户
const handleLoad = async () => {
  const userResponse = await getUser(userId);
  const response = await fetch(`/api/requirements?userId=${userId}`);
  const reqData = await response.json();

  const requirement = reqData.requirement || null;
  let sevenQuestionsData = null;

  if (requirement?.sevenQuestionsAnswers) {
    sevenQuestionsData = requirement.sevenQuestionsAnswers;
  }

  setUserData({
    user: userResponse.user,
    requirements: requirement,
    sevenQuestionsData,
  });
};

// 保存七问答案
const handleSave = async () => {
  const sevenQuestionsAnswers: Record<string, any> = {};

  SEVEN_QUESTIONS.forEach((q) => {
    const answerText = answers[q.id] || '';
    sevenQuestionsAnswers[q.id.toString()] = {
      answer: answerText,
      date: new Date().toISOString(),
    };
  });

  const response = await saveRequirements({
    userId,
    sevenQuestionsAnswers,
  });
};

// 批量检查
const handleBatchCheck = async () => {
  const response = await fetch('/api/admin/find-users-missing-seven-questions', {
    method: 'POST',
  });
  const data = await response.json();
  setMissingUsers(data.users);
};
```

### 3. 健康对比模块 (compare)
**功能描述**：
- 历史数据查询
- 多维度对比分析
- 变化趋势计算
- 健康建议生成

**核心算法**：
```typescript
// BMI分析
const analyzeBMIChange = (oldBMI: number, newBMI: number): BMIAnalysis => {
  const diff = newBMI - oldBMI;
  const direction = diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'stable';
  const status = getBMIStatus(newBMI);
  return {
    diff: diff.toFixed(1),
    direction,
    status,
    suggestion: getBMISuggestion(status),
  };
};

// 健康要素分析
const analyzeHealthElementChange = (
  oldElement: number,
  newElement: number
): HealthElementAnalysis => {
  const diff = newElement - oldElement;
  const direction = diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'stable';

  let impact: 'positive' | 'negative' | 'neutral';
  if (newElement >= 90) {
    impact = 'positive';
  } else if (newElement < 60) {
    impact = 'negative';
  } else {
    impact = 'neutral';
  }

  return {
    oldElement,
    newElement,
    diff: diff.toFixed(1),
    direction,
    impact,
  };
};

// 数组差异分析
const analyzeArrayDifference = (
  oldArray: string[],
  newArray: string[]
): ArrayDifference => {
  const added = newArray.filter(item => !oldArray.includes(item));
  const removed = oldArray.filter(item => !newArray.includes(item));
  const unchanged = oldArray.filter(item => newArray.includes(item));
  return { added, removed, unchanged };
};

// 血压分析
const analyzeBloodPressureChange = (
  oldBP: { systolic: number; diastolic: number },
  newBP: { systolic: number; diastolic: number }
): BloodPressureAnalysis => {
  const systolicDiff = newBP.systolic - oldBP.systolic;
  const diastolicDiff = newBP.diastolic - oldBP.diastolic;

  let status: 'normal' | 'elevated' | 'high' | 'low';
  if (newBP.systolic < 90 || newBP.diastolic < 60) {
    status = 'low';
  } else if (newBP.systolic < 120 && newBP.diastolic < 80) {
    status = 'normal';
  } else if (newBP.systolic < 140 && newBP.diastolic < 90) {
    status = 'elevated';
  } else {
    status = 'high';
  }

  return {
    oldBP,
    newBP,
    systolicDiff,
    diastolicDiff,
    status,
    suggestion: getBloodPressureSuggestion(status),
  };
};
```

### 4. 数据展示模块 (dashboard)
**功能描述**：
- 统计数据展示
- 用户列表管理
- 功能导航

**实现方式**：
```typescript
const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadStats();
    loadUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="总用户数"
            value={stats.totalUsers}
            icon={<Users />}
          />
          <StatCard
            title="今日新增"
            value={stats.newUsersToday}
            icon={<UserPlus />}
          />
          <StatCard
            title="活跃用户"
            value={stats.activeUsers}
            icon={<Activity />}
          />
          <StatCard
            title="系统状态"
            value="正常"
            icon={<CheckCircle />}
            className="bg-green-50"
          />
        </div>

        {/* 功能导航 */}
        <h2 className="text-2xl font-bold mb-6">功能导航</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FunctionCard
            title="系统维护"
            description="数据库优化和备份"
            href="/admin/maintenance"
            icon={<Settings />}
          />
          <FunctionCard
            title="七问管理"
            description="管理用户健康七问数据"
            href="/admin/seven-questions-manager"
            icon={<ClipboardList />}
          />
          <FunctionCard
            title="健康对比"
            description="对比用户历史健康数据"
            href="/admin/compare"
            icon={<BarChart2 />}
          />
        </div>

        {/* 用户列表 */}
        <h2 className="text-2xl font-bold mt-12 mb-6">用户列表</h2>
        <UserTable users={users} />
      </div>
    </div>
  );
};
```

---

## 重要说明

### ⚠️ 这些功能都依赖后端API

**无法在纯静态托管平台使用**，包括：
- Cloudflare Pages
- GitHub Pages
- Netlify (仅静态部署)

### ✅ 恢复这些功能需要的条件

1. **部署后端服务**
   - Node.js / Next.js 服务器
   - API路由功能

2. **配置数据库**
   - PostgreSQL 数据库
   - 7个数据表

3. **恢复API路由**
   - 6个API端点
   - 数据库连接配置

### 📋 迁移步骤

如需从纯静态部署迁移到全功能部署：

1. 选择托管平台（Vercel / Supabase Edge Functions / 自建服务器）
2. 恢复API路由代码
3. 配置数据库连接
4. 部署后端服务
5. 测试所有API功能
6. 更新前端API调用地址

---

## 文件位置

所有功能代码可以从Git历史中恢复：

```bash
# 查看系统维护代码
git show ce71413:src/app/admin/maintenance/page.tsx

# 查看七问管理代码
git show ce71413:src/app/admin/seven-questions-manager/page.tsx

# 查看健康对比代码（2718行）
git show ce71413:src/app/admin/compare/page.tsx

# 查看Dashboard代码
git show ce71413:src/app/admin/dashboard/page.tsx
```

---

## 总结

本文档详细记录了扣子后台管理系统的所有历史功能代码，包括：

1. ✅ 5个核心功能页面
2. ✅ 6个API路由
3. ✅ 7个数据库表
4. ✅ 完整的数据结构定义
5. ✅ 核心算法实现
6. ✅ 代码示例和实现方式

这些功能为后续恢复完整后台管理功能提供了详细的参考文档。
