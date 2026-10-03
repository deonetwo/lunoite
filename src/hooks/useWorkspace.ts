import { useState, useCallback, useEffect } from 'react';
import { FileTreeNode, WorkspaceState, RecentWorkspace } from '../types/workspace';
import {
  saveDirectoryHandle,
  getDirectoryHandle,
  clearDirectoryHandle,
  verifyHandlePermission,
  recordRecentWorkspace,
  getRecentWorkspaces,
  removeRecentWorkspace,
  clearAllRecentWorkspaces,
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

  const [recentWorkspaces, setRecentWorkspaces] = useState<RecentWorkspace[]>(() =>
    getRecentWorkspaces()
  );

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
      const updatedRecents = await recordRecentWorkspace(rootHandle);
      setRecentWorkspaces(updatedRecents);
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

  // Open a previously saved workspace from recent history
  const openRecentWorkspace = useCallback(
    async (recent: RecentWorkspace): Promise<boolean> => {
      try {
        setWorkspace(prev => ({ ...prev, isLoading: true, error: null }));

        let handle = await getDirectoryHandle(recent.handleKey);
        if (!handle) {
          handle = await getDirectoryHandle(WORKSPACE_STORAGE_KEY);
        }

        if (!handle) {
          setWorkspace(prev => ({
            ...prev,
            isLoading: false,
            error: 'Workspace folder handle is no longer stored.',
          }));
          return false;
        }

        const hasPermission = await verifyHandlePermission(handle, true);
        if (!hasPermission) {
          setWorkspace(prev => ({
            ...prev,
            isLoading: false,
            error: 'Permission to access workspace folder was denied.',
          }));
          return false;
        }

        await saveDirectoryHandle(WORKSPACE_STORAGE_KEY, handle);
        const updatedRecents = await recordRecentWorkspace(handle);
        setRecentWorkspaces(updatedRecents);

        const tree = await scanDirectory(handle);
        setWorkspace({
          rootHandle: handle,
          name: handle.name,
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
        console.error('Error opening recent workspace:', err);
        setWorkspace(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to open recent workspace.',
        }));
        return false;
      }
    },
    [scanDirectory]
  );

  // Create a brand new workspace folder on disk
  const createNewWorkspace = useCallback(
    async (
      name: string,
      initialNoteTitle = 'Welcome.md',
      initialNoteContent?: string
    ): Promise<FileSystemDirectoryHandle | null> => {
      if (!isNativeSupported) {
        alert(
          'Directory Picker API is not supported in this browser. Please use Chrome, Edge, or a Chromium-based browser.'
        );
        return null;
      }

      try {
        setWorkspace(prev => ({ ...prev, isLoading: true, error: null }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parentHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
        });

        const cleanName = name.trim();
        const workspaceHandle = await parentHandle.getDirectoryHandle(cleanName, {
          create: true,
        });

        if (initialNoteTitle && initialNoteTitle.trim()) {
          const noteName = initialNoteTitle.trim().endsWith('.md')
            ? initialNoteTitle.trim()
            : `${initialNoteTitle.trim()}.md`;
          const noteHandle = await workspaceHandle.getFileHandle(noteName, {
            create: true,
          });
          const writable = await noteHandle.createWritable();
          const starterContent =
            initialNoteContent ??
            `# ${cleanName}\n\nWelcome to your new Lunoite workspace. Start writing your notes or STAR stories here.\n`;
          await writable.write(starterContent);
          await writable.close();
        }

        await saveDirectoryHandle(WORKSPACE_STORAGE_KEY, workspaceHandle);
        const updatedRecents = await recordRecentWorkspace(workspaceHandle);
        setRecentWorkspaces(updatedRecents);

        const tree = await scanDirectory(workspaceHandle);
        setWorkspace({
          rootHandle: workspaceHandle,
          name: workspaceHandle.name,
          tree,
          isLoading: false,
          error: null,
        });

        return workspaceHandle;
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') {
          setWorkspace(prev => ({ ...prev, isLoading: false }));
          return null;
        }
        console.error('Error creating workspace:', err);
        setWorkspace(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to create workspace.',
        }));
        return null;
      }
    },
    [isNativeSupported, scanDirectory]
  );

  // Remove a recent workspace from history
  const removeRecent = useCallback(async (id: string) => {
    const updated = await removeRecentWorkspace(id);
    setRecentWorkspaces(updated);
  }, []);

  // Clear all recent workspace history
  const clearRecent = useCallback(async () => {
    const updated = await clearAllRecentWorkspaces();
    setRecentWorkspaces(updated);
  }, []);

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
        setRecentWorkspaces(getRecentWorkspaces());
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
          const updated = await recordRecentWorkspace(savedHandle);
          setRecentWorkspaces(updated);
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
    recentWorkspaces,
    isNativeSupported,
    openWorkspace,
    openRecentWorkspace,
    createNewWorkspace,
    removeRecent,
    clearRecent,
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
