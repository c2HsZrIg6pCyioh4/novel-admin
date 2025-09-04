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

      <!-- 封面选择方式 -->
      <div class="row cover-mode">
        <label>封面方式</label>
        <select v-model="coverMode">
          <option value="upload">上传图片</option>
          <option value="url">输入地址</option>
        </select>
      </div>

      <!-- 上传模式 -->
      <div v-if="coverMode === 'upload'" class="row cover-upload">
        <label>封面</label>
        <div
            class="dropzone"
            @dragover.prevent
            @dragenter.prevent
            @drop.prevent="handleDrop"
        >
          <input
              ref="fileInput"
              type="file"
              accept="image/*"
              hidden
              @change="handleFileChange"
          />
          <div v-if="uploading">上传中...</div>
          <div v-else-if="form.cover_url">
            <img :src="form.cover_url" alt="封面预览" class="preview" />
            <button type="button" @click="removeCover">移除</button>
          </div>
          <div v-else>
            拖拽图片到此处，或 <span class="link" @click="selectFile">点击上传</span>
          </div>
        </div>
      </div>

      <!-- 地址模式 -->
      <div v-else class="row">
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
import { uploadImage,getNovel, createNovel, updateNovel } from '../api'

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

const uploading = ref(false)
const fileInput = ref(null)
const coverMode = ref('url') // 默认使用上传模式

onMounted(async () => {
  if (isEdit.value) {
    const data = await getNovel(novelId)
    form.value = {
      novel_id: data.novel_id || data.novel_Id || data.Novel_Id || novelId,
      name: data.name,
      author: data.author,
      category: data.category,
      status: data.status ?? 0,
      description: data.description || '',
      cover_url: data.cover_url || ''
    }
    // 如果有封面地址，自动切换到 URL 模式
    if (form.value.cover_url && form.value.cover_url.startsWith('http')) {
      coverMode.value = 'url'
    }
  }
})

/**
 * 提取根域名 + 端口
 */
function getRootDomain(hostname) {
  // 本地开发，保留端口
  if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1'
  ) {
    return window.location.host // 含端口，例如 localhost:5174
  }

  const parts = hostname.split('.')
  if (parts.length <= 2) return hostname

  // 处理常见双后缀
  const tlds = ['com.cn', 'net.cn', 'org.cn', 'gov.cn', 'co.uk']
  const lastTwo = parts.slice(-2).join('.')
  const lastThree = parts.slice(-3).join('.')
  if (tlds.includes(lastTwo)) {
    return lastThree
  }
  return lastTwo
}

const rootDomain = getRootDomain(window.location.hostname)

async function handleFileUpload(file) {
  if (!file) return
  uploading.value = true
  try {
    const relativeUrl = await uploadImage(file)  // 已经返回 /webp/... 相对路径
    form.value.cover_url = 'https://images.'+rootDomain + relativeUrl
  } catch (err) {
    console.error(err)
    alert('上传失败')
  } finally {
    uploading.value = false
  }
}

function handleFileChange(e) {
  handleFileUpload(e.target.files[0])
}

function handleDrop(e) {
  handleFileUpload(e.dataTransfer.files[0])
}

function selectFile() {
  fileInput.value.click()
}

function removeCover() {
  form.value.cover_url = ''
}

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

/* 上传区样式 */
.cover-upload .dropzone {
  flex:1;
  border:2px dashed #d1d5db;
  border-radius:8px;
  padding:20px;
  text-align:center;
  cursor:pointer;
  background:#fafafa;
}
.cover-upload .dropzone:hover {
  background:#f0fdf4;
}
.cover-upload .preview {
  max-height:120px;
  border-radius:8px;
  margin-bottom:8px;
}
.cover-upload .link {
  color:#10b981;
  cursor:pointer;
  text-decoration:underline;
}
</style>