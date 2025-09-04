// Common type definitions used across the application
export interface Vault {
  id: string;
  name: string;
  description?: string;
  items: PasswordItem[];
  folders: Folder[];
  settings: VaultSettings;
  created_at: number;
  updated_at: number;
  version: number;
  is_synced?: boolean;
  blob_id?: string;
}

export interface PasswordItem {
  id: string;
  type: 'login' | 'card' | 'identity' | 'secure-note';
  title: string;
  url?: string;
  username?: string;
  password?: string;
  notes?: string;
  favorite: boolean;
  folder_id?: string;
  tags: string[];
  created_at: number;
  updated_at: number;
  custom_fields?: Record<string, string>;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  parent_id?: string;
  created_at: number;
  updated_at: number;
}

export interface VaultSettings {
  autoLockTimeout: number;
  enableBiometrics: boolean;
  enableSync: boolean;
  theme: 'light' | 'dark' | 'system';
  defaultPasswordLength: number;
  requireMasterPassword: boolean;
  enableTwoFactor: boolean;
}

export interface EncryptionResult {
  algorithm: 'AES-256-GCM';
  ciphertext: Uint8Array;
  iv: Uint8Array;
  tag: Uint8Array;
  salt: Uint8Array;
}

export interface DecryptionResult {
  plaintext: Uint8Array;
  verified: boolean;
}

export interface PasswordStrength {
  score: number;
  warnings: string[];
  suggestions: string[];
  crackTime: string;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
}

export interface StorageQuota {
  used: number;
  total: number;
  available: number;
  percentage: number;
}

export interface SyncStatus {
  lastSync: number | null;
  isSyncing: boolean;
  hasConflict: boolean;
  pendingUploads: number;
  pendingDownloads: number;
}

export interface AuditEvent {
  id: string;
  action: string;
  resource: string;
  resource_id: string;
  user_id: string;
  timestamp: number;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
}

export interface Permission {
  id: string;
  user_id: string;
  resource_id: string;
  resource_type: 'vault' | 'folder' | 'item';
  permissions: string[];
  granted_by: string;
  granted_at: number;
  expires_at?: number;
  is_active: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  security_alerts: boolean;
  sync_notifications: boolean;
  weekly_reports: boolean;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  date_format: string;
  currency?: string;
  notifications: NotificationSettings;
}

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
  stack?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}