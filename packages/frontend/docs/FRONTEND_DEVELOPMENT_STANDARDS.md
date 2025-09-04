# SuiPass 前端开发规范

## 目录

1. [代码质量检查工具配置](#1-代码质量检查工具配置)
2. [TypeScript开发规范](#2-typescript开发规范)
3. [React开发规范](#3-react开发规范)
4. [安全开发规范](#4-安全开发规范)
5. [测试规范](#5-测试规范)
6. [文档规范](#6-文档规范)

## 1. 代码质量检查工具配置

### 1.1 ESLint配置

#### 核心插件

- **@typescript-eslint**: TypeScript语法检查
- **eslint-plugin-react**: React语法检查
- **eslint-plugin-react-hooks**: React Hooks检查
- **eslint-plugin-jsx-a11y**: 无障碍检查
- **eslint-plugin-security**: 安全漏洞检查
- **eslint-plugin-import**: 导入顺序检查
- **eslint-plugin-unicorn**: 代码质量检查
- **eslint-plugin-sonarjs**: 代码复杂度检查

#### 关键规则

```typescript
// TypeScript 规则
"@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
"@typescript-eslint/no-explicit-any": "warn"
"@typescript-eslint/no-non-null-assertion": "error"
"@typescript-eslint/no-floating-promises": "error"

// React 规则
"react-hooks/rules-of-hooks": "error"
"react-hooks/exhaustive-deps": "warn"
"react/no-array-index-key": "error"

// 安全规则
"security/detect-object-injection": "error"
"security/detect-non-literal-fs-filename": "error"

// 导入规则
"import/order": ["error", {
  "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
  "newlines-between": "always"
}]
```

### 1.2 Prettier格式化

#### 配置文件 (`.prettierrc`)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### 1.3 Husky和lint-staged

#### 提交前检查

```bash
#!/bin/bash
echo "🔍 Running pre-commit checks..."

# 运行 lint-staged
npx lint-staged

# 检查 TypeScript 类型
echo "📋 Checking TypeScript types..."
pnpm type-check

# 运行测试
echo "🧪 Running tests..."
pnpm test --run

echo "✅ All checks passed!"
```

#### Lint-staged配置

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

### 1.4 提交信息规范

#### 提交类型

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建或辅助工具变动
- `security`: 安全相关

#### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

示例：

```
feat(auth): add biometric authentication support

Add support for Touch ID and Face ID authentication
on supported devices. Includes fallback to password
authentication when biometrics fail.

Closes #123
```

## 2. TypeScript开发规范

### 2.1 类型定义原则

#### 基础类型

```typescript
// ✅ 推荐使用明确的类型
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  isActive: boolean;
}

// ❌ 避免使用any
interface UserData {
  data: any; // 避免
  metadata: unknown; // 更好
}
```

#### 工具类型

```typescript
// 深度部分类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 提取Promise返回类型
type PromiseType<T> = T extends Promise<infer U> ? U : T;

// 排除null和undefined
type NonNullable<T> = T extends null | undefined ? never : T;
```

### 2.2 接口设计原则

#### 响应类型

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: AppError;
  timestamp: number;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}
```

#### 错误类型

```typescript
interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
  stack?: string;
}
```

### 2.3 错误处理规范

#### 异步错误处理

```typescript
// ✅ 正确的异步错误处理
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw new Error('Failed to fetch user data');
  }
}

// ❌ 避免的写法
async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json(); // 没有错误处理
}
```

#### 类型守卫

```typescript
// 类型守卫函数
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj
  );
}

// 使用类型守卫
function processUserData(data: unknown) {
  if (isUser(data)) {
    console.log(data.name); // 类型安全
  }
}
```

### 2.4 异步编程规范

#### Promise使用

```typescript
// ✅ 使用async/await
async function processItems(items: Item[]): Promise<void> {
  for (const item of items) {
    try {
      await processItem(item);
    } catch (error) {
      console.error(`Failed to process item ${item.id}:`, error);
    }
  }
}

// ✅ Promise.all处理并行
async function processItemsParallel(items: Item[]): Promise<void> {
  try {
    await Promise.all(items.map(item => processItem(item)));
  } catch (error) {
    console.error('Failed to process items:', error);
  }
}
```

## 3. React开发规范

### 3.1 组件命名和结构

#### 文件命名

```
components/
├── PasswordInput/
│   ├── PasswordInput.tsx
│   ├── PasswordInput.test.tsx
│   ├── PasswordInput.types.ts
│   └── index.ts
├── VaultList/
│   ├── VaultList.tsx
│   ├── VaultList.test.tsx
│   ├── VaultItem.tsx
│   └── index.ts
```

#### 组件结构

```typescript
// ✅ 标准组件结构
interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = '输入密码',
  disabled = false,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="password-input">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn('input', error && 'input-error')}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
```

### 3.2 Hooks使用规范

#### 自定义Hook设计

```typescript
// ✅ 标准Hook设计
function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const user = await authService.login(credentials);
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
```

#### Hook使用规则

```typescript
// ✅ 正确使用
function MyComponent() {
  const [count, setCount] = useState(0);
  const effect = useEffect(() => {
    console.log('Component mounted');
    return () => console.log('Component unmounted');
  }, []);

  return <div>{count}</div>;
}

// ❌ 错误使用（在循环中调用Hook）
function MyComponent({ items }) {
  items.forEach(item => {
    useState(item.id); // 错误：不能在循环中调用Hook
  });
}
```

### 3.3 状态管理规范

#### Zustand Store设计

```typescript
interface VaultState {
  vaults: Vault[];
  currentVault: Vault | null;
  isLoading: boolean;
  error: string | null;
  createVault: (name: string, masterPassword: string) => Promise<void>;
  updateVault: (vaultId: string, updates: Partial<Vault>) => Promise<void>;
}

export const useVaultStore = create<VaultState>()(
  devtools(
    persist(
      immer((set, get) => ({
        vaults: [],
        currentVault: null,
        isLoading: false,
        error: null,

        createVault: async (name, masterPassword) => {
          set({ isLoading: true, error: null });
          try {
            const vault = await vaultService.createVault(name, masterPassword);
            set(state => {
              state.vaults.push(vault);
              state.currentVault = vault;
              state.isLoading = false;
            });
          } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
      })),
      {
        name: 'vault-storage',
        partialize: state => ({
          vaults: state.vaults,
          currentVault: state.currentVault,
        }),
      }
    )
  )
);
```

### 3.4 性能优化规范

#### 组件优化

```typescript
// ✅ 使用memo优化组件
export const PasswordList = memo<PasswordListProps>(({ passwords, onSelect }) => {
  return (
    <div className="password-list">
      {passwords.map(password => (
        <PasswordItem
          key={password.id}
          password={password}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
});

// ✅ 使用useMemo缓存计算结果
function useFilteredPasswords(passwords: Password[], query: string) {
  return useMemo(() => {
    if (!query) return passwords;
    return passwords.filter(password =>
      password.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [passwords, query]);
}
```

#### 数据获取优化

```typescript
// ✅ 使用React Query
export function useVaults() {
  return useQuery({
    queryKey: ['vaults'],
    queryFn: () => vaultService.getVaults(),
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 10 * 60 * 1000, // 10分钟
  });
}
```

## 4. 安全开发规范

### 4.1 加密安全

#### 密钥管理

```typescript
// ✅ 安全的密钥派生
class EncryptionService {
  async deriveKey(password: string, salt?: Uint8Array): Promise<CryptoKey> {
    const keySalt = salt || crypto.getRandomValues(new Uint8Array(16));

    // 使用Argon2id进行密钥派生
    const derivedKey = await argon2.hash({
      pass: password,
      salt: Array.from(keySalt),
      type: 2, // Argon2id
      mem: 65536, // 64MB
      time: 3,
      parallelism: 1,
      hashLen: 32,
    });

    return crypto.subtle.importKey(
      'raw',
      new Uint8Array(derivedKey.hashBytes),
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
}
```

#### 敏感数据处理

```typescript
// ✅ 安全的数据清除
async function clearSensitiveData(...data: Uint8Array[]): Promise<void> {
  try {
    for (const array of data) {
      if (array && array.length > 0) {
        // 用随机数据覆盖内存
        crypto.getRandomValues(array);
      }
    }
  } catch (error) {
    console.warn('Failed to clear sensitive data:', error);
  }
}
```

### 4.2 输入验证

#### 输入清理

```typescript
// ✅ 输入验证函数
export function validateInput(
  input: string,
  context: string = 'default'
): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  // 检查长度
  if (input.length > 10000) {
    return false;
  }

  // 检查XSS攻击
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }

  return true;
}
```

#### 内容安全策略

```typescript
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://sui-testnet.rpc',
  ],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': [
    "'self'",
    'https://sui-testnet.rpc',
    'https://walrus-testnet.rpc',
  ],
  'object-src': ["'none'"],
};
```

### 4.3 密码安全

#### 密码策略

```typescript
export const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventRepeatingChars: true,
  preventCommonPasswords: true,
  maxAge: 90, // 天
  history: 5, // 保存历史密码数量
};
```

#### 密码强度验证

```typescript
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // 长度检查
  if (password.length < 8) {
    feedback.push('密码长度至少8个字符');
  } else {
    score += 25;
  }

  // 复杂度检查
  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('需要大写字母');

  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('需要小写字母');

  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('需要数字');

  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  else feedback.push('需要特殊字符');

  return {
    isValid: score >= 70 && feedback.length === 0,
    score,
    feedback,
  };
}
```

## 5. 测试规范

### 5.1 单元测试规范

#### 测试文件命名

```
services/
├── encryption.ts
├── encryption.test.ts     // 单元测试
└── encryption.integration.test.ts  // 集成测试

components/
├── PasswordInput/
│   ├── PasswordInput.tsx
│   ├── PasswordInput.test.tsx
│   └── PasswordInput.e2e.ts  // E2E测试
```

#### 测试结构

```typescript
describe('EncryptionService', () => {
  let encryptionService: EncryptionService;

  beforeEach(() => {
    encryptionService = new EncryptionService();
  });

  describe('encrypt', () => {
    it('should encrypt data successfully', async () => {
      // 准备测试数据
      const data = new TextEncoder().encode('test data');
      const password = 'test-password';

      // 执行测试
      const result = await encryptionService.encrypt(data, password);

      // 验证结果
      expect(result).toEqual({
        algorithm: 'AES-256-GCM',
        ciphertext: expect.any(Array),
        iv: expect.any(Array),
        tag: expect.any(Array),
        keyId: expect.any(String),
      });
    });

    it('should handle encryption errors', async () => {
      // 测试错误情况
      await expect(
        encryptionService.encrypt(new Uint8Array(0), '')
      ).rejects.toThrow('Failed to encrypt data');
    });
  });
});
```

### 5.2 组件测试规范

#### 组件测试示例

```typescript
describe('PasswordInput', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders correctly', () => {
    render(<PasswordInput value="" onChange={mockOnChange} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onChange when input changes', async () => {
    const user = userEvent.setup();
    render(<PasswordInput value="" onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('shows error message', () => {
    render(
      <PasswordInput
        value=""
        onChange={mockOnChange}
        error="Password is required"
      />
    );

    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });
});
```

### 5.3 E2E测试规范

#### E2E测试示例

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/login');

    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="email-error"]')).toContainText(
      'Email is required'
    );
    await expect(page.locator('[data-testid="password-error"]')).toContainText(
      'Password is required'
    );
  });
});
```

### 5.4 测试覆盖率要求

#### 覆盖率标准

- **行覆盖率**: ≥ 80%
- **分支覆盖率**: ≥ 80%
- **函数覆盖率**: ≥ 80%
- **语句覆盖率**: ≥ 80%

#### 关键文件覆盖率

- **加密服务**: ≥ 90%
- **认证服务**: ≥ 90%
- **安全相关组件**: ≥ 95%
- **一般业务逻辑**: ≥ 80%

## 6. 文档规范

### 6.1 代码注释规范

#### JSDoc注释

````typescript
/**
 * 加密数据
 *
 * @param data - 要加密的数据
 * @param password - 加密密码
 * @param context - 可选的上下文信息
 * @returns 加密结果
 * @throws {Error} 当加密失败时抛出错误
 *
 * @example
 * ```typescript
 * const data = new TextEncoder().encode('secret');
 * const encrypted = await encrypt(data, 'password');
 * ```
 */
export async function encrypt(
  data: Uint8Array,
  password: string,
  context?: string
): Promise<EncryptedData> {
  // 实现加密逻辑
}
````

#### 组件注释

````typescript
/**
 * 密码输入组件
 *
 * 功能：
 * - 密码输入和显示/隐藏切换
 * - 密码强度指示器
 * - 错误状态显示
 * - 无障碍支持
 *
 * @example
 * ```tsx
 * <PasswordInput
 *   value={password}
 *   onChange={setPassword}
 *   placeholder="输入密码"
 *   showStrengthIndicator
 * />
 * ```
 */
export const PasswordInput: React.FC<PasswordInputProps> = ({ ... }) => {
  // 组件实现
};
````

### 6.2 组件文档规范

#### 组件文档结构

````markdown
# PasswordInput

密码输入组件，提供安全的密码输入和验证功能。

## 功能特性

- 密码输入和显示/隐藏切换
- 密码强度实时显示
- 错误状态提示
- 无障碍支持
- 响应式设计

## Props

| 属性                  | 类型                    | 默认值     | 描述               |
| --------------------- | ----------------------- | ---------- | ------------------ |
| value                 | string                  | -          | 密码值             |
| onChange              | (value: string) => void | -          | 值变化回调         |
| placeholder           | string                  | "输入密码" | 占位符文本         |
| disabled              | boolean                 | false      | 是否禁用           |
| error                 | string                  | -          | 错误信息           |
| showStrengthIndicator | boolean                 | false      | 是否显示强度指示器 |

## 使用示例

```tsx
import { PasswordInput } from '@/components/ui/password-input';

function LoginForm() {
  const [password, setPassword] = useState('');

  return (
    <PasswordInput
      value={password}
      onChange={setPassword}
      placeholder="请输入密码"
      showStrengthIndicator
    />
  );
}
```
````

## 无障碍

- 支持屏幕阅读器
- 键盘导航支持
- ARIA属性完整

````

### 6.3 API文档规范

#### API文档结构
```markdown
# Encryption API

加密服务API文档。

## 加密方法

### encrypt(data, password, context?)

加密指定数据。

**参数:**
- `data: Uint8Array` - 要加密的数据
- `password: string` - 加密密码
- `context?: string` - 可选的上下文信息

**返回值:** `Promise<EncryptedData>`

**示例:**
```typescript
const data = new TextEncoder().encode('secret');
const encrypted = await encryptionService.encrypt(data, 'password');
````

### decrypt(encryptedData, password)

解密加密数据。

**参数:**

- `encryptedData: EncryptedData` - 加密数据
- `password: string` - 解密密码

**返回值:** `Promise<Uint8Array>`

**错误:**

- `Error` - 当解密失败时抛出

````

### 6.4 变更日志规范

#### 变更日志格式
```markdown
# 变更日志

所有重要的项目变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/spec/v2.0.0.html)。

## [1.0.0] - 2024-01-15

### 新增
- 基础密码管理功能
- 加密和解密服务
- 用户认证系统
- 密码强度验证

### 安全
- 实现AES-256-GCM加密
- 添加输入验证和清理
- 实现密钥派生函数

## [0.1.0] - 2024-01-01

### 新增
- 项目初始化
- 基础项目结构
- 开发环境配置
````

## 总结

这套完整的前端开发规范涵盖了SuiPass项目的所有重要方面：

1. **代码质量工具**: ESLint、Prettier、Husky、lint-staged
2. **TypeScript规范**: 严格类型检查、接口设计、错误处理
3. **React开发**: 组件设计、Hooks使用、状态管理、性能优化
4. **安全规范**: 加密安全、输入验证、密码策略、CSP配置
5. **测试规范**: 单元测试、组件测试、E2E测试、覆盖率要求
6. **文档规范**: 代码注释、组件文档、API文档、变更日志

遵循这些规范将确保代码的高质量、安全性和可维护性，同时保持团队开发的一致性。
