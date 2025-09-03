/**
 * SuiPass Router Configuration
 * 
 * This file contains the complete router configuration for the SuiPass application,
 * including route definitions, guards, and navigation structure.
 */

import { createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'

// Router configuration
export const routerConfig = {
  // Base router configuration
  router: createRouter({ routeTree }),
  
  // Route definitions
  routes: {
    // Public routes (no authentication required)
    public: [
      {
        path: '/',
        component: () => import('../pages/Dashboard').then(m => m.Dashboard),
        title: 'Home - SuiPass',
      },
    ],
    
    // Protected routes (authentication required)
    protected: [
      {
        path: '/dashboard',
        component: () => import('../pages/Dashboard').then(m => m.Dashboard),
        title: 'Dashboard - SuiPass',
        layout: 'main',
      },
      {
        path: '/vaults',
        component: () => import('../pages/Vaults').then(m => m.Vaults),
        title: 'Vaults - SuiPass',
        layout: 'main',
      },
      {
        path: '/vaults/$vaultId',
        component: () => import('../pages/VaultDetail').then(m => m.VaultDetail),
        title: 'Vault Details - SuiPass',
        layout: 'main',
      },
      {
        path: '/security',
        component: () => import('../routes/security').then(m => m.SecurityPage),
        title: 'Security - SuiPass',
        layout: 'main',
      },
      {
        path: '/generator',
        component: () => import('../routes/generator').then(m => m.PasswordGenerator),
        title: 'Password Generator - SuiPass',
        layout: 'main',
      },
      {
        path: '/settings',
        component: () => import('../routes/settings').then(m => m.SettingsPage),
        title: 'Settings - SuiPass',
        layout: 'main',
      },
      {
        path: '/import-export',
        component: () => import('../pages/ImportExport').then(m => m.ImportExportPage),
        title: 'Import/Export - SuiPass',
        layout: 'main',
      },
      {
        path: '/sharing',
        component: () => import('../pages/Sharing').then(m => m.SharingPage),
        title: 'Sharing - SuiPass',
        layout: 'main',
      },
      {
        path: '/activity',
        component: () => import('../pages/Activity').then(m => m.ActivityPage),
        title: 'Activity - SuiPass',
        layout: 'main',
      },
      {
        path: '/analytics',
        component: () => import('../pages/Analytics').then(m => m.AnalyticsPage),
        title: 'Analytics - SuiPass',
        layout: 'main',
      },
    ],
    
    // Error routes
    error: [
      {
        path: '/404',
        component: () => import('../pages/not-found').then(m => m.NotFoundPage),
        title: 'Page Not Found - SuiPass',
      },
      {
        path: '/401',
        component: () => import('../pages/unauthorized').then(m => m.UnauthorizedPage),
        title: 'Unauthorized - SuiPass',
      },
    ],
  },
  
  // Route guards
  guards: {
    // Authentication guard
    auth: {
      required: true,
      redirectTo: '/',
      loader: async () => {
        const { useAuthStore } = await import('@/stores/auth')
        const { isConnected } = useAuthStore.getState()
        return { isAuthenticated: isConnected }
      },
    },
    
    // Admin guard (for future use)
    admin: {
      required: false,
      redirectTo: '/401',
      loader: async () => {
        const { useAuthStore } = await import('@/stores/auth')
        const { isAdmin } = useAuthStore.getState()
        return { isAdmin }
      },
    },
  },
  
  // Layouts
  layouts: {
    main: {
      component: () => import('../components/layout/main-layout').then(m => m.MainLayout),
      sidebar: true,
      header: true,
      breadcrumb: true,
    },
    auth: {
      component: () => import('../components/layout/auth-layout').then(m => m.AuthLayout),
      sidebar: false,
      header: false,
      breadcrumb: false,
    },
  },
  
  // Navigation configuration
  navigation: {
    sidebar: [
      {
        label: 'Dashboard',
        to: '/dashboard',
        icon: 'LayoutDashboard',
        order: 1,
      },
      {
        label: 'Vaults',
        to: '/vaults',
        icon: 'FolderOpen',
        order: 2,
      },
      {
        label: 'Security',
        to: '/security',
        icon: 'Shield',
        order: 3,
      },
      {
        label: 'Password Generator',
        to: '/generator',
        icon: 'Key',
        order: 4,
      },
      {
        label: 'Import/Export',
        to: '/import-export',
        icon: 'Database',
        order: 5,
      },
      {
        label: 'Sharing',
        to: '/sharing',
        icon: 'Users',
        order: 6,
      },
      {
        label: 'Activity',
        to: '/activity',
        icon: 'Activity',
        order: 7,
      },
      {
        label: 'Analytics',
        to: '/analytics',
        icon: 'BarChart3',
        order: 8,
      },
      {
        label: 'Settings',
        to: '/settings',
        icon: 'Settings',
        order: 9,
      },
    ],
    
    footer: [
      {
        label: 'Help',
        to: '/help',
        icon: 'HelpCircle',
      },
      {
        label: 'Privacy Policy',
        to: '/privacy',
        icon: 'Shield',
      },
      {
        label: 'Terms of Service',
        to: '/terms',
        icon: 'FileText',
      },
    ],
  },
  
  // Meta configuration
  meta: {
    defaultTitle: 'SuiPass - Decentralized Password Manager',
    defaultDescription: 'Secure password management built on Sui blockchain with military-grade encryption',
    defaultKeywords: ['password manager', 'sui blockchain', 'decentralized', 'security', 'encryption'],
    themeColor: '#3B82F6',
  },
}

// Route utilities
export const routeUtils = {
  /**
   * Get route title by path
   */
  getRouteTitle: (path: string): string => {
    const route = [...routerConfig.routes.public, ...routerConfig.routes.protected]
      .find(r => r.path === path)
    return route?.title || routerConfig.meta.defaultTitle
  },
  
  /**
   * Check if route requires authentication
   */
  isProtectedRoute: (path: string): boolean => {
    return routerConfig.routes.protected.some(r => r.path === path)
  },
  
  /**
   * Get sidebar navigation items
   */
  getSidebarItems: () => {
    return routerConfig.navigation.sidebar.sort((a, b) => a.order - b.order)
  },
  
  /**
   * Get breadcrumb items for current path
   */
  getBreadcrumbItems: (path: string) => {
    const segments = path.split('/').filter(Boolean)
    return segments.map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      to: index === segments.length - 1 ? undefined : '/' + segments.slice(0, index + 1).join('/'),
    }))
  },
}

export default routerConfig