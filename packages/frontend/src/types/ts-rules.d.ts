// TypeScript 开发规范
// packages/frontend/src/types/ts-rules.d.ts

// ============================================================================
// 基础类型定义规范
// ============================================================================

/**
 * 基础响应类型
 * @template T - 响应数据类型
 */
export interface ApiResponse<T = unknown> {
  /** 响应是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 错误信息 */
  error?: AppError;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 分页响应类型
 * @template T - 数据项类型
 */
export interface PaginatedResponse<T> {
  /** 数据项列表 */
  items: T[];
  /** 总数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  per_page: number;
  /** 是否有下一页 */
  has_next: boolean;
  /** 是否有上一页 */
  has_prev: boolean;
}

/**
 * 应用错误类型
 */
export interface AppError {
  /** 错误代码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 错误详情 */
  details?: Record<string, unknown>;
  /** 时间戳 */
  timestamp: number;
  /** 堆栈跟踪 */
  stack?: string;
}

// ============================================================================
// 工具类型定义
// ============================================================================

/**
 * 将所有属性变为可选
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 将所有属性变为必选
 */
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 提取Promise的返回类型
 */
export type PromiseType<T> = T extends Promise<infer U> ? U : T;

/**
 * 排除null和undefined
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * 函数参数类型
 */
export type Parameters<T extends (...arguments_: any[]) => any> = T extends (
  ...arguments_: infer P
) => any
  ? P
  : never;

/**
 * 函数返回类型
 */
export type ReturnType<T extends (...arguments_: any[]) => any> = T extends (
  ...arguments_: any[]
) => infer R
  ? R
  : any;

// ============================================================================
// 加密相关类型
// ============================================================================

/**
 * 加密结果接口
 */
export interface EncryptionResult {
  /** 加密算法 */
  algorithm: 'AES-256-GCM';
  /** 密文数据 */
  ciphertext: Uint8Array;
  /** 初始化向量 */
  iv: Uint8Array;
  /** 认证标签 */
  tag: Uint8Array;
  /** 盐值 */
  salt: Uint8Array;
}

/**
 * 解密结果接口
 */
export interface DecryptionResult {
  /** 明文数据 */
  plaintext: Uint8Array;
  /** 验证是否通过 */
  verified: boolean;
}

// ============================================================================
// 区块链相关类型
// ============================================================================

/**
 * 钱包信息
 */
export interface WalletInfo {
  /** 钱包地址 */
  address: string;
  /** 钱包名称 */
  name: string;
  /** 连接状态 */
  isConnected: boolean;
  /** 网络信息 */
  network: NetworkInfo;
}

// ============================================================================
// 存储相关类型
// ============================================================================

/**
 * 缓存条目
 * @template T - 缓存数据类型
 */
export interface CacheEntry<T = unknown> {
  /** 缓存键 */
  key: string;
  /** 缓存值 */
  value: T;
  /** 时间戳 */
  timestamp: number;
  /** 生存时间（毫秒） */
  ttl: number;
}

/**
 * 存储配额信息
 */
export interface StorageQuota {
  /** 已使用空间 */
  used: number;
  /** 总空间 */
  total: number;
  /** 可用空间 */
  available: number;
  /** 使用百分比 */
  percentage: number;
}

/**
 * 同步状态
 */
export interface SyncStatus {
  /** 最后同步时间 */
  lastSync: number | null;
  /** 是否正在同步 */
  isSyncing: boolean;
  /** 是否有冲突 */
  hasConflict: boolean;
  /** 待上传数量 */
  pendingUploads: number;
  /** 待下载数量 */
  pendingDownloads: number;
}

// ============================================================================
// 审计日志类型
// ============================================================================

/**
 * 审计事件
 */
export interface AuditEvent {
  /** 事件ID */
  id: string;
  /** 操作类型 */
  action: string;
  /** 资源类型 */
  resource: string;
  /** 资源ID */
  resourceId: string;
  /** 用户ID */
  userId: string;
  /** 时间戳 */
  timestamp: number;
  /** IP地址 */
  ipAddress?: string;
  /** 用户代理 */
  userAgent?: string;
  /** 详细信息 */
  details: Record<string, unknown>;
}

// ============================================================================
// 组件Props类型
// ============================================================================

/**
 * 基础组件Props
 */
export interface BaseComponentProperties {
  /** 组件ID */
  id?: string;
  /** 自定义类名 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * 加载状态Props
 */
export interface LoadingProperties extends BaseComponentProperties {
  /** 是否显示加载状态 */
  isLoading?: boolean;
  /** 加载文本 */
  loadingText?: string;
  /** 加载时显示的内容 */
  loadingComponent?: React.ReactNode;
}

/**
 * 错误状态Props
 */
export interface ErrorProperties extends BaseComponentProperties {
  /** 错误信息 */
  error?: string | Error;
  /** 重试函数 */
  onRetry?: () => void;
  /** 错误时显示的内容 */
  errorComponent?: React.ReactNode;
}

// ============================================================================
// Hook返回类型
// ============================================================================

/**
 * 异步状态
 * @template T - 数据类型
 * @template E - 错误类型
 */
export interface AsyncState<T, E = Error> {
  /** 数据 */
  data: T | null;
  /** 错误 */
  error: E | null;
  /** 加载状态 */
  isLoading: boolean;
  /** 是否成功 */
  isSuccess: boolean;
  /** 是否失败 */
  isError: boolean;
}

/**
 * 分页Hook返回类型
 * @template T - 数据项类型
 */
export interface PaginationResult<T> {
  /** 当前页数据 */
  data: T[];
  /** 分页信息 */
  pagination: {
    /** 当前页 */
    page: number;
    /** 每页数量 */
    pageSize: number;
    /** 总数 */
    total: number;
    /** 总页数 */
    totalPages: number;
  };
  /** 操作函数 */
  actions: {
    /** 跳转到指定页 */
    goToPage: (page: number) => void;
    /** 下一页 */
    nextPage: () => void;
    /** 上一页 */
    prevPage: () => void;
    /** 设置每页数量 */
    setPageSize: (size: number) => void;
  };
}

// ============================================================================
// 事件处理类型
// ============================================================================

/**
 * 通用事件处理器
 * @template T - 事件类型
 */
export type EventHandler<T = Event> = (event: T) => void;

/**
 * 异步事件处理器
 * @template T - 事件类型
 */
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

/**
 * 变更事件处理器
 * @template T - 值类型
 */
export type ChangeHandler<T = unknown> = (value: T) => void;

/**
 * 异步变更事件处理器
 * @template T - 值类型
 */
export type AsyncChangeHandler<T = unknown> = (value: T) => Promise<void>;

// ============================================================================
// 表单相关类型
// ============================================================================

/**
 * 表单字段
 * @template T - 字段值类型
 */
export interface FormField<T = unknown> {
  /** 字段名 */
  name: string;
  /** 字段值 */
  value: T;
  /** 是否必填 */
  required?: boolean;
  /** 验证规则 */
  validation?: ValidationRule<T>[];
  /** 错误信息 */
  error?: string;
  /** 是否被触摸过 */
  touched?: boolean;
}

/**
 * 验证规则
 * @template T - 值类型
 */
export interface ValidationRule<T> {
  /** 验证函数 */
  validate: (value: T) => boolean | Promise<boolean>;
  /** 错误消息 */
  message: string;
}

/**
 * 表单状态
 * @template T - 表单数据类型
 */
export interface FormState<T extends Record<string, unknown>> {
  /** 表单数据 */
  values: T;
  /** 表单字段 */
  fields: {
    [K in keyof T]: FormField<T[K]>;
  };
  /** 是否有效 */
  isValid: boolean;
  /** 是否提交中 */
  isSubmitting: boolean;
  /** 表单错误 */
  errors: Record<string, string>;
}

// ============================================================================
// 安全相关类型
// ============================================================================

/**
 * 安全配置
 */
export interface SecurityConfig {
  /** 是否启用内容安全策略 */
  enableCSP: boolean;
  /** 是否启用严格传输安全 */
  enableHSTS: boolean;
  /** 是否启用XSS保护 */
  enableXSSProtection: boolean;
  /** 是否启用内容类型嗅探保护 */
  enableContentTypeNosniff: boolean;
  /** 是否启用框架选项 */
  enableXFrameOptions: boolean;
  /** CSP配置 */
  cspConfig?: CSPConfig;
}

/**
 * CSP配置
 */
export interface CSPConfig {
  /** 默认源 */
  'default-src': string[];
  /** 脚本源 */
  'script-src': string[];
  /** 样式源 */
  'style-src': string[];
  /** 图片源 */
  'img-src': string[];
  /** 连接源 */
  'connect-src': string[];
  /** 字体源 */
  'font-src': string[];
  /** 对象源 */
  'object-src': string[];
  /** 媒体源 */
  'media-src': string[];
  /** 框架源 */
  'frame-src': string[];
  /** 沙箱 */
  sandbox?: string[];
}

// ============================================================================
// 主题相关类型
// ============================================================================

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题模式 */
  mode: ThemeMode;
  /** 主色调 */
  primaryColor: string;
  /** 次要色调 */
  secondaryColor: string;
  /** 背景色 */
  backgroundColor: string;
  /** 前景色 */
  foregroundColor: string;
  /** 边框颜色 */
  borderColor: string;
  /** 错误颜色 */
  errorColor: string;
  /** 警告颜色 */
  warningColor: string;
  /** 成功颜色 */
  successColor: string;
}

// ============================================================================
// 本地化类型
// ============================================================================

/**
 * 语言配置
 */
export interface LocaleConfig {
  /** 语言代码 */
  code: string;
  /** 语言名称 */
  name: string;
  /** 是否从右到左 */
  rtl: boolean;
  /** 日期格式 */
  dateFormat: string;
  /** 时间格式 */
  timeFormat: string;
  /** 数字格式 */
  numberFormat: {
    /** 小数位数 */
    decimalPlaces: number;
    /** 千位分隔符 */
    thousandsSeparator: string;
    /** 小数分隔符 */
    decimalSeparator: string;
  };
}

// ============================================================================
// 工具函数类型
// ============================================================================

/**
 * 防抖函数
 * @template T - 函数类型
 */
export type DebouncedFunction<T extends (...arguments_: any[]) => any> = {
  (...arguments_: Parameters<T>): Promise<ReturnType<T>>;
  cancel: () => void;
  flush: () => Promise<ReturnType<T>>;
};

/**
 * 节流函数
 * @template T - 函数类型
 */
export type ThrottledFunction<T extends (...arguments_: any[]) => any> = {
  (...arguments_: Parameters<T>): ReturnType<T>;
  cancel: () => void;
};

/**
 * 记忆化函数
 * @template T - 函数类型
 */
export type MemoizedFunction<T extends (...arguments_: any[]) => any> = {
  (...arguments_: Parameters<T>): ReturnType<T>;
  clear: () => void;
};
