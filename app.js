App({
  globalData: {
    isDarkMode: false,
    themeColors: {
      light: {
        primary: '#d43c33',
        background: '#f5f5f5',
        cardBackground: '#ffffff',
        text: '#333333',
        textSecondary: '#666666',
        border: '#e5e5e5',
        blurOverlay: 'rgba(255, 255, 255, 0.8)'
      },
      dark: {
        primary: '#d43c33',
        background: '#1a1a1a',
        cardBackground: '#2a2a2a',
        text: '#ffffff',
        textSecondary: '#999999',
        border: '#3a3a3a',
        blurOverlay: 'rgba(0, 0, 0, 0.6)'
      }
    }
  },

  onLaunch() {
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;
    this.globalData.isDarkMode = isDarkMode;
    this.updateTheme();
  },

  updateTheme() {
    const isDarkMode = this.globalData.isDarkMode;
    const theme = isDarkMode ? 'dark' : 'light';
    const colors = this.globalData.themeColors[theme];

    wx.setStorageSync('themeColors', colors);
    wx.setStorageSync('isDarkMode', isDarkMode);

    // 更新导航栏颜色
    wx.setNavigationBarColor({
      frontColor: isDarkMode ? '#ffffff' : '#000000',
      backgroundColor: colors.background
    });

    // 更新 TabBar 颜色
    wx.setTabBarStyle({
      color: isDarkMode ? '#999999' : '#999999',
      selectedColor: colors.primary,
      backgroundColor: colors.cardBackground,
      borderStyle: isDarkMode ? 'white' : 'white'
    });
  },

  toggleTheme() {
    this.globalData.isDarkMode = !this.globalData.isDarkMode;
    this.updateTheme();
    const pages = getCurrentPages();
    pages.forEach(page => {
      if (page.onShow) {
        page.onShow();
      }
    });
  }
});
