export type ToolCategory = 'conversion' | 'generators' | 'formatters';

export interface ToolRegistryEntry {
  id: string;
  routeName: string;
  nameKey: string;
  ariaKey: string;
  category: ToolCategory;
  icon: string;
  commandId: string;
}

export const TOOL_REGISTRY: ToolRegistryEntry[] = [
  {
    id: 'timestamp',
    routeName: 'timestamp',
    nameKey: 'app.tabs.timestamp',
    ariaKey: 'app.ariaLabels.timestamp',
    category: 'conversion',
    icon: 'clock',
    commandId: 'nav-home'
  },
  {
    id: 'hash',
    routeName: 'hash',
    nameKey: 'app.tabs.hash',
    ariaKey: 'app.ariaLabels.hash',
    category: 'generators',
    icon: 'hash',
    commandId: 'nav-hash'
  },
  {
    id: 'base64',
    routeName: 'base64',
    nameKey: 'app.tabs.base64',
    ariaKey: 'app.ariaLabels.base64',
    category: 'conversion',
    icon: 'package',
    commandId: 'nav-base64'
  },
  {
    id: 'url',
    routeName: 'url',
    nameKey: 'app.tabs.url',
    ariaKey: 'app.ariaLabels.url',
    category: 'conversion',
    icon: 'link',
    commandId: 'nav-url'
  },
  {
    id: 'unicode',
    routeName: 'unicode',
    nameKey: 'app.tabs.unicode',
    ariaKey: 'app.ariaLabels.unicode',
    category: 'conversion',
    icon: 'code',
    commandId: 'nav-unicode'
  },
  {
    id: 'pinyin',
    routeName: 'pinyin',
    nameKey: 'app.tabs.pinyin',
    ariaKey: 'app.ariaLabels.pinyin',
    category: 'conversion',
    icon: 'type',
    commandId: 'nav-pinyin'
  },
  {
    id: 'qrcode',
    routeName: 'qrcode',
    nameKey: 'app.tabs.qrcode',
    ariaKey: 'app.ariaLabels.qrcode',
    category: 'generators',
    icon: 'qr-code',
    commandId: 'nav-qrcode'
  },
  {
    id: 'json',
    routeName: 'json',
    nameKey: 'app.tabs.json',
    ariaKey: 'app.ariaLabels.json',
    category: 'formatters',
    icon: 'wrench',
    commandId: 'nav-json'
  },
  {
    id: 'jwt',
    routeName: 'jwt',
    nameKey: 'app.tabs.jwt',
    ariaKey: 'app.ariaLabels.jwt',
    category: 'formatters',
    icon: 'key',
    commandId: 'nav-jwt'
  },
  {
    id: 'uuid',
    routeName: 'uuid',
    nameKey: 'app.tabs.uuid',
    ariaKey: 'app.ariaLabels.uuid',
    category: 'generators',
    icon: 'id-card',
    commandId: 'nav-uuid'
  },
  {
    id: 'color',
    routeName: 'color',
    nameKey: 'app.tabs.color',
    ariaKey: 'app.ariaLabels.color',
    category: 'conversion',
    icon: 'palette',
    commandId: 'nav-color'
  },
  {
    id: 'diff',
    routeName: 'diff',
    nameKey: 'app.tabs.diff',
    ariaKey: 'app.ariaLabels.diff',
    category: 'generators',
    icon: 'file-diff',
    commandId: 'nav-diff'
  }
];
