<template>
  <BaseCard :title="t('timestamp.durationTitle')">
    <div class="flex-col gap-4">
      <div class="inputs-row grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label for="start-time" class="text-0.85rem font-600 text-[var(--text-secondary)]">{{
            t('timestamp.startTime')
          }}</label>
          <input
            id="start-time"
            v-model="startTime"
            type="datetime-local"
            class="input-base"
            @change="calculateDuration"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="end-time" class="text-0.85rem font-600 text-[var(--text-secondary)]">{{
            t('timestamp.endTime')
          }}</label>
          <input
            id="end-time"
            v-model="endTime"
            type="datetime-local"
            class="input-base"
            @change="calculateDuration"
          />
        </div>
      </div>

      <div v-if="durationResult" class="result-box">
        <span class="font-600 text-[var(--text-secondary)]">{{ t('timestamp.duration') }}:</span>
        <span class="text-[var(--primary)] font-600">{{ durationResult }}</span>
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
