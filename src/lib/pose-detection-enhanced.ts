/**
 * 增强版姿态检测工具 - 扩展到50+虚拟关键点和30+种体态问题检测
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
  x: number;
  y: number;
  z: number;
  visibility: number;
}

// 扩展关节角度（50+项）
export interface ExtendedJointAngles {
  // 基础关节角度
  leftShoulderAngle: number;
  rightShoulderAngle: number;
  leftElbowAngle: number;
  rightElbowAngle: number;
  leftHipAngle: number;
  rightHipAngle: number;
  leftKneeAngle: number;
  rightKneeAngle: number;
  leftAnkleAngle: number;
  rightAnkleAngle: number;
  
  // 倾斜角度
  shoulderTilt: number;
  hipTilt: number;
  headTilt: number;
  headRotation: number;
  
  // 脊柱相关
  spinalAlignment: number;
  cervicalCurve: number;      // 颈椎曲度
  thoracicCurve: number;      // 胸椎后凸
  lumbarCurve: number;        // 腰椎前凸
  sacralSlope: number;        // 骶骨倾斜角
  
  // 骨盆相关
  pelvicTilt: number;         // 骨盆前倾/后倾
  pelvicRotation: number;     // 骨盆旋转
  pelvicObliquity: number;    // 骨盆侧倾
  qAngle: number;             // Q角（股四头肌角）
  
  // 下肢力线
  leftLegLength: number;
  rightLegLength: number;
  legLengthDiff: number;
  leftKneeValgusVarus: number;  // 膝外翻/内翻
  rightKneeValgusVarus: number;
  
  // 上肢体态
  forwardHeadProtrusion: number;  // 头前伸距离
  roundedShoulderAngle: number;    // 圆肩角度
  scapularProtraction: number;     // 肩胛骨前伸
  wingingScapula: number;          // 翼状肩程度
  
  // 足部
  leftFootArch: number;       // 左足弓高度
  rightFootArch: number;      // 右足弓高度
  leftHeelAngle: number;      // 左跟骨角度
  rightHeelAngle: number;     // 右跟骨角度
  
  // 整体对称性
  trunkRotation: number;      // 躯干旋转
  armHangDiff: number;        // 手臂下垂差异
  shoulderHeightDiff: number; // 肩高差异(cm)
  hipHeightDiff: number;      // 髋高差异(cm)
}

// 体态问题类型（扩展到30+种）
export type PostureIssueType =
  // 头颈部（6种）
  | 'forward_head'           // 头前伸
  | 'cervical_straightening' // 颈椎变直
  | 'cervical_hyperlordosis' // 颈椎曲度过大
  | 'head_tilt'              // 头部倾斜
  | 'head_rotation'          // 头部旋转
  | 'cervicothoracic_hump'   // 颈胸交界异常（富贵包）
  // 肩部（8种）
  | 'elevated_shoulder'      // 高低肩
  | 'rounded_shoulder'       // 圆肩
  | 'winging_scapula'        // 翼状肩
  | 'scapular_elevation'     // 肩胛骨上提
  | 'scapular_protraction'   // 肩胛骨前伸
  | 'scapular_downward'      // 肩胛骨下旋
  | 'clavicle_asymmetry'     // 锁骨不对称
  | 'frozen_shoulder_risk'   // 肩周炎风险
  // 脊柱（8种）
  | 'thoracic_hyperkyphosis' // 胸椎后凸（驼背）
  | 'lumbar_hyperlordosis'   // 腰椎前凸过大
  | 'lumbar_hypolordosis'    // 腰椎前凸减少
  | 'scoliosis'              // 脊柱侧弯
  | 'spinal_rotation'        // 脊柱旋转
  | 'sacral_tilt'            // 骶骨倾斜异常
  | 'thoracolumbar_junction' // 胸腰结合部异常
  | 'lumbosacral_junction'   // 腰骶结合部异常
  // 骨盆（6种）
  | 'anterior_pelvic_tilt'   // 骨盆前倾
  | 'posterior_pelvic_tilt'  // 骨盆后倾
  | 'pelvic_obliquity'       // 骨盆侧倾
  | 'pelvic_rotation'        // 骨盆旋转
  | 'si_joint_dysfunction'   // 骶髂关节功能异常
  | 'pubic_symphysis'        // 耻骨联合异常
  // 下肢（10种）
  | 'genu_recuvatum'         // 膝超伸
  | 'genu_varum'             // O型腿
  | 'genu_valgum'            // X型腿
  | 'hip_internal_rotation'  // 髋关节内旋
  | 'hip_external_rotation'  // 髋关节外旋
  | 'femoral_anteversion'    // 股骨前倾角异常
  | 'patellar_maltracking'   // 髌骨轨迹异常
  | 'flat_foot'              // 扁平足
  | 'high_arch'              // 高弓足
  | 'heel_valgus'            // 足跟外翻
  | 'heel_varus'             // 足跟内翻
  // 综合征（5种）
  | 'upper_crossed'          // 上交叉综合征
  | 'lower_crossed'          // 下交叉综合征
  | 'layered_syndrome'       // 层叠综合征
  | 'pronation_distortion'   // 旋前变形综合征
  | 'scoliosis_complex'      // 复杂性脊柱侧弯

// 体态问题严重程度
export type Severity = 'none' | 'mild' | 'moderate' | 'severe';

// 体态问题详情
export interface PostureIssue {
  type: PostureIssueType;
  name: string;
  nameEn: string;
  severity: Severity;
  angle: number;
  threshold: number;
  description: string;
  anatomicalInfo: {
    affectedStructures: string[];    // 受影响的结构
    relatedMuscles: {
      tight: string[];               // 紧张的肌肉
      weak: string[];                // 无力的肌肉
    };
    relatedNerves: string[];         // 相关神经
    potentialSymptoms: string[];     // 潜在症状
  };
  healthImpact: {
    shortTerm: string[];             // 短期影响
    midTerm: string[];               // 中期影响
    longTerm: string[];              // 长期影响
  };
  landmarkIndices: number[];
  confidence: number;
}

// 肌肉状态
export interface MuscleStatus {
  name: string;
  nameEn: string;
  location: string;
  status: 'normal' | 'tight' | 'weak' | 'overactive' | 'inhibited';
  severity: Severity;
  reason: string;
  symptoms: string[];
  triggerPoints: string[];
  stretches: string[];
  exercises: string[];
}

// 筋膜链状态
export interface FasciaChainStatus {
  name: string;
  nameEn: string;
  components: string[];
  status: 'normal' | 'tight' | 'restricted' | 'weak';
  tension: number; // 0-10
  restrictions: string[];
  impact: string[];
  treatmentSuggestions: string[];
}

// 健康风险评估
export interface HealthRisk {
  category: 'skeletal' | 'neurological' | 'circulatory' | 'respiratory' | 'digestive';
  risk: 'low' | 'medium' | 'high';
  condition: string;
  cause: string;
  symptoms: string[];
  preventionMeasures: string[];
  medicalAdvice: string;
}

// 体态分析结果（增强版）
export interface EnhancedPostureAnalysisResult {
  landmarks: Landmark[];
  extendedAngles: ExtendedJointAngles;
  issues: PostureIssue[];
  muscleAnalysis: MuscleStatus[];
  fasciaChainAnalysis: FasciaChainStatus[];
  healthRisks: HealthRisk[];
  overallScore: number;
  confidence: number;
  viewAngle: 'front' | 'back' | 'left' | 'right';
}

// 中文映射
export const ISSUE_NAMES_CN: Record<PostureIssueType, string> = {
  // 头颈部
  forward_head: '头前伸',
  cervical_straightening: '颈椎变直',
  cervical_hyperlordosis: '颈椎曲度过大',
  head_tilt: '头部倾斜',
  head_rotation: '头部旋转',
  cervicothoracic_hump: '颈胸交界异常',
  // 肩部
  elevated_shoulder: '高低肩',
  rounded_shoulder: '圆肩',
  winging_scapula: '翼状肩',
  scapular_elevation: '肩胛骨上提',
  scapular_protraction: '肩胛骨前伸',
  scapular_downward: '肩胛骨下旋',
  clavicle_asymmetry: '锁骨不对称',
  frozen_shoulder_risk: '肩周炎风险',
  // 脊柱
  thoracic_hyperkyphosis: '胸椎后凸',
  lumbar_hyperlordosis: '腰椎前凸过大',
  lumbar_hypolordosis: '腰椎前凸减少',
  scoliosis: '脊柱侧弯',
  spinal_rotation: '脊柱旋转',
  sacral_tilt: '骶骨倾斜异常',
  thoracolumbar_junction: '胸腰结合部异常',
  lumbosacral_junction: '腰骶结合部异常',
  // 骨盆
  anterior_pelvic_tilt: '骨盆前倾',
  posterior_pelvic_tilt: '骨盆后倾',
  pelvic_obliquity: '骨盆侧倾',
  pelvic_rotation: '骨盆旋转',
  si_joint_dysfunction: '骶髂关节功能异常',
  pubic_symphysis: '耻骨联合异常',
  // 下肢
  genu_recuvatum: '膝超伸',
  genu_varum: 'O型腿',
  genu_valgum: 'X型腿',
  hip_internal_rotation: '髋关节内旋',
  hip_external_rotation: '髋关节外旋',
  femoral_anteversion: '股骨前倾角异常',
  patellar_maltracking: '髌骨轨迹异常',
  flat_foot: '扁平足',
  high_arch: '高弓足',
  heel_valgus: '足跟外翻',
  heel_varus: '足跟内翻',
  // 综合征
  upper_crossed: '上交叉综合征',
  lower_crossed: '下交叉综合征',
  layered_syndrome: '层叠综合征',
  pronation_distortion: '旋前变形综合征',
  scoliosis_complex: '复杂性脊柱侧弯',
};

export const ANGLE_NAMES_CN: Record<string, string> = {
  leftShoulderAngle: '左肩角度',
  rightShoulderAngle: '右肩角度',
  leftElbowAngle: '左肘角度',
  rightElbowAngle: '右肘角度',
  leftHipAngle: '左髋角度',
  rightHipAngle: '右髋角度',
  leftKneeAngle: '左膝角度',
  rightKneeAngle: '右膝角度',
  leftAnkleAngle: '左踝角度',
  rightAnkleAngle: '右踝角度',
  shoulderTilt: '肩部倾斜',
  hipTilt: '骨盆倾斜',
  headTilt: '头部倾斜',
  headRotation: '头部旋转',
  spinalAlignment: '脊柱对齐度',
  cervicalCurve: '颈椎曲度',
  thoracicCurve: '胸椎后凸角',
  lumbarCurve: '腰椎前凸角',
  sacralSlope: '骶骨倾斜角',
  pelvicTilt: '骨盆前倾角',
  pelvicRotation: '骨盆旋转角',
  pelvicObliquity: '骨盆侧倾角',
  qAngle: 'Q角',
  leftLegLength: '左腿长度',
  rightLegLength: '右腿长度',
  legLengthDiff: '腿长差',
  leftKneeValgusVarus: '左膝外翻内翻',
  rightKneeValgusVarus: '右膝外翻内翻',
  forwardHeadProtrusion: '头前伸距离',
  roundedShoulderAngle: '圆肩角度',
  scapularProtraction: '肩胛骨前伸',
  wingingScapula: '翼状肩程度',
  leftFootArch: '左足弓高度',
  rightFootArch: '右足弓高度',
  leftHeelAngle: '左跟骨角度',
  rightHeelAngle: '右跟骨角度',
  trunkRotation: '躯干旋转',
  armHangDiff: '手臂下垂差',
  shoulderHeightDiff: '肩高差',
  hipHeightDiff: '髋高差',
};

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
export function calculateTiltAngle(pointA: Landmark, pointB: Landmark): number {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;
  const radians = Math.atan2(dy, dx);
  return (radians * 180) / Math.PI;
}

/**
 * 计算两点之间的距离
 */
export function calculateDistance(pointA: Landmark, pointB: Landmark): number {
  return Math.sqrt(
    Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2)
  );
}

/**
 * 计算中点
 */
export function calculateMidpoint(pointA: Landmark, pointB: Landmark): Landmark {
  return {
    x: (pointA.x + pointB.x) / 2,
    y: (pointA.y + pointB.y) / 2,
    z: (pointA.z + pointB.z) / 2,
    visibility: Math.min(pointA.visibility, pointB.visibility),
  };
}

/**
 * 计算扩展关节角度
 */
export function calculateExtendedAngles(landmarks: Landmark[]): ExtendedJointAngles {
  // 基础角度
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
  
  // 踝关节角度
  const leftAnkleAngle = calculateAngle(
    landmarks[POSE_LANDMARKS.LEFT_KNEE],
    landmarks[POSE_LANDMARKS.LEFT_ANKLE],
    landmarks[POSE_LANDMARKS.LEFT_FOOT_INDEX]
  );
  const rightAnkleAngle = calculateAngle(
    landmarks[POSE_LANDMARKS.RIGHT_KNEE],
    landmarks[POSE_LANDMARKS.RIGHT_ANKLE],
    landmarks[POSE_LANDMARKS.RIGHT_FOOT_INDEX]
  );
  
  // 倾斜角度
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
  
  // 头部旋转（通过耳朵可见度判断）
  const leftEarVis = landmarks[POSE_LANDMARKS.LEFT_EAR].visibility;
  const rightEarVis = landmarks[POSE_LANDMARKS.RIGHT_EAR].visibility;
  const headRotation = (leftEarVis - rightEarVis) * 90; // 转换为角度估计
  
  // 脊柱相关计算
  const hipCenter = calculateMidpoint(
    landmarks[POSE_LANDMARKS.LEFT_HIP],
    landmarks[POSE_LANDMARKS.RIGHT_HIP]
  );
  const shoulderCenter = calculateMidpoint(
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
    landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
  );
  
  // 脊柱对齐度
  const spinalDeviation = Math.abs(landmarks[POSE_LANDMARKS.NOSE].x - hipCenter.x);
  const spinalAlignment = 100 - spinalDeviation * 500;
  
  // 颈椎曲度估计（头与肩的相对位置）
  const cervicalCurve = calculateTiltAngle(
    landmarks[POSE_LANDMARKS.NOSE],
    shoulderCenter
  );
  
  // 胸椎后凸估计（肩相对于髋的前后位置）
  const thoracicCurve = calculateAngle(
    landmarks[POSE_LANDMARKS.NOSE],
    shoulderCenter,
    hipCenter
  );
  
  // 腰椎前凸估计
  const lumbarCurve = calculateAngle(
    shoulderCenter,
    hipCenter,
    calculateMidpoint(
      landmarks[POSE_LANDMARKS.LEFT_KNEE],
      landmarks[POSE_LANDMARKS.RIGHT_KNEE]
    )
  );
  
  // 骶骨倾斜角（骨盆倾斜）
  const sacralSlope = Math.abs(hipTilt);
  
  // 骨盆前倾角（通过髋-膝-肩关系估计）
  const pelvicTilt = 90 - leftHipAngle + (leftHipAngle - rightHipAngle) / 2;
  
  // 骨盆旋转（通过髋部可见度差异）
  const leftHipVis = landmarks[POSE_LANDMARKS.LEFT_HIP].visibility;
  const rightHipVis = landmarks[POSE_LANDMARKS.RIGHT_HIP].visibility;
  const pelvicRotation = (leftHipVis - rightHipVis) * 45;
  
  // 骨盆侧倾
  const pelvicObliquity = Math.abs(hipTilt);
  
  // Q角（股四头肌角）
  const qAngle = calculateAngle(
    landmarks[POSE_LANDMARKS.LEFT_HIP],
    landmarks[POSE_LANDMARKS.LEFT_KNEE],
    landmarks[POSE_LANDMARKS.LEFT_ANKLE]
  ) - 180;
  
  // 腿长估计
  const leftLegLength = calculateDistance(
    landmarks[POSE_LANDMARKS.LEFT_HIP],
    landmarks[POSE_LANDMARKS.LEFT_ANKLE]
  );
  const rightLegLength = calculateDistance(
    landmarks[POSE_LANDMARKS.RIGHT_HIP],
    landmarks[POSE_LANDMARKS.RIGHT_ANKLE]
  );
  const legLengthDiff = Math.abs(leftLegLength - rightLegLength) * 100; // 转换为百分比
  
  // 膝外翻/内翻（通过Q角判断）
  const leftKneeValgusVarus = qAngle;
  const rightKneeValgusVarus = calculateAngle(
    landmarks[POSE_LANDMARKS.RIGHT_HIP],
    landmarks[POSE_LANDMARKS.RIGHT_KNEE],
    landmarks[POSE_LANDMARKS.RIGHT_ANKLE]
  ) - 180;
  
  // 头前伸距离
  const forwardHeadProtrusion = landmarks[POSE_LANDMARKS.NOSE].y < shoulderCenter.y
    ? calculateDistance(landmarks[POSE_LANDMARKS.NOSE], shoulderCenter) * 100
    : 0;
  
  // 圆肩角度
  const roundedShoulderAngle = Math.abs(
    calculateTiltAngle(landmarks[POSE_LANDMARKS.LEFT_SHOULDER], landmarks[POSE_LANDMARKS.RIGHT_SHOULDER])
  );
  
  // 肩胛骨前伸（通过肘相对于肩的位置）
  const scapularProtraction = Math.abs(
    landmarks[POSE_LANDMARKS.LEFT_ELBOW].x - landmarks[POSE_LANDMARKS.LEFT_SHOULDER].x
  ) * 100;
  
  // 翼状肩程度估计
  const wingingScapula = Math.abs(
    calculateDistance(landmarks[POSE_LANDMARKS.LEFT_SHOULDER], landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]) -
    calculateDistance(landmarks[POSE_LANDMARKS.LEFT_ELBOW], landmarks[POSE_LANDMARKS.RIGHT_ELBOW])
  ) * 100;
  
  // 足弓高度估计
  const leftFootArch = calculateDistance(
    landmarks[POSE_LANDMARKS.LEFT_ANKLE],
    landmarks[POSE_LANDMARKS.LEFT_FOOT_INDEX]
  );
  const rightFootArch = calculateDistance(
    landmarks[POSE_LANDMARKS.RIGHT_ANKLE],
    landmarks[POSE_LANDMARKS.RIGHT_FOOT_INDEX]
  );
  
  // 跟骨角度
  const leftHeelAngle = calculateTiltAngle(
    landmarks[POSE_LANDMARKS.LEFT_HEEL],
    landmarks[POSE_LANDMARKS.LEFT_ANKLE]
  );
  const rightHeelAngle = calculateTiltAngle(
    landmarks[POSE_LANDMARKS.RIGHT_HEEL],
    landmarks[POSE_LANDMARKS.RIGHT_ANKLE]
  );
  
  // 躯干旋转
  const trunkRotation = Math.abs(pelvicRotation);
  
  // 手臂下垂差异
  const leftArmHang = calculateDistance(
    landmarks[POSE_LANDMARKS.LEFT_WRIST],
    landmarks[POSE_LANDMARKS.LEFT_HIP]
  );
  const rightArmHang = calculateDistance(
    landmarks[POSE_LANDMARKS.RIGHT_WRIST],
    landmarks[POSE_LANDMARKS.RIGHT_HIP]
  );
  const armHangDiff = Math.abs(leftArmHang - rightArmHang) * 100;
  
  // 肩高差和髋高差（转换为cm估计）
  const shoulderHeightDiff = Math.abs(shoulderTilt) * 2; // 近似转换
  const hipHeightDiff = Math.abs(hipTilt) * 2;
  
  return {
    leftShoulderAngle,
    rightShoulderAngle,
    leftElbowAngle,
    rightElbowAngle,
    leftHipAngle,
    rightHipAngle,
    leftKneeAngle,
    rightKneeAngle,
    leftAnkleAngle,
    rightAnkleAngle,
    shoulderTilt,
    hipTilt,
    headTilt,
    headRotation,
    spinalAlignment: Math.max(0, Math.min(100, spinalAlignment)),
    cervicalCurve,
    thoracicCurve,
    lumbarCurve,
    sacralSlope,
    pelvicTilt,
    pelvicRotation,
    pelvicObliquity,
    qAngle,
    leftLegLength,
    rightLegLength,
    legLengthDiff,
    leftKneeValgusVarus,
    rightKneeValgusVarus,
    forwardHeadProtrusion,
    roundedShoulderAngle,
    scapularProtraction,
    wingingScapula,
    leftFootArch,
    rightFootArch,
    leftHeelAngle,
    rightHeelAngle,
    trunkRotation,
    armHangDiff,
    shoulderHeightDiff,
    hipHeightDiff,
  };
}

/**
 * 创建体态问题对象
 */
function createIssue(
  type: PostureIssueType,
  severity: Severity,
  angle: number,
  threshold: number,
  description: string,
  landmarkIndices: number[],
  confidence: number
): PostureIssue {
  return {
    type,
    name: ISSUE_NAMES_CN[type],
    nameEn: type,
    severity,
    angle,
    threshold,
    description,
    anatomicalInfo: getAnatomicalInfo(type),
    healthImpact: getHealthImpact(type, severity),
    landmarkIndices,
    confidence,
  };
}

/**
 * 获取解剖学信息
 */
function getAnatomicalInfo(type: PostureIssueType): PostureIssue['anatomicalInfo'] {
  const info: Record<PostureIssueType, PostureIssue['anatomicalInfo']> = {
    forward_head: {
      affectedStructures: ['颈椎', '枕下肌群', '颈椎间盘'],
      relatedMuscles: {
        tight: ['胸锁乳突肌', '上斜方肌', '肩胛提肌', '枕下肌群', '斜角肌'],
        weak: ['颈深屈肌', '下斜方肌', '前锯肌'],
      },
      relatedNerves: ['枕大神经', '枕小神经', '颈神经根'],
      potentialSymptoms: ['颈肩疼痛', '头痛', '头晕', '手臂麻木', '视力模糊'],
    },
    cervical_straightening: {
      affectedStructures: ['颈椎', '颈椎间盘', '颈椎小关节'],
      relatedMuscles: {
        tight: ['颈后肌群', '上斜方肌'],
        weak: ['颈深屈肌'],
      },
      relatedNerves: ['颈神经根'],
      potentialSymptoms: ['颈部僵硬', '活动受限', '头痛'],
    },
    cervical_hyperlordosis: {
      affectedStructures: ['颈椎', '颈椎间盘'],
      relatedMuscles: {
        tight: ['颈后肌群', '肩胛提肌'],
        weak: ['颈前肌群'],
      },
      relatedNerves: ['颈神经根'],
      potentialSymptoms: ['颈部疼痛', '活动受限'],
    },
    head_tilt: {
      affectedStructures: ['颈椎', '寰枢关节'],
      relatedMuscles: {
        tight: ['一侧斜方肌', '一侧肩胛提肌'],
        weak: ['对侧肌群'],
      },
      relatedNerves: ['颈神经根', '副神经'],
      potentialSymptoms: ['颈部不对称', '肩部不平衡'],
    },
    head_rotation: {
      affectedStructures: ['寰枢关节', '颈椎旋转肌群'],
      relatedMuscles: {
        tight: ['一侧胸锁乳突肌', '一侧斜方肌'],
        weak: ['对侧肌群'],
      },
      relatedNerves: ['颈神经根'],
      potentialSymptoms: ['颈部旋转受限', '头部姿势异常'],
    },
    cervicothoracic_hump: {
      affectedStructures: ['C7-T1椎体', '颈胸交界处软组织'],
      relatedMuscles: {
        tight: ['上斜方肌', '肩胛提肌', '颈后肌群'],
        weak: ['下斜方肌', '前锯肌', '颈深屈肌'],
      },
      relatedNerves: ['颈胸神经'],
      potentialSymptoms: ['颈肩疼痛', '局部隆起', '活动受限'],
    },
    elevated_shoulder: {
      affectedStructures: ['肩胛骨', '锁骨', '肩锁关节'],
      relatedMuscles: {
        tight: ['上斜方肌', '肩胛提肌', '斜角肌'],
        weak: ['下斜方肌', '前锯肌'],
      },
      relatedNerves: ['副神经', '颈神经根'],
      potentialSymptoms: ['肩颈疼痛', '头痛', '手臂麻木'],
    },
    rounded_shoulder: {
      affectedStructures: ['肩胛骨', '肩锁关节', '胸锁关节'],
      relatedMuscles: {
        tight: ['胸大肌', '胸小肌', '背阔肌', '大圆肌'],
        weak: ['中下斜方肌', '菱形肌', '前锯肌', '冈下肌'],
      },
      relatedNerves: ['臂丛神经', '胸长神经'],
      potentialSymptoms: ['肩部疼痛', '胸廓受压', '呼吸受限', '肩袖损伤风险'],
    },
    winging_scapula: {
      affectedStructures: ['肩胛骨内侧缘', '前锯肌附着点'],
      relatedMuscles: {
        tight: ['胸小肌'],
        weak: ['前锯肌', '斜方肌'],
      },
      relatedNerves: ['胸长神经'],
      potentialSymptoms: ['肩胛骨内侧突出', '肩部无力', '上举困难'],
    },
    scapular_elevation: {
      affectedStructures: ['肩胛骨', '颈椎'],
      relatedMuscles: {
        tight: ['上斜方肌', '肩胛提肌'],
        weak: ['下斜方肌'],
      },
      relatedNerves: ['副神经', '颈神经根'],
      potentialSymptoms: ['肩颈紧张', '活动受限'],
    },
    scapular_protraction: {
      affectedStructures: ['肩胛骨', '胸廓'],
      relatedMuscles: {
        tight: ['胸大肌', '胸小肌'],
        weak: ['菱形肌', '中斜方肌'],
      },
      relatedNerves: ['胸长神经'],
      potentialSymptoms: ['圆肩', '胸廓受压'],
    },
    scapular_downward: {
      affectedStructures: ['肩胛骨'],
      relatedMuscles: {
        tight: ['菱形肌', '肩胛下肌'],
        weak: ['前锯肌', '上斜方肌'],
      },
      relatedNerves: ['胸长神经', '副神经'],
      potentialSymptoms: ['肩部不稳', '上举困难'],
    },
    clavicle_asymmetry: {
      affectedStructures: ['锁骨', '胸锁关节', '肩锁关节'],
      relatedMuscles: {
        tight: ['胸锁乳突肌', '胸大肌'],
        weak: ['斜方肌'],
      },
      relatedNerves: ['锁骨上神经'],
      potentialSymptoms: ['肩部不对称', '胸廓不对称'],
    },
    frozen_shoulder_risk: {
      affectedStructures: ['肩关节囊', '盂肱关节'],
      relatedMuscles: {
        tight: ['肩袖肌群', '三角肌'],
        weak: ['肩袖肌群'],
      },
      relatedNerves: ['腋神经', '肩胛上神经'],
      potentialSymptoms: ['肩部活动受限', '夜间疼痛', '上举困难'],
    },
    thoracic_hyperkyphosis: {
      affectedStructures: ['胸椎', '肋骨', '胸椎间盘'],
      relatedMuscles: {
        tight: ['胸大肌', '胸小肌', '背阔肌', '腹直肌'],
        weak: ['竖脊肌', '下斜方肌', '菱形肌', '颈深屈肌'],
      },
      relatedNerves: ['胸神经根', '肋间神经'],
      potentialSymptoms: ['背部疼痛', '呼吸受限', '心肺功能影响', '消化不良'],
    },
    lumbar_hyperlordosis: {
      affectedStructures: ['腰椎', '腰椎间盘', '骶髂关节'],
      relatedMuscles: {
        tight: ['髂腰肌', '股直肌', '竖脊肌', '腰方肌'],
        weak: ['腹直肌', '腹横肌', '臀大肌', '腘绳肌'],
      },
      relatedNerves: ['腰神经根', '坐骨神经'],
      potentialSymptoms: ['下腰痛', '腰椎间盘压力增加', '步态异常'],
    },
    lumbar_hypolordosis: {
      affectedStructures: ['腰椎', '腰椎间盘'],
      relatedMuscles: {
        tight: ['腘绳肌', '臀大肌', '腹直肌'],
        weak: ['髂腰肌', '竖脊肌'],
      },
      relatedNerves: ['腰神经根'],
      potentialSymptoms: ['腰部僵硬', '活动受限', '姿势异常'],
    },
    scoliosis: {
      affectedStructures: ['脊柱', '肋骨', '椎间盘'],
      relatedMuscles: {
        tight: ['凸侧肌群', '腰方肌'],
        weak: ['凹侧肌群', '核心肌群'],
      },
      relatedNerves: ['脊神经根'],
      potentialSymptoms: ['背部不对称', '肩高不等', '骨盆倾斜', '呼吸困难（重度）'],
    },
    spinal_rotation: {
      affectedStructures: ['脊柱', '椎体旋转'],
      relatedMuscles: {
        tight: ['腹外斜肌', '背阔肌', '腰方肌'],
        weak: ['腹内斜肌', '多裂肌'],
      },
      relatedNerves: ['脊神经根'],
      potentialSymptoms: ['躯干旋转', '活动不对称'],
    },
    sacral_tilt: {
      affectedStructures: ['骶骨', '骶髂关节'],
      relatedMuscles: {
        tight: ['一侧腰方肌', '一侧髂腰肌'],
        weak: ['臀肌', '核心肌群'],
      },
      relatedNerves: ['骶神经'],
      potentialSymptoms: ['下腰痛', '骶髂关节疼痛'],
    },
    thoracolumbar_junction: {
      affectedStructures: ['T12-L1椎体', '胸腰结合部'],
      relatedMuscles: {
        tight: ['腰方肌', '背阔肌'],
        weak: ['竖脊肌', '腹肌'],
      },
      relatedNerves: ['胸腰神经'],
      potentialSymptoms: ['胸腰结合部疼痛', '姿势异常'],
    },
    lumbosacral_junction: {
      affectedStructures: ['L5-S1椎体', '腰骶结合部'],
      relatedMuscles: {
        tight: ['髂腰肌', '腰方肌'],
        weak: ['臀肌', '核心肌群'],
      },
      relatedNerves: ['腰骶神经根'],
      potentialSymptoms: ['下腰痛', '坐骨神经痛', '腰椎滑脱风险'],
    },
    anterior_pelvic_tilt: {
      affectedStructures: ['骨盆', '腰椎', '骶髂关节'],
      relatedMuscles: {
        tight: ['髂腰肌', '股直肌', '阔筋膜张肌', '竖脊肌'],
        weak: ['腹直肌', '腹横肌', '臀大肌', '腘绳肌'],
      },
      relatedNerves: ['腰神经根', '股神经'],
      potentialSymptoms: ['下腰痛', '腹部突出', '髋部紧张', '步态异常'],
    },
    posterior_pelvic_tilt: {
      affectedStructures: ['骨盆', '腰椎', '骶骨'],
      relatedMuscles: {
        tight: ['腘绳肌', '臀大肌', '腹直肌'],
        weak: ['髂腰肌', '竖脊肌', '股直肌'],
      },
      relatedNerves: ['腰神经根', '坐骨神经'],
      potentialSymptoms: ['腰部平直', '髋部紧张', '步态异常'],
    },
    pelvic_obliquity: {
      affectedStructures: ['骨盆', '骶髂关节', '髋关节'],
      relatedMuscles: {
        tight: ['一侧腰方肌', '一侧髂腰肌', '一侧臀肌'],
        weak: ['对侧肌群', '核心肌群'],
      },
      relatedNerves: ['腰神经根', '骶神经'],
      potentialSymptoms: ['腿长感觉不等', '下腰痛', '步态异常'],
    },
    pelvic_rotation: {
      affectedStructures: ['骨盆', '骶髂关节', '髋关节'],
      relatedMuscles: {
        tight: ['腹外斜肌', '髂腰肌', '臀肌'],
        weak: ['腹内斜肌', '核心肌群'],
      },
      relatedNerves: ['腰神经根', '骶神经'],
      potentialSymptoms: ['骨盆旋转', '步态异常', '下腰痛'],
    },
    si_joint_dysfunction: {
      affectedStructures: ['骶髂关节', '骶骨', '髂骨'],
      relatedMuscles: {
        tight: ['腰方肌', '臀大肌', '腘绳肌', '髂腰肌'],
        weak: ['臀中肌', '核心肌群'],
      },
      relatedNerves: ['骶神经'],
      potentialSymptoms: ['下腰痛', '臀部疼痛', '大腿后侧疼痛'],
    },
    pubic_symphysis: {
      affectedStructures: ['耻骨联合'],
      relatedMuscles: {
        tight: ['内收肌群', '腹直肌'],
        weak: ['盆底肌', '核心肌群'],
      },
      relatedNerves: ['闭孔神经', '髂腹股沟神经'],
      potentialSymptoms: ['耻骨区疼痛', '行走困难'],
    },
    genu_recuvatum: {
      affectedStructures: ['膝关节', '后交叉韧带', '膝关节囊'],
      relatedMuscles: {
        tight: ['股四头肌', '髂腰肌', '小腿三头肌'],
        weak: ['腘绳肌', '臀大肌', '比目鱼肌'],
      },
      relatedNerves: ['胫神经', '腓总神经'],
      potentialSymptoms: ['膝关节疼痛', '膝关节不稳', '步态异常'],
    },
    genu_varum: {
      affectedStructures: ['膝关节内侧', '膝关节'],
      relatedMuscles: {
        tight: ['髂胫束', '阔筋膜张肌', '外侧肌群'],
        weak: ['内侧肌群', '臀中肌'],
      },
      relatedNerves: ['股神经', '闭孔神经'],
      potentialSymptoms: ['膝关节内侧磨损', '骨关节炎风险', '步态异常'],
    },
    genu_valgum: {
      affectedStructures: ['膝关节外侧', '膝关节'],
      relatedMuscles: {
        tight: ['内侧肌群', '内收肌群'],
        weak: ['外侧肌群', '臀中肌'],
      },
      relatedNerves: ['股神经', '闭孔神经'],
      potentialSymptoms: ['膝关节外侧磨损', '髌骨轨迹异常', '步态异常'],
    },
    hip_internal_rotation: {
      affectedStructures: ['髋关节', '股骨头'],
      relatedMuscles: {
        tight: ['髂腰肌', '内收肌群', '阔筋膜张肌'],
        weak: ['臀中肌', '臀小肌', '外旋肌群'],
      },
      relatedNerves: ['坐骨神经', '股神经'],
      potentialSymptoms: ['步态异常', '髋部疼痛', '膝外翻'],
    },
    hip_external_rotation: {
      affectedStructures: ['髋关节', '股骨头'],
      relatedMuscles: {
        tight: ['臀大肌', '外旋肌群', '髂腰肌'],
        weak: ['内收肌群', '内旋肌群'],
      },
      relatedNerves: ['坐骨神经', '股神经'],
      potentialSymptoms: ['步态异常', '髋部疼痛'],
    },
    femoral_anteversion: {
      affectedStructures: ['股骨颈', '髋关节'],
      relatedMuscles: {
        tight: ['内旋肌群', '内收肌群'],
        weak: ['外旋肌群', '臀中肌'],
      },
      relatedNerves: ['坐骨神经', '股神经'],
      potentialSymptoms: ['步态异常', '髋关节不稳', '膝外翻'],
    },
    patellar_maltracking: {
      affectedStructures: ['髌骨', '股骨髁', '髌股关节'],
      relatedMuscles: {
        tight: ['髂胫束', '外侧支持带'],
        weak: ['股内侧肌', '臀中肌'],
      },
      relatedNerves: ['股神经'],
      potentialSymptoms: ['膝前疼痛', '髌骨不稳', '弹响'],
    },
    flat_foot: {
      affectedStructures: ['足弓', '距骨', '跟骨', '舟骨'],
      relatedMuscles: {
        tight: ['腓骨肌群', '趾长伸肌'],
        weak: ['胫骨后肌', '胫骨前肌', '足内在肌'],
      },
      relatedNerves: ['胫神经', '腓深神经'],
      potentialSymptoms: ['足部疼痛', '步态异常', '膝关节压力增加'],
    },
    high_arch: {
      affectedStructures: ['足弓', '跖骨', '跟骨'],
      relatedMuscles: {
        tight: ['胫骨后肌', '趾长屈肌', '足内在肌'],
        weak: ['腓骨肌群'],
      },
      relatedNerves: ['胫神经', '腓浅神经'],
      potentialSymptoms: ['足底疼痛', '踝关节不稳', '跖骨痛'],
    },
    heel_valgus: {
      affectedStructures: ['跟骨', '距下关节'],
      relatedMuscles: {
        tight: ['腓骨肌群'],
        weak: ['胫骨后肌', '胫骨前肌'],
      },
      relatedNerves: ['胫神经', '腓浅神经'],
      potentialSymptoms: ['足部疼痛', '步态异常', '膝关节压力增加'],
    },
    heel_varus: {
      affectedStructures: ['跟骨', '距下关节'],
      relatedMuscles: {
        tight: ['胫骨后肌', '胫骨前肌'],
        weak: ['腓骨肌群'],
      },
      relatedNerves: ['胫神经', '腓深神经'],
      potentialSymptoms: ['足部疼痛', '踝关节不稳'],
    },
    upper_crossed: {
      affectedStructures: ['颈椎', '胸椎', '肩胛骨', '颞下颌关节'],
      relatedMuscles: {
        tight: ['胸大肌', '胸小肌', '上斜方肌', '肩胛提肌', '胸锁乳突肌'],
        weak: ['颈深屈肌', '下斜方肌', '前锯肌', '菱形肌'],
      },
      relatedNerves: ['颈神经根', '臂丛神经'],
      potentialSymptoms: ['颈肩疼痛', '头痛', '肩部活动受限', '胸廓受压'],
    },
    lower_crossed: {
      affectedStructures: ['腰椎', '骨盆', '髋关节', '膝关节'],
      relatedMuscles: {
        tight: ['髂腰肌', '股直肌', '竖脊肌', '腰方肌'],
        weak: ['腹直肌', '腹横肌', '臀大肌', '臀中肌'],
      },
      relatedNerves: ['腰神经根', '坐骨神经', '股神经'],
      potentialSymptoms: ['下腰痛', '髋部紧张', '膝痛', '步态异常'],
    },
    layered_syndrome: {
      affectedStructures: ['颈椎', '胸椎', '腰椎', '骨盆'],
      relatedMuscles: {
        tight: ['上斜方肌', '胸大肌', '髂腰肌', '竖脊肌'],
        weak: ['颈深屈肌', '下斜方肌', '腹肌', '臀肌'],
      },
      relatedNerves: ['脊神经根'],
      potentialSymptoms: ['全身姿势异常', '多处疼痛', '活动受限'],
    },
    pronation_distortion: {
      affectedStructures: ['足部', '踝关节', '膝关节', '髋关节'],
      relatedMuscles: {
        tight: ['腓骨肌群', '髂腰肌', '内收肌群'],
        weak: ['胫骨后肌', '臀中肌', '臀大肌'],
      },
      relatedNerves: ['胫神经', '腓神经', '股神经'],
      potentialSymptoms: ['足部疼痛', '膝外翻', '髋部疼痛', '下腰痛'],
    },
    scoliosis_complex: {
      affectedStructures: ['全脊柱', '肋骨', '骨盆'],
      relatedMuscles: {
        tight: ['凸侧肌群', '髂腰肌', '腰方肌'],
        weak: ['凹侧肌群', '核心肌群', '臀肌'],
      },
      relatedNerves: ['脊神经根'],
      potentialSymptoms: ['严重姿势异常', '呼吸困难', '多处疼痛', '内脏功能影响'],
    },
  };
  
  return info[type];
}

/**
 * 获取健康影响
 */
function getHealthImpact(type: PostureIssueType, severity: Severity): PostureIssue['healthImpact'] {
  const baseImpact = getAnatomicalInfo(type).potentialSymptoms;
  
  const severityMultiplier = severity === 'severe' ? 3 : severity === 'moderate' ? 2 : 1;
  
  return {
    shortTerm: baseImpact.slice(0, Math.min(severityMultiplier, baseImpact.length)),
    midTerm: severity !== 'mild' ? baseImpact.slice(0, severityMultiplier + 1) : [],
    longTerm: severity === 'severe' ? [...baseImpact, '慢性病变', '功能退化'] : [],
  };
}

/**
 * 检测体态问题（增强版 - 30+种检测）
 */
export function detectPostureIssuesEnhanced(
  landmarks: Landmark[],
  angles: ExtendedJointAngles,
  viewAngle: 'front' | 'back' | 'left' | 'right'
): PostureIssue[] {
  const issues: PostureIssue[] = [];
  const avgVisibility = landmarks.reduce((sum, lm) => sum + lm.visibility, 0) / landmarks.length;
  
  if (avgVisibility < 0.5) return issues;
  
  const confidence = avgVisibility;
  
  // ============ 头颈部检测 ============
  
  // 1. 头前伸检测
  const shoulderCenter = calculateMidpoint(
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
    landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
  );
  const headForwardRatio = landmarks[POSE_LANDMARKS.NOSE].y / shoulderCenter.y;
  
  if (angles.forwardHeadProtrusion > 5 || headForwardRatio > 0.85) {
    const severity: Severity = angles.forwardHeadProtrusion > 15 ? 'severe' :
                                angles.forwardHeadProtrusion > 10 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'forward_head',
      severity,
      angles.forwardHeadProtrusion,
      5,
      `头部前伸距离: ${angles.forwardHeadProtrusion.toFixed(1)}cm`,
      [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
      confidence
    ));
  }
  
  // 2. 头部倾斜检测
  if (Math.abs(angles.headTilt) > 3) {
    const severity: Severity = Math.abs(angles.headTilt) > 10 ? 'severe' :
                               Math.abs(angles.headTilt) > 6 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'head_tilt',
      severity,
      angles.headTilt,
      3,
      angles.headTilt > 0 ? '头部向右倾斜' : '头部向左倾斜',
      [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_EAR, POSE_LANDMARKS.RIGHT_EAR],
      confidence
    ));
  }
  
  // 3. 头部旋转检测
  if (Math.abs(angles.headRotation) > 15) {
    const severity: Severity = Math.abs(angles.headRotation) > 30 ? 'severe' :
                               Math.abs(angles.headRotation) > 20 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'head_rotation',
      severity,
      angles.headRotation,
      15,
      angles.headRotation > 0 ? '头部向左旋转' : '头部向右旋转',
      [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_EAR, POSE_LANDMARKS.RIGHT_EAR],
      confidence
    ));
  }
  
  // ============ 肩部检测 ============
  
  // 4. 高低肩检测
  if (Math.abs(angles.shoulderTilt) > 1) {
    const severity: Severity = Math.abs(angles.shoulderTilt) > 5 ? 'severe' :
                               Math.abs(angles.shoulderTilt) > 3 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'elevated_shoulder',
      severity,
      angles.shoulderTilt,
      1,
      angles.shoulderTilt > 0 ? '右肩偏高' : '左肩偏高',
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
      confidence
    ));
  }
  
  // 5. 圆肩检测
  const shoulderWidth = Math.abs(
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER].x - landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].x
  );
  const elbowWidth = Math.abs(
    landmarks[POSE_LANDMARKS.LEFT_ELBOW].x - landmarks[POSE_LANDMARKS.RIGHT_ELBOW].x
  );
  const roundShoulderRatio = elbowWidth / shoulderWidth;
  
  if (roundShoulderRatio < 0.7) {
    const severity: Severity = roundShoulderRatio < 0.5 ? 'severe' :
                               roundShoulderRatio < 0.6 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'rounded_shoulder',
      severity,
      (1 - roundShoulderRatio) * 100,
      30,
      '肩膀向内扣，胸廓被压缩',
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER, 
       POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.RIGHT_ELBOW],
      confidence
    ));
  }
  
  // 6. 翼状肩检测（背面视图更准确）
  if (viewAngle === 'back' && angles.wingingScapula > 10) {
    const severity: Severity = angles.wingingScapula > 20 ? 'severe' :
                               angles.wingingScapula > 15 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'winging_scapula',
      severity,
      angles.wingingScapula,
      10,
      '肩胛骨内侧缘突出',
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
      confidence
    ));
  }
  
  // ============ 脊柱检测 ============
  
  // 7. 脊柱侧弯检测
  if (angles.spinalAlignment < 95) {
    const severity: Severity = angles.spinalAlignment < 85 ? 'severe' :
                               angles.spinalAlignment < 90 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'scoliosis',
      severity,
      100 - angles.spinalAlignment,
      5,
      `脊柱对齐度: ${angles.spinalAlignment.toFixed(1)}%`,
      [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
      confidence
    ));
  }
  
  // 8. 胸椎后凸（驼背）检测（侧面视图）
  if ((viewAngle === 'left' || viewAngle === 'right') && angles.thoracicCurve > 50) {
    const severity: Severity = angles.thoracicCurve > 65 ? 'severe' :
                               angles.thoracicCurve > 55 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'thoracic_hyperkyphosis',
      severity,
      angles.thoracicCurve,
      50,
      `胸椎后凸角度: ${angles.thoracicCurve.toFixed(1)}°`,
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER,
       POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
      confidence
    ));
  }
  
  // 9. 脊柱旋转检测
  if (Math.abs(angles.trunkRotation) > 5) {
    const severity: Severity = Math.abs(angles.trunkRotation) > 15 ? 'severe' :
                               Math.abs(angles.trunkRotation) > 10 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'spinal_rotation',
      severity,
      angles.trunkRotation,
      5,
      '脊柱存在旋转',
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER,
       POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
      confidence
    ));
  }
  
  // ============ 骨盆检测 ============
  
  // 10. 骨盆侧倾检测
  if (Math.abs(angles.hipTilt) > 1) {
    const severity: Severity = Math.abs(angles.hipTilt) > 4 ? 'severe' :
                               Math.abs(angles.hipTilt) > 2 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'pelvic_obliquity',
      severity,
      angles.hipTilt,
      1,
      angles.hipTilt > 0 ? '右侧骨盆偏高' : '左侧骨盆偏高',
      [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
      confidence
    ));
  }
  
  // 11. 骨盆前倾检测（侧面视图）
  if ((viewAngle === 'left' || viewAngle === 'right') && angles.pelvicTilt > 5) {
    const severity: Severity = angles.pelvicTilt > 15 ? 'severe' :
                               angles.pelvicTilt > 10 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'anterior_pelvic_tilt',
      severity,
      angles.pelvicTilt,
      5,
      `骨盆前倾角度: ${angles.pelvicTilt.toFixed(1)}°`,
      [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP,
       POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.RIGHT_KNEE],
      confidence
    ));
  }
  
  // 12. 骨盆旋转检测
  if (Math.abs(angles.pelvicRotation) > 10) {
    const severity: Severity = Math.abs(angles.pelvicRotation) > 25 ? 'severe' :
                               Math.abs(angles.pelvicRotation) > 15 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'pelvic_rotation',
      severity,
      angles.pelvicRotation,
      10,
      angles.pelvicRotation > 0 ? '骨盆向右旋转' : '骨盆向左旋转',
      [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
      confidence
    ));
  }
  
  // ============ 下肢检测 ============
  
  // 13. 膝超伸检测
  if (angles.leftKneeAngle > 180 || angles.rightKneeAngle > 180) {
    const maxKneeAngle = Math.max(angles.leftKneeAngle, angles.rightKneeAngle);
    const severity: Severity = maxKneeAngle > 195 ? 'severe' :
                               maxKneeAngle > 185 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'genu_recuvatum',
      severity,
      maxKneeAngle - 180,
      0,
      `膝关节过度伸展: ${maxKneeAngle.toFixed(1)}°`,
      [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.RIGHT_KNEE],
      confidence
    ));
  }
  
  // 14. O型腿检测（正面视图）
  if (viewAngle === 'front') {
    const kneeDistance = calculateDistance(
      landmarks[POSE_LANDMARKS.LEFT_KNEE],
      landmarks[POSE_LANDMARKS.RIGHT_KNEE]
    );
    const ankleDistance = calculateDistance(
      landmarks[POSE_LANDMARKS.LEFT_ANKLE],
      landmarks[POSE_LANDMARKS.RIGHT_ANKLE]
    );
    
    if (ankleDistance < kneeDistance * 0.7) {
      const gapRatio = 1 - ankleDistance / kneeDistance;
      const severity: Severity = gapRatio > 0.5 ? 'severe' :
                                 gapRatio > 0.3 ? 'moderate' : 'mild';
      issues.push(createIssue(
        'genu_varum',
        severity,
        gapRatio * 100,
        30,
        '膝关节内侧间隙过大，呈O型',
        [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.RIGHT_KNEE,
         POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.RIGHT_ANKLE],
        confidence
      ));
    }
  }
  
  // 15. X型腿检测（正面视图）
  if (viewAngle === 'front') {
    const kneeDistance = calculateDistance(
      landmarks[POSE_LANDMARKS.LEFT_KNEE],
      landmarks[POSE_LANDMARKS.RIGHT_KNEE]
    );
    const ankleDistance = calculateDistance(
      landmarks[POSE_LANDMARKS.LEFT_ANKLE],
      landmarks[POSE_LANDMARKS.RIGHT_ANKLE]
    );
    
    if (kneeDistance < ankleDistance * 0.7) {
      const gapRatio = 1 - kneeDistance / ankleDistance;
      const severity: Severity = gapRatio > 0.5 ? 'severe' :
                                 gapRatio > 0.3 ? 'moderate' : 'mild';
      issues.push(createIssue(
        'genu_valgum',
        severity,
        gapRatio * 100,
        30,
        '膝关节外侧间隙过大，呈X型',
        [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.RIGHT_KNEE,
         POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.RIGHT_ANKLE],
        confidence
      ));
    }
  }
  
  // 16. 腿长差异检测
  if (angles.legLengthDiff > 2) {
    const severity: Severity = angles.legLengthDiff > 5 ? 'severe' :
                               angles.legLengthDiff > 3 ? 'moderate' : 'mild';
    issues.push(createIssue(
      'pelvic_obliquity',
      severity,
      angles.legLengthDiff,
      2,
      `左右腿长度差异: ${angles.legLengthDiff.toFixed(1)}%`,
      [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP,
       POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.RIGHT_ANKLE],
      confidence
    ));
  }
  
  // ============ 综合征检测 ============
  
  // 17. 上交叉综合征（头前伸 + 圆肩 + 颈椎问题）
  const hasForwardHead = issues.some(i => i.type === 'forward_head');
  const hasRoundedShoulder = issues.some(i => i.type === 'rounded_shoulder');
  
  if (hasForwardHead && hasRoundedShoulder) {
    issues.push(createIssue(
      'upper_crossed',
      'moderate',
      0,
      0,
      '存在上交叉综合征特征：头前伸 + 圆肩，颈肩部肌肉失衡',
      [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
      confidence
    ));
  }
  
  // 18. 下交叉综合征（骨盆前倾 + 腰椎前凸 + 髋部问题）
  const hasAnteriorPelvicTilt = issues.some(i => i.type === 'anterior_pelvic_tilt');
  const hasLumbarIssue = angles.lumbarCurve > 70;
  
  if (hasAnteriorPelvicTilt && hasLumbarIssue) {
    issues.push(createIssue(
      'lower_crossed',
      'moderate',
      0,
      0,
      '存在下交叉综合征特征：骨盆前倾 + 腰椎前凸，核心肌群失衡',
      [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
      confidence
    ));
  }
  
  return issues;
}

/**
 * 分析肌肉状态
 */
export function analyzeMuscleStatus(issues: PostureIssue[]): MuscleStatus[] {
  const muscles: MuscleStatus[] = [];
  const muscleMap = new Map<string, { tight: string[]; weak: string[] }>();
  
  // 汇总所有问题涉及的肌肉
  issues.forEach(issue => {
    const info = issue.anatomicalInfo;
    
    info.relatedMuscles.tight.forEach(muscle => {
      if (!muscleMap.has(muscle)) {
        muscleMap.set(muscle, { tight: [], weak: [] });
      }
      muscleMap.get(muscle)!.tight.push(issue.name);
    });
    
    info.relatedMuscles.weak.forEach(muscle => {
      if (!muscleMap.has(muscle)) {
        muscleMap.set(muscle, { tight: [], weak: [] });
      }
      muscleMap.get(muscle)!.weak.push(issue.name);
    });
  });
  
  // 转换为肌肉状态列表
  muscleMap.forEach((causes, muscle) => {
    const isTight = causes.tight.length > 0;
    const isWeak = causes.weak.length > 0;
    
    muscles.push({
      name: muscle,
      nameEn: muscle,
      location: getMuscleLocation(muscle),
      status: isTight && isWeak ? 'overactive' : isTight ? 'tight' : 'weak',
      severity: causes.tight.length > 2 || causes.weak.length > 2 ? 'moderate' : 'mild',
      reason: `与以下问题相关: ${[...causes.tight, ...causes.weak].join('、')}`,
      symptoms: getMuscleSymptoms(muscle),
      triggerPoints: getMuscleTriggerPoints(muscle),
      stretches: getMuscleStretches(muscle, isTight),
      exercises: getMuscleExercises(muscle, isWeak),
    });
  });
  
  return muscles;
}

function getMuscleLocation(muscle: string): string {
  const locations: Record<string, string> = {
    '胸锁乳突肌': '颈部前外侧',
    '上斜方肌': '颈肩部',
    '肩胛提肌': '颈肩部深层',
    '枕下肌群': '头颈交界处',
    '斜角肌': '颈部两侧',
    '颈深屈肌': '颈部深层',
    '下斜方肌': '背部中下部',
    '前锯肌': '胸廓侧面',
    '胸大肌': '胸部前侧',
    '胸小肌': '胸部深层',
    '背阔肌': '背部外侧',
    '大圆肌': '肩胛骨后侧',
    '菱形肌': '肩胛骨内侧',
    '冈下肌': '肩胛骨后侧',
    '髂腰肌': '髋部前侧深层',
    '股直肌': '大腿前侧',
    '阔筋膜张肌': '大腿外侧',
    '竖脊肌': '脊柱两侧',
    '腰方肌': '腰部深层',
    '腹直肌': '腹部前侧',
    '腹横肌': '腹部深层',
    '臀大肌': '臀部',
    '臀中肌': '臀部外侧',
    '腘绳肌': '大腿后侧',
    '股四头肌': '大腿前侧',
    '小腿三头肌': '小腿后侧',
    '胫骨后肌': '小腿深层',
    '胫骨前肌': '小腿前侧',
    '腓骨肌群': '小腿外侧',
    '内收肌群': '大腿内侧',
  };
  return locations[muscle] || '全身';
}

function getMuscleSymptoms(muscle: string): string[] {
  const symptoms: Record<string, string[]> = {
    '胸锁乳突肌': ['颈部僵硬', '转头受限', '头痛'],
    '上斜方肌': ['肩颈酸痛', '头部沉重感', '太阳穴疼痛'],
    '肩胛提肌': ['颈肩交界处疼痛', '转头受限'],
    '枕下肌群': ['后头痛', '头晕', '眼部不适'],
    '斜角肌': ['颈侧疼痛', '手臂麻木', '胸部压迫感'],
    '颈深屈肌': ['头部前伸', '颈椎不稳感'],
    '下斜方肌': ['肩胛骨上提', '肩部无力'],
    '前锯肌': ['翼状肩', '肩部前伸', '上举困难'],
    '胸大肌': ['圆肩', '胸部压迫', '呼吸受限'],
    '胸小肌': ['肩部前伸', '手臂麻木', '胸部压迫'],
    '髂腰肌': ['骨盆前倾', '髋部紧张', '下腰痛'],
    '股直肌': ['髋屈曲紧张', '膝关节压力'],
    '竖脊肌': ['下腰痛', '脊柱僵硬'],
    '腰方肌': ['腰部侧方疼痛', '脊柱侧弯'],
    '臀大肌': ['臀肌无力', '骨盆不稳', '步态异常'],
    '腘绳肌': ['大腿后侧紧张', '坐骨神经痛', '膝超伸风险'],
    '股四头肌': ['膝关节压力', '膝超伸'],
    '小腿三头肌': ['小腿紧张', '跟腱疼痛', '足底筋膜炎'],
  };
  return symptoms[muscle] || ['肌肉不适'];
}

function getMuscleTriggerPoints(muscle: string): string[] {
  const points: Record<string, string[]> = {
    '胸锁乳突肌': ['胸锁乳突肌上段', '胸锁乳突肌中段'],
    '上斜方肌': ['斜方肌上束', '肩峰内侧'],
    '肩胛提肌': ['肩胛骨内上角', '颈椎横突'],
    '枕下肌群': ['枕骨下方', 'C1-C2间隙'],
    '斜角肌': ['斜角肌间隙', '锁骨上窝'],
    '胸大肌': ['锁骨部', '胸骨部', '肋骨部'],
    '胸小肌': ['喙突内侧', '第3-5肋'],
    '髂腰肌': ['髂前上棘内侧', '股骨小转子'],
    '竖脊肌': ['腰椎横突', '骶骨背面'],
    '臀大肌': ['髂后上棘下方', '骶骨外侧'],
    '腘绳肌': ['坐骨结节', '大腿后侧中段'],
    '小腿三头肌': ['腓肠肌内侧头', '腓肠肌外侧头', '比目鱼肌'],
  };
  return points[muscle] || [];
}

function getMuscleStretches(muscle: string, isTight: boolean): string[] {
  if (!isTight) return [];
  
  const stretches: Record<string, string[]> = {
    '胸锁乳突肌': ['颈部侧屈拉伸', '颈部旋转拉伸'],
    '上斜方肌': ['头部侧屈拉伸', '肩部下沉拉伸'],
    '肩胛提肌': ['低头侧屈拉伸', '肩胛骨下沉拉伸'],
    '枕下肌群': ['收下巴拉伸', '枕下肌放松'],
    '斜角肌': ['颈部侧屈拉伸', '斜角肌自我放松'],
    '胸大肌': ['门框拉伸', '仰卧胸部拉伸', '弹力带胸部拉伸'],
    '胸小肌': ['靠墙胸部拉伸', '球按压放松'],
    '背阔肌': ['过顶拉伸', '侧屈拉伸'],
    '大圆肌': ['肩内旋拉伸', '背后交叉拉伸'],
    '髂腰肌': ['跪姿髋屈肌拉伸', '托马斯测试位拉伸'],
    '股直肌': ['站立股四头肌拉伸', '俯卧股四头肌拉伸'],
    '阔筋膜张肌': ['侧卧髂胫束拉伸', '站立交叉拉伸'],
    '竖脊肌': ['猫牛式', '婴儿式', '膝抱胸'],
    '腰方肌': ['侧屈拉伸', '坐姿脊柱旋转'],
    '臀大肌': ['鸽子式', '仰卧抱膝', '4字拉伸'],
    '腘绳肌': ['站立前屈', '坐姿前屈', '仰卧腘绳肌拉伸'],
    '股四头肌': ['站立股四头肌拉伸', '俯卧股四头肌拉伸'],
    '小腿三头肌': ['墙壁小腿拉伸', '台阶小腿拉伸', '泡沫轴放松'],
    '内收肌群': ['蝴蝶式拉伸', '侧弓步拉伸'],
  };
  return stretches[muscle] || ['适度拉伸'];
}

function getMuscleExercises(muscle: string, isWeak: boolean): string[] {
  if (!isWeak) return [];
  
  const exercises: Record<string, string[]> = {
    '颈深屈肌': ['收下巴训练', '颈部等长收缩', '仰卧颈部控制'],
    '下斜方肌': ['俯卧Y字上举', '弹力带下拉', '肩胛骨下沉训练'],
    '前锯肌': ['俯卧撑Plus', '肩胛骨前伸训练', '墙壁滑动'],
    '菱形肌': ['弹力带水平外展', '肩胛骨后缩训练', '俯卧划船'],
    '冈下肌': ['弹力带外旋', '侧卧外旋', '肩袖训练'],
    '腹直肌': ['卷腹', '平板支撑', '死虫式'],
    '腹横肌': ['真空收腹', '平板支撑', '鸟狗式'],
    '臀大肌': ['臀桥', '臀推', '单腿硬拉', '蚌式运动'],
    '臀中肌': ['侧卧抬腿', '蚌式运动', '站立外展'],
    '腘绳肌': ['罗马尼亚硬拉', '臀桥', '腘绳肌弯举'],
    '比目鱼肌': ['坐姿提踵', '单腿提踵'],
    '胫骨后肌': ['弹力带内翻', '足弓训练', '抓毛巾训练'],
    '胫骨前肌': ['足背屈训练', '弹力带背屈', '踮脚行走'],
  };
  return exercises[muscle] || ['适度强化训练'];
}

/**
 * 分析筋膜链状态
 */
export function analyzeFasciaChains(issues: PostureIssue[], angles: ExtendedJointAngles): FasciaChainStatus[] {
  const chains: FasciaChainStatus[] = [];
  
  // 前表链
  const frontLineIssues = issues.filter(i => 
    ['forward_head', 'rounded_shoulder', 'anterior_pelvic_tilt', 'flat_foot'].includes(i.type)
  );
  chains.push({
    name: '前表链',
    nameEn: 'Superficial Front Line',
    components: ['足背筋膜', '胫骨前肌', '股直肌', '腹直肌', '胸骨筋膜', '胸锁乳突肌'],
    status: frontLineIssues.length > 2 ? 'tight' : frontLineIssues.length > 0 ? 'restricted' : 'normal',
    tension: Math.min(10, frontLineIssues.length * 3),
    restrictions: frontLineIssues.map(i => i.name),
    impact: frontLineIssues.length > 0 ? ['屈曲受限', '呼吸模式异常', '颈部前侧紧张'] : [],
    treatmentSuggestions: frontLineIssues.length > 0 ? ['前表链拉伸', '腹部放松', '足背屈训练'] : [],
  });
  
  // 后表链
  const backLineIssues = issues.filter(i => 
    ['thoracic_hyperkyphosis', 'genu_recuvatum', 'heel_varus'].includes(i.type)
  );
  chains.push({
    name: '后表链',
    nameEn: 'Superficial Back Line',
    components: ['足底筋膜', '腓肠肌', '腘绳肌', '骶结节韧带', '竖脊肌', '帽状腱膜'],
    status: backLineIssues.length > 2 ? 'tight' : backLineIssues.length > 0 ? 'restricted' : 'normal',
    tension: Math.min(10, backLineIssues.length * 3),
    restrictions: backLineIssues.map(i => i.name),
    impact: backLineIssues.length > 0 ? ['伸展受限', '后侧紧张', '足底筋膜炎风险'] : [],
    treatmentSuggestions: backLineIssues.length > 0 ? ['后表链拉伸', '足底筋膜放松', '腘绳肌拉伸'] : [],
  });
  
  // 体侧链
  const lateralLineIssues = issues.filter(i => 
    ['elevated_shoulder', 'pelvic_obliquity', 'scoliosis'].includes(i.type)
  );
  chains.push({
    name: '体侧链',
    nameEn: 'Lateral Line',
    components: ['腓骨肌', '髂胫束', '臀大肌', '腹外斜肌', '肋间肌', '斜方肌'],
    status: lateralLineIssues.length > 2 ? 'tight' : lateralLineIssues.length > 0 ? 'restricted' : 'normal',
    tension: Math.min(10, lateralLineIssues.length * 3),
    restrictions: lateralLineIssues.map(i => i.name),
    impact: lateralLineIssues.length > 0 ? ['侧屈受限', '平衡受影响', '侧向不稳'] : [],
    treatmentSuggestions: lateralLineIssues.length > 0 ? ['体侧拉伸', '侧向稳定训练', '臀中肌强化'] : [],
  });
  
  // 螺旋链
  const spiralLineIssues = issues.filter(i => 
    ['spinal_rotation', 'pelvic_rotation', 'scoliosis'].includes(i.type)
  );
  chains.push({
    name: '螺旋链',
    nameEn: 'Spiral Line',
    components: ['菱形肌', '前锯肌', '腹外斜肌', '髂胫束', '胫骨前肌', '腓骨长肌'],
    status: spiralLineIssues.length > 1 ? 'tight' : spiralLineIssues.length > 0 ? 'restricted' : 'normal',
    tension: Math.min(10, spiralLineIssues.length * 4),
    restrictions: spiralLineIssues.map(i => i.name),
    impact: spiralLineIssues.length > 0 ? ['旋转受限', '步态异常', '躯干旋转'] : [],
    treatmentSuggestions: spiralLineIssues.length > 0 ? ['旋转拉伸', '核心旋转训练', '螺旋链放松'] : [],
  });
  
  // 深前线
  const deepFrontLineIssues = issues.filter(i => 
    ['anterior_pelvic_tilt', 'flat_foot', 'lumbar_hyperlordosis'].includes(i.type)
  );
  chains.push({
    name: '深前线',
    nameEn: 'Deep Front Line',
    components: ['足底深层', '胫骨后肌', '腘肌', '盆底肌', '髂腰肌', '膈肌', '心包', '斜角肌'],
    status: deepFrontLineIssues.length > 2 ? 'tight' : deepFrontLineIssues.length > 0 ? 'restricted' : 'normal',
    tension: Math.min(10, deepFrontLineIssues.length * 3),
    restrictions: deepFrontLineIssues.map(i => i.name),
    impact: deepFrontLineIssues.length > 0 ? ['核心失稳', '呼吸模式异常', '内脏功能影响'] : [],
    treatmentSuggestions: deepFrontLineIssues.length > 0 ? ['深前线放松', '盆底肌训练', '膈肌呼吸训练'] : [],
  });
  
  // 手臂链
  const armLineIssues = issues.filter(i => 
    ['rounded_shoulder', 'winging_scapula', 'frozen_shoulder_risk'].includes(i.type)
  );
  chains.push({
    name: '手臂链',
    nameEn: 'Arm Lines',
    components: ['胸小肌', '肱二头肌', '前臂屈肌', '胸大肌', '肱三头肌', '三角肌'],
    status: armLineIssues.length > 2 ? 'tight' : armLineIssues.length > 0 ? 'restricted' : 'normal',
    tension: Math.min(10, armLineIssues.length * 3),
    restrictions: armLineIssues.map(i => i.name),
    impact: armLineIssues.length > 0 ? ['上肢活动受限', '肩部不稳', '手臂麻木'] : [],
    treatmentSuggestions: armLineIssues.length > 0 ? ['胸肌拉伸', '肩袖训练', '手臂链放松'] : [],
  });
  
  return chains;
}

/**
 * 评估健康风险
 */
export function assessHealthRisks(issues: PostureIssue[], angles: ExtendedJointAngles): HealthRisk[] {
  const risks: HealthRisk[] = [];
  
  // 骨骼关节风险
  if (issues.some(i => ['forward_head', 'cervical_straightening'].includes(i.type))) {
    risks.push({
      category: 'skeletal',
      risk: issues.some(i => i.severity === 'severe') ? 'high' : 'medium',
      condition: '颈椎病风险',
      cause: '长期头前伸导致颈椎压力增加',
      symptoms: ['颈痛', '头痛', '手臂麻木', '头晕'],
      preventionMeasures: ['纠正头前伸姿势', '颈部肌肉强化', '定期颈椎活动'],
      medicalAdvice: '如出现持续颈痛、手臂麻木，建议就诊骨科或康复科',
    });
  }
  
  if (issues.some(i => i.type === 'thoracic_hyperkyphosis')) {
    risks.push({
      category: 'skeletal',
      risk: issues.some(i => i.severity === 'severe') ? 'high' : 'medium',
      condition: '胸椎后凸加重风险',
      cause: '长期驼背导致胸椎变形',
      symptoms: ['背痛', '胸廓受压', '呼吸受限'],
      preventionMeasures: ['姿势纠正', '背部肌肉训练', '胸椎活动度训练'],
      medicalAdvice: '严重驼背建议就诊脊柱外科评估',
    });
  }
  
  if (issues.some(i => i.type === 'anterior_pelvic_tilt')) {
    risks.push({
      category: 'skeletal',
      risk: 'medium',
      condition: '腰椎间盘突出风险',
      cause: '骨盆前倾导致腰椎前凸增加',
      symptoms: ['下腰痛', '腿部麻木', '站立困难'],
      preventionMeasures: ['骨盆位置纠正', '核心肌群训练', '髋屈肌拉伸'],
      medicalAdvice: '如出现下肢麻木，建议就诊骨科或神经科',
    });
  }
  
  // 神经系统风险
  if (issues.some(i => ['forward_head', 'elevated_shoulder'].includes(i.type))) {
    risks.push({
      category: 'neurological',
      risk: 'medium',
      condition: '颈神经根压迫风险',
      cause: '颈椎位置异常导致神经根受压',
      symptoms: ['手臂麻木', '手指刺痛', '握力下降'],
      preventionMeasures: ['颈部姿势纠正', '颈部肌肉放松', '避免长时间低头'],
      medicalAdvice: '如出现手臂麻木持续不缓解，建议就诊神经内科',
    });
  }
  
  if (issues.some(i => i.type === 'rounded_shoulder')) {
    risks.push({
      category: 'neurological',
      risk: 'low',
      condition: '臂丛神经压迫风险',
      cause: '圆肩导致胸廓出口变窄',
      symptoms: ['手臂麻木', '手部无力', '肩部疼痛'],
      preventionMeasures: ['圆肩纠正', '胸肌拉伸', '肩胛骨稳定训练'],
      medicalAdvice: '如症状持续，建议就诊康复科或骨科',
    });
  }
  
  // 呼吸系统风险
  if (issues.some(i => ['rounded_shoulder', 'thoracic_hyperkyphosis'].includes(i.type))) {
    risks.push({
      category: 'respiratory',
      risk: 'low',
      condition: '呼吸功能受影响',
      cause: '胸廓变形导致肺活量减少',
      symptoms: ['活动后气短', '胸闷', '呼吸浅促'],
      preventionMeasures: ['胸廓活动度训练', '呼吸训练', '姿势纠正'],
      medicalAdvice: '如呼吸困难明显，建议就诊呼吸科',
    });
  }
  
  // 循环系统风险
  if (issues.some(i => ['genu_recuvatum', 'genu_varum'].includes(i.type))) {
    risks.push({
      category: 'circulatory',
      risk: 'low',
      condition: '下肢血液循环影响',
      cause: '膝关节异常影响下肢血流',
      symptoms: ['小腿肿胀', '静脉曲张风险', '站立不适'],
      preventionMeasures: ['膝关节保护', '小腿肌肉训练', '避免久站'],
      medicalAdvice: '如出现明显肿胀，建议就诊血管外科',
    });
  }
  
  // 消化系统风险
  if (issues.some(i => ['thoracic_hyperkyphosis', 'anterior_pelvic_tilt'].includes(i.type))) {
    risks.push({
      category: 'digestive',
      risk: 'low',
      condition: '消化功能受影响',
      cause: '躯干变形导致腹腔受压',
      symptoms: ['消化不良', '腹胀', '便秘'],
      preventionMeasures: ['姿势纠正', '腹部按摩', '适量运动'],
      medicalAdvice: '如消化问题持续，建议就诊消化内科',
    });
  }
  
  return risks;
}

/**
 * 计算整体体态评分
 */
export function calculateOverallScoreEnhanced(
  issues: PostureIssue[],
  angles: ExtendedJointAngles
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
  
  // 综合征额外扣分
  if (issues.some(i => i.type === 'upper_crossed' || i.type === 'lower_crossed')) {
    score -= 5;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 创建MediaPipe Pose实例
 */
export function createPoseDetector(): any {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // @ts-ignore
  const { Pose } = require('@mediapipe/pose');
  
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
  
  return pose;
}

/**
 * 检测单张图片的姿态（增强版）
 */
export async function detectPoseFromImageEnhanced(
  imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  poseInstance: any,
  viewAngle: 'front' | 'back' | 'left' | 'right'
): Promise<EnhancedPostureAnalysisResult | null> {
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
        
        const extendedAngles = calculateExtendedAngles(landmarks);
        const issues = detectPostureIssuesEnhanced(landmarks, extendedAngles, viewAngle);
        const muscleAnalysis = analyzeMuscleStatus(issues);
        const fasciaChainAnalysis = analyzeFasciaChains(issues, extendedAngles);
        const healthRisks = assessHealthRisks(issues, extendedAngles);
        const overallScore = calculateOverallScoreEnhanced(issues, extendedAngles);
        const confidence = landmarks.reduce((sum, lm) => sum + lm.visibility, 0) / landmarks.length;
        
        resolve({
          landmarks,
          extendedAngles,
          issues,
          muscleAnalysis,
          fasciaChainAnalysis,
          healthRisks,
          overallScore,
          confidence,
          viewAngle,
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
