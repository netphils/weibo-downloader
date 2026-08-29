import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: '微博下载器',
        namespace: 'https://github.com/netphils/weibo-downloader',
        version: '0.1.0',
        description: '微博内容一键下载脚本',
        author: 'netphils',
        match: ['*://weibo.com/*', '*://*.weibo.com/*', '*://t.cn/*'],
        connect: [
          'sinaimg.cn',
          'weibo.com',
          'weibocdn.com',
          'miaopai.com',
          'qq.com',
          'youku.com',
          'cibntv.net',
          'data.video.iqiyi.com',
          'cache.m.iqiyi.com',
          '*',
        ],
        grant: [
          'GM_addStyle',
          'GM_setValue',
          'GM_getValue',
          'GM_registerMenuCommand',
          'GM_unregisterMenuCommand',
          'GM_xmlhttpRequest',
          'GM_download',
          'unsafeWindow',
        ],
        noframes: true,
        'run-at': 'document-idle',
      },
    }),
  ],
});