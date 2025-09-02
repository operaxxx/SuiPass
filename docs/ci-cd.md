# CI/CD Pipeline Documentation

## Overview

This document describes the enhanced CI/CD pipeline for SuiPass, supporting the layered architecture with Sui blockchain for identity/ownership and Walrus storage for encrypted data.

## Pipeline Structure

### Trigger Events
- **Push**: `main` and `develop` branches
- **Pull Request**: Targeting `main` branch
- **Manual Dispatch**: With environment selection (local, testnet, mainnet)

### Jobs Overview

#### 1. Code Quality & Security
- **Lint**: ESLint, TypeScript, Prettier checks
- **Security**: npm audit, Sui Move security analysis
- **Dependencies**: Security vulnerability scanning

#### 2. Testing Matrix
- **Frontend Tests**: Unit tests with coverage for different networks
- **Contract Tests**: Move contract testing with gas analysis
- **E2E Tests**: Cross-browser end-to-end testing
- **Performance**: Benchmarking and performance analysis

#### 3. Build & Deploy
- **Build**: Artifact creation and upload
- **Contract Deployment**: Multi-network contract deployment
- **Frontend Deployment**: Netlify deployment with environment-specific configs
- **Documentation**: Automated documentation generation

#### 4. Monitoring & Notifications
- **Gas Usage**: Contract gas consumption reporting
- **Performance Metrics**: Performance benchmarking
- **Slack Notifications**: Success/failure notifications

## Environment Configuration

### Supported Networks
- **Local**: Development and testing
- **Testnet**: Staging and user acceptance testing
- **Mainnet**: Production deployment

### Environment Variables

#### Required Secrets
```bash
# Sui Network Configuration
SUI_NETWORK=testnet
SUI_RPC_URL=https://sui.testnet.rpc

# Walrus Storage Configuration
WALRUS_NETWORK=testnet
WALRUS_RPC_URL=https://walrus.testnet.rpc
ENCRYPTION_KEY=your-encryption-key

# Deployment Configuration
DEPLOY_KEY=your-deploy-key
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_SITE_ID=your-netlify-site-id

# Notifications
SLACK_WEBHOOK_URL=your-slack-webhook
```

#### Frontend Environment
```env
VITE_SUI_NETWORK=testnet
VITE_SUI_RPC_URL=https://sui.testnet.rpc
VITE_WALRUS_RPC_URL=https://walrus.testnet.rpc
VITE_ENABLE_ZKLOGIN=true
VITE_ENABLE_LOCAL_MODE=false
```

## Security Features

### Smart Contract Security
- **Static Analysis**: Sui Move clippy and custom security checks
- **Gas Optimization**: Gas usage analysis and optimization
- **Access Control**: Capability-based access control verification
- **Input Validation**: Comprehensive input validation checks

### Frontend Security
- **Content Security Policy**: Strict CSP headers
- **Input Sanitization**: XSS prevention
- **Dependency Scanning**: Regular vulnerability scans
- **Encryption**: Client-side encryption with AES-256-GCM

### Storage Security
- **Walrus Integration**: Encrypted data storage
- **Key Management**: Secure key derivation with Argon2id
- **Integrity Checks**: Data integrity verification

## Performance Monitoring

### Metrics Tracked
- **Contract Performance**: Gas usage, execution time
- **Frontend Performance**: Load time, bundle size, render performance
- **Storage Performance**: Upload/download times
- **Encryption Performance**: Key derivation, encryption/decryption speed

### Benchmarking
- **Automated Benchmarks**: Performance regression testing
- **Threshold Monitoring**: Alert on performance degradation
- **Historical Comparison**: Performance trend analysis

## Deployment Process

### Contract Deployment
1. **Build**: Compile Move contracts
2. **Test**: Run comprehensive tests
3. **Verify**: Security and gas analysis
4. **Deploy**: Deploy to target network
5. **Verify**: Post-deployment verification
6. **Upload**: Store deployment artifacts in Walrus

### Frontend Deployment
1. **Build**: Compile TypeScript and bundle assets
2. **Test**: Run E2E tests
3. **Deploy**: Deploy to Netlify
4. **Configure**: Set environment-specific configurations
5. **Monitor**: Set up performance monitoring

### Documentation Updates
1. **Generate**: Create API documentation
2. **Update**: Update contract documentation
3. **Commit**: Automatic documentation commits
4. **Publish**: Deploy documentation updates

## Artifacts and Reports

### Generated Artifacts
- **Build Artifacts**: Compiled contracts and frontend bundles
- **Test Reports**: Unit test, E2E test, and coverage reports
- **Gas Reports**: Contract gas usage analysis
- **Performance Reports**: Benchmarking results
- **Security Reports**: Vulnerability scan results

### Storage Locations
- **GitHub Artifacts**: Temporary storage for build artifacts
- **Walrus Storage**: Permanent storage for encrypted contract data
- **Netlify**: Frontend hosting and deployment
- **GitHub Pages**: Documentation hosting

## Troubleshooting

### Common Issues

#### Contract Deployment Failures
- Check Sui network connectivity
- Verify deployment key validity
- Ensure sufficient gas balance
- Review contract compilation errors

#### Frontend Deployment Issues
- Verify Netlify configuration
- Check environment variables
- Review build logs for errors
- Ensure all dependencies are installed

#### Test Failures
- Check network configuration
- Verify test environment setup
- Review test code for issues
- Check for flaky tests

### Debug Commands
```bash
# Check Sui network status
sui client gas

# Verify contract deployment
sui client object <object-id>

# Test local environment
pnpm dev

# Run specific tests
pnpm test --vault
```

## Best Practices

### Development
- Always run tests locally before committing
- Use consistent coding standards
- Document new features and changes
- Monitor gas usage for contract changes

### Deployment
- Test deployments on testnet first
- Monitor deployment performance
- Keep deployment artifacts for rollback
- Use environment-specific configurations

### Security
- Regular security audits
- Keep dependencies updated
- Monitor for vulnerabilities
- Use encryption for sensitive data

## Maintenance

### Regular Updates
- Update Sui CLI and dependencies
- Review and update security configurations
- Optimize gas usage
- Update performance benchmarks

### Monitoring
- Monitor pipeline performance
- Track deployment success rates
- Monitor security vulnerabilities
- Review performance metrics

## Future Enhancements

### Planned Features
- Multi-chain deployment support
- Advanced performance analytics
- Automated security scanning
- Integration with additional storage providers

### Optimization Opportunities
- Parallel test execution
- Caching optimizations
- Reduced deployment times
- Enhanced error reporting