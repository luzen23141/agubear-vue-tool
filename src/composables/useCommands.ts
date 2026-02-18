/* eslint-disable max-lines-per-function */
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

export interface Command {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon: string;
  action: () => void;
  shortcut?: string;
}

export function useCommands() {
  const { t, locale } = useI18n();
  const router = useRouter();

  const navigate = (name: string) => {
    router.push({ name, params: { lang: locale.value } });
  };

  const commands = computed<Command[]>(() => [
    // Navigation
    {
      id: 'nav-home',
      title: t('app.tabs.timestamp'),
      category: t('app.categories.conversion'),
      icon: '🕒',
      action: () => navigate('timestamp')
    },
    {
      id: 'nav-hash',
      title: t('app.tabs.hash'),
      category: t('app.categories.generators'),
      icon: '#️⃣',
      action: () => navigate('hash')
    },
    {
      id: 'nav-base64',
      title: t('app.tabs.base64'),
      category: t('app.categories.conversion'),
      icon: '📦',
      action: () => navigate('base64')
    },
    {
      id: 'nav-url',
      title: t('app.tabs.url'),
      category: t('app.categories.conversion'),
      icon: '🔗',
      action: () => navigate('url')
    },
    {
      id: 'nav-unicode',
      title: t('app.tabs.unicode'),
      category: t('app.categories.conversion'),
      icon: '🔣',
      action: () => navigate('unicode')
    },
    {
      id: 'nav-pinyin',
      title: t('app.tabs.pinyin'),
      category: t('app.categories.conversion'),
      icon: '🀄',
      action: () => navigate('pinyin')
    },
    {
      id: 'nav-qrcode',
      title: t('app.tabs.qrcode'),
      category: t('app.categories.generators'),
      icon: '📱',
      action: () => navigate('qrcode')
    },
    {
      id: 'nav-json',
      title: t('app.tabs.json'),
      category: t('app.categories.formatters'),
      icon: '🔧',
      action: () => navigate('json')
    },
    {
      id: 'nav-jwt',
      title: t('app.tabs.jwt'),
      category: t('app.categories.formatters'),
      icon: '🔑',
      action: () => navigate('jwt')
    },
    {
      id: 'nav-uuid',
      title: t('app.tabs.uuid'),
      category: t('app.categories.generators'),
      icon: '🆔',
      action: () => navigate('uuid')
    },
    {
      id: 'nav-color',
      title: t('app.tabs.color'),
      category: t('app.categories.conversion'),
      icon: '🎨',
      action: () => navigate('color')
    },
    {
      id: 'nav-diff',
      title: t('app.tabs.diff'),
      category: t('app.categories.generators'),
      icon: '📝',
      action: () => navigate('diff')
    },
    // Actions
    {
      id: 'theme-toggle',
      title: t('cmd.actions.toggleTheme'),
      category: t('cmd.categories.system'),
      icon: '🌗',
      action: () => {
        // Trigger theme toggle (Need to inject or emit)
        document.querySelector<HTMLButtonElement>('.theme-toggle')?.click();
      }
    }
  ]);

  return {
    commands
  };
}
