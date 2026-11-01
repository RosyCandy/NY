const API_BASE = 'https://duoduo.best/api'

Page({
  data: {
    username: '',
    password: '',
    loading: false,
    errorMsg: ''
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  doLogin() {
    const { username, password } = this.data
    if (!username || !password) {
      this.setData({ errorMsg: '请填写用户名和密码' })
      return
    }

    this.setData({ loading: true, errorMsg: '' })

    wx.request({
      url: `${API_BASE}/login.php`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { username, password },
      success: (res) => {
        if (res.data.code === 200) {
          // 存 token 和用户信息
          wx.setStorageSync('token', res.data.token)
          wx.setStorageSync('userInfo', res.data.user)
          wx.showToast({ title: '登录成功', icon: 'success' })
          // 返回"我的"页
          setTimeout(() => wx.navigateBack(), 800)  
        } else {
          this.setData({ errorMsg: res.data.message || '登录失败' })
        }
      },
      fail: () => {
        this.setData({ errorMsg: '网络错误，请重试' })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  }
})