import { app } from '../../view'

const call = async (tcb, event, data = {}) => {
  if (app.$tcb) {
    try {
      return await app.$tcb.app.callFunction({
        name: 'twikoo',
        data: { event, ...data }
      })
    } catch (e) {
      // 向下兼容 0.1.x 版本云函数
      let oldFuncName
      switch (event) {
        case 'COMMENT_LIKE':
          oldFuncName = 'comment-like'
          break
        case 'COMMENT_GET':
          oldFuncName = 'comment-get'
          break
        case 'COMMENT_SUBMIT':
          oldFuncName = 'comment-submit'
          break
        case 'COUNTER_GET':
          oldFuncName = 'counter-get'
          break
      }
      if (oldFuncName) {
        return await app.$tcb.app.callFunction({
          name: oldFuncName,
          data: data
        })
      } else {
        throw new Error('请升级 Twikoo 云函数版本再试，如果仍无法解决，请删除并重新创建 Twikoo 云函数 - https://twikoo.js.org')
      }
    }
  } else if (app.$twikoo.serverURL) {
    return await new Promise((resolve, reject) => {
      try {
        const accessToken = localStorage.getItem('twikoo-access-token')
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            const result = JSON.parse(xhr.responseText)
            if (result.accessToken) {
              localStorage.setItem('twikoo-access-token', result.accessToken)
            }
            resolve({ result })
          }
        }
        xhr.open('POST', app.$twikoo.serverURL)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify({ event, accessToken, ...data }))
      } catch (e) {
        reject(e)
      }
    })
  } else {
    throw new Error('缺少 envId 或 serverURL 配置 - https://twikoo.js.org')
  }
}

export default call
