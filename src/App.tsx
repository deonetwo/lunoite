import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { useTheme } from './hooks/useTheme';
import { useFileSystem } from './hooks/useFileSystem';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { EditorCanvas } from './components/Editor/EditorCanvas';
import { ReferenceShelf } from './components/Shelf/ReferenceShelf';
import { ShortcutsModal } from './components/ShortcutsModal';
import { STARTER_MARKDOWN, computeStats, downloadMarkdownFile } from './lib/markdown';
import { INITIAL_CARDS } from './lib/defaultCards';
import { ReferenceCard } from './types/shelf';
import { DocumentStats } from './types/editor';

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  // Local storage backups
  const [cachedMarkdown, setCachedMarkdown] = useLocalStorage<string>(
    'lunoite_doc_content',
    STARTER_MARKDOWN
  );
  const [cachedFileName, setCachedFileName] = useLocalStorage<string>(
    'lunoite_doc_filename',
    'welcome.md'
  );
  const [cards, setCards] = useLocalStorage<ReferenceCard[]>(
    'lunoite_reference_cards',
    INITIAL_CARDS
  );

  // File system hook
  const {
    fileHandle,
    fileName,
    setFileName,
    saveStatus,
    markUnsaved,
    openLocalFile,
    saveToCurrentFile,
    createNewFile,
  } = useFileSystem(cachedFileName);

  // Editor instance reference
  const editorRef = useRef<Editor | null>(null);
  const [currentMarkdown, setCurrentMarkdown] = useState<string>(cachedMarkdown);
  const [stats, setStats] = useState<DocumentStats>(() => computeStats(cachedMarkdown));

  // UI state
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isShelfOpen, setIsShelfOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [clipText, setClipText] = useState<string | undefined>(undefined);

  // Sync filename changes with cache
  const handleRename = useCallback(
    (newName: string) => {
      setFileName(newName);
      setCachedFileName(newName);
      markUnsaved();
    },
    [setFileName, setCachedFileName, markUnsaved]
  );

  // Handle editor updates
  const handleEditorChange = useCallback(
    (markdown: string) => {
      setCurrentMarkdown(markdown);
      setCachedMarkdown(markdown);
      setStats(computeStats(markdown));
      markUnsaved();
    },
    [setCachedMarkdown, markUnsaved]
  );

  // Save document (Ctrl+S or button)
  const handleSave = useCallback(async () => {
    const success = await saveToCurrentFile(currentMarkdown);
    if (success) {
      setCachedFileName(fileName);
    }
  }, [saveToCurrentFile, currentMarkdown, fileName, setCachedFileName]);

  // Open existing local file
  const handleOpen = useCallback(async () => {
    const result = await openLocalFile();
    if (result && editorRef.current) {
      editorRef.current.commands.setContent(result.text);
      setCurrentMarkdown(result.text);
      setCachedMarkdown(result.text);
      setCachedFileName(result.name);
      setStats(computeStats(result.text));
    }
  }, [openLocalFile, setCachedMarkdown, setCachedFileName]);

  // Create brand new file
  const handleNew = useCallback(() => {
    if (saveStatus === 'unsaved') {
      const confirmDiscard = window.confirm(
        'You have unsaved changes in your document. Create a new document anyway?'
      );
      if (!confirmDiscard) return;
    }
    const emptyDoc = '# Untitled Document\n\nStart writing here...\n';
    if (editorRef.current) {
      editorRef.current.commands.setContent(emptyDoc);
    }
    setCurrentMarkdown(emptyDoc);
    setCachedMarkdown(emptyDoc);
    createNewFile('untitled.md');
    setCachedFileName('untitled.md');
    setStats(computeStats(emptyDoc));
  }, [saveStatus, createNewFile, setCachedMarkdown, setCachedFileName]);

  // Export as .md
  const handleExport = useCallback(() => {
    downloadMarkdownFile(fileName, currentMarkdown);
  }, [fileName, currentMarkdown]);

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

  // Global application shortcuts
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Ctrl+O: Open file
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpen();
      }
      // Alt+Z: Toggle Zen mode
      if (e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setIsZenMode(prev => !prev);
      }
      // Alt+S: Toggle Reference Shelf
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsShelfOpen(prev => !prev);
      }
      // Esc: Exit Zen mode if active
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [handleOpen, isZenMode]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f8f7f4] dark:bg-[#111215] text-[#191b1f] dark:text-[#eceef2] font-sans antialiased transition-colors duration-200">
      {/* Top Navigation Bar */}
      <Header
        fileName={fileName}
        onRename={handleRename}
        saveStatus={saveStatus}
        onNewFile={handleNew}
        onOpenFile={handleOpen}
        onSaveFile={handleSave}
        onExportFile={handleExport}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode(prev => !prev)}
        isShelfOpen={isShelfOpen}
        onToggleShelf={() => setIsShelfOpen(prev => !prev)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        hasFileHandle={fileHandle !== null}
      />

      {/* Main Workspace: Editor Canvas + Lateral Reference Shelf */}
      <main className="flex-1 flex min-h-0 relative">
        <EditorCanvas
          initialContent={currentMarkdown}
          onChange={handleEditorChange}
          onSave={handleSave}
          onClipSelection={handleClipSelection}
          isZenMode={isZenMode}
          onEditorReady={ed => {
            editorRef.current = ed as Editor;
          }}
        />

        {/* Collapsible Lateral Reference Shelf */}
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
      </main>

      {/* Bottom Status Bar */}
      <StatusBar
        stats={stats}
        fileName={fileName}
        hasFileHandle={fileHandle !== null}
        isZenMode={isZenMode}
      />

      {/* Keyboard Shortcuts Reference Dialog */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default App;
