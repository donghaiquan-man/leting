const { player } = require('../../utils/player.js');
const songs = require('../../utils/data.js');
const app = getApp();

Page({
  data: {
    themeColors: null,
    favorites: [],
    playHistory: [],
    currentSong: null,
    isPlaying: false
  },

  onLoad() {
    this.updateTheme();
    this.loadFavorites();
    this.loadPlayHistory();
  },

  onShow() {
    this.updateTheme();
    this.loadFavorites();
    this.loadPlayHistory();
    this.setData({
      currentSong: player.currentSong,
      isPlaying: player.isPlaying
    });
  },

  updateTheme() {
    const theme = app.globalData.isDarkMode ? 'dark' : 'light';
    const colors = app.globalData.themeColors[theme];
    this.setData({
      themeColors: colors,
      isDarkMode: app.globalData.isDarkMode
    });

    wx.setNavigationBarColor({
      frontColor: app.globalData.isDarkMode ? '#ffffff' : '#000000',
      backgroundColor: colors.background
    });
    wx.setNavigationBarTitle({ title: '我的' });
  },

  loadFavorites() {
    const favorites = wx.getStorageSync('favorites') || [];
    this.setData({ favorites });
  },

  loadPlayHistory() {
    const playHistory = player.getPlayHistory();
    this.setData({ playHistory });
  },

  toggleFavorite(e) {
    const { index } = e.currentTarget.dataset;
    const favorites = [...this.data.favorites];
    const song = favorites[index];
    
    // 找到原始歌曲数据
    const originalSong = songs.find(s => s.id === song.id) || song;
    const songIndex = favorites.findIndex(s => s.id === originalSong.id);
    
    if (songIndex >= 0) {
      favorites.splice(songIndex, 1);
      wx.showToast({
        title: '已取消收藏',
        icon: 'none'
      });
    } else {
      favorites.unshift(originalSong);
      wx.showToast({
        title: '已添加收藏',
        icon: 'none'
      });
    }
    
    this.setData({ favorites });
    wx.setStorageSync('favorites', favorites);
  },

  playSong(e) {
    const { index } = e.currentTarget.dataset;
    const song = this.data.favorites[index];
    
    player.setPlaylist(this.data.favorites, index);
    player.playSong(song, index);
    
    this.setData({ currentSong: song });
    
    wx.showToast({
      title: '正在播放',
      icon: 'none'
    });
  },

  playHistorySong(e) {
    const { index } = e.currentTarget.dataset;
    const song = this.data.playHistory[index];
    
    player.setPlaylist(this.data.playHistory, index);
    player.playSong(song, index);
    
    this.setData({ currentSong: song });
    
    wx.showToast({
      title: '正在播放',
      icon: 'none'
    });
  },

  playAllFavorites() {
    if (this.data.favorites.length === 0) return;
    
    player.setPlaylist(this.data.favorites, 0);
    player.playSong(this.data.favorites[0], 0);
    
    wx.showToast({
      title: '开始播放收藏',
      icon: 'none'
    });
  },

  goToPlaylist() {
    wx.switchTab({
      url: '/pages/playlist/playlist'
    });
  },

  goToSearch() {
    wx.switchTab({
      url: '/pages/search/search'
    });
  }
});
