import {
  DOM_IDS,
  DOM_CLASSES,
  DOWNLOAD_STATE,
  TIMEOUTS,
  LIMITS,
} from '@/config';
import type { DownloadState } from '@/config';

interface TaskInfo {
  id: string;
  title: string;
  currentItem: number;
  totalItems: number;
  itemProgress: number;
  overallProgress: number;
  status: DownloadState;
}

const taskMap = new Map<string, TaskInfo>();
let panelEl: HTMLElement | null = null;
let listEl: HTMLElement | null = null;
let countEl: HTMLElement | null = null;
let isCollapsed = false;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let downloadedCount = 0;
let skippedCount = 0;

function removeTask(id: string): void {
  taskMap.delete(id);
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  renderPanel();
}

function createPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.id = DOM_IDS.PANEL;
  panel.innerHTML = `
    <div id="${DOM_IDS.PANEL_HEADER}">
      <span>下载任务 <span id="${DOM_IDS.PANEL_COUNT}">(下:0 跳:0)</span></span>
      <button id="${DOM_IDS.PANEL_TOGGLE}" title="折叠/展开">−</button>
    </div>
    <div id="${DOM_IDS.PANEL_LIST}"></div>
  `;

  const toggleBtn = panel.querySelector(`#${DOM_IDS.PANEL_TOGGLE}`) as HTMLElement;
  toggleBtn.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    panel.classList.toggle(DOM_CLASSES.PANEL_COLLAPSED, isCollapsed);
    toggleBtn.textContent = isCollapsed ? '+' : '−';
  });

  const list = panel.querySelector(`#${DOM_IDS.PANEL_LIST}`) as HTMLElement;
  list.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains(DOM_CLASSES.TASK_CANCEL)) {
      const id = target.getAttribute('data-task-id');
      if (id) {
        removeTask(id);
      }
    }
  });

  document.body.appendChild(panel);
  return panel;
}

function renderPanel(): void {
  if (!listEl) return;

  if (panelEl) {
    panelEl.style.display = taskMap.size > 0 ? '' : 'none';
  }

  if (countEl) {
    countEl.textContent = `(下:${downloadedCount} 跳:${skippedCount})`;
  }

  const items = Array.from(taskMap.values()).reverse();
  listEl.innerHTML = items
    .map(
      (task) => `
    <div class="${DOM_CLASSES.TASK_ITEM}">
      <div class="${DOM_CLASSES.TASK_TITLE}">
        <span>${task.title}</span>
        <button class="${DOM_CLASSES.TASK_CANCEL}" data-task-id="${task.id}" title="取消下载">×</button>
      </div>
      <div class="${DOM_CLASSES.TASK_PROGRESS}">
        <div class="${DOM_CLASSES.TASK_PROGRESS_BAR}" style="width:${task.overallProgress.toFixed(1)}%"></div>
      </div>
      <div class="${DOM_CLASSES.TASK_STATUS}">
        ${task.status === DOWNLOAD_STATE.DOWNLOADING ? `${task.currentItem}/${task.totalItems} ${task.overallProgress.toFixed(1)}%` : ''}
        ${task.status === DOWNLOAD_STATE.DONE ? '完成' : ''}
        ${task.status === DOWNLOAD_STATE.ERROR ? '失败' : ''}
        ${task.status === DOWNLOAD_STATE.PREPARING ? '准备中' : ''}
      </div>
    </div>
  `
    )
    .join('');
}

export function addPanelTask(id: string, title: string, totalItems: number): void {
  downloadedCount++;

  taskMap.set(id, {
    id,
    title,
    currentItem: 0,
    totalItems,
    itemProgress: 0,
    overallProgress: 0,
    status: DOWNLOAD_STATE.PREPARING,
  });

  if (taskMap.size > LIMITS.PANEL_MAX_ENTRIES) {
    const oldestKey = taskMap.keys().next().value as string;
    if (oldestKey) {
      removeTask(oldestKey);
    }
  }

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  renderPanel();
}

export function incrementSkippedCount(): void {
  skippedCount++;
  renderPanel();
}

export function updatePanelTask(
  id: string,
  update: Partial<Omit<TaskInfo, 'id' | 'title'>>
): void {
  const task = taskMap.get(id);
  if (!task) return;

  Object.assign(task, update);
  renderPanel();

  if (task.status === DOWNLOAD_STATE.DONE || task.status === DOWNLOAD_STATE.ERROR) {
    hideTimer = setTimeout(() => {
      removeTask(id);
    }, TIMEOUTS.AUTO_HIDE_DELAY);
  }
}

export function removePanelTask(id: string): void {
  removeTask(id);
}

export function initPanel(): void {
  panelEl = createPanel();
  listEl = panelEl.querySelector(`#${DOM_IDS.PANEL_LIST}`) as HTMLElement;
  countEl = panelEl.querySelector(`#${DOM_IDS.PANEL_COUNT}`) as HTMLElement;
  panelEl.style.display = 'none';
}