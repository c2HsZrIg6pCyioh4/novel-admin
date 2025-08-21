<template>
  <header class="nav">
    <div class="brand">Novel Admin</div>

    <nav class="links">
      <router-link to="/novels">📚 小说列表</router-link>
      <router-link to="/novels/new">➕ 新增小说</router-link>

      <template v-if="lastNovelId">
        <span class="sep">|</span>
        <span class="group">最近小说 {{ lastNovelId }}：</span>
        <router-link :to="`/novels/${lastNovelId}/edit`">编辑</router-link>
        <router-link :to="`/novels/${lastNovelId}/chapters`">目录</router-link>
        <router-link :to="`/novels/${lastNovelId}/chapters/new`">新建章节</router-link>
      </template>

      <template v-if="lastNovelId && lastChapterIndex !== ''">
        <span class="sep">|</span>
        <span class="group">最近章节 #{{ lastChapterIndex }}：</span>
        <router-link :to="`/novels/${lastNovelId}/chapters/${lastChapterIndex}/edit`">编辑章节</router-link>
        <router-link :to="`/read/${lastNovelId}/${lastChapterIndex}`">阅读</router-link>
      </template>
    </nav>

    <div class="spacer" />

    <div class="auth">
      <template v-if="authEnabled">
        <router-link v-if="!hasToken" class="btn" to="/login">登录</router-link>
        <button v-else class="btn danger" @click="logout">退出登录</button>
      </template>
      <template v-else>
        <details class="dev">
          <summary>开发 Token</summary>
          <div class="dev-box">
            <input v-model="token" placeholder="Token（可选）" />
            <button @click="save">保存</button>
          </div>
        </details>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const token = ref(localStorage.getItem('token') || '')
const hasToken = ref(!!token.value)
const lastNovelId = ref(localStorage.getItem('lastNovelId') || '')
const lastChapterIndex = ref(localStorage.getItem('lastChapterIndex') ?? '')

const authEnabled = (import.meta.env.VITE_AUTH_ENABLED || 'false') === 'true'

function refresh() {
  token.value = localStorage.getItem('token') || ''
  hasToken.value = !!token.value
  lastNovelId.value = localStorage.getItem('lastNovelId') || ''
  const ci = localStorage.getItem('lastChapterIndex')
  lastChapterIndex.value = ci == null ? '' : ci
}

onMounted(() => {
  refresh()
})

watch(() => route.fullPath, () => {
  // 跟随路由变化刷新最近上下文（路由 afterEach 已在 router 中写入 lastNovelId/lastChapterIndex）
  refresh()
})

function save() {
  localStorage.setItem('token', token.value)
  hasToken.value = !!token.value
  alert('Token 已保存到本地（localStorage）')
}

function logout() {
  localStorage.removeItem('token')
  refresh()
  router.push('/login')
}
</script>

<style scoped>
.nav {
  position: sticky; top: 0; z-index: 5;
  display: flex; align-items: center; gap: 16px;
  padding: 12px 16px; background: #111827; color: #fff;
}
.brand { font-weight: 700; white-space: nowrap; }
.links { display:flex; align-items:center; gap: 10px; flex-wrap: wrap; }
.links a { color: #cbd5e1; text-decoration: none; }
.links a.router-link-active { color: #fff; font-weight: 600; }
.sep { color:#6b7280; margin: 0 4px; }
.group { color:#9ca3af; margin-right: 4px; }
.spacer { flex: 1; }

.auth { display:flex; align-items:center; gap: 8px; }
.btn {
  padding: 6px 10px; border-radius: 8px; border: none;
  background: #22c55e; color: #fff; cursor: pointer; text-decoration: none;
}
.btn.danger { background: #ef4444; }

details.dev { color:#e5e7eb; }
details.dev summary { cursor: pointer; }
.dev-box { display:flex; align-items:center; gap:8px; margin-top:6px; }
.dev-box input { padding: 6px 8px; border-radius: 8px; border: 1px solid #ddd; }
.dev-box button {
  padding: 6px 10px; border-radius: 8px; border: none; background: #3b82f6; color: #fff; cursor: pointer;
}
</style>
