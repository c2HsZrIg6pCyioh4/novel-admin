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

    <!-- 网格布局显示小说列表 -->
    <div class="novels-grid">
      <div v-for="n in paginated" :key="n.id" class="novel-card">
        <div class="novel-content">
          <!-- 封面图片 -->
          <div class="novel-cover">
            <img 
              v-if="n.cover_url" 
              :src="n.cover_url" 
              :alt="n.name" 
              class="cover-image"
              @error="handleImageError"
            />
            <div v-else class="cover-placeholder">
              {{ n.name?.charAt(0) || 'N' }}
            </div>
          </div>
          
          <!-- 右侧内容区域 -->
          <div class="novel-right">
            <!-- 小说信息 -->
            <div class="novel-info">
              <h3 class="novel-title">{{ n.name }}</h3>
              <p class="novel-author">作者: {{ n.author }}</p>
              <p class="novel-category">分类: {{ n.category }}</p>
              
              <!-- 状态信息 -->
              <div class="novel-status">
                <span :class="'status-' + (n.status===1 ? 'completed' : 'ongoing')">
                  {{ n.status===1 ? '已完结' : '连载中' }}
                </span>
                <span :class="'audit-status audit-' + n.audit_status">
                  {{ auditText(n.audit_status) }}
                </span>
              </div>
              
              <!-- 创建时间 -->
              <p class="novel-date">创建: {{ fmt(n.created_at) }}</p>
            </div>
            
            <!-- 操作按钮 -->
            <div class="novel-actions">
              <!-- 快速审核按钮 -->
              <div class="quick-audit-buttons">
                <button
                    v-for="btn in auditOptions(n)"
                    :key="btn.value"
                    class="btn-action"
                    @click="quickAudit(n, btn.value)"
                >
                  {{ btn.text }}
                </button>
              </div>
              
              <!-- 管理按钮 -->
              <div class="management-buttons">
                <router-link 
                  :to="`/novels/${n.novel_id || n.novel_Id || n.Novel_Id}/chapters`" 
                  class="btn-link"
                >
                  目录
                </router-link>
                <router-link 
                  :to="`/novels/${n.novel_id || n.novel_Id || n.Novel_Id}/edit`" 
                  class="btn-link"
                >
                  编辑
                </router-link>
                <button 
                  @click="del(n)" 
                  class="btn-link danger"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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

function handleImageError(event) {
  // 图片加载失败时，隐藏图片显示占位符
  event.target.style.display = 'none'
  const placeholder = event.target.nextElementSibling
  if (placeholder && placeholder.classList.contains('cover-placeholder')) {
    placeholder.style.display = 'block'
  }
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

/* 小说网格布局 */
.novels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  padding: 16px;
}

.novel-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.novel-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

/* 内容布局 */
.novel-content {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

/* 封面样式 */
.novel-cover {
  position: relative;
  height: 200px;          /* 图片高度缩小为80px */
  aspect-ratio: 3 / 5;   /* 封面常见比例，3:5 */
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 1px solid var(--border, #e5e7eb);
  flex-shrink: 0;
}

/* 右侧内容区域 */
.novel-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cover-image:hover {
  transform: scale(1.05);
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 36px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 小说信息样式 */
.novel-info {
  margin-bottom: 12px;
}

.novel-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #1f2937;
  line-height: 1.3;
}

.novel-author,
.novel-category,
.novel-date {
  margin: 3px 0;
  font-size: 12px;
  color: #6b7280;
}

.novel-status {
  display: flex;
  gap: 8px;
  margin: 8px 0;
  flex-wrap: wrap;
}

.status-ongoing {
  background: #fef3c7;
  color: #92400e;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.audit-status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.audit-0 {
  background: #fef3c7;
  color: #92400e;
}

.audit-1 {
  background: #d1fae5;
  color: #065f46;
}

.audit-2 {
  background: #fee2e2;
  color: #991b1b;
}

/* 操作按钮样式 */
.novel-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-audit-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-action {
  padding: 4px 8px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-action:hover {
  background: #2563eb;
}

.management-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-link {
  padding: 4px 8px;
  background: #e5e7eb;
  color: #374151;
  text-decoration: none;
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.btn-link:hover {
  background: #d1d5db;
}

.btn-link.danger {
  background: #fee2e2;
  color: #991b1b;
}

.btn-link.danger:hover {
  background: #fecaca;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .novels-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    padding: 12px;
  }
  
  .novel-card {
    padding: 12px;
  }
  
  .novel-cover {
    height: 150px;
  }
  
  .novel-title {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .novels-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .card-hd {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .actions .btn {
    text-align: center;
  }
}
</style>
