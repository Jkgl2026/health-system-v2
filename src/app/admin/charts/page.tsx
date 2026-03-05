'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from 'recharts';
import { 
  LogOut, ArrowLeft, TrendingUp, BarChart3, Activity, RefreshCw, 
  AlertCircle, PieChart, Users, Search, Plus, X
} from 'lucide-react';
import { getSymptomCategoryStats, SYMPTOM_CATEGORIES_SIMPLE } from '@/lib/health-constants';

// 健康要素配置
const HEALTH_ELEMENTS = [
  { key: 'qiAndBlood', label: '气血', color: '#ef4444' },
  { key: 'circulation', label: '循环', color: '#3b82f6' },
  { key: 'toxins', label: '毒素', color: '#f59e0b' },
  { key: 'bloodLipids', label: '血脂', color: '#f97316' },
  { key: 'coldness', label: '寒凉', color: '#06b6d4' },
  { key: 'immunity', label: '免疫', color: '#10b981' },
  { key: 'emotions', label: '情绪', color: '#8b5cf6' },
];

// 用户对比颜色
const USER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// 简化分类配置
const SYMPTOM_CATEGORIES = Object.entries(SYMPTOM_CATEGORIES_SIMPLE).map(([key, config]) => ({
  key,
  label: key,
  color: config.color,
}));

interface UserData {
  user: {
    id: string;
    name: string | null;
    phone: string | null;
    age: number | null;
  };
  healthAnalysis: any[];
  symptomChecks: any[];
}

export default function ChartsComparePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userDataMap, setUserDataMap] = useState<Map<string, UserData>>(new Map());
  const [activeTab, setActiveTab] = useState('trend');

  // 客户端挂载后才执行
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkAuth();
      fetchUsers();
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted && selectedUsers.length > 0) {
      fetchSelectedUsersData();
    }
  }, [mounted, selectedUsers]);

  const checkAuth = async () => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('admin');
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('认证验证失败:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users?limit=200', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        // 默认选择第一个用户
        if (data.data.length > 0 && selectedUsers.length === 0) {
          setSelectedUsers([data.data[0].user.id]);
        }
      } else if (data.code === 'UNAUTHORIZED' || response.status === 401) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('admin');
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedUsersData = async () => {
    setLoading(true);
    const newDataMap = new Map(userDataMap);
    
    try {
      for (const userId of selectedUsers) {
        if (!newDataMap.has(userId)) {
          const response = await fetch(`/api/admin/user-detail?userId=${userId}`, {
            credentials: 'include',
          });
          const data = await response.json();
          if (data.success) {
            newDataMap.set(userId, data.data);
          }
        }
      }
      setUserDataMap(newDataMap);
    } catch (error) {
      console.error('获取用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else if (prev.length < 8) {
        return [...prev, userId];
      }
      return prev;
    });
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.user.id === userId);
    return user?.user?.name || user?.user?.phone || '未知用户';
  };

  // 生成趋势对比数据
  const generateTrendCompareData = () => {
    const allDates = new Set<string>();
    const userDataByDate: Record<string, any> = {};

    selectedUsers.forEach(userId => {
      const userData = userDataMap.get(userId);
      if (userData?.healthAnalysis) {
        userData.healthAnalysis.forEach((item: any) => {
          const date = new Date(item.analyzedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
          allDates.add(date);
          if (!userDataByDate[date]) {
            userDataByDate[date] = { date };
          }
          userDataByDate[date][`user_${userId}`] = item.overallHealth ?? 0;
        });
      }
    });

    return Object.values(userDataByDate).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // 生成雷达图对比数据
  const generateRadarCompareData = () => {
    if (selectedUsers.length === 0) return [];

    // 获取每个用户最新的健康分析
    const latestScores: Record<string, any> = {};
    
    HEALTH_ELEMENTS.forEach(elem => {
      latestScores[elem.key] = { element: elem.label, fullMark: 100 };
      selectedUsers.forEach(userId => {
        const userData = userDataMap.get(userId);
        if (userData?.healthAnalysis && userData.healthAnalysis.length > 0) {
          const latest = userData.healthAnalysis[0];
          latestScores[elem.key][`user_${userId}`] = latest[elem.key] ?? 0;
        } else {
          latestScores[elem.key][`user_${userId}`] = 0;
        }
      });
    });

    return Object.values(latestScores);
  };

  const filteredUsers = users.filter(u => {
    if (!searchQuery) return true;
    const name = u.user?.name || '';
    const phone = u.user?.phone || '';
    return name.includes(searchQuery) || phone.includes(searchQuery);
  });

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 服务端渲染时显示加载状态 */}
      {!mounted && (
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}
      
      {mounted && (
        <>
      {/* 顶部导航 */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
              <div className="w-px h-6 bg-gray-200" />
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">多用户图表对比</h1>
                <p className="text-xs text-gray-500">选择多个用户进行健康数据对比分析</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchSelectedUsersData} disabled={loading || selectedUsers.length === 0}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧用户选择面板 */}
          <Card className="lg:col-span-1 border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-purple-500" />
                选择对比用户
              </CardTitle>
              <CardDescription>
                最多选择 8 个用户进行对比
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 搜索框 */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索用户..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* 已选择的用户 */}
              {selectedUsers.length > 0 && (
                <div className="mb-4">
                  <Label className="text-sm text-gray-600 mb-2 block">已选择 ({selectedUsers.length}/8)</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((userId, index) => (
                      <Badge 
                        key={userId} 
                        className="flex items-center gap-1"
                        style={{ backgroundColor: USER_COLORS[index % USER_COLORS.length] + '20', color: USER_COLORS[index % USER_COLORS.length], borderColor: USER_COLORS[index % USER_COLORS.length] }}
                      >
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: USER_COLORS[index % USER_COLORS.length] }}
                        />
                        {getUserName(userId)}
                        <button onClick={() => removeUser(userId)} className="ml-1 hover:bg-black/10 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 用户列表 */}
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {loading && users.length === 0 ? (
                  <div className="flex items-center justify-center py-10">
                    <RefreshCw className="h-6 w-6 animate-spin text-purple-500" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    暂无用户数据
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUsers.includes(u.user.id);
                    const selectedIndex = selectedUsers.indexOf(u.user.id);
                    return (
                      <div
                        key={u.user.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-purple-300 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                        }`}
                        onClick={() => toggleUserSelection(u.user.id)}
                      >
                        <div 
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <span 
                              className="w-2 h-2 rounded-full bg-white"
                            />
                          )}
                        </div>
                        {isSelected && (
                          <span 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: USER_COLORS[selectedIndex % USER_COLORS.length] }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{u.user.name || '未命名'}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {u.user.phone || '无手机号'} · {u.user.age || '-'}岁
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* 右侧图表区域 */}
          <div className="lg:col-span-3">
            {selectedUsers.length === 0 ? (
              <Card className="border-gray-200">
                <CardContent className="py-20 text-center">
                  <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">请从左侧选择用户进行对比</p>
                  <p className="text-gray-400 text-sm mt-2">最多可选择 8 个用户</p>
                </CardContent>
              </Card>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="trend" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    健康评分趋势对比
                  </TabsTrigger>
                  <TabsTrigger value="radar" className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    维度评分对比
                  </TabsTrigger>
                  <TabsTrigger value="symptoms" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    症状分类对比
                  </TabsTrigger>
                </TabsList>

                {/* 健康评分趋势对比 */}
                <TabsContent value="trend">
                  <Card className="border-blue-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        综合健康评分趋势对比
                      </CardTitle>
                      <CardDescription>
                        对比 {selectedUsers.length} 个用户的综合健康评分变化趋势
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="h-[400px] flex items-center justify-center">
                          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      ) : (
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={generateTrendCompareData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Legend />
                              {selectedUsers.map((userId, index) => (
                                <Line
                                  key={userId}
                                  type="monotone"
                                  dataKey={`user_${userId}`}
                                  name={getUserName(userId)}
                                  stroke={USER_COLORS[index % USER_COLORS.length]}
                                  strokeWidth={2}
                                  dot={{ fill: USER_COLORS[index % USER_COLORS.length], strokeWidth: 2, r: 4 }}
                                />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 维度评分对比 */}
                <TabsContent value="radar">
                  <Card className="border-purple-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-purple-500" />
                        七大健康维度评分对比
                      </CardTitle>
                      <CardDescription>
                        对比 {selectedUsers.length} 个用户的最新健康维度评分
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="h-[400px] flex items-center justify-center">
                          <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
                        </div>
                      ) : (
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={generateRadarCompareData()}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="element" />
                              <PolarRadiusAxis domain={[0, 100]} />
                              {selectedUsers.map((userId, index) => (
                                <Radar
                                  key={userId}
                                  name={getUserName(userId)}
                                  dataKey={`user_${userId}`}
                                  stroke={USER_COLORS[index % USER_COLORS.length]}
                                  fill={USER_COLORS[index % USER_COLORS.length]}
                                  fillOpacity={0.1}
                                />
                              ))}
                              <Legend />
                              <Tooltip />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 维度评分表格 */}
                  <Card className="mt-6 border-green-100">
                    <CardHeader>
                      <CardTitle className="text-base">评分详情对比</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-3">用户</th>
                              {HEALTH_ELEMENTS.map(elem => (
                                <th key={elem.key} className="text-center py-2 px-3">{elem.label}</th>
                              ))}
                              <th className="text-center py-2 px-3 font-bold">综合</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUsers.map((userId, index) => {
                              const userData = userDataMap.get(userId);
                              const latest = userData?.healthAnalysis?.[0];
                              const avgScore = latest ? 
                                Math.round((
                                  (latest.qiAndBlood || 0) +
                                  (latest.circulation || 0) +
                                  (latest.toxins || 0) +
                                  (latest.bloodLipids || 0) +
                                  (latest.coldness || 0) +
                                  (latest.immunity || 0) +
                                  (latest.emotions || 0)
                                ) / 7) : 0;
                              
                              return (
                                <tr key={userId} className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-3">
                                    <div className="flex items-center gap-2">
                                      <span 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: USER_COLORS[index % USER_COLORS.length] }}
                                      />
                                      {getUserName(userId)}
                                    </div>
                                  </td>
                                  {HEALTH_ELEMENTS.map(elem => (
                                    <td key={elem.key} className="text-center py-2 px-3">
                                      <Badge variant={latest?.[elem.key] >= 60 ? 'default' : latest?.[elem.key] >= 40 ? 'secondary' : 'destructive'}>
                                        {latest?.[elem.key] ?? '-'}
                                      </Badge>
                                    </td>
                                  ))}
                                  <td className="text-center py-2 px-3 font-bold">
                                    <Badge 
                                      className={avgScore >= 60 ? 'bg-green-500' : avgScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}
                                    >
                                      {latest?.overallHealth ?? avgScore}
                                    </Badge>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 症状分类对比 */}
                <TabsContent value="symptoms">
                  <Card className="border-orange-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-orange-500" />
                        症状分类对比
                      </CardTitle>
                      <CardDescription>
                        对比 {selectedUsers.length} 个用户的症状分布情况
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="h-[400px] flex items-center justify-center">
                          <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* 症状总数对比 */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {selectedUsers.map((userId, index) => {
                              const userData = userDataMap.get(userId);
                              const totalSymptoms = userData?.symptomChecks?.reduce(
                                (sum: number, check: any) => sum + (check.checkedSymptoms?.length || 0),
                                0
                              ) || 0;
                              
                              return (
                                <Card key={userId} className="border-gray-200">
                                  <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: USER_COLORS[index % USER_COLORS.length] }}
                                      />
                                      <span className="font-medium truncate">{getUserName(userId)}</span>
                                    </div>
                                    <p className="text-2xl font-bold" style={{ color: USER_COLORS[index % USER_COLORS.length] }}>
                                      {totalSymptoms}
                                    </p>
                                    <p className="text-xs text-gray-500">症状总数</p>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
