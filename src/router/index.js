import { createRouter, createWebHistory } from 'vue-router'
import NovelsList from '../pages/NovelsList.vue'
import NovelEdit from '../pages/NovelEdit.vue'
import ChaptersList from '../pages/ChaptersList.vue'
import ChapterEdit from '../pages/ChapterEdit.vue'
import ChapterRead from '../pages/ChapterRead.vue'
import Login from '../pages/Login.vue'

const routes = [
  { path: '/', redirect: '/novels' },
  { path: '/login', component: Login },
  { path: '/novels', component: NovelsList },
  { path: '/novels/new', component: NovelEdit },
  { path: '/novels/:novelId/edit', component: NovelEdit, props: true },
  { path: '/novels/:novelId/chapters', component: ChaptersList, props: true },
  { path: '/novels/:novelId/chapters/new', component: ChapterEdit, props: true },
  { path: '/novels/:novelId/chapters/:chapterIndex/edit', component: ChapterEdit, props: true },
  { path: '/read/:novelId/:chapterIndex', component: ChapterRead, props: true }
]

const router = createRouter({ history: createWebHistory(), routes })

// 鉴权开关：当 VITE_AUTH_ENABLED=true 时启用路由守卫，其它情况放行
const authEnabled = (import.meta.env.VITE_AUTH_ENABLED || 'false') === 'true'

// 需要登录的路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  if (!authEnabled) return next()
  const token = localStorage.getItem('token')
  if (token) return next()
  next({ path: '/login', query: { redirect: to.fullPath } })
})

// 记录最近访问的小说与章节，供导航栏“直达”链接使用
router.afterEach((to) => {
  const novelId = to.params?.novelId
  const chapterIndex = to.params?.chapterIndex
  if (novelId != null) localStorage.setItem('lastNovelId', String(novelId))
  if (chapterIndex != null) localStorage.setItem('lastChapterIndex', String(chapterIndex))
})

export default router
