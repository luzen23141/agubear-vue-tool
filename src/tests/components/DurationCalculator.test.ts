import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import DurationCalculator from '../../components/DurationCalculator.vue';

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

describe('DurationCalculator.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(DurationCalculator);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.flex-col').exists()).toBe(true);
    // 2 inputs for start and end time
    expect(wrapper.findAll('input[type="datetime-local"]').length).toBe(2);
  });

  it('calculates duration correctly', async () => {
    const wrapper = mount(DurationCalculator);
    const inputs = wrapper.findAll('input[type="datetime-local"]');

    // Set start time: 2023-01-01T10:00
    await inputs[0].setValue('2023-01-01T10:00');
    // Set end time: 2023-01-01T12:30
    await inputs[1].setValue('2023-01-01T12:30');

    // Trigger calculation explicitly if needed, but setValue triggers change usually.
    // The component listens to @change.
    // VTU setValue triggers input and change.

    expect(wrapper.find('.result-box').exists()).toBe(true);
    // en-US locale for date-fns formatDuration usually outputs "x hours, y minutes"
    const valueSpan = wrapper.findAll('.result-box span').at(1);
    expect(valueSpan?.text()).toContain('2 hours');
    expect(valueSpan?.text()).toContain('30 minutes');
  });

  it('handles empty input gracefully', async () => {
    const wrapper = mount(DurationCalculator);
    const inputs = wrapper.findAll('input[type="datetime-local"]');

    await inputs[0].setValue('2023-01-01T10:00');
    // End time is empty by default
    expect(wrapper.find('.result-box').exists()).toBe(false);

    await inputs[1].setValue('2023-01-01T12:00');
    expect(wrapper.find('.result-box').exists()).toBe(true);

    // Clear start time
    await inputs[0].setValue('');
    expect(wrapper.find('.result-box').exists()).toBe(false);
  });
});
