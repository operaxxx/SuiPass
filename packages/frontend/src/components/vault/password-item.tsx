import React, { useState } from 'react';
import { Copy, Eye, EyeOff, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { VaultItem } from '@/types';
import { cn, copyToClipboard, formatDate, isValidUrl } from '@/lib/utils';

interface PasswordItemProps {
  item: VaultItem;
  onEdit: (item: VaultItem) => void;
  onDelete: (itemId: string) => void;
  className?: string;
}

export function PasswordItem({ item, onEdit, onDelete, className }: PasswordItemProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await copyToClipboard(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleOpenUrl = () => {
    if (item.url && isValidUrl(item.url)) {
      window.open(item.url.startsWith('http') ? item.url : `https://${item.url}`, '_blank');
    }
  };

  return (
    <Card className={cn('relative group', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg truncate">{item.title}</h3>
            {item.username && (
              <p className="text-sm text-muted-foreground truncate">{item.username}</p>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Password Field */}
        <div className="flex items-center gap-2">
          <div className="flex-1 font-mono text-sm bg-muted px-3 py-2 rounded">
            {showPassword ? item.password : '•'.repeat(16)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="h-8 w-8"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCopy(item.password, 'password')}
            className="h-8 w-8 relative"
          >
            <Copy className="h-4 w-4" />
            {copiedField === 'password' && (
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                Copied!
              </span>
            )}
          </Button>
        </div>

        {/* Username Field */}
        {item.username && (
          <div className="flex items-center gap-2">
            <div className="flex-1 text-sm bg-muted px-3 py-2 rounded truncate">
              {item.username}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(item.username, 'username')}
              className="h-8 w-8 relative"
            >
              <Copy className="h-4 w-4" />
              {copiedField === 'username' && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  Copied!
                </span>
              )}
            </Button>
          </div>
        )}

        {/* URL Field */}
        {item.url && (
          <div className="flex items-center gap-2">
            <div className="flex-1 text-sm bg-muted px-3 py-2 rounded truncate">
              {item.url}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenUrl}
              className="h-8 w-8"
              disabled={!isValidUrl(item.url)}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(item.url, 'url')}
              className="h-8 w-8 relative"
            >
              <Copy className="h-4 w-4" />
              {copiedField === 'url' && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  Copied!
                </span>
              )}
            </Button>
          </div>
        )}

        {/* Notes Field */}
        {item.notes && (
          <div className="mt-3">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {item.notes}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {item.category && (
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                {item.category}
              </span>
            )}
            {item.tags && item.tags.length > 0 && (
              <div className="flex gap-1">
                {item.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{item.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(item.updatedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}