import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Unlock, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Copy,
  Calendar,
  Users,
  Database,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Eye,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { useAuthStore, useVaultStore, useUIStore } from '@/stores';
import { Vault, VaultItem } from '@/types';
import { cn, formatDate, truncateAddress, copyToClipboard } from '@/lib/utils';
import { PasswordForm } from '@/components/vault/password-form';
import { PasswordItem } from '@/components/vault/password-item';

interface VaultHeaderProps {
  vault: Vault;
  isLocked: boolean;
  onLock: () => void;
  onUnlock: (password: string) => Promise<boolean>;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
}

function VaultHeader({ vault, isLocked, onLock, onUnlock, onEdit, onDelete, onExport }: VaultHeaderProps) {
  const [unlockPassword, setUnlockPassword] = useState('');
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isLoading } = useVaultStore();

  const handleUnlock = async () => {
    const success = await onUnlock(unlockPassword);
    if (success) {
      setShowUnlockDialog(false);
      setUnlockPassword('');
    }
  };

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{vault.name}</h1>
              {vault.description && (
                <p className="text-sm text-gray-500">{vault.description}</p>
              )}
            </div>
            <Badge variant={isLocked ? "destructive" : "default"}>
              {isLocked ? "Locked" : "Unlocked"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {isLocked ? (
              <Button onClick={() => setShowUnlockDialog(true)}>
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Vault
              </Button>
            ) : (
              <Button variant="outline" onClick={onLock}>
                <Lock className="h-4 w-4 mr-2" />
                Lock Vault
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Vault
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Vault
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Vault
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Unlock Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Vault</DialogTitle>
            <DialogDescription>
              Enter your master password to unlock "{vault.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Master Password"
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnlockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUnlock} disabled={!unlockPassword.trim() || isLoading}>
              {isLoading ? 'Unlocking...' : 'Unlock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vault</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{vault.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete Vault
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface VaultStatsProps {
  vault: Vault;
}

function VaultStats({ vault }: VaultStatsProps) {
  const totalItems = vault.items.length;
  const categories = [...new Set(vault.items.map(item => item.category))];
  const weakPasswords = vault.items.filter(item => {
    // Simple password strength check
    return item.password.length < 8;
  }).length;
  const recentItems = vault.items.filter(item => 
    Date.now() - item.updatedAt < 7 * 24 * 60 * 60 * 1000
  ).length;

  const stats = [
    {
      title: 'Total Items',
      value: totalItems,
      description: 'Password items',
      icon: <Database className="h-4 w-4 text-muted-foreground" />,
      color: 'text-blue-600'
    },
    {
      title: 'Categories',
      value: categories.length,
      description: 'Organized categories',
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      color: 'text-green-600'
    },
    {
      title: 'Weak Passwords',
      value: weakPasswords,
      description: 'Need attention',
      icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
      color: 'text-orange-600'
    },
    {
      title: 'Recent Updates',
      value: recentItems,
      description: 'Last 7 days',
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface VaultInfoProps {
  vault: Vault;
}

function VaultInfo({ vault }: VaultInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Vault Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Vault ID</span>
          <span className="text-sm font-mono">{truncateAddress(vault.id)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Owner</span>
          <span className="text-sm font-mono">{truncateAddress(vault.ownerId)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Created</span>
          <span className="text-sm">{formatDate(vault.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Last Updated</span>
          <span className="text-sm">{formatDate(vault.updatedAt)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Encryption</span>
          <span className="text-sm text-green-600 font-medium flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            AES-256-GCM
          </span>
        </div>
        {vault.storageBlobId && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Storage</span>
            <span className="text-sm font-mono">{truncateAddress(vault.storageBlobId)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function VaultDetail() {
  const navigate = useNavigate();
  const params = useParams({ from: '/vaults/$vaultId' });
  const { addToast } = useToast();
  const { isConnected } = useAuthStore();
  const { 
    vaults, 
    currentVault, 
    isVaultLocked, 
    isLoading, 
    loadVault, 
    lockVault,
    unlockVault,
    addItem,
    updateItem,
    deleteItem,
    generatePassword,
    deleteVault
  } = useVaultStore();
  const { searchQuery, setSearchQuery } = useUIStore();
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filteredItems, setFilteredItems] = useState<VaultItem[]>([]);

  const vaultId = params.vaultId;
  const vault = vaults.find(v => v.id === vaultId) || currentVault;

  useEffect(() => {
    if (vaultId && (!currentVault || currentVault.id !== vaultId)) {
      loadVault(vaultId);
    }
  }, [vaultId, currentVault, loadVault]);

  useEffect(() => {
    if (currentVault && !isVaultLocked) {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const filtered = currentVault.items.filter(item =>
          item.title.toLowerCase().includes(query) ||
          item.username.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.url && item.url.toLowerCase().includes(query)) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
        );
        setFilteredItems(filtered);
      } else {
        setFilteredItems(currentVault.items);
      }
    } else {
      setFilteredItems([]);
    }
  }, [currentVault, isVaultLocked, searchQuery]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              SuiPass
            </CardTitle>
            <CardDescription>Connect your wallet to access your vault</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => useAuthStore.getState().connect()}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Vault Not Found
            </CardTitle>
            <CardDescription>The requested vault could not be found</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate({ to: '/vaults' })}>
              Back to Vaults
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddItem = async (itemData: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addItem(itemData);
      setShowPasswordForm(false);
      addToast({
        type: 'success',
        title: 'Item Added',
        description: 'Password item added successfully',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Add Failed',
        description: error instanceof Error ? error.message : 'Failed to add item',
      });
    }
  };

  const handleEditItem = async (itemId: string, updates: Partial<VaultItem>) => {
    try {
      await updateItem(itemId, updates);
      setEditingItem(null);
      addToast({
        type: 'success',
        title: 'Item Updated',
        description: 'Password item updated successfully',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update item',
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(itemId);
        addToast({
          type: 'success',
          title: 'Item Deleted',
          description: 'Password item deleted successfully',
        });
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Delete Failed',
          description: error instanceof Error ? error.message : 'Failed to delete item',
        });
      }
    }
  };

  const handleDeleteVault = async () => {
    try {
      await deleteVault(vault.id);
      navigate({ to: '/vaults' });
      addToast({
        type: 'success',
        title: 'Vault Deleted',
        description: 'Vault deleted successfully',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete vault',
      });
    }
  };

  const handleExportVault = () => {
    // Implementation for vault export
    addToast({
      type: 'info',
      title: 'Export Vault',
      description: 'Vault export functionality coming soon',
    });
  };

  const categories = [...new Set(vault.items.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <VaultHeader
        vault={vault}
        isLocked={isVaultLocked}
        onLock={lockVault}
        onUnlock={unlockVault}
        onEdit={() => console.log('Edit vault')}
        onDelete={handleDeleteVault}
        onExport={handleExportVault}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isVaultLocked ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lock className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Vault Locked</h3>
              <p className="text-gray-500 mb-4">
                Unlock the vault to view and manage your password items
              </p>
              <Button onClick={() => {}}>
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Vault
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <VaultStats vault={vault} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Search and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 pl-10"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                  <Button onClick={() => setShowPasswordForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Password Items</h2>
                    <span className="text-sm text-muted-foreground">
                      {filteredItems.length} of {vault.items.length} items
                    </span>
                  </div>

                  {filteredItems.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Database className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                        <p className="text-gray-500 mb-4">
                          {searchQuery ? 'No items match your search.' : 'Add your first password item to get started.'}
                        </p>
                        {!searchQuery && (
                          <Button onClick={() => setShowPasswordForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {filteredItems.map((item) => (
                        <PasswordItem
                          key={item.id}
                          item={item}
                          onEdit={(item) => setEditingItem(item)}
                          onDelete={handleDeleteItem}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <VaultInfo vault={vault} />
                
                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {categories.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No categories yet</p>
                    ) : (
                      categories.map((category) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm">{category}</span>
                          <span className="text-xs text-muted-foreground">
                            {vault.items.filter(item => item.category === category).length}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Password Form Dialog */}
      <PasswordForm
        open={showPasswordForm || !!editingItem}
        onOpenChange={(open) => {
          setShowPasswordForm(open);
          setEditingItem(null);
        }}
        item={editingItem}
        onSave={(itemData) => {
          if (editingItem) {
            handleEditItem(editingItem.id, itemData);
          } else {
            handleAddItem(itemData);
          }
        }}
        categories={categories}
      />
    </div>
  );
}