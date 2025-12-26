<template>
  <div class="base-card">
    <div class="card">
      <slot name="header">
        <h2 v-if="title">{{ title }}</h2>
      </slot>
      <slot />
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<style scoped>
.base-card {
  width: 100%;
}

.card {
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.card h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}
</style>
