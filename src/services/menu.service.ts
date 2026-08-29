import { STORAGE_KEYS, LIMITS } from '@/config';
import { getValueSync, setValueSync } from '@/utils/storage';

interface BoolMenuItem {
  id: number;
  key: string;
  label: string;
}

interface IntMenuItem {
  id: number;
  key: string;
  label: string;
  defaultValue: number;
}

const boolMenuItems: BoolMenuItem[] = [
  {
    id: 0,
    key: STORAGE_KEYS.IS_IMAGE_HD,
    label: '是否下载最高清的图片',
  },
  {
    id: 0,
    key: STORAGE_KEYS.IS_VIDEO_HD,
    label: '是否下载最高清的视频',
  },
  {
    id: 0,
    key: STORAGE_KEYS.SKIP_ORIGINAL,
    label: '自动下载跳过原创',
  },
  {
    id: 0,
    key: STORAGE_KEYS.SKIP_RETWEET,
    label: '自动下载跳过转发',
  },
  {
    id: 0,
    key: STORAGE_KEYS.SKIP_LIKED,
    label: '自动下载跳过赞过',
  },
];

const intMenuItems: IntMenuItem[] = [
  {
    id: 0,
    key: STORAGE_KEYS.FILE_NAME_MAX_LENGTH,
    label: '文件名最大长度',
    defaultValue: LIMITS.FILE_NAME_MAX_LENGTH,
  },
];

function getBoolLabel(value: boolean, label: string): string {
  return `${value ? '✔️' : '❌'} ${label}`;
}

function getIntLabel(value: number, label: string): string {
  return `${label}: ${value} 字符`;
}

function refreshMenu(): void {
  boolMenuItems.forEach((item) => {
    if (item.id) {
      GM_unregisterMenuCommand(item.id);
    }
    const value = getValueSync<boolean>(item.key, false);
    item.id = GM_registerMenuCommand(getBoolLabel(value, item.label), () => {
      setValueSync(item.key, !value);
      refreshMenu();
    });
  });

  intMenuItems.forEach((item) => {
    if (item.id) {
      GM_unregisterMenuCommand(item.id);
    }
    const value = getValueSync<number>(item.key, item.defaultValue);
    item.id = GM_registerMenuCommand(getIntLabel(value, item.label), () => {
      const input = prompt(`请输入${item.label}（当前: ${value}）`, String(value));
      if (input !== null) {
        const num = parseInt(input, 10);
        if (!isNaN(num) && num > 0) {
          setValueSync(item.key, num);
          refreshMenu();
        }
      }
    });
  });
}

export function registerMenu(): void {
  refreshMenu();
}