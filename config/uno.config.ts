import { defineConfig, presetUno, presetAttributify } from 'unocss';
import transformerDirectives from '@unocss/transformer-directives';

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      primary: 'var(--primary)',
      'primary-hover': 'var(--primary-hover)',
      secondary: 'var(--secondary)',
      accent: 'var(--accent)',
      surface: {
        DEFAULT: 'var(--surface)',
        bg: 'var(--surface-bg)',
        hover: 'var(--surface-hover)',
        raised: 'var(--surface-raised)',
        overlay: 'var(--surface-overlay)',
        glass: 'var(--surface-glass)',
        soft: 'var(--surface-soft)'
      },
      border: {
        DEFAULT: 'var(--border)',
        hover: 'var(--border-hover)',
        focus: 'var(--border-focus)',
        glass: 'var(--border-glass)'
      },
      text: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        inverted: 'var(--text-inverted)'
      },
      glass: {
        bg: 'var(--glass-bg)',
        border: 'var(--glass-border)'
      }
    },
    borderRadius: {
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      pill: 'var(--radius-pill)'
    },
    boxShadow: {
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      elevated: 'var(--shadow-elevated)',
      glow: 'var(--shadow-glow)',
      'glow-strong': 'var(--shadow-glow-strong)',
      focus: 'var(--shadow-focus)'
    },
    fontFamily: {
      heading: 'var(--font-heading)',
      body: 'var(--font-body)',
      mono: 'var(--font-mono)'
    }
  },
  shortcuts: {
    // Layout
    'flex-center': 'flex items-center justify-center',
    'flex-col': 'flex flex-col',
    'flex-between': 'flex items-center justify-between',

    // Common patterns from component styles
    'btn-primary':
      'px-7 py-2.5 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-text-inverted border-none rounded-sm cursor-pointer font-600 shadow-glow transition-all duration-250',
    'input-base':
      'p-2.5 border border-border rounded-sm bg-surface text-text-primary font-inherit text-0.9rem',
    'result-box':
      'mt-2 p-3 bg-surface-raised rounded-sm border border-border flex items-center gap-2',
    'direction-arrow': 'text-center text-1.2rem text-primary my-3 op-60',
    'mode-select': 'flex bg-glass-bg backdrop-blur-8 p-1 rounded-md border border-glass-border',
    'section-title': 'text-1.5rem text-text-primary mb-4 font-heading',
    'faq-item': 'mb-6'
  },
  safelist: [],
  content: {
    pipeline: {
      include: [/\.vue$/, /\.ts$/]
    }
  }
});
