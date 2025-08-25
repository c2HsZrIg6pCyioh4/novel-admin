// —— 小说 ——
import request from "@/utils/request.js";

export const listNovels = () => request({ url: '/novels', method: 'get' })
export const getNovel = (novelId) => request({ url: `/novels/${novelId}`, method: 'get' })
export const createNovel = (payload) => request({ url: '/novels', method: 'post', data: payload })
export const updateNovel = (novelId, payload) => request({ url: `/novels/${novelId}`, method: 'put', data: payload })
export const deleteNovel = (novelId) => request({ url: `/novels/${novelId}`, method: 'delete' })
// 验证 OAuth 登录并获取 token
export const authLogin = (provider, data) =>
    request({ url: `/oauth/${provider}/callback`, method: 'post', data })
// —— 章节目录（ChapterDetail）——
export const listChaptersDetail = (novelId) => request({ url: `/novels/${novelId}/chapters`, method: 'get' })

// —— 章节正文 ——
export const getChapter = (novelId, chapterIndex) => request({ url: `/chapters/${novelId}/${chapterIndex}`, method: 'get' })
export const createChapter = (novelId, payload) => request({ url: `/chapters/${novelId}`, method: 'post', data: payload })
export const updateChapter = (novelId, chapterIndex, payload) => request({ url: `/chapters/${novelId}/${chapterIndex}`, method: 'put', data: payload })
export const deleteChapter = (novelId, chapterIndex) => request({ url: `/chapters/${novelId}/${chapterIndex}`, method: 'delete' })

export default request