import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Vault, VaultItem, UserPreferences } from '../types';
import { suiService } from '../services/sui';
import { walrusStorageService } from '../services/storage';
import { generateSecurePassword } from '../services/encryption';

interface AuthState {
  isConnected: boolean;
  walletAddress: string | null;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
}

interface VaultState {
  vaults: Vault[];
  currentVault: Vault | null;
  isVaultLocked: boolean;
  masterPassword: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createVault: (name: string, description?: string) => Promise<void>;
  loadVault: (vaultId: string) => Promise<void>;
  saveVault: () => Promise<void>;
  lockVault: () => void;
  unlockVault: (password: string) => Promise<boolean>;
  addItem: (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (itemId: string, updates: Partial<VaultItem>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  generatePassword: (length?: number) => string;
  clearError: () => void;
}

interface UIState {
  preferences: UserPreferences;
  sidebarOpen: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  
  // Actions
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
}

// Auth Store
export const useAuthStore = create<AuthState>((set) => ({
  isConnected: false,
  walletAddress: null,
  isLoading: false,
  error: null,
  
  connect: async () => {
    set({ isLoading: true, error: null });
    try {
      await suiService.connectWallet();
      const address = await suiService.getCurrentAddress();
      set({ isConnected: true, walletAddress: address, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to connect wallet', isLoading: false });
    }
  },
  
  disconnect: async () => {
    set({ isLoading: true });
    try {
      await suiService.disconnectWallet();
      set({ isConnected: false, walletAddress: null, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to disconnect', isLoading: false });
    }
  },
  
  clearError: () => set({ error: null }),
}));

// Vault Store
export const useVaultStore = create<VaultState>()(
  persist(
    (set, get) => ({
      vaults: [],
      currentVault: null,
      isVaultLocked: true,
      masterPassword: null,
      isLoading: false,
      error: null,
      
      createVault: async (name: string, description?: string) => {
        const { isConnected } = useAuthStore.getState();
        if (!isConnected) throw new Error('Wallet not connected');
        
        set({ isLoading: true, error: null });
        try {
          const address = useAuthStore.getState().walletAddress!;
          const newVault: Vault = {
            id: crypto.randomUUID(),
            name,
            description,
            items: [],
            ownerId: address,
            isEncrypted: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          // Store on blockchain
          const objectId = await suiService.createVaultObject(newVault);
          
          set((state) => ({
            vaults: [...state.vaults, { ...newVault, id: objectId }],
            currentVault: { ...newVault, id: objectId },
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create vault', isLoading: false });
        }
      },
      
      loadVault: async (vaultId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Load vault metadata from blockchain
          const vaultMetadata = await suiService.getVault(vaultId);
          
          // If vault has stored data on Walrus, load it
          if (vaultMetadata.storageBlobId) {
            // Note: Actual data loading requires master password
            set({ currentVault: vaultMetadata, isLoading: false });
          } else {
            set({ currentVault: vaultMetadata, isLoading: false });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load vault', isLoading: false });
        }
      },
      
      saveVault: async () => {
        const { currentVault, masterPassword } = get();
        if (!currentVault || !masterPassword) throw new Error('No vault loaded or not unlocked');
        
        set({ isLoading: true, error: null });
        try {
          // Encrypt and store on Walrus
          const blobId = await walrusStorageService.storeEncryptedData(
            currentVault.items,
            masterPassword
          );
          
          // Update blockchain reference
          await suiService.updateVaultStorage(currentVault.id, blobId);
          
          set((state) => ({
            currentVault: state.currentVault ? { ...state.currentVault, storageBlobId: blobId } : null,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to save vault', isLoading: false });
        }
      },
      
      lockVault: () => set({ isVaultLocked: true, masterPassword: null }),
      
      unlockVault: async (password: string) => {
        const { currentVault } = get();
        if (!currentVault) throw new Error('No vault loaded');
        
        try {
          if (currentVault.storageBlobId) {
            // Load and decrypt items from Walrus
            const items = await walrusStorageService.retrieveEncryptedData(
              currentVault.storageBlobId,
              password
            );
            
            set({
              currentVault: { ...currentVault, items },
              isVaultLocked: false,
              masterPassword: password,
              error: null,
            });
            
            return true;
          } else {
            // New vault with no data yet
            set({
              isVaultLocked: false,
              masterPassword: password,
              error: null,
            });
            
            return true;
          }
        } catch (error) {
          set({ error: 'Invalid password', isLoading: false });
          return false;
        }
      },
      
      addItem: async (itemData) => {
        const { currentVault } = get();
        if (!currentVault || get().isVaultLocked) throw new Error('Vault not unlocked');
        
        const newItem: VaultItem = {
          id: crypto.randomUUID(),
          ...itemData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          currentVault: state.currentVault
            ? { ...state.currentVault, items: [...state.currentVault.items, newItem] }
            : null,
        }));
      },
      
      updateItem: async (itemId: string, updates: Partial<VaultItem>) => {
        const { currentVault } = get();
        if (!currentVault || get().isVaultLocked) throw new Error('Vault not unlocked');
        
        set((state) => ({
          currentVault: state.currentVault
            ? {
                ...state.currentVault,
                items: state.currentVault.items.map((item) =>
                  item.id === itemId ? { ...item, ...updates, updatedAt: Date.now() } : item
                ),
              }
            : null,
        }));
      },
      
      deleteItem: async (itemId: string) => {
        const { currentVault } = get();
        if (!currentVault || get().isVaultLocked) throw new Error('Vault not unlocked');
        
        set((state) => ({
          currentVault: state.currentVault
            ? {
                ...state.currentVault,
                items: state.currentVault.items.filter((item) => item.id !== itemId),
              }
            : null,
        }));
      },
      
      generatePassword: (length = 16) => generateSecurePassword(length),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'vault-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        vaults: state.vaults,
        currentVault: state.currentVault ? { ...state.currentVault, items: [] } : null,
        isVaultLocked: true,
      }),
    }
  )
);

// UI Store
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      preferences: {
        theme: 'system',
        autoLockTimeout: 15,
        enableBiometrics: false,
        enableTwoFactor: false,
        defaultPasswordLength: 16,
        passwordGenerationOptions: {
          includeUppercase: true,
          includeLowercase: true,
          includeNumbers: true,
          includeSymbols: true,
        },
      },
      sidebarOpen: true,
      searchQuery: '',
      selectedCategory: null,
      
      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
      
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setSelectedCategory: (category) => set({ selectedCategory: category }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);