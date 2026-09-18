import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { useTheme } from './hooks/useTheme';
import { useWorkspace } from './hooks/useWorkspace';
import { useTabs } from './hooks/useTabs';
import { useLocalStorage } from './hooks/useLocalStorage';

import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { TabBar } from './components/Editor/TabBar';
import { EditorCanvas } from './components/Editor/EditorCanvas';
import { WorkspaceExplorer } from './components/Sidebar/WorkspaceExplorer';
import { ReferenceShelf } from './components/Shelf/ReferenceShelf';
import { ShortcutsModal } from './components/ShortcutsModal';
import { WelcomeWorkspace } from './components/Workspace/WelcomeWorkspace';

import { computeStats, downloadMarkdownFile } from './lib/markdown';
import { INITIAL_CARDS } from './lib/defaultCards';
import { ReferenceCard } from './types/shelf';
import { DocumentStats, SaveStatus } from './types/editor';
import { FileTreeNode } from './types/workspace';

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  // Workspace state & operations
  const {
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
  } = useWorkspace();

  // Multi-tab document manager
  const {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    openTab,
    closeTab,
    updateTabContent,
    markTabClean,
  } = useTabs();

  // Reference shelf cards (stored in localStorage)
  const [cards, setCards] = useLocalStorage<ReferenceCard[]>(
    'lunoite_reference_cards',
    INITIAL_CARDS
  );

  // Editor and UI state
  const editorRef = useRef<Editor | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(true);
  const [isShelfOpen, setIsShelfOpen] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [clipText, setClipText] = useState<string | undefined>(undefined);
  const [isSavingToDisk, setIsSavingToDisk] = useState<boolean>(false);

  // Stats calculation
  const stats: DocumentStats = activeTab
    ? computeStats(activeTab.content)
    : { words: 0, characters: 0, readingTimeMinutes: 0, lines: 0 };

  // Compute SaveStatus
  const saveStatus: SaveStatus = isSavingToDisk
    ? 'saving'
    : activeTab
      ? activeTab.isDirty
        ? 'unsaved'
        : 'saved'
      : 'local_only';

  // Open file from explorer tree
  const handleSelectFile = useCallback(
    async (node: FileTreeNode) => {
      if (node.kind === 'file') {
        const content = await readFile(node.handle as FileSystemFileHandle);
        openTab(node, content);
      }
    },
    [readFile, openTab]
  );

  // Save current active tab directly to disk
  const handleSaveActiveTab = useCallback(async () => {
    if (!activeTab) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (activeTab.handle && typeof activeTab.handle.createWritable === 'function') {
      setIsSavingToDisk(true);
      const success = await writeFile(activeTab.handle, activeTab.content);
      setIsSavingToDisk(false);
      if (success) {
        markTabClean(activeTab.id);
      }
    } else {
      markTabClean(activeTab.id);
    }
  }, [activeTab, writeFile, markTabClean]);

  // Handle editor updates with debounced direct disk auto-sync
  const handleEditorChange = useCallback(
    (newMarkdown: string) => {
      if (!activeTab) return;

      updateTabContent(activeTab.id, newMarkdown);

      if (activeTab.handle && typeof activeTab.handle.createWritable === 'function') {
        // Debounce auto-save directly to disk (~800ms)
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = window.setTimeout(async () => {
          setIsSavingToDisk(true);
          const success = await writeFile(activeTab.handle, newMarkdown);
          setIsSavingToDisk(false);
          if (success) {
            markTabClean(activeTab.id);
          }
        }, 800);
      }
    },
    [activeTab, updateTabContent, writeFile, markTabClean]
  );

  // Create new file
  const handleCreateFile = useCallback(
    async (parentHandle: FileSystemDirectoryHandle, name: string) => {
      const newHandle = await createFile(parentHandle, name);
      if (newHandle) {
        const cleanName = name.includes('.') ? name : `${name}.md`;
        const initialText = '# Untitled\n\nStart writing...\n';
        const dummyNode: FileTreeNode = {
          id: cleanName,
          name: cleanName,
          path: cleanName,
          kind: 'file',
          handle: newHandle,
          parentHandle,
          extension: 'md',
        };
        openTab(dummyNode, initialText);
      }
    },
    [createFile, openTab]
  );

  // Create new folder
  const handleCreateFolder = useCallback(
    async (parentHandle: FileSystemDirectoryHandle, name: string) => {
      await createFolder(parentHandle, name);
    },
    [createFolder]
  );

  // Delete node
  const handleDeleteNode = useCallback(
    async (parentHandle: FileSystemDirectoryHandle, name: string) => {
      const targetTab = tabs.find(t => t.name === name);
      if (targetTab) {
        closeTab(targetTab.id);
      }
      await deleteEntry(parentHandle, name);
    },
    [tabs, closeTab, deleteEntry]
  );

  // Rename node
  const handleRenameNode = useCallback(
    async (
      parentHandle: FileSystemDirectoryHandle,
      oldName: string,
      newName: string,
      kind: 'file' | 'directory'
    ) => {
      await renameEntry(parentHandle, oldName, newName, kind);
    },
    [renameEntry]
  );

  // Export current file
  const handleExport = useCallback(() => {
    if (activeTab) {
      downloadMarkdownFile(activeTab.name, activeTab.content);
    }
  }, [activeTab]);

  // Reference Shelf operations
  const handleInsertCard = useCallback((content: string) => {
    if (editorRef.current) {
      editorRef.current.chain().focus().insertContent(`\n${content}\n`).run();
    }
  }, []);

  const handleClipSelection = useCallback((text: string) => {
    setClipText(text);
    setIsShelfOpen(true);
  }, []);

  const handleAddCard = useCallback(
    (cardData: Omit<ReferenceCard, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newCard: ReferenceCard = {
        ...cardData,
        id: `card-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setCards(prev => [newCard, ...prev]);
    },
    [setCards]
  );

  const handleUpdateCard = useCallback(
    (id: string, cardData: Omit<ReferenceCard, 'id' | 'createdAt' | 'updatedAt'>) => {
      setCards(prev =>
        prev.map(c =>
          c.id === id ? { ...c, ...cardData, updatedAt: Date.now() } : c
        )
      );
    },
    [setCards]
  );

  const handleDeleteCard = useCallback(
    (id: string) => {
      setCards(prev => prev.filter(c => c.id !== id));
    },
    [setCards]
  );

  // Scratchpad fallback (when user wants to write without opening a folder)
  const handleOpenScratchpad = useCallback(() => {
    const dummyNode: FileTreeNode = {
      id: 'scratchpad.md',
      name: 'scratchpad.md',
      path: 'scratchpad.md',
      kind: 'file',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handle: {} as any,
      extension: 'md',
    };
    openTab(
      dummyNode,
      '# Quick Scratchpad\n\nStart writing notes without opening a folder...\n'
    );
  }, [openTab]);

  // Global application shortcuts
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Ctrl+O: Open workspace folder
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        openWorkspace();
      }
      // Alt+E: Toggle explorer
      if (e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExplorerOpen(prev => !prev);
      }
      // Alt+S: Toggle Reference Shelf
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsShelfOpen(prev => !prev);
      }
      // Alt+Z: Toggle Zen mode
      if (e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setIsZenMode(prev => !prev);
      }
      // Esc: Exit Zen mode
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [openWorkspace, isZenMode]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f8f7f4] dark:bg-[#111215] text-[#191b1f] dark:text-[#eceef2] font-sans antialiased transition-colors duration-200">
      {/* Top Header Bar */}
      <Header
        workspaceName={workspace.name || undefined}
        fileName={activeTab ? activeTab.name : 'No file open'}
        onRename={newName => {
          if (activeTab && activeTab.parentDirHandle) {
            handleRenameNode(
              activeTab.parentDirHandle,
              activeTab.name,
              newName,
              'file'
            );
          }
        }}
        saveStatus={saveStatus}
        onOpenWorkspace={openWorkspace}
        onNewFile={() => {
          if (workspace.rootHandle) {
            handleCreateFile(workspace.rootHandle, 'untitled.md');
          } else {
            handleOpenScratchpad();
          }
        }}
        onSaveFile={handleSaveActiveTab}
        onExportFile={handleExport}
        isExplorerOpen={isExplorerOpen}
        onToggleExplorer={() => setIsExplorerOpen(prev => !prev)}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode(prev => !prev)}
        isShelfOpen={isShelfOpen}
        onToggleShelf={() => setIsShelfOpen(prev => !prev)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        hasFileHandle={activeTab !== null && activeTab.handle !== undefined}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left: Workspace Explorer Sidebar (hidden in Zen mode) */}
        {!isZenMode && (
          <WorkspaceExplorer
            isOpen={isExplorerOpen}
            onClose={() => setIsExplorerOpen(false)}
            workspace={workspace}
            activeFileId={activeTabId}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onCreateFolder={handleCreateFolder}
            onDeleteNode={handleDeleteNode}
            onRenameNode={handleRenameNode}
            onRefresh={refreshTree}
            onCloseWorkspace={closeWorkspace}
          />
        )}

        {/* Center: Tabs + WYSIWYG Editor Canvas */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#f8f7f4] dark:bg-[#111215]">
          {/* Multi-document TabBar (hidden in Zen mode) */}
          {!isZenMode && (
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={setActiveTabId}
              onCloseTab={closeTab}
            />
          )}

          {activeTab ? (
            <EditorCanvas
              initialContent={activeTab.content}
              onChange={handleEditorChange}
              onSave={handleSaveActiveTab}
              onClipSelection={handleClipSelection}
              isZenMode={isZenMode}
              onEditorReady={ed => {
                editorRef.current = ed as Editor;
              }}
            />
          ) : workspace.rootHandle ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-[#59606d] dark:text-[#9ba2b0]">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#191b1f] dark:text-[#eceef2]">
                  No document currently open
                </p>
                <p>Select a file from the explorer on the left, or click &quot;+ File&quot; to begin writing.</p>
              </div>
            </div>
          ) : (
            <WelcomeWorkspace
              onOpenWorkspace={openWorkspace}
              onOpenScratchpad={handleOpenScratchpad}
              isNativeSupported={isNativeSupported}
            />
          )}
        </main>

        {/* Right: Collapsible Lateral Reference Shelf */}
        <ReferenceShelf
          isOpen={isShelfOpen}
          onClose={() => setIsShelfOpen(false)}
          cards={cards}
          onInsertCard={handleInsertCard}
          onAddCard={handleAddCard}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          clipText={clipText}
          onClearClipText={() => setClipText(undefined)}
        />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        stats={stats}
        fileName={activeTab ? activeTab.name : 'No file'}
        filePath={activeTab ? activeTab.path : undefined}
        workspaceName={workspace.name || undefined}
        hasFileHandle={activeTab !== null && activeTab.handle !== undefined}
        isZenMode={isZenMode}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default App;
