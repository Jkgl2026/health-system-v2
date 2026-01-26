/**
 * 自动维护调度器
 * 支持每天、每周、每月自动执行数据库维护任务
 */

import cron from 'node-cron';

type MaintenanceTask = 'vacuum' | 'analyze' | 'reindex';

type TaskSchedule = {
  task: MaintenanceTask;
  schedule: string; // cron表达式
  lastRun: string | null;
  nextRun: string | null;
  enabled: boolean;
};

type TaskResult = {
  task: MaintenanceTask;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
  duration: number;
};

class AutoMaintenanceScheduler {
  private tasks: Map<MaintenanceTask, any> = new Map();
  private schedules: Map<MaintenanceTask, TaskSchedule> = new Map();
  private results: TaskResult[] = [];
  private maxResults = 100; // 最多保留100条结果

  constructor() {
    this.initSchedules();
    this.loadState();
  }

  /**
   * 初始化默认调度配置
   */
  private initSchedules() {
    // 每天凌晨2点执行ANALYZE
    this.schedules.set('analyze', {
      task: 'analyze',
      schedule: '0 2 * * *',
      lastRun: null,
      nextRun: null,
      enabled: true,
    });

    // 每周日凌晨3点执行VACUUM
    this.schedules.set('vacuum', {
      task: 'vacuum',
      schedule: '0 3 * * 0',
      lastRun: null,
      nextRun: null,
      enabled: true,
    });

    // 每月1号凌晨4点执行REINDEX
    this.schedules.set('reindex', {
      task: 'reindex',
      schedule: '0 4 1 * *',
      lastRun: null,
      nextRun: null,
      enabled: true,
    });
  }

  /**
   * 加载保存的状态
   */
  private loadState() {
    // 在服务端环境中，不使用localStorage
    // 每次启动都会重置为默认配置
    console.log('[AutoMaintenance] 调度器已初始化，使用默认配置');
  }

  /**
   * 保存状态到localStorage
   */
  private saveState() {
    // 在服务端环境中，不使用localStorage
    // 状态保存在内存中
  }

  /**
   * 执行维护任务
   */
  private async executeTask(task: MaintenanceTask): Promise<TaskResult> {
    const startTime = Date.now();
    console.log(`[AutoMaintenance] 开始执行任务: ${task}`);

    try {
      // 直接调用维护函数，而不是通过fetch
      const { performVacuum, performAnalyze, performReindex } = await import('@/app/api/admin/maintenance/route');

      let result;
      switch (task) {
        case 'vacuum':
          result = await performVacuum();
          break;
        case 'analyze':
          result = await performAnalyze();
          break;
        case 'reindex':
          result = await performReindex();
          break;
        default:
          throw new Error(`未知的任务: ${task}`);
      }

      if (result.success) {
        const taskResult: TaskResult = {
          task,
          status: 'success',
          message: '任务执行成功',
          timestamp: new Date().toISOString(),
          duration: result.duration,
        };
        this.addResult(taskResult);
        console.log(`[AutoMaintenance] 任务执行成功: ${task}`);
        return taskResult;
      } else {
        throw new Error(result.message || '任务执行失败');
      }
    } catch (error) {
      const result: TaskResult = {
        task,
        status: 'error',
        message: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
      this.addResult(result);
      console.error(`[AutoMaintenance] 任务执行失败: ${task}`, error);
      return result;
    }
  }

  /**
   * 添加执行结果
   */
  private addResult(result: TaskResult) {
    this.results.unshift(result);
    if (this.results.length > this.maxResults) {
      this.results = this.results.slice(0, this.maxResults);
    }
    this.saveState();
  }

  /**
   * 启动调度器
   */
  public start(task?: MaintenanceTask) {
    const tasksToStart = task ? [task] : (Array.from(this.schedules.keys()) as MaintenanceTask[]);

    tasksToStart.forEach(taskKey => {
      const schedule = this.schedules.get(taskKey);
      if (!schedule) return;

      if (schedule.enabled && !this.tasks.has(taskKey)) {
        try {
          const cronTask = cron.schedule(schedule.schedule, async () => {
            await this.executeTask(taskKey);
            this.updateLastRun(taskKey);
          });

          this.tasks.set(taskKey, cronTask);
          this.updateNextRun(taskKey);
          console.log(`[AutoMaintenance] 启动任务: ${taskKey} (${schedule.schedule})`);
        } catch (error) {
          console.error(`[AutoMaintenance] 启动任务失败: ${taskKey}`, error);
        }
      }
    });

    this.saveState();
  }

  /**
   * 停止调度器
   */
  public stop(task?: MaintenanceTask) {
    const tasksToStop = task ? [task] : (Array.from(this.tasks.keys()) as MaintenanceTask[]);

    tasksToStop.forEach(taskKey => {
      const cronTask = this.tasks.get(taskKey);
      if (cronTask) {
        cronTask.stop();
        this.tasks.delete(taskKey);
        console.log(`[AutoMaintenance] 停止任务: ${taskKey}`);
      }
    });

    this.saveState();
  }

  /**
   * 更新最后运行时间
   */
  private updateLastRun(task: MaintenanceTask) {
    const schedule = this.schedules.get(task);
    if (schedule) {
      schedule.lastRun = new Date().toISOString();
      this.updateNextRun(task);
      this.saveState();
    }
  }

  /**
   * 更新下次运行时间
   */
  private updateNextRun(task: MaintenanceTask) {
    const schedule = this.schedules.get(task);
    if (!schedule) return;

    try {
      // 简单计算下次运行时间（仅用于显示，实际由cron库控制）
      const nextRun = new Date();
      const parts = schedule.schedule.split(' ');
      const minuteStr = parts[0];
      const hourStr = parts[1];
      const dayOfMonthStr = parts[2];
      const monthStr = parts[3];
      const dayOfWeekStr = parts[4];

      const minute = parseInt(minuteStr);
      const hour = parseInt(hourStr);
      const dayOfMonth = parseInt(dayOfMonthStr);
      const month = parseInt(monthStr);
      const dayOfWeek = parseInt(dayOfWeekStr);

      if (dayOfMonthStr !== '*') {
        // 每月特定日期
        nextRun.setMonth(nextRun.getMonth() + 1, dayOfMonth);
      } else if (dayOfWeekStr !== '*') {
        // 每周特定星期
        const daysUntil = (dayOfWeek - nextRun.getDay() + 7) % 7 || 7;
        nextRun.setDate(nextRun.getDate() + daysUntil);
      } else {
        // 每天
        nextRun.setDate(nextRun.getDate() + 1);
      }

      nextRun.setHours(hour, minute, 0, 0);
      schedule.nextRun = nextRun.toISOString();
    } catch (error) {
      console.error('计算下次运行时间失败:', error);
    }
  }

  /**
   * 更新调度配置
   */
  public updateSchedule(task: MaintenanceTask, schedule: string, enabled: boolean) {
    const current = this.schedules.get(task);
    if (!current) return;

    const wasEnabled = current.enabled && this.tasks.has(task);
    const willBeEnabled = enabled;

    current.schedule = schedule;
    current.enabled = enabled;

    // 如果状态改变，重新启动/停止任务
    if (wasEnabled && !willBeEnabled) {
      this.stop(task);
    } else if (!wasEnabled && willBeEnabled) {
      this.start(task);
    } else if (wasEnabled && willBeEnabled) {
      // 如果之前启用且之后启用，重启以应用新调度
      this.stop(task);
      this.start(task);
    }

    this.saveState();
  }

  /**
   * 获取所有调度状态
   */
  public getSchedules(): TaskSchedule[] {
    return Array.from(this.schedules.values()).map(schedule => ({
      ...schedule,
      isRunning: this.tasks.has(schedule.task),
    })) as any[];
  }

  /**
   * 获取执行结果
   */
  public getResults(limit: number = 20): TaskResult[] {
    return this.results.slice(0, limit);
  }

  /**
   * 手动执行任务
   */
  public async runNow(task: MaintenanceTask): Promise<TaskResult> {
    return this.executeTask(task);
  }

  /**
   * 停止所有任务
   */
  public stopAll() {
    this.stop();
  }

  /**
   * 获取统计信息
   */
  public getStats() {
    const totalRuns = this.results.length;
    const successRuns = this.results.filter(r => r.status === 'success').length;
    const errorRuns = this.results.filter(r => r.status === 'error').length;

    return {
      totalRuns,
      successRuns,
      errorRuns,
      successRate: totalRuns > 0 ? ((successRuns / totalRuns) * 100).toFixed(2) : '0',
      averageDuration:
        totalRuns > 0
          ? Math.round(this.results.reduce((sum, r) => sum + r.duration, 0) / totalRuns)
          : 0,
    };
  }
}

// 导出单例
export const autoMaintenanceScheduler = new AutoMaintenanceScheduler();
