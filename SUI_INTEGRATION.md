# Sui Network Integration

本文档描述了 SuiPass 项目中的真实 Sui 网络集成实现。

## 概述

SuiPass 现已完全集成真实的 Sui 区块链网络，支持以下功能：

- ✅ 真实的钱包连接（支持 Sui Wallet, Suiet, Ethos 等）
- ✅ 智能合约交互（Vault Registry 和 Access Control）
- ✅ 多网络支持（devnet, testnet, mainnet, localnet）
- ✅ 交易处理和错误重试机制
- ✅ 网络状态监控
- ✅ Gas 费用估算
- ✅ 事件订阅

## 架构组件

### 1. 服务层 (Services)

#### SuiService (`/packages/frontend/src/services/sui.ts`)

- 真实的 Sui 客户端连接
- 钱包适配器集成
- 智能合约交互
- 重试机制和错误处理

**主要功能：**

- `connectWallet()` - 连接钱包
- `createVaultObject()` - 创建保险库对象
- `getVault()` - 获取保险库信息
- `updateVaultStorage()` - 更新存储引用
- `shareVault()` - 分享保险库
- `getUserVaults()` - 获取用户保险库列表

### 2. 状态管理 (State Management)

#### AuthStore (`/packages/frontend/src/stores/auth.ts`)

- 钱包连接状态
- 用户地址和余额
- 网络状态管理
- 持久化存储

**状态字段：**

```typescript
{
  wallet: WalletAdapter | null;
  isConnected: boolean;
  address: string | null;
  balance: number;
  network: string;
  networkStatus: "online" | "offline";
}
```

### 3. UI 组件

#### WalletConnect (`/packages/frontend/src/components/wallet/wallet-connect.tsx`)

- 钱包连接按钮
- 地址显示和复制
- 余额显示
- 断开连接功能

#### NetworkStatus (`/packages/frontend/src/components/wallet/network-status.tsx`)

- 网络状态指示器
- 网络类型显示
- 在线/离线状态

#### AppHeader (`/packages/frontend/src/components/app/app-header.tsx`)

- 应用导航栏
- 集成钱包连接
- 网络状态显示

### 4. 配置管理

#### 网络配置 (`/packages/frontend/src/config/network.ts`)

- 多网络配置
- RPC 端点管理
- 功能开关控制

**支持的网络：**

- **devnet** - 开发网络（带水龙头）
- **testnet** - 测试网络（带水龙头）
- **mainnet** - 主网络
- **localnet** - 本地网络

## 智能合约集成

### Vault Registry 合约

```move
// 创建保险库
public fun create_vault_registry(
    walrus_blob_id: String,
    clock: &Clock,
    ctx: &mut TxContext
): VaultRegistry

// 更新存储引用
public fun update_vault_blob(
    vault: &mut VaultRegistry,
    new_walrus_blob_id: String,
    clock: &Clock,
    ctx: &mut TxContext
)
```

### Access Control 合约

```move
// 创建访问权限
public fun create_access_capability(
    vault_id: ID,
    granted_to: address,
    permission_level: u64,
    expires_at: u64,
    max_usage: u64,
    conditions: vector<String>,
    clock: &Clock,
    ctx: &mut TxContext
): AccessCapability
```

## 环境配置

### 必需的环境变量

```env
# Sui 网络配置
VITE_SUI_NETWORK=testnet
VITE_SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# 智能合约配置
VITE_SUI_PACKAGE_ID=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Walrus 存储配置
VITE_WALRUS_RPC_URL=https://walrus.testnet.rpc
```

### 可选配置

```env
# 功能开关
VITE_ENABLE_ZKLOGIN=true
VITE_ENABLE_WALRUS=true
VITE_ENABLE_ADVANCED_SHARING=true

# 性能配置
VITE_RETRY_ATTEMPTS=3
VITE_RETRY_DELAY=1000
```

## 使用方法

### 1. 连接钱包

```typescript
import { useAuthStore } from '../stores/auth';
import { WalletConnect } from '../components/wallet/wallet-connect';

// 在组件中使用
function MyComponent() {
  const { isConnected, address } = useAuthStore();

  return (
    <div>
      <WalletConnect />
      {isConnected && <p>Connected: {address}</p>}
    </div>
  );
}
```

### 2. 创建保险库

```typescript
import { suiService } from "../services/sui";

async function createVault() {
  try {
    const vault = {
      name: "My Vault",
      description: "Personal passwords",
      storageBlobId: "walrus_blob_id_here",
      // ... 其他字段
    };

    const vaultId = await suiService.createVaultObject(vault);
    console.log("Vault created:", vaultId);
  } catch (error) {
    console.error("Failed to create vault:", error);
  }
}
```

### 3. 分享保险库

```typescript
async function shareVault(vaultId: string, recipient: string) {
  try {
    await suiService.shareVault(vaultId, recipient, "view");
    console.log("Vault shared successfully");
  } catch (error) {
    console.error("Failed to share vault:", error);
  }
}
```

## 错误处理

### 错误类型

```typescript
// 钱包错误
class WalletError extends Error {
  code: string;
  walletName?: string;
}

// 网络错误
class NetworkError extends Error {
  code: string;
  network: string;
}

// 区块链错误
class SuiError extends Error {
  code: string;
  details?: any;
}
```

### 重试机制

所有网络操作都内置了重试机制：

- 默认重试次数：3 次
- 指数退避延迟：1s, 2s, 3s
- 可配置的重试策略

## 测试

### 运行测试

```bash
# 运行 Sui 服务测试
pnpm test sui.test.ts

# 运行所有测试
pnpm test
```

### 测试覆盖

- ✅ 钱包连接/断开
- ✅ 网络配置
- ✅ 智能合约交互
- ✅ 错误处理
- ✅ 重试机制
- ✅ 状态管理

## 部署

### 1. 部署智能合约

```bash
cd packages/contracts
pnpm deploy:testnet
```

### 2. 更新环境变量

将部署后的包 ID 更新到 `.env` 文件：

```env
VITE_SUI_PACKAGE_ID=0xdeployed_package_id_here
```

### 3. 构建前端

```bash
pnpm build
```

## 钱包兼容性

### 支持的钱包

- ✅ Sui Wallet
- ✅ Suiet
- ✅ Ethos
- ✅ 其他兼容的钱包

### 网络支持

| 钱包       | Devnet | Testnet | Mainnet | Localnet |
| ---------- | ------ | ------- | ------- | -------- |
| Sui Wallet | ✅     | ✅      | ✅      | ✅       |
| Suiet      | ✅     | ✅      | ✅      | ✅       |
| Ethos      | ✅     | ✅      | ✅      | ❌       |

## 安全考虑

### 1. 密钥管理

- 私钥永远不会离开钱包
- 所有签名都在钱包中完成
- 应用程序无法访问私钥

### 2. 网络安全

- 所有通信都通过 HTTPS
- RPC 端点验证
- 防止中间人攻击

### 3. 交易安全

- Gas 限制设置
- 交易模拟和验证
- 错误回滚机制

## 性能优化

### 1. 缓存策略

- 包 ID 缓存
- 网络状态缓存
- 对象查询缓存

### 2. 批量操作

- 多笔交易批处理
- 并行查询优化
- 延迟加载

### 3. 网络优化

- 连接池管理
- 请求去重
- 智能重试

## 故障排除

### 常见问题

1. **钱包连接失败**
   - 检查钱包是否已安装
   - 确认网络设置正确
   - 查看浏览器控制台错误

2. **交易失败**
   - 检查 Gas 费用是否足够
   - 确认账户余额
   - 验证智能合约状态

3. **网络连接问题**
   - 检查 RPC 端点是否可访问
   - 确认防火墙设置
   - 验证网络配置

### 调试工具

```typescript
// 启用调试模式
window.__SUI_DEBUG__ = true;

// 查看服务状态
console.log(window.__container?.get("SUI_SERVICE"));

// 查看网络状态
console.log(suiService.getNetworkStatus());
```

## 未来扩展

### 计划功能

- [ ] ZKLogin 集成
- [ ] 赞助交易
- [ ] 多签支持
- [ ] NFT 门控访问
- [ ] 跨链桥接

### API 扩展

- 更多智能合约函数
- 事件流 API
- 批量操作 API
- 治理功能

---

**注意：** 本集成方案专注于安全性和用户体验。所有生产部署前都应进行充分的安全审计。
