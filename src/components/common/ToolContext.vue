<template>
  <div class="tool-context">
    <!-- Educational Content (GEO/SEO) -->
    <article class="context-article">
      <header>
        <h2>{{ t(`${toolKey}.context.title`) }}</h2>
      </header>
      <div class="context-body">
        <p v-for="(paragraph, index) in contextParagraphs" :key="index">
          {{ paragraph }}
        </p>
      </div>
    </article>

    <!-- Q&A Section (AEO) -->
    <section class="faq-section" itemtype="https://schema.org/FAQPage" itemscope>
      <h3>{{ t('common.faqTitle') || '常見問題' }}</h3>
      <div
        v-for="(item, index) in faqItems"
        :key="index"
        class="faq-item"
        itemprop="mainEntity"
        itemtype="https://schema.org/Question"
        itemscope
      >
        <h4 itemprop="name">{{ item.question }}</h4>
        <div
          class="faq-answer"
          itemprop="acceptedAnswer"
          itemtype="https://schema.org/Answer"
          itemscope
        >
          <p itemprop="text">{{ item.answer }}</p>
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

<style scoped>
.tool-context {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
}

.context-article h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.context-body p {
  margin-bottom: 1rem;
  line-height: 1.7;
}

.faq-section {
  margin-top: 2.5rem;
}

.faq-section h3 {
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.faq-item {
  margin-bottom: 1.5rem;
}

.faq-item h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.faq-answer p {
  margin: 0;
  color: var(--text-muted);
}
</style>
