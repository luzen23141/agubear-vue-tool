<template>
  <ToolPageLayout :title="t('uuid.title')" tool-key="uuid">
    <!-- Controls Section -->
    <div class="controls-grid">
      <!-- Type Selection -->
      <fieldset class="control-group">
        <legend class="group-label">{{ t('uuid.typeLabel') }}</legend>
        <div class="type-toggles">
          <label
            v-for="type in idTypes"
            :key="type.value"
            :class="{ 'type-radio--active': selectedType === type.value }"
            class="type-radio"
          >
            <input
              v-model="selectedType"
              :value="type.value"
              type="radio"
              name="idType"
              class="sr-only"
            />
            {{ type.label }}
          </label>
        </div>
      </fieldset>

      <!-- Quantity Selection -->
      <div class="control-group">
        <label for="uuid-quantity" class="group-label quantity-label">
          {{ t('uuid.quantityLabel') }}: <span class="qty-val">{{ quantity }}</span>
        </label>
        <input
          id="uuid-quantity"
          v-model.number="quantity"
          type="range"
          min="1"
          max="50"
          class="qty-slider"
        />
      </div>

      <!-- Action -->
      <div class="control-group action-group">
        <button class="generate-btn" type="button" @click="generateIds">
          <SvgIcon name="refresh-cw" /> {{ t('uuid.generate') }}
        </button>
      </div>
    </div>

    <!-- Output Section -->
    <div class="output-section">
      <div class="result-label">{{ t('uuid.resultLabel') }}</div>
      <InputWithCopy
        id="uuid-output"
        :model-value="outputString"
        class="uuid-result-input"
        readonly
        allow-copy
        @click="selectAll"
      />
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';
import { ulid } from 'ulid';
import ToolPageLayout from '@/components/layout/ToolPageLayout.vue';
import InputWithCopy from '@/components/common/InputWithCopy.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

const { t } = useI18n();

const idTypes = [
  { value: 'v4', label: 'UUID v4' },
  { value: 'v7', label: 'UUID v7' },
  { value: 'ulid', label: 'ULID' }
];

const selectedType = ref('v4');
const quantity = ref(1);
const generatedIds = ref<string[]>([]);

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
    }
  }
  generatedIds.value = result;
};

const selectAll = (event: MouseEvent) => {
  const container = event.currentTarget as HTMLElement;
  const textarea = container.querySelector('textarea');
  if (textarea) {
    textarea.select();
  }
};

onMounted(() => {
  generateIds();
});
</script>

<style scoped>
.controls-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border);
}

@media (min-width: 1024px) {
  .controls-grid {
    grid-template-columns: 2fr 1.5fr 1fr;
    align-items: flex-end;
  }
}

.control-group {
  display: flex;
  flex-direction: column;
}

.action-group {
  justify-content: flex-end;
}

.group-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  justify-content: space-between;
}

.quantity-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.qty-val {
  color: var(--primary);
  font-family: 'SF Mono', monospace;
  font-weight: 700;
}

/* Type Toggles */
.type-toggles {
  display: flex;
  background: var(--background-alt);
  padding: 4px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.type-radio {
  flex: 1;
  text-align: center;
  padding: 8px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: calc(var(--radius-sm) - 2px);
  transition: all var(--transition-fast);
  font-weight: 600;
  color: var(--text-muted);
}

.type-radio:hover {
  color: var(--text-primary);
}

.type-radio--active {
  background: var(--primary);
  color: var(--text-on-primary);
  box-shadow: 0 2px 4px rgba(var(--primary-rgb), 0.2);
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
  background: var(--border);
  border-radius: 4px;
  cursor: pointer;
}

/* Generate Button */
.generate-btn {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--primary);
  color: var(--text-on-primary);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.generate-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

.result-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.uuid-result-input) textarea {
  height: 300px;
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
}
</style>
