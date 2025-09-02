export interface VaultItem {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface Vault {
  id: string;
  name: string;
  description?: string;
  items: VaultItem[];
  ownerId: string;
  storageBlobId?: string;
  isEncrypted: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SharePermission {
  vaultId: string;
  recipientAddress: string;
  permissionLevel: 'view' | 'edit' | 'admin';
  expiresAt?: number;
  grantedBy: string;
  grantedAt: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  autoLockTimeout: number; // in minutes
  enableBiometrics: boolean;
  enableTwoFactor: boolean;
  defaultPasswordLength: number;
  passwordGenerationOptions: {
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
  };
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'vault_access' | 'password_change' | 'share_created' | 'export';
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
}

export interface BackupMetadata {
  id: string;
  blobId: string;
  timestamp: number;
  size: number;
  checksum: string;
  description?: string;
}