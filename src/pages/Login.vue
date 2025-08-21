<template>
  <section class="login-page">
    <div class="card">
      <h1>后台登录</h1>
      <p class="desc">请输入账号密码或直接设置 Token 以进入后台</p>

      <div class="form">
        <label>用户名</label>
        <input v-model="username" placeholder="用户名" />

        <label>密码</label>
        <input type="password" v-model="password" placeholder="密码" />

        <label>Token（可选）</label>
        <input v-model="token" placeholder="不走接口时可直接填 Token；留空则使用 dev-token" />

        <div v-if="error" class="error">{{ error }}</div>

        <div class="actions">
          <button :disabled="loading" @click="submit">{{ loading ? '登录中...' : '登录' }}</button>
          <button class="secondary" @click="clearAll">清空</button>
        </div>
      </div>

      <div class="tips">
        <p>说明：</p>
        <ul>
          <li>后端登录：将 VITE_AUTH_ENABLED=true 且 VITE_USE_LOGIN_API=true，使用接口 {{ loginPath }} 返回 token。</li>
          <li>无后端或调试：可直接输入 Token，或留空使用 dev-token。</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
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
const useBackendLogin =
  (import.meta.env.VITE_AUTH_ENABLED || 'false') === 'true' &&
  (import.meta.env.VITE_USE_LOGIN_API || 'false') === 'true'

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const manual = (token.value || '').trim()
    if (manual) {
      // 优先使用手动输入的 Token（兼容粘贴 Bearer/Authorization 前缀，拦截器会自动规范）
      localStorage.setItem('token', manual)
    } else if (useBackendLogin) {
      // 后端登录：要求后端返回形如 { token: '...' }
      const res = await api.post(loginPath, { username: username.value, password: password.value })
      const tk = res?.data?.token || res?.token || res?.data
      if (!tk) throw new Error('登录响应未返回 token')
      localStorage.setItem('token', tk)
    } else {
      // 无后端调试：使用 dev-token
      localStorage.setItem('token', 'dev-token')
    }
    const redirect = route.query.redirect || '/novels'
    router.replace(String(redirect))
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || '登录失败'
  } finally {
    loading.value = false
  }
}

function clearAll() {
  username.value = ''
  password.value = ''
  token.value = ''
  error.value = ''
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 24px 16px;
}
.card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
  padding: 20px 20px 16px 20px;
}
h1 { margin: 0 0 8px; font-size: 22px; }
.desc { margin: 0 0 12px; color: #6b7280; font-size: 14px; }

.form { display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 4px; }
.form label { font-size: 13px; color: #374151; }
.form input {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
}
.form input:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,.2); }

.error { margin-top: 4px; color: #ef4444; font-size: 13px; }

.actions { display: flex; gap: 8px; margin-top: 8px; }
button {
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
}
button.secondary { background: #9ca3af; }
button[disabled] { opacity: .6; cursor: not-allowed; }

.tips { margin-top: 12px; background: #f9fafb; border: 1px dashed #e5e7eb; padding: 10px; border-radius: 10px; font-size: 12px; color: #6b7280; }
.tips ul { padding-left: 18px; margin: 6px 0 0; }
</style>
