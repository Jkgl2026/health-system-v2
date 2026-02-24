import { Component } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  SYMPTOMS,
  CATEGORY_NAMES,
  getSymptomsByCategory,
  getAllCategories,
  calculateHealthScore,
  calculateElementScores,
  getHealthLevel
} from '../../utils/healthScore'
import { SymptomCategory, CheckRecord } from '../../types'
import StorageManager from '../../utils/storage'
import './index.scss'

interface CheckPageState {
  selectedSymptoms: Set<string>
  currentCategory: SymptomCategory | null
}

export default class CheckPage extends Component<{}, CheckPageState> {
  state: CheckPageState = {
    selectedSymptoms: new Set(),
    currentCategory: null
  }

  componentDidMount() {
    const categories = getAllCategories()
    if (categories.length > 0) {
      this.setState({
        currentCategory: categories[0]
      })
    }
  }

  /**
   * 切换症状选择
   */
  handleToggleSymptom = (symptomId: string) => {
    const { selectedSymptoms } = this.state
    const newSelected = new Set(selectedSymptoms)

    if (newSelected.has(symptomId)) {
      newSelected.delete(symptomId)
    } else {
      newSelected.add(symptomId)
    }

    this.setState({ selectedSymptoms: newSelected })
  }

  /**
   * 切换分类
   */
  handleSwitchCategory = (category: SymptomCategory) => {
    this.setState({ currentCategory: category })
  }

  /**
   * 获取当前分类的症状
   */
  getCurrentSymptoms = () => {
    const { currentCategory } = this.state
    if (!currentCategory) return []
    return getSymptomsByCategory(currentCategory)
  }

  /**
   * 获取分类选中的数量
   */
  getCategoryCount = (category: SymptomCategory): number => {
    const { selectedSymptoms } = this.state
    const symptoms = getSymptomsByCategory(category)
    return symptoms.filter(s => selectedSymptoms.has(s.id)).length
  }

  /**
   * 提交自检
   */
  handleSubmit = async () => {
    const { selectedSymptoms } = this.state

    if (selectedSymptoms.size === 0) {
      Taro.showToast({
        title: '请至少选择一个症状',
        icon: 'none'
      })
      return
    }

    const symptomIds = Array.from(selectedSymptoms)
    const totalScore = calculateHealthScore(symptomIds)
    const elementScores = calculateElementScores(symptomIds)
    const level = getHealthLevel(totalScore)

    // 保存记录
    const record: CheckRecord = {
      id: Date.now().toString(),
      userId: 'current_user', // 暂时使用固定ID
      symptoms: symptomIds,
      totalScore,
      level,
      elementScores,
      checkTime: Date.now()
    }

    try {
      await StorageManager.addCheckRecord(record)

      // 跳转到结果页面
      Taro.navigateTo({
        url: `/pages/result/index?recordId=${record.id}`
      })
    } catch (error) {
      Taro.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }

  /**
   * 返回首页
   */
  handleBack = () => {
    Taro.navigateBack()
  }

  render() {
    const { selectedSymptoms, currentCategory } = this.state
    const categories = getAllCategories()
    const currentSymptoms = this.getCurrentSymptoms()

    return (
      <View className='check-page'>
        {/* 头部 */}
        <View className='header'>
          <Text className='header-title'>症状自检</Text>
          <Text className='header-subtitle'>请选择您当前的身体症状</Text>
        </View>

        {/* 分类导航 */}
        <View className='category-nav'>
          <ScrollView scrollX className='category-scroll'>
            <View className='category-list'>
              {categories.map(category => (
                <View
                  key={category}
                  className={`category-item ${currentCategory === category ? 'active' : ''}`}
                  onClick={() => this.handleSwitchCategory(category)}
                >
                  <Text className='category-name'>{CATEGORY_NAMES[category]}</Text>
                  {this.getCategoryCount(category) > 0 && (
                    <View className='category-badge'>{this.getCategoryCount(category)}</View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 症状列表 */}
        <ScrollView scrollY className='symptom-list'>
          <View className='symptom-container'>
            {currentSymptoms.map(symptom => (
              <View
                key={symptom.id}
                className={`symptom-item ${selectedSymptoms.has(symptom.id) ? 'selected' : ''}`}
                onClick={() => this.handleToggleSymptom(symptom.id)}
              >
                <View className='symptom-icon'>{symptom.icon}</View>
                <View className='symptom-info'>
                  <Text className='symptom-name'>{symptom.name}</Text>
                  <Text className='symptom-score'>-{symptom.score}分</Text>
                </View>
                <View className='symptom-checkbox'>
                  {selectedSymptoms.has(symptom.id) && <Text className='checkbox-icon'>✓</Text>}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 底部操作栏 */}
        <View className='footer'>
          <View className='selected-info'>
            <Text className='selected-count'>已选择 {selectedSymptoms.size} 项</Text>
          </View>
          <Button
            className={`submit-btn ${selectedSymptoms.size === 0 ? 'disabled' : ''}`}
            onClick={this.handleSubmit}
            disabled={selectedSymptoms.size === 0}
          >
            生成健康报告
          </Button>
        </View>
      </View>
    )
  }
}
