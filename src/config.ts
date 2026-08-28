export const LOG_PREFIX = 'gm-weibo-dl';

export const API_ENDPOINTS = {
  STATUS_SHOW: 'https://weibo.com/ajax/statuses/show',
  LONGTEXT: 'https://weibo.com/ajax/statuses/longtext',
  VIDEO_HD: 'https://weibo.com/tv/api/component',
  DOWNLOAD_IMAGE: 'https://weibo.com/ajax/common/download',
} as const;

export const REQUEST_HEADERS = {
  referer: 'https://weibo.com/',
} as const;

export const STORAGE_KEYS = {
  IS_FIRST: 'isFirst',
  MESSAGES_NUMBER: 'messagesNumber',
  NAME_ARR: 'nameArr',
  CACHE_DATA: 'cacheData',
  NOTICE_MESSAGE_LIST: 'noticeMessagelist',
  IS_SPECIAL_HANDLING_NAME: 'isSpecialHandlingName',
  IS_SAVE_HISTORY: 'isSaveHistory',
  IS_AUTO_HIDE: 'isAutoHide',
  IS_SHOW_ACTIVE: 'isShowActive',
  IS_INCLUDES_TEXT: 'isIncludesText',
  IS_VIDEO_HD: 'isVideoHD',
  IS_IMAGE_HD: 'isImageHD',
  SKIP_ORIGINAL: 'skipOriginal',
  SKIP_RETWEET: 'skipRetweet',
  SKIP_LIKED: 'skipLiked',
} as const;

export const DOM_IDS = {
  PANEL: 'gm-weibo-dl-panel',
  PANEL_TOGGLE: 'gm-weibo-dl-panel-toggle',
  PANEL_LIST: 'gm-weibo-dl-panel-list',
  PANEL_HEADER: 'gm-weibo-dl-panel-header',
  AUTO_DOWNLOAD_BTN: 'gm-weibo-dl-auto-download-btn',
} as const;

export const DOM_CLASSES = {
  CONTAINER: 'gm-weibo-dl-container',
  SHOW_MESSAGE: 'gm-weibo-dl-show-message',
  EDIT_NAME: 'gm-weibo-dl-edit-name',
  DOWNLOAD_BTN: 'gm-weibo-dl-download-btn',
  UNACTIVE: 'gm-weibo-dl-unactive',
  ACTIVE: 'gm-weibo-dl-active',
  INPUT_BOX: 'gm-weibo-dl-input-box',
  IS_FIRST: 'gm-weibo-dl-is-first',
  OUT: 'gm-weibo-dl-out',
  PANEL_COLLAPSED: 'gm-weibo-dl-panel-collapsed',
  TASK_ITEM: 'gm-weibo-dl-task-item',
  TASK_TITLE: 'gm-weibo-dl-task-title',
  TASK_PROGRESS: 'gm-weibo-dl-task-progress',
  TASK_PROGRESS_BAR: 'gm-weibo-dl-task-progress-bar',
  TASK_STATUS: 'gm-weibo-dl-task-status',
} as const;

export const DOWNLOAD_STATE = {
  IDLE: '下载',
  PREPARING: '准备中',
  DOWNLOADING: '下载中',
  DONE: '完成',
  ERROR: '失败',
} as const;

export type DownloadState = (typeof DOWNLOAD_STATE)[keyof typeof DOWNLOAD_STATE];

export const DOWNLOAD_MESSAGE = {
  INIT: '',
  GET_READY: '准备中',
  IS_EMPTY_ERROR: '失败，未找到资源',
  IS_UNKNOWN_ERROR: '失败，未知错误(点击重试)',
  FINISH: '完成',
} as const;

export const QUALITY = {
  IMAGE: {
    HD: 'hd',
    NORMAL: 'normal',
  },
  VIDEO: {
    HD: 'hd',
    NORMAL: 'normal',
  },
} as const;

export const TIMEOUTS = {
  PAGE_LOAD_RETRY_INTERVAL: 500,
  PAGE_LOAD_MAX_WAIT: 10000,
  DOWNLOAD_RETRY_LIMIT: 3,
  AUTO_HIDE_DELAY: 5000,
  IMAGE_HD_DELAY_MIN: 800,
  IMAGE_HD_DELAY_MAX: 1300,
  QUEUE_POLL_INTERVAL: 200,
  AUTO_DOWNLOAD_SCROLL_TIMEOUT: 5000,
  AUTO_DOWNLOAD_DONE_WAIT: 120000,
  AUTO_DOWNLOAD_POLL_INTERVAL: 500,
} as const;

export const LIMITS = {
  MESSAGES_MAX: 40,
  MESSAGES_MIN: 3,
  MESSAGES_DEFAULT: 5,
  CACHE_DATA_MAX: 50,
  FILE_NAME_PREVIEW_LENGTH: 20,
  FILE_NAME_EMPTY_TEXT: '(空)',
  FILE_NAME_ELLIPSIS: '…',
  EMPTY_FILE_SIZE: 200,
  EMPTY_GIF_SIZE: 6000,
  DEFAULT_CONCURRENCY: 3,
  IMAGE_CONCURRENCY: 3,
} as const;

export const NAME_ALL = {
  userName: '用户名',
  userID: '用户ID',
  mblogid: '微博(文章)ID',
  time: '时间',
  geoName: '定位',
  region: 'IP区域',
  text: '微博文本(前20字)',
} as const;

export type NameKey = keyof typeof NAME_ALL;

export const DEFAULT_NAME_ARR: NameKey[] = ['userName', 'time'];

export const DEFAULT_CONFIG = {
  [STORAGE_KEYS.IS_SPECIAL_HANDLING_NAME]: false,
  [STORAGE_KEYS.IS_SAVE_HISTORY]: false,
  [STORAGE_KEYS.IS_AUTO_HIDE]: false,
  [STORAGE_KEYS.IS_SHOW_ACTIVE]: false,
  [STORAGE_KEYS.IS_INCLUDES_TEXT]: false,
  [STORAGE_KEYS.IS_VIDEO_HD]: false,
  [STORAGE_KEYS.IS_IMAGE_HD]: false,
  [STORAGE_KEYS.IS_FIRST]: true,
  [STORAGE_KEYS.MESSAGES_NUMBER]: LIMITS.MESSAGES_DEFAULT,
  [STORAGE_KEYS.NAME_ARR]: DEFAULT_NAME_ARR,
} as const;

export const CARD_SELECTORS = {
  MAIN: '.Frame_content_3XrxZ, .m-main, ._content_1ubn9_18',
  CARD_LIST: '.Main_full_1dfQX,.Frame_wrap_16as0,.main-full,._full_1l406_7,._wrap_100l0_2',
  CARD_HEAD: 'div.card-feed div.from, .head-info_info_2AspQ, ._info_1tpft_10',
  CARD_HEAD_LINK: 'a[suda-data], .head-info_time_6sFQg, ._time_1tpft_33',
  ARTICLE: 'article',
} as const;