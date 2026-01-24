'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Pagination } from '@/components/admin/Pagination';
import { LogOut, Users, FileText, Activity, CheckCircle, AlertCircle, Eye, Download, Search, X, TrendingUp, Target, HelpCircle, Filter, RefreshCw, Sparkles, Flame, Heart, Zap, Droplets, BookOpen, AlertTriangle } from 'lucide-react';
import { SEVEN_QUESTIONS, BAD_HABITS_CHECKLIST, BODY_SYMPTOMS, BODY_SYMPTOMS_300, TWENTY_ONE_COURSES } from '@/lib/health-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyUsers, setHistoryUsers] = useState<any[]>([]);
  const [historyPhone, setHistoryPhone] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
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

  const handleViewHistory = async (phone: string) => {
    setLoadingHistory(true);
    setHistoryPhone(phone);
    try {
      const response = await fetch(`/api/user/history?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();
      if (data.success) {
        setHistoryUsers(data.users);
        setShowHistoryDialog(true);
      } else {
        alert('获取历史记录失败');
      }
    } catch (error) {
      console.error('Failed to fetch user history:', error);
      alert('获取历史记录失败，请重试');
    } finally {
      setLoadingHistory(false);
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
                    <TableHead className="font-semibold">历史记录</TableHead>
                    <TableHead className="font-semibold">注册时间</TableHead>
                    <TableHead className="font-semibold">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                          加载中...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
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
                          <TableCell>
                            {userSummary.user.phone ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewHistory(userSummary.user.phone!)}
                              >
                                <Activity className="h-4 w-4 mr-1" />
                                历史记录
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
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
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">邮箱</div>
                    <div className="font-bold text-lg">{selectedUser.user?.email || '未填写'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">血压</div>
                    <div className="font-bold text-lg">{selectedUser.user?.bloodPressure ? `${selectedUser.user.bloodPressure} mmHg` : '未填写'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">职业</div>
                    <div className="font-bold text-lg">{selectedUser.user?.occupation || '未填写'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">地址</div>
                    <div className="font-bold text-lg truncate" title={selectedUser.user?.address || ''}>
                      {selectedUser.user?.address || '未填写'}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">更新时间</div>
                    <div className="font-bold text-lg">{selectedUser.user?.updatedAt ? formatDate(selectedUser.user.updatedAt) : '未更新'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">账户状态</div>
                    <div className="font-bold text-lg">
                      {selectedUser.user?.deletedAt ? (
                        <Badge className="bg-red-600 text-white">已删除</Badge>
                      ) : (
                        <Badge className="bg-green-600 text-white">正常</Badge>
                      )}
                    </div>
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
                          {getLatestSymptomCheck()?.checkedSymptoms && getLatestSymptomCheck()!.checkedSymptoms.length > 0 
                            ? `症状ID: ${getLatestSymptomCheck()!.checkedSymptoms[0]}`
                            : '未设置'}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                        <div className="text-sm text-green-600 mb-1">自检总分</div>
                        <div className="font-bold text-3xl text-green-700">
                          {getLatestSymptomCheck()!.totalScore !== null ? getLatestSymptomCheck()!.totalScore : '未计算'}
                        </div>
                      </div>
                    </div>

                    {/* 具体症状列表 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
                      <div className="font-semibold text-lg text-green-800 mb-4">选中的症状详情</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {(() => {
                          const symptomIds = getLatestSymptomCheck()!.checkedSymptoms;
                          if (!Array.isArray(symptomIds) || symptomIds.length === 0) {
                            return <div className="col-span-full text-center py-4 text-green-600">暂无选中的症状</div>;
                          }

                          return symptomIds.map((id: string) => {
                            const symptomId = parseInt(id);
                            const symptom = BODY_SYMPTOMS.find((s: any) => s.id === symptomId);
                            return symptom ? (
                              <Badge key={symptomId} variant="secondary" className="justify-center py-2 px-3">
                                #{symptomId} {symptom.name}
                              </Badge>
                            ) : null;
                          });
                        })()}
                      </div>
                    </div>

                    {/* 各要素得分可视化 */}
                    <div>
                      <h4 className="font-semibold mb-4 text-green-800">各健康要素得分</h4>
                      <div className="space-y-4">
                        {(() => {
                          const latestSymptomCheck = getLatestSymptomCheck();
                          if (!latestSymptomCheck?.elementScores) {
                            return (
                              <div className="text-center py-4 text-green-600">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-green-300" />
                                <p>暂无要素得分数据</p>
                              </div>
                            );
                          }

                          const elementScores = latestSymptomCheck.elementScores;
                          if (typeof elementScores !== 'object' || elementScores === null) {
                            return (
                              <div className="text-center py-4 text-green-600">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-green-300" />
                                <p>要素得分数据格式错误</p>
                              </div>
                            );
                          }

                          // 定义健康要素映射（中文到数据库字段）
                          const healthElementsMap = [
                            { key: 'qiAndBlood', label: '气血', color: 'bg-red-500', textColor: 'text-red-700' },
                            { key: 'circulation', label: '循环', color: 'bg-blue-500', textColor: 'text-blue-700' },
                            { key: 'toxins', label: '毒素', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
                            { key: 'bloodLipids', label: '血脂', color: 'bg-orange-500', textColor: 'text-orange-700' },
                            { key: 'coldness', label: '寒凉', color: 'bg-cyan-500', textColor: 'text-cyan-700' },
                            { key: 'immunity', label: '免疫', color: 'bg-green-500', textColor: 'text-green-700' },
                            { key: 'emotions', label: '情绪', color: 'bg-purple-500', textColor: 'text-purple-700' },
                          ];

                          return healthElementsMap.map((element) => {
                            const score = elementScores[element.key] || 0;
                            const normalizedScore = Math.min(Math.max(Number(score) || 0, 0), 100);
                            
                            return (
                              <div key={element.key} className="flex items-center gap-4">
                                <div className={`w-24 text-sm font-medium ${element.textColor}`}>
                                  {element.label}
                                </div>
                                <div className="flex-1">
                                  <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div 
                                      className={`${element.color} h-4 rounded-full transition-all`}
                                      style={{ width: `${normalizedScore}%` }}
                                    />
                                  </div>
                                </div>
                                <div className={`w-12 text-right font-bold ${element.textColor}`}>
                                  {normalizedScore}分
                                </div>
                              </div>
                            );
                          });
                        })()}
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

                    {/* 最后更新时间 */}
                    {selectedUser.requirements.updatedAt && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 text-center">
                        <div className="text-sm text-orange-600 mb-1">最后更新时间</div>
                        <div className="font-bold text-lg">{formatDate(selectedUser.requirements.updatedAt)}</div>
                      </div>
                    )}

                    {/* 要求2详细回答 */}
                    {selectedUser.requirements.requirement2Answers && (
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
                        <div className="font-semibold text-lg text-orange-800 mb-3">要求二详细回答</div>
                        <div className="text-gray-700 leading-relaxed">
                          {(() => {
                            const answers = selectedUser.requirements.requirement2Answers;
                            if (typeof answers === 'string') {
                              return answers;
                            } else if (typeof answers === 'object' && answers !== null) {
                              // 如果是对象，格式化为列表
                              return Object.entries(answers).map(([key, value]) => (
                                <div key={key} className="mb-3">
                                  <div className="font-medium text-orange-700 mb-1">{key}:</div>
                                  <div className="text-gray-600">{String(value)}</div>
                                </div>
                              ));
                            }
                            return '无详细回答内容';
                          })()}
                        </div>
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

              {/* 七问答案 - 始终显示所有问题，标记已回答/未回答 */}
              <Separator />
              <div className="bg-gradient-to-br from-indigo-50 to-blue-100 border-l-4 border-indigo-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-indigo-900">
                  <HelpCircle className="h-6 w-6 mr-3 text-indigo-600" />
                  持续跟进落实健康的七问（全部7个问题）
                </h3>

                <div className="space-y-4">
                  {SEVEN_QUESTIONS.map((q, index) => {
                    const answers = selectedUser.requirements?.sevenQuestionsAnswers;
                    const answerDict = answers as Record<string, any>;
                    const answerData = answerDict?.[q.id.toString()];
                    const answer = typeof answerData === 'object' && answerData !== null ? answerData.answer : answerData;
                    const date = typeof answerData === 'object' && answerData !== null ? answerData.date : null;
                    const hasAnswer = answer !== null && answer !== undefined && answer !== '';

                    return (
                      <div key={index} className={`bg-white p-5 rounded-lg shadow-sm border ${hasAnswer ? 'border-green-300' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${hasAnswer ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-lg text-indigo-900 mb-2">
                              {q.question}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              {q.description}
                            </div>
                            <div className={`p-3 rounded-lg ${hasAnswer ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                              {hasAnswer ? (
                                <div>
                                  <div className="text-gray-700 leading-relaxed">{answer}</div>
                                  {date && (
                                    <div className="text-xs text-green-600 mt-2">
                                      填写时间：{formatDate(date)}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm italic">
                                  未填写
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* 不良生活习惯自检表 - 显示所有252项，标记选中/未选中 */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-100 border-l-4 border-pink-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-pink-900">
                  <AlertCircle className="h-6 w-6 mr-3 text-pink-600" />
                  不良生活习惯自检表（全部252项）
                </h3>

                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-100 text-center">
                    <div className="text-sm text-pink-600 mb-1">已选中 / 总计</div>
                    <div className="font-bold text-3xl text-pink-700">
                      {(() => {
                        const habitIds = selectedUser.requirements?.badHabitsChecklist || [];
                        const totalHabits = Object.values(BAD_HABITS_CHECKLIST).flat().length;
                        return `${Array.isArray(habitIds) ? habitIds.length : 0} / ${totalHabits}`;
                      })()}
                    </div>
                  </div>

                  {(() => {
                    const habitIds = selectedUser.requirements?.badHabitsChecklist || [];
                    const habitSet = new Set(Array.isArray(habitIds) ? habitIds : []);

                    return Object.entries(BAD_HABITS_CHECKLIST).map(([category, habits]) => (
                      <div key={category} className="bg-white p-6 rounded-lg shadow-sm border border-pink-100">
                        <h4 className="font-semibold text-pink-700 mb-4">{category} ({habits.length}项)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {habits.map((habit: any) => {
                            const isSelected = habitSet.has(habit.id);
                            return (
                              <div key={habit.id} className={`p-3 rounded-lg border-2 ${isSelected ? 'bg-pink-50 border-pink-400' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-start gap-2">
                                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-pink-500' : 'bg-gray-300'}`}>
                                    {isSelected ? (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    ) : null}
                                  </div>
                                  <div className="flex-1">
                                    <div className={`font-medium text-sm ${isSelected ? 'text-pink-900' : 'text-gray-600'}`}>
                                      #{habit.id} {habit.habit}
                                    </div>
                                    {habit.impact && (
                                      <div className="text-xs text-red-600 mt-1">{habit.impact}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <Separator />

              {/* 身体语言简表（100项）- 显示所有症状，标记选中/未选中 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-l-4 border-green-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-green-900">
                  <FileText className="h-6 w-6 mr-3 text-green-600" />
                  身体语言简表（全部100项）
                </h3>

                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100 text-center">
                    <div className="text-sm text-green-600 mb-1">已选中 / 总计</div>
                    <div className="font-bold text-3xl text-green-700">
                      {(() => {
                        const latestSymptomCheck = getLatestSymptomCheck();
                        const symptomIds = latestSymptomCheck?.checkedSymptoms || [];
                        return `${symptomIds.length} / ${BODY_SYMPTOMS.length}`;
                      })()}
                    </div>
                  </div>

                  {(() => {
                    const latestSymptomCheck = getLatestSymptomCheck();
                    const symptomIds = latestSymptomCheck?.checkedSymptoms || [];
                    const symptomSet = new Set(symptomIds.map((id: string) => parseInt(id)));

                    // 按类别分组
                    const symptomsByCategory = BODY_SYMPTOMS.reduce((acc, symptom) => {
                      if (!acc[symptom.category]) acc[symptom.category] = [];
                      acc[symptom.category].push(symptom);
                      return acc;
                    }, {} as Record<string, any[]>);

                    return Object.entries(symptomsByCategory).map(([category, symptoms]) => (
                      <div key={category} className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
                        <h4 className="font-semibold text-green-700 mb-4">{category} ({symptoms.length}项)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {symptoms.map((symptom: any) => {
                            const isSelected = symptomSet.has(symptom.id);
                            return (
                              <div key={symptom.id} className={`p-3 rounded-lg border-2 ${isSelected ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-start gap-2">
                                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    {isSelected ? (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    ) : null}
                                  </div>
                                  <div className="flex-1">
                                    <div className={`font-medium text-sm ${isSelected ? 'text-green-900' : 'text-gray-600'}`}>
                                      #{symptom.id} {symptom.name}
                                    </div>
                                    {symptom.description && (
                                      <div className="text-xs text-green-600 mt-1">{symptom.description}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <Separator />

              {/* 300项症状自检表 - 显示所有症状，标记选中/未选中 */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border-l-4 border-amber-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-amber-900">
                  <FileText className="h-6 w-6 mr-3 text-amber-600" />
                  300项症状自检表（全部300项）
                </h3>

                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100 text-center">
                    <div className="text-sm text-amber-600 mb-1">已选中 / 总计</div>
                    <div className="font-bold text-3xl text-amber-700">
                      {(() => {
                        const symptomIds = selectedUser.requirements?.symptoms300Checklist || [];
                        return `${Array.isArray(symptomIds) ? symptomIds.length : 0} / ${BODY_SYMPTOMS_300.length}`;
                      })()}
                    </div>
                  </div>

                  {(() => {
                    const symptomIds = selectedUser.requirements?.symptoms300Checklist || [];
                    const symptomSet = new Set(Array.isArray(symptomIds) ? symptomIds : []);

                    // 按类别分组
                    const symptomsByCategory = BODY_SYMPTOMS_300.reduce((acc, symptom) => {
                      if (!acc[symptom.category]) acc[symptom.category] = [];
                      acc[symptom.category].push(symptom);
                      return acc;
                    }, {} as Record<string, any[]>);

                    return Object.entries(symptomsByCategory).map(([category, symptoms]) => (
                      <div key={category} className="bg-white p-6 rounded-lg shadow-sm border border-amber-100">
                        <h4 className="font-semibold text-amber-700 mb-4">{category} ({symptoms.length}项)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {symptoms.map((symptom: any) => {
                            const isSelected = symptomSet.has(symptom.id);
                            return (
                              <div key={symptom.id} className={`p-2 rounded-lg border-2 ${isSelected ? 'bg-amber-50 border-amber-400' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-start gap-2">
                                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-amber-500' : 'bg-gray-300'}`}>
                                    {isSelected ? (
                                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                                    ) : null}
                                  </div>
                                  <div className="flex-1">
                                    <div className={`font-medium text-xs ${isSelected ? 'text-amber-900' : 'text-gray-600'}`}>
                                      #{symptom.id} {symptom.name}
                                    </div>
                                    {symptom.description && (
                                      <div className="text-xs text-purple-600 mt-0.5 leading-tight">{symptom.description}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <Separator />

              {/* 个性化健康管理方案 - 红色渐变背景 */}
              <div className="bg-gradient-to-br from-red-50 to-rose-100 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center text-red-900">
                  <Sparkles className="h-6 w-6 mr-3 text-red-600" />
                  个性化健康管理方案
                </h3>

                {(() => {
                  const latestSymptomCheck = getLatestSymptomCheck();
                  const latestAnalysis = getLatestHealthAnalysis();
                  const latestChoice = getLatestChoice();

                  if (!latestSymptomCheck && !latestAnalysis && !latestChoice) {
                    return (
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100 text-center">
                        <Sparkles className="h-12 w-12 mx-auto text-red-300 mb-3" />
                        <p className="text-red-600 font-medium">暂无个性化方案数据</p>
                        <p className="text-sm text-red-500 mt-1">用户尚未完成健康自检，无法生成个性化方案</p>
                      </div>
                    );
                  }

                  // 计算主要健康要素
                  const symptomIds = latestSymptomCheck?.checkedSymptoms || [];
                  const selectedSymptoms = symptomIds.map((id: string) => parseInt(id));
                  
                  const getPrimaryElements = () => {
                    if (!latestSymptomCheck?.elementScores) return [];
                    const elementScores = latestSymptomCheck.elementScores as Record<string, number>;
                    return Object.entries(elementScores)
                      .filter(([_, count]) => count > 0)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .slice(0, 3)
                      .map(([name, count]) => ({ name, count: Number(count) }));
                  };

                  const primaryElements = getPrimaryElements();

                  // 计算重点改善症状
                  const getTargetSymptoms = () => {
                    if (!selectedSymptoms || selectedSymptoms.length === 0) return [];
                    // 取选中症状的前5个作为重点症状
                    return selectedSymptoms.slice(0, 5).map((id: number) => BODY_SYMPTOMS.find(s => s.id === id)).filter(Boolean);
                  };

                  const targetSymptoms = getTargetSymptoms();

                  // 计算推荐的调理产品
                  const getRecommendedProducts = () => {
                    const products: any[] = [];
                    const elementNames = primaryElements.map(el => el.name);

                    // 艾灸 - 适合气血、寒凉、循环问题
                    if (elementNames.includes('气血') || elementNames.includes('寒凉') || elementNames.includes('循环')) {
                      products.push({
                        name: '艾灸调理',
                        description: '通过艾灸穴位，温通经络，调和气血，驱寒除湿，改善寒凉和气血不足问题',
                        icon: Activity,
                        color: 'from-orange-500 to-red-500',
                        matchScore: 5,
                        reasons: [
                          '温通经络，促进气血运行',
                          '驱寒除湿，改善寒凉体质',
                          '增强免疫力，提升身体自愈能力',
                          '调理慢性炎症，缓解疼痛'
                        ]
                      });
                    }

                    // 火灸 - 适合气血、毒素、循环问题
                    if (elementNames.includes('气血') || elementNames.includes('毒素') || elementNames.includes('循环')) {
                      products.push({
                        name: '火灸调理',
                        description: '以火之力，温阳散寒，活血化瘀，祛除体内毒素和淤堵',
                        icon: Flame,
                        color: 'from-red-500 to-orange-600',
                        matchScore: 5,
                        reasons: [
                          '强力活血化瘀，疏通经络',
                          '温阳补气，提升身体能量',
                          '祛除毒素，净化体内环境',
                          '改善循环，促进新陈代谢'
                        ]
                      });
                    }

                    // 正骨 - 适合骨骼、肌肉、循环问题
                    if (elementNames.includes('循环') || elementNames.includes('气血') || 
                        selectedSymptoms.some((s: number) => [30, 31, 32, 33, 34, 35, 60, 61, 62, 63].includes(s))) {
                      products.push({
                        name: '正骨调理',
                        description: '通过手法矫正骨骼位置，恢复脊柱生理曲度，改善神经受压和循环障碍',
                        icon: Target,
                        color: 'from-blue-500 to-purple-500',
                        matchScore: 4,
                        reasons: [
                          '矫正骨骼位置，恢复脊柱健康',
                          '解除神经压迫，缓解疼痛',
                          '改善循环，促进气血运行',
                          '矫正体态，提升整体健康'
                        ]
                      });
                    }

                    // 空腹禅 - 身心调理，适合情绪、毒素、气血问题
                    if (elementNames.includes('情绪') || elementNames.includes('毒素') || elementNames.includes('气血') || elementNames.includes('血脂')) {
                      products.push({
                        name: '空腹禅调理',
                        description: '通过空腹禅修，净化身心，清理毒素，调和气血，平衡情绪',
                        icon: Heart,
                        color: 'from-green-500 to-teal-500',
                        matchScore: 4,
                        reasons: [
                          '净化身心，清理体内毒素',
                          '调和气血，提升生命能量',
                          '平衡情绪，释放心理压力',
                          '改善睡眠，提升整体健康'
                        ]
                      });
                    }

                    // 经络调理 - 适合循环、气血、毒素问题
                    if (elementNames.includes('循环') || elementNames.includes('气血') || elementNames.includes('毒素')) {
                      products.push({
                        name: '经络调理',
                        description: '通过疏通经络，促进气血运行，清除淤堵，恢复身体平衡',
                        icon: Zap,
                        color: 'from-yellow-500 to-orange-500',
                        matchScore: 4,
                        reasons: [
                          '疏通经络，恢复气血运行',
                          '清除淤堵，改善循环',
                          '调和脏腑功能，增强免疫力',
                          '缓解疼痛，提升生活质量'
                        ]
                      });
                    }

                    // 药王产品 - 综合调理
                    products.push({
                      name: '药王产品',
                      description: '传统药王配方产品，针对性调理您的健康问题，标本兼治',
                      icon: Droplets,
                      color: 'from-green-600 to-emerald-500',
                      matchScore: 3,
                      reasons: [
                        '天然药材，安全有效',
                        '传统配方，传承千年',
                        '标本兼治，综合调理',
                        '个性化定制，精准调理'
                      ]
                    });

                    return products.sort((a, b) => b.matchScore - a.matchScore);
                  };

                  const recommendedProducts = getRecommendedProducts();

                  // 推荐的学习课程
                  const getRecommendedCourses = () => {
                    return TWENTY_ONE_COURSES.map((course: any) => {
                      let relevance: 'high' | 'medium' | 'low' = 'low';
                      const primaryElementNames = primaryElements.map(el => el.name);

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
                    });
                  };

                  const recommendedCourses = getRecommendedCourses();

                  // 分阶段调理计划
                  const getPhasedPlan = () => {
                    const plan = {
                      foundation: {
                        name: '基础期（第1-2个月）',
                        goals: ['调理体质', '建立健康习惯', '改善症状'],
                        actions: [] as string[]
                      },
                      enhancement: {
                        name: '强化期（第3-4个月）',
                        goals: ['强化疗效', '深度调理', '巩固成果'],
                        actions: [] as string[]
                      },
                      consolidation: {
                        name: '巩固期（第5-6个月）',
                        goals: ['巩固疗效', '维持健康', '预防复发'],
                        actions: [] as string[]
                      }
                    };

                    // 根据健康要素添加具体建议
                    const elementNames = primaryElements.map(el => el.name);
                    
                    if (elementNames.includes('气血')) {
                      plan.foundation.actions.push('食用补气血食物（红枣、桂圆、山药等）');
                      plan.foundation.actions.push('保证充足睡眠，每晚23:00前入睡');
                      plan.enhancement.actions.push('适当运动，促进气血生成');
                      plan.consolidation.actions.push('定期食用药膳，维持气血充盈');
                    }

                    if (elementNames.includes('循环')) {
                      plan.foundation.actions.push('温水泡脚，改善末梢循环');
                      plan.foundation.actions.push('每天运动30分钟，促进血液循环');
                      plan.enhancement.actions.push('定期按摩推拿，疏通经络');
                      plan.consolidation.actions.push('坚持运动习惯，保持循环通畅');
                    }

                    if (elementNames.includes('毒素')) {
                      plan.foundation.actions.push('每天喝足够的水（2000ml以上）');
                      plan.foundation.actions.push('多吃纤维食物，促进肠道排毒');
                      plan.enhancement.actions.push('定期运动出汗，促进皮肤排毒');
                      plan.consolidation.actions.push('养成健康饮食习惯，避免毒素积累');
                    }

                    if (elementNames.includes('寒凉')) {
                      plan.foundation.actions.push('温热饮食，少食生冷');
                      plan.foundation.actions.push('注意保暖，避免寒气入侵');
                      plan.enhancement.actions.push('艾灸调理，温阳散寒');
                      plan.consolidation.actions.push('继续温热饮食，保持身体温暖');
                    }

                    if (elementNames.includes('免疫')) {
                      plan.foundation.actions.push('保证充足睡眠，修复免疫系统');
                      plan.foundation.actions.push('均衡营养，补充维生素矿物质');
                      plan.enhancement.actions.push('适量运动，激活免疫细胞');
                      plan.consolidation.actions.push('保持健康生活方式，维持免疫力');
                    }

                    if (elementNames.includes('情绪')) {
                      plan.foundation.actions.push('学习情绪管理技巧');
                      plan.foundation.actions.push('适度运动，释放压力');
                      plan.enhancement.actions.push('练习冥想，平衡心态');
                      plan.consolidation.actions.push('保持积极心态，学会自我调节');
                    }

                    if (elementNames.includes('血脂')) {
                      plan.foundation.actions.push('低脂饮食，减少饱和脂肪摄入');
                      plan.foundation.actions.push('增加运动，促进脂肪消耗');
                      plan.enhancement.actions.push('控制体重，减少内脏脂肪');
                      plan.consolidation.actions.push('定期体检，监测血脂水平');
                    }

                    return plan;
                  };

                  const phasedPlan = getPhasedPlan();

                  return (
                    <div className="space-y-8">
                      {/* 健康状况总结 */}
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                        <h4 className="font-bold text-lg text-red-800 mb-4">健康状况总结</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 重点改善症状 */}
                          {targetSymptoms.length > 0 && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                              <h5 className="text-base font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                                <Target className="w-5 h-5 mr-2 text-blue-600" />
                                重点改善症状
                              </h5>
                              <div className="space-y-2">
                                {targetSymptoms.map((symptom: any, index: number) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-sm font-medium text-gray-700">#{symptom.id} {symptom.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 主要健康要素 */}
                          {primaryElements.length > 0 && (
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                              <h5 className="text-base font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                                主要健康要素
                              </h5>
                              <div className="space-y-2">
                                {primaryElements.map((el: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">{el.name}</span>
                                    <Badge variant="secondary" className="text-xs">{el.count} 项症状</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 方案类型 */}
                        {latestChoice && (
                          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                            <h5 className="text-base font-semibold mb-2 text-gray-700 dark:text-gray-300">选择方案</h5>
                            <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                              {latestChoice.planType}
                            </p>
                            {latestChoice.planDescription && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{latestChoice.planDescription}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 推荐调理产品 */}
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                        <h4 className="font-bold text-lg text-red-800 mb-4 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-red-600" />
                          推荐调理产品
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {recommendedProducts.map((product, index) => {
                            const Icon = product.icon;
                            return (
                              <div key={index} className="border-2 border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow rounded-lg p-4">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className={`w-10 h-10 bg-gradient-to-br ${product.color} rounded-lg flex items-center justify-center`}>
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-base">{product.name}</div>
                                    <Badge variant="secondary" className="text-xs mt-1">
                                      匹配度: {Math.min(95, 70 + product.matchScore * 5)}%
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                                  {product.description}
                                </p>
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-gray-900 dark:text-white">调理作用：</p>
                                  {product.reasons.map((reason: string, idx: number) => (
                                    <p key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                                      <span className="text-green-500 mr-1">•</span>
                                      {reason}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 推荐学习课程 */}
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                        <h4 className="font-bold text-lg text-red-800 mb-4 flex items-center">
                          <BookOpen className="w-5 h-5 mr-2 text-red-600" />
                          推荐学习课程
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {recommendedCourses.slice(0, 9).map((course: any) => (
                            <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  第{course.id}课
                                </Badge>
                                {course.relevance === 'high' && (
                                  <Badge className="text-xs bg-red-500">重点</Badge>
                                )}
                              </div>
                              <div className="font-semibold text-sm mb-1">{course.title}</div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {course.content}
                              </p>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                📚 {course.duration}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 分阶段调理计划 */}
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                        <h4 className="font-bold text-lg text-red-800 mb-4 flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-red-600" />
                          分阶段调理计划
                        </h4>
                        <div className="space-y-6">
                          {/* 基础期 */}
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-base text-green-800">{phasedPlan.foundation.name}</h5>
                              <Badge className="bg-green-600 text-white text-xs">第一阶段</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-green-700 mb-2">主要目标：</p>
                                <div className="space-y-1">
                                  {phasedPlan.foundation.goals.map((goal: string, idx: number) => (
                                    <p key={idx} className="text-xs text-gray-700 flex items-center">
                                      <span className="text-green-500 mr-1">✓</span>
                                      {goal}
                                    </p>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-green-700 mb-2">具体措施：</p>
                                <div className="space-y-1">
                                  {phasedPlan.foundation.actions.length > 0 ? (
                                    phasedPlan.foundation.actions.map((action: string, idx: number) => (
                                      <p key={idx} className="text-xs text-gray-700 flex items-center">
                                        <span className="text-green-500 mr-1">•</span>
                                        {action}
                                      </p>
                                    ))
                                  ) : (
                                    <p className="text-xs text-gray-500 italic">暂无具体措施</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 强化期 */}
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-base text-blue-800">{phasedPlan.enhancement.name}</h5>
                              <Badge className="bg-blue-600 text-white text-xs">第二阶段</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-blue-700 mb-2">主要目标：</p>
                                <div className="space-y-1">
                                  {phasedPlan.enhancement.goals.map((goal: string, idx: number) => (
                                    <p key={idx} className="text-xs text-gray-700 flex items-center">
                                      <span className="text-blue-500 mr-1">✓</span>
                                      {goal}
                                    </p>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-blue-700 mb-2">具体措施：</p>
                                <div className="space-y-1">
                                  {phasedPlan.enhancement.actions.length > 0 ? (
                                    phasedPlan.enhancement.actions.map((action: string, idx: number) => (
                                      <p key={idx} className="text-xs text-gray-700 flex items-center">
                                        <span className="text-blue-500 mr-1">•</span>
                                        {action}
                                      </p>
                                    ))
                                  ) : (
                                    <p className="text-xs text-gray-500 italic">暂无具体措施</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 巩固期 */}
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-base text-purple-800">{phasedPlan.consolidation.name}</h5>
                              <Badge className="bg-purple-600 text-white text-xs">第三阶段</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-purple-700 mb-2">主要目标：</p>
                                <div className="space-y-1">
                                  {phasedPlan.consolidation.goals.map((goal: string, idx: number) => (
                                    <p key={idx} className="text-xs text-gray-700 flex items-center">
                                      <span className="text-purple-500 mr-1">✓</span>
                                      {goal}
                                    </p>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-purple-700 mb-2">具体措施：</p>
                                <div className="space-y-1">
                                  {phasedPlan.consolidation.actions.length > 0 ? (
                                    phasedPlan.consolidation.actions.map((action: string, idx: number) => (
                                      <p key={idx} className="text-xs text-gray-700 flex items-center">
                                        <span className="text-purple-500 mr-1">•</span>
                                        {action}
                                      </p>
                                    ))
                                  ) : (
                                    <p className="text-xs text-gray-500 italic">暂无具体措施</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 重要提示 */}
                      <Alert className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                        <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <AlertDescription className="mt-2">
                          <p className="font-semibold text-gray-900 dark:text-white mb-2">
                            重要提示
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            以上调理方案仅供参考，具体调理方法和产品选择请咨询专业调理导师。
                            调理过程中如出现不适，请及时暂停并寻求专业指导。
                            方案生成时间：{new Date().toLocaleString('zh-CN')}
                          </p>
                        </AlertDescription>
                      </Alert>
                    </div>
                  );
                })()}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 历史记录对比对话框 */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">历史记录对比</DialogTitle>
            <DialogDescription>
              {historyPhone} 的所有填写记录（共 {historyUsers.length} 次）
            </DialogDescription>
          </DialogHeader>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-2" />
              <span>加载中...</span>
            </div>
          ) : historyUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无历史记录
            </div>
          ) : (
            <div className="space-y-6">
              {/* 历史记录时间轴 */}
              <div className="space-y-4">
                {historyUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className={`relative pl-8 pb-6 border-l-4 ${
                      user.isLatestVersion
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {/* 时间点标记 */}
                    <div className={`absolute left-0 top-0 w-6 h-6 -translate-x-1/2 rounded-full border-4 ${
                      user.isLatestVersion
                        ? 'bg-green-500 border-white shadow-lg'
                        : 'bg-gray-300 border-white'
                    }`} />

                    {/* 标题 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">
                          第 {historyUsers.length - index} 次填写
                          {user.isLatestVersion && (
                            <Badge className="ml-2 bg-green-500">最新版本</Badge>
                          )}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowHistoryDialog(false);
                          handleViewDetail(user.id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看详情
                      </Button>
                    </div>

                    {/* 基本信息 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-xs text-gray-500 mb-1">姓名</div>
                        <div className="font-semibold">{user.name || '-'}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-xs text-gray-500 mb-1">年龄</div>
                        <div className="font-semibold">{user.age || '-'}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-xs text-gray-500 mb-1">性别</div>
                        <div className="font-semibold">{user.gender || '-'}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-xs text-gray-500 mb-1">BMI</div>
                        <div className="font-semibold">
                          {user.bmi && !isNaN(Number(user.bmi)) ? Number(user.bmi).toFixed(1) : '-'}
                        </div>
                      </div>
                    </div>

                    {/* 身体数据对比 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {user.weight && (
                        <div className="bg-white p-3 rounded-lg shadow-sm border">
                          <div className="text-xs text-gray-500 mb-1">体重</div>
                          <div className="font-semibold">{user.weight} kg</div>
                        </div>
                      )}
                      {user.height && (
                        <div className="bg-white p-3 rounded-lg shadow-sm border">
                          <div className="text-xs text-gray-500 mb-1">身高</div>
                          <div className="font-semibold">{user.height} cm</div>
                        </div>
                      )}
                      {user.bloodPressure && (
                        <div className="bg-white p-3 rounded-lg shadow-sm border">
                          <div className="text-xs text-gray-500 mb-1">血压</div>
                          <div className="font-semibold">{user.bloodPressure} mmHg</div>
                        </div>
                      )}
                      {user.occupation && (
                        <div className="bg-white p-3 rounded-lg shadow-sm border">
                          <div className="text-xs text-gray-500 mb-1">职业</div>
                          <div className="font-semibold">{user.occupation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 对比说明 */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-bold">对比说明</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>每次填写都会创建独立的记录，便于对比不同时期的健康状况</li>
                    <li>最新版本会用绿色标记，方便识别当前数据</li>
                    <li>点击"查看详情"可以查看该次填写的完整数据</li>
                    <li>通过对比可以观察健康指标的变化趋势</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
