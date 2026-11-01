import { get } from '../../utils/request'
const app = getApp()

Page({
  data: {
    darkMode: true,
    musicList: [],
    currentIndex: 0,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0
  },

  onShow() {
    this.setData({ darkMode: app.globalData.darkMode })
  },

  onLoad() {
    this.loadMusic()
    this.audio = wx.createInnerAudioContext()
    // iPhone 静音键开着时默认不出声，音乐页应忽略静音开关
    this.audio.obeyMuteSwitch = false
    // 真机上设置 src 后立刻 play() 有时序问题，用 autoplay 代替
    this.audio.autoplay = true
    this.audio.onPlay(() => this.setData({ isPlaying: true }))
    this.audio.onPause(() => this.setData({ isPlaying: false }))
    this.audio.onTimeUpdate(() => {
      const currentTime = this.audio.currentTime
      const duration = this.audio.duration || 1
      const fmt = (s) => {
        s = Math.floor(s || 0)
        const m = Math.floor(s / 60)
        const sec = String(s % 60).padStart(2, '0')
        return `${m}:${sec}`
      }
      this.setData({
        currentTime: fmt(currentTime),
        duration: fmt(duration),
        progress: (currentTime / duration) * 100
      })
    })
    this.audio.onEnded(() => { this.nextSong() })
    this.audio.onError((e) => {
      console.error('播放错误', e.errCode, e.errMsg)
      // 当前音源加载失败时自动切换备用音源（m4a ↔ 原始文件）重试，全部失败才提示
      if (this._sources && this._sourceIdx < this._sources.length - 1) {
        this._sourceIdx += 1
        this.audio.src = this._sources[this._sourceIdx]
        return
      }
      wx.showToast({ title: `播放失败(${e.errCode})`, icon: 'none' })
    })
  },

  onUnload() { this.audio.destroy() },

  async loadMusic() {
    try {
      const res = await get('/index.php?type=music')
      if (res.code === 0 && res.data.length > 0) {
        this.setData({ musicList: res.data })
        this.loadSong(0)
      }
    } catch(e) { console.error(e) }
  },

  loadSong(index) {
    const song = this.data.musicList[index]
    if (!song) return
    // 备用音源列表：优先转码后的 m4a，失败自动回退原始文件
    this._sources = [song.file_url_m4a, song.file_url].filter(Boolean)
    this._sourceIdx = 0
    this.audio.src = this._sources[0]
    this.setData({ currentIndex: index, isPlaying: false, currentTime: '0:00', duration: '0:00', progress: 0 })
  },

  togglePlay() {
    if (this.data.isPlaying) {
      this.audio.pause()
      this.setData({ isPlaying: false })
    } else {
      this.audio.play()
      this.setData({ isPlaying: true })
    }
  },

  prevSong() {
    const { currentIndex, musicList } = this.data
    const newIndex = (currentIndex - 1 + musicList.length) % musicList.length
    this.loadSong(newIndex)
  },

  nextSong() {
    const { currentIndex, musicList } = this.data
    const newIndex = (currentIndex + 1) % musicList.length
    this.loadSong(newIndex)
  },

  selectSong(e) {
    const index = e.currentTarget.dataset.index
    this.loadSong(index)
  }
})