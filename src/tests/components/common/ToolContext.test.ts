import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import ToolContext from '@/components/common/ToolContext.vue';

// Mock @unhead/vue
vi.mock('@unhead/vue', () => ({
  useHead: vi.fn()
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      common: { faqTitle: 'FAQ' },
      timestamp: {
        title: 'Timestamp Converter',
        context: {
          title: 'About Timestamps',
          content: ['Paragraph 1', 'Paragraph 2']
        },
        faq: [
          { q: 'What is a timestamp?', a: 'A numeric representation of time.' },
          { q: 'What is epoch?', a: 'The Unix epoch is Jan 1 1970.' }
        ]
      }
    }
  }
});

config.global.plugins = [i18n];

describe('ToolContext', () => {
  beforeEach(() => {
    vi.mocked(useHead).mockClear();
  });

  it('renders the context title', () => {
    const wrapper = mount(ToolContext, {
      props: { toolKey: 'timestamp' }
    });
    expect(wrapper.find('h2').text()).toBe('About Timestamps');
  });

  it('renders context paragraphs', () => {
    const wrapper = mount(ToolContext, {
      props: { toolKey: 'timestamp' }
    });
    const paragraphs = wrapper.findAll('article p');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]?.text()).toBe('Paragraph 1');
    expect(paragraphs[1]?.text()).toBe('Paragraph 2');
  });

  it('renders FAQ items', () => {
    const wrapper = mount(ToolContext, {
      props: { toolKey: 'timestamp' }
    });
    const items = wrapper.findAll('[itemprop="mainEntity"]');
    expect(items).toHaveLength(2);
    expect(items[0]?.find('h4').text()).toBe('What is a timestamp?');
    expect(items[0]?.find('[itemprop="text"]').text()).toBe('A numeric representation of time.');
  });

  it('shows FAQ title', () => {
    const wrapper = mount(ToolContext, {
      props: { toolKey: 'timestamp' }
    });
    expect(wrapper.find('section h3').text()).toBe('FAQ');
  });

  it('registers FAQ and tool schemas through useHead', () => {
    mount(ToolContext, {
      props: { toolKey: 'timestamp' }
    });

    expect(useHead).toHaveBeenCalledTimes(1);
    const headConfig = vi.mocked(useHead).mock.calls[0]?.[0] as {
      script: { value: Array<{ key: string; innerHTML: string }> };
    };
    const scripts = headConfig.script.value;

    expect(scripts).toHaveLength(2);
    expect(scripts[0]?.key).toBe('timestamp-faq-schema');
    expect(JSON.parse(scripts[0]?.innerHTML || '{}')).toMatchObject({ '@type': 'FAQPage' });
    expect(scripts[1]?.key).toBe('timestamp-tool-schema');
    expect(JSON.parse(scripts[1]?.innerHTML || '{}')).toMatchObject({
      '@type': 'SoftwareApplication',
      name: 'Timestamp Converter'
    });
  });

  it('uses schema.org microdata attributes', () => {
    const wrapper = mount(ToolContext, {
      props: { toolKey: 'timestamp' }
    });
    expect(wrapper.find('section[itemtype]').attributes('itemtype')).toBe(
      'https://schema.org/FAQPage'
    );
    expect(wrapper.find('[itemprop="mainEntity"]').attributes('itemprop')).toBe('mainEntity');
  });
});
