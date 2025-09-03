import * as React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Shield, 
  Settings, 
  Plus, 
  Database,
  Key,
  Users,
  Activity
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Vaults', href: '/vaults', icon: Shield },
  { name: 'Password Generator', href: '/generator', icon: Key },
  { name: 'Import/Export', href: '/import-export', icon: Database },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const location = useLocation();

  return (
    <nav className={cn('space-y-1', className)}>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon className="mr-3 h-5 w-5" />
            {item.name}
            {item.badge && (
              <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-secondary text-secondary-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn('pb-12 w-64', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <h2 className="text-lg font-semibold">SuiPass</h2>
          </div>
          <div className="space-y-1">
            <Navigation />
          </div>
        </div>
      </div>
    </div>
  );
}