const BASE_URL = 'https://duoduo.best/api'

const request = (url, method, data) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token || ''
      },
      success: (res) => {
        if (res.data.code === 200 || res.data.code === 0) {
          resolve(res.data)
        } else if (res.data.code === 401) {
          wx.removeStorageSync('token')
          wx.navigateTo({ url: '/pages/login/login' })
          reject(res.data)
        } else {
          reject(res.data)
        }
      },
      fail: (err) => reject(err)
    })
  })
}

export const get = (url, params) => {
  // GET 参数拼到 url 上
  if (params) {
    const query = Object.entries(params).map(([k,v]) => `${k}=${v}`).join('&')
    url = `${url}?${query}`
  }
  return request(url, 'GET', {})
}

export const post = (url, data) => request(url, 'POST', data)