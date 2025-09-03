import React, { useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import { Sidebar } from './sidebar';
import { Breadcrumb } from './breadcrumb';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { Menu, X, Bell, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  className?: string;
  showSidebar?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  className,
  showSidebar = true 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected, address, disconnectWallet } = useAuthStore();

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar collapsed={sidebarCollapsed} />
          </div>
          
          {/* Mobile Sidebar */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40">
              <div 
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
                <Sidebar />
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        showSidebar && !sidebarCollapsed ? 'lg:ml-64' : '',
        showSidebar && sidebarCollapsed ? 'lg:ml-16' : ''
      )}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                {showSidebar && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden lg:flex"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                )}
                <Breadcrumb className="hidden md:flex" />
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>

                {/* User Menu */}
                {isConnected && address && (
                  <div className="flex items-center space-x-2">
                    <div className="hidden md:flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-500">Connected</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleDisconnect}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};