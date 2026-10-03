import React, { useState } from 'react';
import { FileTreeNode as TreeNodeType, WorkspaceState, OpenTab } from '../../types/workspace';
import { SearchMatch } from '../../types/search';
import { FileTreeNode } from './FileTreeNode';
import { WorkspaceSearchResults } from '../Workspace/WorkspaceSearchResults';
import { useWorkspaceSearch } from '../../hooks/useWorkspaceSearch';
import {
  FolderOpen,
  FilePlus,
  FolderPlus,
  RefreshCw,
  Search,
  X,
  FolderX,
  FolderTree,
  CaseSensitive,
} from 'lucide-react';

interface WorkspaceExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: WorkspaceState;
  activeFileId: string | null;
  onSelectFile: (node: TreeNodeType, targetMatch?: SearchMatch, query?: string) => void;
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
  readFile?: (fileHandle: FileSystemFileHandle) => Promise<string>;
  openTabs?: OpenTab[];
  activeSidebarTab?: 'files' | 'search';
  onTabChange?: (tab: 'files' | 'search') => void;
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
  readFile,
  openTabs = [],
  activeSidebarTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'files' | 'search'>('files');
  const activeTab = activeSidebarTab !== undefined ? activeSidebarTab : internalTab;

  const handleTabSwitch = (tab: 'files' | 'search') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  // Quick file filter (for files tab)
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewFilePromptOpen, setIsNewFilePromptOpen] = useState(false);
  const [isNewFolderPromptOpen, setIsNewFolderPromptOpen] = useState(false);
  const [newEntryName, setNewEntryName] = useState('');
  const [targetDirHandle, setTargetDirHandle] = useState<FileSystemDirectoryHandle | null>(null);

  // Full-text workspace search hook
  const {
    query: textQuery,
    setQuery: setTextQuery,
    matchCase,
    setMatchCase,
    isSearching: isTextSearching,
    results: textResults,
    totalMatches,
    totalFiles,
    clearSearch: clearTextSearch,
  } = useWorkspaceSearch({
    tree: workspace.tree,
    readFile: readFile || (async h => (await h.getFile()).text()),
    openTabs,
  });

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

  // Filter tree recursively for files tab
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

      {/* Mode Switcher Tabs: Files vs Search */}
      <div className="flex border-b border-[#e5e3dc] dark:border-[#282b33] bg-[#f8f7f4]/60 dark:bg-[#111215]/50 px-2 pt-1 gap-1" role="tablist">
        <button
          type="button"
          onClick={() => handleTabSwitch('files')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'files'
              ? 'border-[#2d6a4f] text-[#2d6a4f] dark:border-[#52b788] dark:text-[#52b788]'
              : 'border-transparent text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2]'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          aria-selected={activeTab === 'files'}
          role="tab"
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Files</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch('search')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'search'
              ? 'border-[#2d6a4f] text-[#2d6a4f] dark:border-[#52b788] dark:text-[#52b788]'
              : 'border-transparent text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2]'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          aria-selected={activeTab === 'search'}
          role="tab"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
          {totalMatches > 0 && (
            <span className="text-[10px] font-mono px-1 rounded-full bg-[#2d6a4f]/15 dark:bg-[#52b788]/20 text-[#2d6a4f] dark:text-[#52b788]">
              {totalMatches}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'files' ? (
        <>
          {/* Instant File Name Filter */}
          <div className="p-2 border-b border-[#e5e3dc] dark:border-[#282b33]">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[#59606d] dark:text-[#9ba2b0]" />
              <input
                type="text"
                placeholder="Filter files by name..."
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
        </>
      ) : (
        /* Workspace Text Search Panel */
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-2 border-b border-[#e5e3dc] dark:border-[#282b33] space-y-1.5 bg-[#f8f7f4]/40 dark:bg-[#111215]/30">
            <div className="relative flex items-center gap-1">
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[#59606d] dark:text-[#9ba2b0] pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search text in workspace..."
                value={textQuery}
                onChange={e => setTextQuery(e.target.value)}
                className="flex-1 pl-7 pr-6 py-1 text-xs rounded border border-[#e5e3dc] dark:border-[#282b33] bg-[#ffffff] dark:bg-[#17191e] focus:border-[#2d6a4f] dark:focus:border-[#52b788] focus:outline-none"
              />
              {textQuery && (
                <button
                  type="button"
                  onClick={clearTextSearch}
                  className="absolute right-9 top-1/2 -translate-y-1/2 p-0.5 text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2]"
                  title="Clear text query"
                  aria-label="Clear query"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setMatchCase(prev => !prev)}
                className={`p-1 rounded border text-[11px] font-mono transition-colors ${
                  matchCase
                    ? 'border-[#2d6a4f] text-[#2d6a4f] bg-[#2d6a4f]/10 dark:border-[#52b788] dark:text-[#52b788] dark:bg-[#52b788]/20 font-bold'
                    : 'border-[#e5e3dc] dark:border-[#282b33] text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2] bg-[#ffffff] dark:bg-[#17191e]'
                } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
                title="Match Case"
                aria-label="Toggle match case"
                aria-pressed={matchCase}
              >
                <CaseSensitive className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[10px] text-[#59606d] dark:text-[#9ba2b0] px-1 truncate">
              {isTextSearching ? (
                'Searching workspace...'
              ) : textQuery.trim() ? (
                totalMatches > 0 ? (
                  `${totalMatches} match${totalMatches === 1 ? '' : 'es'} in ${totalFiles} file${totalFiles === 1 ? '' : 's'}`
                ) : (
                  'No matches found'
                )
              ) : (
                'Type words to search whole workspace'
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {textQuery.trim() && textResults.length > 0 ? (
              <WorkspaceSearchResults
                results={textResults}
                onSelectMatch={(result, match) => onSelectFile(result.node, match, textQuery)}
              />
            ) : textQuery.trim() && !isTextSearching ? (
              <div className="py-8 text-center text-xs text-[#59606d] dark:text-[#9ba2b0] px-3 space-y-1">
                <p className="font-medium text-[#191b1f] dark:text-[#eceef2]">No results found</p>
                <p>Try searching for different keywords or checking case sensitivity.</p>
              </div>
            ) : !textQuery.trim() ? (
              <div className="py-8 text-center text-xs text-[#59606d] dark:text-[#9ba2b0] px-3 space-y-1">
                <p className="font-medium text-[#191b1f] dark:text-[#eceef2]">Workspace Search</p>
                <p>Find text, links, or code across all files in your folder.</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </aside>
  );
};
