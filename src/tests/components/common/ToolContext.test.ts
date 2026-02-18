import { describe, it, expect, vi } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
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
    const paragraphs = wrapper.findAll('.context-body p');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]?.text()).toBe('Paragraph 1');
    expect(paragraphs[1]?.text()).toBe('Paragraph 2');
  });

  it('renders FAQ items', () => {
    const wrapper = mount(ToolContext, {
      props: { toolKey: 'timestamp' }
    });
    const items = wrapper.findAll('.faq-item');
    expect(items).toHaveLength(2);
    expect(items[0]?.find('h4').text()).toBe('What is a timestamp?');
    expect(items[0]?.find('.faq-answer p').text()).toBe('A numeric representation of time.');
  });

  it('shows FAQ title', () => {
    const wrapper = mount(ToolContext, {
      props: { toolKey: 'timestamp' }
    });
    expect(wrapper.find('.faq-section h3').text()).toBe('FAQ');
  });

  it('uses schema.org microdata attributes', () => {
    const wrapper = mount(ToolContext, {
      props: { toolKey: 'timestamp' }
    });
    expect(wrapper.find('.faq-section').attributes('itemtype')).toBe('https://schema.org/FAQPage');
    expect(wrapper.find('.faq-item').attributes('itemprop')).toBe('mainEntity');
  });
});
