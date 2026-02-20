<template>
  <div class="jwt-debugger">
    <div class="description-card">
      <p>{{ t('jwt.description') }}</p>
    </div>

    <div class="converter-grid">
      <!-- Input Area -->
      <BaseCard :title="t('jwt.inputLabel')">
        <div class="input-header">
          <div class="pane-controls">
            <button
              v-if="canPaste"
              :title="t('common.paste')"
              class="icon-btn"
              type="button"
              @click="pasteInput"
            >
              <SvgIcon name="clipboard-paste" /> {{ t('common.paste') }}
            </button>
            <button class="clear-btn" type="button" @click="handleClear">
              {{ t('common.clear') }}
            </button>
          </div>
        </div>
        <textarea
          v-model="jwtInput"
          :placeholder="t('jwt.inputPlaceholder')"
          class="jwt-input"
          spellcheck="false"
        />
        <div v-if="error" class="error-message">
          <span class="error-icon"><SvgIcon name="alert-triangle" size="0.9rem" /></span>
          <span>{{ error }}</span>
        </div>
      </BaseCard>

      <!-- Decoded Output -->
      <div v-if="decodedHeader || decodedPayload" class="output-section">
        <!-- Status Bar -->
        <div :class="{ expired: isExpired, valid: !isExpired && expDate }" class="status-bar">
          <div class="status-item">
            <span class="label">Algorithm:</span>
            <span class="value">{{ decodedHeader?.alg || 'Unknown' }}</span>
          </div>
          <div v-if="expDate" class="status-item">
            <span class="label">Expires:</span>
            <span class="value">{{ expDate.toLocaleString() }}</span>
            <span v-if="isExpired" class="badge-expired">EXPIRED</span>
            <span v-else class="badge-valid">VALID</span>
          </div>
        </div>

        <!-- Header -->
        <BaseCard title="Header" class="code-card header-card">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <pre class="json-display" v-html="syntaxHighlight(decodedHeader)" />
        </BaseCard>

        <!-- Payload -->
        <BaseCard title="Payload" class="code-card payload-card">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <pre class="json-display" v-html="syntaxHighlight(decodedPayload)" />
        </BaseCard>
      </div>
    </div>

    <ToolContext tool-key="jwt" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import { jwtDecode } from 'jwt-decode';
import BaseCard from '@/components/common/BaseCard.vue';
import ToolContext from '@/components/common/ToolContext.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

const { t } = useI18n();

useHead({
  title: computed(() => `${t('app.tabs.jwt')} - ${t('app.title')}`),
  meta: [
    {
      name: 'description',
      content: computed(() => t('seo.jwtDescription'))
    }
  ]
});

const jwtInput = ref('');
const decodedHeader = ref<unknown>(null);
const decodedPayload = ref<unknown>(null);
const error = ref<string | null>(null);

const canPaste = ref(false);

const pasteInput = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) jwtInput.value = text.trim();
  } catch (error_) {
    console.warn('Clipboard read failed', error_);
  }
};

const handleClear = () => {
  jwtInput.value = '';
  decodedHeader.value = null;
  decodedPayload.value = null;
  error.value = null;
};

// Computed expiration
const expDate = computed(() => {
  if (decodedPayload.value?.exp) {
    return new Date(decodedPayload.value.exp * 1000);
  }
  return null;
});

const isExpired = computed(() => {
  if (!expDate.value) return false;
  return expDate.value < new Date();
});

// Decode Logic
watch(jwtInput, (newValue) => {
  if (!newValue.trim()) {
    handleClear();
    return;
  }

  try {
    error.value = null;
    decodedHeader.value = jwtDecode(newValue, { header: true });
    decodedPayload.value = jwtDecode(newValue);
  } catch (error_) {
    // eslint-disable-next-line no-console
    console.debug('JWT decode failed', error_);
    decodedHeader.value = null;
    decodedPayload.value = null;
    error.value = t('jwt.invalidToken');
  }
});

// Simple Syntax Highlighter
const syntaxHighlight = (json: unknown) => {
  if (!json) return '';
  let jsonString = JSON.stringify(json, null, 2);
  jsonString = jsonString.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return jsonString.replaceAll(
    // eslint-disable-next-line security/detect-unsafe-regex, sonarjs/regex-complexity, no-useless-escape
    /("(\\u[\dA-Za-z]{4}|\\[^u]|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[Ee][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'number';
      if (match.startsWith('"')) {
        cls = match.endsWith(':') ? 'key' : 'string';
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
};

onMounted(() => {
  if (navigator.clipboard) canPaste.value = true;
});
</script>

<style scoped>
.jwt-debugger {
  width: 100%;
}

.description-card {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

.converter-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.pane-controls {
  display: flex;
  gap: 8px;
}

.icon-btn,
.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  transition: color var(--transition-fast);
}

.icon-btn:hover {
  color: var(--primary);
}
.clear-btn:hover {
  color: #e05252;
}

.jwt-input {
  width: 100%;
  height: 120px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  color: var(--text-primary);
  font-family: 'SF Mono', monospace;
  font-size: 0.9rem;
  resize: vertical;
}

.jwt-input:focus {
  outline: 2px solid var(--primary-soft);
  border-color: var(--primary);
}

.error-message {
  margin-top: 10px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: var(--radius-sm);
  color: #b91c1c;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.output-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.status-bar {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--surface-raised);
  border-left: 4px solid var(--text-muted);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.status-bar.valid {
  border-left-color: #10b981;
}
.status-bar.expired {
  border-left-color: #ef4444;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.status-item .label {
  font-weight: 600;
  color: var(--text-secondary);
}

.status-item .value {
  font-family: 'SF Mono', monospace;
}

.badge-valid {
  background: #d1fae5;
  color: #065f46;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.badge-expired {
  background: #fee2e2;
  color: #991b1b;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.code-card :deep(.card) {
  border-left: 4px solid;
}

.header-card :deep(.card) {
  border-left-color: #fbbf24;
}
.payload-card :deep(.card) {
  border-left-color: #14b8a6;
}

.json-display {
  margin: 0;
  padding: 12px;
  background: var(--surface-raised);
  border-radius: var(--radius-sm);
  overflow-x: auto;
  font-family: 'SF Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Syntax Highlighting */
:deep(.string) {
  color: #10b981;
}
:deep(.number) {
  color: #3b82f6;
}
:deep(.boolean) {
  color: #10b981;
}
:deep(.null) {
  color: #9ca3af;
}
:deep(.key) {
  color: #ef4444;
}

/* Dark mode overrides would go here if not using vars */
</style>
