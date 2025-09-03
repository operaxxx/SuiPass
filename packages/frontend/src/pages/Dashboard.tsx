import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  Shield, 
  Lock, 
  Plus, 
  Search, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Copy,
  Edit,
  Trash2,
  Key,
  Database,
  Activity,
  Settings,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchInput, SearchFilters, SearchResults } from '@/components/ui/search';
import { useToast } from '@/components/ui/toast';
import { useAuthStore, useVaultStore, useUIStore } from '@/stores';
import { VaultItem } from '@/types';
import { DashboardStats, SecurityMetrics, QuickAction, RecentItem } from '@/types/dashboard';
import { cn, formatDate, truncateAddress, copyToClipboard } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

function StatCard({ title, value, description, icon, trend, trendValue }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && trendValue && (
          <div className={cn(
            "text-xs mt-2 flex items-center",
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SecurityStatusProps {
  isVaultLocked: boolean;
  hasMasterPassword: boolean;
  lastAccess?: number;
}

function SecurityStatus({ isVaultLocked, hasMasterPassword, lastAccess }: SecurityStatusProps) {
  const getStatusColor = () => {
    if (isVaultLocked) return 'text-yellow-600';
    if (!hasMasterPassword) return 'text-red-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (isVaultLocked) return <Lock className="h-4 w-4" />;
    if (!hasMasterPassword) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isVaultLocked) return 'Vault Locked';
    if (!hasMasterPassword) return 'No Master Password';
    return 'Secure';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Vault Status</span>
          <span className={cn("text-sm font-medium flex items-center gap-1", getStatusColor())}>
            {getStatusIcon()}
            {getStatusText()}
          </span>
        </div>
        {lastAccess && (
          <div className="flex items-center justify-between">
            <span className="text-sm">Last Access</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(lastAccess)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm">Encryption</span>
          <span className="text-sm text-green-600 font-medium flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            AES-256-GCM
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentItemsProps {
  items: VaultItem[];
  onView: (item: VaultItem) => void;
  onEdit: (item: VaultItem) => void;
  onDelete: (itemId: string) => void;
  addToast: (toast: any) => void;
}

function RecentItems({ items, onView, onEdit, onDelete, addToast }: RecentItemsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await copyToClipboard(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      addToast({
        type: 'success',
        title: 'Copied to Clipboard',
        description: `${field.charAt(0).toUpperCase() + field.slice(1)} copied successfully`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
      });
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Items
          </CardTitle>
          <CardDescription>No password items yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Start by adding your first password item
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Items
        </CardTitle>
        <CardDescription>Last 5 accessed items</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{item.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{item.username}</p>
              {item.category && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded mt-1 inline-block">
                  {item.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(item.password, `password-${item.id}`)}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
                {copiedField === `password-${item.id}` && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    Copied!
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(item)}
                className="h-8 w-8"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(item)}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface QuickActionsProps {
  onAddItem: () => void;
  onGeneratePassword: () => void;
  onImport: () => void;
  onExport: () => void;
  onSettings: () => void;
}

function QuickActions({ onAddItem, onGeneratePassword, onImport, onExport, onSettings }: QuickActionsProps) {
  const actions = [
    { icon: Plus, label: 'Add Item', onClick: onAddItem, color: 'bg-blue-500 hover:bg-blue-600' },
    { icon: Key, label: 'Generate Password', onClick: onGeneratePassword, color: 'bg-green-500 hover:bg-green-600' },
    { icon: Database, label: 'Import', onClick: onImport, color: 'bg-purple-500 hover:bg-purple-600' },
    { icon: Share2, label: 'Export', onClick: onExport, color: 'bg-orange-500 hover:bg-orange-600' },
    { icon: Settings, label: 'Settings', onClick: onSettings, color: 'bg-gray-500 hover:bg-gray-600' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={action.onClick}
            >
              <div className={cn("p-2 rounded-lg text-white", action.color)}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isConnected, walletAddress } = useAuthStore();
  const { 
    currentVault, 
    vaults, 
    isVaultLocked, 
    masterPassword, 
    isLoading, 
    unlockVault,
    addItem,
    deleteItem,
    generatePassword 
  } = useVaultStore();
  const { searchQuery, setSearchQuery } = useUIStore();
  
  const [recentItems, setRecentItems] = useState<VaultItem[]>([]);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [searchResults, setSearchResults] = useState<VaultItem[]>([]);

  useEffect(() => {
    if (currentVault && !isVaultLocked) {
      // Sort items by last updated and take recent ones
      const sorted = [...currentVault.items].sort((a, b) => b.updatedAt - a.updatedAt);
      setRecentItems(sorted);
    } else {
      setRecentItems([]);
    }
  }, [currentVault, isVaultLocked]);

  // Search functionality
  useEffect(() => {
    if (currentVault && !isVaultLocked && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const results = currentVault.items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.username.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.url && item.url.toLowerCase().includes(query)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, currentVault, isVaultLocked]);

  const handleUnlockVault = async () => {
    if (unlockPassword.trim()) {
      await unlockVault(unlockPassword);
      setUnlockPassword('');
    }
  };

  const handleAddItem = () => {
    // Navigate to add item page or open modal
    console.log('Add item clicked');
  };

  const handleGeneratePassword = () => {
    const password = generatePassword();
    navigator.clipboard.writeText(password);
    addToast({
      type: 'success',
      title: 'Password Generated',
      description: 'Password copied to clipboard',
    });
  };

  const handleViewItem = (item: VaultItem) => {
    // Navigate to item detail or open modal
    console.log('View item:', item.title);
  };

  const handleEditItem = (item: VaultItem) => {
    // Navigate to edit page or open modal
    console.log('Edit item:', item.title);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(itemId);
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
            <CardDescription>Connect your wallet to access your dashboard</CardDescription>
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

  if (isVaultLocked && currentVault) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="h-6 w-6" />
              Vault Locked
            </CardTitle>
            <CardDescription>Enter your master password to unlock</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Master Password"
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUnlockVault()}
            />
            <Button 
              className="w-full" 
              onClick={handleUnlockVault}
              disabled={!unlockPassword.trim() || isLoading}
            >
              {isLoading ? 'Unlocking...' : 'Unlock Vault'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalItems = currentVault?.items.length || 0;
  const totalVaults = vaults.length;
  const categories = [...new Set(currentVault?.items.map(item => item.category) || [])];
  const weakPasswords = currentVault?.items.filter(item => {
    const validation = useVaultStore.getState().validatePassword(item.password);
    return validation.score < 2;
  }).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">
                  {walletAddress && `Connected: ${truncateAddress(walletAddress)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <SearchInput
                placeholder="Search passwords..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-64"
              />
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Items"
            value={totalItems}
            description="Password items stored"
            icon={<Database className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Vaults"
            value={totalVaults}
            description="Active vaults"
            icon={<Shield className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Categories"
            value={categories.length}
            description="Organized categories"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Weak Passwords"
            value={weakPasswords}
            description="Need attention"
            icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
            trend={weakPasswords > 0 ? 'up' : 'stable'}
            trendValue={weakPasswords > 0 ? `${weakPasswords} need update` : 'All strong'}
          />
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8">
            <SearchResults
              query={searchQuery}
              items={searchResults}
              onItemSelect={handleViewItem}
            />
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <QuickActions
              onAddItem={handleAddItem}
              onGeneratePassword={handleGeneratePassword}
              onImport={() => console.log('Import clicked')}
              onExport={() => console.log('Export clicked')}
              onSettings={() => console.log('Settings clicked')}
            />
            
            <RecentItems
              items={recentItems}
              onView={handleViewItem}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              addToast={addToast}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <SecurityStatus
              isVaultLocked={isVaultLocked}
              hasMasterPassword={!!masterPassword}
              lastAccess={currentVault?.updatedAt}
            />
            
            {/* Vault Info */}
            {currentVault && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Current Vault
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium">{currentVault.name}</h4>
                    {currentVault.description && (
                      <p className="text-sm text-muted-foreground">{currentVault.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(currentVault.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{formatDate(currentVault.updatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span>{currentVault.items.length}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}