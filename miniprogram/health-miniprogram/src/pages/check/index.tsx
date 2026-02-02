import { Component } from 'react'
import { View, Text, Button, Checkbox, CheckboxGroup } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import './index.scss'

interface Symptom {
  id: string
  name: string
  category: string
}

export default class Check extends Component {
  state = {
    symptoms: [
      { id: '1', name: '头痛', category: '头部' },
      { id: '2', name: '头晕', category: '头部' },
      { id: '3', name: '失眠', category: '睡眠' },
      { id: '4', name: '多梦', category: '睡眠' },
      { id: '5', name: '食欲不振', category: '消化' },
      { id: '6', name: '腹胀', category: '消化' },
      { id: '7', name: '疲劳', category: '体力' },
      { id: '8', name: '乏力', category: '体力' },
      { id: '9', name: '焦虑', category: '心理' },
      { id: '10', name: '抑郁', category: '心理' },
      { id: '11', name: '心悸', category: '心脏' },
      { id: '12', name: '胸闷', category: '心脏' },
    ] as Symptom[],
    selectedSymptoms: [] as string[]
  }

  handleSymptomChange = (e: any) => {
    this.setState({
      selectedSymptoms: e.detail.value
    })
  }

  handleSubmit = () => {
    const { selectedSymptoms } = this.state
    if (selectedSymptoms.length === 0) {
      // Taro.showToast({
      //   title: '请至少选择一个症状',
      //   icon: 'none'
      // })
      return
    }

    // 保存症状数据到本地存储
    // Taro.setStorageSync('selectedSymptoms', selectedSymptoms)

    // 跳转到结果页面
    navigateTo({
      url: `/pages/result/index?symptoms=${selectedSymptoms.join(',')}`
    })
  }

  render () {
    const { symptoms, selectedSymptoms } = this.state

    return (
      <View className='check-container'>
        <View className='tips'>
          <Text>请选择您当前的症状（可多选）：</Text>
        </View>

        <CheckboxGroup onChange={this.handleSymptomChange}>
          <View className='symptoms-list'>
            {symptoms.map(item => (
              <View key={item.id} className='symptom-item'>
                <Checkbox
                  value={item.id}
                  checked={selectedSymptoms.includes(item.id)}
                  color='#667eea'
                />
                <View className='symptom-info'>
                  <Text className='symptom-name'>{item.name}</Text>
                  <Text className='symptom-category'>{item.category}</Text>
                </View>
              </View>
            ))}
          </View>
        </CheckboxGroup>

        <View className='footer'>
          <Button
            className='submit-btn'
            onClick={this.handleSubmit}
            disabled={selectedSymptoms.length === 0}
          >
            开始分析
          </Button>
        </View>
      </View>
    )
  }
}
