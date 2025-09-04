<template>
  <section class="card">
    <header class="card-hd">
      <h2>小说管理</h2>
      <div class="actions">
        <!-- 搜索框 -->
        <input
            v-model="searchQuery"
            class="search-input"
            type="text"
            placeholder="搜索小说名称/作者"
            @keyup.enter="page=1"
        />
        <router-link class="btn" to="/novels/new">新增小说</router-link>
      </div>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>novel_id</th>
            <th>名称</th>
            <th>作者</th>
            <th>分类</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in paginated" :key="n.id">
            <td>{{ n.id }}</td>
            <td>{{ n.novel_id || n.novel_Id || n.Novel_Id }}</td>
            <td>{{ n.name }}</td>
            <td>{{ n.author }}</td>
            <td>{{ n.category }}</td>
            <td>{{ n.status===1? '已完结' : '连载中' }}</td>
            <td>{{ fmt(n.created_at) }}</td>
            <td>
              <router-link :to="`/novels/${n.novel_id || n.novel_Id || n.Novel_Id}/chapters`">目录</router-link>
              |
              <router-link :to="`/novels/${n.novel_id || n.novel_Id || n.Novel_Id}/edit`">编辑</router-link>
              |
              <a href="#" @click.prevent="del(n)">删除</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :total="filtered.length" v-model:page="page" :pageSize="pageSize" />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { listNovels, deleteNovel } from '../api'
import Pagination from '../components/Pagination.vue'

const novels = ref([])
const page = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

// 过滤后的数据
const filtered = computed(() => {
  if (!searchQuery.value) return novels.value
  const q = searchQuery.value.toLowerCase()
  return novels.value.filter(n =>
      (n.name && n.name.toLowerCase().includes(q)) ||
      (n.author && n.author.toLowerCase().includes(q))
  )
})

// 分页数据
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

function fmt(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString()
}

async function load() {
  novels.value = await listNovels()
}

async function del(n) {
  if (!confirm(`确认删除小说【${n.name}】?`)) return
  await deleteNovel(n.novel_id || n.novel_Id || n.Novel_Id)
  await load()
}

onMounted(load)
</script>

<style scoped>
.card { background:#fff; border-radius:16px; box-shadow: 0 8px 24px rgba(0,0,0,.06); }
.card-hd { display:flex; align-items:center; justify-content:space-between; padding:16px 16px 0; gap:12px; }
.actions { display:flex; align-items:center; gap:12px; }
.search-input { padding:6px 10px; border:1px solid #ddd; border-radius:6px; }
.actions .btn { padding:8px 12px; background:#2563eb; color:#fff; border-radius:8px; text-decoration:none; }
.table-wrap { overflow:auto; padding: 16px; }
table { width:100%; border-collapse:collapse; }
th, td { padding:10px; border-bottom:1px solid #eee; text-align:left; }
</style>
