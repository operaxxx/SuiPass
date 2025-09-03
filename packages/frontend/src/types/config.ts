/**
 * Configuration types for SuiPass application
 * Defines all environment variables and their types
 */

export interface AppConfig {
  // Network Configuration
  network: {
    sui: {
      network: 'local' | 'devnet' | 'testnet' | 'mainnet';
      rpcUrl: string;
      packageId?: string;
    };
    walrus: {
      rpcUrl: string;
      siteUrl?: string;
      enabled: boolean;
    };
  };

  // Application Configuration
  app: {
    name: string;
    version: string;
    autoLockTimeout: number;
    enableLocalMode: boolean;
    enableZkLogin: boolean;
  };

  // Security Configuration
  security: {
    cspEnabled: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
    encryptionIterations: number;
    encryptionMemory: number;
    encryptionParallelism: number;
  };

  // Performance Configuration
  performance: {
    retryAttempts: number;
    retryDelay: number;
    cacheTtl: number;
    requestTimeout: number;
  };

  // Feature Flags
  features: {
    enableWalrus: boolean;
    enableAdvancedSharing: boolean;
    enableBackup: boolean;
    enableAnalytics: boolean;
    enableDebugMode: boolean;
  };

  // API Configuration
  api: {
    baseUrl?: string;
    timeout: number;
    retries: number;
  };
}

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'test' | 'production';
  VITE_SUI_NETWORK: 'local' | 'devnet' | 'testnet' | 'mainnet';
  VITE_SUI_RPC_URL: string;
  VITE_SUI_PACKAGE_ID?: string;
  VITE_WALRUS_RPC_URL: string;
  VITE_WALRUS_SITE_URL?: string;
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_ENABLE_ZKLOGIN: 'true' | 'false';
  VITE_ENABLE_LOCAL_MODE: 'true' | 'false';
  VITE_AUTO_LOCK_TIMEOUT: string;
  VITE_CSP_ENABLED: 'true' | 'false';
  VITE_MAX_LOGIN_ATTEMPTS: string;
  VITE_SESSION_TIMEOUT: string;
  VITE_RETRY_ATTEMPTS: string;
  VITE_RETRY_DELAY: string;
  VITE_CACHE_TTL: string;
  VITE_ENABLE_WALRUS: 'true' | 'false';
  VITE_ENABLE_ADVANCED_SHARING: 'true' | 'false';
  VITE_ENABLE_BACKUP: 'true' | 'false';
  VITE_ENABLE_ANALYTICS: 'true' | 'false';
  VITE_ENABLE_DEBUG_MODE: 'true' | 'false';
  VITE_API_BASE_URL?: string;
  VITE_API_TIMEOUT: string;
  VITE_API_RETRIES: string;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'url' | 'email';
    required: boolean;
    defaultValue?: any;
    validator?: (value: any) => boolean;
    description: string;
  };
}