import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SuiService } from './sui';
import { WalletAdapter } from '@suiet/wallet-kit';

// Mock the wallet adapter
const createMockWalletAdapter = (connected = true): WalletAdapter => ({
  name: 'Test Wallet',
  connected,
  address: connected ? '0x1234567890abcdef1234567890abcdef12345678' : '',
  connect: vi.fn(),
  disconnect: vi.fn(),
  signAndExecuteTransaction: vi.fn(),
} as any);

// Mock @mysten/sui.js
vi.mock('@mysten/sui.js', () => ({
  SuiClient: vi.fn().mockImplementation(() => ({
    getObject: vi.fn(),
    getOwnedObjects: vi.fn(),
    getBalance: vi.fn(),
    dryRunTransaction: vi.fn(),
    getLatestCheckpointSequenceNumber: vi.fn(),
    subscribeEvent: vi.fn(),
    connection: { url: 'https://sui.testnet.rpc' },
  })),
  getFullnodeUrl: vi.fn().mockReturnValue('https://sui.testnet.rpc'),
  Transaction: vi.fn().mockImplementation(() => ({
    object: vi.fn().mockReturnThis(),
    pure: {
      string: vi.fn().mockReturnThis(),
      address: vi.fn().mockReturnThis(),
      u64: vi.fn().mockReturnThis(),
      vector: vi.fn().mockReturnThis(),
    },
    moveCall: vi.fn().mockReturnThis(),
    setSender: vi.fn(),
  })),
}));

describe('SuiService', () => {
  let suiService: SuiService;
  let mockWallet: WalletAdapter;

  beforeEach(() => {
    // Reset environment
    process.env.VITE_SUI_NETWORK = 'testnet';
    process.env.VITE_SUI_PACKAGE_ID = '0x1234567890abcdef1234567890abcdef12345678';
    
    suiService = new SuiService();
    mockWallet = createMockWalletAdapter();
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Network Configuration', () => {
    it('should initialize with testnet network by default', () => {
      expect(suiService.getNetwork()).toBe('testnet');
    });

    it('should use correct RPC URL for testnet', () => {
      expect(suiService.getRpcUrl()).toBe('https://sui.testnet.rpc');
    });

    it('should use localnet URL when configured', () => {
      process.env.VITE_SUI_NETWORK = 'localnet';
      const localService = new SuiService();
      expect(localService.getNetwork()).toBe('localnet');
      expect(localService.getRpcUrl()).toBe('http://127.0.0.1:9000');
    });
  });

  describe('Wallet Connection', () => {
    it('should connect wallet successfully', async () => {
      await suiService.connectWallet(mockWallet);
      
      expect(mockWallet.connect).toHaveBeenCalled();
      expect(suiService.isWalletConnected()).toBe(true);
    });

    it('should disconnect wallet successfully', async () => {
      await suiService.connectWallet(mockWallet);
      await suiService.disconnectWallet();
      
      expect(mockWallet.disconnect).toHaveBeenCalled();
      expect(suiService.isWalletConnected()).toBe(false);
    });

    it('should get current address when connected', async () => {
      await suiService.connectWallet(mockWallet);
      const address = await suiService.getCurrentAddress();
      
      expect(address).toBe(mockWallet.address);
    });

    it('should throw error when getting address without connection', async () => {
      await expect(suiService.getCurrentAddress()).rejects.toThrow('No wallet connected');
    });
  });

  describe('Package ID Management', () => {
    it('should return package ID from environment variable', async () => {
      const packageId = await suiService.getPackageId();
      expect(packageId).toBe('0x1234567890abcdef1234567890abcdef12345678');
    });

    it('should use default package ID when environment variable is not set', async () => {
      delete process.env.VITE_SUI_PACKAGE_ID;
      
      // Reset cache by creating new service
      const newService = new SuiService();
      const packageId = await newService.getPackageId();
      
      expect(packageId).toBe('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    });

    it('should cache package ID after first call', async () => {
      const packageId1 = await suiService.getPackageId();
      const packageId2 = await suiService.getPackageId();
      
      expect(packageId1).toBe(packageId2);
    });
  });

  describe('Vault Operations', () => {
    beforeEach(async () => {
      await suiService.connectWallet(mockWallet);
      
      // Mock successful transaction
      mockWallet.signAndExecuteTransaction = vi.fn().mockResolvedValue({
        effects: {
          status: { status: 'success' },
          created: [{ reference: { objectId: 'new_vault_id' } }],
          gasUsed: {
            computationCost: '1000000',
            storageCost: '500000',
            storageRebate: '200000',
          },
        },
      });
    });

    it('should create vault object successfully', async () => {
      const vault = {
        id: '',
        name: 'Test Vault',
        description: 'Test Description',
        ownerId: mockWallet.address!,
        storageBlobId: 'test_blob_id',
        isEncrypted: true,
        items: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const vaultId = await suiService.createVaultObject(vault);
      
      expect(vaultId).toBe('new_vault_id');
      expect(mockWallet.signAndExecuteTransaction).toHaveBeenCalled();
    });

    it('should throw error when creating vault without wallet connection', async () => {
      await suiService.disconnectWallet();
      
      const vault = {
        id: '',
        name: 'Test Vault',
        description: 'Test Description',
        ownerId: '',
        storageBlobId: 'test_blob_id',
        isEncrypted: true,
        items: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await expect(suiService.createVaultObject(vault)).rejects.toThrow('No wallet connected');
    });

    it('should get vault information successfully', async () => {
      const mockObject = {
        data: {
          content: {
            fields: {
              name: 'Test Vault',
              description: 'Test Description',
              owner: mockWallet.address,
              walrus_blob_id: 'test_blob_id',
              is_encrypted: true,
              created_at: Math.floor(Date.now() / 1000),
              updated_at: Math.floor(Date.now() / 1000),
            },
          },
        },
      };

      // Mock getObject response
      const clientMock = (suiService as any).client;
      clientMock.getObject = vi.fn().mockResolvedValue(mockObject);

      const vault = await suiService.getVault('test_vault_id');
      
      expect(vault.name).toBe('Test Vault');
      expect(vault.storageBlobId).toBe('test_blob_id');
      expect(vault.isEncrypted).toBe(true);
    });

    it('should throw error when vault not found', async () => {
      const clientMock = (suiService as any).client;
      clientMock.getObject = vi.fn().mockResolvedValue({
        data: { content: null },
      });

      await expect(suiService.getVault('nonexistent_vault')).rejects.toThrow('Vault not found');
    });
  });

  describe('Utility Methods', () => {
    beforeEach(async () => {
      await suiService.connectWallet(mockWallet);
    });

    it('should get balance successfully', async () => {
      const clientMock = (suiService as any).client;
      clientMock.getBalance = vi.fn().mockResolvedValue({
        totalBalance: '1000000000',
      });

      const balance = await suiService.getBalance(mockWallet.address!);
      
      expect(balance).toBe(1); // 1 SUI
    });

    it('should return 0 when balance fetch fails', async () => {
      const clientMock = (suiService as any).client;
      clientMock.getBalance = vi.fn().mockRejectedValue(new Error('Network error'));

      const balance = await suiService.getBalance(mockWallet.address!);
      
      expect(balance).toBe(0);
    });

    it('should check network status successfully', async () => {
      const clientMock = (suiService as any).client;
      clientMock.getLatestCheckpointSequenceNumber = vi.fn().mockResolvedValue(BigInt(1000));

      const status = await suiService.getNetworkStatus();
      
      expect(status.status).toBe('online');
      expect(status.version).toBe('1000');
      expect(status.chainId).toBe('testnet');
    });

    it('should return offline status when network check fails', async () => {
      const clientMock = (suiService as any).client;
      clientMock.getLatestCheckpointSequenceNumber = vi.fn().mockRejectedValue(new Error('Network error'));

      const status = await suiService.getNetworkStatus();
      
      expect(status.status).toBe('offline');
      expect(status.chainId).toBe('testnet');
    });
  });

  describe('Error Handling', () => {
    it('should retry failed operations', async () => {
      await suiService.connectWallet(mockWallet);
      
      const clientMock = (suiService as any).client;
      let attemptCount = 0;
      
      clientMock.getBalance = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({ totalBalance: '1000000000' });
      });

      const balance = await suiService.getBalance(mockWallet.address!);
      
      expect(balance).toBe(1);
      expect(attemptCount).toBe(3);
    });

    it('should throw error after max retry attempts', async () => {
      await suiService.connectWallet(mockWallet);
      
      const clientMock = (suiService as any).client;
      clientMock.getBalance = vi.fn().mockRejectedValue(new Error('Persistent failure'));

      await expect(suiService.getBalance(mockWallet.address!)).rejects.toThrow('Persistent failure');
    });
  });
});