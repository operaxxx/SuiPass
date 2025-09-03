/**
 * Router Testing Utilities
 * 
 * This file provides utilities for testing routes and navigation in the SuiPass application.
 */

import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'

// Mock providers for testing
const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

// Test wrapper with all providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider>
        {children}
      </MockAuthProvider>
    </QueryClientProvider>
  )
}

// Custom render function with router
export const renderWithRouter = (
  ui: React.ReactElement,
  {
    route = '/',
    path = '/',
    ...renderOptions
  }: RenderOptions & { route?: string; path?: string } = {}
) => {
  // Create memory router for testing
  const router = createMemoryRouter({
    routeTree,
    history: {
      location: route,
    },
  })

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <TestWrapper>
        <RouterProvider router={router}>
          {children}
        </RouterProvider>
      </TestWrapper>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    router,
  }
}

// Navigation test utilities
export const navigationTestUtils = {
  /**
   * Test navigation to a specific route
   */
  navigateTo: async (route: string) => {
    window.location.pathname = route
    // Trigger re-render
    window.dispatchEvent(new Event('popstate'))
  },

  /**
   * Mock authentication state
   */
  mockAuthState: (isAuthenticated: boolean) => {
    vi.mocked(useAuthStore).mockReturnValue({
      isConnected: isAuthenticated,
      isConnecting: false,
      address: isAuthenticated ? '0x1234567890123456789012345678901234567890' : null,
      balance: 10.5,
      network: 'testnet',
      // ... other required auth store properties
    } as any)
  },

  /**
   * Test route protection
   */
  testRouteProtection: async (route: string, shouldRedirect: boolean) => {
    const { router } = renderWithRouter(<div />, { route })
    
    if (shouldRedirect) {
      await expect(router.state.location.pathname).not.toBe(route)
    } else {
      await expect(router.state.location.pathname).toBe(route)
    }
  },
}

// Route test helpers
export const routeTestHelpers = {
  /**
   * Test if a route renders correctly
   */
  testRouteRender: async (route: string, expectedText: string) => {
    const { findByText } = renderWithRouter(<div />, { route })
    await expect(findByText(expectedText)).resolves.toBeInTheDocument()
  },

  /**
   * Test route navigation
   */
  testRouteNavigation: async (fromRoute: string, toRoute: string, expectedAction: () => void) => {
    const { router } = renderWithRouter(<div />, { route: fromRoute })
    
    await router.navigate({ to: toRoute })
    expectedAction()
  },

  /**
   * Test route loading states
   */
  testRouteLoading: async (route: string, loadingComponent: React.ComponentType) => {
    const { findByText } = renderWithRouter(React.createElement(loadingComponent), { route })
    await expect(findByText(/loading/i)).resolves.toBeInTheDocument()
  },
}

// Mock route data
export const mockRouteData = {
  dashboard: {
    title: 'Dashboard',
    description: 'Your password management dashboard',
  },
  vaults: {
    title: 'Vaults',
    description: 'Manage your password vaults',
  },
  security: {
    title: 'Security',
    description: 'Security settings and preferences',
  },
  settings: {
    title: 'Settings',
    description: 'Application settings and preferences',
  },
}

// Route validation utilities
export const routeValidationUtils = {
  /**
   * Validate route structure
   */
  validateRouteStructure: (route: string) => {
    expect(route).toMatch(/^\/[a-zA-Z0-9\-_\/]*$/)
  },

  /**
   * Validate route parameters
   */
  validateRouteParams: (route: string, params: Record<string, string>) => {
    const paramNames = route.match(/:\w+/g) || []
    paramNames.forEach(param => {
      const paramName = param.slice(1)
      expect(params).toHaveProperty(paramName)
    })
  },

  /**
   * Validate route meta information
   */
  validateRouteMeta: (meta: any) => {
    expect(meta).toHaveProperty('title')
    expect(meta).toHaveProperty('description')
  },
}

export {
  TestWrapper,
  createTestQueryClient,
}