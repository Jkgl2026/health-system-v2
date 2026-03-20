'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// MediaPipe Pose 关键点索引
const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
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
  // 头部
  [POSE_LANDMARKS.LEFT_EAR, POSE_LANDMARKS.LEFT_EYE_OUTER],
  [POSE_LANDMARKS.LEFT_EYE_OUTER, POSE_LANDMARKS.LEFT_EYE],
  [POSE_LANDMARKS.LEFT_EYE, POSE_LANDMARKS.LEFT_EYE_INNER],
  [POSE_LANDMARKS.LEFT_EYE_INNER, POSE_LANDMARKS.NOSE],
  [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.RIGHT_EYE_INNER],
  [POSE_LANDMARKS.RIGHT_EYE_INNER, POSE_LANDMARKS.RIGHT_EYE],
  [POSE_LANDMARKS.RIGHT_EYE, POSE_LANDMARKS.RIGHT_EYE_OUTER],
  [POSE_LANDMARKS.RIGHT_EYE_OUTER, POSE_LANDMARKS.RIGHT_EAR],
  // 躯干
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
  // 左臂
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  // 右臂
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
  // 左腿
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
  [POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.LEFT_HEEL],
  [POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.LEFT_FOOT_INDEX],
  // 右腿
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
  [POSE_LANDMARKS.RIGHT_ANKLE, POSE_LANDMARKS.RIGHT_HEEL],
  [POSE_LANDMARKS.RIGHT_ANKLE, POSE_LANDMARKS.RIGHT_FOOT_INDEX],
];

// 主要关键点
const KEY_LANDMARKS = [
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

export default function SkeletonAnnotationCanvas({
  imageUrl,
  angle,
  onDetectionComplete,
}: SkeletonAnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'detecting' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [landmarkCount, setLandmarkCount] = useState<number>(0);

  // 初始化 MediaPipe
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initPose = async () => {
      try {
        setStatus('loading');
        // @ts-ignore
        const { Pose } = await import('@mediapipe/pose');
        
        const pose = new Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          },
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        poseRef.current = pose;
        console.log(`[SkeletonCanvas ${angle}] MediaPipe 初始化完成`);
      } catch (err) {
        console.error(`[SkeletonCanvas ${angle}] MediaPipe 初始化失败:`, err);
        setError('骨骼检测模型加载失败');
        setStatus('error');
      }
    };

    initPose();

    return () => {
      if (poseRef.current) {
        poseRef.current.close?.();
      }
    };
  }, [angle]);

  // 执行检测
  const performDetection = useCallback(async () => {
    if (!poseRef.current || !imageUrl || !canvasRef.current) {
      console.log(`[SkeletonCanvas ${angle}] 条件不满足:`, {
        hasPose: !!poseRef.current,
        hasImage: !!imageUrl,
        hasCanvas: !!canvasRef.current,
      });
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setStatus('detecting');
    setError('');

    console.log(`[SkeletonCanvas ${angle}] 开始检测...`);

    // 加载图片
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        // 设置画布尺寸
        const maxWidth = 600;
        const scale = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;

        // 先绘制原图
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        console.log(`[SkeletonCanvas ${angle}] 原图绘制完成: ${canvas.width}x${canvas.height}`);

        // 设置检测回调
        poseRef.current.onResults((results: any) => {
          console.log(`[SkeletonCanvas ${angle}] 检测结果:`, {
            hasLandmarks: !!results.poseLandmarks,
            landmarkCount: results.poseLandmarks?.length || 0,
          });

          if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
            // 检测失败，显示提示
            drawNoDetectionMessage(ctx, canvas.width, canvas.height);
            setStatus('error');
            setError('未检测到人体骨骼，请确保照片中有完整的人体');
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

          // 绘制骨骼标注（在原图上叠加）
          drawSkeleton(ctx, landmarks, canvas.width, canvas.height);
          drawLandmarks(ctx, landmarks, canvas.width, canvas.height);
          drawAngles(ctx, landmarks, canvas.width, canvas.height);

          setStatus('success');
          onDetectionComplete?.(landmarks);
          console.log(`[SkeletonCanvas ${angle}] 骨骼标注绘制完成`);
        });

        // 发送图片进行检测
        await poseRef.current.send({ image: img });
      } catch (err: any) {
        console.error(`[SkeletonCanvas ${angle}] 检测过程出错:`, err);
        
        // 重新绘制原图
        const retryImg = new Image();
        retryImg.crossOrigin = 'anonymous';
        retryImg.onload = () => {
          ctx.drawImage(retryImg, 0, 0, canvas.width, canvas.height);
          drawErrorMessage(ctx, canvas.width, canvas.height, err.message || '检测失败');
        };
        retryImg.src = imageUrl;
        
        setStatus('error');
        setError(err.message || '骨骼检测失败');
        onDetectionComplete?.(null);
      }
    };

    img.onerror = () => {
      console.error(`[SkeletonCanvas ${angle}] 图片加载失败`);
      drawErrorMessage(ctx, canvas.width, canvas.height, '图片加载失败');
      setStatus('error');
      setError('图片加载失败');
      onDetectionComplete?.(null);
    };

    img.src = imageUrl;
  }, [imageUrl, angle, onDetectionComplete]);

  // 当图片URL变化时执行检测
  useEffect(() => {
    if (imageUrl && poseRef.current) {
      performDetection();
    }
  }, [imageUrl, performDetection]);

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
            <span className="text-xs text-green-500 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> 检测到 {landmarkCount} 个关键点
            </span>
          )}
          {status === 'error' && (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {error}
            </span>
          )}
        </div>
        {status === 'success' && (
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-3 w-3 mr-1" />
            下载
          </Button>
        )}
      </div>
      <div className="relative bg-gray-50 rounded-lg overflow-hidden border">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ minHeight: '200px' }}
        />
      </div>
    </div>
  );
}

// 绘制骨骼线
function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  SKELETON_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];

    if (start.visibility > 0.5 && end.visibility > 0.5) {
      const alpha = Math.min(start.visibility, end.visibility);
      
      // 阴影
      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 5;
      ctx.stroke();

      // 主线
      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
      ctx.lineWidth = 3;
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
  KEY_LANDMARKS.forEach((idx) => {
    const lm = landmarks[idx];
    if (lm.visibility > 0.5) {
      const x = lm.x * width;
      const y = lm.y * height;

      // 外圈
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
      ctx.fill();

      // 内圈
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fill();

      // 高光
      ctx.beginPath();
      ctx.arc(x - 1, y - 1, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
    }
  });
}

// 绘制角度
function drawAngles(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
) {
  const angleJoints = [
    { name: '左肩', p1: POSE_LANDMARKS.LEFT_ELBOW, vertex: POSE_LANDMARKS.LEFT_SHOULDER, p2: POSE_LANDMARKS.LEFT_HIP },
    { name: '右肩', p1: POSE_LANDMARKS.RIGHT_ELBOW, vertex: POSE_LANDMARKS.RIGHT_SHOULDER, p2: POSE_LANDMARKS.RIGHT_HIP },
    { name: '左肘', p1: POSE_LANDMARKS.LEFT_SHOULDER, vertex: POSE_LANDMARKS.LEFT_ELBOW, p2: POSE_LANDMARKS.LEFT_WRIST },
    { name: '右肘', p1: POSE_LANDMARKS.RIGHT_SHOULDER, vertex: POSE_LANDMARKS.RIGHT_ELBOW, p2: POSE_LANDMARKS.RIGHT_WRIST },
    { name: '左髋', p1: POSE_LANDMARKS.LEFT_SHOULDER, vertex: POSE_LANDMARKS.LEFT_HIP, p2: POSE_LANDMARKS.LEFT_KNEE },
    { name: '右髋', p1: POSE_LANDMARKS.RIGHT_SHOULDER, vertex: POSE_LANDMARKS.RIGHT_HIP, p2: POSE_LANDMARKS.RIGHT_KNEE },
    { name: '左膝', p1: POSE_LANDMARKS.LEFT_HIP, vertex: POSE_LANDMARKS.LEFT_KNEE, p2: POSE_LANDMARKS.LEFT_ANKLE },
    { name: '右膝', p1: POSE_LANDMARKS.RIGHT_HIP, vertex: POSE_LANDMARKS.RIGHT_KNEE, p2: POSE_LANDMARKS.RIGHT_ANKLE },
  ];

  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  angleJoints.forEach((joint) => {
    const lm1 = landmarks[joint.p1];
    const lm2 = landmarks[joint.vertex];
    const lm3 = landmarks[joint.p2];

    if (lm1.visibility > 0.5 && lm2.visibility > 0.5 && lm3.visibility > 0.5) {
      const angle = calculateAngle(lm1, lm2, lm3);
      const x = lm2.x * width;
      const y = lm2.y * height;

      const text = `${Math.round(angle)}°`;
      const textWidth = ctx.measureText(text).width + 10;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(x - textWidth / 2, y - 10, textWidth, 18, 4);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.fillText(text, x, y);
    }
  });

  // 绘制肩倾斜
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  
  if (leftShoulder.visibility > 0.5 && rightShoulder.visibility > 0.5) {
    const shoulderTilt = Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x
    ) * (180 / Math.PI);
    
    const x = (leftShoulder.x + rightShoulder.x) / 2 * width;
    const y = (leftShoulder.y + rightShoulder.y) / 2 * height - 30;
    
    const text = `肩倾斜: ${Math.abs(shoulderTilt).toFixed(1)}°`;
    const textWidth = ctx.measureText(text).width + 10;
    
    ctx.fillStyle = Math.abs(shoulderTilt) > 3 ? 'rgba(251, 191, 36, 0.9)' : 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(x - textWidth / 2, y - 8, textWidth, 16, 4);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.fillText(text, x, y);
  }

  // 绘制骨盆倾斜
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  
  if (leftHip.visibility > 0.5 && rightHip.visibility > 0.5) {
    const hipTilt = Math.atan2(
      rightHip.y - leftHip.y,
      rightHip.x - leftHip.x
    ) * (180 / Math.PI);
    
    const x = (leftHip.x + rightHip.x) / 2 * width;
    const y = (leftHip.y + rightHip.y) / 2 * height + 30;
    
    const text = `骨盆倾斜: ${Math.abs(hipTilt).toFixed(1)}°`;
    const textWidth = ctx.measureText(text).width + 10;
    
    ctx.fillStyle = Math.abs(hipTilt) > 3 ? 'rgba(251, 191, 36, 0.9)' : 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(x - textWidth / 2, y - 8, textWidth, 16, 4);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.fillText(text, x, y);
  }
}

// 计算角度
function calculateAngle(p1: Landmark, p2: Landmark, p3: Landmark): number {
  const radians =
    Math.atan2(p3.y - p2.y, p3.x - p2.x) -
    Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) {
    angle = 360 - angle;
  }
  return angle;
}

// 绘制无检测消息
function drawNoDetectionMessage(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, width, height);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('未检测到人体骨骼', width / 2, height / 2 - 15);
  
  ctx.font = '12px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText('请确保照片中有完整的人体正面/侧面', width / 2, height / 2 + 10);
}

// 绘制错误消息
function drawErrorMessage(ctx: CanvasRenderingContext2D, width: number, height: number, message: string) {
  ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
  ctx.fillRect(10, 10, width - 20, 40);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`检测错误: ${message}`, 20, 30);
}
