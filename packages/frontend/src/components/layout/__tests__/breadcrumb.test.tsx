import { render, screen } from '@testing-library/react'
import { Breadcrumb } from '../breadcrumb'
import { useMatchRoute } from '@tanstack/react-router'

// Mock the router
vi.mock('@tanstack/react-router', () => ({
  useMatchRoute: vi.fn(),
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

describe('Breadcrumb', () => {
  const mockMatchRoute = useMatchRoute as any

  beforeEach(() => {
    vi.clearAllMocks()
    mockMatchRoute.mockReturnValue(() => false)
  })

  it('renders custom breadcrumb items', () => {
    const items = [
      { label: 'Home', to: '/', icon: '🏠' },
      { label: 'Vaults', to: '/vaults', icon: '📁' },
      { label: 'Details', icon: '📝' },
    ]

    render(<Breadcrumb items={items} />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Vaults')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
  })

  it('generates breadcrumbs from current path', () => {
    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { pathname: '/dashboard/security' },
    })

    render(<Breadcrumb />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
  })

  it('handles dynamic routes correctly', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { pathname: '/vaults/123' },
    })

    render(<Breadcrumb />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Vaults')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const items = [{ label: 'Test', to: '/test' }]
    
    render(<Breadcrumb items={items} className="custom-class" />)
    
    const breadcrumb = screen.getByRole('navigation')
    expect(breadcrumb).toHaveClass('custom-class')
  })

  it('renders links for non-last items', () => {
    const items = [
      { label: 'Home', to: '/' },
      { label: 'Current', to: '/current' },
    ]

    render(<Breadcrumb items={items} />)
    
    const homeLink = screen.getByText('Home')
    expect(homeLink.closest('a')).toHaveAttribute('href', '/')
    
    const currentLink = screen.getByText('Current')
    expect(currentLink.closest('a')).not.toHaveAttribute('href', '/current')
  })
})