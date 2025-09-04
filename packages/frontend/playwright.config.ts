// Playwright E2E测试配置
// packages/frontend/playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 测试目录
  testDir: './src/e2e',

  // 并行运行测试
  fullyParallel: true,

  // 禁止在失败时截屏（可选）
  forbidOnly: !!process.env.CI,

  // CI失败时重试次数
  retries: process.env.CI ? 2 : 0,

  // 工作进程数量
  workers: process.env.CI ? 2 : 4,

  // 测试报告配置
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['list'],
  ],

  // 全局测试设置
  use: {
    // 基础URL
    baseURL: 'http://localhost:3000',

    // 浏览器配置
    viewport: { width: 1280, height: 720 },
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',

    // 超时配置
    actionTimeout: 10000,
    navigationTimeout: 30000,

    // 头部信息
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },

    // 权限
    permissions: ['geolocation', 'notifications'],

    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,

    // 用户代理
    userAgent: 'SuiPass-E2E-Test/1.0.0',
  },

  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    // 可选：添加测试环境
    {
      name: 'staging',
      use: {
        baseURL: 'https://staging.suipass.app',
      },
    },
  ],

  // Web服务器配置
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // 依赖项
  dependencies: ['package.json', 'pnpm-lock.yaml'],

  // 测试文件匹配
  testMatch: '**/*.e2e.{ts,tsx,js,jsx}',

  // 忽略的文件
  testIgnore: ['**/node_modules/**', '**/dist/**', '**/build/**'],

  // 全局设置
  globalSetup: './src/e2e/global-setup.ts',
  globalTeardown: './src/e2e/global-teardown.ts',

  // 环境变量
  env: {
    NODE_ENV: 'test',
    VITE_SUI_NETWORK: 'testnet',
    VITE_ENABLE_LOCAL_MODE: 'true',
  },

  // 测试超时
  timeout: 30000,

  // 等待超时
  expect: {
    timeout: 10000,
  },

  // 网络请求模拟
  route: [
    {
      url: '**/api/**',
      method: method => ['GET', 'POST', 'PUT', 'DELETE'].includes(method),
    },
  ],
});
