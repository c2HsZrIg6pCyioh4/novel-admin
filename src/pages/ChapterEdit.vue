<template>
  <section class="card form">
    <h2>{{ isEdit ? `编辑章节 #${chapterIndex}` : '新增章节（自动续章）' }}</h2>

    <form @submit.prevent="submit">
      <div class="row">
        <label>标题</label>
        <input v-model.trim="form.title" required />
      </div>
      <div class="row">
        <label>正文</label>
        <textarea v-model="form.content" rows="16" />
      </div>
      <div class="row">
        <label>字数</label>
        <input type="number" v-model.number="form.word_count" placeholder="自动也行" />
      </div>

      <div class="actions">
        <button type="submit">保存</button>
        <router-link class="btn" :to="`/novels/${novelId}/chapters`">返回目录</router-link>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getChapter, createChapter, updateChapter } from '../api'

const route = useRoute()
const router = useRouter()
const novelId = route.params.novelId
const chapterIndex = Number(route.params.chapterIndex)
const isEdit = computed(() => !isNaN(chapterIndex))

const form = ref({ title: '', content: '', word_count: 0 })

onMounted(async () => {
  if (isEdit.value) {
    const c = await getChapter(novelId, chapterIndex)
    form.value = {
      title: c.title || '',
      content: c.content || '',
      word_count: c.word_count || (c.content ? c.content.length : 0)
    }
  }
})

async function submit() {
  const payload = { ...form.value }
  if (!payload.word_count && payload.content) payload.word_count = payload.content.length

  if (isEdit.value) {
    await updateChapter(novelId, chapterIndex, payload)
  } else {
    // 服务器自动续章（latestIndex + 1）
    await createChapter(novelId, payload)
  }
  router.push(`/novels/${novelId}/chapters`)
}
</script>

<style scoped>
.form { background:#fff; border-radius:16px; padding:16px; box-shadow: 0 8px 24px rgba(0,0,0,.06); }
.row { display:flex; gap:12px; margin:12px 0; align-items:flex-start; }
.row label { width:120px; color:#374151; padding-top:8px; }
.row input, .row textarea { flex:1; padding:8px 10px; border:1px solid #e5e7eb; border-radius:8px; }
.actions { display:flex; gap:12px; margin-top:16px; }
.actions button, .actions .btn { padding:8px 12px; border-radius:8px; border:none; background:#0ea5e9; color:#fff; cursor:pointer; text-decoration:none; }
</style>
