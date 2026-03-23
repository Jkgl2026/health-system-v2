import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// 用户基本信息表
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    age: integer("age"),
    gender: varchar("gender", { length: 10 }),
    weight: varchar("weight", { length: 20 }), // 体重(kg)
    height: varchar("height", { length: 20 }), // 身高(cm)
    bloodPressure: varchar("blood_pressure", { length: 50 }), // 血压
    occupation: varchar("occupation", { length: 100 }), // 职业
    address: text("address"), // 地址
    bmi: varchar("bmi", { length: 20 }), // 身体质量指数
    notes: text("notes"), // 管理员备注
    tags: jsonb("tags"), // 用户标签
    phoneGroupId: varchar("phone_group_id", { length: 36 }), // 手机号分组ID，用于标识同一手机号的不同填写记录
    isLatestVersion: boolean("is_latest_version").default(true), // 是否是最新版本
    deletedAt: timestamp("deleted_at", { withTimezone: true }), // 软删除标记
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    phoneIdx: index("users_phone_idx").on(table.phone),
    phoneGroupIdx: index("users_phone_group_idx").on(table.phoneGroupId),
    deletedAtIdx: index("users_deleted_at_idx").on(table.deletedAt),
    createdAtIdx: index("users_created_at_idx").on(table.createdAt),
    isLatestVersionIdx: index("users_is_latest_version_idx").on(table.isLatestVersion),
  })
);

// 症状自检结果表
export const symptomChecks = pgTable(
  "symptom_checks",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    checkedSymptoms: jsonb("checked_symptoms").notNull(), // 存储选中的症状ID数组
    totalScore: integer("total_score"),
    elementScores: jsonb("element_scores"), // 各要素得分 {气血: 5, 循环: 3, ...}
    checkedAt: timestamp("checked_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("symptom_checks_user_id_idx").on(table.userId),
    userIdCheckedAtIdx: index("symptom_checks_user_id_checked_at_idx").on(table.userId, table.checkedAt),
    checkedAtIdx: index("symptom_checks_checked_at_idx").on(table.checkedAt),
  })
);

// 健康要素分析结果表
export const healthAnalysis = pgTable(
  "health_analysis",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    qiAndBlood: integer("qi_and_blood"), // 气血
    circulation: integer("circulation"), // 循环
    toxins: integer("toxins"), // 毒素
    bloodLipids: integer("blood_lipids"), // 血脂
    coldness: integer("coldness"), // 寒凉
    immunity: integer("immunity"), // 免疫
    emotions: integer("emotions"), // 情绪
    overallHealth: integer("overall_health"), // 整体健康评分
    analyzedAt: timestamp("analyzed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("health_analysis_user_id_idx").on(table.userId),
    userIdAnalyzedAtIdx: index("health_analysis_user_id_analyzed_at_idx").on(table.userId, table.analyzedAt),
    analyzedAtIdx: index("health_analysis_analyzed_at_idx").on(table.analyzedAt),
  })
);

// 用户选择表
export const userChoices = pgTable(
  "user_choices",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planType: varchar("plan_type", { length: 50 }).notNull(), // 方案类型
    planDescription: text("plan_description"), // 方案描述
    selectedAt: timestamp("selected_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("user_choices_user_id_idx").on(table.userId),
  })
);

// 四个要求完成情况表
export const requirements = pgTable(
  "requirements",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requirement1Completed: boolean("requirement1_completed").default(false), // 要求1完成状态
    requirement2Completed: boolean("requirement2_completed").default(false), // 要求2完成状态
    requirement3Completed: boolean("requirement3_completed").default(false), // 要求3完成状态
    requirement4Completed: boolean("requirement4_completed").default(false), // 要求4完成状态
    requirement2Answers: jsonb("requirement2_answers"), // 要求2的回答
    sevenQuestionsAnswers: jsonb("seven_questions_answers"), // 持续跟进落实健康的七问答案
    badHabitsChecklist: jsonb("bad_habits_checklist"), // 不良生活习惯自检表（选中的习惯ID数组）
    symptoms300Checklist: jsonb("symptoms_300_checklist"), // 300项症状自检表（选中的症状ID数组）
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("requirements_user_id_idx").on(table.userId),
    completedAtIdx: index("requirements_completed_at_idx").on(table.completedAt),
    updatedAtIdx: index("requirements_updated_at_idx").on(table.updatedAt),
    req1Idx: index("requirements_requirement1_completed_idx").on(table.requirement1Completed),
    req2Idx: index("requirements_requirement2_completed_idx").on(table.requirement2Completed),
    req3Idx: index("requirements_requirement3_completed_idx").on(table.requirement3Completed),
    req4Idx: index("requirements_requirement4_completed_idx").on(table.requirement4Completed),
  })
);

// 管理员表
export const admins = pgTable(
  "admins",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    username: varchar("username", { length: 50 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(), // 存储加密后的密码
    name: varchar("name", { length: 128 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    usernameIdx: index("admins_username_idx").on(table.username),
  })
);

// 审计日志表 - 记录所有数据变更
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    action: varchar("action", { length: 20 }).notNull(), // CREATE, UPDATE, DELETE, RESTORE
    tableName: varchar("table_name", { length: 50 }).notNull(), // 表名
    recordId: varchar("record_id", { length: 36 }).notNull(), // 记录ID
    operatorId: varchar("operator_id", { length: 36 }), // 操作人ID（管理员或系统）
    operatorName: varchar("operator_name", { length: 128 }), // 操作人名称
    operatorType: varchar("operator_type", { length: 20 }).notNull(), // ADMIN, SYSTEM, USER
    oldData: jsonb("old_data"), // 修改前的数据
    newData: jsonb("new_data"), // 修改后的数据
    ip: varchar("ip", { length: 45 }), // 操作IP地址
    userAgent: text("user_agent"), // 用户代理
    description: text("description"), // 操作描述
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    recordIdx: index("audit_logs_record_idx").on(table.tableName, table.recordId),
    operatorIdx: index("audit_logs_operator_idx").on(table.operatorId),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
    actionIdx: index("audit_logs_action_idx").on(table.action),
    tableNameIdx: index("audit_logs_table_name_idx").on(table.tableName),
  })
);

// 审计日志归档表 - 用于存储超过1年的审计日志
export const auditLogsArchive = pgTable(
  "audit_logs_archive",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    action: varchar("action", { length: 20 }).notNull(), // CREATE, UPDATE, DELETE, RESTORE
    tableName: varchar("table_name", { length: 50 }).notNull(), // 表名
    recordId: varchar("record_id", { length: 36 }).notNull(), // 记录ID
    operatorId: varchar("operator_id", { length: 36 }), // 操作人ID（管理员或系统）
    operatorName: varchar("operator_name", { length: 128 }), // 操作人名称
    operatorType: varchar("operator_type", { length: 20 }).notNull(), // ADMIN, SYSTEM, USER
    oldData: jsonb("old_data"), // 修改前的数据
    newData: jsonb("new_data"), // 修改后的数据
    ip: varchar("ip", { length: 45 }), // 操作IP地址
    userAgent: text("user_agent"), // 用户代理
    description: text("description"), // 操作描述
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true })
      .defaultNow()
      .notNull(), // 归档时间
  },
  (table) => ({
    recordIdx: index("audit_logs_archive_record_idx").on(table.tableName, table.recordId),
    operatorIdx: index("audit_logs_archive_operator_idx").on(table.operatorId),
    createdAtIdx: index("audit_logs_archive_created_at_idx").on(table.createdAt),
    archivedAtIdx: index("audit_logs_archive_archived_at_idx").on(table.archivedAt),
    actionIdx: index("audit_logs_archive_action_idx").on(table.action),
    tableNameIdx: index("audit_logs_archive_table_name_idx").on(table.tableName),
  })
);

// 备份记录表 - 用于管理备份文件
export const backupRecords = pgTable(
  "backup_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    backupId: varchar("backup_id", { length: 100 }).notNull().unique(), // 备份ID
    backupType: varchar("backup_type", { length: 20 }).notNull(), // FULL 或 INCREMENTAL
    fileKey: varchar("file_key", { length: 500 }).notNull(), // 对象存储中的文件key
    fileSize: integer("file_size").notNull(), // 文件大小（字节）
    tableCount: integer("table_count").notNull(), // 表数量
    totalRecords: integer("total_records").notNull(), // 总记录数
    previousBackupId: varchar("previous_backup_id", { length: 100 }), // 上一次备份ID
    checksum: varchar("checksum", { length: 64 }), // 数据校验和
    description: text("description"), // 备份描述
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdBy: varchar("created_by", { length: 128 }).notNull(), // 创建者
  },
  (table) => ({
    backupIdIdx: index("backup_records_backup_id_idx").on(table.backupId),
    backupTypeIdx: index("backup_records_backup_type_idx").on(table.backupType),
    createdAtIdx: index("backup_records_created_at_idx").on(table.createdAt),
    previousBackupIdx: index("backup_records_previous_backup_idx").on(table.previousBackupId),
  })
);

// 课程表 - 存储所有课程信息
export const courses = pgTable(
  "courses",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 255 }).notNull(), // 课程标题
    content: text("content").notNull(), // 课程内容
    duration: varchar("duration", { length: 50 }), // 课程时长
    module: varchar("module", { length: 100 }), // 课程模块/分类（如因果、寒湿、排毒等）
    relatedElements: jsonb("related_elements"), // 相关的健康要素（如["气血", "循环", "毒素"]）
    relatedSymptoms: jsonb("related_symptoms"), // 相关的症状ID数组
    relatedDiseases: jsonb("related_diseases"), // 相关的疾病
    priority: integer("priority").default(0), // 优先级（用于匹配排序）
    isHidden: boolean("is_hidden").default(false).notNull(), // 是否隐藏（不在用户端显示）
    courseNumber: integer("course_number"), // 课程编号（如1, 2, 3...）
    season: varchar("season", { length: 50 }), // 季度（如第1季、第2季）
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    moduleIdx: index("courses_module_idx").on(table.module),
    isHiddenIdx: index("courses_is_hidden_idx").on(table.isHidden),
    priorityIdx: index("courses_priority_idx").on(table.priority),
    courseNumberIdx: index("courses_course_number_idx").on(table.courseNumber),
  })
);

// ============================================================
// 诊断相关表的影子定义（与生产数据库实际结构完全匹配）
// 
// 这些表已存在于生产数据库中，此处的定义仅用于告知 Drizzle 这些表存在，
// 避免 Drizzle 尝试创建或修改它们。
// 
// 这些表由各自的 API 路由使用原始 SQL 管理：
// - face_diagnosis_users / face_diagnosis_records: 由 face-diagnosis-records API 管理
// - tongue_diagnosis_users / tongue_diagnosis_records: 由 tongue-diagnosis-records API 管理
// - health_profiles: 由 migrate-diagnosis-tables API 管理
// - posture_users / posture_assessments: 由 posture-records API 管理
// - posture_diagnosis_records / posture_comparisons: 由 migrate-posture-tables API 管理
// 
// 类型定义请导入: import { FaceDiagnosisRecord, ... } from "./diagnosis-types"
// ============================================================

// 面诊用户表（影子定义 - 匹配生产数据库结构）
export const faceDiagnosisUsers = pgTable(
  "face_diagnosis_users",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    age: integer("age"),
    gender: varchar("gender", { length: 10 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

// 面诊记录表（影子定义 - 匹配生产数据库结构）
export const faceDiagnosisRecords = pgTable(
  "face_diagnosis_records",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id"),
    diagnosisDate: timestamp("diagnosis_date").defaultNow(),
    constitution: varchar("constitution", { length: 50 }),
    faceColor: text("face_color"),
    features: jsonb("features").default({}),
    healthHints: jsonb("health_hints").default([]),
    aiAnalysis: text("ai_analysis"),
    recommendations: jsonb("recommendations").default([]),
    imageThumbnail: text("image_thumbnail"),
    fullReport: text("full_report"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// 舌诊用户表（影子定义 - 匹配生产数据库结构）
export const tongueDiagnosisUsers = pgTable(
  "tongue_diagnosis_users",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    age: integer("age"),
    gender: varchar("gender", { length: 10 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

// 舌诊记录表（影子定义 - 匹配生产数据库结构）
export const tongueDiagnosisRecords = pgTable(
  "tongue_diagnosis_records",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id"),
    diagnosisDate: timestamp("diagnosis_date").defaultNow(),
    tongueColor: varchar("tongue_color", { length: 50 }),
    tongueCoating: varchar("tongue_coating", { length: 50 }),
    tongueShape: varchar("tongue_shape", { length: 50 }),
    constitution: varchar("constitution", { length: 50 }),
    features: jsonb("features").default({}),
    healthHints: jsonb("health_hints").default([]),
    aiAnalysis: text("ai_analysis"),
    recommendations: jsonb("recommendations").default([]),
    imageThumbnail: text("image_thumbnail"),
    fullReport: text("full_report"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// 健康档案表（影子定义 - 匹配生产数据库结构）
export const healthProfiles = pgTable(
  "health_profiles",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    latestScore: integer("latest_score"),
    constitution: varchar("constitution", { length: 50 }),
    constitutionConfidence: integer("constitution_confidence"),
    latestFaceScore: integer("latest_face_score"),
    faceDiagnosisCount: integer("face_diagnosis_count").default(0),
    lastFaceDiagnosisAt: timestamp("last_face_diagnosis_at", { withTimezone: true }),
    latestTongueScore: integer("latest_tongue_score"),
    tongueDiagnosisCount: integer("tongue_diagnosis_count").default(0),
    lastTongueDiagnosisAt: timestamp("last_tongue_diagnosis_at", { withTimezone: true }),
    organStatusTrend: jsonb("organ_status_trend"),
    comprehensiveConclusion: jsonb("comprehensive_conclusion"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 体态用户表（影子定义 - 匹配生产数据库结构）
export const postureUsers = pgTable(
  "posture_users",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    age: integer("age"),
    gender: varchar("gender", { length: 10 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

// 体态评估记录表（影子定义 - 匹配生产数据库结构）
export const postureAssessments = pgTable(
  "posture_assessments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id"),
    assessmentDate: timestamp("assessment_date").defaultNow(),
    overallScore: integer("overall_score"),
    grade: varchar("grade", { length: 1 }),
    issues: jsonb("issues").default([]),
    angles: jsonb("angles").default({}),
    muscles: jsonb("muscles").default({}),
    healthRisks: jsonb("health_risks").default([]),
    aiSummary: text("ai_summary"),
    aiDetailedAnalysis: jsonb("ai_detailed_analysis").default({}),
    tcmAnalysis: jsonb("tcm_analysis").default({}),
    trainingPlan: jsonb("training_plan").default({}),
    imageFront: text("image_front"),
    imageLeft: text("image_left"),
    imageRight: text("image_right"),
    imageBack: text("image_back"),
    annotationFront: text("annotation_front"),
    annotationLeft: text("annotation_left"),
    annotationRight: text("annotation_right"),
    annotationBack: text("annotation_back"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// 体态诊断记录表（影子定义 - 匹配生产数据库结构）
export const postureDiagnosisRecords = pgTable(
  "posture_diagnosis_records",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }),
    frontImageUrl: text("front_image_url"),
    leftSideImageUrl: text("left_side_image_url"),
    rightSideImageUrl: text("right_side_image_url"),
    backImageUrl: text("back_image_url"),
    score: integer("score"),
    grade: varchar("grade", { length: 2 }),
    bodyStructure: jsonb("body_structure"),
    fasciaChainAnalysis: jsonb("fascia_chain_analysis"),
    muscleAnalysis: jsonb("muscle_analysis"),
    breathingAssessment: jsonb("breathing_assessment"),
    alignmentAssessment: jsonb("alignment_assessment"),
    compensationPatterns: jsonb("compensation_patterns"),
    healthImpact: jsonb("health_impact"),
    healthPrediction: jsonb("health_prediction"),
    treatmentPlan: jsonb("treatment_plan"),
    fullReport: text("full_report"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 体态对比记录表（影子定义 - 匹配生产数据库结构）
export const postureComparisons = pgTable(
  "posture_comparisons",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }),
    currentRecordId: varchar("current_record_id", { length: 36 }),
    previousRecordId: varchar("previous_record_id", { length: 36 }),
    scoreChange: integer("score_change"),
    improvements: jsonb("improvements"),
    deteriorations: jsonb("deteriorations"),
    stableItems: jsonb("stable_items"),
    comparisonImages: jsonb("comparison_images"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// 训练动作库表 (与 migrate-posture-tables API 结构一致)
export const exerciseLibrary = pgTable(
  "exercise_library",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 100 }).notNull(),
    category: varchar("category", { length: 20 }).notNull(), // 整复训练/本源训练
    subCategory: varchar("sub_category", { length: 50 }),
    description: text("description"),
    targetIssues: jsonb("target_issues"),
    contraindications: jsonb("contraindications"),
    videoUrl: text("video_url"),
    gifUrl: text("gif_url"),
    imageUrl: text("image_url"),
    steps: jsonb("steps"),
    tips: jsonb("tips"),
    commonMistakes: jsonb("common_mistakes"),
    duration: varchar("duration", { length: 50 }),
    reps: integer("reps"),
    sets: integer("sets"),
    frequency: varchar("frequency", { length: 50 }),
    restTime: varchar("rest_time", { length: 50 }),
    easierVersion: varchar("easier_version", { length: 100 }),
    harderVersion: varchar("harder_version", { length: 100 }),
    primaryMuscles: jsonb("primary_muscles"),
    secondaryMuscles: jsonb("secondary_muscles"),
    stabilizerMuscles: jsonb("stabilizer_muscles"),
    relatedMeridians: jsonb("related_meridians"),
    relatedAcupoints: jsonb("related_acupoints"),
    sortOrder: integer("sort_order").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    categoryIdx: index("exercise_library_category_idx").on(table.category),
    targetIssuesIdx: index("exercise_library_target_issues_idx").on(table.targetIssues),
    isActiveIdx: index("exercise_library_is_active_idx").on(table.isActive),
  })
);

// 打卡记录表 (与 migrate-posture-tables API 结构一致)
export const checkInRecords = pgTable(
  "check_in_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // training/diet/symptom
    content: jsonb("content"),
    notes: text("notes"),
    exerciseIds: jsonb("exercise_ids"),
    completed: boolean("completed").default(true),
    duration: integer("duration"),
    checkInDate: timestamp("check_in_date", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("check_in_records_user_id_idx").on(table.userId),
    typeIdx: index("check_in_records_type_idx").on(table.type),
    checkInDateIdx: index("check_in_records_check_in_date_idx").on(table.checkInDate),
  })
);

// 提醒设置表 (与 migrate-posture-tables API 结构一致)
export const reminders = pgTable(
  "reminders",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // training/rediagnosis/diet
    title: varchar("title", { length: 100 }).notNull(),
    message: text("message"),
    reminderTime: varchar("reminder_time", { length: 10 }), // HH:mm
    frequency: varchar("frequency", { length: 20 }), // daily/weekly/custom
    daysOfWeek: jsonb("days_of_week"),
    isActive: boolean("is_active").default(true),
    lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("reminders_user_id_idx").on(table.userId),
    typeIdx: index("reminders_type_idx").on(table.type),
    isActiveIdx: index("reminders_is_active_idx").on(table.isActive),
  })
);

// 使用 createSchemaFactory 配置 date coercion（处理前端 string → Date 转换）
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// Zod schemas for validation
export const insertUserSchema = createCoercedInsertSchema(users).pick({
  name: true,
  phone: true,
  email: true,
  age: true,
  gender: true,
  weight: true,
  height: true,
  bloodPressure: true,
  occupation: true,
  address: true,
  bmi: true,
  phoneGroupId: true,
  isLatestVersion: true,
});

export const insertSymptomCheckSchema = createCoercedInsertSchema(symptomChecks).pick({
  userId: true,
  checkedSymptoms: true,
  totalScore: true,
  elementScores: true,
});

export const insertHealthAnalysisSchema = createCoercedInsertSchema(healthAnalysis).pick({
  userId: true,
  qiAndBlood: true,
  circulation: true,
  toxins: true,
  bloodLipids: true,
  coldness: true,
  immunity: true,
  emotions: true,
  overallHealth: true,
});

export const insertUserChoiceSchema = createCoercedInsertSchema(userChoices).pick({
  userId: true,
  planType: true,
  planDescription: true,
});

export const insertRequirementSchema = createCoercedInsertSchema(requirements).pick({
  userId: true,
  requirement1Completed: true,
  requirement2Completed: true,
  requirement3Completed: true,
  requirement4Completed: true,
  requirement2Answers: true,
  sevenQuestionsAnswers: true,
  badHabitsChecklist: true,
  symptoms300Checklist: true,
  completedAt: true,
});

export const insertAdminSchema = createCoercedInsertSchema(admins).pick({
  username: true,
  password: true,
  name: true,
  isActive: true,
});

export const insertAuditLogSchema = createCoercedInsertSchema(auditLogs).pick({
  action: true,
  tableName: true,
  recordId: true,
  operatorId: true,
  operatorName: true,
  operatorType: true,
  oldData: true,
  newData: true,
  ip: true,
  userAgent: true,
  description: true,
});

export const insertCourseSchema = createCoercedInsertSchema(courses).pick({
  title: true,
  content: true,
  duration: true,
  module: true,
  relatedElements: true,
  relatedSymptoms: true,
  relatedDiseases: true,
  priority: true,
  isHidden: true,
  courseNumber: true,
  season: true,
});

// 注意：insertHealthProfileSchema 已移除，health_profiles 表不由 Drizzle 管理
// 如需类型，请使用 diagnosis-types.ts 中的 InsertHealthProfile

export const insertExerciseLibrarySchema = createCoercedInsertSchema(exerciseLibrary).pick({
  name: true,
  category: true,
  subCategory: true,
  description: true,
  targetIssues: true,
  contraindications: true,
  videoUrl: true,
  gifUrl: true,
  imageUrl: true,
  steps: true,
  tips: true,
  commonMistakes: true,
  duration: true,
  reps: true,
  sets: true,
  frequency: true,
  restTime: true,
  easierVersion: true,
  harderVersion: true,
  primaryMuscles: true,
  secondaryMuscles: true,
  stabilizerMuscles: true,
  relatedMeridians: true,
  relatedAcupoints: true,
  sortOrder: true,
  isActive: true,
});

export const insertCheckInRecordSchema = createCoercedInsertSchema(checkInRecords).pick({
  userId: true,
  type: true,
  content: true,
  notes: true,
  exerciseIds: true,
  completed: true,
  duration: true,
  checkInDate: true,
});

export const insertReminderSchema = createCoercedInsertSchema(reminders).pick({
  userId: true,
  type: true,
  title: true,
  message: true,
  reminderTime: true,
  frequency: true,
  daysOfWeek: true,
  isActive: true,
});

// TypeScript 类型导出
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SymptomCheck = typeof symptomChecks.$inferSelect;
export type InsertSymptomCheck = typeof symptomChecks.$inferInsert;
export type HealthAnalysis = typeof healthAnalysis.$inferSelect;
export type InsertHealthAnalysis = typeof healthAnalysis.$inferInsert;
export type UserChoice = typeof userChoices.$inferSelect;
export type InsertUserChoice = typeof userChoices.$inferInsert;
export type Requirement = typeof requirements.$inferSelect;
export type InsertRequirement = typeof requirements.$inferInsert;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type AuditLogArchive = typeof auditLogsArchive.$inferSelect;
export type InsertAuditLogArchive = typeof auditLogsArchive.$inferInsert;
export type BackupRecord = typeof backupRecords.$inferSelect;
export type InsertBackupRecord = typeof backupRecords.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;
export type ExerciseLibraryRecord = typeof exerciseLibrary.$inferSelect;
export type InsertExerciseLibraryRecord = typeof exerciseLibrary.$inferInsert;
export type CheckInRecord = typeof checkInRecords.$inferSelect;
export type InsertCheckInRecord = typeof checkInRecords.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

// 诊断表类型从单独的类型文件导出
// 这些表不由 Drizzle 管理，类型定义在 diagnosis-types.ts
export type {
  FaceDiagnosisUser,
  InsertFaceDiagnosisUser,
  FaceDiagnosisRecord,
  InsertFaceDiagnosisRecord,
  TongueDiagnosisUser,
  InsertTongueDiagnosisUser,
  TongueDiagnosisRecord,
  InsertTongueDiagnosisRecord,
  HealthProfile,
  InsertHealthProfile,
  PostureDiagnosisRecord,
  InsertPostureDiagnosisRecord,
  PostureComparison,
  InsertPostureComparison,
} from "./diagnosis-types";
