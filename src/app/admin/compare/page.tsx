'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { LogOut, ArrowLeft, Activity, Users, CheckCircle, TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

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
    try {
      const params = new URLSearchParams();
      if (queryType === 'phone') {
        params.append('phone', phone);
      } else {
        params.append('name', name);
      }

      const response = await fetch(`/api/user/history?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setHistoryUsers(data.users);
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
      const promises = selectedVersions.map(userId =>
        fetch(`/api/admin/users/${userId}`).then(res => res.json())
      );
      const results = await Promise.all(promises);

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
        alert('获取完整数据失败');
        return;
      }

      console.log('对比数据:', fullData.map(d => ({
        name: d.name,
        hasHealthAnalysis: d.healthAnalysis && d.healthAnalysis.length > 0
      })));

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
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">数据对比结果</DialogTitle>
            <DialogDescription>
              对比 {compareData.length} 个版本的详细数据
            </DialogDescription>
          </DialogHeader>

          {compareData.length >= 2 && (
            <div className="space-y-6">
              {/* 基本信息对比 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>字段</TableHead>
                        {compareData.map((data, index) => (
                          <TableHead key={data.id}>
                            版本 {index + 1}
                            {data.isLatestVersion && (
                              <Badge className="ml-2 bg-green-500 text-xs">最新</Badge>
                            )}
                          </TableHead>
                        ))}
                        <TableHead>变化</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">填写时间</TableCell>
                        {compareData.map(data => (
                          <TableCell key={data.id}>{formatDate(data.createdAt)}</TableCell>
                        ))}
                        <TableCell>-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">姓名</TableCell>
                        {compareData.map(data => (
                          <TableCell key={data.id}>{data.name || '-'}</TableCell>
                        ))}
                        <TableCell>-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">年龄</TableCell>
                        {compareData.map((data, index) => (
                          <TableCell key={data.id}>{data.age || '-'}</TableCell>
                        ))}
                        <TableCell>
                          {formatChange(compareData[0].age, compareData[1].age)?.value}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">性别</TableCell>
                        {compareData.map(data => (
                          <TableCell key={data.id}>{data.gender || '-'}</TableCell>
                        ))}
                        <TableCell>-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">身高</TableCell>
                        {compareData.map(data => (
                          <TableCell key={data.id}>{data.height ? `${data.height} cm` : '-'}</TableCell>
                        ))}
                        <TableCell>
                          {formatChange(
                            parseFloat(compareData[0].height || '0'),
                            parseFloat(compareData[1].height || '0')
                          )?.value}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">体重</TableCell>
                        {compareData.map(data => (
                          <TableCell key={data.id}>{data.weight ? `${data.weight} kg` : '-'}</TableCell>
                        ))}
                        <TableCell>
                          {formatChange(
                            parseFloat(compareData[0].weight || '0'),
                            parseFloat(compareData[1].weight || '0')
                          )?.value}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">BMI</TableCell>
                        {compareData.map(data => (
                          <TableCell key={data.id}>
                            {data.bmi && !isNaN(Number(data.bmi))
                              ? Number(data.bmi).toFixed(1)
                              : '-'}
                          </TableCell>
                        ))}
                        <TableCell className="flex items-center gap-2">
                          {calculateBMIChange(compareData[0].bmi, compareData[1].bmi) && (
                            <>
                              {renderTrendIcon(calculateBMIChange(compareData[0].bmi, compareData[1].bmi)!.trend)}
                              {calculateBMIChange(compareData[0].bmi, compareData[1].bmi)!.value}
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* 趋势分析 */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle className="font-bold">趋势分析</AlertTitle>
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
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      健康分析对比
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>指标</TableHead>
                          {compareData.map((data, index) => (
                            <TableHead key={data.id}>版本 {index + 1}</TableHead>
                          ))}
                          <TableHead>变化</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
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
                            <TableRow key={element}>
                              <TableCell className="font-medium">{labels[element]}</TableCell>
                              {values.map((value, index) => (
                                <TableCell key={index}>{value ?? '-'}</TableCell>
                              ))}
                              <TableCell className="flex items-center gap-2">
                                {change && (
                                  <>
                                    {renderTrendIcon(change.trend)}
                                    {change.value}
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

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
    </div>
  );
}
