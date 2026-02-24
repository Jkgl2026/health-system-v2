import { Component } from 'react'
import { View, Text, ScrollView, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { UserInfo, CheckRecord } from '../../types'
import StorageManager from '../../utils/storage'
import './index.scss'

interface MyPageState {
  userInfo: UserInfo | null
  isLogin: boolean
  stats: {
    totalChecks: number
    averageScore: number
  }
}

export default class MyPage extends Component<{}, MyPageState> {
  state: MyPageState = {
    userInfo: null,
    isLogin: false,
    stats: {
      totalChecks: 0,
      averageScore: 0
    }
  }

  componentDidShow() {
    this.loadUserInfo()
    this.loadStats()
  }

  /**
   * 加载用户信息
   */
  loadUserInfo = async () => {
    try {
      const userInfo = await StorageManager.getUserInfo()
      const isLogin = !!userInfo
      this.setState({
        userInfo,
        isLogin
      })
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  }

  /**
   * 加载统计数据
   */
  loadStats = async () => {
    try {
      const records = await StorageManager.getCheckRecords()
      const totalChecks = records.length
      const averageScore =
        totalChecks > 0
          ? Math.round(records.reduce((sum, r) => sum + r.totalScore, 0) / totalChecks)
          : 0

      this.setState({
        stats: {
          totalChecks,
          averageScore
        }
      })
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  }

  /**
   * 微信登录
   */
  handleLogin = () => {
    Taro.getUserProfile({
      desc: '用于完善用户资料',
      success: async (res) => {
        const { userInfo } = res

        // 保存用户信息
        const newUserInfo: UserInfo = {
          id: Date.now().toString(),
          nickname: userInfo.nickName || '未设置',
          avatar: userInfo.avatarUrl || '',
          gender: userInfo.gender || 0,
          city: userInfo.city || '',
          country: userInfo.country || '',
          language: userInfo.language || 'zh_CN',
          createTime: Date.now()
        }

        try {
          await StorageManager.setUserInfo(newUserInfo)
          this.setState({
            userInfo: newUserInfo,
            isLogin: true
          })

          Taro.showToast({
            title: '登录成功',
            icon: 'success'
          })
        } catch (error) {
          console.error('保存用户信息失败:', error)
          Taro.showToast({
            title: '登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
        Taro.showToast({
          title: '已取消登录',
          icon: 'none'
        })
      }
    })
  }

  /**
   * 退出登录
   */
  handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await StorageManager.clearUserInfo()
            this.setState({
              userInfo: null,
              isLogin: false
            })

            Taro.showToast({
              title: '已退出登录',
              icon: 'success'
            })
          } catch (error) {
            console.error('退出登录失败:', error)
            Taro.showToast({
              title: '退出失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }

  /**
   * 导出数据
   */
  handleExportData = async () => {
    try {
      const records = await StorageManager.getCheckRecords()
      const userInfo = await StorageManager.getUserInfo()

      if (records.length === 0) {
        Taro.showToast({
          title: '暂无数据可导出',
          icon: 'none'
        })
        return
      }

      const exportData = {
        userInfo,
        records,
        exportTime: new Date().toISOString()
      }

      // 生成文件内容
      const content = JSON.stringify(exportData, null, 2)

      // 保存到临时文件
      const fs = Taro.getFileSystemManager()
      const filePath = `${Taro.env.USER_DATA_PATH}/health_check_backup_${Date.now()}.json`

      fs.writeFileSync(filePath, content, 'utf8')

      // 保存到手机
      Taro.saveFile({
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
    } catch (error) {
      console.error('导出数据失败:', error)
      Taro.showToast({
        title: '导出失败',
        icon: 'none'
      })
    }
  }

  /**
   * 导入数据
   */
  handleImportData = () => {
    Taro.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success: async (res) => {
        const { tempFiles } = res
        if (!tempFiles || tempFiles.length === 0) {
          return
        }

        const file = tempFiles[0]

        try {
          const fs = Taro.getFileSystemManager()
          const content = fs.readFileSync(file.path, 'utf8')
          const data = JSON.parse(content)

          // 验证数据格式
          if (!data.records || !Array.isArray(data.records)) {
            throw new Error('数据格式不正确')
          }

          Taro.showModal({
            title: '确认导入',
            content: `将导入 ${data.records.length} 条自检记录，是否继续？`,
            success: async (res) => {
              if (res.confirm) {
                try {
                  // 合并数据
                  const existingRecords = await StorageManager.getCheckRecords()
                  const existingIds = new Set(existingRecords.map(r => r.id))
                  const newRecords = data.records.filter(
                    (r: CheckRecord) => !existingIds.has(r.id)
                  )

                  // 保存用户信息
                  if (data.userInfo) {
                    await StorageManager.setUserInfo(data.userInfo)
                  }

                  // 保存记录
                  for (const record of newRecords) {
                    await StorageManager.addCheckRecord(record)
                  }

                  this.loadUserInfo()
                  this.loadStats()

                  Taro.showToast({
                    title: `成功导入 ${newRecords.length} 条记录`,
                    icon: 'success'
                  })
                } catch (error) {
                  console.error('导入数据失败:', error)
                  Taro.showToast({
                    title: '导入失败',
                    icon: 'none'
                  })
                }
              }
            }
          })
        } catch (error) {
          console.error('读取文件失败:', error)
          Taro.showToast({
            title: '文件格式错误',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('选择文件失败:', err)
        if (err.errMsg.includes('cancel')) {
          return
        }
        Taro.showToast({
          title: '选择文件失败',
          icon: 'none'
        })
      }
    })
  }

  /**
   * 清空数据
   */
  handleClearData = () => {
    Taro.showModal({
      title: '清空数据',
      content: '确定要清空所有自检记录吗？此操作不可恢复！',
      confirmColor: '#f5222d',
      success: async (res) => {
        if (res.confirm) {
          try {
            await StorageManager.clearCheckRecords()

            this.loadStats()

            Taro.showToast({
              title: '数据已清空',
              icon: 'success'
            })
          } catch (error) {
            console.error('清空数据失败:', error)
            Taro.showToast({
              title: '清空失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }

  /**
   * 关于应用
   */
  handleAbout = () => {
    Taro.showModal({
      title: '关于健康自检',
      content: '版本：v1.0.0\n\n这是一个帮助您了解自身健康状况的小程序，通过症状自检，获取健康评分和建议。\n\n定期自检，关注健康！',
      showCancel: false
    })
  }

  /**
   * 跳转到自检页面
   */
  handleGoCheck = () => {
    Taro.switchTab({ url: '/pages/check/index' })
  }

  /**
   * 跳转到分析页面
   */
  handleGoAnalysis = () => {
    Taro.switchTab({ url: '/pages/analysis/index' })
  }

  render() {
    const { userInfo, isLogin, stats } = this.state

    return (
      <View className='my-page'>
        <ScrollView scrollY className='content-scroll'>
          {/* 用户信息卡片 */}
          <View className='user-card'>
            {isLogin && userInfo ? (
              <>
                <Image
                  className='user-avatar'
                  src={userInfo.avatar}
                  mode='aspectFill'
                />
                <View className='user-info'>
                  <Text className='user-name'>{userInfo.nickname}</Text>
                  <Text className='user-meta'>
                    {userInfo.city ? `${userInfo.city} · ` : ''}
                    自检 {stats.totalChecks} 次
                  </Text>
                </View>
                <View className='logout-btn' onClick={this.handleLogout}>
                  <Text className='logout-icon'>🚪</Text>
                </View>
              </>
            ) : (
              <View className='login-prompt'>
                <Text className='login-icon'>👋</Text>
                <Text className='login-text'>登录后体验完整功能</Text>
                <Button className='login-btn' onClick={this.handleLogin}>
                  微信登录
                </Button>
              </View>
            )}
          </View>

          {/* 统计数据卡片 */}
          <View className='stats-section'>
            <View className='stat-item' onClick={this.handleGoCheck}>
              <Text className='stat-icon'>📋</Text>
              <View className='stat-content'>
                <Text className='stat-value'>{stats.totalChecks}</Text>
                <Text className='stat-label'>自检次数</Text>
              </View>
            </View>
            <View className='stat-item' onClick={this.handleGoAnalysis}>
              <Text className='stat-icon'>📊</Text>
              <View className='stat-content'>
                <Text className='stat-value'>{stats.averageScore}</Text>
                <Text className='stat-label'>平均分</Text>
              </View>
            </View>
          </View>

          {/* 功能菜单 */}
          <View className='menu-section'>
            <View className='menu-title'>
              <Text className='title-text'>数据管理</Text>
            </View>

            <View className='menu-list'>
              <View className='menu-item' onClick={this.handleExportData}>
                <View className='menu-item-left'>
                  <Text className='menu-icon'>📤</Text>
                  <Text className='menu-text'>导出数据</Text>
                </View>
                <Text className='menu-arrow'>›</Text>
              </View>

              <View className='menu-item' onClick={this.handleImportData}>
                <View className='menu-item-left'>
                  <Text className='menu-icon'>📥</Text>
                  <Text className='menu-text'>导入数据</Text>
                </View>
                <Text className='menu-arrow'>›</Text>
              </View>

              <View className='menu-item danger' onClick={this.handleClearData}>
                <View className='menu-item-left'>
                  <Text className='menu-icon'>🗑️</Text>
                  <Text className='menu-text'>清空数据</Text>
                </View>
                <Text className='menu-arrow'>›</Text>
              </View>
            </View>
          </View>

          <View className='menu-section'>
            <View className='menu-title'>
              <Text className='title-text'>其他</Text>
            </View>

            <View className='menu-list'>
              <View className='menu-item' onClick={this.handleAbout}>
                <View className='menu-item-left'>
                  <Text className='menu-icon'>ℹ️</Text>
                  <Text className='menu-text'>关于应用</Text>
                </View>
                <Text className='menu-arrow'>›</Text>
              </View>
            </View>
          </View>

          {/* 底部信息 */}
          <View className='footer-info'>
            <Text className='footer-text'>健康自检小程序 v1.0.0</Text>
            <Text className='footer-text'>定期自检，关注健康</Text>
          </View>
        </ScrollView>
      </View>
    )
  }
}

// 分享配置
MyPage.config = {
  navigationBarTitleText: '我的',
  enableShareAppMessage: true
}
