import React from 'react';
import { FolderOpen, FileText, Keyboard } from 'lucide-react';

interface WelcomeWorkspaceProps {
  onOpenWorkspace: () => void;
  onOpenScratchpad: () => void;
  isNativeSupported: boolean;
}

export const WelcomeWorkspace: React.FC<WelcomeWorkspaceProps> = ({
  onOpenWorkspace,
  onOpenScratchpad,
  isNativeSupported,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#f8f7f4] dark:bg-[#111215] text-[#191b1f] dark:text-[#eceef2] select-none transition-colors">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2d6a4f]/10 dark:bg-[#52b788]/15 text-[#2d6a4f] dark:text-[#52b788] mb-2 shadow-xs">
          <FolderOpen className="w-7 h-7" />
        </div>

        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#191b1f] dark:text-[#eceef2] mb-2">
            Open a Workspace Folder
          </h1>
          <p className="text-xs sm:text-sm text-[#59606d] dark:text-[#9ba2b0] leading-relaxed">
            Select any folder on your computer to browse nested files, write Markdown with live WYSIWYG formatting, and auto-sync edits directly to your local drive.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isNativeSupported ? (
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium rounded-lg bg-[#2d6a4f] hover:bg-[#24553f] dark:bg-[#52b788] dark:hover:bg-[#429d73] text-white dark:text-[#111215] shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Select Workspace Folder</span>
            </button>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Your browser does not support the File System Access API. Please use a Chromium-based browser (Chrome, Edge) for directory workspaces.
            </p>
          )}

          <button
            type="button"
            onClick={onOpenScratchpad}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg border border-[#e5e3dc] dark:border-[#282b33] hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
          >
            <FileText className="w-4 h-4 text-[#59606d] dark:text-[#9ba2b0]" />
            <span>Open Quick Scratchpad</span>
          </button>
        </div>

        <div className="pt-6 border-t border-[#e5e3dc] dark:border-[#282b33] flex items-center justify-center gap-4 text-xs text-[#59606d] dark:text-[#9ba2b0]">
          <span className="flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5" />
            <span><kbd className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">Ctrl+O</kbd> Open</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span><kbd className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">Ctrl+S</kbd> Save to disk</span>
          </span>
        </div>
      </div>
    </div>
  );
};
