import { computed, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import { useRoute } from 'vue-router';
import { SUPPORTED_LOCALES } from '@/i18n';

/**
 * SEO Composable to handle dynamic meta tags, OpenGraph, Twitter Cards,
 * Canonical URL and Alternate Language links.
 */
/**
 * Helper to generate alternate language links
 */
function getAlternateLinks(routePath: string, currentLocale: string, siteUrl: string) {
  const pathParts = routePath.split('/').filter(Boolean);
  const toolName = pathParts.length > 1 ? pathParts[1] : pathParts[0] || '';

  if (!toolName || toolName === currentLocale) {
    return SUPPORTED_LOCALES.map((l) => ({
      rel: 'alternate',
      hreflang: l.code,
      href: `${siteUrl}/${l.code}`
    }));
  }

  return SUPPORTED_LOCALES.map((l) => ({
    rel: 'alternate',
    hreflang: l.code,
    href: `${siteUrl}/${l.code}/${toolName}`
  }));
}

/**
 * Helper to generate JSON-LD schema
 */
function getJsonLd(options: {
  siteUrl: string;
  currentUrl: string;
  title: string;
  description: string;
  isToolPage: boolean;
  defaultDescription: string;
}) {
  const siteName = 'AguBear Tools';

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteName,
    url: options.siteUrl,
    description: options.defaultDescription,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    author: {
      '@type': 'Person',
      name: 'AguBear'
    }
  };

  if (options.isToolPage) {
    return [
      webAppSchema,
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: options.title,
        description: options.description,
        url: options.currentUrl,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      }
    ];
  }

  return [webAppSchema];
}

type FaqItem = {
  question: string;
  answer: string;
};

function buildFaqSchema(faqItems: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

function buildToolSchema(title: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: title,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };
}

function buildToolContextSchemas(title: string, faqItems: FaqItem[]) {
  return [buildFaqSchema(faqItems), buildToolSchema(title)];
}

type TranslateMessagesFunction = (_key: string) => unknown;

function resolveFaqItems(toolKey: string, tm: TranslateMessagesFunction) {
  const questions = tm(`${toolKey}.faq`);
  if (!Array.isArray(questions)) return [] as FaqItem[];

  return questions.map((q) => {
    const item = q as { q: string; a: string };
    return {
      question: item.q,
      answer: item.a
    };
  });
}

export function useToolContextSeo(toolKey: string) {
  const { t, tm } = useI18n();

  const schemas = computed(() =>
    buildToolContextSchemas(t(`${toolKey}.title`), resolveFaqItems(toolKey, tm))
  );

  useHead({
    script: computed(() =>
      schemas.value.map((schema) => ({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema)
      }))
    )
  });
}

type SeoOverrides = {
  title?: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  image?: string;
  type?: string;
};

type TranslateFunction = (_key: string) => string;

function resolveTitle(
  t: TranslateFunction,
  overrides: SeoOverrides | undefined,
  route: ReturnType<typeof useRoute>
) {
  return computed(() => {
    if (overrides?.title) return `${overrides.title} - ${t('app.title')}`;
    const key = overrides?.titleKey || (route.meta?.titleKey as string);
    const baseTitle = key ? t(key) : '';
    return baseTitle ? `${baseTitle} - ${t('app.title')}` : t('app.title');
  });
}

type MetaTagsInput = {
  title: ComputedRef<string>;
  description: ComputedRef<string>;
  keywords: ComputedRef<string>;
  url: ComputedRef<string>;
  image: string;
  type: string;
};

function buildMetaTags({ title, description, keywords, url, image, type }: MetaTagsInput) {
  return [
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: 'AguBear Tools' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image }
  ];
}

export function useSeo() {
  const { t, locale } = useI18n();
  const route = useRoute();
  const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://agubear.black').replace(/\/$/, '');

  const setMeta = (overrides?: SeoOverrides) => {
    const title = resolveTitle(t, overrides, route);
    const description = computed(() => {
      if (overrides?.description) return overrides.description;
      const key = overrides?.descriptionKey || (route.meta?.descriptionKey as string);
      return key ? t(key) : t('seo.description');
    });
    const url = computed(() => {
      const p = route.path.startsWith('/') ? route.path : `/${route.path}`;
      return `${siteUrl}${p}`;
    });
    const image = overrides?.image || `${siteUrl}/favicon.svg`;
    const type = overrides?.type || 'website';
    const keywords = computed(() => t('seo.keywords'));
    const alternateLinks = computed(() => getAlternateLinks(route.path, locale.value, siteUrl));
    const jsonLd = computed(() =>
      getJsonLd({
        siteUrl,
        currentUrl: url.value,
        title: title.value,
        description: description.value,
        isToolPage: route.path.split('/').filter(Boolean).length > 1,
        defaultDescription: t('seo.description')
      })
    );

    useHead({
      htmlAttrs: { lang: computed(() => locale.value) },
      title,
      meta: buildMetaTags({ title, description, keywords, url, image, type }),
      link: computed(() => [
        { rel: 'canonical', href: url.value },
        ...alternateLinks.value,
        { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl}/en` }
      ]),
      script: [
        { type: 'application/ld+json', innerHTML: computed(() => JSON.stringify(jsonLd.value)) }
      ]
    });
  };

  return { setMeta };
}
