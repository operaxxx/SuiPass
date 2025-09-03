import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WalletAdapter } from '@suiet/wallet-kit';
import { suiService } from '../services/sui';

interface AuthState {
  // Wallet state
  wallet: WalletAdapter | null;
  isConnected: boolean;
  address: string | null;
  balance: number;
  
  // Network state
  network: string;
  networkStatus: 'online' | 'offline';
  
  // Loading states
  isConnecting: boolean;
  isDisconnecting: boolean;
  
  // Actions
  connectWallet: (wallet: WalletAdapter) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  updateBalance: () => Promise<void>;
  checkNetworkStatus: () => Promise<void>;
  setWallet: (wallet: WalletAdapter | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      wallet: null,
      isConnected: false,
      address: null,
      balance: 0,
      network: 'testnet',
      networkStatus: 'offline',
      isConnecting: false,
      isDisconnecting: false,

      // Actions
      connectWallet: async (wallet: WalletAdapter) => {
        try {
          set({ isConnecting: true });
          
          await suiService.connectWallet(wallet);
          const address = await suiService.getCurrentAddress();
          
          set({
            wallet,
            isConnected: true,
            address,
            network: suiService.getNetwork(),
            isConnecting: false,
          });
          
          // Update balance after connection
          get().updateBalance();
          
          console.log('Wallet connected successfully:', address);
        } catch (error) {
          set({ isConnecting: false });
          console.error('Failed to connect wallet:', error);
          throw error;
        }
      },

      disconnectWallet: async () => {
        try {
          set({ isDisconnecting: true });
          
          await suiService.disconnectWallet();
          
          set({
            wallet: null,
            isConnected: false,
            address: null,
            balance: 0,
            isDisconnecting: false,
          });
          
          console.log('Wallet disconnected successfully');
        } catch (error) {
          set({ isDisconnecting: false });
          console.error('Failed to disconnect wallet:', error);
          throw error;
        }
      },

      updateBalance: async () => {
        const { address } = get();
        if (!address) return;
        
        try {
          const balance = await suiService.getBalance(address);
          set({ balance });
        } catch (error) {
          console.error('Failed to update balance:', error);
        }
      },

      checkNetworkStatus: async () => {
        try {
          const status = await suiService.getNetworkStatus();
          set({ 
            networkStatus: status.status,
            network: status.chainId || suiService.getNetwork()
          });
        } catch (error) {
          console.error('Failed to check network status:', error);
          set({ networkStatus: 'offline' });
        }
      },

      setWallet: (wallet: WalletAdapter | null) => {
        set({ wallet });
      },

      reset: () => {
        set({
          wallet: null,
          isConnected: false,
          address: null,
          balance: 0,
          network: 'testnet',
          networkStatus: 'offline',
          isConnecting: false,
          isDisconnecting: false,
        });
      },
    }),
    {
      name: 'suipass-auth-storage',
      partialize: (state) => ({
        isConnected: state.isConnected,
        address: state.address,
        network: state.network,
      }),
    }
  )
);