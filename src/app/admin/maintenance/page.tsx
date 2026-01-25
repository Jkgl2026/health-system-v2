'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  RefreshCw,
  Trash2,
  Archive,
  HardDrive,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Zap,
} from 'lucide-react';
import { formatBytes } from '@/lib/compressionUtils';

type MaintenanceAction =
  | 'vacuum'
  | 'analyze'
  | 'reindex'
  | 'full'
  | 'backup'
  | 'archive'
  | 'cleanup'
  | 'all';

type MaintenanceStatus = {
  databaseSize: {
    total: number;
    totalPretty: string;
  };
  tableSizes: Array<{
    tableName: string;
    totalSize: number;
    totalSizePretty: string;
  }>;
  backupStats: {
    totalBackups: number;
    fullBackups: number;
    incrementalBackups: number;
    totalSize: number;
    oldestBackup: string | null;
    newestBackup: string | null;
  };
  archiveStats: {
    currentLogs: number;
    archivedLogs: number;
    oldestLog: string | null;
    oldestArchivedLog: string | null;
  };
};

export default function MaintenancePage() {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<MaintenanceAction | null>(null);
  const [lastResults, setLastResults] = useState<any>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/maintenance');
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('加载维护状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action: MaintenanceAction) => {
    if (!confirm(`确定要执行 "${action}" 操作吗？`)) {
      return;
    }

    setActionLoading(action);
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        setLastResults(data.results);
        alert('操作成功完成！');
        await loadStatus();
      } else {
        alert(`操作失败: ${data.error}`);
      }
    } catch (error) {
      console.error('执行维护操作失败:', error);
      alert('执行失败，请查看控制台日志');
    } finally {
      setActionLoading(null);
    }
  };

  const actions = [
    {
      action: 'vacuum' as MaintenanceAction,
      name: '清理数据库',
      description: '清理死元组，回收空间',
      icon: Trash2,
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      action: 'analyze' as MaintenanceAction,
      name: '更新统计信息',
      description: '优化查询计划',
      icon: Activity,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      action: 'reindex' as MaintenanceAction,
      name: '重建索引',
      description: '提高查询性能',
      icon: Zap,
      color: 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
      action: 'full' as MaintenanceAction,
      name: '完整维护',
      description: '清理 + 分析 + 重建',
      icon: RefreshCw,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      action: 'backup' as MaintenanceAction,
      name: '执行备份',
      description: '创建数据备份',
      icon: HardDrive,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      action: 'archive' as MaintenanceAction,
      name: '归档日志',
      description: '归档审计日志',
      icon: Archive,
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      action: 'cleanup' as MaintenanceAction,
      name: '清理旧备份',
      description: '删除30天前的备份',
      icon: Trash2,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      action: 'all' as MaintenanceAction,
      name: '执行全部',
      description: '执行所有优化操作',
      icon: CheckCircle,
      color: 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                数据库优化管理
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                执行数据库维护操作，优化性能和存储空间
              </p>
            </div>
            <Button onClick={loadStatus} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新状态
            </Button>
          </div>
        </div>

        {/* 统计信息卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                数据库大小
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {status?.databaseSize.totalPretty || '...'}
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                备份数量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {status?.backupStats.totalBackups || 0}
                </div>
                <HardDrive className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {status?.backupStats.totalSize ? formatBytes(status.backupStats.totalSize) : '0 B'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                当前日志
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {status?.archiveStats.currentLogs || 0}
                </div>
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                已归档: {status?.archiveStats.archivedLogs || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                表数量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {status?.tableSizes.length || 0}
                </div>
                <Database className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 维护操作按钮 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              维护操作
            </CardTitle>
            <CardDescription>选择要执行的维护操作</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {actions.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.action}
                    onClick={() => performAction(item.action)}
                    disabled={actionLoading !== null}
                    className={`h-auto py-4 flex flex-col items-center gap-2 ${item.color} text-white`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-xs opacity-90">{item.description}</span>
                    {actionLoading === item.action && (
                      <RefreshCw className="w-4 h-4 animate-spin absolute top-2 right-2" />
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 表大小详情 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>表大小详情</CardTitle>
            <CardDescription>各表的存储占用情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status?.tableSizes.map((table) => (
                <div
                  key={table.tableName}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-900 dark:text-white">
                      {table.tableName}
                    </span>
                  </div>
                  <Badge variant="secondary">{table.totalSizePretty}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 备份统计 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>备份统计</CardTitle>
            <CardDescription>数据备份情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  全量备份
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {status?.backupStats.fullBackups || 0}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  增量备份
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {status?.backupStats.incrementalBackups || 0}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  最新备份
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {status?.backupStats.newestBackup
                    ? new Date(status.backupStats.newestBackup).toLocaleDateString()
                    : '无'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作结果 */}
        {lastResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                最近操作结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(lastResults, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
