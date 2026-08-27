import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/config';
import type {
  WeiboStatusResponse,
  LongTextResponse,
  VideoHDResponse,
} from '@/types';

export async function getInfoById(id: string): Promise<WeiboStatusResponse | null> {
  try {
    const url = `${API_ENDPOINTS.STATUS_SHOW}?id=${id}&locale=zh-CN&isGetLongText=true`;
    const res = await request<WeiboStatusResponse>({ url });

    if (res.response.retweeted_status) {
      res.response.pic_infos = res.response.retweeted_status.pic_infos;
      res.response.mix_media_info = res.response.retweeted_status.mix_media_info;
      res.response.mblog_vip_type = res.response.retweeted_status.mblog_vip_type;
    }

    return res.response;
  } catch {
    return null;
  }
}

export async function getLongtextById(id: string): Promise<string | null> {
  try {
    const url = `${API_ENDPOINTS.LONGTEXT}?id=${id}`;
    const res = await request<LongTextResponse>({ url });
    return res.response.data.longTextContent;
  } catch {
    return null;
  }
}

export async function getVideoHD(id: string): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append(
      'data',
      `{"Component_Play_Playinfo":{"oid":"${id}"}}`
    );

    const url = `${API_ENDPOINTS.VIDEO_HD}?page=/tv/show/${id}`;
    const res = await request<VideoHDResponse>({
      url,
      method: 'POST',
      data: formData,
    });

    const urls = res.response.data.Component_Play_Playinfo.urls;
    const urlList = Object.values(urls).map((u) => 'https:' + u);

    const sorted = urlList.sort((a, b) => {
      const matchA = new URL(a).searchParams.get('template')?.match(/(\d+)x(\d+)/);
      const matchB = new URL(b).searchParams.get('template')?.match(/(\d+)x(\d+)/);
      const areaA = matchA ? Number(matchA[1]) * Number(matchA[2]) : 0;
      const areaB = matchB ? Number(matchB[1]) * Number(matchB[2]) : 0;
      return areaB - areaA;
    });

    return sorted[0] || null;
  } catch {
    return null;
  }
}