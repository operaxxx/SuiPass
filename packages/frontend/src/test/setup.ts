// Vitest 测试设置
// packages/frontend/src/test/setup.ts

import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// 全局测试设置
beforeEach(() => {
  // 清除所有模拟
  vi.clearAllMocks();

  // 设置测试环境
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // 模拟 Web Crypto API
  Object.defineProperty(window, 'crypto', {
    value: {
      getRandomValues: vi.fn((array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      }),
      subtle: {
        encrypt: vi.fn(),
        decrypt: vi.fn(),
        generateKey: vi.fn(),
        importKey: vi.fn(),
        exportKey: vi.fn(),
        digest: vi.fn(),
        deriveKey: vi.fn(),
      },
    },
    configurable: true,
  });

  // 模拟 IndexedDB
  Object.defineProperty(window, 'indexedDB', {
    value: {
      open: vi.fn(),
      deleteDatabase: vi.fn(),
      databases: vi.fn(),
    },
    configurable: true,
  });

  // 模拟 localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    configurable: true,
  });

  // 模拟 sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    configurable: true,
  });

  // 模拟 fetch
  global.fetch = vi.fn();

  // 模拟 URL
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // 模拟 IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // 模拟 ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // 模拟 MutationObserver
  global.MutationObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  }));

  // 模拟 scrollTo
  Element.prototype.scrollTo = vi.fn();
  window.scrollTo = vi.fn();

  // 模拟 requestAnimationFrame
  global.requestAnimationFrame = vi.fn(callback => {
    return setTimeout(callback, 0);
  });

  // 模拟 cancelAnimationFrame
  global.cancelAnimationFrame = vi.fn(id => {
    clearTimeout(id);
  });

  // 模拟 setTimeout 和 clearTimeout
  global.setTimeout = vi.fn(callback => {
    return setTimeout(callback, 0);
  });

  global.clearTimeout = vi.fn(clearTimeout);

  // 模拟 setInterval 和 clearInterval
  global.setInterval = vi.fn(callback => {
    return setInterval(callback, 0);
  });

  global.clearInterval = vi.fn(clearInterval);

  // 模拟 console 方法（减少噪音）
  global.console = {
    ...global.console,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };

  // 设置环境变量
  process.env = {
    ...process.env,
    NODE_ENV: 'test',
    VITE_SUI_NETWORK: 'testnet',
    VITE_ENABLE_LOCAL_MODE: 'true',
  };
});

afterEach(() => {
  // 清理测试环境
  cleanup();

  // 清除定时器
  vi.clearAllTimers();

  // 清理模拟调用
  vi.clearAllMocks();
});

// 全局测试工具
global.describe = describe;
global.it = it;
global.test = test;
global.expect = expect;
global.vi = vi;

// 添加自定义匹配器
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },

  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
});

// 声明自定义匹配器类型
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeWithinRange(floor: number, ceiling: number): void;
    toBeValidEmail(): void;
    toBeValidUUID(): void;
  }
}

// 导出测试工具
export * from '@testing-library/react';
export * from '@testing-library/jest-dom';
export * from 'vitest';

// 测试辅助函数
export const createMockVault = (overrides = {}) => ({
  id: 'test-vault-id',
  name: 'Test Vault',
  description: 'Test vault description',
  items: [],
  folders: [],
  settings: {
    autoLockTimeout: 30,
    enableBiometrics: false,
    enableSync: true,
    theme: 'light' as const,
    defaultPasswordLength: 16,
    requireMasterPassword: true,
    enableTwoFactor: false,
  },
  created_at: Date.now(),
  updated_at: Date.now(),
  version: 1,
  ...overrides,
});

export const createMockPassword = (overrides = {}) => ({
  id: 'test-password-id',
  type: 'login' as const,
  title: 'Test Password',
  url: 'https://example.com',
  username: 'testuser',
  password: 'testpassword',
  notes: 'Test password notes',
  favorite: false,
  tags: ['test', 'example'],
  created_at: Date.now(),
  updated_at: Date.now(),
  custom_fields: {},
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

// 异步测试工具
export const waitForAsync = async (callback: () => Promise<void> | void, timeout = 5000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();

    const check = async () => {
      try {
        await callback();
        resolve();
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(check, 100);
        }
      }
    };

    check();
  });
};

// 事件模拟工具
export const createMockEvent = (type: string, overrides = {}) => ({
  type,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  currentTarget: {
    value: '',
    checked: false,
    ...overrides,
  },
  target: {
    value: '',
    checked: false,
    ...overrides,
  },
  ...overrides,
});

// 模拟 API 响应
export const createMockResponse = <T = any>(data: T, status = 200, statusText = 'OK'): Response => {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    blob: vi.fn().mockResolvedValue(new Blob()),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: 'https://api.example.com/test',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
  };
};

// 模拟 API 错误
export const createMockError = (message: string, status = 500): Error => {
  const error = new Error(message);
  Object.assign(error, {
    status,
    response: {
      status,
      statusText: message,
      data: { message },
    },
  });
  return error;
};
