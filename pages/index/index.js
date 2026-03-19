const { player, Player } = require('../../utils/player.js');
const songs = require('../../utils/data.js');
const app = getApp();

Page({
  data: {
    themeColors: null,
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    showLyrics: false,
    lyrics: [],
    showModeSelect: false,
    showSleepModal: false,
    playMode: 'list',
    playModeIndex: 0,
    sleepTimerRemaining: 0,
    sleepTimerText: ''
  },

  onLoad() {
    this.initPlayer();
    this.updateTheme();
  },

  onShow() {
    this.updateTheme();
    this.setData({
      currentSong: player.currentSong || songs[0],
      isPlaying: player.isPlaying
    });
  },

  updateTheme() {
    const theme = app.globalData.isDarkMode ? 'dark' : 'light';
    this.setData({
      themeColors: app.globalData.themeColors[theme],
      isDarkMode: app.globalData.isDarkMode
    });
    
    if (app.globalData.isDarkMode) {
      wx.pageScrollTo({ selector: '.index-page', duration: 0 });
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1a1a1a'
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#000000'
      });
    }
  },

  initPlayer() {
    player.setPlaylist(songs, 0);
    player.playSong(songs[0], 0);

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
      this.setData({
        showSleepModal: false,
        sleepTimerText: ''
      });
      wx.showToast({
        title: '定时关闭已生效',
        icon: 'none'
      });
    });

    this.setData({
      currentSong: player.currentSong,
      lyrics: Player.parseLyrics(player.currentSong?.lyrics || '')
    });
  },

  onPlayTap() {
    player.togglePlay();
  },

  onPrevTap() {
    player.prev();
    this.updateSongInfo();
  },

  onNextTap() {
    player.next();
    this.updateSongInfo();
  },

  updateSongInfo() {
    setTimeout(() => {
      this.setData({
        currentSong: player.currentSong,
        lyrics: Player.parseLyrics(player.currentSong?.lyrics || '')
      });
    }, 100);
  },

  onProgressTap(e) {
    const { duration } = this.data;
    const { x } = e.detail;
    const { width } = e.currentTarget.dataset;
    const time = (x / width) * duration;
    player.seek(time);
  },

  onProgressChange(e) {
    const { value } = e.detail;
    const { duration } = this.data;
    const time = (value / 100) * duration;
    player.seek(time);
  },

  toggleLyrics() {
    this.setData({
      showLyrics: !this.data.showLyrics
    });
  },

  toggleTheme() {
    app.toggleTheme();
    this.updateTheme();
  },

  showModeSelectModal() {
    this.setData({ showModeSelect: true });
  },

  hideModeSelectModal() {
    this.setData({ showModeSelect: false });
  },

  selectPlayMode(e) {
    const { mode } = e.currentTarget.dataset;
    const modeIndex = ['list', 'single', 'random'].indexOf(mode);
    player.setPlayMode(mode);
    this.setData({
      playMode: mode,
      playModeIndex: modeIndex,
      showModeSelect: false
    });
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
      wx.showToast({
        title: `将在 ${minutes} 分钟后关闭`,
        icon: 'none'
      });
    } else {
      wx.showToast({
        title: '已关闭定时关闭',
        icon: 'none'
      });
    }
  },

  onUnload() {
    // 保持播放器运行，不销毁
  }
});
