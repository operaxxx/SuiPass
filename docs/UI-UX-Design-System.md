# SuiPass UI/UX 设计系统

## 1. 设计原则

### 1.1 核心原则
- **安全优先**: 安全功能始终可见且易于理解
- **简洁直观**: 减少认知负担，核心功能一目了然
- **一致性**: 跨平台保持统一的设计语言
- **可访问性**: 遵循WCAG 2.1 AA标准

### 1.2 情感设计
- **信任感**: 通过视觉设计传达安全可靠
- **掌控感**: 用户始终了解数据状态和位置
- **流畅感**: 动画和过渡自然流畅
- **专业感**: 精致的细节和高质量图标

## 2. 色彩系统

### 2.1 主色调
```css
/* Sui品牌色 */
--sui-primary: #00B8A9; /* Sui青色 */
--sui-primary-dark: #009588;
--sui-primary-light: #4DD9CC;

/* 功能色 */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;

/* 中性色 */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

### 2.2 色彩使用规范
- 主色调用于主要操作按钮和重要状态
- 功能色有明确的语义含义，不可混用
- 中性色用于文本、边框和背景
- 深色模式使用降低饱和度的色彩

## 3. 排版系统

### 3.1 字体栈
```css
font-family: 
  'Inter', 
  -apple-system, 
  BlinkMacSystemFont, 
  'Segoe UI', 
  Roboto, 
  sans-serif;
```

### 3.2 字阶系统
```css
/* 标题 */
--text-4xl: 2.25rem;  /* 36px - 页面标题 */
--text-3xl: 1.875rem; /* 30px - 区块标题 */
--text-2xl: 1.5rem;   /* 24px - 卡片标题 */
--text-xl: 1.25rem;   /* 20px - 小标题 */

/* 正文 */
--text-lg: 1.125rem;  /* 18px - 重要文本 */
--text-base: 1rem;    /* 16px - 正文 */
--text-sm: 0.875rem;  /* 14px - 说明文字 */
--text-xs: 0.75rem;   /* 12px - 辅助信息 */
```

### 3.3 字重规范
- Bold (700): 页面标题、重要操作
- Semibold (600): 卡片标题、导航
- Medium (500): 强调文本
- Regular (400): 正文内容

## 4. 间距系统

### 4.1 8点网格系统
```css
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
```

### 4.2 间距使用原则
- 组件内间距: 4-8px
- 组件间间距: 16-24px
- 区块间距: 32-48px
- 页面边距: 24px (移动端), 48px (桌面端)

## 5. 组件库

### 5.1 按钮 (Button)

#### 主要按钮
```jsx
<Button variant="primary" size="md">
  保存更改
</Button>
```

#### 次要按钮
```jsx
<Button variant="secondary" size="md">
  取消
</Button>
```

#### 文本按钮
```jsx
<Button variant="text" size="sm">
  忘记密码？
</Button>
```

### 5.2 输入框 (Input)

#### 基础输入框
```jsx
<Input
  type="text"
  placeholder="请输入用户名"
  label="用户名"
  required
/>
```

#### 密码输入框
```jsx
<Input
  type="password"
  placeholder="请输入密码"
  label="密码"
  showPasswordToggle
  strengthIndicator
/>
```

### 5.3 卡片 (Card)

#### 基础卡片
```jsx
<Card>
  <CardHeader>
    <CardTitle>登录信息</CardTitle>
    <CardDescription>example.com</CardDescription>
  </CardHeader>
  <CardContent>
    <Input label="用户名" defaultValue="user@example.com" />
    <Input label="密码" type="password" />
  </CardContent>
  <CardFooter>
    <Button variant="primary">保存</Button>
  </CardFooter>
</Card>
```

### 5.4 模态框 (Modal)

#### 确认删除
```jsx
<Modal isOpen={isOpen} onClose={handleClose}>
  <ModalHeader>
    <ModalTitle>删除条目</ModalTitle>
  </ModalHeader>
  <ModalBody>
    <p>确定要删除这个密码条目吗？此操作不可撤销。</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={handleClose}>
      取消
    </Button>
    <Button variant="destructive" onClick={handleDelete}>
      删除
    </Button>
  </ModalFooter>
</Modal>
```

### 5.5 列表项 (ListItem)

#### 密码条目
```jsx
<ListItem
  title="GitHub"
  subtitle="github.com"
  icon={<GithubIcon />}
  action={
    <Button variant="ghost" size="sm">
      <CopyIcon />
    </Button>
  }
  onClick={() => handleSelect('github')}
/>
```

### 5.6 徽章 (Badge)

#### 状态徽章
```jsx
<Badge variant="success">已同步</Badge>
<Badge variant="warning">弱密码</Badge>
<Badge variant="error">已过期</Badge>
```

### 5.7 模式指示器 (ModeIndicator)

#### 本地模式
```jsx
<ModeIndicator mode="local">
  <Icon name="device" />
  <span>本地模式</span>
  <Button size="sm" variant="outline">升级</Button>
</ModeIndicator>
```

#### 去中心化模式
```jsx
<ModeIndicator mode="decentralized">
  <Icon name="cloud" />
  <span>已同步到Sui</span>
  <SyncStatus isSyncing={false} />
</ModeIndicator>
```

### 5.8 钱包绑定卡片 (WalletBindingCard)

#### zkLogin选项
```jsx
<WalletBindingCard
  type="zklogin"
  providers={['google', 'apple', 'facebook']}
  onSelect={handleZkLoginSelect}
/>
```

#### 传统钱包选项
```jsx
<WalletBindingCard
  type="wallet"
  wallets={['sui-wallet', 'ethos-wallet']}
  onSelect={handleWalletSelect}
/>
```

## 6. 图标系统

### 6.1 图标风格
- 线性图标 (Outline): 用于导航和操作
- 实心图标 (Solid): 用于强调和状态
- 自定义图标: Sui、Walrus等品牌图标

### 6.2 图标尺寸
- 16px: 紧凑空间
- 20px: 默认尺寸
- 24px: 重要操作
- 32px: 大型图标

### 6.3 常用图标集
- 认证: Lock, Key, Shield, Fingerprint
- 操作: Add, Edit, Delete, Copy, Share
- 状态: Check, Alert, Info, Sync
- 导航: Home, Settings, Search, Back

## 7. 页面模板

### 7.1 主页面布局
```
+-------------------------+
|  Header (固定)           |
+-------------------------+
|  Sidebar (可折叠) | Main |
|           |       Content|
|           |       (滚动)  |
+-------------------------+
|  Footer (可选)          |
+-------------------------+
```

### 7.2 登录页面
```
+-----------------------------+
|         Logo               |
+-----------------------------+
|     输入主密码             |
+-----------------------------+
|     生物识别选项           |
+-----------------------------+
|     登录按钮               |
+-----------------------------+
|     恢复选项               |
+-----------------------------+
```

### 7.3 密码库页面
```
+-----------------+----------------+
|  侧边栏          |  密码条目列表   |
|  - 所有条目      |  搜索框        |
|  - 收藏夹        |  筛选器        |
|  - 文件夹        |  网格视图      |
|  - 标签          |  分页          |
|  - 设置          |                |
+-----------------+----------------+
```

### 7.4 钱包绑定流程
```
+-----------------------------+
|      本地模式提示           |
|  "启用云同步，安全备份"    |
|          [升级按钮]        |
+-----------------------------+
             ↓
+-----------------------------+
|      选择绑定方式           |
|  [zkLogin]    [传统钱包]   |
|  "Web2登录"    "Web3钱包"  |
+-----------------------------+
             ↓
+-----------------------------+
|      zkLogin提供商选择      |
|  [Google] [Apple] [Facebook]|
+-----------------------------+
             ↓
+-----------------------------+
|      数据同步选项           |
|  ☑ 同步所有条目            |
|  ☐ 仅同步收藏夹            |
|  ☐ 手动选择                |
+-----------------------------+
             ↓
+-----------------------------+
|         升级完成           |
|  "您的数据现已安全存储在  |
|   Sui区块链上"            |
|         [完成]            |
+-----------------------------+
```

## 8. 动画和过渡

### 8.1 缓动函数
```css
/* 标准缓动 */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* 进入缓动 */
--ease-out: cubic-bezier(0, 0, 0.2, 1);

/* 退出缓动 */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

### 8.2 动画时长
- 快速: 150ms (工具提示、切换)
- 标准: 300ms (模态框、页面过渡)
- 慢速: 500ms (复杂动画)

### 8.3 动画类型
- 淡入淡出: 透明度变化
- 滑动: 位置变化
- 缩放: 大小变化
- 旋转: 360度旋转（加载中）

## 9. 响应式设计

### 9.1 断点系统
```css
/* 移动端 */
--mobile: 320px - 768px

/* 平板 */
--tablet: 769px - 1024px

/* 桌面 */
--desktop: 1025px - 1440px

/* 大屏 */
--large-desktop: 1441px+
```

### 9.2 布局策略
- 移动优先设计
- 触摸友好的目标尺寸 (最小44x44px)
- 流式网格布局
- 灵活的导航模式

## 10. 可访问性

### 10.1 键盘导航
- Tab键顺序逻辑
- Enter/Space激活交互
- Escape关闭弹窗
- 快捷键支持

### 10.2 屏幕阅读器
- 语义化HTML
- ARIA标签
- 动态内容提示
- 错误信息提醒

### 10.3 视觉辅助
- 最小对比度 4.5:1
- 焦点指示器
- 减少动画选项
- 大字体模式

## 11. 暗色模式

### 11.1 配色方案
```css
/* 暗色背景 */
--bg-primary: #0F172A;
--bg-secondary: #1E293B;
--bg-tertiary: #334155;

/* 暗色文本 */
--text-primary: #F8FAFC;
--text-secondary: #CBD5E1;
--text-tertiary: #94A3B8;
```

### 11.2 切换机制
- 系统偏好跟随
- 手动切换选项
- 日间时段自动
- 记住用户选择

## 12. 设计资源

### 12.1 设计工具
- Figma: 主要设计工具
- Framer: 交互原型
- Lottie: 动画制作
- IconJar: 图标管理

### 12.2 资源库
- 组件库文档
- 设计规范Wiki
- 素材资源库
- 用户研究档案