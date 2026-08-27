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

interface JSZipFile {
  name: string;
  dir: boolean;
  date: Date;
  comment: string;
  unixPermissions: number | null;
  dosPermissions: number | null;
  options: JSZipObjectOptions;
  async<T extends JSZip.OutputType>(type: T): Promise<JSZip.OutputByType[T]>;
  nodeStream(type?: 'nodebuffer'): NodeJS.ReadableStream;
}

interface JSZipObjectOptions {
  compression: string;
  compressionOptions: null;
}

declare namespace JSZip {
  type OutputType = 'base64' | 'string' | 'text' | 'binarystring' | 'array' | 'uint8array' | 'arraybuffer' | 'blob' | 'nodebuffer';

  interface OutputByType {
    base64: string;
    string: string;
    text: string;
    binarystring: string;
    array: number[];
    uint8array: Uint8Array;
    arraybuffer: ArrayBuffer;
    blob: Blob;
    nodebuffer: Buffer;
  }

  interface JSZipGeneratorOptions<T extends OutputType> {
    type: T;
    compression?: string;
    compressionOptions?: {
      level: number;
    } | null;
    comment?: string;
    mimeType?: string;
    platform?: string;
    encodeFileName?: (name: string) => string;
    streamFiles?: boolean;
  }

  interface JSZipLoadOptions {
    base64?: boolean;
    checkCRC32?: boolean;
    optimizedBinaryString?: boolean;
    createFolders?: boolean;
    decodeFileName?: (bytes: string) => string;
  }
}

declare class JSZip {
  constructor();
  file(name: string, data: string | Blob | ArrayBuffer | Uint8Array | number[]): this;
  folder(name: string): JSZip;
  file(name: string): JSZipFile | null;
  filter(predicate: (relativePath: string, file: JSZipFile) => boolean): JSZipFile[];
  remove(name: string): this;
  generateAsync<T extends JSZip.OutputType>(
    options?: JSZip.JSZipGeneratorOptions<T>
  ): Promise<JSZip.OutputByType[T]>;
  loadAsync(data: unknown, options?: JSZip.JSZipLoadOptions): Promise<JSZip>;
  forEach(callback: (relativePath: string, file: JSZipFile) => void): void;
}