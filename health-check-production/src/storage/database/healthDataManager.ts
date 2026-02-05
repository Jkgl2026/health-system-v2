import { eq, and, desc, SQL, isNull } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { hashPassword, verifyPassword } from "@/lib/password";
import { defaultCompressionUtils, isCompressedData, decompressFromStorage } from "@/lib/compressionUtils";
import {
  users,
  symptomChecks,
  healthAnalysis,
  userChoices,
  requirements,
  admins,
  auditLogs,
  insertUserSchema,
  insertSymptomCheckSchema,
  insertHealthAnalysisSchema,
  insertUserChoiceSchema,
  insertRequirementSchema,
  insertAdminSchema,
  insertAuditLogSchema,
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
  AuditLog,
  InsertAuditLog,
} from "./shared/schema";

// 审计日志记录器接口
interface AuditLoggerOptions {
  tableName: string;
  recordId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  oldData?: any;
  newData?: any;
  operatorId?: string;
  operatorName?: string;
  operatorType?: 'ADMIN' | 'SYSTEM' | 'USER';
  ip?: string;
  userAgent?: string;
  description?: string;
}

export class HealthDataManager {
  // ==================== 审计日志 ====================

  /**
   * 记录审计日志
   */
  private async logAudit(options: AuditLoggerOptions): Promise<void> {
    try {
      const db = await getDb();
      const logData: InsertAuditLog = {
        action: options.action,
        tableName: options.tableName,
        recordId: options.recordId,
        operatorId: options.operatorId || 'SYSTEM',
        operatorName: options.operatorName || 'System',
        operatorType: options.operatorType || 'SYSTEM',
        oldData: options.oldData,
        newData: options.newData,
        ip: options.ip,
        userAgent: options.userAgent,
        description: options.description,
      };

      await db.insert(auditLogs).values(logData);
      console.log('[HealthDataManager] 审计日志已记录:', {
        action: options.action,
        table: options.tableName,
        recordId: options.recordId,
      });
    } catch (error) {
      console.error('[HealthDataManager] 记录审计日志失败:', error);
      // 审计日志失败不应该影响主业务流程
    }
  }

  /**
   * 获取审计日志列表
   */
  async getAuditLogs(options: {
    skip?: number;
    limit?: number;
    tableName?: string;
    recordId?: string;
    operatorId?: string;
    action?: string;
  } = {}): Promise<AuditLog[]> {
    const { skip = 0, limit = 100, tableName, recordId, operatorId, action } = options;
    const db = await getDb();

    const conditions = [];
    if (tableName) conditions.push(eq(auditLogs.tableName, tableName));
    if (recordId) conditions.push(eq(auditLogs.recordId, recordId));
    if (operatorId) conditions.push(eq(auditLogs.operatorId, operatorId));
    if (action) conditions.push(eq(auditLogs.action, action));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(skip);
  }

  /**
   * 获取特定记录的所有审计日志
   */
  async getRecordAuditLogs(tableName: string, recordId: string): Promise<AuditLog[]> {
    return this.getAuditLogs({ tableName, recordId, limit: 100 });
  }

  /**
   * 获取操作者的审计日志
   */
  async getOperatorAuditLogs(operatorId: string, limit = 100): Promise<AuditLog[]> {
    return this.getAuditLogs({ operatorId, limit });
  }

  // ==================== 数据压缩辅助方法 ====================

  /**
   * 压缩JSONB数据
   */
  private compressJSONB(data: any): any {
    // 对于数组，压缩每个元素
    if (Array.isArray(data) && data.length > 10) {
      // 数组元素超过10个才压缩
      const result = defaultCompressionUtils.smartCompress(data);
      return {
        _compressed: result.compressed,
        _algorithm: result.algorithm,
        _originalSize: result.originalSize,
        _compressedSize: result.compressedSize,
        data: result.data,
      };
    }

    // 对于对象，检查是否需要压缩
    if (typeof data === 'object' && data !== null) {
      const jsonString = JSON.stringify(data);
      const size = Buffer.byteLength(jsonString, 'utf8');

      // 超过2KB才压缩
      if (size > 2048) {
        const result = defaultCompressionUtils.smartCompress(data);
        return {
          _compressed: result.compressed,
          _algorithm: result.algorithm,
          _originalSize: result.originalSize,
          _compressedSize: result.compressedSize,
          data: result.data,
        };
      }
    }

    // 不需要压缩，直接返回
    return data;
  }

  /**
   * 解压缩JSONB数据
   */
  private decompressJSONB(data: any): any {
    // 检查是否是压缩数据
    if (isCompressedData(data)) {
      return decompressFromStorage(data);
    }

    // 对于数组，检查每个元素是否是压缩数据
    if (Array.isArray(data)) {
      return data.map(item => this.decompressJSONB(item));
    }

    // 对于对象，递归处理
    if (typeof data === 'object' && data !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = this.decompressJSONB(value);
      }
      return result;
    }

    // 原始数据，直接返回
    return data;
  }
  // ==================== 用户管理 ====================

  /**
   * 创建用户（支持手机号分组，每次都创建新记录）
   */
  async createUser(data: InsertUser, auditOptions?: Omit<AuditLoggerOptions, 'tableName' | 'action' | 'recordId' | 'newData'>): Promise<User> {
    const db = await getDb();
    try {
      const validated = insertUserSchema.parse(data);
      console.log('[HealthDataManager] 创建用户 - 验证通过:', validated);

      // 如果提供了手机号，需要处理手机号分组
      if (data.phone) {
        console.log('[HealthDataManager] 检查手机号是否已存在:', data.phone);
        
        // 查找该手机号的所有记录（包括已删除的）
        const existingUsers = await db.select().from(users).where(eq(users.phone, data.phone!));
        
        if (existingUsers.length > 0) {
          console.log('[HealthDataManager] 找到已有记录，使用相同的phoneGroupId');
          
          // 使用已有记录的phoneGroupId
          const phoneGroupId = existingUsers[0].phoneGroupId || existingUsers[0].id;
          
          // 将所有旧记录的isLatestVersion设置为false
          await db.update(users)
            .set({ isLatestVersion: false, updatedAt: new Date() })
            .where(eq(users.phone, data.phone!));
          
          console.log('[HealthDataManager] 已将旧记录标记为非最新版本');
          
          // 使用相同的phoneGroupId创建新记录
          const [user] = await db.insert(users).values({
            ...validated,
            phoneGroupId,
            isLatestVersion: true,
          }).returning();
          
          console.log('[HealthDataManager] 创建用户成功（使用已有phoneGroupId）:', user.id);

          // 记录审计日志
          await this.logAudit({
            ...auditOptions,
            tableName: 'users',
            action: 'CREATE',
            recordId: user.id,
            newData: user,
            description: `创建用户（历史版本）: ${user.name || '未知'}，手机号: ${user.phone}`,
          });

          return user;
        }
      }

      // 如果手机号不存在，创建新记录（生成新的phoneGroupId）
      const { phoneGroupId, ...userData } = validated;
      const [user] = await db.insert(users).values({
        ...userData,
        phoneGroupId: phoneGroupId || crypto.randomUUID(),
        isLatestVersion: true,
      }).returning();
      
      console.log('[HealthDataManager] 创建用户成功（新phoneGroupId）:', user.id);

      // 记录审计日志
      await this.logAudit({
        ...auditOptions,
        tableName: 'users',
        action: 'CREATE',
        recordId: user.id,
        newData: user,
        description: `创建用户: ${user.name || '未知'}`,
      });

      return user;
    } catch (error) {
      console.error('[HealthDataManager] 创建用户失败:', error);
      throw error;
    }
  }

  /**
   * 获取同一手机号的所有记录（用于对比）
   */
  async getUsersByPhone(phone: string, options: { includeDeleted?: boolean } = {}): Promise<User[]> {
    const db = await getDb();
    const { includeDeleted = false } = options;

    let query = db.select().from(users).where(eq(users.phone, phone));

    if (includeDeleted) {
      // 包括已删除的记录
      query = db.select().from(users).where(eq(users.phone, phone));
    } else {
      // 排除已删除的记录
      query = db.select().from(users).where(
        and(
          eq(users.phone, phone),
          isNull(users.deletedAt)
        )
      );
    }

    return query.orderBy(desc(users.createdAt));
  }

  /**
   * 通过phoneGroupId获取所有记录
   */
  async getUsersByPhoneGroupId(phoneGroupId: string, options: { includeDeleted?: boolean } = {}): Promise<User[]> {
    const db = await getDb();
    const { includeDeleted = false } = options;

    let query;

    if (includeDeleted) {
      // 包括已删除的记录
      query = db.select().from(users).where(eq(users.phoneGroupId, phoneGroupId));
    } else {
      // 排除已删除的记录
      query = db.select().from(users).where(
        and(
          eq(users.phoneGroupId, phoneGroupId),
          isNull(users.deletedAt)
        )
      );
    }

    return query.orderBy(desc(users.createdAt));
  }

  /**
   * 通过姓名获取所有记录（用于对比）
   */
  async getUsersByName(name: string, options: { includeDeleted?: boolean } = {}): Promise<User[]> {
    const db = await getDb();
    const { includeDeleted = false } = options;

    let query;

    if (includeDeleted) {
      // 包括已删除的记录
      query = db.select().from(users).where(eq(users.name, name));
    } else {
      // 排除已删除的记录
      query = db.select().from(users).where(
        and(
          eq(users.name, name),
          isNull(users.deletedAt)
        )
      );
    }

    return query.orderBy(desc(users.createdAt));
  }

  async getUserById(id: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(
      and(
        eq(users.id, id),
        isNull(users.deletedAt) // 排除已删除的用户
      )
    );
    return user || null;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || null;
  }

  async updateUser(id: string, data: Partial<InsertUser>, auditOptions?: Omit<AuditLoggerOptions, 'tableName' | 'action' | 'recordId'>): Promise<User | null> {
    const db = await getDb();
    try {
      console.log('[HealthDataManager] 更新用户 - userId:', id, 'data:', data);

      // 获取旧数据用于审计日志
      const [oldUser] = await db.select().from(users).where(eq(users.id, id));

      const [user] = await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

      console.log('[HealthDataManager] 更新用户成功:', user ? user.id : 'not found');

      if (user && oldUser) {
        // 记录审计日志
        await this.logAudit({
          ...auditOptions,
          tableName: 'users',
          action: 'UPDATE',
          recordId: user.id,
          oldData: oldUser,
          newData: user,
          description: `更新用户: ${user.name || '未知'}`,
        });
      }

      return user || null;
    } catch (error) {
      console.error('[HealthDataManager] 更新用户失败:', error);
      throw error;
    }
  }

  // ==================== 用户管理 ====================
  /**
   * 软删除用户（标记为已删除，而非真正删除）
   */
  async softDeleteUser(id: string, auditOptions?: Omit<AuditLoggerOptions, 'tableName' | 'action' | 'recordId'>): Promise<boolean> {
    const db = await getDb();
    try {
      // 获取用户数据用于审计日志
      const [oldUser] = await db.select().from(users).where(eq(users.id, id));

      if (!oldUser) {
        return false;
      }

      // 软删除：设置deleted_at
      const result = await db
        .update(users)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, id));

      console.log('[HealthDataManager] 软删除用户成功:', id);

      // 记录审计日志
      await this.logAudit({
        ...auditOptions,
        tableName: 'users',
        action: 'DELETE',
        recordId: id,
        oldData: oldUser,
        description: `软删除用户: ${oldUser.name || '未知'}`,
      });

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('[HealthDataManager] 软删除用户失败:', error);
      throw error;
    }
  }

  /**
   * 恢复已删除的用户
   */
  async restoreUser(id: string, auditOptions?: Omit<AuditLoggerOptions, 'tableName' | 'action' | 'recordId'>): Promise<User | null> {
    const db = await getDb();
    try {
      // 获取用户数据（包括已删除的）
      const [user] = await db.select().from(users).where(eq(users.id, id));

      if (!user) {
        return null;
      }

      // 恢复：清除deleted_at
      const [restoredUser] = await db
        .update(users)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

      console.log('[HealthDataManager] 恢复用户成功:', id);

      // 记录审计日志
      await this.logAudit({
        ...auditOptions,
        tableName: 'users',
        action: 'RESTORE',
        recordId: id,
        oldData: user,
        newData: restoredUser,
        description: `恢复用户: ${user.name || '未知'}`,
      });

      return restoredUser;
    } catch (error) {
      console.error('[HealthDataManager] 恢复用户失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有用户（包括已删除的）
   */
  async getAllUsers(options: { skip?: number; limit?: number; includeDeleted?: boolean } = {}): Promise<User[]> {
    const { skip = 0, limit = 100, includeDeleted = false } = options;
    const db = await getDb();

    const query = db.select().from(users);

    if (!includeDeleted) {
      query.where(isNull(users.deletedAt));
    }

    return query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(skip);
  }

  // ==================== 症状自检管理 ====================

  async createSymptomCheck(data: InsertSymptomCheck): Promise<SymptomCheck> {
    const db = await getDb();
    const validated = insertSymptomCheckSchema.parse(data);
    const [check] = await db.insert(symptomChecks).values(validated).returning();
    return check;
  }

  async getSymptomChecksByUserId(userId: string, limit?: number): Promise<SymptomCheck[]> {
    const db = await getDb();
    const baseQuery = db
      .select()
      .from(symptomChecks)
      .where(eq(symptomChecks.userId, userId))
      .orderBy(desc(symptomChecks.checkedAt));
    
    if (limit !== undefined && limit > 0) {
      return baseQuery.limit(limit);
    }
    
    return baseQuery;
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

  async getHealthAnalysisByUserId(userId: string, limit?: number): Promise<HealthAnalysis[]> {
    const db = await getDb();
    const baseQuery = db
      .select()
      .from(healthAnalysis)
      .where(eq(healthAnalysis.userId, userId))
      .orderBy(desc(healthAnalysis.analyzedAt));
    
    if (limit !== undefined && limit > 0) {
      return baseQuery.limit(limit);
    }
    
    return baseQuery;
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
    // 加密密码
    const hashedPassword = await hashPassword(data.password);
    const validated = insertAdminSchema.parse({
      ...data,
      password: hashedPassword,
    });
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
    // 使用 bcrypt 验证密码
    const isMatch = await verifyPassword(password, admin.password);
    if (isMatch) {
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
    const DEFAULT_LIMIT = 10;
    
    const [user] = await Promise.all([
      this.getUserById(userId),
      this.getSymptomChecksByUserId(userId, DEFAULT_LIMIT),
      this.getHealthAnalysisByUserId(userId, DEFAULT_LIMIT),
      this.getUserChoicesByUserId(userId),
      this.getRequirementByUserId(userId),
    ]);

    const [symptomChecksResult, healthAnalysisResult, userChoicesResult, requirementsResult] =
      await Promise.all([
        this.getSymptomChecksByUserId(userId, DEFAULT_LIMIT),
        this.getHealthAnalysisByUserId(userId, DEFAULT_LIMIT),
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
  async getAllUsersSummary(options: { skip?: number; limit?: number; search?: string } = {}): Promise<{
    users: Array<{
      user: User;
      latestSymptomCheck: SymptomCheck | null;
      latestHealthAnalysis: HealthAnalysis | null;
      latestChoice: UserChoice | null;
      requirements: Requirement | null;
    }>;
    total: number;
  }> {
    const { skip = 0, limit = 100, search } = options;
    let allUsers = await this.getAllUsers({ skip: 0, limit: 10000 }); // 获取所有用户，因为需要过滤

    // 搜索过滤
    if (search) {
      const searchLower = search.toLowerCase();
      allUsers = allUsers.filter(
        (user) =>
          (user.name && user.name.toLowerCase().includes(searchLower)) ||
          (user.phone && user.phone.toLowerCase().includes(searchLower))
      );
    }

    // 保存总数（过滤后）
    const total = allUsers.length;

    // 应用分页
    const paginatedUsers = allUsers.slice(skip, skip + limit);

    const results = await Promise.all(
      paginatedUsers.map(async (user) => {
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

    return {
      users: results,
      total,
    };
  }
}

export const healthDataManager = new HealthDataManager();
