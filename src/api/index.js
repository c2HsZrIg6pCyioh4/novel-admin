import axios from 'axios'

const isDev = typeof window !== 'undefined' && window.location.origin.includes('://localhost:5174')
const api = axios.create({
  baseURL: isDev ? '/api' : import.meta.env.VITE_API_BASE_URL
})

// 统一 Header（与后端 CORS 对齐：前端只设置请求头，CORS 需后端放行）
api.interceptors.request.use((config) => {
  // 规范设置 Content-Type，兼容 Axios v1 的 AxiosHeaders 实例
  if (config?.headers?.set) {
    config.headers.set('Content-Type', 'application/json')
    config.headers.set('Accept', 'application/json')
  } else {
    config.headers['Content-Type'] = 'application/json'
    config.headers['Accept'] = 'application/json'
  }
  // 避免 304：对 GET 请求追加时间戳参数并禁用缓存
  if ((config.method || 'get').toLowerCase() === 'get') {
    config.params = { ...(config.params || {}), _t: Date.now() }
    config.headers['Cache-Control'] = 'no-cache'
    config.headers['Pragma'] = 'no-cache'
  }

  // 统一注入 Authorization：只要本地或预置存在 token 就附加，自动规范格式
  // 兼容用户在输入框中粘贴如：
  // - "sk-xxxx"
  // - "Bearer sk-xxxx"
  // - "Authorization: Bearer sk-xxxx"
  // - "Authorization Bearer sk-xxxx"
  const rawToken0 = (localStorage.getItem('token') || (import.meta.env.VITE_AUTH_TOKENS || '').split(',')[0] || '')
  let rawToken = String(rawToken0).trim()
  if (rawToken) {
    // 去掉可能的 "Authorization" 前缀（可带冒号）
    rawToken = rawToken.replace(/^authorization\s*:?\s*/i, '')
    // 若带 "Bearer " 前缀，先剥离，仅保留纯 token
    if (/^bearer\s+/i.test(rawToken)) {
      rawToken = rawToken.replace(/^bearer\s+/i, '')
    }
    const bearer = `Bearer ${rawToken}`
    // 规范设置 Authorization，确保在 AxiosHeaders 场景下正确注入
    if (config?.headers?.set) {
      config.headers.set('Authorization', bearer)
    } else {
      config.headers['Authorization'] = bearer
    }
    // 同步到 axios 实例默认头，防止极端场景遗漏
    api.defaults.headers.common['Authorization'] = bearer
    // 开发态日志（只提示是否已设置与脱敏 token 尾部）
    if (isDev && typeof console !== 'undefined' && console.debug) {
      const tail = rawToken.length > 8 ? rawToken.slice(-8) : rawToken
      console.debug('[API] Authorization attached:', true, `...${tail}`)
    }
  }
  return config
})

/**
 * 统一错误处理：
 * - 日志输出
 * - 当启用鉴权且返回 401 时：清除本地 token 并跳转登录（带上 redirect）
 */
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

// —— 小说 ——
export const listNovels = () => api.get('/novels').then(r => r.data)
export const getNovel = (novelId) => api.get(`/novels/${novelId}`).then(r => r.data)
export const createNovel = (payload) => api.post('/novels', payload).then(r => r.data)
export const updateNovel = (novelId, payload) => api.put(`/novels/${novelId}`, payload).then(r => r.data)
export const deleteNovel = (novelId) => api.delete(`/novels/${novelId}`).then(r => r.data)

// —— 章节目录（ChapterDetail）——
export const listChaptersDetail = (novelId) => api.get(`/novels/${novelId}/chapters`).then(r => r.data)

// —— 章节正文 ——
export const getChapter = (novelId, chapterIndex) => api.get(`/chapters/${novelId}/${chapterIndex}`).then(r => r.data)
export const createChapter = (novelId, payload) => api.post(`/chapters/${novelId}`, payload).then(r => r.data)
export const updateChapter = (novelId, chapterIndex, payload) => api.put(`/chapters/${novelId}/${chapterIndex}`, payload).then(r => r.data)
export const deleteChapter = (novelId, chapterIndex) => api.delete(`/chapters/${novelId}/${chapterIndex}`).then(r => r.data)

export default api
