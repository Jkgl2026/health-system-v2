/**
 * 诊断表类型定义
 * 
 * 这些表由各自的 API 路由使用原始 SQL 创建和管理：
 * - face_diagnosis_users / face_diagnosis_records: 由 migrate-diagnosis-tables 和 face-diagnosis-records API 管理
 * - tongue_diagnosis_users / tongue_diagnosis_records: 由 migrate-diagnosis-tables 和 tongue-diagnosis-records API 管理
 * - health_profiles: 由 migrate-diagnosis-tables API 管理
 * - posture_diagnosis_records / posture_comparisons: 由 migrate-posture-tables API 管理
 * 
 * 注意：这些表不应该通过 Drizzle 迁移管理，因为它们使用原始 SQL 创建，
 * 并且生产数据库中已存在数据。
 */

// 面诊用户表类型
export interface FaceDiagnosisUser {
  id: string;
  name: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertFaceDiagnosisUser {
  name: string;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
}

// 面诊记录表类型
export interface FaceDiagnosisRecord {
  id: string;
  userId: string | null;
  imageUrl: string | null;
  score: number | null;
  faceColor: Record<string, unknown> | null;
  faceLuster: Record<string, unknown> | null;
  facialFeatures: Record<string, unknown> | null;
  facialCharacteristics: Record<string, unknown> | null;
  constitution: Record<string, unknown> | null;
  organStatus: Record<string, unknown> | null;
  suggestions: Record<string, unknown> | null;
  fullReport: string | null;
  createdAt: Date;
}

export interface InsertFaceDiagnosisRecord {
  userId?: string | null;
  imageUrl?: string | null;
  score?: number | null;
  faceColor?: Record<string, unknown> | null;
  faceLuster?: Record<string, unknown> | null;
  facialFeatures?: Record<string, unknown> | null;
  facialCharacteristics?: Record<string, unknown> | null;
  constitution?: Record<string, unknown> | null;
  organStatus?: Record<string, unknown> | null;
  suggestions?: Record<string, unknown> | null;
  fullReport?: string | null;
}

// 舌诊用户表类型
export interface TongueDiagnosisUser {
  id: string;
  name: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertTongueDiagnosisUser {
  name: string;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
}

// 舌诊记录表类型
export interface TongueDiagnosisRecord {
  id: string;
  userId: string | null;
  imageUrl: string | null;
  score: number | null;
  tongueBody: Record<string, unknown> | null;
  tongueCoating: Record<string, unknown> | null;
  constitution: Record<string, unknown> | null;
  organStatus: Record<string, unknown> | null;
  suggestions: Record<string, unknown> | null;
  fullReport: string | null;
  createdAt: Date;
}

export interface InsertTongueDiagnosisRecord {
  userId?: string | null;
  imageUrl?: string | null;
  score?: number | null;
  tongueBody?: Record<string, unknown> | null;
  tongueCoating?: Record<string, unknown> | null;
  constitution?: Record<string, unknown> | null;
  organStatus?: Record<string, unknown> | null;
  suggestions?: Record<string, unknown> | null;
  fullReport?: string | null;
}

// 健康档案表类型
export interface HealthProfile {
  id: string;
  userId: string;
  latestScore: number | null;
  constitution: string | null;
  constitutionConfidence: number | null;
  latestFaceScore: number | null;
  faceDiagnosisCount: number | null;
  lastFaceDiagnosisAt: Date | null;
  latestTongueScore: number | null;
  tongueDiagnosisCount: number | null;
  lastTongueDiagnosisAt: Date | null;
  organStatusTrend: Record<string, unknown> | null;
  comprehensiveConclusion: Record<string, unknown> | null;
  updatedAt: Date;
}

export interface InsertHealthProfile {
  userId: string;
  latestScore?: number | null;
  constitution?: string | null;
  constitutionConfidence?: number | null;
  latestFaceScore?: number | null;
  faceDiagnosisCount?: number | null;
  lastFaceDiagnosisAt?: Date | null;
  latestTongueScore?: number | null;
  tongueDiagnosisCount?: number | null;
  lastTongueDiagnosisAt?: Date | null;
  organStatusTrend?: Record<string, unknown> | null;
  comprehensiveConclusion?: Record<string, unknown> | null;
}

// 体态诊断记录表类型
export interface PostureDiagnosisRecord {
  id: string;
  userId: string | null;
  frontImageUrl: string | null;
  leftSideImageUrl: string | null;
  rightSideImageUrl: string | null;
  backImageUrl: string | null;
  score: number | null;
  grade: string | null;
  bodyStructure: Record<string, unknown> | null;
  fasciaChainAnalysis: Record<string, unknown> | null;
  muscleAnalysis: Record<string, unknown> | null;
  breathingAssessment: Record<string, unknown> | null;
  alignmentAssessment: Record<string, unknown> | null;
  compensationPatterns: Record<string, unknown> | null;
  healthImpact: Record<string, unknown> | null;
  healthPrediction: Record<string, unknown> | null;
  treatmentPlan: Record<string, unknown> | null;
  fullReport: string | null;
  createdAt: Date;
}

export interface InsertPostureDiagnosisRecord {
  userId?: string | null;
  frontImageUrl?: string | null;
  leftSideImageUrl?: string | null;
  rightSideImageUrl?: string | null;
  backImageUrl?: string | null;
  score?: number | null;
  grade?: string | null;
  bodyStructure?: Record<string, unknown> | null;
  fasciaChainAnalysis?: Record<string, unknown> | null;
  muscleAnalysis?: Record<string, unknown> | null;
  breathingAssessment?: Record<string, unknown> | null;
  alignmentAssessment?: Record<string, unknown> | null;
  compensationPatterns?: Record<string, unknown> | null;
  healthImpact?: Record<string, unknown> | null;
  healthPrediction?: Record<string, unknown> | null;
  treatmentPlan?: Record<string, unknown> | null;
  fullReport?: string | null;
}

// 体态对比记录表类型
export interface PostureComparison {
  id: string;
  userId: string | null;
  currentRecordId: string | null;
  previousRecordId: string | null;
  scoreChange: number | null;
  improvements: Record<string, unknown> | null;
  deteriorations: Record<string, unknown> | null;
  stableItems: Record<string, unknown> | null;
  comparisonImages: Record<string, unknown> | null;
  createdAt: Date;
}

export interface InsertPostureComparison {
  userId?: string | null;
  currentRecordId?: string | null;
  previousRecordId?: string | null;
  scoreChange?: number | null;
  improvements?: Record<string, unknown> | null;
  deteriorations?: Record<string, unknown> | null;
  stableItems?: Record<string, unknown> | null;
  comparisonImages?: Record<string, unknown> | null;
}
