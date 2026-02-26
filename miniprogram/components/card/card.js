// components/card/card.js
Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    icon: {
      type: String,
      value: ''
    },
    shadow: {
      type: Boolean,
      value: true
    },
    showMore: {
      type: Boolean,
      value: false
    },
    customClass: {
      type: String,
      value: ''
    }
  },

  methods: {
    onMore() {
      this.triggerEvent('more');
    }
  }
});
