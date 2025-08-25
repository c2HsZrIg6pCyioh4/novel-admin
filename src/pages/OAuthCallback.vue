<template>
  <div class="oauth-callback">
    <div class="loading" v-if="loading">处理中，请稍候...</div>
    <div class="error" v-if="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {authLogin} from '../api'
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { code, state ,user} = route.query
    const provider = route.params.provider  // 获取动态 provider
    if (!provider) throw new Error('缺少 OAuth provider 参数')
    if (!code) throw new Error('缺少授权码参数')

    // 调用后端 OAuth 回调接口
    // 动态请求：/oauth/{provider}/callback
    const tokenData = await authLogin(provider, { code, state, user })
    if (!tokenData) throw new Error('未收到访问令牌')
    // 保存 token 并跳转到原页面或小说列表
    localStorage.setItem('token', tokenData.token)
    const redirect = route.query.redirect || '/novels'
    router.replace(redirect)
  } catch (err) {
    error.value = err.message || '授权处理失败'
    console.error('OAuth callback error:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.oauth-callback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f7fa;
}

.loading {
  font-size: 18px;
  color: #3b82f6;
}

.error {
  margin-top: 20px;
  padding: 15px;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 8px;
  max-width: 500px;
  text-align: center;
}
</style>