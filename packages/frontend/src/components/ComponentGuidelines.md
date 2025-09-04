// React 组件开发规范
// packages/frontend/src/components/ComponentGuidelines.md

# React 组件开发规范

## 1. 组件命名规范

### 1.1 文件命名
- 使用 PascalCase 命名组件文件
- 组件文件名应与组件名称一致
- Hook 文件使用 `use` 前缀，如 `useAuth.ts`
- 工具函数文件使用动词或描述性名称

```typescript
// ✅ 正确
components/
├── LoginForm/
│   ├── LoginForm.tsx
│   ├── LoginForm.test.tsx
│   └── index.ts
├── PasswordGenerator/
│   ├── PasswordGenerator.tsx
│   ├── PasswordGenerator.test.tsx
│   └── index.ts
└── hooks/
    ├── useAuth.ts
    ├── useVault.ts
    └── useEncryption.ts

// ❌ 错误
components/
├── loginForm.tsx
├── password_generator.tsx
└── authHook.ts
```

### 1.2 组件命名
- 使用 PascalCase 命名组件
- 组件名称应具有描述性
- 避免使用过于通用的名称

```typescript
// ✅ 正确
export function PasswordStrengthIndicator() { ... }
export function VaultItemList() { ... }
export function EncryptionProgress() { ... }

// ❌ 错误
export function Indicator() { ... }
export function List() { ... }
export function Progress() { ... }
```

## 2. 组件结构规范

### 2.1 基础组件结构

```typescript
// packages/frontend/src/components/PasswordInput/PasswordInput.tsx
import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  showStrengthIndicator?: boolean;
}

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
export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = '输入密码',
  disabled = false,
  error,
  className,
  id,
  name,
  required = false,
  showStrengthIndicator = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // 处理输入变化
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // 切换密码显示状态
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // 计算密码强度
  const passwordStrength = useMemo(() => {
    if (!showStrengthIndicator) return null;
    return calculatePasswordStrength(value);
  }, [value, showStrengthIndicator]);

  return (
    <div className={cn('password-input-container', className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className={cn(
            'h-5 w-5',
            error ? 'text-red-500' : isFocused ? 'text-sui-600' : 'text-gray-400'
          )} />
        </div>
        
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'block w-full pl-10 pr-10 py-2 border rounded-lg transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-sui-500 focus:border-transparent',
            error
              ? 'border-red-500 bg-red-50'
              : isFocused
                ? 'border-sui-500'
                : 'border-gray-300 hover:border-gray-400',
            disabled && 'bg-gray-100 cursor-not-allowed'
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        <button
          type="button"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          aria-label={showPassword ? '隐藏密码' : '显示密码'}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </div>
      
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {showStrengthIndicator && passwordStrength && (
        <PasswordStrengthIndicator strength={passwordStrength} />
      )}
    </div>
  );
};

// 辅助组件
interface PasswordStrengthIndicatorProps {
  strength: {
    score: number;
    level: 'weak' | 'medium' | 'strong' | 'very-strong';
    feedback: string[];
  };
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  strength,
}) => {
  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-blue-500',
    'very-strong': 'bg-green-500',
  };

  const strengthWidths = {
    weak: 'w-1/4',
    medium: 'w-2/4',
    strong: 'w-3/4',
    'very-strong': 'w-full',
  };

  return (
    <div className="mt-2 space-y-1">
      <div className="flex space-x-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full bg-gray-200 transition-colors',
              i < strength.score && strengthColors[strength.level]
            )}
          />
        ))}
      </div>
      {strength.feedback.length > 0 && (
        <p className="text-xs text-gray-600">
          {strength.feedback[0]}
        </p>
      )}
    </div>
  );
};

// 工具函数
function calculatePasswordStrength(password: string) {
  // 实现密码强度计算逻辑
  return {
    score: 2,
    level: 'medium' as const,
    feedback: ['添加特殊字符以增加强度'],
  };
}

export default PasswordInput;
```

### 2.2 组件导出规范

```typescript
// packages/frontend/src/components/PasswordInput/index.ts
export { default as PasswordInput } from './PasswordInput';
export type { PasswordInputProps } from './PasswordInput';
```

## 3. Props 设计规范

### 3.1 Props 接口设计

```typescript
interface ComponentProps {
  // 基础属性
  id?: string;
  className?: string;
  children?: React.ReactNode;
  
  // 状态属性
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  
  // 事件处理器
  onClick?: () => void;
  onChange?: (value: string) => void;
  onSubmit?: (data: FormData) => Promise<void>;
  
  // 样式属性
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'error';
  
  // 自定义渲染
  renderIcon?: (props: IconProps) => React.ReactNode;
  renderError?: (error: string) => React.ReactNode;
}
```

### 3.2 默认值设置

```typescript
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  children,
}) => {
  // 组件实现
};
```

## 4. Hooks 使用规范

### 4.1 自定义 Hook 设计

```typescript
// packages/frontend/src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useToast } from '@/components/ui/use-toast';
import { AuthService } from '@/services/auth';
import type { User, LoginCredentials, RegisterData } from '@/types';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const authService = new AuthService();

  const isAuthenticated = !!user;

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const user = await authService.login(credentials);
      setUser(user);
      toast({
        title: '登录成功',
        description: '欢迎回来！',
      });
      navigate({ to: '/dashboard' });
    } catch (error) {
      toast({
        title: '登录失败',
        description: error instanceof Error ? error.message : '请检查您的凭据',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authService, navigate, toast]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      toast({
        title: '已退出登录',
        description: '您已成功退出',
      });
      navigate({ to: '/login' });
    } catch (error) {
      toast({
        title: '退出失败',
        description: error instanceof Error ? error.message : '退出时发生错误',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [authService, navigate, toast]);

  // 初始化时检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setUser(user);
      } catch (error) {
        // 用户未登录
        setUser(null);
      }
    };

    checkAuth();
  }, [authService]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register: async (data: RegisterData) => {
      setIsLoading(true);
      try {
        const user = await authService.register(data);
        setUser(user);
        toast({
          title: '注册成功',
          description: '账户已创建，请登录',
        });
        navigate({ to: '/login' });
      } catch (error) {
        toast({
          title: '注册失败',
          description: error instanceof Error ? error.message : '注册时发生错误',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    updateProfile: async (data: Partial<User>) => {
      if (!user) throw new Error('用户未登录');
      
      setIsLoading(true);
      try {
        const updatedUser = await authService.updateProfile(user.id, data);
        setUser(updatedUser);
        toast({
          title: '更新成功',
          description: '个人信息已更新',
        });
      } catch (error) {
        toast({
          title: '更新失败',
          description: error instanceof Error ? error.message : '更新时发生错误',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
  };
}
```

### 4.2 Hook 命名规范

```typescript
// ✅ 正确
const useAuth = () => { ... };
const useVault = () => { ... };
const useEncryption = () => { ... };
const useLocalStorage = <T>(key: string, initialValue: T) => { ... };
const useDebounce = <T>(value: T, delay: number) => { ... };

// ❌ 错误
const auth = () => { ... };
const vaultData = () => { ... };
const encryptionHook = () => { ... };
const storage = () => { ... };
```

## 5. 状态管理规范

### 5.1 Zustand Store 设计

```typescript
// packages/frontend/src/stores/vault.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { VaultService } from '@/services/vault';
import { EncryptionService } from '@/services/encryption';
import type { Vault, PasswordItem, Folder } from '@/types';

interface VaultState {
  // 状态
  vaults: Vault[];
  currentVault: Vault | null;
  isLoading: boolean;
  error: string | null;
  
  // 操作
  createVault: (name: string, masterPassword: string) => Promise<void>;
  updateVault: (vaultId: string, updates: Partial<Vault>) => Promise<void>;
  deleteVault: (vaultId: string) => Promise<void>;
  setCurrentVault: (vault: Vault | null) => void;
  
  // 密码管理
  addPassword: (password: Omit<PasswordItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePassword: (passwordId: string, updates: Partial<PasswordItem>) => Promise<void>;
  deletePassword: (passwordId: string) => Promise<void>;
  
  // 工具方法
  clearError: () => void;
  refreshVaults: () => Promise<void>;
}

export const useVaultStore = create<VaultState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 初始状态
        vaults: [],
        currentVault: null,
        isLoading: false,
        error: null,

        // 创建保险库
        createVault: async (name: string, masterPassword: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const vaultService = new VaultService();
            const encryptionService = new EncryptionService();
            
            const vault = await vaultService.createVault(name, masterPassword);
            
            set((state) => {
              state.vaults.push(vault);
              state.currentVault = vault;
              state.isLoading = false;
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '创建保险库失败',
              isLoading: false 
            });
            throw error;
          }
        },

        // 添加密码
        addPassword: async (passwordData) => {
          const state = get();
          if (!state.currentVault) {
            throw new Error('请先选择一个保险库');
          }

          set({ isLoading: true, error: null });

          try {
            const vaultService = new VaultService();
            const newPassword = await vaultService.addPassword(
              state.currentVault.id,
              passwordData
            );

            set((state) => {
              if (state.currentVault) {
                state.currentVault.items.push(newPassword);
                state.currentVault.updatedAt = Date.now();
              }
              state.isLoading = false;
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '添加密码失败',
              isLoading: false 
            });
            throw error;
          }
        },

        // 清除错误
        clearError: () => set({ error: null }),

        // 刷新保险库列表
        refreshVaults: async () => {
          set({ isLoading: true, error: null });
          
          try {
            const vaultService = new VaultService();
            const vaults = await vaultService.getVaults();
            
            set({ vaults, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '获取保险库列表失败',
              isLoading: false 
            });
            throw error;
          }
        },
      })),
      {
        name: 'vault-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          vaults: state.vaults,
          currentVault: state.currentVault,
        }),
      }
    ),
    { name: 'vault-store' }
  )
);
```

## 6. 性能优化规范

### 6.1 组件优化

```typescript
import React, { memo, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface PasswordListProps {
  passwords: PasswordItem[];
  onPasswordSelect: (password: PasswordItem) => void;
  selectedPasswordId?: string;
  searchQuery?: string;
}

// 使用 memo 优化组件渲染
export const PasswordList = memo<PasswordListProps>(({
  passwords,
  onPasswordSelect,
  selectedPasswordId,
  searchQuery = '',
}) => {
  // 使用 useMemo 缓存计算结果
  const filteredPasswords = useMemo(() => {
    if (!searchQuery) return passwords;
    
    const query = searchQuery.toLowerCase();
    return passwords.filter(password =>
      password.title.toLowerCase().includes(query) ||
      password.username?.toLowerCase().includes(query) ||
      password.url?.toLowerCase().includes(query)
    );
  }, [passwords, searchQuery]);

  // 使用 useCallback 缓存函数
  const handlePasswordClick = useCallback((password: PasswordItem) => {
    onPasswordSelect(password);
  }, [onPasswordSelect]);

  // 使用虚拟化优化长列表
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredPasswords.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // 每行高度
  });

  return (
    <div
      ref={parentRef}
      className="h-[400px] overflow-auto border rounded-lg"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const password = filteredPasswords[virtualRow.index];
          return (
            <div
              key={password.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <PasswordListItem
                password={password}
                isSelected={password.id === selectedPasswordId}
                onClick={handlePasswordClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

PasswordList.displayName = 'PasswordList';
```

### 6.2 数据获取优化

```typescript
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VaultService } from '@/services/vault';

// 使用 React Query 优化数据获取
export function useVaults() {
  return useQuery({
    queryKey: ['vaults'],
    queryFn: () => new VaultService().getVaults(),
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 10 * 60 * 1000, // 10分钟
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// 使用无限查询处理分页
export function usePasswords(vaultId: string) {
  return useInfiniteQuery({
    queryKey: ['vaults', vaultId, 'passwords'],
    queryFn: ({ pageParam = 1 }) => 
      new VaultService().getPasswords(vaultId, pageParam),
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
    staleTime: 1 * 60 * 1000, // 1分钟
  });
}

// 使用 mutation 处理数据变更
export function useCreatePassword(vaultId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (passwordData: CreatePasswordData) =>
      new VaultService().createPassword(vaultId, passwordData),
    onSuccess: () => {
      // 使相关查询失效，触发重新获取
      queryClient.invalidateQueries(['vaults', vaultId, 'passwords']);
    },
  });
}
```

## 7. 错误处理规范

### 7.1 错误边界组件

```typescript
// packages/frontend/src/components/ErrorBoundary/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 调用自定义错误处理器
    this.props.onError?.(error, errorInfo);
    
    // 可以在这里添加错误上报逻辑
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误界面
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              出现了错误
            </h1>
            
            <p className="text-gray-600 mb-6">
              应用程序遇到了一个意外错误。请尝试刷新页面或联系支持。
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6">
                <summary className="cursor-pointer text-sm text-gray-700 mb-2">
                  错误详情（开发模式）
                </summary>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto">
                  <div className="text-red-600 mb-2">
                    {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div className="text-gray-700">
                      <div className="font-semibold mb-1">组件堆栈:</div>
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="space-y-2">
              <Button onClick={this.handleReset} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                重试
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                刷新页面
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook 版本的错误边界
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
    throw error; // 重新抛出错误以保持正常的行为
  }, []);

  return { error, resetError, captureError };
}
```

### 7.2 异步错误处理

```typescript
// packages/frontend/src/hooks/useAsync.ts
import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setState({
      data: null,
      error: null,
      isLoading: true,
      isSuccess: false,
      isError: false,
    });

    try {
      const data = await asyncFunction();
      setState({
        data,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
      });
      return data;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      setState({
        data: null,
        error: errorObj,
        isLoading: false,
        isSuccess: false,
        isError: true,
      });
      throw errorObj;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
```

## 8. 测试规范

### 8.1 组件测试

```typescript
// packages/frontend/src/components/PasswordInput/PasswordInput.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders correctly with default props', () => {
    render(<PasswordInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox', { name: /输入密码/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
  });

  it('calls onChange when input value changes', async () => {
    const user = userEvent.setup();
    render(<PasswordInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox', { name: /输入密码/i });
    await user.type(input, 'testpassword');
    
    expect(mockOnChange).toHaveBeenCalledWith('testpassword');
  });

  it('toggles password visibility when eye button is clicked', async () => {
    const user = userEvent.setup();
    render(<PasswordInput value="password" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox', { name: /输入密码/i });
    const toggleButton = screen.getByRole('button', { name: /显示密码/i });
    
    expect(input).toHaveAttribute('type', 'password');
    
    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    
    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('shows error message when error prop is provided', () => {
    render(
      <PasswordInput 
        value="" 
        onChange={mockOnChange} 
        error="密码不能为空" 
      />
    );
    
    expect(screen.getByText('密码不能为空')).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<PasswordInput value="" onChange={mockOnChange} disabled />);
    
    const input = screen.getByRole('textbox', { name: /输入密码/i });
    expect(input).toBeDisabled();
  });

  it('shows password strength indicator when enabled', () => {
    render(
      <PasswordInput 
        value="weak" 
        onChange={mockOnChange} 
        showStrengthIndicator 
      />
    );
    
    expect(screen.getByText(/添加特殊字符以增加强度/i)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <PasswordInput 
        value="" 
        onChange={mockOnChange} 
        error="Invalid password" 
        id="password-input"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'password-input-error');
    
    const errorMessage = screen.getByText('Invalid password');
    expect(errorMessage).toHaveAttribute('id', 'password-input-error');
  });
});
```

这些规范涵盖了React组件开发的各个方面，包括命名、结构、性能优化、错误处理和测试。遵循这些规范将确保代码的一致性、可维护性和高质量。