<template>
  <div class="contact-form">
    <div class="form-row">
      <div class="form-group">
        <label for="contact-fn">{{ t('qrcode.contactName') }}</label>
        <input
          id="contact-fn"
          :value="modelValue.name"
          :placeholder="t('qrcode.contactNamePlaceholder')"
          type="text"
          @input="update('name', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="form-group">
        <label for="contact-org">{{ t('qrcode.contactOrg') }}</label>
        <input
          id="contact-org"
          :value="modelValue.org"
          type="text"
          @input="update('org', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="contact-tel">{{ t('qrcode.contactPhone') }}</label>
        <input
          id="contact-tel"
          :value="modelValue.phone"
          :placeholder="t('qrcode.contactPhonePlaceholder')"
          type="tel"
          @input="update('phone', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="form-group">
        <label for="contact-email">{{ t('qrcode.contactEmail') }}</label>
        <input
          id="contact-email"
          :value="modelValue.email"
          type="email"
          @input="update('email', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
    <div class="form-group">
      <label for="contact-url">{{ t('qrcode.contactUrl') }}</label>
      <input
        id="contact-url"
        :value="modelValue.url"
        type="url"
        placeholder="https://"
        @input="update('url', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  modelValue: {
    name: string;
    org: string;
    phone: string;
    email: string;
    url: string;
  };
}>();

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const update = (key: keyof typeof props.modelValue, value: string) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
};
</script>

<style scoped>
.contact-form {
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
.form-group input {
  padding: 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 0.95rem;
}
.form-group input:focus {
  border-color: var(--primary);
  outline: none;
}
</style>
