'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pagination } from '@/components/admin/Pagination';
import { 
  LogOut, ArrowLeft, AlertTriangle, RefreshCw, Filter, 
  Eye, AlertCircle, CheckCircle, Settings, Download
} from 'lucide-react';

// 默认阈值配置
const DEFAULT_THRESHOLDS = {
  overallHealth: { value: 60, label: '综合健康分', color: 'bg-blue-500' },
  qiAndBlood: { value: 50, label: '气血', color: 'bg-red-500' },
  circulation: { value: 50, label: '循环', color: 'bg-blue-400' },
  toxins: { value: 50, label: '毒素', color: 'bg-yellow-500' },
  bloodLipids: { value: 50, label: '血脂', color: 'bg-orange-500' },
  coldness: { value: 50, label: '寒凉', color: 'bg-cyan-500' },
  immunity: { value: 50, label: '免疫', color: 'bg-green-500' },
  emotions: { value: 50, label: '情绪', color: 'bg-purple-500' },
};

interface AbnormalUser {
  user: {
    id: string;
    name: string | null;
    phone: string | null;
    age: number | null;
    gender: string | null;
  };
  analysis: {
    overallHealth: number | null;
    qiAndBlood: number | null;
    circulation: number | null;
    toxins: number | null;
    bloodLipids: number | null;
    coldness: number | null;
    immunity: number | null;
    emotions: number | null;
    analyzedAt: Date;
  };
  abnormalItems: string[];
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AbnormalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [abnormalUsers, setAbnormalUsers] = useState<AbnormalUser[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchAbnormalUsers();
  }, [pagination.page, thresholds]);

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

  const fetchAbnormalUsers = async () => {
    setLoading(true);
    try {
      // 构建阈值参数
      const thresholdsParam = JSON.stringify(
        Object.fromEntries(
          Object.entries(thresholds).map(([key, config]) => [
            key,
            { min: 0, max: config.value, label: config.label }
          ])
        )
      );

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        thresholds: thresholdsParam,
      });

      const response = await fetch(`/api/admin/abnormal?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setAbnormalUsers(data.data);
        setPagination(prev => ({ ...prev, ...data.pagination }));
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('获取异常用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThresholdChange = (key: string, value: number) => {
    setThresholds(prev => ({
      ...prev,
      [key]: { ...prev[key as keyof typeof prev], value }
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleQuickFilter = (preset: 'low' | 'medium' | 'high') => {
    const presets = {
      low: 40,
      medium: 50,
      high: 60,
    };
    const newValue = presets[preset];
    setThresholds(prev => 
      Object.fromEntries(
        Object.entries(prev).map(([key, config]) => [
          key,
          { ...config, value: newValue }
        ])
      ) as typeof DEFAULT_THRESHOLDS
    );
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = () => {
    if (abnormalUsers.length === 0) return;

    // 生成CSV数据
    const headers = ['姓名', '手机号', '年龄', '性别', '综合健康分', '异常项', '检测时间'];
    const rows = abnormalUsers.map(item => [
      item.user.name || '-',
      item.user.phone || '-',
      item.user.age || '-',
      item.user.gender || '-',
      item.analysis.overallHealth || '-',
      item.abnormalItems.join('; '),
      new Date(item.analysis.analyzedAt).toLocaleString('zh-CN'),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // 下载文件
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `异常用户筛选_${new Date().toLocaleDateString('zh-CN')}.csv`;
    link.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
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
              <div className="bg-orange-500 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">异常指标筛选</h1>
                <p className="text-xs text-gray-500">快速定位需要关注的用户</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchAbnormalUsers} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={abnormalUsers.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                导出
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
        {/* 阈值设置 */}
        <Card className="mb-6 border-orange-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-500" />
                  异常阈值设置
                </CardTitle>
                <CardDescription>
                  低于设定值将被标记为异常
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleQuickFilter('low')}>
                  宽松 (40分)
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickFilter('medium')}>
                  标准 (50分)
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickFilter('high')}>
                  严格 (60分)
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(thresholds).map(([key, config]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{config.label}</Label>
                    <Badge className={config.color}>{config.value}</Badge>
                  </div>
                  <Slider
                    value={[config.value]}
                    onValueChange={(values) => handleThresholdChange(key, values[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 统计摘要 */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-red-100">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">异常用户总数</p>
                    <p className="text-2xl font-bold text-red-600">{summary.totalAbnormal}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-100">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">综合健康分异常</p>
                    <p className="text-2xl font-bold text-blue-600">{summary.byElement?.overallHealth || 0}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-100">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">免疫力异常</p>
                    <p className="text-2xl font-bold text-green-600">{summary.byElement?.immunity || 0}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-100">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">情绪异常</p>
                    <p className="text-2xl font-bold text-purple-600">{summary.byElement?.emotions || 0}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 异常用户列表 */}
        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-orange-500" />
              异常用户列表
            </CardTitle>
            <CardDescription>
              共 {pagination.total} 个用户存在异常指标
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : abnormalUsers.length === 0 ? (
              <div className="text-center py-20">
                <CheckCircle className="h-12 w-12 mx-auto text-green-300 mb-4" />
                <p className="text-gray-500">暂无异常用户</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>手机号</TableHead>
                      <TableHead>年龄</TableHead>
                      <TableHead>综合健康分</TableHead>
                      <TableHead>异常项</TableHead>
                      <TableHead>检测时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {abnormalUsers.map((item) => (
                      <TableRow key={item.user.id} className="hover:bg-orange-50">
                        <TableCell className="font-medium">{item.user.name || '-'}</TableCell>
                        <TableCell>{item.user.phone || '-'}</TableCell>
                        <TableCell>{item.user.age || '-'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.analysis.overallHealth && item.analysis.overallHealth < 40 ? 'destructive' : 'secondary'}
                            className={item.analysis.overallHealth && item.analysis.overallHealth >= 40 ? 'bg-orange-500' : ''}
                          >
                            {item.analysis.overallHealth || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.abnormalItems.slice(0, 3).map((abnormal, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {abnormal}
                              </Badge>
                            ))}
                            {item.abnormalItems.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.abnormalItems.length - 3}项
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500">{formatDate(item.analysis.analyzedAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push(`/admin/dashboard?userId=${item.user.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* 分页 */}
                <div className="mt-4">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    limit={pagination.limit}
                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                    onLimitChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
