import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { Sidebar } from '@/components/layout/Navigation';
import { ToastProvider } from '@/components/ui/toast';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <div className="h-full flex flex-col">
            <Sidebar />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <ToastProvider>
            {children || <Outlet />}
          </ToastProvider>
        </div>
      </div>
    </div>
  );
}