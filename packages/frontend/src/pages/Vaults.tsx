import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  Shield, 
  Plus, 
  Search, 
  Lock, 
  Unlock, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical,
  FolderOpen,
  Calendar,
  Users,
  Database,
  Settings,
  Copy,
  CheckCircle,
  AlertTriangle
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
import { Vault } from '@/types';
import { cn, formatDate, truncateAddress, copyToClipboard } from '@/lib/utils';
import { VaultForm } from '@/components/vault/vault-form';
import { VaultListItem } from '@/components/vault/vault-list-item';

interface VaultStatsProps {
  vaults: Vault[];
}

function VaultStats({ vaults }: VaultStatsProps) {
  const totalVaults = vaults.length;
  const totalItems = vaults.reduce((sum, vault) => sum + vault.items.length, 0);
  const activeVaults = vaults.filter(vault => !vault.isEncrypted).length;
  const recentVaults = vaults.filter(vault => Date.now() - vault.updatedAt < 7 * 24 * 60 * 60 * 1000).length;

  const stats = [
    {
      title: 'Total Vaults',
      value: totalVaults,
      description: 'All vaults',
      icon: <Shield className="h-4 w-4 text-muted-foreground" />,
      color: 'text-blue-600'
    },
    {
      title: 'Total Items',
      value: totalItems,
      description: 'Password items',
      icon: <Database className="h-4 w-4 text-muted-foreground" />,
      color: 'text-green-600'
    },
    {
      title: 'Active',
      value: activeVaults,
      description: 'Unlocked vaults',
      icon: <Unlock className="h-4 w-4 text-muted-foreground" />,
      color: 'text-emerald-600'
    },
    {
      title: 'Recent',
      value: recentVaults,
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

export function Vaults() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isConnected, walletAddress } = useAuthStore();
  const { 
    vaults, 
    currentVault, 
    isVaultLocked, 
    isLoading, 
    createVault, 
    loadVault, 
    lockVault,
    deleteVault,
    clearError 
  } = useVaultStore();
  const { searchQuery, setSearchQuery } = useUIStore();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [vaultToDelete, setVaultToDelete] = useState<Vault | null>(null);
  const [filteredVaults, setFilteredVaults] = useState<Vault[]>([]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = vaults.filter(vault =>
        vault.name.toLowerCase().includes(query) ||
        (vault.description && vault.description.toLowerCase().includes(query))
      );
      setFilteredVaults(filtered);
    } else {
      setFilteredVaults(vaults);
    }
  }, [vaults, searchQuery]);

  const handleCreateVault = async (data: { name: string; description?: string }) => {
    try {
      await createVault(data.name, data.description);
      setShowCreateDialog(false);
      addToast({
        type: 'success',
        title: 'Vault Created',
        description: `Vault "${data.name}" created successfully`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create vault',
      });
    }
  };

  const handleViewVault = (vault: Vault) => {
    navigate({ to: '/vaults/$vaultId', params: { vaultId: vault.id } });
  };

  const handleLoadVault = async (vault: Vault) => {
    try {
      await loadVault(vault.id);
      addToast({
        type: 'success',
        title: 'Vault Loaded',
        description: `Vault "${vault.name}" loaded successfully`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Load Failed',
        description: error instanceof Error ? error.message : 'Failed to load vault',
      });
    }
  };

  const handleLockVault = (vault: Vault) => {
    if (currentVault?.id === vault.id) {
      lockVault();
      addToast({
        type: 'info',
        title: 'Vault Locked',
        description: `Vault "${vault.name}" has been locked`,
      });
    }
  };

  const handleDeleteVault = async () => {
    if (!vaultToDelete) return;

    try {
      await deleteVault(vaultToDelete.id);
      setShowDeleteDialog(false);
      setVaultToDelete(null);
      addToast({
        type: 'success',
        title: 'Vault Deleted',
        description: `Vault "${vaultToDelete.name}" deleted successfully`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete vault',
      });
    }
  };

  const confirmDeleteVault = (vault: Vault) => {
    setVaultToDelete(vault);
    setShowDeleteDialog(true);
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await copyToClipboard(address);
      addToast({
        type: 'success',
        title: 'Copied to Clipboard',
        description: 'Wallet address copied successfully',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Copy Failed',
        description: 'Failed to copy address',
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              SuiPass
            </CardTitle>
            <CardDescription>Connect your wallet to access your vaults</CardDescription>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vault Management</h1>
                <p className="text-sm text-gray-500">
                  {walletAddress && (
                    <span className="flex items-center gap-2">
                      Connected: {truncateAddress(walletAddress)}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyAddress(walletAddress)}
                        className="h-6 w-6"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vaults..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Vault
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <VaultStats vaults={vaults} />

        {/* Current Vault Info */}
        {currentVault && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Current Vault
                <Badge variant={isVaultLocked ? "destructive" : "default"}>
                  {isVaultLocked ? "Locked" : "Unlocked"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Currently selected vault with {currentVault.items.length} items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{currentVault.name}</h3>
                  {currentVault.description && (
                    <p className="text-sm text-muted-foreground">{currentVault.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewVault(currentVault)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {isVaultLocked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadVault(currentVault)}
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLockVault(currentVault)}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Lock
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vaults List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Vaults</h2>
            <span className="text-sm text-muted-foreground">
              {filteredVaults.length} of {vaults.length} vaults
            </span>
          </div>

          {filteredVaults.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vaults found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery ? 'No vaults match your search.' : 'Create your first vault to get started.'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Vault
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVaults.map((vault) => (
                <VaultListItem
                  key={vault.id}
                  vault={vault}
                  isCurrent={currentVault?.id === vault.id}
                  isLocked={currentVault?.id === vault.id ? isVaultLocked : true}
                  onView={() => handleViewVault(vault)}
                  onLoad={() => handleLoadVault(vault)}
                  onLock={() => handleLockVault(vault)}
                  onDelete={() => confirmDeleteVault(vault)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Vault Dialog */}
      <VaultForm
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateVault}
      />

      {/* Delete Vault Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vault</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{vaultToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVault}>
              Delete Vault
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}