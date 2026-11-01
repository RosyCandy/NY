const API_URL = 'https://duoduo.best/api/chat.php'
const app = getApp()

Page({
  data: {
    darkMode: true,
    messages: [
      { role: 'assistant', content: '你好！我是 DuoDuo 的 AI 助手，有什么想聊的吗？✨' }
    ],
    inputText: '',
    loading: false,
    scrollTo: ''
  },

  onShow() {
    this.setData({ darkMode: app.globalData.darkMode })
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  sendMsg() {
    const text = this.data.inputText.trim()
    if (!text || this.data.loading) return
    const userMsg = { role: 'user', content: text }
    const messages = [...this.data.messages, userMsg]
    this.setData({ messages, inputText: '', loading: true, scrollTo: 'bottom' })
    wx.request({
      url: API_URL,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { messages: messages.map(m => ({ role: m.role, content: m.content })) },
      success: (res) => {
        const reply = res.data.reply || '抱歉，出错了'
        this.setData({
          messages: [...this.data.messages, { role: 'assistant', content: reply }],
          loading: false,
          scrollTo: 'bottom'
        })
      },
      fail: () => {
        this.setData({
          messages: [...this.data.messages, { role: 'assistant', content: '网络错误，请重试 😢' }],
          loading: false
        })
      }
    })
  }
})