# SuiPass UI/UX 设计文档

## 📋 设计概览

### 项目背景
SuiPass 是一个基于 Sui 区块链和 Walrus 存储的去中心化密码管理器，为黑客松演示而设计。本文档提供了完整的 UI/UX 设计规范和实施指南。

### 设计目标
- **技术展示**：突出 Sui + Walrus 集成的技术创新
- **用户体验**：提供流畅、直观的密码管理体验
- **演示优化**：为黑客松评委提供清晰的技术亮点展示
- **开发友好**：提供详细的开发实现指导

## 🎨 视觉设计系统

### 色彩系统

#### 主色调（基于 Sui 品牌）
```css
:root {
  /* Sui 主色系 */
  --sui-primary-50: #f0f9ff;
  --sui-primary-100: #e0f2fe;
  --sui-primary-200: #bae6fd;
  --sui-primary-300: #7dd3fc;
  --sui-primary-400: #38bdf8;
  --sui-primary-500: #0ea5e9;  /* 主品牌色 */
  --sui-primary-600: #0284c7;
  --sui-primary-700: #0369a1;
  --sui-primary-800: #075985;
  --sui-primary-900: #0c4a6e;
  
  /* 语义化色彩 */
  --success-50: #f0fdf4;
  --success-500: #10b981;
  --success-600: #059669;
  --success-700: #047857;
  
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  --warning-700: #b45309;
  
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;
  --error-700: #b91c1c;
  
  --info-50: #eff6ff;
  --info-500: #3b82f6;
  --info-600: #2563eb;
  --info-700: #1d4ed8;
}
```

#### 深色模式适配
```css
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
}
```

### 字体系统

#### 字体家族
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
font-feature-settings: "cv02", "cv03", "cv04", "cv11";
```

#### 排版尺度
```css
:root {
  /* 字体大小 */
  --text-xs: 0.75rem;     /* 12px - 辅助信息 */
  --text-sm: 0.875rem;    /* 14px - 表单标签 */
  --text-base: 1rem;      /* 16px - 正文 */
  --text-lg: 1.125rem;    /* 18px - 标题 */
  --text-xl: 1.25rem;     /* 20px - 小标题 */
  --text-2xl: 1.5rem;     /* 24px - 页面标题 */
  --text-3xl: 1.875rem;   /* 30px - 大标题 */
  --text-4xl: 2.25rem;    /* 36px - 特大标题 */
  
  /* 行高 */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* 字重 */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### 间距系统

```css
:root {
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-sm: 0.5rem;   /* 8px */
  --spacing-md: 0.75rem;  /* 12px */
  --spacing-lg: 1rem;     /* 16px */
  --spacing-xl: 1.5rem;   /* 24px */
  --spacing-2xl: 2rem;    /* 32px */
  --spacing-3xl: 3rem;    /* 48px */
  --spacing-4xl: 4rem;    /* 64px */
}
```

### 圆角和阴影

```css
:root {
  /* 圆角 */
  --radius-sm: 0.375rem;  /* 6px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;  /* 完全圆形 */
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

## 🎯 组件设计系统

### 按钮组件

#### 基础按钮
```typescript
// components/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white hover:bg-primary-600',
        destructive: 'bg-error-500 text-white hover:bg-error-600',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

#### 使用示例
```typescript
// 基础用法
<Button>添加密码</Button>

// 带图标
<Button icon={<PlusIcon />} variant="primary">
  创建保险库
</Button>

// 加载状态
<Button loading={isLoading} disabled={isLoading}>
  处理中...
</Button>

// 不同样式
<Button variant="outline">取消</Button>
<Button variant="ghost" size="icon">
  <SettingsIcon />
</Button>
```

### 输入框组件

#### 基础输入框
```typescript
// components/Input.tsx
import React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-error-500 focus-visible:ring-error-500',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-error-500">{error}</p>
        )}
        {helperText && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
```

#### 密码输入框
```typescript
// components/PasswordInput.tsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';

interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showStrength?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');

    const togglePassword = () => setShowPassword(!showPassword);

    const calculateStrength = (pwd: string): number => {
      let strength = 0;
      if (pwd.length >= 8) strength += 25;
      if (/[a-z]/.test(pwd)) strength += 25;
      if (/[A-Z]/.test(pwd)) strength += 25;
      if (/[0-9]/.test(pwd)) strength += 25;
      return Math.min(strength, 100);
    };

    const strength = calculateStrength(password);
    const strengthColor = strength < 50 ? 'error' : strength < 80 ? 'warning' : 'success';

    return (
      <div className="space-y-2">
        <Input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          rightIcon={
            <button
              type="button"
              onClick={togglePassword}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {showStrength && password && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>密码强度</span>
              <span className={`text-${strengthColor}-500`}>
                {strength < 50 ? '弱' : strength < 80 ? '中' : '强'}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1">
              <div
                className={`bg-${strengthColor}-500 h-1 rounded-full transition-all duration-300`}
                style={{ width: `${strength}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
```

### 卡片组件

#### 密码卡片
```typescript
// components/PasswordCard.tsx
import React from 'react';
import { MoreVertical, Star, Copy, Edit, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardHeader } from './Card';

interface PasswordCardProps {
  id: string;
  title: string;
  username: string;
  url?: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onCopy: (field: 'username' | 'password') => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PasswordCard: React.FC<PasswordCardProps> = ({
  id,
  title,
  username,
  url,
  isFavorite,
  onToggleFavorite,
  onCopy,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = React.useState(false);

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {url ? (
              <img
                src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`}
                alt=""
                className="w-8 h-8 rounded"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary-600" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-foreground truncate">{title}</h3>
              <p className="text-sm text-muted-foreground truncate">{username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(id)}
              className="h-8 w-8"
            >
              <Star
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowActions(!showActions)}
              className="h-8 w-8"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {showActions && (
          <div className="flex space-x-1 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy('username')}
              className="flex-1"
            >
              <Copy className="w-3 h-3 mr-1" />
              用户名
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy('password')}
              className="flex-1"
            >
              <Copy className="w-3 h-3 mr-1" />
              密码
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(id)}
              className="flex-1"
            >
              <Edit className="w-3 h-3 mr-1" />
              编辑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(id)}
              className="flex-1 text-error-500 hover:text-error-600"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              删除
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { PasswordCard };
```

#### 保险库卡片
```typescript
// components/VaultCard.tsx
import React from 'react';
import { Folder, Users, Sync, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';

interface VaultCardProps {
  name: string;
  itemCount: number;
  isShared: boolean;
  lastSync: Date;
  isSyncing: boolean;
  onClick: () => void;
  onSync: () => void;
}

const VaultCard: React.FC<VaultCardProps> = ({
  name,
  itemCount,
  isShared,
  lastSync,
  isSyncing,
  onClick,
  onSync,
}) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-all duration-200 group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Folder className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {itemCount} 项
                </span>
                {isShared && (
                  <span className="flex items-center text-xs text-info-600">
                    <Users className="w-3 h-3 mr-1" />
                    已分享
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onSync();
            }}
            disabled={isSyncing}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isSyncing ? (
              <Sync className="w-4 h-4 animate-spin" />
            ) : (
              <Sync className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>最后同步: {formatRelativeTime(lastSync)}</span>
          <span className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-1 ${
              isSyncing ? 'bg-warning-500' : 'bg-success-500'
            }`} />
            {isSyncing ? '同步中' : '已同步'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// 辅助函数
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  return `${diffDays}天前`;
}

export { VaultCard };
```

## 📱 页面设计

### 主页面（Dashboard）

#### 布局结构
```typescript
// pages/Dashboard.tsx
import React from 'react';
import { Plus, Search, Settings, User, Lock, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { VaultCard } from '@/components/VaultCard';
import { StatsCard } from '@/components/StatsCard';
import { RecentActivity } from '@/components/RecentActivity';

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [vaults, setVaults] = React.useState<VaultData[]>([]);
  const [stats, setStats] = React.useState<StatsData>({});
  const [recentActivity, setRecentActivity] = React.useState<ActivityData[]>([]);

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-primary-500" />
                <h1 className="text-2xl font-bold">SuiPass</h1>
              </div>
              <div className="hidden md:flex items-center space-x-1">
                <span className="px-2 py-1 text-xs bg-success-100 text-success-700 rounded-full">
                  本地模式
                </span>
                <span className="px-2 py-1 text-xs bg-info-100 text-info-700 rounded-full">
                  已加密
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 快速统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="密码总数"
            value={stats.totalPasswords || 0}
            icon={<Lock className="w-5 h-5" />}
            trend="+12%"
            trendType="positive"
          />
          <StatsCard
            title="保险库数量"
            value={stats.totalVaults || 0}
            icon={<Folder className="w-5 h-5" />}
            trend="+2"
            trendType="positive"
          />
          <StatsCard
            title="安全评分"
            value={stats.securityScore || 0}
            suffix="/100"
            icon={<Shield className="w-5 h-5" />}
            trend="+5"
            trendType="positive"
          />
          <StatsCard
            title="同步状态"
            value={stats.lastSync ? '正常' : '未同步'}
            icon={<TrendingUp className="w-5 h-5" />}
            trend="2分钟前"
            trendType="neutral"
          />
        </div>

        {/* 搜索和操作 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="搜索密码或保险库..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex space-x-3">
            <Button icon={<Plus className="w-4 h-4" />}>
              新建保险库
            </Button>
            <Button variant="outline" icon={<Plus className="w-4 h-4" />}>
              添加密码
            </Button>
          </div>
        </div>

        {/* 保险库网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {vaults.map((vault) => (
            <VaultCard
              key={vault.id}
              name={vault.name}
              itemCount={vault.itemCount}
              isShared={vault.isShared}
              lastSync={vault.lastSync}
              isSyncing={vault.isSyncing}
              onClick={() => handleVaultClick(vault.id)}
              onSync={() => handleVaultSync(vault.id)}
            />
          ))}
          <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center hover:border-primary-500 transition-colors cursor-pointer">
            <Plus className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">创建新保险库</h3>
            <p className="text-sm text-muted-foreground text-center">
              创建一个新的保险库来管理您的密码
            </p>
          </div>
        </div>

        {/* 最近活动 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentActivity activities={recentActivity} />
          <div className="bg-secondary/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">快速操作</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Import className="w-4 h-4 mr-2" />
                导入密码
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Export className="w-4 h-4 mr-2" />
                导出密码
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                安全设置
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
```

#### 统计卡片组件
```typescript
// components/StatsCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  suffix = '',
  icon,
  trend,
  trendType = 'neutral',
}) => {
  const getTrendIcon = () => {
    switch (trendType) {
      case 'positive':
        return <ArrowUp className="w-3 h-3" />;
      case 'negative':
        return <ArrowDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-success-600';
      case 'negative':
        return 'text-error-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {suffix}
        </div>
        {trend && (
          <div className={`flex items-center text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { StatsCard };
```

### 保险库详情页

#### 布局结构
```typescript
// pages/VaultDetail.tsx
import React from 'react';
import { ArrowLeft, Search, Filter, Grid, List, Plus, MoreVertical } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PasswordCard } from '@/components/PasswordCard';
import { ViewToggle } from '@/components/ViewToggle';

const VaultDetail: React.FC = () => {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFolder, setSelectedFolder] = React.useState<string>('all');
  const [passwords, setPasswords] = React.useState<PasswordData[]>([]);

  const filteredPasswords = passwords.filter(password => {
    const matchesSearch = password.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         password.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || password.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">个人保险库</h1>
                <p className="text-sm text-muted-foreground">
                  最后同步: 2分钟前
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                设置
              </Button>
              <Button icon={<Plus className="w-4 h-4" />} size="sm">
                添加密码
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 筛选和搜索 */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="搜索密码..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            
            {/* 文件夹筛选 */}
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedFolder === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedFolder('all')}
              >
                全部
              </Button>
              <Button
                variant={selectedFolder === 'login' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedFolder('login')}
              >
                登录
              </Button>
              <Button
                variant={selectedFolder === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedFolder('card')}
              >
                卡片
              </Button>
              <Button
                variant={selectedFolder === 'note' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedFolder('note')}
              >
                笔记
              </Button>
            </div>
            
            {/* 视图切换 */}
            <ViewToggle
              mode={viewMode}
              onModeChange={setViewMode}
            />
          </div>
        </div>
      </div>

      {/* 密码列表 */}
      <main className="container mx-auto px-4 py-8">
        {filteredPasswords.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">没有找到密码</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? '尝试调整搜索条件' : '开始添加您的第一个密码'}
            </p>
            <Button icon={<Plus className="w-4 h-4" />}>
              添加密码
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredPasswords.map((password) => (
              <PasswordCard
                key={password.id}
                id={password.id}
                title={password.title}
                username={password.username}
                url={password.url}
                isFavorite={password.isFavorite}
                onToggleFavorite={handleToggleFavorite}
                onCopy={handleCopy}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VaultDetail;
```

### 密码编辑页

#### 表单布局
```typescript
// pages/PasswordEdit.tsx
import React from 'react';
import { Save, X, Key, User, Globe, FileText, Tag, Folder } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { PasswordGenerator } from '@/components/PasswordGenerator';

const PasswordEdit: React.FC = () => {
  const [formData, setFormData] = React.useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    tags: [] as string[],
    folder: 'personal',
  });
  
  const [showGenerator, setShowGenerator] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 保存密码逻辑
      await savePassword(formData);
      // 返回上一页
      navigate(-1);
    } catch (error) {
      console.error('Failed to save password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratedPassword = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    setShowGenerator(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-bold">
                {formData.id ? '编辑密码' : '添加密码'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                取消
              </Button>
              <Button
                icon={<Save className="w-4 h-4" />}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 表单内容 */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-card rounded-lg border p-6 space-y-6">
            <h2 className="text-lg font-semibold">基本信息</h2>
            
            <Input
              label="标题 *"
              placeholder="例如：Google 账户"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              leftIcon={<Key className="w-4 h-4" />}
              required
            />
            
            <Input
              label="用户名"
              placeholder="用户名或邮箱"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              leftIcon={<User className="w-4 h-4" />}
            />
            
            <PasswordInput
              label="密码 *"
              placeholder="输入密码"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              showStrength
              required
            />
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGenerator(!showGenerator)}
                className="flex-1"
              >
                <Key className="w-4 h-4 mr-2" />
                生成密码
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData(prev => ({ ...prev, password: '' }))}
                disabled={!formData.password}
              >
                清除
              </Button>
            </div>
            
            {showGenerator && (
              <PasswordGenerator
                onGenerated={handleGeneratedPassword}
                onClose={() => setShowGenerator(false)}
              />
            )}
            
            <Input
              label="网址"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              leftIcon={<Globe className="w-4 h-4" />}
              type="url"
            />
          </div>

          {/* 附加信息 */}
          <div className="bg-card rounded-lg border p-6 space-y-6">
            <h2 className="text-lg font-semibold">附加信息</h2>
            
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                备注
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="添加备注信息..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                文件夹
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.folder}
                onChange={(e) => setFormData(prev => ({ ...prev, folder: e.target.value }))}
              >
                <option value="personal">个人</option>
                <option value="work">工作</option>
                <option value="finance">财务</option>
                <option value="social">社交</option>
              </select>
            </div>
          </div>

          {/* 安全设置 */}
          <div className="bg-card rounded-lg border p-6 space-y-6">
            <h2 className="text-lg font-semibold">安全设置</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">启用双因素认证</h3>
                  <p className="text-sm text-muted-foreground">
                    为此账户启用额外的安全验证
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">自动填充</h3>
                  <p className="text-sm text-muted-foreground">
                    允许浏览器自动填充此密码
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  defaultChecked
                />
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default PasswordEdit;
```

## 🎭 动画和交互设计

### 加载状态动画
```typescript
// components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-500 ${sizeClasses[size]} ${className}`} />
  );
};

export { LoadingSpinner };
```

### 骨架屏组件
```typescript
// components/Skeleton.tsx
import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', lines = 1 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-md bg-secondary ${className}`}
          style={{
            height: lines === 1 ? '1rem' : '0.75rem',
            width: i === lines - 1 ? '80%' : '100%',
          }}
        />
      ))}
    </div>
  );
};

export { Skeleton };
```

### 过渡动画
```typescript
// components/Transition.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

const Transition: React.FC<{
  children: React.ReactNode;
  type?: 'fadeIn' | 'slideUp';
}> = ({ children, type = 'fadeIn' }) => {
  const variants = type === 'fadeIn' ? fadeIn : slideUp;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export { Transition };
```

## 🎨 演示模式设计

### 演示模式组件
```typescript
// components/DemoMode.tsx
import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Settings } from 'lucide-react';
import { Button } from '@/components/Button';

interface DemoStep {
  title: string;
  description: string;
  action: () => void;
  duration: number;
}

interface DemoModeProps {
  steps: DemoStep[];
  onComplete: () => void;
}

const DemoMode: React.FC<DemoModeProps> = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying && currentStep < steps.length) {
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + (100 / (steps[currentStep].duration * 10));
        });
      }, 100);
    }

    return () => clearInterval(timer);
  }, [isPlaying, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setProgress(0);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setProgress(0);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 演示控制栏 */}
        <div className="border-b bg-secondary/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                演示模式 {currentStep + 1}/{steps.length}
              </span>
              <div className="w-48 bg-secondary rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={handlePrevious}>
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNext}>
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onComplete}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 演示内容 */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </div>
          
          {/* 演示区域 */}
          <div className="bg-secondary/30 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
            {React.cloneElement(currentStepData.action() as React.ReactElement, {
              demoMode: true,
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export { DemoMode };
```

### 技术亮点可视化
```typescript
// components/TechnicalHighlight.tsx
import React from 'react';
import { Shield, Database, Network, Zap } from 'lucide-react';

interface TechnicalHighlightProps {
  type: 'encryption' | 'storage' | 'blockchain' | 'performance';
  title: string;
  value: string;
  description: string;
}

const TechnicalHighlight: React.FC<TechnicalHighlightProps> = ({
  type,
  title,
  value,
  description,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'encryption':
        return <Shield className="w-6 h-6" />;
      case 'storage':
        return <Database className="w-6 h-6" />;
      case 'blockchain':
        return <Network className="w-6 h-6" />;
      case 'performance':
        return <Zap className="w-6 h-6" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'encryption':
        return 'text-error-500 bg-error-50 border-error-200';
      case 'storage':
        return 'text-info-500 bg-info-50 border-info-200';
      case 'blockchain':
        return 'text-primary-500 bg-primary-50 border-primary-200';
      case 'performance':
        return 'text-success-500 bg-success-50 border-success-200';
    }
  };

  return (
    <div className={`border rounded-lg p-6 ${getColor()}`}>
      <div className="flex items-center space-x-3 mb-3">
        {getIcon()}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="text-2xl font-bold mb-2">{value}</div>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
};

export { TechnicalHighlight };
```

## 📱 响应式设计

### 断点系统
```typescript
// utils/breakpoints.ts
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('xs');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= breakpoints['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};
```

### 响应式网格
```typescript
// components/ResponsiveGrid.tsx
import React from 'react';
import { useBreakpoint } from '@/utils/breakpoints';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 },
  gap = 4,
}) => {
  const breakpoint = useBreakpoint();
  
  const gridCols = cols[breakpoint] || cols.xs || 1;
  
  return (
    <div 
      className={`grid gap-${gap}`}
      style={{
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
};

export { ResponsiveGrid };
```

## 🎯 实施建议

### 开发优先级
1. **Week 1**: 核心组件系统（按钮、输入框、卡片）
2. **Week 2**: 页面布局和基础样式
3. **Week 3**: 交互逻辑和状态管理
4. **Week 4**: 动画效果和演示模式
5. **Week 5**: 响应式优化和性能提升
6. **Week 6**: 最终完善和演示准备

### 质量保证
- **组件测试**: 每个组件都需要单元测试
- **样式测试**: 确保跨浏览器一致性
- **性能测试**: 组件渲染性能优化
- **可访问性测试**: WCAG 2.1 AA 标准符合性

### 维护和扩展
- **设计令牌**: 集中管理样式变量
- **组件文档**: 详细的使用说明和示例
- **版本控制**: 语义化版本管理
- **向后兼容**: 保持 API 的稳定性

这个完整的UI/UX设计文档为SuiPass项目提供了详细的实施指导，涵盖了从基础组件到复杂页面的所有设计要素。文档包含了具体的代码实现、样式规范、交互设计和响应式布局，可以直接用于开发实施。