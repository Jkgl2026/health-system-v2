'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { LogOut, ArrowLeft, Activity, Users, CheckCircle, TrendingUp, TrendingDown, Minus, Eye, HelpCircle, AlertCircle, FileText, Sparkles, Flame, Heart, Zap, Droplets, Target, BookOpen, Stethoscope, RefreshCw, XCircle, CheckCircle2, AlertTriangle, Lightbulb, PlusCircle, MinusCircle, ArrowRight, ArrowDown, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { SEVEN_QUESTIONS, BAD_HABITS_CHECKLIST, BODY_SYMPTOMS, BODY_SYMPTOMS_300, TWENTY_ONE_COURSES } from '@/lib/health-data';
import DiagnosticsPanel from './diagnostics';

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
    suggestion = `新增了${change}项${itemName}，${itemName}总数增加，需要重点关注新出现的${itemName}。`;
  } else if (change < 0) {
    suggestion = `减少了${Math.abs(change)}项${itemName}，${itemName}总数减少，健康状况改善。`;
  } else if (added.length > 0 && removed.length > 0) {
    suggestion = `${itemName}总数保持不变，但内容有所变化，建议关注新出现的${itemName}。`;
  } else {
    suggestion = `${itemName}情况稳定，${array2.size > 0 ? '需要持续关注' : '健康状况良好'}。`;
  }

  return { added, removed, change, suggestion };
};

const analyzeSevenQuestionsChange = (answers1: Record<string, any>, answers2: Record<string, any>) => {
  const questions = SEVEN_QUESTIONS;
  const newAnswers: string[] = [];
  const changedAnswers: string[] = [];
  const improvedAnswers: string[] = [];

  questions.forEach(q => {
    const answer1 = typeof answers1?.[q.id.toString()] === 'object' ? answers1?.[q.id.toString()]?.answer : answers1?.[q.id.toString()];
    const answer2 = typeof answers2?.[q.id.toString()] === 'object' ? answers2?.[q.id.toString()]?.answer : answers2?.[q.id.toString()];

    if (!answer1 && answer2) {
      newAnswers.push(q.question);
    } else if (answer1 && answer2 && answer1 !== answer2) {
      changedAnswers.push(q.question);
      // 简单判断是否有改善（回答变得更详细或更积极）
      if (answer2.length > answer1.length) {
        improvedAnswers.push(q.question);
      }
    }
  });

  let suggestion = '';
  if (newAnswers.length > 0) {
    suggestion = `新回答了${newAnswers.length}个问题，健康意识有所提升。`;
  }
  if (changedAnswers.length > 0) {
    suggestion += ` 有${changedAnswers.length}个问题的回答发生变化。`;
  }
  if (newAnswers.length === 0 && changedAnswers.length === 0) {
    suggestion = '七问答案保持一致，健康意识稳定。';
  }
  if (improvedAnswers.length > 0) {
    suggestion += ' 回答内容更加详细，健康认知有所提升。';
  }

  return { newAnswers, changedAnswers, improvedAnswers, suggestion };
};

export default function AdminComparePage() {
  const router = useRouter();
  const [queryType, setQueryType] = useState<'phone' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [historyUsers, setHistoryUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [compareData, setCompareData] = useState<FullUserData[]>([]);
  const [showDiagnosticsDialog, setShowDiagnosticsDialog] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
    }
  };

  const fetchHistory = async () => {
    if (queryType === 'phone' && !phone) {
      alert('请输入手机号');
      return;
    }
    if (queryType === 'name' && !name) {
      alert('请输入姓名');
      return;
    }

    setLoading(true);
    setConnectionError(null);

    try {
      const params = new URLSearchParams();
      if (queryType === 'phone') {
        params.append('phone', phone);
      } else {
        params.append('name', name);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      const response = await fetch(`/api/user/history?${params.toString()}`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setHistoryUsers(data.users);
        setSelectedVersions([]);
      } else {
        throw new Error(data.error || data.details || '获取历史记录失败');
      }
    } catch (error: any) {
      console.error('Failed to fetch history:', error);
      let errorMessage = '获取历史记录失败';

      if (error.name === 'AbortError') {
        errorMessage = '请求超时，请检查网络连接或稍后重试';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string' && error.includes('Failed to fetch')) {
        errorMessage = '无法连接到服务器，请检查网络连接';
      }

      setConnectionError(errorMessage);
      alert(errorMessage);
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
    setConnectionError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const promises = selectedVersions.map(userId =>
        fetch(`/api/admin/users/${userId}`, {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
      );

      const results = await Promise.all(promises);
      clearTimeout(timeoutId);

      // r.data 是完整的数据对象，包含 user, symptomChecks, healthAnalysis 等
      // 我们需要展开其中的 user 字段作为基础，并添加其他字段
      const fullData = results
        .filter(r => r.success)
        .map(r => ({
          ...r.data.user,
          symptomChecks: r.data.symptomChecks || [],
          healthAnalysis: r.data.healthAnalysis || [],
          userChoices: r.data.userChoices || [],
          requirements: r.data.requirements || null
        }));

      if (fullData.length < 2) {
        throw new Error('获取完整数据失败，请重试');
      }

      console.log('对比数据:', fullData.map(d => ({
        name: d.name,
        hasHealthAnalysis: d.healthAnalysis && d.healthAnalysis.length > 0
      })));

      setCompareData(fullData);
      setShowCompareDialog(true);
    } catch (error: any) {
      console.error('Failed to fetch compare data:', error);
      let errorMessage = '获取对比数据失败';

      if (error.name === 'AbortError') {
        errorMessage = '请求超时，请稍后重试';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setConnectionError(errorMessage);
      alert(errorMessage);
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

  const calculateBMIChange = (value1: string | null, value2: string | null) => {
    if (!value1 || !value2) return null;

    // 尝试解析BMI值，处理可能的非数字字符
    const parseBMI = (value: string | null): number | null => {
      if (!value) return null;
      const match = value.match(/[\d.]+/);
      if (!match) return null;
      const parsed = parseFloat(match[0]);
      return isNaN(parsed) ? null : parsed;
    };

    const bmi1 = parseBMI(value1);
    const bmi2 = parseBMI(value2);

    if (bmi1 === null || bmi2 === null) return null;
    const diff = bmi2 - bmi1;
    return {
      value: diff.toFixed(1),
      trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'
    };
  };

  const formatChange = (value1: number | null, value2: number | null) => {
    if (value1 === null || value2 === null) return null;
    const diff = value2 - value1;
    return {
      value: diff.toFixed(1),
      trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'
    };
  };

  const renderTrendIcon = (trend: string | null) => {
    if (!trend) return <Minus className="h-4 w-4 text-gray-400" />;
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
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
                <p className="text-sm text-gray-500">对比同一用户不同时期的数据</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiagnosticsDialog(true)}
                title="运行诊断工具"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                诊断
              </Button>
              <Button variant="destructive" size="sm" onClick={() => {
                localStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('admin');
                router.push('/admin/login');
              }}>
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle>选择对比对象</CardTitle>
            <CardDescription>输入手机号或姓名查看该用户的所有填写记录，然后选择需要对比的版本</CardDescription>
          </CardHeader>
          <CardContent>
            {/* 查询类型选择 */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setQueryType('phone')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  queryType === 'phone'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                按手机号查询
              </button>
              <button
                type="button"
                onClick={() => setQueryType('name')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  queryType === 'name'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                按姓名查询
              </button>
            </div>

            {/* 输入框 */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder={queryType === 'phone' ? '请输入手机号' : '请输入姓名'}
                value={queryType === 'phone' ? phone : name}
                onChange={(e) => {
                  if (queryType === 'phone') {
                    setPhone(e.target.value);
                  } else {
                    setName(e.target.value);
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchHistory();
                  }
                }}
              />
              <Button onClick={fetchHistory} disabled={loading}>
                <Users className="h-4 w-4 mr-2" />
                查询历史
              </Button>
            </div>

            {historyUsers.length > 0 && (
              <>
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        找到 {historyUsers.length} 条历史记录，请选择 {selectedVersions.length}/3 个版本进行对比
                      </span>
                    </div>
                    <Button
                      onClick={handleCompare}
                      disabled={selectedVersions.length < 2 || loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      开始对比
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">选择</TableHead>
                      <TableHead>填写次数</TableHead>
                      <TableHead>填写时间</TableHead>
                      <TableHead>姓名</TableHead>
                      <TableHead>年龄</TableHead>
                      <TableHead>性别</TableHead>
                      <TableHead>BMI</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyUsers.map((user, index) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedVersions.includes(user.id)}
                            onChange={() => toggleVersionSelection(user.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">第 {historyUsers.length - index} 次</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{user.name || '-'}</TableCell>
                        <TableCell>{user.age || '-'}</TableCell>
                        <TableCell>{user.gender || '-'}</TableCell>
                        <TableCell>
                          {user.bmi && !isNaN(Number(user.bmi))
                            ? Number(user.bmi).toFixed(1)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {user.isLatestVersion ? (
                            <Badge className="bg-green-500">最新</Badge>
                          ) : (
                            <Badge variant="outline">历史</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/dashboard?userId=${user.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            详情
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle className="font-bold">使用说明</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>选择查询类型（手机号或姓名），输入对应的值查询该用户的所有填写记录</li>
              <li>勾选 2-3 个版本进行对比（最多3个）</li>
              <li>点击"开始对比"按钮查看详细对比结果</li>
              <li>可以对比基本信息、BMI变化、健康指标变化等</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      {/* 对比结果对话框 */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-screen-2xl max-h-[95vh] overflow-y-auto" style={{ width: '95vw', maxWidth: '1800px' }}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">数据对比结果</DialogTitle>
            <DialogDescription className="text-base">
              对比 {compareData.length} 个版本的详细数据
            </DialogDescription>
          </DialogHeader>

          {compareData.length >= 2 && (
            <div className="space-y-6">
              {/* 基本信息对比 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <Users className="h-6 w-6 mr-2" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {compareData.map((data, index) => (
                      <div key={data.id} className="border-2 rounded-lg overflow-hidden shadow-sm">
                        <div className={`bg-gradient-to-r px-4 py-3 ${index === 0 ? 'from-blue-500 to-blue-600' : index === 1 ? 'from-green-500 to-green-600' : 'from-purple-500 to-purple-600'}`}>
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg">版本 {index + 1}</h3>
                            {data.isLatestVersion && (
                              <Badge className="bg-white text-green-700 text-xs font-bold">最新</Badge>
                            )}
                          </div>
                          <div className="text-white/80 text-sm mt-1">{formatDate(data.createdAt)}</div>
                        </div>
                        <div className="p-4 bg-white space-y-3">
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">姓名</span>
                            <span className="font-semibold">{data.name || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">年龄</span>
                            <span className="font-semibold">{data.age || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">性别</span>
                            <span className="font-semibold">{data.gender || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">身高</span>
                            <span className="font-semibold">{data.height ? `${data.height} cm` : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">体重</span>
                            <span className="font-semibold">{data.weight ? `${data.weight} kg` : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">BMI</span>
                            <span className={`font-bold text-xl ${data.bmi && !isNaN(Number(data.bmi)) ? (Number(data.bmi) >= 24 ? 'text-red-600' : Number(data.bmi) >= 18.5 ? 'text-green-600' : 'text-yellow-600') : 'text-gray-400'}`}>
                              {data.bmi && !isNaN(Number(data.bmi))
                                ? Number(data.bmi).toFixed(1)
                                : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 变化对比 */}
                  {compareData.length >= 2 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        版本对比变化
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="text-xs text-gray-500 mb-1">年龄变化</div>
                          <div className="font-semibold text-blue-600">
                            {formatChange(compareData[0].age, compareData[1].age)?.value || '-'}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="text-xs text-gray-500 mb-1">身高变化</div>
                          <div className="font-semibold text-blue-600">
                            {formatChange(
                              parseFloat(compareData[0].height || '0'),
                              parseFloat(compareData[1].height || '0')
                            )?.value || '-'}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="text-xs text-gray-500 mb-1">体重变化</div>
                          <div className="font-semibold text-blue-600">
                            {formatChange(
                              parseFloat(compareData[0].weight || '0'),
                              parseFloat(compareData[1].weight || '0')
                            )?.value || '-'}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="text-xs text-gray-500 mb-1">BMI变化</div>
                          <div className="font-semibold flex items-center justify-center gap-1">
                            {calculateBMIChange(compareData[0].bmi, compareData[1].bmi) ? (
                              <>
                                {renderTrendIcon(calculateBMIChange(compareData[0].bmi, compareData[1].bmi)!.trend)}
                                <span className={calculateBMIChange(compareData[0].bmi, compareData[1].bmi)!.trend === 'up' ? 'text-red-600' : calculateBMIChange(compareData[0].bmi, compareData[1].bmi)!.trend === 'down' ? 'text-green-600' : 'text-blue-600'}>
                                  {calculateBMIChange(compareData[0].bmi, compareData[1].bmi)!.value}
                                </span>
                              </>
                            ) : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 趋势分析 */}
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-5 w-5" />
                <AlertTitle className="font-bold text-lg">趋势分析</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-2 text-sm">
                    {(() => {
                      const bmiChange = calculateBMIChange(compareData[0].bmi, compareData[1].bmi);
                      if (!bmiChange) return <p>BMI数据不足，无法分析趋势</p>;

                      return (
                        <>
                          {bmiChange.trend === 'up' ? (
                            <p className="text-red-600">
                              <TrendingUp className="h-4 w-4 inline mr-1" />
                              BMI 上升 {bmiChange.value}，请注意饮食和运动
                            </p>
                          ) : bmiChange.trend === 'down' ? (
                            <p className="text-green-600">
                              <TrendingDown className="h-4 w-4 inline mr-1" />
                              BMI 下降 {bmiChange.value}，继续保持健康生活方式
                            </p>
                          ) : (
                            <p className="text-blue-600">
                              <Minus className="h-4 w-4 inline mr-1" />
                              BMI 保持稳定，状态良好
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </AlertDescription>
              </Alert>

              {/* 基本信息差异分析和改进建议 */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold text-blue-900">
                    <Lightbulb className="h-6 w-6 mr-2" />
                    差异分析与改进建议
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const bmiAnalysis = analyzeBMIChange(compareData[0].bmi, compareData[1].bmi);
                      const weightChange = formatChange(
                        parseFloat(compareData[0].weight || '0'),
                        parseFloat(compareData[1].weight || '0')
                      );
                      const heightChange = formatChange(
                        parseFloat(compareData[0].height || '0'),
                        parseFloat(compareData[1].height || '0')
                      );
                      const ageChange = formatChange(compareData[0].age, compareData[1].age);

                      return (
                        <>
                          {/* BMI分析 */}
                          <div className="p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-lg text-gray-900 flex items-center">
                                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                                BMI 变化分析
                              </h4>
                              <Badge className={bmiAnalysis && bmiAnalysis.diff > 0 ? 'bg-red-100 text-red-700' : bmiAnalysis && bmiAnalysis.diff < 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                                {bmiAnalysis?.direction || '无数据'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">版本1 BMI</div>
                                <div className="font-bold text-lg text-blue-600">{compareData[0].bmi || '-'}</div>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">版本2 BMI</div>
                                <div className="font-bold text-lg text-gray-900">{compareData[1].bmi || '-'}</div>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">变化值</div>
                                <div className={`font-bold text-lg ${bmiAnalysis && bmiAnalysis.diff > 0 ? 'text-red-600' : bmiAnalysis && bmiAnalysis.diff < 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                  {bmiAnalysis && bmiAnalysis.diff > 0 ? '+' : ''}{bmiAnalysis?.diff?.toFixed(1) || '0'}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-purple-100 text-purple-700">当前状态</Badge>
                                <span className="font-medium text-gray-700">{bmiAnalysis?.status || '无法判断'}</span>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">{bmiAnalysis?.suggestion || '无法提供建议'}</span>
                              </div>
                            </div>
                          </div>

                          {/* 其他指标变化 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-blue-600" />
                                <h5 className="font-semibold text-gray-900">体重变化</h5>
                              </div>
                              <div className="text-center">
                                <div className={`font-bold text-2xl ${weightChange?.trend === 'up' ? 'text-red-600' : weightChange?.trend === 'down' ? 'text-green-600' : 'text-blue-600'}`}>
                                  {weightChange?.trend === 'up' ? '+' : ''}{weightChange?.value || '-'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">kg</div>
                              </div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="h-4 w-4 text-blue-600" />
                                <h5 className="font-semibold text-gray-900">身高变化</h5>
                              </div>
                              <div className="text-center">
                                <div className={`font-bold text-2xl ${heightChange?.trend === 'up' ? 'text-green-600' : heightChange?.trend === 'down' ? 'text-red-600' : 'text-blue-600'}`}>
                                  {heightChange?.trend === 'up' ? '+' : ''}{heightChange?.value || '-'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">cm</div>
                              </div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <h5 className="font-semibold text-gray-900">年龄变化</h5>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-2xl text-blue-600">
                                  {ageChange?.value || '-'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">岁</div>
                              </div>
                            </div>
                          </div>

                          {/* 综合建议 */}
                          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="h-5 w-5 text-green-600" />
                              <h5 className="font-bold text-lg text-green-900">综合改进建议</h5>
                            </div>
                            <ul className="space-y-2 text-sm">
                              {bmiAnalysis?.diff && bmiAnalysis.diff > 1 && (
                                <li className="flex items-start gap-2">
                                  <ArrowRight className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">BMI有明显上升趋势，建议立即制定减重计划，控制每日热量摄入在合理范围（男性约2000-2500卡，女性约1600-2000卡），并保持每周至少150分钟的中等强度有氧运动。</span>
                                </li>
                              )}
                              {bmiAnalysis?.diff && bmiAnalysis.diff < -1 && bmiAnalysis.diff > -5 && (
                                <li className="flex items-start gap-2">
                                  <ArrowRight className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">体重控制效果良好，建议继续保持当前饮食和运动习惯，定期监测BMI变化，避免体重反弹。</span>
                                </li>
                              )}
                              {bmiAnalysis?.status === '超重' || bmiAnalysis?.status === '肥胖' ? (
                                <li className="flex items-start gap-2">
                                  <ArrowRight className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">当前处于{bmiAnalysis.status}状态，建议咨询营养师制定个性化减重方案，同时结合中医调理（如艾灸、经络调理）加速新陈代谢。</span>
                                </li>
                              ) : bmiAnalysis?.status === '体重过轻' ? (
                                <li className="flex items-start gap-2">
                                  <ArrowRight className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">当前处于体重过轻状态，建议增加营养摄入，适当进行力量训练增加肌肉量，避免过度节食。</span>
                                </li>
                              ) : (
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">体重处于健康范围，建议继续保持均衡饮食、规律作息和适量运动，定期进行健康检查。</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* 健康指标对比 */}
              {compareData.some(data => data.healthAnalysis && data.healthAnalysis.length > 0) && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl font-bold">
                        <Activity className="h-6 w-6 mr-2" />
                        健康分析对比
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {compareData.map((data, index) => {
                          const analysis = data.healthAnalysis?.[0];
                          const elements = ['qiAndBlood', 'circulation', 'toxins', 'bloodLipids', 'coldness', 'immunity', 'emotions', 'overallHealth'];
                          const labels: Record<string, string> = {
                            qiAndBlood: '气血',
                            circulation: '循环',
                            toxins: '毒素',
                            bloodLipids: '血脂',
                            coldness: '寒凉',
                            immunity: '免疫',
                            emotions: '情绪',
                            overallHealth: '整体健康',
                          };
                          const colors: Record<string, string> = {
                            qiAndBlood: 'from-red-500 to-red-600',
                            circulation: 'from-blue-500 to-blue-600',
                            toxins: 'from-yellow-500 to-yellow-600',
                            bloodLipids: 'from-orange-500 to-orange-600',
                            coldness: 'from-cyan-500 to-cyan-600',
                            immunity: 'from-green-500 to-green-600',
                            emotions: 'from-purple-500 to-purple-600',
                            overallHealth: 'from-indigo-500 to-indigo-600',
                          };

                          return (
                            <div key={data.id} className="border-2 rounded-lg overflow-hidden shadow-sm">
                              <div className={`bg-gradient-to-r px-4 py-3 ${index === 0 ? 'from-blue-500 to-blue-600' : index === 1 ? 'from-green-500 to-green-600' : 'from-purple-500 to-purple-600'}`}>
                                <div className="flex items-center justify-between">
                                  <h3 className="text-white font-bold text-lg">版本 {index + 1}</h3>
                                  {data.isLatestVersion && (
                                    <Badge className="bg-white text-green-700 text-xs font-bold">最新</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="p-4 bg-white space-y-2">
                                {elements.map(element => {
                                  const value = analysis?.[element] ?? null;
                                  const score = value !== null ? Number(value) : 0;
                                  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-blue-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600';

                                  return (
                                    <div key={element} className="flex items-center justify-between py-2 border-b">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[element]}`}></div>
                                        <span className="text-gray-700 font-medium">{labels[element]}</span>
                                      </div>
                                      <span className={`font-bold text-xl ${scoreColor}`}>{value ?? '-'}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 变化对比 */}
                      {compareData.length >= 2 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                          <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2" />
                            版本对比变化
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['qiAndBlood', 'circulation', 'toxins', 'bloodLipids', 'coldness', 'immunity', 'emotions', 'overallHealth'].map(element => {
                              const labels: Record<string, string> = {
                                qiAndBlood: '气血',
                                circulation: '循环',
                                toxins: '毒素',
                                bloodLipids: '血脂',
                                coldness: '寒凉',
                                immunity: '免疫',
                                emotions: '情绪',
                                overallHealth: '整体健康',
                              };

                              const getValue = (data: FullUserData) => {
                                const analysis = data.healthAnalysis?.[0];
                                return analysis?.[element] || null;
                              };

                              const values = compareData.map(getValue);
                              const change = formatChange(values[0], values[1]);

                              return (
                                <div key={element} className="text-center p-3 bg-white rounded border">
                                  <div className="text-xs text-gray-500 mb-1">{labels[element]}</div>
                                  <div className="font-semibold flex items-center justify-center gap-1">
                                    {change ? (
                                      <>
                                        {renderTrendIcon(change.trend)}
                                        <span className={change.trend === 'up' ? 'text-red-600' : change.trend === 'down' ? 'text-green-600' : 'text-blue-600'}>
                                          {change.value}
                                        </span>
                                      </>
                                    ) : '-'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 健康分析差异分析和改进建议 */}
                  <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl font-bold text-green-900">
                        <Lightbulb className="h-6 w-6 mr-2" />
                        健康要素差异分析与改进建议
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {compareData.length >= 2 && (() => {
                          const analysis1 = compareData[0].healthAnalysis?.[0];
                          const analysis2 = compareData[1].healthAnalysis?.[0];
                          const elements = ['qiAndBlood', 'circulation', 'toxins', 'bloodLipids', 'coldness', 'immunity', 'emotions', 'overallHealth'];
                          const labels: Record<string, string> = {
                            qiAndBlood: '气血',
                            circulation: '循环',
                            toxins: '毒素',
                            bloodLipids: '血脂',
                            coldness: '寒凉',
                            immunity: '免疫',
                            emotions: '情绪',
                            overallHealth: '整体健康',
                          };

                          const improvedElements: string[] = [];
                          const declinedElements: string[] = [];
                          const stableElements: string[] = [];

                          elements.forEach(element => {
                            const analysis = analyzeHealthElementChange(
                              analysis1?.[element] as number | null,
                              analysis2?.[element] as number | null,
                              element
                            );
                            if (analysis) {
                              if (analysis.diff > 0) improvedElements.push(labels[element]);
                              else if (analysis.diff < 0) declinedElements.push(labels[element]);
                              else stableElements.push(labels[element]);
                            }
                          });

                          return (
                            <>
                              {/* 概览 */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-green-100 rounded-lg border-2 border-green-300">
                                  <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <h5 className="font-bold text-green-900">改善要素</h5>
                                  </div>
                                  <div className="text-2xl font-bold text-green-700">{improvedElements.length}项</div>
                                  <div className="text-sm text-green-600 mt-1">
                                    {improvedElements.length > 0 ? improvedElements.join('、') : '无'}
                                  </div>
                                </div>
                                <div className="p-4 bg-red-100 rounded-lg border-2 border-red-300">
                                  <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                    <h5 className="font-bold text-red-900">需关注要素</h5>
                                  </div>
                                  <div className="text-2xl font-bold text-red-700">{declinedElements.length}项</div>
                                  <div className="text-sm text-red-600 mt-1">
                                    {declinedElements.length > 0 ? declinedElements.join('、') : '无'}
                                  </div>
                                </div>
                                <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Minus className="h-5 w-5 text-blue-600" />
                                    <h5 className="font-bold text-blue-900">保持稳定</h5>
                                  </div>
                                  <div className="text-2xl font-bold text-blue-700">{stableElements.length}项</div>
                                  <div className="text-sm text-blue-600 mt-1">
                                    {stableElements.length > 0 ? stableElements.join('、') : '无'}
                                  </div>
                                </div>
                              </div>

                              {/* 详细分析 */}
                              <div className="space-y-3">
                                {elements.map(element => {
                                  const analysis = analyzeHealthElementChange(
                                    analysis1?.[element] as number | null,
                                    analysis2?.[element] as number | null,
                                    element
                                  );

                                  if (!analysis) return null;

                                  const value2 = analysis2?.[element] as number;
                                  const isHighRisk = value2 < 50;

                                  return (
                                    <div key={element} className={`p-4 bg-white rounded-lg border-2 ${isHighRisk ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          <Badge className={analysis.diff > 0 ? 'bg-green-100 text-green-700' : analysis.diff < 0 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                                            {analysis.direction}
                                          </Badge>
                                          <h5 className="font-bold text-lg text-gray-900">{labels[element]}</h5>
                                          {isHighRisk && <AlertTriangle className="h-5 w-5 text-red-600" />}
                                        </div>
                                        <div className="text-right">
                                          <div className="text-2xl font-bold text-blue-600">{value2}</div>
                                          <div className="text-xs text-gray-500">
                                            {analysis.diff !== 0 && (
                                              <span className={analysis.diff > 0 ? 'text-green-600' : 'text-red-600'}>
                                                {analysis.diff > 0 ? '+' : ''}{analysis.diff.toFixed(1)}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-gray-700">
                                          <div className="font-medium mb-1">建议：</div>
                                          <div>{analysis.suggestion}</div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* 综合调理方案 */}
                              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <Sparkles className="h-5 w-5 text-purple-600" />
                                  <h5 className="font-bold text-lg text-purple-900">综合调理方案</h5>
                                </div>
                                <div className="space-y-3 text-sm">
                                  <div className="p-3 bg-white rounded-lg border">
                                    <h6 className="font-semibold text-gray-900 mb-2">调理重点</h6>
                                    <p className="text-gray-700">
                                      {declinedElements.length > 0
                                        ? `重点关注${declinedElements.join('、')}等要素的调理，这些要素分数下降需要引起重视。`
                                        : '整体健康状况良好，继续保持健康生活方式。'}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {declinedElements.includes('气血') && (
                                      <div className="p-3 bg-white rounded-lg border">
                                        <h6 className="font-semibold text-red-900 mb-1">气血调理方案</h6>
                                        <p className="text-gray-700">推荐使用艾灸调理、火灸调理，配合红枣、桂圆、黑芝麻等补气血食物，减少熬夜和过度劳累。</p>
                                      </div>
                                    )}
                                    {declinedElements.includes('循环') && (
                                      <div className="p-3 bg-white rounded-lg border">
                                        <h6 className="font-semibold text-blue-900 mb-1">循环调理方案</h6>
                                        <p className="text-gray-700">推荐经络调理、正骨调理，配合适量有氧运动（步行、游泳、太极），促进血液循环。</p>
                                      </div>
                                    )}
                                    {declinedElements.includes('毒素') && (
                                      <div className="p-3 bg-white rounded-lg border">
                                        <h6 className="font-semibold text-yellow-900 mb-1">毒素调理方案</h6>
                                        <p className="text-gray-700">推荐空腹禅调理，增加饮水量（每日8杯水），多吃绿叶蔬菜和富含纤维的食物。</p>
                                      </div>
                                    )}
                                    {declinedElements.includes('血脂') && (
                                      <div className="p-3 bg-white rounded-lg border">
                                        <h6 className="font-semibold text-orange-900 mb-1">血脂调理方案</h6>
                                        <p className="text-gray-700">推荐清淡饮食，减少油腻和油炸食物，增加燕麦、山楂、海带等降脂食物摄入。</p>
                                      </div>
                                    )}
                                    {declinedElements.includes('寒凉') && (
                                      <div className="p-3 bg-white rounded-lg border">
                                        <h6 className="font-semibold text-cyan-900 mb-1">寒凉调理方案</h6>
                                        <p className="text-gray-700">推荐艾灸调理，增加生姜、红糖、羊肉等温补食物，注意保暖避免受凉。</p>
                                      </div>
                                    )}
                                    {declinedElements.includes('免疫') && (
                                      <div className="p-3 bg-white rounded-lg border">
                                        <h6 className="font-semibold text-green-900 mb-1">免疫调理方案</h6>
                                        <p className="text-gray-700">推荐适量运动、充足睡眠，增加富含维生素C的食物（柑橘、猕猴桃、青椒）。</p>
                                      </div>
                                    )}
                                    {declinedElements.includes('情绪') && (
                                      <div className="p-3 bg-white rounded-lg border">
                                        <h6 className="font-semibold text-purple-900 mb-1">情绪调理方案</h6>
                                        <p className="text-gray-700">推荐空腹禅调理、冥想放松，培养兴趣爱好，保持积极乐观的心态。</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              <Separator />

              {/* 七问答案对比 - 左右并排 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <HelpCircle className="h-6 w-6 mr-2" />
                    持续跟进落实健康的七问（全部7个问题）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {compareData.map((data, versionIndex) => {
                      const answers = data.requirements?.sevenQuestionsAnswers;
                      const answerDict = answers as Record<string, any>;

                      return (
                        <div key={data.id} className="border-2 rounded-lg overflow-hidden shadow-sm">
                          <div className={`bg-gradient-to-r px-4 py-3 ${versionIndex === 0 ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'}`}>
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-bold text-lg">版本 {versionIndex + 1}</h3>
                              {data.isLatestVersion && (
                                <Badge className="bg-white text-green-700 text-xs font-bold">最新</Badge>
                              )}
                            </div>
                            <div className="text-white/80 text-sm mt-1">{formatDate(data.createdAt)}</div>
                          </div>
                          <div className="p-4 bg-white space-y-3">
                            {SEVEN_QUESTIONS.map((q, qIndex) => {
                              const answerData = answerDict?.[q.id.toString()];
                              const answer = typeof answerData === 'object' && answerData !== null ? answerData.answer : answerData;
                              const isFilled = !!answer;

                              return (
                                <div key={qIndex} className={`p-3 rounded-lg border ${isFilled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                  <div className="flex items-start justify-between mb-2">
                                    <span className="font-bold text-gray-900">{qIndex + 1}. {q.question}</span>
                                    {isFilled && (
                                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mb-2">{q.description}</div>
                                  <div className="text-sm text-gray-700">
                                    {answer || <span className="text-gray-400 italic">未填写</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 七问答案差异分析和改进建议 */}
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold text-yellow-900">
                    <Lightbulb className="h-6 w-6 mr-2" />
                    健康意识差异分析与改进建议
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {compareData.length >= 2 && (() => {
                      const answers1 = compareData[0].requirements?.sevenQuestionsAnswers as Record<string, any> || {};
                      const answers2 = compareData[1].requirements?.sevenQuestionsAnswers as Record<string, any> || {};
                      const analysis = analyzeSevenQuestionsChange(answers1, answers2);

                      return (
                        <>
                          {/* 统计概览 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-green-100 rounded-lg border-2 border-green-300">
                              <div className="flex items-center gap-2 mb-2">
                                <PlusCircle className="h-5 w-5 text-green-600" />
                                <h5 className="font-bold text-green-900">新回答问题</h5>
                              </div>
                              <div className="text-2xl font-bold text-green-700">{analysis.newAnswers.length}个</div>
                            </div>
                            <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
                              <div className="flex items-center gap-2 mb-2">
                                <RefreshCw className="h-5 w-5 text-blue-600" />
                                <h5 className="font-bold text-blue-900">回答变化</h5>
                              </div>
                              <div className="text-2xl font-bold text-blue-700">{analysis.changedAnswers.length}个</div>
                            </div>
                            <div className="p-4 bg-purple-100 rounded-lg border-2 border-purple-300">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                <h5 className="font-bold text-purple-900">认知提升</h5>
                              </div>
                              <div className="text-2xl font-bold text-purple-700">{analysis.improvedAnswers.length}个</div>
                            </div>
                          </div>

                          {/* 详细变化 */}
                          {analysis.newAnswers.length > 0 && (
                            <div className="p-4 bg-white rounded-lg border-2 border-green-200">
                              <div className="flex items-center gap-2 mb-3">
                                <PlusCircle className="h-5 w-5 text-green-600" />
                                <h5 className="font-bold text-lg text-gray-900">新回答的问题（{analysis.newAnswers.length}个）</h5>
                              </div>
                              <div className="space-y-2">
                                {analysis.newAnswers.map((question, idx) => (
                                  <div key={idx} className="flex items-start gap-2 p-2 bg-green-50 rounded border border-green-200">
                                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700">{question}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {analysis.changedAnswers.length > 0 && (
                            <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                              <div className="flex items-center gap-2 mb-3">
                                <RefreshCw className="h-5 w-5 text-blue-600" />
                                <h5 className="font-bold text-lg text-gray-900">回答变化的问题（{analysis.changedAnswers.length}个）</h5>
                              </div>
                              <div className="space-y-2">
                                {analysis.changedAnswers.map((question, idx) => {
                                  const qIndex = SEVEN_QUESTIONS.findIndex(q => q.question === question);
                                  const qId = qIndex >= 0 ? SEVEN_QUESTIONS[qIndex].id : null;
                                  const qIdStr = qId !== null ? qId.toString() : '';
                                  const answer1 = typeof answers1?.[qIdStr] === 'object' ? (answers1?.[qIdStr] as any)?.answer : answers1?.[qIdStr];
                                  const answer2 = typeof answers2?.[qIdStr] === 'object' ? (answers2?.[qIdStr] as any)?.answer : answers2?.[qIdStr];

                                  return (
                                    <div key={idx} className="p-3 bg-blue-50 rounded border border-blue-200">
                                      <div className="font-semibold text-gray-900 mb-2">{question}</div>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                          <span className="text-blue-600 font-medium flex-shrink-0">版本1:</span>
                                          <span className="text-gray-600">{answer1 || '未回答'}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                          <span className="text-green-600 font-medium flex-shrink-0">版本2:</span>
                                          <span className="text-gray-600">{answer2 || '未回答'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 综合分析和建议 */}
                          <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="h-5 w-5 text-orange-600" />
                              <h5 className="font-bold text-lg text-orange-900">健康意识分析与建议</h5>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div className="p-3 bg-white rounded-lg border">
                                <h6 className="font-semibold text-gray-900 mb-2">变化总结</h6>
                                <p className="text-gray-700">{analysis.suggestion}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 bg-white rounded-lg border">
                                  <h6 className="font-semibold text-green-900 mb-1">健康意识提升建议</h6>
                                  <ul className="space-y-1 text-gray-700">
                                    {analysis.newAnswers.length > 0 && (
                                      <li>• 继续深入思考健康问题，建议定期回顾七问答案</li>
                                    )}
                                    {analysis.improvedAnswers.length > 0 && (
                                      <li>• 健康认知有明显提升，建议将认知转化为行动</li>
                                    )}
                                    <li>• 建议每月填写一次七问，跟踪健康意识变化</li>
                                  </ul>
                                </div>
                                <div className="p-3 bg-white rounded-lg border">
                                  <h6 className="font-semibold text-blue-900 mb-1">后续行动建议</h6>
                                  <ul className="space-y-1 text-gray-700">
                                    <li>• 根据七问答案，制定具体的健康管理计划</li>
                                    <li>• 定期与健康管理师沟通，调整调理方案</li>
                                    <li>• 参加健康管理课程，提升健康知识水平</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* 不良生活习惯自检表对比 - 左右并排 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <AlertCircle className="h-6 w-6 mr-2" />
                    不良生活习惯自检表（全部252项）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {compareData.map((data, versionIndex) => {
                      const habitIds = new Set(Array.isArray(data.requirements?.badHabitsChecklist)
                        ? data.requirements.badHabitsChecklist
                        : []);

                      return (
                        <div key={data.id} className="border-2 rounded-lg overflow-hidden shadow-sm">
                          <div className={`bg-gradient-to-r px-4 py-3 ${versionIndex === 0 ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'}`}>
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-bold text-lg">版本 {versionIndex + 1}</h3>
                              {data.isLatestVersion && (
                                <Badge className="bg-white text-green-700 text-xs font-bold">最新</Badge>
                              )}
                            </div>
                            <div className="text-white/80 text-sm mt-1">
                              已选择 {habitIds.size} / 252 项不良生活习惯
                            </div>
                          </div>
                          <div className="p-4 bg-white space-y-4 max-h-[600px] overflow-y-auto">
                            {Object.entries(BAD_HABITS_CHECKLIST).map(([category, habits]) => {
                              const categorySelectedCount = habits.filter((habit: any) => habitIds.has(habit.id)).length;

                              return (
                                <div key={category} className="p-3 bg-gray-50 rounded-lg border">
                                  <h4 className="font-semibold text-pink-700 mb-2">
                                    {category} ({categorySelectedCount}/{habits.length}项)
                                  </h4>
                                  <div className="space-y-1">
                                    {habits.map((habit: any) => {
                                      const isSelected = habitIds.has(habit.id);

                                      return (
                                        <div
                                          key={habit.id}
                                          className={`p-2 rounded text-sm border ${
                                            isSelected
                                              ? 'bg-pink-50 border-pink-200 text-pink-900'
                                              : 'bg-white border-gray-200 text-gray-600'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs">#{habit.id}</span>
                                            <span className="flex-1">{habit.habit}</span>
                                            {isSelected && (
                                              <CheckCircle2 className="h-4 w-4 text-pink-600 flex-shrink-0" />
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* 身体语言简表对比 - 左右并排 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <FileText className="h-6 w-6 mr-2" />
                    身体语言简表（全部100项）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {compareData.map((data, versionIndex) => {
                      const symptomCheck = data.symptomChecks?.[0];
                      const symptomIds = new Set(symptomCheck?.checkedSymptoms?.map((id: string) => parseInt(id)) || []);

                      // 按类别分组
                      const symptomsByCategory = BODY_SYMPTOMS.reduce((acc, symptom) => {
                        if (!acc[symptom.category]) acc[symptom.category] = [];
                        acc[symptom.category].push(symptom);
                        return acc;
                      }, {} as Record<string, any[]>);

                      return (
                        <div key={data.id} className="border-2 rounded-lg overflow-hidden shadow-sm">
                          <div className={`bg-gradient-to-r px-4 py-3 ${versionIndex === 0 ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'}`}>
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-bold text-lg">版本 {versionIndex + 1}</h3>
                              {data.isLatestVersion && (
                                <Badge className="bg-white text-green-700 text-xs font-bold">最新</Badge>
                              )}
                            </div>
                            <div className="text-white/80 text-sm mt-1">
                              已选择 {symptomIds.size} / 100 项症状
                            </div>
                          </div>
                          <div className="p-4 bg-white space-y-4 max-h-[600px] overflow-y-auto">
                            {Object.entries(symptomsByCategory).map(([category, symptoms]) => {
                              const categorySelectedCount = symptoms.filter((s: any) => symptomIds.has(s.id)).length;

                              return (
                                <div key={category} className="p-3 bg-gray-50 rounded-lg border">
                                  <h4 className="font-semibold text-green-700 mb-2">
                                    {category} ({categorySelectedCount}/{symptoms.length}项)
                                  </h4>
                                  <div className="space-y-1">
                                    {symptoms.map((symptom: any) => {
                                      const isSelected = symptomIds.has(symptom.id);

                                      return (
                                        <div
                                          key={symptom.id}
                                          className={`p-2 rounded text-sm border ${
                                            isSelected
                                              ? 'bg-green-50 border-green-200 text-green-900'
                                              : 'bg-white border-gray-200 text-gray-600'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs">#{symptom.id}</span>
                                            <span className="flex-1">{symptom.name}</span>
                                            {isSelected && (
                                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* 300项症状自检表对比 - 左右并排 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <FileText className="h-6 w-6 mr-2" />
                    300项症状自检表（全部300项）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {compareData.map((data, versionIndex) => {
                      const symptomIds = new Set(Array.isArray(data.requirements?.symptoms300Checklist)
                        ? data.requirements.symptoms300Checklist
                        : []);

                      // 按类别分组
                      const symptomsByCategory = BODY_SYMPTOMS_300.reduce((acc, symptom) => {
                        if (!acc[symptom.category]) acc[symptom.category] = [];
                        acc[symptom.category].push(symptom);
                        return acc;
                      }, {} as Record<string, any[]>);

                      return (
                        <div key={data.id} className="border-2 rounded-lg overflow-hidden shadow-sm">
                          <div className={`bg-gradient-to-r px-4 py-3 ${versionIndex === 0 ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'}`}>
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-bold text-lg">版本 {versionIndex + 1}</h3>
                              {data.isLatestVersion && (
                                <Badge className="bg-white text-green-700 text-xs font-bold">最新</Badge>
                              )}
                            </div>
                            <div className="text-white/80 text-sm mt-1">
                              已选择 {symptomIds.size} / 300 项症状
                            </div>
                          </div>
                          <div className="p-4 bg-white space-y-4 max-h-[600px] overflow-y-auto">
                            {Object.entries(symptomsByCategory).map(([category, symptoms]) => {
                              const categorySelectedCount = symptoms.filter((s: any) => symptomIds.has(s.id)).length;

                              return (
                                <div key={category} className="p-3 bg-gray-50 rounded-lg border">
                                  <h4 className="font-semibold text-amber-700 mb-2">
                                    {category} ({categorySelectedCount}/{symptoms.length}项)
                                  </h4>
                                  <div className="space-y-1">
                                    {symptoms.map((symptom: any) => {
                                      const isSelected = symptomIds.has(symptom.id);

                                      return (
                                        <div
                                          key={symptom.id}
                                          className={`p-2 rounded text-sm border ${
                                            isSelected
                                              ? 'bg-amber-50 border-amber-200 text-amber-900'
                                              : 'bg-white border-gray-200 text-gray-600'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs">#{symptom.id}</span>
                                            <span className="flex-1">{symptom.name}</span>
                                            {symptom.description && (
                                              <span className="text-xs text-purple-600 italic mr-2">{symptom.description}</span>
                                            )}
                                            {isSelected && (
                                              <CheckCircle2 className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 不良生活习惯、身体语言简表、300症状综合差异分析 */}
              <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold text-pink-900">
                    <Lightbulb className="h-6 w-6 mr-2" />
                    症状差异分析与改进建议
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {compareData.length >= 2 && (() => {
                      const habitIds1 = new Set<number>(Array.isArray(compareData[0].requirements?.badHabitsChecklist)
                        ? compareData[0].requirements.badHabitsChecklist.map((id: any) => Number(id))
                        : []);
                      const habitIds2 = new Set<number>(Array.isArray(compareData[1].requirements?.badHabitsChecklist)
                        ? compareData[1].requirements.badHabitsChecklist.map((id: any) => Number(id))
                        : []);

                      const symptomCheck1 = compareData[0].symptomChecks?.[0];
                      const symptomIds1 = new Set<number>(symptomCheck1?.checkedSymptoms?.map((id: string) => parseInt(id)) || []);

                      const symptomCheck2 = compareData[1].symptomChecks?.[0];
                      const symptomIds2 = new Set<number>(symptomCheck2?.checkedSymptoms?.map((id: string) => parseInt(id)) || []);

                      const symptom300Ids1 = new Set<number>(Array.isArray(compareData[0].requirements?.symptoms300Checklist)
                        ? compareData[0].requirements.symptoms300Checklist.map((id: any) => Number(id))
                        : []);
                      const symptom300Ids2 = new Set<number>(Array.isArray(compareData[1].requirements?.symptoms300Checklist)
                        ? compareData[1].requirements.symptoms300Checklist.map((id: any) => Number(id))
                        : []);

                      const habitsAnalysis = analyzeArrayDifference(habitIds1, habitIds2, Object.values(BAD_HABITS_CHECKLIST).flat(), '不良生活习惯');
                      const symptomsAnalysis = analyzeArrayDifference(symptomIds1, symptomIds2, BODY_SYMPTOMS, '身体语言症状');
                      const symptoms300Analysis = analyzeArrayDifference(symptom300Ids1, symptom300Ids2, BODY_SYMPTOMS_300, '300项症状');

                      return (
                        <>
                          {/* 总体统计 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white rounded-lg border-2 border-pink-300 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-pink-900">不良生活习惯</h5>
                                <AlertCircle className="h-5 w-5 text-pink-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-pink-700 mb-1">{habitIds2.size}</div>
                                <div className="text-xs text-gray-500">当前总数</div>
                              </div>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                <span className="text-sm text-gray-600">变化:</span>
                                <Badge className={habitsAnalysis.change > 0 ? 'bg-red-100 text-red-700' : habitsAnalysis.change < 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                                  {habitsAnalysis.change > 0 ? '+' : ''}{habitsAnalysis.change}
                                </Badge>
                              </div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border-2 border-green-300 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-green-900">身体语言症状</h5>
                                <FileText className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-green-700 mb-1">{symptomIds2.size}</div>
                                <div className="text-xs text-gray-500">当前总数</div>
                              </div>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                <span className="text-sm text-gray-600">变化:</span>
                                <Badge className={symptomsAnalysis.change > 0 ? 'bg-red-100 text-red-700' : symptomsAnalysis.change < 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                                  {symptomsAnalysis.change > 0 ? '+' : ''}{symptomsAnalysis.change}
                                </Badge>
                              </div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border-2 border-amber-300 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-amber-900">300项症状</h5>
                                <FileText className="h-5 w-5 text-amber-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-amber-700 mb-1">{symptom300Ids2.size}</div>
                                <div className="text-xs text-gray-500">当前总数</div>
                              </div>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                <span className="text-sm text-gray-600">变化:</span>
                                <Badge className={symptoms300Analysis.change > 0 ? 'bg-red-100 text-red-700' : symptoms300Analysis.change < 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                                  {symptoms300Analysis.change > 0 ? '+' : ''}{symptoms300Analysis.change}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* 新增症状 */}
                          {habitsAnalysis.added.length > 0 || symptomsAnalysis.added.length > 0 || symptoms300Analysis.added.length > 0 && (
                            <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                              <div className="flex items-center gap-2 mb-3">
                                <PlusCircle className="h-5 w-5 text-red-600" />
                                <h5 className="font-bold text-lg text-red-900">新增项目（需重点关注）</h5>
                              </div>
                              <div className="space-y-3">
                                {habitsAnalysis.added.length > 0 && (
                                  <div>
                                    <h6 className="font-semibold text-pink-900 mb-2">新增不良生活习惯（{habitsAnalysis.added.length}项）</h6>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                      {habitsAnalysis.added.slice(0, 10).map((id, idx) => {
                                        const habit = Object.values(BAD_HABITS_CHECKLIST).flat().find((h: any) => h.id === id);
                                        return (
                                          <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-pink-200 text-sm">
                                            <AlertCircle className="h-4 w-4 text-pink-600 flex-shrink-0" />
                                            <span className="text-gray-700">{habit?.habit || `#${id}`}</span>
                                          </div>
                                        );
                                      })}
                                      {habitsAnalysis.added.length > 10 && (
                                        <div className="text-xs text-gray-500 text-center">还有 {habitsAnalysis.added.length - 10} 项...</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {symptomsAnalysis.added.length > 0 && (
                                  <div>
                                    <h6 className="font-semibold text-green-900 mb-2">新增身体语言症状（{symptomsAnalysis.added.length}项）</h6>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                      {symptomsAnalysis.added.slice(0, 10).map((id, idx) => {
                                        const symptom = BODY_SYMPTOMS.find(s => s.id === id);
                                        return (
                                          <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-green-200 text-sm">
                                            <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span className="text-gray-700">{symptom?.name || `#${id}`}</span>
                                          </div>
                                        );
                                      })}
                                      {symptomsAnalysis.added.length > 10 && (
                                        <div className="text-xs text-gray-500 text-center">还有 {symptomsAnalysis.added.length - 10} 项...</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {symptoms300Analysis.added.length > 0 && (
                                  <div>
                                    <h6 className="font-semibold text-amber-900 mb-2">新增300项症状（{symptoms300Analysis.added.length}项）</h6>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                      {symptoms300Analysis.added.slice(0, 10).map((id, idx) => {
                                        const symptom = BODY_SYMPTOMS_300.find(s => s.id === id);
                                        return (
                                          <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-amber-200 text-sm">
                                            <FileText className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                            <span className="text-gray-700">{symptom?.name || `#${id}`}</span>
                                          </div>
                                        );
                                      })}
                                      {symptoms300Analysis.added.length > 10 && (
                                        <div className="text-xs text-gray-500 text-center">还有 {symptoms300Analysis.added.length - 10} 项...</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 改善症状 */}
                          {habitsAnalysis.removed.length > 0 || symptomsAnalysis.removed.length > 0 || symptoms300Analysis.removed.length > 0 && (
                            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                              <div className="flex items-center gap-2 mb-3">
                                <MinusCircle className="h-5 w-5 text-green-600" />
                                <h5 className="font-bold text-lg text-green-900">改善项目（值得肯定）</h5>
                              </div>
                              <div className="space-y-3">
                                {habitsAnalysis.removed.length > 0 && (
                                  <div>
                                    <h6 className="font-semibold text-pink-900 mb-2">改善的不良生活习惯（{habitsAnalysis.removed.length}项）</h6>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                      {habitsAnalysis.removed.slice(0, 10).map((id, idx) => {
                                        const habit = Object.values(BAD_HABITS_CHECKLIST).flat().find((h: any) => h.id === id);
                                        return (
                                          <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-pink-200 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span className="text-gray-700">{habit?.habit || `#${id}`}</span>
                                          </div>
                                        );
                                      })}
                                      {habitsAnalysis.removed.length > 10 && (
                                        <div className="text-xs text-gray-500 text-center">还有 {habitsAnalysis.removed.length - 10} 项...</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {symptomsAnalysis.removed.length > 0 && (
                                  <div>
                                    <h6 className="font-semibold text-green-900 mb-2">改善的身体语言症状（{symptomsAnalysis.removed.length}项）</h6>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                      {symptomsAnalysis.removed.slice(0, 10).map((id, idx) => {
                                        const symptom = BODY_SYMPTOMS.find(s => s.id === id);
                                        return (
                                          <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-green-200 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span className="text-gray-700">{symptom?.name || `#${id}`}</span>
                                          </div>
                                        );
                                      })}
                                      {symptomsAnalysis.removed.length > 10 && (
                                        <div className="text-xs text-gray-500 text-center">还有 {symptomsAnalysis.removed.length - 10} 项...</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {symptoms300Analysis.removed.length > 0 && (
                                  <div>
                                    <h6 className="font-semibold text-amber-900 mb-2">改善的300项症状（{symptoms300Analysis.removed.length}项）</h6>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                      {symptoms300Analysis.removed.slice(0, 10).map((id, idx) => {
                                        const symptom = BODY_SYMPTOMS_300.find(s => s.id === id);
                                        return (
                                          <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-amber-200 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span className="text-gray-700">{symptom?.name || `#${id}`}</span>
                                          </div>
                                        );
                                      })}
                                      {symptoms300Analysis.removed.length > 10 && (
                                        <div className="text-xs text-gray-500 text-center">还有 {symptoms300Analysis.removed.length - 10} 项...</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 综合建议 */}
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="h-5 w-5 text-purple-600" />
                              <h5 className="font-bold text-lg text-purple-900">综合调理建议</h5>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div className="p-3 bg-white rounded-lg border">
                                <h6 className="font-semibold text-gray-900 mb-2">症状变化分析</h6>
                                <p className="text-gray-700">
                                  {habitsAnalysis.change > 0 || symptomsAnalysis.change > 0 || symptoms300Analysis.change > 0
                                    ? '症状总数有所增加，需要重点关注新增的健康问题，及时调整调理方案。'
                                    : habitsAnalysis.change < 0 || symptomsAnalysis.change < 0 || symptoms300Analysis.change < 0
                                    ? '症状总数有所减少，健康状况正在改善，继续保持良好的调理方案。'
                                    : '症状总数保持稳定，健康状况平稳，建议继续保持当前的调理方案。'}
                                </p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 bg-white rounded-lg border">
                                  <h6 className="font-semibold text-pink-900 mb-1">不良生活习惯改进建议</h6>
                                  <ul className="space-y-1 text-gray-700">
                                    <li>• 重点关注新增的不良生活习惯，找出根本原因</li>
                                    <li>• 制定逐步改善计划，避免一次性改变过多</li>
                                    <li>• 结合健康管理课程，学习健康生活理念</li>
                                  </ul>
                                </div>
                                <div className="p-3 bg-white rounded-lg border">
                                  <h6 className="font-semibold text-amber-900 mb-1">症状调理建议</h6>
                                  <ul className="space-y-1 text-gray-700">
                                    <li>• 根据新增症状的类别，选择合适的调理产品</li>
                                    <li>• 结合健康要素分析，调理整体健康水平</li>
                                    <li>• 定期复查症状变化，及时调整调理方案</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* 四个要求完成情况对比 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <CheckCircle className="h-6 w-6 mr-2" />
                    四个要求完成情况对比
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {compareData.map((data, index) => {
                      const requirements = ['requirement1Completed', 'requirement2Completed', 'requirement3Completed', 'requirement4Completed'];
                      const labels = ['要求一：总览和故事', '要求二：了解发心感悟', '要求三：必学课程', '要求四：复健速度'];
                      const completedCount = requirements.filter(req => data.requirements?.[req]).length;
                      const progress = (completedCount / 4) * 100;

                      return (
                        <div key={data.id} className="border-2 rounded-lg overflow-hidden shadow-sm">
                          <div className={`bg-gradient-to-r px-4 py-3 ${index === 0 ? 'from-blue-500 to-blue-600' : index === 1 ? 'from-green-500 to-green-600' : 'from-purple-500 to-purple-600'}`}>
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-bold text-lg">版本 {index + 1}</h3>
                              {data.isLatestVersion && (
                                <Badge className="bg-white text-green-700 text-xs font-bold">最新</Badge>
                              )}
                            </div>
                            <div className="text-white/80 text-sm mt-1">完成进度: {completedCount}/4 ({progress}%)</div>
                          </div>
                          <div className="p-4 bg-white space-y-2">
                            {requirements.map((req, idx) => {
                              const isCompleted = data.requirements?.[req] || false;

                              return (
                                <div key={req} className={`flex items-center justify-between py-3 px-3 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}>
                                      {isCompleted ? (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                      ) : (
                                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                                      )}
                                    </div>
                                    <span className={`font-medium ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>{labels[idx]}</span>
                                  </div>
                                  {isCompleted && (
                                    <Badge className="bg-green-500 text-xs">已完成</Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="px-4 pb-4 bg-white space-y-2">
                            <div className="flex justify-between items-center py-2 border-t">
                              <span className="text-gray-600">完成时间</span>
                              <span className="text-sm">{formatDate(data.requirements?.completedAt)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t">
                              <span className="text-gray-600">最后更新</span>
                              <span className="text-sm">{formatDate(data.requirements?.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* 个性化健康管理方案对比 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold">
                    <Sparkles className="h-6 w-6 mr-2" />
                    个性化健康管理方案对比
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* 主要健康要素对比 */}
                    <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <h4 className="text-base font-semibold mb-3 text-gray-900 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-purple-600" />
                        主要健康要素（按症状数量排序，取前3）
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {compareData.map((data, versionIndex) => {
                          const elementScores = data.symptomChecks?.[0]?.elementScores as Record<string, number> || {};
                          const primaryElements = Object.entries(elementScores)
                            .filter(([_, count]) => count > 0)
                            .sort((a, b) => (b[1] as number) - (a[1] as number))
                            .slice(0, 3)
                            .map(([name, count]) => ({ name, count: Number(count) }));

                          return (
                            <div key={versionIndex} className="p-3 bg-white rounded-lg border">
                              <div className="text-xs text-gray-500 mb-2">版本 {versionIndex + 1}</div>
                              {primaryElements.length > 0 ? (
                                primaryElements.map((el, idx) => (
                                  <div key={idx} className="flex items-center justify-between py-1">
                                    <span className="text-sm font-medium">{el.name}</span>
                                    <Badge className="bg-purple-100 text-purple-700">{el.count}个症状</Badge>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-gray-400">无数据</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 推荐调理产品对比 */}
                    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <h4 className="text-base font-semibold mb-3 text-gray-900 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-blue-600" />
                        推荐调理产品
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {compareData.map((data, versionIndex) => {
                          const elementScores = data.symptomChecks?.[0]?.elementScores as Record<string, number> || {};
                          const primaryElements = Object.entries(elementScores)
                            .filter(([_, count]) => count > 0)
                            .sort((a, b) => (b[1] as number) - (a[1] as number))
                            .slice(0, 3)
                            .map(([name, count]) => ({ name, count: Number(count) }));

                          const elementNames = primaryElements.map(el => el.name);
                          const products: any[] = [];

                          if (elementNames.includes('气血') || elementNames.includes('寒凉') || elementNames.includes('循环')) {
                            products.push({ name: '艾灸调理', matchScore: 5 });
                          }
                          if (elementNames.includes('气血') || elementNames.includes('毒素') || elementNames.includes('循环')) {
                            products.push({ name: '火灸调理', matchScore: 5 });
                          }
                          if (elementNames.includes('循环') || elementNames.includes('气血')) {
                            products.push({ name: '正骨调理', matchScore: 4 });
                          }
                          if (elementNames.includes('情绪') || elementNames.includes('毒素') || elementNames.includes('气血') || elementNames.includes('血脂')) {
                            products.push({ name: '空腹禅调理', matchScore: 4 });
                          }
                          if (elementNames.includes('循环') || elementNames.includes('气血') || elementNames.includes('毒素')) {
                            products.push({ name: '经络调理', matchScore: 4 });
                          }
                          products.push({ name: '药王产品', matchScore: 3 });

                          return (
                            <div key={versionIndex} className="p-3 bg-white rounded-lg border">
                              <div className="text-xs text-gray-500 mb-2">版本 {versionIndex + 1}</div>
                              {products.length > 0 ? (
                                products.map((product, idx) => (
                                  <div key={idx} className="flex items-center justify-between py-1">
                                    <span className="text-sm font-medium">{product.name}</span>
                                    <Badge className="bg-blue-100 text-blue-700">匹配度 {product.matchScore}</Badge>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-gray-400">无数据</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 推荐学习课程对比 */}
                    <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <h4 className="text-base font-semibold mb-3 text-gray-900 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                        推荐学习课程（按相关性排序）
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {compareData.map((data, versionIndex) => {
                          const elementScores = data.symptomChecks?.[0]?.elementScores as Record<string, number> || {};
                          const primaryElements = Object.entries(elementScores)
                            .filter(([_, count]) => count > 0)
                            .sort((a, b) => (b[1] as number) - (a[1] as number))
                            .slice(0, 3)
                            .map(([name, count]) => ({ name, count: Number(count) }));

                          const primaryElementNames = primaryElements.map(el => el.name);

                          const courses = TWENTY_ONE_COURSES.map((course: any) => {
                            let relevance: 'high' | 'medium' | 'low' = 'low';

                            if (primaryElementNames.length > 0) {
                              if (primaryElementNames.includes('气血') && course.title.includes('气血')) relevance = 'high';
                              else if (primaryElementNames.includes('循环') && course.title.includes('循环')) relevance = 'high';
                              else if (primaryElementNames.includes('毒素') && course.title.includes('毒素')) relevance = 'high';
                              else if (primaryElementNames.includes('寒凉') && course.title.includes('寒')) relevance = 'high';
                              else if (primaryElementNames.includes('免疫') && course.title.includes('免疫')) relevance = 'high';
                              else if (primaryElementNames.includes('情绪') && course.title.includes('情绪')) relevance = 'high';
                              else if (primaryElementNames.includes('血脂') && course.title.includes('血脂')) relevance = 'high';
                              else relevance = 'medium';
                            }

                            return { ...course, relevance };
                          }).sort((a: any, b: any) => {
                            const relevanceOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
                            return relevanceOrder[b.relevance] - relevanceOrder[a.relevance];
                          }).slice(0, 5);

                          return (
                            <div key={versionIndex} className="p-3 bg-white rounded-lg border">
                              <div className="text-xs text-gray-500 mb-2">版本 {versionIndex + 1}</div>
                              {courses.length > 0 ? (
                                courses.map((course, idx) => (
                                  <div key={idx} className="py-1 border-b last:border-0">
                                    <div className="text-xs font-medium text-gray-700">{course.title}</div>
                                    <Badge className={`mt-1 ${course.relevance === 'high' ? 'bg-green-500' : course.relevance === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                                      {course.relevance === 'high' ? '高相关' : course.relevance === 'medium' ? '中相关' : '低相关'}
                                    </Badge>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-gray-400">无数据</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 四个要求和健康管理方案差异分析 */}
              <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold text-indigo-900">
                    <Lightbulb className="h-6 w-6 mr-2" />
                    完成情况与方案差异分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {compareData.length >= 2 && (() => {
                      const requirements1 = compareData[0].requirements || {};
                      const requirements2 = compareData[1].requirements || {};

                      const reqs = ['requirement1Completed', 'requirement2Completed', 'requirement3Completed', 'requirement4Completed'];
                      const labels = ['要求一：总览和故事', '要求二：了解发心感悟', '要求三：必学课程', '要求四：复健速度'];

                      const completed1 = reqs.filter(req => requirements1[req]).length;
                      const completed2 = reqs.filter(req => requirements2[req]).length;

                      const newlyCompleted: string[] = [];
                      const stillIncomplete: string[] = [];

                      reqs.forEach((req, idx) => {
                        if (!requirements1[req] && requirements2[req]) {
                          newlyCompleted.push(labels[idx]);
                        } else if (!requirements2[req]) {
                          stillIncomplete.push(labels[idx]);
                        }
                      });

                      const progressChange = completed2 - completed1;

                      // 健康管理方案变化分析
                      const elementScores1 = compareData[0].symptomChecks?.[0]?.elementScores as Record<string, number> || {};
                      const elementScores2 = compareData[1].symptomChecks?.[0]?.elementScores as Record<string, number> || {};

                      const primaryElements1 = Object.entries(elementScores1)
                        .filter(([_, count]) => count > 0)
                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                        .slice(0, 3)
                        .map(([name, count]) => ({ name, count: Number(count) }));

                      const primaryElements2 = Object.entries(elementScores2)
                        .filter(([_, count]) => count > 0)
                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                        .slice(0, 3)
                        .map(([name, count]) => ({ name, count: Number(count) }));

                      const elementNames1 = primaryElements1.map(el => el.name);
                      const elementNames2 = primaryElements2.map(el => el.name);

                      const newElements = elementNames2.filter(name => !elementNames1.includes(name));
                      const removedElements = elementNames1.filter(name => !elementNames2.includes(name));

                      return (
                        <>
                          {/* 四个要求完成情况分析 */}
                          <div className="p-4 bg-white rounded-lg border-2 border-indigo-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="font-bold text-lg text-gray-900 flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2 text-indigo-600" />
                                四个要求完成情况分析
                              </h5>
                              <Badge className={progressChange > 0 ? 'bg-green-100 text-green-700' : progressChange < 0 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                                {progressChange > 0 ? '+' : ''}{progressChange}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">版本1完成度</div>
                                <div className="font-bold text-2xl text-indigo-600">{completed1}/4</div>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">版本2完成度</div>
                                <div className="font-bold text-2xl text-gray-900">{completed2}/4</div>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">完成率</div>
                                <div className="font-bold text-2xl text-green-600">{(completed2 / 4 * 100).toFixed(0)}%</div>
                              </div>
                            </div>

                            {newlyCompleted.length > 0 && (
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200 mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <PlusCircle className="h-4 w-4 text-green-600" />
                                  <h6 className="font-semibold text-green-900">新完成的要求</h6>
                                </div>
                                <div className="space-y-1">
                                  {newlyCompleted.map((req, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      <span>{req}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {stillIncomplete.length > 0 && (
                              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                                  <h6 className="font-semibold text-yellow-900">待完成的要求</h6>
                                </div>
                                <div className="space-y-1">
                                  {stillIncomplete.map((req, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                      <XCircle className="h-4 w-4 text-yellow-600" />
                                      <span>{req}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {completed2 === 4 && (
                              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-5 w-5 text-green-600" />
                                  <span className="font-bold text-green-900">恭喜！已全部完成四个要求</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 健康管理方案变化分析 */}
                          <div className="p-4 bg-white rounded-lg border-2 border-purple-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="font-bold text-lg text-gray-900 flex items-center">
                                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                                健康管理方案变化分析
                              </h5>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h6 className="font-semibold text-blue-900 mb-2">版本1 主要健康要素</h6>
                                <div className="space-y-1">
                                  {primaryElements1.length > 0 ? primaryElements1.map((el, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                                      <span className="text-sm font-medium">{el.name}</span>
                                      <Badge className="bg-blue-100 text-blue-700">{el.count}个症状</Badge>
                                    </div>
                                  )) : <div className="text-sm text-gray-500">无数据</div>}
                                </div>
                              </div>
                              <div>
                                <h6 className="font-semibold text-green-900 mb-2">版本2 主要健康要素</h6>
                                <div className="space-y-1">
                                  {primaryElements2.length > 0 ? primaryElements2.map((el, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                                      <span className="text-sm font-medium">{el.name}</span>
                                      <Badge className="bg-green-100 text-green-700">{el.count}个症状</Badge>
                                    </div>
                                  )) : <div className="text-sm text-gray-500">无数据</div>}
                                </div>
                              </div>
                            </div>

                            {newElements.length > 0 || removedElements.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {newElements.length > 0 && (
                                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <PlusCircle className="h-4 w-4 text-red-600" />
                                      <h6 className="font-semibold text-red-900">新增健康要素</h6>
                                    </div>
                                    <div className="space-y-1">
                                      {newElements.map((el, idx) => (
                                        <div key={idx} className="text-sm text-gray-700">• {el}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {removedElements.length > 0 && (
                                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <MinusCircle className="h-4 w-4 text-green-600" />
                                      <h6 className="font-semibold text-green-900">改善健康要素</h6>
                                    </div>
                                    <div className="space-y-1">
                                      {removedElements.map((el, idx) => (
                                        <div key={idx} className="text-sm text-gray-700">• {el}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                  <span>主要健康要素保持稳定，调理方案持续有效</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 综合建议 */}
                          <div className="p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-lg border-2 border-violet-200">
                            <div className="flex items-center gap-2 mb-3">
                              <Lightbulb className="h-5 w-5 text-violet-600" />
                              <h5 className="font-bold text-lg text-violet-900">综合提升建议</h5>
                            </div>
                            <div className="space-y-3 text-sm">
                              {completed2 < 4 && (
                                <div className="p-3 bg-white rounded-lg border">
                                  <h6 className="font-semibold text-yellow-900 mb-1">学习进度建议</h6>
                                  <ul className="space-y-1 text-gray-700">
                                    {stillIncomplete.length > 0 && stillIncomplete.map((req, idx) => (
                                      <li key={idx}>• 尽快完成"{req}"，这是健康管理的重要环节</li>
                                    ))}
                                    <li>• 建议每周安排2-3小时学习健康管理课程</li>
                                    <li>• 制定详细的学习计划，确保按时完成所有要求</li>
                                  </ul>
                                </div>
                              )}
                              {newElements.length > 0 && (
                                <div className="p-3 bg-white rounded-lg border">
                                  <h6 className="font-semibold text-red-900 mb-1">调理方案调整建议</h6>
                                  <ul className="space-y-1 text-gray-700">
                                    <li>• 健康要素发生变化，建议重新评估调理方案</li>
                                    <li>• 针对{newElements.join('、')}等新出现的健康要素，增加相应的调理产品</li>
                                    <li>• 建议与健康管理师沟通，调整个性化调理方案</li>
                                  </ul>
                                </div>
                              )}
                              {removedElements.length > 0 && (
                                <div className="p-3 bg-white rounded-lg border">
                                  <h6 className="font-semibold text-green-900 mb-1">巩固建议</h6>
                                  <ul className="space-y-1 text-gray-700">
                                    <li>• {removedElements.join('、')}状况明显改善，继续保持当前调理方案</li>
                                    <li>• 定期复查，防止症状反复</li>
                                    <li>• 将改善的经验分享给其他用户，帮助更多人</li>
                                  </ul>
                                </div>
                              )}
                              <div className="p-3 bg-white rounded-lg border">
                                <h6 className="font-semibold text-purple-900 mb-1">长期健康管理建议</h6>
                                <ul className="space-y-1 text-gray-700">
                                  <li>• 建立健康档案，定期记录身体状态和调理效果</li>
                                  <li>• 每1-2个月进行一次全面健康自检，跟踪健康变化</li>
                                  <li>• 结合季节变化，调整饮食和运动计划</li>
                                  <li>• 保持积极乐观的心态，促进身心健康</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* 数据不足提示 */}
              {!compareData.some(data => data.healthAnalysis && data.healthAnalysis.length > 0) && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle className="font-bold">健康分析数据不足</AlertTitle>
                  <AlertDescription>
                    所选版本中没有健康分析数据，仅显示基本信息和BMI对比。
                    请确保用户已完成健康分析后再进行健康指标对比。
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 诊断对话框 */}
      <Dialog open={showDiagnosticsDialog} onOpenChange={setShowDiagnosticsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">系统诊断</DialogTitle>
            <DialogDescription>
              检查系统状态，帮助诊断连接问题
            </DialogDescription>
          </DialogHeader>
          <DiagnosticsPanel />
        </DialogContent>
      </Dialog>

      {/* 连接错误提示 */}
      {connectionError && (
        <Alert className="fixed bottom-4 right-4 max-w-md shadow-lg bg-red-50 border-red-200">
          <XCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="font-bold text-red-900">连接错误</AlertTitle>
          <AlertDescription className="text-red-700">
            {connectionError}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setShowDiagnosticsDialog(true)}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              运行诊断
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
