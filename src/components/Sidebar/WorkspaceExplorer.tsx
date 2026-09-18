import React, { useState } from 'react';
import { FileTreeNode as TreeNodeType, WorkspaceState } from '../../types/workspace';
import { FileTreeNode } from './FileTreeNode';
import {
  FolderOpen,
  FilePlus,
  FolderPlus,
  RefreshCw,
  Search,
  X,
  FolderX,
} from 'lucide-react';

interface WorkspaceExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: WorkspaceState;
  activeFileId: string | null;
  onSelectFile: (node: TreeNodeType) => void;
  onCreateFile: (parentHandle: FileSystemDirectoryHandle, name: string) => void;
  onCreateFolder: (parentHandle: FileSystemDirectoryHandle, name: string) => void;
  onDeleteNode: (parentHandle: FileSystemDirectoryHandle, name: string) => void;
  onRenameNode: (
    parentHandle: FileSystemDirectoryHandle,
    oldName: string,
    newName: string,
    kind: 'file' | 'directory'
  ) => void;
  onRefresh: () => void;
  onCloseWorkspace: () => void;
}

export const WorkspaceExplorer: React.FC<WorkspaceExplorerProps> = ({
  isOpen,
  onClose,
  workspace,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onDeleteNode,
  onRenameNode,
  onRefresh,
  onCloseWorkspace,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewFilePromptOpen, setIsNewFilePromptOpen] = useState(false);
  const [isNewFolderPromptOpen, setIsNewFolderPromptOpen] = useState(false);
  const [newEntryName, setNewEntryName] = useState('');
  const [targetDirHandle, setTargetDirHandle] = useState<FileSystemDirectoryHandle | null>(null);

  if (!isOpen || !workspace.rootHandle) return null;

  const handleOpenNewFilePrompt = (dirHandle?: FileSystemDirectoryHandle) => {
    setTargetDirHandle(dirHandle || workspace.rootHandle);
    setNewEntryName('');
    setIsNewFilePromptOpen(true);
  };

  const handleOpenNewFolderPrompt = (dirHandle?: FileSystemDirectoryHandle) => {
    setTargetDirHandle(dirHandle || workspace.rootHandle);
    setNewEntryName('');
    setIsNewFolderPromptOpen(true);
  };

  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetDirHandle && newEntryName.trim()) {
      onCreateFile(targetDirHandle, newEntryName.trim());
      setIsNewFilePromptOpen(false);
    }
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetDirHandle && newEntryName.trim()) {
      onCreateFolder(targetDirHandle, newEntryName.trim());
      setIsNewFolderPromptOpen(false);
    }
  };

  // Filter tree recursively
  const filterNodes = (nodes: TreeNodeType[], query: string): TreeNodeType[] => {
    if (!query.trim()) return nodes;
    const lower = query.toLowerCase();

    return nodes.reduce<TreeNodeType[]>((acc, node) => {
      if (node.name.toLowerCase().includes(lower)) {
        acc.push(node);
      } else if (node.kind === 'directory' && node.children) {
        const filteredChildren = filterNodes(node.children, query);
        if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
      }
      return acc;
    }, []);
  };

  const displayedTree = filterNodes(workspace.tree, searchQuery);

  return (
    <aside
      className="w-64 sm:w-72 border-r border-[#e5e3dc] dark:border-[#282b33] bg-[#ffffff] dark:bg-[#17191e] flex flex-col shrink-0 text-[#191b1f] dark:text-[#eceef2] select-none transition-colors duration-200"
      aria-label="Workspace Explorer"
    >
      {/* Workspace Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#e5e3dc] dark:border-[#282b33]">
        <div className="flex items-center gap-2 min-w-0">
          <FolderOpen className="w-4 h-4 text-[#2d6a4f] dark:text-[#52b788] shrink-0" aria-hidden="true" />
          <h2 className="font-semibold text-xs truncate" title={workspace.name}>
            {workspace.name}
          </h2>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => handleOpenNewFilePrompt()}
            className="p-1 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            title="New Markdown file at root"
            aria-label="New file"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenNewFolderPrompt()}
            className="p-1 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            title="New folder at root"
            aria-label="New folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="p-1 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            title="Refresh file tree"
            aria-label="Refresh file tree"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onCloseWorkspace}
            className="p-1 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-red-600 hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            title="Close workspace folder"
            aria-label="Close workspace"
          >
            <FolderX className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5 sm:hidden focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            aria-label="Close explorer panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Instant File Filter Search */}
      <div className="p-2 border-b border-[#e5e3dc] dark:border-[#282b33]">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[#59606d] dark:text-[#9ba2b0]" />
          <input
            type="text"
            placeholder="Filter files..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-xs rounded border border-[#e5e3dc] dark:border-[#282b33] bg-[#f8f7f4] dark:bg-[#111215] focus:border-[#2d6a4f] dark:focus:border-[#52b788] focus:outline-none"
          />
        </div>
      </div>

      {/* New File Inline Form */}
      {isNewFilePromptOpen && (
        <form onSubmit={handleCreateFileSubmit} className="p-2 bg-[#f8f7f4] dark:bg-[#111215] border-b border-[#e5e3dc] dark:border-[#282b33]">
          <label className="block text-[10px] font-medium text-[#59606d] dark:text-[#9ba2b0] mb-1">
            New File Name:
          </label>
          <div className="flex gap-1">
            <input
              type="text"
              autoFocus
              placeholder="notes.md"
              value={newEntryName}
              onChange={e => setNewEntryName(e.target.value)}
              className="flex-1 px-2 py-1 text-xs rounded border border-[#2d6a4f] dark:border-[#52b788] bg-transparent text-[#191b1f] dark:text-[#eceef2] focus:outline-none"
            />
            <button
              type="submit"
              className="px-2 py-1 text-xs font-medium rounded bg-[#2d6a4f] text-white dark:bg-[#52b788] dark:text-[#111215]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsNewFilePromptOpen(false)}
              className="px-1.5 py-1 text-xs rounded hover:bg-black/5 dark:hover:bg-white/5"
            >
              ✕
            </button>
          </div>
        </form>
      )}

      {/* New Folder Inline Form */}
      {isNewFolderPromptOpen && (
        <form onSubmit={handleCreateFolderSubmit} className="p-2 bg-[#f8f7f4] dark:bg-[#111215] border-b border-[#e5e3dc] dark:border-[#282b33]">
          <label className="block text-[10px] font-medium text-[#59606d] dark:text-[#9ba2b0] mb-1">
            New Folder Name:
          </label>
          <div className="flex gap-1">
            <input
              type="text"
              autoFocus
              placeholder="documentation"
              value={newEntryName}
              onChange={e => setNewEntryName(e.target.value)}
              className="flex-1 px-2 py-1 text-xs rounded border border-[#2d6a4f] dark:border-[#52b788] bg-transparent text-[#191b1f] dark:text-[#eceef2] focus:outline-none"
            />
            <button
              type="submit"
              className="px-2 py-1 text-xs font-medium rounded bg-[#2d6a4f] text-white dark:bg-[#52b788] dark:text-[#111215]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsNewFolderPromptOpen(false)}
              className="px-1.5 py-1 text-xs rounded hover:bg-black/5 dark:hover:bg-white/5"
            >
              ✕
            </button>
          </div>
        </form>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5" role="tree">
        {displayedTree.length > 0 ? (
          displayedTree.map(node => (
            <FileTreeNode
              key={node.id}
              node={node}
              activeFileId={activeFileId}
              onSelectFile={onSelectFile}
              onCreateFileInDir={dirHandle => handleOpenNewFilePrompt(dirHandle)}
              onDeleteNode={onDeleteNode}
              onRenameNode={onRenameNode}
            />
          ))
        ) : (
          <div className="py-8 text-center text-xs text-[#59606d] dark:text-[#9ba2b0] px-3">
            {searchQuery ? 'No matching files found' : 'Workspace folder is empty'}
          </div>
        )}
      </div>
    </aside>
  );
};
