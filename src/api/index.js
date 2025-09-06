// —— 小说 ——
import request from "@/utils/request.js";

export const listNovels = () => request({ url: '/admin/novels', method: 'get' })
export const getNovel = (novelId) => request({ url: `/admin/novels/${novelId}`, method: 'get' })
export const createNovel = (payload) => request({ url: '/admin/novels', method: 'post', data: payload })
export const updateNovel = (novelId, payload) => request({ url: `/admin/novels/${novelId}`, method: 'put', data: payload })
export const deleteNovel = (novelId) => request({ url: `/admin/novels/${novelId}`, method: 'delete' })
// 验证 OAuth 登录并获取 token
export const authLogin = (provider, data) =>
    request({ url: `/oauth/${provider}/callback`, method: 'post', data })
// —— 章节目录（ChapterDetail）——
export const listChaptersDetail = (novelId) => request({ url: `/admin/novels/${novelId}/chapters`, method: 'get' })

// —— 章节正文 ——
export const getChapter = (novelId, chapterIndex) => request({ url: `/admin/chapters/${novelId}/${chapterIndex}`, method: 'get' })
export const createChapter = (novelId, payload) => request({ url: `/admin/chapters/${novelId}`, method: 'post', data: payload })
export const updateChapter = (novelId, chapterIndex, payload) => request({ url: `/admin/chapters/${novelId}/${chapterIndex}`, method: 'put', data: payload })
export const deleteChapter = (novelId, chapterIndex) => request({ url: `/admin/chapters/${novelId}/${chapterIndex}`, method: 'delete' })
// —— 图片上传 ——
export const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await request({
        url: '/images/uploads',  // 不需要写死 http://localhost:...，拦截器会加
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (res.ok && res.links?.webp) {
        return res.links.webp  // 返回相对路径
    } else {
        throw new Error('上传失败或没有 webp 地址')
    }
}
// 审核小说
export const auditNovel = (novelId, status) =>
    request({
        url: `/admin/novels/${novelId}/audit`,
        method: 'post',
        data: { status }
    })
export default request