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
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--glass-border);
  border-top: 1px solid var(--glass-border-shine);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-elevated);
  position: relative;
  overflow: hidden;
  transition:
    box-shadow var(--transition-fluid),
    border-color var(--transition-fluid),
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
  background-size: 200% 100%;
  opacity: 0.5;
  transition: opacity var(--transition-fluid);
}

.card::after {
  content: '';
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 80px;
  background: radial-gradient(ellipse at center, rgba(34, 197, 94, 0.06) 0%, transparent 70%);
  pointer-events: none;
  transition: opacity var(--transition-fluid);
  opacity: 0;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--border-hover);
  transform: translateY(-3px);
}

.card:hover::before {
  opacity: 1;
  animation: shimmer 2s ease-in-out infinite;
}

.card:hover::after {
  opacity: 1;
}

.card-title {
  margin: 0 0 1.25rem;
  font-size: 1.05rem;
  font-weight: 600;
  font-family: var(--font-heading);
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
  animation: pulseGlow 3s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .card-title-dot {
    animation: none;
    box-shadow: 0 0 6px rgba(34, 197, 94, 0.3);
  }
}
</style>
