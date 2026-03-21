/**
 * MediaPipe Pose 全局单例管理器
 * 解决多个实例导致 WASM 内存冲突的问题
 */

import type { Pose } from '@mediapipe/pose';

// 单例实例
let poseInstance: Pose | null = null;
let isInitializing = false;
let initPromise: Promise<Pose> | null = null;
let isReady = false;

// 检测队列（串行处理）
let detectionQueue: Array<{
  image: HTMLImageElement | HTMLCanvasElement;
  resolve: (result: any) => void;
  reject: (error: Error) => void;
}> = [];
let isProcessing = false;

// 回调计数器
let resultCallback: ((results: any) => void) | null = null;
let currentResolver: ((result: any) => void) | null = null;

/**
 * 初始化 MediaPipe Pose 实例
 */
export async function initPoseDetector(): Promise<Pose> {
  // 如果已经初始化完成，直接返回
  if (poseInstance && isReady) {
    return poseInstance;
  }

  // 如果正在初始化，等待完成
  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;

  initPromise = (async () => {
    try {
      console.log('[PoseManager] 开始初始化 MediaPipe Pose...');

      // 动态导入
      // @ts-ignore
      const { Pose } = await import('@mediapipe/pose');

      // 创建实例
      const pose = new Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      // 设置回调
      pose.onResults((results: any) => {
        if (currentResolver) {
          currentResolver(results);
          currentResolver = null;
        }
      });

      // 配置参数（使用最轻量模型）
      await pose.setOptions({
        modelComplexity: 0,
        smoothLandmarks: false,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.3,
        minTrackingConfidence: 0.3,
      });

      // 预热模型（发送空白图像触发完整初始化）
      console.log('[PoseManager] 预热模型...');
      const warmupCanvas = document.createElement('canvas');
      warmupCanvas.width = 100;
      warmupCanvas.height = 100;
      const ctx = warmupCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 100, 100);
      }

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('模型预热超时'));
        }, 60000);

        currentResolver = (results: any) => {
          clearTimeout(timeout);
          resolve();
        };

        pose.send({ image: warmupCanvas }).catch((err: Error) => {
          clearTimeout(timeout);
          // 忽略预热错误，继续
          console.warn('[PoseManager] 预热警告:', err.message);
          resolve();
        });
      });

      poseInstance = pose;
      isReady = true;
      isInitializing = false;

      console.log('[PoseManager] MediaPipe Pose 初始化完成');
      return pose;

    } catch (error) {
      isInitializing = false;
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

/**
 * 检测单张图片（串行处理）
 */
export async function detectImage(
  image: HTMLImageElement | HTMLCanvasElement
): Promise<any> {
  // 确保 Pose 已初始化
  const pose = await initPoseDetector();

  return new Promise((resolve, reject) => {
    // 加入队列
    detectionQueue.push({ image, resolve, reject });

    // 如果没有在处理，开始处理
    if (!isProcessing) {
      processQueue();
    }
  });
}

/**
 * 处理检测队列（串行）
 */
async function processQueue() {
  if (detectionQueue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const { image, resolve, reject } = detectionQueue.shift()!;

  try {
    // 设置超时
    const timeout = setTimeout(() => {
      reject(new Error('检测超时'));
    }, 30000);

    // 设置当前 resolver
    currentResolver = (results: any) => {
      clearTimeout(timeout);
      resolve(results);
    };

    // 发送检测请求
    await poseInstance!.send({ image });

  } catch (error) {
    reject(error instanceof Error ? error : new Error(String(error)));
  } finally {
    // 处理下一个
    processQueue();
  }
}

/**
 * 获取当前实例状态
 */
export function getPoseStatus(): {
  isReady: boolean;
  isInitializing: boolean;
  queueLength: number;
} {
  return {
    isReady,
    isInitializing,
    queueLength: detectionQueue.length,
  };
}

/**
 * 销毁实例
 */
export function destroyPoseDetector(): void {
  if (poseInstance) {
    poseInstance.close?.();
    poseInstance = null;
    isReady = false;
    isInitializing = false;
    initPromise = null;
    detectionQueue = [];
    isProcessing = false;
    currentResolver = null;
    console.log('[PoseManager] MediaPipe Pose 已销毁');
  }
}

/**
 * 将结果转换为骨骼点数组
 */
export function convertToLandmarks(results: any): Array<{
  x: number;
  y: number;
  z: number;
  visibility: number;
}> | null {
  if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
    return null;
  }

  return results.poseLandmarks.map((lm: any) => ({
    x: lm.x,
    y: lm.y,
    z: lm.z || 0,
    visibility: lm.visibility || 0,
  }));
}
