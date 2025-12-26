import { render } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';
import BaseCard from '@/components/common/BaseCard.vue';

describe('BaseCard.vue', () => {
  it('renders title when provided', () => {
    const { getByText } = render(BaseCard, {
      props: {
        title: 'Test Title'
      }
    });
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('renders default slot content', () => {
    const { getByText } = render(BaseCard, {
      slots: {
        default: '<div data-testid="content">Main Content</div>'
      }
    });

    expect(getByText('Main Content')).toBeTruthy();
  });

  it('renders header slot', () => {
    const { getByText } = render(BaseCard, {
      slots: {
        header: '<div>Custom Header</div>'
      }
    });

    expect(getByText('Custom Header')).toBeTruthy();
  });

  it('renders footer slot', () => {
    const { getByText } = render(BaseCard, {
      slots: {
        footer: '<div>Footer Actions</div>'
      }
    });

    expect(getByText('Footer Actions')).toBeTruthy();
  });
});
