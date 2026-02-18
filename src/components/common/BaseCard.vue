<template>
  <div class="base-card">
    <div class="card">
      <slot name="header">
        <h2 v-if="title" class="card-title">
          <span class="card-title-dot" />
          {{ title }}
        </h2>
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
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  transition:
    box-shadow var(--transition-normal),
    border-color var(--transition-normal),
    transform var(--transition-normal);
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-accent);
  opacity: 0.5;
  transition: opacity var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.card:hover::before {
  opacity: 1;
}

.card-title {
  margin: 0 0 1.25rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.card-title-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gradient-primary);
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(45, 157, 106, 0.3);
}
</style>
