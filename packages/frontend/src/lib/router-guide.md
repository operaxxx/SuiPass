# SuiPass Router Guide

## Overview

The SuiPass application uses **TanStack Router** for client-side routing. This guide covers the router architecture, configuration, and usage patterns.

## Router Architecture

### Core Components

1. **Root Route** (`src/routes/__root.tsx`)
   - Application wrapper with wallet provider
   - Route guards and error handling
   - Layout components

2. **File-based Routing**
   - Routes are defined in `src/routes/` directory
   - Automatic route generation using `@tanstack/router-vite-plugin`
   - Route tree generation in `routeTree.gen.ts`

3. **Layout System**
   - `MainLayout` - Primary application layout with sidebar
   - `AuthGuard` - Authentication protection wrapper
   - `Breadcrumb` - Navigation breadcrumb component

### Route Structure

```
src/routes/
├── __root.tsx              # Root route with providers
├── index.tsx               # Home page (/)
├── dashboard.tsx           # Dashboard (/dashboard)
├── vaults.tsx              # Vaults listing (/vaults)
├── vaults_$vaultId.tsx     # Vault detail (/vaults/:id)
├── security.tsx            # Security settings (/security)
├── generator.tsx           # Password generator (/generator)
├── settings.tsx            # Application settings (/settings)
└── routeTree.gen.ts        # Generated route tree
```

## Authentication & Route Guards

### AuthGuard Component

```typescript
import { AuthGuard } from '@/components/layout/auth-guard'

// Protect a route
export const Route = createFileRoute('/protected')({
  component: () => (
    <AuthGuard redirectTo="/">
      <ProtectedComponent />
    </AuthGuard>
  ),
})
```

### Root Route Guard

The root route includes a basic authentication guard:

```typescript
const RouteGuard = () => {
  const { isConnected } = useAuthStore()
  
  if (!isConnected && window.location.pathname !== '/') {
    redirect({ to: '/' })
  }
  
  return <Outlet />
}
```

## Layout System

### MainLayout

The main layout includes:
- Responsive sidebar navigation
- Top header with user menu
- Breadcrumb navigation
- Mobile menu support

```typescript
import { LayoutRoute } from './__root'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <LayoutRoute>
      <Dashboard />
    </LayoutRoute>
  ),
})
```

### Breadcrumb Navigation

Automatic breadcrumb generation:

```typescript
import { Breadcrumb } from '@/components/layout/breadcrumb'

// Auto-generated from route
<Breadcrumb />

// Custom breadcrumbs
<Breadcrumb 
  items={[
    { label: 'Home', to: '/', icon: <Home /> },
    { label: 'Vaults', to: '/vaults' },
    { label: 'Details' }
  ]} 
/>
```

## Navigation

### Sidebar Navigation

The sidebar is configured in `router-config.ts`:

```typescript
const sidebarItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <LayoutDashboard />,
    order: 1,
  },
  // ... more items
]
```

### Programmatic Navigation

```typescript
import { useNavigate } from '@tanstack/react-router'

function MyComponent() {
  const navigate = useNavigate()
  
  const handleClick = () => {
    navigate({ to: '/vaults' })
  }
  
  return <button onClick={handleClick}>Go to Vaults</button>
}
```

## Route Parameters

### Dynamic Routes

```typescript
// Route definition: vaults_$vaultId.tsx
export const Route = createFileRoute('/vaults/$vaultId')({
  component: VaultDetail,
})

// Access parameters
const params = useParams({ from: '/vaults/$vaultId' })
const vaultId = params.vaultId
```

### Query Parameters

```typescript
// Navigate with query params
navigate({ 
  to: '/vaults', 
  search: { filter: 'recent', page: 1 } 
})

// Access search params
const search = useSearch({ from: '/vaults' })
const filter = search.filter
```

## Error Handling

### 404 Not Found

Custom 404 page:

```typescript
export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Page Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <Link to="/">Go to Home</Link>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Route Error Boundary

The root route includes error handling:

```typescript
errorComponent: ({ error }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  </div>
)
```

## Testing

### Route Testing

```typescript
import { renderWithRouter, navigationTestUtils } from '@/lib/router-test-utils'

describe('Dashboard Route', () => {
  it('renders correctly', () => {
    const { getByText } = renderWithRouter(<Dashboard />, {
      route: '/dashboard',
    })
    
    expect(getByText('Dashboard')).toBeInTheDocument()
  })
  
  it('requires authentication', async () => {
    navigationTestUtils.mockAuthState(false)
    
    await navigationTestUtils.testRouteProtection(
      '/dashboard', 
      true // should redirect
    )
  })
})
```

### Navigation Testing

```typescript
it('navigates between routes', async () => {
  const { router, user } = renderWithRouter(<App />)
  
  await user.click(screen.getByText('Vaults'))
  expect(router.state.location.pathname).toBe('/vaults')
})
```

## Performance Optimizations

### Route-based Code Splitting

```typescript
export const Route = createFileRoute('/heavy-route')({
  component: lazy(() => import('./HeavyComponent')),
  loader: () => import('./HeavyComponent').then(m => m.loadData()),
})
```

### Route Preloading

```typescript
// Preload route data
const router = createRouter({ routeTree })
router.preloadRoute('/dashboard')
```

## Configuration

### Router Configuration

All router configuration is centralized in `router-config.ts`:

```typescript
export const routerConfig = {
  routes: {
    public: [...],
    protected: [...],
    error: [...],
  },
  guards: {
    auth: { required: true, redirectTo: '/' },
  },
  layouts: {
    main: { component: MainLayout },
  },
  navigation: {
    sidebar: [...],
  },
}
```

### TypeScript Types

The router generates TypeScript types for route safety:

```typescript
// Generated types
interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/dashboard': typeof DashboardRoute
  '/vaults': typeof VaultsRoute
  '/vaults/$vaultId': typeof VaultDetailRoute
}
```

## Best Practices

1. **Route Organization**
   - Keep routes simple and focused
   - Use file-based routing for consistency
   - Group related routes in subdirectories

2. **Authentication**
   - Use `AuthGuard` for protected routes
   - Implement proper redirect logic
   - Handle loading states

3. **Performance**
   - Implement route-based code splitting
   - Use lazy loading for heavy components
   - Preload critical routes

4. **Testing**
   - Test route rendering and navigation
   - Test authentication guards
   - Test error handling

5. **Accessibility**
   - Use semantic HTML for navigation
   - Implement proper focus management
   - Provide keyboard navigation support

## Migration from React Router

If migrating from React Router, here are the key differences:

```typescript
// React Router v6
import { Routes, Route, useNavigate } from 'react-router-dom'

// TanStack Router
import { RouterProvider, createFileRoute, useNavigate } from '@tanstack/react-router'

// Component declaration
// React Router
<Route path="/dashboard" element={<Dashboard />} />

// TanStack Router
export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})
```

## Troubleshooting

### Common Issues

1. **Route not found**
   - Check file naming conventions
   - Verify route tree generation
   - Ensure proper file structure

2. **Authentication issues**
   - Verify AuthGuard implementation
   - Check auth store state
   - Ensure proper redirect logic

3. **Layout issues**
   - Verify LayoutRoute usage
   - Check component hierarchy
   - Ensure proper styling

### Debug Mode

Enable router devtools in development:

```typescript
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

// In root route
{process.env.NODE_ENV === 'development' && (
  <TanStackRouterDevtools position="bottom-right" />
)}
```

## Future Enhancements

1. **Route-level permissions**
2. **Advanced route preloading**
3. **Route analytics**
4. **Internationalization support**
5. **Advanced error tracking**
6. **Route-level caching strategies**

---

This guide provides a comprehensive overview of the SuiPass router system. For more detailed information, refer to the [TanStack Router documentation](https://tanstack.com/router/latest).