declare module 'argon2-browser' {
  export const ArgonType: {
    Argon2d: 0;
    Argon2i: 1;
    Argon2id: 2;
  };

  export function hash(options: {
    pass: string;
    salt: number[];
    type: number;
    mem: number;
    time: number;
    parallelism: number;
    hashLen: number;
  }): Promise<{
    hashHex: string;
    encoded: string;
  }>;

  export function verify(hash: string, password: string): Promise<boolean>;
  export function unloadRuntime(): void;
}
