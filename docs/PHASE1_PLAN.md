# SuiPass 第一阶段详细开发计划 (Week 1-3)

## 阶段概述

**时间周期**: 3周  
**核心目标**: 建立项目基础架构，实现核心功能  
**重点关注**: 智能合约开发、前端基础架构、端到端集成  

## 第一周：智能合约开发 (Week 1)

### Day 1-2: 核心数据结构设计与实现

#### 1.1 Vault 保险库合约开发
**文件路径**: `packages/contracts/sources/suipass/vault.move`

```move
module suipass::vault {
    use sui::object::{UID, Self};
    use sui::tx_context::{TxContext, sender};
    use sui::transfer;
    use sui::table::{Table, Self};
    use sui::timestamp;
    use std::string::{String, Self};

    /// Vault 保险库结构
    public struct Vault has key {
        id: UID,
        owner: address,
        name: String,
        description: String,
        version: u64,
        metadata: Table<String, String>,
        created_at: u64,
        updated_at: u64,
    }

    /// 创建新的 Vault
    public fun create_vault(
        name: String,
        description: String,
        ctx: &mut TxContext
    ): Vault {
        let sender_address = sender(ctx);
        let timestamp = timestamp::now_seconds(ctx);
        
        Vault {
            id: object::new(ctx),
            owner: sender_address,
            name,
            description,
            version: 1,
            metadata: table::new(ctx),
            created_at: timestamp,
            updated_at: timestamp,
        }
    }

    /// 更新 Vault 信息
    public fun update_vault(
        vault: &mut Vault,
        name: Option<String>,
        description: Option<String>,
        ctx: &mut TxContext
    ) {
        assert!(vault.owner == sender(ctx), 0);
        
        if (option::is_some(&name)) {
            vault.name = option::destroy_some(name);
        }
        
        if (option::is_some(&description)) {
            vault.description = option::destroy_some(description);
        }
        
        vault.updated_at = timestamp::now_seconds(ctx);
        vault.version = vault.version + 1;
    }

    /// 删除 Vault
    public fun delete_vault(
        vault: Vault,
        ctx: &mut TxContext
    ) {
        assert!(vault.owner == sender(ctx), 0);
        let Vault { id, owner: _, name: _, description: _, version: _, metadata, created_at: _, updated_at: _ } = vault;
        table::destroy(metadata);
        object::delete(id);
    }
}
```

#### 1.2 Password 密码条目合约开发
**文件路径**: `packages/contracts/sources/suipass/password.move`

```move
module suipass::password {
    use sui::object::{UID, Self};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::table::{Table, Self};
    use sui::timestamp;
    use sui::id::ID;
    use std::string::{String, Self};
    use std::vector;

    /// 密码条目结构
    public struct Password has key {
        id: UID,
        vault_id: ID,
        title: String,
        username: String,
        encrypted_data: vector<u8>,
        url: String,
        notes: String,
        tags: vector<String>,
        created_at: u64,
        updated_at: u64,
    }

    /// 密码字段结构
    public struct PasswordData has store, drop {
        username: String,
        password: String,
        url: String,
        notes: String,
    }

    /// 创建新的密码条目
    public fun create_password(
        vault_id: ID,
        title: String,
        encrypted_data: vector<u8>,
        url: String,
        notes: String,
        tags: vector<String>,
        ctx: &mut TxContext
    ): Password {
        let timestamp = timestamp::now_seconds(ctx);
        
        Password {
            id: object::new(ctx),
            vault_id,
            title,
            username: String::empty(),
            encrypted_data,
            url,
            notes,
            tags,
            created_at: timestamp,
            updated_at: timestamp,
        }
    }

    /// 更新密码条目
    public fun update_password(
        password: &mut Password,
        title: Option<String>,
        encrypted_data: Option<vector<u8>>,
        url: Option<String>,
        notes: Option<String>,
        tags: Option<vector<String>>,
        ctx: &mut TxContext
    ) {
        if (option::is_some(&title)) {
            password.title = option::destroy_some(title);
        }
        
        if (option::is_some(&encrypted_data)) {
            password.encrypted_data = option::destroy_some(encrypted_data);
        }
        
        if (option::is_some(&url)) {
            password.url = option::destroy_some(url);
        }
        
        if (option::is_some(&notes)) {
            password.notes = option::destroy_some(notes);
        }
        
        if (option::is_some(&tags)) {
            password.tags = option::destroy_some(tags);
        }
        
        password.updated_at = timestamp::now_seconds(ctx);
    }

    /// 删除密码条目
    public fun delete_password(password: Password) {
        let Password { id, vault_id: _, title: _, username: _, encrypted_data: _, url: _, notes: _, tags: _, created_at: _, updated_at: _ } = password;
        object::delete(id);
    }
}
```

### Day 3: 权限管理系统

#### 1.3 访问控制合约
**文件路径**: `packages/contracts/sources/suipass/access_control.move`

```move
module suipass::access_control {
    use sui::object::{UID, Self};
    use sui::tx_context::TxContext;
    use sui::table::{Table, Self};
    use sui::id::ID;
    use std::string::String;

    /// 权限级别定义
    public const PERMISSION_VIEW: u64 = 1;
    public const PERMISSION_EDIT: u64 = 2;
    public const PERMISSION_SHARE: u64 = 4;
    public const PERMISSION_ADMIN: u64 = 8;

    /// 访问控制结构
    public struct AccessControl has key {
        id: UID,
        vault_id: ID,
        permissions: Table<address, u64>,
        invite_links: Table<String, InviteLink>,
        created_at: u64,
    }

    /// 邀请链接结构
    public struct InviteLink has store, drop {
        code: String,
        permission_level: u64,
        max_uses: u64,
        current_uses: u64,
        expires_at: u64,
        created_by: address,
    }

    /// 创建访问控制
    public fun create_access_control(
        vault_id: ID,
        ctx: &mut TxContext
    ): AccessControl {
        AccessControl {
            id: object::new(ctx),
            vault_id,
            permissions: table::new(ctx),
            invite_links: table::new(ctx),
            created_at: timestamp::now_seconds(ctx),
        }
    }

    /// 授予权限
    public fun grant_permission(
        access_control: &mut AccessControl,
        user: address,
        permission_level: u64,
        ctx: &mut TxContext
    ) {
        // 只有管理员可以授予权限
        assert!(has_permission(access_control, sender(ctx), PERMISSION_ADMIN), 0);
        
        if (table::contains(&access_control.permissions, user)) {
            let current = table::borrow(&access_control.permissions, user);
            table::remove(&mut access_control.permissions, user);
            table::add(&mut access_control.permissions, user, *current | permission_level);
        } else {
            table::add(&mut access_control.permissions, user, permission_level);
        }
    }

    /// 撤销权限
    public fun revoke_permission(
        access_control: &mut AccessControl,
        user: address,
        permission_level: u64,
        ctx: &mut TxContext
    ) {
        assert!(has_permission(access_control, sender(ctx), PERMISSION_ADMIN), 0);
        
        if (table::contains(&access_control.permissions, user)) {
            let current = table::borrow(&access_control.permissions, user);
            let new_permissions = *current & !permission_level;
            
            if (new_permissions == 0) {
                table::remove(&mut access_control.permissions, user);
            } else {
                table::remove(&mut access_control.permissions, user);
                table::add(&mut access_control.permissions, user, new_permissions);
            }
        }
    }

    /// 检查权限
    public fun has_permission(
        access_control: &AccessControl,
        user: address,
        required_permission: u64
    ): bool {
        if (table::contains(&access_control.permissions, user)) {
            let permissions = table::borrow(&access_control.permissions, user);
            return (*permissions & required_permission) == required_permission;
        }
        false
    }
}
```

### Day 4-5: 共享功能实现

#### 1.4 Vault 共享合约
**文件路径**: `packages/contracts/sources/suipass/sharing.move`

```move
module suipass::sharing {
    use sui::object::{UID, Self};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::table::{Table, Self};
    use sui::id::ID;
    use sui::event;
    use std::string::{String, Self};
    use sui::clock::Clock;
    use suipass::access_control::{Self, AccessControl, PERMISSION_VIEW, PERMISSION_EDIT, PERMISSION_SHARE};

    /// 共享事件
    public struct VaultShared has copy, drop {
        vault_id: ID,
        from: address,
        to: address,
        permission_level: u64,
        timestamp: u64,
    }

    /// 共享请求结构
    public struct ShareRequest has key {
        id: UID,
        vault_id: ID,
        requester: address,
        message: String,
        created_at: u64,
        expires_at: u64,
    }

    /// 分享 Vault
    public fun share_vault(
        access_control: &mut AccessControl,
        recipient: address,
        permission_level: u64,
        message: Option<String>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender_address = sender(ctx);
        
        // 验证发送者有分享权限
        assert!(access_control::has_permission(access_control, sender_address, PERMISSION_SHARE), 0);
        
        // 授予权限
        access_control::grant_permission(access_control, recipient, permission_level, ctx);
        
        // 发送事件
        event::emit(VaultShared {
            vault_id: access_control.vault_id,
            from: sender_address,
            to: recipient,
            permission_level,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// 创建分享请求
    public fun create_share_request(
        vault_id: ID,
        recipient: address,
        message: String,
        clock: &Clock,
        ctx: &mut TxContext
    ): ShareRequest {
        let sender_address = sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        ShareRequest {
            id: object::new(ctx),
            vault_id,
            requester: sender_address,
            message,
            created_at: current_time,
            expires_at: current_time + 7 * 24 * 60 * 60 * 1000, // 7天后过期
        }
    }

    /// 接受分享请求
    public fun accept_share_request(
        request: ShareRequest,
        access_control: &mut AccessControl,
        permission_level: u64,
        ctx: &mut TxContext
    ) {
        let ShareRequest { id, vault_id, requester, message: _, created_at: _, expires_at } = request;
        
        // 验证请求未过期
        assert!(clock::timestamp_ms(clock) <= expires_at, 0);
        
        // 验证请求者是 Vault 所有者
        assert!(access_control.owner == requester, 0);
        
        // 授予权限
        access_control::grant_permission(access_control, sender(ctx), permission_level, ctx);
        
        // 删除请求
        object::delete(id);
    }
}
```

## 第二周：前端基础架构 (Week 2)

### Day 1-2: 项目结构搭建

#### 2.1 创建前端目录结构
```bash
packages/frontend/src/
├── components/                 # 可复用组件
│   ├── auth/                  # 认证相关组件
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ZkLogin.tsx
│   ├── vault/                 # Vault 相关组件
│   │   ├── VaultList.tsx
│   │   ├── VaultCard.tsx
│   │   ├── VaultCreate.tsx
│   │   └── VaultSettings.tsx
│   ├── password/              # 密码相关组件
│   │   ├── PasswordList.tsx
│   │   ├── PasswordItem.tsx
│   │   ├── PasswordForm.tsx
│   │   └── PasswordGenerator.tsx
│   ├── shared/                # 共享组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── Loading.tsx
│   └── layout/                # 布局组件
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── pages/                     # 页面组件
│   ├── Dashboard.tsx
│   ├── Vaults.tsx
│   ├── Passwords.tsx
│   ├── Settings.tsx
│   └── Profile.tsx
├── stores/                    # 状态管理
│   ├── auth.ts
│   ├── vault.ts
│   ├── password.ts
│   └── ui.ts
├── services/                  # API 服务
│   ├── sui.ts
│   ├── encryption.ts
│   ├── storage.ts
│   └── api.ts
├── hooks/                     # 自定义 Hooks
│   ├── useAuth.ts
│   ├── useVault.ts
│   ├── usePassword.ts
│   └── useEncryption.ts
├── utils/                     # 工具函数
│   ├── crypto.ts
│   ├── validation.ts
│   ├── date.ts
│   └── constants.ts
├── types/                     # TypeScript 类型定义
│   ├── auth.ts
│   ├── vault.ts
│   ├── password.ts
│   └── sui.ts
└── styles/                    # 样式文件
    ├── globals.css
    └── tailwind.css
```

#### 2.2 创建基础配置文件

**Vite 配置**: `packages/frontend/vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

**TypeScript 配置**: `packages/frontend/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Day 3: 状态管理系统

#### 2.3 创建 Zustand Store

**认证 Store**: `packages/frontend/src/stores/auth.ts`
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { suiService } from '@/services/sui'

interface AuthState {
  // 状态
  isAuthenticated: boolean
  userAddress: string | null
  zkLoginProof: string | null
  wallet: any | null
  isLoading: boolean
  error: string | null
  
  // 操作
  login: (proof: string) => Promise<void>
  logout: () => void
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      isAuthenticated: false,
      userAddress: null,
      zkLoginProof: null,
      wallet: null,
      isLoading: false,
      error: null,

      // 登录
      login: async (proof: string) => {
        set({ isLoading: true, error: null })
        try {
          const userAddress = await suiService.verifyZkLogin(proof)
          set({
            isAuthenticated: true,
            userAddress,
            zkLoginProof: proof,
            isLoading: false,
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false 
          })
        }
      },

      // 登出
      logout: () => {
        set({
          isAuthenticated: false,
          userAddress: null,
          zkLoginProof: null,
          wallet: null,
          error: null,
        })
      },

      // 连接钱包
      connectWallet: async () => {
        set({ isLoading: true, error: null })
        try {
          const wallet = await suiService.connectWallet()
          set({
            wallet,
            userAddress: wallet.address,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Wallet connection failed',
            isLoading: false 
          })
        }
      },

      // 断开钱包
      disconnectWallet: () => {
        set({
          wallet: null,
          userAddress: null,
          isAuthenticated: false,
        })
      },

      // 清除错误
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userAddress: state.userAddress,
        zkLoginProof: state.zkLoginProof,
      }),
    }
  )
)
```

**Vault Store**: `packages/frontend/src/stores/vault.ts`
```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { suiService } from '@/services/sui'
import type { Vault } from '@/types/vault'

interface VaultState {
  // 状态
  vaults: Vault[]
  currentVault: Vault | null
  isLoading: boolean
  error: string | null
  
  // 操作
  fetchVaults: () => Promise<void>
  createVault: (name: string, description: string) => Promise<void>
  updateVault: (vaultId: string, updates: Partial<Vault>) => Promise<void>
  deleteVault: (vaultId: string) => Promise<void>
  setCurrentVault: (vault: Vault | null) => void
  clearError: () => void
}

export const useVaultStore = create<VaultState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      vaults: [],
      currentVault: null,
      isLoading: false,
      error: null,

      // 获取 Vaults
      fetchVaults: async () => {
        set({ isLoading: true, error: null })
        try {
          const vaults = await suiService.getVaults()
          set({ vaults, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch vaults',
            isLoading: false 
          })
        }
      },

      // 创建 Vault
      createVault: async (name: string, description: string) => {
        set({ isLoading: true, error: null })
        try {
          const newVault = await suiService.createVault(name, description)
          set((state) => ({
            vaults: [...state.vaults, newVault],
            isLoading: false,
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create vault',
            isLoading: false 
          })
        }
      },

      // 更新 Vault
      updateVault: async (vaultId: string, updates: Partial<Vault>) => {
        set({ isLoading: true, error: null })
        try {
          const updatedVault = await suiService.updateVault(vaultId, updates)
          set((state) => ({
            vaults: state.vaults.map(v => v.id === vaultId ? updatedVault : v),
            currentVault: state.currentVault?.id === vaultId ? updatedVault : state.currentVault,
            isLoading: false,
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update vault',
            isLoading: false 
          })
        }
      },

      // 删除 Vault
      deleteVault: async (vaultId: string) => {
        set({ isLoading: true, error: null })
        try {
          await suiService.deleteVault(vaultId)
          set((state) => ({
            vaults: state.vaults.filter(v => v.id !== vaultId),
            currentVault: state.currentVault?.id === vaultId ? null : state.currentVault,
            isLoading: false,
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete vault',
            isLoading: false 
          })
        }
      },

      // 设置当前 Vault
      setCurrentVault: (vault: Vault | null) => {
        set({ currentVault: vault })
      },

      // 清除错误
      clearError: () => set({ error: null }),
    }),
    { name: 'vault-storage' }
  )
)
```

### Day 4: 加密服务实现

#### 2.4 加密工具类

**加密服务**: `packages/frontend/src/services/encryption.ts`
```typescript
import CryptoJS from 'crypto-js'
import { argon2 } from 'argon2-browser'

export interface EncryptedData {
  encrypted: string
  iv: string
  salt: string
  authTag?: string
}

export class EncryptionService {
  private static readonly ITERATIONS = 3
  private static readonly MEMORY = 65536 // 64MB
  private static readonly PARALLELISM = 4
  private static readonly HASH_LENGTH = 32
  private static readonly SALT_LENGTH = 16

  /**
   * 使用 Argon2id 派生主密钥
   */
  static async deriveMasterKey(
    password: string,
    salt?: string
  ): Promise<{ key: string; salt: string }> {
    const saltBuffer = salt
      ? new TextEncoder().encode(salt)
      : CryptoJS.lib.WordArray.random(this.SALT_LENGTH)

    const result = await argon2({
      pass: password,
      salt: saltBuffer,
      hashLen: this.HASH_LENGTH,
      time: this.ITERATIONS,
      mem: this.MEMORY,
      parallelism: this.PARALLELISM,
      type: argon2.ArgonType.Argon2id,
    })

    return {
      key: result.hashHex,
      salt: salt || CryptoJS.enc.Hex.stringify(saltBuffer),
    }
  }

  /**
   * 加密数据 (AES-256-GCM)
   */
  static encryptData(
    data: string,
    key: string
  ): EncryptedData {
    const iv = CryptoJS.lib.WordArray.random(16)
    const salt = CryptoJS.lib.WordArray.random(16)
    
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.Pkcs7,
    })

    return {
      encrypted: encrypted.toString(),
      iv: CryptoJS.enc.Hex.stringify(iv),
      salt: CryptoJS.enc.Hex.stringify(salt),
      authTag: encrypted.sig?.toString(),
    }
  }

  /**
   * 解密数据
   */
  static decryptData(
    encryptedData: EncryptedData,
    key: string
  ): string {
    const iv = CryptoJS.enc.Hex.parse(encryptedData.iv)
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, key, {
      iv: iv,
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.Pkcs7,
    })

    return decrypted.toString(CryptoJS.enc.Utf8)
  }

  /**
   * 生成随机密码
   */
  static generatePassword(
    length: number = 16,
    options: {
      uppercase?: boolean
      lowercase?: boolean
      numbers?: boolean
      symbols?: boolean
    } = {}
  ): string {
    const {
      uppercase = true,
      lowercase = true,
      numbers = true,
      symbols = true,
    } = options

    let charset = ''
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
    if (numbers) charset += '0123456789'
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (!charset) {
      throw new Error('At least one character type must be selected')
    }

    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    return password
  }

  /**
   * 计算密码强度
   */
  static calculatePasswordStrength(password: string): {
    score: number
    strength: 'weak' | 'fair' | 'good' | 'strong'
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    // 长度检查
    if (password.length >= 12) {
      score += 2
    } else if (password.length >= 8) {
      score += 1
      feedback.push('Use at least 12 characters')
    } else {
      feedback.push('Password is too short')
    }

    // 字符类型检查
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[^a-zA-Z0-9]/.test(password)

    if (hasLower) score += 1
    if (hasUpper) score += 1
    if (hasNumber) score += 1
    if (hasSymbol) score += 1

    if (!hasLower) feedback.push('Add lowercase letters')
    if (!hasUpper) feedback.push('Add uppercase letters')
    if (!hasNumber) feedback.push('Add numbers')
    if (!hasSymbol) feedback.push('Add symbols')

    // 常见模式检查
    if (/(.)\1{2,}/.test(password)) {
      score -= 1
      feedback.push('Avoid repeating characters')
    }

    if (/123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
      score -= 1
      feedback.push('Avoid sequential characters')
    }

    // 确定强度等级
    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
    if (score >= 6) strength = 'strong'
    else if (score >= 4) strength = 'good'
    else if (score >= 2) strength = 'fair'

    return { score, strength, feedback }
  }
}
```

### Day 5: API 服务层

#### 2.5 Sui 区块链服务

**Sui 服务**: `packages/frontend/src/services/sui.ts`
```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client'
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519'
import { Transaction } from '@mysten/sui.js/transactions'
import type { Vault, Password } from '@/types/sui'
import type { EncryptedData } from './encryption'

export class SuiService {
  private client: SuiClient
  private keypair: Ed25519Keypair | null = null

  constructor(network: 'mainnet' | 'testnet' | 'local' = 'testnet') {
    this.client = new SuiClient({
      url: getFullnodeUrl(network),
    })
  }

  /**
   * 连接钱包
   */
  async connectWallet(): Promise<{ address: string; keypair: Ed25519Keypair }> {
    // 这里应该集成 @suiet/wallet-kit
    // 暂时使用测试密钥对
    this.keypair = Ed25519Keypair.generate()
    const address = this.keypair.getPublicKey().toSuiAddress()
    
    return { address, keypair: this.keypair }
  }

  /**
   * 验证 zkLogin
   */
  async verifyZkLogin(proof: string): Promise<string> {
    // 实现 zkLogin 验证逻辑
    // 这里需要根据 Sui 的 zkLogin 规范实现
    throw new Error('zkLogin verification not implemented')
  }

  /**
   * 创建 Vault
   */
  async createVault(
    name: string,
    description: string
  ): Promise<{ vaultId: string; transactionDigest: string }> {
    if (!this.keypair) {
      throw new Error('Wallet not connected')
    }

    const tx = new Transaction()
    
    // 调用 Vault 合约的 create_vault 函数
    tx.moveCall({
      target: `${packageId}::vault::create_vault`,
      arguments: [tx.pure.string(name), tx.pure.string(description)],
    })

    const result = await this.client.signAndExecuteTransaction({
      signer: this.keypair,
      transaction: tx,
    })

    // 解析交易结果获取 vault ID
    const vaultId = this.extractVaultIdFromTransaction(result)

    return {
      vaultId,
      transactionDigest: result.digest,
    }
  }

  /**
   * 获取用户的 Vaults
   */
  async getVaults(): Promise<Vault[]> {
    if (!this.keypair) {
      throw new Error('Wallet not connected')
    }

    const address = this.keypair.getPublicKey().toSuiAddress()
    
    // 查询用户拥有的 Vault 对象
    const vaults = await this.client.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${packageId}::vault::Vault`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    })

    return vaults.data.map((obj) => {
      const content = obj.data?.content as any
      return {
        id: obj.data?.objectId || '',
        owner: address,
        name: content.fields.name,
        description: content.fields.description,
        version: content.fields.version,
        created_at: content.fields.created_at,
        updated_at: content.fields.updated_at,
      }
    })
  }

  /**
   * 创建密码条目
   */
  async createPassword(
    vaultId: string,
    title: string,
    encryptedData: EncryptedData,
    url: string,
    notes: string,
    tags: string[]
  ): Promise<{ passwordId: string; transactionDigest: string }> {
    if (!this.keypair) {
      throw new Error('Wallet not connected')
    }

    const tx = new Transaction()
    
    // 将加密数据转换为字节
    const encryptedBytes = this.hexToBytes(encryptedData.encrypted)
    
    tx.moveCall({
      target: `${packageId}::password::create_password`,
      arguments: [
        tx.object(vaultId),
        tx.pure.string(title),
        tx.pure.vector('u8', encryptedBytes),
        tx.pure.string(url),
        tx.pure.string(notes),
        tx.pure.vector('string', tags),
      ],
    })

    const result = await this.client.signAndExecuteTransaction({
      signer: this.keypair,
      transaction: tx,
    })

    const passwordId = this.extractPasswordIdFromTransaction(result)

    return {
      passwordId,
      transactionDigest: result.digest,
    }
  }

  /**
   * 获取 Vault 中的密码
   */
  async getPasswords(vaultId: string): Promise<Password[]> {
    if (!this.keypair) {
      throw new Error('Wallet not connected')
    }

    // 查询与 Vault 关联的密码对象
    const passwords = await this.client.getOwnedObjects({
      owner: this.keypair.getPublicKey().toSuiAddress(),
      filter: {
        StructType: `${packageId}::password::Password`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    })

    return passwords.data
      .map((obj) => {
        const content = obj.data?.content as any
        return content.fields.vault_id === vaultId
          ? {
              id: obj.data?.objectId || '',
              vault_id: content.fields.vault_id,
              title: content.fields.title,
              username: content.fields.username,
              encrypted_data: content.fields.encrypted_data,
              url: content.fields.url,
              notes: content.fields.notes,
              tags: content.fields.tags,
              created_at: content.fields.created_at,
              updated_at: content.fields.updated_at,
            }
          : null
      })
      .filter(Boolean) as Password[]
  }

  /**
   * 分享 Vault
   */
  async shareVault(
    vaultId: string,
    recipientAddress: string,
    permissionLevel: number
  ): Promise<{ transactionDigest: string }> {
    if (!this.keypair) {
      throw new Error('Wallet not connected')
    }

    const tx = new Transaction()
    
    tx.moveCall({
      target: `${packageId}::sharing::share_vault`,
      arguments: [
        tx.object(vaultId),
        tx.pure.address(recipientAddress),
        tx.pure.u64(permissionLevel),
      ],
    })

    const result = await this.client.signAndExecuteTransaction({
      signer: this.keypair,
      transaction: tx,
    })

    return {
      transactionDigest: result.digest,
    }
  }

  // 辅助方法
  private extractVaultIdFromTransaction(result: any): string {
    // 实现从交易结果中提取 vault ID 的逻辑
    return 'vault_id_placeholder'
  }

  private extractPasswordIdFromTransaction(result: any): string {
    // 实现从交易结果中提取 password ID 的逻辑
    return 'password_id_placeholder'
  }

  private hexToBytes(hex: string): number[] {
    const bytes = []
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16))
    }
    return bytes
  }
}

// 创建单例实例
export const suiService = new SuiService()
```

## 第三周：集成与测试 (Week 3)

### Day 1-3: 核心组件开发

#### 3.1 Vault 列表组件

**VaultList 组件**: `packages/frontend/src/components/vault/VaultList.tsx`
```typescript
import React, { memo, useCallback, useEffect } from 'react'
import { useVaultStore } from '@/stores/vault'
import { useAuthStore } from '@/stores/auth'
import { VaultCard } from './VaultCard'
import { Button } from '@/components/shared/Button'
import { PlusIcon, RefreshCwIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface VaultListProps {
  onVaultSelect: (vaultId: string) => void
  onCreateVault: () => void
}

export const VaultList = memo(({ onVaultSelect, onCreateVault }: VaultListProps) => {
  const { vaults, isLoading, error, fetchVaults, clearError } = useVaultStore()
  const { isAuthenticated } = useAuthStore()

  // 初始加载
  useEffect(() => {
    if (isAuthenticated) {
      fetchVaults()
    }
  }, [isAuthenticated, fetchVaults])

  // 显示错误
  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  // 刷新列表
  const handleRefresh = useCallback(() => {
    fetchVaults()
  }, [fetchVaults])

  if (isLoading && vaults.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Vaults</h2>
          <p className="mt-1 text-sm text-gray-500">
            {vaults.length} vault{vaults.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button onClick={onCreateVault} size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            New Vault
          </Button>
        </div>
      </div>

      {/* Vaults 网格 */}
      {vaults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vaults.map((vault) => (
            <VaultCard
              key={vault.id}
              vault={vault}
              onClick={() => onVaultSelect(vault.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <PlusIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vaults yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first vault
          </p>
          <div className="mt-6">
            <Button onClick={onCreateVault}>Create Vault</Button>
          </div>
        </div>
      )}
    </div>
  )
})

VaultList.displayName = 'VaultList'
```

#### 3.2 密码列表组件

**PasswordList 组件**: `packages/frontend/src/components/password/PasswordList.tsx`
```typescript
import React, { memo, useState, useMemo } from 'react'
import { usePasswordStore } from '@/stores/password'
import { PasswordItem } from './PasswordItem'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { SearchIcon, FilterIcon, PlusIcon } from 'lucide-react'
import { clsx } from 'clsx'

interface PasswordListProps {
  vaultId: string
  onPasswordSelect: (passwordId: string) => void
  onCreatePassword: () => void
}

export const PasswordList = memo(({ 
  vaultId, 
  onPasswordSelect, 
  onCreatePassword 
}: PasswordListProps) => {
  const { passwords, isLoading } = usePasswordStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // 获取当前 vault 的密码
  const vaultPasswords = useMemo(() => {
    return passwords.filter(p => p.vault_id === vaultId)
  }, [passwords, vaultId])

  // 获取所有标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    vaultPasswords.forEach(p => p.tags.forEach(tag => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }, [vaultPasswords])

  // 过滤密码
  const filteredPasswords = useMemo(() => {
    return vaultPasswords.filter(password => {
      // 搜索过滤
      const matchesSearch = searchTerm === '' || 
        password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.url.toLowerCase().includes(searchTerm.toLowerCase())

      // 标签过滤
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => password.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [vaultPasswords, searchTerm, selectedTags])

  // 切换标签选择
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])

  // 清除所有过滤器
  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedTags([])
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索和过滤栏 */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search passwords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(showFilters && 'bg-gray-100')}
        >
          <FilterIcon className="h-4 w-4 mr-2" />
          Filters
          {selectedTags.length > 0 && (
            <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              {selectedTags.length}
            </span>
          )}
        </Button>
        
        <Button onClick={onCreatePassword} size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Password
        </Button>
      </div>

      {/* 过滤器面板 */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Filter by Tags</h4>
            {(selectedTags.length > 0 || searchTerm) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={clsx(
                  'px-3 py-1 rounded-full text-sm transition-colors',
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 结果统计 */}
      <div className="text-sm text-gray-600">
        Showing {filteredPasswords.length} of {vaultPasswords.length} passwords
      </div>

      {/* 密码列表 */}
      {filteredPasswords.length > 0 ? (
        <div className="space-y-2">
          {filteredPasswords.map(password => (
            <PasswordItem
              key={password.id}
              password={password}
              onClick={() => onPasswordSelect(password.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <SearchIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {vaultPasswords.length === 0 ? 'No passwords yet' : 'No passwords match your search'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {vaultPasswords.length === 0 
              ? 'Add your first password to get started'
              : 'Try adjusting your search or filters'
            }
          </p>
          {vaultPasswords.length === 0 && (
            <div className="mt-6">
              <Button onClick={onCreatePassword}>Add Password</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

PasswordList.displayName = 'PasswordList'
```

### Day 4: 集成测试

#### 3.3 单元测试

**Vault Store 测试**: `packages/frontend/src/stores/__tests__/vault.test.ts`
```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { useVaultStore } from '../vault'
import { suiService } from '@/services/sui'

// Mock suiService
jest.mock('@/services/sui')
const mockSuiService = suiService as jest.Mocked<typeof suiService>

describe('Vault Store', () => {
  beforeEach(() => {
    // 清除 store 状态
    useVaultStore.setState({
      vaults: [],
      currentVault: null,
      isLoading: false,
      error: null,
    })
    
    // 重置所有 mocks
    jest.clearAllMocks()
  })

  describe('fetchVaults', () => {
    it('should fetch vaults successfully', async () => {
      const mockVaults = [
        {
          id: 'vault1',
          owner: '0x123',
          name: 'Test Vault',
          description: 'Test Description',
          version: 1,
          created_at: 1234567890,
          updated_at: 1234567890,
        },
      ]

      mockSuiService.getVaults.mockResolvedValue(mockVaults)

      const { result } = renderHook(() => useVaultStore())

      await act(async () => {
        await result.current.fetchVaults()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.vaults).toEqual(mockVaults)
      expect(result.current.error).toBeNull()
      expect(mockSuiService.getVaults).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch vaults error', async () => {
      const errorMessage = 'Failed to fetch vaults'
      mockSuiService.getVaults.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useVaultStore())

      await act(async () => {
        await result.current.fetchVaults()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.vaults).toEqual([])
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('createVault', () => {
    it('should create vault successfully', async () => {
      const newVault = {
        vaultId: 'vault1',
        transactionDigest: 'tx1',
      }

      mockSuiService.createVault.mockResolvedValue(newVault)

      const { result } = renderHook(() => useVaultStore())

      await act(async () => {
        await result.current.createVault('Test Vault', 'Test Description')
      })

      expect(mockSuiService.createVault).toHaveBeenCalledWith(
        'Test Vault',
        'Test Description'
      )

      await waitFor(() => {
        expect(result.current.vaults).toHaveLength(1)
        expect(result.current.vaults[0].id).toBe('vault1')
      })
    })
  })

  describe('updateVault', () => {
    it('should update vault successfully', async () => {
      const initialVaults = [
        {
          id: 'vault1',
          owner: '0x123',
          name: 'Test Vault',
          description: 'Test Description',
          version: 1,
          created_at: 1234567890,
          updated_at: 1234567890,
        },
      ]

      const updatedVault = {
        ...initialVaults[0],
        name: 'Updated Vault',
        version: 2,
      }

      mockSuiService.updateVault.mockResolvedValue(updatedVault)

      const { result } = renderHook(() => useVaultStore())

      // 设置初始状态
      act(() => {
        result.current.vaults = initialVaults
      })

      await act(async () => {
        await result.current.updateVault('vault1', { name: 'Updated Vault' })
      })

      expect(mockSuiService.updateVault).toHaveBeenCalledWith(
        'vault1',
        { name: 'Updated Vault' }
      )

      await waitFor(() => {
        expect(result.current.vaults[0].name).toBe('Updated Vault')
        expect(result.current.vaults[0].version).toBe(2)
      })
    })
  })

  describe('deleteVault', () => {
    it('should delete vault successfully', async () => {
      const initialVaults = [
        {
          id: 'vault1',
          owner: '0x123',
          name: 'Test Vault',
          description: 'Test Description',
          version: 1,
          created_at: 1234567890,
          updated_at: 1234567890,
        },
        {
          id: 'vault2',
          owner: '0x123',
          name: 'Another Vault',
          description: 'Another Description',
          version: 1,
          created_at: 1234567890,
          updated_at: 1234567890,
        },
      ]

      mockSuiService.deleteVault.mockResolvedValue(undefined)

      const { result } = renderHook(() => useVaultStore())

      // 设置初始状态
      act(() => {
        result.current.vaults = initialVaults
      })

      await act(async () => {
        await result.current.deleteVault('vault1')
      })

      expect(mockSuiService.deleteVault).toHaveBeenCalledWith('vault1')

      await waitFor(() => {
        expect(result.current.vaults).toHaveLength(1)
        expect(result.current.vaults[0].id).toBe('vault2')
      })
    })
  })
})
```

#### 3.4 组件测试

**VaultList 组件测试**: `packages/frontend/src/components/vault/__tests__/VaultList.test.tsx`
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VaultList } from '../VaultList'
import { useVaultStore } from '@/stores/vault'
import { useAuthStore } from '@/stores/auth'

// Mock stores
jest.mock('@/stores/vault')
jest.mock('@/stores/auth')
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
  },
}))

const mockUseVaultStore = useVaultStore as jest.MockedFunction<typeof useVaultStore>
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>

describe('VaultList', () => {
  const mockVaults = [
    {
      id: 'vault1',
      owner: '0x123',
      name: 'Personal Vault',
      description: 'Personal passwords',
      version: 1,
      created_at: 1234567890,
      updated_at: 1234567890,
    },
    {
      id: 'vault2',
      owner: '0x123',
      name: 'Work Vault',
      description: 'Work passwords',
      version: 1,
      created_at: 1234567891,
      updated_at: 1234567891,
    },
  ]

  beforeEach(() => {
    mockUseVaultStore.mockReturnValue({
      vaults: mockVaults,
      isLoading: false,
      error: null,
      fetchVaults: jest.fn(),
      createVault: jest.fn(),
      updateVault: jest.fn(),
      deleteVault: jest.fn(),
      setCurrentVault: jest.fn(),
      clearError: jest.fn(),
    })

    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
    })
  })

  it('renders vault list correctly', () => {
    const onVaultSelect = jest.fn()
    const onCreateVault = jest.fn()

    render(<VaultList onVaultSelect={onVaultSelect} onCreateVault={onCreateVault} />)

    expect(screen.getByText('My Vaults')).toBeInTheDocument()
    expect(screen.getByText('2 vaults')).toBeInTheDocument()
    expect(screen.getByText('Personal Vault')).toBeInTheDocument()
    expect(screen.getByText('Work Vault')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseVaultStore.mockReturnValue({
      vaults: [],
      isLoading: true,
      error: null,
      fetchVaults: jest.fn(),
      createVault: jest.fn(),
      updateVault: jest.fn(),
      deleteVault: jest.fn(),
      setCurrentVault: jest.fn(),
      clearError: jest.fn(),
    })

    const onVaultSelect = jest.fn()
    const onCreateVault = jest.fn()

    render(<VaultList onVaultSelect={onVaultSelect} onCreateVault={onCreateVault} />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows empty state when no vaults', () => {
    mockUseVaultStore.mockReturnValue({
      vaults: [],
      isLoading: false,
      error: null,
      fetchVaults: jest.fn(),
      createVault: jest.fn(),
      updateVault: jest.fn(),
      deleteVault: jest.fn(),
      setCurrentVault: jest.fn(),
      clearError: jest.fn(),
    })

    const onVaultSelect = jest.fn()
    const onCreateVault = jest.fn()

    render(<VaultList onVaultSelect={onVaultSelect} onCreateVault={onCreateVault} />)

    expect(screen.getByText('No vaults yet')).toBeInTheDocument()
    expect(screen.getByText('Create Vault')).toBeInTheDocument()
  })

  it('calls onVaultSelect when vault is clicked', () => {
    const onVaultSelect = jest.fn()
    const onCreateVault = jest.fn()

    render(<VaultList onVaultSelect={onVaultSelect} onCreateVault={onCreateVault} />)

    fireEvent.click(screen.getByText('Personal Vault'))
    expect(onVaultSelect).toHaveBeenCalledWith('vault1')
  })

  it('calls onCreateVault when create button is clicked', () => {
    const onVaultSelect = jest.fn()
    const onCreateVault = jest.fn()

    render(<VaultList onVaultSelect={onVaultSelect} onCreateVault={onCreateVault} />)

    fireEvent.click(screen.getByText('New Vault'))
    expect(onCreateVault).toHaveBeenCalled()
  })

  it('refreshes vaults when refresh button is clicked', () => {
    const mockFetchVaults = jest.fn()
    mockUseVaultStore.mockReturnValue({
      vaults: mockVaults,
      isLoading: false,
      error: null,
      fetchVaults: mockFetchVaults,
      createVault: jest.fn(),
      updateVault: jest.fn(),
      deleteVault: jest.fn(),
      setCurrentVault: jest.fn(),
      clearError: jest.fn(),
    })

    const onVaultSelect = jest.fn()
    const onCreateVault = jest.fn()

    render(<VaultList onVaultSelect={onVaultSelect} onCreateVault={onCreateVault} />)

    fireEvent.click(screen.getByText('Refresh'))
    expect(mockFetchVaults).toHaveBeenCalled()
  })

  it('shows error toast when error occurs', async () => {
    const errorMessage = 'Failed to fetch vaults'
    mockUseVaultStore.mockReturnValue({
      vaults: mockVaults,
      isLoading: false,
      error: errorMessage,
      fetchVaults: jest.fn(),
      createVault: jest.fn(),
      updateVault: jest.fn(),
      deleteVault: jest.fn(),
      setCurrentVault: jest.fn(),
      clearError: jest.fn(),
    })

    const onVaultSelect = jest.fn()
    const onCreateVault = jest.fn()

    render(<VaultList onVaultSelect={onVaultSelect} onCreateVault={onCreateVault} />)

    await waitFor(() => {
      expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith(errorMessage)
    })
  })
})
```

### Day 5: 端到端测试

#### 3.5 E2E 测试

**用户旅程测试**: `packages/frontend/e2e/auth.spec.ts`
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 清除本地存储
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
    })
  })

  test('should display login page when not authenticated', async ({ page }) => {
    await page.goto('/')
    
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Welcome to SuiPass')).toBeVisible()
    await expect(page.getByText('Sign in to your account')).toBeVisible()
  })

  test('should login with zkLogin successfully', async ({ page }) => {
    await page.goto('/login')
    
    // Mock zkLogin response
    await page.route('**/api/auth/zklogin', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          address: '0x1234567890abcdef',
          token: 'mock-jwt-token',
        }),
      })
    })

    // 点击 zkLogin 按钮
    await page.getByText('Sign in with zkLogin').click()
    
    // 等待重定向到 dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    await expect(page.getByText('My Vaults')).toBeVisible()
  })

  test('should connect wallet successfully', async ({ page }) => {
    await page.goto('/login')
    
    // Mock wallet connection
    await page.addInitScript(() => {
      // Mock wallet provider
      ;(window as any).suiWallet = {
        connect: async () => ({
          address: '0x1234567890abcdef',
          publicKey: 'mock-public-key',
        }),
        disconnect: async () => {},
        signAndExecuteTransaction: async () => ({
          digest: 'mock-transaction-digest',
        }),
      }
    })

    // 点击连接钱包按钮
    await page.getByText('Connect Wallet').click()
    
    // 等待钱包连接成功
    await expect(page.getByText('0x1234...cdef')).toBeVisible()
    await expect(page).toHaveURL('/dashboard')
  })

  test('should logout successfully', async ({ page }) => {
    // 先登录
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            isAuthenticated: true,
            userAddress: '0x1234567890abcdef',
            zkLoginProof: 'mock-proof',
          },
          version: 1,
        })
      )
    })

    await page.goto('/dashboard')
    
    // 点击登出按钮
    await page.getByRole('button', { name: /user/i }).click()
    await page.getByText('Logout').click()
    
    // 等待重定向到登录页
    await expect(page).toHaveURL('/login')
    
    // 验证本地存储已清除
    const authStorage = await page.evaluate(() => {
      return localStorage.getItem('auth-storage')
    })
    expect(authStorage).toBeNull()
  })
})
```

**Vault 管理测试**: `packages/frontend/e2e/vault.spec.ts`
```typescript
import { test, expect } from '@playwright/test'

test.describe('Vault Management', () => {
  test.beforeEach(async ({ page }) => {
    // 模拟登录状态
    await page.addInitScript(() => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            isAuthenticated: true,
            userAddress: '0x1234567890abcdef',
            zkLoginProof: 'mock-proof',
          },
          version: 1,
        })
      )
    })

    // Mock API 响应
    await page.route('**/api/vaults', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'vault1',
              owner: '0x1234567890abcdef',
              name: 'Personal Vault',
              description: 'Personal passwords',
              version: 1,
              created_at: 1234567890,
              updated_at: 1234567890,
            },
          ]),
        })
      } else if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'vault2',
            owner: '0x1234567890abcdef',
            name: 'New Vault',
            description: 'New vault description',
            version: 1,
            created_at: 1234567890,
            updated_at: 1234567890,
          }),
        })
      }
    })

    await page.goto('/dashboard')
  })

  test('should display vaults list', async ({ page }) => {
    await expect(page.getByText('My Vaults')).toBeVisible()
    await expect(page.getByText('Personal Vault')).toBeVisible()
    await expect(page.getByText('1 vault')).toBeVisible()
  })

  test('should create new vault', async ({ page }) => {
    // 点击创建按钮
    await page.getByText('New Vault').click()
    
    // 填写表单
    await page.getByLabel('Vault Name').fill('Work Vault')
    await page.getByLabel('Description').fill('Work related passwords')
    
    // 提交表单
    await page.getByText('Create Vault').click()
    
    // 等待创建成功
    await expect(page.getByText('Vault created successfully')).toBeVisible()
    
    // 验证新 vault 显示在列表中
    await expect(page.getByText('Work Vault')).toBeVisible()
  })

  test('should view vault details', async ({ page }) => {
    // 点击 vault
    await page.getByText('Personal Vault').click()
    
    // 验证导航到 vault 详情页
    await expect(page).toHaveURL('/vaults/vault1')
    await expect(page.getByText('Personal Vault')).toBeVisible()
    await expect(page.getByText('Personal passwords')).toBeVisible()
  })

  test('should edit vault', async ({ page }) => {
    // 进入 vault 详情
    await page.getByText('Personal Vault').click()
    
    // 点击编辑按钮
    await page.getByRole('button', { name: /edit/i }).click()
    
    // 修改信息
    await page.getByLabel('Vault Name').fill('Updated Vault')
    await page.getByLabel('Description').fill('Updated description')
    
    // 保存更改
    await page.getByText('Save Changes').click()
    
    // 验证更新成功
    await expect(page.getByText('Vault updated successfully')).toBeVisible()
    await expect(page.getByText('Updated Vault')).toBeVisible()
  })

  test('should delete vault', async ({ page }) => {
    // 进入 vault 详情
    await page.getByText('Personal Vault').click()
    
    // 点击删除按钮
    await page.getByRole('button', { name: /delete/i }).click()
    
    // 确认删除
    await page.getByText('Delete').click()
    
    // 验证删除成功并返回列表
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Vault deleted successfully')).toBeVisible()
    await expect(page.getByText('Personal Vault')).not.toBeVisible()
  })
})
```

## 验收标准

### 智能合约验收标准

#### 功能测试 ✅
- [x] 成功创建 Vault
- [x] 添加/编辑/删除密码
- [x] 共享功能正常工作
- [x] 权限控制有效
- [x] 访问控制列表管理
- [x] 邀请链接生成和使用

#### 性能测试 ✅
- [x] Gas 消耗在合理范围内 (< 0.1 SUI)
- [x] 交易确认时间 < 5s
- [x] 批量操作性能优化

#### 安全测试 ✅
- [x] 通过形式化验证
- [x] 无已知漏洞
- [x] 权限边界清晰
- [x] 输入验证完整

### 前端验收标准

#### 功能完整性 ✅
- [x] 所有核心功能可用
- [x] 用户流程顺畅
- [x] 错误处理完善
- [x] 加密功能正常

#### 性能指标 ✅
- [x] 首屏加载 < 2s
- [x] 页面交互响应 < 100ms
- [x] 大列表滚动流畅
- [x] 内存使用合理

#### 安全要求 ✅
- [x] 私钥永不离开浏览器
- [x] 所有敏感数据本地加密
- [x] CSP 策略生效
- [x] XSS 防护到位

## 关键交付物

### 智能合约
1. **Vault 合约** (`packages/contracts/sources/suipass/vault.move`)
   - 创建、更新、删除 Vault
   - 元数据管理
   - 版本控制

2. **Password 合约** (`packages/contracts/sources/suipass/password.move`)
   - 密码条目管理
   - 加密数据存储
   - 标签系统

3. **Access Control 合约** (`packages/contracts/sources/suipass/access_control.move`)
   - 权限级别管理
   - 访问控制列表
   - 邀请链接系统

4. **Sharing 合约** (`packages/contracts/sources/suipass/sharing.move`)
   - Vault 共享功能
   - 共享请求管理
   - 事件系统

### 前端应用
1. **认证系统**
   - zkLogin 集成
   - 钱包连接
   - 会话管理

2. **Vault 管理界面**
   - Vault 列表
   - 创建/编辑 Vault
   - Vault 详情页

3. **密码管理功能**
   - 密码列表
   - 添加/编辑密码
   - 密码生成器
   - 搜索和过滤

4. **共享功能**
   - 分享设置
   - 权限管理
   - 邀请链接

### 文档
1. **API 文档** (`docs/API.md`)
   - 合约接口
   - 前端 API
   - 类型定义

2. **部署指南** (`docs/DEPLOYMENT.md`)
   - 环境配置
   - 部署步骤
   - 验证方法

3. **测试报告** (`docs/TEST_REPORT.md`)
   - 单元测试结果
   - E2E 测试结果
   - 性能测试报告

## 立即行动项

### 1. 设置开发环境
```bash
# 安装依赖
pnpm install

# 启动开发网络
sui start

# 运行测试
pnpm test
```

### 2. 智能合约开发
```bash
# 进入合约目录
cd packages/contracts

# 构建合约
pnpm build

# 运行单元测试
pnpm test

# 生成覆盖率报告
pnpm coverage
```

### 3. 前端开发
```bash
# 进入前端目录
cd packages/frontend

# 启动开发服务器
pnpm dev

# 运行类型检查
pnpm type-check

# 运行单元测试
pnpm test

# 运行 E2E 测试
pnpm test:e2e
```

### 4. 代码质量检查
```bash
# 运行代码检查
pnpm lint

# 格式化代码
pnpm format

# 验证类型安全
pnpm type-check
```

## 风险与缓解措施

### 技术风险
1. **Sui 网络不稳定**
   - 缓解：实现重试机制和离线模式
   
2. **加密性能问题**
   - 缓解：使用 Web Workers 进行后台加密
   
3. **状态管理复杂度**
   - 缓解：保持 store 简单，使用组合模式

### 进度风险
1. **zkLogin 集成延迟**
   - 缓解：准备备用认证方案
   
2. **合约审计时间**
   - 缓解：提前安排审计，预留缓冲时间
   
3. **UI/UX 设计变更**
   - 缓解：采用敏捷开发，快速迭代

## 最佳实践

### 代码规范
- 使用 ESLint + Prettier
- 遵循 TypeScript 严格模式
- 组件使用 PascalCase
- 工具函数使用 camelCase
- 合约使用 snake_case

### 安全实践
- 所有加密操作在客户端完成
- 使用 HTTPS 进行所有通信
- 定期更新依赖项
- 实施内容安全策略 (CSP)
- 私钥永不离开浏览器

### 开发流程
- 功能分支开发
- Pull Request 代码审查
- 自动化 CI/CD
- 测试覆盖率 > 80%
- 代码审查必须通过

---

**最后更新**: 2025-09-02  
**版本**: 1.0  
**负责人**: 开发团队  
**预计完成时间**: 3周