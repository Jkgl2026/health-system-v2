// pages/admin/user-detail/user-detail.js
const { adminAPI } = require('../../../utils/api');
const { calculateComprehensiveHealthScore } = require('../../../utils/health-score-calculator');
const { BODY_SYMPTOMS, BODY_SYMPTOMS_300, BAD_HABITS_CHECKLIST } = require('../../../utils/health-data');

Page({
  data: {
    userId: null,
    userInfo: null,
    checkHistory: [],
    healthAnalysis: null,
    symptomCheck: null,
    userChoice: null,
    requirements: null,
    healthScore: null,
    loading: true,
    activeTab: 'basic'
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ userId: options.id });
      this.loadUserDetail(options.id);
    }
  },

  // 加载用户详情
  async loadUserDetail(userId) {
    this.setData({ loading: true });

    try {
      const result = await adminAPI.getUserDetail(userId);
      
      if (result && result.success) {
        const data = result.data;
        
        // 处理用户基本信息
        const userInfo = this.formatUserInfo(data.user);
        
        // 处理检测历史
        const checkHistory = this.formatCheckHistory(data.symptomChecks || []);
        
        // 处理健康分析
        const healthAnalysis = data.healthAnalysis && data.healthAnalysis.length > 0 
          ? data.healthAnalysis[0] : null;
        
        // 处理症状检查
        const symptomCheck = data.symptomChecks && data.symptomChecks.length > 0 
          ? data.symptomChecks[0] : null;
        
        // 处理方案选择
        const userChoice = data.userChoices && data.userChoices.length > 0 
          ? data.userChoices[0] : null;
        
        // 处理四个要求
        const requirements = data.requirements || null;
        
        // 计算健康评分
        const healthScore = this.calculateHealthScore(data);
        
        this.setData({
          userInfo,
          checkHistory,
          healthAnalysis,
          symptomCheck,
          userChoice,
          requirements,
          healthScore,
          loading: false
        });
      }
    } catch (error) {
      console.error('加载用户详情失败:', error);
      
      // 使用模拟数据作为兜底
      const userInfo = {
        id: userId,
        name: '张三',
        phone: '13812341234',
        age: 35,
        gender: '男',
        height: 175,
        weight: 72,
        bmi: 23.5,
        registerDate: '2024-01-01',
        lastCheckDate: '2024-01-15'
      };

      const checkHistory = [
        { date: '2024-01-15', score: 85, symptoms: 5, habits: 8 },
        { date: '2024-01-08', score: 82, symptoms: 6, habits: 9 },
        { date: '2024-01-01', score: 78, symptoms: 8, habits: 12 }
      ];

      this.setData({
        userInfo,
        checkHistory,
        loading: false
      });
    }
  },

  // 格式化用户信息
  formatUserInfo(user) {
    if (!user) return null;
    
    const height = user.height || 0;
    const weight = user.weight || 0;
    const bmi = height > 0 ? (weight / Math.pow(height / 100, 2)).toFixed(1) : '--';
    
    return {
      id: user.id,
      name: user.name || '未知用户',
      phone: user.phone || '--',
      email: user.email || '--',
      age: user.age || '--',
      gender: user.gender || '--',
      height: height || '--',
      weight: weight || '--',
      bmi,
      registerDate: this.formatDate(user.createdAt),
      lastCheckDate: this.formatDate(user.updatedAt)
    };
  },

  // 格式化检测历史
  formatCheckHistory(symptomChecks) {
    if (!symptomChecks || symptomChecks.length === 0) return [];
    
    return symptomChecks.map(check => ({
      date: this.formatDate(check.checkedAt),
      score: check.totalScore || 0,
      symptoms: check.checkedSymptoms ? check.checkedSymptoms.length : 0,
      habits: 0,
      rawData: check
    }));
  },

  // 计算健康评分
  calculateHealthScore(data) {
    if (!data) return null;
    
    // 获取症状ID列表
    const symptomCheck = data.symptomChecks && data.symptomChecks.length > 0 
      ? data.symptomChecks[0] : null;
    const bodySymptomIds = symptomCheck?.checkedSymptoms?.map(id => parseInt(id)) || [];
    
    // 获取不良习惯ID列表
    const requirements = data.requirements;
    const habitIds = Array.isArray(requirements?.badHabitsChecklist) 
      ? requirements.badHabitsChecklist.map(id => parseInt(id)) : [];
    
    // 获取300症状ID列表
    const symptom300Ids = Array.isArray(requirements?.symptoms300Checklist) 
      ? requirements.symptoms300Checklist.map(id => parseInt(id)) : [];
    
    // 计算健康评分
    try {
      const result = calculateComprehensiveHealthScore({
        bodySymptomIds,
        habitIds,
        symptom300Ids
      });
      
      return {
        score: result.healthScore,
        status: result.healthStatus,
        statusColor: result.healthStatusColor,
        totalSymptoms: result.totalSymptoms,
        bodySymptomsCount: bodySymptomIds.length,
        habitsCount: habitIds.length,
        symptoms300Count: symptom300Ids.length,
        recommendations: result.recommendations
      };
    } catch (error) {
      console.error('计算健康评分失败:', error);
      return null;
    }
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 拨打电话
  callUser() {
    if (this.data.userInfo && this.data.userInfo.phone) {
      wx.makePhoneCall({
        phoneNumber: this.data.userInfo.phone.replace(/\*/g, '')
      });
    }
  },

  // 查看检测详情
  viewCheckDetail(e) {
    const date = e.currentTarget.dataset.date;
    wx.showToast({
      title: `查看${date}检测详情`,
      icon: 'none'
    });
  },

  // 删除用户
  deleteUser() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该用户吗？此操作不可恢复。',
      confirmColor: '#e74c3c',
      success: async (res) => {
        if (res.confirm) {
          try {
            await adminAPI.deleteUser(this.data.userId);
            wx.showToast({
              title: '已删除',
              icon: 'success'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1000);
          } catch (error) {
            wx.showToast({
              title: error.message || '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});
