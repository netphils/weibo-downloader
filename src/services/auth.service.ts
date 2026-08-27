import { getValue, setValue } from '@/utils/storage';
import { STORAGE_KEYS, DEFAULT_CONFIG } from '@/config';
import type { NameKey } from '@/config';

export interface AuthConfig {
  isSpecialHandlingName: boolean;
  isSaveHistory: boolean;
  isAutoHide: boolean;
  isShowActive: boolean;
  isIncludesText: boolean;
  isVideoHD: boolean;
  isImageHD: boolean;
  isFirst: boolean;
  messagesNumber: number;
  nameArr: NameKey[];
}

export async function loadConfig(): Promise<AuthConfig> {
  return {
    isSpecialHandlingName: await getValue<boolean>(
      STORAGE_KEYS.IS_SPECIAL_HANDLING_NAME,
      DEFAULT_CONFIG[STORAGE_KEYS.IS_SPECIAL_HANDLING_NAME]
    ),
    isSaveHistory: await getValue<boolean>(
      STORAGE_KEYS.IS_SAVE_HISTORY,
      DEFAULT_CONFIG[STORAGE_KEYS.IS_SAVE_HISTORY]
    ),
    isAutoHide: await getValue<boolean>(
      STORAGE_KEYS.IS_AUTO_HIDE,
      DEFAULT_CONFIG[STORAGE_KEYS.IS_AUTO_HIDE]
    ),
    isShowActive: await getValue<boolean>(
      STORAGE_KEYS.IS_SHOW_ACTIVE,
      DEFAULT_CONFIG[STORAGE_KEYS.IS_SHOW_ACTIVE]
    ),
    isIncludesText: await getValue<boolean>(
      STORAGE_KEYS.IS_INCLUDES_TEXT,
      DEFAULT_CONFIG[STORAGE_KEYS.IS_INCLUDES_TEXT]
    ),
    isVideoHD: await getValue<boolean>(
      STORAGE_KEYS.IS_VIDEO_HD,
      DEFAULT_CONFIG[STORAGE_KEYS.IS_VIDEO_HD]
    ),
    isImageHD: await getValue<boolean>(
      STORAGE_KEYS.IS_IMAGE_HD,
      DEFAULT_CONFIG[STORAGE_KEYS.IS_IMAGE_HD]
    ),
    isFirst: await getValue<boolean>(
      STORAGE_KEYS.IS_FIRST,
      DEFAULT_CONFIG[STORAGE_KEYS.IS_FIRST]
    ),
    messagesNumber: await getValue<number>(
      STORAGE_KEYS.MESSAGES_NUMBER,
      DEFAULT_CONFIG[STORAGE_KEYS.MESSAGES_NUMBER]
    ),
    nameArr: await getValue<NameKey[]>(
      STORAGE_KEYS.NAME_ARR,
      DEFAULT_CONFIG[STORAGE_KEYS.NAME_ARR]
    ),
  };
}

export async function saveConfig<K extends keyof AuthConfig>(
  key: K,
  value: AuthConfig[K]
): Promise<void> {
  const storageKey = STORAGE_KEYS[key.toUpperCase() as keyof typeof STORAGE_KEYS];
  if (storageKey) {
    await setValue(storageKey, value);
  }
}