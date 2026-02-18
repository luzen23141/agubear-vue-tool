<template>
  <BaseCard :title="t('timestamp.durationTitle')">
    <div class="duration-calc">
      <div class="inputs-row">
        <div class="input-group">
          <label>{{ t('timestamp.startTime') }}</label>
          <input
            v-model="startTime"
            type="datetime-local"
            class="dt-input"
            @change="calculateDuration"
          />
        </div>
        <div class="input-group">
          <label>{{ t('timestamp.endTime') }}</label>
          <input
            v-model="endTime"
            type="datetime-local"
            class="dt-input"
            @change="calculateDuration"
          />
        </div>
      </div>

      <div v-if="durationResult" class="result-box">
        <span class="label">{{ t('timestamp.duration') }}:</span>
        <span class="value">{{ durationResult }}</span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { intervalToDuration, formatDuration } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import BaseCard from './common/BaseCard.vue';

const { t, locale } = useI18n();

const startTime = ref('');
const endTime = ref('');
const durationResult = ref('');

const calculateDuration = () => {
  if (!startTime.value || !endTime.value) {
    durationResult.value = '';
    return;
  }

  const start = new Date(startTime.value);
  const end = new Date(endTime.value);

  const duration = intervalToDuration({ start, end });

  const dateFnsLocale = locale.value === 'zh-TW' ? zhTW : enUS;

  durationResult.value = formatDuration(duration, {
    locale: dateFnsLocale,
    format: ['years', 'months', 'days', 'hours', 'minutes', 'seconds'],
    zero: false,
    delimiter: ', '
  });
};
</script>

<style scoped>
.duration-calc {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.inputs-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .inputs-row {
    grid-template-columns: 1fr 1fr;
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.dt-input {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9rem;
}

.result-box {
  margin-top: 0.5rem;
  padding: 12px;
  background: var(--surface-raised);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-box .label {
  font-weight: 600;
  color: var(--text-secondary);
}

.result-box .value {
  color: var(--primary);
  font-weight: 600;
}
</style>
