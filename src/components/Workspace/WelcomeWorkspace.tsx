import React from 'react';
import { FolderOpen, FolderPlus, FileText, Keyboard, Clock, Trash2 } from 'lucide-react';
import { RecentWorkspace } from '../../types/workspace';
import { formatRelativeTime } from '../../lib/formatDate';

interface WelcomeWorkspaceProps {
  onOpenWorkspace: () => void;
  onCreateWorkspace: () => void;
  onOpenScratchpad: () => void;
  isNativeSupported: boolean;
  recentWorkspaces?: RecentWorkspace[];
  onSelectRecent?: (recent: RecentWorkspace) => void;
  onRemoveRecent?: (id: string) => void;
}

export const WelcomeWorkspace: React.FC<WelcomeWorkspaceProps> = ({
  onOpenWorkspace,
  onCreateWorkspace,
  onOpenScratchpad,
  isNativeSupported,
  recentWorkspaces = [],
  onSelectRecent,
  onRemoveRecent,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#f8f7f4] dark:bg-[#111215] text-[#191b1f] dark:text-[#eceef2] select-none transition-colors overflow-y-auto">
      <div className="max-w-md w-full text-center space-y-6 my-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2d6a4f]/10 dark:bg-[#52b788]/15 text-[#2d6a4f] dark:text-[#52b788] mb-1 shadow-xs">
          <FolderOpen className="w-7 h-7" />
        </div>

        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#191b1f] dark:text-[#eceef2] mb-2">
            Open or Create a Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#59606d] dark:text-[#9ba2b0] leading-relaxed">
            Select a folder or create a new workspace to browse nested files, write Markdown with live WYSIWYG formatting, and auto-sync edits directly to your local drive.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          {isNativeSupported ? (
            <>
              <button
                type="button"
                onClick={onOpenWorkspace}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg bg-[#2d6a4f] hover:bg-[#24553f] dark:bg-[#52b788] dark:hover:bg-[#429d73] text-white dark:text-[#111215] shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Open Folder</span>
              </button>

              <button
                type="button"
                onClick={onCreateWorkspace}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg border border-[#2d6a4f]/30 dark:border-[#52b788]/30 hover:bg-[#2d6a4f]/10 dark:hover:bg-[#52b788]/15 text-[#2d6a4f] dark:text-[#52b788] transition-colors focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
              >
                <FolderPlus className="w-4 h-4" />
                <span>New Workspace</span>
              </button>
            </>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Your browser does not support the File System Access API. Please use a Chromium-based browser (Chrome, Edge) for directory workspaces.
            </p>
          )}

          <button
            type="button"
            onClick={onOpenScratchpad}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-lg border border-[#e5e3dc] dark:border-[#282b33] hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
          >
            <FileText className="w-4 h-4 text-[#59606d] dark:text-[#9ba2b0]" />
            <span>Scratchpad</span>
          </button>
        </div>

        {/* Recent Workspaces section */}
        {recentWorkspaces.length > 0 && onSelectRecent && (
          <div className="pt-4 text-left">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#59606d] dark:text-[#9ba2b0]">
                <Clock className="w-3.5 h-3.5" />
                <span>Recent Workspaces</span>
              </span>
              <span className="text-[11px] text-[#59606d] dark:text-[#9ba2b0]">
                {recentWorkspaces.length} {recentWorkspaces.length === 1 ? 'folder' : 'folders'}
              </span>
            </div>

            <div className="border border-[#e5e3dc] dark:border-[#282b33] rounded-xl bg-[#ffffff] dark:bg-[#17191e] divide-y divide-[#e5e3dc]/60 dark:divide-[#282b33]/60 overflow-hidden shadow-xs">
              {recentWorkspaces.slice(0, 5).map(recent => (
                <div
                  key={recent.id}
                  onClick={() => onSelectRecent(recent)}
                  className="group flex items-center justify-between px-3.5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectRecent(recent);
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FolderOpen className="w-4 h-4 text-[#2d6a4f] dark:text-[#52b788] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#191b1f] dark:text-[#eceef2] truncate">
                        {recent.name}
                      </div>
                      <div className="text-[10px] text-[#59606d] dark:text-[#9ba2b0]">
                        Opened {formatRelativeTime(recent.lastOpened)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    {onRemoveRecent && (
                      <button
                        type="button"
                        onClick={() => onRemoveRecent(recent.id)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-500/10 text-[#59606d] dark:text-[#9ba2b0] transition-opacity focus:opacity-100 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
                        title="Remove from history"
                        aria-label={`Remove ${recent.name} from history`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#e5e3dc] dark:border-[#282b33] flex items-center justify-center gap-4 text-xs text-[#59606d] dark:text-[#9ba2b0]">
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
