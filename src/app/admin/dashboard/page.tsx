'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogOut, Users, FileText, Activity, CheckCircle, AlertCircle, Eye, ChevronLeft, ChevronRight, Download, Search, X } from 'lucide-react';

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
    setCurrentPage(1); // 重置到第一页
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
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>总用户数</CardDescription>
              <CardTitle className="text-3xl">{users.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>完成自检</CardDescription>
              <CardTitle className="text-3xl">
                {users.filter((u) => u.latestSymptomCheck).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>完成分析</CardDescription>
              <CardTitle className="text-3xl">
                {users.filter((u) => u.latestHealthAnalysis).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>已选择方案</CardDescription>
              <CardTitle className="text-3xl">
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

      {/* 用户详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>用户详细信息</DialogTitle>
            <DialogDescription>查看用户的完整数据</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  基本信息
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">姓名：</span>
                    <span className="font-medium">{selectedUser.user?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">手机号：</span>
                    <span className="font-medium">{selectedUser.user?.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">邮箱：</span>
                    <span className="font-medium">{selectedUser.user?.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">年龄：</span>
                    <span className="font-medium">{selectedUser.user?.age || '-'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">性别：</span>
                    <span className="font-medium">{selectedUser.user?.gender || '-'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">注册时间：</span>
                    <span className="font-medium">{formatDate(selectedUser.user?.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* 症状自检 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  症状自检记录 ({selectedUser.symptomChecks.length} 条)
                </h3>
                {selectedUser.symptomChecks.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.symptomChecks.map((check: any) => (
                      <div key={check.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">
                            {formatDate(check.checkedAt)}
                          </span>
                          <Badge>总分: {check.totalScore || 0}</Badge>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">选中症状：</span>
                          <span className="font-medium">
                            {Array.isArray(check.checkedSymptoms)
                              ? check.checkedSymptoms.length
                              : 0}{' '}
                            项
                          </span>
                        </div>
                        {check.elementScores && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span>各要素得分：{JSON.stringify(check.elementScores)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">暂无自检记录</div>
                )}
              </div>

              {/* 健康要素分析 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  健康要素分析 ({selectedUser.healthAnalysis.length} 条)
                </h3>
                {selectedUser.healthAnalysis.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.healthAnalysis.map((analysis: any) => (
                      <div key={analysis.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-500 mb-2">
                          {formatDate(analysis.analyzedAt)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">气血：</span>
                            <span className="font-medium">{analysis.qiAndBlood || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">循环：</span>
                            <span className="font-medium">{analysis.circulation || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">毒素：</span>
                            <span className="font-medium">{analysis.toxins || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">血脂：</span>
                            <span className="font-medium">{analysis.bloodLipids || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">寒凉：</span>
                            <span className="font-medium">{analysis.coldness || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">免疫：</span>
                            <span className="font-medium">{analysis.immunity || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">情绪：</span>
                            <span className="font-medium">{analysis.emotions || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">整体：</span>
                            <span className="font-medium">{analysis.overallHealth || '-'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">暂无分析记录</div>
                )}
              </div>

              {/* 用户选择 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  方案选择 ({selectedUser.userChoices.length} 条)
                </h3>
                {selectedUser.userChoices.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.userChoices.map((choice: any) => (
                      <div key={choice.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="default" className="bg-purple-500">
                            {choice.planType}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDate(choice.selectedAt)}
                          </span>
                        </div>
                        {choice.planDescription && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {choice.planDescription}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">暂无选择记录</div>
                )}
              </div>

              {/* 四个要求完成情况 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  四个要求完成情况
                </h3>
                {selectedUser.requirements ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center space-x-2">
                          {selectedUser.requirements.requirement1Completed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span>要求1</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedUser.requirements.requirement2Completed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span>要求2</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedUser.requirements.requirement3Completed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span>要求3</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedUser.requirements.requirement4Completed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span>要求4</span>
                        </div>
                      </div>
                      {selectedUser.requirements.completedAt && (
                        <div className="mt-2 text-sm text-gray-500">
                          全部完成时间：{formatDate(selectedUser.requirements.completedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">暂无要求完成记录</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
