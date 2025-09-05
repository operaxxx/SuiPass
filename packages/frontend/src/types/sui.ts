// Sui related type definitions
export interface SuiTransactionResponse {
  digest: string;
  effects: {
    status: { status: 'success' | 'failure' };
    created?: Array<SuiObjectReference>;
    mutated?: Array<SuiObjectReference>;
    deleted?: Array<SuiObjectReference>;
  };
  timestamp?: number;
}

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

export interface PermissionCapability {
  id: string;
  vaultId: string;
  grantedTo: string;
  grantedBy: string;
  permissions: number;
  expiresAt: number;
  usageCount: number;
  maxUsage: number;
  conditions: string[];
  createdAt: number;
}

export interface SuiObjectReference {
  reference: {
    objectId: string;
  };
}

export interface VaultRegistry {
  id: string;
  owner: string;
  walrus_blob_id: string;
  created_at: number;
  version: number;
}

export interface AccessCapability {
  id: string;
  vault_id: string;
  granted_to: string;
  granted_by: string;
  permission_level: number;
  expires_at: number;
  usage_count: number;
  max_usage: number;
  created_at: number;
}

export interface WalletAdapter {
  name: string;
  icon: string;
  connecting: boolean;
  connected: boolean;
  address?: string;
  accounts: Array<{ address: string }>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndExecuteTransaction: (input: {
    transaction: any;
    account: { address: string };
    chain: string;
  }) => Promise<SuiTransactionResponse>;
  signAndExecuteTransactionBlock: (input: {
    transactionBlock: any;
    account: { address: string };
    chain: string;
  }) => Promise<SuiTransactionResponse>;
}

export interface SuiConfig {
  network: 'mainnet' | 'testnet' | 'devnet' | 'local';
  rpcUrl: string;
  faucetUrl?: string;
}

// Type definitions for missing types
export interface StorageReference {
  blob_id: string;
  size: number;
  created_at: number;
}

export interface AuditLog {
  id: string;
  action: string;
  user_id: string;
  vault_id: string;
  timestamp: number;
  details: Record<string, any>;
}
