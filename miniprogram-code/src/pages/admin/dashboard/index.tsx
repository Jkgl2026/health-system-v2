import { Component } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { UserInfo, CheckRecord, HealthLevel } from '../../../types'
import AdminAuth from '../../../utils/adminAuth'
import LevelChart from './components/LevelChart'
import './index.scss'

interface DashboardPageState {
  loading: boolean
  stats: {
    totalUsers: number
    totalRecords: number
    averageScore: number
    highRiskUsers: number
  }
  levelDistribution: {
    [key in HealthLevel]: number
  }
  loginLogs: Array<{
    time: number
    ip: string
  }>
}

export default class DashboardPage extends Component<{}, DashboardPageState> {
  state: DashboardPageState = {
    loading: true,
    stats: {
      totalUsers: 0,
      totalRecords: 0,
      averageScore: 0,
      highRiskUsers: 0
    },
    levelDistribution: {
      [HealthLevel.EXCELLENT]: 0,
      [HealthLevel.GOOD]: 0,
      [HealthLevel.AVERAGE]: 0,
      [HealthLevel.ATTENTION]: 0,
      [HealthLevel.MEDICAL]: 0
    },
    loginLogs: []
  }

  componentDidShow() {
    this.checkAuthAndLoadData()
  }

  /**
   * 检查权限并加载数据
   */
  checkAuthAndLoadData = async () => {
    const isValid = await AdminAuth.verifySession()

    if (!isValid) {
      return
    }

    this.loadData()
  }

  /**
   * 加载所有数据
   */
  loadData = async () => {
    try {
      this.setState({ loading: true })

      // 并行加载所有数据
      const [userInfo, records, logs] = await Promise.all([
        this.loadUserInfo(),
        this.loadCheckRecords(),
        this.loadLoginLogs()
      ])

      // 计算统计数据
      const stats = this.calculateStats(userInfo, records)
      const levelDistribution = this.calculateLevelDistribution(records)

      this.setState({
        stats,
        levelDistribution,
        loginLogs: logs,
        loading: false
      })
    } catch (error) {
      console.error('加载数据失败:', error)
      this.setState({ loading: false })
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  }

  /**
   * 加载用户信息
   */
  loadUserInfo = async (): Promise<UserInfo[]> => {
    try {
      // 尝试从存储中获取用户信息
      const res = await Taro.getStorage({ key: 'user_info' })
      return [JSON.parse(res.data)]
    } catch (error) {
      // 可能没有用户数据，返回空数组
      return []
    }
  }

  /**
   * 加载自检记录
   */
  loadCheckRecords = async (): Promise<CheckRecord[]> => {
    try {
      const res = await Taro.getStorage({ key: 'check_records' })
      return JSON.parse(res.data)
    } catch (error) {
      return []
    }
  }

  /**
   * 加载登录日志
   */
  loadLoginLogs = async (): Promise<Array<{ time: number; ip: string }>> => {
    try {
      const res = await Taro.getStorage({ key: 'admin_login_logs' })
      return res.data || []
    } catch (error) {
      return []
    }
  }

  /**
   * 计算统计数据
   */
  calculateStats = (
    userInfo: UserInfo[],
    records: CheckRecord[]
  ): DashboardPageState['stats'] => {
    const totalUsers = userInfo.length
    const totalRecords = records.length

    // 计算平均分
    const averageScore =
      totalRecords > 0
        ? Math.round(records.reduce((sum, r) => sum + r.totalScore, 0) / totalRecords)
        : 0

    // 计算高风险用户数（最近一次评估为"需要关注"或"建议就医"的用户）
    const highRiskUsers = records.filter(
      (r) => r.level === HealthLevel.ATTENTION || r.level === HealthLevel.MEDICAL
    ).length

    return {
      totalUsers,
      totalRecords,
      averageScore,
      highRiskUsers
    }
  }

  /**
   * 计算健康等级分布
   */
  calculateLevelDistribution = (
    records: CheckRecord[]
  ): DashboardPageState['levelDistribution'] => {
    const distribution = {
      [HealthLevel.EXCELLENT]: 0,
      [HealthLevel.GOOD]: 0,
      [HealthLevel.AVERAGE]: 0,
      [HealthLevel.ATTENTION]: 0,
      [HealthLevel.MEDICAL]: 0
    }

    records.forEach((record) => {
      distribution[record.level]++
    })

    return distribution
  }

  /**
   * 格式化日期时间
   */
  formatDateTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) {
      return '刚刚'
    } else if (minutes < 60) {
      return `${minutes}分钟前`
    } else if (hours < 24) {
      return `${hours}小时前`
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    }
  }

  /**
   * 跳转到用户管理
   */
  handleGoToUsers = () => {
    Taro.navigateTo({ url: '/pages/admin/user/index' })
  }

  /**
   * 跳转到记录管理
   */
  handleGoToRecords = () => {
    Taro.navigateTo({ url: '/pages/admin/record/index' })
  }

  /**
   * 刷新数据
   */
  handleRefresh = () => {
    this.loadData()
  }

  /**
   * 退出登录
   */
  handleLogout = () => {
    AdminAuth.logout()
  }

  render() {
    const { loading, stats, levelDistribution, loginLogs } = this.state

    return (
      <View className='dashboard-page'>
        <ScrollView scrollY className='content-scroll'>
          {/* 顶部操作栏 */}
          <View className='top-bar'>
            <Text className='page-title'>数据概览</Text>
            <View className='top-actions'>
              <View className='action-btn' onClick={this.handleRefresh}>
                <Text className='action-icon'>🔄</Text>
              </View>
              <View className='action-btn' onClick={this.handleLogout}>
                <Text className='action-icon'>🚪</Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View className='loading-container'>
              <Text className='loading-text'>加载中...</Text>
            </View>
          ) : (
            <>
              {/* 数据统计卡片 */}
              <View className='stats-grid'>
                <View className='stat-card'>
                  <Text className='stat-icon'>👥</Text>
                  <View className='stat-content'>
                    <Text className='stat-value'>{stats.totalUsers}</Text>
                    <Text className='stat-label'>用户数</Text>
                  </View>
                </View>

                <View className='stat-card'>
                  <Text className='stat-icon'>📋</Text>
                  <View className='stat-content'>
                    <Text className='stat-value'>{stats.totalRecords}</Text>
                    <Text className='stat-label'>自检次数</Text>
                  </View>
                </View>

                <View className='stat-card'>
                  <Text className='stat-icon'>📊</Text>
                  <View className='stat-content'>
                    <Text className='stat-value'>{stats.averageScore}</Text>
                    <Text className='stat-label'>平均分</Text>
                  </View>
                </View>

                <View className='stat-card danger'>
                  <Text className='stat-icon'>⚠️</Text>
                  <View className='stat-content'>
                    <Text className='stat-value'>{stats.highRiskUsers}</Text>
                    <Text className='stat-label'>高风险用户</Text>
                  </View>
                </View>
              </View>

              {/* 健康等级分布 */}
              <View className='chart-section'>
                <View className='section-header'>
                  <Text className='section-title'>健康等级分布</Text>
                </View>
                <LevelChart data={levelDistribution} height={300} />
              </View>

              {/* 快捷操作 */}
              <View className='quick-actions'>
                <View className='section-header'>
                  <Text className='section-title'>快捷操作</Text>
                </View>

                <View className='action-cards'>
                  <View className='action-card' onClick={this.handleGoToUsers}>
                    <View className='action-card-icon'>👥</View>
                    <Text className='action-card-title'>用户管理</Text>
                    <Text className='action-card-desc'>查看和管理所有用户</Text>
                  </View>

                  <View className='action-card' onClick={this.handleGoToRecords}>
                    <View className='action-card-icon'>📋</View>
                    <Text className='action-card-title'>记录管理</Text>
                    <Text className='action-card-desc'>查看所有自检记录</Text>
                  </View>
                </View>
              </View>

              {/* 近期登录日志 */}
              <View className='logs-section'>
                <View className='section-header'>
                  <Text className='section-title'>近期登录日志</Text>
                  <Text className='section-subtitle'>最近10次</Text>
                </View>

                {loginLogs.length > 0 ? (
                  <View className='logs-list'>
                    {loginLogs.slice(0, 10).map((log, index) => (
                      <View key={index} className='log-item'>
                        <View className='log-icon'>🛡️</View>
                        <View className='log-content'>
                          <Text className='log-text'>管理员登录</Text>
                          <Text className='log-time'>{this.formatDateTime(log.time)}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className='empty-state'>
                    <Text className='empty-icon'>📝</Text>
                    <Text className='empty-text'>暂无登录日志</Text>
                  </View>
                )}
              </View>

              {/* 底部信息 */}
              <View className='footer-info'>
                <Text className='footer-text'>健康自检小程序管理后台</Text>
                <Text className='footer-text'>数据实时更新</Text>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    )
  }
}

// 分享配置
DashboardPage.config = {
  navigationBarTitleText: '管理后台',
  navigationBarBackgroundColor: '#7c3aed',
  navigationBarTextStyle: 'white',
  enableShareAppMessage: true
}
