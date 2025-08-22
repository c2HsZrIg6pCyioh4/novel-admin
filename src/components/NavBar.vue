<template>
  <header class="nav">
    <div class="brand">Novel Admin</div>

    <nav class="links">
      <router-link to="/novels">📚 小说列表</router-link>
    </nav>
  </header>
</template>

<script setup>
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #111827;
  color: #fff;
}

.brand { font-weight: 700; white-space: nowrap; }

.links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.links a { color: #cbd5e1; text-decoration: none; }
.links a.router-link-active { color: #fff; font-weight: 600; }
</style>