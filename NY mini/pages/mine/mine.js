import { get, post } from '../../utils/request'
const app = getApp()

Page({
  data: {
    darkMode: true,
    isLoggedIn: false,
    userInfo: null,
    posts: [],
    musicList: [],
    activeTab: 'post',
    editingPost: null,
    newTitle: '',
    newCategory: '生活',
    newContent: '',
    newCover: '',
    newMusicName: '',
    newMusicArtist: '',
    newMusicPath: ''
  },

  onShow() {
    this.setData({ darkMode: app.globalData.darkMode })
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    if (token) {
      this.setData({ isLoggedIn: true, userInfo })
      this.loadPosts()
      this.loadMusic()
    }
  },

  // 以下所有方法保持不变
  async loadPosts() {
    try {
      const res = await get('/admin.php', { action: 'get_posts' })
      this.setData({ posts: res.data })
    } catch(e) { console.error(e) }
  },

  async loadMusic() {
    try {
      const res = await get('/admin.php', { action: 'get_music' })
      this.setData({ musicList: res.data })
    } catch(e) { console.error(e) }
  },

  async editPost(e) {
    const id = e.currentTarget.dataset.id
    try {
      const res = await get('/admin.php', { action: 'get_post', id })
      const p = res.data
      this.setData({
        editingPost: id,
        newTitle: p.title,
        newCategory: p.category,
        newContent: p.content,
        newCover: p.cover || '',
        activeTab: 'post'
      })
      wx.pageScrollTo({ scrollTop: 0 })
    } catch(e) {
      wx.showToast({ title: '获取失败', icon: 'none' })
    }
  },

  cancelEdit() {
    this.setData({
      editingPost: null,
      newTitle: '', newCategory: '生活',
      newContent: '', newCover: ''
    })
  },

  async savePost() {
    const { newTitle, newCategory, newContent, newCover, editingPost } = this.data
    if (!newTitle || !newContent) {
      wx.showToast({ title: '标题和内容必填', icon: 'none' }); return
    }
    try {
      await post('/admin.php?action=save_post', {
        id: editingPost || 0,
        title: newTitle, category: newCategory,
        content: newContent, cover: newCover
      })
      wx.showToast({ title: editingPost ? '编辑成功' : '发布成功' })
      this.setData({ editingPost: null, newTitle: '', newContent: '', newCover: '' })
      this.loadPosts()
    } catch(e) {
      wx.showToast({ title: e.message || '操作失败', icon: 'none' })
    }
  },

  deletePost(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除', content: '删除后不可恢复',
      success: async (res) => {
        if (res.confirm) {
          await post('/admin.php?action=delete_post', { id })
          wx.showToast({ title: '已删除' })
          this.loadPosts()
        }
      }
    })
  },

  async addMusic() {
    const { newMusicName, newMusicArtist, newMusicPath } = this.data
    if (!newMusicName || !newMusicPath) {
      wx.showToast({ title: '歌名和路径必填', icon: 'none' }); return
    }
    try {
      await post('/admin.php?action=add_music', {
        name: newMusicName, artist: newMusicArtist, file_path: newMusicPath
      })
      wx.showToast({ title: '添加成功' })
      this.setData({ newMusicName: '', newMusicArtist: '', newMusicPath: '' })
      this.loadMusic()
    } catch(e) {
      wx.showToast({ title: '添加失败', icon: 'none' })
    }
  },

  deleteMusic(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      success: async (res) => {
        if (res.confirm) {
          await post('/admin.php?action=delete_music', { id })
          wx.showToast({ title: '已删除' })
          this.loadMusic()
        }
      }
    })
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  logout() {
    wx.showModal({
      title: '退出登录', content: '确定要退出吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          this.setData({ isLoggedIn: false, userInfo: null, posts: [], musicList: [] })
        }
      }
    })
  }
})