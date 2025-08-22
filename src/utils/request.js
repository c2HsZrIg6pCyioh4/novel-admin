import axios from 'axios'
import { getServerAddress } from './server'

// 创建 axios 实例
const request = axios.create({
    timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(async config => {
    // 这里用 server.js 的动态地址
    const { default: baseURL } = await getServerAddress()
    config.baseURL = baseURL

    const token = localStorage.getItem('token')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
}, error => Promise.reject(error))


export default request