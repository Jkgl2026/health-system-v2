'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, RefreshCw, Users, CheckCircle, TrendingUp, FileSpreadsheet, Search, BarChart3 } from 'lucide-react';

interface User {
  user_id: number;
  name: string;
  phone: string;
  age: number;
  gender: string;
  complete: number;
  health_status: string;
  health_score: number;
  create_time: string;
}

export default function UserListPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 分页参数
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 搜索参数
  const [keyword, setKeyword] = useState('');
  const [gender, setGender] = useState('all');

  // 对话框状态
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  // 错误提示
  const [error, setError] = useState('');

  // 统计数据
  const [stats, setStats] = useState({
    totalUsers: 0,
    completedCheck: 0,
    completedRequirement: 0,
    avgHealthScore: 0,
  });
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [page, pageSize]);

  // 实时轮询更新（每5秒）
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers();
    }, 5000);

    return () => clearInterval(interval);
  }, [page, pageSize, keyword, gender]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      const data = await response.json();
      if (data.code === 200) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('获取统计数据失败:', err);
    }
  };

  const fetchUsers = async () => {
    // 首次加载时显示加载状态，轮询时不显示
    const isFirstLoad = !lastUpdateTime;
    if (isFirstLoad) {
      setLoading(true);
    }
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (keyword) params.append('keyword', keyword);
      if (gender && gender !== 'all') params.append('gender', gender);

      const response = await fetch(`/api/user/list?${params}`);
      const data = await response.json();

      if (data.code === 200) {
        setUsers(data.data.list);
        setTotal(data.data.total);
        setLastUpdateTime(new Date());
      } else {
        setError(data.msg || '获取用户列表失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      if (isFirstLoad) {
        setLoading(false);
      }
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleReset = () => {
    setKeyword('');
    setGender('all');
    setPage(1);
    fetchUsers();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(users.map(u => u.user_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, userId]);
    } else {
      setSelectedIds(selectedIds.filter(id => id !== userId));
    }
  };

  const handleDelete = async (userId: number) => {
    setDeleteUserId(userId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deleteUserId }),
      });

      const data = await response.json();

      if (data.code === 200) {
        setShowDeleteDialog(false);
        fetchUsers();
      } else {
        setError(data.msg || '删除失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      setError('请选择要删除的用户');
      return;
    }

    setShowBatchDeleteDialog(true);
  };

  const confirmBatchDelete = async () => {
    try {
      const response = await fetch('/api/user/batchDelete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedIds }),
      });

      const data = await response.json();

      if (data.code === 200) {
        setShowBatchDeleteDialog(false);
        setSelectedIds([]);
        fetchUsers();
      } else {
        setError(data.msg || '批量删除失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (keyword) params.append('keyword', keyword);
      if (gender && gender !== 'all') params.append('gender', gender);

      window.open(`/api/user/export?${params}`, '_blank');
    } catch (err) {
      setError('导出失败，请重试');
    }
  };

  const handleCompare = () => {
    if (selectedIds.length === 0 || selectedIds.length > 3) {
      setError('请选择1-3个用户进行对比');
      return;
    }
    router.push(`/admin/user/compare?userIds=${selectedIds.join(',')}`);
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case '优秀': return 'bg-green-500';
      case '良好': return 'bg-blue-500';
      case '一般': return 'bg-yellow-500';
      case '异常': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>
            最后更新: {lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : '-'}
          </span>
          <span className="text-xs text-gray-400">(自动每5秒刷新)</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 搜索和操作栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2">姓名/手机号</label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入姓名或手机号"
              />
            </div>

            <div className="min-w-[120px]">
              <label className="block text-sm font-medium mb-2">性别</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="男">男</SelectItem>
                  <SelectItem value="女">女</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch}>搜索</Button>
              <Button variant="outline" onClick={handleReset}>清空</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => router.push('/admin/user/add')}>新增用户</Button>
        <Button variant="outline" onClick={handleExport}>导出Excel</Button>
        <Button variant="outline" onClick={handleCompare} disabled={selectedIds.length === 0}>
          对比选中用户 ({selectedIds.length}/3)
        </Button>
        <Button variant="destructive" onClick={handleBatchDelete} disabled={selectedIds.length === 0}>
          批量删除
        </Button>
        <Button variant="outline" onClick={fetchUsers}>
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 用户列表 */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={users.length > 0 && selectedIds.length === users.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="text-left py-3 px-4">用户ID</th>
                  <th className="text-left py-3 px-4">姓名</th>
                  <th className="text-left py-3 px-4">手机号</th>
                  <th className="text-left py-3 px-4">年龄</th>
                  <th className="text-left py-3 px-4">性别</th>
                  <th className="text-left py-3 px-4">完成度</th>
                  <th className="text-left py-3 px-4">健康状态</th>
                  <th className="text-left py-3 px-4">健康分数</th>
                  <th className="text-left py-3 px-4">注册时间</th>
                  <th className="text-left py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center py-8">
                      加载中...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-gray-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.user_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.user_id)}
                          onChange={(e) => handleSelectOne(user.user_id, e.target.checked)}
                        />
                      </td>
                      <td className="py-3 px-4">{user.user_id}</td>
                      <td className="py-3 px-4">
                        <Button
                          variant="link"
                          onClick={() => router.push(`/admin/user/detail?userId=${user.user_id}`)}
                          className="p-0 h-auto"
                        >
                          {user.name}
                        </Button>
                      </td>
                      <td className="py-3 px-4">{user.phone}</td>
                      <td className="py-3 px-4">{user.age}</td>
                      <td className="py-3 px-4">{user.gender}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${user.complete}%` }}
                            />
                          </div>
                          <span className="text-sm">{user.complete}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-white text-xs ${getHealthStatusColor(user.health_status)}`}>
                          {user.health_status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{user.health_score}</td>
                      <td className="py-3 px-4">{new Date(user.create_time).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/user/detail?userId=${user.user_id}`)}
                          >
                            详情
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.user_id)}
                          >
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">每页显示：</span>
              <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">
                共 {total} 条记录
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </Button>
              <span className="px-4 py-2">
                第 {page} / {Math.ceil(total / pageSize)} 页
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>确认删除</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">确定要删除该用户吗？此操作不可恢复。</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  取消
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  确认删除
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 批量删除确认对话框 */}
      {showBatchDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>确认批量删除</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                确定要删除选中的 {selectedIds.length} 个用户吗？此操作不可恢复。
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowBatchDeleteDialog(false)}>
                  取消
                </Button>
                <Button variant="destructive" onClick={confirmBatchDelete}>
                  确认删除
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
