import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Database,
  Calendar,
  Users,
  Copy
} from 'lucide-react';
import { Vault } from '@/types';
import { cn, formatDate, truncateAddress, copyToClipboard } from '@/lib/utils';

interface VaultListItemProps {
  vault: Vault;
  isCurrent: boolean;
  isLocked: boolean;
  onView: () => void;
  onLoad: () => void;
  onLock: () => void;
  onDelete: () => void;
}

export function VaultListItem({ 
  vault, 
  isCurrent, 
  isLocked, 
  onView, 
  onLoad, 
  onLock, 
  onDelete 
}: VaultListItemProps) {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = async () => {
    try {
      await copyToClipboard(vault.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      console.error('Failed to copy vault ID:', error);
    }
  };

  const getVaultStatusColor = () => {
    if (isCurrent) {
      return isLocked ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getVaultStatusText = () => {
    if (isCurrent) {
      return isLocked ? 'Current (Locked)' : 'Current (Unlocked)';
    }
    return 'Vault';
  };

  const getVaultStatusIcon = () => {
    if (isCurrent) {
      return isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />;
    }
    return <Shield className="h-3 w-3" />;
  };

  return (
    <Card className={cn(
      'relative transition-all duration-200 hover:shadow-md cursor-pointer group',
      isCurrent && 'ring-2 ring-primary'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className={cn(
                "h-5 w-5",
                isCurrent ? 'text-primary' : 'text-gray-400'
              )} />
              <CardTitle className="text-lg truncate">{vault.name}</CardTitle>
            </div>
            {vault.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {vault.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getVaultStatusColor()}>
              {getVaultStatusIcon()}
              <span className="ml-1">{getVaultStatusText()}</span>
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {isCurrent ? (
                  <>
                    {isLocked ? (
                      <DropdownMenuItem onClick={onLoad}>
                        <Unlock className="h-4 w-4 mr-2" />
                        Unlock Vault
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={onLock}>
                        <Lock className="h-4 w-4 mr-2" />
                        Lock Vault
                      </DropdownMenuItem>
                    )}
                  </>
                ) : (
                  <DropdownMenuItem onClick={onLoad}>
                    <Shield className="h-4 w-4 mr-2" />
                    Load Vault
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyId}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Edit vault')} className="text-destructive">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Vault
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Vault
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-semibold">{vault.items.length}</span>
            <span className="text-xs text-muted-foreground">Items</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatDate(vault.createdAt, { short: true })}
            </span>
            <span className="text-xs text-muted-foreground">Created</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">
              {truncateAddress(vault.ownerId)}
            </span>
            <span className="text-xs text-muted-foreground">Owner</span>
          </div>
        </div>

        {/* Categories Preview */}
        {vault.items.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Categories</span>
              <span className="text-xs text-muted-foreground">
                {[...new Set(vault.items.map(item => item.category))].length} types
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {[...new Set(vault.items.map(item => item.category))].slice(0, 3).map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
              {[...new Set(vault.items.map(item => item.category))].length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{[...new Set(vault.items.map(item => item.category))].length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Last updated {formatDate(vault.updatedAt, { relative: true })}
          </span>
          {copiedId && (
            <span className="text-xs text-green-600">ID copied!</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onView}
          >
            <Eye className="h-3 w-3 mr-2" />
            View
          </Button>
          {isCurrent ? (
            isLocked ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={onLoad}
              >
                <Unlock className="h-3 w-3 mr-2" />
                Unlock
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={onLock}
              >
                <Lock className="h-3 w-3 mr-2" />
                Lock
              </Button>
            )
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onLoad}
            >
              <Shield className="h-3 w-3 mr-2" />
              Load
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}