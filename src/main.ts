import { loadConfig } from '@/services/auth.service';
import { logger } from '@/utils/logger';
import { waitForElement } from '@/utils/dom';
import { register as registerDownloadBtn } from '@/features/download-btn/index';
import { register as registerAutoDownload } from '@/features/auto-download/index';
import { registerMenu } from '@/services/menu.service';
import { CARD_SELECTORS } from '@/config';

async function init(): Promise<void> {
  logger.info('微博下载器初始化中...');

  await loadConfig();
  logger.info('配置加载完成');

  registerMenu();

  const mainEl = await waitForElement(
    CARD_SELECTORS.MAIN,
    10000,
    500
  );

  if (!mainEl) {
    logger.warn('未找到微博页面主容器');
    return;
  }

  registerDownloadBtn();
  registerAutoDownload();
  logger.info('微博下载器初始化完成');
}

init().catch((err) => {
  logger.error('初始化失败', err);
});