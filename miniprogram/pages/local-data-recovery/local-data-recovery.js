// pages/local-data-recovery/local-data-recovery.js

// 存储项配置
const STORAGE_CONFIG = [
  { key: 'userId', name: '用户ID' },
  { key: 'userData', name: '用户信息' },
  { key: 'selectedSymptoms', name: '症状检查记录' },
  { key: 'healthAnalysis', name: '健康分析结果' },
  { key: 'choiceData', name: '方案选择' },
  { key: 'requirementsData', name: '四个要求' },
  { key: 'sevenQuestionsAnswers', name: '健康七问答案' },
  { key: 'badHabitsChecklist', name: '不良习惯清单' },
  { key: 'symptoms300Checklist', name: '300症状清单' },
  { key: 'adminLoggedIn', name: '管理员登录状态' },
  { key: 'adminInfo', name: '管理员信息' },
];

Page({
  data: {
    storageItems: [],
    showDataModal: false,
    currentDataKey: '',
    currentDataContent: '',
    loading: false,
    loadingText: ''
  },

  onLoad() {
    this.refreshData();
  },

  onShow() {
    this.refreshData();
  },

  // 刷新数据
  refreshData() {
    const storageItems = STORAGE_CONFIG.map(item => {
      try {
        const data = wx.getStorageSync(item.key);
        let size = '';
        let hasData = false;

        if (data) {
          hasData = true;
          const str = typeof data === 'string' ? data : JSON.stringify(data);
          const bytes = new Blob([str]).size;
          if (bytes < 1024) {
            size = `${bytes} B`;
          } else if (bytes < 1024 * 1024) {
            size = `${(bytes / 1024).toFixed(2)} KB`;
          } else {
            size = `${(bytes / 1024 / 1024).toFixed(2)} MB`;
          }
        }

        return {
          ...item,
          hasData,
          size
        };
      } catch (e) {
        return {
          ...item,
          hasData: false,
          size: ''
        };
      }
    });

    this.setData({ storageItems });
  },

  // 查看数据
  viewData(e) {
    const key = e.currentTarget.dataset.key;
    try {
      const data = wx.getStorageSync(key);
      const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      this.setData({
        showDataModal: true,
        currentDataKey: key,
        currentDataContent: content
      });
    } catch (e) {
      wx.showToast({
        title: '读取数据失败',
        icon: 'none'
      });
    }
  },

  // 关闭弹窗
  closeDataModal() {
    this.setData({
      showDataModal: false,
      currentDataKey: '',
      currentDataContent: ''
    });
  },

  // 阻止冒泡
  stopPropagation() {},

  // 复制数据
  copyData() {
    wx.setClipboardData({
      data: this.data.currentDataContent,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 清除单个数据
  clearData(e) {
    const key = e.currentTarget.dataset.key;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要清除「${STORAGE_CONFIG.find(i => i.key === key)?.name}」的数据吗？`,
      confirmColor: '#dc2626',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync(key);
            wx.showToast({
              title: '已清除',
              icon: 'success'
            });
            this.refreshData();
          } catch (e) {
            wx.showToast({
              title: '清除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 导出所有数据
  exportAllData() {
    this.setData({ loading: true, loadingText: '正在导出...' });

    try {
      const exportData = {};
      
      STORAGE_CONFIG.forEach(item => {
        try {
          const data = wx.getStorageSync(item.key);
          if (data) {
            exportData[item.key] = {
              name: item.name,
              data: data,
              exportedAt: new Date().toISOString()
            };
          }
        } catch (e) {
          console.error(`导出 ${item.key} 失败:`, e);
        }
      });

      const content = JSON.stringify(exportData, null, 2);
      const fileName = `health-data-backup-${new Date().toISOString().slice(0, 10)}.json`;

      // 保存到临时文件
      const fs = wx.getFileSystemManager();
      const tempPath = `${wx.env.USER_DATA_PATH}/${fileName}`;
      
      fs.writeFile({
        filePath: tempPath,
        data: content,
        encoding: 'utf-8',
        success: () => {
          // 分享文件
          wx.shareFileMessage({
            filePath: tempPath,
            success: () => {
              this.setData({ loading: false });
              wx.showToast({
                title: '导出成功',
                icon: 'success'
              });
            },
            fail: (err) => {
              console.error('分享失败:', err);
              this.setData({ loading: false });
              wx.showModal({
                title: '导出成功',
                content: `数据已保存到：${tempPath}\n\n您可以手动复制此路径下的文件`,
                showCancel: false
              });
            }
          });
        },
        fail: (err) => {
          console.error('写入文件失败:', err);
          this.setData({ loading: false });
          wx.showToast({
            title: '导出失败',
            icon: 'none'
          });
        }
      });
    } catch (e) {
      console.error('导出失败:', e);
      this.setData({ loading: false });
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      });
    }
  },

  // 导入数据
  importData() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].path;
        
        this.setData({ loading: true, loadingText: '正在导入...' });

        const fs = wx.getFileSystemManager();
        fs.readFile({
          filePath: tempFilePath,
          encoding: 'utf-8',
          success: (data) => {
            try {
              const importData = JSON.parse(data.data);
              let importCount = 0;

              for (const [key, value] of Object.entries(importData)) {
                if (value && value.data) {
                  wx.setStorageSync(key, value.data);
                  importCount++;
                }
              }

              this.setData({ loading: false });
              wx.showToast({
                title: `成功导入 ${importCount} 项数据`,
                icon: 'success',
                duration: 2000
              });
              this.refreshData();
            } catch (e) {
              console.error('解析失败:', e);
              this.setData({ loading: false });
              wx.showToast({
                title: '文件格式错误',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            console.error('读取文件失败:', err);
            this.setData({ loading: false });
            wx.showToast({
              title: '读取文件失败',
              icon: 'none'
            });
          }
        });
      },
      fail: (err) => {
        console.log('用户取消选择');
      }
    });
  },

  // 清除所有数据
  clearAllData() {
    wx.showModal({
      title: '⚠️ 危险操作',
      content: '确定要清除所有本地数据吗？此操作不可恢复！建议先导出备份。',
      confirmColor: '#dc2626',
      confirmText: '全部清除',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '再次确认',
            content: '真的要清除所有数据吗？这将是最后一次确认！',
            confirmColor: '#dc2626',
            confirmText: '确认清除',
            success: (res2) => {
              if (res2.confirm) {
                this.setData({ loading: true, loadingText: '正在清除...' });

                try {
                  STORAGE_CONFIG.forEach(item => {
                    try {
                      wx.removeStorageSync(item.key);
                    } catch (e) {
                      console.error(`清除 ${item.key} 失败:`, e);
                    }
                  });

                  this.setData({ loading: false });
                  wx.showToast({
                    title: '已清除所有数据',
                    icon: 'success',
                    duration: 2000
                  });
                  this.refreshData();
                } catch (e) {
                  console.error('清除失败:', e);
                  this.setData({ loading: false });
                  wx.showToast({
                    title: '清除失败',
                    icon: 'none'
                  });
                }
              }
            }
          });
        }
      }
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});
