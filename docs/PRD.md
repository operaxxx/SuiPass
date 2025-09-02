# SuiPass 去中心化密码管理器 - 产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品愿景
构建一个基于Sui区块链和Walrus存储的去中心化密码管理器，让用户完全掌控自己的数据，无需依赖中心化服务器。通过渐进式去中心化策略，降低用户使用门槛，让每个人都能轻松享受Web3的安全和自由。

### 1.2 核心价值主张
- **渐进式去中心化**: 从本地模式平滑过渡到去中心化模式，降低使用门槛
- **数据主权**: 用户数据存储在个人Sui地址空间，而非公司服务器
- **隐私保护**: 端到端加密，零知识架构
- **去中心化同步**: 通过Walrus实现跨设备同步，无单点故障
- **Web2友好**: 支持zkLogin，无需管理私钥即可使用
- **开源透明**: 所有代码开源，可审计验证

### 1.3 目标用户
- **主要用户群**:
  - 寻求安全密码管理方案的普通用户
  - 注重隐私的技术爱好者
  - 需要跨设备同步的专业人士
- **Web3用户群**:
  - 加密货币用户和Web3原生人群
  - 去中心化应用开发者
  - 对数据主权有强烈要求的用户

## 2. 功能需求

### 2.1 核心功能

#### 2.1.1 密码库管理
- **安全存储**: 使用AES-256-GCM加密存储密码
- **分类组织**: 支持文件夹、标签、收藏功能
- **快速搜索**: 实时搜索，支持标题、URL、用户名等字段
- **模板系统**: 预设登录、支付卡、身份等模板

#### 2.1.2 密码生成器
- **可定制规则**: 长度、字符类型、避免歧义字符
- **密码强度检测**: 实时显示密码强度评分
- **密码短语选项**: 支持生成易于记忆的密码短语
- **历史记录**: 保存生成的密码历史

#### 2.1.3 自动填充
- **浏览器扩展**: 支持Chrome、Firefox、Brave等主流浏览器
- **移动端自动填充**: iOS/Android键盘扩展
- **智能匹配**: 基于URL和应用名称自动匹配
- **多账户支持**: 同一网站多账户选择

#### 2.1.4 去中心化同步
- **Walrus集成**: 通过Walrus存储加密数据
- **Sui链上索引**: 在Sui区块链存储数据元信息和访问控制
- **冲突解决**: 多设备编辑的智能合并策略
- **离线模式**: 本地缓存，支持离线访问

#### 2.1.5 安全中心
- **安全审计**: 定期检查密码强度、重复密码、过期密码
- **泄露监控**: 集成Have I Been Pwned API监控数据泄露
- **两步验证**: 支持TOTP生成器
- **紧急访问**: 设置紧急联系人或时间胶囊

#### 2.1.6 本地模式（新增）
- **离线优先**: 数据默认存储在本地IndexedDB，无需网络连接
- **快速启动**: 无需等待区块链同步，即时可用
- **隐私保护**: 数据从未离开用户设备
- **平滑升级**: 随时可选择绑定钱包升级到去中心化模式
- **数据迁移**: 绑定钱包时可选择性同步本地数据到区块链

#### 2.1.7 zkLogin集成（新增）
- **Web2登录**: 支持Google、Apple、Facebook等OAuth提供商
- **零知识证明**: 使用zkLogin生成Sui地址，无需管理私钥
- **一键绑定**: zkLogin登录后自动完成钱包绑定
- **账户恢复**: 通过OAuth提供商恢复账户访问权限
- **多设备支持**: zkLogin账户可在多设备间同步使用

### 2.2 高级功能

#### 2.2.1 安全共享
- **基于Sui的共享**: 使用Sui智能合约管理访问权限
- **限时访问**: 设置共享链接的有效期
- **权限控制**: 只读、读写等不同权限级别
- **撤销机制**: 随时撤销已共享的访问权限

#### 2.2.2 多重验证
- **主密码**: 使用Argon2id进行密钥派生
- **生物识别**: 支持Face ID、Touch ID、Windows Hello
- **硬件密钥**: 支持YubiKey等FIDO2设备
- **恢复密钥**: 生成的24字恢复短语

#### 2.2.3 数据导入导出
- **格式支持**: 1Password、Bitwarden、LastPass等格式
- **CSV导入**: 通用CSV格式导入
- **加密导出**: 导出加密的备份文件
- **选择性迁移**: 选择性地导入特定条目

### 3. 技术架构

### 3.1 分层架构设计
SuiPass 采用 Sui + Walrus 分层架构，实现最优的性能、成本和安全性平衡：

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (React + TS)                │
├─────────────────────────────────────────────────────────────┤
│  UI Components │ State Management │ Crypto Service │ Storage │
└─────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                      │
            ┌───────▼───────┐      ┌──────▼──────┐
            │  Sui Blockchain │      │  Walrus      │
            │                │      │  Storage      │
            │ • Identity     │      │  • Encrypted  │
            │ • Ownership    │      │    Data       │
            │ • Access       │      │  • Metadata   │
            │   Control      │      │  • History    │
            │ • Audit Trail  │      │               │
            └────────────────┘      └───────────────┘
                    │                      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    User Device     │
                    │  • Local Cache    │
                    │  • Offline Mode   │
                    │  • Fast Access    │
                    └───────────────────┘
```

### 3.2 客户端架构
```
Frontend (React + TypeScript)
├── UI Layer (React Components)
├── State Management (Zustand)
├── Mode Manager (Local/Decentralized)
├── Crypto Service (Web Crypto API)
├── Sui Service (Identity & Ownership)
├── Walrus Service (Encrypted Data Storage)
└── Storage Layer
    ├── IndexedDB (Local Cache & Offline)
    └── Walrus (Decentralized Encrypted Storage)
```

### 3.3 核心设计原则

#### 3.3.1 职责分离
- **Sui 区块链**: 仅负责身份验证、所有权确认和访问控制
- **Walrus 存储**: 负责存储所有加密后的用户数据和元数据
- **客户端**: 负责加密/解密、UI 展示和业务逻辑

#### 3.3.2 数据流设计
1. **创建/更新数据**: 客户端加密 → Walrus 存储 → Sui 记录元数据
2. **读取数据**: Sui 验证权限 → Walrus 获取数据 → 客户端解密
3. **共享数据**: Sui 创建访问能力 → 授权方获取访问权限

### 3.4 加密方案
- **数据加密**: AES-256-GCM
- **密钥派生**: Argon2id (内存硬、并行)
- **密钥层次结构**:
  - 主密钥 (从主密码派生)
  - 数据加密密钥 (加密 Vault 内容)
  - 认证密钥 (Sui 交易签名)
- **密钥管理**: 永远不上链，只存储 commitment

### 3.5 区块链集成
- **Sui 智能合约**: 最小化设计，仅管理核心功能
  - Vault 注册表（名称、所有者、Walrus blob ID）
  - 访问能力管理（权限、有效期）
  - 审计事件记录
- **Walrus 存储**: 文档式存储结构
  - 完整的加密 Vault 数据
  - 版本历史和变更记录
  - 索引和元数据
- **Gas 优化**: 
  - 固定成本的更新操作
  - 批量权限管理
  - 事件驱动的异步处理

### 3.6 数据模型
```typescript
// Sui 链上存储的最小化信息
interface VaultRegistry {
  id: string;           // Sui object ID
  owner: string;        // Sui address
  name: string;         // Vault 名称
  current_blob_id: string;  // Walrus blob ID
  previous_blob_id?: string; // 支持回滚
  key_commitment: string;    // 加密密钥的 commitment
  version: number;     // 版本号
  created_at: number;  // 创建时间戳
  updated_at: number;  // 更新时间戳
}

// Walrus 存储的完整加密数据
interface EncryptedVaultDocument {
  // 加密头部
  header: {
    version: number;
    algorithm: 'AES-256-GCM';
    iv: string;
    key_id: string;
  };
  
  // 加密的 Vault 内容
  encrypted_data: {
    items: EncryptedVaultItem[];
    folders: EncryptedFolder[];
    settings: EncryptedSettings;
  };
  
  // 可选的加密索引（用于快速搜索）
  encrypted_index?: {
    title_hashes: string[];
    url_hashes: string[];
    tag_map: Record<string, number[]>;
  };
  
  // 版本历史
  history: {
    version: number;
    timestamp: number;
    blob_id: string;
    change_log: string;
  }[];
}

// 访问能力（Sui 对象）
interface AccessCapability {
  id: string;           // Sui object ID
  vault_id: string;     // 关联的 Vault ID
  granted_to: string;   // 被授权者地址
  granted_by: string;   // 授权者地址
  permission_level: number;  // 权限位掩码
  expires_at: number;   // 过期时间戳
  usage_count: number;  // 已使用次数
  max_usage: number;    // 最大使用次数
  conditions: AccessCondition[];  // 附加条件
}

// Vault 条目
interface EncryptedVaultItem {
  id: string;
  type: 'login' | 'card' | 'identity' | 'secure-note';
  encrypted_content: string;  // AES-256-GCM 加密
  content_hash: string;      // 内容哈希（用于验证）
  favorite: boolean;
  folder_id?: string;
  tags: string[];
  created_at: number;
  updated_at: number;
}

// zkLogin 用户配置
interface ZkLoginConfig {
  provider: 'google' | 'apple' | 'facebook' | 'twitch';
  email: string;
  address: string;       // 派生的 Sui 地址
  salt: string;          // zkLogin salt
  proof: ZkProof;       // 零知识证明
  recovery_providers: string[];  // 恢复用的 OAuth 提供商
}
```

## 4. 用户体验设计

### 4.1 用户旅程

#### 本地模式用户旅程
1. **首次使用**: 下载应用 → 设置主密码 → 开始使用（默认本地模式）
2. **日常使用**: 解锁 → 管理密码 → 本地存储
3. **升级触发**: 点击"启用云同步" → 选择绑定方式
4. **升级完成**: 绑定钱包/zkLogin → 选择同步数据 → 享受去中心化优势

#### zkLogin用户旅程
1. **快速开始**: 选择OAuth提供商 → 授权登录 → 自动创建钱包
2. **数据同步**: 本地数据自动加密上传 → 多设备实时同步
3. **设备管理**: 新设备OAuth登录 → 自动同步所有数据
4. **账户恢复**: 重新OAuth验证 → 恢复对数据的访问权限

#### 传统钱包用户旅程
1. **首次使用**: 创建/导入钱包 → 设置主密码 → 创建保险库
2. **日常使用**: 解锁 → 查找条目 → 自动填充
3. **多设备**: 新设备安装 → 导入钱包 → 同步完成
4. **恢复场景**: 输入助记词 → 重建密钥 → 恢复数据

### 4.2 界面原则
- **简洁直观**: 减少认知负担，核心功能一目了然
- **一致性**: 跨平台保持相似的操作逻辑
- **反馈及时**: 所有操作都有明确的视觉反馈
- **无障碍**: 支持键盘导航、屏幕阅读器

### 4.3 性能指标
- **启动时间**: < 2秒
- **解锁时间**: < 1秒
- **搜索响应**: < 200ms
- **同步延迟**: < 5秒 (网络正常情况下)

## 5. 安全要求

### 5.1 数据安全
- **零知识架构**: 服务器无法访问明文数据
- **本地加密**: 所有数据在本地加密后再上传
- **安全删除**: 删除操作使用安全擦除
- **内存保护**: 敏感数据使用后立即清除

### 5.2 访问控制
- **会话管理**: 可配置的自动锁定时间
- **设备管理**: 查看和撤销已授权设备
- **访问日志**: 记录所有敏感操作
- **速率限制**: 防止暴力破解

### 5.3 合规性
- **GDPR**: 符合欧盟数据保护条例
- **CCPA**: 符合加州消费者隐私法案
- **SOC 2**: 目标通过SOC 2 Type II认证

## 6. 开发路线图

### Phase 1: 本地模式 MVP (4周)
#### Week 1-2: 基础架构
- 项目初始化和开发环境搭建
- React + TypeScript + Vite 基础框架
- Zustand 状态管理配置
- Tailwind CSS 设计系统
- 加密服务实现 (AES-256-GCM, Argon2id)

#### Week 3-4: 核心功能
- 密码条目管理 (CRUD 操作)
- 本地 IndexedDB 存储
- 密码生成器 (可定制规则)
- 搜索和过滤功能
- 主密码和生物识别解锁

**交付物**: 可用的本地模式密码管理器

### Phase 2: Sui + Walrus 集成 (5周)
#### Week 5-6: Sui 智能合约
- Vault 注册表合约开发
- 访问控制合约 (AccessCapability)
- 事件系统设计
- 合约测试和优化

#### Week 7-8: Walrus 存储集成
- Walrus SDK 集成
- 文档式数据结构设计
- 加密数据上传/下载流程
- 版本控制和历史记录

#### Week 9: 数据迁移
- 本地到去中心化的数据迁移工具
- 钱包绑定功能
- zkLogin 集成
- 多设备同步框架

**交付物**: 完整的去中心化架构

### Phase 3: 增强功能 (4周)
#### Week 10-11: 用户体验
- 浏览器扩展基础框架
- 自动填充功能
- 离线模式优化
- 性能优化和缓存策略

#### Week 12-13: 高级特性
- 安全共享功能 (基于 AccessCapability)
- 团队协作功能
- 审计日志和事件追踪
- 高级安全特性 (2FA, 紧急访问)

**交付物**: 企业级功能完备的产品

### Phase 4: 生态扩展 (3周)
#### Week 14-15: 平台扩展
- 移动端适配 (React Native)
- 桌面应用 (Electron)
- API 开发和文档
- 第三方集成 SDK

#### Week 16: 优化和发布
- 安全审计和性能优化
- 文档完善和教程编写
- 主网部署准备
- 社区反馈收集和改进

**交付物**: 全平台生态产品

## 7. 成功指标

### 7.1 技术指标
- 加密/解密性能
- 同步成功率
- 交易延迟
- 存储成本效率

### 7.2 用户指标
- 日活跃用户数
- 用户留存率
- 平均使用时长
- 功能采用率

### 7.3 业务指标
- 付费转化率
- 客户获取成本
- 生命周期价值
- 净推荐值 (NPS)

## 8. 风险评估

### 8.1 技术风险
- Sui网络稳定性
- Walrus存储成本
- 加密算法漏洞
- 性能瓶颈

### 8.2 市场风险
- 竞争对手反应
- 用户接受度
- 监管变化
- 安全事件影响

### 8.3 缓解策略
- 多链支持计划
- 成本优化方案
- 定期安全审计
- 社区建设计划