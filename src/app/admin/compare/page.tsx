'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { LogOut, ArrowLeft, Activity, Users, CheckCircle, TrendingUp, TrendingDown, Minus, Eye, HelpCircle, AlertCircle, FileText, Sparkles, Flame, Heart, Zap, Droplets, Target, BookOpen, Stethoscope, RefreshCw, XCircle, CheckCircle2, AlertTriangle, Lightbulb, PlusCircle, MinusCircle, ArrowRight, ArrowDown, Clock, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { BAD_HABITS_CHECKLIST, BODY_SYMPTOMS, BODY_SYMPTOMS_300, TWENTY_ONE_COURSES } from '@/lib/health-data';
import { calculateComprehensiveHealthScore } from '@/lib/health-score-calculator';
import { mockFetchUserHistory, mockFetchUserFullData, MockUserData, MockFullUserData } from '@/lib/mockCompareData';

interface UserData {
  id: string;
  name: string | null;
  phone: string | null;
  age: number | null;
  gender: string | null;
  weight: string | null;
  height: string | null;
  bmi: string | null;
  bloodPressure: string | null;
  occupation: string | null;
  createdAt: Date;
  isLatestVersion: boolean;
}

interface FullUserData extends UserData {
  symptomChecks?: any[];
  healthAnalysis?: any[];
  userChoices?: any[];
  requirements?: any;
}

// 差异分析辅助函数
const analyzeBMIChange = (bmi1: string | null, bmi2: string | null) => {
  if (!bmi1 || !bmi2) return null;

  // 尝试解析BMI值，处理可能的非数字字符
  const parseBMI = (value: string | null): number | null => {
    if (!value) return null;
    // 尝试提取数字部分
    const match = value.match(/[\d.]+/);
    if (!match) return null;
    const parsed = parseFloat(match[0]);
    return isNaN(parsed) ? null : parsed;
  };

  const bmi1Num = parseBMI(bmi1);
  const bmi2Num = parseBMI(bmi2);

  if (bmi1Num === null || bmi2Num === null) return null;

  const diff = bmi2Num - bmi1Num;
  const direction = diff > 0 ? '增加' : diff < 0 ? '减少' : '保持';
  let status = '';
  let suggestion = '';

  if (bmi2Num < 18.5) {
    status = '体重过轻';
    suggestion = '建议增加营养摄入，适当增重，加强肌肉锻炼。';
  } else if (bmi2Num < 24) {
    status = '体重正常';
    suggestion = '保持当前健康的体重状态。';
  } else if (bmi2Num < 28) {
    status = '超重';
    suggestion = '建议控制饮食，增加运动量，逐步减轻体重。';
  } else {
    status = '肥胖';
    suggestion = '建议立即制定减重计划，控制热量摄入，坚持有氧运动。';
  }

  if (diff !== 0) {
    if (diff > 0) {
      suggestion += ` BMI较之前${direction}了${Math.abs(diff).toFixed(1)}，${bmi2Num > 24 ? '需要注意体重控制' : '需要关注体重变化趋势'}。`;
    } else {
      suggestion += ` BMI较之前${direction}了${Math.abs(diff).toFixed(1)}，${bmi2Num < 24 ? '体重管理效果良好' : '继续保持减重进度'}。`;
    }
  }

  return { diff, direction, status, suggestion };
};

const analyzeHealthElementChange = (value1: number | null, value2: number | null, elementName: string) => {
  if (value1 === null || value2 === null) return null;
  const diff = value2 - value1;
  const direction = diff > 0 ? '提升' : diff < 0 ? '下降' : '保持';

  let level = '';
  if (value2 >= 80) level = '优秀';
  else if (value2 >= 60) level = '良好';
  else if (value2 >= 40) level = '一般';
  else level = '较差';

  let suggestion = '';
  const suggestions: Record<string, { improvement: string; decline: string }> = {
    qiAndBlood: {
      improvement: '气血状况改善，建议继续保持规律作息和营养补充。',
      decline: '气血状况下降，建议增加红枣、桂圆等补气血食物，减少熬夜。'
    },
    circulation: {
      improvement: '循环系统改善，建议保持适度有氧运动。',
      decline: '循环系统需要关注，建议增加步行、游泳等有氧运动。'
    },
    toxins: {
      improvement: '毒素清理能力提升，建议保持良好饮食和生活习惯。',
      decline: '毒素积压增加，建议增加饮水量，多吃排毒食物。'
    },
    bloodLipids: {
      improvement: '血脂状况改善，建议继续清淡饮食。',
      decline: '血脂需要关注，建议减少油腻食物，增加蔬菜摄入。'
    },
    coldness: {
      improvement: '寒凉状况改善，建议注意保暖，少吃生冷食物。',
      decline: '寒凉状况加重，建议增加生姜、红枣等温补食物，注意保暖。'
    },
    immunity: {
      improvement: '免疫力提升，建议保持良好的生活习惯。',
      decline: '免疫力下降，建议增加维生素摄入，保证充足睡眠。'
    },
    emotions: {
      improvement: '情绪状态改善，建议保持积极心态。',
      decline: '情绪压力增加，建议增加冥想、运动等放松活动。'
    },
    overallHealth: {
      improvement: '整体健康状况提升，继续保持！',
      decline: '整体健康状况需要关注，建议全面调理。'
    }
  };

  if (diff !== 0) {
    suggestion = diff > 0 ? suggestions[elementName]?.improvement : suggestions[elementName]?.decline;
  } else {
    suggestion = `${elementName}保持稳定，${value2 >= 60 ? '继续保持' : '需要改善'}`;
  }

  return { diff, direction, level, suggestion };
};

const analyzeArrayDifference = (array1: Set<number>, array2: Set<number>, items: any[], itemName: string) => {
  const added = [...array2].filter(x => !array1.has(x));
  const removed = [...array1].filter(x => !array2.has(x));
  const change = added.length - removed.length;

  let suggestion = '';
  if (change > 0) {
    suggestion = `新增${added.length}项${itemName}，健康风险增加，建议关注并改善。`;
  } else if (change < 0) {
    suggestion = `减少${removed.length}项${itemName}，健康状况有所改善。`;
  } else {
    suggestion = `${itemName}保持不变。`;
  }

  return { added, removed, change, suggestion };
};

// 解析血压
const parseBloodPressure = (bp: string | null): { systolic: number; diastolic: number } | null => {
  if (!bp) return null;
  const match = bp.match(/(\d+)\/(\d+)/);
  if (!match) return null;
  return {
    systolic: parseInt(match[1]),
    diastolic: parseInt(match[2])
  };
};

// 分析血压变化
const analyzeBloodPressureChange = (bp1: string | null, bp2: string | null) => {
  const parsed1 = parseBloodPressure(bp1);
  const parsed2 = parseBloodPressure(bp2);

  if (!parsed1 || !parsed2) return null;

  const systolicChange = parsed2.systolic - parsed1.systolic;
  const diastolicChange = parsed2.diastolic - parsed1.diastolic;

  let status = '';
  let suggestion = '';

  const isNormal = (systolic: number, diastolic: number) => {
    return systolic < 120 && diastolic < 80;
  };

  const isElevated = (systolic: number, diastolic: number) => {
    return (systolic >= 120 && systolic < 130) && diastolic < 80;
  };

  const isHypertension1 = (systolic: number, diastolic: number) => {
    return (systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90);
  };

  const isHypertension2 = (systolic: number, diastolic: number) => {
    return systolic >= 140 || diastolic >= 90;
  };

  if (isNormal(parsed2.systolic, parsed2.diastolic)) {
    status = '血压正常';
    suggestion = '血压保持正常范围，继续保持健康的生活方式。';
  } else if (isElevated(parsed2.systolic, parsed2.diastolic)) {
    status = '血压偏高';
    suggestion = '血压处于正常高值，建议注意饮食控制，增加运动。';
  } else if (isHypertension1(parsed2.systolic, parsed2.diastolic)) {
    status = '高血压1期';
    suggestion = '血压升高，建议调整生活方式，必要时就医。';
  } else {
    status = '高血压2期';
    suggestion = '血压较高，建议立即就医，遵医嘱治疗。';
  }

  if (systolicChange !== 0 || diastolicChange !== 0) {
    if (systolicChange > 0 || diastolicChange > 0) {
      suggestion += ` 血压较之前有所上升，需要密切关注。`;
    } else {
      suggestion += ` 血压较之前有所下降，改善效果良好。`;
    }
  }

  return {
    systolicChange,
    diastolicChange,
    status,
    suggestion
  };
};

export default function ComparePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [historyUsers, setHistoryUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [compareData, setCompareData] = useState<FullUserData[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      console.log('[数据对比页] 未检测到登录Token，跳转到登录页');
      router.push('/admin/login');
    }
  };

  const fetchHistory = async () => {
    if (!phone && !name) {
      alert('请输入手机号或姓名');
      return;
    }

    setLoading(true);
    try {
      const response = await mockFetchUserHistory(phone, name) as { success: boolean; users: UserData[] };
      if (response.success) {
        setHistoryUsers(response.users);
        setSelectedVersions([]);
      } else {
        alert('获取历史记录失败');
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      alert('获取历史记录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const toggleVersionSelection = (userId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        if (prev.length >= 3) {
          alert('最多只能选择3个版本进行对比');
          return prev;
        }
        return [...prev, userId];
      }
    });
  };

  const handleCompare = async () => {
    if (selectedVersions.length < 2) {
      alert('请至少选择2个版本进行对比');
      return;
    }

    setLoading(true);
    try {
      const promises = selectedVersions.map(userId => mockFetchUserFullData(userId));
      const results = await Promise.all(promises) as { success: boolean; data: { user: FullUserData } }[];
      const fullData = results.filter((r: { success: boolean; data: { user: FullUserData } }) => r.success).map((r: { success: boolean; data: { user: FullUserData } }) => r.data.user);

      if (fullData.length < 2) {
        alert('获取完整数据失败');
        return;
      }

      setCompareData(fullData);
      setShowCompareDialog(true);
    } catch (error) {
      console.error('Failed to fetch compare data:', error);
      alert('获取对比数据失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTrendIcon = (trend: string | null) => {
    if (!trend) return <Minus className="h-4 w-4 text-gray-400" />;
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const renderTrendIcon2 = (diff: number | null) => {
    if (diff === null) return <Minus className="h-4 w-4 text-gray-400" />;
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (diff < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">数据对比分析</h1>
                <p className="text-sm text-gray-500">对比同一用户不同时期的数据（演示模式）</p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle>选择对比对象</CardTitle>
            <CardDescription>
              输入手机号或姓名查看该用户的历史记录，然后选择需要对比的版本
              <br />
              <span className="text-blue-600">提示：可用测试手机号 13800138001（张三）、13900139001（李四）</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">手机号</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入姓名"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={fetchHistory} disabled={loading}>
                  {loading ? '加载中...' : '查询历史记录'}
                </Button>
              </div>
            </div>

            {historyUsers.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    找到 {historyUsers.length} 条记录
                  </h3>
                  <Button
                    onClick={handleCompare}
                    disabled={selectedVersions.length < 2 || loading}
                  >
                    开始对比 ({selectedVersions.length}/3)
                  </Button>
                </div>

                <div className="grid gap-4">
                  {historyUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedVersions.includes(user.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleVersionSelection(user.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded border-2 ${
                            selectedVersions.includes(user.id)
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedVersions.includes(user.id) && (
                              <CheckCircle className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {user.name || '匿名用户'} - {formatDate(user.createdAt)}
                            </div>
                            <div className="text-sm text-gray-500">
                              手机号: {user.phone} | {user.gender} | {user.age}岁 | BMI: {user.bmi}
                            </div>
                          </div>
                        </div>
                        {user.isLatestVersion && (
                          <Badge variant="secondary">最新版本</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 对比结果对话框 */}
        <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">数据对比结果</DialogTitle>
              <DialogDescription>
                对比 {compareData.length} 个版本的健康数据变化
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* 基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>项目</TableHead>
                        {compareData.map((data, index) => (
                          <TableHead key={data.id}>
                            版本 {index + 1} ({formatDate(data.createdAt)})
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>姓名</TableCell>
                        {compareData.map((data) => (
                          <TableCell key={data.id}>{data.name || '-'}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>年龄</TableCell>
                        {compareData.map((data) => (
                          <TableCell key={data.id}>{data.age || '-'}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>性别</TableCell>
                        {compareData.map((data) => (
                          <TableCell key={data.id}>{data.gender || '-'}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>职业</TableCell>
                        {compareData.map((data) => (
                          <TableCell key={data.id}>{data.occupation || '-'}</TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* BMI 对比 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    BMI 对比
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>项目</TableHead>
                        {compareData.map((data, index) => (
                          <TableHead key={data.id}>版本 {index + 1}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>身高 (cm)</TableCell>
                        {compareData.map((data) => (
                          <TableCell key={data.id}>{data.height || '-'}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>体重 (kg)</TableCell>
                        {compareData.map((data) => (
                          <TableCell key={data.id}>{data.weight || '-'}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>BMI</TableCell>
                        {compareData.map((data) => (
                          <TableCell key={data.id} className="font-semibold">
                            {data.bmi || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                  
                  {/* BMI 变化分析 */}
                  {compareData.length >= 2 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">BMI 变化分析</h4>
                      {compareData.slice(0, -1).map((data, index) => {
                        const nextData = compareData[index + 1];
                        const analysis = analyzeBMIChange(data.bmi, nextData.bmi);
                        if (!analysis) return null;
                        
                        return (
                          <div key={index} className="flex items-start gap-2 mb-2">
                            {renderTrendIcon2(analysis.diff)}
                            <div className="flex-1">
                              <span className="font-medium">
                                版本 {index + 1} → 版本 {index + 2}：
                              </span>
                              <span> BMI{analysis.direction}了 {Math.abs(analysis.diff).toFixed(1)}</span>
                              <span className="ml-2 text-gray-600">（{analysis.status}）</span>
                              <p className="text-sm text-gray-600 mt-1">{analysis.suggestion}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 血压对比 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    血压对比
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>项目</TableHead>
                        {compareData.map((data, index) => (
                          <TableHead key={data.id}>版本 {index + 1}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>血压 (mmHg)</TableCell>
                        {compareData.map((data) => (
                          <TableCell key={data.id} className="font-semibold">
                            {data.bloodPressure || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                  
                  {/* 血压变化分析 */}
                  {compareData.length >= 2 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">血压变化分析</h4>
                      {compareData.slice(0, -1).map((data, index) => {
                        const nextData = compareData[index + 1];
                        const analysis = analyzeBloodPressureChange(data.bloodPressure, nextData.bloodPressure);
                        if (!analysis) return null;
                        
                        return (
                          <div key={index} className="flex items-start gap-2 mb-2">
                            <Activity className="h-4 w-4 mt-0.5 text-blue-600" />
                            <div className="flex-1">
                              <span className="font-medium">
                                版本 {index + 1} → 版本 {index + 2}：
                              </span>
                              <span> 收缩压{analysis.systolicChange > 0 ? '上升' : analysis.systolicChange < 0 ? '下降' : '保持'} {Math.abs(analysis.systolicChange)}mmHg</span>
                              <span className="mx-2">|</span>
                              <span> 舒张压{analysis.diastolicChange > 0 ? '上升' : analysis.diastolicChange < 0 ? '下降' : '保持'} {Math.abs(analysis.diastolicChange)}mmHg</span>
                              <span className="ml-2 text-gray-600">（{analysis.status}）</span>
                              <p className="text-sm text-gray-600 mt-1">{analysis.suggestion}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 健康要素对比 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    健康要素对比
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>健康要素</TableHead>
                        {compareData.map((data, index) => (
                          <TableHead key={data.id}>版本 {index + 1}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { key: 'qiAndBlood', label: '气血', icon: <Flame className="h-4 w-4 text-red-500" /> },
                        { key: 'circulation', label: '循环', icon: <Heart className="h-4 w-4 text-blue-500" /> },
                        { key: 'toxins', label: '毒素', icon: <Droplets className="h-4 w-4 text-yellow-500" /> },
                        { key: 'bloodLipids', label: '血脂', icon: <Target className="h-4 w-4 text-orange-500" /> },
                        { key: 'coldness', label: '寒凉', icon: <Zap className="h-4 w-4 text-cyan-500" /> },
                        { key: 'immunity', label: '免疫力', icon: <Shield className="h-4 w-4 text-green-500" /> },
                        { key: 'emotions', label: '情绪', icon: <Sparkles className="h-4 w-4 text-purple-500" /> },
                        { key: 'overallHealth', label: '整体健康', icon: <Activity className="h-4 w-4 text-pink-500" /> },
                      ].map((element) => (
                        <TableRow key={element.key}>
                          <TableCell className="flex items-center gap-2">
                            {element.icon}
                            {element.label}
                          </TableCell>
                          {compareData.map((data, index) => {
                            const healthAnalysis = data.healthAnalysis?.[0];
                            const value = healthAnalysis ? healthAnalysis[element.key] : null;
                            const healthAnalysis2 = compareData[index + 1]?.healthAnalysis?.[0];
                            const value2 = healthAnalysis2 ? healthAnalysis2[element.key] : null;
                            const analysis = healthAnalysis2 ? analyzeHealthElementChange(value, value2, element.key) : null;
                            
                            return (
                              <TableCell key={data.id}>
                                <div className="flex items-center gap-2">
                                  <span className={`font-semibold ${
                                    value !== null ? (value >= 60 ? 'text-green-600' : 'text-red-600') : ''
                                  }`}>
                                    {value !== null ? `${value}分` : '-'}
                                  </span>
                                  {index < compareData.length - 1 && analysis && (
                                    <div className="flex items-center gap-1">
                                      {renderTrendIcon2(analysis.diff)}
                                      <span className="text-sm text-gray-600">
                                        {Math.abs(analysis.diff || 0).toFixed(1)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* 健康要素变化分析 */}
                  {compareData.length >= 2 && compareData[0].healthAnalysis?.[0] && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">健康要素变化分析</h4>
                      {[
                        'qiAndBlood', 'circulation', 'toxins', 'bloodLipids', 'coldness', 'immunity', 'emotions', 'overallHealth'
                      ].map((elementKey) => {
                        const healthAnalysis1 = compareData[0].healthAnalysis?.[0];
                        const healthAnalysis2 = compareData[compareData.length - 1].healthAnalysis?.[0];
                        const value1 = healthAnalysis1 ? healthAnalysis1[elementKey] : null;
                        const value2 = healthAnalysis2 ? healthAnalysis2[elementKey] : null;
                        const analysis = analyzeHealthElementChange(value1, value2, elementKey);
                        
                        if (!analysis) return null;
                        
                        return (
                          <div key={elementKey} className="flex items-start gap-2 mb-2">
                            {renderTrendIcon2(analysis.diff)}
                            <div className="flex-1">
                              <span className="font-medium">
                                {elementKey === 'qiAndBlood' ? '气血' :
                                 elementKey === 'circulation' ? '循环' :
                                 elementKey === 'toxins' ? '毒素' :
                                 elementKey === 'bloodLipids' ? '血脂' :
                                 elementKey === 'coldness' ? '寒凉' :
                                 elementKey === 'immunity' ? '免疫力' :
                                 elementKey === 'emotions' ? '情绪' : '整体健康'}：
                              </span>
                              <span> {value1 || 0} → {value2 || 0}（{analysis.level}）</span>
                              <p className="text-sm text-gray-600 mt-1">{analysis.suggestion}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 症状检查对比 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    症状检查对比
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {compareData.length >= 2 && compareData[0].symptomChecks?.[0] && compareData[1].symptomChecks?.[0] && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {compareData.map((data, index) => {
                          const symptomCheck = data.symptomChecks?.[0];
                          return (
                            <div key={data.id} className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold mb-2">版本 {index + 1}</h4>
                              <div className="text-sm">
                                <p>检查时间：{formatDate(symptomCheck?.checkedAt)}</p>
                                <p>症状数量：{symptomCheck?.checkedSymptoms?.length || 0} 项</p>
                                <p>总分：{symptomCheck?.totalScore || 0}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <Separator />
                      
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          对比分析
                        </h4>
                        <p className="text-sm text-gray-700">
                          版本间的症状数量和评分变化反映了健康状况的改善或恶化。
                          建议定期进行症状检查，及时了解身体状况变化。
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 用户选择对比 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    用户选择对比
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>项目</TableHead>
                        {compareData.map((data, index) => (
                          <TableHead key={data.id}>版本 {index + 1}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compareData.map((data, dataIndex) => {
                        const choice = data.userChoices?.[0];
                        return (
                          <TableRow key={data.id}>
                            <TableCell>选择的方案</TableCell>
                            {compareData.map((d, i) => {
                              const c = d.userChoices?.[0];
                              return (
                                <TableCell key={d.id}>
                                  <div className="space-y-1">
                                    <div className="font-medium">{c?.planType || '-'}</div>
                                    <div className="text-sm text-gray-600">{c?.planDescription || '-'}</div>
                                  </div>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                      <TableRow>
                        <TableCell>选择时间</TableCell>
                        {compareData.map((data) => (
                          <TableCell key={data.id}>
                            {formatDate(data.userChoices?.[0]?.selectedAt)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* 完成情况对比 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    完成情况对比
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>项目</TableHead>
                        {compareData.map((data, index) => (
                          <TableHead key={data.id}>版本 {index + 1}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { key: 'requirement1Completed', label: '要求1' },
                        { key: 'requirement2Completed', label: '要求2' },
                        { key: 'requirement3Completed', label: '要求3' },
                        { key: 'requirement4Completed', label: '要求4' },
                      ].map((req) => (
                        <TableRow key={req.key}>
                          <TableCell>{req.label}</TableCell>
                          {compareData.map((data) => (
                            <TableCell key={data.id}>
                              {data.requirements?.[req.key] ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell>完成时间</TableCell>
                        {compareData.map((data) => (
                          <TableCell key={data.id}>
                            {formatDate(data.requirements?.completedAt)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
