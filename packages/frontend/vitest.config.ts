/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    
    // 测试文件匹配模式
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules/',
      'dist/',
      '.idea/',
      '.git/',
      '.cache/',
      'src/test/setup.ts',
    ],
    
    // 全局测试配置
    globals: true,
    environment: 'jsdom',
    
    // 模拟和清理
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.config.{js,ts}',
        '**/index.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    
    // 超时配置
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // 并行配置
    maxWorkers: 4,
    minWorkers: 1,
    
    // 报告配置
    reporters: ['verbose'],
    outputFile: {
      'junit': 'junit-report.xml',
    },
    
    // 快照配置
    snapshotFormat: {
      printBasicPrototype: false,
    },
    snapshotSerializers: [],
    
    // 环境变量
    env: {
      NODE_ENV: 'test',
      VITE_SUI_NETWORK: 'testnet',
      VITE_ENABLE_LOCAL_MODE: 'true',
    },
    
    // 类型检查
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
    },
  },
});