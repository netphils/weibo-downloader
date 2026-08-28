import { STORAGE_KEYS } from '@/config';
import { getValueSync, setValueSync } from '@/utils/storage';

interface MenuItem {
  id: number;
  key: string;
  label: string;
}

const menuItems: MenuItem[] = [
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
];

function getMenuLabel(value: boolean, label: string): string {
  return `${value ? '✔️' : '❌'} ${label}`;
}

function refreshMenu(): void {
  menuItems.forEach((item) => {
    if (item.id) {
      GM_unregisterMenuCommand(item.id);
    }
    const value = getValueSync<boolean>(item.key, false);
    item.id = GM_registerMenuCommand(getMenuLabel(value, item.label), () => {
      const newValue = !value;
      setValueSync(item.key, newValue);
      refreshMenu();
    });
  });
}

export function registerMenu(): void {
  refreshMenu();
}