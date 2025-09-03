// Network configuration for Sui blockchain

import { config } from '../lib/config';

export type SuiNetwork = 'devnet' | 'testnet' | 'mainnet' | 'localnet';

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  faucetUrl?: string;
  chainId: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  gas: {
    recommended: number;
    min: number;
    max: number;
  };
  features: {
    zkLogin: boolean;
    walrus: boolean;
    sponsoredTransactions: boolean;
  };
}

export const NETWORK_CONFIGS: Record<SuiNetwork, NetworkConfig> = {
  devnet: {
    name: 'Sui Devnet',
    rpcUrl: 'https://fullnode.devnet.sui.io:443',
    explorerUrl: 'https://explorer.devnet.sui.io',
    faucetUrl: 'https://faucet.devnet.sui.io',
    chainId: 'devnet',
    currency: {
      name: 'Sui',
      symbol: 'SUI',
      decimals: 9,
    },
    gas: {
      recommended: 1000,
      min: 100,
      max: 10000,
    },
    features: {
      zkLogin: true,
      walrus: true,
      sponsoredTransactions: true,
    },
  },
  testnet: {
    name: 'Sui Testnet',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    explorerUrl: 'https://explorer.testnet.sui.io',
    faucetUrl: 'https://faucet.testnet.sui.io',
    chainId: 'testnet',
    currency: {
      name: 'Sui',
      symbol: 'SUI',
      decimals: 9,
    },
    gas: {
      recommended: 1000,
      min: 100,
      max: 10000,
    },
    features: {
      zkLogin: true,
      walrus: true,
      sponsoredTransactions: true,
    },
  },
  mainnet: {
    name: 'Sui Mainnet',
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
    explorerUrl: 'https://explorer.sui.io',
    chainId: 'mainnet',
    currency: {
      name: 'Sui',
      symbol: 'SUI',
      decimals: 9,
    },
    gas: {
      recommended: 1000,
      min: 100,
      max: 10000,
    },
    features: {
      zkLogin: true,
      walrus: true,
      sponsoredTransactions: false,
    },
  },
  localnet: {
    name: 'Sui Localnet',
    rpcUrl: 'http://127.0.0.1:9000',
    explorerUrl: 'http://127.0.0.1:9000',
    chainId: 'localnet',
    currency: {
      name: 'Sui',
      symbol: 'SUI',
      decimals: 9,
    },
    gas: {
      recommended: 1000,
      min: 100,
      max: 10000,
    },
    features: {
      zkLogin: true,
      walrus: false,
      sponsoredTransactions: true,
    },
  },
};

export function getNetworkConfig(network: SuiNetwork): NetworkConfig {
  return NETWORK_CONFIGS[network];
}

export function getCurrentNetwork(): SuiNetwork {
  return config.getCurrentNetwork() as SuiNetwork;
}

export function getCurrentNetworkConfig(): NetworkConfig {
  return getNetworkConfig(getCurrentNetwork());
}

export function formatBalance(balance: number, decimals: number = 9): string {
  return (balance / Math.pow(10, decimals)).toFixed(decimals);
}

export function formatAddress(address: string, length: number = 6): string {
  if (!address || address.length < length * 2 + 2) {
    return address;
  }
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

export function getExplorerUrl(
  type: 'address' | 'object' | 'transaction',
  id: string,
  network?: SuiNetwork
): string {
  const config = getNetworkConfig(network || getCurrentNetwork());
  const baseUrl = config.explorerUrl;
  
  switch (type) {
    case 'address':
      return `${baseUrl}/address/${id}`;
    case 'object':
      return `${baseUrl}/object/${id}`;
    case 'transaction':
      return `${baseUrl}/txblock/${id}`;
    default:
      return baseUrl;
  }
}

export function isTestNetwork(network: SuiNetwork): boolean {
  return network === 'devnet' || network === 'testnet' || network === 'localnet';
}

export function supportsFeature(feature: keyof NetworkConfig['features'], network?: SuiNetwork): boolean {
  const config = getNetworkConfig(network || getCurrentNetwork());
  return config.features[feature];
}