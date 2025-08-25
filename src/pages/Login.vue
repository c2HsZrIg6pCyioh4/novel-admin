<template>
  <section class="login-page">
    <div class="card">
      <h1>后台登录</h1>
      <p class="desc">请选择登录方式</p>

      <div class="login-methods">


        <!-- Token 登录 -->
        <div class="method-card">
          <h2>Token 登录</h2>
          <div class="form-group">
            <label>Token</label>
            <input v-model="token" placeholder="输入您的访问令牌" />
          </div>
          <button class="submit-btn" @click="submitToken">使用 Token 登录</button>
          <!-- OAuth 登录 -->
            <div class="oauth-providers">
              <button class="oauth-btn wechat" @click="oauthLogin('wechat')">
                <span class="icon">W</span> 微信
              </button>
              <button class="oauth-btn apple" @click="oauthLogin('apple')">
                <span class="icon"></span> Apple
              </button>
          </div>
        </div>


      <div v-if="error" class="error">{{ error }}</div>

      <div class="tips">
        <p>说明：</p>
        <ul>
          <li>OAuth 登录：通过第三方平台授权登录</li>
          <li>Token 登录：直接使用访问令牌登录系统</li>
        </ul>
      </div>
    </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '../api/index.js'
import { getServerAddress } from '../utils/server'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const token = ref(localStorage.getItem('token') || '')
const loading = ref(false)
const error = ref('')

// 初始化时检查URL中的token参数（用于OAuth回调）
onMounted(() => {
  const urlToken = route.query.token
  if (urlToken) {
    localStorage.setItem('token', urlToken)
    const redirect = route.query.redirect || '/novels'
    router.replace(String(redirect))
    window.location.reload()
  }
})

async function oauthLogin(provider) {
  try {
    // 获取服务器地址
    const { default: serverAddress } = await getServerAddress()

    // 1️⃣ 从服务端获取 OAuth 配置
    const config = await request(`${serverAddress}/oauth/${provider}/config`)

    if (!config) throw new Error(`未找到 ${provider} 的配置`)

    const { client_id, redirect_uri, scope, client_secret, auth_url } = config

    // 2️⃣ 生成随机 state
    const state = Math.random().toString(36).substring(2, 10)

    // 3️⃣ 构建 Apple 登录 URL
    let authUrl = ''
    switch(provider) {
      case 'wechat':
        authUrl = `${config.authServer}?response_type=code&response_mode=form_post&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${scope}&state=${state}`
        break
      case 'apple':
        authUrl = `https://appleid.apple.com/auth/authorize?response_type=code&response_mode=form_post&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${scope}&state=${state}`
        break
      default:
        throw new Error(`不支持的 provider: ${provider}`)
    }

    // 4️⃣ 跳转到第三方授权页面
    window.location.href = authUrl

  } catch (err) {
    console.error('获取 OAuth 配置失败:', err)
    error.value = 'OAuth 登录失败，请重试'
  }
}
async function submitToken() {
  error.value = ''
  if (!token.value.trim()) {
    error.value = '请输入Token'
    return
  }
  
  try {
    // 获取服务器地址
    const { default: serverAddress } = await getServerAddress()

// 使用 POST 请求验证 token
    await request({
      url: '/validate-token',
      method: 'post',
      data: {}, // 如果后端需要 body，可以放这里，否则空对象
      headers: {
        Authorization: `Bearer ${token.value.trim()}`
      }
    })

    // 验证通过，保存token并跳转
    localStorage.setItem('token', token.value.trim())
    const redirect = route.query.redirect || '/novels'
    await router.replace(String(redirect))
    window.location.reload()
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Token无效或已过期'
    console.error('Token login error:', e)
  }
}

async function submitAccount() {
  error.value = ''
  loading.value = true
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 24px 16px;
  background: #f5f7fa;
}

.card {
  width: 100%;
  max-width: 500px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
  padding: 30px;
}

h1 { 
  margin: 0 0 8px; 
  font-size: 24px; 
  text-align: center;
}

.desc { 
  margin: 0 0 20px; 
  color: #6b7280; 
  font-size: 14px; 
  text-align: center;
}

.login-methods {
  display: grid;
  gap: 20px;
}

.method-card {
  background: #f9fafb;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.method-card h2 {
  margin: 0 0 15px;
  font-size: 18px;
  color: #1f2937;
}

.oauth-providers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
}

.oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.oauth-btn .icon {
  margin-right: 8px;
  font-weight: bold;
}

.oauth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.oauth-btn:active {
  transform: translateY(0);
}

.google { background: #4285F4; color: white; }
.github { background: #333; color: white; }
.wechat { background: #07C160; color: white; }

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #4b5563;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
}

.form-group input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.2s;
}

.submit-btn:hover {
  background: #2563eb;
}

.submit-btn:active {
  transform: translateY(1px);
}

.error {
  margin-top: 15px;
  padding: 10px;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.tips {
  margin-top: 20px;
  padding: 15px;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 13px;
  color: #6b7280;
}

.tips p {
  margin: 0 0 5px;
  font-weight: 500;
}

.tips ul {
  padding-left: 20px;
  margin: 0;
}
</style>
