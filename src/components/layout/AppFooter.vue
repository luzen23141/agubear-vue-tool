<template>
  <footer class="app-footer">
    <div class="footer-divider" />
    <p class="footer-copyright">
      {{ t('app.footer.copyright') }}
    </p>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.app-footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
}

.footer-divider {
  height: 2px;
  background: var(--gradient-accent);
  background-size: 200% 100%;
  animation: shimmer 6s ease-in-out infinite;
  opacity: 0.25;
  margin-bottom: 1rem;
  border-radius: 1px;
}

.footer-copyright {
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
  letter-spacing: 0.01em;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
