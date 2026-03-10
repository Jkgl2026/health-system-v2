/**
 * 骨骼标注绘制工具 - Canvas绘制骨骼轮廓、角度标记、问题高亮
 */

import {
  Landmark,
  PostureAnalysisResult,
  PostureIssue,
  POSE_LANDMARKS,
  getSkeletonConnections,
  getKeyJoints,
  calculateAngle,
} from './pose-detection';

// 绘制配置
export interface DrawConfig {
  // 骨骼线
  skeletonColor: string;
  skeletonWidth: number;
  
  // 关键点
  landmarkColor: string;
  landmarkRadius: number;
  
  // 问题区域
  issueColors: {
    mild: string;
    moderate: string;
    severe: string;
  };
  
  // 角度标注
  angleFontSize: number;
  angleColor: string;
  
  // 标签
  labelFontSize: number;
  labelColor: string;
  labelBgColor: string;
}

// 默认配置
export const DEFAULT_DRAW_CONFIG: DrawConfig = {
  skeletonColor: 'rgba(59, 130, 246, 0.8)', // 蓝色骨骼线
  skeletonWidth: 3,
  
  landmarkColor: 'rgba(255, 255, 255, 0.9)',
  landmarkRadius: 5,
  
  issueColors: {
    mild: 'rgba(251, 191, 36, 0.6)', // 黄色 - 轻度
    moderate: 'rgba(249, 115, 22, 0.7)', // 橙色 - 中度
    severe: 'rgba(239, 68, 68, 0.8)', // 红色 - 重度
  },
  
  angleFontSize: 12,
  angleColor: 'rgba(255, 255, 255, 0.9)',
  
  labelFontSize: 11,
  labelColor: 'rgba(255, 255, 255, 0.95)',
  labelBgColor: 'rgba(0, 0, 0, 0.7)',
};

/**
 * 绘制完整的体态标注图
 */
export function drawPostureAnnotation(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  analysisResult: PostureAnalysisResult | null,
  config: Partial<DrawConfig> = {}
): void {
  const cfg = { ...DEFAULT_DRAW_CONFIG, ...config };
  
  if (!analysisResult) {
    // 绘制无数据提示
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('姿态检测中...', canvas.width / 2, canvas.height / 2);
    return;
  }

  const { landmarks, issues, angles, confidence } = analysisResult;
  
  // 1. 绘制问题区域高亮（先绘制，在最底层）
  drawIssueHighlights(ctx, landmarks, issues, cfg, canvas.width, canvas.height);
  
  // 2. 绘制骨骼线
  drawSkeleton(ctx, landmarks, cfg, canvas.width, canvas.height);
  
  // 3. 绘制关键点
  drawLandmarks(ctx, landmarks, cfg, canvas.width, canvas.height);
  
  // 4. 绘制角度标注
  drawAngleAnnotations(ctx, landmarks, angles, cfg, canvas.width, canvas.height);
  
  // 5. 绘制问题标签
  drawIssueLabels(ctx, landmarks, issues, cfg, canvas.width, canvas.height);
  
  // 6. 绘制置信度指示
  drawConfidenceIndicator(ctx, confidence, canvas.width, canvas.height);
}

/**
 * 绘制骨骼线
 */
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  config: DrawConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  const connections = getSkeletonConnections();
  
  ctx.strokeStyle = config.skeletonColor;
  ctx.lineWidth = config.skeletonWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  connections.forEach(([startIdx, endIdx]) => {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    
    // 只绘制可见度高的连接
    if (start.visibility > 0.5 && end.visibility > 0.5) {
      ctx.beginPath();
      ctx.moveTo(start.x * canvasWidth, start.y * canvasHeight);
      ctx.lineTo(end.x * canvasWidth, end.y * canvasHeight);
      ctx.stroke();
    }
  });
}

/**
 * 绘制关键点
 */
export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  config: DrawConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  // 只绘制主要关键点
  const keyIndices = [
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
  
  keyIndices.forEach((idx) => {
    const lm = landmarks[idx];
    if (lm.visibility > 0.5) {
      // 外圈
      ctx.beginPath();
      ctx.arc(lm.x * canvasWidth, lm.y * canvasHeight, config.landmarkRadius + 2, 0, Math.PI * 2);
      ctx.fillStyle = config.skeletonColor;
      ctx.fill();
      
      // 内圈
      ctx.beginPath();
      ctx.arc(lm.x * canvasWidth, lm.y * canvasHeight, config.landmarkRadius, 0, Math.PI * 2);
      ctx.fillStyle = config.landmarkColor;
      ctx.fill();
    }
  });
}

/**
 * 绘制问题区域高亮
 */
export function drawIssueHighlights(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  issues: PostureIssue[],
  config: DrawConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  issues.forEach((issue) => {
    if (issue.severity === 'none') return;
    
    const color = config.issueColors[issue.severity];
    const relevantLandmarks = issue.landmarkIndices
      .map((idx) => landmarks[idx])
      .filter((lm) => lm.visibility > 0.5);
    
    if (relevantLandmarks.length < 2) return;
    
    // 计算包围盒
    const minX = Math.min(...relevantLandmarks.map((lm) => lm.x)) * canvasWidth;
    const maxX = Math.max(...relevantLandmarks.map((lm) => lm.x)) * canvasWidth;
    const minY = Math.min(...relevantLandmarks.map((lm) => lm.y)) * canvasHeight;
    const maxY = Math.max(...relevantLandmarks.map((lm) => lm.y)) * canvasHeight;
    
    // 扩大高亮区域
    const padding = 30;
    const highlightX = minX - padding;
    const highlightY = minY - padding;
    const highlightWidth = maxX - minX + padding * 2;
    const highlightHeight = maxY - minY + padding * 2;
    
    // 绘制高亮区域
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(highlightX, highlightY, highlightWidth, highlightHeight, 10);
    ctx.fill();
    
    // 绘制边框
    ctx.strokeStyle = color.replace(/[\d.]+\)$/, '1)');
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

/**
 * 绘制角度标注
 */
export function drawAngleAnnotations(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  angles: any,
  config: DrawConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  const keyJoints = getKeyJoints();
  
  ctx.font = `bold ${config.angleFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  keyJoints.forEach((joint) => {
    if (joint.type === 'angle' && joint.indices.length === 3) {
      const [idx1, idx2, idx3] = joint.indices;
      const lm1 = landmarks[idx1];
      const lm2 = landmarks[idx2];
      const lm3 = landmarks[idx3];
      
      if (lm1.visibility > 0.5 && lm2.visibility > 0.5 && lm3.visibility > 0.5) {
        const angle = calculateAngle(lm1, lm2, lm3);
        const x = lm2.x * canvasWidth;
        const y = lm2.y * canvasHeight;
        
        // 绘制角度弧线
        drawAngleArc(ctx, lm1, lm2, lm3, canvasWidth, canvasHeight);
        
        // 绘制角度文本背景
        const textWidth = ctx.measureText(`${Math.round(angle)}°`).width + 8;
        ctx.fillStyle = config.labelBgColor;
        ctx.beginPath();
        ctx.roundRect(x - textWidth / 2, y - config.angleFontSize / 2 - 4, textWidth, config.angleFontSize + 8, 4);
        ctx.fill();
        
        // 绘制角度文本
        ctx.fillStyle = config.angleColor;
        ctx.fillText(`${Math.round(angle)}°`, x, y);
      }
    } else if (joint.type === 'line' && joint.indices.length === 2) {
      const [idx1, idx2] = joint.indices;
      const lm1 = landmarks[idx1];
      const lm2 = landmarks[idx2];
      
      if (lm1.visibility > 0.5 && lm2.visibility > 0.5) {
        const x = (lm1.x + lm2.x) / 2 * canvasWidth;
        const y = (lm1.y + lm2.y) / 2 * canvasHeight - 15;
        
        // 计算倾斜角度
        const tiltAngle = Math.atan2(lm2.y - lm1.y, lm2.x - lm1.x) * (180 / Math.PI);
        const absTilt = Math.abs(tiltAngle);
        
        // 绘制倾斜角度标签
        const text = `${absTilt.toFixed(1)}°`;
        const textWidth = ctx.measureText(text).width + 8;
        
        ctx.fillStyle = absTilt > 2 ? config.issueColors.mild : config.labelBgColor;
        ctx.beginPath();
        ctx.roundRect(x - textWidth / 2, y - config.angleFontSize / 2 - 4, textWidth, config.angleFontSize + 8, 4);
        ctx.fill();
        
        ctx.fillStyle = config.angleColor;
        ctx.fillText(text, x, y);
      }
    }
  });
}

/**
 * 绘制角度弧线
 */
function drawAngleArc(
  ctx: CanvasRenderingContext2D,
  point1: Landmark,
  vertex: Landmark,
  point2: Landmark,
  canvasWidth: number,
  canvasHeight: number,
  radius: number = 20
): void {
  const vx = vertex.x * canvasWidth;
  const vy = vertex.y * canvasHeight;
  
  const angle1 = Math.atan2(point1.y * canvasHeight - vy, point1.x * canvasWidth - vx);
  const angle2 = Math.atan2(point2.y * canvasHeight - vy, point2.x * canvasWidth - vx);
  
  ctx.beginPath();
  ctx.arc(vx, vy, radius, angle1, angle2, angle1 > angle2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * 绘制问题标签
 */
export function drawIssueLabels(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  issues: PostureIssue[],
  config: DrawConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.font = `${config.labelFontSize}px sans-serif`;
  
  issues.forEach((issue, index) => {
    if (issue.severity === 'none') return;
    
    const relevantLandmarks = issue.landmarkIndices
      .map((idx) => landmarks[idx])
      .filter((lm) => lm.visibility > 0.5);
    
    if (relevantLandmarks.length === 0) return;
    
    // 计算标签位置（在问题区域上方）
    const avgX = relevantLandmarks.reduce((sum, lm) => sum + lm.x, 0) / relevantLandmarks.length;
    const minY = Math.min(...relevantLandmarks.map((lm) => lm.y));
    const x = avgX * canvasWidth;
    const y = minY * canvasHeight - 50 - index * 25;
    
    // 标签文本
    const severityText = {
      mild: '轻度',
      moderate: '中度',
      severe: '重度',
    }[issue.severity];
    
    const text = `${issue.name} (${severityText})`;
    const textWidth = ctx.measureText(text).width + 16;
    
    // 绘制标签背景
    ctx.fillStyle = config.issueColors[issue.severity];
    ctx.beginPath();
    ctx.roundRect(x - textWidth / 2, y - config.labelFontSize / 2 - 6, textWidth, config.labelFontSize + 12, 6);
    ctx.fill();
    
    // 绘制标签文字
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  });
}

/**
 * 绘制置信度指示器
 */
export function drawConfidenceIndicator(
  ctx: CanvasRenderingContext2D,
  confidence: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  const x = canvasWidth - 100;
  const y = 20;
  const width = 80;
  const height = 8;
  
  // 背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 4);
  ctx.fill();
  
  // 进度条
  const progressWidth = width * Math.min(1, confidence);
  ctx.fillStyle = confidence > 0.7 ? '#22c55e' : confidence > 0.5 ? '#eab308' : '#ef4444';
  ctx.beginPath();
  ctx.roundRect(x, y, progressWidth, height, 4);
  ctx.fill();
  
  // 文字
  ctx.fillStyle = '#fff';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`置信度: ${(confidence * 100).toFixed(0)}%`, x, y + 20);
}

/**
 * 创建对比标注图
 */
export function createComparisonAnnotation(
  beforeResult: PostureAnalysisResult | null,
  afterResult: PostureAnalysisResult | null,
  beforeImage: HTMLImageElement | null,
  afterImage: HTMLImageElement | null,
  width: number = 1200,
  height: number = 600
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  const halfWidth = width / 2;
  
  // 绘制背景
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, width, height);
  
  // 绘制标题
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AI体态对比分析', width / 2, 30);
  
  // 绘制分割线
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(halfWidth, 50);
  ctx.lineTo(halfWidth, height - 20);
  ctx.stroke();
  
  // 左侧 - 评估前
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px sans-serif';
  ctx.fillText('评估前', halfWidth / 2, 60);
  
  if (beforeImage) {
    // 计算图片缩放
    const imgScale = Math.min((halfWidth - 40) / beforeImage.width, (height - 180) / beforeImage.height);
    const scaledWidth = beforeImage.width * imgScale;
    const scaledHeight = beforeImage.height * imgScale;
    const imgX = (halfWidth - scaledWidth) / 2;
    const imgY = 80;
    
    ctx.drawImage(beforeImage, imgX, imgY, scaledWidth, scaledHeight);
    
    // 创建标注画布
    if (beforeResult) {
      // 需要创建临时canvas来叠加标注
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = scaledWidth;
      tempCanvas.height = scaledHeight;
      const tempCtx = tempCanvas.getContext('2d')!;
      
      // 缩放后的标注
      const scaledResult = {
        ...beforeResult,
        landmarks: beforeResult.landmarks.map((lm) => ({
          ...lm,
          x: lm.x * scaledWidth / beforeImage.width,
          y: lm.y * scaledHeight / beforeImage.height,
        })),
      };
      
      drawPostureAnnotation(tempCtx, tempCanvas, scaledResult, {});
      
      // 叠加到主画布
      ctx.globalAlpha = 0.9;
      ctx.drawImage(tempCanvas, imgX, imgY);
      ctx.globalAlpha = 1;
    }
  }
  
  // 右侧 - 评估后
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px sans-serif';
  ctx.fillText('评估后', halfWidth + halfWidth / 2, 60);
  
  if (afterImage) {
    const imgScale = Math.min((halfWidth - 40) / afterImage.width, (height - 180) / afterImage.height);
    const scaledWidth = afterImage.width * imgScale;
    const scaledHeight = afterImage.height * imgScale;
    const imgX = halfWidth + (halfWidth - scaledWidth) / 2;
    const imgY = 80;
    
    ctx.drawImage(afterImage, imgX, imgY, scaledWidth, scaledHeight);
    
    if (afterResult) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = scaledWidth;
      tempCanvas.height = scaledHeight;
      const tempCtx = tempCanvas.getContext('2d')!;
      
      const scaledResult = {
        ...afterResult,
        landmarks: afterResult.landmarks.map((lm) => ({
          ...lm,
          x: lm.x * scaledWidth / afterImage.width,
          y: lm.y * scaledHeight / afterImage.height,
        })),
      };
      
      drawPostureAnnotation(tempCtx, tempCanvas, scaledResult, {});
      
      ctx.globalAlpha = 0.9;
      ctx.drawImage(tempCanvas, imgX, imgY);
      ctx.globalAlpha = 1;
    }
  }
  
  // 绘制评分对比
  const beforeScore = beforeResult?.overallScore || 0;
  const afterScore = afterResult?.overallScore || 0;
  const scoreChange = afterScore - beforeScore;
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`评分: ${beforeScore}`, halfWidth / 2, height - 50);
  ctx.fillText(`评分: ${afterScore}`, halfWidth + halfWidth / 2, height - 50);
  
  // 绘制变化标签
  if (scoreChange !== 0) {
    const changeText = scoreChange > 0 ? `+${scoreChange}` : `${scoreChange}`;
    ctx.fillStyle = scoreChange > 0 ? '#22c55e' : '#ef4444';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(changeText, width / 2, height - 50);
  }
  
  return canvas;
}

/**
 * 导出标注图为DataURL
 */
export function exportAnnotationAsDataURL(canvas: HTMLCanvasElement, format: 'png' | 'jpeg' = 'png'): string {
  return canvas.toDataURL(`image/${format}`, 0.95);
}

/**
 * 下载标注图
 */
export function downloadAnnotation(canvas: HTMLCanvasElement, filename: string = 'posture-annotation.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
