import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Toast from '@/components/common/Toast.vue';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('is hidden by default', () => {
    const wrapper = mount(Toast);
    expect(wrapper.find('.success, .error, .info').exists()).toBe(false);
  });

  it('shows a toast with correct message and type', async () => {
    const wrapper = mount(Toast);
    const vm = wrapper.vm as unknown as { show: (msg: string, type: string) => void };
    vm.show('Success!', 'success');
    await wrapper.vm.$nextTick();
    const toast = wrapper.find('.success');
    expect(toast.exists()).toBe(true);
    expect(toast.text()).toContain('Success!');
    expect(toast.classes()).toContain('success');
  });

  it('shows correct icon for error type', async () => {
    const wrapper = mount(Toast);
    const vm = wrapper.vm as unknown as { show: (msg: string, type: string) => void };
    vm.show('Error!', 'error');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.error').exists()).toBe(true);
  });

  it('shows correct icon for info type', async () => {
    const wrapper = mount(Toast);
    const vm = wrapper.vm as unknown as { show: (msg: string, type: string) => void };
    vm.show('Info', 'info');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.info').exists()).toBe(true);
  });

  it('hides after the specified duration', async () => {
    const wrapper = mount(Toast);
    const vm = wrapper.vm as unknown as {
      show: (msg: string, type: string, duration: number) => void;
    };
    vm.show('Bye', 'info', 1000);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.info').exists()).toBe(true);

    vi.advanceTimersByTime(1000);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.info').exists()).toBe(false);
  });

  it('resets timer when show is called again', async () => {
    const wrapper = mount(Toast);
    const vm = wrapper.vm as unknown as {
      show: (msg: string, type: string, duration: number) => void;
    };
    vm.show('First', 'info', 1000);
    await wrapper.vm.$nextTick();

    vi.advanceTimersByTime(500);
    vm.show('Second', 'success', 1000);
    await wrapper.vm.$nextTick();

    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();
    // Should still be visible — second show restarted the timer
    expect(wrapper.find('.success').exists()).toBe(true);
    expect(wrapper.find('.success').text()).toContain('Second');
  });
});
