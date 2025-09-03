import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { AuthGuard } from '../auth-guard'
import { useAuthStore } from '@/stores/auth'

// Mock the auth store
vi.mock('@/stores/auth')
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}))

describe('AuthGuard', () => {
  const mockNavigate = vi.fn()
  const mockUseAuthStore = useAuthStore as any

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockReturnValue({
      isConnected: false,
      isConnecting: false,
    })
    
    const { useNavigate } = require('@tanstack/react-router')
    useNavigate.mockReturnValue(mockNavigate)
  })

  it('renders authentication required when not connected', () => {
    render(<AuthGuard>Protected Content</AuthGuard>)
    
    expect(screen.getByText('Authentication Required')).toBeInTheDocument()
    expect(screen.getByText('Please connect your wallet to access this page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when connected', () => {
    mockUseAuthStore.mockReturnValue({
      isConnected: true,
      isConnecting: false,
    })

    render(<AuthGuard>Protected Content</AuthGuard>)
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByText('Authentication Required')).not.toBeInTheDocument()
  })

  it('navigates to redirect path when not connected', async () => {
    mockUseAuthStore.mockReturnValue({
      isConnected: false,
      isConnecting: false,
    })

    render(<AuthGuard redirectTo="/login">Protected Content</AuthGuard>)
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' })
    })
  })

  it('shows loading state when connecting', () => {
    mockUseAuthStore.mockReturnValue({
      isConnected: false,
      isConnecting: true,
    })

    render(<AuthGuard>Protected Content</AuthGuard>)
    
    expect(screen.getByText('Authentication Required')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})