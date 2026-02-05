/**
 * 告警级别枚举
 */
export enum AlertLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * 告警类型枚举
 */
export enum AlertType {
  DATABASE = 'DATABASE',
  API = 'API',
  SYSTEM = 'SYSTEM',
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
}

/**
 * 告警规则接口
 */
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: AlertType;
  level: AlertLevel;
  enabled: boolean;
  checkFn: () => Promise<AlertCheckResult>;
  threshold?: number;
  duration?: number;  // 持续时间（秒）
}

/**
 * 告警检查结果
 */
export interface AlertCheckResult {
  triggered: boolean;
  value: number;
  message: string;
  details?: any;
}

/**
 * 告警记录接口
 */
export interface AlertRecord {
  id: string;
  ruleId: string;
  ruleName: string;
  level: AlertLevel;
  type: AlertType;
  message: string;
  value: number;
  threshold?: number;
  details?: any;
  timestamp: Date;
  resolved?: boolean;
  resolvedAt?: Date;
}

/**
 * 告警配置接口
 */
export interface AlertConfig {
  /** 是否启用告警 */
  enabled: boolean;
  /** 检查间隔（秒） */
  checkInterval: number;
  /** 告警保留天数 */
  retentionDays: number;
  /** 告警回调函数 */
  onAlert?: (alert: AlertRecord) => Promise<void>;
}

/**
 * 告警管理器类
 */
export class AlertManager {
  private rules: Map<string, AlertRule> = new Map();
  private history: AlertRecord[] = [];
  private config: AlertConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private ruleStates: Map<string, { startTime: Date; triggered: boolean }> = new Map();

  constructor(config: AlertConfig = {} as AlertConfig) {
    const defaultConfig = {
      enabled: true,
      checkInterval: 60,
      retentionDays: 7,
    };
    this.config = {
      ...defaultConfig,
      ...(config || {}),
    };
  }

  /**
   * 添加告警规则
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    console.log(`[AlertManager] 添加告警规则: ${rule.name}`);
  }

  /**
   * 移除告警规则
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    this.ruleStates.delete(ruleId);
    console.log(`[AlertManager] 移除告警规则: ${ruleId}`);
  }

  /**
   * 启用告警规则
   */
  enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
      console.log(`[AlertManager] 启用告警规则: ${rule.name}`);
    }
  }

  /**
   * 禁用告警规则
   */
  disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
      console.log(`[AlertManager] 禁用告警规则: ${rule.name}`);
    }
  }

  /**
   * 执行单次检查
   */
  async checkOnce(): Promise<AlertRecord[]> {
    if (!this.config.enabled) {
      return [];
    }

    const alerts: AlertRecord[] = [];

    for (const [ruleId, rule] of this.rules.entries()) {
      if (!rule.enabled) continue;

      try {
        const result = await rule.checkFn();
        const state = this.ruleStates.get(ruleId);

        if (result.triggered) {
          // 触发了告警
          if (!state?.triggered) {
            // 首次触发，记录开始时间
            this.ruleStates.set(ruleId, {
              startTime: new Date(),
              triggered: true,
            });
          } else {
            // 检查是否达到持续时间阈值
            const duration = (Date.now() - state.startTime.getTime()) / 1000;
            if (rule.duration && duration < rule.duration) {
              // 未达到持续时间，跳过
              continue;
            }
          }

          // 创建告警记录
          const alert: AlertRecord = {
            id: crypto.randomUUID(),
            ruleId,
            ruleName: rule.name,
            level: rule.level,
            type: rule.type,
            message: result.message,
            value: result.value,
            threshold: rule.threshold,
            details: result.details,
            timestamp: new Date(),
          };

          alerts.push(alert);
          this.history.push(alert);

          // 触发告警回调
          if (this.config.onAlert) {
            await this.config.onAlert(alert);
          }

          console.error(`[AlertManager] 触发告警: ${rule.name} - ${result.message}`);
        } else {
          // 未触发，清除状态
          if (state?.triggered) {
            // 解决之前的告警
            const lastAlert = this.history
              .filter(a => a.ruleId === ruleId && !a.resolved)
              .pop();

            if (lastAlert) {
              lastAlert.resolved = true;
              lastAlert.resolvedAt = new Date();
              console.log(`[AlertManager] 告警已解决: ${rule.name}`);
            }

            this.ruleStates.delete(ruleId);
          }
        }
      } catch (error) {
        console.error(`[AlertManager] 检查规则失败: ${rule.name}`, error);
      }
    }

    return alerts;
  }

  /**
   * 启动告警检查
   */
  start(): void {
    if (this.intervalId) {
      console.log('[AlertManager] 告警检查已在运行');
      return;
    }

    console.log(`[AlertManager] 启动告警检查，间隔: ${this.config.checkInterval}秒`);
    this.intervalId = setInterval(async () => {
      await this.checkOnce();
    }, this.config.checkInterval * 1000);
  }

  /**
   * 停止告警检查
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[AlertManager] 停止告警检查');
    }
  }

  /**
   * 获取告警历史
   */
  getHistory(options: {
    level?: AlertLevel;
    type?: AlertType;
    resolved?: boolean;
    limit?: number;
  } = {}): AlertRecord[] {
    let filtered = [...this.history];

    if (options.level) {
      filtered = filtered.filter(a => a.level === options.level);
    }

    if (options.type) {
      filtered = filtered.filter(a => a.type === options.type);
    }

    if (options.resolved !== undefined) {
      filtered = filtered.filter(a => a.resolved === options.resolved);
    }

    // 过滤过期的记录
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
    filtered = filtered.filter(a => a.timestamp >= cutoffDate);

    // 按时间倒序排列
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // 限制返回数量
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * 获取活跃告警
   */
  getActiveAlerts(): AlertRecord[] {
    return this.getHistory({ resolved: false });
  }

  /**
   * 清理过期记录
   */
  cleanup(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    const beforeCount = this.history.length;
    this.history = this.history.filter(a => a.timestamp >= cutoffDate);
    const afterCount = this.history.length;

    console.log(`[AlertManager] 清理过期记录: ${beforeCount - afterCount}条`);
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number;
    active: number;
    byLevel: Record<AlertLevel, number>;
    byType: Record<AlertType, number>;
  } {
    const activeAlerts = this.getActiveAlerts();

    const byLevel: Record<AlertLevel, number> = {
      [AlertLevel.INFO]: 0,
      [AlertLevel.WARNING]: 0,
      [AlertLevel.ERROR]: 0,
      [AlertLevel.CRITICAL]: 0,
    };

    const byType: Record<AlertType, number> = {
      [AlertType.DATABASE]: 0,
      [AlertType.API]: 0,
      [AlertType.SYSTEM]: 0,
      [AlertType.PERFORMANCE]: 0,
      [AlertType.SECURITY]: 0,
    };

    for (const alert of activeAlerts) {
      byLevel[alert.level]++;
      byType[alert.type]++;
    }

    return {
      total: this.history.length,
      active: activeAlerts.length,
      byLevel,
      byType,
    };
  }
}

/**
 * 创建全局告警管理器实例
 */
export const alertManager = new AlertManager({
  enabled: true,
  checkInterval: 60,
  retentionDays: 7,
});

export default AlertManager;
