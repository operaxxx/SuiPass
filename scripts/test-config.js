#!/usr/bin/env node

/**
 * Configuration System Test Script
 * Tests the configuration management system
 */

const fs = require("fs");
const path = require("path");

const CONFIG_DIR = path.join(__dirname, "..", "packages", "frontend");

console.log("🧪 Testing Configuration Management System\n");

// Test 1: Check if all required files exist
console.log("1. Checking required files...");
const requiredFiles = [
  ".env.base",
  ".env.development",
  ".env.test",
  ".env.production",
];

requiredFiles.forEach((file) => {
  const filePath = path.join(CONFIG_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - NOT FOUND`);
  }
});

// Test 2: Check if script files exist
console.log("\n2. Checking script files...");
const scriptFiles = [
  "scripts/config.js",
  "scripts/config-diff.js",
  "scripts/switch-env.js",
  "scripts/validate-config.js",
];

scriptFiles.forEach((file) => {
  const filePath = path.join(__dirname, "..", file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - NOT FOUND`);
  }
});

// Test 3: Check TypeScript files
console.log("\n3. Checking TypeScript files...");
const tsFiles = [
  "src/lib/config.ts",
  "src/lib/config-validator.ts",
  "src/types/config.ts",
  "src/lib/config.test.ts",
];

tsFiles.forEach((file) => {
  const filePath = path.join(CONFIG_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - NOT FOUND`);
  }
});

// Test 4: Validate configuration files
console.log("\n4. Validating configuration files...");
const envFiles = [".env.development", ".env.test", ".env.production"];

envFiles.forEach((file) => {
  const filePath = path.join(CONFIG_DIR, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"));

    console.log(`   📋 ${file} (${lines.length} variables)`);

    // Check for required variables
    const requiredVars = [
      "VITE_SUI_NETWORK",
      "VITE_SUI_RPC_URL",
      "VITE_WALRUS_RPC_URL",
    ];
    const missingVars = requiredVars.filter(
      (varName) => !content.includes(varName),
    );

    if (missingVars.length === 0) {
      console.log(`   ✅ All required variables present`);
    } else {
      console.log(`   ⚠️  Missing variables: ${missingVars.join(", ")}`);
    }
  }
});

// Test 5: Check package.json scripts
console.log("\n5. Checking package.json scripts...");
const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

const configScripts = [
  "config:list",
  "config:show",
  "config:validate",
  "config:compare",
  "env:switch",
  "env:validate",
  "env:diff",
];

configScripts.forEach((script) => {
  if (packageJson.scripts[script]) {
    console.log(`   ✅ ${script}`);
  } else {
    console.log(`   ❌ ${script} - NOT FOUND`);
  }
});

console.log("\n🎉 Configuration system test completed!");
console.log("\nNext steps:");
console.log('1. Run "pnpm config:validate" to validate all configurations');
console.log(
  '2. Run "pnpm env:switch development" to switch to development environment',
);
console.log(
  '3. Run "pnpm config:show development" to view development configuration',
);
console.log(
  "4. Check the documentation at docs/CONFIGURATION.md for usage instructions",
);
