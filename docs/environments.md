# Environment Configuration Templates

## Local Development (.env.local)
```env
# Sui Configuration
VITE_SUI_NETWORK=local
VITE_SUI_RPC_URL=http://localhost:9000

# Walrus Configuration
VITE_WALRUS_RPC_URL=http://localhost:9001

# Feature Flags
VITE_ENABLE_ZKLOGIN=false
VITE_ENABLE_LOCAL_MODE=true
VITE_ENABLE_DEV_TOOLS=true

# Analytics (disabled in local)
VITE_ENABLE_ANALYTICS=false
```

## Testnet Environment (.env.testnet)
```env
# Sui Configuration
VITE_SUI_NETWORK=testnet
VITE_SUI_RPC_URL=https://sui.testnet.rpc

# Walrus Configuration
VITE_WALRUS_RPC_URL=https://walrus.testnet.rpc

# Feature Flags
VITE_ENABLE_ZKLOGIN=true
VITE_ENABLE_LOCAL_MODE=false
VITE_ENABLE_DEV_TOOLS=false

# Analytics
VITE_ENABLE_ANALYTICS=true
VITE_ANALYTICS_ID=your-testnet-analytics-id
```

## Mainnet Environment (.env.mainnet)
```env
# Sui Configuration
VITE_SUI_NETWORK=mainnet
VITE_SUI_RPC_URL=https://sui.mainnet.rpc

# Walrus Configuration
VITE_WALRUS_RPC_URL=https://walrus.mainnet.rpc

# Feature Flags
VITE_ENABLE_ZKLOGIN=true
VITE_ENABLE_LOCAL_MODE=false
VITE_ENABLE_DEV_TOOLS=false

# Analytics
VITE_ENABLE_ANALYTICS=true
VITE_ANALYTICS_ID=your-mainnet-analytics-id
```

## GitHub Secrets Configuration

### Required for CI/CD
```bash
# Sui Network
SUI_TESTNET_RPC_URL=https://sui.testnet.rpc
SUI_MAINNET_RPC_URL=https://sui.mainnet.rpc

# Walrus Storage
WALRUS_TESTNET_RPC_URL=https://walrus.testnet.rpc
WALRUS_MAINNET_RPC_URL=https://walrus.mainnet.rpc
WALRUS_ENCRYPTION_KEY=your-secure-encryption-key

# Deployment Keys
DEPLOY_TESTNET_KEY=your-testnet-deploy-key
DEPLOY_MAINNET_KEY=your-mainnet-deploy-key

# Netlify Deployment
NETLIFY_AUTH_TOKEN=your-netlify-auth-token
NETLIFY_SITE_ID=your-netlify-site-id
NETLIFY_TESTNET_SITE_ID=your-testnet-site-id
NETLIFY_MAINNET_SITE_ID=your-mainnet-site-id

# Notifications
SLACK_WEBHOOK_URL=your-slack-webhook-url
SLACK_SUCCESS_WEBHOOK=your-success-webhook
SLACK_FAILURE_WEBHOOK=your-failure-webhook

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key
```

### Optional Features
```bash
# Analytics
GOOGLE_ANALYTICS_ID=your-ga-id
MIXPANEL_TOKEN=your-mixpanel-token

# Security
CSP_REPORT_ONLY=false
ENABLE_SRI=true

# Performance
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_ERROR_TRACKING=true
```

## Network-Specific Scripts

### Testnet Deployment
```bash
# Deploy contracts to testnet
pnpm deploy:testnet

# Deploy frontend to testnet
pnpm deploy:frontend:testnet

# Run testnet-specific tests
pnpm test:testnet
```

### Mainnet Deployment
```bash
# Deploy contracts to mainnet
pnpm deploy:mainnet

# Deploy frontend to mainnet
pnpm deploy:frontend:mainnet

# Run mainnet-specific tests
pnpm test:mainnet
```

## Environment Validation

### Pre-deployment Checks
```bash
# Validate environment configuration
pnpm env:validate

# Check required secrets
pnpm secrets:check

# Verify network connectivity
pnpm network:check
```

### Configuration Files
- `.github/security-config.json` - Security scanning configuration
- `.github/performance-config.json` - Performance benchmarking
- `scripts/deploy-walrus.sh` - Walrus deployment script
- `docs/ci-cd.md` - Complete CI/CD documentation

## Setup Instructions

### 1. Local Development
```bash
# Copy environment template
cp .env.example .env.local

# Install dependencies
pnpm bootstrap

# Start development server
pnpm dev
```

### 2. Testnet Setup
```bash
# Configure GitHub secrets for testnet
# - SUI_TESTNET_RPC_URL
# - WALRUS_TESTNET_RPC_URL
# - NETLIFY_TESTNET_SITE_ID
# - DEPLOY_TESTNET_KEY

# Deploy to testnet
gh workflow run ci.yml --ref main -f environment=testnet
```

### 3. Mainnet Setup
```bash
# Configure GitHub secrets for mainnet
# - SUI_MAINNET_RPC_URL
# - WALRUS_MAINNET_RPC_URL
# - NETLIFY_MAINNET_SITE_ID
# - DEPLOY_MAINNET_KEY

# Deploy to mainnet
gh workflow run ci.yml --ref main -f environment=mainnet
```

## Security Best Practices

### Environment Variables
- Never commit sensitive data to version control
- Use GitHub secrets for sensitive configuration
- Rotate secrets regularly
- Use different keys for different environments

### Network Configuration
- Use strict network-specific configurations
- Enable additional security features in production
- Monitor network performance and security
- Keep network configurations in sync

### Deployment Security
- Use multi-signature wallets for mainnet deployments
- Implement deployment approval workflows
- Monitor deployment success rates
- Keep deployment logs for auditing