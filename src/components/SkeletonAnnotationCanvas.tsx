'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// MediaPipe Pose 关键点索引
const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface SkeletonAnnotationCanvasProps {
  imageUrl: string;
  angle: 'front' | 'back' | 'left' | 'right';
  onDetectionComplete?: (landmarks: Landmark[] | null) => void;
}

// 骨骼连接定义
const SKELETON_CONNECTIONS: [number, number][] = [
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
];

// 绘制骨骼线
function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
) {
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  SKELETON_CONNECTIONS.forEach(([i, j]) => {
    const lm1 = landmarks[i];
    const lm2 = landmarks[j];
    if (lm1 && lm2 && lm1.visibility > 0.5 && lm2.visibility > 0.5) {
      ctx.beginPath();
      ctx.moveTo(lm1.x * width, lm1.y * height);
      ctx.lineTo(lm2.x * width, lm2.y * height);
      ctx.stroke();
    }
  });
}

// 绘制关键点
function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
) {
  const keyPoints = [
    POSE_LANDMARKS.NOSE,
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_ELBOW,
    POSE_LANDMARKS.RIGHT_ELBOW,
    POSE_LANDMARKS.LEFT_WRIST,
    POSE_LANDMARKS.RIGHT_WRIST,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS.LEFT_KNEE,
    POSE_LANDMARKS.RIGHT_KNEE,
    POSE_LANDMARKS.LEFT_ANKLE,
    POSE_LANDMARKS.RIGHT_ANKLE,
  ];

  keyPoints.forEach((index) => {
    const lm = landmarks[index];
    if (lm && lm.visibility > 0.5) {
      // 外圈
      ctx.beginPath();
      ctx.arc(lm.x * width, lm.y * height, 8, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
      ctx.fill();

      // 内圈
      ctx.beginPath();
      ctx.arc(lm.x * width, lm.y * height, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#00ff88';
      ctx.fill();
    }
  });
}

// 绘制角度标注
function drawAngles(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
) {
  // 计算并显示主要关节角度
  const angleGroups = [
    { name: '左肘', points: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST] },
    { name: '右肘', points: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST] },
    { name: '左肩', points: [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP] },
    { name: '右肩', points: [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP] },
    { name: '左髋', points: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE] },
    { name: '右髋', points: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE] },
    { name: '左膝', points: [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE] },
    { name: '右膝', points: [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE] },
  ];

  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  angleGroups.forEach(({ name, points }) => {
    const [a, b, c] = points;
    const lmA = landmarks[a];
    const lmB = landmarks[b];
    const lmC = landmarks[c];

    if (lmA && lmB && lmC && lmA.visibility > 0.5 && lmB.visibility > 0.5 && lmC.visibility > 0.5) {
      const angle = calculateAngle(
        { x: lmA.x, y: lmA.y },
        { x: lmB.x, y: lmB.y },
        { x: lmC.x, y: lmC.y }
      );

      const x = lmB.x * width;
      const y = lmB.y * height;

      // 背景
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(x - 22, y - 10, 44, 20, 4);
      ctx.fill();

      // 文字
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${angle.toFixed(0)}°`, x, y);
    }
  });
}

// 计算角度
function calculateAngle(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

// 绘制错误消息
function drawErrorMessage(ctx: CanvasRenderingContext2D, width: number, height: number, message: string) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, height / 2 - 25, width, 50);
  ctx.fillStyle = '#ff6b6b';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(message, width / 2, height / 2);
}

// 绘制无检测消息
function drawNoDetectionMessage(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, height / 2 - 25, width, 50);
  ctx.fillStyle = '#ffa500';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('未检测到人体骨骼', width / 2, height / 2);
}

export default function SkeletonAnnotationCanvas({
  imageUrl,
  angle,
  onDetectionComplete,
}: SkeletonAnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'detecting' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [landmarkCount, setLandmarkCount] = useState<number>(0);
  const initializedRef = useRef(false);

  // 初始化 MediaPipe 并执行检测
  useEffect(() => {
    if (typeof window === 'undefined' || !imageUrl) return;

    let isMounted = true;

    const initAndDetect = async () => {
      try {
        setStatus('loading');
        setError('');

        console.log(`[SkeletonCanvas ${angle}] 开始初始化 MediaPipe...`);

        // 动态导入 MediaPipe
        // @ts-ignore
        const { Pose } = await import('@mediapipe/pose');

        if (!isMounted) return;

        // 创建 Pose 实例
        const pose = new Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          },
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: false,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        poseRef.current = pose;

        // 等待模型加载
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('模型加载超时'));
          }, 30000);

          pose.onResults(() => {
            clearTimeout(timeout);
            resolve();
          });

          // 发送一个空白图像触发初始化
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 100;
          tempCanvas.height = 100;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.fillStyle = 'white';
            tempCtx.fillRect(0, 0, 100, 100);
          }
          pose.send({ image: tempCanvas }).catch(() => {
            clearTimeout(timeout);
            resolve(); // 即使失败也继续
          });
        });

        if (!isMounted) return;

        console.log(`[SkeletonCanvas ${angle}] MediaPipe 初始化完成，开始检测图片...`);
        setStatus('detecting');

        // 加载图片
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = async () => {
          if (!isMounted) return;

          const canvas = canvasRef.current;
          if (!canvas) {
            setError('Canvas未初始化');
            setStatus('error');
            return;
          }

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setError('无法获取Canvas上下文');
            setStatus('error');
            return;
          }

          // 设置画布尺寸
          const maxWidth = 400;
          const maxHeight = 500;
          let width = img.naturalWidth;
          let height = img.naturalHeight;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          // 绘制原图
          ctx.drawImage(img, 0, 0, width, height);
          console.log(`[SkeletonCanvas ${angle}] 原图绘制完成: ${width}x${height}`);

          // 设置检测结果处理
          pose.onResults((results: any) => {
            if (!isMounted) return;

            console.log(`[SkeletonCanvas ${angle}] 检测结果:`, {
              hasLandmarks: !!results.poseLandmarks,
              landmarkCount: results.poseLandmarks?.length || 0,
            });

            if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
              drawNoDetectionMessage(ctx, width, height);
              setStatus('error');
              setError('未检测到人体骨骼');
              onDetectionComplete?.(null);
              return;
            }

            const landmarks: Landmark[] = results.poseLandmarks.map((lm: any) => ({
              x: lm.x,
              y: lm.y,
              z: lm.z || 0,
              visibility: lm.visibility || 0,
            }));

            setLandmarkCount(landmarks.length);

            // 重新绘制原图（清除之前的标注）
            ctx.drawImage(img, 0, 0, width, height);

            // 绘制骨骼标注
            drawSkeleton(ctx, landmarks, width, height);
            drawLandmarks(ctx, landmarks, width, height);
            drawAngles(ctx, landmarks, width, height);

            setStatus('success');
            onDetectionComplete?.(landmarks);
            console.log(`[SkeletonCanvas ${angle}] 骨骼标注绘制完成，共${landmarks.length}个关键点`);
          });

          // 发送图片进行检测
          try {
            await pose.send({ image: img });
          } catch (sendErr: any) {
            console.error(`[SkeletonCanvas ${angle}] 发送检测请求失败:`, sendErr);
            ctx.drawImage(img, 0, 0, width, height);
            drawErrorMessage(ctx, width, height, '检测请求失败');
            setStatus('error');
            setError('检测请求失败: ' + (sendErr.message || '未知错误'));
            onDetectionComplete?.(null);
          }
        };

        img.onerror = (e) => {
          if (!isMounted) return;
          console.error(`[SkeletonCanvas ${angle}] 图片加载失败:`, e);
          setError('图片加载失败');
          setStatus('error');
          onDetectionComplete?.(null);
        };

        img.src = imageUrl;

      } catch (err: any) {
        if (!isMounted) return;
        console.error(`[SkeletonCanvas ${angle}] 初始化失败:`, err);
        setError('骨骼检测模型加载失败: ' + (err.message || '未知错误'));
        setStatus('error');
        onDetectionComplete?.(null);
      }
    };

    initAndDetect();

    return () => {
      isMounted = false;
      if (poseRef.current) {
        try {
          poseRef.current.close?.();
        } catch (e) {
          // 忽略关闭错误
        }
        poseRef.current = null;
      }
    };
  }, [imageUrl, angle]); // 不包含 onDetectionComplete 避免重复执行

  // 下载标注图
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `体态分析_${angle}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const angleLabel = angle === 'front' ? '正面' : angle === 'back' ? '背面' : angle === 'left' ? '左侧' : '右侧';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">{angleLabel}</span>
          {status === 'loading' && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> 加载模型...
            </span>
          )}
          {status === 'detecting' && (
            <span className="text-xs text-blue-500 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> 检测中...
            </span>
          )}
          {status === 'success' && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> 检测到 {landmarkCount} 个关键点
            </span>
          )}
          {status === 'error' && (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {error || '检测失败'}
            </span>
          )}
        </div>
      </div>

      <div ref={containerRef} className="relative bg-gray-50 rounded-lg overflow-hidden min-h-[200px] flex items-center justify-center">
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">加载骨骼检测模型...</p>
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto"
          style={{ display: status === 'loading' ? 'none' : 'block' }}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleDownload}
        disabled={status !== 'success'}
      >
        <Download className="h-3 w-3 mr-1" />
        下载标注图
      </Button>
    </div>
  );
}
