import React, { useState } from 'react';
import { FileTreeNode as TreeNodeType } from '../../types/workspace';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Trash2,
  Edit2,
  FilePlus,
} from 'lucide-react';

interface FileTreeNodeProps {
  node: TreeNodeType;
  level?: number;
  activeFileId: string | null;
  onSelectFile: (node: TreeNodeType) => void;
  onCreateFileInDir: (dirHandle: FileSystemDirectoryHandle) => void;
  onDeleteNode: (parentHandle: FileSystemDirectoryHandle, name: string) => void;
  onRenameNode: (
    parentHandle: FileSystemDirectoryHandle,
    oldName: string,
    newName: string,
    kind: 'file' | 'directory'
  ) => void;
}

export const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  level = 0,
  activeFileId,
  onSelectFile,
  onCreateFileInDir,
  onDeleteNode,
  onRenameNode,
}) => {
  const [isExpanded, setIsExpanded] = useState(level === 0 || level === 1);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);

  const isDirectory = node.kind === 'directory';
  const isActive = activeFileId === node.id;

  const handleRowClick = () => {
    if (isDirectory) {
      setIsExpanded(prev => !prev);
    } else {
      onSelectFile(node);
    }
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (node.parentHandle && editName.trim() && editName !== node.name) {
      onRenameNode(node.parentHandle, node.name, editName.trim(), node.kind);
    }
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!node.parentHandle) return;
    const confirm = window.confirm(`Delete "${node.name}" from your local disk?`);
    if (confirm) {
      onDeleteNode(node.parentHandle, node.name);
    }
  };

  const handleNewFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDirectory) {
      onCreateFileInDir(node.handle as FileSystemDirectoryHandle);
      setIsExpanded(true);
    }
  };

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(node.name);
    setIsEditing(true);
  };

  const isMarkdown =
    node.extension === 'md' ||
    node.extension === 'markdown' ||
    node.extension === 'txt';

  return (
    <div>
      <div
        onClick={handleRowClick}
        style={{ paddingLeft: `${Math.max(8, level * 14 + 8)}px` }}
        className={`group relative flex items-center justify-between py-1.5 pr-2 rounded text-xs cursor-pointer select-none transition-colors ${
          isActive
            ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788] font-medium'
            : 'text-[#191b1f] dark:text-[#eceef2] hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        role="treeitem"
        aria-selected={isActive}
        aria-expanded={isDirectory ? isExpanded : undefined}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {isDirectory ? (
            <span className="p-0.5 text-[#59606d] dark:text-[#9ba2b0]">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          ) : (
            <span className="w-3" />
          )}

          {isDirectory ? (
            isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            )
          ) : (
            <FileText
              className={`w-3.5 h-3.5 shrink-0 ${
                isMarkdown
                  ? 'text-[#2d6a4f] dark:text-[#52b788]'
                  : 'text-[#59606d] dark:text-[#9ba2b0]'
              }`}
            />
          )}

          {isEditing ? (
            <form onSubmit={handleRenameSubmit} onClick={e => e.stopPropagation()} className="flex-1 mr-1">
              <input
                type="text"
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={handleRenameSubmit}
                className="w-full px-1.5 py-0.5 text-xs rounded border border-[#2d6a4f] dark:border-[#52b788] bg-transparent text-[#191b1f] dark:text-[#eceef2] focus:outline-none"
              />
            </form>
          ) : (
            <span className="truncate text-xs">{node.name}</span>
          )}
        </div>

        {/* Action icons on hover */}
        {!isEditing && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
            {isDirectory && (
              <button
                type="button"
                onClick={handleNewFile}
                className="p-1 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2] hover:bg-black/5 dark:hover:bg-white/5"
                title="New file in this folder"
                aria-label="New file in this folder"
              >
                <FilePlus className="w-3 h-3" />
              </button>
            )}
            {!isDirectory && (
              <button
                type="button"
                onClick={handleStartRename}
                className="p-1 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2] hover:bg-black/5 dark:hover:bg-white/5"
                title="Rename file"
                aria-label="Rename file"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="p-1 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-red-600 hover:bg-red-500/10"
              title="Delete"
              aria-label="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Recursive children for directory */}
      {isDirectory && isExpanded && node.children && (
        <div role="group">
          {node.children.length > 0 ? (
            node.children.map(child => (
              <FileTreeNode
                key={child.id}
                node={child}
                level={level + 1}
                activeFileId={activeFileId}
                onSelectFile={onSelectFile}
                onCreateFileInDir={onCreateFileInDir}
                onDeleteNode={onDeleteNode}
                onRenameNode={onRenameNode}
              />
            ))
          ) : (
            <div
              style={{ paddingLeft: `${(level + 1) * 14 + 18}px` }}
              className="py-1 text-[11px] text-[#59606d] dark:text-[#9ba2b0] italic"
            >
              Empty folder
            </div>
          )}
        </div>
      )}
    </div>
  );
};
