import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import TimestampConverter from '../../components/TimestampConverter.vue';
import { setupI18n } from '../../i18n';

// Mock useHead
vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
  useSeoMeta: vi.fn()
}));

const i18n = setupI18n();

const renderOptions = {
  global: {
    plugins: [i18n]
  }
};

describe('TimestampConverter (Integration)', () => {
  it('應能正確渲染並允許切換 Unix 時間戳類型', async () => {
    i18n.global.locale.value = 'zh-TW';
    render(TimestampConverter, renderOptions);

    // 使用精確匹配以區分 "10 位 (秒)" 與 "13 位 (毫秒)"
    const secondsRadio = screen.getByRole('radio', { name: /10 位 \(秒\)/ });
    const msRadio = screen.getByRole('radio', { name: /13 位 \(毫秒\)/ });

    expect(secondsRadio).toBeInTheDocument();
    expect(msRadio).toBeInTheDocument();

    // 模擬用戶點擊「毫秒」
    await fireEvent.click(msRadio);
    expect(msRadio).toBeChecked();
    expect(secondsRadio).not.toBeChecked();
  });

  it('應顯示標題 "Unix Timestamp 轉 日期"', () => {
    i18n.global.locale.value = 'zh-TW';
    render(TimestampConverter, renderOptions);
    expect(screen.getByText(/Unix Timestamp 轉 日期/)).toBeInTheDocument();
  });
});
