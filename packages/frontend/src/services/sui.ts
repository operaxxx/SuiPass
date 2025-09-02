import { 
  SuiClient, 
  getFullnodeUrl,
  Transaction,
  Ed25519Keypair
} from '@mysten/sui.js';
import { Vault } from '../types';

export class SuiService {
  private client: SuiClient;
  private keypair: Ed25519Keypair | null = null;
  private currentAddress: string | null = null;

  constructor() {
    const network = process.env.VITE_SUI_NETWORK || 'testnet';
    this.client = new SuiClient({
      url: getFullnodeUrl(network as 'mainnet' | 'testnet' | 'localnet'),
    });
  }

  async connectWallet(): Promise<void> {
    // Connect using wallet kit (Suiet or other wallet adapter)
    try {
      const { default: WalletKit } = await import('@suiet/wallet-kit');
      const walletKit = new WalletKit();
      
      await walletKit.connect();
      const accounts = await walletKit.getAccounts();
      
      if (accounts.length > 0) {
        this.currentAddress = accounts[0];
      }
    } catch (error) {
      // Fallback to local keypair for development
      this.keypair = Ed25519Keypair.generate();
      this.currentAddress = this.keypair.getPublicKey().toSuiAddress();
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      const { default: WalletKit } = await import('@suiet/wallet-kit');
      const walletKit = new WalletKit();
      await walletKit.disconnect();
    } catch (error) {
      // Ignore if wallet kit is not available
    }
    
    this.currentAddress = null;
    this.keypair = null;
  }

  async getCurrentAddress(): Promise<string> {
    if (!this.currentAddress) {
      throw new Error('No wallet connected');
    }
    return this.currentAddress;
  }

  async createVaultObject(vault: Vault): Promise<string> {
    if (!this.currentAddress) {
      throw new Error('No wallet connected');
    }

    try {
      const tx = new Transaction();
      
      // Create a new vault object
      const [vaultObj] = tx.moveCall({
        target: `${this.getPackageId()}::vault::create_vault`,
        arguments: [
          tx.pure.string(vault.name),
          tx.pure.string(vault.description || ''),
          tx.pure.bool(vault.isEncrypted),
        ],
      });

      tx.transferObjects([vaultObj], this.currentAddress);

      const result = await this.client.signAndExecuteTransaction({
        signer: this.keypair!,
        transaction: tx,
      });

      // Extract object ID from transaction effects
      const objectId = result.effects?.created?.[0]?.reference?.objectId;
      if (!objectId) {
        throw new Error('Failed to create vault object');
      }

      return objectId;
    } catch (error) {
      console.error('Error creating vault:', error);
      throw new Error('Failed to create vault on blockchain');
    }
  }

  async getVault(vaultId: string): Promise<Vault> {
    try {
      const object = await this.client.getObject({
        id: vaultId,
        options: { showContent: true },
      });

      if (!object.data?.content || typeof object.data.content !== 'object') {
        throw new Error('Vault not found');
      }

      const fields = (object.data.content as any).fields;
      
      return {
        id: vaultId,
        name: fields.name,
        description: fields.description,
        ownerId: fields.owner,
        storageBlobId: fields.storage_blob_id,
        isEncrypted: fields.is_encrypted,
        items: [], // Items are stored separately on Walrus
        createdAt: Number(fields.created_at),
        updatedAt: Number(fields.updated_at),
      };
    } catch (error) {
      console.error('Error loading vault:', error);
      throw new Error('Failed to load vault from blockchain');
    }
  }

  async updateVaultStorage(vaultId: string, blobId: string): Promise<void> {
    if (!this.currentAddress) {
      throw new Error('No wallet connected');
    }

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${this.getPackageId()}::vault::update_storage`,
        arguments: [
          tx.object(vaultId),
          tx.pure.string(blobId),
        ],
      });

      await this.client.signAndExecuteTransaction({
        signer: this.keypair!,
        transaction: tx,
      });
    } catch (error) {
      console.error('Error updating vault storage:', error);
      throw new Error('Failed to update vault storage reference');
    }
  }

  async shareVault(
    vaultId: string,
    recipientAddress: string,
    permissionLevel: 'view' | 'edit' | 'admin'
  ): Promise<void> {
    if (!this.currentAddress) {
      throw new Error('No wallet connected');
    }

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${this.getPackageId()}::access_control::share_vault`,
        arguments: [
          tx.object(vaultId),
          tx.pure.address(recipientAddress),
          tx.pure.u8(permissionLevel === 'view' ? 0 : permissionLevel === 'edit' ? 1 : 2),
        ],
      });

      await this.client.signAndExecuteTransaction({
        signer: this.keypair!,
        transaction: tx,
      });
    } catch (error) {
      console.error('Error sharing vault:', error);
      throw new Error('Failed to share vault');
    }
  }

  async revokeAccess(vaultId: string, recipientAddress: string): Promise<void> {
    if (!this.currentAddress) {
      throw new Error('No wallet connected');
    }

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${this.getPackageId()}::access_control::revoke_access`,
        arguments: [
          tx.object(vaultId),
          tx.pure.address(recipientAddress),
        ],
      });

      await this.client.signAndExecuteTransaction({
        signer: this.keypair!,
        transaction: tx,
      });
    } catch (error) {
      console.error('Error revoking access:', error);
      throw new Error('Failed to revoke vault access');
    }
  }

  async getUserVaults(ownerAddress: string): Promise<string[]> {
    try {
      const vaults = await this.client.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: `${this.getPackageId()}::vault::Vault`,
        },
        options: { showContent: false },
      });

      return vaults.data.map((obj) => obj.data?.objectId || '').filter(Boolean);
    } catch (error) {
      console.error('Error getting user vaults:', error);
      throw new Error('Failed to get user vaults');
    }
  }

  async getPackageId(): Promise<string> {
    // In production, this should be fetched from the blockchain
    // For development, return a placeholder
    return process.env.VITE_SUI_PACKAGE_ID || '0x1234567890abcdef';
  }

  // Utility methods
  async getBalance(address: string): Promise<number> {
    try {
      const balance = await this.client.getBalance({
        owner: address,
      });
      
      return Number(balance.totalBalance) / 1000000000; // Convert from MIST to SUI
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  async estimateTransactionCost(tx: Transaction): Promise<number> {
    try {
      const result = await this.client.dryRunTransaction({
        transaction: tx,
      });
      
      return (result.effects.gasUsed.computationCost + result.effects.gasUsed.storageCost) / 1000000000;
    } catch (error) {
      console.error('Error estimating cost:', error);
      return 0;
    }
  }
}

// Singleton instance
export const suiService = new SuiService();