<template>
  <div class="dashboard grid gap-4">
    <!-- 顶部统计 -->
    <div class="card small">
      <h3>小说总数</h3>
      <p class="value">{{ totalNovels }}</p>
      <p class="sub">已审核：{{ auditedCount }} / 未审核：{{ unauditedCount }}</p>
    </div>
    <div class="card small">
      <h3>分类数</h3>
      <p class="value">{{ categories.length }}</p>
    </div>
    <div class="card small">
      <h3>今日更新</h3>
      <p class="value">{{ todayUpdateCount }}</p>
      <p class="sub">已审核：{{ todayAudited }} / 未审核：{{ todayUnaudited }}</p>
    </div>

    <!-- 今日更新明细 -->
    <div class="card" v-if="todayUpdateCount > 0">
      <h3>今日更新明细</h3>
      <ul>
        <li v-for="author in todayAuthors" :key="author.name">
          作者：{{ author.name }}，
          小说数：{{ author.novelCount }}，
          已审核：{{ author.auditedCount }}，
          未审核：{{ author.unauditedCount }}
          <ul>
            <li v-for="novel in author.novels" :key="novel.novel_id">
              <a :href="`/novels/${novel.novel_id}/edit`" target="_blank">
                {{ novel.name }}
              </a>
              <span
                  class="audit-tag"
                  :class="novel.audit_by?.Valid ? 'audited' : 'unaudited'"
              >
                {{ novel.audit_by?.Valid ? '已审核' : '未审核' }}
              </span>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <!-- 分类明细 -->
    <div class="card">
      <h3>分类明细</h3>
      <ul>
        <li v-for="c in categories" :key="c.name">
          <div class="category-header" @click="toggleCategory(c.name)">
            {{ c.name }}：{{ c.count }}篇
            （已审核：{{ c.audited }} / 未审核：{{ c.unaudited }}）
            <span class="toggle">{{ expandedCategories.includes(c.name) ? '▲' : '▼' }}</span>
          </div>

          <!-- 作者明细 -->
          <ul v-if="expandedCategories.includes(c.name)" class="author-list">
            <li v-for="author in c.authors" :key="author.name">
              作者：{{ author.name }}，
              小说数：{{ author.novelCount }}，
              已审核：{{ author.auditedCount }}，
              未审核：{{ author.unauditedCount }}，
              审核有效：{{ author.valid ? '是' : '否' }}
              <ul>
                <li v-for="novel in author.novels" :key="novel.novel_id">
                  <a :href="`/novels/${novel.novel_id}/edit`" target="_blank">
                    {{ novel.name }}
                  </a>
                  <span
                      class="audit-tag"
                      :class="novel.audit_by?.Valid ? 'audited' : 'unaudited'"
                  >
                    {{ novel.audit_by?.Valid ? '已审核' : '未审核' }}
                  </span>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
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

    if (!categoryMap[novel.category]) {
      categoryMap[novel.category] = { count: 0, audited: 0, unaudited: 0, authors: {} }
    }
    categoryMap[novel.category].count++
    if (isAudited) categoryMap[novel.category].audited++
    else categoryMap[novel.category].unaudited++

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
.dashboard {
  padding: 16px;
  display: grid;
  gap: 12px;
}

.card {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.card.small {
  min-height: 80px;
  padding: 8px;
}

.card h3 {
  font-size: 14px;
  margin-bottom: 4px;
}

.card .value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.card .sub {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.card ul {
  padding-left: 16px;
  margin: 0;
}

.card ul li {
  font-size: 14px;
  margin-bottom: 4px;
}

.category-header {
  cursor: pointer;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
}

.author-list {
  padding-left: 16px;
}

.author-list ul {
  padding-left: 16px;
}

.author-list a {
  color: #3b82f6;
  text-decoration: none;
}

.author-list a:hover {
  text-decoration: underline;
}

.toggle {
  font-size: 12px;
  color: #888;
}

.audit-tag {
  margin-left: 6px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
}

.audit-tag.audited {
  background-color: #d1fae5; /* 绿色淡背景 */
  color: #065f46;
}

.audit-tag.unaudited {
  background-color: #fee2e2; /* 红色淡背景 */
  color: #991b1b;
}
</style>