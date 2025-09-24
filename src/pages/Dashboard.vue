<template>
<div class="dashboard-container">
  <!-- 顶部统计卡片网格 -->
  <div class="stats-grid">
    <!-- 小说总数 -->
    <div class="stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <div class="stat-content">
        <h3 class="stat-title">小说总数</h3>
        <p class="stat-value">{{ totalNovels }}</p>
        <p class="stat-meta">
          <span class="audited">{{ auditedCount }} 已审核 ({{ totalNovels > 0 ? ((auditedCount / totalNovels) * 100).toFixed(1) : 0 }}%)</span>
          <span class="divider">•</span>
          <span class="unaudited">{{ unauditedCount }} 未审核 ({{ totalNovels > 0 ? ((unauditedCount / totalNovels) * 100).toFixed(1) : 0 }}%)</span>
        </p>
      </div>
    </div>

    <!-- 分类数 -->
    <div class="stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <div class="stat-content">
        <h3 class="stat-title">分类数</h3>
        <p class="stat-value">{{ categories.length }}</p>
        <div class="category-preview">
          <span v-for="c in categories.slice(0, 3)" :key="c.name" class="category-tag">
            {{ c.name }}
          </span>
          <span v-if="categories.length > 3" class="category-more">+{{ categories.length - 3 }}更多</span>
        </div>
      </div>
    </div>

    <!-- 今日更新 -->
    <div class="stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="stat-content">
        <h3 class="stat-title">今日更新</h3>
        <p class="stat-value">{{ todayUpdateCount }}</p>
        <p class="stat-meta">
          <span class="audited">{{ todayAudited }} 已审核</span>
          <span class="divider">•</span>
          <span class="unaudited">{{ todayUnaudited }} 未审核</span>
        </p>
      </div>
    </div>
  </div>

  <!-- 分类分布统计 -->
  <div class="category-distribution-section">
    <div class="section-header">
      <h2 class="section-title">分类分布统计</h2>
      <div class="section-summary">
        <span class="total-categories">共 {{ categories.length }} 个分类</span>
        <span class="divider">•</span>
        <span class="total-novels">{{ totalNovels }} 篇小说</span>
      </div>
    </div>

    <!-- 分类汇总表格 -->
    <div class="category-summary-table">
      <div class="table-header">
        <span>分类名称</span>
        <span>小说数量</span>
        <span>已审核</span>
        <span>未审核</span>
        <span>审核率</span>
        <span>占比</span>
      </div>
      <div v-for="c in categories" :key="c.name" class="table-row">
        <span class="category-name">{{ c.name }}</span>
        <span class="novel-count">{{ c.count }}</span>
        <span class="audited-count">{{ c.audited }}</span>
        <span class="unaudited-count">{{ c.unaudited }}</span>
        <span class="audit-rate" :class="getAuditRateClass(c)">
          {{ c.count > 0 ? ((c.audited / c.count) * 100).toFixed(1) : 0 }}%
        </span>
        <span class="percentage">
          {{ totalNovels > 0 ? ((c.count / totalNovels) * 100).toFixed(1) : 0 }}%
        </span>
      </div>
    </div>
  </div>

  <!-- 主要内容区域 -->
  <div class="content-grid">
    <!-- 今日更新明细 -->
    <div class="content-card" v-if="todayUpdateCount > 0">
      <div class="card-header">
        <h3 class="card-title">今日更新明细</h3>
        <span class="badge">{{ todayUpdateCount }} 篇</span>
      </div>
      <div class="card-content">
        <div v-for="author in todayAuthors" :key="author.name" class="author-section">
          <div class="author-header">
            <h4 class="author-name">{{ author.name }}</h4>
            <div class="author-stats">
              <span class="stat-pill">{{ author.novelCount }} 篇</span>
              <span class="stat-pill success">{{ author.auditedCount }} 已审</span>
              <span class="stat-pill warning">{{ author.unauditedCount }} 未审</span>
            </div>
          </div>
          <div class="novel-list">
            <div v-for="novel in author.novels" :key="novel.novel_id" class="novel-item">
              <div class="novel-info">
                <span class="novel-name">{{ novel.name }}</span>
                <span class="audit-status" :class="novel.audit_by?.Valid ? 'audited' : 'unaudited'">
                  {{ novel.audit_by?.Valid ? '✓ 已审核' : '⏳ 未审核' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类明细 -->
    <div class="content-card category-details">
      <div class="card-header">
        <h3 class="card-title">分类明细</h3>
        <span class="badge">{{ categories.length }} 个分类</span>
      </div>
      <div class="card-content">
        <div v-for="c in categories" :key="c.name" class="category-section">
          <div class="category-header" @click="toggleCategory(c.name)">
            <div class="category-info">
              <h4 class="category-name">{{ c.name }}</h4>
              <div class="category-stats">
                <span class="total">{{ c.count }} 篇</span>
                <span class="audited">{{ c.audited }} 已审</span>
                <span class="unaudited">{{ c.unaudited }} 未审</span>
              </div>
            </div>
            <div class="toggle-indicator">
              {{ expandedCategories.includes(c.name) ? '▲' : '▼' }}
            </div>
          </div>

          <!-- 作者明细 -->
          <div v-if="expandedCategories.includes(c.name)" class="authors-section">
            <div v-for="author in c.authors" :key="author.name" class="author-detail">
              <div class="author-summary">
                <h5 class="author-title">{{ author.name }}</h5>
                <div class="author-meta">
                  <span>{{ author.novelCount }} 篇作品</span>
                </div>
              </div>
              <div class="author-stats">
                <span class="stat-badge success">{{ author.auditedCount }} 已审</span>
                <span class="stat-badge warning">{{ author.unauditedCount }} 未审</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { listNovels } from "../api"

const totalNovels = ref(0)
const auditedCount = ref(0)
const unauditedCount = ref(0)

const categories = ref([])
const todayUpdateCount = ref(0)
const todayAudited = ref(0)
const todayUnaudited = ref(0)
const todayAuthors = ref([])

const expandedCategories = ref([])

function toggleCategory(name) {
  const idx = expandedCategories.value.indexOf(name)
  if (idx === -1) expandedCategories.value.push(name)
  else expandedCategories.value.splice(idx, 1)
}

function getAuditRateClass(category) {
  const auditRate = category.count > 0 ? (category.audited / category.count) : 0
  if (auditRate >= 0.8) return 'high-rate'
  if (auditRate >= 0.5) return 'medium-rate'
  return 'low-rate'
}

onMounted(async () => {
  const res = await listNovels()
  const novels = res || []

  totalNovels.value = novels.length
  auditedCount.value = novels.filter(n => n.audit_by?.Valid).length
  unauditedCount.value = totalNovels.value - auditedCount.value

  // 分类统计和作者明细
  const categoryMap = {}
  novels.forEach(novel => {
    const isAudited = !!novel.audit_by?.Valid

    // 分类
    if (!categoryMap[novel.category]) {
      categoryMap[novel.category] = { count: 0, audited: 0, unaudited: 0, authors: {} }
    }
    categoryMap[novel.category].count++
    if (isAudited) categoryMap[novel.category].audited++
    else categoryMap[novel.category].unaudited++

    // 作者
    const authorName = novel.author
    if (!categoryMap[novel.category].authors[authorName]) {
      categoryMap[novel.category].authors[authorName] = {
        name: authorName, novelCount: 0, auditedCount: 0, unauditedCount: 0, valid: 0, novels: []
      }
    }
    const author = categoryMap[novel.category].authors[authorName]
    author.novelCount++
    if (isAudited) author.auditedCount++
    else author.unauditedCount++
    author.valid += isAudited ? 1 : 0
    author.novels.push(novel)
  })

  categories.value = Object.keys(categoryMap).map(cat => ({
    name: cat,
    count: categoryMap[cat].count,
    audited: categoryMap[cat].audited,
    unaudited: categoryMap[cat].unaudited,
    authors: Object.values(categoryMap[cat].authors).map(a => ({
      ...a,
      valid: a.valid > 0
    }))
  }))

  // 今日更新统计 + 明细
  const today = new Date().toISOString().slice(0, 10)
  const todayNovels = novels.filter(n => n.updated_at?.slice(0, 10) === today)
  todayUpdateCount.value = todayNovels.length
  todayAudited.value = todayNovels.filter(n => n.audit_by?.Valid).length
  todayUnaudited.value = todayUpdateCount.value - todayAudited.value

  // 今日更新按作者分组
  const todayAuthorMap = {}
  todayNovels.forEach(novel => {
    const isAudited = !!novel.audit_by?.Valid
    const authorName = novel.author
    if (!todayAuthorMap[authorName]) {
      todayAuthorMap[authorName] = { name: authorName, novelCount: 0, auditedCount: 0, unauditedCount: 0, novels: [] }
    }
    const author = todayAuthorMap[authorName]
    author.novelCount++
    if (isAudited) author.auditedCount++
    else author.unauditedCount++
    author.novels.push(novel)
  })
  todayAuthors.value = Object.values(todayAuthorMap)
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
  color: #4b5563;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  line-height: 1;
}

.stat-meta {
  font-size: 12px;
  color: #9ca3af;
}

.stat-meta .audited {
  color: #10b981;
}

.stat-meta .unaudited {
  color: #ef4444;
}

.stat-meta .divider {
  margin: 0 6px;
}

.category-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.category-tag {
  background: #f3f4f6;
  color: #4b5563;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.category-more {
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.badge {
  background: #f3f4f6;
  color: #4b5563;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.card-content {
  padding: 24px;
}

/* 作者部分 */
.author-section {
  margin-bottom: 20px;
}

.author-section:last-child {
  margin-bottom: 0;
}

.author-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.author-stats {
  display: flex;
  gap: 6px;
}

.stat-pill {
  background: #f3f4f6;
  color: #4b5563;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.stat-pill.success {
  background: #d1fae5;
  color: #065f46;
}

.stat-pill.warning {
  background: #fef3c7;
  color: #92400e;
}

.novel-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.novel-item {
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.2s ease;
}

.novel-item:hover {
  border-color: #e5e7eb;
  background: #f9fafb;
}

.novel-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.novel-name {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.audit-status {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 6px;
}

.audit-status.audited {
  background: #d1fae5;
  color: #065f46;
}

.audit-status.unaudited {
  background: #fef3c7;
  color: #92400e;
}

/* 分类详情 */
.category-section {
  margin-bottom: 16px;
}

.category-section:last-child {
  margin-bottom: 0;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-header:hover {
  background: #f3f4f6;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.category-stats {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.category-stats .total {
  font-weight: 500;
}

.category-stats .audited {
  color: #10b981;
}

.category-stats .unaudited {
  color: #ef4444;
}

.toggle-indicator {
  color: #9ca3af;
  font-size: 12px;
}

/* 作者详情 */
.authors-section {
  margin-top: 12px;
  padding-left: 20px;
  border-left: 2px solid #e5e7eb;
}

.author-detail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #f9fafb;
  border-radius: 6px;
}

.author-detail:last-child {
  margin-bottom: 0;
}

.author-summary {
  flex: 1;
}

.author-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 2px 0;
}

.author-meta {
  font-size: 11px;
  color: #6b7280;
}

.author-meta .divider {
  margin: 0 4px;
}

.author-stats {
  display: flex;
  gap: 4px;
}

.stat-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.stat-badge.success {
  background: #d1fae5;
  color: #065f46;
}

.stat-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.text-green-600 {
  color: #059669;
}

.text-orange-600 {
  color: #ea580c;
}

/* 统计数据显示区域样式 */
.stats-display-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.stats-content {
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.stats-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.stats-value-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 2px;
}

.stats-value.audited {
  color: #10b981;
}

.stats-value.unaudited {
  color: #ef4444;
}

.stats-percentage {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
}

.stats-total {
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  grid-column: 1 / -1;
}

.category-stats-item {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.category-stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-name {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.category-count {
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 4px;
}

.category-stats-details {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #6b7280;
}

.category-stats-details .audited {
  color: #10b981;
}

.category-stats-details .unaudited {
  color: #ef4444;
}

.category-percentage {
  font-weight: 500;
  color: #3b82f6;
}

/* 分类分布统计样式 */
.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.section-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.total-categories, .total-novels {
  font-weight: 500;
}

/* 分类统计卡片样式 */
.category-stat-card {
  flex-direction: column;
  align-items: flex-start;
}

.stat-progress {
  width: 100%;
  margin: 12px 0;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-percentage {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  margin-top: 4px;
}

.stat-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  margin-top: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-label {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 2px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
}

.detail-value.high-rate {
  color: #10b981;
}

.detail-value.medium-rate {
  color: #f59e0b;
}

.detail-value.low-rate {
  color: #ef4444;
}

/* 分类汇总表格样式 */
.category-summary-table {
  margin-top: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  font-weight: 600;
  font-size: 12px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}

.table-row:last-child {
  border-bottom: none;
}

.category-name {
  font-weight: 500;
  color: #1f2937;
}

.novel-count, .audited-count, .unaudited-count {
  text-align: center;
  font-weight: 500;
}

.audit-rate, .percentage {
  text-align: center;
  font-weight: 600;
}

.audit-rate.high-rate {
  color: #10b981;
}

.audit-rate.medium-rate {
  color: #f59e0b;
}

.audit-rate.low-rate {
  color: #ef4444;
}

.percentage {
  color: #3b82f6;
}
</style>
