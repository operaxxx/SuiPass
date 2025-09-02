# SuiPass - 去中心化密码管理器

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Sui](https://img.shields.io/badge/Sui-00B8A9?logo=sui&logoColor=white)](https://sui.io/)

SuiPass 是一个基于 Sui 区块链和 Walrus 存储的去中心化密码管理器，让用户完全掌控自己的数据，无需依赖中心化服务器。

## ✨ 核心特性

### 🔐 安全特性
- **端到端加密**: 使用 AES-256-GCM 加密所有数据，密钥永不离开设备
- **零知识架构**: 最小化链上数据，服务器无法访问任何明文数据
- **Argon2id**: 内存硬的密钥派生函数，防止暴力破解
- **前向安全**: 每次更新生成新的加密 blob，旧数据无法被访问

### 🌐 去中心化
- **Sui 身份层**: 利用 Sui 管理身份验证和所有权确认
- **Walrus 存储层**: 去中心化存储，成本仅为 Sui 的 1/100
- **zkLogin 集成**: 支持 Web2 账户无缝登录，无需管理私钥
- **能力模型**: 基于对象的访问控制，精细化管理权限

### 🚀 用户体验
- **渐进式去中心化**: 从本地模式平滑过渡到去中心化模式
- **即时响应**: 本地缓存 + 异步同步，提供毫秒级响应
- **智能同步**: 增量同步，最小化带宽消耗
- **离线优先**: 完整的离线支持，网络恢复后自动同步

### 💡 创新设计
- **分层架构**: Sui 负责身份，Walrus 负责存储，各司其职
- **固定成本**: 无论数据量大小，更新成本固定且低廉
- **版本控制**: 完整的历史记录，支持回滚和审计
- **丰富元数据**: 支持标签、文件夹、搜索索引等高级功能

## 🏗️ 架构概览

SuiPass 采用创新的分层架构，充分利用 Sui 和 Walrus 的各自优势：

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (React + TS)                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   UI Layer  │ │ State Mgmt  │ │ Crypto Svc  │           │
│  │             │ │ (Zustand)   │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
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
            │ • Minimal      │      │  • Cost-      │
            │   On-Chain     │      │    Effective  │
            └────────────────┘      └───────────────┘
                    │                      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Local Cache     │
                    │  (IndexedDB)      │
                    │  • Offline Mode   │
                    │  • Fast Access    │
                    └───────────────────┘
```

### 设计原则

1. **职责分离**: Sui 负责身份和所有权，Walrus 负责数据存储
2. **成本优化**: Walrus 存储成本比 Sui 低 100-1000 倍
3. **隐私保护**: 最小化链上数据，所有数据端到端加密
4. **高性能**: 本地缓存 + 异步同步，提供即时响应

## 📦 项目结构

```
suipass/
├── packages/                    # Monorepo packages
│   ├── frontend/               # React frontend
│   │   ├── src/
│   │   │   ├── components/     # Reusable components
│   │   │   │   ├── auth/      # Authentication components
│   │   │   │   ├── vault/     # Vault management components
│   │   │   │   ├── password/  # Password item components
│   │   │   │   └── shared/    # Shared UI components
│   │   │   ├── pages/         # Page components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── stores/        # Zustand state management
│   │   │   ├── services/      # API and blockchain services
│   │   │   │   ├── sui.ts     # Sui blockchain service
│   │   │   │   ├── walrus.ts  # Walrus storage service
│   │   │   │   ├── encryption.ts # Encryption utilities
│   │   │   │   └── storage.ts # Local storage service
│   │   │   ├── utils/         # Utility functions
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   └── constants.ts   # App constants
│   │   └── public/            # Static assets
│   ├── contracts/             # Sui Move smart contracts
│   │   ├── sources/           # Move source code
│   │   │   ├── suipass/       # Main module
│   │   │   │   ├── vault_registry.move  # Vault registry
│   │   │   │   ├── access_control.move   # Access control
│   │   │   │   └── events.move  # Event system
│   │   │   └── dependencies/  # External dependencies
│   │   ├── tests/             # Move unit tests
│   │   └── scripts/           # Deployment and utility scripts
│   └── shared/                # Shared utilities and types
│       ├── types/             # Cross-package type definitions
│       └── utils/             # Shared utility functions
├── docs/                      # Documentation
│   ├── architecture/          # Architecture documentation
│   ├── api/                   # API documentation
│   └── guides/                # Developer guides
├── scripts/                   # Build and deploy scripts
├── tests/                     # Integration tests
├── e2e/                       # End-to-end tests
└── .github/                   # GitHub workflows
    ├── workflows/             # CI/CD workflows
    └── actions/               # Custom GitHub actions
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Sui CLI (可选，用于合约开发)

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装所有 workspace 依赖
npm run bootstrap
```

### 开发环境

```bash
# 启动前端开发服务器
npm run dev

# 在另一个终端运行合约测试
npm run contract:test
```

### 构建项目

```bash
# 构建前端应用
npm run build

# 构建智能合约
npm run contract:build
```

## 🔧 开发指南

### 环境准备

1. **安装 Sui CLI**（用于合约开发）
```bash
cargo install --git https://github.com/MystenLabs/sui --branch main sui
```

2. **启动本地开发网络**
```bash
sui start
```

### 前端开发

```bash
# 进入前端目录
cd packages/frontend

# 启动开发服务器（热重载）
npm run dev

# 运行类型检查
npm run type-check

# 运行单元测试
npm test

# 运行端到端测试
npm run test:e2e

# 代码检查和格式化
npm run lint

# 构建生产版本
npm run build
```

### 智能合约开发

```bash
# 进入合约目录
cd packages/contracts

# 构建合约
npm run build

# 运行 Move 单元测试
npm run test

# 运行测试覆盖率
npm run coverage

# 部署到本地网络
npm run devnet:deploy

# 生成合约文档
npm run docs

# 代码检查
npm run lint
```

### Walrus 集成开发

```bash
# 安装 Walrus CLI（可选）
cargo install --git https://github.com/MystenLabs/walrus --branch main walrus

# 启动本地 Walrus 节点
walrus server start

# 测试 Walrus 存储功能
npm run test:walrus
```

### 开发工作流

#### 1. 添加新功能

**前端功能**:
- 在 `packages/frontend/src/components/` 中添加组件
- 在 `packages/frontend/src/services/` 中添加服务
- 更新 `packages/frontend/src/types/` 中的类型定义
- 编写相应的单元测试和集成测试

**智能合约功能**:
- 在 `packages/contracts/sources/suipass/` 中编写 Move 代码
- 在 `packages/contracts/tests/` 中添加测试用例
- 更新部署脚本（如需要）

#### 2. 数据流设计

开发新功能时请遵循以下数据流：
1. **创建/更新**: 客户端加密 → Walrus 存储 → Sui 更新引用
2. **读取**: Sui 验证权限 → Walrus 获取数据 → 客户端解密
3. **权限管理**: Sui 创建/转移能力对象

#### 3. 测试策略

- **单元测试**: 测试所有核心逻辑
- **集成测试**: 测试 Sui + Walrus 交互
- **E2E 测试**: 测试完整的用户流程
- **性能测试**: 确保 Gas 成本在预期范围内

### 常见任务

#### 运行完整的测试套件
```bash
# 根目录运行所有测试
npm test

# 运行 E2E 测试
npm run test:e2e

# 运行合约测试
npm run contract:test
```

#### 代码质量检查
```bash
# 检查所有包
npm run lint

# 格式化代码
npm run format

# 类型检查
npm run type-check
```

## 📚 文档

### 核心文档
- [产品需求文档](docs/PRD.md) - 完整的产品需求和技术架构
- [开发计划](docs/DEVELOPMENT_PLAN.md) - 整体开发策略和路线图
- [第一阶段计划](docs/PHASE1_PLAN.md) - 详细的 Phase 1 实施计划

### 技术文档
- [架构设计](docs/architecture/) - 分层架构详细说明
- [API 参考](docs/api/) - 前端和合约 API 文档
- [部署指南](docs/deployment/) - 环境搭建和部署流程

### 开发指南
- [UI/UX 设计系统](docs/UI-UX-Design-System.md)
- [UI 原型示例](docs/UI-Prototype-Examples.md)
- [本地模式原型](docs/UI-Prototype-Local-Mode.md)
- [贡献指南](CONTRIBUTING.md)

## 🛡️ 安全最佳实践

### 数据加密
- **端到端加密**: 所有敏感数据使用 AES-256-GCM 加密，密钥永不离开设备
- **密钥派生**: 使用 Argon2id 从主密码派生加密密钥
- **密钥管理**: 支持密钥轮换和紧急恢复机制
- **安全删除**: 敏感数据使用安全擦除，内存数据立即清除

### 智能合约安全
- **最小化原则**: Sui 合约只管理必要的身份和权限信息
- **访问控制**: 基于能力模型的细粒度权限管理
- **形式化验证**: 利用 Move 语言的安全特性进行验证
- **定期审计**: 定期进行代码审计和安全测试

### 网络安全
- **通信安全**: 所有通信使用 HTTPS 和 TLS 1.3
- **内容安全**: 实施 CSP (Content Security Policy) 防止 XSS
- **依赖管理**: 定期更新依赖项，使用安全扫描工具
- **速率限制**: 防止暴力破解和 DDoS 攻击

### 隐私保护
- **数据最小化**: 只收集和存储必要的信息
- **匿名化**: 支持使用 zkLogin 等匿名登录方式
- **用户控制**: 用户完全控制自己的数据和共享权限
- **合规性**: 符合 GDPR、CCPA 等隐私法规

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 开发流程

1. 从 `main` 分支创建新的功能分支
2. 确保所有测试通过
3. 更新相关文档
4. 提交 PR 前进行代码审查

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Sui](https://sui.io/) - 高性能区块链平台
- [Walrus](https://walrus.ai/) - 去中心化存储系统
- [React](https://react.dev/) - 前端框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

## 📞 联系我们

- GitHub Issues: [报告问题](https://github.com/your-org/suipass/issues)
- Discord: [加入社区](https://discord.gg/suipass)
- Twitter: [@SuiPass](https://twitter.com/suipass)

---

⭐ 如果这个项目对你有帮助，请给我们一个星标！