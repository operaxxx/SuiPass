import React from 'react';
import { Link, useMatchRoute } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  Shield, 
  Key,
  Database,
  Users,
  Activity,
  BarChart3
} from 'lucide-react';

interface SidebarItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: string | number;
  children?: SidebarItem[];
}

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Vaults',
    to: '/vaults',
    icon: <FolderOpen className="h-5 w-5" />,
  },
  {
    label: 'Security',
    to: '/security',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    label: 'Password Generator',
    to: '/generator',
    icon: <Key className="h-5 w-5" />,
  },
  {
    label: 'Import/Export',
    to: '/import-export',
    icon: <Database className="h-5 w-5" />,
  },
  {
    label: 'Sharing',
    to: '/sharing',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'Activity',
    to: '/activity',
    icon: <Activity className="h-5 w-5" />,
  },
  {
    label: 'Analytics',
    to: '/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  collapsed = false 
}) => {
  const matchRoute = useMatchRoute();

  const isActive = (to: string): boolean => {
    return matchRoute({ to, fuzzy: true }) !== false;
  };

  return (
    <aside className={cn(
      'bg-white border-r border-gray-200 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">SuiPass</h1>
                <p className="text-xs text-gray-500">Password Manager</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <div key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                  'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isActive(item.to) 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700'
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{item.label}</span>
                  </span>
                )}
                {!collapsed && item.badge && (
                  <span className="flex-shrink-0 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>

              {/* Sub-items */}
              {!collapsed && item.children && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.to}
                      to={child.to}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                        'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                        isActive(child.to) 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'text-gray-700'
                      )}
                    >
                      <span className="flex-shrink-0">{child.icon}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block truncate">{child.label}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>© 2024 SuiPass</p>
              <p className="mt-1">Decentralized Password Manager</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};