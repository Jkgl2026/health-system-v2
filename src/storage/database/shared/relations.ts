import { relations } from "drizzle-orm/relations";
import { users, userChoices, requirements, healthAnalysis, symptomChecks, checkInRecords, reminders } from "./schema";

// 注意：诊断相关表的关系定义已移除
// 这些表不由 Drizzle 管理，关系查询不可用

export const userChoicesRelations = relations(userChoices, ({one}) => ({
	user: one(users, {
		fields: [userChoices.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userChoices: many(userChoices),
	requirements: many(requirements),
	healthAnalyses: many(healthAnalysis),
	checkInRecords: many(checkInRecords),
	reminders: many(reminders),
}));

export const requirementsRelations = relations(requirements, ({one}) => ({
	user: one(users, {
		fields: [requirements.userId],
		references: [users.id]
	}),
}));

export const healthAnalysisRelations = relations(healthAnalysis, ({one}) => ({
	user: one(users, {
		fields: [healthAnalysis.userId],
		references: [users.id]
	}),
}));

export const symptomChecksRelations = relations(symptomChecks, ({many}) => ({
	healthAnalyses: many(healthAnalysis),
}));

export const checkInRecordsRelations = relations(checkInRecords, ({one}) => ({
	user: one(users, {
		fields: [checkInRecords.userId],
		references: [users.id]
	}),
}));

export const remindersRelations = relations(reminders, ({one}) => ({
	user: one(users, {
		fields: [reminders.userId],
		references: [users.id]
	}),
}));
