# SuiPass Dashboard

The SuiPass Dashboard is the main interface for managing your password vaults and security settings.

## Features

### 🔐 Security Status
- Real-time vault lock status indicator
- Master password validation
- Last access timestamp
- Encryption method verification

### 📊 Vault Statistics
- Total password items count
- Number of active vaults
- Category organization metrics
- Weak password detection

### 🔍 Search Functionality
- Real-time search across all password items
- Search by title, username, category, URL, and tags
- Instant results display
- Search result highlighting

### 🕒 Recent Items
- Last 5 accessed password items
- Quick access to frequently used passwords
- One-click copy functionality
- Direct edit and delete actions

### ⚡ Quick Actions
- Add new password items
- Generate secure passwords
- Import/Export functionality
- Settings access

## Components

### DashboardLayout
The main layout component that provides:
- Responsive sidebar navigation
- Toast notification system
- Consistent styling and spacing

### StatCard
Displays key metrics with:
- Title and value
- Description text
- Trend indicators
- Icon representation

### SecurityStatus
Shows current security status:
- Vault lock state
- Master password status
- Last access time
- Encryption method

### RecentItems
Lists recently accessed items with:
- Item title and username
- Category badges
- Copy, view, edit, delete actions
- Access timestamps

### QuickActions
Provides fast access to common operations:
- Add new items
- Generate passwords
- Import/Export data
- Access settings

## Usage

### Accessing the Dashboard
The dashboard is available at `/dashboard` route and requires:
1. Wallet connection
2. Vault selection
3. Master password entry (if vault is locked)

### Navigation
- Use the sidebar for navigation between different sections
- Search bar provides instant access to password items
- Quick actions allow fast access to common operations

### Security Features
- Automatic vault locking after inactivity
- Secure password storage with AES-256-GCM encryption
- Real-time security status monitoring
- Weak password detection and alerts

## State Management

The dashboard uses Zustand stores for state management:

- `useAuthStore` - Wallet connection and authentication
- `useVaultStore` - Vault and password item management
- `useUIStore` - UI preferences and search state

## Testing

The dashboard includes comprehensive tests covering:
- Component rendering
- User interactions
- State management
- Error handling
- Search functionality

Run tests with:
```bash
pnpm test
```

## Styling

The dashboard uses:
- Tailwind CSS for styling
- shadcn/ui component library
- Lucide React icons
- Responsive design patterns

## Accessibility

- Semantic HTML structure
- ARIA labels and attributes
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## Performance

- Lazy loading of components
- Optimized re-renders
- Debounced search input
- Efficient state management
- Minimal bundle size