'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { LogOut, ArrowLeft, Activity, Users, CheckCircle, TrendingUp, TrendingDown, Minus, Eye, HelpCircle, AlertCircle, FileText, Sparkles, Flame, Heart, Zap, Droplets, Target, BookOpen, Stethoscope, RefreshCw, XCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
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

export default function AdminComparePage() {
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
      window.location.href = '/admin/login';
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
    const bmi1 = parseFloat(value1);
    const bmi2 = parseFloat(value2);
    if (isNaN(bmi1) || isNaN(bmi2)) return null;
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
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/admin/dashboard'}>
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
                window.location.href = '/admin/login';
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
                            onClick={() => window.location.href = `/admin/dashboard?userId=${user.id}`}
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

              <Separator />

              {/* 健康指标对比 */}
              {compareData.some(data => data.healthAnalysis && data.healthAnalysis.length > 0) && (
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
