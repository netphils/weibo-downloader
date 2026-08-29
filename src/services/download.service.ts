import { REQUEST_HEADERS, TIMEOUTS } from '@/config';

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
      const res = await requestStream(url, onProgress);

      if (res.blob.size <= 200 && res.blob.type === 'text/html; charset=utf-8') {
        return null;
      }

      return { blob: res.blob, fileName, finalUrl: res.finalUrl };
    } catch {
      if (attempt >= retryLimit - 1) {
        return null;
      }
    }
  }
  return null;
}

interface StreamResult {
  blob: Blob;
  finalUrl: string;
}

function requestStream(
  url: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<StreamResult> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    let totalLoaded = 0;

    GM.xmlHttpRequest({
      url,
      method: 'GET',
      responseType: 'stream',
      headers: {
        ...REQUEST_HEADERS,
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
      onloadstart: async (res) => {
        const stream = res.response;
        const reader = stream.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            totalLoaded += value.length;

            onProgress?.({
              loaded: totalLoaded,
              total: 0,
              percentage: 0,
            });
          }

          const contentType = parseContentType(res.responseHeaders);
          const blob = new Blob(chunks, { type: contentType });
          resolve({ blob, finalUrl: res.finalUrl });
        } catch (err) {
          reject(err);
        }
      },
      onerror: (err) => {
        reject(err);
      },
    });
  });
}

function parseContentType(headers: string): string {
  const match = headers.match(/content-type:\s*([^\s;]+)/i);
  return match ? match[1] : 'application/octet-stream';
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