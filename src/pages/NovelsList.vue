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

        <!-- 状态筛选 -->
        <select v-model="filterStatus">
          <option value="">全部状态</option>
          <option value="0">连载中</option>
          <option value="1">已完结</option>
        </select>

        <!-- 审核状态筛选 -->
        <select v-model="filterAudit">
          <option value="">全部审核</option>
          <option value="0">待审核</option>
          <option value="1">已通过</option>
          <option value="2">已拒绝</option>
        </select>

        <router-link class="btn" to="/novels/new">新增小说</router-link>
      </div>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
        <tr>
          <th @click="setSort('id')">ID <SortIcon :keyName="'id'" :sortKey="sortKey" :sortOrder="sortOrder"/></th>
          <th @click="setSort('novel_id')">novel_id <SortIcon :keyName="'novel_id'" :sortKey="sortKey" :sortOrder="sortOrder"/></th>
          <th @click="setSort('name')">名称 <SortIcon :keyName="'name'" :sortKey="sortKey" :sortOrder="sortOrder"/></th>
          <th @click="setSort('author')">作者 <SortIcon :keyName="'author'" :sortKey="sortKey" :sortOrder="sortOrder"/></th>
          <th>分类</th>
          <th @click="setSort('status')">状态 <SortIcon :keyName="'status'" :sortKey="sortKey" :sortOrder="sortOrder"/></th>
          <th @click="setSort('audit_status')">审核状态 <SortIcon :keyName="'audit_status'" :sortKey="sortKey" :sortOrder="sortOrder"/></th>
          <th @click="setSort('created_at')">创建时间 <SortIcon :keyName="'created_at'" :sortKey="sortKey" :sortOrder="sortOrder"/></th>
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
          <td>
  <span
      :class="{
      'status-pending': n.audit_status === 0,
      'status-approved': n.audit_status === 1,
      'status-rejected': n.audit_status === 2
    }"
  >
    {{ auditText(n.audit_status) }}
  </span>

            <!-- 快速操作按钮 -->
            <button
                v-for="btn in auditOptions(n)"
                :key="btn.value"
                class="btn-action"
                @click="quickAudit(n, btn.value)"
            >
              {{ btn.text }}
            </button>
          </td>
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

    <Pagination :total="filtered.length" v-model:page="page" v-model:pageSize="pageSize" />
  </section>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {listNovels, deleteNovel,auditNovel} from '../api'
import Pagination from '../components/Pagination.vue'

function auditOptions(n) {
  if (n.audit_status === 0) {
    return [
      { text: '通过', value: 1 },
      { text: '拒绝', value: 2 }
    ]
  } else if (n.audit_status === 1) {
    return [{ text: '下线', value: 2 }]
  } else if (n.audit_status === 2) {
    return [{ text: '重新通过', value: 1 }]
  }
  return []
}

async function quickAudit(n, status) {
  try {
    await auditNovel(n.novel_id || n.novel_Id || n.Novel_Id, status)
    await load() // 重新刷新数据
  } catch (err) {
    console.error(err)
    alert('操作失败')
  }
}


// 排序小组件
const SortIcon = {
  props: ['keyName', 'sortKey', 'sortOrder'],
  template: `
    <span v-if="sortKey===keyName">
      {{ sortOrder === 'asc' ? '▲' : '▼' }}
    </span>
  `
}

const novels = ref([])
const page = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const filterStatus = ref('')
const filterAudit = ref('')
const sortKey = ref('id')
const sortOrder = ref('asc')

function auditText(status) {
  switch (status) {
    case 0:
      return '待审核'
    case 1:
      return '已通过'
    case 2:
      return '已拒绝'
    default:
      return '-'
  }
}

// 设置排序
function setSort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// 过滤 + 搜索
const filtered = computed(() => {
  let list = novels.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(n =>
        (n.name && n.name.toLowerCase().includes(q)) ||
        (n.author && n.author.toLowerCase().includes(q))
    )
  }

  if (filterStatus.value !== '') {
    list = list.filter(n => String(n.status) === filterStatus.value)
  }

  if (filterAudit.value !== '') {
    list = list.filter(n => String(n.audit_status) === filterAudit.value)
  }

  return list
})

// 排序
const sorted = computed(() => {
  return [...filtered.value].sort((a, b) => {
    const valA = a[sortKey.value]
    const valB = b[sortKey.value]
    if (valA === valB) return 0
    if (sortOrder.value === 'asc') {
      return valA > valB ? 1 : -1
    } else {
      return valA < valB ? 1 : -1
    }
  })
})

// 分页数据
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return sorted.value.slice(start, start + pageSize.value)
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
.card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .06);
}

.card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 0;
  gap: 12px;
  flex-wrap: wrap;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.actions .btn {
  padding: 8px 12px;
  background: #2563eb;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
}

.table-wrap {
  overflow: auto;
  padding: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
  cursor: pointer;
}

th, td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: left;
  white-space: nowrap;
}

.status-pending {
  color: #f59e0b;
  font-weight: 600;
}

.status-approved {
  color: #22c55e;
  font-weight: 600;
}

.status-rejected {
  color: #ef4444;
  font-weight: 600;
}
</style>