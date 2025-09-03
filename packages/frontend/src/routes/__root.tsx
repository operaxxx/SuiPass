import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const LayoutRoute = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <TanStackRouterDevtools position="bottom-right" />
  </>
)

export const Route = createRootRoute({
  component: () => (
    <LayoutRoute>
      <Outlet />
    </LayoutRoute>
  ),
})