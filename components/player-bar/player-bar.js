Component({
  properties: {
    song: {
      type: Object,
      value: null
    },
    isPlaying: {
      type: Boolean,
      value: false
    },
    progress: {
      type: Number,
      value: 0
    }
  },

  data: {
    themeColors: null
  },

  lifetimes: {
    attached() {
      this.updateTheme();
    }
  },

  methods: {
    updateTheme() {
      const app = getApp();
      const theme = app.globalData.isDarkMode ? 'dark' : 'light';
      this.setData({
        themeColors: app.globalData.themeColors[theme]
      });
    },

    onPlayTap() {
      this.triggerEvent('play');
    },

    onPrevTap() {
      this.triggerEvent('prev');
    },

    onNextTap() {
      this.triggerEvent('next');
    },

    onAlbumTap() {
      this.triggerEvent('albumclick');
    }
  }
});
