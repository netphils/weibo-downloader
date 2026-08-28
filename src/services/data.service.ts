import type { WeiboResource, ResourceUrlData } from '@/types';
import type { PicInfo, MixMediaInfo, PageInfo } from '@/types';
import { getInfoById, getVideoHD } from './weibo-api.service';
import { API_ENDPOINTS, LIMITS } from '@/config';

export type CardType = 'original' | 'retweet' | 'liked';

export async function getCardTypeById(id: string): Promise<CardType> {
  const status = await getInfoById(id);
  if (!status) return 'original';
  if (status.title?.text?.includes('赞过')) return 'liked';
  if (status.retweeted_status) return 'retweet';
  return 'original';
}

function getSuffixName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.(\w+)$/);
    if (match && !['json', null].includes(match[1])) {
      return match[1];
    }
  } catch {
    // URL parse failed
  }
  return 'mp4';
}

function formatNumber(num: number): string {
  return String(num).padStart(2, '0');
}

function getPicUrlFromInfo(
  picInfo: PicInfo,
  pid: string,
  mblogVipType: number,
  isImageHD: boolean
): string {
  const mw2000Url = picInfo.mw2000?.url || '';

  if (mblogVipType === 1 || !isImageHD || getSuffixName(mw2000Url) === 'gif') {
    return mw2000Url;
  }

  return `${API_ENDPOINTS.DOWNLOAD_IMAGE}?pid=${pid}`;
}

function extractPidFromUrl(url: string): string | null {
  const match = url.match(/([\w]+)(?=\.\w+$)/);
  return match ? match[1] : null;
}

function handlePageInfo(pageInfo: PageInfo): string {
  const playbackList = pageInfo.media_info?.playback_list;
  if (playbackList && playbackList.length > 0) {
    return playbackList[0].play_info.url || '';
  }
  if (pageInfo.object_type === 'live') {
    return pageInfo.media_info?.replay_hd || '';
  }
  return pageInfo.media_info?.stream_url || '';
}

export async function getResourceById(
  id: string,
  isImageHD: boolean,
  isVideoHD: boolean
): Promise<WeiboResource | null> {
  const statusResponse = await getInfoById(id);
  if (!statusResponse) {
    return null;
  }

  const {
    pic_infos: picInfos,
    mix_media_info: mixMediaInfo,
    page_info: pageInfo,
    text_raw: textRaw = '',
    isLongText = false,
    mblogid = '',
    region_name: regionName = '',
    geo,
    created_at: createdAt,
    mblog_vip_type: mblogVipType = 0,
    user: { screen_name: userName, idstr: userID },
  } = statusResponse;

  const date = new Date(createdAt || '');
  const time = `${date.getFullYear()}-${formatNumber(date.getMonth() + 1)}-${formatNumber(date.getDate())} ${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}`;

  const urlData: ResourceUrlData = {};

  if (picInfos) {
    const keys = Object.keys(picInfos);
    keys.forEach((key, index) => {
      const afterName = keys.length === 1 ? '' : `-part${formatNumber(index + 1)}`;
      const picInfo = picInfos[key];

      const url = getPicUrlFromInfo(picInfo, key, mblogVipType, isImageHD);
      urlData[`${afterName}.${getSuffixName(picInfo.mw2000?.url || '')}`] = url;

      if (picInfo.type === 'livephoto' && picInfo.video) {
        urlData[`${afterName}.${getSuffixName(picInfo.video)}`] = picInfo.video;
      }
    });
  }

  if (mixMediaInfo) {
    await processMixMedia(mixMediaInfo, urlData, isImageHD, isVideoHD);
  }

  if (pageInfo && Object.keys(urlData).length === 0) {
    const videoUrl = handlePageInfo(pageInfo);
    if (videoUrl) {
      urlData[`video.${getSuffixName(videoUrl)}`] = videoUrl;
    }
  }

  return {
    urlData,
    time,
    geo: geo || {},
    isLongText,
    mblogid,
    text: textRaw,
    regionName,
    userName,
    userID,
  };
}

async function processMixMedia(
  mixMediaInfo: MixMediaInfo,
  urlData: ResourceUrlData,
  isImageHD: boolean,
  isVideoHD: boolean
): Promise<void> {
  for (let i = 0; i < mixMediaInfo.items.length; i++) {
    const item = mixMediaInfo.items[i];
    const afterName = mixMediaInfo.items.length === 1 ? '' : `-part${formatNumber(i + 1)}`;

    if (item.type === 'video') {
      const objectId = item.data.object_id || '';
      let mediaUrl = '';

      if (isVideoHD && objectId) {
        const hdUrl = await getVideoHD(objectId);
        mediaUrl = hdUrl || '';
      }

      if (!mediaUrl) {
        mediaUrl =
          item.data.media_info?.stream_url_hd ||
          item.data.media_info?.stream_url ||
          '';
      }

      if (mediaUrl) {
        urlData[`${afterName}.${getSuffixName(mediaUrl)}`] = mediaUrl;
      }
    } else {
      const imgUrl = item.data.mw2000?.url || '';

      if (imgUrl) {
        if (!isImageHD || getSuffixName(imgUrl) === 'gif') {
          urlData[`${afterName}.${getSuffixName(imgUrl)}`] = imgUrl;
        } else {
          const pid = extractPidFromUrl(imgUrl);
          if (pid) {
            urlData[`${afterName}.${getSuffixName(imgUrl)}`] = `${API_ENDPOINTS.DOWNLOAD_IMAGE}?pid=${pid}`;
          }
        }
      }

      if (item.data.type === 'livephoto' && item.data.video) {
        urlData[`${afterName}.${getSuffixName(item.data.video)}`] = item.data.video;
      }
    }
  }
}

export function extractWeiboId(card: Element): string | null {
  const links = card.querySelectorAll('a');
  for (const link of links) {
    const href = link.getAttribute('href') || '';
    const match = href.match(/\/(\d+)\/(\w+)/);
    if (match) {
      return match[2];
    }
  }
  return null;
}

export function getFileName(resource: WeiboResource): string {
  const { userName, time } = resource;
  return `${userName} ${time}`.trim();
}

export function buildDownloadFileName(
  resource: WeiboResource,
  ext: string,
  index: number,
  total: number
): string {
  const { userID, text } = resource;
  const rawText = text || '';
  const textPreview = rawText.length === 0
    ? LIMITS.FILE_NAME_EMPTY_TEXT
    : rawText.length > LIMITS.FILE_NAME_PREVIEW_LENGTH
      ? rawText.slice(0, LIMITS.FILE_NAME_PREVIEW_LENGTH) + LIMITS.FILE_NAME_ELLIPSIS
      : rawText;

  const base = `[${userID}]${textPreview}`;
  return total === 1 ? `${base}.${ext}` : `${base}-${index}.${ext}`;
}