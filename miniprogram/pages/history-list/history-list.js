// pages/history-list/history-list.js
// 历史记录列表页面

const historyManager = require('../../utils/history-manager');

Page({
  data: {
    historyList: [],
    selectedIds: [],
    maxSelect: 5,
    isLoading: true,
    showDeleteModal: false,
    deleteTargetId: null,
    stats: {
      count: 0,
      avgScore: 0
    }
  },

  onLoad() {
    this.loadHistoryList();
  },

  onShow() {
    this.loadHistoryList();
  },

  loadHistoryList() {
    this.setData({ isLoading: true });
    
    const history = historyManager.getAllHistory();
    const stats = historyManager.getHistoryStats();
    
    // 格式化显示数据
    const historyList = history.map((record, index) => ({
      ...record,
      index: index + 1,
      elementNames: (record.healthElements || []).slice(0, 3).map(e => e.name).join('、'),
      scoreColor: this.getScoreColor(record.healthScore || record.summary?.score || 0)
    }));

    this.setData({
      historyList,
      stats,
      selectedIds: [],
      isLoading: false
    });
  },

  getScoreColor(score) {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  },

  // 选择/取消选择记录
  toggleSelect(e) {
    const id = e.currentTarget.dataset.id;
    const selectedIds = [...this.data.selectedIds];
    const index = selectedIds.indexOf(id);

    if (index > -1) {
      // 已选中，取消选择
      selectedIds.splice(index, 1);
    } else {
      // 未选中，检查是否已达到最大选择数
      if (selectedIds.length >= this.data.maxSelect) {
        wx.showToast({
          title: `最多选择${this.data.maxSelect}条记录`,
          icon: 'none'
        });
        return;
      }
      selectedIds.push(id);
    }

    this.setData({ selectedIds });
  },

  // 全选
  selectAll() {
    const maxSelect = this.data.maxSelect;
    const allIds = this.data.historyList.slice(0, maxSelect).map(item => item.id);
    this.setData({ selectedIds: allIds });
  },

  // 取消全选
  clearSelect() {
    this.setData({ selectedIds: [] });
  },

  // 显示删除确认
  showDeleteConfirm(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      showDeleteModal: true,
      deleteTargetId: id
    });
  },

  // 隐藏删除确认
  hideDeleteModal() {
    this.setData({
      showDeleteModal: false,
      deleteTargetId: null
    });
  },

  // 确认删除
  confirmDelete() {
    const id = this.data.deleteTargetId;
    if (id) {
      const success = historyManager.deleteHistoryRecord(id);
      if (success) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        // 从选中列表中移除
        const selectedIds = this.data.selectedIds.filter(sid => sid !== id);
        this.setData({ selectedIds });
        this.loadHistoryList();
      } else {
        wx.showToast({
          title: '删除失败',
          icon: 'error'
        });
      }
    }
    this.hideDeleteModal();
  },

  // 开始对比
  startCompare() {
    if (this.data.selectedIds.length < 1) {
      wx.showToast({
        title: '请至少选择1条记录',
        icon: 'none'
      });
      return;
    }

    // 跳转到对比页面，传递选中的ID
    wx.navigateTo({
      url: `/pages/history-compare/history-compare?ids=${this.data.selectedIds.join(',')}`
    });
  },

  // 查看单条记录详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/history-detail/history-detail?id=${id}`
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '健康自检历史记录',
      path: '/pages/index/index'
    };
  }
});
