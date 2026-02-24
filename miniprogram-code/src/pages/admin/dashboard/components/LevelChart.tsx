import { Component } from 'react'
import { View, Canvas, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { HealthLevel } from '../../../../types'
import './LevelChart.scss'

interface LevelChartProps {
  data: {
    [key in HealthLevel]: number
  }
  height?: number
}

interface LevelChartState {
  canvasWidth: number
  canvasHeight: number
}

export default class LevelChart extends Component<LevelChartProps, LevelChartState> {
  canvasId: string
  ctx: any = null

  // 健康等级配置
  private static LEVEL_CONFIG = {
    [HealthLevel.EXCELLENT]: { label: '优秀', color: '#52c41a' },
    [HealthLevel.GOOD]: { label: '良好', color: '#1890ff' },
    [HealthLevel.AVERAGE]: { label: '一般', color: '#faad14' },
    [HealthLevel.ATTENTION]: { label: '需要关注', color: '#ff7a45' },
    [HealthLevel.MEDICAL]: { label: '建议就医', color: '#f5222d' }
  }

  constructor(props: LevelChartProps) {
    super(props)
    this.state = {
      canvasWidth: 0,
      canvasHeight: 0
    }
    this.canvasId = `levelChart_${Date.now()}`
  }

  componentDidMount() {
    this.initCanvas()
  }

  componentDidUpdate(prevProps: LevelChartProps) {
    if (prevProps.data !== this.props.data) {
      this.drawChart()
    }
  }

  /**
   * 初始化Canvas
   */
  initCanvas = () => {
    const systemInfo = Taro.getSystemInfoSync()
    const pixelRatio = systemInfo.pixelRatio || 1
    const canvasWidth = systemInfo.windowWidth - 96 // 减去padding
    const canvasHeight = this.props.height || 300

    this.setState(
      {
        canvasWidth,
        canvasHeight
      },
      () => {
        this.ctx = Taro.createCanvasContext(this.canvasId, this.$scope)
        this.ctx.scale(pixelRatio, pixelRatio)
        this.drawChart()
      }
    )
  }

  /**
   * 绘制图表
   */
  drawChart = () => {
    const { data } = this.props
    const { canvasWidth, canvasHeight } = this.state

    if (!this.ctx) {
      return
    }

    const ctx = this.ctx
    const padding = 40
    const chartWidth = canvasWidth - padding * 2
    const chartHeight = canvasHeight - padding * 2

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // 计算总数
    const total = Object.values(data).reduce((sum, val) => sum + val, 0)

    if (total === 0) {
      // 空数据提示
      ctx.setFillStyle('#9ca3af')
      ctx.setFontSize(14)
      ctx.setTextAlign('center')
      ctx.fillText('暂无数据', canvasWidth / 2, canvasHeight / 2)
      ctx.draw()
      return
    }

    // 绘制饼图
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const radius = Math.min(chartWidth, chartHeight) / 2 - 20

    let startAngle = -Math.PI / 2 // 从12点方向开始

    Object.entries(data).forEach(([level, count]) => {
      if (count === 0) return

      const config = LevelChart.LEVEL_CONFIG[level as HealthLevel]
      const sliceAngle = (count / total) * 2 * Math.PI
      const endAngle = startAngle + sliceAngle

      // 绘制扇形
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.setFillStyle(config.color)
      ctx.fill()

      // 绘制白色分隔线
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle)
      ctx.setStrokeStyle('#ffffff')
      ctx.setLineWidth(2)
      ctx.stroke()

      startAngle = endAngle
    })

    // 绘制中心圆（制作环形图）
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI)
    ctx.setFillStyle('#ffffff')
    ctx.fill()

    // 绘制中心文字
    ctx.setFillStyle('#7c3aed')
    ctx.setFontSize(20)
    ctx.setTextAlign('center')
    ctx.fillText('总人数', centerX, centerY - 10)

    ctx.setFontSize(28)
    ctx.fillText(total.toString(), centerX, centerY + 20)

    ctx.draw()
  }

  render() {
    const { canvasWidth, canvasHeight } = this.state

    return (
      <View className='level-chart'>
        <Canvas
          canvasId={this.canvasId}
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`
          }}
          id={this.canvasId}
        />
      </View>
    )
  }
}
