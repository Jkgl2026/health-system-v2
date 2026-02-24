import Taro from '@tarojs/taro'

// 云数据库初始化（需要在云开发控制台开启）
// 这里先使用本地存储，后续可切换到云数据库

/**
 * 用户数据接口
 */
export interface UserData {
  id?: string
  nickName?: string
  avatarUrl?: string
  createTime?: number
}

/**
 * 症状检查记录接口
 */
export interface SymptomCheck {
  id: string
  symptoms: string[]
  score: number
  healthLevel: string
  createTime: number
}

/**
 * 健康分析记录接口
 */
export interface HealthAnalysis {
  id: string
  userId: string
  score: number
  symptoms: string[]
  advice: string
  createTime: number
}

/**
 * 小程序数据管理器
 * 支持本地存储，后续可扩展为云数据库
 */
class MiniDataManager {
  private readonly STORAGE_KEYS = {
    USER_INFO: 'user_info',
    SYMPTOM_CHECKS: 'symptom_checks',
    HEALTH_ANALYSIS: 'health_analysis'
  }

  /**
   * 保存用户信息
   */
  async saveUserInfo(userInfo: UserData): Promise<{ success: boolean; data?: UserData; error?: string }> {
    try {
      Taro.setStorageSync(this.STORAGE_KEYS.USER_INFO, userInfo)
      return { success: true, data: userInfo }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(): Promise<{ success: boolean; data?: UserData | null; error?: string }> {
    try {
      const userInfo = Taro.getStorageSync(this.STORAGE_KEYS.USER_INFO)
      return { success: true, data: userInfo || null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 保存症状检查记录
   */
  async saveSymptomCheck(check: SymptomCheck): Promise<{ success: boolean; data?: SymptomCheck; error?: string }> {
    try {
      const checks = this.getSymptomChecks()
      checks.unshift(check) // 新记录在最前面
      Taro.setStorageSync(this.STORAGE_KEYS.SYMPTOM_CHECKS, checks)
      return { success: true, data: check }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 获取症状检查记录列表
   */
  getSymptomChecks(): SymptomCheck[] {
    try {
      const checks = Taro.getStorageSync(this.STORAGE_KEYS.SYMPTOM_CHECKS) || []
      return Array.isArray(checks) ? checks : []
    } catch {
      return []
    }
  }

  /**
   * 保存健康分析记录
   */
  async saveHealthAnalysis(analysis: HealthAnalysis): Promise<{ success: boolean; data?: HealthAnalysis; error?: string }> {
    try {
      const analyses = this.getHealthAnalyses()
      analyses.unshift(analysis)
      Taro.setStorageSync(this.STORAGE_KEYS.HEALTH_ANALYSIS, analyses)
      return { success: true, data: analysis }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 获取健康分析记录列表
   */
  getHealthAnalyses(): HealthAnalysis[] {
    try {
      const analyses = Taro.getStorageSync(this.STORAGE_KEYS.HEALTH_ANALYSIS) || []
      return Array.isArray(analyses) ? analyses : []
    } catch {
      return []
    }
  }

  /**
   * 清除所有数据
   */
  async clearAllData(): Promise<{ success: boolean; error?: string }> {
    try {
      Taro.clearStorage()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 导出数据（JSON）
   */
  async exportData(): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const data = {
        userInfo: Taro.getStorageSync(this.STORAGE_KEYS.USER_INFO),
        symptomChecks: Taro.getStorageSync(this.STORAGE_KEYS.SYMPTOM_CHECKS),
        healthAnalysis: Taro.getStorageSync(this.STORAGE_KEYS.HEALTH_ANALYSIS),
        exportTime: new Date().toISOString()
      }
      return { success: true, data: JSON.stringify(data, null, 2) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 导入数据（JSON）
   */
  async importData(jsonData: string): Promise<{ success: boolean; error?: string }> {
    try {
      const data = JSON.parse(jsonData)
      if (data.userInfo) Taro.setStorageSync(this.STORAGE_KEYS.USER_INFO, data.userInfo)
      if (data.symptomChecks) Taro.setStorageSync(this.STORAGE_KEYS.SYMPTOM_CHECKS, data.symptomChecks)
      if (data.healthAnalysis) Taro.setStorageSync(this.STORAGE_KEYS.HEALTH_ANALYSIS, data.healthAnalysis)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

// 导出单例
export const miniDataManager = new MiniDataManager()
