import {
  DOM_CLASSES,
  DOWNLOAD_STATE,
  CARD_SELECTORS,
  STORAGE_KEYS,
} from '@/config';
import type { DownloadState } from '@/config';
import { getResourceById, extractWeiboId, buildDownloadFileName } from '@/services/data.service';
import { downloadFileDirect } from '@/services/download.service';
import type { DownloadProgress } from '@/services/download.service';
import { getValueSync, setValueSync } from '@/utils/storage';
import { updatePanelTask, addPanelTask } from './download-panel';

function getMarkedIds(): string[] {
  try {
    return JSON.parse(getValueSync<string>(STORAGE_KEYS.MARKED_IDS, '[]'));
  } catch {
    return [];
  }
}

function setMarkedIds(ids: string[]): void {
  setValueSync(STORAGE_KEYS.MARKED_IDS, JSON.stringify(ids));
}

function isMarked(id: string): boolean {
  return getMarkedIds().includes(id);
}

function toggleMark(btn: HTMLElement, id: string): void {
  const ids = getMarkedIds();
  const idx = ids.indexOf(id);
  if (idx >= 0) {
    ids.splice(idx, 1);
  } else {
    ids.push(id);
  }
  setMarkedIds(ids);
  updateMarkBtn(btn, ids.includes(id));
}

function createMarkBtn(): HTMLElement {
  const btn = document.createElement('button');
  btn.className = DOM_CLASSES.MARK_BTN;
  btn.title = '标记/取消标记';
  return btn;
}

function updateMarkBtn(btn: HTMLElement, marked: boolean): void {
  btn.textContent = marked ? '★' : '☆';
  if (marked) {
    btn.classList.add('gm-weibo-dl-marked');
  } else {
    btn.classList.remove('gm-weibo-dl-marked');
  }
}

function createDownloadBtn(): HTMLElement {
  const btn = document.createElement('button');
  btn.className = DOM_CLASSES.DOWNLOAD_BTN;
  btn.textContent = DOWNLOAD_STATE.IDLE;
  btn.title = '点击下载';
  return btn;
}

function setBtnState(btn: HTMLElement, state: DownloadState): void {
  btn.textContent = state;
  btn.className = `${DOM_CLASSES.DOWNLOAD_BTN} gm-weibo-dl-state-${state === DOWNLOAD_STATE.DOWNLOADING ? 'downloading' : state === DOWNLOAD_STATE.DONE ? 'done' : state === DOWNLOAD_STATE.ERROR ? 'error' : 'idle'}`;
  btn.title = state === DOWNLOAD_STATE.ERROR ? '点击重试' : state === DOWNLOAD_STATE.DONE ? '下载完成' : state === DOWNLOAD_STATE.PREPARING ? '准备中' : state === DOWNLOAD_STATE.DOWNLOADING ? '下载中' : '点击下载';
}

function insertDownloadBtn(article: Element): void {
  const header = article.querySelector('header');
  if (!header) return;

  if (header.querySelector(`.${DOM_CLASSES.DOWNLOAD_BTN}`)) return;

  const weiboId = extractWeiboId(article);

  const btn = createDownloadBtn();

  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const state = btn.textContent;
    if (state === DOWNLOAD_STATE.DOWNLOADING || state === DOWNLOAD_STATE.PREPARING) {
      return;
    }
    await handleDownload(article, btn);
  });

  header.appendChild(btn);

  if (weiboId) {
    const markBtn = createMarkBtn();
    updateMarkBtn(markBtn, isMarked(weiboId));
    markBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleMark(markBtn, weiboId);
    });
    header.appendChild(markBtn);
  }
}

async function handleDownload(card: Element, btn: HTMLElement): Promise<void> {
  const weiboId = extractWeiboId(card);
  if (!weiboId) {
    setBtnState(btn, DOWNLOAD_STATE.ERROR);
    return;
  }

  setBtnState(btn, DOWNLOAD_STATE.PREPARING);

  const isImageHD = getValueSync<boolean>(STORAGE_KEYS.IS_IMAGE_HD, false);
  const isVideoHD = getValueSync<boolean>(STORAGE_KEYS.IS_VIDEO_HD, false);

  const resource = await getResourceById(weiboId, isImageHD, isVideoHD);
  if (!resource || Object.keys(resource.urlData).length === 0) {
    setBtnState(btn, DOWNLOAD_STATE.ERROR);
    return;
  }

  const urlEntries = Object.entries(resource.urlData);

  addPanelTask(weiboId, buildDownloadFileName(resource, '', 0, urlEntries.length), urlEntries.length);

  setBtnState(btn, DOWNLOAD_STATE.DOWNLOADING);
  updatePanelTask(weiboId, { status: DOWNLOAD_STATE.DOWNLOADING });

  let successCount = 0;

  for (let i = 0; i < urlEntries.length; i++) {
    const [fileKey, fileUrl] = urlEntries[i];
    const ext = fileKey.split('.').pop() || 'jpg';
    const downloadName = buildDownloadFileName(resource, ext, i + 1, urlEntries.length);

    try {
      await downloadFileDirect(fileUrl, downloadName, (progress: DownloadProgress) => {
        updatePanelTask(weiboId, {
          currentItem: i + 1,
          totalItems: urlEntries.length,
          itemProgress: progress.percentage,
          overallProgress: ((i + progress.percentage / 100) / urlEntries.length) * 100,
        });
      });
      successCount++;
    } catch {
      // download failed, continue to next file
    }

    updatePanelTask(weiboId, {
      currentItem: i + 1,
      totalItems: urlEntries.length,
      overallProgress: ((i + 1) / urlEntries.length) * 100,
    });
  }

  if (successCount === 0) {
    setBtnState(btn, DOWNLOAD_STATE.ERROR);
    updatePanelTask(weiboId, { status: DOWNLOAD_STATE.ERROR });
    return;
  }

  setBtnState(btn, DOWNLOAD_STATE.DONE);
  updatePanelTask(weiboId, { status: DOWNLOAD_STATE.DONE });
}

export function initDownloadButtons(): void {
  const observer = new MutationObserver(() => {
    const articles = document.querySelectorAll(CARD_SELECTORS.ARTICLE);
    articles.forEach((article) => {
      insertDownloadBtn(article);
    });
  });

  const mainEl = document.querySelector(CARD_SELECTORS.MAIN);
  if (mainEl) {
    observer.observe(mainEl, { childList: true, subtree: true });
  }

  const articles = document.querySelectorAll(CARD_SELECTORS.ARTICLE);
  articles.forEach((article) => {
    insertDownloadBtn(article);
  });
}