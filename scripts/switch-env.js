#!/usr/bin/env node

/**
 * Environment Switcher Tool
 * Switch between different environment configurations
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', 'packages', 'frontend');
const ENV_FILE = path.join(CONFIG_DIR, '.env');

/**
 * Copy environment file
 */
function copyEnvironment(envName) {
  const sourceFile = path.join(CONFIG_DIR, `.env.${envName}`);
  const targetFile = ENV_FILE;
  
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Environment file not found: .env.${envName}`);
    process.exit(1);
  }
  
  // Backup existing .env file
  if (fs.existsSync(targetFile)) {
    const backupFile = path.join(CONFIG_DIR, '.env.backup');
    fs.copyFileSync(targetFile, backupFile);
    console.log(`💾 Backed up existing .env to .env.backup`);
  }
  
  // Copy new environment file
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✅ Switched to ${envName} environment`);
  
  // Show active configuration
  console.log('\n📋 Active configuration:');
  const content = fs.readFileSync(targetFile, 'utf8');
  content.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      // Hide sensitive values
      const [key, ...rest] = line.split('=');
      if (key && rest.length > 0) {
        const value = rest.join('=');
        const displayValue = key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')
          ? '[HIDDEN]'
          : value;
        console.log(`   ${key}=${displayValue}`);
      }
    }
  });
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 1) {
    console.log('Usage: node scripts/switch-env.js <environment>');
    console.log('Available environments: development, test, production');
    process.exit(1);
  }
  
  const env = args[0];
  const validEnvs = ['development', 'test', 'production'];
  
  if (!validEnvs.includes(env)) {
    console.error(`❌ Invalid environment: ${env}`);
    console.log(`Valid environments: ${validEnvs.join(', ')}`);
    process.exit(1);
  }
  
  copyEnvironment(env);
}

if (require.main === module) {
  main();
}