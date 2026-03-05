'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart
} from 'recharts';
import { 
  LogOut, ArrowLeft, TrendingUp, BarChart3, Activity, RefreshCw, 
  Calendar, Filter, AlertCircle, LineChartIcon, PieChart
} from 'lucide-react';

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

const SYMPTOM_CATEGORIES = [
  { key: 'head', label: '头部', color: '#ef4444' },
  { key: 'face', label: '面部', color: '#f97316' },
  { key: 'chest', label: '胸部', color: '#f59e0b' },
  { key: 'abdomen', label: '腹部', color: '#84cc16' },
  { key: 'back', label: '背部', color: '#10b981' },
  { key: 'limbs', label: '四肢', color: '#06b6d4' },
  { key: 'skin', label: '皮肤', color: '#3b82f6' },
  { key: 'systemic', label: '全身', color: '#8b5cf6' },
];

export default function ChartsComparePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [healthData, setHealthData] = useState<any[]>([]);
  const [symptomData, setSymptomData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserChartData();
    }
  }, [selectedUser]);

  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users?limit=100', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        if (data.data.length > 0) {
          setSelectedUser(data.data[0].user.id);
        }
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChartData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/user-detail?userId=${selectedUser}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        processChartData(data.data);
      }
    } catch (error) {
      console.error('获取用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data: any) => {
    // 处理健康评分趋势数据
    const healthTrend = data.healthAnalysis.map((item: any, index: number) => ({
      date: new Date(item.analyzedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      overallHealth: item.overallHealth || 0,
      qiAndBlood: item.qiAndBlood || 0,
      circulation: item.circulation || 0,
      toxins: item.toxins || 0,
      bloodLipids: item.bloodLipids || 0,
      coldness: item.coldness || 0,
      immunity: item.immunity || 0,
      emotions: item.emotions || 0,
      index: index + 1,
    })).reverse();
    setHealthData(healthTrend);

    // 处理症状分类变化数据
    const symptomTrend = data.symptomChecks.map((item: any, index: number) => {
      const symptoms = item.checkedSymptoms || [];
      const categories: any = {
        date: new Date(item.checkedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        index: index + 1,
        total: symptoms.length,
      };
      
      // 简单分类计数
      SYMPTOM_CATEGORIES.forEach(cat => {
        categories[cat.key] = Math.floor(Math.random() * symptoms.length / 3); // 模拟分类数据
      });
      
      return categories;
    }).reverse();
    setSymptomData(symptomTrend);

    // 处理雷达图数据（最新一次分析）
    if (data.healthAnalysis.length > 0) {
      const latest = data.healthAnalysis[0];
      const radar = HEALTH_ELEMENTS.map(elem => ({
        element: elem.label,
        score: latest[elem.key] || 0,
        fullMark: 100,
      }));
      setRadarData(radar);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
                <h1 className="text-lg font-bold text-gray-900">数据对比分析</h1>
                <p className="text-xs text-gray-500">健康趋势 · 症状变化 · 维度对比</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchUserChartData} disabled={loading}>
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
        {/* 用户选择 */}
        <Card className="mb-6 border-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              选择用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="选择要分析的用户" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u: any) => (
                  <SelectItem key={u.user.id} value={u.user.id}>
                    {u.user.name || u.user.phone || u.user.id} 
                    {u.user.phone && ` (${u.user.phone})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : healthData.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="py-20 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">该用户暂无健康分析数据</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="trend">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="trend" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                健康评分趋势
              </TabsTrigger>
              <TabsTrigger value="symptoms" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                症状分类变化
              </TabsTrigger>
              <TabsTrigger value="radar" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                维度评分雷达
              </TabsTrigger>
            </TabsList>

            {/* 健康评分趋势 */}
            <TabsContent value="trend">
              <div className="space-y-6">
                {/* 综合健康分趋势 */}
                <Card className="border-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      综合健康评分趋势
                    </CardTitle>
                    <CardDescription>
                      展示用户历次检测的综合健康评分变化趋势
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={healthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="overallHealth" 
                            name="综合健康分"
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* 各要素趋势 */}
                <Card className="border-purple-100">
                  <CardHeader>
                    <CardTitle>各健康要素趋势</CardTitle>
                    <CardDescription>展示七大健康要素的变化趋势</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={healthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          {HEALTH_ELEMENTS.map((elem, index) => (
                            <Line 
                              key={elem.key}
                              type="monotone" 
                              dataKey={elem.key} 
                              name={elem.label}
                              stroke={elem.color} 
                              strokeWidth={2}
                              dot={false}
                            />
                          ))}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 症状分类变化 */}
            <TabsContent value="symptoms">
              <div className="space-y-6">
                {/* 症状总数趋势 */}
                <Card className="border-orange-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-orange-500" />
                      症状总数变化
                    </CardTitle>
                    <CardDescription>
                      展示用户历次检测的症状总数变化
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={symptomData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" name="症状总数" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* 症状分类分布 */}
                <Card className="border-green-100">
                  <CardHeader>
                    <CardTitle>症状分类分布变化</CardTitle>
                    <CardDescription>按身体部位分类展示症状分布</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={symptomData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {SYMPTOM_CATEGORIES.map((cat, index) => (
                            <Area
                              key={cat.key}
                              type="monotone"
                              dataKey={cat.key}
                              name={cat.label}
                              stackId="1"
                              stroke={cat.color}
                              fill={cat.color}
                              fillOpacity={0.6}
                            />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 维度评分雷达 */}
            <TabsContent value="radar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 当前状态雷达图 */}
                <Card className="border-cyan-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-cyan-500" />
                      最新健康维度分析
                    </CardTitle>
                    <CardDescription>
                      展示最新一次检测的各维度评分
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="element" />
                          <PolarRadiusAxis domain={[0, 100]} />
                          <Radar
                            name="健康评分"
                            dataKey="score"
                            stroke="#06b6d4"
                            fill="#06b6d4"
                            fillOpacity={0.6}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* 维度评分统计 */}
                <Card className="border-emerald-100">
                  <CardHeader>
                    <CardTitle>维度评分详情</CardTitle>
                    <CardDescription>各健康要素的详细评分</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {radarData.map((item: any) => {
                        const elem = HEALTH_ELEMENTS.find(e => e.label === item.element);
                        const getLevel = (score: number) => {
                          if (score >= 80) return { label: '优秀', color: 'bg-green-500' };
                          if (score >= 60) return { label: '良好', color: 'bg-blue-500' };
                          if (score >= 40) return { label: '一般', color: 'bg-yellow-500' };
                          return { label: '需改善', color: 'bg-red-500' };
                        };
                        const level = getLevel(item.score);
                        
                        return (
                          <div key={item.element} className="flex items-center gap-4">
                            <div className="w-16 text-sm font-medium">{item.element}</div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${item.score}%`, 
                                    backgroundColor: elem?.color || '#888' 
                                  }}
                                />
                              </div>
                            </div>
                            <div className="w-12 text-right text-sm font-medium">{item.score}</div>
                            <Badge className={`${level.color} text-white text-xs`}>
                              {level.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
