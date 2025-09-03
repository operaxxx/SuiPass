import React, { ReactNode } from 'react';

// Unified error handling system

export enum ErrorCode {
  // Authentication errors
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  WALLET_CONNECTION_FAILED = 'WALLET_CONNECTION_FAILED',
  
  // Vault errors
  VAULT_NOT_FOUND = 'VAULT_NOT_FOUND',
  VAULT_LOCKED = 'VAULT_LOCKED',
  VAULT_ACCESS_DENIED = 'VAULT_ACCESS_DENIED',
  
  // Encryption errors
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  
  // Storage errors
  STORAGE_FAILED = 'STORAGE_FAILED',
  RETRIEVAL_FAILED = 'RETRIEVAL_FAILED',
  BACKUP_FAILED = 'BACKUP_FAILED',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  BLOCKCHAIN_ERROR = 'BLOCKCHAIN_ERROR',
  WALRUS_ERROR = 'WALRUS_ERROR',
  
  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_URL = 'INVALID_URL',
  
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: any;
  public readonly timestamp: number;
  public readonly stack?: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  isNetworkError(): boolean {
    return [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.BLOCKCHAIN_ERROR,
      ErrorCode.WALRUS_ERROR,
    ].includes(this.code);
  }

  isUserError(): boolean {
    return [
      ErrorCode.INVALID_PASSWORD,
      ErrorCode.WEAK_PASSWORD,
      ErrorCode.INVALID_INPUT,
      ErrorCode.MISSING_REQUIRED_FIELD,
      ErrorCode.INVALID_URL,
    ].includes(this.code);
  }

  shouldRetry(): boolean {
    return this.isNetworkError() && !this.isUserError();
  }
}

// Error factory functions
export const createError = {
  walletNotConnected: () => new AppError(
    'Wallet is not connected',
    ErrorCode.WALLET_NOT_CONNECTED
  ),
  
  walletConnectionFailed: (details?: any) => new AppError(
    'Failed to connect wallet',
    ErrorCode.WALLET_CONNECTION_FAILED,
    details
  ),
  
  vaultNotFound: (vaultId: string) => new AppError(
    `Vault not found: ${vaultId}`,
    ErrorCode.VAULT_NOT_FOUND,
    { vaultId }
  ),
  
  vaultLocked: () => new AppError(
    'Vault is locked',
    ErrorCode.VAULT_LOCKED
  ),
  
  invalidPassword: () => new AppError(
    'Invalid password',
    ErrorCode.INVALID_PASSWORD
  ),
  
  weakPassword: (feedback: string[]) => new AppError(
    `Password is too weak: ${feedback.join(', ')}`,
    ErrorCode.WEAK_PASSWORD,
    { feedback }
  ),
  
  encryptionFailed: (details?: any) => new AppError(
    'Failed to encrypt data',
    ErrorCode.ENCRYPTION_FAILED,
    details
  ),
  
  decryptionFailed: (details?: any) => new AppError(
    'Failed to decrypt data',
    ErrorCode.DECRYPTION_FAILED,
    details
  ),
  
  networkError: (details?: any) => new AppError(
    'Network error occurred',
    ErrorCode.NETWORK_ERROR,
    details
  ),
  
  blockchainError: (details?: any) => new AppError(
    'Blockchain operation failed',
    ErrorCode.BLOCKCHAIN_ERROR,
    details
  ),
  
  invalidInput: (field: string, value: any) => new AppError(
    `Invalid input for field: ${field}`,
    ErrorCode.INVALID_INPUT,
    { field, value }
  ),
  
  missingRequiredField: (field: string) => new AppError(
    `Missing required field: ${field}`,
    ErrorCode.MISSING_REQUIRED_FIELD,
    { field }
  ),
};

// Async error handler wrapper
export async function handleAsync<T>(
  promise: Promise<T>
): Promise<[T | null, AppError | null]> {
  try {
    const result = await promise;
    return [result, null];
  } catch (error) {
    const appError = error instanceof AppError 
      ? error 
      : new AppError(
          error instanceof Error ? error.message : 'Unknown error',
          ErrorCode.UNKNOWN_ERROR,
          error
        );
    return [null, appError];
  }
}

// Error toast hook
export function useErrorToast() {
  const showError = (error: AppError) => {
    // Import toast dynamically to avoid circular dependency
    import('react-hot-toast').then(({ toast }) => {
      toast.error(error.message, {
        duration: error.isUserError() ? 5000 : 3000,
        position: 'top-right',
      });
    });
  };

  return { showError };
}

// Global error handler
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    const error = event.reason;
    const appError = error instanceof AppError 
      ? error 
      : new AppError(
          error instanceof Error ? error.message : 'Unhandled promise rejection',
          ErrorCode.UNKNOWN_ERROR
        );
    
    console.error('Unhandled rejection:', appError);
    
    // Show user-friendly error
    if (appError.isUserError()) {
      // Show toast for user errors
      import('react-hot-toast').then(({ toast }) => {
        toast.error(appError.message);
      });
    }
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    event.preventDefault();
    const appError = new AppError(
      event.message,
      ErrorCode.UNKNOWN_ERROR,
      { filename: event.filename, lineno: event.lineno, colno: event.colno }
    );
    
    console.error('Uncaught error:', appError);
  });
}