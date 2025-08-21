<template>
  <section class="card">
    <header class="card-hd">
      <h2>章节目录 - {{ novelId }}</h2>
      <div class="actions">
        <router-link class="btn" :to="`/novels/${novelId}/chapters/new`">新增章节</router-link>
        <router-link class="btn" :to="`/novels`">返回小说列表</router-link>
      </div>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>标题</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in chapters" :key="c.chapter_index">
            <td>{{ c.chapter_index }}</td>
            <td>{{ c.title }}</td>
            <td>
              <router-link :to="`/read/${novelId}/${c.chapter_index}`">阅读</router-link>
              |
              <router-link :to="`/novels/${novelId}/chapters/${c.chapter_index}/edit`">编辑</router-link>
              |
              <a href="#" @click.prevent="del(c.chapter_index)">删除</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { listChaptersDetail, deleteChapter } from '../api'

const route = useRoute()
const novelId = route.params.novelId
const chapters = ref([])
let latestIndex = 0

async function load() {
  const list = await listChaptersDetail(novelId)
  chapters.value = list
  latestIndex = Math.max(...list.map(x => x.chapter_index || 0))
}

async function del(idx) {
  if (!confirm(`仅允许删除最新章节。确认删除 第${idx}章 ？`)) return
  if (idx !== latestIndex) {
    alert(`后端限制：只能删除最新章节（最新为第 ${latestIndex} 章）`)
    return
  }
  await deleteChapter(novelId, idx)
  await load()
}

onMounted(load)
</script>

<style scoped>
.card { background:#fff; border-radius:16px; box-shadow: 0 8px 24px rgba(0,0,0,.06); }
.card-hd { display:flex; align-items:center; justify-content:space-between; padding:16px 16px 0; }
.table-wrap { overflow:auto; padding: 16px; }
table { width:100%; border-collapse:collapse; }
th, td { padding:10px; border-bottom:1px solid #eee; text-align:left; }
.actions .btn { padding:8px 12px; background:#2563eb; color:#fff; border-radius:8px; text-decoration:none; margin-left:8px; }
</style>
