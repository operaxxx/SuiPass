import React from 'react';
import { WalletConnect } from '../wallet/wallet-connect';
import { NetworkStatus } from '../wallet/network-status';

interface AppHeaderProps {
  className?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ className = '' }) => {
  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SuiPass</h1>
              <p className="text-xs text-gray-500">Decentralized Password Manager</p>
            </div>
          </div>

          {/* Network Status */}
          <div className="hidden md:block">
            <NetworkStatus />
          </div>

          {/* Wallet Connect */}
          <div>
            <WalletConnect />
          </div>
        </div>

        {/* Mobile Network Status */}
        <div className="md:hidden pb-3 border-t border-gray-200 mt-3">
          <NetworkStatus />
        </div>
      </div>
    </header>
  );
};