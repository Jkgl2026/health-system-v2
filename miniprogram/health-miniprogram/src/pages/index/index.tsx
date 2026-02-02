import { Component } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import './index.scss'

export default class Index extends Component {
  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleCheck = () => {
    navigateTo({ url: '/pages/check/index' })
  }

  handleAnalysis = () => {
    navigateTo({ url: '/pages/analysis/index' })
  }

  render () {
    return (
      <View className='index-container'>
        {/* 头部 */}
        <View className='header'>
          <Text className='header-title'>健康自检系统</Text>
          <Text className='header-subtitle'>了解你的身体状况</Text>
        </View>

        {/* 主要功能区 */}
        <View className='features'>
          <View className='feature-card' onClick={this.handleCheck}>
            <View className='feature-icon'>🔍</View>
            <View className='feature-title'>症状自检</View>
            <View className='feature-desc'>快速了解当前身体状况</View>
          </View>

          <View className='feature-card' onClick={this.handleAnalysis}>
            <View className='feature-icon'>📊</View>
            <View className='feature-title'>健康分析</View>
            <View className='feature-desc'>查看详细的健康报告</View>
          </View>
        </View>

        {/* 快速入口 */}
        <View className='quick-actions'>
          <View className='action-item' onClick={this.handleCheck}>
            <Text>开始自检</Text>
            <Text className='arrow'>›</Text>
          </View>
          <View className='action-item' onClick={this.handleAnalysis}>
            <Text>查看分析</Text>
            <Text className='arrow'>›</Text>
          </View>
        </View>
      </View>
    )
  }
}
