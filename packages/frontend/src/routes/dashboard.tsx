import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/pages/Dashboard'
import { LayoutRoute } from './__root'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <LayoutRoute>
      <Dashboard />
    </LayoutRoute>
  ),
})