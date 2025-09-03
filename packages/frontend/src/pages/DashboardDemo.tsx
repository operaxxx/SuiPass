import React, { useState } from 'react';
import { Dashboard } from '@/pages/Dashboard';
import { useAuthStore, useVaultStore, useUIStore } from '@/stores';
import { Vault, VaultItem } from '@/types';

// Mock data for demonstration
const mockVault: Vault = {
  id: 'demo-vault-1',
  name: 'Demo Vault',
  description: 'Demo password vault for testing',
  items: [
    {
      id: 'demo-item-1',
      title: 'Google Account',
      username: 'demo@gmail.com',
      password: 'demo-password-123',
      category: 'Email',
      tags: ['important', 'work'],
      createdAt: Date.now() - 86400000, // 1 day ago
      updatedAt: Date.now() - 3600000, // 1 hour ago
    },
    {
      id: 'demo-item-2',
      title: 'GitHub',
      username: 'demo-user',
      password: 'github-password-456',
      category: 'Development',
      tags: ['coding', 'work'],
      createdAt: Date.now() - 172800000, // 2 days ago
      updatedAt: Date.now() - 7200000, // 2 hours ago
    },
    {
      id: 'demo-item-3',
      title: 'Bank Account',
      username: 'demo12345',
      password: 'bank-password-789',
      category: 'Finance',
      tags: ['important', 'personal'],
      createdAt: Date.now() - 259200000, // 3 days ago
      updatedAt: Date.now() - 10800000, // 3 hours ago
    },
  ],
  ownerId: '0x1234567890abcdef',
  isEncrypted: true,
  createdAt: Date.now() - 604800000, // 1 week ago
  updatedAt: Date.now() - 3600000, // 1 hour ago
};

export function DashboardDemo() {
  const [isConnected, setIsConnected] = useState(true);
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock store functions
  const mockAuthStore = {
    isConnected,
    walletAddress: '0x1234567890abcdef',
    connect: () => setIsConnected(true),
    disconnect: () => setIsConnected(false),
  };

  const mockVaultStore = {
    currentVault: isVaultLocked ? null : mockVault,
    vaults: [mockVault],
    isVaultLocked,
    masterPassword: 'demo-master-password',
    isLoading: false,
    unlockVault: async (password: string) => {
      if (password === 'demo-master-password') {
        setIsVaultLocked(false);
        return true;
      }
      return false;
    },
    addItem: async (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      console.log('Adding item:', item);
    },
    deleteItem: async (itemId: string) => {
      console.log('Deleting item:', itemId);
    },
    generatePassword: (length = 16) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
    validatePassword: (password: string) => {
      const score = password.length >= 12 ? 3 : password.length >= 8 ? 2 : 1;
      return {
        isValid: score >= 2,
        score,
        feedback: score < 2 ? ['Password is too weak'] : [],
      };
    },
  };

  const mockUIStore = {
    searchQuery,
    setSearchQuery,
  };

  // Override the stores for demo
  (useAuthStore as any).mockReturnValue(mockAuthStore);
  (useVaultStore as any).mockReturnValue(mockVaultStore);
  (useUIStore as any).mockReturnValue(mockUIStore);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Demo</h1>
          <p className="text-gray-600 mb-4">
            This is a demonstration of the SuiPass Dashboard functionality.
          </p>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setIsConnected(!isConnected)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
            </button>
            
            <button
              onClick={() => setIsVaultLocked(!isVaultLocked)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              disabled={!isConnected}
            >
              {isVaultLocked ? 'Unlock Vault' : 'Lock Vault'}
            </button>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-2">Demo State</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Wallet Connected:</span>
                <span className={`ml-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Vault Locked:</span>
                <span className={`ml-2 ${isVaultLocked ? 'text-red-600' : 'text-green-600'}`}>
                  {isVaultLocked ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Items Count:</span>
                <span className="ml-2">{mockVault.items.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Dashboard />
      </div>
    </div>
  );
}