// components/symptom-item/symptom-item.js
Component({
  properties: {
    id: {
      type: Number,
      value: 0
    },
    name: {
      type: String,
      value: ''
    },
    category: {
      type: String,
      value: ''
    },
    description: {
      type: String,
      value: ''
    },
    severity: {
      type: String,
      value: '' // mild, moderate, severe, emergency
    },
    checked: {
      type: Boolean,
      value: false
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },

  data: {
    severityText: ''
  },

  observers: {
    'severity': function(severity) {
      const severityMap = {
        mild: '轻微',
        moderate: '中等',
        severe: '严重',
        emergency: '紧急'
      };
      this.setData({
        severityText: severityMap[severity] || ''
      });
    }
  },

  methods: {
    onTap() {
      if (this.properties.disabled) return;
      
      this.triggerEvent('change', {
        id: this.properties.id,
        checked: !this.properties.checked
      });
    }
  }
});
