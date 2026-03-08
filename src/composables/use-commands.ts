/* eslint-disable max-lines-per-function */
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { UseTheme } from './use-theme';
import { TOOL_REGISTRY } from '@/utils/tool-registry';

export interface Command {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon: string;
  action: () => void;
  shortcut?: string;
}

export function UseCommands() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { toggleTheme } = UseTheme();

  const navigate = (name: string) => {
    router.push({ name, params: { lang: locale.value } });
  };

  const commands = computed<Command[]>(() => [
    ...TOOL_REGISTRY.map((tool) => ({
      id: tool.commandId,
      title: t(tool.nameKey),
      category: t(`app.categories.${tool.category}`),
      icon: tool.icon,
      action: () => navigate(tool.routeName)
    })),
    {
      id: 'theme-toggle',
      title: t('cmd.actions.toggleTheme'),
      category: t('cmd.categories.system'),
      icon: 'moon-star',
      action: toggleTheme
    }
  ]);

  return {
    commands
  };
}
