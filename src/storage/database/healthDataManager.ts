import { eq, and, desc, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  users,
  symptomChecks,
  healthAnalysis,
  userChoices,
  requirements,
  admins,
  insertUserSchema,
  insertSymptomCheckSchema,
  insertHealthAnalysisSchema,
  insertUserChoiceSchema,
  insertRequirementSchema,
  insertAdminSchema,
} from "./shared/schema";
import type {
  User,
  InsertUser,
  SymptomCheck,
  InsertSymptomCheck,
  HealthAnalysis,
  InsertHealthAnalysis,
  UserChoice,
  InsertUserChoice,
  Requirement,
  InsertRequirement,
  Admin,
  InsertAdmin,
} from "./shared/schema";

export class HealthDataManager {
  // ==================== 用户管理 ====================

  async createUser(data: InsertUser): Promise<User> {
    const db = await getDb();
    try {
      const validated = insertUserSchema.parse(data);
      console.log('[HealthDataManager] 创建用户 - 验证通过:', validated);
      const [user] = await db.insert(users).values(validated).returning();
      console.log('[HealthDataManager] 创建用户成功:', user.id);
      return user;
    } catch (error) {
      console.error('[HealthDataManager] 创建用户失败:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || null;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | null> {
    const db = await getDb();
    try {
      console.log('[HealthDataManager] 更新用户 - userId:', id, 'data:', data);
      const [user] = await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      console.log('[HealthDataManager] 更新用户成功:', user ? user.id : 'not found');
      return user || null;
    } catch (error) {
      console.error('[HealthDataManager] 更新用户失败:', error);
      throw error;
    }
  }

  async getAllUsers(options: { skip?: number; limit?: number } = {}): Promise<User[]> {
    const { skip = 0, limit = 100 } = options;
    const db = await getDb();
    return db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(skip);
  }

  async deleteUser(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ==================== 症状自检管理 ====================

  async createSymptomCheck(data: InsertSymptomCheck): Promise<SymptomCheck> {
    const db = await getDb();
    const validated = insertSymptomCheckSchema.parse(data);
    const [check] = await db.insert(symptomChecks).values(validated).returning();
    return check;
  }

  async getSymptomChecksByUserId(userId: string): Promise<SymptomCheck[]> {
    const db = await getDb();
    return db
      .select()
      .from(symptomChecks)
      .where(eq(symptomChecks.userId, userId))
      .orderBy(desc(symptomChecks.checkedAt));
  }

  async getLatestSymptomCheck(userId: string): Promise<SymptomCheck | null> {
    const db = await getDb();
    const [check] = await db
      .select()
      .from(symptomChecks)
      .where(eq(symptomChecks.userId, userId))
      .orderBy(desc(symptomChecks.checkedAt))
      .limit(1);
    return check || null;
  }

  async updateSymptomCheck(
    id: string,
    data: Partial<InsertSymptomCheck>
  ): Promise<SymptomCheck | null> {
    const db = await getDb();
    const [check] = await db
      .update(symptomChecks)
      .set(data)
      .where(eq(symptomChecks.id, id))
      .returning();
    return check || null;
  }

  async deleteSymptomCheck(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(symptomChecks).where(eq(symptomChecks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ==================== 健康要素分析管理 ====================

  async createHealthAnalysis(data: InsertHealthAnalysis): Promise<HealthAnalysis> {
    const db = await getDb();
    const validated = insertHealthAnalysisSchema.parse(data);
    const [analysis] = await db.insert(healthAnalysis).values(validated).returning();
    return analysis;
  }

  async getHealthAnalysisByUserId(userId: string): Promise<HealthAnalysis[]> {
    const db = await getDb();
    return db
      .select()
      .from(healthAnalysis)
      .where(eq(healthAnalysis.userId, userId))
      .orderBy(desc(healthAnalysis.analyzedAt));
  }

  async getLatestHealthAnalysis(userId: string): Promise<HealthAnalysis | null> {
    const db = await getDb();
    const [analysis] = await db
      .select()
      .from(healthAnalysis)
      .where(eq(healthAnalysis.userId, userId))
      .orderBy(desc(healthAnalysis.analyzedAt))
      .limit(1);
    return analysis || null;
  }

  async updateHealthAnalysis(
    id: string,
    data: Partial<InsertHealthAnalysis>
  ): Promise<HealthAnalysis | null> {
    const db = await getDb();
    const [analysis] = await db
      .update(healthAnalysis)
      .set(data)
      .where(eq(healthAnalysis.id, id))
      .returning();
    return analysis || null;
  }

  // ==================== 用户选择管理 ====================

  async createUserChoice(data: InsertUserChoice): Promise<UserChoice> {
    const db = await getDb();
    const validated = insertUserChoiceSchema.parse(data);
    const [choice] = await db.insert(userChoices).values(validated).returning();
    return choice;
  }

  async getUserChoicesByUserId(userId: string): Promise<UserChoice[]> {
    const db = await getDb();
    return db
      .select()
      .from(userChoices)
      .where(eq(userChoices.userId, userId))
      .orderBy(desc(userChoices.selectedAt));
  }

  async getLatestUserChoice(userId: string): Promise<UserChoice | null> {
    const db = await getDb();
    const [choice] = await db
      .select()
      .from(userChoices)
      .where(eq(userChoices.userId, userId))
      .orderBy(desc(userChoices.selectedAt))
      .limit(1);
    return choice || null;
  }

  // ==================== 四个要求管理 ====================

  async createRequirement(data: InsertRequirement): Promise<Requirement> {
    const db = await getDb();
    const validated = insertRequirementSchema.parse(data);
    const [req] = await db.insert(requirements).values(validated).returning();
    return req;
  }

  async getRequirementByUserId(userId: string): Promise<Requirement | null> {
    const db = await getDb();
    const [req] = await db.select().from(requirements).where(eq(requirements.userId, userId));
    return req || null;
  }

  async updateRequirement(
    userId: string,
    data: Partial<InsertRequirement>
  ): Promise<Requirement | null> {
    const db = await getDb();
    const [req] = await db
      .update(requirements)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(requirements.userId, userId))
      .returning();
    return req || null;
  }

  async markRequirementCompleted(
    userId: string,
    requirementNumber: 1 | 2 | 3 | 4
  ): Promise<Requirement | null> {
    const db = await getDb();
    const updates: Partial<InsertRequirement> = {};

    switch (requirementNumber) {
      case 1:
        updates.requirement1Completed = true;
        break;
      case 2:
        updates.requirement2Completed = true;
        break;
      case 3:
        updates.requirement3Completed = true;
        break;
      case 4:
        updates.requirement4Completed = true;
        break;
    }

    // 检查是否所有要求都已完成
    const existing = await this.getRequirementByUserId(userId);
    if (existing) {
      const allCompleted =
        (updates.requirement1Completed ?? existing.requirement1Completed) &&
        (updates.requirement2Completed ?? existing.requirement2Completed) &&
        (updates.requirement3Completed ?? existing.requirement3Completed) &&
        (updates.requirement4Completed ?? existing.requirement4Completed);

      if (allCompleted && !existing.completedAt) {
        updates.completedAt = new Date();
      }
    }

    return this.updateRequirement(userId, updates);
  }

  // ==================== 管理员管理 ====================

  async createAdmin(data: InsertAdmin): Promise<Admin> {
    const db = await getDb();
    const validated = insertAdminSchema.parse(data);
    const [admin] = await db.insert(admins).values(validated).returning();
    return admin;
  }

  async getAdminByUsername(username: string): Promise<Admin | null> {
    const db = await getDb();
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || null;
  }

  async verifyAdmin(username: string, password: string): Promise<Admin | null> {
    const admin = await this.getAdminByUsername(username);
    if (!admin || !admin.isActive) {
      return null;
    }
    // 注意：这里应该使用密码加密库（如 bcrypt）来验证密码
    // 为了简化，这里直接比较，实际生产环境必须使用加密
    if (admin.password === password) {
      return admin;
    }
    return null;
  }

  async getAllAdmins(): Promise<Admin[]> {
    const db = await getDb();
    return db.select().from(admins).orderBy(desc(admins.createdAt));
  }

  // ==================== 综合查询 ====================

  /**
   * 获取用户的完整信息（包含自检、分析、选择、要求）
   */
  async getUserFullData(userId: string): Promise<{
    user: User | null;
    symptomChecks: SymptomCheck[];
    healthAnalysis: HealthAnalysis[];
    userChoices: UserChoice[];
    requirements: Requirement | null;
  }> {
    const [user] = await Promise.all([
      this.getUserById(userId),
      this.getSymptomChecksByUserId(userId),
      this.getHealthAnalysisByUserId(userId),
      this.getUserChoicesByUserId(userId),
      this.getRequirementByUserId(userId),
    ]);

    const [symptomChecksResult, healthAnalysisResult, userChoicesResult, requirementsResult] =
      await Promise.all([
        this.getSymptomChecksByUserId(userId),
        this.getHealthAnalysisByUserId(userId),
        this.getUserChoicesByUserId(userId),
        this.getRequirementByUserId(userId),
      ]);

    return {
      user,
      symptomChecks: symptomChecksResult,
      healthAnalysis: healthAnalysisResult,
      userChoices: userChoicesResult,
      requirements: requirementsResult,
    };
  }

  /**
   * 获取所有用户的概要信息（用于管理后台列表）
   */
  async getAllUsersSummary(options: { skip?: number; limit?: number } = {}): Promise<
    Array<{
      user: User;
      latestSymptomCheck: SymptomCheck | null;
      latestHealthAnalysis: HealthAnalysis | null;
      latestChoice: UserChoice | null;
      requirements: Requirement | null;
    }>
  > {
    const { skip = 0, limit = 100 } = options;
    const allUsers = await this.getAllUsers({ skip, limit });

    const results = await Promise.all(
      allUsers.map(async (user) => {
        const [latestSymptomCheck, latestHealthAnalysis, latestChoice, requirements] =
          await Promise.all([
            this.getLatestSymptomCheck(user.id),
            this.getLatestHealthAnalysis(user.id),
            this.getLatestUserChoice(user.id),
            this.getRequirementByUserId(user.id),
          ]);

        return {
          user,
          latestSymptomCheck,
          latestHealthAnalysis,
          latestChoice,
          requirements,
        };
      })
    );

    return results;
  }
}

export const healthDataManager = new HealthDataManager();
