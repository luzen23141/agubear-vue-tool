import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import TimestampConverter from '../components/TimestampConverter.vue';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/timestamp'
  },
  {
    path: '/timestamp',
    name: 'timestamp',
    component: TimestampConverter,
    meta: {
      title: 'app.tabs.timestamp',
      description: 'app.description'
    }
  },
  {
    path: '/hash',
    name: 'hash',
    component: () => import('../components/HashGenerator.vue'),
    meta: {
      title: 'app.tabs.hash'
    }
  },
  {
    path: '/base64',
    name: 'base64',
    component: () => import('../components/Base64Converter.vue'),
    meta: {
      title: 'app.tabs.base64'
    }
  },
  {
    path: '/url',
    name: 'url',
    component: () => import('../components/UrlConverter.vue'),
    meta: {
      title: 'app.tabs.url'
    }
  },
  {
    path: '/unicode',
    name: 'unicode',
    component: () => import('../components/UnicodeConverter.vue'),
    meta: {
      title: 'app.tabs.unicode'
    }
  },
  {
    path: '/pinyin',
    name: 'pinyin',
    component: () => import('../components/PinyinConverter.vue'),
    meta: {
      title: 'app.tabs.pinyin'
    }
  },
  {
    path: '/qrcode',
    name: 'qrcode',
    component: () => import('../components/QrCodeGenerator.vue'),
    meta: {
      title: 'app.tabs.qrcode'
    }
  },
  {
    path: '/json',
    name: 'json',
    component: () => import('../components/JsonFormatter.vue'),
    meta: {
      title: 'app.tabs.json'
    }
  },
  // Catch-all for 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

export default router;
