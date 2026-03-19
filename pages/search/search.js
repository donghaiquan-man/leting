const { player } = require('../../utils/player.js');
const songs = require('../../utils/data.js');
const app = getApp();

Page({
  data: {
    themeColors: null,
    searchKeyword: '',
    searchResults: [],
    searchHistory: [],
    hotSearch: [
      { text: '周杰伦', icon: '🔥' },
      { text: '稻香', icon: '🎵' },
      { text: '晴天', icon: '☀️' },
      { text: '青花瓷', icon: '🏺' },
      { text: '告白气球', icon: '🎈' },
      { text: '七里香', icon: '🌸' },
      { text: '简单爱', icon: '❤️' },
      { text: '夜曲', icon: '🌙' }
    ],
    isSearching: false
  },

  onLoad() {
    this.updateTheme();
    this.loadSearchHistory();
  },

  onShow() {
    this.updateTheme();
  },

  updateTheme() {
    const theme = app.globalData.isDarkMode ? 'dark' : 'light';
    this.setData({
      themeColors: app.globalData.themeColors[theme],
      isDarkMode: app.globalData.isDarkMode
    });
  },

  loadSearchHistory() {
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ searchHistory: history });
  },

  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    
    if (keyword.trim()) {
      this.search(keyword);
    } else {
      this.setData({ searchResults: [] });
    }
  },

  onSearchConfirm(e) {
    const keyword = e.detail.value || this.data.searchKeyword;
    if (keyword.trim()) {
      this.saveSearchHistory(keyword);
      this.search(keyword);
    }
  },

  onHotSearchTap(e) {
    const { text } = e.currentTarget.dataset;
    this.setData({ searchKeyword: text });
    this.saveSearchHistory(text);
    this.search(text);
  },

  search(keyword) {
    const results = songs.filter(song => 
      song.name.toLowerCase().includes(keyword.toLowerCase()) ||
      song.artist.toLowerCase().includes(keyword.toLowerCase()) ||
      song.album.toLowerCase().includes(keyword.toLowerCase())
    );
    this.setData({ searchResults: results });
  },

  saveSearchHistory(keyword) {
    let history = this.data.searchHistory;
    history = history.filter(item => item !== keyword);
    history.unshift(keyword);
    if (history.length > 20) {
      history = history.slice(0, 20);
    }
    this.setData({ searchHistory: history });
    wx.setStorageSync('searchHistory', history);
  },

  clearSearchHistory() {
    this.setData({ searchHistory: [] });
    wx.removeStorageSync('searchHistory');
  },

  onHistoryItemTap(e) {
    const { text } = e.currentTarget.dataset;
    this.setData({ searchKeyword: text });
    this.search(text);
  },

  playSong(e) {
    const { index } = e.currentTarget.dataset;
    const song = this.data.searchResults[index];
    
    // 保存到搜索历史
    this.saveSearchHistory(song.name);
    
    // 播放歌曲
    player.setPlaylist(this.data.searchResults, index);
    player.playSong(song, index);
    
    wx.showToast({
      title: '正在播放',
      icon: 'none'
    });
  },

  clearSearch() {
    this.setData({
      searchKeyword: '',
      searchResults: []
    });
  }
});
