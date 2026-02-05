import { relations } from "drizzle-orm/relations";
import { users, symptomChecks, healthAnalysis, userChoices, requirements } from "./schema";

export const symptomChecksRelations = relations(symptomChecks, ({one}) => ({
	user: one(users, {
		fields: [symptomChecks.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	symptomChecks: many(symptomChecks),
	healthAnalyses: many(healthAnalysis),
	userChoices: many(userChoices),
	requirements: many(requirements),
}));

export const healthAnalysisRelations = relations(healthAnalysis, ({one}) => ({
	user: one(users, {
		fields: [healthAnalysis.userId],
		references: [users.id]
	}),
}));

export const userChoicesRelations = relations(userChoices, ({one}) => ({
	user: one(users, {
		fields: [userChoices.userId],
		references: [users.id]
	}),
}));

export const requirementsRelations = relations(requirements, ({one}) => ({
	user: one(users, {
		fields: [requirements.userId],
		references: [users.id]
	}),
}));