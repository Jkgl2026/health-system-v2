import Taro from '@tarojs/taro'
import { UserInfo, CheckRecord, HealthTip } from '../types'

const STORAGE_KEYS = {
  USER_INFO: 'user_info',
  CHECK_RECORDS: 'check_records',
  HEALTH_TIPS: 'health_tips'
}

/**
 * 数据存储工具类
 */
export class StorageManager {
  /**
   * 保存用户信息
   */
  static async setUserInfo(userInfo: UserInfo): Promise<void> {
    try {
      await Taro.setStorage({
        key: STORAGE_KEYS.USER_INFO,
        data: JSON.stringify(userInfo)
      })
    } catch (error) {
      console.error('保存用户信息失败:', error)
      throw error
    }
  }

  /**
   * 获取用户信息
   */
  static async getUserInfo(): Promise<UserInfo | null> {
    try {
      const res = await Taro.getStorage({ key: STORAGE_KEYS.USER_INFO })
      return JSON.parse(res.data)
    } catch (error) {
      return null
    }
  }

  /**
   * 清除用户信息
   */
  static async clearUserInfo(): Promise<void> {
    try {
      await Taro.removeStorage({ key: STORAGE_KEYS.USER_INFO })
    } catch (error) {
      console.error('清除用户信息失败:', error)
    }
  }

  /**
   * 保存自检记录
   */
  static async addCheckRecord(record: CheckRecord): Promise<void> {
    try {
      const records = await this.getCheckRecords()
      records.unshift(record) // 新记录排在前面
      await Taro.setStorage({
        key: STORAGE_KEYS.CHECK_RECORDS,
        data: JSON.stringify(records)
      })
    } catch (error) {
      console.error('保存自检记录失败:', error)
      throw error
    }
  }

  /**
   * 获取所有自检记录
   */
  static async getCheckRecords(): Promise<CheckRecord[]> {
    try {
      const res = await Taro.getStorage({ key: STORAGE_KEYS.CHECK_RECORDS })
      return JSON.parse(res.data)
    } catch (error) {
      return []
    }
  }

  /**
   * 获取最近N条记录
   */
  static async getRecentRecords(count: number = 10): Promise<CheckRecord[]> {
    const records = await this.getCheckRecords()
    return records.slice(0, count)
  }

  /**
   * 获取近3天的记录
   */
  static async getRecent3DaysRecords(): Promise<CheckRecord[]> {
    const records = await this.getCheckRecords()
    const now = Date.now()
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000

    return records.filter(record => record.checkTime >= threeDaysAgo)
  }

  /**
   * 删除自检记录
   */
  static async deleteCheckRecord(id: string): Promise<void> {
    try {
      const records = await this.getCheckRecords()
      const filteredRecords = records.filter(record => record.id !== id)
      await Taro.setStorage({
        key: STORAGE_KEYS.CHECK_RECORDS,
        data: JSON.stringify(filteredRecords)
      })
    } catch (error) {
      console.error('删除自检记录失败:', error)
      throw error
    }
  }

  /**
   * 清除所有自检记录
   */
  static async clearAllCheckRecords(): Promise<void> {
    try {
      await Taro.removeStorage({ key: STORAGE_KEYS.CHECK_RECORDS })
    } catch (error) {
      console.error('清除所有自检记录失败:', error)
    }
  }

  /**
   * 导出数据
   */
  static async exportData(): Promise<string> {
    try {
      const userInfo = await this.getUserInfo()
      const records = await this.getCheckRecords()
      const data = {
        userInfo,
        records,
        exportTime: Date.now()
      }
      return JSON.stringify(data)
    } catch (error) {
      console.error('导出数据失败:', error)
      throw error
    }
  }

  /**
   * 导入数据
   */
  static async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData)

      if (data.userInfo) {
        await this.setUserInfo(data.userInfo)
      }

      if (data.records && Array.isArray(data.records)) {
        await Taro.setStorage({
          key: STORAGE_KEYS.CHECK_RECORDS,
          data: JSON.stringify(data.records)
        })
      }

      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      return false
    }
  }

  /**
   * 清除所有数据
   */
  static async clearAllData(): Promise<void> {
    try {
      await Taro.clearStorage()
    } catch (error) {
      console.error('清除所有数据失败:', error)
    }
  }

  /**
   * 获取存储大小
   */
  static async getStorageInfo(): Promise<any> {
    try {
      return await Taro.getStorageInfo()
    } catch (error) {
      console.error('获取存储信息失败:', error)
      return null
    }
  }
}

export default StorageManager
