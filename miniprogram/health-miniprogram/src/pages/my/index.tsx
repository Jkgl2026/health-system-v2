import { Component } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default class My extends Component {
  state = {
    userInfo: null as any,
    isLogged: false
  }

  componentDidMount () {
    this.checkLogin()
  }

  checkLogin = () => {
    // 检查是否登录
    const userInfo = Taro.getStorageSync('userInfo')
    if (userInfo) {
      this.setState({
        userInfo,
        isLogged: true
      })
    }
  }

  handleLogin = () => {
    // 微信登录
    Taro.getUserProfile({
      desc: '用于完善用户信息'
    }).then(res => {
      console.log(res)
      this.setState({
        userInfo: res.userInfo,
        isLogged: true
      })
      // 保存用户信息
      Taro.setStorageSync('userInfo', res.userInfo)
      Taro.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }).catch(err => {
      console.error(err)
    })
  }

  handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setState({
            userInfo: null,
            isLogged: false
          })
          Taro.removeStorageSync('userInfo')
          Taro.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }

  handleResetData = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要清除所有数据吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除所有本地数据
          Taro.clearStorage()
          this.setState({
            userInfo: null,
            isLogged: false
          })
          Taro.showToast({
            title: '数据已清除',
            icon: 'success'
          })
        }
      }
    })
  }

  render () {
    const { userInfo, isLogged } = this.state

    return (
      <View className='my-container'>
        {/* 用户信息 */}
        <View className='user-section'>
          {isLogged && userInfo ? (
            <View className='user-info'>
              <View className='user-avatar'>
                <Image
                  className='avatar-img'
                  src={userInfo.avatarUrl}
                  mode='aspectFill'
                />
              </View>
              <View className='user-details'>
                <Text className='user-name'>{userInfo.nickName}</Text>
                <Text className='user-desc'>已登录</Text>
              </View>
            </View>
          ) : (
            <View className='login-prompt'>
              <Text className='login-text'>登录后可保存健康数据</Text>
              <Button className='login-btn' onClick={this.handleLogin}>
                微信登录
              </Button>
            </View>
          )}
        </View>

        {/* 功能列表 */}
        <View className='menu-section'>
          <View className='menu-item'>
            <Text className='menu-icon'>📊</Text>
            <Text className='menu-title'>健康报告</Text>
            <Text className='menu-arrow'>›</Text>
          </View>

          <View className='menu-item'>
            <Text className='menu-icon'>⚙️</Text>
            <Text className='menu-title'>设置</Text>
            <Text className='menu-arrow'>›</Text>
          </View>

          <View className='menu-item'>
            <Text className='menu-icon'>📝</Text>
            <Text className='menu-title'>意见反馈</Text>
            <Text className='menu-arrow'>›</Text>
          </View>

          <View className='menu-item'>
            <Text className='menu-icon'>ℹ️</Text>
            <Text className='menu-title'>关于我们</Text>
            <Text className='menu-arrow'>›</Text>
          </View>
        </View>

        {/* 底部按钮 */}
        {isLogged && (
          <View className='footer-section'>
            <Button className='reset-btn' onClick={this.handleResetData}>
              清除数据
            </Button>
            <Button className='logout-btn' onClick={this.handleLogout}>
              退出登录
            </Button>
          </View>
        )}
      </View>
    )
  }
}
