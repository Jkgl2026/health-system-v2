import { pgTable, index, foreignKey, varchar, text, timestamp, unique, boolean, uniqueIndex, jsonb, serial, integer, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const userChoices = pgTable("user_choices", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	planType: varchar("plan_type", { length: 50 }).notNull(),
	planDescription: text("plan_description"),
	selectedAt: timestamp("selected_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_user_choices_selected_at").using("btree", table.selectedAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_user_choices_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("user_choices_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_choices_user_id_fkey"
		}).onDelete("cascade"),
]);

export const admins = pgTable("admins", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	username: varchar({ length: 50 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 128 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("admins_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
	unique("admins_username_key").on(table.username),
]);

export const requirements = pgTable("requirements", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	requirement1Completed: boolean("requirement1_completed").default(false),
	requirement2Completed: boolean("requirement2_completed").default(false),
	requirement3Completed: boolean("requirement3_completed").default(false),
	requirement4Completed: boolean("requirement4_completed").default(false),
	requirement2Answers: jsonb("requirement2_answers"),
	sevenQuestionsAnswers: jsonb("seven_questions_answers"),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	badHabitsChecklist: jsonb("bad_habits_checklist"),
	symptoms300Checklist: jsonb("symptoms_300_checklist"),
}, (table) => [
	index("idx_requirements_updated_at").using("btree", table.updatedAt.asc().nullsLast().op("timestamptz_ops")),
	uniqueIndex("idx_requirements_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("requirements_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "requirements_user_id_fkey"
		}).onDelete("cascade"),
]);

export const symptomCheck = pgTable("symptom_check", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	checkDate: timestamp("check_date", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	selectedSymptoms: jsonb("selected_symptoms").notNull(),
	targetSymptoms: jsonb("target_symptoms").notNull(),
	totalScore: integer("total_score").default(0).notNull(),
	qiBloodScore: integer("qi_blood_score").default(0),
	circulationScore: integer("circulation_score").default(0),
	toxinsScore: integer("toxins_score").default(0),
	bloodLipidsScore: integer("blood_lipids_score").default(0),
	coldnessScore: integer("coldness_score").default(0),
	immunityScore: integer("immunity_score").default(0),
	emotionsScore: integer("emotions_score").default(0),
	createTime: timestamp("create_time", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updateTime: timestamp("update_time", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_symptom_check_date").using("btree", table.checkDate.asc().nullsLast().op("timestamp_ops")),
	index("idx_symptom_check_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const users = pgTable("users", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	name: varchar({ length: 128 }),
	phone: varchar({ length: 20 }),
	email: varchar({ length: 255 }),
	age: integer(),
	gender: varchar({ length: 10 }),
	weight: varchar({ length: 20 }),
	height: varchar({ length: 20 }),
	bloodPressure: varchar("blood_pressure", { length: 50 }),
	occupation: varchar({ length: 100 }),
	address: text(),
	bmi: varchar({ length: 20 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	phoneGroupId: varchar("phone_group_id", { length: 36 }),
	isLatestVersion: boolean("is_latest_version").default(true),
	notes: text(),
	tags: jsonb(),
}, (table) => [
	index("idx_users_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_users_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_users_phone").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	index("users_phone_group_idx").using("btree", table.phoneGroupId.asc().nullsLast().op("text_ops")),
	index("users_phone_idx").using("btree", table.phone.asc().nullsLast().op("text_ops")),
]);

export const postureDiagnosisRecords = pgTable("posture_diagnosis_records", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }),
	frontImageUrl: text("front_image_url"),
	leftSideImageUrl: text("left_side_image_url"),
	rightSideImageUrl: text("right_side_image_url"),
	backImageUrl: text("back_image_url"),
	score: integer(),
	grade: varchar({ length: 2 }),
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
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("posture_diagnosis_records_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("posture_diagnosis_records_score_idx").using("btree", table.score.asc().nullsLast().op("int4_ops")),
	index("posture_diagnosis_records_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "posture_diagnosis_records_user_id_fkey"
		}).onDelete("cascade"),
]);

export const exerciseLibrary = pgTable("exercise_library", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	category: varchar({ length: 20 }).notNull(),
	subCategory: varchar("sub_category", { length: 50 }),
	description: text(),
	targetIssues: jsonb("target_issues"),
	contraindications: jsonb(),
	videoUrl: text("video_url"),
	gifUrl: text("gif_url"),
	imageUrl: text("image_url"),
	steps: jsonb(),
	tips: jsonb(),
	commonMistakes: jsonb("common_mistakes"),
	duration: varchar({ length: 50 }),
	reps: integer(),
	sets: integer(),
	frequency: varchar({ length: 50 }),
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
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("exercise_library_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("exercise_library_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("exercise_library_target_issues_idx").using("btree", table.targetIssues.asc().nullsLast().op("jsonb_ops")),
]);

export const postureComparisons = pgTable("posture_comparisons", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }),
	currentRecordId: varchar("current_record_id", { length: 36 }),
	previousRecordId: varchar("previous_record_id", { length: 36 }),
	scoreChange: integer("score_change"),
	improvements: jsonb(),
	deteriorations: jsonb(),
	stableItems: jsonb("stable_items"),
	comparisonImages: jsonb("comparison_images"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("posture_comparisons_current_record_idx").using("btree", table.currentRecordId.asc().nullsLast().op("text_ops")),
	index("posture_comparisons_previous_record_idx").using("btree", table.previousRecordId.asc().nullsLast().op("text_ops")),
	index("posture_comparisons_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "posture_comparisons_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.currentRecordId],
			foreignColumns: [postureDiagnosisRecords.id],
			name: "posture_comparisons_current_record_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.previousRecordId],
			foreignColumns: [postureDiagnosisRecords.id],
			name: "posture_comparisons_previous_record_id_fkey"
		}).onDelete("cascade"),
]);

export const auditLogs = pgTable("audit_logs", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	action: varchar({ length: 20 }).notNull(),
	tableName: varchar("table_name", { length: 50 }).notNull(),
	recordId: varchar("record_id", { length: 36 }).notNull(),
	operatorId: varchar("operator_id", { length: 36 }),
	operatorName: varchar("operator_name", { length: 128 }),
	operatorType: varchar("operator_type", { length: 20 }).notNull(),
	oldData: jsonb("old_data"),
	newData: jsonb("new_data"),
	ip: varchar({ length: 45 }),
	userAgent: text("user_agent"),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("audit_logs_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("audit_logs_operator_idx").using("btree", table.operatorId.asc().nullsLast().op("text_ops")),
	index("audit_logs_record_idx").using("btree", table.tableName.asc().nullsLast().op("text_ops"), table.recordId.asc().nullsLast().op("text_ops")),
]);

export const courses = pgTable("courses", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	duration: varchar({ length: 50 }),
	module: varchar({ length: 100 }),
	relatedElements: jsonb("related_elements"),
	relatedSymptoms: jsonb("related_symptoms"),
	relatedDiseases: jsonb("related_diseases"),
	priority: integer().default(0),
	isHidden: boolean("is_hidden").default(true).notNull(),
	courseNumber: integer("course_number"),
	season: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("courses_course_number_idx").using("btree", table.courseNumber.asc().nullsLast().op("int4_ops")),
	index("courses_is_hidden_idx").using("btree", table.isHidden.asc().nullsLast().op("bool_ops")),
	index("courses_module_idx").using("btree", table.module.asc().nullsLast().op("text_ops")),
	index("courses_priority_idx").using("btree", table.priority.asc().nullsLast().op("int4_ops")),
]);

export const migrationHistory = pgTable("migration_history", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	migrationId: varchar("migration_id", { length: 64 }).notNull(),
	migrationType: varchar("migration_type", { length: 20 }).notNull(),
	tableName: varchar("table_name", { length: 50 }).notNull(),
	description: text().notNull(),
	status: varchar({ length: 20 }).notNull(),
	backupId: varchar("backup_id", { length: 64 }),
	rollbackSql: text("rollback_sql"),
	executedAt: timestamp("executed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	errorMessage: text("error_message"),
}, (table) => [
	unique("migration_history_migration_id_key").on(table.migrationId),
]);

export const sysAdmin = pgTable("sys_admin", {
	adminId: serial("admin_id").primaryKey().notNull(),
	username: varchar({ length: 50 }).notNull(),
	password: varchar({ length: 100 }).notNull(),
	createTime: timestamp("create_time", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updateTime: timestamp("update_time", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_admin_username").using("btree", table.username.asc().nullsLast().op("text_ops")),
	unique("sys_admin_username_key").on(table.username),
]);

export const sysUser = pgTable("sys_user", {
	userId: serial("user_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	phone: varchar({ length: 20 }),
	gender: varchar({ length: 10 }),
	age: integer(),
	height: numeric({ precision: 5, scale:  2 }),
	weight: numeric({ precision: 5, scale:  2 }),
	waistline: numeric({ precision: 5, scale:  2 }),
	hipline: numeric({ precision: 5, scale:  2 }),
	bloodPressureHigh: varchar("blood_pressure_high", { length: 10 }),
	bloodPressureLow: varchar("blood_pressure_low", { length: 10 }),
	bloodSugar: varchar("blood_sugar", { length: 10 }),
	bloodFat: varchar("blood_fat", { length: 10 }),
	heartRate: varchar("heart_rate", { length: 10 }),
	sleepHours: numeric("sleep_hours", { precision: 3, scale:  1 }),
	exerciseHours: numeric("exercise_hours", { precision: 3, scale:  1 }),
	smoking: varchar({ length: 10 }),
	drinking: varchar({ length: 10 }),
	diet: varchar({ length: 50 }),
	chronicDisease: varchar("chronic_disease", { length: 200 }),
	medication: varchar({ length: 200 }),
	familyHistory: varchar("family_history", { length: 200 }),
	symptoms: varchar({ length: 500 }),
	answerContent: text("answer_content"),
	analysis: text(),
	healthStatus: varchar("health_status", { length: 20 }).default('一般'),
	healthScore: integer("health_score"),
	selfCheckCompleted: boolean("self_check_completed").default(false),
	selfCheckTime: timestamp("self_check_time", { mode: 'string' }),
	createTime: timestamp("create_time", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updateTime: timestamp("update_time", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	email: varchar(),
	occupation: varchar(),
	address: varchar(),
	bmi: numeric(),
}, (table) => [
	index("idx_user_health_status").using("btree", table.healthStatus.asc().nullsLast().op("text_ops")),
	index("idx_user_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_user_phone").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	index("idx_user_self_check_time").using("btree", table.selfCheckTime.asc().nullsLast().op("timestamp_ops")),
]);

export const healthAnalysis = pgTable("health_analysis", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	checkId: varchar("check_id", { length: 36 }),
	qiAndBlood: integer("qi_and_blood"),
	circulation: integer(),
	toxins: integer(),
	bloodLipids: integer("blood_lipids"),
	coldness: integer(),
	immunity: integer(),
	emotions: integer(),
	overallHealth: integer("overall_health"),
	analyzedAt: timestamp("analyzed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("health_analysis_analyzed_at_idx").using("btree", table.analyzedAt.asc().nullsLast().op("timestamptz_ops")),
	index("health_analysis_check_id_idx").using("btree", table.checkId.asc().nullsLast().op("text_ops")),
	index("health_analysis_user_id_analyzed_at_idx").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.analyzedAt.asc().nullsLast().op("text_ops")),
	index("health_analysis_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_health_analysis_user_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.checkId],
			foreignColumns: [symptomChecks.id],
			name: "fk_health_analysis_check_id"
		}).onDelete("cascade"),
]);

export const symptomChecks = pgTable("symptom_checks", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	checkedSymptoms: jsonb("checked_symptoms").notNull(),
	totalScore: integer("total_score"),
	elementScores: jsonb("element_scores"),
	checkedAt: timestamp("checked_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("symptom_checks_checked_at_idx").using("btree", table.checkedAt.asc().nullsLast().op("timestamptz_ops")),
	index("symptom_checks_user_id_checked_at_idx").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.checkedAt.asc().nullsLast().op("text_ops")),
	index("symptom_checks_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const healthQuestions = pgTable("health_questions", {
	id: serial().primaryKey().notNull(),
	question: text().notNull(),
	category: text(),
	order: integer().default(1),
	description: text(),
	importance: text().default('中'),
	tips: jsonb().default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const healthProfiles = pgTable("health_profiles", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	latestScore: integer("latest_score"),
	constitution: varchar({ length: 50 }),
	constitutionConfidence: integer("constitution_confidence"),
	latestFaceScore: integer("latest_face_score"),
	faceDiagnosisCount: integer("face_diagnosis_count").default(0),
	lastFaceDiagnosisAt: timestamp("last_face_diagnosis_at", { withTimezone: true, mode: 'string' }),
	latestTongueScore: integer("latest_tongue_score"),
	tongueDiagnosisCount: integer("tongue_diagnosis_count").default(0),
	lastTongueDiagnosisAt: timestamp("last_tongue_diagnosis_at", { withTimezone: true, mode: 'string' }),
	organStatusTrend: jsonb("organ_status_trend"),
	comprehensiveConclusion: jsonb("comprehensive_conclusion"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("health_profiles_latest_score_idx").using("btree", table.latestScore.asc().nullsLast().op("int4_ops")),
	index("health_profiles_updated_at_idx").using("btree", table.updatedAt.asc().nullsLast().op("timestamptz_ops")),
	index("health_profiles_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "health_profiles_user_id_fkey"
		}).onDelete("cascade"),
	unique("health_profiles_user_id_key").on(table.userId),
]);

export const checkInRecords = pgTable("check_in_records", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	type: varchar({ length: 20 }).notNull(),
	content: jsonb(),
	notes: text(),
	exerciseIds: jsonb("exercise_ids"),
	completed: boolean().default(true),
	duration: integer(),
	checkInDate: timestamp("check_in_date", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("check_in_records_check_in_date_idx").using("btree", table.checkInDate.asc().nullsLast().op("timestamptz_ops")),
	index("check_in_records_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("check_in_records_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "check_in_records_user_id_fkey"
		}).onDelete("cascade"),
]);

export const reminders = pgTable("reminders", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	type: varchar({ length: 20 }).notNull(),
	title: varchar({ length: 100 }).notNull(),
	message: text(),
	reminderTime: varchar("reminder_time", { length: 10 }),
	frequency: varchar({ length: 20 }),
	daysOfWeek: jsonb("days_of_week"),
	isActive: boolean("is_active").default(true),
	lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("reminders_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("reminders_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("reminders_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "reminders_user_id_fkey"
		}).onDelete("cascade"),
]);

export const postureAssessments = pgTable("posture_assessments", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	assessmentDate: timestamp("assessment_date", { mode: 'string' }).defaultNow(),
	overallScore: integer("overall_score"),
	grade: varchar({ length: 1 }),
	issues: jsonb().default([]),
	angles: jsonb().default({}),
	muscles: jsonb().default({}),
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
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_posture_assessments_date").using("btree", table.assessmentDate.asc().nullsLast().op("timestamp_ops")),
	index("idx_posture_assessments_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [postureUsers.id],
			name: "posture_assessments_user_id_fkey"
		}),
]);

export const postureUsers = pgTable("posture_users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	phone: varchar({ length: 20 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	age: integer(),
	gender: varchar({ length: 10 }),
}, (table) => [
	index("idx_posture_users_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_posture_users_phone").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	unique("posture_users_name_phone_key").on(table.name, table.phone),
]);

export const faceDiagnosisRecords = pgTable("face_diagnosis_records", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	diagnosisDate: timestamp("diagnosis_date", { mode: 'string' }).defaultNow(),
	constitution: varchar({ length: 50 }),
	faceColor: text("face_color"),
	features: jsonb().default({}),
	healthHints: jsonb("health_hints").default([]),
	aiAnalysis: text("ai_analysis"),
	recommendations: jsonb().default([]),
	imageThumbnail: text("image_thumbnail"),
	fullReport: text("full_report"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_face_records_date").using("btree", table.diagnosisDate.asc().nullsLast().op("timestamp_ops")),
	index("idx_face_records_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [faceDiagnosisUsers.id],
			name: "face_diagnosis_records_user_id_fkey"
		}),
]);

export const tongueDiagnosisRecords = pgTable("tongue_diagnosis_records", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	diagnosisDate: timestamp("diagnosis_date", { mode: 'string' }).defaultNow(),
	tongueColor: varchar("tongue_color", { length: 50 }),
	tongueCoating: varchar("tongue_coating", { length: 50 }),
	tongueShape: varchar("tongue_shape", { length: 50 }),
	constitution: varchar({ length: 50 }),
	features: jsonb().default({}),
	healthHints: jsonb("health_hints").default([]),
	aiAnalysis: text("ai_analysis"),
	recommendations: jsonb().default([]),
	imageThumbnail: text("image_thumbnail"),
	fullReport: text("full_report"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_tongue_records_date").using("btree", table.diagnosisDate.asc().nullsLast().op("timestamp_ops")),
	index("idx_tongue_records_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [tongueDiagnosisUsers.id],
			name: "tongue_diagnosis_records_user_id_fkey"
		}),
]);

export const faceDiagnosisUsers = pgTable("face_diagnosis_users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	phone: varchar({ length: 20 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	age: integer(),
	gender: varchar({ length: 10 }),
}, (table) => [
	index("idx_face_users_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_face_users_phone").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	unique("face_diagnosis_users_name_phone_key").on(table.name, table.phone),
]);

export const tongueDiagnosisUsers = pgTable("tongue_diagnosis_users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	phone: varchar({ length: 20 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	age: integer(),
	gender: varchar({ length: 10 }),
}, (table) => [
	index("idx_tongue_users_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_tongue_users_phone").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	unique("tongue_diagnosis_users_name_phone_key").on(table.name, table.phone),
]);
