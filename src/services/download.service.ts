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
      const res = await requestWithProgress<Blob>(
        {
          url,
          responseType: 'blob',
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

      const blob = res.response;
      if (blob.size <= 200 && blob.type === 'text/html; charset=utf-8') {
        return null;
      }

      return { blob, fileName, finalUrl: res.finalUrl };
    } catch {
      if (attempt >= retryLimit - 1) {
        return null;
      }
    }
  }
  return null;
}

export async function packFilesToZip(
  files: FileBlobResult[]
): Promise<Blob> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.fileName, file.blob);
  }
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  return zipBlob;
}

export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}