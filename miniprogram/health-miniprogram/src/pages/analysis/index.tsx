import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

export default class Analysis extends Component {
  state = {
    history: [
      { date: '2025-02-02', score: 85, symptoms: ['头痛', '失眠'] },
      { date: '2025-02-01', score: 78, symptoms: ['疲劳', '乏力'] },
      { date: '2025-01-31', score: 92, symptoms: [] },
    ]
  }

  render () {
    const { history } = this.state

    return (
      <View className='analysis-container'>
        <View className='header'>
          <Text className='header-title'>健康分析</Text>
          <Text className='header-subtitle'>查看你的健康趋势</Text>
        </View>

        {/* 健康趋势 */}
        <View className='trend-section'>
          <View className='section-title'>健康趋势</View>
          <View className='trend-chart'>
            <View className='chart-bar'>
              <View className='bar' style={{ height: `${history[0].score}%`, background: history[0].score >= 80 ? '#4CAF50' : history[0].score >= 60 ? '#FF9800' : '#F44336' }}></View>
              <Text className='bar-label'>今天</Text>
            </View>
            <View className='chart-bar'>
              <View className='bar' style={{ height: `${history[1].score}%`, background: history[1].score >= 80 ? '#4CAF50' : history[1].score >= 60 ? '#FF9800' : '#F44336' }}></View>
              <Text className='bar-label'>昨天</Text>
            </View>
            <View className='chart-bar'>
              <View className='bar' style={{ height: `${history[2].score}%`, background: history[2].score >= 80 ? '#4CAF50' : history[2].score >= 60 ? '#FF9800' : '#F44336' }}></View>
              <Text className='bar-label'>前天</Text>
            </View>
          </View>
        </View>

        {/* 历史记录 */}
        <View className='history-section'>
          <View className='section-title'>历史记录</View>
          <View className='history-list'>
            {history.map((item, index) => (
              <View key={index} className='history-item'>
                <View className='history-date'>{item.date}</View>
                <View className='history-info'>
                  <View className={`history-score score-${item.score >= 80 ? 'good' : item.score >= 60 ? 'warning' : 'danger'}`}>
                    {item.score}分
                  </View>
                  {item.symptoms.length > 0 && (
                    <View className='history-symptoms'>
                      {item.symptoms.map((symptom, i) => (
                        <Text key={i} className='symptom-tag'>{symptom}</Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 健康贴士 */}
        <View className='tips-section'>
          <View className='section-title'>健康贴士</View>
          <View className='tips-content'>
            <View className='tip-item'>
              <Text className='tip-icon'>💡</Text>
              <Text className='tip-text'>保持规律作息，每天睡眠7-8小时</Text>
            </View>
            <View className='tip-item'>
              <Text className='tip-icon'>💡</Text>
              <Text className='tip-text'>每天至少运动30分钟，增强体质</Text>
            </View>
            <View className='tip-item'>
              <Text className='tip-icon'>💡</Text>
              <Text className='tip-text'>保持良好的饮食习惯，多吃蔬果</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
