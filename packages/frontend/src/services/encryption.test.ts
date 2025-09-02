import { describe, it, expect, beforeEach } from 'vitest';
import { deriveKey, generateSalt, generateIV, encryptData, decryptData } from '../services/encryption';

describe('Encryption Service', () => {
  let masterPassword: string;
  let salt: string;

  beforeEach(() => {
    masterPassword = 'test-password-123';
    salt = generateSalt();
  });

  describe('Key Derivation', () => {
    it('should derive consistent key from same password and salt', async () => {
      const key1 = await deriveKey(masterPassword, salt);
      const key2 = await deriveKey(masterPassword, salt);
      expect(key1).toBe(key2);
    });

    it('should derive different keys for different passwords', async () => {
      const key1 = await deriveKey(masterPassword, salt);
      const key2 = await deriveKey('different-password', salt);
      expect(key1).not.toBe(key2);
    });
  });

  describe('Encryption/Decryption', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const testData = 'This is a secret message';
      const encryptionKey = await deriveKey(masterPassword, salt);
      
      const encrypted = await encryptData(testData, encryptionKey);
      const decrypted = await decryptData(encrypted.encrypted, encryptionKey, encrypted.iv, encrypted.salt);
      
      expect(decrypted).toBe(testData);
    });

    it('should fail to decrypt with wrong key', async () => {
      const testData = 'This is a secret message';
      const encryptionKey = await deriveKey(masterPassword, salt);
      
      const encrypted = await encryptData(testData, encryptionKey);
      
      await expect(
        decryptData(encrypted.encrypted, 'wrong-key', encrypted.iv, encrypted.salt)
      ).rejects.toThrow('Failed to decrypt data');
    });
  });

  describe('Utility Functions', () => {
    it('should generate unique salts', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toBe(salt2);
      expect(salt1).toHaveLength(32); // 16 bytes * 2 (hex)
    });

    it('should generate unique IVs', () => {
      const iv1 = generateIV();
      const iv2 = generateIV();
      expect(iv1).not.toBe(iv2);
      expect(iv1).toHaveLength(32); // 16 bytes * 2 (hex)
    });
  });
});