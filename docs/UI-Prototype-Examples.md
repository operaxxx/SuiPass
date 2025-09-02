# SuiPass - 密码管理器UI原型设计

## 1. 关键页面设计

### 1.1 登录/解锁页面
```jsx
// LoginPage.tsx
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sui-50 to-sui-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto text-sui-primary" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            SuiPass
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            去中心化密码管理器
          </p>
        </div>

        {/* 主密码输入 */}
        <div className="space-y-4">
          <Input
            type="password"
            label="主密码"
            placeholder="输入您的密码"
            fullWidth
            autoFocus
          />
          
          {/* 生物识别选项 */}
          {supportsBiometrics && (
            <Button
              variant="outline"
              fullWidth
              icon={<FingerprintIcon />}
              onClick={handleBiometricAuth}
            >
              使用生物识别
            </Button>
          )}
        </div>

        {/* 登录按钮 */}
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleLogin}
        >
          解锁密码库
        </Button>

        {/* 恢复选项 */}
        <div className="text-center">
          <Button variant="text" size="sm">
            忘记密码？
          </Button>
        </div>

        {/* 状态信息 */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <ShieldIcon className="w-4 h-4" />
          <span>数据加密存储在Sui区块链上</span>
        </div>
      </div>
    </div>
  );
}
```

### 1.2 密码库主页面
```jsx
// VaultPage.tsx
export default function VaultPage() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <Sidebar className="w-64 border-r border-gray-200 dark:border-gray-700">
        <SidebarHeader>
          <SearchInput placeholder="搜索密码..." />
        </SidebarHeader>
        
        <SidebarNav>
          <NavItem icon={<AllIcon />} active>
            所有条目 (128)
          </NavItem>
          <NavItem icon={<StarIcon />}>
            收藏夹 (24)
          </NavItem>
          <NavItem icon={<FolderIcon />}>
            文件夹
          </NavItem>
          <NavItem icon={<TagIcon />}>
            标签
          </NavItem>
        </SidebarNav>

        <SidebarFooter>
          <Button
            variant="primary"
            fullWidth
            icon={<PlusIcon />}
            onClick={handleCreate}
          >
            新建条目
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        {/* 顶部栏 */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                我的密码库
              </h1>
              <Badge variant="success">
                <SyncIcon className="w-3 h-3 mr-1" />
                已同步
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" icon={<FilterIcon />}>
                筛选
              </Button>
              <Button variant="ghost" size="sm" icon={<SortIcon />}>
                排序
              </Button>
              <Button variant="ghost" size="sm" icon={<GridIcon />}>
                视图
              </Button>
            </div>
          </div>
        </header>

        {/* 密码条目网格 */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {passwordItems.map((item) => (
              <PasswordCard
                key={item.id}
                item={item}
                onClick={() => handleSelectItem(item)}
                onCopy={() => handleCopyPassword(item)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 1.3 密码条目详情
```jsx
// PasswordDetailPage.tsx
export default function PasswordDetailPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        icon={<ArrowLeftIcon />}
        onClick={handleBack}
        className="mb-6"
      >
        返回
      </Button>

      {/* 条目卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-sui-100 dark:bg-sui-900 rounded-lg flex items-center justify-center">
                <WebsiteIcon className="w-6 h-6 text-sui-primary" />
              </div>
              <div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.url}</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={item.favorite ? <StarFilledIcon /> : <StarIcon />}
              onClick={() => toggleFavorite(item.id)}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 用户名 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              用户名
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-900 dark:text-white">
                {item.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon={<CopyIcon />}
                onClick={() => copyToClipboard(item.username)}
              />
            </div>
          </div>

          {/* 密码 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              密码
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={item.password}
                readOnly
                className="w-48"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
                onClick={() => setShowPassword(!showPassword)}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<CopyIcon />}
                onClick={() => copyToClipboard(item.password)}
              />
            </div>
          </div>

          {/* 其他字段 */}
          {item.notes && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                备注
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                {item.notes}
              </div>
            </div>
          )}

          {/* 安全信息 */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">密码强度</span>
              <PasswordStrength strength={item.strength} />
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600 dark:text-gray-400">创建时间</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(item.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="secondary" onClick={handleEdit}>
            编辑
          </Button>
          <div className="space-x-2">
            <Button variant="outline" icon={<ShareIcon />}>
              分享
            </Button>
            <Button variant="outline" icon={<ExternalLinkIcon />}>
              打开网站
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
```

### 1.4 创建/编辑条目
```jsx
// CreateEditItemPage.tsx
export default function CreateEditItemPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEdit ? '编辑条目' : '新建条目'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 条目类型选择 */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            类型
          </label>
          <div className="grid grid-cols-4 gap-2">
            {itemTypes.map((type) => (
              <Button
                key={type.id}
                type="button"
                variant={formData.type === type.id ? 'primary' : 'outline'}
                size="sm"
                icon={type.icon}
                onClick={() => setFormData({ ...formData, type: type.id })}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="标题"
              placeholder="例如：GitHub"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="网址"
              type="url"
              placeholder="https://github.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
            <Input
              label="用户名"
              placeholder="username@example.com"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <PasswordInput
              label="密码"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onGenerate={handleGeneratePassword}
            />
          </CardContent>
        </Card>

        {/* 高级选项 */}
        <Card>
          <CardHeader>
            <CardTitle>高级选项</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                文件夹
              </label>
              <Select value={formData.folderId} onValueChange={(value) => setFormData({ ...formData, folderId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择文件夹" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                标签
              </label>
              <TagInput
                placeholder="添加标签..."
                tags={formData.tags}
                onTagsChange={(tags) => setFormData({ ...formData, tags })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                备注
              </label>
              <Textarea
                placeholder="添加备注..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 自定义字段 */}
        <Card>
          <CardHeader>
            <CardTitle>自定义字段</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.customFields.map((field, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  placeholder="字段名"
                  value={field.name}
                  onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="字段值"
                  value={field.value}
                  onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<TrashIcon />}
                  onClick={() => removeCustomField(index)}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<PlusIcon />}
              onClick={addCustomField}
            >
              添加字段
            </Button>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            取消
          </Button>
          <Button type="submit" variant="primary">
            {isEdit ? '保存更改' : '创建条目'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

## 2. 特殊组件设计

### 2.1 密码生成器组件
```jsx
// PasswordGenerator.tsx
export default function PasswordGenerator({ onGenerate }: { onGenerate: (password: string) => void }) {
  const [options, setOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
  });

  const [generatedPassword, setGeneratedPassword] = useState('');
  const [strength, setStrength] = useState(0);

  const generatePassword = () => {
    // 生成密码逻辑
    const password = generateSecurePassword(options);
    setGeneratedPassword(password);
    setStrength(calculateStrength(password));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>密码生成器</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 生成的密码 */}
        <div className="flex items-center space-x-2">
          <Input
            value={generatedPassword}
            readOnly
            className="font-mono"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<CopyIcon />}
            onClick={() => copyToClipboard(generatedPassword)}
            disabled={!generatedPassword}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshIcon />}
            onClick={generatePassword}
          />
        </div>

        {/* 密码强度指示器 */}
        {generatedPassword && (
          <PasswordStrength strength={strength} />
        )}

        {/* 长度滑块 */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            长度: {options.length}
          </label>
          <Slider
            min={8}
            max={64}
            value={[options.length]}
            onValueChange={([value]) => setOptions({ ...options, length: value })}
          />
        </div>

        {/* 选项 */}
        <div className="space-y-2">
          <Checkbox
            checked={options.uppercase}
            onCheckedChange={(checked) => setOptions({ ...options, uppercase: checked as boolean })}
          >
            包含大写字母 (A-Z)
          </Checkbox>
          <Checkbox
            checked={options.lowercase}
            onCheckedChange={(checked) => setOptions({ ...options, lowercase: checked as boolean })}
          >
            包含小写字母 (a-z)
          </Checkbox>
          <Checkbox
            checked={options.numbers}
            onCheckedChange={(checked) => setOptions({ ...options, numbers: checked as boolean })}
          >
            包含数字 (0-9)
          </Checkbox>
          <Checkbox
            checked={options.symbols}
            onCheckedChange={(checked) => setOptions({ ...options, symbols: checked as boolean })}
          >
            包含符号 (!@#$%^&*)
          </Checkbox>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-2">
          <Button variant="primary" onClick={generatePassword}>
            生成密码
          </Button>
          <Button
            variant="secondary"
            onClick={() => onGenerate(generatedPassword)}
            disabled={!generatedPassword}
          >
            使用此密码
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2.2 安全共享组件
```jsx
// ShareDialog.tsx
export default function ShareDialog({ item, isOpen, onClose }: ShareDialogProps) {
  const [shareSettings, setShareSettings] = useState({
    type: 'view' as 'view' | 'edit',
    expiresIn: '1day' as '1hour' | '1day' | '1week' | 'never',
    requireAccess: false,
    maxAccessCount: 0,
  });

  const [sharedLink, setSharedLink] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateShare = async () => {
    setIsCreating(true);
    try {
      // 调用Sui智能合约创建共享
      const shareId = await createShareOnSui(item.id, shareSettings);
      setSharedLink(`https://suipass.app/share/${shareId}`);
    } catch (error) {
      console.error('创建共享失败:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>分享密码条目</ModalTitle>
        <ModalDescription>
          分享 "{item.title}" 给其他人
        </ModalDescription>
      </ModalHeader>

      <ModalBody className="space-y-6">
        {!sharedLink ? (
          <>
            {/* 权限设置 */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                权限级别
              </label>
              <RadioGroup
                value={shareSettings.type}
                onValueChange={(value) => setShareSettings({ ...shareSettings, type: value as 'view' | 'edit' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="view" id="view" />
                  <Label htmlFor="view">仅查看</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="edit" id="edit" />
                  <Label htmlFor="edit">可编辑</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 过期时间 */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                过期时间
              </label>
              <RadioGroup
                value={shareSettings.expiresIn}
                onValueChange={(value) => setShareSettings({ ...shareSettings, expiresIn: value as any })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1hour" id="1hour" />
                  <Label htmlFor="1hour">1小时</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1day" id="1day" />
                  <Label htmlFor="1day">1天</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1week" id="1week" />
                  <Label htmlFor="1week">1周</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never" />
                  <Label htmlFor="never">永不过期</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 访问限制 */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                访问限制
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requireAccess"
                    checked={shareSettings.requireAccess}
                    onCheckedChange={(checked) => setShareSettings({ ...shareSettings, requireAccess: checked as boolean })}
                  />
                  <Label htmlFor="requireAccess">需要身份验证</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="maxAccess"
                    checked={shareSettings.maxAccessCount > 0}
                    onCheckedChange={(checked) => setShareSettings({ ...shareSettings, maxAccessCount: checked ? 1 : 0 })}
                  />
                  <Label htmlFor="maxAccess">限制访问次数</Label>
                  {shareSettings.maxAccessCount > 0 && (
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={shareSettings.maxAccessCount}
                      onChange={(e) => setShareSettings({ ...shareSettings, maxAccessCount: parseInt(e.target.value) || 0 })}
                      className="w-20"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 安全提示 */}
            <Alert>
              <ShieldIcon className="w-4 h-4" />
              <AlertDescription>
                分享链接基于Sui区块链，具有去中心化和不可篡改的特性。
                请谨慎设置权限。
              </AlertDescription>
            </Alert>
          </>
        ) : (
          /* 分享链接已创建 */
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
                <CheckIcon className="w-5 h-5" />
                <span className="font-medium">分享链接已创建</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Input
                value={sharedLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<CopyIcon />}
                onClick={() => copyToClipboard(sharedLink)}
              />
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>权限: {shareSettings.type === 'view' ? '仅查看' : '可编辑'}</p>
              <p>过期时间: {getExpiryText(shareSettings.expiresIn)}</p>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          {sharedLink ? '完成' : '取消'}
        </Button>
        {!sharedLink && (
          <Button
            variant="primary"
            onClick={handleCreateShare}
            disabled={isCreating}
          >
            {isCreating ? '创建中...' : '创建分享链接'}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
```

## 3. 响应式设计适配

### 3.1 移动端适配
```css
/* 移动端样式覆盖 */
@media (max-width: 768px) {
  /* 侧边栏变为抽屉 */
  .sidebar {
    @apply fixed inset-y-0 left-0 z-50 transform -translate-x-full;
    transition: transform 0.3s ease-in-out;
  }
  
  .sidebar.open {
    @apply translate-x-0;
  }

  /* 网格布局变为单列 */
  .password-grid {
    @apply grid-cols-1;
  }

  /* 模态框全屏 */
  .modal {
    @apply inset-0 rounded-none;
  }

  /* 按钮尺寸增大 */
  .btn {
    @apply min-h-[44px] px-4;
  }
}
```

### 3.2 平板适配
```css
/* 平板样式 */
@media (min-width: 769px) and (max-width: 1024px) {
  /* 调整网格列数 */
  .password-grid {
    @apply grid-cols-2 lg:grid-cols-3;
  }

  /* 侧边栏可折叠 */
  .sidebar {
    @apply w-20;
  }
  
  .sidebar.expanded {
    @apply w-64;
  }
}
```

## 4. 动画效果

### 4.1 页面过渡
```jsx
// PageTransition.tsx
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

### 4.2 加载动画
```jsx
// LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-6 h-6 border-2 border-gray-200 border-t-sui-primary rounded-full"
    />
  );
}
```

### 4.3 密码强度动画
```jsx
// PasswordStrength.tsx
export function PasswordStrength({ strength }: { strength: number }) {
  const getStrengthColor = () => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 3) return 'bg-yellow-500';
    if (strength < 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getStrengthColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${(strength / 5) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {getStrengthText(strength)}
      </span>
    </div>
  );
}
```

## 5. 暗色模式实现

### 5.1 主题提供者
```jsx
// ThemeProvider.tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(storedTheme || systemTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 5.2 主题切换按钮
```jsx
// ThemeToggle.tsx
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={theme === 'light' ? <MoonIcon /> : <SunIcon />}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' ? '暗色模式' : '亮色模式'}
    </Button>
  );
}
```