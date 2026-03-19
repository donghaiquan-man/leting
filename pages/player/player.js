const { player, Player } = require('../../utils/player.js');
const songs = require('../../utils/data.js');
const app = getApp();

Page({
  data: {
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    currentTimeText: '00:00',
    durationText: '00:00',
    showLyrics: false,
    lyrics: [],
    isFavorite: false,
    playMode: 'list',
    showModeSelect: false,
    showSleepModal: false,
    sleepTimerText: '',
    isDarkMode: false
  },

  onLoad() {
    this.setData({
      currentSong: player.currentSong || songs[0],
      isPlaying: player.isPlaying,
      playMode: player.playMode || 'list'
    });
    this.checkFavorite();
    this.parseLyrics();
    this.setBackgroundPlayback();
  },

  onShow() {
    this.setData({
      currentSong: player.currentSong,
      isPlaying: player.isPlaying,
      playMode: player.playMode || 'list'
    });
    this.checkFavorite();
    this.initPlayerListener();
    this.setBackgroundPlayback();
  },

  setBackgroundPlayback() {
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
  },

  initPlayerListener() {
    player.on('playStateChange', (isPlaying) => {
      this.setData({ isPlaying });
    });

    player.on('timeUpdate', ({ currentTime, duration }) => {
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
      this.setData({
        currentTime,
        duration,
        progress,
        currentTimeText: Player.formatTime(currentTime),
        durationText: Player.formatTime(duration)
      });
    });

    player.on('songChange', () => {
      this.setData({ currentSong: player.currentSong });
      this.checkFavorite();
      this.parseLyrics();
    });

    player.on('ended', () => {
      this.setData({ isPlaying: false });
    });

    player.on('sleepTimerUpdate', (remaining) => {
      this.setData({
        sleepTimerRemaining: remaining,
        sleepTimerText: remaining > 0 ? Player.formatTime(remaining) : ''
      });
    });

    player.on('sleepTimerEnd', () => {
      this.setData({ showSleepModal: false, sleepTimerText: '' });
      wx.showToast({ title: '定时关闭已生效', icon: 'none' });
    });
  },

  checkFavorite() {
    const favorites = wx.getStorageSync('favorites') || [];
    const isFav = favorites.some(s => s.id === player.currentSong?.id);
    this.setData({ isFavorite: isFav });
  },

  parseLyrics() {
    const lyrics = Player.parseLyrics(player.currentSong?.lyrics || '');
    this.setData({ lyrics });
  },

  goBack() {
    wx.navigateBack();
  },

  toggleMode() {
    this.setData({ showLyrics: !this.data.showLyrics });
  },

  onPlayTap() {
    player.togglePlay();
  },

  onPrevTap() {
    player.prev();
  },

  onNextTap() {
    player.next();
  },

  toggleFavorite() {
    const song = player.currentSong;
    if (!song) return;

    let favorites = wx.getStorageSync('favorites') || [];
    const favIndex = favorites.findIndex(s => s.id === song.id);

    if (favIndex >= 0) {
      favorites.splice(favIndex, 1);
      this.setData({ isFavorite: false });
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      favorites.unshift(song);
      this.setData({ isFavorite: true });
      wx.showToast({ title: '已添加收藏', icon: 'none' });
    }

    wx.setStorageSync('favorites', favorites);
  },

  downloadSong() {
    wx.showToast({ title: '下载功能开发中', icon: 'none' });
  },

  shareSong() {
    const song = player.currentSong;
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  showPlaylist() {
    wx.navigateTo({ url: '/pages/playlist/playlist' });
  },

  showComment() {
    wx.showToast({ title: '评论功能开发中', icon: 'none' });
  },

  onProgressStart(e) {
    this._progressTouching = true;
  },

  onProgressMove(e) {
    if (!this._progressTouching) return;
    const { width } = e.currentTarget.getBoundingClientRect?.() || { width: 1 };
    const { pageX } = e.touches[0];
    const { left } = e.currentTarget.getBoundingClientRect?.() || { left: 0 };
    const ratio = Math.max(0, Math.min(1, (pageX - left) / width));
    this.setData({ progress: ratio * 100 });
  },

  onProgressEnd(e) {
    if (!this._progressTouching) return;
    this._progressTouching = false;
    const { duration } = this.data;
    const time = (this.data.progress / 100) * duration;
    player.seek(time);
  },

  showModeSelect() {
    this.setData({ showModeSelect: true });
  },

  hideModeSelect() {
    this.setData({ showModeSelect: false });
  },

  selectMode(e) {
    const { mode } = e.currentTarget.dataset;
    player.setPlayMode(mode);
    this.setData({ playMode: mode, showModeSelect: false });
  },

  showSleepModal() {
    this.setData({ showSleepModal: true });
  },

  hideSleepModal() {
    this.setData({ showSleepModal: false });
  },

  setSleepTimer(e) {
    const { minutes } = e.currentTarget.dataset;
    player.setSleepTimer(minutes);
    this.setData({ showSleepModal: false });
    if (minutes > 0) {
      wx.showToast({ title: `将在 ${minutes} 分钟后关闭`, icon: 'none' });
    } else {
      wx.showToast({ title: '已关闭定时关闭', icon: 'none' });
    }
  },

  onUnload() {
    wx.setKeepScreenOn({ keepScreenOn: false });
  }
});
