const { player } = require('../../utils/player.js');
const songs = require('../../utils/data.js');
const app = getApp();

Page({
  data: {
    themeColors: null,
    playlist: [],
    currentIndex: -1,
    isPlaying: false,
    isEditMode: false
  },

  onLoad() {
    this.updateTheme();
    this.loadPlaylist();
  },

  onShow() {
    this.updateTheme();
    this.setData({
      currentIndex: player.currentIndex,
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
    wx.setNavigationBarTitle({ title: '播放列表' });
  },

  loadPlaylist() {
    const playlist = wx.getStorageSync('playlist') || songs;
    this.setData({ playlist });
    
    player.on('playStateChange', (isPlaying) => {
      this.setData({ isPlaying });
    });

    player.on('timeUpdate', () => {
      this.setData({ currentIndex: player.currentIndex });
    });
  },

  playSong(e) {
    const { index } = e.currentTarget.dataset;
    const song = this.data.playlist[index];
    
    player.setPlaylist(this.data.playlist, index);
    player.playSong(song, index);
    
    this.setData({ currentIndex: index });
  },

  playAll() {
    if (this.data.playlist.length === 0) return;
    player.setPlaylist(this.data.playlist, 0);
    player.playSong(this.data.playlist[0], 0);
    this.setData({ currentIndex: 0 });
  },

  shufflePlay() {
    if (this.data.playlist.length === 0) return;
    const randomIndex = Math.floor(Math.random() * this.data.playlist.length);
    player.setPlayMode('random');
    player.setPlaylist(this.data.playlist, randomIndex);
    player.playSong(this.data.playlist[randomIndex], randomIndex);
    this.setData({ currentIndex: randomIndex });
  },

  deleteSong(e) {
    const { index } = e.currentTarget.dataset;
    const playlist = [...this.data.playlist];
    const deletedSong = playlist.splice(index, 1)[0];
    
    this.setData({ playlist });
    wx.setStorageSync('playlist', playlist);
    
    // 如果删除的是当前播放的歌曲
    if (index === this.data.currentIndex) {
      if (playlist.length > 0) {
        const newIndex = Math.min(index, playlist.length - 1);
        player.setPlaylist(playlist, newIndex);
        player.playSong(playlist[newIndex], newIndex);
        this.setData({ currentIndex: newIndex });
      } else {
        player.pause();
        this.setData({ currentIndex: -1 });
      }
    } else if (index < this.data.currentIndex) {
      this.setData({ currentIndex: this.data.currentIndex - 1 });
    }
    
    wx.showToast({
      title: '已删除',
      icon: 'none'
    });
  },

  moveToTop(e) {
    const { index } = e.currentTarget.dataset;
    const playlist = [...this.data.playlist];
    const song = playlist.splice(index, 1)[0];
    playlist.unshift(song);
    
    this.setData({ playlist });
    wx.setStorageSync('playlist', playlist);
    
    // 如果移动的是当前歌曲，更新播放器
    if (index === this.data.currentIndex) {
      player.setPlaylist(playlist, 0);
      this.setData({ currentIndex: 0 });
    } else if (index < this.data.currentIndex) {
      player.setPlaylist(playlist, this.data.currentIndex);
      this.setData({ currentIndex: this.data.currentIndex - index });
    } else {
      player.setPlaylist(playlist, this.data.currentIndex);
    }
    
    wx.showToast({
      title: '已置顶',
      icon: 'none'
    });
  },

  toggleEditMode() {
    this.setData({ isEditMode: !this.data.isEditMode });
  }
});
