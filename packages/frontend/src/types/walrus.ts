// Walrus related type definitions
export interface WalrusClient {
  uploadBlob: (options: { blobBytes: Uint8Array; epochs?: number }) => Promise<{ blobId: string }>;
  downloadBlob: (blobId: string) => Promise<Uint8Array>;
  readBlob: (options: { blobId: string }) => Promise<BlobInfo>;
}

export interface VaultBlob {
  metadata: {
    id: string;
    name: string;
    version: number;
    created_at: number;
    updated_at: number;
  };
  passwords: PasswordItem[];
  compression: {
    algorithm: 'none' | 'gzip';
    ratio: number;
    original_size: number;
    compressed_size: number;
  };
  checksum: string;
  version: number;
}

export interface DeltaUpdate {
  version: number;
  base_version: number;
  changes: Change[];
  checksum: string;
}

export interface Change {
  type: 'create' | 'update' | 'delete';
  entity: 'password' | 'folder';
  id: string;
  data?: any;
  timestamp: number;
}

export interface UploadOptions {
  epochs?: number;
  storageType?: 'primary' | 'secondary';
}

export interface UploadResult {
  blobId: string;
  size: number;
  epochs: number;
  timestamp: number;
}

export interface BlobInfo {
  blob_id: string;
  metadata: {
    V1: {
      encoding_type: 'RedStuff' | 'RS2';
      unencoded_length: string;
      hashes: Array<{
        hash: string;
        hash_function: string;
      }>;
    };
  };
  $kind: 'V1';
  epochs?: number;
  timestamp?: number;
}

export interface ReadBlobOptions {
  blobId: string;
}

export interface EncryptedData {
  algorithm: 'AES-256-GCM';
  ciphertext: number[] | Uint8Array;
  iv: number[] | Uint8Array;
  tag: number[] | Uint8Array;
  keyId: string;
  keyDerivation?: {
    algorithm: string;
    iterations: number;
    memory: number;
    parallelism: number;
    saltLength: number;
  };
}

export interface UploadLog {
  blobId: string;
  size: number;
  compressionRatio: number;
  duration: number;
  timestamp: number;
}

export interface DownloadLog {
  blobId: string;
  size: number;
  duration: number;
  timestamp: number;
}

export interface VaultMetadata {
  id: string;
  name: string;
  description?: string;
  version: number;
  created_at: number;
  updated_at: number;
  item_count: number;
  total_size: number;
}

export interface PasswordItem {
  id: string;
  type: 'login' | 'card' | 'identity' | 'secure-note';
  title: string;
  url?: string;
  username?: string;
  password?: string;
  notes?: string;
  favorite: boolean;
  folder_id?: string;
  tags: string[];
  created_at: number;
  updated_at: number;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  parent_id?: string;
  created_at: number;
  updated_at: number;
}

export interface CompressionInfo {
  algorithm: 'LZMA' | 'GZIP' | 'DEFLATE';
  originalSize: number;
  compressedSize: number;
  ratio: number;
  duration: number;
}

export interface EncryptionInfo {
  algorithm: 'AES-256-GCM';
  keyId: string;
  salt: string;
  iv: string;
  duration: number;
}
