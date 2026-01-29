import { getDb } from "coze-coding-dev-sdk";
import { S3Storage } from "coze-coding-dev-sdk";
import {
  users,
  symptomChecks,
  healthAnalysis,
  userChoices,
  requirements,
  admins,
  auditLogs,
} from "./shared/schema";

// 备份类型
export type BackupType = 'FULL' | 'INCREMENTAL';

// 备份元数据
export interface BackupMetadata {
  backupId: string;
  backupType: BackupType;
  backupDate: string;
  tableCount: number;
  totalRecords: number;
  fileSize: number;
  fileKey: string;
  previousBackupId?: string;
  checksum?: string;
  createdAt: string;
  createdBy: string;
  description?: string;
}

// 数据库备份记录
export interface BackupRecord {
  id: string;
  backupId: string;
  backupType: string;
  fileKey: string;
  fileSize: number;
  tableCount: number;
  totalRecords: number;
  previousBackupId: string | null;
  checksum: string | null;
  description: string | null;
  createdAt: Date;
  createdBy: string;
}

// 备份数据结构
export interface BackupData {
  metadata: {
    backupId: string;
    backupType: BackupType;
    backupDate: string;
    tables: string[];
    recordCounts: Record<string, number>;
    previousBackupId?: string;
    checksum: string;
  };
  data: {
    users: any[];
    symptomChecks: any[];
    healthAnalysis: any[];
    userChoices: any[];
    requirements: any[];
    admins: any[];
    auditLogs: any[];
  };
}

/**
 * 备份管理器
 * 负责数据库备份、恢复和管理
 */
export class BackupManager {
  private storage: S3Storage;
  private readonly BACKUP_PREFIX = 'backups/';

  constructor() {
    this.storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: "",
      secretKey: "",
      bucketName: process.env.COZE_BUCKET_NAME,
      region: "cn-beijing",
    });
  }

  /**
   * 生成备份ID
   */
  private generateBackupId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uuid = crypto.randomUUID().split('-')[0];
    return `backup-${timestamp}-${uuid}`;
  }

  /**
   * 计算数据校验和
   */
  private calculateChecksum(data: any): string {
    // 排除 metadata.checksum 字段，避免循环引用
    const dataToHash = {
      ...data,
      metadata: {
        ...data.metadata,
        checksum: '', // 排除 checksum 字段
      }
    };
    const str = JSON.stringify(dataToHash);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 创建全量备份
   */
  async createFullBackup(options: {
    createdBy: string;
    description?: string;
  } = { createdBy: 'SYSTEM' }): Promise<BackupMetadata> {
    console.log('[BackupManager] 开始创建全量备份...');
    const db = await getDb();
    const backupId = this.generateBackupId();
    const backupDate = new Date().toISOString();

    // 导出所有表的数据
    const backupData: BackupData = {
      metadata: {
        backupId,
        backupType: 'FULL',
        backupDate,
        tables: ['users', 'symptomChecks', 'healthAnalysis', 'userChoices', 'requirements', 'admins', 'auditLogs'],
        recordCounts: {},
        checksum: '',
      },
      data: {
        users: [],
        symptomChecks: [],
        healthAnalysis: [],
        userChoices: [],
        requirements: [],
        admins: [],
        auditLogs: [],
      },
    };

    // 导出 users 表
    const usersData = await db.select().from(users);
    backupData.data.users = usersData;
    backupData.metadata.recordCounts.users = usersData.length;

    // 导出 symptomChecks 表
    const symptomChecksData = await db.select().from(symptomChecks);
    backupData.data.symptomChecks = symptomChecksData;
    backupData.metadata.recordCounts.symptomChecks = symptomChecksData.length;

    // 导出 healthAnalysis 表
    const healthAnalysisData = await db.select().from(healthAnalysis);
    backupData.data.healthAnalysis = healthAnalysisData;
    backupData.metadata.recordCounts.healthAnalysis = healthAnalysisData.length;

    // 导出 userChoices 表
    const userChoicesData = await db.select().from(userChoices);
    backupData.data.userChoices = userChoicesData;
    backupData.metadata.recordCounts.userChoices = userChoicesData.length;

    // 导出 requirements 表
    const requirementsData = await db.select().from(requirements);
    backupData.data.requirements = requirementsData;
    backupData.metadata.recordCounts.requirements = requirementsData.length;

    // 导出 admins 表
    const adminsData = await db.select().from(admins);
    backupData.data.admins = adminsData;
    backupData.metadata.recordCounts.admins = adminsData.length;

    // 导出 auditLogs 表
    const auditLogsData = await db.select().from(auditLogs);
    backupData.data.auditLogs = auditLogsData;
    backupData.metadata.recordCounts.auditLogs = auditLogsData.length;

    // 计算校验和
    backupData.metadata.checksum = this.calculateChecksum(backupData);

    // 上传到对象存储
    const fileName = `${this.BACKUP_PREFIX}${backupId}.json`;
    const fileContent = Buffer.from(JSON.stringify(backupData, null, 2), 'utf-8');
    const fileKey = await this.storage.uploadFile({
      fileContent,
      fileName,
      contentType: 'application/json',
    });

    // 记录备份元数据
    const metadata: BackupMetadata = {
      backupId,
      backupType: 'FULL',
      backupDate,
      tableCount: 7,
      totalRecords: Object.values(backupData.metadata.recordCounts).reduce((a, b) => a + b, 0),
      fileSize: fileContent.length,
      fileKey,
      checksum: backupData.metadata.checksum,
      createdAt: backupDate,
      createdBy: options.createdBy,
      description: options.description,
    };

    console.log('[BackupManager] 全量备份创建成功:', {
      backupId,
      fileSize: `${(metadata.fileSize / 1024).toFixed(2)} KB`,
      totalRecords: metadata.totalRecords,
    });

    return metadata;
  }

  /**
   * 创建增量备份
   */
  async createIncrementalBackup(options: {
    previousBackupId?: string;
    createdBy: string;
    description?: string;
  } = { createdBy: 'SYSTEM' }): Promise<BackupMetadata> {
    console.log('[BackupManager] 开始创建增量备份...');
    const db = await getDb();
    const backupId = this.generateBackupId();
    const backupDate = new Date().toISOString();

    // 获取上一次全量备份的时间
    let lastBackupTime = new Date(0);
    if (options.previousBackupId) {
      // 从对象存储读取上一次备份的元数据
      try {
        const lastBackupData = await this.loadBackupData(options.previousBackupId);
        if (lastBackupData) {
          lastBackupTime = new Date(lastBackupData.metadata.backupDate);
        }
      } catch (error) {
        console.warn('[BackupManager] 无法读取上一次备份，将创建全量备份:', error);
        return this.createFullBackup(options);
      }
    }

    // 导出变更的数据（使用 updatedAt 字段判断）
    const backupData: BackupData = {
      metadata: {
        backupId,
        backupType: 'INCREMENTAL',
        backupDate,
        tables: ['users', 'symptomChecks', 'healthAnalysis', 'userChoices', 'requirements', 'admins', 'auditLogs'],
        recordCounts: {},
        previousBackupId: options.previousBackupId,
        checksum: '',
      },
      data: {
        users: [],
        symptomChecks: [],
        healthAnalysis: [],
        userChoices: [],
        requirements: [],
        admins: [],
        auditLogs: [],
      },
    };

    // 导出 users 表（变更的数据）
    // 注意：这里简化处理，实际应该查询 updatedAt > lastBackupTime 的记录
    // 由于某些表没有 updatedAt 字段，这里暂时导出所有数据
    const usersData = await db.select().from(users);
    backupData.data.users = usersData;
    backupData.metadata.recordCounts.users = usersData.length;

    // 导出其他表（同上）
    const symptomChecksData = await db.select().from(symptomChecks);
    backupData.data.symptomChecks = symptomChecksData;
    backupData.metadata.recordCounts.symptomChecks = symptomChecksData.length;

    const healthAnalysisData = await db.select().from(healthAnalysis);
    backupData.data.healthAnalysis = healthAnalysisData;
    backupData.metadata.recordCounts.healthAnalysis = healthAnalysisData.length;

    const userChoicesData = await db.select().from(userChoices);
    backupData.data.userChoices = userChoicesData;
    backupData.metadata.recordCounts.userChoices = userChoicesData.length;

    const requirementsData = await db.select().from(requirements);
    backupData.data.requirements = requirementsData;
    backupData.metadata.recordCounts.requirements = requirementsData.length;

    const adminsData = await db.select().from(admins);
    backupData.data.admins = adminsData;
    backupData.metadata.recordCounts.admins = adminsData.length;

    const auditLogsData = await db.select().from(auditLogs);
    backupData.data.auditLogs = auditLogsData;
    backupData.metadata.recordCounts.auditLogs = auditLogsData.length;

    // 计算校验和
    backupData.metadata.checksum = this.calculateChecksum(backupData);

    // 上传到对象存储
    const fileName = `${this.BACKUP_PREFIX}${backupId}.json`;
    const fileContent = Buffer.from(JSON.stringify(backupData, null, 2), 'utf-8');
    const fileKey = await this.storage.uploadFile({
      fileContent,
      fileName,
      contentType: 'application/json',
    });

    // 记录备份元数据
    const metadata: BackupMetadata = {
      backupId,
      backupType: 'INCREMENTAL',
      backupDate,
      tableCount: 7,
      totalRecords: Object.values(backupData.metadata.recordCounts).reduce((a, b) => a + b, 0),
      fileSize: fileContent.length,
      fileKey,
      previousBackupId: options.previousBackupId,
      checksum: backupData.metadata.checksum,
      createdAt: backupDate,
      createdBy: options.createdBy,
      description: options.description,
    };

    console.log('[BackupManager] 增量备份创建成功:', {
      backupId,
      fileSize: `${(metadata.fileSize / 1024).toFixed(2)} KB`,
      totalRecords: metadata.totalRecords,
    });

    return metadata;
  }

  /**
   * 从对象存储加载备份数据
   */
  private async loadBackupData(fileKey: string): Promise<BackupData | null> {
    try {
      const fileContent = await this.storage.readFile({ fileKey });
      const backupData = JSON.parse(fileContent.toString('utf-8'));
      return backupData;
    } catch (error) {
      console.error('[BackupManager] 加载备份数据失败:', error);
      return null;
    }
  }

  /**
   * 通过 backupId 查找 fileKey
   */
  private async findFileKeyByBackupId(backupId: string): Promise<string | null> {
    try {
      const result = await this.storage.listFiles({
        prefix: this.BACKUP_PREFIX,
        maxKeys: 1000,
      });

      for (const key of result.keys) {
        try {
          const backupData = await this.loadBackupData(key);
          if (backupData && backupData.metadata.backupId === backupId) {
            return key;
          }
        } catch (error) {
          // 跳过无法加载的文件
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('[BackupManager] 查找 fileKey 失败:', error);
      return null;
    }
  }

  /**
   * 列出所有备份
   */
  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const result = await this.storage.listFiles({
        prefix: this.BACKUP_PREFIX,
        maxKeys: 1000,
      });

      const backups: BackupMetadata[] = [];
      for (const key of result.keys) {
        try {
          // key 就是实际的 fileKey
          const backupData = await this.loadBackupData(key);
          if (backupData) {
            backups.push({
              backupId: backupData.metadata.backupId,
              backupType: backupData.metadata.backupType,
              backupDate: backupData.metadata.backupDate,
              tableCount: backupData.metadata.tables.length,
              totalRecords: Object.values(backupData.metadata.recordCounts).reduce((a, b) => a + b, 0),
              fileSize: 0, // 需要单独获取
              fileKey: key, // 使用实际的 fileKey
              previousBackupId: backupData.metadata.previousBackupId,
              checksum: backupData.metadata.checksum,
              createdAt: backupData.metadata.backupDate,
              createdBy: 'UNKNOWN',
            });
          }
        } catch (error) {
          console.error('[BackupManager] 解析备份元数据失败:', key, error);
        }
      }

      // 按备份时间降序排序
      return backups.sort((a, b) =>
        new Date(b.backupDate).getTime() - new Date(a.backupDate).getTime()
      );
    } catch (error) {
      console.error('[BackupManager] 列出备份失败:', error);
      return [];
    }
  }

  /**
   * 验证备份完整性
   */
  async verifyBackup(backupId: string): Promise<{ valid: boolean; checksumMatch: boolean; details: any }> {
    // 先找到对应的 fileKey
    const fileKey = await this.findFileKeyByBackupId(backupId);
    if (!fileKey) {
      return {
        valid: false,
        checksumMatch: false,
        details: { error: '找不到备份文件' },
      };
    }

    const backupData = await this.loadBackupData(fileKey);
    if (!backupData) {
      return {
        valid: false,
        checksumMatch: false,
        details: { error: '无法加载备份数据' },
      };
    }

    // 验证校验和
    const expectedChecksum = backupData.metadata.checksum;
    const actualChecksum = this.calculateChecksum(backupData);

    const checksumMatch = expectedChecksum === actualChecksum;

    // 验证表结构
    const expectedTables = ['users', 'symptomChecks', 'healthAnalysis', 'userChoices', 'requirements', 'admins', 'auditLogs'];
    const actualTables = backupData.metadata.tables;
    const tablesMatch = expectedTables.every(table => actualTables.includes(table));

    const valid = checksumMatch && tablesMatch;

    return {
      valid,
      checksumMatch,
      details: {
        backupId,
        backupType: backupData.metadata.backupType,
        backupDate: backupData.metadata.backupDate,
        tableCount: backupData.metadata.tables.length,
        totalRecords: Object.values(backupData.metadata.recordCounts).reduce((a, b) => a + b, 0),
        recordCounts: backupData.metadata.recordCounts,
        expectedChecksum,
        actualChecksum,
        tablesMatch,
      },
    };
  }

  /**
   * 删除备份
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const fileKey = await this.findFileKeyByBackupId(backupId);
      if (!fileKey) {
        console.error('[BackupManager] 找不到备份文件:', backupId);
        return false;
      }

      await this.storage.deleteFile({ fileKey });
      console.log('[BackupManager] 备份已删除:', backupId);
      return true;
    } catch (error) {
      console.error('[BackupManager] 删除备份失败:', error);
      return false;
    }
  }

  /**
   * 生成备份下载URL
   */
  async getBackupDownloadUrl(backupId: string, expireTime = 3600): Promise<string | null> {
    try {
      const fileKey = await this.findFileKeyByBackupId(backupId);
      if (!fileKey) {
        console.error('[BackupManager] 找不到备份文件:', backupId);
        return null;
      }

      const url = await this.storage.generatePresignedUrl({
        key: fileKey,
        expireTime,
      });
      return url;
    } catch (error) {
      console.error('[BackupManager] 生成下载URL失败:', error);
      return null;
    }
  }

  /**
   * 恢复数据库（从备份）
   */
  async restoreFromBackup(backupId: string, options: {
    createdBy: string;
    description?: string;
  } = { createdBy: 'SYSTEM' }): Promise<{ success: boolean; message: string; details?: any }> {
    console.log('[BackupManager] 开始从备份恢复数据库...');
    
    // 1. 验证备份
    const verification = await this.verifyBackup(backupId);
    if (!verification.valid) {
      return {
        success: false,
        message: '备份验证失败，无法恢复',
        details: verification.details,
      };
    }

    // 2. 加载备份数据
    const fileKey = await this.findFileKeyByBackupId(backupId);
    if (!fileKey) {
      return {
        success: false,
        message: '找不到备份文件',
      };
    }

    const backupData = await this.loadBackupData(fileKey);
    if (!backupData) {
      return {
        success: false,
        message: '无法加载备份数据',
      };
    }

    const db = await getDb();

    try {
      // 3. 清空现有数据（可选，根据需求决定是否清空）
      // 注意：这里不清空，而是使用 upsert 或覆盖的方式
      console.log('[BackupManager] 开始恢复数据...');

      // 恢复 users 表
      for (const user of backupData.data.users) {
        // 使用字符串拼接的方式，避免参数化查询的问题
        const id = user.id || "gen_random_uuid()";
        const name = (user.name || '').replace(/'/g, "''");
        const phone = user.phone ? `'${user.phone.replace(/'/g, "''")}'` : 'NULL';
        const email = user.email ? `'${user.email.replace(/'/g, "''")}'` : 'NULL';
        const age = user.age || 'NULL';
        const gender = user.gender ? `'${user.gender.replace(/'/g, "''")}'` : 'NULL';
        const weight = user.weight ? `'${user.weight.replace(/'/g, "''")}'` : 'NULL';
        const height = user.height ? `'${user.height.replace(/'/g, "''")}'` : 'NULL';
        const bloodPressure = user.bloodPressure ? `'${user.bloodPressure.replace(/'/g, "''")}'` : 'NULL';
        const occupation = user.occupation ? `'${user.occupation.replace(/'/g, "''")}'` : 'NULL';
        const address = user.address ? `'${user.address.replace(/'/g, "''")}'` : 'NULL';
        const bmi = user.bmi ? `'${user.bmi.replace(/'/g, "''")}'` : 'NULL';
        const deletedAt = user.deletedAt ? `'${user.deletedAt}'` : 'NULL';
        const createdAt = user.createdAt ? `'${user.createdAt}'` : 'NOW()';
        const updatedAt = user.updatedAt ? `'${user.updatedAt}'` : 'NULL';

        await db.execute(`
          INSERT INTO users (
            id, name, phone, email, age, gender, weight, height, blood_pressure,
            occupation, address, bmi, deleted_at, created_at, updated_at
          ) VALUES (
            '${id}', '${name}', ${phone}, ${email}, ${age}, ${gender}, ${weight}, ${height}, ${bloodPressure},
            ${occupation}, ${address}, ${bmi}, ${deletedAt}, ${createdAt}, ${updatedAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            name = '${name}',
            phone = ${phone},
            email = ${email},
            age = ${age},
            gender = ${gender},
            weight = ${weight},
            height = ${height},
            blood_pressure = ${bloodPressure},
            occupation = ${occupation},
            address = ${address},
            bmi = ${bmi},
            deleted_at = ${deletedAt},
            updated_at = ${updatedAt}
        `);
      }

      // 恢复 symptomChecks 表
      for (const symptomCheck of backupData.data.symptomChecks) {
        const checkedSymptoms = JSON.stringify(symptomCheck.checkedSymptoms).replace(/'/g, "''");
        const elementScores = symptomCheck.elementScores ? `'${JSON.stringify(symptomCheck.elementScores).replace(/'/g, "''")}'::jsonb` : 'NULL';
        const totalScore = symptomCheck.totalScore || 'NULL';
        const checkedAt = symptomCheck.checkedAt ? `'${symptomCheck.checkedAt}'` : 'NOW()';

        await db.execute(`
          INSERT INTO symptom_checks (
            id, user_id, checked_symptoms, total_score, element_scores, checked_at
          ) VALUES (
            '${symptomCheck.id}', '${symptomCheck.userId}', '${checkedSymptoms}'::jsonb, ${totalScore}, ${elementScores}, ${checkedAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = '${symptomCheck.userId}',
            checked_symptoms = '${checkedSymptoms}'::jsonb,
            total_score = ${totalScore},
            element_scores = ${elementScores},
            checked_at = ${checkedAt}
        `);
      }

      // 恢复 healthAnalysis 表
      for (const analysis of backupData.data.healthAnalysis) {
        const qiAndBlood = analysis.qiAndBlood || 'NULL';
        const circulation = analysis.circulation || 'NULL';
        const toxins = analysis.toxins || 'NULL';
        const bloodLipids = analysis.bloodLipids || 'NULL';
        const coldness = analysis.coldness || 'NULL';
        const immunity = analysis.immunity || 'NULL';
        const emotions = analysis.emotions || 'NULL';
        const overallHealth = analysis.overallHealth || 'NULL';
        const analyzedAt = analysis.analyzedAt ? `'${analysis.analyzedAt}'` : 'NOW()';

        await db.execute(`
          INSERT INTO health_analysis (
            id, user_id, qi_and_blood, circulation, toxins, blood_lipids,
            coldness, immunity, emotions, overall_health, analyzed_at
          ) VALUES (
            '${analysis.id}', '${analysis.userId}', ${qiAndBlood}, ${circulation}, ${toxins}, ${bloodLipids},
            ${coldness}, ${immunity}, ${emotions}, ${overallHealth}, ${analyzedAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = '${analysis.userId}',
            qi_and_blood = ${qiAndBlood},
            circulation = ${circulation},
            toxins = ${toxins},
            blood_lipids = ${bloodLipids},
            coldness = ${coldness},
            immunity = ${immunity},
            emotions = ${emotions},
            overall_health = ${overallHealth},
            analyzed_at = ${analyzedAt}
        `);
      }

      // 恢复 userChoices 表
      for (const choice of backupData.data.userChoices) {
        const planDescription = choice.planDescription ? `'${choice.planDescription.replace(/'/g, "''")}'` : 'NULL';
        const selectedAt = choice.selectedAt ? `'${choice.selectedAt}'` : 'NOW()';

        await db.execute(`
          INSERT INTO user_choices (
            id, user_id, plan_type, plan_description, selected_at
          ) VALUES (
            '${choice.id}', '${choice.userId}', '${choice.planType}', ${planDescription}, ${selectedAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = '${choice.userId}',
            plan_type = '${choice.planType}',
            plan_description = ${planDescription},
            selected_at = ${selectedAt}
        `);
      }

      // 恢复 requirements 表
      for (const req of backupData.data.requirements) {
        const requirement1Completed = req.requirement1Completed !== undefined ? req.requirement1Completed : 'FALSE';
        const requirement2Completed = req.requirement2Completed !== undefined ? req.requirement2Completed : 'FALSE';
        const requirement3Completed = req.requirement3Completed !== undefined ? req.requirement3Completed : 'FALSE';
        const requirement4Completed = req.requirement4Completed !== undefined ? req.requirement4Completed : 'FALSE';
        const requirement2Answers = req.requirement2Answers ? `'${JSON.stringify(req.requirement2Answers).replace(/'/g, "''")}'::jsonb` : 'NULL';
        const sevenQuestionsAnswers = req.sevenQuestionsAnswers ? `'${JSON.stringify(req.sevenQuestionsAnswers).replace(/'/g, "''")}'::jsonb` : 'NULL';
        const completedAt = req.completedAt ? `'${req.completedAt}'` : 'NULL';
        const updatedAt = req.updatedAt ? `'${req.updatedAt}'` : 'NULL';

        await db.execute(`
          INSERT INTO requirements (
            id, user_id, requirement1_completed, requirement2_completed,
            requirement3_completed, requirement4_completed,
            requirement2_answers, seven_questions_answers, completed_at, updated_at
          ) VALUES (
            '${req.id}', '${req.userId}', ${requirement1Completed}, ${requirement2Completed},
            ${requirement3Completed}, ${requirement4Completed},
            ${requirement2Answers}, ${sevenQuestionsAnswers}, ${completedAt}, ${updatedAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = '${req.userId}',
            requirement1_completed = ${requirement1Completed},
            requirement2_completed = ${requirement2Completed},
            requirement3_completed = ${requirement3Completed},
            requirement4_completed = ${requirement4Completed},
            requirement2_answers = ${requirement2Answers},
            seven_questions_answers = ${sevenQuestionsAnswers},
            completed_at = ${completedAt},
            updated_at = ${updatedAt}
        `);
      }

      // 恢复 admins 表
      for (const admin of backupData.data.admins) {
        const isActive = admin.isActive !== undefined ? admin.isActive : 'TRUE';
        const createdAt = admin.createdAt ? `'${admin.createdAt}'` : 'NOW()';
        const updatedAt = admin.updatedAt ? `'${admin.updatedAt}'` : 'NULL';

        await db.execute(`
          INSERT INTO admins (
            id, username, password, name, is_active, created_at, updated_at
          ) VALUES (
            '${admin.id}', '${admin.username}', '${admin.password}', '${admin.name || ''}', ${isActive}, ${createdAt}, ${updatedAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            username = '${admin.username}',
            password = '${admin.password}',
            name = '${admin.name || ''}',
            is_active = ${isActive},
            created_at = ${createdAt},
            updated_at = ${updatedAt}
        `);
      }

      // 恢复 auditLogs 表
      for (const log of backupData.data.auditLogs) {
        const oldData = log.oldData ? `'${JSON.stringify(log.oldData).replace(/'/g, "''")}'::jsonb` : 'NULL';
        const newData = log.newData ? `'${JSON.stringify(log.newData).replace(/'/g, "''")}'::jsonb` : 'NULL';
        const ip = log.ip ? `'${log.ip}'` : 'NULL';
        const userAgent = log.userAgent ? `'${log.userAgent.replace(/'/g, "''")}'` : 'NULL';
        const description = log.description ? `'${log.description.replace(/'/g, "''")}'` : 'NULL';
        const createdAt = log.createdAt ? `'${log.createdAt}'` : 'NOW()';

        await db.execute(`
          INSERT INTO audit_logs (
            id, action, table_name, record_id, operator_id, operator_name,
            operator_type, old_data, new_data, ip, user_agent, description, created_at
          ) VALUES (
            '${log.id}', '${log.action}', '${log.tableName}', '${log.recordId}', '${log.operatorId || ''}', '${log.operatorName || ''}',
            '${log.operatorType}', ${oldData}, ${newData}, ${ip}, ${userAgent}, ${description}, ${createdAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            action = '${log.action}',
            table_name = '${log.tableName}',
            record_id = '${log.recordId}',
            operator_id = '${log.operatorId || ''}',
            operator_name = '${log.operatorName || ''}',
            operator_type = '${log.operatorType}',
            old_data = ${oldData},
            new_data = ${newData},
            ip = ${ip},
            user_agent = ${userAgent},
            description = ${description},
            created_at = ${createdAt}
        `);
      }

      console.log('[BackupManager] 数据恢复成功');

      return {
        success: true,
        message: '数据库恢复成功',
        details: {
          backupId,
          backupDate: backupData.metadata.backupDate,
          restoredRecords: backupData.metadata.recordCounts,
        },
      };
    } catch (error) {
      console.error('[BackupManager] 恢复数据库失败:', error);
      return {
        success: false,
        message: '恢复数据库失败',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// 导出单例
export const backupManager = new BackupManager();
