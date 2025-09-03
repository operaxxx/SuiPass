import { createFileRoute } from '@tanstack/react-router'
import { Vaults } from '@/pages/Vaults'
import { LayoutRoute } from './__root'

export const Route = createFileRoute('/vaults')({
  component: () => (
    <LayoutRoute>
      <Vaults />
    </LayoutRoute>
  ),
})