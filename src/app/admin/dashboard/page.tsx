'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Pagination } from '@/components/admin/Pagination';
import { LogOut, Users, FileText, Activity, CheckCircle, AlertCircle, Eye, Download, Search, X, TrendingUp, Target, HelpCircle, Filter, RefreshCw } from 'lucide-react';
import { SEVEN_QUESTIONS } from '@/lib/health-data';

interface UserSummary {
  user: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    age: number | null;
    gender: string | null;
    createdAt: Date;
  };
  latestSymptomCheck: {
    id: string;
    checkedSymptoms: string[];
    totalScore: number | null;
    checkedAt: Date;
  } | null;
  latestHealthAnalysis: {
    id: string;
    qiAndBlood: number | null;
    circulation: number | null;
    toxins: number | null;
    bloodLipids: number | null;
    coldness: number | null;
    immunity: number | null;
    emotions: number | null;
    overallHealth: number | null;
    analyzedAt: Date;
  } | null;
  latestChoice: {
    id: string;
    planType: string;
    planDescription: string | null;
    selectedAt: Date;
  } | null;
  requirements: {
    id: string;
    requirement1Completed: boolean;
    requirement2Completed: boolean;
    requirement3Completed: boolean;
    requirement4Completed: boolean;
    completedAt: Date | null;
  } | null;
}

interface UserFullData {
  user: any;
  symptomChecks: any[];
  healthAnalysis: any[];
  userChoices: any[];
  requirements: any;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// 健康要素配置
const HEALTH_ELEMENTS = [
  { key: 'qiAndBlood', label: '气血', color: 'bg-red-500', textColor: 'text-red-600' },
  { key: 'circulation', label: '循环', color: 'bg-blue-500', textColor: 'text-blue-600' },
  { key: 'toxins', label: '毒素', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  { key: 'bloodLipids', label: '血脂', color: 'bg-orange-500', textColor: 'text-orange-600' },
  { key: 'coldness', label: '寒凉', color: 'bg-cyan-500', textColor: 'text-cyan-600' },
  { key: 'immunity', label: '免疫', color: 'bg-green-500', textColor: 'text-green-600' },
  { key: 'emotions', label: '情绪', color: 'bg-purple-500', textColor: 'text-purple-600' },
];

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserFullData | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [showSearchBar, setShowSearchBar] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      window.location.href = '/admin/login';
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    // fetchUsers 会在 effect 中自动调用
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // 重置到第一页
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('admin');
    window.location.href = '/admin/login';
  };

  const handleViewDetail = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedUser(data.data);
        setShowDetailDialog(true);
      }
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
    }
  };

  const handleExport = async (includeDetails: boolean) => {
    try {
      const url = `/api/admin/export?details=${includeDetails}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('导出数据失败，请重试');
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

  const calculateRequirementsProgress = (req: any) => {
    if (!req) return 0;
    const completed = [
      req.requirement1Completed,
      req.requirement2Completed,
      req.requirement3Completed,
      req.requirement4Completed,
    ].filter(Boolean).length;
    return (completed / 4) * 100;
  };

  // 获取最新的健康分析数据
  const getLatestHealthAnalysis = () => {
    if (!selectedUser || !selectedUser.healthAnalysis || selectedUser.healthAnalysis.length === 0) {
      return null;
    }
    return selectedUser.healthAnalysis[0];
  };

  // 获取最新的症状自检数据
  const getLatestSymptomCheck = () => {
    if (!selectedUser || !selectedUser.symptomChecks || selectedUser.symptomChecks.length === 0) {
      return null;
    }
    return selectedUser.symptomChecks[0];
  };

  // 获取最新的方案选择
  const getLatestChoice = () => {
    if (!selectedUser || !selectedUser.userChoices || selectedUser.userChoices.length === 0) {
      return null;
    }
    return selectedUser.userChoices[0];
  };

  // 获取健康状态
  const getHealthStatus = (overallHealth: number | null) => {
    if (overallHealth === null || overallHealth === undefined) {
      return { label: '未检测', color: 'bg-gray-500' };
    }
    if (overallHealth >= 80) {
      return { label: '优秀', color: 'bg-green-500' };
    } else if (overallHealth >= 60) {
      return { label: '良好', color: 'bg-blue-500' };
    } else if (overallHealth >= 40) {
      return { label: '一般', color: 'bg-yellow-500' };
    } else {
      return { label: '需关注', color: 'bg-red-500' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">健康自检管理后台</h1>
                <p className="text-sm text-gray-500">用户数据管理系统</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSearchBar(!showSearchBar)}>
                <Search className="h-4 w-4 mr-2" />
                {showSearchBar ? '隐藏' : '搜索'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(false)}
              >
                <Download className="h-4 w-4 mr-2" />
                导出CSV
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </div>
          </div>

          {/* 搜索栏 */}
          {showSearchBar && (
            <div className="mt-4 pt-4 border-t">
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索用户姓名或手机号..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  搜索
                </Button>
                <Button type="button" variant="outline" onClick={handleClearSearch}>
                  重置
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>总用户数</CardDescription>
              <CardTitle className="text-3xl">{pagination.total}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                活跃用户
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>已完成自检</CardDescription>
              <CardTitle className="text-3xl">
                {users.filter(u => u.latestSymptomCheck).length}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="h-4 w-4 mr-1" />
                {pagination.total > 0 ? ((users.filter(u => u.latestSymptomCheck).length / pagination.total) * 100).toFixed(1) : 0}%
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>已完成要求</CardDescription>
              <CardTitle className="text-3xl">
                {users.filter(u => u.requirements && calculateRequirementsProgress(u.requirements) === 100).length}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                完成率 100%
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>平均健康分数</CardDescription>
              <CardTitle className="text-3xl">
                {(() => {
                  const scores = users
                    .filter(u => u.latestHealthAnalysis && u.latestHealthAnalysis.overallHealth !== null)
                    .map(u => u.latestHealthAnalysis!.overallHealth!);
                  if (scores.length === 0) return '-';
                  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                  return avg.toFixed(1);
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="h-4 w-4 mr-1" />
                整体健康水平
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 用户列表表格 */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>
                  {searchQuery && `搜索: "${searchQuery}" - `}
                  共 {pagination.total} 位用户
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">姓名</TableHead>
                    <TableHead className="font-semibold">手机号</TableHead>
                    <TableHead className="font-semibold">年龄</TableHead>
                    <TableHead className="font-semibold">性别</TableHead>
                    <TableHead className="font-semibold">健康状态</TableHead>
                    <TableHead className="font-semibold">完成度</TableHead>
                    <TableHead className="font-semibold">注册时间</TableHead>
                    <TableHead className="font-semibold">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                          加载中...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {searchQuery ? '未找到匹配的用户' : '暂无用户数据'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((userSummary) => {
                      const latestAnalysis = userSummary.latestHealthAnalysis;
                      const healthStatus = latestAnalysis
                        ? getHealthStatus(latestAnalysis.overallHealth)
                        : { label: '未检测', color: 'bg-gray-500' };

                      return (
                        <TableRow key={userSummary.user.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {userSummary.user.name || '-'}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {userSummary.user.phone || '-'}
                          </TableCell>
                          <TableCell>
                            {userSummary.user.age || '-'}
                          </TableCell>
                          <TableCell>
                            {userSummary.user.gender || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${healthStatus.color} text-white`}>
                              {healthStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${calculateRequirementsProgress(userSummary.requirements)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 mt-1 block">
                              {calculateRequirementsProgress(userSummary.requirements).toFixed(0)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(userSummary.user.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(userSummary.user.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              查看详情
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* 分页组件 */}
            {pagination.total > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={itemsPerPage}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 用户详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">用户详细信息</DialogTitle>
            <DialogDescription>
              {selectedUser?.user?.name || '未知用户'}的完整健康数据
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* 基本信息 - 蓝色边框渐变背景 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-l-4 border-blue-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-4 flex items-center text-blue-900">
                  <Users className="h-6 w-6 mr-3 text-blue-600" />
                  基本信息
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">姓名</div>
                    <div className="font-bold text-lg">{selectedUser.user?.name || '未填写'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">手机号</div>
                    <div className="font-bold text-lg font-mono">{selectedUser.user?.phone || '未填写'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">年龄</div>
                    <div className="font-bold text-lg">{selectedUser.user?.age || '未填写'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">性别</div>
                    <div className="font-bold text-lg">{selectedUser.user?.gender || '未填写'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">身高</div>
                    <div className="font-bold text-lg">{selectedUser.user?.height ? `${selectedUser.user.height} cm` : '未填写'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">体重</div>
                    <div className="font-bold text-lg">{selectedUser.user?.weight ? `${selectedUser.user.weight} kg` : '未填写'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">BMI</div>
                    <div className="font-bold text-lg">{selectedUser.user?.bmi && !isNaN(Number(selectedUser.user.bmi)) ? Number(selectedUser.user.bmi).toFixed(1) : '未计算'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">注册时间</div>
                    <div className="font-bold text-lg">{formatDate(selectedUser.user?.createdAt)}</div>
                  </div>
                </div>
              </div>

              {/* 健康要素分析 - 蓝色渐变背景 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-l-4 border-blue-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-blue-900">
                  <Activity className="h-6 w-6 mr-3 text-blue-600" />
                  健康要素分析
                </h3>
                
                {getLatestHealthAnalysis() ? (
                  <div className="space-y-6">
                    {/* 整体健康总分 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100 text-center">
                      <div className="text-sm text-blue-600 mb-2">整体健康总分</div>
                      <div className="font-bold text-5xl text-blue-700 mb-2">
                        {(() => {
                          const analysis = getLatestHealthAnalysis();
                          if (analysis?.overallHealth === null || analysis?.overallHealth === undefined) return '未计算';
                          const val = Number(analysis.overallHealth);
                          return !isNaN(val) ? val.toFixed(1) : '格式错误';
                        })()}
                      </div>
                      <div className="text-sm text-blue-500">
                        基于7个健康要素的综合评估
                      </div>
                    </div>

                    {/* 各要素得分卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {HEALTH_ELEMENTS.map((element) => {
                        const rawValue = (getLatestHealthAnalysis() as any)[element.key];
                        const value = rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;
                        const score = value !== null && !isNaN(value) ? Math.min(value, 100) : 0;
                        
                        return (
                          <div key={element.key} className="bg-white p-5 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${element.color}`} />
                                <div className="font-bold text-lg text-blue-900">{element.label}</div>
                              </div>
                              <div className={`font-bold text-2xl ${element.textColor}`}>
                                {value !== null ? `${value} 分` : '未检测'}
                              </div>
                            </div>
                            
                            {/* 大型进度条 */}
                            <div className="w-full bg-gray-200 rounded-full h-6 mb-2">
                              <div
                                className={`${element.color} h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                                style={{ width: `${score}%` }}
                              >
                                {score > 20 && (
                                  <span className="text-xs font-bold text-white">
                                    {Number(score).toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* 状态描述 */}
                            <div className="text-sm text-gray-600 mt-3">
                              {score >= 80 ? '优秀' : 
                               score >= 60 ? '良好' : 
                               score >= 40 ? '一般' : 
                               score >= 20 ? '需关注' : '需改善'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100 text-center">
                    <Activity className="h-12 w-12 mx-auto text-blue-300 mb-3" />
                    <p className="text-blue-600 font-medium">暂无健康分析数据</p>
                    <p className="text-sm text-blue-500 mt-1">用户尚未完成健康要素分析</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* 症状自检记录 - 绿色渐变背景 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-l-4 border-green-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-green-900">
                  <FileText className="h-6 w-6 mr-3 text-green-600" />
                  症状自检记录
                </h3>
                
                {getLatestSymptomCheck() ? (
                  <div className="space-y-6">
                    {/* 症状统计卡片 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                        <div className="text-sm text-green-600 mb-1">选中症状数量</div>
                        <div className="font-bold text-3xl text-green-700">
                          {getLatestSymptomCheck()!.checkedSymptoms.length} 项
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                        <div className="text-sm text-green-600 mb-1">目标症状</div>
                        <div className="font-bold text-3xl text-green-700">
                          {selectedUser.user?.targetSymptom || '未设置'}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                        <div className="text-sm text-green-600 mb-1">自检总分</div>
                        <div className="font-bold text-3xl text-green-700">
                          {getLatestSymptomCheck()!.totalScore !== null ? getLatestSymptomCheck()!.totalScore : '未计算'}
                        </div>
                      </div>
                    </div>

                    {/* 各要素得分可视化 */}
                    <div>
                      <h4 className="font-semibold mb-4 text-green-800">各健康要素得分</h4>
                      <div className="space-y-4">
                        {/* 气血 - 红色 */}
                        <div className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium text-red-700">气血</div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div className="bg-red-500 h-4 rounded-full transition-all" style={{ width: '70%' }} />
                            </div>
                          </div>
                          <div className="w-12 text-right font-bold text-red-700">7分</div>
                        </div>
                        
                        {/* 循环 - 蓝色 */}
                        <div className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium text-blue-700">循环</div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div className="bg-blue-500 h-4 rounded-full transition-all" style={{ width: '50%' }} />
                            </div>
                          </div>
                          <div className="w-12 text-right font-bold text-blue-700">5分</div>
                        </div>
                        
                        {/* 毒素 - 黄色 */}
                        <div className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium text-yellow-700">毒素</div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div className="bg-yellow-500 h-4 rounded-full transition-all" style={{ width: '60%' }} />
                            </div>
                          </div>
                          <div className="w-12 text-right font-bold text-yellow-700">6分</div>
                        </div>
                        
                        {/* 血脂 - 橙色 */}
                        <div className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium text-orange-700">血脂</div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div className="bg-orange-500 h-4 rounded-full transition-all" style={{ width: '40%' }} />
                            </div>
                          </div>
                          <div className="w-12 text-right font-bold text-orange-700">4分</div>
                        </div>
                        
                        {/* 寒凉 - 青色 */}
                        <div className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium text-cyan-700">寒凉</div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div className="bg-cyan-500 h-4 rounded-full transition-all" style={{ width: '30%' }} />
                            </div>
                          </div>
                          <div className="w-12 text-right font-bold text-cyan-700">3分</div>
                        </div>
                        
                        {/* 免疫 - 绿色 */}
                        <div className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium text-green-700">免疫</div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div className="bg-green-500 h-4 rounded-full transition-all" style={{ width: '80%' }} />
                            </div>
                          </div>
                          <div className="w-12 text-right font-bold text-green-700">8分</div>
                        </div>
                        
                        {/* 情绪 - 紫色 */}
                        <div className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium text-purple-700">情绪</div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div className="bg-purple-500 h-4 rounded-full transition-all" style={{ width: '55%' }} />
                            </div>
                          </div>
                          <div className="w-12 text-right font-bold text-purple-700">5.5分</div>
                        </div>
                      </div>
                    </div>

                    {/* 自检时间 */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                      <div className="text-sm text-green-600 mb-1">自检时间</div>
                      <div className="font-bold text-lg">{formatDate(getLatestSymptomCheck()!.checkedAt)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100 text-center">
                    <FileText className="h-12 w-12 mx-auto text-green-300 mb-3" />
                    <p className="text-green-600 font-medium">暂无症状自检数据</p>
                    <p className="text-sm text-green-500 mt-1">用户尚未完成症状自检</p>
                  </div>
                )}
              </div>

              {/* 用户选择 - 紫色渐变背景 */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 border-l-4 border-purple-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-purple-900">
                  <Target className="h-6 w-6 mr-3 text-purple-600" />
                  方案选择
                </h3>
                
                {getLatestChoice() ? (
                  <div className="space-y-6">
                    {/* 方案类型醒目展示 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100 text-center">
                      <div className="text-sm text-purple-600 mb-3">已选择方案</div>
                      <div className="font-bold text-4xl text-purple-700 mb-2">
                        {getLatestChoice()!.planType}
                      </div>
                      <div className="text-sm text-purple-500">
                        选择时间：{formatDate(getLatestChoice()!.selectedAt)}
                      </div>
                    </div>

                    {/* 方案描述清晰展示 */}
                    {getLatestChoice()!.planDescription && (
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                        <div className="font-semibold text-lg text-purple-800 mb-3">方案描述</div>
                        <div className="text-gray-700 leading-relaxed">
                          {getLatestChoice()!.planDescription}
                        </div>
                      </div>
                    )}

                    {/* 方案特性说明 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100 text-center">
                        <div className="text-sm text-purple-600 mb-1">适用人群</div>
                        <div className="font-medium text-purple-800">中老年人群</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100 text-center">
                        <div className="text-sm text-purple-600 mb-1">主要目标</div>
                        <div className="font-medium text-purple-800">改善循环系统</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100 text-center">
                        <div className="text-sm text-purple-600 mb-1">预计周期</div>
                        <div className="font-medium text-purple-800">3-6个月</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100 text-center">
                    <Target className="h-12 w-12 mx-auto text-purple-300 mb-3" />
                    <p className="text-purple-600 font-medium">暂未选择方案</p>
                    <p className="text-sm text-purple-500 mt-1">用户尚未完成方案选择</p>
                  </div>
                )}
              </div>

              {/* 四个要求完成情况 - 橙色渐变背景 */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 border-l-4 border-orange-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-orange-900">
                  <CheckCircle className="h-6 w-6 mr-3 text-orange-600" />
                  四个要求完成情况
                </h3>
                
                {selectedUser.requirements ? (
                  <div className="space-y-6">
                    {/* 总体完成进度条 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-semibold text-lg text-orange-800">总体完成度</div>
                        <div className="font-bold text-2xl text-orange-700">
                          {calculateRequirementsProgress(selectedUser.requirements).toFixed(0)}%
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-orange-500 h-4 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${calculateRequirementsProgress(selectedUser.requirements)}%` }}
                        />
                      </div>
                      <div className="text-sm text-orange-600 mt-2">
                        {(() => {
                          const completed = [
                            selectedUser.requirements.requirement1Completed,
                            selectedUser.requirements.requirement2Completed,
                            selectedUser.requirements.requirement3Completed,
                            selectedUser.requirements.requirement4Completed,
                          ].filter(Boolean).length;
                          return `已完成 ${completed} 个要求，剩余 ${4 - completed} 个`;
                        })()}
                      </div>
                    </div>

                    {/* 四个要求独立卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'requirement1Completed', label: '要求一', description: '完成个人信息填写与症状自检' },
                        { key: 'requirement2Completed', label: '要求二', description: '完成健康要素分析与评估' },
                        { key: 'requirement3Completed', label: '要求三', description: '选择适合的健康管理方案' },
                        { key: 'requirement4Completed', label: '要求四', description: '完成所有健康管理要求' },
                      ].map((req, index) => {
                        const isCompleted = selectedUser.requirements![req.key as keyof typeof selectedUser.requirements];
                        
                        return (
                          <div key={req.key} className={`bg-white p-5 rounded-lg shadow-sm border ${isCompleted ? 'border-green-200' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                  {isCompleted ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="font-bold text-lg">{req.label}</div>
                              </div>
                              <Badge className={`${isCompleted ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                                {isCompleted ? '✓ 完成' : '○ 未完成'}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-3">{req.description}</div>
                            
                            <div className="text-xs text-gray-500">
                              {isCompleted ? (
                                <span className="text-green-600">已完成 - 用户已满足此要求</span>
                              ) : (
                                <span className="text-orange-600">待完成 - 用户尚未满足此要求</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 完成时间信息 */}
                    {selectedUser.requirements.completedAt && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 text-center">
                        <div className="text-sm text-orange-600 mb-1">全部要求完成时间</div>
                        <div className="font-bold text-lg">{formatDate(selectedUser.requirements.completedAt)}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-orange-300 mb-3" />
                    <p className="text-orange-600 font-medium">暂无要求完成数据</p>
                    <p className="text-sm text-orange-500 mt-1">用户尚未开始完成健康管理要求</p>
                  </div>
                )}
              </div>

              {/* 七问答案 - 优化显示 */}
              {selectedUser.requirements?.sevenQuestionsAnswers && (
                <>
                  <Separator />
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-100 border-l-4 border-indigo-500 p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold text-xl mb-6 flex items-center text-indigo-900">
                      <HelpCircle className="h-6 w-6 mr-3 text-indigo-600" />
                      七问答案
                    </h3>
                    
                    <div className="space-y-4">
                      {(() => {
                        const answers = selectedUser.requirements?.sevenQuestionsAnswers;
                        
                        // 检查是否是数组格式
                        if (Array.isArray(answers)) {
                          if (answers.length === 0) {
                            return (
                              <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100 text-center">
                                <HelpCircle className="h-12 w-12 mx-auto text-indigo-300 mb-3" />
                                <p className="text-indigo-600 font-medium">暂无七问答案数据</p>
                                <p className="text-sm text-indigo-500 mt-1">用户尚未完成七问填写</p>
                              </div>
                            );
                          }
                          
                          return answers.map((item: any, index: number) => (
                            <div key={index} className="bg-white p-5 rounded-lg shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                                <div className="font-bold text-lg text-indigo-900">
                                  {item.question || `问题 ${index + 1}`}
                                </div>
                              </div>
                              <div className="text-gray-700 leading-relaxed pl-11">
                                {item.answer || '未填写'}
                              </div>
                              {item.date && (
                                <div className="text-xs text-indigo-500 mt-2 pl-11">
                                  填写时间：{formatDate(item.date)}
                                </div>
                              )}
                            </div>
                          ));
                        }
                        
                        // 字典格式
                        const answerDict = answers as Record<string, any>;
                        const hasAnswers = Object.values(answerDict).some(val => 
                          val !== null && val !== undefined && 
                          (typeof val === 'object' ? val.answer : val)
                        );
                        
                        if (!hasAnswers) {
                          return (
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100 text-center">
                              <HelpCircle className="h-12 w-12 mx-auto text-indigo-300 mb-3" />
                              <p className="text-indigo-600 font-medium">暂无七问答案数据</p>
                              <p className="text-sm text-indigo-500 mt-1">用户尚未完成七问填写</p>
                            </div>
                          );
                        }
                        
                        return SEVEN_QUESTIONS.map((q, index) => {
                          const answerData = answerDict?.[q.id.toString()];
                          const answer = typeof answerData === 'object' && answerData !== null ? answerData.answer : answerData;
                          const date = typeof answerData === 'object' && answerData !== null ? answerData.date : null;
                          
                          return (
                            <div key={index} className="bg-white p-5 rounded-lg shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                                <div className="font-bold text-lg text-indigo-900">
                                  {q.question}
                                </div>
                              </div>
                              <div className="text-gray-700 leading-relaxed pl-11">
                                {answer || '未填写'}
                              </div>
                              {date && (
                                <div className="text-xs text-indigo-500 mt-2 pl-11">
                                  填写时间：{formatDate(date)}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
