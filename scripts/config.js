#!/usr/bin/env node

/**
 * Configuration Management CLI Tool
 * Provides utilities for managing environment configurations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_DIR = path.join(__dirname, '..', 'packages', 'frontend');
const ENV_FILES = {
  base: '.env.base',
  development: '.env.development',
  test: '.env.test',
  production: '.env.production'
};

/**
 * Color utilities for console output
 */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Print colored message
 */
function colorPrint(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Read environment file
 */
function readEnvFile(filename) {
  const filePath = path.join(CONFIG_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Environment file not found: ${filePath}`);
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...rest] = line.split('=');
      if (key && rest.length > 0) {
        env[key.trim()] = rest.join('=').trim();
      }
    }
  });
  
  return env;
}

/**
 * Write environment file
 */
function writeEnvFile(filename, env) {
  const filePath = path.join(CONFIG_DIR, filename);
  const content = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(filePath, content);
}

/**
 * Validate environment configuration
 */
function validateEnvironment(env) {
  const errors = [];
  const warnings = [];
  
  // Required variables
  const required = [
    'VITE_SUI_NETWORK',
    'VITE_SUI_RPC_URL',
    'VITE_WALRUS_RPC_URL',
    'VITE_APP_NAME',
    'VITE_APP_VERSION'
  ];
  
  required.forEach(key => {
    if (!env[key]) {
      errors.push(`Missing required variable: ${key}`);
    }
  });
  
  // Network validation
  const validNetworks = ['local', 'devnet', 'testnet', 'mainnet'];
  if (env.VITE_SUI_NETWORK && !validNetworks.includes(env.VITE_SUI_NETWORK)) {
    errors.push(`Invalid network: ${env.VITE_SUI_NETWORK}. Must be one of: ${validNetworks.join(', ')}`);
  }
  
  // URL validation
  const urlVariables = ['VITE_SUI_RPC_URL', 'VITE_WALRUS_RPC_URL'];
  urlVariables.forEach(key => {
    if (env[key]) {
      try {
        new URL(env[key]);
      } catch {
        errors.push(`Invalid URL for ${key}: ${env[key]}`);
      }
    }
  });
  
  // Boolean validation
  const booleanVariables = [
    'VITE_ENABLE_ZKLOGIN',
    'VITE_ENABLE_LOCAL_MODE',
    'VITE_CSP_ENABLED',
    'VITE_ENABLE_WALRUS',
    'VITE_ENABLE_ADVANCED_SHARING',
    'VITE_ENABLE_BACKUP',
    'VITE_ENABLE_ANALYTICS',
    'VITE_ENABLE_DEBUG_MODE'
  ];
  
  booleanVariables.forEach(key => {
    if (env[key] && !['true', 'false'].includes(env[key])) {
      warnings.push(`${key} should be 'true' or 'false', got: ${env[key]}`);
    }
  });
  
  // Number validation
  const numberVariables = [
    'VITE_AUTO_LOCK_TIMEOUT',
    'VITE_MAX_LOGIN_ATTEMPTS',
    'VITE_SESSION_TIMEOUT',
    'VITE_RETRY_ATTEMPTS',
    'VITE_RETRY_DELAY',
    'VITE_CACHE_TTL',
    'VITE_API_TIMEOUT',
    'VITE_API_RETRIES'
  ];
  
  numberVariables.forEach(key => {
    if (env[key] && isNaN(Number(env[key]))) {
      errors.push(`${key} must be a number, got: ${env[key]}`);
    }
  });
  
  return { errors, warnings };
}

/**
 * Show environment configuration
 */
function showEnvironment(envName) {
  try {
    const env = readEnvFile(ENV_FILES[envName]);
    const { errors, warnings } = validateEnvironment(env);
    
    colorPrint('cyan', `\n📋 Configuration for ${envName.toUpperCase()} environment:\n`);
    
    Object.entries(env).forEach(([key, value]) => {
      // Hide sensitive values
      const displayValue = key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')
        ? '[HIDDEN]'
        : value;
      console.log(`  ${key}=${displayValue}`);
    });
    
    if (warnings.length > 0) {
      colorPrint('yellow', '\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (errors.length > 0) {
      colorPrint('red', '\n❌ Errors:');
      errors.forEach(error => console.log(`  - ${error}`));
      process.exit(1);
    } else {
      colorPrint('green', '\n✅ Configuration is valid');
    }
  } catch (error) {
    colorPrint('red', `❌ Error reading ${envName} configuration: ${error.message}`);
    process.exit(1);
  }
}

/**
 * List all environments
 */
function listEnvironments() {
  colorPrint('cyan', '📁 Available environment configurations:\n');
  
  Object.entries(ENV_FILES).forEach(([name, file]) => {
    const exists = fs.existsSync(path.join(CONFIG_DIR, file));
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${name.padEnd(12)} (${file})`);
  });
}

/**
 * Compare two environments
 */
function compareEnvironments(env1, env2) {
  try {
    const config1 = readEnvFile(ENV_FILES[env1]);
    const config2 = readEnvFile(ENV_FILES[env2]);
    
    colorPrint('cyan', `\n🔍 Comparing ${env1.toUpperCase()} vs ${env2.toUpperCase()}:\n`);
    
    const allKeys = new Set([...Object.keys(config1), ...Object.keys(config2)]);
    
    let hasDifferences = false;
    
    allKeys.forEach(key => {
      const val1 = config1[key] || '[NOT SET]';
      const val2 = config2[key] || '[NOT SET]';
      
      if (val1 !== val2) {
        hasDifferences = true;
        colorPrint('yellow', `  📝 ${key}:`);
        console.log(`    ${env1}: ${val1}`);
        console.log(`    ${env2}: ${val2}\n`);
      }
    });
    
    if (!hasDifferences) {
      colorPrint('green', '✅ No differences found');
    }
  } catch (error) {
    colorPrint('red', `❌ Error comparing environments: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Create environment file from template
 */
function createEnvironment(envName) {
  const templatePath = path.join(CONFIG_DIR, `${ENV_FILES[envName]}.template`);
  const targetPath = path.join(CONFIG_DIR, ENV_FILES[envName]);
  
  if (fs.existsSync(targetPath)) {
    colorPrint('red', `❌ Environment file already exists: ${ENV_FILES[envName]}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(templatePath)) {
    colorPrint('red', `❌ Template not found: ${templatePath}`);
    process.exit(1);
  }
  
  fs.copyFileSync(templatePath, targetPath);
  colorPrint('green', `✅ Created environment file: ${ENV_FILES[envName]}`);
}

/**
 * Validate all environment files
 */
function validateAll() {
  colorPrint('cyan', '🔍 Validating all environment configurations...\n');
  
  let hasErrors = false;
  
  Object.entries(ENV_FILES).forEach(([envName, file]) => {
    if (fs.existsSync(path.join(CONFIG_DIR, file))) {
      try {
        const env = readEnvFile(file);
        const { errors, warnings } = validateEnvironment(env);
        
        console.log(`\n📋 ${envName.toUpperCase()} (${file}):`);
        
        if (warnings.length > 0) {
          colorPrint('yellow', '  ⚠️  Warnings:');
          warnings.forEach(warning => console.log(`    - ${warning}`));
        }
        
        if (errors.length > 0) {
          hasErrors = true;
          colorPrint('red', '  ❌ Errors:');
          errors.forEach(error => console.log(`    - ${error}`));
        } else {
          colorPrint('green', '  ✅ Valid');
        }
      } catch (error) {
        hasErrors = true;
        colorPrint('red', `  ❌ Error: ${error.message}`);
      }
    } else {
      colorPrint('yellow', `  ⚠️  File not found: ${file}`);
    }
  });
  
  if (hasErrors) {
    colorPrint('red', '\n❌ Validation failed');
    process.exit(1);
  } else {
    colorPrint('green', '\n✅ All configurations are valid');
  }
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
🛠️  SuiPass Configuration Management Tool

Usage: node scripts/config.js <command> [options]

Commands:
  list                    List all available environment configurations
  show <env>              Show configuration for specific environment
  validate                Validate all environment configurations
  compare <env1> <env2>   Compare two environment configurations
  create <env>            Create environment file from template
  help                    Show this help message

Environments:
  base        Base configuration (shared defaults)
  development Local development environment
  test        Test environment (CI/CD)
  production  Production environment

Examples:
  node scripts/config.js list
  node scripts/config.js show development
  node scripts/config.js compare development production
  node scripts/config.js validate
`);
}

/**
 * Main CLI handler
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'list':
      listEnvironments();
      break;
      
    case 'show':
      if (!args[1]) {
        colorPrint('red', '❌ Please specify an environment');
        showHelp();
        process.exit(1);
      }
      showEnvironment(args[1]);
      break;
      
    case 'validate':
      validateAll();
      break;
      
    case 'compare':
      if (!args[1] || !args[2]) {
        colorPrint('red', '❌ Please specify two environments to compare');
        showHelp();
        process.exit(1);
      }
      compareEnvironments(args[1], args[2]);
      break;
      
    case 'create':
      if (!args[1]) {
        colorPrint('red', '❌ Please specify an environment to create');
        showHelp();
        process.exit(1);
      }
      createEnvironment(args[1]);
      break;
      
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Run CLI if called directly
if (require.main === module) {
  main();
}

module.exports = {
  readEnvFile,
  writeEnvFile,
  validateEnvironment,
  showEnvironment,
  listEnvironments,
  compareEnvironments,
  validateAll
};