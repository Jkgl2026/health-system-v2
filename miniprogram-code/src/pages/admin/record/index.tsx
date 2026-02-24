import { Component } from 'react'
import { View, Text, ScrollView, Modal, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { UserInfo, CheckRecord, HealthLevel } from '../../../types'
import AdminAuth from '../../../utils/adminAuth'
import { getHealthLevelInfo, SYMPTOMS, CATEGORY_NAMES } from '../../../utils/healthScore'
import './index.scss'

interface RecordManagementPageState {
  loading: boolean
  refreshing: boolean
  allRecords: CheckRecord[]
  filteredRecords: CheckRecord[]
  users: UserInfo[]
  selectedRecord: CheckRecord | null
  selectedUserInfo: UserInfo | null
  showDetailModal: boolean
  exporting: boolean
  filterLevel: HealthLevel | 'all'
  filterTimeRange: number // 0: 全部, 1: 近7天, 2: 近30天, 3: 近90天
  timeRangeSelector: number[]
}

export default class RecordManagementPage extends Component<{}, RecordManagementPageState> {
  state: RecordManagementPageState = {
    loading: true,
    refreshing: false,
    allRecords: [],
    filteredRecords: [],
    users: [],
    selectedRecord: null,
    selectedUserInfo: null,
    showDetailModal: false,
    exporting: false,
    filterLevel: 'all',
    filterTimeRange: 0,
    timeRangeSelector: [0]
  }

  componentDidMount() {
    this.checkAuthAndLoadData()
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

      // 并行加载用户和记录
      const [users, records] = await Promise.all([
        this.loadUserInfo(),
        this.loadCheckRecords()
      ])

      // 按时间倒序排序
      records.sort((a, b) => b.checkTime - a.checkTime)

      this.setState({
        users,
        allRecords: records,
        filteredRecords: this.applyFilters(records),
        loading: false,
        refreshing: false
      })
    } catch (error) {
      console.error('加载数据失败:', error)
      this.setState({ loading: false, refreshing: false })
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
      const res = await Taro.getStorage({ key: 'user_info' })
      return [JSON.parse(res.data)]
    } catch (error) {
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
   * 应用筛选条件
   */
  applyFilters = (records: CheckRecord[]): CheckRecord[] => {
    let filtered = [...records]

    // 按健康等级筛选
    if (this.state.filterLevel !== 'all') {
      filtered = filtered.filter(r => r.level === this.state.filterLevel)
    }

    // 按时间范围筛选
    if (this.state.filterTimeRange !== 0) {
      const now = Date.now()
      const ranges = {
        1: 7 * 24 * 60 * 60 * 1000,   // 近7天
        2: 30 * 24 * 60 * 60 * 1000,  // 近30天
        3: 90 * 24 * 60 * 60 * 1000   // 近90天
      }
      const startTime = now - ranges[this.state.filterTimeRange]
      filtered = filtered.filter(r => r.checkTime >= startTime)
    }

    return filtered
  }

  /**
   * 处理健康等级筛选
   */
  handleLevelFilterChange = (e: any) => {
    const levels: (HealthLevel | 'all')[] = ['all', HealthLevel.EXCELLENT, HealthLevel.GOOD, HealthLevel.AVERAGE, HealthLevel.ATTENTION, HealthLevel.MEDICAL]
    const selectedLevel = levels[e.detail.value]
    
    this.setState({
      filterLevel: selectedLevel,
      filteredRecords: this.applyFilters(this.state.allRecords)
    })
  }

  /**
   * 处理时间范围筛选
   */
  handleTimeRangeChange = (e: any) => {
    const timeRange = e.detail.value[0]
    
    this.setState({
      filterTimeRange: timeRange,
      timeRangeSelector: [timeRange],
      filteredRecords: this.applyFilters(this.state.allRecords)
    })
  }

  /**
   * 重置筛选
   */
  handleResetFilters = () => {
    this.setState({
      filterLevel: 'all',
      filterTimeRange: 0,
      timeRangeSelector: [0],
      filteredRecords: this.state.allRecords
    })
  }

  /**
   * 下拉刷新
   */
  handleRefresh = async () => {
    this.setState({ refreshing: true })
    await this.loadData()
  }

  /**
   * 格式化日期
   */
  formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  /**
   * 格式化日期时间
   */
  formatDateTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
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
   * 获取用户信息
   */
  getUserInfo = (userId: string): UserInfo | null => {
    const user = this.state.users.find(u => u.id === userId)
    return user || null
  }

  /**
   * 查看记录详情
   */
  handleViewDetail = (record: CheckRecord) => {
    const userInfo = this.getUserInfo(record.userId)
    
    this.setState({
      selectedRecord: record,
      selectedUserInfo: userInfo,
      showDetailModal: true
    })
  }

  /**
   * 关闭详情弹窗
   */
  handleCloseDetail = () => {
    this.setState({
      showDetailModal: false,
      selectedRecord: null,
      selectedUserInfo: null
    })
  }

  /**
   * 导出记录数据
   */
  handleExportRecords = async () => {
    this.setState({ exporting: true })

    try {
      const { filteredRecords, users } = this.state

      if (filteredRecords.length === 0) {
        Taro.showToast({
          title: '暂无数据可导出',
          icon: 'none'
        })
        this.setState({ exporting: false })
        return
      }

      const exportData = {
        records: filteredRecords,
        users: users,
        exportTime: new Date().toISOString(),
        totalRecords: filteredRecords.length,
        filterInfo: {
          level: this.state.filterLevel,
          timeRange: this.state.filterTimeRange
        }
      }

      await this.downloadData(exportData, `records_${Date.now()}.json`)

      Taro.showToast({
        title: '导出成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('导出失败:', error)
      Taro.showToast({
        title: '导出失败',
        icon: 'none'
      })
    } finally {
      this.setState({ exporting: false })
    }
  }

  /**
   * 下载文件
   */
  downloadData = async (data: any, filename: string) => {
    const content = JSON.stringify(data, null, 2)
    const fs = Taro.getFileSystemManager()
    const filePath = `${Taro.env.USER_DATA_PATH}/${filename}`

    fs.writeFileSync(filePath, content, 'utf8')

    await Taro.saveFile({
      tempFilePath: filePath,
      success: (res) => {
        Taro.showModal({
          title: '导出成功',
          content: `文件已保存到：${res.savedFilePath}`,
          showCancel: false
        })
      },
      fail: (err) => {
        console.error('保存文件失败:', err)
        Taro.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    })
  }

  /**
   * 返回管理后台
   */
  handleBack = () => {
    Taro.redirectTo({ url: '/pages/admin/dashboard/index' })
  }

  render() {
    const {
      loading,
      refreshing,
      filteredRecords,
      selectedRecord,
      selectedUserInfo,
      showDetailModal,
      exporting,
      filterLevel,
      filterTimeRange,
      timeRangeSelector
    } = this.state

    // 筛选选项
    const levelOptions = ['全部', '优秀', '良好', '一般', '需要关注', '建议就医']
    const timeRangeOptions = ['全部时间', '近7天', '近30天', '近90天']

    return (
      <View className='record-management-page'>
        <ScrollView
          scrollY
          className='content-scroll'
          refresherEnabled
          refresherTriggered={refreshing}
          onRefresherRefresh={this.handleRefresh}
        >
          {/* 顶部操作栏 */}
          <View className='top-bar'>
            <View className='back-btn' onClick={this.handleBack}>
              <Text className='back-arrow'>←</Text>
            </View>
            <Text className='page-title'>记录管理</Text>
            <View className='export-btn' onClick={this.handleExportRecords}>
              <Text className='export-text'>{exporting ? '导出中...' : '导出记录'}</Text>
            </View>
          </View>

          {/* 筛选栏 */}
          <View className='filter-bar'>
            <View className='filter-item'>
              <Text className='filter-label'>健康等级：</Text>
              <Picker
                mode='selector'
                range={levelOptions}
                value={levelOptions.indexOf(filterLevel === 'all' ? '全部' : getHealthLevelInfo(filterLevel).label)}
                onChange={this.handleLevelFilterChange}
              >
                <View className='picker-value'>
                  <Text className='picker-text'>
                    {filterLevel === 'all' ? '全部' : getHealthLevelInfo(filterLevel).label}
                  </Text>
                  <Text className='picker-arrow'>▼</Text>
                </View>
              </Picker>
            </View>

            <View className='filter-item'>
              <Text className='filter-label'>时间范围：</Text>
              <Picker
                mode='selector'
                range={timeRangeOptions}
                value={timeRangeSelector}
                onChange={this.handleTimeRangeChange}
              >
                <View className='picker-value'>
                  <Text className='picker-text'>{timeRangeOptions[filterTimeRange]}</Text>
                  <Text className='picker-arrow'>▼</Text>
                </View>
              </Picker>
            </View>

            {(filterLevel !== 'all' || filterTimeRange !== 0) && (
              <View className='reset-btn' onClick={this.handleResetFilters}>
                <Text className='reset-text'>重置</Text>
              </View>
            )}
          </View>

          {/* 记录列表 */}
          <View className='record-list'>
            {loading ? (
              <View className='loading-container'>
                <Text className='loading-text'>加载中...</Text>
              </View>
            ) : filteredRecords.length > 0 ? (
              <>
                <View className='list-header'>
                  <Text className='list-count'>共 {filteredRecords.length} 条记录</Text>
                </View>
                {filteredRecords.map(record => {
                  const userInfo = this.getUserInfo(record.userId)
                  return (
                    <View key={record.id} className='record-card' onClick={() => this.handleViewDetail(record)}>
                      <View className='record-main'>
                        <View className='record-score-section'>
                          <Text className='record-score' style={{ color: this.getLevelColor(record.level) }}>
                            {record.totalScore}
                          </Text>
                          <Text className='score-unit'>分</Text>
                        </View>
                        <View className='record-info'>
                          <View className='record-top'>
                            <Text className='user-name'>{userInfo?.nickname || '未知用户'}</Text>
                            <View className='record-level-badge' style={{
                              backgroundColor: this.getLevelColor(record.level)
                            }}>
                              <Text className='level-text'>{getHealthLevelInfo(record.level).label}</Text>
                            </View>
                          </View>
                          <Text className='record-time'>{this.formatDate(record.checkTime)}</Text>
                          <Text className='record-symptoms'>症状：{record.symptoms.length} 项</Text>
                        </View>
                      </View>
                      <View className='record-arrow'>›</View>
                    </View>
                  )
                })}
              </>
            ) : (
              <View className='empty-state'>
                <Text className='empty-icon'>📋</Text>
                <Text className='empty-text'>暂无自检记录</Text>
                {(filterLevel !== 'all' || filterTimeRange !== 0) && (
                  <View className='empty-hint' onClick={this.handleResetFilters}>
                    <Text className='hint-text'>点击重置筛选条件</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* 记录详情弹窗 */}
        <Modal
          title='记录详情'
          visible={showDetailModal}
          onClose={this.handleCloseDetail}
          maskClosable
          content={
            <View className='detail-modal'>
              {selectedRecord && (
                <>
                  {/* 用户信息 */}
                  <View className='detail-user-section'>
                    <Text className='detail-section-title'>用户信息</Text>
                    <View className='detail-user-info'>
                      <Text className='detail-label'>昵称：</Text>
                      <Text className='detail-value'>{selectedUserInfo?.nickname || '未知用户'}</Text>
                    </View>
                    {selectedUserInfo?.city && (
                      <View className='detail-user-info'>
                        <Text className='detail-label'>城市：</Text>
                        <Text className='detail-value'>{selectedUserInfo.city}</Text>
                      </View>
                    )}
                  </View>

                  {/* 评分信息 */}
                  <View className='detail-score-section'>
                    <Text className='detail-section-title'>评分信息</Text>
                    <View className='score-display'>
                      <Text className='detail-score' style={{
                        color: this.getLevelColor(selectedRecord.level)
                      }}>
                        {selectedRecord.totalScore}
                      </Text>
                      <Text className='detail-score-unit'>分</Text>
                    </View>
                    <View className='detail-level-badge-large' style={{
                      backgroundColor: this.getLevelColor(selectedRecord.level)
                    }}>
                      <Text className='detail-level-text'>{getHealthLevelInfo(selectedRecord.level).label}</Text>
                    </View>
                    <Text className='detail-time'>{this.formatDateTime(selectedRecord.checkTime)}</Text>
                  </View>

                  {/* 各维度得分 */}
                  <View className='detail-elements-section'>
                    <Text className='detail-section-title'>各维度得分</Text>
                    <View className='elements-grid'>
                      {Object.entries(selectedRecord.elementScores).map(([category, score]) => (
                        <View key={category} className='element-item'>
                          <Text className='element-name'>{CATEGORY_NAMES[category]}</Text>
                          <Text className='element-score'>{score}分</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 症状列表 */}
                  <View className='detail-symptoms-section'>
                    <Text className='detail-section-title'>选中症状 ({selectedRecord.symptoms.length}项)</Text>
                    <View className='symptoms-list'>
                      {selectedRecord.symptoms.map(symptomId => {
                        const symptom = SYMPTOMS.find(s => s.id === symptomId)
                        if (!symptom) return null
                        return (
                          <View key={symptomId} className='symptom-tag'>
                            <Text className='symptom-icon'>{symptom.icon}</Text>
                            <Text className='symptom-name'>{symptom.name}</Text>
                            <Text className='symptom-score'>-{symptom.score}分</Text>
                          </View>
                        )
                      })}
                    </View>
                  </View>
                </>
              )}
            </View>
          }
        />
      </View>
    )
  }
}

// 分享配置
RecordManagementPage.config = {
  navigationBarTitleText: '记录管理',
  navigationBarBackgroundColor: '#7c3aed',
  navigationBarTextStyle: 'white',
  enableShareAppMessage: true
}
