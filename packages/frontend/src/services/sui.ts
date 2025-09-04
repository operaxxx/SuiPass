// Sui区块链服务实现
// packages/frontend/src/services/sui.ts

import { 
  SuiClient, 
  getFullnodeUrl,
  Transaction,
} from '@mysten/sui.js';
import { WalletAdapter } from '@suiet/wallet-kit';
import type {
  VaultInfo,
  VaultEvent,
  NetworkInfo,
} from '@/types/sui';

export class SuiService {
  private client: SuiClient;
  private wallet: WalletAdapter | null = null;
  private packageId: string;
  private network: 'mainnet' | 'testnet' | 'devnet' | 'localnet';

  constructor() {
    this.network = (process.env.VITE_SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet') || 'testnet';
    this.client = new SuiClient({
      url: getFullnodeUrl(this.network),
    });
    this.packageId = process.env.VITE_PACKAGE_ID || '';
  }

  /**
   * 设置钱包适配器
   */
  setWallet(wallet: WalletAdapter): void {
    this.wallet = wallet;
  }

  /**
   * 创建保险库
   */
  async createVault(
    name: string,
    settings: any,
    walrusBlobId: string
  ): Promise<{ vaultId: string; txDigest: string }> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = new Transaction();
      
      // 调用智能合约创建保险库
      tx.moveCall({
        target: `${this.packageId}::suipass_main::create_suipass_vault`,
        arguments: [
          tx.pure.string(name),
          tx.pure.string(walrusBlobId),
          tx.pure.u64(settings.auto_lock_timeout),
          tx.pure.u64(settings.max_items),
          tx.pure.bool(settings.enable_sharing),
          tx.pure.bool(settings.require_2fa),
          tx.pure.bool(settings.backup_enabled),
        ],
        typeArguments: [],
      });

      const result = await this.wallet.signAndExecuteTransaction({
        transaction: tx,
        account: this.wallet.account!,
        chain: this.network,
      });

      if (typeof result.effects === 'string' || !result.effects) {
        throw new Error('Transaction failed');
      }

      // 从交易结果中提取保险库ID
      const effects = result.effects as any;
      const vaultObject = effects.objectChanges?.created?.find(
        (obj: any) => obj.objectType === `${this.packageId}::suipass_main::SuiPassVault`
      );

      if (!vaultObject) {
        throw new Error('Vault object not found in transaction result');
      }

      return {
        vaultId: vaultObject.objectId,
        txDigest: result.digest,
      };
    } catch (error) {
      console.error('Failed to create vault:', error);
      throw new Error('Failed to create vault');
    }
  }

  /**
   * 更新保险库数据
   */
  async updateVault(
    vaultId: string,
    newBlobId: string
  ): Promise<{ txDigest: string }> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${this.packageId}::suipass_main::update_vault_data`,
        arguments: [
          tx.object(vaultId),
          tx.pure.string(newBlobId),
        ],
        typeArguments: [],
      });

      const result = await this.wallet.signAndExecuteTransaction({
        transaction: tx,
        account: this.wallet.account!,
        chain: this.network,
      });

      if (typeof result.effects === 'string' || !result.effects) {
        throw new Error('Transaction failed');
      }

      return {
        txDigest: result.digest,
      };
    } catch (error) {
      console.error('Failed to update vault:', error);
      throw new Error('Failed to update vault');
    }
  }

  /**
   * 分享保险库访问权限
   */
  async shareVault(
    vaultId: string,
    grantedTo: string,
    permissions: number,
    expiresAt: number,
    maxUsage: number = 100
  ): Promise<{ capabilityId: string; txDigest: string }> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${this.packageId}::suipass_main::share_vault_access`,
        arguments: [
          tx.object(vaultId),
          tx.pure.address(grantedTo),
          tx.pure.u64( permissions),
          tx.pure.u64( expiresAt),
          tx.pure.u64( maxUsage),
          tx.pure.vector('string', []), // conditions
        ],
        typeArguments: [],
      });

      const result = await this.wallet.signAndExecuteTransaction({
        transaction: tx,
        account: this.wallet.account!,
        chain: this.network,
      });

      if (typeof result.effects === 'string' || !result.effects) {
        throw new Error('Transaction failed');
      }

      // 从交易结果中提取权限对象ID
      const effects = result.effects as any;
      const capabilityObject = effects.objectChanges?.created?.find(
        (obj: any) => obj.objectType === `${this.packageId}::permission_manager::PermissionCapability`
      );

      if (!capabilityObject) {
        throw new Error('Permission capability object not found');
      }

      return {
        capabilityId: capabilityObject.objectId,
        txDigest: result.digest,
      };
    } catch (error) {
      console.error('Failed to share vault:', error);
      throw new Error('Failed to share vault');
    }
  }

  /**
   * 撤销访问权限
   */
  async revokeAccess(
    capabilityId: string
  ): Promise<{ txDigest: string }> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${this.packageId}::permission_manager::revoke_capability`,
        arguments: [
          tx.object(capabilityId),
        ],
        typeArguments: [],
      });

      const result = await this.wallet.signAndExecuteTransaction({
        transaction: tx,
        account: this.wallet.account!,
        chain: this.network,
      });

      if (typeof result.effects === 'string' || !result.effects) {
        throw new Error('Transaction failed');
      }

      return {
        txDigest: result.digest,
      };
    } catch (error) {
      console.error('Failed to revoke access:', error);
      throw new Error('Failed to revoke access');
    }
  }

  /**
   * 获取保险库信息
   */
  async getVaultInfo(vaultId: string): Promise<VaultInfo> {
    try {
      const object = await this.client.getObject({
        id: vaultId,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      if (!object.data?.content) {
        throw new Error('Vault object not found');
      }

      const content = object.data.content as any;
      const fields = content.fields;

      return {
        id: vaultId,
        owner: fields.owner,
        name: fields.name,
        walrusBlobId: fields.walrus_blob_id,
        version: fields.version,
        createdAt: fields.created_at,
        updatedAt: fields.updated_at,
        settings: {
          autoLockTimeout: fields.settings.auto_lock_timeout,
          maxItems: fields.settings.max_items,
          enableSharing: fields.settings.enable_sharing,
          require2fa: fields.settings.require_2fa,
          backupEnabled: fields.settings.backup_enabled,
        },
      };
    } catch (error) {
      console.error('Failed to get vault info:', error);
      throw new Error('Failed to get vault info');
    }
  }

  /**
   * 获取用户的保险库列表
   */
  async getUserVaults(ownerAddress: string): Promise<VaultInfo[]> {
    try {
      // 查询用户拥有的保险库对象
      const objects = await this.client.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: `${this.packageId}::suipass_main::SuiPassVault`,
        },
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      const vaults: VaultInfo[] = [];

      for (const object of objects.data) {
        if (object.data?.content) {
          const content = object.data.content as any;
          const fields = content.fields;

          vaults.push({
            id: object.data.objectId,
            owner: fields.owner,
            name: fields.name,
            walrusBlobId: fields.walrus_blob_id,
            version: fields.version,
            createdAt: fields.created_at,
            updatedAt: fields.updated_at,
            settings: {
              autoLockTimeout: fields.settings.auto_lock_timeout,
              maxItems: fields.settings.max_items,
              enableSharing: fields.settings.enable_sharing,
              require2fa: fields.settings.require_2fa,
              backupEnabled: fields.settings.backup_enabled,
            },
          });
        }
      }

      return vaults;
    } catch (error) {
      console.error('Failed to get user vaults:', error);
      throw new Error('Failed to get user vaults');
    }
  }

  /**
   * 获取权限能力对象
   */
  async getPermissionCapability(capabilityId: string): Promise<PermissionCapability> {
    try {
      const object = await this.client.getObject({
        id: capabilityId,
        options: {
          showContent: true,
        },
      });

      if (!object.data?.content) {
        throw new Error('Permission capability not found');
      }

      const content = object.data.content as any;
      const fields = content.fields;

      return {
        id: capabilityId,
        vaultId: fields.vault_id,
        grantedTo: fields.granted_to,
        grantedBy: fields.granted_by,
        permissions: fields.permissions,
        expiresAt: fields.expires_at,
        usageCount: fields.usage_count,
        maxUsage: fields.max_usage,
        conditions: fields.conditions,
        createdAt: fields.created_at,
      };
    } catch (error) {
      console.error('Failed to get permission capability:', error);
      throw new Error('Failed to get permission capability');
    }
  }

  /**
   * 获取用户的权限列表
   */
  async getUserPermissions(userAddress: string): Promise<PermissionCapability[]> {
    try {
      const objects = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${this.packageId}::permission_manager::PermissionCapability`,
        },
        options: {
          showContent: true,
        },
      });

      const permissions: PermissionCapability[] = [];

      for (const object of objects.data) {
        if (object.data?.content) {
          const content = object.data.content as any;
          const fields = content.fields;

          permissions.push({
            id: object.data.objectId,
            vaultId: fields.vault_id,
            grantedTo: fields.granted_to,
            grantedBy: fields.granted_by,
            permissions: fields.permissions,
            expiresAt: fields.expires_at,
            usageCount: fields.usage_count,
            maxUsage: fields.max_usage,
            conditions: fields.conditions,
            createdAt: fields.created_at,
          });
        }
      }

      return permissions;
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      throw new Error('Failed to get user permissions');
    }
  }

  /**
   * 监听保险库事件
   */
  async subscribeToVaultEvents(
    vaultId: string,
    callback: (event: VaultEvent) => void
  ): Promise<() => void> {
    try {
      const unsubscribe = await this.client.subscribeEvent({
        filter: {
          MoveEventType: `${this.packageId}::vault_core::VaultCreated`,
        },
        onEvent: (event: any) => {
          // 处理事件并调用回调
          const vaultEvent = this.parseVaultEvent(event);
          if (vaultEvent && vaultEvent.vaultId === vaultId) {
            callback(vaultEvent);
          }
        },
      });

      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to vault events:', error);
      throw new Error('Failed to subscribe to vault events');
    }
  }

  /**
   * 估算交易Gas费用
   */
  async estimateGas(transaction: Transaction): Promise<number> {
    try {
      const result = await this.client.devInspectTransactionBlock({
        transaction,
        sender: this.wallet?.account?.address || '0x0',
      });

      if (!result.effects?.gasUsed) {
        throw new Error('Failed to estimate gas');
      }

      return parseInt(result.effects.gasUsed);
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      throw new Error('Failed to estimate gas');
    }
  }

  /**
   * 获取网络信息
   */
  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const checkpoint = await this.client.getLatestCheckpointSequenceNumber();
      const protocol = await this.client.getProtocolConfig();
      
      return {
        network: this.network,
        checkpoint,
        protocolVersion: protocol.protocol_version,
        chainId: protocol.chain_id,
        systemStateVersion: protocol.system_state_version,
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw new Error('Failed to get network info');
    }
  }

  /**
   * 解析保险库事件
   */
  private parseVaultEvent(event: any): VaultEvent | null {
    try {
      const eventType = event.type;
      const parsedJson = event.parsedJson as any;

      switch (eventType) {
        case `${this.packageId}::vault_core::VaultCreated`:
          return {
            type: 'created',
            vaultId: parsedJson.vault_id,
            owner: parsedJson.owner,
            name: parsedJson.name,
            timestamp: parsedJson.timestamp,
          };
        
        case `${this.packageId}::vault_core::VaultUpdated`:
          return {
            type: 'updated',
            vaultId: parsedJson.vault_id,
            oldBlobId: parsedJson.old_walrus_blob_id,
            newBlobId: parsedJson.new_walrus_blob_id,
            version: parsedJson.version,
            timestamp: parsedJson.timestamp,
          };
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Failed to parse vault event:', error);
      return null;
    }
  }
}

// 类型定义
export interface VaultInfo {
  id: string;
  owner: string;
  name: string;
  walrusBlobId: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  settings: {
    autoLockTimeout: number;
    maxItems: number;
    enableSharing: boolean;
    require2fa: boolean;
    backupEnabled: boolean;
  };
}

export interface VaultEvent {
  type: 'created' | 'updated' | 'shared' | 'revoked';
  vaultId: string;
  timestamp: number;
  [key: string]: any;
}

export interface NetworkInfo {
  network: string;
  checkpoint: number;
  protocolVersion: number;
  chainId: string;
  systemStateVersion: number;
}

// 权限常量
export const PERMISSIONS = {
  VIEW: 1,
  EDIT: 2,
  SHARE: 4,
  DELETE: 8,
  ADMIN: 16,
} as const;

export type PermissionType = keyof typeof PERMISSIONS;