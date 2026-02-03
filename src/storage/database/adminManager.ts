/**
 * AdminManager - 管理员数据管理器
 * 
 * 功能：
 * - 管理员账号查询
 * - 密码验证
 * - 登录记录
 * 
 * 使用方式：
 * import { adminManager } from '@/storage/database/adminManager';
 * 
 * const admin = await adminManager.findByUsername('admin');
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { admins } from "./shared/schema";
import bcrypt from "bcryptjs";

/**
 * 管理员类型
 */
export type Admin = typeof admins.$inferSelect;

/**
 * 管理员插入类型
 */
export type InsertAdmin = typeof admins.$inferInsert;

/**
 * AdminManager 类
 */
export class AdminManager {
  /**
   * 根据用户名查找管理员
   * 
   * @param username - 用户名
   * @returns 管理员对象或null
   */
  async findByUsername(username: string): Promise<Admin | null> {
    try {
      const db = await getDb();
      const [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.username, username))
        .limit(1);
      
      return admin || null;
    } catch (error) {
      console.error('[AdminManager] 查询管理员失败', error);
      throw new Error('查询管理员失败');
    }
  }

  /**
   * 根据ID查找管理员
   * 
   * @param id - 管理员ID
   * @returns 管理员对象或null
   */
  async findById(id: string): Promise<Admin | null> {
    try {
      const db = await getDb();
      const [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.id, id))
        .limit(1);
      
      return admin || null;
    } catch (error) {
      console.error('[AdminManager] 查询管理员失败', error);
      throw new Error('查询管理员失败');
    }
  }

  /**
   * 验证密码
   * 
   * @param admin - 管理员对象
   * @param password - 明文密码
   * @returns 是否验证成功
   */
  async verifyPassword(admin: Admin, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, admin.password);
    } catch (error) {
      console.error('[AdminManager] 密码验证失败', error);
      return false;
    }
  }

  /**
   * 创建管理员
   * 
   * @param data - 管理员数据（password为明文，会自动加密）
   * @returns 创建的管理员对象
   */
  async createAdmin(data: Omit<InsertAdmin, 'password'> & { password: string }): Promise<Admin> {
    try {
      const db = await getDb();
      
      // 加密密码
      const passwordHash = await bcrypt.hash(data.password, 10);
      
      // 插入数据
      const [admin] = await db
        .insert(admins)
        .values({
          ...data,
          password: passwordHash,
        })
        .returning();
      
      return admin;
    } catch (error) {
      console.error('[AdminManager] 创建管理员失败', error);
      throw new Error('创建管理员失败');
    }
  }

  /**
   * 更新管理员信息
   * 
   * @param id - 管理员ID
   * @param data - 更新数据
   * @returns 更新后的管理员对象
   */
  async updateAdmin(id: string, data: Partial<InsertAdmin>): Promise<Admin | null> {
    try {
      const db = await getDb();
      
      // 如果包含明文密码，则加密
      let updateData = data;
      if ('password' in data && typeof data.password === 'string') {
        updateData = {
          ...data,
          password: await bcrypt.hash(data.password, 10),
        };
      }
      
      const [admin] = await db
        .update(admins)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(admins.id, id))
        .returning();
      
      return admin || null;
    } catch (error) {
      console.error('[AdminManager] 更新管理员失败', error);
      throw new Error('更新管理员失败');
    }
  }

  /**
   * 查询所有管理员
   * 
   * @returns 管理员列表
   */
  async getAllAdmins(): Promise<Admin[]> {
    try {
      const db = await getDb();
      return db.select().from(admins);
    } catch (error) {
      console.error('[AdminManager] 查询管理员列表失败', error);
      throw new Error('查询管理员列表失败');
    }
  }

  /**
   * 检查用户名是否存在
   * 
   * @param username - 用户名
   * @returns 是否存在
   */
  async usernameExists(username: string): Promise<boolean> {
    try {
      const admin = await this.findByUsername(username);
      return admin !== null;
    } catch (error) {
      console.error('[AdminManager] 检查用户名失败', error);
      return false;
    }
  }
}

// 导出单例
export const adminManager = new AdminManager();
