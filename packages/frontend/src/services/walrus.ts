// 核心服务层实现
// packages/frontend/src/services/walrus.ts

import { WalrusClient } from '@mysten/walrus';
import { EncryptionService } from './encryption';
import { CacheService } from './cache';
import { AuditService } from './audit';
import type { 
  VaultBlob, 
  DeltaUpdate
} from '@/types/walrus';

export class WalrusStorageService {
  private client: WalrusClient;
  private encryption: EncryptionService;
  private cache: CacheService;
  private audit: AuditService;
  private retryAttempts = 3;
  private maxBlobSize = 10 * 1024 * 1024; // 10MB
  private compressionThreshold = 1024; // 1KB

  constructor() {
    this.client = new WalrusClient({
      network: (process.env.VITE_WALRUS_NETWORK as 'mainnet' | 'testnet' | undefined) || 'testnet',
    });
    this.encryption = new EncryptionService();
    this.cache = new CacheService();
    this.audit = new AuditService();
  }

  /**
   * 上传保险库数据到Walrus
   */
  async uploadVault(vault: VaultBlob, masterPassword: string): Promise<string> {
    const startTime = Date.now();
    
    try {
      // 1. 验证数据完整性
      this.validateVault(vault);
      
      // 2. 压缩数据
      const compressed = await this.compressVault(vault);
      
      // 3. 加密数据
      const encrypted = await this.encryption.encrypt(compressed, masterPassword);
      
      // 4. 转换为Uint8Array用于上传
      const encryptedBytes = new Uint8Array([
        ...encrypted.ciphertext instanceof Uint8Array ? encrypted.ciphertext : new Uint8Array(encrypted.ciphertext),
        ...encrypted.iv instanceof Uint8Array ? encrypted.iv : new Uint8Array(encrypted.iv),
        ...encrypted.tag instanceof Uint8Array ? encrypted.tag : new Uint8Array(encrypted.tag),
      ]);
      
      // 5. 上传到Walrus
      const blobId = await this.uploadWithRetry(encryptedBytes);
      
      // 6. 更新缓存
      await this.cache.setVault(blobId, vault);
      
      // 7. 记录审计日志
      await this.audit.logUpload({
        blobId,
        size: compressed.length,
        compressionRatio: vault.compression.ratio,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      });
      
      return blobId;
    } catch (error) {
      console.error('Failed to upload vault:', error);
      throw new Error('Vault upload failed');
    }
  }

  /**
   * 从Walrus下载保险库数据
   */
  async downloadVault(blobId: string, masterPassword: string): Promise<VaultBlob> {
    const startTime = Date.now();
    
    try {
      // 1. 检查缓存
      const cached = await this.cache.getVault(blobId);
      if (cached) {
        return cached;
      }
      
      // 2. 从Walrus下载
      const encryptedBytes = await this.downloadWithRetry(blobId);
      
      // 3. 分离加密数据（假设我们知道IV长度为12，tag长度为16）
      const ivLength = 12;
      const tagLength = 16;
      const ciphertext = encryptedBytes.slice(0, -ivLength - tagLength);
      const iv = encryptedBytes.slice(-ivLength - tagLength, -tagLength);
      const tag = encryptedBytes.slice(-tagLength);
      
      // 4. 构建EncryptedData对象
      const encryptedData: EncryptedData = {
        algorithm: 'AES-256-GCM',
        ciphertext: Array.from(ciphertext),
        iv: Array.from(iv),
        tag: Array.from(tag),
        keyId: '', // 这个需要在实际实现中处理
      };
      
      // 5. 解密数据
      const decrypted = await this.encryption.decrypt(encryptedData, masterPassword);
      
      // 6. 解压数据
      const vault = await this.decompressVault(decrypted);
      
      // 7. 验证数据完整性
      this.validateVault(vault);
      
      // 8. 更新缓存
      await this.cache.setVault(blobId, vault);
      
      // 9. 记录审计日志
      await this.audit.logDownload({
        blobId,
        size: decrypted.length,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      });
      
      return vault;
    } catch (error) {
      console.error('Failed to download vault:', error);
      throw new Error('Vault download failed');
    }
  }

  /**
   * 创建增量更新
   */
  async createDeltaUpdate(
    currentVault: VaultBlob,
    previousVault: VaultBlob
  ): Promise<DeltaUpdate> {
    const changes = this.calculateChanges(currentVault, previousVault);
    const delta: DeltaUpdate = {
      version: currentVault.version,
      base_version: previousVault.version,
      changes,
      checksum: await this.generateChecksum(changes),
    };
    
    return delta;
  }

  /**
   * 应用增量更新
   */
  async applyDeltaUpdate(
    baseVault: VaultBlob,
    delta: DeltaUpdate
  ): Promise<VaultBlob> {
    // 验证校验和
    const isValid = await this.verifyChecksum(delta.changes, delta.checksum);
    if (!isValid) {
      throw new Error('Invalid delta update checksum');
    }
    
    const updatedVault = this.applyChanges(baseVault, delta.changes);
    updatedVault.version = delta.version;
    updatedVault.metadata.updated_at = Date.now();
    
    return updatedVault;
  }

  /**
   * 批量上传保险库
   */
  async batchUploadVaults(
    vaults: VaultBlob[], 
    masterPassword: string
  ): Promise<string[]> {
    const batchSize = 3; // 并发上传数量
    const results: string[] = [];
    
    for (let i = 0; i < vaults.length; i += batchSize) {
      const batch = vaults.slice(i, i + batchSize);
      const batchPromises = batch.map(vault => 
        this.uploadVault(vault, masterPassword).catch(error => {
          console.error('Failed to upload vault:', error);
          return null;
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(Boolean) as string[]);
    }
    
    return results;
  }

  /**
   * 验证数据完整性
   */
  async verifyDataIntegrity(blobId: string, expectedChecksum: string): Promise<boolean> {
    try {
      const encrypted = await this.downloadWithRetry(blobId);
      const actualChecksum = await this.generateChecksum(encrypted);
      return actualChecksum === expectedChecksum;
    } catch (error) {
      console.error('Failed to verify data integrity:', error);
      return false;
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStorageStats(blobId: string): Promise<StorageStats> {
    try {
      const encrypted = await this.downloadWithRetry(blobId);
      const metadata = await this.client.readBlob({ blobId });
      
      return {
        blobId,
        size: encrypted.length,
        storageEpochs: 10, // 默认值
        uploadTime: Date.now(),
        cost: this.calculateStorageCost(encrypted.length, 10),
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      throw new Error('Failed to get storage stats');
    }
  }

  // 私有方法

  private async uploadWithRetry(data: Uint8Array): Promise<string> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const result = await this.client.uploadBlob({
          blobBytes: data,
          epochs: 10, // 10个epoch的存储时间
        });
        return result.blobId;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Upload attempt ${attempt + 1} failed:`, error);
        
        if (attempt < this.retryAttempts - 1) {
          await this.delay(1000 * Math.pow(2, attempt)); // 指数退避
        }
      }
    }
    
    throw lastError!;
  }

  private async downloadWithRetry(blobId: string): Promise<Uint8Array> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const blob = await this.client.downloadBlob(blobId);
        return blob;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Download attempt ${attempt + 1} failed:`, error);
        
        if (attempt < this.retryAttempts - 1) {
          await this.delay(1000 * Math.pow(2, attempt));
        }
      }
    }
    
    throw lastError!;
  }

  private async compressVault(vault: VaultBlob): Promise<Uint8Array> {
    const jsonString = JSON.stringify(vault);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);
    
    // 如果数据太小，不压缩
    if (data.length < this.compressionThreshold) {
      vault.compression = {
        algorithm: 'none',
        ratio: 100,
        original_size: data.length,
        compressed_size: data.length,
      };
      return data;
    }
    
    try {
      // 使用 CompressionStream API
      const cs = new CompressionStream('gzip');
      const writer = cs.writable.getWriter();
      const reader = cs.readable.getReader();
      
      await writer.write(data);
      await writer.close();
      
      const chunks = [];
      let result;
      while (!(result = await reader.read()).done) {
        chunks.push(result.value);
      }
      
      const compressed = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      vault.compression = {
        algorithm: 'gzip',
        ratio: Math.round((compressed.length / data.length) * 100),
        original_size: data.length,
        compressed_size: compressed.length,
      };
      
      return compressed;
    } catch (error) {
      console.warn('Compression failed, using uncompressed data:', error);
      vault.compression = {
        algorithm: 'none',
        ratio: 100,
        original_size: data.length,
        compressed_size: data.length,
      };
      return data;
    }
  }

  private async decompressVault(data: Uint8Array): Promise<VaultBlob> {
    try {
      // 尝试检测是否为压缩数据
      if (data.length < 2) {
        throw new Error('Data too small to be valid');
      }
      
      // GZIP magic number: 0x1f 0x8b
      const isGzip = data[0] === 0x1f && data[1] === 0x8b;
      
      if (!isGzip) {
        // 未压缩数据
        const decoder = new TextDecoder();
        const jsonString = decoder.decode(data);
        return JSON.parse(jsonString);
      }
      
      // 使用 DecompressionStream API
      const ds = new DecompressionStream('gzip');
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();
      
      await writer.write(data);
      await writer.close();
      
      const chunks = [];
      let result;
      while (!(result = await reader.read()).done) {
        chunks.push(result.value);
      }
      
      const decompressed = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );
      let offset = 0;
      for (const chunk of chunks) {
        decompressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decompressed);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decompression failed:', error);
      throw new Error('Failed to decompress vault data');
    }
  }

  private validateVault(vault: VaultBlob): void {
    if (!vault.metadata || !vault.metadata.id) {
      throw new Error('Invalid vault metadata');
    }
    
    if (!vault.checksum) {
      throw new Error('Missing vault checksum');
    }
    
    if (vault.version <= 0) {
      throw new Error('Invalid vault version');
    }
    
    if (vault.passwords.length > 1000) {
      throw new Error('Vault contains too many passwords');
    }
    
    // 验证密码数据结构
    for (const password of vault.passwords) {
      if (!password.id || !password.title) {
        throw new Error('Invalid password item structure');
      }
    }
  }

  private calculateChanges(current: VaultBlob, previous: VaultBlob): Change[] {
    const changes: Change[] = [];
    
    // 计算密码变更
    const passwordMap = new Map(previous.passwords.map(p => [p.id, p]));
    for (const password of current.passwords) {
      const previousPassword = passwordMap.get(password.id);
      if (!previousPassword) {
        changes.push({
          type: 'create',
          entity: 'password',
          id: password.id,
          data: password,
          timestamp: Date.now(),
        });
      } else if (JSON.stringify(password) !== JSON.stringify(previousPassword)) {
        changes.push({
          type: 'update',
          entity: 'password',
          id: password.id,
          data: password,
          timestamp: Date.now(),
        });
      }
    }
    
    // 检测删除的密码
    const currentPasswordIds = new Set(current.passwords.map(p => p.id));
    for (const password of previous.passwords) {
      if (!currentPasswordIds.has(password.id)) {
        changes.push({
          type: 'delete',
          entity: 'password',
          id: password.id,
          timestamp: Date.now(),
        });
      }
    }
    
    return changes;
  }

  private applyChanges(baseVault: VaultBlob, changes: Change[]): VaultBlob {
    const updatedVault = JSON.parse(JSON.stringify(baseVault));
    
    for (const change of changes) {
      switch (change.type) {
        case 'create':
        case 'update':
          if (change.entity === 'password') {
            const index = updatedVault.passwords.findIndex(p => p.id === change.id);
            if (index >= 0) {
              updatedVault.passwords[index] = change.data;
            } else {
              updatedVault.passwords.push(change.data);
            }
          }
          break;
        case 'delete':
          if (change.entity === 'password') {
            updatedVault.passwords = updatedVault.passwords.filter(p => p.id !== change.id);
          }
          break;
      }
    }
    
    return updatedVault;
  }

  private async generateChecksum(data: any): Promise<string> {
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async verifyChecksum(data: any, expectedChecksum: string): Promise<boolean> {
    const actualChecksum = await this.generateChecksum(data);
    return actualChecksum === expectedChecksum;
  }

  private calculateStorageCost(size: number, epochs: number): number {
    const costPerByteEpoch = 0.000001; // 0.000001 SUI per byte per epoch
    return size * epochs * costPerByteEpoch;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 类型定义
export interface StorageStats {
  blobId: string;
  size: number;
  storageEpochs: number;
  uploadTime: number;
  cost: number;
}

export interface Change {
  type: 'create' | 'update' | 'delete';
  entity: 'password' | 'folder';
  id: string;
  data?: any;
  timestamp: number;
}

export interface UploadLog {
  blobId: string;
  size: number;
  compressionRatio: number;
  duration: number;
  timestamp: number;
}

export interface DownloadLog {
  blobId: string;
  size: number;
  duration: number;
  timestamp: number;
}