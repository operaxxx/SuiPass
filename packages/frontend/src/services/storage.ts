import { WalrusClient } from '@mysten/walrus';
import { encryptData, decryptData } from './encryption';
import { VaultItem } from '../types';

export class WalrusStorageService {
  private client: WalrusClient;
  private initialized = false;

  constructor() {
    this.client = new WalrusClient({
      network: process.env.VITE_WALRUS_NETWORK || 'testnet',
      rpcUrl: process.env.VITE_WALRUS_RPC_URL,
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.client.initialize();
      this.initialized = true;
      console.log('Walrus storage service initialized');
    } catch (error) {
      console.error('Failed to initialize Walrus storage:', error);
      throw new Error('Walrus storage initialization failed');
    }
  }

  async storeEncryptedData(
    data: VaultItem[],
    encryptionKey: string
  ): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Encrypt the data before storing
      const encryptedData = await encryptData(JSON.stringify(data), encryptionKey);
      
      // Store on Walrus
      const blobId = await this.client.uploadBlob({
        data: encryptedData,
        epoch: await this.getCurrentEpoch(),
      });

      return blobId;
    } catch (error) {
      console.error('Failed to store encrypted data on Walrus:', error);
      throw new Error('Failed to store encrypted data');
    }
  }

  async retrieveEncryptedData(
    blobId: string,
    encryptionKey: string
  ): Promise<VaultItem[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Retrieve from Walrus
      const encryptedData = await this.client.downloadBlob(blobId);
      
      // Decrypt the data
      const decryptedData = await decryptData(encryptedData, encryptionKey);
      
      return JSON.parse(decryptedData) as VaultItem[];
    } catch (error) {
      console.error('Failed to retrieve encrypted data from Walrus:', error);
      throw new Error('Failed to retrieve encrypted data');
    }
  }

  async deleteStoredData(blobId: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await this.client.deleteBlob(blobId);
    } catch (error) {
      console.error('Failed to delete data from Walrus:', error);
      throw new Error('Failed to delete stored data');
    }
  }

  private async getCurrentEpoch(): Promise<number> {
    // Get current epoch for blob storage
    const epochInfo = await this.client.getEpochInfo();
    return epochInfo.epoch;
  }

  // Backup functionality
  async createBackup(
    data: VaultItem[],
    encryptionKey: string
  ): Promise<{ blobId: string; timestamp: number }> {
    const blobId = await this.storeEncryptedData(data, encryptionKey);
    return {
      blobId,
      timestamp: Date.now(),
    };
  }

  async restoreBackup(
    blobId: string,
    encryptionKey: string
  ): Promise<VaultItem[]> {
    return this.retrieveEncryptedData(blobId, encryptionKey);
  }

  // Utility methods
  async checkBlobAvailability(blobId: string): Promise<boolean> {
    try {
      const info = await this.client.getBlobInfo(blobId);
      return info.status === 'stored';
    } catch {
      return false;
    }
  }

  async getStorageCost(dataSize: number): Promise<number> {
    // Estimate storage cost in SUI
    const costEstimate = await this.client.estimateUploadCost(dataSize);
    return costEstimate.totalCost;
  }
}

// Singleton instance
export const walrusStorageService = new WalrusStorageService();