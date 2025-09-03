/**
 * Configuration Manager Tests
 * Tests the configuration management system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { config } from '../lib/config';
import { validateEnvironmentVariables, loadEnvironmentConfig, convertToAppConfig } from '../lib/config-validator';

// Mock environment variables
const mockEnvVars = {
  VITE_SUI_NETWORK: 'testnet',
  VITE_SUI_RPC_URL: 'https://fullnode.testnet.sui.io:443',
  VITE_SUI_PACKAGE_ID: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  VITE_WALRUS_RPC_URL: 'https://walrus.testnet.rpc',
  VITE_WALRUS_SITE_URL: 'https://walrus.site',
  VITE_APP_NAME: 'SuiPass',
  VITE_APP_VERSION: '1.0.0',
  VITE_ENABLE_ZKLOGIN: 'true',
  VITE_ENABLE_LOCAL_MODE: 'true',
  VITE_AUTO_LOCK_TIMEOUT: '300000',
  VITE_CSP_ENABLED: 'true',
  VITE_MAX_LOGIN_ATTEMPTS: '3',
  VITE_SESSION_TIMEOUT: '3600000',
  VITE_RETRY_ATTEMPTS: '3',
  VITE_RETRY_DELAY: '1000',
  VITE_CACHE_TTL: '300000',
  VITE_ENABLE_WALRUS: 'true',
  VITE_ENABLE_ADVANCED_SHARING: 'true',
  VITE_ENABLE_BACKUP: 'true',
  VITE_ENABLE_ANALYTICS: 'false',
  VITE_ENABLE_DEBUG_MODE: 'false',
  VITE_API_TIMEOUT: '30000',
  VITE_API_RETRIES: '3',
  NODE_ENV: 'test'
};

describe('Configuration Management', () => {
  let originalEnv: any;

  beforeEach(() => {
    // Store original environment
    originalEnv = {
      import: { meta: { env: {} } },
      process: { env: {} }
    };

    // Mock import.meta.env
    vi.stubGlobal('import', {
      meta: {
        env: { ...mockEnvVars }
      }
    });

    // Mock process.env
    vi.stubGlobal('process', {
      env: { ...mockEnvVars }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Reset config singleton
    (config as any).reload();
  });

  describe('Environment Validation', () => {
    it('should validate correct environment variables', () => {
      const result = validateEnvironmentVariables(mockEnvVars);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required variables', () => {
      const incompleteEnv = { ...mockEnvVars };
      delete incompleteEnv.VITE_SUI_NETWORK;
      
      const result = validateEnvironmentVariables(incompleteEnv);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Required configuration VITE_SUI_NETWORK is missing or empty');
    });

    it('should validate network values', () => {
      const invalidEnv = { ...mockEnvVars, VITE_SUI_NETWORK: 'invalid' };
      
      const result = validateEnvironmentVariables(invalidEnv);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Invalid network'))).toBe(true);
    });

    it('should validate URLs', () => {
      const invalidEnv = { ...mockEnvVars, VITE_SUI_RPC_URL: 'not-a-url' };
      
      const result = validateEnvironmentVariables(invalidEnv);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('must be a valid URL'))).toBe(true);
    });

    it('should validate boolean values', () => {
      const invalidEnv = { ...mockEnvVars, VITE_ENABLE_ZKLOGIN: 'maybe' };
      
      const result = validateEnvironmentVariables(invalidEnv);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('must be a boolean'))).toBe(true);
    });

    it('should validate numeric values', () => {
      const invalidEnv = { ...mockEnvVars, VITE_AUTO_LOCK_TIMEOUT: 'not-a-number' };
      
      const result = validateEnvironmentVariables(invalidEnv);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('must be a number'))).toBe(true);
    });
  });

  describe('Configuration Loading', () => {
    it('should load environment configuration', () => {
      const envConfig = loadEnvironmentConfig();
      
      expect(envConfig.VITE_SUI_NETWORK).toBe('testnet');
      expect(envConfig.VITE_APP_NAME).toBe('SuiPass');
      expect(envConfig.NODE_ENV).toBe('test');
    });

    it('should convert to app configuration', () => {
      const envConfig = loadEnvironmentConfig();
      const appConfig = convertToAppConfig(envConfig);
      
      expect(appConfig.network.sui.network).toBe('testnet');
      expect(appConfig.app.name).toBe('SuiPass');
      expect(appConfig.security.cspEnabled).toBe(true);
      expect(appConfig.features.enableWalrus).toBe(true);
    });
  });

  describe('Config Manager', () => {
    it('should provide network configuration', () => {
      const networkConfig = config.getNetworkConfig();
      
      expect(networkConfig.sui.network).toBe('testnet');
      expect(networkConfig.sui.rpcUrl).toBe('https://fullnode.testnet.sui.io:443');
      expect(networkConfig.walrus.enabled).toBe(true);
    });

    it('should provide app configuration', () => {
      const appConfig = config.getAppConfig();
      
      expect(appConfig.name).toBe('SuiPass');
      expect(appConfig.version).toBe('1.0.0');
      expect(appConfig.enableLocalMode).toBe(true);
    });

    it('should provide security configuration', () => {
      const securityConfig = config.getSecurityConfig();
      
      expect(securityConfig.cspEnabled).toBe(true);
      expect(securityConfig.maxLoginAttempts).toBe(3);
      expect(securityConfig.sessionTimeout).toBe(3600000);
    });

    it('should provide performance configuration', () => {
      const perfConfig = config.getPerformanceConfig();
      
      expect(perfConfig.retryAttempts).toBe(3);
      expect(perfConfig.retryDelay).toBe(1000);
      expect(perfConfig.cacheTtl).toBe(300000);
    });

    it('should provide feature flags', () => {
      const features = config.getFeatures();
      
      expect(features.enableWalrus).toBe(true);
      expect(features.enableAdvancedSharing).toBe(true);
      expect(features.enableAnalytics).toBe(false);
    });

    it('should check feature flags', () => {
      expect(config.isFeatureEnabled('enableWalrus')).toBe(true);
      expect(config.isFeatureEnabled('enableAnalytics')).toBe(false);
    });

    it('should detect environment modes', () => {
      expect(config.getCurrentNetwork()).toBe('testnet');
      expect(config.isLocalMode()).toBe(false);
      expect(config.isDevelopment()).toBe(false);
      expect(config.isTest()).toBe(true);
      expect(config.isProduction()).toBe(false);
    });

    it('should get Sui RPC URL', () => {
      const rpcUrl = config.getSuiRpcUrl();
      expect(rpcUrl).toBe('https://fullnode.testnet.sui.io:443');
    });

    it('should get package ID', () => {
      const packageId = config.getPackageId();
      expect(packageId).toBeDefined();
    });

    it('should provide safe configuration', () => {
      const safeConfig = config.getSafeConfig();
      
      expect(safeConfig.network.sui.packageId).toBe('[HIDDEN]');
      expect(safeConfig.app.name).toBe('SuiPass');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional variables', () => {
      const minimalEnv = { ...mockEnvVars };
      delete minimalEnv.VITE_SUI_PACKAGE_ID;
      delete minimalEnv.VITE_WALRUS_SITE_URL;
      
      vi.stubGlobal('import', {
        meta: { env: minimalEnv }
      });
      
      const result = validateEnvironmentVariables(minimalEnv);
      expect(result.isValid).toBe(true);
    });

    it('should use default values for missing optional variables', () => {
      const minimalEnv = { VITE_SUI_NETWORK: 'testnet', VITE_SUI_RPC_URL: 'https://test.com' };
      
      const configWithDefaults = require('../lib/config-validator').getConfigWithDefaults(minimalEnv);
      
      expect(configWithDefaults.VITE_APP_NAME).toBe('SuiPass');
      expect(configWithDefaults.VITE_APP_VERSION).toBe('1.0.0');
    });
  });
});