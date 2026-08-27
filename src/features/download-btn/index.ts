import { injectStyle } from '@/utils/style';
import { initDownloadButtons } from './download-btn';
import { initPanel } from './download-panel';
import { logger } from '@/utils/logger';
import styles from './styles.css?inline';

export function register(): void {
  injectStyle(styles);
  logger.info('下载按钮模块已注册');
  initDownloadButtons();
  initPanel();
}