<template>
  <div class="dashboard grid gap-4">
    <!-- 顶部统计 -->
    <div class="card small">
      <h3>小说总数</h3>
      <p class="value">{{ totalNovels }}</p>
    </div>
    <div class="card small">
      <h3>分类数</h3>
      <p class="value">{{ categories.length }}</p>
    </div>
    <div class="card small">
      <h3>今日更新</h3>
      <p class="value">{{ todayUpdateCount }}</p>
    </div>

    <!-- 分类明细 -->
    <div class="card">
      <h3>分类明细</h3>
      <ul>
        <li v-for="c in categories" :key="c.name">
          <div class="category-header" @click="toggleCategory(c.name)">
            {{ c.name }}：{{ c.count }}篇
            <span class="toggle">{{ expandedCategories.includes(c.name) ? '▲' : '▼' }}</span>
          </div>

          <!-- 作者明细 -->
          <ul v-if="expandedCategories.includes(c.name)" class="author-list">
            <li v-for="author in c.authors" :key="author.name">
              作者：{{ author.name }}，小说数：{{ author.novelCount }}，审核有效：{{ author.valid ? '是' : '否' }}
              <ul>
                <li v-for="novel in author.novels" :key="novel.novel_id">
                  <a :href="`/novels/${novel.novel_id}/edit`" target="_blank">{{ novel.name }}</a>
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
const categories = ref([])
const todayUpdateCount = ref(0)
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

  // 分类统计和作者明细
  const categoryMap = {}

  novels.forEach(novel => {
    // 分类初始化
    if (!categoryMap[novel.category]) categoryMap[novel.category] = { count: 0, authors: {} }
    categoryMap[novel.category].count++

    // 作者统计
    const authorName = novel.author
    if (!categoryMap[novel.category].authors[authorName]) {
      categoryMap[novel.category].authors[authorName] = { name: authorName, novelCount: 0, valid: 0, novels: [] }
    }
    categoryMap[novel.category].authors[authorName].novelCount++
    categoryMap[novel.category].authors[authorName].valid += novel.audit_by?.Valid ? 1 : 0
    categoryMap[novel.category].authors[authorName].novels.push(novel)
  })

  // 转换成数组
  categories.value = Object.keys(categoryMap).map(cat => ({
    name: cat,
    count: categoryMap[cat].count,
    authors: Object.values(categoryMap[cat].authors).map(a => ({
      ...a,
      valid: a.valid > 0 // 有效审核就显示是
    }))
  }))

  // 今日更新统计
  const dateMap = {}
  novels.forEach(novel => {
    const date = novel.updated_at?.slice(0, 10)
    if (date) dateMap[date] = (dateMap[date] || 0) + 1
  })
  const today = new Date().toISOString().slice(0, 10)
  todayUpdateCount.value = dateMap[today] || 0
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
</style>