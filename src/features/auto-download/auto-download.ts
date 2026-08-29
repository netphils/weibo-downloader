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
import { incrementSkippedCount } from '@/features/download-btn/download-panel';

let running = false;
let btnEl: HTMLElement | null = null;
const processedIds = new Set<string>();

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

interface CardEntry {
  btn: HTMLElement;
  article: Element;
  id: string;
}

function getVisibleCards(): CardEntry[] {
  const articles = document.querySelectorAll(CARD_SELECTORS.ARTICLE);
  const cards: CardEntry[] = [];
  articles.forEach((article) => {
    const btn = article.querySelector(`.${DOM_CLASSES.DOWNLOAD_BTN}`) as HTMLElement;
    if (!btn) return;
    const id = extractWeiboId(article);
    if (id) {
      cards.push({ btn, article, id });
    }
  });
  return cards;
}

function isCardProcessed(card: CardEntry): boolean {
  return (
    processedIds.has(card.id) ||
    card.btn.textContent === DOWNLOAD_STATE.DONE ||
    card.btn.textContent === DOWNLOAD_STATE.ERROR
  );
}

function findNextCard(): CardEntry | null {
  const cards = getVisibleCards();

  let lastProcessedIdx = -1;
  for (let i = cards.length - 1; i >= 0; i--) {
    if (isCardProcessed(cards[i])) {
      lastProcessedIdx = i;
      break;
    }
  }

  const startIdx = lastProcessedIdx >= 0 ? lastProcessedIdx + 1 : 0;
  for (let i = startIdx; i < cards.length; i++) {
    if (!processedIds.has(cards[i].id)) {
      return cards[i];
    }
  }
  return null;
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

async function scrollAndWaitForNewCards(): Promise<boolean> {
  const startTime = Date.now();
  let prevHeight = document.documentElement.scrollHeight;

  while (Date.now() - startTime < TIMEOUTS.AUTO_DOWNLOAD_SCROLL_TIMEOUT) {
    if (!running) return false;

    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 1000));

    // Check if any unprocessed cards appeared
    const next = findNextCard();
    if (next) return true;

    // Check if scrolled to the bottom
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
    if (atBottom) {
      // Wait a bit more for lazy loading
      await new Promise((r) => setTimeout(r, 2000));
      const finalNext = findNextCard();
      if (finalNext) return true;

      // Check if page height changed (new content loaded)
      const newHeight = document.documentElement.scrollHeight;
      if (newHeight > prevHeight) {
        prevHeight = newHeight;
        continue;
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
  processedIds.clear();
  logger.info('自动下载开始');

  try {
    while (running) {
      let target = findNextCard();

      if (!target) {
        const hasNew = await scrollAndWaitForNewCards();
        if (!hasNew) {
          logger.info('自动下载完成，无更多卡片');
          break;
        }
        target = findNextCard();
        if (!target) continue;
      }

      const { btn, id } = target;

      const cardType = await getCardTypeById(id);
      if (shouldSkipType(cardType)) {
        logger.info(`跳过${cardType}类型卡片`, id);
        processedIds.add(id);
        incrementSkippedCount();
        btn.textContent = DOWNLOAD_STATE.DONE;
        btn.className = `${DOM_CLASSES.DOWNLOAD_BTN} gm-weibo-dl-state-done`;
        continue;
      }

      btn.click();
      await waitForDownloadDone(btn);
      processedIds.add(id);
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