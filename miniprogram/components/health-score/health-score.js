// components/health-score/health-score.js
Component({
  properties: {
    score: {
      type: Number,
      value: 0
    },
    showElements: {
      type: Boolean,
      value: false
    },
    elements: {
      type: Array,
      value: []
    },
    showRecommendations: {
      type: Boolean,
      value: false
    },
    recommendations: {
      type: Array,
      value: []
    }
  },

  data: {
    statusText: '',
    statusColor: '',
    colorClass: ''
  },

  observers: {
    'score': function(score) {
      this.updateStatus(score);
    }
  },

  methods: {
    updateStatus(score) {
      let statusText = '';
      let statusColor = '';
      let colorClass = '';

      if (score >= 85) {
        statusText = '优秀';
        statusColor = '#22c55e';
        colorClass = 'excellent';
      } else if (score >= 70) {
        statusText = '良好';
        statusColor = '#3b82f6';
        colorClass = 'good';
      } else if (score >= 50) {
        statusText = '一般';
        statusColor = '#eab308';
        colorClass = 'normal';
      } else if (score >= 30) {
        statusText = '需关注';
        statusColor = '#f97316';
        colorClass = 'attention';
      } else {
        statusText = '需调理';
        statusColor = '#ef4444';
        colorClass = 'warning';
      }

      this.setData({
        statusText,
        statusColor,
        colorClass
      });
    }
  }
});
