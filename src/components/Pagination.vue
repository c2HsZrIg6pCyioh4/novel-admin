<template>
  <div class="pager" v-if="total > pageSize">
    <button :disabled="page===1" @click="$emit('update:page', page-1)">上一页</button>
    <span>{{ page }} / {{ pages }}</span>
    <button :disabled="page===pages" @click="$emit('update:page', page+1)">下一页</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ total: Number, page: Number, pageSize: Number })
const pages = computed(() => Math.max(1, Math.ceil((props.total || 0) / (props.pageSize || 10))))
</script>

<style scoped>
.pager { display:flex; align-items:center; gap:12px; justify-content:center; padding: 12px 0; }
.pager button { padding:6px 10px; border-radius:8px; border:1px solid #ddd; background:#fff; cursor:pointer; }
.pager button[disabled] { opacity:.5; cursor:not-allowed; }
</style>
