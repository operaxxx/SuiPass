// Type definition module declarations
declare module 'argon2-browser' {
  export interface Argon2Options {
    timeCost?: number;
    memoryCost?: number;
    parallelism?: number;
    type?: 'argon2i' | 'argon2d' | 'argon2id';
    hashLen?: number;
    salt?: Uint8Array;
    saltLength?: number;
  }

  export function hash(options: Argon2Options & { pass: string }): Promise<{
    hash: Uint8Array;
    hashHex: string;
    encoded: string;
  }>;

  export function verify(
    options: Argon2Options & { pass: string; encoded: string }
  ): Promise<boolean>;
}

// Process type definitions for browser environment
declare const process: {
  env: {
    NODE_ENV?: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  };
};
