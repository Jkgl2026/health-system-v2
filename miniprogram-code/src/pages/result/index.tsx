import { Component } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { getHealthLevelInfo, getHealthAdvice, CATEGORY_NAMES } from '../../utils/healthScore'
import { CheckRecord, HealthLevel } from '../../types'
import StorageManager from '../../utils/storage'
import './index.scss'

interface ResultPageState {
  record: CheckRecord | null
  loading: boolean
}

export default class ResultPage extends Component<{}, ResultPageState> {
  router: any

  constructor(props: {}) {
    super(props)
    this.state = {
      record: null,
      loading: true
    }
    this.router = useRouter()
  }

  componentDidMount() {
    this.loadRecord()
  }

  /**
   * 加载自检记录
   */
  loadRecord = async () => {
    try {
      const { recordId } = this.router.params

      if (!recordId) {
        Taro.showToast({
          title: '记录不存在',
          icon: 'none'
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
        return
      }

      const records = await StorageManager.getCheckRecords()
      const record = records.find(r => r.id === recordId)

      if (!record) {
        Taro.showToast({
          title: '记录不存在',
          icon: 'none'
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
        return
      }

      this.setState({
        record,
        loading: false
      })
    } catch (error) {
      console.error('加载记录失败:', error)
      this.setState({ loading: false })
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  }

  /**
   * 获取健康等级对应的颜色
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
   * 返回自检页面
   */
  handleBackToCheck = () => {
    Taro.redirectTo({ url: '/pages/check/index' })
  }

  /**
   * 查看详细分析
   */
  handleViewAnalysis = () => {
    Taro.switchTab({ url: '/pages/analysis/index' })
  }

  /**
   * 分享结果
   */
  handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true
    })
  }

  render() {
    const { record, loading } = this.state

    if (loading) {
      return (
        <View className='result-page loading'>
          <Text className='loading-text'>加载中...</Text>
        </View>
      )
    }

    if (!record) {
      return null
    }

    const levelInfo = getHealthLevelInfo(record.level)
    const advice = getHealthAdvice(record.level, record.symptoms)
    const levelColor = this.getLevelColor(record.level)

    return (
      <View className='result-page'>
        <ScrollView scrollY className='content-scroll'>
          {/* 评分卡片 */}
          <View className='score-card'>
            <View className='score-header'>
              <Text className='score-label'>健康评分</Text>
              <Text className='score-date'>
                {new Date(record.checkTime).toLocaleDateString()}
              </Text>
            </View>

            <View className='score-value-container'>
              <Text className='score-value' style={{ color: levelColor }}>
                {record.totalScore}
              </Text>
              <Text className='score-suffix'>分</Text>
            </View>

            <View
              className='level-badge'
              style={{ backgroundColor: levelColor }}
            >
              <Text className='level-icon'>{levelInfo.icon}</Text>
              <Text className='level-text'>{levelInfo.label}</Text>
            </View>
          </View>

          {/* 各维度得分 */}
          <View className='element-scores'>
            <View className='section-title'>
              <Text className='title-text'>各维度得分</Text>
            </View>

            {Object.entries(record.elementScores).map(([category, score]) => (
              <View key={category} className='element-item'>
                <View className='element-header'>
                  <Text className='element-name'>{CATEGORY_NAMES[category]}</Text>
                  <Text className='element-score'>{score}分</Text>
                </View>
                <View className='element-progress'>
                  <View
                    className='element-progress-bar'
                    style={{
                      width: `${score}%`,
                      backgroundColor: score >= 90 ? '#52c41a' : score >= 80 ? '#1890ff' : score >= 70 ? '#faad14' : '#ff7a45'
                    }}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* 健康建议 */}
          <View className='health-advice'>
            <View className='section-title'>
              <Text className='title-text'>健康建议</Text>
            </View>

            <View className='advice-content'>
              <View className='advice-title-container'>
                <Text className='advice-icon'>💡</Text>
                <Text className='advice-title'>{advice.title}</Text>
              </View>

              <View className='advice-list'>
                {advice.content.map((item, index) => (
                  <View key={index} className='advice-item'>
                    <Text className='advice-dot'>•</Text>
                    <Text className='advice-text'>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 选中的症状 */}
          <View className='selected-symptoms'>
            <View className='section-title'>
              <Text className='title-text'>本次选中的症状</Text>
              <Text className='symptom-count'>{record.symptoms.length}项</Text>
            </View>

            <View className='symptom-tags'>
              {record.symptoms.map((symptomId, index) => {
                // 从健康评分工具中获取症状名称
                const { SYMPTOMS } = require('../../utils/healthScore')
                const symptom = SYMPTOMS.find(s => s.id === symptomId)
                if (!symptom) return null

                return (
                  <View key={symptomId} className='symptom-tag'>
                    <Text className='symptom-tag-icon'>{symptom.icon}</Text>
                    <Text className='symptom-tag-text'>{symptom.name}</Text>
                  </View>
                )
              })}
            </View>
          </View>

          {/* 底部操作按钮 */}
          <View className='actions'>
            <Button className='action-btn secondary' onClick={this.handleBackToCheck}>
              重新自检
            </Button>
            <Button className='action-btn primary' onClick={this.handleViewAnalysis}>
              查看分析
            </Button>
          </View>
        </ScrollView>
      </View>
    )
  }
}

// 分享配置
ResultPage.config = {
  navigationBarTitleText: '健康评估结果',
  enableShareAppMessage: true
}
