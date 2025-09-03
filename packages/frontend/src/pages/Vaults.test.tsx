import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Vaults } from '@/pages/Vaults';
import { useAuthStore, useVaultStore, useUIStore } from '@/stores';

// Mock the stores
vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
  useVaultStore: vi.fn(),
  useUIStore: vi.fn(),
}));

// Mock the components
vi.mock('@/components/vault/vault-form', () => ({
  VaultForm: ({ open, onOpenChange, onSubmit }: any) => (
    <div data-testid="vault-form">
      <button onClick={() => onSubmit({ name: 'Test Vault', description: 'Test Description' })}>
        Submit
      </button>
      <button onClick={() => onOpenChange(false)}>Cancel</button>
    </div>
  ),
}));

vi.mock('@/components/vault/vault-list-item', () => ({
  VaultListItem: ({ vault, onView, onLoad, onLock, onDelete }: any) => (
    <div data-testid="vault-list-item">
      <span>{vault.name}</span>
      <button onClick={onView}>View</button>
      <button onClick={onLoad}>Load</button>
      <button onClick={onLock}>Lock</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  ),
}));

describe('Vaults Page', () => {
  const mockAddToast = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useNavigate
    vi.mock('@tanstack/react-router', () => ({
      useNavigate: () => mockNavigate,
    }));

    // Mock useToast
    vi.mock('@/components/ui/toast', () => ({
      useToast: () => ({ addToast: mockAddToast }),
    }));

    // Default mock implementations
    (useAuthStore as any).mockReturnValue({
      isConnected: true,
      walletAddress: '0x1234567890abcdef',
    });

    (useVaultStore as any).mockReturnValue({
      vaults: [
        {
          id: 'vault1',
          name: 'Personal Vault',
          description: 'Personal passwords',
          items: [],
          ownerId: '0x1234567890abcdef',
          isEncrypted: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      currentVault: null,
      isVaultLocked: true,
      isLoading: false,
      createVault: vi.fn(),
      loadVault: vi.fn(),
      lockVault: vi.fn(),
      deleteVault: vi.fn(),
      clearError: vi.fn(),
    });

    (useUIStore as any).mockReturnValue({
      searchQuery: '',
      setSearchQuery: vi.fn(),
    });
  });

  it('renders vaults page when connected', () => {
    render(<Vaults />);
    
    expect(screen.getByText('Vault Management')).toBeInTheDocument();
    expect(screen.getByText('Personal Vault')).toBeInTheDocument();
    expect(screen.getByText('New Vault')).toBeInTheDocument();
  });

  it('shows connect wallet prompt when not connected', () => {
    (useAuthStore as any).mockReturnValue({
      isConnected: false,
      walletAddress: null,
    });

    render(<Vaults />);
    
    expect(screen.getByText('Connect your wallet to access your vaults')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('opens create vault dialog', () => {
    render(<Vaults />);
    
    fireEvent.click(screen.getByText('New Vault'));
    expect(screen.getByTestId('vault-form')).toBeInTheDocument();
  });

  it('creates new vault successfully', async () => {
    const mockCreateVault = vi.fn();
    (useVaultStore as any).mockReturnValue({
      ...useVaultStore(),
      createVault: mockCreateVault,
    });

    render(<Vaults />);
    
    // Open create dialog
    fireEvent.click(screen.getByText('New Vault'));
    
    // Submit form
    fireEvent.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(mockCreateVault).toHaveBeenCalledWith('Test Vault', 'Test Description');
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Vault Created',
        description: 'Vault "Test Vault" created successfully',
      });
    });
  });

  it('filters vaults based on search query', () => {
    (useVaultStore as any).mockReturnValue({
      ...useVaultStore(),
      vaults: [
        {
          id: 'vault1',
          name: 'Personal Vault',
          description: 'Personal passwords',
          items: [],
          ownerId: '0x1234567890abcdef',
          isEncrypted: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'vault2',
          name: 'Work Vault',
          description: 'Work passwords',
          items: [],
          ownerId: '0x1234567890abcdef',
          isEncrypted: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
    });

    render(<Vaults />);
    
    // Initially shows both vaults
    expect(screen.getByText('Personal Vault')).toBeInTheDocument();
    expect(screen.getByText('Work Vault')).toBeInTheDocument();
  });

  it('shows no vaults message when search has no results', () => {
    (useUIStore as any).mockReturnValue({
      searchQuery: 'nonexistent',
      setSearchQuery: vi.fn(),
    });

    render(<Vaults />);
    
    expect(screen.getByText('No vaults found')).toBeInTheDocument();
    expect(screen.getByText('No vaults match your search.')).toBeInTheDocument();
  });

  it('shows no vaults message when no vaults exist', () => {
    (useVaultStore as any).mockReturnValue({
      ...useVaultStore(),
      vaults: [],
    });

    render(<Vaults />);
    
    expect(screen.getByText('No vaults found')).toBeInTheDocument();
    expect(screen.getByText('Create your first vault to get started.')).toBeInTheDocument();
  });
});