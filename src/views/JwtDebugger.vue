<template>
  <ToolPageLayout :title="t('jwt.title')" tool-key="jwt">
    <!-- Action Bar -->
    <div class="action-buttons mb-8">
      <button class="btn-text" type="button" @click="handleClear">
        <SvgIcon name="trash" /> {{ t('common.clear') }}
      </button>
    </div>

    <div class="converter-grid">
      <!-- Input Area -->
      <div class="input-section">
        <label class="pane-label">{{ t('jwt.inputLabel') }}</label>
        <InputWithCopy
          id="jwt-input"
          v-model="jwtInput"
          :placeholder="t('jwt.inputPlaceholder')"
          class="jwt-input-field"
          allow-paste
        />
        <div v-if="error" class="error-message">
          <span class="error-icon"><SvgIcon name="alert-triangle" size="0.9rem" /></span>
          <span>{{ error }}</span>
        </div>
      </div>

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

        <div class="decoded-grid">
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
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { jwtDecode } from 'jwt-decode';
import ToolPageLayout from '@/components/layout/ToolPageLayout.vue';
import BaseCard from '@/components/common/BaseCard.vue';
import InputWithCopy from '@/components/common/InputWithCopy.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

const { t } = useI18n();

interface JwtHeader {
  alg?: string;
  typ?: string;
  [key: string]: unknown;
}
interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

const jwtInput = ref('');
const decodedHeader = ref<JwtHeader | null>(null);
const decodedPayload = ref<JwtPayload | null>(null);
const error = ref<string | null>(null);

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
</script>

<style scoped>
.action-buttons {
  display: flex;
  justify-content: flex-end;
}

.btn-text {
  background: transparent;
  color: var(--text-muted);
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
}

.btn-text:hover {
  color: #e05252;
  background: rgba(224, 82, 82, 0.1);
}

.converter-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.pane-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.jwt-input-field) textarea {
  height: 140px;
}

.error-message {
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(224, 82, 82, 0.1);
  border-left: 3px solid #e05252;
  border-radius: var(--radius-sm);
  color: #e05252;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.output-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
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
  padding: 14px 20px;
  background: var(--background-alt);
  border-left: 5px solid var(--text-muted);
  border-radius: var(--radius-sm);
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
  gap: 10px;
  font-size: 0.95rem;
}

.status-item .label {
  font-weight: 600;
  color: var(--text-secondary);
}

.status-item .value {
  font-family: 'SF Mono', monospace;
  color: var(--text-primary);
}

.badge-valid {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 800;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.badge-expired {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 800;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.decoded-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .decoded-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.code-card :deep(.card) {
  border-left: 4px solid;
  height: 100%;
}

.header-card :deep(.card) {
  border-left-color: #fbbf24;
}

.payload-card :deep(.card) {
  border-left-color: #14b8a6;
}

.json-display {
  margin: 0;
  padding: 4px;
  background: transparent;
  overflow-x: auto;
  font-family: 'SF Mono', 'Cascadia Code', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Syntax Highlighting */
:deep(.string) {
  color: #10b981;
}
:deep(.number) {
  color: #3b82f6;
}
:deep(.boolean) {
  color: #f59e0b;
}
:deep(.null) {
  color: #9ca3af;
}
:deep(.key) {
  color: #ef4444;
}
</style>
