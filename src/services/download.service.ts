export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function downloadFileDirect(
  url: string,
  fileName: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    GM_download({
      url,
      name: fileName,
      headers: {
        referer: 'https://weibo.com/',
      },
      onload: () => {
        resolve();
      },
      onerror: (err) => {
        reject(err);
      },
      onprogress: (progress) => {
        if (progress.lengthComputable) {
          onProgress?.({
            loaded: progress.loaded,
            total: progress.totalSize,
            percentage: progress.totalSize > 0
              ? (progress.loaded / progress.totalSize) * 100
              : 0,
          });
        }
      },
    });
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