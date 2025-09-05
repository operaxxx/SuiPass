// 状态管理实现 - 保险库状态
// packages/frontend/src/stores/vault.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { AuditService } from '@/services/audit';
import { CacheService } from '@/services/cache';
import { SuiService } from '@/services/sui';
import { WalrusStorageService } from '@/services/walrus';
import type { VaultBlob, VaultInfo, PasswordItem, PermissionCapability } from '@/types';
import type { VaultSettings } from '@/types/walrus';

interface VaultState {
  // 状态
  vaults: VaultInfo[];
  currentVault: VaultInfo | null;
  currentVaultData: VaultBlob | null;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;

  // 搜索和过滤
  searchQuery: string;
  selectedFolder: string | null;
  viewMode: 'grid' | 'list';

  // 权限状态
  permissions: PermissionCapability[];
  sharedWithMe: VaultInfo[];

  // 操作方法
  createVault: (name: string, settings: VaultSettings) => Promise<void>;
  updateVault: (vaultId: string, updates: Partial<VaultInfo>) => Promise<void>;
  deleteVault: (vaultId: string) => Promise<void>;
  setCurrentVault: (vault: VaultInfo | null) => Promise<void>;
  refreshVaults: () => Promise<void>;

  // 数据操作
  addPassword: (password: Omit<PasswordItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePassword: (passwordId: string, updates: Partial<PasswordItem>) => Promise<void>;
  deletePassword: (passwordId: string) => Promise<void>;
  searchPasswords: (query: string) => PasswordItem[];

  // 分享和权限
  shareVault: (vaultId: string, address: string, permissions: number) => Promise<void>;
  revokeAccess: (capabilityId: string) => Promise<void>;
  getSharedVaults: () => Promise<void>;

  // 工具方法
  clearError: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  exportVault: (vaultId: string) => Promise<string>;
  importVault: (data: string) => Promise<void>;
}

// 创建服务实例
const suiService = new SuiService();
const walrusService = new WalrusStorageService();
const cacheService = new CacheService();
const auditService = new AuditService();

export const useVaultStore = create<VaultState>()(
  persist(
    (set, get) => ({
      // 初始状态
      vaults: [],
      currentVault: null,
      currentVaultData: null,
      isLoading: false,
      error: null,
      isOnline: navigator.onLine,
      searchQuery: '',
      selectedFolder: null,
      viewMode: 'grid',
      permissions: [],
      sharedWithMe: [],

      // 创建保险库
      createVault: async (name: string, settings: VaultSettings) => {
        set({ isLoading: true, error: null });

        try {
          // 1. 创建空的保险库数据
          const emptyVault: VaultBlob = {
            metadata: {
              id: crypto.randomUUID(),
              name,
              version: 1,
              created_at: Date.now(),
              updated_at: Date.now(),
              total_items: 0,
              total_size: 0,
              encryption: {
                algorithm: 'AES-256-GCM',
                key_id: '',
                iv: '',
                version: 1,
                key_derivation: {
                  algorithm: 'Argon2id',
                  iterations: 3,
                  memory: 65_536,
                  parallelism: 1,
                  salt: '',
                },
              },
            },
            folders: [],
            passwords: [],
            settings,
            version: 1,
            checksum: '',
            compression: {
              algorithm: 'none',
              ratio: 100,
              original_size: 0,
              compressed_size: 0,
            },
          };

          // 2. 上传到Walrus
          const masterPassword = await getMasterPassword(); // 从认证状态获取
          const blobId = await walrusService.uploadVault(emptyVault, masterPassword);

          // 3. 创建智能合约
          const { vaultId } = await suiService.createVault(name, settings, blobId);

          // 4. 更新本地状态
          const newVault: VaultInfo = {
            id: vaultId,
            owner: '', // 从钱包获取
            name,
            walrusBlobId: blobId,
            version: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            settings: {
              autoLockTimeout: settings.auto_lock_timeout,
              maxItems: settings.max_items,
              enableSharing: settings.enable_sharing,
              require2fa: settings.require_2fa,
              backupEnabled: settings.backup_enabled,
            },
          };

          set(state => ({
            vaults: [...state.vaults, newVault],
            currentVault: newVault,
            currentVaultData: emptyVault,
            isLoading: false,
          }));

          // 5. 记录审计日志
          await auditService.logAction({
            action: 'create_vault',
            resourceId: vaultId,
            success: true,
            metadata: { name, blobId },
          });
        } catch (error) {
          set({
            error: error instanceof Error ? (error as Error).message : 'Unknown error',
            isLoading: false,
          });
          throw error;
        }
      },

      // 更新保险库
      updateVault: async (vaultId: string, updates: Partial<VaultInfo>) => {
        set({ isLoading: true, error: null });

        try {
          const state = get();
          const vault = state.vaults.find(v => v.id === vaultId);
          if (!vault) {
            throw new Error('Vault not found');
          }

          const updatedVault = { ...vault, ...updates };

          // 如果有数据更新，需要重新上传到Walrus
          if (state.currentVaultData) {
            const masterPassword = await getMasterPassword();
            const newBlobId = await walrusService.uploadVault(
              state.currentVaultData,
              masterPassword
            );

            // 更新智能合约
            await suiService.updateVault(vaultId, newBlobId);
            updatedVault.walrusBlobId = newBlobId;
          }

          set(state => ({
            vaults: state.vaults.map(v => (v.id === vaultId ? updatedVault : v)),
            currentVault: state.currentVault?.id === vaultId ? updatedVault : state.currentVault,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? (error as Error).message : 'Unknown error',
            isLoading: false,
          });
          throw error;
        }
      },

      // 删除保险库
      deleteVault: async (vaultId: string) => {
        set({ isLoading: true, error: null });

        try {
          const state = get();
          const vault = state.vaults.find(v => v.id === vaultId);
          if (!vault) {
            throw new Error('Vault not found');
          }

          // 1. 从智能合约删除（如果支持）
          // 2. 从缓存删除
          await cacheService.deleteVault(vault.walrusBlobId);

          // 3. 更新本地状态
          set(state => ({
            vaults: state.vaults.filter(v => v.id !== vaultId),
            currentVault: state.currentVault?.id === vaultId ? null : state.currentVault,
            currentVaultData: state.currentVault?.id === vaultId ? null : state.currentVaultData,
            isLoading: false,
          }));

          // 4. 记录审计日志
          await auditService.logAction({
            action: 'delete_vault',
            resourceId: vaultId,
            success: true,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? (error as Error).message : 'Unknown error',
            isLoading: false,
          });
          throw error;
        }
      },

      // 设置当前保险库
      setCurrentVault: async (vault: VaultInfo | null) => {
        if (!vault) {
          set({ currentVault: null, currentVaultData: null });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const masterPassword = await getMasterPassword();
          const vaultData = await walrusService.downloadVault(vault.walrusBlobId, masterPassword);

          set({
            currentVault: vault,
            currentVaultData: vaultData,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? (error as Error).message : 'Unknown error',
            isLoading: false,
          });
          throw error;
        }
      },

      // 刷新保险库列表
      refreshVaults: async () => {
        set({ isLoading: true, error: null });

        try {
          const walletAddress = getWalletAddress(); // 从认证状态获取
          const vaults = await suiService.getUserVaults(walletAddress);

          set({
            vaults,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? (error as Error).message : 'Unknown error',
            isLoading: false,
          });
          throw error;
        }
      },

      // 添加密码
      addPassword: async (passwordData: Omit<PasswordItem, 'id' | 'created_at' | 'updated_at'>) => {
        const state = get();
        if (!state.currentVaultData) {
          throw new Error('No vault selected');
        }

        try {
          const newPassword: PasswordItem = {
            ...passwordData,
            id: crypto.randomUUID(),
            created_at: Date.now(),
            updated_at: Date.now(),
          };

          const updatedVault = {
            ...state.currentVaultData,
            passwords: [...state.currentVaultData.passwords, newPassword],
            metadata: {
              ...state.currentVaultData.metadata,
              total_items: state.currentVaultData.passwords.length + 1,
              updated_at: Date.now(),
            },
            version: state.currentVaultData.version + 1,
          };

          // 重新计算校验和
          updatedVault.checksum = await generateChecksum(updatedVault);

          // 上传更新后的数据
          const masterPassword = await getMasterPassword();
          const newBlobId = await walrusService.uploadVault(updatedVault, masterPassword);

          // 更新智能合约
          await suiService.updateVault(state.currentVault!.id, newBlobId);

          // 更新本地状态
          set({
            currentVaultData: updatedVault,
            currentVault: state.currentVault
              ? {
                  ...state.currentVault,
                  walrusBlobId: newBlobId,
                  version: updatedVault.version,
                  updatedAt: Date.now(),
                }
              : null,
          });

          // 记录审计日志
          await auditService.logAction({
            action: 'add_password',
            resourceId: newPassword.id,
            success: true,
            metadata: { title: newPassword.title },
          });
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      // 更新密码
      updatePassword: async (passwordId: string, updates: Partial<PasswordItem>) => {
        const state = get();
        if (!state.currentVaultData) {
          throw new Error('No vault selected');
        }

        try {
          const updatedPasswords = state.currentVaultData.passwords.map(p =>
            p.id === passwordId ? { ...p, ...updates, updated_at: Date.now() } : p
          );

          const updatedVault = {
            ...state.currentVaultData,
            passwords: updatedPasswords,
            metadata: {
              ...state.currentVaultData.metadata,
              updated_at: Date.now(),
            },
            version: state.currentVaultData.version + 1,
          };

          updatedVault.checksum = await generateChecksum(updatedVault);

          const masterPassword = await getMasterPassword();
          const newBlobId = await walrusService.uploadVault(updatedVault, masterPassword);

          await suiService.updateVault(state.currentVault!.id, newBlobId);

          set({
            currentVaultData: updatedVault,
            currentVault: state.currentVault
              ? {
                  ...state.currentVault,
                  walrusBlobId: newBlobId,
                  version: updatedVault.version,
                  updatedAt: Date.now(),
                }
              : null,
          });
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      // 删除密码
      deletePassword: async (passwordId: string) => {
        const state = get();
        if (!state.currentVaultData) {
          throw new Error('No vault selected');
        }

        try {
          const updatedPasswords = state.currentVaultData.passwords.filter(
            p => p.id !== passwordId
          );

          const updatedVault = {
            ...state.currentVaultData,
            passwords: updatedPasswords,
            metadata: {
              ...state.currentVaultData.metadata,
              total_items: updatedPasswords.length,
              updated_at: Date.now(),
            },
            version: state.currentVaultData.version + 1,
          };

          updatedVault.checksum = await generateChecksum(updatedVault);

          const masterPassword = await getMasterPassword();
          const newBlobId = await walrusService.uploadVault(updatedVault, masterPassword);

          await suiService.updateVault(state.currentVault!.id, newBlobId);

          set({
            currentVaultData: updatedVault,
            currentVault: state.currentVault
              ? {
                  ...state.currentVault,
                  walrusBlobId: newBlobId,
                  version: updatedVault.version,
                  updatedAt: Date.now(),
                }
              : null,
          });
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      // 搜索密码
      searchPasswords: (query: string) => {
        const state = get();
        if (!state.currentVaultData) {
          return [];
        }

        const lowercaseQuery = query.toLowerCase();
        return state.currentVaultData.passwords.filter(
          password =>
            password.title.toLowerCase().includes(lowercaseQuery) ||
            password.username?.toLowerCase().includes(lowercaseQuery) ||
            password.url?.toLowerCase().includes(lowercaseQuery) ||
            password.notes?.toLowerCase().includes(lowercaseQuery) ||
            password.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
      },

      // 分享保险库
      shareVault: async (vaultId: string, address: string, permissions: number) => {
        set({ isLoading: true, error: null });

        try {
          const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30天后过期
          const { capabilityId } = await suiService.shareVault(
            vaultId,
            address,
            permissions,
            expiresAt
          );

          set(state => ({
            permissions: [
              ...state.permissions,
              {
                id: capabilityId,
                vaultId,
                grantedTo: address,
                grantedBy: getWalletAddress(),
                permissions,
                expiresAt,
                usageCount: 0,
                maxUsage: 100,
                conditions: [],
                createdAt: Date.now(),
              },
            ],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? (error as Error).message : 'Unknown error',
            isLoading: false,
          });
          throw error;
        }
      },

      // 撤销访问权限
      revokeAccess: async (capabilityId: string) => {
        set({ isLoading: true, error: null });

        try {
          await suiService.revokeAccess(capabilityId);

          set(state => ({
            permissions: state.permissions.filter(p => p.id !== capabilityId),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? (error as Error).message : 'Unknown error',
            isLoading: false,
          });
          throw error;
        }
      },

      // 获取分享给我的保险库
      getSharedVaults: async () => {
        set({ isLoading: true, error: null });

        try {
          const walletAddress = getWalletAddress();
          const permissions = await suiService.getUserPermissions(walletAddress);

          set({
            permissions,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? (error as Error).message : 'Unknown error',
            isLoading: false,
          });
          throw error;
        }
      },

      // 清除错误
      clearError: () => set({ error: null }),

      // 设置在线状态
      setOnlineStatus: (isOnline: boolean) => set({ isOnline }),

      // 导出保险库
      exportVault: async (vaultId: string) => {
        const state = get();
        const vault = state.vaults.find(v => v.id === vaultId);
        if (!vault) {
          throw new Error('Vault not found');
        }

        const masterPassword = await getMasterPassword();
        const vaultData = await walrusService.downloadVault(vault.walrusBlobId, masterPassword);

        return JSON.stringify(vaultData, null, 2);
      },

      // 导入保险库
      importVault: async (data: string) => {
        try {
          const vaultData = JSON.parse(data) as VaultBlob;

          // 验证数据结构
          if (!vaultData.metadata || !vaultData.passwords) {
            throw new Error('Invalid vault data format');
          }

          // 创建新的保险库
          await get().createVault(vaultData.metadata.name, vaultData.settings!);
        } catch (error) {
          set({ error: `Failed to import vault: ${(error as Error).message}` });
          throw error;
        }
      },
    }),
    {
      name: 'vault-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        vaults: state.vaults,
        currentVault: state.currentVault,
        viewMode: state.viewMode,
        searchQuery: state.searchQuery,
        selectedFolder: state.selectedFolder,
      }),
    }
  )
);

// 辅助函数
async function getMasterPassword(): Promise<string> {
  // 从认证状态获取主密码
  // 这里需要实现与认证状态的集成
  return '';
}

function getWalletAddress(): string {
  // 从钱包状态获取地址
  // 这里需要实现与钱包状态的集成
  return '';
}

async function generateChecksum(vault: VaultBlob): Promise<string> {
  const jsonString = JSON.stringify(vault);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = [...new Uint8Array(hashBuffer)];
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
