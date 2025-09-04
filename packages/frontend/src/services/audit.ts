// 审计服务实现
// packages/frontend/src/services/audit.ts

export class AuditService {
  private logs: AuditLog[] = [];
  private maxLogs = 1000;
  private retentionPeriod = 30 * 24 * 60 * 60 * 1000; // 30天

  /**
   * 记录操作日志
   */
  async logAction(action: AuditAction): Promise<void> {
    const log: AuditLog = {
      id: crypto.randomUUID(),
      userId: getCurrentUserId(),
      action: action.action,
      resourceId: action.resourceId,
      resourceType: action.resourceType || 'vault',
      result: action.success,
      errorMessage: action.errorMessage || '',
      timestamp: Date.now(),
      metadata: action.metadata || {},
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent,
    };

    this.logs.push(log);

    // 清理旧日志
    this.cleanupLogs();

    // 持久化到本地存储
    await this.persistLogs();

    // 发送到服务器（如果在线）
    if (navigator.onLine) {
      this.sendToServer(log).catch(console.error);
    }
  }

  /**
   * 记录上传操作
   */
  async logUpload(uploadLog: UploadLog): Promise<void> {
    await this.logAction({
      action: 'upload_vault',
      resourceId: uploadLog.blobId,
      resourceType: 'vault',
      success: true,
      metadata: {
        size: uploadLog.size,
        compressionRatio: uploadLog.compressionRatio,
        duration: uploadLog.duration,
      },
    });
  }

  /**
   * 记录下载操作
   */
  async logDownload(downloadLog: DownloadLog): Promise<void> {
    await this.logAction({
      action: 'download_vault',
      resourceId: downloadLog.blobId,
      resourceType: 'vault',
      success: true,
      metadata: {
        size: downloadLog.size,
        duration: downloadLog.duration,
      },
    });
  }

  /**
   * 获取用户操作日志
   */
  async getUserLogs(userId?: string): Promise<AuditLog[]> {
    const targetUserId = userId || getCurrentUserId();
    return this.logs.filter(log => log.userId === targetUserId);
  }

  /**
   * 获取资源操作日志
   */
  async getResourceLogs(resourceId: string): Promise<AuditLog[]> {
    return this.logs.filter(log => log.resourceId === resourceId);
  }

  /**
   * 获取操作统计
   */
  async getActionStats(startDate?: number, endDate?: number): Promise<ActionStats> {
    let filteredLogs = this.logs;

    if (startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
    }

    const stats: ActionStats = {
      totalActions: filteredLogs.length,
      successfulActions: filteredLogs.filter(log => log.result).length,
      failedActions: filteredLogs.filter(log => !log.result).length,
      actionsByType: {},
      actionsByResource: {},
      usersActivity: {},
      errorRate: 0,
      averageResponseTime: 0,
    };

    // 计算各类型操作统计
    filteredLogs.forEach(log => {
      stats.actionsByType[log.action] = (stats.actionsByType[log.action] || 0) + 1;
      stats.actionsByResource[log.resourceType] = (stats.actionsByResource[log.resourceType] || 0) + 1;
      stats.usersActivity[log.userId] = (stats.usersActivity[log.userId] || 0) + 1;
    });

    // 计算错误率
    stats.errorRate = stats.totalActions > 0 ? (stats.failedActions / stats.totalActions) * 100 : 0;

    // 计算平均响应时间
    const responseTimes = filteredLogs
      .filter(log => log.metadata.duration)
      .map(log => log.metadata.duration);
    stats.averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    return stats;
  }

  /**
   * 获取安全评分
   */
  async getSecurityScore(userId?: string): Promise<SecurityScore> {
    const targetUserId = userId || getCurrentUserId();
    const userLogs = await this.getUserLogs(targetUserId);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentLogs = userLogs.filter(log => log.timestamp >= thirtyDaysAgo);

    const score = this.calculateSecurityScore(recentLogs);
    return score;
  }

  /**
   * 检测可疑活动
   */
  async detectSuspiciousActivity(userId?: string): Promise<SuspiciousActivity[]> {
    const targetUserId = userId || getCurrentUserId();
    const userLogs = await this.getUserLogs(targetUserId);
    const activities: SuspiciousActivity[] = [];

    // 检测异常登录地点
    const locations = new Set(userLogs.map(log => log.ipAddress));
    if (locations.size > 5) {
      activities.push({
        type: 'multiple_locations',
        severity: 'medium',
        description: '检测到来自多个IP地址的活动',
        timestamp: Date.now(),
        details: { locations: Array.from(locations) },
      });
    }

    // 检测高频失败操作
    const recentFailures = userLogs.filter(log => 
      !log.result && log.timestamp > Date.now() - (60 * 60 * 1000)
    );
    if (recentFailures.length > 10) {
      activities.push({
        type: 'high_failure_rate',
        severity: 'high',
        description: '检测到高频失败操作',
        timestamp: Date.now(),
        details: { failureCount: recentFailures.length },
      });
    }

    // 检测异常时间操作
    const nightTimeLogs = userLogs.filter(log => {
      const hour = new Date(log.timestamp).getHours();
      return hour >= 2 && hour <= 5;
    });
    if (nightTimeLogs.length > userLogs.length * 0.3) {
      activities.push({
        type: 'unusual_time_activity',
        severity: 'low',
        description: '检测到异常时间段的频繁活动',
        timestamp: Date.now(),
        details: { nightTimeOperations: nightTimeLogs.length },
      });
    }

    return activities;
  }

  /**
   * 导出审计日志
   */
  async exportLogs(format: 'json' | 'csv' = 'json'): Promise<string> {
    const exportData = {
      exportDate: Date.now(),
      totalLogs: this.logs.length,
      logs: this.logs,
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(this.logs);
    }

    throw new Error('Unsupported export format');
  }

  /**
   * 清理审计日志
   */
  async cleanupLogs(): Promise<void> {
    const cutoffDate = Date.now() - this.retentionPeriod;
    this.logs = this.logs.filter(log => log.timestamp >= cutoffDate);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    await this.persistLogs();
  }

  /**
   * 从本地存储加载日志
   */
  async loadLogs(): Promise<void> {
    try {
      const stored = localStorage.getItem('audit-logs');
      if (stored) {
        const data = JSON.parse(stored);
        this.logs = data.logs || [];
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  }

  // 私有方法

  private async persistLogs(): Promise<void> {
    try {
      const data = {
        version: 1,
        lastUpdated: Date.now(),
        logs: this.logs,
      };
      localStorage.setItem('audit-logs', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist audit logs:', error);
    }
  }

  private async sendToServer(log: AuditLog): Promise<void> {
    // 这里可以实现发送到服务器的逻辑
    // 例如：await api.post('/audit/logs', log);
    console.log('Sending audit log to server:', log);
  }

  private calculateSecurityScore(logs: AuditLog[]): SecurityScore {
    const totalActions = logs.length;
    const successfulActions = logs.filter(log => log.result).length;
    const failedActions = logs.filter(log => !log.result).length;

    let score = 100;

    // 基于成功率调整分数
    if (totalActions > 0) {
      const successRate = (successfulActions / totalActions) * 100;
      score = Math.min(100, successRate);
    }

    // 基于失败操作扣分
    score = Math.max(0, score - (failedActions * 2));

    // 基于操作类型调整
    const sensitiveActions = logs.filter(log => 
      ['delete_vault', 'share_vault', 'revoke_access'].includes(log.action)
    );
    if (sensitiveActions.length > 0) {
      const sensitiveFailures = sensitiveActions.filter(log => !log.result).length;
      score = Math.max(0, score - (sensitiveFailures * 5));
    }

    return {
      score: Math.round(score),
      level: this.getSecurityLevel(score),
      totalActions,
      successfulActions,
      failedActions,
      lastUpdated: Date.now(),
    };
  }

  private getSecurityLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }

  private convertToCSV(logs: AuditLog[]): string {
    const headers = [
      'ID', 'User ID', 'Action', 'Resource ID', 'Resource Type', 
      'Result', 'Error Message', 'Timestamp', 'IP Address', 'User Agent'
    ];

    const rows = logs.map(log => [
      log.id,
      log.userId,
      log.action,
      log.resourceId,
      log.resourceType,
      log.result.toString(),
      log.errorMessage,
      new Date(log.timestamp).toISOString(),
      log.ipAddress,
      log.userAgent,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

// 辅助函数
function getCurrentUserId(): string {
  // 从认证状态获取用户ID
  return localStorage.getItem('user-id') || 'anonymous';
}

async function getClientIP(): Promise<string> {
  try {
    // 这里可以实现IP获取逻辑
    // 例如：const response = await fetch('https://api.ipify.org?format=json');
    // return response.json().ip;
    return '127.0.0.1';
  } catch (error) {
    return 'unknown';
  }
}

// 类型定义
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceId: string;
  resourceType: string;
  result: boolean;
  errorMessage: string;
  timestamp: number;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

export interface AuditAction {
  action: string;
  resourceId: string;
  resourceType?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface ActionStats {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  actionsByType: Record<string, number>;
  actionsByResource: Record<string, number>;
  usersActivity: Record<string, number>;
  errorRate: number;
  averageResponseTime: number;
}

export interface SecurityScore {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  lastUpdated: number;
}

export interface SuspiciousActivity {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: number;
  details: Record<string, any>;
}

export interface UploadLog {
  blobId: string;
  size: number;
  compressionRatio: number;
  duration: number;
  timestamp: number;
}

export interface DownloadLog {
  blobId: string;
  size: number;
  duration: number;
  timestamp: number;
}