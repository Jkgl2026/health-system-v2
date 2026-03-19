/**
 * 增强版骨骼标注绘制工具 - 完整的Canvas绘制方案
 */

import {
  Landmark,
  EnhancedPostureAnalysisResult,
  PostureIssue,
  POSE_LANDMARKS,
  getSkeletonConnections,
  calculateAngle,
  Severity,
} from './pose-detection-enhanced';

// 绘制配置
export interface EnhancedDrawConfig {
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
  
  // 是否显示详细信息
  showLandmarkLabels: boolean;
  showAngleArcs: boolean;
  showConfidence: boolean;
}

// 默认配置
export const DEFAULT_ENHANCED_DRAW_CONFIG: EnhancedDrawConfig = {
  skeletonColor: 'rgba(59, 130, 246, 0.9)',
  skeletonWidth: 3,
  
  landmarkColor: 'rgba(255, 255, 255, 1)',
  landmarkRadius: 6,
  
  issueColors: {
    mild: 'rgba(251, 191, 36, 0.5)',
    moderate: 'rgba(249, 115, 22, 0.6)',
    severe: 'rgba(239, 68, 68, 0.7)',
  },
  
  angleFontSize: 11,
  angleColor: 'rgba(255, 255, 255, 0.95)',
  
  labelFontSize: 10,
  labelColor: 'rgba(255, 255, 255, 0.95)',
  labelBgColor: 'rgba(0, 0, 0, 0.75)',
  
  showLandmarkLabels: false,
  showAngleArcs: true,
  showConfidence: true,
};

// 关键点名称映射
const LANDMARK_NAMES: Record<number, string> = {
  0: '鼻子',
  1: '左眼内角',
  2: '左眼',
  3: '左眼外角',
  4: '右眼内角',
  5: '右眼',
  6: '右眼外角',
  7: '左耳',
  8: '右耳',
  9: '左嘴角',
  10: '右嘴角',
  11: '左肩',
  12: '右肩',
  13: '左肘',
  14: '右肘',
  15: '左腕',
  16: '右腕',
  17: '左小指',
  18: '右小指',
  19: '左食指',
  20: '右食指',
  21: '左拇指',
  22: '右拇指',
  23: '左髋',
  24: '右髋',
  25: '左膝',
  26: '右膝',
  27: '左踝',
  28: '右踝',
  29: '左跟',
  30: '右跟',
  31: '左足',
  32: '右足',
};

/**
 * 绘制完整的体态标注图（增强版）
 */
export function drawPostureAnnotationEnhanced(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  analysisResult: EnhancedPostureAnalysisResult | null,
  config: Partial<EnhancedDrawConfig> = {}
): void {
  const cfg = { ...DEFAULT_ENHANCED_DRAW_CONFIG, ...config };
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
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
  
  const { landmarks, issues, extendedAngles, confidence } = analysisResult;
  
  // 1. 绘制问题区域高亮（最底层）
  drawIssueHighlightsEnhanced(ctx, landmarks, issues, cfg, canvas.width, canvas.height);
  
  // 2. 绘制骨骼线
  drawSkeletonEnhanced(ctx, landmarks, cfg, canvas.width, canvas.height);
  
  // 3. 绘制关键点
  drawLandmarksEnhanced(ctx, landmarks, cfg, canvas.width, canvas.height);
  
  // 4. 绘制角度标注
  drawAngleAnnotationsEnhanced(ctx, landmarks, extendedAngles, cfg, canvas.width, canvas.height);
  
  // 5. 绘制问题标签
  drawIssueLabelsEnhanced(ctx, landmarks, issues, cfg, canvas.width, canvas.height);
  
  // 6. 绘制置信度指示
  if (cfg.showConfidence) {
    drawConfidenceIndicatorEnhanced(ctx, confidence, canvas.width, canvas.height);
  }
  
  // 7. 绘制关键点编号（可选）
  if (cfg.showLandmarkLabels) {
    drawLandmarkLabels(ctx, landmarks, cfg, canvas.width, canvas.height);
  }
}

/**
 * 绘制骨骼线（增强版）
 */
export function drawSkeletonEnhanced(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  config: EnhancedDrawConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  const connections = getSkeletonConnections();
  
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  connections.forEach(([startIdx, endIdx]) => {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    
    if (start.visibility > 0.5 && end.visibility > 0.5) {
      // 根据可见度调整透明度
      const avgVisibility = (start.visibility + end.visibility) / 2;
      const alpha = 0.5 + avgVisibility * 0.5;
      
      ctx.beginPath();
      ctx.moveTo(start.x * canvasWidth, start.y * canvasHeight);
      ctx.lineTo(end.x * canvasWidth, end.y * canvasHeight);
      
      // 绘制阴影效果
      ctx.strokeStyle = `rgba(0, 0, 0, 0.3)`;
      ctx.lineWidth = config.skeletonWidth + 2;
      ctx.stroke();
      
      // 绘制主线条
      ctx.strokeStyle = config.skeletonColor.replace(/[\d.]+\)$/, `${alpha})`);
      ctx.lineWidth = config.skeletonWidth;
      ctx.stroke();
    }
  });
}

/**
 * 绘制关键点（增强版）
 */
export function drawLandmarksEnhanced(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  config: EnhancedDrawConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  // 主要关键点
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
    POSE_LANDMARKS.LEFT_EAR,
    POSE_LANDMARKS.RIGHT_EAR,
  ];
  
  keyIndices.forEach((idx) => {
    const lm = landmarks[idx];
    if (lm.visibility > 0.5) {
      const x = lm.x * canvasWidth;
      const y = lm.y * canvasHeight;
      
      // 外圈阴影
      ctx.beginPath();
      ctx.arc(x, y, config.landmarkRadius + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
      
      // 外圈
      ctx.beginPath();
      ctx.arc(x, y, config.landmarkRadius + 2, 0, Math.PI * 2);
      ctx.fillStyle = config.skeletonColor;
      ctx.fill();
      
      // 内圈
      ctx.beginPath();
      ctx.arc(x, y, config.landmarkRadius, 0, Math.PI * 2);
      ctx.fillStyle = config.landmarkColor;
      ctx.fill();
      
      // 高亮点
      ctx.beginPath();
      ctx.arc(x - 1, y - 1, config.landmarkRadius - 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
    }
  });
}

/**
 * 绘制关键点标签
 */
export function drawLandmarkLabels(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  config: EnhancedDrawConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  const keyIndices = [
    POSE_LANDMARKS.NOSE,
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS.LEFT_KNEE,
    POSE_LANDMARKS.RIGHT_KNEE,
    POSE_LANDMARKS.LEFT_ANKLE,
    POSE_LANDMARKS.RIGHT_ANKLE,
  ];
  
  ctx.font = `${config.labelFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  keyIndices.forEach((idx) => {
    const lm = landmarks[idx];
    if (lm.visibility > 0.5) {
      const x = lm.x * canvasWidth;
      const y = lm.y * canvasHeight;
      const name = LANDMARK_NAMES[idx] || `#${idx}`;
      
      const textWidth = ctx.measureText(name).width + 10;
      const labelY = y - config.landmarkRadius - 12;
      
      ctx.fillStyle = config.labelBgColor;
      ctx.beginPath();
      ctx.roundRect(x - textWidth / 2, labelY - config.labelFontSize / 2 - 3, textWidth, config.labelFontSize + 6, 4);
      ctx.fill();
      
      ctx.fillStyle = config.labelColor;
      ctx.fillText(name, x, labelY);
    }
  });
}

/**
 * 绘制问题区域高亮（增强版）
 */
export function drawIssueHighlightsEnhanced(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  issues: PostureIssue[],
  config: EnhancedDrawConfig,
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
    const padding = 40;
    const highlightX = minX - padding;
    const highlightY = minY - padding;
    const highlightWidth = maxX - minX + padding * 2;
    const highlightHeight = maxY - minY + padding * 2;
    
    // 绘制渐变高亮
    const gradient = ctx.createRadialGradient(
      (minX + maxX) / 2, (minY + maxY) / 2, 0,
      (minX + maxX) / 2, (minY + maxY) / 2, Math.max(highlightWidth, highlightHeight) / 2
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(highlightX, highlightY, highlightWidth, highlightHeight, 15);
    ctx.fill();
    
    // 绘制边框
    ctx.strokeStyle = color.replace(/[\d.]+\)$/, '1)');
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

/**
 * 绘制角度标注（增强版）
 */
export function drawAngleAnnotationsEnhanced(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  angles: any,
  config: EnhancedDrawConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  // 定义需要标注角度的关节
  const angleJoints = [
    { name: '左肩', indices: [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP] },
    { name: '右肩', indices: [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP] },
    { name: '左肘', indices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST] },
    { name: '右肘', indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST] },
    { name: '左髋', indices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE] },
    { name: '右髋', indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE] },
    { name: '左膝', indices: [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE] },
    { name: '右膝', indices: [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE] },
  ];
  
  ctx.font = `bold ${config.angleFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  angleJoints.forEach((joint) => {
    const [idx1, idx2, idx3] = joint.indices;
    const lm1 = landmarks[idx1];
    const lm2 = landmarks[idx2];
    const lm3 = landmarks[idx3];
    
    if (lm1.visibility > 0.5 && lm2.visibility > 0.5 && lm3.visibility > 0.5) {
      const angle = calculateAngle(lm1, lm2, lm3);
      const x = lm2.x * canvasWidth;
      const y = lm2.y * canvasHeight;
      
      // 绘制角度弧线
      if (config.showAngleArcs) {
        drawAngleArcEnhanced(ctx, lm1, lm2, lm3, canvasWidth, canvasHeight);
      }
      
      // 绘制角度文本背景
      const text = `${Math.round(angle)}°`;
      const textWidth = ctx.measureText(text).width + 10;
      
      ctx.fillStyle = config.labelBgColor;
      ctx.beginPath();
      ctx.roundRect(x - textWidth / 2, y - config.angleFontSize / 2 - 5, textWidth, config.angleFontSize + 10, 6);
      ctx.fill();
      
      // 绘制角度文本
      ctx.fillStyle = config.angleColor;
      ctx.fillText(text, x, y);
    }
  });
  
  // 绘制倾斜角度（肩线、骨盆线）
  drawTiltAngles(ctx, landmarks, config, canvasWidth, canvasHeight);
}

/**
 * 绘制倾斜角度
 */
function drawTiltAngles(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  config: EnhancedDrawConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.font = `${config.labelFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  
  // 肩线倾斜
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  
  if (leftShoulder.visibility > 0.5 && rightShoulder.visibility > 0.5) {
    const shoulderTilt = Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x
    ) * (180 / Math.PI);
    
    const x = (leftShoulder.x + rightShoulder.x) / 2 * canvasWidth;
    const y = (leftShoulder.y + rightShoulder.y) / 2 * canvasHeight - 25;
    
    const isAbnormal = Math.abs(shoulderTilt) > 2;
    
    const text = `肩倾斜: ${Math.abs(shoulderTilt).toFixed(1)}°`;
    const textWidth = ctx.measureText(text).width + 10;
    
    ctx.fillStyle = isAbnormal ? config.issueColors.mild : config.labelBgColor;
    ctx.beginPath();
    ctx.roundRect(x - textWidth / 2, y - config.labelFontSize / 2 - 3, textWidth, config.labelFontSize + 6, 4);
    ctx.fill();
    
    ctx.fillStyle = config.labelColor;
    ctx.fillText(text, x, y);
  }
  
  // 骨盆倾斜
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  
  if (leftHip.visibility > 0.5 && rightHip.visibility > 0.5) {
    const hipTilt = Math.atan2(
      rightHip.y - leftHip.y,
      rightHip.x - leftHip.x
    ) * (180 / Math.PI);
    
    const x = (leftHip.x + rightHip.x) / 2 * canvasWidth;
    const y = (leftHip.y + rightHip.y) / 2 * canvasHeight + 30;
    
    const isAbnormal = Math.abs(hipTilt) > 2;
    
    const text = `骨盆倾斜: ${Math.abs(hipTilt).toFixed(1)}°`;
    const textWidth = ctx.measureText(text).width + 10;
    
    ctx.fillStyle = isAbnormal ? config.issueColors.mild : config.labelBgColor;
    ctx.beginPath();
    ctx.roundRect(x - textWidth / 2, y - config.labelFontSize / 2 - 3, textWidth, config.labelFontSize + 6, 4);
    ctx.fill();
    
    ctx.fillStyle = config.labelColor;
    ctx.fillText(text, x, y);
  }
}

/**
 * 绘制角度弧线（增强版）
 */
function drawAngleArcEnhanced(
  ctx: CanvasRenderingContext2D,
  point1: Landmark,
  vertex: Landmark,
  point2: Landmark,
  canvasWidth: number,
  canvasHeight: number,
  radius: number = 25
): void {
  const vx = vertex.x * canvasWidth;
  const vy = vertex.y * canvasHeight;
  
  const angle1 = Math.atan2(
    point1.y * canvasHeight - vy,
    point1.x * canvasWidth - vx
  );
  const angle2 = Math.atan2(
    point2.y * canvasHeight - vy,
    point2.x * canvasWidth - vx
  );
  
  // 绘制弧线填充
  ctx.beginPath();
  ctx.moveTo(vx, vy);
  ctx.arc(vx, vy, radius, angle1, angle2, angle1 > angle2);
  ctx.closePath();
  ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
  ctx.fill();
  
  // 绘制弧线边框
  ctx.beginPath();
  ctx.arc(vx, vy, radius, angle1, angle2, angle1 > angle2);
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * 绘制问题标签（增强版）
 */
export function drawIssueLabelsEnhanced(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  issues: PostureIssue[],
  config: EnhancedDrawConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.font = `bold ${config.labelFontSize + 1}px sans-serif`;
  
  // 按严重程度排序，重度在前
  const sortedIssues = [...issues].sort((a, b) => {
    const order = { severe: 0, moderate: 1, mild: 2, none: 3 };
    return order[a.severity] - order[b.severity];
  });
  
  sortedIssues.forEach((issue, index) => {
    if (issue.severity === 'none') return;
    
    const relevantLandmarks = issue.landmarkIndices
      .map((idx) => landmarks[idx])
      .filter((lm) => lm.visibility > 0.5);
    
    if (relevantLandmarks.length === 0) return;
    
    // 计算标签位置（在问题区域上方）
    const avgX = relevantLandmarks.reduce((sum, lm) => sum + lm.x, 0) / relevantLandmarks.length;
    const minY = Math.min(...relevantLandmarks.map((lm) => lm.y));
    const x = avgX * canvasWidth;
    const y = minY * canvasHeight - 60 - index * 28;
    
    // 确保标签在画布内
    const clampedY = Math.max(20, y);
    
    // 标签文本
    const severityText = {
      mild: '轻度',
      moderate: '中度',
      severe: '重度',
    }[issue.severity];
    
    const text = `${issue.name} (${severityText})`;
    const textWidth = ctx.measureText(text).width + 20;
    
    // 绘制标签背景
    ctx.fillStyle = config.issueColors[issue.severity];
    ctx.beginPath();
    ctx.roundRect(x - textWidth / 2, clampedY - config.labelFontSize / 2 - 8, textWidth, config.labelFontSize + 16, 8);
    ctx.fill();
    
    // 绘制标签边框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 绘制标签文字
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, clampedY);
  });
}

/**
 * 绘制置信度指示器（增强版）
 */
export function drawConfidenceIndicatorEnhanced(
  ctx: CanvasRenderingContext2D,
  confidence: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  const padding = 15;
  const barWidth = 100;
  const barHeight = 6;
  const x = canvasWidth - barWidth - padding;
  const y = padding;
  
  // 背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.roundRect(x - 5, y - 5, barWidth + 10, barHeight + 25, 6);
  ctx.fill();
  
  // 进度条背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.roundRect(x, y, barWidth, barHeight, 3);
  ctx.fill();
  
  // 进度条
  const progressWidth = barWidth * Math.min(1, confidence);
  const color = confidence > 0.8 ? '#22c55e' : confidence > 0.6 ? '#eab308' : '#ef4444';
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, progressWidth, barHeight, 3);
  ctx.fill();
  
  // 文字
  ctx.fillStyle = '#fff';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`检测置信度: ${(confidence * 100).toFixed(0)}%`, x + barWidth, y + 18);
}

/**
 * 在图片上绘制骨骼标注并返回新的Canvas
 */
export function createAnnotatedCanvas(
  imageElement: HTMLImageElement,
  analysisResult: EnhancedPostureAnalysisResult | null,
  config: Partial<EnhancedDrawConfig> = {}
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // 设置画布尺寸
  const maxWidth = 800;
  const scale = imageElement.width > maxWidth ? maxWidth / imageElement.width : 1;
  canvas.width = imageElement.width * scale;
  canvas.height = imageElement.height * scale;
  
  // 绘制原图
  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  
  // 绘制骨骼标注
  if (analysisResult) {
    // 需要将landmarks的坐标缩放到新尺寸
    const scaledLandmarks = analysisResult.landmarks.map(lm => ({
      ...lm,
      // x和y保持相对坐标(0-1)，不需要缩放
    }));
    
    const scaledResult: EnhancedPostureAnalysisResult = {
      ...analysisResult,
      landmarks: scaledLandmarks,
    };
    
    drawPostureAnnotationEnhanced(ctx, canvas, scaledResult, config);
  }
  
  return canvas;
}

/**
 * 下载标注图
 */
export function downloadAnnotatedImage(
  canvas: HTMLCanvasElement,
  filename: string = 'posture-analysis.png'
): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

/**
 * 将标注图转换为DataURL
 */
export function canvasToDataURL(canvas: HTMLCanvasElement, format: 'png' | 'jpeg' = 'png'): string {
  return canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : 1.0);
}

/**
 * 绘制对比图
 */
export function createComparisonImage(
  beforeCanvas: HTMLCanvasElement,
  afterCanvas: HTMLCanvasElement,
  beforeScore: number,
  afterScore: number,
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
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AI体态对比分析', width / 2, 40);
  
  // 绘制分割线
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(halfWidth, 60);
  ctx.lineTo(halfWidth, height - 60);
  ctx.stroke();
  
  // 绘制标签
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('改善前', halfWidth / 2, 80);
  ctx.fillText('改善后', halfWidth + halfWidth / 2, 80);
  
  // 绘制图片
  const imgScale = Math.min((halfWidth - 40) / beforeCanvas.width, (height - 200) / beforeCanvas.height);
  const scaledWidth = beforeCanvas.width * imgScale;
  const scaledHeight = beforeCanvas.height * imgScale;
  
  // 左侧
  ctx.drawImage(beforeCanvas, (halfWidth - scaledWidth) / 2, 100, scaledWidth, scaledHeight);
  // 右侧
  ctx.drawImage(afterCanvas, halfWidth + (halfWidth - scaledWidth) / 2, 100, scaledWidth, scaledHeight);
  
  // 绘制评分
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`评分: ${beforeScore}`, halfWidth / 2, height - 50);
  ctx.fillText(`评分: ${afterScore}`, halfWidth + halfWidth / 2, height - 50);
  
  // 绘制变化
  const change = afterScore - beforeScore;
  const changeText = change > 0 ? `+${change}` : `${change}`;
  ctx.fillStyle = change > 0 ? '#22c55e' : change < 0 ? '#ef4444' : '#94a3b8';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(changeText, width / 2, height - 50);
  
  return canvas;
}
