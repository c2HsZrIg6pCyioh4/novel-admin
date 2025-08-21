<template>
  <section class="card form">
    <h2>{{ isEdit ? '编辑小说' : '新增小说' }}</h2>

    <form @submit.prevent="submit">
      <div class="row">
        <label>novel_id</label>
        <input v-model.trim="form.novel_id" :disabled="isEdit" required placeholder="唯一字符串" />
      </div>
      <div class="row">
        <label>名称</label>
        <input v-model.trim="form.name" required />
      </div>
      <div class="row">
        <label>作者</label>
        <input v-model.trim="form.author" required />
      </div>
      <div class="row">
        <label>分类</label>
        <input v-model.trim="form.category" />
      </div>
      <div class="row">
        <label>状态</label>
        <select v-model.number="form.status">
          <option :value="0">连载中</option>
          <option :value="1">已完结</option>
        </select>
      </div>
      <div class="row">
        <label>封面地址</label>
        <input v-model.trim="form.cover_url" placeholder="https://..." />
      </div>
      <div class="row">
        <label>简介</label>
        <textarea v-model="form.description" rows="5" />
      </div>

      <div class="actions">
        <button type="submit">保存</button>
        <router-link class="btn" to="/novels">返回</router-link>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getNovel, createNovel, updateNovel } from '../api'

const route = useRoute()
const router = useRouter()
const novelId = route.params.novelId
const isEdit = computed(() => !!novelId)

const form = ref({
  novel_id: '',
  name: '',
  author: '',
  category: '',
  status: 0,
  description: '',
  cover_url: ''
})

onMounted(async () => {
  if (isEdit.value) {
    const data = await getNovel(novelId)
    // 兼容后端字段命名
    form.value = {
      novel_id: data.novel_id || data.novel_Id || data.Novel_Id || novelId,
      name: data.name,
      author: data.author,
      category: data.category,
      status: data.status ?? 0,
      description: data.description || '',
      cover_url: data.cover_url || ''
    }
  }
})

async function submit() {
  const payload = { ...form.value }
  if (isEdit.value) {
    await updateNovel(novelId, payload)
  } else {
    await createNovel(payload)
  }
  router.push('/novels')
}
</script>

<style scoped>
.form { background:#fff; border-radius:16px; padding:16px; box-shadow: 0 8px 24px rgba(0,0,0,.06); }
.row { display:flex; gap:12px; margin:12px 0; align-items:center; }
.row label { width:120px; color:#374151; }
.row input, .row select, .row textarea { flex:1; padding:8px 10px; border:1px solid #e5e7eb; border-radius:8px; }
.actions { display:flex; gap:12px; margin-top:16px; }
.actions button, .actions .btn { padding:8px 12px; border-radius:8px; border:none; background:#10b981; color:#fff; cursor:pointer; text-decoration:none; }
</style>
