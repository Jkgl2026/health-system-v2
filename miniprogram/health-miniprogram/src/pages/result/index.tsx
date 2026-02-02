import { Component } from 'react'
import { View, Text, Button, Progress } from '@tarojs/components'
import { navigateBack, navigateTo } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'

export default class Result extends Component {
  state = {
    score: 0,
    healthLevel: '',
    advice: '',
    symptoms: [] as string[]
  }

  componentDidMount () {
    this.calculateHealthScore()
  }

  calculateHealthScore = () => {
    const router = Taro.getCurrentInstance().router
    const symptomsParam = router?.params?.symptoms || ''
    const symptoms = symptomsParam ? symptomsParam.split(',') : []

    // 基础分 100 分，每个症状扣分
    let baseScore = 100
    const symptomDeductions: { [key: string]: number } = {
      '1': 10,  // 头痛
      '2': 8,   // 头晕
      '3': 12,  // 失眠
      '4': 8,   // 多梦
      '5': 10,  // 食欲不振
      '6': 8,   // 腹胀
      '7': 15,  // 疲劳
      '8': 12,  // 乏力
      '9': 10,  // 焦虑
      '10': 12, // 抑郁
      '11': 15, // 心悸
      '12': 13, // 胸闷
    }

    symptoms.forEach(id => {
      baseScore -= symptomDeductions[id] || 0
    })

    const score = Math.max(0, baseScore)

    let healthLevel = ''
    let advice = ''

    if (score >= 90) {
      healthLevel = '优秀'
      advice = '您的身体状况很好！继续保持良好的生活习惯。'
    } else if (score >= 80) {
      healthLevel = '良好'
      advice = '您的身体状况良好，注意保持规律作息。'
    } else if (score >= 70) {
      healthLevel = '一般'
      advice = '您可能需要适当调整生活方式，注意休息。'
    } else if (score >= 60) {
      healthLevel = '需要关注'
      advice = '建议您进行更详细的健康检查，关注身体状况。'
    } else {
      healthLevel = '建议就医'
      advice = '您的健康状况需要重视，建议尽快就医检查。'
    }

    this.setState({
      score,
      healthLevel,
      advice,
      symptoms
    })
  }

  handleBack = () => {
    navigateBack()
  }

  handleAnalysis = () => {
    navigateTo({ url: '/pages/analysis/index' })
  }

  render () {
    const { score, healthLevel, advice } = this.state

    return (
      <View className='result-container'>
        {/* 评分展示 */}
        <View className='score-section'>
          <View className='score-circle'>
            <Text className='score-number'>{score}</Text>
            <Text className='score-label'>健康评分</Text>
          </View>

          <View className={`health-level level-${score >= 80 ? 'good' : score >= 60 ? 'warning' : 'danger'}`}>
            {healthLevel}
          </View>
        </View>

        {/* 进度条 */}
        <View className='progress-section'>
          <Text className='progress-label'>健康指数</Text>
          <Progress
            percent={score}
            strokeWidth={20}
            activeColor={score >= 80 ? '#4CAF50' : score >= 60 ? '#FF9800' : '#F44336'}
            backgroundColor='#E0E0E0'
            borderRadius={10}
          />
        </View>

        {/* 健康建议 */}
        <View className='advice-section'>
          <View className='section-title'>健康建议</View>
          <View className='advice-content'>
            <Text>{advice}</Text>
          </View>
        </View>

        {/* 按钮组 */}
        <View className='button-group'>
          <Button className='back-btn' onClick={this.handleBack}>
            返回自检
          </Button>
          <Button className='analysis-btn' onClick={this.handleAnalysis}>
            查看详细分析
          </Button>
        </View>
      </View>
    )
  }
}
