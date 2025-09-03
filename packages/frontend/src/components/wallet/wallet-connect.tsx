import React, { useState, useEffect } from 'react';
import { WalletConnectButton } from '@suiet/wallet-kit';
import { useAuthStore } from '../../stores/auth';
import { suiService } from '../../services/sui';

interface WalletConnectProps {
  className?: string;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ className = '' }) => {
  const {
    isConnected,
    address,
    balance,
    network,
    networkStatus,
    isConnecting,
    connectWallet,
    disconnectWallet,
    updateBalance,
    checkNetworkStatus,
  } = useAuthStore();

  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize network status check
  useEffect(() => {
    checkNetworkStatus();
    const interval = setInterval(checkNetworkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkNetworkStatus]);

  // Update balance periodically when connected
  useEffect(() => {
    if (isConnected && address) {
      updateBalance();
      const interval = setInterval(updateBalance, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, address, updateBalance]);

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkColor = () => {
    switch (network) {
      case 'mainnet':
        return 'bg-green-500';
      case 'testnet':
        return 'bg-blue-500';
      case 'devnet':
        return 'bg-yellow-500';
      case 'localnet':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = () => {
    return networkStatus === 'online' ? 'bg-green-500' : 'bg-red-500';
  };

  if (isConnected && address) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {/* Network indicator */}
          <div className={`w-2 h-2 rounded-full ${getNetworkColor()}`} />
          
          {/* Status indicator */}
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          
          {/* Balance */}
          <span className="text-sm font-medium text-gray-900">
            {balance.toFixed(4)} SUI
          </span>
          
          {/* Address */}
          <span className="text-sm text-gray-600">
            {formatAddress(address)}
          </span>
          
          {/* Dropdown arrow */}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${
              showDropdown ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Wallet</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getNetworkColor()}`} />
                  <span className="text-xs text-gray-600 capitalize">{network}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                  <span className="text-xs text-gray-600 capitalize">
                    {networkStatus}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Balance</span>
                <span className="text-sm font-medium text-gray-900">
                  {balance.toFixed(4)} SUI
                </span>
              </div>
            </div>
            
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Address</span>
                <button
                  onClick={handleCopyAddress}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="text-xs text-gray-900 font-mono break-all">
                {address}
              </div>
            </div>
            
            <div className="p-2">
              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <WalletConnectButton
        className="!bg-blue-600 !text-white !px-4 !py-2 !rounded-lg !hover:bg-blue-700 !focus:outline-none !focus:ring-2 !focus:ring-blue-500 !font-medium !text-sm !shadow-sm !transition-colors"
        onConnect={async (wallet) => {
          try {
            await connectWallet(wallet);
          } catch (error) {
            console.error('Connection failed:', error);
          }
        }}
      >
        Connect Wallet
      </WalletConnectButton>
    </div>
  );
};