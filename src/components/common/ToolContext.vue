<template>
  <div class="mt-12 pt-8 border-t border-[var(--border)] text-[var(--text-secondary)]">
    <!-- Educational Content (GEO/SEO) -->
    <article v-if="contextParagraphs.length > 0">
      <header>
        <h2 class="text-1.5rem text-[var(--text-primary)] mb-4">
          {{ t(`${toolKey}.context.title`) }}
        </h2>
      </header>
      <div>
        <p v-for="(paragraph, index) in contextParagraphs" :key="index" class="mb-4 leading-7">
          {{ paragraph }}
        </p>
      </div>
    </article>

    <!-- Q&A Section (AEO) -->
    <section
      v-if="faqItems.length > 0"
      class="mt-10"
      itemtype="https://schema.org/FAQPage"
      itemscope
    >
      <h3 class="text-1.3rem text-[var(--text-primary)] mb-6">
        {{ t('common.faqTitle') || '常見問題' }}
      </h3>
      <div
        v-for="(item, index) in faqItems"
        :key="index"
        class="mb-6"
        itemprop="mainEntity"
        itemtype="https://schema.org/Question"
        itemscope
      >
        <h4 class="text-1.1rem font-600 text-[var(--text-primary)] m-0 mb-2" itemprop="name">
          {{ item.question }}
        </h4>
        <div itemprop="acceptedAnswer" itemtype="https://schema.org/Answer" itemscope>
          <p class="m-0 text-[var(--text-muted)]" itemprop="text">{{ item.answer }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';

const props = defineProps<{
  toolKey: string; // e.g., 'timestamp', 'hash'
}>();

const { t, tm, locale } = useI18n();

// Helper to get array from i18n messages
const contextParagraphs = computed(() => {
  const content = tm(`${props.toolKey}.context.content`);
  return Array.isArray(content) ? content : [];
});

const faqItems = computed(() => {
  const questions = tm(`${props.toolKey}.faq`);
  if (!Array.isArray(questions)) return [];
  return questions.map((q: unknown) => {
    const item = q as { q: string; a: string };
    return {
      question: item.q,
      answer: item.a
    };
  });
});

// JSON-LD Injection
const generateJsonLd = () => {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.value.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: t(`${props.toolKey}.title`),
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(faqSchema)
      },
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(appSchema)
      }
    ]
  });
};

// Update Schema when locale changes
watch(locale, () => {
  generateJsonLd();
});

onMounted(() => {
  generateJsonLd();
});
</script>
