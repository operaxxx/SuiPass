# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SuiPass is a decentralized password manager built on Sui blockchain and Walrus storage. This is a monorepo using pnpm workspaces with a React frontend and Sui Move smart contracts.

## Architecture

### Monorepo Structure

- **packages/frontend/** - React 18 + TypeScript frontend application
- **packages/contracts/** - Sui Move smart contracts
- **packages/shared/** - Shared utilities (currently empty)
- **docs/** - Project documentation
- **scripts/** - Build and deployment scripts

### Key Technologies

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query
- **Blockchain**: Sui Move, @mysten/sui.js, @suiet/wallet-kit
- **Storage**: IndexedDB (local), Walrus (decentralized)
- **Encryption**: AES-256-GCM, Argon2id key derivation
- **Testing**: Vitest, Playwright, Sui Move test framework

## Development Commands

### Common Commands

```bash
# Install all dependencies and build
pnpm bootstrap

# Start frontend development server
pnpm dev

# Run frontend tests
pnpm test

# Run contract tests
pnpm contract:test

# Build entire project
pnpm build

# Code quality
pnpm lint          # ESLint
pnpm type-check    # TypeScript
pnpm format        # Prettier
```

### Frontend Development

```bash
cd packages/frontend

# Development
pnpm dev            # Start dev server on port 3000
pnpm build          # Build for production
pnpm preview        # Preview production build

# Testing
pnpm test           # Unit tests with Vitest
pnpm test:e2e       # End-to-end tests with Playwright
pnpm test:ui        # Run tests in UI mode

# Type checking and linting
pnpm type-check     # TypeScript validation
pnpm lint           # ESLint
```

### Smart Contract Development

```bash
cd packages/contracts

# Build and test
pnpm build          # Compile Move contracts
pnpm test           # Run Move tests
pnpm coverage       # Generate test coverage
pnpm lint           # Run Move linter (clippy)

# Deployment
pnpm deploy         # Deploy to current network
pnpm devnet:deploy  # Deploy to devnet (skip dependency verification)
```

## Key Configuration

### Environment Variables

Create `.env` in `packages/frontend/`:

```env
VITE_SUI_NETWORK=testnet
VITE_SUI_RPC_URL=https://sui.testnet.rpc
VITE_WALRUS_RPC_URL=https://walrus.testnet.rpc
VITE_ENABLE_ZKLOGIN=true
VITE_ENABLE_LOCAL_MODE=true
```

### Path Aliases

- `@/*` maps to `packages/frontend/src/*`

### Sui Network Setup

1. Install Sui CLI: `cargo install --git https://github.com/MystenLabs/sui --branch main sui`
2. Start local network: `sui start`
3. Configure wallet for testing

## Code Architecture Patterns

### Frontend State Management

- Uses Zustand with persistence middleware
- Stores in `packages/frontend/src/stores/`
- Key stores: `auth.ts`, `vault.ts`, `password.ts`

### Service Layer

- API interactions in `packages/frontend/src/services/`
- Key services: `sui.ts` (blockchain), `encryption.ts`, `storage.ts`

### Component Structure

- Reusable components in `packages/frontend/src/components/`
- Page components in `packages/frontend/src/pages/`
- Custom hooks in `packages/frontend/src/hooks/`

### Smart Contract Structure

- Move modules in `packages/contracts/sources/`
- Module naming: `vault.move`, `password.move`, `access_control.move`
- Tests in `packages/contracts/tests/`

## Security Considerations

### Encryption Patterns

- All sensitive data encrypted client-side using AES-256-GCM
- Master keys derived with Argon2id
- Never store plain text passwords or encryption keys

### Blockchain Security

- Use Sui's object capabilities model
- Implement proper access controls
- Validate all external inputs

### Frontend Security

- Content Security Policy (CSP) enabled
- No sensitive data in localStorage
- Sanitize all user inputs

## Development Workflow

1. **Setup**: Run `./scripts/init.sh` to initialize the project
2. **Development**: Use `pnpm dev` for frontend, `pnpm contract:test` for contracts
3. **Testing**: All tests must pass before committing
4. **Building**: Use `pnpm build` to verify production build
5. **Deploying**: Use Changesets for versioning and publishing

## Testing Guidelines

### Frontend Tests

- Unit tests with Vitest
- Component tests with Testing Library
- E2E tests with Playwright
- Coverage threshold: 80%

### Contract Tests

- Move unit tests with `#[test]` attributes
- Integration tests with `sui move test`
- Gas optimization checks

## Important Notes

- The project uses pnpm workspaces - always run commands from root
- Husky pre-commit hooks are configured for code quality
- All TypeScript strict mode rules are enabled
- Tailwind CSS is configured with custom design tokens
- The project supports both local mode and decentralized mode

- 需要编译智能合约时, 进入到 @packages/contracts/ 进行编译
