import { requestWithProgress } from '@/utils/request';
import { TIMEOUTS } from '@/config';

export interface FileBlobResult {
  blob: Blob;
  fileName: string;
  finalUrl: string;
}

export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export async function downloadFileBlob(
  url: string,
  fileName: string,
  onProgress?: (progress: DownloadProgress) => void,
  retryLimit: number = TIMEOUTS.DOWNLOAD_RETRY_LIMIT
): Promise<FileBlobResult | null> {
  for (let attempt = 0; attempt < retryLimit; attempt++) {
    try {
      const res = await requestWithProgress<ArrayBuffer>(
        {
          url,
          responseType: 'arraybuffer',
          headers: {
            referer: 'https://weibo.com/',
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
          },
        },
        (gmProgress) => {
          if (gmProgress.lengthComputable) {
            onProgress?.({
              loaded: gmProgress.loaded,
              total: gmProgress.totalSize,
              percentage: gmProgress.totalSize > 0
                ? (gmProgress.loaded / gmProgress.totalSize) * 100
                : 0,
            });
          }
        }
      );

      const buffer = res.response;
      if (buffer.byteLength <= 200) {
        return null;
      }

      const blob = new Blob([buffer]);
      return { blob, fileName, finalUrl: res.finalUrl };
    } catch {
      if (attempt >= retryLimit - 1) {
        return null;
      }
    }
  }
  return null;
}

export function getExtFromUrl(url: string): string {
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

export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), TIMEOUTS.BLOB_URL_REVOKE_DELAY);
}