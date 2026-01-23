'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { LogOut, Users, FileText, Activity, CheckCircle, AlertCircle, Eye, ChevronLeft, ChevronRight, Download, Search, X, TrendingUp, Target } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, [currentPage, searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      window.location.href = '/admin/login';
    }
  };

  const fetchUsers = async () => {
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
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
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
    return d.toLocaleString('zh-CN');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">管理后台</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">用户数据管理中心</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handleExport(false)}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">导出数据</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-500" />
                总用户数
              </CardDescription>
              <CardTitle className="text-3xl text-blue-600">{users.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-green-500" />
                完成自检
              </CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {users.filter((u) => u.latestSymptomCheck).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-500" />
                完成分析
              </CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {users.filter((u) => u.latestHealthAnalysis).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center">
                <Target className="w-4 h-4 mr-2 text-purple-500" />
                已选方案
              </CardDescription>
              <CardTitle className="text-3xl text-purple-600">
                {users.filter((u) => u.latestChoice).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 用户列表 */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>查看和管理所有用户数据</CardDescription>
              </div>
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索姓名或手机号..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white w-full sm:w-64"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => handleSearchChange('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button type="submit" size="sm">
                  搜索
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无数据</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>手机号</TableHead>
                      <TableHead>年龄</TableHead>
                      <TableHead>性别</TableHead>
                      <TableHead>自检状态</TableHead>
                      <TableHead>分析状态</TableHead>
                      <TableHead>选择方案</TableHead>
                      <TableHead>要求完成度</TableHead>
                      <TableHead>注册时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((item) => (
                      <TableRow key={item.user.id}>
                        <TableCell className="font-medium">{item.user.name || '-'}</TableCell>
                        <TableCell>{item.user.phone || '-'}</TableCell>
                        <TableCell>{item.user.age || '-'}</TableCell>
                        <TableCell>{item.user.gender || '-'}</TableCell>
                        <TableCell>
                          {item.latestSymptomCheck ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              已完成
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              未完成
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.latestHealthAnalysis ? (
                            <Badge variant="default" className="bg-blue-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              已完成
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              未完成
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.latestChoice ? (
                            <Badge variant="default" className="bg-purple-500">
                              {item.latestChoice.planType}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              未选择
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 transition-all"
                                style={{
                                  width: `${calculateRequirementsProgress(item.requirements)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {calculateRequirementsProgress(item.requirements)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(item.user.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(item.user.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* 分页 */}
            {users.length > 0 && (
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一页
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  第 {currentPage} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={users.length < itemsPerPage}
                >
                  下一页
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 用户详情对话框 - 优化版 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">用户详细信息</DialogTitle>
            <DialogDescription>查看用户的完整健康数据</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* 用户基本信息卡片 */}
              <Card className="border-2 border-blue-100">
                <CardHeader className="bg-blue-50 dark:bg-blue-950">
                  <CardTitle className="flex items-center text-lg">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">姓名</span>
                      <span className="font-semibold text-lg">{selectedUser.user?.name || '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">手机号</span>
                      <span className="font-semibold text-lg">{selectedUser.user?.phone || '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">邮箱</span>
                      <span className="font-medium">{selectedUser.user?.email || '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">年龄</span>
                      <span className="font-medium">{selectedUser.user?.age ? `${selectedUser.user.age}岁` : '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">性别</span>
                      <span className="font-medium">{selectedUser.user?.gender || '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">注册时间</span>
                      <span className="font-medium text-sm">{formatDate(selectedUser.user?.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* 症状自检记录 */}
              <Card className="border-2 border-green-100">
                <CardHeader className="bg-green-50 dark:bg-green-950">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <FileText className="w-5 h-5 mr-2 text-green-600" />
                      症状自检记录
                    </CardTitle>
                    {selectedUser.symptomChecks.length > 0 && (
                      <Badge variant="default" className="bg-green-600">
                        {selectedUser.symptomChecks.length} 条记录
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {selectedUser.symptomChecks.length > 0 ? (
                    <div className="space-y-4">
                      {selectedUser.symptomChecks.map((check: any, index: number) => (
                        <div key={check.id} className="p-4 bg-gradient-to-r from-green-50 to-white dark:from-green-950 dark:to-gray-900 rounded-lg border border-green-100">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">检查时间：</span>
                                <span className="font-medium text-sm">{formatDate(check.checkedAt)}</span>
                              </div>
                              <Badge className="bg-green-600">
                                <Target className="w-3 h-3 mr-1" />
                                总分：{check.totalScore || 0} 分
                              </Badge>
                            </div>
                          </div>

                          {/* 选中的症状数量 */}
                          <div className="mb-3 p-3 bg-white dark:bg-gray-800 rounded-md">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-green-700">选中症状</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-3xl font-bold text-green-600">
                                {Array.isArray(check.checkedSymptoms) ? check.checkedSymptoms.length : 0}
                              </div>
                              <span className="text-gray-600">项症状</span>
                            </div>
                          </div>

                          {/* 各要素得分 */}
                          {check.elementScores && typeof check.elementScores === 'object' && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 mb-3">
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold text-blue-700">各要素得分</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {HEALTH_ELEMENTS.map((element) => {
                                  const score = check.elementScores[element.key] || 0;
                                  const percentage = Math.min((score / 10) * 100, 100);
                                  return (
                                    <div key={element.key} className="bg-white dark:bg-gray-800 p-3 rounded-md border">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{element.label}</span>
                                        <Badge className={element.color + ' text-white text-xs'}>
                                          {score} 分
                                        </Badge>
                                      </div>
                                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full ${element.color} transition-all duration-500`}
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">暂无自检记录</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* 健康要素分析 */}
              <Card className="border-2 border-blue-100">
                <CardHeader className="bg-blue-50 dark:bg-blue-950">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      健康要素分析
                    </CardTitle>
                    {selectedUser.healthAnalysis.length > 0 && (
                      <Badge variant="default" className="bg-blue-600">
                        {selectedUser.healthAnalysis.length} 条记录
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {selectedUser.healthAnalysis.length > 0 ? (
                    <div className="space-y-4">
                      {selectedUser.healthAnalysis.map((analysis: any) => (
                        <div key={analysis.id} className="p-4 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950 dark:to-gray-900 rounded-lg border border-blue-100">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-500">分析时间：{formatDate(analysis.analyzedAt)}</span>
                            <Badge className="bg-blue-600">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              整体得分：{analysis.overallHealth || 0} 分
                            </Badge>
                          </div>

                          {/* 各要素得分 - 用进度条展示 */}
                          <div className="space-y-3">
                            {HEALTH_ELEMENTS.map((element) => {
                              const score = analysis[element.key] || 0;
                              const percentage = Math.min((score / 10) * 100, 100);
                              return (
                                <div key={element.key} className="bg-white dark:bg-gray-800 p-3 rounded-md">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-2 h-2 rounded-full ${element.color}`} />
                                      <span className="font-medium text-sm">{element.label}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className={`font-bold text-lg ${element.textColor}`}>{score}</span>
                                      <span className="text-sm text-gray-500">分</span>
                                    </div>
                                  </div>
                                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${element.color} transition-all duration-500`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">暂无分析记录</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* 方案选择 */}
              <Card className="border-2 border-purple-100">
                <CardHeader className="bg-purple-50 dark:bg-purple-950">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Target className="w-5 h-5 mr-2 text-purple-600" />
                      方案选择
                    </CardTitle>
                    {selectedUser.userChoices.length > 0 && (
                      <Badge variant="default" className="bg-purple-600">
                        {selectedUser.userChoices.length} 条记录
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {selectedUser.userChoices.length > 0 ? (
                    <div className="space-y-4">
                      {selectedUser.userChoices.map((choice: any) => (
                        <div key={choice.id} className="p-4 bg-gradient-to-r from-purple-50 to-white dark:from-purple-950 dark:to-gray-900 rounded-lg border border-purple-100">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="default" className="bg-purple-600 text-base px-4 py-1">
                              {choice.planType}
                            </Badge>
                            <span className="text-sm text-gray-500">{formatDate(choice.selectedAt)}</span>
                          </div>
                          {choice.planDescription && (
                            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-md">
                              <p className="text-gray-700 dark:text-gray-300">{choice.planDescription}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">暂无选择记录</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* 四个要求完成情况 */}
              <Card className="border-2 border-orange-100">
                <CardHeader className="bg-orange-50 dark:bg-orange-950">
                  <CardTitle className="flex items-center text-lg">
                    <CheckCircle className="w-5 h-5 mr-2 text-orange-600" />
                    四个要求完成情况
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {selectedUser.requirements ? (
                    <div className="space-y-4">
                      {/* 完成进度概览 */}
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-white dark:from-orange-950 dark:to-gray-900 rounded-lg border border-orange-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-700">总体完成度</span>
                          <Badge className="bg-orange-600">
                            {calculateRequirementsProgress(selectedUser.requirements)}%
                          </Badge>
                        </div>
                        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                            style={{ width: `${calculateRequirementsProgress(selectedUser.requirements)}%` }}
                          />
                        </div>
                      </div>

                      {/* 各要求完成状态 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: 'requirement1Completed', label: '要求1：认真填写身体语言简表' },
                          { key: 'requirement2Completed', label: '要求2：针对性学习' },
                          { key: 'requirement3Completed', label: '要求3：按方案调理' },
                          { key: 'requirement4Completed', label: '要求4：定期反馈' },
                        ].map((req) => {
                          const isCompleted = selectedUser.requirements[req.key as keyof typeof selectedUser.requirements];
                          return (
                            <div
                              key={req.key}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                isCompleted
                                  ? 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700'
                                  : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {isCompleted ? (
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                      <AlertCircle className="w-5 h-5 text-gray-500" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-sm">{req.label}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {isCompleted ? '已完成' : '未完成'}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant={isCompleted ? "default" : "outline"} className={isCompleted ? 'bg-green-600' : 'text-gray-500'}>
                                  {isCompleted ? '✓ 完成' : '○ 未完成'}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {selectedUser.requirements.completedAt && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm text-blue-700 dark:text-blue-300">
                          🎉 全部完成时间：{formatDate(selectedUser.requirements.completedAt)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">暂无要求完成记录</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
