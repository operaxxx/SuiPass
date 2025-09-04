// 加密安全工具
// packages/frontend/src/utils/security.ts

import * as argon2 from 'argon2-browser';
import { securityConfig } from '@/config/security';

/**
 * 安全加密工具类
 * 提供安全的加密、解密、密钥派生等功能
 */
export class SecurityUtils {
  private static readonly ALGORITHM = 'AES-256-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly TAG_LENGTH = 16;
  private static readonly SALT_LENGTH = 16;

  /**
   * 派生加密密钥
   * 使用Argon2id算法进行密钥派生
   */
  static async deriveKey(
    password: string,
    salt?: Uint8Array
  ): Promise<{ key: CryptoKey; salt: Uint8Array }> {
    try {
      // 生成盐值（如果未提供）
      const keySalt = salt || crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));

      // 使用Argon2id派生密钥
      const derivedKey = await argon2.hash({
        pass: password,
        salt: Array.from(keySalt),
        type: 2, // Argon2id
        mem: securityConfig.encryption.keyDerivation.memory,
        time: securityConfig.encryption.keyDerivation.iterations,
        parallelism: securityConfig.encryption.keyDerivation.parallelism,
        hashLen: this.KEY_LENGTH / 8,
      });

      // 将派生密钥导入为CryptoKey
      const rawKey = new Uint8Array(derivedKey.hashBytes);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        rawKey,
        { name: 'AES-GCM', length: this.KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
      );

      return { key: cryptoKey, salt: keySalt };
    } catch (error) {
      console.error('Key derivation failed:', error);
      throw new Error('Failed to derive encryption key');
    }
  }

  /**
   * 加密数据
   */
  static async encrypt(
    data: Uint8Array,
    password: string,
    context?: string
  ): Promise<EncryptedData> {
    try {
      // 派生密钥
      const { key, salt } = await this.deriveKey(password);

      // 生成IV
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      // 如果有上下文，派生上下文特定的密钥
      let encryptionKey = key;
      if (context) {
        encryptionKey = await this.deriveContextKey(key, context);
      }

      // 加密数据
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
          tagLength: this.TAG_LENGTH * 8,
        },
        encryptionKey,
        data
      );

      // 提取密文和认证标签
      const encryptedArray = new Uint8Array(encryptedData);
      const ciphertext = encryptedArray.slice(0, -this.TAG_LENGTH);
      const tag = encryptedArray.slice(-this.TAG_LENGTH);

      // 生成密钥ID
      const keyId = await this.generateKeyId(encryptionKey);

      // 安全清除内存中的敏感数据
      await this.clearSensitiveData(encryptedArray);

      return {
        algorithm: this.ALGORITHM,
        ciphertext: Array.from(ciphertext),
        iv: Array.from(iv),
        tag: Array.from(tag),
        salt: Array.from(salt),
        keyId,
        context,
        version: 1,
        createdAt: Date.now(),
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * 解密数据
   */
  static async decrypt(encryptedData: EncryptedData, password: string): Promise<Uint8Array> {
    try {
      // 验证加密数据结构
      if (!this.validateEncryptedData(encryptedData)) {
        throw new Error('Invalid encrypted data format');
      }

      // 派生密钥
      const { key } = await this.deriveKey(password, new Uint8Array(encryptedData.salt));

      // 如果有上下文，派生上下文特定的密钥
      let decryptionKey = key;
      if (encryptedData.context) {
        decryptionKey = await this.deriveContextKey(key, encryptedData.context);
      }

      // 验证密钥ID
      const currentKeyId = await this.generateKeyId(decryptionKey);
      if (currentKeyId !== encryptedData.keyId) {
        throw new Error('Invalid encryption key');
      }

      // 准备加密数据
      const ciphertext = new Uint8Array(encryptedData.ciphertext);
      const iv = new Uint8Array(encryptedData.iv);
      const tag = new Uint8Array(encryptedData.tag);

      // 合并密文和标签
      const encryptedWithTag = new Uint8Array(ciphertext.length + tag.length);
      encryptedWithTag.set(ciphertext);
      encryptedWithTag.set(tag, ciphertext.length);

      // 解密
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
          tagLength: this.TAG_LENGTH * 8,
        },
        decryptionKey,
        encryptedWithTag
      );

      // 安全清除内存中的敏感数据
      await this.clearSensitiveData(encryptedWithTag);

      return new Uint8Array(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * 派生上下文特定的密钥
   */
  private static async deriveContextKey(baseKey: CryptoKey, context: string): Promise<CryptoKey> {
    try {
      const salt = new TextEncoder().encode(context);
      const info = new TextEncoder().encode('context-key-derivation');

      return await crypto.subtle.deriveKey(
        {
          name: 'HKDF',
          salt,
          info,
          hash: 'SHA-256',
        },
        baseKey,
        { name: 'AES-GCM', length: this.KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Context key derivation failed:', error);
      throw new Error('Failed to derive context key');
    }
  }

  /**
   * 生成密钥ID
   */
  private static async generateKeyId(key: CryptoKey): Promise<string> {
    try {
      const rawKey = await crypto.subtle.exportKey('raw', key);
      const hashBuffer = await crypto.subtle.digest('SHA-256', rawKey);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Failed to generate key ID:', error);
      throw new Error('Failed to generate key ID');
    }
  }

  /**
   * 验证加密数据结构
   */
  private static validateEncryptedData(data: EncryptedData): boolean {
    return (
      data &&
      data.algorithm === this.ALGORITHM &&
      Array.isArray(data.ciphertext) &&
      Array.isArray(data.iv) &&
      Array.isArray(data.tag) &&
      Array.isArray(data.salt) &&
      typeof data.keyId === 'string' &&
      data.ciphertext.length > 0 &&
      data.iv.length === this.IV_LENGTH &&
      data.tag.length === this.TAG_LENGTH &&
      data.salt.length === this.SALT_LENGTH
    );
  }

  /**
   * 安全清除内存中的敏感数据
   */
  static async clearSensitiveData(...data: Uint8Array[]): Promise<void> {
    try {
      for (const array of data) {
        if (array && array.length > 0) {
          // 用随机数据覆盖内存
          crypto.getRandomValues(array);
        }
      }
    } catch (error) {
      console.warn('Failed to clear sensitive data:', error);
    }
  }

  /**
   * 生成安全的随机密码
   */
  static generateSecurePassword(length: number = 16, options: SecurePasswordOptions = {}): string {
    const {
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = true,
      excludeAmbiguous = true,
      requireEachType = true,
    } = options;

    let charset = '';

    if (includeLowercase) {
      charset += excludeSimilar ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    }
    if (includeUppercase) {
      charset += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if (includeNumbers) {
      charset += excludeSimilar ? '23456789' : '0123456789';
    }
    if (includeSymbols) {
      charset += excludeAmbiguous ? '!@#$%^&*()_+-=[]{}|' : '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }

    if (charset.length === 0) {
      throw new Error('No character types selected');
    }

    let password: string[];
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      const cryptoArray = new Uint8Array(length);
      crypto.getRandomValues(cryptoArray);

      password = [];
      for (let i = 0; i < length; i++) {
        password.push(charset[cryptoArray[i] % charset.length]);
      }

      attempts++;

      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate password meeting requirements');
      }
    } while (requireEachType && !this.meetsComplexityRequirements(password, options));

    return password.join('');
  }

  /**
   * 检查密码是否满足复杂度要求
   */
  private static meetsComplexityRequirements(
    password: string[],
    options: SecurePasswordOptions
  ): boolean {
    const passwordStr = password.join('');

    if (options.includeLowercase && !/[a-z]/.test(passwordStr)) {
      return false;
    }
    if (options.includeUppercase && !/[A-Z]/.test(passwordStr)) {
      return false;
    }
    if (options.includeNumbers && !/[0-9]/.test(passwordStr)) {
      return false;
    }
    if (options.includeSymbols && !/[^A-Za-z0-9]/.test(passwordStr)) {
      return false;
    }

    return true;
  }

  /**
   * 计算密码熵
   */
  static calculatePasswordEntropy(password: string): number {
    let charsetSize = 0;

    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;

    return password.length * Math.log2(charsetSize);
  }

  /**
   * 估算密码破解时间
   */
  static estimateCrackTime(password: string): string {
    const entropy = this.calculatePasswordEntropy(password);
    const combinations = Math.pow(2, entropy);
    const guessesPerSecond = 1000000000; // 10亿次/秒

    const secondsToCrack = combinations / (2 * guessesPerSecond);

    if (secondsToCrack < 60) {
      return `${Math.round(secondsToCrack)}秒`;
    } else if (secondsToCrack < 3600) {
      return `${Math.round(secondsToCrack / 60)}分钟`;
    } else if (secondsToCrack < 86400) {
      return `${Math.round(secondsToCrack / 3600)}小时`;
    } else if (secondsToCrack < 31536000) {
      return `${Math.round(secondsToCrack / 86400)}天`;
    } else if (secondsToCrack < 31536000000) {
      return `${Math.round(secondsToCrack / 31536000)}年`;
    } else {
      return '数千年';
    }
  }

  /**
   * 验证密码强度
   */
  static validatePasswordStrength(password: string): PasswordStrengthResult {
    const entropy = this.calculatePasswordEntropy(password);
    const crackTime = this.estimateCrackTime(password);

    let score = 0;
    const feedback: string[] = [];

    // 长度评分
    if (password.length >= 12) score += 30;
    else if (password.length >= 8) score += 15;
    else feedback.push('密码长度至少8个字符');

    // 复杂度评分
    if (/[a-z]/.test(password)) score += 10;
    else feedback.push('添加小写字母');

    if (/[A-Z]/.test(password)) score += 10;
    else feedback.push('添加大写字母');

    if (/[0-9]/.test(password)) score += 10;
    else feedback.push('添加数字');

    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    else feedback.push('添加特殊字符');

    // 唯一字符评分
    const uniqueChars = new Set(password).size;
    const uniquenessRatio = uniqueChars / password.length;
    score += Math.min(uniquenessRatio * 25, 25);

    // 惩罚重复字符
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      feedback.push('避免重复字符');
    }

    // 惩罚常见密码
    const commonPasswords = [
      'password',
      '123456',
      '12345678',
      'qwerty',
      'abc123',
      'password1',
      'admin',
      'welcome',
      'letmein',
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      score -= 20;
      feedback.push('避免使用常见密码');
    }

    // 熵值评分
    if (entropy >= 80) score += 20;
    else if (entropy >= 60) score += 10;
    else feedback.push('增加密码复杂度');

    score = Math.max(0, Math.min(100, score));

    let strength: PasswordStrengthLevel;
    if (score >= 80) strength = 'very-strong';
    else if (score >= 60) strength = 'strong';
    else if (score >= 40) strength = 'medium';
    else strength = 'weak';

    return {
      score,
      strength,
      entropy,
      crackTime,
      feedback: feedback.length > 0 ? feedback : ['密码强度良好'],
    };
  }

  /**
   * 生成安全的会话令牌
   */
  static generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 验证会话令牌
   */
  static validateSessionToken(token: string): boolean {
    return /^[a-f0-9]{64}$/.test(token);
  }

  /**
   * 安全的Base64编码
   */
  static secureBase64Encode(data: Uint8Array): string {
    return btoa(String.fromCharCode(...data))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * 安全的Base64解码
   */
  static secureBase64Decode(encoded: string): Uint8Array {
    try {
      // 添加填充
      const padding = '='.repeat((4 - (encoded.length % 4)) % 4);
      const base64 = encoded + padding;

      // 转换为标准Base64
      const standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');

      // 解码
      const binaryString = atob(standardBase64);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return bytes;
    } catch (error) {
      throw new Error('Invalid Base64 encoding');
    }
  }
}

// 类型定义
export interface EncryptedData {
  algorithm: string;
  ciphertext: number[];
  iv: number[];
  tag: number[];
  salt: number[];
  keyId: string;
  context?: string;
  version: number;
  createdAt: number;
}

export interface SecurePasswordOptions {
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeSimilar?: boolean;
  excludeAmbiguous?: boolean;
  requireEachType?: boolean;
}

export interface PasswordStrengthResult {
  score: number;
  strength: PasswordStrengthLevel;
  entropy: number;
  crackTime: string;
  feedback: string[];
}

export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong' | 'very-strong';
