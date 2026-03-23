import { relations } from "drizzle-orm/relations";
import { users, userChoices, requirements, postureDiagnosisRecords, postureComparisons, healthAnalysis, symptomChecks, healthProfiles, checkInRecords, reminders, faceDiagnosisUsers, faceDiagnosisRecords, tongueDiagnosisUsers, tongueDiagnosisRecords } from "./schema";

export const userChoicesRelations = relations(userChoices, ({one}) => ({
	user: one(users, {
		fields: [userChoices.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userChoices: many(userChoices),
	requirements: many(requirements),
	postureDiagnosisRecords: many(postureDiagnosisRecords),
	postureComparisons: many(postureComparisons),
	healthAnalyses: many(healthAnalysis),
	healthProfiles: many(healthProfiles),
	checkInRecords: many(checkInRecords),
	reminders: many(reminders),
}));

export const requirementsRelations = relations(requirements, ({one}) => ({
	user: one(users, {
		fields: [requirements.userId],
		references: [users.id]
	}),
}));

export const postureDiagnosisRecordsRelations = relations(postureDiagnosisRecords, ({one, many}) => ({
	user: one(users, {
		fields: [postureDiagnosisRecords.userId],
		references: [users.id]
	}),
	postureComparisons_currentRecordId: many(postureComparisons, {
		relationName: "postureComparisons_currentRecordId_postureDiagnosisRecords_id"
	}),
	postureComparisons_previousRecordId: many(postureComparisons, {
		relationName: "postureComparisons_previousRecordId_postureDiagnosisRecords_id"
	}),
}));

export const postureComparisonsRelations = relations(postureComparisons, ({one}) => ({
	user: one(users, {
		fields: [postureComparisons.userId],
		references: [users.id]
	}),
	postureDiagnosisRecord_currentRecordId: one(postureDiagnosisRecords, {
		fields: [postureComparisons.currentRecordId],
		references: [postureDiagnosisRecords.id],
		relationName: "postureComparisons_currentRecordId_postureDiagnosisRecords_id"
	}),
	postureDiagnosisRecord_previousRecordId: one(postureDiagnosisRecords, {
		fields: [postureComparisons.previousRecordId],
		references: [postureDiagnosisRecords.id],
		relationName: "postureComparisons_previousRecordId_postureDiagnosisRecords_id"
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

export const healthProfilesRelations = relations(healthProfiles, ({one}) => ({
	user: one(users, {
		fields: [healthProfiles.userId],
		references: [users.id]
	}),
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

export const faceDiagnosisRecordsRelations = relations(faceDiagnosisRecords, ({one}) => ({
	faceDiagnosisUser: one(faceDiagnosisUsers, {
		fields: [faceDiagnosisRecords.userId],
		references: [faceDiagnosisUsers.id]
	}),
}));

export const faceDiagnosisUsersRelations = relations(faceDiagnosisUsers, ({many}) => ({
	faceDiagnosisRecords: many(faceDiagnosisRecords),
}));

export const tongueDiagnosisRecordsRelations = relations(tongueDiagnosisRecords, ({one}) => ({
	tongueDiagnosisUser: one(tongueDiagnosisUsers, {
		fields: [tongueDiagnosisRecords.userId],
		references: [tongueDiagnosisUsers.id]
	}),
}));

export const tongueDiagnosisUsersRelations = relations(tongueDiagnosisUsers, ({many}) => ({
	tongueDiagnosisRecords: many(tongueDiagnosisRecords),
}));
