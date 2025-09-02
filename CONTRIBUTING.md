# 贡献指南

感谢您对 SuiPass 的关注！我们欢迎任何形式的贡献。

## 🤝 如何贡献

### 报告问题

如果您发现了 bug 或有功能建议，请：

1. 先检查 [Issues](https://github.com/your-org/suipass/issues) 确保问题未被报告
2. 创建新的 Issue，使用合适的模板：
   - Bug 报告：提供复现步骤、期望行为、实际行为
   - 功能请求：详细描述需求和用例

### 提交代码

1. **Fork 仓库**
   ```bash
   # Fork 并克隆到本地
   git clone https://github.com/your-username/suipass.git
   cd suipass
   ```

2. **设置上游仓库**
   ```bash
   git remote add upstream https://github.com/your-org/suipass.git
   ```

3. **创建功能分支**
   ```bash
   # 从最新的 main 分支创建
   git fetch upstream
   git checkout -b feature/your-feature-name upstream/main
   ```

4. **开发**
   - 遵循项目代码风格
   - 编写测试
   - 更新文档

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **推送并创建 PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   然后在 GitHub 上创建 Pull Request。

### 代码规范

#### Git 提交信息

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

类型包括：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建或工具变动

示例：
```
feat(zklogin): add Google OAuth provider support

- Add Google OAuth integration
- Implement JWT token validation
- Update error handling

Closes #123
```

#### TypeScript 规范

```typescript
// ✅ 良好的类型定义
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

// ❌ 避免 any 类型
const data: any = fetchData();  // 不要这样做

// ✅ 使用具体类型
interface Data {
  // ...
}
const data: Data = fetchData();
```

#### React 组件规范

```tsx
// ✅ 使用函数组件和 Hooks
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant, onClick, children }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### 测试要求

- 所有新功能必须包含测试
- 保持测试覆盖率 > 80%
- 单元测试使用 Vitest
- E2E 测试使用 Playwright

## 📋 开发环境设置

1. 克隆项目：
   ```bash
   git clone https://github.com/your-org/suipass.git
   cd suipass
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 运行开发服务器：
   ```bash
   npm run dev
   ```

## 🎯 优先功能

查看 [项目看板](https://github.com/your-org/suipass/projects) 了解当前的开发重点。

## 📝 文档贡献

改进文档是非常有价值的贡献！您可以：

- 修复拼写错误
- 添加代码注释
- 改进 API 文档
- 创建教程或指南

## 💬 社区

- [Discord](https://discord.gg/suipass) - 实时讨论
- [Discussions](https://github.com/your-org/suipass/discussions) - 功能讨论
- [Twitter](https://twitter.com/suipass) - 最新动态

## 📄 许可证

通过贡献代码，您同意您的贡献将在 [MIT License](../LICENSE) 下发布。