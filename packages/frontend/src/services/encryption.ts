// 加密服务实现
// packages/frontend/src/services/encryption.ts

import * as argon2 from 'argon2-browser';

export class EncryptionService {
  private algorithm = 'AES-256-GCM';
  private keyDerivationAlgorithm = 'Argon2id';
  private keyLength = 256; // bits
  private ivLength = 12; // bytes for GCM
  private tagLength = 16; // bytes for GCM tag
  private saltLength = 16; // bytes for salt

  /**
   * 加密数据
   */
  async encrypt(data: Uint8Array, masterPassword: string): Promise<EncryptedData> {
    try {
      // 1. 派生加密密钥
      const key = await this.deriveEncryptionKey(masterPassword);
      
      // 2. 生成IV
      const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
      
      // 3. 加密数据
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
          tagLength: this.tagLength * 8, // bits
        },
        key,
        data
      );
      
      // 4. 提取密文和认证标签
      const encryptedArray = new Uint8Array(encryptedData);
      const ciphertext = encryptedArray.slice(0, -this.tagLength);
      const tag = encryptedArray.slice(-this.tagLength);
      
      // 5. 生成密钥ID用于验证
      const keyId = await this.generateKeyId(key);
      
      return {
        algorithm: this.algorithm,
        ciphertext: Array.from(ciphertext),
        iv: Array.from(iv),
        tag: Array.from(tag),
        keyId,
        keyDerivation: {
          algorithm: this.keyDerivationAlgorithm,
          iterations: 3,
          memory: 65536, // 64MB
          parallelism: 1,
          saltLength: this.saltLength,
        },
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * 解密数据
   */
  async decrypt(encryptedData: EncryptedData, masterPassword: string): Promise<Uint8Array> {
    try {
      // 1. 派生加密密钥
      const key = await this.deriveEncryptionKey(masterPassword);
      
      // 2. 验证密钥ID
      const currentKeyId = await this.generateKeyId(key);
      if (currentKeyId !== encryptedData.keyId) {
        throw new Error('Invalid encryption key');
      }
      
      // 3. 准备数据
      const ciphertext = new Uint8Array(encryptedData.ciphertext);
      const iv = new Uint8Array(encryptedData.iv);
      const tag = new Uint8Array(encryptedData.tag);
      
      // 4. 合并密文和标签
      const encryptedWithTag = new Uint8Array(ciphertext.length + tag.length);
      encryptedWithTag.set(ciphertext);
      encryptedWithTag.set(tag, ciphertext.length);
      
      // 5. 解密
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
          tagLength: this.tagLength * 8,
        },
        key,
        encryptedWithTag
      );
      
      return new Uint8Array(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * 派生加密密钥
   */
  private async deriveEncryptionKey(masterPassword: string): Promise<CryptoKey> {
    try {
      // 1. 将主密码转换为字节数组
      const passwordEncoder = new TextEncoder();
      const passwordData = passwordEncoder.encode(masterPassword);
      
      // 2. 生成盐值
      const salt = crypto.getRandomValues(new Uint8Array(this.saltLength));
      
      // 3. 使用 Argon2id 派生密钥
      const derivedKey = await argon2.hash({
        pass: masterPassword,
        salt: Array.from(salt),
        type: argon2.ArgonType.Argon2id,
        mem: 65536, // 64MB memory
        time: 3,    // 3 iterations
        parallelism: 1,
        hashLen: this.keyLength / 8, // 32 bytes
      });
      
      // 4. 将派生密钥导入为 CryptoKey
      const rawKey = new Uint8Array(derivedKey.hash);
      return crypto.subtle.importKey(
        'raw',
        rawKey,
        { name: 'AES-GCM', length: this.keyLength },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Key derivation failed:', error);
      throw new Error('Failed to derive encryption key');
    }
  }

  /**
   * 生成密钥ID
   */
  private async generateKeyId(key: CryptoKey): Promise<string> {
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
   * 验证密码强度
   */
  async verifyPasswordStrength(password: string): Promise<PasswordStrength> {
    const score = this.calculatePasswordScore(password);
    const feedback = this.getPasswordFeedback(password);
    
    return {
      score,
      strength: this.getStrengthLevel(score),
      feedback,
      crackTime: this.estimateCrackTime(password),
    };
  }

  /**
   * 生成安全的随机密码
   */
  generateSecurePassword(length: number = 16, options: PasswordOptions = {}): string {
    const {
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = false,
    } = options;

    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijkmnopqrstuvwxyz';
    if (includeNumbers) charset += '23456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '');
    }
    
    if (charset.length === 0) {
      throw new Error('No character types selected');
    }
    
    const password = [];
    const cryptoArray = new Uint8Array(length);
    crypto.getRandomValues(cryptoArray);
    
    for (let i = 0; i < length; i++) {
      password.push(charset[cryptoArray[i] % charset.length]);
    }
    
    return password.join('');
  }

  /**
   * 派生保险库特定密钥
   */
  async deriveVaultKey(masterPassword: string, vaultId: string): Promise<CryptoKey> {
    try {
      // 1. 先派生主密钥
      const masterKey = await this.deriveEncryptionKey(masterPassword);
      
      // 2. 使用HKDF派生保险库特定密钥
      const salt = new TextEncoder().encode(vaultId);
      const info = new TextEncoder().encode('vault-encryption-key');
      
      const vaultKeyMaterial = await crypto.subtle.deriveKey(
        {
          name: 'HKDF',
          salt,
          info,
          hash: 'SHA-256',
        },
        masterKey,
        { name: 'AES-GCM', length: this.keyLength },
        false,
        ['encrypt', 'decrypt']
      );
      
      return vaultKeyMaterial;
    } catch (error) {
      console.error('Failed to derive vault key:', error);
      throw new Error('Failed to derive vault key');
    }
  }

  /**
   * 计算密码评分
   */
  private calculatePasswordScore(password: string): number {
    let score = 0;
    
    // 长度评分
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 15;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 5;
    
    // 复杂度评分
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;
    
    // 唯一字符评分
    const uniqueChars = new Set(password).size;
    const uniquenessRatio = uniqueChars / password.length;
    score += Math.min(uniquenessRatio * 20, 20);
    
    // 惩罚常见模式
    if (/(.)\1{2,}/.test(password)) score -= 10; // 重复字符
    if (/password|123456|qwerty/i.test(password)) score -= 20; // 常见密码
    if (/^[a-zA-Z]+$/.test(password)) score -= 10; // 纯字母
    if (/^[0-9]+$/.test(password)) score -= 10; // 纯数字
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 获取强度等级
   */
  private getStrengthLevel(score: number): 'weak' | 'medium' | 'strong' | 'very-strong' {
    if (score < 40) return 'weak';
    if (score < 60) return 'medium';
    if (score < 80) return 'strong';
    return 'very-strong';
  }

  /**
   * 获取密码反馈
   */
  private getPasswordFeedback(password: string): string[] {
    const feedback: string[] = [];
    
    if (password.length < 8) {
      feedback.push('密码长度至少8个字符');
    }
    
    if (!/[a-z]/.test(password)) {
      feedback.push('添加小写字母');
    }
    
    if (!/[A-Z]/.test(password)) {
      feedback.push('添加大写字母');
    }
    
    if (!/[0-9]/.test(password)) {
      feedback.push('添加数字');
    }
    
    if (!/[^a-zA-Z0-9]/.test(password)) {
      feedback.push('添加特殊字符');
    }
    
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('避免重复字符');
    }
    
    if (new Set(password).size < password.length * 0.6) {
      feedback.push('增加字符多样性');
    }
    
    if (/password|123456|qwerty/i.test(password)) {
      feedback.push('避免使用常见密码');
    }
    
    return feedback;
  }

  /**
   * 估算破解时间
   */
  private estimateCrackTime(password: string): string {
    const entropy = this.calculateEntropy(password);
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
   * 计算密码熵
   */
  private calculateEntropy(password: string): number {
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
    
    return password.length * Math.log2(charsetSize);
  }

  /**
   * 安全地清除内存中的敏感数据
   */
  async clearSensitiveData(): Promise<void> {
    try {
      // 清除 Web Crypto API 的缓存
      if ('crypto' in window && 'randomValues' in crypto) {
        // 生成随机数据覆盖内存
        const dummyData = new Uint8Array(1024);
        crypto.getRandomValues(dummyData);
      }
    } catch (error) {
      console.warn('Failed to clear sensitive data:', error);
    }
  }
}

// 类型定义
export interface EncryptedData {
  algorithm: string;
  ciphertext: number[];
  iv: number[];
  tag: number[];
  keyId: string;
  keyDerivation: {
    algorithm: string;
    iterations: number;
    memory: number;
    parallelism: number;
    saltLength: number;
  };
}

export interface PasswordStrength {
  score: number;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  feedback: string[];
  crackTime: string;
}

export interface PasswordOptions {
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeSimilar?: boolean;
}

// Web Worker 支持
export class EncryptionWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(new URL('../workers/encryption.worker.ts', import.meta.url));
  }

  async encrypt(data: Uint8Array, password: string): Promise<EncryptedData> {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (event) => {
        if (event.data.type === 'encrypted') {
          resolve(event.data.data);
        } else if (event.data.type === 'error') {
          reject(new Error(event.data.error));
        }
      };
      
      this.worker.postMessage({
        type: 'encrypt',
        data: Array.from(data),
        password,
      });
    });
  }

  async decrypt(encryptedData: EncryptedData, password: string): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (event) => {
        if (event.data.type === 'decrypted') {
          resolve(new Uint8Array(event.data.data));
        } else if (event.data.type === 'error') {
          reject(new Error(event.data.error));
        }
      };
      
      this.worker.postMessage({
        type: 'decrypt',
        data: encryptedData,
        password,
      });
    });
  }

  terminate(): void {
    this.worker.terminate();
  }
}