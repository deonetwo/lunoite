export interface DocumentStats {
  words: number;
  characters: number;
  readingTimeMinutes: number;
  lines: number;
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'local_only';

export interface FileMetadata {
  name: string;
  handle: FileSystemFileHandle | null;
  lastSavedAt: number | null;
  isNativeFsSupported: boolean;
}
