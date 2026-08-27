import { injectStyle } from '@/utils/style';
import { initAutoDownload } from './auto-download';
import { logger } from '@/utils/logger';
import styles from './styles.css?inline';

export function register(): void {
  injectStyle(styles);
  logger.info('自动下载模块已注册');
  initAutoDownload();
}