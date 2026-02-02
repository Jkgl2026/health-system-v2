import { pgTable, index, foreignKey, varchar, jsonb, integer, timestamp, text, unique, boolean, uniqueIndex } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const symptomChecks = pgTable("symptom_checks", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	checkedSymptoms: jsonb("checked_symptoms").notNull(),
	totalScore: integer("total_score"),
	elementScores: jsonb("element_scores"),
	checkedAt: timestamp("checked_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_symptom_checks_checked_at").using("btree", table.checkedAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_symptom_checks_user_checked").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.checkedAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_symptom_checks_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("symptom_checks_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "symptom_checks_user_id_fkey"
		}).onDelete("cascade"),
]);

export const healthAnalysis = pgTable("health_analysis", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
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
	index("health_analysis_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("idx_health_analysis_analyzed_at").using("btree", table.analyzedAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_health_analysis_user_analyzed").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.analyzedAt.asc().nullsLast().op("text_ops")),
	index("idx_health_analysis_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "health_analysis_user_id_fkey"
		}).onDelete("cascade"),
]);

export const userChoices = pgTable("user_choices", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
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
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
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
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
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

export const users = pgTable("users", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
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
}, (table) => [
	index("idx_users_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_users_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_users_phone").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	index("users_phone_group_idx").using("btree", table.phoneGroupId.asc().nullsLast().op("text_ops")),
	index("users_phone_idx").using("btree", table.phone.asc().nullsLast().op("text_ops")),
]);

export const auditLogs = pgTable("audit_logs", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
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
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
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
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
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
