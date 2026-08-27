import { loadConfig } from '@/services/auth.service';
import { logger } from '@/utils/logger';
import { waitForElement } from '@/utils/dom';

async function init(): Promise<void> {
  logger.info('微博下载器初始化中...');

  const config = await loadConfig();
  logger.info('配置加载完成', config);

  const mainEl = await waitForElement(
    '.Frame_content_3XrxZ, .m-main, ._content_1ubn9_18',
    10000,
    500
  );

  if (!mainEl) {
    logger.warn('未找到微博页面主容器');
    return;
  }

  logger.info('微博下载器初始化完成');
}

init().catch((err) => {
  logger.error('初始化失败', err);
});