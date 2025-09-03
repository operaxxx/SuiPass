import React from 'react';
import { useAuthStore } from '../../stores/auth';

interface NetworkStatusProps {
  className?: string;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ className = '' }) => {
  const { network, networkStatus, checkNetworkStatus } = useAuthStore();

  const getNetworkInfo = () => {
    switch (network) {
      case 'mainnet':
        return {
          name: 'Sui Mainnet',
          color: 'bg-green-500',
          borderColor: 'border-green-500',
          textColor: 'text-green-700',
        };
      case 'testnet':
        return {
          name: 'Sui Testnet',
          color: 'bg-blue-500',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-700',
        };
      case 'devnet':
        return {
          name: 'Sui Devnet',
          color: 'bg-yellow-500',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-700',
        };
      case 'localnet':
        return {
          name: 'Sui Localnet',
          color: 'bg-purple-500',
          borderColor: 'border-purple-500',
          textColor: 'text-purple-700',
        };
      default:
        return {
          name: 'Unknown Network',
          color: 'bg-gray-500',
          borderColor: 'border-gray-500',
          textColor: 'text-gray-700',
        };
    }
  };

  const getStatusInfo = () => {
    if (networkStatus === 'online') {
      return {
        name: 'Online',
        color: 'bg-green-500',
        textColor: 'text-green-700',
      };
    } else {
      return {
        name: 'Offline',
        color: 'bg-red-500',
        textColor: 'text-red-700',
      };
    }
  };

  const networkInfo = getNetworkInfo();
  const statusInfo = getStatusInfo();

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Network */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${networkInfo.color}`} />
        <span className={`text-sm font-medium ${networkInfo.textColor}`}>
          {networkInfo.name}
        </span>
      </div>
      
      {/* Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
        <span className={`text-sm font-medium ${statusInfo.textColor}`}>
          {statusInfo.name}
        </span>
      </div>
      
      {/* Refresh button */}
      <button
        onClick={checkNetworkStatus}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="Check network status"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
};