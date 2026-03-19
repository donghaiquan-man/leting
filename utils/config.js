module.exports = {
  // 全局配置
  config: {
    appName: '乐听',
    version: '1.0.0',
    author: 'donghaiquan-man'
  },

  // 主题配置
  themes: {
    light: 'light',
    dark: 'dark'
  },

  // 定时关闭选项（分钟）
  sleepTimerOptions: [
    { label: '5分钟', value: 5 },
    { label: '15分钟', value: 15 },
    { label: '30分钟', value: 30 },
    { label: '1小时', value: 60 },
    { label: '关闭', value: 0 }
  ],

  // 存储键名
  storageKeys: {
    isDarkMode: 'isDarkMode',
    themeColors: 'themeColors',
    favorites: 'favorites',
    playlist: 'playlist',
    currentIndex: 'currentIndex',
    playHistory: 'playHistory'
  },

  // 默认主题色
  defaultPrimaryColor: '#d43c33'
};
