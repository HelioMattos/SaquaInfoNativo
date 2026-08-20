declare module 'expo-sqlite' {
  export interface SQLiteRunResult {
    changes: number;
    lastInsertRowId: number;
  }

  export interface SQLiteDatabase {
    execAsync(source: string): Promise<void>;
    getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]>;
    getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null>;
    runAsync(source: string, ...params: unknown[]): Promise<SQLiteRunResult>;
  }

  export function openDatabaseAsync(name: string): Promise<SQLiteDatabase>;
}
