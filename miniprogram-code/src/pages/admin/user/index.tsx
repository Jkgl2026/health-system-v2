import { Component } from 'react'
import { View, Text, ScrollView, Input, Image, Modal } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { UserInfo, CheckRecord, HealthLevel } from '../../../types'
import AdminAuth from '../../../utils/adminAuth'
import { getHealthLevelInfo } from '../../../utils/healthScore'
import './index.scss'

interface UserManagementPageState {
  loading: boolean
  refreshing: boolean
  users: UserInfo[]
  filteredUsers: UserInfo[]
  searchKeyword: string
  allRecords: CheckRecord[]
  selectedUser: UserInfo | null
  userRecords: CheckRecord[]
  showDetailModal: boolean
  exporting: boolean
}

export default class UserManagementPage extends Component<{}, UserManagementPageState> {
  state: UserManagementPageState = {
    loading: true,
    refreshing: false,
    users: [],
    filteredUsers: [],
    searchKeyword: '',
    allRecords: [],
    selectedUser: null,
    userRecords: [],
    showDetailModal: false,
    exporting: false
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

      this.setState({
        users,
        filteredUsers: users,
        allRecords: records,
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
   * 处理搜索
   */
  handleSearch = (e: any) => {
    const keyword = e.detail.value.trim().toLowerCase()
    const { users } = this.state

    const filtered = users.filter(user =>
      user.nickname.toLowerCase().includes(keyword)
    )

    this.setState({
      searchKeyword: keyword,
      filteredUsers: filtered
    })
  }

  /**
   * 清除搜索
   */
  handleClearSearch = () => {
    this.setState({
      searchKeyword: '',
      filteredUsers: this.state.users
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
   * 获取用户的自检次数
   */
  getUserCheckCount = (userId: string): number => {
    const { allRecords } = this.state
    return allRecords.filter(r => r.userId === userId).length
  }

  /**
   * 获取用户最新的健康等级
   */
  getUserLatestLevel = (userId: string): HealthLevel | null => {
    const { allRecords } = this.state
    const userRecords = allRecords.filter(r => r.userId === userId)
    
    if (userRecords.length === 0) {
      return null
    }

    // 按时间倒序排序，获取最新的
    const sorted = userRecords.sort((a, b) => b.checkTime - a.checkTime)
    return sorted[0].level
  }

  /**
   * 获取用户最后自检时间
   */
  getUserLastCheckTime = (userId: string): string => {
    const { allRecords } = this.state
    const userRecords = allRecords.filter(r => r.userId === userId)
    
    if (userRecords.length === 0) {
      return '未自检'
    }

    const sorted = userRecords.sort((a, b) => b.checkTime - a.checkTime)
    return this.formatDate(sorted[0].checkTime)
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
   * 查看用户详情
   */
  handleViewDetail = (user: UserInfo) => {
    const { allRecords } = this.state
    const userRecords = allRecords.filter(r => r.userId === user.id)

    // 按时间倒序排序
    userRecords.sort((a, b) => b.checkTime - a.checkTime)

    this.setState({
      selectedUser: user,
      userRecords,
      showDetailModal: true
    })
  }

  /**
   * 关闭详情弹窗
   */
  handleCloseDetail = () => {
    this.setState({
      showDetailModal: false,
      selectedUser: null,
      userRecords: []
    })
  }

  /**
   * 导出单个用户数据
   */
  handleExportUser = async (user: UserInfo) => {
    const { allRecords } = this.state
    const userRecords = allRecords.filter(r => r.userId === user.id)

    const exportData = {
      userInfo: user,
      records: userRecords,
      exportTime: new Date().toISOString()
    }

    await this.downloadData(exportData, `user_${user.id}_${Date.now()}.json`)
  }

  /**
   * 批量导出所有用户数据
   */
  handleExportAll = async () => {
    this.setState({ exporting: true })

    try {
      const { users, allRecords } = this.state

      if (users.length === 0) {
        Taro.showToast({
          title: '暂无数据可导出',
          icon: 'none'
        })
        this.setState({ exporting: false })
        return
      }

      const exportData = {
        users,
        records: allRecords,
        exportTime: new Date().toISOString(),
        totalUsers: users.length,
        totalRecords: allRecords.length
      }

      await this.downloadData(exportData, `all_users_${Date.now()}.json`)

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
      filteredUsers,
      searchKeyword,
      selectedUser,
      userRecords,
      showDetailModal,
      exporting
    } = this.state

    return (
      <View className='user-management-page'>
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
            <Text className='page-title'>用户管理</Text>
            <View className='export-all-btn' onClick={this.handleExportAll}>
              <Text className='export-text'>{exporting ? '导出中...' : '导出全部'}</Text>
            </View>
          </View>

          {/* 搜索栏 */}
          <View className='search-bar'>
            <View className='search-input-wrapper'>
              <Text className='search-icon'>🔍</Text>
              <Input
                className='search-input'
                placeholder='搜索用户昵称'
                value={searchKeyword}
                onInput={this.handleSearch}
                placeholderClass='search-placeholder'
              />
              {searchKeyword && (
                <View className='clear-btn' onClick={this.handleClearSearch}>
                  <Text className='clear-icon'>✕</Text>
                </View>
              )}
            </View>
          </View>

          {/* 用户列表 */}
          <View className='user-list'>
            {loading ? (
              <View className='loading-container'>
                <Text className='loading-text'>加载中...</Text>
              </View>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <View key={user.id} className='user-card' onClick={() => this.handleViewDetail(user)}>
                  <Image
                    className='user-avatar'
                    src={user.avatar || 'https://via.placeholder.com/80'}
                    mode='aspectFill'
                  />
                  <View className='user-info'>
                    <Text className='user-name'>{user.nickname}</Text>
                    <View className='user-meta'>
                      <Text className='meta-item'>
                        自检 {this.getUserCheckCount(user.id)} 次
                      </Text>
                      <Text className='meta-item'>·</Text>
                      <Text className='meta-item'>
                        {this.getUserLastCheckTime(user.id)}
                      </Text>
                    </View>
                  </View>
                  <View className='user-level-badge' style={{
                    backgroundColor: this.getLevelColor(this.getUserLatestLevel(user.id) || HealthLevel.AVERAGE)
                  }}>
                    <Text className='level-text'>
                      {this.getUserLatestLevel(user.id) ? getHealthLevelInfo(this.getUserLatestLevel(user.id)!).label : '未自检'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View className='empty-state'>
                <Text className='empty-icon'>👥</Text>
                <Text className='empty-text'>
                  {searchKeyword ? '未找到匹配的用户' : '暂无用户'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* 用户详情弹窗 */}
        <Modal
          title='用户详情'
          visible={showDetailModal}
          onClose={this.handleCloseDetail}
          maskClosable
          content={
            <View className='detail-modal'>
              {selectedUser && (
                <>
                  <View className='detail-header'>
                    <Image
                      className='detail-avatar'
                      src={selectedUser.avatar || 'https://via.placeholder.com/80'}
                      mode='aspectFill'
                    />
                    <View className='detail-user-info'>
                      <Text className='detail-name'>{selectedUser.nickname}</Text>
                      <Text className='detail-meta'>
                        {selectedUser.city ? `${selectedUser.city} · ` : ''}
                        {selectedUser.language || '中文'}
                      </Text>
                    </View>
                  </View>

                  <View className='detail-stats'>
                    <View className='detail-stat-item'>
                      <Text className='detail-stat-value'>{userRecords.length}</Text>
                      <Text className='detail-stat-label'>自检次数</Text>
                    </View>
                    <View className='detail-stat-item'>
                      <Text className='detail-stat-value'>
                        {userRecords.length > 0
                          ? Math.round(userRecords.reduce((sum, r) => sum + r.totalScore, 0) / userRecords.length)
                          : 0}
                      </Text>
                      <Text className='detail-stat-label'>平均分</Text>
                    </View>
                  </View>

                  <View className='detail-records'>
                    <Text className='detail-records-title'>自检记录 ({userRecords.length})</Text>

                    {userRecords.length > 0 ? (
                      userRecords.map(record => (
                        <View key={record.id} className='detail-record-item'>
                          <View className='record-left'>
                            <Text className='record-score' style={{
                              color: this.getLevelColor(record.level)
                            }}>
                              {record.totalScore}分
                            </Text>
                            <Text className='record-date'>{this.formatDate(record.checkTime)}</Text>
                          </View>
                          <View className='record-level-badge' style={{
                            backgroundColor: this.getLevelColor(record.level)
                          }}>
                            {getHealthLevelInfo(record.level).label}
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text className='detail-records-empty'>暂无自检记录</Text>
                    )}
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
UserManagementPage.config = {
  navigationBarTitleText: '用户管理',
  navigationBarBackgroundColor: '#7c3aed',
  navigationBarTextStyle: 'white',
  enableShareAppMessage: true
}
