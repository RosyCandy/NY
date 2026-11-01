import { get } from '../../utils/request.js'
const app = getApp()

Page({
  data: {
    darkMode: true,
    menuOpen: false,
    profile: {
      avatar: 'https://duoduo.best/assets/images/avatar.jpg',
      name: 'DuoDuo',
      bio: '记录生活的点点滴滴',
      postCount: 0,
      commentCount: 0
    },
    weather: {
      icon: '☁️',
      temp: '19',
      desc: '阴',
      city: '苏州',
      day: '22',
      weekday: '星期日',
      date: '2026.03'
    },
    music: null,
    activeCat: '',
    allPosts: [],
    posts: [],
    comments: []
  },

  onShow() {
    const darkMode = app.globalData.darkMode
    this.setData({ darkMode })
  },

  onLoad() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  },

  async loadData() {
    try {
      const [profileRes, postsRes, commentsRes, musicRes] = await Promise.all([
        get('/index.php?type=profile'),
        get('/index.php?type=posts'),
        get('/index.php?type=comments'),
        get('/index.php?type=music')
      ])
      if (profileRes.code === 0) this.setData({ profile: profileRes.data })
      if (postsRes.code === 0) this.setData({ posts: postsRes.data, allPosts: postsRes.data })
      if (commentsRes.code === 0) this.setData({ comments: commentsRes.data })
      if (musicRes.code === 0 && musicRes.data.length > 0) {
        this.setData({ music: musicRes.data[0] })
      }
    } catch (e) {
      console.error('加载失败', e)
    }
  },

  toggleTheme() {
    const darkMode = app.toggleTheme()
    this.setData({ darkMode })
    // 同步更新导航栏颜色
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: darkMode ? '#1a1a2e' : '#ffffff'
    })
  },

  toggleMenu() {
    this.setData({ menuOpen: !this.data.menuOpen })
  },

  goToPost(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/post/post?id=${id}` })
  },

  goCategory(e) {
    const cat = e.currentTarget.dataset.cat
    this.setData({ menuOpen: false, activeCat: cat })
    const filtered = cat ? this.data.allPosts.filter(p => p.category === cat) : this.data.allPosts
    this.setData({ posts: filtered })
    wx.pageScrollTo({ selector: '.section-header', duration: 300 })
  },

  filterCat(e) {
    const cat = e.currentTarget.dataset.cat
    this.setData({
      activeCat: cat,
      posts: cat ? this.data.allPosts.filter(p => p.category === cat) : this.data.allPosts
    })
  },

  goMusic() {
    wx.switchTab({ url: '/pages/music/music' })
  },

  goAbout() {
    this.setData({ menuOpen: false })
    wx.switchTab({ url: '/pages/mine/mine' })
  },

  goAI() {
    this.setData({ menuOpen: false })
    wx.navigateTo({ url: '/pages/chat/chat' })
  },

  goAdmin() {
    this.setData({ menuOpen: false })
  }
})