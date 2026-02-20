<template>
  <div class="uuid-generator">
    <div class="description-card">
      <p>{{ t('uuid.description') }}</p>
    </div>

    <BaseCard :title="t('uuid.title')">
      <!-- Controls -->
      <div class="controls-grid">
        <!-- Type Selection -->
        <div class="control-group">
          <label class="group-label">{{ t('uuid.typeLabel') }}</label>
          <div class="type-toggles">
            <label
              v-for="type in idTypes"
              :key="type.value"
              :class="{ active: selectedType === type.value }"
              class="type-radio"
            >
              <input v-model="selectedType" :value="type.value" type="radio" class="sr-only" />
              {{ type.label }}
            </label>
          </div>
        </div>

        <!-- Quantity -->
        <div class="control-group">
          <label class="group-label">
            {{ t('uuid.quantityLabel') }}: <span class="qty-val">{{ quantity }}</span>
          </label>
          <input v-model.number="quantity" type="range" min="1" max="50" class="qty-slider" />
        </div>

        <!-- Action -->
        <div class="control-group action-group">
          <button class="generate-btn" type="button" @click="generateIds">
            <SvgIcon name="refresh-cw" /> {{ t('uuid.generate') }}
          </button>
        </div>
      </div>

      <!-- Output -->
      <div class="output-section">
        <div class="output-header">
          <h2>{{ t('uuid.resultLabel') }}</h2>
          <div class="output-actions">
            <button class="copy-btn" type="button" @click="copyAll">
              <SvgIcon name="copy" /> {{ t('common.copy') }}
            </button>
          </div>
        </div>
        <textarea
          ref="outputRef"
          :value="outputString"
          class="uuid-output"
          readonly
          @click="selectAll"
        />
      </div>
    </BaseCard>

    <ToolContext tool-key="uuid" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';
import { ulid } from 'ulid';
import BaseCard from '@/components/common/BaseCard.vue';
import ToolContext from '@/components/common/ToolContext.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

const { t } = useI18n();

useHead({
  title: computed(() => `${t('app.tabs.uuid')} - ${t('app.title')}`),
  meta: [
    {
      name: 'description',
      content: computed(() => t('seo.uuidDescription'))
    }
  ]
});

type ToastFunction = (_message: string, _type: 'success' | 'error' | 'info') => void;
const showToast = inject('showToast', (() => {}) as ToastFunction);

const idTypes = [
  { value: 'v4', label: 'UUID v4' },
  { value: 'v7', label: 'UUID v7' },
  { value: 'ulid', label: 'ULID' }
];

const selectedType = ref('v4');
const quantity = ref(1);
const generatedIds = ref<string[]>([]);
const outputRef = ref<HTMLTextAreaElement | null>(null);

const outputString = computed(() => generatedIds.value.join('\n'));

const generateIds = () => {
  const result: string[] = [];
  for (let index = 0; index < quantity.value; index++) {
    switch (selectedType.value) {
      case 'v4': {
        result.push(uuidv4());

        break;
      }
      case 'v7': {
        result.push(uuidv7());

        break;
      }
      case 'ulid': {
        result.push(ulid());

        break;
      }
      // No default
    }
  }
  generatedIds.value = result;
};

const copyAll = async () => {
  if (!outputString.value) return;
  try {
    await navigator.clipboard.writeText(outputString.value);
    showToast(t('common.copied'), 'success');
  } catch (error) {
    console.error(error);
    showToast('Failed to copy', 'error');
  }
};

const selectAll = () => {
  outputRef.value?.select();
};

onMounted(() => {
  generateIds();
});
</script>

<style scoped>
.uuid-generator {
  width: 100%;
}

.description-card {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

.controls-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

@media (min-width: 768px) {
  .controls-grid {
    flex-direction: row;
    align-items: flex-end;
  }
}

.control-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-group {
  flex: 0 0 auto;
}

.group-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  justify-content: space-between;
}

.qty-val {
  color: var(--primary);
}

/* Type Toggles */
.type-toggles {
  display: flex;
  background: var(--surface-raised);
  padding: 4px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.type-radio {
  flex: 1;
  text-align: center;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: calc(var(--radius-sm) - 2px);
  transition: all var(--transition-fast);
  font-weight: 500;
  color: var(--text-muted);
}

.type-radio:hover {
  color: var(--text-primary);
}

.type-radio.active {
  background: var(--primary);
  color: white;
  box-shadow: var(--shadow-sm);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* Slider */
.qty-slider {
  width: 100%;
  accent-color: var(--primary);
  height: 6px;
  background: var(--surface-raised);
  border-radius: 4px;
}

/* Generate Button */
.generate-btn {
  width: 100%;
  padding: 10px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.generate-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.generate-btn:active {
  transform: translateY(0);
}

/* Output */
.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.output-header h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
}

.copy-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px 8px;
}
.copy-btn:hover {
  color: var(--primary);
}

.uuid-output {
  width: 100%;
  height: 300px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  color: var(--text-primary);
  font-family: 'SF Mono', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: vertical;
}
.uuid-output:focus {
  outline: 2px solid var(--primary-soft);
  border-color: var(--primary);
}
</style>
