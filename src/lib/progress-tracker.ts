/**
 * 进度追踪系统
 * 使用 localStorage 存储评估历史
 */

import { v4 as uuidv4 } from 'uuid';
import { format, differenceInDays, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 评估记录接口
export interface AssessmentRecord {
  id: string;
  timestamp: string;
  
  // 基本信息
  overallScore: number;
  grade: string;
  
  // 检测到的问题
  issues: {
    type: string;
    name: string;
    severity: string;
    angle: number;
  }[];
  
  // 关键角度数据
  angles: Record<string, number>;
  
  // 肌肉状态
  muscles?: {
    tight: string[];
    weak: string[];
  };
  
  // 图片（Base64缩略图）
  imageThumbnail?: string;
  
  // 备注
  notes?: string;
}

// 存储键
const STORAGE_KEY = 'posture_assessment_history';

// 最大存储记录数
const MAX_RECORDS = 50;

// 获取所有评估记录
export function getAllRecords(): AssessmentRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const records: AssessmentRecord[] = JSON.parse(data);
    return records.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('读取评估记录失败:', error);
    return [];
  }
}

// 保存评估记录
export function saveRecord(record: Omit<AssessmentRecord, 'id' | 'timestamp'>): AssessmentRecord {
  const records = getAllRecords();
  
  const newRecord: AssessmentRecord = {
    ...record,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
  };
  
  // 添加新记录
  records.unshift(newRecord);
  
  // 限制数量
  const trimmedRecords = records.slice(0, MAX_RECORDS);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedRecords));
    return newRecord;
  } catch (error) {
    console.error('保存评估记录失败:', error);
    throw new Error('保存失败，存储空间不足');
  }
}

// 获取单条记录
export function getRecord(id: string): AssessmentRecord | null {
  const records = getAllRecords();
  return records.find(r => r.id === id) || null;
}

// 删除记录
export function deleteRecord(id: string): boolean {
  const records = getAllRecords();
  const filtered = records.filter(r => r.id !== id);
  
  if (filtered.length === records.length) {
    return false;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('删除记录失败:', error);
    return false;
  }
}

// 更新记录备注
export function updateRecordNotes(id: string, notes: string): boolean {
  const records = getAllRecords();
  const index = records.findIndex(r => r.id === id);
  
  if (index === -1) return false;
  
  records[index].notes = notes;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch (error) {
    console.error('更新备注失败:', error);
    return false;
  }
}

// 获取进度趋势数据
export function getProgressTrend(days: number = 30): {
  dates: string[];
  scores: number[];
  improvement: number;
} {
  const records = getAllRecords();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentRecords = records.filter(r => 
    new Date(r.timestamp) >= cutoffDate
  ).reverse(); // 按时间正序
  
  const dates = recentRecords.map(r => 
    format(parseISO(r.timestamp), 'MM/dd', { locale: zhCN })
  );
  
  const scores = recentRecords.map(r => r.overallScore);
  
  // 计算改善百分比
  let improvement = 0;
  if (scores.length >= 2) {
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    improvement = ((lastScore - firstScore) / firstScore) * 100;
  }
  
  return { dates, scores, improvement };
}

// 获取问题改善趋势
export function getIssueTrend(): {
  issue: string;
  trend: 'improving' | 'worsening' | 'stable';
  change: number;
}[] {
  const records = getAllRecords();
  
  if (records.length < 2) {
    return [];
  }
  
  // 收集所有问题类型
  const issueTypes = new Set<string>();
  records.forEach(r => {
    r.issues.forEach(i => issueTypes.add(i.type));
  });
  
  const trends: { issue: string; trend: 'improving' | 'worsening' | 'stable'; change: number }[] = [];
  
  issueTypes.forEach(type => {
    // 找到该问题的最近两次记录
    const recentRecords = records
      .filter(r => r.issues.some(i => i.type === type))
      .slice(0, 2);
    
    if (recentRecords.length >= 2) {
      const severityMap = { 'mild': 1, 'moderate': 2, 'severe': 3 };
      const oldSeverity = recentRecords[1].issues.find(i => i.type === type)?.severity || 'mild';
      const newSeverity = recentRecords[0].issues.find(i => i.type === type)?.severity || 'mild';
      
      const change = severityMap[oldSeverity as keyof typeof severityMap] - 
                     severityMap[newSeverity as keyof typeof severityMap];
      
      trends.push({
        issue: type,
        trend: change > 0 ? 'improving' : change < 0 ? 'worsening' : 'stable',
        change,
      });
    }
  });
  
  return trends;
}

// 获取角度变化趋势
export function getAngleTrend(): {
  angle: string;
  records: { date: string; value: number }[];
  change: number;
}[] {
  const records = getAllRecords();
  
  if (records.length < 2) {
    return [];
  }
  
  // 收集所有角度类型
  const angleTypes = new Set<string>();
  records.forEach(r => {
    Object.keys(r.angles).forEach(angle => angleTypes.add(angle));
  });
  
  const trends: { angle: string; records: { date: string; value: number }[]; change: number }[] = [];
  
  angleTypes.forEach(type => {
    const angleRecords = records
      .filter(r => r.angles[type] !== undefined)
      .map(r => ({
        date: format(parseISO(r.timestamp), 'MM/dd'),
        value: r.angles[type],
      }))
      .slice(0, 10)
      .reverse();
    
    if (angleRecords.length >= 2) {
      const change = angleRecords[angleRecords.length - 1].value - angleRecords[0].value;
      trends.push({
        angle: type,
        records: angleRecords,
        change,
      });
    }
  });
  
  return trends.slice(0, 10); // 返回前10个角度趋势
}

// 对比两条记录
export function compareRecords(id1: string, id2: string): {
  record1: AssessmentRecord | null;
  record2: AssessmentRecord | null;
  comparison: {
    scoreChange: number;
    issuesImproved: string[];
    issuesWorsened: string[];
    issuesNew: string[];
    issuesResolved: string[];
  };
} {
  const record1 = getRecord(id1);
  const record2 = getRecord(id2);
  
  if (!record1 || !record2) {
    return {
      record1,
      record2,
      comparison: {
        scoreChange: 0,
        issuesImproved: [],
        issuesWorsened: [],
        issuesNew: [],
        issuesResolved: [],
      },
    };
  }
  
  const severityMap = { 'mild': 1, 'moderate': 2, 'severe': 3 };
  
  // 评分变化
  const scoreChange = record1.overallScore - record2.overallScore;
  
  // 问题改善（严重程度降低）
  const issuesImproved = record2.issues
    .filter(i2 => {
      const i1 = record1.issues.find(i => i.type === i2.type);
      if (!i1) return false;
      return severityMap[i1.severity as keyof typeof severityMap] < 
             severityMap[i2.severity as keyof typeof severityMap];
    })
    .map(i => i.name);
  
  // 问题恶化
  const issuesWorsened = record2.issues
    .filter(i2 => {
      const i1 = record1.issues.find(i => i.type === i2.type);
      if (!i1) return false;
      return severityMap[i1.severity as keyof typeof severityMap] > 
             severityMap[i2.severity as keyof typeof severityMap];
    })
    .map(i => i.name);
  
  // 新出现的问题
  const issuesNew = record1.issues
    .filter(i1 => !record2.issues.some(i2 => i2.type === i1.type))
    .map(i => i.name);
  
  // 已解决的问题
  const issuesResolved = record2.issues
    .filter(i2 => !record1.issues.some(i1 => i1.type === i2.type))
    .map(i => i.name);
  
  return {
    record1,
    record2,
    comparison: {
      scoreChange,
      issuesImproved,
      issuesWorsened,
      issuesNew,
      issuesResolved,
    },
  };
}

// 获取统计摘要
export function getStatistics(): {
  totalAssessments: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  daysSinceFirstAssessment: number;
  mostCommonIssue: { name: string; count: number } | null;
} {
  const records = getAllRecords();
  
  if (records.length === 0) {
    return {
      totalAssessments: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      daysSinceFirstAssessment: 0,
      mostCommonIssue: null,
    };
  }
  
  const scores = records.map(r => r.overallScore);
  
  // 统计问题出现频率
  const issueCounts: Record<string, { name: string; count: number }> = {};
  records.forEach(r => {
    r.issues.forEach(i => {
      if (!issueCounts[i.type]) {
        issueCounts[i.type] = { name: i.name, count: 0 };
      }
      issueCounts[i.type].count++;
    });
  });
  
  // 找出最常见问题
  let mostCommonIssue: { name: string; count: number } | null = null;
  Object.values(issueCounts).forEach(item => {
    if (!mostCommonIssue || item.count > mostCommonIssue.count) {
      mostCommonIssue = item;
    }
  });
  
  const firstRecord = records[records.length - 1];
  const daysSinceFirst = differenceInDays(
    new Date(),
    parseISO(firstRecord.timestamp)
  );
  
  return {
    totalAssessments: records.length,
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    daysSinceFirstAssessment: daysSinceFirst,
    mostCommonIssue,
  };
}

// 导出数据（用于备份）
export function exportData(): string {
  const records = getAllRecords();
  return JSON.stringify(records, null, 2);
}

// 导入数据（用于恢复）
export function importData(jsonString: string): boolean {
  try {
    const records: AssessmentRecord[] = JSON.parse(jsonString);
    
    if (!Array.isArray(records)) {
      throw new Error('Invalid data format');
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch (error) {
    console.error('导入数据失败:', error);
    return false;
  }
}

// 清空所有数据
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
