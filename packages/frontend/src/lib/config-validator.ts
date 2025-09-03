/**
 * Configuration validation utilities
 * Provides type-safe configuration loading and validation
 */

import { AppConfig, EnvironmentConfig, ConfigValidationResult, ConfigSchema } from '../types/config';

/**
 * Configuration schema validation rules
 */
const CONFIG_SCHEMA: ConfigSchema = {
  // Network Configuration
  VITE_SUI_NETWORK: {
    type: 'string',
    required: true,
    defaultValue: 'testnet',
    validator: (value: string) => ['local', 'devnet', 'testnet', 'mainnet'].includes(value),
    description: 'Sui blockchain network identifier'
  },
  VITE_SUI_RPC_URL: {
    type: 'url',
    required: true,
    description: 'Sui blockchain RPC endpoint URL'
  },
  VITE_SUI_PACKAGE_ID: {
    type: 'string',
    required: false,
    validator: (value: string) => /^0x[a-fA-F0-9]{40,}$/.test(value),
    description: 'Deployed smart contract package ID'
  },
  VITE_WALRUS_RPC_URL: {
    type: 'url',
    required: true,
    description: 'Walrus storage RPC endpoint URL'
  },
  VITE_WALRUS_SITE_URL: {
    type: 'url',
    required: false,
    description: 'Walrus site URL for file access'
  },

  // Application Configuration
  VITE_APP_NAME: {
    type: 'string',
    required: true,
    defaultValue: 'SuiPass',
    description: 'Application name'
  },
  VITE_APP_VERSION: {
    type: 'string',
    required: true,
    defaultValue: '1.0.0',
    description: 'Application version'
  },
  VITE_ENABLE_ZKLOGIN: {
    type: 'boolean',
    required: true,
    defaultValue: 'true',
    description: 'Enable Sui zkLogin feature'
  },
  VITE_ENABLE_LOCAL_MODE: {
    type: 'boolean',
    required: true,
    defaultValue: 'true',
    description: 'Enable local development mode'
  },
  VITE_AUTO_LOCK_TIMEOUT: {
    type: 'number',
    required: true,
    defaultValue: '300000',
    validator: (value: number) => value > 0 && value <= 3600000,
    description: 'Auto-lock timeout in milliseconds'
  },

  // Security Configuration
  VITE_CSP_ENABLED: {
    type: 'boolean',
    required: true,
    defaultValue: 'true',
    description: 'Enable Content Security Policy'
  },
  VITE_MAX_LOGIN_ATTEMPTS: {
    type: 'number',
    required: true,
    defaultValue: '3',
    validator: (value: number) => value > 0 && value <= 10,
    description: 'Maximum login attempts before lockout'
  },
  VITE_SESSION_TIMEOUT: {
    type: 'number',
    required: true,
    defaultValue: '3600000',
    validator: (value: number) => value > 0 && value <= 86400000,
    description: 'Session timeout in milliseconds'
  },

  // Performance Configuration
  VITE_RETRY_ATTEMPTS: {
    type: 'number',
    required: true,
    defaultValue: '3',
    validator: (value: number) => value >= 0 && value <= 10,
    description: 'Number of retry attempts for failed requests'
  },
  VITE_RETRY_DELAY: {
    type: 'number',
    required: true,
    defaultValue: '1000',
    validator: (value: number) => value > 0 && value <= 10000,
    description: 'Delay between retry attempts in milliseconds'
  },
  VITE_CACHE_TTL: {
    type: 'number',
    required: true,
    defaultValue: '300000',
    validator: (value: number) => value > 0 && value <= 86400000,
    description: 'Cache time-to-live in milliseconds'
  },

  // Feature Flags
  VITE_ENABLE_WALRUS: {
    type: 'boolean',
    required: true,
    defaultValue: 'true',
    description: 'Enable Walrus storage integration'
  },
  VITE_ENABLE_ADVANCED_SHARING: {
    type: 'boolean',
    required: true,
    defaultValue: 'true',
    description: 'Enable advanced sharing features'
  },
  VITE_ENABLE_BACKUP: {
    type: 'boolean',
    required: true,
    defaultValue: 'true',
    description: 'Enable backup functionality'
  },
  VITE_ENABLE_ANALYTICS: {
    type: 'boolean',
    required: true,
    defaultValue: 'false',
    description: 'Enable analytics tracking'
  },
  VITE_ENABLE_DEBUG_MODE: {
    type: 'boolean',
    required: true,
    defaultValue: 'false',
    description: 'Enable debug mode logging'
  },

  // API Configuration
  VITE_API_BASE_URL: {
    type: 'url',
    required: false,
    description: 'Base URL for API endpoints'
  },
  VITE_API_TIMEOUT: {
    type: 'number',
    required: true,
    defaultValue: '30000',
    validator: (value: number) => value > 0 && value <= 120000,
    description: 'API request timeout in milliseconds'
  },
  VITE_API_RETRIES: {
    type: 'number',
    required: true,
    defaultValue: '3',
    validator: (value: number) => value >= 0 && value <= 5,
    description: 'Number of API retry attempts'
  }
};

/**
 * Type guards for validation
 */
function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isBoolean(value: string): boolean {
  return ['true', 'false'].includes(value.toLowerCase());
}

function isNumber(value: string): boolean {
  return !isNaN(Number(value)) && isFinite(Number(value));
}

/**
 * Convert environment variable to appropriate type
 */
function convertEnvValue(value: string, type: string): any {
  switch (type) {
    case 'boolean':
      return value.toLowerCase() === 'true';
    case 'number':
      return Number(value);
    case 'url':
    case 'string':
    default:
      return value;
  }
}

/**
 * Validate a single configuration value
 */
function validateConfigValue(key: string, value: string, schema: ConfigSchema): string[] {
  const errors: string[] = [];
  const config = schema[key];

  if (!config) {
    return [`Unknown configuration key: ${key}`];
  }

  // Check if value is empty but required
  if (!value && config.required) {
    errors.push(`Required configuration ${key} is missing or empty`);
    return errors;
  }

  // Use default value if empty and not required
  if (!value && config.defaultValue) {
    return errors;
  }

  // Type validation
  if (value) {
    switch (config.type) {
      case 'url':
        if (!isUrl(value)) {
          errors.push(`${key} must be a valid URL: ${value}`);
        }
        break;
      case 'boolean':
        if (!isBoolean(value)) {
          errors.push(`${key} must be a boolean (true/false): ${value}`);
        }
        break;
      case 'number':
        if (!isNumber(value)) {
          errors.push(`${key} must be a number: ${value}`);
        }
        break;
    }

    // Custom validator
    if (config.validator) {
      const convertedValue = convertEnvValue(value, config.type);
      if (!config.validator(convertedValue)) {
        errors.push(`${key} failed custom validation: ${value}`);
      }
    }
  }

  return errors;
}

/**
 * Validate all environment variables
 */
export function validateEnvironmentVariables(envVars: Record<string, string>): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check all required configuration keys
  Object.entries(CONFIG_SCHEMA).forEach(([key, config]) => {
    const value = envVars[key];
    const valueErrors = validateConfigValue(key, value || '', CONFIG_SCHEMA);
    errors.push(...valueErrors);

    // Check for deprecated or recommended configurations
    if (!value && config.required && config.defaultValue) {
      warnings.push(`${key} is using default value: ${config.defaultValue}`);
    }
  });

  // Check for unknown environment variables
  Object.keys(envVars).forEach(key => {
    if (key.startsWith('VITE_') && !CONFIG_SCHEMA[key]) {
      warnings.push(`Unknown environment variable: ${key}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get configuration with defaults applied
 */
export function getConfigWithDefaults(envVars: Record<string, string>): EnvironmentConfig {
  const config: Partial<EnvironmentConfig> = {};

  Object.entries(CONFIG_SCHEMA).forEach(([key, schemaConfig]) => {
    const value = envVars[key] || schemaConfig.defaultValue;
    if (value !== undefined) {
      config[key as keyof EnvironmentConfig] = convertEnvValue(value, schemaConfig.type);
    }
  });

  // Set NODE_ENV based on VITE_SUI_NETWORK if not set
  if (!config.NODE_ENV) {
    config.NODE_ENV = envVars.NODE_ENV || (envVars.VITE_SUI_NETWORK === 'local' ? 'development' : 'production');
  }

  return config as EnvironmentConfig;
}

/**
 * Load and validate environment configuration
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  // Get all environment variables
  const envVars: Record<string, string> = {};
  
  // Import meta environment variables in Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    Object.assign(envVars, import.meta.env);
  }

  // Fallback to process.env for Node.js environments
  if (typeof process !== 'undefined' && process.env) {
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('VITE_') || key === 'NODE_ENV') {
        envVars[key] = process.env[key] || '';
      }
    });
  }

  // Validate configuration
  const validation = validateEnvironmentVariables(envVars);
  
  if (!validation.isValid) {
    console.error('Configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    
    if (validation.warnings.length > 0) {
      console.warn('Configuration warnings:');
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    // In development, we can continue with warnings
    // In production, we might want to throw an error
    if (envVars.NODE_ENV === 'production') {
      throw new Error('Invalid configuration in production environment');
    }
  }

  return getConfigWithDefaults(envVars);
}

/**
 * Convert environment configuration to application configuration
 */
export function convertToAppConfig(envConfig: EnvironmentConfig): AppConfig {
  return {
    network: {
      sui: {
        network: envConfig.VITE_SUI_NETWORK,
        rpcUrl: envConfig.VITE_SUI_RPC_URL,
        packageId: envConfig.VITE_SUI_PACKAGE_ID
      },
      walrus: {
        rpcUrl: envConfig.VITE_WALRUS_RPC_URL,
        siteUrl: envConfig.VITE_WALRUS_SITE_URL,
        enabled: envConfig.VITE_ENABLE_WALRUS
      }
    },
    app: {
      name: envConfig.VITE_APP_NAME,
      version: envConfig.VITE_APP_VERSION,
      autoLockTimeout: envConfig.VITE_AUTO_LOCK_TIMEOUT,
      enableLocalMode: envConfig.VITE_ENABLE_LOCAL_MODE,
      enableZkLogin: envConfig.VITE_ENABLE_ZKLOGIN
    },
    security: {
      cspEnabled: envConfig.VITE_CSP_ENABLED,
      maxLoginAttempts: envConfig.VITE_MAX_LOGIN_ATTEMPTS,
      sessionTimeout: envConfig.VITE_SESSION_TIMEOUT,
      encryptionIterations: 3,
      encryptionMemory: 65536,
      encryptionParallelism: 4
    },
    performance: {
      retryAttempts: envConfig.VITE_RETRY_ATTEMPTS,
      retryDelay: envConfig.VITE_RETRY_DELAY,
      cacheTtl: envConfig.VITE_CACHE_TTL,
      requestTimeout: envConfig.VITE_API_TIMEOUT
    },
    features: {
      enableWalrus: envConfig.VITE_ENABLE_WALRUS,
      enableAdvancedSharing: envConfig.VITE_ENABLE_ADVANCED_SHARING,
      enableBackup: envConfig.VITE_ENABLE_BACKUP,
      enableAnalytics: envConfig.VITE_ENABLE_ANALYTICS,
      enableDebugMode: envConfig.VITE_ENABLE_DEBUG_MODE
    },
    api: {
      baseUrl: envConfig.VITE_API_BASE_URL,
      timeout: envConfig.VITE_API_TIMEOUT,
      retries: envConfig.VITE_API_RETRIES
    }
  };
}