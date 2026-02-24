import { Component } from 'react'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface LoginPageState {
  username: string
  password: string
  loading: boolean
}

export default class AdminLoginPage extends Component<{}, LoginPageState> {
  // 默认管理员账号密码
  private static ADMIN_USERNAME = 'admin'
  private static ADMIN_PASSWORD = 'admin123'

  state: LoginPageState = {
    username: '',
    password: '',
    loading: false
  }

  componentDidMount() {
    // 检查是否已登录
    this.checkLoginStatus()
  }

  /**
   * 检查登录状态
   */
  checkLoginStatus = async () => {
    try {
      const adminToken = await Taro.getStorage({ key: 'admin_token' })
      if (adminToken.data) {
        // 已登录，跳转到管理后台首页
        Taro.redirectTo({ url: '/pages/admin/dashboard/index' })
      }
    } catch (error) {
      // 未登录，保持在登录页
    }
  }

  /**
   * 处理用户名输入
   */
  handleUsernameChange = (e: any) => {
    this.setState({ username: e.detail.value })
  }

  /**
   * 处理密码输入
   */
  handlePasswordChange = (e: any) => {
    this.setState({ password: e.detail.value })
  }

  /**
   * 登录
   */
  handleLogin = () => {
    const { username, password, loading } = this.state

    if (loading) {
      return
    }

    // 验证输入
    if (!username || !password) {
      Taro.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      })
      return
    }

    // 验证账号密码
    if (username !== AdminLoginPage.ADMIN_USERNAME || password !== AdminLoginPage.ADMIN_PASSWORD) {
      Taro.showToast({
        title: '账号或密码错误',
        icon: 'none'
      })
      return
    }

    // 登录成功
    this.performLogin()
  }

  /**
   * 执行登录
   */
  performLogin = async () => {
    this.setState({ loading: true })

    try {
      // 生成登录令牌
      const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 保存登录状态
      await Taro.setStorage({
        key: 'admin_token',
        data: token
      })

      // 保存登录时间
      await Taro.setStorage({
        key: 'admin_login_time',
        data: Date.now().toString()
      })

      // 保存登录日志
      await this.saveLoginLog()

      this.setState({ loading: false })

      Taro.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/admin/dashboard/index' })
      }, 1000)
    } catch (error) {
      console.error('登录失败:', error)
      this.setState({ loading: false })

      Taro.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      })
    }
  }

  /**
   * 保存登录日志
   */
  saveLoginLog = async () => {
    try {
      const logs = await Taro.getStorage({ key: 'admin_login_logs' })
      const loginLogs = logs.data || []

      // 添加新的登录记录
      loginLogs.unshift({
        time: Date.now(),
        ip: 'unknown' // 小程序无法获取真实IP
      })

      // 只保留最近50条日志
      if (loginLogs.length > 50) {
        loginLogs.pop()
      }

      await Taro.setStorage({
        key: 'admin_login_logs',
        data: loginLogs
      })
    } catch (error) {
      // 首次登录，创建日志
      await Taro.setStorage({
        key: 'admin_login_logs',
        data: [{ time: Date.now(), ip: 'unknown' }]
      })
    }
  }

  /**
   * 返回首页
   */
  handleBack = () => {
    Taro.switchTab({ url: '/pages/index/index' })
  }

  render() {
    const { username, password, loading } = this.state

    return (
      <View className='admin-login-page'>
        <View className='login-container'>
          {/* Logo 和标题 */}
          <View className='login-header'>
            <View className='logo-wrapper'>
              <Text className='logo-icon'>🛡️</Text>
            </View>
            <Text className='login-title'>管理员登录</Text>
            <Text className='login-subtitle'>健康自检小程序后台管理</Text>
          </View>

          {/* 登录表单 */}
          <View className='login-form'>
            <View className='form-group'>
              <Text className='form-label'>账号</Text>
              <View className='input-wrapper'>
                <Text className='input-icon'>👤</Text>
                <Input
                  className='form-input'
                  placeholder='请输入管理员账号'
                  value={username}
                  onInput={this.handleUsernameChange}
                  placeholderClass='input-placeholder'
                />
              </View>
            </View>

            <View className='form-group'>
              <Text className='form-label'>密码</Text>
              <View className='input-wrapper'>
                <Text className='input-icon'>🔒</Text>
                <Input
                  className='form-input'
                  type='password'
                  placeholder='请输入管理员密码'
                  value={password}
                  onInput={this.handlePasswordChange}
                  placeholderClass='input-placeholder'
                />
              </View>
            </View>

            <Button
              className={`login-btn ${loading ? 'loading' : ''}`}
              onClick={this.handleLogin}
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </View>

          {/* 提示信息 */}
          <View className='login-tips'>
            <Text className='tip-text'>默认账号：admin</Text>
            <Text className='tip-text'>默认密码：admin123</Text>
          </View>

          {/* 返回按钮 */}
          <View className='back-btn' onClick={this.handleBack}>
            <Text className='back-text'>← 返回首页</Text>
          </View>
        </View>

        {/* 装饰背景 */}
        <View className='decoration-circle circle-1'></View>
        <View className='decoration-circle circle-2'></View>
        <View className='decoration-circle circle-3'></View>
      </View>
    )
  }
}

// 分享配置
AdminLoginPage.config = {
  navigationBarTitleText: '管理员登录',
  navigationBarBackgroundColor: '#7c3aed',
  navigationBarTextStyle: 'white',
  disableScroll: true
}
