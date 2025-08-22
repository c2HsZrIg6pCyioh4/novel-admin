import axios from 'axios'
import { getServerAddress } from '@/utils/server'

const isDev = import.meta.env.MODE === 'development'

// 通用请求方法，每次都动态选择 server 地址
async function request({ url, method = 'get', data = null, params = null }) {
  const { default: address } = await getServerAddress()

  const api = axios.create({
    baseURL: address,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  // 请求拦截器：统一附加 Authorization
  api.interceptors.request.use((config) => {
    let rawToken = (localStorage.getItem('token') || (import.meta.env.VITE_AUTH_TOKENS || '').split(',')[0] || '').trim()
    if (rawToken) {
      // 去掉可能的 Authorization / Bearer 前缀
      rawToken = rawToken.replace(/^authorization\s*:?\s*/i, '')
      rawToken = rawToken.replace(/^bearer\s+/i, '')
      const bearer = `Bearer ${rawToken}`
      config.headers['Authorization'] = bearer
      if (isDev) {
        const tail = rawToken.length > 8 ? rawToken.slice(-8) : rawToken
        console.debug('[API] Authorization attached:', `...${tail}`)
      }
    }

    // 避免 304：GET 请求追加时间戳
    if ((config.method || 'get').toLowerCase() === 'get') {
      config.params = { ...(config.params || {}), _t: Date.now() }
      config.headers['Cache-Control'] = 'no-cache'
      config.headers['Pragma'] = 'no-cache'
    }

    return config
  })

  // 响应拦截器：处理错误和 401
  api.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status
      const msg = err?.response?.data?.message || err.message
      console.error('API Error:', msg)

      const authEnabled = (import.meta.env.VITE_AUTH_ENABLED || 'false') === 'true'
      if (authEnabled && status === 401) {
        localStorage.removeItem('token')
        const redirect = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash)
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?redirect=${redirect}`
        }
      }
      return Promise.reject(err)
    }
  )

  return api({ url, method, data, params }).then(r => r.data)
}

// —— 小说 ——
export const listNovels = () => request({ url: '/api/novels', method: 'get' })
export const getNovel = (novelId) => request({ url: `/api/novels/${novelId}`, method: 'get' })
export const createNovel = (payload) => request({ url: '/api/novels', method: 'post', data: payload })
export const updateNovel = (novelId, payload) => request({ url: `/api/novels/${novelId}`, method: 'put', data: payload })
export const deleteNovel = (novelId) => request({ url: `/api/novels/${novelId}`, method: 'delete' })

// —— 章节目录（ChapterDetail）——
export const listChaptersDetail = (novelId) => request({ url: `/api/novels/${novelId}/chapters`, method: 'get' })

// —— 章节正文 ——
export const getChapter = (novelId, chapterIndex) => request({ url: `/api/chapters/${novelId}/${chapterIndex}`, method: 'get' })
export const createChapter = (novelId, payload) => request({ url: `/api/chapters/${novelId}`, method: 'post', data: payload })
export const updateChapter = (novelId, chapterIndex, payload) => request({ url: `/api/chapters/${novelId}/${chapterIndex}`, method: 'put', data: payload })
export const deleteChapter = (novelId, chapterIndex) => request({ url: `/api/chapters/${novelId}/${chapterIndex}`, method: 'delete' })

export default request