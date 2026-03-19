// 播放器核心类
class Player {
  constructor() {
    this.audioContext = wx.createInnerAudioContext();
    this.isPlaying = false;
    this.currentSong = null;
    this.currentIndex = -1;
    this.playlist = [];
    this.playMode = 'list'; // list, single, random
    this.sleepTimer = null;
    this.sleepTimerRemaining = 0;
    this.listeners = {};
    
    this.initEventListeners();
  }

  initEventListeners() {
    this.audioContext.onPlay(() => {
      this.isPlaying = true;
      this.emit('playStateChange', true);
    });

    this.audioContext.onPause(() => {
      this.isPlaying = false;
      this.emit('playStateChange', false);
    });

    this.audioContext.onEnded(() => {
      this.isPlaying = false;
      this.emit('ended');
      this.next();
    });

    this.audioContext.onTimeUpdate(() => {
      const currentTime = this.audioContext.currentTime;
      const duration = this.audioContext.duration;
      this.emit('timeUpdate', {
        currentTime,
        duration: isNaN(duration) ? 0 : duration
      });
    });

    this.audioContext.onError((err) => {
      console.error('Audio Error:', err);
      this.isPlaying = false;
      this.emit('playStateChange', false);
    });
  }

  // 订阅事件
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // 取消订阅
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  // 触发事件
  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(...args));
    }
  }

  // 设置播放列表
  setPlaylist(songs, startIndex = 0) {
    this.playlist = songs;
    this.currentIndex = startIndex;
    if (songs.length > 0) {
      this.currentSong = songs[startIndex];
    }
    wx.setStorageSync('playlist', songs);
    wx.setStorageSync('currentIndex', startIndex);
  }

  // 播放指定歌曲
  playSong(song, index) {
    this.currentSong = song;
    this.currentIndex = index;
    this.audioContext.src = song.audio;
    this.audioContext.play();
    this.savePlayHistory(song);
  }

  // 播放
  play() {
    if (this.audioContext.src) {
      this.audioContext.play();
    }
  }

  // 暂停
  pause() {
    this.audioContext.pause();
  }

  // 切换播放/暂停
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // 上一首
  prev() {
    if (this.playlist.length === 0) return;
    
    if (this.playMode === 'random') {
      this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    }
    
    const song = this.playlist[this.currentIndex];
    this.playSong(song, this.currentIndex);
    wx.setStorageSync('currentIndex', this.currentIndex);
  }

  // 下一首
  next() {
    if (this.playlist.length === 0) return;
    
    if (this.playMode === 'random') {
      this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    }
    
    const song = this.playlist[this.currentIndex];
    this.playSong(song, this.currentIndex);
    wx.setStorageSync('currentIndex', this.currentIndex);
  }

  // 跳转到指定时间
  seek(time) {
    this.audioContext.seek(time);
  }

  // 设置播放模式
  setPlayMode(mode) {
    this.playMode = mode;
  }

  // 获取当前播放时间
  getCurrentTime() {
    return this.audioContext.currentTime;
  }

  // 获取总时长
  getDuration() {
    return this.audioContext.duration || 0;
  }

  // 定时关闭
  setSleepTimer(minutes) {
    if (this.sleepTimer) {
      clearInterval(this.sleepTimer);
      this.sleepTimer = null;
    }
    
    if (minutes <= 0) {
      this.sleepTimerRemaining = 0;
      this.emit('sleepTimerUpdate', 0);
      return;
    }
    
    this.sleepTimerRemaining = minutes * 60;
    this.emit('sleepTimerUpdate', this.sleepTimerRemaining);
    
    this.sleepTimer = setInterval(() => {
      this.sleepTimerRemaining--;
      this.emit('sleepTimerUpdate', this.sleepTimerRemaining);
      
      if (this.sleepTimerRemaining <= 0) {
        clearInterval(this.sleepTimer);
        this.sleepTimer = null;
        this.pause();
        this.emit('sleepTimerEnd');
      }
    }, 1000);
  }

  // 保存播放历史
  savePlayHistory(song) {
    let history = wx.getStorageSync('playHistory') || [];
    history = history.filter(item => item.id !== song.id);
    history.unshift(song);
    if (history.length > 50) {
      history = history.slice(0, 50);
    }
    wx.setStorageSync('playHistory', history);
  }

  // 获取播放历史
  getPlayHistory() {
    return wx.getStorageSync('playHistory') || [];
  }

  // 格式化时间
  static formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
      return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // 解析歌词
  static parseLyrics(lyricsString) {
    if (!lyricsString) return [];
    
    const lines = lyricsString.split('\n');
    const lyrics = [];
    
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    
    lines.forEach(line => {
      const match = line.match(timeRegex);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const ms = parseInt(match[3].padEnd(3, '0'));
        const time = minutes * 60 + seconds + ms / 1000;
        const text = line.replace(timeRegex, '').trim();
        if (text) {
          lyrics.push({ time, text });
        }
      }
    });
    
    return lyrics.sort((a, b) => a.time - b.time);
  }

  // 销毁
  destroy() {
    if (this.sleepTimer) {
      clearInterval(this.sleepTimer);
    }
    this.audioContext.destroy();
  }
}

// 创建全局播放器实例
const player = new Player();

module.exports = {
  Player,
  player
};
