/**
 * 诊断表类型定义
 * 
 * 这些表由各自的 API 路由使用原始 SQL 创建和管理：
 * - face_diagnosis_users / face_diagnosis_records: 由 migrate-diagnosis-tables 和 face-diagnosis-records API 管理
 * - tongue_diagnosis_users / tongue_diagnosis_records: 由 migrate-diagnosis-tables 和 tongue-diagnosis-records API 管理
 * - health_profiles: 由 migrate-diagnosis-tables API 管理
 * - posture_users / posture_assessments: 由 migrate-posture-tables API 管理
 * 
 * 注意：这些表不应该通过 Drizzle 迁移管理，因为它们使用原始 SQL 创建，
 * 并且生产数据库中已存在数据。
 */

// 面诊用户表类型（INTEGER 主键）
export interface FaceDiagnosisUser {
  id: number;
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

// 面诊记录表类型（INTEGER 主键）
export interface FaceDiagnosisRecord {
  id: number;
  userId: number | null;
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
  userId?: number | null;
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

// 舌诊用户表类型（INTEGER 主键）
export interface TongueDiagnosisUser {
  id: number;
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

// 舌诊记录表类型（INTEGER 主键）
export interface TongueDiagnosisRecord {
  id: number;
  userId: number | null;
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
  userId?: number | null;
  imageUrl?: string | null;
  score?: number | null;
  tongueBody?: Record<string, unknown> | null;
  tongueCoating?: Record<string, unknown> | null;
  constitution?: Record<string, unknown> | null;
  organStatus?: Record<string, unknown> | null;
  suggestions?: Record<string, unknown> | null;
  fullReport?: string | null;
}

// 健康档案表类型（INTEGER 主键）
export interface HealthProfile {
  id: number;
  userId: number;
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
  userId: number;
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

// 体态用户表类型（INTEGER 主键）
export interface PostureUser {
  id: number;
  name: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertPostureUser {
  name: string;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
}

// 体态评估记录表类型（INTEGER 主键）
export interface PostureAssessment {
  id: number;
  userId: number | null;
  assessmentDate: Date | null;
  overallScore: number | null;
  grade: string | null;
  issues: Record<string, unknown> | null;
  angles: Record<string, unknown> | null;
  muscles: Record<string, unknown> | null;
  healthRisks: Record<string, unknown> | null;
  aiSummary: string | null;
  aiDetailedAnalysis: Record<string, unknown> | null;
  tcmAnalysis: Record<string, unknown> | null;
  trainingPlan: Record<string, unknown> | null;
  imageFront: string | null;
  imageLeft: string | null;
  imageRight: string | null;
  imageBack: string | null;
  annotationFront: string | null;
  annotationLeft: string | null;
  annotationRight: string | null;
  annotationBack: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface InsertPostureAssessment {
  userId?: number | null;
  assessmentDate?: Date | null;
  overallScore?: number | null;
  grade?: string | null;
  issues?: Record<string, unknown> | null;
  angles?: Record<string, unknown> | null;
  muscles?: Record<string, unknown> | null;
  healthRisks?: Record<string, unknown> | null;
  aiSummary?: string | null;
  aiDetailedAnalysis?: Record<string, unknown> | null;
  tcmAnalysis?: Record<string, unknown> | null;
  trainingPlan?: Record<string, unknown> | null;
  imageFront?: string | null;
  imageLeft?: string | null;
  imageRight?: string | null;
  imageBack?: string | null;
  annotationFront?: string | null;
  annotationLeft?: string | null;
  annotationRight?: string | null;
  annotationBack?: string | null;
  notes?: string | null;
}
