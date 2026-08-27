import {
  DOM_CLASSES,
  DOWNLOAD_STATE,
  CARD_SELECTORS,
  STORAGE_KEYS,
} from '@/config';
import type { DownloadState } from '@/config';
import { getResourceById, extractWeiboId, getFileName } from '@/services/data.service';
import { downloadFileBlob, packFilesToZip, triggerDownload } from '@/services/download.service';
import type { FileBlobResult } from '@/services/download.service';
import { getValueSync } from '@/utils/storage';
import { updatePanelTask, addPanelTask } from './download-panel';
import { logger } from '@/utils/logger';

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

  const fileName = getFileName(resource);
  const urlEntries = Object.entries(resource.urlData);

  addPanelTask(weiboId, fileName, urlEntries.length);

  setBtnState(btn, DOWNLOAD_STATE.DOWNLOADING);

  const downloadedFiles: FileBlobResult[] = [];

  for (let i = 0; i < urlEntries.length; i++) {
    const [fileKey, fileUrl] = urlEntries[i];

    const result = await downloadFileBlob(fileUrl, fileKey, (progress) => {
      updatePanelTask(weiboId, {
        currentItem: i + 1,
        totalItems: urlEntries.length,
        itemProgress: progress.percentage,
        overallProgress: ((i + progress.percentage / 100) / urlEntries.length) * 100,
      });
    });

    if (result) {
      downloadedFiles.push(result);
    }

    updatePanelTask(weiboId, {
      currentItem: i + 1,
      totalItems: urlEntries.length,
      overallProgress: ((i + 1) / urlEntries.length) * 100,
    });
  }

  if (downloadedFiles.length === 0) {
    setBtnState(btn, DOWNLOAD_STATE.ERROR);
    updatePanelTask(weiboId, { status: DOWNLOAD_STATE.ERROR });
    return;
  }

  try {
    if (downloadedFiles.length === 1) {
      triggerDownload(downloadedFiles[0].blob, downloadedFiles[0].fileName);
    } else {
      const zipBlob = await packFilesToZip(downloadedFiles);
      triggerDownload(zipBlob, `${fileName}.zip`);
    }
    setBtnState(btn, DOWNLOAD_STATE.DONE);
    updatePanelTask(weiboId, { status: DOWNLOAD_STATE.DONE });
  } catch (err) {
    logger.error('打包下载失败', err);
    setBtnState(btn, DOWNLOAD_STATE.ERROR);
    updatePanelTask(weiboId, { status: DOWNLOAD_STATE.ERROR });
  }
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