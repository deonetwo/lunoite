export type NodeKind = 'file' | 'directory';

export interface FileTreeNode {
  id: string; // unique path, e.g. "docs/architecture.md"
  name: string;
  path: string;
  kind: NodeKind;
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
  parentHandle?: FileSystemDirectoryHandle;
  children?: FileTreeNode[];
  extension?: string;
  sizeBytes?: number;
  lastModified?: number;
}

export interface OpenTab {
  id: string; // matches node.id or file path
  name: string;
  path: string;
  handle?: FileSystemFileHandle | null;
  parentDirHandle?: FileSystemDirectoryHandle;
  content: string;
  isDirty: boolean;
  lastSavedAt: number;
  nativePath?: string;
  isSingleFile?: boolean;
}

export interface WorkspaceState {
  rootHandle: FileSystemDirectoryHandle | null;
  name: string;
  tree: FileTreeNode[];
  isLoading: boolean;
  error: string | null;
}

export interface RecentWorkspace {
  id: string;
  name: string;
  lastOpened: number;
  handleKey: string;
}
