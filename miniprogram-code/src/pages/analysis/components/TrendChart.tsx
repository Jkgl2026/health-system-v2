import { Component } from 'react'
import { View, Canvas, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { CheckRecord } from '../../../types'
import './TrendChart.scss'

interface TrendChartProps {
  records: CheckRecord[]
  height?: number
}

interface TrendChartState {
  canvasWidth: number
  canvasHeight: number
}

export default class TrendChart extends Component<TrendChartProps, TrendChartState> {
  canvasId: string
  ctx: any = null

  constructor(props: TrendChartProps) {
    super(props)
    this.state = {
      canvasWidth: 0,
      canvasHeight: 0
    }
    this.canvasId = `trendChart_${Date.now()}`
  }

  componentDidMount() {
    this.initCanvas()
  }

  componentDidUpdate(prevProps: TrendChartProps) {
    if (prevProps.records !== this.props.records) {
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
        // 获取Canvas上下文
        this.ctx = Taro.createCanvasContext(this.canvasId, this.$scope)
        this.ctx.scale(pixelRatio, pixelRatio)
        this.drawChart()
      }
    )
  }

  /**
   * 绘制趋势图
   */
  drawChart = () => {
    const { records } = this.props
    const { canvasWidth, canvasHeight } = this.state

    if (!this.ctx || records.length === 0) {
      return
    }

    const ctx = this.ctx
    const padding = 40
    const chartWidth = canvasWidth - padding * 2
    const chartHeight = canvasHeight - padding * 2

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // 获取最近7条记录
    const recentRecords = records.slice(-7)
    const scores = recentRecords.map(r => r.totalScore)
    const dates = recentRecords.map(r => {
      const date = new Date(r.checkTime)
      return `${date.getMonth() + 1}/${date.getDate()}`
    })

    // 计算Y轴范围
    const minScore = 0
    const maxScore = 100
    const scoreRange = maxScore - minScore

    // 绘制背景网格线
    ctx.setStrokeStyle('#e5e7eb')
    ctx.setLineWidth(1)
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i
      ctx.moveTo(padding, y)
      ctx.lineTo(canvasWidth - padding, y)
    }
    ctx.stroke()

    // 绘制Y轴刻度
    ctx.setFillStyle('#9ca3af')
    ctx.setFontSize(10)
    for (let i = 0; i <= 4; i++) {
      const score = maxScore - (scoreRange / 4) * i
      const y = padding + (chartHeight / 4) * i
      ctx.fillText(score.toString(), 5, y + 4)
    }

    // 绘制渐变填充区域
    const gradient = ctx.createLinearGradient(0, padding, 0, canvasHeight - padding)
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.3)')
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0)')

    ctx.beginPath()
    scores.forEach((score, index) => {
      const x = padding + (chartWidth / (scores.length - 1 || 1)) * index
      const y = padding + chartHeight - ((score - minScore) / scoreRange) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, canvasHeight - padding)
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    const lastX = padding + chartWidth
    ctx.lineTo(lastX, canvasHeight - padding)
    ctx.closePath()
    ctx.setFillStyle(gradient)
    ctx.fill()

    // 绘制折线
    ctx.beginPath()
    ctx.setStrokeStyle('#7c3aed')
    ctx.setLineWidth(3)
    ctx.setLineCap('round')
    ctx.setLineJoin('round')

    scores.forEach((score, index) => {
      const x = padding + (chartWidth / (scores.length - 1 || 1)) * index
      const y = padding + chartHeight - ((score - minScore) / scoreRange) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // 绘制数据点
    scores.forEach((score, index) => {
      const x = padding + (chartWidth / (scores.length - 1 || 1)) * index
      const y = padding + chartHeight - ((score - minScore) / scoreRange) * chartHeight

      // 外圈
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.setFillStyle('#ffffff')
      ctx.fill()
      ctx.setStrokeStyle('#7c3aed')
      ctx.setLineWidth(2)
      ctx.stroke()

      // 内圈
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.setFillStyle('#7c3aed')
      ctx.fill()

      // 绘制分数标签
      ctx.setFillStyle('#7c3aed')
      ctx.setFontSize(12)
      ctx.setTextAlign('center')
      ctx.fillText(score.toString(), x, y - 12)

      // 绘制X轴日期
      ctx.setFillStyle('#9ca3af')
      ctx.setFontSize(10)
      ctx.setTextAlign('center')
      ctx.fillText(dates[index], x, canvasHeight - padding + 20)
    })

    ctx.draw()
  }

  render() {
    const { canvasWidth, canvasHeight } = this.state
    const { records } = this.props

    return (
      <View className='trend-chart'>
        {records.length > 0 ? (
          <Canvas
            canvasId={this.canvasId}
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`
            }}
            id={this.canvasId}
          />
        ) : (
          <View className='empty-state'>
            <Text className='empty-text'>暂无数据</Text>
            <Text className='empty-hint'>完成自检后可查看趋势</Text>
          </View>
        )}
      </View>
    )
  }
}
