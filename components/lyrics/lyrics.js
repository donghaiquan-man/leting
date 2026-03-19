Component({
  properties: {
    lyrics: {
      type: Array,
      value: []
    },
    currentTime: {
      type: Number,
      value: 0
    }
  },

  data: {
    activeIndex: -1,
    themeColors: null
  },

  lifetimes: {
    attached() {
      this.updateTheme();
    }
  },

  observers: {
    'currentTime': function(time) {
      this.updateActiveLyric(time);
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

    updateActiveLyric(time) {
      const lyrics = this.properties.lyrics;
      if (!lyrics || lyrics.length === 0) {
        this.setData({ activeIndex: -1 });
        return;
      }

      let activeIndex = -1;
      for (let i = lyrics.length - 1; i >= 0; i--) {
        if (time >= lyrics[i].time) {
          activeIndex = i;
          break;
        }
      }

      if (activeIndex !== this.data.activeIndex) {
        this.setData({ activeIndex });
        
        if (activeIndex >= 0) {
          const scrollIndex = Math.max(0, activeIndex - 2);
          this.setData({ scrollTop: scrollIndex * 120 });
        }
      }
    }
  }
});
