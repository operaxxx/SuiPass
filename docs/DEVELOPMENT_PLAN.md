# SuiPass 整体开发计划

## 项目概述
SuiPass 是一个基于 Sui 区块链的去中心化密码管理器，提供安全、私密、高效的密码存储和管理解决方案。

## 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **Web3**: @mysten/sui.js, @suiet/wallet-kit
- **加密**: crypto-js, argon2-browser
- **存储**: IndexedDB
- **测试**: Vitest + Testing Library

## 整体开发流程

### 阶段划分
1. **第一阶段 (3周)**: 核心功能开发
2. **第二阶段 (2周)**: 功能增强与用户体验优化
3. **第三阶段 (2周)**: 安全加固与性能优化
4. **第四阶段 (1周)**: 测试与部署准备

### 开发顺序原则
1. **自底向上**: 先开发基础组件和工具类
2. **功能优先**: 先实现核心功能，再添加辅助功能
3. **安全第一**: 加密和安全验证必须贯穿始终
4. **测试驱动**: 编写代码前先设计测试用例

## 第一阶段开发计划

详见：[第一阶段详细开发计划](./PHASE1_PLAN.md)

## React 优化技术应用场景

### 1. 密码列表组件 (PasswordList)
```typescript
// 使用 React.memo 避免不必要的重渲染
export const PasswordList = memo(({ passwords, onPasswordClick }: PasswordListProps) => {
  return (
    <div className="space-y-2">
      {passwords.map(password => (
        <PasswordItem 
          key={password.id} 
          password={password} 
          onClick={onPasswordClick}
        />
      ))}
    </div>
  );
});
```

### 2. 搜索过滤优化
```typescript
// 使用 useMemo 缓存过滤结果
const filteredPasswords = useMemo(() => {
  return passwords.filter(password => 
    password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.url.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [passwords, searchTerm]);
```

### 3. 加密密钥缓存
```typescript
// 使用 useMemo 缓存派生密钥
const masterKey = useMemo(() => {
  return deriveMasterKey(masterPassword, salt);
}, [masterPassword, salt]);
```

## 验收标准

### 智能合约验收标准
1. **功能测试**
   - ✅ 成功创建 Vault
   - ✅ 添加/编辑/删除密码
   - ✅ 共享功能正常工作
   - ✅ 权限控制有效

2. **性能测试**
   - Gas 消耗在合理范围内
   - 交易确认时间 < 5s

3. **安全测试**
   - 通过形式化验证
   - 无已知漏洞

### 前端验收标准
1. **功能完整性**
   - 所有核心功能可用
   - 用户流程顺畅

2. **性能指标**
   - 首屏加载 < 2s
   - 页面交互响应 < 100ms

3. **安全要求**
   - 私钥永不离开浏览器
   - 所有敏感数据本地加密

## 关键交付物

### 第一阶段交付
详见：[第一阶段详细开发计划](./PHASE1_PLAN.md)

## 立即行动项

1. **设置开发环境**
   ```bash
   # 安装依赖
   pnpm install
   
   # 启动开发网络
   pnpm dev:net
   
   # 运行测试
   pnpm test
   ```

2. **创建智能合约测试框架**
   ```bash
   # 初始化 Move 测试
   sui move test
   ```

3. **设置前端开发环境**
   ```bash
   # 启动前端开发服务器
   cd packages/frontend && pnpm dev
   ```

## 最佳实践

### 代码规范
- 使用 ESLint + Prettier
- 遵循 TypeScript 严格模式
- 组件使用 PascalCase
- 工具函数使用 camelCase

### 安全实践
- 所有加密操作在客户端完成
- 使用 HTTPS 进行所有通信
- 定期更新依赖项
- 实施内容安全策略 (CSP)

### 开发流程
- 功能分支开发
- Pull Request 代码审查
- 自动化 CI/CD
- 测试覆盖率 > 80%

---

**最后更新**: 2025-09-02
**版本**: 1.0