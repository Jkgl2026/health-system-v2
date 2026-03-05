'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  LogOut, Users, Activity, TrendingUp, PieChart as PieChartIcon, BarChart3, 
  RefreshCw, Calendar, Filter, ArrowLeft, AlertCircle
} from 'lucide-react';

// 颜色配置
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('symptom');
  
  // 筛选条件
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gender, setGender] = useState('');
  const [ageRange, setAgeRange] = useState('');
  
  // 数据
  const [symptomData, setSymptomData] = useState<any>(null);
  const [constitutionData, setConstitutionData] = useState<any>(null);
  const [planData, setPlanData] = useState<any>(null);
  const [overviewData, setOverviewData] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchOverviewData();
  }, []);

  useEffect(() => {
    if (activeTab === 'symptom') fetchSymptomData();
    else if (activeTab === 'constitution') fetchConstitutionData();
    else if (activeTab === 'plan') fetchPlanData();
  }, [activeTab, startDate, endDate, gender, ageRange]);

  const checkAuth = async () => {
    // 首先检查 localStorage 快速缓存
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }
    
    // 然后验证 Cookie 是否有效
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

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (gender) params.append('gender', gender);
    if (ageRange) params.append('ageRange', ageRange);
    return params.toString();
  };

  const fetchOverviewData = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?type=overview&${buildQueryParams()}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setOverviewData(data.data);
      } else if (data.code === 'UNAUTHORIZED' || response.status === 401) {
        // 认证失败，跳转登录页
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('admin');
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('获取总览数据失败:', error);
    }
  };

  const fetchSymptomData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?type=symptom&${buildQueryParams()}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setSymptomData(data.data);
      } else if (data.code === 'UNAUTHORIZED' || response.status === 401) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('admin');
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('获取症状数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConstitutionData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?type=constitution&${buildQueryParams()}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setConstitutionData(data.data);
      } else if (data.code === 'UNAUTHORIZED' || response.status === 401) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('admin');
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('获取体质数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?type=plan&${buildQueryParams()}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setPlanData(data.data);
      } else if (data.code === 'UNAUTHORIZED' || response.status === 401) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('admin');
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('获取方案数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchOverviewData();
    if (activeTab === 'symptom') fetchSymptomData();
    else if (activeTab === 'constitution') fetchConstitutionData();
    else if (activeTab === 'plan') fetchPlanData();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setGender('');
    setAgeRange('');
  };

  // 自定义饼图标签
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
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
              <div className="bg-emerald-500 p-2 rounded-lg">
                <PieChartIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">数据分析中心</h1>
                <p className="text-xs text-gray-500">症状分析 · 体质分布 · 方案使用率</p>
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
        {/* 筛选条件 */}
        <Card className="mb-6 border-emerald-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              筛选条件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-3 py-1.5 text-sm"
                  placeholder="开始日期"
                />
                <span className="text-gray-400">至</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-3 py-1.5 text-sm"
                  placeholder="结束日期"
                />
              </div>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="男">男</SelectItem>
                  <SelectItem value="女">女</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ageRange} onValueChange={setAgeRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="年龄段" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="0-30">30岁以下</SelectItem>
                  <SelectItem value="30-40">30-40岁</SelectItem>
                  <SelectItem value="40-50">40-50岁</SelectItem>
                  <SelectItem value="50-60">50-60岁</SelectItem>
                  <SelectItem value="60-100">60岁以上</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                清除筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 统计概览 */}
        {overviewData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-emerald-100">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">总用户数</p>
                    <p className="text-2xl font-bold text-emerald-600">{overviewData.users?.total || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-100">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">今日新增</p>
                    <p className="text-2xl font-bold text-blue-600">{overviewData.users?.today || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-100">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">总检测数</p>
                    <p className="text-2xl font-bold text-purple-600">{overviewData.checks?.total || 0}</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-100">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">平均健康分</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {overviewData.analysis?.avgScore ? overviewData.analysis.avgScore.toFixed(1) : '--'}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 数据分析标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="symptom" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              症状分类占比
            </TabsTrigger>
            <TabsTrigger value="constitution" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              体质分布分析
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              调理方案使用率
            </TabsTrigger>
          </TabsList>

          {/* 症状分类占比 */}
          <TabsContent value="symptom">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : symptomData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 环形图 */}
                <Card className="border-emerald-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-emerald-500" />
                      症状分类占比
                    </CardTitle>
                    <CardDescription>
                      按症状类型统计（共 {symptomData.totalSymptoms || 0} 项症状）
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={symptomData.chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {symptomData.chartData?.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* 柱状图和Top症状 */}
                <Card className="border-emerald-100">
                  <CardHeader>
                    <CardTitle>症状详情统计</CardTitle>
                    <CardDescription>Top 20 高频症状</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={symptomData.topSymptoms?.slice(0, 15)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={80} fontSize={12} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-gray-200">
                <CardContent className="py-20 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">暂无数据</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 体质分布分析 */}
          <TabsContent value="constitution">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : constitutionData ? (
              <div className="space-y-6">
                {/* 体质分布饼图 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-blue-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        九种体质分布
                      </CardTitle>
                      <CardDescription>
                        共 {constitutionData.totalRecords || 0} 条分析记录
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={constitutionData.chartData?.filter((d: any) => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              outerRadius={120}
                              dataKey="value"
                            >
                              {constitutionData.chartData?.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 性别交叉分析 */}
                  <Card className="border-purple-100">
                    <CardHeader>
                      <CardTitle>性别体质交叉分析</CardTitle>
                      <CardDescription>按性别统计体质分布</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={constitutionData.genderConstitution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="gender" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {constitutionData.chartData?.slice(0, 5).map((entry: any, index: number) => (
                              <Bar key={entry.name} dataKey={entry.name} fill={COLORS[index]} />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 年龄段交叉分析 */}
                <Card className="border-orange-100">
                  <CardHeader>
                    <CardTitle>年龄段体质交叉分析</CardTitle>
                    <CardDescription>按年龄段统计体质分布</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={constitutionData.ageConstitution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="age" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {constitutionData.chartData?.slice(0, 5).map((entry: any, index: number) => (
                            <Bar key={entry.name} dataKey={entry.name} fill={COLORS[index]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-gray-200">
                <CardContent className="py-20 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">暂无数据</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 调理方案使用率 */}
          <TabsContent value="plan">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : planData ? (
              <div className="space-y-6">
                {/* 方案使用柱状图 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-emerald-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-emerald-500" />
                        方案使用统计
                      </CardTitle>
                      <CardDescription>
                        共 {planData.totalRecords || 0} 次选择
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={planData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="选择次数" fill="#10b981" />
                            <Bar dataKey="userCount" name="用户数" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 新老用户分析 */}
                  <Card className="border-purple-100">
                    <CardHeader>
                      <CardTitle>新老用户方案选择</CardTitle>
                      <CardDescription>注册7天内为新用户</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={planData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="新用户" fill="#f59e0b" />
                            <Bar dataKey="老用户" fill="#8b5cf6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 近7天趋势 */}
                <Card className="border-blue-100">
                  <CardHeader>
                    <CardTitle>近7天选择趋势</CardTitle>
                    <CardDescription>按日期统计方案选择</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={planData.last7Days}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {planData.chartData?.map((entry: any, index: number) => (
                            <Area
                              key={entry.name}
                              type="monotone"
                              dataKey={entry.name}
                              stackId="1"
                              stroke={COLORS[index]}
                              fill={COLORS[index]}
                              fillOpacity={0.6}
                            />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-gray-200">
                <CardContent className="py-20 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">暂无数据</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
