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
              {/* 基本信息 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  基本信息
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">姓名：</span>
                    <span className="font-medium">{selectedUser.user?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">手机号：</span>
                    <span className="font-medium">{selectedUser.user?.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">年龄：</span>
                    <span className="font-medium">{selectedUser.user?.age || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">性别：</span>
                    <span className="font-medium">{selectedUser.user?.gender || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">身高：</span>
                    <span className="font-medium">{selectedUser.user?.height || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">体重：</span>
                    <span className="font-medium">{selectedUser.user?.weight || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">BMI：</span>
                    <span className="font-medium">{selectedUser.user?.bmi || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">注册时间：</span>
                    <span className="font-medium">{formatDate(selectedUser.user?.createdAt)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 健康要素分析 */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  健康要素分析
                </h3>
                {getLatestHealthAnalysis() ? (
                  <div className="space-y-3">
                    {HEALTH_ELEMENTS.map((element) => {
                      const value = getLatestHealthAnalysis()![element.key as keyof typeof getLatestHealthAnalysis()];
                      return (
                        <div key={element.key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{element.label}</span>
                            <span className="font-medium">{value !== null ? `${value} 分` : '-'}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`${element.color} h-3 rounded-full transition-all`}
                              style={{ width: `${value !== null ? Math.min(value, 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">暂无健康分析数据</p>
                )}
              </div>

              <Separator />

              {/* 症状自检 */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  症状自检
                </h3>
                {getLatestSymptomCheck() ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        自检时间：{formatDate(getLatestSymptomCheck()!.checkedAt)}
                      </Badge>
                      {getLatestSymptomCheck()!.totalScore !== null && (
                        <Badge className="bg-blue-600 text-white">
                          总分：{getLatestSymptomCheck()!.totalScore}
                        </Badge>
                      )}
                    </div>
                    {getLatestSymptomCheck()!.checkedSymptoms.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getLatestSymptomCheck()!.checkedSymptoms.map((symptom, index) => (
                          <Badge key={index} variant="secondary">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">暂无症状自检数据</p>
                )}
              </div>

              <Separator />

              {/* 方案选择 */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  方案选择
                </h3>
                {getLatestChoice() ? (
                  <div className="space-y-2">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-medium text-blue-900">{getLatestChoice()!.planType}</div>
                      {getLatestChoice()!.planDescription && (
                        <div className="text-sm text-blue-700 mt-1">{getLatestChoice()!.planDescription}</div>
                      )}
                      <div className="text-xs text-blue-600 mt-2">
                        选择时间：{formatDate(getLatestChoice()!.selectedAt)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">暂未选择方案</p>
                )}
              </div>

              <Separator />

              {/* 四个要求 */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  四个要求完成情况
                </h3>
                {selectedUser.requirements ? (
                  <div className="space-y-3">
                    {['requirement1Completed', 'requirement2Completed', 'requirement3Completed', 'requirement4Completed'].map((req, index) => {
                      const isCompleted = selectedUser.requirements![req as keyof typeof selectedUser.requirements];
                      return (
                        <div key={req} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>要求 {index + 1}</span>
                          {isCompleted ? (
                            <Badge className="bg-green-600 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              已完成
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              未完成
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">暂无要求完成数据</p>
                )}
              </div>

              {selectedUser.requirements?.sevenQuestionsAnswers && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2" />
                      七问答案
                    </h3>
                    <div className="space-y-2">
                      {SEVEN_QUESTIONS.map((question, index) => {
                        const answer = selectedUser.requirements?.sevenQuestionsAnswers?.[index];
                        return (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-sm mb-1">{question}</div>
                            <div className="text-sm text-gray-600">{answer || '-'}</div>
                          </div>
                        );
                      })}
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
