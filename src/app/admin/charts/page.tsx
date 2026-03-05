'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';
import { 
  LogOut, ArrowLeft, TrendingUp, BarChart3, Activity, RefreshCw, 
  AlertCircle, PieChart, Users, Search, X, User, Calendar, 
  ChevronRight, Trophy, AlertTriangle, TrendingDown, Minus
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

// 单人多次对比颜色
const RECORD_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#fbbf24', '#fcd34d', '#a3e635'];

interface UserData {
  user: {
    id: string;
    name: string | null;
    phone: string | null;
    age: number | null;
    gender: string | null;
  };
  healthAnalysis: any[];
  symptomChecks: any[];
}

interface UserListItem {
  user: {
    id: string;
    name: string | null;
    phone: string | null;
    age: number | null;
    gender: string | null;
  };
  healthAnalysis?: any[];
  symptomChecks?: any[];
}

export default function ChartsComparePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // 模式切换：multi-多用户对比，single-单人多次对比
  const [compareMode, setCompareMode] = useState<'multi' | 'single'>('multi');
  
  // 所有用户列表
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 多用户对比模式
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userDataMap, setUserDataMap] = useState<Map<string, UserData>>(new Map());
  
  // 单人多次对比模式
  const [selectedSingleUser, setSelectedSingleUser] = useState<string | null>(null);
  const [singleUserData, setSingleUserData] = useState<UserData | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]); // 记录ID列表
  
  // 当前Tab
  const [activeTab, setActiveTab] = useState('trend');

  // 客户端挂载后才执行
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // 先检查认证，认证通过后再加载用户数据
      const init = async () => {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        if (!isLoggedIn) {
          router.push('/admin/login');
          return;
        }
        
        try {
          // 验证认证状态
          const verifyResponse = await fetch('/api/admin/verify', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (!verifyResponse.ok) {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('admin');
            router.push('/admin/login');
            return;
          }
          
          // 认证通过，加载用户数据
          await fetchUsers();
        } catch (error) {
          console.error('初始化失败:', error);
        }
      };
      
      init();
    }
  }, [mounted]);

  // 多用户模式：加载选中用户数据
  useEffect(() => {
    if (mounted && compareMode === 'multi' && selectedUsers.length > 0) {
      fetchSelectedUsersData();
    }
  }, [mounted, selectedUsers, compareMode]);

  // 单人模式：加载选中用户数据
  useEffect(() => {
    if (mounted && compareMode === 'single' && selectedSingleUser) {
      fetchSingleUserData();
    }
  }, [mounted, selectedSingleUser, compareMode]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users?limit=500', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      } else if (data.code === 'UNAUTHORIZED' || response.status === 401) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('admin');
        router.push('/admin/login');
      } else {
        // 其他错误，显示错误信息
        console.error('获取用户列表失败:', data.error || '未知错误');
        setUsers([]);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // 多用户模式：并行获取用户数据
  const fetchSelectedUsersData = async () => {
    setLoading(true);
    const newDataMap = new Map(userDataMap);
    const usersToFetch = selectedUsers.filter(id => !newDataMap.has(id));
    
    try {
      // 并行请求所有未加载的用户数据
      const promises = usersToFetch.map(userId => 
        fetch(`/api/admin/user-detail?userId=${userId}`, {
          credentials: 'include',
        }).then(res => res.json())
          .then(data => ({ userId, data }))
      );
      
      const results = await Promise.all(promises);
      
      results.forEach(({ userId, data }) => {
        if (data.success) {
          newDataMap.set(userId, data.data);
        }
      });
      
      setUserDataMap(newDataMap);
    } catch (error) {
      console.error('获取用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 单人模式：获取单个用户数据
  const fetchSingleUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/user-detail?userId=${selectedSingleUser}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setSingleUserData(data.data);
        // 默认选择最近5条记录
        if (data.data?.healthAnalysis?.length > 0) {
          const recentIds = data.data.healthAnalysis
            .slice(0, Math.min(5, data.data.healthAnalysis.length))
            .map((a: any) => a.id);
          setSelectedRecords(recentIds);
        }
      }
    } catch (error) {
      console.error('获取用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 多用户模式：切换用户选择
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

  // 单人模式：选择用户
  const selectSingleUser = (userId: string) => {
    setSelectedSingleUser(userId);
    setSelectedRecords([]);
    setSingleUserData(null);
  };

  // 单人模式：切换记录选择
  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecords(prev => {
      if (prev.includes(recordId)) {
        return prev.filter(id => id !== recordId);
      } else if (prev.length < 10) {
        return [...prev, recordId];
      }
      return prev;
    });
  };

  // 快速选择记录
  const quickSelectRecords = (type: 'all' | 'recent3' | 'recent5' | 'recent10') => {
    if (!singleUserData?.healthAnalysis) return;
    
    const records = singleUserData.healthAnalysis;
    switch (type) {
      case 'all':
        setSelectedRecords(records.map((a: any) => a.id).slice(0, 10));
        break;
      case 'recent3':
        setSelectedRecords(records.slice(0, 3).map((a: any) => a.id));
        break;
      case 'recent5':
        setSelectedRecords(records.slice(0, 5).map((a: any) => a.id));
        break;
      case 'recent10':
        setSelectedRecords(records.slice(0, 10).map((a: any) => a.id));
        break;
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.user.id === userId);
    return user?.user?.name || user?.user?.phone || '未知用户';
  };

  const getUserInfo = (userId: string) => {
    return users.find(u => u.user.id === userId)?.user;
  };

  // 过滤用户列表
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (!searchQuery) return true;
      const name = u.user?.name || '';
      const phone = u.user?.phone || '';
      return name.includes(searchQuery) || phone.includes(searchQuery);
    });
  }, [users, searchQuery]);

  // ========== 多用户模式：生成图表数据 ==========
  
  const multiTrendData = useMemo(() => {
    const userDataByDate: Record<string, any> = {};

    selectedUsers.forEach(userId => {
      const userData = userDataMap.get(userId);
      if (userData?.healthAnalysis) {
        userData.healthAnalysis.forEach((item: any) => {
          const date = new Date(item.analyzedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
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
  }, [selectedUsers, userDataMap]);

  const multiRadarData = useMemo(() => {
    if (selectedUsers.length === 0) return [];

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
  }, [selectedUsers, userDataMap]);

  // 多用户差异分析
  const multiDifferenceAnalysis = useMemo(() => {
    if (selectedUsers.length < 2) return null;

    const scores: { userId: string; name: string; score: number }[] = [];
    
    selectedUsers.forEach(userId => {
      const userData = userDataMap.get(userId);
      const latest = userData?.healthAnalysis?.[0];
      const score = latest?.overallHealth ?? 0;
      scores.push({
        userId,
        name: getUserName(userId),
        score
      });
    });

    scores.sort((a, b) => b.score - a.score);

    const maxScore = scores[0];
    const minScore = scores[scores.length - 1];
    const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    const gap = maxScore.score - minScore.score;

    return {
      ranking: scores,
      maxScore,
      minScore,
      avgScore: Math.round(avgScore * 10) / 10,
      gap
    };
  }, [selectedUsers, userDataMap]);

  // ========== 单人多次模式：生成图表数据 ==========

  const singleTrendData = useMemo(() => {
    if (!singleUserData?.healthAnalysis || selectedRecords.length === 0) return [];

    const records = singleUserData.healthAnalysis
      .filter((a: any) => selectedRecords.includes(a.id))
      .sort((a: any, b: any) => new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime());

    return records.map((item: any, index: number) => ({
      date: new Date(item.analyzedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      score: item.overallHealth ?? 0,
      recordId: item.id,
      index: index + 1
    }));
  }, [singleUserData, selectedRecords]);

  const singleRadarData = useMemo(() => {
    if (!singleUserData?.healthAnalysis || selectedRecords.length === 0) return [];

    const selectedAnalyses = singleUserData.healthAnalysis
      .filter((a: any) => selectedRecords.includes(a.id));

    const data: Record<string, any> = {};
    
    HEALTH_ELEMENTS.forEach(elem => {
      data[elem.key] = { element: elem.label, fullMark: 100 };
      selectedAnalyses.forEach((analysis: any, index: number) => {
        data[elem.key][`record_${index}`] = analysis[elem.key] ?? 0;
      });
    });

    return Object.values(data);
  }, [singleUserData, selectedRecords]);

  // 单人改善分析
  const singleImprovementAnalysis = useMemo(() => {
    if (!singleUserData?.healthAnalysis || selectedRecords.length < 2) return null;

    const records = singleUserData.healthAnalysis
      .filter((a: any) => selectedRecords.includes(a.id))
      .sort((a: any, b: any) => new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime());

    if (records.length < 2) return null;

    const firstRecord = records[0];
    const lastRecord = records[records.length - 1];

    // 综合分改善
    const scoreChange = (lastRecord.overallHealth ?? 0) - (firstRecord.overallHealth ?? 0);
    const scoreChangePercent = firstRecord.overallHealth 
      ? Math.round((scoreChange / firstRecord.overallHealth) * 100) 
      : 0;

    // 各维度改善
    const elementChanges = HEALTH_ELEMENTS.map(elem => {
      const firstValue = firstRecord[elem.key] ?? 0;
      const lastValue = lastRecord[elem.key] ?? 0;
      const change = lastValue - firstValue;
      const changePercent = firstValue ? Math.round((change / firstValue) * 100) : 0;
      
      return {
        ...elem,
        firstValue,
        lastValue,
        change,
        changePercent
      };
    }).sort((a, b) => b.change - a.change);

    // 症状变化
    const firstSymptomIds = new Set(firstRecord.symptomIds || []);
    const lastSymptomIds = new Set(lastRecord.symptomIds || []);
    
    const disappearedSymptoms = [...firstSymptomIds].filter(id => !lastSymptomIds.has(id));
    const newSymptoms = [...lastSymptomIds].filter(id => !firstSymptomIds.has(id));

    return {
      firstRecord,
      lastRecord,
      scoreChange,
      scoreChangePercent,
      elementChanges,
      symptomChange: {
        disappeared: disappearedSymptoms.length,
        new: newSymptoms.length,
        firstCount: firstSymptomIds.size,
        lastCount: lastSymptomIds.size
      },
      daysBetween: Math.ceil(
        (new Date(lastRecord.analyzedAt).getTime() - new Date(firstRecord.analyzedAt).getTime()) 
        / (1000 * 60 * 60 * 24)
      )
    };
  }, [singleUserData, selectedRecords]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  const handleRefresh = () => {
    if (compareMode === 'multi') {
      fetchSelectedUsersData();
    } else {
      fetchSingleUserData();
    }
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
                    <h1 className="text-lg font-bold text-gray-900">图表对比中心</h1>
                    <p className="text-xs text-gray-500">健康数据多维度对比分析</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
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
            {/* 模式切换 */}
            <Card className="mb-6 border-purple-100">
              <CardContent className="pt-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={compareMode === 'multi' ? 'default' : 'outline'}
                    className={`w-48 h-16 flex-col ${compareMode === 'multi' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : ''}`}
                    onClick={() => setCompareMode('multi')}
                  >
                    <Users className="h-5 w-5 mb-1" />
                    <span className="font-medium">多用户对比</span>
                    <span className="text-xs opacity-80">对比不同人的健康数据</span>
                  </Button>
                  <Button
                    variant={compareMode === 'single' ? 'default' : 'outline'}
                    className={`w-48 h-16 flex-col ${compareMode === 'single' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : ''}`}
                    onClick={() => setCompareMode('single')}
                  >
                    <TrendingUp className="h-5 w-5 mb-1" />
                    <span className="font-medium">单人多次对比</span>
                    <span className="text-xs opacity-80">追踪同一人的健康变化</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 左侧选择面板 */}
              <Card className="lg:col-span-1 border-purple-100">
                {compareMode === 'multi' ? (
                  // 多用户模式选择面板
                  <>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Users className="h-5 w-5 text-purple-500" />
                        选择对比用户
                      </CardTitle>
                      <CardDescription>
                        从所有用户中选择，最多8个
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
                            // 生成用户区分标识：手机号后4位 + ID后4位
                            const phoneSuffix = u.user.phone ? u.user.phone.slice(-4) : '无手机';
                            const idSuffix = u.user.id.slice(-4);
                            const recordCount = u.healthAnalysis?.length || 0;
                            
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
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                                  }`}
                                >
                                  {isSelected && (
                                    <span className="w-2 h-2 rounded-full bg-white" />
                                  )}
                                </div>
                                {isSelected && (
                                  <span 
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: USER_COLORS[selectedIndex % USER_COLORS.length] }}
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium truncate">{u.user.name || '未命名'}</p>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                      {phoneSuffix}·{idSuffix}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">
                                    {u.user.age || '-'}岁{recordCount > 0 ? ` · ${recordCount}次检测` : ''}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </CardContent>
                  </>
                ) : (
                  // 单人多次模式选择面板
                  <>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-5 w-5 text-purple-500" />
                        {selectedSingleUser ? '选择检测记录' : '选择用户'}
                      </CardTitle>
                      <CardDescription>
                        {selectedSingleUser 
                          ? `选择该用户的检测记录进行对比` 
                          : '从所有用户中选择一个'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!selectedSingleUser ? (
                        // 选择用户
                        <>
                          <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="搜索用户..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9"
                            />
                          </div>
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
                                // 生成用户区分标识：手机号后4位 + ID后4位
                                const phoneSuffix = u.user.phone ? u.user.phone.slice(-4) : '无手机';
                                const idSuffix = u.user.id.slice(-4);
                                const recordCount = u.healthAnalysis?.length || 0;
                                const latestAnalysis = u.healthAnalysis?.[0];
                                const latestDate = latestAnalysis?.analyzedAt 
                                  ? new Date(latestAnalysis.analyzedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
                                  : null;
                                
                                return (
                                  <div
                                    key={u.user.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-200 hover:bg-gray-50 cursor-pointer transition-all"
                                    onClick={() => selectSingleUser(u.user.id)}
                                  >
                                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium truncate">{u.user.name || '未命名'}</p>
                                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                          {phoneSuffix}·{idSuffix}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{u.user.age || '-'}岁</span>
                                        {recordCount > 0 && (
                                          <>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-purple-600 font-medium">{recordCount}次检测</span>
                                          </>
                                        )}
                                        {latestDate && (
                                          <>
                                            <span className="text-gray-300">|</span>
                                            <span>最近: {latestDate}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </>
                      ) : (
                        // 选择记录
                        <>
                          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{getUserName(selectedSingleUser)}</p>
                                  {(() => {
                                    const user = users.find(u => u.user.id === selectedSingleUser)?.user;
                                    if (user) {
                                      const phoneSuffix = user.phone ? user.phone.slice(-4) : '无手机';
                                      const idSuffix = user.id.slice(-4);
                                      return (
                                        <span className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded">
                                          {phoneSuffix}·{idSuffix}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  共 {singleUserData?.healthAnalysis?.length || 0} 条检测记录 · 请选择要对比的记录
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedSingleUser(null);
                                  setSingleUserData(null);
                                  setSelectedRecords([]);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* 快速选择 */}
                          <div className="mb-4 flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => quickSelectRecords('recent3')}>最近3次</Button>
                            <Button variant="outline" size="sm" onClick={() => quickSelectRecords('recent5')}>最近5次</Button>
                            <Button variant="outline" size="sm" onClick={() => quickSelectRecords('recent10')}>最近10次</Button>
                          </div>

                          {/* 已选记录 */}
                          {selectedRecords.length > 0 && (
                            <div className="mb-4">
                              <Label className="text-sm text-gray-600 mb-2 block">已选择 ({selectedRecords.length}/10)</Label>
                            </div>
                          )}

                          {/* 记录列表 */}
                          <div className="max-h-[350px] overflow-y-auto space-y-2">
                            {loading ? (
                              <div className="flex items-center justify-center py-10">
                                <RefreshCw className="h-6 w-6 animate-spin text-purple-500" />
                              </div>
                            ) : !singleUserData?.healthAnalysis?.length ? (
                              <div className="text-center py-10 text-gray-500">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                暂无检测记录
                              </div>
                            ) : (
                              singleUserData.healthAnalysis.map((analysis: any, index: number) => {
                                const isSelected = selectedRecords.includes(analysis.id);
                                const selectedIndex = selectedRecords.indexOf(analysis.id);
                                const healthScore = analysis.overallHealth ?? 0;
                                const scoreColor = healthScore >= 80 ? 'text-green-600' : healthScore >= 60 ? 'text-yellow-600' : healthScore >= 40 ? 'text-orange-600' : 'text-red-600';
                                const analysisDate = new Date(analysis.analyzedAt);
                                const dateStr = analysisDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
                                const timeStr = analysisDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                                
                                return (
                                  <div
                                    key={analysis.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                      isSelected 
                                        ? 'border-purple-300 bg-purple-50' 
                                        : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                                    }`}
                                    onClick={() => toggleRecordSelection(analysis.id)}
                                  >
                                    <div 
                                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                        isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                                      }`}
                                    >
                                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    {isSelected && (
                                      <span 
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: RECORD_COLORS[selectedIndex % RECORD_COLORS.length] }}
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Calendar className="h-3 w-3 text-gray-400" />
                                        <p className="text-sm font-medium">
                                          {dateStr} {timeStr}
                                        </p>
                                        {index === 0 && (
                                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">最新</Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className={`text-sm font-semibold ${scoreColor}`}>
                                          健康分: {healthScore}
                                        </span>
                                        {/* 显示主要健康要素 */}
                                        <span className="text-xs text-gray-400">
                                          气血{analysis.qiAndBlood ?? '-'} 循环{analysis.circulation ?? '-'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </>
                )}
              </Card>

              {/* 右侧图表区域 */}
              <div className="lg:col-span-3">
                {compareMode === 'multi' ? (
                  // ========== 多用户对比图表 ==========
                  selectedUsers.length === 0 ? (
                    <Card className="border-gray-200">
                      <CardContent className="py-20 text-center">
                        <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">请从左侧选择用户进行对比</p>
                        <p className="text-gray-400 text-sm mt-2">最多可选择 8 个用户</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="trend" className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          趋势对比
                        </TabsTrigger>
                        <TabsTrigger value="radar" className="flex items-center gap-2">
                          <PieChart className="h-4 w-4" />
                          维度对比
                        </TabsTrigger>
                        <TabsTrigger value="symptoms" className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          症状对比
                        </TabsTrigger>
                        <TabsTrigger value="difference" className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          差异分析
                        </TabsTrigger>
                      </TabsList>

                      {/* 趋势对比 */}
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
                                  <LineChart data={multiTrendData}>
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

                      {/* 维度对比 */}
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
                                  <RadarChart data={multiRadarData}>
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
                      </TabsContent>

                      {/* 症状对比 */}
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
                                {/* 症状总数对比卡片 */}
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
                                            <span className="font-medium truncate text-sm">{getUserName(userId)}</span>
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

                      {/* 差异分析 */}
                      <TabsContent value="difference">
                        {multiDifferenceAnalysis ? (
                          <div className="space-y-6">
                            {/* 统计概览 */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Card className="border-green-100">
                                <CardContent className="pt-4">
                                  <p className="text-sm text-gray-500">最高分</p>
                                  <p className="text-2xl font-bold text-green-600">{multiDifferenceAnalysis.maxScore.score}</p>
                                  <p className="text-xs text-gray-500">{multiDifferenceAnalysis.maxScore.name}</p>
                                </CardContent>
                              </Card>
                              <Card className="border-red-100">
                                <CardContent className="pt-4">
                                  <p className="text-sm text-gray-500">最低分</p>
                                  <p className="text-2xl font-bold text-red-600">{multiDifferenceAnalysis.minScore.score}</p>
                                  <p className="text-xs text-gray-500">{multiDifferenceAnalysis.minScore.name}</p>
                                </CardContent>
                              </Card>
                              <Card className="border-blue-100">
                                <CardContent className="pt-4">
                                  <p className="text-sm text-gray-500">平均分</p>
                                  <p className="text-2xl font-bold text-blue-600">{multiDifferenceAnalysis.avgScore}</p>
                                </CardContent>
                              </Card>
                              <Card className="border-orange-100">
                                <CardContent className="pt-4">
                                  <p className="text-sm text-gray-500">分差</p>
                                  <p className="text-2xl font-bold text-orange-600">{multiDifferenceAnalysis.gap}</p>
                                </CardContent>
                              </Card>
                            </div>

                            {/* 排名对比 */}
                            <Card className="border-purple-100">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Trophy className="h-5 w-5 text-purple-500" />
                                  健康分排名
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {multiDifferenceAnalysis.ranking.map((item, index) => (
                                    <div key={item.userId} className="flex items-center gap-4">
                                      <div className="w-8 text-center">
                                        {index === 0 && <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />}
                                        {index === 1 && <Trophy className="h-5 w-5 text-gray-400 mx-auto" />}
                                        {index === 2 && <Trophy className="h-5 w-5 text-amber-600 mx-auto" />}
                                        {index > 2 && <span className="text-gray-400">{index + 1}</span>}
                                      </div>
                                      <span 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: USER_COLORS[selectedUsers.indexOf(item.userId) % USER_COLORS.length] }}
                                      />
                                      <span className="flex-1 font-medium">{item.name}</span>
                                      <div className="w-48 bg-gray-200 rounded-full h-4">
                                        <div 
                                          className="h-4 rounded-full"
                                          style={{ 
                                            width: `${item.score}%`,
                                            backgroundColor: USER_COLORS[selectedUsers.indexOf(item.userId) % USER_COLORS.length]
                                          }}
                                        />
                                      </div>
                                      <span className="w-12 text-right font-bold">{item.score}分</span>
                                      {index > 0 && (
                                        <span className="text-xs text-red-500">
                                          ↓{multiDifferenceAnalysis.ranking[0].score - item.score}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ) : (
                          <Card className="border-gray-200">
                            <CardContent className="py-10 text-center">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-gray-500">请至少选择2个用户进行差异分析</p>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>
                    </Tabs>
                  )
                ) : (
                  // ========== 单人多次对比图表 ==========
                  !selectedSingleUser ? (
                    <Card className="border-gray-200">
                      <CardContent className="py-20 text-center">
                        <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">请从左侧选择一个用户</p>
                        <p className="text-gray-400 text-sm mt-2">追踪该用户的健康变化趋势</p>
                        <div className="mt-4 text-xs text-gray-400 bg-gray-50 rounded-lg p-3 inline-block">
                          <p>💡 提示：同名用户可通过"手机后4位·ID后4位"区分</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : selectedRecords.length < 2 ? (
                    <Card className="border-gray-200">
                      <CardContent className="py-20 text-center">
                        <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">请至少选择2条检测记录</p>
                        <p className="text-gray-400 text-sm mt-2">对比不同时间的健康数据变化</p>
                        <div className="mt-4 flex justify-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            // 获取当前用户信息，设置到selectedSingleUser
                            if (singleUserData?.healthAnalysis?.length) {
                              setSelectedRecords(singleUserData.healthAnalysis.slice(0, 2).map((a: any) => a.id));
                            }
                          }}>
                            快速选择最近2次
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="trend" className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          健康趋势
                        </TabsTrigger>
                        <TabsTrigger value="radar" className="flex items-center gap-2">
                          <PieChart className="h-4 w-4" />
                          维度变化
                        </TabsTrigger>
                        <TabsTrigger value="symptoms" className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          症状变化
                        </TabsTrigger>
                        <TabsTrigger value="improvement" className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          改善分析
                        </TabsTrigger>
                      </TabsList>

                      {/* 健康趋势 */}
                      <TabsContent value="trend">
                        <Card className="border-blue-100">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-blue-500" />
                              健康分变化趋势
                            </CardTitle>
                            <CardDescription>
                              {getUserName(selectedSingleUser)} 的 {selectedRecords.length} 次检测健康分变化
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
                                  <LineChart data={singleTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip 
                                      formatter={(value: any) => [`${value}分`, '健康分']}
                                      labelFormatter={(label) => `日期: ${label}`}
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="score"
                                      name="健康分"
                                      stroke="#3b82f6"
                                      strokeWidth={3}
                                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* 维度变化 */}
                      <TabsContent value="radar">
                        <Card className="border-purple-100">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <PieChart className="h-5 w-5 text-purple-500" />
                              各维度变化对比
                            </CardTitle>
                            <CardDescription>
                              {selectedRecords.length} 次检测的七大健康维度对比
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
                                  <RadarChart data={singleRadarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="element" />
                                    <PolarRadiusAxis domain={[0, 100]} />
                                    {selectedRecords.map((_, index) => (
                                      <Radar
                                        key={index}
                                        name={`第${index + 1}次`}
                                        dataKey={`record_${index}`}
                                        stroke={RECORD_COLORS[index % RECORD_COLORS.length]}
                                        fill={RECORD_COLORS[index % RECORD_COLORS.length]}
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
                      </TabsContent>

                      {/* 症状变化 */}
                      <TabsContent value="symptoms">
                        <Card className="border-orange-100">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5 text-orange-500" />
                              症状变化追踪
                            </CardTitle>
                            <CardDescription>
                              各次检测的症状数量变化
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {loading ? (
                              <div className="h-[400px] flex items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
                              </div>
                            ) : singleImprovementAnalysis ? (
                              <div className="space-y-6">
                                {/* 症状数量变化 */}
                                <div className="grid grid-cols-3 gap-4">
                                  <Card className="border-blue-100">
                                    <CardContent className="pt-4 text-center">
                                      <p className="text-sm text-gray-500">首次检测</p>
                                      <p className="text-3xl font-bold text-blue-600">
                                        {singleImprovementAnalysis.symptomChange.firstCount}
                                      </p>
                                      <p className="text-xs text-gray-500">个症状</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="border-green-100">
                                    <CardContent className="pt-4 text-center">
                                      <p className="text-sm text-gray-500">最新检测</p>
                                      <p className="text-3xl font-bold text-green-600">
                                        {singleImprovementAnalysis.symptomChange.lastCount}
                                      </p>
                                      <p className="text-xs text-gray-500">个症状</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="border-purple-100">
                                    <CardContent className="pt-4 text-center">
                                      <p className="text-sm text-gray-500">变化</p>
                                      <p className={`text-3xl font-bold ${
                                        singleImprovementAnalysis.symptomChange.lastCount <= singleImprovementAnalysis.symptomChange.firstCount 
                                          ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {singleImprovementAnalysis.symptomChange.lastCount - singleImprovementAnalysis.symptomChange.firstCount > 0 ? '+' : ''}
                                        {singleImprovementAnalysis.symptomChange.lastCount - singleImprovementAnalysis.symptomChange.firstCount}
                                      </p>
                                      <p className="text-xs text-gray-500">个症状</p>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-10 text-gray-500">
                                暂无足够数据进行对比
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* 改善分析 */}
                      <TabsContent value="improvement">
                        {singleImprovementAnalysis ? (
                          <div className="space-y-6">
                            {/* 总体改善情况 */}
                            <Card className="border-green-100">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Trophy className="h-5 w-5 text-green-500" />
                                  总体改善情况
                                </CardTitle>
                                <CardDescription>
                                  分析周期: {singleImprovementAnalysis.daysBetween} 天
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center">
                                    <p className="text-sm text-gray-500">首次健康分</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                      {singleImprovementAnalysis.firstRecord.overallHealth ?? '-'}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-gray-500">最新健康分</p>
                                    <p className="text-2xl font-bold text-green-600">
                                      {singleImprovementAnalysis.lastRecord.overallHealth ?? '-'}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-gray-500">提升分数</p>
                                    <p className={`text-2xl font-bold ${singleImprovementAnalysis.scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {singleImprovementAnalysis.scoreChange >= 0 ? '+' : ''}{singleImprovementAnalysis.scoreChange}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-gray-500">提升比例</p>
                                    <p className={`text-2xl font-bold ${singleImprovementAnalysis.scoreChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {singleImprovementAnalysis.scoreChangePercent >= 0 ? '+' : ''}{singleImprovementAnalysis.scoreChangePercent}%
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* 各维度改善详情 */}
                            <Card className="border-purple-100">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Activity className="h-5 w-5 text-purple-500" />
                                  各维度改善详情
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 px-3">维度</th>
                                        <th className="text-center py-2 px-3">首次</th>
                                        <th className="text-center py-2 px-3">最新</th>
                                        <th className="text-center py-2 px-3">变化</th>
                                        <th className="text-center py-2 px-3">改善率</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {singleImprovementAnalysis.elementChanges.map((elem) => (
                                        <tr key={elem.key} className="border-b hover:bg-gray-50">
                                          <td className="py-2 px-3">
                                            <div className="flex items-center gap-2">
                                              <span 
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: elem.color }}
                                              />
                                              {elem.label}
                                            </div>
                                          </td>
                                          <td className="text-center py-2 px-3">{elem.firstValue}</td>
                                          <td className="text-center py-2 px-3">{elem.lastValue}</td>
                                          <td className="text-center py-2 px-3">
                                            <span className={elem.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                              {elem.change >= 0 ? '+' : ''}{elem.change}
                                            </span>
                                          </td>
                                          <td className="text-center py-2 px-3">
                                            <Badge className={elem.changePercent >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                                              {elem.changePercent >= 0 ? '+' : ''}{elem.changePercent}%
                                            </Badge>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </CardContent>
                            </Card>

                            {/* 改善最显著的维度 */}
                            <Card className="border-yellow-100">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Trophy className="h-5 w-5 text-yellow-500" />
                                  改善最显著的维度 TOP3
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                  {singleImprovementAnalysis.elementChanges.slice(0, 3).map((elem, index) => (
                                    <div key={elem.key} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                                      <div className="flex items-center justify-center gap-2 mb-2">
                                        {index === 0 && <span className="text-2xl">🥇</span>}
                                        {index === 1 && <span className="text-2xl">🥈</span>}
                                        {index === 2 && <span className="text-2xl">🥉</span>}
                                        <span className="font-medium">{elem.label}</span>
                                      </div>
                                      <p className="text-2xl font-bold text-green-600">
                                        +{elem.change}分
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        提升 {elem.changePercent}%
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ) : (
                          <Card className="border-gray-200">
                            <CardContent className="py-10 text-center">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-gray-500">请至少选择2条记录进行改善分析</p>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>
                    </Tabs>
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
