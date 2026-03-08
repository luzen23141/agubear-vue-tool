export type ToolCategory = 'conversion' | 'generators' | 'formatters';

export interface ToolRegistryEntry {
  id: string;
  nameKey: string;
  descriptionKey: string;
  ariaKey: string;
  category: ToolCategory;
  icon: string;
}

export const TOOL_REGISTRY: ToolRegistryEntry[] = [
  {
    id: 'timestamp',
    nameKey: 'app.tabs.timestamp',
    descriptionKey: 'timestamp.seo.description',
    ariaKey: 'app.ariaLabels.timestamp',
    category: 'conversion',
    icon: 'clock'
  },
  {
    id: 'hash',
    nameKey: 'app.tabs.hash',
    descriptionKey: 'hash.seo.description',
    ariaKey: 'app.ariaLabels.hash',
    category: 'generators',
    icon: 'hash'
  },
  {
    id: 'base64',
    nameKey: 'app.tabs.base64',
    descriptionKey: 'base64.seo.description',
    ariaKey: 'app.ariaLabels.base64',
    category: 'conversion',
    icon: 'package'
  },
  {
    id: 'url',
    nameKey: 'app.tabs.url',
    descriptionKey: 'url.seo.description',
    ariaKey: 'app.ariaLabels.url',
    category: 'conversion',
    icon: 'link'
  },
  {
    id: 'unicode',
    nameKey: 'app.tabs.unicode',
    descriptionKey: 'unicode.seo.description',
    ariaKey: 'app.ariaLabels.unicode',
    category: 'conversion',
    icon: 'code'
  },
  {
    id: 'pinyin',
    nameKey: 'app.tabs.pinyin',
    descriptionKey: 'pinyin.seo.description',
    ariaKey: 'app.ariaLabels.pinyin',
    category: 'conversion',
    icon: 'type'
  },
  {
    id: 'qrcode',
    nameKey: 'app.tabs.qrcode',
    descriptionKey: 'qrcode.seo.description',
    ariaKey: 'app.ariaLabels.qrcode',
    category: 'generators',
    icon: 'qr-code'
  },
  {
    id: 'json',
    nameKey: 'app.tabs.json',
    descriptionKey: 'json.seo.description',
    ariaKey: 'app.ariaLabels.json',
    category: 'formatters',
    icon: 'wrench'
  },
  {
    id: 'jwt',
    nameKey: 'app.tabs.jwt',
    descriptionKey: 'jwt.seo.description',
    ariaKey: 'app.ariaLabels.jwt',
    category: 'formatters',
    icon: 'key'
  },
  {
    id: 'uuid',
    nameKey: 'app.tabs.uuid',
    descriptionKey: 'uuid.seo.description',
    ariaKey: 'app.ariaLabels.uuid',
    category: 'generators',
    icon: 'id-card'
  },
  {
    id: 'color',
    nameKey: 'app.tabs.color',
    descriptionKey: 'color.seo.description',
    ariaKey: 'app.ariaLabels.color',
    category: 'conversion',
    icon: 'palette'
  },
  {
    id: 'diff',
    nameKey: 'app.tabs.diff',
    descriptionKey: 'diff.seo.description',
    ariaKey: 'app.ariaLabels.diff',
    category: 'generators',
    icon: 'file-diff'
  }
];

export function getToolRouteMeta(toolId: string) {
  const tool = TOOL_REGISTRY.find((entry) => entry.id === toolId);
  if (!tool) {
    return;
  }

  return {
    titleKey: tool.nameKey,
    descriptionKey: tool.descriptionKey
  };
}
