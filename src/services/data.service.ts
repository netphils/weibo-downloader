import type { WeiboResource, ResourceUrlData } from '@/types';
import type { PicInfo, MixMediaInfo } from '@/types';
import { getInfoById, getVideoHD } from './weibo-api.service';
import { API_ENDPOINTS } from '@/config';

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
  mblogVipType: number,
  isImageHD: boolean
): string {
  const mw2000Url = picInfo.mw2000?.url || '';

  if (mblogVipType === 1 || !isImageHD || getSuffixName(mw2000Url) === 'gif') {
    return mw2000Url;
  }

  return `${API_ENDPOINTS.DOWNLOAD_IMAGE}?pid=${picInfo.pid}`;
}

function extractPidFromUrl(url: string): string | null {
  const match = url.match(/([\w]+)(?=\.\w+$)/);
  return match ? match[1] : null;
}

export async function getFileUrlByInfo(
  dom: Element,
  isImageHD: boolean,
  isVideoHD: boolean
): Promise<WeiboResource | null> {
  const linkEl = dom.querySelector('a');
  const href = linkEl?.getAttribute('href') || '';
  const idMatch = href.match(/(?<=\d+\/)(\w+)/);
  const id = idMatch ? idMatch[0] : '';

  if (!id) {
    return null;
  }

  const statusResponse = await getInfoById(id);
  if (!statusResponse) {
    return null;
  }

  const {
    pic_infos: picInfos,
    mix_media_info: mixMediaInfo,
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

      const url = getPicUrlFromInfo(picInfo, mblogVipType, isImageHD);
      urlData[`${afterName}.${getSuffixName(picInfo.mw2000?.url || '')}`] = url;

      if (picInfo.type === 'livephoto' && picInfo.video) {
        urlData[`${afterName}.${getSuffixName(picInfo.video)}`] = picInfo.video;
      }
    });
  }

  if (mixMediaInfo) {
    processMixMedia(mixMediaInfo, urlData, isImageHD, isVideoHD);
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