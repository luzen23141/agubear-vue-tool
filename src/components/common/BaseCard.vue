<template>
  <div class="base-card">
    <div class="card">
      <slot name="header">
        <component :is="headingTag || 'h2'" v-if="title" class="card-title">
          <span class="card-title-dot" />
          {{ title }}
        </component>
      </slot>
      <slot />
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  headingTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
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
  animation: cardFloat 6s ease-in-out infinite;
}

@keyframes cardFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
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
  box-shadow: var(--shadow-elevated);
  border-color: var(--primary-soft);
  transform: translateY(-4px) scale(1.01);
  animation-play-state: paused;
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
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--gradient-primary);
  flex-shrink: 0;
  animation: pulseGlow 2.5s ease-in-out infinite;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
}

@keyframes pulseGlow {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
    box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
  }
  50% {
    transform: scale(1.25);
    opacity: 1;
    box-shadow: 0 0 16px rgba(99, 102, 241, 0.6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-title-dot {
    animation: none;
    box-shadow: 0 0 6px rgba(34, 197, 94, 0.3);
  }
}
</style>
