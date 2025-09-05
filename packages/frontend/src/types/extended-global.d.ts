// 全局类型声明
declare global {
  interface Window {
    matchMedia: (query: string) => MediaQueryList;
    crypto: Crypto;
    indexedDB: IDBFactory;
    localStorage: Storage;
    sessionStorage: Storage;
  }

  interface Performance {
    now(): number;
  }

  interface MediaQueryList {
    matches: boolean;
    media: string;
    onchange: ((this: MediaQueryList, event_: MediaQueryListEvent) => any) | null;
    addListener: (listener: (this: MediaQueryList, event_: MediaQueryListEvent) => any) => void;
    removeListener: (listener: (this: MediaQueryList, event_: MediaQueryListEvent) => any) => void;
    addEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) => void;
    removeEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ) => void;
    dispatchEvent: (event: Event) => boolean;
  }

  interface Crypto {
    getRandomValues: <T extends ArrayBufferView | null>(array: T) => T;
    subtle: SubtleCrypto;
  }

  interface SubtleCrypto {
    encrypt: (algorithm: any, key: any, data: any) => Promise<any>;
    decrypt: (algorithm: any, key: any, data: any) => Promise<any>;
    generateKey: (algorithm: any, extractable: boolean, keyUsages: string[]) => Promise<any>;
    importKey: (
      format: string,
      keyData: any,
      algorithm: any,
      extractable: boolean,
      keyUsages: string[]
    ) => Promise<any>;
    exportKey: (format: string, key: any) => Promise<any>;
    digest: (algorithm: any, data: any) => Promise<any>;
    deriveKey: (
      algorithm: any,
      baseKey: any,
      derivedKeyAlgorithm: any,
      extractable: boolean,
      keyUsages: string[]
    ) => Promise<any>;
  }

  interface IDBFactory {
    open: (name: string, version?: number) => IDBOpenDBRequest;
    deleteDatabase: (name: string) => IDBOpenDBRequest;
    databases: () => Promise<IDBDatabaseInfo[]>;
  }

  interface IDBOpenDBRequest extends IDBRequest {
    onupgradeneeded: ((this: IDBOpenDBRequest, event_: IDBVersionChangeEvent) => any) | null;
  }

  interface IDBRequest<T = any> extends EventTarget {
    result: T;
    error: DOMException;
    readyState: IDBRequestReadyState;
    onsuccess: ((this: IDBRequest, event_: Event) => any) | null;
    onerror: ((this: IDBRequest, event_: Event) => any) | null;
  }

  interface IDBDatabaseInfo {
    name: string;
    version: number;
  }

  interface IDBVersionChangeEvent extends Event {
    oldVersion: number;
    newVersion: number | null;
  }

  type IDBRequestReadyState = 'pending' | 'done';
}

// 扩展 NodeJS 全局类型
declare namespace NodeJS {
  interface ProcessEnvironment {
    NODE_ENV?: 'development' | 'production' | 'test';
    VITE_SUI_NETWORK?: string;
    VITE_SUI_RPC_URL?: string;
    VITE_WALRUS_RPC_URL?: string;
    VITE_ENABLE_ZKLOGIN?: string;
    VITE_ENABLE_LOCAL_MODE?: string;
    [key: string]: string | undefined;
  }
}

export {};
