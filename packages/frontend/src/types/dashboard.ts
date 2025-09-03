// Type definitions for dashboard components
export interface DashboardStats {
  totalItems: number;
  totalVaults: number;
  categories: number;
  weakPasswords: number;
}

export interface SecurityMetrics {
  isVaultLocked: boolean;
  hasMasterPassword: boolean;
  lastAccess?: number;
  encryptionMethod: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color: string;
}

export interface RecentItem extends VaultItem {
  lastAccessed: number;
}