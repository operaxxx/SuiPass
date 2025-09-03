import { createFileRoute } from '@tanstack/react-router'
import { DashboardDemo } from '@/pages/DashboardDemo'

export const Route = createFileRoute('/demo')({
  component: DashboardDemo,
})