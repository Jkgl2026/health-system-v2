import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import StorageManager from '../../utils/storage'
import './index.scss'

interface IndexState {
  hasUserInfo: boolean
  latestScore: number | null
}

export default class Index extends Component<{}, IndexState> {
  constructor(props: {}) {
    super(props)
    this.state = {
      hasUserInfo: false,
      latestScore: null
    }
  }

  componentDidMount() {
    this.loadUserInfo()
    this.loadLatestScore()
  }

  componentDidShow() {
    // 每次显示页面时刷新数据
    this.loadUserInfo()
    this.loadLatestScore()
  }

  /**
   * 加载用户信息
   */
  loadUserInfo = async () => {
    const userInfo = await StorageManager.getUserInfo()
    this.setState({
      hasUserInfo: !!userInfo
    })
  }

  /**
   * 加载最新评分
   */
  loadLatestScore = async () => {
    const records = await StorageManager.getRecentRecords(1)
    if (records.length > 0) {
      this.setState({
        latestScore: records[0].totalScore
      })
    }
  }

  /**
   * 跳转到自检页面
   */
  handleCheck = () => {
    navigateTo({ url: '/pages/check/index' })
  }

  /**
   * 跳转到分析页面
   */
  handleAnalysis = () => {
    navigateTo({ url: '/pages/analysis/index' })
  }

  render() {
    const { hasUserInfo, latestScore } = this.state

    return (
      <View className='index-page'>
        {/* 头部区域 */}
        <View className='header'>
          <View className='header-content'>
            <Text className='header-title'>健康自检系统</Text>
            <Text className='header-subtitle'>了解你的身体状况</Text>
          </View>

          {/* 最新评分卡片 */}
          {latestScore !== null && (
            <View className='score-card'>
              <Text className='score-label'>最新评分</Text>
              <Text className='score-value'>{latestScore}</Text>
            </View>
          )}
        </View>

        {/* 功能区域 */}
        <View className='features'>
          {/* 症状自检 */}
          <View className='feature-card' onClick={this.handleCheck}>
            <View className='feature-icon'>🔍</View>
            <View className='feature-info'>
              <Text className='feature-title'>症状自检</Text>
              <Text className='feature-desc'>快速了解当前身体状况</Text>
            </View>
            <View className='feature-arrow'>›</View>
          </View>

          {/* 健康分析 */}
          <View className='feature-card' onClick={this.handleAnalysis}>
            <View className='feature-icon'>📊</View>
            <View className='feature-info'>
              <Text className='feature-title'>健康分析</Text>
              <Text className='feature-desc'>查看详细的健康报告</Text>
            </View>
            <View className='feature-arrow'>›</View>
          </View>
        </View>

        {/* 快速入口 */}
        <View className='quick-actions'>
          <View className='action-item' onClick={this.handleCheck}>
            <View className='action-icon'>🏃</View>
            <View className='action-info'>
              <Text className='action-title'>开始自检</Text>
              <Text className='action-desc'>3分钟完成健康评估</Text>
            </View>
            <View className='action-arrow'>›</View>
          </View>

          <View className='action-item' onClick={this.handleAnalysis}>
            <View className='action-icon'>📈</View>
            <View className='action-info'>
              <Text className='action-title'>查看趋势</Text>
              <Text className='action-desc'>了解健康变化情况</Text>
            </View>
            <View className='action-arrow'>›</View>
          </View>
        </View>

        {/* 健康贴士 */}
        <View className='tips'>
          <Text className='tips-title'>💡 健康小贴士</Text>
          <Text className='tips-content'>
            保持规律的作息时间，每天保证7-8小时睡眠，适当运动，均衡饮食，定期进行健康自检。
          </Text>
        </View>
      </View>
    )
  }
}
