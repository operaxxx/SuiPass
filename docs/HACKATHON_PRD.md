# SuiPass 黑客松版本 - 产品设计文档

## 1. 项目概述

### 1.1 黑客松目标
在6周内开发一个基于Sui区块链的去中心化密码管理器原型，展示核心技术创新点，争取在Sui黑客松中获得认可。

### 1.2 核心价值主张
- **技术展示**: 展示Sui + Walrus的技术集成能力
- **创新概念**: 演示去中心化密码管理的可行性
- **用户体验**: 提供本地+云端的混合存储体验
- **安全实践**: 展示客户端加密和区块链安全的结合

### 1.3 成功标准
- ✅ 完成核心功能演示
- ✅ 技术架构清晰可展示
- ✅ 用户体验流畅
- ✅ 代码质量可接受
- ✅ 文档完整

## 2. 功能需求

### 2.1 核心MVP功能 (P0 - 必须实现)

#### 2.1.1 本地密码管理
- **密码存储**: 使用IndexedDB本地存储加密密码
- **基础操作**: 增删改查密码条目
- **分类管理**: 基础文件夹分类
- **搜索功能**: 实时搜索密码条目
- **加密保护**: AES-256-GCM加密所有数据

#### 2.1.2 主密码系统
- **主密码**: 使用Argon2id派生主密钥
- **解锁机制**: 主密码解锁访问所有数据
- **会话管理**: 自动锁定和会话超时
- **密码强度**: 实时密码强度检测

#### 2.1.3 Sui区块链集成
- **钱包连接**: 支持主流Sui钱包连接
- **基础合约**: 简化的Vault注册合约
- **数据上传**: 演示数据上传到Walrus
- **元数据存储**: 在Sui上存储数据指针

#### 2.1.4 用户界面
- **响应式设计**: 支持桌面和移动端
- **主题系统**: 支持明暗主题切换
- **核心页面**: 主页、保险库、设置页
- **交互反馈**: 清晰的操作反馈和状态提示

### 2.2 演示功能 (P1 - 优先实现)

#### 2.2.1 演示流程
- **引导流程**: 新用户引导和设置
- **核心演示**: 本地管理 → 钱包绑定 → 云端同步
- **对比展示**: 本地vs云端存储对比
- **技术亮点**: 加密和安全机制展示

#### 2.2.2 数据展示
- **示例数据**: 预置演示数据
- **统计信息**: 密码数量、安全评分等
- **可视化**: 简单的图表和进度条
- **导出功能**: 数据导出和备份

### 2.3 暂缓功能 (P2 - 黑客松后)

#### 2.3.1 高级功能
- 密码生成器
- 数据导入/导出
- 多设备同步
- 安全审计功能

#### 2.3.2 企业功能
- 团队协作
- 权限管理
- API集成
- 高级安全功能

## 3. 技术架构

### 3.1 简化架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                          │
├─────────────────────────────────────────────────────────────┤
│  React + TypeScript + Vite + Tailwind CSS                 │
│  ├── Components (UI Components)                            │
│  ├── Pages (Main Pages)                                    │
│  ├── Services (Encryption, Storage, Blockchain)           │
│  └── State Management (Simplified Zustand)                │
└─────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                      │
            ┌───────▼───────┐      ┌──────▼──────┐
            │  Local       │      │  Blockchain │
            │  Storage     │      │  Layer       │
            │              │      │              │
            │ • IndexedDB  │      │  • Sui       │
            │ • Cache      │      │  • Walrus    │
            │ • Encryption │      │  • Smart     │
            │              │      │    Contract  │
            └────────────────┘      └───────────────┘
```

### 3.2 技术栈选择

#### 3.2.1 前端技术栈
- **框架**: React 18 + TypeScript
- **构建**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand (简化版)
- **路由**: TanStack Router
- **UI组件**: Radix UI + 自定义组件

#### 3.2.2 区块链技术栈
- **区块链**: Sui Testnet
- **SDK**: @mysten/sui.js
- **钱包**: @suiet/wallet-kit
- **存储**: Walrus Testnet
- **智能合约**: Sui Move

#### 3.2.3 安全技术栈
- **加密**: AES-256-GCM
- **密钥派生**: Argon2id
- **随机数**: Web Crypto API
- **存储**: IndexedDB (加密)

### 3.3 核心模块设计

#### 3.3.1 加密模块
```typescript
// 加密服务接口
interface EncryptionService {
  encrypt(data: string, key: string): Promise<string>
  decrypt(encrypted: string, key: string): Promise<string>
  deriveKey(password: string, salt: string): Promise<string>
  generateSalt(): string
}
```

#### 3.3.2 存储模块
```typescript
// 存储服务接口
interface StorageService {
  saveVault(vault: Vault): Promise<void>
  getVault(): Promise<Vault>
  updateVault(vault: Vault): Promise<void>
  deleteVault(): Promise<void>
}
```

#### 3.3.3 区块链模块
```typescript
// 区块链服务接口
interface BlockchainService {
  connectWallet(): Promise<void>
  disconnectWallet(): Promise<void>
  registerVault(name: string): Promise<string>
  uploadData(data: string): Promise<string>
  downloadData(blobId: string): Promise<string>
}
```

### 3.4 数据模型

#### 3.4.1 Vault 数据结构
```typescript
interface Vault {
  id: string
  name: string
  version: number
  items: VaultItem[]
  folders: Folder[]
  settings: VaultSettings
  createdAt: number
  updatedAt: number
}

interface VaultItem {
  id: string
  type: 'login' | 'card' | 'identity' | 'note'
  title: string
  encryptedContent: string
  url?: string
  favorite: boolean
  folderId?: string
  tags: string[]
  createdAt: number
  updatedAt: number
}
```

#### 3.4.2 智能合约结构
```move
module suipass::vault {
    use sui::object::{UID, Self};
    use sui::transfer;
    use sui::tx_context::{TxContext, Self};
    
    public struct Vault has key {
        id: UID,
        owner: address,
        name: String,
        blob_id: String,
        created_at: u64,
    }
    
    public fun create_vault(
        name: String,
        blob_id: String,
        ctx: &mut TxContext
    ): Vault {
        let vault = Vault {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            name,
            blob_id,
            created_at: tx_context::epoch_timestamp_ms(ctx),
        };
        transfer::transfer(vault, tx_context::sender(ctx));
        vault
    }
}
```

## 4. 用户体验设计

### 4.1 核心用户流程

#### 4.1.1 首次使用流程
1. **欢迎页面**: 产品介绍和价值主张
2. **主密码设置**: 设置主密码和恢复提示
3. **创建保险库**: 创建第一个密码保险库
4. **添加密码**: 引导用户添加第一个密码
5. **完成引导**: 展示核心功能

#### 4.1.2 日常使用流程
1. **解锁应用**: 主密码解锁
2. **浏览密码**: 查看和管理密码
3. **搜索密码**: 快速查找所需密码
4. **添加/编辑**: 管理密码条目
5. **同步数据**: 演示云端同步功能

#### 4.1.3 演示流程
1. **本地管理**: 展示本地密码管理功能
2. **钱包连接**: 连接Sui钱包
3. **数据上传**: 演示数据上传到Walrus
4. **云端同步**: 展示去中心化存储优势
5. **技术亮点**: 解释技术创新点

### 4.2 界面设计原则

#### 4.2.1 设计原则
- **简洁直观**: 减少认知负担，核心功能一目了然
- **一致性**: 保持交互逻辑的一致性
- **反馈及时**: 所有操作都有明确的视觉反馈
- **安全性**: 敏感操作需要二次确认

#### 4.2.2 视觉设计
- **色彩方案**: 主色调使用Sui品牌色
- **图标系统**: 使用Lucide React图标库
- **字体**: 系统默认字体，确保可读性
- **布局**: 响应式设计，适配不同设备

### 4.3 关键页面设计

#### 4.3.1 主页面
- **保险库列表**: 显示所有保险库
- **快速操作**: 添加密码、搜索等
- **统计信息**: 密码数量、安全评分
- **同步状态**: 显示本地/云端状态

#### 4.3.2 保险库详情页
- **密码列表**: 显示保险库中的所有密码
- **分类筛选**: 按文件夹和标签筛选
- **搜索功能**: 实时搜索密码
- **批量操作**: 批量删除和移动

#### 4.3.3 密码编辑页
- **表单字段**: 标题、用户名、密码、URL等
- **密码生成**: 集成密码生成器
- **安全提示**: 密码强度提示
- **保存确认**: 保存前的确认对话框

## 5. 开发计划

### 5.1 6周开发计划

#### Week 1: 基础架构搭建
**目标**: 完成项目基础架构和技术栈搭建

**任务**:
- [ ] 项目初始化和依赖配置
- [ ] React + TypeScript + Vite 设置
- [ ] Tailwind CSS 基础样式系统
- [ ] Zustand 状态管理配置
- [ ] 路由系统配置
- [ ] 基础UI组件库
- [ ] 开发环境配置

**交付物**:
- 完整的开发环境
- 基础项目结构
- 核心依赖配置

#### Week 2: 核心功能实现
**目标**: 完成本地密码管理核心功能

**任务**:
- [ ] 加密服务实现 (AES-256-GCM)
- [ ] IndexedDB 存储引擎
- [ ] 密码CRUD操作
- [ ] 主密码解锁机制
- [ ] 搜索和过滤功能
- [ ] 基础UI组件开发
- [ ] 状态管理实现

**交付物**:
- 完整的本地密码管理功能
- 加密存储系统
- 基础用户界面

#### Week 3: Sui集成
**目标**: 完成Sui区块链基础集成

**任务**:
- [ ] Sui SDK集成
- [ ] 钱包连接功能
- [ ] 智能合约开发
- [ ] 合约测试和部署
- [ ] 交易处理机制
- [ ] 错误处理机制
- [ ] 基础UI集成

**交付物**:
- Sui钱包连接功能
- 基础智能合约
- 区块链交互功能

#### Week 4: Walrus存储
**目标**: 完成Walrus存储集成

**任务**:
- [ ] Walrus SDK集成
- [ ] 加密数据上传下载
- [ ] 版本控制基础
- [ ] 数据同步机制
- [ ] 错误处理完善
- [ ] 性能优化
- [ ] 完整UI集成

**交付物**:
- Walrus存储功能
- 数据同步机制
- 完整的用户界面

#### Week 5: 演示优化
**目标**: 优化用户体验和演示流程

**任务**:
- [ ] 演示流程设计
- [ ] UI/UX优化
- [ ] 性能优化
- [ ] 错误处理完善
- [ ] 引导流程实现
- [ ] 演示数据准备
- [ ] 移动端适配

**交付物**:
- 流畅的用户体验
- 完整的演示流程
- 优化的性能表现

#### Week 6: 最终准备
**目标**: 完成项目最终准备和发布

**任务**:
- [ ] 演示脚本准备
- [ ] 文档完善
- [ ] 测试和bug修复
- [ ] 性能优化
- [ ] 部署准备
- [ ] 演示视频录制
- [ ] 项目打包

**交付物**:
- 完整的项目包
- 演示文档和视频
- 技术文档

### 5.2 里程碑设置

#### Milestone 1: 基础架构完成 (Week 1)
- ✅ 开发环境搭建完成
- ✅ 基础项目结构建立
- ✅ 核心技术栈配置完成

#### Milestone 2: 本地功能完成 (Week 2)
- ✅ 本地密码管理功能
- ✅ 加密存储系统
- ✅ 基础用户界面

#### Milestone 3: 区块链集成完成 (Week 3)
- ✅ Sui钱包连接
- ✅ 智能合约部署
- ✅ 基础区块链功能

#### Milestone 4: 存储集成完成 (Week 4)
- ✅ Walrus存储功能
- ✅ 数据同步机制
- ✅ 完整功能集成

#### Milestone 5: 演示优化完成 (Week 5)
- ✅ 用户体验优化
- ✅ 演示流程完善
- ✅ 性能优化完成

#### Milestone 6: 项目发布 (Week 6)
- ✅ 演示准备完成
- ✅ 文档完善
- ✅ 项目最终发布

## 6. 技术实现指南

### 6.1 开发环境配置

#### 6.1.1 前置要求
```bash
# Node.js 18+
node --version

# pnpm 8+
pnpm --version

# Sui CLI
cargo install --git https://github.com/MystenLabs/sui --branch main sui
```

#### 6.1.2 项目初始化
```bash
# 克隆项目
git clone <repository-url>
cd suipass

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

#### 6.1.3 环境配置
```env
# packages/frontend/.env.development
VITE_SUI_NETWORK=testnet
VITE_SUI_RPC_URL=https://sui.testnet.rpc
VITE_WALRUS_RPC_URL=https://walrus.testnet.rpc
VITE_ENABLE_WALLET=true
VITE_ENABLE_LOCAL_MODE=true
```

### 6.2 代码规范

#### 6.2.1 TypeScript 规范
```typescript
// 使用严格类型
interface User {
  id: string;
  name: string;
  email?: string;
}

// 使用泛型
interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}
```

#### 6.2.2 React 组件规范
```typescript
// 使用函数组件和hooks
interface ComponentProps {
  title: string;
  onClick: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onClick }) => {
  return (
    <button onClick={onClick}>
      {title}
    </button>
  );
};
```

#### 6.2.3 样式规范
```typescript
// 使用Tailwind CSS
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  Click me
</button>
```

### 6.3 安全实现指南

#### 6.3.1 加密实现
```typescript
// 使用Web Crypto API
async function encryptData(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  const keyBuffer = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyBuffer,
    dataBuffer
  );
  
  return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
}
```

#### 6.3.2 密钥管理
```typescript
// 使用Argon2id进行密钥派生
async function deriveKey(password: string, salt: string): Promise<string> {
  // 使用WebAssembly版本的Argon2
  const params = {
    hashLength: 32,
    salt: new TextEncoder().encode(salt),
    iterations: 3,
    memorySize: 65536, // 64MB
    parallelism: 4,
    algorithm: 'argon2id'
  };
  
  return await argon2.hash(params, password);
}
```

### 6.4 测试策略

#### 6.4.1 单元测试
```typescript
// 使用Vitest进行单元测试
import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from './encryption';

describe('Encryption', () => {
  it('should encrypt and decrypt data correctly', () => {
    const data = 'test data';
    const key = 'test key';
    
    const encrypted = encrypt(data, key);
    const decrypted = decrypt(encrypted, key);
    
    expect(decrypted).toBe(data);
  });
});
```

#### 6.4.2 集成测试
```typescript
// 测试区块链集成
describe('Blockchain Integration', () => {
  it('should connect to wallet successfully', async () => {
    const blockchainService = new BlockchainService();
    await blockchainService.connectWallet();
    
    expect(blockchainService.isConnected()).toBe(true);
  });
});
```

### 6.5 性能优化

#### 6.5.1 前端优化
```typescript
// 使用React.memo优化组件渲染
const OptimizedComponent = React.memo(({ data }) => {
  return <div>{data.map(item => <Item key={item.id} item={item} />)}</div>;
});

// 使用useMemo优化计算
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);
```

#### 6.5.2 存储优化
```typescript
// 使用IndexedDB批量操作
async function batchUpdate(items: Item[]): Promise<void> {
  const transaction = db.transaction(['items'], 'readwrite');
  const store = transaction.objectStore('items');
  
  for (const item of items) {
    store.put(item);
  }
  
  return transaction.done;
}
```

## 7. 演示策略

### 7.1 演示场景设计

#### 7.1.1 核心演示流程
1. **开场介绍** (1分钟)
   - 项目背景和价值主张
   - 技术创新点概述

2. **功能演示** (3分钟)
   - 本地密码管理功能
   - Sui钱包连接
   - 数据上传到Walrus
   - 云端同步演示

3. **技术亮点** (2分钟)
   - 加密机制说明
   - 区块链集成优势
   - 去中心化存储价值

4. **总结和问答** (2分钟)
   - 项目总结
   - 未来规划
   - 技术问答

#### 7.1.2 备用演示方案
- **快速演示**: 5分钟精简版本
- **技术深度**: 10分钟技术细节版本
- **用户体验**: 8分钟用户体验版本

### 7.2 演示数据准备

#### 7.2.1 示例数据
```json
{
  "vaults": [
    {
      "name": "个人保险库",
      "items": [
        {
          "title": "Google",
          "url": "https://google.com",
          "type": "login"
        },
        {
          "title": "GitHub",
          "url": "https://github.com",
          "type": "login"
        }
      ]
    }
  ]
}
```

#### 7.2.2 演示脚本
```markdown
# 演示脚本

## 1. 开场
"大家好，今天我为大家展示SuiPass - 一个基于Sui区块链的去中心化密码管理器。"

## 2. 功能演示
"首先，我们来看本地密码管理功能..."
"接下来，我们连接Sui钱包..."
"现在，我们将数据上传到Walrus存储..."

## 3. 技术亮点
"SuiPass的核心技术特点包括..."
"我们的创新点在于..."

## 4. 总结
"通过SuiPass，我们展示了..."
"未来，我们计划..."
```

### 7.3 演示环境准备

#### 7.3.1 技术环境
- **网络**: Sui Testnet
- **钱包**: Sui Wallet 或 Suiet
- **浏览器**: Chrome 或 Firefox
- **网络**: 稳定的网络连接

#### 7.3.2 备用方案
- **离线版本**: 本地运行的备用版本
- **视频演示**: 预录制的演示视频
- **截图展示**: 关键界面截图

## 8. 风险管理

### 8.1 技术风险

#### 8.1.1 集成风险
- **风险**: Sui或Walrus集成问题
- **缓解**: 准备简化版本，确保基础功能可用
- **备用**: 纯本地版本作为备选

#### 8.1.2 性能风险
- **风险**: 加密操作影响性能
- **缓解**: 使用Web Workers，优化算法
- **备用**: 简化加密逻辑

#### 8.1.3 兼容性风险
- **风险**: 浏览器或钱包兼容性问题
- **缓解**: 测试主流浏览器和钱包
- **备用**: 提供详细的兼容性说明

### 8.2 时间风险

#### 8.2.1 开发延期
- **风险**: 6周开发时间紧张
- **缓解**: 严格优先级管理，聚焦核心功能
- **备用**: 准备最小化可用版本

#### 8.2.2 测试不足
- **风险**: 测试时间不足
- **缓解**: 并行开发和测试，自动化测试
- **备用**: 手动测试核心功能

### 8.3 演示风险

#### 8.3.1 技术故障
- **风险**: 演示时技术故障
- **缓解**: 准备备用方案，预演多次
- **备用**: 视频演示，截图展示

#### 8.3.2 网络问题
- **风险**: 网络连接问题
- **缓解**: 准备离线版本，使用本地网络
- **备用**: 预录制的演示视频

## 9. 项目管理

### 9.1 开发流程

#### 9.1.1 代码管理
```bash
# 分支策略
main                    # 主分支
├── develop           # 开发分支
├── feature/*         # 功能分支
└── hotfix/*          # 紧急修复分支

# 提交规范
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式化
refactor: 重构
test: 测试相关
chore: 构建相关
```

#### 9.1.2 代码审查
- **审查流程**: 所有代码需要经过审查
- **审查标准**: 代码质量、安全性、性能
- **自动化检查**: ESLint、TypeScript、测试覆盖率

### 9.2 质量保证

#### 9.2.1 代码质量
- **TypeScript**: 严格模式，100%类型覆盖
- **ESLint**: 严格规则，零警告
- **Prettier**: 统一代码格式
- **测试**: 核心功能单元测试

#### 9.2.2 性能标准
- **启动时间**: < 3秒
- **加密时间**: < 1秒
- **搜索响应**: < 200ms
- **内存使用**: < 100MB

### 9.3 文档管理

#### 9.3.1 技术文档
- **API文档**: 接口说明和使用示例
- **架构文档**: 系统架构和技术选型
- **部署文档**: 部署指南和环境配置
- **开发文档**: 开发指南和最佳实践

#### 9.3.2 用户文档
- **用户手册**: 功能说明和使用指南
- **演示文档**: 演示脚本和操作指南
- **FAQ**: 常见问题解答
- **支持文档**: 技术支持和联系方式

## 10. 总结

### 10.1 项目价值
- **技术创新**: 展示Sui + Walrus的技术集成能力
- **实用价值**: 解决密码管理的实际需求
- **教育意义**: 推广去中心化技术应用
- **社区贡献**: 为Sui生态贡献力量

### 10.2 成功因素
- **清晰的目标**: 聚焦核心功能和演示效果
- **合理的技术选型**: 选择成熟稳定的技术栈
- **严格的时间管理**: 6周开发计划的严格执行
- **充分的风险管理**: 准备多种备用方案

### 10.3 未来展望
- **功能扩展**: 完善产品功能和用户体验
- **生态建设**: 与Sui生态深度集成
- **商业应用**: 探索商业化可能性
- **社区发展**: 建立开发者社区

---

**文档版本**: v1.0  
**创建日期**: 2025年9月  
**最后更新**: 2025年9月  
**维护者**: SuiPass开发团队