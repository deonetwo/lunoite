import React, { useState } from 'react';
import {
  FilePlus,
  FolderOpen,
  Save,
  Download,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  BookOpen,
  Keyboard,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { SaveStatus } from '../types/editor';
import { Theme } from '../hooks/useTheme';

interface HeaderProps {
  fileName: string;
  onRename: (newName: string) => void;
  saveStatus: SaveStatus;
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onExportFile: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  isShelfOpen: boolean;
  onToggleShelf: () => void;
  onOpenShortcuts: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  hasFileHandle: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  fileName,
  onRename,
  saveStatus,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onExportFile,
  isZenMode,
  onToggleZenMode,
  isShelfOpen,
  onToggleShelf,
  onOpenShortcuts,
  theme,
  onToggleTheme,
  hasFileHandle,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(fileName);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      const sanitized = tempName.trim().endsWith('.md')
        ? tempName.trim()
        : `${tempName.trim()}.md`;
      onRename(sanitized);
    }
    setIsEditingName(false);
  };

  const renderStatusBadge = () => {
    switch (saveStatus) {
      case 'saved':
        return (
          <span
            className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium"
            title={hasFileHandle ? 'Synchronized to local file on disk' : 'Saved in local storage'}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span className="hidden sm:inline">{hasFileHandle ? 'Saved to disk' : 'Saved locally'}</span>
          </span>
        );
      case 'saving':
        return (
          <span className="flex items-center gap-1 text-[11px] text-[#59606d] dark:text-[#9ba2b0] font-medium">
            <Clock className="w-3 h-3 animate-spin" />
            <span className="hidden sm:inline">Saving...</span>
          </span>
        );
      case 'unsaved':
        return (
          <span
            className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium"
            title="Press Ctrl+S to save changes"
          >
            <AlertCircle className="w-3 h-3" />
            <span className="hidden sm:inline">Unsaved changes</span>
          </span>
        );
      case 'local_only':
        return (
          <span
            className="flex items-center gap-1 text-[11px] text-blue-700 dark:text-blue-400 font-medium"
            title="Document stored in browser local storage. Click Save to create a disk file."
          >
            <FileText className="w-3 h-3" />
            <span className="hidden sm:inline">Local draft</span>
          </span>
        );
    }
  };

  return (
    <header
      className={`border-b border-[#e5e3dc] dark:border-[#282b33] bg-[#ffffff] dark:bg-[#17191e] px-3 sm:px-4 py-2 transition-all ${
        isZenMode ? 'opacity-0 hover:opacity-100 focus-within:opacity-100 h-11' : 'h-13'
      } flex items-center justify-between text-[#191b1f] dark:text-[#eceef2] select-none`}
    >
      {/* Brand & Document Name */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span
          className="font-serif italic font-semibold text-base sm:text-lg tracking-tight text-[#2d6a4f] dark:text-[#52b788] select-none"
          title="lunoite: distraction-free markdown"
        >
          lunoite
        </span>

        <span className="text-[#e5e3dc] dark:text-[#282b33] hidden sm:inline">/</span>

        {/* Editable File Name */}
        {isEditingName ? (
          <form onSubmit={handleNameSubmit} className="flex items-center">
            <input
              type="text"
              autoFocus
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              onBlur={handleNameSubmit}
              className="px-2 py-0.5 text-xs font-mono rounded border border-[#2d6a4f] dark:border-[#52b788] bg-transparent text-[#191b1f] dark:text-[#eceef2] focus:outline-none"
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTempName(fileName);
              setIsEditingName(true);
            }}
            className="text-xs font-mono font-medium truncate max-w-[140px] sm:max-w-[200px] md:max-w-[280px] hover:underline text-left text-[#191b1f] dark:text-[#eceef2]"
            title="Click to rename file"
          >
            {fileName}
          </button>
        )}

        {/* Save Status */}
        <div className="ml-1 sm:ml-2">{renderStatusBadge()}</div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1">
        {/* File Actions */}
        <button
          type="button"
          onClick={onNewFile}
          className="p-1.5 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
          title="New document"
          aria-label="New document"
        >
          <FilePlus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenFile}
          className="p-1.5 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
          title="Open local .md file (Ctrl+O)"
          aria-label="Open local file"
        >
          <FolderOpen className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onSaveFile}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#2d6a4f] hover:bg-[#24553f] dark:bg-[#52b788] dark:hover:bg-[#429d73] text-white dark:text-[#111215] transition-colors focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
          title="Save file directly to disk (Ctrl+S)"
          aria-label="Save file"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Save</span>
        </button>

        <button
          type="button"
          onClick={onExportFile}
          className="p-1.5 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
          title="Export Markdown (.md)"
          aria-label="Export Markdown file"
        >
          <Download className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-[#e5e3dc] dark:bg-[#282b33] mx-1 hidden sm:block" aria-hidden="true" />

        {/* View Mode Controls */}
        <button
          type="button"
          onClick={onToggleZenMode}
          className={`p-1.5 rounded transition-colors ${
            isZenMode
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title={isZenMode ? 'Exit Zen Mode (Alt+Z)' : 'Enter Zen Focus Mode (Alt+Z)'}
          aria-label="Toggle Zen mode"
        >
          {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onToggleShelf}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
            isShelfOpen
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Toggle Reference Shelf (Alt+S)"
          aria-label="Toggle Reference Shelf"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Shelf</span>
        </button>

        <button
          type="button"
          onClick={onOpenShortcuts}
          className="p-1.5 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
          title="Keyboard shortcuts & guide"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-1.5 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
          title={theme === 'dark' ? 'Switch to daylight paper' : 'Switch to obsidian night'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
