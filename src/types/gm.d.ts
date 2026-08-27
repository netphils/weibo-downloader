declare namespace GM {
  interface RequestDetails {
    url: string;
    method?: 'GET' | 'POST' | 'HEAD';
    headers?: Record<string, string>;
    data?: string | FormData;
    responseType?: 'json' | 'blob' | 'arraybuffer' | 'text' | 'document';
    timeout?: number;
    onload?: (response: GM.Response) => void;
    onerror?: (error: GM.Response) => void;
    onprogress?: (progress: GM.Progress) => void;
    ontimeout?: () => void;
    onreadystatechange?: (response: GM.Response) => void;
  }

  interface Progress {
    done: number;
    lengthComputable: boolean;
    loaded: number;
    position: number;
    total: number;
    totalSize: number;
  }

  interface Response {
    readyState: number;
    response: unknown;
    responseHeaders: string;
    responseText: string;
    responseXML: Document | null;
    status: number;
    statusText: string;
    finalUrl: string;
  }

  function xmlHttpRequest(
    details: RequestDetails
  ): { abort: () => void };

  function getValue<T>(name: string, defaultValue?: T): Promise<T>;
  function setValue(name: string, value: unknown): Promise<void>;

  function addStyle(css: string): void;

  function registerMenuCommand(
    caption: string,
    callback: () => void,
    accessKey?: string
  ): number;

  function unregisterMenuCommand(id: number): void;
}

declare function GM_addStyle(css: string): void;
declare function GM_setValue(name: string, value: unknown): void;
declare function GM_getValue<T>(name: string, defaultValue?: T): T;
declare function GM_registerMenuCommand(
  caption: string,
  callback: () => void,
  accessKey?: string
): number;
declare function GM_unregisterMenuCommand(id: number): void;