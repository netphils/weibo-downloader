import {
  DOM_IDS,
  DOM_CLASSES,
  DOWNLOAD_STATE,
  TIMEOUTS,
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
let isCollapsed = false;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function createPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.id = DOM_IDS.PANEL;
  panel.innerHTML = `
    <div id="${DOM_IDS.PANEL_HEADER}">
      <span>下载任务</span>
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

  document.body.appendChild(panel);
  return panel;
}

function renderPanel(): void {
  if (!listEl) return;

  if (panelEl) {
    panelEl.style.display = taskMap.size > 0 ? '' : 'none';
  }

  const items = Array.from(taskMap.values()).reverse();
  listEl.innerHTML = items
    .map(
      (task) => `
    <div class="${DOM_CLASSES.TASK_ITEM}">
      <div class="${DOM_CLASSES.TASK_TITLE}">${task.title}</div>
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
  taskMap.set(id, {
    id,
    title,
    currentItem: 0,
    totalItems,
    itemProgress: 0,
    overallProgress: 0,
    status: DOWNLOAD_STATE.PREPARING,
  });

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

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
      taskMap.delete(id);
      renderPanel();
    }, TIMEOUTS.AUTO_HIDE_DELAY);
  }
}

export function removePanelTask(id: string): void {
  taskMap.delete(id);
  renderPanel();
}

export function initPanel(): void {
  panelEl = createPanel();
  listEl = panelEl.querySelector(`#${DOM_IDS.PANEL_LIST}`) as HTMLElement;
  panelEl.style.display = 'none';
}