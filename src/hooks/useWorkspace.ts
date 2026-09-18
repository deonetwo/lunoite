import { useState, useCallback, useEffect } from 'react';
import { FileTreeNode, WorkspaceState } from '../types/workspace';
import {
  saveDirectoryHandle,
  getDirectoryHandle,
  clearDirectoryHandle,
  verifyHandlePermission,
} from '../lib/indexedDb';

const WORKSPACE_STORAGE_KEY = 'lunoite_active_workspace';

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    rootHandle: null,
    name: '',
    tree: [],
    isLoading: false,
    error: null,
  });

  const isNativeSupported =
    typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  // Recursively scans a directory handle and returns a structured FileTreeNode array
  const scanDirectory = useCallback(
    async (
      dirHandle: FileSystemDirectoryHandle,
      basePath = ''
    ): Promise<FileTreeNode[]> => {
      const nodes: FileTreeNode[] = [];

      try {
        const entries: [string, FileSystemHandle][] = [];
        // Iterate entries using async iterator
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for await (const [name, handle] of (dirHandle as any).entries()) {
          // Skip hidden system files/folders (e.g. .git)
          if (name.startsWith('.') && name !== '.lunoite') continue;
          if (name === 'node_modules' || name === 'dist') continue;
          entries.push([name, handle]);
        }

        // Sort: folders first, then files alphabetically
        entries.sort((a, b) => {
          if (a[1].kind === b[1].kind) {
            return a[0].localeCompare(b[0], undefined, { sensitivity: 'base' });
          }
          return a[1].kind === 'directory' ? -1 : 1;
        });

        for (const [name, handle] of entries) {
          const nodePath = basePath ? `${basePath}/${name}` : name;

          if (handle.kind === 'directory') {
            const children = await scanDirectory(
              handle as FileSystemDirectoryHandle,
              nodePath
            );
            nodes.push({
              id: nodePath,
              name,
              path: nodePath,
              kind: 'directory',
              handle: handle as FileSystemDirectoryHandle,
              parentHandle: dirHandle,
              children,
            });
          } else {
            const fileHandle = handle as FileSystemFileHandle;
            const ext = name.includes('.') ? name.split('.').pop() || '' : '';
            nodes.push({
              id: nodePath,
              name,
              path: nodePath,
              kind: 'file',
              handle: fileHandle,
              parentHandle: dirHandle,
              extension: ext.toLowerCase(),
            });
          }
        }
      } catch (err) {
        console.error('Error scanning directory:', err);
      }

      return nodes;
    },
    []
  );

  // Refresh tree using existing rootHandle
  const refreshTree = useCallback(async () => {
    if (!workspace.rootHandle) return;
    try {
      const tree = await scanDirectory(workspace.rootHandle);
      setWorkspace(prev => ({ ...prev, tree }));
    } catch (err) {
      console.error('Failed to refresh file tree:', err);
    }
  }, [workspace.rootHandle, scanDirectory]);

  // Open a new workspace via showDirectoryPicker
  const openWorkspace = useCallback(async (): Promise<boolean> => {
    if (!isNativeSupported) {
      alert(
        'Directory Picker API is not supported in this browser. Please use Chrome, Edge, or a Chromium-based browser.'
      );
      return false;
    }

    try {
      setWorkspace(prev => ({ ...prev, isLoading: true, error: null }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rootHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
      });

      await saveDirectoryHandle(WORKSPACE_STORAGE_KEY, rootHandle);
      const tree = await scanDirectory(rootHandle);

      setWorkspace({
        rootHandle,
        name: rootHandle.name,
        tree,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        setWorkspace(prev => ({ ...prev, isLoading: false }));
        return false;
      }
      console.error('Error opening directory:', err);
      setWorkspace(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to open directory.',
      }));
      return false;
    }
  }, [isNativeSupported, scanDirectory]);

  // Close active workspace
  const closeWorkspace = useCallback(async () => {
    await clearDirectoryHandle(WORKSPACE_STORAGE_KEY);
    setWorkspace({
      rootHandle: null,
      name: '',
      tree: [],
      isLoading: false,
      error: null,
    });
  }, []);

  // Restore previous workspace from IndexedDB on startup
  useEffect(() => {
    async function restore() {
      try {
        const savedHandle = await getDirectoryHandle(WORKSPACE_STORAGE_KEY);
        if (!savedHandle) return;

        const hasPermission = await verifyHandlePermission(savedHandle, true);
        if (hasPermission) {
          const tree = await scanDirectory(savedHandle);
          setWorkspace({
            rootHandle: savedHandle,
            name: savedHandle.name,
            tree,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        console.warn('Could not automatically restore workspace:', err);
      }
    }

    restore();
  }, [scanDirectory]);

  // File Operations on Disk
  const readFile = useCallback(
    async (fileHandle: FileSystemFileHandle): Promise<string> => {
      const file = await fileHandle.getFile();
      return await file.text();
    },
    []
  );

  const writeFile = useCallback(
    async (
      fileHandle: FileSystemFileHandle,
      content: string
    ): Promise<boolean> => {
      if (!fileHandle || typeof fileHandle.createWritable !== 'function') {
        return false;
      }
      try {
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        return true;
      } catch (err) {
        console.error('Error writing file directly to disk:', err);
        return false;
      }
    },
    []
  );

  const createFile = useCallback(
    async (
      parentHandle: FileSystemDirectoryHandle,
      fileName: string,
      initialContent = '# Untitled\n\nStart writing...\n'
    ): Promise<FileSystemFileHandle | null> => {
      try {
        const cleanName = fileName.includes('.') ? fileName : `${fileName}.md`;
        const newFileHandle = await parentHandle.getFileHandle(cleanName, {
          create: true,
        });
        const writable = await newFileHandle.createWritable();
        await writable.write(initialContent);
        await writable.close();

        await refreshTree();
        return newFileHandle;
      } catch (err) {
        console.error('Failed to create file:', err);
        return null;
      }
    },
    [refreshTree]
  );

  const createFolder = useCallback(
    async (
      parentHandle: FileSystemDirectoryHandle,
      folderName: string
    ): Promise<boolean> => {
      try {
        await parentHandle.getDirectoryHandle(folderName, { create: true });
        await refreshTree();
        return true;
      } catch (err) {
        console.error('Failed to create folder:', err);
        return false;
      }
    },
    [refreshTree]
  );

  const deleteEntry = useCallback(
    async (
      parentHandle: FileSystemDirectoryHandle,
      name: string
    ): Promise<boolean> => {
      try {
        await parentHandle.removeEntry(name, { recursive: true });
        await refreshTree();
        return true;
      } catch (err) {
        console.error('Failed to delete entry:', err);
        return false;
      }
    },
    [refreshTree]
  );

  const renameEntry = useCallback(
    async (
      parentHandle: FileSystemDirectoryHandle,
      oldName: string,
      newName: string,
      kind: 'file' | 'directory'
    ): Promise<boolean> => {
      try {
        if (oldName === newName) return true;

        if (kind === 'file') {
          const oldHandle = await parentHandle.getFileHandle(oldName);
          // Check if native .move() is supported
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (typeof (oldHandle as any).move === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (oldHandle as any).move(newName);
          } else {
            // Fallback: read content, create new, remove old
            const content = await readFile(oldHandle);
            const newHandle = await parentHandle.getFileHandle(newName, {
              create: true,
            });
            await writeFile(newHandle, content);
            await parentHandle.removeEntry(oldName);
          }
        } else {
          // Directories: show alert if move is unsupported
          alert('Folder renaming is not natively supported in this browser version.');
          return false;
        }

        await refreshTree();
        return true;
      } catch (err) {
        console.error('Failed to rename entry:', err);
        return false;
      }
    },
    [readFile, writeFile, refreshTree]
  );

  return {
    workspace,
    isNativeSupported,
    openWorkspace,
    closeWorkspace,
    refreshTree,
    readFile,
    writeFile,
    createFile,
    createFolder,
    deleteEntry,
    renameEntry,
  };
}
