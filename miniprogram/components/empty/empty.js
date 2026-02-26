// components/empty/empty.js
Component({
  properties: {
    icon: {
      type: String,
      value: '📭'
    },
    title: {
      type: String,
      value: '暂无数据'
    },
    desc: {
      type: String,
      value: ''
    },
    showButton: {
      type: Boolean,
      value: false
    },
    buttonText: {
      type: String,
      value: '重新加载'
    }
  },

  methods: {
    onAction() {
      this.triggerEvent('action');
    }
  }
});
