<template>
  <header class="nav">
    <div class="brand">Novel Admin</div>

    <nav class="links">
      <router-link to="/novels">📚 小说列表</router-link>
    </nav>

    <div class="spacer" />

    <div class="auth">
      <template v-if="authEnabled">
        <router-link v-if="!hasToken" class="btn" to="/login">登录</router-link>
        <button v-else class="btn danger" @click="logout">退出登录</button>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = ref(localStorage.getItem('token') || '')
const hasToken = ref(!!token.value)
const authEnabled = (import.meta.env.VITE_AUTH_ENABLED || 'false') === 'true'

function refresh() {
  token.value = localStorage.getItem('token') || ''
  hasToken.value = !!token.value
}

onMounted(() => refresh())

function logout() {
  localStorage.removeItem('token')
  refresh()
  router.push('/login')
}
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #111827;
  color: #fff;
}

.brand { font-weight: 700; white-space: nowrap; }

.links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.links a { color: #cbd5e1; text-decoration: none; }
.links a.router-link-active { color: #fff; font-weight: 600; }

.spacer { flex: 1; }

.auth { display: flex; align-items: center; gap: 8px; }
.btn {
  padding: 6px 10px; border-radius: 8px; border: none;
  background: #22c55e; color: #fff; cursor: pointer; text-decoration: none;
}
.btn.danger { background: #ef4444; }
</style>