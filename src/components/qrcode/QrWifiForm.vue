<template>
  <div class="wifi-form">
    <div class="form-group">
      <label for="wifi-ssid">{{ t('qrcode.wifiSsid') }}</label>
      <input
        id="wifi-ssid"
        :value="modelValue.ssid"
        :placeholder="t('qrcode.wifiSsidPlaceholder')"
        type="text"
        @input="update('ssid', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <div class="form-group">
      <label for="wifi-password">{{ t('qrcode.wifiPassword') }}</label>
      <input
        id="wifi-password"
        :value="modelValue.password"
        :type="modelValue.hiddenPassword ? 'password' : 'text'"
        :placeholder="t('qrcode.wifiPasswordPlaceholder')"
        @input="update('password', ($event.target as HTMLInputElement).value)"
      />
      <button
        type="button"
        class="icon-toggle"
        @click="update('hiddenPassword', !modelValue.hiddenPassword)"
      >
        <SvgIcon :name="modelValue.hiddenPassword ? 'eye' : 'eye-off'" size="0.9rem" />
      </button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="wifi-encryption">{{ t('qrcode.wifiEncryption') }}</label>
        <select
          id="wifi-encryption"
          :value="modelValue.encryption"
          @change="update('encryption', ($event.target as HTMLSelectElement).value)"
        >
          <option value="WPA">WPA/WPA2</option>
          <option value="WEP">WEP</option>
          <option value="nopass">None</option>
        </select>
      </div>
      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input
            :checked="modelValue.hidden"
            type="checkbox"
            @change="update('hidden', ($event.target as HTMLInputElement).checked)"
          />
          {{ t('qrcode.wifiHidden') }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import SvgIcon from '@/components/icons/SvgIcon.vue';

const props = defineProps<{
  modelValue: {
    ssid: string;
    password: string;
    encryption: string;
    hidden: boolean;
    hiddenPassword: boolean;
  };
}>();

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const update = <K extends keyof typeof props.modelValue>(
  key: K,
  value: (typeof props.modelValue)[K]
) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
};
</script>

<style scoped>
.wifi-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
}
.form-row {
  display: flex;
  gap: 15px;
}
.form-row .form-group {
  flex: 1;
}
.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
}
.form-group input,
.form-group select {
  padding: 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 0.95rem;
}
.form-group input:focus,
.form-group select:focus {
  border-color: var(--primary);
  outline: none;
}
.icon-toggle {
  position: absolute;
  right: 10px;
  bottom: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 2px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.checkbox-group {
  justify-content: center;
}
</style>
