App({
  globalData: {
    darkMode: true  // 默认深色
  },

  onLaunch() {
    // 读取用户上次的主题偏好
    const darkMode = wx.getStorageSync('darkMode')
    if (darkMode !== '') {
      this.globalData.darkMode = darkMode !== false
    }
  },

  toggleTheme() {
    const darkMode = !this.globalData.darkMode
    this.globalData.darkMode = darkMode
    wx.setStorageSync('darkMode', darkMode)
    return darkMode
  }
})