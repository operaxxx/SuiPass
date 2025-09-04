# Branch Protection Rules for SuiPass

## Main Branch Protection

Branch: `main`

### Required Status Checks

- ✅ `CI/CD Pipeline` (ci.yml)
- ✅ `Test Suite` (test.yml)
- ✅ `Security Scan` (security.yml)
- ✅ `Contract Tests` (contracts.yml)

### Protection Rules

- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- [x] Require pull request reviews before merging
- [x] Require review from Code Owners
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require conversation resolution before merging
- [x] Require signed commits
- [x] Require linear history
- [x] Do not allow bypassing the above settings

### Pull Request Requirements

- [x] At least 1 approval
- [x] Code owners approval required
- [x] No deletions allowed
- [x] No force pushes allowed

## Develop Branch Protection

Branch: `develop`

### Required Status Checks

- ✅ `CI/CD Pipeline` (ci.yml)
- ✅ `Test Suite` (test.yml)

### Protection Rules

- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- [x] Require pull request reviews before merging
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require conversation resolution before merging
- [x] Require signed commits
- [x] Require linear history

### Pull Request Requirements

- [x] At least 1 approval
- [x] No deletions allowed
- [x] No force pushes allowed

## Feature Branch Guidelines

- Branch naming: `feature/`, `bugfix/`, `hotfix/`, `release/`
- All feature branches must be created from `develop`
- All hotfix branches must be created from `main`
- Pull requests must target `develop` (except hotfixes)
- All PRs must pass automated checks before review
- PR descriptions must include:
  - Clear title following conventional commits
  - Detailed description of changes
  - Testing checklist
  - Breaking changes (if any)
  - Related issues/PRs

## Code Owners

Create `CODEOWNERS` file in `.github/`:

```
# Global code owners
* @hukun

# Frontend code
packages/frontend/* @frontend-team
packages/frontend/src/**/* @frontend-team

# Smart contracts
packages/contracts/* @blockchain-team
packages/contracts/sources/**/* @blockchain-team

# Documentation
docs/**/* @docs-team

# CI/CD configuration
.github/**/* @devops-team
```

## Automated Workflow

1. **Feature Branch** → **Develop**
   - Automated checks run on every push
   - PR requires 1 approval
   - Must pass all tests and security scans

2. **Develop** → **Main**
   - Automated checks run on every push
   - PR requires 2 approvals
   - Must pass all tests, security scans, and performance benchmarks
   - Code owners approval required
   - Documentation must be updated

3. **Hotfix** → **Main**
   - Direct merge to main allowed for emergency fixes
   - Must pass all automated checks
   - Requires 2 approvals
   - Must be merged back to develop

## Quality Gates

- **Test Coverage**: Minimum 80% for new code
- **Security**: No high-severity vulnerabilities
- **Performance**: No performance regression > 5%
- **Code Quality**: No ESLint errors or warnings
- **Type Safety**: No TypeScript errors
- **Contract Gas**: No gas regression > 10%
