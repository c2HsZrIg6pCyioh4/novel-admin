<template>
  <div class="pager" v-if="total > 0">
    <span class="info">
      共 {{ total }} 条，当前显示 {{ start }} - {{ end }} 条
    </span>

    <button :disabled="page===1" @click="$emit('update:page', 1)">首页</button>
    <button :disabled="page===1" @click="$emit('update:page', page-1)">上一页</button>

    <span>{{ page }} / {{ pages }}</span>

    <button :disabled="page===pages" @click="$emit('update:page', page+1)">下一页</button>
    <button :disabled="page===pages" @click="$emit('update:page', pages)">末页</button>

    <select v-model.number="localPageSize" @change="changePageSize">
      <option :value="5">5 条/页</option>
      <option :value="10">10 条/页</option>
      <option :value="20">20 条/页</option>
      <option :value="50">50 条/页</option>
    </select>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 }
})
const emit = defineEmits(['update:page', 'update:pageSize'])

// 使用 localPageSize 以便选择后分页器能立即反映新值（父组件可能在 nextTick 才更新 props）
const localPageSize = ref(props.pageSize)
watch(() => props.pageSize, v => (localPageSize.value = v))

const pages = computed(() => Math.max(1, Math.ceil((props.total || 0) / (localPageSize.value || 10))))

const start = computed(() => {
  if (!props.total) return 0
  return (props.page - 1) * localPageSize.value + 1
})
const end = computed(() => Math.min(props.page * localPageSize.value, props.total))

function changePageSize() {
  // 先在本地立即反映，然后通知父组件更新 pageSize 并回到首页
  emit('update:pageSize', localPageSize.value)
  emit('update:page', 1)
}
</script>

<style scoped>
.pager {
  display:flex; align-items:center; gap:12px; justify-content:center; padding:12px 0; flex-wrap:wrap;
}
.pager button { padding:6px 10px; border-radius:8px; border:1px solid #ddd; background:#fff; cursor:pointer; }
.pager button[disabled] { opacity:.5; cursor:not-allowed; }
select { padding:4px 6px; border-radius:6px; border:1px solid #ddd; }
.info { font-size:14px; color:#666; }
</style>