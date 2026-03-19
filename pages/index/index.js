const { player, Player } = require('../../utils/player.js');
const songs = require('../../utils/data.js');
const app = getApp();

Page({
  data: {
    themeColors: null,
    songs: [],
    currentSong: null,
    isPlaying: false,
    progress: 0,
    isDarkMode: false
  },

  onLoad() {
    this.initPlayer();
    this.updateTheme();
  },

  onShow() {
    this.updateTheme();
    this.loadSongs();
    this.setData({
      currentSong: player.currentSong,
      isPlaying: player.isPlaying
    });
  },

  updateTheme() {
    const theme = app.globalData.isDarkMode ? 'dark' : 'light';
    this.setData({
      themeColors: app.globalData.themeColors[theme],
      isDarkMode: app.globalData.isDarkMode
    });

    wx.setNavigationBarColor({
      frontColor: app.globalData.isDarkMode ? '#ffffff' : '#000000',
      backgroundColor: app.globalData.themeColors[theme].background
    });
    wx.setNavigationBarTitle({ title: '乐听' });
  },

  loadSongs() {
    // 加载收藏状态
    const favorites = wx.getStorageSync('favorites') || [];
    const favoriteIds = favorites.map(s => s.id);

    const songsWithFav = songs.map(song => ({
      ...song,
      isFavorite: favoriteIds.includes(song.id)
    }));

    this.setData({ songs: songsWithFav });
  },

  initPlayer() {
    player.setPlaylist(songs, 0);
    player.playSong(songs[0], 0);

    player.on('playStateChange', (isPlaying) => {
      this.setData({ isPlaying });
    });

    player.on('timeUpdate', ({ currentTime, duration }) => {
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
      this.setData({ progress });
    });

    player.on('songChange', () => {
      this.setData({ currentSong: player.currentSong });
      this.loadSongs(); // 更新播放状态
    });

    player.on('ended', () => {
      this.setData({ isPlaying: false });
    });

    this.setData({
      currentSong: player.currentSong,
      songs: songs.map(song => ({ ...song, isFavorite: false }))
    });
    this.loadSongs();
  },

  onSongTap(e) {
    const { index } = e.currentTarget.dataset;
    const song = this.data.songs[index];

    player.setPlaylist(this.data.songs, index);
    player.playSong(song, index);

    this.setData({ currentSong: song });
  },

  onPlayTap() {
    player.togglePlay();
  },

  onPrevTap() {
    player.prev();
    this.setData({ currentSong: player.currentSong });
    this.loadSongs();
  },

  onNextTap() {
    player.next();
    this.setData({ currentSong: player.currentSong });
    this.loadSongs();
  },

  toggleFavorite(e) {
    const { index } = e.currentTarget.dataset;
    const songs = [...this.data.songs];
    const song = songs[index];

    let favorites = wx.getStorageSync('favorites') || [];
    const favIndex = favorites.findIndex(s => s.id === song.id);

    if (favIndex >= 0) {
      favorites.splice(favIndex, 1);
      songs[index].isFavorite = false;
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      favorites.unshift(song);
      songs[index].isFavorite = true;
      wx.showToast({ title: '已添加收藏', icon: 'none' });
    }

    wx.setStorageSync('favorites', favorites);
    this.setData({ songs });
  },

  toggleTheme() {
    app.toggleTheme();
    this.updateTheme();
  }
});
