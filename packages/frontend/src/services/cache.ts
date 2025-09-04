// 缓存服务实现
// packages/frontend/src/services/cache.ts

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CacheDB extends DBSchema {
  vaults: {
    key: string;
    value: {
      blobId: string;
      data: any;
      timestamp: number;
      size: number;
      accessCount: number;
      lastAccessed: number;
    };
    indexes: {
      'by-timestamp': number;
      'by-size': number;
      'by-access-count': number;
    };
  };
  metadata: {
    key: string;
    value: {
      lastSync: number;
      totalSize: number;
      vaultCount: number;
      hitCount: number;
      missCount: number;
    };
  };
  sessions: {
    key: string;
    value: {
      userId: string;
      vaultId: string;
      token: string;
      expiresAt: number;
      permissions: string[];
    };
  };
}

export class CacheService {
  private db: Promise<IDBPDatabase<CacheDB>>;
  private maxCacheSize = 100 * 1024 * 1024; // 100MB
  private maxAge = 24 * 60 * 60 * 1000; // 24 hours
  private maxVaults = 50; // 最大缓存保险库数量

  constructor() {
    this.db = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase<CacheDB>> {
    return openDB<CacheDB>('suipass-cache', 1, {
      upgrade(db) {
        const vaultStore = db.createObjectStore('vaults', { keyPath: 'blobId' });
        vaultStore.createIndex('by-timestamp', 'timestamp');
        vaultStore.createIndex('by-size', 'size');
        vaultStore.createIndex('by-access-count', 'accessCount');
        
        db.createObjectStore('metadata', { keyPath: 'key' });
        db.createObjectStore('sessions', { keyPath: 'key' });
      },
    });
  }

  /**
   * 存储保险库数据
   */
  async setVault(blobId: string, data: any): Promise<void> {
    const db = await this.db;
    const size = JSON.stringify(data).length;
    const timestamp = Date.now();
    
    // 检查缓存大小限制
    await this.enforceCacheLimit();
    
    // 检查是否已存在
    const existing = await db.get('vaults', blobId);
    
    const vaultData = {
      blobId,
      data,
      timestamp,
      size,
      accessCount: existing ? existing.accessCount + 1 : 1,
      lastAccessed: timestamp,
    };
    
    await db.put('vaults', vaultData);
    
    // 更新元数据
    await this.updateMetadata(size, existing ? 0 : 1, 0, 0);
  }

  /**
   * 获取保险库数据
   */
  async getVault(blobId: string): Promise<any | null> {
    const db = await this.db;
    const cached = await db.get('vaults', blobId);
    
    if (!cached) {
      await this.updateMetadata(0, 0, 0, 1); // 记录未命中
      return null;
    }
    
    // 检查是否过期
    if (Date.now() - cached.timestamp > this.maxAge) {
      await db.delete('vaults', blobId);
      await this.updateMetadata(-cached.size, -1, 0, 1);
      return null;
    }
    
    // 更新访问信息
    cached.accessCount += 1;
    cached.lastAccessed = Date.now();
    await db.put('vaults', cached);
    
    // 更新元数据
    await this.updateMetadata(0, 0, 1, 0); // 记录命中
    
    return cached.data;
  }

  /**
   * 删除保险库数据
   */
  async deleteVault(blobId: string): Promise<void> {
    const db = await this.db;
    const cached = await db.get('vaults', blobId);
    
    if (cached) {
      await db.delete('vaults', blobId);
      await this.updateMetadata(-cached.size, -1, 0, 0);
    }
  }

  /**
   * 清空所有缓存
   */
  async clearCache(): Promise<void> {
    const db = await this.db;
    await db.clear('vaults');
    await db.clear('metadata');
    await db.clear('sessions');
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStats(): Promise<CacheStats> {
    const db = await this.db;
    const vaults = await db.getAll('vaults');
    const metadata = await db.get('metadata', 'stats');
    
    const totalSize = vaults.reduce((sum, v) => sum + v.size, 0);
    const totalAccessCount = vaults.reduce((sum, v) => sum + v.accessCount, 0);
    const averageAccessCount = vaults.length > 0 ? totalAccessCount / vaults.length : 0;
    
    return {
      totalSize,
      vaultCount: vaults.length,
      hitCount: metadata?.hitCount || 0,
      missCount: metadata?.missCount || 0,
      hitRate: metadata ? (metadata.hitCount / (metadata.hitCount + metadata.missCount)) * 100 : 0,
      oldestEntry: vaults.length > 0 ? Math.min(...vaults.map(v => v.timestamp)) : 0,
      newestEntry: vaults.length > 0 ? Math.max(...vaults.map(v => v.timestamp)) : 0,
      averageAccessCount,
      lastSync: metadata?.lastSync || 0,
    };
  }

  /**
   * 清理过期缓存
   */
  async cleanExpiredCache(): Promise<number> {
    const db = await this.db;
    const vaults = await db.getAll('vaults');
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const vault of vaults) {
      if (now - vault.timestamp > this.maxAge) {
        await db.delete('vaults', vault.blobId);
        await this.updateMetadata(-vault.size, -1, 0, 0);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }

  /**
   * 强制执行缓存限制
   */
  private async enforceCacheLimit(): Promise<void> {
    const db = await this.db;
    const stats = await this.getCacheStats();
    
    // 检查大小限制
    if (stats.totalSize > this.maxCacheSize) {
      await this.cleanBySize();
    }
    
    // 检查数量限制
    if (stats.vaultCount > this.maxVaults) {
      await this.cleanByCount();
    }
  }

  /**
   * 按大小清理缓存
   */
  private async cleanBySize(): Promise<void> {
    const db = await this.db;
    const stats = await this.getCacheStats();
    
    if (stats.totalSize <= this.maxCacheSize) {
      return;
    }
    
    // 删除最旧的条目直到满足大小限制
    const vaults = await db.getAllFromIndex('vaults', 'by-timestamp');
    let currentSize = stats.totalSize;
    
    for (const vault of vaults) {
      if (currentSize <= this.maxCacheSize * 0.8) { // 清理到80%限制
        break;
      }
      
      await db.delete('vaults', vault.blobId);
      currentSize -= vault.size;
    }
    
    // 更新元数据
    await this.updateMetadata(stats.totalSize - currentSize, -(vaults.length - (await db.getAll('vaults')).length), 0, 0);
  }

  /**
   * 按数量清理缓存
   */
  private async cleanByCount(): Promise<void> {
    const db = await this.db;
    const vaults = await db.getAllFromIndex('vaults', 'by-timestamp');
    const currentCount = vaults.length;
    
    if (currentCount <= this.maxVaults) {
      return;
    }
    
    // 删除最旧的条目直到满足数量限制
    const toDelete = currentCount - this.maxVaults;
    for (let i = 0; i < toDelete; i++) {
      await db.delete('vaults', vaults[i].blobId);
    }
    
    // 更新元数据
    const deletedSize = vaults.slice(0, toDelete).reduce((sum, v) => sum + v.size, 0);
    await this.updateMetadata(-deletedSize, -toDelete, 0, 0);
  }

  /**
   * 更新元数据
   */
  private async updateMetadata(
    sizeDelta: number, 
    countDelta: number, 
    hitDelta: number, 
    missDelta: number
  ): Promise<void> {
    const db = await this.db;
    const metadata = await db.get('metadata', 'stats');
    
    const newMetadata = {
      key: 'stats',
      lastSync: Date.now(),
      totalSize: (metadata?.totalSize || 0) + sizeDelta,
      vaultCount: (metadata?.vaultCount || 0) + countDelta,
      hitCount: (metadata?.hitCount || 0) + hitDelta,
      missCount: (metadata?.missCount || 0) + missDelta,
    };
    
    await db.put('metadata', newMetadata);
  }

  /**
   * 会话管理
   */
  async setSession(key: string, session: SessionData): Promise<void> {
    const db = await this.db;
    await db.put('sessions', {
      key,
      ...session,
    });
  }

  async getSession(key: string): Promise<SessionData | null> {
    const db = await this.db;
    const session = await db.get('sessions', key);
    
    if (!session) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() > session.expiresAt) {
      await db.delete('sessions', key);
      return null;
    }
    
    return session;
  }

  async deleteSession(key: string): Promise<void> {
    const db = await this.db;
    await db.delete('sessions', key);
  }

  /**
   * 批量预加载保险库
   */
  async preloadVaults(blobIds: string[]): Promise<void> {
    // 这里可以添加预加载逻辑
    // 例如，根据访问频率预测用户可能需要的保险库
    console.log(`Preloading ${blobIds.length} vaults`);
  }

  /**
   * 获取最常访问的保险库
   */
  async getMostAccessedVaults(limit: number = 10): Promise<string[]> {
    const db = await this.db;
    const vaults = await db.getAllFromIndex('vaults', 'by-access-count');
    
    return vaults
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit)
      .map(v => v.blobId);
  }

  /**
   * 优化缓存性能
   */
  async optimizeCache(): Promise<CacheOptimizationResult> {
    const beforeStats = await this.getCacheStats();
    
    // 清理过期缓存
    const expiredCleaned = await this.cleanExpiredCache();
    
    // 强制执行限制
    await this.enforceCacheLimit();
    
    const afterStats = await this.getCacheStats();
    
    return {
      expiredCleaned,
      sizeBefore: beforeStats.totalSize,
      sizeAfter: afterStats.totalSize,
      countBefore: beforeStats.vaultCount,
      countAfter: afterStats.vaultCount,
      hitRateBefore: beforeStats.hitRate,
      hitRateAfter: afterStats.hitRate,
    };
  }
}

// 类型定义
export interface CacheStats {
  totalSize: number;
  vaultCount: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
  averageAccessCount: number;
  lastSync: number;
}

export interface SessionData {
  userId: string;
  vaultId: string;
  token: string;
  expiresAt: number;
  permissions: string[];
}

export interface CacheOptimizationResult {
  expiredCleaned: number;
  sizeBefore: number;
  sizeAfter: number;
  countBefore: number;
  countAfter: number;
  hitRateBefore: number;
  hitRateAfter: number;
}

// 内存缓存装饰器
export class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;
  private ttl = 5 * 60 * 1000; // 5分钟

  set(key: string, value: any, ttl: number = this.ttl): void {
    this.cleanup();
    
    const entry: CacheEntry = {
      value,
      timestamp: Date.now(),
      ttl,
    };
    
    this.cache.set(key, entry);
    
    // 如果超过最大大小，删除最旧的条目
    if (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

interface CacheEntry {
  value: any;
  timestamp: number;
  ttl: number;
}

// 组合缓存服务
export class HybridCacheService {
  private memoryCache = new MemoryCache();
  private persistentCache: CacheService;

  constructor(persistentCache: CacheService) {
    this.persistentCache = persistentCache;
  }

  async getVault(blobId: string): Promise<any | null> {
    // 先检查内存缓存
    const memoryResult = this.memoryCache.get(blobId);
    if (memoryResult) {
      return memoryResult;
    }

    // 检查持久化缓存
    const persistentResult = await this.persistentCache.getVault(blobId);
    if (persistentResult) {
      // 存入内存缓存
      this.memoryCache.set(blobId, persistentResult);
      return persistentResult;
    }

    return null;
  }

  async setVault(blobId: string, data: any): Promise<void> {
    // 同时存储到内存和持久化缓存
    this.memoryCache.set(blobId, data);
    await this.persistentCache.setVault(blobId, data);
  }
}