import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { healthDataManager } from '@/storage/database';
import { QueryOptimizer } from '@/lib/query-optimizer';
import { globalCache } from '@/lib/cache';

/**
 * GET /api/performance-test - 性能测试 API
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testType = searchParams.get('type') || 'all';
  const iterations = parseInt(searchParams.get('iterations') || '10');

  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: {},
  };

  try {
    // 测试 1: 单用户查询性能
    if (testType === 'all' || testType === 'single-user') {
      results.tests.singleUser = await testSingleUserQuery(iterations);
    }

    // 测试 2: 批量查询性能
    if (testType === 'all' || testType === 'batch') {
      results.tests.batch = await testBatchQuery(iterations);
    }

    // 测试 3: 缓存性能
    if (testType === 'all' || testType === 'cache') {
      results.tests.cache = await testCachePerformance(iterations);
    }

    // 测试 4: 数据库索引效果
    if (testType === 'all' || testType === 'index') {
      results.tests.index = await testIndexEffectiveness(iterations);
    }

    // 计算汇总统计
    results.summary = calculateSummary(results.tests);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 测试单用户查询性能
 */
async function testSingleUserQuery(iterations: number) {
  const testUserId = 'test-user-id';
  const times: number[] = [];

  // 清除缓存，确保测试真实性能
  globalCache.clear();

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await healthDataManager.getUserFullData(testUserId);
    const end = performance.now();
    times.push(end - start);
  }

  return {
    iterations,
    avgTime: average(times),
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    p95Time: percentile(times, 95),
    p99Time: percentile(times, 99),
    times: times.slice(0, 10), // 只返回前10次的时间
  };
}

/**
 * 测试批量查询性能
 */
async function testBatchQuery(iterations: number) {
  const testUserIds = Array.from({ length: 10 }, (_, i) => `user-${i}`);
  const times: number[] = [];

  // 清除缓存
  globalCache.clear();

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await QueryOptimizer.batchGetUserFullData(testUserIds);
    const end = performance.now();
    times.push(end - start);
  }

  return {
    iterations,
    avgTime: average(times),
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    p95Time: percentile(times, 95),
    p99Time: percentile(times, 99),
    times: times.slice(0, 10),
  };
}

/**
 * 测试缓存性能
 */
async function testCachePerformance(iterations: number) {
  const cacheKey = 'test-cache-key';
  const testData = { id: 1, name: 'test', data: Array(100).fill('test') };

  // 第一次写入
  const writeStart = performance.now();
  globalCache.set(cacheKey, testData);
  const writeTime = performance.now() - writeStart;

  // 测试读取性能
  const readTimes: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    globalCache.get(cacheKey);
    const end = performance.now();
    readTimes.push(end - start);
  }

  // 获取缓存统计
  const stats = globalCache.getStats();

  return {
    writeTime,
    avgReadTime: average(readTimes),
    minReadTime: Math.min(...readTimes),
    maxReadTime: Math.max(...readTimes),
    p95ReadTime: percentile(readTimes, 95),
    cacheStats: stats,
  };
}

/**
 * 测试索引效果
 */
async function testIndexEffectiveness(iterations: number) {
  const testPhone = '13800138000';
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await healthDataManager.getUserByPhone(testPhone);
    const end = performance.now();
    times.push(end - start);
  }

  return {
    iterations,
    avgTime: average(times),
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    p95Time: percentile(times, 95),
    p99Time: percentile(times, 99),
    times: times.slice(0, 10),
  };
}

/**
 * 计算平均值
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * 计算百分位数
 */
function percentile(numbers: number[], p: number): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[index] || 0;
}

/**
 * 计算汇总统计
 */
function calculateSummary(tests: any) {
  const summary: any = {
    totalTests: Object.keys(tests).length,
    performanceGrade: 'A',
    recommendations: [],
  };

  // 评估性能等级
  const avgTimes = Object.values(tests).map((test: any) => test.avgTime || 0);
  const overallAvgTime = average(avgTimes);

  if (overallAvgTime < 10) {
    summary.performanceGrade = 'A+';
    summary.recommendations.push('🚀 性能极佳！响应时间在毫秒级别。');
  } else if (overallAvgTime < 50) {
    summary.performanceGrade = 'A';
    summary.recommendations.push('✅ 性能优秀！响应时间在可接受范围内。');
  } else if (overallAvgTime < 100) {
    summary.performanceGrade = 'B';
    summary.recommendations.push('⚠️ 性能良好，但有优化空间。建议检查慢查询。');
  } else {
    summary.performanceGrade = 'C';
    summary.recommendations.push('❌ 性能需要优化！建议添加索引或优化查询。');
  }

  // 具体建议
  if (tests.singleUser && tests.singleUser.avgTime > 100) {
    summary.recommendations.push('建议优化单用户查询，添加数据库索引。');
  }
  if (tests.batch && tests.batch.avgTime > 200) {
    summary.recommendations.push('建议使用批量查询优化多用户数据获取。');
  }
  if (tests.cache && tests.cache.avgReadTime > 1) {
    summary.recommendations.push('建议检查缓存实现，确保内存缓存高效。');
  }

  return summary;
}
