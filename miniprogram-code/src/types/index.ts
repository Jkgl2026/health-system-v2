// 用户信息
export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  gender: number // 0: 未知, 1: 男, 2: 女
  city: string
  country: string
  language: string
  createTime: number
}

// 症状分类
export enum SymptomCategory {
  HEAD = 'head', // 头部
  SLEEP = 'sleep', // 睡眠
  DIGESTION = 'digestion', // 消化
  PHYSICAL = 'physical', // 体力
  PSYCHOLOGICAL = 'psychological', // 心理
  HEART = 'heart' // 心脏
}

// 症状项
export interface Symptom {
  id: string
  category: SymptomCategory
  name: string
  score: number // 扣分值
  icon?: string
}

// 自检记录
export interface CheckRecord {
  id: string
  userId: string
  symptoms: string[] // 选中的症状ID数组
  totalScore: number // 总分（基础分100 - 扣分）
  level: HealthLevel
  elementScores: {
    [key: string]: number // 各维度得分
  }
  checkTime: number
  note?: string
}

// 健康等级
export enum HealthLevel {
  EXCELLENT = 'excellent', // 优秀
  GOOD = 'good', // 良好
  AVERAGE = 'average', // 一般
  ATTENTION = 'attention', // 需要关注
  MEDICAL = 'medical' // 建议就医
}

// 健康建议
export interface HealthAdvice {
  level: HealthLevel
  title: string
  content: string[]
}

// 健康趋势数据
export interface TrendData {
  date: string
  score: number
}

// 健康统计
export interface HealthStats {
  totalChecks: number
  averageScore: number
  highestScore: number
  lowestScore: number
  recentLevel: HealthLevel
}

// 健康贴士
export interface HealthTip {
  id: string
  title: string
  content: string
  category: string
  createTime: number
}
