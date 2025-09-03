#!/usr/bin/env node

/**
 * Configuration Diff Tool
 * Compare environment configurations and detect differences
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', 'packages', 'frontend');

/**
 * Read and parse .env file
 */
function readEnvFile(filename) {
  const filePath = path.join(CONFIG_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return {};
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
 * Compare two configurations
 */
function compareConfigs(config1, config2, name1, name2) {
  const allKeys = new Set([...Object.keys(config1), ...Object.keys(config2)]);
  const differences = [];
  
  allKeys.forEach(key => {
    const val1 = config1[key] || '[NOT SET]';
    const val2 = config2[key] || '[NOT SET]';
    
    if (val1 !== val2) {
      differences.push({
        key,
        [name1]: val1,
        [name2]: val2
      });
    }
  });
  
  return differences;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.log('Usage: node scripts/config-diff.js <env1> <env2>');
    console.log('Example: node scripts/config-diff.js development production');
    process.exit(1);
  }
  
  const [env1, env2] = args;
  
  const config1 = readEnvFile(`.env.${env1}`);
  const config2 = readEnvFile(`.env.${env2}`);
  
  if (Object.keys(config1).length === 0) {
    console.error(`❌ Configuration file not found: .env.${env1}`);
    process.exit(1);
  }
  
  if (Object.keys(config2).length === 0) {
    console.error(`❌ Configuration file not found: .env.${env2}`);
    process.exit(1);
  }
  
  const differences = compareConfigs(config1, config2, env1, env2);
  
  console.log(`\n🔍 Configuration Differences: ${env1} vs ${env2}\n`);
  
  if (differences.length === 0) {
    console.log('✅ No differences found');
  } else {
    differences.forEach(diff => {
      console.log(`📝 ${diff.key}:`);
      console.log(`   ${env1}: ${diff[env1]}`);
      console.log(`   ${env2}: ${diff[env2]}\n`);
    });
  }
}

if (require.main === module) {
  main();
}