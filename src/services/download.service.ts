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
      const result = await xhrDownload(url, onProgress);
      if (!result) return null;

      const { blob, finalUrl } = result;
      if (blob.size <= 200 && blob.type === 'text/html; charset=utf-8') {
        return null;
      }

      return { blob, fileName, finalUrl };
    } catch {
      if (attempt >= retryLimit - 1) {
        return null;
      }
    }
  }
  return null;
}

function xhrDownload(
  url: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<{ blob: Blob; finalUrl: string } | null> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';

    xhr.onprogress = (e: ProgressEvent<EventTarget>): void => {
      if (e.lengthComputable) {
        onProgress?.({
          loaded: e.loaded,
          total: e.total,
          percentage: e.total > 0 ? (e.loaded / e.total) * 100 : 0,
        });
      }
    };

    xhr.onload = (): void => {
      const blob = xhr.response as Blob;
      resolve({ blob, finalUrl: xhr.responseURL || url });
    };

    xhr.onerror = (): void => resolve(null);
    xhr.onabort = (): void => resolve(null);
    xhr.send();
  });
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
  URL.revokeObjectURL(url);
}