import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import JwtDebugger from '../../components/JwtDebugger.vue';

// Mock vue-i18n
vi.mock('vue-i18n', async () => {
  const { ref } = await import('vue');
  return {
    useI18n: () => ({
      t: (key: string) => key,
      tm: () => [],
      locale: ref('en')
    })
  };
});

// Mock @unhead/vue
vi.mock('@unhead/vue', () => ({
  useHead: vi.fn()
}));

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn((token: string, options?: { header: boolean }) => {
    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (token === 'invalid') throw new Error('Invalid token');
    if (options?.header) {
      return { alg: 'HS256', typ: 'JWT' };
    }
    return { sub: '1234567890', name: 'John Doe', iat: 1516239022, exp: 1999999999 };
  })
}));

describe('JwtDebugger.vue', () => {
  const mountOptions = {
    global: {
      provide: {
        showToast: vi.fn()
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = mount(JwtDebugger, mountOptions);
    expect(wrapper.find('.jwt-debugger').exists()).toBe(true);
    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('decodes valid JWT', async () => {
    const wrapper = mount(JwtDebugger, mountOptions);
    const textarea = wrapper.find('textarea');

    await textarea.setValue('valid.token.here');

    // Check if output section appears
    expect(wrapper.find('.output-section').exists()).toBe(true);

    // Check header and payload
    expect(wrapper.text()).toContain('HS256');
    expect(wrapper.text()).toContain('John Doe');
  });

  it('handles invalid JWT', async () => {
    const wrapper = mount(JwtDebugger, mountOptions);
    const textarea = wrapper.findAll('textarea')[0];

    // We mocked jwtDecode to throw on 'invalid'
    await textarea?.setValue('invalid');

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.output-section').exists()).toBe(false);
  });

  it('clears input', async () => {
    const wrapper = mount(JwtDebugger, mountOptions);
    const textarea = wrapper.findAll('textarea')[0];

    await textarea?.setValue('valid.token');
    expect(wrapper.find('.output-section').exists()).toBe(true);

    const clearBtn = wrapper.findAll('button').find((b) => b.text().includes('common.clear'));
    await clearBtn?.trigger('click');

    expect(textarea?.element.value).toBe('');
    expect(wrapper.find('.output-section').exists()).toBe(false);
  });

  it('checks expiration status', async () => {
    const wrapper = mount(JwtDebugger, mountOptions);
    const textarea = wrapper.find('textarea');

    // valid token has exp: 1999999999 (future date)
    await textarea.setValue('valid.token');

    expect(wrapper.find('.status-bar').classes()).toContain('valid');
    expect(wrapper.text()).toContain('VALID');
  });
});
