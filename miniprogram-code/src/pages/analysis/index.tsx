import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { CheckRecord, HealthLevel } from '../../types'
import StorageManager from '../../utils/storage'
import { getHealthLevelInfo } from '../../utils/healthScore'
import TrendChart from './components/TrendChart'
import './index.scss'

interface AnalysisPageState {
  records: CheckRecord[]
  loading: boolean
  stats: {
    totalChecks: number
    avgScore: number
    maxScore: number
    minScore: number
    currentLevel: HealthLevel | null
  }
  tips: Array<{
    id: number
    icon: string
    title: string
    content: string
  }>
}

export default class AnalysisPage extends Component<{}, AnalysisPageState> {
  /**
   * 健康贴士数据
   */
  private static HEALTH_TIPS = [
    {
      id: 1,
      icon: '💤',
      title: '睡眠充足',
      content: '每天保持7-8小时的睡眠，有助于身体修复和免疫提升'
    },
    {
      id: 2,
      icon: '🏃',
      title: '适度运动',
      content: '每周进行150分钟中等强度运动，增强心肺功能'
    },
    {
      id: 3,
      icon: '🥗',
      title: '均衡饮食',
      content: '多吃蔬菜水果，少吃油腻和高糖食物'
    },
    {
      id: 4,
      icon: '🧘',
      title: '放松心情',
      content: '学会缓解压力，保持积极乐观的心态'
    },
    {
      id: 5,
      icon: '💧',
      title: '多喝水',
      content: '每天喝足够的水，保持身体水分平衡'
    },
    {
      id: 6,
      icon: '🚭',
      title: '戒烟限酒',
      content: '减少烟酒摄入，降低患病风险'
    }
  ]

  state: AnalysisPageState = {
    records: [],
    loading: true,
    stats: {
      totalChecks: 0,
      avgScore: 0,
      maxScore: 0,
      minScore: 0,
      currentLevel: null
    },
    tips: AnalysisPage.HEALTH_TIPS
  }

  componentDidShow() {
    this.loadData()
  }

  /**
   * 加载数据
   */
  loadData = async () => {
    try {
      this.setState({ loading: true })

      const records = await StorageManager.getCheckRecords()
      const stats = this.calculateStats(records)

      this.setState({
        records,
        stats,
        loading: false
      })
    } catch (error) {
      console.error('加载数据失败:', error)
      this.setState({ loading: false })
    }
  }

  /**
   * 计算统计数据
   */
  calculateStats = (records: CheckRecord[]) => {
    if (records.length === 0) {
      return {
        totalChecks: 0,
        avgScore: 0,
        maxScore: 0,
        minScore: 0,
        currentLevel: null
      }
    }

    const scores = records.map(r => r.totalScore)
    const totalChecks = records.length
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const maxScore = Math.max(...scores)
    const minScore = Math.min(...scores)
    const currentLevel = records[records.length - 1].level

    return {
      totalChecks,
      avgScore,
      maxScore,
      minScore,
      currentLevel
    }
  }

  /**
   * 格式化日期
   */
  formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
  }

  /**
   * 获取健康等级颜色
   */
  getLevelColor = (level: HealthLevel): string => {
    const colorMap: Record<HealthLevel, string> = {
      [HealthLevel.EXCELLENT]: '#52c41a',
      [HealthLevel.GOOD]: '#1890ff',
      [HealthLevel.AVERAGE]: '#faad14',
      [HealthLevel.ATTENTION]: '#ff7a45',
      [HealthLevel.MEDICAL]: '#f5222d'
    }
    return colorMap[level]
  }

  /**
   * 跳转到详情
   */
  handleViewDetail = (recordId: string) => {
    Taro.navigateTo({
      url: `/pages/result/index?recordId=${recordId}`
    })
  }

  /**
   * 跳转到自检
   */
  handleGoCheck = () => {
    Taro.switchTab({ url: '/pages/check/index' })
  }

  render() {
    const { records, loading, stats, tips } = this.state

    if (loading) {
      return (
        <View className='analysis-page loading'>
          <Text className='loading-text'>加载中...</Text>
        </View>
      )
    }

    return (
      <View className='analysis-page'>
        <ScrollView scrollY className='content-scroll'>
          {/* 数据统计概览 */}
          <View className='stats-card'>
            <View className='stats-header'>
              <Text className='stats-title'>健康数据概览</Text>
              <Text className='stats-total'>共 {stats.totalChecks} 次自检</Text>
            </View>

            <View className='stats-grid'>
              <View className='stat-item'>
                <Text className='stat-label'>平均分</Text>
                <Text className='stat-value'>{stats.avgScore}</Text>
              </View>
              <View className='stat-item'>
                <Text className='stat-label'>最高分</Text>
                <Text className='stat-value'>{stats.maxScore}</Text>
              </View>
              <View className='stat-item'>
                <Text className='stat-label'>最低分</Text>
                <Text className='stat-value'>{stats.minScore}</Text>
              </View>
              <View className='stat-item'>
                <Text className='stat-label'>当前等级</Text>
                {stats.currentLevel && (
                  <View
                    className='stat-level-badge'
                    style={{ backgroundColor: this.getLevelColor(stats.currentLevel) }}
                  >
                    {getHealthLevelInfo(stats.currentLevel).label}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* 健康趋势图表 */}
          <View className='section-container'>
            <View className='section-header'>
              <Text className='section-title'>健康趋势</Text>
              <Text className='section-subtitle'>最近7次自检</Text>
            </View>
            <TrendChart records={records} height={300} />
          </View>

          {/* 近期自检记录 */}
          <View className='section-container'>
            <View className='section-header'>
              <Text className='section-title'>近期记录</Text>
              <Text className='section-subtitle'>最近5次</Text>
            </View>

            {records.length > 0 ? (
              <View className='record-list'>
                {records.slice(-5).reverse().map(record => (
                  <View
                    key={record.id}
                    className='record-item'
                    onClick={() => this.handleViewDetail(record.id)}
                  >
                    <View className='record-left'>
                      <View
                        className='record-score'
                        style={{ color: this.getLevelColor(record.level) }}
                      >
                        {record.totalScore}
                        <Text className='score-unit'>分</Text>
                      </View>
                      <View className='record-info'>
                        <Text className='record-date'>{this.formatDate(record.checkTime)}</Text>
                        <Text className='record-time'>
                          {new Date(record.checkTime).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                    </View>
                    <View className='record-right'>
                      <View
                        className='record-level-badge'
                        style={{ backgroundColor: this.getLevelColor(record.level) }}
                      >
                        {getHealthLevelInfo(record.level).label}
                      </View>
                      <Text className='record-arrow'>›</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className='empty-state'>
                <Text className='empty-icon'>📋</Text>
                <Text className='empty-text'>暂无自检记录</Text>
                <Text className='empty-hint'>开始第一次健康自检吧</Text>
              </View>
            )}
          </View>

          {/* 健康贴士 */}
          <View className='section-container'>
            <View className='section-header'>
              <Text className='section-title'>健康贴士</Text>
              <Text className='section-subtitle'>每日一读</Text>
            </View>

            <View className='tips-grid'>
              {tips.map(tip => (
                <View key={tip.id} className='tip-card'>
                  <View className='tip-icon'>{tip.icon}</View>
                  <Text className='tip-title'>{tip.title}</Text>
                  <Text className='tip-content'>{tip.content}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 底部提示 */}
          <View className='footer-tip'>
            <Text className='tip-text'>坚持定期自检，关注健康变化</Text>
          </View>
        </ScrollView>

        {/* 悬浮按钮 */}
        {records.length === 0 && (
          <View className='floating-btn' onClick={this.handleGoCheck}>
            <Text className='floating-text'>开始自检</Text>
          </View>
        )}
      </View>
    )
  }
}

// 分享配置
AnalysisPage.config = {
  navigationBarTitleText: '健康分析',
  enableShareAppMessage: true
}
