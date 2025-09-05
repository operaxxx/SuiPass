# SuiPass 前端开发规范

## 目录

- [1. 代码质量检查工具配置](#1-代码质量检查工具配置)
- [2. TypeScript开发规范](#2-typescript开发规范)
- [3. React开发规范](#3-react开发规范)
- [4. 安全开发规范](#4-安全开发规范)
- [5. 测试规范](#5-测试规范)
- [6. 文档规范](#6-文档规范)
- [7. 开发工作流程](#7-开发工作流程)

## 1. 代码质量检查工具配置

### 1.1 ESLint配置

```json
{
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:security/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:unicorn/recommended",
    "plugin:sonarjs/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json",
    "tsconfigRootDir": "./"
  },
  "plugins": [
    "react",
    "react-hooks",
    "jsx-a11y",
    "security",
    "import",
    "unicorn",
    "sonarjs"
  ],
  "rules": {
    // TypeScript 规则
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/consistent-type-imports": "error",

    // React 规则
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "react/jsx-key": "error",
    "react/no-unescaped-entities": "warn",

    // 安全规则
    "security/detect-object-injection": "error",
    "security/detect-non-literal-fs-filename": "error",
    "security/detect-non-literal-regexp": "error",
    "security/detect-unsafe-regex": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-require": "error",
    "security/detect-non-literal-import": "error",

    // 性能和代码质量
    "sonarjs/cognitive-complexity": ["error", 15],
    "sonarjs/no-identical-functions": "error",
    "sonarjs/no-duplicate-string": "warn",
    "sonarjs/no-collapsible-if": "error",
    "sonarjs/prefer-immediate-return": "error",

    // 导入规则
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always"
      }
    ],
    "import/no-cycle": "error",
    "import/no-unused-modules": "error",

    // 通用规则
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-template": "error"
  },
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "typescript": {}
    }
  }
}
```

### 1.2 Prettier配置

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "jsxSingleQuote": false,
  "bracketSameLine": false,
  "quoteProps": "as-needed"
}
```

### 1.3 Git提交规范

```javascript
// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新功能
        "fix", // 修复bug
        "docs", // 文档更新
        "style", // 代码格式化
        "refactor", // 重构
        "perf", // 性能优化
        "test", // 测试相关
        "chore", // 构建工具或依赖管理
        "security", // 安全相关
        "ci", // CI配置
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [
      2,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"],
    ],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 72],
    "body-leading-blank": [1, "always"],
    "body-max-line-length": [2, "always", 100],
    "footer-leading-blank": [1, "always"],
    "footer-max-line-length": [2, "always", 100],
  },
};
```

### 1.4 lint-staged配置

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

## 2. TypeScript开发规范

### 2.1 类型定义规范

```typescript
// 优先使用 interface 而不是 type
interface User {
  id: string;
  name: string;
  email: string;
}

// 联合类型使用 type
type Status = "active" | "inactive" | "pending";

// 函数类型定义
type AsyncCallback = (error: Error | null, result: string) => void;

// 泛型接口
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### 2.2 错误处理规范

```typescript
// 自定义错误类
class SuiPassError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "SuiPassError";
  }
}

// 错误处理函数
async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof SuiPassError) {
      throw error;
    }

    // 记录错误日志
    console.error("Operation failed:", error);

    // 转换为应用错误
    throw new SuiPassError("Operation failed", "OPERATION_FAILED", error);
  }
}
```

### 2.3 异步编程规范

```typescript
// 使用 async/await 而不是 Promise.then()
async function fetchVault(vaultId: string): Promise<Vault> {
  const vault = await vaultService.getVault(vaultId);
  return vault;
}

// Promise.all 并行处理
async function fetchMultipleVaults(vaultIds: string[]): Promise<Vault[]> {
  const promises = vaultIds.map((id) => vaultService.getVault(id));
  const vaults = await Promise.all(promises);
  return vaults;
}

// 错误边界处理
async function safeFetchVault(vaultId: string): Promise<Vault | null> {
  try {
    return await fetchVault(vaultId);
  } catch (error) {
    console.error(`Failed to fetch vault ${vaultId}:`, error);
    return null;
  }
}
```

## 3. React开发规范

### 3.1 组件设计原则

```typescript
// 组件类型定义
interface ComponentProps {
  title: string;
  onAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

// 函数组件
const SecureComponent: React.FC<ComponentProps> = ({
  title,
  onAction,
  className = '',
  children
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = useCallback(async () => {
    setIsLoading(true);
    try {
      await onAction?.();
    } finally {
      setIsLoading(false);
    }
  }, [onAction]);

  return (
    <div className={`secure-component ${className}`}>
      <h2>{title}</h2>
      {children}
      <button
        onClick={handleAction}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Action'}
      </button>
    </div>
  );
};

// 组件默认属性
SecureComponent.defaultProps = {
  className: '',
  onAction: undefined,
  children: undefined,
};

// 组件属性类型检查
SecureComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
};
```

### 3.2 Hooks使用规范

```typescript
// 自定义Hook
function useEncryptedData<T>(
  data: T,
  encryptionKey: string,
): [T | null, boolean, Error | null] {
  const [encryptedData, setEncryptedData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const encryptData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const encrypted = await encryptionService.encrypt(data, encryptionKey);
        setEncryptedData(encrypted);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (data && encryptionKey) {
      encryptData();
    }
  }, [data, encryptionKey]);

  return [encryptedData, isLoading, error];
}

// 使用规则
const useSecureStorage = (key: string) => {
  // ✅ 正确：在顶层调用Hook
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    setValue(stored);
  }, [key]);

  return [value, setValue] as const;
};
```

### 3.3 状态管理规范（Zustand）

```typescript
// Store定义
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const user = await authService.login(credentials);
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// 组件中使用
const LoginComponent: React.FC = () => {
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (formData: LoginFormData) => {
    await login(formData);
  };

  // ...
};
```

## 4. 安全开发规范

### 4.1 加密数据处理

```typescript
// 加密服务使用规范
class SecureDataService {
  private encryptionService: EncryptionService;

  async encryptSensitiveData(
    data: unknown,
    masterPassword: string,
  ): Promise<EncryptedData> {
    // 验证输入
    if (!data || !masterPassword) {
      throw new Error("Invalid input data");
    }

    // 序列化数据
    const serialized = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(serialized);

    // 加密数据
    const encrypted = await this.encryptionService.encrypt(
      dataBytes,
      masterPassword,
    );

    // 清理内存中的敏感数据
    encoder.encode("");

    return encrypted;
  }

  async decryptSensitiveData<T>(
    encryptedData: EncryptedData,
    masterPassword: string,
  ): Promise<T> {
    try {
      // 解密数据
      const decryptedBytes = await this.encryptionService.decrypt(
        encryptedData,
        masterPassword,
      );

      // 反序列化
      const decoder = new TextDecoder();
      const decryptedString = decoder.decode(decryptedBytes);

      // 清理内存
      decoder.decode("");

      return JSON.parse(decryptedString) as T;
    } catch (error) {
      throw new Error("Failed to decrypt data");
    }
  }
}
```

### 4.2 输入验证和净化

```typescript
// 输入验证工具
class InputValidator {
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain uppercase letters");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain lowercase letters");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain numbers");
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push("Password must contain special characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }
}
```

### 4.3 CSP安全策略

```typescript
// 安全配置
export const securityConfig = {
  csp: {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https:"],
    "font-src": ["'self'", "data:", "https:"],
    "connect-src": [
      "'self'",
      "https://sui.testnet.rpc",
      "https://walrus.testnet.rpc",
    ],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  },
  headers: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  },
};
```

## 5. 测试规范

### 5.1 单元测试规范

```typescript
// 测试工具函数
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthStore } from "@/stores/auth";

describe("Authentication Store", () => {
  beforeEach(() => {
    // 重置store状态
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should update user data", async () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser = {
      id: "123",
      name: "Test User",
      email: "test@example.com",
    };

    await act(async () => {
      await result.current.updateUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
  });
});
```

### 5.2 组件测试规范

```typescript
// 组件测试示例
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SecureLoginForm } from '@/components/SecureLoginForm';
import { useAuthStore } from '@/stores/auth';

vi.mock('@/stores/auth');

describe('SecureLoginForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null
    });
  });

  it('should render login form', () => {
    render(<SecureLoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    render(<SecureLoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
```

### 5.3 E2E测试规范

```typescript
// E2E测试示例
import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should login successfully with valid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "securepassword123");
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
  });

  test("should show error message with invalid credentials", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.fill('[data-testid="email"]', "invalid@example.com");
    await page.fill('[data-testid="password"]', "wrongpassword");
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toHaveText(
      /invalid credentials/i,
    );
  });
});
```

## 6. 文档规范

### 6.1 代码注释规范

````typescript
/**
 * 加密敏感数据
 *
 * @param data - 需要加密的数据对象
 * @param masterPassword - 主密码用于派生加密密钥
 * @returns Promise<EncryptedData> - 加密后的数据对象
 * @throws {Error} - 当加密失败时抛出错误
 *
 * @example
 * ```typescript
 * const encrypted = await encryptSensitiveData(
 *   { username: 'user1', password: 'pass123' },
 *   'master-password'
 * );
 * ```
 */
async function encryptSensitiveData(
  data: Record<string, unknown>,
  masterPassword: string,
): Promise<EncryptedData> {
  // 实现加密逻辑
}
````

### 6.2 组件文档规范

````typescript
/**
 * 安全登录表单组件
 *
 * @component
 * @example
 * ```tsx
 * <SecureLoginForm
 *   onSuccess={handleLoginSuccess}
 *   onError={handleLoginError}
 *   showForgotPassword={true}
 * />
 * ```
 */
interface SecureLoginFormProps {
  /** 登录成功回调函数 */
  onSuccess: (user: User) => void;
  /** 登录失败回调函数 */
  onError: (error: Error) => void;
  /** 是否显示忘记密码链接 */
  showForgotPassword?: boolean;
  /** 自定义样式类名 */
  className?: string;
}
````

### 6.3 API文档规范

````typescript
/**
 * 保险库服务API
 *
 * @namespace VaultService
 */
export const VaultService = {
  /**
   * 创建新的保险库
   *
   * @param {string} name - 保险库名称
   * @param {VaultSettings} settings - 保险库设置
   * @returns {Promise<VaultInfo>} - 创建的保险库信息
   *
   * @throws {SuiPassError} - 当创建失败时抛出错误
   *
   * @example
   * ```typescript
   * const vault = await VaultService.createVault('My Vault', {
   *   autoLockTimeout: 300000,
   *   enableBiometric: true
   * });
   * ```
   */
  createVault: async (
    name: string,
    settings: VaultSettings,
  ): Promise<VaultInfo> => {
    // 实现逻辑
  },

  // 其他API方法...
};
````

## 7. 开发工作流程

### 7.1 Git工作流

```bash
# 1. 创建新分支
git checkout -b feature/vault-encryption
git push -u origin feature/vault-encryption

# 2. 开发并提交
git add .
git commit -m "feat: implement vault encryption with AES-256-GCM"

# 3. 推送到远程
git push origin feature/vault-encryption

# 4. 创建Pull Request
gh pr create --title "feat: implement vault encryption" --body "$(cat <<'EOF'
## Summary
- Implement vault encryption using AES-256-GCM
- Add key derivation with Argon2id
- Implement secure data storage patterns

## Test plan
- [x] Unit tests for encryption service
- [x] Integration tests for vault operations
- [x] E2E tests for encryption flow

## Breaking changes
None

🤖 Generated with [Claude Code](https://claude.ai/code)
EOF
)"
```

### 7.2 代码审查清单

- [ ] 代码符合ESLint规范
- [ ] TypeScript类型检查通过
- [ ] 单元测试覆盖率 > 80%
- [ ] 安全检查通过
- [ ] 性能测试通过
- [ ] 文档完整
- [ ] 提交信息规范
- [ ] 无敏感信息泄露

### 7.3 部署前检查

```bash
# 运行所有检查
pnpm lint
pnpm type-check
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
```

## 总结

本开发规范为SuiPass项目提供了完整的开发指南，涵盖了代码质量、类型安全、React最佳实践、安全标准、测试覆盖和文档规范。所有规范都针对区块链密码管理器的特殊需求进行了优化，确保项目的安全性、可维护性和可扩展性。

开发团队应严格遵守这些规范，在保证代码质量的同时，确保用户数据的安全和隐私保护。
