import { describe, it, expect, vi } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { createI18n } from 'vue-i18n';
import { createRouter, createWebHistory } from 'vue-router';
import { useCommands, type Command } from '@/composables/useCommands';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      app: {
        tabs: {
          timestamp: 'Timestamp',
          hash: 'Hash',
          base64: 'Base64',
          url: 'URL',
          unicode: 'Unicode',
          pinyin: 'Pinyin',
          qrcode: 'QR Code',
          json: 'JSON',
          jwt: 'JWT',
          uuid: 'UUID',
          color: 'Color',
          diff: 'Diff'
        },
        categories: {
          conversion: 'Conversion',
          generators: 'Generators',
          formatters: 'Formatters'
        }
      },
      cmd: {
        actions: { toggleTheme: 'Toggle Theme' },
        categories: { system: 'System' }
      }
    }
  }
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/:lang?', name: 'home', component: { template: '<div />' } },
    { path: '/:lang?/timestamp', name: 'timestamp', component: { template: '<div />' } },
    { path: '/:lang?/hash', name: 'hash', component: { template: '<div />' } },
    { path: '/:lang?/base64', name: 'base64', component: { template: '<div />' } },
    { path: '/:lang?/url', name: 'url', component: { template: '<div />' } },
    { path: '/:lang?/unicode', name: 'unicode', component: { template: '<div />' } },
    { path: '/:lang?/pinyin', name: 'pinyin', component: { template: '<div />' } },
    { path: '/:lang?/qrcode', name: 'qrcode', component: { template: '<div />' } },
    { path: '/:lang?/json', name: 'json', component: { template: '<div />' } },
    { path: '/:lang?/jwt', name: 'jwt', component: { template: '<div />' } },
    { path: '/:lang?/uuid', name: 'uuid', component: { template: '<div />' } },
    { path: '/:lang?/color', name: 'color', component: { template: '<div />' } },
    { path: '/:lang?/diff', name: 'diff', component: { template: '<div />' } }
  ]
});

config.global.plugins = [i18n, router];

function withSetup<T>(composableFactory: () => T) {
  let result!: T;
  const Comp = defineComponent({
    setup() {
      result = composableFactory();
      return {};
    },
    template: '<div />'
  });
  const wrapper = mount(Comp);
  return { result, wrapper };
}

describe('useCommands', () => {
  it('returns a computed commands array', () => {
    const { result } = withSetup(() => useCommands());
    expect(result.commands.value).toBeInstanceOf(Array);
    expect(result.commands.value.length).toBeGreaterThan(0);
  });

  it('all commands have required properties', () => {
    const { result } = withSetup(() => useCommands());
    result.commands.value.forEach((cmd: Command) => {
      expect(cmd).toHaveProperty('id');
      expect(cmd).toHaveProperty('title');
      expect(cmd).toHaveProperty('category');
      expect(cmd).toHaveProperty('icon');
      expect(cmd).toHaveProperty('action');
      expect(typeof cmd.action).toBe('function');
    });
  });

  it('includes navigation commands for all tools', () => {
    const { result } = withSetup(() => useCommands());
    const ids = result.commands.value.map((c: Command) => c.id);
    expect(ids).toContain('nav-home');
    expect(ids).toContain('nav-hash');
    expect(ids).toContain('nav-base64');
    expect(ids).toContain('nav-json');
    expect(ids).toContain('nav-jwt');
    expect(ids).toContain('nav-uuid');
  });

  it('includes theme toggle action', () => {
    const { result } = withSetup(() => useCommands());
    const ids = result.commands.value.map((c: Command) => c.id);
    expect(ids).toContain('theme-toggle');
  });

  it('nav actions call router.push', async () => {
    const { result } = withSetup(() => useCommands());
    const pushSpy = vi.spyOn(router, 'push');
    const navCmd = result.commands.value.find((c: Command) => c.id === 'nav-hash');
    navCmd?.action();
    expect(pushSpy).toHaveBeenCalledWith({ name: 'hash', params: { lang: 'en' } });
    pushSpy.mockRestore();
  });
});
