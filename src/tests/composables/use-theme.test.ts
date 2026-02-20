import { describe, it, expect } from 'vitest';
import { UseTheme } from '@/composables/use-theme';

describe('use-theme', () => {
  it('returns light theme', () => {
    const { theme } = UseTheme();
    expect(theme.value).toBe('light');
  });
});
