import { get } from '../../utils/request.js'
const app = getApp()

Page({
  data: {
    darkMode: true,
    post: null,
    comments: [],
    loading: true,
    commenting: false,
    commentContent: ''
  },

  onShow() {
    this.setData({ darkMode: app.globalData.darkMode })
  },

  onLoad(options) {
    const id = options.id
    if (id) this.loadPost(id)
  },

  async loadPost(id) {
    try {
      const res = await get(`/index.php?type=post&id=${id}`)
      if (res.code === 0) {
        this.setData({
          post: res.data,
          comments: res.data.comments || [],
          loading: false
        })
        wx.setNavigationBarTitle({ title: res.data.title })
      }
    } catch (e) {
      console.error(e)
      this.setData({ loading: false })
    }
  },

  onCommentInput(e) {
    this.setData({ commentContent: e.detail.value })
  },

  async submitComment() {
    const content = this.data.commentContent.trim()
    if (!content) {
      wx.showToast({ title: '请输入评论', icon: 'none' })
      return
    }
    this.setData({ commenting: true })
    const postId = this.data.post.id
    wx.request({
      url: 'https://duoduo.best/api/index.php?type=comment_post',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { post_id: postId, content },
      success: (r) => {
        if (r.data.code === 0) {
          wx.showToast({ title: '评论成功', icon: 'success' })
          this.setData({ commentContent: '' })
          this.loadPost(postId)
        }
      },
      complete: () => this.setData({ commenting: false })
    })
  }
})