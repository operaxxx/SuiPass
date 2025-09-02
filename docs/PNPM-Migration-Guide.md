# 从 npm 迁移到 pnpm 指南

## 概述

本项目已从 npm 迁移到 pnpm 包管理器。pnpm 提供了更快的安装速度、更少的磁盘空间占用和更严格的依赖管理。

## 主要变更

### 1. 新增配置文件

- **pnpm-workspace.yaml**: 定义工作空间配置
  ```yaml
  packages:
    - 'packages/*'
  ```

### 2. 脚本命令变更

#### 根目录命令对比

| npm 命令 | pnpm 命令 |
|---------|----------|
| `npm run dev` | `pnpm dev` |
| `npm run build` | `pnpm build` |
| `npm run test` | `pnpm test` |
| `npm run bootstrap` | `pnpm bootstrap` |
| `npm run clean` | `pnpm clean` |

#### 工作空间命令

**旧方式 (npm):**
```bash
npm run dev --workspace=frontend
```

**新方式 (pnpm):**
```bash
pnpm run --filter frontend dev
```

### 3. 包管理器锁定

在 `package.json` 中添加了 `packageManager` 字段：
```json
{
  "packageManager": "pnpm@8.15.0"
}
```

这确保了所有开发者使用相同版本的 pnpm。

## 使用指南

### 1. 安装 pnpm

```bash
npm install -g pnpm@8.15.0
```

### 2. 安装依赖

```bash
# 安装所有依赖
pnpm install

# 安装特定包
pnpm add <package-name>
pnpm add -D <dev-package-name>
pnpm add -w <workspace-package>
```

### 3. 运行脚本

```bash
# 运行根目录脚本
pnpm <script-name>

# 运行特定工作空间的脚本
pnpm run --filter <workspace-name> <script-name>

# 在所有工作空间运行脚本
pnpm -r <script-name>
```

### 4. 常用命令

```bash
# 查看依赖树
pnpm why <package-name>

# 检查过时的依赖
pnpm outdated

# 更新依赖
pnpm update

# 清理 node_modules
pnpm -r exec rm -rf node_modules
pnpm store prune
```

## 优势

1. **速度更快**: pnpm 的安装速度比 npm 快 2-3 倍
2. **空间节省**: 使用硬链接和符号链接，避免重复安装
3. **严格模式**: 默认创建更扁平的 node_modules 结构
4. **更好的 monorepo 支持**: 原生支持工作空间

## 注意事项

1. 如果遇到权限问题，可以运行：
   ```bash
   pnpm install --frozen-lockfile
   ```

2. 在 CI/CD 中确保使用 pnpm：
   ```yaml
   - name: Install pnpm
     uses: pnpm/action-setup@v2
     with:
       version: 8.15.0
   ```

3. 删除旧的 npm 相关文件：
   ```bash
   rm -rf package-lock.json
   rm -rf packages/*/package-lock.json
   ```

## 故障排除

### 常见问题

1. **"pnpm: command not found"**
   - 确保 pnpm 已正确安装：`npm install -g pnpm`

2. **依赖冲突**
   - 使用 `pnpm why <package>` 查看依赖关系
   - 使用 `pnpm update` 更新依赖

3. **权限问题**
   - 使用 `pnpm install --frozen-lockfile`
   - 检查文件权限

### 迁移回 npm

如果需要迁移回 npm：

1. 删除 `pnpm-workspace.yaml`
2. 删除 `pnpm-lock.yaml`
3. 更新 `package.json` 中的脚本
4. 运行 `npm install` 生成新的 `package-lock.json`