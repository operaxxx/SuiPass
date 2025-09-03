/**
 * Unified configuration management for SuiPass
 * Provides type-safe access to all configuration values
 */

import { AppConfig } from '../types/config';
import { loadEnvironmentConfig, convertToAppConfig } from './config-validator';

/**
 * Global configuration singleton
 */
class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;
  private envConfig: any;

  private constructor() {
    this.envConfig = loadEnvironmentConfig();
    this.config = convertToAppConfig(this.envConfig);
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get the complete configuration
   */
  public getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * Get network configuration
   */
  public getNetworkConfig() {
    return this.config.network;
  }

  /**
   * Get Sui network configuration
   */
  public getSuiConfig() {
    return this.config.network.sui;
  }

  /**
   * Get Walrus configuration
   */
  public getWalrusConfig() {
    return this.config.network.walrus;
  }

  /**
   * Get application configuration
   */
  public getAppConfig() {
    return this.config.app;
  }

  /**
   * Get security configuration
   */
  public getSecurityConfig() {
    return this.config.security;
  }

  /**
   * Get performance configuration
   */
  public getPerformanceConfig() {
    return this.config.performance;
  }

  /**
   * Get feature flags
   */
  public getFeatures() {
    return this.config.features;
  }

  /**
   * Get API configuration
   */
  public getApiConfig() {
    return this.config.api;
  }

  /**
   * Check if a feature is enabled
   */
  public isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  /**
   * Get current network
   */
  public getCurrentNetwork() {
    return this.config.network.sui.network;
  }

  /**
   * Check if running in local mode
   */
  public isLocalMode(): boolean {
    return this.config.app.enableLocalMode && this.getCurrentNetwork() === 'local';
  }

  /**
   * Check if running in development mode
   */
  public isDevelopment(): boolean {
    return this.envConfig.NODE_ENV === 'development';
  }

  /**
   * Check if running in test mode
   */
  public isTest(): boolean {
    return this.envConfig.NODE_ENV === 'test';
  }

  /**
   * Check if running in production mode
   */
  public isProduction(): boolean {
    return this.envConfig.NODE_ENV === 'production';
  }

  /**
   * Get environment-specific RPC URL
   */
  public getSuiRpcUrl(): string {
    const { network, rpcUrl } = this.getSuiConfig();
    
    // Override for local network if not explicitly set
    if (network === 'local' && rpcUrl === 'https://fullnode.testnet.sui.io:443') {
      return 'http://127.0.0.1:9000';
    }
    
    return rpcUrl;
  }

  /**
   * Get package ID with fallback for different networks
   */
  public getPackageId(): string | undefined {
    const packageId = this.getSuiConfig().packageId;
    
    // In development/test mode, we might not have a deployed package
    if (!packageId && (this.isDevelopment() || this.isTest())) {
      return undefined;
    }
    
    return packageId;
  }

  /**
   * Get configuration for display (hiding sensitive values)
   */
  public getSafeConfig(): Partial<AppConfig> {
    const config = this.getConfig();
    
    // Remove sensitive information
    return {
      ...config,
      network: {
        ...config.network,
        sui: {
          ...config.network.sui,
          packageId: config.network.sui.packageId ? '[HIDDEN]' : undefined
        }
      }
    };
  }

  /**
   * Reload configuration (useful for testing)
   */
  public reload(): void {
    this.envConfig = loadEnvironmentConfig();
    this.config = convertToAppConfig(this.envConfig);
  }
}

/**
 * Export singleton instance
 */
export const config = ConfigManager.getInstance();

/**
 * Export utility functions for backward compatibility
 */
export function getAppConfig(): AppConfig {
  return config.getConfig();
}

export function getSuiRpcUrl(): string {
  return config.getSuiRpcUrl();
}

export function getCurrentNetwork() {
  return config.getCurrentNetwork();
}

export function isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
  return config.isFeatureEnabled(feature);
}

export function isLocalMode(): boolean {
  return config.isLocalMode();
}

export function isDevelopment(): boolean {
  return config.isDevelopment();
}

export function isProduction(): boolean {
  return config.isProduction();
}