// 安全开发规范
// packages/frontend/src/config/security.ts

/**
 * 安全配置
 * 包含内容安全策略、加密配置、安全头部等
 */

export const securityConfig = {
  // 内容安全策略
  csp: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://sui-testnet.rpc',
      'https://walrus-testnet.rpc',
    ],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      'https://sui-testnet.rpc',
      'https://walrus-testnet.rpc',
      'https://api.suiet.app',
      'wss://sui-testnet.rpc',
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'frame-src': ["'none'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'require-trusted-types-for': ["'script'"],
    'upgrade-insecure-requests': [],
  },

  // 安全头部
  headers: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': '', // 动态生成
  },

  // 加密配置
  encryption: {
    algorithm: 'AES-256-GCM',
    keyLength: 256,
    ivLength: 12,
    tagLength: 16,
    saltLength: 16,
    keyDerivation: {
      algorithm: 'Argon2id',
      iterations: 3,
      memory: 65536, // 64MB
      parallelism: 1,
      saltLength: 16,
    },
  },

  // 密码策略
  passwordPolicy: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventRepeatingChars: true,
    preventSequentialChars: true,
    preventCommonPasswords: true,
    maxAge: 90, // 天
    history: 5, // 保存历史密码数量
  },

  // 会话配置
  session: {
    timeout: 30 * 60 * 1000, // 30分钟
    inactivityTimeout: 15 * 60 * 1000, // 15分钟不活动
    maxConcurrentSessions: 3,
    secureCookies: true,
    sameSiteCookies: 'strict',
  },

  // 网络安全
  network: {
    allowedOrigins: [
      'https://sui-testnet.rpc',
      'https://walrus-testnet.rpc',
      'https://api.suiet.app',
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100, // 每个IP最大请求数
    },
  },

  // 输入验证
  validation: {
    maxInputLength: 10000,
    allowedHtmlTags: ['a', 'b', 'i', 'u', 'em', 'strong', 'code', 'pre', 'br', 'p'],
    sanitizeOptions: {
      ALLOWED_TAGS: ['a', 'b', 'i', 'u', 'em', 'strong', 'code', 'pre', 'br', 'p'],
      ALLOWED_ATTR: ['href', 'title', 'target'],
    },
  },

  // 文件上传安全
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'],
    virusScan: true,
    malwareCheck: true,
  },

  // 日志和监控
  logging: {
    level: 'warn',
    sensitiveDataMasking: true,
    logToConsole: false,
    logToServer: true,
    retentionPeriod: 30, // 天
  },

  // 备份和恢复
  backup: {
    autoBackup: true,
    backupInterval: 24 * 60 * 60 * 1000, // 24小时
    maxBackups: 7,
    encryptionRequired: true,
    verifyBackup: true,
  },
};

/**
 * 生成CSP头部
 */
export function generateCSPHeader(): string {
  const csp = securityConfig.csp;
  const directives = Object.entries(csp)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

  return directives;
}

/**
 * 验证输入安全性
 */
export function validateInput(input: string, context: string = 'default'): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  // 检查长度
  if (input.length > securityConfig.validation.maxInputLength) {
    return false;
  }

  // 检查潜在的XSS攻击
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<\s*\/?\s*script\s*>/gi,
    /<\s*\/?\s*iframe\s*>/gi,
    /<\s*\/?\s*object\s*>/gi,
    /<\s*\/?\s*embed\s*>/gi,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }

  // 根据上下文进行额外验证
  switch (context) {
    case 'username':
      return /^[a-zA-Z0-9_]{3,20}$/.test(input);
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    case 'password':
      return input.length >= securityConfig.passwordPolicy.minLength;
    case 'vaultName':
      return /^[a-zA-Z0-9\s\-_]{1,50}$/.test(input);
    default:
      return true;
  }
}

/**
 * 脱敏敏感数据
 */
export function maskSensitiveData(data: any, context: string = 'default'): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = {
    password: '********',
    masterPassword: '********',
    apiKey: '***REDACTED***',
    secret: '***REDACTED***',
    token: '***REDACTED***',
    privateKey: '***REDACTED***',
    mnemonic: '***REDACTED***',
  };

  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item, context));
  }

  const masked = { ...data };

  for (const [key, value] of Object.entries(masked)) {
    if (sensitiveFields.hasOwnProperty(key)) {
      masked[key] = sensitiveFields[key as keyof typeof sensitiveFields];
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value, context);
    }
  }

  return masked;
}

/**
 * 生成安全的随机值
 */
export function generateSecureRandom(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 验证密码强度
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // 长度检查
  if (password.length < securityConfig.passwordPolicy.minLength) {
    feedback.push(`密码长度至少需要${securityConfig.passwordPolicy.minLength}个字符`);
  } else {
    score += 25;
  }

  // 大写字母检查
  if (securityConfig.passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    feedback.push('密码需要包含大写字母');
  } else {
    score += 15;
  }

  // 小写字母检查
  if (securityConfig.passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    feedback.push('密码需要包含小写字母');
  } else {
    score += 15;
  }

  // 数字检查
  if (securityConfig.passwordPolicy.requireNumbers && !/[0-9]/.test(password)) {
    feedback.push('密码需要包含数字');
  } else {
    score += 15;
  }

  // 特殊字符检查
  if (securityConfig.passwordPolicy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    feedback.push('密码需要包含特殊字符');
  } else {
    score += 15;
  }

  // 重复字符检查
  if (securityConfig.passwordPolicy.preventRepeatingChars && /(.)\1{2,}/.test(password)) {
    feedback.push('密码不应包含连续重复的字符');
  } else {
    score += 5;
  }

  // 常见密码检查
  if (securityConfig.passwordPolicy.preventCommonPasswords) {
    const commonPasswords = [
      'password',
      '123456',
      '12345678',
      '123456789',
      '12345',
      'qwerty',
      'abc123',
      'password1',
      'admin',
      'welcome',
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      feedback.push('请使用更安全的密码');
      score -= 20;
    }
  }

  return {
    isValid: score >= 70 && feedback.length === 0,
    score: Math.max(0, Math.min(100, score)),
    feedback,
  };
}

/**
 * 生成CSRF令牌
 */
export function generateCSRFToken(): string {
  return generateSecureRandom(32);
}

/**
 * 验证CSRF令牌
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) {
    return false;
  }

  // 这里应该实现更复杂的验证逻辑
  // 例如，检查令牌是否在会话中存在且未过期
  return token === sessionToken;
}

/**
 * 安全的URL验证
 */
export function validateURL(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    // 检查协议
    if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
      return false;
    }

    // 检查是否为本地主机（开发环境）
    if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
      return process.env.NODE_ENV === 'development';
    }

    // 检查是否在允许的域名列表中
    const allowedOrigins = securityConfig.network.allowedOrigins;
    return allowedOrigins.some(origin => {
      try {
        const originUrl = new URL(origin);
        return parsedUrl.hostname === originUrl.hostname;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    const parsed = JSON.parse(jsonString);

    // 验证解析结果是否为安全的对象
    if (typeof parsed === 'object' && parsed !== null) {
      // 检查原型污染
      if ('__proto__' in parsed || 'constructor' in parsed) {
        return defaultValue;
      }

      return parsed as T;
    }

    return defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * 内容安全策略中间件
 */
export function applySecurityHeaders(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // 生成CSP头部
  const cspHeader = generateCSPHeader();

  // 应用安全头部（在服务器端环境中）
  // 这里只是示例，实际应用中需要在服务器端配置
  console.log('Security headers to be applied:', {
    'Content-Security-Policy': cspHeader,
    ...securityConfig.headers,
  });
}

// 初始化安全配置
export function initializeSecurity(): void {
  // 应用安全头部
  applySecurityHeaders();

  // 禁用某些不安全的功能
  if (typeof window !== 'undefined') {
    // 禁用console.log在生产环境
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {};
      console.debug = () => {};
    }

    // 禁用右键菜单（可选）
    document.addEventListener('contextmenu', e => {
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
      }
    });

    // 禁用文本选择（可选）
    document.addEventListener('selectstart', e => {
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
      }
    });
  }
}
