import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VaultDetail } from '@/pages/VaultDetail';
import { useAuthStore, useVaultStore, useUIStore } from '@/stores';

// Mock the stores
vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
  useVaultStore: vi.fn(),
  useUIStore: vi.fn(),
}));

// Mock the components
vi.mock('@/components/vault/password-form', () => ({
  PasswordForm: ({ open, onOpenChange, onSave, item }: any) => (
    <div data-testid="password-form">
      <button onClick={() => onSave({ title: 'Test Item', username: 'test', password: 'password123', category: 'Login' })}>
        {item ? 'Update' : 'Add'} Item
      </button>
      <button onClick={() => onOpenChange(false)}>Cancel</button>
    </div>
  ),
}));

vi.mock('@/components/vault/password-item', () => ({
  PasswordItem: ({ item, onEdit, onDelete }: any) => (
    <div data-testid="password-item">
      <span>{item.title}</span>
      <button onClick={() => onEdit(item)}>Edit</button>
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  ),
}));

// Mock tanstack router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ vaultId: 'vault1' }),
}));

describe('VaultDetail Page', () => {
  const mockAddToast = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useToast
    vi.mock('@/components/ui/toast', () => ({
      useToast: () => ({ addToast: mockAddToast }),
    }));

    // Mock tanstack router
    vi.mock('@tanstack/react-router', () => ({
      useNavigate: () => mockNavigate,
      useParams: () => ({ vaultId: 'vault1' }),
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
          name: 'Test Vault',
          description: 'Test vault description',
          items: [
            {
              id: 'item1',
              title: 'Google Account',
              username: 'test@gmail.com',
              password: 'password123',
              category: 'Login',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
          ownerId: '0x1234567890abcdef',
          isEncrypted: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      currentVault: {
        id: 'vault1',
        name: 'Test Vault',
        description: 'Test vault description',
        items: [
          {
            id: 'item1',
            title: 'Google Account',
            username: 'test@gmail.com',
            password: 'password123',
            category: 'Login',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        ownerId: '0x1234567890abcdef',
        isEncrypted: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      isVaultLocked: false,
      isLoading: false,
      loadVault: vi.fn(),
      lockVault: vi.fn(),
      unlockVault: vi.fn(),
      addItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      generatePassword: vi.fn(),
      deleteVault: vi.fn(),
    });

    (useUIStore as any).mockReturnValue({
      searchQuery: '',
      setSearchQuery: vi.fn(),
    });
  });

  it('renders vault detail page', () => {
    render(<VaultDetail />);
    
    expect(screen.getByText('Test Vault')).toBeInTheDocument();
    expect(screen.getByText('Test vault description')).toBeInTheDocument();
    expect(screen.getByText('Google Account')).toBeInTheDocument();
  });

  it('shows connect wallet prompt when not connected', () => {
    (useAuthStore as any).mockReturnValue({
      isConnected: false,
      walletAddress: null,
    });

    render(<VaultDetail />);
    
    expect(screen.getByText('Connect your wallet to access your vault')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('shows vault not found when vault does not exist', () => {
    (useVaultStore as any).mockReturnValue({
      ...useVaultStore(),
      vaults: [],
      currentVault: null,
    });

    render(<VaultDetail />);
    
    expect(screen.getByText('Vault Not Found')).toBeInTheDocument();
    expect(screen.getByText('The requested vault could not be found')).toBeInTheDocument();
  });

  it('shows locked vault message when vault is locked', () => {
    (useVaultStore as any).mockReturnValue({
      ...useVaultStore(),
      isVaultLocked: true,
    });

    render(<VaultDetail />);
    
    expect(screen.getByText('Vault Locked')).toBeInTheDocument();
    expect(screen.getByText('Unlock the vault to view and manage your password items')).toBeInTheDocument();
  });

  it('opens password form dialog', () => {
    render(<VaultDetail />);
    
    fireEvent.click(screen.getByText('Add Item'));
    expect(screen.getByTestId('password-form')).toBeInTheDocument();
  });

  it('adds new password item successfully', async () => {
    const mockAddItem = vi.fn();
    (useVaultStore as any).mockReturnValue({
      ...useVaultStore(),
      addItem: mockAddItem,
    });

    render(<VaultDetail />);
    
    // Open password form
    fireEvent.click(screen.getByText('Add Item'));
    
    // Submit form
    fireEvent.click(screen.getByText('Add Item'));
    
    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith({
        title: 'Test Item',
        username: 'test',
        password: 'password123',
        category: 'Login',
      });
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Item Added',
        description: 'Password item added successfully',
      });
    });
  });

  it('deletes password item successfully', async () => {
    const mockDeleteItem = vi.fn();
    (useVaultStore as any).mockReturnValue({
      ...useVaultStore(),
      deleteItem: mockDeleteItem,
    });

    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    render(<VaultDetail />);
    
    // Click delete button on password item
    fireEvent.click(screen.getByText('Delete'));
    
    await waitFor(() => {
      expect(mockDeleteItem).toHaveBeenCalledWith('item1');
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Item Deleted',
        description: 'Password item deleted successfully',
      });
    });
  });

  it('locks vault successfully', () => {
    const mockLockVault = vi.fn();
    (useVaultStore as any).mockReturnValue({
      ...useVaultStore(),
      lockVault: mockLockVault,
    });

    render(<VaultDetail />);
    
    fireEvent.click(screen.getByText('Lock Vault'));
    
    expect(mockLockVault).toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'info',
      title: 'Vault Locked',
      description: 'Vault "Test Vault" has been locked',
    });
  });

  it('shows vault statistics', () => {
    render(<VaultDetail />);
    
    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Weak Passwords')).toBeInTheDocument();
    expect(screen.getByText('Recent Updates')).toBeInTheDocument();
  });

  it('shows vault information', () => {
    render(<VaultDetail />);
    
    expect(screen.getByText('Vault Information')).toBeInTheDocument();
    expect(screen.getByText('AES-256-GCM')).toBeInTheDocument();
  });
});