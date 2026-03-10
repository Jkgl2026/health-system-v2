/**
 * 姿态检测工具 - 使用MediaPipe检测人体关键点
 */

// MediaPipe Pose 关键点索引
export const POSE_LANDMARKS = {
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

// 关键点类型
export interface Landmark {
  x: number; // 0-1 相对坐标
  y: number; // 0-1 相对坐标
  z: number; // 深度信息
  visibility: number; // 可见度 0-1
}

// 检测结果
export interface PoseDetectionResult {
  landmarks: Landmark[]; // 33个关键点
  worldLandmarks?: Landmark[]; // 世界坐标
  imageSize: { width: number; height: number };
  confidence: number; // 整体置信度
}

// 关节角度
export interface JointAngles {
  leftShoulderAngle: number;
  rightShoulderAngle: number;
  leftElbowAngle: number;
  rightElbowAngle: number;
  leftHipAngle: number;
  rightHipAngle: number;
  leftKneeAngle: number;
  rightKneeAngle: number;
  shoulderTilt: number; // 肩膀倾斜角度
  hipTilt: number; // 骨盆倾斜角度
  headTilt: number; // 头部倾斜角度
  spinalAlignment: number; // 脊柱对齐度
}

// 体态问题
export interface PostureIssue {
  name: string;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  angle: number;
  threshold: number;
  description: string;
  landmarkIndices: number[];
}

// 体态分析结果
export interface PostureAnalysisResult {
  landmarks: Landmark[];
  angles: JointAngles;
  issues: PostureIssue[];
  overallScore: number;
  confidence: number;
}

/**
 * 计算三点形成的角度
 */
export function calculateAngle(
  pointA: Landmark,
  pointB: Landmark,
  pointC: Landmark
): number {
  const radians =
    Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) {
    angle = 360 - angle;
  }
  return angle;
}

/**
 * 计算两点连线的倾斜角度（相对于水平线）
 */
export function calculateTiltAngle(
  pointA: Landmark,
  pointB: Landmark
): number {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;
  const radians = Math.atan2(dy, dx);
  return (radians * 180) / Math.PI;
}

/**
 * 计算所有关节角度
 */
export function calculateAllAngles(landmarks: Landmark[]): JointAngles {
  const leftShoulderAngle = calculateAngle(
    landmarks[POSE_LANDMARKS.LEFT_ELBOW],
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
    landmarks[POSE_LANDMARKS.LEFT_HIP]
  );

  const rightShoulderAngle = calculateAngle(
    landmarks[POSE_LANDMARKS.RIGHT_ELBOW],
    landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
    landmarks[POSE_LANDMARKS.RIGHT_HIP]
  );

  const leftElbowAngle = calculateAngle(
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
    landmarks[POSE_LANDMARKS.LEFT_ELBOW],
    landmarks[POSE_LANDMARKS.LEFT_WRIST]
  );

  const rightElbowAngle = calculateAngle(
    landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
    landmarks[POSE_LANDMARKS.RIGHT_ELBOW],
    landmarks[POSE_LANDMARKS.RIGHT_WRIST]
  );

  const leftHipAngle = calculateAngle(
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
    landmarks[POSE_LANDMARKS.LEFT_HIP],
    landmarks[POSE_LANDMARKS.LEFT_KNEE]
  );

  const rightHipAngle = calculateAngle(
    landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
    landmarks[POSE_LANDMARKS.RIGHT_HIP],
    landmarks[POSE_LANDMARKS.RIGHT_KNEE]
  );

  const leftKneeAngle = calculateAngle(
    landmarks[POSE_LANDMARKS.LEFT_HIP],
    landmarks[POSE_LANDMARKS.LEFT_KNEE],
    landmarks[POSE_LANDMARKS.LEFT_ANKLE]
  );

  const rightKneeAngle = calculateAngle(
    landmarks[POSE_LANDMARKS.RIGHT_HIP],
    landmarks[POSE_LANDMARKS.RIGHT_KNEE],
    landmarks[POSE_LANDMARKS.RIGHT_ANKLE]
  );

  const shoulderTilt = calculateTiltAngle(
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
    landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
  );

  const hipTilt = calculateTiltAngle(
    landmarks[POSE_LANDMARKS.LEFT_HIP],
    landmarks[POSE_LANDMARKS.RIGHT_HIP]
  );

  const headTilt = calculateTiltAngle(
    landmarks[POSE_LANDMARKS.LEFT_EAR],
    landmarks[POSE_LANDMARKS.RIGHT_EAR]
  );

  // 计算脊柱对齐度（鼻尖到两髋中点的偏离）
  const hipCenter = {
    x: (landmarks[POSE_LANDMARKS.LEFT_HIP].x + landmarks[POSE_LANDMARKS.RIGHT_HIP].x) / 2,
    y: (landmarks[POSE_LANDMARKS.LEFT_HIP].y + landmarks[POSE_LANDMARKS.RIGHT_HIP].y) / 2,
    z: 0,
    visibility: 1,
  };
  const spinalDeviation = Math.abs(landmarks[POSE_LANDMARKS.NOSE].x - hipCenter.x);
  const spinalAlignment = 100 - spinalDeviation * 500; // 转换为百分比

  return {
    leftShoulderAngle,
    rightShoulderAngle,
    leftElbowAngle,
    rightElbowAngle,
    leftHipAngle,
    rightHipAngle,
    leftKneeAngle,
    rightKneeAngle,
    shoulderTilt,
    hipTilt,
    headTilt,
    spinalAlignment: Math.max(0, Math.min(100, spinalAlignment)),
  };
}

/**
 * 检测体态问题
 */
export function detectPostureIssues(
  landmarks: Landmark[],
  angles: JointAngles
): PostureIssue[] {
  const issues: PostureIssue[] = [];
  const avgVisibility = landmarks.reduce((sum, lm) => sum + lm.visibility, 0) / landmarks.length;

  // 只在置信度足够高时进行检测
  if (avgVisibility < 0.5) {
    return issues;
  }

  // 1. 高低肩检测
  if (Math.abs(angles.shoulderTilt) > 1) {
    const severity = Math.abs(angles.shoulderTilt) > 5 ? 'severe' :
                     Math.abs(angles.shoulderTilt) > 3 ? 'moderate' : 'mild';
    issues.push({
      name: '高低肩',
      severity,
      angle: angles.shoulderTilt,
      threshold: 1,
      description: angles.shoulderTilt > 0 ? '右肩偏高' : '左肩偏高',
      landmarkIndices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
    });
  }

  // 2. 骨盆倾斜检测
  if (Math.abs(angles.hipTilt) > 1) {
    const severity = Math.abs(angles.hipTilt) > 4 ? 'severe' :
                     Math.abs(angles.hipTilt) > 2 ? 'moderate' : 'mild';
    issues.push({
      name: '骨盆倾斜',
      severity,
      angle: angles.hipTilt,
      threshold: 1,
      description: angles.hipTilt > 0 ? '右侧骨盆偏高' : '左侧骨盆偏高',
      landmarkIndices: [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
    });
  }

  // 3. 头部倾斜检测
  if (Math.abs(angles.headTilt) > 3) {
    const severity = Math.abs(angles.headTilt) > 10 ? 'severe' :
                     Math.abs(angles.headTilt) > 6 ? 'moderate' : 'mild';
    issues.push({
      name: '头部倾斜',
      severity,
      angle: angles.headTilt,
      threshold: 3,
      description: angles.headTilt > 0 ? '头部向右倾斜' : '头部向左倾斜',
      landmarkIndices: [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_EAR, POSE_LANDMARKS.RIGHT_EAR],
    });
  }

  // 4. 脊柱侧弯检测
  if (angles.spinalAlignment < 95) {
    const severity = angles.spinalAlignment < 85 ? 'severe' :
                     angles.spinalAlignment < 90 ? 'moderate' : 'mild';
    issues.push({
      name: '脊柱侧弯',
      severity,
      angle: 100 - angles.spinalAlignment,
      threshold: 5,
      description: `脊柱对齐度: ${angles.spinalAlignment.toFixed(1)}%`,
      landmarkIndices: [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
    });
  }

  // 5. 头前伸检测（正面视图）
  const headForwardRatio = landmarks[POSE_LANDMARKS.NOSE].y / landmarks[POSE_LANDMARKS.LEFT_SHOULDER].y;
  if (headForwardRatio > 0.85) {
    const severity = headForwardRatio > 0.95 ? 'severe' :
                     headForwardRatio > 0.90 ? 'moderate' : 'mild';
    issues.push({
      name: '头前伸',
      severity,
      angle: (headForwardRatio - 0.75) * 100,
      threshold: 0.85,
      description: '头部相对于肩膀过度前伸',
      landmarkIndices: [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
    });
  }

  // 6. 膝超伸检测
  if (angles.leftKneeAngle > 180 || angles.rightKneeAngle > 180) {
    const severity = Math.max(angles.leftKneeAngle, angles.rightKneeAngle) > 190 ? 'severe' :
                     Math.max(angles.leftKneeAngle, angles.rightKneeAngle) > 185 ? 'moderate' : 'mild';
    issues.push({
      name: '膝超伸',
      severity,
      angle: Math.max(angles.leftKneeAngle, angles.rightKneeAngle) - 180,
      threshold: 0,
      description: '膝关节过度伸展',
      landmarkIndices: [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.RIGHT_KNEE],
    });
  }

  // 7. 肩膀内扣检测（圆肩）
  const shoulderWidth = Math.abs(
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER].x - landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].x
  );
  const elbowWidth = Math.abs(
    landmarks[POSE_LANDMARKS.LEFT_ELBOW].x - landmarks[POSE_LANDMARKS.RIGHT_ELBOW].x
  );
  if (elbowWidth < shoulderWidth * 0.7) {
    const severity = elbowWidth < shoulderWidth * 0.5 ? 'severe' :
                     elbowWidth < shoulderWidth * 0.6 ? 'moderate' : 'mild';
    issues.push({
      name: '圆肩',
      severity,
      angle: (shoulderWidth - elbowWidth) / shoulderWidth * 100,
      threshold: 30,
      description: '肩膀向内扣，胸廓被压缩',
      landmarkIndices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER, 
                        POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.RIGHT_ELBOW],
    });
  }

  return issues;
}

/**
 * 计算整体体态评分
 */
export function calculateOverallScore(
  issues: PostureIssue[],
  angles: JointAngles
): number {
  let score = 100;

  // 根据问题严重程度扣分
  issues.forEach((issue) => {
    switch (issue.severity) {
      case 'severe':
        score -= 15;
        break;
      case 'moderate':
        score -= 8;
        break;
      case 'mild':
        score -= 3;
        break;
    }
  });

  // 脊柱对齐度影响
  if (angles.spinalAlignment < 95) {
    score -= (100 - angles.spinalAlignment) * 0.5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 检测单张图片的姿态（需要在浏览器环境中使用）
 */
export async function detectPoseFromImage(
  imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  poseInstance: any
): Promise<PostureAnalysisResult | null> {
  return new Promise((resolve) => {
    try {
      poseInstance.onResults((results: any) => {
        if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
          resolve(null);
          return;
        }

        const landmarks: Landmark[] = results.poseLandmarks.map((lm: any) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z || 0,
          visibility: lm.visibility || 0,
        }));

        const angles = calculateAllAngles(landmarks);
        const issues = detectPostureIssues(landmarks, angles);
        const overallScore = calculateOverallScore(issues, angles);
        const confidence = landmarks.reduce((sum, lm) => sum + lm.visibility, 0) / landmarks.length;

        resolve({
          landmarks,
          angles,
          issues,
          overallScore,
          confidence,
        });
      });

      poseInstance.send({ image: imageElement });
    } catch (error) {
      console.error('Pose detection error:', error);
      resolve(null);
    }
  });
}

/**
 * 创建MediaPipe Pose实例
 */
export function createPoseDetector(): any {
  // 动态导入以避免SSR问题
  if (typeof window === 'undefined') {
    return null;
  }

  // @ts-ignore - MediaPipe types
  const { Pose } = require('@mediapipe/pose');
  
  const pose = new Pose({
    locateFile: (file: string) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    },
  });

  pose.setOptions({
    modelComplexity: 1, // 0, 1, or 2. Higher = more accurate but slower
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  return pose;
}

/**
 * 获取骨骼连接线定义
 */
export function getSkeletonConnections(): [number, number][] {
  return [
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
    [POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.LEFT_PINKY],
    [POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.LEFT_INDEX],
    [POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.LEFT_THUMB],
    
    // 右臂
    [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
    [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
    [POSE_LANDMARKS.RIGHT_WRIST, POSE_LANDMARKS.RIGHT_PINKY],
    [POSE_LANDMARKS.RIGHT_WRIST, POSE_LANDMARKS.RIGHT_INDEX],
    [POSE_LANDMARKS.RIGHT_WRIST, POSE_LANDMARKS.RIGHT_THUMB],
    
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
}

/**
 * 获取关键骨骼点（用于角度标注）
 */
export function getKeyJoints(): { name: string; indices: number[]; type: 'angle' | 'line' }[] {
  return [
    { name: '左肩关节', indices: [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP], type: 'angle' },
    { name: '右肩关节', indices: [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP], type: 'angle' },
    { name: '左肘关节', indices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST], type: 'angle' },
    { name: '右肘关节', indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST], type: 'angle' },
    { name: '左髋关节', indices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE], type: 'angle' },
    { name: '右髋关节', indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE], type: 'angle' },
    { name: '左膝关节', indices: [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE], type: 'angle' },
    { name: '右膝关节', indices: [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE], type: 'angle' },
    { name: '肩线', indices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER], type: 'line' },
    { name: '骨盆线', indices: [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP], type: 'line' },
  ];
}
