<template>
  <section class="card reader">
    <header class="card-hd">
      <h2>{{ chapter?.title || '加载中...' }}</h2>
      <div class="actions">
        <router-link class="btn" :to="`/novels/${novelId}/chapters`">返回目录</router-link>
      </div>
    </header>

    <article v-if="chapter?.content" class="content" v-html="rendered"></article>

    <footer class="pager">
      <button :disabled="idx<=1" @click="go(idx-1)">上一章</button>
      <span>第 {{ idx }} 章</span>
      <button @click="go(idx+1)">下一章</button>
    </footer>
  </section>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getChapter } from '../api'

const route = useRoute()
const router = useRouter()
const novelId = route.params.novelId
const idx = ref(Number(route.params.chapterIndex))
const chapter = ref(null)

const rendered = computed(() => {
  // 简单处理换行 -> <p>
  if (!chapter.value?.content) return ''
  return chapter.value.content
    .split(/\n+/)
    .map(p => `<p>${p.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`)
    .join('')
})

async function load() {
  chapter.value = await getChapter(novelId, idx.value)
}

function go(n) {
  idx.value = n
  router.replace(`/read/${novelId}/${n}`)
}

watch(() => route.params.chapterIndex, () => {
  idx.value = Number(route.params.chapterIndex)
  load()
})

onMounted(load)
</script>

<style scoped>
.reader .content { padding: 16px; line-height: 1.9; }
.pager { display:flex; justify-content:center; align-items:center; gap:12px; padding:16px; }
.pager button { padding: 8px 12px; border-radius:8px; border:1px solid #ddd; background:#fff; cursor:pointer; }
</style>
