<template>
  <ToolPageLayout :title="t('jwt.title')" tool-key="jwt">
    <div class="tool-actions jwt-actions">
      <button class="btn-text" type="button" @click="handleClear">
        <SvgIcon name="trash" /> {{ t('common.clear') }}
      </button>
    </div>

    <div class="converter-grid jwt-layout">
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

      <div v-if="decodedHeader || decodedPayload" class="output-section">
        <div :class="{ expired: isExpired, valid: !isExpired && expDate }" class="status-bar">
          <div class="status-item">
            <span class="label">Algorithm</span>
            <span class="value">{{ decodedHeader?.alg || 'Unknown' }}</span>
          </div>
          <div v-if="expDate" class="status-item">
            <span class="label">Expires</span>
            <span class="value">{{ expDate.toLocaleString() }}</span>
            <span v-if="isExpired" class="badge-expired">EXPIRED</span>
            <span v-else class="badge-valid">VALID</span>
          </div>
        </div>

        <div class="decoded-grid">
          <BaseCard title="Header" class="code-card header-card">
            <pre
              class="json-display"
            ><template v-for="(line, lineIndex) in highlightedHeaderLines" :key="`header-${lineIndex}`"><span v-for="(token, tokenIndex) in line" :key="`header-${lineIndex}-${tokenIndex}`" :class="token.className">{{ token.text }}</span>
</template></pre>
          </BaseCard>

          <BaseCard title="Payload" class="code-card payload-card">
            <pre
              class="json-display"
            ><template v-for="(line, lineIndex) in highlightedPayloadLines" :key="`payload-${lineIndex}`"><span v-for="(token, tokenIndex) in line" :key="`payload-${lineIndex}-${tokenIndex}`" :class="token.className">{{ token.text }}</span>
</template></pre>
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

type JsonTokenClass = 'string' | 'number' | 'boolean' | 'null' | 'key';

type JsonToken = {
  text: string;
  className?: JsonTokenClass;
};

type JsonTokenLine = JsonToken[];

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

const formatJsonValue = (value: unknown): JsonToken => {
  if (typeof value === 'string') {
    return { text: JSON.stringify(value), className: 'string' };
  }

  if (typeof value === 'number') {
    return { text: String(value), className: 'number' };
  }

  if (typeof value === 'boolean') {
    return { text: String(value), className: 'boolean' };
  }

  if (value === null) {
    return { text: 'null', className: 'null' };
  }

  return { text: JSON.stringify(value) ?? String(value) };
};

const indentText = (depth: number) => '  '.repeat(depth);

const buildJsonTokenLines = (value: unknown, depth = 0): JsonTokenLine[] => {
  if (Array.isArray(value)) {
    if (value.length === 0) return [[{ text: '[]' }]];

    return [
      [{ text: '[' }],
      ...value.flatMap((item, index) => {
        const itemLines = buildJsonTokenLines(item, depth + 1);
        return itemLines.map((line, lineIndex) => [
          { text: indentText(depth + 1) },
          ...line,
          ...(lineIndex === itemLines.length - 1 && index < value.length - 1 ? [{ text: ',' }] : [])
        ]);
      }),
      [{ text: `${indentText(depth)}]` }]
    ];
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return [[{ text: '{}' }]];

    return [
      [{ text: '{' }],
      ...entries.flatMap(([key, entryValue], index) => {
        const valueLines = buildJsonTokenLines(entryValue, depth + 1);
        return valueLines.map((line, lineIndex) => {
          if (lineIndex === 0) {
            return [
              { text: indentText(depth + 1) },
              { text: JSON.stringify(key), className: 'key' },
              { text: ': ' },
              ...line,
              ...(index < entries.length - 1 ? [{ text: ',' }] : [])
            ];
          }

          return [{ text: indentText(depth + 1) }, ...line];
        });
      }),
      [{ text: `${indentText(depth)}}` }]
    ];
  }

  return [[formatJsonValue(value)]];
};

const highlightedHeaderLines = computed(() =>
  decodedHeader.value ? buildJsonTokenLines(decodedHeader.value) : []
);
const highlightedPayloadLines = computed(() =>
  decodedPayload.value ? buildJsonTokenLines(decodedPayload.value) : []
);

watch(jwtInput, (newValue) => {
  if (!newValue.trim()) {
    handleClear();
    return;
  }

  try {
    error.value = null;
    decodedHeader.value = jwtDecode(newValue, { header: true });
    decodedPayload.value = jwtDecode(newValue);
  } catch {
    decodedHeader.value = null;
    decodedPayload.value = null;
    error.value = t('jwt.invalidToken');
  }
});
</script>

<style scoped>
.jwt-actions {
  justify-content: flex-end;
}

.jwt-layout {
  align-items: start;
}

:deep(.jwt-input-field) textarea {
  height: 140px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.9rem;
  background: var(--status-danger-soft);
  border-left: 3px solid var(--status-danger);
  border-radius: var(--radius-sm);
  color: var(--status-danger);
  font-size: 0.9rem;
}

.output-section {
  display: grid;
  gap: 1.25rem;
}

.status-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  padding: 1rem 1.1rem;
  background: var(--surface-hover);
  border-left: 4px solid var(--text-muted);
  border-radius: var(--radius-md);
}

.status-bar.valid {
  border-left-color: var(--status-success);
}

.status-bar.expired {
  border-left-color: var(--status-danger);
}

.status-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.status-item .label {
  font-weight: 700;
  color: var(--text-secondary);
}

.status-item .value {
  font-family: var(--font-mono);
  color: var(--text-primary);
}

.badge-valid,
.badge-expired {
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 800;
}

.badge-valid {
  background: var(--status-success-soft);
  color: var(--status-success);
}

.badge-expired {
  background: var(--status-danger-soft);
  color: var(--status-danger);
}

.decoded-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 1024px) {
  .decoded-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.code-card :deep(.card) {
  border-left: 4px solid;
  height: 100%;
}

.header-card :deep(.card) {
  border-left-color: var(--status-warning);
}

.payload-card :deep(.card) {
  border-left-color: var(--interactive-secondary);
}

.json-display {
  margin: 0;
  padding: 0.25rem;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  line-height: 1.6;
}

:deep(.string) {
  color: var(--status-success);
}

:deep(.number) {
  color: var(--status-info);
}

:deep(.boolean) {
  color: var(--status-warning);
}

:deep(.null) {
  color: var(--text-muted);
}

:deep(.key) {
  color: var(--status-danger);
}
</style>
