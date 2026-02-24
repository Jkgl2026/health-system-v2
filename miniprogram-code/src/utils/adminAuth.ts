import Taro from '@tarojs/taro'

/**
 * 管理员认证工具类
 */
export class AdminAuth {
  private static readonly TOKEN_KEY = 'admin_token'
  private static readonly LOGIN_TIME_KEY = 'admin_login_time'
  private static readonly DEFAULT_USERNAME = 'admin'
  private static readonly DEFAULT_PASSWORD = 'admin123'

  /**
   * 检查是否已登录
   */
  static async isLoggedIn(): Promise<boolean> {
    try {
      const res = await Taro.getStorage({ key: this.TOKEN_KEY })
      return !!res.data
    } catch (error) {
      return false
    }
  }

  /**
   * 获取登录令牌
   */
  static async getToken(): Promise<string | null> {
    try {
      const res = await Taro.getStorage({ key: this.TOKEN_KEY })
      return res.data
    } catch (error) {
      return null
    }
  }

  /**
   * 获取登录时间
   */
  static async getLoginTime(): Promise<number> {
    try {
      const res = await Taro.getStorage({ key: this.LOGIN_TIME_KEY })
      return parseInt(res.data, 10) || 0
    } catch (error) {
      return 0
    }
  }

  /**
   * 验证登录状态（未登录则跳转到登录页）
   * @returns 是否已登录
   */
  static async verifyLogin(): Promise<boolean> {
    const isLoggedIn = await this.isLoggedIn()

    if (!isLoggedIn) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      })

      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/admin/login/index' })
      }, 1000)

      return false
    }

    return true
  }

  /**
   * 退出登录
   */
  static async logout(): Promise<void> {
    try {
      await Taro.removeStorage({ key: this.TOKEN_KEY })
      await Taro.removeStorage({ key: this.LOGIN_TIME_KEY })

      Taro.showToast({
        title: '已退出登录',
        icon: 'success'
      })

      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/admin/login/index' })
      }, 1000)
    } catch (error) {
      console.error('退出登录失败:', error)
      Taro.showToast({
        title: '退出失败',
        icon: 'none'
      })
    }
  }

  /**
   * 验证账号密码
   */
  static verifyCredentials(username: string, password: string): boolean {
    return username === this.DEFAULT_USERNAME && password === this.DEFAULT_PASSWORD
  }

  /**
   * 保存登录令牌
   */
  static async saveToken(token: string): Promise<void> {
    await Taro.setStorage({
      key: this.TOKEN_KEY,
      data: token
    })
  }

  /**
   * 保存登录时间
   */
  static async saveLoginTime(time: number): Promise<void> {
    await Taro.setStorage({
      key: this.LOGIN_TIME_KEY,
      data: time.toString()
    })
  }

  /**
   * 生成登录令牌
   */
  static generateToken(): string {
    return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取默认账号（仅用于提示）
   */
  static getDefaultUsername(): string {
    return this.DEFAULT_USERNAME
  }

  /**
   * 获取默认密码（仅用于提示）
   */
  static getDefaultPassword(): string {
    return this.DEFAULT_PASSWORD
  }

  /**
   * 检查会话是否过期（24小时）
   */
  static async isSessionExpired(): Promise<boolean> {
    const loginTime = await this.getLoginTime()
    if (!loginTime) return true

    const now = Date.now()
    const sessionDuration = 24 * 60 * 60 * 1000 // 24小时

    return now - loginTime > sessionDuration
  }

  /**
   * 清除过期会话
   */
  static async clearExpiredSession(): Promise<void> {
    const isExpired = await this.isSessionExpired()

    if (isExpired) {
      await Taro.removeStorage({ key: this.TOKEN_KEY })
      await Taro.removeStorage({ key: this.LOGIN_TIME_KEY })
    }
  }

  /**
   * 验证会话有效性
   */
  static async verifySession(): Promise<boolean> {
    await this.clearExpiredSession()
    return await this.isLoggedIn()
  }
}

export default AdminAuth
