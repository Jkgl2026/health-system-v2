'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Calendar,
  Zap,
  Settings,
  TrendingUp,
  Activity,
} from 'lucide-react';

type TaskSchedule = {
  task: 'vacuum' | 'analyze' | 'reindex';
  schedule: string;
  lastRun: string | null;
  nextRun: string | null;
  enabled: boolean;
  isRunning: boolean;
};

type TaskResult = {
  task: 'vacuum' | 'analyze' | 'reindex';
  status: 'success' | 'error';
  message: string;
  timestamp: string;
  duration: number;
};

type AutoMaintenanceData = {
  schedules: TaskSchedule[];
  results: TaskResult[];
  stats: {
    totalRuns: number;
    successRuns: number;
    errorRuns: number;
    successRate: string;
    averageDuration: number;
  };
};

export function AutoMaintenance() {
  const [data, setData] = useState<AutoMaintenanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auto-maintenance');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('加载自动维护状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task: string, enabled: boolean) => {
    setActionLoading(`${task}-toggle`);
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auto-update',
          task,
          schedule: data?.schedules.find(s => s.task === task)?.schedule || '',
          enabled,
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadData();
      } else {
        alert(`操作失败: ${result.error}`);
      }
    } catch (error) {
      console.error('切换任务状态失败:', error);
      alert('操作失败');
    } finally {
      setActionLoading(null);
    }
  };

  const runNow = async (task: string) => {
    if (!confirm(`确定要立即执行 "${task}" 任务吗？`)) return;

    setActionLoading(`${task}-run`);
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auto-run',
          task,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('任务已执行！');
        await loadData();
      } else {
        alert(`执行失败: ${result.error}`);
      }
    } catch (error) {
      console.error('执行任务失败:', error);
      alert('执行失败');
    } finally {
      setActionLoading(null);
    }
  };

  const getTaskIcon = (task: string) => {
    switch (task) {
      case 'vacuum':
        return <AlertCircle className="w-5 h-5" />;
      case 'analyze':
        return <Activity className="w-5 h-5" />;
      case 'reindex':
        return <Zap className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getTaskColor = (task: string) => {
    switch (task) {
      case 'vacuum':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'analyze':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'reindex':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getScheduleDescription = (schedule: string) => {
    if (schedule === '0 2 * * *') return '每天 02:00';
    if (schedule === '0 3 * * 0') return '每周日 03:00';
    if (schedule === '0 4 1 * *') return '每月1号 04:00';
    return schedule;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            自动维护
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 自动维护配置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                自动维护配置
              </CardTitle>
              <CardDescription>
                配置数据库自动维护任务的执行时间和频率
              </CardDescription>
            </div>
            <Button onClick={loadData} size="sm" variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2`} />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.schedules.map((schedule) => (
              <div
                key={schedule.task}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getTaskColor(schedule.task)}`}>
                    {getTaskIcon(schedule.task)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {schedule.task.toUpperCase()}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {getScheduleDescription(schedule.schedule)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {schedule.lastRun && (
                    <Badge variant="outline" className="text-xs">
                      上次: {new Date(schedule.lastRun).toLocaleDateString()}
                    </Badge>
                  )}
                  {schedule.nextRun && (
                    <Badge variant="outline" className="text-xs">
                      下次: {new Date(schedule.nextRun).toLocaleDateString()}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runNow(schedule.task)}
                    disabled={actionLoading === `${schedule.task}-run`}
                  >
                    <Play className={`w-3 h-3 mr-1 ${actionLoading === `${schedule.task}-run` ? 'animate-pulse' : ''}`} />
                    立即执行
                  </Button>
                  <Button
                    size="sm"
                    variant={schedule.enabled ? 'default' : 'outline'}
                    onClick={() => toggleTask(schedule.task, !schedule.enabled)}
                    disabled={actionLoading === `${schedule.task}-toggle`}
                  >
                    {schedule.enabled ? (
                      <>
                        <Pause className="w-3 h-3 mr-1" />
                        停止
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        启动
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              总执行次数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data?.stats.totalRuns || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              成功率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data?.stats.successRate || '0'}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              平均耗时
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data?.stats.averageDuration ? formatDuration(data.stats.averageDuration) : '0'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              失败次数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {data?.stats.errorRuns || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 执行历史 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            执行历史
          </CardTitle>
          <CardDescription>最近20次执行记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data?.results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {result.task.toUpperCase()}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(result.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={result.status === 'success' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {result.status === 'success' ? '成功' : '失败'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {formatDuration(result.duration)}
                  </Badge>
                </div>
              </div>
            ))}
            {(!data?.results || data.results.length === 0) && (
              <div className="text-center py-8 text-slate-500">暂无执行记录</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
