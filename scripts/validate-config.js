#!/usr/bin/env node

/**
 * Configuration Validation Script
 * Validates environment configurations before deployment
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', 'packages', 'frontend');

/**
 * Validate environment variable
 */
function validateVariable(key, value) {
  const errors = [];
  
  // Check required variables
  const requiredVars = [
    'VITE_SUI_NETWORK',
    'VITE_SUI_RPC_URL',
    'VITE_WALRUS_RPC_URL',
    'VITE_APP_NAME',
    'VITE_APP_VERSION'
  ];
  
  if (requiredVars.includes(key) && !value) {
    errors.push(`Required variable ${key} is missing`);
    return errors;
  }
  
  if (!value) return errors;
  
  // Network validation
  if (key === 'VITE_SUI_NETWORK') {
    const validNetworks = ['local', 'devnet', 'testnet', 'mainnet'];
    if (!validNetworks.includes(value)) {
      errors.push(`Invalid network: ${value}. Must be one of: ${validNetworks.join(', ')}`);
    }
  }
  
  // URL validation
  if (key.includes('URL') || key.includes('RPC')) {
    try {
      new URL(value);
    } catch {
      errors.push(`Invalid URL for ${key}: ${value}`);
    }
  }
  
  // Boolean validation
  if (key.startsWith('VITE_ENABLE_') || key === 'VITE_CSP_ENABLED') {
    if (!['true', 'false'].includes(value)) {
      errors.push(`${key} must be 'true' or 'false', got: ${value}`);
    }
  }
  
  // Number validation
  if (key.includes('TIMEOUT') || key.includes('ATTEMPTS') || key.includes('RETRIES') || key.includes('TTL')) {
    if (isNaN(Number(value)) || Number(value) < 0) {
      errors.push(`${key} must be a positive number, got: ${value}`);
    }
  }
  
  return errors;
}

/**
 * Validate environment file
 */
function validateEnvFile(filename) {
  const filePath = path.join(CONFIG_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return {
      isValid: false,
      errors: [`File not found: ${filename}`],
      warnings: []
    };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  const warnings = [];
  
  content.split('\n').forEach((line, index) => {
    line = line.trim();
    
    if (!line || line.startsWith('#')) return;
    
    const [key, ...rest] = line.split('=');
    
    if (!key || rest.length === 0) {
      errors.push(`Invalid format at line ${index + 1}: ${line}`);
      return;
    }
    
    const value = rest.join('=').trim();
    const varErrors = validateVariable(key.trim(), value);
    errors.push(...varErrors);
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const envFile = args[0] || '.env';
  
  console.log(`🔍 Validating configuration: ${envFile}\n`);
  
  const result = validateEnvFile(envFile);
  
  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`   - ${warning}`));
    console.log('');
  }
  
  if (result.errors.length > 0) {
    console.log('❌ Errors:');
    result.errors.forEach(error => console.log(`   - ${error}`));
    console.log('\n❌ Configuration validation failed');
    process.exit(1);
  } else {
    console.log('✅ Configuration is valid');
  }
}

if (require.main === module) {
  main();
}