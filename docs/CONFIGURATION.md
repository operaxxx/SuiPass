# 配置管理系统使用指南

## 概述

SuiPass 项目现在拥有一个完整的配置管理系统，提供了类型安全的环境变量管理、多环境支持和验证机制。

## 文件结构

```
packages/frontend/
├── .env.base              # 基础配置（共享默认值）
├── .env.development       # 开发环境配置
├── .env.test              # 测试环境配置
├── .env.production        # 生产环境配置
├── .env                   # 当前激活的配置（由脚本管理）
└── src/
    ├── lib/
    │   ├── config.ts              # 配置管理器
    │   ├── config-validator.ts    # 配置验证器
    │   └── config.test.ts         # 测试文件
    └── types/
        └── config.ts              # 配置类型定义

scripts/
├── config.js              # 配置管理CLI工具
├── config-diff.js         # 配置差异比较工具
├── switch-env.js          # 环境切换工具
└── validate-config.js     # 配置验证工具
```

## 快速开始

### 1. 查看可用环境

```bash
pnpm config:list
```

### 2. 查看特定环境配置

```bash
pnpm config:show development
pnpm config:show production
```

### 3. 切换环境

```bash
pnpm env:switch development
pnpm env:switch production
```

### 4. 验证配置

```bash
pnpm env:validate
pnpm config:validate
```

### 5. 比较环境配置

```bash
pnpm config:compare development production
pnpm env:diff development production
```

## 配置文件详解

### 基础配置 (.env.base)

包含所有环境的共享默认值：
- 应用基本信息
- 安全配置默认值
- 性能配置默认值
- 功能开关默认值

### 环境特定配置

#### 开发环境 (.env.development)
- 使用本地 Sui 网络
- 启用调试模式
- 较短的超时时间（便于测试）

#### 测试环境 (.env.test)
- 使用 Sui Testnet
- 禁用本地模式
- 优化的测试配置

#### 生产环境 (.env.production)
- 使用 Sui Mainnet
- 禁用调试模式
- 增强的安全配置

## 在代码中使用配置

### 基础用法

```typescript
import { config } from '@/lib/config';

// 获取网络配置
const networkConfig = config.getNetworkConfig();
console.log(networkConfig.sui.network); // 'testnet'

// 获取应用配置
const appConfig = config.getAppConfig();
console.log(appConfig.name); // 'SuiPass'

// 检查功能开关
if (config.isFeatureEnabled('enableWalrus')) {
  // 启用 Walrus 功能
}

// 检查环境模式
if (config.isDevelopment()) {
  // 开发环境特定逻辑
}
```

### 完整示例

```typescript
import { config } from '@/lib/config';

class MyService {
  constructor() {
    // 获取配置
    this.network = config.getCurrentNetwork();
    this.retryAttempts = config.getPerformanceConfig().retryAttempts;
    this.timeout = config.getApiConfig().timeout;
    
    // 检查功能
    this.useWalrus = config.isFeatureEnabled('enableWalrus');
    this.debugMode = config.isFeatureEnabled('enableDebugMode');
  }

  async fetchData() {
    if (this.debugMode) {
      console.log(`Fetching data from ${this.network} network`);
    }

    // 使用配置值
    const response = await fetch(this.getApiUrl(), {
      timeout: this.timeout
    });

    return response.json();
  }
}
```

## 配置验证

### 类型验证

系统会自动验证以下类型：
- **URL**: 必须是有效的 URL 格式
- **布尔值**: 必须是 'true' 或 'false'
- **数字**: 必须是有效的数字
- **枚举**: 必须在允许的值范围内

### 自定义验证

```typescript
// 在 config-validator.ts 中添加自定义验证规则
const CONFIG_SCHEMA: ConfigSchema = {
  VITE_SUI_NETWORK: {
    type: 'string',
    required: true,
    validator: (value: string) => ['local', 'devnet', 'testnet', 'mainnet'].includes(value),
    description: 'Sui blockchain network identifier'
  }
};
```

## 环境变量说明

### 网络配置
- `VITE_SUI_NETWORK`: Sui 网络类型 (local/devnet/testnet/mainnet)
- `VITE_SUI_RPC_URL`: Sui RPC 端点 URL
- `VITE_SUI_PACKAGE_ID`: 智能合约包 ID
- `VITE_WALRUS_RPC_URL`: Walrus 存储 RPC 端点
- `VITE_WALRUS_SITE_URL`: Walrus 站点 URL

### 应用配置
- `VITE_APP_NAME`: 应用名称
- `VITE_APP_VERSION`: 应用版本
- `VITE_ENABLE_LOCAL_MODE`: 启用本地模式
- `VITE_ENABLE_ZKLOGIN`: 启用 zkLogin

### 安全配置
- `VITE_CSP_ENABLED`: 启用内容安全策略
- `VITE_MAX_LOGIN_ATTEMPTS`: 最大登录尝试次数
- `VITE_SESSION_TIMEOUT`: 会话超时时间

### 性能配置
- `VITE_RETRY_ATTEMPTS`: 重试次数
- `VITE_RETRY_DELAY`: 重试延迟
- `VITE_CACHE_TTL`: 缓存过期时间

### 功能开关
- `VITE_ENABLE_WALRUS`: 启用 Walrus 存储
- `VITE_ENABLE_ADVANCED_SHARING`: 启用高级分享
- `VITE_ENABLE_BACKUP`: 启用备份功能
- `VITE_ENABLE_ANALYTICS`: 启用分析
- `VITE_ENABLE_DEBUG_MODE`: 启用调试模式

## 最佳实践

### 1. 环境隔离
- 每个环境使用独立的配置文件
- 不要在代码中硬编码配置值
- 使用配置管理器获取所有配置

### 2. 安全考虑
- 敏感信息通过环境变量注入
- 不要提交包含敏感信息的配置文件
- 使用 `.env.example` 作为模板

### 3. 开发流程
- 开发时使用 `development` 环境
- 测试时使用 `test` 环境
- 生产部署使用 `production` 环境

### 4. CI/CD 集成
```yaml
# 在 CI/CD 中验证配置
- name: Validate configuration
  run: pnpm config:validate

- name: Set test environment
  run: pnpm env:switch test

- name: Run tests
  run: pnpm test
```

## 故障排除

### 常见问题

1. **配置验证失败**
   ```bash
   # 检查配置错误
   pnpm config:validate
   
   # 查看详细错误信息
   pnpm config:show production
   ```

2. **环境变量未加载**
   ```bash
   # 确保 .env 文件存在
   ls packages/frontend/.env*
   
   # 重新切换环境
   pnpm env:switch development
   ```

3. **类型错误**
   ```typescript
   // 确保导入配置管理器
   import { config } from '@/lib/config';
   
   // 使用类型安全的配置访问
   const network = config.getCurrentNetwork();
   ```

### 调试模式

启用调试模式查看详细配置信息：
```bash
# 临时启用调试模式
export VITE_ENABLE_DEBUG_MODE=true
pnpm dev
```

## 扩展配置

### 添加新的配置变量

1. **更新类型定义** (`src/types/config.ts`)
2. **添加验证规则** (`src/lib/config-validator.ts`)
3. **更新环境文件** (`.env.base`, `.env.development` 等)
4. **添加测试用例** (`src/lib/config.test.ts`)

### 添加新的环境

1. **创建环境文件** (`.env.staging`)
2. **更新配置工具** (`scripts/config.js`)
3. **添加验证规则**
4. **更新文档**

## 总结

新的配置管理系统提供了：
- ✅ 类型安全的配置访问
- ✅ 多环境支持
- ✅ 自动验证机制
- ✅ 开发工具支持
- ✅ 完整的测试覆盖
- ✅ 详细的文档说明

通过使用这个系统，可以确保配置的一致性、安全性和可维护性。