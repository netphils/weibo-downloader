import {
  DOM_IDS,
  DOM_CLASSES,
  DOWNLOAD_STATE,
  CARD_SELECTORS,
  TIMEOUTS,
  STORAGE_KEYS,
} from '@/config';
import { extractWeiboId } from '@/services/data.service';
import { getCardTypeById } from '@/services/data.service';
import type { CardType } from '@/services/data.service';
import { getValueSync } from '@/utils/storage';
import { logger } from '@/utils/logger';

let running = false;
let btnEl: HTMLElement | null = null;

function createButton(): HTMLElement {
  const btn = document.createElement('button');
  btn.id = DOM_IDS.AUTO_DOWNLOAD_BTN;
  btn.textContent = '自动下载';
  btn.title = '从最后一个已完成卡片开始自动下载';
  btn.addEventListener('click', () => {
    if (running) {
      stopAutoDownload();
    } else {
      startAutoDownload();
    }
  });
  document.body.appendChild(btn);
  return btn;
}

function setRunning(state: boolean): void {
  running = state;
  if (btnEl) {
    btnEl.textContent = state ? '停止' : '自动下载';
    btnEl.title = state ? '停止自动下载' : '从最后一个已完成卡片开始自动下载';
    btnEl.classList.toggle('gm-weibo-dl-auto-active', state);
  }
}

function getDownloadButtons(): HTMLElement[] {
  const articles = document.querySelectorAll(CARD_SELECTORS.ARTICLE);
  const btns: HTMLElement[] = [];
  articles.forEach((article) => {
    const btn = article.querySelector(`.${DOM_CLASSES.DOWNLOAD_BTN}`) as HTMLElement;
    if (btn) {
      btns.push(btn);
    }
  });
  return btns;
}

function findNextCardIndex(): number {
  const btns = getDownloadButtons();
  for (let i = btns.length - 1; i >= 0; i--) {
    if (btns[i].textContent === DOWNLOAD_STATE.DONE) {
      return i + 1;
    }
  }
  return 0;
}

async function waitForDownloadDone(btn: HTMLElement): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < TIMEOUTS.AUTO_DOWNLOAD_DONE_WAIT) {
    if (!running) return;
    const text = btn.textContent;
    if (text === DOWNLOAD_STATE.DONE || text === DOWNLOAD_STATE.ERROR) {
      return;
    }
    await new Promise((r) => setTimeout(r, TIMEOUTS.AUTO_DOWNLOAD_POLL_INTERVAL));
  }
}

async function scrollAndWaitForNewCards(currentCount: number): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < TIMEOUTS.AUTO_DOWNLOAD_SCROLL_TIMEOUT) {
    if (!running) return false;

    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 1000));

    const newCount = getDownloadButtons().length;
    if (newCount > currentCount) {
      return true;
    }

    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 10) {
      await new Promise((r) => setTimeout(r, 1000));
      const finalCount = getDownloadButtons().length;
      if (finalCount > currentCount) {
        return true;
      }
      return false;
    }
  }
  return false;
}

function shouldSkipType(type: CardType): boolean {
  switch (type) {
    case 'original':
      return getValueSync<boolean>(STORAGE_KEYS.SKIP_ORIGINAL, false);
    case 'retweet':
      return getValueSync<boolean>(STORAGE_KEYS.SKIP_RETWEET, false);
    case 'liked':
      return getValueSync<boolean>(STORAGE_KEYS.SKIP_LIKED, false);
    default:
      return false;
  }
}

async function startAutoDownload(): Promise<void> {
  setRunning(true);
  logger.info('自动下载开始');

  try {
    while (running) {
      const nextIndex = findNextCardIndex();
      const btns = getDownloadButtons();

      if (nextIndex >= btns.length) {
        const currentCount = btns.length;
        const hasNew = await scrollAndWaitForNewCards(currentCount);
        if (!hasNew) {
          logger.info('自动下载完成，无更多卡片');
          break;
        }
        continue;
      }

      const targetBtn = btns[nextIndex];
      const article = targetBtn.closest(CARD_SELECTORS.ARTICLE);
      if (!article) continue;

      const weiboId = extractWeiboId(article);
      if (weiboId) {
        const cardType = await getCardTypeById(weiboId);
        if (shouldSkipType(cardType)) {
          logger.info(`跳过${cardType}类型卡片`, weiboId);
          targetBtn.textContent = DOWNLOAD_STATE.DONE;
          targetBtn.className = `${DOM_CLASSES.DOWNLOAD_BTN} gm-weibo-dl-state-done`;
          continue;
        }
      }

      article.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetBtn.click();
      await waitForDownloadDone(targetBtn);
    }
  } catch (err) {
    logger.error('自动下载异常', err);
  }

  setRunning(false);
  logger.info('自动下载结束');
}

function stopAutoDownload(): void {
  setRunning(false);
  logger.info('自动下载已停止');
}

export function initAutoDownload(): void {
  btnEl = createButton();
}