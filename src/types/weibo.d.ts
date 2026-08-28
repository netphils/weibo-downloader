export interface PicInfo {
  pid: string;
  url: string;
  width: number;
  height: number;
  type: string;
  video?: string;
  mw2000?: {
    url: string;
  };
  large?: {
    url: string;
  };
  largest?: {
    url: string;
  };
  original?: {
    url: string;
  };
}

export interface MixMediaItem {
  type: 'video' | 'pic';
  data: {
    object_id?: string;
    media_info?: {
      stream_url?: string;
      stream_url_hd?: string;
    };
    mw2000?: {
      url: string;
    };
    type?: string;
    video?: string;
  };
}

export interface MixMediaInfo {
  items: MixMediaItem[];
}

export interface PageInfo {
  object_type: string;
  media_info?: {
    stream_url?: string;
    stream_url_hd?: string;
    playback_list?: Array<{
      play_info: {
        url: string;
      };
    }>;
    replay_hd?: string;
  };
}

export interface GeoInfo {
  detail?: {
    title?: string;
  };
}

export interface WeiboUser {
  screen_name: string;
  idstr: string;
}

export interface WeiboStatusResponse {
  pic_infos?: Record<string, PicInfo>;
  mix_media_info?: MixMediaInfo;
  page_info?: PageInfo;
  retweeted_status?: WeiboStatusResponse;
  text_raw?: string;
  isLongText?: boolean;
  mblogid?: string;
  region_name?: string;
  geo?: GeoInfo;
  created_at?: string;
  mblog_vip_type?: number;
  user: WeiboUser;
}

export interface LongTextResponse {
  data: {
    longTextContent: string;
  };
}

export interface VideoHDUrl {
  [key: string]: string;
}

export interface VideoHDResponse {
  data: {
    Component_Play_Playinfo: {
      urls: VideoHDUrl;
    };
  };
}

export interface ResourceUrlData {
  [fileName: string]: string;
}

export interface WeiboResource {
  urlData: ResourceUrlData;
  time: string;
  userName: string;
  userID: string;
  regionName: string;
  geo: GeoInfo;
  text: string;
  isLongText: boolean;
  mblogid: string;
}