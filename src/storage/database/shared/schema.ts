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
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    phoneIdx: index("users_phone_idx").on(table.phone),
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
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("requirements_user_id_idx").on(table.userId),
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
  completedAt: true,
});

export const insertAdminSchema = createCoercedInsertSchema(admins).pick({
  username: true,
  password: true,
  name: true,
  isActive: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SymptomCheck = typeof symptomChecks.$inferSelect;
export type InsertSymptomCheck = z.infer<typeof insertSymptomCheckSchema>;

export type HealthAnalysis = typeof healthAnalysis.$inferSelect;
export type InsertHealthAnalysis = z.infer<typeof insertHealthAnalysisSchema>;

export type UserChoice = typeof userChoices.$inferSelect;
export type InsertUserChoice = z.infer<typeof insertUserChoiceSchema>;

export type Requirement = typeof requirements.$inferSelect;
export type InsertRequirement = z.infer<typeof insertRequirementSchema>;

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;




