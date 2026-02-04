'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LogOut, ArrowLeft, Activity, CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { mockFetchUserHistory, mockFetchUserFullData } from '@/lib/mockCompareData';

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
      </div>

      {/* 对比结果对话框 */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">数据对比结果</DialogTitle>
            <DialogDescription>
              对比 {compareData.length} 个版本的基本信息
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* 基本信息对比 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {compareData.map((data, index) => (
                    <div key={data.id} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">版本 {index + 1}</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>姓名：</strong>{data.name || '-'}</div>
                        <div><strong>手机号：</strong>{data.phone || '-'}</div>
                        <div><strong>年龄：</strong>{data.age || '-'}岁</div>
                        <div><strong>性别：</strong>{data.gender || '-'}</div>
                        <div><strong>BMI：</strong>{data.bmi || '-'}</div>
                        <div><strong>血压：</strong>{data.bloodPressure || '-'}</div>
                        <div><strong>记录时间：</strong>{formatDate(data.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* BMI对比 */}
            {compareData.length >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>BMI 变化</CardTitle>
                </CardHeader>
                <CardContent>
                  {compareData.slice(0, -1).map((data, index) => {
                    const nextData = compareData[index + 1];
                    const bmi1 = parseFloat(data.bmi || '0');
                    const bmi2 = parseFloat(nextData.bmi || '0');
                    const diff = bmi2 - bmi1;

                    return (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        {diff > 0 ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : diff < 0 ? (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        ) : (
                          <Minus className="h-4 w-4 text-gray-400" />
                        )}
                        <div className="flex-1">
                          <span className="font-medium">版本 {index + 1} → 版本 {index + 2}：</span>
                          <span> BMI {diff > 0 ? '上升' : diff < 0 ? '下降' : '保持'} {Math.abs(diff).toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* 健康要素对比 */}
            {compareData.length >= 1 && compareData[0].healthAnalysis?.[0] && (
              <Card>
                <CardHeader>
                  <CardTitle>健康要素</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {compareData.map((data, dataIndex) => {
                      const analysis = data.healthAnalysis?.[0];
                      if (!analysis) return null;

                      return (
                        <div key={data.id} className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold mb-2">版本 {dataIndex + 1}</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>气血：</strong>{analysis.qiAndBlood || 0}分</div>
                            <div><strong>循环：</strong>{analysis.circulation || 0}分</div>
                            <div><strong>毒素：</strong>{analysis.toxins || 0}分</div>
                            <div><strong>血脂：</strong>{analysis.bloodLipids || 0}分</div>
                            <div><strong>寒凉：</strong>{analysis.coldness || 0}分</div>
                            <div><strong>免疫力：</strong>{analysis.immunity || 0}分</div>
                            <div><strong>情绪：</strong>{analysis.emotions || 0}分</div>
                            <div><strong>整体：</strong>{analysis.overallHealth || 0}分</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
