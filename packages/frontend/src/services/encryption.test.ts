// 加密服务测试示例
// packages/frontend/src/services/encryption.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EncryptionService } from './encryption';
import { SecurityUtils } from '@/utils/security';

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;
  let mockCrypto: any;

  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks();

    // 创建加密服务实例
    encryptionService = new EncryptionService();

    // 模拟 Web Crypto API
    mockCrypto = {
      getRandomValues: vi.fn(),
      subtle: {
        encrypt: vi.fn(),
        decrypt: vi.fn(),
        importKey: vi.fn(),
        exportKey: vi.fn(),
        digest: vi.fn(),
        deriveKey: vi.fn(),
      },
    };

    // 设置全局 crypto
    Object.defineProperty(global, 'crypto', {
      value: mockCrypto,
      configurable: true,
    });
  });

  describe('encrypt', () => {
    it('should encrypt data successfully', async () => {
      // 准备测试数据
      const testData = new TextEncoder().encode('test data');
      const masterPassword = 'test-password';

      // 模拟加密操作
      const mockKey = { algorithm: { name: 'AES-GCM', length: 256 } };
      const mockIv = new Uint8Array(12);
      const mockEncryptedData = new Uint8Array(32);
      const mockKeyId = 'test-key-id';

      mockCrypto.getRandomValues
        .mockReturnValueOnce(mockIv)
        .mockReturnValueOnce(new Uint8Array(16)); // salt

      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.encrypt.mockResolvedValue(mockEncryptedData);
      mockCrypto.subtle.exportKey.mockResolvedValue(new TextEncoder().encode('test-key'));
      mockCrypto.subtle.digest.mockResolvedValue(new TextEncoder().encode('test-hash'));

      // 执行加密
      const result = await encryptionService.encrypt(testData, masterPassword);

      // 验证结果
      expect(result).toEqual({
        algorithm: 'AES-256-GCM',
        ciphertext: expect.any(Array),
        iv: expect.any(Array),
        tag: expect.any(Array),
        keyId: mockKeyId,
        keyDerivation: {
          algorithm: 'Argon2id',
          iterations: 3,
          memory: 65536,
          parallelism: 1,
          saltLength: 16,
        },
      });

      // 验证调用
      expect(mockCrypto.getRandomValues).toHaveBeenCalledTimes(2);
      expect(mockCrypto.subtle.importKey).toHaveBeenCalledTimes(1);
      expect(mockCrypto.subtle.encrypt).toHaveBeenCalledTimes(1);
    });

    it('should handle encryption errors', async () => {
      const testData = new TextEncoder().encode('test data');
      const masterPassword = 'test-password';

      // 模拟加密失败
      mockCrypto.subtle.encrypt.mockRejectedValue(new Error('Encryption failed'));

      // 验证错误处理
      await expect(encryptionService.encrypt(testData, masterPassword)).rejects.toThrow(
        'Failed to encrypt data'
      );
    });
  });

  describe('decrypt', () => {
    it('should decrypt data successfully', async () => {
      // 准备测试数据
      const encryptedData = {
        algorithm: 'AES-256-GCM',
        ciphertext: [1, 2, 3, 4],
        iv: [5, 6, 7, 8],
        tag: [9, 10, 11, 12],
        keyId: 'test-key-id',
        keyDerivation: {
          algorithm: 'Argon2id',
          iterations: 3,
          memory: 65536,
          parallelism: 1,
          saltLength: 16,
        },
      };

      const masterPassword = 'test-password';
      const mockKey = { algorithm: { name: 'AES-GCM', length: 256 } };
      const mockDecryptedData = new TextEncoder().encode('test data');

      // 模拟解密操作
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.exportKey.mockResolvedValue(new TextEncoder().encode('test-key'));
      mockCrypto.subtle.digest.mockResolvedValue(new TextEncoder().encode('test-hash'));
      mockCrypto.subtle.decrypt.mockResolvedValue(mockDecryptedData);

      // 执行解密
      const result = await encryptionService.decrypt(encryptedData, masterPassword);

      // 验证结果
      expect(result).toEqual(mockDecryptedData);
      expect(mockCrypto.subtle.decrypt).toHaveBeenCalledTimes(1);
    });

    it('should validate key ID before decryption', async () => {
      const encryptedData = {
        algorithm: 'AES-256-GCM',
        ciphertext: [1, 2, 3, 4],
        iv: [5, 6, 7, 8],
        tag: [9, 10, 11, 12],
        keyId: 'test-key-id',
        keyDerivation: {
          algorithm: 'Argon2id',
          iterations: 3,
          memory: 65536,
          parallelism: 1,
          saltLength: 16,
        },
      };

      const masterPassword = 'test-password';
      const mockKey = { algorithm: { name: 'AES-GCM', length: 256 } };

      // 模拟密钥ID不匹配
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.exportKey.mockResolvedValue(new TextEncoder().encode('different-key'));
      mockCrypto.subtle.digest.mockResolvedValue(new TextEncoder().encode('different-hash'));

      // 验证错误处理
      await expect(encryptionService.decrypt(encryptedData, masterPassword)).rejects.toThrow(
        'Invalid encryption key'
      );
    });
  });

  describe('verifyPasswordStrength', () => {
    it('should correctly evaluate password strength', async () => {
      const weakPassword = 'password';
      const strongPassword = 'Str0ngP@ssw0rd!';

      // 测试弱密码
      const weakResult = await encryptionService.verifyPasswordStrength(weakPassword);
      expect(weakResult.score).toBeLessThan(60);
      expect(weakResult.strength).toBe('weak');
      expect(weakResult.feedback.length).toBeGreaterThan(0);

      // 测试强密码
      const strongResult = await encryptionService.verifyPasswordStrength(strongPassword);
      expect(strongResult.score).toBeGreaterThan(80);
      expect(strongResult.strength).toBe('very-strong');
    });

    it('should provide specific feedback for weak passwords', async () => {
      const password = '123';
      const result = await encryptionService.verifyPasswordStrength(password);

      expect(result.feedback).toEqual(
        expect.arrayContaining([
          expect.stringContaining('长度'),
          expect.stringContaining('大写'),
          expect.stringContaining('小写'),
          expect.stringContaining('数字'),
          expect.stringContaining('特殊字符'),
        ])
      );
    });
  });

  describe('generateSecurePassword', () => {
    it('should generate password with specified length', () => {
      const password = encryptionService.generateSecurePassword(16);
      expect(password).toHaveLength(16);
    });

    it('should generate password with all character types by default', () => {
      const password = encryptionService.generateSecurePassword();

      expect(password).toMatch(/[a-z]/); // 小写字母
      expect(password).toMatch(/[A-Z]/); // 大写字母
      expect(password).toMatch(/[0-9]/); // 数字
      expect(password).toMatch(/[^A-Za-z0-9]/); // 特殊字符
    });

    it('should respect character type options', () => {
      const password = encryptionService.generateSecurePassword(12, {
        includeUppercase: false,
        includeSymbols: false,
      });

      expect(password).toMatch(/[a-z]/); // 小写字母
      expect(password).toMatch(/[0-9]/); // 数字
      expect(password).not.toMatch(/[A-Z]/); // 不应有大写字母
      expect(password).not.toMatch(/[^A-Za-z0-9]/); // 不应有特殊字符
    });

    it('should throw error when no character types selected', () => {
      expect(() => {
        encryptionService.generateSecurePassword(12, {
          includeUppercase: false,
          includeLowercase: false,
          includeNumbers: false,
          includeSymbols: false,
        });
      }).toThrow('No character types selected');
    });
  });

  describe('deriveVaultKey', () => {
    it('should derive vault-specific key', async () => {
      const masterPassword = 'test-password';
      const vaultId = 'test-vault-id';

      const mockMasterKey = { algorithm: { name: 'AES-GCM', length: 256 } };
      const mockVaultKey = { algorithm: { name: 'AES-GCM', length: 256 } };

      mockCrypto.subtle.importKey.mockResolvedValue(mockMasterKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockVaultKey);

      const result = await encryptionService.deriveVaultKey(masterPassword, vaultId);

      expect(result).toBe(mockVaultKey);
      expect(mockCrypto.subtle.deriveKey).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'HKDF',
          salt: expect.any(Uint8Array),
          info: expect.any(Uint8Array),
          hash: 'SHA-256',
        }),
        mockMasterKey,
        expect.objectContaining({
          name: 'AES-GCM',
          length: 256,
        }),
        false,
        ['encrypt', 'decrypt']
      );
    });
  });

  describe('clearSensitiveData', () => {
    it('should clear sensitive data from memory', async () => {
      const sensitiveData = new Uint8Array([1, 2, 3, 4, 5]);

      // 模拟 getRandomValues 覆盖数据
      mockCrypto.getRandomValues.mockImplementation((array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = 255; // 用255覆盖
        }
        return array;
      });

      await encryptionService.clearSensitiveData(sensitiveData);

      // 验证数据被覆盖
      expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(sensitiveData);
    });

    it('should handle clearing errors gracefully', async () => {
      const sensitiveData = new Uint8Array([1, 2, 3, 4, 5]);

      // 模拟 getRandomValues 抛出错误
      mockCrypto.getRandomValues.mockImplementation(() => {
        throw new Error('Failed to clear data');
      });

      // 应该不抛出错误，只记录警告
      await expect(encryptionService.clearSensitiveData(sensitiveData)).resolves.not.toThrow();
    });
  });
});

describe('SecurityUtils', () => {
  describe('validateInput', () => {
    it('should validate username correctly', () => {
      expect(SecurityUtils.validateInput('testuser123', 'username')).toBe(true);
      expect(SecurityUtils.validateInput('test-user', 'username')).toBe(false);
      expect(SecurityUtils.validateInput('test user', 'username')).toBe(false);
      expect(SecurityUtils.validateInput('', 'username')).toBe(false);
    });

    it('should validate email correctly', () => {
      expect(SecurityUtils.validateInput('test@example.com', 'email')).toBe(true);
      expect(SecurityUtils.validateInput('invalid-email', 'email')).toBe(false);
      expect(SecurityUtils.validateInput('', 'email')).toBe(false);
    });

    it('should detect XSS attempts', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert(1)</script>',
      ];

      maliciousInputs.forEach(input => {
        expect(SecurityUtils.validateInput(input, 'default')).toBe(false);
      });
    });
  });

  describe('generateSecureRandom', () => {
    it('should generate cryptographically secure random string', () => {
      const random1 = SecurityUtils.generateSecureRandom(32);
      const random2 = SecurityUtils.generateSecureRandom(32);

      expect(random1).toHaveLength(64); // 32 bytes = 64 hex characters
      expect(random2).toHaveLength(64);
      expect(random1).not.toBe(random2);
      expect(/^[a-f0-9]+$/.test(random1)).toBe(true);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should provide comprehensive password validation', () => {
      const weakPassword = '123';
      const strongPassword = 'Str0ngP@ssw0rd!2024';

      const weakResult = SecurityUtils.validatePasswordStrength(weakPassword);
      const strongResult = SecurityUtils.validatePasswordStrength(strongPassword);

      expect(weakResult.isValid).toBe(false);
      expect(weakResult.score).toBeLessThan(70);
      expect(weakResult.feedback.length).toBeGreaterThan(0);

      expect(strongResult.isValid).toBe(true);
      expect(strongResult.score).toBeGreaterThan(80);
      expect(strongResult.entropy).toBeGreaterThan(100);
    });
  });
});
