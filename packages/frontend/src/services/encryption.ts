import CryptoJS from 'crypto-js';

// Encryption configuration
const ENCRYPTION_CONFIG = {
  keySize: 256,
  iterations: 100000,
  hashAlgorithm: 'sha256',
} as const;

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  salt: string;
}

/**
 * Derive encryption key from master password using PBKDF2
 */
export async function deriveKey(
  masterPassword: string,
  salt: string
): Promise<string> {
  return CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: ENCRYPTION_CONFIG.keySize / 32,
    iterations: ENCRYPTION_CONFIG.iterations,
    hasher: CryptoJS.algo.SHA256,
  }).toString();
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

/**
 * Generate a random IV for AES encryption
 */
export function generateIV(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

/**
 * Encrypt data using AES-256-GCM
 */
export async function encryptData(
  data: string,
  key: string,
  iv?: string
): Promise<EncryptionResult> {
  const salt = generateSalt();
  const derivedKey = await deriveKey(key, salt);
  const encryptionIV = iv || generateIV();

  const encrypted = CryptoJS.AES.encrypt(data, derivedKey, {
    iv: CryptoJS.enc.Hex.parse(encryptionIV),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    encrypted: encrypted.toString(),
    iv: encryptionIV,
    salt,
  };
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decryptData(
  encryptedData: string,
  key: string,
  iv: string,
  salt: string
): Promise<string> {
  try {
    const derivedKey = await deriveKey(key, salt);
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, derivedKey, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!result) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }
    
    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Simplified encryption for storage service (handles IV and salt internally)
 */
export async function encryptDataForStorage(
  data: string,
  key: string
): Promise<string> {
  const result = await encryptData(data, key);
  // Combine IV, salt, and encrypted data for storage
  return `${result.iv}:${result.salt}:${result.encrypted}`;
}

/**
 * Simplified decryption for storage service
 */
export async function decryptDataFromStorage(
  encryptedPackage: string,
  key: string
): Promise<string> {
  const [iv, salt, encrypted] = encryptedPackage.split(':');
  
  if (!iv || !salt || !encrypted) {
    throw new Error('Invalid encrypted data format');
  }
  
  return decryptData(encrypted, key, iv, salt);
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

/**
 * Hash a password for verification (not for encryption)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const hash = await deriveKey(password, salt);
  return `${salt}:${hash}`;
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const derivedHash = await deriveKey(password, salt);
    return derivedHash === hash;
  } catch {
    return false;
  }
}