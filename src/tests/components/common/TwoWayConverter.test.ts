import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import TwoWayConverter from '@/components/common/TwoWayConverter.vue';

// Mock I18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (_key: string) => _key,
    tm: (_key: string) => [],
    locale: { value: 'en' }
  })
}));

// Mock @unhead/vue
vi.mock('@unhead/vue', () => ({
  useHead: vi.fn()
}));

// use-two-way-converter is simple logic, no history store mock needed for this component test

describe('TwoWayConverter.vue', () => {
  const defaultProps = {
    name: 'test-converter',
    title: 'Test Converter',
    inputLabel: 'Input',
    outputLabel: 'Output',
    inputPlaceholder: 'Enter text',
    outputPlaceholder: 'Result',
    mode: 'encode' as const,
    inputText: '',
    outputText: '',
    encodeValue: 'encode',
    decodeValue: 'decode',
    encodeLabel: 'Encode Checkbox',
    decodeLabel: 'Decode Checkbox',
    history: []
  };

  it('renders with correct title and labels', () => {
    const wrapper = mount(TwoWayConverter, {
      props: defaultProps
    });

    expect(wrapper.text()).toContain('Test Converter');
    expect(wrapper.text()).toContain('Encode Checkbox');
    expect(wrapper.text()).toContain('Decode Checkbox');
    expect(wrapper.text()).toContain('Input');
  });

  it('switches mode when radio clicked', async () => {
    const wrapper = mount(TwoWayConverter, {
      props: defaultProps
    });

    const decodeRadio = wrapper.findAll('input[type="radio"]')[1];
    await decodeRadio?.setValue();

    expect(wrapper.emitted()['update:mode']).toBeTruthy();
    expect(wrapper.emitted()['update:mode']?.[0]).toEqual(['decode']);
  });

  it('emits update:inputText on typing', async () => {
    const wrapper = mount(TwoWayConverter, {
      props: defaultProps
    });

    const input = wrapper.find('textarea');
    await input.setValue('new input');

    expect(wrapper.emitted()['update:inputText']).toBeTruthy();
    expect(wrapper.emitted()['update:inputText']?.[0]).toEqual(['new input']);
  });

  it('emits record event', async () => {
    const wrapper = mount(TwoWayConverter, {
      props: {
        ...defaultProps,
        inputText: 'something',
        outputText: 'result'
      }
    });

    const recordButton = wrapper.findAll('button').find((b) => b.text().includes('common.record'));
    await recordButton?.trigger('click');

    expect(wrapper.emitted().record).toBeTruthy();
  });
});
