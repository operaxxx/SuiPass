import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Dashboard } from '@/pages/Dashboard';
import { useAuthStore, useVaultStore, useUIStore } from '@/stores';

// Mock the stores
vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
  useVaultStore: vi.fn(),
  useUIStore: vi.fn(),
}));

// Mock navigation
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Shield: vi.fn(() => 'Shield'),
  Lock: vi.fn(() => 'Lock'),
  Plus: vi.fn(() => 'Plus'),
  Search: vi.fn(() => 'Search'),
  Clock: vi.fn(() => 'Clock'),
  Users: vi.fn(() => 'Users'),
  AlertTriangle: vi.fn(() => 'AlertTriangle'),
  CheckCircle: vi.fn(() => 'CheckCircle'),
  Eye: vi.fn(() => 'Eye'),
  Copy: vi.fn(() => 'Copy'),
  Edit: vi.fn(() => 'Edit'),
  Trash2: vi.fn(() => 'Trash2'),
  Key: vi.fn(() => 'Key'),
  Database: vi.fn(() => 'Database'),
  Activity: vi.fn(() => 'Activity'),
  Settings: vi.fn(() => 'Settings'),
  Share2: vi.fn(() => 'Share2'),
}));

describe('Dashboard', () => {
  const mockAuthStore = {
    isConnected: true,
    walletAddress: '0x1234567890abcdef',
    connect: vi.fn(),
    disconnect: vi.fn(),
  };

  const mockVaultStore = {
    currentVault: {
      id: 'vault-1',
      name: 'My Vault',
      description: 'Personal password vault',
      items: [
        {
          id: 'item-1',
          title: 'Google',
          username: 'user@gmail.com',
          password: 'password123',
          category: 'Email',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      ownerId: '0x1234567890abcdef',
      isEncrypted: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    vaults: [
      {
        id: 'vault-1',
        name: 'My Vault',
        description: 'Personal password vault',
        items: [],
        ownerId: '0x1234567890abcdef',
        isEncrypted: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    isVaultLocked: false,
    masterPassword: 'master123',
    isLoading: false,
    unlockVault: vi.fn(),
    addItem: vi.fn(),
    deleteItem: vi.fn(),
    generatePassword: vi.fn(() => 'generated-password-123'),
    validatePassword: vi.fn(() => ({ isValid: true, score: 3, feedback: [] })),
  };

  const mockUIStore = {
    searchQuery: '',
    setSearchQuery: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    (useAuthStore as any).mockReturnValue(mockAuthStore);
    (useVaultStore as any).mockReturnValue(mockVaultStore);
    (useUIStore as any).mockReturnValue(mockUIStore);
  });

  it('should render dashboard with stats', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('Vaults')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Weak Passwords')).toBeInTheDocument();
  });

  it('should show connect wallet when not connected', () => {
    (useAuthStore as any).mockReturnValue({
      ...mockAuthStore,
      isConnected: false,
    });

    render(<Dashboard />);
    
    expect(screen.getByText('Connect your wallet to access your dashboard')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('should show vault locked screen when vault is locked', () => {
    (useVaultStore as any).mockReturnValue({
      ...mockVaultStore,
      isVaultLocked: true,
    });

    render(<Dashboard />);
    
    expect(screen.getByText('Vault Locked')).toBeInTheDocument();
    expect(screen.getByText('Enter your master password to unlock')).toBeInTheDocument();
  });

  it('should handle unlock vault', async () => {
    (useVaultStore as any).mockReturnValue({
      ...mockVaultStore,
      isVaultLocked: true,
    });

    render(<Dashboard />);
    
    const passwordInput = screen.getByPlaceholderText('Master Password');
    const unlockButton = screen.getByText('Unlock Vault');
    
    fireEvent.change(passwordInput, { target: { value: 'test-password' } });
    fireEvent.click(unlockButton);
    
    await waitFor(() => {
      expect(mockVaultStore.unlockVault).toHaveBeenCalledWith('test-password');
    });
  });

  it('should display recent items', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Recent Items')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('user@gmail.com')).toBeInTheDocument();
  });

  it('should handle search input', () => {
    render(<Dashboard />);
    
    const searchInput = screen.getByPlaceholderText('Search passwords...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    expect(mockUIStore.setSearchQuery).toHaveBeenCalledWith('test query');
  });

  it('should handle generate password action', () => {
    const mockWriteText = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(<Dashboard />);
    
    const generateButton = screen.getByText('Generate Password');
    fireEvent.click(generateButton);
    
    expect(mockVaultStore.generatePassword).toHaveBeenCalled();
    expect(mockWriteText).toHaveBeenCalledWith('generated-password-123');
  });

  it('should show security status', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Security Status')).toBeInTheDocument();
    expect(screen.getByText('Vault Status')).toBeInTheDocument();
    expect(screen.getByText('Encryption')).toBeInTheDocument();
    expect(screen.getByText('AES-256-GCM')).toBeInTheDocument();
  });

  it('should handle item deletion', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<Dashboard />);
    
    const deleteButton = screen.getAllByRole('button')[screen.getAllByRole('button').length - 1];
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this item?');
      expect(mockVaultStore.deleteItem).toHaveBeenCalledWith('item-1');
    });
    
    confirmSpy.mockRestore();
  });

  it('should display vault information', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Current Vault')).toBeInTheDocument();
    expect(screen.getByText('My Vault')).toBeInTheDocument();
    expect(screen.getByText('Personal password vault')).toBeInTheDocument();
  });

  it('should show empty state when no items', () => {
    (useVaultStore as any).mockReturnValue({
      ...mockVaultStore,
      currentVault: {
        ...mockVaultStore.currentVault,
        items: [],
      },
    });

    render(<Dashboard />);
    
    expect(screen.getByText('No password items yet')).toBeInTheDocument();
    expect(screen.getByText('Start by adding your first password item')).toBeInTheDocument();
  });
});