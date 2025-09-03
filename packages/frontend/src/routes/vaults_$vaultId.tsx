import { createFileRoute } from '@tanstack/react-router'
import { VaultDetail } from '@/pages/VaultDetail'
import { LayoutRoute } from './__root'

export const Route = createFileRoute('/vaults_$vaultId')({
  component: () => (
    <LayoutRoute>
      <VaultDetail />
    </LayoutRoute>
  ),
})