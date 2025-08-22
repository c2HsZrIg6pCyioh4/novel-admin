<template>
  <section class="login-page">
    <div class="card">
      <h1>后台登录</h1>
      <p class="desc">请选择登录方式</p>

      <div class="login-methods">
        <!-- OAuth 登录 -->
        <div class="method-card" v-if="oauthEnabled">
          <h2>OAuth 登录</h2>
          <div class="oauth-providers">
            <button class="oauth-btn google" @click="oauthLogin('google')">
              <span class="icon">G</span> Google
            </button>
            <button class="oauth-btn github" @click="oauthLogin('github')">
              <span class="icon">G</span> GitHub
            </button>
            <button class="oauth-btn wechat" @click="oauthLogin('wechat')">
              <span class="icon">W</span> 微信
            </button>
          </div>
        </div>

        <!-- Token 登录 -->
        <div class="method-card">
          <h2>Token 登录</h2>
          <div class="form-group">
            <label>Token</label>
            <input v-model="token" placeholder="输入您的访问令牌" />
          </div>
          <button class="submit-btn" @click="submitToken">使用 Token 登录</button>
        </div>

        <!-- 账号密码登录 -->
        <div class="method-card" v-if="useBackendLogin">
          <h2>账号密码登录</h2>
          <div class="form-group">
            <label>用户名</label>
            <input v-model="username" placeholder="用户名" />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" v-model="password" placeholder="密码" />
          </div>
          <button class="submit-btn" @click="submitAccount">登录</button>
        </div>
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <div class="tips">
        <p>说明：</p>
        <ul>
          <li v-if="oauthEnabled">OAuth 登录：通过第三方平台授权登录</li>
          <li>Token 登录：直接使用访问令牌登录系统</li>
          <li v-if="useBackendLogin">账号密码登录：使用系统账号密码登录</li>
          <li>无后端或调试：可直接输入 Token，或留空使用 dev-token</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api/index.js'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const token = ref(localStorage.getItem('token') || '')
const loading = ref(false)
const error = ref('')

const loginPath = import.meta.env.VITE_LOGIN_PATH || '/auth/login'
const oauthPath = import.meta.env.VITE_OAUTH_PATH || '/oauth'
const useBackendLogin = 
  (import.meta.env.VITE_AUTH_ENABLED || 'false') === 'true' &&
  (import.meta.env.VITE_USE_LOGIN_API || 'false') === 'true'
const oauthEnabled = 
  (import.meta.env.VITE_OAUTH_ENABLED || 'false') === 'true'

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

function oauthLogin(provider) {
  const redirectUri = encodeURIComponent(window.location.origin + '/login')
  const authUrl = `${oauthPath}/${provider}?redirect_uri=${redirectUri}`
  window.location.href = authUrl
}

async function submitToken() {
  error.value = ''
  if (!token.value.trim()) {
    error.value = '请输入Token'
    return
  }
  
    try {
      // 验证token有效性
      await api.post('/api/validate-token', null, {
        headers: {
          'Authorization': `Bearer ${token.value.trim()}`
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
  
  try {
    if (!username.value || !password.value) {
      throw new Error('请输入用户名和密码')
    }

    const res = await api.post(loginPath, { 
      username: username.value, 
      password: password.value 
    })
    
    const tk = res?.data?.token || res?.token || res?.data
    if (!tk) throw new Error('登录响应未返回token')
    
    localStorage.setItem('token', tk)
    const redirect = route.query.redirect || '/novels'
    await router.replace(String(redirect))
    window.location.reload()
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || '登录失败'
    console.error('Account login error:', e)
  } finally {
    loading.value = false
  }
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
